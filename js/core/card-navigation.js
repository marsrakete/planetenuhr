window.PLANETENUHR_CARD_NAVIGATION = (() => {
  'use strict';
  /** Normalizes a help key or generated card id for matching.
   * @param {string} rawValue Raw card token. @returns {string} Normalized token.
   */
  function normalizeCardToken(rawValue){
    if (!rawValue) {
      return '';
    }
    return String(rawValue).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+/, '').replace(/_+$/, '');
  }

  /** Creates the owner of requested-card state and card deep links.
   * @param {object} options Document, window, selection context and date-key formatter.
   * @returns {object} Navigation operations; starts no listeners or timers.
   */
  function create(options){
    const document = options.document;
    const window = options.window;
    let requestedCardKey = '';

    /** Sets the requested destination without navigating.
     * @param {string} key Normalized card key. @returns {void}
     */
    function setRequestedCardKey(key){ requestedCardKey = key; }

    /** Returns the destination maintained in the URL.
     * No parameters. @returns {string} Requested card key.
     */
    function getRequestedCardKey(){ return requestedCardKey; }

    /** Finds a card by its help key or existing id.
     * @param {string} rawValue Query parameter. @returns {HTMLElement|null} Matching card.
     */
    function cardElementFromParameter(rawValue){
      const normalized = normalizeCardToken(rawValue);
      if (!normalized) {
        return null;
      }
      for (const card of document.querySelectorAll('.display-container[data-help-key]')) {
        if (normalizeCardToken(card.getAttribute('data-help-key')) === normalized || normalizeCardToken(card.id) === normalized) {
          return card;
        }
      }
      return null;
    }

    /** Assigns stable ids without overwriting existing anchors.
     * No parameters. @returns {void}
     */
    function applyCardAnchorIds(){
      document.querySelectorAll('.display-container[data-help-key]').forEach(card => {
        const key = normalizeCardToken(card.getAttribute('data-help-key'));
        if (key && !card.id) {
          card.id = 'card-' + key;
        }
      });
    }

    /** Synchronizes selection parameters without navigation.
     * No parameters. @returns {void}
     */
    function syncUrlState(){
      const url = window.PLANETENUHR_DASHBOARD_CONTEXT.selectionUrl(window.location.href, options.getContext(), requestedCardKey);
      window.history.replaceState(null, '', url);
    }

    /** Builds a link retaining the current day, city and language.
     * @param {string} key Destination help key. @returns {string} Absolute URL.
     */
    function dailyHighlightCardUrl(key){
      const selection = options.getContext();
      const url = new URL(window.location.href);
      url.searchParams.set('date', options.formatDateKey(selection.date).replaceAll('-', ''));
      url.searchParams.set('place', selection.location.name);
      url.searchParams.set('lang', selection.language);
      url.searchParams.set('card', key);
      const card = cardElementFromParameter(key);
      if (card) {
        url.hash = card.id;
      }
      return url.href;
    }

    /** Opens and focuses a destination while retaining the selected day and place.
     * @param {string} key Destination help key. @returns {void}
     */
    function openDailyHighlightCard(key){
      const card = cardElementFromParameter(key);
      if (!card) {
        return;
      }
      requestedCardKey = key;
      syncUrlState();
      card.setAttribute('tabindex', '-1');
      card.focus({preventScroll:true});
      let behavior = 'smooth';
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        behavior = 'auto';
      }
      card.scrollIntoView({behavior,block:'start',inline:'nearest'});
    }

    /** Scrolls to the initial deep-link card after layout has settled.
     * No parameters. @returns {void}
     */
    function scrollToRequestedCard(){
      if (!requestedCardKey) {
        return;
      }
      const card = cardElementFromParameter(requestedCardKey);
      if (!card) {
        return;
      }
      card.scrollIntoView({behavior:'smooth',block:'start',inline:'nearest'});
    }

    return {setRequestedCardKey,getRequestedCardKey,cardElementFromParameter,applyCardAnchorIds,
      syncUrlState,dailyHighlightCardUrl,openDailyHighlightCard,scrollToRequestedCard};
  }
  return {create,normalizeCardToken};
})();
