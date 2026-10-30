(function(){
    /** Returns compass abbreviations for a language.
     * @param {string} lang Language identifier.
     * @returns {string[]} Sixteen labels clockwise from north.
     */
    function compassDirectionLabels(lang){
      if (lang === 'de') {
        return ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      }
      if (lang === 'fr') {
        return ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
      }
      return ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    }

    /** Formats a direction as a localized compass abbreviation.
     * @param {number} azimuthDeg Angle clockwise from north.
     * @param {string} lang Language identifier.
     * @returns {string} Compass abbreviation.
     */
    function compassLabelForAzimuth(azimuthDeg, lang){
      const labels = compassDirectionLabels(lang);
      const normalizedAzimuth = ((azimuthDeg % 360) + 360) % 360;
      const index = Math.round(normalizedAzimuth / 22.5) % 16;
      return labels[index];
    }

    /** Formats an angle as an arm-length observation estimate.
     * @param {number} altitudeDeg Angle in degrees.
     * @param {string} lang Language identifier.
     * @returns {string} Localized estimate or an empty string.
     */
    function altitudeThumbEstimate(altitudeDeg, lang){
      if (!Number.isFinite(altitudeDeg) || altitudeDeg <= 0) {
        return '';
      }

      if (lang === 'de') {
        if (altitudeDeg < 3) {
          return 'ca. 1 Daumenbreit';
        }
        if (altitudeDeg < 6) {
          return 'ca. 2 Daumenbreit';
        }
        if (altitudeDeg < 8) {
          return 'ca. 3 Fingerbreit';
        }
        if (altitudeDeg < 15) {
          return 'ca. 1 Faust hoch';
        }
        if (altitudeDeg < 28) {
          return 'ca. 1 Handspanne hoch';
        }
        if (altitudeDeg < 45) {
          return 'ca. 1 Elle hoch';
        }
        return 'deutlich über 1 Elle';
      }

      if (lang === 'fr') {
        if (altitudeDeg < 3) {
          return 'env. 1 pouce';
        }
        if (altitudeDeg < 6) {
          return 'env. 2 pouces';
        }
        if (altitudeDeg < 8) {
          return 'env. 3 doigts';
        }
        if (altitudeDeg < 15) {
          return 'env. 1 poing';
        }
        if (altitudeDeg < 28) {
          return 'env. 1 empan';
        }
        if (altitudeDeg < 45) {
          return 'env. 1 coudée';
        }
        return 'nettement plus haut qu’une coudée';
      }

      if (altitudeDeg < 3) {
        return 'about 1 thumb width';
      }
      if (altitudeDeg < 6) {
        return 'about 2 thumb widths';
      }
      if (altitudeDeg < 8) {
        return 'about 3 finger widths';
      }
      if (altitudeDeg < 15) {
        return 'about 1 fist high';
      }
      if (altitudeDeg < 28) {
        return 'about 1 hand span high';
      }
      if (altitudeDeg < 45) {
        return 'about 1 cubit high';
      }
      return 'well above 1 cubit';
    }

    window.PLANETENUHR_OBSERVATION_FORMAT = { compassDirectionLabels, compassLabelForAzimuth, altitudeThumbEstimate };
})();
