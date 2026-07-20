#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Returns whether a file should be checked and repaired for mojibake.
 * @param {string} filePath - Absolute or relative file path.
 * @returns {boolean} True when the file extension is part of the text allowlist.
 */
function isSupportedTextFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const supportedExtensions = new Set([
    ".js",
    ".json",
    ".css",
    ".html",
    ".md",
    ".txt",
    ".ps1",
    ".php",
    ".svg",
    ".yml",
    ".yaml",
    ".webmanifest"
  ]);
  return supportedExtensions.has(extension);
}

/**
 * Returns whether a directory should be skipped during the repair scan.
 * @param {string} directoryName - Plain directory name.
 * @returns {boolean} True when the directory should not be scanned.
 */
function shouldSkipDirectory(directoryName) {
  const skippedDirectories = new Set([
    ".git",
    "node_modules",
    "Snapshots"
  ]);
  return skippedDirectories.has(directoryName);
}

/**
 * Walks the repository recursively and collects supported text files.
 * @param {string} directoryPath - Directory that should be scanned.
 * @param {string[]} results - Mutable result array.
 * @returns {string[]} The same result array for convenience.
 */
function collectTextFiles(directoryPath, results) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      if (!shouldSkipDirectory(entry.name)) {
        collectTextFiles(fullPath, results);
      }
      continue;
    }

    if (entry.isFile() && isSupportedTextFile(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Returns the mojibake replacement table copied from the Threadline project and
 * extended with the common patterns found in this repository.
 * Unicode escapes are used intentionally so the repair script never rewrites its
 * own replacement table during a repository-wide run.
 * @returns {Map<string, string>} Map of corrupted text fragments to repaired UTF-8 text.
 */
function getReplacements() {
  return new Map([
    ["\u00c3\u00a4", "\u00e4"],
    ["\u00c3\u0084", "\u00c4"],
    ["\u00c3\u00b6", "\u00f6"],
    ["\u00c3\u0096", "\u00d6"],
    ["\u00c3\u00bc", "\u00fc"],
    ["\u00c3\u009c", "\u00dc"],
    ["\u00c3\u009f", "\u00df"],
    ["\u00c3\u00a9", "\u00e9"],
    ["\u00c3\u00a8", "\u00e8"],
    ["\u00c3\u00aa", "\u00ea"],
    ["\u00c3\u00ab", "\u00eb"],
    ["\u00c3\u00a0", "\u00e0"],
    ["\u00c3\u00a1", "\u00e1"],
    ["\u00c3\u00a2", "\u00e2"],
    ["\u00c3\u00a7", "\u00e7"],
    ["\u00c3\u00ae", "\u00ee"],
    ["\u00c3\u00af", "\u00ef"],
    ["\u00c3\u00b4", "\u00f4"],
    ["\u00c3\u00b9", "\u00f9"],
    ["\u00c3\u00bb", "\u00fb"],
    ["\u00c5\u201c", "\u0153"],
    ["\u00e2\u20ac\u00a6", "\u2026"],
    ["\u00e2\u20ac\u201d", "\u2014"],
    ["\u00e2\u20ac\u201c", "\u2013"],
    ["\u00e2\u20ac\u017e", "\u201e"],
    ["\u00e2\u20ac\u0153", "\u201c"],
    ["\u00e2\u20ac\u009d", "\u201d"],
    ["\u00e2\u20ac\u2122", "\u2019"],
    ["\u00c2\u00b7", "\u00b7"],
    [" \u00c2\u00b7 ", " \u00b7 "],
    ["\u00c2\u00ab", "\u00ab"],
    ["\u00c2\u00bb", "\u00bb"],
    ["\u00c2\u00b1", "\u00b1"],
    ["\u00e2\u2013\u00b6", "\u25b6"],
    ["\u00e2\u2014\u20ac", "\u25c0"],
    ["\u00e2\u2013\u00bc", "\u25bc"],
    ["\u00e2\u2013\u00b2", "\u25b2"],
    ["\u00e2\u00a4\u00b5\u00ef\u00b8\u008f", "\u2935\ufe0f"]
  ]);
}

/**
 * Replaces all occurrences of every mojibake fragment in the provided text.
 * @param {string} text - Original file text.
 * @param {Map<string, string>} replacements - Replacement table.
 * @returns {{ text: string, changed: boolean }} Repaired text and change flag.
 */
function repairText(text, replacements) {
  let nextText = text;
  let changed = false;

  for (const [from, to] of replacements) {
    if (nextText.includes(from)) {
      nextText = nextText.split(from).join(to);
      changed = true;
    }
  }

  return {
    text: nextText,
    changed
  };
}

/**
 * Repairs one file in place when known mojibake fragments are found.
 * @param {string} filePath - File that should be repaired.
 * @param {Map<string, string>} replacements - Replacement table.
 * @returns {boolean} True when the file content changed.
 */
function repairFile(filePath, replacements) {
  const originalText = fs.readFileSync(filePath, "utf8");
  const result = repairText(originalText, replacements);

  if (!result.changed) {
    return false;
  }

  fs.writeFileSync(filePath, result.text, "utf8");
  return true;
}

/**
 * Runs the repository-wide mojibake repair.
 * @returns {void} No return value.
 */
function main() {
  const repositoryRoot = process.cwd();
  const files = collectTextFiles(repositoryRoot, []);
  const replacements = getReplacements();
  const changedFiles = [];

  for (const filePath of files) {
    const changed = repairFile(filePath, replacements);
    if (changed) {
      changedFiles.push(filePath);
    }
  }

  if (changedFiles.length === 0) {
    console.log("No mojibake replacements were needed.");
    return;
  }

  console.log("Repaired mojibake in these files:");
  for (const filePath of changedFiles) {
    console.log(filePath);
  }
}

main();
