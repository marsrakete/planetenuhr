#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  getCalendarSourceFiles,
  getLanguageKeys,
  getRepositoryRoot,
  getSortedLanguageEvents,
  loadCalendarEvents
} = require("./calendar-data");

/**
 * Returns the absolute output directory for generated ICS files.
 * @param {string} repositoryRoot Absolute repository root path.
 * @returns {string} Absolute output directory path.
 */
function getIcsOutputDirectory(repositoryRoot) {
  return path.join(repositoryRoot, "ics");
}


/**
 * Returns the category keys that appear in the merged calendar data across all
 * supported languages.
 * @param {Record<string, Array<object>>} eventsByLanguage Language-keyed calendar lists.
 * @returns {string[]} Sorted unique category keys.
 */
function getCategoryKeys(eventsByLanguage) {
  const categories = new Set();

  Object.values(eventsByLanguage).forEach(languageEvents => {
    if (!Array.isArray(languageEvents)) {
      return;
    }

    languageEvents.forEach(event => {
      if (event && event.category) {
        categories.add(String(event.category));
      }
    });
  });

  return Array.from(categories).sort();
}


/**
 * Returns only the events that belong to the requested category.
 * @param {Array<object>} events Sorted language-specific events.
 * @param {string} categoryKey Category key such as "eclipse" or "meteor".
 * @returns {Array<object>} Category-filtered events.
 */
function filterEventsByCategory(events, categoryKey) {
  const filteredEvents = [];

  events.forEach(event => {
    if (event.category === categoryKey) {
      filteredEvents.push(event);
    }
  });

  return filteredEvents;
}

/**
 * Escapes a text value for ICS output according to RFC 5545 text rules.
 * @param {string} value Plain text value.
 * @returns {string} Escaped ICS-safe text.
 */
function escapeIcsText(value) {
  let text = String(value);
  text = text.replace(/\\/g, "\\\\");
  text = text.replace(/\r\n/g, "\\n");
  text = text.replace(/\n/g, "\\n");
  text = text.replace(/,/g, "\\,");
  text = text.replace(/;/g, "\\;");
  return text;
}

/**
 * Formats the current UTC timestamp as an ICS DATE-TIME stamp.
 * @param {Date} date Timestamp source.
 * @returns {string} UTC timestamp in YYYYMMDDTHHMMSSZ format.
 */
function formatIcsUtcStamp(date) {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return year + month + day + "T" + hours + minutes + seconds + "Z";
}

/**
 * Returns the next calendar date string after one all-day event date.
 * ICS all-day events use an exclusive DTEND, so the next day is required.
 * @param {string} isoDate Event date in YYYY-MM-DD format.
 * @returns {string} Next day in YYYYMMDD format.
 */
function getIcsExclusiveEndDate(isoDate) {
  const date = new Date(isoDate + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + 1);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return year + month + day;
}

/**
 * Formats one ISO date string as an ICS all-day DTSTART value.
 * @param {string} isoDate Event date in YYYY-MM-DD format.
 * @returns {string} Event date in YYYYMMDD format.
 */
function formatIcsDateValue(isoDate) {
  return String(isoDate).replace(/-/g, "");
}

/**
 * Builds a deterministic event UID for one generated ICS entry.
 * @param {string} languageKey UI language key.
 * @param {object} event Calendar event object.
 * @returns {string} Deterministic UID for calendar clients.
 */
function buildEventUid(languageKey, event) {
  const titleSlug = String(event.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/g, "")
    .replace(/-+$/g, "");

  return [
    "planetenuhr",
    languageKey,
    event.category,
    event.date,
    titleSlug
  ].join("-") + "@marsrakete.github.io";
}

/**
 * Builds one VEVENT block for the requested calendar event.
 * @param {string} languageKey UI language key.
 * @param {object} event Calendar event object.
 * @param {Date} now Timestamp used for DTSTAMP.
 * @returns {string[]} VEVENT lines.
 */
function buildEventLines(languageKey, event, now) {
  const descriptionParts = [];

  if (event.visibility) {
    descriptionParts.push("Sichtbarkeit: " + event.visibility);
  }
  if (event.note) {
    descriptionParts.push(event.note);
  }

  const description = descriptionParts.join("\n\n");
  const eventLines = [
    "BEGIN:VEVENT",
    "UID:" + buildEventUid(languageKey, event),
    "DTSTAMP:" + formatIcsUtcStamp(now),
    "DTSTART;VALUE=DATE:" + formatIcsDateValue(event.date),
    "DTEND;VALUE=DATE:" + getIcsExclusiveEndDate(event.date),
    "SUMMARY:" + escapeIcsText(event.title),
    "CATEGORIES:" + escapeIcsText(String(event.category).toUpperCase())
  ];

  if (description) {
    eventLines.push("DESCRIPTION:" + escapeIcsText(description));
  }

  if (event.visibility) {
    eventLines.push("X-PLANETENUHR-VISIBILITY:" + escapeIcsText(event.visibility));
  }

  eventLines.push("END:VEVENT");
  return eventLines;
}

