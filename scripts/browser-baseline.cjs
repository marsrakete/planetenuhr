/* Run with node scripts/browser-baseline.cjs --record|--compare <snapshot.json>.
 * Install Playwright and its Chromium/WebKit browsers as development tools, or set
 * PLANETENUHR_PLAYWRIGHT, PLANETENUHR_CHROMIUM_EXECUTABLE and
 * PLANETENUHR_WEBKIT_EXECUTABLE to local installations.
 */
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let playwrightPath = 'playwright';
if (process.env.PLANETENUHR_PLAYWRIGHT) playwrightPath = process.env.PLANETENUHR_PLAYWRIGHT;
const playwright = require(playwrightPath);
const mode = process.argv[2];
const snapshotPath = process.argv[3];
const selectedCase = process.env.PLANETENUHR_BASELINE_CASE;
if (!['--record','--compare'].includes(mode) || !snapshotPath) throw new Error('Use --record or --compare followed by a snapshot path.');
if (mode === '--record' && selectedCase) throw new Error('Recording requires the complete browser matrix.');

/** Serves project files on loopback for browser tests without a production server.
 * @returns {Promise<{server:import('node:http').Server,url:string}>} Listening server and base URL.
 */
async function startServer(){
  const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.ics':'text/calendar; charset=utf-8'};
  const server = http.createServer((request,response) => {
    let name;
    try {name = decodeURIComponent(new URL(request.url,'http://localhost').pathname);} catch (error) {response.writeHead(400).end();return;}
    if (name === '/') name = '/index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep)) {response.writeHead(403).end();return;}
    fs.readFile(file, (error,bytes) => {
      if (error) {response.writeHead(404).end();return;}
      response.setHeader('Content-Type', types[path.extname(file).toLowerCase()] || 'application/octet-stream');
      response.end(bytes);
    });
  });
  await new Promise((resolve,reject) => {server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return {server,url:'http://127.0.0.1:' + server.address().port};
}

/** Captures comparable date-dependent content without animation or wall-clock noise.
 * @param {import('playwright').Page} page Running dashboard.
 * @returns {Promise<object>} Localized display, selected date and astronomy values.
 */
async function capture(page){
  const result = await page.evaluate(includePlanetCards => {
    const date = dashboardContext.getDate();
    return {
      date:window.PLANETENUHR_DATE_TIME.formatDateKey(date,window.PLANETENUHR_DATE_TIME.locationTimeZoneId(dashboardContext.getLocation())),
      location:dashboardContext.getLocation().key,
      moon:document.getElementById('moonText').textContent,
      caption:document.getElementById('emPhaseText').textContent,
      nextFull:document.getElementById('moonNextFull').textContent,
      shadow:document.querySelector('#moonIcon [data-moon-shadow]').getAttribute('d'),
      direction:document.getElementById('moonLocalPositionMain').textContent,
      hints:[...document.querySelectorAll('#dailyHighlightsList li')].map(row => ({id:row.dataset.highlightId,title:row.querySelector('[data-daily-title]').textContent,detail:row.querySelector('[data-daily-detail]').textContent})),
      planets:[...document.querySelectorAll('#solarSystem [data-solar-marker]')].map(node => ({key:node.dataset.solarMarker,left:node.style.left,top:node.style.top})),
      calendar:document.getElementById('skyCalendarCard').textContent.replace(/\s+/g,' ').trim(),
      planetCards:(() => {
        if (!includePlanetCards) return null;
        const markup = document.getElementById('innerPhasesPanel').innerHTML;
        const modes = ['jupiter','jupiter_saturn','all'].map(mode => {
          if (window.PLANETENUHR_BARYCENTER_CARD) barycenterController.setMode(mode);
          else setBarycenterInfluenceMode(mode);
          return {mode,markup:document.getElementById('barycenterMap').innerHTML + document.getElementById('barycenterSummary').innerHTML};
        });
        return {markup,modes};
      })(),
      staticOrbits:['smallBodiesMap','smallBodiesDetail','smallBodiesSummary','spacecraftMap','spacecraftSummary'].map(id => ({id,markup:document.getElementById(id).innerHTML})),
      externalData:['auroraPanel','bskyCard','bskyStatus','bskyPost'].map(id => ({id,markup:document.getElementById(id).innerHTML,hidden:document.getElementById(id).hidden})),
      orbitCards:['exoplanetComparison','exoplanetSummary','satelliteMap','satelliteSummary'].map(id => ({id,markup:document.getElementById(id).innerHTML})),
      solarGeometry:['lagrangeMap','lagrangeSummary','analemmaMap','analemmaSummary'].map(id => ({id,markup:document.getElementById(id).innerHTML})),
      mechanics:['seasonMap','seasonSummary','retrogradePanel'].map(id => ({id,markup:document.getElementById(id).innerHTML})),
      constellations:['constellationMap','constellationSkyHint','constellationSummary','constellationYearMap','constellationYearSummary'].map(id => ({id,markup:document.getElementById(id).innerHTML})),
      encounters:{
        conjunctions:[...document.querySelectorAll('#conjunctionTimeline .conjunction-event')].map(node => ({
          pair:node.dataset.pair,date:node.dataset.date,separation:node.dataset.separation,
          x:node.querySelector('circle').getAttribute('cx'),y:node.querySelector('circle').getAttribute('cy'),
          radius:node.querySelector('circle').getAttribute('r'),text:node.textContent})),
        conjunctionSummary:document.getElementById('conjunctionSummary').textContent,
        meteorArcs:[...document.querySelectorAll('#meteorMap .meteor-arc')].map(node => ({path:node.getAttribute('d'),color:node.getAttribute('stroke'),text:node.textContent})),
        meteorLabels:[...document.querySelectorAll('#meteorMap .meteor-stream-callout')].map(node => ({text:node.textContent,points:node.querySelector('polyline').getAttribute('points')})),
        meteorPeaks:[...document.querySelectorAll('#meteorMap .meteor-peak')].map(node => ({x:node.getAttribute('cx'),y:node.getAttribute('cy'),radius:node.getAttribute('r')})),
        meteorSummary:document.getElementById('meteorSummary').textContent,
        radiants:[...document.querySelectorAll('#meteorRadiants .meteor-radiant-dot')].map(node => ({x:node.getAttribute('cx'),y:node.getAttribute('cy'),radius:node.getAttribute('r'),class:node.getAttribute('class'),text:node.textContent}))
      }
    };
  }, process.env.PLANETENUHR_PLANET_CARDS_BASELINE === '1');
  if (process.env.PLANETENUHR_CONSTELLATION_BASELINE !== '1') delete result.constellations;
  else result.constellations = result.constellations.map(item => ({id:item.id,hash:createHash('sha256').update(item.markup).digest('hex')}));
  if (process.env.PLANETENUHR_MECHANICS_BASELINE !== '1') delete result.mechanics;
  else result.mechanics = result.mechanics.map(item => ({id:item.id,hash:createHash('sha256').update(item.markup).digest('hex')}));
  if (process.env.PLANETENUHR_PLANET_CARDS_BASELINE !== '1') delete result.planetCards;
  else result.planetCards = {hash:createHash('sha256').update(result.planetCards.markup).digest('hex'),modes:result.planetCards.modes.map(item => ({mode:item.mode,hash:createHash('sha256').update(item.markup).digest('hex')}))};
  if (process.env.PLANETENUHR_SOLAR_GEOMETRY_BASELINE !== '1') delete result.solarGeometry;
  else result.solarGeometry = result.solarGeometry.map(item => ({id:item.id,hash:createHash('sha256').update(item.markup).digest('hex')}));
  if (process.env.PLANETENUHR_ORBIT_CARDS_BASELINE !== '1') delete result.orbitCards;
  else result.orbitCards = result.orbitCards.map(item => ({id:item.id,hash:createHash('sha256').update(item.markup).digest('hex')}));
  if (process.env.PLANETENUHR_STATIC_ORBITS_BASELINE !== '1') delete result.staticOrbits;
  else result.staticOrbits = result.staticOrbits.map(item => ({id:item.id,hash:createHash('sha256').update(item.markup).digest('hex')}));
  if (process.env.PLANETENUHR_EXTERNAL_DATA_BASELINE !== '1') delete result.externalData;
  else result.externalData = result.externalData.map(item => ({id:item.id,hidden:item.hidden,hash:createHash('sha256').update(item.markup).digest('hex')}));
  result.calendar = createHash('sha256').update(result.calendar).digest('hex');
  if (process.env.PLANETENUHR_ENCOUNTER_BASELINE !== '1') delete result.encounters;
  return result;
}

/** Checks the prior point-size and straight, unfilled meteor-leader regressions.
 * @param {import('playwright').Page} page Running dashboard. @returns {Promise<void>}
 */
async function checkEncounterGraphics(page){
  await page.evaluate(() => {
    const points = [...document.querySelectorAll('#conjunctionTimeline .conjunction-event circle')];
    if (points.some(point => point.getAttribute('r') !== '6')) throw new Error('Conjunction point sizes differ');
    const leaders = [...document.querySelectorAll('#meteorMap .meteor-stream-leader')];
    if (leaders.length !== (phenomenaConfig.meteorStreams || []).length) throw new Error('Meteor stream names are missing');
    for (const leader of leaders) {
      if (leader.getAttribute('fill') !== 'none') throw new Error('Meteor leader became a filled shape');
      if (leader.getAttribute('points').trim().split(/\s+/).length !== 2) throw new Error('Meteor leader is no longer straight');
    }
  });
}

/** Checks that the north-sky card renders its selected-date geometry and labels.
 * @param {import('playwright').Page} page Running dashboard.
 * @returns {Promise<void>}
 */
async function checkPolarisCard(page){
  const result = await page.evaluate(() => {
    const svg = document.querySelector('#polarisMap svg');
    const summary = document.getElementById('polarisSummary');
    if (!svg || !summary) {
      return null;
    }
    return {
      viewBox:svg.getAttribute('viewBox'),
      backgroundStars:svg.querySelectorAll('.polaris-background-star').length,
      polaris:svg.querySelectorAll('.polaris-main-star').length,
      summary:summary.textContent
    };
  });
  assert.ok(result, 'North-sky card should render an SVG and summary');
  assert.equal(result.viewBox, '0 0 420 420');
  assert.equal(result.backgroundStars, 18);
  assert.equal(result.polaris, 1);
  assert.ok(result.summary.includes('Berlin'));
  assert.ok(result.summary.includes('52.5°'));
}

/** Checks solar and eclipse consumers at curated events and a seasonal date.
 * @param {import('playwright').Page} page Running dashboard.
 * @returns {Promise<void>} Resolves when the rendered labels match the selected date.
 */
async function checkSolarEclipse(page){
  await page.evaluate(() => {
    const previous = dashboardContext.getDayOffset();
    try {
      for (const iso of ['2026-08-12T12:00:00Z','2028-01-12T12:00:00Z','2026-12-21T12:00:00Z']) {
        dashboardContext.setDayOffset((Date.parse(iso) - Date.now()) / 86400000);
        refreshDateDrivenTiles();
        const date = dashboardContext.getDate();
        const location = dashboardContext.getLocation();
        const solar = window.PLANETENUHR_SOLAR_VISIBILITY;
        for (const [id, rise] of [['sunriseTime',true],['sunsetTime',false]]) {
          const expected = fmtTimeOnly(solar.solarEventUtc(date, location.latitude, location.longitude, 90.833, rise));
          if (document.getElementById(id).textContent !== expected) throw new Error('Solar label did not follow date: ' + id);
        }
        const eclipseSvg = document.querySelector('#eclipseGeometryMap svg');
        if (!eclipseSvg || eclipseSvg.getAttribute('viewBox') !== '0 0 320 120') throw new Error('Eclipse geometry graphic did not render');
        const eclipseStatus = document.getElementById('eclipseGeometryStatus').textContent;
        if (!eclipseStatus) throw new Error('Eclipse geometry status did not render');
        const moonNodesSvg = document.querySelector('#moonNodesMap svg');
        if (!moonNodesSvg || !moonNodesSvg.getAttribute('viewBox')) throw new Error('Moon-nodes graphic did not render');
        const summary = document.getElementById('moonNodesSummary').textContent;
        const node = window.PLANETENUHR_ECLIPSE_MODEL.moonNodeDistance(date);
        const season = window.PLANETENUHR_ECLIPSE_MODEL.eclipseSeasonInfo(date);
        if (!summary.includes(node.distanceDays.toFixed(1) + ' d')) throw new Error('Node distance did not follow date');
        if (!summary.includes(season.distanceToCenter.toFixed(1) + ' d')) throw new Error('Season distance did not follow date');
        const visibility = eclipseVisibilityForLocation(date, location);
        if (visibility && !summary.includes(eclipseVisibilityStatusLabel(visibility.status))) throw new Error('Local eclipse status did not follow date');
      }
    } finally {
      dashboardContext.setDayOffset(previous);
      refreshDateDrivenTiles();
    }
  });
}

/** Exercises retained solar artwork, real date buttons and a responsive boundary crossing.
 * @param {import('playwright').Page} page Dashboard page.
 * @param {number} width Original viewport width. @returns {Promise<void>}
 */
async function checkDateControlsAndSolar(page, width){
  await page.evaluate(() => {
    const systems = [...document.querySelectorAll('#planetSystems .planet-system')];
    const planetaryOrbits = [...document.querySelectorAll('#planetSystems [data-planetary-orbit]')];
    if (systems.length !== 4 || planetaryOrbits.length !== 24) throw new Error('Planetary moon systems changed');
    const marsOrbitStyle = getComputedStyle(planetaryOrbits[0]);
    if (marsOrbitStyle.width !== '70px' || marsOrbitStyle.animationDuration !== '5s') throw new Error('Planetary orbit configuration did not render');
    const jupiterOrbits = [...document.querySelectorAll('#jupiterSystem [data-jupiter-orbit]')];
    if (jupiterOrbits.length !== 10) throw new Error('Jupiter moon orbit count changed');
    const ioOrbitStyle = getComputedStyle(jupiterOrbits[0]);
    if (ioOrbitStyle.width !== '90px' || ioOrbitStyle.animationDuration !== '3.55s') throw new Error('Jupiter orbit configuration did not render');
    const system = document.getElementById('solarSystem');
    const markers = [...system.querySelectorAll('[data-solar-marker]')];
    const artwork = markers.map(node => node.querySelector('svg'));
    const moonSvg = document.querySelector('#moonIcon svg');
    const compass = document.querySelector('#moonLocalCompass .direction-compass');
    const orbits = [...system.querySelectorAll('[data-solar-orbit]')];
    const labels = [...system.querySelectorAll('[data-solar-planet]')];
    const original = dashboardContext.getDayOffset();
    const button = document.querySelector('.solar-card .diagram-open');
    button.focus();
    try {
      dashboardContext.setDayOffset(original + 35);
      refreshDateDrivenTiles();
      if (document.activeElement !== button) throw new Error('Solar refresh lost focus');
      for (const nodes of [markers, orbits, labels]) {
        if (nodes.length !== 8 || nodes.some(node => !system.contains(node))) throw new Error('Solar nodes were replaced');
      }
      if (markers.some((node, index) => node.querySelector('svg') !== artwork[index])) throw new Error('Planet artwork was replaced');
      if (document.querySelector('#moonIcon svg') !== moonSvg) throw new Error('Moon phase SVG was replaced');
      if (document.querySelector('#moonLocalCompass .direction-compass') !== compass) throw new Error('Moon compass was replaced');
      if (system.querySelector('[data-body="moon"]')) throw new Error('Solar system unexpectedly contains Moon');
      const shadow = system.querySelector('[data-solar-marker="earth"] [data-earth-shadow]');
      if (getComputedStyle(shadow).display !== 'none') throw new Error('Solar Earth shadow became visible');
    } finally {
      dashboardContext.setDayOffset(original);
      refreshDateDrivenTiles();
    }
  });
  const before = await page.evaluate(() => dashboardContext.getDayOffset());
  let next = '#btnSolarNext';
  let today = '#btnSolarToday';
  if (width <= 760) {
    next = '#btnSolarNextMobile';
    today = '#btnSolarTodayMobile';
  }
  await page.locator(next).click();
  assert.equal(await page.evaluate(() => dashboardContext.getDayOffset()), before + 1);
  await page.locator(today).click();
  assert.equal(await page.evaluate(() => dashboardContext.getDayOffset()), 0);
  let alternate = 390;
  if (width <= 760) alternate = 1280;
  await page.setViewportSize({width:alternate,height:900});
  await page.evaluate(() => solarSystemController.render(dashboardContext.snapshot()));
  assert.equal(await page.locator('#solarSystem [data-solar-marker]').count(), 8);
  await page.setViewportSize({width,height:900});
  await page.evaluate(() => solarSystemController.render(dashboardContext.snapshot()));
}

/** Checks a scrolled date refresh and repeated detail opening against top-of-page jumps.
 * @param {import('playwright').Page} page Running dashboard. @returns {Promise<void>}
 */
async function checkViewportStability(page){
  const anchor = await page.evaluate(async () => {
    dashboardLayout.releasePendingViewportRestoration();
    // Resize schedules additional layout checks at 120 and 320 ms.
    await new Promise(resolve => setTimeout(resolve, 400));
    dashboardLayout.scheduleMasonryLayout();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const card = document.querySelector('.solar-card');
    window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - 140);
    const saved = dashboardLayout.captureViewportAnchor();
    const top = saved.element.getBoundingClientRect().top;
    const dateSlider = document.getElementById('solarDateSlider');
    dateSlider.value = String(dashboardContext.getDayOffset() + 1);
    dateSlider.dispatchEvent(new Event('input', {bubbles:true}));
    for (let frame = 0; frame < 8; frame += 1) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    return {before:top,after:saved.element.getBoundingClientRect().top,scroll:window.scrollY,width:innerWidth,card:saved.element.dataset.helpKey};
  });
  assert.ok(anchor.scroll > 100, 'date refresh must keep a scrolled viewport');
  assert.ok(Math.abs(anchor.after - anchor.before) < 5, 'visible card anchor must remain stable: ' + JSON.stringify(anchor));
  for (let repeat = 0; repeat < 2; repeat += 1) {
    await page.locator('.solar-card .diagram-open').click();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.activeElement === document.querySelector('.solar-card .diagram-open'));
    assert.ok(await page.evaluate(() => window.scrollY > 100), 'detail close must not jump to page top');
  }
}

