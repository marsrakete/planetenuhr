window.PLANETENUHR_CONJUNCTION_CARD = (() => {
  'use strict';
  /** Creates the conjunction timeline controller using the existing geocentric model.
   * @param {object} options Document, templates, event provider, labels, language, body visuals and layout adapters.
   * @returns {object} Context renderer and shared pair/angle formatters; starts no timers.
   */
  function create(options){
    const document = options.document;
    const timeline = document && document.getElementById('conjunctionTimeline');
    let renderedTimelineWidth = 0;
    let timelineData = null;

    /** Formats a sky separation with the shared arm’s-length finger/hand estimate.
     * @param {number} degrees Nonnegative angular separation in degrees.
     * @returns {string} Localized degrees and a practical estimate, or empty for invalid input.
     */
    function conjunctionSeparationLabel(degrees){
      const lang = options.getLanguage();
      const t = options.getTranslations();
      if (!Number.isFinite(degrees) || degrees < 0) return '';
      const value = new Intl.NumberFormat(lang, {minimumFractionDigits:1, maximumFractionDigits:1}).format(degrees);
      const estimate = conjunctionEstimateLabel(degrees);
      return value + '° · ' + estimate;
    }

    /** Formats the shared arm's-length comparison for an angular separation.
     * @param {number} degrees Nonnegative angular separation in degrees.
     * @returns {string} Localized finger, thumb or hand estimate.
     */
    function conjunctionEstimateLabel(degrees){
      let estimate = options.altitudeEstimate(degrees);
      if (degrees < 1) estimate = options.getTranslations().angle_estimate_under_finger;
      return estimate;
    }

    /** Formats the localized planet-pair name.
     * @param {string} a First planet key. @param {string} b Second planet key.
     * @returns {string} Pair label.
     */
    function conjunctionPairLabel(a, b){
      return options.bodyDisplayName(a) + ' - ' + options.bodyDisplayName(b);
    }

    /** Formats a three-dimensional position in astronomical units.
     * @param {object} vector Ecliptic vector with x, y and z coordinates.
     * @returns {string} Localized coordinate tuple with unit.
     */
    function formatVector(vector){
      const number = new Intl.NumberFormat(options.getLanguage(), {minimumFractionDigits:9, maximumFractionDigits:9});
      const unit = options.getTranslations().conjunction_calc_au_unit;
      return '(' + number.format(vector.x) + ', ' + number.format(vector.y) + ', ' + number.format(vector.z) + ') ' + unit;
    }

    /** Subtracts one position vector from another.
     * @param {object} left Vector to subtract from.
     * @param {object} right Vector to subtract.
     * @returns {{x:number,y:number,z:number}} Difference vector.
     */
    function subtractVectors(left, right){
      return {x:left.x - right.x, y:left.y - right.y, z:left.z - right.z};
    }

    /** Calculates the cosine term used by the angle formula.
     * @param {object} left First geocentric vector.
     * @param {object} right Second geocentric vector.
     * @returns {number} Clamped cosine of the angle between vectors.
     */
    function separationCosine(left, right){
      const denominator = Math.hypot(left.x, left.y, left.z) * Math.hypot(right.x, right.y, right.z);
      if (!Number.isFinite(denominator) || denominator === 0) return NaN;
      const dotProduct = left.x * right.x + left.y * right.y + left.z * right.z;
      return Math.max(-1, Math.min(1, dotProduct / denominator));
    }

    /** Populates an event's diagram and gives its SVG paint definitions private IDs.
     * @param {HTMLElement} figure Diagram cloned from the calculation event template.
     * @param {object} event Close approach with planet keys a and b.
     * @param {number} index Position of the event in the displayed list.
     * @param {string} eventLabel Localized title with date, pair and angle.
     * @param {string} angleLabel Localized angular distance and practical estimate.
     * @returns {void}
     */
    function renderCalculationDiagram(figure, event, index, eventLabel, angleLabel){
      const t = options.getTranslations();
      const suffix = '-' + index;
      figure.querySelectorAll('[id]').forEach(definition => {
        definition.id += suffix;
      });
      figure.querySelectorAll('[marker-end]').forEach(ray => {
        const marker = ray.getAttribute('marker-end');
        ray.setAttribute('marker-end', marker.slice(0, -1) + suffix + ')');
      });
      figure.style.setProperty('--conjunction-mars-fill', 'url(#conjunctionMarsSurface' + suffix + ')');
      figure.style.setProperty('--conjunction-jupiter-fill', 'url(#conjunctionJupiterClouds' + suffix + ')');
      figure.querySelector('title').textContent = t.conjunction_calc_diagram_title + ' · ' + eventLabel;
      figure.querySelector('desc').textContent = t.conjunction_calc_diagram_desc;
      options.bodyVisuals.mount(figure.querySelector('[data-conjunction-globe="earth"]'), 'earth');
      options.bodyVisuals.mount(figure.querySelector('[data-conjunction-globe="a"]'), event.a);
      options.bodyVisuals.mount(figure.querySelector('[data-conjunction-globe="b"]'), event.b);
      figure.querySelector('[data-conjunction-diagram-earth]').textContent = t.conjunction_calc_earth;
      figure.querySelector('[data-conjunction-diagram-a]').textContent = options.bodyDisplayName(event.a);
      figure.querySelector('[data-conjunction-diagram-b]').textContent = options.bodyDisplayName(event.b);
      figure.querySelector('[data-conjunction-diagram-angle]').textContent = angleLabel;
    }

    /** Writes localized copy, diagrams and coordinate substitutions to the explanation tab.
     * @param {object[]} events Close approaches already calculated for the timeline.
     * @param {number} windowDays Half-width of the displayed window in elapsed days.
     * @returns {void}
     */
    function renderCalculation(events, windowDays){
      const t = options.getTranslations();
      const number = new Intl.NumberFormat(options.getLanguage(), {minimumFractionDigits:6, maximumFractionDigits:6});
      const cosineNumber = new Intl.NumberFormat(options.getLanguage(), {minimumFractionDigits:12, maximumFractionDigits:12});
      const degree = new Intl.NumberFormat(options.getLanguage(), {minimumFractionDigits:1, maximumFractionDigits:1});
      document.querySelector('.conjunction-view-toggle').setAttribute('aria-label', t.conjunction_tabs_label);
      document.getElementById('btnConjunctionEvents').textContent = t.conjunction_tab_events;
      document.getElementById('btnConjunctionCalculation').textContent = t.conjunction_tab_calculation;
      document.getElementById('conjunctionCalculationIntro').textContent = t.conjunction_calc_intro.replace('{days}', String(windowDays));
      document.querySelector('[data-conjunction-flow-elements]').textContent = t.conjunction_calc_flow_elements;
      document.querySelector('[data-conjunction-flow-kepler]').textContent = t.conjunction_calc_flow_kepler;
      document.querySelector('[data-conjunction-flow-position]').textContent = t.conjunction_calc_flow_position;
      document.querySelector('[data-conjunction-heading-elements]').textContent = t.conjunction_calc_elements_heading;
      document.querySelector('[data-conjunction-text-elements]').textContent = t.conjunction_calc_elements_text;
      document.querySelector('[data-conjunction-heading-angle]').textContent = t.conjunction_calc_angle_heading;
      document.querySelector('[data-conjunction-text-angle]').textContent = t.conjunction_calc_angle_text;
      document.getElementById('conjunctionCalculationEventsHeading').textContent = t.conjunction_calc_events_heading;
      document.getElementById('conjunctionCalculationNote').textContent = t.conjunction_calc_note;
      const caption = document.getElementById('conjunctionDiagramCaption');
      caption.textContent = t.conjunction_calc_diagram_caption;
      caption.hidden = events.length === 0;
      document.querySelector('.conjunction-calc-flow').setAttribute('aria-label', t.conjunction_calc_elements_heading + ' · ' + t.conjunction_calc_angle_heading);

      const container = document.getElementById('conjunctionCalculationEvents');
      if (events.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'conjunction-calc-empty';
        empty.textContent = t.conjunction_calc_no_events;
        container.replaceChildren(empty);
        return;
      }

      const eventList = document.createDocumentFragment();
      events.forEach((event, index) => {
        const fragment = document.getElementById('conjunctionCalculationEventTemplate').content.cloneNode(true);
        const article = fragment.querySelector('.conjunction-calc-event');
        const dateLabel = options.formatDate(event.date);
        const angleLabel = conjunctionSeparationLabel(event.separation);
        const eventLabel = conjunctionPairLabel(event.a, event.b) + ' · ' + dateLabel + ' · ' + angleLabel;
        article.querySelector('[data-conjunction-event-title]').textContent = eventLabel;
        renderCalculationDiagram(article.querySelector('.conjunction-calc-diagram'), event, index, eventLabel, angleLabel);
        eventList.appendChild(fragment);

        const eventEarth = options.getHeliocentricPosition('earth', event.date);
        const bodyA = options.getHeliocentricPosition(event.a, event.date);
        const bodyB = options.getHeliocentricPosition(event.b, event.date);
        if (!eventEarth || !bodyA || !bodyB) {
          article.querySelector('.conjunction-calc-details').hidden = true;
          return;
        }
        const vectorA = subtractVectors(bodyA, eventEarth);
        const vectorB = subtractVectors(bodyB, eventEarth);
        const centuries = (options.getJulianDate(event.date) - 2451545.0) / 36525;
        article.querySelector('[data-conjunction-time-value]').textContent = t.conjunction_calc_time_value.replace('{value}', number.format(centuries));
        article.querySelector('[data-conjunction-earth-label]').textContent = t.conjunction_calc_earth + ' · ' + t.conjunction_calc_position_label;
        article.querySelector('[data-conjunction-a-label]').textContent = options.bodyDisplayName(event.a) + ' · ' + t.conjunction_calc_position_label;
        article.querySelector('[data-conjunction-b-label]').textContent = options.bodyDisplayName(event.b) + ' · ' + t.conjunction_calc_position_label;
        article.querySelector('[data-conjunction-earth-vector]').textContent = formatVector(eventEarth);
        article.querySelector('[data-conjunction-a-vector]').textContent = formatVector(bodyA);
        article.querySelector('[data-conjunction-b-vector]').textContent = formatVector(bodyB);
        article.querySelector('[data-conjunction-r-a]').textContent = t.conjunction_calc_vector_a + ' = ' + formatVector(vectorA);
        article.querySelector('[data-conjunction-r-b]').textContent = t.conjunction_calc_vector_b + ' = ' + formatVector(vectorB);
        const cosine = separationCosine(vectorA, vectorB);
        article.querySelector('[data-conjunction-angle-result]').textContent = t.conjunction_calc_angle_substitution
          .replace('{cosine}', cosineNumber.format(cosine))
          .replace('{angle}', degree.format(event.separation))
          .replace('{estimate}', conjunctionEstimateLabel(event.separation));
      });
      container.replaceChildren(eventList);
    }

    /** Activates a conjunction view and optionally moves keyboard focus to its tab.
     * @param {string} view Tab key, either events or calculation.
     * @param {boolean} [focusTab=false] Whether to focus the selected tab.
     * @returns {void}
     */
    function setActiveView(view, focusTab = false){
      const buttons = Array.from(document.querySelectorAll('[data-conjunction-view]'));
      buttons.forEach(button => {
        const selected = button.dataset.conjunctionView === view;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-selected', String(selected));
        if (selected) button.tabIndex = 0;
        else button.tabIndex = -1;
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        panel.hidden = !selected;
        if (selected && focusTab) button.focus();
      });
      if (options.requestLayout) options.requestLayout();
    }

    /** Handles click and arrow-key navigation between the two conjunction tabs.
     * @param {Event} event Mouse or keyboard event from a tab.
     * @returns {void}
     */
    function handleViewNavigation(event){
      const buttons = Array.from(document.querySelectorAll('[data-conjunction-view]'));
      const current = event.target.closest('[data-conjunction-view]');
      if (!current) return;
      if (event.type === 'click') {
        setActiveView(current.dataset.conjunctionView);
        return;
      }
      let index = buttons.indexOf(current);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') index = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') index = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = buttons.length - 1;
      else return;
      event.preventDefault();
      setActiveView(buttons[index].dataset.conjunctionView, true);
    }

    /** Places event labels in rows without changing their positions on the time axis.
     * @param {object[]} labels Rendered labels, connectors and axis positions.
     * @param {number} width Width of the drawing in SVG units.
     * @returns {number} Vertical position of the time axis below the labels.
     */
    function placeTimelineLabels(labels, width){
      const rows = [];
      labels.forEach(entry => {
        const bounds = entry.label.getBBox();
        const left = Math.max(8, Math.min(bounds.x, width - 8 - bounds.width));
        let row = rows.findIndex(right => right + 12 <= left);
        if (row === -1) row = rows.length;
        rows[row] = left + bounds.width;
        const labelX = entry.x + left - bounds.x;
        const labelY = 24 + row * 40;
        entry.lines.forEach(line => line.setAttribute('x', labelX));
        entry.label.setAttribute('transform', 'translate(0 ' + labelY + ')');
        entry.stem.setAttribute('y1', labelY + 21);
      });
      return Math.max(48, rows.length * 40 + 20);
    }

    /** Draws the timeline at the available width to keep SVG labels at their CSS font sizes.
     * @param {Date} date Center date of the time window.
     * @param {object[]} events Chronological close approaches in the window.
     * @param {number} windowDays Half-width of the window in elapsed days.
     * @returns {void}
     */
    function renderTimeline(date, events, windowDays){
      renderedTimelineWidth = timeline.clientWidth;
      const width = renderedTimelineWidth || 300;
      const axisInset = 16;
      const axisWidth = width - axisInset * 2;
      const svg = options.createSvgElement('svg');
      const axis = options.createSvgElement('line');
      axis.setAttribute('x1', axisInset);
      axis.setAttribute('x2', width - axisInset);
      axis.setAttribute('stroke', '#94a3b8');
      axis.setAttribute('stroke-width', '1.5');
      svg.appendChild(axis);

      const stems = options.createSvgElement('g');
      svg.appendChild(stems);
      const labels = [];
      events.forEach(event => {
        const x = axisInset + (event.offsetDays + windowDays) / (2 * windowDays) * axisWidth;
        const group = document.getElementById('conjunctionEventTemplate').content.querySelector('g').cloneNode(true);
        group.dataset.pair = event.a + '-' + event.b;
        group.dataset.date = event.date.toISOString();
        group.dataset.separation = event.separation;
        const pairLabel = conjunctionPairLabel(event.a, event.b);
        const angleLabel = conjunctionSeparationLabel(event.separation);
        group.querySelector('title').textContent = pairLabel + ' · ' + options.formatDate(event.date) + ' · ' + angleLabel;
        const stem = group.querySelector('line');
        stem.setAttribute('x1', x);
        stem.setAttribute('x2', x);
        stems.appendChild(stem);
        const dot = group.querySelector('circle');
        dot.setAttribute('cx', x);
        const label = group.querySelector('text');
        const pairLine = label.querySelector('[data-conjunction-pair]');
        const angleLine = label.querySelector('[data-conjunction-angle]');
        pairLine.setAttribute('x', x);
        angleLine.setAttribute('x', x);
        pairLine.textContent = pairLabel;
        angleLine.textContent = angleLabel;
        labels.push({label, lines:[pairLine, angleLine], stem, dot, x});
        svg.appendChild(group);
      });
      timeline.replaceChildren(svg);
      const axisY = placeTimelineLabels(labels, width);
      axis.setAttribute('y1', axisY);
      axis.setAttribute('y2', axisY);
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + (axisY + 43));
      labels.forEach(({stem, dot}) => {
        stem.setAttribute('y2', axisY);
        dot.setAttribute('cy', axisY);
      });

      let tickIntervals = 2;
      if (width >= 520) tickIntervals = 4;
      for (let index = 0; index <= tickIntervals; index++) {
        const fraction = index / tickIntervals;
        const offset = -windowDays + 2 * windowDays * fraction;
        const x = axisInset + fraction * axisWidth;
        const tick = document.getElementById('conjunctionTickTemplate').content.querySelector('g').cloneNode(true);
        const line = tick.querySelector('line');
        line.setAttribute('x1', x);
        line.setAttribute('x2', x);
        line.setAttribute('y1', axisY - 8);
        line.setAttribute('y2', axisY + 9);
        if (fraction === 0.5) {
          line.setAttribute('stroke', '#2563eb');
          line.setAttribute('stroke-width', '2');
        }
        const label = tick.querySelector('text');
        label.setAttribute('x', x);
        label.setAttribute('y', axisY + 29);
        const tickDate = new Date(date.getTime() + offset * 86400000);
        if (width < 280 && fraction === 0.5) {
          label.textContent = tickDate.toLocaleDateString(options.getLanguage(), {day:'numeric',month:'numeric'});
        } else {
          label.textContent = options.formatDate(tickDate);
        }
        if (index === 0) label.classList.add('is-start');
        else if (index === tickIntervals) label.classList.add('is-end');
        svg.insertBefore(tick, stems);
      }
    }

    /** Redraws only the timeline after its available width changes.
     * @returns {void}
     */
    function resizeTimeline(){
      if (timelineData && timeline.clientWidth > 0 && timeline.clientWidth !== renderedTimelineWidth) {
        const {date, events, windowDays} = timelineData;
        renderTimeline(date, events, windowDays);
        if (options.requestLayout) options.requestLayout();
      }
    }

    /** Updates the chart, the summary and the explanation for the selected date.
     * @param {object} context Shared dashboard context with its selected date.
     * @returns {void}
     */
    function render(context){
      if (!timeline) return;
      const date = context.date;
      const t = options.getTranslations();
      const summary = document.getElementById('conjunctionSummary');
      const windowDays = 60;
      const events = options.getEvents(date, windowDays);
      timelineData = {date, events, windowDays};
      renderTimeline(date, events, windowDays);

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
      renderCalculation(events, windowDays);
    }

    if (document) {
      const viewToggle = document.querySelector('.conjunction-view-toggle');
      if (viewToggle) {
        viewToggle.addEventListener('click', handleViewNavigation);
        viewToggle.addEventListener('keydown', handleViewNavigation);
      }
    }
    if (timeline) {
      new ResizeObserver(resizeTimeline).observe(timeline);
    }
    return {render, conjunctionSeparationLabel, conjunctionPairLabel};
  }
  return {create};
})();
