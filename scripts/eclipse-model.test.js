const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const root = path.resolve(__dirname, '..');
const reference = JSON.parse(fs.readFileSync(path.join(__dirname, 'baselines/solar-eclipse-models.json'), 'utf8'));
process.env.TZ = reference.timeZone;
const context = vm.createContext({window:{}, Date, Math, Intl});
for (const file of ['js/core/date-time.js','js/models/eclipse-model.js','js/models/eclipse-location-model.js','js/data/eclipse-visibility-config.js','js/data/eclipse-calendar-config.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
}
const geometry = context.window.PLANETENUHR_ECLIPSE_MODEL;
const local = context.window.PLANETENUHR_ECLIPSE_LOCATION;

test('node and season geometry preserve the pre-extraction values and center dates', () => {
  for (const sample of reference.samples) {
    const date = new Date(sample.date);
    assert.deepEqual(JSON.parse(JSON.stringify(geometry.moonNodeDistance(date))), sample.node);
    assert.deepEqual(JSON.parse(JSON.stringify(geometry.eclipseSeasonInfo(date))), sample.season);
  }
  const anchor = Date.UTC(2026, 7, 12, 18);
  const edge = anchor + 17.5 * 86400000;
  assert.equal(geometry.eclipseSeasonInfo(new Date(anchor)).active, true);
  assert.equal(geometry.eclipseSeasonInfo(new Date(edge - 1000)).active, true);
  assert.equal(geometry.eclipseSeasonInfo(new Date(edge + 1000)).active, false);
  assert.equal(geometry.moonNodeDistance(new Date(Date.UTC(2000, 0, 9))).distanceDays, 0);
});

test('all 260 curated city and fallback classifications preserve their original priority', () => {
  const visibility = context.window.PLANETENUHR_ECLIPSE_VISIBILITY;
  const calendar = context.window.PLANETENUHR_ECLIPSE_CALENDAR_DATA;
  const unchanged = JSON.stringify({visibility,calendar});
  assert.equal(reference.visibility.length, 260);
  for (const sample of reference.visibility) {
    const result = local.eclipseVisibilityForLocation(sample.date, sample.location, visibility, calendar);
    assert.equal(result.status, sample.status);
    assert.equal(result.source, sample.source);
  }
  assert.equal(JSON.stringify({visibility,calendar}), unchanged);
  const day = '2026-08-12';
  const manual = [{date:day, defaultVisibility:'not_visible', cityVisibilityByKey:{berlin:'partial'}}];
  const fallback = [{date:day, kind:'solar', type:'total', regions:'Europe'}];
  assert.equal(local.eclipseVisibilityForLocation(day, {key:'berlin'}, manual, fallback).status, 'partial');
  assert.equal(local.eclipseVisibilityForLocation(day, {key:'tokyo'}, manual, fallback).status, 'not_visible');
  assert.equal(local.eclipseVisibilityForLocation(day, {key:'berlin'}, [], fallback).status, 'partial');
  assert.equal(local.eclipseVisibilityForLocation(day, null, manual, fallback), null);
  assert.equal(local.eclipseVisibilityForLocation('1900-01-01', {key:'berlin'}, manual, fallback), null);
});

test('phase profiles and local timing conversion retain explicit-city fallback behavior', () => {
  const profiles = {profiles:{central_europe:[{time:'20:00'}],europe:[{time:'19:00'}]}};
  assert.equal(local.eclipsePhasesForLocationProfile(profiles, {key:'berlin'}), profiles.profiles.central_europe);
  assert.equal(local.eclipsePhasesForLocationProfile(profiles, {key:'tokyo'}), profiles.profiles.europe);
  const only = {profiles:{other:[{time:'18:00'}]}};
  assert.equal(local.eclipsePhasesForLocationProfile(only, {key:'berlin'}), only.profiles.other);
  const date = new Date('2026-08-12T12:00:00Z');
  assert.equal(local.eclipsePhaseLocalDate(date, {key:'berlin'}, '20:00').toISOString(), '2026-08-12T18:00:00.000Z');
  assert.equal(local.eclipsePhaseLocalDate(date, {key:'tokyo'}, '12:00').toISOString(), '2026-08-12T03:00:00.000Z');
  assert.equal(local.eclipsePhaseLocalDate(date, {key:'berlin'}, 'invalid'), null);
  assert.equal(local.eclipseVisibilityIsPreviewable('partial_low'), true);
  assert.equal(local.eclipseVisibilityIsPreviewable('not_visible'), false);
});
