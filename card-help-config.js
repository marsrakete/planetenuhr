window.PLANETENUHR_CARD_HELP = {
  en: {
    sections: {
      button: "More info",
      title: "About this card",
      overview: "Overview",
      formulas: "Formulas used",
      details: "Data & notes",
      links: "Sources & further reading"
    },
    cards: {
      time: {
        intro: [
          "This card combines the live clock, stopwatch, countdown and display settings in one place.",
          "It is mostly browser-driven UI logic, so it reacts instantly without external data."
        ],
        details: [
          "The live time follows the selected time zone setting.",
          "Stopwatch and countdown run locally in the browser."
        ]
      },
      date_location: {
        intro: [
          "This card controls the shared date for the astronomy tiles and the observing location for location-dependent views.",
          "Changing the date updates the solar system, season, moon, visibility and daylight panels together."
        ],
        formulas: [
          { expr: "t<sub>selected</sub> = t<sub>now</sub> + &Delta;d &middot; 86400 s", note: "Date offset in whole days." }
        ],
        details: [
          "The slider keeps the original range of -100 to +100 years.",
          "The city selector currently offers ten major German cities, but keeps the page time zone unchanged."
        ],
        links: [
          { label: "JPL approximate planetary positions", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NOAA solar calculation details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" }
        ]
      },
      solar_system: {
        intro: [
          "This is a heliocentric, top-down ecliptic view of the eight planets for the selected date.",
          "Distances are visually compressed so that the outer planets still fit in one compact disc."
        ],
        formulas: [
          { expr: "T = (JD - 2451545.0) / 36525", note: "Centuries since J2000.0." },
          { expr: "M = L - &varpi;", note: "Mean anomaly from mean longitude and longitude of perihelion." },
          { expr: "x' = a(cos E - e), &nbsp; y' = a&radic;(1-e<sup>2</sup>) sin E", note: "Orbital-plane coordinates after solving Kepler's equation." }
        ],
        details: [
          "The orbital elements follow the JPL low-accuracy Keplerian approximation that is suitable for overview graphics.",
          "The view is schematic, but it stays date-coupled and consistent across the app."
        ],
        links: [
          { label: "JPL approximate positions of the planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "JPL Horizons ephemeris system", url: "https://ssd.jpl.nasa.gov/horizons/" }
        ]
      },
      small_bodies: {
        intro: [
          "This card collects selected famous comet orbits together with the asteroid belt and the Kuiper belt.",
          "The geometry is strongly compressed so long-period comets, sungrazers and belt regions can share one readable view."
        ],
        formulas: [
          { expr: "a = (q + Q) / 2", note: "Semi-major axis from perihelion q and aphelion Q." },
          { expr: "e = (Q - q) / (Q + q)", note: "Eccentricity derived from q and Q." },
          { expr: "r<sub>plot</sub> = R<sub>max</sub> &radic;( clamp(r, 0.02, 60) / 60 )", note: "Display compression used for the small-body map." }
        ],
        details: [
          "The card currently includes 20 named comets, including Halley, Hale-Bopp, Hyakutake, NEOWISE and ISON.",
          "The asteroid belt is shown at 2.1-3.3 AU and the Kuiper belt at 30-50 AU."
        ],
        links: [
          { label: "JPL Small-Body Database", url: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html" },
          { label: "NASA: Asteroids, Comets & Meteors", url: "https://science.nasa.gov/solar-system/asteroids-comets-and-meteors/" }
        ]
      },
      meteor_streams: {
        intro: [
          "The large ring shows when major meteor streams are active during the year; the separate radiant panel shows where they appear to come from in the sky.",
          "These are calendar and sky-position guides, not photographic all-sky maps."
        ],
        formulas: [
          { expr: "f<sub>year</sub> = (DOY - 1) / daysInYear", note: "Maps a calendar day onto the annual ring." }
        ],
        details: [
          "Colored arcs mark activity windows; the small peak dots mark the best-known peak dates.",
          "Radiants are shown schematically by azimuth and altitude for a Central European reading."
        ],
        links: [
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" },
          { label: "International Meteor Organization calendar", url: "https://www.imo.net/resources/calendar/" }
        ]
      },
      constellation_month: {
        intro: [
          "This monthly card highlights one easy seasonal constellation with a simplified stick figure and named stars.",
          "It is meant as a friendly orientation aid, not as a complete star atlas."
        ],
        details: [
          "The chosen object depends on the month and is tuned for a Central European seasonal reading.",
          "Named stars are placed to stay legible on small screens."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "IAU Working Group on Star Names", url: "https://www.iau.org/science/scientific_bodies/working_groups/280/" }
        ]
      },
      season_axis: {
        intro: [
          "This card combines a top-down orbit view with a side inset that shows the Sun angle relative to Earth's tilted axis.",
          "Together they explain why the same date can mean long bright days in one part of the year and short low-Sun days in another."
        ],
        formulas: [
          { expr: "f = (DOY - 1) / daysInYear", note: "Year progress since January 1." },
          { expr: "&delta; &asymp; 23.44&deg; &middot; sin( 2&pi;(DOY - 80) / daysInYear )", note: "Approximate solar declination used for the side inset." }
        ],
        details: [
          "The percentage is year progress, not a strength value.",
          "The side inset changes with the selected date, so the Sun angle follows the seasonal cycle."
        ],
        links: [
          { label: "NOAA solar calculation details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "NASA Space Place: What causes the seasons?", url: "https://spaceplace.nasa.gov/seasons/en/" }
        ]
      },
      spacecraft: {
        intro: [
          "This card places a few major probes around the Sun in a schematic top-down view.",
          "It is designed for relative scale and mission context, not for exact navigation."
        ],
        formulas: [
          { expr: "r<sub>plot</sub> = R<sub>max</sub> log(1 + r) / log(1 + r<sub>max</sub>)", note: "Logarithmic compression for heliocentric distance in AU." }
        ],
        details: [
          "The list currently includes Parker Solar Probe, BepiColombo, JUICE, Juno, Europa Clipper, New Horizons, Pioneer 10/11 and the Voyagers.",
          "Curved tracks are stylized flight paths to keep labels readable."
        ],
        links: [
          { label: "JPL Horizons ephemeris system", url: "https://ssd.jpl.nasa.gov/horizons/" },
          { label: "NASA mission overview", url: "https://science.nasa.gov/solar-system/" }
        ]
      },
      visibility: {
        intro: [
          "This card estimates whether a planet is better placed in the morning or evening sky for the chosen date and city.",
          "It is a quick visual guide, not a full observing planner."
        ],
        formulas: [
          { expr: "elongation = &lambda;<sub>body</sub> - &lambda;<sub>sun</sub>", note: "Signed solar elongation in ecliptic longitude." }
        ],
        details: [
          "Positive elongation is treated as evening visibility, negative elongation as morning visibility.",
          "Clouds, local horizon, brightness and light pollution are not modeled here."
        ],
        links: [
          { label: "JPL approximate positions of the planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" }
        ]
      },
      moon_nodes: {
        intro: [
          "This card combines the Moon's node geometry with an approximate eclipse-season cycle tied to the selected date.",
          "It helps explain why eclipses cluster in seasons instead of being possible every month."
        ],
        formulas: [
          { expr: "d<sub>node</sub> = min(f, 1-f) &middot; 27.2122 d", note: "Approximate distance to the nearest lunar node from the draconic phase f." },
          { expr: "d<sub>season</sub> = min(s, P-s), &nbsp; P &asymp; 173.31 d", note: "Approximate distance to the nearest eclipse-season center." }
        ],
        details: [
          "The inner orbit shows where the Moon sits relative to the node line on the selected date.",
          "The outer season ring uses a repeating eclipse-season approximation; it is designed as an educational timing aid."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" }
        ]
      },
      conjunctions: {
        intro: [
          "This card scans a time window around the selected date and marks approximate minima in the angular separation between planets.",
          "It is meant as a quick event view for close pairings, not as an observatory-grade ephemeris."
        ],
        formulas: [
          { expr: "&Delta; = | signed( &lambda;<sub>A</sub> - &lambda;<sub>B</sub> ) |", note: "Angular separation in ecliptic longitude between two planets." }
        ],
        details: [
          "The timeline searches for local minima of the separation curve within the selected date window.",
          "Values are approximate and best used as guidance for interesting dates."
        ],
        links: [
          { label: "JPL approximate positions of the planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" }
        ]
      },
      retrograde: {
        intro: [
          "This card tracks whether a planet is currently in direct or retrograde apparent motion as seen from Earth.",
          "Retrograde here means a temporary westward drift against the star background caused by changing viewing geometry."
        ],
        formulas: [
          { expr: "&Delta;&lambda; / day = signed( &lambda;<sub>geo</sub>(t+1d) - &lambda;<sub>geo</sub>(t-1d) ) / 2", note: "Approximate daily apparent motion from geocentric longitude." }
        ],
        details: [
          "Nearby stations are found by scanning for sign changes in the apparent motion.",
          "The yellow points on the path mark the two stations where the apparent motion changes direction.",
          "The blue point marks the planet's current position inside the displayed path window.",
          "The values are approximate, but they are date-coupled and good for dashboard context."
        ],
        links: [
          { label: "JPL approximate positions of the planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "Star Walk: Retrograde motion demystified", url: "https://starwalk.space/de/infographics/retrograde-motion-demystified" }
        ]
      },
      inner_phases: {
        intro: [
          "Mercury and Venus show phases because we observe them from outside their orbits around the Sun.",
          "The card links phase, elongation and the familiar morning-star or evening-star appearance."
        ],
        formulas: [
          { expr: "k = (1 + cos i) / 2", note: "Illuminated fraction k from phase angle i at the planet." }
        ],
        details: [
          "A thin crescent usually means the planet is closer to inferior conjunction and visually larger in the telescope.",
          "Larger elongation usually means easier evening or morning visibility."
        ],
        links: [
          { label: "NASA: Mercury", url: "https://science.nasa.gov/mercury/" },
          { label: "NASA: Venus", url: "https://science.nasa.gov/venus/" },
          { label: "JPL approximate positions of the planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      constellation_year: {
        intro: [
          "This annual wheel places the monthly constellation highlights around the full year.",
          "It helps show how the seasonal sky rotates through the calendar instead of treating each month as an isolated card."
        ],
        details: [
          "The highlighted marker follows the selected date around the year circle.",
          "The underlying monthly sequence comes from the same curated constellation list as the monthly card."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "IAU Working Group on Star Names", url: "https://www.iau.org/science/scientific_bodies/working_groups/280/" }
        ]
      },
      night_visibility: {
        intro: [
          "This card stretches the selected night from dusk to dawn and estimates when each bright planet is up.",
          "It is intentionally approximate, but far more informative than a simple morning/evening label."
        ],
        formulas: [
          { expr: "t<sub>transit</sub> &asymp; 12h + elongation / 15", note: "Approximate transit time from solar elongation." },
          { expr: "t<sub>rise,set</sub> &asymp; t<sub>transit</sub> &plusmn; 6h", note: "Simple horizon estimate used for the nightly visibility strips." }
        ],
        details: [
          "Bars are clipped to the dark-night interval between evening twilight and morning twilight.",
          "This is a geometric quick-look, not a full altitude/azimuth simulation."
        ],
        links: [
          { label: "NOAA solar calculation details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "JPL approximate positions of the planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      satellites: {
        intro: [
          "This card shows a few bright or well-known Earth-orbiting spacecraft in schematic low-Earth orbits.",
          "The markers move with the selected date, but they are not live-tracked positions from fresh TLE data."
        ],
        formulas: [
          { expr: "phase = frac( phase<sub>0</sub> + (t - t<sub>0</sub>) / P )", note: "Mean orbital phase from a reference epoch and orbital period P." }
        ],
        details: [
          "Altitude, period and inclination are shown for orientation.",
          "The drawn orbital planes are stylized so multiple satellites remain readable in one card."
        ],
        links: [
          { label: "NASA: International Space Station", url: "https://www.nasa.gov/international-space-station/" },
          { label: "ESA: Hubble Space Telescope", url: "https://esahubble.org/" },
          { label: "heute-am-himmel.de: ISS", url: "https://www.heute-am-himmel.de/iss" }
        ]
      },
      aurora: {
        intro: [
          "This card estimates today's aurora chance for Germany from live space-weather data.",
          "It is intentionally not tied to the date slider because the input is real-time rather than historical."
        ],
        details: [
          "The current implementation uses the latest NOAA SWPC planetary Kp data and translates it into a Germany-focused quick read.",
          "A strong Kp does not guarantee visibility; darkness, clear skies and geomagnetic timing still matter."
        ],
        links: [
          { label: "NOAA SWPC", url: "https://www.swpc.noaa.gov/" },
          { label: "NOAA SWPC products", url: "https://services.swpc.noaa.gov/" }
        ]
      },
      jupiter: {
        intro: [
          "This card shows Jupiter with 10 selected moons in accelerated, illustrative motion.",
          "It is intentionally readable first and physically exact second."
        ],
        formulas: [
          { expr: "T<sup>2</sup> &prop; a<sup>3</sup>", note: "Kepler's third law explains why outer moons move more slowly." }
        ],
        details: [
          "The card highlights the four Galilean moons plus a few additional well-known satellites.",
          "NASA lists 101 confirmed moons for Jupiter; only a curated subset is drawn here."
        ],
        links: [
          { label: "NASA: Jupiter moons", url: "https://science.nasa.gov/jupiter/jupiter-moons/" },
          { label: "JPL planetary satellites", url: "https://ssd.jpl.nasa.gov/sats/elem/" }
        ]
      },
      earth_moon: {
        intro: [
          "This card bundles three closely related views: the Earth-Moon phase scene, eclipse geometry, and daylight information for the selected city.",
          "It is the most date-sensitive tile in the dashboard."
        ],
        formulas: [
          { expr: "age = ((t - t<sub>0</sub>) mod 29.530588861 d)", note: "Moon age from a reference new moon and the synodic month." },
          { expr: "illum = 0.5 (1 - cos(2&pi;f))", note: "Illuminated fraction from lunar phase fraction f." },
          { expr: "cos H = (cos Z - sin &delta; sin &phi;) / (cos &delta; cos &phi;)", note: "Solar event relation behind sunrise, sunset and twilight times." }
        ],
        details: [
          "The eclipse panel checks new/full moon geometry together with node proximity, so it shows when eclipse conditions are favorable.",
          "Sunrise, sunset, dawn, dusk, blue hour and golden hour are recomputed for the currently selected German city."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NOAA solar calculation details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" }
        ]
      },
      planet_systems: {
        intro: [
          "This comparison card sketches selected moon systems of Mars, Saturn, Uranus and Neptune side by side.",
          "It is meant to show scale families and naming anchors rather than full satellite catalogs."
        ],
        formulas: [
          { expr: "T<sup>2</sup> &prop; a<sup>3</sup>", note: "The same orbital rule shapes all planetary moon systems." }
        ],
        details: [
          "The current totals used in the legend are Mars 2, Saturn 274, Uranus 28 and Neptune 16.",
          "Only a readable subset is labeled in the mini-systems."
        ],
        links: [
          { label: "NASA: Saturn moons", url: "https://science.nasa.gov/saturn/moons/" },
          { label: "NASA: Uranus moons", url: "https://science.nasa.gov/uranus/moons/" },
          { label: "NASA: Neptune moons", url: "https://science.nasa.gov/neptune/moons/" }
        ]
      },
      sky_calendar: {
        intro: [
          "The sky calendar is a curated event list for eclipses, meteor peaks, lunar milestones, planetary highlights and seasonal markers.",
          "Filters let you focus on one topic while the next-event line keeps the closest upcoming item in view."
        ],
        details: [
          "The calendar data is maintained in a dedicated config file and currently spans 2026 through January 2028.",
          "This card is editorially curated, so it can mix computed timing with hand-written observing notes."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" }
        ]
      },
      bsky_feed: {
        intro: [
          "This card shows the newest image post for each configured Bluesky account, together with avatar and post date.",
          "If no image post exists for today, it can fall back to the latest image post instead."
        ],
        details: [
          "The card is hidden when the page is opened via file:// because feed fetching should not run there.",
          "Every account entry is rendered separately, so multiple sources can stack in one scrollable tile."
        ],
        links: [
          { label: "Bluesky public feed API", url: "https://docs.bsky.app/docs/api/app-bsky-feed-get-author-feed" },
          { label: "Bluesky endpoints reference", url: "https://docs.bsky.app/" }
        ]
      }
    }
  },
  de: {
    sections: {
      button: "Mehr Info",
      title: "Diese Kachel erklärt",
      overview: "Kurz erklärt",
      formulas: "Verwendete Formeln",
      details: "Daten & Hinweise",
      links: "Quellen & Vertiefung"
    },
    cards: {
      time: {
        intro: [
          "Diese Kachel bündelt Live-Uhr, Stoppuhr, Countdown und Darstellungsoptionen an einer Stelle.",
          "Sie arbeitet fast nur mit Browser-Logik und reagiert deshalb ohne externe Daten sofort."
        ],
        details: [
          "Die Live-Zeit folgt der gewählten Zeitzone.",
          "Stoppuhr und Countdown laufen lokal im Browser."
        ]
      },
      date_location: {
        intro: [
          "Diese Kachel steuert das gemeinsame Datum für die Astronomie-Karten und den Beobachtungsort für ortsabhängige Ansichten.",
          "Wenn hier das Datum geändert wird, aktualisieren sich Sonnensystem, Jahreszeiten, Mond, Sichtbarkeit und Tageslicht gemeinsam."
        ],
        formulas: [
          { expr: "t<sub>ausgewahlt</sub> = t<sub>jetzt</sub> + &Delta;d &middot; 86400 s", note: "Datumsverschiebung in ganzen Tagen." }
        ],
        details: [
          "Der Slider behält bewusst die urspruengliche Spanne von -100 bis +100 Jahren.",
          "Die Ortswahl bietet aktuell zehn grosse deutsche Städte; die Seiten-Zeitzone selbst bleibt dabei unverändert."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" }
        ]
      },
      solar_system: {
        intro: [
          "Hier siehst du die acht Planeten heliozentrisch in einer Draufsicht auf die Ekliptik für das gewählte Datum.",
          "Die Abstände sind optisch komprimiert, damit auch die äusseren Planeten noch in eine kompakte Kreisfläche passen."
        ],
        formulas: [
          { expr: "T = (JD - 2451545.0) / 36525", note: "Jahrhunderte seit J2000.0." },
          { expr: "M = L - &varpi;", note: "Mittlere Anomalie aus mittlerer Länge und Perihellänge." },
          { expr: "x' = a(cos E - e), &nbsp; y' = a&radic;(1-e<sup>2</sup>) sin E", note: "Koordinaten in der Bahnebene nach der Lösung der Kepler-Gleichung." }
        ],
        details: [
          "Die Bahnelemente folgen der JPL-Näherung mit keplerschen Elementen für Übersichtsdarstellungen.",
          "Die Karte ist schematisch, bleibt aber datumsgekoppelt und innerhalb der App konsistent."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "JPL Horizons", url: "https://ssd.jpl.nasa.gov/horizons/" }
        ]
      },
      small_bodies: {
        intro: [
          "Diese Kachel versammelt ausgewählte berühmte Kometenbahnen zusammen mit Asteroidengürtel und Kuipergürtel.",
          "Die Darstellung ist stark komprimiert, damit langperiodische Kometen, Sungrazer und Gürtelregionen zugleich lesbar bleiben."
        ],
        formulas: [
          { expr: "a = (q + Q) / 2", note: "Grosse Halbachse aus Perihel q und Aphel Q." },
          { expr: "e = (Q - q) / (Q + q)", note: "Exzentrizität aus q und Q." },
          { expr: "r<sub>plot</sub> = R<sub>max</sub> &radic;( clamp(r, 0.02, 60) / 60 )", note: "Verwendete Kompression für die Kleinkörper-Karte." }
        ],
        details: [
          "Aktuell sind 20 benannte Kometen enthalten, darunter Halley, Hale-Bopp, Hyakutake, NEOWISE und ISON.",
          "Der Asteroidengürtel wird bei 2.1-3.3 AE gezeigt, der Kuipergürtel bei 30-50 AE."
        ],
        links: [
          { label: "JPL Small-Body Database", url: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html" },
          { label: "NASA: Asteroids, Comets & Meteors", url: "https://science.nasa.gov/solar-system/asteroids-comets-and-meteors/" }
        ]
      },
      meteor_streams: {
        intro: [
          "Der grosse Ring zeigt, wann wichtige Meteorströme im Jahreslauf aktiv sind; das separate Radiantenfeld zeigt, aus welcher Himmelsrichtung sie scheinbar kommen.",
          "Das ist ein Kalender- und Orientierungstool, keine fotografische Himmelskarte."
        ],
        formulas: [
          { expr: "f<sub>Jahr</sub> = (DOY - 1) / daysInYear", note: "Ordnet einen Kalendertag auf den Jahresring ab." }
        ],
        details: [
          "Farbige Bögen markieren Aktivitätsfenster; die kleinen Punkte markieren die Peak-Daten.",
          "Die Radianten sind schematisch über Azimut und Höhe für eine mitteleuropäische Lesart angeordnet."
        ],
        links: [
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" },
          { label: "International Meteor Organization", url: "https://www.imo.net/resources/calendar/" }
        ]
      },
      constellation_month: {
        intro: [
          "Diese Monats-Kachel hebt jeweils ein gut auffindbares saisonales Sternbild mit vereinfachter Linienfigur und Sternnamen hervor.",
          "Sie ist als freundliche Orientierung gedacht und nicht als vollständiger Sternatlas."
        ],
        details: [
          "Die Auswahl richtet sich nach dem Monat und ist auf eine mitteleuropäische Saison-Lesart abgestimmt.",
          "Sternnamen werden so gesetzt, dass sie auch auf kleineren Displays möglichst lesbar bleiben."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "IAU Working Group on Star Names", url: "https://www.iau.org/science/scientific_bodies/working_groups/280/" }
        ]
      },
      season_axis: {
        intro: [
          "Diese Kachel verbindet eine Draufsicht auf die Erdbahn mit einer seitlichen Nebenansicht für den Sonnenstand relativ zur Erdachse.",
          "Zusammen erklärt beides, warum dieselbe Erde im Jahreslauf mal lange helle und mal kurze tiefe Sonnentage hat."
        ],
        formulas: [
          { expr: "f = (DOY - 1) / daysInYear", note: "Jahresfortschritt seit dem 1. Januar." },
          { expr: "&delta; &asymp; 23.44&deg; &middot; sin( 2&pi;(DOY - 80) / daysInYear )", note: "Vereinfachte Solardeklination für die Nebenansicht." }
        ],
        details: [
          "Die Prozentangabe ist der Jahresfortschritt, kein Stärkewert.",
          "Die seitliche Ansicht ändert sich mit dem gewählten Datum, der Sonnenwinkel läuft also wirklich durch den Jahreszyklus."
        ],
        links: [
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "NASA Space Place: Why do we have seasons?", url: "https://spaceplace.nasa.gov/seasons/en/" }
        ]
      },
      spacecraft: {
        intro: [
          "Diese Kachel setzt einige wichtige Raumsonden in einer schematischen Draufsicht um die Sonne.",
          "Sie ist für Relationen und Missionskontext gebaut, nicht für exakte Navigation."
        ],
        formulas: [
          { expr: "r<sub>plot</sub> = R<sub>max</sub> log(1 + r) / log(1 + r<sub>max</sub>)", note: "Logarithmische Kompression für die heliozentrische Distanz in AE." }
        ],
        details: [
          "Enthalten sind aktuell Parker Solar Probe, BepiColombo, JUICE, Juno, Europa Clipper, New Horizons, Pioneer 10/11 und die Voyagers.",
          "Die gekrümmten Linien sind stilisierte Flugbahnen, damit Marker und Labels lesbar bleiben."
        ],
        links: [
          { label: "JPL Horizons", url: "https://ssd.jpl.nasa.gov/horizons/" },
          { label: "NASA Solar System", url: "https://science.nasa.gov/solar-system/" }
        ]
      },
      visibility: {
        intro: [
          "Diese Kachel schätzt, ob ein Planet am gewählten Datum und Ort eher morgens oder eher abends gut steht.",
          "Sie ist eine schnelle visuelle Orientierung und kein vollwertiger Beobachtungsplaner."
        ],
        formulas: [
          { expr: "Elongation = &lambda;<sub>Planet</sub> - &lambda;<sub>Sonne</sub>", note: "Vorzeichenbehaftete solare Elongation in ekliptischer Länge." }
        ],
        details: [
          "Positive Elongation wird als Abendsichtbarkeit, negative als Morgensichtbarkeit gelesen.",
          "Wolken, lokaler Horizont, Helligkeit und Lichtverschmutzung werden hier nicht modelliert."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" }
        ]
      },
      moon_nodes: {
        intro: [
          "Diese Kachel verbindet die Mondknoten-Geometrie mit einem angenäherten Finsternis-Saison-Zyklus für das gewählte Datum.",
          "So wird sichtbar, warum Finsternisse in Saisonfenstern auftreten und nicht einfach jeden Monat."
        ],
        formulas: [
          { expr: "d<sub>Knoten</sub> = min(f, 1-f) &middot; 27.2122 d", note: "Genäherte Distanz zum nächsten Mondknoten aus der drakonitischen Phase f." },
          { expr: "d<sub>Saison</sub> = min(s, P-s), &nbsp; P &asymp; 173.31 d", note: "Genäherte Distanz zum nächsten Saisonzentrum." }
        ],
        details: [
          "Die innere Bahn zeigt die Stellung des Mondes relativ zur Knotenlinie am gewählten Datum.",
          "Der äußere Ring nutzt eine wiederholte Saison-Näherung und ist als didaktische Zeitansicht gedacht."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" }
        ]
      },
      conjunctions: {
        intro: [
          "Diese Kachel durchsucht ein Zeitfenster rund um das gewählte Datum und markiert angenäherte Minima im Winkelabstand zwischen Planeten.",
          "Sie ist als schnelle Ereignisansicht für enge Begegnungen gedacht, nicht als observatoriumsgenaue Ephemeride."
        ],
        formulas: [
          { expr: "&Delta; = | signed( &lambda;<sub>A</sub> - &lambda;<sub>B</sub> ) |", note: "Winkelabstand in ekliptischer Länge zwischen zwei Planeten." }
        ],
        details: [
          "Die Zeitachse sucht lokale Minima der Abstandskurve innerhalb des gewählten Fensters.",
          "Die Werte sind angenähert und vor allem als Hinweis auf interessante Daten gedacht."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" }
        ]
      },
      retrograde: {
        intro: [
          "Diese Kachel verfolgt, ob ein Planet aus Sicht der Erde gerade direkte oder retrograde scheinbare Bewegung zeigt.",
          "Retrograd bedeutet hier eine temporäre westwärtige Drift vor dem Sternhintergrund durch Veränderungen der Beobachtungsgeometrie."
        ],
        formulas: [
          { expr: "&Delta;&lambda; / Tag = signed( &lambda;<sub>geo</sub>(t+1d) - &lambda;<sub>geo</sub>(t-1d) ) / 2", note: "Genäherte tägliche Scheinbewegung aus der geozentrischen Länge." }
        ],
        details: [
          "Nahe Stationen werden über Vorzeichenwechsel der Scheinbewegung gesucht.",
          "Die gelben Punkte auf dem Pfad markieren die beiden Stationen, an denen die scheinbare Bewegung die Richtung wechselt.",
          "Der blaue Punkt markiert die aktuelle Position des Planeten innerhalb des angezeigten Pfadfensters.",
          "Die Werte sind angenähert, aber datumsgekoppelt und für eine Dashboard-Lesart gut geeignet."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "Star Walk: Retrograde Motion", url: "https://starwalk.space/de/infographics/retrograde-motion-demystified" }
        ]
      },
      inner_phases: {
        intro: [
          "Merkur und Venus zeigen Phasen, weil wir beide Planeten von ausserhalb ihrer Sonnenbahnen beobachten.",
          "Die Kachel verbindet Phase, Elongation und die typische Erscheinung als Morgen- oder Abendstern."
        ],
        formulas: [
          { expr: "k = (1 + cos i) / 2", note: "Beleuchteter Anteil k aus dem Phasenwinkel i am Planeten." }
        ],
        details: [
          "Eine schmale Sichel bedeutet meist Nähe zur unteren Konjunktion und teleskopisch einen größeren scheinbaren Durchmesser.",
          "Grössere Elongation bedeutet oft bessere Sichtbarkeit am Morgen- oder Abendhimmel."
        ],
        links: [
          { label: "NASA: Mercury", url: "https://science.nasa.gov/mercury/" },
          { label: "NASA: Venus", url: "https://science.nasa.gov/venus/" },
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      constellation_year: {
        intro: [
          "Diese Jahresuhr legt die monatlichen Sternbild-Schwerpunkte über den kompletten Jahreskreis.",
          "So wird sichtbar, wie sich der Saisonhimmel durch den Kalender dreht, statt jeden Monat isoliert zu betrachten."
        ],
        details: [
          "Der hervorgehobene Marker läuft mit dem gewählten Datum über den Jahresring.",
          "Die Monatsfolge basiert auf derselben kuratierten Sternbildliste wie die Monats-Kachel."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "IAU Working Group on Star Names", url: "https://www.iau.org/science/scientific_bodies/working_groups/280/" }
        ]
      },
      night_visibility: {
        intro: [
          "Diese Kachel spannt die ausgewählte Nacht von der Abenddämmerung bis zur Morgendämmerung auf und schätzt, wann helle Planeten über dem Horizont stehen.",
          "Sie bleibt bewusst angenähert, ist aber deutlich informativer als nur Morgen/Abend."
        ],
        formulas: [
          { expr: "t<sub>Transit</sub> &asymp; 12h + Elongation / 15", note: "Genäherte Meridiandurchgangszeit aus der solaren Elongation." },
          { expr: "t<sub>Auf,Unter</sub> &asymp; t<sub>Transit</sub> &plusmn; 6h", note: "Einfache Horizont-Näherung für die Nachtbalken." }
        ],
        details: [
          "Die Balken werden auf die dunkle Nachtspanne zwischen Abend- und Morgendämmerung beschnitten.",
          "Das ist ein geometrischer Schnellblick und keine vollständige Höhen-/Azimut-Simulation."
        ],
        links: [
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      satellites: {
        intro: [
          "Diese Kachel zeigt einige helle oder bekannte Erdorbiter in schematischen niedrigen Erdorbits.",
          "Die Marker bewegen sich mit dem gewählten Datum, sind aber keine Live-Positionen aus frischen TLE-Daten."
        ],
        formulas: [
          { expr: "Phase = frac( Phase<sub>0</sub> + (t - t<sub>0</sub>) / P )", note: "Mittlere Orbitphase aus Referenzzeitpunkt und Umlaufzeit P." }
        ],
        details: [
          "Höhe, Umlaufzeit und Inklination werden zur Einordnung angezeigt.",
          "Die Bahnebenen sind absichtlich stilisiert, damit mehrere Satelliten in einer Kachel lesbar bleiben."
        ],
        links: [
          { label: "NASA: International Space Station", url: "https://www.nasa.gov/international-space-station/" },
          { label: "ESA: Hubble Space Telescope", url: "https://esahubble.org/" },
          { label: "heute-am-himmel.de: ISS", url: "https://www.heute-am-himmel.de/iss" }
        ]
      },
      aurora: {
        intro: [
          "Diese Kachel schätzt die heutige Polarlicht-Chance für Deutschland aus Live-Daten des Weltraumwetters.",
          "Sie ist absichtlich nicht an den Datumsregler gekoppelt, weil der Input echtzeitnah und nicht historisch ist."
        ],
        details: [
          "Aktuell wird der neueste planetare Kp-Wert der NOAA SWPC geholt und in eine Deutschland-Lesart übersetzt.",
          "Ein hoher Kp garantiert noch keine Sichtung; Dunkelheit, klares Wetter und das genaue Timing bleiben wichtig."
        ],
        links: [
          { label: "NOAA SWPC", url: "https://www.swpc.noaa.gov/" },
          { label: "NOAA SWPC products", url: "https://services.swpc.noaa.gov/" }
        ]
      },
      jupiter: {
        intro: [
          "Diese Kachel zeigt Jupiter mit zehn ausgewählten Monden in beschleunigter, bewusst illustrativer Bewegung.",
          "Lesbarkeit steht hier absichtlich etwas über physikalischer Exaktheit."
        ],
        formulas: [
          { expr: "T<sup>2</sup> &prop; a<sup>3</sup>", note: "Keplers drittes Gesetz erklärt, warum äussere Monde langsamer umlaufen." }
        ],
        details: [
          "Hervorgehoben sind die vier galileischen Monde plus einige weitere bekannte Begleiter.",
          "NASA führt für Jupiter 101 bestätigte Monde; gezeichnet wird bewusst nur eine kuratierte Auswahl."
        ],
        links: [
          { label: "NASA: Jupiter Moons", url: "https://science.nasa.gov/jupiter/jupiter-moons/" },
          { label: "JPL: Planetary Satellites", url: "https://ssd.jpl.nasa.gov/sats/elem/" }
        ]
      },
      earth_moon: {
        intro: [
          "Diese Kachel bündelt drei eng zusammenhängende Ansichten: Erde-Mond-Szene, Finsternisgeometrie und Tageslichtdaten für den gewählten Ort.",
          "Sie ist die datums- und ortssensibelste Kachel im ganzen Dashboard."
        ],
        formulas: [
          { expr: "Alter = ((t - t<sub>0</sub>) mod 29.530588861 d)", note: "Mondalter aus Referenz-Neumond und synodischem Monat." },
          { expr: "Beleuchtung = 0.5 (1 - cos(2&pi;f))", note: "Beleuchteter Anteil aus der Phasenfraktion f." },
          { expr: "cos H = (cos Z - sin &delta; sin &phi;) / (cos &delta; cos &phi;)", note: "Grundbeziehung hinter Sonnenaufgang, Sonnenuntergang und Dämmerung." }
        ],
        details: [
          "Die Finsternis-Grafik prüft Neu-/Vollmond-Geometrie zusammen mit Knotennahe und zeigt damit, wann Finsternisbedingungen günstig sind.",
          "Sonnenaufgang, Sonnenuntergang, Dämmerung, blaue Stunde und goldene Stunde werden für die aktuell gewählte Stadt neu berechnet."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" }
        ]
      },
      planet_systems: {
        intro: [
          "Diese Vergleichskachel skizziert ausgewählte Mondsysteme von Mars, Saturn, Uranus und Neptun nebeneinander.",
          "Sie soll vor allem Grössenfamilien und bekannte Namen zeigen, nicht vollständige Satellitenkataloge."
        ],
        formulas: [
          { expr: "T<sup>2</sup> &prop; a<sup>3</sup>", note: "Dasselbe Bahngesetz prägt auch Planet-Mond-Systeme." }
        ],
        details: [
          "Die aktuellen Summen in der Legende sind Mars 2, Saturn 274, Uranus 28 und Neptun 16.",
          "Beschriftet wird absichtlich nur eine gut lesbare Auswahl."
        ],
        links: [
          { label: "NASA: Saturn Moons", url: "https://science.nasa.gov/saturn/moons/" },
          { label: "NASA: Uranus Moons", url: "https://science.nasa.gov/uranus/moons/" },
          { label: "NASA: Neptune Moons", url: "https://science.nasa.gov/neptune/moons/" }
        ]
      },
      sky_calendar: {
        intro: [
          "Der Himmelskalender ist eine kuratierte Ereignisliste für Finsternisse, Meteorpeaks, Mondereignisse, Planetentermine und Jahreszeitenmarker.",
          "Die Filter helfen beim Fokussieren, während die Nächstes-Ereignis-Zeile den nächsten relevanten Termin sofort sichtbar hält."
        ],
        details: [
          "Die Kalendereinträge liegen in einer eigenen Config-Datei und reichen derzeit von 2026 bis Januar 2028.",
          "Diese Kachel ist redaktionell gepflegt und darf deshalb berechnete Zeitpunkte mit handschriftlichen Beobachtungshinweisen mischen."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" }
        ]
      },
      bsky_feed: {
        intro: [
          "Diese Kachel zeigt für jeden konfigurierten Bluesky-Account den neuesten Bildbeitrag samt Avatar und Datum.",
          "Falls es heute noch keinen Bildpost gibt, kann stattdessen der letzte verfügbare Bildpost gezeigt werden."
        ],
        details: [
          "Bei einem Aufruf per file:// bleibt die Kachel verborgen, weil dort kein Feed-Fetching laufen soll.",
          "Jeder Account wird als eigener Abschnitt gerendert, sodass mehrere Quellen untereinander in einer scrollbaren Kachel erscheinen können."
        ],
        links: [
          { label: "Bluesky Feed API", url: "https://docs.bsky.app/docs/api/app-bsky-feed-get-author-feed" },
          { label: "Bluesky Developer Docs", url: "https://docs.bsky.app/" }
        ]
      }
    }
  },
  fr: {
    sections: {
      button: "Plus d'infos",
      title: "A propos de cette carte",
      overview: "Vue d'ensemble",
      formulas: "Formules utilisees",
      details: "Donnees et remarques",
      links: "Sources et approfondissement"
    },
    cards: {
      time: {
        intro: [
          "Cette carte regroupe l'horloge en direct, le chronometre, le compte a rebours et les options d'affichage.",
          "Elle repose surtout sur la logique du navigateur et reagit donc immediatement, sans donnees externes."
        ],
        details: [
          "L'heure suit le fuseau horaire choisi.",
          "Le chronometre et le compte a rebours s'executent localement dans le navigateur."
        ]
      },
      date_location: {
        intro: [
          "Cette carte pilote la date partagee des vues astronomiques et le lieu d'observation des panneaux dependants du lieu.",
          "Quand la date change ici, le systeme solaire, les saisons, la Lune, la visibilite et la lumiere du jour sont mis a jour ensemble."
        ],
        formulas: [
          { expr: "t<sub>selectionne</sub> = t<sub>actuel</sub> + &Delta;d &middot; 86400 s", note: "Decalage en jours entiers." }
        ],
        details: [
          "Le curseur conserve volontairement la plage d'origine de -100 a +100 ans.",
          "Le selecteur de ville propose pour l'instant dix grandes villes allemandes sans changer le fuseau de la page."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" }
        ]
      },
      solar_system: {
        intro: [
          "Voici une vue heliocentrique, vue du dessus, des huit planetes dans le plan de l'ecliptique pour la date choisie.",
          "Les distances sont compressees visuellement pour que les planetes externes tiennent encore dans un seul disque lisible."
        ],
        formulas: [
          { expr: "T = (JD - 2451545.0) / 36525", note: "Siecles depuis J2000.0." },
          { expr: "M = L - &varpi;", note: "Anomalie moyenne." },
          { expr: "x' = a(cos E - e), &nbsp; y' = a&radic;(1-e<sup>2</sup>) sin E", note: "Coordonnees dans le plan orbital apres la resolution de l'equation de Kepler." }
        ],
        details: [
          "Les elements orbitaux suivent l'approximation keplerienne simplifiee du JPL pour les vues d'ensemble.",
          "La carte reste schematique, mais elle suit bien la date choisie dans toute l'application."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "JPL Horizons", url: "https://ssd.jpl.nasa.gov/horizons/" }
        ]
      },
      small_bodies: {
        intro: [
          "Cette carte rassemble plusieurs orbites de cometes celebres avec la ceinture d'asteroides et la ceinture de Kuiper.",
          "La geometrie est fortement compressee pour faire cohabiter cometes a longue periode, sungrazers et zones de ceinture."
        ],
        formulas: [
          { expr: "a = (q + Q) / 2", note: "Demi-grand axe a partir du perihelie q et de l'aphelie Q." },
          { expr: "e = (Q - q) / (Q + q)", note: "Excentricite derivee de q et Q." },
          { expr: "r<sub>plot</sub> = R<sub>max</sub> &radic;( clamp(r, 0.02, 60) / 60 )", note: "Compression utilisee pour l'affichage des petits corps." }
        ],
        details: [
          "La selection actuelle comprend 20 cometes nommees, dont Halley, Hale-Bopp, Hyakutake, NEOWISE et ISON.",
          "La ceinture principale apparait a 2.1-3.3 UA et la ceinture de Kuiper a 30-50 UA."
        ],
        links: [
          { label: "JPL Small-Body Database", url: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html" },
          { label: "NASA: Asteroids, Comets & Meteors", url: "https://science.nasa.gov/solar-system/asteroids-comets-and-meteors/" }
        ]
      },
      meteor_streams: {
        intro: [
          "Le grand anneau montre quand les principaux essaims meteoriques sont actifs dans l'annee; le panneau des radiants montre d'ou ils semblent venir dans le ciel.",
          "C'est un guide calendaire et de lecture du ciel, pas une carte photographique du firmament."
        ],
        formulas: [
          { expr: "f<sub>annee</sub> = (DOY - 1) / daysInYear", note: "Projection d'un jour de l'annee sur le cercle annuel." }
        ],
        details: [
          "Les arcs colores montrent les fenetres d'activite; les petits points marquent les dates de maximum.",
          "Les radiants sont places schematiquement par azimut et hauteur pour une lecture d'Europe centrale."
        ],
        links: [
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" },
          { label: "International Meteor Organization", url: "https://www.imo.net/resources/calendar/" }
        ]
      },
      constellation_month: {
        intro: [
          "Cette carte mensuelle met en avant une constellation saisonniere facile a reconnaitre avec une figure simplifiee et quelques noms d'etoiles.",
          "Elle sert surtout d'aide d'orientation, pas d'atlas complet."
        ],
        details: [
          "Le choix depend du mois et vise une lecture saisonniere pour l'Europe centrale.",
          "Les noms d'etoiles sont places pour rester lisibles sur des ecrans compacts."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "IAU Working Group on Star Names", url: "https://www.iau.org/science/scientific_bodies/working_groups/280/" }
        ]
      },
      season_axis: {
        intro: [
          "Cette carte combine une vue de dessus de l'orbite terrestre avec un petit encart lateral montrant l'angle du Soleil par rapport a l'axe terrestre.",
          "Les deux vues ensemble expliquent pourquoi l'annee alterne longues journees lumineuses et journees plus courtes avec Soleil bas."
        ],
        formulas: [
          { expr: "f = (DOY - 1) / daysInYear", note: "Progression annuelle depuis le 1er janvier." },
          { expr: "&delta; &asymp; 23.44&deg; &middot; sin( 2&pi;(DOY - 80) / daysInYear )", note: "Approximation de la declinaison solaire pour l'encart lateral." }
        ],
        details: [
          "Le pourcentage indique l'avancement dans l'annee, pas une intensite.",
          "L'encart lateral change avec la date choisie, donc l'angle du Soleil suit vraiment le cycle saisonnier."
        ],
        links: [
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "NASA Space Place: Why do we have seasons?", url: "https://spaceplace.nasa.gov/seasons/en/" }
        ]
      },
      spacecraft: {
        intro: [
          "Cette carte place quelques sondes majeures autour du Soleil dans une vue schematique, vue du dessus.",
          "Elle privilegie la comparaison des distances et le contexte de mission, pas la navigation precise."
        ],
        formulas: [
          { expr: "r<sub>plot</sub> = R<sub>max</sub> log(1 + r) / log(1 + r<sub>max</sub>)", note: "Compression logarithmique de la distance heliocentrique en UA." }
        ],
        details: [
          "On y trouve notamment Parker Solar Probe, BepiColombo, JUICE, Juno, Europa Clipper, New Horizons, Pioneer 10/11 et les Voyagers.",
          "Les courbes sont des trajectoires stylisees pour conserver des etiquettes lisibles."
        ],
        links: [
          { label: "JPL Horizons", url: "https://ssd.jpl.nasa.gov/horizons/" },
          { label: "NASA Solar System", url: "https://science.nasa.gov/solar-system/" }
        ]
      },
      visibility: {
        intro: [
          "Cette carte estime si une planete est mieux placee dans le ciel du matin ou du soir pour la date et la ville choisies.",
          "C'est un repere rapide, pas un planificateur d'observation complet."
        ],
        formulas: [
          { expr: "elongation = &lambda;<sub>astre</sub> - &lambda;<sub>soleil</sub>", note: "Elongation solaire signee en longitude ecliptique." }
        ],
        details: [
          "Une elongation positive est interpretee comme une meilleure visibilite du soir, negative comme une meilleure visibilite du matin.",
          "La meteo, l'horizon local, l'eclat reel et la pollution lumineuse ne sont pas modeles."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" }
        ]
      },
      moon_nodes: {
        intro: [
          "Cette carte relie la geometrie des noeuds lunaires a un cycle approche des saisons d'eclipses pour la date choisie.",
          "Elle montre pourquoi les eclipses arrivent par saisons au lieu d'etre possibles tous les mois."
        ],
        formulas: [
          { expr: "d<sub>noeud</sub> = min(f, 1-f) &middot; 27.2122 d", note: "Distance approximee au noeud lunaire le plus proche a partir de la phase draconitique f." },
          { expr: "d<sub>saison</sub> = min(s, P-s), &nbsp; P &asymp; 173.31 d", note: "Distance approximee au centre de la saison d'eclipses." }
        ],
        details: [
          "L'orbite interieure montre la position de la Lune par rapport a la ligne des noeuds pour la date choisie.",
          "L'anneau exterieur utilise une approximation repetitive du cycle des saisons d'eclipses a but pedagogique."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" }
        ]
      },
      conjunctions: {
        intro: [
          "Cette carte parcourt une fenetre de temps autour de la date choisie et marque des minima approches de separation angulaire entre planetes.",
          "Elle sert d'aperçu rapide des rapprochements, pas d'ephemeride de precision observatoire."
        ],
        formulas: [
          { expr: "&Delta; = | signed( &lambda;<sub>A</sub> - &lambda;<sub>B</sub> ) |", note: "Separation angulaire en longitude ecliptique entre deux planetes." }
        ],
        details: [
          "La frise cherche des minima locaux de la courbe de separation dans la fenetre choisie.",
          "Les valeurs sont approchees et servent surtout a reperer des dates interessantes."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" }
        ]
      },
      retrograde: {
        intro: [
          "Cette carte suit si une planete est actuellement en mouvement apparent direct ou retrograde vue depuis la Terre.",
          "Ici, retrograde signifie une derive temporaire vers l'ouest sur le fond d'etoiles, due a la geometrie d'observation."
        ],
        formulas: [
          { expr: "&Delta;&lambda; / jour = signed( &lambda;<sub>geo</sub>(t+1d) - &lambda;<sub>geo</sub>(t-1d) ) / 2", note: "Mouvement apparent quotidien approxime a partir de la longitude geocentrique." }
        ],
        details: [
          "Les stations proches sont reperees par un changement de signe du mouvement apparent.",
          "Les points jaunes sur la trajectoire marquent les deux stations ou le mouvement apparent change de direction.",
          "Le point bleu marque la position actuelle de la planete dans la fenetre de trajectoire affichee.",
          "Les valeurs restent approchees, mais elles sont bien couplees a la date choisie."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "Star Walk: Retrograde Motion", url: "https://starwalk.space/de/infographics/retrograde-motion-demystified" }
        ]
      },
      inner_phases: {
        intro: [
          "Mercure et Venus presentent des phases parce que nous les observons depuis l'exterieur de leurs orbites autour du Soleil.",
          "La carte relie la phase, l'elongation et l'apparence d'etoile du matin ou du soir."
        ],
        formulas: [
          { expr: "k = (1 + cos i) / 2", note: "Fraction eclairee k a partir de l'angle de phase i." }
        ],
        details: [
          "Un fin croissant indique en general une proximite de la conjonction inferieure et un disque apparent plus grand au telescope.",
          "Une elongation plus large signifie souvent une visibilite plus confortable."
        ],
        links: [
          { label: "NASA: Mercury", url: "https://science.nasa.gov/mercury/" },
          { label: "NASA: Venus", url: "https://science.nasa.gov/venus/" },
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      constellation_year: {
        intro: [
          "Cette horloge annuelle place les constellations mensuelles autour de l'annee complete.",
          "Elle montre comment le ciel saisonnier tourne dans le calendrier au lieu de traiter chaque mois separement."
        ],
        details: [
          "Le marqueur mis en avant suit la date choisie autour de la roue annuelle.",
          "La sequence mensuelle repose sur la meme liste de constellations que la carte mensuelle."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/solar-system/skywatching/" },
          { label: "IAU Working Group on Star Names", url: "https://www.iau.org/science/scientific_bodies/working_groups/280/" }
        ]
      },
      night_visibility: {
        intro: [
          "Cette carte etire la nuit choisie du crepuscule du soir a l'aube et estime quand les planetes brillantes sont au-dessus de l'horizon.",
          "Elle reste volontairement approchee, mais apporte plus qu'une simple etiquette matin/soir."
        ],
        formulas: [
          { expr: "t<sub>transit</sub> &asymp; 12h + elongation / 15", note: "Approximation de l'heure de transit a partir de l'elongation solaire." },
          { expr: "t<sub>lever,coucher</sub> &asymp; t<sub>transit</sub> &plusmn; 6h", note: "Estimation simple de l'horizon pour les bandes de nuit." }
        ],
        details: [
          "Les bandes sont decoupees a l'intervalle de nuit sombre entre crepuscule du soir et aube.",
          "C'est un apercu geometrique rapide, pas une simulation complete altitude/azimut."
        ],
        links: [
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      satellites: {
        intro: [
          "Cette carte montre quelques satellites terrestres brillants ou bien connus sur des orbites basses schematiques.",
          "Les marqueurs bougent avec la date choisie, mais il ne s'agit pas de positions en direct issues de TLE actualises."
        ],
        formulas: [
          { expr: "phase = frac( phase<sub>0</sub> + (t - t<sub>0</sub>) / P )", note: "Phase orbitale moyenne a partir d'une epoque de reference et de la periode P." }
        ],
        details: [
          "L'altitude, la periode et l'inclinaison sont affichees pour le contexte.",
          "Les plans orbitaux sont stylises pour garder plusieurs satellites lisibles dans une seule carte."
        ],
        links: [
          { label: "NASA: International Space Station", url: "https://www.nasa.gov/international-space-station/" },
          { label: "ESA: Hubble Space Telescope", url: "https://esahubble.org/" },
          { label: "heute-am-himmel.de: ISS", url: "https://www.heute-am-himmel.de/iss" }
        ]
      },
      aurora: {
        intro: [
          "Cette carte estime la chance d'aurore pour l'Allemagne a partir de donnees spatiales en direct.",
          "Elle n'est volontairement pas reliee au curseur de date, car la source est temps reel et non historique."
        ],
        details: [
          "L'implementation actuelle utilise le dernier Kp planetaire de la NOAA SWPC et le traduit en lecture rapide pour l'Allemagne.",
          "Un Kp eleve ne garantit pas une observation; obscurite, ciel degage et bon timing restent essentiels."
        ],
        links: [
          { label: "NOAA SWPC", url: "https://www.swpc.noaa.gov/" },
          { label: "NOAA SWPC products", url: "https://services.swpc.noaa.gov/" }
        ]
      },
      jupiter: {
        intro: [
          "Cette carte montre Jupiter avec dix lunes selectionnees en mouvement accelere et volontairement illustratif.",
          "La lisibilite passe ici avant l'exactitude physique complete."
        ],
        formulas: [
          { expr: "T<sup>2</sup> &prop; a<sup>3</sup>", note: "La troisieme loi de Kepler explique pourquoi les lunes externes tournent plus lentement." }
        ],
        details: [
          "Les quatre lunes galileennes sont mises en avant avec quelques autres satellites bien connus.",
          "La NASA recense 101 lunes confirmees pour Jupiter; seule une selection volontairement lisible est dessinee ici."
        ],
        links: [
          { label: "NASA: Jupiter Moons", url: "https://science.nasa.gov/jupiter/jupiter-moons/" },
          { label: "JPL: Planetary Satellites", url: "https://ssd.jpl.nasa.gov/sats/elem/" }
        ]
      },
      earth_moon: {
        intro: [
          "Cette carte regroupe trois vues tres liees: la scene Terre-Lune, la geometrie des eclipses et les informations de lumiere du jour pour la ville choisie.",
          "C'est la carte la plus sensible a la date et au lieu dans tout le tableau de bord."
        ],
        formulas: [
          { expr: "age = ((t - t<sub>0</sub>) mod 29.530588861 d)", note: "Age lunaire a partir d'une nouvelle lune de reference et du mois synodique." },
          { expr: "illum = 0.5 (1 - cos(2&pi;f))", note: "Fraction eclairee selon la phase lunaire f." },
          { expr: "cos H = (cos Z - sin &delta; sin &phi;) / (cos &delta; cos &phi;)", note: "Relation de base pour lever, coucher et crepuscule du Soleil." }
        ],
        details: [
          "Le panneau d'eclipse combine la proximite des noeuds avec la geometrie nouvelle lune / pleine lune pour montrer quand une eclipse devient plausible.",
          "Lever du Soleil, coucher, aube, crepuscule, heure bleue et heure doree sont recalcules pour la ville allemande choisie."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" }
        ]
      },
      planet_systems: {
        intro: [
          "Cette carte compare sous forme miniaturisee quelques systemes de lunes de Mars, Saturne, Uranus et Neptune.",
          "Elle montre surtout des familles d'echelles et des noms-reperes, pas des catalogues complets."
        ],
        formulas: [
          { expr: "T<sup>2</sup> &prop; a<sup>3</sup>", note: "La meme loi orbitale structure aussi les systemes de lunes planetaires." }
        ],
        details: [
          "Les totaux actuellement utilises sont Mars 2, Saturne 274, Uranus 28 et Neptune 16.",
          "Seule une selection lisible de lunes est annotee."
        ],
        links: [
          { label: "NASA: Saturn Moons", url: "https://science.nasa.gov/saturn/moons/" },
          { label: "NASA: Uranus Moons", url: "https://science.nasa.gov/uranus/moons/" },
          { label: "NASA: Neptune Moons", url: "https://science.nasa.gov/neptune/moons/" }
        ]
      },
      sky_calendar: {
        intro: [
          "Le calendrier du ciel est une liste d'evenements selectionnes: eclipses, maxima meteoritiques, jalons lunaires, phenomenes planetaires et saisons.",
          "Les filtres servent a isoler un theme, tandis que la ligne du prochain evenement garde le rendez-vous le plus proche sous les yeux."
        ],
        details: [
          "Les entrees du calendrier vivent dans un fichier de configuration dedie et couvrent actuellement 2026 jusqu'a janvier 2028.",
          "Cette carte est editorialisee: elle peut donc melanger horaires calcules et notes d'observation redigees a la main."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" }
        ]
      },
      bsky_feed: {
        intro: [
          "Cette carte affiche pour chaque compte Bluesky configure le plus recent post contenant des images, avec avatar et date.",
          "S'il n'existe pas encore de post image aujourd'hui, elle peut afficher le dernier post image disponible."
        ],
        details: [
          "La carte reste cachee lorsque la page est ouverte via file://, afin d'eviter le chargement du flux dans ce contexte.",
          "Chaque compte est rendu dans son propre bloc, ce qui permet d'empiler plusieurs sources dans une carte scrollable."
        ],
        links: [
          { label: "Bluesky Feed API", url: "https://docs.bsky.app/docs/api/app-bsky-feed-get-author-feed" },
          { label: "Bluesky developer docs", url: "https://docs.bsky.app/" }
        ]
      }
    }
  }
};