/** Checks calendar filters, list expansion, event details, ICS download and responsive view height.
 * @param {import('playwright').Page} page Dashboard.
 * @param {number} width Viewport width used for the active browser case.
 * @returns {Promise<void>}
 */
async function checkSkyCalendar(page, width){
  await page.locator('[data-calendar-view="list"]').click();
  await page.locator('[data-calendar-filter="all"]').click();
  await page.locator('#calendarShowPast').evaluate(node => {
    node.checked = true;
    node.dispatchEvent(new Event('change',{bubbles:true}));
  });

  const collapsedCount = await page.locator('#calendarTimeline .calendar-item').count();
  assert.ok(collapsedCount > 0 && collapsedCount <= 4, 'compact calendar view should render at most four events');
  const showAll = page.locator('#btnCalendarShowAll');
  if (await showAll.isVisible()) {
    await showAll.click();
    const expandedCount = await page.locator('#calendarTimeline .calendar-item').count();
    assert.ok(expandedCount > collapsedCount, 'expanded calendar list should show additional entries');
  }

  const firstTitle = (await page.locator('#calendarTimeline [data-calendar-title]').first().textContent()).trim();
  const firstEventTrigger = page.locator('#calendarTimeline [data-calendar-open]').first();
  if (!(await firstEventTrigger.isVisible())) {
    const state = await firstEventTrigger.evaluate(node => {
      const timeline = document.getElementById('calendarTimeline');
      const stack = document.getElementById('calendarViewStack');
      return {button:getComputedStyle(node).visibility, timeline:getComputedStyle(timeline).visibility,
        panel:timeline.className, parent:timeline.parentElement.className,
        active:stack.querySelector('.calendar-view-panel.is-active')?.id,
        rect:node.getBoundingClientRect().toJSON()};
    });
    throw new Error('Calendar event trigger is not visible: ' + JSON.stringify(state));
  }
  await firstEventTrigger.click();
  assert.equal(await page.locator('#calendarDetail').isVisible(), true);
  assert.equal((await page.locator('[data-calendar-detail-title]').textContent()).trim(), firstTitle);

  const downloadPromise = page.waitForEvent('download', {timeout:10000});
  await page.locator('[data-calendar-detail-download]').click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /\.ics$/i, 'event detail should download an ICS file');

  await page.locator('[data-calendar-detail-close-button]').click();
  assert.equal(await page.locator('#calendarDetail').isVisible(), false);
  await page.locator('#calendarTimeline [data-calendar-open]').first().click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#calendarDetail').isVisible(), false, 'Escape should close the calendar detail');

  await page.locator('[data-calendar-view="month"]').click();
  const monthEntries = page.locator('#calendarMonthGrid [data-calendar-month-event]');
  assert.ok(await monthEntries.count() > 0, 'show-past month view should contain at least one event');
  await monthEntries.first().click();
  assert.equal(await page.locator('#calendarDetail').isVisible(), true, 'month events should open their detail');
  await page.locator('[data-calendar-detail-close-button]').click();

  const layout = await page.locator('#calendarViewStack').evaluate(stack => {
    const activePanel = stack.querySelector('.calendar-view-panel.is-active');
    return {stackHeight:stack.getBoundingClientRect().height,panelHeight:activePanel.getBoundingClientRect().height};
  });
  assert.ok(layout.stackHeight + 1 >= layout.panelHeight, 'calendar stack must contain its active view');
  if (width <= 760) {
    assert.ok(layout.stackHeight <= layout.panelHeight + 1, 'mobile calendar height should follow the active view only');
  }

  await page.locator('#calendarShowPast').evaluate(node => {
    node.checked = false;
    node.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.locator('[data-calendar-view="list"]').click();
}

/** Checks size persistence and help/deep-link interactions without changing reference snapshots.
 * @param {import('playwright').Page} page Dashboard. @param {number} width Viewport width.
 * @returns {Promise<void>}
 */
async function checkCardTools(page, width){
  const stored = await page.evaluate(() => localStorage.getItem('planetenuhr-card-sizes-v1'));
  await page.evaluate(() => {
    cardSizes.initCardSizeControls(); cardSizes.initCardSizeControls();
    helpController.initCardHelp(); helpController.initCardHelp();
    for (const card of document.querySelectorAll('.grid .display-container[data-help-key]')) {
      if (card.querySelectorAll('.card-size-control').length > 1) throw new Error('Duplicate size controls');
      if (card.querySelectorAll('.card-help').length > 1) throw new Error('Duplicate help controls');
    }
  });
  const card = page.locator('.solar-card');
  if (width > 760) {
    await card.hover();
    await card.locator('[data-card-size-option="normal"]').click();
    assert.equal(await card.getAttribute('data-card-size'), 'normal');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('planetenuhr-card-sizes-v1')).solar_system), 'normal');
  } else {
    assert.equal(await card.locator('.card-size-control').isVisible(), false);
  }
  await page.evaluate(() => {
    cardSizes.setAllDashboardCardSizes('normal');
    if (cardSizes.resizableDashboardCards().some(card => card.dataset.cardSize !== 'normal')) throw new Error('Global size did not apply');
  });
  const navigation = await page.evaluate(() => {
    const before = dashboardContext.snapshot();
    const sentinel = document.querySelector('.solar-card');
    const link = cardNavigation.dailyHighlightCardUrl('moon_nodes');
    cardNavigation.openDailyHighlightCard('moon_nodes');
    const after = dashboardContext.snapshot();
    return {link,dateBefore:before.date.toISOString(),dateAfter:after.date.toISOString(),
      placeBefore:before.location.key,placeAfter:after.location.key,
      focused:document.activeElement.id,sameDocument:document.querySelector('.solar-card') === sentinel,
    };
  });
  await page.waitForFunction(() => document.getElementById('card-moon_nodes').classList.contains('is-navigation-highlight'), null, {timeout:6500});
  const highlight = await page.evaluate(() => ({
    active:document.getElementById('card-moon_nodes').classList.contains('is-navigation-highlight'),
    animation:getComputedStyle(document.getElementById('card-moon_nodes'),'::after').animationName,
    opacity:getComputedStyle(document.getElementById('card-moon_nodes'),'::after').opacity
  }));
  assert.equal(navigation.dateBefore, navigation.dateAfter);
  assert.equal(navigation.placeBefore, navigation.placeAfter);
  assert.equal(navigation.focused, 'card-moon_nodes');
  assert.equal(navigation.sameDocument, true);
  assert.equal(highlight.active, true);
  if (process.env.PLANETENUHR_REDUCED_MOTION_BASELINE === '1') {
    assert.equal(highlight.animation, 'none');
    assert.equal(highlight.opacity, '0.95');
  } else {
    assert.equal(highlight.animation, 'navigation-card-highlight');
  }
  assert.equal(new URL(navigation.link).searchParams.get('card'), 'moon_nodes');
  const help = page.locator('[data-help-key="moon_nodes"] .card-help-button');
  await help.click();
  assert.equal(await help.getAttribute('aria-expanded'), 'true', 'Help did not open: moon_nodes');
  const note = await page.evaluate(() => helpController.currentCardHelpPack().cards.moon_nodes.markerNote);
  assert.ok((await page.locator('[data-help-key="moon_nodes"] .card-help-popup').textContent()).includes(note));
  await page.keyboard.press('Escape');
  assert.equal(await help.getAttribute('aria-expanded'), 'false');
  await page.evaluate(previous => {
    if (previous === null) localStorage.removeItem('planetenuhr-card-sizes-v1');
    else localStorage.setItem('planetenuhr-card-sizes-v1', previous);
    cardSizes.initCardSizeControls();
  }, stored);
}

