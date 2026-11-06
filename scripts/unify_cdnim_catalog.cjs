const fs = require('fs');
const path = require('path');

const fragrancesPath = path.join(__dirname, '../src/data/fragrances.json');
let fragrances = JSON.parse(fs.readFileSync(fragrancesPath, 'utf-8'));

console.log(`Initial catalog count: ${fragrances.length}`);

// Remove old duplicate temporary scrape IDs
const idsToRemove = new Set([
  'st-9123',
  'apex-armaf-clubdenuitlimitededition',
  'apex-armaf-clubdenuitintensepp',
  'st-9122',
  'st-9131',
  'st-9128',
  'armaf-precieux-i'
]);
fragrances = fragrances.filter(f => !idsToRemove.has(f.id));

// 1. Update armaf-club-de-nuit-intense-man (EDT)
const edt = fragrances.find(f => f.id === 'armaf-club-de-nuit-intense-man');
if (edt) {
  edt.name = 'Club de Nuit Intense Man';
  edt.concentration = 'Eau de Toilette';
  edt.bottle_size = '105ml';
  edt.fragrantica_url = 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Intense-Man-34688.html';
  edt.aliases = [
    'Club de Nuit Intense Man EDT',
    'Club de Nuit Intense Man EDT 105ml',
    'Armaf Club de Nuit Intense Man EDT 105ml',
    'st-9121',
    'CDNIM',
    'CDNIM EDT',
    'CDNIM 105ml',
    'CDNIM Man',
    'Club de Nuit Intense Man (CDNIM)',
    'Armaf CDNIM EDT'
  ];
}

// 2. Add / Update armaf-club-de-nuit-intense-man-eau-de-parfum (EDP 200ml)
let edp = fragrances.find(f => f.id === 'armaf-club-de-nuit-intense-man-eau-de-parfum');
if (!edp) {
  edp = {
    id: 'armaf-club-de-nuit-intense-man-eau-de-parfum',
    name: 'Club de Nuit Intense Man Eau de Parfum',
    brand: 'Armaf',
    collection: 'Club de Nuit',
    rating_value: 4.31,
    rating_count: 5200,
    gender: 'Men',
    release_year: 2020,
    concentration: 'Eau de Parfum',
    bottle_size: '200ml',
    fragrantica_url: 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Intense-Man-Eau-de-Parfum-64677.html',
    primary_season: 'Spring',
    dna_inspiration: 'Creed Aventus',
    dna_type: 'Smoky Birch Pineapple Bergamot Blackcurrant Oakmoss (Smooth EDP)',
    similarity_percentage: 93,
    accords: [
      { name: 'Citrus', score: 100, color: '#eab308' },
      { name: 'Fruity', score: 92, color: '#f97316' },
      { name: 'Smoky / Birch', score: 88, color: '#475569' },
      { name: 'Leather', score: 78, color: '#78350f' },
      { name: 'Woody', score: 82, color: '#166534' }
    ],
    notes: {
      top: ['Lemon', 'Pineapple', 'Bergamot', 'Blackcurrant', 'Apple'],
      middle: ['Birch', 'Jasmine', 'Rose'],
      base: ['Musk', 'Ambergris', 'Patchouli', 'Vanilla']
    },
    seasons: { spring: 35, summer: 32, fall: 25, winter: 8 },
    day_night: { day: 60, night: 40 },
    longevity: 'Eternal (10+ hrs)',
    sillage: 'Strong (Heavy Projection)',
    review_summary: {
      pros: [
        'Much smoother opening than the EDT, without the harsh lemon pledge vibe',
        'Exceptional 200ml value for money',
        'Smoky pineapple and birch drydown projects for 10+ hours'
      ],
      cons: [
        'Heavier 200ml bottle is bulky for travel'
      ],
      community_verdict: 'The sweet spot concentration for daily wear: smoother than EDT, cheaper per ml than Pure Parfum.',
      top_reviewer_quotes: [
        '200ml of pure compliments. Way smoother in the opening than the original 105ml EDT.'
      ]
    },
    aliases: [
      'CDNIM EDP',
      'CDNIM EDP 200 ML',
      'CDNIM EDP 200ml',
      'Club de nuit intense EDP 200ml',
      'Club de nuit intense EDP 250ml',
      'CDNIM EDP 200ML (open box)',
      'Armaf Club de Nuit Intense Man EDP',
      'Club de Nuit Intense Man EDP 200ml',
      'Armaf CDNIM EDP'
    ]
  };
  fragrances.push(edp);
} else {
  edp.name = 'Club de Nuit Intense Man Eau de Parfum';
  edp.concentration = 'Eau de Parfum';
  edp.bottle_size = '200ml';
  edp.fragrantica_url = 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Intense-Man-Eau-de-Parfum-64677.html';
  edp.aliases = [
    'CDNIM EDP',
    'CDNIM EDP 200 ML',
    'CDNIM EDP 200ml',
    'Club de nuit intense EDP 200ml',
    'Club de nuit intense EDP 250ml',
    'CDNIM EDP 200ML (open box)',
    'Armaf Club de Nuit Intense Man EDP',
    'Club de Nuit Intense Man EDP 200ml',
    'Armaf CDNIM EDP'
  ];
}

