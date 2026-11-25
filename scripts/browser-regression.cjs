const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const playwright = require(process.env.PLANETENUHR_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const moonReference = JSON.parse(fs.readFileSync(path.join(__dirname, 'baselines/moon-direction-model.json'), 'utf8'));

/** Serves local dashboard files through browser routing without a network listener.
 * @param {import('playwright').Route} route Intercepted browser request.
 * @param {string} origin Synthetic local origin.
 * @returns {Promise<void>} Fulfilled local file or blocked external request.
 */
async function serveDashboard(route, origin){
  const url = new URL(route.request().url());
  if (url.origin !== origin) {
    await route.abort();
    return;
  }
  let pathname = url.pathname;
  if (pathname === '/') {
    pathname = '/index.html';
  }
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) {
    await route.fulfill({status:403,body:''});
    return;
  }
  try {
    const body = await fs.promises.readFile(file);
    const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
      '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.woff2':'font/woff2'};
    await route.fulfill({status:200,body,contentType:types[path.extname(file)] || 'application/octet-stream'});
  } catch (error) {
    await route.fulfill({status:404,body:''});
  }
}

/** Checks real application wiring across languages, locations and browser zones.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @param {string} language UI language.
 * @param {string} browserZone Browser's own time zone, independent of the selected city.
 * @returns {Promise<void>} Resolves when all rendered regression checks pass.
 */
