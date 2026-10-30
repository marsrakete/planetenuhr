window.PLANETENUHR_DATE_CONTROLS = (() => {
  'use strict';
  /** Creates the global date-control controller without wiring or starting timers.
   * @param {object} dependencies Document, window, context, clock, formatting, settings and refresh adapters.
   * @returns {object} Explicit control methods and idempotent wire method.
   */
  function create(dependencies){
    const document = dependencies.document;
    const context = dependencies.context;
    const requestLayout = dependencies.requestLayout;
    const setInterval = dependencies.window.setInterval.bind(dependencies.window);
    const clearInterval = dependencies.window.clearInterval.bind(dependencies.window);
    const setTimeout = dependencies.window.setTimeout.bind(dependencies.window);
    const clearTimeout = dependencies.window.clearTimeout.bind(dependencies.window);
    let solarAutoplayInterval = null;
    let solarAutoplayActive = false;
    let solarHoldDelay = null;
    let solarHoldInterval = null;
    let solarHoldTriggered = false;
    let dateSettingsPanelOpen = false;
    let settingsControlsWired = false;
    let wired = false;

    /** Updates the two settings-toggle states for assistive technology.
     * No parameters. @returns {void}
     */
    function updateDateSettingsToggleState(){
      document.querySelectorAll('[data-date-settings-toggle]').forEach(button => {
        button.setAttribute('aria-expanded', String(dateSettingsPanelOpen));
      });
    }

    /** Opens or closes the compact mobile date panel.
     * @param {boolean} isOpen Desired mobile open state. @returns {void}
     */
    function setDateMobilePanelOpen(isOpen){
      const card = document.querySelector('.date-location-card');
      if (!card) {
        return;
      }
      if (dependencies.window.innerWidth > 760) {
        card.classList.remove('mobile-collapsed');
        return;
      }
      if (isOpen) {
        card.classList.remove('mobile-collapsed');
      } else {
        card.classList.add('mobile-collapsed');
      }
      requestLayout();
    }

    /** Toggles the mobile date panel when its summary bar is clicked.
     * No parameters. @returns {void}
     */
    function toggleDateMobilePanel(){
      const card = document.querySelector('.date-location-card');
      if (!card) {
        return;
      }
      if (card.classList.contains('mobile-collapsed')) {
        setDateMobilePanelOpen(true);
      } else {
        setDateMobilePanelOpen(false);
      }
    }

    /** Synchronizes the mobile date-panel state with the current viewport.
     * No parameters. @returns {void}
     */
    function syncDateMobilePanelForViewport(){
      const card = document.querySelector('.date-location-card');
      if (!card) {
        return;
      }
      if (dependencies.window.innerWidth <= 760) {
        if (!card.classList.contains('mobile-collapsed')) {
          card.classList.add('mobile-collapsed');
        }
        return;
      }
      card.classList.remove('mobile-collapsed');
    }

    /** Opens or closes the date-settings popup and updates responsive classes.
     * @param {boolean} isOpen Desired popup state. @returns {void}
     */
    function setDateSettingsPanelOpen(isOpen){
      const card = document.querySelector('.date-location-card');
      const panel = document.getElementById('dateSettingsPanel');
      if (!card || !panel) {
        return;
      }
      const nextState = Boolean(isOpen);
      if (dateSettingsPanelOpen === nextState && panel.hidden === !nextState) {
        return;
      }
      dateSettingsPanelOpen = nextState;
      panel.setAttribute('aria-hidden', String(!dateSettingsPanelOpen));
      if (dateSettingsPanelOpen) {
        card.classList.add('settings-open');
        if (dependencies.window.innerWidth <= 760) {
          card.classList.remove('mobile-collapsed');
        }
      } else {
        card.classList.remove('settings-open');
        if (dependencies.window.innerWidth <= 760) {
          card.classList.add('mobile-collapsed');
        }
      }
      updateDateSettingsToggleState();
      requestLayout();
    }

    /** Toggles the shared date-settings popup.
     * No parameters. @returns {void}
     */
    function toggleDateSettingsPanel(){
      if (dateSettingsPanelOpen) {
        setDateSettingsPanelOpen(false);
      } else {
        setDateSettingsPanelOpen(true);
      }
    }

    /** Wires settings toggles, outside-click/Escape closing and the mobile date bar once.
     * No parameters. @returns {void}
     */
    function wireDatePanelControls(){
      document.querySelectorAll('[data-date-settings-toggle]').forEach(button => {
        button.addEventListener('pointerdown', event => {
          event.stopPropagation();
        });
        button.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          button.blur();
          toggleDateSettingsPanel();
        });
      });
      if (!settingsControlsWired) {
        document.addEventListener('pointerdown', event => {
          if (event.target.closest('#dateSettingsPanel')) {
            return;
          }
          if (event.target.closest('[data-date-settings-toggle]')) {
            return;
          }
          setDateSettingsPanelOpen(false);
        });
        document.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            setDateSettingsPanelOpen(false);
          }
        });
        settingsControlsWired = true;
      }
      document.getElementById('btnDateMobileBar').addEventListener('click', event => {
        if (dependencies.window.innerWidth > 760) {
          return;
        }
        if (event.target.closest('button')) {
          return;
        }
        toggleDateMobilePanel();
      });
    }

    /** Populates the configured city selector while retaining the selected city.
     * No parameters. @returns {void}
     */
    function populateLocationSelector(){
      const selector = document.getElementById('locationSelector');
      if (!selector) {
        return;
      }
      selector.replaceChildren();
      for (const location of dependencies.locations) {
        const option = document.createElement('option');
        option.value = location.key;
        option.textContent = dependencies.getLocationOptionLabel(location);
        selector.appendChild(option);
      }
      selector.value = context.getLocationKey();
    }

    /** Updates desktop/mobile date labels, city label and the selection URL.
     * No parameters.
     * @returns {void}
     */
    function updateControlDateReadout(){
      const readout = document.getElementById('controlDateReadout');
      if (readout) readout.textContent = dependencies.formatDate(context.getDate());
      const mobileReadout = document.getElementById('controlDateReadoutMobile');
      if (mobileReadout) {
        mobileReadout.textContent = dependencies.formatDate(context.getDate());
      }
      const mobileLocationReadout = document.getElementById('controlLocationReadoutMobile');
      if (mobileLocationReadout) {
        const location = context.getLocation();
        if (location && location.name) {
          mobileLocationReadout.textContent = location.name;
        }
      }
      dependencies.syncUrl();
    }

    /** Updates the time-lapse button label and pressed state.
     * No parameters.
     * @returns {void}
     */
    function updateSolarAutoplayButton(){
      const t = dependencies.getTranslations();
      const button = document.getElementById('btnSolarAutoplay');
      if (!button) return;
      button.textContent = t.solar_timelapse || 'Time-lapse';
      button.classList.toggle('active', solarAutoplayActive);
      let pressedState = 'false';
      let ariaLabel = t.solar_timelapse_start || 'Start time-lapse';
      if (solarAutoplayActive) {
        pressedState = 'true';
        ariaLabel = t.solar_timelapse_stop || 'Stop time-lapse';
      }
      button.setAttribute('aria-pressed', pressedState);
      button.setAttribute('aria-label', ariaLabel);
    }

    /** Stops the owned time-lapse interval and resets its button state.
     * No parameters.
     * @returns {void}
     */
    function stopSolarAutoplay(){
      clearInterval(solarAutoplayInterval);
      solarAutoplayInterval = null;
      solarAutoplayActive = false;
      updateSolarAutoplayButton();
    }

    /** Starts one 500 ms time-lapse interval after clearing the previous timer.
     * No parameters.
     * @returns {void}
     */
    function startSolarAutoplay(){
      stopSolarDateHold();
      clearInterval(solarAutoplayInterval);
      solarAutoplayActive = true;
      updateSolarAutoplayButton();
      solarAutoplayInterval = setInterval(() => stepSolarDate(1, { fromAutoplay:true }), 500);
    }

    /** Toggles the owned time-lapse interval.
     * No parameters.
     * @returns {void}
     */
    function toggleSolarAutoplay(){
      if (solarAutoplayActive) {
        stopSolarAutoplay();
        return;
      }
      startSolarAutoplay();
    }

    /** Applies the slider offset and refreshes consumers while preserving the viewport.
     * No parameters.
     * @returns {void}
     */
    function updateSolarDateFromSlider(){
      stopSolarAutoplay();
      const slider = document.getElementById('solarDateSlider');
      context.setDayOffset(Number(slider.value) || 0);
      slider.setAttribute('aria-valuenow', String(context.getDayOffset()));
      dependencies.refresh();
    }

    /** Resets the day offset and slider to today and stops time-lapse.
     * No parameters.
     * @returns {void}
     */
    function resetSolarDate(){
      stopSolarAutoplay();
      const slider = document.getElementById('solarDateSlider');
      slider.value = '0';
      context.setDayOffset(0);
      slider.setAttribute('aria-valuenow', '0');
      dependencies.refresh();
    }

    /** Applies a bounded day step and stops manual or exhausted time-lapse.
     * @param {number} days Existing control argument.
     * @param {object} options Existing control argument.
     * @returns {void}
     */
    function stepSolarDate(days, options = {}){
      const slider = document.getElementById('solarDateSlider');
      const minimum = Number(slider.min);
      const maximum = Number(slider.max);
      if (!options.fromAutoplay) {
        stopSolarAutoplay();
      }
      const nextOffset = Math.max(minimum, Math.min(maximum, context.getDayOffset() + days));
      if (nextOffset === context.getDayOffset()) {
        if (options.fromAutoplay) stopSolarAutoplay();
        return;
      }
      context.setDayOffset(nextOffset);
      slider.value = String(context.getDayOffset());
      slider.setAttribute('aria-valuenow', String(context.getDayOffset()));
      dependencies.refresh();
    }

    /** Applies the existing native month rollover and bounded offset.
     * @param {number} months Existing control argument.
     * @returns {void}
     */
    function stepSolarDateByMonths(months){
      stopSolarAutoplay();
      const current = context.getDate();
      const shifted = new Date(current);
      shifted.setMonth(shifted.getMonth() + months);
      const nextOffset = Math.round((shifted - dependencies.getNow()) / 86400000);
      const slider = document.getElementById('solarDateSlider');
      const minimum = Number(slider.min);
      const maximum = Number(slider.max);
      context.setDayOffset(Math.max(minimum, Math.min(maximum, nextOffset)));
      slider.value = String(context.getDayOffset());
      slider.setAttribute('aria-valuenow', String(context.getDayOffset()));
      dependencies.refresh();
    }

    /** Starts delayed date repetition while stopping time-lapse and prior hold timers.
     * @param {number} days Existing control argument.
     * @returns {void}
     */
    function startSolarDateHold(days){
      stopSolarAutoplay();
      stopSolarDateHold();
      solarHoldTriggered=false;
      solarHoldDelay=setTimeout(()=>{
        solarHoldTriggered=true;
        stepSolarDate(days);
        solarHoldInterval=setInterval(() => stepSolarDate(days), 300);
      },500);
    }

    /** Clears the pending hold delay and repeating date-step timer.
     * No parameters.
     * @returns {void}
     */
    function stopSolarDateHold(){
      clearTimeout(solarHoldDelay);
      clearInterval(solarHoldInterval);
      solarHoldDelay=null;
      solarHoldInterval=null;
    }

    /** Skips the extra click after a hold or performs one normal day step.
     * @param {number} days Existing control argument.
     * @returns {void}
     */
    function handleSolarStepClick(days){
      if(solarHoldTriggered){
        solarHoldTriggered=false;
        return;
      }
      stepSolarDate(days);
    }

    /** Connects pointer and click handling for one day-step button.
     * @param {HTMLElement} button Existing control argument.
     * @param {number} days Existing control argument.
     * @returns {void}
     */
    function wireSolarStepButton(button, days){
      button.addEventListener('pointerdown', event => {
        if(event.button !== 0) return;
        startSolarDateHold(days);
      });
      button.addEventListener('pointerup', stopSolarDateHold);
      button.addEventListener('pointercancel', stopSolarDateHold);
      button.addEventListener('pointerleave', stopSolarDateHold);
      button.addEventListener('click', () => handleSolarStepClick(days));
    }

    /** Wires global date and location controls exactly once.
     * No parameters. @returns {void}
     */
    function wire(){
      if (wired) {
        return;
      }
      wired = true;
      wireDatePanelControls();
      document.getElementById('solarDateSlider').addEventListener('input', updateSolarDateFromSlider);
      document.getElementById('btnSolarToday').addEventListener('click', resetSolarDate);
      document.getElementById('btnSolarTodayMobile').addEventListener('click', resetSolarDate);
      wireSolarStepButton(document.getElementById('btnSolarPrev'), -1);
      wireSolarStepButton(document.getElementById('btnSolarNext'), 1);
      wireSolarStepButton(document.getElementById('btnSolarPrevMobile'), -1);
      wireSolarStepButton(document.getElementById('btnSolarNextMobile'), 1);
      document.getElementById('btnSolarPrevWeek').addEventListener('click', () => stepSolarDate(-7));
      document.getElementById('btnSolarNextWeek').addEventListener('click', () => stepSolarDate(7));
      document.getElementById('btnSolarPrevMonth').addEventListener('click', () => stepSolarDateByMonths(-1));
      document.getElementById('btnSolarNextMonth').addEventListener('click', () => stepSolarDateByMonths(1));
      document.getElementById('btnSolarPrevYear').addEventListener('click', () => stepSolarDateByMonths(-12));
      document.getElementById('btnSolarNextYear').addEventListener('click', () => stepSolarDateByMonths(12));
      document.getElementById('btnSolarAutoplay').addEventListener('click', toggleSolarAutoplay);
      document.getElementById('locationSelector').addEventListener('change', event => {
        context.setLocationKey(event.target.value);
        setDateSettingsPanelOpen(false);
        dependencies.refresh('location');
      });
      dependencies.window.addEventListener('pointerup', stopSolarDateHold);
    }

    return {wire, updateControlDateReadout, updateSolarAutoplayButton, updateDateSettingsToggleState,
      syncDateMobilePanelForViewport, populateLocationSelector};
  }
  return {create};
})();
