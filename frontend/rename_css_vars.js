import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'src');

const replacements = {
  '--navy-950': '--bg-sidebar',
  '--navy-900': '--bg-main',
  '--navy-800': '--bg-card',
  '--navy-700': '--border-main',
  '--navy-600': '--border-hover',
  '--navy-500': '--text-muted',
  '--navy-100': '--text-main',
  '--white': '--text-heading', // because I used --white for h1/h2 text and some bold text
  '--gray-500': '--text-muted', // consolidate
};

function walkDir(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach((name) => {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css'))) {
      callback(filePath);
    } else if (stat.isDirectory()) {
      walkDir(filePath, callback);
    }
  });
}

walkDir(dir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const [oldVar, newVar] of Object.entries(replacements)) {
    const regex = new RegExp(oldVar, 'g');
    content = content.replace(regex, newVar);
  }

  // Handle some semantic overrides (for instance, if we used var(--white) for text color vs background)
  // Actually, standardizing on `--text-heading` is fine for text, but if it was used for background, we'll fix manually.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
});
console.log('Global CSS variable refactor complete.');
