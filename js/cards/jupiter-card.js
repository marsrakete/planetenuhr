window.PLANETENUHR_JUPITER_CARD = (() => {
  'use strict';

  /** Creates the Jupiter-system illustration controller.
   * @param {object} dependencies Document, static moon-orbit configuration and shared artwork renderer.
   * @returns {{render:Function}} Idempotent renderer for the Jupiter card.
   */
  function create(dependencies){
    const document = dependencies.document;
    const moons = dependencies.moons;

    /** Mounts Jupiter's shared SVG and rebuilds the animated moon orbits from their template.
     * Existing orbit nodes are replaced while the planet artwork is retained.
     * @returns {void} No value.
     */
    function render(){
      const system = document.getElementById('jupiterSystem');
      const template = document.getElementById('jupiterOrbitTemplate');
      if (!system || !template || !Array.isArray(moons)) {
        return;
      }

      const planet = system.querySelector('[data-jupiter-artwork]');
      if (planet) {
        dependencies.artwork.mountScaled(planet, 'jupiter', 24);
      }
      system.querySelectorAll('[data-jupiter-orbit]').forEach(orbit => orbit.remove());
      for (const item of moons) {
        const fragment = template.content.cloneNode(true);
        const orbit = fragment.querySelector('[data-jupiter-orbit]');
        const moon = fragment.querySelector('[data-jupiter-moon]');
        const label = fragment.querySelector('[data-jupiter-label]');
        if (!orbit || !moon || !label) {
          continue;
        }

        orbit.style.setProperty('--jupiter-orbit-size', item.orbitSize + 'px');
        orbit.style.setProperty('--jupiter-orbit-duration', item.periodSeconds + 's');
        moon.dataset.moon = item.key;
        label.dataset.moon = item.key;
        label.textContent = item.name || item.key;
        if (item.appearance) {
          moon.classList.add(item.appearance);
        }
        system.appendChild(fragment);
      }
    }

    return {render};
  }

  return {create};
})();
