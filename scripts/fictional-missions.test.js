const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({window:{}});
for (const file of [
  'js/data/fictional-missions.js', 'js/data/fictional-mission-copy.js',
  'js/data/card-help-config.js', 'js/models/fictional-missions-model.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const {PLANETENUHR_FICTIONAL_MISSIONS:missions, PLANETENUHR_FICTIONAL_MISSION_COPY:copies,
  PLANETENUHR_CARD_HELP:help, PLANETENUHR_FICTIONAL_MISSIONS_MODEL:model} = context.window;

test('dashboard entry references the canonical HTML and SVG as versioned web assets', () => {
  const entry = fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(entry,/<template id="fictionalMissionSlot"\s/);
  assert.match(entry,/data-template-url="templates\/fictional-missions\.html\?v=/);
  assert.match(entry,/data-scene-url="assets\/fictional-missions\/scenes\.svg\?v=/);
  assert.doesNotMatch(entry,/data-fictional-scene|class="[^"]*fictional-missions-card/);
});

test('four fictional missions have ordered dates and full copy, including official work references', () => {
  assert.deepEqual(Array.from(missions,mission => mission.id),['moon','odyssey','interstellar','hailMary']);
  for (const [language,copy] of Object.entries(copies)) {
    assert.ok(copy.title && copy.time && copy.note, language);
    const entry = help[language].cards.fictional_missions;
    assert.equal(entry.links.length,5);
    assert.ok(entry.links.every(link => new URL(link.url).protocol === 'https:'));
    for (const mission of missions) {
      assert.ok(model.prepare(mission), mission.id);
      assert.ok(copy.missions[mission.id], language);
      for (const event of mission.events) {
        assert.match(event.at,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/);
        assert.ok(copy.events[event.key], language + ' ' + event.key);
      }
    }
  }
});

test('timeline interpolation selects the right scene, separates same-day events and clamps inputs', () => {
  const moon = model.prepare(missions[0]);
  assert.equal(model.frameAt(moon,-1).event.key,'moonLaunch');
  assert.equal(model.frameAt(moon,NaN).timestamp,Date.parse('1954-07-17T08:00Z'));
  assert.equal(model.frameAt(moon,2.5).event.scene,'moon-route');
  assert.equal(model.frameAt(moon,3).event.scene,'moon-surface');
  assert.equal(model.frameAt(moon,3.5).timestamp,Date.parse('1954-07-20T20:30Z'));
  assert.equal(model.frameAt(moon,4).event.key,'moonSteps');
  assert.equal(model.frameAt(moon,99).event.key,'earthLanding');
  assert.equal(model.frameAt(null,1),null);
  assert.equal(model.prepare(null),null);
  assert.equal(model.prepare({events:[{at:'bad'},{at:'also bad'}]}),null);
  assert.equal(model.prepare({events:[{at:'2001-05-01'},{at:'2001-04-01'}]}),null);
});

test('Interstellar shows separate clocks on the surface and at the return to Endurance', () => {
  const interstellar = model.prepare(missions[2]);
  assert.equal(model.frameAt(interstellar,3.5).enduranceTime,null);
  const landing = model.frameAt(interstellar,4);
  assert.equal(landing.timestamp,landing.enduranceTime);
  const surface = model.frameAt(interstellar,5);
  assert.ok(surface.enduranceTime > Date.parse('2070-01-01'));
  const reunion = model.frameAt(interstellar,6);
  assert.equal(reunion.timestamp,Date.parse('2069-09-03T13:00Z'));
  assert.equal(reunion.enduranceTime,Date.parse('2092-09-03T09:00Z'));
  const afterReunion = model.frameAt(interstellar,6.9);
  assert.equal(afterReunion.timestamp,reunion.timestamp);
  assert.equal(afterReunion.enduranceTime,reunion.enduranceTime);
  const mann = model.frameAt(interstellar,7);
  assert.equal(mann.event.key,'mannLanding');
  assert.ok(mann.timestamp > reunion.enduranceTime);
  assert.equal(mann.enduranceTime,null);
  assert.deepEqual(Array.from(interstellar.events.slice(7),event => event.key),[
    'mannLanding','enduranceDocking','gargantuaSeparation','cooperRescue','edmundsCamp'
  ]);
  assert.equal(model.prepare({...missions[2],clocks:{start:'invalid'}}),null);
});

test('Hail Mary retains the complete sequence through the arrival at Erid', () => {
  const hail = model.prepare(missions[3]);
  assert.deepEqual(Array.from(hail.events,event => event.key),[
    'hailWake','hailTauCeti','hailRendezvous','hailDock','hailAdrian','hailSeparate',
    'hailProbes','hailTurn','hailTogether','hailArrival'
  ]);
  assert.equal(hail.events.find(event => event.key === 'hailArrival').timestamp,Date.parse('2068-06-12T12:00Z'));
});
