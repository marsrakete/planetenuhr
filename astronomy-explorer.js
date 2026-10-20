window.PLANETENUHR_EXPLORER = (() => {
  'use strict';
  const svgNamespace = 'http://www.w3.org/2000/svg';

  /**
   * Creates and wires the two astronomy cards using the dashboard's existing model.
   * @param {object} dependencies Date, location, language, position and layout adapters.
   * @returns {{render:Function}} Controller that refreshes both cards without resetting exploration.
   */
  function create(dependencies){
    const config = window.PLANETENUHR_EXPLORER_CONFIG;
    const model = window.PLANETENUHR_EXPLORER_MODEL;
    const plot = document.getElementById('planetHorizonPlot');
    const horizonCard = plot.closest('.display-container');
    const timeSlider = document.getElementById('horizonTimeOffset');
    const progressSlider = document.getElementById('lightTravelProgress');
    const planetList = document.getElementById('horizonPlanetList');
    const lightTargets = document.getElementById('lightTravelTargets');
    let selectedHorizonPlanet = config.defaultHorizonPlanet;
    let selectedLightPlanet = config.defaultLightPlanet;
    let baseDate = dependencies.getDate();
    let rows = [];
    let lastWidth = 0;
    let plotResizeFrame = 0;
    let currentLightTravel = null;
    let lightTimer = null;
    let lightStartedAt = 0;
    let lightElapsedSeconds = 0;
    let currentSkyState = null;
    let renderedLightDayKey = '';
    const lightDayCache = new Map();
    progressSlider.value = String(config.defaultLightProgress);

    /** Returns a shared translated label. @param {string} key Translation key. @returns {string} Localized label. */
    function text(key){
      return dependencies.getTranslations()[key];
    }

    /** Formats a number in the active language. @param {number} value Number. @param {number} digits Decimal places. @returns {string} Localized number. */
    function number(value, digits){
      return new Intl.NumberFormat(dependencies.getLanguage(), { minimumFractionDigits:digits, maximumFractionDigits:digits }).format(value);
    }

    /** Inserts localized values into one copy template. @param {string} key Translation key. @param {object} values Named text replacements. @returns {string} Completed copy. */
    function message(key, values){
      let result = text(key);
      Object.entries(values).forEach(([name, value]) => {
        result = result.replaceAll('{' + name + '}', String(value));
      });
      return result;
    }

    /** Writes plain text to a card element. @param {string} id Element id. @param {string} value Text. @returns {void} */
    function setText(id, value){
      const node = document.getElementById(id);
      if (node.textContent !== value) {
        node.textContent = value;
      }
    }

    /** Clones structural markup from HTML. @param {string} id Template id. @returns {DocumentFragment} Independent template content. */
    function clone(id){
      return document.getElementById(id).content.cloneNode(true);
    }

    /** Creates a geometry-only SVG element. @param {string} name SVG tag. @param {object} attributes SVG attributes. @returns {SVGElement} New element. */
    function svg(name, attributes){
      const node = document.createElementNS(svgNamespace, name);
      Object.entries(attributes).forEach(([key, value]) => {
        node.setAttribute(key, String(value));
      });
      return node;
    }

    /** Formats a duration without losing hour or second carries. @param {number} seconds Nonnegative travel time. @returns {string} Localized duration. */
    function duration(seconds){
      const total = Math.max(0, Math.round(seconds));
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor(total % 3600 / 60);
      const remainder = total % 60;
      if (hours > 0) {
        return message('explorer_duration_hours', { hours, minutes, seconds:remainder });
      }
      return message('explorer_duration_minutes', { minutes, seconds:remainder });
    }

    /** Formats the instant in the selected city's civil time. @param {Date} date Instant. @returns {string} Localized date, time and zone. */
    function localDateTime(date){
      return new Intl.DateTimeFormat(dependencies.getLanguage(), {
        timeZone:dependencies.getTimeZone(dependencies.getLocation()),
        year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit',
        timeZoneName:'short', hour12:false
      }).format(date);
    }

    /** Formats a location's civil clock time. @param {Date} date Instant. @returns {string} Localized hours and minutes. */
    function localClock(date){
      return new Intl.DateTimeFormat(dependencies.getLanguage(), {
        timeZone:dependencies.getTimeZone(dependencies.getLocation()),
        hour:'2-digit', minute:'2-digit', hour12:false
      }).format(date);
    }

    /** Computes geometric solar altitude using the same coordinate model as the planets. @param {Date} date Instant. @param {object} location Observer. @returns {number} Solar-center altitude in degrees. */
    function solarAltitudeAt(date, location){
      const vector = dependencies.getGeocentricVector('sun', date);
      const equatorial = model.equatorialOfDate(vector, date);
      return dependencies.getHorizontalCoordinates(date, location, equatorial).altitudeDeg;
    }

    /** Builds localized phase labels, adding twilight depth where relevant. @param {object} state Light phase and level. @returns {string} Accessible phase name. */
    function lightPhaseLabel(state){
      let label = text('horizon_phase_' + state.phase);
      if (state.phase === 'morning' || state.phase === 'evening') {
        label += ' · ' + text('horizon_twilight_' + state.level);
      }
      return label;
    }

    /** Places a persistent local-time tick in the day band. @param {number} position Percentage from start. @param {string} label Clock label. @param {string} edge Optional edge alignment. @returns {void} */
    function appendLightTick(position, label, edge){
      const fragment = clone('horizonLightTickTemplate');
      const tick = fragment.querySelector('span');
      tick.style.left = position + '%';
      tick.textContent = label;
      if (edge) {
        tick.dataset.edge = edge;
      }
      document.getElementById('horizonLightTicks').appendChild(fragment);
    }

    /** Draws a cached local day once, retaining it while the time slider moves within that day. @param {object} day Solar-day segments and events. @param {string} timeZone Selected IANA zone. @returns {void} */
    function renderLightDayBand(day, timeZone){
      const start = day.start.getTime();
      const span = day.end.getTime() - start;
      const target = document.getElementById('horizonLightSegments');
      const descriptions = [];
      target.replaceChildren();
      day.segments.forEach(segment => {
        const fragment = clone('horizonLightSegmentTemplate');
        const node = fragment.querySelector('span');
        node.dataset.phase = segment.phase;
        node.dataset.level = segment.level;
        node.dataset.key = segment.key;
        node.style.left = ((segment.start - start) / span * 100) + '%';
        node.style.width = ((segment.end - segment.start) / span * 100) + '%';
        node.title = lightPhaseLabel(segment) + ' · ' + localClock(new Date(segment.start)) + '–' + localClock(new Date(segment.end));
        descriptions.push(node.title);
        target.appendChild(fragment);
      });
      setText('horizonBandDate', new Intl.DateTimeFormat(dependencies.getLanguage(), { timeZone, dateStyle:'medium' }).format(day.start));
      document.getElementById('horizonLightBand').setAttribute('aria-label', text('horizon_day_course') + ' · ' + descriptions.join('; '));
      document.getElementById('horizonLightTicks').replaceChildren();
      appendLightTick(0, localClock(day.start), 'start');
      // Use elapsed-hour instants so repeated/skipped DST hours keep their true spacing.
      const tickClock = new Intl.DateTimeFormat('en-GB', { timeZone, hour:'2-digit', minute:'2-digit', hourCycle:'h23' });
      for (let time = start + 3600000; time < day.end.getTime(); time += 3600000) {
        const clock = tickClock.format(new Date(time));
        const hours = Number(clock.slice(0, 2));
        if (hours > 0 && hours % 6 === 0 && clock.endsWith(':00')) {
          appendLightTick((time - start) / span * 100, localClock(new Date(time)), '');
        }
      }
      appendLightTick(100, '24:00', 'end');
      let sunrise = text('horizon_no_sunrise');
      let sunset = text('horizon_no_sunset');
      if (day.sunrise) {
        sunrise = localClock(day.sunrise);
      }
      if (day.sunset) {
        sunset = localClock(day.sunset);
      }
      setText('horizonSunrise', text('sunrise') + ': ' + sunrise);
      setText('horizonSunset', text('sunset') + ': ' + sunset);
      const polarNote = document.getElementById('horizonPolarNote');
      polarNote.hidden = !day.polarDay && !day.polarNight;
      if (day.polarDay) {
        setText('horizonPolarNote', text('horizon_polar_day'));
      } else if (day.polarNight) {
        setText('horizonPolarNote', text('horizon_polar_night'));
      }
    }

    /** Updates the sky and day-band cursor for this instant without replacing controls. @param {Date} date Instant. @param {object} location Observer. @returns {void} */
    function renderHorizonLighting(date, location){
      const altitudeAt = instant => solarAltitudeAt(instant, location);
      currentSkyState = model.solarLightAt(date, altitudeAt);
      horizonCard.dataset.skyPhase = currentSkyState.phase;
      horizonCard.dataset.skyLevel = currentSkyState.level;
      setText('horizonLightState', text('horizon_phase_' + currentSkyState.phase));
      let noteKey = 'horizon_twilight';
      if (currentSkyState.phase === 'day') {
        noteKey = 'horizon_daylight';
      } else if (currentSkyState.phase === 'night') {
        noteKey = 'horizon_dark';
      }
      setText('horizonDaylight', text(noteKey));
      const timeZone = dependencies.getTimeZone(location);
      const localDate = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).format(date);
      const key = location.latitude + ':' + location.longitude + ':' + timeZone + ':' + localDate;
      if (!lightDayCache.has(key)) {
        lightDayCache.set(key, model.solarLightDay(date, timeZone, altitudeAt));
        if (lightDayCache.size > 3) {
          lightDayCache.delete(lightDayCache.keys().next().value);
        }
      }
      const day = lightDayCache.get(key);
      const renderKey = key + ':' + dependencies.getLanguage();
      if (renderKey !== renderedLightDayKey) {
        renderLightDayBand(day, timeZone);
        renderedLightDayKey = renderKey;
      }
      const position = (date.getTime() - day.start.getTime()) / (day.end.getTime() - day.start.getTime()) * 100;
      document.getElementById('horizonLightCursor').style.left = Math.min(100, Math.max(0, position)) + '%';
    }

    /** Shows model-range information only for extrapolated dates. @param {string} id Note element id. @param {Date} date Computed instant. @returns {void} */
    function updateAccuracyNote(id, date){
      const note = document.getElementById(id);
      const year = date.getUTCFullYear();
      note.hidden = year >= 1800 && year <= 2050;
      note.textContent = text('explorer_model_range');
    }

    /** Builds persistent planet and target controls from reusable templates. @returns {void} */
    function buildControls(){
      config.horizonPlanetKeys.forEach(key => {
        const fragment = clone('horizonPlanetTemplate');
        fragment.querySelector('button').dataset.horizonPlanet = key;
        planetList.appendChild(fragment);
      });
      config.lightPlanetKeys.forEach(key => {
        const fragment = clone('lightTravelTargetTemplate');
        fragment.querySelector('button').dataset.lightPlanet = key;
        lightTargets.appendChild(fragment);
      });
      config.lightPhaseKeys.forEach(phase => {
        const fragment = clone('horizonLightLegendTemplate');
        fragment.querySelector('i').dataset.phase = phase;
        fragment.querySelector('[data-light-phase-name]').dataset.lightPhaseName = phase;
        document.getElementById('horizonLightLegend').appendChild(fragment);
      });
    }

    /** Refreshes static copy, including accessible control labels. @returns {void} */
    function translate(){
      document.querySelectorAll('[data-explorer-text]').forEach(node => {
        node.textContent = text(node.dataset.explorerText);
      });
      plot.setAttribute('aria-label', text('horizon_plot_aria'));
      timeSlider.setAttribute('aria-label', text('horizon_explore_time'));
      progressSlider.setAttribute('aria-label', text('light_follow'));
      lightTargets.setAttribute('aria-label', text('light_targets'));
      lightTargets.querySelectorAll('button').forEach(button => {
        button.textContent = text('planet_' + button.dataset.lightPlanet);
      });
      document.querySelectorAll('[data-light-phase-name]').forEach(node => {
        node.textContent = text('horizon_phase_' + node.dataset.lightPhaseName);
      });
    }

    /** Returns the cardinal direction nearest an azimuth. @param {number} azimuth Degrees clockwise from north. @returns {string} Localized cardinal/intercardinal label. */
    function direction(azimuth){
      return text('explorer_directions')[Math.round(azimuth / 45) % 8];
    }

    /** Finds an unclipped label position, omitting optional labels when crowded. @param {number} x Marker x. @param {number} y Marker y. @param {string} label Text. @param {number} width Plot width. @param {Array<object>} boxes Occupied labels. @returns {object|null} Label box or no suitable space. */
    function labelPosition(x, y, label, width, boxes){
      const labelWidth = label.length * 7.5 + 8;
      const center = Math.min(width - 12 - labelWidth / 2, Math.max(36 + labelWidth / 2, x));
      const offsets = [-17, 23, -36, 42, -55, 61, -74, 80];
      for (const offset of offsets) {
        const baseline = Math.max(18, Math.min(253, y + offset));
        const box = { left:center - labelWidth / 2, right:center + labelWidth / 2, top:baseline - 13, bottom:baseline + 3, x:center, y:baseline };
        const overlaps = boxes.some(other => box.left < other.right + 4 && box.right > other.left - 4 && box.top < other.bottom + 4 && box.bottom > other.top - 4);
        if (!overlaps) {
          boxes.push(box);
          return box;
        }
      }
      return null;
    }

    /** Updates existing markers and their labels without replacing plot or control nodes. @returns {void} */
    function updateHorizonMarkers(){
      const left = 36;
      const right = lastWidth - 14;
      const top = 30;
      const bottom = 254;
      const boxes = [];
      const selected = rows.find(row => row.key === selectedHorizonPlanet);
      const ordered = rows.filter(row => row.key !== selectedHorizonPlanet);
      ordered.unshift(selected);
      ordered.forEach(row => {
        const group = plot.querySelector('[data-planet="' + row.key + '"]');
        const x = left + row.azimuthDeg / 360 * (right - left);
        const y = bottom - (row.altitudeDeg + 90) / 180 * (bottom - top);
        group.dataset.altitude = row.altitudeDeg;
        group.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
        const title = group.querySelector('title');
        const titleText = row.name + ' · ' + number(row.altitudeDeg, 1) + '° · ' + direction(row.azimuthDeg);
        if (title.textContent !== titleText) {
          title.textContent = titleText;
        }
        group.classList.toggle('is-selected', row.key === selectedHorizonPlanet);
        group.classList.toggle('is-below', row.altitudeDeg < 0);
        let label = String(row.index + 1);
        if (row.key === selectedHorizonPlanet) {
          label = row.name;
        }
        const box = labelPosition(x, y, label, lastWidth, boxes);
        const labelNode = group.querySelector('text');
        if (box) {
          if (labelNode.textContent !== label) {
            labelNode.textContent = label;
          }
          labelNode.setAttribute('x', box.x - x);
          labelNode.setAttribute('y', box.y - y);
        } else {
          labelNode.textContent = '';
        }
      });
      // Keep the selected dot visible in a cluster while retaining its DOM identity.
      const selectedGroup = plot.querySelector('[data-planet="' + selectedHorizonPlanet + '"]');
      if (plot.lastElementChild !== selectedGroup) {
        plot.appendChild(selectedGroup);
      }
    }

    /** Draws the panorama structure only when its width changes; updates existing markers otherwise. @returns {void} */
    function drawHorizon(){
      const width = Math.max(220, plot.getBoundingClientRect().width);
      if (width === lastWidth && plot.querySelectorAll('.horizon-marker').length === rows.length) {
        updateHorizonMarkers();
        return;
      }
      lastWidth = width;
      const left = 36;
      const right = width - 14;
      const top = 30;
      const bottom = 254;
      const horizonY = (top + bottom) / 2;
      plot.setAttribute('viewBox', '0 0 ' + width + ' 300');
      plot.replaceChildren();
      const skyFragment = clone('horizonSkyTemplate');
      const sky = skyFragment.querySelector('rect');
      sky.setAttribute('x', String(left));
      sky.setAttribute('y', String(top));
      sky.setAttribute('width', String(right - left));
      sky.setAttribute('height', String(horizonY - top));
      plot.appendChild(skyFragment.querySelector('defs'));
      plot.appendChild(sky);
      plot.appendChild(svg('rect', { x:left, y:horizonY, width:right - left, height:bottom - horizonY, class:'horizon-ground' }));
      [-90, -45, 0, 45, 90].forEach(altitude => {
        const y = bottom - (altitude + 90) / 180 * (bottom - top);
        const line = svg('line', { x1:left, y1:y, x2:right, y2:y, class:'horizon-grid-line' });
        line.classList.toggle('is-sky', altitude > 0);
        plot.appendChild(line);
        const label = svg('text', { x:0, y:y + 4 });
        label.textContent = altitude + '°';
        plot.appendChild(label);
      });
      plot.appendChild(svg('line', { x1:left, y1:horizonY, x2:right, y2:horizonY, class:'horizon-line' }));
      [0, 90, 180, 270, 360].forEach(azimuth => {
        const x = left + azimuth / 360 * (right - left);
        const label = svg('text', { x, y:282, 'text-anchor':'middle' });
        label.textContent = direction(azimuth);
        plot.appendChild(label);
      });
      rows.forEach(row => {
        const fragment = clone('horizonMarkerTemplate');
        const group = fragment.querySelector('g');
        group.dataset.planet = row.key;
        plot.appendChild(group);
      });
      updateHorizonMarkers();
    }

    /** Changes just the selected planet's button state, plot emphasis and detail text. @returns {void} */
    function renderHorizonSelection(){
      planetList.querySelectorAll('[data-horizon-planet]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.horizonPlanet === selectedHorizonPlanet));
      });
      const selected = rows.find(row => row.key === selectedHorizonPlanet);
      let statusKey = 'horizon_selected_above';
      if (selected.altitudeDeg < 0) {
        statusKey = 'horizon_selected_below';
      }
      let conditionKey = 'horizon_condition_twilight';
      if (currentSkyState.phase === 'day') {
        conditionKey = 'horizon_condition_day';
      } else if (currentSkyState.phase === 'night') {
        conditionKey = 'horizon_condition_night';
      }
      let estimate = '';
      const altitudeEstimate = dependencies.getAltitudeEstimate(selected.altitudeDeg);
      if (altitudeEstimate) {
        estimate = message('horizon_altitude_estimate', { estimate:altitudeEstimate });
      }
      let detail = message(statusKey, { name:selected.name, altitude:number(Math.abs(selected.altitudeDeg), 1), estimate, direction:direction(selected.azimuthDeg), azimuth:number(selected.azimuthDeg, 0), condition:text(conditionKey) });
      if (selected.key === 'uranus' || selected.key === 'neptune') {
        detail += ' ' + text('horizon_optics');
      }
      setText('horizonSelection', detail);
    }

    /** Computes and renders positions for the shared date plus the local time offset. @returns {void} */
    function renderHorizon(){
      const date = new Date(baseDate.getTime() + Number(timeSlider.value) * 3600000);
      const location = dependencies.getLocation();
      rows = config.horizonPlanetKeys.map((key, index) => {
        const vector = dependencies.getGeocentricVector(key, date);
        const equatorial = model.equatorialOfDate(vector, date);
        const horizontal = dependencies.getHorizontalCoordinates(date, location, equatorial);
        return { key, index, name:text('planet_' + key), ...horizontal };
      });
      setText('horizonContext', location.name + ' · ' + localDateTime(date));
      updateAccuracyNote('horizonAccuracy', date);
      let offsetLabel = text('horizon_shared_time');
      const offset = Number(timeSlider.value);
      if (offset > 0) {
        offsetLabel = '+' + number(offset, 1) + ' h';
      } else if (offset < 0) {
        offsetLabel = number(offset, 1) + ' h';
      }
      setText('horizonTimeValue', offsetLabel);
      timeSlider.setAttribute('aria-valuetext', localDateTime(date));
      rows.forEach(row => {
        const button = planetList.querySelector('[data-horizon-planet="' + row.key + '"]');
        button.querySelector('[data-horizon-name]').textContent = String(row.index + 1) + ' · ' + row.name;
        let status = number(row.altitudeDeg, 1) + '° · ' + direction(row.azimuthDeg);
        if (row.altitudeDeg < 0) {
          status += ' · ' + text('horizon_below');
        }
        button.querySelector('[data-horizon-position]').textContent = status;
        button.classList.toggle('is-below', row.altitudeDeg < 0);
      });
      renderHorizonLighting(date, location);
      renderHorizonSelection();
      drawHorizon();
    }

    /** Updates route labels and caches the one-way duration, retaining an active or completed journey. @returns {void} */
    function renderLight(){
      const planetName = text('planet_' + selectedLightPlanet);
      const position = dependencies.getHeliocentricPosition(selectedLightPlanet, baseDate);
      let travel = currentLightTravel;
      if (!travel || lightElapsedSeconds === 0) {
        travel = model.lightTravel(position);
      }
      currentLightTravel = travel;
      setText('lightTravelDuration', duration(travel.seconds));
      setText('lightTravelRoute', text('eclipse_sun') + ' → ' + planetName);
      setText('lightTravelTargetName', planetName);
      setText('lightTravelDistance', message('light_distance', { au:number(travel.distanceAu, 3), km:number(travel.distanceKm / 1000000, 1) }));
      setText('lightTravelDate', message('light_date', { date:localDateTime(baseDate) }));
      updateAccuracyNote('lightTravelAccuracy', baseDate);
      lightTargets.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.lightPlanet === selectedLightPlanet));
      });
      renderLightProgress();
    }

    /** Displays elapsed time, remaining time and fractional progress from the cached journey. @returns {void} */
    function renderLightProgress(){
      const planetName = text('planet_' + selectedLightPlanet);
      // Keep displayed whole-second counters consistent, including the final fractional second.
      const totalSeconds = Math.round(currentLightTravel.seconds);
      let elapsed = Math.min(totalSeconds, Math.floor(lightElapsedSeconds));
      if (lightElapsedSeconds >= currentLightTravel.seconds) {
        elapsed = totalSeconds;
      }
      progressSlider.value = String(Math.min(100, lightElapsedSeconds / currentLightTravel.seconds * 100));
      const remaining = totalSeconds - elapsed;
      setText('lightTravelElapsed', duration(elapsed));
      setText('lightTravelRemaining', message('light_remaining', { duration:duration(remaining), planet:planetName }));
      progressSlider.setAttribute('aria-valuetext', message('light_elapsed', { duration:duration(elapsed), total:duration(totalSeconds) }));
      document.getElementById('lightTravelBeam').style.width = progressSlider.value + '%';
      document.getElementById('lightTravelPhoton').style.left = progressSlider.value + '%';
      let stateKey = 'light_ready';
      if (lightTimer !== null) {
        stateKey = 'light_running';
      } else if (lightElapsedSeconds >= currentLightTravel.seconds) {
        stateKey = 'light_arrived';
      }
      setText('lightTravelState', text(stateKey));
      document.getElementById('lightTravelStart').disabled = lightTimer !== null;
    }

    /** Refreshes both cards while retaining local choices. @param {Date} date Shared dashboard instant. @returns {void} */
    function render(date){
      if (Math.abs(date.getTime() - baseDate.getTime()) > 12 * 3600000) {
        resetLight();
      }
      baseDate = new Date(date.getTime());
      translate();
      renderHorizon();
      renderLight();
      dependencies.requestLayout();
    }

    /** Selects a planet from the horizon list. @param {MouseEvent} event Delegated button click. @returns {void} */
    function selectHorizonPlanet(event){
      const button = event.target.closest('[data-horizon-planet]');
      if (button) {
        if (selectedHorizonPlanet === button.dataset.horizonPlanet) {
          return;
        }
        selectedHorizonPlanet = button.dataset.horizonPlanet;
        renderHorizonSelection();
        updateHorizonMarkers();
        dependencies.updateCardLayout(planetList.closest('.display-container'));
      }
    }

    /** Selects a sunlight destination. @param {MouseEvent} event Delegated target click. @returns {void} */
    function selectLightPlanet(event){
      const button = event.target.closest('[data-light-planet]');
      if (button) {
        if (selectedLightPlanet === button.dataset.lightPlanet) {
          return;
        }
        resetLight();
        selectedLightPlanet = button.dataset.lightPlanet;
        renderLight();
        dependencies.updateCardLayout(lightTargets.closest('.display-container'));
      }
    }

    /** Changes only the horizon's exploratory time. @returns {void} */
    function exploreTime(){
      renderHorizon();
      dependencies.updateCardLayout(planetList.closest('.display-container'));
    }

    /**
     * Advances cached progress p = min(1, elapsedSeconds / travelSeconds) in real time.
     * Monotonic elapsed time includes delayed background updates without accumulating timer drift.
     * No parameters. @returns {void}
     */
    function advanceLight(){
      lightElapsedSeconds = Math.min(currentLightTravel.seconds, (performance.now() - lightStartedAt) / 1000);
      if (lightElapsedSeconds >= currentLightTravel.seconds) {
        clearInterval(lightTimer);
        lightTimer = null;
      }
      renderLightProgress();
    }

    /** Starts at the chosen progress, or restarts at zero after arrival. No parameters. @returns {void} */
    function startLight(){
      if (lightTimer !== null) {
        return;
      }
      if (lightElapsedSeconds >= currentLightTravel.seconds) {
        lightElapsedSeconds = 0;
      }
      lightStartedAt = performance.now() - lightElapsedSeconds * 1000;
      lightTimer = setInterval(advanceLight, 250);
      renderLightProgress();
      dependencies.updateCardLayout(lightTargets.closest('.display-container'));
    }

    /**
     * Seeks to the selected percentage; an active journey continues from that instant.
     * No parameters. @returns {void}
     */
    function seekLight(){
      lightElapsedSeconds = currentLightTravel.seconds * Number(progressSlider.value) / 100;
      lightStartedAt = performance.now() - lightElapsedSeconds * 1000;
      if (lightElapsedSeconds >= currentLightTravel.seconds && lightTimer !== null) {
        clearInterval(lightTimer);
        lightTimer = null;
      }
      renderLightProgress();
      dependencies.updateCardLayout(lightTargets.closest('.display-container'));
    }

    /** Stops the journey and restores zero progress. No parameters. @returns {void} */
    function resetLight(){
      clearInterval(lightTimer);
      lightTimer = null;
      lightElapsedSeconds = 0;
      if (currentLightTravel) {
        renderLightProgress();
      }
    }

    /** Restores the horizon to the shared dashboard time. @returns {void} */
    function resetTime(){
      timeSlider.value = '0';
      exploreTime();
    }

    /** Redraws the panorama after an actual width change without restarting masonry loops. @returns {void} */
    function resizePlot(){
      if (rows.length && Math.abs(plot.getBoundingClientRect().width - lastWidth) > 0.5) {
        drawHorizon();
      }
    }

    /**
     * Defers responsive SVG drawing until after observer delivery and batches notifications.
     * No parameters.
     * @returns {void}
     */
    function schedulePlotResize(){
      if (plotResizeFrame) {
        return;
      }
      plotResizeFrame = requestAnimationFrame(() => {
        plotResizeFrame = 0;
        resizePlot();
      });
    }

    buildControls();
    planetList.addEventListener('click', selectHorizonPlanet);
    lightTargets.addEventListener('click', selectLightPlanet);
    timeSlider.addEventListener('input', exploreTime);
    progressSlider.addEventListener('input', seekLight);
    document.getElementById('lightTravelStart').addEventListener('click', startLight);
    document.getElementById('lightTravelReset').addEventListener('click', resetLight);
    document.getElementById('horizonReset').addEventListener('click', resetTime);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(schedulePlotResize);
      observer.observe(plot);
    } else {
      window.addEventListener('resize', schedulePlotResize);
    }
    return { render };
  }

  return { create };
})();
