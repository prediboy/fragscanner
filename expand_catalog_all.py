import json

additional_fragrances = [
  # Lattafa & Maison Alhambra additions
  {
    "id": "lattafa-raghba",
    "name": "Raghba",
    "brand": "Lattafa",
    "collection": "Classic Line",
    "rating_value": 4.15, "rating_count": 5200, "gender": "Unisex", "release_year": 2012,
    "concentration": "Eau de Parfum", "primary_season": "Winter",
    "dna_inspiration": "Sweet Caramelized Sugar & Incense Oud", "dna_type": "Sweet Incense Oriental", "similarity_percentage": 93, "price_usd": 18,
    "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Oud", "score": 80, "color": "#3f2e21"}, {"name": "Smoky", "score": 75, "color": "#475569"}],
    "notes": {"top": ["Sugar", "Vanilla"], "middle": ["Oud", "Incense"], "base": ["Sandalwood", "Amber", "Musk"]},
    "seasons": {"winter": 62, "fall": 30, "spring": 6, "summer": 2}, "day_night": {"night": 80, "day": 20},
    "longevity": "Long Lasting (8-9 hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Incredible sweet incense oud for under $20", "Warm comforting winter blanket"], "cons": ["High sweetness"], "community_verdict": "One of Lattafa's all-time historical best sellers.", "top_reviewer_quotes": ["Caramelized sugar, church incense, and soft oud."]},
    "flankers": ["lattafa-ameer-al-oud-intense"], "dna_twins": ["lattafa-khamrah"]
  },
  {
    "id": "lattafa-velvet-oud",
    "name": "Velvet Oud",
    "brand": "Lattafa",
    "collection": "Classic Line",
    "rating_value": 4.20, "rating_count": 3400, "gender": "Unisex", "release_year": 2018,
    "concentration": "Eau de Parfum", "primary_season": "Fall",
    "dna_inspiration": "Tom Ford Ombre Leather / Golden Suede", "dna_type": "Leather Floral Twist", "similarity_percentage": 90, "price_usd": 22,
    "accords": [{"name": "Leather", "score": 100, "color": "#78350f"}, {"name": "Amber", "score": 88, "color": "#d97706"}, {"name": "Citrus", "score": 75, "color": "#eab308"}, {"name": "Smoky", "score": 70, "color": "#475569"}],
    "notes": {"top": ["Cardamom", "Bergamot"], "middle": ["Violet Leaf", "Patchouli"], "base": ["Suede Leather", "Amber", "Oud", "Oakmoss"]},
    "seasons": {"fall": 45, "winter": 38, "spring": 14, "summer": 3}, "day_night": {"night": 74, "day": 26},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Soft golden suede leather with fresh citrus top", "Very wearable gentleman scent"], "cons": ["Leather lovers only"], "community_verdict": "Smooth, refined, accessible leather fragrance for under $25.", "top_reviewer_quotes": ["Smooth suede jacket with violet leaf and golden amber."]},
    "flankers": [], "dna_twins": ["afnan-rare-carbon", "rasasi-la-yuqawam"]
  },
  {
    "id": "lattafa-hayaati",
    "name": "Hayaati",
    "brand": "Lattafa",
    "collection": "Hayaati Line",
    "rating_value": 4.18, "rating_count": 4100, "gender": "Men", "release_year": 2020,
    "concentration": "Eau de Parfum", "primary_season": "Summer",
    "dna_inspiration": "Paco Rabanne Invictus / Rasasi Hawas Vibe", "dna_type": "Fruity Aquatic Clone", "similarity_percentage": 91, "price_usd": 18,
    "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0284c7"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Citrus", "score": 82, "color": "#eab308"}, {"name": "Sweet", "score": 78, "color": "#ec4899"}],
    "notes": {"top": ["Apple", "Bergamot"], "middle": ["Cinnamon", "Woody Notes"], "base": ["Vanilla", "Musk"]},
    "seasons": {"summer": 60, "spring": 28, "fall": 10, "winter": 2}, "day_night": {"day": 75, "night": 25},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Costs under $20 and projects like crazy", "Fresh sweet apple bubblegum aquatic", "Mass compliment puller"], "cons": ["Familiar sweet DNA"], "community_verdict": "The best sub-$20 summer compliment monster.", "top_reviewer_quotes": ["Sweet apple aquatic bubblegum. Insane value for $18."]},
    "flankers": ["lattafa-hayaati-al-maleky"], "dna_twins": ["rasasi-hawas-for-men", "rayhaan-pacific"]
  },
  {
    "id": "lattafa-ejaazi",
    "name": "Ejaazi",
    "brand": "Lattafa",
    "collection": "Ejaazi Line",
    "rating_value": 4.15, "rating_count": 2800, "gender": "Men", "release_year": 2018,
    "concentration": "Eau de Parfum", "primary_season": "Summer",
    "dna_inspiration": "Office Blue Aromatic / Dylan Blue Style", "dna_type": "Fresh Aromatic Blue", "similarity_percentage": 89, "price_usd": 18,
    "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Citrus", "score": 90, "color": "#eab308"}, {"name": "Ambroxan", "score": 82, "color": "#06b6d4"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
    "notes": {"top": ["Orange", "Cardamom", "Lavender", "Myrtle"], "middle": ["Patchouli", "Pepper", "Lily-of-the-Valley"], "base": ["Ambroxan", "Cedar", "Oakmoss", "Vetiver"]},
    "seasons": {"summer": 52, "spring": 32, "fall": 12, "winter": 4}, "day_night": {"day": 78, "night": 22},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
    "review_summary": {"pros": ["Superb office everyday signature for under $20", "Heavy solid glass bottle with amber liquid", "Clean masculine presence"], "cons": ["Classic blue profile"], "community_verdict": "Great affordable office freshie.", "top_reviewer_quotes": ["Crisp citrus ambroxan. Reliable daily driver."]},
    "flankers": [], "dna_twins": ["titan-skinn-raw", "afnan-9am-dive"]
  },
  {
    "id": "lattafa-qaed-al-fursan-white",
    "name": "Qaed Al Fursan Unlimited (White)",
    "brand": "Lattafa",
    "collection": "Classic Line",
    "rating_value": 4.22, "rating_count": 3100, "gender": "Unisex", "release_year": 2022,
    "concentration": "Eau de Parfum", "primary_season": "Summer",
    "dna_inspiration": "Creamy Coconut Milk & White Florals", "dna_type": "Tropical Creamy Floral", "similarity_percentage": 92, "price_usd": 22,
    "accords": [{"name": "Coconut", "score": 100, "color": "#fde047"}, {"name": "Sweet", "score": 90, "color": "#ec4899"}, {"name": "Vanilla", "score": 85, "color": "#f59e0b"}, {"name": "White Floral", "score": 80, "color": "#fbcfe8"}],
    "notes": {"top": ["Coconut", "Citrus", "Pineapple"], "middle": ["Ylang-Ylang", "Jasmine", "Frangipani"], "base": ["Vanilla", "White Musk", "Sandalwood"]},
    "seasons": {"summer": 68, "spring": 22, "fall": 8, "winter": 2}, "day_night": {"day": 75, "night": 25},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Creamy sweet coconut milk gelato with lush tropical white blossoms", "Great summer beach vibe", "Clean white bottle"], "cons": ["Sweet coconut profile"], "community_verdict": "Beloved tropical coconut gourmand for summer vacations.", "top_reviewer_quotes": ["Creamy coconut milk and vanilla sunshine."]},
    "flankers": ["lattafa-qaed-al-fursan"], "dna_twins": ["mykonos-coconut-dreams", "lattafa-yara-tous"]
  },
  {
    "id": "maison-alhambra-woody-oud",
    "name": "Woody Oud",
    "brand": "Lattafa",
    "collection": "Maison Alhambra Line",
    "rating_value": 4.25, "rating_count": 2700, "gender": "Unisex", "release_year": 2021,
    "concentration": "Eau de Parfum", "primary_season": "Winter",
    "dna_inspiration": "Tom Ford Oud Wood", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 25,
    "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Warm Spicy", "score": 88, "color": "#c2410c"}, {"name": "Oud", "score": 82, "color": "#3f2e21"}, {"name": "Aromatic", "score": 75, "color": "#16a34a"}],
    "notes": {"top": ["Rosewood", "Cardamom", "Chinese Pepper"], "middle": ["Oud", "Sandalwood", "Vetiver"], "base": ["Tonka Bean", "Vanilla", "Amber"]},
    "seasons": {"winter": 52, "fall": 38, "spring": 8, "summer": 2}, "day_night": {"night": 74, "day": 26},
    "longevity": "Long Lasting (7-8 hrs)", "sillage": "Moderate to Strong",
    "review_summary": {"pros": ["95% recreation of $295 Tom Ford Oud Wood", "Gentle refined cardamom and clean western sandalwood oud", "Affordable executive scent"], "cons": ["Subtle sillage like the TF original"], "community_verdict": "The premier budget Tom Ford Oud Wood clone on the market.", "top_reviewer_quotes": ["Spot on Oud Wood clone. Cardamom, rosewood, and smooth oud."]},
    "flankers": [], "dna_twins": ["titan-skinn-forest-rouge", "lattafa-liam-grey"]
  },
  {
    "id": "maison-alhambra-tobacco-touch",
    "name": "Tobacco Touch",
    "brand": "Lattafa",
    "collection": "Maison Alhambra Line",
    "rating_value": 4.30, "rating_count": 3100, "gender": "Unisex", "release_year": 2021,
    "concentration": "Eau de Parfum", "primary_season": "Winter",
    "dna_inspiration": "Tom Ford Tobacco Vanille", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 25,
    "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Vanilla", "score": 92, "color": "#f59e0b"}, {"name": "Tobacco", "score": 88, "color": "#78350f"}, {"name": "Sweet", "score": 82, "color": "#ec4899"}],
    "notes": {"top": ["Tobacco Leaf", "Spicy Notes"], "middle": ["Tonka Bean", "Tobacco Blossom", "Vanilla", "Cacao"], "base": ["Dried Fruits", "Woody Notes"]},
    "seasons": {"winter": 65, "fall": 28, "spring": 5, "summer": 2}, "day_night": {"night": 82, "day": 18},
    "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Costs $25 and matches $395 TF Tobacco Vanille", "Warm honeyed pipe tobacco with Madagascar vanilla and cloves", "Winter holiday magic"], "cons": ["Strictly cold weather"], "community_verdict": "The best affordable Tobacco Vanille clone available.", "top_reviewer_quotes": ["Rich pipe tobacco, vanilla, and spices. Absolute holiday staple."]},
    "flankers": [], "dna_twins": ["rayhaan-lion", "lattafa-khamrah"]
  },

  # Afnan Additions
  {
    "id": "afnan-supremacy-in-heaven",
    "name": "Supremacy In Heaven",
    "brand": "Afnan",
    "collection": "Supremacy Line",
    "rating_value": 4.14, "rating_count": 2100, "gender": "Men", "release_year": 2018,
    "concentration": "Eau de Parfum", "primary_season": "Spring",
    "dna_inspiration": "Creed Silver Mountain Water", "dna_type": "Direct Clone", "similarity_percentage": 91, "price_usd": 35,
    "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Fresh", "score": 88, "color": "#06b6d4"}, {"name": "Woody", "score": 80, "color": "#854d0e"}, {"name": "Green", "score": 75, "color": "#16a34a"}],
    "notes": {"top": ["Bergamot", "Mandarin Orange"], "middle": ["Green Tea", "Blackcurrant"], "base": ["Woody Notes", "Musk", "Sandalwood"]},
    "seasons": {"spring": 46, "summer": 36, "fall": 14, "winter": 4}, "day_night": {"day": 78, "night": 22},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
    "review_summary": {"pros": ["Chilled green tea and citrus mountain stream", "Less metallic inky opening than Armaf Sillage", "Handsome matte blue bottle"], "cons": ["Gentler than SNOI"], "community_verdict": "Smooth, refined, icy mountain tea clone.", "top_reviewer_quotes": ["Refreshing mountain stream and blackcurrant tea."]},
    "flankers": ["afnan-supremacy-not-only-intense"], "dna_twins": ["armaf-club-de-nuit-sillage", "rasasi-al-wisam-day"]
  },
  {
    "id": "afnan-historic-doria",
    "name": "Historic Doria",
    "brand": "Afnan",
    "collection": "Historic Collection",
    "rating_value": 4.36, "rating_count": 1400, "gender": "Women", "release_year": 2022,
    "concentration": "Eau de Parfum", "primary_season": "Fall",
    "dna_inspiration": "Creamy Raspberry Tuberose & Amber", "dna_type": "Luxury Floral Gourmand", "similarity_percentage": 92, "price_usd": 42,
    "accords": [{"name": "White Floral", "score": 100, "color": "#fbcfe8"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Amber", "score": 75, "color": "#d97706"}],
    "notes": {"top": ["Raspberry", "Orange Blossom", "Lemon Peel"], "middle": ["Tuberose", "Jasmine", "Ambroxan"], "base": ["Vanilla", "Woody Notes", "Musk"]},
    "seasons": {"fall": 40, "winter": 32, "spring": 22, "summer": 6}, "day_night": {"night": 65, "day": 35},
    "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Opulent Roman column marble bottle", "Seductive raspberry and creamy tuberose", "Tremendous performance"], "cons": ["Heavy white floral"], "community_verdict": "One of Afnan’s most lavish and long-lasting feminine releases.", "top_reviewer_quotes": ["Smells like a $300 high-end niche perfume."]},
    "flankers": [], "dna_twins": ["armaf-club-de-nuit-white-imperiale", "titan-skinn-celeste"]
  },

  # Armaf Additions
  {
    "id": "armaf-hunter-intense",
    "name": "Hunter Intense",
    "brand": "Armaf",
    "collection": "Hunter Line",
    "rating_value": 4.20, "rating_count": 3100, "gender": "Men", "release_year": 2016,
    "concentration": "Eau de Parfum", "primary_season": "Summer",
    "dna_inspiration": "Dior Sauvage + Paco Rabanne Invictus Hybrid", "dna_type": "Fresh Spicy Aquatic Hybrid", "similarity_percentage": 92, "price_usd": 25,
    "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Aromatic", "score": 88, "color": "#16a34a"}, {"name": "Fresh Spicy", "score": 82, "color": "#06b6d4"}, {"name": "Sweet", "score": 75, "color": "#ec4899"}],
    "notes": {"top": ["Bergamot", "Lemon", "Mandarin", "Grapefruit"], "middle": ["Lavender", "Cardamom", "Rose", "Geranium"], "base": ["Cedar", "Labdanum", "Vetiver", "Musk"]},
    "seasons": {"summer": 52, "spring": 32, "fall": 12, "winter": 4}, "day_night": {"day": 72, "night": 28},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Blends peppery Sauvage with sweet bubblegum Invictus", "Extreme compliment magnet", "Great daily gym/office wear"], "cons": ["Brown leatherette canteen bottle"], "community_verdict": "The ultimate crowd-pleasing hybrid for under $25.", "top_reviewer_quotes": ["Sauvage meets Invictus. Girls love this scent trail."]},
    "flankers": [], "dna_twins": ["armaf-club-de-nuit-urban-elixir", "rayhaan-pacific"]
  },
  {
    "id": "armaf-tag-him",
    "name": "Tag-Him",
    "brand": "Armaf",
    "collection": "Classic Line",
    "rating_value": 4.15, "rating_count": 2800, "gender": "Men", "release_year": 2013,
    "concentration": "Eau de Toilette", "primary_season": "Summer",
    "dna_inspiration": "Bleu de Chanel EDT", "dna_type": "Direct Clone", "similarity_percentage": 90, "price_usd": 22,
    "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Fresh Spicy", "score": 88, "color": "#06b6d4"}, {"name": "Aromatic", "score": 80, "color": "#16a34a"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
    "notes": {"top": ["Grapefruit", "Lemon", "Pink Pepper", "Bergamot"], "middle": ["Ginger", "Mint", "Nutmeg"], "base": ["Cedar", "Patchouli", "Sandalwood", "Vetiver"]},
    "seasons": {"summer": 50, "spring": 34, "fall": 12, "winter": 4}, "day_night": {"day": 76, "night": 24},
    "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate",
    "review_summary": {"pros": ["Costs $22 and recreates Bleu de Chanel EDT", "Crisp ginger, mint, and grapefruit", "Inoffensive everyday wear"], "cons": ["Projection calms after 3 hours"], "community_verdict": "Classic reliable Bleu de Chanel clone on a tight budget.", "top_reviewer_quotes": ["Grapefruit, ginger, and cedar. Clean office king."]},
    "flankers": [], "dna_twins": ["armaf-club-de-nuit-iconic", "afnan-9am-dive"]
  },

  # Titan Skinn Additions
  {
    "id": "titan-skinn-country-road",
    "name": "Country Road",
    "brand": "Titan Skinn",
    "collection": "Skinn Escapade",
    "rating_value": 4.14, "rating_count": 380, "gender": "Men", "release_year": 2021,
    "concentration": "Eau de Parfum", "primary_season": "Fall",
    "dna_inspiration": "Crisp Lavender Apple & Warm Amberwoods", "dna_type": "Aromatic Woody", "similarity_percentage": 90, "price_usd": 34,
    "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Woody", "score": 88, "color": "#854d0e"}, {"name": "Citrus", "score": 80, "color": "#eab308"}, {"name": "Warm Spicy", "score": 72, "color": "#c2410c"}],
    "notes": {"top": ["Lemon", "Apple", "Lavender"], "middle": ["Clary Sage", "Cardamom", "Violet Leaves"], "base": ["Cedarwood", "Patchouli", "Amber"]},
    "seasons": {"fall": 42, "spring": 32, "winter": 16, "summer": 10}, "day_night": {"day": 65, "night": 35},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
    "review_summary": {"pros": ["Aromatic lavender apple over rich cedarwood and amber", "Uplifting country drive aesthetic"], "cons": ["Less known than Raw"], "community_verdict": "One of Titan Skinn's best autumn and weekend road-trip scents.", "top_reviewer_quotes": ["Crisp apple, clary sage, and warm cedarwoods."]},
    "flankers": ["titan-skinn-raw", "titan-skinn-amalfi-bleu"], "dna_twins": ["afnan-9am-dive", "titan-skinn-raw"]
  },
  {
    "id": "titan-skinn-pristine",
    "name": "Pristine",
    "brand": "Titan Skinn",
    "collection": "Skinn Classic",
    "rating_value": 4.10, "rating_count": 520, "gender": "Women", "release_year": 2013,
    "concentration": "Eau de Parfum", "primary_season": "Spring",
    "dna_inspiration": "Dewy Green Florals & Mandarin Water", "dna_type": "Green Floral Aquatic", "similarity_percentage": 89, "price_usd": 30,
    "accords": [{"name": "Floral", "score": 100, "color": "#fbcfe8"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Green", "score": 80, "color": "#16a34a"}, {"name": "Fresh", "score": 75, "color": "#06b6d4"}],
    "notes": {"top": ["Mandarin", "Crisp Green Apple"], "middle": ["Water Lily", "Magnolia", "Jasmine"], "base": ["Cedarwood", "White Amber", "Musk"]},
    "seasons": {"spring": 52, "summer": 32, "fall": 12, "winter": 4}, "day_night": {"day": 82, "night": 18},
    "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate",
    "review_summary": {"pros": ["Pristine dewy water lily and green apple", "Refreshing and spa-like"], "cons": ["Soft sillage"], "community_verdict": "Crisp, dewy, serene green floral.", "top_reviewer_quotes": ["Dewy morning water lilies and crisp green apple."]},
    "flankers": ["titan-skinn-celeste"], "dna_twins": ["titan-skinn-sheer"]
  },

  # Rasasi Additions
  {
    "id": "rasasi-egra",
    "name": "Egra for Men",
    "brand": "Rasasi",
    "collection": "Classic Line",
    "rating_value": 4.16, "rating_count": 2800, "gender": "Men", "release_year": 2008,
    "concentration": "Eau de Parfum", "primary_season": "Spring",
    "dna_inspiration": "Creed Green Irish Tweed / Davidoff Cool Water", "dna_type": "Green Aromatic Marine", "similarity_percentage": 92, "price_usd": 25,
    "accords": [{"name": "Green", "score": 100, "color": "#16a34a"}, {"name": "Aromatic", "score": 90, "color": "#06b6d4"}, {"name": "Marine / Aquatic", "score": 80, "color": "#0284c7"}, {"name": "Woody", "score": 72, "color": "#854d0e"}],
    "notes": {"top": ["Juniper Berries", "Spruce", "Violet Leaves", "Grapefruit"], "middle": ["Fir", "Galbanum", "Iris"], "base": ["Oakmoss", "Ambergris", "Sandalwood", "Musk"]},
    "seasons": {"spring": 50, "summer": 32, "fall": 14, "winter": 4}, "day_night": {"day": 80, "night": 20},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
    "review_summary": {"pros": ["Very green, dewy pine forest and violet leaf", "Outstanding performance for a green scent", "Very masculine"], "cons": ["Retro green opening"], "community_verdict": "One of Rasasi's most acclaimed classic green fougères.", "top_reviewer_quotes": ["Crisp pine needles, green violet leaves, and moss. Classic gentleman."]},
    "flankers": [], "dna_twins": ["armaf-tres-nuit", "titan-skinn-verge"]
  },
  {
    "id": "rasasi-sotoor-taa",
    "name": "Sotoor Taa",
    "brand": "Rasasi",
    "collection": "Sotoor Line",
    "rating_value": 4.25, "rating_count": 1800, "gender": "Men", "release_year": 2017,
    "concentration": "Eau de Parfum", "primary_season": "Summer",
    "dna_inspiration": "Gucci Guilty Pour Homme / Clean Orange Blossom", "dna_type": "Fresh Floral Citrus", "similarity_percentage": 93, "price_usd": 38,
    "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "White Floral", "score": 90, "color": "#fbcfe8"}, {"name": "Fresh Spicy", "score": 80, "color": "#06b6d4"}, {"name": "Woody", "score": 72, "color": "#854d0e"}],
    "notes": {"top": ["Neroli", "Lavender", "Pink Pepper"], "middle": ["Orange Blossom", "Sea Notes", "Cardamom"], "base": ["Cedar", "Amber", "Patchouli", "Vanilla"]},
    "seasons": {"summer": 55, "spring": 32, "fall": 10, "winter": 3}, "day_night": {"day": 78, "night": 22},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Sparkling neroli, orange blossom, and aquatic cardamom", "Massively improves longevity over Gucci Guilty", "High compliment rate"], "cons": ["White floral note in men's scent"], "community_verdict": "Seductive orange blossom freshie with elite performance.", "top_reviewer_quotes": ["Sunlit neroli and sea notes. Compliments galore in summer."]},
    "flankers": [], "dna_twins": ["titan-skinn-amalfi-bleu", "rasasi-hawas-for-men"]
  },

  # Mykonos Additions
  {
    "id": "mykonos-bonfire-vanilla",
    "name": "Bonfire Vanilla",
    "brand": "Mykonos",
    "collection": "Fireside Series",
    "rating_value": 4.42, "rating_count": 1150, "gender": "Unisex", "release_year": 2023,
    "concentration": "Extrait de Parfum", "primary_season": "Winter",
    "dna_inspiration": "Smoky Roasted Marshmallows over Burning Wood", "dna_type": "Smoky Gourmand", "similarity_percentage": 94, "price_usd": 30,
    "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Smoky", "score": 92, "color": "#475569"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Woody", "score": 80, "color": "#854d0e"}],
    "notes": {"top": ["Cloves", "Pink Pepper", "Orange Blossom"], "middle": ["Chestnut", "Guaiac Wood", "Smoky Cedar"], "base": ["Bourbon Vanilla", "Peru Balsam", "Cashmeran"]},
    "seasons": {"winter": 64, "fall": 28, "spring": 6, "summer": 2}, "day_night": {"night": 80, "day": 20},
    "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Campfire smoke and charred sweet marshmallows", "Very cozy cold weather scent", "Extrait concentration"], "cons": ["Heavy smoke note"], "community_verdict": "Intoxicating winter fireside vanilla.", "top_reviewer_quotes": ["Roasting sweet marshmallows over a wood campfire in freezing weather."]},
    "flankers": ["mykonos-aphrodite"], "dna_twins": ["lattafa-ameer-al-oud-intense"]
  },
  {
    "id": "mykonos-dolce-cherry",
    "name": "Dolce Cherry",
    "brand": "Mykonos",
    "collection": "Gourmand Romance",
    "rating_value": 4.36, "rating_count": 980, "gender": "Women", "release_year": 2023,
    "concentration": "Extrait de Parfum", "primary_season": "Fall",
    "dna_inspiration": "Sweet Maraschino Cherry & Almond Pastry", "dna_type": "Fruity Cherry Gourmand", "similarity_percentage": 92, "price_usd": 28,
    "accords": [{"name": "Cherry", "score": 100, "color": "#991b1b"}, {"name": "Sweet", "score": 94, "color": "#ec4899"}, {"name": "Almond", "score": 85, "color": "#a16207"}, {"name": "Vanilla", "score": 78, "color": "#f59e0b"}],
    "notes": {"top": ["Sweet Cherry", "Bitter Almond", "Bergamot"], "middle": ["Rose", "Jasmine", "Plum"], "base": ["Tonka Bean", "Vanilla Gelato", "Sandalwood"]},
    "seasons": {"fall": 44, "winter": 35, "spring": 16, "summer": 5}, "day_night": {"night": 72, "day": 28},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
    "review_summary": {"pros": ["Syrupy maraschino cherries and sweet almond amaretto", "Lighter and sweeter than Dark Secret", "Flirty and playful"], "cons": ["Sweet candy cherry"], "community_verdict": "Delicious sweet cherry almond confection.", "top_reviewer_quotes": ["Sweet maraschino cherry syrup and vanilla almond pastry."]},
    "flankers": ["mykonos-dark-secret"], "dna_twins": ["mykonos-dark-secret"]
  },

  # Rayhaan Additions
  {
    "id": "rayhaan-terra",
    "name": "Rayhaan Terra",
    "brand": "Rayhaan",
    "collection": "Royal Signature",
    "rating_value": 4.28, "rating_count": 920, "gender": "Men", "release_year": 2023,
    "concentration": "Eau de Parfum", "primary_season": "Spring",
    "dna_inspiration": "Hermès Terre d'Hermès", "dna_type": "Direct Clone", "similarity_percentage": 92, "price_usd": 35,
    "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Woody", "score": 90, "color": "#854d0e"}, {"name": "Earthy / Oakmoss", "score": 82, "color": "#4d7c0f"}, {"name": "Fresh Spicy", "score": 75, "color": "#06b6d4"}],
    "notes": {"top": ["Orange", "Grapefruit", "Flint"], "middle": ["Pepper", "Pelargonium"], "base": ["Vetiver", "Cedarwood", "Patchouli", "Benzoin"]},
    "seasons": {"spring": 45, "fall": 30, "summer": 18, "winter": 7}, "day_night": {"day": 78, "night": 22},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
    "review_summary": {"pros": ["Dirty earthy orange and flinty mineral vetiver", "Elegant executive presentation"], "cons": ["Mature profile"], "community_verdict": "High quality Terre d'Hermès clone with smooth drydown.", "top_reviewer_quotes": ["Bitter orange and flinty rain over cedar."]},
    "flankers": ["rayhaan-imperia"], "dna_twins": ["rasasi-fattan-pour-homme", "titan-skinn-verge"]
  },
  {
    "id": "rayhaan-solaris",
    "name": "Rayhaan Solaris",
    "brand": "Rayhaan",
    "collection": "Aqua Marine Line",
    "rating_value": 4.32, "rating_count": 850, "gender": "Men", "release_year": 2024,
    "concentration": "Eau de Parfum", "primary_season": "Summer",
    "dna_inspiration": "Sparkling Solar Citrus & Radiant Ambroxan", "dna_type": "Solar Citrus Aquatic", "similarity_percentage": 91, "price_usd": 35,
    "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Marine / Aquatic", "score": 88, "color": "#0284c7"}, {"name": "Aromatic", "score": 80, "color": "#16a34a"}, {"name": "Amber", "score": 72, "color": "#d97706"}],
    "notes": {"top": ["Blood Orange", "Lemon Zest", "Calabrian Bergamot"], "middle": ["Neroli", "Sea Salt", "Cardamom"], "base": ["Ambroxan", "Cedarwood", "White Musk"]},
    "seasons": {"summer": 72, "spring": 22, "fall": 5, "winter": 1}, "day_night": {"day": 82, "night": 18},
    "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
    "review_summary": {"pros": ["Zesty blood orange and marine sea salt", "Radiant high-heat beast", "Modern yellow/gold flacon"], "cons": ["Pure summer citrus"], "community_verdict": "Vibrant, sun-drenched solar citrus for beach and gym.", "top_reviewer_quotes": ["Bright sunny blood orange and salty sea breeze."]},
    "flankers": ["rayhaan-pacific", "rayhaan-ocean-rush"], "dna_twins": ["rasasi-hawas-ice", "titan-skinn-amalfi-bleu"]
  }
]

with open("src/data/fragrances.json", "r", encoding="utf-8") as f:
    existing = json.load(f)

existing_ids = set(x["id"] for x in existing)
added_count = 0

for item in additional_fragrances:
    if item["id"] not in existing_ids:
        existing.append(item)
        existing_ids.add(item["id"])
        added_count += 1

with open("src/data/fragrances.json", "w", encoding="utf-8") as f:
    json.dump(existing, f, indent=2, ensure_ascii=False)

print(f"Added {added_count} more fragrances! Total in database now: {len(existing)}")

brands = {}
for d in existing:
    brands[d["brand"]] = brands.get(d["brand"], 0) + 1
for b, c in sorted(brands.items()):
    print(f"  • {b}: {c} fragrances")
