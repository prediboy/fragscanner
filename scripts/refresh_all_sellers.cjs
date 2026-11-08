const https = require("https");
const fs = require("fs");
const path = require("path");

// Auto-load .env if environment variables are not set in the shell
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const { enrichAndAddPerfume } = require("./fragrantica_enricher.cjs");

function getAlternateGoogleSheetUrl(url) {
  if (!url || !url.includes("docs.google.com/spreadsheets/d/")) return null;
  if (url.includes("/gviz/tq")) {
    return url.replace(/\/gviz\/tq\?tqx=out:csv/, "/export?format=csv");
  } else if (url.includes("/export?format=csv")) {
    return url.replace(/\/export\?format=csv/, "/gviz/tq?tqx=out:csv");
  }
  return null;
}

async function fetchUrl(url, timeoutMs = 10000, maxRetries = 3) {
  let targetUrl = url;
  const altUrl = getAlternateGoogleSheetUrl(url);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/csv,application/xhtml+xml,text/html;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache"
        },
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (res.status === 429 || res.status === 403 || res.status === 503) {
        console.warn(`  [HTTP ${res.status}] Throttled/Blocked on attempt ${attempt} for ${targetUrl}`);
        if (altUrl && targetUrl !== altUrl) {
          console.log(`  ↳ Swapping to alternate Google Sheets endpoint: ${altUrl}`);
          targetUrl = altUrl;
        }
        await new Promise(r => setTimeout(r, 2000 * attempt));
        continue;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${targetUrl}`);
      const text = await res.text();
      if (!text || text.length < 5) throw new Error("Received empty response payload");
      return text;
    } catch (e) {
      console.warn(`  ↳ Attempt ${attempt} failed for ${targetUrl}: ${e.message}`);
      if (altUrl && targetUrl !== altUrl) {
        console.log(`  ↳ Swapping to alternate Google Sheets endpoint: ${altUrl}`);
        targetUrl = altUrl;
      }
      if (attempt === maxRetries) throw e;
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (const line of lines) {
    const row = [];
    let insideQuote = false;
    let entry = "";
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (c === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = "";
      } else {
        entry += c;
      }
    }
    row.push(entry.trim());
    rows.push(row);
  }
  return rows;
}

const DESIGNER_EXCLUDES = [
  "chanel", "chan*l", "dior", "yves saint laurent", "ysl", "gucci", "prada", "versace",
  "guerlain", "givenchy", "hermes", "tom ford", "armani", "giorgio armani",
  "emporio armani", "dolce & gabbana", "dolce", "d&g", "burberry", "valentino", "hugo boss",
  "hugo", "ralph lauren", "calvin klein", "viktor & rolf", "narciso rodriguez",
  "jean paul gaultier", "jpg", "creed", "parfums de marly", "xerjoff", "roja",
  "amouage", "kilian", "byredo", "diptyque", "le labo", "maison francis kurkdjian",
  "mfk", "nishane", "sospiro", "montale", "mancera", "chopard", "kenzo"
];

function isDesigner(brandOrName) {
  const s = (brandOrName || "").toLowerCase().trim();
  return DESIGNER_EXCLUDES.some(d => s === d || s.includes(` ${d} `) || s.startsWith(`${d} `) || s.endsWith(` ${d}`) || s === `${d}`);
}

const canonicalBrands = {
  'afnan': 'Afnan', 'ahmed al maghribi': 'Ahmed Al Maghribi', 'ahmed': 'Ahmed Al Maghribi',
  'ajmal': 'Ajmal', 'al hambra': 'Maison Alhambra', 'maison al hambra': 'Maison Alhambra',
  'maison alhambra': 'Maison Alhambra', 'alhambra': 'Maison Alhambra',
  'al haramain': 'Al Haramain', 'al majed oud': 'Al Majed Oud',
  'al rehab': 'Al Rehab', 'al wataniah': 'Al Wataniah', 'albait aldimashqi': 'Albait Aldimashqi',
  'anfar': 'Anfar', 'arabiyat': 'Arabiyat', 'arabiyat prestige': 'Arabiyat Prestige',
  'arabiat prestige': 'Arabiyat Prestige', 'ard al zaafaran': 'Ard Al Zaafaran',
  'ard al zafran': 'Ard Al Zaafaran', 'armaf': 'Armaf', 'aromatix': 'French Avenue',
  'assaf': 'Assaf', 'parisbelle': 'Parisbelle', 'dumont': 'Dumont',
  'fragrance world': 'Fragrance World', 'french avenue': 'French Avenue', 'gissah': 'Gissah',
  'ibraq': 'Ibraq', 'ibraheem al qurashi': 'Ibrahim Al Qureshi', 'ibrahim al qureshi': 'Ibrahim Al Qureshi',
  'khadlaj': 'Khadlaj', 'lalique': 'Lalique', 'lattafa': 'Lattafa', 'laverne': 'Laverne',
  'maison asrar': 'Maison Asrar', 'mykonos': 'Mykonos', 'naseem': 'Naseem', 'nusuk': 'Nusuk',
  'paris corner': 'Paris Corner', 'rasasi': 'Rasasi', 'rayhaan': 'Rayhaan',
  'reef': 'Reef', 'reef33': 'Reef', 'riiffs': 'Riiffs', 'riifs': 'Riiffs', 'riffs': 'Riiffs',
  'rue broca': 'Rue Broca', 'swiss arabian': 'Swiss Arabian', 'titan skinn': 'Titan Skinn',
  'skinn by titan': 'Titan Skinn', 'zimaya': 'Zimaya', 'bujairami': 'Bujairami', 'dkhoon': 'Dkhoon',
  'surrati': 'Surrati'
};

function normalizeBrand(raw) {
  const l = (raw || "").toLowerCase().trim();
  return canonicalBrands[l] || raw.trim();
}

function cleanStr(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/9:00\s*pm/gi, "9pm")
    .replace(/shaikh/gi, "sheikh")
    .replace(/immortel/gi, "immortal")
    .replace(/[^a-z0-9]/g, "");
}

function extractBottleMetadata(brandRaw, nameRaw, defaultCatalogSize) {
  const brand = (brandRaw || "").trim();
  const name = (nameRaw || "").trim();
  const full = `${brand} ${name}`;

  // 1. Explicit ML extraction (e.g., 100ml, 100 ml, 100-ml, 100m.l.)
  const mlMatch = name.match(/\b(\d+(?:\.\d+)?)\s*(?:-|\s*)?(ml|m\.l\.)\b/i) || brand.match(/\b(\d+(?:\.\d+)?)\s*(?:-|\s*)?(ml|m\.l\.)\b/i);

  // 2. Fluid Ounce extraction (e.g., 3.4 oz, 3.4 fl oz)
  const ozMatch = name.match(/\b(\d+(?:\.\d+)?)\s*(?:fl\.?\s*oz\.?|oz\.?)\b/i);

  // 3. Modifier flags
  const isMini = /\b(mini|sample|travel|pocket|roller|roll\s*on|vial)\b/i.test(full);
  const isTester = /\btester\b/i.test(full);
  const isPartial = /\bpartial\b/i.test(full);

  let volume = null;
  let hasExplicitVolume = false;

  if (mlMatch) {
    volume = parseInt(mlMatch[1], 10);
    hasExplicitVolume = true;
  } else if (ozMatch) {
    volume = Math.round(parseFloat(ozMatch[1]) * 29.5735);
    hasExplicitVolume = true;
  } else if (/tobacco jam\s*60\b/i.test(name)) {
    volume = 60;
    hasExplicitVolume = true;
  } else if (/tobacco jam\s*50\b/i.test(name)) {
    volume = 50;
    hasExplicitVolume = true;
  } else if (defaultCatalogSize && /\b\d+\s*ml\b/i.test(defaultCatalogSize)) {
    volume = parseInt(defaultCatalogSize, 10) || null;
    hasExplicitVolume = !!volume;
  } else {
    // Brand/model known exact defaults when omitted by seller
    const bLower = brand.toLowerCase();
    const nLower = name.toLowerCase();

    if (bLower.includes("armaf") && nLower.includes("club de nuit") && !nLower.includes("pure parfum") && !nLower.includes("200")) {
      volume = 105;
      hasExplicitVolume = true;
    } else if (nLower.includes("wild colt") && !nLower.includes("150")) {
      volume = 200;
      hasExplicitVolume = true;
    } else if (bLower === "mykonos") {
      volume = 50;
      hasExplicitVolume = true;
    } else if (nLower.includes("sauvage elixir")) {
      volume = 60;
      hasExplicitVolume = true;
    } else {
      volume = 100;
      hasExplicitVolume = false; // Not explicitly mentioned on the bottle/listing
    }
  }

  // Human-readable size label:
  // If ml is mentioned on the bottle, explicitly include it (e.g. "100ml Retail Bottle", "50ml Retail Bottle").
  // Else, if not mentioned, it's fine without ml (e.g. "Retail Bottle", "Tester").
  let label = "";
  if (hasExplicitVolume && volume) {
    if (isMini || volume <= 20) {
      label = `${volume}ml Mini`;
    } else if (isPartial) {
      label = `${volume}ml Partial`;
    } else if (isTester) {
      label = `${volume}ml Tester`;
    } else {
      label = `${volume}ml Retail Bottle`;
    }
  } else {
    if (isMini) {
      label = `Mini Bottle`;
    } else if (isPartial) {
      label = `Partial Bottle`;
    } else if (isTester) {
      label = `Tester Bottle`;
    } else {
      label = `Retail Bottle`;
    }
  }

  return { volume: volume || 100, label, isMini, isTester, isPartial, hasExplicitVolume };
}

async function runMasterRefresh() {
  console.log("=========================================================");
  console.log("🚀 MASTER REFRESH: ALL 6 COMMUNITY SELLERS & RESOURCES");
  console.log("=========================================================");

  const fragrancesPath = path.join(__dirname, "../data/fragrances.json");
  const sellerConfigPath = path.join(__dirname, "../data/seller_config.json");
  const syncMetaPath = path.join(__dirname, "../data/sync_meta.json");

  // Initialize Supabase client
  let supabase = null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (err) {
    console.warn("  Supabase init warning:", err.message);
  }

  // Load catalog directly from Supabase (fallback to local if present)
  let fragrances = [];
  if (supabase) {
    let page = 0;
    while (true) {
      const { data, error } = await supabase
        .from('fragrances')
        .select('*')
        .range(page * 1000, (page + 1) * 1000 - 1);
      if (error || !data || data.length === 0) break;
      fragrances.push(...data);
      if (data.length < 1000) break;
      page++;
    }
    console.log(`Loaded ${fragrances.length} catalog fragrances live from Supabase.`);
  }

  if (fragrances.length === 0 && fs.existsSync(fragrancesPath)) {
    fragrances = JSON.parse(fs.readFileSync(fragrancesPath, "utf-8"));
    console.log(`Loaded ${fragrances.length} catalog fragrances from local fallback.`);
  }

  // Backup existing quotes & price snapshots to capture price history with dates
  const existingQuotes = {};
  const previousSnapshots = {};
  fragrances.forEach(f => {
    previousSnapshots[f.id] = {
      community_price: f.community_price ? Number(f.community_price) : null,
      in_seller_stock: Boolean(f.in_seller_stock),
      bottle_size: f.community_bottle_size || null,
      previous_price: f.previous_price || null,
      previous_price_date: f.previous_price_date || null,
      price_date: f.price_date || null,
      price_history: Array.isArray(f.price_history) ? f.price_history : [],
      sellers: f.community_sellers || []
    };
    existingQuotes[f.id] = {
      sellers: (f.community_sellers || []).filter(s => {
        const vol = s.volume_ml || parseInt(s.size, 10);
        const url = (s.product_url || '').toLowerCase();
        const size = (s.size || '').toLowerCase();
        const isNonPerfume = /\b(deo|deodorant|body[\s_-]*spray|body[\s_-]*mist|hair[\s_-]*mist|shower[\s_-]*gel|lotion|roll[\s_-]*on|after[\s_-]*shave)\b/i.test(url) ||
          /\b(deo|deodorant|body[\s_-]*spray|body[\s_-]*mist|hair[\s_-]*mist|shower[\s_-]*gel|lotion|roll[\s_-]*on|after[\s_-]*shave)\b/i.test(size);
        return !isNonPerfume && !url.includes('decant-set') && !url.includes('/decant') && !size.includes('vial') && (!vol || vol >= 14);
      }),
      decants: (f.community_decants || []).map(d => {
        if (d.seller_id === 'liquid_emotions') {
          return { ...d, seller_id: 'enigma_perfumes', seller_name: 'Enigma Perfumes' };
        }
        return d;
      })
    };
    f.community_sellers = [];
    f.community_decants = [];
    f.decant_comparison = null;
    f.in_seller_stock = false;
    f.community_price = null;
    f.lowest_seller = null;
    f.lowest_decant_seller = null;
    f.community_seller_name = null;
    f.community_whatsapp = null;
    f.has_decants = false;
    f.lowest_decant_price = null;
  });

  // 1. UPDATE seller_config.json
  const sellersList = [
    {
      id: "second_theory",
      seller_name: "Second Theory",
      type: "bottle",
      sheet_url: "https://docs.google.com/spreadsheets/d/1IoMk77atuzWEX9QibVPzmTruazspYZQ24sXeRmmne90/gviz/tq?tqx=out:csv",
      whatsapp: "8076851481",
      shipping: "Free Pan-India Delivery (Extra ₹70 for NE, J&K)",
      dispatch: "24-48 hrs",
      brand_col: 0,
      product_col: 1,
      price_col: 2,
      hot_col: 3
    },
    {
      id: "fragfever",
      seller_name: "FragFever",
      type: "bottle",
      sheet_url: "https://docs.google.com/spreadsheets/d/13kMrUoW_AHXEkqeTqOCri1szqmh1b1D8T5tPBtZFDfw/gviz/tq?tqx=out:csv&gid=0",
      whatsapp: "9716764787",
      shipping: "Free Regular Courier (Extra ₹50 for Blue Dart / Remote)",
      dispatch: "24-48 hrs",
      brand_col: 0,
      product_col: 1,
      price_col: 2,
      hot_col: -1
    },
    {
      id: "apex_aroma",
      seller_name: "Apex Aroma",
      type: "bottle",
      sheet_url: "https://docs.google.com/spreadsheets/d/1JDLgpguWyg2gblX3uOw1naWTVbwWPta4rqYFG5xHsos/export?format=csv&gid=1236708900",
      whatsapp: "9456411103",
      alt_whatsapp: "8279794497",
      shipping: "Free Pan-India Delivery (Extra ₹60 for J&K, NE)",
      dispatch: "24-48 hrs",
      brand_col: 0,
      product_col: 1,
      price_col: 2,
      inspired_col: 3,
      hot_col: -1,
      start_row: 9
    },
    {
      id: "enigma_perfumes",
      seller_name: "Enigma Perfumes",
      type: "decant_and_bottle",
      sheet_url: "https://docs.google.com/spreadsheets/d/14sQZhYjsWjZtAkZhFRgzq0rfzn1wKXqiVOMhwk6ks0E/gviz/tq?tqx=out:csv&gid=0",
      decant_url: "https://liquidemotions.vercel.app/",
      whatsapp: "7982410620",
      shipping: "Free Pan-India Delivery on orders above ₹1,200",
      dispatch: "24-48 hrs",
      decant_sizes: ["5ml", "10ml", "20ml", "30ml"],
      type_col: 0,
      brand_col: 1,
      product_col: 2,
      size_col: 3,
      price_col: 4,
      hot_col: -1,
      start_row: 1
    },
    {
      id: "rp_decants",
      seller_name: "RP Decants",
      type: "decant",
      sheet_url: "https://docs.google.com/spreadsheets/d/1Ti2RE9J1EuHCk6hvsWmxJyD121swkybci_BbmjAYkRQ/gviz/tq?tqx=out:csv&gid=2020759273",
      whatsapp: "9016445533",
      whatsapp_group: "https://chat.whatsapp.com/KcjUpP8RKXu98XNc7pv6Om",
      shipping: "₹90 Pan-India (Free above ₹1,200)",
      dispatch: "3-4 days",
      decant_sizes: ["2ml", "5ml", "10ml"]
    },
    {
      id: "gryv_scents",
      seller_name: "GRYV Scents",
      type: "decant_and_bottle",
      sheet_url_retail: "https://docs.google.com/spreadsheets/d/1IrMWUtwKIeKWY-f_z1JXO7Wp2nX2pSwEGCl7A2qtVgE/gviz/tq?tqx=out:csv&gid=816101257",
      sheet_url_decants: "https://docs.google.com/spreadsheets/d/1IrMWUtwKIeKWY-f_z1JXO7Wp2nX2pSwEGCl7A2qtVgE/gviz/tq?tqx=out:csv&gid=592974531",
      whatsapp: "6304654406",
      shipping: "Pan-India ₹100 (Free above ₹1,500 on 3+ decants)",
      dispatch: "2-3 days",
      decant_sizes: ["3ml", "5ml", "8ml", "10ml", "20ml", "30ml"]
    },
    {
      id: "bluewings",
      seller_name: "Blue Wings Fragrances",
      type: "decant_and_bottle",
      url: "https://bluewingsfnd.com/",
      whatsapp: "9899401419",
      shipping: "Free Pan-India Delivery on orders above ₹1,500",
      dispatch: "24-48 hrs",
      decant_sizes: ["5ml", "10ml", "20ml", "30ml"]
    },
    {
      id: "whiffculture",
      seller_name: "Whiff Culture",
      type: "decant_and_bottle",
      url: "https://www.whiffculture.com",
      whatsapp: "9811377357",
      shipping: "Free Pan-India Delivery on orders above ₹1,499",
      dispatch: "24-48 hrs",
      decant_sizes: ["5ml", "8ml", "10ml", "30ml"]
    },
    {
      id: "aar_fragrances",
      seller_name: "AAR Fragrances",
      type: "bottle",
      url: "https://www.aarfragrances.com/category/middle-east-collection",
      whatsapp: "9873520545",
      shipping: "Pan-India Shipping",
      dispatch: "24-48 hrs"
    },
    {
      id: "sovereign_scents",
      seller_name: "Sovereign Scents",
      type: "decant_and_bottle",
      sheet_url_decants_men: "https://docs.google.com/spreadsheets/d/118f-ZLbawdsi38eDv9TqV7pq-yxjaHPdunruCwuerb8/gviz/tq?tqx=out:csv&gid=0",
      sheet_url_decants_women: "https://docs.google.com/spreadsheets/d/118f-ZLbawdsi38eDv9TqV7pq-yxjaHPdunruCwuerb8/gviz/tq?tqx=out:csv&gid=1022333211",
      sheet_url_retail: "https://docs.google.com/spreadsheets/d/118f-ZLbawdsi38eDv9TqV7pq-yxjaHPdunruCwuerb8/gviz/tq?tqx=out:csv&gid=91520254",
      whatsapp: "8826709398",
      shipping: "₹80 Pan-India (Free above ₹1,000 on 3+ decants) | Delhi-NCR ₹65",
      dispatch: "24-48 hrs",
      decant_sizes: ["3ml", "5ml", "8ml", "10ml", "20ml", "30ml"]
    }
  ];
  fs.writeFileSync(sellerConfigPath, JSON.stringify(sellersList, null, 2), "utf-8");

  const FLANKER_DISTINCT_TOKENS = [
    'freeze', 'dukhan', 'waha', 'platin', 'flames', 'elixir', 'collector',
    'nightout', 'rebel', 'sapphire', 'kobra', 'tropical', 'dive', 'sahara', 'atlantis',
    'noir', 'incense', 'silver', 'heaven'
  ];

  // Helper: Find best fragrance match in catalog (100% database-driven)
  function findBestMatch(brandRaw, nameRaw, inspoRaw = "") {
    if (isDesigner(brandRaw) || isDesigner(nameRaw)) return null;
    const brand = normalizeBrand(brandRaw);
    let bClean = cleanStr(brand);
    let nClean = cleanStr(nameRaw);
    if (!nClean || nClean.length < 2) return null;

    // 0. Match by registered canonical aliases
    let match = fragrances.find(f => {
      const fbClean = cleanStr(f.brand);
      const sameBrand = fbClean === bClean || (fbClean.length >= 5 && bClean.includes(fbClean)) || (bClean.length >= 5 && fbClean.includes(bClean));
      if (!sameBrand) return false;

      // Prevent flanker token collision even in alias matching
      for (const token of FLANKER_DISTINCT_TOKENS) {
        const inIncoming = nClean.includes(token);
        const inCatalog = cleanStr(f.name).includes(token);
        if (inIncoming !== inCatalog) return false;
      }

      if (Array.isArray(f.aliases)) {
        return f.aliases.some(a => {
          const aClean = cleanStr(a);
          if (aClean === nClean) return true;
          // Allow size / bottle variations without partial word corruption (e.g. SNOI 100ml matching SNOI)
          if (aClean.length >= 4 && (nClean.startsWith(aClean) || aClean.startsWith(nClean))) {
            const remainder = nClean.replace(aClean, "");
            return remainder.length === 0 || /^(100|150|200|50|75|30|edp|edt|extrait|retail|bottle|ml)*$/.test(remainder);
          }
          return false;
        });
      }
      return false;
    });
    if (match) return match;

    // 1. Exact brand + name match
    match = fragrances.find(f => {
      const fbClean = cleanStr(f.brand);
      const fnClean = cleanStr(f.name);
      return fbClean === bClean && fnClean === nClean;
    });
    if (match) return match;

    // 2. Strict prefix / suffix match within brand
    match = fragrances.find(f => {
      const fbClean = cleanStr(f.brand);
      const fnClean = cleanStr(f.name);
      const sameBrand = fbClean === bClean || (fbClean.length >= 5 && bClean.includes(fbClean)) || (bClean.length >= 5 && fbClean.includes(bClean));
      if (!sameBrand) return false;

      // Prevent flanker token collision
      for (const token of FLANKER_DISTINCT_TOKENS) {
        const inIncoming = nClean.includes(token);
        const inCatalog = fnClean.includes(token);
        if (inIncoming !== inCatalog) return false;
      }

      return fnClean === nClean || (nClean.length >= 4 && (fnClean.startsWith(nClean) || fnClean.endsWith(nClean)));
    });
    if (match) return match;

    // 3. Substring match within same brand (with strict flanker protection)
    match = fragrances.find(f => {
      const fbClean = cleanStr(f.brand);
      const fnClean = cleanStr(f.name);
      const sameBrand = fbClean === bClean || (fbClean.length >= 5 && bClean.includes(fbClean)) || (bClean.length >= 5 && fbClean.includes(bClean));
      if (!sameBrand) return false;

      // Strict flanker protection
      for (const token of FLANKER_DISTINCT_TOKENS) {
        const inIncoming = nClean.includes(token);
        const inCatalog = fnClean.includes(token);
        if (inIncoming !== inCatalog) return false;
      }

      return (nClean.length >= 4 && fnClean.includes(nClean)) || (fnClean.length >= 4 && nClean.includes(fnClean));
    });
    if (match) return match;

    // 4. Fallback: match by unique inspiration
    if (inspoRaw && inspoRaw.length >= 4) {
      const iClean = cleanStr(inspoRaw);
      match = fragrances.find(f => {
        const fiClean = cleanStr(f.dna_inspiration);
        return fiClean && fiClean.length >= 4 && (fiClean === iClean || fiClean.includes(iClean));
      });
      if (match) return match;
    }

    return null;
  }

  // Helper: Add bottle seller quote with size-aware deduplication
  function addBottleQuote(frag, sellerObj) {
    if (!frag.community_sellers) frag.community_sellers = [];

    // Protect against decants, vials, or tiny samples sneaking into bottle quotes
    const vol = sellerObj.volume_ml || parseInt(sellerObj.size, 10);
    const url = (sellerObj.product_url || '').toLowerCase();
    const size = (sellerObj.size || '').toLowerCase();
    if (url.includes('decant-set') || url.includes('/decant') || size.includes('vial') || (vol && vol < 14)) {
      return;
    }

    // Protect against non-perfumes: Deodorants, Body Sprays, Hair Mists, Shower Gels, Lotions, Roll-ons
    const nonPerfumeRegex = /\b(deo|deodorant|body[\s_-]*spray|body[\s_-]*mist|hair[\s_-]*mist|shower[\s_-]*gel|lotion|roll[\s_-]*on|after[\s_-]*shave)\b/i;
    if (nonPerfumeRegex.test(url) || nonPerfumeRegex.test(size)) {
      return;
    }

    // Strict Flanker Mismatch Guard:
    // If quote URL or title contains a flanker token that is NOT part of frag.id or frag.name, reject it!
    const fragIdNorm = frag.id.toLowerCase().replace(/[-_]/g, '');
    const fragNameNorm = frag.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const token of FLANKER_DISTINCT_TOKENS) {
      if (url.includes(token) && !fragIdNorm.includes(token) && !fragNameNorm.includes(token)) {
        return;
      }
    }

    const isPartial = !!(sellerObj.is_partial || (sellerObj.size && /partial|\b\d+\/\d+\s*ml\b/i.test(sellerObj.size)) || (sellerObj.product_url && /partial/i.test(sellerObj.product_url)));
    sellerObj.is_partial = isPartial;

    const isTester = !isPartial && !!(sellerObj.is_tester || (sellerObj.size && /tester/i.test(sellerObj.size)) || (sellerObj.product_url && /tester/i.test(sellerObj.product_url)));
    sellerObj.is_tester = isTester;

    sellerObj.packaging_type = isPartial ? 'Partial' : (isTester ? 'Tester' : 'Retail Bottle');

    const defaultLabel = isPartial ? 'Partial Bottle' : (isTester ? 'Tester Bottle' : 'Retail Bottle');
    const sizeKey = sellerObj.size || defaultLabel;
    const existing = frag.community_sellers.find(s => s.seller_id === sellerObj.seller_id && (s.size || defaultLabel) === sizeKey);
    if (existing) {
      if (sellerObj.price < existing.price) {
        existing.price = sellerObj.price;
        if (sellerObj.product_url) existing.product_url = sellerObj.product_url;
      }
    } else {
      frag.community_sellers.push(sellerObj);
    }
  }

  // Helper: Add decant seller quote
  function addDecantQuote(frag, decantObj) {
    if (!frag.community_decants) frag.community_decants = [];
    const existing = frag.community_decants.find(d => d.seller_id === decantObj.seller_id);
    if (existing) {
      existing.sizes = { ...existing.sizes, ...decantObj.sizes };
      existing.lowest_price = Math.min(...Object.values(existing.sizes).filter(v => typeof v === 'number' && v > 0));
    } else {
      frag.community_decants.push(decantObj);
    }
    frag.has_decants = true;
  }

  const stats = {
    second_theory: 0,
    fragfever: 0,
    apex_aroma: 0,
    enigma_perfumes: 0,
    enigma_perfumes_decants: 0,
    bluewings_bottles: 0,
    bluewings_decants: 0,
    whiffculture_bottles: 0,
    whiffculture_decants: 0,
    rp_decants: 0,
    gryv_scents_bottles: 0,
    gryv_scents_decants: 0,
    sovereign_scents_bottles: 0,
    sovereign_scents_decants: 0
  };

  let enrichedCount = 0;
  const MAX_AUTO_ENRICH_PER_SYNC = 5;
  const newlyEnrichedList = [];

  // ==========================================
  // SOURCE 1, 2, 3, 4: GOOGLE SHEETS (BOTTLES & TESTERS)
  // ==========================================
  const sheetSellers = sellersList.filter(s => s.sheet_url && (s.type === 'bottle' || s.type === 'decant_and_bottle'));
  console.log(`\n--- Syncing Google Sheets (${sheetSellers.map(s => s.seller_name).join(', ')}) ---`);
  for (const seller of sheetSellers) {
    try {
      console.log(`Fetching CSV for ${seller.seller_name}...`);
      const csvData = await fetchUrl(seller.sheet_url);
      const rows = parseCSV(csvData);
      console.log(`  Read ${rows.length} rows from ${seller.seller_name}`);
      const startRow = seller.start_row || 1;

      for (let rIdx = startRow; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx];
        if (row.length <= Math.max(seller.brand_col, seller.product_col, seller.price_col)) continue;
        const brandRaw = row[seller.brand_col]?.trim() || "";
        const nameRaw = row[seller.product_col]?.trim() || "";
        const priceClean = (row[seller.price_col] || "").replace(/[^\d]/g, "");
        const typeRaw = seller.type_col !== undefined ? (row[seller.type_col]?.trim() || "") : "";
        const sizeRaw = seller.size_col !== undefined ? (row[seller.size_col]?.trim() || "") : "";

        // Skip sample vials or decants from full bottle sheets
        if (typeRaw && /vial|sample/i.test(typeRaw)) continue;
        if (sizeRaw && /\b(1\.5ml|1\.7ml|2ml|5ml|8ml|10ml)\b/i.test(sizeRaw)) continue;

        if (!brandRaw || !nameRaw || !priceClean || !/[a-zA-Z]{3,}/.test(nameRaw) || /^\d+$/.test(nameRaw.trim())) continue;
        const price = parseInt(priceClean, 10);
        if (price < 400 || price > 50000) continue;
        if (nameRaw.toLowerCase().includes("200ml") && price <= 450) continue;
        if (/\b(12ml|15ml)\b/i.test(nameRaw) && price <= 400) continue;

        const matched = findBestMatch(brandRaw, nameRaw);
        if (matched) {
          const fullNameForMeta = sizeRaw ? `${nameRaw} ${sizeRaw}` : nameRaw;
          const meta = extractBottleMetadata(brandRaw, fullNameForMeta, matched.bottle_size);
          let isTester = (typeRaw.toLowerCase() === 'tester');
          if (seller.id === 'enigma_perfumes' && /the most wanted/i.test(nameRaw)) {
            isTester = true;
          }
          let label = meta.label;
          if (isTester && !label.toLowerCase().includes('tester')) {
            label = `${meta.volume}ml Tester`;
          }
          addBottleQuote(matched, {
            seller_id: seller.id,
            seller_name: seller.seller_name,
            price,
            size: label,
            is_tester: isTester,
            packaging_type: isTester ? 'Tester' : 'Retail Bottle',
            volume_ml: meta.volume,
            whatsapp: seller.whatsapp,
            shipping: seller.shipping,
            dispatch: seller.dispatch,
            verified: true
          });
          stats[seller.id]++;
        } else if (!isDesigner(brandRaw) && !isDesigner(nameRaw) && price >= 800 && enrichedCount < MAX_AUTO_ENRICH_PER_SYNC) {
          const alreadyExists = fragrances.some(f => cleanStr(f.brand) === cleanStr(brandRaw) && cleanStr(f.name) === cleanStr(nameRaw));
          if (!alreadyExists) {
            const fullNameForMeta = sizeRaw ? `${nameRaw} ${sizeRaw}` : nameRaw;
            const meta = extractBottleMetadata(brandRaw, fullNameForMeta);
            if (meta.volume >= 30 && !meta.isMini) {
              try {
                const newEntry = await enrichAndAddPerfume(brandRaw, nameRaw, price, meta.label, {
                  id: seller.id,
                  seller_name: seller.seller_name,
                  whatsapp: seller.whatsapp,
                  shipping: seller.shipping,
                  dispatch: seller.dispatch
                });
                if (newEntry && !fragrances.some(f => f.id === newEntry.id)) {
                  fragrances.push(newEntry);
                  newlyEnrichedList.push(newEntry);
                  stats[seller.id]++;
                  enrichedCount++;
                }
              } catch (err) {
                console.log(`    ↳ Auto-enrichment skipped for "${brandRaw} ${nameRaw}":`, err.message);
              }
            }
          }
        }
      }
      console.log(`  ✓ Matched ${stats[seller.id]} bottles for ${seller.seller_name}`);
    } catch (err) {
      console.error(`  ❌ Error syncing ${seller.seller_name}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  // ==========================================
  // SOURCE 5: RP DECANTS (GOOGLE SHEET)
  // ==========================================
  const rpSeller = sellersList.find(s => s.id === "rp_decants");
  if (rpSeller && rpSeller.sheet_url) {
    try {
      console.log(`\n--- Syncing RP Decants (${rpSeller.seller_name}) ---`);
      const csvData = await fetchUrl(rpSeller.sheet_url);
      const rows = parseCSV(csvData);
      console.log(`  Read ${rows.length} rows from ${rpSeller.seller_name}`);
      let currentBrand = "";

      for (let rIdx = 1; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx];
        const b = row[0] ? row[0].trim() : "";
        if (b) currentBrand = b;
        const nameRaw = row[3] ? row[3].trim() : "";
        if (!nameRaw || nameRaw.length < 2) continue;

        const p2 = parseInt((row[6] || "").replace(/[^\d]/g, ""), 10);
        const p5 = parseInt((row[7] || "").replace(/[^\d]/g, ""), 10);
        const p10 = parseInt((row[8] || "").replace(/[^\d]/g, ""), 10);
        const inspiredBy = row[9] ? row[9].trim() : "";

        const sizes = {};
        if (p2 && p2 > 0) sizes["2ml"] = p2;
        if (p5 && p5 > 0) sizes["5ml"] = p5;
        if (p10 && p10 > 0) sizes["10ml"] = p10;

        const prices = Object.values(sizes);
        if (prices.length === 0) continue;

        const brandNorm = normalizeBrand(currentBrand);
        const matched = findBestMatch(brandNorm, nameRaw, inspiredBy);
        if (matched) {
          addDecantQuote(matched, {
            seller_id: rpSeller.id,
            seller_name: rpSeller.seller_name,
            whatsapp: rpSeller.whatsapp,
            shipping: rpSeller.shipping,
            dispatch: rpSeller.dispatch,
            sizes,
            lowest_price: Math.min(...prices),
            in_stock: true,
            verified: true
          });
          stats.rp_decants++;
        }
      }
      console.log(`  ✓ Matched ${stats.rp_decants} decants for ${rpSeller.seller_name}`);
    } catch (err) {
      console.error(`  ❌ Error syncing RP Decants:`, err.message);
    }
  }

  // ==========================================
  // SOURCE 6: GRYV SCENTS (RETAIL BOTTLES & DECANTS)
  // ==========================================
  const gryvSeller = sellersList.find(s => s.id === "gryv_scents");
  if (gryvSeller) {
    // 1. Retail Pack Catalog (GID: 816101257)
    if (gryvSeller.sheet_url_retail) {
      try {
        console.log(`\n--- Syncing GRYV Scents Retail Bottles ---`);
        const csvData = await fetchUrl(gryvSeller.sheet_url_retail);
        const rows = parseCSV(csvData);
        console.log(`  Read ${rows.length} rows from GRYV Scents Retail`);
        for (let rIdx = 1; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          const brandRaw = row[1]?.trim() || "";
          const nameRaw = row[2]?.trim() || "";
          const sizeRaw = row[3]?.trim() || "";
          const priceClean = (row[4] || "").replace(/[^\d]/g, "");
          const stockStatus = (row[5] || "").trim().toLowerCase();

          // Skip empty rows, header rows, notes, or out of stock
          if (!brandRaw || !nameRaw || !priceClean || stockStatus.includes("out of stock")) continue;
          if (brandRaw.toLowerCase().includes("brand name") || nameRaw.toLowerCase().includes("perfume name") || brandRaw.toLowerCase().includes("designer")) continue;

          const price = parseInt(priceClean, 10);
          if (price < 400 || price > 50000) continue;

          const brandNorm = normalizeBrand(brandRaw);
          let cleanedName = nameRaw.replace(/^afnan\s+/i, '');
          const matched = findBestMatch(brandNorm, cleanedName);
          if (matched) {
            const fullNameForMeta = sizeRaw ? `${cleanedName} ${sizeRaw}` : cleanedName;
            const meta = extractBottleMetadata(brandNorm, fullNameForMeta, matched.bottle_size);
            addBottleQuote(matched, {
              seller_id: gryvSeller.id,
              seller_name: gryvSeller.seller_name,
              price,
              size: meta.label,
              volume_ml: meta.volume,
              whatsapp: gryvSeller.whatsapp,
              shipping: gryvSeller.shipping,
              dispatch: gryvSeller.dispatch,
              is_tester: false,
              packaging_type: 'Retail Bottle',
              verified: true
            });
            stats.gryv_scents_bottles++;
          }
        }
        console.log(`  ✓ Matched ${stats.gryv_scents_bottles} bottles for GRYV Scents`);
      } catch (err) {
        console.error(`  ❌ Error syncing GRYV Scents Retail:`, err.message);
      }
    }

    // 2. Decant Catalog (GID: 592974531)
    if (gryvSeller.sheet_url_decants) {
      try {
        console.log(`\n--- Syncing GRYV Scents Decants ---`);
        const csvData = await fetchUrl(gryvSeller.sheet_url_decants);
        const rows = parseCSV(csvData);
        console.log(`  Read ${rows.length} rows from GRYV Scents Decants`);
        for (let rIdx = 2; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          const brandRaw = row[0]?.trim() || "";
          const nameRaw = row[1]?.trim() || "";
          const inspiredBy = row[2]?.trim() || "";
          if (!brandRaw || !nameRaw || brandRaw.toLowerCase().includes("brand") || nameRaw.toLowerCase().includes("fragrance name")) continue;

          const p3 = parseInt((row[3] || "").replace(/[^\d]/g, ""), 10);
          const p5 = parseInt((row[4] || "").replace(/[^\d]/g, ""), 10);
          const p8 = parseInt((row[5] || "").replace(/[^\d]/g, ""), 10);
          const p10 = parseInt((row[6] || "").replace(/[^\d]/g, ""), 10);
          const p20 = parseInt((row[7] || "").replace(/[^\d]/g, ""), 10);
          const p30 = parseInt((row[8] || "").replace(/[^\d]/g, ""), 10);

          const sizes = {};
          if (p3 > 0) sizes["3ml"] = p3;
          if (p5 > 0) sizes["5ml"] = p5;
          if (p8 > 0) sizes["8ml"] = p8;
          if (p10 > 0) sizes["10ml"] = p10;
          if (p20 > 0) sizes["20ml"] = p20;
          if (p30 > 0) sizes["30ml"] = p30;

          const prices = Object.values(sizes);
          if (prices.length === 0) continue;

          const brandNorm = normalizeBrand(brandRaw);
          let cleanedName = nameRaw.replace(/^afnan\s+/i, '');
          const matched = findBestMatch(brandNorm, cleanedName, inspiredBy);
          if (matched) {
            addDecantQuote(matched, {
              seller_id: gryvSeller.id,
              seller_name: gryvSeller.seller_name,
              whatsapp: gryvSeller.whatsapp,
              shipping: gryvSeller.shipping,
              dispatch: gryvSeller.dispatch,
              sizes,
              lowest_price: Math.min(...prices),
              in_stock: true,
              verified: true
            });
            stats.gryv_scents_decants++;
          }
        }
        console.log(`  ✓ Matched ${stats.gryv_scents_decants} decants for GRYV Scents`);
      } catch (err) {
        console.error(`  ❌ Error syncing GRYV Scents Decants:`, err.message);
      }
    }
  }

  // ==========================================
  // SOURCE 3.5: SOVEREIGN SCENTS (BOTTLES & DECANTS)
  // ==========================================
  const sovSeller = sellersList.find(s => s.id === "sovereign_scents");
  if (sovSeller) {
    // 1. Retail Packs (Middle Eastern Retail Packs - GID: 91520254)
    if (sovSeller.sheet_url_retail) {
      try {
        console.log(`\n--- Syncing Sovereign Scents Retail Packs ---`);
        const csvData = await fetchUrl(sovSeller.sheet_url_retail);
        const rows = parseCSV(csvData);
        console.log(`  Read ${rows.length} rows from Sovereign Scents Retail Packs`);
        for (let rIdx = 1; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          const brandRaw = row[0]?.trim() || "";
          const nameRaw = row[1]?.trim() || "";
          const sizeRaw = row[2]?.trim() || "";
          const priceClean = (row[3] || "").replace(/[^\d]/g, "");
          if (!brandRaw || !nameRaw || !priceClean || brandRaw.toLowerCase().includes("brand")) continue;

          const price = parseInt(priceClean, 10);
          if (price < 400 || price > 50000) continue;

          const isPartial = /partial|\b\d+\/\d+\s*ml\b/i.test(nameRaw) || /partial|\b\d+\/\d+\s*ml\b/i.test(sizeRaw);
          const brandNorm = normalizeBrand(brandRaw);
          const matched = findBestMatch(brandNorm, nameRaw);
          if (matched) {
            const fullNameForMeta = sizeRaw ? `${nameRaw} ${sizeRaw}` : nameRaw;
            const meta = extractBottleMetadata(brandNorm, fullNameForMeta, matched.bottle_size);
            addBottleQuote(matched, {
              seller_id: sovSeller.id,
              seller_name: sovSeller.seller_name,
              price,
              size: isPartial ? `${sizeRaw || meta.label} (Partial)` : meta.label,
              volume_ml: meta.volume,
              whatsapp: sovSeller.whatsapp,
              shipping: sovSeller.shipping,
              dispatch: sovSeller.dispatch,
              is_partial: isPartial,
              is_tester: false,
              packaging_type: isPartial ? 'Partial' : 'Retail Bottle',
              verified: true
            });
            stats.sovereign_scents_bottles++;
          }
        }
        console.log(`  ✓ Matched ${stats.sovereign_scents_bottles} bottles for Sovereign Scents`);
      } catch (err) {
        console.error(`  ❌ Error syncing Sovereign Scents Retail:`, err.message);
      }
    }

    // 2. Decants (Men-UNISEX GID: 0 & For Women GID: 1022333211)
    const decantTabs = [
      { name: "Men-UNISEX Decants", url: sovSeller.sheet_url_decants_men },
      { name: "Women Decants", url: sovSeller.sheet_url_decants_women }
    ];

    for (const tab of decantTabs) {
      if (!tab.url) continue;
      try {
        console.log(`\n--- Syncing Sovereign Scents ${tab.name} ---`);
        const csvData = await fetchUrl(tab.url);
        const rows = parseCSV(csvData);
        console.log(`  Read ${rows.length} rows from Sovereign Scents ${tab.name}`);
        for (let rIdx = 1; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          const brandRaw = row[0]?.trim() || "";
          const nameRaw = row[1]?.trim() || "";
          const inspiredBy = row[2]?.trim() || "";
          if (!brandRaw || !nameRaw || brandRaw.toLowerCase().includes("brand") || nameRaw.toLowerCase().includes("fragrance name")) continue;

          const p3 = parseInt((row[3] || "").replace(/[^\d]/g, ""), 10);
          const p5 = parseInt((row[4] || "").replace(/[^\d]/g, ""), 10);
          const p8 = parseInt((row[5] || "").replace(/[^\d]/g, ""), 10);
          const p10 = parseInt((row[6] || "").replace(/[^\d]/g, ""), 10);
          const p20 = parseInt((row[7] || "").replace(/[^\d]/g, ""), 10);
          const p30 = parseInt((row[8] || "").replace(/[^\d]/g, ""), 10);

          const sizes = {};
          if (p3 > 0) sizes["3ml"] = p3;
          if (p5 > 0) sizes["5ml"] = p5;
          if (p8 > 0) sizes["8ml"] = p8;
          if (p10 > 0) sizes["10ml"] = p10;
          if (p20 > 0) sizes["20ml"] = p20;
          if (p30 > 0) sizes["30ml"] = p30;

          const prices = Object.values(sizes);
          if (prices.length === 0) continue;

          const brandNorm = normalizeBrand(brandRaw);
          let cleanedName = nameRaw.replace(/^afnan\s+/i, '');
          const matched = findBestMatch(brandNorm, cleanedName, inspiredBy);
          if (matched) {
            addDecantQuote(matched, {
              seller_id: sovSeller.id,
              seller_name: sovSeller.seller_name,
              whatsapp: sovSeller.whatsapp,
              shipping: sovSeller.shipping,
              dispatch: sovSeller.dispatch,
              sizes,
              lowest_price: Math.min(...prices),
              in_stock: true,
              verified: true
            });
            stats.sovereign_scents_decants++;
          }
        }
        console.log(`  ✓ Matched ${stats.sovereign_scents_decants} decants for Sovereign Scents so far`);
      } catch (err) {
        console.error(`  ❌ Error syncing Sovereign Scents ${tab.name}:`, err.message);
      }
    }
  }

  // ==========================================
  // SOURCE 4: ENIGMA PERFUMES DECANTS
  // ==========================================
  console.log("\n--- Syncing Enigma Perfumes Decants ---");
  try {
    const leCode = await fetchUrl("https://liquidemotions.vercel.app/store.js");
    const leMatch = leCode.match(/const LE_ALL_FRAGRANCES\s*=\s*(\[[\s\S]*?\]);\s*(?:const|let|var|function|\/\*)/);
    if (leMatch) {
      const leItems = eval(leMatch[1]);
      console.log(`  Fetched ${leItems.length} products from Enigma Perfumes`);
      for (const item of leItems) {
        const brand = normalizeBrand(item.house);
        if (!item.name || isDesigner(brand || item.name)) continue;
        const matched = findBestMatch(brand, item.name, item.inspiredBy);
        if (matched) {
          const sizes = {};
          if (item.prices) {
            Object.entries(item.prices).forEach(([sz, pr]) => {
              const pNum = Number(pr);
              if (pNum && pNum > 0) sizes[sz] = pNum;
            });
          }

          const prices = Object.values(sizes);
          if (prices.length > 0) {
            addDecantQuote(matched, {
              seller_id: "enigma_perfumes",
              seller_name: "Enigma Perfumes",
              website: "https://liquidemotions.vercel.app/",
              whatsapp: "7982410620",
              shipping: "Free Pan-India Delivery on orders above ₹1,200",
              dispatch: "24-48 hrs",
              sizes,
              lowest_price: Math.min(...prices),
              in_stock: true,
              verified: true
            });
            stats.enigma_perfumes_decants++;
          }
        }
      }
      console.log(`  ✓ Matched ${stats.enigma_perfumes_decants} decants for Enigma Perfumes`);
    }
  } catch (err) {
    console.error("  ❌ Error syncing Enigma Perfumes Decants:", err.message);
  }

  // ==========================================
  // SOURCE 5: BLUE WINGS FRAGRANCES
  // ==========================================
  console.log("\n--- Syncing Blue Wings Fragrances ---");
  try {
    const bwHtml = await fetchUrl("https://bluewingsfnd.com/");
    const bwMatch = bwHtml.match(/eval\(_d\("([^"]+)"\)\)/);
    if (bwMatch) {
      const s = bwMatch[1];
      const k = "BWF2026";
      let b;
      try {
        b = decodeURIComponent(escape(Buffer.from(s, "base64").toString("binary")));
      } catch(e) {
        b = Buffer.from(s, "base64").toString("binary");
      }
      let bwCode = "";
      let j = 0;
      for (let i = 0; i < b.length; i++) {
        bwCode += String.fromCharCode(b.charCodeAt(i) ^ k.charCodeAt(j++ % k.length));
      }

      // Decants
      const prodMatch = bwCode.match(/let products\s*=\s*(\[[\s\S]*?\]);\s*(?:var|let|const)/);
      if (prodMatch) {
        const bwProducts = eval(prodMatch[1]);
        for (const p of bwProducts) {
          if (!p.name || p.cat === "DESIGNER & NICHE" || isDesigner(p.brand || p.name)) continue;
          const rawName = p.name.replace(/^.*?-\s*/, "");
          const brand = normalizeBrand(p.brand);
          const matched = findBestMatch(brand, rawName, p.inspo);
          if (matched) {
            const sizes = {};
            if (p.p5 && Number(p.p5) > 50) sizes["5ml"] = Number(p.p5);
            if (p.p10 && Number(p.p10) > 50) sizes["10ml"] = Number(p.p10);
            if (p.p20 && Number(p.p20) > 50) sizes["20ml"] = Number(p.p20);
            if (p.p30 && Number(p.p30) > 50) sizes["30ml"] = Number(p.p30);

            const prices = Object.values(sizes);
            if (prices.length > 0) {
              addDecantQuote(matched, {
                seller_id: "bluewings",
                seller_name: "Blue Wings Fragrances",
                website: "https://bluewingsfnd.com/",
                whatsapp: "9899401419",
                shipping: "Free above ₹1,500",
                dispatch: "24-48 hrs",
                sizes,
                lowest_price: Math.min(...prices),
                in_stock: true,
                verified: true
              });
              stats.bluewings_decants++;
            }
          }
        }
      }

      // BNIB Bottles
      const bnibMatch = bwCode.match(/var bnibProducts\s*=\s*(\[[\s\S]*?\]);\s*(?:var|let|const)/);
      if (bnibMatch) {
        const bnibProducts = eval(bnibMatch[1]);
        for (const p of bnibProducts) {
          if (!p.name || !p.price || p.cat === "DESIGNER & NICHE" || isDesigner(p.brand || p.name)) continue;
          const rawName = p.name.replace(/^.*?-\s*/, "");
          const brand = normalizeBrand(p.brand);
          const matched = findBestMatch(brand, rawName);
          if (matched) {
            const meta = extractBottleMetadata(brand, rawName, matched.bottle_size);
            addBottleQuote(matched, {
              seller_id: "bluewings",
              seller_name: "Blue Wings Fragrances",
              price: Number(p.price),
              size: meta.label,
              volume_ml: meta.volume,
              whatsapp: "9899401419",
              shipping: "Free above ₹1,500",
              dispatch: "24-48 hrs",
              verified: true
            });
            stats.bluewings_bottles++;
          }
        }
      }
      console.log(`  ✓ Matched ${stats.bluewings_decants} decants & ${stats.bluewings_bottles} bottles for Blue Wings`);
    }
  } catch (err) {
    console.error("  ❌ Error syncing Blue Wings:", err.message);
  }

  // ==========================================
  // SOURCE 6: WHIFF CULTURE (SHOPIFY)
  // ==========================================
  console.log("\n--- Syncing Whiff Culture (www.whiffculture.com) ---");
  try {
    let allWcProducts = [];
    let page = 1;
    while (true) {
      const url = `https://www.whiffculture.com/products.json?limit=100&page=${page}`;
      const jsonStr = await fetchUrl(url);
      let data;
      try {
        data = JSON.parse(jsonStr);
      } catch(e) {
        console.log(`  Finished or stopped at page ${page}`);
        break;
      }
      if (!data.products || data.products.length === 0) break;
      allWcProducts.push(...data.products);
      page++;
      if (page > 25) break;
      await new Promise(r => setTimeout(r, 1200)); // Respect Shopify rate limit
    }
    console.log(`  Fetched ${allWcProducts.length} total products from Whiff Culture.`);

    const WC_BRANDS = [
      "Ahmed Al Maghribi", "Maison Alhambra", "French Avenue", "Paris Corner", 
      "Fragrance World", "Ard Al Zaafaran", "Al Haramain", "Al Wataniah", "Al Rehab", 
      "Arabiyat Prestige", "Ibrahim Al Qureshi", "Swiss Arabian", "Titan Skinn",
      "Lattafa", "Afnan", "Armaf", "Rasasi", "Rayhaan", "Assaf", "Parisbelle", 
      "Mykonos", "Khadlaj", "Naseem", "Riiffs", "Zimaya", "Dumont", "Bujairami", 
      "Laverne", "Dkhoon", "Arabiyat", "Surrati", "Reef", "Maison Asrar"
    ];

    function extractWcBrandAndName(title) {
      const cleanTitle = title.replace(/\b(partial|tester|decant set)\b/gi, "").trim();
      for (const b of WC_BRANDS) {
        const regex = new RegExp("^" + b.replace(/\s+/g, "\\s+"), "i");
        if (regex.test(cleanTitle)) {
          const rest = cleanTitle.replace(regex, "").trim();
          return { brand: b, name: rest };
        }
      }
      const parts = cleanTitle.split(" ");
      return { brand: parts[0], name: parts.slice(1).join(" ") };
    }

    for (const p of allWcProducts) {
      if (isDesigner(p.title)) continue;
      const { brand, name } = extractWcBrandAndName(p.title);
      if (!name || name.length < 2) continue;

      const matched = findBestMatch(brand, name);
      if (!matched) continue;

      const productUrl = `https://www.whiffculture.com/products/${p.handle}`;
      const decantSizes = {};
      let bottlePrice = null;

      for (const v of p.variants) {
        if (!v.available) continue;
        const vPrice = Math.round(parseFloat(v.price));
        if (isNaN(vPrice) || vPrice <= 0) continue;
        const vTitle = v.title.toLowerCase();

        // Check decants
        if (vTitle.includes("5ml")) {
          if (!decantSizes["5ml"] || vPrice < decantSizes["5ml"]) decantSizes["5ml"] = vPrice;
        } else if (vTitle.includes("8ml")) {
          if (!decantSizes["8ml"] || vPrice < decantSizes["8ml"]) decantSizes["8ml"] = vPrice;
          if (!decantSizes["10ml"] || vPrice < decantSizes["10ml"]) decantSizes["10ml"] = vPrice;
        } else if (vTitle.includes("10ml")) {
          if (!decantSizes["10ml"] || vPrice < decantSizes["10ml"]) decantSizes["10ml"] = vPrice;
        } else if (vTitle.includes("20ml") || vTitle.includes("20 ml")) {
          if (!decantSizes["20ml"] || vPrice < decantSizes["20ml"]) decantSizes["20ml"] = vPrice;
        } else if (vTitle.includes("30ml") || vTitle.includes("30 ml")) {
          if (!decantSizes["30ml"] || vPrice < decantSizes["30ml"]) decantSizes["30ml"] = vPrice;
        }

        // Check Retail Bottle / Tester / Partial
        const isDecantVariant = vTitle.includes("atomiser") || vTitle.includes("atomizer") || vTitle.includes("glass bottle") || (p.handle && p.handle.includes("decant")) || p.title.toLowerCase().includes("decant set") || (vPrice < 500 && !vTitle.includes("oil"));
        const meta = extractBottleMetadata(matched.brand, `${p.title} ${v.title}`, matched.bottle_size);
        if (!isDecantVariant && (meta.volume >= 30 || (meta.isMini && meta.volume >= 14)) && (vTitle.includes("retail pack") || vTitle.includes("tester") || vTitle.includes("partial") || /\b\d+\s*ml\b/i.test(vTitle) || vPrice >= 800)) {
          addBottleQuote(matched, {
            seller_id: "whiffculture",
            seller_name: "Whiff Culture",
            price: vPrice,
            size: meta.label,
            volume_ml: meta.volume,
            whatsapp: "9811377357",
            shipping: "Free Pan-India above ₹1,499",
            dispatch: "24-48 hrs",
            product_url: productUrl,
            verified: true
          });
          stats.whiffculture_bottles++;
        }
      }

      // Add Decant Quote if found
      const decantPrices = Object.values(decantSizes);
      if (decantPrices.length > 0) {
        addDecantQuote(matched, {
          seller_id: "whiffculture",
          seller_name: "Whiff Culture",
          website: productUrl,
          whatsapp: "9811377357",
          shipping: "Free Pan-India above ₹1,499",
          dispatch: "24-48 hrs",
          sizes: decantSizes,
          lowest_price: Math.min(...decantPrices),
          in_stock: true,
          verified: true
        });
        stats.whiffculture_decants++;
      }
    }
    console.log(`  ✓ Matched ${stats.whiffculture_decants} decants & ${stats.whiffculture_bottles} bottles for Whiff Culture`);
  } catch (err) {
    console.error("  ❌ Error syncing Whiff Culture:", err.message);
  }

  // ==========================================
  // SOURCE 6: AAR FRAGRANCES (Authentic Middle Eastern Retail Bottles)
  // ==========================================
  console.log("\n--- Syncing AAR Fragrances ---");
  try {
    const aarBottlesPath = path.join(__dirname, "../data/cache_aar_bottles.json");

    if (fs.existsSync(aarBottlesPath)) {
      const aarB = JSON.parse(fs.readFileSync(aarBottlesPath, "utf-8"));
      for (const [fid, data] of Object.entries(aarB)) {
        const target = fragrances.find(f => f.id === fid);
        if (target && data.price > 0) {
          const meta = extractBottleMetadata(target.brand, (data.url || fid).replace(/[-_]/g, " "), target.bottle_size);
          addBottleQuote(target, {
            seller_id: "aar_fragrances",
            seller_name: "AAR Fragrances",
            price: data.price,
            size: meta.label,
            volume_ml: meta.volume,
            whatsapp: "9873520545",
            shipping: "Pan-India Shipping",
            dispatch: "24-48 hrs",
            product_url: data.url,
            verified: true
          });
        }
      }
    }



    console.log("  ✓ Successfully merged verified AAR quotes");
  } catch (err) {
    console.error("  ❌ Error loading AAR cache:", err.message);
  }

  // Graceful fallback: If any seller has 0 quotes due to network/rate-limits, restore previous quotes
  const trackedSellers = [
    { id: "second_theory", name: "Second Theory" },
    { id: "fragfever", name: "FragFever" },
    { id: "apex_aroma", name: "Apex Aroma" },
    { id: "enigma_perfumes", name: "Enigma Perfumes" },
    { id: "rp_decants", name: "RP Decants" },
    { id: "gryv_scents", name: "GRYV Scents" },
    { id: "bluewings", name: "Blue Wings" },
    { id: "whiffculture", name: "Whiff Culture" },
    { id: "aar_fragrances", name: "AAR Fragrances" },
    { id: "sovereign_scents", name: "Sovereign Scents" }
  ];

  trackedSellers.forEach(s => {
    let bottleCount = 0;
    let decantCount = 0;
    fragrances.forEach(f => {
      bottleCount += (f.community_sellers || []).filter(item => item.seller_id === s.id).length;
      decantCount += (f.community_decants || []).filter(item => item.seller_id === s.id).length;
    });

    if (bottleCount === 0 && decantCount === 0) {
      console.log(`  🛡 Restoring cached quotes for ${s.name} (${s.id}) to protect against transient network/rate limits...`);
      let restoredBottles = 0;
      let restoredDecants = 0;
      fragrances.forEach(f => {
        const prev = existingQuotes[f.id];
        if (prev) {
          prev.sellers.filter(item => item.seller_id === s.id).forEach(quote => {
            f.community_sellers.push(quote);
            restoredBottles++;
          });
          prev.decants.filter(item => item.seller_id === s.id).forEach(quote => {
            f.community_decants.push(quote);
            restoredDecants++;
          });
        }
      });
      console.log(`    ↳ Restored ${restoredBottles} bottles and ${restoredDecants} decants for ${s.name}`);
    }
  });

  // ==========================================
  // COMPUTE COMPARISONS & AGGREGATE WINNERS
  // ==========================================
  console.log("\n--- Computing Lowest Prices & Size Comparisons ---");
  let inStockBottlesCount = 0;
  let decantsAvailableCount = 0;
  let dualAvailableCount = 0;

  fragrances.forEach(frag => {
    // 1. Sort bottle sellers: full bottles (volume >= 30) first by price asc, then minis
    if (frag.community_sellers && frag.community_sellers.length > 0) {
      frag.community_sellers.sort((a, b) => {
        const aIsMini = (a.volume_ml && a.volume_ml < 30) || (a.size && a.size.includes('Mini'));
        const bIsMini = (b.volume_ml && b.volume_ml < 30) || (b.size && b.size.includes('Mini'));
        if (aIsMini !== bIsMini) return aIsMini ? 1 : -1;
        return a.price - b.price;
      });

      const best = frag.community_sellers[0];
      frag.in_seller_stock = true;
      frag.community_price = best.price;
      frag.community_bottle_size = best.size || 'Retail Bottle';
      frag.lowest_seller = best.seller_name;
      frag.community_seller_name = best.seller_name;
      frag.community_whatsapp = best.whatsapp;
      frag.is_tester = !!(best.is_tester || (best.size && /tester/i.test(best.size)));
      frag.packaging_type = frag.is_tester ? 'Tester' : 'Retail Bottle';
      inStockBottlesCount++;

      const todayDate = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      // Strict Full Bottle Verification: volume >= 30 and not a mini or decant
      const bestFullBottleQuote = frag.community_sellers.find(s => {
        const vol = s.volume_ml || parseInt(s.size, 10);
        const isNotFull = (s.size && (s.size.includes('Mini') || s.size.includes('Decant') || s.size.includes('Sample') || s.size.includes('Vial'))) || (vol && vol < 30);
        return !isNotFull && s.price > 0;
      });

      const prev = previousSnapshots[frag.id];

      // Preserve and record price history with dates
      frag.price_history = (prev && Array.isArray(prev.price_history)) ? [...prev.price_history] : (Array.isArray(frag.price_history) ? frag.price_history : []);

      if (bestFullBottleQuote) {
        frag.price_date = todayDate;
        frag.price_updated_at = nowIso;

        const currentP = Number(bestFullBottleQuote.price);
        const lastHistory = frag.price_history[frag.price_history.length - 1];

        if (!lastHistory) {
          frag.price_history.push({
            date: todayDate,
            time: nowIso.slice(11, 19),
            timestamp: nowIso,
            price: currentP,
            size: bestFullBottleQuote.size || 'Retail Bottle',
            seller: bestFullBottleQuote.seller_name,
            seller_id: bestFullBottleQuote.seller_id
          });
          frag.is_price_drop = false;
          frag.price_change = 0;
        } else if (lastHistory.price !== currentP || lastHistory.size !== bestFullBottleQuote.size) {
          const oldP = Number(lastHistory.price);
          frag.previous_price = oldP;
          frag.previous_price_date = lastHistory.date;
          frag.previous_price_time = lastHistory.time || null;
          frag.price_change = currentP - oldP;
          frag.price_change_date = todayDate;
          frag.price_change_time = nowIso.slice(11, 19);

          frag.price_history.push({
            date: todayDate,
            time: nowIso.slice(11, 19),
            timestamp: nowIso,
            price: currentP,
            size: bestFullBottleQuote.size || 'Retail Bottle',
            seller: bestFullBottleQuote.seller_name,
            seller_id: bestFullBottleQuote.seller_id
          });
        } else if (lastHistory.date === todayDate) {
          lastHistory.seller = bestFullBottleQuote.seller_name;
          lastHistory.seller_id = bestFullBottleQuote.seller_id;
          if (!lastHistory.timestamp) lastHistory.timestamp = nowIso;
          if (!lastHistory.time) lastHistory.time = nowIso.slice(11, 19);
        }

        // Strict 2-Day Rolling Window for Price Drops:
        // A fragrance is only considered an active price drop if:
        // 1. Current price is strictly lower than previous price (diff < 0)
        // 2. The drop occurred within the last 2 days (<= 48 hours / 2 days)
        if (frag.previous_price && Number(frag.community_price) < Number(frag.previous_price)) {
          const dropDate = frag.price_change_date || frag.price_date;
          const dropTimeMs = new Date(dropDate).getTime();
          const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
          const isWithin2Days = dropTimeMs && (Date.now() - dropTimeMs <= twoDaysMs);

          if (isWithin2Days) {
            frag.is_price_drop = true;
            frag.price_change = Number(frag.community_price) - Number(frag.previous_price);
            frag.price_change_percentage = Math.round((Math.abs(frag.price_change) / Number(frag.previous_price)) * 100);
          } else {
            frag.is_price_drop = false;
          }
        } else {
          frag.is_price_drop = false;
        }
      }
    } else {
      frag.in_seller_stock = false;
      frag.community_price = null;
      frag.community_bottle_size = null;
      frag.lowest_seller = null;
      frag.is_price_drop = false;
    }

    // 2. Compute 4-day rolling window expiration for new arrivals
    if (frag.is_new_arrival) {
      const arrivalDate = frag.new_arrival_timestamp || frag.new_arrival_date || frag.price_updated_at;
      const arrivalTimeMs = arrivalDate ? new Date(arrivalDate).getTime() : 0;
      const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
      if (arrivalTimeMs && (Date.now() - arrivalTimeMs > fourDaysMs)) {
        frag.is_new_arrival = false;
      }
    }

    // 3. Compute decant comparison per size (2ml, 3ml, 5ml, 8ml, 10ml, 20ml, 30ml)
    if (frag.community_decants && frag.community_decants.length > 0) {
      frag.has_decants = true;
      decantsAvailableCount++;

      const comp = {};
      const allPrices = [];

      ['2ml', '3ml', '5ml', '8ml', '10ml', '20ml', '30ml'].forEach(sz => {
        const quotes = [];
        frag.community_decants.forEach(d => {
          if (d.sizes && d.sizes[sz]) {
            quotes.push({
              seller_id: d.seller_id,
              seller_name: d.seller_name,
              price: d.sizes[sz],
              whatsapp: d.whatsapp,
              website: d.website
            });
            allPrices.push(d.sizes[sz]);
          }
        });

        if (quotes.length > 0) {
          quotes.sort((a, b) => a.price - b.price);
          comp[sz] = {
            lowest_price: quotes[0].price,
            lowest_seller: quotes[0].seller_name,
            quotes
          };
        }
      });

      frag.decant_comparison = comp;
      frag.lowest_decant_price = allPrices.length > 0 ? Math.min(...allPrices) : null;

      // Find overall lowest decant quote seller
      let overallBestDecant = null;
      let minDecantPrice = Infinity;
      ['2ml', '3ml', '5ml', '8ml', '10ml', '20ml', '30ml'].forEach(sz => {
        if (comp[sz] && comp[sz].quotes && comp[sz].quotes[0]) {
          if (comp[sz].lowest_price < minDecantPrice) {
            minDecantPrice = comp[sz].lowest_price;
            overallBestDecant = comp[sz].quotes[0];
          }
        }
      });
      if (overallBestDecant) {
        frag.lowest_decant_seller = overallBestDecant.seller_name;
        if (!frag.in_seller_stock) {
          frag.community_seller_name = overallBestDecant.seller_name;
          frag.community_whatsapp = overallBestDecant.whatsapp;
        }
      }
    } else {
      frag.has_decants = false;
      frag.decant_comparison = null;
      frag.lowest_decant_price = null;
      frag.lowest_decant_seller = null;
    }

    if (!frag.in_seller_stock && !frag.has_decants) {
      frag.community_seller_name = null;
      frag.community_whatsapp = null;
    }

    if (frag.in_seller_stock && frag.has_decants) {
      dualAvailableCount++;
    }
  });

  // Deduplicate catalog by ID to guarantee primary key uniqueness
  const seenCatalogIds = new Set();
  fragrances = fragrances.filter(f => {
    if (seenCatalogIds.has(f.id)) return false;
    seenCatalogIds.add(f.id);
    return true;
  });

  // ==========================================
  // SYNC DIRECTLY TO SUPABASE DATABASE
  // ==========================================
  console.log("\n--- Syncing Live Prices & Decants directly to Supabase ---");

  if (supabase) {
    try {
      const chunkSize = 100;
      for (let i = 0; i < fragrances.length; i += chunkSize) {
        const chunk = fragrances.slice(i, i + chunkSize).map(f => ({
        id: f.id,
        name: f.name,
        brand: f.brand,
        rating_value: f.rating_value || 0,
        rating_count: f.rating_count || 0,
        collection: f.collection || '',
        concentration: f.concentration || '',
        primary_season: f.primary_season || '',
        day_night: f.day_night || '',
        longevity: f.longevity || '',
        sillage: f.sillage || '',
        gender: f.gender || '',
        dna_type: f.dna_type || '',
        dna_inspiration: f.dna_inspiration || '',
        description: f.description || '',
        top_notes: f.top_notes || [],
        middle_notes: f.middle_notes || [],
        base_notes: f.base_notes || [],
        accords: f.accords || [],
        aliases: f.aliases || [],
        in_seller_stock: !!f.in_seller_stock,
        community_price: f.community_price || null,
        has_decants: !!f.has_decants,
        lowest_decant_price: f.lowest_decant_price || null,
        community_sellers: f.community_sellers || [],
        community_decants: f.community_decants || [],
        best_bottle_seller: f.best_bottle_seller || null,
        best_decant_seller: f.best_decant_seller || null,
        is_price_drop: !!f.is_price_drop,
        previous_price: f.previous_price || null,
        price_change: f.price_change || null,
        price_change_percentage: f.price_change_percentage || null,
        price_change_date: f.price_change_date || null,
        price_change_time: f.price_change_time || null,
        previous_price_date: f.previous_price_date || null,
        price_history: f.price_history || [],
        is_new_arrival: !!f.is_new_arrival,
        new_arrival_date: f.new_arrival_date || null,
        discovered_at: f.discovered_at || (f.new_arrival_date ? new Date(f.new_arrival_date).toISOString() : null),
        price_updated_at: f.price_updated_at || null,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('fragrances').upsert(chunk, { onConflict: 'id' });
      if (error) {
        console.error("  Warning: Supabase sync chunk error:", error.message);
      }
    }
    console.log("  ✓ Successfully synced all live prices to Supabase!");
    } catch (err) {
      console.error("  Warning: Supabase sync failed:", err.message);
    }
  }

  // Save sync_meta.json
  const activeDrops = fragrances.filter(f => f.is_price_drop && f.previous_price);
  const activeNewArrivals = fragrances.filter(f => f.is_new_arrival && f.community_price);

  const syncMeta = {
    last_sync: new Date().toISOString(),
    sync_date: new Date().toISOString().split('T')[0],
    catalog_total: fragrances.length,
    in_stock_count: inStockBottlesCount,
    decants_available_count: decantsAvailableCount,
    dual_available_count: dualAvailableCount,
    enriched_new_arrivals_count: enrichedCount,
    price_drops_count: activeDrops.length,
    new_arrivals_count: activeNewArrivals.length,
    active_price_drops: activeDrops.map(d => ({
      id: d.id,
      name: d.name,
      brand: d.brand,
      current_price: d.community_price,
      previous_price: d.previous_price,
      drop_amount: Math.abs(d.price_change || (d.previous_price - d.community_price)),
      drop_percentage: d.price_change_percentage || Math.round((Math.abs(d.previous_price - d.community_price) / d.previous_price) * 100),
      seller: d.lowest_seller,
      drop_date: d.price_change_date || d.price_date,
      drop_time: d.price_change_time || null
    })),
    active_new_arrivals: activeNewArrivals.map(n => ({
      id: n.id,
      name: n.name,
      brand: n.brand,
      price: n.community_price,
      seller: n.lowest_seller,
      size: n.community_bottle_size,
      added_date: n.new_arrival_date || n.price_date,
      added_timestamp: n.new_arrival_timestamp || n.price_updated_at || null
    })),
    sellers_active: 10,
    seller_breakdown: {
      second_theory: { name: "Second Theory", bottles: stats.second_theory, type: "Full Bottles" },
      fragfever: { name: "FragFever", bottles: stats.fragfever, type: "Full Bottles" },
      apex_aroma: { name: "Apex Aroma", bottles: stats.apex_aroma, type: "Full Bottles" },
      enigma_perfumes: { name: "Enigma Perfumes", bottles: stats.enigma_perfumes, decants: stats.enigma_perfumes_decants, type: "Dual" },
      rp_decants: { name: "RP Decants", decants: stats.rp_decants, type: "Decants (2-10ml)" },
      gryv_scents: { name: "GRYV Scents", bottles: stats.gryv_scents_bottles, decants: stats.gryv_scents_decants, type: "Dual" },
      sovereign_scents: { name: "Sovereign Scents", bottles: stats.sovereign_scents_bottles, decants: stats.sovereign_scents_decants, type: "Dual" },
      bluewings: { name: "Blue Wings Fragrances", bottles: stats.bluewings_bottles, decants: stats.bluewings_decants, type: "Dual" },
      whiffculture: { name: "Whiff Culture", bottles: stats.whiffculture_bottles, decants: stats.whiffculture_decants, type: "Dual" },
      aar_fragrances: { name: "AAR Fragrances", bottles: fragrances.filter(f => (f.community_sellers || []).some(s => s.seller_id === 'aar_fragrances')).length, type: "Full Bottles" }
    }
  };
  try {
    fs.writeFileSync(syncMetaPath, JSON.stringify(syncMeta, null, 2), "utf-8");
  } catch(e) {}

  // Upsert sync metadata directly to Supabase sync_metadata table
  if (supabase) {
    try {
      const { error: syncMetaErr } = await supabase.from('sync_metadata').upsert([{
      id: 'latest',
      last_sync: syncMeta.last_sync,
      sync_date: syncMeta.sync_date,
      catalog_total: syncMeta.catalog_total,
      in_stock_count: syncMeta.in_stock_count,
      decants_available_count: syncMeta.decants_available_count,
      dual_available_count: syncMeta.dual_available_count,
      enriched_new_arrivals_count: syncMeta.enriched_new_arrivals_count,
      price_drops_count: syncMeta.price_drops_count,
      new_arrivals_count: syncMeta.new_arrivals_count,
      active_price_drops: syncMeta.active_price_drops,
      active_new_arrivals: syncMeta.active_new_arrivals,
      seller_breakdown: syncMeta.seller_breakdown,
      seller_counts: {
        second_theory: stats.second_theory || 0,
        fragfever: stats.fragfever || 0,
        apex_aroma: stats.apex_aroma || 0,
        enigma_perfumes: (stats.enigma_perfumes || 0) + (stats.enigma_perfumes_decants || 0),
        rp_decants: stats.rp_decants || 0,
        gryv_scents: (stats.gryv_scents_bottles || 0) + (stats.gryv_scents_decants || 0),
        sovereign_scents: (stats.sovereign_scents_bottles || 0) + (stats.sovereign_scents_decants || 0),
        bluewings: (stats.bluewings_bottles || 0) + (stats.bluewings_decants || 0),
        whiffculture: (stats.whiffculture_bottles || 0) + (stats.whiffculture_decants || 0),
        aar_fragrances: fragrances.filter(f => (f.community_sellers || []).some(s => s.seller_id === 'aar_fragrances') || (f.community_decants || []).some(d => d.seller_id === 'aar_fragrances')).length
      },
      updated_at: new Date().toISOString()
    }], { onConflict: 'id' });
    if (syncMetaErr) {
      console.warn("  Warning: Supabase sync_metadata update error:", syncMetaErr.message);
    } else {
      console.log("  ✓ Successfully updated sync_metadata in Supabase!");
    }
  } catch (metaErr) {
    console.warn("  Warning: Supabase sync_metadata failed:", metaErr.message);
  }
}

  console.log("\n=========================================================");
  console.log("✅ MASTER REFRESH COMPLETE!");
  console.log(`• Total catalog: ${fragrances.length} fragrances`);
  console.log(`• In-stock full bottles: ${inStockBottlesCount}`);
  console.log(`• Fragrances with verified decants: ${decantsAvailableCount}`);
  console.log(`• Fragrances with BOTH bottles & decants: ${dualAvailableCount}`);
  console.log("• Seller Breakdown:");
  console.log(`  - Second Theory: ${stats.second_theory} bottles`);
  console.log(`  - FragFever: ${stats.fragfever} bottles`);
  console.log(`  - Apex Aroma: ${stats.apex_aroma} bottles`);
  console.log(`  - Enigma Perfumes: ${stats.enigma_perfumes} bottles & ${stats.enigma_perfumes_decants} decants`);
  console.log(`  - Sovereign Scents: ${stats.sovereign_scents_bottles} bottles & ${stats.sovereign_scents_decants} decants`);
  console.log(`  - Blue Wings: ${stats.bluewings_bottles} bottles & ${stats.bluewings_decants} decants`);
  console.log(`  - Whiff Culture: ${stats.whiffculture_bottles} bottles & ${stats.whiffculture_decants} decants`);
  console.log("=========================================================");

  if (newlyEnrichedList.length > 0) {
    console.log(`\n✨ NEWLY ENRICHED PERFUMES THIS RUN (${newlyEnrichedList.length}):`);
    newlyEnrichedList.forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.brand}] ${p.name}`);
      console.log(`     ↳ Luxury Match: ${p.dna_inspiration} (${p.similarity_percentage}%)`);
      console.log(`     ↳ Top Notes: ${(p.notes?.top || []).join(', ')}`);
      console.log(`     ↳ Middle Notes: ${(p.notes?.middle || []).join(', ')}`);
      console.log(`     ↳ Base Notes: ${(p.notes?.base || []).join(', ')}`);
      console.log(`     ↳ Price: ₹${p.community_price} (${p.community_bottle_size}) by ${p.lowest_seller}`);
    });
  }
}

runMasterRefresh().catch(err => {
  console.error("\n❌ Master Refresh Pipeline encountered an unhandled error:", err);
  process.exit(1);
});
