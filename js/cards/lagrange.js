window.PLANETENUHR_LAGRANGE_CARD = (() => {
  'use strict';
  /** Creates the Sun-Earth Lagrange-point renderer from the shared date and schematic model.
   * @param {object} options Document, schematic model, SVG template factory, translations and summary writers.
   * @returns {object} Model or render operations; starts no timers or listeners.
   */
  function create(options){
    const document = options.document;

    /**
     * Renders a schematic Sun-Earth Lagrange-point card for the selected date.
     * The Earth's orbital phase follows the shared date control while the
     * Sun-Earth geometry itself remains didactic rather than strictly to scale.
     * @param {object} context Shared dashboard context with date, location and language.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const t = options.getTranslations();
      const target = document.getElementById('lagrangeMap');
      const summary = document.getElementById('lagrangeSummary');
      if (!target || !summary) {
        return;
      }

      const {size,center,orbitRadius,earthPoint,l1Point,l2Point,l3Point,l4Point,l5Point,directionX,directionY} = options.model.calculateScene(date);

      target.textContent = '';

      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.lagrange_aria || 'Sun-Earth Lagrange points');

      const orbit = options.createSvgElement('circle');
      orbit.setAttribute('cx', center);
      orbit.setAttribute('cy', center);
      orbit.setAttribute('r', orbitRadius);
      orbit.setAttribute('class', 'lagrange-orbit');
      svg.appendChild(orbit);

      const triangleA = options.createSvgElement('line');
      triangleA.setAttribute('x1', center);
      triangleA.setAttribute('y1', center);
      triangleA.setAttribute('x2', l4Point.x);
      triangleA.setAttribute('y2', l4Point.y);
      triangleA.setAttribute('class', 'lagrange-guide');
      svg.appendChild(triangleA);

      const triangleB = options.createSvgElement('line');
      triangleB.setAttribute('x1', earthPoint.x);
      triangleB.setAttribute('y1', earthPoint.y);
      triangleB.setAttribute('x2', l4Point.x);
      triangleB.setAttribute('y2', l4Point.y);
      triangleB.setAttribute('class', 'lagrange-guide');
      svg.appendChild(triangleB);

      const triangleC = options.createSvgElement('line');
      triangleC.setAttribute('x1', center);
      triangleC.setAttribute('y1', center);
      triangleC.setAttribute('x2', l5Point.x);
      triangleC.setAttribute('y2', l5Point.y);
      triangleC.setAttribute('class', 'lagrange-guide');
      svg.appendChild(triangleC);

      const triangleD = options.createSvgElement('line');
      triangleD.setAttribute('x1', earthPoint.x);
      triangleD.setAttribute('y1', earthPoint.y);
      triangleD.setAttribute('x2', l5Point.x);
      triangleD.setAttribute('y2', l5Point.y);
      triangleD.setAttribute('class', 'lagrange-guide');
      svg.appendChild(triangleD);

      const sun = options.createSvgElement('circle');
      sun.setAttribute('cx', center);
      sun.setAttribute('cy', center);
      sun.setAttribute('r', 20);
      sun.setAttribute('class', 'lagrange-sun');
      svg.appendChild(sun);

      const earth = options.createSvgElement('circle');
      earth.setAttribute('cx', earthPoint.x);
      earth.setAttribute('cy', earthPoint.y);
      earth.setAttribute('r', 10);
      earth.setAttribute('class', 'lagrange-earth');
      svg.appendChild(earth);

      const jwst = options.createSvgElement('circle');
      jwst.setAttribute('cx', l2Point.x + directionX * 6);
      jwst.setAttribute('cy', l2Point.y + directionY * 6);
      jwst.setAttribute('r', 4);
      jwst.setAttribute('class', 'lagrange-jwst');
      svg.appendChild(jwst);

      const points = [
        { label:'L1', point:l1Point },
        { label:'L2', point:l2Point },
        { label:'L3', point:l3Point },
        { label:'L4', point:l4Point },
        { label:'L5', point:l5Point }
      ];

      points.forEach(entry => {
        const marker = options.createSvgElement('circle');
        marker.setAttribute('cx', entry.point.x);
        marker.setAttribute('cy', entry.point.y);
        marker.setAttribute('r', 6);
        marker.setAttribute('class', 'lagrange-point');
        svg.appendChild(marker);

        const label = options.createSvgElement('text');
        label.setAttribute('x', entry.point.x);
        label.setAttribute('y', entry.point.y - 12);
        label.setAttribute('class', 'lagrange-label');
        label.textContent = entry.label;
        svg.appendChild(label);
      });

      const sunLabel = options.createSvgElement('text');
      sunLabel.setAttribute('x', center);
      sunLabel.setAttribute('y', center + 38);
      sunLabel.setAttribute('class', 'lagrange-label');
      sunLabel.textContent = t.eclipse_sun || 'Sun';
      svg.appendChild(sunLabel);

      const earthLabel = options.createSvgElement('text');
      earthLabel.setAttribute('x', earthPoint.x);
      earthLabel.setAttribute('y', earthPoint.y + 28);
      earthLabel.setAttribute('class', 'lagrange-label');
      earthLabel.textContent = t.planet_earth || 'Earth';
      svg.appendChild(earthLabel);

      const jwstLabel = options.createSvgElement('text');
      jwstLabel.setAttribute('x', l2Point.x + directionX * 18);
      jwstLabel.setAttribute('y', l2Point.y + directionY * 18);
      jwstLabel.setAttribute('class', 'lagrange-small-label');
      jwstLabel.textContent = 'JWST';
      svg.appendChild(jwstLabel);

      target.appendChild(svg);

      summary.textContent = '';
      options.appendSummaryText(summary, t.lagrange_summary || 'Lagrange points are places where gravity and orbital motion balance so a spacecraft can stay near the Sun-Earth system with relatively little station-keeping.');
      options.appendSummaryLine(summary, (t.lagrange_system || 'System') + ': ', t.lagrange_system_value || 'Sun-Earth');
      options.appendSummaryLine(summary, (t.lagrange_l1l2 || 'L1/L2 distance') + ': ', '~1.5 Mio. km');
      options.appendSummaryLine(summary, (t.lagrange_stable || 'Stable points') + ': ', 'L4 · L5');
      options.appendSummaryLine(summary, (t.lagrange_jwst || 'JWST') + ': ', t.lagrange_jwst_value || 'Halo orbit near L2');
      options.appendSummaryLine(summary, (t.lagrange_jwst_reason || 'Why L2') + ': ', t.lagrange_jwst_reason_value || 'Sun, Earth and Moon stay on one side; deep space stays dark and cold.');
    }

    return {render};
  }
  return {create};
})();
