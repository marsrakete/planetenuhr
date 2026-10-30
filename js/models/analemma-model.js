window.PLANETENUHR_ANALEMMA_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free yearly aggregation using the existing solar-visibility approximations.
   * @param {object} options Existing solar-visibility functions plus daysInYear(year) and dayOfYearLocal(Date) helpers.
   * @returns {object} Model or render operations; starts no timers or listeners.
   */
  function create(options){
    const daysInYear = options.daysInYear;
    const dayOfYearLocal = options.dayOfYearLocal;
    const approximateSolarNoonOffsetMinutes = options.solarVisibility.approximateSolarNoonOffsetMinutes;
    const approximateNoonAltitudeDegrees = options.solarVisibility.approximateNoonAltitudeDegrees;

    /** Samples the existing noon-offset and altitude approximations for every day in the selected local calendar year.
     * @param {Date} date Explicit reference instant for year and selected-day index.
     * @param {object} location Geographic latitude and longitude.
     * @returns {object} Annual samples, bounds and selected sample; preserves the existing local-day/DST convention.
     */
    function sampleYear(date, location){
      const year = date.getFullYear();
      const totalDays = daysInYear(year);
      const samples = [];
      let maxOffset = 0;
      let minAltitude = 90;
      let maxAltitude = -90;

      for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
        const sampleDate = new Date(year, 0, dayIndex + 1);
        const offsetMinutes = approximateSolarNoonOffsetMinutes(sampleDate, location);
        const altitudeDegrees = approximateNoonAltitudeDegrees(sampleDate, location);
        samples.push({
          date: sampleDate,
          offsetMinutes,
          altitudeDegrees
        });
        maxOffset = Math.max(maxOffset, Math.abs(offsetMinutes));
        minAltitude = Math.min(minAltitude, altitudeDegrees);
        maxAltitude = Math.max(maxAltitude, altitudeDegrees);
      }

      const selectedDayIndex = Math.min(totalDays - 1, Math.max(0, dayOfYearLocal(date) - 1));
      const selectedSample = samples[selectedDayIndex];
      return {year,totalDays,samples,maxOffset,minAltitude,maxAltitude,selectedSample};
    }

    return {sampleYear};
  }
  return {create};
})();
