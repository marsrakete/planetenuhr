window.PLANETENUHR_FICTIONAL_MISSION_CARD = (() => {
  'use strict';

  /** Retrieves a template from the dashboard's own web server.
   * @param {string} url Versioned relative asset URL. @returns {Promise<string>} Template text.
   */
  async function loadTemplate(url){
    const response = await fetch(url,{mode:'same-origin'});
    if (!response.ok) throw new Error('Unable to load ' + url + ' (' + response.status + ')');
    return response.text();
  }

  /** Mounts the independent fictional mission card using existing mission playback and controls.
   * @param {object} options Mount point, locale, mission model, graphics and layout adapters.
   * @returns {Promise<HTMLElement|null>} Mounted card, or null if its mount point is absent.
   */
  async function mount({slot, missions, copy, language, model, graphics, createPlayback, fitLabels, translations, updateLayout}){
    if (!slot) return null;
    const [templateText,sceneText] = await Promise.all([
      loadTemplate(slot.dataset.templateUrl),
      loadTemplate(slot.dataset.sceneUrl)
    ]);
    const document = slot.ownerDocument;
    const markup = document.createElement('template');
    markup.innerHTML = templateText;
    const cardTemplate = markup.content.querySelector('#fictionalMissionCardTemplate');
    const source = new DOMParser().parseFromString(sceneText,'image/svg+xml').documentElement;
    if (!cardTemplate?.content.firstElementChild || source.localName !== 'svg'
      || source.namespaceURI !== 'http://www.w3.org/2000/svg') throw new Error('Invalid fictional mission template');
    const card = document.importNode(cardTemplate.content.firstElementChild,true);
    const svg = document.importNode(source,true);
    slot.replaceWith(card);
    const tabList = card.querySelector('[data-fictional-tabs]');
    const panel = card.querySelector('[data-fictional-panel]');
    const figure = panel.querySelector('figure');
    const tabTemplate = document.getElementById('idefixControlTemplate');
    const eventTemplate = document.getElementById('spaceMissionEventTemplate');
    const stage = graphics.create(panel.querySelector('[data-fictional-stage]'),svg,copy,fitLabels);
    const play = panel.querySelector('.mission-play');
    const slider = panel.querySelector('.mission-time');
    const readout = panel.querySelector('[data-fictional-date]');
    const caption = panel.querySelector('[data-fictional-caption]');
    const timeline = panel.querySelector('[data-fictional-timeline]');
    const clocks = panel.querySelector('[data-fictional-clocks]');
    const landerClock = panel.querySelector('[data-fictional-lander-clock]');
    const enduranceClock = panel.querySelector('[data-fictional-endurance-clock]');
    const formatter = new Intl.DateTimeFormat(language,{
      day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'UTC'
    });
    const entries = [];
    let active;
    let position = 0;
    let currentStep = -1;
    let milestoneButtons = [];

    for (const node of card.querySelectorAll('[data-fictional-copy]')) {
      node.textContent = copy[node.dataset.fictionalCopy];
    }
    timeline.setAttribute('aria-label',copy.timeline);

    /** Writes a minute-precision UTC timestamp into a time element.
     * @param {HTMLTimeElement} target Date display. @param {number} timestamp UTC milliseconds.
     * @returns {string} Localized date and time.
     */
    function writeTime(target, timestamp){
      const rounded = Math.floor(timestamp / 60000) * 60000;
      const iso = new Date(rounded).toISOString();
      if (target.dateTime !== iso) {
        target.dateTime = iso;
        const date = formatter.format(rounded);
        if (target.firstChild) {
          target.firstChild.data = date;
        } else {
          target.appendChild(document.createTextNode(date));
        }
      }
      return target.textContent;
    }

    /** Updates the SVG, calendar readout and active timeline marker at the slider position.
     * @param {number} nextPosition Position in milestone units. @returns {void}
     */
    function render(nextPosition){
      position = nextPosition;
      active.position = position;
      slider.value = String(position);
      const frame = model.frameAt(active.mission,position);
      const date = writeTime(readout,frame.timestamp);
      if (slider.getAttribute('aria-valuetext') !== date) slider.setAttribute('aria-valuetext',date);
      clocks.hidden = frame.enduranceTime === null;
      if (!clocks.hidden) {
        writeTime(landerClock,frame.timestamp);
        writeTime(enduranceClock,frame.enduranceTime);
      }
      stage.render(frame);
      if (currentStep !== frame.index) {
        if (currentStep >= 0) milestoneButtons[currentStep].removeAttribute('aria-current');
        milestoneButtons[frame.index].setAttribute('aria-current','step');
        caption.textContent = copy.events[frame.event.key];
        currentStep = frame.index;
      }
    }

    /** Returns the current fractional milestone index. No parameters. @returns {number} Slider position. */
    function getValue(){ return position; }
    /** Returns the last milestone index. No parameters. @returns {number} Upper playback limit. */
    function getMax(){ return active.mission.events.length - 1; }
    /** Gives each scene interval time to play. No parameters. @returns {number} Playback duration in milliseconds. */
    function getDuration(){ return getMax() * 4600; }
    /** Updates the play/pause control. @param {boolean} playing Whether animation is running. @returns {void} */
    function showPlaybackState(playing){
      if (playing) {
        play.textContent = translations.space_pause;
      } else {
        play.textContent = translations.space_play;
      }
    }
    const playback = createPlayback({getValue,getMax,getDuration,onFrame:render,onState:showPlaybackState});

    /** Brings a selected scene out from under the sticky dashboard controls.
     * No parameters. @returns {void}
     */
    function revealScene(){
      const viewport = document.defaultView;
      const overlay = document.querySelector('.overlay-controls');
      const top = (overlay?.getBoundingClientRect().bottom || 0) + 12;
      const bounds = figure.getBoundingClientRect();
      if (bounds.top < top || bounds.bottom > viewport.innerHeight) {
        const visibleTop = Math.max(top,(viewport.innerHeight - bounds.height) / 2);
        viewport.scrollBy({top:bounds.top - visibleTop,behavior:'auto'});
      }
    }

    /** Builds the clickable timeline for the selected tab.
     * @param {object[]} events Prepared milestones. @returns {void}
     */
    function showTimeline(events){
      const fragment = document.createDocumentFragment();
      milestoneButtons = [];
      events.forEach((event,index) => {
        const row = eventTemplate.content.firstElementChild.cloneNode(true);
        writeTime(row.querySelector('time'),event.timestamp);
        row.querySelector('small').remove();
        const button = tabTemplate.content.firstElementChild.cloneNode(true);
        button.classList.add('mission-event-jump');
        button.textContent = copy.events[event.key];
        button.addEventListener('click',click => {
          playback.pause();
          render(index);
          if (click.detail > 0) revealScene();
        });
        row.querySelector('span').appendChild(button);
        milestoneButtons.push(button);
        fragment.appendChild(row);
      });
      timeline.replaceChildren(fragment);
    }

    /** Displays the chosen mission and restores its slider when returning to its tab.
     * @param {object} entry Tab and prepared timeline. @returns {void}
     */
    function select(entry){
      if (active === entry) return;
      const changingTab = Boolean(active);
      playback.pause();
      active = entry;
      currentStep = -1;
      for (const row of entries) {
        const selected = row === entry;
        row.tab.setAttribute('aria-selected',String(selected));
        if (selected) {
          row.tab.tabIndex = 0;
        } else {
          row.tab.tabIndex = -1;
        }
      }
      panel.setAttribute('aria-labelledby',entry.tab.id);
      slider.max = String(getMax());
      showTimeline(entry.mission.events);
      render(entry.position);
      if (changingTab) updateLayout(card);
    }

    for (const mission of missions) {
      const prepared = model.prepare(mission);
      if (!prepared) continue;
      const tab = tabTemplate.content.firstElementChild.cloneNode(true);
      tab.id = 'fictional-mission-tab-' + mission.id;
      tab.setAttribute('role','tab');
      tab.setAttribute('aria-controls',panel.id);
      tab.textContent = copy.missions[mission.id];
      const entry = {tab,mission:prepared,position:0};
      entries.push(entry);
      tabList.appendChild(tab);
      tab.addEventListener('click',() => select(entry));
    }

    /** Supports wrapping tab navigation from the standard horizontal arrow and boundary keys.
     * @param {KeyboardEvent} event Focused tab's keyboard event. @returns {void}
     */
    function navigateTabs(event){
      const index = entries.findIndex(entry => entry.tab === event.target);
      if (index < 0) return;
      let next;
      switch (event.key) {
        case 'ArrowRight': next = (index + 1) % entries.length; break;
        case 'ArrowLeft': next = (index + entries.length - 1) % entries.length; break;
        case 'Home': next = 0; break;
        case 'End': next = entries.length - 1; break;
        default: return;
      }
      event.preventDefault();
      select(entries[next]);
      entries[next].tab.focus();
    }

    if (!entries.length) return card;
    tabList.addEventListener('keydown',navigateTabs);
    slider.addEventListener('input',() => {
      playback.pause();
      render(Number(slider.value));
    });
    play.addEventListener('click',playback.toggle);
    document.addEventListener('visibilitychange',() => {
      if (document.hidden) playback.pause();
    });
    showPlaybackState(false);
    select(entries[0]);
    return card;
  }

  return {mount};
})();
