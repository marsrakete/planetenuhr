window.PLANETENUHR_PLANETARY_SYSTEMS_CARD = (() => {
  'use strict';

  /** Creates the controller for the Mars, Saturn, Uranus and Neptune moon systems.
   * @param {object} dependencies Document and configured planets with moon orbits.
   * @returns {{render:Function}} Renderer for the static orbital diagrams.
   */
  function create(dependencies){
    const document = dependencies.document;
    const systems = dependencies.systems;

    /** Renders all configured planetary moon systems from the shared templates.
     * Existing diagrams are replaced, so repeated startup remains idempotent.
     * @returns {void} No value.
     */
    function render(){
      const target = document.getElementById('planetSystems');
      const systemTemplate = document.getElementById('planetSystemTemplate');
      const orbitTemplate = document.getElementById('planetMoonOrbitTemplate');
      if (!target || !systemTemplate || !orbitTemplate || !Array.isArray(systems)) {
        return;
      }

      target.replaceChildren();
      for (const configuredSystem of systems) {
        const fragment = systemTemplate.content.cloneNode(true);
        const system = fragment.querySelector('[data-planet-system]');
        const planet = fragment.querySelector('[data-system-planet]');
        const planetName = fragment.querySelector('[data-system-name]');
        if (!system || !planet || !planetName) {
          continue;
        }

        planet.classList.add(configuredSystem.planet);
        planetName.dataset.planet = configuredSystem.planet;
        planetName.textContent = configuredSystem.planet;
        for (const moonData of configuredSystem.moons) {
          const orbitFragment = orbitTemplate.content.cloneNode(true);
          const orbit = orbitFragment.querySelector('[data-planetary-orbit]');
          const label = orbitFragment.querySelector('[data-planetary-moon-label]');
          if (!orbit || !label) {
            continue;
          }
          orbit.style.setProperty('--planet-orbit-size', moonData.orbitSize + 'px');
          orbit.style.setProperty('--planet-orbit-duration', moonData.periodSeconds + 's');
          label.dataset.moon = moonData.key;
          label.textContent = moonData.key;
          system.insertBefore(orbitFragment, planetName);
        }
        target.appendChild(fragment);
      }
    }

    return {render};
  }

  return {create};
})();
