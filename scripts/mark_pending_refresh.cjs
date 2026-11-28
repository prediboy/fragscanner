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

const TRACKING_PATH = path.join(__dirname, '../data/fragrantica_pending_refresh.json');

async function markPending() {
  console.log('Fetching fragrances missing in-database images...');
  const { data: missing, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, notes')
    .is('notes->image_data', null);

  if (error) {
    console.error('Error fetching missing fragrances:', error.message);
    return;
  }

  console.log(`Found ${missing.length} fragrances without in-database images.`);
  const now = new Date().toISOString();
  const trackingList = [];
  const updates = [];

  for (const f of missing) {
    const currentNotes = (f.notes && typeof f.notes === 'object') ? f.notes : {};
    const updatedNotes = {
      ...currentNotes,
      needs_image_refresh: true,
      image_status: 'to_be_refreshed_from_fragrantica',
      fetch_target: 'fragrantica',
      refresh_requested_at: now
    };

    updates.push({
      id: f.id,
      notes: updatedNotes
    });

    trackingList.push({
      id: f.id,
      brand: f.brand,
      name: f.name,
      status: 'to_be_refreshed_from_fragrantica',
      needs_image_refresh: true,
      refresh_requested_at: now
    });
  }

  console.log(`Writing flags to Supabase in batches of 25...`);
  const BATCH_SIZE = 25;
  let written = 0;

  for (let b = 0; b < updates.length; b += BATCH_SIZE) {
    const slice = updates.slice(b, b + BATCH_SIZE);
    await Promise.all(slice.map(async (u) => {
      const { id, notes } = u;
      const { error: updErr } = await supabase.from('fragrances').update({ notes }).eq('id', id);
      if (!updErr) written++;
      else console.warn(`Warning updating ${id}:`, updErr.message);
    }));
    process.stdout.write(`\rProgress: ${written} / ${updates.length} marked in Supabase`);
  }

  console.log('\n✅ Successfully marked all items in Supabase as to be refreshed from Fragrantica!');

  fs.writeFileSync(TRACKING_PATH, JSON.stringify(trackingList, null, 2));
  console.log(`💾 Saved detailed tracking list of ${trackingList.length} items to ${TRACKING_PATH}`);
}

markPending().catch(console.error);
