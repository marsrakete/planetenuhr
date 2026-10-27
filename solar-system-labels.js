window.PLANETENUHR_SOLAR_LABELS = (() => {
  'use strict';

  /** Tests whether two viewport rectangles overlap, with a small readable gap.
   * @param {object} a Candidate rectangle. @param {object} b Occupied rectangle.
   * @returns {boolean} True for overlap or a gap smaller than three pixels.
   */
  function overlaps(a, b){
    return a.left < b.right + 3 && a.right > b.left - 3 && a.top < b.bottom + 3 && a.bottom > b.top - 3;
  }

  /** Keeps nearby planet labels readable without moving their orbital positions.
   * Outer labels reserve their limited edge space first. Displaced labels receive
   * a straight guide back to the matching marker.
   * @param {HTMLElement} system Solar-system disc with mounted, measurable labels.
   * @returns {void}
   */
  function layout(system){
    const bounds = system.getBoundingClientRect();
    if (!bounds.width) return;
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const radius = Math.min(bounds.width, bounds.height) / 2 - 6;
    const occupied = [];
    const obstacles = [...system.querySelectorAll('.solar-planet,.sun')].map(node => node.getBoundingClientRect());
    [...system.querySelectorAll('.solar-label')].reverse().forEach(label => {
      const original = label.getBoundingClientRect();
      label.style.transform = 'none';
      const anchor = label.getBoundingClientRect();
      const x = anchor.left;
      const y = anchor.top;
      const candidates = [[original.left - x, original.top - y]];
      for (let distance = 4; distance <= 16; distance += 4) {
        for (let direction = 0; direction < 8; direction++) {
          const angle = direction * Math.PI / 4;
          candidates.push([original.left - x + Math.cos(angle) * distance, original.top - y + Math.sin(angle) * distance]);
        }
      }
      for (let row = 0; row < 6; row++) {
        const offset = 16 + row * (original.height + 5);
        candidates.push([14, -offset - original.height], [-original.width - 14, -offset - original.height],
          [14, offset], [-original.width - 14, offset], [-original.width / 2, -offset - original.height], [-original.width / 2, offset]);
      }
      for (let distance = 24; distance <= bounds.width; distance += 12) {
        for (let direction = 0; direction < 32; direction++) {
          const angle = direction * Math.PI / 16;
          candidates.push([Math.cos(angle) * distance - original.width / 2, Math.sin(angle) * distance - original.height / 2]);
        }
      }
      let chosen = original;
      let shifted = false;
      label.style.transform = 'translate(' + (original.left - x) + 'px, ' + (original.top - y) + 'px)';
      for (const [dx, dy] of candidates) {
        const candidate = {left:x + dx, top:y + dy, right:x + dx + original.width, bottom:y + dy + original.height};
        if (candidate.left < bounds.left + 4 || candidate.right > bounds.right - 4 || candidate.top < bounds.top + 4 || candidate.bottom > bounds.bottom - 4) continue;
        const corners = [[candidate.left,candidate.top],[candidate.right,candidate.top],[candidate.left,candidate.bottom],[candidate.right,candidate.bottom]];
        if (corners.some(([left,top]) => Math.hypot(left - centerX, top - centerY) > radius)) continue;
        if (occupied.some(rect => overlaps(candidate, rect)) || obstacles.some(rect => overlaps(candidate, rect))) continue;
        chosen = candidate;
        shifted = Math.abs(candidate.left - original.left) > 1 || Math.abs(candidate.top - original.top) > 1;
        label.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        break;
      }
      occupied.push(label.getBoundingClientRect());
      let guide = system.querySelector('[data-solar-guide="' + label.dataset.solarPlanet + '"]');
      if (!guide) {
        guide = document.getElementById('solarLabelGuideTemplate').content.firstElementChild.cloneNode(true);
        guide.dataset.solarGuide = label.dataset.solarPlanet;
        system.appendChild(guide);
      }
      guide.hidden = !shifted;
      if (shifted) {
        const endX = Math.max(chosen.left, Math.min(x, chosen.right));
        const endY = Math.max(chosen.top, Math.min(y, chosen.bottom));
        const dx = endX - x;
        const dy = endY - y;
        guide.style.left = (x - bounds.left) + 'px';
        guide.style.top = (y - bounds.top) + 'px';
        guide.style.width = Math.hypot(dx, dy) + 'px';
        guide.style.transform = 'rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI) + 'deg)';
      }
    });
  }

  return {layout};
})();
