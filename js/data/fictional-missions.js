// Editorial UTC dates and schematic SVG tracks for the fictional mission timelines.
window.PLANETENUHR_FICTIONAL_MISSIONS = [
  {
    id:'moon',
    events:[
      {at:'1954-07-17T08:00Z', key:'moonLaunch', scene:'moon-route', motions:[['ship','moon-out',0,.08], ['moon','moon-orbit',0,0]]},
      {at:'1954-07-17T12:00Z', key:'moonOutbound', scene:'moon-route', motions:[['ship','moon-out',.08,.86], ['moon','moon-orbit',0,0]]},
      {at:'1954-07-20T15:00Z', key:'moonApproach', scene:'moon-route', motions:[['ship','moon-out',.86,1], ['moon','moon-orbit',0,0]]},
      {at:'1954-07-20T20:00Z', key:'moonLanding', scene:'moon-surface', motions:[['ship','moon-touchdown',0,1]]},
      {at:'1954-07-20T21:00Z', key:'moonSteps', scene:'moon-surface', show:['footsteps'], motions:[['ship','moon-touchdown',1,1]]},
      {at:'1954-07-21T08:00Z', key:'moonRover', scene:'moon-surface', show:['footsteps'], motions:[['ship','moon-touchdown',1,1], ['rover','moon-drive',0,1]]},
      {at:'1954-07-21T18:00Z', key:'moonLiftoff', scene:'moon-route', motions:[['ship','moon-back',0,.07], ['moon','moon-orbit',.32,.34]]},
      {at:'1954-07-21T20:00Z', key:'moonReturn', scene:'moon-route', motions:[['ship','moon-back',.07,1], ['moon','moon-orbit',.34,1]]},
      {at:'1954-07-24T16:00Z', key:'earthLanding', scene:'moon-route', motions:[['ship','moon-back',1,1], ['moon','moon-orbit',1,1]]}
    ]
  },
  {
    id:'odyssey',
    events:[
      {at:'2001-02-14T10:00Z', key:'odysseyStation', scene:'odyssey-station', motions:[['orion','orion-dock',0,1], ['station','station-hub',0,0,145]]},
      {at:'2001-02-15T14:00Z', key:'odysseyClavius', scene:'odyssey-clavius', motions:[['aries','aries-descent',0,1]]},
      {at:'2001-03-01T08:00Z', key:'odysseyDeparture', scene:'jupiter-route', motions:[['ship','jupiter-out',0,1]]},
      {at:'2001-11-21T12:00Z', key:'odysseyEva', scene:'discovery', show:['halOn'], motions:[['pod','discovery-pod',0,1], ['astronaut','discovery-eva',0,1]]},
      {at:'2001-11-22T13:00Z', key:'odysseyHal', scene:'discovery', show:['halOff']},
      {at:'2001-11-25T18:00Z', key:'odysseyMonolith', scene:'monolith', motions:[['ship','monolith-pass',1,1]]}
    ]
  },
  {
    id:'interstellar',
    clocks:{start:'2069-09-03T09:00Z', end:'2069-09-03T13:00Z', enduranceEnd:'2092-09-03T09:00Z'},
    events:[
      {at:'2067-09-01T08:00Z', key:'interstellarDeparture', scene:'saturn-route', motions:[['ship','saturn-out',0,1]]},
      {at:'2069-09-01T10:00Z', key:'interstellarSaturn', scene:'saturn-route', motions:[['ship','saturn-out',1,1]]},
      {at:'2069-09-01T12:00Z', key:'interstellarWormhole', scene:'wormhole', motions:[['ship','wormhole-pass',0,1]]},
      {at:'2069-09-03T07:00Z', key:'millerApproach', scene:'miller-orbit', motions:[['lander','miller-in',0,1]]},
      {at:'2069-09-03T09:00Z', key:'millerLanding', scene:'miller-surface', motions:[['lander','miller-down',0,1]], clocks:true},
      {at:'2069-09-03T10:00Z', key:'millerStay', scene:'miller-surface', motions:[['lander','miller-down',1,1], ['wave','miller-wave',0,1]], clocks:true},
      {at:'2069-09-03T13:00Z', key:'millerReturn', scene:'miller-orbit', motions:[['lander','miller-back',1,1]], clocks:true},
      {at:'2092-09-05T10:00Z', key:'mannLanding', scene:'mann-surface', motions:[['lander','mann-descent',0,1]]},
      {at:'2092-09-05T16:00Z', key:'enduranceDocking', scene:'endurance-docking', motions:[['lander','endurance-dock',0,1,360], ['ring','endurance-hub',0,0,360]]},
      {at:'2092-09-06T08:00Z', key:'gargantuaSeparation', scene:'gargantua', motions:[['ship','gargantua-out',0,1], ['ranger','gargantua-in',0,1]]},
      {at:'2156-04-12T10:00Z', key:'cooperRescue', scene:'cooper-station'},
      {at:'2156-04-12T18:00Z', key:'edmundsCamp', scene:'edmunds-camp'}
    ]
  },
  {
    id:'hailMary',
    events:[
      {at:'2053-03-04T06:00Z', key:'hailWake', scene:'hail-cabin'},
      {at:'2053-03-04T18:00Z', key:'hailTauCeti', scene:'tau-route', motions:[['ship','tau-in',.93,1]]},
      {at:'2053-03-08T12:00Z', key:'hailRendezvous', scene:'rendezvous', motions:[['ship','hail-dock',0,1], ['rocky','rocky-dock',0,1]]},
      {at:'2053-03-08T16:00Z', key:'hailDock', scene:'rendezvous', show:['tunnel'], motions:[['ship','hail-dock',1,1], ['rocky','rocky-dock',1,1]]},
      {at:'2053-05-22T15:00Z', key:'hailAdrian', scene:'adrian', show:['sample'], motions:[['ship','adrian-pass',0,1]]},
      {at:'2053-08-10T08:00Z', key:'hailSeparate', scene:'hail-return', show:['earthRoute'], motions:[['ship','hail-earth',.17,1], ['rocky','hail-rocky',.12,1]]},
      {at:'2053-09-18T10:00Z', key:'hailProbes', scene:'hail-return', show:['earthRoute','probeCaption'], motions:[['ship','hail-earth',1,1], ['rocky','hail-rocky',1,1], ['probes','hail-probes',0,1]]},
      {at:'2053-09-18T11:00Z', key:'hailTurn', scene:'hail-return', show:['abandoned','rescuePath'], motions:[['ship','hail-turn',0,1], ['rocky','hail-rocky',1,1], ['probes','hail-probes',1,1]]},
      {at:'2053-10-02T12:00Z', key:'hailTogether', scene:'hail-return', show:['abandoned','rescuePath','jointPath'], motions:[['ship','hail-erid',0,1], ['rocky','rocky-erid',0,1]]},
      {at:'2068-06-12T12:00Z', key:'hailArrival', scene:'hail-return', show:['abandoned','rescuePath','jointPath'], motions:[['ship','hail-erid',1,1], ['rocky','rocky-erid',1,1]]}
    ]
  }
];
