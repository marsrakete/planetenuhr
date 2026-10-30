window.PLANETENUHR_MOON_MODEL = (() => {
  'use strict';
  // Mean synodic period in days and the existing UTC reference new Moon.
  // This is the unchanged phase approximation documented in BERECHNUNGEN.md.
  const synodic = 29.530588861;
  const knownNew = Date.UTC(2000,0,6,18,14,0);

  /** Computes the existing mean lunar phase from an explicit UTC instant.
   * Milliseconds are discarded as in the original dashboard calculation.
   * @param {Date} date Observation instant.
   * @returns {{icon:string,key:string,illum:number,frac:number}} Legacy phase icon and translation key, rounded illumination percent and cycle fraction.
   */
  function computeMoon(date){

    // Berechnung basiert auf UTC-Zeit des Datums für konsistente Phasen
    const currentUTC = Date.UTC(
        date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()
    );

    const days     = (currentUTC - knownNew) / 86400000;
    const age      = ((days % synodic) + synodic) % synodic;
    const frac     = age / synodic;                // 0..1, 0 = Neumond, 0.5 = Vollmond

    const illumRaw = 0.5 * (1 - Math.cos(2 * Math.PI * frac));
    const illum    = Math.round(illumRaw * 100);

    let key, icon;

    // Preserve the existing illumination thresholds for the eight phase labels.
    if (illum <= 2) {                         // ~0 %
      key = 'phase_new';       icon = '🌑';
    } else if (illum < 45 && frac < 0.5) {    // 2-45 %, zunehmend
      key = 'phase_wax_cres';  icon = '🌒';
    } else if (illum >= 45 && illum <= 55 && frac < 0.5) { // ~50 %, zunehmend
      key = 'phase_first_q';   icon = '🌓';
    } else if (illum > 55 && illum < 95 && frac < 0.5) {   // >55 %, <95 %, zunehmend
      key = 'phase_wax_gibb';  icon = '🌔';
    } else if (illum >= 95) {                    // ~Vollmond
      key = 'phase_full';      icon = '🌕';
    } else if (illum > 55 && frac > 0.5) {       // >55 %, abnehmend
      key = 'phase_wan_gibb';  icon = '🌖';
    } else if (illum >= 45 && illum <= 55 && frac > 0.5) { // ~50 %, abnehmend
      key = 'phase_last_q';    icon = '🌗';
    } else {                                     // <45 %, abnehmend
      key = 'phase_wan_cres';  icon = '🌘';
    }

    return { icon, key, illum, frac };
  }

  /** Estimates the next full Moon using the same mean synodic cycle.
   * A phase at or beyond full Moon advances to the following lunation.
   * @param {Date} fromDate Starting instant, left unmodified.
   * @returns {Date} Approximate next full-Moon instant.
   */
  function nextFullMoon(fromDate){
    const now     = computeMoon(fromDate);
    const frac    = now.frac;
    let deltaFrac = (0.5 - frac);
    if (deltaFrac <= 0) {
      deltaFrac += 1;
    }
    const deltaDays = deltaFrac * synodic;
    return new Date(fromDate.getTime() + deltaDays*86400000);
  }

  return {computeMoon, nextFullMoon};
})();
