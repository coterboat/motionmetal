// Site content. Anything wrapped in tbd() is a placeholder the shop still needs
// to confirm; the build prints every one so nothing ships unfilled by accident.

export const tbd = (text) => ({ tbd: text });

export const company = {
  name: 'Motion Metalworks',
  legal: 'Motion Metalworks, LLC',
  since: 2005,
  sqft: '125,000',
  street: '604 South Main Street',
  city: 'Wrens',
  region: 'GA',
  zip: '30833',
  phone: '706.790.5009',
  phoneHref: '+17067905009',
  fax: '706.790.0945',
  hours: tbd('Hours: __ to __, Mon–Fri'),
  email: tbd('Estimating email'),
  maps: 'https://maps.google.com/maps?q=604%20South%20Main%20Street%2C%20Wrens%2C%20GA%2030833',
  social: {
    linkedin: 'https://www.linkedin.com/company/motion-metalworks-llc',
    facebook: 'https://www.facebook.com/Motion-Metalworks-LLC-289435781110600',
  },
};

// Order matters: it is the order a part usually moves through the plant.
export const capabilities = [
  {
    slug: 'fiber-laser',
    name: 'Fiber laser cutting',
    short: 'Fiber laser',
    group: 'Cutting',
    headline: '6,000 W fiber laser',
    blurb: 'Fast, clean cuts on sheet and plate, nested to keep scrap down.',
    intro:
      'Our 6,000 W fiber laser cuts flat blanks with clean edges and tight nesting. The blanks go straight to our press brakes, weld cells and powder line in the same building, so there is no second vendor and no extra freight.',
    points: [
      'High-speed cutting on thin and medium gauge sheet',
      'Nested layouts that reduce material waste',
      'Blanks move directly to forming and welding',
    ],
    specs: [
      ['Laser power', '6,000 W fiber'],
      ['Bed size', tbd('__ × __ in')],
      ['Mild steel, max', tbd('__ in')],
      ['Stainless, max', tbd('__ in')],
      ['Aluminum, max', tbd('__ in')],
      ['Typical tolerance', tbd('± __ in')],
      ['Files we take', 'DXF · DWG · STEP · PDF'],
    ],
    parts: ['brackets', 'enclosure-panels', 'gussets-plates', 'machine-guards'],
    pairs: ['press-brake', 'robotic-welding', 'powder-coat'],
  },
  {
    slug: 'waterjet',
    name: 'Waterjet cutting',
    short: 'Waterjet',
    group: 'Cutting',
    headline: 'Abrasive waterjet',
    blurb: 'Cold cutting for thick plate and heat-sensitive material.',
    intro:
      'Waterjet cutting uses a high-pressure stream of water and abrasive, so there is no heat-affected zone and no warping. We use it for thick plate and for materials a laser is not suited to.',
    points: [
      'No heat-affected zone',
      'Thick plate that is beyond the laser',
      'Non-metal materials such as gaskets and plastics',
    ],
    specs: [
      ['Bed size', tbd('__ × __ in')],
      ['Max thickness', tbd('__ in')],
      ['Typical tolerance', tbd('± __ in')],
      ['Materials', tbd('Steel, stainless, aluminum, ...')],
      ['Files we take', 'DXF · DWG · STEP · PDF'],
    ],
    parts: ['base-plates', 'flanges', 'gaskets', 'wear-plates'],
    pairs: ['fiber-laser', 'robotic-welding', 'assembly'],
  },
  {
    slug: 'press-brake',
    name: 'CNC press brake forming',
    short: 'CNC press brake',
    group: 'Forming',
    headline: 'CNC press brakes',
    blurb: 'Repeatable bends from programmed backgauges.',
    intro:
      'Our CNC press brakes form laser and waterjet blanks to your print. Programmed backgauges and saved bend programs keep a repeat order consistent from the first part to the last.',
    points: [
      'Saved programs for repeat part numbers',
      'First article checked before the run',
      'Formed parts go straight to welding or coating',
    ],
    specs: [
      ['Brakes', tbd('__ machines')],
      ['Capacity', tbd('__ ton')],
      ['Max bend length', tbd('__ ft')],
      ['Typical angle tolerance', tbd('± __°')],
    ],
    parts: ['channels-angles', 'enclosures', 'brackets', 'covers-doors'],
    pairs: ['fiber-laser', 'robotic-welding', 'powder-coat'],
  },
  {
    slug: 'tube-bending',
    name: 'CNC tube bending',
    short: 'CNC tube bending',
    group: 'Forming',
    headline: 'CNC tube bending',
    blurb: 'Tube bent to print and ready to fit in the weld cell.',
    intro:
      'We bend tube on CNC equipment so frames, rails and handles arrive at the weld cell ready to fit up. Bend data is stored, so repeat orders match the last run.',
    points: [
      'Multi-bend parts from a single setup',
      'Stored bend data for repeat orders',
      'Bent tube goes straight to welding and coating',
    ],
    specs: [
      ['Max OD', tbd('__ in')],
      ['Shapes', tbd('Round, square, ...')],
      ['Centerline radius range', tbd('__ – __ in')],
      ['Max length', tbd('__ ft')],
    ],
    parts: ['tube-frames', 'handrails', 'handles', 'roll-bars'],
    pairs: ['robotic-welding', 'powder-coat', 'assembly'],
  },
  {
    slug: 'robotic-welding',
    name: 'Robotic welding',
    short: 'Robotic welding',
    group: 'Joining',
    headline: 'Robotic weld cells',
    blurb: 'Consistent welds and short cycle times on production runs.',
    intro:
      'Robotic welding gives production runs the same weld on every part, with short cycle times. The fixtures that hold your parts are designed and built in our own shop.',
    points: [
      'The same weld, part after part',
      'Fixtures built in-house for your part',
      'Manual welding for prototypes and low volumes',
    ],
    specs: [
      ['Robotic cells', tbd('__')],
      ['Processes', tbd('MIG, ...')],
      ['Max part envelope', tbd('__ × __ × __ in')],
      ['Certified welders', tbd('AWS D1.1 — only if held')],
    ],
    parts: ['tube-frames', 'weldments', 'mounts', 'trailer-components'],
    pairs: ['tooling', 'powder-coat', 'assembly'],
  },
  {
    slug: 'powder-coat',
    name: 'Powder coating',
    short: 'Powder coat',
    group: 'Finishing',
    headline: 'Automated powder line',
    blurb: 'An automated 6-stage wash and powder line under the same roof.',
    intro:
      'Every part we fabricate can go through our automated 6-stage wash and powder coat system before it ships. Pretreatment is what makes powder last, so we never skip it.',
    points: [
      '6-stage automated wash and pretreatment',
      'A durable finish without an outside coater',
      'Parts ship finished, on one purchase order',
    ],
    specs: [
      ['Pretreatment', '6-stage automated wash'],
      ['Line', 'Automated conveyor'],
      ['Max part size', tbd('__ × __ × __ in')],
      ['Colors and textures', tbd('Stocked colors / RAL on request')],
      ['Coat customer-supplied parts?', tbd('Yes / No')],
    ],
    stages: [
      ['Clean', tbd('Alkaline clean')],
      ['Rinse', tbd('Fresh water')],
      ['Pretreat', tbd('Conversion coat')],
      ['Rinse', tbd('Fresh water')],
      ['Rinse', tbd('RO / DI rinse')],
      ['Seal', tbd('Seal rinse')],
    ],
    parts: ['enclosures', 'tube-frames', 'handrails', 'outdoor-equipment'],
    pairs: ['fiber-laser', 'robotic-welding', 'assembly'],
  },
  {
    slug: 'assembly',
    name: 'Assembly',
    short: 'Assembly',
    group: 'Assembly',
    headline: 'Assembly',
    blurb: 'Hardware, sub-assemblies and kits, ready for your line.',
    intro:
      'After coating, we can install hardware and build sub-assemblies, so parts reach your line ready to use instead of as a box of components.',
    points: [
      'Hardware insertion and fastening',
      'Sub-assemblies built to your work instructions',
      'Kitted and labeled to your part numbers',
    ],
    specs: [
      ['Services', tbd('Hardware, sub-assembly, kitting, ...')],
      ['Packaging', tbd('Your spec / returnable racks')],
    ],
    parts: ['sub-assemblies', 'kits', 'hardware-panels', 'finished-goods'],
    pairs: ['powder-coat', 'robotic-welding', 'tooling'],
  },
  {
    slug: 'tooling',
    name: 'Tools, jigs & fixtures',
    short: 'Tools, jigs & fixtures',
    group: 'Tooling',
    headline: 'Tools, jigs & fixtures',
    blurb: 'Fixtures designed and built in-house to hold your tolerances.',
    intro:
      'We design and build the jigs and fixtures that hold parts for welding and assembly. That control over our own tooling is how production tolerances stay put, and we can build fixtures for your shop floor too.',
    points: [
      'Weld fixtures for our robotic cells',
      'Assembly and inspection fixtures',
      'Fixtures built for customer shop floors',
    ],
    specs: [
      ['Design', tbd('In-house CAD — SolidWorks?')],
      ['Verification', 'Faro Arm portable CMM'],
    ],
    parts: ['weld-fixtures', 'check-fixtures', 'assembly-jigs', 'shop-tooling'],
    pairs: ['robotic-welding', 'assembly', 'fiber-laser'],
  },
];

