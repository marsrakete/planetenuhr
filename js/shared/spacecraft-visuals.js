window.PLANETENUHR_SPACECRAFT_VISUALS = (() => {
  'use strict';

  const families = {voyager1:'voyager',voyager2:'voyager',pioneer10:'pioneer',pioneer11:'pioneer'};
  const sprite = 'assets/images/spacecraft.svg';

  /** Mounts or resizes a centered spacecraft symbol without recreating its SVG.
   * @param {Element} host Container reserved for the artwork.
   * @param {string} key Spacecraft or mission key.
   * @param {number} size Square artwork viewport in CSS pixels or plot units.
   * @returns {SVGSVGElement} The retained image.
   */
  function mount(host,key,size) {
    const document = host.ownerDocument;
    const symbol = families[key] || key;
    let svg = host.firstElementChild;
    if (!svg || !svg.classList.contains('spacecraft-artwork')) {
      svg = document.getElementById('spacecraftVisualTemplate').content.firstElementChild.cloneNode(true);
      host.replaceChildren(svg);
    }
    if (svg.dataset.spacecraft !== symbol) {
      const version = document.querySelector('meta[name="planetenuhr-version"]').content;
      svg.querySelector('use').setAttribute('href',sprite + '?v=' + encodeURIComponent(version) + '#' + symbol);
      svg.dataset.spacecraft = symbol;
    }
    if (svg.getAttribute('width') !== String(size)) {
      svg.setAttribute('width',size);
      svg.setAttribute('height',size);
      svg.setAttribute('x',-size / 2);
      svg.setAttribute('y',-size / 2);
    }
    return svg;
  }

  return {mount};
})();
