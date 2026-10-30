const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{}});
for (const file of ['js/data/card-sizes-config.js','js/core/card-sizes.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), realm);
}

/** Creates retained cards and observable persistence around the real size controller.
 * @param {string|null} initial Initial persisted JSON. @returns {object} Controller and test state.
 */
function fixture(initial = null){
  const storage = new Map();
  const key = 'planetenuhr-card-sizes-v1';
  if (initial !== null) storage.set(key, initial);
  const cards = ['solar_system','earth_moon','calendar'].map(name => {
    const attrs = {'data-help-key':name};
    const classes = new Set();
    if (name === 'solar_system') classes.add('wide-card');
    return {attrs,classList:{contains:value => classes.has(value),add:value => classes.add(value)},
      getAttribute:value => attrs[value],setAttribute:(name, value) => {attrs[name] = value;},querySelector:() => null};
  });
  let renders = 0;
  let outsideListeners = 0;
  const browser = {localStorage:{getItem:key => storage.get(key),setItem:(key,value) => storage.set(key,value)},matchMedia:() => ({matches:false})};
  const create = () => realm.window.PLANETENUHR_CARD_SIZES.create({window:browser,
    document:{querySelectorAll:() => cards,getElementById:() => null,addEventListener(){outsideListeners += 1;}},
    config:realm.window.PLANETENUHR_CARD_SIZES_CONFIG,getTranslations:() => ({}),normalizeCardToken:value => value || '',
    cloneTemplate:() => null,layout:{renderWithViewportAnchor:action => action(),runWithDeferredMasonryLayout:action => action()},
    rerender(){renders += 1;}
  });
  return {controller:create(),create,browser,cards,storage,key,getRenders:() => renders,getListeners:() => outsideListeners};
}

test('existing storage key and default sizes survive single-card and global updates and reload', () => {
  const f = fixture();
  f.controller.initCardSizeControls();
  f.controller.initCardSizeControls();
  assert.equal(f.getListeners(), 1);
  assert.equal(f.cards[0].attrs['data-card-size'], 'wide');
  assert.equal(f.cards[1].attrs['data-card-size'], 'wide');
  assert.equal(f.cards[2].attrs['data-card-size'], 'normal');
  f.controller.setDashboardCardSize(f.cards[2], 'large');
  assert.equal(JSON.parse(f.storage.get(f.key)).calendar, 'large');
  assert.equal(f.getRenders(), 1);
  f.controller.setDashboardCardSize(f.cards[2], 'large');
  assert.equal(f.getRenders(), 1);
  f.controller.setAllDashboardCardSizes('normal');
  assert.ok(f.cards.every(card => card.attrs['data-card-size'] === 'normal'));
  const reloaded = f.create();
  reloaded.initCardSizeControls();
  assert.equal(reloaded.sharedDashboardCardSize(), 'normal');
});

test('malformed storage, unsupported tokens and blocked storage cannot break size resolution', () => {
  for (const value of ['invalid', '[]', 'null', '{"calendar":"unsupported"}']) {
    const f = fixture(value);
    f.controller.initCardSizeControls();
    assert.equal(f.controller.effectiveCardSize(f.cards[2]), 'normal');
    f.controller.setAllDashboardCardSizes('invalid');
    assert.equal(f.getRenders(), 0);
  }
  const f = fixture();
  Object.defineProperty(f.browser, 'localStorage', {get(){throw new Error('blocked');}});
  assert.doesNotThrow(() => f.controller.initCardSizeControls());
  assert.doesNotThrow(() => f.controller.setDashboardCardSize(f.cards[2], 'large'));
});
