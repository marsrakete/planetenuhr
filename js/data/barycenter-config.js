/** Existing approximate planetary masses in solar-mass units and solar radius in AU. */
window.PLANETENUHR_BARYCENTER_CONFIG = {
  massRatios:{
      mercury: 1.6601e-7,
      venus: 2.4478e-6,
      earth: 3.0035e-6,
      mars: 3.2271e-7,
      jupiter: 9.5479e-4,
      saturn: 2.8589e-4,
      uranus: 4.3662e-5,
      neptune: 5.1514e-5
    },
  modes:[
    {id:'btnBarycenterJupiter',mode:'jupiter'},
    {id:'btnBarycenterJupiterSaturn',mode:'jupiter_saturn'},
    {id:'btnBarycenterAll',mode:'all'}
  ],
  sunRadiusAu:0.00465047
};
