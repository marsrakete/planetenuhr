const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const realm = vm.createContext({window:{}, Math});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/cards/earth-moon.js'), 'utf8'), realm);

test('startup, pageshow and repeated resize preserve one animation chain and the 12-second orbit', () => {
  const callbacks = new Map();
  const listeners = new Map();
  const moon = {style:{}};
  const orbit = {getBoundingClientRect:() => ({width:180,height:120})};
  let nextFrame = 0;
  const browser = {performance:{now:() => 1},
    requestAnimationFrame(callback){ nextFrame += 1; callbacks.set(nextFrame, callback); return nextFrame; },
    addEventListener(type, callback){
      if (!listeners.has(type)) { listeners.set(type, []); }
      listeners.get(type).push(callback);
    }
  };
  const controller = realm.window.PLANETENUHR_EARTH_MOON.create({window:browser,
    document:{getElementById:id => {if (id === 'emOrbit') {return orbit;} return moon;}}
  });
  controller.wire(); controller.wire();
  controller.start(); controller.start();
  for (let repeat = 0; repeat < 5; repeat += 1) {
    listeners.get('resize')[0]();
    listeners.get('pageshow')[0]();
  }
  assert.equal(listeners.get('resize').length, 1);
  assert.equal(callbacks.size, 1);
  for (const timestamp of [3000, 15000]) {
    const [id, callback] = [...callbacks.entries()][0];
    callbacks.delete(id);
    callback(timestamp);
    assert.equal(callbacks.size, 1);
    assert.ok(Math.abs(parseFloat(moon.style.left) - 90) < 1e-8);
    assert.ok(Math.abs(parseFloat(moon.style.top) - 110) < 1e-8);
  }
});
