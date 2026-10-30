const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const rootPath = path.resolve(__dirname, '..');
const realm = vm.createContext({window:{}});
for (const file of ['js/data/planetary-systems-config.js','js/cards/planetary-systems-card.js']) {
  vm.runInContext(fs.readFileSync(path.join(rootPath, file), 'utf8'), realm, {filename:file});
}

/** Creates a small DOM fixture for the planetary-system templates.
 * @returns {object} Target, templates and inspectable rendered nodes.
 */
function createFixture(){
  const target = {
    children:[],
    replaceChildren(){this.children=[];},
    appendChild(fragment){this.children.push(...fragment.children);}
  };
  const systemTemplate = {content:{cloneNode(){
    const planet = {dataset:{},classList:{values:[],add(value){this.values.push(value);}}};
    const planetName = {dataset:{},textContent:''};
    const system = {
      children:[planet,planetName],
      insertBefore(fragment,before){
        const position = this.children.indexOf(before);
        this.children.splice(position,0,...fragment.children);
      }
    };
    const selectors = new Map([
      ['[data-planet-system]',system],
      ['[data-system-planet]',planet],
      ['[data-system-name]',planetName]
    ]);
    return {children:[system],querySelector(selector){return selectors.get(selector) || null;}};
  }}};
  const orbitTemplate = {content:{cloneNode(){
    const orbit = {style:{values:{},setProperty(name,value){this.values[name]=value;}}};
    const label = {dataset:{},textContent:''};
    const selectors = new Map([
      ['[data-planetary-orbit]',orbit],
      ['[data-planetary-moon-label]',label]
    ]);
    return {children:[orbit],querySelector(selector){return selectors.get(selector) || null;}};
  }}};
  const document = {getElementById(id){
    if (id === 'planetSystems') return target;
    if (id === 'planetSystemTemplate') return systemTemplate;
    if (id === 'planetMoonOrbitTemplate') return orbitTemplate;
    return null;
  }};
  return {document,target};
}

test('four planetary systems preserve their configured moons, orbit sizes and periods', () => {
  const systems = realm.window.PLANETENUHR_PLANETARY_SYSTEMS;
  assert.deepEqual(Array.from(systems, item => item.planet), ['mars','saturn','uranus','neptune']);
  assert.equal(systems.reduce((total,item) => total + item.moons.length,0),24);
  const fixture = createFixture();
  const controller = realm.window.PLANETENUHR_PLANETARY_SYSTEMS_CARD.create({document:fixture.document,systems});
  controller.render();
  assert.equal(fixture.target.children.length,4);
  const mars = fixture.target.children[0];
  assert.equal(mars.children.filter(node => node.style).length,2);
  assert.equal(mars.children[1].style.values['--planet-orbit-size'],'70px');
  assert.equal(mars.children[1].style.values['--planet-orbit-duration'],'5s');
  controller.render();
  assert.equal(fixture.target.children.length,4);
});

test('planetary-systems renderer tolerates missing card templates', () => {
  const controller = realm.window.PLANETENUHR_PLANETARY_SYSTEMS_CARD.create({
    document:{getElementById(){return null;}},
    systems:realm.window.PLANETENUHR_PLANETARY_SYSTEMS
  });
  assert.doesNotThrow(() => controller.render());
});
