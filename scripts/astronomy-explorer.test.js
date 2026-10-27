const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ window:{}, Date, Math });
for (const file of ['astronomy-explorer-config.js', 'astronomy-explorer-model.js', 'translations.js', 'card-help-config.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename:file });
}
const model = context.window.PLANETENUHR_EXPLORER_MODEL;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('the global date refresh updates both Moon displays immediately with the same selected instant', () => {
  const selected = new Date('2026-12-01T12:00:00Z');
  const calls = [];
  const adapters = {dailyHighlights:null,idefixMission:null,selectedSolarDate:() => selected};
  for (const name of ['updateControlDateReadout','renderMoon','renderEarthMoon','renderAstronomyExplorer',
    'renderSolarSystem','renderBarycenter','renderLagrangePoints','renderAnalemma','renderExoplanetComparison',
    'renderPolarisNorth','renderMoonNodes','renderConjunctionTimeline','renderMeteorStreams','renderConstellationOfMonth',
    'renderConstellationYear','renderSeasonAxis','renderRetrogradePhases','renderInnerPlanetPhases','renderSunlight',
    'renderVisibility','renderNightVisibility','renderSatellites','renderEclipseGeometry','renderCalendar']) {
    adapters[name] = date => calls.push({name,date});
  }
  const realm = vm.createContext(adapters);
  loadDashboardFunction('refreshDateDrivenTiles', realm);
  vm.runInContext('refreshDateDrivenTiles()', realm);
  for (const name of ['renderMoon','renderEarthMoon']) {
    const renders = calls.filter(call => call.name === name);
    assert.equal(renders.length,1);
    assert.equal(renders[0].date,selected);
  }
});

/**
 * Loads an existing pure dashboard function without bootstrapping the browser UI.
 * @param {string} name Top-level function name in index.html.
 * @param {object} [realm=context] VM context receiving the function.
 * @returns {void}
 */
function loadDashboardFunction(name, realm = context){
  const start = html.indexOf('    function ' + name + '(');
  assert.ok(start >= 0, name + ' must exist');
  const end = html.indexOf('\n    }', start) + '\n    }'.length;
  vm.runInContext(html.slice(start, end), realm);
}

for (const name of ['normalizeDeg', 'signedDeg', 'julianDate', 'solveKepler', 'planetPosition', 'localSiderealAngleDegrees', 'horizontalCoordinates']) {
  loadDashboardFunction(name);
}
const planetsStart = html.indexOf('    const solarPlanets = [');
const planetsEnd = html.indexOf('\n    ];', planetsStart) + '\n    ];'.length;
vm.runInContext(html.slice(planetsStart, planetsEnd) + '\nwindow.testPlanets = solarPlanets;', context);

test('one AU takes 499.0047838 seconds; vector length uses all three coordinates', () => {
  assert.ok(Math.abs(model.lightTravel({ x:1, y:0, z:0 }).seconds - 499.004783836) < 0.000001);
  assert.equal(model.lightTravel({ x:0, y:3, z:4 }).distanceAu, 5);
});

test('J2000 ecliptic equinox and pole convert to known equatorial directions', () => {
  const epoch = new Date('2000-01-01T12:00:00Z');
  const equinox = model.equatorialOfDate({ x:1, y:0, z:0 }, epoch);
  assert.ok(Math.abs(equinox.rightAscensionDeg) < 1e-10);
  assert.ok(Math.abs(equinox.declinationDeg) < 1e-10);
  const solstice = model.equatorialOfDate({ x:0, y:1, z:0 }, epoch);
  assert.ok(Math.abs(solstice.rightAscensionDeg - 90) < 1e-10);
  assert.ok(Math.abs(solstice.declinationDeg - 23.43928) < 1e-8);
  const pole = model.equatorialOfDate({ x:0, y:0, z:1 }, epoch);
  assert.ok(Math.abs(pole.declinationDeg - 66.56072) < 1e-8);
});

test('precession moves the equinox in the correct direction over fifty years', () => {
  const result = model.equatorialOfDate({ x:1, y:0, z:0 }, new Date('2050-01-01T12:00:00Z'));
  assert.ok(result.rightAscensionDeg > 0.63 && result.rightAscensionDeg < 0.65);
  assert.ok(result.declinationDeg > 0.27 && result.declinationDeg < 0.29);
});

test('meridian and antipodal directions have correct horizon signs in both hemispheres', () => {
  const date = new Date('2026-10-16T21:00:00Z');
  const sidereal = context.localSiderealAngleDegrees(date, 0);
  const north = context.horizontalCoordinates(date, { latitude:52, longitude:0 }, { rightAscensionDeg:sidereal, declinationDeg:0 });
  assert.ok(Math.abs(north.altitudeDeg - 38) < 1e-8);
  assert.ok(Math.abs(north.azimuthDeg - 180) < 1e-8);
  const south = context.horizontalCoordinates(date, { latitude:-52, longitude:0 }, { rightAscensionDeg:sidereal, declinationDeg:0 });
  assert.ok(Math.abs(south.altitudeDeg - 38) < 1e-8);
  assert.ok(Math.abs(south.azimuthDeg) < 1e-8);
  const below = context.horizontalCoordinates(date, { latitude:52, longitude:0 }, { rightAscensionDeg:(sidereal + 180) % 360, declinationDeg:0 });
  assert.ok(Math.abs(below.altitudeDeg + 38) < 1e-8);
});

test('Earth sunlight time changes between perihelion and aphelion; Neptune exceeds four hours', () => {
  const earth = context.window.testPlanets.find(planet => planet.key === 'earth');
  const january = model.lightTravel(context.planetPosition(earth, new Date('2026-01-03T00:00:00Z')));
  const july = model.lightTravel(context.planetPosition(earth, new Date('2026-07-04T00:00:00Z')));
  assert.ok(january.seconds > 489 && january.seconds < 493);
  assert.ok(july.seconds > 505 && july.seconds < 509);
  assert.ok(july.seconds - january.seconds > 15);
  const neptune = context.window.testPlanets.find(planet => planet.key === 'neptune');
  const outer = model.lightTravel(context.planetPosition(neptune, new Date('2026-10-16T00:00:00Z')));
  assert.ok(outer.seconds > 4 * 3600 && outer.seconds < 4.3 * 3600);
});

test('all new labels, interpolation placeholders and help cards exist in all languages', () => {
  const packs = context.window.PLANETENUHR_TRANSLATIONS;
  const reference = Object.keys(packs.en).filter(key => /^(horizon_|light_|explorer_|title_planet_horizon$|title_light_travel$)/.test(key));
  for (const language of ['en', 'de', 'fr']) {
    for (const key of reference) {
      assert.ok(packs[language][key], language + ': ' + key);
      if (typeof packs.en[key] === 'string') {
        assert.deepEqual(packs[language][key].match(/\{\w+\}/g), packs.en[key].match(/\{\w+\}/g), key);
      }
    }
    assert.equal(packs[language].explorer_directions.length, 8);
    assert.ok(context.window.PLANETENUHR_CARD_HELP[language].cards.planet_horizon);
    assert.ok(context.window.PLANETENUHR_CARD_HELP[language].cards.light_travel);
  }
});

test('masonry keeps existing spans while measuring so local updates cannot collapse the page', () => {
  let writes = 0;
  const cards = [
    { style:{ gridRowEnd:'span 8' }, height:180 },
    { style:{ gridRowEnd:'span 12' }, height:280 }
  ];
  for (const card of cards) {
    let span = card.style.gridRowEnd;
    Object.defineProperty(card.style, 'gridRowEnd', {
      get(){ return span; },
      set(value){
        assert.notEqual(value, '', 'desktop card spans must stay present throughout layout');
        span = value;
        writes += 1;
      }
    });
  }
  const realm = vm.createContext({
    window:{ innerWidth:1280 },
    document:{ querySelector(){ return {}; } },
    getComputedStyle(){ return { gridAutoRows:'8px', rowGap:'20px' }; },
    visibleGridCards(){ return cards; },
    masonryCardHeight(card){
      assert.match(card.style.gridRowEnd, /^span /);
      return card.height;
    },
    persistentViewportAnchor:null,
    persistentScrollPosition:null,
    masonryAfterLayoutCallbacks:[]
  });
  loadDashboardFunction('updateMasonryLayout', realm);
  loadDashboardFunction('updateSingleCardMasonryLayout', realm);
  realm.updateMasonryLayout();
  assert.equal(cards[0].style.gridRowEnd, 'span 8');
  assert.equal(cards[1].style.gridRowEnd, 'span 11');
  assert.equal(writes, 1, 'unchanged spans must not be rewritten');
  realm.updateMasonryLayout();
  assert.equal(writes, 1);
  cards[0].height = 220;
  realm.updateSingleCardMasonryLayout(cards[0]);
  assert.equal(cards[0].style.gridRowEnd, 'span 9');
  assert.equal(cards[1].style.gridRowEnd, 'span 11', 'a local update must leave other cards alone');
});

test('solar light states distinguish sunrise, both twilights and astronomical night at conventional limits', () => {
  assert.equal(model.lightState(-0.8333, true).phase, 'day');
  assert.equal(model.lightState(-0.834, true).key, 'morning-civil');
  assert.equal(model.lightState(-6, false).key, 'evening-civil');
  assert.equal(model.lightState(-6.01, true).key, 'morning-nautical');
  assert.equal(model.lightState(-12.01, false).key, 'evening-astronomical');
  assert.equal(model.lightState(-18, true).phase, 'night');
  const instant = new Date('2026-10-17T00:00:00Z');
  const rising = date => -10 + (date.getTime() - instant.getTime()) / 60000;
  const setting = date => -10 - (date.getTime() - instant.getTime()) / 60000;
  assert.equal(model.solarLightAt(instant, rising).phase, 'morning');
  assert.equal(model.solarLightAt(instant, setting).phase, 'evening');
});

test('local day bounds follow city dates and 23/25-hour DST days rather than browser midnight', () => {
  const spring = model.localDayBounds(new Date('2026-03-29T12:00:00Z'), 'Europe/Berlin');
  assert.equal(spring.start.toISOString(), '2026-03-28T23:00:00.000Z');
  assert.equal(spring.end.toISOString(), '2026-03-29T22:00:00.000Z');
  assert.equal(spring.end - spring.start, 23 * 3600000);
  const autumn = model.localDayBounds(new Date('2026-10-25T12:00:00Z'), 'Europe/Berlin');
  assert.equal(autumn.end - autumn.start, 25 * 3600000);
  const tokyo = model.localDayBounds(new Date('2026-10-17T20:00:00Z'), 'Asia/Tokyo');
  assert.equal(tokyo.key, 20261018);
  assert.equal(tokyo.start.toISOString(), '2026-10-17T15:00:00.000Z');
  const delhi = model.localDayBounds(new Date('2026-10-17T12:00:00Z'), 'Asia/Kolkata');
  assert.equal(delhi.start.toISOString(), '2026-10-16T18:30:00.000Z');
});

/**
 * Evaluates the existing planetary model's Sun for an observer in regression tests.
 * @param {Date} date UTC instant.
 * @param {object} location Geographic latitude/longitude.
 * @returns {number} Geometric solar altitude in degrees.
 */
function solarAltitudeForObserver(date, location){
  const earth = context.window.testPlanets.find(planet => planet.key === 'earth');
  const position = context.planetPosition(earth, date);
  const equatorial = model.equatorialOfDate({ x:-position.x, y:-position.y, z:-position.z }, date);
  return context.horizontalCoordinates(date, location, equatorial).altitudeDeg;
}

test('Berlin summer has long daylight and no astronomical night, winter has a true night', () => {
  const location = { latitude:52.52, longitude:13.405 };
  const altitudeAt = date => solarAltitudeForObserver(date, location);
  const summer = model.solarLightDay(new Date('2026-06-21T12:00:00Z'), 'Europe/Berlin', altitudeAt);
  assert.ok(summer.sunrise > new Date('2026-06-21T02:35:00Z') && summer.sunrise < new Date('2026-06-21T02:55:00Z'));
  assert.ok(summer.sunset > new Date('2026-06-21T19:20:00Z') && summer.sunset < new Date('2026-06-21T19:45:00Z'));
  assert.equal(summer.segments.some(segment => segment.phase === 'night'), false);
  assert.equal(summer.polarNight, false);
  const winter = model.solarLightDay(new Date('2026-12-21T12:00:00Z'), 'Europe/Berlin', altitudeAt);
  assert.ok(winter.sunrise > new Date('2026-12-21T07:05:00Z') && winter.sunrise < new Date('2026-12-21T07:25:00Z'));
  assert.ok(winter.sunset > new Date('2026-12-21T14:45:00Z') && winter.sunset < new Date('2026-12-21T15:05:00Z'));
  assert.ok(winter.segments.some(segment => segment.phase === 'night'));
  assert.ok(winter.segments.some(segment => segment.phase === 'morning'));
  assert.ok(winter.segments.some(segment => segment.phase === 'evening'));
  for (const day of [summer, winter]) {
    assert.equal(day.segments[0].start, day.start.getTime());
    assert.equal(day.segments.at(-1).end, day.end.getTime());
    for (let index = 1; index < day.segments.length; index += 1) {
      assert.equal(day.segments[index - 1].end, day.segments[index].start);
    }
  }
});

test('polar day and polar night avoid invented sunrise or sunset and retain winter twilight', () => {
  const location = { latitude:78.22, longitude:15.65 };
  const altitudeAt = date => solarAltitudeForObserver(date, location);
  const summer = model.solarLightDay(new Date('2026-06-21T12:00:00Z'), 'Arctic/Longyearbyen', altitudeAt);
  assert.equal(summer.polarDay, true);
  assert.equal(summer.sunrise, null);
  assert.equal(summer.sunset, null);
  const winter = model.solarLightDay(new Date('2026-12-21T12:00:00Z'), 'Arctic/Longyearbyen', altitudeAt);
  assert.equal(winter.polarNight, true);
  assert.equal(winter.sunrise, null);
  assert.equal(winter.sunset, null);
  assert.ok(winter.segments.some(segment => segment.phase === 'morning'));
  assert.ok(winter.segments.some(segment => segment.phase === 'evening'));
  const antarctic = model.solarLightDay(new Date('2026-12-21T12:00:00Z'), 'Antarctica/McMurdo', date => solarAltitudeForObserver(date, { latitude:-78, longitude:166 }));
  assert.equal(antarctic.polarDay, true);
});


test('mobile stops observing cards and desktop resumes after a viewport change', () => {
  const cards = [{}, {}];
  const observed = [];
  let disconnects = 0;
  const realm = vm.createContext({
    window:{innerWidth:390},
    masonryObserver:{observe(card){observed.push(card);},disconnect(){disconnects += 1;}},
    masonryObserverActive:false,
    masonryObservedSizes:new WeakMap(),
    visibleGridCards(){return cards;}
  });
  loadDashboardFunction('syncMasonryObservation', realm);
  realm.syncMasonryObservation();
  assert.equal(observed.length, 0);
  realm.window.innerWidth = 1280;
  realm.syncMasonryObservation();
  realm.syncMasonryObservation();
  assert.equal(observed.length, 2, 'desktop observes each card only once');
  const previousSizes = realm.masonryObservedSizes;
  realm.window.innerWidth = 760;
  realm.syncMasonryObservation();
  assert.equal(disconnects, 1);
  assert.equal(realm.masonryObserverActive, false);
  assert.notEqual(realm.masonryObservedSizes, previousSizes);
  realm.window.innerWidth = 761;
  realm.syncMasonryObservation();
  assert.equal(observed.length, 4, 'crossing back to desktop reconnects');
});

test('resize delivery defers changed dimensions and ignores duplicate, mobile and suppressed batches', () => {
  let scheduled = 0;
  const card = {};
  const entry = {target:card,contentRect:{width:360,height:200}};
  const realm = vm.createContext({
    window:{innerWidth:1280},masonryObserverActive:true,suppressMasonryObserver:false,
    masonryObservedSizes:new WeakMap(),scheduleMasonryLayout(){scheduled += 1;}
  });
  loadDashboardFunction('handleMasonryResize', realm);
  realm.handleMasonryResize([entry]);
  realm.handleMasonryResize([entry]);
  assert.equal(scheduled, 1);
  entry.contentRect.height = 250;
  realm.handleMasonryResize([entry]);
  assert.equal(scheduled, 2);
  realm.suppressMasonryObserver = true;
  entry.contentRect.height = 300;
  realm.handleMasonryResize([entry]);
  assert.equal(scheduled, 2);
  realm.suppressMasonryObserver = false;
  realm.handleMasonryResize([entry]);
  assert.equal(scheduled, 3, 'suppressed sizes are processed on a later delivery');
  realm.window.innerWidth = 390;
  entry.contentRect.height = 350;
  realm.handleMasonryResize([entry]);
  assert.equal(scheduled, 3);
});

test('only the two exact ResizeObserver delivery warnings bypass the error dialog', () => {
  const alerts = [], warnings = [];
  const realm = vm.createContext({alert(message){alerts.push(message);},console:{warn(message){warnings.push(message);}}});
  loadDashboardFunction('handleDashboardError', realm);
  for (const warning of ['ResizeObserver loop completed with undelivered notifications.','ResizeObserver loop limit exceeded']) {
    assert.equal(realm.handleDashboardError(warning, '', 0, 0, null), true);
  }
  assert.equal(alerts.length, 0);
  assert.equal(warnings.length, 2);
  assert.equal(realm.handleDashboardError('TypeError: example', 'index.html', 42, 7, null), false);
  assert.equal(realm.handleDashboardError('ResizeObserver unexpected application failure', '', 3, 0, null), false);
  assert.equal(alerts.length, 2, 'other application errors remain visible');
});


test('both responsive SVG observers batch drawing into the next animation frame', () => {
  for (const file of ['astronomy-explorer.js','idefix.js']) {
    const source = fs.readFileSync(path.join(root,file),'utf8');
    const start = source.indexOf('    function schedulePlotResize(');
    assert.ok(start >= 0);
    const end = source.indexOf('\n    }',start) + '\n    }'.length;
    const frames = [];
    let draws = 0;
    const realm = vm.createContext({
      plotResizeFrame:0,
      requestAnimationFrame(callback){frames.push(callback);return frames.length;},
      resizePlot(){draws += 1;},adaptPlot(){draws += 1;}
    });
    vm.runInContext(source.slice(start,end),realm);
    realm.schedulePlotResize();realm.schedulePlotResize();
    assert.equal(draws,0,'delivery must not synchronously change SVG dimensions');
    assert.equal(frames.length,1,'deliveries share one queued frame');
    frames[0]();assert.equal(draws,1);
    realm.schedulePlotResize();assert.equal(frames.length,2);
  }
});

test('IDEFIX adapts its SVG only when its rendered width changes', () => {
  const source=fs.readFileSync(path.join(root,'idefix.js'),'utf8');
  const start=source.indexOf('    function adaptPlot(');
  const end=source.indexOf('\n    }',start)+'\n    }'.length;
  const attrs=[];let width=300;
  const realm=vm.createContext({
    lastPlotWidth:0,
    plot:{getBoundingClientRect(){return {width};},setAttribute(...args){attrs.push(args);},style:{setProperty(...args){attrs.push(args);}}},
    document:{querySelector(){return {setAttribute(...args){attrs.push(args);}};}}
  });
  vm.runInContext(source.slice(start,end),realm);
  realm.adaptPlot();const writes=attrs.length;assert.ok(writes>0);
  realm.adaptPlot();assert.equal(attrs.length,writes,'identical size does not retrigger layout');
  width=600;realm.adaptPlot();assert.ok(attrs.length>writes);
  assert.ok(attrs.some(([name,value])=>name==='viewBox'&&value==='0 -25 620 410'));
});
