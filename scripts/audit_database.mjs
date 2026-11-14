import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const m = envText.match(new RegExp(`${key}=([^\\s]+)`));
  return m ? m[1].replace(/['"]/g, '') : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');
const sb = createClient(supabaseUrl, supabaseKey);

async function scan() {
  console.log('Fetching all fragrances from Supabase...');
  let all = [];
  let page = 0;
  while (true) {
    const { data, error } = await sb.from('fragrances')
      .select('id, name, brand, dna_type, dna_inspiration, accords, top_notes, middle_notes, base_notes, notes, in_seller_stock, has_decants, community_price, lowest_decant_price')
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (error) {
      console.error('Fetch error:', error);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Total fragrances loaded: ${all.length}`);

  // 1. Check identical note signatures across multiple perfumes
  const signatureMap = new Map();
  for (const f of all) {
    const top = (f.top_notes || []).map(n => n.toLowerCase().trim()).sort().join(',');
    const mid = (f.middle_notes || []).map(n => n.toLowerCase().trim()).sort().join(',');
    const base = (f.base_notes || []).map(n => n.toLowerCase().trim()).sort().join(',');
    const sig = `${top} || ${mid} || ${base}`;
    if (!signatureMap.has(sig)) {
      signatureMap.set(sig, []);
    }
    signatureMap.get(sig).push(f);
  }

  console.log('\n--- NOTE REPETITION CLUSTERS (Same exact notes on 3+ fragrances) ---');
  let duplicateNoteCount = 0;
  for (const [sig, list] of signatureMap.entries()) {
    if (sig === ' ||  || ') continue; // empty notes handled separately
    if (list.length >= 3) {
      console.log(`\nCluster of ${list.length} perfumes sharing: [${sig}]`);
      list.slice(0, 10).forEach(f => console.log(`  - ${f.id} | ${f.brand} - ${f.name} (DNA: ${f.dna_inspiration})`));
      if (list.length > 10) console.log(`  ... and ${list.length - 10} more`);
      duplicateNoteCount += list.length;
    }
  }

  // 2. Check Empty Notes or Missing Accords
  const missingNotes = all.filter(f => (!f.top_notes || f.top_notes.length === 0) && (!f.notes?.top || f.notes.top.length === 0));
  const missingAccords = all.filter(f => !f.accords || f.accords.length === 0);
  const inStockMissingNotes = missingNotes.filter(f => f.in_seller_stock || f.has_decants);

  console.log(`\n--- MISSING DATA STATS ---`);
  console.log(`Perfumes with completely missing top_notes: ${missingNotes.length} (In stock: ${inStockMissingNotes.length})`);
  console.log(`Perfumes with missing accords: ${missingAccords.length}`);

  // 3. Check Accords vs Notes Discrepancies
  // E.g., accord says Citrus is #1 accord (score >= 80) but ZERO citrus notes exist in top, middle, base
  const citrusKeywords = ['lemon', 'bergamot', 'citrus', 'lime', 'grapefruit', 'orange', 'mandarin', 'yuzu', 'clementine', 'tangerine', 'neroli', 'petitgrain', 'pomelo'];
  const citrusDiscrepancies = [];
  
  for (const f of all) {
    const accords = f.accords || [];
    const hasCitrusAccord = accords.some(a => (a.name || a).toLowerCase().includes('citrus') && (a.score ? a.score >= 70 : true));
    const allNotes = [
      ...(f.top_notes || []),
      ...(f.middle_notes || []),
      ...(f.base_notes || []),
      ...(f.notes?.top || []),
      ...(f.notes?.middle || []),
      ...(f.notes?.base || [])
    ].map(n => n.toLowerCase());

    const hasCitrusNote = allNotes.some(n => citrusKeywords.some(c => n.includes(c)));

    // Case A: Accords say heavy Citrus, but NO citrus notes at all!
    if (hasCitrusAccord && !hasCitrusNote && allNotes.length > 0) {
      citrusDiscrepancies.push({ f, issue: 'Has Citrus accord (>=70) but ZERO citrus notes in pyramid' });
    }
    // Case B: Top notes have heavy citrus (e.g. lemon, bergamot), but accords say Sweet/Vanilla/Leather with 0 citrus
    const topHasCitrus = (f.top_notes || []).some(n => citrusKeywords.some(c => n.toLowerCase().includes(c)));
    if (!hasCitrusAccord && topHasCitrus && accords.length > 0) {
      // check if it's strange
    }
  }

  console.log(`\n--- CITRUS ACCORD VS NOTES DISCREPANCIES (${citrusDiscrepancies.length}) ---`);
  citrusDiscrepancies.slice(0, 15).forEach(({ f, issue }) => {
    console.log(`- ${f.id} | ${f.brand} - ${f.name} | Accords: ${JSON.stringify(f.accords?.map(a => a.name))} | Top: ${JSON.stringify(f.top_notes)}`);
  });

  // 4. Check DNA Inspiration Mismatches
  // e.g., Sedley clones that aren't Sedley, or Sedley clones notes
  const sedleyClones = all.filter(f => (f.dna_inspiration || '').toLowerCase().includes('sedley'));
  console.log(`\n--- PERFUMES TAGGED AS SEDLEY CLONE (${sedleyClones.length}) ---`);
  sedleyClones.forEach(f => {
    console.log(`- ${f.id} | ${f.brand} - ${f.name} | Top: ${JSON.stringify(f.top_notes)} | Accords: ${JSON.stringify(f.accords?.map(a => a.name))}`);
  });

  // 5. Check "apex-" and "st-" legacy prefix items (often where bulk imports had template defaults)
  const legacyItems = all.filter(f => f.id.startsWith('apex-') || f.id.startsWith('st-'));
  console.log(`\n--- LEGACY PREFIX ITEMS ('apex-' or 'st-'): ${legacyItems.length} ---`);
  const legacyInStock = legacyItems.filter(f => f.in_seller_stock || f.has_decants);
  console.log(`Legacy items in stock: ${legacyInStock.length}`);

  // Check how many have Sedley notes (Lemon, Mint, Bergamot, Grapefruit)
  const sedleyNoteSignature = 'bergamot,grapefruit,lemon,mint';
  const hasSedleyNotes = all.filter(f => {
    const top = (f.top_notes || []).map(n => n.toLowerCase().trim()).sort().join(',');
    return top === sedleyNoteSignature;
  });
  console.log(`\n--- PERFUMES WITH EXACT SEDLEY TOP NOTES (Lemon, Mint, Bergamot, Grapefruit): ${hasSedleyNotes.length} ---`);
  hasSedleyNotes.forEach(f => {
    console.log(`- ${f.id} | ${f.brand} - ${f.name} | DNA: ${f.dna_inspiration} | Accords: ${JSON.stringify(f.accords?.map(a => a.name))}`);
  });

  // Check how many have Aventus top notes (Pineapple, Bergamot, Black Currant, Apple)
  const aventusNoteSignature = 'apple,bergamot,black currant,pineapple';
  const hasAventusNotes = all.filter(f => {
    const top = (f.top_notes || []).map(n => n.toLowerCase().trim()).sort().join(',');
    return top.includes('pineapple') && top.includes('bergamot') && top.includes('black currant');
  });
  console.log(`\n--- PERFUMES WITH AVENTUS TOP NOTES: ${hasAventusNotes.length} ---`);
  hasAventusNotes.slice(0, 10).forEach(f => {
    console.log(`- ${f.id} | ${f.brand} - ${f.name} | DNA: ${f.dna_inspiration}`);
  });

  // Check missing embeddings
  const { count: missingEmbeddingCount } = await sb.from('fragrances')
    .select('id', { count: 'exact', head: true })
    .is('review_embedding', null);
  console.log(`\n--- MISSING/NULL EMBEDDINGS COUNT: ${missingEmbeddingCount} ---`);
}

scan().catch(console.error);
