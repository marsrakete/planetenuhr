window.PLANETENUHR_SUNLIGHT_CARD = (() => {
  'use strict';

  /** Creates the daylight timeline controller.
   * @param {object} dependencies Document, solar model, translations provider and time formatter.
   * @returns {{render:Function}} Renderer for one shared dashboard context.
   */
  function create(dependencies){
    const document = dependencies.document;

    /** Maps a timestamp onto the selected local calendar day's timeline.
     * @param {Date} day Selected date whose local midnight defines the scale.
     * @param {Date|null} value Solar event or selected instant.
     * @returns {number} Timeline position in percent, or zero when no event exists.
     */
    function positionOfDay(day, value){
      if (!value) {
        return 0;
      }
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      return ((value - startOfDay) / 86400000) * 100;
    }

    /** Writes a text value when the target element exists.
     * @param {string} id Element id.
     * @param {string} value Visible text.
     * @returns {void}
     */
    function setText(id, value){
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    }

    /** Places one timeline marker without letting it leave the track.
     * @param {string} id Element id.
     * @param {number} value Timeline position in percent.
     * @returns {void}
     */
    function setLeft(id, value){
      const element = document.getElementById(id);
      if (element) {
        element.style.left = Math.max(0, Math.min(100, value)) + '%';
      }
    }

    /** Formats one solar interval for accessible labels and tooltips.
     * @param {string} label Localized segment name.
     * @param {Date|null} start Interval start.
     * @param {Date|null} end Interval end.
     * @returns {string} Localized interval label or a dash when either time is absent.
     */
    function lightRangeLabel(label, start, end){
      if (!start || !end) {
        return label + ': -';
      }
      return label + ': ' + dependencies.formatTime(start) + '-' + dependencies.formatTime(end);
    }

    /** Positions and labels one daylight or twilight segment.
     * @param {string} id Element id.
     * @param {Date} date Selected calendar day used for the timeline scale.
     * @param {Date|null} start Segment start.
     * @param {Date|null} end Segment end.
     * @param {string} label Localized segment name.
     * @returns {void}
     */
    function setSegment(id, date, start, end, label){
      const element = document.getElementById(id);
      if (!element || !start || !end) {
        return;
      }
      const left = Math.max(0, Math.min(100, positionOfDay(date, start)));
      const right = Math.max(0, Math.min(100, positionOfDay(date, end)));
      element.style.left = left + '%';
      element.style.width = Math.max(0, right - left) + '%';
      const tooltip = lightRangeLabel(label, start, end);
      element.title = tooltip;
      element.setAttribute('aria-label', tooltip);
    }

    /** Renders solar times and the daylight/twilight timeline.
     * @param {object} context Shared dashboard context containing date and location.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const location = context.location;
      const translations = dependencies.getTranslations();
      const solarEventUtc = dependencies.solarVisibility.solarEventUtc;
      const sunrise = solarEventUtc(date, location.latitude, location.longitude, 90.833, true);
      const sunset = solarEventUtc(date, location.latitude, location.longitude, 90.833, false);
      const dawn = solarEventUtc(date, location.latitude, location.longitude, 96, true);
      const dusk = solarEventUtc(date, location.latitude, location.longitude, 96, false);
      const goldenMorningEnd = solarEventUtc(date, location.latitude, location.longitude, 84, true);
      const goldenEveningStart = solarEventUtc(date, location.latitude, location.longitude, 84, false);
      const title = document.getElementById('titleSunlight');
      if (title) {
        title.textContent = (translations.title_sunlight || 'Day & night') + ' ' + location.name;
      }

      setText('sunriseTime', dependencies.formatTime(sunrise));
      setText('sunsetTime', dependencies.formatTime(sunset));
      let dayLengthText = '-';
      if (sunrise && sunset) {
        const totalMinutes = Math.max(0, Math.round((sunset - sunrise) / 60000));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        dayLengthText = hours + ' ' + translations.hours_short + ' ' + String(minutes).padStart(2, '0') + ' ' + translations.minutes_short;
      }
      setText('dayLength', dayLengthText);
      setText('dawnTime', dependencies.formatTime(dawn));
      setText('duskTime', dependencies.formatTime(dusk));
      setLeft('dayNightDawnMarker', positionOfDay(date, dawn));
      setLeft('dayNightSunriseMarker', positionOfDay(date, sunrise));
      setLeft('dayNightSunsetMarker', positionOfDay(date, sunset));
      setLeft('dayNightDuskMarker', positionOfDay(date, dusk));
      setLeft('dayNightNowMarker', positionOfDay(date, date));
      setSegment('lightDaySegment', date, sunrise, sunset, translations.light_day);
      setSegment('blueMorningSegment', date, dawn, sunrise, translations.blue_hour + ' ' + translations.light_morning);
      setSegment('goldenMorningSegment', date, sunrise, goldenMorningEnd, translations.golden_hour + ' ' + translations.light_morning);
      setSegment('goldenEveningSegment', date, goldenEveningStart, sunset, translations.golden_hour + ' ' + translations.light_evening);
      setSegment('blueEveningSegment', date, sunset, dusk, translations.blue_hour + ' ' + translations.light_evening);
      setLeft('lightHourNowMarker', positionOfDay(date, date));
    }

    return {render};
  }

  return {create};
})();
