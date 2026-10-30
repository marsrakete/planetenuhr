const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{},Date,Math,Intl});
for (const file of ['js/cards/constellation-month.js','js/cards/constellation-year.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), realm);
}
const month = realm.window.PLANETENUHR_CONSTELLATION_MONTH.create({});

test('constellation center handles empty figures and percentage coordinates', () => {
  assert.equal(month.calculateConstellationCenter([], 460).x, 230);
  assert.equal(month.calculateConstellationCenter(null, 460).y, 230);
  const center = month.calculateConstellationCenter([[10,20],[30,60]], 400);
  assert.equal(center.x, 80);
  assert.equal(center.y, 160);
});

test('star labels face outward and retain explicit zero offsets and anchor overrides', () => {
  const center = {x:230,y:230};
  const left = month.buildConstellationLabelPlacement([10,10], 460, center, 'Left');
  assert.equal(left.x, 34);
  assert.equal(left.y, 34);
  assert.equal(left.anchor, 'end');
  const right = month.buildConstellationLabelPlacement([90,90], 460, center, 'Right');
  assert.equal(right.x, 426);
  assert.equal(right.y, 430);
  assert.equal(right.anchor, 'start');
  const override = month.buildConstellationLabelPlacement([90,90], 460, center, 'Named', {dx:0,dy:-5,anchor:'middle'});
  assert.equal(override.x, 414);
  assert.equal(override.y, 409);
  assert.equal(override.anchor, 'middle');
  assert.equal(override.name, 'Named');
});

test('controllers leave absent cards alone and do not require timers or event wiring', () => {
  const options = {document:{getElementById:() => null},getTranslations:() => ({})};
  const context = {date:new Date(2026,11,1),language:'de'};
  assert.doesNotThrow(() => realm.window.PLANETENUHR_CONSTELLATION_MONTH.create(options).render(context));
  assert.doesNotThrow(() => realm.window.PLANETENUHR_CONSTELLATION_YEAR.create(options).render(context));
});
