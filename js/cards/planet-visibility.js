window.PLANETENUHR_PLANET_VISIBILITY_CARD = (() => {
  'use strict';
  const planetKeys = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];

  /** Creates the planet visibility and night-window card controller.
   * @param {object} dependencies Document, solar model, angle helpers, translations and display formatters.
   * @returns {{renderVisibility:Function,renderNightVisibility:Function}} Render methods for shared dashboard context.
   */
  function create(dependencies){
    const document = dependencies.document;

    /** Calculates when one planet is above the horizon during darkness.
     * @param {string} key Planet key.
     * @param {Date} date Selected observation date.
     * @param {object} location Selected city.
     * @returns {object} Night segments, dusk/dawn times and best observation time.
     */
    function nightVisibilitySegments(key, date, location){
      const elongation = dependencies.getSolarElongation(key, date);
      return dependencies.solarVisibility.nightVisibilitySegments(date, location, elongation);
    }

    /** Renders dusk-to-dawn windows for the visible planets.
     * @param {object} context Shared dashboard context containing date and location.
     * @returns {void}
     */
    function renderNightVisibility(context){
      const panel = document.getElementById('nightVisibilityPanel');
      const headerTemplate = document.getElementById('nightVisibilityHeaderTemplate');
      const rowTemplate = document.getElementById('nightVisibilityRowTemplate');
      if (!panel || !headerTemplate || !rowTemplate) {
        return;
      }
      panel.innerHTML = '';
      const date = context.date;
      const location = context.location;
      const translations = dependencies.getTranslations();
      const reference = nightVisibilitySegments('jupiter', date, location);
      if (!reference.durationHours) {
        return;
      }
      const durationHours = reference.durationHours;
      const headerFragment = headerTemplate.content.cloneNode(true);
      headerFragment.querySelector('[data-night-place]').textContent = location.name;
      headerFragment.querySelector('[data-night-dusk]').textContent = dependencies.formatTime(reference.dusk);
      headerFragment.querySelector('[data-night-dawn]').textContent = dependencies.formatTime(reference.dawn);
      panel.appendChild(headerFragment);

      planetKeys.forEach(key => {
        const info = nightVisibilitySegments(key, date, location);
        const rowFragment = rowTemplate.content.cloneNode(true);
        const rowWrap = rowFragment.querySelector('.night-row-wrap');
        const track = rowWrap.querySelector('[data-night-track]');
        if (!info.segments.length) {
          const empty = document.createElement('div');
          empty.className = 'night-empty';
          empty.textContent = translations.visibility_night_empty || 'Not above the horizon during the dark part of the night';
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
        rowWrap.querySelector('[data-night-name]').textContent = dependencies.getBodyDisplayName(key);
        const best = rowWrap.querySelector('[data-night-best]');
        if (!info.bestTime) {
          best.className += ' empty';
        }
        if (info.bestTime) {
          best.textContent = (translations.visibility_best || 'Best around') + ' ' + dependencies.formatTime(info.bestTime);
        } else {
          best.textContent = translations.visibility_night_empty || 'Not above the horizon during the dark part of the night';
        }
        panel.appendChild(rowFragment);
      });
    }

    /** Renders approximate morning/evening visibility and best dark-sky times.
     * @param {object} context Shared dashboard context containing date and location.
     * @returns {void}
     */
    function renderVisibility(context){
      const list = document.getElementById('visibilityList');
      if (!list) {
        return;
      }
      const date = context.date;
      const location = context.location;
      const translations = dependencies.getTranslations();
      const legend = document.getElementById('visibilityLegend');
      if (legend) {
        legend.textContent = (translations.visibility_legend_prefix || 'Approximate for') + ' ' + location.name + '; '
          + (translations.visibility_legend_suffix || 'based on solar elongation')
          + ' · '
          + (translations.legend_night_visibility || 'Approximate visibility between dusk and dawn for the selected city');
      }
      const rowTemplate = document.getElementById('visibilityRowTemplate');
      if (!rowTemplate) {
        return;
      }
      list.innerHTML = '';
      const sunLongitude = dependencies.solarVisibility.sunLongitude(date);
      planetKeys.forEach(key => {
        const longitude = dependencies.getEclipticLongitude(key, date);
        const elongation = dependencies.signedDegrees(longitude - sunLongitude);
        const absoluteElongation = Math.abs(elongation);
        let start = 42;
        let width = 16;
        let label = translations.visibility_difficult;
        if (absoluteElongation >= 12) {
          width = Math.min(44, Math.max(12, absoluteElongation / 2.2));
          if (elongation > 0) {
            start = 62;
            label = translations.visibility_evening;
          } else {
            start = 18;
            label = translations.visibility_morning;
          }
        }
        if (absoluteElongation >= 120 && key !== 'mercury' && key !== 'venus') {
          start = 18;
          width = 64;
          label = translations.visibility_night;
        }
        const row = rowTemplate.content.cloneNode(true);
        row.querySelector('[data-visibility-name]').textContent = translations['planet_' + key] || key;
        const fill = row.querySelector('[data-visibility-fill]');
        fill.style.left = Math.max(0, Math.min(100, start)) + '%';
        fill.style.width = Math.max(4, Math.min(100 - start, width)) + '%';
        row.querySelector('[data-visibility-note]').textContent = label;
        const night = nightVisibilitySegments(key, date, location);
        const nightDetail = row.querySelector('[data-visibility-night-detail]');
        if (night.segments.length && night.bestTime) {
          const longest = night.segments.slice().sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
          nightDetail.textContent = dependencies.formatTime(new Date(longest.start)) + '-'
            + dependencies.formatTime(new Date(longest.end)) + ' · '
            + (translations.visibility_best || 'Best around') + ' '
            + dependencies.formatTime(night.bestTime);
        } else {
          nightDetail.textContent = translations.visibility_night_empty || 'Not above the horizon during the dark part of the night';
        }
        list.appendChild(row);
      });
    }

    return {renderVisibility, renderNightVisibility};
  }

  return {create};
})();
