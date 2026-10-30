process.env.TZ = 'Europe/Berlin';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{},Date,Math,Intl});
for (const file of ['js/models/astronomy-coordinates.js','js/data/planet-elements-config.js','js/models/planet-model.js','js/models/solar-visibility-model.js','js/models/lagrange-model.js','js/cards/lagrange.js','js/models/analemma-model.js','js/cards/analemma.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),realm);
}
const solar = realm.window.PLANETENUHR_SOLAR_VISIBILITY;
/** Supplies the existing generic polar-coordinate convention to the scene model.
 * @param {number} center Shared x/y center. @param {number} radius Radius in plot units.
 * @param {number} fraction Full-circle fraction. @returns {object} Cartesian point.
 */
function polarPoint(center,radius,fraction){
  const angle = fraction*Math.PI*2-Math.PI/2;
  return {x:center+Math.cos(angle)*radius,y:center+Math.sin(angle)*radius};
}
const lagrange = realm.window.PLANETENUHR_LAGRANGE_MODEL.create({sunLongitude:solar.sunLongitude,polarPoint});
const analemma = realm.window.PLANETENUHR_ANALEMMA_MODEL.create({solarVisibility:solar,daysInYear:solar.daysInYear,dayOfYearLocal:solar.dayOfYearLocal});
const reference = JSON.parse(fs.readFileSync(path.join(__dirname,'baselines/solar-geometry-models.json'),'utf8'));

test('five Lagrange scenes preserve the pre-extraction geometry and date input', () => {
  for (const item of reference.scenes) {
    const date = new Date(item.iso);
    assert.deepEqual(JSON.parse(JSON.stringify(lagrange.calculateScene(date))),item.result);
    assert.equal(date.getTime(),Date.parse(item.iso));
  }
});

test('Lagrange schematic retains equilateral L4/L5 triangles and radial L1/L2/L3 positions', () => {
  const scene = lagrange.calculateScene(new Date('2026-10-27T12:00:00Z'));
  for (const point of [scene.l4Point,scene.l5Point]) {
    assert.ok(Math.abs(Math.hypot(point.x-scene.center,point.y-scene.center)-scene.orbitRadius)<1e-10);
    assert.ok(Math.abs(Math.hypot(point.x-scene.earthPoint.x,point.y-scene.earthPoint.y)-scene.orbitRadius)<1e-10);
  }
  assert.ok(Math.abs(Math.hypot(scene.l1Point.x-scene.center,scene.l1Point.y-scene.center)-110)<1e-10);
  assert.ok(Math.abs(Math.hypot(scene.l2Point.x-scene.center,scene.l2Point.y-scene.center)-146)<1e-10);
  assert.ok(Math.abs(scene.earthPoint.x+scene.l3Point.x-2*scene.center)<1e-10);
  assert.ok(Math.abs(scene.earthPoint.y+scene.l3Point.y-2*scene.center)<1e-10);
});

test('nine analemma annual sets preserve all samples, bounds and selected days across places, DST and leap year', () => {
  assert.equal(reference.timeZone,process.env.TZ);
  for (const item of reference.years) {
    const date = new Date(item.iso);
    const before = JSON.stringify(item.location);
    assert.deepEqual(JSON.parse(JSON.stringify(analemma.sampleYear(date,item.location))),item.result,item.location.key+' '+item.iso);
    assert.equal(date.getTime(),Date.parse(item.iso));
    assert.equal(JSON.stringify(item.location),before);
  }
});

test('annual aggregation calls the existing providers once per calendar day using explicit place and year', () => {
  let offsetCalls = 0;
  let altitudeCalls = 0;
  const location = {latitude:-30,longitude:151};
  const model = realm.window.PLANETENUHR_ANALEMMA_MODEL.create({daysInYear:solar.daysInYear,dayOfYearLocal:solar.dayOfYearLocal,
    solarVisibility:{
      approximateSolarNoonOffsetMinutes:(date,place) => {assert.equal(place,location);offsetCalls++;return date.getMonth()-6;},
      approximateNoonAltitudeDegrees:(date,place) => {assert.equal(place,location);altitudeCalls++;return place.latitude;}
    }
  });
  const result = model.sampleYear(new Date(2028,1,29,12),location);
  assert.equal(result.samples.length,366);
  assert.equal(offsetCalls,366);
  assert.equal(altitudeCalls,366);
  assert.equal(result.selectedSample.date.getMonth(),1);
  assert.equal(result.selectedSample.date.getDate(),29);
  assert.equal(result.maxOffset,6);
  assert.equal(result.minAltitude,-30);
  assert.equal(result.maxAltitude,-30);
});

test('controllers tolerate missing targets and retain the existing signed-minute formatting', () => {
  const options = {document:{getElementById:() => null},getTranslations:() => ({})};
  const context = {date:new Date(2026,11,1),language:'de',location:{latitude:52,longitude:13}};
  const controller = realm.window.PLANETENUHR_ANALEMMA_CARD.create(options);
  assert.equal(controller.formatSignedMinutes(2.25),'+2.3 min');
  assert.equal(controller.formatSignedMinutes(-2.25),'−2.3 min');
  assert.doesNotThrow(() => controller.render(context));
  assert.doesNotThrow(() => realm.window.PLANETENUHR_LAGRANGE_CARD.create(options).render(context));
});
