const https = require("https");
const fs = require("fs");
const path = require("path");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

const DESIGNER_EXCLUDE = [
  "chanel", "dior", "yves saint laurent", "ysl", "gucci", "prada", "versace",
  "guerlain", "givenchy", "hermes", "tom ford", "armani", "giorgio armani",
  "emporio armani", "dolce & gabbana", "d&g", "burberry", "valentino", "hugo boss",
  "hugo", "ralph lauren", "calvin klein", "viktor & rolf", "narciso rodriguez",
  "jean paul gaultier", "jpg", "creed", "parfums de marly", "xerjoff", "roja",
  "amouage", "kilian", "byredo", "diptyque", "le labo", "maison francis kurkdjian",
  "mfk", "nishane", "sospiro", "montale", "mancera"
];

function isDesigner(brandName) {
  const b = (brandName || "").toLowerCase().trim();
  return DESIGNER_EXCLUDE.some(d => b === d || b.startsWith(d + " ") || b.endsWith(" " + d));
}

const canonicalBrands = {
  'afnan': 'Afnan', 'ahmed al maghribi': 'Ahmed Al Maghribi', 'ajmal': 'Ajmal',
  'al hambra': 'Maison Alhambra', 'maison al hambra': 'Maison Alhambra', 'maison alhambra': 'Maison Alhambra',
  'al haramain': 'Al Haramain', 'al majed oud': 'Al Majed Oud',
  'al rehab': 'Al Rehab', 'al wataniah': 'Al Wataniah', 'albait aldimashqi': 'Albait Aldimashqi',
  'anfar': 'Anfar', 'arabiyat': 'Arabiyat', 'arabiyat oud al layl': 'Arabiyat Prestige',
  'arabiyat prestige': 'Arabiyat Prestige', 'arabiat prestige': 'Arabiyat Prestige',
  'ard al zaafaran': 'Ard Al Zaafaran', 'ard al zafran': 'Ard Al Zaafaran',
  'armaf': 'Armaf', 'aromatix': 'French Avenue', 'assaf': 'Assaf', 'dumont': 'Dumont',
  'fragrance world': 'Fragrance World', 'french avenue': 'French Avenue', 'gissah': 'Gissah',
  'ibraq': 'Ibraq', 'ibraheem al qurashi': 'Ibrahim Al Qureshi', 'ibrahim al qureshi': 'Ibrahim Al Qureshi',
  'khadlaj': 'Khadlaj', 'lalique': 'Lalique', 'lattafa': 'Lattafa', 'laverne': 'Laverne',
  'maison asrar': 'Maison Asrar', 'mykonos': 'Mykonos', 'naseem': 'Naseem', 'nusuk': 'Nusuk',
  'paris corner': 'Paris Corner', 'rasasi': 'Rasasi', 'rayhaan': 'Rayhaan',
  'reef': 'Reef', 'reef33': 'Reef', 'riiffs': 'Riiffs', 'riifs': 'Riiffs', 'riffs': 'Riiffs',
  'rue broca': 'Rue Broca', 'swiss arabian': 'Swiss Arabian', 'titan skinn': 'Titan Skinn',
  'skinn by titan': 'Titan Skinn', 'zimaya': 'Zimaya'
};

function normalizeBrand(raw) {
  const l = (raw || "").toLowerCase().trim();
  return canonicalBrands[l] || raw.trim();
}

