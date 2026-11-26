window.PLANETENUHR_SPACE_MISSION_FLYBYS = (() => {
  'use strict';

  const minuteMs = 60000;
  const flybyDuration = 4500;

  /** Builds a playback clock that spends longer inside each flyby window.
   * @param {number} from Starting mission minute.
   * @param {number} end Last mission minute.
   * @param {number} duration Base duration of the full overview in milliseconds.
   * @param {Array<[number,number,number?]>} windows Chronological mission-minute intervals with an optional duration in milliseconds.
   * @returns {Function} Maps elapsed playback milliseconds to a mission minute.
   */
  function playbackTimeline(from,end,duration,windows) {
    const segments = [];
    const baseRate = duration / end;
    let cursor = from;
    for (const [windowStart,windowEnd,windowDuration = flybyDuration] of windows) {
      const start = Math.max(cursor,windowStart);
      const stop = Math.min(end,windowEnd);
      if (stop <= start) continue;
      if (cursor < start) {
        segments.push({start:cursor,end:start,rate:baseRate});
      }
      const rate = Math.max(baseRate,windowDuration / (windowEnd - windowStart));
      segments.push({start,end:stop,rate});
      cursor = stop;
    }
    if (cursor < end) {
      segments.push({start:cursor,end,rate:baseRate});
    }

    /** Converts elapsed wall-clock time to a position on the UTC slider.
     * @param {number} elapsed Playback milliseconds since Play.
     * @returns {number} Current mission minute, capped at the end.
     */
    function timeAt(elapsed) {
      let remaining = Math.max(0,elapsed);
      for (const segment of segments) {
        const length = (segment.end - segment.start) * segment.rate;
        if (remaining < length) {
          return segment.start + remaining / segment.rate;
        }
        remaining -= length;
      }
      return end;
    }
    return timeAt;
  }

  /** Mounts the planet-centered detail displayed alongside a mission overview.
   * @param {HTMLElement} layout Parent containing the heliocentric overview.
   * @param {object[]} flybys Flyby definitions in chronological order.
   * @param {object} dependencies Trajectories, projection, interpolation and Saturn rendering.
   * @returns {{render:Function,timeline:Function}} Detail and playback clock adapters.
   */
  function create(layout,flybys,{trajectories,positionAt,orbitalProjection,orbitalAxes,addSaturnRings,
    controls,getTranslations,getOverviewScene,getStatus,milestones,missionName}) {
    const template = layout.ownerDocument.getElementById('spaceMissionFlybyTemplate');
    const detail = template.content.firstElementChild.cloneNode(true);
    const title = detail.querySelector('h4');
    const plot = detail.querySelector('svg');
    const track = plot.querySelector('.mission-tracked-path');
    const center = plot.querySelector('.mission-center');
    const originalDisc = center.firstElementChild;
    const probe = plot.querySelector('.mission-probe');
    const probeDisc = probe.querySelector('circle');
    const distance = detail.querySelector('.mission-flyby-distance');
    const source = detail.querySelector('a');
    const entries = flybys.map(flyby => {
      const data = trajectories[flyby.key];
      return {...flyby,data,start:data.rows[0][0],end:data.rows.at(-1)[0]};
    });
    layout.append(detail);
    let active;
    let project;
    let extent;
    let scale;
    let axes;
    let selectedTime;
    let selectedPoint;
    let lastTranslations;

    /** Prepares a planet and its local trajectory only when the window changes.
     * @param {object} entry Selected flyby and planet-centered vector data.
     * @returns {void}
     */
    function select(entry) {
      const plane = orbitalProjection(entry.data.rows);
      extent = Math.max(entry.radius,...entry.data.rows.map(([,x,y,z]) => Math.hypot(x,y,z)));
      scale = 112 / extent;
      axes = orbitalAxes(entry.data.rows) || window.PLANETENUHR_SPACE_MISSION_CAMERA.topDown;
      /** Projects a local position in kilometers to SVG coordinates.
       * @param {number} x X offset. @param {number} y Y offset. @param {number} z Z offset.
       * @returns {number[]} Plot position.
       */
      project = (x,y,z) => {
        if (plane) [x,y] = plane(x,y,z);
        return [190 + x * scale,126 - y * scale];
      };
      track.setAttribute('d',entry.data.rows.map(([,x,y,z],index) => {
        let command = 'L';
        if (index === 0) command = 'M';
        return command + project(x,y,z).map(value => value.toFixed(2)).join(' ');
      }).join(' '));
      const disc = originalDisc.cloneNode(true);
      const radius = entry.radius * scale;
      disc.setAttribute('r',radius);
      center.dataset.planet = entry.body.slice('planet_'.length);
      center.replaceChildren(disc);
      if (entry.body === 'planet_saturn') {
        addSaturnRings(center,radius);
      }
      source.href = entry.data.url;
    }

    /** Shows the detail covered by the overview timestamp, or hides it outside encounters.
     * @param {number} timestamp Selected UTC milliseconds.
     * @param {object} translations Current dashboard copy.
     * @param {Intl.NumberFormat} formatter Localized distance formatter.
     * @returns {boolean} Whether an encounter is visible.
     */
    function render(timestamp,translations,formatter) {
      const localeChanged = translations !== lastTranslations;
      lastTranslations = translations;
      const entry = entries.find(item => timestamp >= item.start && timestamp <= item.end);
      if (entry !== active) {
        active = entry;
        detail.hidden = !entry;
        layout.classList.toggle('has-flyby',Boolean(entry));
        spatial.setAvailable(Boolean(entry));
        if (entry) select(entry);
      }
      if (!entry) {
        spatial.update(localeChanged);
        return false;
      }
      const name = translations[entry.body];
      const heading = translations.space_flybyDetail.replace('{planet}',name);
      if (title.textContent !== heading) {
        title.textContent = heading;
        plot.setAttribute('aria-label',heading);
      }
      const {x,y,z} = positionAt(entry.data.rows,new Date(timestamp));
      selectedTime = timestamp;
      selectedPoint = [x,y,z];
      const range = Math.hypot(x,y,z);
      // Keep the planet to scale and both objects in frame as the probe approaches.
      const zoom = Math.max(1,extent / Math.max(2.4 * entry.radius,1.2 * range));
      const halfWidth = 190 / zoom;
      const halfHeight = 126 / zoom;
      plot.setAttribute('viewBox',[190 - halfWidth,126 - halfHeight,2 * halfWidth,2 * halfHeight].join(' '));
      probeDisc.setAttribute('r',3 / zoom);
      probe.setAttribute('transform','translate(' + project(x,y,z).join(' ') + ')');
      distance.textContent = translations.space_voyagerCenterDistance
        .replace('{distance}',formatter.format(range));
      spatial.update(localeChanged);
      return true;
    }

    /** Supplies the current encounter frame to its 3D launcher.
     * No parameters. @returns {object|null} Encounter, or the overview after leaving its window.
     */
    function getSpatialScene() {
      if (!active) return getOverviewScene();
      const plotScale = scale * 640 / plot.viewBox.baseVal.width;
      let kind = 'planet';
      if (active.body === 'planet_saturn') kind = 'saturn';
      const objects = [
        {key:'planet',kind,label:getTranslations()[active.body],radius:active.radius * plotScale,point:[0,0,0]},
        {key:'probe',kind:'probe',label:missionName,radius:3,point:selectedPoint}
      ];
      return {key:active,axes,scale:plotScale,orbits:[],timestamp:selectedTime,objects,
        tracks:[{rows:active.data.rows,kind:'tracked'}]};
    }

    const spatial = window.PLANETENUHR_SPACE_MISSION_3D.create({
      anchor:plot,controls,getScene:getSpatialScene,positionAt,getTranslations,getStatus,milestones,
      getTitle:() => {
        if (active) return missionName + ' · ' + title.textContent;
        return missionName;
      },
      getFallbackFocus:() => layout.querySelector('.mission-journey-main .mission-3d-launch')
    });
    spatial.setAvailable(false);

    /** Converts the flyby UTC windows to the current overview slider's minutes.
     * @param {number} epoch UTC milliseconds at slider zero.
     * @param {number} from Starting slider minute. @param {number} end Last slider minute.
     * @param {number} duration Base playback duration in milliseconds.
     * @param {number[]} [photoWindow] Optional UTC interval for a mission photograph.
     * @param {number} [photoDuration] Time spent traversing the photograph interval in milliseconds.
     * @returns {Function} Playback position for the supplied elapsed milliseconds.
     */
    function timeline(epoch,from,end,duration,photoWindow,photoDuration) {
      const windows = entries.map(({start,end}) => [(start - epoch) / minuteMs,(end - epoch) / minuteMs]);
      if (photoWindow) {
        const [start,stop] = photoWindow.map(timestamp => (timestamp - epoch) / minuteMs);
        windows.push([start,stop,photoDuration]);
        windows.sort((first,second) => first[0] - second[0]);
      }
      return playbackTimeline(from,end,duration,windows);
    }

    /** Returns the named current encounter. No parameters. @returns {string|undefined} Milestone key. */
    function getMilestone() {
      return active?.milestone;
    }

    /** Returns the live panel during an encounter. No parameters. @returns {HTMLElement|undefined} Visible flyby detail. */
    function getDetail() {
      if (active) return detail;
    }

    return {render,timeline,getMilestone,getDetail,updateSpatial:spatial.update};
  }

  return {create,playbackTimeline};
})();
