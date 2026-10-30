window.PLANETENUHR_MOON_NODES_CARD = (() => {
  'use strict';

  /** Creates the Moon-nodes card and its shared lunar-direction helpers.
   * @param {object} dependencies DOM, language, astronomy and display helpers.
   * @returns {object} Card renderer and Moon-direction functions for other cards.
   */
  function create(dependencies){
    const document = dependencies.document;
    const window = dependencies.window;
    const t = dependencies.getTranslations();
    const lang = dependencies.getLanguage();
    const eclipsePhaseConfig = dependencies.getEclipsePhases();
    const eclipseSeasonCycleDays = window.PLANETENUHR_ECLIPSE_MODEL.eclipseSeasonCycleDays;
    const eclipseSeasonHalfWindowDays = window.PLANETENUHR_ECLIPSE_MODEL.eclipseSeasonHalfWindowDays;
    const localizedEclipseCalendarTitle = dependencies.localizedEclipseCalendarTitle;

    /** Calculates visibility for a date at the selected location.
     * @param {Date} date Observation date.
     * @param {object} location Selected location.
     * @returns {object|null} Visibility record or null.
     */
    function eclipseVisibilityForLocation(date, location){
      return dependencies.getEclipseVisibility(date, location);
    }

    /** Gets the localized visibility label for a known status.
     * @param {string} statusKey Visibility status key.
     * @returns {string} Localized status label.
     */
    function eclipseVisibilityStatusLabel(statusKey){
      return dependencies.getVisibilityLabel(statusKey);
    }

    /** Gets the localized city label for an eclipse event.
     * @param {object} entry Curated event data.
     * @returns {string} Localized event title.
     */
    function eclipseVisibilityEventTitle(entry){
      if (!entry) {
        return t.calendar_filter_eclipse || 'Eclipses';
      }
      if (entry.kind && entry.type && typeof localizedEclipseCalendarTitle === 'function') {
        return localizedEclipseCalendarTitle(entry.kind, entry.type, lang);
      }
      if (entry.title && entry.title[lang]) {
        return entry.title[lang];
      }
      if (entry.title && entry.title.en) {
        return entry.title.en;
      }
      return t.calendar_filter_eclipse || 'Eclipses';
    }

    /** Formats a date using the dashboard's localized display convention.
     * @param {Date} date Date to display.
     * @returns {string} Localized date.
     */
    function formatDateStamp(date){
      return dependencies.formatDate(date);
    }

    /** Formats a time using the dashboard's selected display convention.
     * @param {Date} date Instant to display.
     * @returns {string} Localized time.
     */
    function fmtTimeOnly(date){
      return dependencies.formatTime(date);
    }

    /** Gets the existing geocentric longitude estimate for one body.
     * @param {string} key Body identifier.
     * @param {Date} date Observation date.
     * @returns {number} Ecliptic longitude in degrees.
     */
    function bodyEclipticLongitude(key, date){
      return dependencies.getEclipticLongitude(key, date);
    }

    /** Converts azimuth to the app's localized compass abbreviation.
     * @param {number} azimuthDeg Azimuth clockwise from north.
     * @returns {string} Compass abbreviation.
     */
    function compassLabelForAzimuth(azimuthDeg){
      return dependencies.compassLabelForAzimuth(azimuthDeg);
    }

    /** Converts altitude to the app's arm-length estimate.
     * @param {number} altitudeDeg Altitude above the horizon.
     * @returns {string} Localized hand-width estimate or empty text.
     */
    function altitudeThumbEstimate(altitudeDeg){
      return dependencies.altitudeThumbEstimate(altitudeDeg);
    }

    /** Appends plain summary text through the shared template helper.
     * @param {Element} target Destination element.
     * @param {string} text Plain text.
     * @returns {void} No value.
     */
    function appendSummaryText(target, text){
      dependencies.appendSummaryText(target, text);
    }

    /** Appends a labeled summary row through the shared template helper.
     * @param {Element} target Destination element.
     * @param {string} label Localized row label.
     * @param {string} value Value text.
     * @returns {void} No value.
     */
    function appendSummaryLine(target, label, value){
      dependencies.appendSummaryLine(target, label, value);
    }

    /** Clones one existing card template by identifier.
     * @param {string} templateId Template element identifier.
     * @returns {DocumentFragment|null} Cloned template or null.
     */
    function cloneTemplate(templateId){
      return dependencies.cloneTemplate(templateId);
    }

    /**
     * Returns approximate equatorial coordinates for the Moon.
     * The Moon longitude follows the existing phase-based dashboard model, while
     * the latitude follows the draconic node cycle so eclipse previews can show
     * a plausible sky direction without claiming observatory precision.
     * @param {Date} date Instant to evaluate.
     * @returns {{rightAscensionDeg:number, declinationDeg:number}} Approximate lunar coordinates.
     */
    function moonEquatorialCoordinates(date){
      const eclipticLongitude = bodyEclipticLongitude('moon', date);
      const nodeState = window.PLANETENUHR_ECLIPSE_MODEL.moonNodeDistance(date);
      const eclipticLatitude = 5.145 * Math.sin(nodeState.phase * Math.PI * 2);
      return window.PLANETENUHR_COORDINATES.eclipticToEquatorial(eclipticLongitude, eclipticLatitude, date);
    }

    /**
     * Builds the compass and altitude guidance for one eclipse preview row.
     * @param {object} preview Preview payload from `upcomingLocalEclipsePreview`.
     * @param {object} location Selected location object.
     * @param {object} row One normalized preview row.
     * @returns {object|null} Compass payload, or null when the row has no time-based sky position.
     */
    function eclipsePreviewLookDirection(preview, location, row){
      if (!preview || !location || !row || !row.time) {
        return null;
      }
      const phaseDate = window.PLANETENUHR_ECLIPSE_LOCATION.eclipsePhaseLocalDate(preview.eventDate, location, row.time);
      if (!phaseDate) {
        return null;
      }

      let equatorial = null;
      if (preview.phaseEntry.kind === 'solar' || row.kind === 'sunset') {
        equatorial = window.PLANETENUHR_SOLAR_VISIBILITY.solarEquatorialCoordinates(phaseDate);
      } else {
        equatorial = moonEquatorialCoordinates(phaseDate);
      }
      const horizontal = window.PLANETENUHR_COORDINATES.horizontalCoordinates(phaseDate, location, equatorial);
      if (!Number.isFinite(horizontal.azimuthDeg) || !Number.isFinite(horizontal.altitudeDeg)) {
        return null;
      }
      const directionLabel = compassLabelForAzimuth(horizontal.azimuthDeg);
      if (!directionLabel) {
        return null;
      }
      let altitudeText = Math.abs(horizontal.altitudeDeg).toFixed(1) + '°';
      const thumbEstimate = altitudeThumbEstimate(horizontal.altitudeDeg);
      if (horizontal.altitudeDeg >= 0) {
        altitudeText += ' ' + (t.eclipse_preview_above_horizon || 'above horizon');
        if (thumbEstimate) {
          altitudeText += ' · ' + thumbEstimate;
        }
      } else {
        altitudeText += ' ' + (t.eclipse_preview_below_horizon || 'below horizon');
      }
      return {
        azimuthDeg: horizontal.azimuthDeg,
        altitudeDeg: horizontal.altitudeDeg,
        directionLabel,
        mainText: directionLabel + ' · ' + horizontal.azimuthDeg.toFixed(0) + '°',
        subText: altitudeText
      };
    }

    /**
     * Returns the approximate Moon direction for the selected place and date.
     * The dashboard reuses the same Moon-coordinate approximation as the eclipse
     * preview so the wording stays consistent across cards.
     * @param {Date} date Selected dashboard date.
     * @param {object} location Selected location object.
     * @returns {object|null} Local Moon direction payload, or null when unavailable.
     */
    function moonLookDirectionForDate(date, location){
      if (!date || !location) {
        return null;
      }
      const equatorial = moonEquatorialCoordinates(date);
      const horizontal = window.PLANETENUHR_COORDINATES.horizontalCoordinates(date, location, equatorial);
      if (!Number.isFinite(horizontal.azimuthDeg) || !Number.isFinite(horizontal.altitudeDeg)) {
        return null;
      }
      const directionLabel = compassLabelForAzimuth(horizontal.azimuthDeg);
      if (!directionLabel) {
        return null;
      }
      let altitudeText = Math.abs(horizontal.altitudeDeg).toFixed(1) + '°';
      const thumbEstimate = altitudeThumbEstimate(horizontal.altitudeDeg);
      if (horizontal.altitudeDeg >= 0) {
        altitudeText += ' ' + (t.eclipse_preview_above_horizon || 'above horizon');
        if (thumbEstimate) {
          altitudeText += ' · ' + thumbEstimate;
        }
      } else {
        altitudeText += ' ' + (t.eclipse_preview_below_horizon || 'below horizon');
      }
      return {
        directionLabel,
        azimuthDeg: horizontal.azimuthDeg,
        altitudeText
      };
    }

    /**
     * Returns the reference timestamp for the Moon direction display.
     * On normal days the Moon card follows the currently selected date and time.
     * On a local eclipse day the card switches to the most meaningful eclipse
     * phase time so the Moon direction matches the eclipse preview wording.
     * @param {Date} date Currently selected dashboard date.
     * @param {object} location Selected location object.
     * @returns {Date} Reference timestamp for the local Moon direction display.
     */
    function moonDirectionReferenceDate(date, location){
      if (!date || !location) {
        return date;
      }

      const preview = upcomingLocalEclipsePreview(date, location);
      if (!preview || !preview.eventDate) {
        return date;
      }

      if (window.PLANETENUHR_DATE_TIME.formatDateKey(preview.eventDate) !== window.PLANETENUHR_DATE_TIME.formatDateKey(date)) {
        return date;
      }

      let bestPhaseDate = null;
      let index = 0;
      while (index < preview.phases.length) {
        const phase = preview.phases[index];
        if (phase.kind === 'maximum' && phase.time) {
          bestPhaseDate = window.PLANETENUHR_ECLIPSE_LOCATION.eclipsePhaseLocalDate(preview.eventDate, location, phase.time);
          break;
        }
        index += 1;
      }

      if (bestPhaseDate) {
        return bestPhaseDate;
      }

      index = 0;
      while (index < preview.phases.length) {
        const phase = preview.phases[index];
        if (phase.time) {
          bestPhaseDate = window.PLANETENUHR_ECLIPSE_LOCATION.eclipsePhaseLocalDate(preview.eventDate, location, phase.time);
          if (bestPhaseDate) {
            return bestPhaseDate;
          }
        }
        index += 1;
      }

      return date;
    }

    /**
     * Returns the localized label for the Moon direction block.
     * Normal days use the currently selected date at the current clock time.
     * Local eclipse days switch to the eclipse phase time so the label should
     * say that explicitly.
     * @param {Date} date Currently selected dashboard date.
     * @param {object} location Selected location object.
     * @returns {string} Localized label for the Moon direction block.
     */
    function moonDirectionLabel(date, location){
      if (!date || !location) {
        return t.moon_here_current_time || t.moon_here || 'Moon here at this time';
      }

      const preview = upcomingLocalEclipsePreview(date, location);
      if (!preview || !preview.eventDate) {
        return t.moon_here_current_time || t.moon_here || 'Moon here at this time';
      }

      if (window.PLANETENUHR_DATE_TIME.formatDateKey(preview.eventDate) !== window.PLANETENUHR_DATE_TIME.formatDateKey(date)) {
        return t.moon_here_current_time || t.moon_here || 'Moon here at this time';
      }

      return t.moon_here_eclipse_time || t.moon_here || 'Moon here at eclipse time';
    }

    /**
     * Finds the next curated local eclipse preview within ten calendar days.
     * @param {Date} date Currently selected dashboard date.
     * @param {object} location Selected location object.
     * @returns {object|null} Preview payload or null when no nearby local event applies.
     */
    function upcomingLocalEclipsePreview(date, location){
      let bestPreview = null;
      let index = 0;

      while (index < eclipsePhaseConfig.length) {
        const phaseEntry = eclipsePhaseConfig[index];
        const eventDate = window.PLANETENUHR_DATE_TIME.parseLocalDateKey(phaseEntry.date);
        if (eventDate) {
          const daysUntil = window.PLANETENUHR_DATE_TIME.calendarDayDifference(date, eventDate);
          if (daysUntil >= 0 && daysUntil <= 10) {
            const visibility = eclipseVisibilityForLocation(eventDate, location);
            if (visibility && window.PLANETENUHR_ECLIPSE_LOCATION.eclipseVisibilityIsPreviewable(visibility.status)) {
              const phases = window.PLANETENUHR_ECLIPSE_LOCATION.eclipsePhasesForLocationProfile(phaseEntry, location);
              if (phases.length) {
                if (!bestPreview || daysUntil < bestPreview.daysUntil) {
                  bestPreview = {
                    phaseEntry,
                    eventDate,
                    daysUntil,
                    visibility,
                    phases
                  };
                }
              }
            }
          }
        }
        index += 1;
      }

      return bestPreview;
    }

    /**
     * Returns the localized label for one preview phase row.
     * @param {string} phaseKind Internal phase key.
     * @returns {string} Localized row label.
     */
    function eclipsePreviewPhaseLabel(phaseKind){
      if (phaseKind === 'partial_start') {
        return t.eclipse_preview_partial_start || 'Partial eclipse begins';
      }
      if (phaseKind === 'maximum') {
        return t.eclipse_preview_maximum || 'Maximum eclipse';
      }
      if (phaseKind === 'partial_end') {
        return t.eclipse_preview_partial_end || 'Partial eclipse ends';
      }
      if (phaseKind === 'penumbral_start') {
        return t.eclipse_preview_penumbral_start || 'Penumbral phase begins';
      }
      if (phaseKind === 'penumbral_end') {
        return t.eclipse_preview_penumbral_end || 'Penumbral phase ends';
      }
      if (phaseKind === 'sunset') {
        return t.eclipse_preview_sunset || 'Sunset';
      }
      return t.eclipse_preview_phase || 'Phase';
    }

    /**
     * Returns a short localized explanation for one preview phase row.
     * @param {string} phaseKind Internal phase key.
     * @param {string} eventKind Either `solar` or `lunar`.
     * @param {string} visibilityStatus Simplified local visibility status.
     * @returns {string} Localized descriptive sentence.
     */
    function eclipsePreviewPhaseText(phaseKind, eventKind, visibilityStatus){
      if (phaseKind === 'partial_start') {
        if (eventKind === 'solar') {
          return t.eclipse_preview_partial_start_solar_text || 'First contact: the Moon touches the edge of the Sun.';
        }
        return t.eclipse_preview_partial_start_lunar_text || 'The Moon begins to enter Earth’s dark shadow.';
      }
      if (phaseKind === 'maximum') {
        if (visibilityStatus === 'partial_low') {
          return t.eclipse_preview_maximum_low_text || 'Maximum occurs very low above the horizon.';
        }
        return t.eclipse_preview_maximum_text || 'The eclipse reaches its strongest visible phase here.';
      }
      if (phaseKind === 'partial_end') {
        if (eventKind === 'solar') {
          return t.eclipse_preview_partial_end_solar_text || 'Last contact: the Moon leaves the Sun’s disk again.';
        }
        return t.eclipse_preview_partial_end_lunar_text || 'The Moon leaves Earth’s dark shadow again.';
      }
      if (phaseKind === 'penumbral_start') {
        return t.eclipse_preview_penumbral_start_text || 'The Moon enters Earth’s penumbra.';
      }
      if (phaseKind === 'penumbral_end') {
        return t.eclipse_preview_penumbral_end_text || 'The Moon leaves Earth’s penumbra again.';
      }
      if (phaseKind === 'sunset') {
        return t.eclipse_preview_sunset_text || 'The Sun sets; any remaining solar eclipse phase is no longer visible.';
      }
      return '';
    }

    /**
     * Returns one small icon token for the preview phase timeline.
     * @param {string} phaseKind Internal phase key.
     * @param {string} eventKind Either `solar` or `lunar`.
     * @returns {string} CSS token for the phase icon.
     */
    function eclipsePreviewIconToken(phaseKind, eventKind){
      if (phaseKind === 'maximum') {
        if (eventKind === 'solar') {
          return 'maximum-solar';
        }
        return 'maximum-lunar';
      }
      if (phaseKind === 'partial_start') {
        if (eventKind === 'solar') {
          return 'partial-solar';
        }
        return 'partial-lunar';
      }
      if (phaseKind === 'partial_end') {
        if (eventKind === 'solar') {
          return 'partial-solar';
        }
        return 'partial-lunar';
      }
      if (phaseKind === 'penumbral_start' || phaseKind === 'penumbral_end') {
        return 'penumbral';
      }
      if (phaseKind === 'sunset') {
        return 'sunset';
      }
      return 'partial-solar';
    }

    /**
     * Builds the visible phase rows for the local ten-day eclipse preview.
     * Solar events automatically insert the local sunset when it happens during
     * the event window.
     * @param {object} preview Preview payload from `upcomingLocalEclipsePreview`.
     * @param {object} location Selected location object.
     * @returns {Array<object>} Normalized row items for rendering.
     */
    function eclipsePreviewRows(preview, location){
      const rows = [];
      let index = 0;

      while (index < preview.phases.length) {
        const phase = preview.phases[index];
        rows.push({
          kind: phase.kind,
          time: phase.time
        });
        index += 1;
      }

      if (preview.phaseEntry.kind === 'solar') {
        const sunset = window.PLANETENUHR_SOLAR_VISIBILITY.solarEventUtc(preview.eventDate, location.latitude, location.longitude, 90.833, false);
        if (sunset) {
          const sunsetText = fmtTimeOnly(sunset);
          const sunsetMinutes = window.PLANETENUHR_ECLIPSE_LOCATION.timeStringToMinutes(sunsetText);
          if (Number.isFinite(sunsetMinutes)) {
            let insertIndex = -1;
            let rowIndex = 0;
            while (rowIndex < rows.length) {
              const rowMinutes = window.PLANETENUHR_ECLIPSE_LOCATION.timeStringToMinutes(rows[rowIndex].time);
              if (Number.isFinite(rowMinutes) && sunsetMinutes < rowMinutes) {
                insertIndex = rowIndex;
                break;
              }
              rowIndex += 1;
            }
            if (insertIndex === -1) {
              let lastRowMinutes = Number.NaN;
              if (rows.length) {
                lastRowMinutes = window.PLANETENUHR_ECLIPSE_LOCATION.timeStringToMinutes(rows[rows.length - 1].time);
              }
              if (Number.isFinite(lastRowMinutes) && sunsetMinutes < lastRowMinutes) {
                insertIndex = rows.length - 1;
              }
            }
            if (insertIndex >= 0) {
              rows.splice(insertIndex, 0, {
                kind: 'sunset',
                time: sunsetText
              });
            }
          }
        }
      }

      let normalizedIndex = 0;
      while (normalizedIndex < rows.length) {
        rows[normalizedIndex].label = eclipsePreviewPhaseLabel(rows[normalizedIndex].kind);
        rows[normalizedIndex].text = eclipsePreviewPhaseText(
          rows[normalizedIndex].kind,
          preview.phaseEntry.kind,
          preview.visibility.status
        );
        rows[normalizedIndex].iconToken = eclipsePreviewIconToken(rows[normalizedIndex].kind, preview.phaseEntry.kind);
        rows[normalizedIndex].lookDirection = eclipsePreviewLookDirection(preview, location, rows[normalizedIndex]);
        normalizedIndex += 1;
      }

      return rows;
    }

    /**
     * Appends the local ten-day eclipse preparation timeline to the Moon-node
     * summary when a curated nearby event exists for the selected city.
     * @param {HTMLElement} summary Summary container inside the Moon-nodes card.
     * @param {Date} date Currently selected dashboard date.
     * @param {object} location Selected location object.
     * @returns {void}
     */
    function appendEclipsePreview(summary, date, location){
      if (!summary) {
        return;
      }

      const preview = upcomingLocalEclipsePreview(date, location);
      if (!preview) {
        return;
      }

      const fragment = cloneTemplate('eclipsePreviewTemplate');
      if (!fragment) {
        return;
      }

      const card = fragment.querySelector('.eclipse-preview-card');
      const kicker = fragment.querySelector('[data-eclipse-preview-kicker]');
      const title = fragment.querySelector('[data-eclipse-preview-title]');
      const meta = fragment.querySelector('[data-eclipse-preview-meta]');
      const warning = fragment.querySelector('[data-eclipse-preview-warning]');
      const warningTitle = fragment.querySelector('[data-eclipse-preview-warning-title]');
      const warningText = fragment.querySelector('[data-eclipse-preview-warning-text]');
      const timeline = fragment.querySelector('[data-eclipse-preview-timeline]');
      const note = fragment.querySelector('[data-eclipse-preview-note]');

      if (!card || !timeline) {
        return;
      }

      const rows = eclipsePreviewRows(preview, location);
      let rowIndex = 0;
      while (rowIndex < rows.length) {
        const rowData = rows[rowIndex];
        const rowFragment = cloneTemplate('eclipsePreviewRowTemplate');
        if (rowFragment) {
          const line = rowFragment.querySelector('[data-eclipse-preview-line]');
          const icon = rowFragment.querySelector('[data-eclipse-preview-icon]');
          const time = rowFragment.querySelector('[data-eclipse-preview-time]');
          const direction = rowFragment.querySelector('[data-eclipse-preview-direction]');
          const compassArrow = rowFragment.querySelector('[data-eclipse-preview-compass-arrow]');
          const directionMain = rowFragment.querySelector('[data-eclipse-preview-direction-main]');
          const directionSub = rowFragment.querySelector('[data-eclipse-preview-direction-sub]');
          const label = rowFragment.querySelector('[data-eclipse-preview-label]');
          const text = rowFragment.querySelector('[data-eclipse-preview-text]');

          if (line && rowIndex === rows.length - 1) {
            line.classList.add('is-last');
          }
          if (icon) {
            icon.classList.add('is-' + rowData.iconToken);
          }
          if (time) {
            time.textContent = rowData.time;
          }
          if (rowData.lookDirection) {
            if (direction) {
              direction.hidden = false;
            }
            if (compassArrow) {
              compassArrow.style.transform = 'translate(-50%, -100%) rotate(' + rowData.lookDirection.azimuthDeg.toFixed(1) + 'deg)';
            }
            if (directionMain) {
              directionMain.textContent = rowData.lookDirection.mainText;
            }
            if (directionSub) {
              directionSub.textContent = rowData.lookDirection.subText;
            }
          } else if (direction) {
            direction.hidden = true;
          }
          if (label) {
            label.textContent = rowData.label;
          }
          if (text) {
            text.textContent = rowData.text;
          }
          timeline.appendChild(rowFragment);
        }
        rowIndex += 1;
      }

      if (kicker) {
        if (preview.daysUntil === 0) {
          kicker.textContent = t.eclipse_preview_today || 'Today';
        } else {
          let dayUnit = t.eclipse_preview_days || 'days';
          if (preview.daysUntil === 1) {
            dayUnit = t.eclipse_preview_day_singular || 'day';
          }
          kicker.textContent = (t.eclipse_preview_in_days || 'In') + ' ' + preview.daysUntil + ' ' + dayUnit;
        }
      }
      if (title) {
        title.textContent = eclipseVisibilityEventTitle(preview.visibility.entry);
      }
      if (meta) {
        meta.textContent = location.name + ' · ' + formatDateStamp(preview.eventDate) + ' · ' + eclipseVisibilityStatusLabel(preview.visibility.status);
      }
      let warningTitleText = '';
      let warningBodyText = '';
      if (preview.phaseEntry.kind === 'solar') {
        warningTitleText = t.eclipse_preview_warning_title || 'Protect your eyes!';
        warningBodyText = t.eclipse_preview_warning_text || 'Never look at the Sun without proper eye protection. Permanent damage can result. The same applies to cameras and phones.';
      } else {
        warningTitleText = t.eclipse_preview_lunar_note_title || 'Safe to watch';
        warningBodyText = t.eclipse_preview_lunar_note_text || 'A lunar eclipse can be observed safely with the naked eye. Binoculars or a telephoto lens can make color and shadow details easier to see.';
      }
      if (warning) {
        warning.hidden = false;
      }
      if (warningTitle) {
        warningTitle.textContent = warningTitleText;
      }
      if (warningText) {
        warningText.textContent = warningBodyText;
      }
      if (note) {
        note.textContent = t.eclipse_preview_note || 'Preparation view: local phase times are curated profile values for the selected city group and may differ by several minutes from a full eclipse calculator.';
      }

      summary.appendChild(fragment);
    }

    /**
     * Renders the Moon-node and eclipse-season explainer card.
     * The drawing combines a repeating eclipse-season model, approximate lunar
     * phase, and node distance. It is an educational sketch, not a local eclipse
     * simulator. When a curated eclipse event exists for the exact date, the
     * summary also includes a simplified city-based visibility statement.
     * @param {object} context Selected date and location.
     * @returns {void}
     */
    function render(context){
      const date = context.date;
      const location = context.location;
      const target = document.getElementById('moonNodesMap');
      const summary = document.getElementById('moonNodesSummary');
      if (!target) return;
      const localVisibility = eclipseVisibilityForLocation(date, location);
      const node = window.PLANETENUHR_ECLIPSE_MODEL.moonNodeDistance(date);
      const season = window.PLANETENUHR_ECLIPSE_MODEL.eclipseSeasonInfo(date);
      const moon = window.PLANETENUHR_MOON_MODEL.computeMoon(date);
      const nearNew = Math.min(moon.frac, 1 - moon.frac);
      const nearFull = Math.abs(moon.frac - 0.5);
      const isSolarCase = nearNew <= nearFull;
      const phaseNear = Math.min(nearNew, nearFull);
      const nodeNear = node.distanceDays <= 4.5;
      const phaseAligned = phaseNear <= 0.08;
      const eclipseNear = node.distanceDays <= 1.8 && phaseNear <= 0.035;
      const canEclipse = nodeNear && phaseAligned;
      let geometryMessage = t.moon_nodes_not_aligned || 'Usually no eclipse: the Moon passes above or below the line';
      if (eclipseNear) {
        if (isSolarCase) {
          geometryMessage = t.moon_nodes_geometry_exact_solar || 'Very close to solar-eclipse geometry today.';
        } else {
          geometryMessage = t.moon_nodes_geometry_exact_lunar || 'Very close to lunar-eclipse geometry today.';
        }
      } else if (canEclipse) {
        if (isSolarCase) {
          geometryMessage = t.moon_nodes_geometry_near_solar || 'Solar-eclipse geometry is near: new moon and node proximity line up closely.';
        } else {
          geometryMessage = t.moon_nodes_geometry_near_lunar || 'Lunar-eclipse geometry is near: full moon and node proximity line up closely.';
        }
      } else if (season.active) {
        geometryMessage = t.moon_nodes_geometry_season_only || 'Eclipse season is active, but today the Moon is not aligned closely enough for an eclipse.';
      }
      let statusClass = '';
      if (eclipseNear) {
        statusClass = ' exact';
      } else if (canEclipse) {
        statusClass = ' near';
      } else if (season.active) {
        statusClass = ' active';
      }
      const size = 560;
      const height = 310;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${size} ${height}`);

      const seasonLabel = document.createElementNS(svgNS, 'text');
      seasonLabel.setAttribute('x', size / 2);
      seasonLabel.setAttribute('y', 28);
      seasonLabel.setAttribute('class', 'moon-nodes-season-label');
      seasonLabel.textContent = t.moon_nodes_season_track || 'Eclipse season';
      svg.appendChild(seasonLabel);

      const seasonTrack = document.createElementNS(svgNS, 'line');
      seasonTrack.setAttribute('x1', 72);
      seasonTrack.setAttribute('y1', 44);
      seasonTrack.setAttribute('x2', size - 72);
      seasonTrack.setAttribute('y2', 44);
      seasonTrack.setAttribute('stroke', '#e2e8f0');
      seasonTrack.setAttribute('stroke-width', '14');
      seasonTrack.setAttribute('stroke-linecap', 'round');
      svg.appendChild(seasonTrack);

      const seasonHalfFraction = eclipseSeasonHalfWindowDays / eclipseSeasonCycleDays;
      const seasonCenterRatio = season.phase / eclipseSeasonCycleDays;
      const activeStart = Math.max(0, seasonCenterRatio - seasonHalfFraction);
      const activeEnd = Math.min(1, seasonCenterRatio + seasonHalfFraction);
      const activeTrack = document.createElementNS(svgNS, 'line');
      activeTrack.setAttribute('x1', 72 + activeStart * (size - 144));
      activeTrack.setAttribute('y1', 44);
      activeTrack.setAttribute('x2', 72 + activeEnd * (size - 144));
      activeTrack.setAttribute('y2', 44);
      activeTrack.setAttribute('stroke', '#93c5fd');
      activeTrack.setAttribute('stroke-width', '14');
      activeTrack.setAttribute('stroke-linecap', 'round');
      svg.appendChild(activeTrack);

      const seasonDot = document.createElementNS(svgNS, 'circle');
      seasonDot.setAttribute('cx', 72 + seasonCenterRatio * (size - 144));
      seasonDot.setAttribute('cy', 44);
      seasonDot.setAttribute('r', 7);
      let seasonDotFill = '#64748b';
      if (season.active) {
        seasonDotFill = '#2563eb';
      }
      seasonDot.setAttribute('fill', seasonDotFill);
      seasonDot.setAttribute('stroke', '#fff');
      seasonDot.setAttribute('stroke-width', '2');
      svg.appendChild(seasonDot);

      const leftPanel = document.createElementNS(svgNS, 'rect');
      leftPanel.setAttribute('x', 24);
      leftPanel.setAttribute('y', 76);
      leftPanel.setAttribute('width', 244);
      leftPanel.setAttribute('height', 172);
      leftPanel.setAttribute('rx', 18);
      leftPanel.setAttribute('class', 'moon-nodes-panel');
      svg.appendChild(leftPanel);

      const rightPanel = document.createElementNS(svgNS, 'rect');
      rightPanel.setAttribute('x', 292);
      rightPanel.setAttribute('y', 76);
      rightPanel.setAttribute('width', 244);
      rightPanel.setAttribute('height', 172);
      rightPanel.setAttribute('rx', 18);
      rightPanel.setAttribute('class', 'moon-nodes-panel');
      svg.appendChild(rightPanel);

      const leftTitle = document.createElementNS(svgNS, 'text');
      leftTitle.setAttribute('x', 146);
      leftTitle.setAttribute('y', 98);
      leftTitle.setAttribute('class', 'moon-nodes-panel-title');
      leftTitle.textContent = t.moon_nodes_top_view || 'Top view';
      svg.appendChild(leftTitle);

      const rightTitle = document.createElementNS(svgNS, 'text');
      rightTitle.setAttribute('x', 414);
      rightTitle.setAttribute('y', 98);
      rightTitle.setAttribute('class', 'moon-nodes-panel-title');
      rightTitle.textContent = t.moon_nodes_side_view || 'Side view';
      svg.appendChild(rightTitle);

      const leftCaption = document.createElementNS(svgNS, 'text');
      leftCaption.setAttribute('x', 146);
      leftCaption.setAttribute('y', 230);
      leftCaption.setAttribute('class', 'moon-nodes-caption');
      leftCaption.textContent = t.moon_nodes_top_caption || 'Sun, Earth and Moon line';
      svg.appendChild(leftCaption);

      const rightCaption = document.createElementNS(svgNS, 'text');
      rightCaption.setAttribute('x', 414);
      rightCaption.setAttribute('y', 230);
      rightCaption.setAttribute('class', 'moon-nodes-caption');
      rightCaption.textContent = t.moon_nodes_side_caption || 'Tilted lunar orbit crossing the ecliptic';
      svg.appendChild(rightCaption);

      const leftSunX = 64;
      const leftEarthX = 148;
      const leftY = 160;
      const leftOrbitRx = 66;
      const leftOrbitRy = 28;
      const leftOrbitRotation = -23 * Math.PI / 180;

      const topSun = document.createElementNS(svgNS, 'circle');
      topSun.setAttribute('cx', leftSunX);
      topSun.setAttribute('cy', leftY);
      topSun.setAttribute('r', 16);
      topSun.setAttribute('fill', '#fbbf24');
      topSun.setAttribute('stroke', '#f59e0b');
      topSun.setAttribute('stroke-width', '2');
      svg.appendChild(topSun);

      for (let ray = -3; ray <= 3; ray++) {
        const rayLine = document.createElementNS(svgNS, 'line');
        const ry = leftY + ray * 12;
        rayLine.setAttribute('x1', leftSunX + 20);
        rayLine.setAttribute('y1', ry);
        rayLine.setAttribute('x2', leftEarthX - 18);
        rayLine.setAttribute('y2', ry);
        let rayStroke = '#fde68a';
        let rayStrokeWidth = '1.6';
        if (ray === 0) {
          rayStroke = '#f59e0b';
          rayStrokeWidth = '2.4';
        }
        rayLine.setAttribute('stroke', rayStroke);
        rayLine.setAttribute('stroke-width', rayStrokeWidth);
        rayLine.setAttribute('stroke-linecap', 'round');
        svg.appendChild(rayLine);
      }

      const topLine = document.createElementNS(svgNS, 'line');
      topLine.setAttribute('x1', leftSunX + 12);
      topLine.setAttribute('y1', leftY);
      topLine.setAttribute('x2', 250);
      topLine.setAttribute('y2', leftY);
      topLine.setAttribute('stroke', '#cbd5e1');
      topLine.setAttribute('stroke-width', '2');
      svg.appendChild(topLine);

      const topOrbit = document.createElementNS(svgNS, 'ellipse');
      topOrbit.setAttribute('cx', leftEarthX);
      topOrbit.setAttribute('cy', leftY);
      topOrbit.setAttribute('rx', leftOrbitRx);
      topOrbit.setAttribute('ry', leftOrbitRy);
      topOrbit.setAttribute('fill', 'none');
      topOrbit.setAttribute('stroke', '#60a5fa');
      topOrbit.setAttribute('stroke-width', '2');
      topOrbit.setAttribute('stroke-dasharray', '5 5');
      topOrbit.setAttribute('transform', `rotate(-23 ${leftEarthX} ${leftY})`);
      svg.appendChild(topOrbit);

      const topEarth = document.createElementNS(svgNS, 'circle');
      topEarth.setAttribute('cx', leftEarthX);
      topEarth.setAttribute('cy', leftY);
      topEarth.setAttribute('r', 16);
      topEarth.setAttribute('fill', '#2586d7');
      svg.appendChild(topEarth);

      const leftNode = { x:leftEarthX - leftOrbitRx * Math.cos(leftOrbitRotation), y:leftY - leftOrbitRx * Math.sin(leftOrbitRotation) };
      const rightNode = { x:leftEarthX + leftOrbitRx * Math.cos(leftOrbitRotation), y:leftY + leftOrbitRx * Math.sin(leftOrbitRotation) };
      [leftNode, rightNode].forEach((point, index) => {
        const nodeMarker = document.createElementNS(svgNS, 'circle');
        nodeMarker.setAttribute('cx', point.x);
        nodeMarker.setAttribute('cy', point.y);
        nodeMarker.setAttribute('r', 4.8);
        let nodeFill = '#1d4ed8';
        if (index === 0) {
          nodeFill = '#0ea5e9';
        }
        nodeMarker.setAttribute('fill', nodeFill);
        svg.appendChild(nodeMarker);
      });

      const phaseAngle = moon.frac * Math.PI * 2 + Math.PI;
      const localMoonX = leftOrbitRx * Math.cos(phaseAngle);
      const localMoonY = leftOrbitRy * Math.sin(phaseAngle);
      const topMoonX = leftEarthX + localMoonX * Math.cos(leftOrbitRotation) - localMoonY * Math.sin(leftOrbitRotation);
      const topMoonY = leftY + localMoonX * Math.sin(leftOrbitRotation) + localMoonY * Math.cos(leftOrbitRotation);
      const topMoon = document.createElementNS(svgNS, 'circle');
      topMoon.setAttribute('cx', topMoonX);
      topMoon.setAttribute('cy', topMoonY);
      topMoon.setAttribute('r', 8.5);
      topMoon.setAttribute('fill', '#f8c84b');
      topMoon.setAttribute('stroke', '#fff');
      topMoon.setAttribute('stroke-width', '2');
      svg.appendChild(topMoon);

      const sideBaseY = 160;
      const sideLeftX = 314;
      const sideRightX = 514;
      const sideEarthX = 414;
      const sidePhaseRadius = 82;
      const sideMoonX = sideEarthX + Math.cos(phaseAngle) * sidePhaseRadius;
      const sideMoonY = sideBaseY - Math.sin(node.phase * Math.PI * 2) * 34;
      let shadowLeft = sideEarthX + 2;
      if (isSolarCase) {
        shadowLeft = sideEarthX - 74;
      }

      const nodeZone = document.createElementNS(svgNS, 'rect');
      nodeZone.setAttribute('x', shadowLeft);
      nodeZone.setAttribute('y', 112);
      nodeZone.setAttribute('width', 72);
      nodeZone.setAttribute('height', 96);
      nodeZone.setAttribute('rx', 10);
      let nodeZoneFill = 'rgba(147,197,253,.16)';
      let nodeZoneStroke = '#bfdbfe';
      if (isSolarCase) {
        nodeZoneFill = 'rgba(251,191,36,.12)';
        nodeZoneStroke = '#fcd34d';
      }
      nodeZone.setAttribute('fill', nodeZoneFill);
      nodeZone.setAttribute('stroke', nodeZoneStroke);
      nodeZone.setAttribute('stroke-dasharray', '4 5');
      svg.appendChild(nodeZone);

      const shadowLabel = document.createElementNS(svgNS, 'text');
      shadowLabel.setAttribute('x', shadowLeft + 36);
      shadowLabel.setAttribute('y', 106);
      shadowLabel.setAttribute('class', 'moon-nodes-caption');
      if (isSolarCase) {
        shadowLabel.textContent = t.moon_nodes_shadow_moon || 'Moon shadow zone';
      } else {
        shadowLabel.textContent = t.moon_nodes_shadow_earth || 'Earth shadow';
      }
      svg.appendChild(shadowLabel);

      const sideSun = document.createElementNS(svgNS, 'circle');
      sideSun.setAttribute('cx', sideLeftX);
      sideSun.setAttribute('cy', sideBaseY);
      sideSun.setAttribute('r', 16);
      sideSun.setAttribute('fill', '#fbbf24');
      sideSun.setAttribute('stroke', '#f59e0b');
      sideSun.setAttribute('stroke-width', '2');
      svg.appendChild(sideSun);

      [-22, 0, 22].forEach(offset => {
        const ray = document.createElementNS(svgNS, 'line');
        ray.setAttribute('x1', sideLeftX + 16);
        ray.setAttribute('y1', sideBaseY + offset);
        ray.setAttribute('x2', sideEarthX - 18);
        ray.setAttribute('y2', sideBaseY + offset);
        let rayStroke = '#fde68a';
        let rayStrokeWidth = '1.5';
        if (offset === 0) {
          rayStroke = '#f59e0b';
          rayStrokeWidth = '2.2';
        }
        ray.setAttribute('stroke', rayStroke);
        ray.setAttribute('stroke-width', rayStrokeWidth);
        ray.setAttribute('stroke-linecap', 'round');
        svg.appendChild(ray);
      });

      const sideEcliptic = document.createElementNS(svgNS, 'line');
      sideEcliptic.setAttribute('x1', sideLeftX);
      sideEcliptic.setAttribute('y1', sideBaseY);
      sideEcliptic.setAttribute('x2', sideRightX);
      sideEcliptic.setAttribute('y2', sideBaseY);
      sideEcliptic.setAttribute('stroke', '#cbd5e1');
      sideEcliptic.setAttribute('stroke-width', '2');
      svg.appendChild(sideEcliptic);

      const sideOrbit = document.createElementNS(svgNS, 'path');
      sideOrbit.setAttribute('d', `M ${sideLeftX} ${sideBaseY} C ${sideLeftX + 40} ${sideBaseY - 42}, ${sideEarthX - 44} ${sideBaseY - 42}, ${sideEarthX} ${sideBaseY} C ${sideEarthX + 44} ${sideBaseY + 42}, ${sideRightX - 40} ${sideBaseY + 42}, ${sideRightX} ${sideBaseY}`);
      sideOrbit.setAttribute('fill', 'none');
      sideOrbit.setAttribute('stroke', '#60a5fa');
      sideOrbit.setAttribute('stroke-width', '2');
      sideOrbit.setAttribute('stroke-dasharray', '5 5');
      svg.appendChild(sideOrbit);

      const sideEarth = document.createElementNS(svgNS, 'circle');
      sideEarth.setAttribute('cx', sideEarthX);
      sideEarth.setAttribute('cy', sideBaseY);
      sideEarth.setAttribute('r', 16);
      sideEarth.setAttribute('fill', '#2586d7');
      svg.appendChild(sideEarth);

      [sideEarthX - 40, sideEarthX + 40].forEach((x, index) => {
        const mark = document.createElementNS(svgNS, 'circle');
        mark.setAttribute('cx', x);
        mark.setAttribute('cy', sideBaseY);
        mark.setAttribute('r', 4.5);
        let markFill = '#1d4ed8';
        if (index === 0) {
          markFill = '#0ea5e9';
        }
        mark.setAttribute('fill', markFill);
        svg.appendChild(mark);
      });

      const sideMoon = document.createElementNS(svgNS, 'circle');
      sideMoon.setAttribute('cx', sideMoonX);
      sideMoon.setAttribute('cy', sideMoonY);
      sideMoon.setAttribute('r', 8.5);
      let sideMoonFill = '#f8c84b';
      if (canEclipse) {
        sideMoonFill = '#f59e0b';
      }
      sideMoon.setAttribute('fill', sideMoonFill);
      sideMoon.setAttribute('stroke', '#fff');
      sideMoon.setAttribute('stroke-width', '2');
      svg.appendChild(sideMoon);

      const alignmentLine = document.createElementNS(svgNS, 'line');
      alignmentLine.setAttribute('x1', sideLeftX);
      alignmentLine.setAttribute('y1', sideBaseY);
      alignmentLine.setAttribute('x2', sideMoonX);
      alignmentLine.setAttribute('y2', sideMoonY);
      let alignmentStroke = '#cbd5e1';
      let alignmentStrokeWidth = '1.4';
      let alignmentDashArray = '4 5';
      if (canEclipse) {
        alignmentStroke = '#f59e0b';
        alignmentStrokeWidth = '2.3';
        alignmentDashArray = 'none';
      }
      alignmentLine.setAttribute('stroke', alignmentStroke);
      alignmentLine.setAttribute('stroke-width', alignmentStrokeWidth);
      alignmentLine.setAttribute('stroke-dasharray', alignmentDashArray);
      svg.appendChild(alignmentLine);

      target.appendChild(svg);

      if (summary) {
        let seasonStatusText = t.moon_nodes_inactive || 'Outside eclipse season';
        if (season.active) {
          seasonStatusText = t.moon_nodes_active || 'Eclipse season active';
        }
        summary.innerHTML = '';
        const statusLine = document.createElement('div');
        statusLine.className = 'moon-nodes-status' + statusClass;
        statusLine.textContent = seasonStatusText;
        summary.appendChild(statusLine);
        appendSummaryLine(summary, (t.moon_nodes_node_distance || 'Moon to node') + ': ', node.distanceDays.toFixed(1) + ' d');
        appendSummaryLine(summary, (t.moon_nodes_season_distance || 'Sun to season center') + ': ', season.distanceToCenter.toFixed(1) + ' d');
        appendSummaryLine(summary, (t.moon_nodes_next || 'Next season center') + ': ', formatDateStamp(season.nextCenter));
        appendSummaryLine(summary, (t.moon_nodes_geometry_status || 'Geometry today') + ': ', geometryMessage);
        if (localVisibility) {
          appendSummaryLine(summary, (t.eclipse_visibility_event || 'Event') + ': ', eclipseVisibilityEventTitle(localVisibility.entry));
          appendSummaryLine(summary, (t.eclipse_visibility_here || 'At the selected location') + ': ', location.name + ' - ' + eclipseVisibilityStatusLabel(localVisibility.status));
          let approximationNote = t.eclipse_visibility_approx_note || 'The city visibility is a simplified event-based estimate; the sketch itself remains a global geometry view.';
          if (localVisibility.source === 'fallback') {
            approximationNote = t.eclipse_visibility_region_note || 'This visibility comes from a broad NASA region match for the selected city; the sketch itself remains a global geometry view.';
          }
          appendSummaryText(summary, approximationNote);
        }
        appendEclipsePreview(summary, date, location);
      }
    }




    return {
      render,
      moonLookDirectionForDate,
      moonDirectionReferenceDate,
      moonDirectionLabel
    };
  }

  return {create};
})();
