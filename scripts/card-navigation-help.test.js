const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{},URL,Date,Intl});
for (const file of ['js/core/date-time.js','js/core/dashboard-context.js','js/core/card-navigation.js','js/core/card-help.js','js/data/card-help-config.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), realm);
}

test('card links retain selection, stable anchors and existing query/hash data without navigation', () => {
  let focused = false;
  const scrolled = [];
  const card = {id:'',getAttribute:() => 'moon_nodes',setAttribute(){},
    focus:options => {assert.equal(options.preventScroll, true);focused = true;},scrollIntoView:options => scrolled.push(options)};
  const updates = [];
  const browser = {location:{href:'https://example.test/planetenuhr/?extra=yes#old'},
    history:{replaceState:(state,title,url) => updates.push(url)},matchMedia:() => ({matches:true}),
    PLANETENUHR_DASHBOARD_CONTEXT:realm.window.PLANETENUHR_DASHBOARD_CONTEXT};
  const selection = {date:new Date(2026,9,27,12),location:{key:'berlin',name:'Berlin'},language:'fr'};
  const controller = realm.window.PLANETENUHR_CARD_NAVIGATION.create({window:browser,
    document:{querySelectorAll:() => [card]},getContext:() => selection,
    formatDateKey:realm.window.PLANETENUHR_DATE_TIME.formatDateKey});
  controller.applyCardAnchorIds();
  assert.equal(card.id, 'card-moon_nodes');
  assert.equal(controller.cardElementFromParameter('card-moon_nodes'), card);
  const link = new URL(controller.dailyHighlightCardUrl('moon_nodes'));
  assert.equal(link.searchParams.get('date'), '20261027');
  assert.equal(link.searchParams.get('extra'), 'yes');
  assert.equal(link.searchParams.get('place'), 'Berlin');
  assert.equal(link.searchParams.get('lang'), 'fr');
  assert.equal(link.hash, '#card-moon_nodes');
  controller.openDailyHighlightCard('moon_nodes');
  assert.equal(focused, true);
  assert.equal(scrolled[0].behavior, 'auto');
  assert.equal(new URL(updates[0], browser.location.href).hash, '#old');
  controller.applyCardAnchorIds();
  assert.equal(card.id, 'card-moon_nodes');
});

test('help retains localized Moon-node explanation and formula conversion without KaTeX', () => {
  for (const language of ['en','de','fr']) {
    const controller = realm.window.PLANETENUHR_HELP.create({window:{},document:{},
      config:realm.window.PLANETENUHR_CARD_HELP,getLanguage:() => language});
    const pack = controller.currentCardHelpPack();
    assert.ok(pack.cards.moon_nodes.markerNote.length > 50);
    const formula = controller.helpFormulaTextToLatex('Δ λ π cos φ ≈ 1°');
    assert.ok(formula.includes('\\Delta'));
    assert.ok(formula.includes('\\cos'));
    assert.ok(formula.includes('^\\circ'));
    assert.doesNotThrow(() => controller.renderHelpMathInElement({}));
  }
});

test('late KaTeX availability is detected without rebuilding help and renderer failure keeps the fallback', () => {
  const calls = [];
  const classes = new Set();
  const node = {innerHTML:'Δ ≈ 1°',classList:{add:value => classes.add(value),remove:value => classes.delete(value)}};
  const root = {querySelectorAll:() => [node]};
  const browser = {Node:{TEXT_NODE:3,ELEMENT_NODE:1}};
  const controller = realm.window.PLANETENUHR_HELP.create({window:browser,
    document:{createElement:() => ({childNodes:[{nodeType:3,textContent:'Δ ≈ 1°'}]})},
    config:{},getLanguage:() => 'en'});
  controller.renderHelpMathInElement(root);
  assert.equal(classes.size, 0);
  browser.katex = {render:(latex, target) => calls.push({latex,target})};
  controller.renderHelpMathInElement(root);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].target, node);
  assert.ok(calls[0].latex.includes('\\Delta'));
  assert.equal(classes.has('is-katex'), true);
  browser.katex.render = () => {throw new Error('parse');};
  controller.renderHelpMathInElement(root);
  assert.equal(classes.has('is-katex'), false);
  assert.equal(node.innerHTML, 'Δ ≈ 1°');
});
