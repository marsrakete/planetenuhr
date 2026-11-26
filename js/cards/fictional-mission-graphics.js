window.PLANETENUHR_FICTIONAL_MISSION_GRAPHICS = (() => {
  'use strict';

  /** Attaches one template-authored SVG stage and indexes its named scene parts.
   * @param {HTMLElement} target Stage mount point.
   * @param {SVGSVGElement} svg Imported SVG from the scene template.
   * @param {object} copy Localized captions for places and bodies.
   * @param {Function} fitLabels Measures the existing shared minimum SVG label size.
   * @returns {{render:Function}} Renders the visible scene and places its actors.
   */
  function create(target, svg, copy, fitLabels){
    const scenes = new Map();
    for (const group of svg.querySelectorAll('[data-fictional-scene]')) {
      scenes.set(group.dataset.fictionalScene,{
        group,
        actors:new Map(Array.from(group.querySelectorAll('[data-fictional-actor]'), node => [node.dataset.fictionalActor,node])),
        tracks:new Map(Array.from(group.querySelectorAll('[data-fictional-track]'), node => [node.dataset.fictionalTrack,node])),
        extras:Array.from(group.querySelectorAll('[data-fictional-extra]'))
      });
    }
    for (const label of svg.querySelectorAll('[data-fictional-text]')) {
      label.textContent = copy[label.dataset.fictionalText];
    }
    target.appendChild(svg);
    fitLabels(svg);
    const lengths = new WeakMap();
    let activeScene;
    let activeEvent;
    let motions = [];

    /** Positions an actor on its path and applies any path alignment or additional rotation.
     * @param {SVGElement} actor Spacecraft, rover, probe or other movable drawing.
     * @param {SVGPathElement} track Geometry path within the active scene.
     * @param {number} fraction Position in the range 0–1 along the path.
     * @param {number} rotation Additional rotation in degrees around the actor's origin.
     * @returns {void}
     */
    function moveActor(actor, track, fraction, rotation){
      if (!lengths.has(track)) lengths.set(track,track.getTotalLength());
      const length = lengths.get(track);
      const distance = length * fraction;
      const point = track.getPointAtLength(distance);
      let transform = 'translate(' + point.x + ' ' + point.y + ')';
      if (actor.hasAttribute('data-fictional-align')) {
        const before = track.getPointAtLength(Math.max(0,distance - .5));
        const after = track.getPointAtLength(Math.min(length,distance + .5));
        rotation += Math.atan2(after.y - before.y,after.x - before.x) * 180 / Math.PI;
      }
      if (rotation) transform += ' rotate(' + rotation + ')';
      actor.setAttribute('transform',transform);
    }

    /** Activates the frame's scene and applies its event-specific motion and artwork.
     * @param {object} frame Current milestone and progress from the timeline model. @returns {void}
     */
    function render({event, progress}){
      const scene = scenes.get(event.scene);
      if (!scene) return;
      if (scene !== activeScene) {
        if (activeScene) activeScene.group.setAttribute('hidden','');
        scene.group.removeAttribute('hidden');
        activeScene = scene;
      }
      if (event !== activeEvent) {
        const enabledActors = new Set();
        motions = [];
        for (const [key,trackId,from,to,rotation=0] of event.motions || []) {
          const actor = scene.actors.get(key);
          const track = scene.tracks.get(trackId);
          if (!actor || !track) continue;
          enabledActors.add(key);
          motions.push({actor,track,from,to,rotation});
        }
        for (const [key,actor] of scene.actors) {
          actor.toggleAttribute('hidden',!enabledActors.has(key));
        }
        for (const extra of scene.extras) {
          extra.toggleAttribute('hidden',!event.show?.includes(extra.dataset.fictionalExtra));
        }
        activeEvent = event;
      }
      for (const {actor,track,from,to,rotation} of motions) {
        moveActor(actor,track,from + (to - from) * progress,rotation * progress);
      }
    }

    const resize = new ResizeObserver(() => fitLabels(svg));
    resize.observe(target);
    return {render};
  }

  return {create};
})();
