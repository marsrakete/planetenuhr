(function(root){
  "use strict";

  /** Builds sorted localized calendar events with stable keys and local date objects.
   * @param {Array<object>} sourceEvents Calendar configuration events for one language.
   * @returns {Array<object>} New sorted event objects enriched with dateObj and key.
   */
  function createEvents(sourceEvents){
    const enrichedEvents = [];
    let index = 0;
    while (index < sourceEvents.length) {
      const event = sourceEvents[index];
      enrichedEvents.push({
        ...event,
        dateObj:new Date(event.date + "T00:00:00"),
        key:eventKey(event)
      });
      index += 1;
    }
    enrichedEvents.sort((left, right) => left.dateObj - right.dateObj);
    return enrichedEvents;
  }

  /** Selects the localized source list, falling back to English, then enriches it.
   * @param {Record<string, Array<object>>} eventsByLanguage Calendar sources by language.
   * @param {string} language Requested language key.
   * @returns {Array<object>} Sorted localized events.
   */
  function eventsForLanguage(eventsByLanguage, language){
    let sourceEvents = eventsByLanguage.en || [];
    if (eventsByLanguage[language]) {
      sourceEvents = eventsByLanguage[language];
    }
    return createEvents(sourceEvents);
  }

  /** Builds the stable event key used by selection and downloads.
   * @param {object} event Calendar configuration event.
   * @returns {string} Key composed from date, category and title.
   */
  function eventKey(event){
    if (!event) {
      return "";
    }
    return [event.date || "", event.category || "", event.title || ""].join("|");
  }

  /** Tests whether an event belongs to the active category.
   * @param {object} event Enriched calendar event.
   * @param {string} category Category key or all.
   * @returns {boolean} True when the event matches the category.
   */
  function matchesCategory(event, category){
    if (!event) {
      return false;
    }
    if (category === "all") {
      return true;
    }
    return event.category === category;
  }

  /** Returns events visible for the category and past-event setting.
   * @param {Array<object>} events Sorted enriched events.
   * @param {string} category Active category key or all.
   * @param {boolean} showPast Whether events before referenceDay are included.
   * @param {Date} referenceDay Local start-of-day cutoff.
   * @returns {Array<object>} Visible events in chronological order.
   */
  function filterEvents(events, category, showPast, referenceDay){
    const visibleEvents = [];
    let index = 0;
    while (index < events.length) {
      const event = events[index];
      if (matchesCategory(event, category)) {
        if (showPast || event.dateObj >= referenceDay) {
          visibleEvents.push(event);
        }
      }
      index += 1;
    }
    return visibleEvents;
  }

  /** Finds the next event on or after the cutoff in the selected category.
   * @param {Array<object>} events Sorted enriched events.
   * @param {string} category Active category key or all.
   * @param {Date} referenceDay Local start-of-day cutoff.
   * @returns {object|null} Next matching event, or null.
   */
  function nextEvent(events, category, referenceDay){
    let index = 0;
    while (index < events.length) {
      const event = events[index];
      if (matchesCategory(event, category) && event.dateObj >= referenceDay) {
        return event;
      }
      index += 1;
    }
    return null;
  }

  /** Finds the selected event among the currently visible events.
   * @param {Array<object>} visibleEvents Events in the current view.
   * @param {string} selectedKey Stable key of the selected event.
   * @returns {object|null} Matching visible event, or null.
   */
  function selectedEvent(visibleEvents, selectedKey){
    if (!Array.isArray(visibleEvents) || visibleEvents.length === 0 || !selectedKey) {
      return null;
    }
    let index = 0;
    while (index < visibleEvents.length) {
      if (visibleEvents[index].key === selectedKey) {
        return visibleEvents[index];
      }
      index += 1;
    }
    return null;
  }

  /** Returns the events whose local dates fall in the requested month.
   * @param {Date} monthDate Any date in the target month.
   * @param {Array<object>} events Candidate enriched events.
   * @returns {Array<object>} Events in the target local month.
   */
  function eventsForMonth(monthDate, events){
    const monthEvents = [];
    let index = 0;
    while (index < events.length) {
      const event = events[index];
      if (event.dateObj.getFullYear() === monthDate.getFullYear() && event.dateObj.getMonth() === monthDate.getMonth()) {
        monthEvents.push(event);
      }
      index += 1;
    }
    return monthEvents;
  }

  /** Groups events by their source YYYY-MM-DD date key.
   * @param {Array<object>} monthEvents Events from a single month.
   * @returns {Map<string, Array<object>>} Events grouped by date key.
   */
  function eventsByDay(monthEvents){
    const grouped = new Map();
    let index = 0;
    while (index < monthEvents.length) {
      const event = monthEvents[index];
      const dayKey = event.date;
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      grouped.get(dayKey).push(event);
      index += 1;
    }
    return grouped;
  }

  root.PLANETENUHR_CALENDAR_MODEL = Object.freeze({
    createEvents,
    eventsForLanguage,
    eventKey,
    filterEvents,
    nextEvent,
    selectedEvent,
    eventsForMonth,
    eventsByDay
  });
})(window);
