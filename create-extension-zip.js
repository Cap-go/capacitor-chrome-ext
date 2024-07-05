#!/usr/bin/env node

const { createWriteStream } = require('node:fs');
const { readdir, stat } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const archiver = require('archiver');

async function createExtensionZip() {
  const rootDir = resolve(__dirname);
  const distDir = join(rootDir, 'dist');
  const outputFile = join(rootDir, 'extension.zip');

  const output = createWriteStream(outputFile);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);

  // Add manifest.json from the parent directory
  archive.file(join(rootDir, 'manifest.json'), { name: 'manifest.json' });

  // Add all files from the dist directory
  try {
    const files = await readdir(distDir);
    for (const file of files) {
      const filePath = join(distDir, file);
      const stats = await stat(filePath);
      if (stats.isFile()) {
        archive.file(filePath, { name: file });
      }
    }

    await archive.finalize();
    console.log(`Extension zip created: ${outputFile}`);
  } catch (error) {
    console.error('Error creating zip:', error);
  }
}

createExtensionZip();
