window.PLANETENUHR_IDEFIX_MODEL = (() => {
  'use strict';

  /**
   * Interpolates a heliocentric JPL position without extrapolating beyond the provided samples.
   * @param {number[][]} rows Sorted rows [UTC Unix ms, xAU, yAU, zAU].
   * @param {Date} date Requested UTC instant.
   * @returns {{x:number,y:number,z:number}|null} Linear interpolation in AU, or null outside coverage.
   */
  function positionAt(rows, date){
    const timestamp = date.getTime();
    if (!rows.length || !Number.isFinite(timestamp) || timestamp < rows[0][0] || timestamp > rows[rows.length - 1][0]) {
      return null;
    }
    let lower = 0;
    let upper = rows.length - 1;
    while (upper - lower > 1) {
      const middle = Math.floor((lower + upper) / 2);
      if (rows[middle][0] <= timestamp) {
        lower = middle;
      } else {
        upper = middle;
      }
    }
    const first = rows[lower];
    const last = rows[upper];
    let fraction = 0;
    if (last[0] !== first[0]) {
      fraction = (timestamp - first[0]) / (last[0] - first[0]);
    }
    return {
      x:first[1] + fraction * (last[1] - first[1]),
      y:first[2] + fraction * (last[2] - first[2]),
      z:first[3] + fraction * (last[3] - first[3])
    };
  }

  /**
   * Classifies the displayed time into planned mission phases; it never confirms future events.
   * @param {Date} date Time selected for the visualization.
   * @param {object} config Curated mission milestones.
   * @returns {string} Translation phase key suffix.
   */
  function phaseAt(date, config){
    const timestamp = date.getTime();
    if (timestamp < Date.parse(config.launch)) {
      return 'prelaunch';
    }
    if (timestamp < Date.parse(config.marsArrivalWindow.start)) {
      return 'cruise';
    }
    if (timestamp <= Date.parse(config.marsArrivalWindow.end)) {
      return 'arrival';
    }
    if (timestamp < Date.parse(config.roverLandingWindow.start)) {
      return 'survey';
    }
    if (timestamp <= Date.parse(config.roverLandingWindow.end)) {
      return 'landing';
    }
    return 'surface';
  }

  /**
   * Computes an illustrative Phobos angle using its mean sidereal period; zero phase is arbitrary.
   * @param {Date} date Selected instant.
   * @param {object} config phobosPeriodDays and phobosPhaseEpoch.
   * @returns {number} Angle in radians in [0, 2π).
   */
  function phobosAngle(date, config){
    const turns = (date.getTime() - Date.parse(config.phobosPhaseEpoch)) / (config.phobosPeriodDays * 86400000);
    return ((turns % 1 + 1) % 1) * 2 * Math.PI;
  }

  /**
   * Projects heliocentric ecliptic x/y in AU to the common SVG overview.
   * @param {{x:number,y:number}} vector Heliocentric vector in AU.
   * @returns {{x:number,y:number}} SVG coordinates; z is intentionally not displayed.
   */
  function project(vector){
    return {x:310 + vector.x * 94, y:180 - vector.y * 94};
  }

  /**
   * Shifts a date in UTC by calendar days, months or years and clamps end-of-month overflow.
   * @param {Date} date Original date.
   * @param {string} unit day, month or year.
   * @param {number} amount Signed number of units.
   * @returns {Date} Shifted date; original remains unchanged.
   */
  function shiftDate(date, unit, amount){
    const shifted = new Date(date.getTime());
    if (unit === 'day') {
      shifted.setUTCDate(shifted.getUTCDate() + amount);
      return shifted;
    }
    const day = shifted.getUTCDate();
    shifted.setUTCDate(1);
    if (unit === 'month') {
      shifted.setUTCMonth(shifted.getUTCMonth() + amount);
    } else if (unit === 'year') {
      shifted.setUTCFullYear(shifted.getUTCFullYear() + amount);
    }
    const endOfMonth = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0)).getUTCDate();
    shifted.setUTCDate(Math.min(day, endOfMonth));
    return shifted;
  }

  return {positionAt, phaseAt, phobosAngle, project, shiftDate};
})();
