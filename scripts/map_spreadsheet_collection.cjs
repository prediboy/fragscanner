const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "../src/data/fragrances.json");
const fragrances = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
console.log(`Loaded ${fragrances.length} catalog fragrances with canonical Fragrantica names.`);

function cleanStr(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeBrand(b) {
  const clean = cleanStr(b);
  if (clean.includes("afnan")) return "Afnan";
  if (clean.includes("armaf")) return "Armaf";
  if (clean.includes("lattafa")) return "Lattafa";
  if (clean.includes("rasasi")) return "Rasasi";
  if (clean.includes("alharamain") || clean.includes("haramain")) return "Al Haramain";
  if (clean.includes("maisonalhambra") || clean.includes("alhambra")) return "Maison Alhambra";
  if (clean.includes("frenchavenue")) return "French Avenue";
  if (clean.includes("pariscorner")) return "Paris Corner";
  if (clean.includes("fragranceworld")) return "Fragrance World";
  if (clean.includes("ajmal")) return "Ajmal";
  if (clean.includes("ahmedalmaghribi") || clean.includes("ahmed")) return "Ahmed Al Maghribi";
  if (clean.includes("zimaya")) return "Zimaya";
  if (clean.includes("riiffs")) return "RIIFFS";
  if (clean.includes("emir")) return "Emir";
  if (clean.includes("orientica")) return "Orientica";
  if (clean.includes("dumount") || clean.includes("dumont")) return "Dumont";
  if (clean.includes("albait") || clean.includes("dimashqi")) return "Albait Aldimashqi";
  if (clean.includes("khadlaj")) return "Khadlaj";
  if (clean.includes("rayhaan")) return "Rayhaan";
  if (clean.includes("ruebroca")) return "Rue Broca";
  if (clean.includes("mykonos")) return "Mykonos";
  if (clean.includes("titan") || clean.includes("skinn")) return "Titan Skinn";
  return (b || "").trim();
}

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
  'nightout', 'rebel', 'sapphire', 'kobra', 'tropical', 'dive', 'sahara', 'atlantis',
  'noir', 'incense', 'silver', 'heaven'
];

function isDesigner(brandRaw) {
  const b = cleanStr(brandRaw);
  const designers = ['dior', 'chanel', 'creed', 'tomford', 'versace', 'armani', 'gucci', 'prada', 'ysl', 'yvessaintlaurent', 'hermes', 'jeanpaulgaultier', 'jpg', 'parfumsdemarly', 'pdm', 'roja', 'xerjoff', 'amouage', 'nishane', 'kilian', 'byredo', 'initio', 'mancera', 'montale', 'carolinaherrera', 'paco', 'pacorabanne', 'valentino', 'givenchy', 'dolce', 'dolcegabbana', 'bvlgari', 'bulgari', 'nautica', 'davidoff', 'calvinklein', 'ck', 'montblanc', 'burberry', 'coach', 'azzaro', 'boss', 'hugoboss', 'isneymiyake', 'isseymiyake'];
  return designers.some(d => b === d);
}

