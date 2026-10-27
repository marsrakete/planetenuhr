window.PLANETENUHR_CONJUNCTIONS = (() => {
  'use strict';

  /** Measures the full sky angle between two Earth-centered position vectors.
   * @param {object} a First vector {x,y,z} in any common length unit.
   * @param {object} b Second vector {x,y,z} in the same frame.
   * @returns {number} Angle in degrees, or NaN for missing or zero vectors.
   */
  function angularSeparation(a, b){
    if (!a || !b) return NaN;
    const norm = Math.hypot(a.x, a.y, a.z) * Math.hypot(b.x, b.y, b.z);
    if (!Number.isFinite(norm) || norm <= 0) return NaN;
    const cosine = (a.x * b.x + a.y * b.y + a.z * b.z) / norm;
    return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
  }

  /** Refines a daily local minimum within its surrounding two-day bracket.
   * @param {number} left Start time in Unix milliseconds.
   * @param {number} right End time in Unix milliseconds.
   * @param {Function} separationAt Function returning angular separation at a timestamp.
   * @returns {number} Estimated minimum time, refined to under one minute.
   */
  function refineMinimum(left, right, separationAt){
    const ratio = (Math.sqrt(5) - 1) / 2;
    let a = right - ratio * (right - left);
    let b = left + ratio * (right - left);
    let atA = separationAt(a);
    let atB = separationAt(b);
    while (right - left > 60000) {
      if (atA <= atB) {
        right = b;
        b = a;
        atB = atA;
        a = right - ratio * (right - left);
        atA = separationAt(a);
      } else {
        left = a;
        a = b;
        atA = atB;
        b = left + ratio * (right - left);
        atB = separationAt(b);
      }
    }
    return (left + right) / 2;
  }

  /** Finds closest sky approaches; these differ from equal-longitude conjunctions.
   * @param {Date} date Center of the displayed time window.
   * @param {number} windowDays Half-window in elapsed 24-hour days.
   * @param {string[]} bodies Planet keys to compare in pairs.
   * @param {Function} vectorAt Earth-centered vector adapter (key, Date).
   * @param {number} maximumSeparation Largest accepted angular minimum in degrees.
   * @returns {object[]} Chronological events with a, b, date, offsetDays and separation.
   */
  function events(date, windowDays, bodies, vectorAt, maximumSeparation){
    const dayMs = 86400000;
    const base = date.getTime();
    if (!Number.isFinite(base) || !Number.isFinite(windowDays) || windowDays <= 0) return [];
    const result = [];
    const cache = new Map();

    /** Shares date samples across planet pairs to avoid repeating orbital calculations.
     * @param {string} key Planet key. @param {number} timestamp Unix milliseconds.
     * @returns {object} Earth-centered vector for that key and instant.
     */
    function vector(key, timestamp){
      let sample = cache.get(timestamp);
      if (!sample) {
        sample = new Map();
        cache.set(timestamp, sample);
      }
      if (!sample.has(key)) sample.set(key, vectorAt(key, new Date(timestamp)));
      return sample.get(key);
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];

        /** Measures this pair at an instant using cached Earth-centered vectors.
         * @param {number} timestamp Unix milliseconds. @returns {number} Full angular separation in degrees.
         */
        function separationAt(timestamp){
          return angularSeparation(vector(a, timestamp), vector(b, timestamp));
        }

        let previous = separationAt(base - (windowDays + 1) * dayMs);
        let current = separationAt(base - windowDays * dayMs);
        for (let day = -windowDays; day <= windowDays; day++) {
          const instant = base + day * dayMs;
          const next = separationAt(instant + dayMs);
          if (current <= previous && current < next) {
            const minimum = refineMinimum(instant - dayMs, instant + dayMs, separationAt);
            const offsetDays = (minimum - base) / dayMs;
            const separation = separationAt(minimum);
            if (Math.abs(offsetDays) <= windowDays && separation <= maximumSeparation) {
              result.push({a, b, date:new Date(minimum), offsetDays, separation});
            }
          }
          previous = current;
          current = next;
        }
      }
    }
    return result.sort((left, right) => left.date - right.date);
  }

  return {angularSeparation, events};
})();
