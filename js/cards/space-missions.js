window.PLANETENUHR_SPACE_MISSIONS = (() => {
  'use strict';

  /** Formats a mission date using the precision supplied by the source.
   * @param {string} language Display locale.
   * @param {string} start ISO year, month or day.
   * @param {string} [end] Inclusive end date for a day range.
   * @returns {string} Localized date or range.
   */
  function formatDate(language, start, end) {
    const options = {year: 'numeric', timeZone: 'UTC'};
    if (start.length >= 7) {
      options.month = 'short';
    }
    if (start.length === 10) {
      options.day = 'numeric';
    }
    const formatter = new Intl.DateTimeFormat(language, options);
    const first = new Date(start);
    if (end) {
      return formatter.formatRange(first, new Date(end));
    }
    return formatter.format(first);
  }

  /** Adds mission tabs and timelines around the existing IDEFIX controller.
   * @param {{render:Function}} idefix Existing trajectory controller.
   * @param {object} dependencies Card element, mission data, locale and layout adapters.
   * @returns {{render:Function}} Controller for dashboard date and language updates.
   */
  function create(idefix, {card, missions, createAnimation, trajectories, positionAt,
    getHeliocentricPosition, getLanguage, getTranslations, updateCardLayout}) {
    const document = card.ownerDocument;
    const tabs = card.querySelector('#spaceMissionTabs');
    const idefixPanel = card.querySelector('#spaceMissionIdefix');
    const tabTemplate = document.getElementById('idefixControlTemplate');
    const panelTemplate = document.getElementById('spaceMissionPanelTemplate');
    const eventTemplate = document.getElementById('spaceMissionEventTemplate');
    const linkTemplate = document.getElementById('idefixLinkTemplate');
    const localizedNodes = [];
    let language;

    function addLink(panel, key, href) {
      const link = linkTemplate.content.firstElementChild.cloneNode(true);
      link.href = href;
      panel.querySelector('.idefix-links').append(link);
      localizedNodes.push({node: link, key});
    }

    function createPanel(mission) {
      const panel = panelTemplate.content.firstElementChild.cloneNode(true);
      panel.id = 'space-mission-' + mission.id;
      panel.querySelector('h3').textContent = mission.name + ' · ' + mission.agency;
      localizedNodes.push({node: panel.querySelector('p'), key: mission.id});
      card.append(panel);
      const animation = createAnimation(panel.querySelector('.mission-animation'), mission, {
        trajectories, positionAt, getHeliocentricPosition, getLanguage, getTranslations
      });
      for (const [start, key, confirmed, end] of mission.events) {
        const event = eventTemplate.content.firstElementChild.cloneNode(true);
        const time = event.querySelector('time');
        time.dateTime = start;
        localizedNodes.push({node: time, start, end});
        const title = event.querySelector('span');
        if (animation.canSeek(start)) {
          const button = tabTemplate.content.firstElementChild.cloneNode(true);
          button.classList.add('mission-event-jump');
          button.addEventListener('click', () => animation.seek(start));
          title.append(button);
          localizedNodes.push({node: button, key});
        } else {
          localizedNodes.push({node: title, key});
        }
        localizedNodes.push({node: event.querySelector('small'), key: confirmed ? 'confirmed' : 'planned'});
        panel.querySelector('ol').append(event);
      }
      if (mission.notes) {
        const noteTemplate = document.getElementById('spaceMissionNoteTemplate');
        for (const keys of mission.notes) {
          const row = noteTemplate.content.firstElementChild.cloneNode(true);
          [...row.children].forEach((node, index) => localizedNodes.push({node, key: keys[index]}));
          panel.querySelector('ol').append(row);
        }
      }
      addLink(panel, 'source', mission.source);
      if (mission.tracker) {
        addLink(panel, 'tracker', mission.tracker);
      }
      for (const [key, url] of mission.references || []) {
        addLink(panel, key, url);
      }
      return {panel, animation};
    }

    function addTab(name, panel, animation) {
      const tab = tabTemplate.content.firstElementChild.cloneNode(true);
      tab.textContent = name;
      tab.id = panel.id + '-tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tabs.append(tab);
      return {tab, panel, animation};
    }

    const entries = [addTab('IDEFIX / MMX', idefixPanel, idefix)];
    for (const mission of missions) {
      const {panel, animation} = createPanel(mission);
      entries.push(addTab(mission.name, panel, animation));
    }

    function select(index) {
      entries.forEach(({tab, panel, animation}, position) => {
        const selected = index === position;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panel.hidden = !selected;
        if (!selected) {
          animation?.pause();
        }
      });
    }

    select(0);
    entries.forEach(({tab}, index) => {
      tab.addEventListener('click', () => {
        select(index);
        updateCardLayout(card);
      });
      tab.addEventListener('keydown', event => {
        let next;
        switch (event.key) {
          case 'ArrowRight': next = (index + 1) % entries.length; break;
          case 'ArrowLeft': next = (index + entries.length - 1) % entries.length; break;
          case 'Home': next = 0; break;
          case 'End': next = entries.length - 1; break;
          default: return;
        }
        event.preventDefault();
        entries[next].tab.click();
        entries[next].tab.focus();
      });
    });

    function render(date, resetLocal = false) {
      const nextLanguage = getLanguage();
      if (language !== nextLanguage) {
        language = nextLanguage;
        const translations = getTranslations();
        for (const {node, key, start, end} of localizedNodes) {
          if (start) {
            node.textContent = formatDate(language, start, end);
          } else {
            node.textContent = translations['space_' + key];
          }
        }
      }
      entries.slice(1).forEach(entry => entry.animation.render(date, resetLocal));
      idefix.render(date, resetLocal);
    }

    return {render};
  }

  return {create, formatDate};
})();
