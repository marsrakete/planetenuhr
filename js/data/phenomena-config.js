window.PLANETENUHR_PHENOMENA = {
  meteorStreams: [
    { key: "quadrantids", name: "Quadrantids", start: "12-28", end: "01-12", peak: "01-03", radiant: "Bootes", radiantAngle: 35, radiantAltitude: 56, color: "#2563eb" },
    { key: "lyrids", name: "Lyrids", start: "04-16", end: "04-25", peak: "04-22", radiant: "Lyra", radiantAngle: 68, radiantAltitude: 62, color: "#7c3aed" },
    { key: "eta_aquariids", name: "Eta Aquariids", start: "04-19", end: "05-28", peak: "05-06", radiant: "Aquarius", radiantAngle: 125, radiantAltitude: 28, color: "#0891b2" },
    { key: "delta_aquariids", name: "Delta Aquariids", start: "07-12", end: "08-23", peak: "07-30", radiant: "Aquarius", radiantAngle: 145, radiantAltitude: 34, color: "#0f766e" },
    { key: "perseids", name: "Perseids", start: "07-17", end: "08-24", peak: "08-12", radiant: "Perseus", radiantAngle: 45, radiantAltitude: 58, color: "#f59e0b" },
    { key: "draconids", name: "Draconids", start: "10-06", end: "10-10", peak: "10-08", radiant: "Draco", radiantAngle: 350, radiantAltitude: 66, color: "#65a30d" },
    { key: "orionids", name: "Orionids", start: "10-02", end: "11-07", peak: "10-21", radiant: "Orion", radiantAngle: 118, radiantAltitude: 48, color: "#db2777" },
    { key: "leonids", name: "Leonids", start: "11-06", end: "11-30", peak: "11-17", radiant: "Leo", radiantAngle: 95, radiantAltitude: 50, color: "#dc2626" },
    { key: "geminids", name: "Geminids", start: "12-04", end: "12-20", peak: "12-14", radiant: "Gemini", radiantAngle: 78, radiantAltitude: 64, color: "#9333ea" },
    { key: "ursids", name: "Ursids", start: "12-17", end: "12-26", peak: "12-22", radiant: "Ursa Minor", radiantAngle: 0, radiantAltitude: 72, color: "#0284c7" }
  ],
  // Figures adapted from the Stellarium team’s Modern sky culture by converting HIP paths into line segments.
  // https://github.com/Stellarium/stellarium/tree/master/skycultures/modern
  // Star positions for the eleven figures other than Virgo are from David Nash’s HYG v4.1 catalogue.
  // https://github.com/astronexus/HYG-Database/blob/main/hyg/CURRENT/hygdata_v41.csv
  // J2000 positions use a gnomonic projection centered on each figure’s mean direction, with north up
  // and east to the left. Scale both axes uniformly so the largest span is 74% of the chart.
  // Adapted line and position data is licensed under CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
  constellations: [
    {
      month: 1,
      name: "Orion",
      skyAngle: 180,
      skyAltitude: 40,
      highlight: {
        en: "Bright winter constellation with Betelgeuse, Rigel and the three Belt stars.",
        de: "Helles Wintersternbild mit Betelgeuse, Rigel und den drei Gürtelsternen.",
        fr: "Constellation hivernale brillante avec Bételgeuse, Rigel et les trois étoiles de la ceinture."
      },
      // HIP order: 27989, 26727, 26311, 25930, 29434, 29426, 28716, 27913, 29038, 28614, 27366, 24436, 25336, 26207, 22449, 22549, 22730, 22797, 23123, 22509, 22845.
      starNames: [
        "Betelgeuse", "Alnitak", "Alnilam", "Mintaka", null, null, null, null, null, null,
        "Saiph", "Rigel", "Bellatrix", "Meissa", null, null, null, null, null, null,
        null
      ],
      stars: [
        [35.31,44.73], [43.83,67.45], [46.6,65.63], [49.15,63.42], [25.49,23.01], [25.46,27.81],
        [30.55,13.1], [36.18,13], [28.13,26.54], [31.04,39.21], [39.39,87], [59.88,83.17],
        [53.27,47.37], [47.32,38.75], [74.54,45.65], [73.77,48.97], [72.57,56.54], [72.04,56.71],
        [69.42,58.5], [73.97,40.93], [71.31,37.95]
      ],
      lines: [
        [1,2], [2,3], [4,5], [4,6], [6,7], [5,8], [8,7], [5,9],
        [9,0], [0,1], [1,10], [10,11], [11,3], [3,12], [12,13], [13,0],
        [12,14], [14,15], [15,16], [16,17], [17,18], [14,19], [19,20], [8,9]
      ],
      labels: [
        { star: 0, dx: -8, dy: -8, anchor: "end" },
        { star: 1, dx: -9, dy: 10, anchor: "end" },
        { star: 2, dx: 0, dy: -15, anchor: "middle" },
        { star: 3, dx: 15, dy: 3, anchor: "start" },
        { star: 10, dx: 0, dy: 16, anchor: "middle" },
        { star: 11, dx: 8, dy: 12, anchor: "start" },
        { star: 12, dx: 10, dy: -6, anchor: "start" },
        { star: 13, dx: 0, dy: -11, anchor: "middle" }
      ]
    },
    {
      month: 2,
      name: "Gemini",
      skyAngle: 165,
      skyAltitude: 56,
      highlight: {
        en: "Castor and Pollux form the twin heads high in the winter sky.",
        de: "Castor und Pollux bilden die Köpfe der Zwillinge hoch am Winterhimmel.",
        fr: "Castor et Pollux forment les têtes des Gémeaux haut dans le ciel d'hiver."
      },
      // HIP order: 36850, 31681, 34088, 35550, 35350, 32362, 36962, 37740, 37826, 36046, 34693, 33018, 32246, 30883, 30343, 29655, 28734.
      starNames: [
        "Castor", "Alhena", "Mekbuda", "Wasat", null, null, null, null, "Pollux", null,
        null, null, "Mebsuta", null, "Tejat", "Propus", null
      ],
      stars: [
        [21.79,21.96], [62.73,72.28], [42.45,59.1], [30.63,54.36], [31.58,71.9], [57.17,83.89],
        [19.84,38.05], [13,45.61], [13.31,33.85], [27.31,35.6], [37.8,28.13], [50.34,16.11],
        [57.11,44.4], [68.86,59.7], [72.94,52.06], [79.03,51.66], [87,48.51]
      ],
      lines: [
        [1,2], [2,3], [3,4], [4,5], [3,6], [6,7], [6,8], [6,9],
        [9,10], [10,0], [10,11], [10,12], [12,13], [12,14], [14,15], [15,16]
      ],
      labels: [
        { star: 0, dx: 0, dy: -12, anchor: "middle" },
        { star: 1, dx: 8, dy: 12, anchor: "start" },
        { star: 2, dx: -8, dy: 14, anchor: "end" },
        { star: 3, dx: -8, dy: 4, anchor: "end" },
        { star: 8, dx: 8, dy: -6, anchor: "start" },
        { star: 12, dx: 0, dy: -11, anchor: "middle" },
        { star: 14, dx: 0, dy: 15, anchor: "middle" },
        { star: 15, dx: 8, dy: -9, anchor: "start" }
      ]
    },
    {
      month: 3,
      name: "Leo",
      skyAngle: 170,
      skyAltitude: 52,
      highlight: {
        en: "The Sickle marks Leo's head; Regulus anchors the spring constellation.",
        de: "Die Sichel markiert Leos Kopf; Regulus verankert das Frühlingssternbild.",
        fr: "La faucille marque la tête du Lion; Régulus ancre cette constellation de printemps."
      },
      // HIP order: 49669, 57632, 54879, 49583, 50583, 54872, 50335, 48455, 47908.
      starNames: [
        "Regulus", "Denebola", "Chertan", null, "Algieba", "Zosma", "Adhafera", "Rasalas", null
      ],
      stars: [
        [75.05,67.72], [13,59.38], [35.27,58.66], [75.25,55.74], [67.61,48.32], [36.12,45.93],
        [69.31,39.44], [82.65,32.28], [87,37.58]
      ],
      lines: [
        [1,2], [2,0], [0,3], [3,4], [4,5], [5,1], [4,6], [6,7],
        [7,8], [5,2]
      ],
      labels: [
        { star: 0, dx: 0, dy: 17, anchor: "middle" },
        { star: 1, dx: -8, dy: 16, anchor: "start" },
        { star: 2, dx: -8, dy: 16, anchor: "end" },
        { star: 4, dx: 8, dy: 3, anchor: "start" },
        { star: 5, dx: -8, dy: -5, anchor: "end" },
        { star: 6, dx: -8, dy: -3, anchor: "end" },
        { star: 7, dx: 8, dy: -9, anchor: "start" }
      ]
    },
    {
      month: 4,
      name: "Bootes",
      skyAngle: 140,
      skyAltitude: 58,
      highlight: {
        en: "Arcturus is the orange beacon of spring and the base of the kite shape.",
        de: "Arktur ist der orangefarbene Frühlingsleuchtturm und die Basis der Drachenform.",
        fr: "Arcturus est le phare orangé du printemps et la base de la forme en cerf-volant."
      },
      // HIP order: 69673, 71795, 72105, 74666, 73555, 71075, 71053, 67927, 67459.
      starNames: [
        "Arcturus", null, "Izar", "Princeps", "Nekkar", "Seginus", null, "Muphrid", null
      ],
      stars: [
        [58.75,71.75], [42.06,87], [40.51,50.33], [23.46,32.13], [32.51,13], [48.36,19.68],
        [48.44,41.54], [72.51,73.43], [76.54,80.54]
      ],
      lines: [
        [1,0], [0,2], [2,3], [3,4], [4,5], [5,6], [6,0], [0,7],
        [7,8]
      ],
      labels: [
        { star: 0, dx: -10, dy: 15, anchor: "end" },
        { star: 2, dx: 8, dy: 0, anchor: "start" },
        { star: 3, dx: -8, dy: 4, anchor: "end" },
        { star: 4, dx: 0, dy: -12, anchor: "middle" },
        { star: 5, dx: 8, dy: -5, anchor: "start" },
        { star: 7, dx: 8, dy: 10, anchor: "start" }
      ]
    },
    {
      month: 5,
      name: "Virgo",
      skyAngle: 185,
      skyAltitude: 44,
      highlight: {
        en: "Spica marks Virgo; the constellation stretches low and wide in spring.",
        de: "Spica markiert die Jungfrau; das Sternbild zieht sich im Frühling niedrig und breit über den Himmel.",
        fr: "Spica marque la Vierge; la constellation s'étire bas et largement au printemps."
      },
      // J2000 positions: https://www.asso-sterenn.fr/comprendre/les-chemins-du-ciel-etoile/vierge/
      // Gnomonic projection centered at RA 199°, Dec 0°, north up and east left.
      // Center the projected bounds at (50, 50) and scale both axes to a figure width of 74%.
      // HIP order: 65474, 57380, 60129, 61941, 69427, 69701, 71957, 66249, 68520, 72220, 63090, 63608.
      starNames: ["Spica", null, "Zaniah", "Porrima", null, null, null, "Heze", null, null, null, "Vindemiatrix"],
      stars: [
        [46.45,67.44], [87,38.8], [72.28,50.91], [63.48,52.13], [27.44,66.51], [26.14,59.54],
        [14.45,59.35], [42.74,50.78], [32.04,47.39], [13,46.66], [57.98,44.53], [55.41,32.56]
      ],
      // Stellarium Modern, CON modern Vir: https://github.com/Stellarium/stellarium/blob/master/skycultures/modern/index.json#L1663-L1664
      lines: [[1,2], [2,3], [3,0], [0,4], [4,5], [5,6], [0,7], [7,8], [8,9], [7,10], [10,11], [10,3]],
      labels: [
        { star: 0, dx: 0, dy: 18, anchor: "middle" },
        { star: 2, dx: 8, dy: -12, anchor: "start" },
        { star: 3, dx: 8, dy: 19, anchor: "start" },
        { star: 7, dx: 0, dy: -14, anchor: "middle" },
        { star: 11, dx: 0, dy: -12, anchor: "middle" }
      ]
    },
    {
      month: 6,
      name: "Hercules",
      skyAngle: 130,
      skyAltitude: 66,
      highlight: {
        en: "A compact keystone shape between Vega and Arcturus.",
        de: "Eine kompakte Schlusssteinform zwischen Vega und Arktur.",
        fr: "Une forme compacte de clé de voûte entre Véga et Arcturus."
      },
      // HIP order: 80816, 86414, 87808, 85112, 84606, 84380, 81833, 81126, 79992, 77760, 81693, 80170, 83207, 85693, 84379, 86974, 87933, 88794.
      starNames: [
        "Kornephoros", null, null, null, null, "Pi Her", "Eta Her", null, null, null,
        "Zeta Her", null, "Epsilon Her", null, null, null, null, null
      ],
      stars: [
        [72.65,80.74], [33.87,14.89], [23.06,37.63], [40.4,39.37], [43.59,39.09], [44.95,40.4],
        [61.68,34.36], [65.46,24.53], [71.38,13], [86.43,21.07], [63.79,53.75], [78.76,87],
        [53.07,55.97], [35.04,68.57], [44.42,72.28], [25.92,63.65], [19.62,58.92], [13.57,59.55]
      ],
      lines: [
        [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9],
        [6,10], [10,0], [0,11], [10,12], [12,13], [13,14], [15,16], [16,17],
        [12,5], [15,13]
      ],
      labels: [
        { star: 0, dx: 8, dy: 9, anchor: "start" },
        { star: 5, dx: 0, dy: -11, anchor: "middle" },
        { star: 6, dx: 8, dy: -8, anchor: "start" },
        { star: 10, dx: 8, dy: 4, anchor: "start" },
        { star: 12, dx: -8, dy: 16, anchor: "end" }
      ]
    },
    {
      month: 7,
      name: "Scorpius",
      skyAngle: 185,
      skyAltitude: 18,
      highlight: {
        en: "Antares glows red; from Europe the scorpion rides low in the south.",
        de: "Antares leuchtet rötlich; von Europa aus steht der Skorpion tief im Süden.",
        fr: "Antarès luit rouge; depuis l'Europe, le Scorpion reste bas au sud."
      },
      // HIP order: 80763, 85927, 86670, 87073, 86228, 84143, 82671, 82514, 82396, 81266, 78401, 78265, 78820.
      starNames: [
        "Antares", "Shaula", null, null, "Sargas", null, null, null, "Larawag", null,
        "Dschubba", null, "Acrab"
      ],
      stars: [
        [63.5,33.55], [21.69,68.08], [16.84,74.85], [14.16,78.79], [21.5,87], [36.16,86.28],
        [46.56,83.11], [47.77,69.53], [48.84,57.83], [58.72,39.02], [85.84,22.65], [85.48,34.1],
        [83.04,13]
      ],
      lines: [
        [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9],
        [9,0], [0,10], [0,11], [0,12]
      ],
      labels: [
        { star: 0, dx: -8, dy: -9, anchor: "end" },
        { star: 1, dx: -8, dy: -6, anchor: "end" },
        { star: 4, dx: 0, dy: 16, anchor: "middle" },
        { star: 8, dx: 8, dy: 4, anchor: "start" },
        { star: 10, dx: -8, dy: 1, anchor: "end" },
        { star: 12, dx: 0, dy: -11, anchor: "middle" }
      ]
    },
    {
      month: 8,
      name: "Cygnus",
      skyAngle: 90,
      skyAltitude: 75,
      highlight: {
        en: "Deneb and Albireo mark the ends of the Northern Cross in the Milky Way.",
        de: "Deneb und Albireo markieren die Enden des Nördlichen Kreuzes in der Milchstraße.",
        fr: "Deneb et Albireo marquent les extrémités de la Croix du Nord dans la Voie lactée."
      },
      // HIP order: 102098, 94779, 95853, 97165, 100453, 102488, 104732, 107310, 98110, 95947.
      starNames: [
        "Deneb", null, null, "Fawaris", "Sadr", "Aljanah", null, null, null, "Albireo"
      ],
      stars: [
        [50.54,40.61], [83.32,17.97], [79.16,23.13], [74.86,40.45], [58.72,53.15], [46.47,68.05],
        [31.34,76.06], [13,77.22], [71.59,65.39], [87,82.03]
      ],
      lines: [
        [1,2], [2,3], [3,4], [4,0], [4,5], [5,6], [6,7], [4,8],
        [8,9]
      ],
      labels: [
        { star: 0, dx: 0, dy: -12, anchor: "middle" },
        { star: 3, dx: 8, dy: -7, anchor: "start" },
        { star: 4, dx: 8, dy: -4, anchor: "start" },
        { star: 5, dx: -8, dy: 14, anchor: "end" },
        { star: 9, dx: -8, dy: -5, anchor: "end" }
      ]
    },
    {
      month: 9,
      name: "Pegasus",
      skyAngle: 110,
      skyAltitude: 60,
      highlight: {
        en: "The Great Square of Pegasus is a clear autumn landmark.",
        de: "Das Herbstviereck des Pegasus ist ein markanter Orientierungspunkt am Herbsthimmel.",
        fr: "Le Grand Carré de Pégase est un repère net du ciel d'automne."
      },
      // HIP order: 113963, 1067, 113881, 112158, 109352, 112748, 112440, 109176, 107354, 112447, 112029, 109427, 107315, 677.
      starNames: [
        "Markab", "Algenib", "Scheat", null, null, null, null, null, null, null,
        null, null, "Enif", "Alpheratz"
      ],
      stars: [
        [47.31,58.87], [13,56.72], [48.58,33.6], [57.59,29.53], [71.75,22.97], [54.49,40.61],
        [56.03,42.65], [73.6,38.62], [83.76,37.11], [55.84,65], [58.37,67.69], [74.18,77.03],
        [87,68.94], [19.59,28.31]
      ],
      lines: [
        [1,0], [2,3], [3,4], [2,5], [5,6], [6,7], [7,8], [0,9],
        [9,10], [10,11], [11,12], [13,2], [13,1], [2,0]
      ],
      labels: [
        { star: 0, dx: 0, dy: 17, anchor: "middle" },
        { star: 1, dx: 0, dy: 17, anchor: "middle" },
        { star: 2, dx: 0, dy: -12, anchor: "middle" },
        { star: 12, dx: -8, dy: 17, anchor: "end" },
        { star: 13, dx: 0, dy: -12, anchor: "middle" }
      ]
    },
    {
      month: 10,
      name: "Andromeda",
      skyAngle: 95,
      skyAltitude: 65,
      highlight: {
        en: "Andromeda's chain of stars lies beside Pegasus and points toward the Andromeda Galaxy.",
        de: "Die Sternenkette des Sternbilds Andromeda liegt neben Pegasus und weist zur Andromedagalaxie.",
        fr: "La chaîne d'étoiles de la constellation d'Andromède se trouve près de Pégase et pointe vers la galaxie d'Andromède."
      },
      // HIP order: 677, 3092, 5447, 9640, 4436, 3881.
      starNames: [
        "Alpheratz", "Delta And", "Mirach", "Almach", "Mu And", "Nembus"
      ],
      stars: [
        [87,72.25], [64.88,68.07], [44.61,52.99], [13,27.75], [52.99,44.01], [57.16,35.77]
      ],
      lines: [
        [0,1], [1,2], [3,2], [2,4], [4,5]
      ],
      labels: [
        { star: 0, dx: -8, dy: 19, anchor: "end" },
        { star: 1, dx: 0, dy: 16, anchor: "middle" },
        { star: 2, dx: -9, dy: 11, anchor: "end" },
        { star: 3, dx: 0, dy: -12, anchor: "middle" },
        { star: 4, dx: 8, dy: 4, anchor: "start" },
        { star: 5, dx: 8, dy: -9, anchor: "start" }
      ]
    },
    {
      month: 11,
      name: "Taurus",
      skyAngle: 100,
      skyAltitude: 42,
      highlight: {
        en: "Aldebaran and the Hyades form the bull's face; the Pleiades sit nearby.",
        de: "Aldebaran und die Hyaden bilden das Gesicht des Stiers; die Plejaden stehen in der Nähe.",
        fr: "Aldébaran et les Hyades dessinent le visage du Taureau; les Pléiades sont toutes proches."
      },
      // HIP order: 21421, 25428, 21881, 20889, 26451, 20205, 20455, 18724, 15900, 20894, 20648, 17847.
      starNames: [
        "Aldebaran", "Elnath", null, "Ain", "Tianguan", "Hyadum I", "Hyadum II", null, null, null,
        null, "Atlas"
      ],
      stars: [
        [46.27,56.52], [20.82,27.22], [43.14,41.92], [50.22,50.53], [13,44.02], [55,58.51],
        [53.27,54.21], [65.7,65.44], [87,72.78], [50.19,57.98], [51.89,53.35], [70.75,38.83]
      ],
      lines: [
        [1,2], [2,3], [0,4], [5,6], [5,7], [7,8], [0,3], [0,9],
        [9,5], [3,10], [10,6], [6,11]
      ],
      labels: [
        { star: 0, dx: -9, dy: 8, anchor: "end" },
        { star: 1, dx: 0, dy: -12, anchor: "middle" },
        { star: 3, dx: 0, dy: -13, anchor: "middle" },
        { star: 4, dx: 0, dy: 18, anchor: "middle" },
        { star: 5, dx: 10, dy: 14, anchor: "start" },
        { star: 6, dx: 10, dy: -6, anchor: "start" },
        { star: 11, dx: 8, dy: -5, anchor: "start" }
      ]
    },
    {
      month: 12,
      name: "Auriga",
      skyAngle: 85,
      skyAltitude: 62,
      highlight: {
        en: "Capella crowns the winter hexagon; Auriga is bright and compact.",
        de: "Capella krönt das Wintersechseck; der Fuhrmann ist hell und kompakt.",
        fr: "Capella couronne l'hexagone d'hiver; le Cocher est brillant et compact."
      },
      // HIP order: 24608, 28380, 28360, 23453, 23015, 25428.
      starNames: [
        "Capella", "Mahasim", "Menkalinan", "Saclateni", "Hassaleh", "Elnath"
      ],
      stars: [
        [58.12,13], [22.91,49.07], [26.05,16.33], [70,33.36], [77.09,66.49], [51.07,87]
      ],
      lines: [
        [1,2], [2,0], [0,3], [3,4], [5,4], [5,1]
      ],
      labels: [
        { star: 0, dx: 0, dy: -12, anchor: "middle" },
        { star: 1, dx: -8, dy: 6, anchor: "end" },
        { star: 2, dx: 0, dy: -12, anchor: "middle" },
        { star: 3, dx: 8, dy: 4, anchor: "start" },
        { star: 4, dx: 8, dy: 5, anchor: "start" },
        { star: 5, dx: 0, dy: 18, anchor: "middle" }
      ]
    },
    // Remaining Stellarium Modern figures; HYG v4.1 HIP positions, gnomonic projection (CC BY-SA 4.0).
    {
        "key": "aquila",
        "name": "Aquila",
        "hipparcos": [
          98036,
          97649,
          97278,
          95501,
          97804,
          99473,
          93747,
          93244,
          93805
        ],
        "stars": [
          [
            32.53,
            45.29
          ],
          [
            36.71,
            36.36
          ],
          [
            40.82,
            30.02
          ],
          [
            59.54,
            57.34
          ],
          [
            34.96,
            65.03
          ],
          [
            17.44,
            71.79
          ],
          [
            77.38,
            17.7
          ],
          [
            82.56,
            13
          ],
          [
            77.53,
            87
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            1,
            3
          ],
          [
            3,
            4
          ],
          [
            5,
            4
          ],
          [
            3,
            6
          ],
          [
            6,
            7
          ],
          [
            3,
            8
          ]
        ],
        "starNames": [
          null,
          "Altair",
          "Tarazed",
          "Del Aql",
          null,
          "The Aql",
          "Okab",
          null,
          null
        ]
      },
      {
        "key": "crater",
        "name": "Crater",
        "hipparcos": [
          53740,
          54682,
          55705,
          55282,
          55687,
          56633,
          58188,
          57283
        ],
        "stars": [
          [
            87,
            61.44
          ],
          [
            70.88,
            86.07
          ],
          [
            54.07,
            57.38
          ],
          [
            61.49,
            41.44
          ],
          [
            54.55,
            19.76
          ],
          [
            38.1,
            13.93
          ],
          [
            13,
            55.14
          ],
          [
            28.06,
            61.32
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            0
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            2
          ]
        ],
        "starNames": [
          "Alkes",
          "β Crt",
          "γ Crt",
          "δ Crt",
          null,
          "θ Crt",
          null,
          null
        ]
      },
      {
        "key": "delphinus",
        "name": "Delphinus",
        "hipparcos": [
          101421,
          101769,
          101958,
          102532,
          102281
        ],
        "stars": [
          [
            75.05,
            87
          ],
          [
            58.58,
            36.54
          ],
          [
            50.82,
            16.35
          ],
          [
            24.95,
            13
          ],
          [
            36.68,
            29.17
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            1
          ]
        ],
        "starNames": [
          "Aldulfin",
          "Rotanev",
          "Sualocin",
          "12 Del",
          "δ Del"
        ]
      },
      {
        "key": "draco",
        "name": "Draco",
        "hipparcos": [
          87585,
          87833,
          85670,
          85829,
          94376,
          97433,
          94648,
          89937,
          83895,
          80331,
          78527,
          75458,
          68756,
          61281,
          56211
        ],
        "stars": [
          [
            23.99,
            74.05
          ],
          [
            20.12,
            85.01
          ],
          [
            28.87,
            84.86
          ],
          [
            29.3,
            78.72
          ],
          [
            15.22,
            46.35
          ],
          [
            13,
            37.89
          ],
          [
            21.3,
            36.18
          ],
          [
            28.09,
            41.24
          ],
          [
            37.74,
            57.9
          ],
          [
            47.96,
            66.21
          ],
          [
            54.46,
            71.38
          ],
          [
            63.84,
            68.08
          ],
          [
            76.25,
            48.8
          ],
          [
            80.63,
            26.62
          ],
          [
            87,
            14.99
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            0
          ],
          [
            0,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            8
          ],
          [
            8,
            9
          ],
          [
            9,
            10
          ],
          [
            10,
            11
          ],
          [
            11,
            12
          ],
          [
            12,
            13
          ],
          [
            13,
            14
          ]
        ],
        "starNames": [
          null,
          "Eltanin",
          "Rastaban",
          null,
          "Altais",
          null,
          null,
          null,
          "Aldhibah",
          "Athebyne",
          null,
          null,
          null,
          null,
          null
        ]
      },
      {
        "key": "triangulum",
        "name": "Triangulum",
        "hipparcos": [
          10670,
          10064,
          8796
        ],
        "stars": [
          [
            14.4,
            28.33
          ],
          [
            36.75,
            13
          ],
          [
            85.6,
            87
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            0
          ]
        ],
        "starNames": [
          "γ Tri",
          "β Tri",
          "Mothallah"
        ]
      },
      {
        "key": "monoceros",
        "name": "Monoceros",
        "hipparcos": [
          29651,
          34769,
          30867,
          32533,
          30419,
          31216,
          31978,
          30665,
          39211,
          39863,
          37447
        ],
        "stars": [
          [
            87,
            70.77
          ],
          [
            50.46,
            55.72
          ],
          [
            77.91,
            72.59
          ],
          [
            66,
            34.01
          ],
          [
            81.07,
            42.69
          ],
          [
            75.17,
            35.73
          ],
          [
            70.02,
            29.17
          ],
          [
            79.13,
            20.54
          ],
          [
            18.13,
            58.14
          ],
          [
            13,
            62.43
          ],
          [
            31.41,
            79.46
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            2,
            1
          ],
          [
            1,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            3,
            6
          ],
          [
            6,
            7
          ],
          [
            1,
            8
          ],
          [
            8,
            9
          ],
          [
            8,
            10
          ]
        ],
        "starNames": [
          "γ Mon",
          "δ Mon",
          "β Mon",
          null,
          null,
          null,
          null,
          null,
          null,
          "ζ Mon",
          "α Mon"
        ]
      },
      {
        "key": "eridanus",
        "name": "Eridanus",
        "hipparcos": [
          7588,
          9007,
          10602,
          11407,
          12413,
          12486,
          13847,
          15510,
          17797,
          17874,
          20042,
          20535,
          21393,
          17651,
          16611,
          15474,
          14146,
          12843,
          13701,
          15197,
          16537,
          17378,
          21444,
          22109,
          22701,
          23875,
          23972,
          21594
        ],
        "stars": [
          [
            75.77,
            87
          ],
          [
            74.03,
            76.77
          ],
          [
            69.67,
            75.06
          ],
          [
            68.27,
            69.14
          ],
          [
            66.25,
            62.22
          ],
          [
            66.51,
            58.37
          ],
          [
            62.33,
            58.32
          ],
          [
            57.21,
            61.3
          ],
          [
            50.77,
            54.48
          ],
          [
            50.54,
            52.79
          ],
          [
            43.54,
            50.33
          ],
          [
            42.04,
            50.74
          ],
          [
            38.72,
            46.99
          ],
          [
            50.98,
            37.65
          ],
          [
            54.49,
            35.76
          ],
          [
            58.35,
            36
          ],
          [
            62.88,
            38.42
          ],
          [
            68.29,
            32.77
          ],
          [
            66.08,
            20.51
          ],
          [
            60.13,
            20.27
          ],
          [
            54.94,
            21.02
          ],
          [
            51.85,
            21.41
          ],
          [
            34.73,
            13.09
          ],
          [
            31.61,
            13
          ],
          [
            29.53,
            16.17
          ],
          [
            24.23,
            15.83
          ],
          [
            24.71,
            20.99
          ],
          [
            35.78,
            27.58
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            8
          ],
          [
            8,
            9
          ],
          [
            9,
            10
          ],
          [
            10,
            11
          ],
          [
            11,
            12
          ],
          [
            12,
            13
          ],
          [
            13,
            14
          ],
          [
            14,
            15
          ],
          [
            15,
            16
          ],
          [
            16,
            17
          ],
          [
            17,
            18
          ],
          [
            18,
            19
          ],
          [
            19,
            20
          ],
          [
            20,
            21
          ],
          [
            21,
            22
          ],
          [
            22,
            23
          ],
          [
            23,
            24
          ],
          [
            24,
            25
          ],
          [
            25,
            26
          ],
          [
            26,
            27
          ]
        ],
        "starNames": [
          "Achernar",
          null,
          null,
          null,
          null,
          null,
          "Acamar",
          null,
          null,
          null,
          "41 Eri",
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          "Rana",
          null,
          null,
          null,
          "Cursa",
          null,
          null
        ]
      },
      {
        "key": "pisces",
        "name": "Pisces",
        "hipparcos": [
          4889,
          5742,
          6193,
          7097,
          8198,
          9487,
          8833,
          7884,
          7007,
          4906,
          3760,
          1645,
          118268,
          116771,
          117245,
          116928,
          115738,
          114971,
          115227,
          115830
        ],
        "stars": [
          [
            41.03,
            22.7
          ],
          [
            36.31,
            36.31
          ],
          [
            34.1,
            31.08
          ],
          [
            28.27,
            52.48
          ],
          [
            21.56,
            63.11
          ],
          [
            13,
            74.45
          ],
          [
            17.17,
            73.74
          ],
          [
            23.07,
            69.72
          ],
          [
            28.22,
            68.69
          ],
          [
            40.21,
            65.89
          ],
          [
            46.45,
            66.97
          ],
          [
            58.2,
            65.42
          ],
          [
            67.41,
            67.56
          ],
          [
            76.09,
            69.54
          ],
          [
            73.33,
            73.38
          ],
          [
            75.42,
            76.4
          ],
          [
            82.51,
            77.3
          ],
          [
            87,
            73.52
          ],
          [
            85.24,
            69.72
          ],
          [
            81.54,
            68.03
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            0,
            2
          ],
          [
            2,
            1
          ],
          [
            1,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            8
          ],
          [
            8,
            9
          ],
          [
            9,
            10
          ],
          [
            10,
            11
          ],
          [
            11,
            12
          ],
          [
            12,
            13
          ],
          [
            13,
            14
          ],
          [
            14,
            15
          ],
          [
            15,
            16
          ],
          [
            16,
            17
          ],
          [
            17,
            18
          ],
          [
            18,
            19
          ],
          [
            19,
            13
          ]
        ],
        "starNames": [
          null,
          null,
          null,
          "Alpherg",
          null,
          "Alrescha",
          null,
          null,
          null,
          null,
          null,
          null,
          "ω Psc",
          "ι Psc",
          null,
          null,
          null,
          "γ Psc",
          null,
          null
        ]
      },
      {
        "key": "camelopardalis",
        "name": "Camelopardalis",
        "hipparcos": [
          16228,
          18505,
          22783,
          17959,
          25110
        ],
        "stars": [
          [
            67.99,
            87
          ],
          [
            53.94,
            76.39
          ],
          [
            32.01,
            62.62
          ],
          [
            54.59,
            45.12
          ],
          [
            35.94,
            13
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            0,
            3
          ],
          [
            3,
            2
          ],
          [
            3,
            4
          ]
        ],
        "starNames": [
          null,
          null,
          "α Cam",
          "γ Cam",
          null
        ]
      },
      {
        "key": "ursa_major",
        "name": "Ursa Major",
        "hipparcos": [
          67301,
          65378,
          62956,
          59774,
          54061,
          53910,
          58001,
          57399,
          54539,
          50372,
          50801,
          48402,
          46853,
          44471,
          44127,
          48319,
          41704,
          46733
        ],
        "stars": [
          [
            13,
            42.44
          ],
          [
            24.26,
            38.13
          ],
          [
            31.55,
            40.1
          ],
          [
            40.32,
            41.73
          ],
          [
            55.63,
            37.16
          ],
          [
            55.64,
            45.47
          ],
          [
            43.64,
            48.03
          ],
          [
            43.58,
            57.47
          ],
          [
            52.71,
            63.79
          ],
          [
            67.66,
            65.99
          ],
          [
            66.38,
            68.42
          ],
          [
            71.21,
            47.72
          ],
          [
            76.59,
            50.27
          ],
          [
            86.39,
            54.79
          ],
          [
            87,
            53.02
          ],
          [
            69.82,
            40.11
          ],
          [
            84.25,
            31.58
          ],
          [
            71.87,
            33.01
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            3
          ],
          [
            6,
            7
          ],
          [
            7,
            8
          ],
          [
            8,
            9
          ],
          [
            8,
            10
          ],
          [
            5,
            11
          ],
          [
            11,
            12
          ],
          [
            12,
            13
          ],
          [
            12,
            14
          ],
          [
            11,
            15
          ],
          [
            15,
            16
          ],
          [
            16,
            17
          ],
          [
            17,
            4
          ]
        ],
        "starNames": [
          "Alkaid",
          "Mizar",
          "Alioth",
          null,
          "Dubhe",
          "Merak",
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null
        ]
      },
      {
        "key": "canis_major",
        "name": "Canis Major",
        "hipparcos": [
          33160,
          34045,
          33347,
          32349,
          33977,
          34444,
          35037,
          35904,
          33579,
          33856,
          33165,
          31592,
          31416,
          30324,
          32759,
          30122
        ],
        "stars": [
          [
            48.17,
            13
          ],
          [
            39.89,
            26.27
          ],
          [
            46.54,
            31.37
          ],
          [
            56,
            30.17
          ],
          [
            41.04,
            55.76
          ],
          [
            36.89,
            65.04
          ],
          [
            31.77,
            66.59
          ],
          [
            24.77,
            76.15
          ],
          [
            44.82,
            74.15
          ],
          [
            42.33,
            70.45
          ],
          [
            48.25,
            56.03
          ],
          [
            63.06,
            39.46
          ],
          [
            64.03,
            52.81
          ],
          [
            75.23,
            35.15
          ],
          [
            51.66,
            87
          ],
          [
            74.83,
            78.99
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            8,
            9
          ],
          [
            9,
            5
          ],
          [
            9,
            10
          ],
          [
            10,
            11
          ],
          [
            11,
            12
          ],
          [
            11,
            13
          ],
          [
            11,
            3
          ],
          [
            8,
            14
          ],
          [
            15,
            8
          ],
          [
            2,
            0
          ]
        ],
        "starNames": [
          null,
          null,
          null,
          "Sirius",
          null,
          "Wezen",
          null,
          "Aludra",
          "Adhara",
          null,
          null,
          null,
          null,
          "Mirzam",
          null,
          null
        ]
      },
      {
        "key": "coma_berenices",
        "name": "Coma Berenices",
        "hipparcos": [
          64241,
          64394,
          60742
        ],
        "stars": [
          [
            17.5,
            87
          ],
          [
            16.38,
            16.66
          ],
          [
            83.62,
            13
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ]
        ],
        "starNames": [
          "Diadem",
          "β Com",
          "γ Com"
        ]
      },
      {
        "key": "lepus",
        "name": "Lepus",
        "hipparcos": [
          28910,
          28103,
          27288,
          25985,
          24305,
          27654,
          27072,
          25606,
          23685,
          24845,
          24327,
          24244,
          24873
        ],
        "stars": [
          [
            13,
            39.23
          ],
          [
            25.08,
            34.88
          ],
          [
            36.93,
            37.97
          ],
          [
            54.52,
            53.12
          ],
          [
            78.8,
            45.13
          ],
          [
            32.28,
            69.12
          ],
          [
            40.64,
            76.99
          ],
          [
            59.91,
            68.15
          ],
          [
            87,
            77.1
          ],
          [
            70.86,
            29.49
          ],
          [
            78.82,
            28.39
          ],
          [
            80.12,
            22.9
          ],
          [
            70.42,
            25.06
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            3,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            8
          ],
          [
            3,
            7
          ],
          [
            4,
            9
          ],
          [
            4,
            10
          ],
          [
            8,
            4
          ],
          [
            10,
            11
          ],
          [
            9,
            12
          ]
        ],
        "starNames": [
          null,
          null,
          "ζ Lep",
          "Arneb",
          "μ Lep",
          null,
          null,
          "Nihal",
          "ε Lep",
          null,
          null,
          null,
          null
        ]
      },
      {
        "key": "canes_venatici",
        "name": "Canes Venatici",
        "hipparcos": [
          61317,
          63125
        ],
        "stars": [
          [
            87,
            23.67
          ],
          [
            13,
            76.33
          ]
        ],
        "lines": [
          [
            0,
            1
          ]
        ],
        "starNames": [
          "Chara",
          "Cor Caroli"
        ]
      },
      {
        "key": "cassiopeia",
        "name": "Cassiopeia",
        "hipparcos": [
          8886,
          6686,
          4427,
          3179,
          746
        ],
        "stars": [
          [
            13,
            27.2
          ],
          [
            29.62,
            50.46
          ],
          [
            50.94,
            48.57
          ],
          [
            64.42,
            72.8
          ],
          [
            87,
            54.26
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ]
        ],
        "starNames": [
          "Segin",
          "Ruchbah",
          "Cih",
          "Schedar",
          "Caph"
        ]
      },
      {
        "key": "cepheus",
        "name": "Cepheus",
        "hipparcos": [
          109492,
          112724,
          106032,
          105199,
          116727
        ],
        "stars": [
          [
            47.32,
            87
          ],
          [
            33.5,
            56.74
          ],
          [
            60.28,
            41.26
          ],
          [
            69.09,
            68.94
          ],
          [
            30.91,
            13
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            0
          ],
          [
            1,
            4
          ],
          [
            4,
            2
          ]
        ],
        "starNames": [
          "ζ Cep",
          "ι Cep",
          "Alfirk",
          "Alderamin",
          "Errai"
        ]
      },
      {
        "key": "ursa_minor",
        "name": "Ursa Minor",
        "hipparcos": [
          11767,
          85822,
          82080,
          77055,
          79822,
          75097,
          72607
        ],
        "stars": [
          [
            45.78,
            13
          ],
          [
            40.69,
            28.01
          ],
          [
            38.65,
            46.27
          ],
          [
            47.07,
            63.9
          ],
          [
            39.09,
            71.38
          ],
          [
            54.41,
            87
          ],
          [
            61.35,
            76.49
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            3
          ]
        ],
        "starNames": [
          "Polaris",
          null,
          "ε UMi",
          "ζ UMi",
          null,
          "Pherkad",
          "Kochab"
        ]
      },
      {
        "key": "canis_minor",
        "name": "Canis Minor",
        "hipparcos": [
          37279,
          36188
        ],
        "stars": [
          [
            13.59,
            87
          ],
          [
            86.41,
            13
          ]
        ],
        "lines": [
          [
            0,
            1
          ]
        ],
        "starNames": [
          "Procyon",
          "Gomeisa"
        ]
      },
      {
        "key": "cancer",
        "name": "Cancer",
        "hipparcos": [
          43103,
          42806,
          40843,
          42911,
          40526,
          44066
        ],
        "stars": [
          [
            42.1,
            13
          ],
          [
            44.74,
            40.68
          ],
          [
            64.45,
            18.69
          ],
          [
            43.4,
            53.1
          ],
          [
            69.63,
            87
          ],
          [
            30.37,
            76.72
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            1,
            3
          ],
          [
            3,
            4
          ],
          [
            3,
            5
          ]
        ],
        "starNames": [
          "ι Cnc",
          "Asellus Borealis",
          null,
          "Asellus Australis",
          "Tarf",
          "Acubens"
        ]
      },
      {
        "key": "lyra",
        "name": "Lyra",
        "hipparcos": [
          91262,
          91971,
          92420,
          93194,
          92791
        ],
        "stars": [
          [
            76.9,
            13
          ],
          [
            58.56,
            27.71
          ],
          [
            45.72,
            79.12
          ],
          [
            23.1,
            87
          ],
          [
            35.11,
            36.23
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            1
          ]
        ],
        "starNames": [
          "Vega",
          "6 Lyr",
          "Sheliak",
          "Sulafat",
          "12 Lyr"
        ]
      },
      {
        "key": "lynx",
        "name": "Lynx",
        "hipparcos": [
          45860,
          45688,
          44700,
          44248,
          41075,
          36145,
          33449,
          30060
        ],
        "stars": [
          [
            13,
            86.74
          ],
          [
            15.35,
            80.41
          ],
          [
            22.51,
            76.84
          ],
          [
            26.54,
            68.41
          ],
          [
            44.9,
            65.63
          ],
          [
            68.71,
            47.54
          ],
          [
            74.43,
            20.36
          ],
          [
            87,
            13.26
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ]
        ],
        "starNames": [
          "α Lyn",
          "38 Lyn",
          null,
          null,
          "Alsciaukat",
          null,
          "15 Lyn",
          "2 Lyn"
        ]
      },
      {
        "key": "corona_borealis",
        "name": "Corona Borealis",
        "hipparcos": [
          76127,
          75695,
          76267,
          76952,
          77512,
          78159,
          78493
        ],
        "stars": [
          [
            75.2,
            23.14
          ],
          [
            87,
            45.63
          ],
          [
            72.29,
            70.21
          ],
          [
            54.11,
            74.63
          ],
          [
            38.56,
            76.86
          ],
          [
            20.63,
            68.33
          ],
          [
            13,
            37.97
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ]
        ],
        "starNames": [
          "θ CrB",
          "Nusakan",
          "Alphecca",
          "γ CrB",
          null,
          "ε CrB",
          null
        ]
      },
      {
        "key": "perseus",
        "name": "Perseus",
        "hipparcos": [
          17448,
          18246,
          18614,
          18532,
          17358,
          15863,
          14328,
          13268,
          14576,
          14354,
          13254
        ],
        "stars": [
          [
            37.84,
            86.07
          ],
          [
            31.36,
            87
          ],
          [
            29.33,
            74.71
          ],
          [
            31.17,
            61.95
          ],
          [
            40.9,
            39.03
          ],
          [
            50.3,
            32.89
          ],
          [
            59.12,
            21.21
          ],
          [
            64.75,
            13
          ],
          [
            59.74,
            59.55
          ],
          [
            61.87,
            65.84
          ],
          [
            70.67,
            66.73
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            5,
            8
          ],
          [
            8,
            9
          ],
          [
            9,
            10
          ]
        ],
        "starNames": [
          null,
          "ζ Per",
          null,
          "ε Per",
          null,
          "Mirfak",
          "γ Per",
          null,
          "Algol",
          null,
          null
        ]
      },
      {
        "key": "sagitta",
        "name": "Sagitta",
        "hipparcos": [
          96837,
          97365,
          96757,
          98337,
          98920
        ],
        "stars": [
          [
            84.25,
            65.86
          ],
          [
            65.3,
            52.79
          ],
          [
            87,
            59.1
          ],
          [
            31.76,
            40.7
          ],
          [
            13,
            34.14
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            1,
            3
          ],
          [
            3,
            4
          ]
        ],
        "starNames": [
          "β Sge",
          "δ Sge",
          "Sham",
          "γ Sge",
          null
        ]
      },
      {
        "key": "corvus",
        "name": "Corvus",
        "hipparcos": [
          61174,
          60965,
          59803,
          59316,
          59199,
          61359
        ],
        "stars": [
          [
            27.98,
            13
          ],
          [
            32.6,
            15.72
          ],
          [
            61.68,
            24.58
          ],
          [
            72.62,
            68.63
          ],
          [
            75.67,
            87
          ],
          [
            24.33,
            75.39
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            3,
            5
          ],
          [
            5,
            1
          ]
        ],
        "starNames": [
          null,
          "Algorab",
          "Gienah",
          "ε Crv",
          "Alchiba",
          "Kraz"
        ]
      },
      {
        "key": "scutum",
        "name": "Scutum",
        "hipparcos": [
          92175,
          92202,
          92814,
          90595,
          91117
        ],
        "stars": [
          [
            41.15,
            13
          ],
          [
            40.65,
            19.54
          ],
          [
            28.99,
            87
          ],
          [
            71.01,
            79.93
          ],
          [
            61.33,
            36.83
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            0
          ]
        ],
        "starNames": [
          "β Sct",
          null,
          null,
          "γ Sct",
          "α Sct"
        ]
      },
      {
        "key": "serpens_caput",
        "name": "Serpens Caput",
        "hipparcos": [
          79593,
          77516,
          77622,
          77070,
          76276,
          77233,
          78072,
          77450
        ],
        "stars": [
          [
            33.34,
            87
          ],
          [
            54.48,
            86.01
          ],
          [
            53.46,
            59.07
          ],
          [
            58.9,
            52.54
          ],
          [
            66.66,
            38.7
          ],
          [
            57.23,
            22.31
          ],
          [
            48.88,
            21.49
          ],
          [
            55.14,
            13
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            5
          ]
        ],
        "starNames": [
          "Yed Prior",
          "μ Ser",
          "ε Ser",
          "Unukalhai",
          null,
          "β Ser",
          null,
          null
        ]
      },
      {
        "key": "serpens_cauda",
        "name": "Serpens Cauda",
        "hipparcos": [
          92946,
          90441,
          89962,
          88670,
          88048,
          86565,
          86263,
          84880
        ],
        "stars": [
          [
            13,
            19.4
          ],
          [
            36.38,
            32.34
          ],
          [
            41.05,
            41.93
          ],
          [
            52.72,
            58.51
          ],
          [
            58.07,
            62.95
          ],
          [
            71.28,
            72.66
          ],
          [
            74.06,
            80.6
          ],
          [
            87,
            73.07
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ]
        ],
        "starNames": [
          null,
          null,
          "η Ser",
          null,
          "ν Oph",
          "ο Ser",
          "ξ Ser",
          "ν Ser"
        ]
      },
      {
        "key": "ophiuchus",
        "name": "Ophiuchus",
        "hipparcos": [
          86032,
          86742,
          84012,
          83000,
          79882,
          81377,
          85755
        ],
        "stars": [
          [
            33.15,
            13
          ],
          [
            29.02,
            29.42
          ],
          [
            45.42,
            69.42
          ],
          [
            51.64,
            19.81
          ],
          [
            70.98,
            47.87
          ],
          [
            61.46,
            59.31
          ],
          [
            35.47,
            87
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            2,
            1
          ],
          [
            0,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            2
          ],
          [
            2,
            6
          ]
        ],
        "starNames": [
          "Rasalhague",
          "Cebalrai",
          "Sabik",
          "κ Oph",
          null,
          "ζ Oph",
          null
        ]
      },
      {
        "key": "sagittarius",
        "name": "Sagittarius",
        "hipparcos": [
          89931,
          90496,
          89642,
          90185,
          88635,
          87072,
          93506,
          92041,
          89341,
          93864,
          92855,
          93085,
          93683,
          94820,
          95168,
          96406,
          98688,
          98412,
          98032,
          95347,
          95294
        ],
        "stars": [
          [
            67.97,
            46.55
          ],
          [
            64.94,
            35.52
          ],
          [
            68.28,
            63.75
          ],
          [
            65.46,
            57.57
          ],
          [
            76,
            48.81
          ],
          [
            87,
            43.71
          ],
          [
            45.95,
            45.9
          ],
          [
            55.06,
            38.95
          ],
          [
            73.93,
            25.23
          ],
          [
            43.57,
            40.57
          ],
          [
            49.87,
            37.18
          ],
          [
            48.53,
            24.45
          ],
          [
            44.57,
            26.04
          ],
          [
            36.89,
            19.24
          ],
          [
            34.38,
            16.51
          ],
          [
            27.21,
            34.07
          ],
          [
            13,
            42.96
          ],
          [
            17.19,
            61.49
          ],
          [
            21.6,
            77.78
          ],
          [
            36.19,
            72.76
          ],
          [
            37.09,
            83.49
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            4,
            0
          ],
          [
            0,
            3
          ],
          [
            3,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            0
          ],
          [
            7,
            1
          ],
          [
            1,
            8
          ],
          [
            6,
            9
          ],
          [
            9,
            10
          ],
          [
            10,
            7
          ],
          [
            10,
            11
          ],
          [
            11,
            12
          ],
          [
            12,
            13
          ],
          [
            13,
            14
          ],
          [
            9,
            15
          ],
          [
            15,
            16
          ],
          [
            16,
            17
          ],
          [
            17,
            18
          ],
          [
            18,
            19
          ],
          [
            18,
            20
          ]
        ],
        "starNames": [
          "Kaus Media",
          "Kaus Borealis",
          null,
          "Kaus Australis",
          null,
          null,
          "Ascella",
          null,
          null,
          null,
          "Nunki",
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null
        ]
      },
      {
        "key": "capricornus",
        "name": "Capricornus",
        "hipparcos": [
          100064,
          100345,
          104139,
          105515,
          106985,
          107556,
          105881,
          102485,
          102978
        ],
        "stars": [
          [
            87,
            25.93
          ],
          [
            83.98,
            33.57
          ],
          [
            46.78,
            41.01
          ],
          [
            33.55,
            39.83
          ],
          [
            18.89,
            39.73
          ],
          [
            13,
            38.18
          ],
          [
            30.55,
            58.87
          ],
          [
            62.14,
            68.53
          ],
          [
            57.62,
            74.07
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            3,
            6
          ],
          [
            6,
            2
          ],
          [
            1,
            7
          ],
          [
            2,
            8
          ]
        ],
        "starNames": [
          "Algedi",
          "Dabih",
          null,
          null,
          "Nashira",
          "Deneb Algedi",
          "ζ Cap",
          null,
          null
        ]
      },
      {
        "key": "piscis_austrinus",
        "name": "Piscis Austrinus",
        "hipparcos": [
          113368,
          111954,
          108661,
          107608,
          109422,
          111188,
          113246
        ],
        "stars": [
          [
            13,
            49.67
          ],
          [
            30.74,
            36.15
          ],
          [
            73.8,
            43.56
          ],
          [
            87,
            56.53
          ],
          [
            63.03,
            63.15
          ],
          [
            41.02,
            61.87
          ],
          [
            15.77,
            63.85
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ]
        ],
        "starNames": [
          "Fomalhaut",
          "ε PsA",
          null,
          null,
          null,
          "β PsA",
          "δ PsA"
        ]
      },
      {
        "key": "libra",
        "name": "Libra",
        "hipparcos": [
          77853,
          76333,
          74785,
          72622,
          73714
        ],
        "stars": [
          [
            15.03,
            47.79
          ],
          [
            35.26,
            38.21
          ],
          [
            56.02,
            13
          ],
          [
            84.97,
            44.43
          ],
          [
            69.36,
            87
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            1
          ]
        ],
        "starNames": [
          "θ Lib",
          "Zubenelhakrabi",
          "Zubeneschamali",
          "Zubenelgenubi",
          "Brachium"
        ]
      },
      {
        "key": "cetus",
        "name": "Cetus",
        "hipparcos": [
          10324,
          11484,
          8102,
          3419,
          1562,
          5364,
          6537,
          8645,
          11345,
          12390,
          12770,
          11783,
          10826,
          12387,
          12706,
          14135,
          13954,
          12828,
          12093
        ],
        "stars": [
          [
            34.66,
            26.64
          ],
          [
            28.06,
            27.29
          ],
          [
            46.92,
            69.99
          ],
          [
            74.04,
            75.86
          ],
          [
            87,
            59.31
          ],
          [
            62.66,
            60.35
          ],
          [
            55.79,
            56.54
          ],
          [
            43.84,
            60.02
          ],
          [
            29.2,
            63.41
          ],
          [
            23.38,
            62.79
          ],
          [
            21.46,
            66.36
          ],
          [
            26.62,
            68.68
          ],
          [
            31.96,
            47.31
          ],
          [
            23.22,
            41.61
          ],
          [
            21.5,
            36.52
          ],
          [
            13,
            34.91
          ],
          [
            14.02,
            26.16
          ],
          [
            20.64,
            24.14
          ],
          [
            24.72,
            32.39
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            3,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            8
          ],
          [
            8,
            9
          ],
          [
            9,
            10
          ],
          [
            10,
            11
          ],
          [
            11,
            2
          ],
          [
            12,
            9
          ],
          [
            12,
            13
          ],
          [
            13,
            14
          ],
          [
            14,
            15
          ],
          [
            15,
            16
          ],
          [
            16,
            17
          ],
          [
            17,
            1
          ],
          [
            1,
            18
          ],
          [
            18,
            14
          ]
        ],
        "starNames": [
          null,
          null,
          "τ Cet",
          "Diphda",
          null,
          "η Cet",
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          "Kaffaljidhma",
          "Menkar",
          null,
          null,
          null
        ]
      },
      {
        "key": "aquarius",
        "name": "Aquarius",
        "hipparcos": [
          106278,
          109074,
          110395,
          110960,
          111497,
          112961,
          114855,
          115438,
          110003,
          109139,
          111123,
          112716,
          113136,
          114341,
          102618
        ],
        "stars": [
          [
            64.61,
            40.58
          ],
          [
            48.38,
            30.36
          ],
          [
            40.87,
            32.38
          ],
          [
            37.5,
            29.78
          ],
          [
            34.42,
            29.97
          ],
          [
            26.49,
            44.07
          ],
          [
            15.58,
            47.16
          ],
          [
            13,
            68.57
          ],
          [
            43.04,
            44.39
          ],
          [
            47.68,
            55.83
          ],
          [
            36.67,
            49.76
          ],
          [
            28.07,
            55.3
          ],
          [
            25.83,
            59.57
          ],
          [
            19.32,
            70.22
          ],
          [
            87,
            49.38
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            1,
            8
          ],
          [
            8,
            9
          ],
          [
            8,
            10
          ],
          [
            10,
            11
          ],
          [
            11,
            12
          ],
          [
            12,
            13
          ],
          [
            14,
            0
          ]
        ],
        "starNames": [
          "Sadalsuud",
          "Sadalmelik",
          null,
          "55 Aqr",
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          "Skat",
          "88 Aqr",
          null
        ]
      },
      {
        "key": "hydra",
        "name": "Hydra",
        "hipparcos": [
          42799,
          42402,
          42313,
          43109,
          43234,
          43813,
          45336,
          46776,
          46509,
          46390,
          45751,
          47452,
          48356,
          49841,
          51069,
          52943,
          54204,
          56343,
          57936,
          64166,
          64962,
          68895,
          69415,
          70306,
          72571
        ],
        "stars": [
          [
            85.64,
            33.43
          ],
          [
            86.53,
            33.44
          ],
          [
            87,
            31.65
          ],
          [
            85.22,
            31.2
          ],
          [
            84.84,
            31.66
          ],
          [
            83.5,
            31.64
          ],
          [
            79.78,
            34.32
          ],
          [
            76.64,
            36.65
          ],
          [
            77.02,
            37.67
          ],
          [
            77,
            41.36
          ],
          [
            78.07,
            43.47
          ],
          [
            74.81,
            44.71
          ],
          [
            73.14,
            44.93
          ],
          [
            70.41,
            43.35
          ],
          [
            68.15,
            45.95
          ],
          [
            64.83,
            45.58
          ],
          [
            62.82,
            52.33
          ],
          [
            59.19,
            55.62
          ],
          [
            56.53,
            57.47
          ],
          [
            42.68,
            53.03
          ],
          [
            40.59,
            53.61
          ],
          [
            29.18,
            60.44
          ],
          [
            27.37,
            61.74
          ],
          [
            24.07,
            63.62
          ],
          [
            13,
            68.8
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            0
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ],
          [
            6,
            7
          ],
          [
            7,
            8
          ],
          [
            8,
            9
          ],
          [
            9,
            10
          ],
          [
            10,
            11
          ],
          [
            11,
            12
          ],
          [
            12,
            13
          ],
          [
            13,
            14
          ],
          [
            14,
            15
          ],
          [
            15,
            16
          ],
          [
            16,
            17
          ],
          [
            17,
            18
          ],
          [
            18,
            19
          ],
          [
            19,
            20
          ],
          [
            20,
            21
          ],
          [
            21,
            22
          ],
          [
            22,
            23
          ],
          [
            23,
            24
          ]
        ],
        "starNames": [
          null,
          null,
          null,
          null,
          null,
          "ζ Hya",
          null,
          null,
          null,
          "Alphard",
          null,
          null,
          null,
          null,
          null,
          "ν Hya",
          null,
          null,
          null,
          null,
          "γ Hya",
          "π Hya",
          null,
          null,
          null
        ]
      },
      {
        "key": "aries",
        "name": "Aries",
        "hipparcos": [
          13209,
          9884,
          8903,
          8832
        ],
        "stars": [
          [
            13,
            26.24
          ],
          [
            68.3,
            50.08
          ],
          [
            85.25,
            65.07
          ],
          [
            87,
            73.76
          ]
        ],
        "lines": [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ]
        ],
        "starNames": [
          "Bharani",
          "Hamal",
          "Sheratan",
          "Mesarthim"
        ]
      }
  ],
  spacecraft: [
    { key: "parker", name: "Parker Solar Probe", distanceAu: 0.16, angle: 250, region: "Inner heliosphere", color: "#f97316" },
    { key: "bepicolombo", name: "BepiColombo", distanceAu: 0.7, angle: 205, region: "Inner planets", color: "#eab308" },
    { key: "juice", name: "JUICE", distanceAu: 3.0, angle: 155, region: "To Jupiter", color: "#22c55e" },
    { key: "juno", name: "Juno", distanceAu: 5.2, angle: 115, region: "Jupiter", color: "#0ea5e9" },
    { key: "europa_clipper", name: "Europa Clipper", distanceAu: 5.2, angle: 82, region: "To Jupiter system", color: "#38bdf8" },
    { key: "new_horizons", name: "New Horizons", distanceAu: 60, angle: 34, region: "Kuiper belt", color: "#8b5cf6" },
    { key: "pioneer_10", name: "Pioneer 10", distanceAu: 137, angle: 342, region: "Outer heliosphere", color: "#64748b" },
    { key: "pioneer_11", name: "Pioneer 11", distanceAu: 113, angle: 304, region: "Outer heliosphere", color: "#94a3b8" },
    { key: "voyager_1", name: "Voyager 1", distanceAu: 165, angle: 18, region: "Interstellar space", color: "#ef4444" },
    { key: "voyager_2", name: "Voyager 2", distanceAu: 137, angle: 332, region: "Interstellar space", color: "#f43f5e" }
  ],
  exoplanetSystems: [
    {
      key: "trappist_1",
      name: "TRAPPIST-1",
      starType: "Ultracool dwarf",
      starMassSun: 0.09,
      distanceLy: 40,
      maxOrbitAu: 0.07,
      color: "#f97316",
      planets: [
        { name: "b", orbitAu: 0.011 },
        { name: "c", orbitAu: 0.015 },
        { name: "d", orbitAu: 0.021 },
        { name: "e", orbitAu: 0.028 },
        { name: "f", orbitAu: 0.037 },
        { name: "g", orbitAu: 0.045 },
        { name: "h", orbitAu: 0.062 }
      ]
    },
    {
      key: "kepler_90",
      name: "Kepler-90",
      starType: "Sun-like",
      starMassSun: 1.2,
      distanceLy: 2790,
      maxOrbitAu: 1.6,
      color: "#2563eb",
      planets: [
        { name: "b", orbitAu: 0.074 },
        { name: "c", orbitAu: 0.089 },
        { name: "i", orbitAu: 0.107 },
        { name: "d", orbitAu: 0.32 },
        { name: "e", orbitAu: 0.42 },
        { name: "f", orbitAu: 0.71 },
        { name: "g", orbitAu: 1.01 },
        { name: "h", orbitAu: 1.52 }
      ]
    },
    {
      key: "fiftyfive_cancri",
      name: "55 Cancri",
      starType: "G dwarf",
      starMassSun: 0.96,
      distanceLy: 41,
      maxOrbitAu: 5.8,
      color: "#7c3aed",
      planets: [
        { name: "e", orbitAu: 0.015 },
        { name: "b", orbitAu: 0.11 },
        { name: "c", orbitAu: 0.24 },
        { name: "f", orbitAu: 0.78 },
        { name: "d", orbitAu: 5.77 }
      ]
    },
    {
      key: "hr_8799",
      name: "HR 8799",
      starType: "A star",
      starMassSun: 1.5,
      distanceLy: 133,
      maxOrbitAu: 70,
      color: "#0f766e",
      planets: [
        { name: "e", orbitAu: 15 },
        { name: "d", orbitAu: 24 },
        { name: "c", orbitAu: 38 },
        { name: "b", orbitAu: 68 }
      ]
    }
  ],
  retrogradeBodies: ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune"],
  planetPhaseBodies: ["mercury", "venus"],
  satellites: [
    { key: "iss", name: "ISS", altitudeKm: 408, periodMin: 92.68, inclinationDeg: 51.6, raanDeg: 18, epoch: "2026-01-01T00:00:00Z", phase0: 0.12, color: "#2563eb" },
    { key: "tiangong", name: "Tiangong", altitudeKm: 390, periodMin: 91.8, inclinationDeg: 41.5, raanDeg: 110, epoch: "2026-01-01T00:00:00Z", phase0: 0.44, color: "#22c55e" },
    { key: "hubble", name: "Hubble", altitudeKm: 535, periodMin: 95.42, inclinationDeg: 28.5, raanDeg: 214, epoch: "2026-01-01T00:00:00Z", phase0: 0.66, color: "#a855f7" },
    { key: "envisat", name: "Envisat", altitudeKm: 767, periodMin: 100.2, inclinationDeg: 98.5, raanDeg: 302, epoch: "2026-01-01T00:00:00Z", phase0: 0.28, color: "#f97316" },
    { key: "noaa20", name: "NOAA-20", altitudeKm: 824, periodMin: 101.4, inclinationDeg: 98.7, raanDeg: 56, epoch: "2026-01-01T00:00:00Z", phase0: 0.82, color: "#ef4444" }
  ]
};
