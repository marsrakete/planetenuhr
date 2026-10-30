window.PLANETENUHR_INNER_PLANETS_CARD = (() => {
  'use strict';
  /** Creates the inner-planet card with template-based phase discs.
   * @param {object} options Document, template cloning, phase model, configured body provider, translations and display-name formatter.
   * @returns {object} Model or controller operations with no timers or persistent storage.
   */
  function create(options){
    const document = options.document;

    /** Clones the fixed phase-disc template and fills its terminator and color.
     * @param {number} illumination Illuminated percent. @param {boolean} evening Selects the lit side.
     * @param {string} color Configured planet color. @returns {SVGElement} Independent phase disc.
     */
    function renderDisc(illumination, evening, color){
      const svg = options.cloneTemplate('planetPhaseDiscTemplate').querySelector('svg');
      svg.removeAttribute('xmlns');
      const path = svg.querySelector('path');
      path.setAttribute('d', options.model.phaseDiscPath(illumination, evening));
      path.setAttribute('fill', color);
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
        let color = '#fbbf24';
        if (key === 'venus') {
          color = '#fde68a';
        }
        let skyText = t.phase_morning || 'Morning star';
        if (info.evening) {
          skyText = t.phase_evening || 'Evening star';
        }
        card.querySelector('[data-phase-name]').textContent = options.bodyDisplayName(key);
        card.querySelector('[data-phase-visual]').appendChild(renderDisc(info.illumination, info.evening, color));
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
