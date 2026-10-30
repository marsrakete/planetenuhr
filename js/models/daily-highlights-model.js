window.PLANETENUHR_DAILY_MODEL = (() => {
  'use strict';

  /** Counts calendar days independently of DST, locale and the browser's zone.
   * @param {string} from YYYY-MM-DD. @param {string} to YYYY-MM-DD.
   * @returns {number} Signed whole-day difference.
   */
  function dayDifference(from, to){
    return Math.round((Date.parse(to + 'T12:00:00Z') - Date.parse(from + 'T12:00:00Z')) / 86400000);
  }

  /** Resolves annual shower activity and the nearest year's peak, including New Year.
   * @param {object} stream Configured MM-DD start, end and peak.
   * @param {string} dateKey Observer's local YYYY-MM-DD.
   * @returns {object} Active flag, peak date and signed days until that peak.
   */
  function meteorState(stream, dateKey){
    const monthDay = dateKey.slice(5);
    let active = monthDay >= stream.start && monthDay <= stream.end;
    if (stream.start > stream.end) active = monthDay >= stream.start || monthDay <= stream.end;
    const year = Number(dateKey.slice(0,4));
    const peaks = [year - 1, year, year + 1].map(value => {
      const peakDate = value + '-' + stream.peak;
      return {peakDate, days:dayDifference(dateKey, peakDate)};
    });
    peaks.sort((a,b) => Math.abs(a.days) - Math.abs(b.days));
    return {active, ...peaks[0]};
  }

  /** Builds and ranks existing-data hints with stable ties and per-topic limits.
   * Merges dated shower peaks and reserves one slot for the best active stream.
   * @param {object} snapshot Local date, calendar, meteor, moon, solar and observation data.
   * @param {object} config Editorial priorities, lookahead and topic limits.
   * @returns {object[]} At most maximumItems deterministic, deduplicated candidates.
   */
  function select(snapshot, config){
    const candidates = [];
    const showers = snapshot.showers.map(stream => {
      const state = meteorState(stream, snapshot.dateKey);
      const curated = snapshot.calendar.find(event => event.category === 'meteor' && Math.abs(dayDifference(state.peakDate, event.date)) <= config.mergeWindowDays);
      if (curated) {
        state.peakDate = curated.date;
        state.days = dayDifference(snapshot.dateKey, curated.date);
      }
      return {stream, state, curated};
    });
    snapshot.calendar.forEach((event, index) => {
      if (showers.some(shower => shower.curated === event)) return;
      const days = dayDifference(snapshot.dateKey, event.date);
      if (!Number.isFinite(days) || days < 0 || days > config.lookahead.calendar) return;
      let group = 'calendar';
      let score = config.scores.calendar;
      if (['eclipse','meteor','moon'].includes(event.category)) group = event.category;
      if (group === 'eclipse') score = config.scores.eclipse;
      if (event.eclipseStatus === 'not_visible') score -= 35;
      candidates.push({id:'calendar-' + event.date + '-' + event.category + '-' + index,
        kind:'calendar', group, score:score - days * config.futureDayPenalty, days, dateKey:event.date,
        target:'sky_calendar', data:event});
    });
    showers.forEach(({stream, state, curated}) => {
      if (!state.active && (state.days < 0 || state.days > config.lookahead.meteor)) return;
      let score = config.scores.meteorActive - Math.abs(state.days) * config.meteorPeakDistancePenalty;
      let kind = 'meteor_active';
      let days = 0;
      if (state.days < 0) kind = 'meteor_declining';
      if (state.days >= 0 && state.days <= config.lookahead.meteor) {
        score = config.scores.meteorSoon - state.days * config.futureDayPenalty;
        kind = 'meteor_peak';
        if (!state.active) days = state.days;
        if (state.days === 0) {
          score = config.scores.meteorPeak;
          kind = 'meteor_today';
        }
      }
      candidates.push({id:'meteor-' + stream.key, kind, group:'meteor', score, days,
        dateKey:state.peakDate, target:'meteor_streams', data:{stream, ...state, peakDated:Boolean(curated), brightMoon:snapshot.moon.illum >= config.brightMoonPercent}});
    });
    if (snapshot.orbitalModelReliable) {
      snapshot.conjunctions.forEach(event => {
        const covered = snapshot.calendar.some(item => item.approach && item.approach.a === event.a && item.approach.b === event.b && dayDifference(snapshot.dateKey, item.date) >= 0 && dayDifference(snapshot.dateKey, item.date) <= config.lookahead.calendar);
        if (covered) return;
        const days = dayDifference(snapshot.dateKey, event.dateKey);
        if (days < 0 || days > config.lookahead.conjunction) return;
        candidates.push({id:'conjunction-' + event.a + '-' + event.b + '-' + event.dateKey,
          kind:'conjunction', group:'conjunction', days, dateKey:event.dateKey, target:'conjunctions',
          score:config.scores.conjunction - days * config.conjunctionDayPenalty, data:event});
      });
      snapshot.planets.forEach(planet => {
        if (planet.samples < config.observation.minimumSamples) return;
        candidates.push({id:'planet-' + planet.key, kind:'planet', group:'planet', days:0,
          dateKey:snapshot.dateKey, target:'planet_horizon',
          score:config.scores.planet + planet.altitudeDeg * config.altitudeScorePerDegree + (config.planetBonus[planet.key] || 0), data:planet});
      });
    }
    const tolerance = config.moonPhaseTolerance;
    if (Math.abs(snapshot.moon.frac - .5) <= tolerance || Math.min(snapshot.moon.frac, 1 - snapshot.moon.frac) <= tolerance) {
      let kind = 'moon_new';
      if (Math.abs(snapshot.moon.frac - .5) <= tolerance) kind = 'moon_full';
      candidates.push({id:kind, kind, group:'moon', score:config.scores.moon, days:0,
        dateKey:snapshot.dateKey, target:'earth_moon', data:snapshot.moon});
    }
    if (snapshot.solar.polarDay || snapshot.solar.polarNight) {
      let kind = 'polar_night';
      if (snapshot.solar.polarDay) kind = 'polar_day';
      candidates.push({id:kind, kind, group:'solar', score:config.scores.polar, days:0,
        dateKey:snapshot.dateKey, target:'planet_horizon', data:{}});
    }
    candidates.sort((a,b) => b.score - a.score || a.days - b.days || a.id.localeCompare(b.id));
    const selected = [];
    const counts = new Map();
    const seen = new Set();
    candidates.forEach(candidate => {
      if (selected.length >= config.maximumItems || candidate.score < config.minimumScore) return;
      if ((counts.get(candidate.group) || 0) >= config.limits[candidate.group]) return;
      let key = candidate.group + ':' + candidate.dateKey;
      if (candidate.group === 'calendar') key += ':' + candidate.id;
      if (candidate.group !== 'planet' && seen.has(key)) return;
      selected.push(candidate);
      seen.add(key);
      counts.set(candidate.group, (counts.get(candidate.group) || 0) + 1);
    });
    // Reserve one of the five slots for the best active stream, even on busy days.
    const activeMeteor = candidates.find(candidate => candidate.group === 'meteor' && (candidate.data.active || candidate.kind === 'meteor_today'));
    if (activeMeteor && !selected.includes(activeMeteor)) {
      const meteorIndex = selected.findIndex(candidate => candidate.group === 'meteor');
      if (meteorIndex >= 0) selected.splice(meteorIndex, 1);
      else if (selected.length >= config.maximumItems) selected.pop();
      selected.push(activeMeteor);
      selected.sort((a,b) => b.score - a.score || a.days - b.days || a.id.localeCompare(b.id));
    }
    return selected;
  }

  return {dayDifference, meteorState, select};
})();
