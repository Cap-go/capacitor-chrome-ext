#!/usr/bin/env node

const { createWriteStream } = require('node:fs');
const { readdir, stat } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const archiver = require('archiver');

async function addDirectoryToArchive(archive, directory, baseDir) {
  const files = await readdir(directory);
  for (const file of files) {
    const filePath = join(directory, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      await addDirectoryToArchive(archive, filePath, baseDir);
    } else {
      const relativePath = filePath.slice(baseDir.length + 1);
      archive.file(filePath, { name: relativePath });
    }
  }
}

async function createExtensionZip() {
  const rootDir = resolve(__dirname);
  const distDir = join(rootDir, 'dist');
  const assetsDir = join(rootDir, 'assets');
  const outputFile = join(rootDir, 'extension.zip');

  const output = createWriteStream(outputFile);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);

  try {
    // Add manifest.json from the parent directory
    archive.file(join(rootDir, 'manifest.json'), { name: 'manifest.json' });

    // Add all files from the dist directory, maintaining the folder structure
    await addDirectoryToArchive(archive, distDir, rootDir);

    // Add all files from the assets directory, maintaining the folder structure
    await addDirectoryToArchive(archive, assetsDir, rootDir);

    await archive.finalize();
    console.log(`Extension zip created: ${outputFile}`);
  } catch (error) {
    console.error('Error creating zip:', error);
  }
}

createExtensionZip();
