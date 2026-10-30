const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{},Math});
for (const file of ['js/data/small-bodies-config.js','js/data/phenomena-config.js','js/models/small-bodies-model.js','js/cards/small-bodies.js','js/models/spacecraft-model.js','js/cards/spacecraft.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),realm);
}
const small = realm.window.PLANETENUHR_SMALL_BODIES_MODEL.create({});
const craft = realm.window.PLANETENUHR_SPACECRAFT_MODEL.create({});
const data = realm.window.PLANETENUHR_SMALL_BODIES;
const probes = realm.window.PLANETENUHR_PHENOMENA.spacecraft;
const reference = JSON.parse(fs.readFileSync(path.join(__dirname,'baselines/static-orbits-models.json'),'utf8'));

test('all twenty comet ellipses and labels retain the pre-extraction reference', () => {
  const before = JSON.stringify(data);
  for (const item of reference.comets) {
    const geometry = small.cometState(data.comets[item.index],item.index,320,640*0.378);
    assert.deepEqual(JSON.parse(JSON.stringify(geometry)),item.geometry);
    assert.deepEqual(JSON.parse(JSON.stringify(small.labelState(geometry,320))),item.label);
  }
  assert.equal(JSON.stringify(data),before);
});

test('all ten spacecraft retain their direction, curve and label placement', () => {
  const before = JSON.stringify(probes);
  for (const item of reference.spacecraft) {
    assert.deepEqual(JSON.parse(JSON.stringify(craft.craftState(probes[item.index],item.index))),item.result);
  }
  assert.equal(JSON.stringify(probes),before);
});

test('square-root distance compression retains near-Sun and far-body caps', () => {
  assert.equal(small.smallBodyRadius(0.001,240),small.smallBodyRadius(0.02,240));
  assert.equal(small.smallBodyRadius(3700,240),240);
  assert.equal(small.smallBodyRadius(15,240),120);
  assert.ok(small.smallBodyRadius(1,240)<small.smallBodyRadius(2,240));
});

test('logarithmic probe scale, explicit zero angle and Pioneer separation remain intact', () => {
  assert.equal(craft.distanceRadius(0,168,180),0);
  assert.equal(craft.distanceRadius(180,168,180),168);
  const state = craft.craftState({distanceAu:30,angle:0},4);
  assert.equal(state.craftAngle,0);
  assert.equal(state.y,230);
  assert.equal(craft.craftState({distanceAu:30},4).craftAngle,144);
  const pioneer = probes.find(entry => entry.key === 'pioneer_10');
  assert.equal(craft.craftState(pioneer,6).craftAngle,342);
  const voyager = probes.find(entry => entry.key === 'voyager_2');
  assert.notEqual(pioneer.angle,voyager.angle);
});

test('probe labels remain inside the original plot bounds for arbitrary drawing directions', () => {
  for (const angle of [0,45,90,180,270,342]) {
    const state = craft.craftState({distanceAu:10000,angle},0);
    assert.ok(state.labelX>=34 && state.labelX<=426);
    assert.ok(state.labelY>=22 && state.labelY<=438);
    assert.ok(state.path.startsWith('M 230 230 C '));
  }
});

test('short comet names and missing-card behavior are unchanged', () => {
  const options = {document:{getElementById:() => null},getTranslations:() => ({})};
  const controller = realm.window.PLANETENUHR_SMALL_BODIES_CARD.create(options);
  assert.equal(controller.smallBodyShortName('1P/Halley'),'Halley');
  assert.equal(controller.smallBodyShortName('C/1995 O1 Hale-Bopp'),'1995 O1 Hale-Bopp');
  assert.equal(controller.smallBodyShortName('C 1995 Hale-Bopp'),'Hale-Bopp');
  assert.equal(controller.smallBodyShortName('Encke'),'Encke');
  assert.doesNotThrow(() => controller.render());
  assert.doesNotThrow(() => realm.window.PLANETENUHR_SPACECRAFT_CARD.create(options).render());
});
