window.PLANETENUHR_AURORA_CARD = (() => {
  'use strict';

  /** Creates the translated Aurora panel and connects it to the NOAA data service.
   * @param {object} options DOM, templates, data service, translations and date formatters.
   * @returns {object} Aurora card loading and rendering operations.
   */
  function create(options){
    const document = options.document;

    /** Returns the localized label for one aurora band.
     * @param {string} band NOAA activity band.
     * @returns {string} Localized band label.
     */
    function bandLabel(band){
      const t = options.getTranslations();
      if (band === 'extreme') return t.aurora_extreme || 'Very high chance';
      if (band === 'high') return t.aurora_high || 'High chance';
      if (band === 'medium') return t.aurora_medium || 'Moderate chance';
      return t.aurora_low || 'Low chance';
    }

    /** Returns the localized Germany-specific observation note for a Kp band.
     * @param {string} band NOAA activity band.
     * @returns {string} Localized observation note.
     */
    function germanyCopy(band){
      const t = options.getTranslations();
      if (band === 'extreme') return t.aurora_germany_extreme || 'Strong event; aurora may be visible across large parts of Germany.';
      if (band === 'high') return t.aurora_germany_high || 'Good chance in northern Germany; possible farther south.';
      if (band === 'medium') return t.aurora_germany_medium || 'Possible in northern Germany if the sky is dark and clear.';
      return t.aurora_germany_low || 'Mostly too weak for Germany; perhaps only far northern horizon.';
    }

    /** Updates the existing status and metadata nodes without rebuilding their card.
     * @param {object} state Loading, band, title, sample and detail values to show.
     * @returns {void}
     */
    function renderState(state = {}){
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
      } = state;
      const t = options.getTranslations();
      status.className = 'aurora-badge';
      if (!loading) status.className += ' ' + band;
      let statusText = bandLabel(band);
      if (loading) statusText = t.aurora_loading || 'Loading aurora data...';
      if (title) statusText = title;
      status.textContent = statusText;

      const lines = [];
      if (Number.isFinite(kp)) {
        lines.push({label:(t.aurora_kp || 'Planetary Kp') + ': ',value:kp.toFixed(1)});
      }
      if (updatedAt instanceof Date && !Number.isNaN(updatedAt.getTime())) {
        lines.push({label:(t.aurora_updated || 'Updated') + ': ',value:options.formatDate(updatedAt) + ' ' + options.formatTime(updatedAt)});
      }
      lines.push({label:(t.aurora_source || 'Source') + ': ',value:sourceLabel});
      if (detail) lines.push({text:detail});

      meta.replaceChildren();
      lines.forEach(line => {
        if (line.text) {
          const fragment = options.cloneTemplate('auroraMetaTextTemplate');
          fragment.firstElementChild.textContent = line.text;
          meta.appendChild(fragment);
          return;
        }
        const fragment = options.cloneTemplate('auroraMetaRowTemplate');
        fragment.querySelector('strong').textContent = line.label;
        fragment.firstElementChild.appendChild(document.createTextNode(line.value));
        meta.appendChild(fragment);
      });
    }

    /** Renders one normalized sample with the same translated label and status copy.
     * @param {object} sample NOAA Kp sample with timeTag and kp.
     * @returns {void}
     */
    function renderSample(sample){
      const band = options.data.bandForKp(sample.kp);
      let updatedAt = null;
      if (sample.timeTag) updatedAt = new Date(sample.timeTag);
      renderState({
        band,
        title:bandLabel(band),
        kp:sample.kp,
        updatedAt,
        detail:germanyCopy(band)
      });
    }

    /** Loads NOAA data and preserves the existing loading, cache and unavailable states.
     * @param {boolean} [force=false] Bypass a fresh cache when requesting data.
     * @returns {Promise<object|null>} Loaded Kp sample or null when unavailable.
     */
    function load(force = false){
      const panel = document.getElementById('auroraPanel');
      if (!panel) return Promise.resolve(null);
      const cached = options.data.getFreshSample();
      if (!force && cached) {
        renderSample(cached);
        return Promise.resolve(cached);
      }
      if (options.data.hasPending()) return options.data.load(force);

      renderState({loading:true});
      return options.data.load(force).then(sample => {
        if (!sample) {
          const t = options.getTranslations();
          renderState({
            band:'low',
            title:t.aurora_unavailable || 'Aurora data currently unavailable',
            detail:germanyCopy('low')
          });
          return null;
        }
        renderSample(sample);
        return sample;
      });
    }

    return {load,renderState};
  }

  return {create};
})();
