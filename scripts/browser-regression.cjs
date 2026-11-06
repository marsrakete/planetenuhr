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
