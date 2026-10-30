window.PLANETENUHR_IDEFIX = (() => {
  'use strict';

  /**
   * Creates the dated MMX/IDEFIX journey card using retained SVG and HTML template nodes.
   * @param {object} dependencies getDate, getLanguage, getTranslations, getHeliocentricPosition and updateCardLayout adapters.
   * @returns {{render:Function}} Controller preserving local exploration until the dashboard date changes.
   */
  function create(dependencies){
    const config = window.PLANETENUHR_IDEFIX_CONFIG;
    const ephemeris = window.PLANETENUHR_IDEFIX_EPHEMERIS;
    const model = window.PLANETENUHR_IDEFIX_MODEL;
    const card = document.querySelector('[data-help-key="idefix"]');
    const slider = document.getElementById('idefixTime');
    const plot = document.getElementById('idefixPlot');
    let baseDate = dependencies.getDate();
    let localDate = null;
    let followNow = false;
    let orbitYear = null;
    let plotResizeFrame = 0;
    let lastPlotWidth = 0;
    let currentDate = baseDate;
    const start = Date.parse(config.launch);
    const end = Date.parse(config.timelineEnd);
    slider.max = String((end - start) / 86400000);
    const pixels = [];

    /** Returns an active-language label. @param {string} key Translation key. @returns {string} Localized text. */
    function text(key){
      return dependencies.getTranslations()[key];
    }

    /** Writes text without needless DOM mutation. @param {string} id Element id. @param {string} value Text. @returns {void} */
    function write(id, value){
      const node = document.getElementById(id);
      if (node.textContent !== value) {
        node.textContent = value;
      }
    }

    /** Interpolates placeholders in centralized copy. @param {string} key Translation key. @param {object} values Placeholder values. @returns {string} Completed text. */
    function message(key, values){
      let result = text(key);
      Object.entries(values).forEach(([name, value]) => {
        result = result.replaceAll('{' + name + '}', String(value));
      });
      return result;
    }

    /** Formats dates in the browser's civil time, explicitly including its zone for instants. @param {Date} date Instant. @param {boolean} [withTime=false] Include time and zone. @returns {string} Localized date. */
    function formatDate(date, withTime = false){
      const options = {year:'numeric',month:'2-digit',day:'2-digit'};
      if (withTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.timeZoneName = 'short';
        options.hour12 = false;
      }
      return new Intl.DateTimeFormat(dependencies.getLanguage(), options).format(date);
    }

    /** Moves an existing SVG group. @param {string} id Group id. @param {{x:number,y:number}} point SVG point. @returns {void} */
    function move(id, point){
      document.getElementById(id).setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ')');
    }

    /** Builds the fixed pixel trail once from the cached JPL vectors. No parameters. @returns {void} */
    function buildTrail(){
      const fragment = document.createDocumentFragment();
      ephemeris.rows.forEach(row => {
        const pixel = document.getElementById('idefixTrailPixelTemplate').content.cloneNode(true).querySelector('rect');
        const point = model.project({x:row[1],y:row[2]});
        pixel.setAttribute('x', String(point.x - 1));
        pixel.setAttribute('y', String(point.y - 1));
        fragment.appendChild(pixel);
        pixels.push({node:pixel,time:row[0]});
      });
      document.getElementById('idefixTrail').appendChild(fragment);
      const path = ephemeris.rows.map((row, index) => {
        const point = model.project({x:row[1],y:row[2]});
        let command = 'L';
        if (index === 0) {
          command = 'M';
        }
        return command + point.x.toFixed(3) + ',' + point.y.toFixed(3);
      }).join(' ');
      document.getElementById('idefixPrediction').setAttribute('d', path);
    }

    /** Samples familiar planet orbits once per selected year. @param {Date} date Selected instant. @returns {void} */
    function drawOrbits(date){
      const year = date.getUTCFullYear();
      if (orbitYear === year) {
        return;
      }
      orbitYear = year;
      for (const [key, days, id] of [['earth',365.256,'idefixEarthOrbit'],['mars',686.98,'idefixMarsOrbit']]) {
        const parts = [];
        for (let index = 0; index <= 120; index += 1) {
          const time = new Date(Date.UTC(year, 0, 1) + days * 86400000 * index / 120);
          const point = model.project(dependencies.getHeliocentricPosition(key, time));
          let command = 'L';
          if (index === 0) {
            command = 'M';
          }
          parts.push(command + point.x.toFixed(3) + ',' + point.y.toFixed(3));
        }
        document.getElementById(id).setAttribute('d', parts.join(' ') + ' Z');
      }
    }

    /** Adapts SVG labels and framing to the rendered width without replacing nodes. No parameters. @returns {void} */
    function adaptPlot(){
      const width = plot.getBoundingClientRect().width;
      if (!width || width === lastPlotWidth) {
        return;
      }
      lastPlotWidth = width;
      let viewWidth = 620;
      let viewBox = '0 -25 620 410';
      if (width < 400) {
        viewWidth = 400;
        viewBox = '110 -25 400 410';
      }
      plot.setAttribute('viewBox', viewBox);
      const fontSize = 12 * viewWidth / width;
      plot.style.setProperty('--idefix-label-size', fontSize + 'px');
      document.querySelector('#idefixEarth text').setAttribute('y', String(fontSize + 12));
    }

    /** Builds recurring time controls from configuration and a shared HTML template. No parameters. @returns {void} */
    function buildControls(){
      for (const [items, id] of [[config.steps, 'idefixControls'], [config.presets, 'idefixJumps']]) {
        const fragment = document.createDocumentFragment();
        items.forEach(item => {
          const node = document.getElementById('idefixControlTemplate').content.cloneNode(true);
          const button = node.querySelector('button');
          button.dataset.idefixText = item.label;
          button.dataset.idefixAction = item.action || 'jump';
          if (item.unit) {
            button.dataset.unit = item.unit;
            button.dataset.amount = String(item.amount);
          }
          if (item.date) {
            button.dataset.date = item.date;
          }
          fragment.appendChild(node);
        });
        document.getElementById(id).appendChild(fragment);
      }
    }

    /** Adds source links from the curated configuration through a template. No parameters. @returns {void} */
    function buildLinks(){
      const fragment = document.createDocumentFragment();
      config.links.forEach(source => {
        const node = document.getElementById('idefixLinkTemplate').content.cloneNode(true);
        const link = node.querySelector('a');
        link.href = source.url;
        link.textContent = source.label;
        fragment.appendChild(node);
      });
      document.getElementById('idefixLinks').appendChild(fragment);
    }

    /**
     * Displays an instant, distinguishing JPL forecast positions, unavailable positions and a planned destination.
     * @param {Date} [date] Updated shared dashboard date.
     * @returns {void}
     */
    function render(date){
      if (date) {
        if (Math.abs(date.getTime() - baseDate.getTime()) > 12 * 3600000) {
          localDate = null;
          followNow = false;
        }
        baseDate = new Date(date.getTime());
      }
      currentDate = baseDate;
      if (followNow) {
        currentDate = new Date();
      }
      if (localDate) {
        currentDate = localDate;
      }
      const timestamp = currentDate.getTime();
      const phase = model.phaseAt(currentDate, config);
      const vector = model.positionAt(ephemeris.rows, currentDate);
      const earth = model.project(dependencies.getHeliocentricPosition('earth', currentDate));
      const mars = model.project(dependencies.getHeliocentricPosition('mars', currentDate));
      drawOrbits(currentDate);
      adaptPlot();
      move('idefixEarth', earth);
      move('idefixMars', mars);
      let positionMode = 'unavailable';
      document.getElementById('idefixProbe').style.display = 'none';
      document.getElementById('idefixRoverOnPhobos').style.display = 'none';
      if (vector) {
        positionMode = 'prediction';
        move('idefixProbe', model.project(vector));
        document.getElementById('idefixProbe').style.display = '';
      } else if (timestamp > ephemeris.rows[ephemeris.rows.length - 1][0]) {
        positionMode = 'planned';
        // A destination symbol is deliberately hollow; there is no extrapolated trajectory.
        move('idefixProbe', mars);
        document.getElementById('idefixProbe').style.display = '';
        document.getElementById('idefixRoverOnPhobos').style.display = '';
      }
      card.dataset.positionMode = positionMode;
      card.dataset.missionPhase = phase;
      pixels.forEach(pixel => {
        let visibility = 'hidden';
        if (pixel.time <= timestamp) {
          visibility = 'visible';
        }
        pixel.node.setAttribute('visibility', visibility);
      });
      const angle = model.phobosAngle(currentDate, config);
      const moon = {x:100 + Math.cos(angle) * 60,y:92 - Math.sin(angle) * 60};
      move('idefixPhobos', moon);
      move('idefixRoverOnPhobos', {x:moon.x,y:moon.y - 9});
      document.querySelectorAll('[data-idefix-text]').forEach(node => {
        node.textContent = text(node.dataset.idefixText);
      });
      write('idefixDate', formatDate(currentDate, true));
      write('idefixPhase', text('idefix_phase_' + phase));
      write('idefixPhaseDetail', text('idefix_detail_' + phase));
      write('idefixPosition', text('idefix_position_' + positionMode));
      write('idefixLatest', message('idefix_latest', {date:formatDate(new Date(config.launch), true)}));
      write('idefixVerified', message('idefix_verified', {date:formatDate(new Date(config.statusVerifiedAt))}));
      write('idefixCoverage', message('idefix_coverage', {start:formatDate(new Date(ephemeris.start)),end:formatDate(new Date(ephemeris.end)),revised:formatDate(new Date(ephemeris.revised + 'T00:00:00Z'))}));
      document.getElementById('idefixStale').hidden = Date.now() - Date.parse(config.statusVerifiedAt) <= config.staleAfterDays * 86400000;
      slider.value = String(Math.max(0, Math.min(Number(slider.max), (timestamp - start) / 86400000)));
      slider.setAttribute('aria-valuetext', formatDate(currentDate, true));
      plot.setAttribute('aria-label', message('idefix_plot_aria', {date:formatDate(currentDate),mode:text('idefix_position_' + positionMode)}));
      document.getElementById('idefixMoonPlot').setAttribute('aria-label', text('idefix_moon_aria'));
      dependencies.updateCardLayout(card);
    }

    /** Explores a UTC instant within the slider's mission period. No parameters. @returns {void} */
    function seek(){
      followNow = false;
      localDate = new Date(start + Number(slider.value) * 86400000);
      render();
    }

    /** Applies a delegated calendar step or a reset without rebuilding controls. @param {MouseEvent} event Control click. @returns {void} */
    function control(event){
      const button = event.target.closest('[data-idefix-action]');
      if (!button) {
        return;
      }
      const action = button.dataset.idefixAction;
      if (action === 'today') {
        followNow = true;
        localDate = null;
      } else if (action === 'shared') {
        followNow = false;
        localDate = null;
        baseDate = dependencies.getDate();
      } else if (action === 'jump') {
        followNow = false;
        localDate = new Date(button.dataset.date);
      } else {
        followNow = false;
        localDate = model.shiftDate(currentDate, button.dataset.unit, Number(button.dataset.amount));
        localDate = new Date(Math.max(start, Math.min(end, localDate.getTime())));
      }
      render();
    }

    /** Refreshes the shared base time once per minute while preserving a local exploration instant. No parameters. @returns {void} */
    function refreshCurrent(){
      render(dependencies.getDate());
    }

    /**
     * Defers SVG size mutations until after observer delivery, coalescing repeated notifications.
     * No parameters.
     * @returns {void}
     */
    function schedulePlotResize(){
      if (plotResizeFrame) {
        return;
      }
      plotResizeFrame = requestAnimationFrame(() => {
        plotResizeFrame = 0;
        adaptPlot();
      });
    }

    buildTrail();
    buildLinks();
    buildControls();
    slider.addEventListener('input', seek);
    card.addEventListener('click', control);
    if ('ResizeObserver' in window) {
      new ResizeObserver(schedulePlotResize).observe(plot);
    } else {
      window.addEventListener('resize', schedulePlotResize);
    }
    setInterval(refreshCurrent, 60000);
    render();
    return {render};
  }

  return {create};
})();
