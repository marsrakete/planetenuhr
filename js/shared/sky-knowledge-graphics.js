window.PLANETENUHR_KNOWLEDGE_GRAPHICS = (() => {
  'use strict';

  /**
   * Connects the retained figure to the configured, template-based SVG scenes.
   * @param {HTMLElement} figure Figure containing the SVG slot and visible caption.
   * @returns {{render:Function}} Controller accepting an entry id and supported language.
   */
  function create(figure){
    const config = window.PLANETENUHR_KNOWLEDGE_GRAPHICS_CONFIG;
    const slot = figure.querySelector('[data-knowledge-drawing]');
    const caption = figure.querySelector('figcaption');
    let renderedScene = '';
    let renderedLanguage = '';

    /**
     * Displays a static teaching diagram without replacing the surrounding article or controls.
     * @param {string} entryId Stable knowledge entry id with a configured scene.
     * @param {string} language Supported language: de, en or fr.
     * @returns {void}
     */
    function render(entryId, language){
      const sceneId = config.entries[entryId];
      if (sceneId === renderedScene && language === renderedLanguage) {
        return;
      }
      const scene = config.scenes[sceneId];
      const fragment = document.getElementById('knowledgeGraphicTemplate').content.cloneNode(true);
      const svg = fragment.querySelector('svg');
      svg.setAttribute('aria-label', scene.caption[language]);
      scene.shapes.forEach(shape => {
        const primitive = document.getElementById('knowledgeGraphic-' + shape.tag).content.cloneNode(true);
        const node = primitive.querySelector(shape.tag);
        Object.entries(shape.attrs).forEach(([name, value]) => {
          node.setAttribute(name, String(value));
        });
        if (shape.text !== undefined) {
          if (typeof shape.text === 'string') {
            node.textContent = shape.text;
          } else {
            node.textContent = shape.text[language];
          }
        }
        svg.appendChild(node);
      });
      slot.replaceChildren(fragment);
      caption.textContent = scene.caption[language];
      renderedScene = sceneId;
      renderedLanguage = language;
    }

    return { render };
  }

  return { create };
})();
