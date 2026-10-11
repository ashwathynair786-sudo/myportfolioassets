// Builds outline-only vector files of Antara's twelve light forms for packaging.
// Same drawings as the brand book, with the glow, halo and light-pool fills removed.
// Run: node gen_outlines.mjs   (needs Playwright, used to measure bounds and print the PDF)
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
const { chromium } = await import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs');
const OUT = new URL('.', import.meta.url).pathname;

import { LIGHTS, ORDER } from './lights-outline.mjs';
const COLOURS = { night: '#1A1614', ember: '#CD4604', moonlight: '#F4F1EA' };
const g = (inner, c) => `<g fill="none" stroke="${c}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;

const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg">${ORDER.map(k => `<g id="${k}">${LIGHTS[k][1]}</g>`).join('')}</svg>`);
const boxes = await p.evaluate(ks => Object.fromEntries(ks.map(k => { const r = document.getElementById(k).getBBox(); return [k, [r.x, r.y, r.width, r.height]]; })), ORDER);

const PAD = 3;
for (const k of ORDER) {
  const [x, y, w, h] = boxes[k], vb = [x - PAD, Math.max(0, y - PAD), w + PAD * 2, h + PAD * 2 - (y - PAD < 0 ? PAD - y : 0)].map(v => +v.toFixed(2));
  for (const [cn, c] of Object.entries(COLOURS)) {
    mkdirSync(`${OUT}svg/${cn}`, { recursive: true });
    writeFileSync(`${OUT}svg/${cn}/antara-light-${k}.svg`,
      `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}">\n<title>Antara · ${LIGHTS[k][0]}</title>\n${g(LIGHTS[k][1], c)}\n</svg>\n`);
  }
}

// one sheet with all twelve: SVG + vector PDF + PNG preview
const cell = (k, c, ink) => `<g transform="translate(${(ORDER.indexOf(k) % 4) * 240 + 20} ${Math.floor(ORDER.indexOf(k) / 4) * 320 + 20})">${g(LIGHTS[k][1], c)}<text x="100" y="286" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="11" letter-spacing="2.2" fill="${ink}">${LIGHTS[k][0].toUpperCase()}</text></g>`;
const sheet = (c, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 980" width="960" height="980"><rect width="960" height="980" fill="${bg}"/>${ORDER.map(k => cell(k, c, c)).join('')}</svg>`;
writeFileSync(`${OUT}antara-lights-outline-sheet.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n` + sheet(COLOURS.night, 'none').replace('<rect width="960" height="980" fill="none"/>', ''));
await p.setViewportSize({ width: 960, height: 980 });
await p.setContent(`<style>@page{size:960px 980px;margin:0}html,body{margin:0}</style><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap">` + sheet(COLOURS.night, '#F4F1EA'));
await p.waitForTimeout(800);
await p.pdf({ path: `${OUT}antara-lights-outline-sheet.pdf`, width: '960px', height: '980px', printBackground: true });
await p.screenshot({ path: `${OUT}antara-lights-outline-sheet.png` });
await b.close();
console.log('done', ORDER.length * 3, 'svgs');
