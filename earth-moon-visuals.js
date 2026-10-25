/* Template-based Earth and Moon artwork; the existing phase model stays unchanged. */
window.PLANETENUHR_EARTH_MOON_VISUALS = (() => {
  let orbitMoon;
  let observedMoon;

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

  /**
   * Mounts one retained SVG from a template, giving its paint references unique IDs.
   * @param {string} hostId Existing container ID.
   * @param {string} templateId Template ID to clone.
   * @param {string} prefix Unique prefix for this instance's SVG IDs.
   * @returns {SVGElement} Mounted globe, retained across subsequent renders.
   */
  function mount(hostId, templateId, prefix){
    const fragment = document.getElementById(templateId).content.cloneNode(true);
    const svg = fragment.querySelector('svg');
    const ids = new Map();
    svg.querySelectorAll('[id]').forEach(node => {
      ids.set(node.id, prefix + node.id);
      node.id = prefix + node.id;
    });
    svg.querySelectorAll('*').forEach(node => {
      Array.from(node.attributes).forEach(attribute => {
        let value = attribute.value;
        ids.forEach((replacement, original) => {
          value = value.replaceAll('url(#' + original + ')', 'url(#' + replacement + ')');
        });
        if (value !== attribute.value) {
          node.setAttribute(attribute.name, value);
        }
      });
    });
    document.getElementById(hostId).replaceChildren(fragment);
    return svg;
  }

  /**
   * Updates only a retained Moon's night region, the complement of its lit region.
   * @param {SVGElement} svg Moon illustration.
   * @param {number} phase Synodic phase fraction.
   * @returns {void}
   */
  function shadeMoon(svg, phase){
    svg.querySelector('[data-moon-shadow]').setAttribute('d', illuminatedPath(phase + 0.5));
  }

  /**
   * Shows shared left-side sunlight in the orbit and the dated geocentric phase below.
   * The accelerated orbit is a separate overview, not the dated Moon's sky position.
   * @param {number} phase Phase from the dashboard's existing computeMoon function.
   * @returns {void}
   */
  function render(phase){
    if (!orbitMoon) {
      mount('earthMoonGlobe', 'earthGlobeTemplate', 'earth-orbit-');
      orbitMoon = mount('emIcon', 'moonGlobeTemplate', 'moon-orbit-');
      observedMoon = mount('moonIcon', 'moonGlobeTemplate', 'moon-phase-');
      shadeMoon(orbitMoon, 0.75);
    }
    shadeMoon(observedMoon, phase);
  }

  return { render, illuminatedPath };
})();
