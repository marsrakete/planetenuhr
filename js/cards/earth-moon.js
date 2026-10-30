window.PLANETENUHR_EARTH_MOON = (() => {
  'use strict';
  /** Creates the dated Moon views and a single schematic orbit animation owner.
   * @param {object} options Document, window, models, visuals, direction and formatting adapters.
   * @returns {object} Phase/caption renderers and explicit lifecycle methods.
   */
  function create(options){
    const document = options.document;
    const browser = options.window;
    const requestAnimationFrame = browser.requestAnimationFrame.bind(browser);
    const performance = browser.performance;
    let frame = 0;
    let wired = false;

    /** Updates the retained renderPhase view from the common dashboard selection.
     * @param {object} context Explicit date and location. @returns {void}
     */
    function renderPhase(context){
      const date = context.date;
      const t = options.getTranslations();
      const tz  = options.getDisplayTimeZone();
      const m   = options.computeMoon(date);
      const nf  = options.nextFullMoon(date);
      const location = context.location;

      const moonIcon = document.getElementById('moonIcon');
      const moonText = document.getElementById('moonText');
      if (moonIcon) {
        options.visuals.render(m.frac);
        moonIcon.setAttribute('aria-label', t[m.key] + ', ' + m.illum + '%');
      }
      if (moonText) moonText.textContent = t[m.key] + ' · ' + m.illum + '%';

      // obere Bar: Beleuchtung in %
      const illumBar = document.getElementById('moonBarFill');
      if (illumBar){
        illumBar.style.width = m.illum + '%';
        const illumWrapper = illumBar.parentElement;
        if (illumWrapper) illumWrapper.setAttribute('aria-valuenow', m.illum);
      }

      // untere Bar: Zyklusfortschritt in %
      const cyclePct = Math.round(m.frac * 100);
      const cycleBar = document.getElementById('moonCycleBarFill');
      if (cycleBar){
        cycleBar.style.width = cyclePct + '%';
        const cycleWrapper = cycleBar.parentElement;
        if (cycleWrapper) cycleWrapper.setAttribute('aria-valuenow', cyclePct);
      }
      const moonTimelineToday = document.getElementById('moonTimelineToday');
      if (moonTimelineToday) moonTimelineToday.style.left = cyclePct + '%';

      // Nächster Vollmond
      const nextFull = document.getElementById('moonNextFull');
      if (nextFull) nextFull.textContent = t.next_full + ': ' + options.formatDateTime(nf, tz);
      const moonLocalPositionLabel = document.getElementById('moonLocalPositionLabel');
      const moonLocalPositionMain = document.getElementById('moonLocalPositionMain');
      const moonLocalPositionSub = document.getElementById('moonLocalPositionSub');
      const moonLocalCompass = document.getElementById('moonLocalCompass');
      if (moonLocalPositionLabel && moonLocalPositionMain && moonLocalPositionSub && moonLocalCompass) {
        let compass = moonLocalCompass.querySelector('.direction-compass');
        if (!compass) {
          compass = options.compass.create(NaN);
          moonLocalCompass.appendChild(compass);
        }
        moonLocalPositionLabel.textContent = options.directionLabel(date, location);
        const moonDirectionDate = options.directionReferenceDate(date, location);
        const moonDirection = options.lookDirection(moonDirectionDate, location);
        if (moonDirection) {
          options.compass.setAzimuth(compass, moonDirection.azimuthDeg);
          moonLocalPositionMain.textContent =
            moonDirection.directionLabel + ' · ' + moonDirection.azimuthDeg.toFixed(0) + '°';
          moonLocalPositionSub.textContent = moonDirection.altitudeText;
        } else {
          options.compass.setAzimuth(compass, NaN);
          moonLocalPositionMain.textContent = '-';
          moonLocalPositionSub.textContent = '-';
        }
      }
    }

    /** Updates the retained renderCaption view from the common dashboard selection.
     * @param {object} context Explicit date and location. @returns {void}
     */
    function renderCaption(context){
      const date = context.date;
      const t = options.getTranslations();
      const m   = options.computeMoon(date);
      const emPhaseText = document.getElementById('emPhaseText');
      if (emPhaseText) {
        emPhaseText.textContent = t.phase_label + ': ' + t[m.key] + ' (' + m.illum + '%)';
      }
    }


    /** Draws one orbit frame without starting another animation chain.
     * @param {number} timestamp Frame timestamp in milliseconds. @returns {void}
     */
    function drawOrbit(timestamp){
      const orbit = document.getElementById('emOrbit');
      const moon  = document.getElementById('emMoon');
      if (!orbit || !moon) return;

      const rect = orbit.getBoundingClientRect();
      const width  = rect.width  || orbit.offsetWidth  || 180;
      const height = rect.height || orbit.offsetHeight || 120;

      const a = Math.max(20, width  / 2 - 10);
      const b = Math.max(20, height / 2 - 10);
      const cx = width  / 2;
      const cy = height / 2;

      // 12 Sekunden pro Umlauf: sichtbar, aber nicht hektisch.
      const angle = ((timestamp || performance.now()) / 12000) * Math.PI * 2;
      const x = cx + a * Math.cos(angle);
      const y = cy + b * Math.sin(angle);

      moon.style.left = x + 'px';
      moon.style.top  = y + 'px';
      moon.style.transform = 'translate(-50%, -50%)';


    }

    /** Schedules at most one pending frame for the owned animation.
     * No parameters. @returns {void}
     */
    function scheduleFrame(){
      if (frame) { return; }
      frame = requestAnimationFrame(animate);
    }

    /** Advances the single animation chain.
     * @param {number} timestamp Frame timestamp. @returns {void}
     */
    function animate(timestamp){
      frame = 0;
      drawOrbit(timestamp);
      scheduleFrame();
    }

    /** Starts or resumes the owned animation without duplicating its frame.
     * No parameters. @returns {void}
     */
    function start(){ scheduleFrame(); }

    /** Wires lifecycle events once; resize only ensures the existing chain is queued.
     * No parameters. @returns {void}
     */
    function wire(){
      if (wired) { return; }
      wired = true;
      browser.addEventListener('pageshow', start);
      browser.addEventListener('resize', start);
    }

    return {renderPhase, renderCaption, start, wire};
  }
  return {create};
})();
