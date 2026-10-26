const fs = require('node:fs');
const path = require('node:path');

/** Checks one release's metadata and all local JS/CSS references for consistency.
 * @param {string} root Absolute project directory.
 * @returns {string[]} Version mismatch diagnostics; empty for a consistent release.
 */
function checkVersion(root){
  const errors = [];
  const release = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8')).version;
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const current = html.match(/<meta name="planetenuhr-version" content="([^"]+)"/);
  if (typeof release !== 'string' || !/^\d+\.\d+(?:\.\d+)?(?:[-+][A-Za-z0-9.-]+)?$/.test(release)) {
    errors.push('version.json must contain a valid version string.');
  }
  if (!current || current[1] !== release) errors.push('HTML app version must match version.json.');
  for (const match of html.matchAll(/\b(?:src|href)="([^"\s]+\.(?:js|css)(?:\?[^"\s]*)?)"/g)) {
    const url = new URL(match[1], 'https://planetenuhr.invalid/');
    if (url.origin !== 'https://planetenuhr.invalid') continue;
    if (url.searchParams.get('v') !== release) errors.push('Asset version mismatch: ' + match[1]);
  }
  return errors;
}

module.exports = { checkVersion };
if (require.main === module) {
  const errors = checkVersion(path.resolve(__dirname, '..'));
  errors.forEach(error => console.error(error));
  if (errors.length) process.exitCode = 1;
  else console.log('App and asset versions are consistent.');
}
