const esbuild = require('esbuild');
const { readFileSync, writeFileSync, copyFileSync, existsSync, cpSync } = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

// Build JavaScript/TypeScript files
esbuild.build({
  entryPoints: [
    'src/background.ts',
    'src/content.ts',
    'src/devtools_page.ts',
    'src/panel.ts'
  ],
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
  // Process CSS with Tailwind
  const css = readFileSync('src/styles.css', 'utf8');
  postcss([tailwindcss, autoprefixer])
    .process(css, { from: 'src/styles.css', to: 'dist/styles.css' })
    .then(result => {
      writeFileSync('dist/styles.css', result.css);
      console.log('CSS processed and written to dist/styles.css');
    })
    .catch(error => {
      console.error('Error processing CSS:', error);
    });

  // Copy HTML files
  ['devtools_page.html', 'panel.html'].forEach(file => {
    copyFileSync(path.join('src', file), path.join('dist', file));
    console.log(`Copied ${file} to dist/`);
  });

  // Copy assets folder to dist if it exists
  if (existsSync('src/assets')) {
    cpSync('src/assets', 'dist/assets', { recursive: true });
    console.log('Copied assets to dist/assets');
  }
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
