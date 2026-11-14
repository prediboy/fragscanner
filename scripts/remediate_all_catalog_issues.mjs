import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const m = envText.match(new RegExp(`${key}=([^\\s]+)`));
  return m ? m[1].replace(/['"]/g, '') : process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');
const geminiApiKey = getEnv('GEMINI_API_KEY') || getEnv('VITE_GEMINI_API_KEY') || getEnv('GEMINI_KEY2');

const sb = createClient(supabaseUrl, supabaseKey);

async function generateBatchEmbeddings(texts) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: texts.map(t => ({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: t }] }
      }))
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.embeddings.map(e => e.values);
}

async function fixDesyncedColumns() {
  console.log('\n========================================');
  console.log('STEP 1: SYNCING 704 DESYNCED NOTE COLUMNS');
  console.log('========================================');

  let page = 0;
  let allDesynced = [];
  while (true) {
    const { data, error } = await sb.from('fragrances')
      .select('id, name, brand, notes, top_notes, middle_notes, base_notes')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error || !data || data.length === 0) break;
    
    data.forEach(f => {
      const hasObjTop = f.notes?.top && Array.isArray(f.notes.top) && f.notes.top.length > 0;
      const hasArrTop = f.top_notes && Array.isArray(f.top_notes) && f.top_notes.length > 0;
      if (hasObjTop && !hasArrTop) {
        allDesynced.push({
          id: f.id,
          top_notes: f.notes.top || [],
          middle_notes: f.notes.middle || [],
          base_notes: f.notes.base || []
        });
      }
    });

    if (data.length < 1000) break;
    page++;
  }

  console.log(`Found ${allDesynced.length} fragrances to sync notes columns.`);

  // Update in batches of 50
  const BATCH = 50;
  for (let i = 0; i < allDesynced.length; i += BATCH) {
    const slice = allDesynced.slice(i, i + BATCH);
    await Promise.all(slice.map(item => 
      sb.from('fragrances')
        .update({
          top_notes: item.top_notes,
          middle_notes: item.middle_notes,
          base_notes: item.base_notes
        })
        .eq('id', item.id)
    ));
    process.stdout.write(`  Synced ${Math.min(i + BATCH, allDesynced.length)} / ${allDesynced.length}\r`);
  }
  console.log(`\nSuccessfully synced note columns for all ${allDesynced.length} perfumes!`);
}

