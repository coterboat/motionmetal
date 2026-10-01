// Build-time illustrations for every photo slot: isometric technical drawings
// in the site's palette. They stand in until real photos exist, and each one
// is listed as a placeholder in the build report.
import { capabilities, parts } from './data.mjs';

// ---- math -------------------------------------------------------------------

const C30 = Math.cos(Math.PI / 6);
const iso = ([x, y, z]) => [(x - y) * C30, (x + y) * 0.5 - z];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
const VIEW = nrm([1, 1, 1]); // faces whose normal points this way are visible
const LIGHT = nrm([0.35, -0.25, 1]);
const depth = (pts) => pts.reduce((s, p) => s + p[0] + p[1] + p[2], 0) / pts.length;

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mat = (dark, light) => ({ dark: rgb(dark), light: rgb(light) });
const mix = (m, s) => hex(m.dark.map((d, i) => d + (m.light[i] - d) * s));
const shadeOf = (n) => 0.18 + 0.82 * Math.max(0, (dot(nrm(n), LIGHT) + 0.6) / 1.6);
const f1 = (n) => Math.round(n * 10) / 10;
const xml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- materials ----------------------------------------------------------------

export const M = {
  steel: mat('#15181b', '#8d969f'),
  dark: mat('#0e1012', '#566069'),
  sheet: mat('#1a1d20', '#aab2ba'),
  orange: mat('#4a1800', '#ff8b3d'),
  yellow: mat('#4d3600', '#ffc93d'),
  black: mat('#0b0d0f', '#68707a'),
  blue: mat('#0b1633', '#5a82e0'),
  green: mat('#0c1f15', '#56a274'),
  grey: mat('#24282c', '#c9ced3'),
  rubber: mat('#050606', '#2a2e32'),
  water: mat('#08151c', '#2c6a86'),
  concrete: mat('#1b1e21', '#6f777f'),
};
const EDGE = 'rgba(236,234,229,0.30)';
const HOLE = '#0b0c0e';
const HOT = '#ff6a13';
const INK = '#959ca3';

// ---- scene ------------------------------------------------------------------------

class Scene {
  constructor() {
    this.ops = [];
    this.off = [0, 0, 0];
    this.k = 1;
  }
  w(p) { return add(this.off, mul(p, this.k)); }
  P(p) { return iso(this.w(p)); }
  at(off, k, fn) {
    const [o, kk] = [this.off, this.k];
    this.off = this.w(off);
    this.k = kk * k;
    fn();
    this.off = o;
    this.k = kk;
    return this;
  }
  poly(pts, fill, o = {}) {
    this.ops.push({ k: 'poly', p: pts.map((p) => this.P(p)), fill, stroke: o.stroke === 'self' ? fill : o.stroke ?? EDGE, sw: o.sw ?? 1, op: o.op ?? 1, nofit: o.nofit });
  }
  face(pts, m, n, o = {}) {
    if (dot(n, VIEW) <= 1e-6) return;
    this.poly(pts, mix(m, shadeOf(n) * (o.dim ?? 1)), o);
  }
  line(pts, stroke, sw = 1.5, o = {}) {
    this.ops.push({ k: 'line', p: pts.map((p) => this.P(p)), stroke, sw, dash: o.dash, op: o.op ?? 1, glow: o.glow, nofit: o.nofit ?? true });
  }
  tube(pts, r, m, o = {}) {
    this.ops.push({ k: 'tube', p: pts.map((p) => this.P(p)), r: r * this.k, m, op: o.op ?? 1 });
  }
  glow(p, r, color = HOT) { this.ops.push({ k: 'glow', p: [this.P(p)], r, color, nofit: true }); }
  sparks(p, n, seed, palette) { this.ops.push({ k: 'sparks', p: [this.P(p)], n, seed, palette, nofit: true }); }
  dots(pts, r, fill, op = 1) { this.ops.push({ k: 'dots', p: pts.map((p) => this.P(p)), r, fill, op, nofit: true }); }
  callout(p, text, dx, dy) { this.ops.push({ k: 'callout', p: [this.P(p)], text, dx, dy, nofit: true }); }

  floor(x0, y0, x1, y1, step = 20) {
    for (let x = x0; x <= x1; x += step) this.line([[x, y0, 0], [x, y1, 0]], '#1f2428', 1);
    for (let y = y0; y <= y1; y += step) this.line([[x0, y, 0], [x1, y, 0]], '#1f2428', 1);
  }

