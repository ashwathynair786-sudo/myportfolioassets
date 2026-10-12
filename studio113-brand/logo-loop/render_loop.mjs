// Renders loop.html frame by frame, then encodes MP4 + WebM + poster with ffmpeg.
// Usage: NODE_PATH=$(npm root -g) node render_loop.mjs
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const dir = path.dirname(fileURLToPath(import.meta.url));
const frames = path.join(dir, 'frames');
fs.rmSync(frames, { recursive: true, force: true });
fs.mkdirSync(frames);
const FPS = 30, D = 4.5;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
await page.goto('file://' + path.join(dir, 'loop.html'));
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
for (let i = 0; i < FPS * D; i++) {
  await page.evaluate(t => window.render(t), i / FPS);
  await page.screenshot({ path: path.join(frames, String(i).padStart(4, '0') + '.png') });
}
await browser.close();
const out = path.join(dir, '..', 'portfolio');
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%04d.png'), ...a]);
ff('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', path.join(out, 'studio113-logo-loop.mp4'));
ff('-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-pix_fmt', 'yuv420p', path.join(out, 'studio113-logo-loop.webm'));
execFileSync('convert', [path.join(frames, '0090.png'), '-quality', '88', path.join(out, 'studio113-logo-loop-poster.jpg')]);
fs.rmSync(frames, { recursive: true, force: true });
console.log('done');
