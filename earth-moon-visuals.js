/* Card adapter for shared Earth/Moon artwork; astronomical calculations stay unchanged. */
window.PLANETENUHR_EARTH_MOON_VISUALS = (() => {
  /** Updates the orbit overview and the selected date's observed Moon phase.
   * @param {number} phase Existing synodic fraction (0 new, .5 full).
   * @returns {void}
   */
  function render(phase){
    const bodies = window.PLANETENUHR_BODY_VISUALS;
    bodies.mount(document.getElementById('earthMoonGlobe'), 'earth');
    bodies.mount(document.getElementById('emIcon'), 'moon', {phase:.75});
    bodies.mount(document.getElementById('moonIcon'), 'moon', {phase});
  }
  return {render, illuminatedPath:window.PLANETENUHR_BODY_VISUALS.illuminatedPath};
})();
