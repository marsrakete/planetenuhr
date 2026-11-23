window.PLANETENUHR_SPACE_MISSION_ANIMATION = (() => {
  'use strict';

  const DAY_MS = 86400000;
  const planetPeriods = {mercury:87.97, venus:224.7, earth:365.26, mars:686.98, jupiter:4332.59};
  const planetRadii = {mercury:.47, venus:.73, earth:1.02, mars:1.67, jupiter:5.46};

  /** Sets orbit labels to the same visible size at every SVG scale.
   * @param {SVGSVGElement} plot Diagram with a defined viewBox.
   * @param {number} [width] Measured diagram width in CSS pixels.
   * @returns {number} Label size in SVG units, or zero while hidden.
   */
  function fitPlotLabels(plot, width = plot.getBoundingClientRect().width) {
    if (!(width > 0)) {
      return 0;
    }
    const size = 12 * plot.viewBox.baseVal.width / width;
    plot.style.setProperty('--mission-plot-label-size', size + 'px');
    return size;
  }

  /** Runs shared linear playback on a mission slider.
   * @param {object} callbacks Reads the range and duration and updates the frame and play label.
   * @returns {{toggle:Function,pause:Function,isPlaying:Function}} Playback controls.
   */
  function createPlayback({getValue, getMax, getDuration, onFrame, onState}) {
    let timer = null;
    let from;
    let start;
    let range;
    let duration;

    function pause() {
      if (timer !== null) {
        cancelAnimationFrame(timer);
        timer = null;
        onState(false);
      }
    }

    function frame(now) {
      const current = Math.min(range, from + (now - start) * range / duration);
      onFrame(current);
      if (current >= range) {
        pause();
      } else if (timer !== null) {
        timer = requestAnimationFrame(frame);
      }
    }

    function toggle() {
      if (timer !== null) {
        pause();
        return;
      }
      range = getMax();
      duration = getDuration();
      from = getValue();
      if (from >= range) {
        from = 0;
      }
      start = performance.now();
      timer = requestAnimationFrame(frame);
      onState(true);
    }

    return {toggle, pause, isPlaying: () => timer !== null};
  }

  /** Classifies the selected UTC day using the cutoff published with the solution.
   * @param {number} timestamp UTC milliseconds.
   * @param {string|null} trackingThrough Last tracking-based date.
   * @returns {string} Translation key for the trajectory provenance.
   */
  function dataStatus(timestamp, trackingThrough) {
    if (!trackingThrough || !Number.isFinite(timestamp)) {
      return 'vectorData';
    }
    if (timestamp < Date.parse(trackingThrough) + DAY_MS) {
      return 'trackingBased';
    }
    return 'predicted';
  }

  /** Builds a face-on projection using the mean angular-momentum direction of the orbit.
   * @param {number[][]} rows Ordered position vectors [time, x, y, z].
   * @returns {Function|null} Mapper from Cartesian vectors to two in-plane coordinates.
   */
  function orbitalProjection(rows) {
    const cross = ([ax, ay, az], [bx, by, bz]) =>
      [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const normal = [0, 0, 0];
    for (let index = 1; index < rows.length; index += 1) {
      const area = cross(rows[index - 1].slice(1), rows[index].slice(1));
      for (let axis = 0; axis < 3; axis += 1) {
        normal[axis] += area[axis];
      }
    }
    const length = Math.hypot(...normal);
    if (!length || !Number.isFinite(length)) {
      return null;
    }
    const unitNormal = normal.map(value => value / length);
    const north = [0, 0, 1];
    const reference = Math.abs(unitNormal[2]) < .95 ? north : [0, 1, 0];
    const horizontal = cross(reference, unitNormal);
    const width = Math.hypot(...horizontal);
    const right = horizontal.map(value => value / width);
    const up = cross(unitNormal, right);
    return (x, y, z) => {
      const point = [x, y, z];
      return [dot(point, right), dot(point, up)];
    };
  }

  /** Mounts a local animation with its own slider and playback state.
   * @param {HTMLElement} root Animation container.
   * @param {object} mission Mission definition with one or more views.
   * @param {object} dependencies Templates, localization, position and data adapters.
   * @returns {{render:Function,seek:Function,canSeek:Function,pause:Function}} Animation controls.
   */
  function create(root, mission, {trajectories, getLanguage, getTranslations, getHeliocentricPosition, positionAt}) {
    const document = root.ownerDocument;
    const template = document.getElementById('spaceMissionAnimationTemplate');
    const markerTemplate = document.getElementById('spaceMissionMarkerTemplate');
    const buttonTemplate = document.getElementById('idefixControlTemplate');
    const linkTemplate = document.getElementById('idefixLinkTemplate');
    root.append(template.content.cloneNode(true));
    const plot = root.querySelector('svg');
    const referenceOrbits = root.querySelector('.mission-reference-orbits');
    const routeOverview = root.querySelector('.mission-route-overview');
    const referenceBodies = root.querySelector('.mission-reference-bodies');
    const trackedPath = root.querySelector('.mission-tracked-path');
    const predictedPath = root.querySelector('.mission-predicted-path');
    const mioPath = root.querySelector('.mission-mio-track');
    const spacecraft = root.querySelector('.mission-spacecraft');
    const viewButtons = root.querySelector('.mission-animation-views');
    const slider = root.querySelector('.mission-time');
    const label = root.querySelector('.mission-time-label');
    const output = root.querySelector('.mission-time-readout');
    const dashboardStatus = root.querySelector('.mission-dashboard-status');
    const play = root.querySelector('.mission-play');
    const source = root.querySelector('.mission-animation-source');
    const sourceLinks = root.querySelector('.mission-animation-links');
    const sourceLink = linkTemplate.content.firstElementChild.cloneNode(true);
    const secondaryLink = linkTemplate.content.firstElementChild.cloneNode(true);
    sourceLinks.append(sourceLink, secondaryLink);
    slider.id = 'mission-time-' + mission.id;
    label.htmlFor = slider.id;
    output.htmlFor = slider.id;

    const views = mission.views.map(view => ({
      ...view, data:trajectories[view.key], secondaryData:trajectories[view.secondary]
    }));
    const positions = new Map();
    let view;
    let scale;
    let orbitPlane;
    let originY;
    let bodies = [];
    let probe;
    let secondaryProbe;
    let routeTracks = [];
    const playback = createPlayback({
      getValue: () => Number(slider.value),
      getMax: () => Number(slider.max),
      getDuration: () => view.stages ? 9000 : 22000,
      onFrame(current) {
        slider.value = String(Math.floor(current));
        drawFrame(current);
      },
      onState: playing => { play.textContent = text(playing ? 'pause' : 'play'); }
    });
    let language;
    let dashboardDate;
    let missingDashboardDate = false;
    let dateFormatter;
    let timeFormatter;

    function text(key) {
      return getTranslations()['space_' + key];
    }

    function project(x, y, z = 0) {
      if (orbitPlane) {
        [x, y] = orbitPlane(x, y, z);
      }
      return [300 + x * scale, originY - y * scale];
    }

    function move(node, x, y, z) {
      node.setAttribute('transform', 'translate(' + project(x, y, z).join(' ') + ')');
    }

    function pathFor(points) {
      return points.map(([x, y], index) => {
        const point = project(x, y);
        return (index === 0 ? 'M' : 'L') + point.map(value => value.toFixed(2)).join(' ');
      }).join(' ');
    }

    function marker(group, name, radius, className) {
      const node = markerTemplate.content.querySelector('g').cloneNode(true);
      node.classList.add(className);
      node.querySelector('circle').setAttribute('r', radius);
      node.querySelector('text').textContent = name;
      group.append(node);
      return node;
    }

    function dateValue() {
      if (view.stages) {
        return Number(slider.value);
      }
      return view.data.rows[0][0] + Number(slider.value) * 60000;
    }

    function drawFrame(stageProgress) {
      const selected = dateValue();
      let caption;
      if (view.stages) {
        const stage = view.stages[selected];
        const next = view.stages[Math.min(selected + 1, view.stages.length - 1)];
        const fraction = stageProgress === undefined ? 0 : stageProgress - selected;
        move(probe, stage[1] + (next[1] - stage[1]) * fraction, stage[2] + (next[2] - stage[2]) * fraction);
        probe.dataset.stage = stage[0];
        caption = text(stage[0]);
      } else {
        const date = new Date(selected);
        const position = positionAt(view.data.rows, date);
        move(probe, position.x, position.y, position.z);
        drawElapsedRoute(selected);
        for (const {key, node} of bodies) {
          const body = getHeliocentricPosition(key, date);
          move(node, body.x, body.y);
        }
        if (secondaryProbe) {
          const secondary = positionAt(view.secondaryData.rows, date);
          secondaryProbe.style.display = secondary ? '' : 'none';
          const beforeSeparation = selected < view.secondaryData.rows[0][0];
          probe.querySelector('text').textContent = beforeSeparation ? 'MPO + Mio' : view.marker;
          if (secondary) {
            move(secondaryProbe, secondary.x, secondary.y, secondary.z);
          }
        }
        const formatter = view.planets ? dateFormatter : timeFormatter;
        caption = formatter.format(date) + ' · ' + text(dataStatus(selected, view.data.trackingThrough));
      }
      output.textContent = caption;
      slider.setAttribute('aria-valuetext', caption);
      plot.setAttribute('aria-label', text(view.label) + ' · ' + caption);
      positions.set(view.key, Number(slider.value));
    }

    function describeSource() {
      sourceLink.href = view.source || view.data.url;
      sourceLink.textContent = view.stages ? text('nasaAnimation') : 'NASA/JPL Horizons';
      secondaryLink.hidden = !view.secondaryData;
      if (view.secondaryData) {
        secondaryLink.href = view.secondaryData.url;
        secondaryLink.textContent = 'ESA SPICE · Mio';
      }
      if (view.stages) {
        source.textContent = text('landingSource');
        return;
      }
      const {rows, revised, trackingThrough, step} = view.data;
      const coverage = dateFormatter.format(new Date(rows[0][0])) + ' – ' +
        dateFormatter.format(new Date(rows.at(-1)[0]));
      const precision = step.endsWith(' d') ? text('sampleDays') : text('sampleMinutes');
      const details = [
        text('solutionDate') + ' ' + dateFormatter.format(new Date(revised)),
        coverage,
        precision.replace('{n}', step.split(' ')[0]),
        text(orbitPlane ? 'orbitPlaneFrame' : view.planets ? 'sunFrame' : 'localFrame')
      ];
      if (trackingThrough) {
        details.push(text('trackingCutoff') + ' ' + dateFormatter.format(new Date(trackingThrough)));
      }
      if (view.secondaryData) {
        details.push(text('mioSource') + ' · ' + text('solutionDate') + ' ' +
          dateFormatter.format(new Date(view.secondaryData.revised)));
      }
      source.textContent = details.join(' · ');
    }

    function updateLabels() {
      const translations = getTranslations();
      dateFormatter = new Intl.DateTimeFormat(language, {dateStyle:'medium', timeZone:'UTC'});
      timeFormatter = new Intl.DateTimeFormat(language, {
        year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'UTC', timeZoneName:'short'
      });
      label.textContent = text(view.stages ? 'landingStage' : 'localTime');
      viewButtons.setAttribute('aria-label', text('views'));
      buttons.forEach(({node, config}) => {
        node.textContent = text(config.label);
        node.setAttribute('aria-pressed', String(config === view));
      });
      for (const {key, node} of bodies) {
        node.querySelector('text').textContent = translations['planet_' + key];
      }
      referenceBodies.querySelector('.mission-center text').textContent =
        view.bodyName || translations[view.body || 'eclipse_sun'];
      play.textContent = text(playback.isPlaying() ? 'pause' : 'play');
      renderDashboardStatus();
      describeSource();
      drawFrame();
    }

    function prepareTrajectory() {
      function track(rows, forecast, secondary = false) {
        return {rows, forecast, secondary, commands: rows.map(([, x, y, z], index) =>
          (index === 0 ? 'M' : 'L') + project(x, y, z).map(value => value.toFixed(2)).join(' '))};
      }

      const {rows, trackingThrough} = view.data;
      const cutoff = Date.parse(trackingThrough) + DAY_MS;
      routeTracks = [];
      if (trackingThrough && cutoff <= rows[0][0]) {
        routeTracks.push(track(rows, true));
      } else if (trackingThrough && cutoff <= rows.at(-1)[0]) {
        const firstPrediction = rows.findIndex(row => row[0] >= cutoff);
        const boundary = positionAt(rows, new Date(cutoff));
        const boundaryRow = [cutoff, boundary.x, boundary.y, boundary.z];
        routeTracks.push(track([...rows.slice(0, firstPrediction), boundaryRow], false));
        const firstAfter = rows[firstPrediction][0] === cutoff ? firstPrediction + 1 : firstPrediction;
        routeTracks.push(track([boundaryRow, ...rows.slice(firstAfter)], true));
      } else {
        routeTracks.push(track(rows, false));
      }
      if (view.secondaryData) {
        routeTracks.push(track(view.secondaryData.rows, true, true));
        secondaryProbe = marker(spacecraft, 'Mio', 5, 'mission-mio');
      }
      routeOverview.setAttribute('d', routeTracks.map(route => route.commands.join(' ')).join(' '));
    }

    function drawElapsedRoute(selected) {
      const tracked = [];
      const predicted = [];
      let mio = '';
      for (const {rows, forecast, secondary, commands} of routeTracks) {
        const firstFuture = rows.findIndex(row => row[0] > selected);
        if (firstFuture === 0) {
          continue;
        }
        let segment = commands.join(' ');
        if (firstFuture > 0) {
          const point = positionAt(rows, new Date(selected));
          segment = commands.slice(0, firstFuture).join(' ') +
            ' L' + project(point.x, point.y, point.z).map(value => value.toFixed(2)).join(' ');
        }
        if (secondary) {
          mio = segment;
        } else {
          (forecast ? predicted : tracked).push(segment);
        }
      }
      trackedPath.setAttribute('d', tracked.join(' '));
      predictedPath.setAttribute('d', predicted.join(' '));
      mioPath.setAttribute('d', mio);
    }

    function select(config) {
      pause();
      view = config;
      referenceBodies.replaceChildren();
      spacecraft.replaceChildren();
      bodies = [];
      secondaryProbe = null;
      const {planets, stages} = view;
      orbitPlane = view.faceOn ? orbitalProjection(view.data.rows) : null;
      plot.setAttribute('viewBox', orbitPlane ? '90 0 420 380' : '0 0 600 380');
      fitPlotLabels(plot);
      originY = stages ? 305 : 185;
      let centerRadius = 8;
      if (stages) {
        scale = 94;
        routeOverview.setAttribute('d', '');
        slider.max = String(stages.length - 1);
        trackedPath.setAttribute('d', '');
        predictedPath.setAttribute('d', pathFor(stages.map(([, x, y]) => [x, y])));
        referenceOrbits.setAttribute('d', 'M 42 305 L 558 305');
      } else {
        const projectedDistance = ([, x, y, z]) => orbitPlane ? Math.hypot(...orbitPlane(x, y, z)) : Math.hypot(x, y);
        const distances = view.data.rows.map(projectedDistance);
        if (view.secondaryData) {
          distances.push(...view.secondaryData.rows.map(projectedDistance));
        }
        const extent = Math.max(view.radius || 0, ...distances, ...(planets || []).map(key => planetRadii[key]));
        scale = 145 / extent;
        if (view.radius) {
          centerRadius = Math.max(4, view.radius * scale);
        }
        const {rows} = view.data;
        slider.max = String((rows.at(-1)[0] - rows[0][0]) / 60000);
        const orbitalPaths = (planets || []).map(key => {
          const points = Array.from({length:121}, (_, index) => {
            const date = new Date(rows[0][0] + planetPeriods[key] * DAY_MS * index / 120);
            const position = getHeliocentricPosition(key, date);
            return [position.x, position.y];
          });
          bodies.push({key, node:marker(referenceBodies, '', 4, 'mission-planet')});
          return pathFor(points);
        });
        referenceOrbits.setAttribute('d', orbitalPaths.join(' '));
        prepareTrajectory();
      }
      const center = marker(referenceBodies, '', centerRadius, 'mission-center');
      move(center, 0, 0);
      if (stages) {
        center.querySelector('circle').setAttribute('r', 0);
        center.querySelector('text').setAttribute('y', 27);
      }
      if (stages) {
        const lander = document.getElementById('spaceMissionLanderTemplate');
        probe = lander.content.querySelector('g').cloneNode(true);
        spacecraft.append(probe);
      } else {
        probe = marker(spacecraft, view.marker || mission.name, 5, 'mission-probe');
      }
      let initial = positions.get(view.key);
      if (initial === undefined) {
        initial = 0;
        if (planets) {
          initial = Math.round((Date.now() - view.data.rows[0][0]) / 60000);
        }
      }
      slider.value = String(Math.max(0, Math.min(initial, Number(slider.max))));
      updateLabels();
    }

    function pause() {
      playback.pause();
    }

    function matchingView(date) {
      const timestamp = new Date(date).getTime();
      return [...views].reverse().find(config =>
        coversDate(config, timestamp));
    }

    function coversDate(config, timestamp) {
      return config.data && timestamp >= config.data.rows[0][0] && timestamp <= config.data.rows.at(-1)[0];
    }

    function renderDashboardStatus() {
      dashboardStatus.hidden = !missingDashboardDate;
      if (missingDashboardDate) {
        dashboardStatus.textContent = text('dashboardUncovered').replace('{date}', dateFormatter.format(dashboardDate));
      }
    }

    function clearDashboardStatus() {
      missingDashboardDate = false;
      renderDashboardStatus();
    }

    function setPosition(targetView, timestamp) {
      pause();
      if (targetView !== view) {
        select(targetView);
      }
      slider.value = String(Math.round((timestamp - view.data.rows[0][0]) / 60000));
      drawFrame();
    }

    function useDashboardDate() {
      if (!dashboardDate || view.stages) {
        return;
      }
      const timestamp = dashboardDate.getTime();
      const targetView = [view, ...views].find(config => coversDate(config, timestamp));
      if (targetView) {
        clearDashboardStatus();
        setPosition(targetView, timestamp);
      } else {
        pause();
        missingDashboardDate = true;
        renderDashboardStatus();
      }
    }

    function seek(date) {
      const targetView = matchingView(date);
      if (targetView) {
        clearDashboardStatus();
        setPosition(targetView, Date.parse(date));
      }
    }

    const buttons = views.map(config => {
      const node = buttonTemplate.content.firstElementChild.cloneNode(true);
      node.addEventListener('click', () => {
        clearDashboardStatus();
        select(config);
      });
      viewButtons.append(node);
      return {node, config};
    });
    viewButtons.hidden = views.length === 1;
    slider.addEventListener('input', () => {
      pause();
      clearDashboardStatus();
      drawFrame();
    });
    play.addEventListener('click', () => {
      clearDashboardStatus();
      playback.toggle();
    });

    language = getLanguage();
    select(views[0]);
    const resizeLabels = () => fitPlotLabels(plot);
    if ('ResizeObserver' in window) {
      new ResizeObserver(resizeLabels).observe(plot);
    } else {
      window.addEventListener('resize', resizeLabels);
    }
    return {pause, seek, canSeek: date => Boolean(matchingView(date)), render(date, resetLocal = false) {
      const next = getLanguage();
      if (language !== next) {
        language = next;
        updateLabels();
      }
      if (date) {
        const changed = !dashboardDate || Math.abs(date.getTime() - dashboardDate.getTime()) > DAY_MS / 2;
        dashboardDate = new Date(date.getTime());
        if (changed || resetLocal) {
          useDashboardDate();
        }
      }
    }};
  }

  return {create, dataStatus, createPlayback, orbitalProjection, fitPlotLabels};
})();
