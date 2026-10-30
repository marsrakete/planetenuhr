const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const context = vm.createContext({window:{}, Intl, Date, Math, Number});
for (const file of ['js/core/date-time.js', 'js/core/observation-format.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
}
const dates = context.window.PLANETENUHR_DATE_TIME;
const observation = context.window.PLANETENUHR_OBSERVATION_FORMAT;

test('date module accepts explicit locale and zone across calendar and DST boundaries', () => {
  const instant = new Date('2027-01-01T00:30:00Z');
  assert.equal(dates.formatDateStamp(instant, 'America/Los_Angeles', 'de'), '31.12.2026');
  assert.equal(dates.formatDateStamp(instant, 'UTC', 'en'), '01/01/2027');
  assert.equal(dates.formatDateKey(instant, 'Asia/Tokyo'), '2027-01-01');
  assert.equal(dates.locationTimeZoneId({key:'tokyo'}), 'Asia/Tokyo');
  assert.equal(dates.timeZoneOffsetMinutesAt(new Date('2026-03-29T00:30:00Z'), 'Europe/Berlin'), 60);
  assert.equal(dates.timeZoneOffsetMinutesAt(new Date('2026-03-29T01:30:00Z'), 'Europe/Berlin'), 120);
  assert.equal(dates.timeZoneOffsetMinutesAt(new Date('2026-10-25T00:30:00Z'), 'Europe/Berlin'), 120);
  assert.equal(dates.timeZoneOffsetMinutesAt(new Date('2026-10-25T01:30:00Z'), 'Europe/Berlin'), 60);
  assert.equal(dates.parseTimeZoneOffsetMinutes('UTC-05:30'), -330);
});

test('local date-key parsing rejects rollover and calendar-day distance ignores clock time', () => {
  const leapDay = dates.parseLocalDateKey('2024-02-29');
  assert.equal(leapDay.getHours(), 12);
  assert.equal(dates.formatDateKey(leapDay), '2024-02-29');
  assert.equal(dates.parseLocalDateKey('2023-02-29'), null);
  assert.equal(dates.parseLocalDateKey('2026-13-01'), null);
  const morning = new Date(2026, 9, 27, 1);
  const evening = new Date(2026, 9, 27, 23);
  const nextDay = new Date(2026, 9, 28, 0, 1);
  assert.equal(dates.calendarDayDifference(morning, evening), 0);
  assert.equal(dates.calendarDayDifference(morning, nextDay), 1);
  assert.equal(dates.calendarDayDifference(nextDay, morning), -1);
});

test('compass and angular estimates use the supplied language and preserve thresholds', () => {
  assert.equal(observation.compassLabelForAzimuth(90, 'de'), 'O');
  assert.equal(observation.compassLabelForAzimuth(90, 'en'), 'E');
  assert.equal(observation.compassLabelForAzimuth(270, 'fr'), 'O');
  assert.equal(observation.compassLabelForAzimuth(-90, 'de'), 'W');
  for (const language of ['de','en','fr']) {
    assert.equal(observation.altitudeThumbEstimate(0, language), '');
    assert.equal(observation.altitudeThumbEstimate(NaN, language), '');
    for (const boundary of [3, 6, 8, 15, 28, 45]) {
      assert.notEqual(observation.altitudeThumbEstimate(boundary - 0.01, language), observation.altitudeThumbEstimate(boundary, language));
    }
  }
});
