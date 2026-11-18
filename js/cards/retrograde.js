window.PLANETENUHR_RETROGRADE_CARD = (() => {
  'use strict';
  const comparisonDays = 10;
  /** Creates the retrograde card from the pure motion model and retained HTML/SVG templates.
   * @param {object} options Document, template cloning, retrograde model, planet list, translations and name/date/meter formatters.
   * @returns {object} Overview and calculation renderers with local tab, planet and time controls.
   */
  function create(options){
    const document = options.document;
    const tabs = document.getElementById('retrogradeTabs');
    const calculation = document.getElementById('retrogradeCalculation');
    const picker = document.getElementById('retrogradeBody');
    const day = document.getElementById('retrogradeDay');
    const plot = document.getElementById('retrogradeLongitudePlot');
    let observation = null;
    let calculationKey = '';
    let series = null;
    let chartPoints = [];

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

    /** Draws the daily positions in ecliptic longitude and latitude with both stations.
     * @param {object} windowModel Daily longitude samples and station indices.
     * @param {string} timeZone Observation time zone for the dates.
     * @returns {void}
     */
    function drawLongitudePlot(windowModel, timeZone){
      const t = options.getTranslations();
      const firstLongitude = windowModel.samples[0].longitude;
      const longitudes = windowModel.samples.map(sample => firstLongitude + sample.relativeLongitude);
      const latitudes = windowModel.samples.map(sample => sample.latitude);
      const track = options.model.projectSkyTrack(longitudes, latitudes, {left:24, right:396, top:24, bottom:156});
      chartPoints = track.points;
      const [start, end] = [windowModel.startStation, windowModel.endStation];
      const segments = chartPoints.map(point => point.x.toFixed(2) + ' ' + point.y.toFixed(2));
      const sections = plot.querySelector('[data-retro-sections]');
      sections.replaceChildren();
      drawPhaseSection(sections, 'before', segments.slice(0, start + 1));
      drawPhaseSection(sections, 'during', segments.slice(start, end + 1));
      drawPhaseSection(sections, 'after', segments.slice(end));
      plot.querySelector('title').textContent = t.retrograde_calc_sky;
      const startDate = options.formatDate(windowModel.samples[start].date, timeZone);
      const endDate = options.formatDate(windowModel.samples[end].date, timeZone);
      const stationLabels = [t.retrograde_calc_station_start + ' ' + startDate, t.retrograde_calc_station_end + ' ' + endDate];
      const firstStation = plotStation(chartPoints[start], stationLabels[0], 1);
      const lastStation = plotStation(chartPoints[end], stationLabels[1], 2);
      plot.querySelector('[data-retro-stations]').replaceChildren(firstStation, lastStation);
      document.getElementById('retrogradeStationStart').textContent = stationLabels[0];
      document.getElementById('retrogradeStationEnd').textContent = stationLabels[1];
      const format = new Intl.NumberFormat(options.getLanguage(), {maximumFractionDigits:1});
      document.getElementById('retrogradePlotStart').textContent = format.format(track.longitudeStart) + '°';
      document.getElementById('retrogradePlotEnd').textContent = format.format(track.longitudeEnd) + '°';
    }

    /** Draws a chronological segment and sets its arrow along the local path direction.
     * @param {SVGGElement} sections SVG container for the three segments.
     * @param {string} phase Before, during or after the retrograde phase.
     * @param {string[]} segments Consecutive formatted screen positions in travel order.
     * @returns {void}
     */
    function drawPhaseSection(sections, phase, segments){
      const section = options.cloneTemplate('retrogradePlotSectionTemplate').querySelector('g');
      section.dataset.retroSection = phase;
      const path = section.querySelector('.retro-plot-curve');
      path.setAttribute('d', 'M ' + segments.join(' L '));
      sections.appendChild(section);
      const half = path.getTotalLength() / 2;
      const point = path.getPointAtLength(half);
      const before = path.getPointAtLength(Math.max(0, half - 5));
      const after = path.getPointAtLength(half + 5);
      const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
      const arrow = section.querySelector('.retro-plot-arrow');
      arrow.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ') rotate(' + angle + ')');
    }

    /** Creates a labelled point using the common SVG template.
     * @param {object} point Chart x and y coordinates. @param {string} label Date or station label.
     * @returns {SVGGElement} Independent marker group.
     */
    function plotMarker(point, label){
      const marker = options.cloneTemplate('retrogradePlotPointTemplate').querySelector('g');
      marker.setAttribute('transform', 'translate(' + point.x + ' 0)');
      marker.querySelector('circle').setAttribute('cy', point.y);
      marker.querySelector('title').textContent = label;
      return marker;
    }

    /** Places a numbered turning point whose date matches the text below the plot.
     * @param {object} point Station position in SVG coordinates.
     * @param {string} label Localized name and date.
     * @param {number} number Station number in chronological order.
     * @returns {SVGGElement} Independent station marker.
     */
    function plotStation(point, label, number){
      const marker = options.cloneTemplate('retrogradePlotStationTemplate').querySelector('g');
      marker.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ')');
      marker.querySelector('title').textContent = label;
      marker.querySelector('text').textContent = String(number);
      return marker;
    }

    /** Highlights the segment containing the midpoint of the ten-day comparison.
     * @param {number} index First sample index.
     * @returns {void}
     */
    function highlightPhase(index){
      const midpoint = index + comparisonDays / 2;
      let phase = 'during';
      if (midpoint < series.startStation) phase = 'before';
      else if (midpoint > series.endStation) phase = 'after';
      plot.dataset.retroActive = phase;
      calculation.querySelectorAll('[data-retro-jump]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.retroJump === phase));
      });
    }

    /** Projects one day's positions and line of sight into the shared orbit plane.
     * @param {object} geometry Earth and planet vectors.
     * @param {number} scale SVG units per AU shared by both days.
     * @param {string} dayKey First or second day, for the colour shared with the sky plot.
     * @returns {SVGGElement} Markers and sight line for the day.
     */
    function orbitSightLine(geometry, scale, dayKey){
      const snapshot = options.cloneTemplate('retrogradeGeometryDayTemplate').querySelector('g');
      snapshot.dataset.retroDay = dayKey;
      for (const [key, vector] of Object.entries(geometry)) {
        const x = 88 + vector.x * scale;
        const y = 88 - vector.y * scale;
        const dot = snapshot.querySelector('[data-retro-dot="' + key + '"]');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        let endpoint = '2';
        if (key === 'earth') endpoint = '1';
        const ray = snapshot.querySelector('[data-retro-ray]');
        ray.setAttribute('x' + endpoint, x);
        ray.setAttribute('y' + endpoint, y);
      }
      return snapshot;
    }

    /** Draws both observations with one shared origin and scale.
     * @param {object[]} geometry Earth and planet vectors for the two days.
     * @param {string[]} dates Localized dates in chronological order.
     * @param {string[]} keys Style keys matching the markers in the longitude plot.
     * @returns {void}
     */
    function drawOrbitComparison(geometry, dates, keys){
      const svg = document.getElementById('retrogradeGeometry');
      const radii = geometry.map(item => ({
        earth:Math.hypot(item.earth.x, item.earth.y),
        planet:Math.hypot(item.planet.x, item.planet.y)
      }));
      const scale = 74 / Math.max(...radii.flatMap(Object.values));
      for (const key of ['earth', 'planet']) {
        const meanRadius = (radii[0][key] + radii[1][key]) / 2;
        svg.querySelector('[data-retro-orbit="' + key + '"]').setAttribute('r', meanRadius * scale);
      }
      svg.querySelector('[data-retro-geometry-days]').replaceChildren(...geometry.map((item, index) =>
        orbitSightLine(item, scale, keys[index])));
      calculation.querySelectorAll('[data-retro-date]').forEach((label, index) => {
        label.textContent = dates[index];
      });
    }

    /** Updates both plots and the substituted formula for the selected comparison interval.
     * @returns {void}
     */
    function renderDay(){
      if (!series) return;
      const index = Number(day.value);
      const endIndex = index + comparisonDays;
      const samples = [series.samples[index], series.samples[endIndex]];
      const points = [chartPoints[index], chartPoints[endIndex]];
      const dates = samples.map(sample => options.formatDate(sample.date, observation.timeZone));
      const keys = ['first', 'second'];
      const geometry = samples.map(sample => ({
        earth:options.getPosition('earth', sample.date),
        planet:options.getPosition(picker.value, sample.date)
      }));
      drawOrbitComparison(geometry, dates, keys);
      highlightPhase(index);
      plot.querySelector('[data-retro-time-markers]').replaceChildren(...keys.map((key, offset) => {
        const marker = plotMarker(points[offset], dates[offset]);
        marker.dataset.retroDay = key;
        return marker;
      }));
      day.setAttribute('aria-valuetext', dates.join(' → '));
      const formatter = new Intl.NumberFormat(options.getLanguage(), {minimumFractionDigits:4, maximumFractionDigits:4});
      const [first, second] = samples;
      const longitudeChange = second.relativeLongitude - first.relativeLongitude;
      // Start with the first day's conventional angle, then follow the continuous sky track.
      const turns = Math.round((first.longitude + longitudeChange - second.longitude) / 360);
      const continuousLongitude = second.longitude + turns * 360;
      const motion = longitudeChange / comparisonDays;
      const stationary = Math.abs(motion) < 0.00005;
      let displayMotion = motion;
      if (stationary) displayMotion = 0;
      const firstAngle = formatter.format(first.longitude);
      const secondAngle = formatter.format(continuousLongitude);
      document.getElementById('retrogradeFormulaValues').textContent = '(' + secondAngle + '° − ' +
        firstAngle + '°) / ' + comparisonDays + ' d ≈ ' + formatter.format(displayMotion) + '°/d';
      const t = options.getTranslations();
      const longitudeNote = document.getElementById('retrogradeLongitudeNote');
      longitudeNote.hidden = turns === 0;
      if (turns !== 0) {
        longitudeNote.textContent = t.retrograde_calc_longitude_crossing
          .replace('{longitude}', formatter.format(second.longitude))
          .replace('{continuous}', secondAngle);
      } else {
        longitudeNote.textContent = '';
      }
      let explanation = t.retrograde_calc_stationary;
      if (!stationary) {
        if (motion < 0) explanation = t.retrograde_calc_westward;
        else explanation = t.retrograde_calc_eastward;
      }
      document.getElementById('retrogradeMotionExplanation').textContent = explanation;
      const crossesStation = [series.startStation, series.endStation].some(station => index < station && endIndex > station);
      document.getElementById('retrogradeIntervalNote').hidden = !crossesStation;
    }

    /** Rebuilds the calculation only when the selected planet or observation day changes.
     * @returns {void}
     */
    function renderCalculation(){
      if (calculation.hidden || !observation || !picker.value) return;
      const {date, timeZone} = observation;
      const reference = options.atLocalTime(date, 720, timeZone);
      const key = picker.value + ':' + reference.getTime() + ':' + timeZone;
      if (key === calculationKey) return;
      calculationKey = key;
      series = options.model.calculationWindow(picker.value, reference);
      document.getElementById('retrogradeCalculationContent').hidden = !series;
      document.getElementById('retrogradeCalculationEmpty').hidden = Boolean(series);
      if (!series) return;
      const t = options.getTranslations();
      document.getElementById('retrogradeGeometryLegend').textContent = t.retrograde_calc_geometry_legend
        .replace('{planet}', options.bodyDisplayName(picker.value));
      drawLongitudePlot(series, timeZone);
      let start = series.selectedIndex;
      if (series.samples[start].date.getTime() !== reference.getTime()) {
        start = Math.max(0, Math.floor((series.startStation + series.endStation - comparisonDays) / 2));
      }
      day.max = String(series.samples.length - 1 - comparisonDays);
      day.value = String(Math.min(start, Number(day.max)));
      renderDay();
    }

    /** Selects a representative pair of days before, inside or after the retrograde phase.
     * @param {MouseEvent} event Delegated button click.
     * @returns {void}
     */
    function jumpToPhase(event){
      const button = event.target.closest('[data-retro-jump]');
      if (!button || !series) return;
      const {startStation, endStation} = series;
      const indices = {
        before:Math.max(0, startStation - comparisonDays - 1),
        during:Math.max(0, Math.floor((startStation + endStation - comparisonDays) / 2)),
        after:Math.min(Number(day.max), endStation + 1)
      };
      day.value = String(indices[button.dataset.retroJump]);
      renderDay();
    }

    /** Switches tabs by click or by arrow, Home and End keys.
     * @param {Event} event Delegated tab event.
     * @returns {void}
     */
    function selectView(event){
      const buttons = Array.from(tabs.querySelectorAll('[role="tab"]'));
      const target = event.target.closest('[role="tab"]');
      if (!target) return;
      let index = buttons.indexOf(target);
      if (event.type === 'keydown') {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') index = (index + 1) % buttons.length;
        else if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[index].focus();
      }
      buttons.forEach((button, position) => {
        const active = position === index;
        button.setAttribute('aria-selected', String(active));
        if (active) button.tabIndex = 0;
        else button.tabIndex = -1;
        document.getElementById(button.getAttribute('aria-controls')).hidden = !active;
      });
      renderCalculation();
      options.updateCardLayout(tabs.closest('.display-container'));
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
      if (tabs) {
        observation = context;
        tabs.setAttribute('aria-label', t.retrograde_view_tabs);
        tabs.closest('.display-container').querySelectorAll('[data-retro-label]').forEach(node => {
          node.textContent = t[node.dataset.retroLabel];
        });
        if (!picker.options.length && bodies.length) {
          bodies.forEach(key => {
            const option = options.cloneTemplate('retrogradeBodyOptionTemplate').querySelector('option');
            option.value = key;
            option.textContent = options.bodyDisplayName(key);
            picker.appendChild(option);
          });
          if (bodies.includes('mars')) picker.value = 'mars';
        }
        renderCalculation();
      }
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

    if (tabs) {
      tabs.addEventListener('click', selectView);
      tabs.addEventListener('keydown', selectView);
      picker.addEventListener('change', renderCalculation);
      calculation.addEventListener('click', jumpToPhase);
      day.addEventListener('input', renderDay);
    }
    return {render, renderPath};
  }
  return {create};
})();
