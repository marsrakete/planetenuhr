

    window.PLANETENUHR_DASHBOARD_ERRORS.install({window, alert:window.alert.bind(window), console});

    // --- i18n ---
    let lang = 'en';
    const browserLanguage = (navigator.language || 'en').toLowerCase();
    if (browserLanguage.startsWith('de')) {
      lang = 'de';
    } else if (browserLanguage.startsWith('fr')) {
      lang = 'fr';
    }
    const initialUrlParams = new URLSearchParams(window.location.search);
    const requestedLanguageFromUrl = String(initialUrlParams.get('lang') || '').toLowerCase();
    if (requestedLanguageFromUrl === 'de') {
      lang = 'de';
    } else if (requestedLanguageFromUrl === 'en') {
      lang = 'en';
    } else if (requestedLanguageFromUrl === 'fr') {
      lang = 'fr';
    }

    const translations = window.PLANETENUHR_TRANSLATIONS || {};
    const t = translations[lang] || translations.en || {};

    const calendarEventsByLang = window.PLANETENUHR_EVENTS || {};
    const skyCalendarModel = window.PLANETENUHR_CALENDAR_MODEL;
    const smallBodiesConfig = window.PLANETENUHR_SMALL_BODIES || { belts:[], comets:[] };
    const phenomenaConfig = window.PLANETENUHR_PHENOMENA || {
      meteorStreams:[],
      constellations:[],
      spacecraft:[],
      exoplanetSystems:[],
      retrogradeBodies:[],
      planetPhaseBodies:[],
      satellites:[]
    };
    const bskyFeeds = window.PLANETENUHR_BSKY_FEEDS || [];
    const eclipsePhaseConfig = window.PLANETENUHR_ECLIPSE_PHASES || [];
    let locations = [];
    if (Array.isArray(window.PLANETENUHR_LOCATIONS) && window.PLANETENUHR_LOCATIONS.length) {
      locations = window.PLANETENUHR_LOCATIONS;
    }
    let eclipseVisibilityConfig = [];
    if (Array.isArray(window.PLANETENUHR_ECLIPSE_VISIBILITY) && window.PLANETENUHR_ECLIPSE_VISIBILITY.length) {
      eclipseVisibilityConfig = window.PLANETENUHR_ECLIPSE_VISIBILITY;
    }
    let eclipseCalendarData = [];
    if (Array.isArray(window.PLANETENUHR_ECLIPSE_CALENDAR_DATA) && window.PLANETENUHR_ECLIPSE_CALENDAR_DATA.length) {
      eclipseCalendarData = window.PLANETENUHR_ECLIPSE_CALENDAR_DATA;
    }
    const dashboardContext = window.PLANETENUHR_DASHBOARD_CONTEXT.create({locations, getLanguage:() => lang});
    const compactCalendarListLimit = 4;
    const sunlightController = window.PLANETENUHR_SUNLIGHT_CARD.create({
      document, solarVisibility:window.PLANETENUHR_SOLAR_VISIBILITY,
      getTranslations:() => t, formatTime:fmtTimeOnly
    });
    const planetVisibilityController = window.PLANETENUHR_PLANET_VISIBILITY_CARD.create({
      document, solarVisibility:window.PLANETENUHR_SOLAR_VISIBILITY,
      signedDegrees:window.PLANETENUHR_COORDINATES.signedDeg,
      getEclipticLongitude:bodyEclipticLongitude, getSolarElongation:solarElongationForKey,
      getBodyDisplayName:bodyDisplayName, getTranslations:() => t, formatTime:fmtTimeOnly
    });
    const polarisController = window.PLANETENUHR_POLARIS_CARD.create({
      document, window, getTranslations:() => t, formatDate:formatDateStamp, formatTime:fmtTimeOnly,
      appendSummaryText, appendSummaryLine
    });

    let calendarController = null;
    let dailyHighlights = null;
    let astronomyExplorer = null;
    let skyKnowledge = null;
    let milkyWayCard = null;
    let idefixMission = null;
    const cardNavigation = window.PLANETENUHR_CARD_NAVIGATION.create({
      document, window, getContext:() => dashboardContext.snapshot(), formatDateKey:window.PLANETENUHR_DATE_TIME.formatDateKey
    });
    const helpController = window.PLANETENUHR_HELP.create({
      document, window, config:window.PLANETENUHR_CARD_HELP || {},
      getLanguage:() => lang, cloneTemplate
    });
    const dashboardLayout = window.PLANETENUHR_LAYOUT.create({
      document, window, refresh:refreshDateDrivenTiles,
      syncDateMobilePanel:() => dateLocationControls.syncDateMobilePanelForViewport()
    });
    const cardSizes = window.PLANETENUHR_CARD_SIZES.create({
      document, window, config:window.PLANETENUHR_CARD_SIZES_CONFIG,
      getTranslations:() => t, cloneTemplate, normalizeCardToken:window.PLANETENUHR_CARD_NAVIGATION.normalizeCardToken,
      layout:dashboardLayout, rerender:rerenderCardsAfterSizeChange
    });
    const dateLocationControls = window.PLANETENUHR_DATE_CONTROLS.create({
      document, window, context:dashboardContext, getTranslations:() => t, getNow:() => new Date(),
      formatDate:formatDateStamp, syncUrl:cardNavigation.syncUrlState,
      refresh:dashboardLayout.refreshDateDrivenTilesWithAnchor, requestLayout:dashboardLayout.requestMasonryLayout,
      locations, getLocationOptionLabel:locationOptionLabel
    });
    const planetarySystemsController = window.PLANETENUHR_PLANETARY_SYSTEMS_CARD.create({
      document, systems:window.PLANETENUHR_PLANETARY_SYSTEMS
    });    const jupiterController = window.PLANETENUHR_JUPITER_CARD.create({
      document, moons:window.PLANETENUHR_JUPITER_MOONS
    });
    const solarSystemController = window.PLANETENUHR_SOLAR_SYSTEM.create({
      document, planets:window.PLANETENUHR_PLANET_ELEMENTS,
      radiusFractions:window.PLANETENUHR_SOLAR_SYSTEM_CONFIG.radiusFractions,
      planetPosition:window.PLANETENUHR_PLANET_MODEL.planetPosition,
      artwork:window.PLANETENUHR_BODY_VISUALS, layoutLabels:window.PLANETENUHR_SOLAR_LABELS.layout,
      getTranslations:() => t, getDisplayTimeZone,
      formatDateTime:fmtTZ
    });
    const moonNodesController = window.PLANETENUHR_MOON_NODES_CARD.create({
      document, window, getTranslations:() => t, getLanguage:() => lang,
      getEclipsePhases:() => eclipsePhaseConfig,
      getEclipseVisibility:eclipseVisibilityForLocation,
      getVisibilityLabel:eclipseVisibilityStatusLabel,
      formatDate:formatDateStamp, formatTime:fmtTimeOnly,
      getEclipticLongitude:bodyEclipticLongitude,
      compassLabelForAzimuth, altitudeThumbEstimate,
      cloneTemplate, appendSummaryText, appendSummaryLine
    });
    const eclipseGeometryController = window.PLANETENUHR_ECLIPSE_GEOMETRY_CARD.create({
      document, window, getTranslations:() => t,
      getEclipseVisibility:eclipseVisibilityForLocation,
      getVisibilityText:eclipseVisibilityLocationText, appendSummaryText
    });
    const earthMoonController = window.PLANETENUHR_EARTH_MOON.create({
      document, window, getTranslations:() => t,
      getDisplayTimeZone,
      computeMoon:window.PLANETENUHR_MOON_MODEL.computeMoon,
      nextFullMoon:window.PLANETENUHR_MOON_MODEL.nextFullMoon, visuals:window.PLANETENUHR_EARTH_MOON_VISUALS,
      compass:window.PLANETENUHR_COMPASS, directionLabel:moonNodesController.moonDirectionLabel,
      directionReferenceDate:moonNodesController.moonDirectionReferenceDate, lookDirection:moonNodesController.moonLookDirectionForDate,
      formatDateTime:fmtTZ
    });
    const conjunctionController = window.PLANETENUHR_CONJUNCTION_CARD.create({
      document, createSvgElement:createChartSvgElement, getEvents:computeConjunctionEvents,
      getLanguage:() => lang, getTranslations:() => t, altitudeEstimate:altitudeThumbEstimate,
      bodyDisplayName, formatDate:formatDateStamp, appendSummaryLine, appendSummaryText,
      requestLayout:dashboardLayout.requestMasonryLayout
    });
    const meteorController = window.PLANETENUHR_METEOR_CARD.create({
      document, getStreams:() => phenomenaConfig.meteorStreams || [],
      getTranslations:() => t, cloneTemplate, createSvgElement:createChartSvgElement,
      daysInYear:window.PLANETENUHR_SOLAR_VISIBILITY.daysInYear, dayOfYear:window.PLANETENUHR_SOLAR_VISIBILITY.dayOfYearLocal, monthDayToDayOfYear, monthDayLabel,
      polarPoint, svgArcPath, formatDate:formatDateStamp, appendSummaryText, appendSummaryLine,
      renderLabels:window.PLANETENUHR_METEOR_LABELS.render, requestLayout:dashboardLayout.requestMasonryLayout
    });
    const constellationMonthController = window.PLANETENUHR_CONSTELLATION_MONTH.create({
      document, cloneTemplate, createSvgElement:createChartSvgElement,
      getItems:() => phenomenaConfig.constellations || [], getTranslations:() => t,
      compassLabelForAzimuth, altitudeThumbEstimate, appendSummaryText, appendSummaryLine,
      requestMasonryLayout:dashboardLayout.requestMasonryLayout
    });
    const constellationYearController = window.PLANETENUHR_CONSTELLATION_YEAR.create({
      document, createSvgElement:createChartSvgElement,
      getItems:() => phenomenaConfig.constellations || [], getTranslations:() => t,
      polarPoint, dayOfYearLocal:window.PLANETENUHR_SOLAR_VISIBILITY.dayOfYearLocal, daysInYear:window.PLANETENUHR_SOLAR_VISIBILITY.daysInYear, monthShortLabel, appendSummaryText, appendSummaryLine
    });
    const retrogradeModel = window.PLANETENUHR_RETROGRADE_MODEL.create({
      longitude:geocentricLongitude, latitude:geocentricLatitude,
      signedDeg:window.PLANETENUHR_COORDINATES.signedDeg
    });
    const retrogradeController = window.PLANETENUHR_RETROGRADE_CARD.create({
      document, cloneTemplate, model:retrogradeModel, getTranslations:() => t,
      getBodies:() => phenomenaConfig.retrogradeBodies, clamp01, bodyDisplayName, formatDate:formatDateStamp
    });
    const seasonsController = window.PLANETENUHR_SEASONS.create({
      document, cloneTemplate, createSvgElement:createChartSvgElement, getTranslations:() => t,
      dayOfYearLocal:window.PLANETENUHR_SOLAR_VISIBILITY.dayOfYearLocal, daysInYear:window.PLANETENUHR_SOLAR_VISIBILITY.daysInYear, polarPoint, appendSummaryText, appendSummaryLine,
      requestMasonryLayout:dashboardLayout.requestMasonryLayout
    });
    const innerPlanetsModel = window.PLANETENUHR_INNER_PLANETS_MODEL.create({
      position:window.PLANETENUHR_PLANET_MODEL.heliocentricPosition, elongation:solarElongationForKey
    });
    const innerPlanetsController = window.PLANETENUHR_INNER_PLANETS_CARD.create({
      document, cloneTemplate, model:innerPlanetsModel, getTranslations:() => t,
      getBodies:() => phenomenaConfig.planetPhaseBodies, bodyDisplayName
    });
    const barycenterModel = window.PLANETENUHR_BARYCENTER_MODEL.create({
      planets:window.PLANETENUHR_PLANET_ELEMENTS, position:window.PLANETENUHR_PLANET_MODEL.planetPosition,
      massRatios:window.PLANETENUHR_BARYCENTER_CONFIG.massRatios
    });
    const barycenterController = window.PLANETENUHR_BARYCENTER_CARD.create({
      document, config:window.PLANETENUHR_BARYCENTER_CONFIG, model:barycenterModel,
      createSvgElement:createChartSvgElement, getTranslations:() => t,
      getContext:() => dashboardContext.snapshot(), appendSummaryLine, appendSummaryText,
      requestLayout:dashboardLayout.requestMasonryLayout
    });
    const lagrangeModel = window.PLANETENUHR_LAGRANGE_MODEL.create({
      sunLongitude:window.PLANETENUHR_SOLAR_VISIBILITY.sunLongitude, polarPoint
    });
    const lagrangeController = window.PLANETENUHR_LAGRANGE_CARD.create({
      document, model:lagrangeModel, createSvgElement:createChartSvgElement,
      getTranslations:() => t, appendSummaryLine, appendSummaryText
    });
    const analemmaModel = window.PLANETENUHR_ANALEMMA_MODEL.create({
      solarVisibility:window.PLANETENUHR_SOLAR_VISIBILITY, daysInYear:window.PLANETENUHR_SOLAR_VISIBILITY.daysInYear, dayOfYearLocal:window.PLANETENUHR_SOLAR_VISIBILITY.dayOfYearLocal
    });
    const analemmaController = window.PLANETENUHR_ANALEMMA_CARD.create({
      document, model:analemmaModel, solarVisibility:window.PLANETENUHR_SOLAR_VISIBILITY,
      createSvgElement:createChartSvgElement, getTranslations:() => t, dayOfYearLocal:window.PLANETENUHR_SOLAR_VISIBILITY.dayOfYearLocal,
      appendSummaryLine, appendSummaryText
    });
    const exoplanetsModel = window.PLANETENUHR_EXOPLANETS_MODEL.create({
      julianDate:window.PLANETENUHR_COORDINATES.julianDate,
      normalizeDeg:window.PLANETENUHR_COORDINATES.normalizeDeg
    });
    const exoplanetsController = window.PLANETENUHR_EXOPLANETS_CARD.create({
      document, model:exoplanetsModel, cloneTemplate, createSvgElement:createChartSvgElement,
      getSystems:() => phenomenaConfig.exoplanetSystems, getTranslations:() => t,
      appendSummaryText, appendSummaryLine, formatDate:formatDateStamp
    });
    const satellitesModel = window.PLANETENUHR_SATELLITES_MODEL.create({});
    const satellitesController = window.PLANETENUHR_SATELLITES_CARD.create({
      document, model:satellitesModel, cloneTemplate, createSvgElement:createChartSvgElement,
      getSatellites:() => phenomenaConfig.satellites, getTranslations:() => t, appendSummaryText
    });
    const smallBodiesModel = window.PLANETENUHR_SMALL_BODIES_MODEL.create({});
    const smallBodiesController = window.PLANETENUHR_SMALL_BODIES_CARD.create({
      document, model:smallBodiesModel, config:smallBodiesConfig, cloneTemplate,
      createSvgElement:createChartSvgElement, getTranslations:() => t,
      appendSummaryLine, requestLayout:dashboardLayout.requestMasonryLayout
    });
    const spacecraftModel = window.PLANETENUHR_SPACECRAFT_MODEL.create({});
    const spacecraftController = window.PLANETENUHR_SPACECRAFT_CARD.create({
      document, model:spacecraftModel, getSpacecraft:() => phenomenaConfig.spacecraft,
      createSvgElement:createChartSvgElement, getTranslations:() => t,
      appendSummaryLine, requestLayout:dashboardLayout.requestMasonryLayout
    });
    const auroraData = window.PLANETENUHR_AURORA_DATA.create({
      config:window.PLANETENUHR_AURORA_DATA_CONFIG, fetch:window.fetch.bind(window)
    });
    const auroraController = window.PLANETENUHR_AURORA_CARD.create({
      document, data:auroraData, getTranslations:() => t, cloneTemplate,
      formatDate:formatDateStamp, formatTime:fmtTimeOnly
    });
    const blueskyFeedData = window.PLANETENUHR_BSKY_FEED_DATA.create({
      fetch:window.fetch.bind(window), feeds:bskyFeeds, now:() => new Date()
    });
    const blueskyFeedController = window.PLANETENUHR_BSKY_FEED_CARD.create({
      document, data:blueskyFeedData, feeds:bskyFeeds, cloneTemplate,
      getTranslations:() => t, getLanguage:() => lang, getProtocol:() => location.protocol,
      formatDate:formatDateStamp, requestLayout:dashboardLayout.scheduleMasonryLayout
    });
    const dashboardRefresh = createDashboardRefresh();








    /** Clones an existing HTML template by identifier.
     * @param {string} templateId Template element identifier.
     * @returns {DocumentFragment|null} Cloned template or null when absent.
     */
    function cloneTemplate(templateId){
      const template = document.getElementById(templateId);
      if (!template) {
        return null;
      }
      return template.content.cloneNode(true);
    }

    /** Clones a namespaced chart primitive from the common SVG templates.
     * @param {string} tag SVG tag with a matching astroChart template.
     * @returns {SVGElement} Independent template element.
     */
    function createChartSvgElement(tag){
      return document.getElementById('astroChart-' + tag).content.querySelector(tag).cloneNode(true);
    }

    /** Appends plain text using the shared summary template.
     * @param {Element} target Summary container.
     * @param {string} text Plain text to display.
     * @returns {void} No value.
     */
    function appendSummaryText(target, text){
      const fragment = cloneTemplate('summaryTextTemplate');
      if (!fragment) {
        const fallback = document.createElement('div');
        fallback.textContent = text;
        target.appendChild(fallback);
        return;
      }
      fragment.querySelector('[data-summary-text]').textContent = text;
      target.appendChild(fragment);
    }

    /** Appends a labeled line using the shared summary template.
     * @param {Element} target Summary container.
     * @param {string} label Label text.
     * @param {string} value Value text.
     * @returns {void} No value.
     */
    function appendSummaryLine(target, label, value){
      const fragment = cloneTemplate('summaryLineTemplate');
      if (!fragment) {
        const fallback = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = label;
        fallback.appendChild(strong);
        fallback.appendChild(document.createTextNode(value));
        target.appendChild(fallback);
        return;
      }
      fragment.querySelector('[data-summary-label]').textContent = label;
      fragment.querySelector('[data-summary-value]').textContent = value;
      target.appendChild(fragment);
    }

    window.renderPlanetenuhrHelpMath = helpController.renderPlanetenuhrHelpMath;








    /** Returns the selected display zone, falling back to the browser's local time zone.
     * No parameters. @returns {string} IANA time-zone key or local.
     */
    function getDisplayTimeZone(){
      const timezoneSelector = document.getElementById('timezone');
      if (timezoneSelector && timezoneSelector.value) {
        return timezoneSelector.value;
      }
      return 'local';
    }

    /** Formats a date and time using an explicit zone or the browser's local zone.
     * @param {Date} d Instant to format.
     * @param {string} tz IANA time-zone key or local.
     * @returns {string} Localized date and time.
     */
    function fmtTZ(d, tz){
      let timeZone;
      if (tz !== 'local') {
        timeZone = tz;
      }
      return formatDateStamp(d, timeZone) + ' ' + d.toLocaleTimeString(lang, {
        hour:'2-digit', minute:'2-digit', second:'2-digit',
        hour12:false,
        timeZone
      });
    }

    /**
     * Formats a visible calendar date in the active app language.
     * @param {Date} d Date to display.
     * @param {string} [timeZone] Optional IANA timezone; defaults to browser time.
     * @returns {string} Localized numeric date, including a four-digit year.
     */
    function formatDateStamp(d, timeZone){
      return window.PLANETENUHR_DATE_TIME.formatDateStamp(d, timeZone, lang);
    }





































    /**
     * Rebuilds cards whose internal SVG layout depends on the current card
     * width or height. A pure class change is not enough for these cards,
     * because their drawing code samples the container size during render.
     * @returns {void}
     */
    function rerenderCardsAfterSizeChange(){
      dashboardLayout.runWithDeferredMasonryLayout(() => {
        smallBodiesController.render();
        spacecraftController.render();
        refreshDateDrivenTiles('size');
      });
    }









    /**
     * Applies the initial date, place and card parameters from the current URL.
     * This runs once during startup before the first render so deep links can
     * open directly on a specific day, city and dashboard card.
     * @returns {void}
     */
    function applyInitialUrlState(){
      dashboardContext.applyUrl(initialUrlParams);
      const requestedCard = window.PLANETENUHR_CARD_NAVIGATION.normalizeCardToken(initialUrlParams.get('card'));
      if (requestedCard) {
        cardNavigation.setRequestedCardKey(requestedCard);
      }
    }



    /** Formats a time in the active language and dashboard timezone.
     * @param {Date|null} d Instant to format, or null.
     * @returns {string} Localized time or a dash for an absent instant.
     */
    function fmtTimeOnly(d){
      if (!d) return '-';
      return d.toLocaleTimeString(lang, {
        hour:'2-digit',
        minute:'2-digit',
        hour12:false,
        timeZone:'Europe/Berlin'
      });
    }

    /**
     * Resolves the simplified local eclipse visibility for one configured city.
     * Stage 1 deliberately returns curated city classes such as "partial" or
     * "not_visible" instead of computing local circumstances from ephemerides.
     * @param {Date} date Calendar date to inspect.
     * @param {object} location Selected location object with at least a key.
     * @returns {object|null} Object with entry and status, or null when no event is configured.
     */
    function eclipseVisibilityForLocation(date, location){
      return window.PLANETENUHR_ECLIPSE_LOCATION.eclipseVisibilityForLocation(window.PLANETENUHR_DATE_TIME.formatDateKey(date), location, eclipseVisibilityConfig, eclipseCalendarData);
    }

    /**
     * Translates one simplified eclipse visibility status into user-facing text.
     * @param {string} statusKey Internal status key from the curated visibility config.
     * @returns {string} Localized short label.
     */
    function eclipseVisibilityStatusLabel(statusKey){
      if (statusKey === 'total') {
        return t.eclipse_visibility_total || 'total visible';
      }
      if (statusKey === 'annular') {
        return t.eclipse_visibility_annular || 'annular visible';
      }
      if (statusKey === 'hybrid') {
        return t.eclipse_visibility_hybrid || 'hybrid central path';
      }
      if (statusKey === 'partial') {
        return t.eclipse_visibility_partial || 'partly visible';
      }
      if (statusKey === 'partial_low') {
        return t.eclipse_visibility_partial_low || 'only low above the horizon';
      }
      if (statusKey === 'penumbral') {
        return t.eclipse_visibility_penumbral || 'penumbral only';
      }
      if (statusKey === 'not_visible') {
        return t.eclipse_visibility_not_visible || 'not visible';
      }
      return t.eclipse_visibility_unknown || 'not yet configured for this city';
    }

    /**
     * Builds a short localized line that explains the simplified local visibility
     * for the selected city on an exact configured eclipse date.
     * @param {Date} date Calendar date to inspect.
     * @param {object} location Selected location object.
     * @returns {string} Human-readable sentence, or an empty string when no event applies.
     */
    function eclipseVisibilityLocationText(date, location){
      const visibility = eclipseVisibilityForLocation(date, location);
      if (!visibility) {
        return '';
      }
      const label = eclipseVisibilityStatusLabel(visibility.status);
      return (t.eclipse_visibility_here || 'At the selected location')
        + ' '
        + location.name
        + ': '
        + label
        + '.';
    }

    /**
     * Loads the localized sky-calendar events and enriches them with Date objects
     * plus stable internal keys for rendering, selection and downloads.
     * @returns {Array<object>} Sorted localized calendar events.
     */
    function calendarEvents(){
      return skyCalendarModel.eventsForLanguage(calendarEventsByLang, lang);
    }

    /**
     * Returns a localized country name for the location selector.
     * The location config stores countries in German so the selector can map
     * them into English and French without duplicating the full city list.
     * @param {string} countryName Country label from the location config.
     * @returns {string} Country label in the active UI language.
     */
    /** Converts an azimuth into a localized 16-point compass label.
     * @param {number} azimuthDeg Azimuth from north through east.
     * @returns {string} Localized compass abbreviation.
     */
    function compassLabelForAzimuth(azimuthDeg){
      return window.PLANETENUHR_OBSERVATION_FORMAT.compassLabelForAzimuth(azimuthDeg, lang);
    }

    /** Converts altitude to an everyday arm-length estimate.
     * @param {number} altitudeDeg Altitude angle above the horizon.
     * @returns {string} Localized estimate, or empty text below the horizon.
     */
    function altitudeThumbEstimate(altitudeDeg){
      return window.PLANETENUHR_OBSERVATION_FORMAT.altitudeThumbEstimate(altitudeDeg, lang);
    }
    function localizedCountryName(countryName){
      if (!countryName) {
        return '';
      }

      const countryMap = {
        Deutschland: { en:'Germany', de:'Deutschland', fr:'Allemagne' },
        Island: { en:'Iceland', de:'Island', fr:'Islande' },
        Irland: { en:'Ireland', de:'Irland', fr:'Irlande' },
        'Vereinigtes Königreich': { en:'United Kingdom', de:'Vereinigtes Königreich', fr:'Royaume-Uni' },
        Niederlande: { en:'Netherlands', de:'Niederlande', fr:'Pays-Bas' },
        Belgien: { en:'Belgium', de:'Belgien', fr:'Belgique' },
        Frankreich: { en:'France', de:'Frankreich', fr:'France' },
        Schweiz: { en:'Switzerland', de:'Schweiz', fr:'Suisse' },
        Österreich: { en:'Austria', de:'Österreich', fr:'Autriche' },
        Tschechien: { en:'Czechia', de:'Tschechien', fr:'Tchéquie' },
        Polen: { en:'Poland', de:'Polen', fr:'Pologne' },
        Dänemark: { en:'Denmark', de:'Dänemark', fr:'Danemark' },
        Norwegen: { en:'Norway', de:'Norwegen', fr:'Norvège' },
        Schweden: { en:'Sweden', de:'Schweden', fr:'Suède' },
        Finnland: { en:'Finland', de:'Finnland', fr:'Finlande' },
        Portugal: { en:'Portugal', de:'Portugal', fr:'Portugal' },
        Spanien: { en:'Spain', de:'Spanien', fr:'Espagne' },
        Gibraltar: { en:'Gibraltar', de:'Gibraltar', fr:'Gibraltar' },
        Italien: { en:'Italy', de:'Italien', fr:'Italie' },
        Griechenland: { en:'Greece', de:'Griechenland', fr:'Grèce' },
        Türkei: { en:'Turkey', de:'Türkei', fr:'Turquie' },
        USA: { en:'USA', de:'USA', fr:'États-Unis' },
        Kanada: { en:'Canada', de:'Kanada', fr:'Canada' },
        Mexiko: { en:'Mexico', de:'Mexiko', fr:'Mexique' },
        Brasilien: { en:'Brazil', de:'Brasilien', fr:'Brésil' },
        Argentinien: { en:'Argentina', de:'Argentinien', fr:'Argentine' },
        Chile: { en:'Chile', de:'Chile', fr:'Chili' },
        Marokko: { en:'Morocco', de:'Marokko', fr:'Maroc' },
        Ägypten: { en:'Egypt', de:'Ägypten', fr:'Égypte' },
        Kenia: { en:'Kenya', de:'Kenia', fr:'Kenya' },
        Südafrika: { en:'South Africa', de:'Südafrika', fr:'Afrique du Sud' },
        Israel: { en:'Israel', de:'Israel', fr:'Israël' },
        'Vereinigte Arabische Emirate': { en:'United Arab Emirates', de:'Vereinigte Arabische Emirate', fr:'Émirats arabes unis' },
        Indien: { en:'India', de:'Indien', fr:'Inde' },
        Thailand: { en:'Thailand', de:'Thailand', fr:'Thaïlande' },
        Singapur: { en:'Singapore', de:'Singapur', fr:'Singapour' },
        Indonesien: { en:'Indonesia', de:'Indonesien', fr:'Indonésie' },
        Hongkong: { en:'Hong Kong', de:'Hongkong', fr:'Hong Kong' },
        China: { en:'China', de:'China', fr:'Chine' },
        Südkorea: { en:'South Korea', de:'Südkorea', fr:'Corée du Sud' },
        Japan: { en:'Japan', de:'Japan', fr:'Japon' },
        Australien: { en:'Australia', de:'Australien', fr:'Australie' },
        Neuseeland: { en:'New Zealand', de:'Neuseeland', fr:'Nouvelle-Zélande' }
      };

      const entry = countryMap[countryName];
      if (!entry) {
        return countryName;
      }
      if (lang === 'fr') {
        return entry.fr;
      }
      if (lang === 'en') {
        return entry.en;
      }
      return entry.de;
    }

    /**
     * Builds the visible label for one location-select option.
     * The city name stays unchanged while the country part follows the active
     * interface language.
     * @param {object} location One configured location entry.
     * @returns {string} Human-readable option label.
     */
    function locationOptionLabel(location){
      if (!location) {
        return '';
      }
      let label = location.name || '';
      const countryLabel = localizedCountryName(location.country);
      if (countryLabel) {
        label += ', ' + countryLabel;
      }
      return label;
    }















    /** Creates the ordered registry of date/location/periodic consumers.
     * No parameters. @returns {object} Shared refresh controller.
     */
    function createDashboardRefresh(){
      // Language is selected at URL startup; viewport observers retain their per-card paths.
      const changes = ['date', 'location', 'refresh', 'size'];
      return window.PLANETENUHR_DASHBOARD_REFRESH.create({
        context:dashboardContext,
        entries:[
          {key:'date-readout', changes, render:() => dateLocationControls.updateControlDateReadout()},
          {key:'renderMoon', changes, render:context => earthMoonController.renderPhase(context)},
          {key:'renderEarthMoon', changes, render:context => earthMoonController.renderCaption(context)},
          {key:'renderAstronomyExplorer', changes, render:context => { if (astronomyExplorer) { astronomyExplorer.render(context.date); } }},
          {key:'daily-highlights', changes, render:context => { if (dailyHighlights) { dailyHighlights.render(context.date); } }},
          {key:'milky-way-sky', changes, render:renderMilkyWaySky},
          {key:'idefix', changes, render:context => { if (idefixMission) { idefixMission.render(context.date); } }},
          {key:'renderSolarSystem', changes, render:context => solarSystemController.render(context)},
          {key:'renderBarycenter', changes, render:context => barycenterController.render(context)},
          {key:'renderLagrangePoints', changes, render:context => lagrangeController.render(context)},
          {key:'renderAnalemma', changes, render:context => analemmaController.render(context)},
          {key:'renderExoplanetComparison', changes, render:context => exoplanetsController.render(context)},
          {key:'renderPolarisNorth', changes, render:context => polarisController.render(context)},
          {key:'renderMoonNodes', changes, render:context => moonNodesController.render(context)},
          {key:'renderConjunctionTimeline', changes, render:context => conjunctionController.render(context)},
          {key:'renderMeteorStreams', changes, render:context => meteorController.render(context)},
          {key:'renderConstellationOfMonth', changes, render:context => constellationMonthController.render(context)},
          {key:'renderConstellationYear', changes, render:context => constellationYearController.render(context)},
          {key:'renderSeasonAxis', changes, render:context => seasonsController.render(context)},
          {key:'renderRetrogradePhases', changes, render:context => retrogradeController.render(context)},
          {key:'renderInnerPlanetPhases', changes, render:context => innerPlanetsController.render(context)},
          {key:'renderSunlight', changes, render:context => sunlightController.render(context)},
          {key:'renderVisibility', changes, render:context => planetVisibilityController.renderVisibility(context)},
          {key:'renderNightVisibility', changes, render:context => planetVisibilityController.renderNightVisibility(context)},
          {key:'renderSatellites', changes, render:context => satellitesController.render(context)},
          {key:'renderEclipseGeometry', changes, render:context => eclipseGeometryController.render(context)},
          {key:'calendar', changes, render:() => calendarController.render()}
        ]
      });
    }

    /** Aktualisiert die Milchstraßenansicht mit dem globalen Auswahlkontext.
     * @param {object} context Ausgewählter Zeitpunkt, Ort, Zeitzone und Sprache.
     * @returns {void} Kein Rückgabewert.
     */
    function renderMilkyWaySky(context){
      if (milkyWayCard) {
        milkyWayCard.updateSky(context);
      }
    }

    /** Aktualisiert nur die zeitabhängige Milchstraßenansicht.
     * @returns {void} Kein Rückgabewert.
     */
    function refreshMilkyWaySky(){
      if (milkyWayCard) {
        milkyWayCard.updateSky(dashboardContext.snapshot());
      }
    }

    /** Refreshes registered consumers from one selected context.
     * @param {string} [reason='date'] Global update trigger. @returns {void}
     */
    function refreshDateDrivenTiles(reason = 'date'){
      dashboardRefresh.refresh(reason);
    }


    /** Refreshes infrequently changing orbital diagrams and date-driven cards.
     * @returns {void} No value.
     */
    function updateInfrequent() {
      dashboardLayout.runWithDeferredMasonryLayout(() => {
        smallBodiesController.render();
        spacecraftController.render();
        refreshDateDrivenTiles('refresh');
      });
    }

    /** Refreshes date-driven cards and requests fresh external-card data.
     * @returns {void} No value.
     */
    function refreshDynamicTiles(){
      updateInfrequent();
      auroraController.load();
      blueskyFeedController.load();
    }

    // Solar-system model: approximate heliocentric J2000 orbital elements.
    const solarPlanets = window.PLANETENUHR_PLANET_ELEMENTS;

    /** Returns a geocentric ecliptic longitude for the requested solar-system body.
     * @param {string} key Body key such as sun, moon or a planet.
     * @param {Date} [date=dashboardContext.getDate()] Observation instant.
     * @returns {number} Ecliptic longitude in degrees.
     */
    function bodyEclipticLongitude(key, date = dashboardContext.getDate()){
      if (key === 'sun') return window.PLANETENUHR_SOLAR_VISIBILITY.sunLongitude(date);
      if (key === 'moon') {
        const moon = window.PLANETENUHR_MOON_MODEL.computeMoon(date);
        return window.PLANETENUHR_COORDINATES.normalizeDeg(window.PLANETENUHR_SOLAR_VISIBILITY.sunLongitude(date) + moon.frac * 360);
      }
      const planet = solarPlanets.find(item => item.key === key);
      if (!planet) return 0;
      const pos = window.PLANETENUHR_PLANET_MODEL.planetPosition(planet, date);
      return window.PLANETENUHR_COORDINATES.normalizeDeg(Math.atan2(pos.y, pos.x) * 180 / Math.PI);
    }



































    // Apparent ecliptic longitude as seen from Earth.
    /** Returns the apparent geocentric ecliptic longitude of a body.
     * @param {string} key Body key.
     * @param {Date} [date=dashboardContext.getDate()] Observation instant.
     * @returns {number} Longitude in degrees normalized to one circle.
     */
    function geocentricLongitude(key, date = dashboardContext.getDate()){
      if (key === 'sun') return window.PLANETENUHR_SOLAR_VISIBILITY.sunLongitude(date);
      const vec = window.PLANETENUHR_PLANET_MODEL.geocentricVector(key, date);
      if (!vec) return 0;
      return window.PLANETENUHR_COORDINATES.normalizeDeg(Math.atan2(vec.y, vec.x) * 180 / Math.PI);
    }

    /** Completes the apparent 2D path with a body's ecliptic latitude.
     * @param {string} key Body key.
     * @param {Date} [date=dashboardContext.getDate()] Observation instant.
     * @returns {number} Ecliptic latitude in degrees.
     */
    /** Returns the apparent geocentric ecliptic latitude of a body.
     * @param {string} key Body key.
     * @param {Date} [date=dashboardContext.getDate()] Observation instant.
     * @returns {number} Latitude in degrees.
     */
    function geocentricLatitude(key, date = dashboardContext.getDate()){
      const vec = window.PLANETENUHR_PLANET_MODEL.geocentricVector(key, date);
      if (!vec) return 0;
      const planar = Math.hypot(vec.x, vec.y);
      return Math.atan2(vec.z || 0, Math.max(0.0001, planar)) * 180 / Math.PI;
    }

    /** Calculates a body's signed angular separation from the Sun.
     * @param {string} key Body key.
     * @param {Date} [date=dashboardContext.getDate()] Observation instant.
     * @returns {number} Signed ecliptic longitude difference in degrees.
     */
    function solarElongationForKey(key, date = dashboardContext.getDate()){
      return window.PLANETENUHR_COORDINATES.signedDeg(geocentricLongitude(key, date) - window.PLANETENUHR_SOLAR_VISIBILITY.sunLongitude(date));
    }

    /** Returns the localized display name for a planet key.
     * @param {string} key Planet key.
     * @returns {string} Localized name or a title-cased key.
     */
    function bodyDisplayName(key){
      const translatedName = t['planet_' + key];
      if (translatedName) {
        return translatedName;
      }
      if (key) {
        return key.charAt(0).toUpperCase() + key.slice(1);
      }
      return '';
    }




    /** Restricts a normalized value to the closed interval from zero to one.
     * @param {number} value Input value.
     * @returns {number} Clamped value.
     */
    function clamp01(value){
      return Math.max(0, Math.min(1, value));
    }









    /** Converts a configured MM-DD date to its browser-local day index.
     * @param {string} monthDay Month and day in MM-DD format.
     * @param {number} year Calendar year used for leap-year handling.
     * @returns {number} Zero-based local day index.
     */
    function monthDayToDayOfYear(monthDay, year){
      const [month, day] = monthDay.split('-').map(Number);
      return window.PLANETENUHR_SOLAR_VISIBILITY.dayOfYearLocal(new Date(year, month - 1, day));
    }

    /** Formats a configured MM-DD date in the active app language.
     * @param {string} monthDay Month and day in MM-DD format.
     * @param {number} year Calendar year used for leap-year handling.
     * @returns {string} Localized date label.
     */
    function monthDayLabel(monthDay, year){
      const [month, day] = monthDay.split('-').map(Number);
      return formatDateStamp(new Date(year, month - 1, day));
    }

    /** Formats a zero-based month index in the active language.
     * @param {number} monthIndex Month index from zero through eleven.
     * @returns {string} Localized short month label.
     */
    function monthShortLabel(monthIndex){
      return new Intl.DateTimeFormat(lang, { month:'short' }).format(new Date(2026, monthIndex, 1));
    }


    /** Converts a circular fraction into an SVG point around the top origin.
     * @param {number} center Circle center coordinate.
     * @param {number} radius Circle radius.
     * @param {number} fraction Fraction of a full turn.
     * @returns {{x:number,y:number}} Point on the circle.
     */
    function polarPoint(center, radius, fraction){
      const angle = fraction * Math.PI * 2 - Math.PI / 2;
      return {
        x:center + Math.cos(angle) * radius,
        y:center + Math.sin(angle) * radius
      };
    }

    /** Builds an SVG arc path between two circular fractions.
     * @param {number} center Circle center coordinate.
     * @param {number} radius Circle radius.
     * @param {number} startFraction Arc start fraction.
     * @param {number} endFraction Arc end fraction.
     * @returns {string} SVG path data.
     */
    function svgArcPath(center, radius, startFraction, endFraction){
      const start = polarPoint(center, radius, startFraction);
      const end = polarPoint(center, radius, endFraction);
      let sweep = endFraction + 1 - startFraction;
      if (endFraction >= startFraction) {
        sweep = endFraction - startFraction;
      }
      let largeArc = 0;
      if (sweep > 0.5) {
        largeArc = 1;
      }
      return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
    }

    /** Formats a sky separation with the shared arm’s-length finger/hand estimate.
     * @param {number} degrees Nonnegative angular separation in degrees.
     * @returns {string} Localized degrees and a practical estimate, or empty for invalid input.
     */
    function conjunctionSeparationLabel(degrees){
      return conjunctionController.conjunctionSeparationLabel(degrees);
    }

    /** Returns the localized label for two bodies in a conjunction.
     * @param {string} a First body key.
     * @param {string} b Second body key.
     * @returns {string} Localized pair label.
     */
    function conjunctionPairLabel(a, b){
      return conjunctionController.conjunctionPairLabel(a, b);
    }

    /** Finds close approaches as seen from Earth using the full three-dimensional sky angle.
     * @param {Date} [date=dashboardContext.getDate()] Center of the displayed time window.
     * @param {number} [windowDays=180] Half-window in elapsed days.
     * @returns {object[]} Chronological minima at or below 4.5 degrees for the five naked-eye planets.
     */
    function computeConjunctionEvents(date = dashboardContext.getDate(), windowDays = 180){
      return window.PLANETENUHR_CONJUNCTIONS.events(date, windowDays,
        ['mercury', 'venus', 'mars', 'jupiter', 'saturn'], window.PLANETENUHR_PLANET_MODEL.geocentricVector, 4.5);
    }





    // Moon model
    /** Returns the shared mean lunar phase for the selected instant.
     * @param {Date} date Observation instant.
     * @returns {object} Phase icon, key, rounded illumination and cycle fraction.
     */
    /** Returns the shared estimate for the next full Moon.
     * @param {Date} fromDate Starting instant.
     * @returns {Date} Approximate next full-Moon instant.
     */
    /** Measures phase and nearest-node distance in the existing mean draconic cycle.
     * @param {Date} date Explicit observation instant.
     * @returns {object} Node phase and distanceDays.
     */
    // Wire up
    dateLocationControls.wire();
      [
        'btnSolarPrevYear',
        'btnSolarPrevMonth',
        'btnSolarPrevWeek',
        'btnSolarPrev',
        'btnSolarToday',
        'btnSolarNext',
        'btnSolarNextWeek',
        'btnSolarNextMonth',
        'btnSolarNextYear',
        'btnSolarAutoplay',
        'btnBarycenterJupiter',
        'btnBarycenterJupiterSaturn',
        'btnBarycenterAll',
        'btnSolarPrevMobile',
        'btnSolarTodayMobile',
        'btnSolarNextMobile'
      ].forEach(id => {
        const button = document.getElementById(id);
        if (!button) return;
        button.addEventListener('pointerdown', event => event.preventDefault());
        button.addEventListener('click', () => {
          button.blur();
        });
      });

    barycenterController.init();
    calendarController = window.PLANETENUHR_CALENDAR.create({
      model:skyCalendarModel,
      document,
      window,
      getEvents:calendarEvents,
      getDate:dashboardContext.getDate,
      getTimeZone:() => window.PLANETENUHR_DATE_TIME.locationTimeZoneId(dashboardContext.getLocation()),
      getLanguage:() => lang,
      getTranslations:() => t,
      formatDateOnly:formatDateStamp,
      formatDateKey:window.PLANETENUHR_DATE_TIME.formatDateKey,
      cloneTemplate,
      requestLayout:dashboardLayout.requestMasonryLayout,
      compactListLimit:compactCalendarListLimit
    });
    calendarController.wire(document);
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


    cardNavigation.applyCardAnchorIds();
    applyInitialUrlState();
    dateLocationControls.populateLocationSelector();
    cardSizes.initCardSizeControls();
    const solarDateSlider = document.getElementById('solarDateSlider');
    if (solarDateSlider) {
      solarDateSlider.value = String(dashboardContext.getDayOffset());
      solarDateSlider.setAttribute('aria-valuenow', String(dashboardContext.getDayOffset()));
    }
    idefixMission = window.PLANETENUHR_IDEFIX.create({
      getDate:dashboardContext.getDate,
      getLanguage: () => lang,
      getTranslations: () => t,
      getHeliocentricPosition: window.PLANETENUHR_PLANET_MODEL.heliocentricPosition,
      updateCardLayout: dashboardLayout.updateSingleCardMasonryLayout
    });
    skyKnowledge = window.PLANETENUHR_KNOWLEDGE.create({
      getLanguage: () => lang,
      getTranslations: () => t,
      updateCardLayout: dashboardLayout.updateSingleCardMasonryLayout
    });
    astronomyExplorer = window.PLANETENUHR_EXPLORER.create({
      getDate:dashboardContext.getDate,
      getLocation:dashboardContext.getLocation,
      getTimeZone: window.PLANETENUHR_DATE_TIME.locationTimeZoneId,
      getTranslations: () => t,
      getLanguage: () => lang,
      getHeliocentricPosition: window.PLANETENUHR_PLANET_MODEL.heliocentricPosition,
      getGeocentricVector: window.PLANETENUHR_PLANET_MODEL.geocentricVector,
      getHorizontalCoordinates: window.PLANETENUHR_COORDINATES.horizontalCoordinates,
      getAltitudeEstimate: altitudeThumbEstimate,
      getAltitudeEstimate: altitudeThumbEstimate,
      requestLayout: dashboardLayout.requestMasonryLayout,
      updateCardLayout: dashboardLayout.updateSingleCardMasonryLayout
    });
    dailyHighlights = window.PLANETENUHR_DAILY.create({
      getLocation:dashboardContext.getLocation, getTimeZone:window.PLANETENUHR_DATE_TIME.locationTimeZoneId,
      getLanguage:() => lang, getTranslations:() => t,
      getDateKey:window.PLANETENUHR_DATE_TIME.formatDateKey, getDateLabel:formatDateStamp,
      getVector:window.PLANETENUHR_PLANET_MODEL.geocentricVector, getHorizontal:window.PLANETENUHR_COORDINATES.horizontalCoordinates,
      getConjunctions:computeConjunctionEvents, getMoon:window.PLANETENUHR_MOON_MODEL.computeMoon,
      getCalendar:calendarEvents, getShowers:() => phenomenaConfig.meteorStreams || [],
      getEclipseVisibility:eclipseVisibilityForLocation, getEclipseLabel:eclipseVisibilityStatusLabel,
      getAngleLabel:conjunctionSeparationLabel, getDirection:compassLabelForAzimuth,
      getCardUrl:cardNavigation.dailyHighlightCardUrl, openCard:cardNavigation.openDailyHighlightCard,
      updateLayout:dashboardLayout.updateSingleCardMasonryLayout
    });
    const milkyWaySkyModel = window.PLANETENUHR_MILKY_WAY_SKY_MODEL.create({
      horizontalCoordinates:window.PLANETENUHR_COORDINATES.horizontalCoordinates,
      sunEquatorialCoordinates:window.PLANETENUHR_SOLAR_VISIBILITY.solarEquatorialCoordinates
    });
    milkyWayCard = window.PLANETENUHR_MILKY_WAY.create(document, milkyWaySkyModel, dashboardContext.snapshot);
    const dashboardI18n = window.PLANETENUHR_DASHBOARD_I18N.create({
      document, window, getLanguage:() => lang, getTranslations:() => t,
      dateLocationControls, cardSizes, dashboardContext,
      getCalendarController:() => calendarController,
      getSkyKnowledge:() => skyKnowledge,
      getDailyHighlights:() => dailyHighlights,
      getMilkyWayCard:() => milkyWayCard
    });
    planetarySystemsController.render();
    jupiterController.render();
    dashboardI18n.apply();
    dateLocationControls.syncDateMobilePanelForViewport();
    helpController.initCardHelp();
    // Half-hourly refresh for time-dependent cards.
    dashboardLayout.initMasonryLayout();
    refreshDynamicTiles();
    window.PLANETENUHR_DIAGRAM_DETAILS.create({beforeOpen:dashboardLayout.releasePendingViewportRestoration});
    dashboardLayout.scheduleMasonryLayout(cardNavigation.scrollToRequestedCard);
    setInterval(refreshDynamicTiles, 1800000);
    setInterval(refreshMilkyWaySky, 60000);

	    // --- Erde-Mond elliptische Bahn ---
    // iOS/Safari kann bei Layout-Start kurz 0px als Elementgröße liefern.
    // Deshalb: Animation erst nach Layout berechnen, mit getBoundingClientRect-Fallback
    // und zeitbasiert statt framebasiert laufen lassen.
    earthMoonController.wire();
    earthMoonController.start();
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => solarSystemController.render(dashboardContext.snapshot()));
    });
