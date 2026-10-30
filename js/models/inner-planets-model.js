window.PLANETENUHR_INNER_PLANETS_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free inner-planet illumination and phase-geometry model.
   * @param {object} options Heliocentric position and signed solar-elongation providers, each receiving a body key and explicit Date.
   * @returns {object} Model or controller operations with no timers or persistent storage.
   */
  function create(options){
    const heliocentricPosition = options.position;
    const solarElongationForKey = options.elongation;

    /** Calculates the existing planar illumination, elongation, evening/morning flag and distance.
     * @param {string} key Planet key. @param {Date} date Explicit observation instant.
     * @returns {object} Rounded illumination percent, phase angle, signed elongation, evening flag and distance in AU.
     */
    function planetIlluminationData(key, date){
      const earth = heliocentricPosition('earth', date);
      const body = heliocentricPosition(key, date);
      if (!earth || !body) return { illumination:1, phaseAngle:0, elongation:0, evening:true, distanceAu:0 };
      const geo = { x:body.x - earth.x, y:body.y - earth.y };
      const bodyDistance = Math.hypot(body.x, body.y);
      const geoDistance = Math.hypot(geo.x, geo.y);
      const cosPhase = Math.max(-1, Math.min(1, (body.x * geo.x + body.y * geo.y) / Math.max(0.0001, bodyDistance * geoDistance)));
      const phaseAngle = Math.acos(cosPhase) * 180 / Math.PI;
      const illumination = Math.round(((1 + cosPhase) / 2) * 100);
      const elongation = solarElongationForKey(key, date);
      return {
        illumination,
        phaseAngle,
        elongation,
        evening: elongation >= 0,
        distanceAu: geoDistance
      };
    }

    /** Builds the existing two-arc terminator path for a schematic inner-planet phase.
     * @param {number} illumination Illuminated percent. @param {boolean} evening Selects the lit side.
     * @returns {string} SVG path for the fixed 96-unit phase disc.
     */
    function phaseDiscPath(illumination, evening){
      const r = 38;
      const cx = 48;
      const cy = 48;
      const k = Math.max(0, Math.min(1, illumination / 100));
      const terminatorRx = Math.max(1.5, Math.abs(2 * k - 1) * r);
      let sweepOuter = 0;
      let sweepInner = 1;
      if (evening) {
        sweepOuter = 1;
        sweepInner = 0;
      }
      const path = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${sweepOuter} ${cx} ${cy + r} A ${terminatorRx} ${r} 0 0 ${sweepInner} ${cx} ${cy - r} Z`;
      return path;
    }

    return {planetIlluminationData, phaseDiscPath};
  }
  return {create};
})();
