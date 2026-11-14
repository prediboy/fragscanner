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

async function run() {
  let all = [];
  let page = 0;
  while (true) {
    const { data } = await sb.from('fragrances')
      .select('id, name, brand, in_seller_stock, has_decants, dna_inspiration')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    page++;
  }

  const clean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const map = new Map();

  all.forEach(f => {
    const b = clean(f.brand);
    const n = clean(f.name);
    const key = `${b}:::${n}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(f);
  });

  const dupes = [];
  for (const [key, list] of map.entries()) {
    if (list.length > 1) {
      dupes.push({ key, list });
    }
  }

  console.log(`Total duplicate pairs/groups in database: ${dupes.length}`);
  dupes.forEach(({ key, list }) => {
    console.log(`\nDuplicate: [${key}]`);
    list.forEach(f => console.log(`   ${f.id.padEnd(35)} | ${f.brand} - ${f.name} (Stock: ${f.in_seller_stock}, Decants: ${f.has_decants}) [DNA: ${f.dna_inspiration}]`));
  });
}

run().catch(console.error);
