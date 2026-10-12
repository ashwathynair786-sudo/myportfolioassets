// Antara billboard: flat face artwork (print) + a 3D roadside mockup at dusk.
// The light illustration and wordmark come straight from the brand book.
// Run: node gen_billboard.mjs   (needs Playwright)
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
const { chromium } = await import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs');
const OUT = new URL('.', import.meta.url).pathname;
const book = readFileSync(new URL('../antara-brand-book.html', import.meta.url), 'utf8');

// brand sprite (gradients + wordmark symbol) and the light-drawing script
const sprite = book.slice(book.indexOf('<svg width="0" height="0"'), book.indexOf('</defs></svg>') + '</defs></svg>'.length);
const lightsJs = book.slice(book.indexOf('// ---------- drawing helpers'), book.indexOf("document.querySelectorAll('svg[data-lamp]')")) +
  "document.querySelectorAll('svg[data-lamp]').forEach(el => { el.innerHTML = LIGHTS[el.dataset.lamp].svg; });";
// Billboard type: Montserrat SemiBold + Bold, loaded from the font files in ./fonts
const FONTS = `<style>
  @font-face { font-family: "MontserratBB"; font-weight: 600; src: url("fonts/Montserrat-SemiBold.ttf") format("truetype"); }
  @font-face { font-family: "MontserratBB"; font-weight: 700; src: url("fonts/Montserrat-Bold.ttf") format("truetype"); }
</style>`;

const COPY = { line1: 'Light you can', line2: 'feel.', sub: 'Handcrafted lights in paper, silk and cane', lamp: 'silkbell' };
const FW = 1600, FH = 660;

