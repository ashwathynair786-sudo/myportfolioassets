// Antara shipping box: kraft RSC carton, printed in two inks (Night + Ember).
// Outputs the flat dieline artwork (SVG + vector PDF), a kraft preview and a 3D mockup.
// Run: node gen_box.mjs   (needs Playwright)
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { LIGHTS, ORDER } from '../illustrations/lights-outline.mjs';
const { chromium } = await import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs');
const OUT = new URL('.', import.meta.url).pathname;

// ---------- product + box (all units mm) ----------
const P = {
  name: ['Aurora', 'Gold'], type: 'Fringe pendant light', light: 'fringe', id: 'TBINC 1100',
  size: 'Ø400 × H400 mm', material: 'Fabric', colour: 'Gold + yellow', source: 'E27 holder',
};
const L = 500, W = 450, H = 450, F = W / 2, GLUE = 30;
const INK = '#1A1614', EMBER = '#CD4604', KRAFT = '#C9A47C';
const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Montserrat:wght@400;500;600&family=Tiro+Devanagari+Sanskrit&display=swap">`;

// ---------- brand artwork ----------
const logo = readFileSync(new URL('../logo/antara-logo-primary.svg', import.meta.url), 'utf8');
const [WM_LETTERS, WM_BULBS] = [...logo.matchAll(/<path d="([^"]+)"/g)].map(m => m[1]);
const MARK_A = 'M81.4 0 L0.3 182.2 L6.8 182.2 L74.2 30.7 L139.1 182.2 L161 182.2 L82.9 0Z', MARK_BULB = 'M60.6 100 A13 13 0 0 0 86.6 100Z';
const TAGLINE = readFileSync(new URL('../antara-brand-book.html', import.meta.url), 'utf8').match(/<symbol id="tagline" viewBox="478 1749 451 70"><path d="([^"]+)"/)[1];

const wordmark = (x, y, w, ink = INK, bulb = EMBER) => { const s = w / 946; return `<g transform="translate(${x} ${y}) scale(${s})"><path d="${WM_LETTERS}" fill="${ink}"/><path d="${WM_BULBS}" fill="${bulb}"/></g>`; };
const tagline = (x, y, w, ink = INK) => { const s = w / 451; return `<g transform="translate(${x} ${y}) scale(${s}) translate(-478 -1749)"><path d="${TAGLINE}" fill="${ink}"/></g>`; };
// A light from the outline set, scaled; strokes are thinned so they print at a sensible weight.
const light = (k, x, y, s, k2 = 0.62, ink = INK) => {
  const inner = LIGHTS[k][1].replace(/stroke-width="([\d.]+)"/g, (_, v) => `stroke-width="${(+v * k2).toFixed(3)}"`);
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
};
// Brand shape (the glow) with the mark inside: used as a maker's stamp.
const stamp = (x, y, w) => {
  const h = w * 1.25, glow = `M${0.127 * w} 0 H${0.873 * w} A${w / 2} ${0.6 * h} 0 1 1 ${0.127 * w} 0 Z`, ms = w * 0.42 / 162;
  return `<g transform="translate(${x} ${y})"><path d="${glow}" fill="none" stroke="${INK}" stroke-width="0.9"/>` +
    `<g transform="translate(${w / 2 - 81 * ms} ${h * 0.3}) scale(${ms})"><path d="${MARK_A}" fill="${INK}"/><path d="${MARK_BULB}" fill="${EMBER}"/></g></g>`;
};
const T = (x, y, s, txt, o = {}) => `<text x="${x}" y="${y}" font-family="${o.f || 'Montserrat'}, sans-serif" font-size="${s}" font-weight="${o.w || 400}"` +
  `${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.a ? ` text-anchor="${o.a}"` : ''} fill="${o.c || INK}">${txt}</text>`;