/** Checks every month, enlarged miniatures, name bounds and retained card controls.
 * @param {import('playwright').Page} page Dashboard. @returns {Promise<void>}
 */
async function checkConstellationCards(page){
  await page.evaluate(() => {
    const context = dashboardContext.snapshot();
    const monthHelp = document.querySelector('[data-help-key="constellation_month"] .card-help-button');
    const yearHelp = document.querySelector('[data-help-key="constellation_year"] .card-help-button');
    try {
      for (let month = 0; month < 12; month++) {
        const selection = {...context,date:new Date(2026,month,15,12)};
        constellationMonthController.render(selection);
        constellationYearController.render(selection);
        const configured = phenomenaConfig.constellations.find(item => item.month === month + 1);
        const stars = document.querySelectorAll('#constellationMap .constellation-star');
        if (stars.length !== configured.stars.length) throw new Error('Monthly constellation stars changed');
        if (document.querySelector('#constellationSummary [data-constellation-name]').textContent !== configured.name) throw new Error('Monthly constellation selection changed');
        if (document.querySelectorAll('#constellationYearMap .constellation-year-mini').length !== 12) throw new Error('Annual miniature count changed');
        if (document.querySelectorAll('#constellationYearMap .constellation-mini-star.current').length !== 1) throw new Error('Annual current-month marker changed');
        for (const label of document.querySelectorAll('#constellationYearMap .constellation-name-label')) {
          const bounds = label.getBBox();
          if (bounds.x < 7.9 || bounds.x + bounds.width > 752.1) throw new Error('Annual name exceeds chart bounds');
        }
      }
      if (monthHelp !== document.querySelector('[data-help-key="constellation_month"] .card-help-button') || yearHelp !== document.querySelector('[data-help-key="constellation_year"] .card-help-button')) throw new Error('Constellation controls were replaced');
    } finally {
      constellationMonthController.render(context);
      constellationYearController.render(context);
    }
  });
  await checkHelpAndDetails(page, ['constellation_month','constellation_year']);
}

