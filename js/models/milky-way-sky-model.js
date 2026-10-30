window.PLANETENUHR_MILKY_WAY_SKY_MODEL = (() => {
  'use strict';

  // Inverse Gaia ICRS-to-Galactic rotation; the plane samples use only x and y.
  const galacticToEquatorial = {
    x: [-0.0548755604162154, 0.4941094278755837, -0.8676661490190047],
    y: [-0.8734370902348850, -0.4448296299600112, -0.1980763734312015],
    z: [-0.4838350155487132, 0.7469822444972189, 0.4559837761750669]
  };

  /** Precesses fixed J2000 equatorial coordinates to the mean equator of date.
   * @param {{rightAscensionDeg:number, declinationDeg:number}} equatorial J2000 direction.
   * @param {Date} date Observation instant.
   * @returns {{rightAscensionDeg:number, declinationDeg:number}} Coordinates of date.
   */
  function equatorialOfDate(equatorial, date){
    const radians = Math.PI / 180;
    const centuries = (date.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;
    const arcsecondsToRadians = radians / 3600;
    const rightAscension = equatorial.rightAscensionDeg * radians;
    const declination = equatorial.declinationDeg * radians;
    const zeta = (2306.2181 * centuries + 0.30188 * centuries ** 2 + 0.017998 * centuries ** 3) * arcsecondsToRadians;
    const zRotation = (2306.2181 * centuries + 1.09468 * centuries ** 2 + 0.018203 * centuries ** 3) * arcsecondsToRadians;
    const theta = (2004.3109 * centuries - 0.42665 * centuries ** 2 - 0.041833 * centuries ** 3) * arcsecondsToRadians;
    const a = Math.cos(declination) * Math.sin(rightAscension + zeta);
    const b = Math.cos(theta) * Math.cos(declination) * Math.cos(rightAscension + zeta) - Math.sin(theta) * Math.sin(declination);
    const c = Math.sin(theta) * Math.cos(declination) * Math.cos(rightAscension + zeta) + Math.cos(theta) * Math.sin(declination);
    let rightAscensionOfDate = (Math.atan2(a, b) + zRotation) / radians;
    rightAscensionOfDate = ((rightAscensionOfDate % 360) + 360) % 360;
    const declinationOfDate = Math.asin(Math.max(-1, Math.min(1, c))) / radians;
    return {rightAscensionDeg:rightAscensionOfDate, declinationDeg:declinationOfDate};
  }

  /** Creates a calculator for the visible galactic plane and sky darkness.
   * @param {object} options Horizon-coordinate and solar-coordinate callbacks.
   * @returns {{calculate: Function}} Model bound to shared coordinate routines.
   */
  function create(options){
    const horizontalCoordinates = options.horizontalCoordinates;
    const sunEquatorialCoordinates = options.sunEquatorialCoordinates;

    /** Converts a point on the galactic equator into ICRS right ascension and declination.
     * @param {number} galacticLongitudeDeg Galactic longitude in degrees.
     * @returns {{rightAscensionDeg:number, declinationDeg:number}} Equatorial direction.
     */
    function equatorialOnGalacticPlane(galacticLongitudeDeg){
      const longitude = galacticLongitudeDeg * Math.PI / 180;
      const galacticX = Math.cos(longitude);
      const galacticY = Math.sin(longitude);
      const x = galacticToEquatorial.x[0] * galacticX + galacticToEquatorial.x[1] * galacticY;
      const y = galacticToEquatorial.y[0] * galacticX + galacticToEquatorial.y[1] * galacticY;
      const z = galacticToEquatorial.z[0] * galacticX + galacticToEquatorial.z[1] * galacticY;
      return {
        rightAscensionDeg: ((Math.atan2(y, x) * 180 / Math.PI) % 360 + 360) % 360,
        declinationDeg: Math.asin(z) * 180 / Math.PI
      };
    }

    /** Calculates visible Milky Way segments and solar light state at one place and instant.
     * @param {Date} date Selected observation instant.
     * @param {object} location Selected place with latitude and longitude.
     * @returns {{segments:object[][], galacticCenter:{azimuthDeg:number, altitudeDeg:number}, sunAltitudeDeg:number, lightState:string}} Horizon chart data.
     */
    function calculate(date, location){
      const segments = [];
      let currentSegment = [];
      let previousAzimuth = null;
      const sampleCount = 720;

      /** Stores the current visible arc if it has enough points to draw.
       * @returns {void} No return value.
       */
      function finishSegment(){
        if (currentSegment.length > 1) {
          segments.push(currentSegment);
        }
        currentSegment = [];
      }

      for (let index = 0; index <= sampleCount; index += 1) {
        const galacticLongitude = index * 360 / sampleCount;
        const equatorialJ2000 = equatorialOnGalacticPlane(galacticLongitude);
        const equatorial = equatorialOfDate(equatorialJ2000, date);
        const horizontal = horizontalCoordinates(date, location, equatorial);
        if (horizontal.altitudeDeg < 0) {
          finishSegment();
          previousAzimuth = null;
          continue;
        }

        if (previousAzimuth !== null && Math.abs(horizontal.azimuthDeg - previousAzimuth) > 180) {
          finishSegment();
        }
        currentSegment.push({azimuthDeg:horizontal.azimuthDeg, altitudeDeg:horizontal.altitudeDeg});
        previousAzimuth = horizontal.azimuthDeg;
      }
      finishSegment();

      const sunEquatorial = sunEquatorialCoordinates(date);
      const sunHorizontal = horizontalCoordinates(date, location, sunEquatorial);
      const galacticCenterEquatorial = equatorialOfDate(equatorialOnGalacticPlane(0), date);
      const galacticCenterHorizontal = horizontalCoordinates(date, location, galacticCenterEquatorial);
      let lightState = 'night';
      if (sunHorizontal.altitudeDeg > -18) {
        lightState = 'twilight';
      }
      if (sunHorizontal.altitudeDeg > -0.8333) {
        lightState = 'day';
      }

      return {
        segments,
        galacticCenter: {
          azimuthDeg:galacticCenterHorizontal.azimuthDeg,
          altitudeDeg:galacticCenterHorizontal.altitudeDeg
        },
        sunAltitudeDeg:sunHorizontal.altitudeDeg,
        lightState
      };
    }

    return {calculate, equatorialOnGalacticPlane};
  }

  return {create};
})();
