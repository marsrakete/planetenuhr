const fs = require('node:fs');
const path = require('node:path');
const {parseVectors} = require('./update-idefix-ephemeris');

const endpoint = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const mioUrl = 'https://spiftp.esac.esa.int/data/SPICE/BEPICOLOMBO/kernels/spk/bc_mmo_jlp_20261209_20271210_v01.bsp';
const requests = [
  {key:'bepicolombo', id:-121, center:10, start:'2018-10-21', end:'2027-04-06', step:'2 d'},
  {key:'mercury', id:-121, center:199, start:'2026-11-22', end:'2026-12-17', step:'10 m'},
  {key:'hera', id:-91, center:10, start:'2024-10-08', end:'2026-11-23', step:'1 d'},
  {key:'didymos', id:-91, center:20065803, start:'2026-11-05', end:'2026-11-12', step:'10 m'},
  {key:'europa', id:-159, center:10, start:'2024-10-15', end:'2030-04-12', step:'2 d'},
  {key:'clipperEarth', id:-159, center:399, start:'2026-12-02', end:'2026-12-05', step:'5 m'},
  {key:'juice', id:-28, center:10, start:'2023-04-15', end:'2031-07-21', step:'2 d'},
  {key:'psyche', id:-255, center:10, start:'2023-10-14', end:'2029-02-24', step:'2 d'},
  {key:'psycheMars', id:-255, center:499, start:'2026-05-14', end:'2026-05-17', step:'5 m'}
];

/** Downloads geometric vectors and records the selected Horizons solution and its tracking cutoff.
 * @param {object} request Target, center, date range and sampling step.
 * @returns {Promise<object>} Cached trajectory and its provenance.
 */
async function download({id, center, start, end, step}) {
  const parameters = new URLSearchParams({
    format:'json', COMMAND:String(id), CENTER:'500@' + center, EPHEM_TYPE:'VECTORS',
    START_TIME:start, STOP_TIME:end, STEP_SIZE:"'" + step + "'", TIME_TYPE:'UT',
    REF_PLANE:'ECLIPTIC', REF_SYSTEM:'ICRF', VEC_TABLE:'1', CSV_FORMAT:'YES',
    VEC_CORR:'NONE', OUT_UNITS:center === 10 ? 'AU-D' : 'KM-S'
  });
  const url = endpoint + '?' + parameters;
  const response = await fetch(url, {signal:AbortSignal.timeout(45000)});
  if (!response.ok) {
    throw new Error('Horizons HTTP ' + response.status);
  }
  const {result, error} = await response.json();
  if (error || !result?.includes('$$SOE') || !result.includes('Ecliptic of J2000.0')) {
    throw new Error(error || 'Missing Horizons vectors or unexpected reference frame');
  }
  const targetLine = result.match(/Target body name:[^\n]+/)[0];
  const centerLine = result.match(/Center body name:[^\n]+/)[0];
  if (!targetLine.includes('(' + id + ')') || !centerLine.includes('(' + center + ')')) {
    throw new Error('Unexpected target or center');
  }
  const revision = result.match(/Revised:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/);
  const tracking = result.match(/(?:data fit|tracking data|tracking-data based trajectory) through\s+(\d{4}-[A-Za-z]{3}-\d{2})/i);
  const shortTracking = result.match(/([A-Za-z]+ \d{1,2}), prediction (?:after that|thereafter)/i);
  if (!revision) {
    throw new Error('Missing Horizons solution revision');
  }
  const toDay = value => new Date(value + ' UTC').toISOString().slice(0, 10);
  const rows = parseVectors(result);
  const stepMs = Number(step.split(' ')[0]) * (step.endsWith('d') ? 86400000 : 60000);
  if (rows.length < 2 || rows[0][0] !== Date.parse(start) ||
      Date.parse(end) - rows.at(-1)[0] >= stepMs ||
      rows.slice(1).some((row, index) => row[0] - rows[index][0] !== stepMs)) {
    throw new Error('Incomplete Horizons vector series for ' + id + ' at ' + center);
  }
  return {
    id, center, url, step, revised:toDay(revision[1]),
    trackingThrough:tracking ? toDay(tracking[1]) :
      shortTracking ? toDay(shortTracking[1] + ', ' + revision[1].slice(-4)) : null,
    solution:targetLine.match(/\{source: ([^}]+)\}/)?.[1] || targetLine,
    rows
  };
}

/** Samples original state epochs from ESA's Mio DAF/SPK Type 13 file.
 * The Type 13 layout is documented in NAIF's SPK Required Reading.
 * No polynomial evaluation is needed to read the original tabulated states.
 * @param {Buffer} kernel Little-endian ESA Mio kernel.
 * @param {number} endUtc Last UTC millisecond needed by the paired Mercury view.
 * @returns {number[][]} Mercury-relative ecliptic positions [UTC ms, x, y, z], in km.
 */
