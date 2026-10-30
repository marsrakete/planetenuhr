window.PLANETENUHR_SPACECRAFT_MODEL = (() => {
  'use strict';
  /** Creates the DOM-free logarithmic probe-map geometry and decorative curve paths.
   * @param {object} options Explicit model, configuration, template and layout dependencies.
   * @returns {object} Calculation or render operations; starts no timers.
   */
  function create(options){

    /** Maps a distance to the existing logarithmic plot radius.
     * @param {number} au Distance in AU. @param {number} maxRadius Maximum plot radius. @param {number} maxAu Reference distance. @returns {number} Drawing radius.
     */
    function distanceRadius(au, maxRadius, maxAu){
      return Math.log10(1 + au) / Math.log10(1 + maxAu) * maxRadius;
    }

    /** Calculates the configured probe direction, Bezier track and clamped label placement.
     * @param {object} craft Configured distance and optional drawing angle. @param {number} index Fallback direction index.
     * @param {object} [layout] Plot center, scale limits and size. @returns {object} Marker, curve and label geometry.
     */
    function craftState(craft, index, layout = {center:230,maxRadius:460*0.365,maxAu:180,size:460}){
      const {center,maxRadius,maxAu,size} = layout;
      let craftAngle = index * 36;
      if (craft.angle !== undefined && craft.angle !== null) {
        craftAngle = craft.angle;
      }
      const angle = craftAngle * Math.PI / 180;
      const radius = distanceRadius(craft.distanceAu, maxRadius, maxAu);
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      const controlRadius = radius * .45;
      const c1x = center + Math.cos(angle - .28) * controlRadius;
      const c1y = center + Math.sin(angle - .28) * controlRadius;
      const c2x = center + Math.cos(angle + .16) * radius * .82;
      const c2y = center + Math.sin(angle + .16) * radius * .82;
      let labelOffset = 16;
      if (radius < 56) {
        labelOffset = 30;
      }
      const rawLabelX = x + Math.cos(angle) * labelOffset;
      const rawLabelY = y + Math.sin(angle) * labelOffset;
      const labelX = Math.max(34, Math.min(size - 34, rawLabelX));
      const labelY = Math.max(22, Math.min(size - 22, rawLabelY));
      let textAnchor = 'middle';
      if (rawLabelX > size - 70) {
        textAnchor = 'end';
      } else if (rawLabelX < 70) {
        textAnchor = 'start';
      }
      let dominantBaseline = 'middle';
      if (rawLabelY < 30) {
        dominantBaseline = 'hanging';
      } else if (rawLabelY > size - 30) {
        dominantBaseline = 'auto';
      }
      const path = `M ${center} ${center} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
      return {craftAngle,angle,radius,x,y,c1x,c1y,c2x,c2y,labelX,labelY,textAnchor,dominantBaseline,path};
    }

    return {distanceRadius, craftState};
  }
  return {create};
})();
