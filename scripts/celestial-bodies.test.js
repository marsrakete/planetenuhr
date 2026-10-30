const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = {window:{}};
for (const file of ['js/data/celestial-bodies-config.js','js/shared/celestial-bodies.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'), realm);
}
const visuals = realm.window.PLANETENUHR_BODY_VISUALS;

test('shared body registry provides all eight planets and the Moon, rejecting unknown keys', () => {
  assert.deepEqual(Object.keys(realm.window.PLANETENUHR_BODY_CONFIG), ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','moon']);
  assert.throws(() => visuals.create('pluto'), /Unknown body/);
});

test('shared lunar geometry preserves full/new and opposing quarter phases', () => {
  const first = visuals.illuminatedPath(.25);
  const last = visuals.illuminatedPath(.75);
  assert.match(first, /L 64 9 Z$/);
  assert.match(last, /L 64 9 Z$/);
  assert.notEqual(first,last);
  assert.notEqual(visuals.illuminatedPath(0),visuals.illuminatedPath(.5));
  assert.equal(visuals.illuminatedPath(0),visuals.illuminatedPath(1));
  assert.equal(visuals.illuminatedPath(-.25),last);
  for (const phase of [0,.1,.25,.49,.5,.51,.75,.9,1]) {
    assert.ok(!/NaN|Infinity/.test(visuals.illuminatedPath(phase)));
  }
});
