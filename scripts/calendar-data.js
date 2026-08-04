const fs = require("fs");
const path = require("path");
const vm = require("vm");

/**
 * Returns the repository root based on the current working directory.
 * @returns {string} Absolute repository root path.
 */
function getRepositoryRoot() {
  return process.cwd();
}

/**
 * Returns the absolute file paths of the JavaScript config files that define
 * the merged sky-calendar event data.
 * @param {string} repositoryRoot Absolute repository root path.
 * @returns {string[]} Absolute file paths in dependency order.
 */
function getCalendarSourceFiles(repositoryRoot) {
  return [
    path.join(repositoryRoot, "phenomena-config.js"),
    path.join(repositoryRoot, "calendar-events.js"),
    path.join(repositoryRoot, "eclipse-calendar-config.js"),
    path.join(repositoryRoot, "extended-calendar-config.js")
  ];
}

/**
 * Returns a fresh VM context that mimics the small browser surface required by
 * the project configuration files.
 * @returns {vm.Context} Executable VM context with a shared window object.
 */
function createCalendarVmContext() {
  const sandbox = {
    console,
    window: {}
  };
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox.window;
  return vm.createContext(sandbox);
}

/**
 * Executes one plain project script inside the shared VM context.
 * @param {vm.Context} context Shared VM context.
 * @param {string} sourcePath Absolute path of the script file to execute.
 * @returns {void}
 */
function runCalendarSourceFile(context, sourcePath) {
  const sourceCode = fs.readFileSync(sourcePath, "utf8");
  vm.runInContext(sourceCode, context, { filename: sourcePath });
}

/**
 * Loads the merged planetenuhr calendar data by executing the same config
 * files that the browser page uses.
 * @param {string} repositoryRoot Absolute repository root path.
 * @returns {Record<string, Array<object>>} Language-keyed calendar event lists.
 */
function loadCalendarEvents(repositoryRoot) {
  const context = createCalendarVmContext();
  const sourceFiles = getCalendarSourceFiles(repositoryRoot);

  sourceFiles.forEach(sourcePath => {
    runCalendarSourceFile(context, sourcePath);
  });

  if (!context.window || !context.window.PLANETENUHR_EVENTS) {
    throw new Error("Merged calendar data could not be loaded from the project config files.");
  }

  return context.window.PLANETENUHR_EVENTS;
}

/**
 * Returns the language keys that are available in the merged event object.
 * @param {Record<string, Array<object>>} eventsByLanguage Language-keyed calendar lists.
 * @returns {string[]} Supported language keys.
 */
function getLanguageKeys(eventsByLanguage) {
  const languages = [];

  Object.keys(eventsByLanguage).forEach(languageKey => {
    if (Array.isArray(eventsByLanguage[languageKey])) {
      languages.push(languageKey);
    }
  });

  languages.sort();
  return languages;
}

/**
 * Returns the event list for one language, sorted by date and title.
 * @param {Record<string, Array<object>>} eventsByLanguage Language-keyed calendar lists.
 * @param {string} languageKey UI language key.
 * @returns {Array<object>} Sorted events for the requested language.
 */
function getSortedLanguageEvents(eventsByLanguage, languageKey) {
  const inputEvents = eventsByLanguage[languageKey];
  const sortedEvents = [];

  if (!Array.isArray(inputEvents)) {
    return sortedEvents;
  }

  inputEvents.forEach(event => {
    sortedEvents.push(event);
  });

  sortedEvents.sort((left, right) => {
    if (left.date < right.date) {
      return -1;
    }
    if (left.date > right.date) {
      return 1;
    }
    return String(left.title).localeCompare(String(right.title));
  });

  return sortedEvents;
}

module.exports = {
  createCalendarVmContext,
  getCalendarSourceFiles,
  getLanguageKeys,
  getRepositoryRoot,
  getSortedLanguageEvents,
  loadCalendarEvents,
  runCalendarSourceFile
};
