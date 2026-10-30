window.PLANETENUHR_SATELLITES_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free fixed-epoch schematic satellite orbit model.
   * @param {object} options Reserved factory options; orbitState receives every orbit and layout input explicitly.
   * @returns {object} Model or render operations; starts no timers or listeners.
   */
  function create(options){

    /** Calculates the existing projected ellipse, epoch-based phase and rotated position.
     * @param {object} sat Configured epoch, period, inclination and RAAN. @param {number} index Stable drawing-order index.
     * @param {Date} date Explicit reference instant. @param {object} [layout] Plot center, Earth radius and maximum radius.
     * @returns {object} Original orbit radii, normalized phase and Cartesian plot position.
     */
    function orbitState(sat, index, date, layout = {center:210,earthRadius:34,maxRadius:165}){
      const {center,earthRadius,maxRadius} = layout;
      const radius = earthRadius + 28 + index * 18;
      const ry = radius * Math.max(0.2, Math.cos((sat.inclinationDeg || 0) * Math.PI / 180));
      const elapsedMin = (date.getTime() - new Date(sat.epoch).getTime()) / 60000;
      const phase = (((sat.phase0 || 0) + elapsedMin / sat.periodMin) % 1 + 1) % 1;
      const angle = phase * Math.PI * 2;
      const x0 = Math.min(maxRadius, radius) * Math.cos(angle);
      const y0 = Math.max(20, Math.abs(ry)) * Math.sin(angle);
      const raan = (sat.raanDeg || 0) * Math.PI / 180;
      const x = center + x0 * Math.cos(raan) - y0 * Math.sin(raan);
      const y = center + x0 * Math.sin(raan) + y0 * Math.cos(raan);
      return {radius,ry,phase,x,y};
    }

    return {orbitState};
  }
  return {create};
})();
