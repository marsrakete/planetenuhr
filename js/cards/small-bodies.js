window.PLANETENUHR_SMALL_BODIES_CARD = (() => {
  'use strict';
  /** Creates the configured small-body map with retained detail/reset controls and view-local gestures.
   * @param {object} options Explicit model, configuration, template and layout dependencies.
   * @returns {object} Calculation or render operations; starts no timers.
   */
  function create(options){
    const document = options.document;

    /** Returns the existing shortened comet name for labels and detail titles.
     * @param {string} name Configured full name. @returns {string} Existing short display name.
     */
    function smallBodyShortName(name){
      if (name.includes('/')) return name.split('/').slice(1).join('/');
      const parts = name.trim().split(/\s+/);
      if (parts.length > 2) {
        return parts.slice(2).join(' ');
      }
      return name;
    }

    /** Renders the configured static orbit map and its existing click/gesture behavior.
     * No parameters. @returns {void}
     */
    function render(){
      const t = options.getTranslations();
      const target = document.getElementById('smallBodiesMap');
      const detail = document.getElementById('smallBodiesDetail');
      const summary = document.getElementById('smallBodiesSummary');
      const resetButton = document.getElementById('smallBodiesReset');
      const hint = document.getElementById('smallBodiesHint');
      if (!target) return;
      const size = 640;
      const center = size / 2;
      const maxRadius = size * 0.378;
      const zoomEnabled = false;
      target.innerHTML = '';

      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.small_bodies_aria || 'Comets, asteroid belt and Kuiper belt');

      /** Replaces detail contents using a structural template and plain text.
       * @param {string} title Selected name or initial prompt. @param {string} copy Existing detail copy. @returns {void}
       */
      function setSmallBodyDetail(title, copy){
        if (!detail) return;
        const fragment = options.cloneTemplate('smallBodyDetailTemplate');
        fragment.querySelector('strong').textContent = title;
        fragment.querySelector('br').after(document.createTextNode(copy));
        detail.replaceChildren(fragment);
      }

      const defs = options.cloneTemplate('smallBodiesDefinitionsTemplate').querySelector('defs');

      svg.appendChild(defs);

      const viewport = options.createSvgElement('g');
      viewport.setAttribute('clip-path', 'url(#smallBodiesClip)');
      svg.appendChild(viewport);

      [1, 1.52, 5.2, 30].forEach(au => {
        const orbit = options.createSvgElement('circle');
        orbit.setAttribute('cx', center);
        orbit.setAttribute('cy', center);
        orbit.setAttribute('r', options.model.smallBodyRadius(au, maxRadius));
        orbit.setAttribute('fill', 'none');
        orbit.setAttribute('stroke', 'rgba(107,114,128,.22)');
        orbit.setAttribute('stroke-width', '1');
        viewport.appendChild(orbit);
      });

      (options.config.belts || []).forEach(belt => {
        const inner = options.model.smallBodyRadius(belt.innerAu, maxRadius);
        const outer = options.model.smallBodyRadius(belt.outerAu, maxRadius);
        const ring = options.createSvgElement('circle');
        ring.setAttribute('cx', center);
        ring.setAttribute('cy', center);
        ring.setAttribute('r', (inner + outer) / 2);
        ring.setAttribute('class', 'small-bodies-belt ' + belt.key);
        ring.setAttribute('stroke-width', Math.max(8, outer - inner));
        const title = options.createSvgElement('title');
        title.textContent = belt.label;
        ring.appendChild(title);
        viewport.appendChild(ring);

        const ringHit = options.createSvgElement('circle');
        ringHit.setAttribute('cx', center);
        ringHit.setAttribute('cy', center);
        ringHit.setAttribute('r', (inner + outer) / 2);
        ringHit.setAttribute('class', 'small-bodies-hitarea');
        ringHit.setAttribute('stroke-width', Math.max(24, outer - inner + 12));
        const hitTitle = options.createSvgElement('title');
        hitTitle.textContent = belt.label;
        ringHit.appendChild(hitTitle);
        ringHit.addEventListener('click', () => {
          setSmallBodyDetail(belt.label, (t.small_bodies_belt_explain || 'Broad ring of many small bodies.') + ' ' + belt.innerAu + '-' + belt.outerAu + ' AU');
        });
        viewport.appendChild(ringHit);
      });

      (options.config.comets || []).forEach((comet, index) => {
        const geometry = options.model.cometState(comet, index, center, maxRadius);
        const {rx,ry,cx} = geometry;
        const detailTitle = smallBodyShortName(comet.name);
        const detailCopy = comet.name + ' · ' + comet.type + ' · ' + (t.small_bodies_perihel || 'Perihelion') + ' ' + comet.q + ' AU · ' + (t.small_bodies_aphel || 'Aphelion') + ' ' + comet.Q + ' AU';

        const orbit = options.createSvgElement('ellipse');
        orbit.setAttribute('cx', cx);
        orbit.setAttribute('cy', center);
        orbit.setAttribute('rx', rx);
        orbit.setAttribute('ry', ry);
        orbit.setAttribute('class', 'small-bodies-orbit');
        orbit.setAttribute('stroke', comet.color || '#2563eb');
        orbit.setAttribute('transform', 'rotate(' + (comet.angle || 0) + ' ' + center + ' ' + center + ')');
        const title = options.createSvgElement('title');
        title.textContent = comet.name + ' · ' + (t.small_bodies_perihel || 'Perihelion') + ' ' + comet.q + ' AU · ' + (t.small_bodies_aphel || 'Aphelion') + ' ' + comet.Q + ' AU · ' + comet.type;
        orbit.appendChild(title);
        viewport.appendChild(orbit);

        const orbitHit = options.createSvgElement('ellipse');
        orbitHit.setAttribute('cx', cx);
        orbitHit.setAttribute('cy', center);
        orbitHit.setAttribute('rx', rx);
        orbitHit.setAttribute('ry', ry);
        orbitHit.setAttribute('class', 'small-bodies-hitarea');
        orbitHit.setAttribute('transform', 'rotate(' + (comet.angle || 0) + ' ' + center + ' ' + center + ')');
        const orbitHitTitle = options.createSvgElement('title');
        orbitHitTitle.textContent = comet.name + ' · ' + (t.small_bodies_perihel || 'Perihelion') + ' ' + comet.q + ' AU · ' + (t.small_bodies_aphel || 'Aphelion') + ' ' + comet.Q + ' AU · ' + comet.type;
        orbitHit.appendChild(orbitHitTitle);
        orbitHit.addEventListener('click', () => setSmallBodyDetail(detailTitle, detailCopy));
        viewport.appendChild(orbitHit);

        if (comet.showLabel) {
          const {anchorX,anchorY,dirX,labelX,labelY} = options.model.labelState(geometry, center);
          const group = options.createSvgElement('g');
          group.setAttribute('class', 'small-bodies-label-chip');
          group.addEventListener('click', () => setSmallBodyDetail(detailTitle, detailCopy));

          const guide = options.createSvgElement('line');
          guide.setAttribute('x1', anchorX);
          guide.setAttribute('y1', anchorY);
          guide.setAttribute('x2', labelX);
          guide.setAttribute('y2', labelY - 4);
          guide.setAttribute('class', 'small-bodies-label-guide');

          const dot = options.createSvgElement('circle');
          dot.setAttribute('cx', anchorX);
          dot.setAttribute('cy', anchorY);
          dot.setAttribute('r', 3.5);
          dot.setAttribute('fill', comet.color || '#2563eb');

          const label = options.createSvgElement('text');
          label.setAttribute('x', labelX);
          label.setAttribute('y', labelY);
          label.setAttribute('class', 'small-bodies-label');
          let textAnchor = 'middle';
          if (dirX > 0.28) {
            textAnchor = 'start';
          } else if (dirX < -0.28) {
            textAnchor = 'end';
          }
          label.setAttribute('text-anchor', textAnchor);
          label.textContent = smallBodyShortName(comet.name);

          group.appendChild(guide);
          group.appendChild(dot);
          group.appendChild(label);
          viewport.appendChild(group);
        }
      });

      const sun = options.createSvgElement('circle');
      sun.setAttribute('cx', center);
      sun.setAttribute('cy', center);
      sun.setAttribute('r', 15);
      sun.setAttribute('class', 'small-bodies-sun');
      viewport.appendChild(sun);

      const zoomState = {
        scale: 1,
        tx: 0,
        ty: 0,
        activePointers: new Map(),
        panPointerId: null,
        lastPoint: null,
        pinchBase: null,
        suppressClick: false
      };

      /** Clamps a view-transform value to the existing bounds.
       * @param {number} value Value to clamp. @param {number} min Lower bound. @param {number} max Upper bound. @returns {number} Bounded value.
       */
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      /** Converts client pointer coordinates to the fixed SVG view box.
       * @param {number} clientX Client x. @param {number} clientY Client y. @returns {object} SVG point.
       */
      const pointerToSvgPoint = (clientX, clientY) => {
        const rect = svg.getBoundingClientRect();
        return {
          x: ((clientX - rect.left) / rect.width) * size,
          y: ((clientY - rect.top) / rect.height) * size
        };
      };

      /** Applies the current clamped view transform and dragging class.
       * No parameters. @returns {void}
       */
      const applyViewportTransform = () => {
        const maxPan = (zoomState.scale - 1) * size * 0.38;
        zoomState.tx = clamp(zoomState.tx, -maxPan, maxPan);
        zoomState.ty = clamp(zoomState.ty, -maxPan, maxPan);
        viewport.setAttribute('transform', 'translate(' + zoomState.tx.toFixed(2) + ' ' + zoomState.ty.toFixed(2) + ') scale(' + zoomState.scale.toFixed(3) + ')');
        svg.classList.toggle('is-dragging', zoomState.panPointerId !== null || zoomState.activePointers.size > 1);
      };

      /** Changes the dormant zoom state while preserving its focus point.
       * @param {number} targetScale Requested scale. @param {object} focusPoint SVG focus point. @returns {void}
       */
      const zoomAtPoint = (targetScale, focusPoint) => {
        const nextScale = clamp(targetScale, 1, 5);
        const worldX = (focusPoint.x - zoomState.tx) / zoomState.scale;
        const worldY = (focusPoint.y - zoomState.ty) / zoomState.scale;
        zoomState.tx = focusPoint.x - nextScale * worldX;
        zoomState.ty = focusPoint.y - nextScale * worldY;
        zoomState.scale = nextScale;
        applyViewportTransform();
      };

      /** Restores the existing initial view and clears gesture state.
       * No parameters. @returns {void}
       */
      const resetSmallBodiesView = () => {
        zoomState.scale = 1;
        zoomState.tx = 0;
        zoomState.ty = 0;
        zoomState.activePointers.clear();
        zoomState.panPointerId = null;
        zoomState.lastPoint = null;
        zoomState.pinchBase = null;
        zoomState.suppressClick = false;
        applyViewportTransform();
      };

      /** Captures the current two-pointer pinch baseline.
       * No parameters. @returns {void}
       */
      const beginPinch = () => {
        const points = Array.from(zoomState.activePointers.values());
        if (points.length !== 2) return;
        const centerPoint = pointerToSvgPoint((points[0].clientX + points[1].clientX) / 2, (points[0].clientY + points[1].clientY) / 2);
        const distance = Math.hypot(points[1].clientX - points[0].clientX, points[1].clientY - points[0].clientY);
        zoomState.pinchBase = {
          scale: zoomState.scale,
          focusWorldX: (centerPoint.x - zoomState.tx) / zoomState.scale,
          focusWorldY: (centerPoint.y - zoomState.ty) / zoomState.scale,
          distance
        };
      };

      if (zoomEnabled) {
        svg.addEventListener('wheel', event => {
          event.preventDefault();
          zoomAtPoint(zoomState.scale * Math.exp(-event.deltaY * 0.0015), pointerToSvgPoint(event.clientX, event.clientY));
        }, { passive: false });

        svg.addEventListener('dblclick', event => {
          event.preventDefault();
          resetSmallBodiesView();
        });

        svg.addEventListener('pointerdown', event => {
          if (event.pointerType === 'mouse' && ![0, 1].includes(event.button)) return;
          zoomState.activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
          if (zoomState.activePointers.size === 2) {
            beginPinch();
            zoomState.panPointerId = null;
            zoomState.lastPoint = null;
            event.preventDefault();
            return;
          }
          const canPan = event.pointerType !== 'mouse' || event.button === 1 || zoomState.scale > 1.001;
          if (canPan) {
            zoomState.panPointerId = event.pointerId;
            zoomState.lastPoint = pointerToSvgPoint(event.clientX, event.clientY);
            try { svg.setPointerCapture(event.pointerId); } catch (error) {}
            event.preventDefault();
          }
        });

        svg.addEventListener('pointermove', event => {
          if (!zoomState.activePointers.has(event.pointerId)) return;
          zoomState.activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
          if (zoomState.activePointers.size === 2 && zoomState.pinchBase) {
            const points = Array.from(zoomState.activePointers.values());
            const centerPoint = pointerToSvgPoint((points[0].clientX + points[1].clientX) / 2, (points[0].clientY + points[1].clientY) / 2);
            const distance = Math.max(24, Math.hypot(points[1].clientX - points[0].clientX, points[1].clientY - points[0].clientY));
            const nextScale = clamp(zoomState.pinchBase.scale * (distance / zoomState.pinchBase.distance), 1, 5);
            zoomState.scale = nextScale;
            zoomState.tx = centerPoint.x - nextScale * zoomState.pinchBase.focusWorldX;
            zoomState.ty = centerPoint.y - nextScale * zoomState.pinchBase.focusWorldY;
            zoomState.suppressClick = true;
            applyViewportTransform();
            return;
          }
          if (zoomState.panPointerId === event.pointerId && zoomState.lastPoint) {
            const point = pointerToSvgPoint(event.clientX, event.clientY);
            const dx = point.x - zoomState.lastPoint.x;
            const dy = point.y - zoomState.lastPoint.y;
            if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
              zoomState.tx += dx;
              zoomState.ty += dy;
              zoomState.lastPoint = point;
              zoomState.suppressClick = true;
              applyViewportTransform();
            }
          }
        });

        /** Releases a pointer from the dormant gesture state.
       * @param {PointerEvent} event Pointer completion event. @returns {void}
       */
      const endPointer = event => {
          zoomState.activePointers.delete(event.pointerId);
          if (zoomState.activePointers.size < 2) zoomState.pinchBase = null;
          if (zoomState.panPointerId === event.pointerId) {
            zoomState.panPointerId = null;
            zoomState.lastPoint = null;
            try { svg.releasePointerCapture(event.pointerId); } catch (error) {}
          }
          applyViewportTransform();
        };

        svg.addEventListener('pointerup', endPointer);
        svg.addEventListener('pointercancel', endPointer);
        svg.addEventListener('pointerleave', event => {
          if (event.pointerType === 'mouse') endPointer(event);
        });
        svg.addEventListener('click', event => {
          if (!zoomState.suppressClick) return;
          zoomState.suppressClick = false;
          event.preventDefault();
          event.stopPropagation();
        }, true);
      }

      if (resetButton) {
        resetButton.textContent = t.small_bodies_reset || 'Reset view';
        resetButton.onclick = resetSmallBodiesView;
        resetButton.hidden = !zoomEnabled;
      }
      if (hint) {
        if (zoomEnabled) {
          hint.textContent = t.small_bodies_gesture_hint || 'Use the mouse wheel or pinch to zoom, drag to pan, double-click to reset.';
        } else {
          hint.textContent = t.small_bodies_tap_hint || 'Tap or click an orbit to see its name, type and orbit data.';
        }
      }

      applyViewportTransform();
      target.appendChild(svg);
      setSmallBodyDetail((t.small_bodies_tap_title || 'Pick a body'), (t.small_bodies_tap_hint || 'Tap or click an orbit to see its name, type and orbit data.'));

      if (summary) {
        summary.innerHTML = '';
        [
          [t.small_bodies_comets || 'Comets', (options.config.comets || []).length],
          [t.small_bodies_asteroid_belt || 'Asteroid belt', '2.1-3.3 AU'],
          [t.small_bodies_kuiper_belt || 'Kuiper belt', '30-50 AU'],
          [t.small_bodies_scale || 'Scale', t.small_bodies_scale_value || 'Compressed']
        ].forEach(([label, value]) => {
          options.appendSummaryLine(summary, label + ': ', String(value));
        });
      }
      options.requestLayout();
    }

    return {render, smallBodyShortName};
  }
  return {create};
})();
