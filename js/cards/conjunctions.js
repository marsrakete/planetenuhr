window.PLANETENUHR_CONJUNCTION_CARD = (() => {
  'use strict';
  /** Creates the conjunction timeline controller using the existing geocentric model.
   * @param {object} options Document, templates, event provider, labels, language and layout adapters.
   * @returns {object} Context renderer and shared pair/angle formatters; starts no timers.
   */
  function create(options){
    const document = options.document;

    /** Formats a sky separation with the shared arm’s-length finger/hand estimate.
     * @param {number} degrees Nonnegative angular separation in degrees.
     * @returns {string} Localized degrees and a practical estimate, or empty for invalid input.
     */
    function conjunctionSeparationLabel(degrees){
      const lang = options.getLanguage();
      const t = options.getTranslations();
      if (!Number.isFinite(degrees) || degrees < 0) return '';
      const value = new Intl.NumberFormat(lang, {minimumFractionDigits:1, maximumFractionDigits:1}).format(degrees);
      let estimate = options.altitudeEstimate(degrees);
      if (degrees < 1) estimate = t.angle_estimate_under_finger;
      return value + '° · ' + estimate;
    }

    /** Formats the localized planet-pair name.
     * @param {string} a First planet key. @param {string} b Second planet key.
     * @returns {string} Pair label.
     */
    function conjunctionPairLabel(a, b){
      return options.bodyDisplayName(a) + ' - ' + options.bodyDisplayName(b);
    }

    /** Renders geocentric close-approach minima on a correctly dated timeline.
     * @param {object} context Shared dashboard context with its selected date.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const t = options.getTranslations();
      const target = document.getElementById('conjunctionTimeline');
      const summary = document.getElementById('conjunctionSummary');
      if (!target) return;
      const windowDays = 60;
      const events = options.getEvents(date, windowDays);
      const width = 760;
      const height = 172;
      target.innerHTML = '';
      const svg = options.createSvgElement('svg');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      const axis = options.createSvgElement('line');
      axis.setAttribute('x1', 30);
      axis.setAttribute('y1', 92);
      axis.setAttribute('x2', width - 30);
      axis.setAttribute('y2', 92);
      axis.setAttribute('stroke', '#cbd5e1');
      axis.setAttribute('stroke-width', '2');
      svg.appendChild(axis);

      for (let index = 0; index <= 4; index++) {
        const offset = -windowDays + index * windowDays / 2;
        const x = 30 + index / 4 * (width - 60);
        const tick = document.getElementById('conjunctionTickTemplate').content.querySelector('g').cloneNode(true);
        const line = tick.querySelector('line');
        line.setAttribute('x1', x);
        line.setAttribute('x2', x);
        if (index === 2) {
          line.setAttribute('stroke', '#2563eb');
          line.setAttribute('stroke-width', '2');
        }
        const tickDate = new Date(date.getTime() + offset * 86400000);
        const label = tick.querySelector('text');
        label.setAttribute('x', x);
        label.textContent = options.formatDate(tickDate);
        if (index === 0) label.classList.add('is-start');
        else if (index === 4) label.classList.add('is-end');
        svg.appendChild(tick);
      }

      events.forEach((event, index) => {
        const x = 30 + ((event.offsetDays + windowDays) / (windowDays * 2)) * (width - 60);
        let y = 50;
        if (index % 2 === 0) y = 74;
        const group = document.getElementById('conjunctionEventTemplate').content.querySelector('g').cloneNode(true);
        group.dataset.pair = event.a + '-' + event.b;
        group.dataset.date = event.date.toISOString();
        group.dataset.separation = event.separation;
        group.querySelector('title').textContent = conjunctionPairLabel(event.a, event.b) + ' · ' + options.formatDate(event.date) + ' · ' + conjunctionSeparationLabel(event.separation);
        const stem = group.querySelector('line');
        stem.setAttribute('x1', x);
        stem.setAttribute('x2', x);
        stem.setAttribute('y1', y + 6);
        const dot = group.querySelector('circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        const label = group.querySelector('text');
        label.setAttribute('x', x);
        const pairLine = label.querySelector('[data-conjunction-pair]');
        const angleLine = label.querySelector('[data-conjunction-angle]');
        pairLine.setAttribute('x', x);
        pairLine.setAttribute('y', y - 36);
        pairLine.textContent = conjunctionPairLabel(event.a, event.b);
        angleLine.setAttribute('x', x);
        angleLine.setAttribute('y', y - 22);
        angleLine.textContent = conjunctionSeparationLabel(event.separation);
        svg.appendChild(group);
      });
      target.appendChild(svg);
      // Keep both label lines inside the chart, including events near its edges.
      svg.querySelectorAll('.conjunction-event text').forEach(label => {
        const bounds = label.getBBox();
        let shift = 0;
        if (bounds.x < 8) shift = 8 - bounds.x;
        else if (bounds.x + bounds.width > width - 8) shift = width - 8 - bounds.x - bounds.width;
        if (shift !== 0) {
          label.querySelectorAll('tspan').forEach(line => {
            line.setAttribute('x', Number(line.getAttribute('x')) + shift);
          });
        }
      });

      if (summary) {
        summary.innerHTML = '';
        const next = events.find(event => event.date >= date);
        if (next) {
          options.appendSummaryLine(summary, (t.conjunction_next || 'Next conjunction') + ': ', options.formatDate(next.date) + ' · ' + conjunctionPairLabel(next.a, next.b));
          options.appendSummaryLine(summary, (t.conjunction_separation || 'Separation') + ': ', conjunctionSeparationLabel(next.separation));
          options.appendSummaryLine(summary, (t.conjunction_window || 'Window') + ': ', options.formatDate(new Date(date.getTime() - windowDays * 86400000)) + ' - ' + options.formatDate(new Date(date.getTime() + windowDays * 86400000)));
        } else {
          options.appendSummaryText(summary, t.conjunction_none || 'No close conjunction found in the current window.');
        }
      }
    }

    return {render, conjunctionSeparationLabel, conjunctionPairLabel};
  }
  return {create};
})();
