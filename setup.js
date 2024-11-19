import { mkdir } from 'fs/promises';
import { join } from 'path';

const directories = [
  'src/config',
  'src/scrapers',
  'src/utils',
  'results'
];

async function createDirectories() {
  try {
    for (const dir of directories) {
      await mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

createDirectories();