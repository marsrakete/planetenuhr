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
    const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.jpg':'image/jpeg'};
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

/** Runs the browser regression matrix and always releases browser resources.
 * @returns {Promise<void>} Resolves when the matrix passes.
 */
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
      await checkMobileMilkyWay(browser, url);
      console.log(engine + ': mobile Milky Way enlargement passed');
      await checkMobileConjunctionLabels(browser, url);
      console.log(engine + ': mobile conjunction labels passed');
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
