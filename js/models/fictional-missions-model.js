window.PLANETENUHR_FICTIONAL_MISSIONS_MODEL = (() => {
  'use strict';

  /** Converts the editorial calendar into an ordered timeline ready for playback.
   * @param {object} mission Mission with dated events and optional separate clocks.
   * @returns {object|null} Prepared timeline, or null if the dates are invalid.
   */
  function prepare(mission){
    if (!mission || !Array.isArray(mission.events) || mission.events.length < 2) return null;
    const events = [];
    let previous = -Infinity;
    for (const event of mission.events) {
      const timestamp = Date.parse(event?.at);
      if (!Number.isFinite(timestamp) || timestamp <= previous) return null;
      events.push({...event,timestamp});
      previous = timestamp;
    }
    let clocks = null;
    if (mission.clocks) {
      const {start,end,enduranceEnd} = mission.clocks;
      const values = [start,end,enduranceEnd].map(value => Date.parse(value));
      if (!values.every(Number.isFinite) || values[0] >= values[1] || values[1] > values[2]) return null;
      clocks = {start:values[0],end:values[1],enduranceEnd:values[2]};
    }
    return {id:mission.id,events,clocks};
  }

  /** Resolves a slider position into its scene, motion fraction and display time.
   * Each milestone gets equal slider space, so short scenes can be scrubbed alongside long flights.
   * @param {object|null} mission Prepared mission timeline.
   * @param {number} value Slider position, with integer positions at milestones.
   * @returns {object|null} Frame for this position, or null if there is no prepared mission.
   */
  function frameAt(mission, value){
    if (!mission || !Array.isArray(mission.events) || mission.events.length < 2) return null;
    let position = 0;
    if (Number.isFinite(value)) position = value;
    position = Math.max(0,Math.min(position,mission.events.length - 1));
    const index = Math.floor(position);
    const event = mission.events[index];
    const next = mission.events[index + 1] || event;
    const progress = position - index;
    let timestamp = event.timestamp + (next.timestamp - event.timestamp) * progress;
    let enduranceTime = null;
    if (event.clocks && mission.clocks) {
      const {start,end,enduranceEnd} = mission.clocks;
      // Both clocks stop at the reunion before the timeline switches to Endurance time.
      timestamp = Math.min(timestamp,end);
      const fraction = Math.max(0,Math.min(1,(timestamp - start) / (end - start)));
      enduranceTime = start + (enduranceEnd - start) * fraction;
    }
    return {index, event, progress, timestamp, enduranceTime};
  }

  return {prepare,frameAt};
})();
