/** Curated MMX/IDEFIX milestones, checked 2026-10-19.
 * Arrival/landing windows and preset days are illustrative planning intervals, not confirmed events.
 * Phobos phase zero is arbitrary; the local moon diagram is schematic.
 */
window.PLANETENUHR_IDEFIX_CONFIG = {
  "launch": "2026-10-19T19:41:03Z",
  "timelineEnd": "2031-12-31T23:59:59Z",
  "statusVerifiedAt": "2026-10-19T21:04:00Z",
  "marsArrivalWindow": {
    "start": "2027-08-01T00:00:00Z",
    "end": "2027-08-31T23:59:59Z"
  },
  "roverLandingWindow": {
    "start": "2028-12-01T00:00:00Z",
    "end": "2029-03-31T23:59:59Z",
    "illustrative": true
  },
  "roverSurfaceDays": 100,
  "phobosPeriodDays": 0.31891,
  "phobosPhaseEpoch": "2000-01-01T12:00:00Z",
  "staleAfterDays": 14,
  "links": [
    {
      "key": "jaxa",
      "label": "JAXA · MMX Mission News",
      "url": "https://mmx-news.isas.jaxa.jp/"
    },
    {
      "key": "dlr",
      "label": "DLR · MMX & IDEFIX · 2026",
      "url": "https://www.dlr.de/de/aktuelles/nachrichten/2026/auf-zu-den-marsmonden-mission-mmx-und-rover-idefix-bereit-zum-start"
    },
    {
      "key": "cnes",
      "label": "CNES · MMX",
      "url": "https://cnes.fr/en/projects/mmx"
    },
    {
      "key": "esa",
      "label": "ESA · MMX Mission Timeline",
      "url": "https://www.esa.int/Science_Exploration/Space_Science/Mars_moon_lander_set_to_launch_on_19_October"
    }
  ],
  "references": {
    "launch": "https://mmx-news.isas.jaxa.jp/?p=2753",
    "launchConfirmation": "https://cnes.fr/en/projects/mmx",
    "rover": "https://www.dlr.de/de/aktuelles/nachrichten/2026/auf-zu-den-marsmonden-mission-mmx-und-rover-idefix-bereit-zum-start",
    "phobos": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html?level=1",
    "horizons": "https://ssd-api.jpl.nasa.gov/doc/horizons.html",
    "planning": "https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-239%27&MAKE_EPHEM=%27NO%27"
  },
  "steps": [
    {
      "action": "step",
      "unit": "year",
      "amount": -1,
      "label": "idefix_prev_year"
    },
    {
      "action": "step",
      "unit": "month",
      "amount": -1,
      "label": "idefix_prev_month"
    },
    {
      "action": "step",
      "unit": "day",
      "amount": -1,
      "label": "idefix_prev_day"
    },
    {
      "action": "today",
      "label": "idefix_today"
    },
    {
      "action": "step",
      "unit": "day",
      "amount": 1,
      "label": "idefix_next_day"
    },
    {
      "action": "step",
      "unit": "month",
      "amount": 1,
      "label": "idefix_next_month"
    },
    {
      "action": "step",
      "unit": "year",
      "amount": 1,
      "label": "idefix_next_year"
    },
    {
      "action": "shared",
      "label": "idefix_shared"
    }
  ],
  "presets": [
    {
      "date": "2026-10-19T19:41:03Z",
      "label": "idefix_jump_launch"
    },
    {
      "date": "2027-08-15T12:00:00Z",
      "label": "idefix_jump_mars"
    },
    {
      "date": "2029-02-01T12:00:00Z",
      "label": "idefix_jump_phobos"
    },
    {
      "date": "2031-06-01T12:00:00Z",
      "label": "idefix_jump_return"
    }
  ]
};
