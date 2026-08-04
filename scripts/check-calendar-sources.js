#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const {
  getLanguageKeys,
  getRepositoryRoot,
  getSortedLanguageEvents,
  loadCalendarEvents
} = require("./calendar-data");

/**
 * Returns the absolute path of the calendar source manifest file.
 * @param {string} repositoryRoot Absolute repository root path.
 * @returns {string} Absolute JSON manifest path.
 */
function getSourceManifestPath(repositoryRoot) {
  return path.join(repositoryRoot, "calendar-sources.json");
}

/**
 * Loads the JSON manifest that documents source URLs, review cadences and
 * coverage targets for the sky calendar.
 * @param {string} repositoryRoot Absolute repository root path.
 * @returns {object} Parsed manifest object.
 */
function loadSourceManifest(repositoryRoot) {
  const manifestPath = getSourceManifestPath(repositoryRoot);
  const manifestText = fs.readFileSync(manifestPath, "utf8");
  return JSON.parse(manifestText);
}

/**
 * Returns one UTC date object for a YYYY-MM-DD string.
 * @param {string} isoDate Date string in YYYY-MM-DD format.
 * @returns {Date} UTC date object.
 */
function parseIsoDate(isoDate) {
  return new Date(isoDate + "T00:00:00Z");
}

/**
 * Returns the date that results from adding a number of whole days.
 * @param {Date} date Input UTC date.
 * @param {number} dayCount Whole number of days to add.
 * @returns {Date} Shifted UTC date.
 */
function addUtcDays(date, dayCount) {
  const shiftedDate = new Date(date.getTime());
  shiftedDate.setUTCDate(shiftedDate.getUTCDate() + dayCount);
  return shiftedDate;
}

/**
 * Formats a UTC date as YYYY-MM-DD.
 * @param {Date} date UTC date object.
 * @returns {string} Formatted date string.
 */
