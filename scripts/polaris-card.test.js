const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({window:{PLANETENUHR_COORDINATES:{
  localSiderealAngleDegrees(date, longitude){return longitude + date.getUTCDate();}
}}, Date, Math});
vm.runInContext(fs.readFileSync(path.join(root, 'js/cards/polaris-card.js'), 'utf8'), context);

/** Creates a simple SVG/DOM node that records attributes and child elements.
 * @param {string} tag Element tag name.
 * @returns {object} Inspectable fake DOM node.
 */
function createNode(tag){
  return {
    tag,
    attributes:{},
    children:[],
    textContent:'',
    setAttribute(name, value){this.attributes[name] = String(value);},
    appendChild(child){this.children.push(child);}
  };
}

/** Creates a Polaris controller with a selected location and observable summary.
 * @param {object} location Current city and latitude/longitude.
 * @returns {{controller:object,target:object,summary:object}} Controller and output nodes.
 */
function createController(location){
  const target = createNode('div');
  const summary = createNode('div');
  const document = {
    getElementById(id){
      if (id === 'polarisMap') return target;
      if (id === 'polarisSummary') return summary;
      return null;
    },
    createElementNS(namespace, tag){return createNode(tag);}
  };
  const translations = {
    polaris_aria:'North sky', polaris_zenith:'Zenith', polaris_name:'Polaris',
    polaris_ncp:'North celestial pole', polaris_asterism_label:'Ursa Minor',
    polaris_summary:'Polaris is near the pole.', polaris_constellation:'Constellation',
    polaris_constellation_value:'Ursa Minor', polaris_location:'Location', polaris_latitude:'Latitude',
    polaris_altitude:'Polaris altitude', polaris_motion:'Nightly motion',
    polaris_motion_value:'Stars circle the pole.', polaris_below_horizon:'Below the horizon', today:'Date'
  };
  const controller = context.window.PLANETENUHR_POLARIS_CARD.create({
    document,
    window:context.window,
    getTranslations:() => translations,
    formatDate:date => date.toISOString().slice(0, 10),
    formatTime:date => date.toISOString().slice(11, 16),
    appendSummaryText:(node, text) => node.children.push(text),
    appendSummaryLine:(node, label, value) => node.children.push(label + value),
  });
  return {controller, target, summary};
}

test('north-sky card projects the pole from latitude and reports the selected date/location', () => {
  const location = {name:'Berlin', latitude:52.5, longitude:13.4};
  const result = createController(location);
  const date = new Date('2026-10-27T12:00:00Z');
  result.controller.render({date, location});

  assert.equal(result.target.children.length, 1);
  const svg = result.target.children[0];
  assert.equal(svg.attributes.viewBox, '0 0 420 420');
  assert.equal(svg.attributes['aria-label'], 'North sky');
  const backgroundStars = svg.children.filter(node => node.attributes.class === 'polaris-background-star');
  assert.equal(backgroundStars.length, 18);
  const axis = svg.children.find(node => node.attributes.class === 'polaris-axis');
  assert.ok(axis);
  assert.equal(axis.attributes.y2, String(330 - 154 * Math.sin(52.5 * Math.PI / 180)));
  assert.ok(result.summary.children.includes('Location: Berlin'));
  assert.ok(result.summary.children.includes('Latitude: 52.5°'));
  assert.ok(result.summary.children.includes('Polaris altitude: 52.5°'));
  assert.ok(result.summary.children.includes('Date: 2026-10-27 12:00'));
});

test('southern locations identify Polaris below the horizon without a nightly-motion claim', () => {
  const location = {name:'Sydney', latitude:-33.9, longitude:151.2};
  const result = createController(location);
  result.controller.render({date:new Date('2026-10-27T12:00:00Z'), location});

  assert.ok(result.summary.children.includes('Polaris altitude: Below the horizon'));
  assert.equal(result.summary.children.some(value => value.startsWith('Nightly motion')), false);
});
