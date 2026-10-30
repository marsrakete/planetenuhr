const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({window:{}, Date, Math});
vm.runInContext(fs.readFileSync(path.join(root, 'js/cards/planet-visibility.js'), 'utf8'), context);

/** Creates a node-shaped test double with named child selectors.
 * @param {Map<string,object>} [selectors] Selector-to-child map.
 * @returns {object} Minimal DOM node used by card rendering.
 */
function createNode(selectors = new Map()){
  return {
    selectors,
    style:{},
    attributes:{},
    children:[],
    className:'',
    textContent:'',
    appendChild(child){this.children.push(child);},
    setAttribute(name, value){this.attributes[name] = value;},
    querySelector(selector){return this.selectors.get(selector) || null;}
  };
}

/** Creates a reusable template double whose clone callback builds fresh nodes.
 * @param {Function} cloneFactory Creates one cloned fragment.
 * @returns {object} Template-compatible object.
 */
function createTemplate(cloneFactory){
  return {content:{cloneNode:cloneFactory}};
}

/** Creates card targets and templates expected by the visibility controller.
 * @returns {{document:object,elements:Map<string,object>}} Fake document and inspectable elements.
 */
function createDocument(){
  const elements = new Map();
  elements.set('visibilityList', createNode());
  elements.set('visibilityLegend', createNode());
  elements.set('nightVisibilityPanel', createNode());
  elements.set('nightVisibilityHeaderTemplate', createTemplate(() => {
    const place = createNode();
    const dusk = createNode();
    const dawn = createNode();
    return createNode(new Map([
      ['[data-night-place]', place], ['[data-night-dusk]', dusk], ['[data-night-dawn]', dawn]
    ]));
  }));
  elements.set('nightVisibilityRowTemplate', createTemplate(() => {
    const name = createNode();
    const track = createNode();
    const best = createNode();
    const row = createNode(new Map([
      ['[data-night-name]', name], ['[data-night-track]', track], ['[data-night-best]', best]
    ]));
    return createNode(new Map([['.night-row-wrap', row]]));
  }));
  elements.set('visibilityRowTemplate', createTemplate(() => {
    const name = createNode();
    const fill = createNode();
    const note = createNode();
    const detail = createNode();
    return createNode(new Map([
      ['[data-visibility-name]', name], ['[data-visibility-fill]', fill],
      ['[data-visibility-note]', note], ['[data-visibility-night-detail]', detail]
    ]));
  }));
  const document = {
    getElementById(id){return elements.get(id) || null;},
    createElement(){return createNode();}
  };
  return {document, elements};
}

/** Creates a controller with deterministic astronomy and text adapters.
 * @param {object} document Fake document.
 * @param {Array<object>} modelCalls Receives model inputs.
 * @returns {object} Visibility card controller.
 */
function createController(document, modelCalls){
  const translations = {
    visibility_legend_prefix:'Approximate for', visibility_legend_suffix:'based on elongation',
    legend_night_visibility:'night estimates', visibility_difficult:'Difficult',
    visibility_evening:'Evening', visibility_morning:'Morning', visibility_night:'Night',
    visibility_best:'Best around', visibility_night_empty:'Not visible in darkness',
    planet_mercury:'Mercury', planet_venus:'Venus', planet_mars:'Mars',
    planet_jupiter:'Jupiter', planet_saturn:'Saturn'
  };
  const elongations = {mercury:8, venus:45, mars:-30, jupiter:130, saturn:-150};
  const solarVisibility = {
    sunLongitude(){return 0;},
    nightVisibilitySegments(date, location, elongation){
      modelCalls.push({date, location, elongation});
      const dusk = new Date(date);
      dusk.setHours(18, 0, 0, 0);
      const dawn = new Date(date);
      dawn.setHours(6, 0, 0, 0);
      return {
        durationHours:12,
        dusk,
        dawn,
        segments:[{start:dusk.getTime() + 3600000, end:dusk.getTime() + 7200000}],
        bestTime:new Date(dusk.getTime() + 5400000)
      };
    }
  };
  return context.window.PLANETENUHR_PLANET_VISIBILITY_CARD.create({
    document,
    solarVisibility,
    signedDegrees:value => value,
    getEclipticLongitude:key => elongations[key],
    getSolarElongation:key => elongations[key],
    getBodyDisplayName:key => key.charAt(0).toUpperCase() + key.slice(1),
    getTranslations:() => translations,
    formatTime:date => date.toTimeString().slice(0, 5)
  });
}

test('visibility renderers use the shared date/place, localized labels and template rows', () => {
  const date = new Date(2026, 9, 27, 12);
  const location = {name:'Berlin'};
  const fake = createDocument();
  const modelCalls = [];
  const controller = createController(fake.document, modelCalls);
  const sharedContext = {date, location};
  controller.renderVisibility(sharedContext);
  controller.renderNightVisibility(sharedContext);

  const visibilityRows = fake.elements.get('visibilityList').children;
  assert.equal(visibilityRows.length, 5);
  assert.equal(visibilityRows[0].querySelector('[data-visibility-name]').textContent, 'Mercury');
  assert.equal(visibilityRows[0].querySelector('[data-visibility-note]').textContent, 'Difficult');
  assert.equal(visibilityRows[1].querySelector('[data-visibility-note]').textContent, 'Evening');
  assert.equal(visibilityRows[3].querySelector('[data-visibility-note]').textContent, 'Night');
  assert.equal(visibilityRows[1].querySelector('[data-visibility-fill]').style.left, '62%');
  assert.equal(visibilityRows[1].querySelector('[data-visibility-night-detail]').textContent, '19:00-20:00 · Best around 19:30');
  assert.equal(fake.elements.get('visibilityLegend').textContent, 'Approximate for Berlin; based on elongation · night estimates');
  assert.equal(fake.elements.get('nightVisibilityPanel').children.length, 6);
  assert.equal(modelCalls.length, 11);
  assert.ok(modelCalls.every(call => call.date === date && call.location === location));
});

test('missing visibility targets are tolerated without running astronomy calculations', () => {
  const modelCalls = [];
  const controller = createController({getElementById(){return null;}}, modelCalls);
  controller.renderVisibility({date:new Date(), location:{name:'Nowhere'}});
  controller.renderNightVisibility({date:new Date(), location:{name:'Nowhere'}});
  assert.equal(modelCalls.length, 0);
});
