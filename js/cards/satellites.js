window.PLANETENUHR_SATELLITES_CARD = (() => {
  'use strict';
  /** Creates the schematic mean-orbit satellite card and its existing summary/fallback states.
   * @param {object} options Document, satellite configuration provider, orbit model, templates, translations and summary writer.
   * @returns {object} Model or render operations; starts no timers or listeners.
   */
  function create(options){
    const document = options.document;

    /** Renders the configured mean satellite ellipses and summary using the shared selected date.
     * @param {object} context Shared dashboard context. @returns {void}
     */
    function render(context){
      const date = context.date;
      const t = options.getTranslations();
      const target = document.getElementById('satelliteMap');
      const summary = document.getElementById('satelliteSummary');
      if (!target) return;
      const size = 420;
      const center = size / 2;
      const maxRadius = 165;
      const earthRadius = 34;
      target.innerHTML = '';
      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      const earth = options.createSvgElement('circle');
      earth.setAttribute('cx', center);
      earth.setAttribute('cy', center);
      earth.setAttribute('r', earthRadius);
      earth.setAttribute('fill', '#2586d7');
      svg.appendChild(earth);

      (options.getSatellites() || []).forEach((sat, index) => {
        const {radius,ry,x,y} = options.model.orbitState(sat, index, date, {center,earthRadius,maxRadius});
        const orbit = options.createSvgElement('ellipse');
        orbit.setAttribute('cx', center);
        orbit.setAttribute('cy', center);
        orbit.setAttribute('rx', Math.min(maxRadius, radius));
        orbit.setAttribute('ry', Math.max(20, Math.abs(ry)));
        orbit.setAttribute('fill', 'none');
        orbit.setAttribute('stroke', '#cbd5e1');
        orbit.setAttribute('stroke-width', '1.4');
        orbit.setAttribute('transform', `rotate(${sat.raanDeg || 0} ${center} ${center})`);
        svg.appendChild(orbit);

        const marker = options.createSvgElement('circle');
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', 6);
        marker.setAttribute('fill', sat.color || '#2563eb');
        marker.setAttribute('stroke', '#fff');
        marker.setAttribute('stroke-width', '2');
        svg.appendChild(marker);

        const label = options.createSvgElement('text');
        let labelXOffset = -10;
        if (x >= center) {
          labelXOffset = 10;
        }
        let labelYOffset = -12;
        if (y >= center) {
          labelYOffset = 12;
        }
        label.setAttribute('x', Math.max(28, Math.min(size - 28, x + labelXOffset)));
        label.setAttribute('y', Math.max(18, Math.min(size - 18, y + labelYOffset)));
        let labelAnchor = 'end';
        if (x >= center) {
          labelAnchor = 'start';
        }
        label.setAttribute('text-anchor', labelAnchor);
        label.setAttribute('class', 'spacecraft-label');
        label.textContent = sat.name;
        svg.appendChild(label);
      });
      target.appendChild(svg);
      if (summary) {
        const itemTemplate = document.getElementById('satelliteSummaryItemTemplate');
        summary.innerHTML = '';
        options.appendSummaryText(summary, t.satellites_note || 'Approximate orbit positions, not live TLE tracking');
        const grid = options.cloneTemplate('satelliteSummaryGridTemplate').firstElementChild;
        (options.getSatellites() || []).forEach(sat => {
          if (!itemTemplate) {
            const fallback = options.cloneTemplate('satelliteSummaryFallbackTemplate').firstElementChild;
            fallback.querySelector('strong').textContent = sat.name;
            const breaks = fallback.querySelectorAll('br');
            breaks[0].after(document.createTextNode((t.satellites_altitude || 'Altitude') + ': ' + sat.altitudeKm + ' km'));
            breaks[1].after(document.createTextNode((t.satellites_period || 'Period') + ': ' + sat.periodMin.toFixed(1) + ' min'));
            breaks[2].after(document.createTextNode((t.satellites_inclination || 'Inclination') + ': ' + sat.inclinationDeg + '°'));
            grid.appendChild(fallback);
            return;
          }
          const fragment = itemTemplate.content.cloneNode(true);
          fragment.querySelector('[data-satellite-name]').textContent = sat.name;
          fragment.querySelector('[data-satellite-altitude]').textContent = (t.satellites_altitude || 'Altitude') + ': ' + sat.altitudeKm + ' km';
          fragment.querySelector('[data-satellite-period]').textContent = (t.satellites_period || 'Period') + ': ' + sat.periodMin.toFixed(1) + ' min';
          fragment.querySelector('[data-satellite-inclination]').textContent = (t.satellites_inclination || 'Inclination') + ': ' + sat.inclinationDeg + '°';
          grid.appendChild(fragment);
        });
        summary.appendChild(grid);
      }
    }

    return {render};
  }
  return {create};
})();
