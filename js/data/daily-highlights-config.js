/* Editorial selection rules; calculations and visible text live in separate files. */
window.PLANETENUHR_DAILY_CONFIG = {
  maximumItems:5,
  minimumScore:35,
  mergeWindowDays:2,
  limits:{calendar:2, eclipse:1, meteor:1, moon:1, planet:2, conjunction:1, solar:1},
  lookahead:{calendar:7, meteor:7, conjunction:30},
  scores:{eclipse:100, calendar:82, meteorPeak:90, meteorSoon:78, meteorActive:66, moon:72, planet:58, conjunction:61, polar:74},
  meteorPeakDistancePenalty:.2,
  futureDayPenalty:1,
  conjunctionDayPenalty:.5,
  altitudeScorePerDegree:.1,
  moonPhaseTolerance:.035,
  brightMoonPercent:70,
  observation:{planetKeys:['mercury','venus','mars','jupiter','saturn'], sampleMinutes:20, minimumAltitude:10, maximumSunAltitude:-6, minimumSamples:2},
  planetBonus:{mercury:0, venus:4, mars:1, jupiter:3, saturn:2},
  orbitalModelYears:{minimum:1800, maximum:2050},
  cacheEntries:4
};
