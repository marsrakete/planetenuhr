window.PLANETENUHR_SMALL_BODIES_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free compressed comet and label geometry.
   * @param {object} options Explicit model, configuration, template and layout dependencies.
   * @returns {object} Calculation or render operations; starts no timers.
   */
  function create(options){

    /** Maps an AU distance to the existing square-root drawing scale with 0.02/60 AU caps.
     * @param {number} au Distance in AU. @param {number} maxRadius Maximum plot radius. @returns {number} Drawing radius.
     */
    function smallBodyRadius(au, maxRadius){
      const capped = Math.max(0.02, Math.min(60, au));
      return Math.sqrt(capped / 60) * maxRadius;
    }

    /** Calculates the existing compressed comet ellipse and its drawing rotation.
     * @param {object} comet Configured perihelion/aphelion and angle. @param {number} index Stable display index.
     * @param {number} center Plot center. @param {number} maxRadius Maximum radius. @returns {object} Existing ellipse geometry.
     */
    function cometState(comet, index, center, maxRadius){
      const q = smallBodyRadius(comet.q, maxRadius);
      const Q = smallBodyRadius(comet.Q, maxRadius);
      const rx = Math.max(4, (q + Q) / 2);
      const ry = Math.max(3, rx * (0.28 + (index % 5) * 0.035));
      const cx = center + (q - Q) / 2;
      const rotation = (comet.angle || 0) * Math.PI / 180;
      return {q,Q,rx,ry,cx,rotation};
    }

    /** Calculates the existing outside label anchor and leader geometry.
     * @param {object} geometry Comet ellipse result. @param {number} center Plot center. @returns {object} Anchor, direction and label coordinates.
     */
    function labelState(geometry, center){
      const {cx,rx,rotation} = geometry;
      const localAnchor = { x: cx - rx, y: center };
      const dx = localAnchor.x - center;
      const dy = localAnchor.y - center;
      const anchorX = center + dx * Math.cos(rotation) - dy * Math.sin(rotation);
      const anchorY = center + dx * Math.sin(rotation) + dy * Math.cos(rotation);
      const vx = anchorX - center;
      const vy = anchorY - center;
      const length = Math.max(1, Math.hypot(vx, vy));
      const dirX = vx / length;
      const dirY = vy / length;
      const labelX = anchorX + dirX * 16;
      let labelY = anchorY + dirY * 16;
      if (Math.abs(dirY) < 0.22) {
        labelY -= 8;
      }

      return {anchorX,anchorY,dirX,dirY,labelX,labelY};
    }

    return {smallBodyRadius, cometState, labelState};
  }
  return {create};
})();
