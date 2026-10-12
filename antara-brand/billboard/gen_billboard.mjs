// Antara billboard: flat face artwork (print) + a 3D roadside mockup at dusk.
// The light illustration and wordmark come straight from the brand book.
// Run: node gen_billboard.mjs   (needs Playwright)
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
const { chromium } = await import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs');
const OUT = new URL('.', import.meta.url).pathname;
const book = readFileSync(new URL('../antara-brand-book.html', import.meta.url), 'utf8');

// brand sprite (gradients + wordmark symbol) and the light-drawing script
const sprite = book.slice(book.indexOf('<svg width="0" height="0"'), book.indexOf('</defs></svg>') + '</defs></svg>'.length);
const lightsJs = book.slice(book.indexOf('// ---------- drawing helpers'), book.indexOf("document.querySelectorAll('svg[data-lamp]')")) +
  "document.querySelectorAll('svg[data-lamp]').forEach(el => { el.innerHTML = LIGHTS[el.dataset.lamp].svg; });";
const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@400;500&display=swap">`;

const COPY = { line1: 'Light you can', line2: 'feel.', sub: 'Handcrafted lights in paper, silk and cane', lamp: 'silkbell' };
const FW = 1600, FH = 660;

// ---------- flat face ----------
const face = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  @page { size: ${FW}px ${FH}px; margin: 0 }
  html, body { margin: 0 }
  .face { position: relative; width: ${FW}px; height: ${FH}px; overflow: hidden; background: #1A1614; --ink: #F5E5CC; --tile: #1A1614; }
  .face::before { content: ""; position: absolute; left: 860px; top: -40px; width: 760px; height: 760px; background: radial-gradient(closest-side, rgba(255,160,14,.22), rgba(255,160,14,.06) 55%, transparent); }
  .lamp { position: absolute; top: 0; left: 1036px; height: ${FH}px; width: ${Math.round(FH * 200 / 260)}px; overflow: visible; }
  h1 { position: absolute; left: 112px; top: 96px; margin: 0; font-family: "Cormorant Garamond", serif; font-weight: 300; font-size: 156px; line-height: .94; letter-spacing: -.01em; color: #F5E5CC; }
  h1 em { font-weight: 300; color: #FFA00E; }
  p { position: absolute; left: 118px; top: 452px; margin: 0; font-family: Montserrat, sans-serif; font-weight: 500; font-size: 19px; letter-spacing: .24em; text-transform: uppercase; color: #D8D2C7; }
  .wm { position: absolute; left: 118px; bottom: 74px; width: 250px; height: auto; }
</style></head><body>${sprite}
<div class="face">
  <svg class="lamp" data-lamp="${COPY.lamp}" viewBox="0 0 200 260" aria-hidden="true"></svg>
  <h1>${COPY.line1}<br><em>${COPY.line2}</em></h1>
  <p>${COPY.sub}</p>
  <svg class="wm" viewBox="0 0 946 188" aria-label="Antara" style="--ink:#F5E5CC;--bulb:#FFA00E"><use href="#wm" width="946" height="188"/></svg>
</div>
<script>(() => { ${lightsJs} })();</script></body></html>`;
writeFileSync(`${OUT}face.html`, face);

// ---------- 3D mockup ----------
const W = 1000, H = Math.round(W * FH / FW), D = 84, R = 46, SL = 28; // billboard size, depth, corner radius, slices
const slices = Array.from({ length: SL }, (_, i) => {
  const z = -(i + 1) * (D / SL), shade = Math.round(52 - i * 0.9);
  return `<div class="sl" style="transform:translateZ(${z.toFixed(1)}px);background:rgb(${shade},${shade - 6},${shade - 9})"></div>`;
}).join('');
const scene = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; height: 100%; overflow: hidden }
  body { background: linear-gradient(180deg, #1E1A2C 0%, #33293F 30%, #6E4A55 58%, #C27B66 80%, #EBB085 94%, #F4C996 100%); }
  .sun { position: absolute; right: -10%; bottom: -30%; width: 90%; height: 80%; background: radial-gradient(closest-side, rgba(255,200,140,.45), transparent); }
  .stage { position: absolute; inset: 0; perspective: 2100px; perspective-origin: 42% 118%; }
  .rig { position: absolute; left: 47%; top: 34%; transform-style: preserve-3d; transform: rotateY(-23deg) rotateX(2deg); }
  .rig * { transform-style: preserve-3d; }
  .sl, .front { position: absolute; left: ${-W / 2}px; top: ${-H / 2}px; width: ${W}px; height: ${H}px; border-radius: ${R}px; }
  .front { transform: translateZ(1px); background: #2B2522; padding: 7px; box-sizing: border-box; }
  .front img { display: block; width: 100%; height: 100%; border-radius: ${R - 7}px; object-fit: cover; }
  .walk { position: absolute; left: ${-(W + 260) / 2}px; top: ${-55}px; width: ${W + 260}px; height: 110px; transform: translateY(${H / 2 + 44}px) rotateX(90deg);
    background: repeating-linear-gradient(90deg, #1b1716 0 3px, #2b2421 3px 9px), #231d1b; box-shadow: inset 0 0 0 4px #3a2f2a; }
  .walk-edge { position: absolute; left: ${-(W + 260) / 2}px; width: ${W + 260}px; height: 12px; top: ${H / 2 + 38}px; transform: translateZ(55px); background: linear-gradient(#5a463b, #2a221f); }
  .beam { position: absolute; height: 10px; top: ${H / 2 + 54}px; background: linear-gradient(#6a5244, #2a221f); }
  .lampf { position: absolute; width: 46px; height: 16px; top: ${H / 2 + 26}px; transform: translateZ(40px); background: linear-gradient(#4a3c35, #1e1917); border-radius: 3px; }
  .pole { position: absolute; left: -48px; width: 96px; top: ${H / 2 + 48}px; height: 1400px; transform: translateZ(${-D / 2}px) rotateY(23deg);
    background: linear-gradient(90deg, #120f0e 0%, #3b302b 18%, #7a6052 38%, #3a2e29 62%, #151110 100%); }
</style></head><body><div class="sun"></div><div class="stage">
  <div class="rig"><div class="pole"></div></div>
  <div class="rig">${slices}<div class="front"><img src="antara-billboard-face.png" alt=""></div></div>
  <div class="rig">
    <div class="walk"></div>
    <div class="walk-edge"></div>
    <div class="beam" style="left:${-W / 2 - 60}px;width:${W * 0.55}px;transform:translateZ(28px)"></div>
    <div class="beam" style="left:${W * 0.05}px;width:${W * 0.55}px;transform:translateZ(-14px)"></div>
    <div class="lampf" style="left:${-W * 0.3}px"></div><div class="lampf" style="left:${W * 0.22}px"></div>
  </div>
</div></body></html>`;
writeFileSync(`${OUT}scene.html`, scene);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: FW, height: FH }, deviceScaleFactor: 2 });
await p.goto('file://' + OUT + 'face.html'); await p.waitForTimeout(1500);
await p.locator('.face').screenshot({ path: `${OUT}antara-billboard-face.png` });
await p.pdf({ path: `${OUT}antara-billboard-face.pdf`, width: `${FW}px`, height: `${FH}px`, printBackground: true });
const q = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
await q.goto('file://' + OUT + 'scene.html'); await q.waitForTimeout(1200);
await q.screenshot({ path: `${OUT}antara-billboard-mockup.jpg`, type: 'jpeg', quality: 90 });
await b.close();
console.log('done');
