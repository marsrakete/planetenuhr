const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');
const {getCalendarSourceFiles} = require('./calendar-data');
const {buildExpectedIcsFileMap} = require('./generate-ics');
const {getIcsFreshnessState} = require('./check-ics-freshness');

/** Copies real calendar sources and generates artifacts in an isolated fixture.
 * @param {import('node:test').TestContext} t Test owning fixture cleanup.
 * @returns {{root:string,file:string}} Fixture root and one generated artifact.
 */
function calendarFixture(t){
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'planetenuhr-ics-'));
  t.after(() => fs.rmSync(root, {recursive:true,force:true}));
  const repository = path.resolve(__dirname, '..');
  for (const source of getCalendarSourceFiles(repository)) {
    const destination = path.join(root, path.relative(repository, source));
    fs.mkdirSync(path.dirname(destination), {recursive:true});
    fs.copyFileSync(source, destination);
  }
  const files = buildExpectedIcsFileMap(root);
  for (const [file, content] of files) {
    fs.mkdirSync(path.dirname(file), {recursive:true});
    fs.writeFileSync(file, content);
  }
  return {root,file:files.keys().next().value};
}

test('fresh checkout timestamps do not make unchanged calendar events stale', t => {
  const fixture = calendarFixture(t);
  const later = new Date('2040-01-01T12:00:00Z');
  for (const source of getCalendarSourceFiles(fixture.root)) {
    fs.utimesSync(source, later, later);
  }
  const state = getIcsFreshnessState(fixture.root);
  assert.deepEqual(state.missingFiles, []);
  assert.deepEqual(state.staleFiles, []);
});

test('calendar content changes are still reported as stale', t => {
  const fixture = calendarFixture(t);
  const content = fs.readFileSync(fixture.file, 'utf8').replace('SUMMARY:', 'SUMMARY:Changed ');
  fs.writeFileSync(fixture.file, content);
  assert.deepEqual(getIcsFreshnessState(fixture.root).staleFiles, [path.relative(fixture.root, fixture.file)]);
});

test('missing artifacts are reported separately from stale content', t => {
  const fixture = calendarFixture(t);
  fs.unlinkSync(fixture.file);
  const state = getIcsFreshnessState(fixture.root);
  assert.deepEqual(state.missingFiles, [path.relative(fixture.root, fixture.file)]);
  assert.deepEqual(state.staleFiles, []);
});

test('malformed generation stamps are not ignored', t => {
  const fixture = calendarFixture(t);
  const content = fs.readFileSync(fixture.file, 'utf8').replace(/DTSTAMP:\d{8}T\d{6}Z/, 'DTSTAMP:invalid');
  fs.writeFileSync(fixture.file, content);
  assert.deepEqual(getIcsFreshnessState(fixture.root).staleFiles, [path.relative(fixture.root, fixture.file)]);
});
