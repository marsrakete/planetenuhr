const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{}, Intl});
for (const file of ['js/data/constellation-descriptions.js', 'js/data/constellation-visibility-config.js', 'js/shared/constellation-details.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), realm, {filename:file});
}
const config = realm.window.PLANETENUHR_CONSTELLATION_DESCRIPTIONS;

test('every visibility entry has one complete localized profile and source links', () => {
  const entries = realm.window.PLANETENUHR_CONSTELLATION_VISIBILITY.constellations;
  assert.equal(entries.length, 49);
  assert.equal(Object.keys(config.entries).length, 49);
  for (const item of entries) {
    const key = item.figureKey || item.key;
    const profile = config.entries[key];
    assert.ok(profile, key);
    assert.ok(Number.isFinite(profile.area) && profile.area > 0, key);
    for (const language of ['de', 'en', 'fr']) {
      assert.ok(profile.names[language], key);
      for (const field of ['intro', 'location', 'season', 'brightest', 'highlights', 'mythology']) {
        assert.ok(profile.text[language][field].trim().length > 8, key + ' ' + language + ' ' + field);
      }
    }
    assert.ok(profile.sources.length >= 2, key);
    for (const source of profile.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
    }
  }
});

test('shared renderer clears unknown profiles and handles absent targets or templates', () => {
  const renderer = realm.window.PLANETENUHR_CONSTELLATION_DETAILS.create({
    document:{getElementById:() => null}, config
  });
  let clears = 0;
  const target = {replaceChildren:() => {clears += 1;}};
  assert.equal(renderer.render(null, 'Orion', 'de'), false);
  assert.equal(renderer.render(target, 'missing', 'de'), false);
  assert.equal(renderer.render(target, 'Orion', 'unknown'), false);
  assert.equal(clears, 2);
});

test('constellation titles show distinct localized and Latin names with safe fallbacks', () => {
  const renderer = realm.window.PLANETENUHR_CONSTELLATION_DETAILS.create({document:{}, config});
  assert.equal(renderer.titleFor('Gemini', 'de'), 'Zwillinge (Gemini)');
  assert.equal(renderer.titleFor('Gemini', 'fr'), 'Gémeaux (Gemini)');
  assert.equal(renderer.titleFor('Gemini', 'en'), 'Gemini');
  assert.equal(renderer.titleFor('Orion', 'de'), 'Orion');
  assert.equal(renderer.titleFor('Bootes', 'de'), 'Bärenhüter (Boötes)');
  assert.equal(renderer.titleFor('Gemini', 'unknown'), 'Gemini');
  assert.equal(renderer.titleFor('missing', 'de', 'Fallback'), 'Fallback');
});