  box([x, y, z], [w, d, h], m, o = {}) {
    const X = x + w, Y = y + d, Z = z + h;
    this.face([[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], m, [1, 0, 0], o);
    this.face([[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]], m, [0, 1, 0], o);
    this.face([[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], m, [0, 0, 1], o);
  }

  // Extrude a 2D profile. plane: 'xz' extrudes along y, 'xy' along z, 'yz' along x.
  extrude(profile, { plane = 'xz', o = [0, 0, 0], t = 4 }, m, holes = []) {
    const map = {
      xz: (u, v, w) => [o[0] + u, o[1] + w, o[2] + v],
      xy: (u, v, w) => [o[0] + u, o[1] + v, o[2] + w],
      yz: (u, v, w) => [o[0] + w, o[1] + u, o[2] + v],
    }[plane];
    const dir = { xz: (u, v, w) => [u, w, v], xy: (u, v, w) => [u, v, w], yz: (u, v, w) => [w, u, v] }[plane];
    let area = 0;
    profile.forEach((a, i) => {
      const b = profile[(i + 1) % profile.length];
      area += a[0] * b[1] - b[0] * a[1];
    });
    const s = area > 0 ? 1 : -1;
    const sides = [];
    profile.forEach((a, i) => {
      const b = profile[(i + 1) % profile.length];
      const n = dir(s * (b[1] - a[1]), -s * (b[0] - a[0]), 0);
      if (dot(n, VIEW) <= 1e-6) return;
      const pts = [map(a[0], a[1], 0), map(b[0], b[1], 0), map(b[0], b[1], t), map(a[0], a[1], t)];
      sides.push({ pts, n, d: depth(pts) });
    });
    sides.sort((p, q) => p.d - q.d).forEach((sd) => this.face(sd.pts, m, sd.n));
    const capN = dir(0, 0, 1);
    const front = dot(capN, VIEW) > 0;
    const w = front ? t : 0;
    const n = front ? capN : mul(capN, -1);
    this.face(profile.map(([u, v]) => map(u, v, w)), m, n);
    holes.forEach(([u, v, r]) => this.hole(map(u, v, w), r, n));
    return this;
  }

  hole(c, r, n, fill = HOLE) {
    if (dot(n, VIEW) <= 1e-6) return;
    const a = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u = nrm(cross(n, a));
    const v = cross(n, u);
    const pts = [];
    for (let i = 0; i < 28; i++) {
      const t = (i / 28) * Math.PI * 2;
      pts.push(add(c, add(mul(u, Math.cos(t) * r), mul(v, Math.sin(t) * r))));
    }
    this.poly(pts, fill, { stroke: 'rgba(0,0,0,0.4)' });
  }

  cyl(c, r, h, axis, m, o = {}) {
    const A = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[axis];
    const [U, V] = { x: [[0, 1, 0], [0, 0, 1]], y: [[1, 0, 0], [0, 0, 1]], z: [[1, 0, 0], [0, 1, 0]] }[axis];
    const N = o.seg ?? 40;
    const ring = (i, hh) => {
      const t = (i / N) * Math.PI * 2;
      return add(add(c, mul(A, hh)), add(mul(U, Math.cos(t) * r), mul(V, Math.sin(t) * r)));
    };
    const sides = [];
    for (let i = 0; i < N; i++) {
      const t = ((i + 0.5) / N) * Math.PI * 2;
      const n = add(mul(U, Math.cos(t)), mul(V, Math.sin(t)));
      if (dot(n, VIEW) <= 0) continue;
      const pts = [ring(i, 0), ring(i + 1, 0), ring(i + 1, h), ring(i, h)];
      sides.push({ pts, n, d: depth(pts) });
    }
    sides.sort((p, q) => p.d - q.d).forEach((sd) => this.face(sd.pts, m, sd.n, { stroke: 'self', sw: 0.8 }));
    const cap = [];
    for (let i = 0; i < N; i++) cap.push(ring(i, h));
    this.face(cap, m, A);
    if (o.hole) this.hole(add(c, mul(A, h)), o.hole, A);
    return this;
  }

  // Round off the corners of a polyline so tubes look bent, not mitred.
  static fillet(pts, rad, steps = 10) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i];
      const a = sub(pts[i - 1], p), b = sub(pts[i + 1], p);
      const r = Math.min(rad, Math.hypot(...a) / 2, Math.hypot(...b) / 2);
      const s = add(p, mul(nrm(a), r)), e = add(p, mul(nrm(b), r));
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        out.push(add(add(mul(s, (1 - t) * (1 - t)), mul(p, 2 * (1 - t) * t)), mul(e, t * t)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  render(W, H, fig) {
    const pts = this.ops.filter((o) => !o.nofit).flatMap((o) => o.p);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const pad = Math.min(W, H) * 0.13;
    const s = Math.min((W - pad * 2) / (x1 - x0 || 1), (H - pad * 2 - 24) / (y1 - y0 || 1));
    const tx = (W - (x1 - x0) * s) / 2 - x0 * s;
    const ty = (H - (y1 - y0) * s) / 2 - y0 * s + 12;
    const T = ([x, y]) => [f1(x * s + tx), f1(y * s + ty)];
    const d = (p, close) => 'M' + p.map((q) => T(q).join(' ')).join('L') + (close ? 'Z' : '');

    const body = this.ops.map((o) => {
      switch (o.k) {
        case 'poly':
          return `<path d="${d(o.p, true)}" fill="${o.fill}" stroke="${o.stroke}" stroke-width="${o.sw}" stroke-linejoin="round"${o.op < 1 ? ` opacity="${o.op}"` : ''}/>`;
        case 'line': {
          const base = `d="${d(o.p)}" fill="none" stroke="${o.stroke}" stroke-linecap="round" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}`;
          return (o.glow ? `<path ${base} stroke-width="${o.sw * 4}" opacity=".55" filter="url(#blur)"/>` : '') + `<path ${base} stroke-width="${o.sw}"${o.op < 1 ? ` opacity="${o.op}"` : ''}/>`;
        }
        case 'tube': {
          const w = Math.max(2, o.r * 2 * s);
          return [
            `<path d="${d(o.p)}" fill="none" stroke="${mix(o.m, 0.05)}" stroke-width="${f1(w + 2)}" stroke-linecap="round" stroke-linejoin="round"/>`,
            `<path d="${d(o.p)}" fill="none" stroke="${mix(o.m, 0.55)}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`,
            `<path d="${d(o.p)}" fill="none" stroke="${mix(o.m, 1)}" stroke-width="${f1(Math.max(1, w * 0.28))}" stroke-linecap="round" stroke-linejoin="round" opacity=".6" transform="translate(${f1(-w * 0.12)} ${f1(-w * 0.18)})"/>`,
          ].join('');
        }
        case 'glow': {
          const [x, y] = T(o.p[0]);
          return `<circle cx="${x}" cy="${y}" r="${o.r * 2.4}" fill="${o.color}" opacity=".35" filter="url(#blur)"/><circle cx="${x}" cy="${y}" r="${o.r}" fill="${o.color}" filter="url(#blur)"/><circle cx="${x}" cy="${y}" r="${f1(o.r * 0.35)}" fill="#fff4e6"/>`;
        }
        case 'sparks': {
          const r = rng(o.seed);
          const [x, y] = T(o.p[0]);
          const pal = o.palette ?? [HOT, '#ffb066', '#ffe0b8'];
          let out = '';
          for (let i = 0; i < o.n; i++) {
            const a = Math.PI / 2 + (r() - 0.5) * Math.PI * 1.7;
            const len = 6 + r() * r() * 46;
            const st = 2 + r() * 6;
            out += `<path d="M${f1(x + Math.cos(a) * st)} ${f1(y + Math.sin(a) * st)}L${f1(x + Math.cos(a) * (st + len))} ${f1(y + Math.sin(a) * (st + len))}" stroke="${pal[i % pal.length]}" stroke-width="${f1(0.8 + r() * 1.2)}" stroke-linecap="round" opacity="${f1(0.45 + r() * 0.55)}"/>`;
          }
          return out;
        }
        case 'dots':
          return o.p.map((p) => { const [x, y] = T(p); return `<circle cx="${x}" cy="${y}" r="${o.r}" fill="${o.fill}" opacity="${o.op}"/>`; }).join('');
        case 'callout': {
          const [ax, ay] = T(o.p[0]);
          const bx = f1(ax + o.dx), by = f1(ay + o.dy);
          const right = o.dx >= 0;
          const tw = o.text.length * 7.6;
          let ex = right ? bx + 18 : bx - 18;
          let txt = right ? ex + 6 : ex - 6;
          if (right && txt + tw > W - 14) txt = W - 14 - tw;
          if (!right && txt - tw < 14) txt = 14 + tw;
          return `<path d="M${ax} ${ay}L${bx} ${by}L${ex} ${by}" fill="none" stroke="${INK}" stroke-width="1"/><circle cx="${ax}" cy="${ay}" r="2.5" fill="${HOT}"/><text x="${f1(txt)}" y="${f1(by + 4)}" text-anchor="${right ? 'start' : 'end'}" fill="#c2c6ca" font-size="12" letter-spacing=".08em">${xml(o.text)}</text>`;
        }
      }
      return '';
    });

    const m = 14, L = 16;
    const corners = [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]
      .map(([x, y, sx, sy]) => `M${x + sx * L} ${y}L${x} ${y}L${x} ${y + sy * L}`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace">
<defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#1c2024"/></pattern><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
<rect width="${W}" height="${H}" fill="#16191c"/><rect width="${W}" height="${H}" fill="url(#g)"/>
<path d="${corners}" fill="none" stroke="#3a4046" stroke-width="1.5"/>
<text x="28" y="40" fill="${INK}" font-size="12" letter-spacing=".12em">${xml(fig)}</text>
${body.join('\n')}
</svg>
`;
  }
}

// ---- parts -----------------------------------------------------------------------

const bracket = (sc, m = M.steel) => {
  sc.extrude([[0, 0], [100, 0], [100, 6], [6, 6], [6, 70], [0, 70]], { plane: 'xz', t: 60 }, m);
  sc.hole([55, 30, 6], 7, [0, 0, 1]);
  sc.hole([84, 30, 6], 7, [0, 0, 1]);
  sc.hole([6, 30, 46], 7, [1, 0, 0]);
  sc.callout([100, 60, 3], '90° BEND', 40, 40);
};

const gussetPlate = (sc, m = M.steel) => {
  sc.extrude([[0, 0], [150, 0], [150, 110], [0, 110]], { plane: 'xy', o: [-30, -60, 0], t: 6 }, m, [[18, 18, 6], [132, 18, 6], [18, 92, 6], [132, 92, 6]]);
  sc.extrude([[0, 0], [90, 0], [90, 10], [10, 90], [0, 90]], { plane: 'xz', o: [0, -4, 6], t: 8 }, m, [[28, 28, 9]]);
  sc.callout([90, 4, 10], 'GUSSET', 50, 30);
};

const guard = (sc, m = M.steel) => {
  sc.box([0, -24, 87], [140, 24, 3], m);
  sc.box([137, -24, 0], [3, 24, 90], m);
  const holes = [];
  for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) holes.push([16 + i * 13.5, 16 + j * 14.5, 4]);
  sc.extrude([[0, 0], [140, 0], [140, 90], [0, 90]], { plane: 'xz', t: 3 }, m, holes);
  sc.callout([20, 3, 80], 'PERFORATED', -50, -40);
};

const enclosurePanel = (sc, m = M.steel) => {
  sc.box([147, 0, -18], [3, 100, 21], m);
  sc.box([0, 97, -18], [150, 3, 21], m);
  sc.extrude([[0, 0], [150, 0], [150, 100], [0, 100]], { plane: 'xy', t: 3 }, m, [[10, 10, 3.5], [140, 10, 3.5], [10, 90, 3.5], [140, 90, 3.5]]);
  for (let i = 0; i < 6; i++) {
    sc.line([[40, 22 + i * 11, 3], [110, 22 + i * 11, 3]], HOLE, 3, { nofit: true });
  }
  sc.callout([110, 77, 3], 'LOUVERS', 50, 40);
};

const basePlate = (sc, m = M.steel) => {
  sc.box([0, 0, 0], [160, 110, 24], m);
  [[18, 18], [142, 18], [18, 92], [142, 92]].forEach(([x, y]) => {
    sc.hole([x, y, 24], 11, [0, 0, 1], '#2a2f34');
    sc.hole([x, y, 24], 6, [0, 0, 1]);
  });
  sc.hole([80, 55, 24], 20, [0, 0, 1]);
  sc.callout([160, 110, 12], 'THICK PLATE', 30, 30);
};

const flange = (sc, m = M.steel) => {
  sc.cyl([0, 0, 0], 62, 12, 'z', m);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sc.hole([Math.cos(a) * 46, Math.sin(a) * 46, 12], 6, [0, 0, 1]);
  }
  sc.cyl([0, 0, 12], 32, 12, 'z', m, { hole: 20 });
  sc.callout([46, 0, 12], 'BOLT CIRCLE', 60, -40);
};

const gasket = (sc) => {
  sc.cyl([0, 0, 0], 62, 3, 'z', M.rubber, { hole: 34 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sc.hole([Math.cos(a) * 48, Math.sin(a) * 48, 3], 5, [0, 0, 1], '#16191c');
  }
  sc.at([70, 80, 0], 1, () => {
    sc.box([0, 0, 0], [110, 70, 3], M.rubber);
    sc.hole([55, 35, 3], 22, [0, 0, 1], '#16191c');
  });
  sc.callout([0, 62, 3], 'NON-METAL', -40, 40);
};

const wearPlate = (sc, m = M.steel) => {
  sc.box([0, 0, 0], [170, 90, 12], m);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    sc.hole([30 + i * 55, 25 + j * 40, 12], 9, [0, 0, 1], '#2a2f34');
    sc.hole([30 + i * 55, 25 + j * 40, 12], 4.5, [0, 0, 1]);
  }
  sc.callout([170, 90, 6], 'COUNTERSUNK', 30, 30);
};

const channel = (sc, m = M.steel) => {
  sc.extrude([[0, 0], [60, 0], [60, 40], [54, 40], [54, 6], [6, 6], [6, 40], [0, 40]], { plane: 'yz', t: 170 }, m);
  sc.hole([40, 30, 6], 6, [0, 0, 1]);
  sc.hole([130, 30, 6], 6, [0, 0, 1]);
  sc.extrude([[0, 0], [40, 0], [40, 5], [5, 5], [5, 40], [0, 40]], { plane: 'yz', o: [20, 90, 0], t: 150 }, m);
  sc.callout([170, 60, 20], 'CHANNEL', 40, 20);
};

const enclosure = (sc, m = M.steel) => {
  sc.box([-4, -4, -10], [98, 78, 10], M.dark);
  sc.box([0, 0, 0], [90, 70, 120], m);
  sc.line([[8, 70, 8], [82, 70, 8], [82, 70, 112], [8, 70, 112], [8, 70, 8]], 'rgba(0,0,0,0.55)', 1.5, { nofit: true });
  sc.box([70, 70, 52], [5, 4, 18], M.dark);
  for (let i = 0; i < 5; i++) sc.line([[90, 15, 80 + i * 7], [90, 55, 80 + i * 7]], 'rgba(0,0,0,0.55)', 2.5);
  sc.hole([30, 35, 120], 6, [0, 0, 1]);
  sc.hole([60, 35, 120], 6, [0, 0, 1]);
  sc.callout([82, 70, 112], 'ENCLOSURE', 40, -30);
};

const cover = (sc, m = M.steel) => {
  sc.extrude([[0, 0], [6, 0], [6, 34], [134, 34], [134, 0], [140, 0], [140, 40], [0, 40]], { plane: 'xz', t: 90 }, m);
  sc.extrude([[0, 0], [100, 0], [100, 80], [0, 80]], { plane: 'xz', o: [20, 120, 0], t: 4 }, m);
  sc.box([100, 124, 30], [6, 5, 20], M.dark);
  sc.cyl([20, 124, 8], 3, 16, 'z', M.dark);
  sc.cyl([20, 124, 56], 3, 16, 'z', M.dark);
  sc.callout([120, 124, 70], 'DOOR', 40, -30);
};

const frame = (sc, m = M.steel, beads = false) => {
  const r = 6, z = 50;
  sc.tube([[0, 0, z], [180, 0, z]], r, m);
  sc.tube([[0, 0, 0], [0, 0, z]], r, m);
  sc.tube([[0, 0, z], [0, 110, z]], r, m);
  sc.tube([[180, 0, 0], [180, 0, z]], r, m);
  sc.tube([[90, 0, z], [90, 110, z]], r, m);
  sc.tube([[0, 110, 0], [0, 110, z]], r, m);
  sc.tube([[0, 110, z], [180, 110, z]], r, m);
  sc.tube([[180, 0, z], [180, 110, z]], r, m);
  sc.tube([[180, 110, 0], [180, 110, z]], r, m);
  if (beads) sc.dots([[90, 110, z], [180, 110, z], [0, 110, z], [180, 0, z]], 3, '#d9a873');
  sc.callout([180, 110, 25], beads ? 'WELDED' : 'TUBE FRAME', 40, 30);
};

const handrail = (sc, m = M.steel) => {
  const r = 5;
  sc.box([-10, -10, 0], [20, 20, 3], M.dark);
  sc.box([70, -10, 0], [20, 20, 3], M.dark);
  sc.box([150, -10, 0], [20, 20, 3], M.dark);
  sc.tube(Scene.fillet([[0, 0, 3], [0, 0, 110], [160, 0, 110], [160, 0, 3]], 22), r, m);
  sc.tube([[80, 0, 3], [80, 0, 110]], r, m);
  sc.tube([[0, 0, 55], [160, 0, 55]], r * 0.8, m);
  sc.callout([0, 0, 90], 'BENT RAIL', -40, -30);
};

const handle = (sc, m = M.steel) => {
  [[0, 0], [0, 70]].forEach(([x, y], i) => {
    const w = i ? 70 : 100;
    sc.box([x - 8, y - 8, 0], [16, 16, 6], M.dark);
    sc.box([x + w - 8, y - 8, 0], [16, 16, 6], M.dark);
    sc.tube(Scene.fillet([[x, y, 6], [x, y, 46], [x + w, y, 46], [x + w, y, 6]], 16), 5, m);
  });
  sc.callout([50, 70, 46], 'CNC BENT', 40, -40);
};

const rollBar = (sc, m = M.steel) => {
  sc.box([-10, -10, 0], [20, 20, 4], M.dark);
  sc.box([-10, 110, 0], [20, 20, 4], M.dark);
  sc.tube([[-90, 20, 4], [0, 20, 100]], 5, m);
  sc.tube(Scene.fillet([[0, 0, 4], [0, 0, 130], [0, 120, 130], [0, 120, 4]], 40), 7, m);
  sc.tube([[0, 0, 70], [0, 120, 70]], 5, m);
  sc.callout([0, 120, 110], 'HOOP', 40, -20);
};

const weldment = (sc, m = M.steel) => {
  sc.box([0, 0, 0], [160, 14, 14], m);
  sc.box([0, 14, 0], [14, 82, 14], m);
  sc.box([146, 14, 0], [14, 82, 14], m);
  sc.box([0, 96, 0], [160, 14, 14], m);
  sc.box([0, 96, 14], [14, 14, 80], m);
  sc.box([146, 96, 14], [14, 14, 80], m);
  sc.box([0, 96, 94], [160, 14, 14], m);
  [[[14, 96, 14], [14, 110, 14]], [[146, 96, 14], [146, 110, 14]], [[14, 96, 94], [14, 110, 94]], [[146, 110, 94], [146, 110, 108]]].forEach((p) => sc.line(p, '#d9a873', 3));
  sc.callout([146, 110, 50], 'WELD BEAD', 40, 20);
};

const mount = (sc, m = M.steel) => {
  sc.extrude([[0, 0], [100, 0], [100, 6], [6, 6], [6, 70], [0, 70]], { plane: 'xz', t: 60 }, m);
  sc.extrude([[6, 6], [62, 6], [6, 62]], { plane: 'xz', o: [0, 27, 0], t: 6 }, m);
  sc.hole([84, 14, 6], 6, [0, 0, 1]);
  sc.hole([84, 46, 6], 6, [0, 0, 1]);
  sc.callout([40, 30, 25], 'GUSSETED', 50, 40);
};

const trailer = (sc, m = M.steel) => {
  sc.tube([[0, 0, 0], [210, 55, 0]], 7, m);
  sc.tube([[0, 0, 0], [0, 120, 0]], 7, m);
  sc.cyl([120, 92, -30], 6, 80, 'z', m);
  sc.tube([[0, 120, 0], [210, 65, 0]], 7, m);
  sc.box([205, 50, -6], [44, 20, 14], M.dark);
  sc.cyl([240, 60, 8], 10, 6, 'z', M.dark);
  sc.line([[200, 58, 0], [215, 75, -20], [230, 70, -5]], INK, 1.5, { dash: '3 3' });
  sc.callout([120, 92, 50], 'JACK MOUNT', 30, -30);
};

const subAssembly = (sc, m = M.blue) => {
  enclosure(sc, m);
  sc.ops.pop();
  sc.at([90, 15, 40], 0.5, () => bracket(sc, M.steel));
  sc.ops.pop();
  sc.callout([90, 35, 60], 'SUB-ASSEMBLY', 50, 30);
};

const kit = (sc) => {
  sc.box([0, 0, 0], [220, 140, 10], M.dark);
  sc.at([15, 15, 10], 0.5, () => bracket(sc));
  sc.ops.pop();
  sc.at([90, 10, 10], 0.45, () => sc.box([0, 0, 0], [150, 110, 6], M.steel));
  sc.at([100, 80, 10], 0.4, () => flange(sc));
  sc.ops.pop();
  for (let i = 0; i < 5; i++) sc.cyl([30 + i * 16, 110, 10], 4, 14, 'z', M.grey);
  sc.box([160, 80, 10], [40, 40, 2], M.grey);
  sc.callout([180, 100, 12], 'LABELED KIT', 30, 40);
};

const hardwarePanel = (sc, m = M.steel) => {
  sc.box([0, 0, 0], [160, 100, 3], m);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) sc.cyl([25 + i * 37, 25 + j * 50, 3], 3.5, 12, 'z', M.grey);
  sc.cyl([80, 50, 3], 7, 4, 'z', M.grey, { hole: 3.5, seg: 6 });
  sc.callout([136, 75, 15], 'PEM STUDS', 40, -30);
};

const finishedGoods = (sc) => {
  for (let i = 0; i < 3; i++) sc.box([0, i * 50, 0], [140, 16, 10], M.concrete);
  sc.box([0, 0, 10], [140, 116, 6], M.concrete);
  sc.at([20, 18, 16], 1, () => sc.box([0, 0, 0], [100, 80, 70], M.orange));
  sc.at([30, 28, 86], 1, () => sc.box([0, 0, 0], [80, 60, 40], M.orange));
  sc.line([[20, 98, 50], [120, 98, 50]], 'rgba(0,0,0,0.4)', 1.5);
  sc.callout([120, 98, 40], 'READY TO SHIP', 30, 30);
};

const fixtureBase = (sc, w = 220, d = 150) => {
  sc.box([0, 0, 0], [w, d, 14], M.dark);
  for (let i = 1; i < w / 25; i++) for (let j = 1; j < d / 25; j++) sc.hole([i * 25, j * 25, 14], 2.5, [0, 0, 1]);
};

const toggleClamp = (sc, [x, y, z]) => {
  sc.box([x, y, z], [24, 14, 16], M.steel);
  sc.tube([[x + 12, y + 7, z + 16], [x - 18, y + 7, z + 44]], 3.5, M.orange);
};

const weldFixture = (sc) => {
  fixtureBase(sc);
  sc.box([20, 20, 14], [20, 20, 30], M.steel);
  sc.box([180, 20, 14], [20, 20, 30], M.steel);
  sc.box([50, 40, 14], [120, 70, 6], M.sheet);
  sc.box([50, 40, 20], [8, 70, 50], M.sheet);
  toggleClamp(sc, [90, 112, 14]);
  toggleClamp(sc, [150, 112, 14]);
  sc.cyl([30, 130, 14], 4, 20, 'z', M.orange);
  sc.callout([150, 119, 30], 'TOGGLE CLAMP', 40, 40);
};

const checkFixture = (sc) => {
  fixtureBase(sc, 200, 140);
  [[30, 30], [170, 30], [30, 110], [170, 110]].forEach(([x, y]) => sc.box([x - 8, y - 8, 14], [16, 16, 20], M.steel));
  sc.box([22, 22, 34], [156, 96, 3], M.sheet);
  [[60, 60], [140, 60], [100, 90]].forEach(([x, y]) => {
    sc.cyl([x, y, 37], 4, 14, 'z', M.steel);
    sc.cyl([x, y, 51], 4.5, 5, 'z', M.orange);
  });
  sc.callout([140, 60, 56], 'GO / NO-GO PIN', 40, -40);
};

const assemblyJig = (sc) => {
  fixtureBase(sc, 200, 120);
  sc.box([20, 50, 14], [16, 20, 110], M.steel);
  sc.box([164, 50, 14], [16, 20, 110], M.steel);
  sc.box([20, 50, 124], [160, 20, 14], M.steel);
  sc.box([60, 30, 14], [80, 60, 50], M.sheet);
  toggleClamp(sc, [88, 92, 14]);
  sc.callout([180, 70, 100], 'JIG FRAME', 40, -20);
};

const shopTooling = (sc) => {
  sc.box([0, 0, 0], [220, 160, 10], M.dark);
  [0, 50, 100].forEach((y, i) => {
    const w = 30 + i * 6, v = 8 + i * 3;
    sc.extrude([[0, 0], [w, 0], [w, 24], [w / 2 + v, 24], [w / 2, 24 - v], [w / 2 - v, 24], [0, 24]], { plane: 'yz', o: [10, 10 + y, 10], t: 120 }, M.steel);
  });
  sc.extrude([[8, 50], [28, 50], [28, 36], [19, 0], [17, 0], [8, 36]], { plane: 'yz', o: [150, 20, 10], t: 60 }, M.steel);
  sc.callout([130, 120, 30], 'BRAKE DIES', 40, 30);
};

const outdoorEquip = (sc, m = M.green) => {
  [[0, 0], [120, 0], [0, 80], [120, 80]].forEach(([x, y]) => sc.tube([[x, y, 0], [x, y, 70]], 4, m));
  sc.box([-6, -6, 70], [132, 92, 60], m);
  sc.box([-8, -8, 130], [136, 96, 6], m);
  sc.box([50, 86, 100], [24, 3, 6], M.dark);
  sc.callout([126, 86, 100], 'OUTDOOR RATED', 30, 30);
};

// ---- machine scenes ---------------------------------------------------------------

const gantry = (sc, x, gz, nozzle) => {
  sc.box([x, -20, 64 + gz], [34, 14, 40], M.dark);
  sc.box([x, -20, 104 + gz], [34, 200, 26], M.steel);
  sc.box([x + 34, 70, 84 + gz], [18, 30, 60], M.steel);
  nozzle();
  sc.box([x, 166, 64 + gz], [34, 14, 40], M.dark);
};

const laserScene = (sc) => {
  sc.floor(-40, -40, 340, 220);
  sc.box([0, 0, 0], [300, 160, 50], M.dark);
  sc.box([0, -14, 50], [300, 12, 14], M.steel);
  sc.box([10, 10, 50], [280, 140, 2], M.sheet);
  const cut = (pts) => sc.line(pts, '#2a2f34', 1.6);
  cut([[30, 25, 52], [90, 25, 52], [90, 70, 52], [30, 70, 52], [30, 25, 52]]);
  cut([[105, 25, 52], [150, 25, 52], [150, 45, 52], [125, 45, 52], [125, 95, 52], [105, 95, 52], [105, 25, 52]]);
  cut([[30, 85, 52], [90, 85, 52], [30, 135, 52], [30, 85, 52]]);
  const ring = [];
  for (let i = 0; i <= 30; i++) { const a = (i / 30) * Math.PI * 2; ring.push([230 + Math.cos(a) * 32, 60 + Math.sin(a) * 32, 52]); }
  cut(ring);
  sc.line([[170, 100, 52], [233, 100, 52], [233, 85, 52]], HOT, 2, { glow: true });
  sc.box([0, 162, 50], [300, 12, 14], M.steel);
  gantry(sc, 190, 0, () => {
    sc.cyl([233, 85, 62], 5, 22, 'z', M.grey);
    sc.line([[233, 85, 62], [233, 85, 52]], HOT, 2.5, { glow: true });
  });
  sc.glow([233, 85, 52], 5);
  sc.sparks([233, 85, 52], 34, 'laser');
  sc.callout([242, 85, 120], '6 kW FIBER', 60, -50);
  sc.callout([40, 140, 52], 'NESTED SHEET', -40, 50);
};

const waterjetScene = (sc) => {
  sc.floor(-40, -40, 340, 220);
  sc.box([0, 0, 0], [300, 160, 60], M.dark);
  sc.poly([[8, 8, 56], [292, 8, 56], [292, 152, 56], [8, 152, 56]], mix(M.water, 0.6), { stroke: 'none' });
  for (let x = 20; x < 300; x += 20) sc.line([[x, 8, 58], [x, 152, 58]], '#3a4046', 2);
  sc.box([30, 30, 58], [170, 100, 16], M.steel);
  sc.box([0, -14, 60], [300, 12, 14], M.steel);
  sc.box([0, 162, 60], [300, 12, 14], M.steel);
  gantry(sc, 150, 10, () => {
    sc.cyl([193, 85, 80], 4, 14, 'z', M.grey);
    sc.line([[193, 85, 80], [193, 85, 74]], '#cfe9ff', 3, { glow: true });
  });
  sc.sparks([193, 85, 74], 26, 'water', ['#cfe9ff', '#7fbfe0', '#ffffff']);
  sc.callout([193, 85, 74], 'ABRASIVE JET', 70, 50);
  sc.callout([40, 130, 74], 'THICK PLATE', -40, 50);
};

const pressBrakeScene = (sc) => {
  sc.floor(-40, -80, 340, 200);
  const cFrame = [[0, 0], [90, 0], [90, 85], [12, 85], [12, 175], [90, 175], [90, 230], [0, 230]];
  sc.extrude(cFrame, { plane: 'yz', o: [0, 0, 0], t: 24 }, M.steel);
  sc.box([100, -50, 96], [10, 22, 14], M.orange);
  sc.box([180, -50, 96], [10, 22, 14], M.orange);
  sc.box([24, 20, 0], [252, 50, 90], M.steel);
  sc.extrude([[0, 0], [40, 0], [40, 24], [26, 24], [20, 14], [14, 24], [0, 24]], { plane: 'yz', o: [24, 25, 90], t: 252 }, M.grey);
  sc.extrude([[8, 60], [32, 60], [32, 40], [20.5, 0], [19.5, 0], [8, 40]], { plane: 'yz', o: [24, 25, 107], t: 252 }, M.grey);
  sc.extrude([[-30, 24], [20, 15], [70, 24], [70, 21], [20, 12], [-30, 21]], { plane: 'yz', o: [70, 25, 92], t: 206 }, M.sheet);
  sc.box([24, 20, 167], [252, 50, 50], M.steel);
  sc.extrude(cFrame, { plane: 'yz', o: [276, 0, 0], t: 24 }, M.steel);
  sc.callout([105, -28, 110], 'CNC BACKGAUGE', -30, -60);
  sc.callout([276, 45, 104], 'V-DIE', 60, 40);
  sc.callout([276, 45, 150], 'PUNCH', 60, -30);
  sc.callout([276, 95, 116], 'FORMED PART', 60, 70);
};

const tubeBendScene = (sc) => {
  sc.floor(-120, -60, 280, 200);
  sc.box([-90, 0, 0], [320, 110, 70], M.dark);
  sc.cyl([170, 45, 70], 34, 26, 'z', M.steel, { hole: 8 });
  const path = [[-110, 87, 83]];
  for (let i = 0; i <= 18; i++) { const a = Math.PI / 2 - (i / 18) * (Math.PI / 2); path.push([170 + 42 * Math.cos(a), 45 + 42 * Math.sin(a), 83]); }
  path.push([212, -50, 83]);
  sc.tube(path, 8, M.sheet);
  sc.box([-90, 75, 70], [20, 24, 28], M.steel);
  sc.box([40, 97, 72], [100, 18, 24], M.steel);
  sc.box([150, 97, 72], [36, 16, 24], M.orange);
  sc.callout([212, -40, 83], 'CNC BEND', 50, -40);
  sc.callout([170, 45, 96], 'BEND DIE', -60, -60);
};

const robotScene = (sc) => {
  sc.floor(-40, -60, 300, 200);
  sc.cyl([250, -20, 0], 28, 30, 'z', M.dark);
  sc.cyl([250, -20, 30], 22, 30, 'z', M.orange);
  sc.box([0, 0, 0], [200, 120, 70], M.dark);
  sc.box([-10, -10, 70], [220, 140, 8], M.steel);
  [[10, 10], [175, 10], [10, 95], [175, 95]].forEach(([x, y]) => sc.box([x, y, 78], [15, 15, 10], M.orange));
  const z = 92;
  sc.tube([[20, 20, z], [180, 20, z]], 6, M.sheet);
  sc.tube([[20, 20, z], [20, 100, z]], 6, M.sheet);
  sc.tube([[100, 20, z], [100, 100, z]], 6, M.sheet);
  sc.tube([[180, 20, z], [180, 100, z]], 6, M.sheet);
  sc.tube([[20, 100, z], [180, 100, z]], 6, M.sheet);
  sc.dots([[20, 20, z], [100, 20, z], [20, 100, z], [100, 100, z]], 3, '#d9a873');
  sc.tube([[250, -20, 60], [235, -20, 175]], 13, M.orange);
  sc.tube([[235, -20, 175], [190, 60, 160]], 10, M.orange);
  sc.tube([[190, 60, 160], [184, 92, 112]], 6, M.orange);
  sc.tube([[184, 92, 112], [180, 100, 99]], 2.5, M.dark);
  sc.glow([180, 100, 97], 6);
  sc.sparks([180, 100, 97], 40, 'weld');
  sc.callout([240, -20, 150], 'WELD ROBOT', 50, -40);
  sc.callout([20, 100, z], 'FIXTURED PART', -50, 50);
};

const hangPart = (sc, x, m, kind) => {
  sc.line([[x + 30, 60, 200], [x + 30, 60, 160]], INK, 1.2);
  if (kind === 0) sc.extrude([[0, 0], [60, 0], [60, 70], [0, 70]], { plane: 'xz', o: [x, 58, 90], t: 3 }, m, [[15, 15, 5], [45, 15, 5], [30, 50, 8]]);
  else sc.extrude([[0, 0], [60, 0], [60, 8], [8, 8], [8, 70], [0, 70]], { plane: 'xz', o: [x, 40, 90], t: 40 }, m);
};

const powderScene = (sc) => {
  sc.floor(-240, -20, 560, 160);
  sc.box([-230, 10, 30], [170, 110, 150], M.steel);
  for (let i = 0; i < 6; i++) sc.line([[-200 + i * 26, 120, 160], [-200 + i * 26, 120, 145]], HOT, 2);
  sc.tube([[-260, 60, 200], [580, 60, 200]], 4, M.dark);
  hangPart(sc, -30, M.sheet, 0);
  hangPart(sc, 60, M.sheet, 1);
  hangPart(sc, 150, M.sheet, 0);
  sc.box([250, 0, 0], [160, 130, 190], M.steel);
  sc.poly([[280, 130, 30], [380, 130, 30], [380, 130, 170], [280, 130, 170]], '#0b0c0e', { stroke: EDGE });
  const r = rng('powder');
  const cloud = [];
  for (let i = 0; i < 70; i++) cloud.push([290 + r() * 80, 130, 50 + r() * 100]);
  sc.dots(cloud, 1.6, '#ff8b3d', 0.55);
  hangPart(sc, 430, M.orange, 1);
  hangPart(sc, 510, M.black, 0);
  sc.callout([-140, 120, 180], '6-STAGE WASH', -30, -50);
  sc.callout([330, 130, 170], 'POWDER BOOTH', 30, -60);
  sc.callout([540, 61, 130], 'TO CURE OVEN', 30, 50);
};

const assemblyScene = (sc) => {
  sc.floor(-40, -40, 300, 180);
  sc.poly([[0, -6, 88], [240, -6, 88], [240, -6, 220], [0, -6, 220]], mix(M.dark, 0.5));
  const peg = [];
  for (let x = 12; x < 240; x += 16) for (let z = 100; z < 216; z += 16) peg.push([x, -6, z]);
  sc.dots(peg, 1.4, '#0b0c0e');
  sc.line([[40, -6, 200], [40, -6, 150]], INK, 3);
  sc.line([[70, -6, 200], [62, -6, 160]], INK, 3);
  [[0, 0], [228, 0]].forEach(([x, y]) => sc.box([x, y, 0], [12, 12, 80], M.steel));
  [[0, 98], [228, 98]].forEach(([x, y]) => sc.box([x, y, 0], [12, 12, 80], M.steel));
  sc.box([0, 0, 80], [240, 110, 8], M.concrete);
  [0, 1, 2, 3].forEach((i) => sc.box([150 + i * 22, 2, 88], [20, 18, 14], [M.orange, M.blue, M.yellow, M.green][i]));
  sc.at([20, 25, 88], 0.6, () => enclosure(sc, M.blue));
  sc.ops.pop();
  sc.at([110, 50, 88], 0.45, () => bracket(sc));
  sc.ops.pop();
  for (let i = 0; i < 4; i++) sc.cyl([180 + i * 10, 80, 88], 3, 10, 'z', M.grey);
  sc.callout([60, 70, 150], 'SUB-ASSEMBLY', -40, -50);
  sc.callout([194, 20, 102], 'HARDWARE', 40, -50);
};

const plantScene = (sc) => {
  sc.floor(-80, -60, 520, 420, 40);
  sc.box([0, 0, 0], [420, 240, 90], M.concrete);
  sc.box([0, 0, 90], [420, 240, 6], M.dark);
  [230, 280, 330].forEach((x) => sc.poly([[x, 240, 0], [x + 34, 240, 0], [x + 34, 240, 44], [x, 240, 44]], '#0b0c0e'));
  sc.poly([[420, 60, 0], [420, 120, 0], [420, 120, 60], [420, 60, 60]], '#0b0c0e');
  sc.poly([[30, 240, 60], [180, 240, 60], [180, 240, 82], [30, 240, 82]], mix(M.orange, 0.8), { stroke: 'none' });
  sc.box([20, 240, 0], [150, 60, 42], M.grey);
  for (let x = 32; x < 165; x += 26) sc.poly([[x, 300, 14], [x + 16, 300, 14], [x + 16, 300, 32], [x, 300, 32]], '#2b4a5e');
  sc.box([226, 250, 8], [42, 130, 48], M.steel);
  sc.box([276, 250, 8], [42, 130, 48], M.steel);
  for (let i = 0; i < 6; i++) sc.line([[60 + i * 26, 340, 0], [60 + i * 26, 400, 0]], '#c2c6ca', 1.2, { op: 0.6 });
  sc.callout([105, 240, 80], 'MOTION METALWORKS', -30, -70);
  sc.callout([420, 240, 90], '125,000 SQ FT', 40, -40);
};

// ---- registry -----------------------------------------------------------------------

const partBuilders = {
  brackets: [bracket, 'a formed steel L-bracket with mounting holes'],
  'enclosure-panels': [enclosurePanel, 'a sheet metal enclosure panel with louvers and bent flanges'],
  'gussets-plates': [gussetPlate, 'a triangular gusset on a drilled plate'],
  'machine-guards': [guard, 'a perforated machine guard panel'],
  'base-plates': [basePlate, 'a thick base plate with counterbored holes'],
  flanges: [flange, 'a round flange with a bolt circle'],
  gaskets: [gasket, 'two cut gaskets'],
  'wear-plates': [wearPlate, 'a wear plate with countersunk holes'],
  'channels-angles': [channel, 'a formed channel and an angle'],
  enclosures: [enclosure, 'a sheet metal electrical enclosure'],
  'covers-doors': [cover, 'a formed cover and a hinged door'],
  'tube-frames': [(sc, m) => frame(sc, m, true), 'a welded tube frame'],
  handrails: [handrail, 'a bent tube handrail'],
  handles: [handle, 'two bent tube handles'],
  'roll-bars': [rollBar, 'a bent tube roll bar with a brace'],
  weldments: [weldment, 'a welded square tube weldment'],
  mounts: [mount, 'a gusseted mounting bracket'],
  'trailer-components': [trailer, 'a trailer tongue A-frame with a jack mount'],
  'outdoor-equipment': [outdoorEquip, 'an outdoor cabinet on tube legs'],
  'sub-assemblies': [subAssembly, 'an enclosure sub-assembly with a mounted bracket'],
  kits: [kit, 'a kit of parts and hardware on a tray'],
  'hardware-panels': [hardwarePanel, 'a panel with installed studs and nuts'],
  'finished-goods': [finishedGoods, 'coated enclosures on a pallet'],
  'weld-fixtures': [weldFixture, 'a weld fixture with toggle clamps on a drilled plate'],
  'check-fixtures': [checkFixture, 'a check fixture with gauge pins'],
  'assembly-jigs': [assemblyJig, 'an assembly jig'],
  'shop-tooling': [shopTooling, 'press brake dies and a punch'],
};

const capScenes = {
  'fiber-laser': [laserScene, 'a fiber laser cutting parts from a steel sheet'],
  waterjet: [waterjetScene, 'a waterjet cutting thick plate over a water tank'],
  'press-brake': [pressBrakeScene, 'a CNC press brake forming a part between punch and V-die'],
  'tube-bending': [tubeBendScene, 'a CNC tube bender wrapping tube around a bend die'],
  'robotic-welding': [robotScene, 'a robot welding a tube frame held in a fixture'],
  'powder-coat': [powderScene, 'parts on a conveyor leaving the wash, passing the powder booth, and coming out coated'],
  assembly: [assemblyScene, 'an assembly bench with a sub-assembly, hardware and bins'],
  tooling: [weldFixture, 'a weld fixture with toggle clamps on a drilled plate'],
};

const SIZES = { '4 / 3': [800, 600], '16 / 10': [960, 600], '1 / 1': [600, 600] };
const FINISH = {
  raw: [M.steel, ''],
  orange: [M.orange, 'orange'],
  black: [M.black, 'black'],
  yellow: [M.yellow, 'safety yellow'],
  green: [M.green, 'green'],
  blue: [M.blue, 'blue'],
};

export const art = {};
const reg = (key, ratio, alt, fig, build) => { art[key] = { ratio, alt: `Illustration of ${alt}`, fig, build }; };

capabilities.forEach((c, i) => {
  const [scene, alt] = capScenes[c.slug];
  reg(`cap-${c.slug}`, '4 / 3', alt, `FIG. ${String(i + 1).padStart(2, '0')} — ${c.short.toUpperCase()}`, scene);
});
parts.forEach((p, i) => {
  if (!partBuilders[p.slug]) throw new Error(`No illustration for part "${p.slug}"`);
  if (!FINISH[p.finish]) throw new Error(`Unknown finish "${p.finish}" on part "${p.slug}"`);
  const [build, alt] = partBuilders[p.slug];
  const [m, label] = FINISH[p.finish];
  reg(`part-${p.slug}`, '1 / 1', label ? `${alt}, powder coated ${label}` : alt, `P-${String(i + 1).padStart(2, '0')} — ${p.name.toUpperCase()}`, (sc) => build(sc, m));
});
reg('powder-line', '16 / 10', capScenes['powder-coat'][1], 'FIG. 06 — WASH + POWDER LINE', powderScene);
reg('plant', '16 / 10', 'the Motion Metalworks plant with loading docks and the front office', 'FIG. 00 — WRENS, GA PLANT', plantScene);

// Headshots stay obvious placeholders: a silhouette, never an invented face.
const headshot = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" font-family="'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace">
<defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#1c2024"/></pattern></defs>
<rect width="600" height="600" fill="#16191c"/><rect width="600" height="600" fill="url(#g)"/>
<circle cx="300" cy="245" r="92" fill="#2b3035"/><path d="M120 600c0-110 80-190 180-190s180 80 180 190z" fill="#2b3035"/>
<text x="28" y="40" fill="${INK}" font-size="12" letter-spacing=".12em">HEADSHOT — PHOTO NEEDED</text>
</svg>
`;
art.headshot = { ratio: '1 / 1', alt: 'Placeholder silhouette for a staff headshot', raw: headshot };

export function renderArt(key) {
  const a = art[key];
  if (!a) throw new Error(`No illustration registered for "${key}"`);
  if (a.raw) return a.raw();
  const sc = new Scene();
  a.build(sc);
  const [W, H] = SIZES[a.ratio];
  return sc.render(W, H, a.fig);
}
