const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const root = path.resolve(__dirname, '..');
const reference = JSON.parse(fs.readFileSync(path.join(__dirname, 'baselines/solar-eclipse-models.json'), 'utf8'));
process.env.TZ = reference.timeZone;
const context = vm.createContext({window:{}, Date, Math});
for (const file of ['js/models/astronomy-coordinates.js','js/data/planet-elements-config.js','js/models/planet-model.js','js/models/solar-visibility-model.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
}
const model = context.window.PLANETENUHR_SOLAR_VISIBILITY;

test('solar events and seasonal approximations preserve thirty pre-extraction cases', () => {
  assert.equal(reference.samples.length, 30);
  for (const sample of reference.samples) {
    const date = new Date(sample.date);
    const events = [];
    for (const zenith of [90.833, 96, 84]) {
      for (const rise of [true, false]) {
        events.push(model.solarEventUtc(date, sample.location.latitude, sample.location.longitude, zenith, rise));
      }
    }
    assert.deepEqual(JSON.parse(JSON.stringify(events)), sample.events);
    assert.equal(model.sunLongitude(date), sample.longitude);
    assert.deepEqual(JSON.parse(JSON.stringify(model.solarEquatorialCoordinates(date))), sample.equatorial);
    assert.equal(model.approximateSolarDeclinationDegrees(date), sample.declination);
    assert.equal(model.approximateEquationOfTimeMinutes(date), sample.equation);
    assert.equal(model.approximateSolarNoonOffsetMinutes(date, sample.location), sample.noon);
    assert.equal(model.approximateNoonAltitudeDegrees(date, sample.location), sample.altitude);
    assert.equal(date.toISOString(), new Date(sample.date).toISOString());
  }
});

test('schematic night intervals preserve every segment and best time with explicit location and elongation', () => {
  for (const sample of reference.samples) {
    const result = model.nightVisibilitySegments(new Date(sample.date), sample.location, sample.elongation);
    assert.deepEqual(JSON.parse(JSON.stringify(result)), sample.night);
  }
});

test('polar thresholds return no invented event and calendar helpers retain leap-year behavior', () => {
  for (const date of ['2026-06-21T12:00:00Z', '2026-12-21T12:00:00Z']) {
    assert.equal(model.solarEventUtc(new Date(date), 89, 0, 90.833, true), null);
    assert.equal(model.solarEventUtc(new Date(date), 89, 0, 90.833, false), null);
  }
  assert.equal(model.daysInYear(2000), 366);
  assert.equal(model.daysInYear(2100), 365);
  assert.equal(model.dayOfYear(new Date('2024-02-29T12:00:00Z')), 60);
});