// 3. Update armaf-club-de-nuit-intense-man-pure-parfum (Pure Parfum 150ml)
let pp = fragrances.find(f => f.id === 'armaf-club-de-nuit-intense-man-pure-parfum');
if (pp) {
  pp.name = 'Club de Nuit Intense Man Parfum';
  pp.concentration = 'Pure Parfum';
  pp.bottle_size = '150ml';
  pp.fragrantica_url = 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Intense-Man-Parfum-77873.html';
  pp.aliases = [
    'Club de Nuit Intense Man Pure Parfum',
    'Club de Nuit Intense Man Pure Parfum 150ml',
    'CDNIM PP',
    'CDNIM PP 150 ML',
    'CDNIM Pure Parfum',
    'Club de nuit intense PP 150ml',
    'Club de nuit intense PP',
    'Armaf CDNIM Pure Parfum',
    'apex-armaf-clubdenuitintensepp'
  ];
}

// 4. Add / Update armaf-club-de-nuit-intense-man-limited-edition-parfum (LE 105ml)
let le = fragrances.find(f => f.id === 'armaf-club-de-nuit-intense-man-limited-edition-parfum');
if (!le) {
  le = {
    id: 'armaf-club-de-nuit-intense-man-limited-edition-parfum',
    name: 'Club de Nuit Intense Man Limited Edition Parfum',
    brand: 'Armaf',
    collection: 'Club de Nuit',
    rating_value: 4.48,
    rating_count: 4800,
    gender: 'Men',
    release_year: 2021,
    concentration: 'Parfum',
    bottle_size: '105ml',
    fragrantica_url: 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Intense-Man-Limited-Edition-Parfum-68271.html',
    primary_season: 'All Seasons',
    dna_inspiration: 'Creed Aventus',
    dna_type: 'Smoky Birch Pineapple Pink Pepper Ambroxan Leather (Collector Edition)',
    similarity_percentage: 95,
    accords: [
      { name: 'Citrus', score: 100, color: '#eab308' },
      { name: 'Fruity', score: 94, color: '#f97316' },
      { name: 'Smoky / Birch', score: 90, color: '#475569' },
      { name: 'Ambroxan / Amber', score: 85, color: '#b45309' },
      { name: 'Leather', score: 80, color: '#78350f' }
    ],
    notes: {
      top: ['Lemon', 'Pineapple', 'Lime', 'Black Pepper', 'Bergamot', 'Pink Pepper'],
      middle: ['Jasmine', 'Rose', 'Lily-of-the-Valley', 'Freesia'],
      base: ['Ambroxan', 'White Musk', 'Ambergris', 'Cedar', 'Leather', 'Patchouli']
    },
    seasons: { spring: 35, summer: 30, fall: 25, winter: 10 },
    day_night: { day: 55, night: 45 },
    longevity: 'Eternal (12+ hrs)',
    sillage: 'Enormous (Room Filler)',
    review_summary: {
      pros: [
        'The undisputed king of the CDNIM lineup in blend quality and presentation',
        'Sublime opening with pink pepper and lime replacing harsh synthetic lemon',
        'Gorgeous collector presentation box with certificate'
      ],
      cons: [
        'Higher price point than standard EDT/EDP'
      ],
      community_verdict: 'If you want the closest and most refined Aventus experience without spending niche money, this is it.',
      top_reviewer_quotes: [
        'The best version of CDNIM. Smooth, rich, smoky, and lasts all day.'
      ]
    },
    aliases: [
      'CDNIM Limited Edition',
      'Club de nuit Limited Edition',
      'Club de Nuit Intense Man LIMITED EDITION',
      'CDNIM LE',
      'Armaf CDNIM Limited Edition',
      'st-9123',
      'apex-armaf-clubdenuitlimitededition'
    ]
  };
  fragrances.push(le);
} else {
  le.name = 'Club de Nuit Intense Man Limited Edition Parfum';
  le.concentration = 'Parfum';
  le.bottle_size = '105ml';
  le.fragrantica_url = 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Intense-Man-Limited-Edition-Parfum-68271.html';
  le.aliases = [
    'CDNIM Limited Edition',
    'Club de nuit Limited Edition',
    'Club de Nuit Intense Man LIMITED EDITION',
    'CDNIM LE',
    'Armaf CDNIM Limited Edition',
    'st-9123',
    'apex-armaf-clubdenuitlimitededition'
  ];
}

