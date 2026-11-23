window.PLANETENUHR_SPACE_MISSION_DATA = [
  {
    id: 'bepicolombo', name: 'BepiColombo', agency: 'ESA / JAXA',
    source: 'https://www.esa.int/bepicolombo',
    tracker: 'https://bepicolombo.esac.esa.int/bscs-qla/home',
    views: [
      {key:'bepicolombo', label:'cruiseView', planets:['mercury','venus','earth']},
      {key:'mercury', label:'mercuryView', body:'planet_mercury', radius:2440, marker:'MPO', secondary:'mio', faceOn:true}
    ],
    events: [
      ['2018-10-20', 'launch', true],
      ['2020-04-10', 'earthFlyby', true],
      ['2020-10-15', 'venusFlyby', true],
      ['2021-08-11', 'venusFlyby', true],
      ['2021-10-01', 'mercuryFlyby', true],
      ['2025-01-08', 'mercuryFlyby', true],
      ['2026-11-21', 'mercuryOrbit', true],
      ['2026-12-09', 'mioSeparation', false, '2026-12-10'],
      ['2027-04', 'science', false]
    ]
  },
  {
    id: 'hera', name: 'Hera', agency: 'ESA',
    source: 'https://www.esa.int/et/missions/about-us/directorates/operations/space-safety/hera',
    tracker: 'https://hera.esa.int/',
    views: [
      {key:'hera', label:'cruiseView', planets:['earth','mars'], targetOrbit:'didymosOrbit', targetName:'Didymos'},
      {key:'didymos', label:'didymosView', bodyName:'Didymos', radius:0.39,
        bodyTemplate:'spaceMissionDidymosTemplate', distanceLabel:'didymosDistance', viewNote:'didymosScale'}
    ],
    events: [
      ['2024-10-07', 'launch', true],
      ['2025-03-12', 'marsFlyby', true],
      ['2026-11', 'asteroidSurvey', true],
      ['2026-11-25', 'dimorphosImages', false]
    ],
    notes: [
      ['laterMission', 'heraCloseObservation', 'planned'],
      ['missionEnd', 'heraJuventasLanding', 'planned'],
      ['missionEnd', 'heraDidymosLanding', 'underReview']
    ],
    references: [
      ['heraOperations', 'https://www.esa.int/articles/about-us/directorates/operations/space-safety/finding-hera-s-way-flight-dynamics-team-in-action'],
      ['heraMissionEndSource', 'https://www.esa.int/articles/about-us/directorates/operations/space-safety/hera-operations'],
      ['heraMediaKit', 'https://media.esa.int/global/public/common/misc/2026/11/hera-media-kit-nov-2026-1794864022.pdf']
    ]
  },
  {
    id: 'europa', name: 'Europa Clipper', agency: 'NASA',
    source: 'https://science.nasa.gov/mission/europa-clipper/',
    tracker: 'https://eyes.nasa.gov/apps/solar-system/#/sc_europa_clipper',
    views: [
      {key:'europa', label:'cruiseView', planets:['earth','mars','jupiter']},
      {key:'clipperEarth', label:'earthView', body:'planet_earth', radius:6378}
    ],
    events: [
      ['2024-10-14', 'launch', true],
      ['2025-03-01', 'marsFlyby', true],
      ['2026-12-03', 'earthFlyby', false],
      ['2030-04', 'jupiterOrbit', false],
      ['2031', 'europaFlybys', false]
    ]
  },
  {
    id: 'juice', name: 'Juice', agency: 'ESA',
    source: 'https://www.esa.int/missions/about-us/directorates/science/juice',
    tracker: 'https://www.esa.int/articles/about-us/directorates/science/juice/where-is-juice-now',
    views: [{key:'juice', label:'cruiseView', planets:['venus','earth','jupiter']}],
    events: [
      ['2023-04-14', 'launch', true],
      ['2024-08-19', 'lunarEarthFlyby', true, '2024-08-20'],
      ['2025-08-31', 'venusFlyby', true],
      ['2026-09-28', 'earthFlyby', true],
      ['2029-01', 'earthFlyby', false],
      ['2031-07', 'jupiterOrbit', false]
    ]
  },
  {
    id: 'psyche', name: 'Psyche', agency: 'NASA',
    source: 'https://science.nasa.gov/mission/psyche/',
    tracker: 'https://eyes.nasa.gov/apps/solar-system/#/sc_psyche',
    views: [
      {key:'psyche', label:'cruiseView', planets:['earth','mars']},
      {key:'psycheMars', label:'marsView', body:'planet_mars', radius:3390}
    ],
    events: [
      ['2023-10-13', 'launch', true],
      ['2026-05-15', 'marsFlyby', true],
      ['2029-08', 'psycheArrival', false]
    ]
  },
  {
    id: 'dragonfly', name: 'Dragonfly', agency: 'NASA',
    source: 'https://science.nasa.gov/mission/dragonfly/',
    views: [{
      key:'titan', label:'titanView', bodyName:'Titan',
      source:'https://science.nasa.gov/mission/dragonfly/multimedia/',
      stages:[
        ['entry', -2.4, 2.4],
        ['parachute', -1.45, 1.6],
        ['heatShield', -0.75, 1],
        ['rotorFlight', 0.15, 0.48],
        ['touchdown', 1.3, 0]
      ]
    }],
    events: [
      ['2026-10', 'assembly', true],
      ['2028-07', 'earliestLaunch', false],
      ['2034', 'titanLanding', false]
    ]
  }
];
