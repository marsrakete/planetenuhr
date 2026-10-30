window.PLANETENUHR_PLANET_MODEL = (() => {
  'use strict';
  const solarPlanets = window.PLANETENUHR_PLANET_ELEMENTS;
  const {julianDate, normalizeDeg} = window.PLANETENUHR_COORDINATES;

  /** Solves the Kepler equation with the original eight Newton iterations.
   * @param {number} meanAnomaly Mean anomaly in radians.
   * @param {number} eccentricity Orbital eccentricity.
   * @returns {number} Eccentric anomaly in radians.
   */
  function solveKepler(meanAnomaly, eccentricity){
    let eccentricAnomaly = meanAnomaly;
    for(let step=0; step<8; step++){
      eccentricAnomaly -= (eccentricAnomaly - eccentricity*Math.sin(eccentricAnomaly) - meanAnomaly) /
        (1 - eccentricity*Math.cos(eccentricAnomaly));
    }
    return eccentricAnomaly;
  }

  /** Calculates a heliocentric J2000 position from the existing secular elements.
   * @param {object} planet Element pairs from planet-elements-config.js.
   * @param {Date} date Explicit observation instant.
   * @returns {{x:number,y:number,z:number,a:number}} Ecliptic position and semimajor axis in AU.
   */
  function planetPosition(planet, date){
    const T = (julianDate(date) - 2451545.0) / 36525;
    const a = planet.a[0] + planet.a[1] * T;
    const e = planet.e[0] + planet.e[1] * T;
    const i = (planet.i[0] + planet.i[1] * T) * Math.PI / 180;
    const L = normalizeDeg(planet.L[0] + planet.L[1] * T);
    const p = normalizeDeg(planet.p[0] + planet.p[1] * T);
    const n = normalizeDeg(planet.n[0] + planet.n[1] * T);
    const M = normalizeDeg(L - p) * Math.PI / 180;
    const E = solveKepler(M, e);
    const xp = a * (Math.cos(E) - e);
    const yp = a * Math.sqrt(1 - e*e) * Math.sin(E);
    const w = (p - n) * Math.PI / 180;
    const node = n * Math.PI / 180;

    const cosW = Math.cos(w), sinW = Math.sin(w);
    const cosN = Math.cos(node), sinN = Math.sin(node);
    const cosI = Math.cos(i);
    const x = (cosW*cosN - sinW*sinN*cosI) * xp + (-sinW*cosN - cosW*sinN*cosI) * yp;
    const y = (cosW*sinN + sinW*cosN*cosI) * xp + (-sinW*sinN + cosW*cosN*cosI) * yp;
    const z = (sinW * Math.sin(i)) * xp + (cosW * Math.sin(i)) * yp;
    return { x, y, z, a };
  }

  /** Finds a configured planet by its stable key.
   * @param {string} key Planet key.
   * @returns {object|undefined} Configured orbital elements, if found.
   */
  function planetByKey(key){
    return solarPlanets.find(item => item.key === key);
  }

  /** Calculates a configured planet position relative to the Sun.
   * @param {string} key Planet key.
   * @param {Date} date Explicit observation instant.
   * @returns {object|null} Ecliptic position in AU, or null for an unknown key.
   */
  function heliocentricPosition(key, date){
    const planet = planetByKey(key);
    if (planet) {
      return planetPosition(planet, date);
    }
    return null;
  }

  /** Subtracts the Earth position to produce an Earth-centered J2000 vector.
   * @param {string} key Planet key or sun.
   * @param {Date} date Explicit observation instant.
   * @returns {object|null} Earth-centered vector in AU, or null for an unknown key.
   */
  function geocentricVector(key, date){
    const earth = heliocentricPosition('earth', date);
    if (!earth) {
      return null;
    }
    if (key === 'sun') {
      return { x:-earth.x, y:-earth.y, z:-(earth.z || 0) };
    }
    const body = heliocentricPosition(key, date);
    if (!body) {
      return null;
    }
    return { x:body.x - earth.x, y:body.y - earth.y, z:(body.z || 0) - (earth.z || 0) };
  }

  return { solveKepler, planetPosition, planetByKey, heliocentricPosition, geocentricVector };
})();