// ---------- icons (24-unit grid, line style) ----------
const ICON = {
  source: `<path d="M8.2 15.2 A6.5 6.5 0 1 1 15.8 15.2 V18 H8.2Z"/><path d="M9 20 H15 M10 22 H14"/><path d="M9.6 10 A2.4 2.4 0 0 0 14.4 10Z" fill="${EMBER}" stroke="none"/>`,
  material: `<path d="M4 5 H20" stroke-width="2"/><path d="M5.5 6 V19 M8.5 6 V20.5 M11.5 6 V19 M14.5 6 V20.5 M17.5 6 V19"/>`,
  colour: `<circle cx="9.5" cy="12" r="6"/><circle cx="14.5" cy="12" r="6"/><path d="M12 6.6 A6 6 0 0 1 12 17.4 A6 6 0 0 1 12 6.6Z" fill="${EMBER}" stroke="none"/>`,
  size: `<path d="M3 21 H18 M3 19 V23 M18 19 V23 M21 3 V18 M19 3 H23 M19 18 H23"/><path d="M6 15 H15 L13 6 H8Z"/>`,
  up: `<path d="M3 21 H21 M8 18 V5 M5 8 L8 4.5 L11 8 M16 18 V5 M13 8 L16 4.5 L19 8"/>`,
  fragile: `<path d="M7 3 H17 L16 9 A4 4 0 0 1 8 9Z M12 13 V20 M8 21 H16"/><path d="M11 3 L12.5 6 L11 8"/>`,
  dry: `<path d="M3.5 12 A8.5 8.5 0 0 1 20.5 12Z M12 12 V19 A2 2 0 0 1 8 19"/><path d="M6 4 V6.5 M12 1.5 V3.5 M18 4 V6.5"/>`,
};
const icon = (k, x, y, size, ink = INK, sw = 1.3) => `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</g>`;
const tile = (k, x, y, label1, label2) => `<rect x="${x}" y="${y}" width="84" height="84" rx="10" fill="none" stroke="${INK}" stroke-width="1.1"/>${icon(k, x + 20, y + 20, 44)}` +
  T(x + 42, y + 104, 9.5, label1, { w: 600, ls: 1.4, a: 'middle' }) + T(x + 42, y + 118, 9.5, label2, { a: 'middle' });
// Handling marks: line icons knocked out of a solid Night square.
const handling = (x, y, size) => ['up', 'fragile', 'dry'].map((k, i) =>
  `<rect x="${x + i * (size + 6)}" y="${y}" width="${size}" height="${size}" rx="2" fill="${INK}"/>${icon(k, x + i * (size + 6) + size * 0.14, y + size * 0.14, size * 0.72, KRAFT, 1.6)}`).join('');
// Placeholder barcode (replace with the real EAN before print).
const barcode = (x, y, w, h) => {
  let s = '', cx = x, seed = 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  while (cx < x + w - 2) { const bw = [0.6, 0.6, 1.2, 1.8][Math.floor(rnd() * 4)]; if (rnd() > 0.42) s += `<rect x="${cx.toFixed(2)}" y="${y}" width="${bw}" height="${h}" fill="${INK}"/>`; cx += bw + 0.6; }
  return s + T(x + w / 2, y + h + 11, 8.5, '0 0000 00000 0', { a: 'middle', ls: 2 });
};
const pill = (x, y, label) => `<rect x="${x}" y="${y}" width="46" height="18" rx="9" fill="${INK}"/>` + T(x + 23, y + 12.4, 9, label, { w: 600, a: 'middle', c: KRAFT, ls: 0.6 });

