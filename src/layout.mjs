import { company, capabilities } from './data.mjs';
import { art } from './art.mjs';

// ---- placeholder tracking -------------------------------------------------

let found = [];
export const resetPlaceholders = () => { found = []; };
export const placeholders = () => found;

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Render a content value: plain strings are escaped, tbd() values become a
// highlighted placeholder and are recorded for the build report.
export const t = (v) => {
  if (v && typeof v === 'object' && 'tbd' in v) {
    found.push(v.tbd);
    return `<span class="tbd" title="Placeholder: confirm before launch">[${esc(v.tbd)}]</span>`;
  }
  return esc(v);
};

// Plain-text version of a value, for attributes and meta tags.
export const plain = (v) => (v && typeof v === 'object' && 'tbd' in v ? v.tbd : String(v));

// ---- icons ----------------------------------------------------------------

export const icon = {
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  phone: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  menu: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  upload: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></svg>',
  pin: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
};

// ---- shared chunks ----------------------------------------------------------

// A photo slot. With an illustration key it shows the generated drawing and
// records the real photo still to be shot as a placeholder.
export const photo = (label, ratio = '4 / 3', key) => {
  if (!key) return `<figure class="photo" style="aspect-ratio:${ratio}"><figcaption>Photo · ${esc(label)}</figcaption></figure>`;
  const a = art[key];
  if (!a) throw new Error(`No illustration registered for "${key}"`);
  if (a.ratio !== ratio) throw new Error(`Illustration "${key}" is ${a.ratio}, slot is ${ratio}`);
  usedArt.add(key);
  found.push(`Photo: ${label}`);
  return `<figure class="photo has-art" style="aspect-ratio:${ratio}"><img src="img/art/${key}.svg" alt="${esc(a.alt)}" loading="lazy" decoding="async"><figcaption class="art-note">Illustration · replace with photo: ${esc(label)}</figcaption></figure>`;
};
export const usedArt = new Set();

export const eyebrow = (s) => `<p class="eyebrow">${s}</p>`;

export const btn = (href, label, kind = 'primary') =>
  `<a class="btn btn-${kind}" href="${href}">${label}${kind === 'primary' ? icon.arrow : ''}</a>`;

const nav = [
  ['capabilities.html', 'Capabilities', 'capabilities'],
  ['powder-coat.html', 'Powder Coat', 'powder-coat'],
  ['quality.html', 'Quality', 'quality'],
  ['work.html', 'Work', 'work'],
  ['about.html', 'About', 'about'],
  ['careers.html', 'Careers', 'careers'],
];

const header = (section) => `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="index.html" aria-label="${company.name} home">
      <span class="brand-mark" aria-hidden="true">M</span>
      <span class="brand-name">Motion Metalworks</span>
    </a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">${icon.menu}</button>
    <nav id="site-nav" class="site-nav" aria-label="Primary">
      <ul>
        ${nav.map(([href, label, key]) => `<li><a href="${href}"${key === section ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}
      </ul>
      <div class="nav-cta">
        <a class="phone" href="tel:${company.phoneHref}">${icon.phone}<span>${company.phone}</span></a>
        <a class="btn btn-primary btn-sm" href="quote.html">Request a quote</a>
      </div>
    </nav>
  </div>
</header>`;

const footer = (sheet) => `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-col">
      <p class="footer-brand">${company.legal}</p>
      <p>Contract metal fabrication and powder coating in ${company.city}, Georgia, since ${company.since}.</p>
    </div>
    <div class="footer-col">
      <p class="label">Visit</p>
      <p>${company.street}<br>${company.city}, ${company.region} ${company.zip}</p>
      <p><a href="${company.maps}" rel="noopener">Get directions</a></p>
    </div>
    <div class="footer-col">
      <p class="label">Call</p>
      <p class="mono">Phone <a href="tel:${company.phoneHref}">${company.phone}</a><br>Fax ${company.fax}</p>
      <p class="mono">${t(company.hours)}</p>
    </div>
    <div class="footer-col">
      <p class="label">Capabilities</p>
      <ul class="footer-links">
        ${capabilities.map((c) => `<li><a href="${c.slug}.html">${esc(c.short)}</a></li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="wrap">
    <div class="title-block" aria-label="Page information">
      <div><span>Drawn by</span>${company.legal}</div>
      <div><span>Dwg no.</span>${esc(sheet.code)}</div>
      <div><span>Title</span>${esc(sheet.title)}</div>
      <div><span>Rev</span>${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}</div>
      <div><span>Sheet</span>${sheet.n} of ${sheet.of}</div>
      <div class="tb-tools">
        <button type="button" class="tbd-toggle" aria-pressed="true">Highlight placeholders</button>
        <span class="tb-social"><a href="${company.social.linkedin}" rel="noopener">LinkedIn</a> · <a href="${company.social.facebook}" rel="noopener">Facebook</a></span>
      </div>
    </div>
  </div>
</footer>`;

const fonts =
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';

// Full page. `bare` drops the document wrapper for hosts that add their own.
// `concept` marks a shared review build: a banner saying this is not the
// official site, and a noindex tag so it never competes with the real one.
const conceptBanner = `<div class="concept-banner" role="note">Concept redesign for review — not the official Motion Metalworks website. Visit <a href="https://www.motionmetalworks.com/" rel="noopener">motionmetalworks.com</a>.</div>`;

export const page = ({ title, description, section, sheet, body, head = '', bare = false, concept = false }) => {
  const headTags = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0F1113">${concept ? '\n<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<link rel="stylesheet" href="styles.css">
${head}`;
  const content = `${concept ? conceptBanner : ''}${header(section)}
<main id="main">
${body}
</main>
${footer(sheet)}
<script src="site.js"></script>`;
  if (bare) return `${headTags}\n<div class="page-root">\n${content}\n</div>\n`;
  return `<!doctype html>
<html lang="en" class="show-tbd">
<head>
${headTags}
</head>
<body>
${content}
</body>
</html>
`;
};
