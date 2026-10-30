window.PLANETENUHR_DASHBOARD_I18N = (() => {
  'use strict';

  /** Creates the localized dashboard initialization controller.
   * @param {object} dependencies DOM, translations, language and controller accessors.
   * @returns {{apply:Function}} Function that applies UI translations once.
   */
  function create(dependencies){
    const document = dependencies.document;
    const window = dependencies.window;
    /** Applies localized labels and initializes translated card controls.
     * @returns {void} No value.
     */
    function apply(){
      const lang = dependencies.getLanguage();
      const t = dependencies.getTranslations();
      const dateLocationControls = dependencies.dateLocationControls;
      const cardSizes = dependencies.cardSizes;
      const calendarController = dependencies.getCalendarController();
      const skyKnowledge = dependencies.getSkyKnowledge();
      const dailyHighlights = dependencies.getDailyHighlights();
      const milkyWayCard = dependencies.getMilkyWayCard();
      const dashboardContext = dependencies.dashboardContext;
      document.documentElement.lang = lang;
      window.PLANETENUHR_APP_UPDATES.render();
      milkyWayCard.render(t);
      document.getElementById('titleSolarSystem').textContent = t.title_solar_system;
      document.getElementById('solarLegend').textContent      = t.legend_solar;
      const titleDateLocation = document.getElementById('titleDateLocation');
      if (titleDateLocation) titleDateLocation.textContent = t.title_date_location;
      const labelLocation = document.getElementById('labelLocation');
      if (labelLocation) labelLocation.textContent = t.label_location;
      const labelGlobalCardSize = document.getElementById('labelGlobalCardSize');
      if (labelGlobalCardSize) labelGlobalCardSize.textContent = t.date_global_card_size || 'All cards';
      const btnSolarTodayMobile = document.getElementById('btnSolarTodayMobile');
      if (btnSolarTodayMobile) {
        btnSolarTodayMobile.textContent = t.solar_today;
      }
      document.querySelectorAll('[data-date-settings-toggle]').forEach(button => {
        button.setAttribute('aria-label', t.date_settings_toggle || 'Open settings');
      });
      const titleSmallBodies = document.getElementById('titleSmallBodies');
      if (titleSmallBodies) titleSmallBodies.textContent = t.title_small_bodies;
      const smallBodiesLegend = document.getElementById('smallBodiesLegend');
      if (smallBodiesLegend) smallBodiesLegend.textContent = t.legend_small_bodies;
      const titleMoonNodes = document.getElementById('titleMoonNodes');
      if (titleMoonNodes) titleMoonNodes.textContent = t.title_moon_nodes || 'Moon nodes & eclipse season';
      const moonNodesLegend = document.getElementById('moonNodesLegend');
      if (moonNodesLegend) moonNodesLegend.textContent = t.legend_moon_nodes || 'Node geometry and approximate eclipse-season cycle';
      const titleBarycenter = document.getElementById('titleBarycenter');
      if (titleBarycenter) titleBarycenter.textContent = t.title_barycenter || 'Solar barycenter';
      const barycenterLegend = document.getElementById('barycenterLegend');
      if (barycenterLegend) barycenterLegend.textContent = t.legend_barycenter || 'Top-down wobble of the Sun around the solar-system barycenter';
      const btnBarycenterJupiter = document.getElementById('btnBarycenterJupiter');
      if (btnBarycenterJupiter) btnBarycenterJupiter.textContent = t.barycenter_mode_jupiter || 'Jupiter';
      const btnBarycenterJupiterSaturn = document.getElementById('btnBarycenterJupiterSaturn');
      if (btnBarycenterJupiterSaturn) btnBarycenterJupiterSaturn.textContent = t.barycenter_mode_jupiter_saturn || 'Jupiter + Saturn';
      const btnBarycenterAll = document.getElementById('btnBarycenterAll');
      if (btnBarycenterAll) btnBarycenterAll.textContent = t.barycenter_mode_all || 'All planets';
      const titleLagrange = document.getElementById('titleLagrange');
      if (titleLagrange) titleLagrange.textContent = t.title_lagrange || 'Lagrange points';
      const lagrangeLegend = document.getElementById('lagrangeLegend');
      if (lagrangeLegend) lagrangeLegend.textContent = t.legend_lagrange || 'Sun-Earth geometry schematic; L1/L2 distances exaggerated for readability';
      const titleAnalemma = document.getElementById('titleAnalemma');
      if (titleAnalemma) titleAnalemma.textContent = t.title_analemma || 'Analemma';
      const analemmaLegend = document.getElementById('analemmaLegend');
      if (analemmaLegend) analemmaLegend.textContent = t.legend_analemma || '12:00 local clock time; figure depends on year and selected location';
      const titleExoplanets = document.getElementById('titleExoplanets');
      if (titleExoplanets) titleExoplanets.textContent = t.title_exoplanets || 'Exoplanet comparison';
      const exoplanetLegend = document.getElementById('exoplanetLegend');
      if (exoplanetLegend) exoplanetLegend.textContent = t.legend_exoplanets || 'Each panel is normalized to its own outer orbit; motion is schematic';
      const titlePolaris = document.getElementById('titlePolaris');
      if (titlePolaris) titlePolaris.textContent = t.title_polaris || 'Polaris & north celestial pole';
      const polarisLegend = document.getElementById('polarisLegend');
      if (polarisLegend) polarisLegend.textContent = t.legend_polaris || 'North horizon view for the selected location; Polaris is shown with enlarged offset';
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
      document.getElementById('timeControlLabel').textContent = t.time_control_label;
      document.getElementById('timeOfDaySlider').setAttribute('aria-label', t.time_control_slider);
      document.getElementById('btnTimeNow').textContent = t.time_now;
      document.getElementById('btnTimeNow').setAttribute('aria-label', t.time_now_aria);
      document.getElementById('btnSolarToday').textContent    = t.solar_today;
      document.getElementById('btnSolarPrev').setAttribute('aria-label', t.solar_prev_day);
      document.getElementById('btnSolarNext').setAttribute('aria-label', t.solar_next_day);
      document.getElementById('btnSolarPrevMobile').setAttribute('aria-label', t.solar_prev_day);
      document.getElementById('btnSolarNextMobile').setAttribute('aria-label', t.solar_next_day);
      document.getElementById('btnSolarPrevWeek').setAttribute('aria-label', t.solar_prev_week);
      document.getElementById('btnSolarNextWeek').setAttribute('aria-label', t.solar_next_week);
      document.getElementById('btnSolarPrevMonth').setAttribute('aria-label', t.solar_prev_month);
      document.getElementById('btnSolarNextMonth').setAttribute('aria-label', t.solar_next_month);
      document.getElementById('btnSolarPrevYear').setAttribute('aria-label', t.solar_prev_year);
      document.getElementById('btnSolarNextYear').setAttribute('aria-label', t.solar_next_year);
      dateLocationControls.updateSolarAutoplayButton();
      dateLocationControls.updateTimeControlReadout();
      dateLocationControls.updateTimeAutoplayButton();
      cardSizes.updateGlobalCardSizeControlState();
      dateLocationControls.updateDateSettingsToggleState();
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
      document.getElementById('earthMoonViewNote').textContent = t.earth_moon_view_note;
      document.getElementById('titleMoon').textContent       = t.title_moon;
      const titleEclipseGeometry = document.getElementById('titleEclipseGeometry');
      if (titleEclipseGeometry) titleEclipseGeometry.textContent = t.title_eclipse_geometry;
      document.getElementById('titleOtherPlanets').textContent = t.title_other_planets;
      document.getElementById('otherPlanetsLegend').textContent = t.legend_other_planets;
      document.getElementById('titleSkyCalendar').textContent = t.title_sky_calendar;
      cardSizes.resizableDashboardCards().forEach(card => {
        cardSizes.updateCardSizeControlState(card);
      });

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
      document.querySelectorAll('[data-calendar-view]').forEach(button => {
        const view = button.dataset.calendarView;
        if (view === 'list') {
          button.textContent = t.calendar_view_list || 'List';
        }
        if (view === 'month') {
          button.textContent = t.calendar_view_month || 'Month';
        }
      });
      const showPastLabel = document.getElementById('calendarShowPastLabel');
      if (showPastLabel) showPastLabel.textContent = t.calendar_show_past;
      const calendarDataUntil = document.getElementById('calendarDataUntil');
      if (calendarDataUntil) calendarDataUntil.textContent = t.calendar_data_until;
      const calendarShowAll = document.getElementById('btnCalendarShowAll');
      if (calendarShowAll) {
        if (calendarController && calendarController.getState().showAll) {
          calendarShowAll.textContent = t.calendar_show_less;
        } else {
          calendarShowAll.textContent = t.calendar_show_all;
        }
      }
      const calendarMonthSubtitle = document.getElementById('calendarMonthSubtitle');
      if (calendarMonthSubtitle) {
        calendarMonthSubtitle.textContent = t.calendar_month_subtitle || 'Monthly view with event list';
      }
      const titleBskyFeed = document.getElementById('titleBskyFeed');
      if (titleBskyFeed) titleBskyFeed.textContent = t.bsky_title;
      const bskyStatus = document.getElementById('bskyStatus');
      if (bskyStatus) bskyStatus.textContent = t.bsky_loading;

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
      calendarController.render();
      if (skyKnowledge) {
        skyKnowledge.render();
      }
      if (dailyHighlights) dailyHighlights.render(dashboardContext.getDate());
    }


    return {apply};
  }

  return {create};
})();