function formatIsoDate(date) {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

/**
 * Returns today's UTC date truncated to midnight.
 * @returns {Date} Current UTC day without time-of-day noise.
 */
function getTodayUtcDate() {
  const now = new Date();
  return parseIsoDate(formatIsoDate(now));
}

/**
 * Returns whether the command line includes one flag.
 * @param {string[]} argumentsList Raw command-line arguments.
 * @param {string} flagName Flag string such as "--strict".
 * @returns {boolean} True when the flag is present.
 */
function hasFlag(argumentsList, flagName) {
  return argumentsList.includes(flagName);
}

/**
 * Returns a normalized runtime options object for the source check command.
 * @param {string[]} argumentsList Raw command-line arguments.
 * @returns {{strict:boolean, checkLinks:boolean}} Parsed option flags.
 */
function getRuntimeOptions(argumentsList) {
  const strict = hasFlag(argumentsList, "--strict");
  const checkLinks = hasFlag(argumentsList, "--check-links");

  return {
    strict,
    checkLinks
  };
}

/**
 * Validates the basic top-level shape of the source manifest.
 * @param {object} manifest Parsed manifest object.
 * @returns {string[]} Validation errors. Empty when valid.
 */
function validateManifestShape(manifest) {
  const errors = [];

  if (!manifest || typeof manifest !== "object") {
    errors.push("calendar-sources.json is missing or not an object.");
    return errors;
  }

  if (typeof manifest.minimumCoverageDate !== "string") {
    errors.push("calendar-sources.json is missing minimumCoverageDate.");
  }

  if (!Array.isArray(manifest.categories)) {
    errors.push("calendar-sources.json is missing the categories array.");
  }

  if (!Array.isArray(manifest.sources)) {
    errors.push("calendar-sources.json is missing the sources array.");
  }

  return errors;
}

/**
 * Validates one source entry from the manifest.
 * @param {object} sourceEntry One source manifest entry.
 * @returns {string[]} Validation errors for that source.
 */
function validateSourceEntry(sourceEntry) {
  const errors = [];
  const requiredStringFields = [
    "key",
    "label",
    "url",
    "lastReviewed"
  ];

  requiredStringFields.forEach(fieldName => {
    if (typeof sourceEntry[fieldName] !== "string" || sourceEntry[fieldName].trim() === "") {
      errors.push("Source entry is missing " + fieldName + ".");
    }
  });

  if (!Array.isArray(sourceEntry.usedBy) || sourceEntry.usedBy.length === 0) {
    errors.push("Source " + String(sourceEntry.key || "(unknown)") + " must define usedBy.");
  }

  if (!Array.isArray(sourceEntry.categories) || sourceEntry.categories.length === 0) {
    errors.push("Source " + String(sourceEntry.key || "(unknown)") + " must define categories.");
  }

  if (typeof sourceEntry.reviewIntervalDays !== "number" || sourceEntry.reviewIntervalDays <= 0) {
    errors.push("Source " + String(sourceEntry.key || "(unknown)") + " must define a positive reviewIntervalDays value.");
  }

  return errors;
}

/**
 * Validates the manifest entries and returns all schema-level errors.
 * @param {object} manifest Parsed source manifest.
 * @returns {string[]} Validation errors. Empty when valid.
 */
function validateManifestEntries(manifest) {
  const errors = validateManifestShape(manifest);

  if (errors.length > 0) {
    return errors;
  }

  manifest.sources.forEach(sourceEntry => {
    validateSourceEntry(sourceEntry).forEach(errorMessage => {
      errors.push(errorMessage);
    });
  });

  manifest.categories.forEach(categoryEntry => {
    if (typeof categoryEntry.key !== "string" || categoryEntry.key.trim() === "") {
      errors.push("One category entry is missing key.");
    }
    if (typeof categoryEntry.minimumCoverageDate !== "string" || categoryEntry.minimumCoverageDate.trim() === "") {
      errors.push("Category " + String(categoryEntry.key || "(unknown)") + " is missing minimumCoverageDate.");
    }
  });

  return errors;
}

/**
 * Returns the list of source-review entries together with due-date status.
 * @param {object} manifest Parsed source manifest.
 * @param {Date} today Current UTC date.
 * @returns {Array<object>} Review status rows.
 */
function getSourceReviewRows(manifest, today) {
  const rows = [];

  manifest.sources.forEach(sourceEntry => {
    const lastReviewedDate = parseIsoDate(sourceEntry.lastReviewed);
    const nextReviewDate = addUtcDays(lastReviewedDate, sourceEntry.reviewIntervalDays);
    let overdue = false;

    if (nextReviewDate.getTime() < today.getTime()) {
      overdue = true;
    }

    rows.push({
      key: sourceEntry.key,
      label: sourceEntry.label,
      url: sourceEntry.url,
      usedBy: sourceEntry.usedBy,
      categories: sourceEntry.categories,
      lastReviewed: sourceEntry.lastReviewed,
      nextReviewDate: formatIsoDate(nextReviewDate),
      overdue
    });
  });

  return rows;
}

/**
 * Returns the latest event date per language across the merged calendar.
 * @param {Record<string, Array<object>>} eventsByLanguage Language-keyed calendar event lists.
 * @returns {Array<object>} Coverage rows with the latest date per language.
 */
function getLanguageCoverageRows(eventsByLanguage) {
  const rows = [];
  const languageKeys = getLanguageKeys(eventsByLanguage);

  languageKeys.forEach(languageKey => {
    const sortedEvents = getSortedLanguageEvents(eventsByLanguage, languageKey);
    let latestDate = null;

    if (sortedEvents.length > 0) {
      latestDate = sortedEvents[sortedEvents.length - 1].date;
    }

    rows.push({
      languageKey,
      latestDate
    });
  });

  return rows;
}

/**
 * Returns the latest date per language and category for the merged calendar.
 * @param {Record<string, Array<object>>} eventsByLanguage Language-keyed calendar event lists.
 * @param {Array<object>} categoryConfig Category coverage requirements.
 * @returns {Array<object>} Coverage rows for each language/category pair.
 */
function getCategoryCoverageRows(eventsByLanguage, categoryConfig) {
  const rows = [];
  const languageKeys = getLanguageKeys(eventsByLanguage);

  languageKeys.forEach(languageKey => {
    const sortedEvents = getSortedLanguageEvents(eventsByLanguage, languageKey);

    categoryConfig.forEach(categoryEntry => {
      let latestDate = null;

      sortedEvents.forEach(event => {
        if (event.category === categoryEntry.key) {
          latestDate = event.date;
        }
      });

      rows.push({
        languageKey,
        categoryKey: categoryEntry.key,
        minimumCoverageDate: categoryEntry.minimumCoverageDate,
        latestDate
      });
    });
  });

  return rows;
}

/**
 * Converts the coverage rows into human-readable failures.
 * @param {Array<object>} languageRows Per-language coverage rows.
 * @param {Array<object>} categoryRows Per-category coverage rows.
 * @param {string} minimumCoverageDate Global minimum target date.
 * @returns {string[]} Coverage error messages.
 */
function collectCoverageErrors(languageRows, categoryRows, minimumCoverageDate) {
  const errors = [];

  languageRows.forEach(row => {
    if (!row.latestDate) {
      errors.push("Language " + row.languageKey + " has no calendar events.");
      return;
    }

    if (row.latestDate < minimumCoverageDate) {
      errors.push("Language " + row.languageKey + " only reaches " + row.latestDate + " but should reach at least " + minimumCoverageDate + ".");
    }
  });

  categoryRows.forEach(row => {
    if (!row.latestDate) {
      errors.push("Language " + row.languageKey + " has no events for category " + row.categoryKey + ".");
      return;
    }

    if (row.latestDate < row.minimumCoverageDate) {
      errors.push(
        "Language " + row.languageKey
        + " category " + row.categoryKey
        + " only reaches " + row.latestDate
        + " but should reach at least " + row.minimumCoverageDate
        + "."
      );
    }
  });

  return errors;
}

/**
 * Returns the correct HTTP client for one URL string.
 * @param {string} urlString Absolute URL.
 * @returns {typeof http | typeof https} Matching Node HTTP client.
 */
function getHttpClient(urlString) {
  if (urlString.startsWith("https://")) {
    return https;
  }

  return http;
}

/**
 * Performs one URL reachability check with redirect support.
 * @param {string} urlString Absolute source URL to request.
 * @param {number} redirectDepth Current redirect depth.
 * @returns {Promise<object>} Result object with final URL and status.
 */
function requestUrlStatus(urlString, redirectDepth) {
  return new Promise((resolve, reject) => {
    if (redirectDepth > 5) {
      reject(new Error("Too many redirects for " + urlString));
      return;
    }

    const client = getHttpClient(urlString);
    const request = client.request(urlString, { method: "GET", timeout: 15000 }, response => {
      const statusCode = Number(response.statusCode || 0);
      const locationHeader = response.headers.location;

      response.resume();

      if (statusCode >= 300 && statusCode < 400 && locationHeader) {
        const redirectedUrl = new URL(locationHeader, urlString).toString();
        requestUrlStatus(redirectedUrl, redirectDepth + 1).then(resolve).catch(reject);
        return;
      }

      resolve({
        url: urlString,
        finalUrl: urlString,
        statusCode
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error("Timeout while requesting " + urlString));
    });

    request.on("error", reject);
    request.end();
  });
}

/**
 * Checks all configured source URLs for network reachability.
 * @param {Array<object>} sourceEntries Source manifest entries.
 * @returns {Promise<Array<object>>} Result rows for each URL.
 */
async function checkSourceLinks(sourceEntries) {
  const rows = [];

  for (const sourceEntry of sourceEntries) {
    try {
      const result = await requestUrlStatus(sourceEntry.url, 0);
      let ok = false;

      if (result.statusCode >= 200 && result.statusCode < 400) {
        ok = true;
      }

      rows.push({
        key: sourceEntry.key,
        label: sourceEntry.label,
        url: sourceEntry.url,
        statusCode: result.statusCode,
        ok
      });
    } catch (error) {
      rows.push({
        key: sourceEntry.key,
        label: sourceEntry.label,
        url: sourceEntry.url,
        statusCode: 0,
        ok: false,
        error: error.message
      });
    }
  }

  return rows;
}

/**
 * Writes a short Markdown status report into the GitHub Actions step summary
 * when that environment variable is available.
 * @param {Array<object>} reviewRows Source-review rows.
 * @param {Array<object>} languageRows Per-language coverage rows.
 * @param {Array<object>} categoryRows Per-category coverage rows.
 * @param {Array<object>} linkRows Optional link-check rows.
 * @returns {void}
 */
function writeGithubSummary(reviewRows, languageRows, categoryRows, linkRows) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }

  const lines = [];
  lines.push("## Planetenuhr calendar source review");
  lines.push("");
  lines.push("### Sources");
  lines.push("");
  lines.push("| Source | Next review | Status |");
  lines.push("| --- | --- | --- |");

  reviewRows.forEach(row => {
    let statusText = "ok";
    if (row.overdue) {
      statusText = "overdue";
    }

    lines.push("| " + row.label + " | " + row.nextReviewDate + " | " + statusText + " |");
  });

  lines.push("");
  lines.push("### Coverage by language");
  lines.push("");
  lines.push("| Language | Latest event |");
  lines.push("| --- | --- |");

  languageRows.forEach(row => {
    lines.push("| " + row.languageKey + " | " + String(row.latestDate || "-") + " |");
  });

  lines.push("");
  lines.push("### Coverage by category");
  lines.push("");
  lines.push("| Language | Category | Latest event | Target |");
  lines.push("| --- | --- | --- | --- |");

  categoryRows.forEach(row => {
    lines.push("| " + row.languageKey + " | " + row.categoryKey + " | " + String(row.latestDate || "-") + " | " + row.minimumCoverageDate + " |");
  });

  if (Array.isArray(linkRows) && linkRows.length > 0) {
    lines.push("");
    lines.push("### Link check");
    lines.push("");
    lines.push("| Source | Status | URL |");
    lines.push("| --- | --- | --- |");

    linkRows.forEach(row => {
      let statusText = String(row.statusCode);
      if (!row.ok && row.error) {
        statusText = row.error;
      }

      lines.push("| " + row.label + " | " + statusText + " | " + row.url + " |");
    });
  }

  lines.push("");
  fs.writeFileSync(summaryPath, lines.join("\n"), "utf8");
}

