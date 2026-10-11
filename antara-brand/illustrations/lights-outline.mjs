// Outline-only drawings of Antara's twelve light forms (200 x 260 units, cord from y=0).
// Shared by gen_outlines.mjs and the packaging generator.
// ---------- outline helpers (stroke only, no fills, no opacity) ----------
const L = (d, w = 1.5) => `<path d="${d}" stroke-width="${w}"/>`;
const thin = d => L(d, 0.9);
const SHADE = d => L(d);
const CORD = (y1, y2) => L(`M100 ${y1} V${y2}`, 1.2);
const rect = (x1, y1, x2, y2) => `M${x1} ${y1} H${x2} V${y2} H${x1}Z`;
const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy} A${rx} ${ry} 0 0 1 ${cx - rx} ${cy}Z`;
const hw = (rx, ry, cy, y) => rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2));
const ribsE = (cx, cy, rx, ry, ys) => ys.map(y => { const w = hw(rx, ry, cy, y); return thin(`M${(cx - w).toFixed(1)} ${y} H${(cx + w).toFixed(1)}`); }).join('');
const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-6; v += s) o.push(+v.toFixed(1)); return o; };
const mesh = (x1, y1, x2, y2, s = 7) => {
  let d = '';
  for (let y = y1 + s / 2 + 1; y < y2 - 1; y += s) for (let x = x1 + s / 2 + 1; x < x2 - 1; x += s)
    d += `M${(x - 2.2).toFixed(1)} ${y.toFixed(1)}l2.2 -2.2 2.2 2.2 -2.2 2.2z`;
  return L(d, 0.8);
};
const strands = (tl, tr, bl, br, y1, y2, n, ragged = 0) => {
  let d = '';
  for (let i = 1; i < n; i++) {
    const t = i / n;
    d += `M${(tl + (tr - tl) * t).toFixed(1)} ${y1} L${(bl + (br - bl) * t).toFixed(1)} ${y2 - (ragged ? (i % 3) * ragged : 0)}`;
  }
  return thin(d);
};
const blob = (cx, cy, r0, amp, k, ph = 0) => {
  let d = '';
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2, r = r0 + amp * Math.sin(k * a + ph);
    d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
};
// Fringe tiers overlap, so each tier's lines stop where the tier in front of it starts (no fills to hide them).
const fringeTier = (x1, y1, x2, y2, front) => {
  const n = Math.round((x2 - x1) / 5), cov = x => front && x > front[0] && x < front[1];
  let s = '';
  for (let i = 1; i < n; i++) {
    const x = +(x1 + (x2 - x1) * i / n).toFixed(1), top = cov(x) ? front[2] : y1 + 3;
    s += `M${x} ${top} L${x} ${y2 - (i % 3) * 2.5}`;
  }
  const top = front ? `M${x1} ${y1} H${front[0]} M${front[1]} ${y1} H${x2}` : `M${x1} ${y1} H${x2}`;
  return L(`M${x1} ${y1} V${y2} M${x2} ${y1} V${y2}`) + thin(s) + L(top, 2.5);
};

export const LIGHTS = {
  lantern: ['Paper lantern', (() => {
    const body = 'M72 44 Q72 30 86 30 H114 Q128 30 128 44 V150 H72Z', dome = 'M50 212 A50 54 0 0 1 150 212Z';
    return CORD(0, 24) + L(rect(92, 24, 108, 30)) + SHADE(body) + range(42, 144, 9).map(y => thin(`M72 ${y} H128`)).join('') +
      SHADE(dome) + ribsE(100, 212, 50, 54, range(168, 206, 9)) + L(rect(70, 150, 130, 158));
  })()],
  silkbell: ['Silk bell', (() => {
    const d = 'M92 44 H108 C112 92 160 116 168 186 H32 C40 116 88 92 92 44Z';
    return CORD(0, 38) + L(rect(93, 38, 107, 44)) + SHADE(d) +
      [-2, -1, 1, 2].map(k => thin(`M${100 + k * 3} 46 C${100 + k * 10} 100 ${100 + k * 28} 130 ${100 + k * 33} 186`)).join('') + L('M32 186 H168', 2);
  })()],
  orb: ['Ribbed orb', (() => {
    let ribs = '';
    [1, 2, 3].forEach(k => { const rx = (74 * k / 4).toFixed(1); ribs += thin(`M100 76 A${rx} 46 0 0 0 100 168`) + thin(`M100 76 A${rx} 46 0 0 1 100 168`); });
    return CORD(0, 70) + L(rect(92, 70, 108, 76)) + SHADE(ell(100, 122, 74, 46)) + ribs;
  })()],
  pebble: ['Pebble', CORD(0, 30) + SHADE('M100 30 C150 34 170 110 152 170 C140 214 72 224 54 182 C34 134 50 36 100 30Z') +
    thin('M98 31 C70 92 72 158 100 208.7') + thin('M102 31 C128 80 140 140 130 199.3')],
  cloud: ['Cloud', CORD(0, 82) + SHADE(blob(100, 140, 58, 9, 8)) + thin(blob(100, 140, 30, 5, 8, Math.PI / 8))],
  column: ['Column', CORD(0, 14) + SHADE(rect(90, 14, 110, 30)) + SHADE(ell(100, 52, 26, 22)) + ribsE(100, 52, 26, 22, [42, 52, 62]) +
    SHADE(rect(92, 74, 108, 80)) + SHADE('M92 80 H108 L126 112 L108 144 H92 L74 112Z') + thin('M74 112 H126') +
    SHADE(ell(100, 170, 30, 26)) + ribsE(100, 170, 30, 26, [157, 170, 183]) + SHADE(rect(92, 196, 108, 204)) + SHADE('M86 204 H114 L100 248Z')],
  fringe: ['Fringe pendant', CORD(0, 36) + fringeTier(48, 118, 152, 190, [60, 140, 150]) + fringeTier(60, 78, 140, 150, [74, 126, 110]) + fringeTier(74, 36, 126, 110)],
  linea: ['Linea', L('M50 0 L56 104', 1) + L('M150 0 L144 104', 1) + SHADE('M10 120 Q100 86 190 120 Q100 172 10 120Z') + thin('M18 121 Q100 112 182 121')],
  hourglass: ['Woven hourglass', CORD(0, 36) + SHADE('M62 128 H138 L164 196 H36Z') + strands(62, 138, 36, 164, 131, 196, 20, 2) +
    SHADE('M86 36 H114 L138 128 H62Z') + strands(86, 114, 62, 138, 38, 126, 12) + L('M62 128 H138', 2)],
  canedrum: ['Cane drum', CORD(0, 48) + SHADE(rect(40, 86, 160, 150)) + mesh(40, 86, 160, 150) + SHADE(rect(66, 48, 134, 86)) + mesh(66, 48, 134, 86) +
    L('M66 48 H134', 3) + L('M40 86 H160', 3) + L('M40 150 H160', 3)],
  canecone: ['Cane + cone', CORD(0, 60) + SHADE('M80 100 H120 L174 158 H26Z') + SHADE(rect(80, 60, 120, 100)) + mesh(80, 60, 120, 100) +
    L('M80 60 H120', 3) + L('M80 100 H120', 2) + L('M26 158 H174', 3)],
  sconce: ['Wall sconce', SHADE('M72 52 H128 L115.2 96 H84.8Z') + SHADE('M86 146 H114 L132 206 H68Z') + SHADE(rect(64, 96, 136, 146)) + mesh(64, 96, 136, 146) +
    L('M72 52 H128', 2.5) + L('M64 96 H136', 3) + L('M64 146 H136', 3) + L('M68 206 H132', 2.5)],
};
export const ORDER = ['lantern', 'silkbell', 'orb', 'pebble', 'cloud', 'column', 'fringe', 'linea', 'hourglass', 'canedrum', 'canecone', 'sconce'];
