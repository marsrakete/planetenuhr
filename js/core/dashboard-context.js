window.PLANETENUHR_DASHBOARD_CONTEXT = (() => {
  'use strict';

  /** Normalizes a place name for the existing deep-link lookup.
   * @param {string} value Raw name or key. @returns {string} Comparison token.
   */
  function normalizeLocationToken(value){
    if (!value) {
      return '';
    }
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  /** Parses the existing eight-digit local calendar-date format.
   * @param {string} rawValue Date query parameter. @returns {Date|null} Local calendar date.
   */
  function parseDateParameter(rawValue){
    if (!rawValue) {
      return null;
    }
    const digits = String(rawValue).replace(/[^0-9]/g, '');
    if (!/^\d{8}$/.test(digits)) {
      return null;
    }
    const year = Number(digits.slice(0, 4));
    const month = Number(digits.slice(4, 6));
    const day = Number(digits.slice(6, 8));
    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
      return null;
    }
    return parsed;
  }

  /** Finds a configured city by normalized key or readable name.
   * @param {string} rawValue URL place value. @param {object[]} locations Configured cities.
   * @returns {object|null} Matching city.
   */
  function locationFromParameter(rawValue, locations){
    const normalized = normalizeLocationToken(rawValue);
    if (!normalized) {
      return null;
    }
    for (const location of locations) {
      if (normalizeLocationToken(location.key) === normalized || normalizeLocationToken(location.name) === normalized) {
        return location;
      }
    }
    return null;
  }

  /** Builds the current selection URL without navigation or localized date keys.
   * @param {string} href Current URL. @param {object} selection Date, location and language.
   * @param {string} card Requested card key. @returns {string} Relative URL preserving other parameters and hash.
   */
  function selectionUrl(href, selection, card){
    const url = new URL(href);
    url.searchParams.set('date', window.PLANETENUHR_DATE_TIME.formatDateKey(selection.date).replace(/-/g, ''));
    for (const [key, value] of [['place',selection.location && selection.location.name],['lang',selection.language],['card',card]]) {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }
    return url.pathname + url.search + url.hash;
  }

  /** Creates the owner of the global day offset and selected city.
   * @param {object} options Locations, getLanguage and optional now clock.
   * @returns {object} Selection accessors, snapshot scope and initial URL reader.
   */
  function create(options){
    let dayOffset = 0;
    let locationKey = 'berlin';
    let activeSnapshot = null;
    let now = Date.now;
    if (options.now) {
      now = options.now;
    }

    /** Reads the selected instant, pinned during a shared refresh.
     * @returns {Date} Selected instant. No parameters.
     */
    function getDate(){
      if (activeSnapshot) {
        return activeSnapshot.date;
      }
      return new Date(now() + dayOffset * 86400000);
    }

    /** Resolves the selected city with the existing first-city fallback.
     * @returns {object|undefined} Configured city. No parameters.
     */
    function getLocation(){
      if (activeSnapshot) {
        return activeSnapshot.location;
      }
      const match = options.locations.find(location => location.key === locationKey);
      if (match) {
        return match;
      }
      return options.locations[0];
    }

    /** Reads the offset relative to the running clock.
     * @returns {number} Day offset. No parameters.
     */
    function getDayOffset(){ return dayOffset; }

    /** Sets the day offset; controls retain responsibility for their bounds.
     * @param {number} value New offset. @returns {void}
     */
    function setDayOffset(value){ dayOffset = value; }

    /** Reads the configured city key.
     * @returns {string} City key. No parameters.
     */
    function getLocationKey(){ return locationKey; }

    /** Sets the city key; getLocation retains the existing fallback.
     * @param {string} value City key. @returns {void}
     */
    function setLocationKey(value){ locationKey = value; }

    /** Captures one shared update context for consumers.
     * @param {Date} [date=getDate()] Explicit instant for direct renders.
     * @returns {object} Date, location, location time zone and language.
     */
    function snapshot(date = getDate()){
      const location = getLocation();
      return {date, location, timeZone:window.PLANETENUHR_DATE_TIME.locationTimeZoneId(location), language:options.getLanguage()};
    }

    /** Pins legacy date/location accessors to one context while consumers render.
     * @param {object} selection Captured context. @param {Function} action Synchronous refresh.
     * @returns {*} Result of the action; the prior context is restored on error too.
     */
    function withSnapshot(selection, action){
      const previous = activeSnapshot;
      activeSnapshot = selection;
      try {
        return action();
      } finally {
        activeSnapshot = previous;
      }
    }

    /** Applies initial date and place parameters with the existing offset semantics.
     * @param {URLSearchParams} params Initial URL parameters. @returns {void}
     */
    function applyUrl(params){
      const requestedDate = parseDateParameter(params.get('date'));
      if (requestedDate) {
        const today = new Date(now());
        today.setHours(0, 0, 0, 0);
        dayOffset = Math.round((requestedDate.getTime() - today.getTime()) / 86400000);
      }
      const requestedLocation = locationFromParameter(params.get('place'), options.locations);
      if (requestedLocation) {
        locationKey = requestedLocation.key;
      }
    }

    return {getDate, getLocation, getDayOffset, setDayOffset, getLocationKey, setLocationKey, snapshot, withSnapshot, applyUrl};
  }

  return {create, normalizeLocationToken, parseDateParameter, locationFromParameter, selectionUrl};
})();
