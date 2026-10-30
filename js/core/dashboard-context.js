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
   * @param {string} href Current URL. @param {object} selection Date, local time, location and language.
   * @param {string} card Requested card key. @returns {string} Relative URL preserving other parameters and hash.
   */
  function selectionUrl(href, selection, card){
    const url = new URL(href);
    const timeZone = window.PLANETENUHR_DATE_TIME.locationTimeZoneId(selection.location);
    url.searchParams.set('date', window.PLANETENUHR_DATE_TIME.formatDateKey(selection.date, timeZone).replace(/-/g, ''));
    const time = window.PLANETENUHR_DATE_TIME.timePartsInZone(selection.date, timeZone);
    const hour = String(time.hour).padStart(2, '0');
    const minute = String(time.minute).padStart(2, '0');
    url.searchParams.set('time', hour + minute);
    for (const [key, value] of [['place',selection.location && selection.location.name],['lang',selection.language],['card',card]]) {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }
    return url.pathname + url.search + url.hash;
  }

  /** Creates the owner of the global day offset, local clock time and selected city.
   * @param {object} options Locations, getLanguage and optional now clock.
   * @returns {object} Selection accessors, snapshot scope and initial URL reader.
   */
  function create(options){
    let dayOffset = 0;
    let locationKey = 'berlin';
    let timeOfDayMinutes = null;
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
      const currentDate = new Date(now());
      if (dayOffset === 0 && timeOfDayMinutes === null) {
        return currentDate;
      }
      const timeZone = window.PLANETENUHR_DATE_TIME.locationTimeZoneId(getLocation());
      const currentDateParts = window.PLANETENUHR_DATE_TIME.datePartsInZone(currentDate, timeZone);
      const shiftedLocalDate = new Date(Date.UTC(
        Number(currentDateParts.year),
        Number(currentDateParts.month) - 1,
        Number(currentDateParts.day) + dayOffset
      ));
      const targetDateParts = {
        year:shiftedLocalDate.getUTCFullYear(),
        month:shiftedLocalDate.getUTCMonth() + 1,
        day:shiftedLocalDate.getUTCDate()
      };
      const currentTimeParts = window.PLANETENUHR_DATE_TIME.timePartsInZone(currentDate, timeZone);
      let selectedMinutes = timeOfDayMinutes;
      if (selectedMinutes === null) {
        selectedMinutes = currentTimeParts.hour * 60 + currentTimeParts.minute;
      }
      let selectedDate = window.PLANETENUHR_DATE_TIME.dateAtCalendarTimeInZone(
        targetDateParts.year,
        targetDateParts.month,
        targetDateParts.day,
        selectedMinutes,
        timeZone
      );
      if (timeOfDayMinutes === null) {
        const subMinutePart = currentTimeParts.second * 1000 + currentDate.getUTCMilliseconds();
        selectedDate = new Date(selectedDate.getTime() + subMinutePart);
      }
      return selectedDate;
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

    /** Reads the selected local clock time in minutes after midnight.
     * @returns {number} Selected time from 0 through 1439.
     */
    function getTimeOfDayMinutes(){
      const timeZone = window.PLANETENUHR_DATE_TIME.locationTimeZoneId(getLocation());
      const parts = window.PLANETENUHR_DATE_TIME.timePartsInZone(getDate(), timeZone);
      return parts.hour * 60 + parts.minute;
    }

    /** Selects a local clock time while keeping the selected calendar date.
     * @param {number} value Minutes after local midnight; clamped to one day.
     * @returns {void} No value.
     */
    function setTimeOfDayMinutes(value){
      timeOfDayMinutes = Math.round(Number(value));
      if (!Number.isFinite(timeOfDayMinutes)) {
        timeOfDayMinutes = 0;
      }
      timeOfDayMinutes = Math.max(0, Math.min(1439, timeOfDayMinutes));
    }

    /** Advances the shared instant by elapsed minutes and records any local date rollover.
     * @param {number} minutes Elapsed minutes to add to the selected instant.
     * @returns {{dayOffset:number, timeOfDayMinutes:number, dateChanged:boolean}} Updated selection state.
     */
    function advanceTimeByMinutes(minutes){
      const timeZone = window.PLANETENUHR_DATE_TIME.locationTimeZoneId(getLocation());
      const currentDate = getDate();
      const nextDate = new Date(currentDate.getTime() + Number(minutes) * 60000);
      const daysChanged = window.PLANETENUHR_DATE_TIME.calendarDayDifferenceInZone(currentDate, nextDate, timeZone);
      dayOffset += daysChanged;
      const nextTime = window.PLANETENUHR_DATE_TIME.timePartsInZone(nextDate, timeZone);
      timeOfDayMinutes = nextTime.hour * 60 + nextTime.minute;
      return {dayOffset, timeOfDayMinutes, dateChanged:daysChanged !== 0};
    }

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
      const requestedLocation = locationFromParameter(params.get('place'), options.locations);
      if (requestedLocation) {
        locationKey = requestedLocation.key;
      }
      const requestedDate = parseDateParameter(params.get('date'));
      if (requestedDate) {
        const timeZone = window.PLANETENUHR_DATE_TIME.locationTimeZoneId(getLocation());
        const requestedLocalDate = window.PLANETENUHR_DATE_TIME.dateAtCalendarTimeInZone(
          requestedDate.getFullYear(), requestedDate.getMonth() + 1, requestedDate.getDate(), 720, timeZone
        );
        dayOffset = window.PLANETENUHR_DATE_TIME.calendarDayDifferenceInZone(
          new Date(now()), requestedLocalDate, timeZone
        );
      }
      const requestedTime = String(params.get('time') || '').match(/^(\d{2}):?(\d{2})$/);
      if (requestedTime) {
        const hour = Number(requestedTime[1]);
        const minute = Number(requestedTime[2]);
        if (hour < 24 && minute < 60) {
          timeOfDayMinutes = hour * 60 + minute;
        }
      }
    }

    return {getDate, getLocation, getDayOffset, setDayOffset, getTimeOfDayMinutes, setTimeOfDayMinutes,
      advanceTimeByMinutes, getLocationKey, setLocationKey, snapshot, withSnapshot, applyUrl};
  }

  return {create, normalizeLocationToken, parseDateParameter, locationFromParameter, selectionUrl};
})();
