window.PLANETENUHR_BARYCENTER_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free mass-weighted solar barycenter and multi-year trail model.
   * @param {object} options Planet element list, mass ratios in solar-mass units and explicit planetPosition(planet, Date) provider.
   * @returns {object} Model or controller operations with no timers or persistent storage.
   */
  function create(options){
    const solarPlanets = options.planets;
    const solarPlanetMassRatios = options.massRatios;
    const planetPosition = options.position;

    /**
     * Returns the currently active planet set for the barycenter comparison card.
     * @param {string} [mode=all] Selected influence mode key.
     * @returns {string[]} Ordered list of planet keys included in the barycenter calculation.
     */
    function barycenterModePlanetKeys(mode = 'all'){
      if (mode === 'jupiter') {
        return ['jupiter'];
      }

      if (mode === 'jupiter_saturn') {
        return ['jupiter', 'saturn'];
      }

      return solarPlanets.map(planet => planet.key);
    }

    /**
     * Returns the solar-system barycenter relative to the Sun for the given date.
     * The result uses heliocentric planet positions together with approximate
     * planetary mass ratios in units of solar masses.
     * @param {Date} date Calendar date used for the position estimate.
     * @param {string} [mode=all] Active influence mode that limits the included planets.
     * @returns {object} Barycenter vector, distance and per-planet contribution data.
     */
    function solarBarycenter(date, mode = 'all'){
      let weightedX = 0;
      let weightedY = 0;
      let weightedZ = 0;
      let planetMassTotal = 0;
      const contributors = [];
      const activeKeys = barycenterModePlanetKeys(mode);

      solarPlanets.forEach(planet => {
        if (!activeKeys.includes(planet.key)) {
          return;
        }

        const massRatio = solarPlanetMassRatios[planet.key];
        const position = planetPosition(planet, date);
        if (!massRatio || !position) {
          return;
        }

        weightedX += massRatio * position.x;
        weightedY += massRatio * position.y;
        weightedZ += massRatio * position.z;
        planetMassTotal += massRatio;

        contributors.push({
          key: planet.key,
          weightedDistance: massRatio * Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z)
        });
      });

      const divisor = 1 + planetMassTotal;
      const x = weightedX / divisor;
      const y = weightedY / divisor;
      const z = weightedZ / divisor;
      const distanceAu = Math.sqrt(x * x + y * y + z * z);

      contributors.sort((left, right) => right.weightedDistance - left.weightedDistance);

      return {
        x,
        y,
        z,
        distanceAu,
        contributors
      };
    }

    /**
     * Returns the Sun-center offset in a barycentric frame.
     * In this simplified model the Sun sits at the negative of the barycenter
     * vector that was measured from the Sun.
     * @param {Date} date Calendar date used for the estimate.
     * @param {string} [mode=all] Active influence mode that limits the included planets.
     * @returns {object} Sun-center vector relative to the barycenter, in AU.
     */
    function sunOffsetFromBarycenter(date, mode = 'all'){
      const barycenter = solarBarycenter(date, mode);
      return {
        x: -barycenter.x,
        y: -barycenter.y,
        z: -barycenter.z,
        distanceAu: barycenter.distanceAu,
        contributors: barycenter.contributors
      };
    }

    /**
     * Samples the Sun's barycentric wobble around the selected date.
     * The returned points form the multi-year trail shown in the barycenter card.
     * @param {Date} date Center date of the sampled window.
     * @param {number} [halfSpanDays=9125] Number of days sampled into past and future.
     * @param {number} [stepDays=30] Sampling interval in days.
     * @param {string} [mode=all] Active influence mode that limits the included planets.
     * @returns {object[]} Ordered list of trail points with date and AU coordinates.
     */
    function barycenterTrail(date, halfSpanDays = 9125, stepDays = 30, mode = 'all'){
      const points = [];

      for (let dayOffset = -halfSpanDays; dayOffset <= halfSpanDays; dayOffset += stepDays) {
        const sampleDate = new Date(date.getTime() + dayOffset * 86400000);
        const sunOffset = sunOffsetFromBarycenter(sampleDate, mode);
        points.push({
          date: sampleDate,
          x: sunOffset.x,
          y: sunOffset.y,
          z: sunOffset.z,
          distanceAu: sunOffset.distanceAu
        });
      }

      return points;
    }

    return {barycenterModePlanetKeys, solarBarycenter, sunOffsetFromBarycenter, barycenterTrail};
  }
  return {create};
})();
