/** NASA solar-distance baseline. Regenerate with node scripts/update-voyager-data.js. */
window.PLANETENUHR_VOYAGER_DATA = {
  "source": "NASA Eyes / Voyager mission status",
  "sourceUrl": "https://eyes.nasa.gov/assets/dynamic/dynamo/sc_voyager_1/now.json",
  "statusUrl": "https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/",
  "methodUrl": "https://science.nasa.gov/specials/apps/voyager-vital-signs/assets/javascripts/vital_signs.js",
  "milestoneUrl": "https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/",
  "retrievedAt": "2026-10-26T13:29:52.931Z",
  "units": "km",
  "timeScale": "Unix UTC seconds",
  "method": "Linear solar-distance estimate from two NASA samples; not live telemetry or a full trajectory.",
  "maximumOffsetSeconds": 157788000,
  "samples": [
    {
      "timeUnix": 1792959437.037,
      "distanceKm": 25754670945.328
    },
    {
      "timeUnix": 1793045837.036,
      "distanceKm": 25756129516.912
    }
  ]
};