/**
 * Prints one readable source review summary to stdout.
 * @param {Array<object>} reviewRows Source-review rows.
 * @returns {void}
 */
function printSourceReviewRows(reviewRows) {
  console.log("Calendar sources:");

  reviewRows.forEach(row => {
    let statusText = "ok";
    if (row.overdue) {
      statusText = "overdue";
    }

    console.log(
      "- " + row.label
      + " | next review " + row.nextReviewDate
      + " | " + statusText
      + " | " + row.url
    );
  });
}

/**
 * Prints coverage information for each language and category.
 * @param {Array<object>} languageRows Per-language coverage rows.
 * @param {Array<object>} categoryRows Per-category coverage rows.
 * @returns {void}
 */
function printCoverageRows(languageRows, categoryRows) {
  console.log("");
  console.log("Calendar coverage by language:");
  languageRows.forEach(row => {
    console.log("- " + row.languageKey + " -> " + String(row.latestDate || "-"));
  });

  console.log("");
  console.log("Calendar coverage by category:");
  categoryRows.forEach(row => {
    console.log(
      "- " + row.languageKey
      + " / " + row.categoryKey
      + " -> " + String(row.latestDate || "-")
      + " (target " + row.minimumCoverageDate + ")"
    );
  });
}

/**
 * Prints optional URL reachability results.
 * @param {Array<object>} linkRows Optional link-check rows.
 * @returns {void}
 */
