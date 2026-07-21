window.PLANETENUHR_RECURRING_CALENDAR_RANGE = {
  startYear: 2028,
  endYear: 2040
};

/**
 * Formats a Date object as YYYY-MM-DD for calendar entries.
 * @param {Date} date Input date.
 * @returns {string} Date key in YYYY-MM-DD format.
 */
function recurringCalendarDateKey(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

/**
 * Returns the localized title for one meteor-shower maximum.
 * @param {string} streamName Shower display name.
 * @param {string} lang UI language key.
 * @returns {string} Localized title.
 */
function recurringMeteorTitle(streamName, lang) {
  if (lang === "de") {
    return "Maximum der " + streamName;
  }
  if (lang === "fr") {
    return "Maximum des " + streamName;
  }
  return streamName + " meteor shower maximum";
}

/**
 * Returns the localized visibility line for one recurring meteor-shower entry.
 * @param {string} lang UI language key.
 * @returns {string} Localized visibility text.
 */
function recurringMeteorVisibility(lang) {
  if (lang === "de") {
    return "Von Europa aus meist nach Mitternacht g\u00fcnstig";
  }
  if (lang === "fr") {
    return "G\u00e9n\u00e9ralement favorable depuis l'Europe apr\u00e8s minuit";
  }
  return "Usually favorable from Europe after midnight";
}

/**
 * Returns the localized note for one recurring meteor-shower entry.
 * @param {object} stream Meteor stream config.
 * @param {string} lang UI language key.
 * @returns {string} Localized note text.
 */
function recurringMeteorNote(stream, lang) {
  const radiant = stream.radiant || stream.name;
  if (lang === "de") {
    return "J\u00e4hrlicher Peak des Meteorstroms; Radiant bei " + radiant + ". Aktivit\u00e4tsfenster ungef\u00e4hr " + stream.start + " bis " + stream.end + ".";
  }
  if (lang === "fr") {
    return "Pic annuel de cet essaim de m\u00e9t\u00e9ores ; radiant vers " + radiant + ". Fen\u00eatre d'activit\u00e9 approximative du " + stream.start + " au " + stream.end + ".";
  }
  return "Annual peak of this meteor shower; radiant near " + radiant + ". Approximate activity window " + stream.start + " to " + stream.end + ".";
}

/**
 * Generates recurring meteor-shower calendar entries from the phenomena config.
 * @param {string} lang UI language key.
 * @returns {Array<object>} Localized meteor calendar entries.
 */
function generatedMeteorCalendarEntries(lang) {
  const range = window.PLANETENUHR_RECURRING_CALENDAR_RANGE;
  let streams = [];
  if (window.PLANETENUHR_PHENOMENA && Array.isArray(window.PLANETENUHR_PHENOMENA.meteorStreams)) {
    streams = window.PLANETENUHR_PHENOMENA.meteorStreams;
  }

  const events = [];
  let year = range.startYear;
  while (year <= range.endYear) {
    streams.forEach(stream => {
      const peakParts = String(stream.peak || "").split("-");
      if (peakParts.length !== 2) {
        return;
      }
      const month = Number(peakParts[0]);
      const day = Number(peakParts[1]);
      const date = new Date(year, month - 1, day);
      events.push({
        date: recurringCalendarDateKey(date),
        category: "meteor",
        title: recurringMeteorTitle(stream.name, lang),
        visibility: recurringMeteorVisibility(lang),
        note: recurringMeteorNote(stream, lang)
      });
    });
    year += 1;
  }

  return events;
}

/**
 * Returns the localized visibility string for a season entry.
 * @param {string} lang UI language key.
 * @returns {string} Localized visibility text.
 */
function recurringSeasonVisibility(lang) {
  if (lang === "de") {
    return "Weltweit";
  }
  if (lang === "fr") {
    return "Monde entier";
  }
  return "Worldwide";
}

/**
 * Returns the four localized season events for one year.
 * @param {number} year Calendar year.
 * @param {string} lang UI language key.
 * @returns {Array<object>} Localized season entries.
 */
function generatedSeasonEntriesForYear(year, lang) {
  const events = [];

  function pushSeason(month, day, enTitle, deTitle, frTitle, enNote, deNote, frNote) {
    let title = enTitle;
    let note = enNote;
    if (lang === "de") {
      title = deTitle;
      note = deNote;
    } else if (lang === "fr") {
      title = frTitle;
      note = frNote;
    }

    events.push({
      date: recurringCalendarDateKey(new Date(year, month - 1, day)),
      category: "season",
      title,
      visibility: recurringSeasonVisibility(lang),
      note
    });
  }

  pushSeason(
    3,
    20,
    "March equinox",
    "M\u00e4rz-Tagundnachtgleiche",
    "\u00c9quinoxe de mars",
    "Astronomical spring begins in the northern hemisphere.",
    "Astronomischer Fr\u00fchlingsbeginn auf der Nordhalbkugel.",
    "D\u00e9but du printemps astronomique dans l'h\u00e9misph\u00e8re nord."
  );
  pushSeason(
    6,
    21,
    "June solstice",
    "Juni-Sonnenwende",
    "Solstice de juin",
    "Longest day of the year in the northern hemisphere.",
    "L\u00e4ngster Tag des Jahres auf der Nordhalbkugel.",
    "Jour le plus long de l'ann\u00e9e dans l'h\u00e9misph\u00e8re nord."
  );
  pushSeason(
    9,
    22,
    "September equinox",
    "September-Tagundnachtgleiche",
    "\u00c9quinoxe de septembre",
    "Astronomical autumn begins in the northern hemisphere.",
    "Astronomischer Herbstbeginn auf der Nordhalbkugel.",
    "D\u00e9but de l'automne astronomique dans l'h\u00e9misph\u00e8re nord."
  );
  pushSeason(
    12,
    21,
    "December solstice",
    "Dezember-Sonnenwende",
    "Solstice de d\u00e9cembre",
    "Shortest day of the year in the northern hemisphere.",
    "K\u00fcrzester Tag des Jahres auf der Nordhalbkugel.",
    "Jour le plus court de l'ann\u00e9e dans l'h\u00e9misph\u00e8re nord."
  );

  return events;
}

/**
 * Generates recurring season calendar entries for the configured year range.
 * @param {string} lang UI language key.
 * @returns {Array<object>} Localized season entries.
 */
function generatedSeasonCalendarEntries(lang) {
  const range = window.PLANETENUHR_RECURRING_CALENDAR_RANGE;
  const events = [];
  let year = range.startYear;
  while (year <= range.endYear) {
    generatedSeasonEntriesForYear(year, lang).forEach(event => {
      events.push(event);
    });
    year += 1;
  }
  return events;
}

/**
 * Returns two recurring Earth-orbit entries for one year.
 * @param {number} year Calendar year.
 * @param {string} lang UI language key.
 * @returns {Array<object>} Localized planet entries.
 */
function generatedPlanetEntriesForYear(year, lang) {
  const events = [];

  function pushPlanet(month, day, enTitle, deTitle, frTitle, enVisibility, deVisibility, frVisibility, enNote, deNote, frNote) {
    let title = enTitle;
    let visibility = enVisibility;
    let note = enNote;

    if (lang === "de") {
      title = deTitle;
      visibility = deVisibility;
      note = deNote;
    } else if (lang === "fr") {
      title = frTitle;
      visibility = frVisibility;
      note = frNote;
    }

    events.push({
      date: recurringCalendarDateKey(new Date(year, month - 1, day)),
      category: "planet",
      title,
      visibility,
      note
    });
  }

  pushPlanet(
    1,
    3,
    "Earth at perihelion",
    "Erde im Perihel",
    "Terre au p\u00e9rih\u00e9lie",
    "No direct visual change; solar disk slightly larger",
    "Keine direkte Sicht\u00e4nderung; Sonnenscheibe geringf\u00fcgig gr\u00f6\u00dfer",
    "Pas de changement visuel direct ; disque solaire l\u00e9g\u00e8rement plus grand",
    "Earth is closest to the Sun; the seasons still depend mainly on axial tilt.",
    "Die Erde ist der Sonne am n\u00e4chsten; die Jahreszeiten werden trotzdem vor allem von der Achsneigung bestimmt.",
    "La Terre est au plus pr\u00e8s du Soleil ; les saisons d\u00e9pendent n\u00e9anmoins surtout de l'inclinaison de l'axe."
  );
  pushPlanet(
    7,
    4,
    "Earth at aphelion",
    "Erde im Aphel",
    "Terre \u00e0 l\u2019aph\u00e9lie",
    "No direct visual change; solar disk slightly smaller",
    "Keine direkte Sicht\u00e4nderung; Sonnenscheibe geringf\u00fcgig kleiner",
    "Pas de changement visuel direct ; disque solaire l\u00e9g\u00e8rement plus petit",
    "Earth is farthest from the Sun; northern summer is still driven by axial tilt, not distance.",
    "Die Erde ist der Sonne am fernsten; der Nordsommer entsteht trotzdem durch die Achsneigung und nicht durch die Entfernung.",
    "La Terre est au plus loin du Soleil ; l'\u00e9t\u00e9 bor\u00e9al reste caus\u00e9 par l'inclinaison de l'axe et non par la distance."
  );

  return events;
}

/**
 * Generates recurring planet calendar entries for the configured year range.
 * @param {string} lang UI language key.
 * @returns {Array<object>} Localized planet entries.
 */
function generatedPlanetCalendarEntries(lang) {
  const range = window.PLANETENUHR_RECURRING_CALENDAR_RANGE;
  const events = [];
  let year = range.startYear;
  while (year <= range.endYear) {
    generatedPlanetEntriesForYear(year, lang).forEach(event => {
      events.push(event);
    });
    year += 1;
  }
  return events;
}

/**
 * Generates all cycle dates in the configured range from one reference event.
 * @param {Date} referenceDate One known event date of the requested cycle type.
 * @param {number} cycleDays Cycle length in days.
 * @param {number} startYear Inclusive calendar start year.
 * @param {number} endYear Inclusive calendar end year.
 * @returns {Array<Date>} Generated cycle dates inside the requested range.
 */
function generatedMoonCycleDates(referenceDate, cycleDays, startYear, endYear) {
  const startDate = new Date(startYear, 0, 1);
  const endDate = new Date(endYear, 11, 31);
  const stepMs = cycleDays * 86400000;
  const dates = [];

  let seed = referenceDate.getTime();
  while (seed > startDate.getTime()) {
    seed -= stepMs;
  }
  while (seed + stepMs < startDate.getTime()) {
    seed += stepMs;
  }

  while (seed <= endDate.getTime()) {
    const date = new Date(seed);
    if (date >= startDate && date <= endDate) {
      dates.push(date);
    }
    seed += stepMs;
  }

  return dates;
}

/**
 * Picks one representative moon-distance event for each quarter.
 * @param {Array<Date>} dates Candidate dates of one moon cycle type.
 * @returns {Array<Date>} One representative date per quarter.
 */
function quarterRepresentativeMoonDates(dates) {
  const buckets = new Map();

  dates.forEach(date => {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const key = String(date.getFullYear()) + "-Q" + String(quarter);
    const quarterMidMonth = quarter * 3 - 1;
    const anchor = new Date(date.getFullYear(), quarterMidMonth, 15);
    const distance = Math.abs(date.getTime() - anchor.getTime());

    if (!buckets.has(key)) {
      buckets.set(key, { date, distance });
      return;
    }

    const current = buckets.get(key);
    if (distance < current.distance) {
      buckets.set(key, { date, distance });
    }
  });

  return Array.from(buckets.values()).map(item => item.date);
}

/**
 * Returns localized quarterly Moon-distance entries for the configured year range.
 * @param {string} lang UI language key.
 * @returns {Array<object>} Localized moon entries.
 */
function generatedMoonCalendarEntries(lang) {
  const range = window.PLANETENUHR_RECURRING_CALENDAR_RANGE;
  const anomalisticMonthDays = 27.55455;
  const referencePerigee = new Date(Date.UTC(2027, 1, 19, 0, 0, 0));
  const halfCycleDays = anomalisticMonthDays / 2;
  const referenceApogee = new Date(referencePerigee.getTime() + halfCycleDays * 86400000);
  const perigeeDates = quarterRepresentativeMoonDates(
    generatedMoonCycleDates(referencePerigee, anomalisticMonthDays, range.startYear, range.endYear)
  );
  const apogeeDates = quarterRepresentativeMoonDates(
    generatedMoonCycleDates(referenceApogee, anomalisticMonthDays, range.startYear, range.endYear)
  );
  const events = [];

  perigeeDates.forEach(date => {
    let title = "Moon at perigee";
    let visibility = "Subtle larger Moon";
    let note = "Representative near-Earth Moon date for this quarter; apparent size is slightly larger than average.";
    if (lang === "de") {
      title = "Mond im Perig\u00e4um";
      visibility = "Dezent gr\u00f6\u00dferer Mond";
      note = "Repr\u00e4sentativer erdnaher Mondtermin dieses Quartals; die scheinbare Gr\u00f6\u00dfe ist etwas \u00fcberdurchschnittlich.";
    } else if (lang === "fr") {
      title = "Lune au p\u00e9rig\u00e9e";
      visibility = "Lune un peu plus grande";
      note = "Date repr\u00e9sentative de Lune proche pour ce trimestre ; la taille apparente est l\u00e9g\u00e8rement sup\u00e9rieure \u00e0 la moyenne.";
    }
    events.push({
      date: recurringCalendarDateKey(date),
      category: "moon",
      title,
      visibility,
      note
    });
  });

  apogeeDates.forEach(date => {
    let title = "Moon at apogee";
    let visibility = "Subtle smaller Moon";
    let note = "Representative far-Earth Moon date for this quarter; apparent size is slightly smaller than average.";
    if (lang === "de") {
      title = "Mond im Apog\u00e4um";
      visibility = "Dezent kleinerer Mond";
      note = "Repr\u00e4sentativer erdferner Mondtermin dieses Quartals; die scheinbare Gr\u00f6\u00dfe ist etwas unterdurchschnittlich.";
    } else if (lang === "fr") {
      title = "Lune \u00e0 l\u2019apog\u00e9e";
      visibility = "Lune un peu plus petite";
      note = "Date repr\u00e9sentative de Lune lointaine pour ce trimestre ; la taille apparente est l\u00e9g\u00e8rement inf\u00e9rieure \u00e0 la moyenne.";
    }
    events.push({
      date: recurringCalendarDateKey(date),
      category: "moon",
      title,
      visibility,
      note
    });
  });

  events.sort((left, right) => {
    if (left.date < right.date) {
      return -1;
    }
    if (left.date > right.date) {
      return 1;
    }
    return left.title.localeCompare(right.title);
  });

  return events;
}

/**
 * Merges generated recurring entries into one language calendar array.
 * Existing hand-curated entries win when a date-title pair already exists.
 * @param {Array<object>} baseEvents Existing language calendar entries.
 * @param {Array<object>} extraEvents Generated recurring entries.
 * @returns {Array<object>} Sorted merged events.
 */
function mergeRecurringCalendarEntries(baseEvents, extraEvents) {
  const merged = [];
  const seen = new Set();

  baseEvents.forEach(event => {
    const key = event.date + "|" + event.title;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(event);
    }
  });

  extraEvents.forEach(event => {
    const key = event.date + "|" + event.title;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(event);
    }
  });

  merged.sort((left, right) => {
    if (left.date < right.date) {
      return -1;
    }
    if (left.date > right.date) {
      return 1;
    }
    return left.title.localeCompare(right.title);
  });

  return merged;
}

if (window.PLANETENUHR_EVENTS) {
  ["en", "de", "fr"].forEach(lang => {
    if (!Array.isArray(window.PLANETENUHR_EVENTS[lang])) {
      window.PLANETENUHR_EVENTS[lang] = [];
    }

    const generatedEntries = [];
    generatedMeteorCalendarEntries(lang).forEach(event => {
      generatedEntries.push(event);
    });
    generatedSeasonCalendarEntries(lang).forEach(event => {
      generatedEntries.push(event);
    });
    generatedPlanetCalendarEntries(lang).forEach(event => {
      generatedEntries.push(event);
    });
    generatedMoonCalendarEntries(lang).forEach(event => {
      generatedEntries.push(event);
    });

    window.PLANETENUHR_EVENTS[lang] = mergeRecurringCalendarEntries(window.PLANETENUHR_EVENTS[lang], generatedEntries);
  });
}
