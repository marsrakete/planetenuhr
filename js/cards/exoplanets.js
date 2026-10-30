window.PLANETENUHR_EXOPLANETS_CARD = (() => {
  'use strict';
  /** Creates the configured exoplanet comparison renderer with template-based mini-maps.
   * @param {object} options Document, system configuration provider, position model, templates, translations and summary/date formatters.
   * @returns {object} Model or render operations; starts no timers or listeners.
   */
  function create(options){
    const document = options.document;

    /**
     * Builds the SVG mini-map for one exoplanet system panel.
     * Each panel uses its own normalized outer orbit so very compact and very
     * wide systems stay readable next to each other.
     * @param {object} system Exoplanet system configuration entry.
     * @param {Date} date Selected dashboard date.
     * @param {number} systemIndex Stable index used only for label staggering.
     * @returns {SVGElement} Finished schematic SVG element.
     */
    function createExoplanetSystemSvg(system, date, systemIndex){
      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', '0 0 220 220');
      svg.setAttribute('aria-hidden', 'true');

      const centerX = 110;
      const centerY = 110;
      const glow = options.createSvgElement('circle');
      glow.setAttribute('cx', centerX);
      glow.setAttribute('cy', centerY);
      glow.setAttribute('r', 20);
      glow.setAttribute('class', 'exoplanet-star-glow');
      svg.appendChild(glow);

      const star = options.createSvgElement('circle');
      star.setAttribute('cx', centerX);
      star.setAttribute('cy', centerY);
      star.setAttribute('r', 9);
      star.setAttribute('class', 'exoplanet-star');
      star.setAttribute('fill', system.color || '#f59e0b');
      svg.appendChild(star);

      system.planets.forEach((planet, planetIndex) => {
        const {orbitRadius,x,y} = options.model.planetState(system, planet, date, systemIndex, planetIndex);
        const orbit = options.createSvgElement('circle');
        orbit.setAttribute('cx', centerX);
        orbit.setAttribute('cy', centerY);
        orbit.setAttribute('r', orbitRadius);
        orbit.setAttribute('class', 'exoplanet-orbit');
        svg.appendChild(orbit);

        const body = options.createSvgElement('circle');
        body.setAttribute('cx', x);
        body.setAttribute('cy', y);
        body.setAttribute('r', 4.4);
        body.setAttribute('class', 'exoplanet-planet');
        body.setAttribute('fill', system.color || '#2563eb');
        svg.appendChild(body);

        const label = options.createSvgElement('text');
        label.setAttribute('x', x);
        label.setAttribute('y', y - 8);
        label.setAttribute('class', 'exoplanet-planet-label');
        label.textContent = planet.name;
        svg.appendChild(label);
      });

      return svg;
    }

    /**
     * Renders the exoplanet comparison card with several normalized system panels.
     * The selected date advances the schematic orbital phases so the card feels
     * alive without claiming precise exoplanet ephemerides.
     * @param {object} context Shared dashboard date/language/location context.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const t = options.getTranslations();
      const target = document.getElementById('exoplanetComparison');
      const summary = document.getElementById('exoplanetSummary');
      if (!target || !summary) {
        return;
      }

      target.textContent = '';
      summary.textContent = '';

      const systems = options.getSystems() || [];
      if (!systems.length) {
        options.appendSummaryText(summary, t.exoplanets_none || 'No exoplanet systems configured.');
        return;
      }

      systems.forEach((system, systemIndex) => {
        const fragment = options.cloneTemplate('exoplanetSystemTemplate');
        if (!fragment) {
          return;
        }

        const nameNode = fragment.querySelector('[data-exoplanet-name]');
        const metaNode = fragment.querySelector('[data-exoplanet-meta]');
        const mapNode = fragment.querySelector('[data-exoplanet-map]');
        const captionNode = fragment.querySelector('[data-exoplanet-caption]');

        if (nameNode) {
          nameNode.textContent = system.name;
        }
        if (metaNode) {
          metaNode.textContent = system.starType + ' · ' + system.distanceLy + ' ly';
        }
        if (mapNode) {
          mapNode.appendChild(createExoplanetSystemSvg(system, date, systemIndex));
        }
        if (captionNode) {
          captionNode.textContent = system.planets.length + ' ' + (t.exoplanets_planets || 'planets') + ' · ' + (t.exoplanets_outer_orbit || 'outer orbit') + ' ' + system.maxOrbitAu + ' AU';
        }

        target.appendChild(fragment);
      });

      options.appendSummaryText(summary, t.exoplanets_summary || 'These mini-systems compare how tightly packed or widely spread selected exoplanet families are. Each panel uses its own scale.');
      options.appendSummaryLine(summary, (t.exoplanets_systems || 'Systems') + ': ', String(systems.length));
      options.appendSummaryLine(summary, (t.exoplanets_focus || 'Compact example') + ': ', t.exoplanets_focus_value || 'TRAPPIST-1: all seven known planets orbit well inside Mercury.');
      options.appendSummaryLine(summary, (t.exoplanets_wide || 'Wide example') + ': ', t.exoplanets_wide_value || 'HR 8799: giant planets spread across a region wider than the outer Solar System planets.');
      options.appendSummaryLine(summary, (t.today || 'Today') + ': ', options.formatDate(date));
    }

    return {render, createExoplanetSystemSvg};
  }
  return {create};
})();
