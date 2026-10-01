#!/usr/bin/env node
// Builds the static site into ./site.
//   node build.mjs              full HTML documents (deploy these)
//   node build.mjs --bare-index also writes site/_preview-index.html without the
//                               <html>/<head> wrapper, for hosts that add their own
//   node build.mjs --concept    adds a "concept, not the official site" banner and
//                               noindex tags, for sharing a review copy publicly
import { mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import { pages } from './src/pages.mjs';
import { page, resetPlaceholders, placeholders } from './src/layout.mjs';
import { renderArt, art } from './src/art.mjs';

const out = new URL('./site/', import.meta.url);
const bareIndex = process.argv.includes('--bare-index');
const concept = process.argv.includes('--concept');

await mkdir(out, { recursive: true });
await copyFile(new URL('./src/assets/styles.css', import.meta.url), new URL('styles.css', out));
await copyFile(new URL('./src/assets/site.js', import.meta.url), new URL('site.js', out));

// Illustrations for photo slots. img/art/ is regenerated from scratch each
// build so renamed parts leave no stale files; real photos go in img/.
await rm(new URL('img/art/', out), { recursive: true, force: true });
await mkdir(new URL('img/art/', out), { recursive: true });
for (const key of Object.keys(art)) await writeFile(new URL(`img/art/${key}.svg`, out), renderArt(key));
// Contact sheet for reviewing every illustration at once (not linked from the site).
await writeFile(
  new URL('_illustrations.html', out),
  `<!doctype html><meta charset="utf-8"><title>Illustrations</title><style>body{margin:0;padding:24px;background:#0f1113;color:#c2c6ca;font:13px ui-monospace,monospace}div{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}img{width:100%;display:block;border:1px solid #2b3035}</style><div>${Object.keys(art)
    .map((k) => `<figure style="margin:0"><img src="img/art/${k}.svg" alt=""><figcaption>${k}</figcaption></figure>`)
    .join('')}</div>`,
);

const report = [];
for (const [i, make] of pages.entries()) {
  resetPlaceholders();
  const p = make();
  const sheet = { code: p.code, title: p.sheetTitle, n: i + 1, of: pages.length };
  const html = page({ ...p, sheet, concept });
  await writeFile(new URL(p.file, out), html);
  if (bareIndex && p.file === 'index.html') {
    await writeFile(new URL('_preview-index.html', out), page({ ...p, sheet, bare: true, concept }));
  }
  report.push([p.file, [...new Set(placeholders())]]);
}

const unique = new Set(report.flatMap(([, list]) => list));
console.log(`Built ${pages.length} pages and ${Object.keys(art).length} illustrations into site/\n\nPlaceholders to fill before launch:`);
for (const [file, list] of report) {
  if (list.length) console.log(`  ${file} (${list.length}): ${list.join(' | ')}`);
}
console.log(`\n${unique.size} distinct placeholders across ${report.filter(([, l]) => l.length).length} pages.`);
