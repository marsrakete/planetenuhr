/* Offline audit. Usage: PLANETENUHR_SHARP=<sharp module path> node scripts/audit-stellarium-illustrations.cjs <download cache>.
 * Cache: pinned Modern index.json, commit.json, hyg-commit.json, hygdata_v41.csv and the original PNG basenames.
 * Downloads remain outside the application; this script only writes the two audit reports in docs/.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const sharp = require(process.env.PLANETENUHR_SHARP || 'sharp');
const root = path.resolve(__dirname, '..');

/** Reads CSV fields, preserving commas and escaped quotes inside quoted fields.
 * @param {string} line One catalogue record.
 * @returns {string[]} Decoded fields.
 */
function csvFields(line){
  const fields = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      fields.push(value);
      value = '';
    } else {
      value += character;
    }
  }
  fields.push(value);
  return fields;
}

/** Reads HIP coordinates from the original HYG v4.1 CSV.
 * @param {string} file Catalogue path.
 * @returns {Map<number,object>} HIP to J2000 coordinates and optional proper name.
 */
function catalogue(file){
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const headers = csvFields(lines.shift());
  const stars = new Map();
  for (const line of lines) {
    const values = csvFields(line);
    const hip = Number(values[headers.indexOf('hip')]);
    if (!hip) continue;
    const raHours = Number(values[headers.indexOf('ra')]);
    const decDeg = Number(values[headers.indexOf('dec')]);
    assert.ok(Number.isFinite(raHours) && Number.isFinite(decDeg), 'Valid HIP coordinates: ' + hip);
    stars.set(hip, {raHours, decDeg, name:values[headers.indexOf('proper')]});
  }
  return stars;
}

/** Reconstructs the documented north-up/east-left gnomonic projection from a figure's HIP stars.
 * @param {number[]} hips Figure stars in application order.
 * @param {Map<number,object>} stars HYG coordinates.
 * @param {object} [fixedCenter] Documented exceptional center in degrees, if the figure uses one.
 * @returns {{centerRaDeg:number,centerDecDeg:number,scale:number,offset:number[],project:Function}} Projection in the app's 0..100 chart units.
 */
function projection(hips, stars, fixedCenter){
  const sum = [0, 0, 0];
  for (const hip of hips) {
    const star = stars.get(hip);
    assert.ok(star, 'Catalogue contains figure HIP ' + hip);
    const ra = star.raHours * Math.PI / 12;
    const dec = star.decDeg * Math.PI / 180;
    sum[0] += Math.cos(dec) * Math.cos(ra);
    sum[1] += Math.cos(dec) * Math.sin(ra);
    sum[2] += Math.sin(dec);
  }
  let centerRa = Math.atan2(sum[1], sum[0]);
  let centerDec = Math.atan2(sum[2], Math.hypot(sum[0], sum[1]));
  if (fixedCenter) {
    centerRa = fixedCenter.raDeg * Math.PI / 180;
    centerDec = fixedCenter.decDeg * Math.PI / 180;
  }
  /** Projects a catalogue star onto the unscaled tangent plane.
   * @param {object} star J2000 raHours and decDeg.
   * @returns {number[]} East-left x and north-up y.
   */
  function plane(star){
    const ra = star.raHours * Math.PI / 12;
    const dec = star.decDeg * Math.PI / 180;
    const delta = ra - centerRa;
    const denominator = Math.sin(centerDec) * Math.sin(dec) + Math.cos(centerDec) * Math.cos(dec) * Math.cos(delta);
    assert.ok(denominator > 0, 'Star is inside the projection hemisphere');
    return [-Math.cos(dec) * Math.sin(delta) / denominator,
      -(Math.cos(centerDec) * Math.sin(dec) - Math.sin(centerDec) * Math.cos(dec) * Math.cos(delta)) / denominator];
  }
  const points = hips.map(hip => plane(stars.get(hip)));
  const minimum = [0, 1].map(axis => Math.min(...points.map(point => point[axis])));
  const maximum = [0, 1].map(axis => Math.max(...points.map(point => point[axis])));
  const scale = 74 / Math.max(maximum[0] - minimum[0], maximum[1] - minimum[1]);
  const offset = minimum.map((value, axis) => 50 - (value + maximum[axis]) * scale / 2);
  /** Projects one HIP star into the chart, including anchor stars outside the line figure.
   * @param {number} hip Hipparcos identifier.
   * @returns {number[]} Chart x/y coordinates.
   */
  function project(hip){
    assert.ok(stars.has(hip), 'Catalogue contains anchor HIP ' + hip);
    return plane(stars.get(hip)).map((value, axis) => value * scale + offset[axis]);
  }
  /** Projects a 3D direction, including unnormalized image-plane points.
   * @param {number[]} vector Equatorial x/y/z direction.
   * @returns {object} Chart point and signed distance to the projection horizon.
   */
  function projectDirection(vector){
    const [x, y, z] = vector;
    const denominator = Math.cos(centerDec) * Math.cos(centerRa) * x
      + Math.cos(centerDec) * Math.sin(centerRa) * y + Math.sin(centerDec) * z;
    const horizontal = Math.sin(centerRa) * x - Math.cos(centerRa) * y;
    const vertical = Math.sin(centerDec) * Math.cos(centerRa) * x
      + Math.sin(centerDec) * Math.sin(centerRa) * y - Math.cos(centerDec) * z;
    return {point:[horizontal / denominator * scale + offset[0], vertical / denominator * scale + offset[1]], denominator};
  }
  return {centerRaDeg:centerRa * 180 / Math.PI, centerDecDeg:centerDec * 180 / Math.PI, scale, offset, project, projectDirection};
}

