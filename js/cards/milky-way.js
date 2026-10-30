window.PLANETENUHR_MILKY_WAY = (() => {
  'use strict';

  /** Erstellt die Interaktion für Kartenansicht, Himmelsblick und Themenwahl.
   * @param {Document} document Dokument mit der Milchstraßen-Kachel und ihren Templates.
   * @returns {{render: Function}} Controller zum Lokalisieren der Kachel.
   */
  function create(document, skyModel, getContext){
    const card = document.querySelector('[data-help-key="milky_way"]');
    const heading = document.getElementById('milkyWayTitle');
    const topicLabel = document.getElementById('milkyWayTopicTitle');
    const topicText = document.getElementById('milkyWayTopicText');
    const mapImage = card.querySelector('.milky-way-artwork');
    const detailPanel = card.querySelector('.milky-way-detail');
    const skyVisual = card.querySelector('.milky-way-sky-visual');
    const skyPath = card.querySelector('[data-milky-sky-track]');
    const skyGlowPath = card.querySelector('[data-milky-sky-track-glow]');
    const skyHaloPath = card.querySelector('[data-milky-sky-track-halo]');
    const skyStarField = card.querySelector('[data-milky-sky-star-field]');
    const skyGalacticCenter = card.querySelector('[data-milky-sky-galactic-center]');
    const skyCenterCluster = card.querySelector('[data-milky-sky-center-cluster]');
    const skyMoment = card.querySelector('[data-milky-sky-moment]');
    const viewButtons = card.querySelectorAll('[data-milky-view]');
    const topicButtons = [];
    const hotspots = card.querySelectorAll('[data-topic-hotspot]');
    const starDistribution = createStarDistribution(140, 938271);
    const centerStarDistribution = createStarDistribution(70, 612347);
    let activeTopic = 'new';

    /** Erzeugt eine stabile, unregelmäßige Verteilung für die Sterne im Milchstraßenband.
     * @param {number} count Gewünschte Anzahl der Sternpunkte.
     * @param {number} initialSeed Fester Startwert für eine bei jedem Render gleiche Verteilung.
     * @returns {object[]} Feste relative Positionen, Größen und Helligkeiten.
     */
    function createStarDistribution(count, initialSeed){
      let seed = initialSeed;
      const distribution = [];
      for (let index = 0; index < count; index += 1) {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        const along = seed / 4294967296;
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        const spread = (seed / 4294967296 * 2 - 1) * 19;
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        const scale = 0.7 + seed / 4294967296 * 0.45;
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        const opacity = 0.78 + seed / 4294967296 * 0.22;
        distribution.push({along, spread, scale, opacity});
      }
      return distribution;
    }

    /** Aktualisiert die Auswahlzustände aller Themenknöpfe.
     * @param {string} topicId Kennung des aktiven Themenbereichs.
     * @returns {void} Kein Rückgabewert.
     */
    function updateTopicButtonStates(topicId){
      for (const button of topicButtons) {
        const isSelected = button.dataset.topicId === topicId;
        button.setAttribute('aria-pressed', String(isSelected));
      }
    }

    /** Zeigt den gewählten Themenbereich und aktualisiert den Tastaturzustand.
     * @param {string} topicId Schlüssel des aktiven Themenbereichs.
     * @param {object} translations Aktive Sprachtexte.
     * @returns {void} Kein Rückgabewert.
     */
    function selectTopic(topicId, translations){
      activeTopic = topicId;
      const titleKey = 'milky_' + topicId + '_title';
      const textKey = 'milky_' + topicId + '_text';
      topicLabel.textContent = translations[titleKey];
      topicText.textContent = translations[textKey];
      updateTopicButtonStates(topicId);
    }

    /** Wechselt zwischen der Galaxienkarte und dem Blick in den Himmel.
     * @param {string} viewId Kennung der anzuzeigenden Ansicht.
     * @returns {void} Kein Rückgabewert.
     */
    function selectView(viewId){
      const panels = card.querySelectorAll('[data-milky-panel]');
      for (const panel of panels) {
        panel.hidden = panel.dataset.milkyPanel !== viewId;
      }
      for (const button of viewButtons) {
        const isSelected = button.dataset.milkyView === viewId;
        button.setAttribute('aria-pressed', String(isSelected));
      }
    }

    /** Passt die Höhe des Detailkastens an die gerenderte Bildhöhe an.
     * @returns {void} Kein Rückgabewert.
     */
    function synchronizeDetailPanelHeight(){
      const isNormalSize = card.dataset.cardSize === 'normal';
      const isStackedViewport = window.matchMedia('(max-width: 680px)').matches;
      if (isNormalSize || isStackedViewport) {
        detailPanel.style.height = '';
        return;
      }
      const imageHeight = Math.ceil(mapImage.getBoundingClientRect().height);
      if (imageHeight > 0) {
        detailPanel.style.height = imageHeight + 'px';
      }
    }

    /** Wählt ein Thema aus dem angeklickten Knopf aus.
     * @param {MouseEvent} event Klickereignis des Themenknopfs.
     * @returns {void} Kein Rückgabewert.
     */
    function handleTopicClick(event){
      const language = document.documentElement.lang;
      const translations = window.PLANETENUHR_TRANSLATIONS[language];
      selectTopic(event.currentTarget.dataset.topicId, translations);
    }

    /** Wählt beim Bildklick den räumlich nächstgelegenen markierten Bereich.
     * @param {MouseEvent} event Klickereignis innerhalb der Galaxienkarte.
     * @returns {void} Kein Rückgabewert.
     */
    function handleMapClick(event){
      const clickedHotspot = event.target.closest('[data-topic-hotspot]');
      if (!clickedHotspot) {
        return;
      }

      let selectedTopicId = clickedHotspot.dataset.topicId;
      if (event.detail > 0) {
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (const hotspot of hotspots) {
          const bounds = hotspot.getBoundingClientRect();
          const horizontalDistance = event.clientX - (bounds.left + bounds.width / 2);
          const verticalDistance = event.clientY - (bounds.top + bounds.height / 2);
          const distance = Math.hypot(horizontalDistance, verticalDistance);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            selectedTopicId = hotspot.dataset.topicId;
          }
        }
      }

      const language = document.documentElement.lang;
      const translations = window.PLANETENUHR_TRANSLATIONS[language];
      selectTopic(selectedTopicId, translations);
    }

    /** Wechselt anhand des angeklickten Knopfs die Ansicht.
     * @param {MouseEvent} event Klickereignis eines Ansichts-Knopfs.
     * @returns {void} Kein Rückgabewert.
     */
    function handleViewClick(event){
      selectView(event.currentTarget.dataset.milkyView);
    }

    /** Projiziert sichtbare Azimut- und Höhenabschnitte auf eine runde Himmelskuppel.
     * @param {object[][]} segments Sichtbare Abschnitte der Milchstraßenebene.
     * @returns {string} SVG-Pfaddaten für die Himmelsgrafik.
     */
    function createSkyTrackPath(segments){
      const pathParts = [];
      for (const segment of segments) {
        let pathPart = '';
        for (let index = 0; index < segment.length; index += 1) {
          const point = segment[index];
          const radius = 128 * (90 - point.altitudeDeg) / 90;
          const angle = point.azimuthDeg * Math.PI / 180;
          const x = (260 + radius * Math.sin(angle)).toFixed(2);
          const y = (180 - radius * Math.cos(angle)).toFixed(2);
          if (index === 0) {
            pathPart = 'M ' + x + ' ' + y;
          } else {
            pathPart += ' L ' + x + ' ' + y;
          }
        }
        if (pathPart) {
          pathParts.push(pathPart);
        }
      }
      return pathParts.join(' ');
    }

    /** Fügt einen kleinen Stern an seiner berechneten Position in eine SVG-Gruppe ein.
     * @param {SVGGElement} target SVG-Gruppe für den Stern.
     * @param {object} starPosition Skalierung und Helligkeit des Sterns.
     * @param {number} x Horizontale Position im Koordinatensystem der Himmelsgrafik.
     * @param {number} y Vertikale Position im Koordinatensystem der Himmelsgrafik.
     * @returns {void} Kein Rückgabewert.
     */
    function appendSkyStar(target, starPosition, x, y){
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      star.setAttribute('href', '#milkyWaySkyStarSymbol');
      star.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') scale(' + starPosition.scale.toFixed(2) + ')');
      star.setAttribute('opacity', starPosition.opacity.toFixed(2));
      target.appendChild(star);
    }

    /** Setzt 140 kleine Sterne entlang der diffusen, dynamischen Milchstraßenspur.
     * @returns {void} Kein Rückgabewert.
     */
    function updateDiffuseStars(){
      const pathLength = skyPath.getTotalLength();
      skyStarField.replaceChildren();
      if (pathLength <= 0) {
        return;
      }

      for (const starPosition of starDistribution) {
        const distance = pathLength * starPosition.along;
        const point = skyPath.getPointAtLength(distance);
        const previousPoint = skyPath.getPointAtLength(Math.max(0, distance - 1));
        const nextPoint = skyPath.getPointAtLength(Math.min(pathLength, distance + 1));
        const tangentX = nextPoint.x - previousPoint.x;
        const tangentY = nextPoint.y - previousPoint.y;
        const tangentLength = Math.hypot(tangentX, tangentY);
        if (tangentLength === 0) {
          continue;
        }

        const x = point.x - tangentY / tangentLength * starPosition.spread;
        const y = point.y + tangentX / tangentLength * starPosition.spread;
        appendSkyStar(skyStarField, starPosition, x, y);
      }
    }

    /** Markiert das Galaxienzentrum und verdichtet die Sterne dort, solange es über dem Horizont steht.
     * @param {{azimuthDeg:number, altitudeDeg:number}|null} center Horizontkoordinaten, falls vom Modell vorhanden.
     * @returns {void} Kein Rückgabewert.
     */
    function updateGalacticCenter(center){
      skyCenterCluster.replaceChildren();
      skyGalacticCenter.setAttribute('hidden', '');
      if (!center || !Number.isFinite(center.altitudeDeg) || !Number.isFinite(center.azimuthDeg) || center.altitudeDeg < 0) {
        return;
      }

      const radius = 128 * (90 - center.altitudeDeg) / 90;
      const angle = center.azimuthDeg * Math.PI / 180;
      const centerX = 260 + radius * Math.sin(angle);
      const centerY = 180 - radius * Math.cos(angle);
      skyGalacticCenter.setAttribute('transform', 'translate(' + centerX.toFixed(2) + ' ' + centerY.toFixed(2) + ')');
      skyGalacticCenter.removeAttribute('hidden');

      for (const starPosition of centerStarDistribution) {
        const clusterAngle = starPosition.along * Math.PI * 2;
        const clusterRadius = 2 + (starPosition.spread + 19) / 38 * 10;
        const x = Math.cos(clusterAngle) * clusterRadius;
        const y = Math.sin(clusterAngle) * clusterRadius;
        appendSkyStar(skyCenterCluster, starPosition, x, y);
      }
    }

    /** Aktualisiert die Kuppelgrafik anhand des gemeinsamen Datums- und Ortskontexts.
     * @param {object} context Ausgewählter Zeitpunkt, Ort, Zeitzone und Sprache.
     * @returns {void} Kein Rückgabewert.
     */
    function updateSky(context){
      const result = skyModel.calculate(context.date, context.location);
      const trackPath = createSkyTrackPath(result.segments);
      skyPath.setAttribute('d', trackPath);
      skyGlowPath.setAttribute('d', trackPath);
      skyHaloPath.setAttribute('d', trackPath);
      updateDiffuseStars();
      updateGalacticCenter(result.galacticCenter);
      skyVisual.dataset.milkySkyLight = result.lightState;
      const language = context.language || document.documentElement.lang;
      const formattedDate = new Intl.DateTimeFormat(language, {
        dateStyle:'medium', timeStyle:'short', timeZone:context.timeZone
      }).format(context.date);
      const momentTemplate = window.PLANETENUHR_TRANSLATIONS[language].milky_sky_moment;
      skyMoment.textContent = momentTemplate
        .replace('{place}', context.location.name)
        .replace('{date}', formattedDate);
    }

    /** Lokalisiert Titel, Themenwahl, Legenden und Quellenhinweis.
     * @param {object} translations Aktive Sprachtexte.
     * @returns {void} Kein Rückgabewert.
     */
    function render(translations){
      heading.textContent = translations.title_milky_way;
      card.querySelector('[data-milky-view="map"]').textContent = translations.milky_view_map;
      card.querySelector('[data-milky-view="sky"]').textContent = translations.milky_view_sky;
      card.querySelector('[data-milky-map-heading]').textContent = translations.milky_map_heading;
      card.querySelector('[data-milky-map-intro]').textContent = translations.milky_map_intro;
      card.querySelector('[data-milky-map-tag]').textContent = translations.milky_map_tag;
      card.querySelector('[data-milky-selected-label]').textContent = translations.milky_detail_selected;
      card.querySelector('.milky-way-map').setAttribute('aria-label', translations.milky_map_group);
      document.getElementById('milkyWayTopics').setAttribute('aria-label', translations.milky_map_group);
      card.querySelector('[data-milky-sky-heading]').textContent = translations.milky_sky_heading;
      card.querySelector('[data-milky-sky-intro]').textContent = translations.milky_sky_caption;
      card.querySelector('[data-milky-sky-tag]').textContent = translations.milky_sky_tag;
      card.querySelector('[data-milky-sky-label]').textContent = translations.milky_sky_band_label;
      card.querySelector('[data-milky-sky-subtitle]').textContent = translations.milky_sky_band_subtitle;
      card.querySelector('[data-milky-sky-center-label]').textContent = translations.milky_sky_center_label;
      card.querySelector('[data-milky-sky-footer-title]').textContent = translations.milky_sky_footer_title;
      card.querySelector('[data-milky-sky-footer-text]').textContent = translations.milky_sky_footer_text;
      card.querySelector('[data-milky-sky-chart-title]').textContent = translations.milky_sky_chart_aria;
      card.querySelector('[data-milky-sky-chart-description]').textContent = translations.milky_sky_chart_description;
      card.querySelector('[data-milky-sky-zenith-label]').textContent = translations.milky_sky_zenith;
      card.querySelector('[data-milky-east]').textContent = translations.milky_sky_east;
      card.querySelector('[data-milky-south]').textContent = translations.milky_sky_south;
      card.querySelector('[data-milky-west]').textContent = translations.milky_sky_west;
      const northLabels = card.querySelectorAll('[data-milky-north]');
      for (const label of northLabels) {
        label.textContent = translations.milky_sky_north;
      }
      card.querySelector('[data-milky-credit]').textContent = translations.milky_credit;
      card.querySelector('.milky-way-artwork').alt = translations.milky_alt;
      card.querySelector('.milky-way-artwork').title = translations.milky_map_title;
      card.querySelector('.milky-way-views').setAttribute('aria-label', translations.milky_view_group);

      const topics = window.PLANETENUHR_MILKY_WAY_CONFIG.topics;
      for (let index = 0; index < topics.length; index += 1) {
        const topic = topics[index];
        const label = translations[topic.labelKey];
        card.querySelector('[data-topic-hotspot][data-topic-id="' + topic.id + '"]').setAttribute('aria-label', label);
        const topicButton = document.getElementById('milkyWayTopics').querySelector('[data-topic-id="' + topic.id + '"]');
        topicButton.querySelector('[data-topic-label]').textContent = label;
      }
      selectTopic(activeTopic, translations);
      updateSky(getContext());
    }

    card.querySelector('.milky-way-map').addEventListener('click', handleMapClick);
    for (const hotspot of hotspots) {
      topicButtons.push(hotspot);
    }

    const topics = window.PLANETENUHR_MILKY_WAY_CONFIG.topics;
    for (const topic of topics) {
      const fragment = document.getElementById('milkyWayTopicTemplate').content.cloneNode(true);
      const button = fragment.querySelector('button');
      button.dataset.topicId = topic.id;
      button.addEventListener('click', handleTopicClick);
      topicButtons.push(button);
      document.getElementById('milkyWayTopics').appendChild(fragment);
    }
    for (const button of viewButtons) {
      button.addEventListener('click', handleViewClick);
    }
    selectView('map');
    mapImage.addEventListener('load', synchronizeDetailPanelHeight);
    window.addEventListener('resize', synchronizeDetailPanelHeight);
    if (typeof window.ResizeObserver === 'function') {
      const mapImageObserver = new window.ResizeObserver(synchronizeDetailPanelHeight);
      mapImageObserver.observe(mapImage);
    }
    synchronizeDetailPanelHeight();

    return { render, updateSky };
  }

  return { create };
})();
