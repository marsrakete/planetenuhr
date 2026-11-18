const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const root=path.resolve(__dirname,'..');
const realm=vm.createContext({window:{}});
for(const file of ['js/data/phenomena-config.js','js/data/constellation-illustrations-config.js','js/shared/constellation-illustrations.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),realm);
}
const config=realm.window.PLANETENUHR_CONSTELLATION_ILLUSTRATIONS;
const adapter=realm.window.PLANETENUHR_CONSTELLATION_ART.create({config,document:{getElementById(){return {content:{querySelector(){return {cloneNode(){return {attributes:{},setAttribute(key,value){this.attributes[key]=value;}};}};}}};}}});

test('47 artwork assets are RGBA PNGs and both Serpens parts retain their original figures',()=>{
  assert.equal(Object.keys(config.entries).length,47);
  for(const entry of Object.values(config.entries)){
    const bytes=fs.readFileSync(path.join(root,entry.src));
    assert.equal(bytes.subarray(1,4).toString(),'PNG');
    assert.equal(bytes[25],6);
    assert.ok(entry.scale>0&&entry.scale<=1);
    assert.ok(entry.offset.every(Number.isFinite));
  }
  for(const key of ['serpens_caput','serpens_cauda']){
    const item=realm.window.PLANETENUHR_PHENOMENA.constellations.find(item=>item.key===key);
    assert.equal(adapter.prepare(item),item);
    assert.equal(adapter.append({},item,460),null);
  }
});

test('shared layout preserves source coordinates and handles normal, boundary and unknown inputs',()=>{
  const item=realm.window.PLANETENUHR_PHENOMENA.constellations.find(item=>item.name==='Orion');
  const before=JSON.stringify(item);
  const prepared=adapter.prepare(item),art=config.entries.orion;
  assert.notEqual(prepared,item);
  assert.equal(JSON.stringify(item),before);
  prepared.stars.forEach((star,index)=>star.forEach((value,axis)=>{
    assert.equal(value,item.stars[index][axis]*art.scale+art.offset[axis]);
    assert.ok(value>=0&&value<=100);
  }));
  const parent={appendChild(image){this.image=image;}};
  const image=adapter.append(parent,prepared,34,-17);
  assert.equal(image.attributes.href,art.src);
  assert.equal(image.attributes.width,'34');
  assert.equal(image.attributes.x,'-17');
  assert.equal(adapter.prepare(null),null);
  const unknown={key:'unknown',stars:[[0,0],[100,100]]};
  assert.equal(adapter.prepare(unknown),unknown);
});

test('projective image mapping agrees with all 141 audited star anchors',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/constellations/projection-manifest.json'),'utf8'));
  const audit=JSON.parse(fs.readFileSync(path.join(root,'docs/stellarium-illustrationen-pruefung.json'),'utf8'));
  assert.equal(manifest.evidence.length,47);
  for(const entry of manifest.evidence){
    const row=audit.rows.find(row=>row.key===entry.key);
    for(const anchor of row.image.anchors){
      const vector=[...anchor.pixel,1];
      const result=entry.homography.map(r=>r.reduce((sum,value,index)=>sum+value*vector[index],0));
      assert.ok(Math.hypot(result[0]/result[2]-anchor.chart[0],result[1]/result[2]-anchor.chart[1])<1e-8,entry.key);
    }
  }
});