export const capBySlug = Object.fromEntries(capabilities.map((c) => [c.slug, c]));

// "How a job moves" on the home page. A real sequence, so it is numbered.
export const flow = [
  ['Quote', 'Send drawings; an estimator reviews them.'],
  ['Cut', 'Fiber laser or waterjet.'],
  ['Form', 'CNC press brake and tube bending.'],
  ['Weld', 'Robotic cells and manual welding.'],
  ['Inspect', 'Faro Arm and Virtek 3D scanner.'],
  ['Coat', '6-stage wash, then powder.'],
  ['Assemble', 'Hardware, sub-assemblies, kits.'],
  ['Ship', 'Finished parts on one PO.'],
];

export const quality = [
  {
    name: 'Faro Arm',
    role: 'Portable CMM',
    text: 'Measures first articles and weldments in 3D against your model, at the part instead of in a lab.',
  },
  {
    name: 'Virtek 3D laser scanner',
    role: 'Laser projection and scanning',
    text: 'Projects and checks feature locations on large parts so layout and fit-up match the drawing.',
  },
  {
    name: tbd('Certification'),
    role: tbd('ISO 9001 / AWS — only if held'),
    text: tbd('Scope of the certificate and the registrar.'),
  },
  {
    name: tbd('On-time delivery'),
    role: tbd('Trailing 12 months'),
    text: tbd('Publish the real number once it is tracked.'),
  },
];

