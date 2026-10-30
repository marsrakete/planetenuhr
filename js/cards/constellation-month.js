window.PLANETENUHR_CONSTELLATION_MONTH = (() => {
  'use strict';
  /** Creates the monthly constellation chart, star labels and schematic direction hint.
   * @param {object} options Document, templates, configured constellations, translations and existing formatting/layout helpers.
   * @returns {object} Context renderer and local helpers; starts no timers or event listeners.
   */
  function create(options){
    const document = options.document;
    /**
     * Berechnet den geometrischen Mittelpunkt eines Sternbilds in SVG-Koordinaten.
     * @param {number[][]} stars Sternpositionen als Prozentwerte [x, y].
     * @param {number} size SVG-Kantenlaenge in Pixeln.
     * @returns {{x:number, y:number}} Mittelpunkt der Sternverteilung.
     */
    function calculateConstellationCenter(stars, size){
      if (!Array.isArray(stars) || stars.length === 0) {
        return { x: size / 2, y: size / 2 };
      }

      let sumX = 0;
      let sumY = 0;

      stars.forEach(star => {
        sumX += star[0] / 100 * size;
        sumY += star[1] / 100 * size;
      });

      return {
        x: sumX / stars.length,
        y: sumY / stars.length
      };
    }

    /**
     * Baut die Darstellungsdaten fuer ein Sternlabel auf.
     * Nutzt bevorzugt explizite Konfigurationswerte und faellt sonst auf
     * eine automatische Positionierung nach aussen weg vom Sternbildzentrum zurueck.
     * @param {number[]} star Sternposition als Prozentwert [x, y].
     * @param {number} size SVG-Kantenlaenge in Pixeln.
     * @param {{x:number, y:number}} center Mittelpunkt des Sternbilds.
     * @param {string} name Sichtbarer Sternname.
     * @param {{dx?:number, dy?:number, anchor?:string}|undefined} override Optionale manuelle Ueberschreibung.
     * @returns {{x:number, y:number, anchor:string, name:string}} Fertige Label-Position.
     */
    function buildConstellationLabelPlacement(star, size, center, name, override){
      const starX = star[0] / 100 * size;
      const starY = star[1] / 100 * size;

      let dx = 0;
      let dy = 0;
      let anchor = 'middle';

      if (starX < center.x - 18) {
        dx = -12;
        anchor = 'end';
      } else if (starX > center.x + 18) {
        dx = 12;
        anchor = 'start';
      }

      if (starY < center.y - 18) {
        dy = -12;
      } else if (starY > center.y + 18) {
        dy = 16;
      } else if (anchor === 'middle') {
        dy = -12;
      } else {
        dy = 4;
      }

      if (override) {
        if (typeof override.dx === 'number') {
          dx = override.dx;
        }
        if (typeof override.dy === 'number') {
          dy = override.dy;
        }
        if (override.anchor) {
          anchor = override.anchor;
        }
      }

      return {
        x: starX + dx,
        y: starY + dy,
        anchor,
        name
      };
    }

    /**
     * Rendert das Sternbild des gewaehlten Monats als schematische Sternkarte.
     * @param {object} context Gemeinsamer Kontext mit ausgewaehltem Datum und Sprache.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const lang = context.language;
      const t = options.getTranslations();
      const target = document.getElementById('constellationMap');
      const skyHint = document.getElementById('constellationSkyHint');
      const summary = document.getElementById('constellationSummary');
      if (!target) return;
      const month = date.getMonth() + 1;
      const item = (options.getItems() || []).find(entry => entry.month === month);
      if (!item) return;
      const size = 460;
      target.innerHTML = '';
      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', (t.title_constellation_month || 'Constellation of the month') + ': ' + item.name);

      const defs = options.createSvgElement('defs');
      const skyGradient = options.createSvgElement('radialGradient');
      skyGradient.setAttribute('id', 'constellationSkyGradient');
      skyGradient.setAttribute('cx', '50%');
      skyGradient.setAttribute('cy', '38%');
      skyGradient.setAttribute('r', '74%');
      [
        { offset:'0%', color:'#17325f' },
        { offset:'54%', color:'#0f2548' },
        { offset:'100%', color:'#081426' }
      ].forEach(stopConfig => {
        const stop = options.createSvgElement('stop');
        stop.setAttribute('offset', stopConfig.offset);
        stop.setAttribute('stop-color', stopConfig.color);
        skyGradient.appendChild(stop);
      });
      defs.appendChild(skyGradient);

      const starGlow = options.createSvgElement('filter');
      starGlow.setAttribute('id', 'constellationStarGlow');
      starGlow.setAttribute('x', '-50%');
      starGlow.setAttribute('y', '-50%');
      starGlow.setAttribute('width', '200%');
      starGlow.setAttribute('height', '200%');
      const blur = options.createSvgElement('feGaussianBlur');
      blur.setAttribute('stdDeviation', '2.4');
      blur.setAttribute('result', 'blur');
      starGlow.appendChild(blur);
      const merge = options.createSvgElement('feMerge');
      const mergeBlur = options.createSvgElement('feMergeNode');
      mergeBlur.setAttribute('in', 'blur');
      merge.appendChild(mergeBlur);
      const mergeGraphic = options.createSvgElement('feMergeNode');
      mergeGraphic.setAttribute('in', 'SourceGraphic');
      merge.appendChild(mergeGraphic);
      starGlow.appendChild(merge);
      defs.appendChild(starGlow);
      svg.appendChild(defs);

      const background = options.createSvgElement('rect');
      background.setAttribute('x', '0');
      background.setAttribute('y', '0');
      background.setAttribute('width', String(size));
      background.setAttribute('height', String(size));
      background.setAttribute('rx', '16');
      background.setAttribute('class', 'constellation-sky-panel');
      svg.appendChild(background);

      const backgroundStars = [
        [42, 56, 1.2], [88, 74, 1.6], [144, 44, 1.1], [206, 66, 1.3],
        [286, 52, 1.5], [344, 84, 1.2], [398, 48, 1.4], [62, 136, 1.2],
        [124, 160, 1.1], [188, 116, 1.5], [276, 146, 1.1], [360, 132, 1.3],
        [404, 174, 1.1], [54, 232, 1.4], [110, 254, 1.1], [172, 214, 1.2],
        [248, 262, 1.5], [322, 234, 1.1], [386, 278, 1.3], [74, 332, 1.2],
        [142, 352, 1.4], [224, 326, 1.1], [296, 358, 1.2], [366, 336, 1.4],
        [414, 392, 1.2], [96, 404, 1.1], [176, 410, 1.3], [266, 404, 1.2]
      ];
      backgroundStars.forEach(starConfig => {
        const star = options.createSvgElement('circle');
        star.setAttribute('cx', String(starConfig[0]));
        star.setAttribute('cy', String(starConfig[1]));
        star.setAttribute('r', String(starConfig[2]));
        star.setAttribute('class', 'constellation-background-star');
        svg.appendChild(star);
      });

      (item.lines || []).forEach(([from, to]) => {
        const a = item.stars[from];
        const b = item.stars[to];
        if (!a || !b) return;
        const line = options.createSvgElement('line');
        line.setAttribute('x1', a[0] / 100 * size);
        line.setAttribute('y1', a[1] / 100 * size);
        line.setAttribute('x2', b[0] / 100 * size);
        line.setAttribute('y2', b[1] / 100 * size);
        line.setAttribute('class', 'constellation-line');
        svg.appendChild(line);
      });
      (item.stars || []).forEach((star, index) => {
        const circle = options.createSvgElement('circle');
        circle.setAttribute('cx', star[0] / 100 * size);
        circle.setAttribute('cy', star[1] / 100 * size);
        let circleRadius = 3.6;
        let circleClass = 'constellation-star';
        if (index === 0) {
          circleRadius = 5;
          circleClass += ' main';
        }
        circle.setAttribute('r', circleRadius);
        circle.setAttribute('class', circleClass);
        svg.appendChild(circle);
      });
      const labelOverrides = new Map();
      (item.labels || []).forEach(label => {
        labelOverrides.set(label.star, label);
      });
      const constellationCenter = calculateConstellationCenter(item.stars || [], size);
      (item.starNames || []).forEach((starName, starIndex) => {
        if (!starName) return;
        const star = item.stars[starIndex];
        if (!star) return;
        const labelPlacement = buildConstellationLabelPlacement(
          star,
          size,
          constellationCenter,
          starName,
          labelOverrides.get(starIndex)
        );
        const text = options.createSvgElement('text');
        text.setAttribute('x', labelPlacement.x);
        text.setAttribute('y', labelPlacement.y);
        text.setAttribute('class', 'constellation-star-label');
        text.setAttribute('text-anchor', labelPlacement.anchor);
        text.textContent = labelPlacement.name;
        svg.appendChild(text);
      });
      target.appendChild(svg);
      if (skyHint) {
        skyHint.innerHTML = '';
        if (Number.isFinite(item.skyAngle) && Number.isFinite(item.skyAltitude)) {
          const map = options.cloneTemplate('constellationDivTemplate').firstElementChild;
          map.className = 'constellation-skyhint-map';
          const hintSvg = options.createSvgElement('svg');
          hintSvg.removeAttribute('xmlns');
          hintSvg.setAttribute('viewBox', '0 0 120 120');
          hintSvg.setAttribute('role', 'img');
          hintSvg.setAttribute('aria-label', (t.constellation_month_where || 'Where to look') + ': ' + item.name);

          const horizon = options.createSvgElement('circle');
          horizon.setAttribute('cx', 60);
          horizon.setAttribute('cy', 60);
          horizon.setAttribute('r', 46);
          horizon.setAttribute('fill', 'none');
          horizon.setAttribute('stroke', '#cbd5e1');
          horizon.setAttribute('stroke-width', '1.2');
          hintSvg.appendChild(horizon);

          const northLabel = options.createSvgElement('text');
          northLabel.setAttribute('x', 60);
          northLabel.setAttribute('y', 12);
          northLabel.setAttribute('class', 'constellation-skyhint-cardinal');
          northLabel.setAttribute('text-anchor', 'middle');
          northLabel.textContent = 'N';
          hintSvg.appendChild(northLabel);

          const eastLabel = options.createSvgElement('text');
          eastLabel.setAttribute('x', 108);
          eastLabel.setAttribute('y', 64);
          eastLabel.setAttribute('class', 'constellation-skyhint-cardinal');
          eastLabel.setAttribute('text-anchor', 'middle');
          eastLabel.textContent = 'E';
          hintSvg.appendChild(eastLabel);

          const southLabel = options.createSvgElement('text');
          southLabel.setAttribute('x', 60);
          southLabel.setAttribute('y', 114);
          southLabel.setAttribute('class', 'constellation-skyhint-cardinal');
          southLabel.setAttribute('text-anchor', 'middle');
          southLabel.textContent = 'S';
          hintSvg.appendChild(southLabel);

          const westLabel = options.createSvgElement('text');
          westLabel.setAttribute('x', 12);
          westLabel.setAttribute('y', 64);
          westLabel.setAttribute('class', 'constellation-skyhint-cardinal');
          westLabel.setAttribute('text-anchor', 'middle');
          westLabel.textContent = 'W';
          hintSvg.appendChild(westLabel);

          const angle = item.skyAngle * Math.PI / 180 - Math.PI / 2;
          const radius = 46 * (1 - item.skyAltitude / 90);
          const dotX = 60 + Math.cos(angle) * radius;
          const dotY = 60 + Math.sin(angle) * radius;

          const dot = options.createSvgElement('circle');
          dot.setAttribute('cx', dotX.toFixed(1));
          dot.setAttribute('cy', dotY.toFixed(1));
          dot.setAttribute('r', 5);
          dot.setAttribute('class', 'constellation-skyhint-dot');
          hintSvg.appendChild(dot);

          map.appendChild(hintSvg);
          skyHint.appendChild(map);

          const copy = options.cloneTemplate('constellationDivTemplate').firstElementChild;
          copy.className = 'constellation-skyhint-copy';
          const headline = options.cloneTemplate('constellationDivTemplate').firstElementChild;
          headline.className = 'constellation-skyhint-title';
          headline.textContent = t.constellation_month_where || 'Where to look';
          const direction = options.cloneTemplate('constellationDivTemplate').firstElementChild;
          direction.className = 'constellation-skyhint-line';
          direction.textContent = options.compassLabelForAzimuth(item.skyAngle) + ' · ' + item.skyAngle.toFixed(0) + '°';
          const altitude = options.cloneTemplate('constellationDivTemplate').firstElementChild;
          altitude.className = 'constellation-skyhint-line';
          altitude.textContent = item.skyAltitude.toFixed(0) + '° ' + (t.constellation_month_above_horizon || 'above horizon') + ' · ' + options.altitudeThumbEstimate(item.skyAltitude);
          const timeOfDay = options.cloneTemplate('constellationDivTemplate').firstElementChild;
          timeOfDay.className = 'constellation-skyhint-line';
          timeOfDay.textContent = t.constellation_month_evening || 'Evening sky';
          copy.append(headline, direction, altitude, timeOfDay);
          skyHint.appendChild(copy);
        }
      }
      if (summary) {
        let highlight = item.highlight || '';
        if (typeof item.highlight === 'object') {
          highlight = item.highlight[lang] || item.highlight.en || '';
        }
        const summaryTemplate = document.getElementById('constellationSummaryTemplate');
        summary.innerHTML = '';
        if (!summaryTemplate) {
          options.appendSummaryText(summary, item.name);
          options.appendSummaryText(summary, highlight);
          options.appendSummaryLine(summary, (t.constellation_month_label || 'Month') + ': ', new Intl.DateTimeFormat(lang, { month:'long' }).format(date));
        } else {
          const fragment = summaryTemplate.content.cloneNode(true);
          fragment.querySelector('[data-constellation-name]').textContent = item.name;
          fragment.querySelector('[data-constellation-highlight]').textContent = highlight;
          fragment.querySelector('[data-constellation-month-label]').textContent = (t.constellation_month_label || 'Month') + ':';
          fragment.querySelector('[data-constellation-month-value]').textContent = new Intl.DateTimeFormat(lang, { month:'long' }).format(date);
          summary.appendChild(fragment);
        }
      }
      options.requestMasonryLayout();
    }

    return {render, calculateConstellationCenter, buildConstellationLabelPlacement};
  }
  return {create};
})();
