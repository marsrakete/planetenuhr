#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { getIcsFreshnessState } = require("./check-ics-freshness");

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
    "styles.css",
    "astronomy-explorer.css",
    "astronomy-explorer-config.js",
    "astronomy-explorer-model.js",
    "astronomy-explorer.js",
    "mnemonics-config.js",
    "sky-knowledge.js",
    "sky-knowledge-graphics-config.js",
    "sky-knowledge-graphics.js",
    "sky-knowledge.css",
    "diagram-details.js",
    "diagram-details.css",
    "earth-moon-visuals.js",
    "earth-moon-visuals.css",
    "idefix-config.js",
    "idefix-ephemeris.js",
    "idefix-model.js",
    "idefix.js",
    "idefix.css",
    "translations.js",
    "card-help-config.js",
    "calendar-events.js",
    "phenomena-config.js",
    "small-bodies-config.js",
    "bsky-feed-config.js",
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
  finishBuild(missingFiles, icsState);
}

main();
