window.PLANETENUHR_DAILY_GRAPHICS = (() => {
  'use strict';

  /** Selects a schematic scene from structured hint data, independent of language.
   * @param {object} item Ranked daily hint. @param {number} moonPhase Selected day's synodic fraction.
   * @returns {object} Scene name, optional planet keys, phase or polar state.
   */
  function describe(item, moonPhase){
    const data = item.data;
    if (item.kind === 'planet') return {scene:'planet', bodies:[data.key]};
    if (item.kind === 'conjunction') return {scene:'pair', bodies:[data.a,data.b]};
    if (item.kind === 'polar_day' || item.kind === 'polar_night') return {scene:'polar', state:item.kind};
    if (item.kind === 'calendar') {
      if (data.category === 'eclipse') {
        const phases = window.PLANETENUHR_ECLIPSE_PHASES || [];
        const event = phases.find(entry => entry.date === data.date);
        if (event && event.kind === 'lunar') return {scene:'lunarEclipse'};
        if (event && event.kind === 'solar') return {scene:'solarEclipse'};
        return {scene:'orbit'};
      }
      if (data.category === 'season') return {scene:'season'};
      if (data.category === 'planet') {
        if (data.approach) return {scene:'pair', bodies:[data.approach.a,data.approach.b]};
        const bodies = data.bodyKeys || [];
        if (bodies.length >= 2) return {scene:'pair', bodies:bodies.slice(0,2)};
        if (bodies.length === 1) return {scene:'planet', bodies};
        return {scene:'orbit'};
      }
    }
    if (item.group === 'meteor') return {scene:'meteor'};
    if (item.group === 'moon') return {scene:'moon', phase:moonPhase};
    return {scene:'orbit'};
  }

  /** Clones controlled SVG geometry from one shared HTML template.
   * @param {string} name Scene/template suffix. @returns {SVGElement} Independent SVG group.
   */
  function cloneScene(name){
    return document.getElementById('dailyGraphic-' + name).content.querySelector('g').cloneNode(true);
  }

  /** Updates a retained decorative SVG; replaces geometry only when its scene changes.
   * @param {SVGSVGElement} svg Graphic host in the hint template.
   * @param {object} item Ranked daily hint. @param {number} moonPhase Selected day's phase.
   * @returns {void}
   */
  function render(svg, item, moonPhase){
    const descriptor = describe(item, moonPhase);
    if (svg.dataset.scene !== descriptor.scene) {
      const scene = cloneScene(descriptor.scene);
      svg.replaceChildren(scene);
      svg.dataset.scene = descriptor.scene;
    }
    if (descriptor.bodies) {
      svg.querySelectorAll('[data-graphic-body]').forEach((host, index) => {
        window.PLANETENUHR_BODY_VISUALS.mount(host, descriptor.bodies[index]);
      });
    }
    if (descriptor.scene === 'moon') {
      window.PLANETENUHR_BODY_VISUALS.mount(svg.querySelector('[data-graphic-body]'), 'moon', {phase:descriptor.phase});
    }
    svg.querySelectorAll('[data-daily-earth]').forEach(host => window.PLANETENUHR_BODY_VISUALS.mount(host, 'earth'));
    if (descriptor.scene === 'polar') svg.dataset.state = descriptor.state;
    else delete svg.dataset.state;
  }

  return {describe, render};
})();
