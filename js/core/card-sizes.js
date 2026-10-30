window.PLANETENUHR_CARD_SIZES = (() => {
  'use strict';
  /** Creates the owner of persisted sizes and size-control listeners.
   * @param {object} options Document, window, config, templates, token normalizer, layout and render adapters.
   * @returns {object} Existing size operations and explicit initialization.
   */
  function create(options){
    const document = options.document;
    const window = options.window;
    const cardSizeStorageKey = options.config.storageKey;
    const supportedCardSizes = options.config.supportedSizes;
    const specialDefaultCardSizes = options.config.specialDefaults;
    let storedCardSizes = {};
    let outsideWired = false;
    let globalWired = false;

    /**
     * Returns the shared card size when every resizable card currently uses the
     * same token. Mixed states return an empty string so the global control can
     * stay neutral.
     * @returns {string} Shared size token or an empty string for mixed sizes.
     */
    function sharedDashboardCardSize(){
      const cards = resizableDashboardCards();
      if (!cards.length) {
        return '';
      }

      const firstSize = effectiveCardSize(cards[0]);
      let index = 1;
      while (index < cards.length) {
        if (effectiveCardSize(cards[index]) !== firstSize) {
          return '';
        }
        index += 1;
      }

      return firstSize;
    }

    /**
     * Updates the compact global size buttons in the date settings panel.
     * The control highlights only when every dashboard card shares one size.
     * @returns {void}
     */
    function updateGlobalCardSizeControlState(){
      const t = options.getTranslations();
      const control = document.getElementById('globalCardSizeControl');
      if (!control) {
        return;
      }

      const sharedSize = sharedDashboardCardSize();
      control.setAttribute('aria-label', t.date_global_card_size || 'All cards');

      control.querySelectorAll('[data-global-card-size]').forEach(button => {
        const size = button.getAttribute('data-global-card-size');
        let title = size;

        if (size === 'normal') {
          title = t.card_size_normal || 'Normal size';
        } else if (size === 'wide') {
          title = t.card_size_wide || 'Wide size';
        } else if (size === 'large') {
          title = t.card_size_large || 'Large size';
        }

        button.setAttribute('title', title);
        button.setAttribute('aria-label', title);

        if (sharedSize && sharedSize === size) {
          button.classList.add('active');
          button.setAttribute('aria-pressed', 'true');
        } else {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        }
      });
    }

    /**
     * Resolves the stable storage key for one resizable dashboard card.
     * The help key already identifies most content cards consistently across
     * languages and reloads, so it is reused for local layout persistence.
     * @param {HTMLElement} card Dashboard card element.
     * @returns {string} Stable card key, or an empty string when none is available.
     */
    function resizableCardKey(card){
      if (!card) {
        return '';
      }
      const helpKey = card.getAttribute('data-help-key');
      return options.normalizeCardToken(helpKey);
    }

    /**
     * Returns all dashboard cards that support the user size control.
     * Utility cards outside the main content grid are excluded on purpose so
     * the dashboard remains predictable and the top date bar stays fixed.
     * @returns {HTMLElement[]} Resizable content cards.
     */
    function resizableDashboardCards(){
      return Array.from(document.querySelectorAll('.grid .display-container[data-help-key]'))
        .filter(card => !card.classList.contains('time-card') && !card.classList.contains('daily-highlights-card'));
    }

    /**
     * Checks whether one card size token is supported by the dashboard.
     * @param {string} size Requested size token.
     * @returns {boolean} True when the token is one of the supported size levels.
     */
    function isSupportedCardSize(size){
      let index = 0;
      while (index < supportedCardSizes.length) {
        if (supportedCardSizes[index] === size) {
          return true;
        }
        index += 1;
      }
      return false;
    }

    /**
     * Resolves the built-in default size for one dashboard card.
     * Cards that already had a broader editorial layout keep that as their
     * default, while all remaining cards start in their normal footprint.
     * @param {HTMLElement} card Dashboard card element.
     * @returns {string} Default size token: `normal`, `wide` or `large`.
     */
    function defaultCardSize(card){
      const cardKey = resizableCardKey(card);
      if (cardKey && specialDefaultCardSizes[cardKey]) {
        return specialDefaultCardSizes[cardKey];
      }
      if (card && card.classList.contains('wide-card')) {
        return 'wide';
      }
      return 'normal';
    }

    /**
     * Loads persisted card size overrides from localStorage.
     * Invalid or stale payloads are ignored so a broken saved value never
     * blocks the dashboard from loading.
     * @returns {object} Stored size map keyed by card help key.
     */
    function loadStoredCardSizes(){
      try {
        if (!window.localStorage) { return {}; }
        const rawValue = window.localStorage.getItem(cardSizeStorageKey);
        if (!rawValue) {
          return {};
        }
        const parsedValue = JSON.parse(rawValue);
        if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
          return {};
        }
        return parsedValue;
      } catch (error) {
        return {};
      }
    }

    /**
     * Persists the current user-selected card sizes in localStorage.
     * The write is wrapped defensively because privacy settings can block local
     * storage even on normal web pages.
     * @returns {void}
     */
    function saveStoredCardSizes(){
      try {
        if (!window.localStorage) { return; }
        window.localStorage.setItem(cardSizeStorageKey, JSON.stringify(storedCardSizes));
      } catch (error) {
        return;
      }
    }

    /**
     * Resolves the effective size for one dashboard card from user override or
     * built-in default.
     * @param {HTMLElement} card Dashboard card element.
     * @returns {string} Effective size token.
     */
    function effectiveCardSize(card){
      const cardKey = resizableCardKey(card);
      if (cardKey && isSupportedCardSize(storedCardSizes[cardKey])) {
        return storedCardSizes[cardKey];
      }
      return defaultCardSize(card);
    }

    /**
     * Updates the active state and localized labels of one card-size control.
     * The visible button labels stay compact, while titles and aria labels are
     * translated for clarity and accessibility.
     * @param {HTMLElement} card Dashboard card element.
     * @returns {void}
     */
    function updateCardSizeControlState(card){
      const t = options.getTranslations();
      if (!card) {
        return;
      }

      const control = card.querySelector('.card-size-control');
      if (!control) {
        return;
      }

      const activeSize = effectiveCardSize(card);
      control.setAttribute('aria-label', t.card_size_group || 'Card size');

      control.querySelectorAll('[data-card-size-option]').forEach(button => {
        const size = button.getAttribute('data-card-size-option');
        let label = size;
        let title = size;

        if (size === 'normal') {
          label = '1×';
          title = t.card_size_normal || 'Normal size';
        } else if (size === 'wide') {
          label = '2×';
          title = t.card_size_wide || 'Wide size';
        } else if (size === 'large') {
          label = '2×+';
          title = t.card_size_large || 'Large size';
        }

        button.textContent = label;
        button.setAttribute('title', title);
        button.setAttribute('aria-label', title);

        if (size === activeSize) {
          button.classList.add('active');
          button.setAttribute('aria-pressed', 'true');
        } else {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        }
      });
    }

    /**
     * Applies one resolved size token to the card element itself.
     * The CSS layer translates the token into responsive grid spans and, for
     * the large size, into a roomier minimum height.
     * @param {HTMLElement} card Dashboard card element.
     * @param {string} size Effective size token.
     * @returns {void}
     */
    function applyCardSizeToElement(card, size){
      if (!card) {
        return;
      }

      if (!isSupportedCardSize(size)) {
        size = defaultCardSize(card);
      }

      card.classList.add('card-size-enabled');
      card.setAttribute('data-card-size', size);
      updateCardSizeControlState(card);
    }

    /**
     * Applies the current persisted size map to every resizable dashboard card.
     * @returns {void}
     */
    function applyStoredCardSizes(){
      resizableDashboardCards().forEach(card => {
        applyCardSizeToElement(card, effectiveCardSize(card));
      });
      updateGlobalCardSizeControlState();
    }

    /**
     * Stores a new size for one dashboard card and updates the element.
     * @param {HTMLElement} card Dashboard card element.
     * @param {string} size Requested size token.
     * @returns {void}
     */
    function setDashboardCardSize(card, size){
      const cardKey = resizableCardKey(card);
      if (!card || !cardKey || !isSupportedCardSize(size)) {
        return;
      }

      const currentSize = effectiveCardSize(card);
      if (currentSize === size) {
        return;
      }

      storedCardSizes[cardKey] = size;
      saveStoredCardSizes();

      options.layout.renderWithViewportAnchor(() => {
        options.layout.runWithDeferredMasonryLayout(() => {
          applyCardSizeToElement(card, size);
          updateGlobalCardSizeControlState();
          options.rerender();
        });
      });
    }

    /**
     * Applies one size token to every resizable dashboard card at once.
     * The individual per-card storage map is updated so the shared choice
     * persists across reloads and later single-card adjustments.
     * @param {string} size Requested shared size token.
     * @returns {void}
     */
    function setAllDashboardCardSizes(size){
      if (!isSupportedCardSize(size)) {
        return;
      }

      const cards = resizableDashboardCards();
      if (!cards.length) {
        return;
      }

      const currentSharedSize = sharedDashboardCardSize();
      if (currentSharedSize === size) {
        return;
      }

      options.layout.renderWithViewportAnchor(() => {
        options.layout.runWithDeferredMasonryLayout(() => {
          cards.forEach(card => {
            const cardKey = resizableCardKey(card);
            if (!cardKey) {
              return;
            }
            storedCardSizes[cardKey] = size;
            applyCardSizeToElement(card, size);
          });

          saveStoredCardSizes();
          updateGlobalCardSizeControlState();
          options.rerender();
        });
      });
    }

    /**
     * Creates and wires the per-card size controls from the shared template.
     * Each content card receives the same compact three-step chooser so the UI
     * stays consistent across the dashboard.
     * @returns {void}
     */
    function initCardSizeControls(){
      wireGlobalSizeControls();
      storedCardSizes = loadStoredCardSizes();

      resizableDashboardCards().forEach(card => {
        if (!resizableCardKey(card)) {
          return;
        }
        if (card.querySelector('.card-size-control')) {
          return;
        }

        const fragment = options.cloneTemplate('cardSizeControlTemplate');
        if (!fragment) {
          return;
        }

        const control = fragment.querySelector('.card-size-control');
        control.addEventListener('click', event => {
          event.stopPropagation();
        });

        card.addEventListener('pointerdown', event => {
          if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) {
            return;
          }

          if (event.target.closest('button, a, input, select, textarea, summary, .card-help-popup')) {
            return;
          }

          const isAlreadyOpen = card.classList.contains('is-card-tools-open');
          document.querySelectorAll('.display-container.is-card-tools-open').forEach(openCard => {
            if (openCard !== card) {
              openCard.classList.remove('is-card-tools-open');
            }
          });

          if (isAlreadyOpen) {
            card.classList.remove('is-card-tools-open');
          } else {
            card.classList.add('is-card-tools-open');
          }
        });

        control.querySelectorAll('[data-card-size-option]').forEach(button => {
          button.addEventListener('pointerdown', event => {
            event.preventDefault();
          });
          button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            button.blur();
            const requestedSize = button.getAttribute('data-card-size-option');
            setDashboardCardSize(card, requestedSize);
            if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
              card.classList.remove('is-card-tools-open');
            }
          });
        });

        card.appendChild(fragment);
      });

      if (!outsideWired) {
        document.addEventListener('pointerdown', event => {
          if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) {
            return;
          }

          if (event.target.closest('.card-size-control')) {
            return;
          }

          if (event.target.closest('.display-container[data-help-key]')) {
            return;
          }

          document.querySelectorAll('.display-container.is-card-tools-open').forEach(card => {
            card.classList.remove('is-card-tools-open');
          });
        });
        outsideWired = true;
      }

      applyStoredCardSizes();
    }

    /** Wires the global size selector once. No parameters. @returns {void} */
    function wireGlobalSizeControls(){
      if (globalWired) { return; }
      globalWired = true;
      const globalSizeControl = document.getElementById('globalCardSizeControl');
      if (globalSizeControl) {
        globalSizeControl.querySelectorAll('[data-global-card-size]').forEach(button => {
          button.addEventListener('pointerdown', event => {
            event.stopPropagation();
          });
          button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            button.blur();
            const requestedSize = button.getAttribute('data-global-card-size');
            setAllDashboardCardSizes(requestedSize);
          });
        });
      }

    }

    return { sharedDashboardCardSize, updateGlobalCardSizeControlState, resizableCardKey, resizableDashboardCards, isSupportedCardSize, defaultCardSize, loadStoredCardSizes, saveStoredCardSizes, effectiveCardSize, updateCardSizeControlState, applyCardSizeToElement, applyStoredCardSizes, setDashboardCardSize, setAllDashboardCardSizes, initCardSizeControls };
  }
  return {create};
})();
