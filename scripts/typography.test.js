const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const realm = vm.createContext({window:{},getComputedStyle(node){return node.style;}});
for (const file of ['translations.js','diagram-details.js']) {
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
