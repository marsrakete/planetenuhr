window.PLANETENUHR_MOON_MODEL = (() => {
  'use strict';
  // Mean synodic period in days and the existing UTC reference new Moon.
  // This is the unchanged phase approximation documented in BERECHNUNGEN.md.
  const synodic = 29.530588861;
  const knownNew = Date.UTC(2000,0,6,18,14,0);
  const dayMs = 86400000;
  const unixJulianDay = 2440587.5;
  const phaseEpoch = 2451550.09766;
  const radians = Math.PI / 180;

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

  // Meeus, Astronomical Algorithms, 2nd ed., chapter 49, full-moon terms.
  function fullMoonDynamicalJulianDay(k){
    const t = k / 1236.85;
    const t2 = t * t;
    const t3 = t2 * t;
    const t4 = t3 * t;
    const e = 1 - 0.002516 * t - 0.0000074 * t2;
    const e2 = e * e;
    const m = 2.5534 + 29.10535670 * k - 0.0000014 * t2 - 0.00000011 * t3;
    const mp = 201.5643 + 385.81693528 * k + 0.0107582 * t2 + 0.00001238 * t3 - 0.000000058 * t4;
    const f = 160.7108 + 390.67050284 * k - 0.0016118 * t2 - 0.00000227 * t3 + 0.000000011 * t4;
    const omega = 124.7746 - 1.56375588 * k + 0.0020672 * t2 + 0.00000215 * t3;
    const periodic = [
      [-0.40614, mp], [0.17302 * e, m], [0.01614, 2 * mp], [0.01043, 2 * f],
      [0.00734 * e, mp - m], [-0.00515 * e, mp + m], [0.00209 * e2, 2 * m],
      [-0.00111, mp - 2 * f], [-0.00057, mp + 2 * f], [0.00056 * e, 2 * mp + m],
      [-0.00042, 3 * mp], [0.00042 * e, m + 2 * f], [0.00038 * e, m - 2 * f],
      [-0.00024 * e, 2 * mp - m], [-0.00017, omega], [-0.00007, mp + 2 * m],
      [0.00004, 2 * mp - 2 * f], [0.00004, 3 * m], [0.00003, mp + m - 2 * f],
      [0.00003, 2 * mp + 2 * f], [-0.00003, mp + m + 2 * f], [0.00003, mp - m + 2 * f],
      [-0.00002, mp - m - 2 * f], [-0.00002, 3 * mp + m], [0.00002, 4 * mp]
    ];
    const planetary = [
      [0.000325, 299.77 + 0.107408 * k - 0.009173 * t2],
      [0.000165, 251.88 + 0.016321 * k], [0.000164, 251.83 + 26.651886 * k],
      [0.000126, 349.42 + 36.412478 * k], [0.000110, 84.66 + 18.206239 * k],
      [0.000062, 141.74 + 53.303771 * k], [0.000060, 207.14 + 2.453732 * k],
      [0.000056, 154.84 + 7.306860 * k], [0.000047, 34.52 + 27.261239 * k],
      [0.000042, 207.19 + 0.121824 * k], [0.000040, 291.34 + 1.844379 * k],
      [0.000037, 161.72 + 24.198154 * k], [0.000035, 239.56 + 25.513099 * k],
      [0.000023, 331.55 + 3.592518 * k]
    ];
    const mean = phaseEpoch + synodic * k + 0.00015437 * t2 - 0.000000150 * t3 + 0.00000000073 * t4;
    return mean + [...periodic, ...planetary].reduce((sum, [coefficient, angle]) =>
      sum + coefficient * Math.sin(angle * radians), 0);
  }

  // Espenak/Meeus polynomial expressions for TT−UT. UT is used as a UTC approximation.
  function deltaT(year){
    const polynomials = [
      [1900, 1900, [-2.79, 1.494119, -0.0598939, 0.0061966, -0.000197]],
      [1920, 1920, [21.20, 0.84493, -0.076100, 0.0020936]],
      [1941, 1950, [29.07, 0.407, -1 / 233, 1 / 2547]],
      [1961, 1975, [45.45, 1.067, -1 / 260, -1 / 718]],
      [1986, 2000, [63.86, 0.3345, -0.060374, 0.0017275, 0.000651814, 0.00002373599]],
      [2005, 2000, [62.92, 0.32217, 0.005589]]
    ];
    if (year < 1900) {
      const t = year - 1860;
      return 7.62 + t * (0.5737 + t * (-0.251754 + t * (0.01680668 + t * (-0.0004473624 + t / 233174))));
    }
    if (year >= 2050) {
      const centuries = (year - 1820) / 100;
      return -20 + 32 * centuries * centuries - 0.5628 * Math.max(0, 2150 - year);
    }
    const [, epoch, coefficients] = polynomials.findLast(([start]) => year >= start);
    return coefficients.reduceRight((value, term) => value * (year - epoch) + term, 0);
  }

  /** Calculates the next geocentric full Moon using periodic phase corrections.
   * @param {Date} fromDate Starting instant, left unmodified.
   * @returns {Date} Estimated UTC instant strictly after the starting instant.
   */
  function nextFullMoon(fromDate){
    const timestamp = fromDate.getTime();
    if (!Number.isFinite(timestamp)) {
      return new Date(NaN);
    }
    const currentJulianDay = timestamp / dayMs + unixJulianDay;
    let k = Math.floor((currentJulianDay - phaseEpoch) / synodic - 0.5) + 0.5;
    // In the dashboard's date range the periodic terms shift a phase by less
    // than a day, so one candidate on either side of the mean is sufficient.
    for (let candidate = 0; candidate < 3; candidate += 1) {
      const dynamicalTime = (fullMoonDynamicalJulianDay(k) - unixJulianDay) * dayMs;
      const date = new Date(dynamicalTime);
      const year = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12;
      const result = new Date(dynamicalTime - deltaT(year) * 1000);
      if (result.getTime() > timestamp) {
        return result;
      }
      k += 1;
    }
    return new Date(NaN);
  }

  /** Creates lunar observation calculations with explicit astronomy and calendar dependencies.
   * @param {object} options Coordinates, eclipse/location/date models, curated phases,
   * longitude/solar-coordinate providers and visibility lookup.
   * @returns {{moonDirection:Function,previewDirection:Function,referenceDate:Function,isEclipseDay:Function,upcomingPreview:Function}} Shared observation model.
   */
  function createObserver(options){
    /**
     * Returns approximate equatorial coordinates for the Moon.
     * The Moon longitude follows the existing phase-based dashboard model, while
     * the latitude follows the draconic node cycle so eclipse previews can show
     * a plausible sky direction without claiming observatory precision.
     * @param {Date} date Instant to evaluate.
     * @returns {{rightAscensionDeg:number, declinationDeg:number}} Approximate lunar coordinates.
     */
    function moonEquatorialCoordinates(date){
      const eclipticLongitude = options.getLongitude(date);
      const nodeState = options.eclipse.moonNodeDistance(date);
      const eclipticLatitude = 5.145 * Math.sin(nodeState.phase * Math.PI * 2);
      return options.coordinates.eclipticToEquatorial(eclipticLongitude, eclipticLatitude, date);
    }

    /**
     * Finds the next curated local eclipse preview within ten calendar days.
     * @param {Date} date Currently selected dashboard date.
     * @param {object} location Selected location object.
     * @returns {object|null} Preview payload or null when no nearby local event applies.
     */
    function upcomingPreview(date, location){
      if (!date || !location || !Number.isFinite(date.getTime())) {
        return null;
      }
      let bestPreview = null;
      let index = 0;

      while (index < options.phases.length) {
        const phaseEntry = options.phases[index];
        const eventDate = options.dateTime.parseLocalDateKey(phaseEntry.date);
        if (eventDate) {
          const daysUntil = options.dateTime.calendarDayDifference(date, eventDate);
          if (daysUntil >= 0 && daysUntil <= 10) {
            const visibility = options.getVisibility(eventDate, location);
            if (visibility && options.eclipseLocation.eclipseVisibilityIsPreviewable(visibility.status)) {
              const phases = options.eclipseLocation.eclipsePhasesForLocationProfile(phaseEntry, location);
              if (phases.length) {
                if (!bestPreview || daysUntil < bestPreview.daysUntil) {
                  bestPreview = {
                    phaseEntry,
                    eventDate,
                    daysUntil,
                    visibility,
                    phases
                  };
                }
              }
            }
          }
        }
        index += 1;
      }

      return bestPreview;
    }

    /**
     * Returns the reference timestamp for the Moon direction display.
     * On normal days the Moon card follows the currently selected date and time.
     * On a local eclipse day the card switches to the most meaningful eclipse
     * phase time so the Moon direction matches the eclipse preview wording.
     * @param {Date} date Currently selected dashboard date.
     * @param {object} location Selected location object.
     * @returns {Date} Reference timestamp for the local Moon direction display.
     */
    function referenceDate(date, location){
      if (!date || !location) {
        return date;
      }

      const preview = upcomingPreview(date, location);
      if (!preview || !preview.eventDate) {
        return date;
      }

      if (options.dateTime.formatDateKey(preview.eventDate) !== options.dateTime.formatDateKey(date)) {
        return date;
      }

      let bestPhaseDate = null;
      let index = 0;
      while (index < preview.phases.length) {
        const phase = preview.phases[index];
        if (phase.kind === 'maximum' && phase.time) {
          bestPhaseDate = options.eclipseLocation.eclipsePhaseLocalDate(preview.eventDate, location, phase.time);
          break;
        }
        index += 1;
      }

      if (bestPhaseDate) {
        return bestPhaseDate;
      }

      index = 0;
      while (index < preview.phases.length) {
        const phase = preview.phases[index];
        if (phase.time) {
          bestPhaseDate = options.eclipseLocation.eclipsePhaseLocalDate(preview.eventDate, location, phase.time);
          if (bestPhaseDate) {
            return bestPhaseDate;
          }
        }
        index += 1;
      }

      return date;
    }

    /** Computes raw Moon horizon coordinates without rendering or language data.
     * @param {Date} date Observation instant. @param {object} location Selected city.
     * @returns {object|null} Geometric azimuth/altitude, or null for invalid input.
     */
    function moonDirection(date, location){
      if (!date || !Number.isFinite(date.getTime()) || !location) {
        return null;
      }
      return options.coordinates.horizontalCoordinates(date, location, moonEquatorialCoordinates(date));
    }

    /** Computes the Sun/Moon horizon coordinates for an eclipse preview row.
     * @param {object} preview Curated preview. @param {object} location Selected city.
     * @param {object} row Normalized phase row. @returns {object|null} Raw direction or null.
     */
    function previewDirection(preview, location, row){
      if (!preview || !preview.phaseEntry || !location || !row || !row.time) {
        return null;
      }
      const phaseDate = options.eclipseLocation.eclipsePhaseLocalDate(preview.eventDate, location, row.time);
      if (!phaseDate) {
        return null;
      }
      let equatorial;
      if (preview.phaseEntry.kind === 'solar' || row.kind === 'sunset') {
        equatorial = options.solarCoordinates(phaseDate);
      } else {
        equatorial = moonEquatorialCoordinates(phaseDate);
      }
      return options.coordinates.horizontalCoordinates(phaseDate, location, equatorial);
    }

    /** Determines whether the curated preview belongs to the selected day.
     * @param {Date} date Selected instant. @param {object} location Selected city.
     * @returns {boolean} True when both dates identify the same calendar day.
     */
    function isEclipseDay(date, location){
      if (!date || !location || !Number.isFinite(date.getTime())) {
        return false;
      }
      const preview = upcomingPreview(date, location);
      return Boolean(preview && preview.eventDate && options.dateTime.formatDateKey(preview.eventDate) === options.dateTime.formatDateKey(date));
    }

    return {moonDirection,previewDirection,referenceDate,isEclipseDay,upcomingPreview};
  }

  return {computeMoon, nextFullMoon, createObserver};
})();
