/* Card adapter for shared Earth/Moon artwork; astronomical calculations stay unchanged. */
window.PLANETENUHR_EARTH_MOON_VISUALS = (() => {
  /** Updates the orbit overview and the selected date's observed Moon phase.
   * @param {number} phase Existing synodic fraction (0 new, .5 full).
   * @returns {void}
   */
  function render(phase){
    const bodies = window.PLANETENUHR_BODY_VISUALS;
    bodies.mount(document.getElementById('earthMoonGlobe'), 'earth');
    bodies.mount(document.getElementById('emIcon'), 'moon', {phase:.75,rotationAngle:0});
    bodies.mount(document.getElementById('moonIcon'), 'moon', {phase});
  }

  /** Keeps the small Moon's sunlit half fixed while synchronizing surface rotation with its orbit.
   * @param {number} orbitAngle Moon's current orbital angle in radians. @returns {void}
   */
  function updateOrbitMoon(orbitAngle){
    const moon = document.getElementById('emIcon');
    if (!moon || !moon.firstElementChild) {
      return;
    }
    const fullTurn = 2 * Math.PI;
    const normalizedAngle = ((orbitAngle % fullTurn) + fullTurn) % fullTurn;
    const rotation = normalizedAngle * 180 / Math.PI;
    window.PLANETENUHR_BODY_VISUALS.update(moon.firstElementChild, {phase:.75,rotationAngle:rotation});
  }

  return {render, updateOrbitMoon, illuminatedPath:window.PLANETENUHR_BODY_VISUALS.illuminatedPath};
})();
