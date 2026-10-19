const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const realm = vm.createContext({ window:{} });
for (const file of ['mnemonics-config.js', 'sky-knowledge-graphics-config.js', 'sky-knowledge.js', 'translations.js', 'card-help-config.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), realm, {filename:file});
}
const entries = realm.window.PLANETENUHR_MNEMONICS.entries;
const shuffledIds = realm.window.PLANETENUHR_KNOWLEDGE.shuffledIds;
test('31 reviewed entries have unique ids, supported categories and complete language packs', () => {
  assert.equal(entries.length, 31);
  assert.equal(new Set(entries.map(entry => entry.id)).size, 31);
  for (const [kind,count] of [['mnemonic',11],['planet',10],['star',10]]) {
    assert.equal(entries.filter(entry => entry.kind === kind).length, count);
  }
  for (const entry of entries) {
    assert.ok(entry.id);
    for (const language of ['de','en','fr']) {
      const copy = entry.texts[language];
      assert.ok(copy.title && copy.explanation, entry.id + ' ' + language);
      for (const value of Object.values(copy)) {
        assert.ok(typeof value === 'string' && value.trim());
        assert.ok(!/undefined|NaN|\{\w+\}/.test(value));
      }
      if (entry.original && entry.original.language !== language) {
        assert.ok(copy.subtitle, entry.id + ' needs a translated subtitle in ' + language);
      }
    }
    assert.ok(entry.sources.length);
    for (const source of entry.sources) {
      assert.ok(source.label);
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
    }
  }
});
test('all moon orientation rules carry visible caveats and own wording is marked separately', () => {
  for (const id of ['moon-brackets','moon-quarters-fr']) {
    const entry = entries.find(item => item.id === id);
    for (const language of ['de','en','fr']) {
      assert.ok(entry.texts[language].note);
    }
  }
  assert.equal(entries.filter(entry => entry.ownWording).length, 3);
  assert.equal(entries.find(entry => entry.id === 'planet-order-fr').original.language, 'fr');
  assert.equal(entries.find(entry => entry.id === 'galilean-moons').original.text, 'I Eat Green Carrots.');
});
test('shuffle deals every item exactly once and prevents immediate repeats across rounds', () => {
  const expected = Array.from(entries, entry => entry.id).sort();
  for (const random of [() => 0, () => 0.5, () => 0.999999]) {
    let previous = null;
    for (let round = 0; round < 4; round += 1) {
      const ids = Array.from(shuffledIds(entries, previous, random));
      assert.deepEqual([...ids].sort(), expected);
      assert.notEqual(ids[0], previous);
      previous = ids[ids.length - 1];
    }
  }
  assert.equal(shuffledIds([], null).length, 0);
  assert.deepEqual(Array.from(shuffledIds([{id:'only'}], 'only')), ['only']);
});
test('card labels and help are available in all three languages', () => {
  for (const language of ['de','en','fr']) {
    const labels = realm.window.PLANETENUHR_TRANSLATIONS[language];
    for (const key of ['title_sky_knowledge','knowledge_next','knowledge_counter','knowledge_kind_mnemonic','knowledge_kind_planet','knowledge_kind_star','knowledge_sources','knowledge_own_wording']) {
      assert.ok(labels[key], language + ' ' + key);
    }
    assert.ok(labels.knowledge_counter.includes('{current}') && labels.knowledge_counter.includes('{total}'));
    assert.ok(realm.window.PLANETENUHR_CARD_HELP[language].cards.sky_knowledge.intro.length);
  }
});


test('every entry has a template-supported teaching diagram and complete localized captions', () => {
  const config = realm.window.PLANETENUHR_KNOWLEDGE_GRAPHICS_CONFIG;
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.deepEqual(Object.keys(config.entries).sort(), Array.from(entries, entry => entry.id).sort());
  const allowedTags = ['circle', 'line', 'path', 'text', 'rect', 'ellipse'];
  const allowedAttrs = ['cx','cy','r','fill','stroke','stroke-width','stroke-dasharray','x1','y1','x2','y2','d','x','y','text-anchor','font-size','width','height','rx','ry'];
  for (const scene of Object.values(config.scenes)) {
    for (const language of ['de','en','fr']) {
      assert.ok(scene.caption[language].trim());
    }
    assert.ok(scene.shapes.length);
    for (const shape of scene.shapes) {
      assert.ok(allowedTags.includes(shape.tag));
      assert.ok(html.includes('id="knowledgeGraphic-' + shape.tag + '"'));
      for (const [name,value] of Object.entries(shape.attrs)) {
        assert.ok(allowedAttrs.includes(name), name);
        assert.ok(typeof value === 'number' || typeof value === 'string');
        if (typeof value === 'number') assert.ok(Number.isFinite(value));
      }
      if (shape.tag === 'text') {
        if (typeof shape.text === 'string') assert.ok(shape.text.trim());
        else for (const language of ['de','en','fr']) assert.ok(shape.text[language].trim());
      }
    }
  }
  for (const sceneId of Object.values(config.entries)) assert.ok(config.scenes[sceneId], sceneId);
});

test('quantitative comparisons preserve their stated scales and localized compass directions', () => {
  const scenes = realm.window.PLANETENUHR_KNOWLEDGE_GRAPHICS_CONFIG.scenes;
  const circles = scenes['jupiter-size'].shapes.filter(shape => shape.tag === 'circle');
  assert.equal(circles[1].attrs.r / circles[0].attrs.r, 11);
  const times = scenes['venus-spin'].shapes.filter(shape => shape.tag === 'rect');
  assert.equal(times[0].attrs.width / times[1].attrs.width, 243 / 225);
  const temperatures = scenes['venus-heat'].shapes.filter(shape => shape.tag === 'rect');
  assert.equal(temperatures[0].attrs.width, 430 * 0.6);
  assert.equal(temperatures[1].attrs.width, 467 * 0.6);
  const directions = scenes.compass.shapes.filter(shape => shape.tag === 'text');
  assert.equal(directions.find(shape => shape.attrs.x === 252).text.de, 'O');
  assert.equal(directions.find(shape => shape.attrs.x === 108).text.fr, 'O');
});
