const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const context = vm.createContext({window: {}});
for (const file of [
  'data/space-missions.js', 'data/space-mission-trajectories.js', 'data/voyager-trajectories.js', 'data/translations.js',
  'cards/space-missions.js', 'cards/space-mission-camera.js', 'cards/space-mission-3d.js',
  'cards/space-mission-flybys.js', 'cards/space-mission-animation.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), context);
}

test('mission dates retain source precision and support multi-day events', () => {
  const {formatDate} = context.window.PLANETENUHR_SPACE_MISSIONS;
  assert.equal(formatDate('en-US', '2026-11-21'), 'Nov 21, 2026');
  assert.equal(formatDate('en-US', '2028-07'), 'Jul 2028');
  assert.equal(formatDate('en-US', '2034'), '2034');
  assert.match(formatDate('en-US', '2026-12-09', '2026-12-10'), /9.*10/);
  assert.throws(() => formatDate('en-US', 'invalid'), {name: 'RangeError'});
});

test('each additional mission has unique identity, official links and chronological milestones', () => {
  const missions = context.window.PLANETENUHR_SPACE_MISSION_DATA;
  assert.deepEqual(Array.from(missions, mission => mission.id),
    ['bepicolombo', 'hera', 'europa', 'juice', 'psyche', 'dragonfly']);
  for (const mission of missions) {
    assert.equal(new URL(mission.source).protocol, 'https:');
    if (mission.tracker) {
      assert.equal(new URL(mission.tracker).protocol, 'https:');
    }
    assert.ok(mission.events.some(event => event[2] === true));
    assert.ok(mission.events.some(event => event[2] === false));
    let previous = '';
    for (const [start, key, confirmed, end] of mission.events) {
      assert.match(start, /^\d{4}(-\d{2}){0,2}$/);
      assert.ok(start > previous, mission.id);
      assert.ok(key);
      assert.equal(typeof confirmed, 'boolean');
      if (end) {
        assert.ok(end > start, mission.id);
      }
      previous = end || start;
    }
  }
});

test('each mission and milestone has copy in every dashboard language', () => {
  const {PLANETENUHR_SPACE_MISSION_DATA: missions, PLANETENUHR_OUTER_MISSION_DATA: outer, PLANETENUHR_TRANSLATIONS: languages} = context.window;
  const keys = ['missions', 'source', 'tracker', 'confirmed', 'planned', 'outerSystem', 'obliqueFrame',
    'nearEcliptic', 'northOfEcliptic', 'southOfEcliptic', 'reconstructed', 'flybyDetail', 'voyagerCenterDistance',
    '3dOpen', '3dClose', '3dReset', '3dPlot', '3dHint', '3dTouchHint', '3dMilestones', '3dPlaybackSlow', '3dPlaybackEnd',
    'paleBlueDotCaption','paleBlueDotSource','photoCountdown'];
  for (const mission of [...missions,...outer]) {
    keys.push(mission.id, ...mission.events.map(event => event[1]));
    for (const view of mission.views) {
      keys.push(view.label, ...(view.stages || []).map(stage => stage[0]));
      keys.push(...[view.distanceLabel, view.viewNote].filter(Boolean));
    }
    for (const row of mission.notes || []) {
      keys.push(...row);
    }
    for (const [key] of mission.references || []) {
      keys.push(key);
    }
  }
  for (const [language, translations] of Object.entries(languages)) {
    for (const key of keys) {
      assert.ok(translations['space_' + key], language + ': ' + key);
    }
  }
});

test('each trajectory scene uses finite, chronological vectors and identifiable source metadata', () => {
  const {PLANETENUHR_SPACE_MISSION_DATA: missions, PLANETENUHR_OUTER_MISSION_DATA: outer,
    PLANETENUHR_SPACE_MISSION_TRAJECTORIES: trajectories} = context.window;
  for (const mission of [...missions,...outer]) {
    for (const view of [...mission.views,...(mission.flybys || [])]) {
      if (view.stages) {
        assert.ok(view.stages.length >= 2);
        assert.equal(new URL(view.source).hostname, 'science.nasa.gov');
        continue;
      }
      for (const key of [view.key, view.secondary, view.targetOrbit].filter(Boolean)) {
        const data = trajectories[key];
        assert.ok(data.solution, key);
        assert.match(data.revised, /^\d{4}-\d{2}-\d{2}$/);
        assert.equal(new URL(data.url).protocol, 'https:');
        assert.ok(data.rows.length > 1);
        let previous = 0;
        for (const row of data.rows) {
          assert.equal(row.length, 4);
          assert.ok(row.every(Number.isFinite));
          assert.ok(row[0] > previous);
          previous = row[0];
        }
      }
    }
  }
  assert.equal(trajectories.mio.center, trajectories.mercury.center);
  assert.equal(new Date(trajectories.mio.rows[0][0]).toISOString().slice(0, 10), '2026-12-09');
  assert.ok(trajectories.mio.rows.every(([, x, y, z]) => Math.hypot(x, y, z) > 2440));
  assert.equal(trajectories.didymosOrbit.id, 65803);
  assert.equal(trajectories.didymosOrbit.center, trajectories.hera.center);
  assert.equal(trajectories.didymosOrbit.rows[0][0], trajectories.hera.rows[0][0]);
  assert.equal(trajectories.didymosOrbit.rows.at(-1)[0], trajectories.hera.rows.at(-1)[0]);
});

test('the sourced tracking cutoff includes the whole published UTC day', () => {
  const {dataStatus} = context.window.PLANETENUHR_SPACE_MISSION_ANIMATION;
  assert.equal(dataStatus(Date.parse('2026-11-10T23:59:59Z'), '2026-11-10'), 'trackingBased');
  assert.equal(dataStatus(Date.parse('2026-11-11T00:00:00Z'), '2026-11-10'), 'predicted');
  assert.equal(dataStatus(NaN, '2026-11-10'), 'vectorData');
  assert.equal(dataStatus(0, null), 'vectorData');
  assert.equal(dataStatus(Date.parse('1980-12-31T23:59Z'), '1992-04-24','1981-01-01'), 'reconstructed');
  assert.equal(dataStatus(Date.parse('1981-01-01'), '1992-04-24','1981-01-01'), 'trackingBased');
});

test('Voyager milestones are covered and the oblique view preserves opposite departures', () => {
  const {PLANETENUHR_OUTER_MISSION_DATA: missions, PLANETENUHR_SPACE_MISSION_TRAJECTORIES: trajectories,
    PLANETENUHR_SPACE_MISSION_ANIMATION: animation} = context.window;
  assert.deepEqual(Array.from(missions,mission => mission.id),['voyager1','voyager2']);
  assert.deepEqual(Array.from(missions,mission => mission.flybys.length),[2,4]);
  for (const mission of missions) {
    assert.ok(mission.views.every(view => view.oblique));
    for (const flyby of mission.flybys) {
      assert.ok(mission.events.some(([,key]) => key === flyby.milestone));
    }
    for (const [start,,,,seekAt = start] of mission.events) {
      const timestamp = Date.parse(seekAt);
      assert.ok(mission.views.some(view => {
        const {rows} = trajectories[view.key];
        return timestamp >= rows[0][0] && timestamp <= rows.at(-1)[0];
      }), mission.id + ' ' + seekAt);
    }
  }
  const north = trajectories.voyager1Interstellar.rows.at(-1);
  const south = trajectories.voyager2Interstellar.rows.at(-1);
  assert.ok(north[3] > 0 && south[3] < 0);
  const northOffset = animation.obliqueProjection(north[1],north[2],north[3])[1] - animation.obliqueProjection(north[1],north[2],0)[1];
  const southOffset = animation.obliqueProjection(south[1],south[2],south[3])[1] - animation.obliqueProjection(south[1],south[2],0)[1];
  assert.ok(northOffset > 0 && southOffset < 0);
});

test('flyby playback holds each encounter window long enough to follow the close approach', () => {
  const {playbackTimeline} = context.window.PLANETENUHR_SPACE_MISSION_FLYBYS;
  const playback = playbackTimeline(0,1000,20000,[[100,101],[600,601]]);
  assert.equal(playback(0),0);
  assert.equal(playback(2000),100);
  assert.equal(playback(4250),100.5);
  assert.equal(playback(6500),101);
  assert.equal(playback(16480),600);
  assert.equal(playback(18730),600.5);
  assert.equal(playback(40000),1000);
  assert.equal(playbackTimeline(100.5,1000,20000,[[100,101]])(1125),100.75);
  assert.equal(playbackTimeline(500,1000,20000,[])(1000),550);
  const withPhoto = playbackTimeline(0,1000,20000,[[100,101],[200,201,15000]]);
  assert.equal(withPhoto(6500),101);
  assert.equal(withPhoto(8480),200);
  assert.equal(withPhoto(15980),200.5);
  assert.equal(withPhoto(23480),201);
});

test('the 3D camera rotates depth and keeps the zoom anchor fixed', () => {
  const model = context.window.PLANETENUHR_SPACE_MISSION_CAMERA;
  const camera = model.standard();
  const point = [1,0,0];
  assert.deepEqual(Array.from(model.project(point,model.topDown,camera,100)),[420,200,0]);
  model.zoomAt(camera,2,420,200);
  assert.deepEqual(Array.from(model.project(point,model.topDown,camera,100)),[420,200,0]);
  model.zoomAt(camera,.0001);
  assert.equal(camera.zoom,.3);
  model.zoomAt(camera,1000);
  assert.equal(camera.zoom,20);
  const rotated = model.standard();
  rotated.yaw = Math.PI / 2;
  const [x,y,depth] = model.project(point,model.topDown,rotated,100);
  assert.ok(Math.abs(x - 320) < 1e-8);
  assert.equal(y,200);
  assert.equal(depth,1);
});

test('playback advances from the slider position and restarts at the end', () => {
  const {createPlayback} = context.window.PLANETENUHR_SPACE_MISSION_ANIMATION;
  let value = 25;
  let pending;
  const states = [];
  context.performance = {now: () => 100};
  context.requestAnimationFrame = frame => { pending = frame; return 1; };
  context.cancelAnimationFrame = () => { pending = undefined; };
  const playback = createPlayback({
    getValue: () => value,
    getMax: () => 100,
    getDuration: () => 1000,
    onFrame: next => { value = next; },
    onState: playing => states.push(playing)
  });
  playback.toggle();
  pending(350);
  assert.equal(value, 50);
  playback.pause();
  assert.equal(pending, undefined);
  playback.toggle();
  pending(1100);
  assert.equal(value, 100);
  assert.equal(playback.isPlaying(), false);
  playback.toggle();
  pending(100);
  assert.equal(value, 0);
  playback.pause();
  assert.deepEqual(states, [true, false, true, false, true, false]);
});

test('orbital projection opens up a polar orbit and rejects collinear samples', () => {
  const {orbitalProjection} = context.window.PLANETENUHR_SPACE_MISSION_ANIMATION;
  const polar = [[0, 3, 0, 0], [1, 0, 0, 2], [2, -3, 0, 0], [3, 0, 0, -2], [4, 3, 0, 0]];
  const project = orbitalProjection(polar);
  assert.ok(Math.abs(Math.hypot(...project(3, 0, 0)) - 3) < 1e-12);
  assert.ok(Math.abs(Math.hypot(...project(0, 0, 2)) - 2) < 1e-12);
  assert.equal(Math.hypot(...project(0, 5, 0)), 0);
  assert.equal(orbitalProjection([]), null);
  assert.equal(orbitalProjection([[0, 1, 0, 0], [1, 2, 0, 0]]), null);
});

test('mission label sizing compensates for the SVG viewBox scale', () => {
  const {fitPlotLabels} = context.window.PLANETENUHR_SPACE_MISSION_ANIMATION;
  const style = new Map();
  const plot = {
    viewBox: {baseVal: {width:600}},
    getBoundingClientRect: () => ({width:300}),
    style: {setProperty: (key, value) => style.set(key, value)}
  };
  assert.equal(fitPlotLabels(plot), 24);
  assert.equal(style.get('--mission-plot-label-size'), '24px');
  assert.equal(fitPlotLabels(plot, 600), 12);
  assert.equal(fitPlotLabels(plot, 0), 0);
  assert.equal(fitPlotLabels(plot, NaN), 0);
  assert.equal(style.get('--mission-plot-label-size'), '12px');
});
