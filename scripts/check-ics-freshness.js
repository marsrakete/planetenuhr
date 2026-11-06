#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  getCalendarSourceFiles,
  getCategoryKeys,
  getLanguageKeys,
  getRepositoryRoot,
  loadCalendarEvents
} = require("./calendar-data");
const { buildExpectedIcsFileMap } = require("./generate-ics");

/**
 * Returns the absolute output directory for generated ICS files.
 * @param {string} repositoryRoot Absolute repository root path.
 * @returns {string} Absolute output directory path.
 */
function getIcsOutputDirectory(repositoryRoot) {
  return path.join(repositoryRoot, "ics");
}

/**
 * Returns the expected ICS file names for all supported languages and
 * categories.
 * @param {Record<string, Array<object>>} eventsByLanguage Language-keyed calendar lists.
 * @returns {string[]} Expected ICS file names relative to the ics directory.
 */
function getExpectedIcsFileNames(eventsByLanguage) {
  const languages = getLanguageKeys(eventsByLanguage);
  const categories = getCategoryKeys(eventsByLanguage);
  const fileNames = [];

  languages.forEach(languageKey => {
    fileNames.push("planetenuhr-" + languageKey + "-all.ics");

    categories.forEach(categoryKey => {
      fileNames.push("planetenuhr-" + languageKey + "-" + categoryKey + ".ics");
    });
  });

  return fileNames;
}

/**
 * Returns whether one file exists.
 * @param {string} filePath Absolute file path.
 * @returns {boolean} True when the file exists.
 */
function isExistingFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

/** Removes valid generation stamps before comparing calendar content.
 * A checkout changes source mtimes without changing events; DTSTAMP therefore
 * cannot establish whether committed calendar data is stale.
 * @param {string} content Calendar text with its generated DTSTAMP lines.
 * @returns {string} Calendar text with valid UTC stamps replaced by a marker.
 */
function comparableCalendarContent(content) {
  return content.replace(/\r\n/g, "\n").replace(/^DTSTAMP:\d{8}T\d{6}Z(?=\r?$)/gm, "DTSTAMP:generated");
}

/**
 * Returns the freshness state of the generated ICS files relative to the
 * calendar source files.
 * @param {string} repositoryRoot Absolute repository root path.
 * @returns {{missingFiles:string[], staleFiles:string[], latestSourceTimestamp:Date}} Freshness result.
 */
function getIcsFreshnessState(repositoryRoot) {
  const eventsByLanguage = loadCalendarEvents(repositoryRoot);
  const expectedFileNames = getExpectedIcsFileNames(eventsByLanguage);
  const icsDirectory = getIcsOutputDirectory(repositoryRoot);
  const sourceFiles = getCalendarSourceFiles(repositoryRoot);
  const expectedFiles = buildExpectedIcsFileMap(repositoryRoot);
  let latestSourceTimestamp = new Date(0);
  const missingFiles = [];
  const staleFiles = [];

  sourceFiles.forEach(sourcePath => {
    const stats = fs.statSync(sourcePath);
    if (stats.mtime > latestSourceTimestamp) {
      latestSourceTimestamp = stats.mtime;
    }
  });

  expectedFileNames.forEach(fileName => {
    const filePath = path.join(icsDirectory, fileName);

    if (!isExistingFile(filePath)) {
      missingFiles.push(path.join("ics", fileName));
      return;
    }

    const currentContent = fs.readFileSync(filePath, "utf8");
    const expectedContent = expectedFiles.get(filePath);
    if (comparableCalendarContent(currentContent) !== comparableCalendarContent(expectedContent)) {
      staleFiles.push(path.join("ics", fileName));
    }
  });

  return {
    missingFiles,
    staleFiles,
    latestSourceTimestamp
  };
}

/**
 * Prints a readable command-line summary for the ICS freshness check.
 * @param {{missingFiles:string[], staleFiles:string[], latestSourceTimestamp:Date}} state Freshness result.
 * @returns {void}
 */
function printFreshnessSummary(state) {
  const latestSourceIso = state.latestSourceTimestamp.toISOString();

  console.log("ICS freshness check:");
  console.log("- latest calendar source change: " + latestSourceIso);

  if (state.missingFiles.length > 0) {
    console.log("- missing ICS files:");
    state.missingFiles.forEach(filePath => {
      console.log("  - " + filePath);
    });
  }

  if (state.staleFiles.length > 0) {
    console.log("- stale ICS files:");
    state.staleFiles.forEach(filePath => {
      console.log("  - " + filePath);
    });
  }

  if (state.missingFiles.length === 0 && state.staleFiles.length === 0) {
    console.log("- all ICS files are present and up to date");
  }
}

/**
 * Runs the standalone ICS freshness check.
 * @returns {void}
 */
function main() {
  const repositoryRoot = getRepositoryRoot();
  const state = getIcsFreshnessState(repositoryRoot);

  printFreshnessSummary(state);

  if (state.missingFiles.length > 0 || state.staleFiles.length > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getExpectedIcsFileNames,
  getIcsFreshnessState,
  getIcsOutputDirectory
};
