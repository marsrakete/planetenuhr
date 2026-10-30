window.PLANETENUHR_LAGRANGE_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free schematic Sun-Earth Lagrange geometry.
   * @param {object} options Explicit sunLongitude(Date) and polarPoint(center, radius, fraction) providers.
   * @returns {object} Model or render operations; starts no timers or listeners.
   */
  function create(options){
    const sunLongitude = options.sunLongitude;
    const polarPoint = options.polarPoint;

    /** Calculates the existing rotating Sun-Earth schematic; L1/L2 offsets remain exaggerated for readability.
     * @param {Date} date Explicit observation instant.
     * @returns {object} Fixed plot geometry, Earth phase and five schematic point positions.
     */
    function calculateScene(date){
      const size = 420;
      const center = size / 2;
      const orbitRadius = 128;
      const earthFraction = (sunLongitude(date) / 360 + 0.5) % 1;
      const earthPoint = polarPoint(center, orbitRadius, earthFraction);
      const l4Point = polarPoint(center, orbitRadius, (earthFraction + 1 / 6) % 1);
      const l5Point = polarPoint(center, orbitRadius, (earthFraction + 5 / 6) % 1);
      const directionX = (earthPoint.x - center) / orbitRadius;
      const directionY = (earthPoint.y - center) / orbitRadius;
      const lagrangeOffset = 18;
      const l1Point = {
        x: earthPoint.x - directionX * lagrangeOffset,
        y: earthPoint.y - directionY * lagrangeOffset
      };
      const l2Point = {
        x: earthPoint.x + directionX * lagrangeOffset,
        y: earthPoint.y + directionY * lagrangeOffset
      };
      const l3Point = {
        x: center - directionX * orbitRadius,
        y: center - directionY * orbitRadius
      };
      return {size,center,orbitRadius,earthFraction,earthPoint,l1Point,l2Point,l3Point,l4Point,l5Point,directionX,directionY};
    }

    return {calculateScene};
  }
  return {create};
})();
