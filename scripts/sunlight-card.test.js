const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({window:{}, Date, Math});
vm.runInContext(fs.readFileSync(path.join(root, 'js/cards/sunlight-card.js'), 'utf8'), context);

/** Creates the existing daylight timeline nodes used by the card controller.
 * @returns {{document:object,elements:Map<string,object>}} Fake DOM surface for controller checks.
 */
function createDocument(){
  const elements = new Map();
  const ids = [
    'titleSunlight', 'sunriseTime', 'sunsetTime', 'dayLength', 'dawnTime', 'duskTime',
    'dayNightDawnMarker', 'dayNightSunriseMarker', 'dayNightSunsetMarker', 'dayNightDuskMarker',
    'dayNightNowMarker', 'lightDaySegment', 'blueMorningSegment', 'goldenMorningSegment',
    'goldenEveningSegment', 'blueEveningSegment', 'lightHourNowMarker'
  ];
  ids.forEach(id => {
    elements.set(id, {textContent:'', style:{}, attributes:{}, setAttribute(name, value){this.attributes[name] = value;}});
  });
  return {document:{getElementById:id => elements.get(id) || null}, elements};
}

/** Creates local solar event values at stable clock times for a selected date.
 * @param {Date} date Base calendar date.
 * @param {boolean} [missing=false] Whether all solar events should be absent.
 * @returns {{solarEventUtc:Function,calls:Array<object>}} Solar model stub and call log.
 */
function createSolarVisibility(date, missing = false){
  const calls = [];
  const solarEventUtc = (selectedDate, latitude, longitude, zenith, isRise) => {
    calls.push({selectedDate, latitude, longitude, zenith, isRise});
    if (missing) {
      return null;
    }
    let hour = 12;
    if (zenith === 90.833) {
      if (isRise) hour = 6;
      else hour = 18;
    } else if (zenith === 96) {
      if (isRise) hour = 4;
      else hour = 20;
    } else if (zenith === 84) {
      if (isRise) hour = 7;
      else hour = 17;
    }
    const result = new Date(date);
    result.setHours(hour, 0, 0, 0);
    return result;
  };
  return {solarEventUtc, calls};
}

/** Creates a controller with the supplied model and fake DOM.
 * @param {object} solarVisibility Solar event provider.
 * @param {object} document Fake DOM document.
 * @returns {object} Daylight controller.
 */
function createController(solarVisibility, document){
  const translations = {
    title_sunlight:'Day & night', hours_short:'h', minutes_short:'min', light_day:'Daylight',
    blue_hour:'Blue hour', light_morning:'morning', golden_hour:'Golden hour', light_evening:'evening'
  };
  const formatTime = date => {
    if (!date) {
      return '-';
    }
    return date.toTimeString().slice(0, 5);
  };
  return context.window.PLANETENUHR_SUNLIGHT_CARD.create({
    document, solarVisibility, getTranslations:() => translations, formatTime
  });
}

test('daylight card positions solar times and accessible segments for the selected day and place', () => {
  const date = new Date(2026, 5, 21, 12);
  const location = {name:'Berlin', latitude:52.5, longitude:13.4};
  const fake = createDocument();
  const solar = createSolarVisibility(date);
  const controller = createController(solar, fake.document);
  controller.render({date, location});

  assert.equal(solar.calls.length, 6);
  assert.ok(solar.calls.every(call => call.selectedDate === date && call.latitude === 52.5 && call.longitude === 13.4));
  assert.equal(fake.elements.get('titleSunlight').textContent, 'Day & night Berlin');
  assert.equal(fake.elements.get('sunriseTime').textContent, '06:00');
  assert.equal(fake.elements.get('sunsetTime').textContent, '18:00');
  assert.equal(fake.elements.get('dayLength').textContent, '12 h 00 min');
  assert.equal(fake.elements.get('dayNightNowMarker').style.left, '50%');
  assert.equal(fake.elements.get('lightDaySegment').style.left, '25%');
  assert.equal(fake.elements.get('lightDaySegment').style.width, '50%');
  assert.equal(fake.elements.get('lightDaySegment').attributes['aria-label'], 'Daylight: 06:00-18:00');
});

test('missing polar solar events keep the duration empty and do not invent segments', () => {
  const date = new Date(2026, 5, 21, 12);
  const fake = createDocument();
  const solar = createSolarVisibility(date, true);
  const controller = createController(solar, fake.document);
  controller.render({date, location:{name:'Tromsø', latitude:69.6, longitude:18.9}});

  assert.equal(fake.elements.get('sunriseTime').textContent, '-');
  assert.equal(fake.elements.get('dayLength').textContent, '-');
  assert.equal(fake.elements.get('lightDaySegment').style.width, undefined);
  assert.equal(fake.elements.get('lightDaySegment').attributes['aria-label'], undefined);
});
