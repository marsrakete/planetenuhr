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