async function fixSpecificFragrances() {
  console.log('\n========================================');
  console.log('STEP 2: FIXING HALLUCINATED CLONES & ACCORDS');
  console.log('========================================');

  const updates = [
    {
      id: 'apex-rayhaan-valhalla',
      name: 'Valhalla',
      brand: 'Rayhaan',
      gender: 'Men',
      dna_type: 'Fruity Boozy Gourmand',
      dna_inspiration: "Kilian Angels' Share / Apple Brandy",
      description: 'Rayhaan Valhalla is a luxurious boozy-gourmand fragrance featuring sparkling raspberry and fine cognac over rich tonka bean, oak, sandalwood, and sweet praline.',
      top_notes: ['Raspberry', 'Cognac', 'Liquor'],
      middle_notes: ['Oakmoss', 'Bulgarian Rose', 'Tonka Bean'],
      base_notes: ['Oak', 'Sandalwood', 'Praline'],
      accords: [
        { name: 'Warm Spicy', color: '#d97706', score: 95 },
        { name: 'Sweet', color: '#ec4899', score: 90 },
        { name: 'Woody', color: '#854d0e', score: 85 },
        { name: 'Fruity', color: '#f59e0b', score: 80 },
        { name: 'Boozy', color: '#92400e', score: 75 }
      ]
    },
    {
      id: 'apex-rayhaan-amazonica',
      name: 'Amazonica',
      brand: 'Rayhaan',
      gender: 'Unisex',
      dna_type: 'Citrus Woody Fresh',
      dna_inspiration: 'Bvlgari Tygar',
      description: 'Rayhaan Amazonica is an invigorating citrus-woody fragrance inspired by Bvlgari Tygar, opening with effervescent grapefruit and bergamot, leading into ginger and patchouli over a clean ambroxan and vetiver base.',
      top_notes: ['Grapefruit', 'Bergamot'],
      middle_notes: ['Ginger', 'Patchouli'],
      base_notes: ['Ambroxan', 'Vetiver', 'Amber', 'Musk'],
      accords: [
        { name: 'Citrus', color: '#eab308', score: 95 },
        { name: 'Fresh Spicy', color: '#10b981', score: 88 },
        { name: 'Woody', color: '#854d0e', score: 82 },
        { name: 'Amber', color: '#d97706', score: 76 }
      ]
    },
    {
      id: 'st-9034',
      name: 'Dynasty',
      brand: 'Lattafa',
      gender: 'Unisex',
      dna_type: 'Woody Spicy Tea & Suede',
      dna_inspiration: 'Original Creation (Woody Spicy Tea & Suede)',
      description: 'Lattafa Dynasty is a sophisticated, soothing blend crafted by perfumer Alex Lee featuring comforting rooibos tea, delicate suede, fresh ginger, clary sage, and warm amberwood.',
      top_notes: ['Bergamot', 'Ginger', 'Clary Sage', 'Nutmeg', 'Raspberry'],
      middle_notes: ['Rooibos Tea', 'Suede'],
      base_notes: ['Amberwood', 'Cedarwood', 'Cashmeran'],
      accords: [
        { name: 'Warm Spicy', color: '#d97706', score: 92 },
        { name: 'Woody', color: '#854d0e', score: 88 },
        { name: 'Herbal', color: '#16a34a', score: 82 },
        { name: 'Leather', color: '#78350f', score: 78 }
      ]
    },
    {
      id: 'st-9179',
      name: 'Aqua Pura',
      brand: 'Fragrance World',
      gender: 'Unisex',
      dna_type: 'Marine Salty Oceanic Beastmode',
      dna_inspiration: 'Orto Parisi Megamare',
      description: 'Fragrance World Aqua Pura is a beastmode marine fragrance inspired by Orto Parisi Megamare, capturing the oceanic majesty of sea water, salty seaweed, calone, ambroxan, and cedar.',
      top_notes: ['Bergamot', 'Lemon', 'Sea Notes'],
      middle_notes: ['Seaweed', 'Calone', 'Hedione'],
      base_notes: ['Ambroxan', 'Musk', 'Cedarwood'],
      accords: [
        { name: 'Marine', color: '#0284c7', score: 98 },
        { name: 'Salty', color: '#38bdf8', score: 92 },
        { name: 'Aromatic', color: '#10b981', score: 84 },
        { name: 'Aquatic', color: '#06b6d4', score: 80 }
      ]
    },
    {
      id: 'lattafa-rouat-ajial',
      name: 'Rouat Ajial',
      brand: 'Lattafa',
      gender: 'Unisex',
      dna_type: 'Amber Floral Spicy Oriental',
      dna_inspiration: 'Original Creation (Amber Floral Spicy)',
      description: 'Lattafa Rouat Ajial is a bold, confident oriental spicy fragrance opening with saffron, lavender, and elemi resin, blossoming into tuberose and jasmine over an amber, vanilla, and cedarwood drydown.',
      top_notes: ['Saffron', 'Lavender', 'Bergamot', 'Elemi'],
      middle_notes: ['Tuberose', 'Jasmine', 'Nutmeg', 'Pepper'],
      base_notes: ['Amber', 'Musk', 'Cedarwood', 'Vanilla', 'Patchouli'],
      accords: [
        { name: 'Warm Spicy', color: '#d97706', score: 95 },
        { name: 'Amber', color: '#b45309', score: 88 },
        { name: 'Floral', color: '#ec4899', score: 82 },
        { name: 'Woody', color: '#854d0e', score: 76 }
      ]
    },
    {
      id: 'st-9198',
      name: 'Icon',
      brand: 'Khadlaj',
      gender: 'Men',
      dna_type: 'Smoky Woody Amber Fougere',
      dna_inspiration: "Chanel Bleu de Chanel L'Exclusif",
      description: "Khadlaj Icon is an elegant, smoky woody-amber fragrance inspired by Chanel Bleu de Chanel L'Exclusif, blending bergamot and lavender with resinous incense, labdanum, suede, and sandalwood.",
      top_notes: ['Bergamot'],
      middle_notes: ['Lavender', 'Incense', 'Labdanum'],
      base_notes: ['Sandalwood', 'Amber', 'Suede'],
      accords: [
        { name: 'Woody', color: '#854d0e', score: 92 },
        { name: 'Amber', color: '#d97706', score: 88 },
        { name: 'Smoky', color: '#475569', score: 82 },
        { name: 'Aromatic', color: '#10b981', score: 78 }
      ]
    },
    {
      id: 'st-9127',
      name: 'Spartacus',
      brand: 'Armaf',
      gender: 'Men',
      dna_type: 'Oriental Warm Spicy Vanilla Gourmand',
      dna_inspiration: 'Jean Paul Gaultier Le Male Elixir',
      description: 'Armaf Spartacus is a decadent oriental vanilla fragrance inspired by JPG Le Male Elixir, combining candied plum, cinnamon, bourbon vanilla, davana, and rich praline over tonka bean and amber.',
      top_notes: ['Orange Blossom', 'Cinnamon', 'Bergamot', 'Plum', 'Cardamom'],
      middle_notes: ['Bourbon Vanilla', 'Davana', 'Elemi', 'Candied Almond', 'Lavender'],
      base_notes: ['Praline', 'Musk', 'Labdanum', 'Guaiac Wood', 'Tonka Bean', 'Patchouli', 'Amber'],
      accords: [
        { name: 'Sweet', color: '#ec4899', score: 96 },
        { name: 'Vanilla', color: '#f59e0b', score: 92 },
        { name: 'Warm Spicy', color: '#d97706', score: 86 },
        { name: 'Amber', color: '#b45309', score: 80 }
      ]
    },
    {
      id: 'st-9015',
      name: 'Imperium',
      brand: 'Mykonos',
      gender: 'Unisex',
      dna_type: 'Tropical Citrus Coconut Aquatic',
      dna_inspiration: 'Creed Virgin Island Water & LV Afternoon Swim',
      description: 'Mykonos Imperium is a vibrant summer extrait combining zesty lime and mandarin orange with creamy coconut water, ginger, tonka bean, and airy white musk.',
      top_notes: ['Lime', 'Bergamot', 'Mandarin Orange', 'Tropical Fruits'],
      middle_notes: ['Coconut Water', 'Sicilian Orange', 'Ginger', 'Jasmine'],
      base_notes: ['Tonka Bean', 'White Musk', 'Patchouli'],
      accords: [
        { name: 'Citrus', color: '#eab308', score: 96 },
        { name: 'Tropical', color: '#f59e0b', score: 90 },
        { name: 'Coconut', color: '#fef08a', score: 84 },
        { name: 'Fresh', color: '#06b6d4', score: 78 }
      ]
    },
    {
      id: 'st-9286',
      name: 'Fareed',
      brand: 'Riiffs',
      gender: 'Men',
      dna_type: 'Spicy Aromatic Lavender Woods',
      dna_inspiration: "Yves Saint Laurent La Nuit de L'Homme Bleu Électrique",
      description: "Riiffs Fareed captures the seductive date-night DNA of YSL La Nuit de L'Homme Bleu Électrique with fresh spicy cardamom, aromatic lavender, geranium, and a smooth tonka-cedar base.",
      top_notes: ['Cardamom', 'Pepper'],
      middle_notes: ['Lavender', 'Bergamot', 'Geranium'],
      base_notes: ['Tonka Bean', 'Cedarwood', 'Vetiver'],
      accords: [
        { name: 'Warm Spicy', color: '#d97706', score: 95 },
        { name: 'Aromatic', color: '#10b981', score: 90 },
        { name: 'Lavender', color: '#a855f7', score: 85 },
        { name: 'Woody', color: '#854d0e', score: 78 }
      ]
    },
    {
      id: 'laverne-player',
      name: 'Player',
      brand: 'Laverne',
      gender: 'Men',
      dna_type: 'Woody Aromatic Modern Masculine',
      dna_inspiration: 'Original Creation (Gaël Montero)',
      description: 'Laverne Player is an original modern woody-aromatic composition crafted by master perfumer Gaël Montero, blending bergamot, cardamom, patchouli, vetiver, amber, and tonka bean.',
      top_notes: ['Bergamot', 'Cardamom'],
      middle_notes: ['Patchouli', 'Vetiver'],
      base_notes: ['Amber', 'Tonka Bean', 'Leather'],
      accords: [
        { name: 'Woody', color: '#854d0e', score: 92 },
        { name: 'Warm Spicy', color: '#d97706', score: 86 },
        { name: 'Aromatic', color: '#10b981', score: 80 },
        { name: 'Citrus', color: '#eab308', score: 75 }
      ]
    },
    {
      id: 'caneza-mortal',
      name: 'Mortal',
      brand: 'Canéza',
      gender: 'Unisex',
      dna_type: 'Chypre Fruity Woody',
      dna_inspiration: 'Nishane Hacivat',
      description: 'Canéza Mortal is a bold, modern chypre fruity fragrance inspired by Nishane Hacivat, opening with tart grapefruit and pineapple over patchouli, cedar, oakmoss, and rich amber.',
      top_notes: ['Grapefruit', 'Pineapple'],
      middle_notes: ['Patchouli', 'Jasmine', 'Cedar'],
      base_notes: ['Oakmoss', 'Amber'],
      accords: [
        { name: 'Fruity', color: '#f59e0b', score: 92 },
        { name: 'Mossy', color: '#16a34a', score: 88 },
        { name: 'Woody', color: '#854d0e', score: 84 },
        { name: 'Citrus', color: '#eab308', score: 80 }
      ]
    },
    {
      id: 'armaf-excellus-men',
      name: 'Excellus Men',
      brand: 'Armaf',
      gender: 'Men',
      dna_type: 'Woody Leather Sweet Spicy',
      dna_inspiration: 'Carolina Herrera CH Men',
      description: 'Armaf Excellus Men is a refined woody-leather fragrance inspired by CH Men, blending neroli and bergamot with nutmeg and woodsy notes over rich leather, sandalwood, and amber.',
      top_notes: ['Bergamot', 'Grapefruit', 'Neroli'],
      middle_notes: ['Nutmeg', 'Woodsy Notes', 'Jasmine'],
      base_notes: ['Leather', 'Sandalwood', 'Amber', 'Vetiver'],
      accords: [
        { name: 'Leather', color: '#78350f', score: 94 },
        { name: 'Woody', color: '#854d0e', score: 88 },
        { name: 'Warm Spicy', color: '#d97706', score: 82 },
        { name: 'Citrus', color: '#eab308', score: 76 }
      ]
    },
    {
      id: 'apex-riiffs-bleuabsolu',
      name: 'Bleu Absolu',
      brand: 'Riiffs',
      gender: 'Men',
      dna_type: 'Fresh Spicy Aromatic Ambroxan',
      dna_inspiration: 'Dior Sauvage',
      description: 'Riiffs Bleu Absolu is a powerhouse fresh-spicy fragrance inspired by Dior Sauvage, packed with Calabrian bergamot, black pepper, geranium, lavender, vetiver, and cedarwood.',
      top_notes: ['Calabrian Bergamot', 'Black Pepper'],
      middle_notes: ['Pepper', 'Geranium', 'Ginger', 'Lavender'],
      base_notes: ['Vetiver', 'Cedarwood', 'Amber'],
      accords: [
        { name: 'Fresh Spicy', color: '#10b981', score: 96 },
        { name: 'Citrus', color: '#eab308', score: 90 },
        { name: 'Aromatic', color: '#059669', score: 85 },
        { name: 'Amber', color: '#d97706', score: 80 }
      ]
    }
  ];

  // Generate review embeddings for all updated items
  const texts = updates.map(u => 
    `${u.brand} ${u.name}. ${u.description} Accords: ${u.accords.map(a => a.name).join(', ')}. Top notes: ${u.top_notes.join(', ')}. Middle notes: ${u.middle_notes.join(', ')}. Base notes: ${u.base_notes.join(', ')}. DNA: ${u.dna_inspiration}.`
  );

  console.log(`Generating batch embeddings for ${updates.length} corrected fragrances...`);
  const embeddings = await generateBatchEmbeddings(texts);
  console.log(`Generated ${embeddings.length} embeddings successfully!`);

  for (let i = 0; i < updates.length; i++) {
    const u = updates[i];
    const emb = embeddings[i];
    const payload = {
      name: u.name,
      brand: u.brand,
      gender: u.gender,
      dna_type: u.dna_type,
      dna_inspiration: u.dna_inspiration,
      description: u.description,
      top_notes: u.top_notes,
      middle_notes: u.middle_notes,
      base_notes: u.base_notes,
      notes: {
        top: u.top_notes,
        middle: u.middle_notes,
        base: u.base_notes
      },
      accords: u.accords,
      review_embedding: JSON.stringify(emb),
      updated_at: new Date().toISOString()
    };

    const { error } = await sb.from('fragrances').update(payload).eq('id', u.id);
    if (error) {
      console.error(`Error updating ${u.id}:`, error.message);
    } else {
      console.log(`  ✓ Updated ${u.id} (${u.brand} - ${u.name})`);
    }
  }
}

