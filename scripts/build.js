#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { getIcsFreshnessState } = require("./check-ics-freshness");
const { checkVersion } = require("./check-version");

/**
 * Returns the repository root based on the current working directory.
 * @returns {string} Absolute path to the repository root.
 */
function getRepositoryRoot() {
  return process.cwd();
}

/**
 * Returns the list of static project files that must exist for a valid build.
 * @returns {string[]} Repository-relative file paths that are required.
 */
function getRequiredFiles() {
  return [
    "index.html",
    "js/core/app.js",
    "js/data/card-sizes-config.js",
    "js/core/card-sizes.js",
    "js/core/card-help.js",
    "js/core/card-navigation.js",
    "js/core/dashboard-context.js",
    "js/core/dashboard-errors.js",
    "js/core/dashboard-refresh.js",
    "js/core/date-location-controls.js",
    "js/cards/solar-system.js",
    "js/cards/earth-moon.js",
    "js/core/dashboard-layout.js",
    "js/core/date-time.js",
    "js/models/astronomy-coordinates.js",
    "js/data/planet-elements-config.js",
    "js/models/planet-model.js",
    "js/models/moon-model.js",
    "js/models/solar-visibility-model.js",
    "js/models/eclipse-model.js",
    "js/models/eclipse-location-model.js",
    "js/core/observation-format.js",
    "version.json",
    "js/core/app-updates.js",
    "css/shared/app-updates.css",
    "css/base/styles.css",
    "css/cards/astronomy-explorer.css",
    "js/data/astronomy-explorer-config.js",
    "js/models/astronomy-explorer-model.js",
    "js/models/conjunction-model.js",
    "js/cards/conjunctions.js",
    "js/cards/meteor-streams.js",
    "js/cards/constellation-month.js",
    "js/cards/constellation-year.js",
    "js/cards/seasons.js",
    "js/models/retrograde-model.js",
    "js/cards/retrograde.js",
    "js/models/inner-planets-model.js",
    "js/cards/inner-planets.js",
    "js/data/barycenter-config.js",
    "js/models/barycenter-model.js",
    "js/cards/barycenter.js",
    "js/models/lagrange-model.js",
    "js/cards/lagrange.js",
    "js/models/analemma-model.js",
    "js/cards/analemma.js",
    "js/models/exoplanets-model.js",
    "js/cards/exoplanets.js",
    "js/models/satellites-model.js",
    "js/cards/satellites.js",
    "js/models/small-bodies-model.js",
    "js/cards/small-bodies.js",
    "js/models/spacecraft-model.js",
    "js/cards/spacecraft.js",
    "js/data/aurora-data-config.js",
    "js/services/aurora-data.js",
    "js/cards/aurora-card.js",
    "js/services/bsky-feed-data.js",
    "js/cards/bsky-feed-card.js",
    "js/models/calendar-model.js",
    "js/cards/calendar.js",
    "js/data/daily-highlights-config.js",
    "js/models/daily-highlights-model.js",
    "js/cards/daily-highlights.js",
    "css/cards/daily-highlights.css",
    "js/shared/daily-highlight-graphics.js",
    "css/shared/daily-highlight-graphics.css",
    "js/shared/direction-compass.js",
    "css/shared/direction-compass.css",
    "js/data/voyager-data.js",
    "js/cards/astronomy-explorer.js",
    "js/data/mnemonics-config.js",
    "js/cards/sky-knowledge.js",
    "js/data/sky-knowledge-graphics-config.js",
    "js/shared/sky-knowledge-graphics.js",
    "css/cards/sky-knowledge.css",
    "js/shared/diagram-details.js",
    "css/shared/diagram-details.css",
    "js/shared/earth-moon-visuals.js",
    "css/shared/earth-moon-visuals.css",
    "js/data/celestial-bodies-config.js",
    "js/shared/celestial-bodies.js",
    "css/shared/celestial-bodies.css",
    "js/shared/solar-system-labels.js",
    "js/data/solar-system-config.js",
    "js/shared/meteor-labels.js",
    "css/shared/meteor-labels.css",
    "js/data/idefix-config.js",
    "js/data/idefix-ephemeris.js",
    "js/models/idefix-model.js",
    "js/cards/idefix.js",
    "css/cards/idefix.css",
    "js/data/translations.js",
    "js/data/card-help-config.js",
    "js/data/calendar-events.js",
    "js/data/phenomena-config.js",
    "js/data/small-bodies-config.js",
    "js/data/bsky-feed-config.js",
    "site.webmanifest",
    "favicon.svg",
    "image_og.jpg"
  ];
}

/**
 * Returns whether a required file exists in the repository.
 * @param {string} repositoryRoot - Absolute repository root path.
 * @param {string} relativeFilePath - Repository-relative file path to check.
 * @returns {boolean} True when the file exists and is a file.
 */
function isExistingFile(repositoryRoot, relativeFilePath) {
  const fullPath = path.join(repositoryRoot, relativeFilePath);

  try {
    return fs.statSync(fullPath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Collects missing required project files.
 * @param {string} repositoryRoot - Absolute repository root path.
 * @param {string[]} requiredFiles - Repository-relative file paths that must exist.
 * @returns {string[]} Missing repository-relative file paths.
 */
function collectMissingFiles(repositoryRoot, requiredFiles) {
  const missingFiles = [];

  for (const relativeFilePath of requiredFiles) {
    if (!isExistingFile(repositoryRoot, relativeFilePath)) {
      missingFiles.push(relativeFilePath);
    }
  }

  return missingFiles;
}

/**
 * Prints a human-readable build summary and sets the proper exit code.
 * @param {string[]} missingFiles - Missing repository-relative file paths.
 * @param {{missingFiles:string[], staleFiles:string[]}} icsState Current ICS freshness state.
 * @returns {void} No return value.
 */
function finishBuild(missingFiles, icsState) {
  if (
    missingFiles.length === 0
    && icsState.missingFiles.length === 0
    && icsState.staleFiles.length === 0
  ) {
    console.log("Build validation passed. Required static files are present, ICS files are up to date and encoding was checked in prebuild.");
    return;
  }

  console.error("Build validation failed.");

  if (missingFiles.length > 0) {
    console.error("Missing required files:");
    for (const relativeFilePath of missingFiles) {
      console.error("- " + relativeFilePath);
    }
  }

  if (icsState.missingFiles.length > 0) {
    console.error("Missing generated ICS files:");
    icsState.missingFiles.forEach(filePath => {
      console.error("- " + filePath);
    });
  }

  if (icsState.staleFiles.length > 0) {
    console.error("Outdated ICS files:");
    icsState.staleFiles.forEach(filePath => {
      console.error("- " + filePath);
    });
  }

  if (icsState.missingFiles.length > 0 || icsState.staleFiles.length > 0) {
    console.error("Run `npm run build:ics` after calendar changes.");
  }

  process.exitCode = 1;
}

/**
 * Runs the static-site build validation for this repository.
 * @returns {void} No return value.
 */
function main() {
  const repositoryRoot = getRepositoryRoot();
  const requiredFiles = getRequiredFiles();
  const missingFiles = collectMissingFiles(repositoryRoot, requiredFiles);
  const icsState = getIcsFreshnessState(repositoryRoot);
  const versionErrors = checkVersion(repositoryRoot);
  if (versionErrors.length) {
    versionErrors.forEach(error => console.error(error));
    process.exitCode = 1;
    return;
  }
  finishBuild(missingFiles, icsState);
}

main();
