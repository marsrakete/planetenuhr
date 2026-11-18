window.PLANETENUHR_CONSTELLATION_VISIBILITY_MODEL = (() => {
  'use strict';

  /** Creates calculations for a constellation center at the selected location's evening reference time.
   * @param {object} dependencies Existing date-time and horizon coordinate utilities.
   * @param {object} dependencies.dateTime Location timezone and local-clock conversion methods.
   * @param {object} dependencies.coordinates Equatorial-to-horizontal astronomy conversion.
   * @returns {{referenceInstant:Function, calculateDirection:Function}} Pure calculation helpers.
   */
  function create(dependencies){
    /** Precesses an approximate J2000 equatorial direction to the mean equinox of the date.
     * @param {{rightAscensionDeg:number,declinationDeg:number}} equatorial J2000 coordinates.
     * @param {Date} date Observation instant.
     * @returns {{rightAscensionDeg:number,declinationDeg:number}} Approximate coordinates of date.
     */
    function precessJ2000ToDate(equatorial, date){
      const julianDate = dependencies.coordinates.julianDate(date);
      const centuries = (julianDate - 2451545) / 36525;
      const arcsecondsToRadians = Math.PI / (180 * 3600);
      const zeta = (2306.2181 * centuries + 0.30188 * centuries * centuries + 0.017998 * centuries * centuries * centuries) * arcsecondsToRadians;
      const z = (2306.2181 * centuries + 1.09468 * centuries * centuries + 0.018203 * centuries * centuries * centuries) * arcsecondsToRadians;
      const theta = (2004.3109 * centuries - 0.42665 * centuries * centuries - 0.041833 * centuries * centuries * centuries) * arcsecondsToRadians;
      const rightAscension = equatorial.rightAscensionDeg * Math.PI / 180;
      const declination = equatorial.declinationDeg * Math.PI / 180;
      const shiftedRightAscension = rightAscension + zeta;
      const sinDeclination = Math.sin(declination);
      const cosDeclination = Math.cos(declination);
      const x = cosDeclination * Math.sin(shiftedRightAscension);
      const y = Math.cos(theta) * cosDeclination * Math.cos(shiftedRightAscension) - Math.sin(theta) * sinDeclination;
      const zComponent = Math.sin(theta) * cosDeclination * Math.cos(shiftedRightAscension) + Math.cos(theta) * sinDeclination;
      let rightAscensionOfDate = Math.atan2(x, y) + z;
      rightAscensionOfDate = (rightAscensionOfDate % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      return {
        rightAscensionDeg:rightAscensionOfDate * 180 / Math.PI,
        declinationDeg:Math.asin(Math.max(-1, Math.min(1, zComponent))) * 180 / Math.PI
      };
    }

    /** Resolves 22:00 local standard time or 23:00 in daylight time on the selected local date.
     * @param {Date} selectedDate Instant carrying the date selected in the app.
     * @param {object} location Selected app location.
     * @returns {{date:Date,timeZone:string,hour:number}|null} Observation instant and clock metadata.
     */
    function referenceInstant(selectedDate, location){
      if (!(selectedDate instanceof Date) || !Number.isFinite(selectedDate.getTime()) || !location) {
        return null;
      }
      const timeZone = dependencies.dateTime.locationTimeZoneId(location);
      const localYear = Number(dependencies.dateTime.datePartsInZone(selectedDate, timeZone).year);
      const standardProbe = dependencies.dateTime.dateAtCalendarTimeInZone(localYear, 1, 15, 12 * 60, timeZone);
      const summerProbe = dependencies.dateTime.dateAtCalendarTimeInZone(localYear, 7, 15, 12 * 60, timeZone);
      const standardOffset = Math.min(
        dependencies.dateTime.timeZoneOffsetMinutesAt(standardProbe, timeZone),
        dependencies.dateTime.timeZoneOffsetMinutesAt(summerProbe, timeZone)
      );
      const selectedNoon = dependencies.dateTime.dateAtTimeInZone(selectedDate, 12 * 60, timeZone);
      const selectedOffset = dependencies.dateTime.timeZoneOffsetMinutesAt(selectedNoon, timeZone);
      let hour = 22;
      if (selectedOffset !== standardOffset) {
        hour = 23;
      }
      return {
        date:dependencies.dateTime.dateAtTimeInZone(selectedDate, hour * 60, timeZone),
        timeZone,
        hour
      };
    }

    /** Calculates the selected place's azimuth and altitude for a constellation's approximate center.
     * @param {Date} selectedDate Selected global app date.
     * @param {object} location Selected app location with latitude and longitude.
     * @param {object} constellation J2000 center with raHours and decDeg.
     * @returns {{azimuthDeg:number,altitudeDeg:number,date:Date,timeZone:string,hour:number}|null} Local direction or null for invalid input.
     */
    function calculateDirection(selectedDate, location, constellation){
      if (!constellation || !Number.isFinite(constellation.raHours) || !Number.isFinite(constellation.decDeg)) {
        return null;
      }
      const reference = referenceInstant(selectedDate, location);
      if (!reference) {
        return null;
      }
      const equatorial = precessJ2000ToDate({
        rightAscensionDeg:constellation.raHours * 15,
        declinationDeg:constellation.decDeg
      }, reference.date);
      const horizontal = dependencies.coordinates.horizontalCoordinates(reference.date, location, equatorial);
      return {
        azimuthDeg:horizontal.azimuthDeg,
        altitudeDeg:horizontal.altitudeDeg,
        date:reference.date,
        timeZone:reference.timeZone,
        hour:reference.hour
      };
    }

    return {referenceInstant, calculateDirection};
  }

  return {create};
})();
