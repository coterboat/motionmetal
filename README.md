# Motion Metalworks — sample site (Concept A, "Spec Sheet")

A static, dependency-free redesign sample for motionmetalworks.com.

```
node build.mjs          # writes 15 pages + styles.css + site.js into site/
```

Open `site/index.html` in a browser, or serve it locally:

```
python3 -m http.server 4173 --directory site   # then visit http://localhost:4173
```

Upload the `site/` folder to any static host to deploy.

## Deploying

Every push to `main` runs `.github/workflows/pages.yml`, which builds the site and publishes it to GitHub Pages.
It builds with `--concept`, which adds a "concept redesign, not the official site" banner and tells search engines
not to index it. Remove that flag from the workflow when this becomes the real site.

## Where things live

| File | What it holds |
| --- | --- |
| `src/data.mjs` | All content: company details, the 8 capabilities and their specs, quality, work, roles |
| `src/pages.mjs` | One template per page type (home, capability overview/detail, quality, work, about, careers, quote) |
| `src/layout.mjs` | Shared head, header, footer "title block", and helpers |
| `src/assets/styles.css` | Design tokens and all styles |
| `src/assets/site.js` | Mobile menu, hero laser animation, work filter, quote form with file drop |

## Placeholders

Anything the current site does not state (bed sizes, tonnage, certifications, hours, turnaround) is written as
`tbd('…')` in `src/data.mjs` or `src/pages.mjs`. These render highlighted in yellow, and the build lists every
one per page. Replace each with the real value as a plain string, rebuild, and the highlight disappears. The
"Highlight placeholders" button in the footer hides them for a clean preview.

## Illustrations

Every photo slot shows an isometric technical drawing generated at build time by `src/art.mjs` (SVGs in
`site/img/art/`, regenerated on every build). They are stand-ins for real photos: each one is captioned "replace with photo" while placeholders
are highlighted, and is listed in the build report. Review them all at `site/_illustrations.html`.

To use a real photo, put it in `site/img/` (not `img/art/`) and point that slot at it in `src/pages.mjs` (or swap the
`photo()` call for a plain `<img>`). Headshots are deliberately plain silhouettes, never invented faces.

## Before going live

- Fill every placeholder; the machine limits on the capability pages matter most for search and for buyers.
- Wire the quote and careers forms to a real endpoint (they validate and show a summary but send nothing).
  The quote form expects file uploads, so pick a handler that accepts attachments.
- Replace the hero animation's sample nest with real footage if you have it, or keep it as is.
- Add real photos, a favicon, and set the production URL in the JSON-LD block in `src/pages.mjs`.
