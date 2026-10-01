import { company, capabilities, capBySlug, flow, quality, parts, partBySlug, roles } from './data.mjs';
import { t, esc, plain, icon, photo, eyebrow, btn } from './layout.mjs';

// How each capability reads in a part's process line, e.g. "Laser cut · Formed · Powder coated".
const verb = {
  'fiber-laser': 'Laser cut',
  waterjet: 'Waterjet cut',
  'press-brake': 'Formed',
  'tube-bending': 'Tube bent',
  'robotic-welding': 'Welded',
  'powder-coat': 'Powder coated',
  assembly: 'Assembled',
  tooling: 'Built in-house',
};
const capOrder = (slugs) => [...slugs].sort((a, b) => capabilities.indexOf(capBySlug[a]) - capabilities.indexOf(capBySlug[b]));
const partsFor = (cap) => parts.filter((p) => p.caps.includes(cap));

const pageHead = (eb, title, lede, extra = '') => `
<section class="page-head">
  <div class="wrap">
    ${eb ? eyebrow(eb) : ''}
    <h1>${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
    ${extra}
  </div>
</section>`;

const ctaBand = (heading = 'Send drawings. Get a real number.', hash = '') => `
<section class="cta-band">
  <div class="wrap cta-row">
    <div>
      ${eyebrow('Request for quote')}
      <h2>${heading}</h2>
      <p>Attach STEP, DXF or PDF files. An estimator replies within ${t({ tbd: '__ business days' })}.</p>
    </div>
    <div class="cta-actions">
      ${btn(`quote.html${hash}`, 'Start a quote')}
      <p class="mono">or call <a href="tel:${company.phoneHref}">${company.phone}</a></p>
    </div>
  </div>
</section>`;

const capCard = (c, i) => `
<a class="cap-card" href="${c.slug}.html">
  <span class="cap-meta"><span>${String(i + 1).padStart(2, '0')}</span><span>${esc(c.group)}</span></span>
  <span class="cap-name">${esc(c.short)}</span>
  <span class="cap-blurb">${esc(c.blurb)}</span>
  <span class="cap-more">Specs ${icon.arrow}</span>
</a>`;

const specTable = (rows) => `
<div class="table-scroll">
<table class="spec">
  <tbody>
    ${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${t(v)}</td></tr>`).join('')}
  </tbody>
