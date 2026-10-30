const fs = require('node:fs');
const path = require('node:path');

/** Reads the dashboard script before or after its transitional extraction.
 * @param {string} root Absolute repository path.
 * @returns {string} Unexecuted classic script source for existing contract tests.
 */
function readDashboardSource(root){
  const external = path.join(root,'js/core/app.js');
  if (fs.existsSync(external)) return fs.readFileSync(external,'utf8');
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  const start = html.lastIndexOf('  <script>');
  const end = html.lastIndexOf('  </script>');
  if (start < 0 || end <= start) throw new Error('Dashboard script not found.');
  return html.slice(start + '  <script>'.length,end);
}

module.exports = {readDashboardSource};
