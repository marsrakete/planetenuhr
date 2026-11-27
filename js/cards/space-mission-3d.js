window.PLANETENUHR_SPACE_MISSION_3D = (() => {
  'use strict';

  const sessions = new WeakMap();
  const cameraModel = window.PLANETENUHR_SPACE_MISSION_CAMERA;

  /** Creates the one shared dialog and renderer for a document.
   * @param {Document} document Dashboard document. @returns {object} Dialog controller.
   */
  function createDialog(document) {
    const window = document.defaultView;
    const dialog = document.getElementById('spaceMission3DDialog');
    const title = dialog.querySelector('h2');
    const close = dialog.querySelector('.mission-3d-close');
    const reset = dialog.querySelector('.mission-3d-reset');
    const mouseHint = dialog.querySelector('.mission-3d-mouse-hint');
    const touchHint = dialog.querySelector('.mission-3d-touch-hint');
    const controlMount = dialog.querySelector('.mission-3d-controls');
    const status = dialog.querySelector('.mission-3d-status');
    const milestones = dialog.querySelector('.mission-3d-milestones');
    const milestoneList = milestones.querySelector('.mission-3d-milestone-list');
    const plot = dialog.querySelector('svg');
    const flybyMount = dialog.querySelector('.mission-3d-flyby');
    const photoMount = dialog.querySelector('.mission-3d-photo');
    const layer = plot.querySelector('.mission-3d-markers');
    const plane = plot.querySelector('.mission-3d-plane');
    const orbit = plot.querySelector('.mission-reference-orbits');
    const overview = plot.querySelector('.mission-route-overview');
    const tracked = plot.querySelector('.mission-tracked-path');
    const predicted = plot.querySelector('.mission-predicted-path');
    const secondary = plot.querySelector('.mission-mio-track');
    const guide = plot.querySelector('.mission-ecliptic-offset');
    const markerTemplate = document.getElementById('spaceMissionMarkerTemplate');
    const saturnTemplate = document.getElementById('spaceMissionSaturnTemplate');
    const markers = new Map();
    let owner;
    let placeholder;
    let milestonePlaceholder;
    let scrollPosition;
    let camera;
    let frame = 0;
    let geometry;
    let sceneKey;
    let activePhoto;
    let flybyPlaceholder;

    /** Encodes one projected point for an SVG path. @param {number[]} point SVG point.
     * @returns {string} Rounded coordinate pair.
     */
    function coordinates(point) {
      return point[0].toFixed(2) + ' ' + point[1].toFixed(2);
    }

    /** Projects the fixed paths for a camera orientation and scene.
     * @param {object} scene Orbit data and original frame. @param {Function} project Point projector.
     * @returns {object[]} Projected spacecraft tracks.
     */
    function prepareGeometry(scene,project) {
      if (scene.planeRadius) {
        const path = [];
        for (let index = 0; index < 72; index += 1) {
          const angle = index * Math.PI / 36;
          path.push(coordinates(project([scene.planeRadius * Math.cos(angle),scene.planeRadius * Math.sin(angle),0])));
        }
        plane.setAttribute('d','M' + path.join(' L') + ' Z');
      } else {
        plane.setAttribute('d','');
      }
      orbit.setAttribute('d',scene.orbits.map(points => 'M' + points.map(point => coordinates(project(point))).join(' L')).join(' '));
      const tracks = scene.tracks.map(track => ({
        ...track,
        commands:track.rows.map(([,x,y,z]) => coordinates(project([x,y,z])))
      }));
      overview.setAttribute('d',tracks.map(track => 'M' + track.commands.join(' L')).join(' '));
      return tracks;
    }

    /** Updates the visible traces and object positions for the current UTC instant.
     * No parameters. @returns {void}
     */
    function draw() {
      frame = 0;
      if (!owner || !dialog.open) return;
      const scene = owner.getScene();
      if (!scene) return;
      const message = owner.getStatus?.() || '';
      if (status.textContent !== message) status.textContent = message;
      showPhoto(scene.photo);
      showFlyby(scene.flyby);
      if (sceneKey !== scene.key) {
        sceneKey = scene.key;
        markers.clear();
        layer.replaceChildren();
        localize();
      }
      const project = point => cameraModel.project(point,scene.axes,camera,scene.scale);
      if (!geometry || geometry.key !== scene.key || geometry.scale !== scene.scale) {
        geometry = {key:scene.key,scale:scene.scale,tracks:prepareGeometry(scene,project)};
      }
      const traces = {tracked:[],predicted:[],secondary:[]};
      for (const track of geometry.tracks) {
        const firstFuture = track.rows.findIndex(([timestamp]) => timestamp > scene.timestamp);
        if (firstFuture === 0) continue;
        let commands = track.commands;
        if (firstFuture > 0) {
          commands = track.commands.slice(0,firstFuture);
          const point = owner.positionAt(track.rows,new Date(scene.timestamp));
          if (point) commands.push(coordinates(project([point.x,point.y,point.z])));
        }
        traces[track.kind].push('M' + commands.join(' L'));
      }
      tracked.setAttribute('d',traces.tracked.join(' '));
      predicted.setAttribute('d',traces.predicted.join(' '));
      secondary.setAttribute('d',traces.secondary.join(' '));
      if (scene.guide) {
        const [x,y,z] = scene.guide;
        guide.setAttribute('d','M' + coordinates(project([x,y,0])) + ' L' + coordinates(project([x,y,z])));
      } else {
        guide.setAttribute('d','');
      }

      const visible = [];
      for (const item of scene.objects) {
        const [x,y,depth] = project(item.point);
        let node = markers.get(item.key);
        if (!node) {
          node = markerTemplate.content.querySelector('g').cloneNode(true);
          node.dataset.kind = item.kind;
          node.dataset.body = item.key;
          if (item.kind === 'saturn') {
            const rings = saturnTemplate.content.querySelector('g').cloneNode(true);
            node.querySelector('circle').replaceWith(rings);
          }
          markers.set(item.key,node);
        }
        const disc = node.querySelector('circle');
        if (item.kind === 'saturn') {
          disc.parentElement.setAttribute('transform','scale(' + item.radius / 8 + ')');
        } else {
          disc.setAttribute('r',item.radius);
        }
        node.classList.toggle('mission-3d-planned',Boolean(item.planned));
        node.setAttribute('transform','translate(' + x + ' ' + y + ')');
        const label = node.querySelector('text');
        if (label.textContent !== item.label) label.textContent = item.label;
        let radius = item.radius;
        if (item.kind === 'saturn') radius *= 2;
        visible.push({node,depth,x,y,radius});
      }
      visible.sort((first,second) => first.depth - second.depth);
      let next = layer.firstElementChild;
      for (const {node} of visible) {
        if (node !== next) layer.insertBefore(node,next);
        next = node.nextElementSibling;
      }
      while (next) {
        const obsolete = next;
        next = next.nextElementSibling;
        obsolete.remove();
      }
      if (scene.labelPlanets) {
        window.PLANETENUHR_SOLAR_LABELS.layoutSvg(plot,visible);
      }
    }

    /** Mirrors the active photographic milestone inside the open dialog.
     * @param {HTMLElement} [photo] Timeline photograph to display. @returns {void}
     */
    function showPhoto(photo) {
      if (photo === activePhoto) return;
      activePhoto = photo;
      photoMount.replaceChildren();
      if (photo) photoMount.append(photo.cloneNode(true));
      photoMount.hidden = !photo;
      photoMount.parentElement.classList.toggle('has-mission-photo',Boolean(photo));
    }

    /** Moves the live encounter panel into the overview and restores it when the encounter ends.
     * @param {HTMLElement} [detail] Active flyby panel. @returns {void}
     */
    function showFlyby(detail) {
      const current = flybyMount.firstElementChild;
      if (current === (detail || null)) return;
      if (current) {
        flybyPlaceholder.replaceWith(current);
        flybyPlaceholder = null;
      }
      if (detail) {
        flybyPlaceholder = document.createComment('mission flyby');
        detail.before(flybyPlaceholder);
        flybyMount.append(detail);
      }
      flybyMount.hidden = !detail;
      flybyMount.parentElement.classList.toggle('has-flyby',Boolean(detail));
    }

    /** Requests a frame after state changes. @param {boolean} [cameraChanged=false] Invalidates fixed paths. @returns {void} */
    function redraw(cameraChanged = false) {
      if (cameraChanged) geometry = null;
      if (!frame && dialog.open) frame = window.requestAnimationFrame(draw);
    }

    const clearGestures = cameraModel.bind(plot,() => camera,() => redraw(true));

    /** Localizes the modal from the current owner. No parameters. @returns {void} */
    function localize() {
      const copy = owner.getTranslations();
      title.textContent = owner.getTitle();
      close.setAttribute('aria-label',copy.space_3dClose);
      reset.textContent = copy.space_3dReset;
      milestones.querySelector('summary').textContent = copy.space_3dMilestones;
      mouseHint.textContent = copy.space_3dHint;
      touchHint.textContent = copy.space_3dTouchHint;
      plot.setAttribute('aria-label',copy.space_3dPlot);
    }

    /** Moves the existing playback controls into the modal and opens it.
     * @param {object} client Controls, source data and language accessors. @returns {void}
     */
    function open(client) {
      if (owner || dialog.open || !client.getScene()) return;
      owner = client;
      camera = cameraModel.standard();
      geometry = null;
      sceneKey = undefined;
      markers.clear();
      layer.replaceChildren();
      scrollPosition = [window.scrollX,window.scrollY];
      placeholder = document.createComment('mission controls');
      owner.controls.before(placeholder);
      controlMount.append(owner.controls);
      milestones.hidden = !owner.milestones;
      milestones.open = false;
      if (owner.milestones) {
        milestonePlaceholder = document.createComment('mission milestones');
        owner.milestones.before(milestonePlaceholder);
        milestoneList.append(owner.milestones);
      }
      localize();
      dialog.showModal();
      dialog.scrollTop = 0;
      document.documentElement.classList.add('mission-3d-open');
      close.focus({preventScroll:true});
      redraw();
    }

    close.addEventListener('click',() => dialog.close());
    reset.addEventListener('click',() => {
      camera = cameraModel.standard();
      redraw(true);
    });
    dialog.addEventListener('close',() => {
      if (!owner || dialog.open) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
      clearGestures();
      showPhoto();
      showFlyby();
      placeholder.replaceWith(owner.controls);
      milestonePlaceholder?.replaceWith(owner.milestones);
      milestonePlaceholder = null;
      status.textContent = '';
      document.documentElement.classList.remove('mission-3d-open');
      let focusTarget = owner.button;
      if (owner.button.hidden) focusTarget = owner.getFallbackFocus?.();
      focusTarget?.focus({preventScroll:true});
      window.scrollTo({left:scrollPosition[0],top:scrollPosition[1],behavior:'instant'});
      owner = null;
    });

    /** Redraws the modal if it is showing the supplied mission.
     * @param {object} client Owner to compare. @param {boolean} [language] Refresh localized controls. @returns {void}
     */
    function update(client,language) {
      if (owner !== client || !dialog.open) return;
      if (language) localize();
      redraw();
    }

    return {open,update};
  }

  /** Adds a 3D launcher to a vector-based mission plot.
   * @param {object} options Plot, existing controls, scene, position and translation adapters.
   * @returns {{update:Function,setAvailable:Function}} Controller for frames and launcher availability.
   */
  function create(options) {
    const document = options.anchor.ownerDocument;
    if (!sessions.has(document)) sessions.set(document,createDialog(document));
    const dialog = sessions.get(document);
    const template = document.getElementById('spaceMission3DButtonTemplate');
    const button = template.content.firstElementChild.cloneNode(true);
    const client = {...options,button};
    options.anchor.parentElement.classList.add('mission-3d-anchor');
    options.anchor.before(button);
    button.addEventListener('click',() => dialog.open(client));

    /** Applies the current locale and forwards a frame to the active dialog.
     * @param {boolean} [language=false] Whether the language changed. @returns {void}
     */
    function update(language = false) {
      if (language) button.setAttribute('aria-label',options.getTranslations().space_3dOpen);
      dialog.update(client,language);
    }

    /** Shows the launcher for views with orbital vectors.
     * @param {boolean} available Whether the view has real 3D data. @returns {void}
     */
    function setAvailable(available) {
      button.hidden = !available;
    }

    update(true);
    return {update,setAvailable};
  }

  return {create};
})();
