const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

esbuild.build({
  entryPoints: ['background.ts', 'content.ts', 'devtools_page.ts', 'panel.ts'],
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
  // Copy HTML files to dist
  ['devtools_page.html', 'panel.html'].forEach(file => {
    fs.copyFileSync(file, path.join('dist', file));
  });

  // Copy assets folder to dist if it exists
  if (fs.existsSync('assets')) {
    fs.cpSync('assets', 'dist/assets', { recursive: true });
  }
}).catch(() => process.exit(1));
