/* Retained, responsive labels for the existing meteor calendar circle. */
window.PLANETENUHR_METEOR_LABELS = (() => {
  const charts = new Map();
  const widths = new WeakMap();
  let frame = 0;
  let observer;
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(handleResize);
  }

  /**
   * Schedules labels only when a chart's actual width changes, never during delivery.
   * @param {ResizeObserverEntry[]} entries Observed chart size notifications.
   * @returns {void}
   */
  function handleResize(entries){
    if (entries.some(entry => Math.abs(entry.contentRect.width - (widths.get(entry.target) || 0)) > 0.5)) {
      schedule();
    }
  }

  /**
   * Separates neighboring callouts on one side while keeping their radial order.
   * @param {object[]} entries One side's measured labels with desired y and height.
   * @returns {void}
   */
  function separate(entries){
    entries.sort((left, right) => left.y - right.y);
    let bottom = 12;
    entries.forEach(entry => {
      entry.y = Math.max(entry.y, bottom + entry.height / 2);
      entry.blocked.forEach(interval => {
        if (entry.y > interval.start && entry.y < interval.end) entry.y = interval.end;
      });
      bottom = entry.y + entry.height / 2 + 5;
    });
    let top = 408;
    entries.slice().reverse().forEach(entry => {
      entry.y = Math.min(entry.y, top - entry.height / 2);
      entry.blocked.slice().reverse().forEach(interval => {
        if (entry.y > interval.start && entry.y < interval.end) entry.y = interval.start;
      });
      top = entry.y - entry.height / 2 - 5;
    });
  }

  /**
   * Measures a name and wraps long compound names at a space or hyphen.
   * @param {object} entry Retained SVG label and its configured name.
   * @param {number} fontSize Font size in SVG coordinates.
   * @returns {void}
   */
  function measure(entry, fontSize){
    entry.text.style.fontSize = fontSize + 'px';
    entry.first.textContent = entry.name;
    entry.second.textContent = '';
    entry.first.setAttribute('x', 0);
    entry.first.setAttribute('y', 0);
    entry.second.setAttribute('x', 0);
    entry.second.setAttribute('y', 0);
    let split = entry.name.indexOf('-');
    if (split < 0) {
      split = entry.name.indexOf(' ');
    }
    entry.wrapped = entry.first.getComputedTextLength() > 106 && split > 0;
    if (entry.wrapped) {
      entry.first.textContent = entry.name.slice(0, split + 1);
      entry.second.textContent = entry.name.slice(split + 1);
    }
    const firstBounds = entry.first.getBBox();
    const secondBounds = entry.second.getBBox();
    const height = Math.max(firstBounds.height, secondBounds.height);
    entry.lineHeight = height + 2;
    let top = firstBounds.y;
    let bottom = firstBounds.y + firstBounds.height;
    if (entry.wrapped) {
      top = Math.min(firstBounds.y - entry.lineHeight / 2, secondBounds.y + entry.lineHeight / 2);
      bottom = Math.max(firstBounds.y + firstBounds.height - entry.lineHeight / 2, secondBounds.y + secondBounds.height + entry.lineHeight / 2);
    }
    entry.height = bottom - top;
    entry.centerOffset = (top + bottom) / 2;
    entry.width = Math.max(entry.first.getComputedTextLength(), entry.second.getComputedTextLength());
  }

  /**
   * Places readable names outside the smaller ring, each with one straight connector.
   * @param {SVGElement} svg Calendar SVG with a 420-unit viewBox and 100-unit ring.
   * @param {object[]} entries Peak coordinates and retained label elements.
   * @returns {void}
   */
  function layout(svg, entries){
    const width = svg.getBoundingClientRect().width;
    if (!width) return;
    widths.set(svg, width);
    const fontSize = Math.max(14, 12 * 420 / width);
    const left = [];
    const right = [];
    const months = Array.from(svg.querySelectorAll('.meteor-month-label'), label => label.getBBox());
    entries.forEach(entry => {
      measure(entry, fontSize);
      const dx = entry.x - 210;
      const dy = entry.yPeak - 210;
      const length = Math.hypot(dx, dy);
      entry.y = 210 + dy / length * 160;
      entry.labelX = 210 + dx / length * 145;
      entry.left = dx < 0;
      if (entry.left) {
        entry.labelX = Math.max(8 + entry.width, entry.labelX);
        left.push(entry);
      } else {
        entry.labelX = Math.min(412 - entry.width, entry.labelX);
        right.push(entry);
      }
      let textLeft = entry.labelX;
      if (entry.left) textLeft -= entry.width;
      entry.blocked = months.filter(month => month.x < textLeft + entry.width + 3 && month.x + month.width > textLeft - 3)
        .map(month => ({start:month.y - entry.height / 2 - 3, end:month.y + month.height + entry.height / 2 + 3}))
        .sort((a, b) => a.start - b.start);
    });
    separate(left);
    separate(right);
    entries.forEach(entry => {
      let anchor = 'start';
      let endX = entry.labelX - 5;
      if (entry.left) {
        anchor = 'end';
        endX = entry.labelX + 5;
      }
      entry.text.setAttribute('text-anchor', anchor);
      entry.text.style.textAnchor = anchor;
      let firstY = entry.y - entry.centerOffset;
      if (entry.wrapped) firstY -= entry.lineHeight / 2;
      entry.first.setAttribute('x', entry.labelX);
      entry.first.setAttribute('y', firstY);
      entry.second.setAttribute('x', entry.labelX);
      entry.second.setAttribute('y', firstY + entry.lineHeight);
      entry.line.setAttribute('points', entry.x + ',' + entry.yPeak + ' ' + endX + ',' + entry.y);
    });
  }

  /** Batches viewport changes so layout reads/writes happen outside observer delivery.
   * No parameters. @returns {void}
   */
  function schedule(){
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      charts.forEach((entries, svg) => {
        if (svg.isConnected) {
          layout(svg, entries);
        } else {
          if (observer) observer.unobserve(svg);
          charts.delete(svg);
        }
      });
    });
  }

  /**
   * Adds template-based stream names around the outside of their activity arcs.
   * @param {SVGElement} svg Mounted meteor calendar SVG.
   * @param {{key:string,name:string,color:string,x:number,y:number}[]} labels Peak labels.
   * @returns {void}
   */
  function render(svg, labels){
    charts.forEach((entries, previous) => {
      if (!previous.isConnected) {
        if (observer) observer.unobserve(previous);
        charts.delete(previous);
      }
    });
    const entries = labels.slice().sort((left, right) => left.y - right.y).map(label => {
      const fragment = document.getElementById('meteorStreamLabelTemplate').content.cloneNode(true);
      const group = fragment.querySelector('g');
      const text = group.querySelector('text');
      const line = group.querySelector('polyline');
      group.setAttribute('data-meteor-stream', label.key);
      const first = text.querySelector('[data-meteor-line=first]');
      const second = text.querySelector('[data-meteor-line=second]');
      // An open connector must never become a filled polygon, even with stale CSS/templates.
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', label.color);
      text.setAttribute('dominant-baseline', 'middle');
      svg.appendChild(group);
      return { ...label, yPeak:label.y, text, line, first, second };
    });
    charts.set(svg, entries);
    layout(svg, entries);
    if (observer) observer.observe(svg);
  }

  window.addEventListener('resize', schedule);
  return { render };
})();
