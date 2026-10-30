(function(root){
  "use strict";

  /** Creates the sky-calendar controller with data, locale, template and layout dependencies.
   * @param {object} options Includes model, document/window, event/date accessors,
   * translations, date formatters, template cloning and the layout callback.
   * @returns {object} Calendar state, rendering actions and one-time DOM wiring.
   */
  function create(options){
    const document = options.document;
    const window = options.window;
    const HTMLElement = window.HTMLElement;
    const Blob = window.Blob;
    const URL = window.URL;
    const skyCalendarModel = options.model;
    const lang = options.getLanguage();
    const t = options.getTranslations();
    const fmtDateOnly = options.formatDateOnly;
    const formatDateKey = options.formatDateKey;
    const cloneTemplate = options.cloneTemplate;
    const selectedSolarDate = options.getDate;
    const requestMasonryLayout = options.requestLayout;
    const compactCalendarListLimit = options.compactListLimit;

    let activeFilter = "all";
    let showAllEvents = false;
    let activeView = "list";
    let selectedEventKey = "";
    let wired = false;

    /** Returns a copy of the current user-interface state.
     * @returns {{filter:string,showAll:boolean,view:string,selectedKey:string}} Current state snapshot.
     */
    function getState(){
      return {
        filter:activeFilter,
        showAll:showAllEvents,
        view:activeView,
        selectedKey:selectedEventKey
      };
    }

    /** Returns events visible under the current filter and past-event setting.
     * @returns {Array<object>} Events for the active calendar view.
     */
    function getVisibleEvents(){
      return options.model.filterEvents(
        options.getEvents(),
        activeFilter,
        calendarShowPastEnabled(),
        calendarReferenceDay()
      );
    }

    /** Returns the next upcoming event under the current category filter.
     * @returns {object|null} Next event or null.
     */
    function getNextEvent(){
      return options.model.nextEvent(options.getEvents(), activeFilter, calendarReferenceDay());
    }

    /** Resolves the selected event and clears selection if it is no longer visible.
     * @param {Array<object>} [visibleEvents=getVisibleEvents()] Candidate events.
     * @returns {object|null} Selected visible event or null.
     */
    function getSelectedEvent(visibleEvents){
      let candidates = visibleEvents;
      if (!Array.isArray(candidates)) {
        candidates = getVisibleEvents();
      }
      const selectedEvent = options.model.selectedEvent(candidates, selectedEventKey);
      if (!selectedEvent) {
        selectedEventKey = "";
      }
      return selectedEvent;
    }

    /** Activates a category, closes details, collapses the list and rerenders.
     * @param {string} filter Category key to activate.
     * @returns {void}
     */
    function setFilter(filter){
      activeFilter = filter;
      showAllEvents = false;
      selectedEventKey = "";
      renderCalendar();
    }

    /** Changes list/month mode and updates only the affected view state.
     * @param {string} view View key: list or month.
     * @returns {void}
     */
    function setView(view){
      activeView = view;
      selectedEventKey = "";
      updateCalendarButtonStates();
      renderCalendarDetail(null);
      updateCalendarViewVisibility(getVisibleEvents());
    }

    /** Toggles whether the list shows all matching events, then rerenders.
     * @returns {void}
     */
    function toggleShowAll(){
      showAllEvents = !showAllEvents;
      renderCalendar();
    }

    /** Opens one event in the detail view and stores its stable key.
     * @param {object} event Calendar event to open.
     * @returns {void}
     */
    function openEvent(event){
      if (!event) {
        return;
      }
      selectedEventKey = event.key;
      renderCalendarDetail(event);
    }

    /** Closes the detail view and clears the selected event key.
     * @returns {void}
     */
    function closeEvent(){
      selectedEventKey = "";
      renderCalendarDetail(null);
    }

    /** Wires calendar controls and the Escape shortcut once.
     * @param {Document} documentObject Page document that owns the calendar.
     * @returns {void}
     */
    function wire(documentObject){
      if (wired || !documentObject) {
        return;
      }
      wired = true;

      const card = documentObject.getElementById("skyCalendarCard");
      if (card) {
        card.addEventListener("pointerdown", event => {
          const button = event.target.closest("button");
          if (button) {
            event.preventDefault();
          }
        });
      }

      documentObject.querySelectorAll("[data-calendar-filter]").forEach(button => {
        button.addEventListener("click", event => {
          event.preventDefault();
          button.blur();
          setFilter(button.dataset.calendarFilter);
        });
      });

      documentObject.querySelectorAll("[data-calendar-view]").forEach(button => {
        button.addEventListener("click", event => {
          event.preventDefault();
          button.blur();
          setView(button.dataset.calendarView);
        });
      });

      const showPast = documentObject.getElementById("calendarShowPast");
      if (showPast) {
        showPast.addEventListener("change", () => {
          showAllEvents = false;
          renderCalendar();
        });
      }

      const showAllButton = documentObject.getElementById("btnCalendarShowAll");
      if (showAllButton) {
        showAllButton.addEventListener("click", event => {
          event.preventDefault();
          if (event.currentTarget instanceof documentObject.defaultView.HTMLElement) {
            event.currentTarget.blur();
          }
          toggleShowAll();
        });
      }

      documentObject.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          const detail = documentObject.getElementById("calendarDetail");
          if (detail && detail.hidden === false) {
            closeEvent();
          }
        }
      });
    }

    /**
     * Resolves the localized category label for one calendar category key.
     * @param {string} category Internal category key such as `eclipse`.
     * @returns {string} Localized category label.
     */
    function calendarCategoryLabel(category){
      if (!category) {
        return '';
      }
      const translationKey = 'calendar_filter_' + category;
      if (t[translationKey]) {
        return t[translationKey];
      }
      return category;
    }

    /**
     * Returns whether past events should stay visible in the current filter view.
     * @returns {boolean} True when the "show past" checkbox is enabled.
     */
    function calendarShowPastEnabled(){
      const checkbox = document.getElementById('calendarShowPast');
      if (!checkbox) {
        return false;
      }
      return checkbox.checked === true;
    }

    /**
     * Resolves the reference day used by the calendar card.
     * The shared date control drives the month view, while the filtering logic
     * still compares against the real current day unless past events are enabled.
     * @returns {Date} Local start-of-day reference.
     */
    function calendarReferenceDay(){
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }

    /**
     * Filters calendar events by category and, if requested, by future-only mode.
     * @returns {Array<object>} Events that remain visible in the active card state.
     */
    function filteredCalendarEvents(){
      return getVisibleEvents();
    }

    /**
     * Finds the next upcoming event for the currently active category filter.
     * @returns {object|null} Next matching event or null when none remains.
     */
    function nextCalendarEvent(){
      return getNextEvent();
    }

    /**
     * Resolves the month that the calendar grid should display.
     * The month follows the shared date control so every tile stays coupled.
     * @returns {Date} First day of the selected month.
     */
    function calendarCurrentMonthDate(){
      let referenceDate = new Date();
      if (typeof selectedSolarDate === 'function') {
        referenceDate = selectedSolarDate();
      }
      return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    }

    /**
     * Formats the month heading for the calendar grid.
     * @param {Date} monthDate First day of the displayed month.
     * @returns {string} Localized month and year label.
     */
    function calendarMonthHeading(monthDate){
      return monthDate.toLocaleDateString(lang, {
        month: 'long',
        year: 'numeric'
      });
    }

    /**
     * Builds weekday labels for the monthly calendar header.
     * The grid starts on Monday to match the rest of the dashboard.
     * @returns {Array<string>} Localized weekday abbreviations.
     */
    function calendarWeekdayLabels(){
      const labels = [];
      const mondayReference = new Date(Date.UTC(2026, 0, 5));
      let index = 0;
      while (index < 7) {
        const labelDate = new Date(mondayReference.getTime() + index * 86400000);
        labels.push(labelDate.toLocaleDateString(lang, { weekday: 'short' }));
        index += 1;
      }
      return labels;
    }

    /**
     * Resolves the ICS file path for one built category download.
     * @param {string} category Category key or `all`.
     * @returns {string} Relative ICS file path.
     */
    function calendarCategoryIcsPath(category){
      let safeCategory = category;
      if (!safeCategory) {
        safeCategory = 'all';
      }
      return 'ics/planetenuhr-' + lang + '-' + safeCategory + '.ics';
    }

    /**
     * Creates a small ICS payload for one single calendar event.
     * @param {object} event Selected calendar event.
     * @returns {string} RFC5545-style text for one all-day event.
     */
    function calendarEventIcsContent(event){
      if (!event) {
        return '';
      }

      const startDate = String(event.date || '').replace(/[^0-9]/g, '');
      const endDate = new Date(event.dateObj.getTime() + 86400000);
      const endDateKey = formatDateKey(endDate).replace(/[^0-9]/g, '');
      const createdStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
      const escapedTitle = String(event.title || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
      const escapedDescription = String(event.note || '').replace(/\r?\n/g, '\\n').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
      const escapedVisibility = String(event.visibility || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
      const escapedCategory = String(calendarCategoryLabel(event.category) || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');

      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//marsrakete//planetenuhr//DE',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:' + event.key + '@planetenuhr',
        'DTSTAMP:' + createdStamp,
        'DTSTART;VALUE=DATE:' + startDate,
        'DTEND;VALUE=DATE:' + endDateKey,
        'SUMMARY:' + escapedTitle,
        'DESCRIPTION:' + escapedDescription + '\\n' + (t.calendar_visibility_label || 'Visibility') + ': ' + escapedVisibility,
        'CATEGORIES:' + escapedCategory,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');
    }

    /**
     * Triggers a download for one single calendar event as ICS.
     * @param {object} event Selected calendar event.
     * @returns {void}
     */
    function downloadCalendarEventIcs(event){
      if (!event) {
        return;
      }

      const icsContent = calendarEventIcsContent(event);
      if (!icsContent) {
        return;
      }

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileTitle = (event.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      let fileName = event.date + '-' + fileTitle + '.ics';
      if (!fileTitle) {
        fileName = event.date + '-event.ics';
      }
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * Applies the category color class to one calendar element.
     * @param {HTMLElement} element DOM node that should receive the category class.
     * @param {string} category Event category.
     * @returns {void}
     */
    function applyCalendarCategoryClass(element, category){
      if (!element) {
        return;
      }
      element.classList.add('category-' + category);
    }

    /**
     * Opens one event in the shared detail overlay without rebuilding the whole card.
     * @param {object} event Calendar event that should become active.
     * @returns {void}
     */
    function openCalendarEvent(event){
      openEvent(event);
    }

    /**
     * Renders the static ICS download links for the full calendar categories.
     * @returns {void}
     */
    function renderCalendarDownloads(){
      const downloads = document.getElementById('calendarDownloads');
      if (!downloads) {
        return;
      }

      const fragments = [];
      const categories = ['all', 'eclipse', 'meteor', 'planet', 'moon', 'season'];
      let index = 0;
      while (index < categories.length) {
        const category = categories[index];
        const fragment = cloneTemplate('calendarDownloadButtonTemplate');
        if (fragment) {
          const link = fragment.querySelector('[data-calendar-download]');
          if (link) {
            let linkLabel = calendarCategoryLabel(category);
            if (category === 'all') {
              linkLabel = t.calendar_filter_all || 'All';
            }
            link.href = calendarCategoryIcsPath(category);
            link.textContent = (t.calendar_download_prefix || 'ICS') + ': ' + linkLabel;
            fragments.push(fragment);
          }
        }
        index += 1;
      }
      downloads.replaceChildren(...fragments);
    }

    /**
     * Renders the detail view for the currently selected calendar event.
     * @param {object|null} event Selected event or null when nothing is visible.
     * @returns {void}
     */
    function renderCalendarDetail(event){
      const detail = document.getElementById('calendarDetail');
      if (!detail) {
        return;
      }

      detail.hidden = true;
      detail.replaceChildren();
      if (!event) {
        return;
      }

      const fragment = cloneTemplate('calendarDetailTemplate');
      if (!fragment) {
        return;
      }

      const dateLabel = fragment.querySelector('[data-calendar-detail-date]');
      const titleLabel = fragment.querySelector('[data-calendar-detail-title]');
      const metaLabel = fragment.querySelector('[data-calendar-detail-meta]');
      const noteLabel = fragment.querySelector('[data-calendar-detail-note]');
      const downloadLink = fragment.querySelector('[data-calendar-detail-download]');
      const closeButton = fragment.querySelector('[data-calendar-detail-close-button]');
      const backdrop = fragment.querySelector('[data-calendar-detail-close]');

      if (dateLabel) {
        dateLabel.textContent = fmtDateOnly(event.dateObj);
      }
      if (titleLabel) {
        titleLabel.textContent = event.title;
      }
      if (metaLabel) {
        metaLabel.textContent = calendarCategoryLabel(event.category) + ' · ' + (t.calendar_visibility_label || 'Visibility') + ': ' + event.visibility;
      }
      if (noteLabel) {
        noteLabel.textContent = event.note;
      }
      if (downloadLink) {
        downloadLink.href = '#';
        downloadLink.textContent = t.calendar_detail_download || 'Download this event as ICS';
        downloadLink.addEventListener('click', eventObject => {
          eventObject.preventDefault();
          downloadCalendarEventIcs(event);
        });
      }
      if (closeButton) {
        closeButton.addEventListener('click', clickEvent => {
          clickEvent.preventDefault();
          if (clickEvent.currentTarget instanceof HTMLElement) {
            clickEvent.currentTarget.blur();
          }
          closeCalendarDetail();
        });
      }
      if (backdrop) {
        backdrop.addEventListener('click', clickEvent => {
          clickEvent.preventDefault();
          closeCalendarDetail();
        });
      }

      const detailCard = fragment.querySelector('.calendar-detail-card');
      applyCalendarCategoryClass(detailCard, event.category);
      detail.appendChild(fragment);
      detail.hidden = false;
    }

    /**
     * Closes the currently open calendar detail overlay.
     * @returns {void}
     */
    function closeCalendarDetail(){
      closeEvent();
    }

    /**
     * Renders the compact list view of the sky calendar.
     * @param {Array<object>} events Visible calendar events.
     * @returns {void}
     */
    function renderCalendarTimeline(events){
      const timeline = document.getElementById('calendarTimeline');
      if (!timeline) {
        return;
      }

      const nodes = [];
      let visibleEvents = events;
      if (!getState().showAll) {
        visibleEvents = events.slice(0, compactCalendarListLimit);
      }

      if (visibleEvents.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'calendar-note';
        empty.textContent = t.calendar_empty;
        nodes.push(empty);
        timeline.replaceChildren(...nodes);
        return;
      }

      let index = 0;
      while (index < visibleEvents.length) {
        const event = visibleEvents[index];
        const fragment = cloneTemplate('calendarTimelineItemTemplate');
        if (fragment) {
          const item = fragment.querySelector('.calendar-item');
          const dateLabel = fragment.querySelector('[data-calendar-date]');
          const titleLabel = fragment.querySelector('[data-calendar-title]');
          const metaLabel = fragment.querySelector('[data-calendar-meta]');
          const noteLabel = fragment.querySelector('[data-calendar-note]');
          const trigger = fragment.querySelector('[data-calendar-open]');
          const dot = fragment.querySelector('[data-calendar-dot]');

          if (dateLabel) {
            dateLabel.textContent = fmtDateOnly(event.dateObj);
          }
          if (titleLabel) {
            titleLabel.textContent = event.title;
          }
          if (metaLabel) {
            metaLabel.textContent = calendarCategoryLabel(event.category) + ' · ' + (t.calendar_visibility_label || 'Visibility') + ': ' + event.visibility;
          }
          if (noteLabel) {
            noteLabel.textContent = event.note;
          }
          if (trigger) {
            trigger.addEventListener('click', clickEvent => {
              clickEvent.preventDefault();
              if (clickEvent.currentTarget instanceof HTMLElement) {
                clickEvent.currentTarget.blur();
              }
              openCalendarEvent(event);
            });
          }
          applyCalendarCategoryClass(item, event.category);
          applyCalendarCategoryClass(dot, event.category);
          nodes.push(fragment);
        }
        index += 1;
      }
      timeline.replaceChildren(...nodes);
    }

    /**
     * Builds all events that belong to one displayed month.
     * @param {Date} monthDate First day of the displayed month.
     * @param {Array<object>} events Visible events after filtering.
     * @returns {Array<object>} Events that belong to the current month.
     */
    function calendarEventsForMonth(monthDate, events){
      return options.model.eventsForMonth(monthDate, events);
    }

    /**
     * Groups visible month events by local date key for the month grid.
     * @param {Array<object>} monthEvents Events in the selected month.
     * @returns {Map<string, Array<object>>} Events grouped by YYYY-MM-DD.
     */
    function calendarEventsByDay(monthEvents){
      return options.model.eventsByDay(monthEvents);
    }

    /**
     * Renders the monthly calendar grid.
     * @param {Array<object>} events Visible calendar events.
     * @returns {void}
     */
    function renderCalendarMonthView(events){
      const monthView = document.getElementById('calendarMonthView');
      const title = document.getElementById('calendarMonthTitle');
      const subtitle = document.getElementById('calendarMonthSubtitle');
      const weekdays = document.getElementById('calendarMonthWeekdays');
      const grid = document.getElementById('calendarMonthGrid');
      if (!monthView || !title || !subtitle || !weekdays || !grid) {
        return;
      }

      const monthDate = calendarCurrentMonthDate();
      const monthEvents = calendarEventsForMonth(monthDate, events);
      const byDay = calendarEventsByDay(monthEvents);
      title.textContent = calendarMonthHeading(monthDate);
      subtitle.textContent = t.calendar_month_subtitle || 'Monthly view';
      const weekdayNodes = [];
      const gridNodes = [];

      const weekdayLabels = calendarWeekdayLabels();
      let weekdayIndex = 0;
      while (weekdayIndex < weekdayLabels.length) {
        const label = document.createElement('div');
        label.className = 'calendar-month-weekday';
        label.textContent = weekdayLabels[weekdayIndex];
        weekdayNodes.push(label);
        weekdayIndex += 1;
      }
      weekdays.replaceChildren(...weekdayNodes);

      const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
      let cellIndex = 0;

      while (cellIndex < totalCells) {
        const dayNumber = cellIndex - startOffset + 1;
        const fragment = cloneTemplate('calendarMonthCellTemplate');
        if (fragment) {
          const cell = fragment.querySelector('.calendar-month-cell');
          const dayNumberLabel = fragment.querySelector('[data-calendar-day-number]');
          const eventsContainer = fragment.querySelector('[data-calendar-day-events]');

          if (dayNumber < 1 || dayNumber > daysInMonth) {
            if (cell) {
              cell.classList.add('is-outside');
            }
          } else {
            const dayDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNumber);
            const dayKey = formatDateKey(dayDate);
            const dayEvents = byDay.get(dayKey) || [];

            if (dayNumberLabel) {
              dayNumberLabel.textContent = String(dayNumber);
            }

            const todayKey = formatDateKey(selectedSolarDate());
            if (dayKey === todayKey && cell) {
              cell.classList.add('is-selected-month-day');
            }

            let dayEventIndex = 0;
            while (dayEventIndex < dayEvents.length) {
              const monthEvent = dayEvents[dayEventIndex];
              const eventFragment = cloneTemplate('calendarMonthEventTemplate');
              if (eventFragment) {
                const chip = eventFragment.querySelector('[data-calendar-month-event]');
                const dot = eventFragment.querySelector('[data-calendar-month-dot]');
                const label = eventFragment.querySelector('[data-calendar-month-label]');
                if (label) {
                  label.textContent = monthEvent.title;
                  label.title = monthEvent.title;
                }
                if (chip) {
                  chip.title = monthEvent.title;
                  chip.setAttribute('aria-label', monthEvent.title);
                  chip.addEventListener('click', clickEvent => {
                    clickEvent.preventDefault();
                    if (clickEvent.currentTarget instanceof HTMLElement) {
                      clickEvent.currentTarget.blur();
                    }
                    openCalendarEvent(monthEvent);
                  });
                }
                applyCalendarCategoryClass(chip, monthEvent.category);
                applyCalendarCategoryClass(dot, monthEvent.category);
                if (eventsContainer) {
                  eventsContainer.appendChild(eventFragment);
                }
              }
              dayEventIndex += 1;
            }
          }

          gridNodes.push(fragment);
        }
        cellIndex += 1;
      }

      if (monthEvents.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'calendar-note calendar-month-empty';
        empty.textContent = t.calendar_month_empty || t.calendar_empty;
        gridNodes.push(empty);
      }
      grid.replaceChildren(...gridNodes);
    }

    /**
     * Keeps the shared calendar view stack at the height of the larger view.
     * This prevents page reflow when switching between list and month mode.
     * @returns {void}
     */
    function syncCalendarViewStackHeight(){
      const stack = document.getElementById('calendarViewStack');
      const timeline = document.getElementById('calendarTimeline');
      const monthView = document.getElementById('calendarMonthView');
      if (!stack || !timeline || !monthView) {
        return;
      }

      const previousTimelineActive = timeline.classList.contains('is-active');
      const previousMonthActive = monthView.classList.contains('is-active');

      timeline.classList.add('is-active');
      monthView.classList.add('is-active');

      const timelineHeight = timeline.scrollHeight;
      const monthHeight = monthView.scrollHeight;
      const stackHeight = Math.max(timelineHeight, monthHeight, 100);
      stack.style.height = stackHeight + 'px';

      if (!previousTimelineActive) {
        timeline.classList.remove('is-active');
      }
      if (!previousMonthActive) {
        monthView.classList.remove('is-active');
      }
    }

    /**
     * Applies the current view mode without rebuilding the card.
     * @param {Array<object>} visibleEvents Events visible for the active filter.
     * @returns {void}
     */
    function updateCalendarViewVisibility(visibleEvents){
      const timeline = document.getElementById('calendarTimeline');
      const monthView = document.getElementById('calendarMonthView');
      const showAllButton = document.getElementById('btnCalendarShowAll');
      const calendarCard = document.getElementById('skyCalendarCard');
      if (!timeline || !monthView || !showAllButton || !calendarCard) {
        return;
      }

      const calendarState = getState();
      if (calendarState.view === 'month') {
        timeline.classList.remove('is-active');
        monthView.classList.add('is-active');
        monthView.setAttribute('aria-hidden', 'false');
        timeline.setAttribute('aria-hidden', 'true');
        showAllButton.hidden = true;
      } else {
        timeline.classList.add('is-active');
        monthView.classList.remove('is-active');
        monthView.setAttribute('aria-hidden', 'true');
        timeline.setAttribute('aria-hidden', 'false');
        if (visibleEvents.length <= compactCalendarListLimit) {
          showAllButton.hidden = true;
        } else {
          showAllButton.hidden = false;
        }
        if (calendarState.showAll) {
          showAllButton.textContent = t.calendar_show_less;
        } else {
          showAllButton.textContent = t.calendar_show_all;
        }
      }

      syncCalendarViewStackHeight();
      requestMasonryLayout();
    }

    /**
     * Updates the active state of filter and view buttons.
     * @returns {void}
     */
    function updateCalendarButtonStates(){
      const calendarState = getState();
      document.querySelectorAll('[data-calendar-filter]').forEach(button => {
        if (button.dataset.calendarFilter === calendarState.filter) {
          button.classList.add('active');
          button.setAttribute('aria-pressed', 'true');
        } else {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        }
      });

      document.querySelectorAll('[data-calendar-view]').forEach(button => {
        if (button.dataset.calendarView === calendarState.view) {
          button.classList.add('active');
          button.setAttribute('aria-pressed', 'true');
        } else {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        }
      });
    }

    /**
     * Renders the complete sky-calendar card for the current filter and view mode.
     * @returns {void}
     */
    function renderCalendar(){
      const timeline = document.getElementById('calendarTimeline');
      const monthView = document.getElementById('calendarMonthView');
      const nextLabel = document.getElementById('calendarNext');
      if (!timeline || !monthView || !nextLabel) {
        return;
      }

      const visibleEvents = filteredCalendarEvents();
      const nextEvent = nextCalendarEvent();
      const currentSelection = getSelectedEvent(visibleEvents);

      if (nextEvent) {
        nextLabel.textContent = (t.calendar_next_event || 'Next event') + ': ' + fmtDateOnly(nextEvent.dateObj) + ' - ' + nextEvent.title;
      } else {
        nextLabel.textContent = (t.calendar_next_event || 'Next event') + ': -';
      }

      renderCalendarDownloads();
      updateCalendarButtonStates();
      renderCalendarTimeline(visibleEvents);
      renderCalendarMonthView(visibleEvents);
      renderCalendarDetail(currentSelection);
      updateCalendarViewVisibility(visibleEvents);
    }


    return Object.freeze({
      getState,
      getVisibleEvents,
      getNextEvent,
      getSelectedEvent,
      setFilter,
      setView,
      toggleShowAll,
      openEvent,
      closeEvent,
      wire,
      render:renderCalendar,
      renderDetail:renderCalendarDetail,
      renderDownloads:renderCalendarDownloads,
      downloadEventIcs:downloadCalendarEventIcs
    });
  }

  root.PLANETENUHR_CALENDAR = Object.freeze({create});
})(window);
