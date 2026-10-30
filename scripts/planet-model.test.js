const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({window:{}, Date, Math});
for (const file of ['js/models/astronomy-coordinates.js', 'js/data/planet-elements-config.js', 'js/models/planet-model.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
}
const model = context.window.PLANETENUHR_PLANET_MODEL;
const elements = context.window.PLANETENUHR_PLANET_ELEMENTS;

test('all eight planets preserve the pre-extraction vectors at five reference dates', () => {
  const reference = JSON.parse(fs.readFileSync(path.join(__dirname, 'baselines/planet-model.json'), 'utf8'));
  assert.equal(elements.length, 8);
  assert.equal(reference.length, 40);
  const unchanged = JSON.stringify(elements);
  for (const sample of reference) {
    const date = new Date(sample.date);
    const heliocentric = model.heliocentricPosition(sample.key, date);
    const geocentric = model.geocentricVector(sample.key, date);
    for (const axis of ['x','y','z','a']) {
      assert.ok(Math.abs(heliocentric[axis] - sample.heliocentric[axis]) < 1e-12, sample.key + ' heliocentric ' + axis);
    }
    for (const axis of ['x','y','z']) {
      assert.ok(Math.abs(geocentric[axis] - sample.geocentric[axis]) < 1e-12, sample.key + ' geocentric ' + axis);
    }
    assert.equal(date.getTime(), Date.parse(sample.date));
  }
  assert.equal(JSON.stringify(elements), unchanged);
});

test('Kepler solver satisfies the equation across the configured eccentricity range', () => {
  for (const eccentricity of [0, 0.00859, 0.01671, 0.09339, 0.20564]) {
    for (const anomaly of [0, 0.01, Math.PI / 2, Math.PI, Math.PI * 2 - 0.01]) {
      const eccentricAnomaly = model.solveKepler(anomaly, eccentricity);
      assert.ok(Math.abs(eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - anomaly) < 1e-12);
    }
  }
});

test('Earth-centered geometry keeps the Sun opposite Earth and rejects unknown bodies', () => {
  const date = new Date('2026-10-27T12:00:00Z');
  const earth = model.heliocentricPosition('earth', date);
  const sun = model.geocentricVector('sun', date);
  const origin = model.geocentricVector('earth', date);
  for (const axis of ['x','y','z']) {
    assert.equal(sun[axis], -earth[axis]);
    assert.equal(origin[axis], 0);
  }
  assert.equal(model.planetByKey('unknown'), undefined);
  assert.equal(model.heliocentricPosition('unknown', date), null);
  assert.equal(model.geocentricVector('unknown', date), null);
});
