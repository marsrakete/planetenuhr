

  window.onerror = function(msg, url, line, col, error) {
  alert("JS Error: " + msg + " @ " + line);
};

    // --- i18n ---
    const lang = ((navigator.language || 'en').toLowerCase().startsWith('de'))
      ? 'de'
      : (((navigator.language || 'en').toLowerCase().startsWith('fr')) ? 'fr' : 'en');

    const translations = window.PLANETENUHR_TRANSLATIONS || {};
    const t = translations[lang] || translations.en || {};
    const cardHelp = window.PLANETENUHR_CARD_HELP || {};
    const calendarEventsByLang = window.PLANETENUHR_EVENTS || {};
    const smallBodiesConfig = window.PLANETENUHR_SMALL_BODIES || { belts:[], comets:[] };
    const phenomenaConfig = window.PLANETENUHR_PHENOMENA || { meteorStreams:[], constellations:[], spacecraft:[], retrogradeBodies:[], planetPhaseBodies:[], satellites:[] };
    const bskyFeeds = window.PLANETENUHR_BSKY_FEEDS || [];
    const locations = [
      { key:'berlin', name:'Berlin', latitude:52.52, longitude:13.405 },
      { key:'hamburg', name:'Hamburg', latitude:53.5511, longitude:9.9937 },
      { key:'munich', name:'München', latitude:48.1372, longitude:11.5755 },
      { key:'cologne', name:'Köln', latitude:50.9375, longitude:6.9603 },
      { key:'frankfurt', name:'Frankfurt am Main', latitude:50.1109, longitude:8.6821 },
      { key:'stuttgart', name:'Stuttgart', latitude:48.7758, longitude:9.1829 },
      { key:'dusseldorf', name:'Düsseldorf', latitude:51.2277, longitude:6.7735 },
      { key:'dortmund', name:'Dortmund', latitude:51.5136, longitude:7.4653 },
      { key:'essen', name:'Essen', latitude:51.4556, longitude:7.0116 },
      { key:'leipzig', name:'Leipzig', latitude:51.3397, longitude:12.3731 }
    ];
    let selectedLocationKey = 'berlin';
    let activeCalendarFilter = 'all';
    let showAllCalendarEvents = false;

    function currentCardHelpPack(){
      return cardHelp[lang] || cardHelp.en || { sections:{}, cards:{} };
    }

    function renderCardHelpEntry(entry, sections){
      let html = '<div class="card-help-title">' + (sections.title || 'About this card') + '</div>';
      if (entry.intro && entry.intro.length) {
        html += '<section class="card-help-section"><h4>' + (sections.overview || 'Overview') + '</h4>'
          + entry.intro.map(text => '<p>' + text + '</p>').join('')
          + '</section>';
      }
      if (entry.formulas && entry.formulas.length) {
        html += '<section class="card-help-section"><h4>' + (sections.formulas || 'Formulas used') + '</h4><div class="card-help-formulas">'
          + entry.formulas.map(item =>
            '<div class="card-help-formula">'
            + '<div class="card-help-formula-expr">' + item.expr + '</div>'
            + (item.note ? '<div class="card-help-formula-note">' + item.note + '</div>' : '')
            + '</div>'
          ).join('')
          + '</div></section>';
      }
      if (entry.details && entry.details.length) {
        html += '<section class="card-help-section"><h4>' + (sections.details || 'Data & notes') + '</h4><ul class="card-help-list">'
          + entry.details.map(text => '<li>' + text + '</li>').join('')
          + '</ul></section>';
      }
      if (entry.links && entry.links.length) {
        html += '<section class="card-help-section"><h4>' + (sections.links || 'Sources & further reading') + '</h4><div class="card-help-links">'
          + entry.links.map(link =>
            '<a class="card-help-link" href="' + link.url + '" target="_blank" rel="noopener noreferrer">' + link.label + '</a>'
          ).join('')
          + '</div></section>';
      }
      return html;
    }

    function closeAllCardHelp(except){
      document.querySelectorAll('.card-help.open').forEach(node => {
        if (except && node === except) return;
        node.classList.remove('open');
        const button = node.querySelector('.card-help-button');
        if (button) button.setAttribute('aria-expanded', 'false');
      });
    }

    function initCardHelp(){
      const pack = currentCardHelpPack();
      const sections = pack.sections || {};
      const fallbackCards = (cardHelp.en && cardHelp.en.cards) || {};
      document.querySelectorAll('.display-container[data-help-key]').forEach(card => {
        if (card.querySelector('.card-help')) return;
        const key = card.dataset.helpKey;
        if (key === 'date_location') return;
        const entry = (pack.cards && pack.cards[key]) || fallbackCards[key];
        if (!entry) return;
        const wrap = document.createElement('div');
        wrap.className = 'card-help';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'card-help-button';
        button.textContent = '?';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', sections.button || 'More info');
        const popup = document.createElement('div');
        popup.className = 'card-help-popup';
        popup.innerHTML = renderCardHelpEntry(entry, sections);
        wrap.appendChild(button);
        wrap.appendChild(popup);
        card.appendChild(wrap);
        button.addEventListener('click', event => {
          event.stopPropagation();
          const open = wrap.classList.contains('open');
          closeAllCardHelp(open ? null : wrap);
          wrap.classList.toggle('open', !open);
          button.setAttribute('aria-expanded', String(!open));
        });
        popup.addEventListener('click', event => event.stopPropagation());
      });
      if (!window.__planetenuhrCardHelpWired) {
        document.addEventListener('click', () => closeAllCardHelp(null));
        document.addEventListener('keydown', event => {
          if (event.key === 'Escape') closeAllCardHelp(null);
        });
        window.__planetenuhrCardHelpWired = true;
      }
    }

    function applyI18n(){
      document.documentElement.lang = lang;
      document.getElementById('titleTime').textContent       = t.title_time;
      document.getElementById('titleSettings').textContent   = t.title_settings;
      document.getElementById('labelTimezone').textContent   = t.label_timezone;
      document.getElementById('labelFont').textContent       = t.label_font;
      document.getElementById('labelDisplay').textContent    = t.label_display;

      document.getElementById('titleSolarSystem').textContent = t.title_solar_system;
      document.getElementById('solarLegend').textContent      = t.legend_solar;
      const titleDateLocation = document.getElementById('titleDateLocation');
      if (titleDateLocation) titleDateLocation.textContent = t.title_date_location;
      const labelLocation = document.getElementById('labelLocation');
      if (labelLocation) labelLocation.textContent = t.label_location;
      const titleSmallBodies = document.getElementById('titleSmallBodies');
      if (titleSmallBodies) titleSmallBodies.textContent = t.title_small_bodies;
      const smallBodiesLegend = document.getElementById('smallBodiesLegend');
      if (smallBodiesLegend) smallBodiesLegend.textContent = t.legend_small_bodies;
      const titleMoonNodes = document.getElementById('titleMoonNodes');
      if (titleMoonNodes) titleMoonNodes.textContent = t.title_moon_nodes || 'Moon nodes & eclipse season';
      const moonNodesLegend = document.getElementById('moonNodesLegend');
      if (moonNodesLegend) moonNodesLegend.textContent = t.legend_moon_nodes || 'Node geometry and approximate eclipse-season cycle';
      const titleConjunctions = document.getElementById('titleConjunctions');
      if (titleConjunctions) titleConjunctions.textContent = t.title_conjunctions || 'Planetary conjunctions';
      const conjunctionLegend = document.getElementById('conjunctionLegend');
      if (conjunctionLegend) conjunctionLegend.textContent = t.legend_conjunctions || 'Approximate conjunction minima within the selected date window';
      const titleMeteorStreams = document.getElementById('titleMeteorStreams');
      if (titleMeteorStreams) titleMeteorStreams.textContent = t.title_meteor_streams;
      const meteorLegend = document.getElementById('meteorLegend');
      if (meteorLegend) meteorLegend.textContent = t.legend_meteor_streams;
      const titleConstellationMonth = document.getElementById('titleConstellationMonth');
      if (titleConstellationMonth) titleConstellationMonth.textContent = t.title_constellation_month;
      const constellationLegend = document.getElementById('constellationLegend');
      if (constellationLegend) constellationLegend.textContent = t.legend_constellation_month;
      const titleConstellationYear = document.getElementById('titleConstellationYear');
      if (titleConstellationYear) titleConstellationYear.textContent = t.title_constellation_year || 'Constellation year clock';
      const constellationYearLegend = document.getElementById('constellationYearLegend');
      if (constellationYearLegend) constellationYearLegend.textContent = t.legend_constellation_year || 'Annual wheel of the monthly constellations';
      const titleSeasonAxis = document.getElementById('titleSeasonAxis');
      if (titleSeasonAxis) titleSeasonAxis.textContent = t.title_season_axis;
      const seasonLegend = document.getElementById('seasonLegend');
      if (seasonLegend) seasonLegend.textContent = t.legend_season_axis;
      const titleSpacecraft = document.getElementById('titleSpacecraft');
      if (titleSpacecraft) titleSpacecraft.textContent = t.title_spacecraft;
      const spacecraftLegend = document.getElementById('spacecraftLegend');
      if (spacecraftLegend) spacecraftLegend.textContent = t.legend_spacecraft;
      document.getElementById('titleVisibility').textContent  = t.title_visibility;
      document.getElementById('visibilityLegend').textContent = t.visibility_legend;
      document.getElementById('visibilityLegendNight').textContent = t.visibility_legend_night;
      document.getElementById('visibilityLegendTwilight').textContent = t.visibility_legend_twilight;
      document.getElementById('visibilityLegendDay').textContent = t.visibility_legend_day;
      document.getElementById('visibilityLegendWindow').textContent = t.visibility_legend_window;
      document.getElementById('solarPastLabel').textContent   = t.solar_past_control;
      document.getElementById('solarFutureLabel').textContent = t.solar_future_control;
      document.getElementById('solarDateSlider').setAttribute('aria-label', t.solar_slider);
      document.getElementById('btnSolarToday').textContent    = t.solar_today;
      document.getElementById('btnSolarPrev').setAttribute('aria-label', t.solar_prev_day);
      document.getElementById('btnSolarNext').setAttribute('aria-label', t.solar_next_day);
      document.getElementById('btnSolarPrevWeek').setAttribute('aria-label', t.solar_prev_week);
      document.getElementById('btnSolarNextWeek').setAttribute('aria-label', t.solar_next_week);
      document.getElementById('btnSolarPrevMonth').setAttribute('aria-label', t.solar_prev_month);
      document.getElementById('btnSolarNextMonth').setAttribute('aria-label', t.solar_next_month);
      document.getElementById('btnSolarPrevYear').setAttribute('aria-label', t.solar_prev_year);
      document.getElementById('btnSolarNextYear').setAttribute('aria-label', t.solar_next_year);
      const labelStepYear = document.getElementById('labelStepYear');
      if (labelStepYear) labelStepYear.textContent = t.date_step_year;
      const labelStepMonth = document.getElementById('labelStepMonth');
      if (labelStepMonth) labelStepMonth.textContent = t.date_step_month;
      const labelStepWeek = document.getElementById('labelStepWeek');
      if (labelStepWeek) labelStepWeek.textContent = t.date_step_week;
      const labelStepDay = document.getElementById('labelStepDay');
      if (labelStepDay) labelStepDay.textContent = t.date_step_day;
      document.getElementById('titleJupiter').textContent    = t.title_jupiter;
      document.getElementById('jupiterLegend').textContent   = t.legend_jupiter;
      const titleRetrograde = document.getElementById('titleRetrograde');
      if (titleRetrograde) titleRetrograde.textContent = t.title_retrograde || 'Retrograde phases';
      const retrogradeLegend = document.getElementById('retrogradeLegend');
      if (retrogradeLegend) retrogradeLegend.textContent = t.legend_retrograde || 'Approximate apparent geocentric motion from day to day';
      const titleInnerPhases = document.getElementById('titleInnerPhases');
      if (titleInnerPhases) titleInnerPhases.textContent = t.title_inner_phases || 'Mercury & Venus phases';
      const innerPhasesLegend = document.getElementById('innerPhasesLegend');
      if (innerPhasesLegend) innerPhasesLegend.textContent = t.legend_inner_phases || 'Illumination, elongation and morning/evening appearance';
      const titleSatellites = document.getElementById('titleSatellites');
      if (titleSatellites) titleSatellites.textContent = t.title_satellites || 'ISS & bright satellites';
      const satelliteLegend = document.getElementById('satelliteLegend');
      if (satelliteLegend) satelliteLegend.textContent = t.legend_satellites || 'Schematic mean low-Earth orbits; positions move with the selected date';
      const titleAurora = document.getElementById('titleAurora');
      if (titleAurora) titleAurora.textContent = t.title_aurora || 'Aurora chance Germany';
      const auroraLegend = document.getElementById('auroraLegend');
      if (auroraLegend) auroraLegend.textContent = t.legend_aurora || 'Live estimate for today; not linked to the date control';
      document.getElementById('titleEarthMoon').textContent  = t.title_earthmoon;
      document.getElementById('titleMoon').textContent       = t.title_moon;
      const titleEclipseGeometry = document.getElementById('titleEclipseGeometry');
      if (titleEclipseGeometry) titleEclipseGeometry.textContent = t.title_eclipse_geometry;
      document.getElementById('titleOtherPlanets').textContent = t.title_other_planets;
      document.getElementById('otherPlanetsLegend').textContent = t.legend_other_planets;
      document.getElementById('titleSkyCalendar').textContent = t.title_sky_calendar;

      const lblIll = document.getElementById('labelIllum');
      if (lblIll) lblIll.textContent = t.label_illum;
      const lblCyc = document.getElementById('labelCycle');
      if (lblCyc) lblCyc.textContent = t.label_cycle;
      const moonTimelineNew = document.getElementById('moonTimelineNew');
      if (moonTimelineNew) moonTimelineNew.textContent = t.moon_timeline_new;
      const moonTimelineFirst = document.getElementById('moonTimelineFirst');
      if (moonTimelineFirst) moonTimelineFirst.textContent = t.moon_timeline_first;
      const moonTimelineFull = document.getElementById('moonTimelineFull');
      if (moonTimelineFull) moonTimelineFull.textContent = t.moon_timeline_full;
      const moonTimelineLast = document.getElementById('moonTimelineLast');
      if (moonTimelineLast) moonTimelineLast.textContent = t.moon_timeline_last;
      const titleSunlight = document.getElementById('titleSunlight');
      if (titleSunlight) titleSunlight.textContent = t.title_sunlight;
      const labelSunrise = document.getElementById('labelSunrise');
      if (labelSunrise) labelSunrise.textContent = t.sunrise;
      const labelSunset = document.getElementById('labelSunset');
      if (labelSunset) labelSunset.textContent = t.sunset;
      const labelDayLength = document.getElementById('labelDayLength');
      if (labelDayLength) labelDayLength.textContent = t.day_length;
      const labelDawn = document.getElementById('labelDawn');
      if (labelDawn) labelDawn.textContent = t.dawn;
      const labelDusk = document.getElementById('labelDusk');
      if (labelDusk) labelDusk.textContent = t.dusk;
      const titleLightHours = document.getElementById('titleLightHours');
      if (titleLightHours) titleLightHours.textContent = t.title_light_hours;
      const labelBlueHour = document.getElementById('labelBlueHour');
      if (labelBlueHour) labelBlueHour.textContent = t.blue_hour;
      const labelGoldenHour = document.getElementById('labelGoldenHour');
      if (labelGoldenHour) labelGoldenHour.textContent = t.golden_hour;
      const labelLightDay = document.getElementById('labelLightDay');
      if (labelLightDay) labelLightDay.textContent = t.light_day;
      const labelLightNight = document.getElementById('labelLightNight');
      if (labelLightNight) labelLightNight.textContent = t.light_night;
      document.querySelectorAll('[data-calendar-filter]').forEach(button => {
        const key = button.dataset.calendarFilter;
        button.textContent = t['calendar_filter_' + key] || key;
      });
      const showPastLabel = document.getElementById('calendarShowPastLabel');
      if (showPastLabel) showPastLabel.textContent = t.calendar_show_past;
      const calendarDataUntil = document.getElementById('calendarDataUntil');
      if (calendarDataUntil) calendarDataUntil.textContent = t.calendar_data_until;
      const calendarShowAll = document.getElementById('btnCalendarShowAll');
      if (calendarShowAll) calendarShowAll.textContent = showAllCalendarEvents ? t.calendar_show_less : t.calendar_show_all;
      const titleBskyFeed = document.getElementById('titleBskyFeed');
      if (titleBskyFeed) titleBskyFeed.textContent = t.bsky_title;
      const bskyStatus = document.getElementById('bskyStatus');
      if (bskyStatus) bskyStatus.textContent = t.bsky_loading;

      const tsw = document.getElementById('titleStopwatch');
      if (tsw) tsw.textContent = t.title_stopwatch;
      const tcd = document.getElementById('titleCountdown');
      if (tcd) tcd.textContent = t.title_countdown;

      const b1 = document.getElementById('btnStartSW');  if (b1) b1.textContent = t.btn_start;
      const b2 = document.getElementById('btnStopSW');   if (b2) b2.textContent = t.btn_stop;
      const b3 = document.getElementById('btnResetSW');  if (b3) b3.textContent = t.btn_reset;
      const b4 = document.getElementById('btnStartCD');  if (b4) b4.textContent = t.btn_start_countdown;
      const b5 = document.getElementById('btnStopCD');   if (b5) b5.textContent = t.btn_stop;

      const tzSel = document.getElementById('timezone');
      const m = new Map([
        ["local", t.tz_local],
        ["UTC", t.tz_utc],
        ["Europe/Berlin", t.tz_berlin],
        ["America/New_York", t.tz_ny],
        ["Europe/London", t.tz_london],
        ["Asia/Tokyo", t.tz_tokyo]
      ]);
      [...tzSel.options].forEach(o => {
        if (m.has(o.value)) o.textContent = m.get(o.value);
      });

      const cdMin = document.getElementById('countdownMinutes');
      if (cdMin) cdMin.placeholder = t.placeholder_minutes || 'Minutes';

      // Display mode labels
      const modeSel = document.getElementById('displayMode');
      const m2 = new Map([
        ["plain",   t.mode_plain],
        ["wobble",  t.mode_wobble],
        ["pulse",   t.mode_pulse],
        ["spin",    t.mode_spin],
        ["matrix",  t.mode_matrix],
        ["neon",    t.mode_neon],
        ["segment", t.mode_segment]
      ]);
      [...modeSel.options].forEach(o => {
        if (m2.has(o.value)) o.textContent = m2.get(o.value);
      });

      // Planetennamen lokalisieren
      document.querySelectorAll('.planet-name').forEach(el => {
        const key = el.dataset.planet;
        if (key && t['planet_' + key]) el.textContent = t['planet_' + key];
      });

      // Mondnamen (Jupiter + andere Planeten) lokalisieren
      document.querySelectorAll('[data-moon]').forEach(el => {
        const key = el.dataset.moon;
        if (key && t['moon_' + key]) el.textContent = t['moon_' + key];
      });
      renderCalendar();
    }

    function fmtTZ(d, tz){
      const timeZone = tz !== 'local' ? tz : undefined;
      return formatDateStamp(d, timeZone) + ' ' + d.toLocaleTimeString(lang, {
        hour:'2-digit', minute:'2-digit', second:'2-digit',
        hour12:false,
        timeZone
      });
    }

    function datePartsInZone(d, timeZone){
      const parts = new Intl.DateTimeFormat('en-CA', {
        year:'numeric',
        month:'2-digit',
        day:'2-digit',
        timeZone
      }).formatToParts(d);
      return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    }

    function formatDateStamp(d, timeZone){
      const parts = datePartsInZone(d, timeZone);
      return parts.year + '.' + parts.month + '.' + parts.day;
    }

    function fmtDateOnly(d){
      return formatDateStamp(d);
    }

    function fmtTimeOnly(d){
      if (!d) return '-';
      return d.toLocaleTimeString(lang, {
        hour:'2-digit',
        minute:'2-digit',
        hour12:false,
        timeZone:'Europe/Berlin'
      });
    }

    function dayOfYear(date){
      const start = Date.UTC(date.getFullYear(), 0, 0);
      const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
      return Math.floor((current - start) / 86400000);
    }

    function solarEventUtc(date, latitude, longitude, zenithDeg, isRise){
      const n = dayOfYear(date);
      const lngHour = longitude / 15;
      const tDay = n + (((isRise ? 6 : 18) - lngHour) / 24);
      const meanAnomaly = (0.9856 * tDay) - 3.289;
      let trueLongitude = meanAnomaly
        + (1.916 * Math.sin(meanAnomaly * Math.PI / 180))
        + (0.020 * Math.sin(2 * meanAnomaly * Math.PI / 180))
        + 282.634;
      trueLongitude = ((trueLongitude % 360) + 360) % 360;

      let rightAscension = Math.atan(0.91764 * Math.tan(trueLongitude * Math.PI / 180)) * 180 / Math.PI;
      rightAscension = ((rightAscension % 360) + 360) % 360;
      rightAscension += Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90;
      rightAscension /= 15;

      const sinDec = 0.39782 * Math.sin(trueLongitude * Math.PI / 180);
      const cosDec = Math.cos(Math.asin(sinDec));
      const latRad = latitude * Math.PI / 180;
      const cosHour = (Math.cos(zenithDeg * Math.PI / 180) - (sinDec * Math.sin(latRad))) / (cosDec * Math.cos(latRad));
      if (cosHour > 1 || cosHour < -1) return null;

      let hourAngle = Math.acos(cosHour) * 180 / Math.PI;
      if (isRise) hourAngle = 360 - hourAngle;
      hourAngle /= 15;

      const localMeanTime = hourAngle + rightAscension - (0.06571 * tDay) - 6.622;
      const utcHour = ((localMeanTime - lngHour) % 24 + 24) % 24;
      return new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        Math.floor(utcHour),
        Math.floor((utcHour % 1) * 60),
        Math.round((((utcHour % 1) * 60) % 1) * 60)
      ));
    }

    function formatDuration(ms){
      const totalMinutes = Math.max(0, Math.round(ms / 60000));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return hours + ' ' + t.hours_short + ' ' + String(minutes).padStart(2, '0') + ' ' + t.minutes_short;
    }

    function renderSunlight(date = selectedSolarDate()){
      const location = selectedLocation();
      const sunrise = solarEventUtc(date, location.latitude, location.longitude, 90.833, true);
      const sunset = solarEventUtc(date, location.latitude, location.longitude, 90.833, false);
      const dawn = solarEventUtc(date, location.latitude, location.longitude, 96, true);
      const dusk = solarEventUtc(date, location.latitude, location.longitude, 96, false);
      const goldenMorningEnd = solarEventUtc(date, location.latitude, location.longitude, 84, true);
      const goldenEveningStart = solarEventUtc(date, location.latitude, location.longitude, 84, false);
      const titleSunlight = document.getElementById('titleSunlight');
      if (titleSunlight) titleSunlight.textContent = (t.title_sunlight || 'Day & night') + ' ' + location.name;
      const startOfDay = new Date(date);
      startOfDay.setHours(0,0,0,0);
      const positionOfDay = value => value ? ((value - startOfDay) / 86400000) * 100 : 0;
      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };
      const setLeft = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.style.left = Math.max(0, Math.min(100, value)) + '%';
      };
      const lightRangeLabel = (label, start, end) => {
        if (!start || !end) return label + ': -';
        return label + ': ' + fmtTimeOnly(start) + '-' + fmtTimeOnly(end);
      };
      const setSegment = (id, start, end, label) => {
        const el = document.getElementById(id);
        if (!el || !start || !end) return;
        const left = Math.max(0, Math.min(100, positionOfDay(start)));
        const right = Math.max(0, Math.min(100, positionOfDay(end)));
        el.style.left = left + '%';
        el.style.width = Math.max(0, right - left) + '%';
        const tooltip = lightRangeLabel(label, start, end);
        el.title = tooltip;
        el.setAttribute('aria-label', tooltip);
      };
      setText('sunriseTime', fmtTimeOnly(sunrise));
      setText('sunsetTime', fmtTimeOnly(sunset));
      setText('dayLength', sunrise && sunset ? formatDuration(sunset - sunrise) : '-');
      setText('dawnTime', fmtTimeOnly(dawn));
      setText('duskTime', fmtTimeOnly(dusk));
      setLeft('dayNightDawnMarker', positionOfDay(dawn));
      setLeft('dayNightSunriseMarker', positionOfDay(sunrise));
      setLeft('dayNightSunsetMarker', positionOfDay(sunset));
      setLeft('dayNightDuskMarker', positionOfDay(dusk));
      setLeft('dayNightNowMarker', positionOfDay(date));
      setSegment('lightDaySegment', sunrise, sunset, t.light_day);
      setSegment('blueMorningSegment', dawn, sunrise, t.blue_hour + ' ' + t.light_morning);
      setSegment('goldenMorningSegment', sunrise, goldenMorningEnd, t.golden_hour + ' ' + t.light_morning);
      setSegment('goldenEveningSegment', goldenEveningStart, sunset, t.golden_hour + ' ' + t.light_evening);
      setSegment('blueEveningSegment', sunset, dusk, t.blue_hour + ' ' + t.light_evening);
      setLeft('lightHourNowMarker', positionOfDay(date));
    }

    function renderMoonNodes(date = selectedSolarDate()){
      const target = document.getElementById('moonNodesMap');
      const summary = document.getElementById('moonNodesSummary');
      if (!target) return;
      const node = moonNodeDistance(date);
      const season = eclipseSeasonInfo(date);
      const moon = computeMoon(date);
      const nearNew = Math.min(moon.frac, 1 - moon.frac);
      const nearFull = Math.abs(moon.frac - 0.5);
      const isSolarCase = nearNew <= nearFull;
      const phaseNear = Math.min(nearNew, nearFull);
      const nodeNear = node.distanceDays <= 4.5;
      const phaseAligned = phaseNear <= 0.08;
      const eclipseNear = node.distanceDays <= 1.8 && phaseNear <= 0.035;
      const canEclipse = nodeNear && phaseAligned;
      const geometryMessage = eclipseNear
        ? (isSolarCase
          ? (t.moon_nodes_geometry_exact_solar || 'Very close to solar-eclipse geometry today.')
          : (t.moon_nodes_geometry_exact_lunar || 'Very close to lunar-eclipse geometry today.'))
        : canEclipse
          ? (isSolarCase
            ? (t.moon_nodes_geometry_near_solar || 'Solar-eclipse geometry is near: new moon and node proximity line up closely.')
            : (t.moon_nodes_geometry_near_lunar || 'Lunar-eclipse geometry is near: full moon and node proximity line up closely.'))
          : season.active
            ? (t.moon_nodes_geometry_season_only || 'Eclipse season is active, but today the Moon is not aligned closely enough for an eclipse.')
            : (t.moon_nodes_not_aligned || 'Usually no eclipse: the Moon passes above or below the line');
      const statusClass = eclipseNear ? ' exact' : (canEclipse ? ' near' : (season.active ? ' active' : ''));
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
      seasonDot.setAttribute('fill', season.active ? '#2563eb' : '#64748b');
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
        rayLine.setAttribute('stroke', ray === 0 ? '#f59e0b' : '#fde68a');
        rayLine.setAttribute('stroke-width', ray === 0 ? '2.4' : '1.6');
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
        nodeMarker.setAttribute('fill', index === 0 ? '#0ea5e9' : '#1d4ed8');
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
      const shadowLeft = isSolarCase ? sideEarthX - 74 : sideEarthX + 2;

      const nodeZone = document.createElementNS(svgNS, 'rect');
      nodeZone.setAttribute('x', shadowLeft);
      nodeZone.setAttribute('y', 112);
      nodeZone.setAttribute('width', 72);
      nodeZone.setAttribute('height', 96);
      nodeZone.setAttribute('rx', 10);
      nodeZone.setAttribute('fill', isSolarCase ? 'rgba(251,191,36,.12)' : 'rgba(147,197,253,.16)');
      nodeZone.setAttribute('stroke', isSolarCase ? '#fcd34d' : '#bfdbfe');
      nodeZone.setAttribute('stroke-dasharray', '4 5');
      svg.appendChild(nodeZone);

      const shadowLabel = document.createElementNS(svgNS, 'text');
      shadowLabel.setAttribute('x', shadowLeft + 36);
      shadowLabel.setAttribute('y', 106);
      shadowLabel.setAttribute('class', 'moon-nodes-caption');
      shadowLabel.textContent = isSolarCase
        ? (t.moon_nodes_shadow_moon || 'Moon shadow zone')
        : (t.moon_nodes_shadow_earth || 'Earth shadow');
      svg.appendChild(shadowLabel);

      const sideSun = document.createElementNS(svgNS, 'circle');
      sideSun.setAttribute('cx', sideLeftX);
      sideSun.setAttribute('cy', sideBaseY);
      sideSun.setAttribute('r', 12);
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
        ray.setAttribute('stroke', offset === 0 ? '#f59e0b' : '#fde68a');
        ray.setAttribute('stroke-width', offset === 0 ? '2.2' : '1.5');
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
        mark.setAttribute('fill', index === 0 ? '#0ea5e9' : '#1d4ed8');
        svg.appendChild(mark);
      });

      const sideMoon = document.createElementNS(svgNS, 'circle');
      sideMoon.setAttribute('cx', sideMoonX);
      sideMoon.setAttribute('cy', sideMoonY);
      sideMoon.setAttribute('r', 8.5);
      sideMoon.setAttribute('fill', canEclipse ? '#f59e0b' : '#f8c84b');
      sideMoon.setAttribute('stroke', '#fff');
      sideMoon.setAttribute('stroke-width', '2');
      svg.appendChild(sideMoon);

      const alignmentLine = document.createElementNS(svgNS, 'line');
      alignmentLine.setAttribute('x1', sideLeftX);
      alignmentLine.setAttribute('y1', sideBaseY);
      alignmentLine.setAttribute('x2', sideMoonX);
      alignmentLine.setAttribute('y2', sideMoonY);
      alignmentLine.setAttribute('stroke', canEclipse ? '#f59e0b' : '#cbd5e1');
      alignmentLine.setAttribute('stroke-width', canEclipse ? '2.3' : '1.4');
      alignmentLine.setAttribute('stroke-dasharray', canEclipse ? 'none' : '4 5');
      svg.appendChild(alignmentLine);

      target.appendChild(svg);

      if (summary) {
        summary.innerHTML = `<div class="moon-nodes-status${statusClass}">${season.active ? (t.moon_nodes_active || 'Eclipse season active') : (t.moon_nodes_inactive || 'Outside eclipse season')}</div>`
          + `<div><strong>${t.moon_nodes_node_distance || 'Moon to node'}: </strong>${node.distanceDays.toFixed(1)} d</div>`
          + `<div><strong>${t.moon_nodes_season_distance || 'Sun to season center'}: </strong>${season.distanceToCenter.toFixed(1)} d</div>`
          + `<div><strong>${t.moon_nodes_next || 'Next season center'}: </strong>${fmtDateOnly(season.nextCenter)}</div>`
          + `<div><strong>${t.moon_nodes_geometry_status || 'Geometry today'}: </strong>${geometryMessage}</div>`;
      }
    }

    function renderConjunctionTimeline(date = selectedSolarDate()){
      const target = document.getElementById('conjunctionTimeline');
      const summary = document.getElementById('conjunctionSummary');
      if (!target) return;
      const windowDays = 60;
      const events = computeConjunctionEvents(date, windowDays);
      const width = 560;
      const height = 132;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      const axis = document.createElementNS(svgNS, 'line');
      axis.setAttribute('x1', 30);
      axis.setAttribute('y1', 70);
      axis.setAttribute('x2', width - 30);
      axis.setAttribute('y2', 70);
      axis.setAttribute('stroke', '#cbd5e1');
      axis.setAttribute('stroke-width', '2');
      svg.appendChild(axis);

      for (let monthOffset = -2; monthOffset <= 2; monthOffset++) {
        const x = 30 + ((monthOffset + 2) / 4) * (width - 60);
        const tick = document.createElementNS(svgNS, 'line');
        tick.setAttribute('x1', x);
        tick.setAttribute('y1', 58);
        tick.setAttribute('x2', x);
        tick.setAttribute('y2', 82);
        tick.setAttribute('stroke', monthOffset === 0 ? '#2563eb' : '#94a3b8');
        tick.setAttribute('stroke-width', monthOffset === 0 ? '2' : '1');
        svg.appendChild(tick);
        const monthDate = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', 98);
        label.setAttribute('class', 'meteor-month-label');
        label.textContent = monthShortLabel(monthDate.getMonth());
        svg.appendChild(label);
      }

      events.forEach((event, index) => {
        const x = 30 + ((event.offsetDays + windowDays) / (windowDays * 2)) * (width - 60);
        const y = index % 2 === 0 ? 48 : 28;
        const stem = document.createElementNS(svgNS, 'line');
        stem.setAttribute('x1', x);
        stem.setAttribute('y1', y + 6);
        stem.setAttribute('x2', x);
        stem.setAttribute('y2', 70);
        stem.setAttribute('stroke', '#bfdbfe');
        stem.setAttribute('stroke-width', '1.5');
        svg.appendChild(stem);
        const dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', Math.max(4, 8 - event.separation));
        dot.setAttribute('fill', '#2563eb');
        dot.setAttribute('stroke', '#fff');
        dot.setAttribute('stroke-width', '2');
        svg.appendChild(dot);
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y - 10);
        label.setAttribute('class', 'meteor-month-label');
        label.textContent = conjunctionPairLabel(event.a, event.b);
        svg.appendChild(label);
      });
      target.appendChild(svg);

      if (summary) {
        const next = events.find(event => event.date >= date);
        summary.innerHTML = next
          ? `<div><strong>${t.conjunction_next || 'Next conjunction'}: </strong>${fmtDateOnly(next.date)} · ${conjunctionPairLabel(next.a, next.b)}</div>`
            + `<div><strong>${t.conjunction_separation || 'Separation'}: </strong>${next.separation.toFixed(1)}°</div>`
            + `<div><strong>${t.conjunction_window || 'Window'}: </strong>${fmtDateOnly(new Date(date.getTime() - windowDays * 86400000))} - ${fmtDateOnly(new Date(date.getTime() + windowDays * 86400000))}</div>`
          : `<div>${t.conjunction_none || 'No close conjunction found in the current window.'}</div>`;
      }
    }

    function renderConstellationYear(date = selectedSolarDate()){
      const target = document.getElementById('constellationYearMap');
      const summary = document.getElementById('constellationYearSummary');
      if (!target) return;
      const items = phenomenaConfig.constellations || [];
      const size = 460;
      const center = size / 2;
      const radius = 160;
      const iconRadius = 54;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

      const ring = document.createElementNS(svgNS, 'circle');
      ring.setAttribute('cx', center);
      ring.setAttribute('cy', center);
      ring.setAttribute('r', radius);
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', '#dbeafe');
      ring.setAttribute('stroke-width', '28');
      svg.appendChild(ring);

      const innerRing = document.createElementNS(svgNS, 'circle');
      innerRing.setAttribute('cx', center);
      innerRing.setAttribute('cy', center);
      innerRing.setAttribute('r', 92);
      innerRing.setAttribute('fill', 'none');
      innerRing.setAttribute('stroke', '#e2e8f0');
      innerRing.setAttribute('stroke-width', '2');
      svg.appendChild(innerRing);

      items.forEach(item => {
        const fraction = (item.month - 1) / 12;
        const point = polarPoint(center, radius, fraction);
        const marker = document.createElementNS(svgNS, 'circle');
        marker.setAttribute('cx', point.x);
        marker.setAttribute('cy', point.y);
        marker.setAttribute('r', date.getMonth() + 1 === item.month ? 7 : 4.5);
        marker.setAttribute('fill', date.getMonth() + 1 === item.month ? '#2563eb' : '#94a3b8');
        svg.appendChild(marker);

        const monthPoint = polarPoint(center, 76, fraction);
        const monthLabel = document.createElementNS(svgNS, 'text');
        monthLabel.setAttribute('x', monthPoint.x);
        monthLabel.setAttribute('y', monthPoint.y);
        monthLabel.setAttribute('class', 'constellation-month-label');
        monthLabel.textContent = monthShortLabel(item.month - 1).replace('.', '');
        svg.appendChild(monthLabel);

        const miniPoint = polarPoint(center, radius + 44, fraction);
        const mini = document.createElementNS(svgNS, 'g');
        mini.setAttribute('transform', `translate(${miniPoint.x} ${miniPoint.y})`);

        const miniBg = document.createElementNS(svgNS, 'circle');
        miniBg.setAttribute('cx', 0);
        miniBg.setAttribute('cy', 0);
        miniBg.setAttribute('r', iconRadius / 2);
        miniBg.setAttribute('class', 'constellation-mini-ring');
        mini.appendChild(miniBg);

        (item.lines || []).forEach(([fromIndex, toIndex]) => {
          const from = item.stars && item.stars[fromIndex];
          const to = item.stars && item.stars[toIndex];
          if (!from || !to) return;
          const line = document.createElementNS(svgNS, 'line');
          line.setAttribute('x1', ((from[0] - 50) * 0.34).toFixed(1));
          line.setAttribute('y1', ((from[1] - 50) * 0.34).toFixed(1));
          line.setAttribute('x2', ((to[0] - 50) * 0.34).toFixed(1));
          line.setAttribute('y2', ((to[1] - 50) * 0.34).toFixed(1));
          line.setAttribute('class', 'constellation-mini-line');
          mini.appendChild(line);
        });

        (item.stars || []).forEach((star, starIndex) => {
          const starNode = document.createElementNS(svgNS, 'circle');
          starNode.setAttribute('cx', ((star[0] - 50) * 0.34).toFixed(1));
          starNode.setAttribute('cy', ((star[1] - 50) * 0.34).toFixed(1));
          starNode.setAttribute('r', date.getMonth() + 1 === item.month && starIndex === 0 ? '2.8' : '2.1');
          starNode.setAttribute('class', 'constellation-mini-star' + (date.getMonth() + 1 === item.month && starIndex === 0 ? ' current' : ''));
          mini.appendChild(starNode);
        });

        const namePoint = polarPoint(center, radius + 90, fraction);
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', namePoint.x);
        label.setAttribute('y', namePoint.y);
        label.setAttribute('class', 'constellation-name-label');
        label.textContent = item.name;
        svg.appendChild(label);
        svg.appendChild(mini);
      });

      const fraction = (dayOfYearLocal(date) - 1) / daysInYear(date.getFullYear());
      const todayPoint = polarPoint(center, radius - 20, fraction);
      const today = document.createElementNS(svgNS, 'circle');
      today.setAttribute('cx', todayPoint.x);
      today.setAttribute('cy', todayPoint.y);
      today.setAttribute('r', 8);
      today.setAttribute('fill', '#f59e0b');
      today.setAttribute('stroke', '#fff');
      today.setAttribute('stroke-width', '2');
      svg.appendChild(today);

      const sunCore = document.createElementNS(svgNS, 'circle');
      sunCore.setAttribute('cx', center);
      sunCore.setAttribute('cy', center);
      sunCore.setAttribute('r', 18);
      sunCore.setAttribute('fill', '#fbbf24');
      sunCore.setAttribute('stroke', '#f59e0b');
      sunCore.setAttribute('stroke-width', '2');
      svg.appendChild(sunCore);

      target.appendChild(svg);

      const current = items.find(item => item.month === date.getMonth() + 1);
      if (summary) {
        summary.innerHTML = `<div><strong>${t.constellation_year_current || 'Current month focus'}: </strong>${current ? current.name : '-'}</div>`
          + `<div>${current ? ((current.highlight && (current.highlight[lang] || current.highlight.en)) || '') : ''}</div>`;
      }
    }

    function retrogradePathSvg(key, date = selectedSolarDate()){
      const width = 260;
      const height = 74;
      const samples = [];
      for (let offset = -90; offset <= 90; offset += 2) {
        const sampleDate = new Date(date.getTime() + offset * 86400000);
        samples.push({
          lon: geocentricLongitude(key, sampleDate),
          lat: geocentricLatitude(key, sampleDate),
          offset
        });
      }
      const unwrappedLongitude = unwrapLongitudeSeries(samples.map(sample => sample.lon));
      const latitudes = samples.map(sample => sample.lat);
      const minLon = Math.min(...unwrappedLongitude);
      const maxLon = Math.max(...unwrappedLongitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const lonSpan = Math.max(0.4, maxLon - minLon);
      const latSpan = Math.max(0.6, maxLat - minLat);
      const points = samples.map((sample, index) => {
        const x = 10 + ((unwrappedLongitude[index] - minLon) / lonSpan) * (width - 20);
        const y = height - 10 - ((sample.lat - minLat) / latSpan) * (height - 20);
        return [x, y, sample.offset];
      });
      const path = points.map((point, index) => (index ? 'L' : 'M') + point[0].toFixed(1) + ' ' + point[1].toFixed(1)).join(' ');
      const stationMarkers = [];
      for (let offset = -89; offset <= 89; offset++) {
        const left = apparentDailyMotion(key, new Date(date.getTime() + offset * 86400000));
        const right = apparentDailyMotion(key, new Date(date.getTime() + (offset + 1) * 86400000));
        if ((left < 0 && right >= 0) || (left > 0 && right <= 0)) {
          const index = Math.round((offset + 90) / 2);
          if (points[index]) stationMarkers.push(points[index]);
        }
      }
      const arrowPoint = points[Math.max(1, points.length - 6)];
      const currentPoint = points[Math.round((points.length - 1) / 2)];
      return { width, height, path, stationMarkers, currentPoint, arrowPoint };
    }

    function renderRetrogradePhases(date = selectedSolarDate()){
      const panel = document.getElementById('retrogradePanel');
      if (!panel) return;
      panel.innerHTML = '';
      const bodies = (phenomenaConfig.retrogradeBodies || ['mercury','venus','mars','jupiter','saturn']).slice(0, 7);
      bodies.forEach(key => {
        const motion = apparentDailyMotion(key, date);
        const isRetro = motion < 0;
        const station = findNearestStationDate(key, date);
        const row = document.createElement('div');
        row.className = 'retro-row';
        const speedPct = clamp01(Math.abs(motion) / 1.4);
        const path = retrogradePathSvg(key, date);
        row.innerHTML = `<div class="retro-head"><span>${bodyDisplayName(key)}</span><span class="retro-badge${isRetro ? ' retro' : ''}">${isRetro ? (t.retrograde_retrograde || 'Retrograde') : (t.retrograde_direct || 'Direct')}</span></div>`
          + `<div class="retro-path"><svg viewBox="0 0 ${path.width} ${path.height}" aria-hidden="true"><defs><marker id="retroArrow-${key}" markerWidth="5" markerHeight="5" refX="4.4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#2563eb"></path></marker></defs><path d="${path.path}" fill="none" stroke="#cbd5e1" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"></path><path d="${path.path}" fill="none" stroke="#2563eb" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#retroArrow-${key})"></path>${path.stationMarkers.map(point => `<circle cx="${point[0].toFixed(1)}" cy="${point[1].toFixed(1)}" r="3.2" fill="#f59e0b" stroke="#fff" stroke-width="1.2"></circle>`).join('')}${path.currentPoint ? `<circle cx="${path.currentPoint[0].toFixed(1)}" cy="${path.currentPoint[1].toFixed(1)}" r="2.7" fill="#1d4ed8" stroke="#fff" stroke-width="1"></circle>` : ''}</svg></div>`
          + `<div class="retro-meter"><span class="retro-meter-fill" style="width:${Math.max(12, speedPct * 100)}%"></span></div>`
          + `<div class="retro-copy"><span>${fmtDegrees(motion)}/d</span><span>${t.retrograde_station || 'Nearest station'}: ${station ? fmtDateOnly(station.date) : (t.retrograde_none || 'No nearby station')}</span></div>`;
        panel.appendChild(row);
      });
    }

    function phaseDiscSvg(illumination, evening, color){
      const r = 38;
      const cx = 48;
      const cy = 48;
      const k = clamp01(illumination / 100);
      const terminatorRx = Math.max(1.5, Math.abs(2 * k - 1) * r);
      const sweepOuter = evening ? 1 : 0;
      const sweepInner = evening ? 0 : 1;
      const path = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${sweepOuter} ${cx} ${cy + r} A ${terminatorRx} ${r} 0 0 ${sweepInner} ${cx} ${cy - r} Z`;
      return `<svg class="planet-phase-svg" viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1e293b" stroke="#94a3b8" stroke-width="2"></circle>
        <path d="${path}" fill="${color}"></path>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="1.5"></circle>
      </svg>`;
    }

    function renderInnerPlanetPhases(date = selectedSolarDate()){
      const panel = document.getElementById('innerPhasesPanel');
      if (!panel) return;
      panel.innerHTML = '';
      (phenomenaConfig.planetPhaseBodies || ['mercury','venus']).forEach(key => {
        const info = planetIlluminationData(key, date);
        const card = document.createElement('div');
        card.className = 'planet-phase-card';
        const color = key === 'venus' ? '#fde68a' : '#fbbf24';
        card.innerHTML = `<div class="planet-phase-name">${bodyDisplayName(key)}</div>`
          + phaseDiscSvg(info.illumination, info.evening, color)
          + `<div>${info.evening ? (t.phase_evening || 'Evening star') : (t.phase_morning || 'Morning star')}</div>`
          + `<div class="planet-phase-meta">`
          + `<div><strong>${t.phase_illumination || 'Illumination'}:</strong> ${info.illumination}%</div>`
          + `<div><strong>${t.phase_elongation || 'Elongation'}:</strong> ${Math.abs(info.elongation).toFixed(1)}°</div>`
          + `<div><strong>AU:</strong> ${info.distanceAu.toFixed(2)}</div>`
          + `</div>`;
        panel.appendChild(card);
      });
    }

    let auroraState = {
      fetchedAt: 0,
      lastStamp: '',
      lastKp: null,
      pending: null
    };

    function auroraBandForKp(kp){
      if (!(kp >= 0)) return 'low';
      if (kp >= 7) return 'extreme';
      if (kp >= 6) return 'high';
      if (kp >= 5) return 'medium';
      return 'low';
    }

    function auroraBandLabel(band){
      if (band === 'extreme') return t.aurora_extreme || 'Very high chance';
      if (band === 'high') return t.aurora_high || 'High chance';
      if (band === 'medium') return t.aurora_medium || 'Moderate chance';
      return t.aurora_low || 'Low chance';
    }

    function auroraGermanyCopy(band){
      if (band === 'extreme') return t.aurora_germany_extreme || 'Strong event; aurora may be visible across large parts of Germany.';
      if (band === 'high') return t.aurora_germany_high || 'Good chance in northern Germany; possible farther south.';
      if (band === 'medium') return t.aurora_germany_medium || 'Possible in northern Germany if the sky is dark and clear.';
      return t.aurora_germany_low || 'Mostly too weak for Germany; perhaps only far northern horizon.';
    }

    function normalizeAuroraSample(item){
      if (!item) return null;
      if (Array.isArray(item)) {
        if (item.length < 2 || item[0] === 'time_tag') return null;
        const kp = Number(item[1]);
        if (!Number.isFinite(kp)) return null;
        return {
          timeTag: String(item[0]),
          kp
        };
      }
      const kp = Number(item.kp_index ?? item.kp ?? item.estimated_kp ?? item.KP);
      const timeTag = item.time_tag || item.timeTag || item.observed_time || item.date || item.timestamp;
      if (!Number.isFinite(kp) || !timeTag) return null;
      return {
        timeTag: String(timeTag),
        kp
      };
      }

    function setAuroraPanelState(options = {}){
      const status = document.getElementById('auroraStatus');
      const meta = document.getElementById('auroraMeta');
      if (!status || !meta) return;
      const {
        loading = false,
        band = 'low',
        title = '',
        kp = null,
        updatedAt = null,
        sourceLabel = 'NOAA SWPC',
        detail = ''
      } = options;
      status.className = 'aurora-badge' + (loading ? '' : ' ' + band);
      status.textContent = title || (loading ? (t.aurora_loading || 'Loading aurora data...') : auroraBandLabel(band));
      const lines = [];
      if (Number.isFinite(kp)) lines.push('<strong>' + (t.aurora_kp || 'Planetary Kp') + ':</strong> ' + kp.toFixed(1));
      if (updatedAt instanceof Date && !Number.isNaN(updatedAt.getTime())) lines.push('<strong>' + (t.aurora_updated || 'Updated') + ':</strong> ' + fmtDateOnly(updatedAt) + ' ' + fmtTimeOnly(updatedAt));
      lines.push('<strong>' + (t.aurora_source || 'Source') + ':</strong> ' + sourceLabel);
      if (detail) lines.push(detail);
      meta.innerHTML = lines.map(line => '<div>' + line + '</div>').join('');
    }

    function parseAuroraPayload(payload){
      if (!payload) return null;
      if (Array.isArray(payload)) {
        const candidates = payload.map(normalizeAuroraSample).filter(Boolean);
        return candidates.length ? candidates[candidates.length - 1] : null;
      }
      if (Array.isArray(payload.data)) {
        const candidates = payload.data.map(normalizeAuroraSample).filter(Boolean);
        return candidates.length ? candidates[candidates.length - 1] : null;
      }
      return normalizeAuroraSample(payload);
    }

    function loadAuroraChance(force = false){
      const panel = document.getElementById('auroraPanel');
      if (!panel) return Promise.resolve(null);
      const now = Date.now();
      if (!force && auroraState.lastKp !== null && now - auroraState.fetchedAt < 20 * 60 * 1000) {
        const band = auroraBandForKp(auroraState.lastKp);
        setAuroraPanelState({
          band,
          title: auroraBandLabel(band),
          kp: auroraState.lastKp,
          updatedAt: auroraState.lastStamp ? new Date(auroraState.lastStamp) : null,
          detail: auroraGermanyCopy(band)
        });
        return Promise.resolve({ kp: auroraState.lastKp, timeTag: auroraState.lastStamp });
      }
      if (auroraState.pending) return auroraState.pending;

      setAuroraPanelState({ loading:true });
      const sources = [
        'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
        'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'
      ];

      auroraState.pending = (async () => {
        let sample = null;
        for (const source of sources) {
          try {
            const response = await fetch(source, { cache:'no-store' });
            if (!response.ok) continue;
            const payload = await response.json();
            sample = parseAuroraPayload(payload);
            if (sample) break;
          } catch (error) {}
        }

        auroraState.pending = null;
        if (!sample) {
          setAuroraPanelState({
            band: 'low',
            title: t.aurora_unavailable || 'Aurora data currently unavailable',
            detail: auroraGermanyCopy('low')
          });
          return null;
        }

        auroraState.fetchedAt = Date.now();
        auroraState.lastStamp = sample.timeTag;
        auroraState.lastKp = sample.kp;
        const band = auroraBandForKp(sample.kp);
        setAuroraPanelState({
          band,
          title: auroraBandLabel(band),
          kp: sample.kp,
          updatedAt: new Date(sample.timeTag),
          detail: auroraGermanyCopy(band)
        });
        return sample;
      })();

      return auroraState.pending;
    }

    function nightVisibilitySegments(key, date = selectedSolarDate()){
      const location = selectedLocation();
      const dawn = solarEventUtc(date, location.latitude, location.longitude, 96, true);
      const dusk = solarEventUtc(date, location.latitude, location.longitude, 96, false);
      if (!dawn || !dusk) return { durationHours:0, segments:[], bestTime:null, dusk:null, dawn:null };
      const start = dusk.getTime();
      const end = dawn.getTime() + 86400000;
      const durationHours = (end - start) / 3600000;
      const elongation = solarElongationForKey(key, date);
      const transitHour = ((12 + elongation / 15) % 24 + 24) % 24;
      const riseHour = ((transitHour - 6) % 24 + 24) % 24;
      const setHour = ((transitHour + 6) % 24 + 24) % 24;
      const isUp = hour => riseHour <= setHour ? (hour >= riseHour && hour <= setHour) : (hour >= riseHour || hour <= setHour);
      const sampleMinutes = 20;
      const samples = [];
      for (let time = start; time <= end; time += sampleMinutes * 60000) {
        const hour = (((time / 3600000) % 24) + 24) % 24;
        samples.push({ time, up:isUp(hour) });
      }
      const segments = [];
      let current = null;
      samples.forEach(sample => {
        if (sample.up && !current) current = { start:sample.time, end:sample.time };
        if (sample.up && current) current.end = sample.time;
        if (!sample.up && current) {
          segments.push(current);
          current = null;
        }
      });
      if (current) segments.push(current);
      const longest = segments.slice().sort((a, b) => (b.end - b.start) - (a.end - a.start))[0] || null;
      const bestTime = longest ? new Date((longest.start + longest.end) / 2) : null;
      return { durationHours, segments, bestTime, dusk, dawn };
    }

    function renderNightVisibility(date = selectedSolarDate()){
      const panel = document.getElementById('nightVisibilityPanel');
      if (!panel) return;
      panel.innerHTML = '';
      const location = selectedLocation();
      const reference = nightVisibilitySegments('jupiter', date);
      if (!reference.durationHours) return;
      const durationHours = reference.durationHours;
      const header = document.createElement('div');
      header.className = 'night-visibility-header';
      header.innerHTML = `<span class="night-visibility-place">${location.name}</span><div class="night-visibility-scale"><span class="left">${fmtTimeOnly(reference.dusk)}</span><span style="left:50%">00:00</span><span class="right">${fmtTimeOnly(reference.dawn)}</span></div>`;
      panel.appendChild(header);
      ['mercury','venus','mars','jupiter','saturn'].forEach(key => {
        const info = nightVisibilitySegments(key, date);
        const row = document.createElement('div');
        row.className = 'night-row';
        const track = document.createElement('div');
        track.className = 'night-track';
        if (!info.segments.length) {
          const empty = document.createElement('div');
          empty.className = 'night-empty';
          empty.textContent = t.visibility_night_empty || 'Not above the horizon during the dark part of the night';
          track.appendChild(empty);
        } else {
          info.segments.forEach(segment => {
            const left = ((segment.start - info.dusk.getTime()) / 3600000) / durationHours * 100;
            const width = ((segment.end - segment.start) / 3600000) / durationHours * 100;
            const bar = document.createElement('div');
            bar.className = 'night-bar';
            bar.style.left = Math.max(0, left) + '%';
            bar.style.width = Math.max(2, width) + '%';
            track.appendChild(bar);
          });
        }
        row.innerHTML = `<div class="night-name">${bodyDisplayName(key)}</div>`;
        row.appendChild(track);
        panel.appendChild(row);
        const best = document.createElement('div');
        best.className = 'night-best' + (info.bestTime ? '' : ' empty');
        best.style.gridColumn = '2';
        best.textContent = info.bestTime
          ? `${t.visibility_best || 'Best around'} ${fmtTimeOnly(info.bestTime)}`
          : (t.visibility_night_empty || 'Not above the horizon during the dark part of the night');
        panel.appendChild(best);
      });
    }

    function renderSatellites(date = selectedSolarDate()){
      const target = document.getElementById('satelliteMap');
      const summary = document.getElementById('satelliteSummary');
      if (!target) return;
      const size = 420;
      const center = size / 2;
      const maxRadius = 165;
      const earthRadius = 34;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      const earth = document.createElementNS(svgNS, 'circle');
      earth.setAttribute('cx', center);
      earth.setAttribute('cy', center);
      earth.setAttribute('r', earthRadius);
      earth.setAttribute('fill', '#2586d7');
      svg.appendChild(earth);

      (phenomenaConfig.satellites || []).forEach((sat, index) => {
        const radius = earthRadius + 28 + index * 18;
        const ry = radius * Math.max(0.2, Math.cos((sat.inclinationDeg || 0) * Math.PI / 180));
        const orbit = document.createElementNS(svgNS, 'ellipse');
        orbit.setAttribute('cx', center);
        orbit.setAttribute('cy', center);
        orbit.setAttribute('rx', Math.min(maxRadius, radius));
        orbit.setAttribute('ry', Math.max(20, Math.abs(ry)));
        orbit.setAttribute('fill', 'none');
        orbit.setAttribute('stroke', '#cbd5e1');
        orbit.setAttribute('stroke-width', '1.4');
        orbit.setAttribute('transform', `rotate(${sat.raanDeg || 0} ${center} ${center})`);
        svg.appendChild(orbit);

        const elapsedMin = (date.getTime() - new Date(sat.epoch).getTime()) / 60000;
        const phase = (((sat.phase0 || 0) + elapsedMin / sat.periodMin) % 1 + 1) % 1;
        const angle = phase * Math.PI * 2;
        const x0 = Math.min(maxRadius, radius) * Math.cos(angle);
        const y0 = Math.max(20, Math.abs(ry)) * Math.sin(angle);
        const raan = (sat.raanDeg || 0) * Math.PI / 180;
        const x = center + x0 * Math.cos(raan) - y0 * Math.sin(raan);
        const y = center + x0 * Math.sin(raan) + y0 * Math.cos(raan);
        const marker = document.createElementNS(svgNS, 'circle');
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', 6);
        marker.setAttribute('fill', sat.color || '#2563eb');
        marker.setAttribute('stroke', '#fff');
        marker.setAttribute('stroke-width', '2');
        svg.appendChild(marker);

        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', Math.max(28, Math.min(size - 28, x + (x >= center ? 10 : -10))));
        label.setAttribute('y', Math.max(18, Math.min(size - 18, y + (y >= center ? 12 : -12))));
        label.setAttribute('text-anchor', x >= center ? 'start' : 'end');
        label.setAttribute('class', 'spacecraft-label');
        label.textContent = sat.name;
        svg.appendChild(label);
      });
      target.appendChild(svg);
      if (summary) {
        summary.innerHTML = `<div>${t.satellites_note || 'Approximate orbit positions, not live TLE tracking'}</div>`
          + `<div class="satellite-summary-grid">`
          + (phenomenaConfig.satellites || []).map(sat =>
            `<div><strong>${sat.name}</strong><br>${t.satellites_altitude || 'Altitude'}: ${sat.altitudeKm} km<br>${t.satellites_period || 'Period'}: ${sat.periodMin.toFixed(1)} min<br>${t.satellites_inclination || 'Inclination'}: ${sat.inclinationDeg}°</div>`
          ).join('')
          + `</div>`;
      }
    }

    let masonryFrame = 0;
    let masonryObserver = null;
    let masonryAfterLayoutCallbacks = [];
    let persistentViewportAnchor = null;

    function visibleGridCards(){
      const grid = document.querySelector('.grid');
      if (!grid) return [];
      return Array.from(grid.querySelectorAll('.display-container'))
        .filter(card => getComputedStyle(card).display !== 'none');
    }

    function updateMasonryLayout(){
      debugDateUi('masonry-start');
      masonryFrame = 0;
      const grid = document.querySelector('.grid');
      if (!grid) return;
      const cards = visibleGridCards();
      cards.forEach(card => {
        card.style.gridRowEnd = '';
      });

      if (window.innerWidth <= 760) return;

      const style = getComputedStyle(grid);
      const rowHeight = parseFloat(style.gridAutoRows) || 8;
      const rowGap = parseFloat(style.rowGap) || 20;
      cards.forEach(card => {
        const height = card.getBoundingClientRect().height;
        const span = Math.max(1, Math.ceil((height + rowGap) / (rowHeight + rowGap)));
        card.style.gridRowEnd = 'span ' + span;
      });
      if (persistentViewportAnchor?.anchor) {
        debugDateUi('persistent-anchor-before', {
          anchorId: persistentViewportAnchor.anchor?.element?.dataset?.helpKey || persistentViewportAnchor.anchor?.element?.id || 'none',
          remaining: persistentViewportAnchor.remaining
        });
        restoreViewportAnchor(persistentViewportAnchor.anchor);
        persistentViewportAnchor.remaining -= 1;
        debugDateUi('persistent-anchor-after', {
          anchorId: persistentViewportAnchor.anchor?.element?.dataset?.helpKey || persistentViewportAnchor.anchor?.element?.id || 'none',
          remaining: persistentViewportAnchor.remaining
        });
        if (persistentViewportAnchor.remaining <= 0) {
          persistentViewportAnchor = null;
        }
      }
      debugDateUi('masonry-end', { cards: cards.length });
      const callbacks = masonryAfterLayoutCallbacks.splice(0, masonryAfterLayoutCallbacks.length);
      callbacks.forEach(callback => {
        try { callback(); } catch (error) {}
      });
    }

    function scheduleMasonryLayout(afterLayout){
      if (typeof afterLayout === 'function') {
        masonryAfterLayoutCallbacks.push(afterLayout);
      }
      if (masonryFrame) return;
      debugDateUi('schedule-masonry', { callbacks: masonryAfterLayoutCallbacks.length });
      masonryFrame = requestAnimationFrame(updateMasonryLayout);
    }

    function captureViewportAnchor(){
      const overlayBottom = document.querySelector('.overlay-controls')?.getBoundingClientRect().bottom || 0;
      const threshold = overlayBottom + 16;
      const anchor = visibleGridCards().find(card => {
        const rect = card.getBoundingClientRect();
        return rect.bottom > threshold;
      });
      if (!anchor) return null;
      return { element:anchor, top:anchor.getBoundingClientRect().top };
    }

    function restoreViewportAnchor(anchor){
      if (!anchor || !anchor.element || !anchor.element.isConnected) return;
      const delta = anchor.element.getBoundingClientRect().top - anchor.top;
      if (Math.abs(delta) > 0.5) {
        window.scrollBy(0, delta);
      }
    }

    function debugDateUi(label, extra = {}){
      const active = document.activeElement;
      const activeId = active ? (active.id || active.tagName || 'unknown') : 'none';
      console.log('[planetenuhr][date-ui]', label, {
        scrollY: Math.round(window.scrollY),
        activeElement: activeId,
        solarDayOffset,
        ...extra
      });
    }

    function refreshDateDrivenTilesWithAnchor(){
      const anchor = captureViewportAnchor();
      debugDateUi('before-refresh', {
        anchorId: anchor?.element?.dataset?.helpKey || anchor?.element?.id || 'none',
        anchorTop: anchor ? Math.round(anchor.top) : null
      });
      persistentViewportAnchor = anchor ? { anchor, remaining:3 } : null;
      refreshDateDrivenTiles();
      if (anchor) {
        scheduleMasonryLayout(() => {
          debugDateUi('before-anchor-restore', {
            anchorId: anchor?.element?.dataset?.helpKey || anchor?.element?.id || 'none',
            currentAnchorTop: Math.round(anchor.element.getBoundingClientRect().top),
            originalAnchorTop: Math.round(anchor.top)
          });
          restoreViewportAnchor(anchor);
          debugDateUi('after-anchor-restore', {
            anchorId: anchor?.element?.dataset?.helpKey || anchor?.element?.id || 'none',
            finalAnchorTop: Math.round(anchor.element.getBoundingClientRect().top)
          });
        });
      } else {
        debugDateUi('after-refresh-no-anchor');
      }
    }

    function initMasonryLayout(){
      const cards = visibleGridCards();
      if ('ResizeObserver' in window) {
        masonryObserver = new ResizeObserver(scheduleMasonryLayout);
        cards.forEach(card => masonryObserver.observe(card));
      }
      window.addEventListener('resize', scheduleMasonryLayout);
      scheduleMasonryLayout();
    }

    function calendarEvents(){
      return (calendarEventsByLang[lang] || calendarEventsByLang.en || [])
        .map(event => ({ ...event, dateObj:new Date(event.date + 'T00:00:00') }))
        .sort((a,b) => a.dateObj - b.dateObj);
    }

    function calendarCategoryLabel(category){
      return t['calendar_filter_' + category] || category;
    }

    function filteredCalendarEvents(){
      const today = new Date();
      today.setHours(0,0,0,0);
      return calendarEvents().filter(event => {
        const matchesFilter = activeCalendarFilter === 'all' || event.category === activeCalendarFilter;
        const matchesDate = document.getElementById('calendarShowPast')?.checked || event.dateObj >= today;
        return matchesFilter && matchesDate;
      });
    }

    function renderCalendar(){
      const timeline = document.getElementById('calendarTimeline');
      const nextEl = document.getElementById('calendarNext');
      const showAllButton = document.getElementById('btnCalendarShowAll');
      if (!timeline) return;

      const allFiltered = filteredCalendarEvents();
      const visible = showAllCalendarEvents ? allFiltered : allFiltered.slice(0, 6);
      timeline.innerHTML = '';

      const next = calendarEvents().find(event => {
        const today = new Date();
        today.setHours(0,0,0,0);
        return (activeCalendarFilter === 'all' || event.category === activeCalendarFilter) && event.dateObj >= today;
      });
      if (nextEl) {
        nextEl.textContent = next
          ? t.calendar_next_event + ': ' + fmtDateOnly(next.dateObj) + ' - ' + next.title
          : t.calendar_next_event + ': -';
      }

      if (!visible.length) {
        const empty = document.createElement('div');
        empty.className = 'calendar-note';
        empty.textContent = t.calendar_empty;
        timeline.appendChild(empty);
      }

      visible.forEach(event => {
        const item = document.createElement('article');
        item.className = 'calendar-item category-' + event.category;
        const dot = document.createElement('span');
        dot.className = 'calendar-dot';
        const content = document.createElement('div');

        const date = document.createElement('div');
        date.className = 'calendar-date';
        date.textContent = fmtDateOnly(event.dateObj);
        const title = document.createElement('div');
        title.className = 'calendar-title';
        title.textContent = event.title;
        const meta = document.createElement('div');
        meta.className = 'calendar-meta';
        meta.textContent = calendarCategoryLabel(event.category) + ' · ' + t.calendar_visibility_label + ': ' + event.visibility;
        const note = document.createElement('div');
        note.className = 'calendar-note';
        note.textContent = event.note;

        content.append(date, title, meta, note);
        item.append(dot, content);
        timeline.appendChild(item);
      });

      if (showAllButton) {
        showAllButton.hidden = allFiltered.length <= 6;
        showAllButton.textContent = showAllCalendarEvents ? t.calendar_show_less : t.calendar_show_all;
      }
      document.querySelectorAll('[data-calendar-filter]').forEach(button => {
        button.classList.toggle('active', button.dataset.calendarFilter === activeCalendarFilter);
      });
      scheduleMasonryLayout();
    }

    function keepScrollPosition(callback){
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      callback();
      requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
    }

    function setCalendarFilter(filter, preserveScroll = false){
      activeCalendarFilter = filter;
      showAllCalendarEvents = false;
      if (preserveScroll) {
        keepScrollPosition(renderCalendar);
      } else {
        renderCalendar();
      }
    }

    function toggleCalendarShowAll(){
      showAllCalendarEvents = !showAllCalendarEvents;
      renderCalendar();
    }

    function localDateKey(date){
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    function blueskyPostUrl(post, fallbackProfileUrl){
      const handle = post.author?.handle || fallbackProfileUrl?.split('/').pop() || '';
      const rkey = post.uri?.split('/').pop();
      if (!handle || !rkey) return fallbackProfileUrl || '#';
      return 'https://bsky.app/profile/' + encodeURIComponent(handle) + '/post/' + encodeURIComponent(rkey);
    }

    function postImages(post){
      const images = post.embed?.images || [];
      return images
        .map(image => ({
          src: image.fullsize || image.thumb,
          alt: image.alt || ''
        }))
        .filter(image => image.src);
    }

    function isTodayPost(post){
      const createdAt = new Date(post.record?.createdAt || post.indexedAt || 0);
      return localDateKey(createdAt) === localDateKey(new Date());
    }

    async function fetchBlueskyImagePosts(feed){
      const url = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor='
        + encodeURIComponent(feed.handle) + '&limit=20&filter=posts_no_replies';
      const response = await fetch(url, { headers:{ accept:'application/json' } });
      if (!response.ok) throw new Error('Bluesky HTTP ' + response.status);
      const data = await response.json();
      return (data.feed || [])
        .map(item => item.post)
        .filter(Boolean)
        .map(post => ({
          feed,
          post,
          images:postImages(post),
          createdAt:new Date(post.record?.createdAt || post.indexedAt || 0)
        }))
        .filter(item => item.images.length)
        .sort((a,b) => b.createdAt - a.createdAt);
    }

    function createBlueskyFeedMessage(feed, message){
      const item = document.createElement('article');
      item.className = 'bsky-feed-item';
      const title = document.createElement('div');
      title.className = 'bsky-author-name';
      title.textContent = feed.label || feed.handle;
      const note = document.createElement('div');
      note.className = 'bsky-status';
      note.textContent = message;
      item.append(title, note);
      return item;
    }

    function createBlueskyPostElement(item, isFallback){
      const post = item.post;
      const author = post.author || {};
      const date = item.createdAt;
      const feedItem = document.createElement('article');
      feedItem.className = 'bsky-feed-item';

      const authorRow = document.createElement('div');
      authorRow.className = 'bsky-author';

      const avatar = author.avatar
        ? document.createElement('img')
        : document.createElement('div');
      avatar.className = 'bsky-avatar' + (author.avatar ? '' : ' bsky-avatar-placeholder');
      if (author.avatar) {
        avatar.alt = author.displayName || author.handle || item.feed.label || '';
        avatar.loading = 'lazy';
        avatar.src = author.avatar;
      } else {
        avatar.textContent = (author.displayName || item.feed.label || author.handle || '?').trim().charAt(0);
      }

      const authorText = document.createElement('div');
      const authorName = document.createElement('div');
      authorName.className = 'bsky-author-name';
      authorName.textContent = author.displayName || item.feed.label || author.handle || item.feed.handle;
      const postDate = document.createElement('div');
      postDate.className = 'bsky-date';
      postDate.textContent = formatDateStamp(date) + ' ' + date.toLocaleTimeString(lang, {
        hour:'2-digit',
        minute:'2-digit',
        hour12:false
      });
      authorText.append(authorName, postDate);
      authorRow.append(avatar, authorText);

      if (isFallback) {
        const fallback = document.createElement('div');
        fallback.className = 'bsky-account-note';
        fallback.textContent = t.bsky_no_today || 'No image post today; showing the latest image post.';
        feedItem.appendChild(authorRow);
        feedItem.appendChild(fallback);
      } else {
        feedItem.appendChild(authorRow);
      }

      const text = document.createElement('p');
      text.className = 'bsky-text';
      text.textContent = post.record?.text || '';

      const imageGrid = document.createElement('div');
      imageGrid.className = 'bsky-images' + (item.images.length === 1 ? ' single' : '');
      item.images.slice(0, 4).forEach(image => {
        const img = document.createElement('img');
        img.className = 'bsky-image';
        img.loading = 'lazy';
        img.src = image.src;
        img.alt = image.alt || text.textContent || authorName.textContent;
        imageGrid.appendChild(img);
      });

      const link = document.createElement('a');
      link.className = 'bsky-link';
      link.href = blueskyPostUrl(post, item.feed.profileUrl);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = t.bsky_open || 'Open on Bluesky';

      feedItem.append(text, imageGrid, link);
      return feedItem;
    }

    function chooseBlueskyFeedItem(items){
      const todayItem = items.find(item => isTodayPost(item.post));
      return {
        item: todayItem || items[0],
        isFallback: !todayItem
      };
    }

    async function loadBlueskyFeed(){
      const card = document.getElementById('bskyCard');
      const status = document.getElementById('bskyStatus');
      if (!card || !status) return;
      if (location.protocol === 'file:' || !bskyFeeds.length) {
        card.hidden = true;
        return;
      }

      card.hidden = false;
      status.hidden = false;
      status.textContent = t.bsky_loading || 'Loading Bluesky post...';

      const target = document.getElementById('bskyPost');
      if (!target) return;
      target.innerHTML = '';
      target.hidden = true;

      const results = await Promise.allSettled(bskyFeeds.map(fetchBlueskyImagePosts));
      results.forEach((result, index) => {
        const feed = bskyFeeds[index];
        if (result.status !== 'fulfilled') {
          target.appendChild(createBlueskyFeedMessage(feed, t.bsky_error || 'Could not load Bluesky post.'));
          return;
        }
        if (!result.value.length) {
          target.appendChild(createBlueskyFeedMessage(feed, t.bsky_empty || 'No image post found.'));
          return;
        }
        const choice = chooseBlueskyFeedItem(result.value);
        target.appendChild(createBlueskyPostElement(choice.item, choice.isFallback));
      });

      status.hidden = true;
      target.hidden = false;
      scheduleMasonryLayout();
    }

    // Time update (runs every second)
    function updateTime(){
      const now = new Date();
      const tz  = document.getElementById('timezone').value;
      const tOpt = { hour:'2-digit', minute:'2-digit', second:'2-digit' };
      if (tz !== 'local') tOpt.timeZone = tz;
      document.getElementById('time').textContent = now.toLocaleTimeString(lang, tOpt);

      const dOpt = {
        timeZone: tz !== 'local' ? tz : undefined
      };
      document.getElementById('date').textContent =
        formatDateStamp(now, dOpt.timeZone);
    }

    let solarDayOffset = 0;

    function selectedSolarDate(){
      return new Date(Date.now() + solarDayOffset * 86400000);
    }

    function selectedLocation(){
      return locations.find(location => location.key === selectedLocationKey) || locations[0];
    }

    function updateControlDateReadout(){
      const readout = document.getElementById('controlDateReadout');
      if (readout) readout.textContent = formatDateStamp(selectedSolarDate());
    }

    function populateLocationSelector(){
      const selector = document.getElementById('locationSelector');
      if (!selector) return;
      selector.innerHTML = '';
      locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location.key;
        option.textContent = location.name;
        selector.appendChild(option);
      });
      selector.value = selectedLocationKey;
    }

    function refreshDateDrivenTiles(){
      const date = selectedSolarDate();
      updateControlDateReadout();
      renderSolarSystem(date);
      renderMoonNodes(date);
      renderConjunctionTimeline(date);
      renderMeteorStreams(date);
      renderConstellationOfMonth(date);
      renderConstellationYear(date);
      renderSeasonAxis(date);
      renderRetrogradePhases(date);
      renderInnerPlanetPhases(date);
      renderSunlight(date);
      renderVisibility(date);
      renderSatellites(date);
      renderEclipseGeometry(date);
      scheduleMasonryLayout();
    }

    // Rebuilds the time-sensitive astronomy panels.
    function updateInfrequent() {
      renderMoon();
      renderEarthMoon();
      renderSmallBodies();
      renderSpacecraft();
      refreshDateDrivenTiles();
      scheduleMasonryLayout();
    }

    function refreshDynamicTiles(){
      updateTime();
      updateInfrequent();
      renderCalendar();
      loadAuroraChance();
      loadBlueskyFeed();
      scheduleMasonryLayout();
    }

    // Solar-system model: approximate heliocentric J2000 orbital elements.
    const solarPlanets = [
      { key:'mercury', a:[0.38709927,0.00000037], e:[0.20563593,0.00001906], i:[7.00497902,-0.00594749], L:[252.25032350,149472.67411175], p:[77.45779628,0.16047689], n:[48.33076593,-0.12534081] },
      { key:'venus',   a:[0.72333566,0.00000390], e:[0.00677672,-0.00004107], i:[3.39467605,-0.00078890], L:[181.97909950,58517.81538729], p:[131.60246718,0.00268329], n:[76.67984255,-0.27769418] },
      { key:'earth',   a:[1.00000261,0.00000562], e:[0.01671123,-0.00004392], i:[-0.00001531,-0.01294668], L:[100.46457166,35999.37244981], p:[102.93768193,0.32327364], n:[0,0] },
      { key:'mars',    a:[1.52371034,0.00001847], e:[0.09339410,0.00007882], i:[1.84969142,-0.00813131], L:[-4.55343205,19140.30268499], p:[-23.94362959,0.44441088], n:[49.55953891,-0.29257343] },
      { key:'jupiter', a:[5.20288700,-0.00011607], e:[0.04838624,-0.00013253], i:[1.30439695,-0.00183714], L:[34.39644051,3034.74612775], p:[14.72847983,0.21252668], n:[100.47390909,0.20469106] },
      { key:'saturn',  a:[9.53667594,-0.00125060], e:[0.05386179,-0.00050991], i:[2.48599187,0.00193609], L:[49.95424423,1222.49362201], p:[92.59887831,-0.41897216], n:[113.66242448,-0.28867794] },
      { key:'uranus',  a:[19.18916464,-0.00196176], e:[0.04725744,-0.00004397], i:[0.77263783,-0.00242939], L:[313.23810451,428.48202785], p:[170.95427630,0.40805281], n:[74.01692503,0.04240589] },
      { key:'neptune', a:[30.06992276,0.00026291], e:[0.00859048,0.00005105], i:[1.77004347,0.00035372], L:[-55.12002969,218.45945325], p:[44.96476227,-0.32241464], n:[131.78422574,-0.00508664] }
    ];

    function normalizeDeg(deg){
      return ((deg % 360) + 360) % 360;
    }

    function signedDeg(deg){
      return ((deg + 540) % 360) - 180;
    }

    function sunLongitude(date = selectedSolarDate()){
      const earth = solarPlanets.find(planet => planet.key === 'earth');
      const pos = planetPosition(earth, date);
      return normalizeDeg(Math.atan2(pos.y, pos.x) * 180 / Math.PI + 180);
    }

    function bodyEclipticLongitude(key, date = selectedSolarDate()){
      if (key === 'sun') return sunLongitude(date);
      if (key === 'moon') {
        const moon = computeMoon(date);
        return normalizeDeg(sunLongitude(date) + moon.phase * 360);
      }
      const planet = solarPlanets.find(item => item.key === key);
      if (!planet) return 0;
      const pos = planetPosition(planet, date);
      return normalizeDeg(Math.atan2(pos.y, pos.x) * 180 / Math.PI);
    }

    function planetByKey(key){
      return solarPlanets.find(item => item.key === key);
    }

    function heliocentricPosition(key, date = selectedSolarDate()){
      const planet = planetByKey(key);
      return planet ? planetPosition(planet, date) : null;
    }

    function geocentricVector(key, date = selectedSolarDate()){
      const earth = heliocentricPosition('earth', date);
      if (!earth) return null;
      if (key === 'sun') return { x:-earth.x, y:-earth.y, z:-(earth.z || 0) };
      const body = heliocentricPosition(key, date);
      if (!body) return null;
      return { x:body.x - earth.x, y:body.y - earth.y, z:(body.z || 0) - (earth.z || 0) };
    }

    function geocentricLongitude(key, date = selectedSolarDate()){
      if (key === 'sun') return sunLongitude(date);
      const vec = geocentricVector(key, date);
      if (!vec) return 0;
      return normalizeDeg(Math.atan2(vec.y, vec.x) * 180 / Math.PI);
    }

    function geocentricLatitude(key, date = selectedSolarDate()){
      const vec = geocentricVector(key, date);
      if (!vec) return 0;
      const planar = Math.hypot(vec.x, vec.y);
      return Math.atan2(vec.z || 0, Math.max(0.0001, planar)) * 180 / Math.PI;
    }

    function solarElongationForKey(key, date = selectedSolarDate()){
      return signedDeg(geocentricLongitude(key, date) - sunLongitude(date));
    }

    function bodyDisplayName(key){
      return t['planet_' + key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : '');
    }

    function planetIlluminationData(key, date = selectedSolarDate()){
      const earth = heliocentricPosition('earth', date);
      const body = heliocentricPosition(key, date);
      if (!earth || !body) return { illumination:1, phaseAngle:0, elongation:0, evening:true, distanceAu:0 };
      const geo = { x:body.x - earth.x, y:body.y - earth.y };
      const bodyDistance = Math.hypot(body.x, body.y);
      const geoDistance = Math.hypot(geo.x, geo.y);
      const cosPhase = Math.max(-1, Math.min(1, (body.x * geo.x + body.y * geo.y) / Math.max(0.0001, bodyDistance * geoDistance)));
      const phaseAngle = Math.acos(cosPhase) * 180 / Math.PI;
      const illumination = Math.round(((1 + cosPhase) / 2) * 100);
      const elongation = solarElongationForKey(key, date);
      return {
        illumination,
        phaseAngle,
        elongation,
        evening: elongation >= 0,
        distanceAu: geoDistance
      };
    }

    function apparentDailyMotion(key, date = selectedSolarDate()){
      const prev = geocentricLongitude(key, new Date(date.getTime() - 86400000));
      const next = geocentricLongitude(key, new Date(date.getTime() + 86400000));
      return signedDeg(next - prev) / 2;
    }

    function findNearestStationDate(key, date = selectedSolarDate(), maxDays = 220){
      let best = null;
      let previousMotion = apparentDailyMotion(key, new Date(date.getTime() - maxDays * 86400000));
      for (let offset = -maxDays + 1; offset <= maxDays; offset++) {
        const candidateDate = new Date(date.getTime() + offset * 86400000);
        const motion = apparentDailyMotion(key, candidateDate);
        if ((previousMotion < 0 && motion >= 0) || (previousMotion > 0 && motion <= 0)) {
          const absDays = Math.abs(offset - 0.5);
          if (!best || absDays < best.absDays) {
            best = {
              date:new Date(date.getTime() + (offset - 0.5) * 86400000),
              absDays
            };
          }
        }
        previousMotion = motion;
      }
      return best;
    }

    function fmtDegrees(value){
      return (value >= 0 ? '+' : '') + value.toFixed(1) + '°';
    }

    function clamp01(value){
      return Math.max(0, Math.min(1, value));
    }

    const eclipseSeasonAnchor = Date.UTC(2026, 7, 12, 18, 0, 0);
    const eclipseSeasonCycleDays = 173.31;
    const eclipseSeasonHalfWindowDays = 17.5;

    function eclipseSeasonInfo(date = selectedSolarDate()){
      const deltaDays = (date.getTime() - eclipseSeasonAnchor) / 86400000;
      const phase = ((deltaDays % eclipseSeasonCycleDays) + eclipseSeasonCycleDays) % eclipseSeasonCycleDays;
      const distanceToCenter = Math.min(phase, eclipseSeasonCycleDays - phase);
      const active = distanceToCenter <= eclipseSeasonHalfWindowDays;
      const cycles = Math.round(deltaDays / eclipseSeasonCycleDays);
      const nearestCenter = new Date(eclipseSeasonAnchor + cycles * eclipseSeasonCycleDays * 86400000);
      const nextCenter = new Date(date.getTime() + (eclipseSeasonCycleDays - phase) * 86400000);
      return { phase, distanceToCenter, active, nearestCenter, nextCenter };
    }

    function renderVisibility(date = new Date()){
      const list = document.getElementById('visibilityList');
      if (!list) return;
      const location = selectedLocation();
      const legend = document.getElementById('visibilityLegend');
      if (legend) {
        legend.textContent = (t.visibility_legend_prefix || 'Approximate for') + ' ' + location.name + '; '
          + (t.visibility_legend_suffix || 'based on solar elongation')
          + ' · '
          + (t.legend_night_visibility || 'Approximate visibility between dusk and dawn for the selected city');
      }
      list.innerHTML = '';
      const sunLong = sunLongitude(date);
      ['mercury','venus','mars','jupiter','saturn'].forEach(key => {
        const longitude = bodyEclipticLongitude(key, date);
        const elongation = signedDeg(longitude - sunLong);
        const absElongation = Math.abs(elongation);
        let start = 42, width = 16, label = t.visibility_difficult;
        if (absElongation >= 12) {
          width = Math.min(44, Math.max(12, absElongation / 2.2));
          if (elongation > 0) {
            start = 62;
            label = t.visibility_evening;
          } else {
            start = 18;
            label = t.visibility_morning;
          }
        }
        if (absElongation >= 120 && key !== 'mercury' && key !== 'venus') {
          start = 18;
          width = 64;
          label = t.visibility_night;
        }
        const row = document.createElement('div');
        row.className = 'visibility-row';
        const name = document.createElement('div');
        name.className = 'visibility-name';
        name.textContent = t['planet_' + key] || key;
        const track = document.createElement('div');
        track.className = 'visibility-track';
        const fill = document.createElement('div');
        fill.className = 'visibility-fill';
        fill.style.left = Math.max(0, Math.min(100, start)) + '%';
        fill.style.width = Math.max(4, Math.min(100 - start, width)) + '%';
        track.appendChild(fill);
        const note = document.createElement('div');
        note.className = 'visibility-note';
        note.textContent = label;
        const night = nightVisibilitySegments(key, date);
        const nightDetail = document.createElement('div');
        nightDetail.className = 'visibility-night-detail';
        if (night.segments.length && night.bestTime) {
          const longest = night.segments.slice().sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
          nightDetail.textContent = `${fmtTimeOnly(new Date(longest.start))}-${fmtTimeOnly(new Date(longest.end))} · ${t.visibility_best || 'Best around'} ${fmtTimeOnly(night.bestTime)}`;
        } else {
          nightDetail.textContent = t.visibility_night_empty || 'Not above the horizon during the dark part of the night';
        }
        row.append(name, track, note, nightDetail);
        list.appendChild(row);
      });
    }

    function julianDate(date){
      return date.getTime() / 86400000 + 2440587.5;
    }

    function solveKepler(meanAnomaly, eccentricity){
      let eccentricAnomaly = meanAnomaly;
      for(let step=0; step<8; step++){
        eccentricAnomaly -= (eccentricAnomaly - eccentricity*Math.sin(eccentricAnomaly) - meanAnomaly) /
          (1 - eccentricity*Math.cos(eccentricAnomaly));
      }
      return eccentricAnomaly;
    }

    function planetPosition(planet, date){
      const T = (julianDate(date) - 2451545.0) / 36525;
      const a = planet.a[0] + planet.a[1] * T;
      const e = planet.e[0] + planet.e[1] * T;
      const i = (planet.i[0] + planet.i[1] * T) * Math.PI / 180;
      const L = normalizeDeg(planet.L[0] + planet.L[1] * T);
      const p = normalizeDeg(planet.p[0] + planet.p[1] * T);
      const n = normalizeDeg(planet.n[0] + planet.n[1] * T);
      const M = normalizeDeg(L - p) * Math.PI / 180;
      const E = solveKepler(M, e);
      const xp = a * (Math.cos(E) - e);
      const yp = a * Math.sqrt(1 - e*e) * Math.sin(E);
      const w = (p - n) * Math.PI / 180;
      const node = n * Math.PI / 180;

      const cosW = Math.cos(w), sinW = Math.sin(w);
      const cosN = Math.cos(node), sinN = Math.sin(node);
      const cosI = Math.cos(i);
      const x = (cosW*cosN - sinW*sinN*cosI) * xp + (-sinW*cosN - cosW*sinN*cosI) * yp;
      const y = (cosW*sinN + sinW*cosN*cosI) * xp + (-sinW*sinN + cosW*cosN*cosI) * yp;
      const z = (sinW * Math.sin(i)) * xp + (cosW * Math.sin(i)) * yp;
      return { x, y, z, a };
    }

    function renderSolarSystem(date = selectedSolarDate()){
      const system = document.getElementById('solarSystem');
      if(!system) return;

      system.querySelectorAll('.solar-orbit,.solar-planet,.solar-label').forEach(el => el.remove());

      const size = system.clientWidth || 760;
      const center = size / 2;
      const maxRadius = size * 0.39;
      const neptuneA = 30.06992276;

      solarPlanets.forEach(planet => {
        const orbitRadius = Math.sqrt(planet.a[0] / neptuneA) * maxRadius;
        const orbit = document.createElement('div');
        orbit.className = 'solar-orbit';
        orbit.style.width = (orbitRadius * 2) + 'px';
        orbit.style.height = (orbitRadius * 2) + 'px';
        system.appendChild(orbit);
      });

      solarPlanets.forEach(planet => {
        const pos = planetPosition(planet, date);
        const theta = Math.atan2(pos.y, pos.x);
        const distance = Math.sqrt(pos.x*pos.x + pos.y*pos.y);
        const screenRadius = Math.sqrt(distance / neptuneA) * maxRadius;
        const x = center + screenRadius * Math.cos(theta);
        const y = center + screenRadius * Math.sin(theta);

        const marker = document.createElement('div');
        marker.className = 'solar-planet ' + planet.key;
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
        marker.title = t['planet_' + planet.key] || planet.key;
        system.appendChild(marker);

        const label = document.createElement('div');
        label.className = 'solar-label';
        label.dataset.solarPlanet = planet.key;
        label.textContent = t['planet_' + planet.key] || planet.key;
        label.style.left = x + 'px';
        label.style.top = y + 'px';
        system.appendChild(label);
      });

      const tz = document.getElementById('timezone').value;
      const solarDate = document.getElementById('solarDate');
      if(solarDate) solarDate.textContent = t.solar_date + ': ' + fmtTZ(date, tz);
    }

    function smallBodyRadius(au, maxRadius){
      const capped = Math.max(0.02, Math.min(60, au));
      return Math.sqrt(capped / 60) * maxRadius;
    }

    function smallBodyShortName(name){
      if (name.includes('/')) return name.split('/').slice(1).join('/');
      const parts = name.trim().split(/\s+/);
      return parts.length > 2 ? parts.slice(2).join(' ') : name;
    }

    function renderSmallBodies(){
      const target = document.getElementById('smallBodiesMap');
      const detail = document.getElementById('smallBodiesDetail');
      const summary = document.getElementById('smallBodiesSummary');
      const resetButton = document.getElementById('smallBodiesReset');
      const hint = document.getElementById('smallBodiesHint');
      if (!target) return;
      const size = 640;
      const center = size / 2;
      const maxRadius = size * 0.378;
      const zoomEnabled = false;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';

      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.small_bodies_aria || 'Comets, asteroid belt and Kuiper belt');

      const setSmallBodyDetail = html => {
        if (detail) detail.innerHTML = html;
      };

      const defs = document.createElementNS(svgNS, 'defs');
      defs.innerHTML = `
        <radialGradient id="smallBodiesSunGradient" cx="35%" cy="35%" r="70%">
          <stop offset="0" stop-color="#fff7b0"></stop>
          <stop offset=".55" stop-color="#f8b43c"></stop>
          <stop offset="1" stop-color="#b45309"></stop>
        </radialGradient>
        <filter id="smallBodiesSunGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" result="glow"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="glow"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <clipPath id="smallBodiesClip">
          <circle cx="${center}" cy="${center}" r="${center - 8}"></circle>
        </clipPath>
      `;
      svg.appendChild(defs);

      const viewport = document.createElementNS(svgNS, 'g');
      viewport.setAttribute('clip-path', 'url(#smallBodiesClip)');
      svg.appendChild(viewport);

      [1, 1.52, 5.2, 30].forEach(au => {
        const orbit = document.createElementNS(svgNS, 'circle');
        orbit.setAttribute('cx', center);
        orbit.setAttribute('cy', center);
        orbit.setAttribute('r', smallBodyRadius(au, maxRadius));
        orbit.setAttribute('fill', 'none');
        orbit.setAttribute('stroke', 'rgba(107,114,128,.22)');
        orbit.setAttribute('stroke-width', '1');
        viewport.appendChild(orbit);
      });

      (smallBodiesConfig.belts || []).forEach(belt => {
        const inner = smallBodyRadius(belt.innerAu, maxRadius);
        const outer = smallBodyRadius(belt.outerAu, maxRadius);
        const ring = document.createElementNS(svgNS, 'circle');
        ring.setAttribute('cx', center);
        ring.setAttribute('cy', center);
        ring.setAttribute('r', (inner + outer) / 2);
        ring.setAttribute('class', 'small-bodies-belt ' + belt.key);
        ring.setAttribute('stroke-width', Math.max(8, outer - inner));
        const title = document.createElementNS(svgNS, 'title');
        title.textContent = belt.label;
        ring.appendChild(title);
        viewport.appendChild(ring);

        const ringHit = document.createElementNS(svgNS, 'circle');
        ringHit.setAttribute('cx', center);
        ringHit.setAttribute('cy', center);
        ringHit.setAttribute('r', (inner + outer) / 2);
        ringHit.setAttribute('class', 'small-bodies-hitarea');
        ringHit.setAttribute('stroke-width', Math.max(24, outer - inner + 12));
        const hitTitle = document.createElementNS(svgNS, 'title');
        hitTitle.textContent = belt.label;
        ringHit.appendChild(hitTitle);
        ringHit.addEventListener('click', () => {
          setSmallBodyDetail('<strong>' + belt.label + '</strong><br>' + (t.small_bodies_belt_explain || 'Broad ring of many small bodies.') + ' ' + belt.innerAu + '-' + belt.outerAu + ' AU');
        });
        viewport.appendChild(ringHit);
      });

      (smallBodiesConfig.comets || []).forEach((comet, index) => {
        const q = smallBodyRadius(comet.q, maxRadius);
        const Q = smallBodyRadius(comet.Q, maxRadius);
        const rx = Math.max(4, (q + Q) / 2);
        const ry = Math.max(3, rx * (0.28 + (index % 5) * 0.035));
        const cx = center + (q - Q) / 2;
        const rotation = (comet.angle || 0) * Math.PI / 180;
        const detailHtml = '<strong>' + smallBodyShortName(comet.name) + '</strong><br>'
          + comet.name + ' · ' + comet.type + ' · ' + (t.small_bodies_perihel || 'Perihelion') + ' ' + comet.q + ' AU · ' + (t.small_bodies_aphel || 'Aphelion') + ' ' + comet.Q + ' AU';

        const orbit = document.createElementNS(svgNS, 'ellipse');
        orbit.setAttribute('cx', cx);
        orbit.setAttribute('cy', center);
        orbit.setAttribute('rx', rx);
        orbit.setAttribute('ry', ry);
        orbit.setAttribute('class', 'small-bodies-orbit');
        orbit.setAttribute('stroke', comet.color || '#2563eb');
        orbit.setAttribute('transform', 'rotate(' + (comet.angle || 0) + ' ' + center + ' ' + center + ')');
        const title = document.createElementNS(svgNS, 'title');
        title.textContent = comet.name + ' · ' + (t.small_bodies_perihel || 'Perihelion') + ' ' + comet.q + ' AU · ' + (t.small_bodies_aphel || 'Aphelion') + ' ' + comet.Q + ' AU · ' + comet.type;
        orbit.appendChild(title);
        viewport.appendChild(orbit);

        const orbitHit = document.createElementNS(svgNS, 'ellipse');
        orbitHit.setAttribute('cx', cx);
        orbitHit.setAttribute('cy', center);
        orbitHit.setAttribute('rx', rx);
        orbitHit.setAttribute('ry', ry);
        orbitHit.setAttribute('class', 'small-bodies-hitarea');
        orbitHit.setAttribute('transform', 'rotate(' + (comet.angle || 0) + ' ' + center + ' ' + center + ')');
        const orbitHitTitle = document.createElementNS(svgNS, 'title');
        orbitHitTitle.textContent = comet.name + ' · ' + (t.small_bodies_perihel || 'Perihelion') + ' ' + comet.q + ' AU · ' + (t.small_bodies_aphel || 'Aphelion') + ' ' + comet.Q + ' AU · ' + comet.type;
        orbitHit.appendChild(orbitHitTitle);
        orbitHit.addEventListener('click', () => setSmallBodyDetail(detailHtml));
        viewport.appendChild(orbitHit);

        if (comet.showLabel) {
          const localAnchor = { x: cx - rx, y: center };
          const dx = localAnchor.x - center;
          const dy = localAnchor.y - center;
          const anchorX = center + dx * Math.cos(rotation) - dy * Math.sin(rotation);
          const anchorY = center + dx * Math.sin(rotation) + dy * Math.cos(rotation);
          const vx = anchorX - center;
          const vy = anchorY - center;
          const length = Math.max(1, Math.hypot(vx, vy));
          const dirX = vx / length;
          const dirY = vy / length;
          const labelX = anchorX + dirX * 16;
          const labelY = anchorY + dirY * 16 + (Math.abs(dirY) < 0.22 ? -8 : 0);

          const group = document.createElementNS(svgNS, 'g');
          group.setAttribute('class', 'small-bodies-label-chip');
          group.addEventListener('click', () => setSmallBodyDetail(detailHtml));

          const guide = document.createElementNS(svgNS, 'line');
          guide.setAttribute('x1', anchorX);
          guide.setAttribute('y1', anchorY);
          guide.setAttribute('x2', labelX);
          guide.setAttribute('y2', labelY - 4);
          guide.setAttribute('class', 'small-bodies-label-guide');

          const dot = document.createElementNS(svgNS, 'circle');
          dot.setAttribute('cx', anchorX);
          dot.setAttribute('cy', anchorY);
          dot.setAttribute('r', 3.5);
          dot.setAttribute('fill', comet.color || '#2563eb');

          const label = document.createElementNS(svgNS, 'text');
          label.setAttribute('x', labelX);
          label.setAttribute('y', labelY);
          label.setAttribute('class', 'small-bodies-label');
          label.setAttribute('text-anchor', dirX > 0.28 ? 'start' : (dirX < -0.28 ? 'end' : 'middle'));
          label.textContent = smallBodyShortName(comet.name);

          group.appendChild(guide);
          group.appendChild(dot);
          group.appendChild(label);
          viewport.appendChild(group);
        }
      });

      const sun = document.createElementNS(svgNS, 'circle');
      sun.setAttribute('cx', center);
      sun.setAttribute('cy', center);
      sun.setAttribute('r', 15);
      sun.setAttribute('class', 'small-bodies-sun');
      viewport.appendChild(sun);

      const zoomState = {
        scale: 1,
        tx: 0,
        ty: 0,
        activePointers: new Map(),
        panPointerId: null,
        lastPoint: null,
        pinchBase: null,
        suppressClick: false
      };

      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      const pointerToSvgPoint = (clientX, clientY) => {
        const rect = svg.getBoundingClientRect();
        return {
          x: ((clientX - rect.left) / rect.width) * size,
          y: ((clientY - rect.top) / rect.height) * size
        };
      };

      const applyViewportTransform = () => {
        const maxPan = (zoomState.scale - 1) * size * 0.38;
        zoomState.tx = clamp(zoomState.tx, -maxPan, maxPan);
        zoomState.ty = clamp(zoomState.ty, -maxPan, maxPan);
        viewport.setAttribute('transform', 'translate(' + zoomState.tx.toFixed(2) + ' ' + zoomState.ty.toFixed(2) + ') scale(' + zoomState.scale.toFixed(3) + ')');
        svg.classList.toggle('is-dragging', zoomState.panPointerId !== null || zoomState.activePointers.size > 1);
      };

      const zoomAtPoint = (targetScale, focusPoint) => {
        const nextScale = clamp(targetScale, 1, 5);
        const worldX = (focusPoint.x - zoomState.tx) / zoomState.scale;
        const worldY = (focusPoint.y - zoomState.ty) / zoomState.scale;
        zoomState.tx = focusPoint.x - nextScale * worldX;
        zoomState.ty = focusPoint.y - nextScale * worldY;
        zoomState.scale = nextScale;
        applyViewportTransform();
      };

      const resetSmallBodiesView = () => {
        zoomState.scale = 1;
        zoomState.tx = 0;
        zoomState.ty = 0;
        zoomState.activePointers.clear();
        zoomState.panPointerId = null;
        zoomState.lastPoint = null;
        zoomState.pinchBase = null;
        zoomState.suppressClick = false;
        applyViewportTransform();
      };

      const beginPinch = () => {
        const points = Array.from(zoomState.activePointers.values());
        if (points.length !== 2) return;
        const centerPoint = pointerToSvgPoint((points[0].clientX + points[1].clientX) / 2, (points[0].clientY + points[1].clientY) / 2);
        const distance = Math.hypot(points[1].clientX - points[0].clientX, points[1].clientY - points[0].clientY);
        zoomState.pinchBase = {
          scale: zoomState.scale,
          focusWorldX: (centerPoint.x - zoomState.tx) / zoomState.scale,
          focusWorldY: (centerPoint.y - zoomState.ty) / zoomState.scale,
          distance
        };
      };

      if (zoomEnabled) {
        svg.addEventListener('wheel', event => {
          event.preventDefault();
          zoomAtPoint(zoomState.scale * Math.exp(-event.deltaY * 0.0015), pointerToSvgPoint(event.clientX, event.clientY));
        }, { passive: false });

        svg.addEventListener('dblclick', event => {
          event.preventDefault();
          resetSmallBodiesView();
        });

        svg.addEventListener('pointerdown', event => {
          if (event.pointerType === 'mouse' && ![0, 1].includes(event.button)) return;
          zoomState.activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
          if (zoomState.activePointers.size === 2) {
            beginPinch();
            zoomState.panPointerId = null;
            zoomState.lastPoint = null;
            event.preventDefault();
            return;
          }
          const canPan = event.pointerType !== 'mouse' || event.button === 1 || zoomState.scale > 1.001;
          if (canPan) {
            zoomState.panPointerId = event.pointerId;
            zoomState.lastPoint = pointerToSvgPoint(event.clientX, event.clientY);
            try { svg.setPointerCapture(event.pointerId); } catch (error) {}
            event.preventDefault();
          }
        });

        svg.addEventListener('pointermove', event => {
          if (!zoomState.activePointers.has(event.pointerId)) return;
          zoomState.activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
          if (zoomState.activePointers.size === 2 && zoomState.pinchBase) {
            const points = Array.from(zoomState.activePointers.values());
            const centerPoint = pointerToSvgPoint((points[0].clientX + points[1].clientX) / 2, (points[0].clientY + points[1].clientY) / 2);
            const distance = Math.max(24, Math.hypot(points[1].clientX - points[0].clientX, points[1].clientY - points[0].clientY));
            const nextScale = clamp(zoomState.pinchBase.scale * (distance / zoomState.pinchBase.distance), 1, 5);
            zoomState.scale = nextScale;
            zoomState.tx = centerPoint.x - nextScale * zoomState.pinchBase.focusWorldX;
            zoomState.ty = centerPoint.y - nextScale * zoomState.pinchBase.focusWorldY;
            zoomState.suppressClick = true;
            applyViewportTransform();
            return;
          }
          if (zoomState.panPointerId === event.pointerId && zoomState.lastPoint) {
            const point = pointerToSvgPoint(event.clientX, event.clientY);
            const dx = point.x - zoomState.lastPoint.x;
            const dy = point.y - zoomState.lastPoint.y;
            if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
              zoomState.tx += dx;
              zoomState.ty += dy;
              zoomState.lastPoint = point;
              zoomState.suppressClick = true;
              applyViewportTransform();
            }
          }
        });

        const endPointer = event => {
          zoomState.activePointers.delete(event.pointerId);
          if (zoomState.activePointers.size < 2) zoomState.pinchBase = null;
          if (zoomState.panPointerId === event.pointerId) {
            zoomState.panPointerId = null;
            zoomState.lastPoint = null;
            try { svg.releasePointerCapture(event.pointerId); } catch (error) {}
          }
          applyViewportTransform();
        };

        svg.addEventListener('pointerup', endPointer);
        svg.addEventListener('pointercancel', endPointer);
        svg.addEventListener('pointerleave', event => {
          if (event.pointerType === 'mouse') endPointer(event);
        });
        svg.addEventListener('click', event => {
          if (!zoomState.suppressClick) return;
          zoomState.suppressClick = false;
          event.preventDefault();
          event.stopPropagation();
        }, true);
      }

      if (resetButton) {
        resetButton.textContent = t.small_bodies_reset || 'Reset view';
        resetButton.onclick = resetSmallBodiesView;
        resetButton.hidden = !zoomEnabled;
      }
      if (hint) {
        hint.textContent = zoomEnabled
          ? (t.small_bodies_gesture_hint || 'Use the mouse wheel or pinch to zoom, drag to pan, double-click to reset.')
          : (t.small_bodies_tap_hint || 'Tap or click an orbit to see its name, type and orbit data.');
      }

      applyViewportTransform();
      target.appendChild(svg);
      setSmallBodyDetail('<strong>' + (t.small_bodies_tap_title || 'Pick a body') + '</strong><br>' + (t.small_bodies_tap_hint || 'Tap or click an orbit to see its name, type and orbit data.'));

      if (summary) {
        summary.innerHTML = '';
        [
          [t.small_bodies_comets || 'Comets', (smallBodiesConfig.comets || []).length],
          [t.small_bodies_asteroid_belt || 'Asteroid belt', '2.1-3.3 AU'],
          [t.small_bodies_kuiper_belt || 'Kuiper belt', '30-50 AU'],
          [t.small_bodies_scale || 'Scale', t.small_bodies_scale_value || 'Compressed']
        ].forEach(([label, value]) => {
          const item = document.createElement('div');
          item.innerHTML = '<strong>' + label + '</strong>' + value;
          summary.appendChild(item);
        });
      }
      scheduleMasonryLayout();
    }

    function dayOfYearLocal(date){
      const start = new Date(date.getFullYear(), 0, 1);
      return Math.floor((date - start) / 86400000) + 1;
    }

    function daysInYear(year){
      return new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
    }

    function monthDayToDayOfYear(monthDay, year){
      const [month, day] = monthDay.split('-').map(Number);
      return dayOfYearLocal(new Date(year, month - 1, day));
    }

    function monthDayLabel(monthDay, year){
      const [month, day] = monthDay.split('-').map(Number);
      return formatDateStamp(new Date(year, month - 1, day));
    }

    function monthShortLabel(monthIndex){
      return new Intl.DateTimeFormat(lang, { month:'short' }).format(new Date(2026, monthIndex, 1));
    }

    function unwrapLongitudeSeries(values){
      let previous = null;
      let cumulative = 0;
      return values.map(value => {
        if (previous !== null) cumulative += signedDeg(value - previous);
        previous = value;
        return cumulative;
      });
    }

    function polarPoint(center, radius, fraction){
      const angle = fraction * Math.PI * 2 - Math.PI / 2;
      return {
        x:center + Math.cos(angle) * radius,
        y:center + Math.sin(angle) * radius
      };
    }

    function svgArcPath(center, radius, startFraction, endFraction){
      const start = polarPoint(center, radius, startFraction);
      const end = polarPoint(center, radius, endFraction);
      const sweep = endFraction >= startFraction ? endFraction - startFraction : endFraction + 1 - startFraction;
      const largeArc = sweep > 0.5 ? 1 : 0;
      return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
    }

    function conjunctionPairLabel(a, b){
      return bodyDisplayName(a) + ' - ' + bodyDisplayName(b);
    }

    function computeConjunctionEvents(date = selectedSolarDate(), windowDays = 180){
      const bodies = ['mercury','venus','mars','jupiter','saturn'];
      const base = new Date(date);
      base.setHours(12, 0, 0, 0);
      const events = [];
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          for (let day = -windowDays + 1; day < windowDays; day++) {
            const prevDate = new Date(base.getTime() + (day - 1) * 86400000);
            const currentDate = new Date(base.getTime() + day * 86400000);
            const nextDate = new Date(base.getTime() + (day + 1) * 86400000);
            const prev = Math.abs(signedDeg(bodyEclipticLongitude(a, prevDate) - bodyEclipticLongitude(b, prevDate)));
            const current = Math.abs(signedDeg(bodyEclipticLongitude(a, currentDate) - bodyEclipticLongitude(b, currentDate)));
            const next = Math.abs(signedDeg(bodyEclipticLongitude(a, nextDate) - bodyEclipticLongitude(b, nextDate)));
            if (current <= prev && current < next && current <= 4.5) {
              events.push({ a, b, date:currentDate, offsetDays:day, separation:current });
            }
          }
        }
      }
      return events.sort((left, right) => left.date - right.date);
    }

    function renderMeteorStreams(date = new Date()){
      const target = document.getElementById('meteorMap');
      const summary = document.getElementById('meteorSummary');
      if (!target) return;
      const size = 420;
      const center = size / 2;
      const radius = 150;
      const yearDays = daysInYear(date.getFullYear());
      const todayFraction = (dayOfYearLocal(date) - 1) / yearDays;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';

      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.meteor_aria || 'Meteor shower activity through the year');

      const base = document.createElementNS(svgNS, 'circle');
      base.setAttribute('cx', center);
      base.setAttribute('cy', center);
      base.setAttribute('r', radius);
      base.setAttribute('fill', 'none');
      base.setAttribute('stroke', '#e5e7eb');
      base.setAttribute('stroke-width', '14');
      svg.appendChild(base);

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(date.getFullYear(), month, 1);
        const fraction = (dayOfYearLocal(monthStart) - 1) / yearDays;
        const tickStart = polarPoint(center, radius + 2, fraction);
        const tickEnd = polarPoint(center, radius + 15, fraction);
        const tick = document.createElementNS(svgNS, 'line');
        tick.setAttribute('x1', tickStart.x);
        tick.setAttribute('y1', tickStart.y);
        tick.setAttribute('x2', tickEnd.x);
        tick.setAttribute('y2', tickEnd.y);
        tick.setAttribute('class', 'meteor-month-tick');
        svg.appendChild(tick);

        const labelPoint = polarPoint(center, radius + 32, fraction);
        const monthLabel = document.createElementNS(svgNS, 'text');
        monthLabel.setAttribute('x', labelPoint.x);
        monthLabel.setAttribute('y', labelPoint.y);
        monthLabel.setAttribute('class', 'meteor-month-label');
        monthLabel.textContent = new Intl.DateTimeFormat(lang, { month:'short' }).format(monthStart).replace('.', '');
        svg.appendChild(monthLabel);
      }

      const active = [];
      (phenomenaConfig.meteorStreams || []).forEach((stream, index) => {
        let start = (monthDayToDayOfYear(stream.start, date.getFullYear()) - 1) / yearDays;
        let end = (monthDayToDayOfYear(stream.end, date.getFullYear()) - 1) / yearDays;
        const peak = (monthDayToDayOfYear(stream.peak, date.getFullYear()) - 1) / yearDays;
        const wraps = end < start;
        const inWindow = wraps
          ? todayFraction >= start || todayFraction <= end
          : todayFraction >= start && todayFraction <= end;
        if (inWindow) active.push(stream);

        const arc = document.createElementNS(svgNS, 'path');
        arc.setAttribute('d', svgArcPath(center, radius - (index % 3) * 16, start, end));
        arc.setAttribute('class', 'meteor-arc');
        arc.setAttribute('stroke', stream.color || '#2563eb');
        const title = document.createElementNS(svgNS, 'title');
        title.textContent = stream.name + ' · ' + monthDayLabel(stream.start, date.getFullYear()) + '-' + monthDayLabel(stream.end, date.getFullYear()) + ' · Peak ' + monthDayLabel(stream.peak, date.getFullYear());
        arc.appendChild(title);
        svg.appendChild(arc);

        const peakPoint = polarPoint(center, radius - (index % 3) * 16, peak);
        const peakMark = document.createElementNS(svgNS, 'circle');
        peakMark.setAttribute('cx', peakPoint.x);
        peakMark.setAttribute('cy', peakPoint.y);
        peakMark.setAttribute('r', inWindow ? 5 : 3.5);
        peakMark.setAttribute('class', 'meteor-peak');
        peakMark.setAttribute('fill', stream.color || '#2563eb');
        svg.appendChild(peakMark);
      });

      const today = polarPoint(center, radius + 18, todayFraction);
      const now = document.createElementNS(svgNS, 'circle');
      now.setAttribute('cx', today.x);
      now.setAttribute('cy', today.y);
      now.setAttribute('r', 6);
      now.setAttribute('class', 'meteor-today');
      const nowTitle = document.createElementNS(svgNS, 'title');
      nowTitle.textContent = (t.today || 'Today') + ': ' + formatDateStamp(date);
      now.appendChild(nowTitle);
      svg.appendChild(now);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', center);
      label.setAttribute('y', center);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'small-bodies-label');
      label.textContent = t.meteor_year_label || 'Year';
      svg.appendChild(label);
      target.appendChild(svg);

      if (summary) {
        const next = (phenomenaConfig.meteorStreams || [])
          .map(stream => ({ stream, peakDay:monthDayToDayOfYear(stream.peak, date.getFullYear()) }))
          .map(item => ({ ...item, delta:item.peakDay - dayOfYearLocal(date) }))
          .map(item => item.delta < 0 ? { ...item, delta:item.delta + yearDays, year:date.getFullYear() + 1 } : { ...item, year:date.getFullYear() })
          .sort((a,b) => a.delta - b.delta)[0];
        summary.innerHTML = `<div>${t.meteor_explain || 'This is a calendar circle, not sky directions.'}</div>`
          + `<div><strong>${t.today || 'Today'}: </strong>${formatDateStamp(date)}</div>`
          + `<div><strong>${t.meteor_active || 'Active now'}: </strong>${active.length ? active.map(item => item.name).join(', ') : (t.none || 'None')}</div>`
          + `<div><strong>${t.meteor_next_peak || 'Next peak'}: </strong>${next ? next.stream.name + ' · ' + monthDayLabel(next.stream.peak, next.year) : '-'}</div>`;
      }
      renderMeteorRadiants(date, active);
      scheduleMasonryLayout();
    }

    function renderMeteorRadiants(date, activeStreams){
      const target = document.getElementById('meteorRadiants');
      if (!target) return;
      const streams = phenomenaConfig.meteorStreams || [];
      const activeKeys = new Set((activeStreams || []).map(stream => stream.key));
      const yearDays = daysInYear(date.getFullYear());
      const today = dayOfYearLocal(date);
      const next = streams
        .map(stream => ({ stream, peakDay:monthDayToDayOfYear(stream.peak, date.getFullYear()) }))
        .map(item => ({ ...item, delta:item.peakDay - today }))
        .map(item => item.delta < 0 ? { ...item, delta:item.delta + yearDays } : item)
        .sort((a,b) => a.delta - b.delta)[0]?.stream;
      if (next) activeKeys.add(next.key);

      const size = 140;
      const center = size / 2;
      const svgNS = 'http://www.w3.org/2000/svg';
      const map = document.createElement('div');
      map.className = 'meteor-radiant-map';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.meteor_radiants_aria || 'Meteor shower radiant directions');
      const horizon = document.createElementNS(svgNS, 'circle');
      horizon.setAttribute('cx', center);
      horizon.setAttribute('cy', center);
      horizon.setAttribute('r', 58);
      horizon.setAttribute('fill', 'none');
      horizon.setAttribute('stroke', '#cbd5e1');
      horizon.setAttribute('stroke-width', '1');
      svg.appendChild(horizon);
      [
        ['N', center, 11], ['E', size - 10, center + 4], ['S', center, size - 7], ['W', 10, center + 4]
      ].forEach(([label, x, y]) => {
        const el = document.createElementNS(svgNS, 'text');
        el.setAttribute('x', x);
        el.setAttribute('y', y);
        el.setAttribute('class', 'meteor-radiant-label');
        el.textContent = label;
        svg.appendChild(el);
      });

      streams.forEach(stream => {
        const angle = (stream.radiantAngle || 0) * Math.PI / 180 - Math.PI / 2;
        const altitude = Math.max(10, Math.min(80, stream.radiantAltitude || 45));
        const radius = 58 * (1 - altitude / 90);
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const dot = document.createElementNS(svgNS, 'circle');
        const isActive = activeKeys.has(stream.key);
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', isActive ? 5 : 3.2);
        dot.setAttribute('class', 'meteor-radiant-dot' + (isActive ? '' : ' inactive'));
        dot.setAttribute('fill', stream.color || '#2563eb');
        const title = document.createElementNS(svgNS, 'title');
        title.textContent = stream.name + ' · ' + (stream.radiant || '') + ' · ' + (t.meteor_radiant_peak || 'Peak') + ' ' + monthDayLabel(stream.peak, date.getFullYear());
        dot.appendChild(title);
        svg.appendChild(dot);
      });
      map.appendChild(svg);

      const copy = document.createElement('div');
      copy.className = 'meteor-radiant-copy';
      const headline = document.createElement('strong');
      headline.textContent = t.meteor_radiants_title || 'Radiants';
      const explanation = document.createElement('span');
      explanation.textContent = t.meteor_radiants_explain || 'Dots show the apparent origin in the sky; active and next peak are highlighted.';
      const nextLine = document.createElement('span');
      nextLine.textContent = next ? (t.meteor_radiants_next || 'Next highlighted') + ': ' + next.name + ' (' + next.radiant + ')' : '';
      copy.append(headline, explanation, nextLine);

      target.innerHTML = '';
      target.append(map, copy);
    }

    function renderConstellationOfMonth(date = new Date()){
      const target = document.getElementById('constellationMap');
      const summary = document.getElementById('constellationSummary');
      if (!target) return;
      const month = date.getMonth() + 1;
      const item = (phenomenaConfig.constellations || []).find(entry => entry.month === month);
      if (!item) return;
      const size = 420;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', (t.title_constellation_month || 'Constellation of the month') + ': ' + item.name);
      (item.lines || []).forEach(([from, to]) => {
        const a = item.stars[from];
        const b = item.stars[to];
        if (!a || !b) return;
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', a[0] / 100 * size);
        line.setAttribute('y1', a[1] / 100 * size);
        line.setAttribute('x2', b[0] / 100 * size);
        line.setAttribute('y2', b[1] / 100 * size);
        line.setAttribute('class', 'constellation-line');
        svg.appendChild(line);
      });
      (item.stars || []).forEach((star, index) => {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', star[0] / 100 * size);
        circle.setAttribute('cy', star[1] / 100 * size);
        circle.setAttribute('r', index === 0 ? 5 : 3.6);
        circle.setAttribute('class', 'constellation-star' + (index === 0 ? ' main' : ''));
        svg.appendChild(circle);
      });
      (item.labels || []).forEach(label => {
        const star = item.stars[label.star];
        if (!star) return;
        const text = document.createElementNS(svgNS, 'text');
        const dx = label.dx ?? 8;
        const dy = label.dy ?? -8;
        text.setAttribute('x', star[0] / 100 * size + dx);
        text.setAttribute('y', star[1] / 100 * size + dy);
        text.setAttribute('class', 'constellation-star-label');
        text.setAttribute('text-anchor', label.anchor || 'start');
        text.textContent = label.name;
        svg.appendChild(text);
      });
      target.appendChild(svg);
      if (summary) {
        const highlight = typeof item.highlight === 'object'
          ? (item.highlight[lang] || item.highlight.en || '')
          : (item.highlight || '');
        summary.innerHTML = `<div class="constellation-name">${item.name}</div>`
          + `<div>${highlight}</div>`
          + `<div><strong>${t.constellation_month_label || 'Month'}: </strong>${new Intl.DateTimeFormat(lang, { month:'long' }).format(date)}</div>`;
      }
      scheduleMasonryLayout();
    }

    function seasonNameForFraction(fraction){
      if (fraction < 0.22) return t.season_winter || 'Winter';
      if (fraction < 0.47) return t.season_spring || 'Spring';
      if (fraction < 0.72) return t.season_summer || 'Summer';
      if (fraction < 0.97) return t.season_autumn || 'Autumn';
      return t.season_winter || 'Winter';
    }

    function renderSeasonAxis(date = new Date()){
      const target = document.getElementById('seasonMap');
      const summary = document.getElementById('seasonSummary');
      if (!target) return;
      const size = 420;
      const center = size / 2;
      const radius = 135;
      const fraction = (dayOfYearLocal(date) - 1) / daysInYear(date.getFullYear());
      const declination = 23.44 * Math.sin(2 * Math.PI * (dayOfYearLocal(date) - 80) / daysInYear(date.getFullYear()));
      const earth = polarPoint(center, radius, fraction);
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';

      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.season_aria || 'Earth orbit and axial tilt');
      const defs = document.createElementNS(svgNS, 'defs');
      defs.innerHTML = `
        <radialGradient id="seasonEarthGradient" cx="35%" cy="35%" r="70%">
          <stop offset="0" stop-color="#8bd3ff"></stop>
          <stop offset=".65" stop-color="#2563eb"></stop>
          <stop offset="1" stop-color="#0f172a"></stop>
        </radialGradient>
        <filter id="seasonEarthShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity=".25"></feDropShadow>
        </filter>
        `;
      svg.appendChild(defs);

      const orbit = document.createElementNS(svgNS, 'circle');
      orbit.setAttribute('cx', center);
      orbit.setAttribute('cy', center);
      orbit.setAttribute('r', radius);
      orbit.setAttribute('class', 'season-orbit');
      svg.appendChild(orbit);

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(date.getFullYear(), month, 1);
        const monthFraction = (dayOfYearLocal(monthStart) - 1) / daysInYear(date.getFullYear());
        const tickStart = polarPoint(center, radius - 4, monthFraction);
        const tickEnd = polarPoint(center, radius + 9, monthFraction);
        const tick = document.createElementNS(svgNS, 'line');
        tick.setAttribute('x1', tickStart.x);
        tick.setAttribute('y1', tickStart.y);
        tick.setAttribute('x2', tickEnd.x);
        tick.setAttribute('y2', tickEnd.y);
        tick.setAttribute('class', 'season-month-tick');
        svg.appendChild(tick);

        const labelPoint = polarPoint(center, radius + 23, monthFraction);
        const monthLabel = document.createElementNS(svgNS, 'text');
        monthLabel.setAttribute('x', labelPoint.x);
        monthLabel.setAttribute('y', labelPoint.y);
        monthLabel.setAttribute('class', 'season-month-label');
        monthLabel.textContent = new Intl.DateTimeFormat(lang, { month:'short' }).format(monthStart).replace('.', '');
        svg.appendChild(monthLabel);
      }

      const sun = document.createElementNS(svgNS, 'circle');
      sun.setAttribute('cx', center);
      sun.setAttribute('cy', center);
      sun.setAttribute('r', 20);
      sun.setAttribute('fill', '#f8b43c');
      svg.appendChild(sun);
      const marker = document.createElementNS(svgNS, 'circle');
      marker.setAttribute('cx', earth.x);
      marker.setAttribute('cy', earth.y);
      marker.setAttribute('r', 17);
      marker.setAttribute('class', 'season-earth');
      svg.appendChild(marker);

      const orbitLabel = document.createElementNS(svgNS, 'text');
      orbitLabel.setAttribute('x', center);
      orbitLabel.setAttribute('y', 64);
      orbitLabel.setAttribute('class', 'season-label');
      orbitLabel.textContent = t.season_orbit_view || 'Orbit view';
      svg.appendChild(orbitLabel);

      const sideGroup = document.createElementNS(svgNS, 'g');
      sideGroup.setAttribute('transform', 'translate(290 282)');
      const sidePanel = document.createElementNS(svgNS, 'circle');
      sidePanel.setAttribute('cx', 0);
      sidePanel.setAttribute('cy', 0);
      sidePanel.setAttribute('r', 72);
      sidePanel.setAttribute('fill', 'rgba(255,255,255,.72)');
      sidePanel.setAttribute('stroke', '#e5e7eb');
      sidePanel.setAttribute('stroke-width', '1');
      sideGroup.appendChild(sidePanel);

      [-22, 0, 22].forEach(y => {
        const ray = document.createElementNS(svgNS, 'line');
        ray.setAttribute('x1', -58);
        ray.setAttribute('y1', y);
        ray.setAttribute('x2', -9);
        ray.setAttribute('y2', y);
        ray.setAttribute('class', 'season-sunray');
        sideGroup.appendChild(ray);
      });

      const sideEarth = document.createElementNS(svgNS, 'ellipse');
      sideEarth.setAttribute('cx', 18);
      sideEarth.setAttribute('cy', 0);
      sideEarth.setAttribute('rx', 20);
      sideEarth.setAttribute('ry', 24);
      sideEarth.setAttribute('class', 'season-earth');
      sideGroup.appendChild(sideEarth);

      const sideNight = document.createElementNS(svgNS, 'path');
      sideNight.setAttribute('d', 'M 18 -24 A 20 24 0 0 1 18 24 Z');
      sideNight.setAttribute('class', 'season-night');
      sideGroup.appendChild(sideNight);

      const axisAngle = -declination * Math.PI / 180;
      const axisLength = 62;
      const sideAxis = document.createElementNS(svgNS, 'line');
      const northX = 18 + Math.sin(axisAngle) * axisLength / 2;
      const northY = -Math.cos(axisAngle) * axisLength / 2;
      const southX = 18 - Math.sin(axisAngle) * axisLength / 2;
      const southY = Math.cos(axisAngle) * axisLength / 2;
      sideAxis.setAttribute('x1', southX);
      sideAxis.setAttribute('y1', southY);
      sideAxis.setAttribute('x2', northX);
      sideAxis.setAttribute('y2', northY);
      sideAxis.setAttribute('class', 'season-axis');
      sideGroup.appendChild(sideAxis);

      const northPole = document.createElementNS(svgNS, 'circle');
      northPole.setAttribute('cx', northX);
      northPole.setAttribute('cy', northY);
      northPole.setAttribute('r', 3.5);
      northPole.setAttribute('class', 'season-axis-pole');
      sideGroup.appendChild(northPole);

      const northLabel = document.createElementNS(svgNS, 'text');
      northLabel.setAttribute('x', northX + (northX < 18 ? -9 : 9));
      northLabel.setAttribute('y', northY - 4);
      northLabel.setAttribute('class', 'season-declination-label');
      northLabel.textContent = 'N';
      sideGroup.appendChild(northLabel);

      const tiltText = document.createElementNS(svgNS, 'text');
      tiltText.setAttribute('x', 0);
      tiltText.setAttribute('y', 56);
      tiltText.setAttribute('class', 'season-label');
      tiltText.textContent = (t.season_tilt_view || 'Sun angle') + ': ' + Math.abs(declination).toFixed(1) + '° ' + (declination >= 0 ? (t.season_north || 'N') : (t.season_south || 'S'));
      sideGroup.appendChild(tiltText);
      svg.appendChild(sideGroup);
      target.appendChild(svg);

      if (summary) {
        summary.innerHTML = `<div>${t.season_explain || 'Top-down orbit plus oblique inset for axial tilt.'}</div>`
          + `<div>${t.season_cause || 'Summer and winter happen because Earth’s tilted axis changes the Sun height and daylight length.'}</div>`
          + `<div><strong>${t.season_current || 'Current season'}: </strong>${seasonNameForFraction(fraction)}</div>`
          + `<div><strong>${t.season_progress || 'Year progress since Jan 1'}: </strong>${Math.round(fraction * 100)}%</div>`
          + `<div><strong>${t.season_solar_tilt || 'Solar tilt'}: </strong>${Math.abs(declination).toFixed(1)}° ${declination >= 0 ? (t.season_toward_north || 'toward northern hemisphere') : (t.season_toward_south || 'toward southern hemisphere')}</div>`;
      }
      scheduleMasonryLayout();
    }

    function renderSpacecraft(){
      const target = document.getElementById('spacecraftMap');
      const summary = document.getElementById('spacecraftSummary');
      if (!target) return;
      const size = 460;
      const center = size / 2;
      const maxRadius = size * 0.42;
      const maxAu = 180;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.spacecraft_aria || 'Approximate spacecraft distances from the Sun');
      [1, 5.2, 30, 100].forEach(au => {
        const orbit = document.createElementNS(svgNS, 'circle');
        orbit.setAttribute('cx', center);
        orbit.setAttribute('cy', center);
        orbit.setAttribute('r', Math.log10(1 + au) / Math.log10(1 + maxAu) * maxRadius);
        orbit.setAttribute('class', 'spacecraft-orbit');
        svg.appendChild(orbit);
      });
      const sun = document.createElementNS(svgNS, 'circle');
      sun.setAttribute('cx', center);
      sun.setAttribute('cy', center);
      sun.setAttribute('r', 15);
      sun.setAttribute('fill', '#f8b43c');
      svg.appendChild(sun);
      (phenomenaConfig.spacecraft || []).forEach((craft, index) => {
        const angle = (craft.angle ?? (index * 36)) * Math.PI / 180;
        const radius = Math.log10(1 + craft.distanceAu) / Math.log10(1 + maxAu) * maxRadius;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const controlRadius = radius * .45;
        const c1x = center + Math.cos(angle - .28) * controlRadius;
        const c1y = center + Math.sin(angle - .28) * controlRadius;
        const c2x = center + Math.cos(angle + .16) * radius * .82;
        const c2y = center + Math.sin(angle + .16) * radius * .82;
        const track = document.createElementNS(svgNS, 'path');
        track.setAttribute('d', `M ${center} ${center} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`);
        track.setAttribute('class', 'spacecraft-track');
        track.setAttribute('stroke', craft.color || '#2563eb');
        svg.appendChild(track);
        const marker = document.createElementNS(svgNS, 'circle');
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', 7);
        marker.setAttribute('fill', craft.color || '#2563eb');
        marker.setAttribute('class', 'spacecraft-marker');
        svg.appendChild(marker);
        const label = document.createElementNS(svgNS, 'text');
        const labelOffset = radius < 56 ? 30 : 16;
        const rawLabelX = x + Math.cos(angle) * labelOffset;
        const rawLabelY = y + Math.sin(angle) * labelOffset;
        const labelX = Math.max(34, Math.min(size - 34, rawLabelX));
        const labelY = Math.max(22, Math.min(size - 22, rawLabelY));
        label.setAttribute('class', 'spacecraft-label');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', rawLabelX > size - 70 ? 'end' : (rawLabelX < 70 ? 'start' : 'middle'));
        label.setAttribute('dominant-baseline', rawLabelY < 30 ? 'hanging' : (rawLabelY > size - 30 ? 'auto' : 'middle'));
        label.textContent = craft.name + ' · ' + craft.distanceAu + ' AU';
        svg.appendChild(label);
      });
      target.appendChild(svg);
      if (summary) {
        const farthest = (phenomenaConfig.spacecraft || []).slice().sort((a,b) => b.distanceAu - a.distanceAu)[0];
        summary.innerHTML = `<div><strong>${t.spacecraft_farthest || 'Farthest'}: </strong>${farthest ? farthest.name + ' · ' + farthest.distanceAu + ' AU' : '-'}</div>`
          + `<div><strong>${t.spacecraft_count || 'Shown'}: </strong>${(phenomenaConfig.spacecraft || []).length}</div>`;
      }
      scheduleMasonryLayout();
    }

    function updateSolarDateFromSlider(){
      const slider = document.getElementById('solarDateSlider');
      solarDayOffset = Number(slider.value) || 0;
      slider.setAttribute('aria-valuenow', String(solarDayOffset));
      debugDateUi('slider-input', { value: solarDayOffset });
      refreshDateDrivenTilesWithAnchor();
    }

    function resetSolarDate(){
      const slider = document.getElementById('solarDateSlider');
      slider.value = '0';
      solarDayOffset = 0;
      slider.setAttribute('aria-valuenow', '0');
      debugDateUi('reset-today');
      refreshDateDrivenTilesWithAnchor();
    }

    function stepSolarDate(days){
      const slider = document.getElementById('solarDateSlider');
      const minimum = Number(slider.min);
      const maximum = Number(slider.max);
      solarDayOffset = Math.max(minimum, Math.min(maximum, solarDayOffset + days));
      slider.value = String(solarDayOffset);
      slider.setAttribute('aria-valuenow', String(solarDayOffset));
      debugDateUi('step-days', { days });
      refreshDateDrivenTilesWithAnchor();
    }

    function stepSolarDateByMonths(months){
      const current = selectedSolarDate();
      const shifted = new Date(current);
      shifted.setMonth(shifted.getMonth() + months);
      const nextOffset = Math.round((shifted - new Date()) / 86400000);
      const slider = document.getElementById('solarDateSlider');
      const minimum = Number(slider.min);
      const maximum = Number(slider.max);
      solarDayOffset = Math.max(minimum, Math.min(maximum, nextOffset));
      slider.value = String(solarDayOffset);
      slider.setAttribute('aria-valuenow', String(solarDayOffset));
      debugDateUi('step-months', { months, nextOffset });
      refreshDateDrivenTilesWithAnchor();
    }

    let solarHoldDelay=null, solarHoldInterval=null, solarHoldTriggered=false;

    function startSolarDateHold(days){
      stopSolarDateHold();
      solarHoldTriggered=false;
      solarHoldDelay=setTimeout(()=>{
        solarHoldTriggered=true;
        stepSolarDate(days);
        solarHoldInterval=setInterval(() => stepSolarDate(days), 300);
      },500);
    }

    function stopSolarDateHold(){
      clearTimeout(solarHoldDelay);
      clearInterval(solarHoldInterval);
      solarHoldDelay=null;
      solarHoldInterval=null;
    }

    function handleSolarStepClick(days){
      if(solarHoldTriggered){
        solarHoldTriggered=false;
        return;
      }
      stepSolarDate(days);
    }

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


    // Moon model
function computeMoon(date){
  const synodic  = 29.530588861;                 // mittlere synodische Periode
  const knownNew = Date.UTC(2000,0,6,18,14,0);   // Referenz-Neumond (UTC)

  // Berechnung basiert auf UTC-Zeit des Datums für konsistente Phasen
  const currentUTC = Date.UTC(
      date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()
  );

  const days     = (currentUTC - knownNew) / 86400000;
  const age      = ((days % synodic) + synodic) % synodic;
  const frac     = age / synodic;                // 0..1, 0 = Neumond, 0.5 = Vollmond

  const illumRaw = 0.5 * (1 - Math.cos(2 * Math.PI * frac));
  const illum    = Math.round(illumRaw * 100);

  let key, icon;

  // *** Korrekte Zuordnung ***
  if (illum <= 2) {                         // ~0 %
    key = 'phase_new';       icon = '??';
  } else if (illum < 45 && frac < 0.5) {    // 2-45 %, zunehmend
    key = 'phase_wax_cres';  icon = '??';
  } else if (illum >= 45 && illum <= 55 && frac < 0.5) { // ~50 %, zunehmend
    key = 'phase_first_q';   icon = '??';
  } else if (illum > 55 && illum < 95 && frac < 0.5) {   // >55 %, <95 %, zunehmend
    key = 'phase_wax_gibb';  icon = '??';
  } else if (illum >= 95) {                    // ~Vollmond
    key = 'phase_full';      icon = '??';
  } else if (illum > 55 && frac > 0.5) {       // >55 %, abnehmend
    key = 'phase_wan_gibb';  icon = '??';
  } else if (illum >= 45 && illum <= 55 && frac > 0.5) { // ~50 %, abnehmend
    key = 'phase_last_q';    icon = '??';
  } else {                                     // <45 %, abnehmend
    key = 'phase_wan_cres';  icon = '??';
  }

  return { icon, key, illum, frac };
}



    function nextFullMoon(fromDate){
      const synodic = 29.530588861;
      const now     = computeMoon(fromDate);
      const frac    = now.frac;
      let deltaFrac = (0.5 - frac);
      if(deltaFrac <= 0) deltaFrac += 1;
      const deltaDays = deltaFrac * synodic;
      return new Date(fromDate.getTime() + deltaDays*86400000);
    }

    function moonNodeDistance(date){
      const draconic = 27.212220817;
      const knownNode = Date.UTC(2000,0,9,0,0,0);
      const currentUTC = Date.UTC(
        date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()
      );
      const days = (currentUTC - knownNode) / 86400000;
      const phase = ((days % draconic) + draconic) % draconic / draconic;
      // Two lunar nodes exist 180° apart, so the nearest node can lie at
      // phase 0, 0.5 or 1.0 in the draconic cycle.
      const distance = Math.min(
        phase,
        Math.abs(phase - 0.5),
        1 - phase
      );
      return { phase, distanceDays:distance * draconic };
    }

    function renderEclipseGeometry(date = new Date()){
      const target = document.getElementById('eclipseGeometryMap');
      const status = document.getElementById('eclipseGeometryStatus');
      if (!target) return;
      const m = computeMoon(date);
      const node = moonNodeDistance(date);
      const nearNew = Math.min(m.frac, 1 - m.frac);
      const nearFull = Math.abs(m.frac - 0.5);
      const phaseNear = Math.min(nearNew, nearFull);
      const isSolarSide = nearNew <= nearFull;
      const nodePct = Math.min(1, node.distanceDays / 4.5);
      const phasePct = Math.min(1, phaseNear / 0.08);
      const chance = Math.max(0, Math.round((1 - Math.max(nodePct, phasePct)) * 100));
      const sizeW = 320;
      const sizeH = 120;
      const svgNS = 'http://www.w3.org/2000/svg';
      target.innerHTML = '';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + sizeW + ' ' + sizeH);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', t.eclipse_geometry_aria || 'Eclipse geometry');

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', 34);
      line.setAttribute('y1', 60);
      line.setAttribute('x2', 286);
      line.setAttribute('y2', 60);
      line.setAttribute('stroke', '#cbd5e1');
      line.setAttribute('stroke-width', '3');
      svg.appendChild(line);

      const nodeBandGlow = document.createElementNS(svgNS, 'ellipse');
      nodeBandGlow.setAttribute('cx', 160);
      nodeBandGlow.setAttribute('cy', 60);
      nodeBandGlow.setAttribute('rx', 38);
      nodeBandGlow.setAttribute('ry', 33);
      nodeBandGlow.setAttribute('fill', chance > 35 ? 'rgba(59,130,246,.10)' : 'rgba(148,163,184,.10)');
      svg.appendChild(nodeBandGlow);

      const nodeBand = document.createElementNS(svgNS, 'ellipse');
      nodeBand.setAttribute('cx', 160);
      nodeBand.setAttribute('cy', 60);
      nodeBand.setAttribute('rx', 29);
      nodeBand.setAttribute('ry', 25);
      nodeBand.setAttribute('fill', chance > 35 ? 'rgba(37,99,235,.20)' : 'rgba(148,163,184,.14)');
      nodeBand.setAttribute('stroke', chance > 35 ? '#60a5fa' : '#94a3b8');
      nodeBand.setAttribute('stroke-width', '2');
      svg.appendChild(nodeBand);

      const nodeAxis = document.createElementNS(svgNS, 'line');
      nodeAxis.setAttribute('x1', 160);
      nodeAxis.setAttribute('y1', 28);
      nodeAxis.setAttribute('x2', 160);
      nodeAxis.setAttribute('y2', 92);
      nodeAxis.setAttribute('stroke', chance > 35 ? 'rgba(37,99,235,.7)' : 'rgba(100,116,139,.46)');
      nodeAxis.setAttribute('stroke-width', '2');
      nodeAxis.setAttribute('stroke-dasharray', '3 4');
      svg.appendChild(nodeAxis);

      const sun = document.createElementNS(svgNS, 'circle');
      sun.setAttribute('cx', 50);
      sun.setAttribute('cy', 60);
      sun.setAttribute('r', 15);
      sun.setAttribute('fill', '#f8b43c');
      svg.appendChild(sun);

      const earth = document.createElementNS(svgNS, 'circle');
      earth.setAttribute('cx', 160);
      earth.setAttribute('cy', 60);
      earth.setAttribute('r', 13);
      earth.setAttribute('fill', '#2586d7');
      svg.appendChild(earth);

      const orbit = document.createElementNS(svgNS, 'ellipse');
      orbit.setAttribute('cx', 160);
      orbit.setAttribute('cy', 60);
      orbit.setAttribute('rx', 68);
      orbit.setAttribute('ry', 22);
      orbit.setAttribute('fill', 'none');
      orbit.setAttribute('stroke', 'rgba(100,116,139,.42)');
      orbit.setAttribute('stroke-width', '1.5');
      orbit.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(orbit);

      const orbitLabel = document.createElementNS(svgNS, 'text');
      orbitLabel.setAttribute('x', 160);
      orbitLabel.setAttribute('y', 104);
      orbitLabel.setAttribute('text-anchor', 'middle');
      orbitLabel.setAttribute('class', 'season-declination-label');
      orbitLabel.textContent = t.eclipse_orbit || 'Moon orbit';
      svg.appendChild(orbitLabel);

      const baseAngle = isSolarSide ? Math.PI : 0;
      const orbitAngle = baseAngle + (node.phase < 0.5 ? -1 : 1) * nodePct * 1.08;
      const moonX = 160 + Math.cos(orbitAngle) * 68;
      const moonY = 60 + Math.sin(orbitAngle) * 22;
      const moonGlow = document.createElementNS(svgNS, 'circle');
      moonGlow.setAttribute('cx', moonX);
      moonGlow.setAttribute('cy', moonY);
      moonGlow.setAttribute('r', chance >= 55 ? 12 : (chance >= 25 ? 9 : 7));
      moonGlow.setAttribute('fill', chance >= 55 ? 'rgba(59,130,246,.16)' : (chance >= 25 ? 'rgba(148,163,184,.12)' : 'rgba(148,163,184,.07)'));
      svg.appendChild(moonGlow);

      const moon = document.createElementNS(svgNS, 'circle');
      moon.setAttribute('cx', moonX);
      moon.setAttribute('cy', moonY);
      moon.setAttribute('r', 7);
      moon.setAttribute('fill', chance >= 55 ? '#60a5fa' : (chance >= 25 ? '#f7c84b' : '#cbd5e1'));
      moon.setAttribute('stroke', chance >= 55 ? '#1d4ed8' : '#475569');
      moon.setAttribute('stroke-width', chance >= 55 ? '1.5' : '1');
      svg.appendChild(moon);

      [
        [50, 92, t.eclipse_sun || 'Sun'],
        [160, 92, t.eclipse_earth || 'Earth'],
        [moonX, moonY - 12, t.eclipse_moon || 'Moon'],
        [160, 31, t.eclipse_node_zone || 'Node zone']
      ].forEach(([x, y, label]) => {
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'season-declination-label');
        text.textContent = label;
        svg.appendChild(text);
      });
      target.appendChild(svg);

      if (status) {
        const hasEclipseGeometry = phasePct < 1 && nodePct < 1 && chance >= 12;
        const type = hasEclipseGeometry
          ? (isSolarSide ? (t.eclipse_solar_possible || 'solar eclipse geometry') : (t.eclipse_lunar_possible || 'lunar eclipse geometry'))
          : (t.eclipse_none_possible || 'no eclipse geometry today');
        status.textContent = type + '. '
          + (t.eclipse_node_distance || 'Node distance') + ': ' + node.distanceDays.toFixed(1) + ' d.';
      }

      const infoPopup = document.getElementById('eclipseInfoPopup');
      if (infoPopup) {
        infoPopup.innerHTML = '<div>' + (t.eclipse_geometry_explain || 'The sketch shows Sun, Earth and Moon along the eclipse line; the blue zone marks where the Moon should cross the node region.')
          + ' ' + (t.eclipse_geometry_hint || 'Eclipses need new/full moon near a lunar node.') + '</div>'
          + '<div style="margin-top:8px;">' + (t.eclipse_geometry_legend || 'Blue Moon = high eclipse proximity; pale Moon = low eclipse proximity.') + '</div>';
      }
    }

    function renderMoon(){
      const now = new Date();
      const tz  = document.getElementById('timezone').value;
      const m   = computeMoon(now);
      const nf  = nextFullMoon(now);

      const moonIcon = document.getElementById('moonIcon');
      const moonText = document.getElementById('moonText');
      if (moonIcon) {
        moonIcon.textContent = m.icon;
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
      if (nextFull) nextFull.textContent = t.next_full + ': ' + fmtTZ(nf, tz);
      renderEclipseGeometry(selectedSolarDate());
    }

    function renderEarthMoon(){
      const now = new Date();
      const m   = computeMoon(now);
      const emIcon = document.getElementById('emIcon');
      const emPhaseText = document.getElementById('emPhaseText');
      if (emIcon) emIcon.textContent = m.icon;
      if (emPhaseText) {
        emPhaseText.textContent = t.phase_label + ': ' + t[m.key] + ' (' + m.illum + '%)';
      }
    }

    function announceTime(){
      const timeString = document.getElementById('time').textContent;
      const msg        = new SpeechSynthesisUtterance(timeString);
      msg.lang = lang;
      speechSynthesis.speak(msg);
    }

    // Stopwatch & Countdown
    let stopwatchInterval=null, stopwatchTime=0;
    let countdownInterval=null, countdownTime=0;
    const cdMinutesInput = document.getElementById('countdownMinutes'); // Für Fehler-Handling

    function startStopwatch(){
      if(stopwatchInterval) return;
      stopwatchInterval = setInterval(()=>{
        stopwatchTime++;
        const h = String(Math.floor(stopwatchTime/3600)).padStart(2,'0');
        const m = String(Math.floor((stopwatchTime%3600)/60)).padStart(2,'0');
        const s = String(stopwatchTime%60).padStart(2,'0');
        document.getElementById('stopwatch').textContent = `${h}:${m}:${s}`;
      },1000);
    }
    function stopStopwatch(){
      if(!stopwatchInterval) return;
      clearInterval(stopwatchInterval);
      stopwatchInterval=null;
    }
    function resetStopwatch(){
      stopStopwatch();
      stopwatchTime=0;
      document.getElementById('stopwatch').textContent='00:00:00';
    }

    function startCountdown(){
      const minutes = parseInt(cdMinutesInput.value,10);

      if(isNaN(minutes) || minutes<=0){
        cdMinutesInput.classList.add('error');
        setTimeout(() => cdMinutesInput.classList.remove('error'), 1000);
        return;
      }

      cdMinutesInput.classList.remove('error');

      if(countdownInterval) return;

      countdownTime = minutes*60;
      document.getElementById('countdown').textContent =
        `${String(minutes).padStart(2,'0')}:00`;

      countdownInterval = setInterval(()=>{
        if(countdownTime>0){
          countdownTime--;
          const mm = String(Math.floor(countdownTime/60)).padStart(2,'0');
          const ss = String(countdownTime%60).padStart(2,'0');
          document.getElementById('countdown').textContent = `${mm}:${ss}`;
        } else {
          clearInterval(countdownInterval);
          countdownInterval=null;
          alert(t.countdown_done);
        }
      },1000);
    }

    function stopCountdown(){
      if(!countdownInterval) return;
      clearInterval(countdownInterval);
      countdownInterval=null;
    }
    // Font & fancy display
    function changeFont(){
      const selectedFont = document.getElementById('fontSelector').value;
      // Ändert nur die Schriftart der Zeitanzeigen, nicht des ganzen Bodys
      document.getElementById('time').style.fontFamily = selectedFont;
      document.getElementById('date').style.fontFamily = selectedFont;
    }
    function changeDisplayMode(){
      const mode = document.getElementById('displayMode').value;
      const el   = document.getElementById('time');
      el.className = 'time-' + mode;
    }

    // Wire up
    document.getElementById('timezone').addEventListener('change', () => {
      updateTime();
      updateInfrequent();
    });
    document.getElementById('fontSelector').addEventListener('change', changeFont);
    document.getElementById('displayMode').addEventListener('change', changeDisplayMode);
    document.getElementById('solarDateSlider').addEventListener('input', updateSolarDateFromSlider);
    document.getElementById('btnSolarToday').addEventListener('click', resetSolarDate);
    wireSolarStepButton(document.getElementById('btnSolarPrev'), -1);
    wireSolarStepButton(document.getElementById('btnSolarNext'), 1);
    document.getElementById('btnSolarPrevWeek').addEventListener('click', () => stepSolarDate(-7));
    document.getElementById('btnSolarNextWeek').addEventListener('click', () => stepSolarDate(7));
    document.getElementById('btnSolarPrevMonth').addEventListener('click', () => stepSolarDateByMonths(-1));
    document.getElementById('btnSolarNextMonth').addEventListener('click', () => stepSolarDateByMonths(1));
      document.getElementById('btnSolarPrevYear').addEventListener('click', () => stepSolarDateByMonths(-12));
      document.getElementById('btnSolarNextYear').addEventListener('click', () => stepSolarDateByMonths(12));
      [
        'btnSolarPrevYear',
        'btnSolarPrevMonth',
        'btnSolarPrevWeek',
        'btnSolarPrev',
        'btnSolarToday',
        'btnSolarNext',
        'btnSolarNextWeek',
        'btnSolarNextMonth',
        'btnSolarNextYear'
      ].forEach(id => {
        const button = document.getElementById(id);
        if (!button) return;
        button.addEventListener('pointerdown', event => {
          debugDateUi('button-pointerdown', { id });
          event.preventDefault();
        });
        button.addEventListener('click', () => {
          debugDateUi('button-click', { id });
          button.blur();
        });
      });
    document.getElementById('locationSelector').addEventListener('change', event => {
      selectedLocationKey = event.target.value;
      refreshDateDrivenTilesWithAnchor();
    });
    document.querySelectorAll('[data-calendar-filter]').forEach(button => {
      button.addEventListener('pointerdown', event => event.preventDefault());
      button.addEventListener('click', () => setCalendarFilter(button.dataset.calendarFilter, true));
    });
    document.getElementById('calendarShowPast').addEventListener('change', () => {
      showAllCalendarEvents = false;
      renderCalendar();
    });
    document.getElementById('btnCalendarShowAll').addEventListener('click', toggleCalendarShowAll);
    const eclipseInfo = document.getElementById('eclipseInfo');
    const eclipseInfoButton = document.getElementById('eclipseInfoButton');
    if (eclipseInfo && eclipseInfoButton) {
      eclipseInfoButton.addEventListener('click', event => {
        event.stopPropagation();
        const isOpen = eclipseInfo.classList.toggle('open');
        eclipseInfoButton.setAttribute('aria-expanded', String(isOpen));
      });
      document.addEventListener('click', event => {
        if (!eclipseInfo.contains(event.target)) {
          eclipseInfo.classList.remove('open');
          eclipseInfoButton.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          eclipseInfo.classList.remove('open');
          eclipseInfoButton.setAttribute('aria-expanded', 'false');
        }
      });
    }
    window.addEventListener('pointerup', stopSolarDateHold);

    populateLocationSelector();
    applyI18n();
    initCardHelp();
    updateTime();

    // Hauptuhr-Intervall (jede Sekunde)
    setInterval(updateTime,1000);

    // Half-hourly refresh for time-dependent cards.
    initMasonryLayout();
    refreshDynamicTiles();
    setInterval(refreshDynamicTiles, 1800000);

	    // --- Erde-Mond elliptische Bahn ---
    // iOS/Safari kann bei Layout-Start kurz 0px als Elementgröße liefern.
    // Deshalb: Animation erst nach Layout berechnen, mit getBoundingClientRect-Fallback
    // und zeitbasiert statt framebasiert laufen lassen.
    let emAnimationStarted = false;

    function animateEarthMoon(timestamp){
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

      requestAnimationFrame(animateEarthMoon);
    }

    function startEarthMoonAnimation(){
      if (emAnimationStarted) return;
      emAnimationStarted = true;
      requestAnimationFrame(animateEarthMoon);
    }

    // Initial render. pageshow hilft iOS, wenn eine Seite aus dem Back/Forward-Cache kommt.
    startEarthMoonAnimation();
    window.addEventListener('pageshow', startEarthMoonAnimation);
    window.addEventListener('resize', () => {
      requestAnimationFrame(animateEarthMoon);
      requestAnimationFrame(() => renderSolarSystem());
    });
  
