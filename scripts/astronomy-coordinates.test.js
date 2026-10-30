const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const context = vm.createContext({window:{}, Date, Math});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/models/astronomy-coordinates.js'), 'utf8'), context);
const coordinates = context.window.PLANETENUHR_COORDINATES;

/** Checks a numerical result against a reference within an absolute tolerance.
 * @param {number} actual Calculated result.
 * @param {number} expected Reference result.
 * @param {number} tolerance Maximum absolute difference.
 * @returns {void}
 */
function near(actual, expected, tolerance){
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
}

test('Julian date, angle normalization and local sidereal time use established reference values', () => {
  const epoch = new Date('2000-01-01T12:00:00Z');
  near(coordinates.julianDate(epoch), 2451545, 1e-10);
  near(coordinates.julianDate(new Date('1970-01-01T00:00:00Z')), 2440587.5, 1e-10);
  assert.equal(coordinates.normalizeDeg(-15), 345);
  assert.equal(coordinates.normalizeDeg(720), 0);
  assert.equal(coordinates.signedDeg(270), -90);
  near(coordinates.localSiderealAngleDegrees(epoch, 0), 280.46061837, 1e-8);
  near(coordinates.localSiderealAngleDegrees(epoch, 15), 295.46061837, 1e-8);
});

test('ecliptic and local horizon transformations preserve geometric reference directions', () => {
  const epoch = new Date('2000-01-01T12:00:00Z');
  const equinox = coordinates.eclipticToEquatorial(0, 0, epoch);
  near(equinox.rightAscensionDeg, 0, 1e-10);
  near(equinox.declinationDeg, 0, 1e-10);
  const solstice = coordinates.eclipticToEquatorial(90, 0, epoch);
  near(solstice.rightAscensionDeg, 90, 1e-10);
  near(solstice.declinationDeg, 23.439291, 1e-8);
  const sidereal = coordinates.localSiderealAngleDegrees(epoch, 0);
  const north = coordinates.horizontalCoordinates(epoch, {latitude:52, longitude:0}, {rightAscensionDeg:sidereal, declinationDeg:0});
  near(north.altitudeDeg, 38, 1e-8);
  near(north.azimuthDeg, 180, 1e-8);
  const south = coordinates.horizontalCoordinates(epoch, {latitude:-52, longitude:0}, {rightAscensionDeg:sidereal, declinationDeg:0});
  near(south.altitudeDeg, 38, 1e-8);
  near(south.azimuthDeg, 0, 1e-8);
  const below = coordinates.horizontalCoordinates(epoch, {latitude:52, longitude:0}, {rightAscensionDeg:(sidereal + 180) % 360, declinationDeg:0});
  near(below.altitudeDeg, -38, 1e-8);
});