</table>
</div>`;

// ---------------------------------------------------------------- home

const home = () => {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.legal,
    description: 'Contract manufacturer of metal fabrications and powder coater.',
    telephone: '+1-706-790-5009',
    faxNumber: '+1-706-790-0945',
    foundingDate: String(company.since),
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.street,
      addressLocality: company.city,
      addressRegion: company.region,
      postalCode: company.zip,
      addressCountry: 'US',
    },
    url: 'https://www.motionmetalworks.com/',
  };
  return {
    file: 'index.html',
    code: 'MMW-000',
    sheetTitle: 'Home',
    title: 'Metal Fabrication & Powder Coating in Wrens, GA | Motion Metalworks',
    description:
      'Contract metal fabrication and powder coating in a 125,000 sq ft plant in Wrens, GA: 6 kW fiber laser, waterjet, CNC forming, robotic welding and an automated 6-stage powder line.',
    head: `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    body: `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      ${eyebrow(`Contract manufacturing · ${company.city}, GA · Since ${company.since}`)}
      <h1>Cut, formed, welded &amp; powder coated under one&nbsp;roof.</h1>
      <p class="lede">A ${company.sqft} sq ft plant running fiber laser, waterjet, CNC forming, robotic welding and an automated 6-stage wash and powder line. Your parts ship finished, on one purchase order.</p>
      <div class="actions">
        ${btn('quote.html', 'Upload drawings for a quote')}
        ${btn('capabilities.html', 'See capabilities', 'ghost')}
      </div>
    </div>
    <figure class="laser">
      <canvas id="laser" role="img" aria-label="Animation of a fiber laser cutting a nest of brackets, plates and flanges from a steel sheet"></canvas>
      <figcaption class="laser-hud"><span>Nest 01 · 6 kW fiber</span><span id="laser-pct">Cut 100%</span></figcaption>
    </figure>
  </div>
</section>

<section class="ticker" aria-label="Key equipment">
  <div class="wrap ticker-row">
    <div><strong>6,000 W</strong><span>Fiber laser</span></div>
    <div><strong>6-stage</strong><span>Wash + powder line</span></div>
    <div><strong>Robotic</strong><span>Weld cells</span></div>
    <div><strong>CNC</strong><span>Brake + tube bending</span></div>
    <div><strong>Faro + Virtek</strong><span>3D measurement</span></div>
  </div>
</section>

<section class="section" id="capabilities">
  <div class="wrap">
    <div class="section-head">
      <h2>Capabilities</h2>
      <p>Every capability has its own page with real limits: bed size, thickness, tonnage and tolerance. Engineers can qualify us before they call.</p>
    </div>
    <div class="cap-grid">${capabilities.map(capCard).join('')}</div>
  </div>
</section>

<section class="section section-alt">
  <div class="wrap">
    <div class="section-head">
      <h2>How a job moves through the plant</h2>
      <p>One building, one schedule. Nothing leaves for an outside vendor between steps.</p>
    </div>
    <ol class="flow">
      ${flow.map(([name, text], i) => `<li><span class="flow-n">${String(i + 1).padStart(2, '0')}</span><span class="flow-name">${name}</span><span class="flow-text">${text}</span></li>`).join('')}
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    ${photo('parts on the powder line conveyor', '16 / 10', 'powder-line')}
    <div class="stack">
      ${eyebrow('In-house finishing')}
      <h2>No outsourced paint. No extra freight. No waiting on a coater.</h2>
      <p>Every part we fabricate can run through our automated 6-stage wash and powder coat system before it ships. Pretreatment is what makes powder last, and it happens on the same line.</p>
      <ol class="stages">
        ${capBySlug['powder-coat'].stages.map(([s], i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${s}</li>`).join('')}
      </ol>
      <p><a class="link" href="powder-coat.html">Powder coat specs ${icon.arrow}</a></p>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="wrap split">
    <div class="stack">
      ${eyebrow('Quality')}
      <h2>Measured, not eyeballed.</h2>
      <p>First articles and weldments are checked with a Faro Arm and a Virtek 3D laser scanner against your model.</p>
      <p><a class="link" href="quality.html">How we inspect ${icon.arrow}</a></p>
    </div>
    <div class="tile-grid">
      ${quality.map((q) => `<div class="tile"><span class="tile-name">${t(q.name)}</span><span class="tile-role">${t(q.role)}</span></div>`).join('')}
    </div>
  </div>
</section>

${ctaBand()}
`,
  };
};

// ---------------------------------------------------------------- capabilities overview

const capabilitiesPage = () => ({
  file: 'capabilities.html',
  code: 'MMW-100',
  sheetTitle: 'Capabilities',
  section: 'capabilities',
  title: 'Capabilities: Laser, Waterjet, Forming, Welding, Powder Coat | Motion Metalworks',
  description:
    'Fiber laser and waterjet cutting, CNC press brake and tube bending, robotic welding, powder coating, assembly and fixtures under one roof in Wrens, GA.',
  body: `
