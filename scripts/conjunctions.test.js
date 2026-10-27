const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {test}=require('node:test');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},Date,Math});
vm.runInContext(fs.readFileSync(path.join(root,'conjunction-model.js'),'utf8'),context);
const model=context.window.PLANETENUHR_CONJUNCTIONS;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const name of ['normalizeDeg','julianDate','solveKepler','planetPosition','planetByKey','heliocentricPosition','geocentricVector','computeConjunctionEvents']){
  const start=html.indexOf('    function '+name+'('),end=html.indexOf('\n    }',start)+6;
  assert.ok(start>=0);vm.runInContext(html.slice(start,end),context);
}
const start=html.indexOf('    const solarPlanets = [');
vm.runInContext(html.slice(start,html.indexOf('\n    ];',start)+7),context);

test('full angular separation includes latitude and remains valid at zero and 180 degrees',()=>{
  assert.equal(model.angularSeparation({x:1,y:0,z:0},{x:2,y:0,z:0}),0);
  assert.equal(model.angularSeparation({x:1,y:0,z:0},{x:-1,y:0,z:0}),180);
  assert.ok(Math.abs(model.angularSeparation({x:1,y:0,z:0},{x:1,y:0,z:1})-45)<1e-10);
  assert.ok(Number.isNaN(model.angularSeparation({x:0,y:0,z:0},{x:1,y:0,z:0})));
  assert.ok(Number.isNaN(model.angularSeparation(null,{x:1,y:0,z:0})));
});
test('Mars and Jupiter approach from about eight degrees to 1.2 degrees in November 2026',()=>{
  const date=new Date('2026-10-26T12:00:00Z');
  const current=model.angularSeparation(context.geocentricVector('mars',date),context.geocentricVector('jupiter',date));
  assert.ok(current>7.7&&current<8.1);
  const events=context.computeConjunctionEvents(date,60);
  const pair=events.filter(event=>event.a==='mars'&&event.b==='jupiter');
  assert.equal(pair.length,1);
  const event=pair[0];
  assert.ok(event.date>=new Date('2026-11-15T00:00:00Z')&&event.date<new Date('2026-11-17T00:00:00Z'));
  assert.ok(event.separation>1.1&&event.separation<1.3);
  assert.ok(event.separation>1,'Longitude crossing must not be reported as zero sky separation');
  for(const offset of [-3600000,3600000]){
    const d=new Date(event.date.getTime()+offset);
    assert.ok(model.angularSeparation(context.geocentricVector('mars',d),context.geocentricVector('jupiter',d))>=event.separation-1e-8);
  }
  assert.ok(events.every((event,index)=>index===0||event.date>=events[index-1].date));
});
test('equal longitude with a large latitude gap is excluded from close approaches',()=>{
  const date=new Date('2026-01-01T00:00:00Z');
  const events=model.events(date,4,['a','b'],(key,d)=>{
    if(key==='a')return {x:1,y:0,z:0};
    return {x:1,y:(d-date)/86400000*.01,z:.5};
  },4.5);
  assert.equal(events.length,0);
});
test('refined minima at window edges are included only when inside the actual dated window',()=>{
  const date=new Date('2026-01-01T00:00:00Z');
  for(const minimum of [-1.95,1.95,2.05]){
    const events=model.events(date,2,['a','b'],(key,d)=>{
      if(key==='a')return {x:1,y:0,z:0};
      return {x:1,y:((d-date)/86400000-minimum)*.03,z:.01};
    },4.5);
    if(minimum>2)assert.equal(events.length,0);
    else {assert.equal(events.length,1);assert.ok(Math.abs(events[0].offsetDays-minimum)<.001);}
  }
});
test('daily vectors are shared between pairs, keeping orbital work bounded',()=>{
  let calls=0;
  const bodies=['a','b','c','d','e'];
  model.events(new Date('2026-01-01'),10,bodies,key=>{calls++;return {x:1,y:bodies.indexOf(key),z:0};},4.5);
  assert.ok(calls<=120,'Each daily body sample should be calculated once');
});

test('angle labels keep localized degrees and arm-length estimates, including tiny separations',()=>{
  const copy=vm.createContext({window:{},Math});
  vm.runInContext(fs.readFileSync(path.join(root,'translations.js'),'utf8'),copy);
  for(const name of ['altitudeThumbEstimate','conjunctionSeparationLabel']){
    const start=html.indexOf('    function '+name+'('),end=html.indexOf('\n    }',start)+6;
    vm.runInContext(html.slice(start,end),copy);
  }
  for(const language of ['en','de','fr']){
    vm.runInContext('var lang="'+language+'"; var t=window.PLANETENUHR_TRANSLATIONS[lang];',copy);
    const format=copy.conjunctionSeparationLabel;
    const expected=new Intl.NumberFormat(language,{minimumFractionDigits:1,maximumFractionDigits:1}).format(4.3);
    assert.ok(format(4.3).startsWith(expected+'° · '));
    assert.ok(format(4.3).includes(copy.altitudeThumbEstimate(4.3)));
    assert.ok(format(.3).endsWith(copy.window.PLANETENUHR_TRANSLATIONS[language].angle_estimate_under_finger));
    assert.ok(format(0).endsWith(copy.window.PLANETENUHR_TRANSLATIONS[language].angle_estimate_under_finger));
    assert.equal(format(-1),'');
    assert.equal(format(NaN),'');
  }
});