/** Exercises help and visible detail controls without replacing the current card.
 * @param {import('playwright').Page} page Dashboard. @param {string[]} keys Card help keys.
 * @returns {Promise<void>}
 */
async function checkHelpAndDetails(page, keys){
  for (const key of keys) {
    const card = page.locator('[data-help-key="' + key + '"]');
    const help = card.locator('.card-help-button');
    await help.click();
    assert.equal(await help.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await help.getAttribute('aria-expanded'), 'false');
    const detail = card.locator('.diagram-open');
    if (await detail.isVisible()) {
      await detail.click();
      assert.ok(await page.locator('#diagramDetailContent svg').count() > 0);
      await page.keyboard.press('Escape');
      await page.waitForFunction(key => document.activeElement === document.querySelector('[data-help-key="' + key + '"] .diagram-open'), key);
    }
  }
}

/** Checks repeated mechanics rendering, retained controls and SVG arrow references.
 * @param {import('playwright').Page} page Dashboard. @returns {Promise<void>}
 */
async function checkMechanicsCards(page){
  await page.evaluate(() => {
    const context = dashboardContext.snapshot();
    const keys = ['season_axis','retrograde'];
    const controls = keys.map(key => document.querySelector('[data-help-key="' + key + '"] .card-help-button'));
    for (let index = 0; index < 2; index++) {
      seasonsController.render(context);
      retrogradeController.render(context);
    }
    if (document.querySelectorAll('#seasonMap .season-month-tick').length !== 12) throw new Error('Season month ticks changed');
    const expected = (phenomenaConfig.retrogradeBodies || ['mercury','venus','mars','jupiter','saturn']).slice(0,7).length;
    const tracks = [...document.querySelectorAll('#retrogradePanel [data-retro-path] > svg')];
    if (tracks.length !== expected) throw new Error('Retrograde rows changed');
    const ids = tracks.map(svg => svg.querySelector('marker').id);
    if (new Set(ids).size !== tracks.length) throw new Error('Retrograde arrows share ids');
    for (const svg of tracks) {
      const marker = svg.querySelector('marker');
      const path = svg.querySelectorAll(':scope > path')[1];
      if (path.getAttribute('marker-end') !== 'url(#' + marker.id + ')') throw new Error('Retrograde arrow reference broken');
      if (!path.getAttribute('d').startsWith('M')) throw new Error('Retrograde track is empty');
    }
    keys.forEach((key,index) => {
      if (document.querySelector('[data-help-key="' + key + '"] .card-help-button') !== controls[index]) throw new Error('Mechanics controls replaced');
    });
  });
  await checkHelpAndDetails(page, ['season_axis','retrograde']);
}

