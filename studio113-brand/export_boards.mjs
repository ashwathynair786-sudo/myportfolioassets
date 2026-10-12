// Renders every .board in studio113-brand-book.html to portfolio/<data-name>.webp
// Usage: NODE_PATH=$(npm root -g) node export_boards.mjs [scale] [only-name-substring]
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');

const dir = path.dirname(fileURLToPath(import.meta.url));
const scale = Number(process.argv[2] || 1.6);
const only = process.argv[3] || '';
const out = path.join(dir, 'portfolio');
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2100, height: 1200 }, deviceScaleFactor: scale });
await page.goto('file://' + path.join(dir, 'studio113-brand-book.html') + '?export');
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
const boards = await page.$$('.board');
for (const b of boards) {
  const name = await b.getAttribute('data-name');
  if (only && !name.includes(only)) continue;
  const png = path.join(out, name + '.png');
  await b.screenshot({ path: png });
  execFileSync('convert', [png, '-quality', '86', '-define', 'webp:method=6', path.join(out, name + '.webp')]);
  fs.unlinkSync(png);
  console.log(name);
}
await browser.close();
