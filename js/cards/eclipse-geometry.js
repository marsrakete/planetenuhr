window.PLANETENUHR_ECLIPSE_GEOMETRY_CARD = (() => {
  'use strict';

  /** Creates the eclipse geometry renderer with the dashboard's shared models.
   * @param {object} dependencies DOM, eclipse models, visibility helpers and summary helper.
   * @returns {{render:Function}} Renderer accepting the selected dashboard context.
   */
  function create(dependencies){
    const document = dependencies.document;
    const window = dependencies.window;
    const t = dependencies.getTranslations();

    /** Gets curated visibility information for the selected location.
     * @param {Date} date Selected observation date.
     * @param {object} location Selected location.
     * @returns {object|null} Local eclipse visibility or null when unavailable.
     */
    function eclipseVisibilityForLocation(date, location){
      return dependencies.getEclipseVisibility(date, location);
    }

    /** Gets the localized visibility label for a date and location.
     * @param {Date} date Selected observation date.
     * @param {object} location Selected location.
     * @returns {string} Localized visibility text or an empty string.
     */
    function eclipseVisibilityLocationText(date, location){
      return dependencies.getVisibilityText(date, location);
    }

    /** Appends a summary paragraph using the shared dashboard renderer.
     * @param {Element} target Destination popup.
     * @param {string} text Plain summary text.
     * @returns {void} No value.
     */
    function appendSummaryText(target, text){
      dependencies.appendSummaryText(target, text);
    }
    /** Renders eclipse geometry and location visibility for the selected context.
     * @param {object} context Selected date and location.
     * @returns {void} No value.
     */
    function render(context){
      const date = context.date;
      const location = context.location;
      const target = document.getElementById('eclipseGeometryMap');
      const status = document.getElementById('eclipseGeometryStatus');
      if (!target) return;
      const localVisibility = eclipseVisibilityForLocation(date, location);
      const m = window.PLANETENUHR_MOON_MODEL.computeMoon(date);
      const node = window.PLANETENUHR_ECLIPSE_MODEL.moonNodeDistance(date);
      const nearNew = Math.min(m.frac, 1 - m.frac);
      const nearFull = Math.abs(m.frac - 0.5);
      const phaseNear = Math.min(nearNew, nearFull);
      const isSolarSide = nearNew <= nearFull;
      const nodePct = Math.min(1, node.distanceDays / 4.5);
      const phasePct = Math.min(1, phaseNear / 0.08);
      const chance = Math.max(0, Math.round((1 - Math.max(nodePct, phasePct)) * 100));
      const sizeW = 320;
      const sizeH = 120;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + sizeW + ' ' + sizeH);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.eclipse_geometry_aria || 'Eclipse geometry');

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', 34);
      line.setAttribute('y1', 60);
      line.setAttribute('x2', 286);
      line.setAttribute('y2', 60);
      line.setAttribute('stroke', '#cbd5e1');
      line.setAttribute('stroke-width', '3');
      svg.appendChild(line);

      const nodeBandGlow = document.createElementNS(svgNS, 'ellipse');
      nodeBandGlow.setAttribute('cx', 160);
      nodeBandGlow.setAttribute('cy', 60);
      nodeBandGlow.setAttribute('rx', 38);
      nodeBandGlow.setAttribute('ry', 33);
      let nodeBandGlowFill = 'rgba(148,163,184,.10)';
      if (chance > 35) {
        nodeBandGlowFill = 'rgba(59,130,246,.10)';
      }
      nodeBandGlow.setAttribute('fill', nodeBandGlowFill);
      svg.appendChild(nodeBandGlow);

      const nodeBand = document.createElementNS(svgNS, 'ellipse');
      nodeBand.setAttribute('cx', 160);
      nodeBand.setAttribute('cy', 60);
      nodeBand.setAttribute('rx', 29);
      nodeBand.setAttribute('ry', 25);
      let nodeBandFill = 'rgba(148,163,184,.14)';
      let nodeBandStroke = '#94a3b8';
      if (chance > 35) {
        nodeBandFill = 'rgba(37,99,235,.20)';
        nodeBandStroke = '#60a5fa';
      }
      nodeBand.setAttribute('fill', nodeBandFill);
      nodeBand.setAttribute('stroke', nodeBandStroke);
      nodeBand.setAttribute('stroke-width', '2');
      svg.appendChild(nodeBand);

      const nodeAxis = document.createElementNS(svgNS, 'line');
      nodeAxis.setAttribute('x1', 160);
      nodeAxis.setAttribute('y1', 28);
      nodeAxis.setAttribute('x2', 160);
      nodeAxis.setAttribute('y2', 92);
      let nodeAxisStroke = 'rgba(100,116,139,.46)';
      if (chance > 35) {
        nodeAxisStroke = 'rgba(37,99,235,.7)';
      }
      nodeAxis.setAttribute('stroke', nodeAxisStroke);
      nodeAxis.setAttribute('stroke-width', '2');
      nodeAxis.setAttribute('stroke-dasharray', '3 4');
      svg.appendChild(nodeAxis);

      const sun = document.createElementNS(svgNS, 'circle');
      sun.setAttribute('cx', 50);
      sun.setAttribute('cy', 60);
      sun.setAttribute('r', 15);
      sun.setAttribute('fill', '#f8b43c');
      svg.appendChild(sun);

      const earth = document.createElementNS(svgNS, 'circle');
      earth.setAttribute('cx', 160);
      earth.setAttribute('cy', 60);
      earth.setAttribute('r', 13);
      earth.setAttribute('fill', '#2586d7');
      svg.appendChild(earth);

      const orbit = document.createElementNS(svgNS, 'ellipse');
      orbit.setAttribute('cx', 160);
      orbit.setAttribute('cy', 60);
      orbit.setAttribute('rx', 68);
      orbit.setAttribute('ry', 22);
      orbit.setAttribute('fill', 'none');
      orbit.setAttribute('stroke', 'rgba(100,116,139,.42)');
      orbit.setAttribute('stroke-width', '1.5');
      orbit.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(orbit);

      const orbitLabel = document.createElementNS(svgNS, 'text');
      orbitLabel.setAttribute('x', 160);
      orbitLabel.setAttribute('y', 104);
      orbitLabel.setAttribute('text-anchor', 'middle');
      orbitLabel.setAttribute('class', 'season-declination-label');
      orbitLabel.textContent = t.eclipse_orbit || 'Moon orbit';
      svg.appendChild(orbitLabel);

      let baseAngle = 0;
      if (isSolarSide) {
        baseAngle = Math.PI;
      }
      let orbitDirection = 1;
      if (node.phase < 0.5) {
        orbitDirection = -1;
      }
      const orbitAngle = baseAngle + orbitDirection * nodePct * 1.08;
      const moonX = 160 + Math.cos(orbitAngle) * 68;
      const moonY = 60 + Math.sin(orbitAngle) * 22;
      let moonGlowRadius = 7;
      let moonGlowFill = 'rgba(148,163,184,.07)';
      if (chance >= 55) {
        moonGlowRadius = 12;
        moonGlowFill = 'rgba(59,130,246,.16)';
      } else if (chance >= 25) {
        moonGlowRadius = 9;
        moonGlowFill = 'rgba(148,163,184,.12)';
      }
      const moonGlow = document.createElementNS(svgNS, 'circle');
      moonGlow.setAttribute('cx', moonX);
      moonGlow.setAttribute('cy', moonY);
      moonGlow.setAttribute('r', moonGlowRadius);
      moonGlow.setAttribute('fill', moonGlowFill);
      svg.appendChild(moonGlow);

      let moonFill = '#cbd5e1';
      let moonStroke = '#475569';
      let moonStrokeWidth = '1';
      if (chance >= 55) {
        moonFill = '#60a5fa';
        moonStroke = '#1d4ed8';
        moonStrokeWidth = '1.5';
      } else if (chance >= 25) {
        moonFill = '#f7c84b';
      }
      const moon = document.createElementNS(svgNS, 'circle');
      moon.setAttribute('cx', moonX);
      moon.setAttribute('cy', moonY);
      moon.setAttribute('r', 7);
      moon.setAttribute('fill', moonFill);
      moon.setAttribute('stroke', moonStroke);
      moon.setAttribute('stroke-width', moonStrokeWidth);
      svg.appendChild(moon);

      [
        [50, 92, t.eclipse_sun || 'Sun'],
        [160, 92, t.eclipse_earth || 'Earth'],
        [moonX, moonY - 12, t.eclipse_moon || 'Moon'],
        [160, 31, t.eclipse_node_zone || 'Node zone']
      ].forEach(([x, y, label]) => {
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'season-declination-label');
        text.textContent = label;
        svg.appendChild(text);
      });
      target.appendChild(svg);

      if (status) {
        const hasEclipseGeometry = phasePct < 1 && nodePct < 1 && chance >= 12;
        let type = t.eclipse_none_possible || 'no eclipse geometry today';
        if (hasEclipseGeometry) {
          if (isSolarSide) {
            type = t.eclipse_solar_possible || 'solar eclipse geometry';
          } else {
            type = t.eclipse_lunar_possible || 'lunar eclipse geometry';
          }
        }
        let statusText = type + '. '
          + (t.eclipse_node_distance || 'Node distance') + ': ' + node.distanceDays.toFixed(1) + ' d.';
        const locationText = eclipseVisibilityLocationText(date, location);
        if (locationText) {
          let approximationNote = t.eclipse_visibility_approx_short || 'Global sketch, local visibility simplified.';
          if (localVisibility && localVisibility.source === 'fallback') {
            approximationNote = t.eclipse_visibility_region_short || 'Global sketch, local visibility from broad NASA region.';
          }
          statusText += ' ' + locationText + ' ' + approximationNote;
        }
        status.textContent = statusText;
      }

      const infoPopup = document.getElementById('eclipseInfoPopup');
      if (infoPopup) {
        infoPopup.innerHTML = '';
        appendSummaryText(infoPopup, (t.eclipse_geometry_explain || 'The sketch shows Sun, Earth and Moon along the eclipse line; the blue zone marks where the Moon should cross the node region.')
          + ' ' + (t.eclipse_geometry_hint || 'Eclipses need new/full moon near a lunar node.'));
        let approximationNote = t.eclipse_visibility_approx_note || 'The city visibility is a simplified event-based estimate; the sketch itself remains a global geometry view.';
        if (localVisibility && localVisibility.source === 'fallback') {
          approximationNote = t.eclipse_visibility_region_note || 'This visibility comes from a broad NASA region match for the selected city; the sketch itself remains a global geometry view.';
        }
        appendSummaryText(infoPopup, approximationNote);
        const legendRow = document.createElement('div');
        legendRow.style.marginTop = '8px';
        legendRow.textContent = t.eclipse_geometry_legend || 'Blue Moon = high eclipse proximity; pale Moon = low eclipse proximity.';
        infoPopup.appendChild(legendRow);
      }
    }
    return {render};
  }

  return {create};
})();
