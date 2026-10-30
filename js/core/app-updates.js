/* Small version comparison and explicit reload; no worker or persistent storage. */
window.PLANETENUHR_APP_UPDATES = (() => {
  const AUTO_CHECK_INTERVAL = 3 * 60 * 1000;
  let controller;

  /** Validates a release identifier before using it in UI or navigation.
   * @param {unknown} value Version read from metadata.
   * @returns {string} Valid trimmed version, or an empty string.
   */
  function version(value){
    if (typeof value !== 'string' || value.length > 64) return '';
    const trimmed = value.trim();
    if (!/^\d+\.\d+(?:\.\d+)?(?:[-+][A-Za-z0-9.-]+)?$/.test(trimmed)) return '';
    return trimmed;
  }

  /** Builds a fresh document URL while preserving date, language, place, card and hash.
   * @param {string} href Current absolute URL.
   * @param {string} release Target version.
   * @param {number} now Cache-busting timestamp.
   * @returns {string} Document URL with temporary update parameters.
   */
  function updateUrl(href, release, now){
    const url = new URL(href);
    url.searchParams.set('_appUpdate', release);
    url.searchParams.set('_appReload', String(now));
    return url.href;
  }

  /** Creates isolated version-check state with network, clock and UI adapters.
   * @param {object} options Current version, fetch, clock, timers, view and navigation.
   * @returns {object} Check, apply and render operations.
   */
  function create(options){
    let checking = false;
    let applying = false;
    let available = '';
    let status = '';
    let statusError = false;
    let lastAutoCheck = null;

    /** Presents retained state without changing focus or navigating.
     * No parameters. @returns {void}
     */
    function render(){
      options.view({current:options.current, available, checking, applying, status, statusError});
    }

    /** Compares uncached server metadata; automatic failures remain quiet.
     * @param {object} [settings={}] Manual feedback and forced automatic-check flags.
     * @returns {Promise<void>} Completion of the guarded metadata request.
     */
    async function check(settings = {}){
      if (checking || applying) return;
      const now = options.now();
      if (!settings.manual && !settings.force && lastAutoCheck !== null && now - lastAutoCheck < AUTO_CHECK_INTERVAL) return;
      lastAutoCheck = now;
      checking = true;
      if (settings.manual) {
        status = 'update_checking';
        statusError = false;
      }
      render();
      const abort = new AbortController();
      const timeout = options.setTimeout(() => abort.abort(), 8000);
      try {
        const url = new URL('./version.json', options.href());
        url.searchParams.set('_check', String(now));
        const response = await options.fetch(url.href, {cache:'no-store', signal:abort.signal});
        if (!response.ok) throw new Error('Version metadata unavailable');
        const remote = version((await response.json()).version);
        if (!remote) throw new Error('Invalid version metadata');
        available = '';
        if (remote !== options.current) available = remote;
        if (settings.manual) {
          status = 'update_current';
          if (available) status = 'update_available';
          statusError = false;
        } else if (available) {
          status = '';
          statusError = false;
        } else if (statusError) {
          status = '';
          statusError = false;
        }
      } catch (error) {
        if (settings.manual) {
          status = 'update_failed';
          statusError = true;
        }
      } finally {
        options.clearTimeout(timeout);
        checking = false;
        render();
      }
    }

    /** Explicitly navigates once to a fresh document; the versioned HTML loads its assets.
     * No parameters. @returns {void}
     */
    function apply(){
      if (!available || applying) return;
      applying = true;
      render();
      options.navigate(updateUrl(options.href(), available, options.now()));
    }

    render();
    return { check, apply, render };
  }

  /** Mounts both update actions inside settings and binds document-lifetime events.
   * No parameters. @returns {void}
   */
  function initialize(){
    document.getElementById('appUpdateControlsHost').appendChild(document.getElementById('appUpdateControlsTemplate').content.cloneNode(true));
    const current = version(document.querySelector('meta[name="planetenuhr-version"]').content);
    const checkButton = document.getElementById('appUpdateCheck');
    const applyButton = document.getElementById('appUpdateApply');
    const feedback = document.getElementById('appUpdateStatus');
    const url = new URL(location.href);
    if (url.searchParams.has('_appUpdate') || url.searchParams.has('_appReload')) {
      url.searchParams.delete('_appUpdate');
      url.searchParams.delete('_appReload');
      history.replaceState(null, '', url.href);
    }

    /** Renders localized UI from state, keeping both buttons in the DOM.
     * @param {object} state Current check and release state.
     * @returns {void}
     */
    function view(state){
      const copy = window.PLANETENUHR_TRANSLATIONS[document.documentElement.lang] || window.PLANETENUHR_TRANSLATIONS.en;
      const release = state.available || state.current;
      document.getElementById('appVersionLabel').textContent = copy.update_version.replace('{version}', state.current);
      checkButton.textContent = copy.update_check;
      checkButton.disabled = state.applying;
      checkButton.setAttribute('aria-disabled', String(state.checking || state.applying));
      checkButton.setAttribute('aria-busy', String(state.checking));
      applyButton.textContent = copy.update_apply;
      if (state.applying) applyButton.textContent = copy.update_applying;
      applyButton.disabled = state.applying;
      applyButton.hidden = !state.available;
      feedback.hidden = !state.status && !state.available;
      feedback.textContent = '';
      if (state.status) feedback.textContent = copy[state.status].replace('{version}', release);
      else if (state.available) feedback.textContent = copy.update_available.replace('{version}', release);
      feedback.dataset.error = String(state.statusError);
    }

    controller = create({current, view, fetch:(url, settings) => fetch(url, settings), now:() => Date.now(),
      href:() => location.href, navigate:url => location.replace(url),
      setTimeout:(callback, delay) => setTimeout(callback, delay), clearTimeout:id => clearTimeout(id)});
    checkButton.addEventListener('click', () => controller.check({manual:true}));
    applyButton.addEventListener('click', controller.apply);
    window.addEventListener('focus', () => controller.check());
    window.addEventListener('pageshow', () => controller.check());
    window.addEventListener('online', () => controller.check({force:true}));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') controller.check();
    });
    void controller.check();
  }

  /** Refreshes localized controls after the dashboard changes its language.
   * No parameters. @returns {void}
   */
  function render(){
    if (controller) controller.render();
  }

  document.addEventListener('DOMContentLoaded', initialize, {once:true});
  return { create, version, updateUrl, render };
})();