function cleanStr(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function main() {
  console.log("=== STARTING DUAL PRICING (FULL BOTTLE & DECANTS) SYNC ===");
  
  const fragrancesPath = path.join(__dirname, "../src/data/fragrances.json");
  const sellerConfigPath = path.join(__dirname, "../src/data/seller_config.json");
  const syncMetaPath = path.join(__dirname, "../src/data/sync_meta.json");

  const fragrances = JSON.parse(fs.readFileSync(fragrancesPath, "utf-8"));
  let sellerConfig = JSON.parse(fs.readFileSync(sellerConfigPath, "utf-8"));

  // 1. Update seller_config.json
  const hasLE = sellerConfig.some(s => s.id === "liquid_emotions");
  if (!hasLE) {
    sellerConfig.push({
      id: "liquid_emotions",
      seller_name: "Liquid Emotions",
      type: "decant",
      url: "https://liquidemotions.vercel.app/",
      whatsapp: "7982410620",
      shipping: "Free Pan-India Delivery on orders above ₹1,200",
      dispatch: "24-48 hrs",
      decant_sizes: ["5ml", "10ml", "20ml", "30ml"]
    });
  }
  const hasBW = sellerConfig.some(s => s.id === "bluewings");
  if (!hasBW) {
    sellerConfig.push({
      id: "bluewings",
      seller_name: "Blue Wings Fragrances",
      type: "decant_and_bottle",
      url: "https://bluewingsfnd.com/",
      whatsapp: "9899401419",
      shipping: "Free Pan-India Delivery on orders above ₹1,500",
      dispatch: "24-48 hrs",
      decant_sizes: ["5ml", "10ml", "20ml", "30ml"]
    });
  }
  fs.writeFileSync(sellerConfigPath, JSON.stringify(sellerConfig, null, 2), "utf-8");

  // 2. Fetch Liquid Emotions
  console.log("Fetching live decants from https://liquidemotions.vercel.app/store.js ...");
  const leCode = await fetchUrl("https://liquidemotions.vercel.app/store.js");
  const leMatch = leCode.match(/const LE_ALL_FRAGRANCES\s*=\s*(\[[\s\S]*?\]);\s*(?:const|let|var|function|\/\*)/);
  const leItems = eval(leMatch[1]);
  console.log(`✓ Fetched ${leItems.length} items from Liquid Emotions`);

  // 3. Fetch Blue Wings Fragrances
  console.log("Fetching live decants from https://bluewingsfnd.com/ ...");
  const bwHtml = await fetchUrl("https://bluewingsfnd.com/");
  const bwMatch = bwHtml.match(/eval\(_d\("([^"]+)"\)\)/);
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
  const bwProdMatch = bwCode.match(/let products\s*=\s*(\[[\s\S]*?\]);\s*(?:var|let|const)/);
  const bwItems = eval(bwProdMatch[1]);
  console.log(`✓ Fetched ${bwItems.length} decant items from Blue Wings`);

  const bwBnibMatch = bwCode.match(/var bnibProducts\s*=\s*(\[[\s\S]*?\]);\s*(?:var|let|const)/);
  const bwBnibItems = bwBnibMatch ? eval(bwBnibMatch[1]) : [];
  console.log(`✓ Fetched ${bwBnibItems.length} BNIB full bottle items from Blue Wings`);

  // Reset decants array on all fragrances first
  fragrances.forEach(f => {
    f.community_decants = [];
    f.has_decants = false;
    delete f.lowest_decant_price;
    delete f.lowest_decant_seller;
    delete f.decant_comparison;
  });

  // Precise exact-first matching helper
  function findBestFragranceMatch(brandRaw, nameRaw, inspoRaw = "") {
    const brand = normalizeBrand(brandRaw);
    if (isDesigner(brand)) return null;

    const bClean = cleanStr(brand);
    const nClean = cleanStr(nameRaw);

    // 1. Exact brand + name match
    let match = fragrances.find(f => {
      const fbClean = cleanStr(f.brand);
      const fnClean = cleanStr(f.name);
      return fbClean === bClean && fnClean === nClean;
    });
    if (match) return match;

    // 2. Strict prefix / suffix match
    match = fragrances.find(f => {
      const fbClean = cleanStr(f.brand);
      const fnClean = cleanStr(f.name);
      const sameBrand = fbClean === bClean || fbClean.includes(bClean) || bClean.includes(fbClean);
      if (!sameBrand) return false;
      return fnClean === nClean || fnClean.startsWith(nClean) || fnClean.endsWith(nClean);
    });
    if (match) return match;

    // 3. Substring match within same brand
    match = fragrances.find(f => {
      const fbClean = cleanStr(f.brand);
      const fnClean = cleanStr(f.name);
      const sameBrand = fbClean === bClean || fbClean.includes(bClean) || bClean.includes(fbClean);
      if (!sameBrand) return false;
      return fnClean.includes(nClean) || nClean.includes(fnClean);
    });
    return match;
  }

  // Helper to add or update decant from a seller
  function attachDecant(target, sellerId, sellerName, website, whatsapp, shipping, sizes) {
    if (!target.community_decants) target.community_decants = [];
    const existingIdx = target.community_decants.findIndex(d => d.seller_id === sellerId);
    const decantObj = {
      seller_id: sellerId,
      seller_name: sellerName,
      website,
      whatsapp,
      shipping,
      dispatch: "24-48 hrs",
      sizes,
      lowest_price: Math.min(...Object.values(sizes)),
      in_stock: true,
      verified: true
    };
    if (existingIdx >= 0) {
      target.community_decants[existingIdx] = decantObj;
    } else {
      target.community_decants.push(decantObj);
    }
    target.has_decants = true;
  }

  // 4. Map Liquid Emotions Decants
  let leMatchedCount = 0;
  leItems.forEach(le => {
    const brand = normalizeBrand(le.house);
    if (isDesigner(brand)) return;

    const target = findBestFragranceMatch(brand, le.name, le.inspiredBy);
    if (!target) return;

    const sizes = {};
    if (le.prices) {
      Object.entries(le.prices).forEach(([sz, pr]) => {
        if (pr) sizes[sz] = Number(pr);
      });
    }

    if (Object.keys(sizes).length > 0) {
      leMatchedCount++;
      attachDecant(
        target,
        "liquid_emotions",
        "Liquid Emotions",
        "https://liquidemotions.vercel.app/",
        "7982410620",
        "Free above ₹1,200",
        sizes
      );
    }
  });

  // 5. Map Blue Wings Decants
  let bwMatchedCount = 0;
  bwItems.forEach(bw => {
    if (bw.cat === "DESIGNER & NICHE") return;

    const rawName = bw.name.replace(/^.*?-\s*/, "");
    const brand = normalizeBrand(bw.brand);
    const target = findBestFragranceMatch(brand, rawName, bw.inspo);
    if (!target) return;

    const sizes = {};
    if (bw.p5) sizes["5ml"] = Number(bw.p5);
    if (bw.p10) sizes["10ml"] = Number(bw.p10);
    if (bw.p20) sizes["20ml"] = Number(bw.p20);
    if (bw.p30) sizes["30ml"] = Number(bw.p30);

    if (Object.keys(sizes).length > 0) {
      bwMatchedCount++;
      attachDecant(
        target,
        "bluewings",
        "Blue Wings Fragrances",
        "https://bluewingsfnd.com/",
        "9899401419",
        "Free above ₹1,500",
        sizes
      );
    }
  });

  // 6. Map Blue Wings BNIB Full Bottles
  let bwBnibCount = 0;
  bwBnibItems.forEach(bnib => {
    if (bnib.cat === "DESIGNER & NICHE") return;
    const rawName = bnib.name.replace(/^.*?-\s*/, "");
    const brand = normalizeBrand(bnib.brand);
    const target = findBestFragranceMatch(brand, rawName);
    if (!target) return;

    bwBnibCount++;
    if (!target.community_sellers) target.community_sellers = [];

    const existingIdx = target.community_sellers.findIndex(s => s.seller_id === "bluewings");
    const quote = {
      seller_id: "bluewings",
      seller_name: "Blue Wings Fragrances",
      price: String(bnib.price),
      stock: "In Stock (BNIB)",
      whatsapp: "9899401419",
      shipping: "Free Pan-India on orders above ₹1,500",
      dispatch: "24-48 hrs",
      is_hot: false,
      verified: true
    };

    if (existingIdx >= 0) {
      target.community_sellers[existingIdx] = quote;
    } else {
      target.community_sellers.push(quote);
    }
    target.in_seller_stock = true;

    const prices = target.community_sellers.map(s => parseInt(s.price, 10)).filter(p => !isNaN(p));
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      target.community_price = String(minPrice);
      const lowest = target.community_sellers.find(s => parseInt(s.price, 10) === minPrice);
      if (lowest) target.lowest_seller = lowest.seller_name;
    }
  });

  // 7. Calculate decant comparison and lowest pricing summary for each fragrance
  let totalWithDecants = 0;
  let totalDecantComparisons = 0;

  fragrances.forEach(f => {
    if (f.community_decants && f.community_decants.length > 0) {
      totalWithDecants++;
      
      const allPrices = [];
      f.community_decants.forEach(d => {
        Object.entries(d.sizes).forEach(([sz, p]) => {
          allPrices.push({ price: p, seller: d.seller_name, size: sz });
        });
      });
      allPrices.sort((a, b) => a.price - b.price);
      if (allPrices.length > 0) {
        f.lowest_decant_price = allPrices[0].price;
        f.lowest_decant_seller = allPrices[0].seller;
        f.lowest_decant_size = allPrices[0].size;
      }

      // Comparison table by size
      const comparison = {};
      const allSizes = ["5ml", "10ml", "20ml", "30ml"];
      allSizes.forEach(sz => {
        const sizeQuotes = [];
        f.community_decants.forEach(d => {
          if (d.sizes[sz]) {
            sizeQuotes.push({
              seller_id: d.seller_id,
              seller_name: d.seller_name,
              price: d.sizes[sz],
              whatsapp: d.whatsapp
            });
          }
        });
        if (sizeQuotes.length > 0) {
          sizeQuotes.sort((a, b) => a.price - b.price);
          comparison[sz] = {
            lowest_price: sizeQuotes[0].price,
            lowest_seller: sizeQuotes[0].seller_name,
            quotes: sizeQuotes
          };
        }
      });
      f.decant_comparison = comparison;
      if (f.community_decants.length >= 2) {
        totalDecantComparisons++;
      }
    }
  });

  // 8. Update sync_meta.json
  const syncMeta = {
    last_sync: new Date().toISOString(),
    total_fragrances: fragrances.length,
    in_stock_count: fragrances.filter(f => f.in_seller_stock).length,
    decants_available_count: totalWithDecants,
    multi_seller_count: fragrances.filter(f => f.community_sellers && f.community_sellers.length > 1).length,
    multi_decant_comparison_count: totalDecantComparisons,
    active_sellers: [
      { id: "second_theory", seller_name: "Second Theory", type: "Full Bottle", count: fragrances.filter(f => f.community_sellers?.some(s => s.seller_id === "second_theory")).length },
      { id: "fragfever", seller_name: "FragFever", type: "Full Bottle", count: fragrances.filter(f => f.community_sellers?.some(s => s.seller_id === "fragfever")).length },
      { id: "apex_aroma", seller_name: "Apex Aroma", type: "Full Bottle", count: fragrances.filter(f => f.community_sellers?.some(s => s.seller_id === "apex_aroma")).length },
      { id: "liquid_emotions", seller_name: "Liquid Emotions", type: "Decants (5ml - 30ml)", count: fragrances.filter(f => f.community_decants?.some(d => d.seller_id === "liquid_emotions")).length },
      { id: "bluewings", seller_name: "Blue Wings Fragrances", type: "Decants & BNIB", count: fragrances.filter(f => f.community_decants?.some(d => d.seller_id === "bluewings") || f.community_sellers?.some(s => s.seller_id === "bluewings")).length }
    ]
  };

  fs.writeFileSync(syncMetaPath, JSON.stringify(syncMeta, null, 2), "utf-8");
  fs.writeFileSync(fragrancesPath, JSON.stringify(fragrances, null, 2), "utf-8");

  console.log("\n=== DUAL PRICING SYNC COMPLETED SUCCESSFULLY ===");
  console.log(`Total Fragrances: ${fragrances.length}`);
  console.log(`In-Stock Full Bottles: ${syncMeta.in_stock_count}`);
  console.log(`Fragrances with Decants Available: ${totalWithDecants}`);
  console.log(`Multi-Decant Comparisons (Both Sellers Available): ${totalDecantComparisons}`);
  console.log("Seller Breakdown:", syncMeta.active_sellers);
}

main().catch(err => {
  console.error("Sync error:", err);
  process.exit(1);
});