${pageHead('Capabilities', 'Everything on the floor', `Eight capabilities in one ${company.sqft} sq ft plant. Pick one for specs, or send the whole job and we will route it.`)}
<section class="section section-tight">
  <div class="wrap cap-list">
    ${capabilities
      .map(
        (c, i) => `
    <article class="cap-row">
      <div class="cap-row-head">
        <span class="mono muted">${String(i + 1).padStart(2, '0')} · ${esc(c.group)}</span>
        <h2><a href="${c.slug}.html">${esc(c.name)}</a></h2>
        <p>${esc(c.intro)}</p>
        <p><a class="link" href="${c.slug}.html">Full specs ${icon.arrow}</a></p>
      </div>
      <dl class="cap-row-specs">
        ${c.specs
          .slice(0, 3)
          .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${t(v)}</dd></div>`)
          .join('')}
      </dl>
    </article>`,
      )
      .join('')}
  </div>
</section>
${ctaBand('Not sure which process fits? Send the drawing.')}
`,
});

// ---------------------------------------------------------------- capability detail

const capabilityPage = (c, i) => ({
  file: `${c.slug}.html`,
  code: `MMW-${101 + i}`,
  sheetTitle: c.name,
  section: c.slug === 'powder-coat' ? 'powder-coat' : 'capabilities',
  title: `${c.name} in Wrens, GA | Motion Metalworks`,
  description: `${c.intro.split('. ')[0]}. Contract manufacturing in Wrens, Georgia.`,
  body: `
<section class="page-head page-head-split">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="capabilities.html">Capabilities</a><span aria-hidden="true">/</span><span aria-current="page">${esc(c.name)}</span></nav>
    <div class="split">
      <div class="stack">
        ${eyebrow(`${String(i + 1).padStart(2, '0')} · ${esc(c.group)}`)}
        <h1>${esc(c.name)}</h1>
        <p class="lede">${esc(c.intro)}</p>
        <div class="actions">
          ${btn(`quote.html#${c.slug}`, `Quote a ${c.short.toLowerCase()} job`)}
          ${btn('capabilities.html', 'All capabilities', 'ghost')}
        </div>
      </div>
      ${photo(`${c.headline.toLowerCase()} in operation`, '4 / 3', `cap-${c.slug}`)}
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="wrap split split-wide">
    <div class="stack">
      <h2 class="h3">Specifications</h2>
      ${specTable(c.specs)}
    </div>
    <div class="stack">
      <h2 class="h3">What it is good for</h2>
      <ul class="checks">${c.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <h2 class="h3">Typical parts</h2>
      <ul class="parts">${c.parts
        .map((slug) => partBySlug[slug])
        .map((p) => `<li><a href="work.html#${c.slug}">${photo(p.name.toLowerCase(), '1 / 1', `part-${p.slug}`)}<span>${esc(p.name)}</span></a></li>`)
        .join('')}</ul>
      <p><a class="link" href="work.html#${c.slug}">All ${partsFor(c.slug).length} ${esc(c.short.toLowerCase())} part families ${icon.arrow}</a></p>
    </div>
  </div>
</section>

${
  c.stages
    ? `
<section class="section section-alt">
  <div class="wrap">
    <div class="section-head">
      <h2>The 6-stage wash</h2>
      <p>Each part is cleaned and pretreated before powder is applied, so the coating bonds to bare, prepared metal.</p>
    </div>
    <ol class="flow flow-6">
      ${c.stages.map(([s, d], j) => `<li><span class="flow-n">Stage ${j + 1}</span><span class="flow-name">${s}</span><span class="flow-text">${t(d)}</span></li>`).join('')}
    </ol>
  </div>
</section>`
    : ''
}

<section class="section${c.stages ? '' : ' section-alt'}">
  <div class="wrap">
    <h2 class="h3">Usually paired with</h2>
    <div class="pair-row">
      ${c.pairs.map((s) => `<a class="pair" href="${s}.html"><span>${esc(capBySlug[s].short)}</span>${icon.arrow}</a>`).join('')}
    </div>
  </div>
</section>

${ctaBand(`Quote a ${c.short.toLowerCase()} job.`, `#${c.slug}`)}
`,
});

// ---------------------------------------------------------------- quality

const qualityPage = () => ({
  file: 'quality.html',
  code: 'MMW-200',
  sheetTitle: 'Quality',
  section: 'quality',
  title: 'Quality & Inspection | Motion Metalworks',
  description: 'Faro Arm and Virtek 3D laser scanner inspection for fabricated and welded parts in Wrens, GA.',
  body: `
${pageHead('Quality', 'Measured, not eyeballed.', 'We check parts against your model with portable 3D measurement, so problems are caught at our dock instead of yours.')}
<section class="section section-tight">
  <div class="wrap tile-grid tile-grid-lg">
    ${quality.map((q) => `<article class="tile"><span class="tile-name">${t(q.name)}</span><span class="tile-role">${t(q.role)}</span><p>${t(q.text)}</p></article>`).join('')}
  </div>
</section>
<section class="section section-alt">
  <div class="wrap split">
    <div class="stack">
      <h2>Documents you can request</h2>
      <p>List what you can provide with an order. Buyers check this before sending a print.</p>
    </div>
    ${specTable([
      ['First article inspection report', { tbd: 'Yes / on request' }],
      ['Material certifications', { tbd: 'Yes / on request' }],
      ['Coating thickness readings', { tbd: 'Yes / on request' }],
      ['PPAP', { tbd: 'Level __ / not offered' }],
    ])}
  </div>
</section>
${ctaBand()}
`,
});

// ---------------------------------------------------------------- work

const workPage = () => ({
  file: 'work.html',
  code: 'MMW-300',
  sheetTitle: 'Parts we make',
  section: 'work',
  title: 'Parts We Make: Brackets, Enclosures, Frames, Weldments | Motion Metalworks',
  description: `${parts.length} part families Motion Metalworks cuts, forms, welds, powder coats and assembles in Wrens, GA, filterable by process.`,
  body: `
${pageHead('Work', 'Parts we make', `${parts.length} part families, each tagged with every process it goes through. Pick a capability to see what it produces.`)}
<section class="section section-tight">
  <div class="wrap">
    <div class="filters" role="group" aria-label="Filter parts by capability">
      <button type="button" class="chip" aria-pressed="true" data-filter="all">All <span class="chip-n">${parts.length}</span></button>
      ${capabilities.map((c) => `<button type="button" class="chip" aria-pressed="false" data-filter="${c.slug}">${esc(c.short)} <span class="chip-n">${partsFor(c.slug).length}</span></button>`).join('')}
    </div>
    <p class="result-count mono muted" role="status" aria-live="polite">Showing all ${parts.length} part families</p>
    <ul class="work-grid">
      ${parts
        .map(
          (p) => `
      <li class="work-card" data-caps="${p.caps.join(' ')}">
        ${photo(p.name.toLowerCase(), '1 / 1', `part-${p.slug}`)}
        <h2 class="h4">${esc(p.name)}</h2>
        <p class="process">${capOrder(p.caps).map((c) => verb[c]).join(' · ')}</p>
        <ul class="tags" aria-label="Capabilities">${capOrder(p.caps).map((c) => `<li><a href="#${c}" data-cap="${c}">${esc(capBySlug[c].short)}</a></li>`).join('')}</ul>
      </li>`,
        )
        .join('')}
    </ul>
    <p class="empty" hidden>No parts tagged with that capability yet.</p>
  </div>
</section>
${ctaBand('Have a part like these?')}
`,
});

// ---------------------------------------------------------------- about

const aboutPage = () => ({
  file: 'about.html',
  code: 'MMW-400',
  sheetTitle: 'About',
  section: 'about',
  title: 'About Motion Metalworks | Wrens, GA',
  description: `Motion Metalworks has served customers from Wrens, GA since ${company.since}, with a ${company.sqft} sq ft fabrication and powder coating plant.`,
  body: `
${pageHead('About', `Building in ${company.city} since ${company.since}`, `Motion Metalworks is a contract manufacturer of metal fabrications and a powder coater, operating from a ${company.sqft} sq ft facility in ${company.city}, Georgia.`)}
<section class="section section-tight">
  <div class="wrap split">
    ${photo(`the ${company.city} plant with the Motion sign`, '16 / 10', 'plant')}
    <div class="stack">
      <h2>What we believe</h2>
      <ul class="checks">
        <li>Build strong, lasting relationships with customers by delivering high-quality products on time and on budget.</li>
        <li>Keep a satisfying, profitable workplace for our employees.</li>
        <li>Minimize waste and respect our environment.</li>
        <li>Stay profitable so we can keep growing and improving.</li>
      </ul>
    </div>
  </div>
</section>
<section class="section section-alt">
  <div class="wrap">
    <div class="section-head"><h2>Our people</h2><p>Name the people a buyer will actually talk to.</p></div>
    <ul class="people">
      ${[['Owner / President'], ['Plant manager'], ['Estimating']]
        .map(([role]) => `<li>${photo('headshot', '1 / 1', 'headshot')}<span class="tile-name">${t({ tbd: 'Name' })}</span><span class="tile-role">${esc(role)}</span></li>`)
        .join('')}
    </ul>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div class="stack">
      <h2>Visit the plant</h2>
      <p class="mono">${company.street}<br>${company.city}, ${company.region} ${company.zip}</p>
      <p class="mono">Phone <a href="tel:${company.phoneHref}">${company.phone}</a> · Fax ${company.fax}</p>
      <p class="mono">${t(company.hours)}</p>
      <div class="actions">${btn(company.maps, 'Get directions')}</div>
    </div>
    <div class="map" role="img" aria-label="Map placeholder for ${company.street}, ${company.city}">
      ${icon.pin}<span>${company.street}, ${company.city}</span>
    </div>
  </div>
</section>
`,
});

// ---------------------------------------------------------------- careers

const careersPage = () => ({
  file: 'careers.html',
  code: 'MMW-500',
  sheetTitle: 'Careers',
  section: 'careers',
  title: `Careers in ${company.city}, GA | Motion Metalworks`,
  description: 'Welding, machine operator and powder coating jobs at Motion Metalworks in Wrens, Georgia.',
  body: `
${pageHead('Careers', `Make things in ${company.city}`, 'We hire welders, machine operators and finishers from around Jefferson County. No résumé needed to start the conversation.')}
<section class="section section-tight">
  <div class="wrap split">
    <div class="stack">
      <h2 class="h3">Open roles</h2>
      <ul class="roles">
        ${roles.map((r) => `<li><span class="tile-name">${t(r.title)}</span><span class="mono muted">${t(r.shift)} · ${esc(r.type)}</span></li>`).join('')}
      </ul>
      <h2 class="h3">What we offer</h2>
      <p>${t({ tbd: 'Pay range, benefits, shift differential, training' })}</p>
    </div>
    <form class="form panel" id="apply-form" novalidate>
      <h2 class="h3">Tell us about yourself</h2>
      <div class="field"><label for="ap-name">Name</label><input id="ap-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="ap-phone">Phone</label><input id="ap-phone" name="phone" type="tel" autocomplete="tel" required></div>
      <div class="field"><label for="ap-role">Interested in</label>
        <select id="ap-role" name="role">${roles.map((r) => `<option>${esc(plain(r.title))}</option>`).join('')}<option>Something else</option></select></div>
      <div class="field"><label for="ap-exp">Experience</label><textarea id="ap-exp" name="experience" rows="3" placeholder="Machines, welding processes, years"></textarea></div>
      <button class="btn btn-primary" type="submit">Send</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
`,
});

// ---------------------------------------------------------------- quote

const quotePage = () => ({
  file: 'quote.html',
  code: 'MMW-600',
  sheetTitle: 'Request a quote',
  section: 'quote',
  title: 'Request a Quote | Motion Metalworks',
  description: 'Upload drawings for a metal fabrication or powder coating quote from Motion Metalworks in Wrens, GA.',
  body: `
${pageHead('Request for quote', 'Send drawings. Get a real number.', `Attach your files and tell us what you need. Prefer to talk? Call ${company.phone}.`)}
<section class="section section-tight">
  <div class="wrap quote-grid">
    <form class="form panel" id="quote-form" novalidate>
      <fieldset>
        <legend>Contact</legend>
        <div class="form-2">
          <div class="field"><label for="q-name">Name</label><input id="q-name" name="name" autocomplete="name" required></div>
          <div class="field"><label for="q-company">Company</label><input id="q-company" name="company" autocomplete="organization" required></div>
          <div class="field"><label for="q-email">Email</label><input id="q-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="q-phone">Phone <span class="opt">optional</span></label><input id="q-phone" name="phone" type="tel" autocomplete="tel"></div>
        </div>
      </fieldset>
      <fieldset>
        <legend>The job</legend>
        <div class="form-2">
          <div class="field"><label for="q-part">Part or project name</label><input id="q-part" name="part"></div>
          <div class="field"><label for="q-qty">Quantity per release</label><input id="q-qty" name="qty" inputmode="numeric" placeholder="e.g. 250"></div>
          <div class="field"><label for="q-annual">Annual quantity <span class="opt">optional</span></label><input id="q-annual" name="annual" inputmode="numeric"></div>
          <div class="field"><label for="q-date">Needed by <span class="opt">optional</span></label><input id="q-date" name="date" type="date"></div>
        </div>
        <div class="field">
          <span class="field-label" id="q-procs-label">Processes</span>
          <div class="check-grid" role="group" aria-labelledby="q-procs-label">
            ${capabilities.map((c) => `<label class="check"><input type="checkbox" name="process" value="${c.slug}"><span>${esc(c.short)}</span></label>`).join('')}
          </div>
        </div>
        <div class="field"><label for="q-finish">Finish or color <span class="opt">optional</span></label><input id="q-finish" name="finish" placeholder="e.g. Gloss black, RAL 9005"></div>
      </fieldset>
      <fieldset>
        <legend>Drawings</legend>
        <div class="drop" id="drop">
          ${icon.upload}
          <p><strong>Drop files here</strong> or <label for="q-files" class="link-label">browse</label></p>
          <p class="mono muted">STEP, DXF, DWG, PDF · up to ${t({ tbd: '25 MB' })} each</p>
          <input id="q-files" name="files" type="file" multiple accept=".step,.stp,.dxf,.dwg,.pdf,.igs,.iges,.sldprt">
        </div>
        <ul class="file-list" id="file-list"></ul>
        <div class="field"><label for="q-notes">Notes <span class="opt">optional</span></label><textarea id="q-notes" name="notes" rows="4" placeholder="Material, tolerances, packaging, anything else"></textarea></div>
      </fieldset>
      <button class="btn btn-primary btn-lg" type="submit">Send for quote</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
    <aside class="quote-side">
      <div class="panel stack">
        <h2 class="h4">What happens next</h2>
        <ol class="next">
          <li>An estimator reviews your drawings.</li>
          <li>We call if anything is unclear.</li>
          <li>You get a quote within ${t({ tbd: '__ business days' })}.</li>
        </ol>
      </div>
      <div class="panel stack">
        <h2 class="h4">Reach estimating</h2>
        <p class="mono">Phone <a href="tel:${company.phoneHref}">${company.phone}</a><br>Fax ${company.fax}<br>${t(company.email)}</p>
      </div>
    </aside>
  </div>
</section>
`,
});

// Factories, not results, so the build can track placeholders page by page.
export const pages = [
  home,
  capabilitiesPage,
  ...capabilities.map((c, i) => () => capabilityPage(c, i)),
  qualityPage,
  workPage,
  aboutPage,
  careersPage,
  quotePage,
];
