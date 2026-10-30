const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

/** Lädt die Übersetzungsobjekte isoliert für die Kartenkonfigurationsprüfungen.
 * @returns {object} Sprachpakete der Anwendung.
 */
function loadTranslations(){
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync('js/data/translations.js', 'utf8'), context);
  return context.window.PLANETENUHR_TRANSLATIONS;
}

/** Lädt die statische Liste der auswählbaren Milchstraßenthemen.
 * @returns {object[]} Themen mit stabiler Kennung und Übersetzungsschlüssel.
 */
function loadTopics(){
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync('js/data/milky-way-config.js', 'utf8'), context);
  return context.window.PLANETENUHR_MILKY_WAY_CONFIG.topics;
}

test('Milchstraßen-Kachel besitzt vollständige deutsche, englische und französische Texte', function(){
  const translations = loadTranslations();
  const topics = loadTopics();
  const requiredKeys = ['title_milky_way', 'milky_view_map', 'milky_view_sky', 'milky_map_heading', 'milky_map_intro', 'milky_map_tag', 'milky_sky_caption', 'milky_sky_heading', 'milky_sky_tag', 'milky_sky_band_label', 'milky_sky_footer_text', 'milky_sky_east', 'milky_sky_north', 'milky_sky_moment', 'milky_sky_chart_aria', 'milky_sky_chart_description', 'milky_sky_zenith', 'milky_detail_selected', 'milky_map_group', 'milky_alt', 'milky_credit'];
  for (const topic of topics) {
    requiredKeys.push(topic.labelKey, 'milky_' + topic.id + '_title', 'milky_' + topic.id + '_text');
  }
  for (const language of ['de', 'en', 'fr']) {
    for (const key of requiredKeys) {
      assert.equal(typeof translations[language][key], 'string', language + ' translation missing: ' + key);
      assert.ok(translations[language][key].length > 0, language + ' translation empty: ' + key);
    }
  }
});

test('Milchstraßen-Kachel bindet lokales Chandra-Bild, Bedienung, Hilfe und Quelle ein', function(){
  const html = fs.readFileSync('index.html', 'utf8');
  const help = fs.readFileSync('js/data/card-help-config.js', 'utf8');
  const script = fs.readFileSync('js/cards/milky-way.js', 'utf8');
  const skyModel = fs.readFileSync('js/models/milky-way-sky-model.js', 'utf8');
  const styles = fs.readFileSync('css/cards/milky-way.css', 'utf8');
  assert.ok(html.includes('assets/images/milky-way-arms-updated.jpg'));
  assert.ok(html.includes('milkyWayTopicTemplate'));
  assert.ok(html.includes('data-topic-hotspot'));
  assert.ok(html.includes('milky-way-detail'));
  assert.ok(!html.includes('milkyWaySource'));
  assert.ok(!html.includes('data-milky-sun-note'));
  assert.ok(!html.includes('data-milky-map-caption'));
  assert.ok(help.includes('keine vollständige Neuvermessung der Milchstraße'));
  assert.ok(help.includes('Orion-Spur zwischen den größeren Armen von Sagittarius und Perseus'));
  assert.ok(!html.includes('milky-way-sun-marker'));
  assert.ok(html.includes('milky_way'));
  assert.ok(help.includes('milky_way:'));
  assert.ok(help.includes('NASA/Chandra: Messungen der Milchstraßenarme'));
  assert.ok(script.includes('aria-pressed'));
  assert.ok(script.includes('function handleMapClick(event)'));
  assert.ok(script.includes('Math.hypot(horizontalDistance, verticalDistance)'));
  assert.ok(html.includes('data-milky-sky-track'));
  assert.ok(html.includes('data-milky-sky-moment'));
  assert.ok(html.includes('milky-way-sky-horizon'));
  assert.ok(html.includes('milky-way-sky-altitude-ring'));
  assert.ok(script.includes('const radius = 128 * (90 - point.altitudeDeg) / 90;'));
  assert.ok(script.includes('260 + radius * Math.sin(angle)'));
  assert.ok(script.includes('180 - radius * Math.cos(angle)'));
  assert.ok(skyModel.includes('function calculate(date, location)'));
  assert.ok(help.includes('Ortssternwinkel berücksichtigt die Erdrotation'));
  assert.ok(!help.includes('ändert sich nicht mit Datum oder Ort'));
  assert.ok(styles.includes('.milky-way-card[data-card-size="normal"] .milky-way-map-grid'));
  assert.ok(styles.includes('width: 100%;'));
  assert.ok(styles.includes('align-items: stretch;'));
  assert.ok(styles.includes('grid-template-areas: "image" "footer" "detail";'));
  assert.ok(styles.includes('.milky-way-card[data-card-size="wide"] .milky-way-hotspot { width: 48px; height: 48px; }'));
  assert.ok(styles.includes('.milky-way-card .milky-way-hotspot:active { transform: translate(-50%, -50%); }'));
  assert.ok(styles.includes('.milky-way-card .milky-way-topic:active { transform: none; }'));
  assert.ok(styles.includes('transition: none;'));
  assert.ok(styles.includes('.milky-way-topic-legend .milky-way-topic[aria-pressed="true"]'));
  assert.ok(styles.includes('milky-way-hotspot-center { left: 46.3%; top: 51%; }'));
  assert.ok(fs.statSync('assets/images/milky-way-arms-updated.jpg').size > 10000);
});

