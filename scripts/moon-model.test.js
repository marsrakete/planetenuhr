const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const context = vm.createContext({window:{}, Date, Math});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/models/moon-model.js'), 'utf8'), context);
const model = context.window.PLANETENUHR_MOON_MODEL;
const reference = JSON.parse(fs.readFileSync(path.join(__dirname, 'baselines/moon-model.json'), 'utf8'));

test('schematic moon phase preserves the pre-extraction reference including subsecond dates', () => {
  assert.equal(reference.length, 16);
  for (const sample of reference) {
    const date = new Date(sample.date);
    const timestamp = date.getTime();
    const moon = model.computeMoon(date);
    assert.deepEqual(JSON.parse(JSON.stringify(moon)), sample.moon);
    assert.equal(date.getTime(), timestamp);
  }
});

test('reference new Moon and the eight cycle phases retain correct order and illumination', () => {
  const epoch = Date.UTC(2000, 0, 6, 18, 14, 0);
  const period = 29.530588861 * 86400000;
  const keys = ['phase_new','phase_wax_cres','phase_first_q','phase_wax_gibb',
    'phase_full','phase_wan_gibb','phase_last_q','phase_wan_cres'];
  for (let index = 0; index < keys.length; index += 1) {
    const phase = model.computeMoon(new Date(epoch + period * index / 8));
    assert.equal(phase.key, keys[index]);
    assert.ok(phase.frac >= 0 && phase.frac < 1);
    assert.ok(phase.illum >= 0 && phase.illum <= 100);
  }
  assert.equal(model.computeMoon(new Date(epoch)).illum, 0);
  const beforeEpoch = model.computeMoon(new Date(epoch - 1000));
  assert.ok(beforeEpoch.frac > 0.99 && beforeEpoch.frac < 1);
});

test('next full Moon agrees with USNO reference phases and switches at the calculated event', () => {
  // https://aa.usno.navy.mil/calculated/moon/phases?date=2026-01-01&format=t&nump=50
  const phases = [
    ['2026-06-25', '2026-06-29T23:56:00Z'],
    ['2026-11-23', '2026-11-24T14:53:00Z'],
    ['2026-11-25', '2026-12-24T01:28:00Z']
  ];
  for (const [start, expected] of phases) {
    const date = new Date(start);
    const input = date.getTime();
    const actual = model.nextFullMoon(date);
    assert.ok(Math.abs(actual.getTime() - Date.parse(expected)) < 60000, actual.toISOString());
    assert.equal(date.getTime(), input);
    assert.equal(model.nextFullMoon(new Date(actual.getTime() - 1)).getTime(), actual.getTime());
    assert.ok(model.nextFullMoon(actual).getTime() > actual.getTime() + 28 * 86400000);
  }
  for (const sample of reference) {
    const date = new Date(sample.date);
    const remaining = model.nextFullMoon(date).getTime() - date.getTime();
    assert.ok(remaining > 0 && remaining <= 31 * 86400000);
  }
  assert.ok(Number.isNaN(model.nextFullMoon(new Date(NaN)).getTime()));
});
