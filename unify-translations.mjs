import fs from 'fs';
import path from 'path';

const root = path.join('src', 'assets', 'i18n');
const languages = fs.readdirSync(root).filter(f => fs.statSync(path.join(root, f)).isDirectory());

/** Read translations from each folder */
const translations = {};
for (const lang of languages) {
  translations[lang] = {};
  const dir = path.join(root, lang);
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const key = path.basename(file, '.json').toUpperCase().replace(/-/g, '_');
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    translations[lang][key] = content;
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function markMissing(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return `[MISSING] ${obj}`;
  }
  const result = Array.isArray(obj) ? [] : {};
  for (const k of Object.keys(obj)) {
    result[k] = markMissing(obj[k]);
  }
  return result;
}

function fillMissing(base, target) {
  for (const key of Object.keys(base)) {
    if (!(key in target)) {
      target[key] = markMissing(base[key]);
    } else if (typeof base[key] === 'object' && base[key] !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = markMissing(base[key]);
      } else {
        fillMissing(base[key], target[key]);
      }
    }
  }
}

const baseLang = 'es';
const base = translations[baseLang];

for (const lang of languages) {
  if (lang === baseLang) continue;
  fillMissing(base, translations[lang]);
}

for (const lang of languages) {
  const outfile = path.join(root, `${lang}.json`);
  fs.writeFileSync(outfile, JSON.stringify(translations[lang], null, 2) + '\n');
}

