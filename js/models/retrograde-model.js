window.PLANETENUHR_RETROGRADE_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free retrograde-motion and sampled-path model.
   * @param {object} options Geocentric longitude/latitude providers (key, Date) and signedDeg angle normalization.
   * @returns {object} Operations without timers, event listeners or global selection ownership.
   */
  function create(options){
    const geocentricLongitude = options.longitude;
    const geocentricLatitude = options.latitude;
    const signedDeg = options.signedDeg;

    /** Measures centered daily ecliptic-longitude motion; a negative value indicates retrograde drift.
     * @param {string} key Planet key. @param {Date} date Explicit observation instant.
     * @returns {number} Signed degrees per day using the unchanged two-day difference.
     */
    function apparentDailyMotion(key, date){
      const prev = geocentricLongitude(key, new Date(date.getTime() - 86400000));
      const next = geocentricLongitude(key, new Date(date.getTime() + 86400000));
      return signedDeg(next - prev) / 2;
    }

    /** Finds the closest sign flip of apparent daily motion in the existing daily search window.
     * @param {string} key Planet key. @param {Date} date Explicit reference instant.
     * @param {number} [maxDays=220] Search radius in days. @returns {object|null} Half-day station estimate and absolute day distance, or null.
     */
    function findNearestStationDate(key, date, maxDays = 220){
      let best = null;
      let previousMotion = apparentDailyMotion(key, new Date(date.getTime() - maxDays * 86400000));
      for (let offset = -maxDays + 1; offset <= maxDays; offset++) {
        const candidateDate = new Date(date.getTime() + offset * 86400000);
        const motion = apparentDailyMotion(key, candidateDate);
        if ((previousMotion < 0 && motion >= 0) || (previousMotion > 0 && motion <= 0)) {
          const absDays = Math.abs(offset - 0.5);
          if (!best || absDays < best.absDays) {
            best = {
              date:new Date(date.getTime() + (offset - 0.5) * 86400000),
              absDays
            };
          }
        }
        previousMotion = motion;
      }
      return best;
    }

    /** Unwraps longitude crossings as cumulative signed steps relative to the first sample.
     * @param {number[]} values Ecliptic longitudes in degrees. @returns {number[]} Continuous relative longitude series.
     */
    function unwrapLongitudeSeries(values){
      let previous = null;
      let cumulative = 0;
      return values.map(value => {
        if (previous !== null) cumulative += signedDeg(value - previous);
        previous = value;
        return cumulative;
      });
    }

    /** Samples the geocentric track and station markers over the unchanged +/-90-day window.
     * @param {string} key Planet key. @param {Date} date Explicit reference instant.
     * @returns {object} Plot dimensions, path, station markers and current/arrow reference points.
     */
    function samplePath(key, date){
      const width = 260;
      const height = 74;
      const samples = [];
      for (let offset = -90; offset <= 90; offset += 2) {
        const sampleDate = new Date(date.getTime() + offset * 86400000);
        samples.push({
          lon: geocentricLongitude(key, sampleDate),
          lat: geocentricLatitude(key, sampleDate),
          offset
        });
      }
      const unwrappedLongitude = unwrapLongitudeSeries(samples.map(sample => sample.lon));
      const latitudes = samples.map(sample => sample.lat);
      const minLon = Math.min(...unwrappedLongitude);
      const maxLon = Math.max(...unwrappedLongitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const lonSpan = Math.max(0.4, maxLon - minLon);
      const latSpan = Math.max(0.6, maxLat - minLat);
      const points = samples.map((sample, index) => {
        const x = 10 + ((unwrappedLongitude[index] - minLon) / lonSpan) * (width - 20);
        const y = height - 10 - ((sample.lat - minLat) / latSpan) * (height - 20);
        return [x, y, sample.offset];
      });
      const path = points.map((point, index) => {
        let command = 'M';
        if (index) {
          command = 'L';
        }
        return command + point[0].toFixed(1) + ' ' + point[1].toFixed(1);
      }).join(' ');
      const stationMarkers = [];
      for (let offset = -89; offset <= 89; offset++) {
        const left = apparentDailyMotion(key, new Date(date.getTime() + offset * 86400000));
        const right = apparentDailyMotion(key, new Date(date.getTime() + (offset + 1) * 86400000));
        if ((left < 0 && right >= 0) || (left > 0 && right <= 0)) {
          const index = Math.round((offset + 90) / 2);
          if (points[index]) stationMarkers.push(points[index]);
        }
      }
      const arrowPoint = points[Math.max(1, points.length - 6)];
      const currentPoint = points[Math.round((points.length - 1) / 2)];
      return { width, height, path, stationMarkers, currentPoint, arrowPoint };
    }

    return {apparentDailyMotion, findNearestStationDate, unwrapLongitudeSeries, samplePath};
  }
  return {create};
})();
