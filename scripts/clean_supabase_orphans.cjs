const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log("Supabase credentials not set in environment, exiting.");
  process.exit(0);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const fragrancesPath = path.join(__dirname, '../src/data/fragrances.json');
const catalog = JSON.parse(fs.readFileSync(fragrancesPath, 'utf-8'));
const validCatalogIds = new Set(catalog.map(f => f.id));

async function cleanOrphans() {
  console.log(`Valid catalog IDs: ${validCatalogIds.size}`);
  
  const { data, error } = await supabase.from('fragrances').select('id, name, brand');
  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  const orphans = data.filter(d => !validCatalogIds.has(d.id));
  console.log(`Found ${orphans.length} orphan entries in Supabase.`);

  for (const orphan of orphans) {
    console.log(`  Deleting orphan: [${orphan.id}] ${orphan.brand} - ${orphan.name}...`);
    const { error: delError } = await supabase.from('fragrances').delete().eq('id', orphan.id);
    if (delError) {
      console.error(`    Error deleting ${orphan.id}:`, delError.message);
    } else {
      console.log(`    ✓ Deleted ${orphan.id}`);
    }
  }

  console.log('\n--- Verifying Supabase CDN records ---');
  const { data: cdnData } = await supabase
    .from('fragrances')
    .select('id, name, concentration, community_price, community_sellers')
    .ilike('name', '%club de nuit%');

  console.log(`Remaining canonical Club de Nuit records in Supabase: ${cdnData.length}`);
  cdnData.forEach(c => {
    console.log(`- [${c.id}] ${c.name} (${c.concentration}) Lowest: ₹${c.community_price || 'N/A'}`);
  });
}

cleanOrphans();
