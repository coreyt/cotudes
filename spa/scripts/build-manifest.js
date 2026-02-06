#!/usr/bin/env node

/**
 * Collects all practice.json files from the cotudes directory
 * and generates a manifest.json for the SPA to consume.
 *
 * Also copies practice.json files into public/ so they're available
 * at build time.
 */

import { readdir, readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COTUDES_DIR = join(__dirname, '..', '..', 'cotudes');
const PUBLIC_DIR = join(__dirname, '..', 'public');
const PRACTICE_DIR = join(PUBLIC_DIR, 'practice');

async function main() {
  // Ensure output directory exists
  await mkdir(PRACTICE_DIR, { recursive: true });

  const entries = await readdir(COTUDES_DIR, { withFileTypes: true });
  const etudes = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const practiceJsonPath = join(COTUDES_DIR, entry.name, 'practice.json');
    try {
      const content = await readFile(practiceJsonPath, 'utf-8');
      const data = JSON.parse(content);

      // Copy practice.json to public directory
      const destFilename = `${data.etude_id.toLowerCase()}.json`;
      await copyFile(practiceJsonPath, join(PRACTICE_DIR, destFilename));

      etudes.push({
        etude_id: data.etude_id,
        title: data.title,
        path: data.path,
        competency: data.competency,
        practice_url: `./practice/${destFilename}`,
      });
    } catch {
      // Skip directories without practice.json
    }
  }

  // Sort by etude_id
  etudes.sort((a, b) => a.etude_id.localeCompare(b.etude_id));

  const manifest = { etudes };
  await writeFile(
    join(PUBLIC_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`Manifest generated with ${etudes.length} etudes:`);
  for (const e of etudes) {
    console.log(`  ${e.etude_id}: ${e.title}`);
  }
}

main().catch(err => {
  console.error('Manifest generation failed:', err);
  process.exit(1);
});
