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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
  });
}

function parsePage(html) {
  const parts = html.split('<div class="aiz-card-box');
  const items = [];
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const urlM = chunk.match(/href="(https:\/\/www\.aarfragrances\.com\/product\/[^"]+)"/);
    const titleM = chunk.match(/class="d-block text-reset">([^<]+)<\/a>/);
    const priceM = chunk.match(/<span class="fw-700 text-primary">₹([^<]+)<\/span>/);
    if (urlM && titleM && priceM) {
      items.push({
        url: urlM[1],
        title: titleM[1].trim().replace(/&amp;/g, "&").replace(/&#039;/g, "'"),
        price: parseFloat(priceM[1].replace(/,/g, ""))
      });
    }
  }
  return items;
}

const BRAND_NORMALIZATION = {
  "lattafa": "Lattafa",
  "maison alhambra": "Maison Alhambra",
  "armaf": "Armaf",
  "french avenue": "French Avenue",
  "afnan": "Afnan",
  "zimaya": "Zimaya",
  "rasasi": "Rasasi",
  "ajmal": "Ajmal",
  "ahmed al maghribi": "Ahmed Al Maghribi",
  "fragrance world": "Fragrance World",
  "fa paris": "Fragrance World",
  "paris corner": "Paris Corner",
  "pendora scents": "Paris Corner",
  "ministry of oud": "Paris Corner",
  "emir": "Paris Corner",
  "khadlaj": "Khadlaj",
  "arabiyat prestige": "Arabiyat Prestige",
  "arabiyat": "Arabiyat Prestige",
  "al haramain": "Al Haramain",
  "orientica": "Al Haramain",
  "swiss arabian": "Swiss Arabian",
  "rayhaan": "Rayhaan",
  "ibraheem al qurashi": "Ibrahim Al Qureshi",
  "ibrahim al qureshi": "Ibrahim Al Qureshi",
  "surrati": "Surrati",
  "naseem": "Naseem",
  "riiffs": "Riiffs",
  "al rehab": "Al Rehab",
  "laverne": "Laverne",
  "assaf": "Assaf"
};

const EXCLUDED_KEYWORDS = [
  "pack", "set", "twin pack", "attar", "candle", "diffuser", "deodorant",
  "oil", "concentrated parfum oil", "combipack", "combo", "tester", "sample",
  "ex nihilo", "nishane", "mancera", "montale", "jean paul gaultier", "jpg",
  "dior", "chanel", "gucci", "versace", "dolce", "tom ford", "creed", "roja",
  "kilian", "parfums de marly", "initio", "xerjoff", "sospiro", "amouage", "memo", "byredo", "le labo"
];

