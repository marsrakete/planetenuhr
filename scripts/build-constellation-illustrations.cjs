'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const sharp = require(process.env.PLANETENUHR_SHARP || 'sharp');
const root = path.resolve(__dirname, '..');

/** Inverts a nonsingular 3x3 projective matrix. @param {number[][]} m Matrix. @returns {number[][]} Inverse. */
function inverse(m){
  const [[a,b,c],[d,e,f],[g,h,i]] = m;
  const det = a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);
  assert.ok(Math.abs(det)>1e-12, 'Invertible illustration projection');
  return [[e*i-f*h,c*h-b*i,b*f-c*e],[f*g-d*i,a*i-c*g,c*d-a*f],[d*h-e*g,b*g-a*h,a*e-b*d]].map(row=>row.map(value=>value/det));
}

/** Multiplies a 3x3 matrix by a vector. @param {number[][]} m Matrix. @param {number[]} v Vector. @returns {number[]} Product. */
function product(m,v){return m.map(row=>row.reduce((sum,value,index)=>sum+value*v[index],0));}

/** Builds the exact pixel-to-chart homography from the audited J2000 anchor directions.
 * @param {object} row Audited illustration and tangent-plane parameters.
 * @returns {number[][]} Projective matrix from original PNG pixels to original chart units.
 */
function homography(row){
  const anchors=row.image.anchors;
  const vectors=anchors.map(anchor=>{
    const ra=anchor.raHours*Math.PI/12, dec=anchor.decDeg*Math.PI/180;
    return [Math.cos(dec)*Math.cos(ra),Math.cos(dec)*Math.sin(ra),Math.sin(dec)];
  });
  const pixelInverse=inverse([0,1,2].map(axis=>anchors.map(anchor=>{
    if(axis===2) return 1;
    return anchor.pixel[axis];
  })));
  const basis=[0,1,2].map(axis=>[0,1,2].map(column=>vectors.reduce((sum,v,index)=>sum+v[axis]*pixelInverse[index][column],0)));
  const p=row.projection, ra=p.centerRaDeg*Math.PI/180, dec=p.centerDecDeg*Math.PI/180;
  const normal=[Math.cos(dec)*Math.cos(ra),Math.cos(dec)*Math.sin(ra),Math.sin(dec)];
  const eastLeft=[Math.sin(ra),-Math.cos(ra),0];
  const northUp=[Math.sin(dec)*Math.cos(ra),Math.sin(dec)*Math.sin(ra),-Math.cos(dec)];
  const projection=[eastLeft.map((v,index)=>v*p.scale+p.offset[0]*normal[index]),
    northUp.map((v,index)=>v*p.scale+p.offset[1]*normal[index]),normal];
  return projection.map(pr=>[0,1,2].map(column=>pr.reduce((sum,v,index)=>sum+v*basis[index][column],0)));
}

/** Converts a homogeneous point to ordinary coordinates. @param {number[][]} matrix Projection. @param {number[]} point x/y. @returns {number[]} Projected x/y. */
function project(matrix,point){const p=product(matrix,[...point,1]);return [p[0]/p[2],p[1]/p[2]];}

/** Generates transparent, projectively aligned local PNGs and the small runtime manifest.
 * @param {string} cache Directory of the original audited PNGs.
 * @returns {Promise<void>} Writes 47 derived images, originals and coordinate metadata.
 */
