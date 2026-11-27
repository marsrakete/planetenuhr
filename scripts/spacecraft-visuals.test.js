const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');

test('spacecraft artwork resolves to local SVG symbols and retains its node across changes', () => {
  const context = vm.createContext({window:{}});
  for (const file of ['js/data/space-missions.js','js/shared/spacecraft-visuals.js']) {
    vm.runInContext(fs.readFileSync(file,'utf8'),context);
  }
  const {PLANETENUHR_SPACECRAFT_VISUALS:visuals,PLANETENUHR_SPACE_MISSION_DATA:missions,
    PLANETENUHR_OUTER_MISSION_DATA:outer} = context.window;
  const sprite = fs.readFileSync('assets/images/spacecraft.svg','utf8');
  const symbolKeys = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(match => match[1]));
  const svgAttributes = new Map();
  const useAttributes = new Map();
  const svg = {
    classList:{contains:className => className === 'spacecraft-artwork'},dataset:{},
    setAttribute:(name,value) => svgAttributes.set(name,String(value)),
    getAttribute:name => svgAttributes.get(name),
    querySelector:() => ({setAttribute:(name,value) => useAttributes.set(name,value)})
  };
  const host = {
    ownerDocument:{
      querySelector:() => ({content:'1.0'}),
      getElementById:() => ({content:{firstElementChild:{cloneNode:() => svg}}})
    },
    replaceChildren(node) {
      assert.equal(this.firstElementChild,undefined,'Mount replaces the host only once');
      this.firstElementChild = node;
    }
  };
  for (const key of [...missions,...outer].map(mission => mission.id).concat('mmx','idefix','mpo','mio')) {
    assert.equal(visuals.mount(host,key,24),svg);
    assert.ok(symbolKeys.has(svg.dataset.spacecraft),key);
    assert.equal(useAttributes.get('href'),'assets/images/spacecraft.svg?v=1.0#' + svg.dataset.spacecraft);
  }
  assert.equal(visuals.mount(host,'voyager2',42),svg);
  assert.equal(svg.dataset.spacecraft,'voyager');
  assert.deepEqual([...svgAttributes],[['width','42'],['height','42'],['x','-21'],['y','-21']]);
});
