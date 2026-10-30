window.PLANETENUHR_SOLAR_VISIBILITY = (() => {
  'use strict';
  const solarPlanets = window.PLANETENUHR_PLANET_ELEMENTS;
  const {planetPosition} = window.PLANETENUHR_PLANET_MODEL;
  const {normalizeDeg, eclipticToEquatorial} = window.PLANETENUHR_COORDINATES;

  /** Finds the calendar day number using the existing UTC day-difference convention.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @returns {number} Calendar day number.
   */
  function dayOfYear(date){
    const start = Date.UTC(date.getFullYear(), 0, 0);
    const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((current - start) / 86400000);
  }

  /** Finds the existing local elapsed-day index used by the analemma.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @returns {number} Local day index, retaining existing DST handling.
   */
  function dayOfYearLocal(date){
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date - start) / 86400000) + 1;
  }

  /** Returns the calendar-year length used by seasonal approximations.
   * @param {number} year Calendar year.
   * @returns {number} 365 or 366 days.
   */
  function daysInYear(year){
    if (new Date(year, 1, 29).getMonth() === 1) {
      return 366;
    }
    return 365;
  }

  /** Estimates rise or set time with the existing compact solar-event algorithm.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @param {number} latitude Geographic latitude in degrees.
   * @param {number} longitude Geographic longitude in degrees, east positive.
   * @param {number} zenithDeg Event zenith angle in degrees.
   * @param {boolean} isRise True for the rising crossing.
   * @returns {Date|null} UTC event time or null when the threshold is not crossed.
   */
  function solarEventUtc(date, latitude, longitude, zenithDeg, isRise){
    const n = dayOfYear(date);
    const lngHour = longitude / 15;
    let baseHour = 18;
    if (isRise) {
      baseHour = 6;
    }
    const tDay = n + ((baseHour - lngHour) / 24);
    const meanAnomaly = (0.9856 * tDay) - 3.289;
    let trueLongitude = meanAnomaly
      + (1.916 * Math.sin(meanAnomaly * Math.PI / 180))
      + (0.020 * Math.sin(2 * meanAnomaly * Math.PI / 180))
      + 282.634;
    trueLongitude = ((trueLongitude % 360) + 360) % 360;

    let rightAscension = Math.atan(0.91764 * Math.tan(trueLongitude * Math.PI / 180)) * 180 / Math.PI;
    rightAscension = ((rightAscension % 360) + 360) % 360;
    rightAscension += Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90;
    rightAscension /= 15;

    const sinDec = 0.39782 * Math.sin(trueLongitude * Math.PI / 180);
    const cosDec = Math.cos(Math.asin(sinDec));
    const latRad = latitude * Math.PI / 180;
    const cosHour = (Math.cos(zenithDeg * Math.PI / 180) - (sinDec * Math.sin(latRad))) / (cosDec * Math.cos(latRad));
    if (cosHour > 1 || cosHour < -1) return null;

    let hourAngle = Math.acos(cosHour) * 180 / Math.PI;
    if (isRise) hourAngle = 360 - hourAngle;
    hourAngle /= 15;

    const localMeanTime = hourAngle + rightAscension - (0.06571 * tDay) - 6.622;
    const utcHour = ((localMeanTime - lngHour) % 24 + 24) % 24;
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Math.floor(utcHour),
      Math.floor((utcHour % 1) * 60),
      Math.round((((utcHour % 1) * 60) % 1) * 60)
    ));
  }

  /** Derives the solar ecliptic longitude opposite the heliocentric Earth.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @returns {number} Longitude in degrees.
   */
  function sunLongitude(date){
    const earth = solarPlanets.find(planet => planet.key === 'earth');
    const pos = planetPosition(earth, date);
    return normalizeDeg(Math.atan2(pos.y, pos.x) * 180 / Math.PI + 180);
  }

  /** Converts the existing approximate solar longitude to equatorial coordinates.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @returns {object} Right ascension and declination in degrees.
   */
  function solarEquatorialCoordinates(date){
    return eclipticToEquatorial(sunLongitude(date), 0, date);
  }

  /** Estimates seasonal solar declination with the existing sinusoid.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @returns {number} Declination in degrees.
   */
  function approximateSolarDeclinationDegrees(date){
    return 23.44 * Math.sin(2 * Math.PI * (dayOfYearLocal(date) - 80) / daysInYear(date.getFullYear()));
  }

  /** Calculates the existing compact equation-of-time approximation.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @returns {number} Equation of time in minutes.
   */
  function approximateEquationOfTimeMinutes(date){
    const B = 2 * Math.PI * (dayOfYearLocal(date) - 81) / 364;
    return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  }

  /** Approximates a standard meridian from geographic longitude.
   * @param {object} location Explicit geographic latitude and longitude.
   * @returns {number} Meridian longitude in degrees.
   */
  function approximateTimeZoneMeridianDegrees(location){
    return Math.round(location.longitude / 15) * 15;
  }

  /** Calculates the existing didactic offset of solar noon.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @param {object} location Explicit geographic latitude and longitude.
   * @returns {number} Noon offset in minutes.
   */
  function approximateSolarNoonOffsetMinutes(date, location){
    const equationOfTime = approximateEquationOfTimeMinutes(date);
    const meridian = approximateTimeZoneMeridianDegrees(location);
    return equationOfTime + 4 * (location.longitude - meridian);
  }

  /** Calculates the existing didactic noon-altitude approximation.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @param {object} location Explicit geographic latitude and longitude.
   * @returns {number} Altitude in degrees.
   */
  function approximateNoonAltitudeDegrees(date, location){
    const declination = approximateSolarDeclinationDegrees(date);
    const hourAngle = approximateSolarNoonOffsetMinutes(date, location) / 4;
    const latitudeRad = location.latitude * Math.PI / 180;
    const declinationRad = declination * Math.PI / 180;
    const hourAngleRad = hourAngle * Math.PI / 180;
    const altitude = Math.asin(
      Math.sin(latitudeRad) * Math.sin(declinationRad)
      + Math.cos(latitudeRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad)
    );
    return altitude * 180 / Math.PI;
  }

  /** Samples the existing schematic night visibility at twenty-minute intervals.
   * @param {Date} date Explicit observation instant; calendar helpers retain browser-local date fields.
   * @param {object} location Explicit geographic latitude and longitude.
   * @param {number} elongation Precomputed signed solar elongation in degrees.
   * @returns {object} Dark interval, visible segments and approximate best time.
   */
  function nightVisibilitySegments(date, location, elongation){
    const dawn = solarEventUtc(date, location.latitude, location.longitude, 96, true);
    const dusk = solarEventUtc(date, location.latitude, location.longitude, 96, false);
    if (!dawn || !dusk) return { durationHours:0, segments:[], bestTime:null, dusk:null, dawn:null };
    const start = dusk.getTime();
    const end = dawn.getTime() + 86400000;
    const durationHours = (end - start) / 3600000;
    const transitHour = ((12 + elongation / 15) % 24 + 24) % 24;
    const riseHour = ((transitHour - 6) % 24 + 24) % 24;
    const setHour = ((transitHour + 6) % 24 + 24) % 24;
    const isUp = hour => {
      if (riseHour <= setHour) {
        return hour >= riseHour && hour <= setHour;
      }

      return hour >= riseHour || hour <= setHour;
    };
    const sampleMinutes = 20;
    const samples = [];
    for (let time = start; time <= end; time += sampleMinutes * 60000) {
      const hour = (((time / 3600000) % 24) + 24) % 24;
      samples.push({ time, up:isUp(hour) });
    }
    const segments = [];
    let current = null;
    samples.forEach(sample => {
      if (sample.up && !current) current = { start:sample.time, end:sample.time };
      if (sample.up && current) current.end = sample.time;
      if (!sample.up && current) {
        segments.push(current);
        current = null;
      }
    });
    if (current) segments.push(current);
    const longest = segments.slice().sort((a, b) => (b.end - b.start) - (a.end - a.start))[0] || null;
    let bestTime = null;
    if (longest) {
      bestTime = new Date((longest.start + longest.end) / 2);
    }
    return { durationHours, segments, bestTime, dusk, dawn };
  }

  return { dayOfYear, dayOfYearLocal, daysInYear, solarEventUtc, sunLongitude, solarEquatorialCoordinates, approximateSolarDeclinationDegrees, approximateEquationOfTimeMinutes, approximateTimeZoneMeridianDegrees, approximateSolarNoonOffsetMinutes, approximateNoonAltitudeDegrees, nightVisibilitySegments };
})();