async function build(cache){
  const audit=JSON.parse(fs.readFileSync(path.join(root,'docs/stellarium-illustrationen-pruefung.json'),'utf8'));
  const output=path.join(root,'assets/constellations');
  fs.mkdirSync(path.join(output,'original'),{recursive:true});
  const entries={};
  const evidence=[];
  for(const row of audit.rows){
    if(!row.image) continue;
    const original=path.join(cache,path.basename(row.image.file));
    const bytes=fs.readFileSync(original);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.image.sha256,row.key+' source hash');
    fs.copyFileSync(original,path.join(output,'original',path.basename(original)));
    const {data,info}=await sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const matrix=homography(row), back=inverse(matrix);
    const anchorError=Math.max(...row.image.anchors.map(a=>{
      const point=project(matrix,a.pixel);
      return Math.hypot(point[0]-a.chart[0],point[1]-a.chart[1]);
    }));
    assert.ok(anchorError<1e-8,row.key+' exact anchor alignment');
    let minX=info.width,minY=info.height,maxX=0,maxY=0;
    for(let y=0;y<info.height;y+=1){
      for(let x=0;x<info.width;x+=1){
        const offset=(y*info.width+x)*info.channels;
        if(Math.max(data[offset],data[offset+1],data[offset+2])>8){
          minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x+1);maxY=Math.max(maxY,y+1);
        }
      }
    }
    const corners=[[minX,minY],[maxX,minY],[maxX,maxY],[minX,maxY]].map(point=>project(matrix,point));
    const low=[0,1].map(axis=>Math.min(0,...corners.map(p=>p[axis]))-3);
    const high=[0,1].map(axis=>Math.max(100,...corners.map(p=>p[axis]))+3);
    const span=Math.max(high[0]-low[0],high[1]-low[1]);
    const origin=low.map((value,axis)=>(value+high[axis]-span)/2);
    const size=640, pixels=Buffer.alloc(size*size*4);
    for(let y=0;y<size;y+=1){
      for(let x=0;x<size;x+=1){
        const point=project(back,[origin[0]+(x+.5)/size*span,origin[1]+(y+.5)/size*span]);
        const sx=point[0]-.5,sy=point[1]-.5, ix=Math.floor(sx),iy=Math.floor(sy);
        const rgb=[0,0,0];
        for(let dy=0;dy<2;dy+=1){
          for(let dx=0;dx<2;dx+=1){
            if(ix+dx<0||iy+dy<0||ix+dx>=info.width||iy+dy>=info.height) continue;
            let weightX=sx-ix,weightY=sy-iy;
            if(dx===0)weightX=1-weightX;
            if(dy===0)weightY=1-weightY;
            const offset=((iy+dy)*info.width+ix+dx)*info.channels;
            for(let channel=0;channel<3;channel+=1)rgb[channel]+=data[offset+channel]*weightX*weightY;
          }
        }
        const alpha=Math.max(...rgb),offset=(y*size+x)*4;
        if(alpha<=8)continue;
        // Unpremultiply the black-backed artwork: the original colour is retained through alpha.
        for(let channel=0;channel<3;channel+=1)pixels[offset+channel]=Math.round(rgb[channel]/alpha*255);
        pixels[offset+3]=Math.round(alpha);
      }
    }
    await sharp(pixels,{raw:{width:size,height:size,channels:4}}).png().toFile(path.join(output,row.key+'.png'));
    const entry={src:'assets/constellations/'+row.key+'.png',scale:100/span,offset:origin.map(value=>-value*100/span)};
    entries[row.key]=entry;
    evidence.push({key:row.key,homography:matrix,origin,span,anchorError,sourceSha256:row.image.sha256});
  }
  assert.equal(Object.keys(entries).length,47);
  const aliases={Orion:'orion',Gemini:'gemini',Leo:'leo',Bootes:'bootes',Virgo:'virgo',Hercules:'hercules',Scorpius:'scorpius',Cygnus:'cygnus',Pegasus:'pegasus',Andromeda:'andromeda',Taurus:'taurus',Auriga:'auriga'};
  fs.writeFileSync(path.join(root,'js/data/constellation-illustrations-config.js'),'// Generated by scripts/build-constellation-illustrations.cjs; source and licence: assets/constellations/README.md\nwindow.PLANETENUHR_CONSTELLATION_ILLUSTRATIONS = '+JSON.stringify({entries,aliases},null,2)+';\n');
  fs.writeFileSync(path.join(output,'projection-manifest.json'),JSON.stringify({revision:audit.stellariumRevision,licence:'Free Art License 1.3',evidence},null,2)+'\n');
  console.log('Generated '+evidence.length+' aligned transparent illustrations; all anchor errors < 1e-8 chart units.');
}
build(path.resolve(process.argv[2]||'.')).catch(error=>{console.error(error);process.exitCode=1;});
