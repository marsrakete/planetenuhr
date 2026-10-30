const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const {readDashboardSource} = require('./dashboard-source');
const root = path.resolve(__dirname, '..');
const realm = vm.createContext({window:{},getComputedStyle(node){return node.style;}});
for (const file of ['js/data/translations.js','js/shared/diagram-details.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),realm);
}
const details = realm.window.PLANETENUHR_DIAGRAM_DETAILS;

test('displayed SVG font sizes include viewBox and rotated nested transforms', () => {
  const svg = {
    querySelectorAll(){
      return [
        {textContent:'rotated',style:{fontSize:'24px',display:'inline',visibility:'visible'},getScreenCTM(){return {a:0,b:.5};}},
        {textContent:'smaller',style:{fontSize:'10px',display:'inline',visibility:'visible'},getScreenCTM(){return {a:.4,b:0};}}
      ];
    }
  };
  assert.equal(details.minimumTextSize(svg),4);
});

test('hidden, empty and detached SVG labels cannot cause spurious enlargement controls', () => {
  const svg = {
    querySelectorAll(){
      return [
        {textContent:'hidden',style:{fontSize:'1px',display:'inline',visibility:'hidden'},getScreenCTM(){return {a:1,b:0};}},
        {textContent:'removed',style:{fontSize:'1px',display:'none',visibility:'visible'},getScreenCTM(){return {a:1,b:0};}},
        {textContent:' ',style:{fontSize:'1px',display:'inline',visibility:'visible'},getScreenCTM(){return {a:1,b:0};}},
        {textContent:'detached',style:{fontSize:'1px',display:'inline',visibility:'visible'},getScreenCTM(){return null;}}
      ];
    }
  };
  assert.equal(details.minimumTextSize(svg),Infinity);
});

test('diagram controls and reading instructions are translated in all app languages', () => {
  for (const lang of ['de','en','fr']) {
    const copy = realm.window.PLANETENUHR_TRANSLATIONS[lang];
    for (const key of ['diagram_open','diagram_close','diagram_hint']) {
      assert.ok(typeof copy[key] === 'string' && copy[key].trim());
      assert.ok(!/undefined|NaN|\{\w+\}/.test(copy[key]));
    }
  }
});

/** Extracts a dashboard function for isolated date/URL contract tests.
 * @param {string} name Top-level function name in the dashboard script.
 * @returns {string} Original function source, without executing the dashboard.
 */
function dashboardFunction(name){
  const source = readDashboardSource(root);
  const start = source.indexOf('    function ' + name + '(');
  assert.ok(start >= 0, 'Function exists: ' + name);
  const end = source.indexOf('\n    }', start);
  return source.slice(start, end + 6);
}

const dates = vm.createContext({Intl, Date, URL, lang:'de', requestedCardKey:'planet_horizon',
  window:{location:{href:'http://localhost:5020/?date=20200101#test'}},
  history:{replaceState(state, title, url){this.url = url;}},
  selectedSolarDate(){return new Date(2026, 9, 21, 12);},
  selectedLocation(){return {name:'Berlin'};}
});
vm.runInContext(fs.readFileSync(path.join(root, 'js/core/date-time.js'), 'utf8'), dates);
vm.runInContext('globalThis.formatDateKey=window.PLANETENUHR_DATE_TIME.formatDateKey;', dates);
vm.runInContext(fs.readFileSync(path.join(root, 'js/core/dashboard-context.js'), 'utf8'), dates);
vm.runInContext(fs.readFileSync(path.join(root, 'js/core/card-navigation.js'), 'utf8'), dates);
vm.runInContext(`window.history=history; const cardNavigation=window.PLANETENUHR_CARD_NAVIGATION.create({document:{},window,getContext:() => ({date:selectedSolarDate(),location:selectedLocation(),language:lang}),formatDateKey:(date) => window.PLANETENUHR_DATE_TIME.formatDateKey(date)});cardNavigation.setRequestedCardKey(requestedCardKey);`, dates);
vm.runInContext('globalThis.cardNavigation=cardNavigation;', dates);
for (const name of ['formatDateStamp']) {
  vm.runInContext(dashboardFunction(name), dates);
}

test('visible dates follow all three app languages', () => {
  for (const [language, expected] of [['de','21.10.2026'], ['en','10/21/2026'], ['fr','21/10/2026']]) {
    dates.lang = language;
    assert.equal(dates.formatDateStamp(new Date('2026-10-21T12:00:00Z'), 'UTC'), expected);
  }
});

test('localized dates and stable keys respect timezone day boundaries', () => {
  dates.lang = 'de';
  const instant = new Date('2027-01-01T00:30:00Z');
  assert.equal(dates.formatDateStamp(instant, 'America/Los_Angeles'), '31.12.2026');
  assert.equal(dates.formatDateKey(instant, 'America/Los_Angeles'), '2026-12-31');
  assert.equal(dates.formatDateKey(instant, 'UTC'), '2027-01-01');
});

test('shared URLs retain YYYYMMDD across language changes and preserve place/card/hash', () => {
  for (const language of ['de', 'en', 'fr']) {
    dates.lang = language;
    dates.cardNavigation.syncUrlState();
    const url = new URL(dates.history.url, dates.window.location.href);
    assert.equal(url.searchParams.get('date'), '20261021');
    assert.equal(url.searchParams.get('lang'), language);
    assert.equal(url.searchParams.get('place'), 'Berlin');
    assert.equal(url.searchParams.get('card'), 'planet_horizon');
    assert.equal(url.hash, '#test');
  }
});
