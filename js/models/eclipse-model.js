window.PLANETENUHR_ECLIPSE_MODEL = (() => {
  'use strict';
  // Existing educational cycles; not a prediction of local eclipse contacts.
  const eclipseSeasonAnchor = Date.UTC(2026, 7, 12, 18, 0, 0);
  const eclipseSeasonCycleDays = 173.31;
  const eclipseSeasonHalfWindowDays = 17.5;

  /** Measures phase and nearest-node distance in the existing mean draconic cycle.
   * @param {Date} date Explicit observation instant.
   * @returns {object} Node phase and distanceDays.
   */
  function moonNodeDistance(date){
    const draconic = 27.212220817;
    const knownNode = Date.UTC(2000,0,9,0,0,0);
    const currentUTC = Date.UTC(
      date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()
    );
    const days = (currentUTC - knownNode) / 86400000;
    const phase = ((days % draconic) + draconic) % draconic / draconic;
    // Two lunar nodes exist 180° apart, so the nearest node can lie at
    // phase 0, 0.5 or 1.0 in the draconic cycle.
    const distance = Math.min(
      phase,
      Math.abs(phase - 0.5),
      1 - phase
    );
    return { phase, distanceDays:distance * draconic };
  }

  /** Measures distance to the nearest center of the existing eclipse-season cycle.
   * @param {Date} date Explicit observation instant.
   * @returns {object} Season phase, distance, active flag and center dates.
   */
  function eclipseSeasonInfo(date){
    const deltaDays = (date.getTime() - eclipseSeasonAnchor) / 86400000;
    const phase = ((deltaDays % eclipseSeasonCycleDays) + eclipseSeasonCycleDays) % eclipseSeasonCycleDays;
    const distanceToCenter = Math.min(phase, eclipseSeasonCycleDays - phase);
    const active = distanceToCenter <= eclipseSeasonHalfWindowDays;
    const cycles = Math.round(deltaDays / eclipseSeasonCycleDays);
    const nearestCenter = new Date(eclipseSeasonAnchor + cycles * eclipseSeasonCycleDays * 86400000);
    const nextCenter = new Date(date.getTime() + (eclipseSeasonCycleDays - phase) * 86400000);
    return { phase, distanceToCenter, active, nearestCenter, nextCenter };
  }

  return { moonNodeDistance, eclipseSeasonInfo, eclipseSeasonCycleDays, eclipseSeasonHalfWindowDays };
})();
