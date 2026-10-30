window.PLANETENUHR_DASHBOARD_REFRESH = (() => {
  'use strict';

  /** Creates the ordered registry for global date/location/periodic updates.
   * @param {object} options Context owner and entries with key, changes and render callback.
   * @returns {object} Refresh method; starts no timers or observers.
   */
  function create(options){
    /** Renders registered consumers against one captured selection.
     * @param {string} [reason='date'] Global trigger: date, location or refresh.
     * @returns {void}
     */
    function refresh(reason = 'date'){
      const selection = options.context.snapshot();
      options.context.withSnapshot(selection, () => {
        for (const entry of options.entries) {
          if (entry.changes.includes(reason)) {
            entry.render(selection);
          }
        }
      });
    }
    return {refresh};
  }
  return {create};
})();
