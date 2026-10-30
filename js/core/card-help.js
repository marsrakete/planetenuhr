window.PLANETENUHR_HELP = (() => {
  'use strict';
  /** Creates the localized help owner; initialization wires document handlers once.
   * @param {object} options Document, window, curated content, language and template adapters.
   * @returns {object} Help rendering, formula rendering and initialization operations.
   */
  function create(options){
    const document = options.document;
    const window = options.window;
    const Node = window.Node;
    const cardHelp = options.config;
    let wired = false;

    /** Resolves the active help language with its existing English fallback.
     * No parameters. @returns {object} Help headings and card content.
     */
    function currentCardHelpPack(){
      const lang = options.getLanguage();
      return cardHelp[lang] || cardHelp.en || { sections:{}, cards:{} };
    }

    /**
     * Converts the mixed HTML-plus-symbol notation used in help formulas into
     * KaTeX-friendly TeX input.
     * @param {string} formulaHtml Formula source from the help config.
     * @returns {string} Normalized TeX string.
     */
    function helpFormulaHtmlToLatex(formulaHtml){
      const wrapper = document.createElement('div');
      wrapper.innerHTML = formulaHtml;
      const latex = helpFormulaNodeToLatex(wrapper);
      return latex.replace(/\s+/g, ' ').trim();
    }

    /**
     * Converts a help-formula DOM subtree into TeX notation.
     * @param {Node} node DOM node from the temporary help-formula wrapper.
     * @returns {string} Partial TeX string for this subtree.
     */
    function helpFormulaNodeToLatex(node){
      let latex = '';

      node.childNodes.forEach(childNode => {
        if (childNode.nodeType === Node.TEXT_NODE) {
          latex += helpFormulaTextToLatex(childNode.textContent || '');
          return;
        }

        if (childNode.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        const tagName = childNode.tagName.toLowerCase();
        if (tagName === 'sub') {
          latex += '_{' + helpFormulaNodeToLatex(childNode) + '}';
          return;
        }

        if (tagName === 'sup') {
          latex += '^{' + helpFormulaNodeToLatex(childNode) + '}';
          return;
        }

        if (tagName === 'br') {
          latex += ' ';
          return;
        }

        latex += helpFormulaNodeToLatex(childNode);
      });

      return latex;
    }

    /**
     * Rewrites decoded symbols and plain-text operators into KaTeX-friendly TeX.
     * @param {string} text Plain text fragment from a help formula.
     * @returns {string} Converted TeX fragment.
     */
    function helpFormulaTextToLatex(text){
      let latex = text;
      latex = latex.replace(/\u00a0/g, ' ');
      latex = latex.replace(/Δ/g, '\\Delta ');
      latex = latex.replace(/δ/g, '\\delta ');
      latex = latex.replace(/λ/g, '\\lambda ');
      latex = latex.replace(/φ/g, '\\phi ');
      latex = latex.replace(/ϕ/g, '\\phi ');
      latex = latex.replace(/ϖ/g, '\\varpi ');
      latex = latex.replace(/π/g, '\\pi ');
      latex = latex.replace(/√/g, '\\sqrt');
      latex = latex.replace(/·/g, '\\cdot ');
      latex = latex.replace(/≈/g, '\\approx ');
      latex = latex.replace(/∝/g, '\\propto ');
      latex = latex.replace(/±/g, '\\pm ');
      latex = latex.replace(/☉/g, '\\odot ');
      latex = latex.replace(/°/g, '^\\circ ');
      latex = latex.replace(/\bcos\b/g, '\\cos');
      latex = latex.replace(/\bsin\b/g, '\\sin');
      latex = latex.replace(/\blog\b/g, '\\log');
      latex = latex.replace(/\bmin\b/g, '\\min');
      latex = latex.replace(/\bmod\b/g, '\\bmod');
      latex = latex.replace(/\bsigned\b/g, '\\operatorname{signed}');
      latex = latex.replace(/\bclamp\b/g, '\\operatorname{clamp}');
      latex = latex.replace(/(^|[^\\])frac\b/g, (match, prefix) => {
        return prefix + '\\operatorname{frac}';
      });
      return latex;
    }

    /**
     * Renders all help-formula expressions inside one popup with KaTeX when the
     * library is available. If KaTeX is not loaded or parsing fails, the original
     * text stays visible as a fallback.
     * @param {ParentNode} root Popup root that contains help-formula elements.
     * @returns {void}
     */
    function renderHelpMathInElement(root){
      if (!root || !window.katex) {
        return;
      }

      root.querySelectorAll('.card-help-formula-expr').forEach(node => {
        const sourceHtml = node.innerHTML;
        const latex = helpFormulaHtmlToLatex(sourceHtml);

        if (!latex) {
          return;
        }

        try {
          window.katex.render(latex, node, {
            throwOnError: false,
            displayMode: true
          });
          node.classList.add('is-katex');
        } catch (error) {
          node.classList.remove('is-katex');
        }
      });
    }

    /**
     * Renders every currently mounted help popup formula with KaTeX.
     * This function is exposed globally so the deferred KaTeX loader can trigger
     * it after the library becomes available.
     * @returns {void}
     */
    function renderPlanetenuhrHelpMath(){
      document.querySelectorAll('.card-help-popup').forEach(popup => {
        renderHelpMathInElement(popup);
      });
    }

    /** Closes open help popups while optionally keeping one wrapper open.
     * @param {HTMLElement|null} except Wrapper to retain. @returns {void}
     */
    function closeAllCardHelp(except){
      document.querySelectorAll('.card-help.open').forEach(node => {
        if (except && node === except) return;
        node.classList.remove('open');
        const button = node.querySelector('.card-help-button');
        if (button) button.setAttribute('aria-expanded', 'false');
      });
    }

    /** Creates template-based help popups and wires outside-click/Escape once.
     * No parameters. @returns {void}
     */
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
        const fragment = options.cloneTemplate('cardHelpTemplate');
        if (!fragment) { return; }
        const wrap = fragment.querySelector('.card-help');
        const button = wrap.querySelector('.card-help-button');
        const popup = wrap.querySelector('.card-help-popup');
        button.setAttribute('aria-label', sections.button || 'More info');
        popup.appendChild(renderCardHelpEntry(entry, sections, key));
        renderHelpMathInElement(popup);
        card.appendChild(fragment);
        button.addEventListener('click', event => {
          event.stopPropagation();
          const open = wrap.classList.contains('open');
          if (open) {
            closeAllCardHelp(null);
          } else {
            closeAllCardHelp(wrap);
          }
          wrap.classList.toggle('open', !open);
          button.setAttribute('aria-expanded', String(!open));
        });
        popup.addEventListener('click', event => event.stopPropagation());
      });
      if (!wired) {
        document.addEventListener('click', () => closeAllCardHelp(null));
        document.addEventListener('keydown', event => {
          if (event.key === 'Escape') closeAllCardHelp(null);
        });
        wired = true;
      }
    }

    /** Clones a help node from the shared HTML templates.
     * @param {string} id Template id. @returns {Element} Independent element.
     */
    function cloneHelpNode(id){
      return options.cloneTemplate(id).firstElementChild;
    }

    /** Builds the controlled rich-text help content using retained HTML templates.
     * @param {object} entry Curated card content. @param {object} sections Localized headings.
     * @param {string} cardKey Stable help key. @returns {DocumentFragment} Complete popup content.
     */
    function renderCardHelpEntry(entry, sections, cardKey){
      const fragment = options.cloneTemplate('cardHelpContentTemplate');
      fragment.querySelector('.card-help-title').textContent = sections.title || 'About this card';
      const detailItems = (entry.details || []).slice();
      if (cardKey === 'moon_nodes' && entry.markerNote) detailItems.push(entry.markerNote);

      /** Adds one help section and its localized heading.
       * @param {string} title Heading text. @returns {HTMLElement} Section container.
       */
      function section(title){
        const node = cloneHelpNode('cardHelpSectionTemplate');
        node.querySelector('h4').textContent = title;
        fragment.appendChild(node);
        return node;
      }
      if (entry.intro && entry.intro.length) {
        const node = section(sections.overview || 'Overview');
        entry.intro.forEach(text => {
          const paragraph = cloneHelpNode('cardHelpParagraphTemplate');
          paragraph.innerHTML = text;
          node.appendChild(paragraph);
        });
      }
      if (entry.formulas && entry.formulas.length) {
        const node = section(sections.formulas || 'Formulas used');
        const formulas = cloneHelpNode('cardHelpFormulasTemplate');
        entry.formulas.forEach(item => {
          const formula = cloneHelpNode('cardHelpFormulaTemplate');
          formula.querySelector('.card-help-formula-expr').innerHTML = item.expr;
          if (item.note) {
            const note = cloneHelpNode('cardHelpFormulaNoteTemplate');
            note.innerHTML = item.note;
            formula.appendChild(note);
          }
          formulas.appendChild(formula);
        });
        node.appendChild(formulas);
      }
      if (detailItems.length) {
        const node = section(sections.details || 'Data & notes');
        const list = cloneHelpNode('cardHelpListTemplate');
        detailItems.forEach(text => {
          const item = cloneHelpNode('cardHelpListItemTemplate');
          item.innerHTML = text;
          list.appendChild(item);
        });
        node.appendChild(list);
      }
      if (entry.links && entry.links.length) {
        const node = section(sections.links || 'Sources & further reading');
        const links = cloneHelpNode('cardHelpLinksTemplate');
        entry.links.forEach(link => {
          const anchor = cloneHelpNode('cardHelpLinkTemplate');
          anchor.setAttribute('href', link.url);
          anchor.innerHTML = link.label;
          links.appendChild(anchor);
        });
        node.appendChild(links);
      }
      return fragment;
    }

    return { currentCardHelpPack, helpFormulaHtmlToLatex, helpFormulaNodeToLatex, helpFormulaTextToLatex, renderHelpMathInElement, renderPlanetenuhrHelpMath, closeAllCardHelp, initCardHelp, renderCardHelpEntry };
  }
  return {create};
})();
