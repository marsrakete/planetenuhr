window.PLANETENUHR_DAILY = (() => {
  'use strict';

  /** Connects the first card to existing calculations and keeps its hint nodes stable.
   * @param {object} dependencies Date/location/language, astronomy, calendar and navigation adapters.
   * @returns {{render:Function}} Controller following the global date and location.
   */
  function create(dependencies){
    const config = window.PLANETENUHR_DAILY_CONFIG;
    const model = window.PLANETENUHR_DAILY_MODEL;
    const astronomy = window.PLANETENUHR_EXPLORER_MODEL;
    const list = document.getElementById('dailyHighlightsList');
    const nodes = new Map();
    const cache = new Map();

    /** Writes localized message values without HTML interpolation.
     * @param {string} key Translation key. @param {object} [values={}] Plain-text replacements.
     * @returns {string} Localized message.
     */
    function message(key, values = {}){
      let value = dependencies.getTranslations()[key];
      Object.entries(values).forEach(([name, text]) => {value = value.replaceAll('{' + name + '}', String(text));});
      return value;
    }

    /** Formats one numerical value in the active app language.
     * @param {number} value Number. @param {number} [digits=0] Fixed decimal places.
     * @returns {string} Localized number.
     */
    function number(value, digits = 0){
      return new Intl.NumberFormat(dependencies.getLanguage(), {minimumFractionDigits:digits, maximumFractionDigits:digits}).format(value);
    }

    /** Formats a date-only record without moving it across timezone boundaries.
     * @param {string} key YYYY-MM-DD. @returns {string} Localized calendar date.
     */
    function calendarDate(key){
      return new Intl.DateTimeFormat(dependencies.getLanguage(), {dateStyle:'medium', timeZone:'UTC'}).format(new Date(key + 'T12:00:00Z'));
    }

    /** Reuses the horizon card's geometric positions for a local observation.
     * @param {string} key Body key. @param {Date} date Instant. @param {object} location Selected city.
     * @returns {object} Altitude and azimuth in degrees.
     */
    function horizontal(key, date, location){
      const equatorial = astronomy.equatorialOfDate(dependencies.getVector(key, date), date);
      return dependencies.getHorizontal(date, location, equatorial);
    }

    /** Collects one local civil day; cached data is independent of the current clock minute.
     * @param {Date} date Global instant. @param {object} location Selected city.
     * @returns {object} Normalized snapshot using existing calendar and astronomy data.
     */
    function snapshot(date, location){
      const timeZone = dependencies.getTimeZone(location);
      const dateKey = dependencies.getDateKey(date, timeZone);
      const key = dateKey + ':' + location.key + ':' + dependencies.getLanguage();
      if (cache.has(key)) return cache.get(key);
      const bounds = astronomy.localDayBounds(date, timeZone);
      const reference = new Date((bounds.start.getTime() + bounds.end.getTime()) / 2);
      const year = Number(dateKey.slice(0,4));
      const orbitalModelReliable = year >= config.orbitalModelYears.minimum && year <= config.orbitalModelYears.maximum;
      const altitudeAt = instant => horizontal('sun', instant, location).altitudeDeg;
      const solar = astronomy.solarLightDay(reference, timeZone, altitudeAt);
      const planets = new Map();
      if (orbitalModelReliable) {
        const step = config.observation.sampleMinutes * 60000;
        for (let time = bounds.start.getTime(); time < bounds.end.getTime(); time += step) {
          const instant = new Date(time);
          if (altitudeAt(instant) > config.observation.maximumSunAltitude) continue;
          config.observation.planetKeys.forEach(planetKey => {
            const position = horizontal(planetKey, instant, location);
            if (position.altitudeDeg < config.observation.minimumAltitude) return;
            let best = planets.get(planetKey);
            if (!best) {
              best = {key:planetKey, samples:0, altitudeDeg:-90};
              planets.set(planetKey, best);
            }
            best.samples++;
            if (position.altitudeDeg > best.altitudeDeg) Object.assign(best, position, {time:instant});
          });
        }
      }
      let conjunctions = [];
      if (orbitalModelReliable) {
        conjunctions = dependencies.getConjunctions(reference, config.lookahead.conjunction + 2).map(event => {
          return {...event, dateKey:dependencies.getDateKey(event.date, timeZone)};
        });
      }
      const calendar = dependencies.getCalendar().map(event => {
        if (event.category !== 'eclipse') {
          if (event.category !== 'planet') return event;
          const title = event.title.toLocaleLowerCase();
          const names = dependencies.getTranslations();
          const keys = Object.keys(window.PLANETENUHR_BODY_CONFIG).filter(body => body !== 'moon' && title.includes(names['planet_' + body].toLocaleLowerCase()));
          const approach = conjunctions.find(item => keys.includes(item.a) && keys.includes(item.b) && Math.abs(model.dayDifference(event.date, item.dateKey)) <= config.mergeWindowDays);
          return {...event, approach, bodyKeys:keys};
        }
        const visibility = dependencies.getEclipseVisibility(new Date(event.date + 'T12:00:00'), location);
        if (!visibility) return {...event, eclipseStatus:'unknown'};
        return {...event, eclipseStatus:visibility.status, eclipseRegional:visibility.source === 'fallback'};
      });
      const result = {dateKey, reference, timeZone, orbitalModelReliable, calendar, solar,
        moon:dependencies.getMoon(reference), showers:dependencies.getShowers(), planets:[...planets.values()], conjunctions};
      cache.set(key, result);
      if (cache.size > config.cacheEntries) cache.delete(cache.keys().next().value);
      return result;
    }

    /** Produces one short localized hint from a normalized candidate.
     * @param {object} item Ranked hint. @param {object} day Local-day snapshot.
     * @returns {object} Title/detail and optional localized direction segments with azimuth.
     */
    function copy(item, day){
      const translations = dependencies.getTranslations();
      const data = item.data;
      if (item.kind === 'calendar') {
        let detail = data.visibility || '';
        if (data.category === 'eclipse') {
          let local = message('daily_eclipse_unknown');
          if (data.eclipseStatus && data.eclipseStatus !== 'unknown') {
            local = message('daily_eclipse_local', {visibility:dependencies.getEclipseLabel(data.eclipseStatus)});
          }
          if (detail) detail += ' · ';
          detail += local;
          if (data.eclipseRegional) detail += ' · ' + message('daily_eclipse_regional');
        }
        if (data.approach) detail += ' · ' + message('daily_close_approach', {date:calendarDate(data.approach.dateKey), angle:dependencies.getAngleLabel(data.approach.separation)});
        return {title:data.title, detail};
      }
      if (item.group === 'meteor') {
        const name = translations['meteor_stream_' + data.stream.key] || data.stream.name;
        let detailKey = 'daily_meteor_peak_detail';
        if (data.days < 0) detailKey = 'daily_meteor_peak_past_detail';
        else if (data.days === 0) detailKey = 'daily_meteor_peak_today_detail';
        if (data.peakDated) detailKey = detailKey.replace('daily_meteor_', 'daily_meteor_dated_');
        let detail = message(detailKey, {date:calendarDate(data.peakDate)});
        if (data.brightMoon && (data.active || data.days === 0)) detail += ' ' + message('daily_meteor_moon');
        return {title:message('daily_' + item.kind, {name}), detail};
      }
      if (item.kind === 'conjunction') {
        return {title:message('daily_conjunction_title', {a:translations['planet_' + data.a], b:translations['planet_' + data.b]}),
          detail:calendarDate(item.dateKey) + ' · ' + dependencies.getAngleLabel(data.separation)};
      }
      if (item.kind === 'planet') {
        const time = new Intl.DateTimeFormat(dependencies.getLanguage(), {timeZone:day.timeZone, hour:'2-digit', minute:'2-digit', timeZoneName:'short', hour12:false}).format(data.time);
        const direction = dependencies.getDirection(data.azimuthDeg);
        const detail = message('daily_planet_detail', {time, direction:'{direction}', angle:dependencies.getAngleLabel(data.altitudeDeg)});
        const segments = detail.split('{direction}');
        return {title:message('daily_planet_title', {name:translations['planet_' + data.key]}),
          detail:detail.replace('{direction}', direction), before:segments[0], after:segments[1], direction, azimuthDeg:data.azimuthDeg};
      }
      if (item.group === 'moon') {
        return {title:message('daily_' + item.kind), detail:message('daily_' + item.kind + '_detail', {illum:number(data.illum)})};
      }
      return {title:message('daily_' + item.kind), detail:message('daily_' + item.kind + '_detail')};
    }

    /** Updates stable text and an optional miniature compass beside the direction.
     * North is up; azimuth rotates clockwise, matching the horizon calculations.
     * @param {HTMLElement} node Retained hint row. @param {object} content Localized copy and optional azimuth.
     * @returns {void}
     */
    function renderDetail(node, content){
      const direction = node.querySelector('[data-daily-direction]');
      const hasDirection = Number.isFinite(content.azimuthDeg);
      direction.hidden = !hasDirection;
      if (hasDirection) {
        node.querySelector('[data-daily-before]').textContent = content.before;
        node.querySelector('[data-daily-after]').textContent = content.after;
        node.querySelector('[data-daily-direction-label]').textContent = content.direction;
        let compass = direction.querySelector('.direction-compass');
        if (!compass) {
          compass = window.PLANETENUHR_COMPASS.create(content.azimuthDeg);
          direction.prepend(compass);
        } else {
          window.PLANETENUHR_COMPASS.setAzimuth(compass, content.azimuthDeg);
        }
      } else {
        node.querySelector('[data-daily-before]').textContent = content.detail;
        node.querySelector('[data-daily-after]').textContent = '';
        node.querySelector('[data-daily-direction-label]').textContent = '';
      }
    }

    /** Updates the retained card and keyed links without replacing focused controls.
     * @param {Date} date Global selected instant. @returns {void}
     */
    function render(date){
      const location = dependencies.getLocation();
      const day = snapshot(date, location);
      document.getElementById('dailyHighlightsTitle').textContent = message('daily_title');
      const time = document.getElementById('dailyHighlightsDate');
      time.dateTime = day.dateKey;
      time.textContent = message('daily_date', {date:dependencies.getDateLabel(date, day.timeZone), place:location.name});
      const items = model.select(day, config);
      const retained = new Set();
      items.forEach((item, index) => {
        let node = nodes.get(item.id);
        if (!node) {
          node = document.getElementById('dailyHighlightItemTemplate').content.firstElementChild.cloneNode(true);
          node.dataset.highlightId = item.id;
          nodes.set(item.id, node);
        }
        const content = copy(item, day);
        node.dataset.kind = item.kind;
        const badge = node.querySelector('[data-daily-when]');
        badge.textContent = message('daily_on_day');
        if (item.days === 1) badge.textContent = message('daily_in_one_day');
        else if (item.days > 1) badge.textContent = message('daily_in_days', {days:number(item.days)});
        node.querySelector('[data-daily-title]').textContent = content.title;
        window.PLANETENUHR_DAILY_GRAPHICS.render(node.querySelector('[data-daily-graphic]'), item, day.moon.frac);
        renderDetail(node, content);
        const link = node.querySelector('a');
        link.dataset.dailyTarget = item.target;
        link.href = dependencies.getCardUrl(item.target);
        link.setAttribute('aria-label', content.title + ' · ' + message('daily_open_card'));
        if (list.children[index] !== node) list.insertBefore(node, list.children[index] || null);
        retained.add(item.id);
      });
      nodes.forEach((node, key) => {
        if (!retained.has(key)) {node.remove();nodes.delete(key);}
      });
      const empty = document.getElementById('dailyHighlightsEmpty');
      empty.hidden = items.length > 0;
      empty.textContent = message('daily_empty');
      const solar = document.getElementById('dailyHighlightsSolar');
      solar.hidden = items.some(item => item.kind === 'polar_day' || item.kind === 'polar_night');
      if (day.solar.polarDay) solar.textContent = message('daily_polar_day_detail');
      else if (day.solar.polarNight) solar.textContent = message('daily_polar_night_detail');
      else {
        const clock = new Intl.DateTimeFormat(dependencies.getLanguage(), {timeZone:day.timeZone, hour:'2-digit', minute:'2-digit', hour12:false});
        let sunrise = '—';
        let sunset = '—';
        if (day.solar.sunrise) sunrise = clock.format(day.solar.sunrise);
        if (day.solar.sunset) sunset = clock.format(day.solar.sunset);
        solar.textContent = message('daily_solar', {sunrise, sunset});
      }
      document.getElementById('dailyHighlightsNote').textContent = message('daily_note');
      const range = document.getElementById('dailyHighlightsRange');
      range.hidden = day.orbitalModelReliable;
      range.textContent = message('daily_model_range');
      dependencies.updateLayout(list.closest('.display-container'));
    }

    /** Navigates to an existing card without reloading the page or changing the date.
     * @param {MouseEvent} event Delegated link activation. @returns {void}
     */
    function navigate(event){
      const link = event.target.closest('a[data-daily-target]');
      if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      dependencies.openCard(link.dataset.dailyTarget);
    }
    list.addEventListener('click', navigate);
    return {render};
  }
  return {create};
})();
