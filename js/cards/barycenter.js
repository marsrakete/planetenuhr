window.PLANETENUHR_BARYCENTER_CARD = (() => {
  'use strict';
  /** Creates the solar-barycenter card and owns its local comparison mode and button handlers.
   * @param {object} options Document, mass/radius/button configuration, barycenter model, SVG templates, current-context provider and formatting/layout callbacks.
   * @returns {object} Model or controller operations with no timers or persistent storage.
   */
  function create(options){
    const document = options.document;
    const sunRadiusAu = options.config.sunRadiusAu;
    let mode = 'all';
    let wired = false;

    /**
     * Returns the localized label for the barycenter influence mode.
     * @param {string} [selectedMode] Influence key; defaults to the current local selection.
     * @returns {string} Localized mode label.
     */
    function barycenterModeLabel(selectedMode = mode){
      const t = options.getTranslations();
      if (selectedMode === 'jupiter') {
        return t.barycenter_mode_jupiter || 'Jupiter';
      }

      if (selectedMode === 'jupiter_saturn') {
        return t.barycenter_mode_jupiter_saturn || 'Jupiter + Saturn';
      }

      return t.barycenter_mode_all || 'All planets';
    }

    /**
     * Converts an AU-based top-down vector into the screen space of the
     * barycenter card.
     * @param {object} vector Position vector with x and y components in AU.
     * @param {number} centerX Horizontal center of the drawing.
     * @param {number} centerY Vertical center of the drawing.
     * @param {number} pixelsPerAu Scale factor from AU to pixels.
     * @returns {object} Screen-space point with x and y coordinates in pixels.
     */
    function barycenterScreenPoint(vector, centerX, centerY, pixelsPerAu){
      return {
        x: centerX + vector.x * pixelsPerAu,
        y: centerY - vector.y * pixelsPerAu
      };
    }

    /**
     * Builds a simple SVG polyline path from sampled points.
     * @param {object[]} points Ordered screen-space points with x and y values.
     * @returns {string} SVG path string for a continuous line.
     */
    function barycenterTrailPath(points){
      if (!points.length) {
        return '';
      }

      let path = 'M ' + points[0].x.toFixed(2) + ' ' + points[0].y.toFixed(2);
      for (let index = 1; index < points.length; index += 1) {
        path += ' L ' + points[index].x.toFixed(2) + ' ' + points[index].y.toFixed(2);
      }
      return path;
    }

    /**
     * Renders the Sun-versus-barycenter hybrid card.
     * The barycenter stays fixed in the middle, the Sun is drawn at its current
     * offset, and a long trail shows how the solar center wanders around that
     * common center of mass.
     * @param {object} context Shared dashboard context with the selected date.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const t = options.getTranslations();
      const target = document.getElementById('barycenterMap');
      const summary = document.getElementById('barycenterSummary');
      if (!target || !summary) {
        return;
      }

      const currentMode = mode;
      const currentSunOffset = options.model.sunOffsetFromBarycenter(date, currentMode);
      const trail = options.model.barycenterTrail(date, 9125, 30, currentMode);

      let maxTrailDistance = currentSunOffset.distanceAu;
      let minTrailDistance = currentSunOffset.distanceAu;
      trail.forEach(point => {
        if (point.distanceAu > maxTrailDistance) {
          maxTrailDistance = point.distanceAu;
        }
        if (point.distanceAu < minTrailDistance) {
          minTrailDistance = point.distanceAu;
        }
      });

      let displayRadiusAu = maxTrailDistance * 1.04;
      const minimumDisplayRadius = sunRadiusAu * 1.8;
      if (displayRadiusAu < minimumDisplayRadius) {
        displayRadiusAu = minimumDisplayRadius;
      }

      const size = 560;
      const height = 340;
      const centerX = size / 2;
      const centerY = 166;
      const plotRadius = 128;
      const pixelsPerAu = plotRadius / displayRadiusAu;
      const solarRadiusPixels = sunRadiusAu * pixelsPerAu;

      target.textContent = '';

      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', `0 0 ${size} ${height}`);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.barycenter_aria || 'Top-down solar barycenter view');

      const defs = options.createSvgElement('defs');
      const sunGradient = options.createSvgElement('radialGradient');
      sunGradient.setAttribute('id', 'barycenterSunGradient');
      sunGradient.setAttribute('cx', '35%');
      sunGradient.setAttribute('cy', '35%');
      sunGradient.setAttribute('r', '70%');

      const gradientStopA = options.createSvgElement('stop');
      gradientStopA.setAttribute('offset', '0');
      gradientStopA.setAttribute('stop-color', '#fff7b0');
      sunGradient.appendChild(gradientStopA);

      const gradientStopB = options.createSvgElement('stop');
      gradientStopB.setAttribute('offset', '.56');
      gradientStopB.setAttribute('stop-color', '#f8b43c');
      sunGradient.appendChild(gradientStopB);

      const gradientStopC = options.createSvgElement('stop');
      gradientStopC.setAttribute('offset', '1');
      gradientStopC.setAttribute('stop-color', '#b45309');
      sunGradient.appendChild(gradientStopC);
      defs.appendChild(sunGradient);

      const sunGlow = options.createSvgElement('filter');
      sunGlow.setAttribute('id', 'barycenterSunGlow');
      sunGlow.setAttribute('x', '-80%');
      sunGlow.setAttribute('y', '-80%');
      sunGlow.setAttribute('width', '260%');
      sunGlow.setAttribute('height', '260%');

      const blur = options.createSvgElement('feGaussianBlur');
      blur.setAttribute('stdDeviation', '8');
      blur.setAttribute('result', 'glow');
      sunGlow.appendChild(blur);

      const merge = options.createSvgElement('feMerge');
      const mergeGlow = options.createSvgElement('feMergeNode');
      mergeGlow.setAttribute('in', 'glow');
      merge.appendChild(mergeGlow);
      const mergeSource = options.createSvgElement('feMergeNode');
      mergeSource.setAttribute('in', 'SourceGraphic');
      merge.appendChild(mergeSource);
      sunGlow.appendChild(merge);
      defs.appendChild(sunGlow);

      svg.appendChild(defs);

      const outerDisc = options.createSvgElement('circle');
      outerDisc.setAttribute('cx', centerX);
      outerDisc.setAttribute('cy', centerY);
      outerDisc.setAttribute('r', plotRadius + 22);
      outerDisc.setAttribute('class', 'barycenter-disc');
      svg.appendChild(outerDisc);

      const referenceRadii = [sunRadiusAu, sunRadiusAu * 2];
      referenceRadii.forEach((radiusAu, index) => {
        const ring = options.createSvgElement('circle');
        ring.setAttribute('cx', centerX);
        ring.setAttribute('cy', centerY);
        ring.setAttribute('r', radiusAu * pixelsPerAu);
        ring.setAttribute('class', 'barycenter-reference-ring');
        svg.appendChild(ring);

        const label = options.createSvgElement('text');
        label.setAttribute('x', centerX + radiusAu * pixelsPerAu + 10);
        label.setAttribute('y', centerY - 4 - index * 14);
        label.setAttribute('class', 'barycenter-reference-label');
        label.textContent = String(index + 1) + ' R☉';
        svg.appendChild(label);
      });

      const trailScreenPoints = [];
      trail.forEach(point => {
        trailScreenPoints.push(barycenterScreenPoint(point, centerX, centerY, pixelsPerAu));
      });

      const trailPath = options.createSvgElement('path');
      trailPath.setAttribute('d', barycenterTrailPath(trailScreenPoints));
      trailPath.setAttribute('class', 'barycenter-trail');

      const currentPoint = barycenterScreenPoint(currentSunOffset, centerX, centerY, pixelsPerAu);

      const connector = options.createSvgElement('line');
      connector.setAttribute('x1', centerX);
      connector.setAttribute('y1', centerY);
      connector.setAttribute('x2', currentPoint.x);
      connector.setAttribute('y2', currentPoint.y);
      connector.setAttribute('class', 'barycenter-connector');
      svg.appendChild(connector);

      const sunDisc = options.createSvgElement('circle');
      sunDisc.setAttribute('cx', currentPoint.x);
      sunDisc.setAttribute('cy', currentPoint.y);
      sunDisc.setAttribute('r', solarRadiusPixels);
      sunDisc.setAttribute('class', 'barycenter-sun-disc');
      svg.appendChild(sunDisc);

      const sunOutline = options.createSvgElement('circle');
      sunOutline.setAttribute('cx', currentPoint.x);
      sunOutline.setAttribute('cy', currentPoint.y);
      sunOutline.setAttribute('r', solarRadiusPixels);
      sunOutline.setAttribute('class', 'barycenter-sun-outline');
      svg.appendChild(sunOutline);

      svg.appendChild(trailPath);

      trail.forEach((trailPoint, index) => {
        if (index % 12 !== 0) {
          return;
        }

        const point = trailScreenPoints[index];
        const dot = options.createSvgElement('circle');
        dot.setAttribute('cx', point.x);
        dot.setAttribute('cy', point.y);
        dot.setAttribute('r', '3.2');
        dot.setAttribute('class', 'barycenter-year-dot');
        svg.appendChild(dot);

        const isFiveYearLabel = index % 60 === 0;
        if (!isFiveYearLabel) {
          return;
        }

        const label = options.createSvgElement('text');
        label.setAttribute('x', point.x);
        label.setAttribute('y', point.y - 10);
        label.setAttribute('class', 'barycenter-year-label');
        label.textContent = String(trailPoint.date.getFullYear());
        svg.appendChild(label);
      });

      const sunCenterDot = options.createSvgElement('circle');
      sunCenterDot.setAttribute('cx', currentPoint.x);
      sunCenterDot.setAttribute('cy', currentPoint.y);
      sunCenterDot.setAttribute('r', '3.4');
      sunCenterDot.setAttribute('class', 'barycenter-sun-center-dot');
      svg.appendChild(sunCenterDot);

      const sunCenterLabel = options.createSvgElement('text');
      sunCenterLabel.setAttribute('x', currentPoint.x);
      sunCenterLabel.setAttribute('y', currentPoint.y - solarRadiusPixels - 10);
      sunCenterLabel.setAttribute('class', 'barycenter-label');
      sunCenterLabel.textContent = t.barycenter_sun_center || 'Sun center';
      svg.appendChild(sunCenterLabel);

      const barycenterCrossHorizontal = options.createSvgElement('line');
      barycenterCrossHorizontal.setAttribute('x1', centerX - 8);
      barycenterCrossHorizontal.setAttribute('y1', centerY);
      barycenterCrossHorizontal.setAttribute('x2', centerX + 8);
      barycenterCrossHorizontal.setAttribute('y2', centerY);
      barycenterCrossHorizontal.setAttribute('class', 'barycenter-cross');
      svg.appendChild(barycenterCrossHorizontal);

      const barycenterCrossVertical = options.createSvgElement('line');
      barycenterCrossVertical.setAttribute('x1', centerX);
      barycenterCrossVertical.setAttribute('y1', centerY - 8);
      barycenterCrossVertical.setAttribute('x2', centerX);
      barycenterCrossVertical.setAttribute('y2', centerY + 8);
      barycenterCrossVertical.setAttribute('class', 'barycenter-cross');
      svg.appendChild(barycenterCrossVertical);

      const barycenterLabel = options.createSvgElement('text');
      barycenterLabel.setAttribute('x', centerX);
      barycenterLabel.setAttribute('y', centerY + 20);
      barycenterLabel.setAttribute('class', 'barycenter-label');
      barycenterLabel.textContent = t.barycenter_cross || 'Barycenter';
      svg.appendChild(barycenterLabel);

      const trailCaption = options.createSvgElement('text');
      trailCaption.setAttribute('x', centerX);
      trailCaption.setAttribute('y', 312);
      trailCaption.setAttribute('class', 'barycenter-caption');
      trailCaption.textContent = t.barycenter_trail_caption || 'Blue path: Sun-center motion across 50 years';
      svg.appendChild(trailCaption);

      target.appendChild(svg);

      summary.textContent = '';
      syncBarycenterModeButtons();

      let statusText = t.barycenter_status_inside || 'inside the Sun';
      let summaryText = t.barycenter_summary_inside || 'The shared center of mass currently lies inside the solar disk.';
      if (currentSunOffset.distanceAu > sunRadiusAu) {
        statusText = t.barycenter_status_outside || 'outside the Sun';
        summaryText = t.barycenter_summary_outside || 'The shared center of mass currently lies outside the solar disk.';
      }

      options.appendSummaryText(summary, summaryText);
      options.appendSummaryLine(summary, (t.barycenter_mode || 'Influence') + ': ', barycenterModeLabel(currentMode));
      options.appendSummaryLine(summary, (t.barycenter_status || 'Status') + ': ', statusText);
      options.appendSummaryLine(summary, (t.barycenter_offset || 'Offset from Sun center') + ': ', (currentSunOffset.distanceAu / sunRadiusAu).toFixed(2) + ' R☉');
      options.appendSummaryLine(summary, (t.barycenter_trail_span || '50-year span') + ': ', (minTrailDistance / sunRadiusAu).toFixed(2) + '-' + (maxTrailDistance / sunRadiusAu).toFixed(2) + ' R☉');

      const topDrivers = currentSunOffset.contributors.slice(0, 3).map(entry => t['planet_' + entry.key] || entry.key);
      let driverText = t.barycenter_driver_fallback || 'All planets';
      if (topDrivers.length) {
        driverText = topDrivers.join(' · ');
      }
      options.appendSummaryLine(summary, (t.barycenter_main_drivers || 'Main drivers') + ': ', driverText);
    }

    /**
     * Synchronizes the active-state styling of the barycenter influence buttons.
     * @returns {void}
     */
    function syncBarycenterModeButtons(){
      const buttons = options.config.modes;

      buttons.forEach(entry => {
        const button = document.getElementById(entry.id);
        if (!button) {
          return;
        }

        if (entry.mode === mode) {
          button.classList.add('active');
          button.setAttribute('aria-pressed', 'true');
        } else {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        }
      });
    }

    /** Changes only the local influence selection and redraws this card for the current global date.
     * @param {string} selectedMode Existing influence key. @returns {void}
     */
    function setMode(selectedMode){
      mode = selectedMode;
      render(options.getContext());
      options.requestLayout();
    }

    /** Returns the current local influence selection.
     * No parameters. @returns {string} Existing influence key.
     */
    function getMode(){
      return mode;
    }

    /** Wires the retained influence buttons exactly once, preserving the existing blur and redraw behavior.
     * No parameters. @returns {void}
     */
    function init(){
      if (wired) return;
      wired = true;
      const entries = options.config.modes;
      entries.forEach(entry => {
        const button = document.getElementById(entry.id);
        if (!button) return;
        button.addEventListener('click', event => {
          event.preventDefault();
          button.blur();
          setMode(entry.mode);
        });
      });
    }

    return {render, init, setMode, getMode, barycenterScreenPoint, barycenterTrailPath};
  }
  return {create};
})();
