window.PLANETENUHR_CONSTELLATION_YEAR = (() => {
  'use strict';
  /** Creates the annual constellation wheel with its existing enlarged miniatures and date marker.
   * @param {object} options Document, templates, configured constellations, translations and existing formatting/layout helpers.
   * @returns {object} Context renderer and local helpers; starts no timers or event listeners.
   */
  function create(options){
    const document = options.document;
    // Draw the annual constellation wheel:
    // - one configured constellation per month
    // - month labels inside the ring
    // - miniature line figures outside the ring
    // - a current-date marker along the yearly cycle
    //
    /**
     * Renders the yearly constellation wheel.
     * This is a visual month-by-month orientation aid, not a literal sky
     * projection. The card emphasizes the annual cycle of constellations with
     * month ticks, an outer instrument ring and a current-date marker. Miniatures
     * use twice their original diameter, spaced outside the compact month rings.
     * @param {object} context Shared dashboard context with selected date and language.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const lang = context.language;
      const t = options.getTranslations();
      const target = document.getElementById('constellationYearMap');
      const summary = document.getElementById('constellationYearSummary');
      if (!target) return;
      const items = options.getItems() || [];
      const size = 760;
      const center = size / 2;
      const radius = 176;
      const miniatureOrbit = 270;
      target.innerHTML = '';
      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

      const defs = options.createSvgElement('defs');
      const dialGradient = options.createSvgElement('radialGradient');
      dialGradient.setAttribute('id', 'constellationYearDialGradient');
      dialGradient.setAttribute('cx', '50%');
      dialGradient.setAttribute('cy', '46%');
      dialGradient.setAttribute('r', '72%');
      [
        { offset:'0%', color:'#ffffff' },
        { offset:'68%', color:'#f7fbff' },
        { offset:'100%', color:'#edf4ff' }
      ].forEach(stopConfig => {
        const stop = options.createSvgElement('stop');
        stop.setAttribute('offset', stopConfig.offset);
        stop.setAttribute('stop-color', stopConfig.color);
        dialGradient.appendChild(stop);
      });
      defs.appendChild(dialGradient);
      svg.appendChild(defs);

      const dial = options.createSvgElement('circle');
      dial.setAttribute('cx', center);
      dial.setAttribute('cy', center);
      dial.setAttribute('r', radius + 74);
      dial.setAttribute('class', 'constellation-year-dial');
      svg.appendChild(dial);

      const outerRing = options.createSvgElement('circle');
      outerRing.setAttribute('cx', center);
      outerRing.setAttribute('cy', center);
      outerRing.setAttribute('r', radius + 18);
      outerRing.setAttribute('class', 'constellation-year-outer-ring');
      svg.appendChild(outerRing);

      const ring = options.createSvgElement('circle');
      ring.setAttribute('cx', center);
      ring.setAttribute('cy', center);
      ring.setAttribute('r', radius);
      ring.setAttribute('class', 'constellation-year-month-ring');
      svg.appendChild(ring);

      const innerRing = options.createSvgElement('circle');
      innerRing.setAttribute('cx', center);
      innerRing.setAttribute('cy', center);
      innerRing.setAttribute('r', 118);
      innerRing.setAttribute('class', 'constellation-year-inner-ring');
      svg.appendChild(innerRing);

      for (let tickIndex = 0; tickIndex < 12; tickIndex++) {
        const tickFraction = tickIndex / 12;
        const tickStart = options.polarPoint(center, radius + 6, tickFraction);
        const tickEnd = options.polarPoint(center, radius + 24, tickFraction);
        const tick = options.createSvgElement('line');
        tick.setAttribute('x1', tickStart.x);
        tick.setAttribute('y1', tickStart.y);
        tick.setAttribute('x2', tickEnd.x);
        tick.setAttribute('y2', tickEnd.y);
        tick.setAttribute('class', 'constellation-year-tick');
        svg.appendChild(tick);
      }

      items.forEach(item => {
        const fraction = (item.month - 1) / 12;
        const point = options.polarPoint(center, radius, fraction);
        const marker = options.createSvgElement('circle');
        marker.setAttribute('cx', point.x);
        marker.setAttribute('cy', point.y);
        const isCurrentMonth = date.getMonth() + 1 === item.month;
        let markerRadius = 4.5;
        let markerFill = '#94a3b8';
        if (isCurrentMonth) {
          markerRadius = 7;
          markerFill = '#2563eb';
        }
        marker.setAttribute('r', markerRadius);
        marker.setAttribute('fill', markerFill);
        svg.appendChild(marker);

        const monthPoint = options.polarPoint(center, 96, fraction);
        const monthLabel = options.createSvgElement('text');
        monthLabel.setAttribute('x', monthPoint.x);
        monthLabel.setAttribute('y', monthPoint.y);
        monthLabel.setAttribute('class', 'constellation-month-label');
        monthLabel.textContent = options.monthShortLabel(item.month - 1).replace('.', '');
        svg.appendChild(monthLabel);

        const miniPoint = options.polarPoint(center, miniatureOrbit, fraction);
        const mini = document.getElementById('constellationYearMiniTemplate').content.querySelector('g').cloneNode(true);
        mini.setAttribute('transform', `translate(${miniPoint.x} ${miniPoint.y})`);
        const figure = mini.querySelector('[data-constellation-figure]');

        (item.lines || []).forEach(([fromIndex, toIndex]) => {
          const from = item.stars && item.stars[fromIndex];
          const to = item.stars && item.stars[toIndex];
          if (!from || !to) return;
          const line = document.getElementById('constellationYearLineTemplate').content.querySelector('line').cloneNode(true);
          line.setAttribute('x1', ((from[0] - 50) * 0.34).toFixed(1));
          line.setAttribute('y1', ((from[1] - 50) * 0.34).toFixed(1));
          line.setAttribute('x2', ((to[0] - 50) * 0.34).toFixed(1));
          line.setAttribute('y2', ((to[1] - 50) * 0.34).toFixed(1));
          figure.appendChild(line);
        });

        (item.stars || []).forEach((star, starIndex) => {
          const starNode = document.getElementById('constellationYearStarTemplate').content.querySelector('circle').cloneNode(true);
          starNode.setAttribute('cx', ((star[0] - 50) * 0.34).toFixed(1));
          starNode.setAttribute('cy', ((star[1] - 50) * 0.34).toFixed(1));
          const isCurrentLeadStar = isCurrentMonth && starIndex === 0;
          let starRadius = '2.1';
          let starClass = 'constellation-mini-star';
          if (isCurrentLeadStar) {
            starRadius = '2.8';
            starClass += ' current';
          }
          starNode.setAttribute('r', starRadius);
          starNode.setAttribute('class', starClass);
          figure.appendChild(starNode);
        });

        const namePoint = options.polarPoint(center, 362, fraction);
        const angle = fraction * Math.PI * 2 - Math.PI / 2;
        const topBottomBias = Math.sin(angle);
        const horizontalBias = Math.cos(angle);
        const isSideLabel = item.name === 'Bootes' || item.name === 'Andromeda';
        let rawLabelX = namePoint.x;
        if (horizontalBias > 0.34) {
          rawLabelX += 10;
        } else if (horizontalBias < -0.34) {
          rawLabelX -= 10;
        }

        let rawLabelY = namePoint.y;
        if (isSideLabel) {
          rawLabelY = 310;
        } else if (topBottomBias < -0.82) {
          rawLabelY += 10;
        } else if (topBottomBias > 0.82) {
          rawLabelY -= 8;
        }

        const labelX = Math.max(38, Math.min(size - 38, rawLabelX));
        const labelY = Math.max(24, Math.min(size - 24, rawLabelY));
        const label = options.createSvgElement('text');
        let textAnchor = 'middle';
        if (horizontalBias > 0.32) {
          textAnchor = 'start';
        } else if (horizontalBias < -0.32) {
          textAnchor = 'end';
        }

        let dominantBaseline = 'middle';
        if (topBottomBias < -0.82) {
          dominantBaseline = 'hanging';
        } else if (topBottomBias > 0.82) {
          dominantBaseline = 'auto';
        }

        label.setAttribute('x', labelX.toFixed(1));
        label.setAttribute('y', labelY.toFixed(1));
        label.setAttribute('class', 'constellation-name-label');
        label.setAttribute('text-anchor', textAnchor);
        label.setAttribute('dominant-baseline', dominantBaseline);
        label.textContent = item.name;
        svg.appendChild(label);
        svg.appendChild(mini);
      });

      const fraction = (options.dayOfYearLocal(date) - 1) / options.daysInYear(date.getFullYear());
      const todayPoint = options.polarPoint(center, radius - 22, fraction);
      const today = options.createSvgElement('circle');
      today.setAttribute('cx', todayPoint.x);
      today.setAttribute('cy', todayPoint.y);
      today.setAttribute('r', 10);
      today.setAttribute('fill', '#f59e0b');
      today.setAttribute('stroke', '#fff');
      today.setAttribute('stroke-width', '2');
      svg.appendChild(today);

      const sunCore = options.createSvgElement('circle');
      sunCore.setAttribute('cx', center);
      sunCore.setAttribute('cy', center);
      sunCore.setAttribute('r', 18);
      sunCore.setAttribute('fill', '#fbbf24');
      sunCore.setAttribute('stroke', '#f59e0b');
      sunCore.setAttribute('stroke-width', '2');
      svg.appendChild(sunCore);

      target.appendChild(svg);

      // Clamp using rendered glyph bounds; long names must stay inside the wheel.
      svg.querySelectorAll('.constellation-name-label').forEach(label => {
        const bounds = label.getBBox();
        let shift = 0;
        if (bounds.x < 8) {
          shift = 8 - bounds.x;
        } else if (bounds.x + bounds.width > size - 8) {
          shift = size - 8 - bounds.x - bounds.width;
        }
        label.setAttribute('x', Number(label.getAttribute('x')) + shift);
      });

      const current = items.find(item => item.month === date.getMonth() + 1);
      if (summary) {
        let currentName = '-';
        let currentHighlight = '';

        if (current) {
          currentName = current.name;
          if (current.highlight) {
            if (typeof current.highlight === 'object') {
              currentHighlight = current.highlight[lang] || current.highlight.en || '';
            } else {
              currentHighlight = current.highlight;
            }
          }
        }

        summary.innerHTML = '';
        options.appendSummaryLine(summary, (t.constellation_year_current || 'Current month focus') + ': ', currentName);
        options.appendSummaryText(summary, currentHighlight);
      }
    }

    return {render};
  }
  return {create};
})();