// ---------- panels (each in its own mm space, origin top-left) ----------
const PANEL = {
  front: () => [
    wordmark(36, 40, 118),
    T(34, 156, 74, P.name[0], { f: 'Cormorant Garamond', w: 500 }), T(34, 226, 74, P.name[1], { f: 'Cormorant Garamond', w: 500 }),
    T(37, 262, 11.5, P.type.toUpperCase(), { w: 500, ls: 2.6 }),
    `<text x="37" y="290" font-family="Tiro Devanagari Sanskrit, serif" font-size="17" fill="${INK}">अंतरा</text>`,
    tagline(84, 277, 96),
    pill(36, 390, 'Size') + T(90, 403, 11, P.size, { w: 500 }),
    light(P.light, 352 - 100 * 1.8, 0, 1.8),
    stamp(428, 36, 36),
  ].join(''),
  sideB: () => [
    wordmark(36, 40, 96),
    T(36, 104, 30, P.name.join(' '), { f: 'Cormorant Garamond', w: 500 }),
    T(37, 124, 9.5, P.type.toUpperCase(), { w: 500, ls: 2.2 }),
    tile('source', 36, 156, 'LIGHT SOURCE', P.source), tile('material', 138, 156, 'MATERIAL', P.material),
    tile('colour', 240, 156, 'COLOUR', P.colour), tile('size', 342, 156, 'SIZE', 'D400 × H400 mm'),
    T(36, 330, 10, 'Handcrafted. Each light is cut, stitched and', {}), T(36, 345, 10, 'finished by hand, so small differences in colour', {}),
    T(36, 360, 10, 'and strand length are part of the piece.', {}),
    T(36, 404, 9, 'PRODUCT ID', { w: 600, ls: 1.6 }) + T(36, 418, 11, P.id, { w: 500 }),
    barcode(306, 362, 108, 40),
  ].join(''),
  sideA: () => [
    T(36, 66, 30, 'Unpacking', { f: 'Cormorant Garamond', w: 500 }),
    ...[['01', 'Open the top flaps and lift the shade out by its', 'frame, never by the fringe.'],
      ['02', 'Shake the strands out gently. Any creases from', 'the journey settle within a day.'],
      ['03', 'Fit an E27 bulb. We recommend a warm LED,', '2700K, up to 9 W.']]
      .map(([n, a, b], i) => T(36, 112 + i * 52, 10, n, { w: 600, ls: 1.4, c: EMBER }) + T(64, 112 + i * 52, 10.5, a) + T(64, 127 + i * 52, 10.5, b)),
    T(36, 290, 30, 'Care', { f: 'Cormorant Garamond', w: 500 }),
    T(36, 322, 10.5, 'Dust with a soft, dry brush. Keep away from water'), T(36, 337, 10.5, 'and switch off before cleaning.'),
    handling(36, 378, 34),
    T(160, 392, 9, 'THIS WAY UP · FRAGILE', { w: 600, ls: 1.4 }) + T(160, 406, 9, 'KEEP DRY', { w: 600, ls: 1.4 }),
    `<g transform="translate(386 368) scale(${28 / 162})"><path d="${MARK_A}" fill="${INK}"/><path d="${MARK_BULB}" fill="${EMBER}"/></g>`,
  ].join(''),
  back: () => [
    wordmark(L / 2 - 95, 54, 190),
    tagline(L / 2 - 60, 100, 120),
    ...ORDER.map((k, i) => light(k, 58 + (i % 6) * 64 - 100 * 0.24 + 32, 140 + Math.floor(i / 6) * 74, 0.24, 1.1)),
    T(L / 2, 312, 9, 'THE TWELVE FORMS OF LIGHT', { w: 600, ls: 2.2, a: 'middle' }),
    T(L / 2, 346, 12, 'Handcrafted lights in rice paper, raw silk,', { a: 'middle' }),
    T(L / 2, 364, 12, 'crushed fabric and rattan cane.', { a: 'middle' }),
    stamp(L / 2 - 14, 386, 28),
  ].join(''),
  topFront: () => handling(36, F - 58, 26) + T(132, F - 47, 9.5, 'LIGHT INSIDE · PLEASE HANDLE WITH CARE', { w: 600, ls: 1.6 }) +
    T(132, F - 33, 9.5, 'Open from the top. Lift by the frame.', {}),
  topBack: () => '',
};

