const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {test}=require('node:test');
const root=path.resolve(__dirname,'..'),realm={window:{}};
for(const file of ['daily-highlights-config.js','daily-highlights-model.js','translations.js','card-help-config.js','eclipse-phase-config.js','daily-highlight-graphics.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),realm);
const model=realm.window.PLANETENUHR_DAILY_MODEL,config=realm.window.PLANETENUHR_DAILY_CONFIG;
/** Supplies a quiet normalized day for selection tests.
 * @param {object} [extra={}] Snapshot overrides. @returns {object} Independent snapshot.
 */
function day(extra={}){return {dateKey:'2026-10-26',calendar:[],showers:[],moon:{frac:.25,illum:50},solar:{polarDay:false,polarNight:false},orbitalModelReliable:true,planets:[],conjunctions:[],...extra};}

test('calendar day differences remain whole across DST and year boundaries',()=>{
  assert.equal(model.dayDifference('2026-10-24','2026-10-26'),2);
  assert.equal(model.dayDifference('2026-03-28','2026-03-30'),2);
  assert.equal(model.dayDifference('2026-12-31','2027-01-01'),1);
});
test('rare same-day events lead, topic limits cap routine planets, stable selection never mutates data',()=>{
  const input=day({calendar:[{date:'2026-10-26',category:'eclipse',title:'Eclipse'}],moon:{frac:.5,illum:100},planets:[{key:'mars',samples:5,altitudeDeg:55},{key:'jupiter',samples:4,altitudeDeg:48},{key:'venus',samples:4,altitudeDeg:20}],conjunctions:[{a:'mars',b:'jupiter',dateKey:'2026-11-16',separation:1.2}]});
  const before=JSON.stringify(input),result=model.select(input,config);
  assert.equal(result[0].group,'eclipse');
  assert.ok(result.length<=5);
  assert.equal(result.filter(item=>item.kind==='planet').length,2);
  assert.deepEqual(Array.from(result,item=>item.id),Array.from(model.select(input,config),item=>item.id));
  assert.equal(JSON.stringify(input),before);
});
test('quiet days stay empty and weak, distant or insufficient observations are not used as filler',()=>{
  assert.equal(model.select(day(),config).length,0);
  const result=model.select(day({planets:[{key:'jupiter',samples:1,altitudeDeg:40}],calendar:[{date:'2026-10-25',category:'planet',title:'past'},{date:'2026-11-20',category:'planet',title:'too far'}],conjunctions:[{a:'mars',b:'jupiter',dateKey:'2026-12-01',separation:1}]}),config);
  assert.equal(result.length,0);
});
test('annual meteor windows wrap over New Year and curated peak dates take precedence',()=>{
  const stream={key:'quadrantids',start:'12-28',end:'01-12',peak:'01-03'};
  const state=model.meteorState(stream,'2026-12-30');assert.equal(state.active,true);assert.equal(state.peakDate,'2027-01-03');assert.equal(state.days,4);
  const result=model.select(day({dateKey:'2027-01-03',showers:[stream],calendar:[{date:'2027-01-04',category:'meteor',title:'dated maximum'}]}),config);
  assert.equal(result.length,1);assert.equal(result[0].kind,'meteor_peak');assert.equal(result[0].data.days,1);assert.equal(result[0].data.peakDated,true);assert.equal(result[0].data.peakDate,'2027-01-04');
  const peak=model.select(day({dateKey:'2027-01-04',showers:[stream],calendar:[{date:'2027-01-04',category:'meteor',title:'dated maximum'}]}),config);
  assert.equal(peak.length,1);assert.equal(peak[0].kind,'meteor_today');assert.equal(peak[0].score,config.scores.meteorPeak);
});
test('a bright Moon adds a warning flag without suppressing an active meteor stream',()=>{
  const stream={key:'orionids',start:'10-02',end:'11-07',peak:'10-21'};
  const dark=model.select(day({moon:{frac:.25,illum:20},showers:[stream]}),config);
  const bright=model.select(day({moon:{frac:.4,illum:90},showers:[stream]}),config);
  assert.ok(dark.some(item=>item.kind==='meteor_declining'));
  assert.ok(bright.some(item=>item.kind==='meteor_declining'));
  assert.equal(bright[0].data.brightMoon,true);
  assert.equal(dark[0].score,bright[0].score);
});

test('activity includes both boundaries and distinguishes approaching, peak and declining days',()=>{
  const stream={key:'orionids',start:'10-02',end:'11-07',peak:'10-21'};
  for(const [dateKey,kind] of [['2026-10-02','meteor_active'],['2026-10-20','meteor_peak'],['2026-10-21','meteor_today'],['2026-10-27','meteor_declining'],['2026-11-01','meteor_declining'],['2026-11-07','meteor_declining']]){
    const result=model.select(day({dateKey,showers:[stream]}),config);
    assert.equal(result.length,1,dateKey);assert.equal(result[0].kind,kind,dateKey);assert.equal(result[0].days,0);
  }
  assert.equal(model.select(day({dateKey:'2026-11-08',showers:[stream]}),config).length,0);
});

test('an active meteor stream keeps one slot on busy days and the strongest peak wins',()=>{
  const calendar=[{date:'2026-10-26',category:'eclipse',title:'Eclipse'},{date:'2026-10-26',category:'season',title:'one'},{date:'2026-10-26',category:'planet',title:'two'}];
  const streams=[{key:'orionids',start:'10-02',end:'11-07',peak:'10-21'},{key:'other',start:'10-20',end:'10-30',peak:'10-26'}];
  const result=model.select(day({calendar,moon:{frac:.5,illum:100},solar:{polarDay:true,polarNight:false},showers:streams}),config);
  assert.equal(result.length,5);assert.equal(result.filter(item=>item.group==='meteor').length,1);
  assert.equal(result.find(item=>item.group==='meteor').data.stream.key,'other');
  const declining=model.select(day({calendar,moon:{frac:.5,illum:100},solar:{polarDay:true,polarNight:false},showers:[streams[0]]}),config);
  assert.equal(declining.length,5);assert.ok(declining.some(item=>item.kind==='meteor_declining'));
});
test('calendar conjunction and computed closest approach are merged rather than duplicated',()=>{
  const approach={a:'mars',b:'jupiter',dateKey:'2026-11-16',separation:1.2};
  const result=model.select(day({dateKey:'2026-11-12',calendar:[{date:'2026-11-15',category:'planet',title:'conjunction',approach}],conjunctions:[approach]}),config);
  assert.equal(result.length,1);assert.equal(result[0].kind,'calendar');assert.equal(result[0].data.approach.separation,1.2);
});
test('unreliable orbital years omit planet predictions and polar nights can still have twilight',()=>{
  const result=model.select(day({orbitalModelReliable:false,planets:[{key:'jupiter',samples:5,altitudeDeg:40}],conjunctions:[{a:'mars',b:'jupiter',dateKey:'2026-10-28',separation:1}],solar:{polarDay:false,polarNight:true}}),config);
  assert.equal(result.length,1);assert.equal(result[0].kind,'polar_night');
});
test('local eclipse visibility is carried through and known invisible events receive lower priority',()=>{
  const local=model.select(day({calendar:[{date:'2026-10-26',category:'eclipse',title:'Eclipse',eclipseStatus:'total'}]}),config)[0];
  const remote=model.select(day({calendar:[{date:'2026-10-26',category:'eclipse',title:'Eclipse',eclipseStatus:'not_visible'}]}),config)[0];
  assert.ok(local.score>remote.score);assert.equal(remote.data.eclipseStatus,'not_visible');
});
test('daily translations and help exist in all locales with matching message placeholders',()=>{
  const all=realm.window.PLANETENUHR_TRANSLATIONS;
  const keys=Object.keys(all.en).filter(key=>key.startsWith('daily_'));
  for(const lang of ['de','en','fr']){
    for(const key of keys){assert.ok(all[lang][key],lang+key);assert.deepEqual(all[lang][key].match(/\{\w+\}/g),all.en[key].match(/\{\w+\}/g));}
    assert.ok(realm.window.PLANETENUHR_CARD_HELP[lang].cards.daily_highlights);
  }
});

test('daily graphics distinguish eclipse kinds from dated data without interpreting translated titles',()=>{
  const describe=realm.window.PLANETENUHR_DAILY_GRAPHICS.describe;
  assert.equal(describe({kind:'calendar',group:'eclipse',data:{category:'eclipse',date:'2026-08-12',title:'any language'}},.5).scene,'solarEclipse');
  assert.equal(describe({kind:'calendar',group:'eclipse',data:{category:'eclipse',date:'2026-08-28',title:'any language'}},0).scene,'lunarEclipse');
  assert.equal(describe({kind:'calendar',group:'eclipse',data:{category:'eclipse',date:'2126-01-01'}},.5).scene,'orbit');
});

test('daily graphics preserve the selected phase and identify observed planets and calendar pairs',()=>{
  const describe=realm.window.PLANETENUHR_DAILY_GRAPHICS.describe;
  assert.equal(describe({kind:'moon_full',group:'moon',data:{}},.49).phase,.49);
  assert.equal(describe({kind:'calendar',group:'moon',data:{category:'moon'}},.23).phase,.23);
  assert.deepEqual(Array.from(describe({kind:'planet',data:{key:'saturn'}},.5).bodies),['saturn']);
  assert.deepEqual(Array.from(describe({kind:'calendar',data:{category:'planet',bodyKeys:['mars','jupiter']}},.5).bodies),['mars','jupiter']);
  assert.equal(describe({kind:'calendar',data:{category:'planet',bodyKeys:[]}},.5).scene,'orbit');
  assert.equal(describe({kind:'meteor_active',group:'meteor',data:{}},.5).scene,'meteor');
  assert.equal(describe({kind:'calendar',data:{category:'season'}},.5).scene,'season');
  assert.equal(describe({kind:'polar_night',data:{}},.5).state,'polar_night');
});
