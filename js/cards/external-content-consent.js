window.PLANETENUHR_EXTERNAL_CONTENT_CONSENT = (() => {
  'use strict';

  /** Coordinates the consent controls and loading of the optional live cards.
   * @param {object} options DOM, templates, translations, preference store, layout and providers.
   * @returns {object} Methods to initialize consent and refresh approved providers.
   */
  function create(options){
    const controls = new Map();
    let channel;

    /** Wires one card's inline notice and header settings button.
     * @param {string} key Card and preference key. @param {object} provider Notice and load operations.
     * @returns {{restore: Function, refresh: Function}} Operations for one consent control.
     */
    function bindCard(key, provider){
      const card = options.document.querySelector('[data-help-key="' + key + '"]');
      const button = card.querySelector('.card-external-settings');
      const content = card.querySelector('.external-content-live');
      const fragment = options.cloneTemplate('externalContentConsentTemplate');
      const panel = fragment.firstElementChild;
      const checkbox = panel.querySelector('input');
      const notice = panel.querySelector('.external-content-notice');
      const choiceNote = panel.querySelector('.external-content-choice-note');
      const privacy = panel.querySelector('a');
      const feedback = panel.querySelector('[role="status"]');
      const t = options.getTranslations();
      let active;
      let pending;
      let saving = false;
      let readId = 0;

      panel.id = 'external-consent-' + key;
      notice.id = panel.id + '-notice';
      notice.textContent = t['external_notice_' + key];
      choiceNote.id = panel.id + '-choice';
      choiceNote.textContent = t.external_consent_note;
      privacy.href = provider.privacyUrl;
      privacy.textContent = t['external_privacy_' + key];
      checkbox.setAttribute('aria-describedby', notice.id + ' ' + choiceNote.id);
      panel.querySelector('.external-content-label').textContent = t['external_allow_' + key];
      content.before(fragment);
      button.setAttribute('aria-controls', panel.id);
      button.setAttribute('aria-label', t['external_settings_' + key]);
      button.title = t['external_settings_' + key];
      button.hidden = false;
      card.classList.add('has-external-settings');

      /** Shows or hides the consent panel without changing the user's choice.
       * @param {boolean} open Whether to show the checkbox. @returns {void}
       */
      function setOpen(open){
        panel.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        options.requestLayout();
      }

      /** Refreshes approved content while sharing a load already in progress.
       * No parameters. @returns {void}
       */
      function refresh(){
        if (!active || pending) return;
        const request = active;
        pending = provider.load(request.signal).finally(() => {
          if (active === request) pending = null;
        });
      }

      /** Applies a restored or changed choice and stops any revoked load.
       * @param {boolean} allowed Whether this card may make external requests. @returns {void}
       */
      function apply(allowed){
        checkbox.checked = allowed;
        content.hidden = !allowed;
        if (allowed) {
          if (!active) {
            active = new options.window.AbortController();
            if (panel.contains(options.document.activeElement)) button.focus({preventScroll:true});
            setOpen(false);
            refresh();
          }
        } else if (active) {
          active.abort();
          active = null;
          pending = null;
          provider.clear();
          setOpen(true);
        }
      }

      /** Restores the stored choice on startup or after another tab saves it.
       * No parameters. @returns {Promise<void>}
       */
      async function restore(){
        if (saving) return;
        const currentRead = ++readId;
        try {
          const allowed = await options.preferences.read(key, provider.version);
          if (currentRead === readId) {
            feedback.textContent = '';
            apply(allowed);
          }
        } catch {
          if (currentRead === readId) {
            apply(false);
            feedback.textContent = t.external_consent_read_error;
          }
        } finally {
          if (currentRead === readId) checkbox.disabled = false;
        }
      }

      /** Persists the checkbox choice, stopping live content immediately on revocation.
       * No parameters. @returns {Promise<void>}
       */
      async function save(){
        const allowed = checkbox.checked;
        const returnFocus = panel.contains(options.document.activeElement);
        readId++;
        saving = true;
        let committed = false;
        checkbox.disabled = true;
        feedback.textContent = '';
        if (!allowed) apply(false);
        try {
          await options.preferences.write(key, provider.version, allowed);
          committed = true;
          apply(allowed);
          if (allowed && returnFocus) button.focus({preventScroll:true});
          if (channel) channel.postMessage(key);
        } catch {
          apply(false);
          feedback.textContent = t.external_consent_write_error;
        } finally {
          saving = false;
          checkbox.disabled = false;
        }
        if (committed && channel) restore();
      }

      /** Toggles card settings and focuses the checkbox when opened by the user.
       * No parameters. @returns {void}
       */
      function toggleSettings(){
        const open = panel.hidden;
        setOpen(open);
        if (open) checkbox.focus();
      }

      checkbox.addEventListener('change', save);
      button.addEventListener('click', toggleSettings);
      setOpen(true);
      return {restore,refresh};
    }

    /** Initializes the consent controls, restores each choice and listens for changes from other tabs.
     * No parameters. @returns {void}
     */
    function init(){
      if (controls.size) return;
      if (typeof options.window.BroadcastChannel === 'function') {
        try {
          channel = new options.window.BroadcastChannel('planetenuhr-external-content');
          channel.onmessage = event => controls.get(event.data)?.restore();
        } catch {
          // The choices still persist if the browser prevents tab synchronization.
        }
      }
      for (const [key, provider] of Object.entries(options.providers)) {
        const control = bindCard(key, provider);
        controls.set(key, control);
        control.restore();
      }
    }

    /** Refreshes only cards with an active grant.
     * No parameters. @returns {void}
     */
    function refresh(){
      controls.forEach(control => control.refresh());
    }

    return {init,refresh};
  }

  return {create};
})();
