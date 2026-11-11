const zlib = require('zlib');

const AR_SHEET_XLSX_URL =
  'https://docs.google.com/spreadsheets/d/1O-hEDehz5oNrka5UiuZOH_CuDD59dQv-/export?format=xlsx';

const AR_META = {
  id: 'aromatic_rabbit',
  seller_name: 'Aromatic Rabbit',
  whatsapp: '8527824887',
  whatsapp_group: 'https://chat.whatsapp.com/JxcXjmqF3YhCnKfSkzjFId',
  shipping_decants: 'Delhi-NCR ₹60 / Metro ₹80 (Free above ₹1,499; J&K/NE +₹50)',
  shipping_bnib: 'Free Pan-India Shipping (J&K & North East +₹50)',
  dispatch: '2 working days',
};

const DESIGNER_BRANDS = [
  'azzaro', 'bentley', 'burberry', 'calvin klein', 'carolina herrera', 'chanel', 'coach',
  'creed', 'davidoff', 'dior', 'dolce', 'd&g', 'dunhill', 'elizabeth arden', 'e. arden',
  'emporio armani', 'giorgio armani', 'armani', 'givenchy', 'gucci', 'guerlain', 'hermes',
  'hugo boss', 'issey miyake', 'jean paul gaultier', 'jpg', 'jimmy choo', 'joop', 'kenzo',
  'lacoste', 'lalique', 'lancome', 'mancera', 'mont blanc', 'montblanc', 'moschino', 'mugler',
  'narciso rodriguez', 'nautica', 'paco rabanne', 'prada', 'ralph lauren', 'roberto cavalli',
  'salvatore ferragamo', 'spice bomb', 'spicebomb', 'tom ford', 'valentino', 'versace',
  'viktor & rolf', 'viktor&rolf', 'yves saint laurent', 'ysl', 'zara', 'mercedes', 'guess',
  'nina ricci', 'police', 'jaguar', 'ferrari', 'bmw', 'kenneth cole', 'dkny', 'ck', 'hugo',
  'tommy hilfiger', 'bulgari', 'bvlgari', 'cartier', 'chopard', 'clinique', 'diesel',
  'estee lauder', 'fendi', 'michael kors', 'missoni', 'nikos', 'rochas', 'shiseido',
  'marc jacobs', 'franck olivier', 'franck olivier paris',
];

