window.PLANETENUHR_BODY_VISUALS = (() => {
  'use strict';
  let nextInstance = 0;

  /**
   * Builds the illuminated region of an orthographically projected lunar sphere.
   * @param {number} phase Synodic fraction: 0 new, 0.25 first quarter, 0.5 full.
   * @returns {string} Closed SVG path on the 128-unit Moon template.
   */
  function illuminatedPath(phase){
    const fraction = ((phase % 1) + 1) % 1;
    const cosine = Math.cos(2 * Math.PI * fraction);
    const terminatorRadius = Math.abs(55 * cosine);
    let outerSweep = 1;
    if (fraction > 0.5) {
      outerSweep = 0;
    }
    let innerSweep = outerSweep;
    if (cosine >= 0) {
      innerSweep = 1 - outerSweep;
    }
    const outer = 'M 64 9 A 55 55 0 0 ' + outerSweep + ' 64 119';
    if (terminatorRadius < 0.000001) {
      return outer + ' L 64 9 Z';
    }
    return outer + ' A ' + terminatorRadius + ' 55 0 0 ' + innerSweep + ' 64 9 Z';
  }


  /** Creates an independent body illustration with private SVG paint/clip IDs.
   * @param {string} bodyKey Key from PLANETENUHR_BODY_CONFIG.
   * @param {object} [options={}] Optional Moon phase and Earth shadow rotation in degrees.
   * @returns {SVGSVGElement} Decorative, scalable illustration ready for any host.
   */
  function create(bodyKey, options = {}){
    const config = window.PLANETENUHR_BODY_CONFIG[bodyKey];
    if (!config) throw new RangeError('Unknown body: ' + bodyKey);
    const svg = document.getElementById(config.template).content.querySelector('svg').cloneNode(true);
    const prefix = 'body-' + (++nextInstance) + '-';
    const ids = new Map();
    svg.querySelectorAll('[id]').forEach(node => {
      ids.set(node.id, prefix + node.id);
      node.id = prefix + node.id;
    });
    svg.querySelectorAll('*').forEach(node => {
      Array.from(node.attributes).forEach(attribute => {
        let value = attribute.value;
        ids.forEach((replacement, original) => {value = value.replaceAll('url(#' + original + ')', 'url(#' + replacement + ')');});
        if (value !== attribute.value) node.setAttribute(attribute.name, value);
      });
    });
    svg.classList.add('body-visual');
    svg.dataset.body = bodyKey;
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const planet = svg.querySelector('[data-graphic-planet]');
    if (planet) planet.dataset.planet = bodyKey;
    update(svg, options);
    return svg;
  }

  /** Updates lighting in place without replacing geometry, gradients or clip paths.
   * @param {SVGSVGElement} svg Body returned by create.
   * @param {object} [options={}] Moon phase (0 new, .5 full), Earth shadowAngle (default 0).
   * @returns {void}
   */
  function update(svg, options = {}){
    if (svg.dataset.body === 'moon') {
      let phase = .5;
      if (Number.isFinite(options.phase)) phase = options.phase;
      svg.querySelector('[data-moon-shadow]').setAttribute('d', illuminatedPath(phase + .5));
    }
    if (svg.dataset.body === 'earth') {
      let angle = 0;
      if (Number.isFinite(options.shadowAngle)) angle = options.shadowAngle;
      svg.querySelector('[data-earth-shadow]').setAttribute('transform', 'rotate(' + angle + ' 64 64)');
    }
  }

  /** Reuses a host's illustration when its body key is unchanged.
   * @param {Element} host HTML or SVG container dedicated to one body.
   * @param {string} bodyKey Configured body. @param {object} [options={}] Lighting options.
   * @returns {SVGSVGElement} Mounted illustration, retained for subsequent updates.
   */
  function mount(host, bodyKey, options = {}){
    let svg = host.firstElementChild;
    if (!svg || svg.dataset.body !== bodyKey) {
      svg = create(bodyKey, options);
      host.replaceChildren(svg);
    } else {
      update(svg, options);
    }
    return svg;
  }

  return {create, update, mount, illuminatedPath};
})();