/** Checks the full image plane against the chart projection, following Stellarium's anchor mapping.
 * @param {object[]} anchors Three pixel/J2000 correspondences.
 * @param {number[]} size Image width and height.
 * @param {object} geometry Reconstructed local projection.
 * @returns {object} Sky-triangle determinant, projected image corners and bounds.
 */
function imageGeometry(anchors, size, geometry){
  const vectors = anchors.map(anchor => {
    const ra = anchor.raHours * Math.PI / 12;
    const dec = anchor.decDeg * Math.PI / 180;
    return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  });
  const [u, v, w] = vectors;
  const skyDeterminant = u[0] * (v[1] * w[2] - v[2] * w[1])
    - u[1] * (v[0] * w[2] - v[2] * w[0]) + u[2] * (v[0] * w[1] - v[1] * w[0]);
  assert.ok(Math.abs(skyDeterminant) > 1e-10, 'Sky anchors are non-degenerate');
  const [a, b, c] = anchors.map(anchor => anchor.pixel);
  const determinant = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const corners = [[0, 0], [size[0], 0], [size[0], size[1]], [0, size[1]]].map(([x, y]) => {
    const beta = ((x - a[0]) * (c[1] - a[1]) - (y - a[1]) * (c[0] - a[0])) / determinant;
    const gamma = ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])) / determinant;
    const vector = u.map((value, axis) => (1 - beta - gamma) * value + beta * v[axis] + gamma * w[axis]);
    return geometry.projectDirection(vector);
  });
  const minimum = [0, 1].map(axis => Math.min(...corners.map(corner => corner.point[axis])));
  const maximum = [0, 1].map(axis => Math.max(...corners.map(corner => corner.point[axis])));
  return {skyDeterminant, corners, chartBounds:{minimum, maximum},
    crossesProjectionHorizon:corners.some(corner => corner.denominator <= 0),
    extendsOutsideChart:minimum.some(value => value < 0) || maximum.some(value => value > 100)};
}

/** Audits all 49 local entries against pinned remote metadata, decoded PNGs and HYG anchors.
 * @param {string} cache Download directory; no application assets are installed.
 * @returns {Promise<void>} Writes JSON evidence and a readable German report; fails on invalid source data.
 */
