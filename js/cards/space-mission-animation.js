window.PLANETENUHR_SPACE_MISSION_ANIMATION = (() => {
  'use strict';

  const DAY_MS = 86400000;
  const planetPeriods = {mercury:87.97, venus:224.7, earth:365.26, mars:686.98, jupiter:4332.59, saturn:10759.22, uranus:30688.5, neptune:60182};
  const planetRadii = {mercury:.47, venus:.73, earth:1.02, mars:1.67, jupiter:5.46, saturn:10.12, uranus:20.1, neptune:30.34};
  const eclipticTilt = 22 * Math.PI / 180;
  const obliqueAxes = {right:[0,-1,0],up:[Math.sin(eclipticTilt),0,Math.cos(eclipticTilt)],
    front:[-Math.cos(eclipticTilt),0,Math.sin(eclipticTilt)]};

  /** Projects an ecliptic vector into an orthographic view tilted above the plane.
   * @param {number} x Ecliptic x coordinate.
   * @param {number} y Ecliptic y coordinate.
   * @param {number} z Height above the ecliptic.
   * @returns {number[]} Horizontal and vertical plot coordinates before scaling.
   */
  function obliqueProjection(x,y,z) {
    return [-y,x * Math.sin(eclipticTilt) + z * Math.cos(eclipticTilt)];
  }

  /** Returns the signed distance toward the oblique camera.
   * @param {number} x Ecliptic x coordinate.
   * @param {number} z Height above the ecliptic.
   * @returns {number} Larger values are closer to the viewer.
   */
  function obliqueDepth(x,z) {
    return -x * Math.cos(eclipticTilt) + z * Math.sin(eclipticTilt);
  }

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

  /** Runs playback on a mission slider, linearly or using a supplied clock.
   * @param {object} callbacks Reads the range, optionally supplies a clock and updates the frame and play label.
   * @returns {{toggle:Function,pause:Function,isPlaying:Function}} Playback controls.
   */
  function createPlayback({getValue, getMax, getDuration, getTimeline, onFrame, onState, onFinish}) {
    let timer = null;
    let from;
    let start;
    let range;
    let duration;
    let timeAt;

    function pause() {
      if (timer !== null) {
        cancelAnimationFrame(timer);
        timer = null;
        onState(false);
      }
    }

    function frame(now) {
      const elapsed = now - start;
      let position = from + elapsed * range / duration;
      if (timeAt) position = timeAt(elapsed);
      const current = Math.min(range,position);
      onFrame(current);
      if (current >= range) {
        pause();
        onFinish?.();
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
      timeAt = getTimeline?.(from,range,duration);
      start = performance.now();
      timer = requestAnimationFrame(frame);
      onState(true);
    }

    return {toggle, pause, isPlaying: () => timer !== null};
  }

  /** Classifies the selected UTC day using the cutoff published with the solution.
   * @param {number} timestamp UTC milliseconds.
   * @param {string|null} trackingThrough Last tracking-based date.
   * @param {string} [reconstructedBefore] First date in the tracking-based section.
   * @param {string} [forecastAfter] Explicit historical cutoff when tracking provenance is unavailable.
   * @returns {string} Translation key for the trajectory provenance.
   */
  function dataStatus(timestamp, trackingThrough, reconstructedBefore, forecastAfter = trackingThrough) {
    if (!Number.isFinite(timestamp)) {
      return 'vectorData';
    }
    if (timestamp >= Date.parse(forecastAfter) + DAY_MS) {
      return 'predicted';
    }
    if (timestamp < Date.parse(reconstructedBefore)) {
      return 'reconstructed';
    }
    if (!trackingThrough) {
      return 'vectorData';
    }
    return 'trackingBased';
  }

  /** Finds the face-on axes using the mean angular-momentum direction of the orbit.
   * @param {number[][]} rows Ordered position vectors [time, x, y, z].
   * @returns {object|null} Orthogonal camera basis or null for a degenerate path.
   */
  function orbitalAxes(rows) {
    const cross = ([ax, ay, az], [bx, by, bz]) =>
      [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
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
    return {right,up,front:unitNormal};
  }

  /** Makes a mapper from Cartesian vectors to in-plane coordinates.
   * @param {object|null} axes Original orbital basis.
   * @returns {Function|null} Orbit mapper, or null when the basis is unavailable.
   */
  function projectionForAxes(axes) {
    if (!axes) return null;
    return (x,y,z) => {
      const point = [x, y, z];
      return [axes.right.reduce((sum,value,index) => sum + value * point[index],0),
        axes.up.reduce((sum,value,index) => sum + value * point[index],0)];
    };
  }

  /** Builds a face-on mapper for a sampled local orbit.
   * @param {number[][]} rows Sampled vectors. @returns {Function|null} Orbit mapper.
   */
  function orbitalProjection(rows) {
    return projectionForAxes(orbitalAxes(rows));
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
    const saturnTemplate = document.getElementById('spaceMissionSaturnTemplate');
    const legendTemplate = document.getElementById('spaceMissionPlanetLegendTemplate');
    const buttonTemplate = document.getElementById('idefixControlTemplate');
    const linkTemplate = document.getElementById('idefixLinkTemplate');
    root.append(template.content.cloneNode(true));
    const plot = root.querySelector('svg');
    const eclipticPlane = plot.querySelector('.mission-ecliptic-plane');
    const eclipticOffset = plot.querySelector('.mission-ecliptic-offset');
    const planetLegend = root.querySelector('.mission-planet-legend');
    const referenceOrbits = root.querySelector('.mission-reference-orbits');
    const targetOrbit = root.querySelector('.mission-target-orbit');
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
    const distance = root.querySelector('.mission-distance');
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
      ...view, data:trajectories[view.key], secondaryData:trajectories[view.secondary],
      targetData:trajectories[view.targetOrbit]
    }));
    const positions = new Map();
    let view;
    let scale;
    let orbitPlane;
    let originY;
    let bodies = [];
    let planetLabels = [];
    let probe;
    let secondaryProbe;
    let centerMarker;
    let targetMarker;
    let routeTracks = [];
    let spatialOrbits = [];
    let originalAxes;
    let spatial;
    let flyby;
    const journeyLayout = root.querySelector('.mission-journey-layout');
    const milestones = root.parentElement.querySelector('.space-mission-timeline');
    const photoJump = root.querySelector('[data-mission-photo-jump]');
    const photoCountdown = root.querySelector('.mission-photo-countdown');
    const photoEvent = mission.photo && mission.events.find(([,key]) => key === mission.photo.milestone);
    let photo;
    let photoDay;
    let photoDisplayWindow;
    if (photoEvent) {
      const date = new Date(photoEvent[0]);
      const timestamp = date.getTime();
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const years = mission.photo.displayYears;
      photoDay = [timestamp,timestamp + DAY_MS];
      photoDisplayWindow = [Date.UTC(year - years,month,day),Date.UTC(year + years,month,day) + DAY_MS];
      const photoTemplate = document.getElementById('spaceMissionPhotoTemplate');
      photo = photoTemplate.content.firstElementChild.cloneNode(true);
      photo.querySelector('time').dateTime = photoEvent[0];
      photo.querySelector('a').href = mission.photo.source;
      journeyLayout.append(photo);
      photoJump.addEventListener('click', jumpToPhoto);
    }
    if (mission.flybys?.length) {
      flyby = window.PLANETENUHR_SPACE_MISSION_FLYBYS.create(journeyLayout,
        mission.flybys,{trajectories,positionAt,orbitalProjection,orbitalAxes,addSaturnRings,missionName:mission.name,
          getTranslations,getOverviewScene:getSpatialScene,getStatus:getSpatialStatus,milestones,
          controls:slider.closest('.mission-animation-controls')});
    }
    const playback = createPlayback({
      getValue: () => Number(slider.value),
      getMax: () => Number(slider.max),
      getDuration: () => view.stages ? 9000 : 22000,
      /** Gets the optional slowed encounter clock for the current slider.
       * @param {number} from Starting slider minute. @param {number} end Final slider minute.
       * @param {number} duration Base duration in milliseconds. @returns {Function|undefined}
       */
      getTimeline(from,end,duration) {
        return flyby?.timeline(view.data.rows[0][0],from,end,duration,photoDay,mission.photo?.playbackDuration);
      },
      onFrame(current) {
        slider.value = String(Math.floor(current));
        updatePhotoCountdown(current);
        drawFrame(current);
      },
      onFinish:continueToPhoto,
      onState(playing) {
        if (playing) {
          play.textContent = text('pause');
        } else {
          play.textContent = text('play');
        }
        updatePhotoCountdown(Number(slider.value));
        spatial?.update();
        flyby?.updateSpatial();
      }
    });
    let language;
    let dashboardDate;
    let missingDashboardDate = false;
    let dateFormatter;
    let timeFormatter;
    let distanceFormatter;

    function text(key) {
      return getTranslations()['space_' + key];
    }

    function project(x, y, z = 0) {
      if (view.oblique) {
        [x, y] = obliqueProjection(x,y,z);
      } else if (orbitPlane) {
        [x, y] = orbitPlane(x, y, z);
      }
      return [300 + x * scale, originY - y * scale];
    }

    /** Moves a marker to a projected position.
     * @param {SVGGElement} node Marker group.
     * @param {number} x X coordinate. @param {number} y Y coordinate.
     * @param {number} [z] Height in the view's reference frame.
     * @returns {number[]} Plot coordinates of the marker.
     */
    function move(node, x, y, z) {
      const point = project(x,y,z);
      node.setAttribute('transform','translate(' + point.join(' ') + ')');
      return point;
    }

    function pathFor(points) {
      return points.map(([x, y, z], index) => {
        const point = project(x, y, z);
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

    /** Replaces the marker disc with Saturn and its rings.
     * @param {SVGGElement} node Marker containing a disc and label.
     * @param {number} radius Saturn's disc radius in plot units.
     * @returns {void}
     */
    function addSaturnRings(node,radius) {
      const saturn = saturnTemplate.content.querySelector('g').cloneNode(true);
      saturn.setAttribute('transform','scale(' + radius / 8 + ')');
      node.querySelector('circle').replaceWith(saturn);
    }

    function dateValue() {
      if (view.stages) {
        return Number(slider.value);
      }
      return view.data.rows[0][0] + Number(slider.value) * 60000;
    }

    /** Paints the oblique scene's markers from farthest to nearest.
     * @param {object[]} markers SVG nodes and their depths toward the viewer.
     * @returns {void}
     */
    function orderObliqueMarkers(markers) {
      markers.sort((first,second) => first.depth - second.depth);
      let next = referenceBodies.firstElementChild;
      for (const {node} of markers) {
        if (node !== next) referenceBodies.insertBefore(node,next);
        next = node.nextElementSibling;
      }
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
        const probePosition = move(probe,position.x,position.y,position.z);
        if (view.oblique) {
          const probeLabel = probe.querySelector('text');
          probeLabel.setAttribute('y',4);
          if (probePosition[0] > 390) {
            probeLabel.setAttribute('x',-12);
            probeLabel.setAttribute('text-anchor','end');
          } else {
            probeLabel.setAttribute('x',12);
            probeLabel.setAttribute('text-anchor','start');
          }
        }
        if (view.oblique) {
          const foot = project(position.x,position.y);
          eclipticOffset.setAttribute('d','M' + foot.join(' ') + ' L' + probePosition.join(' '));
          let direction = 'nearEcliptic';
          if (position.z >= .05) {
            direction = 'northOfEcliptic';
          } else if (position.z <= -.05) {
            direction = 'southOfEcliptic';
          }
          distance.textContent = text(direction).replace('{distance}',distanceFormatter.format(Math.abs(position.z)));
        } else if (view.distanceLabel) {
          const kilometers = Math.hypot(position.x, position.y, position.z);
          distance.textContent = text(view.distanceLabel).replace('{distance}', distanceFormatter.format(kilometers));
        }
        drawElapsedRoute(selected);
        let depthMarkers;
        if (view.oblique) {
          const [x,y] = probePosition;
          depthMarkers = [
            {node:centerMarker,x:300,y:originY,radius:5,depth:0},
            {node:probe,x,y,radius:2.75,depth:obliqueDepth(position.x,position.z)}
          ];
        }
        for (const {key, node} of bodies) {
          const body = getHeliocentricPosition(key, date);
          if (depthMarkers) {
            const [x,y] = move(node,body.x,body.y,body.z);
            let radius = 4;
            if (key === 'saturn') radius = 8;
            depthMarkers.push({node,x,y,radius,depth:obliqueDepth(body.x,body.z)});
          } else {
            move(node,body.x,body.y);
          }
        }
        if (depthMarkers) {
          if (bodies.length) {
            planetLabels = [...depthMarkers];
            window.PLANETENUHR_SOLAR_LABELS.layoutSvg(plot,planetLabels);
          }
          orderObliqueMarkers(depthMarkers);
        }
        if (targetMarker) {
          const target = positionAt(view.targetData.rows, date);
          targetMarker.style.display = target ? '' : 'none';
          if (target) {
            move(targetMarker, target.x, target.y, target.z);
          }
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
        const encounterVisible = flyby?.render(selected,getTranslations(),distanceFormatter);
        if (photo) {
          const visible = selected >= photoDisplayWindow[0] && selected < photoDisplayWindow[1];
          if (photo.hidden === visible) {
            photo.hidden = !visible;
            journeyLayout.classList.toggle('has-mission-photo',visible);
            if (visible && playback.isPlaying()) revealPhoto();
          }
        }
        let formatter = timeFormatter;
        if ((view.oblique || view.planets) && !encounterVisible) {
          formatter = dateFormatter;
        }
        const {trackingThrough,reconstructedBefore,forecastAfter} = view.data;
        caption = formatter.format(date) + ' · ' + text(dataStatus(selected,trackingThrough,reconstructedBefore,forecastAfter));
      }
      output.textContent = caption;
      if (!distance.hidden) {
        caption += ' · ' + distance.textContent;
      }
      slider.setAttribute('aria-valuetext',caption);
      plot.setAttribute('aria-label', text(view.label) + ' · ' + caption);
      positions.set(view.key, Number(slider.value));
      spatial?.update();
    }

    function describeSource() {
      sourceLink.href = view.source || view.data.url;
      sourceLink.textContent = view.stages ? text('nasaAnimation') : 'NASA/JPL Horizons';
      secondaryLink.hidden = !(view.secondaryData || view.targetData);
      if (view.secondaryData) {
        secondaryLink.href = view.secondaryData.url;
        secondaryLink.textContent = 'ESA SPICE · Mio';
      } else if (view.targetData) {
        secondaryLink.href = view.targetData.url;
        secondaryLink.textContent = 'NASA/JPL Horizons · ' + view.targetName;
      }
      if (view.stages) {
        source.textContent = text('landingSource');
        return;
      }
      const {rows, revised, trackingThrough, step} = view.data;
      const coverage = dateFormatter.format(new Date(rows[0][0])) + ' – ' +
        dateFormatter.format(new Date(rows.at(-1)[0]));
      const precision = step.endsWith(' d') ? text('sampleDays') : text('sampleMinutes');
      let referenceFrame = 'localFrame';
      if (view.oblique) {
        referenceFrame = 'obliqueFrame';
      } else if (orbitPlane) {
        referenceFrame = 'orbitPlaneFrame';
      } else if (view.planets) {
        referenceFrame = 'sunFrame';
      }
      const details = [
        text('solutionDate') + ' ' + dateFormatter.format(new Date(revised)),
        coverage,
        precision.replace('{n}', step.split(' ')[0]),
        text(referenceFrame)
      ];
      if (trackingThrough) {
        details.push(text('trackingCutoff') + ' ' + dateFormatter.format(new Date(trackingThrough)));
      }
      if (view.secondaryData) {
        details.push(text('mioSource') + ' · ' + text('solutionDate') + ' ' +
          dateFormatter.format(new Date(view.secondaryData.revised)));
      }
      if (view.viewNote) {
        details.push(text(view.viewNote));
      }
      source.textContent = details.join(' · ');
    }

    function updateLabels() {
      const translations = getTranslations();
      dateFormatter = new Intl.DateTimeFormat(language, {dateStyle:'medium', timeZone:'UTC'});
      if (photo) {
        photo.querySelector('[data-mission-photo-title]').textContent = text(mission.photo.milestone);
        photo.querySelector('time').textContent = dateFormatter.format(photoDay[0]);
        photo.querySelector('.mission-photo-caption').textContent = text('paleBlueDotCaption');
        photo.querySelector('a').textContent = text('paleBlueDotSource');
        photoJump.hidden = !coversDate(view,photoDay[0]);
        photoJump.textContent = text(mission.photo.milestone) + ' · ' + dateFormatter.format(photoDay[0]);
      }
      distanceFormatter = new Intl.NumberFormat(language, {minimumFractionDigits:1, maximumFractionDigits:1});
      timeFormatter = new Intl.DateTimeFormat(language, {
        year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'UTC', timeZoneName:'short'
      });
      label.textContent = text(view.stages ? 'landingStage' : 'localTime');
      viewButtons.setAttribute('aria-label', text('views'));
      buttons.forEach(({node, config}) => {
        node.textContent = text(config.label);
        node.setAttribute('aria-pressed', String(config === view));
      });
      for (const {key, node, legend} of bodies) {
        const name = translations['planet_' + key];
        node.querySelector('text').textContent = name;
        if (legend) {
          legend.textContent = name;
        }
      }
      referenceBodies.querySelector('.mission-center text').textContent =
        view.bodyName || translations[view.body || 'eclipse_sun'];
      play.textContent = text(playback.isPlaying() ? 'pause' : 'play');
      renderDashboardStatus();
      describeSource();
      drawFrame();
      spatial?.update(true);
    }

    function prepareTrajectory() {
      function track(rows, forecast, secondary = false) {
        return {rows, forecast, secondary, commands: rows.map(([, x, y, z], index) =>
          (index === 0 ? 'M' : 'L') + project(x, y, z).map(value => value.toFixed(2)).join(' '))};
      }

      const {rows,trackingThrough,forecastAfter = trackingThrough} = view.data;
      const cutoff = Date.parse(forecastAfter) + DAY_MS;
      routeTracks = [];
      if (cutoff <= rows[0][0]) {
        routeTracks.push(track(rows, true));
      } else if (cutoff <= rows.at(-1)[0]) {
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
      planetLegend.replaceChildren();
      bodies = [];
      planetLabels = [];
      spatialOrbits = [];
      secondaryProbe = null;
      targetMarker = null;
      targetOrbit.setAttribute('d', '');
      eclipticPlane.toggleAttribute('hidden',!view.oblique);
      eclipticOffset.setAttribute('d','');
      const {planets, stages} = view;
      originalAxes = null;
      if (view.faceOn) originalAxes = orbitalAxes(view.data.rows);
      orbitPlane = projectionForAxes(originalAxes);
      spatial?.setAvailable(Boolean(view.data));
      let viewBox = '0 0 600 380';
      if (view.oblique) {
        viewBox = '100 15 400 340';
      } else if (orbitPlane) {
        viewBox = '90 0 420 380';
      }
      plot.setAttribute('viewBox',viewBox);
      planetLegend.hidden = !(view.oblique && planets?.length);
      fitPlotLabels(plot);
      originY = stages ? 305 : 185;
      if (view.oblique) {
        eclipticPlane.setAttribute('cx',300);
        eclipticPlane.setAttribute('cy',originY);
        eclipticPlane.setAttribute('rx',145);
        eclipticPlane.setAttribute('ry',145 * Math.sin(eclipticTilt));
      }
      let centerRadius = 8;
      if (stages) {
        scale = 94;
        routeOverview.setAttribute('d', '');
        slider.max = String(stages.length - 1);
        trackedPath.setAttribute('d', '');
        predictedPath.setAttribute('d', pathFor(stages.map(([, x, y]) => [x, y])));
        referenceOrbits.setAttribute('d', 'M 42 305 L 558 305');
      } else {
        const projectedDistance = ([, x, y, z]) => {
          if (view.oblique) {
            return Math.max(Math.hypot(x,y),Math.hypot(...obliqueProjection(x,y,z)));
          }
          if (orbitPlane) {
            return Math.hypot(...orbitPlane(x,y,z));
          }
          return Math.hypot(x,y);
        };
        const distances = view.data.rows.map(projectedDistance);
        if (view.secondaryData) {
          distances.push(...view.secondaryData.rows.map(projectedDistance));
        }
        if (view.targetData) {
          distances.push(...view.targetData.rows.map(projectedDistance));
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
            return [position.x,position.y,position.z];
          });
          spatialOrbits.push(points);
          const node = marker(referenceBodies,'',4,'mission-planet');
          let legend;
          if (!planetLegend.hidden) {
            node.dataset.planet = key;
            if (key === 'saturn') {
              addSaturnRings(node,4);
            }
            legend = legendTemplate.content.firstElementChild.cloneNode(true);
            legend.dataset.planet = key;
            planetLegend.append(legend);
          }
          bodies.push({key,node,legend});
          if (view.oblique) return pathFor(points);
          return pathFor(points.map(([x,y]) => [x,y]));
        });
        referenceOrbits.setAttribute('d', orbitalPaths.join(' '));
        if (view.targetData) {
          spatialOrbits.push(view.targetData.rows.map(row => row.slice(1)));
          targetOrbit.setAttribute('d', pathFor(view.targetData.rows.map(([, x, y]) => [x, y])));
          targetMarker = marker(referenceBodies, view.targetName, 8, 'mission-reference-target');
          targetMarker.querySelector('text').setAttribute('y', 22);
        }
        prepareTrajectory();
      }
      const center = marker(referenceBodies, '', centerRadius, 'mission-center');
      centerMarker = center;
      move(center, 0, 0);
      if (view.oblique) {
        const centerLabel = center.querySelector('text');
        centerLabel.setAttribute('x',-12);
        centerLabel.setAttribute('y',4);
        centerLabel.setAttribute('text-anchor','end');
        const earth = referenceBodies.querySelector('[data-planet="earth"]');
        if (earth) {
          center.querySelector('circle').setAttribute('r',5);
        }
      }
      distance.hidden = !(view.distanceLabel || view.oblique);
      if (view.bodyTemplate) {
        const template = document.getElementById(view.bodyTemplate);
        center.querySelector('circle').replaceWith(template.content.querySelector('g').cloneNode(true));
        center.querySelector('text').setAttribute('y', -19);
      }
      if (stages) {
        center.querySelector('circle').setAttribute('r', 0);
        center.querySelector('text').setAttribute('y', 27);
      }
      if (stages) {
        const lander = document.getElementById('spaceMissionLanderTemplate');
        probe = lander.content.querySelector('g').cloneNode(true);
        spacecraft.append(probe);
      } else if (view.oblique) {
        probe = marker(referenceBodies,view.marker || mission.name,2.75,'mission-probe');
      } else {
        probe = marker(spacecraft, view.marker || mission.name, 5, 'mission-probe');
      }
      let initial = positions.get(view.key);
      if (initial === undefined) {
        initial = 0;
        if (planets && !flyby) {
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

    /** Brings the photo into view if the user is watching the mobile overview.
     * No parameters. @returns {void}
     */
    function revealPhoto() {
      const window = document.defaultView;
      if (document.getElementById('spaceMission3DDialog').open || !window.matchMedia('(max-width:759px)').matches) return;
      const bounds = plot.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) photo.scrollIntoView({block:'nearest',behavior:'instant'});
    }

    /** Continues playback in the next view when the current view ends before the photo.
     * No parameters. @returns {void}
     */
    function continueToPhoto() {
      if (!photoDay) return;
      const timestamp = dateValue();
      if (timestamp >= photoDay[0]) return;
      const next = matchingView(photoDay[0]);
      if (!next || next === view || !coversDate(next,timestamp)) return;
      setPosition(next,timestamp);
      playback.toggle();
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

    /** Seeks to the photograph. No parameters. @returns {void} */
    function jumpToPhoto() {
      seek(photoEvent[0]);
    }

    /** Shows the remaining time on the slowed photo clock while it is running.
     * @param {number} minute Current slider position, including the fractional playback minute.
     * @returns {void}
     */
    function updatePhotoCountdown(minute) {
      if (!photoDay) return;
      let seconds = 0;
      if (playback.isPlaying()) {
        const timestamp = view.data.rows[0][0] + minute * 60000;
        if (timestamp >= photoDay[0] && timestamp < photoDay[1]) {
          const duration = mission.photo.playbackDuration / 1000;
          const fraction = (photoDay[1] - timestamp) / DAY_MS;
          seconds = Math.ceil(fraction * duration);
        }
      }
      photoCountdown.hidden = seconds === 0;
      if (seconds) {
        const message = text('photoCountdown').replace('{seconds}',seconds);
        if (photoCountdown.textContent !== message) photoCountdown.textContent = message;
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

    /** Names the encounter or photograph that affects 3D playback.
     * No parameters. @returns {string} Current milestone or end-of-range text.
     */
    function getSpatialStatus() {
      let key = flyby?.getMilestone();
      let slowed = Boolean(key);
      if (photo && !photo.hidden) {
        key = mission.photo.milestone;
        const timestamp = dateValue();
        slowed = timestamp >= photoDay[0] && timestamp < photoDay[1];
      }
      if (slowed && playback.isPlaying()) {
        return text('3dPlaybackSlow').replace('{milestone}',text(key));
      }
      if (key) return text(key);
      if (Number(slider.value) >= Number(slider.max)) return text('3dPlaybackEnd');
      return '';
    }

    /** Supplies the original axes and current 3D vectors without changing the timeline.
     * No parameters. @returns {object|null} Current mission scene, if backed by vectors.
     */
    function getSpatialScene() {
      if (!view?.data) return null;
      const timestamp = dateValue();
      const date = new Date(timestamp);
      const copy = getTranslations();
      let axes = originalAxes || window.PLANETENUHR_SPACE_MISSION_CAMERA.topDown;
      if (view.oblique) axes = obliqueAxes;
      const position = positionAt(view.data.rows,date);
      const point = [position.x,position.y,position.z];
      const objects = [
        {key:'center',kind:'planet',label:view.bodyName || copy[view.body || 'eclipse_sun'],radius:7,point:[0,0,0]},
        {key:'probe',kind:'probe',label:view.marker || mission.name,radius:3,point}
      ];
      if (!view.body && !view.bodyName) objects[0].kind = 'sun';
      for (const {key} of bodies) {
        const {x,y,z} = getHeliocentricPosition(key,date);
        let kind = 'planet';
        if (key === 'saturn') kind = 'saturn';
        objects.push({key,kind,label:copy['planet_' + key],radius:4,point:[x,y,z]});
      }
      if (view.targetData) {
        const target = positionAt(view.targetData.rows,date);
        if (target) objects.push({key:'target',kind:'planet',label:view.targetName,radius:5,point:[target.x,target.y,target.z]});
      }
      if (view.secondaryData) {
        const mio = positionAt(view.secondaryData.rows,date);
        if (mio) objects.push({key:'mio',kind:'secondary',label:'Mio',radius:3,point:[mio.x,mio.y,mio.z]});
      }
      const tracks = routeTracks.map(track => {
        let kind = 'tracked';
        if (track.secondary) {
          kind = 'secondary';
        } else if (track.forecast) {
          kind = 'predicted';
        }
        return {rows:track.rows,kind};
      });
      const scene = {key:view,axes,timestamp,tracks,orbits:spatialOrbits,objects,
        scale:scale * 640 / plot.viewBox.baseVal.width};
      if (view.planets || view.oblique) scene.planeRadius = 145 / scale;
      if (view.oblique && bodies.length) scene.labelPlanets = true;
      if (view.oblique) scene.guide = point;
      if (photo && !photo.hidden) scene.photo = photo;
      scene.flyby = flyby?.getDetail();
      return scene;
    }

    if (views.some(config => config.data)) {
      spatial = window.PLANETENUHR_SPACE_MISSION_3D.create({
        anchor:plot,controls:slider.closest('.mission-animation-controls'),getScene:getSpatialScene,
        positionAt,getTranslations,milestones,getStatus:getSpatialStatus,
        getTitle:() => mission.name + ' · ' + text(view.label)
      });
    }
    language = getLanguage();
    select(views[0]);
    /** Updates SVG text size and placement after the plot changes width. @returns {void} */
    function resizeLabels() {
      fitPlotLabels(plot);
      if (planetLabels.length) window.PLANETENUHR_SOLAR_LABELS.layoutSvg(plot,planetLabels);
    }
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

  return {create, dataStatus, createPlayback, orbitalProjection, obliqueProjection, fitPlotLabels};
})();
