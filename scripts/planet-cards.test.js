const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{},Date,Math});
for (const file of ['js/models/astronomy-coordinates.js','js/data/planet-elements-config.js','js/models/planet-model.js','js/models/solar-visibility-model.js','js/models/inner-planets-model.js','js/cards/inner-planets.js','js/data/barycenter-config.js','js/models/barycenter-model.js','js/cards/barycenter.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),realm);
}
const planets = realm.window.PLANETENUHR_PLANET_MODEL;
const coordinates = realm.window.PLANETENUHR_COORDINATES;
const config = realm.window.PLANETENUHR_BARYCENTER_CONFIG;
const phases = realm.window.PLANETENUHR_INNER_PLANETS_MODEL.create({
  position:planets.heliocentricPosition,
  elongation:(key,date) => {
    const vector = planets.geocentricVector(key,date);
    const longitude = coordinates.normalizeDeg(Math.atan2(vector.y,vector.x)*180/Math.PI);
    return coordinates.signedDeg(longitude-realm.window.PLANETENUHR_SOLAR_VISIBILITY.sunLongitude(date));
  }
});
const barycenter = realm.window.PLANETENUHR_BARYCENTER_MODEL.create({
  planets:realm.window.PLANETENUHR_PLANET_ELEMENTS,position:planets.planetPosition,massRatios:config.massRatios
});
const reference = JSON.parse(fs.readFileSync(path.join(__dirname,'baselines/planet-cards-models.json'),'utf8'));

test('inner-planet phase data retains ten pre-extraction values including leap day', () => {
  for (const item of reference.phases) {
    const date = new Date(item.iso);
    assert.deepEqual(JSON.parse(JSON.stringify(phases.planetIlluminationData(item.key,date))),item.result);
    assert.equal(date.getTime(),Date.parse(item.iso));
  }
});

test('all three barycenter modes retain vectors, contributors, solar offsets and complete 50-year trails', () => {
  for (const item of reference.barycenter) {
    const date = new Date(item.iso);
    assert.deepEqual(JSON.parse(JSON.stringify(barycenter.solarBarycenter(date,item.mode))),item.result);
    assert.deepEqual(JSON.parse(JSON.stringify(barycenter.sunOffsetFromBarycenter(date,item.mode))),item.sun);
    assert.deepEqual(JSON.parse(JSON.stringify(barycenter.barycenterTrail(date,9125,30,item.mode))),item.trail);
    assert.equal(date.getTime(),Date.parse(item.iso));
  }
});

test('mass weighting includes the Sun and sorts contributors by their weighted distance', () => {
  const model = realm.window.PLANETENUHR_BARYCENTER_MODEL.create({
    planets:[{key:'a'},{key:'b'},{key:'missing'}],massRatios:{a:1,b:3},
    position:planet => {
      if (planet.key === 'a') return {x:2,y:0,z:0};
      if (planet.key === 'b') return {x:0,y:4,z:0};
      return null;
    }
  });
  const date = new Date('2026-10-27T12:00:00Z');
  const result = model.solarBarycenter(date,'all');
  assert.equal(result.x,0.4);
  assert.equal(result.y,2.4);
  assert.equal(result.contributors[0].key,'b');
  assert.equal(model.sunOffsetFromBarycenter(date,'all').x,-0.4);
  assert.equal(model.solarBarycenter(date,'jupiter').distanceAu,0);
});

test('phase geometry clamps percentages and retains opposite morning and evening terminators', () => {
  assert.equal(phases.phaseDiscPath(-20,true),phases.phaseDiscPath(0,true));
  assert.equal(phases.phaseDiscPath(120,false),phases.phaseDiscPath(100,false));
  assert.notEqual(phases.phaseDiscPath(50,true),phases.phaseDiscPath(50,false));
  assert.ok(phases.phaseDiscPath(50,true).includes('A 1.5 38'));
  const missing = realm.window.PLANETENUHR_INNER_PLANETS_MODEL.create({position:() => null});
  assert.equal(missing.planetIlluminationData('unknown',new Date()).distanceAu,0);
});

test('barycenter mode listeners initialize once and use the current global selection without resetting local mode', () => {
  const buttons = new Map();
  for (const entry of config.modes) {
    buttons.set(entry.id,{listeners:[],blurCount:0,addEventListener(type,listener){this.listeners.push(listener);},blur(){this.blurCount++;}});
  }
  let date = new Date('2026-10-27T12:00:00Z');
  const selected = [];
  let layouts = 0;
  const controller = realm.window.PLANETENUHR_BARYCENTER_CARD.create({
    document:{getElementById:id => buttons.get(id) || null},config,getTranslations:() => ({}),
    getContext:() => {selected.push(date);return {date};},requestLayout:() => {layouts++;}
  });
  controller.init();controller.init();
  for (const button of buttons.values()) assert.equal(button.listeners.length,1);
  const jupiter = buttons.get('btnBarycenterJupiter');
  let prevented = 0;
  jupiter.listeners[0]({preventDefault:() => {prevented++;}});
  assert.equal(controller.getMode(),'jupiter');
  date = new Date('2026-12-01T12:00:00Z');
  controller.render({date});
  assert.equal(controller.getMode(),'jupiter');
  jupiter.listeners[0]({preventDefault:() => {prevented++;}});
  assert.equal(selected[1],date);
  assert.equal(jupiter.blurCount,2);
  assert.equal(prevented,2);
  assert.equal(layouts,2);
});

test('card controllers leave absent cards alone without calculations or timers', () => {
  const options = {document:{getElementById:() => null},config,getTranslations:() => ({})};
  const context = {date:new Date('2026-12-01T12:00:00Z')};
  assert.doesNotThrow(() => realm.window.PLANETENUHR_BARYCENTER_CARD.create(options).render(context));
  assert.doesNotThrow(() => realm.window.PLANETENUHR_INNER_PLANETS_CARD.create(options).render(context));
});
