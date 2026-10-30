window.PLANETENUHR_SPACECRAFT_CARD = (() => {
  'use strict';
  /** Creates the configured static heliocentric probe chart from its drawing model.
   * @param {object} options Explicit model, configuration, template and layout dependencies.
   * @returns {object} Calculation or render operations; starts no timers.
   */
  function create(options){
    const document = options.document;

    /**
     * Renders the spacecraft card as a framed top-down heliocentric plot.
     * The diagram uses logarithmic distance rings and light reference axes so
     * the result reads more like a navigation chart than a glowing orbit disc.
     * @returns {void}
     */
    function render(){
      const t = options.getTranslations();
      const target = document.getElementById('spacecraftMap');
      const summary = document.getElementById('spacecraftSummary');
      if (!target) return;
      const size = 460;
      const center = size / 2;
      const maxRadius = size * 0.365;
      const maxAu = 180;
      const referenceAuValues = [1, 5.2, 30, 100];
      target.innerHTML = '';
      const svg = options.createSvgElement('svg');
      svg.removeAttribute('xmlns');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.spacecraft_aria || 'Approximate spacecraft distances from the Sun');

      const frame = options.createSvgElement('rect');
      frame.setAttribute('x', '34');
      frame.setAttribute('y', '34');
      frame.setAttribute('width', String(size - 68));
      frame.setAttribute('height', String(size - 68));
      frame.setAttribute('rx', '18');
      frame.setAttribute('class', 'spacecraft-plot-frame');
      svg.appendChild(frame);

      const axisHorizontal = options.createSvgElement('line');
      axisHorizontal.setAttribute('x1', '52');
      axisHorizontal.setAttribute('y1', String(center));
      axisHorizontal.setAttribute('x2', String(size - 52));
      axisHorizontal.setAttribute('y2', String(center));
      axisHorizontal.setAttribute('class', 'spacecraft-axis');
      svg.appendChild(axisHorizontal);

      const axisVertical = options.createSvgElement('line');
      axisVertical.setAttribute('x1', String(center));
      axisVertical.setAttribute('y1', '52');
      axisVertical.setAttribute('x2', String(center));
      axisVertical.setAttribute('y2', String(size - 52));
      axisVertical.setAttribute('class', 'spacecraft-axis');
      svg.appendChild(axisVertical);

      referenceAuValues.forEach(au => {
        const orbitRadius = options.model.distanceRadius(au, maxRadius, maxAu);
        const orbit = options.createSvgElement('circle');
        orbit.setAttribute('cx', center);
        orbit.setAttribute('cy', center);
        orbit.setAttribute('r', orbitRadius);
        orbit.setAttribute('class', 'spacecraft-orbit');
        svg.appendChild(orbit);

        const orbitLabel = options.createSvgElement('text');
        orbitLabel.setAttribute('x', String(center + orbitRadius + 8));
        orbitLabel.setAttribute('y', String(center - 6));
        orbitLabel.setAttribute('class', 'spacecraft-ring-label');
        orbitLabel.textContent = au + ' AU';
        svg.appendChild(orbitLabel);
      });

      const sun = options.createSvgElement('circle');
      sun.setAttribute('cx', center);
      sun.setAttribute('cy', center);
      sun.setAttribute('r', 15);
      sun.setAttribute('class', 'spacecraft-sun');
      svg.appendChild(sun);

      const sunLabel = options.createSvgElement('text');
      sunLabel.setAttribute('x', String(center));
      sunLabel.setAttribute('y', String(center + 32));
      sunLabel.setAttribute('text-anchor', 'middle');
      sunLabel.setAttribute('class', 'spacecraft-center-label');
      sunLabel.textContent = t.eclipse_sun || 'Sun';
      svg.appendChild(sunLabel);

      (options.getSpacecraft() || []).forEach((craft, index) => {
        const {x,y,radius,path,labelX,labelY,textAnchor,dominantBaseline} = options.model.craftState(craft, index, {center,maxRadius,maxAu,size});
        let craftColor = '#2563eb';
        if (craft.color) craftColor = craft.color;
        const track = options.createSvgElement('path');
        track.setAttribute('d', path);
        track.setAttribute('class', 'spacecraft-track');
        track.setAttribute('stroke', craftColor);
        svg.appendChild(track);
        const marker = options.createSvgElement('circle');
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', 6);
        marker.setAttribute('fill', craftColor);
        marker.setAttribute('class', 'spacecraft-marker');
        svg.appendChild(marker);
        const label = options.createSvgElement('text');
        label.setAttribute('class', 'spacecraft-label');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', textAnchor);
        label.setAttribute('dominant-baseline', dominantBaseline);
        label.textContent = craft.name + ' · ' + craft.distanceAu + ' AU';
        svg.appendChild(label);
      });
      target.appendChild(svg);
      if (summary) {
        const farthest = (options.getSpacecraft() || []).slice().sort((a,b) => b.distanceAu - a.distanceAu)[0];
        let farthestText = '-';
        if (farthest) {
          farthestText = farthest.name + ' · ' + farthest.distanceAu + ' AU';
        }
        summary.innerHTML = '';
        options.appendSummaryLine(summary, (t.spacecraft_farthest || 'Farthest') + ': ', farthestText);
        options.appendSummaryLine(summary, (t.spacecraft_count || 'Shown') + ': ', String((options.getSpacecraft() || []).length));
      }
      options.requestLayout();
    }

    return {render};
  }
  return {create};
})();
