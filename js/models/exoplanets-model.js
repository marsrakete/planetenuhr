window.PLANETENUHR_EXOPLANETS_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free schematic Kepler periods and normalized exoplanet positions.
   * @param {object} options Existing julianDate(Date) and normalizeDeg(angle) calculation providers.
   * @returns {object} Model or render operations; starts no timers or listeners.
   */
  function create(options){
    const julianDate = options.julianDate;
    const normalizeDeg = options.normalizeDeg;

    /**
     * Computes a simple orbital period estimate from semi-major axis and host-star mass.
     * Kepler's third law is used in solar units so the exoplanet comparison can
     * animate schematic orbital phases without needing a full ephemeris.
     * @param {number} orbitAu Semi-major axis in astronomical units.
     * @param {number} starMassSun Host-star mass in solar masses.
     * @returns {number} Estimated orbital period in Earth days.
     */
    function exoplanetPeriodDays(orbitAu, starMassSun){
      let safeOrbit = orbitAu;
      if (!Number.isFinite(safeOrbit) || safeOrbit <= 0) {
        safeOrbit = 0.01;
      }

      let safeMass = starMassSun;
      if (!Number.isFinite(safeMass) || safeMass <= 0) {
        safeMass = 1;
      }

      const periodYears = Math.sqrt(Math.pow(safeOrbit, 3) / safeMass);
      return periodYears * 365.25;
    }

    /** Calculates the existing normalized orbit and schematic phase for one exoplanet.
     * @param {object} system Host-star and outer-orbit configuration. @param {object} planet Configured planet.
     * @param {Date} date Explicit reference instant. @param {number} systemIndex System label offset index.
     * @param {number} planetIndex Planet label offset index. @returns {object} Period, phase angle and plot coordinates.
     */
    function planetState(system, planet, date, systemIndex, planetIndex){
      const centerX = 110;
      const centerY = 110;
      const outerRadius = 78;
      let maxOrbitAu = system.maxOrbitAu;
      if (!Number.isFinite(maxOrbitAu) || maxOrbitAu <= 0) {
        maxOrbitAu = 1;
      }

      const orbitRadius = 16 + (planet.orbitAu / maxOrbitAu) * (outerRadius - 16);
      const periodDays = exoplanetPeriodDays(planet.orbitAu, system.starMassSun);
      const daysSinceEpoch = julianDate(date) - 2451545;
      const phaseBase = daysSinceEpoch / periodDays * 360;
      const labelOffset = systemIndex * 31 + planetIndex * 57;
      const angleDegrees = normalizeDeg(phaseBase + labelOffset);
      const angleRadians = angleDegrees * Math.PI / 180;
      const x = centerX + Math.cos(angleRadians) * orbitRadius;
      const y = centerY + Math.sin(angleRadians) * orbitRadius;

      return {centerX,centerY,outerRadius,maxOrbitAu,orbitRadius,periodDays,angleDegrees,x,y};
    }

    return {exoplanetPeriodDays, planetState};
  }
  return {create};
})();