function isDesignerOrNonSingleME(brand, name) {
  const b = (brand || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();
  if (!b || !n) return true;
  if (DESIGNER_BRANDS.some((d) => b === d || b.startsWith(d + ' ') || b.includes(d))) return true;
  if (/spice\s*bomb/i.test(n) && b !== 'french avenue') return true;
  if (/gift\s*set/i.test(n)) return true;
  // Skip non-perfume body sprays/deos if any
  if (/\b(deo|deodorant|body\s*spray|roll[\s-]*on)\b/i.test(n)) return true;
  return false;
}

function isNonSingleBottle(brand, name) {
  const b = (brand || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();
  if (!b || !n) return true;
  if (/gift\s*set|decant\s*set/i.test(n)) return true;
  if (/\b(deo|deodorant|body\s*spray|body\s*mist|hair\s*mist|shower\s*gel|lotion|roll[\s-]*on|after[\s_-]*shave)\b/i.test(n)) return true;
  return false;
}

function normalizeARItem(rawBrand, rawName) {
  let brand = (rawBrand || '').replace(/\s+/g, ' ').trim();
  let name = (rawName || '').replace(/\s+/g, ' ').trim();
  const lowB = brand.toLowerCase();
  const lowN = name.toLowerCase();

  if (lowB === 'al harmain' || lowB === 'al haramain') brand = 'Al Haramain';
  else if (lowB === 'al dirgham') {
    brand = 'Ard Al Zaafaran';
    if (!lowN.startsWith('al dirgham') && !lowN.startsWith('dirgham')) name = `Al Dirgham ${name}`;
  } else if (lowB === 'dumont paris') brand = 'Dumont';
  else if (lowB === 'odyssey') {
    brand = 'Armaf';
    if (!lowN.startsWith('odyssey')) name = `Odyssey ${name}`;
  } else if (lowB === 'shagaf') {
    brand = 'Swiss Arabian';
    if (!lowN.startsWith('shag')) name = `Shaghaf ${name}`;
  } else if (lowB === 'ibraq') brand = 'Ibraq';
  else if (lowB === 'pendora scent') brand = 'Pendora Scents';
  else if (lowB === 'paris corner') brand = 'Paris Corner';
  else if (lowB === 'riiffs' || lowB === 'riffs') brand = 'Riiffs';
  else if (lowB === 'mykonos') brand = 'Mykonos';
  else if (lowB === 'caroline herrera' || lowB === 'carolina herrera') brand = 'Carolina Herrera';
  else if (lowB === 'hugo boss') brand = 'Hugo Boss';
  else if (lowB === 'paco rabanne' || lowB === 'rabanne') brand = 'Rabanne';
  else if (lowB === 'jpg' || lowB === 'jean paul gaultier') brand = 'Jean Paul Gaultier';
  else if (lowB === 'ysl' || lowB === 'yves saint laurent') brand = 'Yves Saint Laurent';
  else if (lowB === 'd&g' || lowB === 'dolce & gabbana' || lowB === 'dolce&gabbana') brand = 'Dolce & Gabbana';
  else if (lowB === 'issey miyake') brand = 'Issey Miyake';
  else if (lowB === 'tom ford') brand = 'Tom Ford';
  else if (lowB === 'viktor&rolf' || lowB === 'viktor & rolf') brand = 'Viktor & Rolf';
  else if (lowB === 'lancome') brand = 'Lancôme';
  else if (lowB === 'hermes') brand = 'Hermès';
  else if (lowB === 'montblanc' || lowB === 'mont blanc') brand = 'Montblanc';

  // Known cross-brand/miscategorized seller sheet rows
  if (brand === 'Arabiyat Prestige' && lowN === 'blue berry musk') brand = 'Ibraq';
  if (brand === 'Lattafa' && lowN === 'delilah femme') brand = 'Maison Alhambra';
  if (brand === 'Lattafa' && lowN === 'pure musk') name = 'Khalis Musk';

  return { brand, name };
}

// Lightweight Central-Directory ZIP reader (handles bit-3 data descriptors cleanly)
function unzipEntries(buf) {
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Invalid XLSX/ZIP buffer (EOCD not found)');

  const cdEntries = buf.readUInt16LE(eocdOffset + 10);
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const files = new Map();

  let ptr = cdOffset;
  for (let idx = 0; idx < cdEntries; idx++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) break;
    const compression = buf.readUInt16LE(ptr + 10);
    const compSize = buf.readUInt32LE(ptr + 20);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localHeaderOffset = buf.readUInt32LE(ptr + 42);
    const fileName = buf.toString('utf8', ptr + 46, ptr + 46 + nameLen);

    const lfhNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const lfhExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + lfhNameLen + lfhExtraLen;
    const rawSlice = buf.subarray(dataStart, dataStart + compSize);

    files.set(fileName, () => {
      if (compression === 0) return rawSlice.toString('utf8');
      if (compression === 8) return zlib.inflateRawSync(rawSlice).toString('utf8');
      throw new Error(`Unsupported ZIP compression ${compression} for ${fileName}`);
    });

    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function decodeXml(str) {
  return (str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function parseSharedStrings(xml) {
  const strings = [];
  if (!xml) return strings;
  const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRegex.exec(xml)) !== null) {
    const inner = m[1];
    let text = '';
    const tRegex = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g;
    let tm;
    while ((tm = tRegex.exec(inner)) !== null) {
      text += decodeXml(tm[1]);
    }
    strings.push(text);
  }
  return strings;
}

function isRedRgb(rgb) {
  if (!rgb || rgb.length !== 8 || rgb === '00000000' || rgb === 'FF000000' || rgb === 'FFFFFFFF') {
    return false;
  }
  const r = parseInt(rgb.slice(2, 4), 16);
  const g = parseInt(rgb.slice(4, 6), 16);
  const b = parseInt(rgb.slice(6, 8), 16);
  return r >= 180 && g <= 80 && b <= 80;
}

function parseOosStyles(stylesXml) {
  const oosStyleIds = new Set();
  if (!stylesXml) return oosStyleIds;

  const fontsBlock = (stylesXml.match(/<fonts\b[^>]*>([\s\S]*?)<\/fonts>/) || [])[1] || '';
  const oosFontIds = new Set();
  let fIdx = 0;
  for (const fm of fontsBlock.matchAll(/<font(?:\s+([^>]*?))?(?:\/>|>([\s\S]*?)<\/font>)/g)) {
    const body = fm[2] || '';
    const hasStrike = /<strike\b[^>]*val="(?:1|true)"|<strike\s*\/>/i.test(body);
    const rgbMatch = body.match(/<color\b[^>]*rgb="([0-9A-Fa-f]{8})"/i);
    if (hasStrike || (rgbMatch && isRedRgb(rgbMatch[1].toUpperCase()))) {
      oosFontIds.add(fIdx);
    }
    fIdx++;
  }

  const xfsBlock = (stylesXml.match(/<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/) || [])[1] || '';
  let xfIdx = 0;
  for (const xm of xfsBlock.matchAll(/<xf(?:\s+([^>]*?))?(?:\/>|>([\s\S]*?)<\/xf>)/g)) {
    const attrs = xm[1] || '';
    const fontIdMatch = attrs.match(/\bfontId="(\d+)"/);
    if (fontIdMatch && oosFontIds.has(Number(fontIdMatch[1]))) {
      oosStyleIds.add(xfIdx);
    }
    xfIdx++;
  }
  return oosStyleIds;
}

function colLettersToIndex(letters) {
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx; // 1-based: A=1, B=2, ...
}

function parseWorksheetRows(sheetXml, sharedStrings, oosStyleIds) {
  const rows = [];
  const rowRegex = /<row(?:\s+([^>]*?))?(?:\/>|>([\s\S]*?)<\/row>)/g;
  let rm;
  while ((rm = rowRegex.exec(sheetXml)) !== null) {
    const rAttr = rm[1] || '';
    const rBody = rm[2] || '';
    if (!rBody) continue;
    const rowNumMatch = rAttr.match(/\br="(\d+)"/);
    const rowNum = rowNumMatch ? Number(rowNumMatch[1]) : 0;
    const cells = {};

    const cellRegex = /<c(?:\s+([^>]*?))?(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cm;
    while ((cm = cellRegex.exec(rBody)) !== null) {
      const cAttr = cm[1] || '';
      const cBody = cm[2] || '';
      const refMatch = cAttr.match(/\br="([A-Z]+)\d+"/);
      if (!refMatch) continue;
      const col = colLettersToIndex(refMatch[1]);
      if (col > 10) continue; // We only read cols A..I

      const tMatch = cAttr.match(/\bt="([^"]+)"/);
      const sMatch = cAttr.match(/\bs="(\d+)"/);
      const type = tMatch ? tMatch[1] : '';
      const styleId = sMatch ? Number(sMatch[1]) : -1;

      let value = null;
      if (type === 'inlineStr') {
        let txt = '';
        for (const tm of cBody.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) {
          txt += decodeXml(tm[1]);
        }
        value = txt;
      } else {
        const vMatch = cBody.match(/<v>([\s\S]*?)<\/v>/);
        if (vMatch) {
          const rawV = vMatch[1];
          if (type === 's') {
            value = sharedStrings[Number(rawV)] ?? '';
          } else if (type === 'str' || type === 'e') {
            value = decodeXml(rawV);
          } else {
            const num = Number(rawV);
            value = Number.isNaN(num) ? decodeXml(rawV) : num;
          }
        }
      }

      cells[col] = {
        value,
        oos: oosStyleIds.has(styleId),
      };
    }
    rows.push({ rowNum, cells });
  }
  return rows;
}

function getSheetPaths(files) {
  const wbXml = files.get('xl/workbook.xml')();
  const relsXml = files.get('xl/_rels/workbook.xml.rels')();

  const relMap = new Map();
  for (const m of relsXml.matchAll(/<Relationship\b([^>]*)\/>/g)) {
    const attrs = m[1];
    const id = (attrs.match(/\bId="([^"]+)"/) || [])[1];
    const target = (attrs.match(/\bTarget="([^"]+)"/) || [])[1];
    if (id && target) {
      const normalized = target.startsWith('/') ? target.slice(1) : (target.startsWith('xl/') ? target : `xl/${target}`);
      relMap.set(id, normalized);
    }
  }

  const sheetMap = new Map();
  for (const m of wbXml.matchAll(/<sheet\b([^>]*)\/>/g)) {
    const attrs = m[1];
    const name = decodeXml((attrs.match(/\bname="([^"]+)"/) || [])[1] || '');
    const rid = (attrs.match(/\br:id="([^"]+)"/) || [])[1];
    if (name && rid && relMap.has(rid)) {
      sheetMap.set(name, relMap.get(rid));
    }
  }
  return sheetMap;
}

function parsePrice(val) {
  if (typeof val === 'number') return Number.isFinite(val) ? Math.round(val) : null;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d.]/g, '');
    if (!cleaned) return null;
    const num = Math.round(Number(cleaned));
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  return null;
}

function parseWorkbookBuffer(buf) {
  const files = unzipEntries(buf);
  const sharedStrings = files.has('xl/sharedStrings.xml')
    ? parseSharedStrings(files.get('xl/sharedStrings.xml')())
    : [];
  const oosStyleIds = files.has('xl/styles.xml')
    ? parseOosStyles(files.get('xl/styles.xml')())
    : new Set();
  const sheetPaths = getSheetPaths(files);

  const decants = [];
  const bottles = [];
  const stats = {
    decantRowsRead: 0,
    decantRowsOosSkipped: 0,
    decantSizeCellsOosSkipped: 0,
    bnibRowsRead: 0,
    bnibRowsOosSkipped: 0,
    excludedNonMe: 0,
  };

  // 1. ME Decant Price (Cols: B=Brand, C=Name, D=4ml, E=8ml, F=10ml, G=20ml, H=30ml, I=Inspo)
  const decantPath = sheetPaths.get('ME Decant Price');
  if (decantPath && files.has(decantPath)) {
    const rows = parseWorksheetRows(files.get(decantPath)(), sharedStrings, oosStyleIds);
    for (const row of rows) {
      if (row.rowNum < 13) continue;
      const bCell = row.cells[2];
      const nCell = row.cells[3];
      const brandRaw = String(bCell?.value || '').trim();
      const nameRaw = String(nCell?.value || '').trim();
      if (!brandRaw || !nameRaw) continue;
      if (/^brand/i.test(brandRaw) || /^perfume/i.test(nameRaw)) continue;

      if (isDesignerOrNonSingleME(brandRaw, nameRaw)) {
        stats.excludedNonMe++;
        continue;
      }

      if (bCell?.oos || nCell?.oos) {
        stats.decantRowsOosSkipped++;
        continue;
      }

      const sizeCols = [
        [4, '4ml'],
        [5, '8ml'],
        [6, '10ml'],
        [7, '20ml'],
        [8, '30ml'],
      ];
      const sizes = {};
      for (const [colIdx, szLabel] of sizeCols) {
        const c = row.cells[colIdx];
        if (!c) continue;
        if (c.oos) {
          stats.decantSizeCellsOosSkipped++;
          continue;
        }
        const p = parsePrice(c.value);
        if (p && p >= 50 && p <= 15000) {
          sizes[szLabel] = p;
        }
      }
      if (Object.keys(sizes).length === 0) continue;

      const inspo = String(row.cells[9]?.value || '').trim();
      const norm = normalizeARItem(brandRaw, nameRaw);
      stats.decantRowsRead++;
      decants.push({
        rawBrand: brandRaw,
        rawName: nameRaw,
        brand: norm.brand,
        name: norm.name,
        inspo,
        sizes,
      });
    }
  }

  // 2. BNIB price (Cols: A=Brand, B=Name, H=BNIB Price, I=Inspo)
  const bnibPath = sheetPaths.get('BNIB price');
  if (bnibPath && files.has(bnibPath)) {
    const rows = parseWorksheetRows(files.get(bnibPath)(), sharedStrings, oosStyleIds);
    for (const row of rows) {
      if (row.rowNum < 12) continue;
      const bCell = row.cells[1];
      const nCell = row.cells[2];
      const pCell = row.cells[8];
      const brandRaw = String(bCell?.value || '').trim();
      const nameRaw = String(nCell?.value || '').trim();
      if (!brandRaw || !nameRaw) continue;
      if (/^brand/i.test(brandRaw) || /^perfume/i.test(nameRaw)) continue;

      if (isNonSingleBottle(brandRaw, nameRaw)) {
        stats.excludedNonMe++;
        continue;
      }

      if (bCell?.oos || nCell?.oos || pCell?.oos) {
        stats.bnibRowsOosSkipped++;
        continue;
      }

      const price = parsePrice(pCell?.value);
      if (!price || price < 400 || price > 50000) continue;

      const inspo = String(row.cells[9]?.value || '').trim();
      const norm = normalizeARItem(brandRaw, nameRaw);
      stats.bnibRowsRead++;
      bottles.push({
        rawBrand: brandRaw,
        rawName: nameRaw,
        brand: norm.brand,
        name: norm.name,
        inspo,
        price,
      });
    }
  }

  return { decants, bottles, stats };
}

async function scrapeAromaticRabbit() {
  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(AR_SHEET_XLSX_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching Aromatic Rabbit XLSX`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error('Received unexpectedly small XLSX payload');
      return parseWorkbookBuffer(buf);
    } catch (err) {
      lastErr = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastErr;
}

if (require.main === module) {
  scrapeAromaticRabbit()
    .then(({ decants, bottles, stats }) => {
      console.log('=== Aromatic Rabbit Scrape Test ===');
      console.log('Stats:', stats);
      console.log(`Parsed ${decants.length} ME decant entries, ${bottles.length} ME BNIB bottle entries.`);
      console.log('Sample decants:', decants.slice(0, 3));
      console.log('Sample bottles:', bottles.slice(0, 3));
      const aquaDubai = decants.find((d) => d.rawName.toLowerCase().includes('aqua dubai'));
      console.log('Aqua Dubai partial-red check:', aquaDubai);
    })
    .catch((err) => {
      console.error('Scrape failed:', err);
      process.exit(1);
    });
}

module.exports = { scrapeAromaticRabbit, parseWorkbookBuffer, AR_META };