// ---------- flat face ----------
const face = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  @page { size: ${FW}px ${FH}px; margin: 0 }
  html, body { margin: 0 }
  .face { position: relative; width: ${FW}px; height: ${FH}px; overflow: hidden; background: #1A1614; --ink: #F5E5CC; --tile: #1A1614; }
  .face::before { content: ""; position: absolute; left: 860px; top: -40px; width: 760px; height: 760px; background: radial-gradient(closest-side, rgba(255,160,14,.22), rgba(255,160,14,.06) 55%, transparent); }
  .face.off::before, .face.off .glow { opacity: 0; }
  .lamp { position: absolute; top: 0; left: 1036px; height: ${FH}px; width: ${Math.round(FH * 200 / 260)}px; overflow: visible; }
  h1 { position: absolute; left: 112px; top: 210px; margin: 0; white-space: nowrap; font-family: MontserratBB, sans-serif; font-weight: 600; font-size: 100px; line-height: 1; letter-spacing: -.025em; color: #F5E5CC; }
  h1 em { font-style: normal; font-weight: 700; color: #FFA00E; }
  p { position: absolute; left: 118px; top: 384px; margin: 0; font-family: MontserratBB, sans-serif; font-weight: 600; font-size: 19px; letter-spacing: .24em; text-transform: uppercase; color: #D8D2C7; }
  .wm { position: absolute; left: 118px; bottom: 74px; width: 250px; height: auto; }
</style></head><body>${sprite}
<div class="face">
  <svg class="lamp" data-lamp="${COPY.lamp}" viewBox="0 0 200 260" aria-hidden="true"></svg>
  <h1>${COPY.line1} <em>${COPY.line2}</em></h1>
  <p>${COPY.sub}</p>
  <svg class="wm" viewBox="0 0 946 188" aria-label="Antara" style="--ink:#F5E5CC;--bulb:#FFA00E"><use href="#wm" width="946" height="188"/></svg>
</div>
<script>(() => { ${lightsJs} })();
// headline on one line: shrink to fit the space left of the light
document.fonts.ready.then(() => { const h = document.querySelector('h1'), max = 880; let fs = 100; while (h.scrollWidth > max && fs > 40) h.style.fontSize = (fs -= 1) + 'px'; document.body.dataset.ready = '1'; });</script></body></html>`;
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
  .front .lit { position: absolute; left: 7px; top: 7px; width: calc(100% - 14px); height: calc(100% - 14px); animation: blink 5s infinite both; }
  @keyframes blink { 0%, 12% { opacity: 0; } 13% { opacity: 1; } 14.5% { opacity: .15; } 16% { opacity: .9; } 17% { opacity: .1; } 19%, 84% { opacity: 1; } 85% { opacity: .2; } 86% { opacity: 1; } 88%, 100% { opacity: 0; } }
  .walk { position: absolute; left: ${-(W + 260) / 2}px; top: ${-55}px; width: ${W + 260}px; height: 110px; transform: translateY(${H / 2 + 44}px) rotateX(90deg);
    background: repeating-linear-gradient(90deg, #1b1716 0 3px, #2b2421 3px 9px), #231d1b; box-shadow: inset 0 0 0 4px #3a2f2a; }
  .walk-edge { position: absolute; left: ${-(W + 260) / 2}px; width: ${W + 260}px; height: 12px; top: ${H / 2 + 38}px; transform: translateZ(55px); background: linear-gradient(#5a463b, #2a221f); }
  .beam { position: absolute; height: 10px; top: ${H / 2 + 54}px; background: linear-gradient(#6a5244, #2a221f); }
  .lampf { position: absolute; width: 46px; height: 16px; top: ${H / 2 + 26}px; transform: translateZ(40px); background: linear-gradient(#4a3c35, #1e1917); border-radius: 3px; }
  .pole { position: absolute; left: -48px; width: 96px; top: ${H / 2 + 48}px; height: 1400px; transform: translateZ(${-D / 2}px) rotateY(23deg);
    background: linear-gradient(90deg, #120f0e 0%, #3b302b 18%, #7a6052 38%, #3a2e29 62%, #151110 100%); }
</style></head><body><div class="sun"></div><div class="stage">
  <div class="rig"><div class="pole"></div></div>
  <div class="rig">${slices}<div class="front"><img src="antara-billboard-face-off.png" alt=""><img class="lit" src="antara-billboard-face.png" alt=""></div></div>
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
await p.goto('file://' + OUT + 'face.html'); await p.waitForSelector('body[data-ready]'); await p.waitForTimeout(500);
await p.locator('.face').screenshot({ path: `${OUT}antara-billboard-face.png` });
await p.pdf({ path: `${OUT}antara-billboard-face.pdf`, width: `${FW}px`, height: `${FH}px`, printBackground: true });
await p.evaluate(() => document.querySelector('.face').classList.add('off'));
await p.locator('.face').screenshot({ path: `${OUT}antara-billboard-face-off.png` });

// blinking loop: 5 s at 25 fps, frames captured by stepping the animation clock
const FPS = 25, N = 5 * FPS, TMP = process.env.FRAMES || '/tmp/antara-bb-frames';
mkdirSync(`${TMP}/m`, { recursive: true }); mkdirSync(`${TMP}/f`, { recursive: true });
const seek = (page, t) => page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), t);
const q = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
await q.goto('file://' + OUT + 'scene.html'); await q.waitForTimeout(1200);
// the blink, as keyframe stops [percent, opacity]; set directly on the 3D scene (stepping the clock does not reach 3D layers)
const STOPS = [[0, 0], [12, 0], [13, 1], [14.5, .15], [16, .9], [17, .1], [19, 1], [84, 1], [85, .2], [86, 1], [88, 0], [100, 0]];
const blinkAt = pct => { for (let k = 1; k < STOPS.length; k++) { const [p0, o0] = STOPS[k - 1], [p1, o1] = STOPS[k]; if (pct <= p1) return o0 + (o1 - o0) * (pct - p0) / (p1 - p0 || 1); } return 0; };
await q.evaluate(() => { document.querySelector('.front .lit').style.animation = 'none'; });
for (let i = 0; i < N; i++) {
  await q.evaluate(o => { document.querySelector('.front .lit').style.opacity = o; }, blinkAt((i / N) * 100));
  await q.waitForTimeout(30);
  await q.screenshot({ path: `${TMP}/m/${String(i).padStart(3, '0')}.png` });
}
await q.setViewportSize({ width: 1600, height: 1200 });
const q2 = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
await q2.goto('file://' + OUT + 'scene.html'); await q2.waitForTimeout(1200); await q2.evaluate(() => { const l = document.querySelector('.front .lit'); l.style.animation = 'none'; l.style.opacity = 1; });
await q2.screenshot({ path: `${OUT}antara-billboard-mockup.jpg`, type: 'jpeg', quality: 90 });
// flat face loop for a digital billboard
const f = await b.newPage({ viewport: { width: FW, height: FH }, deviceScaleFactor: 1 });
writeFileSync(`${OUT}face-blink.html`, `<style>html,body{margin:0;background:#1A1614}img{position:absolute;inset:0;width:${FW}px;height:${FH}px}.lit{animation:blink 5s infinite both}@keyframes blink{0%,12%{opacity:0}13%{opacity:1}14.5%{opacity:.15}16%{opacity:.9}17%{opacity:.1}19%,84%{opacity:1}85%{opacity:.2}86%{opacity:1}88%,100%{opacity:0}}</style><img src="antara-billboard-face-off.png"><img class="lit" src="antara-billboard-face.png">`);
await f.goto('file://' + OUT + 'face-blink.html');
await f.waitForTimeout(800);
for (let i = 0; i < N; i++) { await seek(f, i * 1000 / FPS); await f.screenshot({ path: `${TMP}/f/${String(i).padStart(3, '0')}.png` }); }
await b.close();
const ff = a => execSync(`ffmpeg -loglevel error -y ${a}`);
ff(`-framerate ${FPS} -i ${TMP}/m/%03d.png -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart ${OUT}antara-billboard-blink.mp4`);
ff(`-framerate ${FPS} -i ${TMP}/m/%03d.png -vf "scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" ${OUT}antara-billboard-blink.gif`);
ff(`-framerate ${FPS} -i ${TMP}/f/%03d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart ${OUT}antara-billboard-face-blink.mp4`);
console.log('done');