/** Checks real mode buttons, date coupling, retained controls and repeated initialization.
 * @param {import('playwright').Page} page Dashboard. @returns {Promise<void>}
 */
async function checkPlanetCards(page){
  const offset = await page.evaluate(() => dashboardContext.getDayOffset());
  try {
    await page.evaluate(() => {barycenterController.init();barycenterController.init();});
    const button = page.locator('#btnBarycenterJupiter');
    await button.click();
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    const before = await page.locator('#innerPhasesPanel').textContent();
    const sentinel = await page.evaluate(() => {
      window.planetCardTestSentinel = document.querySelector('#solarSystem');
      return barycenterController.getMode();
    });
    assert.equal(sentinel, 'jupiter');
    await page.evaluate(async () => {
      const dateSlider = document.getElementById('solarDateSlider');
      dateSlider.value = String(dashboardContext.getDayOffset() + 35);
      dateSlider.dispatchEvent(new Event('input', {bubbles:true}));
      // Finish the date update's queued anchor/layout frames before the next click.
      for (let frame = 0; frame < 8; frame += 1) await new Promise(resolve => requestAnimationFrame(resolve));
    });
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.evaluate(() => barycenterController.getMode()), 'jupiter');
    assert.notEqual(await page.locator('#innerPhasesPanel').textContent(), before);
    assert.equal(await page.evaluate(() => window.planetCardTestSentinel === document.querySelector('#solarSystem')), true);
    await page.locator('#btnBarycenterJupiterSaturn').click();
    assert.equal(await page.locator('#btnBarycenterJupiterSaturn').getAttribute('aria-pressed'), 'true');
    assert.equal(await button.getAttribute('aria-pressed'), 'false');
    await page.locator('#btnBarycenterAll').click();
    assert.equal(await page.evaluate(() => barycenterController.getMode()), 'all');
    await checkHelpAndDetails(page, ['inner_phases','barycenter']);
  } finally {
    await page.evaluate(previous => {
      dashboardContext.setDayOffset(previous);
      refreshDateDrivenTiles();
      barycenterController.setMode('all');
      delete window.planetCardTestSentinel;
    }, offset);
  }
}