test('Milchstraßen-Panorama folgt Zeitpunkt und Ort und unterscheidet Tageslicht von Nacht', function(){
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync('js/models/astronomy-coordinates.js', 'utf8'), context);
  vm.runInNewContext(fs.readFileSync('js/models/milky-way-sky-model.js', 'utf8'), context);
  const coordinates = context.window.PLANETENUHR_COORDINATES;
  const dayModel = context.window.PLANETENUHR_MILKY_WAY_SKY_MODEL.create({
    horizontalCoordinates:coordinates.horizontalCoordinates,
    sunEquatorialCoordinates:function(date){
      return {rightAscensionDeg:coordinates.localSiderealAngleDegrees(date, 0), declinationDeg:0};
    }
  });
  const nightModel = context.window.PLANETENUHR_MILKY_WAY_SKY_MODEL.create({
    horizontalCoordinates:coordinates.horizontalCoordinates,
    sunEquatorialCoordinates:function(date){
      return {rightAscensionDeg:coordinates.localSiderealAngleDegrees(date, 0) + 180, declinationDeg:0};
    }
  });
  const place = {latitude:52.52, longitude:13.405};
  const otherPlace = {latitude:-33.8688, longitude:151.2093};
  const instant = new Date('2026-10-30T12:00:00Z');
  const laterInstant = new Date('2026-10-30T18:00:00Z');
  const daytime = dayModel.calculate(instant, {latitude:0, longitude:0});
  const nighttime = nightModel.calculate(instant, {latitude:0, longitude:0});
  const berlin = dayModel.calculate(instant, place);
  const later = dayModel.calculate(laterInstant, place);
  const sydney = dayModel.calculate(instant, otherPlace);
  const galacticCenter = dayModel.equatorialOnGalacticPlane(0);
  const galacticQuarter = dayModel.equatorialOnGalacticPlane(90);

  assert.ok(Math.abs(galacticCenter.rightAscensionDeg - 266.405) < 0.01);
  assert.ok(Math.abs(galacticCenter.declinationDeg + 28.936) < 0.01);
  assert.ok(Math.abs(galacticQuarter.rightAscensionDeg - 318.004) < 0.02);
  assert.ok(Math.abs(galacticQuarter.declinationDeg - 48.33) < 0.02);
  assert.equal(daytime.lightState, 'day');
  assert.equal(nighttime.lightState, 'night');
  assert.ok(berlin.segments.length > 0);
  assert.notDeepEqual(berlin.segments, later.segments);
  assert.notDeepEqual(berlin.segments, sydney.segments);
});
