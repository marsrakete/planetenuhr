window.PLANETENUHR_POLARIS_CARD = (() => {
  'use strict';

  /** Creates the north-sky dome controller.
   * @param {object} dependencies Document, window, selected place, language and summary helpers.
   * @returns {{render:Function}} Renderer for the selected dashboard date and place.
   */
  function create(dependencies){
    const document = dependencies.document;
    const window = dependencies.window;
    const t = dependencies.getTranslations();

    /** Formats a date in the active app language.
     * @param {Date} date Date to format.
     * @returns {string} Localized date.
     */
    function formatDateStamp(date){
      return dependencies.formatDate(date);
    }

    /** Formats a time using the existing dashboard convention.
     * @param {Date} date Instant to format.
     * @returns {string} Localized clock time.
     */
    function fmtTimeOnly(date){
      return dependencies.formatTime(date);
    }

    /** Appends plain summary text using the shared dashboard helper.
     * @param {Element} target Summary element.
     * @param {string} text Text to append.
     * @returns {void}
     */
    function appendSummaryText(target, text){
      dependencies.appendSummaryText(target, text);
    }

    /** Appends one labeled summary row using the shared dashboard helper.
     * @param {Element} target Summary element.
     * @param {string} label Localized label.
     * @param {string} value Display value.
     * @returns {void}
     */
    function appendSummaryLine(target, label, value){
      dependencies.appendSummaryLine(target, label, value);
    }
    /** Rotates a schematic point around the origin.
     * @param {number} x Point X coordinate.
     * @param {number} y Point Y coordinate.
     * @param {number} angleDeg Rotation angle in degrees.
     * @returns {{x:number,y:number}} Rotated point.
     */
    function rotatePoint(x, y, angleDeg){
      const radians = angleDeg * Math.PI / 180;
      const cosValue = Math.cos(radians);
      const sinValue = Math.sin(radians);
      return {
        x: x * cosValue - y * sinValue,
        y: x * sinValue + y * cosValue
      };
    }

    /**
     * Projects a point from a north-facing sky dome onto the 2D card.
     * The azimuth offset is measured from north toward east/west, while the
     * altitude uses a simple orthographic dome so horizon, zenith and Polaris
     * read like a small observing-window rather than a flat diagram.
     * @param {number} centerX Dome center X on the horizon line.
     * @param {number} horizonY Horizon baseline Y.
     * @param {number} domeRadius Radius of the visible half dome.
     * @param {number} azimuthOffsetDeg Horizontal offset from north in degrees.
     * @param {number} altitudeDeg Altitude above the horizon in degrees.
     * @returns {{x:number,y:number}} Projected card coordinates.
     */
    function projectNorthDomePoint(centerX, horizonY, domeRadius, azimuthOffsetDeg, altitudeDeg){
      const azimuthRadians = azimuthOffsetDeg * Math.PI / 180;
      const altitudeRadians = altitudeDeg * Math.PI / 180;
      const horizontalRadius = domeRadius * Math.cos(altitudeRadians);
      return {
        x: centerX + horizontalRadius * Math.sin(azimuthRadians),
        y: horizonY - domeRadius * Math.sin(altitudeRadians)
      };
    }

    /**
     * Renders the Polaris / north-celestial-pole card for the selected location.
     * The altitude of the pole follows geographic latitude, while nearby
     * asterisms rotate with sidereal time so the card visibly reacts to date changes.
     * @param {object} context Shared dashboard context containing date and location.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const location = context.location;
      const target = document.getElementById('polarisMap');
      const summary = document.getElementById('polarisSummary');
      if (!target || !summary) {
        return;
      }

      target.textContent = '';
      summary.textContent = '';

      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 420 420');
      svg.setAttribute('aria-label', t.polaris_aria || 'Polaris and the north celestial pole');

      const defs = document.createElementNS(svgNS, 'defs');
      const skyGradient = document.createElementNS(svgNS, 'radialGradient');
      skyGradient.setAttribute('id', 'polarisSkyGradient');
      skyGradient.setAttribute('cx', '50%');
      skyGradient.setAttribute('cy', '30%');
      skyGradient.setAttribute('r', '78%');
      [
        { offset:'0%', color:'#17325f' },
        { offset:'58%', color:'#0f2443' },
        { offset:'100%', color:'#07111f' }
      ].forEach(stopConfig => {
        const stop = document.createElementNS(svgNS, 'stop');
        stop.setAttribute('offset', stopConfig.offset);
        stop.setAttribute('stop-color', stopConfig.color);
        skyGradient.appendChild(stop);
      });
      defs.appendChild(skyGradient);
      svg.appendChild(defs);

      const background = document.createElementNS(svgNS, 'rect');
      background.setAttribute('x', '0');
      background.setAttribute('y', '0');
      background.setAttribute('width', '420');
      background.setAttribute('height', '420');
      background.setAttribute('rx', '16');
      background.setAttribute('class', 'polaris-sky-panel');
      svg.appendChild(background);

      const horizonY = 330;
      const centerX = 210;
      const domeRadius = 154;
      const latitude = location.latitude;
      const clampedLatitude = Math.max(-75, Math.min(75, latitude));
      const poleAltitude = Math.max(0, clampedLatitude);
      const siderealAngle = window.PLANETENUHR_COORDINATES.localSiderealAngleDegrees(date, location.longitude || 0);
      const polePoint = projectNorthDomePoint(centerX, horizonY, domeRadius, 0, poleAltitude);
      const poleX = polePoint.x;
      const poleY = polePoint.y;

      const domePath = document.createElementNS(svgNS, 'path');
      domePath.setAttribute('d', 'M ' + (centerX - domeRadius) + ' ' + horizonY + ' A ' + domeRadius + ' ' + domeRadius + ' 0 0 1 ' + (centerX + domeRadius) + ' ' + horizonY);
      domePath.setAttribute('class', 'polaris-dome');
      svg.appendChild(domePath);

      [15, 30, 45, 60].forEach(altitude => {
        const altitudeRadius = domeRadius * Math.cos(altitude * Math.PI / 180);
        const altitudeY = horizonY - domeRadius * Math.sin(altitude * Math.PI / 180);
        const arc = document.createElementNS(svgNS, 'path');
        arc.setAttribute('d', 'M ' + (centerX - altitudeRadius) + ' ' + altitudeY + ' A ' + altitudeRadius + ' ' + altitudeRadius + ' 0 0 1 ' + (centerX + altitudeRadius) + ' ' + altitudeY);
        arc.setAttribute('class', 'polaris-altitude-arc');
        svg.appendChild(arc);
      });

      [-60, -30, 0, 30, 60].forEach(azimuthOffset => {
        const topPoint = projectNorthDomePoint(centerX, horizonY, domeRadius, azimuthOffset, 82);
        const bottomPoint = projectNorthDomePoint(centerX, horizonY, domeRadius, azimuthOffset, 0);
        const azimuthLine = document.createElementNS(svgNS, 'line');
        azimuthLine.setAttribute('x1', topPoint.x);
        azimuthLine.setAttribute('y1', topPoint.y);
        azimuthLine.setAttribute('x2', bottomPoint.x);
        azimuthLine.setAttribute('y2', bottomPoint.y);
        azimuthLine.setAttribute('class', 'polaris-azimuth-line');
        svg.appendChild(azimuthLine);
      });

      const horizon = document.createElementNS(svgNS, 'line');
      horizon.setAttribute('x1', centerX - domeRadius);
      horizon.setAttribute('y1', horizonY);
      horizon.setAttribute('x2', centerX + domeRadius);
      horizon.setAttribute('y2', horizonY);
      horizon.setAttribute('class', 'polaris-horizon');
      svg.appendChild(horizon);

      const westLabel = document.createElementNS(svgNS, 'text');
      westLabel.setAttribute('x', centerX - domeRadius + 6);
      westLabel.setAttribute('y', horizonY + 24);
      westLabel.setAttribute('class', 'polaris-label');
      westLabel.textContent = 'W';
      svg.appendChild(westLabel);

      const northLabel = document.createElementNS(svgNS, 'text');
      northLabel.setAttribute('x', centerX);
      northLabel.setAttribute('y', horizonY + 24);
      northLabel.setAttribute('class', 'polaris-label');
      northLabel.textContent = 'N';
      svg.appendChild(northLabel);

      const eastLabel = document.createElementNS(svgNS, 'text');
      eastLabel.setAttribute('x', centerX + domeRadius - 6);
      eastLabel.setAttribute('y', horizonY + 24);
      eastLabel.setAttribute('class', 'polaris-label');
      eastLabel.textContent = 'E';
      svg.appendChild(eastLabel);

      const zenithLabel = document.createElementNS(svgNS, 'text');
      zenithLabel.setAttribute('x', centerX);
      zenithLabel.setAttribute('y', horizonY - domeRadius - 10);
      zenithLabel.setAttribute('class', 'polaris-label');
      zenithLabel.textContent = t.polaris_zenith || 'Zenith';
      svg.appendChild(zenithLabel);

      const axis = document.createElementNS(svgNS, 'line');
      axis.setAttribute('x1', centerX);
      axis.setAttribute('y1', horizonY);
      axis.setAttribute('x2', poleX);
      axis.setAttribute('y2', poleY);
      axis.setAttribute('class', 'polaris-axis');
      svg.appendChild(axis);

      [22, 46, 74].forEach(trailRadius => {
        const trail = document.createElementNS(svgNS, 'circle');
        trail.setAttribute('cx', poleX);
        trail.setAttribute('cy', poleY);
        trail.setAttribute('r', trailRadius);
        trail.setAttribute('class', 'polaris-ring');
        svg.appendChild(trail);
      });

      const poleMarkerA = document.createElementNS(svgNS, 'line');
      poleMarkerA.setAttribute('x1', poleX - 7);
      poleMarkerA.setAttribute('y1', poleY - 7);
      poleMarkerA.setAttribute('x2', poleX + 7);
      poleMarkerA.setAttribute('y2', poleY + 7);
      poleMarkerA.setAttribute('class', 'polaris-pole-marker');
      svg.appendChild(poleMarkerA);

      const poleMarkerB = document.createElementNS(svgNS, 'line');
      poleMarkerB.setAttribute('x1', poleX - 7);
      poleMarkerB.setAttribute('y1', poleY + 7);
      poleMarkerB.setAttribute('x2', poleX + 7);
      poleMarkerB.setAttribute('y2', poleY - 7);
      poleMarkerB.setAttribute('class', 'polaris-pole-marker');
      svg.appendChild(poleMarkerB);

      const backgroundStars = [
        [34, 60, 1.1], [88, 48, 1.4], [122, 82, 1.1], [168, 42, 1.2], [246, 50, 1.3], [318, 72, 1.1], [370, 54, 1.3],
        [58, 124, 1.2], [108, 116, 1.1], [154, 142, 1.2], [216, 110, 1.3], [286, 136, 1.1], [334, 122, 1.2],
        [72, 196, 1.3], [136, 184, 1.1], [196, 204, 1.2], [256, 188, 1.2], [318, 214, 1.1]
      ];
      backgroundStars.forEach(starConfig => {
        const star = document.createElementNS(svgNS, 'circle');
        star.setAttribute('cx', String(starConfig[0]));
        star.setAttribute('cy', String(starConfig[1]));
        star.setAttribute('r', String(starConfig[2]));
        star.setAttribute('class', 'polaris-background-star');
        svg.appendChild(star);
      });

      const polarisOffsetAltitude = 0.7;
      const polarisTrailRadius = 8;
      const polarisGuide = document.createElementNS(svgNS, 'circle');
      polarisGuide.setAttribute('cx', poleX);
      polarisGuide.setAttribute('cy', poleY);
      polarisGuide.setAttribute('r', polarisTrailRadius);
      polarisGuide.setAttribute('class', 'polaris-guide');
      svg.appendChild(polarisGuide);

      const polarisRotationPoint = rotatePoint(0, -polarisTrailRadius, siderealAngle + 18);
      const polarisX = poleX + polarisRotationPoint.x;
      const polarisY = poleY + polarisRotationPoint.y;

      const polarisHorizonPoint = projectNorthDomePoint(centerX, horizonY, domeRadius, 0, poleAltitude - polarisOffsetAltitude);
      const polarisSightLine = document.createElementNS(svgNS, 'line');
      polarisSightLine.setAttribute('x1', centerX);
      polarisSightLine.setAttribute('y1', horizonY);
      polarisSightLine.setAttribute('x2', polarisHorizonPoint.x);
      polarisSightLine.setAttribute('y2', polarisHorizonPoint.y);
      polarisSightLine.setAttribute('class', 'polaris-sight-line');
      svg.appendChild(polarisSightLine);

      const polaris = document.createElementNS(svgNS, 'circle');
      polaris.setAttribute('cx', polarisX);
      polaris.setAttribute('cy', polarisY);
      polaris.setAttribute('r', 5.4);
      polaris.setAttribute('class', 'polaris-star polaris-main-star');
      svg.appendChild(polaris);

      const polarisText = document.createElementNS(svgNS, 'text');
      polarisText.setAttribute('x', polarisX + 9);
      polarisText.setAttribute('y', polarisY - 10);
      polarisText.setAttribute('class', 'polaris-small-label');
      polarisText.textContent = t.polaris_name || 'Polaris';
      svg.appendChild(polarisText);

      const poleText = document.createElementNS(svgNS, 'text');
      poleText.setAttribute('x', poleX + 12);
      poleText.setAttribute('y', poleY + 4);
      poleText.setAttribute('class', 'polaris-small-label');
      poleText.textContent = t.polaris_ncp || 'North celestial pole';
      svg.appendChild(poleText);

      const ursaMinorBasePoints = [
        [0, 0],
        [18, -16],
        [40, -29],
        [66, -36],
        [88, -22],
        [82, 6],
        [54, 12]
      ];
      const rotatedUrsaMinor = [];
      ursaMinorBasePoints.forEach(point => {
        const rotatedPoint = rotatePoint(point[0], point[1], siderealAngle * 0.12);
        rotatedUrsaMinor.push({
          x: polarisX + rotatedPoint.x,
          y: polarisY + rotatedPoint.y
        });
      });

      const ursaMinorLine = document.createElementNS(svgNS, 'polyline');
      ursaMinorLine.setAttribute('points', rotatedUrsaMinor.map(point => point.x + ',' + point.y).join(' '));
      ursaMinorLine.setAttribute('class', 'polaris-asterism');
      svg.appendChild(ursaMinorLine);

      rotatedUrsaMinor.forEach((point, index) => {
        const star = document.createElementNS(svgNS, 'circle');
        star.setAttribute('cx', point.x);
        star.setAttribute('cy', point.y);
        let radius = 2.6;
        if (index === 0) {
          radius = 4.8;
        } else if (index < 3) {
          radius = 3.1;
        }
        star.setAttribute('r', radius);
        star.setAttribute('class', 'polaris-star');
        svg.appendChild(star);
      });

      const asterismLabel = document.createElementNS(svgNS, 'text');
      asterismLabel.setAttribute('x', rotatedUrsaMinor[4].x + 10);
      asterismLabel.setAttribute('y', rotatedUrsaMinor[4].y - 18);
      asterismLabel.setAttribute('class', 'polaris-small-label');
      asterismLabel.textContent = t.polaris_asterism_label || 'Ursa Minor';
      svg.appendChild(asterismLabel);

      const kochabLabel = document.createElementNS(svgNS, 'text');
      kochabLabel.setAttribute('x', rotatedUrsaMinor[4].x + 10);
      kochabLabel.setAttribute('y', rotatedUrsaMinor[4].y - 2);
      kochabLabel.setAttribute('class', 'polaris-small-label');
      kochabLabel.textContent = 'Kochab';
      svg.appendChild(kochabLabel);

      const pherkadLabel = document.createElementNS(svgNS, 'text');
      pherkadLabel.setAttribute('x', rotatedUrsaMinor[5].x + 10);
      pherkadLabel.setAttribute('y', rotatedUrsaMinor[5].y + 4);
      pherkadLabel.setAttribute('class', 'polaris-small-label');
      pherkadLabel.textContent = 'Pherkad';
      svg.appendChild(pherkadLabel);

      target.appendChild(svg);

      appendSummaryText(summary, t.polaris_summary || 'Polaris sits very close to the north celestial pole. Its height above the horizon is approximately your geographic latitude.');
      appendSummaryLine(summary, (t.polaris_constellation || 'Constellation') + ': ', t.polaris_constellation_value || 'Ursa Minor (Little Bear); the asterism is the Little Dipper.');
      appendSummaryLine(summary, (t.polaris_location || 'Location') + ': ', location.name);
      appendSummaryLine(summary, (t.polaris_latitude || 'Latitude') + ': ', latitude.toFixed(1) + '°');
      if (latitude >= 0) {
        appendSummaryLine(summary, (t.polaris_altitude || 'Polaris altitude') + ': ', poleAltitude.toFixed(1) + '°');
        appendSummaryLine(summary, (t.polaris_motion || 'Nightly motion') + ': ', t.polaris_motion_value || 'The surrounding stars circle the pole; Polaris traces only a tiny loop.');
      } else {
        appendSummaryLine(summary, (t.polaris_altitude || 'Polaris altitude') + ': ', t.polaris_below_horizon || 'Below the horizon at this southern location');
      }
      appendSummaryLine(summary, (t.today || 'Today') + ': ', formatDateStamp(date) + ' ' + fmtTimeOnly(date));
    }

    return {render};
  }

  return {create};
})();
