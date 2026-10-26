const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const {checkVersion} = require('./check-version');
const root = path.resolve(__dirname, '..');
const realm = vm.createContext({window:{}, document:{addEventListener(){}}, URL, AbortController});
vm.runInContext(fs.readFileSync(path.join(root, 'app-updates.js'), 'utf8'), realm);
const updates = realm.window.PLANETENUHR_APP_UPDATES;

/** Creates deterministic adapters for version-check and navigation contracts.
 * No parameters. @returns {object} Controller, mutable server and captured UI/requests.
 */
function fixture(){
  const state = {now:1000000, remote:'1.0', failure:false, calls:[], views:[], navigations:[]};
  const controller = updates.create({current:'1.0',
    now:() => state.now, href:() => 'http://localhost/projekte/planetenuhr/?date=20261026&place=Berlin&lang=fr&card=idefix#sky',
    view:value => state.views.push({...value}), navigate:url => state.navigations.push(url),
    setTimeout, clearTimeout,
    fetch:async (url, options) => {
      state.calls.push({url, options});
      if (state.failure) throw new Error('offline');
      return {ok:true, json:async () => ({version:state.remote})};
    }
  });
  return {state, controller};
}

test('version metadata accepts release identifiers and rejects incomplete or injected values', () => {
  assert.equal(updates.version('1.0'), '1.0');
  assert.equal(updates.version(' 1.1.2 '), '1.1.2');
  for (const value of [null, 1, {}, '', 'latest', '1.0<script>', '1.0/../../']) {
    assert.equal(updates.version(value), '');
  }
});

test('metadata requests bypass HTTP cache, include a fresh query and preserve the hosted subdirectory', async () => {
  const {state, controller} = fixture();
  await controller.check();
  const request = state.calls[0];
  assert.equal(request.options.cache, 'no-store');
  const url = new URL(request.url);
  assert.equal(url.pathname, '/projekte/planetenuhr/version.json');
  assert.equal(url.searchParams.get('_check'), String(state.now));
  assert.equal(state.views.at(-1).status, '');
  await controller.check({manual:true});
  assert.equal(state.views.at(-1).status, 'update_current');
});

test('new versions are announced without navigation; applying once preserves dashboard state', async () => {
  const {state, controller} = fixture();
  state.remote = '1.1';
  await controller.check();
  assert.equal(state.views.at(-1).available, '1.1');
  assert.equal(state.navigations.length, 0);
  controller.apply();
  controller.apply();
  assert.equal(state.navigations.length, 1);
  const url = new URL(state.navigations[0]);
  for (const [key, value] of Object.entries({date:'20261026',place:'Berlin',lang:'fr',card:'idefix',_appUpdate:'1.1',_appReload:String(state.now)})) {
    assert.equal(url.searchParams.get(key), value);
  }
  assert.equal(url.hash, '#sky');
});

test('automatic checks are throttled while explicit and reconnect checks can run immediately', async () => {
  const {state, controller} = fixture();
  await controller.check();
  await controller.check();
  assert.equal(state.calls.length, 1);
  await controller.check({manual:true});
  await controller.check({force:true});
  assert.equal(state.calls.length, 3);
  state.now += 180001;
  await controller.check();
  assert.equal(state.calls.length, 4);
});

test('offline and invalid metadata remain quiet automatically and explain manual failure', async () => {
  const {state, controller} = fixture();
  state.failure = true;
  await controller.check();
  assert.equal(state.views.at(-1).status, '');
  await controller.check({manual:true});
  assert.equal(state.views.at(-1).status, 'update_failed');
  assert.equal(state.views.at(-1).statusError, true);
  state.failure = false;
  state.remote = '<invalid>';
  await controller.check({manual:true});
  assert.equal(state.views.at(-1).status, 'update_failed');
  state.remote = '1.0';
  await controller.check({force:true});
  assert.equal(state.views.at(-1).statusError, false);
  assert.equal(state.views.at(-1).status, '');
});

test('failed rechecks keep an already discovered release available', async () => {
  const {state, controller} = fixture();
  state.remote = '1.1';
  await controller.check();
  state.failure = true;
  await controller.check({manual:true});
  assert.equal(state.views.at(-1).available, '1.1');
  assert.equal(state.views.at(-1).status, 'update_failed');
});

test('concurrent checks share the existing pending request', async () => {
  let resolveFetch;
  let calls = 0;
  const controller = updates.create({current:'1.0', now:() => 1, href:() => 'https://example.test/',
    view:() => {}, navigate:() => {}, setTimeout, clearTimeout,
    fetch:() => {calls += 1; return new Promise(resolve => {resolveFetch = resolve;});}
  });
  const pending = controller.check();
  await controller.check({manual:true});
  assert.equal(calls, 1);
  resolveFetch({ok:true, json:async () => ({version:'1.0'})});
  await pending;
});

test('production release metadata and all local CSS/JS references stay consistent', () => {
  assert.ok(updates.version(JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8')).version));
  assert.deepEqual(checkVersion(root), []);
});
