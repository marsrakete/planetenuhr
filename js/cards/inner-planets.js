window.PLANETENUHR_INNER_PLANETS_CARD = (() => {
  'use strict';
  let nextDisc = 0;
  /** Creates the inner-planet card with template-based phase discs.
   * @param {object} options Document, template cloning, shared body artwork, phase model, configured body provider, translations and display-name formatter.
   * @returns {object} Model or controller operations with no timers or persistent storage.
   */
  function create(options){
    const document = options.document;

    /** Places the calculated night side over the shared globe in the phase-disc template.
     * @param {number} illumination Illuminated percent. @param {boolean} evening Selects the lit side.
     * @param {string} key Planet artwork key. @returns {SVGElement} Independent phase disc.
     */
    function renderDisc(illumination, evening, key){
      const svg = options.cloneTemplate('planetPhaseDiscTemplate').querySelector('svg');
      svg.removeAttribute('xmlns');
      options.artwork.mountScaled(svg.querySelector('[data-phase-artwork]'), key, 38);
      const gradient = svg.querySelector('[data-phase-night-gradient]');
      gradient.id = 'planet-phase-night-' + (++nextDisc);
      const night = svg.querySelector('[data-phase-night]');
      night.setAttribute('fill', 'url(#' + gradient.id + ')');
      night.setAttribute('d', options.model.phaseDiscPath(100 - illumination, !evening));
      return svg;
    }

    /** Renders the configured inner planets with the shared selected date.
     * @param {object} context Shared dashboard context. @returns {void}
     */
    function render(context){
      const date = context.date;
      const t = options.getTranslations();
      const panel = document.getElementById('innerPhasesPanel');
      const cardTemplate = document.getElementById('planetPhaseCardTemplate');
      if (!panel) return;
      if (!cardTemplate) return;
      panel.innerHTML = '';
      (options.getBodies() || ['mercury','venus']).forEach(key => {
        const info = options.model.planetIlluminationData(key, date);
        const fragment = cardTemplate.content.cloneNode(true);
        const card = fragment.querySelector('.planet-phase-card');
        let skyText = t.phase_morning || 'Morning star';
        if (info.evening) {
          skyText = t.phase_evening || 'Evening star';
        }
        card.querySelector('[data-phase-name]').textContent = options.bodyDisplayName(key);
        card.querySelector('[data-phase-visual]').appendChild(renderDisc(info.illumination, info.evening, key));
        card.querySelector('[data-phase-sky]').textContent = skyText;
        card.querySelector('[data-phase-illum-label]').textContent = (t.phase_illumination || 'Illumination') + ':';
        card.querySelector('[data-phase-illum-value]').textContent = info.illumination + '%';
        card.querySelector('[data-phase-elongation-label]').textContent = (t.phase_elongation || 'Elongation') + ':';
        card.querySelector('[data-phase-elongation-value]').textContent = Math.abs(info.elongation).toFixed(1) + '°';
        card.querySelector('[data-phase-distance-value]').textContent = info.distanceAu.toFixed(2);
        panel.appendChild(fragment);
      });
    }

    return {render, renderDisc};
  }
  return {create};
})();