function findBestMatchWithDetails(brandRaw, nameRaw, inspoRaw = "") {
  if (isDesigner(brandRaw) || isDesigner(nameRaw)) {
    return { match: null, rule: "DESIGNER_EXCLUDED", confidence: "None" };
  }
  const brand = normalizeBrand(brandRaw);
  let bClean = cleanStr(brand);
  let nClean = cleanStr(nameRaw);
  if (!nClean || nClean.length < 2) {
    return { match: null, rule: "NAME_TOO_SHORT", confidence: "None" };
  }

  const aliasKey = `${bClean}:${nClean}`;
  if (EXPLICIT_ALIASES[aliasKey]) {
    nClean = EXPLICIT_ALIASES[aliasKey];
  }

  // Community Shorthand Expansion
  if (bClean === "armaf") {
    if (nClean.includes("hunter")) {
      nClean = "hunterintense";
    } else if (nClean.includes("soul")) {
      nClean = "soul";
    } else if (nClean.includes("cdnoud") || nClean.includes("collectorspride") || (nClean.includes("oud") && nClean.includes("clubdenuit"))) {
      nClean = "clubdenuitoud";
    } else if (nClean.includes("lionheart")) {
      nClean = "clubdenuitlionheartman";
    } else if (nClean.includes("precieux")) {
      nClean = "clubdenuitprecieux1";
    } else if (nClean.includes("urban") && nClean.includes("elixir")) {
      nClean = "clubdenuiturbanmanelixir";
    } else if (nClean.includes("iconic")) {
      nClean = "clubdenuitblueiconic";
    } else if (nClean.includes("sillage")) {
      nClean = "clubdenuitsillage";
    } else if (nClean.includes("milestone")) {
      nClean = "clubdenuitmilestone";
    } else if (nClean.includes("untold")) {
      nClean = "clubdenuituntold";
    } else if (nClean.includes("overdose")) {
      nClean = "clubdenuitintenseoverdose";
    } else if (/\b(limited\s*edition|le)\b/i.test(nameRaw) || nClean.includes("limitededition") || nClean.includes("limited")) {
      nClean = "clubdenuitintensemanlimitededitionparfum";
    } else if (nClean.includes("pureparfum") || nClean.includes("pp") || (nClean.includes("intense") && nClean.includes("150ml"))) {
      nClean = "clubdenuitintensemanparfum";
    } else if (nClean.includes("edp") || (nClean.includes("intense") && (nClean.includes("200ml") || nClean.includes("250ml")))) {
      nClean = "clubdenuitintensemaneaudeparfum";
    } else if (nClean.includes("woman") || nClean.includes("women")) {
      if (nClean.includes("intense") || nClean.includes("cdni")) {
        nClean = "clubdenuitintensewoman";
      } else {
        nClean = "clubdenuitwoman";
      }
    } else if (nClean.includes("manedttransparent") || nClean === "clubdenuitman" || nClean === "cdnman") {
      nClean = "clubdenuitman";
    } else if (nClean.startsWith("cdnim") || nClean.startsWith("cdni") || nClean.includes("intenseman") || nClean.includes("intense")) {
      nClean = "clubdenuitintenseman";
    } else if (nClean.startsWith("cdn")) {
      nClean = nClean.replace(/^cdn/, "clubdenuit");
    }
  }
  if (bClean.includes("reef") && nClean.includes("33")) {
    nClean = "33black200ml";
  }
  if (bClean === "ajmal" && nClean.includes("evokegold")) {
    nClean = "evokegoldedition";
  }
  if (bClean.includes("alhambra") || bClean.includes("lattafa") || bClean.includes("asdaaf")) {
    if (nClean.includes("brightpeach")) nClean = "brightpeach";
    if (nClean.includes("rosepetals")) nClean = "rosepetals";
    if (nClean.includes("larougebaroque") || nClean.includes("baroquerouge")) nClean = "baroquerouge540";
    if (nClean.includes("darkdoorintense")) nClean = "darkdoorintense";
    if (nClean.includes("fantasme")) nClean = "jeanlowefantasme";
    if (nClean.includes("maitre") || nClean.includes("matiere")) nClean = "jeanlowemaitre";
    if (nClean.includes("jorgediprofumo")) nClean = "jorgediprofumoaqua";
    if (nClean.includes("miadolcezza")) nClean = "miadolcezza";
    if (nClean.includes("yourtouchwomen") || nClean.includes("yourtouchw")) nClean = "yourtouchwomen";
    if (nClean.includes("yourtouchsantal")) nClean = "yourtouchsantal";
    if (nClean.includes("yourtouchmen") || nClean.includes("yourtouchm") || nClean === "yourtouch") nClean = "yourtouch";
    if (nClean.includes("portoneroli")) nClean = "portoneroli";
    if (nClean.includes("fabulointense")) nClean = "fabulointense";
    if (nClean.includes("delilah")) nClean = "delilah";
    if (nClean.includes("khamrahwaha") || nClean.includes("waha")) nClean = "khamrahwaha";
    if (nClean.includes("yaraelixir")) nClean = "yaraelixir";
    if (nClean.includes("roseprive") || nClean.includes("priverose") || nClean.includes("ameeratalarab")) nClean = "ameeratalarabpriverose";
  }

  // 0. Registered canonical aliases
  let match = fragrances.find(f => {
    const fbClean = cleanStr(f.brand);
    const sameBrand = fbClean === bClean || (fbClean.length >= 5 && bClean.includes(fbClean)) || (bClean.length >= 5 && fbClean.includes(bClean));
    if (!sameBrand) return false;

    for (const token of FLANKER_DISTINCT_TOKENS) {
      const inIncoming = nClean.includes(token);
      const inCatalog = cleanStr(f.name).includes(token);
      if (inIncoming !== inCatalog) return false;
    }

    if (Array.isArray(f.aliases)) {
      return f.aliases.some(a => {
        const aClean = cleanStr(a);
        if (aClean === nClean) return true;
        if (aClean.length >= 4 && (nClean.startsWith(aClean) || aClean.startsWith(nClean))) {
          const remainder = nClean.replace(aClean, "");
          return remainder.length === 0 || /^(100|150|200|50|75|30|edp|edt|extrait|retail|bottle|ml)*$/.test(remainder);
        }
        return false;
      });
    }
    return false;
  });
  if (match) return { match, rule: "Registered Alias", confidence: "High" };

  // 1. Exact brand + name match
  match = fragrances.find(f => {
    const fbClean = cleanStr(f.brand);
    const fnClean = cleanStr(f.name);
    return fbClean === bClean && fnClean === nClean;
  });
  if (match) return { match, rule: "Exact Match", confidence: "High" };

  // 2. Strict prefix / suffix match within brand
  match = fragrances.find(f => {
    const fbClean = cleanStr(f.brand);
    const fnClean = cleanStr(f.name);
    const sameBrand = fbClean === bClean || (fbClean.length >= 5 && bClean.includes(fbClean)) || (bClean.length >= 5 && fbClean.includes(bClean));
    if (!sameBrand) return false;

    for (const token of FLANKER_DISTINCT_TOKENS) {
      const inIncoming = nClean.includes(token);
      const inCatalog = fnClean.includes(token);
      if (inIncoming !== inCatalog) return false;
    }

    return fnClean === nClean || (nClean.length >= 4 && (fnClean.startsWith(nClean) || fnClean.endsWith(nClean)));
  });
  if (match) return { match, rule: "Prefix/Suffix Match", confidence: "High" };

  // 3. Substring match within same brand (with strict flanker protection)
  match = fragrances.find(f => {
    const fbClean = cleanStr(f.brand);
    const fnClean = cleanStr(f.name);
    const sameBrand = fbClean === bClean || (fbClean.length >= 5 && bClean.includes(fbClean)) || (bClean.length >= 5 && fbClean.includes(bClean));
    if (!sameBrand) return false;

    for (const token of FLANKER_DISTINCT_TOKENS) {
      const inIncoming = nClean.includes(token);
      const inCatalog = fnClean.includes(token);
      if (inIncoming !== inCatalog) return false;
    }

    return (nClean.length >= 4 && fnClean.includes(nClean)) || (fnClean.length >= 4 && nClean.includes(fnClean));
  });
  if (match) return { match, rule: "Substring Match", confidence: "Medium" };

  // 4. Fallback by unique inspiration
  if (inspoRaw && inspoRaw.length >= 4) {
    const iClean = cleanStr(inspoRaw);
    match = fragrances.find(f => {
      const fiClean = cleanStr(f.dna_inspiration);
      return fiClean && fiClean.length >= 4 && (fiClean === iClean || fiClean.includes(iClean));
    });
    if (match) return { match, rule: "Inspiration Match", confidence: "Medium" };
  }

  return { match: null, rule: "UNMAPPED", confidence: "None" };
}

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

