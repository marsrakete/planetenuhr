window.PLANETENUHR_METEOR_CARD = (() => {
  'use strict';
  /** Creates the dated meteor calendar and schematic radiant controller.
   * @param {object} options Document, streams, language, date/geometry helpers, templates and layout adapters.
   * @returns {object} Context renderer, radiant renderer and name formatter; starts no timers.
   */
  function create(options){
    const document = options.document;

    /** Returns the active language's meteor shower name.
     * @param {object} stream Configured shower with a stable key and fallback name.
     * @returns {string} Localized shower name.
     */
    function meteorStreamName(stream){
      const t = options.getTranslations();
      return t['meteor_stream_' + stream.key] || stream.name;
    }

    /** Renders dated activity arcs, named peak callouts and the radiant overview.
     * @param {object} context Shared dashboard context with selected date and language.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const lang = context.language;
      const t = options.getTranslations();
      const target = document.getElementById('meteorMap');
      const summary = document.getElementById('meteorSummary');
      if (!target) return;
      const size = 420;
      const center = size / 2;
      const radius = 100;
      const yearDays = options.daysInYear(date.getFullYear());
      const todayFraction = (options.dayOfYear(date) - 1) / yearDays;
      target.innerHTML = '';

      const svg = options.createSvgElement('svg');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.meteor_aria || 'Meteor shower activity through the year');

      const base = options.createSvgElement('circle');
      base.setAttribute('cx', center);
      base.setAttribute('cy', center);
      base.setAttribute('r', radius);
      base.setAttribute('fill', 'none');
      base.setAttribute('stroke', '#e5e7eb');
      base.setAttribute('stroke-width', '14');
      svg.appendChild(base);

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(date.getFullYear(), month, 1);
        const fraction = (options.dayOfYear(monthStart) - 1) / yearDays;
        const tickStart = options.polarPoint(center, radius + 2, fraction);
        const tickEnd = options.polarPoint(center, radius + 8, fraction);
        const tick = options.createSvgElement('line');
        tick.setAttribute('x1', tickStart.x);
        tick.setAttribute('y1', tickStart.y);
        tick.setAttribute('x2', tickEnd.x);
        tick.setAttribute('y2', tickEnd.y);
        tick.setAttribute('class', 'meteor-month-tick');
        svg.appendChild(tick);

        const labelPoint = options.polarPoint(center, radius + 16, fraction);
        const monthLabel = options.createSvgElement('text');
        monthLabel.setAttribute('x', labelPoint.x);
        monthLabel.setAttribute('y', labelPoint.y);
        monthLabel.setAttribute('class', 'meteor-month-label');
        monthLabel.textContent = new Intl.DateTimeFormat(lang, { month:'short' }).format(monthStart).replace('.', '');
        svg.appendChild(monthLabel);
      }

      const active = [];
      const streamLabels = [];
      options.getStreams().forEach((stream, index) => {
        let start = (options.monthDayToDayOfYear(stream.start, date.getFullYear()) - 1) / yearDays;
        let end = (options.monthDayToDayOfYear(stream.end, date.getFullYear()) - 1) / yearDays;
        const peak = (options.monthDayToDayOfYear(stream.peak, date.getFullYear()) - 1) / yearDays;
        const wraps = end < start;
        let inWindow = todayFraction >= start && todayFraction <= end;
        if (wraps) {
          inWindow = todayFraction >= start || todayFraction <= end;
        }
        if (inWindow) active.push(stream);

        const arc = options.createSvgElement('path');
        arc.setAttribute('d', options.svgArcPath(center, radius - (index % 3) * 16, start, end));
        arc.setAttribute('class', 'meteor-arc');
        arc.setAttribute('stroke', stream.color || '#2563eb');
        const title = options.createSvgElement('title');
        title.textContent = meteorStreamName(stream) + ' · ' + options.monthDayLabel(stream.start, date.getFullYear()) + '-' + options.monthDayLabel(stream.end, date.getFullYear()) + ' · ' + t.meteor_radiant_peak + ' ' + options.monthDayLabel(stream.peak, date.getFullYear());
        arc.appendChild(title);
        svg.appendChild(arc);

        const peakPoint = options.polarPoint(center, radius - (index % 3) * 16, peak);
        const peakMark = options.createSvgElement('circle');
        peakMark.setAttribute('cx', peakPoint.x);
        peakMark.setAttribute('cy', peakPoint.y);
        let peakRadius = 3.5;
        if (inWindow) {
          peakRadius = 5;
        }
        peakMark.setAttribute('r', peakRadius);
        peakMark.setAttribute('class', 'meteor-peak');
        peakMark.setAttribute('fill', stream.color || '#2563eb');
        svg.appendChild(peakMark);
        streamLabels.push({key:stream.key, name:meteorStreamName(stream), color:stream.color || '#2563eb', x:peakPoint.x, y:peakPoint.y});
      });

      const today = options.polarPoint(center, radius + 9, todayFraction);
      const now = options.createSvgElement('circle');
      now.setAttribute('cx', today.x);
      now.setAttribute('cy', today.y);
      now.setAttribute('r', 6);
      now.setAttribute('class', 'meteor-today');
      const nowTitle = options.createSvgElement('title');
      nowTitle.textContent = (t.today || 'Today') + ': ' + options.formatDate(date);
      now.appendChild(nowTitle);
      svg.appendChild(now);

      target.appendChild(svg);
      options.renderLabels(svg, streamLabels);

      if (summary) {
        const next = options.getStreams()
          .map(stream => ({ stream, peakDay:options.monthDayToDayOfYear(stream.peak, date.getFullYear()) }))
          .map(item => ({ ...item, delta:item.peakDay - options.dayOfYear(date) }))
          .map(item => {
            if (item.delta < 0) {
              return { ...item, delta:item.delta + yearDays, year:date.getFullYear() + 1 };
            }
            return { ...item, year:date.getFullYear() };
          })
          .sort((a,b) => a.delta - b.delta)[0];
        let activeNames = t.none || 'None';
        if (active.length) {
          activeNames = active.map(item => meteorStreamName(item)).join(', ');
        }
        let nextPeakText = '-';
        if (next) {
          nextPeakText = meteorStreamName(next.stream) + ' · ' + options.monthDayLabel(next.stream.peak, next.year);
        }
        summary.innerHTML = '';
        options.appendSummaryText(summary, t.meteor_explain || 'This is a calendar circle, not sky directions.');
        options.appendSummaryLine(summary, (t.today || 'Today') + ': ', options.formatDate(date));
        options.appendSummaryLine(summary, (t.meteor_active || 'Active now') + ': ', activeNames);
        options.appendSummaryLine(summary, (t.meteor_next_peak || 'Next peak') + ': ', nextPeakText);
      }
      renderMeteorRadiants(date, active);
      options.requestLayout();
    }

    /**
     * Renders the schematic radiant map with localized shower names in its details.
     * @param {Date} date Dashboard date used to select the next annual maximum.
     * @param {object[]} activeStreams Configured showers active on the selected date.
     * @returns {void}
     */
    function renderMeteorRadiants(date, activeStreams){
      const t = options.getTranslations();
      const target = document.getElementById('meteorRadiants');
      if (!target) return;
      const streams = options.getStreams();
      const activeKeys = new Set((activeStreams || []).map(stream => stream.key));
      const yearDays = options.daysInYear(date.getFullYear());
      const today = options.dayOfYear(date);
      const next = streams
        .map(stream => ({ stream, peakDay:options.monthDayToDayOfYear(stream.peak, date.getFullYear()) }))
        .map(item => ({ ...item, delta:item.peakDay - today }))
        .map(item => {
          if (item.delta < 0) {
            return { ...item, delta:item.delta + yearDays };
          }
          return item;
        })
        .sort((a,b) => a.delta - b.delta)[0]?.stream;
      if (next) activeKeys.add(next.key);

      const size = 140;
      const center = size / 2;
      const fragment = options.cloneTemplate('meteorRadiantsTemplate');
      const map = fragment.querySelector('.meteor-radiant-map');
      map.className = 'meteor-radiant-map';
      const svg = options.createSvgElement('svg');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.meteor_radiants_aria || 'Meteor shower radiant directions');
      const horizon = options.createSvgElement('circle');
      horizon.setAttribute('cx', center);
      horizon.setAttribute('cy', center);
      horizon.setAttribute('r', 58);
      horizon.setAttribute('fill', 'none');
      horizon.setAttribute('stroke', '#cbd5e1');
      horizon.setAttribute('stroke-width', '1');
      svg.appendChild(horizon);
      [
        ['N', center, 11], ['E', size - 10, center + 4], ['S', center, size - 7], ['W', 10, center + 4]
      ].forEach(([label, x, y]) => {
        const el = options.createSvgElement('text');
        el.setAttribute('x', x);
        el.setAttribute('y', y);
        el.setAttribute('class', 'meteor-radiant-label');
        el.textContent = label;
        svg.appendChild(el);
      });

      streams.forEach(stream => {
        const angle = (stream.radiantAngle || 0) * Math.PI / 180 - Math.PI / 2;
        const altitude = Math.max(10, Math.min(80, stream.radiantAltitude || 45));
        const radius = 58 * (1 - altitude / 90);
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const dot = options.createSvgElement('circle');
        const isActive = activeKeys.has(stream.key);
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        let dotRadius = 3.2;
        let dotClass = 'meteor-radiant-dot';
        if (isActive) {
          dotRadius = 5;
        } else {
          dotClass += ' inactive';
        }
        dot.setAttribute('r', dotRadius);
        dot.setAttribute('class', dotClass);
        dot.setAttribute('fill', stream.color || '#2563eb');
        const title = options.createSvgElement('title');
        title.textContent = meteorStreamName(stream) + ' · ' + (stream.radiant || '') + ' · ' + (t.meteor_radiant_peak || 'Peak') + ' ' + options.monthDayLabel(stream.peak, date.getFullYear());
        dot.appendChild(title);
        svg.appendChild(dot);
      });
      map.appendChild(svg);

      const copy = fragment.querySelector('.meteor-radiant-copy');
      copy.className = 'meteor-radiant-copy';
      const headline = copy.querySelector('strong');
      headline.textContent = t.meteor_radiants_title || 'Radiants';
      const explanation = copy.querySelector('[data-meteor-explanation]');
      explanation.textContent = t.meteor_radiants_explain || 'Dots show the apparent origin in the sky; active and next peak are highlighted.';
      const nextLine = copy.querySelector('[data-meteor-next]');
      if (next) {
        nextLine.textContent = (t.meteor_radiants_next || 'Next highlighted') + ': ' + meteorStreamName(next) + ' (' + next.radiant + ')';
      } else {
        nextLine.textContent = '';
      }
      copy.append(headline, explanation, nextLine);

      target.innerHTML = '';
      target.append(map, copy);
    }

    return {render, renderMeteorRadiants, meteorStreamName};
  }
  return {create};
})();
