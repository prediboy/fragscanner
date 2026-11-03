const https = require("https");
const fs = require("fs");
const path = require("path");

async function fetchUrl(url, timeoutMs = 15000) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return await res.text();
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
    .toLowerCase()
    .replace(/\bcdnim\b/gi, "club de nuit intense man")
    .replace(/\bcdn\b/gi, "club de nuit")
    .replace(/\bsnoi\b/gi, "supremacy not only intense")
    .replace(/9:00\s*pm/gi, "9pm")
    .replace(/immortel/gi, "immortal")
    .replace(/\b\d+\s*ml\b/gi, "")
    .replace(/\b(edp|edt|parfum|extrait de parfum|extrait|pure parfum|eau de parfum|eau de toilette|pour homme|pour femme|partial|tester)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

async function runMasterRefresh() {
  console.log("=========================================================");
  console.log("🚀 MASTER REFRESH: ALL 6 COMMUNITY SELLERS & RESOURCES");
  console.log("=========================================================");

  const fragrancesPath = path.join(__dirname, "../src/data/fragrances.json");
  const sellerConfigPath = path.join(__dirname, "../src/data/seller_config.json");
  const syncMetaPath = path.join(__dirname, "../src/data/sync_meta.json");

  const fragrances = JSON.parse(fs.readFileSync(fragrancesPath, "utf-8"));
  console.log(`Loaded ${fragrances.length} catalog fragrances.`);

  // Reset seller arrays on all catalog items so we rebuild clean from fresh sources
  fragrances.forEach(f => {
    f.community_sellers = [];
    f.community_decants = [];
    f.decant_comparison = null;
    f.in_seller_stock = false;
    f.community_price = null;
    f.lowest_seller = null;
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
      id: "liquid_emotions",
      seller_name: "Liquid Emotions",
      type: "decant",
      url: "https://liquidemotions.vercel.app/",
      whatsapp: "7982410620",
      shipping: "Free Pan-India Delivery on orders above ₹1,200",
      dispatch: "24-48 hrs",
      decant_sizes: ["5ml", "10ml", "20ml", "30ml"]
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
      type: "decant_and_bottle",
      url: "https://www.aarfragrances.com",
      whatsapp: "9873520545",
      shipping: "Pan-India Shipping",
      dispatch: "24-48 hrs",
      decant_sizes: ["10ml"]
    },
    {
      id: "fragrance_heaven",
      seller_name: "Fragrance Heaven",
      type: "bottle",
      url: "https://www.fragranceheaven.in",
      whatsapp: "7838191410",
      shipping: "Pan-India Shipping",
      dispatch: "24-48 hrs"
    }
  ];
  fs.writeFileSync(sellerConfigPath, JSON.stringify(sellersList, null, 2), "utf-8");

  const EXPLICIT_ALIASES = {
    'afnan:900pm': '9pm',
    'afnan:9pm': '9pm',
    'armaf:cdnsillage': 'clubdenuitsillage',
    'armaf:milestone': 'clubdenuitmilestone',
    'armaf:cdniconic': 'clubdenuitblueiconic',
    'armaf:cdniconicextrait': 'clubdenuitblueiconic',
    'armaf:cdnim': 'clubdenuitintenseman',
    'armaf:cdnimedt': 'clubdenuitintenseman',
    'armaf:cdnimlimitededition': 'clubdenuitintensemanlimitededition',
    'rasasi:hawas': 'hawasforhim',
    'rasasi:hawasforhim': 'hawasforhim',
    'rasasi:hawasice': 'hawasiceforhim',
    'reef33:reef33': '33black200ml',
    'lattafa:badeealoudblackexposed': 'badeealoudoudforglory',
    'lattafa:badeealoudhonorandglory': 'badeealoudhonorglory',
    'lattafa:badeealoudhonorglory': 'badeealoudhonorglory',
    'lattafa:qaedalfursanblack': 'qaedalfursan',
    'arabiyat:oudallayl': 'oudallayl',
    'arabiyatprestige:oudallayl': 'oudallayl',
    'arabiyatprestige:oudallaylaswad': 'oudallaylaswad',
    'ibraheemalqurashi:blueoud': 'blueoud',
    'ajmal:evokegold': 'evokegoldforhim',
    'ahmedalmaghribi:ighraa': 'ighra'
  };

  const FLANKER_DISTINCT_TOKENS = [
    'freeze', 'dukhan', 'waha', 'platin', 'flames', 'elixir', 'collector',
    'nightout', 'rebel', 'sapphire', 'kobra', 'tropical', 'dive', 'sahara', 'atlantis'
  ];

  // Helper: Find best fragrance match in catalog
  function findBestMatch(brandRaw, nameRaw, inspoRaw = "") {
    if (isDesigner(brandRaw) || isDesigner(nameRaw)) return null;
    const brand = normalizeBrand(brandRaw);
    let bClean = cleanStr(brand);
    let nClean = cleanStr(nameRaw);
    if (!nClean || nClean.length < 2) return null;

    // Check alias
    const aliasKey = `${bClean}:${nClean}`;
    if (EXPLICIT_ALIASES[aliasKey]) {
      nClean = EXPLICIT_ALIASES[aliasKey];
    }

    // 1. Exact brand + name match
    let match = fragrances.find(f => {
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

  // Helper: Add bottle seller quote
  function addBottleQuote(frag, sellerObj) {
    if (!frag.community_sellers) frag.community_sellers = [];
    const existing = frag.community_sellers.find(s => s.seller_id === sellerObj.seller_id);
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
    liquid_emotions: 0,
    bluewings_bottles: 0,
    bluewings_decants: 0,
    whiffculture_bottles: 0,
    whiffculture_decants: 0
  };

  // ==========================================
  // SOURCE 1, 2, 3: GOOGLE SHEETS
  // ==========================================
  console.log("\n--- Syncing Google Sheets (Second Theory, FragFever, Apex Aroma) ---");
  for (const seller of [sellersList[0], sellersList[1], sellersList[2]]) {
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
        if (!brandRaw || !nameRaw || !priceClean) continue;
        const price = parseInt(priceClean, 10);
        if (price < 400 || price > 50000) continue;

        const matched = findBestMatch(brandRaw, nameRaw);
        if (matched) {
          addBottleQuote(matched, {
            seller_id: seller.id,
            seller_name: seller.seller_name,
            price,
            whatsapp: seller.whatsapp,
            shipping: seller.shipping,
            dispatch: seller.dispatch,
            verified: true
          });
          stats[seller.id]++;
        }
      }
      console.log(`  ✓ Matched ${stats[seller.id]} bottles for ${seller.seller_name}`);
    } catch (err) {
      console.error(`  ❌ Error syncing ${seller.seller_name}:`, err.message);
    }
  }

  // ==========================================
  // SOURCE 4: LIQUID EMOTIONS
  // ==========================================
  console.log("\n--- Syncing Liquid Emotions Decants ---");
  try {
    const leCode = await fetchUrl("https://liquidemotions.vercel.app/store.js");
    const leMatch = leCode.match(/const LE_ALL_FRAGRANCES\s*=\s*(\[[\s\S]*?\]);\s*(?:const|let|var|function|\/\*)/);
    if (leMatch) {
      const leItems = eval(leMatch[1]);
      console.log(`  Fetched ${leItems.length} products from Liquid Emotions`);
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
              seller_id: "liquid_emotions",
              seller_name: "Liquid Emotions",
              website: "https://liquidemotions.vercel.app/",
              whatsapp: "7982410620",
              shipping: "Free above ₹1,200",
              dispatch: "24-48 hrs",
              sizes,
              lowest_price: Math.min(...prices),
              in_stock: true,
              verified: true
            });
            stats.liquid_emotions++;
          }
        }
      }
      console.log(`  ✓ Matched ${stats.liquid_emotions} decants for Liquid Emotions`);
    }
  } catch (err) {
    console.error("  ❌ Error syncing Liquid Emotions:", err.message);
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
            addBottleQuote(matched, {
              seller_id: "bluewings",
              seller_name: "Blue Wings Fragrances",
              price: Number(p.price),
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
      const url = `https://www.whiffculture.com/products.json?limit=250&page=${page}`;
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
      if (page > 12) break;
      await new Promise(r => setTimeout(r, 600)); // Respect Shopify rate limit
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
      const cleanTitle = title.replace(/\b(partial|tester|decant set|edp|edt|parfum)\b/gi, "").trim();
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

        // Check Retail Bottle
        if (vTitle.includes("retail pack") || vTitle.includes("100ml") || vTitle.includes("125ml") || vTitle.includes("150ml") || vTitle.includes("55ml")) {
          if (vPrice >= 500 && (!bottlePrice || vPrice < bottlePrice)) {
            bottlePrice = vPrice;
          }
        }
      }

      // Add Bottle Quote if found
      if (bottlePrice) {
        addBottleQuote(matched, {
          seller_id: "whiffculture",
          seller_name: "Whiff Culture",
          price: bottlePrice,
          whatsapp: "9811377357",
          shipping: "Free Pan-India above ₹1,499",
          dispatch: "24-48 hrs",
          product_url: productUrl,
          verified: true
        });
        stats.whiffculture_bottles++;
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
  // SOURCE 6 & 7: AAR FRAGRANCES & FRAGRANCE HEAVEN
  // ==========================================
  console.log("\n--- Syncing AAR Fragrances & Fragrance Heaven ---");
  try {
    const aarBottlesPath = path.join(__dirname, "../src/data/cache_aar_bottles.json");
    const aarDecantsPath = path.join(__dirname, "../src/data/cache_aar_decants.json");
    const fhBottlesPath = path.join(__dirname, "../src/data/cache_fh_bottles.json");

    if (fs.existsSync(aarBottlesPath)) {
      const aarB = JSON.parse(fs.readFileSync(aarBottlesPath, "utf-8"));
      for (const [fid, data] of Object.entries(aarB)) {
        const target = fragrances.find(f => f.id === fid);
        if (target && data.price > 0) {
          addBottleQuote(target, {
            seller_id: "aar_fragrances",
            seller_name: "AAR Fragrances",
            price: data.price,
            whatsapp: "9873520545",
            shipping: "Pan-India Shipping",
            dispatch: "24-48 hrs",
            product_url: data.url,
            verified: true
          });
        }
      }
    }

    if (fs.existsSync(aarDecantsPath)) {
      const aarD = JSON.parse(fs.readFileSync(aarDecantsPath, "utf-8"));
      for (const [fid, data] of Object.entries(aarD)) {
        const target = fragrances.find(f => f.id === fid);
        if (target && data.price > 0) {
          addDecantQuote(target, {
            seller_id: "aar_fragrances",
            seller_name: "AAR Fragrances",
            website: data.url,
            whatsapp: "9873520545",
            shipping: "Pan-India Shipping",
            dispatch: "24-48 hrs",
            sizes: { "10ml": data.price },
            lowest_price: data.price,
            in_stock: true,
            verified: true
          });
        }
      }
    }

    if (fs.existsSync(fhBottlesPath)) {
      const fhB = JSON.parse(fs.readFileSync(fhBottlesPath, "utf-8"));
      for (const [fid, data] of Object.entries(fhB)) {
        const target = fragrances.find(f => f.id === fid);
        if (target && data.price > 0) {
          addBottleQuote(target, {
            seller_id: "fragrance_heaven",
            seller_name: "Fragrance Heaven",
            price: data.price,
            whatsapp: "7838191410",
            shipping: "Pan-India Shipping",
            dispatch: "24-48 hrs",
            product_url: data.url,
            verified: true
          });
        }
      }
    }
    console.log("  ✓ Successfully merged verified AAR & Fragrance Heaven quotes");
  } catch (err) {
    console.error("  ❌ Error loading AAR / FH cache:", err.message);
  }

  // ==========================================
  // COMPUTE COMPARISONS & AGGREGATE WINNERS
  // ==========================================
  console.log("\n--- Computing Lowest Prices & Size Comparisons ---");
  let inStockBottlesCount = 0;
  let decantsAvailableCount = 0;
  let dualAvailableCount = 0;

  fragrances.forEach(frag => {
    // 1. Sort bottle sellers by price ascending
    if (frag.community_sellers && frag.community_sellers.length > 0) {
      frag.community_sellers.sort((a, b) => a.price - b.price);
      frag.in_seller_stock = true;
      frag.community_price = frag.community_sellers[0].price;
      frag.lowest_seller = frag.community_sellers[0].seller_name;
      inStockBottlesCount++;
    } else {
      frag.in_seller_stock = false;
      frag.community_price = null;
      frag.lowest_seller = null;
    }

    // 2. Compute decant comparison per size (5ml, 8ml, 10ml, 20ml, 30ml)
    if (frag.community_decants && frag.community_decants.length > 0) {
      frag.has_decants = true;
      decantsAvailableCount++;

      const comp = {};
      const allPrices = [];

      ['5ml', '8ml', '10ml', '20ml', '30ml'].forEach(sz => {
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
    } else {
      frag.has_decants = false;
      frag.decant_comparison = null;
      frag.lowest_decant_price = null;
    }

    if (frag.in_seller_stock && frag.has_decants) {
      dualAvailableCount++;
    }
  });

  // Save updated fragrances.json
  fs.writeFileSync(fragrancesPath, JSON.stringify(fragrances, null, 2), "utf-8");

  // ==========================================
  // SYNC DIRECTLY TO SUPABASE DATABASE
  // ==========================================
  console.log("\n--- Syncing Live Prices & Decants directly to Supabase ---");
  try {
    const { createClient } = require('@supabase/supabase-js');
    const SUPABASE_URL = 'https://lvivmkdlaxaetnazmcat.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_8eXJXa7QmS1okuJ3tFwsbg_GyE7RaKC';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        in_seller_stock: !!f.in_seller_stock,
        community_price: f.community_price || null,
        has_decants: !!f.has_decants,
        lowest_decant_price: f.lowest_decant_price || null,
        community_sellers: f.community_sellers || [],
        community_decants: f.community_decants || [],
        best_bottle_seller: f.best_bottle_seller || null,
        best_decant_seller: f.best_decant_seller || null,
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

  // Save sync_meta.json
  const syncMeta = {
    last_sync: new Date().toISOString(),
    catalog_total: fragrances.length,
    in_stock_count: inStockBottlesCount,
    decants_available_count: decantsAvailableCount,
    dual_available_count: dualAvailableCount,
    sellers_active: 6,
    seller_breakdown: {
      second_theory: { name: "Second Theory", bottles: stats.second_theory, type: "Full Bottles" },
      fragfever: { name: "FragFever", bottles: stats.fragfever, type: "Full Bottles" },
      apex_aroma: { name: "Apex Aroma", bottles: stats.apex_aroma, type: "Full Bottles" },
      liquid_emotions: { name: "Liquid Emotions", decants: stats.liquid_emotions, type: "Decants (5-30ml)" },
      bluewings: { name: "Blue Wings Fragrances", bottles: stats.bluewings_bottles, decants: stats.bluewings_decants, type: "Dual" },
      whiffculture: { name: "Whiff Culture", bottles: stats.whiffculture_bottles, decants: stats.whiffculture_decants, type: "Dual" }
    }
  };
  fs.writeFileSync(syncMetaPath, JSON.stringify(syncMeta, null, 2), "utf-8");

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
  console.log(`  - Liquid Emotions: ${stats.liquid_emotions} decants`);
  console.log(`  - Blue Wings: ${stats.bluewings_bottles} bottles & ${stats.bluewings_decants} decants`);
  console.log(`  - Whiff Culture: ${stats.whiffculture_bottles} bottles & ${stats.whiffculture_decants} decants`);
  console.log("=========================================================");
}

runMasterRefresh();
