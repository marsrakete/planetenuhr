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

window.PLANETENUHR_OUTER_MISSION_DATA = [
  {
    id:'voyager1', name:'Voyager 1', agency:'NASA',
    source:'https://science.nasa.gov/mission/voyager/voyager-1/',
    photo:{milestone:'paleBlueDot',displayYears:1,playbackDuration:15000,source:'https://science.nasa.gov/photojournal/solar-system-portrait-earth-as-pale-blue-dot/'},
    views:[
      {key:'voyager1', label:'planetaryVoyage', planets:['earth','jupiter','saturn'], oblique:true},
      {key:'voyager1Interstellar', label:'interstellarVoyage', oblique:true}
    ],
    flybys:[
      {key:'voyager1Jupiter', body:'planet_jupiter', radius:71492, milestone:'jupiterFlyby'},
      {key:'voyager1Saturn', body:'planet_saturn', radius:60268, milestone:'saturnTitanFlyby'}
    ],
    events:[
      ['1977-09-05','launch',true,undefined,'1977-09-05T14:00Z'],
      ['1979-03-05','jupiterFlyby',true,undefined,'1979-03-05T12:05Z'],
      ['1980-11-12','saturnTitanFlyby',true,undefined,'1980-11-12T23:46Z'],
      ['1990-02-14','paleBlueDot',true],
      ['2012-08-25','heliopause',true]
    ],
    references:[['flybyTimes','https://nssdc.gsfc.nasa.gov/planetary/voyager-periapse.html']]
  },
  {
    id:'voyager2', name:'Voyager 2', agency:'NASA',
    source:'https://science.nasa.gov/mission/voyager/voyager-2/',
    views:[
      {key:'voyager2', label:'planetaryVoyage', planets:['earth','jupiter','saturn','uranus','neptune'], oblique:true},
      {key:'voyager2Interstellar', label:'interstellarVoyage', oblique:true}
    ],
    flybys:[
      {key:'voyager2Jupiter', body:'planet_jupiter', radius:71492, milestone:'jupiterFlyby'},
      {key:'voyager2Saturn', body:'planet_saturn', radius:60268, milestone:'saturnFlyby'},
      {key:'voyager2Uranus', body:'planet_uranus', radius:25559, milestone:'uranusFlyby'},
      {key:'voyager2Neptune', body:'planet_neptune', radius:24764, milestone:'neptuneTritonFlyby'}
    ],
    events:[
      ['1977-08-20','launch',true,undefined,'1977-08-20T16:00Z'],
      ['1979-07-09','jupiterFlyby',true,undefined,'1979-07-09T22:30Z'],
      ['1981-08-26','saturnFlyby',true,undefined,'1981-08-26T03:25Z'],
      ['1986-01-24','uranusFlyby',true,undefined,'1986-01-24T18:00Z'],
      ['1989-08-25','neptuneTritonFlyby',true,undefined,'1989-08-25T03:57Z'],
      ['2018-11-05','heliopause',true]
    ],
    references:[['flybyTimes','https://nssdc.gsfc.nasa.gov/planetary/voyager-periapse.html']]
  },
  {
    id:'pioneer10', name:'Pioneer 10', agency:'NASA',
    source:'https://science.nasa.gov/mission/pioneer-10/',
    views:[
      {key:'pioneer10', label:'planetaryVoyage', planets:['earth','mars','jupiter'], oblique:true, viewNote:'pioneerSolution'},
      {key:'pioneer10Interstellar', label:'interstellarVoyage', oblique:true, viewNote:'pioneerSolution'}
    ],
    flybys:[
      {key:'pioneer10Jupiter', body:'planet_jupiter', radius:71492, milestone:'firstJupiterFlyby'}
    ],
    events:[
      ['1972-03-03','launch',true,undefined,'1972-03-03T02:04Z'],
      ['1972-07-15','asteroidBeltEntry',true],
      ['1973-02','asteroidBeltExit',true],
      ['1973-12-04','firstJupiterFlyby',true,undefined,'1973-12-04T02:26Z'],
      ['2003-01-23','lastSignal',true]
    ]
  },
  {
    id:'pioneer11', name:'Pioneer 11', agency:'NASA',
    source:'https://science.nasa.gov/mission/pioneer-11/',
    views:[
      {key:'pioneer11', label:'planetaryVoyage', planets:['earth','jupiter','saturn'], oblique:true, viewNote:'pioneerSolution'},
      {key:'pioneer11Interstellar', label:'interstellarVoyage', oblique:true, viewNote:'pioneerSolution'}
    ],
    flybys:[
      {key:'pioneer11Jupiter', body:'planet_jupiter', radius:71492, milestone:'polarJupiterFlyby'},
      {key:'pioneer11Saturn', body:'planet_saturn', radius:60268, milestone:'firstSaturnFlyby'}
    ],
    events:[
      ['1973-04-06','launch',true,undefined,'1973-04-06T02:25Z'],
      ['1974-12-03','polarJupiterFlyby',true,undefined,'1974-12-03T05:22Z'],
      ['1976-05-26','saturnCourseCorrection',true],
      ['1979-09-01','firstSaturnFlyby',true,undefined,'1979-09-01T16:31Z'],
      ['1995-09-30','endRoutineContact',true],
      ['1995-11-24','lastEngineeringData',true]
    ],
    references:[['pioneer11JupiterSource','https://www.nasa.gov/history/45-years-ago-pioneer-11-explores-jupiter/']]
  },
  {
    id:'newhorizons', name:'New Horizons', agency:'NASA',
    source:'https://science.nasa.gov/mission/new-horizons/',
    views:[
      {key:'newHorizons',label:'planetaryVoyage',planets:['earth','jupiter','saturn','uranus','neptune'],
        oblique:true,targetOrbit:'newHorizonsPlutoOrbit',targetBody:'pluto',viewNote:'newHorizonsLaunchNote'},
      {key:'newHorizonsKuiper',label:'kuiperVoyage',oblique:true,targetOrbit:'newHorizonsPlutoOrbit',targetBody:'pluto'}
    ],
    flybys:[
      {key:'newHorizonsPluto',body:'planet_pluto',radius:1188.3,minDisplayRadius:14,milestone:'plutoFlyby'},
      {key:'newHorizonsArrokoth',body:'planet_arrokoth',radius:18,minDisplayRadius:19,milestone:'arrokothFlyby'}
    ],
    events:[
      ['2006-01-19','launch',true,undefined,'2006-01-19T19:51Z'],
      ['2007-02-28','jupiterSwingby',true,undefined,'2007-02-28T05:43:40Z'],
      ['2015-07-14','plutoFlyby',true,undefined,'2015-07-14T11:49:57Z'],
      ['2019-01-01','arrokothFlyby',true,undefined,'2019-01-01T05:33Z']
    ],
    references:[['arrokothSource','https://science.nasa.gov/solar-system/kuiper-belt/arrokoth-2014-mu69/']]
  }
];