/** Checks explicit year/place rendering, retained tools and the schematic point counts.
 * @param {import('playwright').Page} page Dashboard. @returns {Promise<void>}
 */
async function checkSolarGeometryCards(page){
  await page.evaluate(() => {
    const context = dashboardContext.snapshot();
    const keys = ['lagrange','analemma'];
    const tools = keys.map(key => document.querySelector('[data-help-key="' + key + '"] .card-help-button'));
    try {
      for (let repeat = 0; repeat < 2; repeat++) {
        lagrangeController.render(context);
        analemmaController.render(context);
      }
      if (document.querySelectorAll('#lagrangeMap .lagrange-point').length !== 5) throw new Error('Lagrange point count changed');
      if (document.querySelectorAll('#analemmaMap .analemma-month-dot').length !== 12) throw new Error('Analemma month markers changed');
      const orbit = document.getElementById('lagrangeMap').innerHTML;
      const curve = document.querySelector('#analemmaMap .analemma-curve').getAttribute('d');
      const other = {...context,location:{name:'Southern reference',latitude:-33.86,longitude:151.2}};
      lagrangeController.render(other);
      analemmaController.render(other);
      if (document.getElementById('lagrangeMap').innerHTML !== orbit) throw new Error('Lagrange schematic unexpectedly depends on location');
      if (document.querySelector('#analemmaMap .analemma-curve').getAttribute('d') === curve) throw new Error('Analemma ignored explicit location');
      analemmaController.render({...context,date:new Date(2028,1,29,12)});
      if (!document.getElementById('analemmaSummary').textContent.includes('2028')) throw new Error('Analemma ignored explicit year');
      keys.forEach((key,index) => {
        if (document.querySelector('[data-help-key="' + key + '"] .card-help-button') !== tools[index]) throw new Error('Solar geometry tools replaced');
      });
    } finally {
      lagrangeController.render(context);
      analemmaController.render(context);
    }
  });
  await page.evaluate(async () => {
    for (let frame = 0; frame < 8; frame++) await new Promise(resolve => requestAnimationFrame(resolve));
  });
  await checkHelpAndDetails(page, ['lagrange','analemma']);
}

/** Checks orbit marker counts, explicit time updates, empty data and satellite fallback templates.
 * @param {import('playwright').Page} page Dashboard. @returns {Promise<void>}
 */
async function checkOrbitCards(page){
  await page.evaluate(() => {
    const context = dashboardContext.snapshot();
    const keys = ['exoplanets','satellites'];
    const tools = keys.map(key => document.querySelector('[data-help-key="' + key + '"] .card-help-button'));
    try {
      exoplanetsController.render(context);
      satellitesController.render(context);
      const expected = phenomenaConfig.exoplanetSystems.reduce((count,system) => count+system.planets.length,0);
      if (document.querySelectorAll('#exoplanetComparison .exoplanet-planet').length !== expected) throw new Error('Configured exoplanet markers missing');
      if (document.querySelectorAll('#satelliteMap ellipse').length !== phenomenaConfig.satellites.length) throw new Error('Configured satellite orbits missing');
      const exoplanetMap = document.getElementById('exoplanetComparison').innerHTML;
      const satelliteMap = document.getElementById('satelliteMap').innerHTML;
      const later = {...context,date:new Date(context.date.getTime()+7*86400000)};
      exoplanetsController.render(later);
      satellitesController.render(later);
      if (document.getElementById('exoplanetComparison').innerHTML === exoplanetMap) throw new Error('Exoplanets ignored selected time');
      if (document.getElementById('satelliteMap').innerHTML === satelliteMap) throw new Error('Satellites ignored selected time');
      const common = {document,cloneTemplate,createSvgElement:createChartSvgElement,getTranslations:() => t,appendSummaryText,appendSummaryLine,formatDate:formatDateStamp};
      window.PLANETENUHR_EXOPLANETS_CARD.create({...common,model:exoplanetsModel,getSystems:() => []}).render(context);
      if (document.querySelectorAll('#exoplanetComparison .exoplanet-system-panel').length) throw new Error('Empty exoplanet configuration retained panels');
      if (document.getElementById('exoplanetSummary').textContent.trim() !== t.exoplanets_none) throw new Error('Exoplanet empty state changed');
      window.PLANETENUHR_SATELLITES_CARD.create({...common,model:satellitesModel,getSatellites:() => []}).render(context);
      if (document.querySelectorAll('#satelliteMap ellipse').length) throw new Error('Empty satellite configuration retained orbits');
      const fallbackDocument = {
        getElementById(id){if (id === 'satelliteSummaryItemTemplate') return null;return document.getElementById(id);},
        createTextNode:text => document.createTextNode(text)
      };
      window.PLANETENUHR_SATELLITES_CARD.create({...common,document:fallbackDocument,model:satellitesModel,getSatellites:() => phenomenaConfig.satellites}).render(context);
      const names = [...document.querySelectorAll('#satelliteSummary .satellite-summary-grid strong')].map(node => node.textContent);
      if (names.join('|') !== phenomenaConfig.satellites.map(sat => sat.name).join('|')) throw new Error('Satellite fallback names missing');
      if (!document.getElementById('satelliteSummary').textContent.includes(String(phenomenaConfig.satellites[0].altitudeKm))) throw new Error('Satellite fallback details missing');
      keys.forEach((key,index) => {
        if (document.querySelector('[data-help-key="' + key + '"] .card-help-button') !== tools[index]) throw new Error('Orbit card tools replaced');
      });
    } finally {
      exoplanetsController.render(context);
      satellitesController.render(context);
    }
  });
  await page.evaluate(async () => {
    for (let frame = 0; frame < 8; frame++) await new Promise(resolve => requestAnimationFrame(resolve));
  });
  await checkHelpAndDetails(page, ['exoplanets','satellites']);
}