// The parts catalog. One list feeds both the Work page (filterable by
// capability) and each capability page's "typical parts", so they can't
// disagree. `caps` is every process the part goes through, in any order;
// `finish` is the powder coat shown in its illustration ('raw' = bare steel).
export const parts = [
  { slug: 'brackets', name: 'Brackets', caps: ['fiber-laser', 'press-brake'], finish: 'raw' },
  { slug: 'enclosure-panels', name: 'Enclosure panels', caps: ['fiber-laser', 'press-brake', 'assembly'], finish: 'raw' },
  { slug: 'gussets-plates', name: 'Gussets and plates', caps: ['fiber-laser', 'robotic-welding'], finish: 'raw' },
  { slug: 'machine-guards', name: 'Machine guards', caps: ['fiber-laser', 'press-brake'], finish: 'raw' },
  { slug: 'base-plates', name: 'Thick base plates', caps: ['waterjet'], finish: 'raw' },
  { slug: 'flanges', name: 'Flanges', caps: ['waterjet', 'fiber-laser'], finish: 'raw' },
  { slug: 'gaskets', name: 'Gaskets', caps: ['waterjet'], finish: 'raw' },
  { slug: 'wear-plates', name: 'Wear plates', caps: ['waterjet'], finish: 'raw' },
  { slug: 'channels-angles', name: 'Channels and angles', caps: ['fiber-laser', 'press-brake'], finish: 'raw' },
  { slug: 'enclosures', name: 'Enclosures', caps: ['fiber-laser', 'press-brake', 'robotic-welding', 'powder-coat', 'assembly'], finish: 'orange' },
  { slug: 'covers-doors', name: 'Covers and doors', caps: ['fiber-laser', 'press-brake'], finish: 'raw' },
  { slug: 'tube-frames', name: 'Tube frames', caps: ['tube-bending', 'robotic-welding', 'powder-coat'], finish: 'black' },
  { slug: 'handrails', name: 'Handrails', caps: ['tube-bending', 'robotic-welding', 'powder-coat'], finish: 'yellow' },
  { slug: 'handles', name: 'Handles', caps: ['tube-bending'], finish: 'raw' },
  { slug: 'roll-bars', name: 'Roll bars', caps: ['tube-bending', 'robotic-welding'], finish: 'raw' },
  { slug: 'weldments', name: 'Weldments', caps: ['fiber-laser', 'robotic-welding'], finish: 'raw' },
  { slug: 'mounts', name: 'Brackets and mounts', caps: ['fiber-laser', 'press-brake', 'robotic-welding'], finish: 'raw' },
  { slug: 'trailer-components', name: 'Trailer components', caps: ['fiber-laser', 'robotic-welding', 'powder-coat'], finish: 'black' },
  { slug: 'outdoor-equipment', name: 'Outdoor equipment', caps: ['fiber-laser', 'press-brake', 'tube-bending', 'robotic-welding', 'powder-coat', 'assembly'], finish: 'green' },
  { slug: 'sub-assemblies', name: 'Sub-assemblies', caps: ['fiber-laser', 'press-brake', 'powder-coat', 'assembly'], finish: 'blue' },
  { slug: 'kits', name: 'Kits', caps: ['fiber-laser', 'assembly'], finish: 'raw' },
  { slug: 'hardware-panels', name: 'Hardware-installed panels', caps: ['fiber-laser', 'assembly'], finish: 'raw' },
  { slug: 'finished-goods', name: 'Finished goods', caps: ['press-brake', 'powder-coat', 'assembly'], finish: 'orange' },
  { slug: 'weld-fixtures', name: 'Weld fixtures', caps: ['tooling', 'fiber-laser', 'robotic-welding'], finish: 'raw' },
  { slug: 'check-fixtures', name: 'Check fixtures', caps: ['tooling', 'fiber-laser'], finish: 'raw' },
  { slug: 'assembly-jigs', name: 'Assembly jigs', caps: ['tooling', 'assembly'], finish: 'raw' },
  { slug: 'shop-tooling', name: 'Shop tooling', caps: ['tooling'], finish: 'raw' },
];

export const partBySlug = Object.fromEntries(parts.map((p) => [p.slug, p]));

// Catch mismatches at build time instead of on the live site.
for (const c of capabilities) {
  for (const slug of c.parts) {
    const p = partBySlug[slug];
    if (!p) throw new Error(`${c.slug}: unknown part "${slug}"`);
    if (!p.caps.includes(c.slug)) throw new Error(`${c.slug} lists "${slug}", but that part is not tagged ${c.slug}`);
  }
}
for (const p of parts) {
  for (const cap of p.caps) if (!capBySlug[cap]) throw new Error(`${p.slug}: unknown capability "${cap}"`);
  if (p.finish !== 'raw' && !p.caps.includes('powder-coat')) throw new Error(`${p.slug} is coated but not tagged powder-coat`);
}

export const roles = [
  { title: tbd('Robotic weld cell operator'), shift: tbd('1st shift'), type: 'Full time' },
  { title: tbd('Press brake operator'), shift: tbd('1st shift'), type: 'Full time' },
  { title: tbd('Powder line technician'), shift: tbd('2nd shift'), type: 'Full time' },
];
