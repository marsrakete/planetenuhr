window.PLANETENUHR_CONSTELLATION_DETAILS = (() => {
  'use strict';

  /** Creates the shared profile renderer for constellation dialogs.
   * @param {{document:Document,config:object}} options DOM templates and localized profile data.
   * @returns {{render:Function}} Stateless renderer for either constellation card.
   */
  function create(options){
    const document = options.document;
    const config = options.config;

    /** Renders a constellation profile into a dialog's content column.
     * @param {HTMLElement|null} target Destination article.
     * @param {string} key Shared figure name or visibility entry key.
     * @param {string} language Requested UI language, with English fallback.
     * @param {object|string} [lead] Existing short description to retain as the introduction.
     * @returns {boolean} True when the requested profile and templates were available.
     */
    function render(target, key, language, lead){
      if (!target) {
        return false;
      }
      target.replaceChildren();
      const entry = config.entries[key];
      const template = document.getElementById('constellationDescriptionTemplate');
      const factTemplate = document.getElementById('constellationDescriptionFactTemplate');
      const linkTemplate = document.getElementById('constellationDescriptionLinkTemplate');
      if (!entry || !template || !factTemplate || !linkTemplate) {
        return false;
      }
      const labels = config.labels[language] || config.labels.en;
      const text = entry.text[language] || entry.text.en;
      const fragment = template.content.cloneNode(true);
      let area = entry.area.toLocaleString(language) + ' °²';
      if (entry.areaNote) {
        area += ' · ' + (entry.areaNote[language] || entry.areaNote.en);
      }
      fragment.querySelector('[data-constellation-description-title]').textContent = entry.abbreviation + ' · ' + area;
      let introduction = text.intro;
      if (typeof lead === 'string' && lead) {
        introduction = lead;
      } else if (lead && typeof lead === 'object') {
        introduction = lead[language] || lead.en || introduction;
      }
      fragment.querySelector('[data-constellation-description-intro]').textContent = introduction;
      const facts = fragment.querySelector('[data-constellation-description-facts]');
      for (const field of ['location', 'season', 'brightest', 'highlights', 'mythology']) {
        const fact = factTemplate.content.cloneNode(true);
        fact.querySelector('dt').textContent = labels[field];
        fact.querySelector('dd').textContent = text[field];
        facts.appendChild(fact);
      }
      fragment.querySelector('[data-constellation-description-note]').textContent = labels.note;
      fragment.querySelector('[data-constellation-description-sources-title]').textContent = labels.sources;
      fragment.querySelector('[data-constellation-description-sources]').setAttribute('aria-label', labels.sources);
      const links = fragment.querySelector('[data-constellation-description-links]');
      for (const source of entry.sources) {
        const link = linkTemplate.content.cloneNode(true);
        const anchor = link.querySelector('a');
        anchor.textContent = source.label;
        anchor.href = source.url;
        links.appendChild(link);
      }
      target.appendChild(fragment);
      return true;
    }

    return {render};
  }

  return {create};
})();