/** Checks static orbit cards retain SVG controls, click details and stable local renders.
 * @param {import('playwright').Page} page Dashboard. @returns {Promise<void>}
 */
async function checkStaticOrbitCards(page){
  const initial = await page.evaluate(() => {
    const smallHelp = document.querySelector('[data-help-key="small_bodies"] .card-help-button');
    const smallReset = document.getElementById('smallBodiesReset');
    const spacecraftHelp = document.querySelector('[data-help-key="spacecraft"] .card-help-button');
    const smallMap = document.getElementById('smallBodiesMap');
    const spacecraftMap = document.getElementById('spacecraftMap');
    const smallMarkup = smallMap.innerHTML;
    const spacecraftMarkup = spacecraftMap.innerHTML;
    smallBodiesController.render();
    spacecraftController.render();
    if (smallMap.innerHTML !== smallMarkup) throw new Error('Small-body render changed its static SVG');
    if (spacecraftMap.innerHTML !== spacecraftMarkup) throw new Error('Spacecraft render changed its static SVG');
    if (document.querySelectorAll('#smallBodiesMap ellipse.small-bodies-orbit').length !== smallBodiesConfig.comets.length) throw new Error('Configured comet orbits missing');
    if (document.querySelectorAll('#spacecraftMap .spacecraft-marker').length !== phenomenaConfig.spacecraft.length) throw new Error('Configured spacecraft markers missing');
    if (smallHelp !== document.querySelector('[data-help-key="small_bodies"] .card-help-button')) throw new Error('Small-body help control replaced');
    if (smallReset !== document.getElementById('smallBodiesReset')) throw new Error('Small-body reset control replaced');
    if (spacecraftHelp !== document.querySelector('[data-help-key="spacecraft"] .card-help-button')) throw new Error('Spacecraft help control replaced');
    return {detailText:document.getElementById('smallBodiesDetail').textContent, scrollY:window.scrollY};
  });
  await page.locator('#smallBodiesMap .small-bodies-hitarea').first().dispatchEvent('click');
  const afterClick = await page.evaluate(() => ({
    detailText:document.getElementById('smallBodiesDetail').textContent,
    scrollY:window.scrollY
  }));
  assert.notEqual(afterClick.detailText, initial.detailText, 'Small-body hit area should update its local detail');
  assert.equal(afterClick.scrollY, initial.scrollY, 'Small-body detail click should not jump the page');
  await checkHelpAndDetails(page, ['small_bodies','spacecraft']);
}

/** Exercises the same locale/viewport case against either implementation.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Loopback URL. @param {string} language App language.
 * @param {number} width Viewport width. @returns {Promise<object>} Deterministic before/after snapshot.
 */
