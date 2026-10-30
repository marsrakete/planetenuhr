window.PLANETENUHR_COMPASS = (() => {
  'use strict';

  /** Updates a compass in place; north is up and azimuth increases clockwise.
   * Invalid angles hide the icon so it never suggests an invented direction.
   * @param {SVGSVGElement} compass Icon returned by create.
   * @param {number} azimuthDeg Azimuth in degrees; finite values wrap to [0, 360).
   * @returns {boolean} True when a valid direction is displayed.
   */
  function setAzimuth(compass, azimuthDeg){
    if (!Number.isFinite(azimuthDeg)) {
      compass.setAttribute('hidden', '');
      return false;
    }
    let normalized = azimuthDeg % 360;
    if (normalized < 0) normalized += 360;
    compass.querySelector('[data-compass-arrow]').setAttribute('transform', 'rotate(' + normalized + ' 16 16)');
    compass.removeAttribute('hidden');
    return true;
  }

  /** Clones the shared template for use beside an accessible direction label.
   * The decorative icon has no language or card dependencies; sizing uses CSS.
   * @param {number} azimuthDeg Azimuth in degrees, clockwise from north.
   * @returns {SVGSVGElement} Independent icon, ready to insert into any container.
   */
  function create(azimuthDeg){
    const compass = document.getElementById('directionCompassTemplate').content.firstElementChild.cloneNode(true);
    setAzimuth(compass, azimuthDeg);
    return compass;
  }

  return {create, setAzimuth};
})();
