window.PLANETENUHR_RETROGRADE_CARD = (() => {
  'use strict';
  /** Creates the retrograde card from the pure motion model and retained HTML/SVG templates.
   * @param {object} options Document, template cloning, retrograde model, planet list, translations and name/date/meter formatters.
   * @returns {object} Operations without timers, event listeners or global selection ownership.
   */
  function create(options){
    const document = options.document;

    /** Formats the signed daily-motion value with the existing fixed decimal precision.
     * @param {number} value Motion in degrees per day. @returns {string} Signed one-decimal degree value.
     */
    function fmtDegrees(value){
      let prefix = '';
      if (value >= 0) {
        prefix = '+';
      }
      return prefix + value.toFixed(1) + '°';
    }

    /** Clones and fills the track SVG without building markup strings.
     * @param {string} key Planet key used for the existing arrow id.
     * @param {object} path Sampled model result. @returns {SVGElement} Track with station and current-point markers.
     */
    function renderPath(key, path){
      const svg = options.cloneTemplate('retrogradePathTemplate').querySelector('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', '0 0 ' + path.width + ' ' + path.height);
      const markerId = 'retroArrow-' + key;
      svg.querySelector('marker').setAttribute('id', markerId);
      const tracks = svg.querySelectorAll(':scope > path');
      tracks[0].setAttribute('d', path.path);
      tracks[1].setAttribute('d', path.path);
      tracks[1].setAttribute('marker-end', 'url(#' + markerId + ')');
      path.stationMarkers.forEach(point => {
        const node = options.cloneTemplate('retrogradeStationTemplate').querySelector('circle');
        node.setAttribute('cx', point[0].toFixed(1));
        node.setAttribute('cy', point[1].toFixed(1));
        svg.appendChild(node);
      });
      if (path.currentPoint) {
        const node = options.cloneTemplate('retrogradeCurrentTemplate').querySelector('circle');
        node.setAttribute('cx', path.currentPoint[0].toFixed(1));
        node.setAttribute('cy', path.currentPoint[1].toFixed(1));
        svg.appendChild(node);
      }
      return svg;
    }

    /** Renders configured planetary motion, nearest stations and sampled tracks from one selected date.
     * @param {object} context Shared dashboard context with selected date. @returns {void}
     */
    function render(context){
      const date = context.date;
      const t = options.getTranslations();
      const panel = document.getElementById('retrogradePanel');
      const rowTemplate = document.getElementById('retrogradeRowTemplate');
      if (!panel) return;
      if (!rowTemplate) return;
      panel.innerHTML = '';
      const bodies = (options.getBodies() || ['mercury','venus','mars','jupiter','saturn']).slice(0, 7);
      bodies.forEach(key => {
        const motion = options.model.apparentDailyMotion(key, date);
        const isRetro = motion < 0;
        const station = options.model.findNearestStationDate(key, date);
        const speedPct = options.clamp01(Math.abs(motion) / 1.4);
        const path = options.model.samplePath(key, date);
        const rowFragment = rowTemplate.content.cloneNode(true);
        const row = rowFragment.querySelector('.retro-row');
        let retroBadgeClass = 'retro-badge';
        let retroBadgeText = t.retrograde_direct || 'Direct';
        if (isRetro) {
          retroBadgeClass += ' retro';
          retroBadgeText = t.retrograde_retrograde || 'Retrograde';
        }
        let stationText = t.retrograde_none || 'No nearby station';
        if (station) {
          stationText = options.formatDate(station.date);
        }

        row.querySelector('[data-retro-name]').textContent = options.bodyDisplayName(key);

        const badge = row.querySelector('[data-retro-badge]');
        badge.className = retroBadgeClass;
        badge.textContent = retroBadgeText;

        row.querySelector('[data-retro-path]').appendChild(renderPath(key, path));

        row.querySelector('[data-retro-meter]').style.width = `${Math.max(12, speedPct * 100)}%`;

        row.querySelector('[data-retro-motion]').textContent = `${fmtDegrees(motion)}/d`;
        row.querySelector('[data-retro-station]').textContent = `${t.retrograde_station || 'Nearest station'}: ${stationText}`;

        panel.appendChild(rowFragment);
      });
    }

    return {render, renderPath};
  }
  return {create};
})();