// 5. Update armaf-club-de-nuit-urban-man-elixir
let urban = fragrances.find(f => f.id === 'armaf-club-de-nuit-urban-elixir' || f.id === 'armaf-club-de-nuit-urban-man-elixir');
if (urban) {
  urban.id = 'armaf-club-de-nuit-urban-man-elixir';
  urban.name = 'Club de Nuit Urban Man Elixir';
  urban.concentration = 'Eau de Parfum';
  urban.bottle_size = '105ml';
  urban.fragrantica_url = 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Urban-Man-Elixir-77876.html';
  urban.aliases = [
    'Urban Man Elixir',
    'CDN Urban Man Elixir',
    'Club de nuit Urban Man Elixir',
    'Club de nuit Urban Man Elixir 200ml',
    'Armaf Urban Man Elixir',
    'st-9128'
  ];
}

// 6. Update armaf-club-de-nuit-oud
let oud = fragrances.find(f => f.id === 'armaf-club-de-nuit-oud');
if (oud) {
  oud.name = 'Club de Nuit Oud';
  oud.concentration = 'Parfum';
  oud.bottle_size = '105ml';
  oud.fragrantica_url = 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Oud-88185.html';
  oud.aliases = [
    'CDN Oud I - Collectors Pride',
    'CDN Oud',
    "Club de Nuit Oud (A Collector's Pride)",
    'Club de Nuit Oud',
    'Club de nuit Oud 105ml',
    'Club de Nuit OUD',
    'st-9122'
  ];
}

// 7. Update armaf-club-de-nuit-iconic
let iconic = fragrances.find(f => f.id === 'armaf-club-de-nuit-iconic');
if (iconic) {
  iconic.name = 'Club de Nuit Blue Iconic';
  iconic.concentration = 'Eau de Parfum';
  iconic.bottle_size = '105ml';
  iconic.fragrantica_url = 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Blue-Iconic-77874.html';
  iconic.aliases = [
    'CDNI Iconic',
    'CDNIM Iconic',
    'Club De Nuit Iconic',
    'Club de nuit Iconic',
    'CDN ICONIC',
    'CDN ICONIC Extrait',
    'st-9131'
  ];
}

// 8. Update armaf-club-de-nuit-precieux-1
let precieux = fragrances.find(f => f.id === 'armaf-club-de-nuit-precieux-1');
if (precieux) {
  precieux.name = 'Club de Nuit Précieux 1';
  precieux.concentration = 'Extrait de Parfum';
  precieux.bottle_size = '55ml';
  precieux.fragrantica_url = 'https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Precieux-1-93108.html';
  precieux.aliases = [
    'Precieux I',
    'Club de Nuit Precieux I',
    'Armaf Precieux I',
    'armaf-precieux-i'
  ];
}

fs.writeFileSync(fragrancesPath, JSON.stringify(fragrances, null, 2), 'utf-8');
console.log(`Updated catalog count: ${fragrances.length}`);
console.log('CDNIM catalog line successfully unified with canonical Fragrantica identities!');
