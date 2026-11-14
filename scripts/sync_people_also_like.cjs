const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Normalizes fragrance clone inspiration strings into canonical clusters.
 */
function normalizeInspiration(raw) {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  if (s.includes('original creation') || s.includes('standalone') || s.includes('unique')) return null;

  // Clean accents and punctuation
  let clean = s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip brand prefixes
  clean = clean
    .replace(/^(by\s+)?(kilian|by\s+kilian)\s+/i, '')
    .replace(/^(parfums\s+de\s+marly|pdm)\s+/i, '')
    .replace(/^(maison\s+francis\s+kurkdjian|mfk)\s+/i, '')
    .replace(/^(yves\s+saint\s+laurent|ysl)\s+/i, '')
    .replace(/^(christian\s+dior|dior)\s+/i, '')
    .replace(/^(creed)\s+/i, '')
    .replace(/^(tom\s+ford|tf)\s+/i, '')
    .replace(/^(louis\s+vuitton|lv)\s+/i, '')
    .replace(/^(paco\s+rabanne)\s+/i, '')
    .replace(/^(jean\s+paul\s+gaultier|jpg)\s+/i, '')
    .replace(/^(chanel)\s+/i, '')
    .replace(/^(giorgio\s+armani|armani)\s+/i, '')
    .replace(/^(bvlgari|bulgari)\s+/i, '')
    .replace(/^(initio|initio\s+parfums\s+prives)\s+/i, '')
    .replace(/^(xerjoff|casamorati)\s+/i, '')
    .trim();

  // Canonical groupings
  if (clean.includes('aventus absolu') || clean.includes('absolu aventus')) return 'creed_aventus_absolu';
  if (clean.includes('aventus') && !clean.includes('cologne')) return 'creed_aventus';
  if (clean.includes('silver mountain water') || clean === 'smw') return 'creed_silver_mountain_water';
  if (clean.includes('green irish tweed') || clean === 'git') return 'creed_green_irish_tweed';
  if (clean.includes('millesime imperial')) return 'creed_millesime_imperial';
  if (clean.includes('virgin island water') || clean === 'viw') return 'creed_virgin_island_water';

  if (clean.includes('sauvage elixir')) return 'dior_sauvage_elixir';
  if (clean.includes('sauvage') && !clean.includes('elixir')) return 'dior_sauvage';
  if (clean.includes('homme intense')) return 'dior_homme_intense';
  if (clean.includes('fahrenheit')) return 'dior_fahrenheit';

  if (clean.includes('bleu electrique') || clean.includes('la nuit de l homme bleu electrique') || clean.includes('bleu electric')) return 'ysl_bleu_electrique';
  if (clean.includes('la nuit de l homme') || clean.includes('l homme')) return 'ysl_la_nuit_de_lhomme';
  if (clean.includes('tuxedo')) return 'ysl_tuxedo';
  if (clean.includes('babycat')) return 'ysl_babycat';
  if (clean.includes('ysly') || clean === 'y edp' || clean.includes('y eau de parfum') || clean === 'yves saint laurent y' || clean === 'y') return 'ysl_y_edp';

  if (clean.includes('baccarat') || clean.includes('br 540') || clean.includes('br540') || clean.includes('rouge 540')) return 'mfk_baccarat_rouge_540';
  if (clean.includes('grand soir')) return 'mfk_grand_soir';
  if (clean.includes('gentle fluidity gold')) return 'mfk_gentle_fluidity_gold';
  if (clean.includes('gentle fluidity silver')) return 'mfk_gentle_fluidity_silver';
  if (clean.includes('oud satin mood')) return 'mfk_oud_satin_mood';

  if (clean.includes('tygar')) return 'bvlgari_tygar';

  if (clean.includes('angels share') || clean.includes('angel share')) return 'kilian_angels_share';
  if (clean.includes('black phantom')) return 'kilian_black_phantom';
  if (clean.includes('straight to heaven')) return 'kilian_straight_to_heaven';
  if (clean.includes('apple brandy')) return 'kilian_apple_brandy';

  if (clean.includes('imagination')) return 'lv_imagination';
  if (clean.includes('ombre nomade')) return 'lv_ombre_nomade';
  if (clean.includes('pacific chill')) return 'lv_pacific_chill';
  if (clean.includes('afternoon swim')) return 'lv_afternoon_swim';
  if (clean.includes('limmensite') || clean.includes('l immensite')) return 'lv_limmensite';
  if (clean.includes('meteore')) return 'lv_meteore';
  if (clean.includes('symphony')) return 'lv_symphony';

  if (clean.includes('althair') || clean.includes('althair')) return 'pdm_althair';
  if (clean.includes('layton exclusif')) return 'pdm_layton_exclusif';
  if (clean.includes('layton')) return 'pdm_layton';
  if (clean.includes('pegasus exclusif')) return 'pdm_pegasus_exclusif';
  if (clean.includes('pegasus')) return 'pdm_pegasus';
  if (clean.includes('delina exclusif')) return 'pdm_delina_exclusif';
  if (clean.includes('delina')) return 'pdm_delina';
  if (clean.includes('herod')) return 'pdm_herod';
  if (clean.includes('percival')) return 'pdm_percival';
  if (clean.includes('carlisle')) return 'pdm_carlisle';
  if (clean.includes('haltane')) return 'pdm_haltane';
  if (clean.includes('greenley')) return 'pdm_greenley';
  if (clean.includes('sedley')) return 'pdm_sedley';
  if (clean.includes('godolphin')) return 'pdm_godolphin';
  if (clean.includes('valaya')) return 'pdm_valaya';

  if (clean.includes('paragon')) return 'initio_paragon';
  if (clean.includes('oud for greatness')) return 'initio_oud_for_greatness';
  if (clean.includes('side effect')) return 'initio_side_effect';
  if (clean.includes('atomic rose')) return 'initio_atomic_rose';
  if (clean.includes('musk therapy')) return 'initio_musk_therapy';

  if (clean.includes('ultra male')) return 'jpg_ultra_male';
  if (clean.includes('le male le parfum')) return 'jpg_le_male_le_parfum';
  if (clean.includes('le male elixir')) return 'jpg_le_male_elixir';
  if (clean.includes('le beau le parfum')) return 'jpg_le_beau_le_parfum';
  if (clean.includes('le beau')) return 'jpg_le_beau';

  if (clean.includes('tobacco vanille')) return 'tf_tobacco_vanille';
  if (clean.includes('lost cherry')) return 'tf_lost_cherry';
  if (clean.includes('tuscan leather')) return 'tf_tuscan_leather';
  if (clean.includes('ombre leather')) return 'tf_ombre_leather';
  if (clean.includes('oud wood')) return 'tf_oud_wood';
  if (clean.includes('bitter peach')) return 'tf_bitter_peach';
  if (clean.includes('fucking fabulous') || clean.includes('f fabulous')) return 'tf_fabulous';
  if (clean.includes('noir extreme')) return 'tf_noir_extreme';
  if (clean.includes('ebene fume')) return 'tf_ebene_fume';
  if (clean.includes('neroli portofino')) return 'tf_neroli_portofino';
  if (clean.includes('black orchid')) return 'tf_black_orchid';

  if (clean.includes('bleu de chanel')) return 'chanel_bleu_de_chanel';
  if (clean.includes('allure homme sport eau extreme')) return 'chanel_allure_homme_sport_eau_extreme';
  if (clean.includes('allure homme sport')) return 'chanel_allure_homme_sport';
  if (clean.includes('allure homme edition blanche')) return 'chanel_edition_blanche';

  if (clean.includes('invictus aqua')) return 'pr_invictus_aqua';
  if (clean.includes('invictus victory')) return 'pr_invictus_victory';
  if (clean.includes('invictus')) return 'pr_invictus';
  if (clean.includes('one million lucky') || clean.includes('1 million lucky')) return 'pr_1_million_lucky';
  if (clean.includes('one million elixir') || clean.includes('1 million elixir')) return 'pr_1_million_elixir';
  if (clean.includes('one million') || clean.includes('1 million')) return 'pr_1_million';
  if (clean.includes('black xs')) return 'pr_black_xs';

  if (clean.includes('stronger with you intensely')) return 'armani_swy_intensely';
  if (clean.includes('stronger with you absolutely')) return 'armani_swy_absolutely';
  if (clean.includes('stronger with you')) return 'armani_swy';
  if (clean.includes('acqua di gio profondo')) return 'armani_adg_profondo';
  if (clean.includes('acqua di gio profumo')) return 'armani_adg_profumo';
  if (clean.includes('acqua di gio')) return 'armani_adg';

  if (clean.includes('erba pura')) return 'xerjoff_erba_pura';
  if (clean.includes('naxos')) return 'xerjoff_naxos';
  if (clean.includes('alexandria ii')) return 'xerjoff_alexandria_ii';
  if (clean.includes('italica')) return 'xerjoff_italica';
  if (clean.includes('bouquet ideale')) return 'xerjoff_bouquet_ideale';

  if (clean.includes('hacivat')) return 'nishane_hacivat';
  if (clean.includes('ani')) return 'nishane_ani';
  if (clean.includes('hundred silent ways')) return 'nishane_hsw';

  if (clean.includes('god of fire')) return 'shl_god_of_fire';

  return clean.replace(/\s+/g, '_');
}

