import fragrancesData from '../data/fragrances.json';

// Benchmark Designer / Niche Targets & their famous clones in our catalog
const DESIGNER_DNA_MAP = {
  "angels' share": { target: "Kilian Angels' Share", keywords: ["angel", "angels share", "cognac", "boozy"] },
  "aventus": { target: "Creed Aventus", keywords: ["aventus", "creed", "pineapple birch", "fruity smoky"] },
  "sauvage": { target: "Dior Sauvage", keywords: ["sauvage", "dior sauvage", "ambroxan pepper"] },
  "tygar": { target: "Bvlgari Tygar", keywords: ["tygar", "grapefruit ambroxan"] },
  "babycat": { target: "YSL Babycat", keywords: ["babycat", "vanilla suede", "resinous vanilla"] },
  "tuxedo": { target: "YSL Tuxedo", keywords: ["tuxedo", "patchouli ambergris"] },
  "l'immensité": { target: "Louis Vuitton L'Immensité", keywords: ["immensite", "l'immensite", "grapefruit ginger"] },
  "afternoon swim": { target: "Louis Vuitton Afternoon Swim", keywords: ["afternoon swim", "mandarin citrus"] },
  "ombre nomade": { target: "Louis Vuitton Ombre Nomade", keywords: ["ombre nomade", "raspberry oud incense"] },
  "imagination": { target: "Louis Vuitton Imagination", keywords: ["imagination", "black tea citrus"] },
  "bleu de chanel": { target: "Bleu de Chanel", keywords: ["bdc", "bleu de chanel", "blue de chanel", "chanel"] },
  "tobacco vanille": { target: "Tom Ford Tobacco Vanille", keywords: ["tobacco vanille", "vanille tobacco"] },
  "lost cherry": { target: "Tom Ford Lost Cherry", keywords: ["lost cherry", "cherry liquor"] },
  "ombré leather": { target: "Tom Ford Ombré Leather", keywords: ["ombre leather", "cardamom leather"] },
  "black orchid": { target: "Tom Ford Black Orchid", keywords: ["black orchid", "truffle dark floral"] },
  "layton": { target: "Parfums de Marly Layton", keywords: ["layton", "apple vanilla cardamom"] },
  "althair": { target: "Parfums de Marly Althair", keywords: ["althair", "bourbon vanilla praline", "liquid brun"] },
  "valaya": { target: "Parfums de Marly Valaya", keywords: ["valaya", "clean aldehydic musk", "marwa"] },
  "interlude": { target: "Amouage Interlude Man", keywords: ["interlude", "blue beast", "smoky oregano"] },
  "fierce": { target: "Abercrombie & Fitch Fierce", keywords: ["fierce", "montblanc legend", "kaaf"] },
  "invictus": { target: "Paco Rabanne Invictus", keywords: ["invictus", "bubblegum aquatic"] },
  "ultramale": { target: "Jean Paul Gaultier Ultra Male", keywords: ["ultra male", "9 pm", "bubblegum pear cinnamon"] },
  "le male le parfum": { target: "Jean Paul Gaultier Le Male Le Parfum", keywords: ["le male", "le parfum", "iris cardamom vanilla"] },
  "naxos": { target: "Xerjoff Naxos", keywords: ["naxos", "honey tobacco lavender"] },
  "erba pura": { target: "Xerjoff Erba Pura", keywords: ["erba pura", "fruity sweet musk", "ana abiyedh"] },
  "oud bouquet": { target: "Lancôme Oud Bouquet", keywords: ["oud bouquet", "praline rose oud", "shaghaf oud"] }
};

