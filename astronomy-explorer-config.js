// Physical constants: https://ssd.jpl.nasa.gov/astro_par.html
// Positions come from the existing JPL approximate J2000 orbital model.
window.PLANETENUHR_EXPLORER_CONFIG = {
  astronomicalUnitKm: 149597870.7,
  lightSpeedKmPerSecond: 299792.458,
  j2000ObliquityDegrees: 23.43928,
  horizonPlanetKeys: ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
  lightPlanetKeys: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'voyager1'],
  defaultHorizonPlanet: 'jupiter',
  solarAltitudeLimits: { sunrise:-0.8333, civil:-6, nautical:-12, astronomical:-18 },
  solarSampleMinutes: 2,
  lightPhaseKeys: ['night', 'morning', 'day', 'evening'],
  defaultLightPlanet: 'earth',
  defaultLightProgress: 0
};
