/**
 * clean_sub_50pct_prices.cjs
 * 
 * Audits all price_trends against current retail full bottle pricing in fragrances.
 * Quarantines any historical price where price < 0.5 * current_retail_bottle_price.
 */
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const lines = env.split('\n');
const envVars = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['\"]|['\"]$/g, '');
}

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function cleanSub50() {
  console.log('Fetching all fragrances with current retail bottle prices...');
  let frags = [];
  let from = 0;
  while (true) {
    const { data } = await sb.from('fragrances')
      .select('id, name, brand, community_price, in_seller_stock, community_sellers')
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    frags.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  const fragPrices = {};
  for (const f of frags) {
    let p = Number(f.community_price || 0);
    if (p <= 0 && Array.isArray(f.community_sellers)) {
      const valid = f.community_sellers.filter(s => !s.is_tester && !s.is_partial && Number(s.price) > 0);
      if (valid.length > 0) p = Math.min(...valid.map(s => Number(s.price)));
    }
    if (p > 0) {
      fragPrices[f.id] = { name: f.name, price: p };
      fragPrices[f.name.toLowerCase().trim()] = { id: f.id, name: f.name, price: p };
    }
  }

  console.log('Loaded ' + Object.keys(fragPrices).length + ' fragrance retail price baselines.');

  let allTrends = [];
  from = 0;
  while (true) {
    const { data } = await sb.from('price_trends')
      .select('id, fragrance_id, fragrance_name, seller_name, price, format, size, recorded_at')
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    allTrends.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  const toQuarantine = [];
  for (const t of allTrends) {
    if (t.format === 'duplicate_archived' || t.format === 'outlier_anomalous') continue;
    let base = null;
    if (t.fragrance_id && fragPrices[t.fragrance_id]) base = fragPrices[t.fragrance_id];
    else if (t.fragrance_name && fragPrices[t.fragrance_name.toLowerCase().trim()]) base = fragPrices[t.fragrance_name.toLowerCase().trim()];

    if (base && base.price > 0) {
      const price = Number(t.price);
      if (price < 0.5 * base.price) {
        toQuarantine.push({
          id: t.id,
          name: t.fragrance_name,
          currentPrice: base.price,
          trendPrice: price,
          dropPct: Math.round(((base.price - price) / base.price) * 100),
          seller: t.seller_name
        });
      }
    }
  }

  console.log('Found ' + toQuarantine.length + ' sub-50% historical prices.');
  if (toQuarantine.length > 0) {
    const ids = toQuarantine.map(x => x.id);
    for (let i = 0; i < ids.length; i += 200) {
      const batch = ids.slice(i, i + 200);
      await sb.from('price_trends').update({ format: 'outlier_anomalous' }).in('id', batch);
    }
    console.log('Quarantined all ' + toQuarantine.length + ' rows as outlier_anomalous.');
  }

  const { count } = await sb.from('price_trends')
    .select('*', { count: 'exact', head: true })
    .in('format', ['retail', 'bottle']);
  console.log('Clean verified bottle records in DB: ' + count);
}

cleanSub50();
