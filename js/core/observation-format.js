(function(){
    /** Returns compass abbreviations from a selected central language pack.
     * @param {object} translations Central translation pack.
     * @returns {string[]} Sixteen labels clockwise from north.
     */
    function compassDirectionLabels(translations){
      return translations.observation_compass_labels;
    }

    /** Formats a direction using central compass labels.
     * @param {number} azimuthDeg Angle clockwise from north.
     * @param {object} translations Central translation pack.
     * @returns {string} Compass abbreviation, or empty text for invalid angles.
     */
    function compassLabelForAzimuth(azimuthDeg, translations){
      if (!Number.isFinite(azimuthDeg)) {
        return '';
      }
      const labels = compassDirectionLabels(translations);
      const normalizedAzimuth = ((azimuthDeg % 360) + 360) % 360;
      const index = Math.round(normalizedAzimuth / 22.5) % 16;
      return labels[index];
    }

    /** Formats an angle as the existing arm-length observation estimate.
     * @param {number} altitudeDeg Angle in degrees.
     * @param {object} translations Central translation pack.
     * @returns {string} Localized estimate or empty text for nonpositive/invalid angles.
     */
    function altitudeThumbEstimate(altitudeDeg, translations){
      if (!Number.isFinite(altitudeDeg) || altitudeDeg <= 0) {
        return '';
      }
      const thresholds = [3, 6, 8, 15, 28, 45];
      let index = 0;
      while (index < thresholds.length && altitudeDeg >= thresholds[index]) {
        index += 1;
      }
      return translations['observation_altitude_' + index];
    }

    /** Formats the common direction/altitude payload for Moon and eclipse views.
     * @param {object|null} horizontal Geometric azimuth and altitude in degrees.
     * @param {object} translations Central language pack.
     * @returns {object|null} Shared labels and numeric angles, or null for invalid coordinates.
     */
    function skyDirection(horizontal, translations){
      if (!horizontal || !Number.isFinite(horizontal.azimuthDeg) || !Number.isFinite(horizontal.altitudeDeg)) {
        return null;
      }
      const directionLabel = compassLabelForAzimuth(horizontal.azimuthDeg, translations);
      let altitudeText = Math.abs(horizontal.altitudeDeg).toFixed(1) + '°';
      const estimate = altitudeThumbEstimate(horizontal.altitudeDeg, translations);
      if (horizontal.altitudeDeg >= 0) {
        altitudeText += ' ' + translations.eclipse_preview_above_horizon;
        if (estimate) {
          altitudeText += ' · ' + estimate;
        }
      } else {
        altitudeText += ' ' + translations.eclipse_preview_below_horizon;
      }
      return {
        azimuthDeg:horizontal.azimuthDeg, altitudeDeg:horizontal.altitudeDeg,
        directionLabel, altitudeText,
        mainText:directionLabel + ' · ' + horizontal.azimuthDeg.toFixed(0) + '°',
        subText:altitudeText
      };
    }

    /** Creates shared localized Moon-direction adapters for both cards.
     * @param {object} options Observer model and current translation provider.
     * @returns {{lookDirection:Function,previewLookDirection:Function,referenceDate:Function,directionLabel:Function,upcomingPreview:Function}} Shared view API.
     */
    function createMoonDirection(options){
      const observer = options.observer;
      /** Formats the Moon at an explicit instant and location.
       * @param {Date} date Instant to observe. @param {object} location Selected city.
       * @returns {object|null} Legacy Moon display payload or null.
       */
      function lookDirection(date, location){
        const direction = skyDirection(observer.moonDirection(date, location), options.getTranslations());
        if (!direction) {
          return null;
        }
        return {directionLabel:direction.directionLabel,azimuthDeg:direction.azimuthDeg,altitudeText:direction.altitudeText};
      }
      /** Formats a curated eclipse preview phase.
       * @param {object} preview Curated preview. @param {object} location Selected city.
       * @param {object} row Normalized phase row. @returns {object|null} Direction display.
       */
      function previewLookDirection(preview, location, row){
        return skyDirection(observer.previewDirection(preview, location, row), options.getTranslations());
      }
      /** Selects the central label for the current or eclipse-reference time.
       * @param {Date} date Selected instant. @param {object} location Selected city.
       * @returns {string} Localized time-reference label.
       */
      function directionLabel(date, location){
        const translations = options.getTranslations();
        if (observer.isEclipseDay(date, location)) {
          return translations.moon_here_eclipse_time;
        }
        return translations.moon_here_current_time;
      }
      return {lookDirection,previewLookDirection,directionLabel,referenceDate:observer.referenceDate,upcomingPreview:observer.upcomingPreview};
    }

    window.PLANETENUHR_OBSERVATION_FORMAT = {compassDirectionLabels,compassLabelForAzimuth,altitudeThumbEstimate,skyDirection,createMoonDirection};
})();