function printLinkRows(linkRows) {
  if (!Array.isArray(linkRows) || linkRows.length === 0) {
    return;
  }

  console.log("");
  console.log("Source link check:");

  linkRows.forEach(row => {
    let statusText = String(row.statusCode);
    if (!row.ok && row.error) {
      statusText = row.error;
    }

    console.log("- " + row.label + " -> " + statusText + " | " + row.url);
  });
}

/**
 * Collects overdue source-review errors.
 * @param {Array<object>} reviewRows Source-review rows.
 * @returns {string[]} Overdue-source error messages.
 */
function collectReviewErrors(reviewRows) {
  const errors = [];

  reviewRows.forEach(row => {
    if (row.overdue) {
      errors.push("Source review overdue: " + row.label + " should have been reviewed by " + row.nextReviewDate + ".");
    }
  });

  return errors;
}

/**
 * Collects link-check failures.
 * @param {Array<object>} linkRows URL reachability rows.
 * @returns {string[]} Link failure messages.
 */
function collectLinkErrors(linkRows) {
  const errors = [];

  if (!Array.isArray(linkRows)) {
    return errors;
  }

  linkRows.forEach(row => {
    if (!row.ok) {
      if (row.error) {
        errors.push("Source URL failed: " + row.label + " -> " + row.error);
      } else {
        errors.push("Source URL failed: " + row.label + " -> HTTP " + row.statusCode);
      }
    }
  });

  return errors;
}

