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

async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] }
      }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini embed error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.embeddings[0].values;
}

async function run() {
  console.log('Fetching existing rows...');
  const { data: rows, error: fetchErr } = await sb.from('fragrances')
    .select('*')
    .in('id', ['apex-rayhaan-navasol', 'rayhaan-nova-sol']);

  if (fetchErr) throw fetchErr;

  const navaSol = rows.find(r => r.id === 'apex-rayhaan-navasol');
  const novaSol = rows.find(r => r.id === 'rayhaan-nova-sol');

  console.log('Found navaSol:', !!navaSol, 'novaSol:', !!novaSol);

  // Combine decants
  let decants = [...(navaSol?.community_decants || [])];
  if (novaSol?.community_decants) {
    for (const d of novaSol.community_decants) {
      if (!decants.some(existing => existing.seller_id === d.seller_id)) {
        decants.push(d);
      }
    }
  }

  // Calculate lowest decant price
  let lowestDecant = 999999;
  for (const dec of decants) {
    if (dec.lowest_price && dec.lowest_price < lowestDecant) {
      lowestDecant = dec.lowest_price;
    }
    if (dec.sizes) {
      for (const p of Object.values(dec.sizes)) {
        if (typeof p === 'number' && p > 0 && p < lowestDecant) {
          lowestDecant = p;
        }
      }
    }
  }
  if (lowestDecant === 999999) lowestDecant = navaSol?.lowest_decant_price || 180;

  const correctData = {
    name: 'Nava Sol',
    brand: 'Rayhaan',
    gender: 'Unisex',
    concentration: 'Eau de Parfum',
    dna_type: 'Floral Woody Musk',
    dna_inspiration: 'Byredo Mojave Ghost',
    description: 'Rayhaan Nava Sol is a luminous, airy floral woody musk fragrance inspired by Byredo Mojave Ghost. It opens with exotic Jamaican nesberry (sapodilla) and tender ambrette seed, transitions into a heart of magnolia, powdery violet, and smooth sandalwood, and finishes on a clean skin-scent foundation of cedar, ambergris, and chantilly musk.',
    top_notes: ['Sapodilla', 'Ambrette'],
    middle_notes: ['Magnolia', 'Violet', 'Sandalwood'],
    base_notes: ['Cedar', 'Ambergris', 'Musk'],
    notes: {
      top: ['Sapodilla', 'Ambrette'],
      middle: ['Magnolia', 'Violet', 'Sandalwood'],
      base: ['Cedar', 'Ambergris', 'Musk']
    },
    accords: [
      { name: 'Floral', color: '#10b981', score: 95 },
      { name: 'Woody', color: '#854d0e', score: 88 },
      { name: 'Musky', color: '#64748b', score: 84 },
      { name: 'Fruity', color: '#f59e0b', score: 78 },
      { name: 'Powdery', color: '#a855f7', score: 72 },
      { name: 'Fresh', color: '#06b6d4', score: 65 }
    ],
    aliases: ['Rayhaan Nova Sol', 'Nova Sol', 'Rayhaan Nava Sol', 'Byredo Mojave Ghost Clone'],
    community_decants: decants,
    lowest_decant_price: lowestDecant,
    has_decants: decants.length > 0,
    updated_at: new Date().toISOString()
  };

  const reviewText = `${correctData.brand} ${correctData.name}. ${correctData.description} Accords: ${correctData.accords.map(a => a.name).join(', ')}. Top notes: ${correctData.top_notes.join(', ')}. Heart notes: ${correctData.middle_notes.join(', ')}. Base notes: ${correctData.base_notes.join(', ')}. Alternative to ${correctData.dna_inspiration}.`;
  
  console.log('Generating embedding for review text:\n', reviewText);
  const embedding = await generateEmbedding(reviewText);
  console.log('Embedding generated! Dimensions:', embedding.length);

  correctData.review_embedding = JSON.stringify(embedding);

  console.log('Updating apex-rayhaan-navasol...');
  const { error: updateErr } = await sb.from('fragrances')
    .update(correctData)
    .eq('id', 'apex-rayhaan-navasol');

  if (updateErr) throw updateErr;
  console.log('Successfully updated apex-rayhaan-navasol!');

  if (novaSol) {
    console.log('Removing duplicate rayhaan-nova-sol...');
    const { error: delErr } = await sb.from('fragrances')
      .delete()
      .eq('id', 'rayhaan-nova-sol');
    
    if (delErr) {
      console.warn('Could not delete rayhaan-nova-sol (might have relations), updating it to match instead:', delErr.message);
      await sb.from('fragrances').update(correctData).eq('id', 'rayhaan-nova-sol');
    } else {
      console.log('Successfully deleted redundant duplicate rayhaan-nova-sol!');
    }
  }

  // Verification
  const { data: verifyRow } = await sb.from('fragrances')
    .select('id, name, brand, dna_type, dna_inspiration, accords, top_notes, middle_notes, base_notes, lowest_decant_price, community_decants')
    .eq('id', 'apex-rayhaan-navasol')
    .single();

  console.log('\n--- VERIFICATION RESULT ---');
  console.log(JSON.stringify(verifyRow, null, 2));
}

run().catch(console.error);
