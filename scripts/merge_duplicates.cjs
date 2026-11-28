const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['\"](.*)['\"]$/, '$1');
});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

function mergeSellerLists(existingList, incomingList) {
  const map = new Map();
  for (const s of (existingList || [])) {
    const key = (s.seller_id || s.seller_name || '') + '_' + (s.size || '') + '_' + (s.is_tester ? 'tester' : 'retail');
    map.set(key, s);
  }
  for (const s of (incomingList || [])) {
    const key = (s.seller_id || s.seller_name || '') + '_' + (s.size || '') + '_' + (s.is_tester ? 'tester' : 'retail');
    if (!map.has(key)) {
      map.set(key, s);
    } else {
      const existing = map.get(key);
      if (s.price && (!existing.price || s.price < existing.price)) {
        map.set(key, { ...existing, ...s });
      }
    }
  }
  return Array.from(map.values()).sort((a,b) => (a.price || 999999) - (b.price || 999999));
}

async function mergeCanonical(canonicalId, duplicateIds, aliasNames) {
  console.log(`\nMerging [${duplicateIds.join(', ')}] into canonical [${canonicalId}]...`);
  const { data: canonical } = await supabase.from('fragrances').select('*').eq('id', canonicalId).single();
  if (!canonical) {
    console.error(`Canonical ${canonicalId} not found!`);
    return;
  }

  const { data: dups } = await supabase.from('fragrances').select('*').in('id', duplicateIds);
  let mergedSellers = canonical.community_sellers || [];
  let mergedDecants = canonical.community_decants || [];
  let mergedAliases = new Set(canonical.aliases || []);

  for (const alias of aliasNames) mergedAliases.add(alias.toLowerCase());

  for (const d of dups) {
    mergedSellers = mergeSellerLists(mergedSellers, d.community_sellers);
    if (d.community_decants && d.community_decants.length > 0) {
      const decMap = new Map();
      for (const dec of mergedDecants) decMap.set(dec.seller_id || dec.seller_name, dec);
      for (const dec of d.community_decants) {
        const k = dec.seller_id || dec.seller_name;
        if (!decMap.has(k)) decMap.set(k, dec);
      }
      mergedDecants = Array.from(decMap.values());
    }
    mergedAliases.add(d.name.toLowerCase());
  }

  const lowestPrice = mergedSellers.length > 0 ? Math.min(...mergedSellers.map(s => s.price).filter(Boolean)) : canonical.community_price;
  const bestSeller = mergedSellers.length > 0 ? mergedSellers[0].seller_name : canonical.best_bottle_seller;

  const updatePayload = {
    community_sellers: mergedSellers,
    community_decants: mergedDecants,
    community_price: lowestPrice,
    best_bottle_seller: bestSeller,
    in_seller_stock: mergedSellers.length > 0 || canonical.in_seller_stock,
    aliases: Array.from(mergedAliases)
  };

  const { error: updErr } = await supabase.from('fragrances').update(updatePayload).eq('id', canonicalId);
  if (updErr) {
    console.error(`Error updating canonical ${canonicalId}:`, updErr.message);
    return;
  }
  console.log(`✓ Updated canonical ${canonicalId}: ${mergedSellers.length} sellers, lowest price ₹${lowestPrice}`);

  // Delete duplicates
  const { error: delErr } = await supabase.from('fragrances').delete().in('id', duplicateIds);
  if (delErr) {
    console.error(`Error deleting duplicates:`, delErr.message);
  } else {
    console.log(`✓ Deleted duplicates: ${duplicateIds.join(', ')}`);
  }
}

async function runAll() {
  await mergeCanonical('afnan-tribute-blue', ['st-9065'], ['tribute blu', 'afnan tribute blu']);
  await mergeCanonical('afnan-modest-une', ['st-9066'], ['modest pour homme une', 'afnan modest pour homme une']);
  await mergeCanonical('lattafa-his-confession', ['apex-lattafa-hisconfessionformen', 'st-9220'], ['his confession for men', 'his confession for man']);
  console.log('\nAll 3 synthetic duplicates merged into canonical primary entities!');
}

runAll().catch(console.error);
