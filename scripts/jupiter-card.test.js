const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const rootPath = path.resolve(__dirname, '..');
const realm = vm.createContext({window:{}});
for (const file of ['js/data/jupiter-moons-config.js','js/cards/jupiter-card.js']) {
  vm.runInContext(fs.readFileSync(path.join(rootPath, file), 'utf8'), realm, {filename:file});
}

/** Creates a small DOM fixture that supports the Jupiter orbit template.
 * @returns {object} Document, Jupiter root and inspectable cloned orbit nodes.
 */
function createFixture(){
  const planet = {className:'jupiter'};
  const system = {
    children:[planet],
    querySelectorAll(){return this.children.filter(child => child.dataset && child.dataset.jupiterOrbit === 'true');},
    appendChild(fragment){
      const nodes = fragment.isFragment ? fragment.children : [fragment];
      for (const node of nodes) {
        node.parent = this;
        this.children.push(node);
      }
    }
  };
  const template = {
    content:{
      cloneNode(){
        const orbit = {
          dataset:{jupiterOrbit:'true'},
          remove(){if(this.parent){this.parent.children=this.parent.children.filter(node => node !== this);}},
          style:{values:{},setProperty(name,value){this.values[name]=value;}},
          classList:{add(name){this.value=name;}}
        };
        const moon = {dataset:{},classList:{value:'',add(name){this.value=name;}}};
        const label = {dataset:{},textContent:''};
        const selectors = new Map([
          ['[data-jupiter-orbit]',orbit],
          ['[data-jupiter-moon]',moon],
          ['[data-jupiter-label]',label]
        ]);
        return {isFragment:true,children:[orbit],querySelector(selector){return selectors.get(selector) || null;}};
      }
    }
  };
  const document = {getElementById(id){
    if (id === 'jupiterSystem') return system;
    if (id === 'jupiterOrbitTemplate') return template;
    return null;
  }};
  return {document,system,planet};
}

test('Jupiter orbit configuration renders ten localized, idempotent template rows', () => {
  const fixture = createFixture();
  const controller = realm.window.PLANETENUHR_JUPITER_CARD.create({
    document:fixture.document,
    moons:realm.window.PLANETENUHR_JUPITER_MOONS
  });
  controller.render();
  let orbits = fixture.system.querySelectorAll('[data-jupiter-orbit]');
  assert.equal(orbits.length,10);
  assert.equal(orbits[0].style.values['--jupiter-orbit-size'],'90px');
  assert.equal(orbits[0].style.values['--jupiter-orbit-duration'],'3.55s');
  controller.render();
  orbits = fixture.system.querySelectorAll('[data-jupiter-orbit]');
  assert.equal(orbits.length,10);
  assert.equal(fixture.system.children[0],fixture.planet);
});

test('Jupiter card tolerates absent template or root', () => {
  const controller = realm.window.PLANETENUHR_JUPITER_CARD.create({
    document:{getElementById(){return null;}},
    moons:realm.window.PLANETENUHR_JUPITER_MOONS
  });
  assert.doesNotThrow(() => controller.render());
});
