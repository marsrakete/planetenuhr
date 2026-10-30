(function(){
    /** Returns numeric calendar components in the requested time zone.
     * @param {Date} d Instant to format.
     * @param {string} [timeZone] IANA zone or browser default.
     * @returns {object} Year, month and day strings.
     */
    function datePartsInZone(d, timeZone){
      const parts = new Intl.DateTimeFormat('en-CA', {
        year:'numeric',
        month:'2-digit',
        day:'2-digit',
        timeZone
      }).formatToParts(d);
      return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    }

    /** Formats a visible date in the requested language and time zone.
     * @param {Date} d Instant to format.
     * @param {string} [timeZone] IANA zone or browser default.
     * @param {string} lang Language identifier.
     * @returns {string} Localized numeric date.
     */
    function formatDateStamp(d, timeZone, lang){
      return new Intl.DateTimeFormat(lang, {
        year:'numeric', month:'2-digit', day:'2-digit', timeZone
      }).format(d);
    }

    /** Returns a stable calendar key in the requested time zone.
     * @param {Date} d Instant to format.
     * @param {string} [timeZone] IANA zone or browser default.
     * @returns {string} Date as YYYY-MM-DD.
     */
    function formatDateKey(d, timeZone){
      const parts = datePartsInZone(d, timeZone);
      return parts.year + '-' + parts.month + '-' + parts.day;
    }

    /** Parses an ISO calendar key into a local midday date without rollover.
     * @param {string} dateKey Date in YYYY-MM-DD form.
     * @returns {Date|null} Local midday date, or null when the key is invalid.
     */
    function parseLocalDateKey(dateKey){
      if (!dateKey || typeof dateKey !== 'string') {
        return null;
      }
      const parts = dateKey.split('-');
      if (parts.length !== 3) {
        return null;
      }
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
        return null;
      }
      const date = new Date(year, month - 1, day, 12, 0, 0, 0);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
      }
      return date;
    }

    /** Returns the whole local-calendar-day distance between two dates.
     * @param {Date} fromDate Start date.
     * @param {Date} toDate Target date.
     * @returns {number} Integer day count; positive when target is later.
     */
    function calendarDayDifference(fromDate, toDate){
      const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
      const target = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
      return Math.round((target.getTime() - start.getTime()) / 86400000);
    }

    /** Selects the existing representative time zone for a configured city.
     * @param {object} location Configured city.
     * @returns {string} IANA time zone.
     */
    function locationTimeZoneId(location){
      if (!location || !location.key) {
        return 'Europe/Berlin';
      }

      if ([
        'berlin', 'hamburg', 'munich', 'cologne', 'frankfurt',
        'stuttgart', 'dusseldorf', 'dortmund', 'essen', 'leipzig',
        'zurich', 'vienna', 'prague', 'warsaw', 'copenhagen',
        'oslo', 'stockholm', 'rome', 'gibraltar'
      ].includes(location.key)) {
        return 'Europe/Berlin';
      }
      if (['paris', 'bordeaux', 'grenoble', 'marseille', 'brussels', 'amsterdam'].includes(location.key)) {
        return 'Europe/Paris';
      }
      if (['london'].includes(location.key)) {
        return 'Europe/London';
      }
      if (['dublin'].includes(location.key)) {
        return 'Europe/Dublin';
      }
      if (['lisbon'].includes(location.key)) {
        return 'Europe/Lisbon';
      }
      if (['reykjavik'].includes(location.key)) {
        return 'Atlantic/Reykjavik';
      }
      if (['madrid', 'barcelona', 'bilbao', 'cadiz', 'malaga'].includes(location.key)) {
        return 'Europe/Madrid';
      }
      if (['helsinki'].includes(location.key)) {
        return 'Europe/Helsinki';
      }
      if (['athens'].includes(location.key)) {
        return 'Europe/Athens';
      }
      if (['istanbul'].includes(location.key)) {
        return 'Europe/Istanbul';
      }
      if (['casablanca'].includes(location.key)) {
        return 'Africa/Casablanca';
      }
      if (['cairo'].includes(location.key)) {
        return 'Africa/Cairo';
      }
      if (['jerusalem'].includes(location.key)) {
        return 'Asia/Jerusalem';
      }
      if (['dubai'].includes(location.key)) {
        return 'Asia/Dubai';
      }
      if (['delhi'].includes(location.key)) {
        return 'Asia/Kolkata';
      }
      if (['bangkok'].includes(location.key)) {
        return 'Asia/Bangkok';
      }
      if (['singapore'].includes(location.key)) {
        return 'Asia/Singapore';
      }
      if (['jakarta'].includes(location.key)) {
        return 'Asia/Jakarta';
      }
      if (['hong_kong'].includes(location.key)) {
        return 'Asia/Hong_Kong';
      }
      if (['shanghai', 'beijing'].includes(location.key)) {
        return 'Asia/Shanghai';
      }
      if (['seoul'].includes(location.key)) {
        return 'Asia/Seoul';
      }
      if (['tokyo'].includes(location.key)) {
        return 'Asia/Tokyo';
      }
      if (['new_york', 'toronto'].includes(location.key)) {
        return 'America/Toronto';
      }
      if (['los_angeles', 'vancouver'].includes(location.key)) {
        return 'America/Vancouver';
      }
      if (['mexico_city'].includes(location.key)) {
        return 'America/Mexico_City';
      }
      if (['rio'].includes(location.key)) {
        return 'America/Sao_Paulo';
      }
      if (['buenos_aires'].includes(location.key)) {
        return 'America/Argentina/Buenos_Aires';
      }
      if (['santiago'].includes(location.key)) {
        return 'America/Santiago';
      }
      if (['nairobi'].includes(location.key)) {
        return 'Africa/Nairobi';
      }
      if (['cape_town'].includes(location.key)) {
        return 'Africa/Johannesburg';
      }
      if (['sydney'].includes(location.key)) {
        return 'Australia/Sydney';
      }
      if (['melbourne'].includes(location.key)) {
        return 'Australia/Melbourne';
      }
      if (['auckland'].includes(location.key)) {
        return 'Pacific/Auckland';
      }

      return 'Europe/Berlin';
    }

    /** Parses an Intl offset label.
     * @param {string} offsetText GMT or UTC offset label.
     * @returns {number} Minutes east of UTC.
     */
    function parseTimeZoneOffsetMinutes(offsetText){
      if (!offsetText) {
        return 0;
      }
      const normalized = String(offsetText).replace('UTC', 'GMT');
      if (normalized === 'GMT') {
        return 0;
      }
      const match = normalized.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
      if (!match) {
        return 0;
      }
      let sign = 1;
      if (match[1] === '-') {
        sign = -1;
      }
      const hourValue = Number(match[2] || 0);
      const minuteValue = Number(match[3] || 0);
      return sign * (hourValue * 60 + minuteValue);
    }

    /** Finds a time-zone offset at an instant, including daylight saving.
     * @param {Date} date Instant to evaluate.
     * @param {string} timeZoneId IANA time zone.
     * @returns {number} Minutes east of UTC.
     */
    function timeZoneOffsetMinutesAt(date, timeZoneId){
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        timeZoneName:'shortOffset',
        hour:'2-digit',
        minute:'2-digit'
      });
      const parts = formatter.formatToParts(date);
      let index = 0;
      while (index < parts.length) {
        if (parts[index].type === 'timeZoneName') {
          return parseTimeZoneOffsetMinutes(parts[index].value);
        }
        index += 1;
      }
      return 0;
    }

    /** Reads hour, minute and second fields as shown by a selected location's clock.
     * @param {Date} date Absolute instant to read.
     * @param {string} timeZoneId IANA time zone for the observation location.
     * @returns {{hour:number, minute:number, second:number}} Local clock fields.
     */
    function timePartsInZone(date, timeZoneId){
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone:timeZoneId,
        hour:'2-digit',
        minute:'2-digit',
        second:'2-digit',
        hourCycle:'h23'
      }).formatToParts(date);
      const values = {};
      for (const part of parts) {
        if (part.type !== 'literal') {
          values[part.type] = part.value;
        }
      }
      return {
        hour:Number(values.hour),
        minute:Number(values.minute),
        second:Number(values.second)
      };
    }

    /** Places a local clock time on the local calendar date containing an instant.
     * @param {Date} date Instant whose local calendar date should be retained.
     * @param {number} minuteOfDay Minutes after local midnight, from 0 to 1439.
     * @param {string} timeZoneId IANA time zone for the observation location.
     * @returns {Date} Instant matching the requested local date and clock time.
     */
    function dateAtTimeInZone(date, minuteOfDay, timeZoneId){
      const dateParts = datePartsInZone(date, timeZoneId);
      return dateAtCalendarTimeInZone(
        Number(dateParts.year), Number(dateParts.month), Number(dateParts.day), minuteOfDay, timeZoneId
      );
    }

    /** Builds an instant from explicit local calendar and clock fields in a time zone.
     * @param {number} year Local calendar year.
     * @param {number} month Local calendar month from 1 through 12.
     * @param {number} day Local calendar day of month.
     * @param {number} minuteOfDay Minutes after local midnight, from 0 to 1439.
     * @param {string} timeZoneId IANA time zone for the observation location.
     * @returns {Date} Instant matching the requested local date and clock time.
     */
    function dateAtCalendarTimeInZone(year, month, day, minuteOfDay, timeZoneId){
      const hour = Math.floor(minuteOfDay / 60);
      const minute = minuteOfDay % 60;
      const wallClockAsUtc = Date.UTC(
        year, month - 1, day, hour, minute
      );
      const firstGuess = new Date(wallClockAsUtc);
      const firstOffset = timeZoneOffsetMinutesAt(firstGuess, timeZoneId);
      let instant = new Date(wallClockAsUtc - firstOffset * 60000);
      const correctedOffset = timeZoneOffsetMinutesAt(instant, timeZoneId);
      if (correctedOffset !== firstOffset) {
        instant = new Date(wallClockAsUtc - correctedOffset * 60000);
      }
      return instant;
    }

    /** Counts calendar-day boundaries between two instants in one IANA time zone.
     * @param {Date} fromDate Starting instant.
     * @param {Date} toDate Ending instant.
     * @param {string} timeZoneId IANA time zone used for both calendar dates.
     * @returns {number} Signed number of local midnight boundaries crossed.
     */
    function calendarDayDifferenceInZone(fromDate, toDate, timeZoneId){
      const fromParts = datePartsInZone(fromDate, timeZoneId);
      const toParts = datePartsInZone(toDate, timeZoneId);
      const fromDay = Date.UTC(Number(fromParts.year), Number(fromParts.month) - 1, Number(fromParts.day));
      const toDay = Date.UTC(Number(toParts.year), Number(toParts.month) - 1, Number(toParts.day));
      return Math.round((toDay - fromDay) / 86400000);
    }

    window.PLANETENUHR_DATE_TIME = {
      datePartsInZone, formatDateStamp, formatDateKey, parseLocalDateKey, calendarDayDifference,
      locationTimeZoneId, parseTimeZoneOffsetMinutes, timeZoneOffsetMinutesAt,
      timePartsInZone, dateAtTimeInZone, dateAtCalendarTimeInZone, calendarDayDifferenceInZone
    };
})();