async function runMappingExercise() {
  const spreadsheets = [
    {
      id: "second_theory",
      seller_name: "Second Theory",
      sheet_url: "https://docs.google.com/spreadsheets/d/1IoMk77atuzWEX9QibVPzmTruazspYZQ24sXeRmmne90/gviz/tq?tqx=out:csv",
      brand_col: 0,
      product_col: 1,
      price_col: 2,
      inspired_col: -1,
      start_row: 2
    },
    {
      id: "fragfever",
      seller_name: "FragFever",
      sheet_url: "https://docs.google.com/spreadsheets/d/13kMrUoW_AHXEkqeTqOCri1szqmh1b1D8T5tPBtZFDfw/gviz/tq?tqx=out:csv&gid=0",
      brand_col: 0,
      product_col: 1,
      price_col: 2,
      inspired_col: -1,
      start_row: 1
    },
    {
      id: "apex_aroma",
      seller_name: "Apex Aroma",
      sheet_url: "https://docs.google.com/spreadsheets/d/1JDLgpguWyg2gblX3uOw1naWTVbwWPta4rqYFG5xHsos/export?format=csv&gid=1236708900",
      brand_col: 0,
      product_col: 1,
      price_col: 2,
      inspired_col: 3,
      start_row: 9
    }
  ];

  const results = [];
  const stats = {
    totalRows: 0,
    mappedCount: 0,
    unmappedCount: 0,
    bySeller: {},
    byRule: {}
  };

  for (const s of spreadsheets) {
    stats.bySeller[s.seller_name] = { total: 0, mapped: 0, unmapped: 0 };
    console.log(`\nFetching ${s.seller_name} spreadsheet...`);
    const res = await fetch(s.sheet_url);
    const csvTxt = await res.text();
    const rows = parseCSV(csvTxt);
    console.log(`  Read ${rows.length} total rows from ${s.seller_name}`);

    for (let rIdx = s.start_row; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      if (row.length <= Math.max(s.brand_col, s.product_col, s.price_col)) continue;
      
      const rawBrand = row[s.brand_col]?.trim() || "";
      const rawName = row[s.product_col]?.trim() || "";
      const rawPrice = row[s.price_col]?.trim() || "";
      const rawInspo = (s.inspired_col >= 0 && row[s.inspired_col]) ? row[s.inspired_col].trim() : "";

      // Skip non-product rows (headers, disclaimer footers, empty rows)
      if (!rawBrand || !rawName || !/[a-zA-Z]{2,}/.test(rawName) || /^\d+$/.test(rawName.trim())) continue;
      if (rawBrand.toLowerCase().includes("brand") || rawName.toLowerCase().includes("perfume name") || rawName.toLowerCase().includes("terms & conditions") || rawName.toLowerCase().includes("shipping")) continue;

      // Skip non-perfumes (aerosol deodorant cans 200ml under ₹400, or attar oil roll-ons under ₹300)
      const pNum = parseInt(rawPrice.replace(/[^\d]/g, ""), 10);
      if (rawName.toLowerCase().includes("200ml") && pNum > 0 && pNum <= 400) continue;
      if (/\b(12ml|15ml)\b/i.test(rawName) && pNum > 0 && pNum <= 300) continue;

      stats.totalRows++;
      stats.bySeller[s.seller_name].total++;

      const matchRes = findBestMatchWithDetails(rawBrand, rawName, rawInspo);
      const isMapped = Boolean(matchRes.match);

      if (isMapped) {
        stats.mappedCount++;
        stats.bySeller[s.seller_name].mapped++;
      } else {
        stats.unmappedCount++;
        stats.bySeller[s.seller_name].unmapped++;
      }

      stats.byRule[matchRes.rule] = (stats.byRule[matchRes.rule] || 0) + 1;

      results.push({
        seller: s.seller_name,
        sheetRow: rIdx + 1,
        rawBrand,
        rawName,
        price: rawPrice.replace(/[^\d]/g, "") || rawPrice,
        inspo: rawInspo,
        status: isMapped ? "MAPPED" : "UNMAPPED",
        fragranticaBrand: matchRes.match ? matchRes.match.brand : "",
        fragranticaName: matchRes.match ? matchRes.match.name : "",
        catalogId: matchRes.match ? matchRes.match.id : "",
        matchRule: matchRes.rule,
        confidence: matchRes.confidence,
        fragranticaInspiration: matchRes.match ? (matchRes.match.dna_inspiration || "") : ""
      });
    }
  }

  // Build CSV content
  const headers = [
    "Seller",
    "Sheet Row",
    "Sheet Brand",
    "Sheet Product Name",
    "Sheet Price (INR)",
    "Sheet Inspired By",
    "Match Status",
    "Fragrantica Brand",
    "Fragrantica Perfume Name",
    "Catalog ID",
    "Match Method",
    "Confidence Level",
    "Fragrantica DNA Inspiration"
  ];

  const csvRows = [headers.map(escapeCsvField).join(",")];
  for (const r of results) {
    csvRows.push([
      escapeCsvField(r.seller),
      escapeCsvField(r.sheetRow),
      escapeCsvField(r.rawBrand),
      escapeCsvField(r.rawName),
      escapeCsvField(r.price),
      escapeCsvField(r.inspo),
      escapeCsvField(r.status),
      escapeCsvField(r.fragranticaBrand),
      escapeCsvField(r.fragranticaName),
      escapeCsvField(r.catalogId),
      escapeCsvField(r.matchRule),
      escapeCsvField(r.confidence),
      escapeCsvField(r.fragranticaInspiration)
    ].join(","));
  }

  const csvContent = csvRows.join("\n");
  
  // Output paths
  const repoCsvPath = path.join(__dirname, "../spreadsheet_fragrantica_mapping.csv");
  const brainCsvPath = "/Users/umeshchug/.gemini/antigravity/brain/34bdc123-503f-4620-b711-97333fcb7b1a/spreadsheet_fragrantica_mapping.csv";

  fs.writeFileSync(repoCsvPath, csvContent, "utf-8");
  fs.writeFileSync(brainCsvPath, csvContent, "utf-8");

  console.log(`\n======================================================`);
  console.log(`✅ SPREADSHEET MAPPING EXERCISE COMPLETE!`);
  console.log(`======================================================`);
  console.log(`• Total spreadsheet perfume rows analyzed: ${stats.totalRows}`);
  console.log(`• Successfully mapped to Fragrantica: ${stats.mappedCount} (${((stats.mappedCount / stats.totalRows) * 100).toFixed(1)}%)`);
  console.log(`• Unmapped rows: ${stats.unmappedCount} (${((stats.unmappedCount / stats.totalRows) * 100).toFixed(1)}%)`);
  console.log(`\n--- Breakdown by Seller ---`);
  for (const [sName, sStat] of Object.entries(stats.bySeller)) {
    console.log(`- ${sName}: ${sStat.mapped} / ${sStat.total} mapped (${((sStat.mapped / sStat.total) * 100).toFixed(1)}%) | ${sStat.unmapped} unmapped`);
  }
  console.log(`\n--- Breakdown by Match Rule ---`);
  for (const [rule, count] of Object.entries(stats.byRule)) {
    console.log(`- ${rule}: ${count} rows`);
  }
  console.log(`\n📄 CSV saved to:`);
  console.log(`1. ${repoCsvPath}`);
  console.log(`2. ${brainCsvPath}`);
}

runMappingExercise().catch(console.error);
