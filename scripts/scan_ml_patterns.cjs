const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith("http")) {
          const u = new URL(url);
          redirectUrl = u.origin + redirectUrl;
        }
        return fetchUrl(redirectUrl).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function parseCSV(text) {
  const lines = text.split("\n");
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let inQuotes = false;
    let cur = "";
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        row.push(cur.trim().replace(/^"|"$/g, ''));
        cur = "";
      } else {
        cur += c;
      }
    }
    row.push(cur.trim().replace(/^"|"$/g, ''));
    rows.push(row);
  }
  return rows;
}

async function main() {
  const allNamesWithSource = [];

  // 1. Second Theory
  try {
    console.log("Fetching Second Theory CSV...");
    const csv = await fetchUrl("https://docs.google.com/spreadsheets/d/1IoMk77atuzWEX9QibVPzmTruazspYZQ24sXeRmmne90/gviz/tq?tqx=out:csv");
    const rows = parseCSV(csv);
    rows.forEach(r => {
      if (r[1]) allNamesWithSource.push({ source: "Second Theory", brand: r[0], raw: r[1], price: r[2] });
    });
    console.log(`  Second Theory: ${rows.length} rows`);
  } catch (e) {
    console.error("Second Theory error:", e.message);
  }

  // 2. FragFever
  try {
    console.log("Fetching FragFever CSV...");
    const csv = await fetchUrl("https://docs.google.com/spreadsheets/d/13kMrUoW_AHXEkqeTqOCri1szqmh1b1D8T5tPBtZFDfw/gviz/tq?tqx=out:csv&gid=0");
    const rows = parseCSV(csv);
    rows.forEach(r => {
      if (r[1]) allNamesWithSource.push({ source: "FragFever", brand: r[0], raw: r[1], price: r[2] });
    });
    console.log(`  FragFever: ${rows.length} rows`);
  } catch (e) {
    console.error("FragFever error:", e.message);
  }

  // 3. Apex Aroma
  try {
    console.log("Fetching Apex Aroma CSV...");
    const csv = await fetchUrl("https://docs.google.com/spreadsheets/d/1B3e3x1x4d6M_BwZgQGjX8K2aU7g7wX8_/gviz/tq?tqx=out:csv");
    const rows = parseCSV(csv);
    rows.forEach(r => {
      if (r[1]) allNamesWithSource.push({ source: "Apex Aroma", brand: r[0], raw: r[1], price: r[2] });
    });
    console.log(`  Apex Aroma: ${rows.length} rows`);
  } catch (e) {
    // try fallback or ignore
  }

  // 4. Blue Wings BNIB
  try {
    console.log("Fetching Blue Wings HTML...");
    const bwHtml = await fetchUrl("https://bluewingsfragrances.com/");
    const bnibMatch = bwHtml.match(/var bnibProducts\s*=\s*(\[[\s\S]*?\]);\s*(?:var|let|const)/);
    if (bnibMatch) {
      const bnibProducts = eval(bnibMatch[1]);
      bnibProducts.forEach(p => {
        if (p.name) allNamesWithSource.push({ source: "Blue Wings", brand: p.brand || "", raw: p.name, price: p.price });
      });
      console.log(`  Blue Wings: ${bnibProducts.length} items`);
    }
  } catch (e) {
    console.error("Blue Wings error:", e.message);
  }

  // 5. Whiff Culture
  try {
    console.log("Fetching Whiff Culture...");
    const wcJson = await fetchUrl("https://whiffculture.com/products.json?limit=250");
    const parsed = JSON.parse(wcJson);
    parsed.products.forEach(p => {
      p.variants.forEach(v => {
        allNamesWithSource.push({ source: "Whiff Culture", brand: p.vendor || "", raw: `${p.title} - ${v.title}`, price: v.price });
      });
    });
    console.log(`  Whiff Culture: ${parsed.products.length} products`);
  } catch (e) {
    console.error("Whiff Culture error:", e.message);
  }

  // 6. Fragrances Catalog itself
  const fragsPath = path.join(__dirname, "../src/data/fragrances.json");
  if (fs.existsSync(fragsPath)) {
    const frags = JSON.parse(fs.readFileSync(fragsPath, "utf-8"));
    frags.forEach(f => {
      allNamesWithSource.push({ source: "Catalog Item", brand: f.brand, raw: f.name, price: f.community_price });
      if (f.raw_name) allNamesWithSource.push({ source: "Catalog raw_name", brand: f.brand, raw: f.raw_name, price: null });
    });
    console.log(`  Catalog: ${frags.length} fragrances`);
  }

  console.log(`\nTOTAL ROWS SCANNED: ${allNamesWithSource.length}`);

  // Patterns to test and catalog
  const sizeMatches = [];
  const noSizeMatches = [];

  // Comprehensive Regex for ml, oz, liter, mini, roll-on, etc.
  const regexList = [
    // 1. Explicit ML: e.g. "100ml", "100 ml", "100 ML", "100Ml", "100-ml", "100.0ml"
    { name: "explicit_ml", pattern: /\b(\d+(?:\.\d+)?)\s*(?:-|\s*)?(ml|m\.l\.)\b/i },
    // 2. Explicit Fl Oz: e.g. "3.4 oz", "3.4 fl oz", "1.7oz", "3.4fl.oz"
    { name: "explicit_oz", pattern: /\b(\d+(?:\.\d+)?)\s*(?:fl\.?\s*oz\.?|oz\.?)\b/i },
    // 3. Liter: e.g. "1 liter", "1L", "0.5 L"
    { name: "explicit_liter", pattern: /\b(\d+(?:\.\d+)?)\s*(?:liter|litre|l)\b/i },
    // 4. Mini / Sample / Travel / Pocket / Roller / Attar / Tola:
    { name: "mini_keyword", pattern: /\b(mini|sample|travel(?:\s*spray)?|pocket(?:\s*spray)?|roller(?:ball)?|roll\s*on|attar|tola|vial)\b/i },
    // 5. Standalone number at the end of product name (often 100, 50, 125, 200, 105, 90, 75, 30, 15, 10)
    { name: "trailing_num", pattern: /\b(10|15|20|25|30|50|60|75|80|90|100|105|120|125|150|180|200|250)\s*$/i }
  ];

  for (const item of allNamesWithSource) {
    let matchedPattern = null;
    let extractedDetails = null;

    for (const r of regexList) {
      const m = item.raw.match(r.pattern);
      if (m) {
        matchedPattern = r.name;
        extractedDetails = m[0];
        break;
      }
    }

    if (matchedPattern) {
      sizeMatches.push({ ...item, pattern: matchedPattern, matchedStr: extractedDetails });
    } else {
      noSizeMatches.push(item);
    }
  }

  console.log(`\nMatches with explicit size/volume tokens: ${sizeMatches.length}`);
  console.log(`Matches without explicit size tokens: ${noSizeMatches.length}`);

  // Let's summarize the detected size strings
  const summaryMap = {};
  sizeMatches.forEach(m => {
    const key = `${m.pattern}: ${m.matchedStr.toLowerCase().replace(/\s+/g, ' ')}`;
    if (!summaryMap[key]) summaryMap[key] = { count: 0, examples: [] };
    summaryMap[key].count++;
    if (summaryMap[key].examples.length < 4) {
      summaryMap[key].examples.push(`[${m.source}] ${m.brand} - ${m.raw}`);
    }
  });

  const sortedPatterns = Object.entries(summaryMap).sort((a, b) => b[1].count - a[1].count);

  console.log("\n=======================================================");
  console.log("DETECTED SIZE TOKENS & FREQUENCIES");
  console.log("=======================================================");
  sortedPatterns.forEach(([patternKey, info]) => {
    console.log(`\n• Pattern "${patternKey}" (Count: ${info.count})`);
    info.examples.forEach(ex => console.log(`    → ${ex}`));
  });

  // Let's write the full analysis to a report JSON
  fs.writeFileSync(
    path.join(__dirname, "../src/data/scanned_ml_analysis.json"),
    JSON.stringify({
      totalScanned: allNamesWithSource.length,
      sizeMatchesCount: sizeMatches.length,
      noSizeMatchesCount: noSizeMatches.length,
      patterns: sortedPatterns,
      sampleNoSize: noSizeMatches.slice(0, 50)
    }, null, 2)
  );
  console.log("\nWrote detailed analysis to src/data/scanned_ml_analysis.json");
}

main();