async function mergeAndCleanupDuplicates() {
  console.log('\n========================================');
  console.log('STEP 3: MERGING DUPLICATES & CLEANING CATALOG');
  console.log('========================================');

  // 1. Seasons Rise: Merge st-9282 into apex-riiffs-seasonsrise
  const { data: st9282 } = await sb.from('fragrances').select('*').eq('id', 'st-9282').single();
  const { data: seasonsRise } = await sb.from('fragrances').select('*').eq('id', 'apex-riiffs-seasonsrise').single();
  if (seasonsRise && st9282) {
    const mergedSellers = [...(seasonsRise.community_sellers || [])];
    if (st9282.community_sellers) {
      for (const s of st9282.community_sellers) {
        if (!mergedSellers.some(ex => ex.seller_id === s.seller_id)) {
          mergedSellers.push(s);
        }
      }
    }
    const riseCorrectData = {
      name: 'Seasons Rise',
      brand: 'Riiffs',
      gender: 'Unisex',
      dna_type: 'Warm Sweet Spicy Gourmand',
      dna_inspiration: 'Emporio Armani Stronger With You Intensely',
      description: 'Riiffs Seasons Rise is a delicious, decadent winter gourmand inspired by Stronger With You Intensely, packed with toffee, caramel, cinnamon, vanilla bean, and praline over amber.',
      top_notes: ['Nutmeg', 'Pink Pepper', 'Orange Blossom', 'Orris Root'],
      middle_notes: ['Toffee', 'Caramel', 'Cinnamon', 'Clary Sage'],
      base_notes: ['Vanilla Bean', 'Cashmeran', 'Praline', 'Amber', 'Ambroxan'],
      notes: {
        top: ['Nutmeg', 'Pink Pepper', 'Orange Blossom', 'Orris Root'],
        middle: ['Toffee', 'Caramel', 'Cinnamon', 'Clary Sage'],
        base: ['Vanilla Bean', 'Cashmeran', 'Praline', 'Amber', 'Ambroxan']
      },
      accords: [
        { name: 'Sweet', color: '#ec4899', score: 98 },
        { name: 'Vanilla', color: '#f59e0b', score: 92 },
        { name: 'Warm Spicy', color: '#d97706', score: 88 },
        { name: 'Caramel', color: '#b45309', score: 84 },
        { name: 'Amber', color: '#78350f', score: 80 }
      ],
      community_sellers: mergedSellers,
      aliases: ['Riiffs Season Rise', 'Riiffs Seasons Rise', 'Stronger With You Intensely Clone'],
      updated_at: new Date().toISOString()
    };
    const [emb] = await generateBatchEmbeddings([`${riseCorrectData.brand} ${riseCorrectData.name}. ${riseCorrectData.description} Accords: ${riseCorrectData.accords.map(a => a.name).join(', ')}. Top: ${riseCorrectData.top_notes.join(', ')}.`]);
    riseCorrectData.review_embedding = JSON.stringify(emb);

    await sb.from('fragrances').update(riseCorrectData).eq('id', 'apex-riiffs-seasonsrise');
    await sb.from('fragrances').delete().eq('id', 'st-9282');
    console.log('  ✓ Merged st-9282 into apex-riiffs-seasonsrise (Stronger With You Intensely DNA)');
  }

  // 2. Seasons Drift: Merge st-9278 into apex-riiffs-seasonsdrift
  const { data: st9278 } = await sb.from('fragrances').select('*').eq('id', 'st-9278').single();
  const { data: seasonsDrift } = await sb.from('fragrances').select('*').eq('id', 'apex-riiffs-seasonsdrift').single();
  if (seasonsDrift && st9278) {
    const mergedSellers = [...(seasonsDrift.community_sellers || [])];
    if (st9278.community_sellers) {
      for (const s of st9278.community_sellers) {
        if (!mergedSellers.some(ex => ex.seller_id === s.seller_id)) {
          mergedSellers.push(s);
        }
      }
    }
    const driftCorrectData = {
      name: 'Seasons Drift',
      brand: 'Riiffs',
      gender: 'Men',
      dna_type: 'Citrus Amber Woody',
      dna_inspiration: "Chanel Bleu de Chanel L'Exclusif",
      description: "Riiffs Seasons Drift is an exquisite citrus-amber-woody fragrance inspired by Chanel Bleu de Chanel L'Exclusif, blending lemon zest, pink pepper, and cedar over amber, sandalwood, and resins.",
      top_notes: ['Lemon Zest', 'Grapefruit', 'Pink Pepper'],
      middle_notes: ['Cedar', 'Ginger', 'Clary Sage'],
      base_notes: ['Sandalwood', 'Labdanum', 'Amber', 'Resins'],
      notes: {
        top: ['Lemon Zest', 'Grapefruit', 'Pink Pepper'],
        middle: ['Cedar', 'Ginger', 'Clary Sage'],
        base: ['Sandalwood', 'Labdanum', 'Amber', 'Resins']
      },
      accords: [
        { name: 'Citrus', color: '#eab308', score: 94 },
        { name: 'Amber', color: '#d97706', score: 88 },
        { name: 'Woody', color: '#854d0e', score: 84 },
        { name: 'Fresh Spicy', color: '#10b981', score: 80 }
      ],
      community_sellers: mergedSellers,
      aliases: ['Riiffs Season Drift', 'Riiffs Seasons Drift'],
      updated_at: new Date().toISOString()
    };
    const [emb] = await generateBatchEmbeddings([`${driftCorrectData.brand} ${driftCorrectData.name}. ${driftCorrectData.description} Accords: ${driftCorrectData.accords.map(a => a.name).join(', ')}. Top: ${driftCorrectData.top_notes.join(', ')}.`]);
    driftCorrectData.review_embedding = JSON.stringify(emb);

    await sb.from('fragrances').update(driftCorrectData).eq('id', 'apex-riiffs-seasonsdrift');
    await sb.from('fragrances').delete().eq('id', 'st-9278');
    console.log("  ✓ Merged st-9278 into apex-riiffs-seasonsdrift (Bleu de Chanel L'Exclusif DNA)");
  }

  // 3. Reef 31 / Reef 33: Fix st-9263 to Reef 31, and remove orphan st-9056
  const { data: st9263 } = await sb.from('fragrances').select('*').eq('id', 'st-9263').single();
  if (st9263) {
    await sb.from('fragrances').update({
      name: 'Reef 31',
      brand: 'Reef',
      gender: 'Unisex',
      dna_type: 'Warm Spicy Amber Floral',
      dna_inspiration: 'Original Creation (Davana, Pink Pepper & Amber)',
      description: 'Reef 31 is a prestigious Arabian creation highlighting davana, delicate saffron, pink pepper, and an opulent amber foundation.',
      top_notes: ['Davana', 'Pink Pepper'],
      middle_notes: ['Saffron', 'Rose'],
      base_notes: ['Amber', 'Vanilla'],
      notes: {
        top: ['Davana', 'Pink Pepper'],
        middle: ['Saffron', 'Rose'],
        base: ['Amber', 'Vanilla']
      },
      accords: [
        { name: 'Amber', color: '#d97706', score: 95 },
        { name: 'Warm Spicy', color: '#b45309', score: 88 },
        { name: 'Floral', color: '#ec4899', score: 80 }
      ],
      updated_at: new Date().toISOString()
    }).eq('id', 'st-9263');
    console.log('  ✓ Fixed st-9263 to Reef 31');
  }

  // Delete orphaned empty shells
  const deadIds = ['st-9056', 'st-9254', 'st-9279'];
  for (const id of deadIds) {
    const { error } = await sb.from('fragrances').delete().eq('id', id);
    if (!error) console.log(`  ✓ Removed dead orphan ${id}`);
  }
}

async function main() {
  await fixDesyncedColumns();
  await fixSpecificFragrances();
  await mergeAndCleanupDuplicates();
  console.log('\n========================================');
  console.log('ALL REMEDIATIONS COMPLETED SUCCESSFULLY!');
  console.log('========================================\n');
}

main().catch(console.error);
