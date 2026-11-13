const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function fullTrafficReport() {
  const { count: totalLogs } = await supabase
    .from('wardrobe_logs')
    .select('*', { count: 'exact', head: true });

  let allLogs = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('wardrobe_logs')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    allLogs = allLogs.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  const dailyVisits = {};
  const dailySearches = {};
  const dailyClicks = {};
  const sessionsByDay = {};
  const allSessions = new Set();
  const sourceMap = {};
  const searchFrequency = {};
  const sellerClicks = {};
  const fragranceClicks = {};

  for (const r of allLogs) {
    const day = (r.created_at || '').slice(0, 10);
    if (!day) continue;
    const sess = r.session_id || 'unknown';
    allSessions.add(sess);

    if (!sessionsByDay[day]) sessionsByDay[day] = new Set();
    sessionsByDay[day].add(sess);

    const title = r.umbrella_title || '';
    const items = Array.isArray(r.liked_perfumes) ? r.liked_perfumes : [];

    if (title === 'EVENT:session_visit') {
      dailyVisits[day] = (dailyVisits[day] || 0) + 1;
      for (const it of items) {
        const s = it.source || 'direct';
        sourceMap[s] = (sourceMap[s] || 0) + 1;
      }
    } else if (title === 'EVENT:search_query') {
      dailySearches[day] = (dailySearches[day] || 0) + 1;
      for (const it of items) {
        if (it.query) {
          const q = it.query.toLowerCase().trim();
          if (q.length >= 2) {
            searchFrequency[q] = (searchFrequency[q] || 0) + 1;
          }
        }
      }
    } else if (title === 'EVENT:whatsapp_click') {
      dailyClicks[day] = (dailyClicks[day] || 0) + 1;
      for (const it of items) {
        if (it.seller_name) {
          sellerClicks[it.seller_name] = (sellerClicks[it.seller_name] || 0) + 1;
        }
        if (it.name) {
          const fName = (it.brand ? it.brand + ' ' : '') + it.name;
          fragranceClicks[fName] = (fragranceClicks[fName] || 0) + 1;
        }
      }
    }
  }

  console.log('\n================ DAILY TRAFFIC OVERVIEW ================');
  const sortedDays = Object.keys(sessionsByDay).sort();
  const tableData = sortedDays.map(d => ({
    Date: d,
    'Unique Visitors': sessionsByDay[d].size,
    'Page Visits': dailyVisits[d] || 0,
    'Searches Run': dailySearches[d] || 0,
    'WhatsApp Leads': dailyClicks[d] || 0
  }));
  console.table(tableData);

  console.log('\n================ TOTALS ================');
  console.log('Total Telemetry Events Logged:', totalLogs);
  console.log('Total Unique Visitors (Distinct Sessions):', allSessions.size);
  const totalVisits = Object.values(dailyVisits).reduce((a, b) => a + b, 0);
  const totalSearches = Object.values(dailySearches).reduce((a, b) => a + b, 0);
  const totalWhatsAppClicks = Object.values(dailyClicks).reduce((a, b) => a + b, 0);
  console.log('Total Page Visits Recorded:', totalVisits);
  console.log('Total Searches Run:', totalSearches);
  console.log('Total Outbound WhatsApp Buy Taps:', totalWhatsAppClicks);
  const convRate = allSessions.size > 0 ? ((totalWhatsAppClicks / allSessions.size) * 100).toFixed(2) : 0;
  console.log('Conversion Rate (WhatsApp Leads / Unique Visitors):', convRate + '%');

  console.log('\n================ TRAFFIC SOURCES ================');
  console.table(
    Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .map(([src, count]) => ({
        Source: src,
        Visits: count,
        Share: ((count / totalVisits) * 100).toFixed(1) + '%'
      }))
  );

  console.log('\n================ TOP SEARCH TERMS ================');
  const topSearches = Object.entries(searchFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([query, count]) => ({ Query: query, Searches: count }));
  console.table(topSearches);

  console.log('\n================ TOP LEADS BY SELLER ================');
  const topSellers = Object.entries(sellerClicks)
    .sort((a, b) => b[1] - a[1])
    .map(([seller, count]) => ({ Seller: seller, 'WhatsApp Leads': count }));
  console.table(topSellers);

  console.log('\n================ TOP LEADS BY PERFUME ================');
  const topFrags = Object.entries(fragranceClicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([perfume, count]) => ({ Perfume: perfume, 'WhatsApp Leads': count }));
  console.table(topFrags);
}

fullTrafficReport().catch(console.error);