/**
 * Detects brand line for flanker grouping.
 */
function getLineKey(brand, name) {
  const b = (brand || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();

  const series = [
    'club de nuit', 'odyssey', 'rumz al rasasi', "bade'e al oud", 'badee al oud',
    'al nashama', 'qaed al fursan', 'amber oud', 'north stag', 'jean lowe',
    'royal blend', 'rare carbon', 'sharaf blend', 'musamam', "qaa'ed", "qa'ed",
    'maahir', 'hayaati', 'fakhar', 'turathi', 'supremacy', 'hawas', 'khamrah',
    'asad', 'yara', "l'aventure", 'laventure', 'qasamat', 'vulcan', 'nitro'
  ];

  for (const s of series) {
    if (n.startsWith(s)) {
      return `${b}::${s.replace(/[^a-z0-9]/g, '')}`;
    }
  }

  if (/^9\s*[pa]m/i.test(n)) {
    return `${b}::9pm_series`;
  }

  return null;
}

async function syncPeopleAlsoLike() {
  console.log('Fetching all fragrances from Supabase...');
  let all = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, name, brand, dna_inspiration, collection, dna_twins, flankers')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error || !data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    page++;
  }

  console.log(`Loaded ${all.length} total fragrances.`);

  // 1. Build DNA Clusters
  const dnaClusters = {};
  all.forEach(f => {
    const key = normalizeInspiration(f.dna_inspiration);
    if (key) {
      if (!dnaClusters[key]) dnaClusters[key] = [];
      dnaClusters[key].push(f.id);
    }
  });

  // 2. Build Flanker Line Groups
  const lineGroups = {};
  all.forEach(f => {
    const lineKey = getLineKey(f.brand, f.name);
    if (lineKey) {
      if (!lineGroups[lineKey]) lineGroups[lineKey] = [];
      lineGroups[lineKey].push(f.id);
    }
  });

  console.log(`Generated ${Object.keys(dnaClusters).length} DNA twin clusters and ${Object.keys(lineGroups).length} flanker series.`);

  // 3. Compute updates for every fragrance
  const updates = [];
  let twinsCount = 0;
  let flankersCount = 0;

  all.forEach(f => {
    const key = normalizeInspiration(f.dna_inspiration);
    const newTwins = key && dnaClusters[key] ? dnaClusters[key].filter(id => id !== f.id) : [];

    const lineKey = getLineKey(f.brand, f.name);
    const newFlankers = lineKey && lineGroups[lineKey] ? lineGroups[lineKey].filter(id => id !== f.id) : [];

    if (newTwins.length > 0) twinsCount++;
    if (newFlankers.length > 0) flankersCount++;

    updates.push({
      id: f.id,
      dna_twins: newTwins,
      flankers: newFlankers
    });
  });

  console.log(`Syncing ${updates.length} fragrances to Supabase...`);
  console.log(` • Fragrances with verified DNA twins: ${twinsCount}`);
  console.log(` • Fragrances with verified line flankers: ${flankersCount}`);

  // 4. Batch update Supabase in chunks of 50
  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    
    // Execute updates in parallel within the chunk
    await Promise.all(
      chunk.map(u => 
        supabase
          .from('fragrances')
          .update({
            dna_twins: u.dna_twins,
            flankers: u.flankers,
            updated_at: new Date().toISOString()
          })
          .eq('id', u.id)
      )
    );

    if ((i + chunkSize) % 250 === 0 || i + chunkSize >= updates.length) {
      console.log(`Progress: ${Math.min(i + chunkSize, updates.length)} / ${updates.length} synced...`);
    }
  }

  console.log('✅ Synchronization completed successfully!');
}

syncPeopleAlsoLike().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
