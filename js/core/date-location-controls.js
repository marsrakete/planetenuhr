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
    let timeAutoplayInterval = null;
    let timeAutoplayActive = false;
    let solarHoldDelay = null;
    let solarHoldInterval = null;
    let solarHoldTriggered = false;
    let dateSettingsPanelOpen = false;
    let lastMobileViewportState = null;
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

    /** Collapses the date panel only when entering the mobile layout, not on every viewport resize.
     * No parameters. @returns {void}
     */
    function syncDateMobilePanelForViewport(){
      const card = document.querySelector('.date-location-card');
      if (!card) {
        return;
      }
      const isMobileViewport = dependencies.window.innerWidth <= 760;
      if (lastMobileViewportState === isMobileViewport) {
        return;
      }
      lastMobileViewportState = isMobileViewport;
      if (isMobileViewport) {
        card.classList.add('mobile-collapsed');
      } else {
        card.classList.remove('mobile-collapsed');
      }
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

    /** Keeps pointer interactions inside the settings panel from reaching the outside-click handler.
     * @param {PointerEvent} event Pointer interaction within the settings panel.
     * @returns {void} No return value.
     */
    function stopSettingsPanelPointerDown(event){
      event.stopPropagation();
    }

    /** Wires settings toggles, outside-click/Escape closing and the mobile date bar once.
     * No parameters. @returns {void}
     */
    function wireDatePanelControls(){
      const settingsPanel = document.getElementById('dateSettingsPanel');
      if (settingsPanel) {
        settingsPanel.addEventListener('pointerdown', stopSettingsPanelPointerDown);
      }
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
          const target = event.target;
          let isInsideSettingsPanel = false;
          if (settingsPanel) {
            isInsideSettingsPanel = settingsPanel.contains(target);
          }
          if (!isInsideSettingsPanel && settingsPanel && typeof event.composedPath === 'function') {
            isInsideSettingsPanel = event.composedPath().includes(settingsPanel);
          }
          if (isInsideSettingsPanel) {
            return;
          }
          if (target && target.closest && target.closest('[data-date-settings-toggle]')) {
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
      const selection = context.snapshot();
      const formattedDate = dependencies.formatDate(selection.date, selection.timeZone);
      const readout = document.getElementById('controlDateReadout');
      if (readout) readout.textContent = formattedDate;
      const mobileReadout = document.getElementById('controlDateReadoutMobile');
      if (mobileReadout) {
        mobileReadout.textContent = formattedDate;
      }
      const mobileLocationReadout = document.getElementById('controlLocationReadoutMobile');
      if (mobileLocationReadout) {
        const location = context.getLocation();
        if (location && location.name) {
          mobileLocationReadout.textContent = location.name;
        }
      }
      updateTimeControlReadout();
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

    /** Updates the translated hour time-lapse button and its pressed state.
     * No parameters. @returns {void}
     */
    function updateTimeAutoplayButton(){
      const t = dependencies.getTranslations();
      const button = document.getElementById('btnTimeAutoplay');
      if (!button) {
        return;
      }
      button.textContent = t.time_timelapse || 'Time-lapse';
      button.classList.toggle('active', timeAutoplayActive);
      button.setAttribute('aria-pressed', String(timeAutoplayActive));
      if (timeAutoplayActive) {
        button.setAttribute('aria-label', t.time_timelapse_stop || 'Stop hour time-lapse');
      } else {
        button.setAttribute('aria-label', t.time_timelapse_start || 'Start hour time-lapse');
      }
    }

    /** Displays the selected local clock time in the slider and its accessible value.
     * No parameters. @returns {void}
     */
    function updateTimeControlReadout(){
      const slider = document.getElementById('timeOfDaySlider');
      const readout = document.getElementById('timeOfDayReadout');
      if (!slider || !readout) {
        return;
      }
      const selectedDate = context.getDate();
      const selection = context.snapshot(selectedDate);
      const language = dependencies.getLanguage || (() => document.documentElement.lang || 'en');
      const formattedTime = new Intl.DateTimeFormat(language(), {
        timeZone:selection.timeZone,
        hour:'2-digit',
        minute:'2-digit',
        hourCycle:'h23'
      }).format(selectedDate);
      slider.value = String(context.getTimeOfDayMinutes());
      slider.setAttribute('aria-valuenow', slider.value);
      slider.setAttribute('aria-valuetext', formattedTime);
      readout.textContent = formattedTime;
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

    /** Stops the owned hour time-lapse interval and resets its button state.
     * No parameters. @returns {void}
     */
    function stopTimeAutoplay(){
      clearInterval(timeAutoplayInterval);
      timeAutoplayInterval = null;
      timeAutoplayActive = false;
      updateTimeAutoplayButton();
    }

    /** Advances the shared clock by one local hour and carries across midnight.
     * No parameters. @returns {void}
     */
    function stepTimeAutoplay(){
      const dateSlider = document.getElementById('solarDateSlider');
      const nextLocalHour = context.getTimeOfDayMinutes() + 60;
      if (nextLocalHour >= 1440 && context.getDayOffset() >= Number(dateSlider.max)) {
        stopTimeAutoplay();
        return;
      }
      context.advanceTimeByMinutes(60);
      dateSlider.value = String(context.getDayOffset());
      dateSlider.setAttribute('aria-valuenow', String(context.getDayOffset()));
      updateTimeControlReadout();
      dependencies.refresh();
    }

    /** Starts one hourly-step-per-second interval and stops the day time-lapse first.
     * No parameters. @returns {void}
     */
    function startTimeAutoplay(){
      stopSolarDateHold();
      stopSolarAutoplay();
      clearInterval(timeAutoplayInterval);
      timeAutoplayActive = true;
      updateTimeAutoplayButton();
      timeAutoplayInterval = setInterval(stepTimeAutoplay, 1000);
    }

    /** Toggles the hour time-lapse without allowing both global time-lapses to run together.
     * No parameters. @returns {void}
     */
    function toggleTimeAutoplay(){
      if (timeAutoplayActive) {
        stopTimeAutoplay();
        return;
      }
      startTimeAutoplay();
    }

    /** Applies the hour slider and refreshes every date-dependent tile.
     * No parameters. @returns {void}
     */
    function updateTimeFromSlider(){
      stopSolarDateHold();
      stopSolarAutoplay();
      stopTimeAutoplay();
      context.setTimeOfDayMinutes(Number(document.getElementById('timeOfDaySlider').value));
      updateTimeControlReadout();
      dependencies.refresh();
    }

    /** Sets the selected day's local clock to the current whole hour.
     * No parameters. @returns {void}
     */
    function setSelectedTimeToNow(){
      stopSolarDateHold();
      stopSolarAutoplay();
      stopTimeAutoplay();
      const selectedLocation = context.getLocation();
      const timeZone = window.PLANETENUHR_DATE_TIME.locationTimeZoneId(selectedLocation);
      const nowParts = window.PLANETENUHR_DATE_TIME.timePartsInZone(dependencies.getNow(), timeZone);
      context.setTimeOfDayMinutes(nowParts.hour * 60);
      updateTimeControlReadout();
      dependencies.refresh();
    }

    /** Starts one 500 ms time-lapse interval after clearing the previous timer.
     * No parameters.
     * @returns {void}
     */
    function startSolarAutoplay(){
      stopSolarDateHold();
      stopTimeAutoplay();
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
      stopTimeAutoplay();
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
      stopTimeAutoplay();
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
        stopTimeAutoplay();
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
      stopTimeAutoplay();
      const current = context.getDate();
      const shifted = new Date(current);
      shifted.setMonth(shifted.getMonth() + months);
      const timeZone = window.PLANETENUHR_DATE_TIME.locationTimeZoneId(context.getLocation());
      const nextOffset = window.PLANETENUHR_DATE_TIME.calendarDayDifferenceInZone(
        dependencies.getNow(), shifted, timeZone
      );
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
      stopTimeAutoplay();
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
      document.getElementById('timeOfDaySlider').addEventListener('input', updateTimeFromSlider);
      document.getElementById('btnTimeNow').addEventListener('click', setSelectedTimeToNow);
      document.getElementById('btnTimeAutoplay').addEventListener('click', toggleTimeAutoplay);
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
        stopSolarAutoplay();
        stopTimeAutoplay();
        context.setLocationKey(event.target.value);
        dependencies.refresh('location');
      });
      dependencies.window.addEventListener('pointerup', stopSolarDateHold);
    }

    return {wire, updateControlDateReadout, updateSolarAutoplayButton, updateTimeControlReadout,
      updateTimeAutoplayButton, updateDateSettingsToggleState,
      syncDateMobilePanelForViewport, populateLocationSelector};
  }
  return {create};
})();