// ---------- flat dieline ----------
const X = { glue: 0, sideA: GLUE, front: GLUE + W, sideB: GLUE + W + L, back: GLUE + W * 2 + L, end: GLUE + W * 2 + L * 2 };
const cols = [['sideA', W], ['front', L], ['sideB', W], ['back', L]];
const SLOT = 3;
const dieline = () => {
  // cut contour: glue flap, bottom flaps with slots, right edge, top flaps with slots
  let d = `M${X.sideA} ${F} L0 ${F + 12} V${F + H - 12} L${X.sideA} ${F + H}`;
  cols.forEach(([k, w], i) => { const x0 = X[k], x1 = x0 + w, a = i ? x0 + SLOT : x0, b = i < 3 ? x1 - SLOT : x1;
    d += ` L${a} ${F + H} V${F * 2 + H} H${b} V${F + H}`; });
  d += ` L${X.end} ${F + H} V${F}`;
  [...cols].reverse().forEach(([k, w], i) => { const x0 = X[k], x1 = x0 + w, b = i ? x1 - SLOT : x1, a = i < 3 ? x0 + SLOT : x0;
    d += ` L${b} ${F} V0 H${a} V${F}`; });
  d += 'Z';
  const folds = `M${X.sideA} ${F} V${F + H} M${X.front} ${F} V${F + H} M${X.sideB} ${F} V${F + H} M${X.back} ${F} V${F + H} M${X.sideA} ${F} H${X.end} M${X.sideA} ${F + H} H${X.end}`;
  return `<g id="dieline" fill="none" stroke="#EC008C" stroke-width="0.5"><path d="${d}"/><path d="${folds}" stroke-dasharray="6 4"/></g>`;
};
const art = () => [
  ...cols.map(([k]) => `<g id="${k}" transform="translate(${X[k]} ${F})">${PANEL[k]()}</g>`),
  `<g id="top-front" transform="translate(${X.front} 0)">${PANEL.topFront()}</g>`,
].join('');
const M = 20, DW = X.end + M * 2, DH = F * 2 + H + M * 2;
const flat = (withKraft) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-M} ${-M} ${DW} ${DH}" width="${DW}mm" height="${DH}mm">` +
  (withKraft ? `<rect x="${-M}" y="${-M}" width="${DW}" height="${DH}" fill="#EFEAE3"/>` : '') +
  `<g id="artwork">${art()}</g>${dieline()}</svg>`;
writeFileSync(`${OUT}antara-box-dieline.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Antara shipping box ${L} x ${W} x ${H} mm (RSC). Inks: Night ${INK}, Ember ${EMBER}. Magenta = dieline: solid cut, dashed fold. Barcode is a placeholder. -->\n` + flat(false));

