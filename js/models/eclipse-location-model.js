window.PLANETENUHR_ECLIPSE_LOCATION = (() => {
  'use strict';
  const {locationTimeZoneId, timeZoneOffsetMinutesAt} = window.PLANETENUHR_DATE_TIME;

  /** Finds the first curated record matching a stable calendar key.
   * @param {string} dateKey Calendar key in YYYY-MM-DD format.
   * @param {object[]} entries Explicit configured records.
   * @returns {object|null} Matching record or null.
   */
  function entryForDateKey(dateKey, entries){
    let index = 0;
    while (index < entries.length) {
      const entry = entries[index];
      if (entry && entry.date === dateKey) {
        return entry;
      }
      index += 1;
    }
    return null;
  }

  /**
   * Normalizes a region keyword for coarse visibility matching.
   * @param {string} value Raw region text.
   * @returns {string} Lowercase normalized token without punctuation.
   */
  function normalizeEclipseRegionToken(value){
    if (!value) {
      return '';
    }
    return String(value)
      .toLowerCase()
      .replace(/[.,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Returns coarse region tags for the selected city.
   * These tags intentionally stay broad because stage 1 only distinguishes
   * large visibility regions such as Europe, North America or Asia.
   * @param {object} location Selected location object.
   * @returns {Array<string>} Normalized region tags.
   */
  function locationEclipseRegionTags(location){
    const tags = [];
    if (!location || !location.key) {
      return tags;
    }

    if ([
      'berlin', 'hamburg', 'munich', 'cologne', 'frankfurt', 'stuttgart',
      'dusseldorf', 'dortmund', 'essen', 'leipzig', 'reykjavik', 'dublin',
      'london', 'amsterdam', 'brussels', 'paris', 'zurich', 'vienna',
      'prague', 'warsaw', 'copenhagen', 'oslo', 'stockholm', 'helsinki',
      'lisbon', 'madrid', 'barcelona', 'bilbao', 'bordeaux', 'grenoble', 'cadiz', 'malaga',
      'gibraltar', 'marseille', 'rome', 'athens'
    ].includes(location.key)) {
      tags.push('europe');
    }

    if (['reykjavik', 'oslo', 'stockholm', 'helsinki'].includes(location.key)) {
      tags.push('arctic');
    }

    if (['istanbul', 'jerusalem', 'dubai', 'cairo'].includes(location.key)) {
      tags.push('mid east');
    }

    if (['istanbul', 'jerusalem', 'dubai', 'delhi', 'bangkok', 'singapore', 'jakarta', 'hong_kong', 'shanghai', 'beijing', 'seoul', 'tokyo'].includes(location.key)) {
      tags.push('asia');
    }

    if (['casablanca', 'cairo', 'nairobi', 'cape_town'].includes(location.key)) {
      tags.push('africa');
    }

    if (['new_york', 'los_angeles', 'toronto', 'vancouver'].includes(location.key)) {
      tags.push('americas');
      tags.push('n america');
    }

    if (['mexico_city'].includes(location.key)) {
      tags.push('americas');
      tags.push('c america');
    }

    if (['rio', 'buenos_aires', 'santiago'].includes(location.key)) {
      tags.push('americas');
      tags.push('s america');
    }

    if (['sydney', 'melbourne'].includes(location.key)) {
      tags.push('australia');
    }

    if (['auckland'].includes(location.key)) {
      tags.push('pacific');
      tags.push('n z');
    }

    if (['jakarta', 'singapore'].includes(location.key)) {
      tags.push('e indies');
    }

    if (['tokyo', 'auckland', 'sydney', 'melbourne', 'honolulu'].includes(location.key)) {
      tags.push('pacific');
    }

    return tags;
  }

  /**
   * Checks whether the broad NASA visibility region includes the selected city.
   * @param {object} entry Shared eclipse calendar entry with a regions field.
   * @param {object} location Selected location object.
   * @returns {boolean} True when the city's coarse region tags match the event text.
   */
  function eclipseCalendarRegionMatchesLocation(entry, location){
    if (!entry || !entry.regions || !location) {
      return false;
    }
    const regionText = normalizeEclipseRegionToken(entry.regions);
    const tags = locationEclipseRegionTags(location);
    let index = 0;
    while (index < tags.length) {
      if (regionText.includes(tags[index])) {
        return true;
      }
      index += 1;
    }
    return false;
  }

  /**
   * Converts a shared eclipse calendar entry into a coarse local visibility class.
   * Solar eclipses default to "partial" when the selected city lies in the broad
   * NASA visibility region but no city-specific central-path override exists.
   * Lunar eclipses inherit their type directly from the event record.
   * @param {object} entry Shared eclipse calendar entry.
   * @param {object} location Selected location object.
   * @returns {string} Simplified local visibility status key.
   */
  function eclipseFallbackStatusForLocation(entry, location){
    if (!entry) {
      return 'unknown';
    }
    const regionMatches = eclipseCalendarRegionMatchesLocation(entry, location);
    if (!regionMatches) {
      return 'not_visible';
    }
    if (entry.kind === 'solar') {
      return 'partial';
    }
    if (entry.type === 'total') {
      return 'total';
    }
    if (entry.type === 'partial') {
      return 'partial';
    }
    return 'penumbral';
  }

  /**
   * Resolves the simplified local eclipse visibility for one configured city.
   * Stage 1 deliberately returns curated city classes such as "partial" or
   * "not_visible" instead of computing local circumstances from ephemerides.
   * @param {string} dateKey Stable YYYY-MM-DD calendar key.
   * @param {object[]} visibilityEntries Curated city visibility records.
   * @param {object[]} calendarEntries Shared eclipse calendar records.
   * @param {object} location Selected location object with at least a key.
   * @returns {object|null} Object with entry and status, or null when no event is configured.
   */
  function eclipseVisibilityForLocation(dateKey, location, visibilityEntries, calendarEntries){
    const entry = entryForDateKey(dateKey, visibilityEntries);
    if (entry && location) {
      let status = 'unknown';
      if (entry.defaultVisibility) {
        status = entry.defaultVisibility;
      }
      if (entry.cityVisibilityByKey && Object.prototype.hasOwnProperty.call(entry.cityVisibilityByKey, location.key)) {
        status = entry.cityVisibilityByKey[location.key];
      }
      return {
        entry,
        status,
        source: 'manual'
      };
    }

    if (!location) {
      return null;
    }

    const calendarEntry = entryForDateKey(dateKey, calendarEntries);
    if (!calendarEntry) {
      return null;
    }

    const status = eclipseFallbackStatusForLocation(calendarEntry, location);
    return {
      entry: calendarEntry,
      status,
      source: 'fallback'
    };
  }

  /**
   * Checks whether the simplified local visibility means the eclipse is worth
   * previewing for the selected city.
   * @param {string} statusKey Simplified local visibility status.
   * @returns {boolean} True when the event should get a local timeline preview.
   */
  function eclipseVisibilityIsPreviewable(statusKey){
    if (statusKey === 'total') {
      return true;
    }
    if (statusKey === 'annular') {
      return true;
    }
    if (statusKey === 'hybrid') {
      return true;
    }
    if (statusKey === 'partial') {
      return true;
    }
    if (statusKey === 'partial_low') {
      return true;
    }
    if (statusKey === 'penumbral') {
      return true;
    }
    return false;
  }

  /**
   * Chooses one coarse local timing profile for the selected city.
   * Stage 1 keeps this deliberately broad and event-based instead of trying to
   * simulate exact local contact times for every location.
   * @param {object} location Selected location object.
   * @returns {string} Timing-profile key.
   */
  function eclipseTimingProfileForLocation(location){
    if (!location || !location.key) {
      return 'europe';
    }

    if ([
      'marseille', 'grenoble', 'barcelona', 'rome', 'athens', 'istanbul',
      'cadiz', 'malaga', 'gibraltar'
    ].includes(location.key)) {
      return 'mediterranean_europe';
    }

    if ([
      'berlin', 'hamburg', 'munich', 'cologne', 'frankfurt',
      'stuttgart', 'dusseldorf', 'dortmund', 'essen', 'leipzig',
      'zurich', 'vienna', 'prague', 'warsaw', 'copenhagen'
    ].includes(location.key)) {
      return 'central_europe';
    }

    if ([
      'bordeaux', 'bilbao', 'lisbon', 'madrid', 'paris',
      'brussels', 'london', 'dublin', 'amsterdam', 'reykjavik',
      'oslo', 'stockholm', 'helsinki'
    ].includes(location.key)) {
      return 'west_europe';
    }

    return 'europe';
  }

  /**
   * Resolves the configured phase list for one city and one curated eclipse.
   * @param {object} phaseEntry Curated phase-profile config entry.
   * @param {object} location Selected location object.
   * @returns {Array<object>} Matching phase list.
   */
  function eclipsePhasesForLocationProfile(phaseEntry, location){
    if (!phaseEntry || !phaseEntry.profiles) {
      return [];
    }

    const profileKey = eclipseTimingProfileForLocation(location);
    if (phaseEntry.profiles[profileKey]) {
      return phaseEntry.profiles[profileKey];
    }
    if (phaseEntry.profiles.europe) {
      return phaseEntry.profiles.europe;
    }
    const profileKeys = Object.keys(phaseEntry.profiles);
    if (profileKeys.length) {
      return phaseEntry.profiles[profileKeys[0]];
    }
    return [];
  }

  /**
   * Converts a `HH:mm` string into minutes since midnight.
   * @param {string} value Time string in `HH:mm` format.
   * @returns {number} Minutes since midnight, or `NaN` for invalid input.
   */
  function timeStringToMinutes(value){
    if (!value || typeof value !== 'string') {
      return Number.NaN;
    }
    const parts = value.split(':');
    if (parts.length !== 2) {
      return Number.NaN;
    }
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
      return Number.NaN;
    }
    return hour * 60 + minute;
  }

  /**
   * Converts a curated local phase time into an approximate UTC `Date`.
   * @param {Date} calendarDate Calendar day of the eclipse event.
   * @param {object} location Selected location object.
   * @param {string} timeText Curated local clock time in `HH:MM`.
   * @returns {Date|null} Approximate UTC timestamp for the city and clock time.
   */
  function eclipsePhaseLocalDate(calendarDate, location, timeText){
    const minutes = timeStringToMinutes(timeText);
    if (!Number.isFinite(minutes)) {
      return null;
    }
    const timeZoneId = locationTimeZoneId(location);
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const day = calendarDate.getDate();
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const roughUtc = new Date(Date.UTC(year, month, day, hour, minute, 0));
    const offsetMinutes = timeZoneOffsetMinutesAt(roughUtc, timeZoneId);
    return new Date(Date.UTC(year, month, day, hour, minute, 0) - offsetMinutes * 60000);
  }

  return { entryForDateKey, normalizeEclipseRegionToken, locationEclipseRegionTags, eclipseCalendarRegionMatchesLocation, eclipseFallbackStatusForLocation, eclipseVisibilityForLocation, eclipseVisibilityIsPreviewable, eclipseTimingProfileForLocation, eclipsePhasesForLocationProfile, timeStringToMinutes, eclipsePhaseLocalDate };
})();
