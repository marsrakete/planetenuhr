window.PLANETENUHR_RETROGRADE_MODEL = (() => {
  'use strict';
  const dayMs = 86400000;
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

    /** Projects continuous ecliptic longitude and latitude to a rectangular sky plot.
     * @param {number[]} longitudes Continuous ecliptic longitude samples in degrees.
     * @param {number[]} latitudes Matching ecliptic latitudes in degrees.
     * @param {object} bounds Plot edges left, right, top and bottom in SVG units.
     * @returns {object} Points and the displayed longitude limits.
     */
    function projectSkyTrack(longitudes, latitudes, bounds){
      const minLon = Math.min(...longitudes);
      const minLat = Math.min(...latitudes);
      const lonSpan = Math.max(0.4, Math.max(...longitudes) - minLon);
      const latSpan = Math.max(0.6, Math.max(...latitudes) - minLat);
      const points = longitudes.map((longitude, index) => ({
        x:bounds.left + ((longitude - minLon) / lonSpan) * (bounds.right - bounds.left),
        y:bounds.bottom - ((latitudes[index] - minLat) / latSpan) * (bounds.bottom - bounds.top)
      }));
      return {points, longitudeStart:minLon, longitudeEnd:minLon + lonSpan};
    }

    /** Builds the closest complete retrograde phase from consecutive 24-hour samples.
     * @param {string} key Planet key.
     * @param {Date} date Reference instant for choosing the phase and initial day.
     * @param {number} [searchDays=500] Search radius in days.
     * @returns {object|null} Chart samples, two station indices and initial day index, or null.
     */
    function calculationWindow(key, date, searchDays = 500){
      const instant = date.getTime();
      if (!Number.isFinite(instant) || !Number.isInteger(searchDays) || searchDays < 2) return null;
      const samples = [];
      let previousLongitude;
      let previousMotion = 0;
      let start = null;
      let closest = null;
      for (let offset = -searchDays; offset <= searchDays; offset++) {
        const sampleDate = new Date(instant + offset * dayMs);
        const longitude = geocentricLongitude(key, sampleDate);
        if (!Number.isFinite(longitude)) return null;
        const index = samples.length;
        if (index > 0) {
          const motion = signedDeg(longitude - previousLongitude);
          samples[index - 1].motion = motion;
          if (motion < 0 && previousMotion > 0) start = index - 1;
          if (motion > 0 && previousMotion < 0 && start !== null) {
            const end = index - 1;
            const distance = Math.max(start - searchDays, searchDays - end, 0);
            if (!closest || distance < closest.distance) closest = {start, end, distance};
            start = null;
          }
          // Preserve the previous direction across an exactly stationary sample.
          if (motion !== 0) previousMotion = motion;
        }
        samples.push({date:sampleDate, longitude});
        previousLongitude = longitude;
      }
      if (!closest) return null;

      // Include part of the direct motion on both sides of the retrograde phase.
      const padding = 32;
      const first = Math.max(0, closest.start - padding);
      const last = Math.min(samples.length - 1, closest.end + padding);
      const windowSamples = samples.slice(first, last + 1);
      const relative = unwrapLongitudeSeries(windowSamples.map(sample => sample.longitude));
      windowSamples.forEach((sample, index) => {
        sample.relativeLongitude = relative[index];
        sample.latitude = geocentricLatitude(key, sample.date);
      });
      const startStation = closest.start - first;
      const endStation = closest.end - first;
      let selectedIndex = Math.floor((startStation + endStation) / 2);
      if (searchDays >= first && searchDays < last) selectedIndex = searchDays - first;
      return {samples:windowSamples, startStation, endStation, selectedIndex};
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
      const track = projectSkyTrack(unwrappedLongitude, latitudes, {left:10, right:width - 10, top:10, bottom:height - 10});
      const points = track.points.map((point, index) => [point.x, point.y, samples[index].offset]);
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

    return {apparentDailyMotion, findNearestStationDate, unwrapLongitudeSeries, projectSkyTrack, samplePath, calculationWindow};
  }
  return {create};
})();
