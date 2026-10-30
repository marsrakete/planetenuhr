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
      date_location: {
        intro: [
          "This card controls the shared date for the astronomy tiles and the observing location for location-dependent views.",
          "Changing the date or time updates the solar system, season, moon, visibility and daylight panels together."
        ],
        formulas: [
          { expr: "t<sub>base</sub> = t<sub>now</sub> + &Delta;d &middot; 86400 s", note: "Date offset in whole days; the optional clock selection is resolved in the selected location's time zone." }
        ],
        details: [
          "The slider keeps the original range of -100 to +100 years.",
          "The time slider uses the selected location's local clock. Now sets the selected date to the current full local hour without changing its date.",
          "The hour time-lapse advances one hour per second and continues across midnight, moving to the next date. Only one time-lapse runs at a time; starting one stops the other.",
          "The location selector determines the time zone used by the observing views."
        ],
        links: [
          { label: "JPL approximate planetary positions", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NOAA solar calculation details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "timeanddate: Astronomy overview", url: "https://www.timeanddate.com/astronomy/" }
        ]
      },
      milky_way: {
        intro: [
          "This card presents the Milky Way as an artist concept and offers a separate schematic view of its band in the night sky.",
          "Select a marked area on the map—center, earlier estimate or updated measurement—to read its explanation."
        ],
        formulas: [
          { expr: "H = &theta;<sub>GMST</sub> + &lambda; - &alpha;", note: "Local hour angle from sidereal angle, east longitude and right ascension." },
          { expr: "sin h = sin &phi; sin &delta; + cos &phi; cos &delta; cos H", note: "Altitude from observer latitude, declination and hour angle." }
        ],
        details: [
          "Our Solar System lies in the Orion Spur, between the larger Sagittarius and Perseus arms.",
          "Chandra’s updated arm distances refer to a measured line of sight and do not constitute a complete remapping of the Milky Way.",
          "The circular sky dome samples the galactic plane and converts its points to altitude and azimuth for the selected instant and place. The outer circle is the horizon and the center is the zenith; altitude is shown as radial distance. Local sidereal time accounts for Earth's rotation.",
          "Galactic-center visibility: It lies toward Sagittarius. In the Northern Hemisphere the central Milky Way is mainly a summer-night sight; from mid-northern latitudes it stays low in the south, while farther south it climbs higher. In the Southern Hemisphere, winter nights are favorable. The gold marker appears only while the center is above the horizon.",
          "For observing, choose a dark night near new Moon with a clear southern horizon. The marker and added star cluster are schematic: dust obscures Sagittarius A* in visible light, so the eye sees surrounding star clouds, not the black hole itself.",
          "Solar altitude dims the band during daylight and twilight. Moonlight, clouds, terrain and the Milky Way's detailed brightness are not modeled."
        ],
        links: [
          { label: "NASA/Chandra: Milky Way arm measurements", url: "https://science.nasa.gov/missions/chandra/nasas-chandra-examines-milky-way-at-arms-length/" },
          { label: "ESA Gaia DR3: Galactic coordinate transformation", url: "https://gea.esac.esa.int/archive/documentation/GDR3/Data_processing/chap_cu3ast/sec_cu3ast_intro/ssec_cu3ast_intro_tansforms.html" },
          { label: "US Naval Observatory: Altitude and azimuth", url: "https://aa.usno.navy.mil/faq/alt_az" },
          { label: "NASA Night Sky Notes: The Milky Way in summer", url: "https://science.nasa.gov/solar-system/skywatching/night-sky-network/augusts-night-sky-notes-the-great-rift/" },
          { label: "NASA: Milky Way bulge and obscuring dust", url: "https://science.nasa.gov/image-detail/image1hubble-2/" },
          { label: "Chandra image-use policy", url: "https://www.chandra.cfa.harvard.edu/photo/image_use.html" }
        ]
      },
      solar_system: {
        intro: [
          "This is a heliocentric, top-down ecliptic view of the eight planets for the selected date.",
          "Orbital radii are spaced schematically to separate the inner planets; they do not represent physical distances. The calculated heliocentric directions follow the selected date."
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
      barycenter: {
        intro: [
          "This card shows the changing center of mass of the solar system in a top-down view close to the Sun.",
          "The cross stays at the barycenter while the Sun wobbles around it, driven mainly by Jupiter and Saturn."
        ],
        formulas: [
          { expr: "\\vec r<sub>B</sub> = \\frac{\\sum m<sub>i</sub> \\vec r<sub>i</sub>}{M<sub>☉</sub> + \\sum m<sub>i</sub>}", note: "Solar-system barycenter relative to the Sun from approximate heliocentric planet positions and mass ratios." },
          { expr: "\\vec r<sub>☉</sub> = -\\vec r<sub>B</sub>", note: "In the barycentric frame, the Sun sits on the opposite side of the shared center of mass." }
        ],
        details: [
          "The blue line is a fifty-year trail of the Sun center around the selected date.",
          "The mode buttons let you compare how much of the wobble comes from Jupiter alone, from Jupiter plus Saturn, or from the full planetary system.",
          "If the cross sits inside the solar disk, the barycenter is inside the Sun; if it falls outside, the barycenter lies beyond the photosphere."
        ],
        links: [
          { label: "JPL glossary: barycenter", url: "https://ssd.jpl.nasa.gov/glossary/barycenter.html" },
          { label: "NASA Space Place: What is a barycenter?", url: "https://spaceplace.nasa.gov/barycenter/en/" },
          { label: "JPL approximate positions of the planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      lagrange: {
        intro: [
          "This card shows the five Sun-Earth Lagrange points in a rotating top-down schematic.",
          "Lagrange points are places where gravity and orbital motion balance so spacecraft can remain near the Sun-Earth system with relatively little station-keeping."
        ],
        formulas: [
          { expr: "L4, L5 = 60&deg; ahead / behind Earth", note: "The stable triangular points lead and trail Earth by about sixty degrees in the same orbit." },
          { expr: "L1, L2 &asymp; 1.5 \\times 10^6 km from Earth", note: "Approximate Sun-Earth distances to the inner and outer collinear points." }
        ],
        details: [
          "L1, L2 and L3 lie on the Sun-Earth line and are dynamically unstable.",
          "L4 and L5 are the two stable triangle tips; JWST is shown near L2 because Sun, Earth and Moon stay on one side there, which keeps the telescope cold and pointed into deep space."
        ],
        links: [
          { label: "NASA: What is a Lagrange point?", url: "https://science.nasa.gov/resource/what-is-a-lagrange-point/" },
          { label: "NASA Webb: Orbit near L2", url: "https://science.nasa.gov/mission/webb/orbit/" }
        ]
      },
      analemma: {
        intro: [
          "This card shows the analemma: the figure the Sun traces when viewed at the same civil clock time through the year.",
          "Here the horizontal direction follows the clock-versus-solar-noon offset, while the vertical direction shows noon altitude for the selected place."
        ],
        formulas: [
          { expr: "EoT = 9.87 sin(2B) - 7.53 cos(B) - 1.5 sin(B)", note: "Compact approximation of the equation of time in minutes." },
          { expr: "&delta; &asymp; 23.44&deg; \\cdot sin( 2&pi;(DOY - 80) / daysInYear )", note: "Approximate solar declination through the year." }
        ],
        details: [
          "The highlighted red point marks the selected date within the chosen year.",
          "Because the dashboard keeps one page-wide time setting, this card approximates local civil noon from longitude rather than switching the whole app into the city's legal time zone."
        ],
        links: [
          { label: "USNO: The Equation of Time", url: "https://aa.usno.navy.mil/faq/eqtime" },
          { label: "NOAA solar calculation details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" }
        ]
      },
      exoplanets: {
        intro: [
          "This card compares a few well-known exoplanet systems in a compact side-by-side layout.",
          "Each panel uses its own outer orbit as the display scale, so the comparison focuses on architecture, not on one shared absolute size."
        ],
        formulas: [
          { expr: "P^2 &asymp; a^3 / M<sub>*</sub>", note: "Simplified Kepler relation in solar units, used here for schematic orbital phase motion." }
        ],
        details: [
          "TRAPPIST-1 shows how tightly packed rocky planets can be around a tiny star.",
          "Kepler-90, 55 Cancri and HR 8799 provide broader layouts ranging from compact inner worlds to very wide giant-planet systems."
        ],
        links: [
          { label: "NASA: TRAPPIST-1", url: "https://www.nasa.gov/trappist-1/" },
          { label: "NASA: Exoplanet facts", url: "https://science.nasa.gov/exoplanets/facts/" },
          { label: "NASA Exoplanet Archive", url: "https://exoplanetarchive.ipac.caltech.edu/" }
        ]
      },
      polaris: {
        intro: [
          "This card shows the north horizon, Polaris, and the north celestial pole for the selected location.",
          "The pole height above the horizon is approximately the observer latitude, while the surrounding stars rotate with sidereal time."
        ],
        formulas: [
          { expr: "h<sub>pole</sub> &asymp; \\varphi", note: "In the northern hemisphere, the altitude of the north celestial pole roughly equals geographic latitude." }
        ],
        details: [
          "Polaris is not exactly on the pole; the tiny circle around the pole is enlarged here so the offset stays visible.",
          "The blue line marks Earth’s rotation axis projected into the sky, and the surrounding asterisms show how the sky turns around that axis through the night."
        ],
        links: [
          { label: "NASA: What is the North Star?", url: "https://science.nasa.gov/solar-system/what-is-the-north-star-and-how-do-you-find-it/" }
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
          { label: "NASA: Asteroids, Comets & Meteors", url: "https://science.nasa.gov/asteroids-comets-meteors/" }
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
        formulas: [
          { expr: "r = R (1 - altitude / 90)", note: "The small sky hint maps altitude onto a horizon circle: high objects move toward the center." }
        ],
        details: [
          "The chosen object depends on the month and is tuned for a Central European seasonal reading.",
          "Named stars are placed to stay legible on small screens.",
          "The added sky hint is a compact evening-sky guide with approximate azimuth and altitude for a Central European reading."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "IAU constellation charts", url: "https://www.iau.org/Iau/Science/What-we-do/The-Constellations.aspx" },
          { label: "CDS VizieR star catalog service", url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-2" }
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "timeanddate: Night sky and planet visibility", url: "https://www.timeanddate.com/astronomy/night/" }
        ]
      },
      moon_nodes: {
        markerNote: "The two small blue markers are the lunar nodes, not extra bodies: they mark where the Moon's tilted orbit crosses the ecliptic plane.",
        intro: [
          "This card combines the Moon's node geometry with an approximate eclipse-season cycle tied to the selected date.",
          "It helps explain why eclipses cluster in seasons instead of being possible every month."
        ],
        formulas: [
          { expr: "d<sub>node</sub> = min(f, 1-f) &middot; 27.2122 d", note: "Approximate distance to the nearest lunar node from the draconic phase f." },
          { expr: "d<sub>season</sub> = min(s, P-s), &nbsp; P &asymp; 173.31 d", note: "Approximate distance to the nearest eclipse-season center." },
          { expr: "UTC &asymp; t<sub>local</sub> - offset<sub>zone</sub>", note: "The preview converts curated local phase times into approximate UTC instants with the selected city's time zone." },
          { expr: "H = LST - &alpha;, &nbsp; sin h = sin &phi; sin &delta; + cos &phi; cos &delta; cos H", note: "Hour angle H and altitude h from local sidereal time, latitude &phi;, right ascension &alpha; and declination &delta;." },
          { expr: "A = atan2( sin H, cos H sin &phi; - tan &delta; cos &phi; )", note: "Approximate azimuth A used for the compass direction in the eclipse preview." }
        ],
        details: [
          "The inner orbit shows where the Moon sits relative to the node line on the selected date.",
          "The two small blue markers are the lunar nodes, not extra bodies: they mark where the Moon's tilted orbit crosses the ecliptic plane.",
          "The outer season ring uses a repeating eclipse-season approximation; it is designed as an educational timing aid.",
          "Direction, horizon height and compass arrow in the preview are observing aids, not a full local eclipse simulator."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" },
          { label: "timeanddate: Eclipses", url: "https://www.timeanddate.com/eclipse/" }
        ]
      },
      conjunctions: {
        "intro": [
          "Shows close approaches as seen from Earth for Mercury, Venus, Mars, Jupiter and Saturn within 60 days before and after the selected instant.",
          "Events are minima of the full sky separation at or below 4.5°, including ecliptic latitude. They are not necessarily the instants of equal longitude or right ascension."
        ],
        "formulas": [
          {
            "expr": "r_A = R_A - R_E; r_B = R_B - R_E",
            "note": "Earth-centered vectors: subtract the Earth’s heliocentric position. The dot product includes all three coordinates; clamp to [−1,1] before arccos."
          },
          {
            "expr": "&Delta; = arccos( clamp( (r_A &middot; r_B) / (|r_A| |r_B|), -1, 1 ) )",
            "note": "Earth-centered vectors: subtract the Earth’s heliocentric position. The dot product includes all three coordinates; clamp to [−1,1] before arccos."
          }
        ],
        "details": [
          "Daily samples locate possible minima; a golden-section search refines each candidate within its surrounding two days. The minute-sized search interval does not imply minute-level astronomical accuracy.",
          "Geometric approximate planetary orbits are shared with the horizon card. No light-time correction, aberration or local parallax is applied. Daylight, altitude and weather are not visibility filters for this timeline.",
          "The highlighted center is the selected instant; dated ticks and events use the same elapsed-time scale. The summary reports the next future minimum in the displayed window.",
          "All event dots have the same size. Each separation is also expressed using the shared finger, thumb and hand estimates at arm’s length. These are rough visual comparisons; separations below 1° are labelled less than one finger width."
        ],
        "links": [
          {
            "label": "JPL approximate positions of the planets",
            "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
          },
          {
            "label": "NASA Skywatching",
            "url": "https://science.nasa.gov/skywatching/"
          }
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "IAU constellation charts", url: "https://www.iau.org/Iau/Science/What-we-do/The-Constellations.aspx" },
          { label: "CDS VizieR star catalog service", url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-2" }
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
          { label: "NOAA SWPC", url: "https://www.spaceweather.gov/" },
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
          { expr: "r = R |cos(2&pi;f)|", note: "Projected terminator semi-axis; the lit side follows the existing lunar phase model." },
          { expr: "age = ((t - t<sub>0</sub>) mod 29.530588861 d)", note: "Moon age from a reference new moon and the synodic month." },
          { expr: "illum = 0.5 (1 - cos(2&pi;f))", note: "Illuminated fraction from lunar phase fraction f." },
          { expr: "cos H = (cos Z - sin &delta; sin &phi;) / (cos &delta; cos &phi;)", note: "Solar event relation behind sunrise, sunset and twilight times." },
          { expr: "H = LST - &alpha;, &nbsp; sin h = sin &phi; sin &delta; + cos &phi; cos &delta; cos H", note: "Approximate Moon altitude h from local sidereal time, latitude &phi;, right ascension &alpha; and declination &delta;." }
        ],
        details: [
          "The accelerated orbit is a schematic side view: sunlight comes from the left, so the Moon's left hemisphere stays lit in this view. Its surface markings rotate once per orbit, keeping the same hemisphere toward Earth. The larger Moon below shows the selected date, with waxing phases lit on the right and waning phases on the left (northern convention). The phase comes from viewing the sunlit half, not from Earth casting a shadow. Continents, crater shapes and scales are illustrative; eclipses and lunar libration are not simulated.",
          "The eclipse panel checks new/full moon geometry together with node proximity, so it shows when eclipse conditions are favorable.",
          "Sunrise, sunset, dawn, dusk, blue hour and golden hour are recomputed for the currently selected German city.",
          "The Moon direction line uses the same approximate local sky conversion as the eclipse preview so azimuth and horizon height read the same way."
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
          "The sky calendar combines a filtered event list with a real month calendar for eclipses, meteor peaks, lunar milestones, planetary highlights and seasonal markers.",
          "Use List for compact reading or Calendar for day-by-day browsing inside the selected month."
        ],
        details: [
          "The calendar data is maintained in dedicated config files and currently spans 2026 through December 2040.",
          "The download buttons create ICS calendar files. ICS is a common exchange format that can be imported into Apple Calendar, Google Calendar, Outlook and many mobile calendar apps.",
          "This card is editorially curated, so it can mix computed timing with hand-written observing notes."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" },
          { label: "Wikipedia: iCalendar", url: "https://en.wikipedia.org/wiki/ICalendar" },
          { label: "timeanddate: Astronomy overview", url: "https://www.timeanddate.com/astronomy/" }
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
      date_location: {
        intro: [
          "Diese Kachel steuert das gemeinsame Datum für die Astronomie-Karten und den Beobachtungsort für ortsabhängige Ansichten.",
          "Wenn hier Datum oder Uhrzeit geändert werden, aktualisieren sich Sonnensystem, Jahreszeiten, Mond, Sichtbarkeit und Tageslicht gemeinsam."
        ],
        formulas: [
          { expr: "t<sub>basis</sub> = t<sub>jetzt</sub> + &Delta;d &middot; 86400 s", note: "Datumsverschiebung in ganzen Tagen; eine gewählte Uhrzeit wird in der Zeitzone des Ortes aufgelöst." }
        ],
        details: [
          "Der Datumsregler behält bewusst die Spanne von -100 bis +100 Jahren.",
          "Der Uhrzeitregler verwendet die Ortszeit des ausgewählten Standorts. „Jetzt“ setzt die Uhrzeit am gewählten Datum auf die aktuelle volle Ortsstunde, ohne das Datum zu ändern.",
          "Der Stunden-Zeitraffer springt pro Sekunde eine Stunde weiter und läuft über Mitternacht hinaus zum nächsten Datum. Es läuft immer nur ein Zeitraffer; beim Start des einen stoppt der andere.",
          "Der ausgewählte Ort bestimmt die Zeitzone der ortsabhängigen Beobachtungsansichten."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "timeanddate: Astronomie-Überblick", url: "https://www.timeanddate.com/astronomy/" }
        ]
      },
      milky_way: {
        intro: [
          "Diese Kachel zeigt die Milchstraße als künstlerische Darstellung und zusätzlich ein schematisches Bild ihres Bandes am Nachthimmel.",
          "Wähle einen markierten Bereich auf der Karte – Zentrum, frühere Schätzung oder neue Messung – und lies die Erläuterung dazu."
        ],
        formulas: [
          { expr: "H = &theta;<sub>GMST</sub> + &lambda; - &alpha;", note: "Ortsstundenwinkel aus Sternzeitwinkel, östlicher Länge und Rektaszension." },
          { expr: "sin h = sin &phi; sin &delta; + cos &phi; cos &delta; cos H", note: "Höhe aus geografischer Breite, Deklination und Stundenwinkel." }
        ],
        details: [
          "Unser Sonnensystem liegt in der Orion-Spur zwischen den größeren Armen von Sagittarius und Perseus.",
          "Die aktualisierten Chandra-Abstände der Arme beziehen sich auf eine untersuchte Blickrichtung. Sie sind keine vollständige Neuvermessung der Milchstraße.",
          "Die runde Himmelskuppel tastet die galaktische Ebene ab und rechnet ihre Punkte für den gewählten Zeitpunkt und Ort in Höhe und Richtung am Himmel um. Der Außenkreis ist der Horizont, die Mitte der Zenit; die Höhe wird als radialer Abstand dargestellt. Der Ortssternwinkel berücksichtigt die Erdrotation.",
          "Sichtbarkeit des Galaxienzentrums: Es liegt in Richtung des Sternbilds Schütze (Sagittarius). Auf der Nordhalbkugel ist die zentrale Milchstraßenregion vor allem in Sommernächten zu sehen. In Mitteleuropa steht sie tief im Süden; weiter südlich steigt sie höher. Auf der Südhalbkugel sind Winternächte günstig. Die goldene Markierung erscheint nur, wenn das Zentrum über dem Horizont steht.",
          "Für die Beobachtung helfen eine dunkle, mondarme Nacht und freie Sicht nach Süden. Markierung und zusätzlicher Sternhaufen sind schematisch: Staub verdeckt Sagittarius A* im sichtbaren Licht. Mit bloßem Auge sieht man die Sternwolken in seiner Umgebung, nicht das Schwarze Loch selbst.",
          "Die Sonnenhöhe blendet das Band bei Tageslicht und Dämmerung ab. Mondlicht, Wolken, Gelände und die tatsächliche Helligkeitsverteilung der Milchstraße werden nicht berechnet."
        ],
        links: [
          { label: "NASA/Chandra: Messungen der Milchstraßenarme", url: "https://science.nasa.gov/missions/chandra/nasas-chandra-examines-milky-way-at-arms-length/" },
          { label: "ESA Gaia DR3: Umrechnung galaktischer Koordinaten", url: "https://gea.esac.esa.int/archive/documentation/GDR3/Data_processing/chap_cu3ast/sec_cu3ast_intro/ssec_cu3ast_intro_tansforms.html" },
          { label: "US Naval Observatory: Höhe und Azimut", url: "https://aa.usno.navy.mil/faq/alt_az" },
          { label: "NASA Night Sky Notes: Milchstraße im Sommer", url: "https://science.nasa.gov/solar-system/skywatching/night-sky-network/augusts-night-sky-notes-the-great-rift/" },
          { label: "NASA: Milchstraßenzentrum und Staub", url: "https://science.nasa.gov/image-detail/image1hubble-2/" },
          { label: "Chandra-Bildnutzungsregeln", url: "https://www.chandra.cfa.harvard.edu/photo/image_use.html" }
        ]
      },
      solar_system: {
        intro: [
          "Hier siehst du die acht Planeten heliozentrisch in einer Draufsicht auf die Ekliptik für das gewählte Datum.",
          "Die Bahnradien sind schematisch entzerrt, damit die inneren Planeten gut erkennbar bleiben. Sie stellen keine Entfernungen dar; die berechneten heliozentrischen Richtungen folgen dem Datum."
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
      barycenter: {
        intro: [
          "Diese Kachel zeigt das veränderliche Gravitationszentrum des Sonnensystems als Draufsicht im Nahbereich der Sonne.",
          "Das Kreuz bleibt im Baryzentrum stehen, während die Sonne darum taumelt; besonders stark treiben Jupiter und Saturn diese Bewegung."
        ],
        formulas: [
          { expr: "\\vec r<sub>B</sub> = \\frac{\\sum m<sub>i</sub> \\vec r<sub>i</sub>}{M<sub>☉</sub> + \\sum m<sub>i</sub>}", note: "Baryzentrum des Sonnensystems relativ zur Sonne aus angenäherten heliozentrischen Planetenpositionen und Massenverhältnissen." },
          { expr: "\\vec r<sub>☉</sub> = -\\vec r<sub>B</sub>", note: "Im baryzentrischen Bezugssystem liegt die Sonne auf der gegenüberliegenden Seite des gemeinsamen Schwerpunkts." }
        ],
        details: [
          "Die blaue Linie zeigt die Fünfzig-Jahres-Spur des Sonnenzentrums rund um das gewählte Datum.",
          "Mit den Modus-Buttons kannst du vergleichen, wie viel des Wobbelns von Jupiter allein, von Jupiter plus Saturn oder vom gesamten Planetensystem kommt.",
          "Liegt das Kreuz innerhalb der Sonnenscheibe, befindet sich das Baryzentrum innerhalb der Sonne; liegt es außerhalb, ist der gemeinsame Schwerpunkt außerhalb der Photosphäre."
        ],
        links: [
          { label: "JPL Glossar: Barycenter", url: "https://ssd.jpl.nasa.gov/glossary/barycenter.html" },
          { label: "NASA Space Place: What is a barycenter?", url: "https://spaceplace.nasa.gov/barycenter/en/" },
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      lagrange: {
        intro: [
          "Diese Kachel zeigt die fünf Sonne-Erde-Lagrange-Punkte als rotierende Draufsicht.",
          "Lagrange-Punkte sind Orte, an denen sich Gravitation und Umlaufbewegung so ausgleichen, dass Raumsonden mit vergleichsweise wenig Korrekturaufwand in der Nähe des Sonne-Erde-Systems bleiben können."
        ],
        formulas: [
          { expr: "L4, L5 = 60&deg; vor / hinter der Erde", note: "Die beiden stabilen Dreieckspunkte laufen in derselben Bahn rund sechzig Grad vor beziehungsweise hinter der Erde." },
          { expr: "L1, L2 &asymp; 1.5 \\times 10^6 km von der Erde", note: "Genäherte Sonne-Erde-Distanzen zu den inneren und äußeren kollinearen Punkten." }
        ],
        details: [
          "L1, L2 und L3 liegen auf der Sonne-Erde-Linie und sind dynamisch instabil.",
          "L4 und L5 sind die beiden stabilen Dreiecksspitzen; JWST ist nahe L2 eingezeichnet, weil Sonne, Erde und Mond dort auf einer Seite bleiben und das Teleskop dadurch kühl in den tiefen Weltraum blicken kann."
        ],
        links: [
          { label: "NASA: What is a Lagrange point?", url: "https://science.nasa.gov/resource/what-is-a-lagrange-point/" },
          { label: "NASA Webb: Orbit near L2", url: "https://science.nasa.gov/mission/webb/orbit/" }
        ]
      },
      analemma: {
        intro: [
          "Diese Kachel zeigt das Analemma: die Figur, die die Sonne im Jahreslauf zur gleichen zivilen Uhrzeit zeichnet.",
          "Hier folgt die horizontale Richtung der Abweichung zwischen Uhrzeit und Sonnenmittag, die vertikale Richtung zeigt die Mittagshöhe für den gewählten Ort."
        ],
        formulas: [
          { expr: "EoT = 9.87 sin(2B) - 7.53 cos(B) - 1.5 sin(B)", note: "Kompakte Näherung der Gleichung der Zeit in Minuten." },
          { expr: "&delta; &asymp; 23.44&deg; \\cdot sin( 2&pi;(DOY - 80) / daysInYear )", note: "Genäherte Solardeklination im Jahreslauf." }
        ],
        details: [
          "Der rote Punkt markiert das gewählte Datum innerhalb des ausgewählten Jahres.",
          "Weil die Dashboard-Zeit global bleibt, nähert diese Kachel den lokalen zivilen Mittag aus der geografischen Länge an, statt die ganze App in die gesetzliche Zeitzone der Stadt umzuschalten."
        ],
        links: [
          { label: "USNO: The Equation of Time", url: "https://aa.usno.navy.mil/faq/eqtime" },
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" }
        ]
      },
      exoplanets: {
        intro: [
          "Diese Kachel vergleicht einige bekannte Exoplanetensysteme in einer kompakten Nebeneinander-Ansicht.",
          "Jedes Teilbild nutzt seine eigene Außenbahn als Maßstab. Verglichen wird also die Architektur der Systeme, nicht eine gemeinsame absolute Größe."
        ],
        formulas: [
          { expr: "P^2 &asymp; a^3 / M<sub>*</sub>", note: "Vereinfachtes Kepler-Gesetz in Sonneneinheiten; hier nur für die schematische Bahnbewegung genutzt." }
        ],
        details: [
          "TRAPPIST-1 zeigt, wie eng gepackt felsige Planeten um einen kleinen Stern liegen können.",
          "Kepler-90, 55 Cancri und HR 8799 liefern breitere Gegenbeispiele von kompakten Innenwelten bis zu weit verteilten Riesenplaneten."
        ],
        links: [
          { label: "NASA: TRAPPIST-1", url: "https://www.nasa.gov/trappist-1/" },
          { label: "NASA: Exoplaneten-Fakten", url: "https://science.nasa.gov/exoplanets/facts/" },
          { label: "NASA Exoplanet Archive", url: "https://exoplanetarchive.ipac.caltech.edu/" }
        ]
      },
      polaris: {
        intro: [
          "Diese Kachel zeigt Nordhorizont, Polarstern und Himmelsnordpol für den gewählten Ort.",
          "Die Höhe des Pols über dem Horizont entspricht näherungsweise der geografischen Breite; die umliegenden Sterne drehen sich mit der Sternzeit darum."
        ],
        formulas: [
          { expr: "h<sub>Pol</sub> &asymp; \\varphi", note: "Auf der Nordhalbkugel entspricht die Höhe des Himmelsnordpols näherungsweise der geografischen Breite." }
        ],
        details: [
          "Der Polarstern sitzt nicht exakt auf dem Pol; der kleine Kreis um den Pol ist hier vergrößert, damit der Abstand sichtbar bleibt.",
          "Die blaue Linie markiert die in den Himmel verlängerte Erdachse. Die umliegenden Sternfiguren zeigen, wie sich der Himmel in der Nacht darum dreht."
        ],
        links: [
          { label: "NASA: Was ist der Polarstern?", url: "https://science.nasa.gov/solar-system/what-is-the-north-star-and-how-do-you-find-it/" }
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
          { label: "NASA: Asteroids, Comets & Meteors", url: "https://science.nasa.gov/asteroids-comets-meteors/" }
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
        formulas: [
          { expr: "r = R (1 - Höhe / 90)", note: "Die kleine Himmelsanzeige bildet die Höhe auf einen Horizontkreis ab: hohe Objekte wandern zur Mitte." }
        ],
        details: [
          "Die Auswahl richtet sich nach dem Monat und ist auf eine mitteleuropäische Saison-Lesart abgestimmt.",
          "Sternnamen werden so gesetzt, dass sie auch auf kleineren Displays möglichst lesbar bleiben.",
          "Die zusätzliche Himmelsanzeige ist ein kompakter Abendhimmel-Hinweis mit angenähertem Azimut und Höhe für Mitteleuropa."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "IAU constellation charts", url: "https://www.iau.org/Iau/Science/What-we-do/The-Constellations.aspx" },
          { label: "CDS VizieR star catalog service", url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-2" }
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "timeanddate: Nachthimmel und Planetensichtbarkeit", url: "https://www.timeanddate.com/astronomy/night/" }
        ]
      },
      moon_nodes: {
        markerNote: "Die zwei kleinen blauen Marker sind die Mondknoten und keine zusätzlichen Himmelskörper: Sie markieren die Schnittpunkte der geneigten Mondbahn mit der Ekliptik.",
        intro: [
          "Diese Kachel verbindet die Mondknoten-Geometrie mit einem angenäherten Finsternis-Saison-Zyklus für das gewählte Datum.",
          "So wird sichtbar, warum Finsternisse in Saisonfenstern auftreten und nicht einfach jeden Monat."
        ],
        formulas: [
          { expr: "d<sub>Knoten</sub> = min(f, 1-f) &middot; 27.2122 d", note: "Genäherte Distanz zum nächsten Mondknoten aus der drakonitischen Phase f." },
          { expr: "d<sub>Saison</sub> = min(s, P-s), &nbsp; P &asymp; 173.31 d", note: "Genäherte Distanz zum nächsten Saisonzentrum." },
          { expr: "UTC &asymp; t<sub>lokal</sub> - Offset<sub>Zone</sub>", note: "Die Vorschau übersetzt kuratierte lokale Phasenzeiten mit der Zeitzone der gewählten Stadt in angenäherte UTC-Zeitpunkte." },
          { expr: "H = LST - &alpha;, &nbsp; sin h = sin &phi; sin &delta; + cos &phi; cos &delta; cos H", note: "Stundenwinkel H und Höhe h aus lokaler Sternzeit, Breite &phi;, Rektaszension &alpha; und Deklination &delta;." },
          { expr: "A = atan2( sin H, cos H sin &phi; - tan &delta; cos &phi; )", note: "Genäherter Azimut A für die Kompassrichtung in der Finsternis-Vorschau." }
        ],
        details: [
          "Die innere Bahn zeigt die Stellung des Mondes relativ zur Knotenlinie am gewählten Datum.",
          "Der äußere Ring nutzt eine wiederholte Saison-Näherung und ist als didaktische Zeitansicht gedacht.",
          "Richtung, Höhe über dem Horizont und Kompasspfeil in der Vorschau sind Beobachtungshilfen und kein vollständiger lokaler Finsternisrechner."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" },
          { label: "timeanddate: Finsternisse", url: "https://www.timeanddate.com/eclipse/" }
        ]
      },
      conjunctions: {
        "intro": [
          "Zeigt enge Begegnungen von Merkur, Venus, Mars, Jupiter und Saturn aus Sicht der Erde innerhalb von 60 Tagen vor und nach dem gewählten Zeitpunkt.",
          "Ereignisse sind Minima des vollständigen Winkelabstands am Himmel bis 4,5°, einschließlich ekliptischer Breite. Sie entsprechen nicht zwingend dem Zeitpunkt gleicher Länge oder Rektaszension."
        ],
        "formulas": [
          {
            "expr": "r_A = R_A - R_E; r_B = R_B - R_E",
            "note": "Geozentrische Vektoren: Die heliozentrische Erdposition wird abgezogen. Das Skalarprodukt berücksichtigt alle drei Koordinaten; vor arccos wird auf [−1,1] begrenzt."
          },
          {
            "expr": "&Delta; = arccos( clamp( (r_A &middot; r_B) / (|r_A| |r_B|), -1, 1 ) )",
            "note": "Geozentrische Vektoren: Die heliozentrische Erdposition wird abgezogen. Das Skalarprodukt berücksichtigt alle drei Koordinaten; vor arccos wird auf [−1,1] begrenzt."
          }
        ],
        "details": [
          "Tägliche Stichproben suchen mögliche Minima; eine Suche mit dem Goldenen Schnitt verfeinert jeden Kandidaten zwischen den beiden benachbarten Tagen. Das minutenkleine Suchintervall bedeutet keine minutengenaue astronomische Vorhersage.",
          "Geometrische Näherungsbahnen werden gemeinsam mit der Horizontkachel verwendet. Ohne Lichtzeitkorrektur, Aberration und lokale Parallaxe. Tageslicht, Höhe und Wetter sind keine Sichtbarkeitsfilter dieser Zeitachse.",
          "Die markierte Mitte ist der gewählte Zeitpunkt; beschriftete Datumsmarken und Ereignisse verwenden dieselbe Skala verstrichener Zeit. Der Text nennt das nächste zukünftige Minimum im angezeigten Fenster.",
          "Alle Ereignispunkte sind gleich groß. Zu jedem Winkelabstand steht der gemeinsame Finger-, Daumen- oder Handvergleich bei ausgestrecktem Arm. Das sind grobe Anschauungswerte; Abstände unter 1° werden als weniger als eine Fingerbreite bezeichnet."
        ],
        "links": [
          {
            "label": "JPL: Approximate Positions of the Planets",
            "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
          },
          {
            "label": "NASA Skywatching",
            "url": "https://science.nasa.gov/skywatching/"
          }
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "IAU constellation charts", url: "https://www.iau.org/Iau/Science/What-we-do/The-Constellations.aspx" },
          { label: "CDS VizieR star catalog service", url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-2" }
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
          { label: "NOAA SWPC", url: "https://www.spaceweather.gov/" },
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
          { expr: "r = R |cos(2&pi;f)|", note: "Projizierte Halbachse der Lichtgrenze; die helle Seite folgt dem bestehenden Mondphasenmodell." },
          { expr: "Alter = ((t - t<sub>0</sub>) mod 29.530588861 d)", note: "Mondalter aus Referenz-Neumond und synodischem Monat." },
          { expr: "Beleuchtung = 0.5 (1 - cos(2&pi;f))", note: "Beleuchteter Anteil aus der Phasenfraktion f." },
          { expr: "cos H = (cos Z - sin &delta; sin &phi;) / (cos &delta; cos &phi;)", note: "Grundbeziehung hinter Sonnenaufgang, Sonnenuntergang und Dämmerung." }
        ],
        details: [
          "Der beschleunigte Umlauf ist eine schematische Seitenansicht: Das Sonnenlicht kommt von links, daher bleibt in dieser Ansicht die linke Mondhälfte beleuchtet. Die Oberflächenmerkmale des kleinen Mondes drehen sich einmal pro Umlauf; dadurch bleibt dieselbe Mondhälfte zur Erde gerichtet. Der größere Mond darunter zeigt das gewählte Datum, zunehmend rechts und abnehmend links beleuchtet (nördliche Darstellung). Die Phase entsteht durch den Blick auf die beleuchtete Hälfte, nicht durch Erdschatten. Kontinente, Kraterformen und Maßstäbe sind illustrativ; Finsternisse und die Mondlibration werden nicht simuliert.",
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
          "Der Himmelskalender verbindet eine gefilterte Ereignisliste mit einer echten Monatsansicht für Finsternisse, Meteorpeaks, Mondereignisse, Planetentermine und Jahreszeitenmarker.",
          "Mit Liste liest du kompakt, mit Kalender blätterst du taggenau durch den gewählten Monat."
        ],
        details: [
          "Die Kalendereinträge liegen in eigenen Konfigurationsdateien und reichen derzeit von 2026 bis Dezember 2040.",
          "Die Download-Buttons erzeugen ICS-Kalenderdateien. Das ist ein verbreitetes Kalenderformat, das sich in Apple Kalender, Google Kalender, Outlook und viele Handy-Kalender importieren lässt.",
          "Diese Kachel ist redaktionell gepflegt und darf deshalb berechnete Zeitpunkte mit handschriftlichen Beobachtungshinweisen mischen."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" },
          { label: "Wikipedia: iCalendar", url: "https://de.wikipedia.org/wiki/ICalendar" },
          { label: "timeanddate: Astronomie", url: "https://www.timeanddate.com/astronomy/" }
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
      date_location: {
        intro: [
          "Cette carte pilote la date partagee des vues astronomiques et le lieu d'observation des panneaux dependants du lieu.",
          "Quand la date ou l’heure change ici, le système solaire, les saisons, la Lune, la visibilité et la lumière du jour sont mis à jour ensemble."
        ],
        formulas: [
          { expr: "t<sub>base</sub> = t<sub>actuel</sub> + &Delta;d &middot; 86400 s", note: "Décalage en jours entiers ; l’heure choisie est résolue dans le fuseau du lieu sélectionné." }
        ],
        details: [
          "Le curseur de date conserve la plage de -100 a +100 ans.",
          "Le curseur horaire utilise l’heure locale du lieu choisi. « Maintenant » règle l’heure à l’heure locale entière actuelle sans modifier la date sélectionnée.",
          "L’accéléré horaire avance d’une heure par seconde et continue après minuit en passant à la date suivante. Un seul accéléré fonctionne à la fois ; démarrer l’un arrête l’autre.",
          "Le lieu choisi détermine le fuseau horaire des vues d’observation dépendantes du lieu."
        ],
        links: [
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
          { label: "NOAA: Solar Calculation Details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "timeanddate: Vue d’ensemble astronomie", url: "https://www.timeanddate.com/astronomy/" }
        ]
      },
      milky_way: {
        intro: [
          "Cette carte présente une vue d’artiste de la Voie lactée ainsi qu’un schéma de sa bande dans le ciel nocturne.",
          "Choisissez une zone marquée sur la carte — centre, estimation précédente ou mesure actualisée — pour lire son explication."
        ],
        formulas: [
          { expr: "H = &theta;<sub>GMST</sub> + &lambda; - &alpha;", note: "Angle horaire local à partir du temps sidéral, de la longitude est et de l’ascension droite." },
          { expr: "sin h = sin &phi; sin &delta; + cos &phi; cos &delta; cos H", note: "Hauteur calculée à partir de la latitude, de la déclinaison et de l’angle horaire." }
        ],
        details: [
          "Notre système solaire se trouve dans le bras d’Orion, entre les grands bras du Sagittaire et de Persée.",
          "Les nouvelles distances mesurées par Chandra concernent une ligne de visée étudiée. Elles ne constituent pas une nouvelle cartographie complète de la Voie lactée.",
          "Le dôme céleste circulaire échantillonne le plan galactique et convertit ses points en hauteur et en azimut pour l’heure et le lieu choisis. Le cercle extérieur représente l’horizon et le centre le zénith ; la hauteur est représentée par une distance radiale. Le temps sidéral local tient compte de la rotation terrestre.",
          "Visibilité du centre galactique : il se trouve dans la direction de la constellation du Sagittaire. Dans l’hémisphère nord, la région centrale de la Voie lactée s’observe surtout les nuits d’été. Aux latitudes moyennes du nord, elle reste basse au sud ; plus au sud, elle monte davantage. Dans l’hémisphère sud, les nuits d’hiver sont favorables. Le repère doré apparaît seulement lorsque le centre est au-dessus de l’horizon.",
          "Pour l’observer, privilégiez une nuit sombre, de préférence près de la nouvelle lune, et un horizon sud dégagé. Le repère et l’amas ajouté sont schématiques : la poussière masque Sagittarius A* en lumière visible. À l’œil nu, on voit les nuages d’étoiles autour du centre, pas le trou noir lui-même.",
          "La hauteur du Soleil atténue la bande pendant le jour et le crépuscule. La lumière lunaire, les nuages, le relief et la répartition réelle de la luminosité de la Voie lactée ne sont pas modélisés."
        ],
        links: [
          { label: "NASA/Chandra : mesures des bras galactiques", url: "https://science.nasa.gov/missions/chandra/nasas-chandra-examines-milky-way-at-arms-length/" },
          { label: "ESA Gaia DR3 : transformation des coordonnées galactiques", url: "https://gea.esac.esa.int/archive/documentation/GDR3/Data_processing/chap_cu3ast/sec_cu3ast_intro/ssec_cu3ast_intro_tansforms.html" },
          { label: "US Naval Observatory : hauteur et azimut", url: "https://aa.usno.navy.mil/faq/alt_az" },
          { label: "NASA Night Sky Notes : la Voie lactée en été", url: "https://science.nasa.gov/solar-system/skywatching/night-sky-network/augusts-night-sky-notes-the-great-rift/" },
          { label: "NASA : bulbe galactique et poussière interstellaire", url: "https://science.nasa.gov/image-detail/image1hubble-2/" },
          { label: "Conditions d’utilisation des images Chandra", url: "https://www.chandra.cfa.harvard.edu/photo/image_use.html" }
        ]
      },
      solar_system: {
        intro: [
          "Voici une vue heliocentrique, vue du dessus, des huit planetes dans le plan de l'ecliptique pour la date choisie.",
          "Les rayons des orbites sont espacés schématiquement pour rendre les planètes intérieures lisibles. Ils ne représentent pas les distances ; les directions héliocentriques calculées suivent la date."
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
      barycenter: {
        intro: [
          "Cette carte montre le centre de masse variable du Système solaire dans une vue de dessus au voisinage du Soleil.",
          "La croix reste au barycentre tandis que le Soleil oscille autour de lui, sous l’influence surtout de Jupiter et de Saturne."
        ],
        formulas: [
          { expr: "\\vec r<sub>B</sub> = \\frac{\\sum m<sub>i</sub> \\vec r<sub>i</sub>}{M<sub>☉</sub> + \\sum m<sub>i</sub>}", note: "Barycentre du Système solaire par rapport au Soleil à partir de positions héliocentriques approchées et de rapports de masse." },
          { expr: "\\vec r<sub>☉</sub> = -\\vec r<sub>B</sub>", note: "Dans le référentiel barycentrique, le Soleil se place du côté opposé au centre de masse commun." }
        ],
        details: [
          "La ligne bleue montre la trajectoire du centre du Soleil sur cinquante ans autour de la date choisie.",
          "Les boutons de mode permettent de comparer la part du mouvement due à Jupiter seul, à Jupiter plus Saturne, ou à l’ensemble du système planétaire.",
          "Si la croix reste dans le disque solaire, le barycentre est à l’intérieur du Soleil ; si elle tombe hors du disque, il se situe au-delà de la photosphère."
        ],
        links: [
          { label: "Glossaire JPL : barycenter", url: "https://ssd.jpl.nasa.gov/glossary/barycenter.html" },
          { label: "NASA Space Place: What is a barycenter?", url: "https://spaceplace.nasa.gov/barycenter/en/" },
          { label: "JPL: Approximate Positions of the Planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
        ]
      },
      lagrange: {
        intro: [
          "Cette carte montre les cinq points de Lagrange Soleil-Terre dans une vue de dessus en rotation.",
          "Les points de Lagrange sont des zones où la gravité et le mouvement orbital s’équilibrent, ce qui permet à une sonde de rester près du système Soleil-Terre avec relativement peu de corrections."
        ],
        formulas: [
          { expr: "L4, L5 = 60&deg; devant / derrière la Terre", note: "Les deux points stables triangulaires précèdent et suivent la Terre d’environ soixante degrés sur la même orbite." },
          { expr: "L1, L2 &asymp; 1.5 \\times 10^6 km de la Terre", note: "Distance approximative Terre-Soleil vers les points colinéaires intérieur et extérieur." }
        ],
        details: [
          "L1, L2 et L3 sont alignés sur l’axe Soleil-Terre et sont dynamiquement instables.",
          "L4 et L5 sont les deux sommets stables du triangle; JWST est montré près de L2 parce que le Soleil, la Terre et la Lune restent du même côté, ce qui garde le télescope froid et tourné vers l’espace profond."
        ],
        links: [
          { label: "NASA: What is a Lagrange point?", url: "https://science.nasa.gov/resource/what-is-a-lagrange-point/" },
          { label: "NASA Webb: Orbit near L2", url: "https://science.nasa.gov/mission/webb/orbit/" }
        ]
      },
      analemma: {
        intro: [
          "Cette carte montre l’analemme: la figure décrite par le Soleil lorsqu’on l’observe à la même heure civile tout au long de l’année.",
          "Ici, l’horizontale représente l’écart entre l’heure civile et le midi solaire, tandis que la verticale montre la hauteur du Soleil à midi pour le lieu choisi."
        ],
        formulas: [
          { expr: "EoT = 9.87 sin(2B) - 7.53 cos(B) - 1.5 sin(B)", note: "Approximation compacte de l’équation du temps en minutes." },
          { expr: "&delta; &asymp; 23.44&deg; \\cdot sin( 2&pi;(DOY - 80) / daysInYear )", note: "Approximation de la déclinaison solaire au cours de l’année." }
        ],
        details: [
          "Le point rouge marque la date sélectionnée dans l’année affichée.",
          "Comme le tableau de bord garde un réglage horaire global, cette carte approche le midi civil local à partir de la longitude au lieu de basculer toute l’application dans le fuseau légal de la ville."
        ],
        links: [
          { label: "USNO: The Equation of Time", url: "https://aa.usno.navy.mil/faq/eqtime" },
          { label: "NOAA solar calculation details", url: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" }
        ]
      },
      exoplanets: {
        intro: [
          "Cette carte compare quelques systèmes d’exoplanètes célèbres dans une vue compacte côte à côte.",
          "Chaque panneau prend sa propre orbite externe comme échelle d’affichage ; on compare donc l’architecture des systèmes plutôt qu’une taille absolue commune."
        ],
        formulas: [
          { expr: "P^2 &asymp; a^3 / M<sub>*</sub>", note: "Relation de Kepler simplifiée en unités solaires, utilisée ici seulement pour un mouvement orbital schématique." }
        ],
        details: [
          "TRAPPIST-1 montre à quel point des planètes rocheuses peuvent être serrées autour d’une petite étoile.",
          "Kepler-90, 55 Cancri et HR 8799 offrent des contre-exemples plus étendus, des mondes internes compacts aux géantes très éloignées."
        ],
        links: [
          { label: "NASA: TRAPPIST-1", url: "https://www.nasa.gov/trappist-1/" },
          { label: "NASA: faits sur les exoplanètes", url: "https://science.nasa.gov/exoplanets/facts/" },
          { label: "NASA Exoplanet Archive", url: "https://exoplanetarchive.ipac.caltech.edu/" }
        ]
      },
      polaris: {
        intro: [
          "Cette carte montre l’horizon nord, Polaris et le pôle nord céleste pour le lieu choisi.",
          "La hauteur du pôle au-dessus de l’horizon correspond approximativement à la latitude géographique, et les étoiles voisines tournent autour avec le temps sidéral."
        ],
        formulas: [
          { expr: "h<sub>pôle</sub> &asymp; \\varphi", note: "Dans l’hémisphère nord, la hauteur du pôle nord céleste est approximativement égale à la latitude géographique." }
        ],
        details: [
          "Polaris n’est pas exactement sur le pôle ; le petit cercle autour du pôle est agrandi ici pour rendre cet écart visible.",
          "La ligne bleue prolonge l’axe de rotation de la Terre dans le ciel, et les astérismes voisins montrent la rotation apparente autour de cet axe."
        ],
        links: [
          { label: "NASA: Qu’est-ce que l’étoile polaire ?", url: "https://science.nasa.gov/solar-system/what-is-the-north-star-and-how-do-you-find-it/" }
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
          { label: "NASA: Asteroids, Comets & Meteors", url: "https://science.nasa.gov/asteroids-comets-meteors/" }
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
        formulas: [
          { expr: "r = R (1 - hauteur / 90)", note: "Le petit repere du ciel projette la hauteur sur un cercle d'horizon : les objets eleves se rapprochent du centre." }
        ],
        details: [
          "Le choix depend du mois et vise une lecture saisonniere pour l'Europe centrale.",
          "Les noms d'etoiles sont places pour rester lisibles sur des ecrans compacts.",
          "Le petit repere du ciel est un guide compact du ciel du soir avec azimut et hauteur approximatifs pour l'Europe centrale."
        ],
        links: [
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "IAU constellation charts", url: "https://www.iau.org/Iau/Science/What-we-do/The-Constellations.aspx" },
          { label: "CDS VizieR star catalog service", url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-2" }
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "timeanddate: Ciel nocturne et visibilité des planètes", url: "https://www.timeanddate.com/astronomy/night/" }
        ]
      },
      moon_nodes: {
        markerNote: "Les deux petits marqueurs bleus sont les nœuds lunaires et non des corps supplémentaires : ils indiquent les points où l’orbite inclinée de la Lune coupe l’écliptique.",
        intro: [
          "Cette carte relie la geometrie des noeuds lunaires a un cycle approche des saisons d'eclipses pour la date choisie.",
          "Elle montre pourquoi les eclipses arrivent par saisons au lieu d'etre possibles tous les mois."
        ],
        formulas: [
          { expr: "d<sub>noeud</sub> = min(f, 1-f) &middot; 27.2122 d", note: "Distance approximee au noeud lunaire le plus proche a partir de la phase draconitique f." },
          { expr: "d<sub>saison</sub> = min(s, P-s), &nbsp; P &asymp; 173.31 d", note: "Distance approximee au centre de la saison d'eclipses." },
          { expr: "UTC &asymp; t<sub>local</sub> - offset<sub>zone</sub>", note: "L'aperçu convertit les heures locales editorialisees en instants UTC approximatifs avec le fuseau horaire de la ville choisie." },
          { expr: "H = LST - &alpha;, &nbsp; sin h = sin &phi; sin &delta; + cos &phi; cos &delta; cos H", note: "Angle horaire H et hauteur h a partir du temps sideral local, de la latitude &phi;, de l'ascension droite &alpha; et de la declinaison &delta;." },
          { expr: "A = atan2( sin H, cos H sin &phi; - tan &delta; cos &phi; )", note: "Azimut approche A utilise pour la boussole de l'aperçu d'eclipse." }
        ],
        details: [
          "L'orbite interieure montre la position de la Lune par rapport a la ligne des noeuds pour la date choisie.",
          "L'anneau exterieur utilise une approximation repetitive du cycle des saisons d'eclipses a but pedagogique.",
          "La direction, la hauteur sur l'horizon et la fleche de boussole sont des aides d'observation, pas un simulateur local complet d'eclipse."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Moon", url: "https://science.nasa.gov/moon/" },
          { label: "timeanddate: Éclipses", url: "https://www.timeanddate.com/eclipse/" }
        ]
      },
      conjunctions: {
        "intro": [
          "Montre les rapprochements de Mercure, Vénus, Mars, Jupiter et Saturne vus de la Terre dans les 60 jours avant et après l’instant choisi.",
          "Les événements sont les minima de la séparation angulaire complète jusqu’à 4,5°, latitude écliptique comprise. Ils ne coïncident pas forcément avec une égalité de longitude ou d’ascension droite."
        ],
        "formulas": [
          {
            "expr": "r_A = R_A - R_E; r_B = R_B - R_E",
            "note": "Vecteurs géocentriques : soustraire la position héliocentrique de la Terre. Le produit scalaire utilise les trois coordonnées ; borner à [−1,1] avant arccos."
          },
          {
            "expr": "&Delta; = arccos( clamp( (r_A &middot; r_B) / (|r_A| |r_B|), -1, 1 ) )",
            "note": "Vecteurs géocentriques : soustraire la position héliocentrique de la Terre. Le produit scalaire utilise les trois coordonnées ; borner à [−1,1] avant arccos."
          }
        ],
        "details": [
          "Des échantillons quotidiens repèrent les minima possibles ; une recherche par section dorée affine chaque candidat entre les deux jours voisins. Un intervalle de recherche d’une minute ne garantit pas une précision astronomique à la minute.",
          "Les orbites géométriques approchées sont partagées avec la carte de l’horizon. Sans correction de temps de lumière, aberration ni parallaxe locale. La lumière du jour, la hauteur et la météo ne filtrent pas les événements.",
          "Le centre marqué correspond à l’instant choisi ; les dates et événements suivent la même échelle de temps écoulé. Le résumé donne le prochain minimum futur dans la fenêtre affichée.",
          "Tous les points ont la même taille. Chaque séparation comprend aussi les comparaisons communes avec les doigts, le pouce ou la main à bout de bras. Ce sont des repères approximatifs ; sous 1°, le texte indique moins d’un doigt."
        ],
        "links": [
          {
            "label": "JPL: Approximate Positions of the Planets",
            "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
          },
          {
            "label": "NASA Skywatching",
            "url": "https://science.nasa.gov/skywatching/"
          }
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
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
          { label: "NASA Skywatching", url: "https://science.nasa.gov/skywatching/" },
          { label: "IAU constellation charts", url: "https://www.iau.org/Iau/Science/What-we-do/The-Constellations.aspx" },
          { label: "CDS VizieR star catalog service", url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-2" }
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
          { label: "NOAA SWPC", url: "https://www.spaceweather.gov/" },
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
          { expr: "r = R |cos(2&pi;f)|", note: "Demi-axe projeté du terminateur ; le côté éclairé suit le modèle de phase existant." },
          { expr: "age = ((t - t<sub>0</sub>) mod 29.530588861 d)", note: "Age lunaire a partir d'une nouvelle lune de reference et du mois synodique." },
          { expr: "illum = 0.5 (1 - cos(2&pi;f))", note: "Fraction eclairee selon la phase lunaire f." },
          { expr: "cos H = (cos Z - sin &delta; sin &phi;) / (cos &delta; cos &phi;)", note: "Relation de base pour lever, coucher et crepuscule du Soleil." }
        ],
        details: [
          "L’orbite accélérée est une vue schématique de côté : la lumière du Soleil vient de la gauche, donc la moitié gauche de la Lune reste éclairée dans cette vue. Les détails de surface tournent une fois par orbite et gardent le même hémisphère face à la Terre. La grande Lune en dessous suit la date choisie, éclairée à droite en phase croissante et à gauche en phase décroissante (convention nord). La phase vient de la vue de la moitié éclairée, pas de l’ombre de la Terre. Continents, cratères et échelles sont schématiques ; les éclipses et la libration lunaire ne sont pas simulées.",
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
          "Le calendrier du ciel combine une liste d'evenements filtres avec une vraie vue mensuelle pour les eclipses, les maxima meteoritiques, les jalons lunaires, les phenomenes planetaires et les saisons.",
          "Le mode Liste sert a la lecture compacte, le mode Calendrier a parcourir le mois jour par jour."
        ],
        details: [
          "Les entrees du calendrier vivent dans des fichiers de configuration dedies et couvrent actuellement 2026 jusqu'a decembre 2040.",
          "Les boutons de telechargement creent des fichiers ICS. C'est un format de calendrier courant que l'on peut importer dans Apple Calendar, Google Calendar, Outlook et beaucoup d'apps mobiles.",
          "Cette carte est editorialisee: elle peut donc melanger horaires calcules et notes d'observation redigees a la main."
        ],
        links: [
          { label: "NASA: Eclipses", url: "https://science.nasa.gov/eclipses/" },
          { label: "NASA: Meteors and Meteorites", url: "https://science.nasa.gov/solar-system/meteors-meteorites/" },
          { label: "Wikipedia: iCalendar", url: "https://fr.wikipedia.org/wiki/ICalendar" },
          { label: "timeanddate: Astronomie", url: "https://www.timeanddate.com/astronomy/" }
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

window.PLANETENUHR_CARD_HELP.en.cards.planet_horizon = {
  "intro": [
    "A panorama of the seven other planets for the selected location and instant. Shading marks the area below the horizon.",
    "Select a numbered planet to inspect its direction and altitude. The ±12-hour slider only changes this card."
  ],
  "details": [
    "Times use the selected city's time zone. Selected time restores the shared dashboard instant.",
    "J2000 positions are precessed to the date, then converted using local sidereal time. No refraction, nutation, aberration or observed light-time correction.",
    "Position above the horizon does not guarantee visibility. The orbital elements are fitted to 1800–2050; dates outside this interval are extrapolated."
  ],
  "links": [
    {
      "label": "JPL approximate positions",
      "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.en.cards.light_travel = {
  "intro": [
    "Follow sunlight from the Sun to any of the eight planets or Voyager 1. Travel time follows the solar distance on the selected date."
  ],
  "formulas": [
    {
      "expr": "t = r / c",
      "note": "One-way vacuum travel time; 1 AU = 149,597,870.7 km, c = 299,792.458 km/s."
    }
  ],
  "details": [
    "The destination is held at its computed position. Motion during flight is not followed.",
    "The route is schematic. Start at zero in real time: one real second equals one journey second. You can move the slider manually; an active journey continues from there. Changing destination or date resets the journey. Progress p = min(1, p₀ + elapsed time / travel time), where p₀ is the manually chosen starting fraction.",
    "Voyager 1 uses two locally stored solar-distance samples from NASA Eyes. Distance is estimated linearly: r(t) = r₀ + (r₁ − r₀) × (t − t₀)/(t₁ − t₀). The estimate is limited to five years either side of the latest sample; outside this interval the journey is unavailable. This is not live telemetry or a full trajectory.",
    "NASA predicts that Voyager 1 will become the first human-made object one light-day from Earth on 18 November 2026: about 25.9 billion km. This card always starts at the Sun. The Earth and Sun light times can differ by about eight minutes. Voyager 2 is expected to reach one light-day from Earth in November 2035."
  ],
  "links": [
    {
      "label": "JPL astrodynamic parameters",
      "url": "https://ssd.jpl.nasa.gov/astro_par.html"
    },
    {
      "label": "NASA: Voyager / one light-day",
      "url": "https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/"
    },
    {
      "label": "NASA Eyes: Voyager 1 solar-distance data",
      "url": "https://eyes.nasa.gov/assets/dynamic/dynamo/sc_voyager_1/now.json"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.de.cards.planet_horizon = {
  "intro": [
    "Ein Panorama der sieben anderen Planeten für den gewählten Ort und Zeitpunkt. Die Schattierung kennzeichnet den Bereich unter dem Horizont.",
    "Ein nummerierter Planet lässt sich auswählen, um Richtung und Höhe abzulesen. Der Zeitregler erkundet ±12 Stunden und verändert nur diese Kachel."
  ],
  "details": [
    "Die Uhrzeit folgt der Zeitzone des gewählten Ortes. Ausgewählte Zeit setzt den lokalen Zeitversatz zurück.",
    "J2000-Positionen werden auf das Datum präzediert und mit der lokalen Sternzeit in Horizontkoordinaten umgerechnet. Ohne Brechung, Nutation, Aberration und Lichtzeitkorrektur der beobachteten Positionen.",
    "Über dem Horizont bedeutet nicht automatisch sichtbar. Die Bahnelemente gelten für 1800–2050; außerhalb wird extrapoliert."
  ],
  "links": [
    {
      "label": "JPL: Genäherte Planetenpositionen",
      "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.de.cards.light_travel = {
  "intro": [
    "Eine Lichtreise von der Sonne zu einem der acht Planeten oder zu Voyager 1. Die Reisezeit folgt dem Sonnenabstand am gewählten Datum."
  ],
  "formulas": [
    {
      "expr": "t = r / c",
      "note": "Einfache Lichtlaufzeit im Vakuum; 1 AE = 149.597.870,7 km, c = 299.792,458 km/s."
    }
  ],
  "details": [
    "Das Ziel bleibt an der berechneten Position. Die Bewegung während des Lichtflugs wird nicht nachgeführt.",
    "Die Strecke ist schematisch. Start bei null in Echtzeit: Eine echte Sekunde entspricht einer Reisesekunde. Der Regler lässt sich manuell verschieben; eine laufende Reise geht dort weiter. Bei Ziel- oder Datumswechsel beginnt die Reise neu. Fortschritt p = min(1, p₀ + verstrichene Zeit / Lichtlaufzeit), wobei p₀ der manuell gewählte Startanteil ist.",
    "Für Voyager 1 werden zwei lokal gespeicherte Sonnenabstände aus NASA Eyes verwendet. Der Abstand wird linear angenähert: r(t) = r₀ + (r₁ − r₀) × (t − t₀)/(t₁ − t₀). Die Näherung ist auf fünf Jahre vor und nach dem jüngsten Stützzeitpunkt begrenzt; außerhalb ist die Reise nicht verfügbar. Das ist keine Live-Telemetrie und keine vollständige Flugbahn.",
    "Laut NASA erreicht Voyager 1 am 18. November 2026 als erstes menschengemachtes Objekt einen Lichttag Abstand zur Erde: rund 25,9 Milliarden Kilometer. Diese Kachel startet stets an der Sonne. Die Lichtlaufzeiten ab Erde und Sonne können sich um etwa acht Minuten unterscheiden. Voyager 2 erreicht einen Lichttag Abstand zur Erde voraussichtlich im November 2035."
  ],
  "links": [
    {
      "label": "JPL: Astronomische Konstanten",
      "url": "https://ssd.jpl.nasa.gov/astro_par.html"
    },
    {
      "label": "NASA: Voyager / one light-day",
      "url": "https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/"
    },
    {
      "label": "NASA Eyes: Voyager 1 solar-distance data",
      "url": "https://eyes.nasa.gov/assets/dynamic/dynamo/sc_voyager_1/now.json"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.fr.cards.planet_horizon = {
  "intro": [
    "Un panorama des sept autres planètes pour le lieu et l’instant choisis. La zone ombrée est sous l’horizon.",
    "Sélectionnez une planète numérotée pour lire sa direction et sa hauteur. Le curseur explore ±12 heures et ne modifie que cette carte."
  ],
  "details": [
    "L’heure suit le fuseau du lieu choisi. Heure sélectionnée rétablit l’instant partagé.",
    "Les positions J2000 sont précessées à la date, puis converties avec le temps sidéral local. Sans réfraction, nutation, aberration ni correction du temps de lumière observé.",
    "Au-dessus de l’horizon ne signifie pas forcément visible. Les éléments orbitaux sont valables pour 1800–2050 ; au-delà, ils sont extrapolés."
  ],
  "links": [
    {
      "label": "JPL : positions approchées",
      "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.fr.cards.light_travel = {
  "intro": [
    "Un voyage de la lumière du Soleil vers l’une des huit planètes ou Voyager 1. La durée dépend de la distance au Soleil à la date choisie."
  ],
  "formulas": [
    {
      "expr": "t = r / c",
      "note": "Trajet simple dans le vide ; 1 UA = 149 597 870,7 km, c = 299 792,458 km/s."
    }
  ],
  "details": [
    "La destination reste à sa position calculée, sans suivre son mouvement pendant le trajet.",
    "Trajet schématique. Départ à zéro en temps réel : une seconde réelle correspond à une seconde de voyage. Le curseur peut être déplacé à la main ; un voyage en cours continue à partir de là. Changer de destination ou de date remet le voyage à zéro. Progression p = min(1, p₀ + temps écoulé / durée du trajet), où p₀ est la fraction de départ choisie manuellement.",
    "Pour Voyager 1, deux distances au Soleil de NASA Eyes sont conservées localement. La distance est estimée linéairement : r(t) = r₀ + (r₁ − r₀) × (t − t₀)/(t₁ − t₀). Cette estimation est limitée à cinq ans avant et après la référence la plus récente ; le voyage est indisponible au-delà. Ce n’est ni une télémétrie en direct ni une trajectoire complète.",
    "Selon la NASA, Voyager 1 sera le premier objet fabriqué par l’homme à un jour-lumière de la Terre le 18 novembre 2026, soit environ 25,9 milliards de kilomètres. Cette carte part toujours du Soleil. Les durées depuis la Terre et le Soleil peuvent différer d’environ huit minutes. Voyager 2 devrait atteindre un jour-lumière de la Terre en novembre 2035."
  ],
  "links": [
    {
      "label": "JPL : constantes astronomiques",
      "url": "https://ssd.jpl.nasa.gov/astro_par.html"
    },
    {
      "label": "NASA: Voyager / one light-day",
      "url": "https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/"
    },
    {
      "label": "NASA Eyes: Voyager 1 solar-distance data",
      "url": "https://eyes.nasa.gov/assets/dynamic/dynamo/sc_voyager_1/now.json"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.en.cards.planet_horizon.details.push("The sky colour and local-day band follow the solar altitude: sunrise/set at −0.8333°, civil twilight to −6°, nautical twilight to −12°, astronomical twilight to −18°, then night. The day band follows the city's actual civil day, including DST, polar day and polar night. The cursor follows the local exploratory time; it does not rebuild the controls.");
window.PLANETENUHR_CARD_HELP.de.cards.planet_horizon.details.push("Himmelsfarbe und Tagesband folgen der Sonnenhöhe: Auf-/Untergang bei −0,8333°, bürgerliche Dämmerung bis −6°, nautische bis −12°, astronomische bis −18°, danach Nacht. Das Zeitband folgt dem tatsächlichen lokalen Tag einschließlich Zeitumstellung, Polartag und Polarnacht. Der Zeiger folgt der erkundeten Uhrzeit, ohne die Bedienelemente neu aufzubauen.");
window.PLANETENUHR_CARD_HELP.fr.cards.planet_horizon.details.push("La couleur du ciel et la bande du jour local suivent la hauteur solaire : lever/coucher à −0,8333°, crépuscule civil jusqu’à −6°, nautique jusqu’à −12°, astronomique jusqu’à −18°, puis nuit. La bande respecte la journée locale réelle, les changements d’heure et les jours/nuits polaires. Le curseur suit l’heure explorée sans recréer les commandes.");
window.PLANETENUHR_CARD_HELP.en.cards.planet_horizon.links.push({ label:"USNO: Rise, set and twilight definitions", url:"https://aa.usno.navy.mil/faq/RST_defs" });
window.PLANETENUHR_CARD_HELP.de.cards.planet_horizon.links.push({ label:"USNO: Aufgang, Untergang und Dämmerung", url:"https://aa.usno.navy.mil/faq/RST_defs" });
window.PLANETENUHR_CARD_HELP.fr.cards.planet_horizon.links.push({ label:"USNO : lever, coucher et crépuscules", url:"https://aa.usno.navy.mil/faq/RST_defs" });
// Knowledge-card help stays concise; each entry carries its own source and caveats.
window.PLANETENUHR_CARD_HELP.de.cards.sky_knowledge = {
  "intro": [
    "31 kurze Einträge: elf Eselsbrücken und Merksätze, zehn Planetenfakten und zehn Sternenfakten."
  ],
  "details": [
    "Jeder Eintrag hat eine kleine statische Grafik mit sichtbarer Bildunterschrift. Größen, Abstände, Sternbildlinien und Farben sind überwiegend schematisch; Ausnahmen und verwendete Zahlen werden erläutert. Die Bilder zeigen keine aktuellen Positionen oder Mondphasen. Die Fusion ist stark vereinfacht.",
    "Beim Laden wird die Reihenfolge zufällig gemischt. „Nächster“ zeigt jeden Eintrag einmal, bevor eine neue Runde beginnt. Es gibt keinen automatischen Wechsel.",
    "Fremdsprachige Originale bleiben erhalten und bilden eigene Einträge. In den anderen Sprachen erscheint darunter ein übersetzter Untertitel; die Erklärung folgt der App-Sprache.",
    "Quellen und örtliche Einschränkungen stehen direkt beim Eintrag. Eigene Formulierungen sind gekennzeichnet; ihre Quelle belegt den Sachinhalt, nicht den Wortlaut. Die französische p/d-Regel fasst eine belegte Merkmethode zusammen.",
    "Die Inhalte hängen nicht vom gewählten Datum oder Ort ab. Mondregeln sind ausdrücklich regionale Orientierungshilfen. Quellenstand: 19. Oktober 2026."
  ]
};
window.PLANETENUHR_CARD_HELP.en.cards.sky_knowledge = {
  "intro": [
    "31 short entries: eleven mnemonics and memory aids, ten planet facts and ten star facts."
  ],
  "details": [
    "Each entry has a small static graphic with a visible caption. Sizes, distances, constellation lines and colours are mostly schematic; exceptions and numerical values are explained. Images do not show current positions or Moon phases. Fusion is highly simplified.",
    "The order is shuffled on loading. “Next” shows each entry once before a new round begins. Entries never rotate automatically.",
    "Foreign-language originals remain unchanged and are separate entries. Other languages show a translated subtitle; explanations follow the app language.",
    "Sources and regional limitations appear with each entry. App-authored wording is marked; its source supports the facts rather than the wording. The French p/d rule summarizes a documented memory technique.",
    "Content is independent of the selected date and place. Moon rules are explicitly regional guides. References checked: 19 October 2026."
  ]
};
window.PLANETENUHR_CARD_HELP.fr.cards.sky_knowledge = {
  "intro": [
    "31 entrées courtes : onze astuces et aides-mémoire, dix faits sur les planètes et dix sur les étoiles."
  ],
  "details": [
    "Chaque entrée comporte un petit schéma statique avec une légende visible. Tailles, distances, lignes des constellations et couleurs sont généralement schématiques ; les exceptions et valeurs sont expliquées. Les images ne montrent ni positions ni phases lunaires actuelles. La fusion est très simplifiée.",
    "L’ordre est mélangé au chargement. « Suivant » affiche chaque entrée une fois avant de commencer une nouvelle série. Il n’y a aucun changement automatique.",
    "Les originaux en langue étrangère restent inchangés et constituent des entrées distinctes. Les autres langues affichent un sous-titre traduit ; les explications suivent la langue de l’application.",
    "Les sources et les limites régionales figurent dans chaque entrée. Les formulations originales sont signalées ; leur source confirme les faits, pas le texte. La règle française p/d résume une méthode mnémotechnique documentée.",
    "Ces contenus sont indépendants de la date et du lieu sélectionnés. Les règles lunaires sont explicitement des repères régionaux. Sources vérifiées le 19 octobre 2026."
  ]
};

// IDEFIX: source provenance, interpolation and schematic local moon geometry.
window.PLANETENUHR_CARD_HELP.de.cards.idefix = {
  "intro": [
    "IDEFIX ist der deutsch-französische Rover von DLR und CNES an Bord der japanischen MMX-Mission. Die Kachel zeigt die Reise von der Erde zum Mars und den geplanten Einsatz auf Phobos."
  ],
  "formulas": [
    {
      "expr": "r(t) = (1 − u) r₀ + u r₁",
      "note": "Lineare Interpolation zwischen zwei gespeicherten JPL-Vektoren: u = (t − t₀)/(t₁ − t₀). Zeiten sind UTC, Positionen heliozentrisch in AE, Ekliptik J2000/ICRF. Außerhalb der Datenabdeckung wird nicht extrapoliert."
    },
    {
      "expr": "x = 310 + 94 X; y = 180 − 94 Y",
      "note": "Draufsicht: X und Y sind die ekliptischen Koordinaten in AE, x und y SVG-Koordinaten. Die z-Komponente wird nicht gezeigt. Planeten- und Rovergrößen sind vergrößert."
    },
    {
      "expr": "φ = 2π frac((t − t₀)/T)",
      "note": "Phobos-Detail: T = 0,31891 Tage, rund 7 h 39 min. Nullphase und Orientierung sind frei gewählt. Das ist eine vergrößerte Umlaufskizze, keine berechnete Phobos-Ephemeride."
    }
  ],
  "details": [
    "Die eingebundene JAXA-Vorstartplanung vom 7. Oktober 2026 stammt aus JPL Horizons, Objekt −239. 825 Positionen decken den 19. Oktober 2026, 21:00 UTC, bis 30. Dezember 2028, 21:00 UTC, ab. In der ersten Woche liegen sie sechs Stunden, danach einen Tag auseinander. Auch die aktuelle Markierung ist eine Vorhersage, keine Live-Telemetrie.",
    "Die bestätigte Startmeldung und ihr Prüfdatum stehen getrennt von den zeitabhängigen Planungsphasen. Der Status wird nicht automatisch aus Webseiten ausgelesen. Nach zwei Wochen weist die Kachel auf den älteren Meldungsstand hin; aktuelle Nachrichten führen direkt zum JAXA-Blog und den Partnern.",
    "August 2027 für Mars und Ende 2028/Anfang 2029 für die Roverlandung sind Planungszeiträume. Die intern verwendeten Tagesgrenzen und Sprungtage dienen nur der Zeitleiste. Eine hohle Markierung ab Ende der Bahnabdeckung zeigt ausschließlich den geplanten Zielbereich bei Phobos, keine bestätigte Landung oder Oberflächenposition.",
    "IDEFIX soll etwa 100 Tage auf Phobos arbeiten und dort bleiben. Die geplante Probenrückkehr 2031 ist keine Rückreise des Rovers.",
    "Tage, Monate und Jahre lassen sich lokal erkunden. „Heute“ stellt die aktuelle Uhrzeit her, „Dashboardzeit“ übernimmt das gemeinsame Datum. Ein deutlicher Datumswechsel im Dashboard setzt den lokalen Versatz zurück. Positionen werden im Hintergrund einmal pro Minute aktualisiert; Controls und SVG-Knoten bleiben bestehen."
  ],
  "links": [
    {
      "label": "JAXA · MMX Mission News",
      "url": "https://mmx-news.isas.jaxa.jp/"
    },
    {
      "label": "CNES · MMX chronology",
      "url": "https://cnes.fr/en/projects/mmx"
    },
    {
      "label": "ESA · Mission timeline",
      "url": "https://www.esa.int/Science_Exploration/Space_Science/Mars_moon_lander_set_to_launch_on_19_October"
    },
    {
      "label": "NASA/JPL Horizons · MMX (-239)",
      "url": "https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-239%27&MAKE_EPHEM=%27NO%27"
    },
    {
      "label": "NASA · Mars / Phobos facts",
      "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html?level=1"
    }
  ]
};
window.PLANETENUHR_CARD_HELP.en.cards.idefix = {
  "intro": [
    "IDEFIX is the French-German rover built by CNES and DLR aboard Japan’s MMX mission. This card follows the journey from Earth to Mars and the planned exploration of Phobos."
  ],
  "formulas": [
    {
      "expr": "r(t) = (1 − u) r₀ + u r₁",
      "note": "Linear interpolation between cached JPL vectors: u = (t − t₀)/(t₁ − t₀). Times are UTC; heliocentric positions are in AU, ecliptic J2000/ICRF. There is no extrapolation beyond coverage."
    },
    {
      "expr": "x = 310 + 94 X; y = 180 − 94 Y",
      "note": "Top view: X and Y are ecliptic coordinates in AU; x and y are SVG coordinates. The z component is omitted. Planet and rover sizes are enlarged."
    },
    {
      "expr": "φ = 2π frac((t − t₀)/T)",
      "note": "Phobos detail: T = 0.31891 days, about 7 h 39 min. Zero phase and orientation are arbitrary. This is an enlarged orbital sketch, not a Phobos ephemeris."
    }
  ],
  "details": [
    "The JAXA pre-launch planning solution revised 7 October 2026 is supplied by JPL Horizons, object −239. Its 825 cached positions cover 19 October 2026, 21:00 UTC, to 30 December 2028, 21:00 UTC: six-hour intervals in the first week, then daily. The current marker is also a prediction, not live telemetry.",
    "The confirmed launch report and review date are separate from the displayed planning phases. Status is not scraped automatically. After two weeks the card flags the older report; links lead directly to the JAXA mission blog and partners.",
    "August 2027 for Mars arrival and late 2028/early 2029 for rover landing are planning periods. Internal day boundaries and preset days only organize the timeline. A hollow marker after trajectory coverage ends shows only the planned destination near Phobos, not a confirmed landing or surface location.",
    "IDEFIX is planned to operate on Phobos for about 100 days and remain there. The planned sample return in 2031 does not bring the rover home.",
    "Explore days, months and years locally. “Today” restores the current time; “Dashboard time” follows the shared date. A substantial dashboard date change resets local exploration. Positions refresh once a minute; controls and SVG nodes are retained."
  ],
  "links": [
    {
      "label": "JAXA · MMX Mission News",
      "url": "https://mmx-news.isas.jaxa.jp/"
    },
    {
      "label": "CNES · MMX chronology",
      "url": "https://cnes.fr/en/projects/mmx"
    },
    {
      "label": "ESA · Mission timeline",
      "url": "https://www.esa.int/Science_Exploration/Space_Science/Mars_moon_lander_set_to_launch_on_19_October"
    },
    {
      "label": "NASA/JPL Horizons · MMX (-239)",
      "url": "https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-239%27&MAKE_EPHEM=%27NO%27"
    },
    {
      "label": "NASA · Mars / Phobos facts",
      "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html?level=1"
    }
  ]
};
window.PLANETENUHR_CARD_HELP.fr.cards.idefix = {
  "intro": [
    "IDEFIX est le rover franco-allemand du CNES et du DLR embarqué sur la mission japonaise MMX. Cette carte suit le voyage de la Terre à Mars et l’exploration prévue de Phobos."
  ],
  "formulas": [
    {
      "expr": "r(t) = (1 − u) r₀ + u r₁",
      "note": "Interpolation linéaire entre deux vecteurs JPL enregistrés : u = (t − t₀)/(t₁ − t₀). Temps UTC ; positions héliocentriques en UA, écliptique J2000/ICRF. Aucune extrapolation hors des données."
    },
    {
      "expr": "x = 310 + 94 X; y = 180 − 94 Y",
      "note": "Vue de dessus : X et Y sont les coordonnées écliptiques en UA ; x et y les coordonnées SVG. La composante z est omise. Les planètes et le rover sont agrandis."
    },
    {
      "expr": "φ = 2π frac((t − t₀)/T)",
      "note": "Détail de Phobos : T = 0,31891 jour, environ 7 h 39 min. Phase initiale et orientation arbitraires. C’est un schéma orbital agrandi, pas une éphéméride de Phobos."
    }
  ],
  "details": [
    "La prévision JAXA avant lancement, révisée le 7 octobre 2026, provient de JPL Horizons, objet −239. Les 825 positions vont du 19 octobre 2026 à 21 h UTC au 30 décembre 2028 à 21 h UTC, toutes les six heures la première semaine puis chaque jour. Même le marqueur actuel est une prévision, sans télémétrie en direct.",
    "La confirmation du lancement et sa date de vérification sont séparées des phases prévues. L’état n’est pas extrait automatiquement des sites. Après deux semaines, la carte signale l’ancienneté de l’information ; les liens mènent au blog JAXA et aux partenaires.",
    "Août 2027 pour Mars et fin 2028/début 2029 pour le rover sont des périodes prévues. Les limites journalières et dates des boutons servent seulement à la frise. Après la fin des données, un marqueur creux indique uniquement la destination prévue près de Phobos, pas un atterrissage ou un emplacement confirmé.",
    "IDEFIX doit travailler environ 100 jours sur Phobos et y rester. Le retour prévu des échantillons en 2031 ne ramène pas le rover.",
    "Explorer localement les jours, mois et années. « Aujourd’hui » rétablit l’heure actuelle ; « Date du tableau » reprend la date commune. Un changement important de date du tableau réinitialise l’exploration. Les positions s’actualisent chaque minute sans remplacer les contrôles ni les nœuds SVG."
  ],
  "links": [
    {
      "label": "JAXA · MMX Mission News",
      "url": "https://mmx-news.isas.jaxa.jp/"
    },
    {
      "label": "CNES · MMX chronology",
      "url": "https://cnes.fr/en/projects/mmx"
    },
    {
      "label": "ESA · Mission timeline",
      "url": "https://www.esa.int/Science_Exploration/Space_Science/Mars_moon_lander_set_to_launch_on_19_October"
    },
    {
      "label": "NASA/JPL Horizons · MMX (-239)",
      "url": "https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-239%27&MAKE_EPHEM=%27NO%27"
    },
    {
      "label": "NASA · Mars / Phobos facts",
      "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html?level=1"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.en.cards.daily_highlights = {
  "intro": [
    "The first card summarizes the most important existing information for the selected date and place. It follows the global date control; this need not be today.",
    "It refers to the entire civil day at the selected city, including an earlier morning. Times are local. Links open the related card without reloading the page."
  ],
  "details": [
    "Besondere Kalenderereignisse und aktuelle Himmelsereignisse haben Vorrang. Je nach Datum gibt es unterschiedlich viele Hinweise; die Kachel füllt freie Plätze nicht künstlich auf.",
    "Beobachtungstipps sind Näherungen. Wetter, Gebäude, Gelände und die tatsächliche Sichtbarkeit am Himmel kann die Kachel nicht beurteilen.",
    "Meteorhinweise beschreiben die Zeit um den jährlichen Strom und sein Maximum; sie garantieren keine sichtbaren Meteore. Helles Mondlicht kann schwache Meteore überstrahlen. Mondphasen und Begegnungsdaten sind ebenfalls Näherungsangaben."
  ],
  "links": [
    {
      "label": "JPL approximate planetary positions",
      "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.de.cards.daily_highlights = {
  "intro": [
    "Die erste Kachel bündelt die wichtigsten vorhandenen Informationen für das gewählte Datum und den Ort. Sie folgt dem globalen Datumsregler; das muss nicht heute sein.",
    "Gemeint ist der gesamte lokale Kalendertag, auch ein bereits vergangener Morgen. Alle Zeiten sind Ortszeiten. Links öffnen die passende Kachel ohne Neuladen."
  ],
  "details": [
    "Besondere Kalender- und Himmelsereignisse haben Vorrang. Je nach Datum erscheinen unterschiedlich viele Hinweise; freie Plätze werden nicht künstlich aufgefüllt.",
    "Beobachtungstipps sind Näherungen. Wetter, Gebäude, Gelände und die tatsächliche Sichtbarkeit am Himmel kann die Kachel nicht beurteilen.",
    "Meteorhinweise beschreiben die Aktivitätszeit eines Stroms und sein jährliches Maximum; sie garantieren keine sichtbaren Meteore. Helles Mondlicht kann schwache Meteore überstrahlen. Mondphasen und Begegnungsdaten sind ebenfalls Näherungsangaben."
  ],
  "links": [
    {
      "label": "JPL: Genäherte Planetenpositionen",
      "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
    }
  ]
};

window.PLANETENUHR_CARD_HELP.fr.cards.daily_highlights = {
  "intro": [
    "La première carte rassemble les informations existantes importantes pour la date et le lieu choisis. Elle suit le curseur global ; il ne s’agit pas forcément d’aujourd’hui.",
    "Elle couvre toute la journée civile locale, y compris un matin déjà passé. Les heures sont locales. Les liens ouvrent la carte correspondante sans recharger la page."
  ],
  "details": [
    "Les événements importants du calendrier et du ciel sont prioritaires. Le nombre d’indications varie selon la date ; les places libres ne sont pas artificiellement remplies.",
    "Les conseils d’observation sont approximatifs. La carte ne peut pas évaluer la météo, les bâtiments, le relief ni la visibilité réelle du ciel.",
    "Les indications de météores décrivent la période d’activité et le maximum annuel d’un essaim ; elles ne garantissent pas l’observation de météores. Une Lune brillante peut masquer les météores faibles. Les phases lunaires et rapprochements sont également approximatifs."
  ],
  "links": [
    {
      "label": "JPL : positions planétaires approchées",
      "url": "https://ssd.jpl.nasa.gov/planets/approx_pos.html"
    }
  ]
};

/* Shared body artwork and its schematic limits. */
window.PLANETENUHR_CARD_HELP.de.cards.solar_system.details.push("Alle acht Planeten verwenden gemeinsame SVG-Grafiken. Größen und Abstände sind nicht maßstäblich. Die Bahnradien sind feste Layoutwerte aus js/data/solar-system-config.js, keine Entfernungsangaben. Die inneren Planeten erhalten mehr Platz; nur die berechneten heliozentrischen Richtungen folgen dem Datum. Die Erde erscheint in dieser Übersicht ohne Nachtseite; Kontinente sind schematisch. Verschobene Beschriftungen erhalten gerade Verbindungslinien.");
window.PLANETENUHR_CARD_HELP.de.cards.daily_highlights.details.push("Die Miniaturen sind schematisch und teilen ihre Planeten-, Erd- und Mondgrafiken mit den anderen Kacheln. Die Mondphase verwendet dasselbe Näherungsmodell und dieselbe Lichtgrenze wie „Erde & Mond“; Farben und Oberflächen sind Illustrationen.");
window.PLANETENUHR_CARD_HELP.en.cards.solar_system.details.push("All eight planets use shared SVG artwork. Sizes and distances are schematic. Fixed layout radii in js/data/solar-system-config.js spread out the inner planets and do not encode distance. Only the calculated heliocentric directions follow the date. Earth is shown without a night-side shadow in this overview; continents are schematic. Displaced labels use straight guides.");
window.PLANETENUHR_CARD_HELP.en.cards.daily_highlights.details.push("The schematic miniatures share their planet, Earth and Moon artwork with the other cards. The lunar phase uses the same approximate model and terminator as Earth & Moon; colors and surface features are illustrations.");
window.PLANETENUHR_CARD_HELP.fr.cards.solar_system.details.push("Les huit planètes utilisent des illustrations SVG communes. Tailles et distances sont schématiques. Les rayons fixes de js/data/solar-system-config.js espacent les planètes intérieures sans représenter leurs distances. Seules les directions héliocentriques calculées suivent la date. La Terre est représentée sans ombre nocturne dans cette vue ; les continents sont schématiques. Les libellés déplacés ont des lignes de liaison droites.");
window.PLANETENUHR_CARD_HELP.fr.cards.daily_highlights.details.push("Les miniatures schématiques partagent leurs illustrations des planètes, de la Terre et de la Lune avec les autres cartes. La phase lunaire utilise le même modèle approché et le même terminateur que Terre et Lune ; couleurs et reliefs sont illustratifs.");

window.PLANETENUHR_CARD_HELP.de.cards.about = {
  intro: ["Hier findest du die Projektseite, offene Fehler und Vorschläge sowie das Formular für eine neue Rückmeldung. Zum Melden eines Fehlers oder Einreichen eines Vorschlags musst du bei GitHub angemeldet sein."],
  links: [
    { label: "Projekt auf GitHub", url: "https://github.com/marsrakete/planetenuhr" },
    { label: "Offene Issues ansehen", url: "https://github.com/marsrakete/planetenuhr/issues" },
    { label: "Fehler melden oder Vorschlag machen", url: "https://github.com/marsrakete/planetenuhr/issues/new" }
  ]
};
window.PLANETENUHR_CARD_HELP.en.cards.about = {
  intro: ["Find the project, open issues and suggestions here, or submit new feedback. You must be signed in to GitHub to report a bug or submit a suggestion."],
  links: [
    { label: "Project on GitHub", url: "https://github.com/marsrakete/planetenuhr" },
    { label: "Browse open issues", url: "https://github.com/marsrakete/planetenuhr/issues" },
    { label: "Report a bug or suggest an improvement", url: "https://github.com/marsrakete/planetenuhr/issues/new" }
  ]
};
window.PLANETENUHR_CARD_HELP.fr.cards.about = {
  intro: ["Retrouvez ici le projet, les problèmes ouverts et les suggestions, ou envoyez un nouveau retour. Vous devez être connecté à GitHub pour signaler un problème ou envoyer une suggestion."],
  links: [
    { label: "Projet sur GitHub", url: "https://github.com/marsrakete/planetenuhr" },
    { label: "Voir les problèmes ouverts", url: "https://github.com/marsrakete/planetenuhr/issues" },
    { label: "Signaler un problème ou proposer une amélioration", url: "https://github.com/marsrakete/planetenuhr/issues/new" }
  ]
};