// ---------- 3D mockup ----------
const grain = `<svg width="0" height="0" style="position:absolute"><defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .55 0"/></filter>
  <filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .2" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .25 0"/></filter>
  <linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".07"/><stop offset=".08" stop-color="#000" stop-opacity="0"/><stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".07"/></linearGradient>
</defs></svg>`;
const face = (w, h, inner, extra = '') => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><rect width="${w}" height="${h}" fill="${KRAFT}"/><rect width="${w}" height="${h}" filter="url(#fibre)"/><rect width="${w}" height="${h}" filter="url(#grain)"/>` +
  `<g style="mix-blend-mode:multiply" opacity=".93">${inner}</g>${extra}<rect width="${w}" height="${h}" fill="url(#edge)"/></svg>`;
const tape = `<rect x="0" y="${F - 30}" width="${L}" height="60" fill="#D8B88E" opacity=".55"/><rect x="0" y="${F - 30}" width="${L}" height="60" filter="url(#grain)" opacity=".5"/>` +
  `<path d="M0 ${F - 30} H${L} M0 ${F + 30} H${L}" stroke="#8C6A45" stroke-opacity=".35" stroke-width="0.8"/><path d="M0 ${F} H${L}" stroke="#6E5236" stroke-opacity=".25" stroke-width="0.6"/>`;
const topFace = face(L, W, `<g transform="translate(0 ${F})">${PANEL.topFront()}</g>`, tape);
const K = 1.25;
const mock = (rx, ry, side = 'right') => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  html,body{margin:0;height:100%;background:#ECE7E0}
  .stage{position:absolute;inset:0;perspective:${3600 * K}px;perspective-origin:50% 40%}
  .box{position:absolute;left:50%;top:51%;transform-style:preserve-3d;transform:rotateX(${rx}deg) rotateY(${ry}deg)}
  .f{position:absolute;backface-visibility:hidden}
  .f svg{display:block;width:100%;height:100%}
  .front{width:${(L) * K}px;height:${(H) * K}px;left:${(-L / 2) * K}px;top:${(-H / 2) * K}px;transform:translateZ(${(W / 2) * K}px)}
  .side{width:${(W) * K}px;height:${(H) * K}px;left:${(-W / 2) * K}px;top:${(-H / 2) * K}px;transform:rotateY(${side === 'right' ? 90 : -90}deg) translateZ(${(L / 2) * K}px);filter:brightness(.8)}
  .top{width:${(L) * K}px;height:${(W) * K}px;left:${(-L / 2) * K}px;top:${(-W / 2) * K}px;transform:rotateX(90deg) translateZ(${(H / 2) * K}px);filter:brightness(1.07)}
  .shadow{position:absolute;width:${(L + 260) * K}px;height:${(W + 260) * K}px;left:${(-(L + 260) / 2) * K}px;top:${(-(W + 260) / 2) * K}px;transform:rotateX(90deg) translateZ(${(-H / 2 - 1) * K}px);
    background:radial-gradient(closest-side,rgba(60,40,25,.38),rgba(60,40,25,.12) 60%,transparent);filter:blur(14px)}
</style></head><body>${grain}<div class="stage"><div class="box">
  <div class="shadow"></div>
  <div class="f front">${face(L, H, PANEL.front())}</div>
  <div class="f side">${face(W, H, side === 'right' ? PANEL.sideB() : PANEL.sideA())}</div>
  <div class="f top">${topFace}</div>
</div></div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
await p.setContent(mock(-20, -31)); await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}antara-box-mockup.jpg`, type: 'jpeg', quality: 90 });
await p.setContent(mock(-16, 34, 'left'));
await p.waitForTimeout(1200);
await p.screenshot({ path: `${OUT}antara-box-mockup-side.jpg`, type: 'jpeg', quality: 90 });

// flat artwork: vector PDF (no background) + kraft preview PNG
const flatPage = (svg, bgKraft) => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>@page{size:${DW}mm ${DH}mm;margin:0}html,body{margin:0}svg{display:block}${bgKraft ? `#bgk{position:absolute;inset:0}` : ''}</style></head><body>${svg}</body></html>`;
await p.setContent(flatPage(flat(false))); await p.waitForTimeout(1200);
await p.pdf({ path: `${OUT}antara-box-dieline.pdf`, width: `${DW}mm`, height: `${DH}mm`, printBackground: true });
const kraftFlat = flat(true).replace('<g id="artwork">', `${grain.replace(/<svg[^>]*>|<\/svg>/g, '')}${[...cols.map(([k, w]) => [X[k], F, w, H]), ...cols.flatMap(([k, w], i) => [[X[k] + (i ? SLOT : 0), 0, w - (i ? SLOT : 0) - (i < 3 ? SLOT : 0), F], [X[k] + (i ? SLOT : 0), F + H, w - (i ? SLOT : 0) - (i < 3 ? SLOT : 0), F]]), [0, F + 12, GLUE, H - 24]]
  .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${KRAFT}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#grain)"/>`).join('')}<g id="artwork" style="mix-blend-mode:multiply">`);
await p.setViewportSize({ width: 2000, height: Math.round(2000 * DH / DW) });
await p.setContent(`<!doctype html><html><head>${FONTS}<style>html,body{margin:0}svg{width:2000px;height:auto;display:block}</style></head><body>${kraftFlat}</body></html>`);
await p.waitForTimeout(1200);
await p.screenshot({ path: `${OUT}antara-box-dieline-preview.jpg`, type: 'jpeg', quality: 88 });
await b.close();
console.log('box', L, W, H, 'sheet', DW, 'x', DH, 'mm');
