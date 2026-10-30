window.PLANETENUHR_EXPLORER_MODEL = (() => {
  'use strict';

  /**
   * Converts a geometric J2000 ecliptic vector into mean equatorial coordinates of date.
   * Uses the IAU 1976 precession angles; no nutation, aberration or refraction.
   * @param {{x:number,y:number,z:number}} vector Earth-centered J2000 vector in AU.
   * @param {Date} date Observation instant (UTC approximates dynamical time here).
   * @returns {{rightAscensionDeg:number,declinationDeg:number}} Mean coordinates of date.
   */
  function equatorialOfDate(vector, date){
    const radians = Math.PI / 180;
    const epsilon = window.PLANETENUHR_EXPLORER_CONFIG.j2000ObliquityDegrees * radians;
    const x = vector.x;
    const y = vector.y * Math.cos(epsilon) - vector.z * Math.sin(epsilon);
    const z = vector.y * Math.sin(epsilon) + vector.z * Math.cos(epsilon);
    const rightAscension = Math.atan2(y, x);
    const declination = Math.atan2(z, Math.hypot(x, y));
    const centuries = (date.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;
    const arcsecondsToRadians = radians / 3600;
    const zeta = (2306.2181 * centuries + 0.30188 * centuries ** 2 + 0.017998 * centuries ** 3) * arcsecondsToRadians;
    const zRotation = (2306.2181 * centuries + 1.09468 * centuries ** 2 + 0.018203 * centuries ** 3) * arcsecondsToRadians;
    const theta = (2004.3109 * centuries - 0.42665 * centuries ** 2 - 0.041833 * centuries ** 3) * arcsecondsToRadians;
    const a = Math.cos(declination) * Math.sin(rightAscension + zeta);
    const b = Math.cos(theta) * Math.cos(declination) * Math.cos(rightAscension + zeta) - Math.sin(theta) * Math.sin(declination);
    const c = Math.sin(theta) * Math.cos(declination) * Math.cos(rightAscension + zeta) + Math.cos(theta) * Math.sin(declination);
    return {
      rightAscensionDeg: ((Math.atan2(a, b) + zRotation) / radians + 360) % 360,
      declinationDeg: Math.asin(Math.min(1, Math.max(-1, c))) / radians
    };
  }

  /**
   * Calculates geometric one-way sunlight travel time to a planet at the selected instant.
   * The destination is held at its computed position, rather than intercepted during flight.
   * @param {{x:number,y:number,z:number}} position Heliocentric J2000 vector in AU.
   * @returns {{distanceAu:number,distanceKm:number,seconds:number}} Distance and vacuum flight time.
   */
  function lightTravel(position){
    const config = window.PLANETENUHR_EXPLORER_CONFIG;
    const distanceAu = Math.hypot(position.x, position.y, position.z);
    const distanceKm = distanceAu * config.astronomicalUnitKm;
    return { distanceAu, distanceKm, seconds: distanceKm / config.lightSpeedKmPerSecond };
  }

  /** Estimates Voyager 1's solar distance from NASA's two dated distance samples.
   * r(t) = r0 + (r1-r0) * (t-t0)/(t1-t0); no Earth distance or full trajectory.
   * @param {Date} date Selected instant, at most five years from the latest baseline.
   * @returns {object|null} Distance and one-way vacuum light time, or null outside the supported interval.
   */
  function voyagerLightTravel(date){
    const data = window.PLANETENUHR_VOYAGER_DATA;
    const time = date.getTime() / 1000;
    if (!data || !Number.isFinite(time)) return null;
    const [first, last] = data.samples;
    if (Math.abs(time - last.timeUnix) > data.maximumOffsetSeconds) return null;
    const radialSpeed = (last.distanceKm - first.distanceKm) / (last.timeUnix - first.timeUnix);
    const distanceKm = first.distanceKm + radialSpeed * (time - first.timeUnix);
    if (!Number.isFinite(distanceKm) || distanceKm <= 0) return null;
    const config = window.PLANETENUHR_EXPLORER_CONFIG;
    return {distanceKm, distanceAu:distanceKm / config.astronomicalUnitKm, seconds:distanceKm / config.lightSpeedKmPerSecond};
  }

  /**
   * Classifies geometric solar altitude using conventional sunrise and twilight limits.
   * @param {number} altitude Solar center altitude in degrees.
   * @param {boolean} rising Whether the Sun is moving upward.
   * @returns {{phase:string,level:string,key:string}} Day, directed twilight, or night.
   */
  function lightState(altitude, rising){
    const limits = window.PLANETENUHR_EXPLORER_CONFIG.solarAltitudeLimits;
    if (altitude >= limits.sunrise) {
      return { phase:'day', level:'day', key:'day' };
    }
    if (altitude <= limits.astronomical) {
      return { phase:'night', level:'night', key:'night' };
    }
    let phase = 'evening';
    if (rising) {
      phase = 'morning';
    }
    let level = 'astronomical';
    if (altitude >= limits.civil) {
      level = 'civil';
    } else if (altitude >= limits.nautical) {
      level = 'nautical';
    }
    return { phase, level, key:phase + '-' + level };
  }

  /**
   * Evaluates solar light conditions without assuming a northern-hemisphere clock schedule.
   * @param {Date} date Observation instant.
   * @param {Function} altitudeAt Function returning geometric solar altitude for a Date.
   * @returns {{phase:string,level:string,key:string}} Current lighting classification.
   */
  function solarLightAt(date, altitudeAt){
    const altitude = altitudeAt(date);
    const limits = window.PLANETENUHR_EXPLORER_CONFIG.solarAltitudeLimits;
    if (altitude >= limits.sunrise || altitude <= limits.astronomical) {
      return lightState(altitude, false);
    }
    const before = altitudeAt(new Date(date.getTime() - 60000));
    const after = altitudeAt(new Date(date.getTime() + 60000));
    return lightState(altitude, after > before);
  }

  /**
   * Reads a civil calendar date with a reusable time-zone formatter.
   * @param {Date} date Instant to format.
   * @param {Intl.DateTimeFormat} formatter Year/month/day formatter in the requested zone.
   * @returns {{year:number,month:number,day:number,key:number}} Numeric local date.
   */
  function localDateParts(date, formatter){
    const parts = {};
    formatter.formatToParts(date).forEach(part => {
      if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
        parts[part.type] = Number(part.value);
      }
    });
    parts.key = parts.year * 10000 + parts.month * 100 + parts.day;
    return parts;
  }

  /**
   * Finds the start of a local date, including midnight DST transitions.
   * @param {{year:number,month:number,day:number,key:number}} parts Desired civil date.
   * @param {Intl.DateTimeFormat} formatter Formatter for the selected IANA time zone.
   * @returns {Date} First instant belonging to this date or the next existing date.
   */
  function localDayStart(parts, formatter){
    const approximate = Date.UTC(parts.year, parts.month - 1, parts.day);
    let lower = approximate - 36 * 3600000;
    let upper = approximate + 36 * 3600000;
    while (upper - lower > 1) {
      const middle = Math.floor((lower + upper) / 2);
      if (localDateParts(new Date(middle), formatter).key < parts.key) {
        lower = middle;
      } else {
        upper = middle;
      }
    }
    return new Date(upper);
  }

  /**
   * Returns actual midnight-to-midnight bounds for the selected location's date.
   * @param {Date} date An instant within the local calendar day.
   * @param {string} timeZone IANA time-zone identifier.
   * @returns {{start:Date,end:Date,key:number}} Civil-day bounds, possibly 23 or 25 hours apart.
   */
  function localDayBounds(date, timeZone){
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' });
    const parts = localDateParts(date, formatter);
    const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
    const nextParts = { year:next.getUTCFullYear(), month:next.getUTCMonth() + 1, day:next.getUTCDate() };
    nextParts.key = nextParts.year * 10000 + nextParts.month * 100 + nextParts.day;
    return { start:localDayStart(parts, formatter), end:localDayStart(nextParts, formatter), key:parts.key };
  }

  /**
   * Refines a lighting transition found between consecutive solar samples.
   * @param {number} lower Lower timestamp in milliseconds.
   * @param {number} upper Upper timestamp in milliseconds.
   * @param {string} previousKey Lighting key at the lower bound.
   * @param {Function} altitudeAt Solar altitude evaluator.
   * @returns {number} Transition timestamp refined to within one second of the model.
   */
  function lightTransition(lower, upper, previousKey, altitudeAt){
    while (upper - lower > 1000) {
      const middle = Math.floor((lower + upper) / 2);
      if (solarLightAt(new Date(middle), altitudeAt).key === previousKey) {
        lower = middle;
      } else {
        upper = middle;
      }
    }
    return Math.round((lower + upper) / 2);
  }

  /**
   * Builds contiguous daylight/twilight/night segments for one actual local day.
   * @param {Date} date Selected instant.
   * @param {string} timeZone Location time zone.
   * @param {Function} altitudeAt Geometric solar altitude evaluator for this location.
   * @returns {object} Day bounds, directed twilight segments, sunrise/sunset and polar flags.
   */
  function solarLightDay(date, timeZone, altitudeAt){
    const bounds = localDayBounds(date, timeZone);
    const start = bounds.start.getTime();
    const end = bounds.end.getTime();
    const step = window.PLANETENUHR_EXPLORER_CONFIG.solarSampleMinutes * 60000;
    let previousTime = start;
    let state = solarLightAt(bounds.start, altitudeAt);
    let segmentStart = start;
    let sunrise = null;
    let sunset = null;
    const segments = [];
    for (let time = Math.min(start + step, end); time <= end; time = Math.min(time + step, end)) {
      const nextState = solarLightAt(new Date(time), altitudeAt);
      if (nextState.key !== state.key) {
        const boundary = lightTransition(previousTime, time, state.key, altitudeAt);
        segments.push({ ...state, start:segmentStart, end:boundary });
        if (nextState.phase === 'day' && state.phase !== 'day') {
          sunrise = new Date(boundary);
        }
        if (state.phase === 'day' && nextState.phase !== 'day') {
          sunset = new Date(boundary);
        }
        segmentStart = boundary;
        state = nextState;
      }
      previousTime = time;
      if (time === end) {
        break;
      }
    }
    if (segmentStart < end) {
      segments.push({ ...state, start:segmentStart, end });
    }
    return {
      ...bounds, segments, sunrise, sunset,
      polarDay:segments.every(segment => segment.phase === 'day'),
      polarNight:segments.every(segment => segment.phase !== 'day')
    };
  }

  return { equatorialOfDate, lightTravel, voyagerLightTravel, lightState, solarLightAt, localDayBounds, solarLightDay };
})();
