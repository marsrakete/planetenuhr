window.PLANETENUHR_COORDINATES = (() => {
  'use strict';

  /** Converts a UTC instant to a Julian date.
   * @param {Date} date Instant to convert.
   * @returns {number} Julian date.
   */
  function julianDate(date){
    return date.getTime() / 86400000 + 2440587.5;
  }

  /** Normalizes an angle to the interval from 0 to 360 degrees.
   * @param {number} deg Angle in degrees.
   * @returns {number} Normalized angle.
   */
  function normalizeDeg(deg){
    return ((deg % 360) + 360) % 360;
  }

  /** Returns the existing signed-angle normalization for the expected angle range.
   * @param {number} deg Angle in degrees.
   * @returns {number} Signed angle.
   */
  function signedDeg(deg){
    return ((deg + 540) % 360) - 180;
  }

  /** Calculates local mean sidereal angle using the existing approximation.
   * @param {Date} date Observation instant.
   * @param {number} longitudeDeg Geographic longitude in degrees, east positive.
   * @returns {number} Sidereal angle in degrees.
   */
  function localSiderealAngleDegrees(date, longitudeDeg){
    const jd = julianDate(date);
    const T = (jd - 2451545.0) / 36525;
    const gmst = 280.46061837
      + 360.98564736629 * (jd - 2451545.0)
      + 0.000387933 * T * T
      - (T * T * T) / 38710000;
    return normalizeDeg(gmst + longitudeDeg);
  }

  /** Calculates mean ecliptic obliquity with the existing secular approximation.
   * @param {Date} date Observation instant.
   * @returns {number} Obliquity in degrees.
   */
  function meanObliquityDegrees(date){
    const T = (julianDate(date) - 2451545.0) / 36525;
    return 23.439291 - 0.0130042 * T;
  }

  /** Converts ecliptic longitude and latitude to approximate equatorial coordinates.
   * @param {number} longitudeDeg Ecliptic longitude in degrees.
   * @param {number} latitudeDeg Ecliptic latitude in degrees.
   * @param {Date} date Observation instant.
   * @returns {{rightAscensionDeg:number, declinationDeg:number}} Equatorial angles in degrees.
   */
  function eclipticToEquatorial(longitudeDeg, latitudeDeg, date){
    const epsilon = meanObliquityDegrees(date) * Math.PI / 180;
    const lambda = longitudeDeg * Math.PI / 180;
    const beta = latitudeDeg * Math.PI / 180;
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    const sinBeta = Math.sin(beta);
    const cosBeta = Math.cos(beta);
    const y = sinLambda * Math.cos(epsilon) - Math.tan(beta) * Math.sin(epsilon);
    const x = cosLambda;
    const rightAscensionDeg = normalizeDeg(Math.atan2(y, x) * 180 / Math.PI);
    const declinationDeg = Math.asin(
      sinBeta * Math.cos(epsilon) + cosBeta * Math.sin(epsilon) * sinLambda
    ) * 180 / Math.PI;
    return {
      rightAscensionDeg,
      declinationDeg
    };
  }

  /** Converts equatorial coordinates to local geometric horizon coordinates.
   * @param {Date} date Observation instant.
   * @param {object} location Geographic latitude and longitude in degrees.
   * @param {object} equatorial Right ascension and declination in degrees.
   * @returns {{azimuthDeg:number, altitudeDeg:number}} Azimuth from north through east and altitude.
   */
  function horizontalCoordinates(date, location, equatorial){
    const siderealAngle = localSiderealAngleDegrees(date, location.longitude || 0);
    const hourAngleDeg = signedDeg(siderealAngle - equatorial.rightAscensionDeg);
    const latitudeRad = (location.latitude || 0) * Math.PI / 180;
    const hourAngleRad = hourAngleDeg * Math.PI / 180;
    const declinationRad = equatorial.declinationDeg * Math.PI / 180;
    const altitudeDeg = Math.asin(
      Math.sin(latitudeRad) * Math.sin(declinationRad)
      + Math.cos(latitudeRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad)
    ) * 180 / Math.PI;
    const azimuthRad = Math.atan2(
      Math.sin(hourAngleRad),
      Math.cos(hourAngleRad) * Math.sin(latitudeRad) - Math.tan(declinationRad) * Math.cos(latitudeRad)
    );
    return {
      azimuthDeg: normalizeDeg(azimuthRad * 180 / Math.PI + 180),
      altitudeDeg
    };
  }

  return { julianDate, normalizeDeg, signedDeg, localSiderealAngleDegrees, meanObliquityDegrees, eclipticToEquatorial, horizontalCoordinates };
})();
