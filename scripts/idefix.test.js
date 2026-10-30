const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const {parseVectors} = require('./update-idefix-ephemeris');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({window:{},Date,Math});
for (const file of ['js/data/idefix-config.js','js/data/idefix-ephemeris.js','js/models/idefix-model.js','js/data/translations.js','js/data/card-help-config.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const config = context.window.PLANETENUHR_IDEFIX_CONFIG;
const data = context.window.PLANETENUHR_IDEFIX_EPHEMERIS;
const model = context.window.PLANETENUHR_IDEFIX_MODEL;

test('JPL planning snapshot has UTC provenance, monotonic timestamps and bounded AU vectors', () => {
  assert.equal(data.spacecraftId,-239);
  assert.equal(data.type,'prediction');
  assert.equal(data.timeScale,'UTC');
  assert.equal(data.units,'AU');
  assert.equal(data.trajectory,'20261019_20281231_MMX_V0.2');
  assert.equal(data.start,'2026-10-19T21:00:00.000Z');
  assert.equal(data.end,'2028-12-30T21:00:00.000Z');
  assert.ok(data.rows.length >= 800);
  for (const url of data.queryUrls) {
    const query = new URL(url);
    assert.equal(query.hostname,'ssd.jpl.nasa.gov');
    assert.equal(query.searchParams.get('CENTER'),"'500@10'");
    assert.equal(query.searchParams.get('TIME_TYPE'),"'UT'");
    assert.equal(query.searchParams.get('VEC_CORR'),"'NONE'");
  }
  data.rows.forEach((row,index) => {
    assert.equal(row.length,4);
    assert.ok(Array.from(row).every(Number.isFinite));
    const radius = Math.hypot(row[1],row[2],row[3]);
    assert.ok(radius > 0.8 && radius < 1.8);
    if (index > 0) {
      const interval = row[0] - data.rows[index-1][0];
      assert.ok(interval > 0 && interval <= 86400000);
    }
  });
});

test('position interpolation reproduces endpoints and refuses launch gap or post-coverage extrapolation', () => {
  const first = data.rows[0];
  const last = data.rows[data.rows.length-1];
  assert.equal(model.positionAt(data.rows,new Date(config.launch)),null);
  assert.equal(model.positionAt(data.rows,new Date(first[0]-1)),null);
  assert.equal(model.positionAt(data.rows,new Date(last[0]+1)),null);
  assert.equal(model.positionAt(data.rows,new Date('2031-06-01')),null);
  assert.equal(model.positionAt([],new Date()),null);
  assert.equal(model.positionAt(data.rows,new Date('invalid')),null);
  const initial = model.positionAt(data.rows,new Date(first[0]));
  const final = model.positionAt(data.rows,new Date(last[0]));
  assert.deepEqual([initial.x,initial.y,initial.z],Array.from(first).slice(1));
  assert.deepEqual([final.x,final.y,final.z],Array.from(last).slice(1));
  const fixture = [[0,1,2,3],[1000,3,6,9]];
  const middle = model.positionAt(fixture,new Date(250));
  assert.deepEqual([middle.x,middle.y,middle.z],[1.5,3,4.5]);
});

test('planning phases never turn the rover into a return spacecraft', () => {
  for (const [date,phase] of [
    ['2026-10-19T19:40:00Z','prelaunch'],
    ['2026-10-20','cruise'],
    ['2027-08-15','arrival'],
    ['2027-09-01','survey'],
    ['2029-02-01','landing'],
    ['2029-05-01','surface'],
    ['2030-12-01','surface'],
    ['2031-12-31','surface']
  ]) {
    assert.equal(model.phaseAt(new Date(date),config),phase);
  }
  assert.equal(config.roverLandingWindow.illustrative,true);
});

test('calendar stepping clamps month/year ends and preserves UTC time without mutating input', () => {
  const start = new Date('2028-01-31T19:41:03Z');
  assert.equal(model.shiftDate(start,'month',1).toISOString(),'2028-02-29T19:41:03.000Z');
  assert.equal(model.shiftDate(new Date('2028-02-29T19:41:03Z'),'year',1).toISOString(),'2029-02-28T19:41:03.000Z');
  assert.equal(model.shiftDate(new Date('2027-03-31T19:41:03Z'),'month',-1).toISOString(),'2027-02-28T19:41:03.000Z');
  assert.equal(model.shiftDate(start,'day',1).toISOString(),'2028-02-01T19:41:03.000Z');
  assert.equal(start.toISOString(),'2028-01-31T19:41:03.000Z');
});

test('Phobos sketch repeats after one sidereal period and the overview fits the mobile frame', () => {
  const date = new Date('2026-10-19T21:00:00Z');
  const later = new Date(date.getTime()+config.phobosPeriodDays*86400000);
  assert.ok(Math.abs(model.phobosAngle(date,config)-model.phobosAngle(later,config))<0.000001);
  for (const row of data.rows) {
    const point = model.project({x:row[1],y:row[2]});
    assert.ok(point.x>110 && point.x<510);
    assert.ok(point.y>-25 && point.y<385);
  }
});

test('all IDEFIX texts, placeholders and help formulas exist in de/en/fr', () => {
  const translations = context.window.PLANETENUHR_TRANSLATIONS;
  const keys = Object.keys(translations.en).filter(key=>key.startsWith('idefix_')).sort();
  assert.ok(keys.length > 30);
  for (const language of ['de','en','fr']) {
    assert.deepEqual(Object.keys(translations[language]).filter(key=>key.startsWith('idefix_')).sort(),keys);
    for (const key of keys) {
      const text = translations[language][key];
      assert.ok(text);
      const placeholders = text.match(/\{\w+\}/g) || [];
      const expected = translations.en[key].match(/\{\w+\}/g) || [];
      assert.deepEqual(placeholders.sort(),expected.sort(),language+' '+key);
    }
    for (const step of [...config.steps,...config.presets]) {
      assert.ok(translations[language][step.label]);
    }
    const help = context.window.PLANETENUHR_CARD_HELP[language].cards.idefix;
    assert.ok(help.formulas.length >= 3 && help.links.length >= 4);
  }
});

test('Horizons CSV parser converts UTC JD and rejects non-numeric vectors', () => {
  const fixture = 'metadata\n$$SOE\n2451545.000000000, A.D. 2000-Jan-01 12:00:00, 1.0, -2.5, 3e-3,\n$$EOE\n';
  assert.deepEqual(parseVectors(fixture),[[946728000000,1,-2.5,0.003]]);
  assert.throws(()=>parseVectors(fixture.replace('1.0','BROKEN')));
  assert.throws(()=>parseVectors('not an ephemeris'));
});