function cleanSlug(url) {
  const match = url.match(/\/product\/([^\/?#]+)/);
  if (!match) return "";
  return match[1].toLowerCase().replace(/-\d+$/, "").replace(/-100ml|-50ml|-150ml|-200ml|-60ml|-80ml|-75ml|-105ml/g, "");
}

function normalize(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

const SLUG_ALIASES = {
  "rasasi-hawas-men": "rasasi-hawas-for-him",
  "rasasi-hawas-for-men": "rasasi-hawas-for-him",
  "afnan-9-pm": "afnan-9pm",
  "afnan-9-am": "afnan-9am",
  "lattafa-khamrah-qahwa": "lattafa-khamrah-qahwa",
  "lattafa-khamrah": "lattafa-khamrah",
  "armaf-club-de-nuit-intense-man": "armaf-club-de-nuit-intense-man-edt",
  "armaf-cdnim": "armaf-club-de-nuit-intense-man-edt"
};

async function scrapeAARMIddleEast() {
  console.log("=== Crawling AAR Fragrances: Middle East Collection (43 Pages) ===");
  const allScraped = [];

  for (let i = 1; i <= 43; i += 5) {
    const batch = [];
    for (let j = i; j < i + 5 && j <= 43; j++) {
      batch.push(
        fetchUrl(`https://www.aarfragrances.com/category/middle-east-collection?page=${j}`)
          .then(html => parsePage(html))
          .catch(err => {
            console.warn(`  Failed page ${j}:`, err.message);
            return [];
          })
      );
    }
    const results = await Promise.all(batch);
    results.forEach(res => allScraped.push(...res));
    process.stdout.write(` [Page ${Math.min(i + 4, 43)}/43] `);
  }
  console.log(`\nCrawled total items: ${allScraped.length}`);

  // Load catalog directly from Supabase
  let frags = [];
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      let page = 0;
      while (true) {
        const { data, error } = await supabase.from('fragrances').select('id, name, brand, aliases').range(page * 1000, (page + 1) * 1000 - 1);
        if (error || !data || data.length === 0) {
          if (error) console.warn("Supabase query error:", error.message);
          break;
        }
        frags.push(...data);
        if (data.length < 1000) break;
        page++;
      }
      console.log(`Loaded ${frags.length} catalog items live from Supabase.`);
    }
  } catch (e) {
    console.warn("Could not load from Supabase:", e.message);
  }

  if (frags.length === 0) {
    const fragsPath = path.join(__dirname, "../data/fragrances.json");
    if (fs.existsSync(fragsPath)) {
      frags = JSON.parse(fs.readFileSync(fragsPath, "utf-8"));
    }
  }

  const matchedBottles = {};
  let matchCount = 0;
  let rejectedKeyword = 0;
  let rejectedBrand = 0;

  for (const item of allScraped) {
    const titleLower = item.title.toLowerCase();

    // 1. Exclude packs, samples, non-ME
    if (EXCLUDED_KEYWORDS.some(k => titleLower.includes(k))) {
      rejectedKeyword++;
      continue;
    }

    // 2. Identify Brand
    let detectedBrand = null;
    for (const [key, canonical] of Object.entries(BRAND_NORMALIZATION)) {
      if (titleLower.startsWith(key) || titleLower.includes(` ${key} `) || titleLower.includes(`(${key})`)) {
        detectedBrand = canonical;
        break;
      }
    }

    if (!detectedBrand) {
      rejectedBrand++;
      continue;
    }

    const rawSlug = cleanSlug(item.url);
    const resolvedSlug = SLUG_ALIASES[rawSlug] || rawSlug;

    // 3. Match against catalog with high precision
    let matched = null;

    // Priority A: Direct ID match
    matched = frags.find(f => f.id.toLowerCase() === resolvedSlug);

    // Priority A2: Database alias match
    if (!matched) {
      const slugClean = normalize(resolvedSlug);
      const titleClean = normalize(titleLower);
      matched = frags.find(f => {
        if (!f.aliases || !Array.isArray(f.aliases)) return false;
        return f.aliases.some(a => {
          const aClean = normalize(a);
          return aClean && aClean.length >= 3 && (slugClean === aClean || titleClean.includes(aClean));
        });
      });
    }

    // Priority B: Brand match + slug or title matches clean name exactly
    if (!matched) {
      for (const f of frags) {
        if (f.brand.toLowerCase() !== detectedBrand.toLowerCase()) continue;

        const fNameClean = normalize(f.name);
        const fBrandClean = normalize(f.brand);
        const combined = `${fBrandClean}${fNameClean}`;
        const slugClean = normalize(resolvedSlug);
        const titleClean = normalize(titleLower);

        if (slugClean === combined || titleClean === combined || (slugClean.startsWith(fBrandClean) && slugClean.endsWith(fNameClean))) {
          matched = f;
          break;
        }
      }
    }

    if (matched && item.price > 0) {
      matchedBottles[matched.id] = {
        price: item.price,
        url: item.url
      };
      matchCount++;
    }
  }

  console.log(`\n=== Matching Summary ===`);
  console.log(`Total Scraped: ${allScraped.length}`);
  console.log(`Rejected by Negative Keywords: ${rejectedKeyword}`);
  console.log(`Rejected by Non-ME Brand: ${rejectedBrand}`);
  console.log(`Successfully Matched Middle Eastern Bottles: ${Object.keys(matchedBottles).length}`);

  // Write clean bottles cache
  const aarBottlesPath = path.join(__dirname, "../data/cache_aar_bottles.json");
  fs.writeFileSync(aarBottlesPath, JSON.stringify(matchedBottles, null, 2), "utf-8");
  console.log(`✓ Updated ${aarBottlesPath}`);
}

scrapeAARMIddleEast().catch(err => {
  console.error("Scraper failed:", err);
  process.exit(1);
});
