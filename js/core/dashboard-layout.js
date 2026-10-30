window.PLANETENUHR_LAYOUT = (() => {
  'use strict';
  /** Creates one owner for grid measurement, observation and viewport restoration.
   * @param {object} options Window, document, viewport-control callback and refresh callback.
   * @returns {object} Explicit layout methods; initialization is idempotent.
   */
  function create(options){
    const window = options.window;
    const document = options.document;
    const getComputedStyle = window.getComputedStyle.bind(window);
    const requestAnimationFrame = window.requestAnimationFrame.bind(window);
    const HTMLElement = window.HTMLElement;
    const ResizeObserver = window.ResizeObserver;
    let initialized = false;

    let masonryFrame = 0;
    let masonryObserver = null;
    let masonryObserverActive = false;
    let masonryObservedSizes = new WeakMap();
    let masonryAfterLayoutCallbacks = [];
    let persistentViewportAnchor = null;
    let persistentScrollPosition = null;
    let suppressMasonryObserver = false;
    let deferMasonryLayout = false;
    let deferredMasonryLayoutRequested = false;

    /** Returns the visible dashboard cards in DOM order.
     * No parameters.
     * @returns {HTMLElement[]} Visible cards.
     */
    function visibleGridCards(){
      const grid = document.querySelector('.grid');
      if (!grid) return [];
      return Array.from(grid.querySelectorAll('.display-container'))
        .filter(card => getComputedStyle(card).display !== 'none');
    }

    /**
     * Returns a conservative card height for masonry row-span calculation.
     * Some browsers, especially on tablets, can report a temporarily smaller
     * `getBoundingClientRect().height` while SVG labels, web fonts or late
     * layout passes are still settling. The masonry layout uses the largest
     * available box metric so cards never receive a span that is too short.
     * @param {HTMLElement} card Dashboard card whose height should be measured.
     * @returns {number} Stable pixel height for masonry span calculation.
     */
    function masonryCardHeight(card){
      if (!card) {
        return 0;
      }

      const rectHeight = card.getBoundingClientRect().height;
      const scrollHeight = card.scrollHeight;
      const offsetHeight = card.offsetHeight;
      let height = rectHeight;

      if (scrollHeight > height) {
        height = scrollHeight;
      }
      if (offsetHeight > height) {
        height = offsetHeight;
      }

      return height;
    }

    /**
     * Queues a small series of deferred masonry recalculations.
     * Tablet browsers can finish SVG text placement, font fallback swaps and
     * intrinsic media sizing a little after the initial render pass. The extra
     * checks keep grid spans in sync without requiring a manual refresh.
     * @returns {void}
     */
    function scheduleDeferredMasonryPasses(){
      scheduleMasonryLayout();

      requestAnimationFrame(() => {
        scheduleMasonryLayout();
      });

      window.setTimeout(() => {
        scheduleMasonryLayout();
      }, 120);

      window.setTimeout(() => {
        scheduleMasonryLayout();
      }, 320);
    }

    /**
     * Requests one masonry relayout for the dashboard.
     * During batched redraws the request is only remembered so repeated card
     * renders do not keep restarting the full grid calculation.
     * @param {Function} [afterLayout] Optional callback that should run after the next layout pass.
     * @returns {void}
     */
    function requestMasonryLayout(afterLayout){
      if (deferMasonryLayout) {
        deferredMasonryLayoutRequested = true;
        if (typeof afterLayout === 'function') {
          masonryAfterLayoutCallbacks.push(afterLayout);
        }
        return;
      }

      scheduleMasonryLayout(afterLayout);
    }

    /**
     * Runs several render steps while collapsing repeated masonry requests into
     * a single final relayout.
     * This keeps date-driven card updates from rebuilding the visible grid over
     * and over again while individual cards are still refreshing.
     * @param {Function} callback Render work to execute inside the batch.
     * @param {Function} [afterLayout] Optional callback for the final layout pass.
     * @returns {void}
     */
    function runWithDeferredMasonryLayout(callback, afterLayout){
      const previousDeferredState = deferMasonryLayout;
      const previousPendingState = deferredMasonryLayoutRequested;

      deferMasonryLayout = true;
      deferredMasonryLayoutRequested = false;

      callback();

      const shouldLayout = deferredMasonryLayoutRequested;

      deferMasonryLayout = previousDeferredState;
      deferredMasonryLayoutRequested = previousPendingState;

      if (previousDeferredState) {
        if (shouldLayout) {
          deferredMasonryLayoutRequested = true;
          if (typeof afterLayout === 'function') {
            masonryAfterLayoutCallbacks.push(afterLayout);
          }
        }
        return;
      }

      if (shouldLayout) {
        requestMasonryLayout(afterLayout);
        return;
      }

      if (typeof afterLayout === 'function') {
        afterLayout();
      }
    }

    /**
     * Recalculates grid spans without collapsing the page during measurement.
     * Existing spans remain in place until all intrinsic card heights are known.
     * @returns {void}
     */
    function updateMasonryLayout(){
      masonryFrame = 0;
      const grid = document.querySelector('.grid');
      if (!grid) return;
      const cards = visibleGridCards();
      const finishMasonryLayout = () => {
        if (persistentViewportAnchor && persistentViewportAnchor.anchor) {
          restoreViewportAnchor(persistentViewportAnchor.anchor);
          persistentViewportAnchor.remaining -= 1;
          if (persistentViewportAnchor.remaining <= 0) {
            persistentViewportAnchor = null;
          }
        }
        if (persistentScrollPosition && persistentScrollPosition.position) {
          restorePageScrollPosition(persistentScrollPosition.position);
          persistentScrollPosition.remaining -= 1;
          if (persistentScrollPosition.remaining <= 0) {
            persistentScrollPosition = null;
          }
        }
        const callbacks = masonryAfterLayoutCallbacks.splice(0, masonryAfterLayoutCallbacks.length);
        callbacks.forEach(callback => {
          try { callback(); } catch (error) {}
        });
      };
      if (window.innerWidth <= 760) {
        cards.forEach(card => {
          card.style.gridRowEnd = '';
        });
        finishMasonryLayout();
        return;
      }

      const style = getComputedStyle(grid);
      const rowHeight = parseFloat(style.gridAutoRows) || 8;
      const rowGap = parseFloat(style.rowGap) || 20;
      // With align-items:start, cards retain their intrinsic height inside their
      // current spans. Clearing all spans before measuring collapses the page
      // temporarily and lets the browser clamp a scrolled viewport to the top.
      const spans = cards.map(card => {
        const height = masonryCardHeight(card);
        return Math.max(1, Math.ceil((height + rowGap + 2) / (rowHeight + rowGap)));
      });
      cards.forEach((card, index) => {
        const rowEnd = 'span ' + spans[index];
        if (card.style.gridRowEnd !== rowEnd) {
          card.style.gridRowEnd = rowEnd;
        }
      });
      finishMasonryLayout();
    }

    /** Queues one layout pass and an optional completion callback.
     * @param {Function} [afterLayout] Completion callback.
     * @returns {void}
     */
    function scheduleMasonryLayout(afterLayout){
      if (typeof afterLayout === 'function') {
        masonryAfterLayoutCallbacks.push(afterLayout);
      }
      if (masonryFrame) return;
      masonryFrame = requestAnimationFrame(updateMasonryLayout);
    }

    /**
     * Temporarily mutes ResizeObserver-driven masonry recalculations during a
     * larger batch refresh. This avoids repeated anchor corrections while many
     * cards rebuild one after another.
     * @param {Function} callback Refresh work to execute while observer relayouts are muted.
     * @returns {void}
     */
    function withSuppressedMasonryObserver(callback){
      suppressMasonryObserver = true;
      try {
        callback();
      } finally {
        suppressMasonryObserver = false;
      }
    }

    /**
     * Updates the masonry row span for one specific dashboard card only.
     * This is used for local card interactions where a full-grid relayout would
     * be excessive and can disturb the user's viewport position.
     * @param {HTMLElement|null} card Card element whose span should be refreshed.
     * @returns {void}
     */
    function updateSingleCardMasonryLayout(card){
      if (!card) {
        return;
      }
      if (window.innerWidth <= 760) {
        card.style.gridRowEnd = '';
        return;
      }
      const grid = document.querySelector('.grid');
      if (!grid) {
        return;
      }
      const style = getComputedStyle(grid);
      const rowHeight = parseFloat(style.gridAutoRows) || 8;
      const rowGap = parseFloat(style.rowGap) || 20;
      const height = masonryCardHeight(card);
      const span = Math.max(1, Math.ceil((height + rowGap + 2) / (rowHeight + rowGap)));
      const rowEnd = 'span ' + span;
      if (card.style.gridRowEnd !== rowEnd) {
        card.style.gridRowEnd = rowEnd;
      }
    }

    /** Captures the first card below the overlay and its viewport offset.
     * No parameters.
     * @returns {object|null} Card and its top offset.
     */
    function captureViewportAnchor(){
      const overlayBottom = document.querySelector('.overlay-controls')?.getBoundingClientRect().bottom || 0;
      const threshold = overlayBottom + 16;
      const anchor = visibleGridCards().find(card => {
        const rect = card.getBoundingClientRect();
        return rect.bottom > threshold;
      });
      if (!anchor) return null;
      return { element:anchor, top:anchor.getBoundingClientRect().top };
    }

    /**
     * Resolves the scroll container that currently carries page movement.
     * Embedded browsers can report this more reliably on `document.scrollingElement`
     * than through the `window` scroll properties alone.
     * @returns {HTMLElement} Active page scroll container.
     */
    function pageScrollElement(){
      if (document.scrollingElement instanceof HTMLElement) {
        return document.scrollingElement;
      }
      if (document.documentElement instanceof HTMLElement) {
        return document.documentElement;
      }
      return document.body;
    }

    /**
     * Captures the current page scroll position from the active scroll container.
     * @returns {{left:number, top:number}} Current page scroll coordinates.
     */
    function capturePageScrollPosition(){
      const element = pageScrollElement();
      return {
        left: element.scrollLeft,
        top: element.scrollTop
      };
    }

    /**
     * Restores a previously captured page scroll position.
     * @param {{left:number, top:number}|null} position Scroll coordinates to restore.
     * @returns {void}
     */
    function restorePageScrollPosition(position){
      if (!position) {
        return;
      }
      const element = pageScrollElement();
      element.scrollLeft = position.left;
      element.scrollTop = position.top;
      window.scrollTo(position.left, position.top);
    }

    /** Restores a connected card to its captured viewport offset.
     * @param {object} anchor Previously captured card anchor.
     * @returns {void}
     */
    function restoreViewportAnchor(anchor){
      if (!anchor || !anchor.element || !anchor.element.isConnected) return;
      const delta = anchor.element.getBoundingClientRect().top - anchor.top;
      if (Math.abs(delta) > 0.5) {
        const element = pageScrollElement();
        element.scrollTop += delta;
        // Use the window fallback only for the movement still missing after the
        // scroll-container write; applying delta twice overshoots on normal pages.
        const remainingDelta = anchor.element.getBoundingClientRect().top - anchor.top;
        if (Math.abs(remainingDelta) > 0.5) {
          window.scrollBy(0, remainingDelta);
        }
      }
    }

    /**
     * Re-renders a section while preserving the visible grid anchor.
     * This is used for lightweight UI updates such as calendar filters so the
     * page does not jump back to the top during the following masonry relayout.
     * @param {Function} callback Render callback to execute.
     * @returns {void}
     */
    function renderWithViewportAnchor(callback){
      const anchor = captureViewportAnchor();
      callback();
      if (anchor) {
        scheduleMasonryLayout(() => {
          restoreViewportAnchor(anchor);
        });
      }
    }

    /** Refreshes registered date consumers while retaining scroll restoration state.
     * @param {string} [reason='date'] Global update reason.
     * @returns {void}
     */
    function refreshDateDrivenTilesWithAnchor(reason = 'date'){
      const anchor = captureViewportAnchor();
      const scrollPosition = capturePageScrollPosition();
      if (anchor) {
        persistentViewportAnchor = {
          anchor: anchor,
          remaining: 4
        };
        persistentScrollPosition = null;
      } else {
        persistentViewportAnchor = null;
        persistentScrollPosition = {
          position: scrollPosition,
          remaining: 4
        };
      }
      withSuppressedMasonryObserver(() => {
        runWithDeferredMasonryLayout(() => {
          options.refresh(reason);
        }, () => {
          if (anchor) {
            restoreViewportAnchor(anchor);
          } else {
            restorePageScrollPosition(scrollPosition);
          }
        });
      });
    }

    /** Releases a date update's saved scroll position when a detail-view interaction starts.
     * No parameters. @returns {void}
     */
    function releasePendingViewportRestoration(){
      persistentViewportAnchor = null;
      persistentScrollPosition = null;
    }

    /**
     * Observes card sizes only where row spans are used. Mobile uses normal CSS flow.
     * Disconnecting on mobile avoids unnecessary delivery cycles in iOS WebKit.
     * No parameters.
     * @returns {void}
     */
    function syncMasonryObservation(){
      if (!masonryObserver) {
        return;
      }
      if (window.innerWidth <= 760) {
        if (masonryObserverActive) {
          masonryObserver.disconnect();
          masonryObserverActive = false;
          masonryObservedSizes = new WeakMap();
        }
        return;
      }
      if (masonryObserverActive) {
        return;
      }
      visibleGridCards().forEach(card => masonryObserver.observe(card));
      masonryObserverActive = true;
    }

    /**
     * Queues one deferred layout for actual size changes, without DOM writes during delivery.
     * Repeated deliveries with unchanged dimensions do not create more layout passes.
     * @param {ResizeObserverEntry[]} entries Delivered content-box measurements.
     * @returns {void}
     */
    function handleMasonryResize(entries){
      if (!masonryObserverActive || suppressMasonryObserver || window.innerWidth <= 760) {
        return;
      }
      let changed = false;
      entries.forEach(entry => {
        const size = { width:entry.contentRect.width, height:entry.contentRect.height };
        const previous = masonryObservedSizes.get(entry.target);
        if (!previous || previous.width !== size.width || previous.height !== size.height) {
          masonryObservedSizes.set(entry.target, size);
          changed = true;
        }
      });
      if (changed) {
        scheduleMasonryLayout();
      }
    }

    /** Initializes desktop observation and deferred grid updates. No parameters. @returns {void} */
    function initMasonryLayout(){
      if (initialized) {
        return;
      }
      initialized = true;
      if ('ResizeObserver' in window) {
        masonryObserver = new ResizeObserver(handleMasonryResize);
        syncMasonryObservation();
      }
      window.addEventListener('resize', () => {
        syncMasonryObservation();
        options.syncDateMobilePanel();
        scheduleDeferredMasonryPasses();
      });
      window.addEventListener('load', () => {
        scheduleDeferredMasonryPasses();
      });
      if (document.fonts && typeof document.fonts.ready === 'object' && typeof document.fonts.ready.then === 'function') {
        document.fonts.ready.then(() => {
          scheduleDeferredMasonryPasses();
        });
      }
      visibleGridCards().forEach(card => {
        card.querySelectorAll('img').forEach(image => {
          image.addEventListener('load', () => {
            updateSingleCardMasonryLayout(card);
          });
        });
      });
      scheduleMasonryLayout();
    }

    return { visibleGridCards, masonryCardHeight, scheduleDeferredMasonryPasses, requestMasonryLayout, runWithDeferredMasonryLayout, updateMasonryLayout, scheduleMasonryLayout, withSuppressedMasonryObserver, updateSingleCardMasonryLayout, captureViewportAnchor, pageScrollElement, capturePageScrollPosition, restorePageScrollPosition, restoreViewportAnchor, renderWithViewportAnchor, refreshDateDrivenTilesWithAnchor, releasePendingViewportRestoration, syncMasonryObservation, handleMasonryResize, initMasonryLayout };
  }
  return {create};
})();
