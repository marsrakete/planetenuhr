const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{},Date,Math,Intl});
for (const file of ['js/models/astronomy-coordinates.js','js/data/planet-elements-config.js','js/models/planet-model.js','js/models/retrograde-model.js','js/cards/retrograde.js','js/cards/seasons.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), realm);
}
const coordinates = realm.window.PLANETENUHR_COORDINATES;
const planets = realm.window.PLANETENUHR_PLANET_MODEL;
const model = realm.window.PLANETENUHR_RETROGRADE_MODEL.create({
  longitude:(key,date) => {
    const vector = planets.geocentricVector(key,date);
    return coordinates.normalizeDeg(Math.atan2(vector.y,vector.x) * 180 / Math.PI);
  },
  latitude:(key,date) => {
    const vector = planets.geocentricVector(key,date);
    return Math.atan2(vector.z || 0, Math.max(0.0001,Math.hypot(vector.x,vector.y))) * 180 / Math.PI;
  },
  signedDeg:coordinates.signedDeg
});

test('retrograde motion, stations and complete sampled paths retain 25 pre-extraction cases', () => {
  const records = JSON.parse(fs.readFileSync(path.join(__dirname,'baselines/retrograde-model.json'),'utf8'));
  for (const record of records) {
    const date = new Date(record.iso);
    const actual = {
      motion:model.apparentDailyMotion(record.key,date),
      station:model.findNearestStationDate(record.key,date),
      path:model.samplePath(record.key,date)
    };
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), {motion:record.motion,station:record.station,path:record.path}, record.key + ' ' + record.iso);
    assert.equal(date.getTime(), Date.parse(record.iso));
  }
});

test('unwrapped tracks stay continuous across the longitude zero boundary', () => {
  assert.deepEqual(Array.from(model.unwrapLongitudeSeries([359,1,358,2])), [0,2,-1,3]);
  assert.deepEqual(Array.from(model.unwrapLongitudeSeries([])), []);
});

test('sky tracks project longitude to the right and northward latitude upward', () => {
  const bounds = {left:10, right:90, top:10, bottom:70};
  const {points} = model.projectSkyTrack([359, 361, 360], [-1, 1, 0], bounds);
  assert.deepEqual(Array.from(points, ({x, y}) => [x, y]), [[10, 70], [90, 10], [50, 40]]);
  const stationary = model.projectSkyTrack([22, 22], [0, 0], bounds);
  assert.deepEqual(Array.from(stationary.points, ({x, y}) => [x, y]), [[10, 70], [10, 70]]);
});

test('calculation windows supply complete retrograde phases and consecutive daily samples for every planet', () => {
  const reference = new Date('2026-11-17T11:00:00Z');
  for (const key of ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']) {
    const {samples, startStation, endStation, selectedIndex} = model.calculationWindow(key, reference);
    assert.ok(startStation > 0 && endStation > startStation && endStation < samples.length - 1, key);
    assert.ok(startStation >= 31 && samples.length - endStation >= 32, key);
    assert.ok(selectedIndex >= 0 && selectedIndex < samples.length - 1, key);
    assert.ok(samples[startStation - 1].motion >= 0 && samples[startStation].motion < 0, key);
    assert.ok(samples[endStation - 1].motion <= 0 && samples[endStation].motion > 0, key);
    for (let index = 1; index < samples.length; index++) {
      const first = samples[index - 1];
      const second = samples[index];
      assert.equal(second.date - first.date, 86400000, key);
      assert.ok(Math.abs(second.relativeLongitude - first.relativeLongitude - first.motion) < 1e-10, key);
    }
  }
});

test('calculation windows normalize crossings of zero and reject unsupported windows', () => {
  const reference = new Date('2027-01-01T12:00:00Z');
  const wrapped = realm.window.PLANETENUHR_RETROGRADE_MODEL.create({
    longitude:(key, date) => {
      const offset = (date - reference) / 86400000;
      return coordinates.normalizeDeg(1 + offset ** 3 / 3 - 4 * offset);
    },
    latitude:() => 0,
    signedDeg:coordinates.signedDeg
  });
  const {samples, selectedIndex} = wrapped.calculationWindow('test', reference, 8);
  assert.equal(samples[selectedIndex].date.getTime(), reference.getTime());
  assert.ok(samples[selectedIndex + 1].longitude > 350);
  assert.ok(samples[selectedIndex].motion < 0 && samples[selectedIndex].motion > -5);
  assert.equal(wrapped.calculationWindow('test', reference, 2), null);
  assert.equal(wrapped.calculationWindow('test', new Date(NaN)), null);
});

test('station sign flips retain the half-day estimate and constant drift has no station', () => {
  const reference = new Date('2026-10-27T12:00:00Z');
  const quadratic = realm.window.PLANETENUHR_RETROGRADE_MODEL.create({
    longitude:(key,date) => coordinates.normalizeDeg(((date-reference)/86400000) ** 2 * 0.1),
    latitude:() => 0,signedDeg:coordinates.signedDeg
  });
  assert.ok(quadratic.apparentDailyMotion('test',new Date(reference.getTime()-86400000)) < 0);
  assert.ok(quadratic.apparentDailyMotion('test',new Date(reference.getTime()+86400000)) > 0);
  assert.equal(quadratic.findNearestStationDate('test',reference,5).date.getTime(), reference.getTime()-43200000);
  const track = quadratic.samplePath('test',reference);
  assert.equal(track.stationMarkers.length,1);
  assert.equal(track.path.split(' ').filter(token => token.startsWith('M') || token.startsWith('L')).length,91);
  const linear = realm.window.PLANETENUHR_RETROGRADE_MODEL.create({
    longitude:(key,date) => coordinates.normalizeDeg((date-reference)/86400000),
    latitude:() => 0,signedDeg:coordinates.signedDeg
  });
  assert.equal(linear.findNearestStationDate('test',reference),null);
  assert.equal(linear.samplePath('test',reference).stationMarkers.length,0);
});

test('seasons keep existing northern-year thresholds and localized labels', () => {
  const controller = realm.window.PLANETENUHR_SEASONS.create({getTranslations:() => ({
    season_winter:'W',season_spring:'S',season_summer:'U',season_autumn:'A'
  })});
  for (const [fraction,expected] of [[0,'W'],[0.2199,'W'],[0.22,'S'],[0.47,'U'],[0.72,'A'],[0.97,'W']]) {
    assert.equal(controller.seasonNameForFraction(fraction),expected);
  }
});

test('both controllers tolerate absent cards without timers, templates or model calls', () => {
  const options = {document:{getElementById:() => null},getTranslations:() => ({})};
  const context = {date:new Date(2026,11,1),language:'de'};
  assert.doesNotThrow(() => realm.window.PLANETENUHR_SEASONS.create(options).render(context));
  assert.doesNotThrow(() => realm.window.PLANETENUHR_RETROGRADE_CARD.create(options).render(context));
});
