const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{},Date,Math});
for (const file of ['js/models/astronomy-coordinates.js','js/data/phenomena-config.js','js/models/exoplanets-model.js','js/cards/exoplanets.js','js/models/satellites-model.js','js/cards/satellites.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),realm);
}
const data = realm.window.PLANETENUHR_PHENOMENA;
const exoplanets = realm.window.PLANETENUHR_EXOPLANETS_MODEL.create(realm.window.PLANETENUHR_COORDINATES);
const satellites = realm.window.PLANETENUHR_SATELLITES_MODEL.create({});
const reference = JSON.parse(fs.readFileSync(path.join(__dirname,'baselines/orbit-cards-models.json'),'utf8'));

test('96 exoplanet states preserve periods, phase staggering, normalization and coordinates', () => {
  for (const item of reference.planets) {
    const system = data.exoplanetSystems[item.systemIndex];
    const date = new Date(item.iso);
    const before = JSON.stringify(system);
    const actual = exoplanets.planetState(system,system.planets[item.planetIndex],date,item.systemIndex,item.planetIndex);
    assert.deepEqual(JSON.parse(JSON.stringify(actual)),item.result);
    assert.equal(date.getTime(),Date.parse(item.iso));
    assert.equal(JSON.stringify(system),before);
  }
});

test('20 satellite states preserve ellipse projection, epoch phases and RAAN rotation before and after the epoch', () => {
  for (const item of reference.satellites) {
    const satellite = data.satellites[item.index];
    const date = new Date(item.iso);
    const before = JSON.stringify(satellite);
    const actual = satellites.orbitState(satellite,item.index,date);
    assert.deepEqual(JSON.parse(JSON.stringify(actual)),item.result);
    assert.ok(actual.phase >= 0 && actual.phase < 1);
    assert.equal(date.getTime(),Date.parse(item.iso));
    assert.equal(JSON.stringify(satellite),before);
  }
});

test('Kepler period scaling and existing invalid-input fallbacks remain explicit', () => {
  assert.equal(exoplanets.exoplanetPeriodDays(1,1),365.25);
  assert.equal(exoplanets.exoplanetPeriodDays(4,1),365.25*8);
  assert.equal(exoplanets.exoplanetPeriodDays(1,4),365.25/2);
  assert.equal(exoplanets.exoplanetPeriodDays(0,0),exoplanets.exoplanetPeriodDays(0.01,1));
  assert.equal(exoplanets.exoplanetPeriodDays(NaN,Infinity),exoplanets.exoplanetPeriodDays(0.01,1));
});

test('one configured orbital period returns to the same schematic position', () => {
  const epoch = new Date('2000-01-01T12:00:00Z');
  const system = {maxOrbitAu:1,starMassSun:1};
  const planet = {orbitAu:1};
  const first = exoplanets.planetState(system,planet,epoch,0,0);
  const next = exoplanets.planetState(system,planet,new Date(epoch.getTime()+365.25*86400000),0,0);
  assert.ok(Math.hypot(first.x-next.x,first.y-next.y)<1e-9);
  for (const [index,satellite] of data.satellites.entries()) {
    const date = new Date(satellite.epoch);
    const a = satellites.orbitState(satellite,index,date);
    const b = satellites.orbitState(satellite,index,new Date(date.getTime()+satellite.periodMin*60000));
    assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-8);
  }
});

test('controllers tolerate absent targets without calling models or starting timers', () => {
  const options = {document:{getElementById:() => null},getTranslations:() => ({})};
  const context = {date:new Date('2026-12-01T12:00:00Z')};
  assert.doesNotThrow(() => realm.window.PLANETENUHR_EXOPLANETS_CARD.create(options).render(context));
  assert.doesNotThrow(() => realm.window.PLANETENUHR_SATELLITES_CARD.create(options).render(context));
});