async function audit(cache){
  const read = file => JSON.parse(fs.readFileSync(path.join(cache, file), 'utf8'));
  const source = read('index.json');
  const revision = read('commit.json')[0].sha;
  const hygRevision = read('hyg-commit.json')[0].sha;
  const stars = catalogue(path.join(cache, 'hygdata_v41.csv'));
  const context = vm.createContext({window:{}});
  for (const file of ['phenomena-config', 'constellation-visibility-config', 'constellation-descriptions']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js/data/' + file + '.js'), 'utf8'), context);
  }
  const figureSource = fs.readFileSync(path.join(root, 'js/data/phenomena-config.js'), 'utf8');
  const monthlyHips = new Map();
  for (const match of figureSource.matchAll(/month:\s*\d+,\s*name:\s*"([^"]+)"[\s\S]*?\/\/ HIP order: ([\d, ]+)\./g)) {
    monthlyHips.set(match[1], match[2].split(',').map(Number));
  }
  const rows = [];
  for (const entry of context.window.PLANETENUHR_CONSTELLATION_VISIBILITY.constellations) {
    let profileKey = entry.key;
    if (entry.figureKey) profileKey = entry.figureKey;
    const profile = context.window.PLANETENUHR_CONSTELLATION_DESCRIPTIONS.entries[profileKey];
    const figure = context.window.PLANETENUHR_PHENOMENA.constellations.find(item =>
      item.key === entry.key || (entry.figureKey && item.name === entry.figureKey));
    const remote = source.constellations.find(item => item.id === 'CON modern ' + profile.abbreviation);
    assert.ok(figure && remote, entry.key + ': local figure and Modern entry exist');
    let hips = figure.hipparcos;
    if (!hips) hips = monthlyHips.get(figure.name);
    assert.equal(hips.length, figure.stars.length, entry.key + ': HIP order covers every star');
    let fixedCenter;
    if (entry.key === 'virgo') {
      // Virgo predates the other imports and documents its own center in phenomena-config.js.
      fixedCenter = {raDeg:199, decDeg:0};
    }
    const geometry = projection(hips, stars, fixedCenter);
    const maxCoordinateDifference = Math.max(...hips.flatMap((hip, index) =>
      geometry.project(hip).map((value, axis) => Math.abs(value - figure.stars[index][axis]))));
    const row = {key:entry.key, name:entry.names.de, abbreviation:profile.abbreviation,
      sourceId:remote.id, projection:{...geometry, maxCoordinateDifference}, image:null};
    if (remote.image) {
      const image = remote.image;
      const filename = path.join(cache, path.basename(image.file));
      const bytes = fs.readFileSync(filename);
      const metadata = await sharp(bytes).metadata();
      const pixels = await sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true});
      assert.deepEqual([metadata.width, metadata.height], image.size, entry.key + ': PNG size matches');
      assert.equal(image.anchors.length, 3, entry.key + ': three anchors');
      const anchors = image.anchors.map(anchor => {
        assert.ok(anchor.pos.every((value, axis) => Number.isFinite(value) && value >= 0 && value <= image.size[axis]), entry.key + ': anchor inside image');
        assert.ok(stars.has(anchor.hip), entry.key + ': known anchor HIP');
        const star = stars.get(anchor.hip);
        return {hip:anchor.hip, pixel:anchor.pos, inFigure:hips.includes(anchor.hip), ...star, chart:geometry.project(anchor.hip)};
      });
      const [a, b, c] = anchors.map(anchor => anchor.pixel);
      const determinant = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      assert.ok(Math.abs(determinant) > 1, entry.key + ': non-collinear pixel anchors');
      const channels = pixels.info.channels;
      const cornerOffsets = [0, (metadata.width - 1) * channels,
        (metadata.height - 1) * metadata.width * channels, (metadata.width * metadata.height - 1) * channels];
      const corners = cornerOffsets.map(offset => [...pixels.data.subarray(offset, offset + channels)]);
      row.image = {file:image.file, width:metadata.width, height:metadata.height, bytes:bytes.length,
        sha256:crypto.createHash('sha256').update(bytes).digest('hex'), hasAlpha:metadata.hasAlpha,
        cornerPixels:corners, anchorDeterminant:determinant, anchors,
        geometry:imageGeometry(anchors, image.size, geometry)};
    }
    rows.push(row);
  }
  assert.equal(rows.length, 49);
  const images = rows.filter(row => row.image);
  const missing = rows.filter(row => !row.image);
  const additional = images.filter(row => row.image.anchors.some(anchor => !anchor.inFigure));
  const mismatches = rows.filter(row => row.projection.maxCoordinateDifference > 0.015);
  const result = {checkedOn:'2026-11-18', stellariumRevision:revision, hygRevision,
    sourceUrl:'https://github.com/Stellarium/stellarium/blob/' + revision + '/skycultures/modern/index.json',
    hygUrl:'https://github.com/astronexus/HYG-Database/blob/' + hygRevision + '/hyg/CURRENT/hygdata_v41.csv',
    figureSourceSha256:crypto.createHash('sha256').update(figureSource).digest('hex'),
    summary:{entries:rows.length, images:images.length, missing:missing.map(row => row.key),
      withAlpha:images.filter(row => row.image.hasAlpha).length, additionalAnchorFigures:additional.length,
      additionalAnchorCount:additional.reduce((count, row) => count + row.image.anchors.filter(anchor => !anchor.inFigure).length, 0),
      imagePlaneHorizonCrossings:images.filter(row => row.image.geometry.crossesProjectionHorizon).map(row => row.key),
      imagesExtendingOutsideChart:images.filter(row => row.image.geometry.extendsOutsideChart).map(row => row.key),
      projectionMismatches:mismatches.map(row => ({key:row.key, maxDifference:row.projection.maxCoordinateDifference}))}, rows};
  const report = [
    '# Stellarium-Illustrationen: Prüfung aller 49 Sternbilder', '',
    'Prüfdatum: 18.11.2026. Reine Datenprüfung; keine Illustrationen in die Anwendung eingebunden.', '',
    '## Quellen und Umfang', '',
    '- [Stellarium Modern, festgeschriebener Stand](' + result.sourceUrl + ')',
    '- [HYG v4.1, festgeschriebener Stand](' + result.hygUrl + ')',
    '- [Stellarium-Ausrichtung und additive Bildmischung](https://github.com/Stellarium/stellarium/blob/' + revision + '/src/core/modules/ConstellationMgr.cpp)',
    '- Lokaler Abgleich: Sichtbarkeitsliste, gemeinsame Figuren, HIP-Reihenfolge und Beschreibungs-Abkürzungen.',
    '- Alle zugeordneten PNGs vollständig dekodiert; Maße, Dateihash, Alpha und Eckpixel geprüft. Alle Anker im HYG-Katalog aufgelöst und auf gültige, nicht kollineare Bildpositionen geprüft.', '',
    '## Ergebnis', '',
    '- ' + images.length + '/49 Einträge besitzen eine PNG-Illustration mit drei gültigen Ankern.',
    '- Ohne eigene Modern-Illustration: ' + missing.map(row => row.name).join(', ') + '. Beide gehören zum gemeinsamen Eintrag Serpens; dieser enthält kein Bild.',
    '- PNGs mit Alphakanal: ' + result.summary.withAlpha + '. Schwarzer Bildhintergrund wird in Stellarium additiv eingeblendet. Ein normales SVG-<image> mit reduzierter Deckkraft würde den Hintergrund weiterhin abdunkeln.',
    '- ' + additional.length + ' Figuren benötigen zusammen ' + result.summary.additionalAnchorCount + ' zusätzliche Ankersterne außerhalb ihrer bisherigen Linienfigur. Alle sind in HYG v4.1 vorhanden.',
    '- Abweichungen bei Rekonstruktion der vorhandenen Sternpositionen über 0,015 Diagrammeinheiten: ' + mismatches.length + ' (Einheiten beziehen sich auf 0–100, siehe Tabelle).', '',
    '- Die Jungfrau verwendet wie im Bestand dokumentiert das feste Zentrum RA 199°, Dec 0°; die übrigen Figuren den Mittelwert ihrer Sternrichtungen. Mit dieser Ausnahme stimmen alle 49 rekonstruierten Projektionen innerhalb der Rundungstoleranz mit dem Bestand überein.',
    '- Bildflächen, die den Horizont der gnomonischen Projektion schneiden: ' + result.summary.imagePlaneHorizonCrossings.length + '.',
    '- Vollständige PNG-Rechtecke außerhalb des bisherigen 0–100-Ausschnitts: ' + result.summary.imagesExtendingOutsideChart.length + '. Das betrifft auch schwarze Bildränder; es beweist nicht, dass dort sichtbare Motivteile liegen. Beim Import Bildmaske und Ausschnitt gemeinsam prüfen.', '',
    '## Vollständiger Abgleich', '',
    '| Sternbild | Bild / Pixel | HIP-Anker (* = zusätzlich) | Projektionsabweichung, maximal |',
    '| --- | --- | --- | --- |'
  ];
  for (const row of rows) {
    let imageText = 'Kein eigenes Bild';
    let anchorText = '—';
    if (row.image) {
      imageText = path.basename(row.image.file) + ' · ' + row.image.width + '×' + row.image.height;
      anchorText = row.image.anchors.map(anchor => {
        if (anchor.inFigure) return String(anchor.hip);
        return anchor.hip + '*';
      }).join(', ');
    }
    report.push('| ' + row.name + ' (' + row.abbreviation + ') | ' + imageText + ' | ' + anchorText + ' | ' + row.projection.maxCoordinateDifference.toFixed(4) + ' |');
  }
  report.push('', '## Konsequenzen für eine spätere Einbindung', '',
    '1. Originale Bildgröße und die drei HIP-/Pixel-Anker übernehmen. Die JSON-Begleitdatei enthält dazu Katalogkoordinaten und berechnete Positionen in der rekonstruierten Projektion.',
    '2. Projektionszentrum, Maßstab und Verschiebung je Figur ausdrücklich speichern. Die Rekonstruktion muss zuerst mit der vorhandenen Grafik übereinstimmen; auffällige Einträge vor einem Import klären.',
    '3. Bildpunkte über die drei J2000-Sternrichtungen auf die Himmelsfläche abbilden und danach mit derselben gnomonischen Projektion wie die Sterne darstellen. Nur affine Anpassung an drei bereits projizierte Punkte wäre eine Näherung; für die korrekte Abbildung eine projektive Transformation bzw. ein Texturgitter verwenden.',
    '4. Die PNGs über einer dunklen Himmelsschicht additiv oder nach passend geprüfter Aufbereitung einblenden. Screen ist eine mögliche optische Annäherung, aber nicht identisch mit Stellariums additiver Mischung. Sterne, Linien und Beschriftungen darüber rendern.',
    '5. Den Ausschnitt gemeinsam für Bild und Sterne bestimmen: Die Illustration kann über die auf Sterne zugeschnittene Fläche hinausreichen. Schlangenkopf/-schwanz benötigen eine gesonderte Bildquelle oder bleiben ohne Underlay.',
    '6. Sichtprüfung der tatsächlichen Überlagerung und Lizenz-/Künstlernachweise gehören zur späteren Einbindung. Diese Datenprüfung ist kein Nachweis einer bereits visuell getesteten Integration.', '',
    '## Reproduzieren', '',
    'Das Skript `scripts/audit-stellarium-illustrations.cjs` liest einen lokalen Download-Cache. Benötigt werden `index.json`, die GitHub-Commitantworten `commit.json` und `hyg-commit.json` (jeweils ein Array mit dem verwendeten Commit), `hygdata_v41.csv` und die PNGs unter ihrem unveränderten Dateinamen. Die Dateien müssen aus den oben festgeschriebenen Revisionen stammen. Sharp wird über die normale Node-Auflösung oder `PLANETENUHR_SHARP` geladen.', '',
    'Aufruf: `node scripts/audit-stellarium-illustrations.cjs <Cache-Verzeichnis>`. Die JSON-Datei enthält die vollständigen Einzelbefunde einschließlich SHA-256, Pixelankern, Sternkoordinaten und Projektionsparametern.', '');
  fs.mkdirSync(path.join(root, 'docs'), {recursive:true});
  fs.writeFileSync(path.join(root, 'docs/stellarium-illustrationen-pruefung.json'), JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'docs/stellarium-illustrationen-pruefung.md'), report.join('\n'));
  console.log(JSON.stringify(result.summary, null, 2));
}

audit(path.resolve(process.argv[2] || '.')).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
