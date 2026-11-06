const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const root = path.resolve(__dirname, '..');
const reference = JSON.parse(fs.readFileSync(path.join(__dirname, 'baselines/moon-direction-model.json'), 'utf8'));
process.env.TZ = reference.timeZone;
const realm = vm.createContext({window:{},Date,Math,Intl});
for (const file of [
  'js/data/translations.js','js/core/observation-format.js','js/core/date-time.js',
  'js/data/locations-config.js','js/models/astronomy-coordinates.js','js/data/planet-elements-config.js',
  'js/models/planet-model.js','js/models/moon-model.js','js/models/solar-visibility-model.js',
  'js/models/eclipse-model.js','js/models/eclipse-location-model.js','js/data/eclipse-visibility-config.js',
  'js/data/eclipse-calendar-config.js','js/data/eclipse-phase-config.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), realm, {filename:file});
}
const api = realm.window;
const dates = api.PLANETENUHR_DATE_TIME;
const local = api.PLANETENUHR_ECLIPSE_LOCATION;
const coordinates = api.PLANETENUHR_COORDINATES;
const options = {
  coordinates, dateTime:dates, eclipse:api.PLANETENUHR_ECLIPSE_MODEL, eclipseLocation:local,
  phases:api.PLANETENUHR_ECLIPSE_PHASES,
  getVisibility:(date, location) => local.eclipseVisibilityForLocation(dates.formatDateKey(date), location, api.PLANETENUHR_ECLIPSE_VISIBILITY, api.PLANETENUHR_ECLIPSE_CALENDAR_DATA),
  getLongitude:date => coordinates.normalizeDeg(api.PLANETENUHR_SOLAR_VISIBILITY.sunLongitude(date) + api.PLANETENUHR_MOON_MODEL.computeMoon(date).frac * 360),
  solarCoordinates:api.PLANETENUHR_SOLAR_VISIBILITY.solarEquatorialCoordinates
};
const observer = api.PLANETENUHR_MOON_MODEL.createObserver(options);

/** Creates the shared formatter with one central language pack.
 * @param {string} language App language. @returns {object} Shared Moon display adapter.
 */
function directionView(language){
  return api.PLANETENUHR_OBSERVATION_FORMAT.createMoonDirection({observer,getTranslations:() => api.PLANETENUHR_TRANSLATIONS[language]});
}

test('shared Moon API preserves 45 pre-extraction direction, reference-time and label cases', () => {
  for (const sample of reference.samples) {
    const date = new Date(sample.iso);
    const location = api.PLANETENUHR_LOCATIONS.find(city => city.key === sample.key);
    const view = directionView(sample.language);
    assert.deepEqual(JSON.parse(JSON.stringify(view.lookDirection(date, location))), sample.direction);
    assert.equal(view.referenceDate(date, location).toISOString(), sample.reference);
    assert.equal(view.directionLabel(date, location), sample.label);
  }
});

test('Moon direction contracts handle missing and invalid instants without model calls', () => {
  const view = directionView('en');
  const location = {latitude:0,longitude:0};
  for (const date of [null,new Date(NaN)]) {
    assert.equal(observer.moonDirection(date, location), null);
    assert.equal(view.lookDirection(date, location), null);
    assert.equal(observer.isEclipseDay(date, location), false);
    assert.equal(observer.upcomingPreview(date, location), null);
  }
  assert.equal(view.lookDirection(new Date(), null), null);
  assert.equal(view.previewLookDirection(null, location, null), null);
  assert.equal(view.previewLookDirection({}, location, {time:null}), null);
});

test('preview model uses solar coordinates for solar events and sunsets, lunar coordinates otherwise', () => {
  const instant = new Date('2026-08-12T12:00:00Z');
  const location = {latitude:0,longitude:0};
  const calls = [];
  const model = api.PLANETENUHR_MOON_MODEL.createObserver({
    ...options,
    coordinates:{...coordinates,horizontalCoordinates:(date, city, equatorial) => {calls.push(equatorial);return {azimuthDeg:90,altitudeDeg:0};}},
    solarCoordinates:() => ({source:'sun'}),
    eclipseLocation:{...local,eclipsePhaseLocalDate:() => instant}
  });
  for (const [kind,rowKind] of [['solar','maximum'],['lunar','sunset']]) {
    model.previewDirection({eventDate:instant,phaseEntry:{kind}},location,{kind:rowKind,time:'12:00'});
    assert.equal(calls.pop().source, 'sun');
  }
  model.previewDirection({eventDate:instant,phaseEntry:{kind:'lunar'}},location,{kind:'maximum',time:'12:00'});
  assert.ok(Number.isFinite(calls.pop().rightAscensionDeg));
});

test('preview selection includes today and ten days ahead, excludes past and more distant events', () => {
  const date = new Date(2026,7,12,12);
  const location = {key:'berlin'};
  for (const [offset,expected] of [[-1,false],[0,true],[10,true],[11,false]]) {
    const event = new Date(date);
    event.setDate(event.getDate() + offset);
    const model = api.PLANETENUHR_MOON_MODEL.createObserver({
      ...options,phases:[{date:dates.formatDateKey(event)}],getVisibility:() => ({status:'total'}),
      eclipseLocation:{...local,eclipsePhasesForLocationProfile:() => [{kind:'maximum',time:'12:00'}]}
    });
    assert.equal(Boolean(model.upcomingPreview(date, location)), expected);
    assert.equal(model.isEclipseDay(date, location), offset === 0);
  }
});

test('shared horizon formatting retains zero, positive and negative altitude rules in all languages', () => {
  const format = api.PLANETENUHR_OBSERVATION_FORMAT;
  for (const language of ['de','en','fr']) {
    const pack = api.PLANETENUHR_TRANSLATIONS[language];
    assert.equal(format.skyDirection(null, pack), null);
    assert.equal(format.skyDirection({azimuthDeg:NaN,altitudeDeg:1}, pack), null);
    assert.equal(format.compassLabelForAzimuth(Infinity, pack), '');
    for (const altitudeDeg of [-3,0,3,45]) {
      const result = format.skyDirection({azimuthDeg:90,altitudeDeg}, pack);
      assert.equal(result.directionLabel, pack.observation_compass_labels[4]);
      assert.equal(result.altitudeDeg, altitudeDeg);
      assert.equal(result.subText, result.altitudeText);
      assert.ok(result.altitudeText.includes(altitudeDeg >= 0 ? pack.eclipse_preview_above_horizon : pack.eclipse_preview_below_horizon));
    }
  }
});