async function runCase(browser,url,language,width){
  const page = await browser.newPage({viewport:{width,height:900}});
  if (process.env.PLANETENUHR_REDUCED_MOTION_BASELINE === '1') {
    await page.emulateMedia({reducedMotion:'reduce'});
  }
  const errors = [];
  let externalRequests = 0;
  page.on('pageerror',error => errors.push(error.message));
  page.on('dialog',dialog => {errors.push(dialog.message());return dialog.dismiss();});
  await page.route('**/*',async route => {
    const requestUrl = new URL(route.request().url());
    if (process.env.PLANETENUHR_EXTERNAL_DATA_BASELINE === '1' && requestUrl.hostname === 'services.swpc.noaa.gov') {
      externalRequests++;
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([['time_tag','Kp'],['2026-10-27 12:00:00',5.2]])});
      return;
    }
    if (process.env.PLANETENUHR_EXTERNAL_DATA_BASELINE === '1' && requestUrl.hostname === 'public.api.bsky.app') {
      externalRequests++;
      const actor = requestUrl.searchParams.get('actor');
      let feed = [];
      if (actor === 'dlr-next.bsky.social') {
        feed = [{post:{uri:'at://did:plc:planetenuhr/app.bsky.feed.post/dlr-today',indexedAt:'2026-10-27T12:00:00Z',author:{handle:actor,displayName:'DLR-next'},record:{createdAt:'2026-10-27T12:00:00Z',text:'Test post for the current day'},embed:{images:[{fullsize:'https://cdn.example.test/dlr.jpg',alt:'Mars mission'}]}}}];
      } else if (actor === 'stellarvisions.bsky.social') {
        feed = [{post:{uri:'at://did:plc:planetenuhr/app.bsky.feed.post/stellar-old',indexedAt:'2026-10-26T12:00:00Z',author:{handle:actor,displayName:'Stellar Visions'},record:{createdAt:'2026-10-26T12:00:00Z',text:'Earlier astronomy image'},embed:{images:[{fullsize:'https://cdn.example.test/stellar.jpg',alt:'Nebula'}]}}}];
      }
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({feed})});
      return;
    }
    if (route.request().url().startsWith(url + '/')) return route.continue();
    return route.abort();
  });
  try {
    await page.clock.setFixedTime(new Date('2026-10-27T12:00:00Z'));
    await page.goto(url + '/?lang=' + language + '&date=20261027&place=berlin',{waitUntil:'domcontentloaded'});
    try {
      await page.locator('#moonIcon [data-moon-shadow]').waitFor({state:'attached'});
    } catch (error) {
      const pageErrors = errors.join(' | ');
      throw new Error('Dashboard did not initialize its Moon view. Page errors: ' + pageErrors, {cause:error});
    }
    if (process.env.PLANETENUHR_EXTERNAL_DATA_BASELINE === '1') {
      await page.waitForFunction(() => {
        const aurora = document.getElementById('auroraStatus');
        const bskyCard = document.getElementById('bskyCard');
        const bskyStatus = document.getElementById('bskyStatus');
        return aurora && aurora.textContent !== (translations[lang] || translations.en).aurora_loading && bskyCard && !bskyCard.hidden && bskyStatus.hidden;
      });
    }
    const initial = await capture(page);
    await checkPolarisCard(page);
    const initialExternalRequests = externalRequests;
    await checkEncounterGraphics(page);
    await page.evaluate(() => {
      let todayButton = document.getElementById('btnSolarToday');
      let nextButton = document.getElementById('btnSolarNext');
      if (window.innerWidth <= 760) {
        todayButton = document.getElementById('btnSolarTodayMobile');
        nextButton = document.getElementById('btnSolarNextMobile');
      }
      todayButton.click();
      for (let day = 0; day < 35; day += 1) {
        nextButton.click();
      }
    });
    const december = await capture(page);
    if (process.env.PLANETENUHR_EXTERNAL_DATA_BASELINE === '1') assert.equal(externalRequests,initialExternalRequests,'Date changes must not reload external feeds');
    assert.equal(december.date,'2026-12-01', JSON.stringify(await page.evaluate(() => ({
      now:new Date().toISOString(),
      offset:dashboardContext.getDayOffset(),
      selected:dashboardContext.getDate().toISOString(),
      slider:document.getElementById('solarDateSlider').value
    }))));
    assert.notEqual(december.shadow,initial.shadow);
    await page.locator('#locationSelector').evaluate(node => {node.value='tokyo';node.dispatchEvent(new Event('change',{bubbles:true}));});
    const tokyo = await capture(page);
    if (process.env.PLANETENUHR_EXTERNAL_DATA_BASELINE === '1') assert.equal(externalRequests,initialExternalRequests,'Location changes must not reload external feeds');
    assert.equal(tokyo.location,'tokyo');
    await page.locator('#locationSelector').evaluate(node => {node.value='berlin';node.dispatchEvent(new Event('change',{bubbles:true}));});
    await page.evaluate(() => {
      let todayButton = document.getElementById('btnSolarToday');
      if (window.innerWidth <= 760) {
        todayButton = document.getElementById('btnSolarTodayMobile');
      }
      todayButton.click();
    });
    const reset = await capture(page);
    if (process.env.PLANETENUHR_EXTERNAL_DATA_BASELINE === '1') assert.equal(externalRequests,initialExternalRequests,'Date reset must not reload external feeds');
    assert.equal(reset.date,'2026-10-27');
    const dst = await page.evaluate(() => {
      const model = window.PLANETENUHR_EXPLORER_MODEL;
      const spring = model.localDayBounds(new Date('2026-03-29T12:00:00Z'),'Europe/Berlin');
      const autumn = model.localDayBounds(new Date('2026-10-25T12:00:00Z'),'Europe/Berlin');
      return {spring:(spring.end-spring.start)/3600000,autumn:(autumn.end-autumn.start)/3600000};
    });
    assert.deepEqual(dst,{spring:23,autumn:25});
    const calendar = await page.evaluate(() => {
      const hints = [...document.querySelectorAll('#dailyHighlightsList li')].map(node => node.dataset.highlightId);
      document.getElementById('btnCalendarViewMonth').click();
      document.querySelector('[data-calendar-filter="meteor"]').click();
      const selectedView = document.querySelector('[data-calendar-view][aria-pressed="true"]');
      const selectedFilter = document.querySelector('[data-calendar-filter][aria-pressed="true"]');
      return {view:selectedView.dataset.calendarView,filter:selectedFilter.dataset.calendarFilter,heading:document.getElementById('calendarMonthTitle').textContent,
        month:document.getElementById('calendarMonthGrid').textContent.replace(/\s+/g,' ').trim(),
        hintsBefore:hints,hintsAfter:[...document.querySelectorAll('#dailyHighlightsList li')].map(node => node.dataset.highlightId)};
    });
    assert.equal(calendar.view,'month');
    assert.equal(calendar.filter,'meteor');
    assert.deepEqual(calendar.hintsAfter,calendar.hintsBefore);
    calendar.month = createHash('sha256').update(calendar.month).digest('hex');
    await checkSkyCalendar(page, width);
    const button = page.locator('.solar-card .diagram-open');
    await button.waitFor();
    await button.click();
    assert.equal(await page.locator('#diagramDetailContent [data-solar-marker]').count(),8);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.activeElement === document.querySelector('.solar-card .diagram-open'));
    await checkSolarEclipse(page);
    await checkDateControlsAndSolar(page, width);
    await checkViewportStability(page);
    await checkCardTools(page, width);
    await checkConstellationCards(page);
    await checkMechanicsCards(page);
    await checkPlanetCards(page);
    await checkSolarGeometryCards(page);
    await checkOrbitCards(page);
    await checkStaticOrbitCards(page);
    assert.deepEqual(errors,[]);
    return {initial,december,tokyo,reset,dst,calendar,externalRequests};
  } finally {await page.close();}
}

/** Records or compares all supported language, viewport and browser cases.
 * No parameters. @returns {Promise<void>} Resolves after browsers and server close.
 */
async function main(){
  const {server,url} = await startServer();
  const results = {};
  let reference;
  if (mode === '--compare') reference = JSON.parse(fs.readFileSync(snapshotPath,'utf8'));
  try {
    for (const engine of ['chromium','webkit']) {
      if (selectedCase && !selectedCase.startsWith(engine + '-')) continue;
      const options = {headless:true};
      if (engine === 'chromium' && process.env.PLANETENUHR_CHROMIUM_EXECUTABLE) options.executablePath = process.env.PLANETENUHR_CHROMIUM_EXECUTABLE;
      if (engine === 'webkit' && process.env.PLANETENUHR_WEBKIT_EXECUTABLE) options.executablePath = process.env.PLANETENUHR_WEBKIT_EXECUTABLE;
      const browser = await playwright[engine].launch(options);
      try {
        for (const language of ['de','en','fr']) {
          for (const width of [320,390,1280]) {
            if (selectedCase && selectedCase !== engine + '-' + language + '-' + width) continue;
            const caseName = engine + '-' + language + '-' + width;
            results[caseName] = await runCase(browser,url,language,width);
            if (mode === '--compare') assert.deepEqual(results[caseName], reference[caseName], caseName);
            console.log('Browser baseline: ' + caseName + ' checked.');
          }
        }
      } finally {await browser.close();}
    }
    if (mode === '--record') fs.writeFileSync(snapshotPath,JSON.stringify(results,null,2) + '\n');
    else {
      if (selectedCase) {
        assert.ok(reference[selectedCase], 'Selected reference case must exist');
        assert.deepEqual(results,{[selectedCase]:reference[selectedCase]});
      } else assert.deepEqual(results,reference);
    }
    console.log('Browser baseline: ' + Object.keys(results).length + ' cases ' + mode.slice(2) + 'ed.');
  } finally {await new Promise(resolve => server.close(resolve));}
}

main().catch(error => {console.error(error);process.exitCode = 1;});
