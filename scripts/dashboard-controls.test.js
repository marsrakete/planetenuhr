const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{}, Date, URL, Intl});
for (const file of ['js/core/date-time.js','js/core/dashboard-context.js','js/core/dashboard-refresh.js','js/core/date-location-controls.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), realm, {filename:file});
}
const api = realm.window.PLANETENUHR_DASHBOARD_CONTEXT;
const cities = [{key:'berlin',name:'Berlin'},{key:'tokyo',name:'Tokyo'}];

test('selection preserves URL formats, city fallback and a running clock plus day offset', () => {
  let now = Date.parse('2026-10-27T12:00:00Z');
  const state = api.create({locations:cities,getLanguage:() => 'de',now:() => now});
  state.applyUrl(new URLSearchParams('date=20261201&place=Tokyo'));
  assert.equal(state.getDayOffset(), 35);
  assert.equal(state.getLocation().key, 'tokyo');
  const selected = state.getDate().getTime();
  now += 1000;
  assert.equal(state.getDate().getTime(), selected + 1000);
  state.setLocationKey('unknown');
  assert.equal(state.getLocation().key, 'berlin');
  assert.equal(api.parseDateParameter('20260230'), null);
  assert.equal(api.parseDateParameter('2026.12.01').getDate(), 1);
});

test('refresh uses one context and restores accessor scope even after a consumer throws', () => {
  let now = Date.parse('2026-12-01T12:00:00Z');
  const state = api.create({locations:cities,getLanguage:() => 'en',now:() => now});
  const calls = [];
  const refresh = realm.window.PLANETENUHR_DASHBOARD_REFRESH.create({context:state,entries:[
    {key:'first',changes:['date'],render:selection => {calls.push(selection);now += 1000;state.setLocationKey('tokyo');}},
    {key:'second',changes:['date'],render:selection => {calls.push(selection);assert.equal(state.getDate(), selection.date);assert.equal(state.getLocation(), cities[0]);throw new Error('consumer');}},
    {key:'skipped',changes:['location'],render:() => assert.fail('wrong trigger')}
  ]});
  assert.throws(() => refresh.refresh('date'), /consumer/);
  assert.equal(calls[0], calls[1]);
  assert.equal(state.getLocation(), cities[1]);
  assert.equal(state.getDate().getTime(), now);
});

/** Creates isolated controls with observable listeners and deterministic timer delivery.
 * @param {string} [iso] Fixed clock instant. @returns {object} Controller, nodes, timers and selection.
 */
function controlsFixture(iso = '2026-10-27T12:00:00Z'){
  const now = new Date(iso);
  const state = api.create({locations:cities,getLanguage:() => 'de',now:() => now.getTime()});
  const nodes = new Map();
  const timers = new Map();
  let timerId = 0;
  let renders = 0;
  const events = [];
  /** Returns one retained fake control with listeners and accessibility state.
   * @param {string} id Element id. @returns {object} Fake control.
   */
  function getNode(id){
    if (!nodes.has(id)) {
      nodes.set(id, {value:'0',min:'-1000',max:'1000',listeners:{},attrs:{},classList:{toggle(){}},
        addEventListener(type, callback){
          if (!this.listeners[type]) { this.listeners[type] = []; }
          this.listeners[type].push(callback);
        },
        dispatch(type, event = {}){
          const listeners = this.listeners[type] || [];
          for (const listener of listeners) {
            listener({target:this,button:0,...event});
          }
        },
        setAttribute(name, value){ this.attrs[name] = value; }
      });
    }
    return nodes.get(id);
  }
  /** Records a pending browser-style timer without running it.
   * @param {Function} callback Timer callback. @param {number} delay Delay in ms.
   * @returns {number} Timer handle.
   */
  function schedule(callback, delay){
    timerId += 1;
    timers.set(timerId, {callback,delay});
    return timerId;
  }
  const browser = {setInterval:schedule,setTimeout:schedule,
    clearInterval:id => timers.delete(id),clearTimeout:id => timers.delete(id),
    addEventListener:(type, callback) => events.push({type,callback})};
  const fakeDocument = {getElementById:getNode,querySelectorAll:() => [],addEventListener(){}};
  const controls = realm.window.PLANETENUHR_DATE_CONTROLS.create({document:fakeDocument,window:browser,
    context:state,getTranslations:() => ({}),getNow:() => new Date(now),formatDate:date => date.toISOString(),
    syncUrl(){},refresh(){renders += 1;},requestLayout(){},locations:cities,getLocationOptionLabel:location => location.name});
  /** Delivers one user event to a fake control.
   * @param {string} id Control element id. @param {string} type Event type.
   * @param {object} [event] Event properties. @returns {void}
   */
  function dispatch(id, type, event){
    getNode(id).dispatch(type, event);
  }
  return {controls,state,nodes,timers,events,getNode,dispatch,getRenders:() => renders};
}

test('controls wire once, retain bounds and preserve native month rollover', () => {
  const fixture = controlsFixture('2026-01-31T12:00:00Z');
  fixture.controls.wire();
  fixture.controls.wire();
  assert.equal(fixture.getNode('btnSolarNext').listeners.click.length, 1);
  assert.equal(fixture.events.length, 1);
  fixture.dispatch('btnSolarNextMonth','click');
  assert.equal(fixture.state.getDate().getMonth(), 2);
  assert.equal(fixture.state.getDate().getDate(), 3);
  fixture.getNode('solarDateSlider').max = '32';
  fixture.dispatch('btnSolarNextYear','click');
  assert.equal(fixture.state.getDayOffset(), 32);
  fixture.dispatch('btnSolarToday','click');
  assert.equal(fixture.state.getDayOffset(), 0);
  assert.equal(fixture.getNode('solarDateSlider').attrs['aria-valuenow'], '0');
});

test('autoplay owns one interval, manual input stops it and boundary stops further ticks', () => {
  const fixture = controlsFixture();
  fixture.controls.wire();
  fixture.dispatch('btnSolarAutoplay','click');
  assert.equal(fixture.timers.size, 1);
  const timer = [...fixture.timers.values()][0];
  assert.equal(timer.delay, 500);
  timer.callback();
  assert.equal(fixture.state.getDayOffset(), 1);
  fixture.getNode('solarDateSlider').value = '2';
  fixture.dispatch('solarDateSlider','input');
  assert.equal(fixture.timers.size, 0);
  fixture.getNode('solarDateSlider').max = '2';
  fixture.dispatch('btnSolarAutoplay','click');
  const boundaryTimer = [...fixture.timers.values()][0];
  boundaryTimer.callback();
  boundaryTimer.callback();
  assert.equal(fixture.timers.size, 0);
});

test('held date steps retain delay and repeat rate without an extra click step', () => {
  const fixture = controlsFixture();
  fixture.controls.wire();
  fixture.dispatch('btnSolarNext','pointerdown');
  const [id, timer] = [...fixture.timers.entries()][0];
  assert.equal(timer.delay, 500);
  fixture.timers.delete(id);
  timer.callback();
  assert.equal(fixture.state.getDayOffset(), 1);
  const repeat = [...fixture.timers.values()][0];
  assert.equal(repeat.delay, 300);
  repeat.callback();
  fixture.dispatch('btnSolarNext','pointerup');
  fixture.dispatch('btnSolarNext','click');
  assert.equal(fixture.state.getDayOffset(), 2);
  assert.equal(fixture.timers.size, 0);
});
