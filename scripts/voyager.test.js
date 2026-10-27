const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {validateSamples}=require('./update-voyager-data');
const realm={window:{}};
for(const file of ['astronomy-explorer-config.js','voyager-data.js','astronomy-explorer-model.js','translations.js','card-help-config.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),realm);
const model=realm.window.PLANETENUHR_EXPLORER_MODEL;
const data=realm.window.PLANETENUHR_VOYAGER_DATA;

test('Voyager light time reproduces both NASA solar distances, not Earth light time or a fixed day',()=>{
  for(const sample of data.samples){const result=model.voyagerLightTravel(new Date(sample.timeUnix*1000));assert.ok(Math.abs(result.distanceKm-sample.distanceKm)<1);assert.ok(Math.abs(result.seconds-sample.distanceKm/299792.458)<0.00001);assert.ok(Math.abs(result.distanceAu-result.distanceKm/149597870.7)<1e-8);}
  const current=model.voyagerLightTravel(new Date('2026-10-26T00:00:00Z'));
  assert.ok(current.seconds>23.8*3600&&current.seconds<24*3600);
  assert.notEqual(current.seconds,86400);
});
test('Voyager interpolation and date-dependent projection stay monotonic and use UTC instants',()=>{
  const [first,last]=data.samples;
  const mid=model.voyagerLightTravel(new Date((first.timeUnix+last.timeUnix)*500));
  assert.ok(Math.abs(mid.distanceKm-(first.distanceKm+last.distanceKm)/2)<1);
  const now=model.voyagerLightTravel(new Date(last.timeUnix*1000));
  const next=model.voyagerLightTravel(new Date((last.timeUnix+86400)*1000));
  assert.ok(next.seconds>now.seconds+4&&next.seconds<now.seconds+6);
});
test('Voyager rejects invalid dates and dates beyond either supported boundary',()=>{
  const latest=data.samples[1].timeUnix;
  for(const direction of [-1,1]){
    assert.ok(model.voyagerLightTravel(new Date((latest+direction*data.maximumOffsetSeconds)*1000)));
    assert.equal(model.voyagerLightTravel(new Date((latest+direction*(data.maximumOffsetSeconds+1))*1000)),null);
  }
  assert.equal(model.voyagerLightTravel(new Date(NaN)),null);
  assert.equal(model.voyagerLightTravel(new Date('1977-09-05')),null);
  assert.equal(model.voyagerLightTravel(new Date('2050-01-01')),null);
});
test('NASA import rejects reversed timestamps, missing distances and implausible speeds',()=>{
  const valid=[{timeUnix:10000,sun:{dist:2.5e10}},{timeUnix:96400,sun:{dist:2.5e10+17*86400}}];
  assert.equal(validateSamples(valid).length,2);
  assert.throws(()=>validateSamples(valid.slice().reverse()));
  assert.throws(()=>validateSamples([valid[0],{timeUnix:96400}]));
  assert.throws(()=>validateSamples([valid[0],{timeUnix:96400,sun:{dist:2.6e10}}]));
});
test('all locales explain solar origin, approximation and Earth milestone with NASA source links',()=>{
  for(const lang of ['de','en','fr']){
    const copy=realm.window.PLANETENUHR_TRANSLATIONS[lang];
    for(const key of ['light_voyager1','light_voyager_estimate','light_voyager_unavailable'])assert.ok(copy[key]);
    assert.match(copy.light_voyager_estimate,/\{date\}/);
    const help=realm.window.PLANETENUHR_CARD_HELP[lang].cards.light_travel;
    assert.ok(help.details.some(line=>line.includes('2026')&&line.includes('Voyager 1')));
    assert.ok(help.details.some(line=>line.includes('r₀')));
    assert.ok(help.links.some(link=>link.url===data.sourceUrl));
    assert.ok(help.links.some(link=>link.url===data.milestoneUrl));
  }
});