/**
 * Returns a human-readable calendar title for one generated ICS file.
 * @param {string} languageKey UI language key.
 * @param {string|null} categoryKey Optional category key. Null means all events.
 * @returns {string} Calendar title.
 */
function buildCalendarDisplayName(languageKey, categoryKey) {
  if (categoryKey === null) {
    return "Planetenuhr Sky Calendar (" + languageKey + ")";
  }

  return "Planetenuhr " + categoryKey + " (" + languageKey + ")";
}

/**
 * Builds the full VCALENDAR text for one language and one optional category.
 * @param {string} languageKey UI language key.
 * @param {Array<object>} events Sorted calendar events.
 * @param {string|null} categoryKey Optional category key. Null means all events.
 * @param {Date} now Timestamp used for DTSTAMP.
 * @returns {string} Complete ICS file content.
 */
function buildCalendarIcs(languageKey, events, categoryKey, now) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//marsrakete//Planetenuhr//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:" + escapeIcsText(buildCalendarDisplayName(languageKey, categoryKey)),
    "X-WR-TIMEZONE:Europe/Berlin"
  ];

  events.forEach(event => {
    buildEventLines(languageKey, event, now).forEach(line => {
      lines.push(line);
    });
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/**
 * Returns the absolute output file path for one generated ICS file.
 * @param {string} outputDirectory Absolute ICS output directory.
 * @param {string} languageKey UI language key.
 * @param {string|null} categoryKey Optional category key. Null means all events.
 * @returns {string} Absolute target file path.
 */
function buildOutputFilePath(outputDirectory, languageKey, categoryKey) {
  let fileName = "planetenuhr-" + languageKey + "-all.ics";

  if (categoryKey !== null) {
    fileName = "planetenuhr-" + languageKey + "-" + categoryKey + ".ics";
  }

  return path.join(outputDirectory, fileName);
}

/**
 * Ensures that the ICS output directory exists.
 * @param {string} outputDirectory Absolute output directory path.
 * @returns {void}
 */
function ensureOutputDirectory(outputDirectory) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

/**
 * Writes one text file with UTF-8 encoding.
 * @param {string} outputPath Absolute target file path.
 * @param {string} content File content.
 * @returns {void}
 */
function writeTextFile(outputPath, content) {
  fs.writeFileSync(outputPath, content, "utf8");
}

/**
 * Generates all language-specific and category-specific ICS files from the
 * merged calendar configuration.
 * @param {string} repositoryRoot Absolute repository root path.
 * @returns {string[]} Absolute output file paths that were written.
 */
function generateIcsFiles(repositoryRoot) {
  const eventsByLanguage = loadCalendarEvents(repositoryRoot);
  const languages = getLanguageKeys(eventsByLanguage);
  const categories = getCategoryKeys(eventsByLanguage);
  const outputDirectory = getIcsOutputDirectory(repositoryRoot);
  const now = new Date();
  const writtenFiles = [];

  ensureOutputDirectory(outputDirectory);

  languages.forEach(languageKey => {
    const languageEvents = getSortedLanguageEvents(eventsByLanguage, languageKey);

    const allFilePath = buildOutputFilePath(outputDirectory, languageKey, null);
    const allCalendarContent = buildCalendarIcs(languageKey, languageEvents, null, now);
    writeTextFile(allFilePath, allCalendarContent);
    writtenFiles.push(allFilePath);

    categories.forEach(categoryKey => {
      const categoryEvents = filterEventsByCategory(languageEvents, categoryKey);
      if (categoryEvents.length === 0) {
        return;
      }

      const categoryFilePath = buildOutputFilePath(outputDirectory, languageKey, categoryKey);
      const categoryCalendarContent = buildCalendarIcs(languageKey, categoryEvents, categoryKey, now);
      writeTextFile(categoryFilePath, categoryCalendarContent);
      writtenFiles.push(categoryFilePath);
    });
  });

  return writtenFiles;
}

/**
 * Prints a short generation summary for the command-line script.
 * @param {string[]} writtenFiles Absolute output file paths that were generated.
 * @returns {void}
 */
function printGenerationSummary(writtenFiles) {
  console.log("ICS generation completed:");
  writtenFiles.forEach(outputPath => {
    console.log("- " + path.relative(getRepositoryRoot(), outputPath));
  });
}

/**
 * Runs the standalone ICS generator command.
 * @returns {void}
 */
function main() {
  const repositoryRoot = getRepositoryRoot();
  const writtenFiles = generateIcsFiles(repositoryRoot);
  printGenerationSummary(writtenFiles);
}

if (require.main === module) {
  main();
}

module.exports = {
  generateIcsFiles
};
