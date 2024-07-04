const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

esbuild.build({
  entryPoints: ['background.ts', 'content.ts', 'devtools.ts', 'devtools_page.ts'],
  bundle: true,
  outdir: 'dist',
  target: 'chrome91',
  format: 'esm',
  define: {
    'global': 'window'
  },
  plugins: [{
    name: 'chrome-extension',
    setup(build) {
      build.onResolve({ filter: /^chrome$/ }, args => {
        return { path: args.path, namespace: 'chrome-extension' }
      });
      build.onLoad({ filter: /.*/, namespace: 'chrome-extension' }, () => {
        return { contents: 'export default chrome' }
      });
    },
  }],
}).then(() => {
  // Copy devtools_page.html to dist
  fs.copyFileSync('devtools_page.html', path.join('dist', 'devtools_page.html'));

  // Copy assets folder to dist
  fs.cpSync('assets', 'dist/assets', { recursive: true });
}).catch(() => process.exit(1));