export function processSommelierQuery(queryText) {
  const q = queryText.toLowerCase().trim();
  
  // 1. Direct Perfume Search (checking if user asked about a specific bottle)
  const directMatches = fragrancesData.filter(item => {
    const fullName = `${item.brand} ${item.name}`.toLowerCase();
    const shortName = item.name.toLowerCase();
    return q.includes(fullName) || (shortName.length > 3 && q.includes(shortName));
  });

  if (directMatches.length > 0) {
    const primary = directMatches[0];
    const sellers = primary.community_sellers || [];
    
    let analysis = `### 🌟 **${primary.brand} — ${primary.name}**\n\n`;
    if (primary.dna_inspiration) {
      analysis += `• **Inspired by:** Inspired by **${primary.dna_inspiration}** (${primary.similarity_percentage}% olfactory twin profile)\n`;
    }
    analysis += `• **Accords:** ${(primary.accords || []).slice(0, 4).map(a => a.name).join(', ')}\n`;
    analysis += `• **Longevity & Sillage:** ${primary.longevity || '8-10 Hours'} • ${primary.sillage || 'Strong'} projection\n`;
    analysis += `• **Best Season:** ${primary.primary_season || 'All Year'}\n`;
    analysis += `• **Fragrantica Score:** ★ ${primary.rating_value}/5 (${(primary.rating_count/1000).toFixed(1)}k community votes)\n\n`;

    if (primary.in_seller_stock && sellers.length > 0) {
      analysis += `#### 🛒 **Live Seller Pricing & Stock:**\n`;
      if (sellers.length > 1) {
        analysis += `Available across **${sellers.length} community sellers**. **${primary.lowest_seller}** has the best deal at **₹${primary.community_price}**!\n`;
      } else {
        analysis += `In stock with **${sellers[0].seller_name}** at **₹${sellers[0].price}**.\n`;
      }
    } else {
      analysis += `⚠️ **Seller Status:** Not currently listed on Second Theory or FragFever active sheets (archive bottle).\n`;
    }

    return {
      text: analysis,
      cardType: 'fragrance_spotlight',
      fragrance: primary,
      sellers: primary.community_sellers
    };
  }

  // 2. Multi-Seller Price Comparison Query
  if (q.includes('compare') || q.includes('cheapest') || q.includes('who has') || q.includes('price of') || q.includes('rate of')) {
    // Find candidate fragrances with multiple sellers
    const candidates = fragrancesData.filter(f => f.community_sellers && f.community_sellers.length > 0);
    let matched = candidates.filter(f => q.includes(f.name.toLowerCase()) || q.includes(f.brand.toLowerCase()));
    
    if (matched.length === 0) {
      // Find popular compared ones
      matched = candidates.filter(f => f.community_sellers.length > 1).slice(0, 4);
    }

    const featured = matched.slice(0, 3);
    let comparisonText = `### 🔍 **Live Multi-Seller Price Comparison**\n\nHere are real-time quotes compared across **Second Theory** and **FragFever**:\n\n`;

    featured.forEach(f => {
      comparisonText += `**${f.brand} ${f.name}**\n`;
      f.community_sellers.forEach(s => {
        const isBest = s.price === f.community_price;
        comparisonText += `• **${s.seller_name}**: ₹${s.price} ${isBest ? '🌟 *(Best Deal)*' : ''}\n`;
      });
      comparisonText += `\n`;
    });

    return {
      text: comparisonText,
      cardType: 'multi_seller_compare',
      items: featured
    };
  }

  // 3. Clone Target / Inspired By Query
  for (const [key, info] of Object.entries(DESIGNER_DNA_MAP)) {
    if (info.keywords.some(kw => q.includes(kw))) {
      const clones = fragrancesData.filter(f => 
        (f.dna_inspiration && f.dna_inspiration.toLowerCase().includes(key)) ||
        (f.description && f.description.toLowerCase().includes(key))
      );

      clones.sort((a, b) => (b.in_seller_stock ? 1 : 0) - (a.in_seller_stock ? 1 : 0) || b.rating_value - a.rating_value);
      const topClones = clones.slice(0, 4);

      let text = `### 💎 **Best Clones of ${info.target}**\n\n`;
      text += `If you love **${info.target}**, here are the closest olfactory scent twins in our catalog:\n\n`;

      topClones.forEach(c => {
        text += `• **${c.brand} ${c.name}** — ${c.similarity_percentage}% match (★ ${c.rating_value})\n`;
        if (c.in_seller_stock) {
          text += `  └ *In Stock:* ₹${c.community_price} via **${c.lowest_seller}**\n`;
        } else {
          text += `  └ *Status:* Archive / Not in active seller stock\n`;
        }
      });

      return {
        text,
        cardType: 'clone_recommendations',
        target: info.target,
        items: topClones
      };
    }
  }

  // 4. Occasion & Vibe Based Recommendations
  let occasion = null;
  let accordFilter = null;
  let seasonFilter = 'all';

  if (q.includes('date') || q.includes('night out') || q.includes('evening') || q.includes('romantic')) {
    occasion = 'Date Night & Intimate Evenings';
    accordFilter = ['vanilla', 'sweet', 'warm spicy', 'amber', 'tobacco'];
  } else if (q.includes('office') || q.includes('work') || q.includes('daily') || q.includes('casual') || q.includes('versatile') || q.includes('signature')) {
    occasion = 'Office, Work & Everyday Signature Wear';
    accordFilter = ['citrus', 'marine / aquatic', 'aromatic', 'woody'];
  } else if (q.includes('party') || q.includes('club') || q.includes('beast') || q.includes('loud') || q.includes('projection')) {
    occasion = 'Clubbing, Parties & Beast-Mode Projection';
    accordFilter = ['sweet', 'fresh spicy', 'fruity', 'amber'];
  } else if (q.includes('summer') || q.includes('hot') || q.includes('fresh') || q.includes('gym')) {
    occasion = 'Summer High-Heat & Fresh Daytime';
    seasonFilter = 'Summer';
    accordFilter = ['marine / aquatic', 'citrus', 'aromatic'];
  } else if (q.includes('winter') || q.includes('cold') || q.includes('fall')) {
    occasion = 'Winter & Cold-Weather Warmth';
    seasonFilter = 'Winter';
    accordFilter = ['vanilla', 'warm spicy', 'oud', 'leather', 'amber'];
  }

  // Budget detection
  let maxBudget = 99999;
  const budgetMatch = q.match(/\b(?:under|below|less than|within|budget of)?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})\b/i);
  if (budgetMatch) {
    maxBudget = parseInt(budgetMatch[1]);
  } else if (q.includes('cheap') || q.includes('affordable') || q.includes('budget')) {
    maxBudget = 3000;
  }

  if (occasion || budgetMatch) {
    let pool = fragrancesData.filter(f => f.in_seller_stock && f.community_price && parseInt(f.community_price) <= maxBudget);
    
    if (seasonFilter !== 'all') {
      const seasonPool = pool.filter(f => f.primary_season.toLowerCase() === seasonFilter.toLowerCase());
      if (seasonPool.length >= 3) pool = seasonPool;
    }

    if (accordFilter) {
      pool = pool.filter(f => {
        const accords = (f.accords || []).map(a => a.name.toLowerCase());
        return accordFilter.some(af => accords.includes(af));
      });
    }

    pool.sort((a, b) => b.rating_value - a.rating_value);
    const topPicks = pool.slice(0, 4);

    let text = `### 🎯 **Top Picks for ${occasion || 'Your Budget'}**\n\n`;
    if (maxBudget < 99999) {
      text += `Filtered to verified in-stock bottles under **₹${maxBudget.toLocaleString()}**:\n\n`;
    }

    topPicks.forEach(p => {
      text += `• **${p.brand} ${p.name}** — **₹${p.community_price}** (via ${p.lowest_seller})\n`;
      text += `  └ *Profile:* ${(p.accords || []).slice(0, 3).map(a => a.name).join(', ')} • ★ ${p.rating_value}/5\n`;
      if (p.dna_inspiration) {
        text += `  └ *Target:* Inspired by ${p.dna_inspiration}\n`;
      }
    });

    return {
      text,
      cardType: 'budget_picks',
      occasion,
      maxBudget,
      items: topPicks
    };
  }

  // 5. Intelligent Fallback: Olfactory Search with Full Context
  const generalMatches = fragrancesData.filter(item => {
    const hay = `${item.brand} ${item.name} ${item.dna_inspiration || ''} ${(item.accords || []).map(a => a.name).join(' ')}`.toLowerCase();
    return q.split(' ').some(word => word.length > 2 && hay.includes(word));
  });

  generalMatches.sort((a, b) => (b.in_seller_stock ? 1 : 0) - (a.in_seller_stock ? 1 : 0) || b.rating_value - a.rating_value);
  const top4 = generalMatches.slice(0, 4);

  let fallbackText = `I analyzed our 889 fragrance records for **"${queryText}"**:\n\n`;
  top4.forEach(f => {
    fallbackText += `• **${f.brand} ${f.name}** (★ ${f.rating_value})\n`;
    if (f.dna_inspiration) fallbackText += `  └ Inspired by: ${f.dna_inspiration}\n`;
    if (f.in_seller_stock) {
      fallbackText += `  └ **In Stock:** ₹${f.community_price} via ${f.lowest_seller}\n`;
    } else {
      fallbackText += `  └ Status: Unquoted archive bottle\n`;
    }
  });

  return {
    text: fallbackText,
    cardType: 'general_search',
    items: top4
  };
}