async function checkDashboard(browser, url, language, browserZone){
  const page = await browser.newPage({timezoneId:browserZone, viewport:{width:1024,height:900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => {
    errors.push(dialog.message());
    return dialog.dismiss();
  });
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.clock.setFixedTime(new Date('2026-11-05T12:00:00Z'));
    await page.goto(url + '/?lang=' + language + '&date=20261105&place=berlin', {waitUntil:'domcontentloaded'});
    await page.locator('#moonIcon [data-moon-shadow]').waitFor({state:'attached'});
    const moonLabels = await page.evaluate(language => {
      const translations = window.PLANETENUHR_TRANSLATIONS[language];
      const jupiter = document.getElementById('jupiterSystem');
      const planetaryLabels = Array.from(document.querySelectorAll('#planetSystems [data-planetary-moon-label]'));
      return {
        jupiterMarkers:Array.from(jupiter.querySelectorAll('[data-jupiter-moon]'), node => node.textContent),
        jupiterLabels:Array.from(jupiter.querySelectorAll('[data-jupiter-label]'), node => node.textContent),
        expectedJupiterLabels:window.PLANETENUHR_JUPITER_MOONS.map(moon => translations['moon_' + moon.key]),
        planetaryLabels:planetaryLabels.map(node => node.textContent),
        expectedPlanetaryLabels:planetaryLabels.map(node => translations['moon_' + node.dataset.moon] ?? node.dataset.moon)
      };
    }, language);
    assert.deepEqual(moonLabels.jupiterMarkers, Array(10).fill(''), 'Jupiter moon markers contain no text');
    assert.deepEqual(moonLabels.jupiterLabels, moonLabels.expectedJupiterLabels, 'One localized label per Jupiter moon');
    assert.ok(moonLabels.planetaryLabels.length > 0);
    assert.deepEqual(moonLabels.planetaryLabels, moonLabels.expectedPlanetaryLabels, 'Other planetary moon labels stay localized');
    const calendarTitle = page.locator('#calendarMonthTitle');
    const expectedMonths = await page.evaluate(language => [10, 11, 12].map(month =>
      new Date(2026, month, 1).toLocaleDateString(language, {month:'long',year:'numeric'})), language);
    await page.locator('[data-calendar-filter="season"]').evaluate(button => button.click());
    const upcoming = await page.locator('#calendarNext').textContent();
    assert.ok(await calendarTitle.isVisible());
    assert.equal(await calendarTitle.textContent(), expectedMonths[0]);
    await page.locator('#btnSolarNextMonth').click();
    assert.ok(await calendarTitle.isVisible(), 'The month must be visible in the list view');
    assert.equal(await calendarTitle.textContent(), expectedMonths[1]);
    assert.equal(await page.locator('#calendarNext').textContent(), upcoming,
      'The visible month changes even when the next event stays the same');
    await page.locator('#btnCalendarViewMonth').evaluate(button => button.click());
    await page.locator('#btnSolarNextMonth').click();
    assert.ok(await calendarTitle.isVisible());
    assert.equal(await calendarTitle.textContent(), expectedMonths[2]);
    assert.equal(await page.locator('#calendarMonthGrid .is-selected-month-day [data-calendar-day-number]').textContent(), '5');
    await page.locator('#btnSolarPrevMonth').click();
    assert.equal(await calendarTitle.textContent(), expectedMonths[1]);
    await page.locator('#btnSolarPrevMonth').click();
    assert.equal(await calendarTitle.textContent(), expectedMonths[0]);
    await page.locator('#btnCalendarViewList').evaluate(button => button.click());
    for (const place of ['berlin','new_york','sydney']) {
      const result = await page.evaluate(place => {
        dashboardContext.setLocationKey(place);
        refreshDateDrivenTiles('location');
        const context = dashboardContext.snapshot();
        const sunrise = window.PLANETENUHR_SOLAR_VISIBILITY.solarEventUtc(context.date, context.location.latitude, context.location.longitude, 90.833, true);
        const options = {hour:'2-digit',minute:'2-digit',hour12:false,timeZone:context.timeZone};
        return {
          clock:fmtTimeOnly(new Date('2026-11-05T12:00:00Z')),
          expectedClock:new Date('2026-11-05T12:00:00Z').toLocaleTimeString(context.language, options),
          sunrise:document.getElementById('sunriseTime').textContent,
          expectedSunrise:sunrise.toLocaleTimeString(context.language, options)
        };
      }, place);
      assert.equal(result.clock, result.expectedClock, language + '/' + place + ': clock zone');
      assert.equal(result.sunrise, result.expectedSunrise, language + '/' + place + ': sunrise zone');
    }
    const moonCases = moonReference.samples.filter(sample => sample.language === language);
    for (const sample of moonCases) {
      const actual = await page.evaluate(sample => {
        const location = window.PLANETENUHR_LOCATIONS.find(city => city.key === sample.key);
        const date = new Date(sample.iso);
        return {
          direction:moonDirection.lookDirection(date, location),
          reference:moonDirection.referenceDate(date, location).toISOString(),
          label:moonDirection.directionLabel(date, location)
        };
      }, sample);
      assert.equal(actual.direction.directionLabel, sample.direction.directionLabel);
      assert.equal(actual.direction.altitudeText, sample.direction.altitudeText);
      assert.ok(Math.abs(actual.direction.azimuthDeg - sample.direction.azimuthDeg) < 1e-8);
      assert.equal(actual.reference, sample.reference);
      assert.equal(actual.label, sample.label);
    }
    const milkyWay = await page.evaluate(() => {
      const translations = window.PLANETENUHR_TRANSLATIONS;
      const config = window.PLANETENUHR_MILKY_WAY_CONFIG;
      // The existing instance must use its injected dependencies, even if globals change.
      window.PLANETENUHR_TRANSLATIONS = undefined;
      window.PLANETENUHR_MILKY_WAY_CONFIG = undefined;
      try {
        milkyWayCard.render(t);
        const button = document.querySelector('#milkyWayTopics [data-topic-id="center"]');
        button.click();
        return {
          title:document.getElementById('milkyWayTopicTitle').textContent,
          expected:t.milky_center_title,
          selected:button.getAttribute('aria-pressed'),
          width:document.querySelector('[data-help-key="milky_way"]').getBoundingClientRect().width
        };
      } finally {
        window.PLANETENUHR_TRANSLATIONS = translations;
        window.PLANETENUHR_MILKY_WAY_CONFIG = config;
      }
    });
    assert.equal(milkyWay.title, milkyWay.expected);
    assert.equal(milkyWay.selected, 'true');
    assert.ok(milkyWay.width > 0, 'Milky Way card must retain visible geometry');
    const conjunction = page.locator('[data-help-key="conjunctions"]');
    await conjunction.locator('#btnConjunctionCalculation').evaluate(button => button.click());
    const diagram = conjunction.locator('.conjunction-calc-diagram > svg');
    await diagram.waitFor({state:'visible'});
    const earth = diagram.locator('.earth-globe');
    const moonCardEarth = page.locator('#earthMoonGlobe .earth-globe');
    assert.equal(await earth.locator('[data-earth-shadow]').count(), 1);
    assert.notEqual(await earth.locator('clipPath').getAttribute('id'), await moonCardEarth.locator('clipPath').getAttribute('id'));
    for (const [planet, gradient] of [['mars', 'conjunctionMarsSurface'], ['jupiter', 'conjunctionJupiterClouds']]) {
      const disc = diagram.locator('[data-body="' + planet + '"] .body-disc');
      const surface = await disc.evaluate(node => ({fill:getComputedStyle(node).fill,width:node.getBoundingClientRect().width}));
      assert.ok(surface.fill.includes('#' + gradient), planet + ': shaded surface');
      assert.ok(surface.width > 10, planet + ': visible globe');
    }
    const multipleConjunctions = await page.evaluate(() => {
      dashboardContext.applyUrl(new URLSearchParams('date=20270901&place=berlin'));
      refreshDateDrivenTiles('date');
      const timeline = Array.from(document.querySelectorAll('#conjunctionTimeline .conjunction-event'));
      const articles = Array.from(document.querySelectorAll('#conjunctionCalculationEvents article'));
      return {
        timeline: timeline.map(event => ({
          pair:event.dataset.pair,
          label:event.querySelector('title').textContent
        })),
        diagrams: articles.map(article => {
          const svg = article.querySelector('.conjunction-calc-diagram > svg');
          const first = svg.querySelector('[data-conjunction-globe="a"] > svg').dataset.body;
          const second = svg.querySelector('[data-conjunction-globe="b"] > svg').dataset.body;
          return {
            pair:first + '-' + second,
            label:article.querySelector('h4').textContent,
            earth:svg.querySelector('[data-conjunction-globe="earth"] > svg').dataset.body,
            localArrows:Array.from(svg.querySelectorAll('[marker-end]')).every(ray => {
              const id = ray.getAttribute('marker-end').slice(5, -1);
              return Boolean(svg.querySelector('marker[id="' + id + '"]'));
            })
          };
        }),
        ids:Array.from(document.querySelectorAll('#conjunctionCalculationEvents svg [id]'), node => node.id)
      };
    });
    assert.equal(multipleConjunctions.timeline.length, 4);
    assert.equal(multipleConjunctions.timeline.filter(event => event.pair === 'mercury-venus').length, 2);
    assert.deepEqual(
      multipleConjunctions.diagrams.map(({pair, label}) => ({pair, label})),
      multipleConjunctions.timeline,
      'Each event must keep its own matching diagram, including repeated pairs'
    );
    assert.ok(multipleConjunctions.diagrams.every(item => item.earth === 'earth' && item.localArrows));
    assert.equal(new Set(multipleConjunctions.ids).size, multipleConjunctions.ids.length);
    await page.locator('[data-calendar-filter="season"]').evaluate(button => button.click());
    await page.locator('#solarDateSlider').evaluate(slider => {
      slider.value = '134';
      slider.dispatchEvent(new Event('input', {bubbles:true}));
    });
    const calendarDate = page.locator('#calendarTimeline [data-calendar-date]').first();
    const nextEvent = page.locator('#calendarNext');
    const equinox = await page.evaluate(() => formatDateStamp(new Date(2027, 2, 20)));
    assert.equal(await calendarDate.textContent(), equinox, 'Calendar list must follow the slider');
    assert.ok((await nextEvent.textContent()).includes(equinox));
    await page.locator('#btnCalendarViewMonth').evaluate(button => button.click());
    const month = await page.evaluate(language => new Date(2027, 2, 1).toLocaleDateString(language, {month:'long',year:'numeric'}), language);
    assert.equal(await page.locator('#calendarMonthTitle').textContent(), month);
    const selectedDay = page.locator('#calendarMonthGrid .is-selected-month-day [data-calendar-day-number]');
    assert.equal(await selectedDay.textContent(), '19');
    await page.locator('#btnSolarNext').evaluate(button => button.click());
    assert.equal(await selectedDay.textContent(), '20');
    assert.equal(await calendarDate.textContent(), equinox, 'Events on the selected day must remain visible');
    await page.locator('#btnSolarNext').evaluate(button => button.click());
    assert.equal(await selectedDay.textContent(), '21');
    assert.notEqual(await calendarDate.textContent(), equinox);
    assert.ok(!(await nextEvent.textContent()).includes(equinox));
    const monthEvents = page.locator('#calendarMonthGrid [data-calendar-month-event]');
    assert.equal(await monthEvents.count(), 0);
    await page.locator('#calendarShowPast').evaluate(checkbox => checkbox.click());
    assert.equal(await monthEvents.count(), 1, 'Show past restores the earlier event in the selected month');
    assert.ok(!(await nextEvent.textContent()).includes(equinox));
    const eclipse = await page.evaluate(() => {
      dashboardContext.applyUrl(new URLSearchParams('date=20280722&place=sydney'));
      const context = dashboardContext.snapshot();
      const visibility = eclipseVisibilityForLocation(context.date, context.location);
      moonNodesController.render(context);
      earthMoonController.renderPhase(context);
      const reference = moonDirection.referenceDate(context.date, context.location);
      const direction = moonDirection.lookDirection(reference, context.location);
      return {
        source:visibility.source,
        moonLabel:document.getElementById('moonLocalPositionLabel').textContent,
        expectedMoonLabel:moonDirection.directionLabel(context.date, context.location),
        moonAltitude:document.getElementById('moonLocalPositionSub').textContent,
        expectedMoonAltitude:direction.altitudeText,
        title:localizedEclipseCalendarTitle(visibility.entry.kind, visibility.entry.type, context.language),
        summary:document.getElementById('moonNodesSummary').textContent
      };
    });
    assert.equal(eclipse.source, 'fallback');
    assert.equal(eclipse.moonLabel, eclipse.expectedMoonLabel);
    assert.equal(eclipse.moonAltitude, eclipse.expectedMoonAltitude);
    assert.ok(eclipse.summary.includes(eclipse.title), 'Missing localized eclipse title: ' + eclipse.title);
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks that the enlarged Milky Way chart keeps its sky background on a phone viewport.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves when the modal preserves all three sky backgrounds.
 */
async function checkMobileMilkyWay(browser, url){
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.clock.setFixedTime(new Date('2026-11-05T12:00:00Z'));
    await page.goto(url + '/?lang=de&date=20261105&place=berlin', {waitUntil:'domcontentloaded'});
    const card = page.locator('[data-help-key="milky_way"]');
    await card.locator('[data-milky-view="sky"]').evaluate(button => button.click());
    const sky = card.locator('.milky-way-sky-visual');
    const dialog = page.locator('#diagramDetailDialog');
    const openButton = card.locator('.diagram-open');
    await openButton.waitFor({state:'visible',timeout:10000});
    const backgrounds = new Set();
    for (const light of ['night', 'twilight', 'day']) {
      const background = await sky.evaluate((visual, light) => {
        visual.dataset.milkySkyLight = light;
        return getComputedStyle(visual).backgroundImage;
      }, light);
      assert.notEqual(background, 'none');
      backgrounds.add(background);
      await openButton.evaluate(button => button.click());
      const enlarged = dialog.locator('.milky-way-sky-chart');
      await enlarged.waitFor({state:'visible'});
      assert.equal(await enlarged.evaluate(svg => getComputedStyle(svg).backgroundImage), background, light);
      await dialog.locator('#diagramDetailClose').evaluate(button => button.click());
    }
    assert.equal(backgrounds.size, 3);
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks the November 2026 Mars–Jupiter entry and the day-based summary cutoff.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves when both cards show the event on the correct dates.
 */
async function checkMarsJupiterDates(browser, url){
  const page = await browser.newPage({timezoneId:'America/Los_Angeles'});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.clock.setFixedTime(new Date('2026-11-16T12:00:00Z'));
    await page.goto(url + '/?lang=de&date=20261116&place=berlin', {waitUntil:'domcontentloaded'});
    const marker = page.locator('#conjunctionTimeline [data-pair="mars-jupiter"]');
    const minimum = await marker.getAttribute('data-date');
    assert.ok(new Date(minimum) < new Date('2026-11-16T12:00:00Z'));
    assert.match(await marker.locator('title').textContent(), /16\.11\.2026/);
    const summary = page.locator('#conjunctionSummary');
    assert.match(await summary.textContent(), /Enge Begegnung am gewählten Tag: 16\.11\.2026 · Mars - Jupiter/);

    const calendar = page.locator('#skyCalendarCard');
    const list = calendar.locator('#calendarTimeline');
    const entry = list.locator('.calendar-item').filter({hasText:'Konjunktion Mars-Jupiter'});
    assert.equal(await entry.count(), 0);
    await calendar.locator('#calendarShowPast').evaluate(checkbox => checkbox.click());
    assert.ok(await entry.isVisible(), 'The recent entry must be in the collapsed list');
    assert.equal(await entry.locator('[data-calendar-date]').textContent(), '15.11.2026');
    assert.equal(await list.locator('.calendar-item').count(), 4);
    await calendar.locator('[data-calendar-filter="planet"]').evaluate(button => button.click());
    assert.ok(await entry.isVisible(), 'The entry must also stay visible under the planet filter');

    await page.locator('#btnSolarNext').evaluate(button => button.click());
    assert.match(await summary.textContent(), /Keine bevorstehende enge Begegnung/);
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks readable, collision-free conjunction labels before and after a mobile resize.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves when the timeline fits both phone widths.
 */
async function checkMobileConjunctionLabels(browser, url){
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.goto(url + '/?lang=de&date=20270901&place=berlin', {waitUntil:'domcontentloaded'});
    const timeline = page.locator('#conjunctionTimeline > svg');
    for (const width of [390, 320]) {
      await page.setViewportSize({width,height:844});
      await page.waitForFunction(() => {
        const svg = document.querySelector('#conjunctionTimeline > svg');
        return svg && svg.viewBox.baseVal.width === svg.parentElement.clientWidth;
      });
      const layout = await timeline.evaluate(svg => {
        const bounds = svg.getBoundingClientRect();
        const labels = Array.from(svg.querySelectorAll('.conjunction-timeline-label'), label => {
          const rect = label.getBoundingClientRect();
          const font = parseFloat(getComputedStyle(label).fontSize) * label.getScreenCTM().a;
          return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,font};
        });
        return {left:bounds.left,right:bounds.right,labels};
      });
      assert.equal(layout.labels.length, 7, 'Four events and three dates');
      for (const [index, label] of layout.labels.entries()) {
        assert.ok(label.font >= 12.7, 'Timeline labels must stay readable at ' + width + 'px');
        assert.ok(label.left >= layout.left && label.right <= layout.right, 'Labels must stay inside the timeline');
        for (const other of layout.labels.slice(index + 1)) {
          assert.ok(label.right <= other.left || other.right <= label.left ||
            label.bottom <= other.top || other.bottom <= label.top, 'Timeline labels must not overlap');
        }
      }
    }
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Verifies the horizon calculation tab against its visible planetary positions and controls.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves when the sketches and formulas follow the observation context.
 */
async function checkHorizonCalculation(browser, url){
  const page = await browser.newPage({viewport:{width:320,height:844},isMobile:true,hasTouch:true});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.clock.setFixedTime(new Date('2026-11-05T12:00:00Z'));
    await page.goto(url + '/?lang=de&date=20261105&place=berlin', {waitUntil:'domcontentloaded'});
    const overview = page.locator('#horizonOverviewTab');
    const panel = page.locator('#horizonCalculationPanel');
    await overview.press('ArrowRight');
    assert.equal(await page.locator('#horizonCalculationTab').getAttribute('aria-selected'), 'true');
    assert.ok(await panel.isVisible());
    assert.ok(await page.locator('#planetHorizonPlot').isHidden());
    const bodies = panel.locator('.horizon-calculation-body');
    assert.deepEqual(await bodies.locator('h3').allTextContents(), ['Jupiter', 'Sonne']);
    const jupiterPosition = (await page.locator('[data-horizon-planet="jupiter"] [data-horizon-position]').textContent()).split(' · ')[0];
    assert.equal(await bodies.first().locator('figcaption').textContent(), 'Höhe ' + jupiterPosition);
    for (const body of await bodies.all()) {
      const formula = await body.locator('[data-horizon-calculation-formula]').textContent();
      const values = Array.from(formula.matchAll(/(-?\d+(?:,\d+)?)°/g), match => Number(match[1].replace(',', '.')));
      assert.equal(values.length, 6);
      const [latitude, declination, , , hourAngle, altitude] = values;
      const radians = Math.PI / 180;
      const expected = Math.asin(Math.sin(latitude * radians) * Math.sin(declination * radians) +
        Math.cos(latitude * radians) * Math.cos(declination * radians) * Math.cos(hourAngle * radians)) / radians;
      assert.ok(Math.abs(altitude - expected) <= 0.051, 'The substituted formula must match the displayed altitude');
      const y = Number(await body.locator('[data-horizon-calculation-marker]').getAttribute('cy'));
      assert.equal(y < 74, altitude > 0, 'The sketch must show the correct side of the horizon');
    }
    assert.ok(await panel.evaluate(node => node.scrollWidth <= node.clientWidth + 1), 'No formula overflows at 320px');

    await page.locator('[data-horizon-planet="mars"]').evaluate(button => button.click());
    assert.deepEqual(await bodies.locator('h3').allTextContents(), ['Mars', 'Sonne']);
    const before = await bodies.last().locator('figcaption').textContent();
    await page.locator('#horizonTimeOffset').evaluate(slider => {
      slider.value = '8';
      slider.dispatchEvent(new Event('input', {bubbles:true}));
    });
    assert.notEqual(await bodies.last().locator('figcaption').textContent(), before);
    const observation = await page.locator('#horizonContext').textContent();
    const formulaBefore = await bodies.first().locator('[data-horizon-calculation-formula]').textContent();
    await page.locator('#locationSelector').evaluate(select => {
      select.value = 'sydney';
      select.dispatchEvent(new Event('change', {bubbles:true}));
    });
    assert.match(await page.locator('#horizonContext').textContent(), /Sydney/);
    assert.notEqual(await bodies.first().locator('[data-horizon-calculation-formula]').textContent(), formulaBefore);
    assert.notEqual(await page.locator('#horizonContext').textContent(), observation);
    const hourBefore = await bodies.last().locator('[data-horizon-calculation-hour]').textContent();
    await page.locator('#btnSolarNextMobile').evaluate(button => button.click());
    assert.notEqual(await bodies.last().locator('[data-horizon-calculation-hour]').textContent(), hourBefore);
    await page.locator('#horizonCalculationTab').press('Home');
    assert.ok(await page.locator('#planetHorizonPlot').isVisible());
    assert.ok(await panel.isHidden());
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks the linked retrograde geometry, station markers and day-to-day formula at phone width.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves when both charts and the formula stay synchronized.
 */
async function checkRetrogradeCalculation(browser, url){
  const page = await browser.newPage({viewport:{width:320,height:844},isMobile:true,hasTouch:true});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.goto(url + '/?lang=de&date=20261117&place=berlin', {waitUntil:'domcontentloaded'});
    await page.locator('#retrogradeOverviewTab').press('ArrowRight');
    const panel = page.locator('#retrogradeCalculation');
    assert.ok(await panel.isVisible());
    assert.equal(await panel.locator('#retrogradeBody').inputValue(), 'mars');
    assert.equal(await panel.locator('select').count(), 1, 'Only the planet is selectable');
    const geometry = panel.locator('#retrogradeGeometry');
    assert.equal(await geometry.count(), 1, 'Both sight lines must share one SVG');
    const rays = geometry.locator('[data-retro-ray]');
    assert.equal(await rays.count(), 2);
    const rayStyles = await rays.evaluateAll(lines => lines.map(line => {
      const style = getComputedStyle(line);
      return {stroke:style.stroke, dash:style.strokeDasharray};
    }));
    assert.notEqual(rayStyles[0].stroke, rayStyles[1].stroke);
    assert.equal(rayStyles[0].dash, 'none');
    assert.notEqual(rayStyles[1].dash, 'none');
    const plot = panel.locator('#retrogradeLongitudePlot');
    assert.equal(await plot.locator('[data-retro-stations] circle').count(), 2);
    assert.deepEqual(await plot.locator('[data-retro-stations] text').allTextContents(), ['1', '2']);
    assert.match(await panel.locator('#retrogradeStationStart').textContent(), /Beginn der Rückläufigkeit/);
    assert.match(await panel.locator('#retrogradeStationEnd').textContent(), /Ende der Rückläufigkeit/);
    assert.match(await panel.locator('#retrogradePlotStart').textContent(), /°$/);
    const directions = await plot.locator('.retro-plot-arrow').evaluateAll(arrows => arrows.map(arrow =>
      Math.sign(Math.cos(arrow.transform.baseVal.getItem(1).angle * Math.PI / 180))));
    assert.deepEqual(directions, [1, -1, 1]);
    const values = panel.locator('#retrogradeFormulaValues');
    for (const [phase, sign] of [['before',1], ['during',-1], ['after',1]]) {
      await panel.locator('[data-retro-jump="' + phase + '"]').evaluate(button => button.click());
      const formula = await values.textContent();
      const [next, current, motion] = Array.from(formula.matchAll(/(-?\d+,\d+)°/g), match => Number(match[1].replace(',', '.')));
      assert.equal(Math.sign(motion), sign, phase);
      assert.match(formula, /\/ 10 d/);
      assert.ok(Math.abs((next - current) / 10 - motion) < 0.0002);
      assert.doesNotMatch(formula, /wrap/);
      assert.ok(await panel.locator('#retrogradeLongitudeNote').isHidden());
      assert.equal(await plot.getAttribute('data-retro-active'), phase);
      assert.equal(await panel.locator('[data-retro-jump="' + phase + '"]').getAttribute('aria-pressed'), 'true');
      const widths = await plot.locator('.retro-plot-curve').evaluateAll(paths =>
        paths.map(path => parseFloat(getComputedStyle(path).strokeWidth)));
      assert.equal(widths.filter(width => width > 4).length, 1);
      const active = plot.locator('[data-retro-section="' + phase + '"] .retro-plot-curve');
      assert.ok(await active.evaluate(path => parseFloat(getComputedStyle(path).strokeWidth) > 4));
      const plotDates = await plot.locator('[data-retro-time-markers] title').allTextContents();
      assert.deepEqual(await panel.locator('[data-retro-date]').allTextContents(), plotDates);
      const instants = plotDates.map(label => {
        const [day, month, year] = label.split('.').map(Number);
        return Date.UTC(year, month - 1, day);
      });
      assert.equal((instants[1] - instants[0]) / 86400000, 10);
      assert.equal(await panel.locator('#retrogradeDay').getAttribute('aria-valuetext'), plotDates.join(' → '));
      const rayAngles = await rays.evaluateAll(lines => lines.map(ray => {
        const x = Number(ray.getAttribute('x2')) - Number(ray.getAttribute('x1'));
        const y = Number(ray.getAttribute('y1')) - Number(ray.getAttribute('y2'));
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }));
      assert.ok(Math.abs(rayAngles[0] - current) < 0.0001);
      assert.ok(Math.abs(rayAngles[1] - ((next % 360 + 360) % 360)) < 0.0001);
    }
    const oldFormula = await values.textContent();
    await panel.locator('#retrogradeDay').press('ArrowLeft');
    assert.notEqual(await values.textContent(), oldFormula);
    assert.match(await values.textContent(), /\/ 10 d/);
    await panel.locator('#retrogradeBody').selectOption('venus');
    assert.match(await panel.locator('#retrogradeGeometryLegend').textContent(), /Venus/);
    assert.ok(await panel.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
    await page.locator('#retrogradeCalculationTab').press('Home');
    assert.ok(await page.locator('#retrogradePanel').isVisible());

    await page.goto(url + '/?lang=de&date=20260301&place=berlin', {waitUntil:'domcontentloaded'});
    await page.locator('#retrogradeCalculationTab').evaluate(button => button.click());
    const longitudeNote = panel.locator('#retrogradeLongitudeNote');
    for (const [planet, index, turns] of [['mercury',70,1], ['saturn',68,-1]]) {
      await panel.locator('#retrogradeBody').selectOption(planet);
      const slider = panel.locator('#retrogradeDay');
      await slider.evaluate((input, index) => {
        input.value = String(index);
        input.dispatchEvent(new Event('input', {bubbles:true}));
      }, index);
      const formula = await values.textContent();
      const [next, current, motion] = Array.from(formula.matchAll(/(-?\d+,\d+)°/g), match => Number(match[1].replace(',', '.')));
      assert.equal(Math.sign(motion), turns);
      assert.ok(Math.abs((next - current) / 10 - motion) < 0.0002);
      assert.ok(await longitudeNote.isVisible());
      const note = await longitudeNote.textContent();
      const [ordinary, continuous] = Array.from(note.matchAll(/(-?\d+,\d+)°/g), match => Number(match[1].replace(',', '.')));
      assert.ok(Math.abs(continuous - ordinary - 360 * turns) < 0.0001);
      assert.equal(continuous, next);
      await panel.locator('[data-retro-jump="before"]').evaluate(button => button.click());
      assert.ok(await longitudeNote.isHidden());
    }
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks that the four extreme-object entries appear in the existing knowledge rotation.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves when every entry renders with readable diagram labels and sources.
 */
async function checkExtremeKnowledge(browser, url){
  const page = await browser.newPage({viewport:{width:320,height:844},isMobile:true,hasTouch:true});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    for (const language of ['de', 'en', 'fr']) {
      await page.goto(url + '/?lang=' + language, {waitUntil:'domcontentloaded'});
      const card = page.locator('[data-help-key="sky_knowledge"]');
      await card.locator('svg.knowledge-drawing').waitFor({state:'visible'});
      const shown = await card.evaluate(node => {
        const entries = window.PLANETENUHR_MNEMONICS.entries;
        const labels = window.PLANETENUHR_TRANSLATIONS[document.documentElement.lang];
        const extremeIds = new Set(entries.filter(entry => entry.kind === 'extreme').map(entry => entry.id));
        const rendered = [];
        const next = node.querySelector('#knowledgeNext');
        for (let index = 0; index < entries.length; index++) {
          const {knowledgeId} = node.dataset;
          if (extremeIds.has(knowledgeId)) {
            const plot = node.querySelector('.knowledge-drawing');
            const bounds = plot.viewBox.baseVal;
            const fits = Array.from(plot.querySelectorAll('text')).every(label => {
              const box = label.getBBox();
              return box.x >= 0 && box.x + box.width <= bounds.width && box.y >= 0 && box.y + box.height <= bounds.height;
            });
            rendered.push({
              id:knowledgeId,
              category:node.querySelector('#knowledgeCategory').textContent === labels.knowledge_kind_extreme,
              caption:Boolean(node.querySelector('figcaption').textContent),
              sources:node.querySelectorAll('.knowledge-sources a').length,
              fits
            });
          }
          next.click();
        }
        return rendered;
      });
      assert.deepEqual(shown.map(entry => entry.id).sort(), ['black-holes','gravitational-waves','neutron-stars-pulsars','supernovae']);
      assert.ok(shown.every(entry => entry.category && entry.caption && entry.sources === 2 && entry.fits), language);
    }
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks Mercury's observing window and separate elongation in the calendar and daily card.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @param {object} windowCase German labels, dates and month coverage expected for the apparition.
 * @returns {Promise<void>} Resolves when both boundary days and the elongation are verified.
 */
async function checkMercuryObservingWindow(browser, url, windowCase){
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    const {period, peak, rangeLabel, firstDate, peakDate, lastDate, nextDate, firstMonthDays, lastMonthDays} = windowCase;
    const firstLabelDay = String(Number(firstDate.slice(-2)));
    const calendar = page.locator('#skyCalendarCard');
    const monthGrid = calendar.locator('#calendarMonthGrid');
    const activeCell = calendar.locator('.calendar-month-cell.is-selected-month-day');
    const daily = page.locator('#dailyHighlightsList');
    const dates = [
      {date:firstDate, labelDay:firstLabelDay, markedDays:firstMonthDays, start:1, end:0, edge:'.is-range-start'},
      {date:peakDate, edge:':not(.is-range-start, .is-range-end)'},
      {date:lastDate, labelDay:'1', markedDays:lastMonthDays, start:0, end:1, edge:'.is-range-end'}
    ];
    for (const {date, labelDay, markedDays, start, end, edge} of dates) {
      if (date === lastDate) {
        await page.setViewportSize({width:390, height:844});
      }
      await page.goto(url + '/?lang=de&date=' + date + '&place=berlin', {waitUntil:'domcontentloaded'});
      const hint = daily.locator('li').filter({hasText:period});
      assert.match(await hint.locator('[data-daily-when]').textContent(), /Beobachtungszeitraum/);
      assert.ok((await hint.locator('[data-daily-detail]').textContent()).includes(rangeLabel));
      await calendar.locator('[data-calendar-filter="planet"]').evaluate(button => button.click());
      await calendar.locator('#btnCalendarViewMonth').evaluate(button => button.click());
      const entry = monthGrid.locator('[data-calendar-month-event]').filter({hasText:period});
      assert.equal(await entry.count(), 1);
      assert.ok((await entry.getAttribute('aria-label')).includes(rangeLabel));
      if (labelDay) {
        assert.equal(await entry.locator('..').locator('..').locator('[data-calendar-day-number]').textContent(), labelDay);
        assert.equal(await monthGrid.locator('[data-calendar-month-range]').count(), markedDays);
        assert.equal(await monthGrid.locator('.is-range-start').count(), start);
        assert.equal(await monthGrid.locator('.is-range-end').count(), end);
      }
      const activeMarker = activeCell.locator('[data-calendar-month-range]' + edge);
      assert.equal(await activeMarker.count(), 1);
      const markerBounds = await activeMarker.boundingBox();
      const cellBounds = await activeCell.boundingBox();
      assert.ok(markerBounds.width > 0 && markerBounds.width < cellBounds.width && markerBounds.height === 5);
      if (date === peakDate) {
        assert.equal(await activeCell.locator('[data-calendar-month-event]').filter({hasText:peak}).count(), 1);
        assert.equal(await daily.locator('li').filter({hasText:peak}).count(), 1);
      }
      if (date === lastDate) {
        await entry.evaluate(button => button.click());
        assert.equal(await calendar.locator('[data-calendar-detail-date]').textContent(), rangeLabel);
        const downloaded = page.waitForEvent('download');
        await calendar.locator('[data-calendar-detail-download]').evaluate(link => link.click());
        const download = await downloaded;
        const calendarFile = await fs.promises.readFile(await download.path(), 'utf8');
        assert.ok(calendarFile.includes('DTSTART;VALUE=DATE:' + firstDate));
        assert.ok(calendarFile.includes('DTEND;VALUE=DATE:' + nextDate));
      }
    }
    await page.goto(url + '/?lang=de&date=' + nextDate + '&place=berlin', {waitUntil:'domcontentloaded'});
    assert.equal(await daily.locator('li').filter({hasText:period}).count(), 0);
    assert.equal(await calendar.locator('#calendarTimeline .calendar-item').filter({hasText:period}).count(), 0);
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks the Modern figures in the monthly card, year wheel and wheel detail.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @param {string} [language='de'] UI language for the descriptions.
 * @returns {Promise<void>} Resolves when all twelve figures, descriptions and sources render at mobile width.
 */
async function checkConstellationFigures(browser, url, language = 'de'){
  const page = await browser.newPage({viewport:{width:390, height:844}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.goto(url + '/?lang=' + language + '&date=20270115&place=berlin', {waitUntil:'domcontentloaded'});
    const dialog = page.locator('#constellationYearDetailDialog');
    const figures = [
      ['Orion', 21, 24], ['Gemini', 17, 16], ['Leo', 9, 10], ['Bootes', 9, 9],
      ['Virgo', 12, 12], ['Hercules', 18, 18], ['Scorpius', 13, 12], ['Cygnus', 10, 9],
      ['Pegasus', 14, 14], ['Andromeda', 6, 5], ['Taurus', 12, 12], ['Auriga', 6, 6]
    ];
    for (const [name, stars, lines] of figures) {
      const monthMap = page.locator('#constellationMap svg[aria-label$="' + name + '"]');
      await monthMap.waitFor({state:'attached'});
      const mini = page.locator('#constellationYearMap').getByRole('button', {name:new RegExp(name)});
      assert.equal(await monthMap.locator('.constellation-star').count(), stars, name);
      assert.equal(await monthMap.locator('.constellation-line').count(), lines, name);
      assert.equal(await mini.locator('.constellation-mini-star').count(), stars, name);
      assert.equal(await mini.locator('.constellation-mini-line').count(), lines, name);
      assert.equal(await mini.locator('.constellation-illustration').count(), 1, name + ' wheel artwork');
      assert.equal(await monthMap.locator('.constellation-illustration').count(), 1, name + ' monthly artwork');
      const miniatureStyles = await mini.evaluate(element => {
        const star = element.querySelector('.constellation-mini-star:not(.current)');
        const line = element.querySelector('.constellation-mini-line');
        const starStyle = getComputedStyle(star);
        const lineStyle = getComputedStyle(line);
        return {fill:starStyle.fill, stroke:lineStyle.stroke, strokeWidth:lineStyle.strokeWidth};
      });
      assert.equal(miniatureStyles.fill, 'rgb(37, 99, 235)', name + ' blue stars');
      assert.equal(miniatureStyles.stroke, 'rgb(148, 163, 184)', name + ' visible blue-grey connections');
      assert.ok(parseFloat(miniatureStyles.strokeWidth) > 0, name + ' connection width');
      await mini.press('Enter');
      await dialog.waitFor({state:'visible'});
      const detailMap = dialog.locator('#constellationYearDetailMap svg');
      assert.equal(await detailMap.locator('.constellation-star').count(), stars, name);
      assert.equal(await detailMap.locator('.constellation-line').count(), lines, name);
      const monthlyLabels = await monthMap.locator('.constellation-star-label').allTextContents();
      const detailLabels = await detailMap.locator('.constellation-star-label').allTextContents();
      assert.deepEqual(detailLabels, monthlyLabels, name);
      const labelsFit = await detailMap.evaluate(svg => {
        const {width, height} = svg.viewBox.baseVal;
        const boxes = Array.from(svg.querySelectorAll('.constellation-star-label'), label => label.getBBox());
        return boxes.every((box, index) => box.x >= 0 && box.y >= 0 && box.x + box.width <= width
          && box.y + box.height <= height && boxes.slice(index + 1).every(other =>
            box.x + box.width <= other.x || other.x + other.width <= box.x
            || box.y + box.height <= other.y || other.y + other.height <= box.y));
      });
      assert.ok(labelsFit, name + ' labels fit the mobile chart without overlapping');
      const description = dialog.locator('#constellationYearDetailDescription');
      const expected = await page.evaluate(({name, language}) => {
        const config = window.PLANETENUHR_CONSTELLATION_DESCRIPTIONS;
        return {entry:config.entries[name], labels:config.labels[language]};
      }, {name, language});
      assert.ok((await description.locator('[data-constellation-description-title]').textContent()).includes(expected.entry.abbreviation));
      if (name === 'Gemini' && language === 'de') {
        assert.equal(await mini.locator('.constellation-name-label').textContent(), 'Gemini');
        assert.equal(await dialog.getByRole('heading', {name:'Zwillinge (Gemini)',exact:true}).count(), 1);
        assert.equal(await description.locator('[data-constellation-abbreviation-label]').textContent(), 'Offizielles Kürzel');
        assert.equal(await description.locator('[data-constellation-abbreviation]').textContent(), 'Gem');
        assert.equal(await description.locator('[data-constellation-area-label]').textContent(), 'Fläche');
        assert.equal(await description.locator('[data-constellation-area]').textContent(), '514 Quadratgrad');
      }
      assert.equal(await description.locator('dd').count(), 5, name);
      const original = await page.evaluate(({name,language}) => {
        const figure = window.PLANETENUHR_PHENOMENA.constellations.find(item => item.name === name);
        return figure.highlight[language];
      }, {name,language});
      assert.ok((await description.locator('[data-constellation-description-intro]').innerText()).includes(original),
        name + ' original short description is preserved');
      assert.equal(await description.locator('dt').first().textContent(), expected.labels.location);
      const facts = await description.locator('dd').allTextContents();
      assert.ok(facts[1].length > 20 && facts[2].includes('mag'), name + ' season and brightness');
      assert.equal(facts[4], expected.entry.text[language].mythology);
      assert.equal(await description.locator('a').count(), 3, name);
      await description.locator('a').last().scrollIntoViewIfNeeded();
      assert.ok(await description.locator('a').last().isVisible(), name + ' sources reachable by scrolling');
      const geometry = await description.evaluate(element => {
        const bounds = element.getBoundingClientRect();
        const panel = element.closest('.diagram-detail-content');
        return {left:bounds.left, right:bounds.right, width:window.innerWidth,
          scrollWidth:panel.scrollWidth, clientWidth:panel.clientWidth};
      });
      assert.ok(geometry.left >= 0 && geometry.right <= geometry.width, name + ' description fits mobile width');
      assert.ok(geometry.scrollWidth <= geometry.clientWidth + 1, name + ' no horizontal scrolling');
      await dialog.press('Escape');
      await dialog.waitFor({state:'hidden'});
      if (name !== 'Auriga') {
        await page.locator('#btnSolarNextMonth').evaluate(button => button.click());
      }
    }
    assert.deepEqual(errors, [], 'Browser initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks all visibility profiles and the shared desktop/mobile dialog layout.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @param {string} [language='de'] Active profile language.
 * @returns {Promise<void>} Resolves when all 49 dialogs render complete, reachable content.
 */
async function checkConstellationVisibilityProfiles(browser, url, language = 'de'){
  const page = await browser.newPage({viewport:{width:390, height:844}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.goto(url + '/?lang=' + language + '&date=20261118&place=berlin', {waitUntil:'domcontentloaded'});
    await page.locator('#constellationVisibilityYearTab').click();
    const entries = await page.evaluate(() => window.PLANETENUHR_CONSTELLATION_VISIBILITY.constellations);
    assert.equal(entries.length, 49);
    const dialog = page.locator('#constellationVisibilityDialog');
    for (const item of entries) {
      const opener = page.locator('#constellationVisibilityYearRows [data-constellation-detail="' + item.key + '"]');
      await opener.click();
      await dialog.waitFor({state:'visible'});
      const article = dialog.locator('.constellation-description');
      if (item.key === 'gemini' && language === 'de') {
        assert.equal(await dialog.getByRole('heading', {name:'Zwillinge (Gemini)',exact:true}).count(), 1);
        assert.equal(await article.locator('[data-constellation-abbreviation]').textContent(), 'Gem');
        assert.equal(await article.locator('[data-constellation-area]').textContent(), '514 Quadratgrad');
      }
      if (item.key === 'serpens_caput' && language === 'de') {
        assert.equal(await dialog.getByRole('heading', {name:'Kopf der Schlange (Serpens Caput)',exact:true}).count(), 1);
        assert.equal(await article.locator('[data-constellation-area]').textContent(), '637 Quadratgrad');
        assert.ok(await article.locator('[data-constellation-area-note]').isVisible());
        assert.match(await article.locator('[data-constellation-area-note]').textContent(), /gesamtes Sternbild Schlange/);
      }
      assert.equal(await article.locator('dd').count(), 5, item.key);
      assert.ok((await article.locator('[data-constellation-description-intro]').textContent()).length > 15, item.key);
      assert.ok((await article.locator('dd').nth(2).textContent()).includes('mag'), item.key);
      assert.ok(await article.locator('a').count() >= 2, item.key);
      assert.ok(await dialog.locator('#constellationVisibilityDetailFigure svg').count() > 0, item.key);
      const underlay = dialog.locator('.constellation-illustration');
      let expectedArt = 1;
      if (item.key === 'serpens_caput' || item.key === 'serpens_cauda') expectedArt = 0;
      assert.equal(await underlay.count(), expectedArt, item.key + ' correct artwork availability');
      if (expectedArt) {
        const href = await underlay.getAttribute('href');
        const loaded = await page.evaluate(href => new Promise(resolve => {
          const image = new Image();
          image.onload = () => resolve(image.naturalWidth > 0);
          image.onerror = () => resolve(false);
          image.src = href;
        }), href);
        assert.ok(loaded, item.key + ' artwork loads');
        assert.ok(await underlay.evaluate(image => {
          const nodes = [...image.parentNode.children];
          return getComputedStyle(image).pointerEvents === 'none'
            && nodes.indexOf(image) < nodes.indexOf(image.parentNode.querySelector('.constellation-line'))
            && nodes.indexOf(image) < nodes.indexOf(image.parentNode.querySelector('.constellation-star'));
        }), item.key + ' artwork stays below stars and lines');
      }
      await article.locator('a').last().scrollIntoViewIfNeeded();
      const bounds = await article.locator('a').last().boundingBox();
      const dialogBounds = await dialog.boundingBox();
      assert.ok(bounds.y >= dialogBounds.y && bounds.y + bounds.height <= dialogBounds.y + dialogBounds.height,
        item.key + ' source links reachable inside the dialog');
      assert.ok(await dialog.locator('.constellation-detail-layout').evaluate(element => element.scrollWidth <= element.clientWidth + 1),
        item.key + ' content fits mobile width');
      await dialog.press('Escape');
    }
    await page.setViewportSize({width:1280,height:900});
    await page.locator('#constellationVisibilityYearRows [data-constellation-detail="andromeda"]').click();
    const figure = await dialog.locator('.constellation-detail-visual').boundingBox();
    const article = await dialog.locator('.constellation-description').boundingBox();
    assert.ok(figure.x + figure.width <= article.x, 'Desktop figure and profile appear side by side');
    assert.deepEqual(errors, [], 'Constellation visibility initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks that monthly enlargements retain the compass copy and only show useful scrolling hints.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves when full content survives cloning and responds to viewport changes.
 */
async function checkMonthlyConstellationEnlargement(browser, url){
  const page = await browser.newPage({viewport:{width:1280,height:1000}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    for (const language of ['de','en','fr']) {
      await page.goto(url + '/?lang=' + language + '&date=20271015&place=berlin', {waitUntil:'domcontentloaded'});
      const card = page.locator('[data-help-key="constellation_month"]');
      const originalCompass = await card.locator('#constellationSkyHint').innerText();
      const originalSummary = await card.locator('#constellationSummary').innerText();
      const originalLegend = await card.locator('#constellationLegend').innerText();
      await card.locator('.diagram-open').click();
      const dialog = page.locator('#diagramDetailDialog');
      await dialog.waitFor({state:'visible'});
      assert.equal(await dialog.locator('.constellation-skyhint').innerText(), originalCompass);
      assert.equal(await dialog.locator('.constellation-summary').innerText(), originalSummary);
      assert.equal(await dialog.locator('.legend-small').innerText(), originalLegend);
      assert.equal(await dialog.locator('.constellation-skyhint svg').count(), 1);
      assert.ok(await dialog.locator('#diagramDetailHint').isHidden(), 'No scrolling hint on a roomy desktop');
      await page.setViewportSize({width:390,height:844});
      await page.waitForFunction(() => !document.getElementById('diagramDetailHint').hidden);
      const scrolls = await dialog.locator('#diagramDetailContent').evaluate(element =>
        element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight);
      assert.ok(scrolls, 'Mobile instructions match actual overflow');
      assert.equal(await dialog.locator('.constellation-skyhint-copy').count(), 1);
      await page.setViewportSize({width:1280,height:1000});
      await page.waitForFunction(() => document.getElementById('diagramDetailHint').hidden);
      await dialog.locator('#diagramDetailClose').click();
    }
    assert.deepEqual(errors, [], 'Monthly constellation initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Activates a mobile control through the pointer support of the test browser.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {import('playwright').Locator} button Control to activate. @returns {Promise<void>}
 */
function activateMobileControl(browser, button){
  if (process.platform === 'win32' && browser.browserType().name() === 'webkit') {
    // The Windows WebKit test port emits touch events without a button click.
    return button.click();
  }
  return button.tap();
}

/** Checks touch targets, clipboard content and deep-link navigation on phones.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} origin Synthetic local origin. @returns {Promise<void>}
 */
async function checkMobileCardLinks(browser, origin){
  const page = await browser.newPage({viewport:{width:320,height:740},isMobile:true,hasTouch:true});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.route('**/*', route => serveDashboard(route, origin));
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value:{async writeText(value){ window.copiedCardLink = value; }}
      });
    });
    const entry = origin + '/?lang=de&date=20270310&place=Berlin&time=1234';
    await page.goto(entry, {waitUntil:'load'});
    for (const width of [320,390]) {
      await page.setViewportSize({width,height:740});
      const layoutIssues = await page.locator('.display-container:visible > .card-help').evaluateAll(headers => {
        return headers.flatMap(header => {
          const card = header.parentElement;
          const cardBounds = card.getBoundingClientRect();
          const title = card.querySelector('.group-title').getBoundingClientRect();
          const copyButton = header.querySelector('.card-link-button');
          const helpButton = header.querySelector('.card-help-button');
          const copy = copyButton.getBoundingClientRect();
          const help = helpButton.getBoundingClientRect();
          const settingsButton = header.querySelector('.card-external-settings');
          const settings = settingsButton.getBoundingClientRect();
          const copyIcon = getComputedStyle(copyButton, '::before');
          const helpIcon = getComputedStyle(helpButton, '::before');
          const iconGap = (help.left + help.width / 2 + new DOMMatrix(helpIcon.transform).m41) -
            (copy.left + copy.width / 2 + new DOMMatrix(copyIcon.transform).m41) -
            (parseFloat(copyIcon.width) + parseFloat(helpIcon.width)) / 2;
          let minimumWidth = 44;
          if (settings.width) {
            minimumWidth = 26;
            const gearIcon = getComputedStyle(settingsButton, '::before');
            const gearGap = (copy.left + copy.width / 2 + new DOMMatrix(copyIcon.transform).m41) -
              (settings.left + settings.width / 2 + new DOMMatrix(gearIcon.transform).m41) -
              (parseFloat(copyIcon.width) + parseFloat(gearIcon.width)) / 2;
            if (settings.width !== copy.width || settings.height !== copy.height || settings.right > copy.left ||
                settings.left < cardBounds.left || settings.top !== copy.top || title.right > settings.left ||
                Math.abs(gearGap - 4) > .5) {
              return [card.dataset.helpKey + ' settings'];
            }
          }
          if (copy.width < minimumWidth || copy.height < 44 || copy.width !== help.width || copy.height !== help.height ||
              copy.right > help.left || copy.top !== help.top || copy.left < cardBounds.left ||
              help.right > cardBounds.right || title.right > copy.left || Math.abs(iconGap - 4) > .5) {
            return [card.dataset.helpKey];
          }
          return [];
        });
      });
      assert.deepEqual(layoutIssues, [], 'Card header geometry at ' + width + 'px');
    }

    await page.setViewportSize({width:320,height:740});
    const card = page.locator('#skyCalendarCard');
    const copy = card.getByRole('button', {name:'Link zu dieser Kachel kopieren'});
    const help = card.getByRole('button', {name:'Mehr Info',exact:true});
    await activateMobileControl(browser, help);
    await help.and(card.locator('[aria-expanded="true"]')).waitFor({timeout:5000});
    const beforeCopy = page.url();
    await activateMobileControl(browser, copy);
    const status = card.locator('.card-link-status');
    await status.filter({hasText:'Link kopiert'}).waitFor({state:'visible'});
    assert.equal(await help.getAttribute('aria-expanded'), 'false');
    assert.equal(page.url(), beforeCopy);
    const copied = new URL(await page.evaluate(() => window.copiedCardLink));
    assert.equal(copied.hash, '#skyCalendarCard');
    assert.equal(copied.searchParams.get('card'), 'sky_calendar');
    assert.equal(copied.searchParams.get('date'), '20270310');
    assert.equal(copied.searchParams.get('time'), '1234');
    assert.equal(copied.searchParams.get('place'), 'Berlin');
    assert.equal(copied.searchParams.get('lang'), 'de');
    await status.filter({hasText:'Link kopiert'}).waitFor({state:'hidden'});
    await page.goto(copied.href, {waitUntil:'load'});
    await page.waitForFunction(() => {
      const card = document.getElementById('skyCalendarCard').getBoundingClientRect();
      return card.top >= 0 && card.top < window.innerHeight / 2;
    });
    assert.deepEqual(errors, [], 'Card link initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks that both live integrations remain idle until independently enabled and stay off after revocation.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} origin Synthetic local origin. @returns {Promise<void>}
 */
async function checkExternalContentConsent(browser, origin){
  const page = await browser.newPage({viewport:{width:320,height:740},isMobile:true,hasTouch:true});
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === origin) return serveDashboard(route, origin);
      requests.push(url.hostname);
      if (url.hostname === 'services.swpc.noaa.gov') {
        return route.fulfill({headers:{'access-control-allow-origin':'*'},json:[{time_tag:'2026-11-24T12:00:00Z',kp_index:5}]});
      }
      if (url.hostname === 'public.api.bsky.app') {
        const handle = url.searchParams.get('actor');
        const post = {
          uri:'at://did:plc:test/app.bsky.feed.post/example',
          author:{handle, avatar:'https://cdn.bsky.app/avatar.png'},
          record:{createdAt:'2026-11-24T12:00:00Z',text:'Fixture'},
          embed:{images:[{fullsize:'https://cdn.bsky.app/post.png',alt:'Fixture image'}]}
        };
        return route.fulfill({headers:{'access-control-allow-origin':'*'},json:{feed:[{post}]}});
      }
      if (url.hostname === 'cdn.bsky.app') {
        return route.fulfill({path:path.join(root, 'favicon-32x32.png'),contentType:'image/png'});
      }
      return route.abort();
    });
    await page.goto(origin + '/?lang=de', {waitUntil:'networkidle'});
    const aurora = page.locator('[data-help-key="aurora"]');
    const bluesky = page.locator('#bskyCard');
    const auroraCheck = aurora.getByRole('checkbox');
    const blueskyCheck = bluesky.getByRole('checkbox');
    await auroraCheck.waitFor();
    await blueskyCheck.waitFor();
    assert.equal(await auroraCheck.isChecked(), false);
    assert.equal(await blueskyCheck.isChecked(), false);
    assert.deepEqual(requests, [], 'Initial load makes no third-party requests');

    await auroraCheck.check();
    await aurora.locator('[id="auroraMeta"]').filter({hasText:'5.0'}).waitFor();
    assert.deepEqual(requests, ['services.swpc.noaa.gov'], 'Aurora consent only loads NOAA');

    await page.reload({waitUntil:'networkidle'});
    await aurora.locator('[id="auroraMeta"]').filter({hasText:'5.0'}).waitFor();
    assert.equal(await blueskyCheck.isChecked(), false);
    assert.ok(requests.every(host => host === 'services.swpc.noaa.gov'));
    const store = await page.evaluate(async () => {
      const preferences = window.PLANETENUHR_EXTERNAL_CONTENT_PREFERENCES.create(window);
      return [await preferences.read('aurora',1), await preferences.read('aurora',2),
        await preferences.read('unknown',1)];
    });
    assert.deepEqual(store, [true,false,false], 'IndexedDB grants only the saved provider and notice version');

    await blueskyCheck.check();
    const image = bluesky.getByAltText('Fixture image').first();
    await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#bskyPost .bsky-image')?.naturalWidth > 0);
    assert.ok(requests.includes('public.api.bsky.app') && requests.includes('cdn.bsky.app'));

    const blueskySettings = bluesky.getByRole('button', {name:'Einstellungen für Bluesky-Feeds'});
    await activateMobileControl(browser, blueskySettings);
    await blueskyCheck.uncheck();
    await blueskyCheck.waitFor();
    assert.equal(await bluesky.locator('#bskyPost img').count(), 0);
    const auroraSettings = aurora.getByRole('button', {name:'Einstellungen für Polarlicht-Daten'});
    await activateMobileControl(browser, auroraSettings);
    await auroraCheck.uncheck();
    await page.waitForFunction(async () => {
      const preferences = window.PLANETENUHR_EXTERNAL_CONTENT_PREFERENCES.create(window);
      return !(await preferences.read('aurora',1)) && !(await preferences.read('bsky_feed',1));
    });
    requests.length = 0;
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await auroraCheck.isChecked(), false);
    assert.equal(await blueskyCheck.isChecked(), false);
    assert.deepEqual(requests, [], 'Reload after revocation makes no third-party requests');
    assert.deepEqual(errors, [], 'Consent initialization/runtime errors');
  } finally {
    await page.close();
  }
}

/** Checks that enlarged year-wheel profiles share the modal and restore chart position and focus.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} origin Synthetic local origin. @returns {Promise<void>}
 */
async function checkEnlargedConstellationNavigation(browser, origin){
  const page = await browser.newPage({viewport:{width:390,height:740}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, origin));
  try {
    await page.goto(origin + '/?lang=de&date=20270115&place=berlin', {waitUntil:'domcontentloaded'});
    const opener = page.locator('[data-help-key="constellation_year"]').getByRole('button', {name:'Grafik vergrößern'});
    const dialog = page.locator('#diagramDetailDialog');
    const chart = dialog.locator('#diagramDetailContent');
    const selection = chart.getByRole('button', {name:'Details zu Virgo öffnen'});
    const label = selection.locator('.constellation-name-label');
    const back = dialog.getByRole('button', {name:'Zurück zur Jahresuhr'});
    const close = dialog.getByRole('button', {name:'Schließen',exact:true});
    const profile = dialog.locator('#constellationYearDetailView');

    await opener.click();
    await label.evaluate(node => node.scrollIntoView({block:'center',inline:'center'}));
    const position = await chart.evaluate(node => [node.scrollLeft, node.scrollTop]);
    assert.ok(position.every(value => value > 0), 'This test exercises both scroll axes');
    // Click the visible text without asking Playwright to scroll the SVG text a second time.
    const point = await label.evaluate(node => {
      const bounds = node.getBoundingClientRect();
      return {x:bounds.x + bounds.width / 2,y:bounds.y + bounds.height / 2};
    });
    await page.mouse.click(point.x, point.y);
    await profile.waitFor({state:'visible'});
    assert.equal(await dialog.getByRole('heading', {name:'Jungfrau (Virgo)',exact:true}).evaluate(node => node === document.activeElement), true);
    assert.deepEqual(await page.locator('dialog[open]').evaluateAll(nodes => nodes.map(node => node.id)), ['diagramDetailDialog']);
    assert.ok(await profile.locator('#constellationYearDetailMap svg').count());

    await back.click();
    await selection.waitFor();
    assert.deepEqual(await chart.evaluate(node => [node.scrollLeft, node.scrollTop]), position);
    assert.equal(await selection.evaluate(node => node === document.activeElement), true);

    await selection.press('Enter');
    await profile.waitFor({state:'visible'});
    await page.keyboard.press('Escape');
    await selection.waitFor();
    assert.deepEqual(await chart.evaluate(node => [node.scrollLeft, node.scrollTop]), position);
    assert.equal(await selection.evaluate(node => node === document.activeElement), true);

    await selection.press('Space');
    await profile.waitFor({state:'visible'});
    await close.click();
    await dialog.waitFor({state:'hidden'});
    await page.waitForFunction(() => document.activeElement.matches('[data-help-key="constellation_year"] .diagram-open'));
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.equal(await page.locator('#constellationYearDetailDialog #constellationYearDetailView').count(), 1);

    await opener.click();
    await chart.waitFor({state:'visible'});
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'hidden'});
    assert.deepEqual(errors, [], 'Year clock dialog errors');
  } finally {
    await page.close();
  }
}

/** Runs the browser regression matrix and always releases browser resources.
 * @returns {Promise<void>} Resolves when the matrix passes.
 */
/** Checks mission tab wiring and layout on a small viewport.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves after checking navigation and initialization.
 */
async function checkSpaceMissions(browser, url){
  const page = await browser.newPage({viewport:{width:375,height:812}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => serveDashboard(route, url));
  try {
    await page.clock.setFixedTime(new Date('2026-11-23T12:00:00Z'));
    await page.goto(url + '/?lang=de&date=20261123');
    const missionCard = page.locator('.idefix-card');
    const helpButton = missionCard.locator('.card-help-button');
    await helpButton.click();
    const help = missionCard.locator('.card-help-popup');
    assert.ok(await help.isVisible());
    assert.match(await help.textContent(), /BepiColombo.*Dragonfly/s);
    assert.match(await help.textContent(), /globale Button „Heute“/);
    assert.doesNotMatch(await help.textContent(), /Dashboardzeit/);
    assert.equal(await help.getByRole('link', {name:'ESA · BepiColombo', exact:true}).getAttribute('href'), 'https://www.esa.int/bepicolombo');
    assert.equal(await help.locator('.card-help-formula-expr').count(), 6);
    assert.match(await help.textContent(), /Summe der Kreuzprodukte.*feste Zeichenpunkte/s);
    await helpButton.press('Escape');
    assert.equal(await help.isVisible(), false);
    const tabs = page.locator('#spaceMissionTabs');
    const buttons = tabs.getByRole('tab');
    assert.deepEqual(errors, []);
    assert.equal(await buttons.count(), 7);
    assert.ok(await page.locator('#idefixTime').isVisible());
    const idefixSlider = page.locator('#idefixTime');
    const idefixPlay = page.locator('#idefixPlay');
    await idefixSlider.press('Home');
    await idefixPlay.click();
    assert.equal(await idefixPlay.textContent(), 'Pause');
    await page.waitForFunction(() => Number(document.getElementById('idefixTime').value) > 0);
    for (const button of (await buttons.all()).slice(1)) {
      await button.click();
      assert.equal(await idefixPlay.textContent(), 'Abspielen');
      const panel = page.locator('#' + await button.getAttribute('aria-controls'));
      assert.ok(await panel.isVisible());
      assert.equal(await page.locator('.space-mission-panel:visible').count(), 1);
      assert.ok(await panel.locator('time').count() > 0);
      assert.ok(await panel.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
      const slider = panel.locator('.mission-time');
      const readout = panel.locator('.mission-time-readout');
      assert.ok(await slider.isVisible());
      assert.ok(await panel.locator('.mission-animation-links a:visible').count() > 0);
      await slider.press('Home');
      const before = await readout.textContent();
      const route = panel.locator('.mission-route-overview');
      const elapsedLength = () => panel.locator('.mission-tracked-path, .mission-predicted-path')
        .evaluateAll(paths => paths.reduce((total, path) => total + path.getTotalLength(), 0));
      const hasOverview = await route.evaluate(path => path.getTotalLength() > 0);
      if (hasOverview) {
        assert.equal(await elapsedLength(), 0);
      }
      await slider.press('End');
      assert.notEqual(await readout.textContent(), before);
      if (hasOverview) {
        assert.ok(await elapsedLength() > 0);
      }
    }
    await buttons.nth(2).click();
    const hera = page.locator('#space-mission-hera');
    const heraSlider = hera.locator('.mission-time');
    const didymosMarker = hera.locator('.mission-reference-target');
    assert.ok(await hera.locator('.mission-target-orbit').evaluate(path => path.getTotalLength() > 0));
    assert.equal(await didymosMarker.textContent(), 'Didymos');
    await heraSlider.press('Home');
    const beginning = await didymosMarker.getAttribute('transform');
    await heraSlider.press('End');
    assert.notEqual(await didymosMarker.getAttribute('transform'), beginning);
    assert.equal(await hera.locator('.mission-distance').isVisible(), false);
    await hera.getByRole('button', {name:'Bei Didymos'}).click();
    assert.ok(await hera.locator('.mission-center .mission-didymos-outline').isVisible());
    assert.equal(await hera.locator('.mission-center circle').count(), 0);
    await heraSlider.press('Home');
    assert.match(await hera.locator('.mission-distance').textContent(), /30,3 km/);
    await heraSlider.press('End');
    assert.match(await hera.locator('.mission-distance').textContent(), /32,5 km/);
    assert.match(await hera.locator('.mission-animation-source').textContent(), /vergrößert dargestellt/);
    assert.match(await hera.locator('.space-mission-timeline').textContent(), /Juventas landet auf Dimorphos.*Mögliche Landung von Hera.*Wird erwogen/s);
    const bepi = page.locator('#space-mission-bepicolombo');
    await buttons.nth(1).click();
    await bepi.getByRole('button', {name:'Um Merkur'}).click();
    assert.match(await bepi.locator('.mission-animation-source').textContent(), /Draufsicht/);
    const orbitBounds = await bepi.locator('.mission-route-overview').evaluate(path => {
      const {width, height} = path.getBBox();
      return {width, height};
    });
    // The highly elliptical orbits remain elongated. This checks that the view is no longer edge-on.
    const proportion = Math.min(orbitBounds.width, orbitBounds.height) / Math.max(orbitBounds.width, orbitBounds.height);
    assert.ok(proportion > .4, 'Mercury orbit projection aspect ratio: ' + proportion);
    await bepi.locator('.mission-time').press('Home');
    assert.equal(await bepi.locator('.mission-mio').evaluate(node => node.style.display), 'none');
    await bepi.locator('.mission-time').press('End');
    assert.equal(await bepi.locator('.mission-mio').evaluate(node => node.style.display), '');
    await bepi.locator('.mission-play').click();
    assert.equal(await bepi.locator('.mission-play').textContent(), 'Pause');
    await buttons.last().click();
    assert.equal(await bepi.locator('.mission-play').textContent(), 'Abspielen');
    assert.match(await page.locator('#space-mission-dragonfly .mission-time-readout').textContent(), /Aufsetzen/);
    await buttons.last().press('Home');
    assert.equal(await buttons.first().getAttribute('aria-selected'), 'true');
    assert.ok(await page.locator('#idefixTime').isVisible());
    async function labelTypography(selector) {
      await page.waitForFunction(selector => {
        const label = document.querySelector(selector);
        const transform = label?.getScreenCTM();
        return transform && Math.abs(parseFloat(getComputedStyle(label).fontSize) * transform.a - 12) < .1;
      }, selector);
      return page.locator(selector).evaluate(label => getComputedStyle(label).fontFamily);
    }
    for (const width of [375, 1280]) {
      await page.setViewportSize({width, height:812});
      await buttons.first().click();
      const family = await labelTypography('#idefixPlot .idefix-sun text');
      await buttons.nth(1).click();
      assert.equal(await labelTypography('#space-mission-bepicolombo .mission-center text'), family);
    }
    const bepiSlider = bepi.locator('.mission-time');
    const bepiReadout = bepi.locator('.mission-time-readout');
    await page.locator('#btnSolarToday').click();
    assert.match(await bepiReadout.textContent(), /23\. Nov\. 2026/);
    await bepiSlider.press('Home');
    assert.doesNotMatch(await bepiReadout.textContent(), /23\. Nov\. 2026/);
    await page.locator('#btnSolarNextMonth').evaluate(button => button.click());
    assert.match(await bepiReadout.textContent(), /23\.12\.2026/);
    await page.locator('#solarDateSlider').press('Home');
    assert.match(await bepi.locator('.mission-dashboard-status').textContent(), /keine Position/);
    assert.match(await bepiReadout.textContent(), /23\.12\.2026/);
    await page.locator('#btnSolarToday').click();
    assert.match(await bepiReadout.textContent(), /23\.11\.2026/);
    await buttons.first().click();
    const todayValue = await idefixSlider.inputValue();
    await idefixSlider.press('End');
    await page.setViewportSize({width:375, height:812});
    await page.locator('#btnSolarTodayMobile').click();
    assert.equal(await idefixSlider.inputValue(), todayValue);
    await buttons.last().click();
    const dragonfly = page.locator('#space-mission-dragonfly');
    assert.equal(await page.locator('.mission-sync, [data-idefix-action="shared"]').count(), 0);
    assert.match(await dragonfly.locator('.mission-time-readout').textContent(), /Aufsetzen/);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
}

/** Checks the November 2026 full Moon in Köln using two browser time zones.
 * @param {import('playwright').Browser} browser Browser engine.
 * @param {string} url Dashboard origin.
 * @returns {Promise<void>} Resolves after checking the local time.
 */
async function checkCologneFullMoon(browser, url){
  for (const timezoneId of ['UTC', 'Asia/Tokyo']) {
    const page = await browser.newPage({timezoneId});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => serveDashboard(route, url));
    try {
      await page.goto(url + '/?lang=de&date=20261123&place=cologne');
      assert.equal(await page.locator('#moonNextFull').textContent(), 'Nächster Vollmond: 24.11.2026 15:53');
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
}

async function main(){
  const url = 'http://planetenuhr.test';
  const engines = (process.env.PLANETENUHR_TEST_BROWSERS || 'chromium').split(',');
  for (const engine of engines) {
    const options = {headless:true};
    if (engine === 'chromium' && process.env.PLANETENUHR_CHROMIUM_EXECUTABLE) {
      options.executablePath = process.env.PLANETENUHR_CHROMIUM_EXECUTABLE;
    }
    const browser = await playwright[engine].launch(options);
    try {
      await checkCologneFullMoon(browser, url);
      console.log(engine + ': Cologne full Moon passed');
      await checkSpaceMissions(browser, url);
      console.log(engine + ': space missions passed');
      await checkMobileCardLinks(browser, url);
      console.log(engine + ': mobile card links passed');
      await checkExternalContentConsent(browser, url);
      console.log(engine + ': external content consent passed');
      await checkMonthlyConstellationEnlargement(browser, url);
      console.log(engine + ': complete monthly constellation enlargement passed');
      await checkConstellationFigures(browser, url);
      console.log(engine + ': monthly and annual constellation figures passed');
      await checkEnlargedConstellationNavigation(browser, url);
      console.log(engine + ': enlarged year clock navigation passed');
      await checkConstellationVisibilityProfiles(browser, url);
      console.log(engine + ': all 49 constellation profiles passed');
      await checkMobileMilkyWay(browser, url);
      console.log(engine + ': mobile Milky Way enlargement passed');
      await checkMobileConjunctionLabels(browser, url);
      console.log(engine + ': mobile conjunction labels passed');
      await checkMarsJupiterDates(browser, url);
      console.log(engine + ': Mars–Jupiter calendar and summary passed');
      await checkHorizonCalculation(browser, url);
      console.log(engine + ': horizon calculation passed');
      await checkRetrogradeCalculation(browser, url);
      console.log(engine + ': retrograde calculation passed');
      await checkExtremeKnowledge(browser, url);
      console.log(engine + ': extreme sky knowledge entries passed');
      await checkMercuryObservingWindow(browser, url, {
        period:'Merkur am Abendhimmel', peak:'Merkur in größter östlicher Elongation',
        rangeLabel:'10.05.2027 – 03.06.2027', firstDate:'20270510', peakDate:'20270528',
        lastDate:'20270603', nextDate:'20270604', firstMonthDays:22, lastMonthDays:3
      });
      await checkMercuryObservingWindow(browser, url, {
        period:'Merkur am Morgenhimmel', peak:'Merkur in größter westlicher Elongation',
        rangeLabel:'29.10.2027 – 19.11.2027', firstDate:'20271029', peakDate:'20271104',
        lastDate:'20271119', nextDate:'20271120', firstMonthDays:3, lastMonthDays:19
      });
      console.log(engine + ': Mercury observing windows passed');
      for (const language of ['de','en','fr']) {
        for (const zone of ['UTC','Asia/Tokyo']) {
          await checkDashboard(browser, url, language, zone);
          console.log(engine + ': ' + language + '/' + zone + ' passed');
        }
      }
    } finally {
      await browser.close();
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
