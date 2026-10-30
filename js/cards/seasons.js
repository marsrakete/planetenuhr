window.PLANETENUHR_SEASONS = (() => {
  'use strict';
  /** Creates the schematic seasons card using the existing date and geometry helpers.
   * @param {object} options Document, template/SVG cloning, translations, local day/year geometry, summary writers and layout callback.
   * @returns {object} Operations without timers, event listeners or global selection ownership.
   */
  function create(options){
    const document = options.document;

    /** Resolves the existing approximate northern-season label for a fraction of the year.
     * @param {number} fraction Year fraction. @returns {string} Localized season label.
     */
    function seasonNameForFraction(fraction){
      const t = options.getTranslations();
      if (fraction < 0.22) return t.season_winter || 'Winter';
      if (fraction < 0.47) return t.season_spring || 'Spring';
      if (fraction < 0.72) return t.season_summer || 'Summer';
      if (fraction < 0.97) return t.season_autumn || 'Autumn';
      return t.season_winter || 'Winter';
    }

    /** Renders the existing schematic orbit, axial-tilt inset and seasonal summary.
     * @param {object} context Shared dashboard context with selected date and language. @returns {void}
     */
    function render(context){
      const date = context.date;
      const lang = context.language;
      const t = options.getTranslations();
      const target = document.getElementById('seasonMap');
      const summary = document.getElementById('seasonSummary');
      if (!target) return;
      const size = 420;
      const center = size / 2;
      const radius = 135;
      const fraction = (options.dayOfYearLocal(date) - 1) / options.daysInYear(date.getFullYear());
      const declination = 23.44 * Math.sin(2 * Math.PI * (options.dayOfYearLocal(date) - 80) / options.daysInYear(date.getFullYear()));
      const earth = options.polarPoint(center, radius, fraction);
      target.innerHTML = '';

      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.season_aria || 'Earth orbit and axial tilt');
      const defs = options.cloneTemplate('seasonDefinitionsTemplate').querySelector('defs');

      svg.appendChild(defs);

      const orbit = options.createSvgElement('circle');
      orbit.setAttribute('cx', center);
      orbit.setAttribute('cy', center);
      orbit.setAttribute('r', radius);
      orbit.setAttribute('class', 'season-orbit');
      svg.appendChild(orbit);

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(date.getFullYear(), month, 1);
        const monthFraction = (options.dayOfYearLocal(monthStart) - 1) / options.daysInYear(date.getFullYear());
        const tickStart = options.polarPoint(center, radius - 4, monthFraction);
        const tickEnd = options.polarPoint(center, radius + 9, monthFraction);
        const tick = options.createSvgElement('line');
        tick.setAttribute('x1', tickStart.x);
        tick.setAttribute('y1', tickStart.y);
        tick.setAttribute('x2', tickEnd.x);
        tick.setAttribute('y2', tickEnd.y);
        tick.setAttribute('class', 'season-month-tick');
        svg.appendChild(tick);

        const labelPoint = options.polarPoint(center, radius + 23, monthFraction);
        const monthLabel = options.createSvgElement('text');
        monthLabel.setAttribute('x', labelPoint.x);
        monthLabel.setAttribute('y', labelPoint.y);
        monthLabel.setAttribute('class', 'season-month-label');
        monthLabel.textContent = new Intl.DateTimeFormat(lang, { month:'short' }).format(monthStart).replace('.', '');
        svg.appendChild(monthLabel);
      }

      const sun = options.createSvgElement('circle');
      sun.setAttribute('cx', center);
      sun.setAttribute('cy', center);
      sun.setAttribute('r', 20);
      sun.setAttribute('fill', '#f8b43c');
      svg.appendChild(sun);
      const marker = options.createSvgElement('circle');
      marker.setAttribute('cx', earth.x);
      marker.setAttribute('cy', earth.y);
      marker.setAttribute('r', 17);
      marker.setAttribute('class', 'season-earth');
      svg.appendChild(marker);

      const orbitLabel = options.createSvgElement('text');
      orbitLabel.setAttribute('x', center);
      orbitLabel.setAttribute('y', 28);
      orbitLabel.setAttribute('class', 'season-label');
      orbitLabel.textContent = t.season_orbit_view || 'Orbit view';
      svg.appendChild(orbitLabel);

      const sideGroup = options.createSvgElement('g');
      sideGroup.setAttribute('transform', 'translate(290 282)');
      const sidePanel = options.createSvgElement('circle');
      sidePanel.setAttribute('cx', 0);
      sidePanel.setAttribute('cy', 0);
      sidePanel.setAttribute('r', 72);
      sidePanel.setAttribute('fill', 'rgba(255,255,255,.72)');
      sidePanel.setAttribute('stroke', '#e5e7eb');
      sidePanel.setAttribute('stroke-width', '1');
      sideGroup.appendChild(sidePanel);

      [-22, 0, 22].forEach(y => {
        const ray = options.createSvgElement('line');
        ray.setAttribute('x1', -58);
        ray.setAttribute('y1', y);
        ray.setAttribute('x2', -9);
        ray.setAttribute('y2', y);
        ray.setAttribute('class', 'season-sunray');
        sideGroup.appendChild(ray);
      });

      const sideEarth = options.createSvgElement('ellipse');
      sideEarth.setAttribute('cx', 18);
      sideEarth.setAttribute('cy', 0);
      sideEarth.setAttribute('rx', 20);
      sideEarth.setAttribute('ry', 24);
      sideEarth.setAttribute('class', 'season-earth');
      sideGroup.appendChild(sideEarth);

      const sideNight = options.createSvgElement('path');
      sideNight.setAttribute('d', 'M 18 -24 A 20 24 0 0 1 18 24 Z');
      sideNight.setAttribute('class', 'season-night');
      sideGroup.appendChild(sideNight);

      const axisAngle = -declination * Math.PI / 180;
      const axisLength = 62;
      const sideAxis = options.createSvgElement('line');
      const northX = 18 + Math.sin(axisAngle) * axisLength / 2;
      const northY = -Math.cos(axisAngle) * axisLength / 2;
      const southX = 18 - Math.sin(axisAngle) * axisLength / 2;
      const southY = Math.cos(axisAngle) * axisLength / 2;
      sideAxis.setAttribute('x1', southX);
      sideAxis.setAttribute('y1', southY);
      sideAxis.setAttribute('x2', northX);
      sideAxis.setAttribute('y2', northY);
      sideAxis.setAttribute('class', 'season-axis');
      sideGroup.appendChild(sideAxis);

      const northPole = options.createSvgElement('circle');
      northPole.setAttribute('cx', northX);
      northPole.setAttribute('cy', northY);
      northPole.setAttribute('r', 3.5);
      northPole.setAttribute('class', 'season-axis-pole');
      sideGroup.appendChild(northPole);

      const northLabel = options.createSvgElement('text');
      let northLabelX = northX + 9;
      if (northX < 18) {
        northLabelX = northX - 9;
      }
      northLabel.setAttribute('x', northLabelX);
      northLabel.setAttribute('y', northY - 4);
      northLabel.setAttribute('class', 'season-declination-label');
      northLabel.textContent = 'N';
      sideGroup.appendChild(northLabel);

      const tiltText = options.createSvgElement('text');
      tiltText.setAttribute('x', 0);
      tiltText.setAttribute('y', 56);
      tiltText.setAttribute('class', 'season-label');
      let tiltDirection = t.season_south || 'S';
      if (declination >= 0) {
        tiltDirection = t.season_north || 'N';
      }
      tiltText.textContent = (t.season_tilt_view || 'Sun angle') + ': ' + Math.abs(declination).toFixed(1) + '° ' + tiltDirection;
      sideGroup.appendChild(tiltText);
      svg.appendChild(sideGroup);
      target.appendChild(svg);

      if (summary) {
        let solarTiltCopy = t.season_toward_south || 'toward northern hemisphere';
        if (declination >= 0) {
          solarTiltCopy = t.season_toward_north || 'toward northern hemisphere';
        } else {
          solarTiltCopy = t.season_toward_south || 'toward southern hemisphere';
        }
        summary.innerHTML = '';
        options.appendSummaryText(summary, t.season_explain || 'Top-down orbit plus oblique inset for axial tilt.');
        options.appendSummaryText(summary, t.season_cause || 'Summer and winter happen because Earth’s tilted axis changes the Sun height and daylight length.');
        options.appendSummaryLine(summary, (t.season_current || 'Current season') + ': ', seasonNameForFraction(fraction));
        options.appendSummaryLine(summary, (t.season_progress || 'Year progress since Jan 1') + ': ', Math.round(fraction * 100) + '%');
        options.appendSummaryLine(summary, (t.season_solar_tilt || 'Solar tilt') + ': ', Math.abs(declination).toFixed(1) + '° ' + solarTiltCopy);
      }
      options.requestMasonryLayout();
    }

    return {render, seasonNameForFraction};
  }
  return {create};
})();
