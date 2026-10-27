window.PLANETENUHR_DIAGRAM_DETAILS = (() => {
  'use strict';

  /**
   * Returns the solar-system HTML drawing or visible labelled SVG diagrams.
   * @param {HTMLElement} card Dashboard card.
   * @returns {Element[]} Current diagrams, excluding tiny decorative symbols.
   */
  function diagrams(card){
    const solarSystem = card.querySelector('#solarSystem');
    if (solarSystem && solarSystem.getBoundingClientRect().width > 0) return [solarSystem];
    return Array.from(card.querySelectorAll('svg')).filter(svg => {
      const rect = svg.getBoundingClientRect();
      return rect.width > 80 && rect.height > 60 && svg.querySelector('text');
    });
  }

  /**
   * Finds the smallest visible SVG text size in CSS pixels, accounting for viewBox scaling.
   * @param {SVGSVGElement} svg Rendered source diagram.
   * @returns {number} Minimum displayed size, or Infinity if no text is visible.
   */
  function minimumTextSize(svg){
    let minimum = Infinity;
    svg.querySelectorAll('text').forEach(node => {
      const style = getComputedStyle(node);
      const matrix = node.getScreenCTM();
      if (node.textContent.trim() && style.display !== 'none' && style.visibility !== 'hidden' && matrix) {
        const size = parseFloat(style.fontSize) * Math.hypot(matrix.a, matrix.b);
        minimum = Math.min(minimum, size);
      }
    });
    return minimum;
  }

  /** Reads the shared diagram text minimum in screen pixels. @param {SVGSVGElement} svg Source graphic. @returns {number} CSS typography token. */
  function labelPixels(svg){
    return parseFloat(getComputedStyle(svg).getPropertyValue('--font-diagram'));
  }

  /** Clones HTML/SVG with independent IDs and local paint references.
   * @param {Element} source Original drawing. @param {string} prefix Unique snapshot namespace.
   * @returns {object} Clone, matching node arrays and reference-rewriting function.
   */
  function snapshotNodes(source, prefix){
    const clone = source.cloneNode(true);
    const originals = [source, ...source.querySelectorAll('*')];
    const copies = [clone, ...clone.querySelectorAll('*')];
    const ids = new Map();
    originals.forEach(node => {
      if (node.id) {
        ids.set(node.id, prefix + node.id);
      }
    });

    /** Rewrites paint/filter URL references to the snapshot's own definitions. @param {string} value SVG/CSS attribute value. @returns {string} Namespaced reference. */
    function reference(value){
      return value.replace(/url\(["']?[^#)]*#([^"')]+)["']?\)/g, (match, id) => {
        if (ids.has(id)) {
          return 'url(#' + ids.get(id) + ')';
        }
        return match;
      });
    }

    originals.forEach((original, index) => {
      const copy = copies[index];
      Array.from(copy.attributes).forEach(attribute => {
        let value = reference(attribute.value);
        if (attribute.name === 'id') {
          value = ids.get(attribute.value);
        } else if ((attribute.name === 'href' || attribute.name === 'xlink:href') && ids.has(value.slice(1))) {
          value = '#' + ids.get(value.slice(1));
        }
        copy.setAttribute(attribute.name, value);
      });
    });
    return {clone, originals, copies, reference};
  }

  /**
   * Clones a static diagram with unique references and readable text while preserving its geometry.
   * @param {SVGSVGElement} svg Current rendered source.
   * @param {string} prefix Unique namespace for cloned ids.
   * @returns {SVGSVGElement} Independent enlarged snapshot with at least 12px text.
   */
  function enlargedClone(svg, prefix){
    const {clone, originals, copies, reference} = snapshotNodes(svg, prefix);
    let minimum = Infinity;
    const rootMatrix = svg.getScreenCTM();
    const rootScale = Math.hypot(rootMatrix.a, rootMatrix.b);
    const properties = ['fill','stroke','stroke-width','stroke-dasharray','stroke-linecap','stroke-linejoin','paint-order','filter','clip-path','mask','font-family','font-size','font-weight','font-style','text-anchor','dominant-baseline','visibility','opacity','display'];
    originals.forEach((original, index) => {
      const copy = copies[index];
      const style = getComputedStyle(original);
      properties.forEach(property => {
        copy.style.setProperty(property, reference(style.getPropertyValue(property)));
      });
      copy.style.animation = 'none';
      if (original.tagName === 'text' && original.textContent.trim() && style.visibility !== 'hidden' && style.display !== 'none') {
        const matrix = original.getScreenCTM();
        const relativeScale = Math.hypot(matrix.a, matrix.b) / rootScale;
        minimum = Math.min(minimum, parseFloat(style.fontSize) * relativeScale);
      }
    });
    const viewBox = svg.viewBox.baseVal;
    let scale = 1;
    if (Number.isFinite(minimum) && minimum > 0) {
      scale = Math.max(1, labelPixels(svg) / minimum);
    }
    clone.style.width = viewBox.width * scale + 'px';
    clone.style.height = viewBox.height * scale + 'px';
    clone.style.maxWidth = 'none';
    clone.style.maxHeight = 'none';
    clone.style.flexShrink = '0';
    // The figure supplies the frame; SVG padding/borders would shrink the viewBox scale below the text minimum.
    clone.style.boxSizing = 'content-box';
    clone.style.padding = '0';
    clone.style.border = '0';
    clone.removeAttribute('aria-hidden');
    clone.setAttribute('role', 'img');
    return clone;
  }

  /** Enlarges a frozen HTML solar-system snapshot, including nested body SVGs.
   * Captured layout and styles preserve positions across responsive breakpoints.
   * @param {HTMLElement} source Current solar-system disc. @param {string} prefix Unique snapshot namespace.
   * @returns {HTMLElement} Scrollable-stage content, scaled up to twice the source size.
   */
  function enlargedSolarClone(source, prefix){
    const {clone, originals, copies, reference} = snapshotNodes(source, prefix);
    const properties = ['position','left','top','right','bottom','width','height','margin','padding','box-sizing','border','border-radius','background','box-shadow','display','align-items','gap','flex-shrink','transform','transform-origin','z-index','overflow','color','font-family','font-size','font-weight','line-height','white-space','text-align','text-shadow','fill','stroke','stroke-width','opacity','visibility','clip-path','filter'];
    originals.forEach((original, index) => {
      const style = getComputedStyle(original);
      properties.forEach(property => copies[index].style.setProperty(property, reference(style.getPropertyValue(property))));
      copies[index].style.animation = 'none';
    });
    const size = source.getBoundingClientRect().width;
    const scale = Math.max(1.25, Math.min(2, 900 / size));
    const stage = document.getElementById('diagramSolarStageTemplate').content.firstElementChild.cloneNode(true);
    stage.style.width = size * scale + 'px';
    stage.style.height = size * scale + 'px';
    clone.style.position = 'absolute';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.margin = '0';
    clone.style.width = size + 'px';
    clone.style.height = size + 'px';
    clone.style.maxWidth = 'none';
    clone.style.transformOrigin = '0 0';
    clone.style.transform = 'scale(' + scale + ')';
    stage.appendChild(clone);
    return stage;
  }

  /**
   * Adds retained enlargement controls to cards whose overview labels are too small.
   * Uses a modal snapshot so dense diagrams need no crowded labels or oversized dashboard cards.
   * @param {object} [options={}] Optional beforeOpen callback releasing app-specific scroll restoration.
   * @returns {void}
   */
  function create(options = {}){
    const grid = document.querySelector('.grid');
    const dialog = document.getElementById('diagramDetailDialog');
    const content = document.getElementById('diagramDetailContent');
    const close = document.getElementById('diagramDetailClose');
    const controls = new WeakMap();
    let frame = 0;
    let serial = 0;
    let opener = null;

    /** Returns copy for the active document language. No parameters. @returns {object} Shared translation pack. */
    function labels(){
      return window.PLANETENUHR_TRANSLATIONS[document.documentElement.lang] || window.PLANETENUHR_TRANSLATIONS.en;
    }

    /** Releases app-specific pending viewport restoration before pointer or keyboard activation.
     * No parameters. @returns {void}
     */
    function prepareInteraction(){
      if (typeof options.beforeOpen === 'function') options.beforeOpen();
    }

    /** Opens a static snapshot of the card's current diagrams. @param {HTMLElement} card Source card. @returns {void} */
    function open(card){
      prepareInteraction();
      opener = controls.get(card) || null;
      const copy = labels();
      const title = document.getElementById('diagramDetailTitle');
      const hint = document.getElementById('diagramDetailHint');
      const isConstellationYear = card.dataset.helpKey === 'constellation_year';
      title.textContent = card.querySelector('.group-title').textContent;
      title.hidden = isConstellationYear;
      hint.textContent = copy.diagram_hint;
      hint.hidden = isConstellationYear;
      if (isConstellationYear) {
        dialog.removeAttribute('aria-describedby');
      } else {
        dialog.setAttribute('aria-describedby', hint.id);
      }
      close.textContent = copy.diagram_close;
      const fragment = document.createDocumentFragment();
      diagrams(card).forEach(svg => {
        const figure = document.getElementById('diagramFigureTemplate').content.cloneNode(true);
        serial += 1;
        let enlarged;
        if (svg.id === 'solarSystem') enlarged = enlargedSolarClone(svg, 'diagram-detail-' + serial + '-');
        else enlarged = enlargedClone(svg, 'diagram-detail-' + serial + '-');
        enlarged.setAttribute('role', 'img');
        enlarged.setAttribute('aria-label', card.querySelector('.group-title').textContent);
        figure.querySelector('figure').appendChild(enlarged);
        fragment.appendChild(figure);
      });
      content.replaceChildren(fragment);
      content.scrollTop = 0;
      content.scrollLeft = 0;
      dialog.showModal();
      const firstFigure = content.firstElementChild;
      if (firstFigure) {
        content.scrollLeft = Math.max(0, (firstFigure.offsetWidth - content.clientWidth) / 2);
        content.scrollTop = Math.max(0, (firstFigure.offsetHeight - content.clientHeight) / 2);
      }
    }

    /** Updates retained controls after diagram rendering or a viewport/language change. No parameters. @returns {void} */
    function refresh(){
      frame = 0;
      const copy = labels();
      grid.querySelectorAll('.display-container[data-help-key]').forEach(card => {
        const sources = diagrams(card);
        const needed = sources.some(svg => svg.id === 'solarSystem' || minimumTextSize(svg) < labelPixels(svg) - 0.5);
        let button = controls.get(card);
        if (needed && !button) {
          button = document.getElementById('diagramOpenTemplate').content.cloneNode(true).querySelector('button');
          // Keep pointer activation stable; the dialog manages focus explicitly.
          button.addEventListener('pointerdown', event => {
            prepareInteraction();
            event.preventDefault();
          });
          button.addEventListener('click', () => open(card));
          let drawing = sources[0];
          while (drawing.parentElement !== card) {
            drawing = drawing.parentElement;
          }
          drawing.after(button);
          controls.set(card, button);
        }
        if (button) {
          if (button.textContent !== copy.diagram_open) {
            button.textContent = copy.diagram_open;
          }
          button.hidden = !needed;
        }
      });
    }

    /** Batches mutation and resize notifications without writing during observer delivery. No parameters. @returns {void} */
    function schedule(){
      if (!frame) {
        frame = requestAnimationFrame(refresh);
      }
    }

    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      // A queued close event may arrive after the user has already reopened it.
      if (dialog.open) return;
      content.replaceChildren();
      if (opener && opener.isConnected) opener.focus({preventScroll:true});
      opener = null;
    });
    new MutationObserver(schedule).observe(grid, {childList:true,subtree:true});
    window.addEventListener('resize', schedule);
    schedule();
  }

  return { create, minimumTextSize, enlargedClone };
})();
