#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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
    "translations.js",
    "card-help-config.js",
    "calendar-events.js",
    "phenomena-config.js",
    "small-bodies-config.js",
    "bsky-feed-config.js",
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
 * @returns {void} No return value.
 */
function finishBuild(missingFiles) {
  if (missingFiles.length === 0) {
    console.log("Build validation passed. Required static files are present and encoding was checked in prebuild.");
    return;
  }

  console.error("Build validation failed. Missing required files:");
  for (const relativeFilePath of missingFiles) {
    console.error("- " + relativeFilePath);
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
  finishBuild(missingFiles);
}

main();
