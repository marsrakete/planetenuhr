window.PLANETENUHR_KNOWLEDGE = (() => {
  'use strict';

  /**
   * Shuffles stable entry ids with Fisher–Yates and avoids an immediate repeat between rounds.
   * @param {object[]} entries Configured entries, each with an id.
   * @param {string|null} previousId Last id shown in the previous round.
   * @param {Function} [random=Math.random] Random source returning a number in [0, 1).
   * @returns {string[]} Every id exactly once in shuffled order.
   */
  function shuffledIds(entries, previousId, random = Math.random){
    const ids = entries.map(entry => entry.id);
    for (let index = ids.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      const saved = ids[index];
      ids[index] = ids[other];
      ids[other] = saved;
    }
    if (ids.length > 1 && ids[0] === previousId) {
      const first = ids[0];
      ids[0] = ids[1];
      ids[1] = first;
    }
    return ids;
  }

  /**
   * Wires a persistent knowledge card and shows one randomly chosen entry at startup.
   * @param {object} dependencies getLanguage(), getTranslations() and updateCardLayout(card) adapters.
   * @returns {{render:Function}} Controller that translates the current entry without changing it.
   */
  function create(dependencies){
    const entries = window.PLANETENUHR_MNEMONICS.entries;
    const byId = new Map(entries.map(entry => [entry.id, entry]));
    const card = document.querySelector('[data-help-key="sky_knowledge"]');
    const fragment = document.getElementById('knowledgeEntryTemplate').content.cloneNode(true);
    const article = fragment.querySelector('article');
    const title = fragment.querySelector('[data-knowledge-title]');
    const quote = fragment.querySelector('[data-knowledge-original]');
    const subtitle = fragment.querySelector('[data-knowledge-subtitle]');
    const explanation = fragment.querySelector('[data-knowledge-explanation]');
    const note = fragment.querySelector('[data-knowledge-note]');
    const own = fragment.querySelector('[data-knowledge-own]');
    const sourceList = fragment.querySelector('[data-knowledge-sources]');
    const nextButton = document.getElementById('knowledgeNext');
    let order = shuffledIds(entries, null);
    let cursor = 0;
    let renderedId = '';
    document.getElementById('knowledgeContent').appendChild(fragment);

    /**
     * Updates only source links when the entry changes, using the shared link template.
     * @param {object} entry Selected configuration entry.
     * @returns {void}
     */
    function renderSources(entry){
      if (renderedId === entry.id) {
        return;
      }
      const links = document.createDocumentFragment();
      entry.sources.forEach(source => {
        const sourceFragment = document.getElementById('knowledgeSourceTemplate').content.cloneNode(true);
        const link = sourceFragment.querySelector('a');
        link.textContent = source.label;
        link.href = source.url;
        links.appendChild(sourceFragment);
      });
      sourceList.replaceChildren(links);
      renderedId = entry.id;
    }

    /** Translates and displays the retained entry without replacing controls or changing the order. No parameters. @returns {void} */
    function render(){
      let language = dependencies.getLanguage();
      if (!['de', 'en', 'fr'].includes(language)) {
        language = 'en';
      }
      const labels = dependencies.getTranslations();
      const entry = byId.get(order[cursor]);
      const copy = entry.texts[language];
      card.dataset.knowledgeId = entry.id;
      article.lang = language;
      document.getElementById('knowledgeHeading').textContent = labels.title_sky_knowledge;
      document.getElementById('knowledgeCategory').textContent = labels['knowledge_kind_' + entry.kind];
      document.getElementById('knowledgeCounter').textContent = labels.knowledge_counter
        .replace('{current}', String(cursor + 1)).replace('{total}', String(entries.length));
      nextButton.textContent = labels.knowledge_next;
      nextButton.setAttribute('aria-label', labels.knowledge_next);
      document.getElementById('knowledgeSourceLabel').textContent = labels.knowledge_sources;
      title.textContent = copy.title;
      quote.hidden = !entry.original;
      subtitle.hidden = true;
      if (entry.original) {
        quote.textContent = entry.original.text;
        quote.lang = entry.original.language;
        if (entry.original.language !== language && copy.subtitle) {
          subtitle.textContent = copy.subtitle;
          subtitle.hidden = false;
        }
      }
      explanation.textContent = copy.explanation;
      note.hidden = !copy.note;
      note.textContent = copy.note || '';
      own.hidden = !entry.ownWording;
      own.textContent = labels.knowledge_own_wording;
      renderSources(entry);
      dependencies.updateCardLayout(card);
    }

    /** Shows the next entry; reshuffles only after all entries have appeared. No parameters. @returns {void} */
    function next(){
      cursor += 1;
      if (cursor >= order.length) {
        const previousId = order[order.length - 1];
        order = shuffledIds(entries, previousId);
        cursor = 0;
      }
      render();
    }

    nextButton.addEventListener('click', next);
    render();
    return { render };
  }

  return { create, shuffledIds };
})();
