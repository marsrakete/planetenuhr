const fs = require('node:fs');
const path = require('node:path');
const sourceUrl = 'https://eyes.nasa.gov/assets/dynamic/dynamo/sc_voyager_1/now.json';

/** Validates NASA's two dated solar-distance samples before importing them.
 * @param {unknown} payload NASA Eyes JSON response.
 * @returns {object[]} Ordered samples with Unix seconds and solar distance in km.
 */
function validateSamples(payload){
  if (!Array.isArray(payload) || payload.length !== 2) throw new Error('Expected two NASA samples');
  const samples = payload.map(row => ({timeUnix:row.timeUnix, distanceKm:row.sun?.dist}));
  if (!samples.every(row => Number.isFinite(row.timeUnix) && Number.isFinite(row.distanceKm) && row.distanceKm > 1e10)) throw new Error('Invalid NASA sample');
  const interval = samples[1].timeUnix - samples[0].timeUnix;
  const radialSpeed = (samples[1].distanceKm - samples[0].distanceKm) / interval;
  if (interval < 3600 || interval > 172800 || radialSpeed < 10 || radialSpeed > 25) throw new Error('Unexpected Voyager interval or radial speed');
  return samples;
}

/** Downloads NASA's current baseline; failed validation preserves the existing file.
 * No parameters. @returns {Promise<void>} Completion after writing validated local data.
 */
async function main(){
  const response = await fetch(sourceUrl, {signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error('NASA HTTP ' + response.status);
  const samples = validateSamples(await response.json());
  const data = {
    source:'NASA Eyes / Voyager mission status', sourceUrl,
    statusUrl:'https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/',
    methodUrl:'https://science.nasa.gov/specials/apps/voyager-vital-signs/assets/javascripts/vital_signs.js',
    milestoneUrl:'https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/',
    retrievedAt:new Date().toISOString(), units:'km', timeScale:'Unix UTC seconds',
    method:'Linear solar-distance estimate from two NASA samples; not live telemetry or a full trajectory.',
    maximumOffsetSeconds:5 * 365.25 * 86400,
    samples
  };
  fs.writeFileSync(path.join(__dirname, '..', 'voyager-data.js'), '/** NASA solar-distance baseline. Regenerate with node scripts/update-voyager-data.js. */\nwindow.PLANETENUHR_VOYAGER_DATA = ' + JSON.stringify(data, null, 2) + ';\n', 'utf8');
  console.log(JSON.stringify(data, null, 2));
}

if (require.main === module) {
  main().catch(error => {console.error(error.message);process.exitCode = 1;});
}
module.exports = {validateSamples};
