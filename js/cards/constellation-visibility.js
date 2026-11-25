window.PLANETENUHR_CONSTELLATION_VISIBILITY_CARD = (() => {
  'use strict';

  /** Creates the localized seasonal visibility tables and place-specific constellation details.
     * @param {object} options DOM, data, astronomy helpers, translations and existing figure renderer.
     * @param {Function} options.altitudeThumbEstimate Shared arm-length estimate for a horizon altitude.
     * @param {object} options.details Shared constellation profile renderer.
   * @returns {{render:Function}} Date- and location-driven card controller.
   */
  function create(options){
    const document = options.document;
    const title = document.getElementById('constellationVisibilityTitle');
    const contextLine = document.getElementById('constellationVisibilityContext');
    const monthTab = document.getElementById('constellationVisibilityMonthTab');
    const yearTab = document.getElementById('constellationVisibilityYearTab');
    const monthPanel = document.getElementById('constellationVisibilityMonthPanel');
    const yearPanel = document.getElementById('constellationVisibilityYearPanel');
    const monthHeading = document.getElementById('constellationVisibilityMonthHeading');
    const monthHint = document.getElementById('constellationVisibilityMonthHint');
    const monthRows = document.getElementById('constellationVisibilityMonthRows');
    const yearHeading = document.getElementById('constellationVisibilityYearHeading');
    const yearRows = document.getElementById('constellationVisibilityYearRows');
    const legend = document.getElementById('constellationVisibilityLegend');
    const sourceNote = document.getElementById('constellationVisibilityNote');
    const detailDialog = document.getElementById('constellationVisibilityDialog');
    const detailTitle = document.getElementById('constellationVisibilityDetailTitle');
    const detailClose = document.getElementById('constellationVisibilityDetailClose');
    const detailContext = document.getElementById('constellationVisibilityDetailContext');
    const detailFigure = document.getElementById('constellationVisibilityDetailFigure');
    const detailNoFigure = document.getElementById('constellationVisibilityNoFigure');
    const detailCompass = document.getElementById('constellationVisibilityDetailCompass');
    const detailDirection = document.getElementById('constellationVisibilityDetailDirection');
    const detailAltitude = document.getElementById('constellationVisibilityDetailAltitude');
    const detailRange = document.getElementById('constellationVisibilityDetailRange');
    let lastOpener = null;
    let activeContext = null;

    /** Returns the translated name for one configured constellation.
     * @param {object} item Visibility entry with de, en and fr names.
     * @param {string} language Active dashboard language.
     * @returns {string} Localized constellation name.
     */
    function localizedName(item, language){
      if (item.names && item.names[language]) {
        return item.names[language];
      }
      if (item.names && item.names.en) {
        return item.names.en;
      }
      return item.key;
    }

    /** Finds the existing or generated Stellarium figure for one configured constellation.
     * @param {object} item Visibility entry keyed by its IAU constellation identifier.
     * @returns {object|undefined} Matching line figure, if the data has one.
     */
    function findFigure(item){
      const figures = options.getFigures();
      return figures.find(figure => {
        if (figure.key === item.key) {
          return true;
        }
        if (item.figureKey && figure.name === item.figureKey) {
          return true;
        }
        return false;
      });
    }

    /** Checks whether the configured source month range includes the requested month.
     * @param {object} item Visibility entry with start and end months or yearRound.
     * @param {number} month Calendar month from 1 through 12.
     * @returns {boolean} True when the source reference lists the constellation for that month.
     */
    function isVisibleInReferenceMonth(item, month){
      if (item.yearRound) {
        return true;
      }
      if (item.startMonth <= item.endMonth) {
        return month >= item.startMonth && month <= item.endMonth;
      }
      return month >= item.startMonth || month <= item.endMonth;
    }

    /** Formats the source month range in the current language.
     * @param {object} item Visibility entry.
     * @param {string} language Active dashboard language.
     * @param {object} translations Active translation pack.
     * @returns {string} Localized month range or year-round label.
     */
    function monthRangeLabel(item, language, translations){
      if (item.yearRound) {
        return translations.constellation_visibility_year_round;
      }
      const formatter = new Intl.DateTimeFormat(language, {month:'short', timeZone:'UTC'});
      const start = formatter.format(new Date(Date.UTC(2020, item.startMonth - 1, 1))).replace('.', '');
      const end = formatter.format(new Date(Date.UTC(2020, item.endMonth - 1, 1))).replace('.', '');
      return start + '–' + end;
    }

    /** Clones and fills a miniature using the existing Stellarium Modern line data when available.
     * @param {object|null} figure Existing configured figure with star and line arrays.
     * @returns {DocumentFragment} Figure mini or an empty fragment for entries without artwork.
     */
    function createMiniature(figure){
      const fragment = document.createDocumentFragment();
      if (!figure || !Array.isArray(figure.stars) || figure.stars.length === 0 || !Array.isArray(figure.lines)) {
        return fragment;
      }
      figure = options.illustrations.prepare(figure);
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const star of figure.stars) {
        minX = Math.min(minX, star[0]);
        minY = Math.min(minY, star[1]);
        maxX = Math.max(maxX, star[0]);
        maxY = Math.max(maxY, star[1]);
      }
      if (figure.illustration) {
        minX = 0; minY = 0; maxX = 100; maxY = 100;
      }
      const largestSpan = Math.max(maxX - minX, maxY - minY, 1);
      const scale = 38 / largestSpan;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      /** Maps one source star position into the centered miniature view box.
       * @param {number[]} star Source chart position as percentage coordinates.
       * @returns {{x:number,y:number}} Centered point preserving the chart aspect ratio.
       */
      function miniPoint(star){
        return {
          x:29 + (star[0] - centerX) * scale,
          y:21 + (star[1] - centerY) * scale
        };
      }

      const svg = options.createSvgElement('svg');
      svg.setAttribute('viewBox', '0 0 58 42');
      svg.setAttribute('class', 'constellation-visibility-mini');
      svg.setAttribute('aria-hidden', 'true');
      options.illustrations.append(svg, figure, 38, 10, 2);
      for (const lineIndices of figure.lines) {
        const start = figure.stars[lineIndices[0]];
        const end = figure.stars[lineIndices[1]];
        if (!start || !end) {
          continue;
        }
        const startPoint = miniPoint(start);
        const endPoint = miniPoint(end);
        const line = options.createSvgElement('line');
        line.setAttribute('x1', startPoint.x.toFixed(1));
        line.setAttribute('y1', startPoint.y.toFixed(1));
        line.setAttribute('x2', endPoint.x.toFixed(1));
        line.setAttribute('y2', endPoint.y.toFixed(1));
        line.setAttribute('class', 'constellation-visibility-line');
        svg.appendChild(line);
      }
      for (const star of figure.stars) {
        const point = miniPoint(star);
        const circle = options.createSvgElement('circle');
        circle.setAttribute('cx', point.x.toFixed(1));
        circle.setAttribute('cy', point.y.toFixed(1));
        circle.setAttribute('r', '1.6');
        circle.setAttribute('class', 'constellation-visibility-star');
        svg.appendChild(circle);
      }
      fragment.appendChild(svg);
      return fragment;
    }

    /** Appends a reusable small compass and its direction label to a table cell.
     * @param {HTMLElement} cell Destination table cell.
     * @param {number} azimuthDeg Azimuth clockwise from north.
     * @param {object} translations Active translation pack.
     * @returns {void} Adds compass icon and localized direction text.
     */
    function appendDirection(cell, azimuthDeg, translations){
      const direction = document.createElement('span');
      direction.className = 'constellation-visibility-direction-content';
      const compass = options.compass.create(azimuthDeg);
      compass.classList.add('constellation-visibility-compass');
      compass.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = options.compassLabelForAzimuth(azimuthDeg, translations);
      const degrees = document.createElement('span');
      degrees.className = 'constellation-visibility-degrees';
      degrees.textContent = Math.round(azimuthDeg) + '°';
      direction.append(compass, label, degrees);
      cell.appendChild(direction);
    }

    /** Appends an altitude and horizon status in the active language.
     * @param {HTMLElement} cell Destination table cell.
     * @param {number} altitudeDeg Geometric altitude in degrees.
     * @param {object} translations Active translation pack.
     * @returns {void} Adds a compact altitude and visibility status.
     */
    function appendAltitude(cell, altitudeDeg, translations){
      const altitude = document.createElement('span');
      altitude.textContent = Math.abs(altitudeDeg).toFixed(1) + '°';
      cell.appendChild(altitude);
      const status = document.createElement('small');
      if (altitudeDeg >= 0) {
        status.textContent = translations.constellation_visibility_above;
        const estimate = options.altitudeThumbEstimate(altitudeDeg);
        if (estimate) {
          status.textContent += ' · ' + estimate;
        }
      } else {
        status.textContent = translations.constellation_visibility_below;
      }
      cell.appendChild(status);
    }

    /** Builds a name button with a miniature when that Stellarium figure is already configured.
     * @param {object} item Visibility entry.
     * @param {string} language Active dashboard language.
     * @param {object} translations Active translation pack.
     * @returns {DocumentFragment} Name control and optional figure miniature.
     */
    function createNameControl(item, language, translations){
      const fragment = document.createDocumentFragment();
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'constellation-visibility-open';
      button.dataset.constellationDetail = item.key;
      const name = localizedName(item, language);
      button.setAttribute('aria-label', translations.constellation_visibility_open.replace('{name}', name));
      const figure = findFigure(item);
      button.appendChild(createMiniature(figure));
      const nameText = document.createElement('span');
      nameText.textContent = name;
      button.appendChild(nameText);
      fragment.appendChild(button);
      return fragment;
    }

    /** Renders the active month's table from the source visibility ranges and selected place.
     * @param {object} context Shared selected date, location and language.
     * @param {object} translations Active translation pack.
     * @returns {void} Replaces rows for the selected month.
     */
    function renderMonthTable(context, translations){
      const dateParts = options.dateTime.datePartsInZone(context.date, context.timeZone);
      const month = Number(dateParts.month);
      const entries = options.getEntries().filter(item => isVisibleInReferenceMonth(item, month));
      const formatter = new Intl.DateTimeFormat(context.language, {month:'long'});
      monthHeading.textContent = formatter.format(new Date(Date.UTC(Number(dateParts.year), month - 1, 15)));
      monthHint.textContent = translations.constellation_visibility_month_hint.replace('{count}', String(entries.length));
      monthRows.replaceChildren();
      for (const item of entries) {
        const row = options.cloneTemplate('constellationVisibilityMonthRowTemplate').firstElementChild;
        const nameCell = row.querySelector('[data-visibility-name]');
        const rangeCell = row.querySelector('[data-visibility-range]');
        const directionCell = row.querySelector('[data-visibility-direction]');
        const altitudeCell = row.querySelector('[data-visibility-altitude]');
        nameCell.appendChild(createNameControl(item, context.language, translations));
        rangeCell.textContent = monthRangeLabel(item, context.language, translations);
        const direction = options.model.calculateDirection(context.date, context.location, item);
        if (direction) {
          appendDirection(directionCell, direction.azimuthDeg, translations);
          appendAltitude(altitudeCell, direction.altitudeDeg, translations);
        } else {
          directionCell.textContent = '—';
          altitudeCell.textContent = '—';
        }
        monthRows.appendChild(row);
      }
    }

    /** Renders the complete 12-month matrix for every constellation in the supplied guide.
     * @param {object} context Shared selected date, location and language.
     * @param {object} translations Active translation pack.
     * @returns {void} Replaces all annual reference rows.
     */
    function renderYearTable(context, translations){
      const selectedMonth = Number(options.dateTime.datePartsInZone(context.date, context.timeZone).month);
      const monthFormatter = new Intl.DateTimeFormat(context.language, {month:'short', timeZone:'UTC'});
      const monthHeaders = document.getElementById('constellationVisibilityYearTable').querySelectorAll('thead [data-visibility-month]');
      monthHeaders.forEach((header, index) => {
        const monthDate = new Date(Date.UTC(2020, index, 1));
        const label = monthFormatter.format(monthDate).replace('.', '');
        header.textContent = label;
        header.setAttribute('aria-label', new Intl.DateTimeFormat(context.language, {month:'long', timeZone:'UTC'}).format(monthDate));
        header.classList.toggle('is-selected-month', index === selectedMonth - 1);
      });
      yearRows.replaceChildren();
      for (const item of options.getEntries()) {
        const row = options.cloneTemplate('constellationVisibilityYearRowTemplate').firstElementChild;
        row.querySelector('[data-visibility-year-name]').appendChild(createNameControl(item, context.language, translations));
        const monthCells = row.querySelectorAll('[data-visibility-month-cell]');
        monthCells.forEach((cell, index) => {
          const visible = isVisibleInReferenceMonth(item, index + 1);
          cell.classList.toggle('is-visible', visible);
          cell.classList.toggle('is-selected-month', index === selectedMonth - 1);
          if (visible) {
            cell.setAttribute('aria-label', translations.constellation_visibility_visible);
          } else {
            cell.setAttribute('aria-label', translations.constellation_visibility_not_listed);
          }
        });
        yearRows.appendChild(row);
      }
      yearHeading.textContent = translations.constellation_visibility_year_heading;
    }

    /** Opens details for a constellation and reports its computed evening direction.
     * @param {object} item Visibility entry chosen from either table.
     * @param {HTMLElement} opener Button that opened the dialog.
     * @param {object} context Current dashboard selection.
     * @param {object} translations Active translation pack.
     * @returns {void} Opens the dialog and renders a reused figure when available.
     */
    function openDetails(item, opener, context, translations){
      if (!detailDialog || !detailTitle || !detailContext) {
        return;
      }
      lastOpener = opener;
      const name = localizedName(item, context.language);
      const profileKey = item.figureKey || item.key;
      detailTitle.textContent = options.details.titleFor(profileKey, context.language, name);
      const direction = options.model.calculateDirection(context.date, context.location, item);
      let timeLabel = '—';
      if (direction) {
        timeLabel = options.dateTime.formatTimeOnly(direction.date, direction.timeZone, context.language);
      }
      detailContext.textContent = context.location.name + ' · ' + options.dateTime.formatDateStamp(context.date, context.timeZone, context.language)
        + ' · ' + translations.constellation_visibility_at_time.replace('{time}', timeLabel);
      detailRange.textContent = translations.constellation_visibility_reference_range + ': ' + monthRangeLabel(item, context.language, translations);
      detailFigure.replaceChildren();
      const figure = findFigure(item);
      if (figure) {
        detailNoFigure.hidden = true;
        const figureTarget = document.createElement('div');
        detailFigure.appendChild(figureTarget);
        const directionHint = direction || {azimuthDeg:figure.skyAngle, altitudeDeg:figure.skyAltitude};
        const renderItem = Object.assign({}, figure, {
          key:item.key,
          name,
          skyAngle:directionHint.azimuthDeg,
          skyAltitude:directionHint.altitudeDeg
        });
        options.renderFigure(renderItem, context, figureTarget);
      } else {
        detailNoFigure.hidden = false;
        detailNoFigure.textContent = translations.constellation_visibility_no_figure;
      }
      detailCompass.replaceChildren();
      if (direction) {
        const compass = options.compass.create(direction.azimuthDeg);
        compass.classList.add('constellation-visibility-detail-compass');
        compass.setAttribute('aria-hidden', 'true');
        detailCompass.appendChild(compass);
        detailDirection.textContent = options.compassLabelForAzimuth(direction.azimuthDeg, translations)
          + ' · ' + Math.round(direction.azimuthDeg) + '°';
        const altitudeText = Math.abs(direction.altitudeDeg).toFixed(1) + '°';
        if (direction.altitudeDeg >= 0) {
          detailAltitude.textContent = altitudeText + ' ' + translations.constellation_visibility_above;
          const estimate = options.altitudeThumbEstimate(direction.altitudeDeg);
          if (estimate) {
            detailAltitude.textContent += ' · ' + estimate;
          }
        } else {
          detailAltitude.textContent = altitudeText + ' ' + translations.constellation_visibility_below;
        }
      } else {
        detailDirection.textContent = '—';
        detailAltitude.textContent = '—';
      }
      detailClose.textContent = translations.diagram_close;
      options.details.render(
        document.getElementById('constellationVisibilityDetailDescription'),
        profileKey,
        context.language,
        figure?.highlight
      );
      detailDialog.showModal();
      const content = detailDialog.querySelector('.constellation-detail-layout');
      if (content) {
        content.scrollTop = 0;
      }
    }

    /** Activates one of the card's two table tabs.
     * @param {string} tabName Either month or year.
     * @returns {void} Updates selected tab and panel visibility.
     */
    function selectTab(tabName){
      const isMonth = tabName === 'month';
      monthTab.setAttribute('aria-selected', String(isMonth));
      yearTab.setAttribute('aria-selected', String(!isMonth));
      if (isMonth) {
        monthTab.tabIndex = 0;
        yearTab.tabIndex = -1;
      } else {
        monthTab.tabIndex = -1;
        yearTab.tabIndex = 0;
      }
      monthPanel.hidden = !isMonth;
      yearPanel.hidden = isMonth;
      options.requestLayout();
    }

    /** Rebuilds card labels, rows and location-dependent bearings for the latest app selection.
     * @param {object} context Shared date, location, time zone and language selection.
     * @returns {void} Updates visible content without replacing the card shell.
     */
    function render(context){
      if (!context || !context.date || !context.location || !monthRows || !yearRows) {
        return;
      }
      activeContext = context;
      const translations = options.getTranslations();
      title.textContent = translations.title_constellation_visibility;
      contextLine.textContent = context.location.name + ' · ' + translations.constellation_visibility_reference_clock;
      monthTab.textContent = translations.constellation_visibility_month_tab;
      yearTab.textContent = translations.constellation_visibility_year_tab;
      monthTab.setAttribute('aria-label', translations.constellation_visibility_month_tab);
      yearTab.setAttribute('aria-label', translations.constellation_visibility_year_tab);
      document.querySelector('.constellation-visibility-tabs').setAttribute('aria-label', translations.constellation_visibility_tabs_label);
      document.getElementById('constellationVisibilityNameHeading').textContent = translations.constellation_visibility_table_name;
      document.getElementById('constellationVisibilityRangeHeading').textContent = translations.constellation_visibility_table_range;
      document.getElementById('constellationVisibilityDirectionHeading').textContent = translations.constellation_visibility_table_direction;
      document.getElementById('constellationVisibilityAltitudeHeading').textContent = translations.constellation_visibility_table_altitude;
      document.getElementById('constellationVisibilityYearNameHeading').textContent = translations.constellation_visibility_table_name;
      renderMonthTable(context, translations);
      renderYearTable(context, translations);
      legend.textContent = translations.constellation_visibility_legend;
      const note = options.config.sourceNote[context.language] || options.config.sourceNote.en;
      sourceNote.textContent = note;
      document.getElementById('constellationVisibilityYearHint').textContent = translations.constellation_visibility_legend;
      options.requestLayout();
    }

    monthTab.addEventListener('click', () => selectTab('month'));
    yearTab.addEventListener('click', () => selectTab('year'));
    for (const tab of [monthTab, yearTab]) {
      tab.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          if (tab === monthTab) {
            yearTab.focus();
            selectTab('year');
          } else {
            monthTab.focus();
            selectTab('month');
          }
        }
      });
    }
    for (const tableBody of [monthRows, yearRows]) {
      tableBody.addEventListener('click', event => {
        const opener = event.target.closest('[data-constellation-detail]');
        if (!opener || !activeContext) {
          return;
        }
        const item = options.getEntries().find(entry => entry.key === opener.dataset.constellationDetail);
        if (item) {
          openDetails(item, opener, activeContext, options.getTranslations());
        }
      });
    }
    detailClose.addEventListener('click', () => detailDialog.close());
    detailDialog.addEventListener('click', event => {
      if (event.target === detailDialog) {
        detailDialog.close();
      }
    });
    detailDialog.addEventListener('close', () => {
      if (lastOpener && lastOpener.isConnected) {
        lastOpener.focus({preventScroll:true});
      }
      lastOpener = null;
    });
    selectTab('month');

    return {render, isVisibleInReferenceMonth, monthRangeLabel};
  }

  return {create};
})();