function sampleMio(kernel, endUtc) {
  if (kernel.toString('ascii', 0, 7) !== 'DAF/SPK' || kernel.toString('ascii', 88, 96) !== 'LTL-IEEE' ||
      kernel.readInt32LE(8) !== 2 || kernel.readInt32LE(12) !== 6) {
    throw new Error('Unexpected Mio DAF/SPK header');
  }
  const epoch = Date.UTC(2000, 0, 1, 12);
  // Throughout this 2026 window, TT−UTC is 69.184 s. TDB−TT is under 2 ms.
  const utcFromTdb = seconds => Math.round((epoch + seconds * 1000 - 69184) / 1000) * 1000;
  const tilt = 84381.448 / 3600 * Math.PI / 180;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const rows = [];
  let summaryRecord = kernel.readInt32LE(76);
  while (summaryRecord > 0) {
    const record = (summaryRecord - 1) * 1024;
    const summaries = kernel.readDoubleLE(record + 16);
    for (let index = 0; index < summaries; index += 1) {
      const summary = record + 24 + index * 40;
      if (utcFromTdb(kernel.readDoubleLE(summary)) > endUtc) {
        break;
      }
      const body = kernel.readInt32LE(summary + 16);
      const center = kernel.readInt32LE(summary + 20);
      const frame = kernel.readInt32LE(summary + 24);
      const type = kernel.readInt32LE(summary + 28);
      if (body !== -68 || center !== 199 || frame !== 1 || type !== 13) {
        throw new Error('Unexpected Mio target, center, frame or SPK type');
      }
      const first = (kernel.readInt32LE(summary + 32) - 1) * 8;
      const last = (kernel.readInt32LE(summary + 36) - 1) * 8;
      const count = kernel.readDoubleLE(last);
      const epochs = first + count * 48;
      const startTdb = kernel.readDoubleLE(summary);
      const endTdb = kernel.readDoubleLE(summary + 8);
      for (let state = 0; state < count; state += 1) {
        const tdb = kernel.readDoubleLE(epochs + state * 8);
        const utc = utcFromTdb(tdb);
        if (tdb < startTdb || tdb > endTdb || utc > endUtc ||
            (rows.length && utc - rows.at(-1)[0] < 600000)) {
          continue;
        }
        const offset = first + state * 48;
        const x = kernel.readDoubleLE(offset);
        const y = kernel.readDoubleLE(offset + 8);
        const z = kernel.readDoubleLE(offset + 16);
        rows.push([utc, x, y * cos + z * sin, z * cos - y * sin].map(value => Number(value.toFixed(6))));
      }
    }
    summaryRecord = kernel.readDoubleLE(record);
  }
  if (rows.length < 2 || rows.at(-1)[0] < endUtc - 660000 ||
      rows.slice(1).some((row, index) => row[0] - rows[index][0] > 660000 || !row.every(Number.isFinite))) {
    throw new Error('Unexpected gap or invalid Mio states');
  }
  return rows;
}

async function main() {
  const data = {};
  for (const request of requests) {
    data[request.key] = await download(request);
    const {revised, trackingThrough, rows} = data[request.key];
    console.log(request.key, revised, trackingThrough, rows.length);
  }
  const mioResponse = await fetch(mioUrl, {signal:AbortSignal.timeout(90000)});
  if (!mioResponse.ok) {
    throw new Error('ESA SPICE HTTP ' + mioResponse.status);
  }
  const mioKernel = Buffer.from(await mioResponse.arrayBuffer());
  data.mio = {
    id:-68, center:199, url:mioUrl, step:'10 m', revised:'2026-05-27',
    solution:'OEM_MMO__260520_PREDICT__0001.bc',
    rows:sampleMio(mioKernel, data.mercury.rows.at(-1)[0] + 660000)
  };
  console.log('mio', data.mio.revised, data.mio.rows.length);
  const output = path.join(__dirname, '../js/data/space-mission-trajectories.js');
  const header = '// NASA/JPL Horizons geometric Ecliptic J2000 vectors, sampled in UTC. Generated by scripts/update-space-mission-trajectories.js.\n';
  const entries = Object.entries(data).map(([key, value]) => '  ' + key + ': ' + JSON.stringify(value));
  fs.writeFileSync(output, header + 'window.PLANETENUHR_SPACE_MISSION_TRAJECTORIES = {\n' + entries.join(',\n') + '\n};\n', 'utf8');
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {sampleMio};
