window.PLANETENUHR_ANALEMMA_CARD = (() => {
  'use strict';
  /** Creates the location-dependent analemma renderer from a shared dashboard context.
   * @param {object} options Document, yearly model, existing solar-visibility functions, SVG templates, day formatter, translations and summary writers.
   * @returns {object} Model or render operations; starts no timers or listeners.
   */
  function create(options){
    const document = options.document;

    /**
     * Formats signed minute values for compact summary display.
     * @param {number} minutes Signed minute value.
     * @returns {string} Localized minute label with sign.
     */
    function formatSignedMinutes(minutes){
      let prefix = '+';
      if (minutes < 0) {
        prefix = '−';
      }
      return prefix + Math.abs(minutes).toFixed(1) + ' min';
    }

    /**
     * Renders a location-dependent analemma for 12:00 local clock time across
     * the selected year. The horizontal axis reflects clock-versus-solar time
     * offset while the vertical axis shows noon altitude for the selected place.
     * @param {object} context Shared dashboard context with date, location and language.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const lang = context.language;
      const t = options.getTranslations();
      const target = document.getElementById('analemmaMap');
      const summary = document.getElementById('analemmaSummary');
      const location = context.location;
      if (!target || !summary || !location) {
        return;
      }

      const {year,samples,maxOffset,minAltitude,maxAltitude,selectedSample} = options.model.sampleYear(date, location);
      const width = 420;
      const height = 420;
      const left = 50;
      const right = 372;
      const top = 38;
      const bottom = 356;
      const verticalSpan = Math.max(20, maxAltitude - minAltitude);
      const horizontalSpan = Math.max(8, maxOffset);

      /** Projects a time offset onto the existing horizontal plot scale.
       * @param {number} offsetMinutes Offset in minutes. @returns {number} SVG x coordinate.
       */
      function plotX(offsetMinutes){
        const ratio = (offsetMinutes + horizontalSpan) / (horizontalSpan * 2);
        return left + ratio * (right - left);
      }

      /** Projects a solar altitude onto the existing vertical plot scale.
       * @param {number} altitudeDegrees Altitude in degrees. @returns {number} SVG y coordinate.
       */
      function plotY(altitudeDegrees){
        const ratio = (altitudeDegrees - minAltitude) / verticalSpan;
        return bottom - ratio * (bottom - top);
      }

      let path = '';
      samples.forEach((sample, index) => {
        const x = plotX(sample.offsetMinutes);
        const y = plotY(sample.altitudeDegrees);
        if (index === 0) {
          path = 'M ' + x.toFixed(2) + ' ' + y.toFixed(2);
        } else {
          path += ' L ' + x.toFixed(2) + ' ' + y.toFixed(2);
        }
      });

      target.textContent = '';

      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', '0 0 420 420');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.analemma_aria || 'Analemma for the selected location');

      const frame = options.createSvgElement('rect');
      frame.setAttribute('x', left);
      frame.setAttribute('y', top);
      frame.setAttribute('width', right - left);
      frame.setAttribute('height', bottom - top);
      frame.setAttribute('rx', 18);
      frame.setAttribute('class', 'analemma-frame');
      svg.appendChild(frame);

      const noonAxis = options.createSvgElement('line');
      noonAxis.setAttribute('x1', plotX(0));
      noonAxis.setAttribute('y1', top);
      noonAxis.setAttribute('x2', plotX(0));
      noonAxis.setAttribute('y2', bottom);
      noonAxis.setAttribute('class', 'analemma-axis');
      svg.appendChild(noonAxis);

      const medianAltitude = (minAltitude + maxAltitude) / 2;
      const altitudeAxis = options.createSvgElement('line');
      altitudeAxis.setAttribute('x1', left);
      altitudeAxis.setAttribute('y1', plotY(medianAltitude));
      altitudeAxis.setAttribute('x2', right);
      altitudeAxis.setAttribute('y2', plotY(medianAltitude));
      altitudeAxis.setAttribute('class', 'analemma-axis');
      svg.appendChild(altitudeAxis);

      const curve = options.createSvgElement('path');
      curve.setAttribute('d', path);
      curve.setAttribute('class', 'analemma-curve');
      svg.appendChild(curve);

      for (let month = 0; month < 12; month += 1) {
        const monthDate = new Date(year, month, 1);
        const monthSample = samples[options.dayOfYearLocal(monthDate) - 1];
        const monthDot = options.createSvgElement('circle');
        monthDot.setAttribute('cx', plotX(monthSample.offsetMinutes));
        monthDot.setAttribute('cy', plotY(monthSample.altitudeDegrees));
        monthDot.setAttribute('r', 3.2);
        monthDot.setAttribute('class', 'analemma-month-dot');
        svg.appendChild(monthDot);

        const monthLabel = options.createSvgElement('text');
        monthLabel.setAttribute('x', plotX(monthSample.offsetMinutes));
        monthLabel.setAttribute('y', plotY(monthSample.altitudeDegrees) - 10);
        monthLabel.setAttribute('class', 'analemma-month-label');
        monthLabel.textContent = new Intl.DateTimeFormat(lang, { month:'short' }).format(monthDate).replace('.', '');
        svg.appendChild(monthLabel);
      }

      const selectedPoint = options.createSvgElement('circle');
      selectedPoint.setAttribute('cx', plotX(selectedSample.offsetMinutes));
      selectedPoint.setAttribute('cy', plotY(selectedSample.altitudeDegrees));
      selectedPoint.setAttribute('r', 5.2);
      selectedPoint.setAttribute('class', 'analemma-today');
      svg.appendChild(selectedPoint);

      const xLabel = options.createSvgElement('text');
      xLabel.setAttribute('x', (left + right) / 2);
      xLabel.setAttribute('y', 392);
      xLabel.setAttribute('class', 'analemma-axis-label');
      xLabel.textContent = t.analemma_x_axis || 'clock offset vs. solar noon';
      svg.appendChild(xLabel);

      const yLabel = options.createSvgElement('text');
      yLabel.setAttribute('x', 18);
      yLabel.setAttribute('y', (top + bottom) / 2);
      yLabel.setAttribute('transform', 'rotate(-90 18 ' + ((top + bottom) / 2) + ')');
      yLabel.setAttribute('class', 'analemma-axis-label');
      yLabel.textContent = t.analemma_y_axis || 'noon altitude';
      svg.appendChild(yLabel);

      target.appendChild(svg);

      summary.textContent = '';
      options.appendSummaryText(summary, t.analemma_summary || 'The analemma shows where the Sun would appear at the same civil clock time through the year. Here it is approximated for 12:00 at the selected location.');
      options.appendSummaryLine(summary, (t.analemma_location || 'Location') + ': ', location.name);
      options.appendSummaryLine(summary, (t.analemma_year || 'Year') + ': ', String(year));
      options.appendSummaryLine(summary, (t.analemma_declination || 'Declination') + ': ', options.solarVisibility.approximateSolarDeclinationDegrees(date).toFixed(1) + '°');
      options.appendSummaryLine(summary, (t.analemma_eot || 'Equation of time') + ': ', formatSignedMinutes(options.solarVisibility.approximateEquationOfTimeMinutes(date)));
      options.appendSummaryLine(summary, (t.analemma_noon_offset || '12:00 vs. solar noon') + ': ', formatSignedMinutes(selectedSample.offsetMinutes));
      options.appendSummaryLine(summary, (t.analemma_noon_altitude || 'Noon altitude') + ': ', selectedSample.altitudeDegrees.toFixed(1) + '°');
    }

    return {render, formatSignedMinutes};
  }
  return {create};
})();