/**
 * Prints all collected validation errors and returns the proper exit code.
 * @param {string[]} errors Validation and freshness errors.
 * @param {boolean} strict Whether the command should fail on those errors.
 * @returns {void}
 */
function finishRun(errors, strict) {
  if (errors.length === 0) {
    console.log("");
    console.log("Calendar source review passed.");
    return;
  }

  console.log("");
  console.log("Calendar source review found issues:");
  errors.forEach(errorMessage => {
    console.log("- " + errorMessage);
  });

  if (strict) {
    process.exitCode = 1;
  }
}

/**
 * Runs the calendar-source review command.
 * @returns {Promise<void>} Resolves when the command has finished.
 */
async function main() {
  const repositoryRoot = getRepositoryRoot();
  const options = getRuntimeOptions(process.argv.slice(2));
  const today = getTodayUtcDate();
  const manifest = loadSourceManifest(repositoryRoot);
  const schemaErrors = validateManifestEntries(manifest);
  let errors = [];

  if (schemaErrors.length > 0) {
    finishRun(schemaErrors, options.strict);
    return;
  }

  const eventsByLanguage = loadCalendarEvents(repositoryRoot);
  const reviewRows = getSourceReviewRows(manifest, today);
  const languageRows = getLanguageCoverageRows(eventsByLanguage);
  const categoryRows = getCategoryCoverageRows(eventsByLanguage, manifest.categories);
  let linkRows = [];

  printSourceReviewRows(reviewRows);
  printCoverageRows(languageRows, categoryRows);

  if (options.checkLinks) {
    linkRows = await checkSourceLinks(manifest.sources);
    printLinkRows(linkRows);
  }

  writeGithubSummary(reviewRows, languageRows, categoryRows, linkRows);

  collectReviewErrors(reviewRows).forEach(errorMessage => {
    errors.push(errorMessage);
  });

  collectCoverageErrors(languageRows, categoryRows, manifest.minimumCoverageDate).forEach(errorMessage => {
    errors.push(errorMessage);
  });

  collectLinkErrors(linkRows).forEach(errorMessage => {
    errors.push(errorMessage);
  });

  finishRun(errors, options.strict);
}

main().catch(error => {
  console.error("Calendar source review crashed.");
  if (error && error.stack) {
    console.error(error.stack);
  } else {
    console.error(String(error));
  }
  process.exitCode = 1;
});
