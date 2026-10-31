import json

vintage_and_legacy_fragrances = [
    # ==================== RASASI CLASSICS ====================
    {
        "id": "rasasi-royale-pour-homme",
        "name": "Royale Pour Homme",
        "brand": "Rasasi",
        "collection": "Royale Collection (2000)",
        "rating_value": 4.18, "rating_count": 2900, "gender": "Men", "release_year": 2000,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Classic Aromatic Geranium, Cinnamon & Cedar Amber", "dna_type": "Woody Spicy Aromatic", "similarity_percentage": 90, "price_usd": 20,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Woody", "score": 90, "color": "#854d0e"}, {"name": "Aromatic", "score": 82, "color": "#16a34a"}, {"name": "Amber", "score": 75, "color": "#d97706"}],
        "notes": {"top": ["Geranium", "Lavender"], "middle": ["Cinnamon", "Cedarwood"], "base": ["Amber", "Patchouli", "Oakmoss"]},
        "seasons": {"fall": 40, "winter": 35, "spring": 20, "summer": 5}, "day_night": {"day": 40, "night": 60},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Classic masculine cinnamon cedar signature", "Warm barbershop nostalgia", "Great $20 value"], "cons": ["Traditional 2000s profile"], "community_verdict": "Very noble, masculine warm spice.", "top_reviewer_quotes": ["Cinnamon, lavender, and warm cedarwood."]},
        "flankers": ["rasasi-royale-blue"], "dna_twins": ["armaf-elite-pour-homme"]
    },
    {
        "id": "rasasi-royale-pour-femme",
        "name": "Royale Pour Femme",
        "brand": "Rasasi",
        "collection": "Royale Collection (2000)",
        "rating_value": 4.14, "rating_count": 1800, "gender": "Women", "release_year": 2000,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Sweet Tangerine, Honeyed Jasmine & Golden Vanilla", "dna_type": "Floral Fruity Gourmand", "similarity_percentage": 89, "price_usd": 20,
        "accords": [{"name": "Sweet", "score": 100, "color": "#ec4899"}, {"name": "White Floral", "score": 90, "color": "#fbcfe8"}, {"name": "Citrus", "score": 85, "color": "#eab308"}, {"name": "Vanilla", "score": 78, "color": "#f59e0b"}],
        "notes": {"top": ["Tangerine", "Bergamot"], "middle": ["Honey", "Jasmine", "Orange Blossom"], "base": ["Vanilla", "Sandalwood", "Amber"]},
        "seasons": {"spring": 42, "fall": 30, "summer": 18, "winter": 10}, "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Honeyed white florals with sweet citrus", "Comforting warm vanilla finish"], "cons": ["Sweet floral profile"], "community_verdict": "Uplifting sweet honeyed citrus floral.", "top_reviewer_quotes": ["Sweet tangerine and honeyed jasmine."]},
        "flankers": ["rasasi-royale-blue"], "dna_twins": ["titan-skinn-celeste"]
    },
    {
        "id": "rasasi-hope-men",
        "name": "Hope Men",
        "brand": "Rasasi",
        "collection": "Classic Heritage",
        "rating_value": 4.12, "rating_count": 1600, "gender": "Men", "release_year": 2001,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Crisp Marine Green Citrus & Clean Cedar Amber", "dna_type": "Aromatic Marine Woody", "similarity_percentage": 90, "price_usd": 18,
        "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0ea5e9"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Woody", "score": 80, "color": "#854d0e"}],
        "notes": {"top": ["Mandarin Orange", "Sea Notes"], "middle": ["Lavender", "Floral Notes"], "base": ["Cedarwood", "Amber", "Musk"]},
        "seasons": {"summer": 65, "spring": 25, "fall": 8, "winter": 2}, "day_night": {"day": 80, "night": 20},
        "longevity": "Moderate (6-7 hrs)", "sillage": "Moderate",
        "review_summary": {"pros": ["Refreshing airy marine citrus", "Gentle everyday summer driver"], "cons": ["Moderate projection"], "community_verdict": "Subtle aquatic everyday cologne.", "top_reviewer_quotes": ["Clean sea breeze and mandarin orange."]},
        "flankers": ["rasasi-chastity-men"], "dna_twins": ["rasasi-hawas-for-men"]
    },
    {
        "id": "rasasi-arba-wardat",
        "name": "Arba Wardat",
        "brand": "Rasasi",
        "collection": "Heritage Attar Oil",
        "rating_value": 4.35, "rating_count": 3100, "gender": "Unisex", "release_year": 2003,
        "concentration": "Concentrated Perfume Oil", "primary_season": "All Season",
        "dna_inspiration": "Four Royal Roses, Bergamot & Golden Sandalwood", "dna_type": "Floral Woody Amber Oil", "similarity_percentage": 94, "price_usd": 22,
        "accords": [{"name": "Rose", "score": 100, "color": "#f43f5e"}, {"name": "White Floral", "score": 90, "color": "#fbcfe8"}, {"name": "Woody", "score": 82, "color": "#854d0e"}, {"name": "Musk", "score": 75, "color": "#cbd5e1"}],
        "notes": {"top": ["Bergamot", "Jasmine"], "middle": ["Damask Rose", "Taif Rose", "Bulgarian Rose"], "base": ["Sandalwood", "Amber", "White Musk"]},
        "seasons": {"spring": 35, "fall": 30, "summer": 20, "winter": 15}, "day_night": {"day": 55, "night": 45},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Intimate to Enormous",
        "review_summary": {"pros": ["Pure concentrated perfume oil that lasts 24+ hours on skin", "Masterpiece blend of four precious roses", "Exquisite heritage flacon"], "cons": ["Oil application required"], "community_verdict": "One of the most famous oriental rose oils in the world.", "top_reviewer_quotes": ["Pure royal rose nectar and creamy sandalwood."]},
        "flankers": ["rasasi-afshan"], "dna_twins": ["lattafa-badee-al-oud-amethyst"]
    },
    {
        "id": "rasasi-afshan",
        "name": "Afshan",
        "brand": "Rasasi",
        "collection": "Classic Heritage",
        "rating_value": 4.29, "rating_count": 2700, "gender": "Unisex", "release_year": 2006,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Warm Golden Saffron, Ylang-Ylang & Oriental Amber", "dna_type": "Oriental Floral Spicy", "similarity_percentage": 92, "price_usd": 20,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Floral", "score": 88, "color": "#fbcfe8"}, {"name": "Amber", "score": 85, "color": "#d97706"}, {"name": "Woody", "score": 78, "color": "#854d0e"}],
        "notes": {"top": ["Saffron", "Floral Notes", "Green Notes"], "middle": ["Ylang-Ylang", "Rose", "Spices"], "base": ["Amber", "Woody Notes", "Musk", "Cedarwood"]},
        "seasons": {"fall": 42, "winter": 38, "spring": 15, "summer": 5}, "day_night": {"day": 35, "night": 65},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Rich golden saffron with velvety florals", "Authentic traditional Dubai scent profile"], "cons": ["Heavy oriental style"], "community_verdict": "Authentic Gulf golden spice and rose.", "top_reviewer_quotes": ["Saffron threads, ylang-ylang, and warm amber."]},
        "flankers": ["rasasi-arba-wardat"], "dna_twins": ["lattafa-raghba"]
    },
    {
        "id": "rasasi-entebaa-men",
        "name": "Entebaa Men",
        "brand": "Rasasi",
        "collection": "Entebaa Series",
        "rating_value": 4.36, "rating_count": 2200, "gender": "Men", "release_year": 2014,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Juicy Plum, Pineapple, Black Pepper & Guaiac Wood", "dna_type": "Fruity Woody Spicy", "similarity_percentage": 93, "price_usd": 32,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Woody", "score": 90, "color": "#854d0e"}, {"name": "Warm Spicy", "score": 84, "color": "#c2410c"}, {"name": "Vanilla", "score": 76, "color": "#f59e0b"}],
        "notes": {"top": ["Plum", "Pineapple", "Lime", "Black Pepper"], "middle": ["Patchouli", "Vetiver", "Galbanum"], "base": ["Guaiac Wood", "Vanilla", "Tonka Bean", "Praline"]},
        "seasons": {"fall": 35, "spring": 30, "winter": 20, "summer": 15}, "day_night": {"day": 55, "night": 45},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Delectable dark plum with smoky roasted pineapple and guaiac", "Remarkably versatile high-heat to cool-weather performer"], "cons": ["Fruity opening"], "community_verdict": "One of Rasasi's hidden masterpiece gems.", "top_reviewer_quotes": ["Dark rich plum and smoky pineapple. Seductive."]},
        "flankers": ["rasasi-daarej-pour-homme"], "dna_twins": ["lattafa-vintage-radio"]
    },
    {
        "id": "rasasi-qasamat-rasana",
        "name": "Qasamat Rasana",
        "brand": "Rasasi",
        "collection": "Qasamat Series",
        "rating_value": 4.40, "rating_count": 1900, "gender": "Unisex", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Crisp Bergamot, Apple, Leather & Cypriol Amber", "dna_type": "Fruity Leather Woody", "similarity_percentage": 93, "price_usd": 48,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Woody", "score": 92, "color": "#854d0e"}, {"name": "Leather", "score": 85, "color": "#78350f"}, {"name": "Citrus", "score": 80, "color": "#eab308"}],
        "notes": {"top": ["Bergamot", "Apple", "Lemon"], "middle": ["Leather", "Sandalwood", "Cypriol Oil"], "base": ["Cedarwood", "Amber", "Musk"]},
        "seasons": {"spring": 35, "fall": 35, "summer": 20, "winter": 10}, "day_night": {"day": 60, "night": 40},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Zesty apple leather with smoky earthy cypriol", "High-tier executive presence"], "cons": ["Cypriol has an earthy bite"], "community_verdict": "Sophisticated, fruity-leather luxury.", "top_reviewer_quotes": ["Crisp green apple and noble suede leather."]},
        "flankers": ["rasasi-qasamat-ebhar"], "dna_twins": ["afnan-rare-carbon"]
    },
    {
        "id": "rasasi-la-yuqawam-tobacco-blaze",
        "name": "La Yuqawam Tobacco Blaze",
        "brand": "Rasasi",
        "collection": "La Yuqawam Luxury",
        "rating_value": 4.38, "rating_count": 3200, "gender": "Men", "release_year": 2013,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "White Peach, Burning Tobacco Leaf, Amber & Leather", "dna_type": "Warm Spicy Tobacco Leather", "similarity_percentage": 94, "price_usd": 65,
        "accords": [{"name": "Tobacco", "score": 100, "color": "#78350f"}, {"name": "Warm Spicy", "score": 92, "color": "#c2410c"}, {"name": "Leather", "score": 88, "color": "#451a03"}, {"name": "Amber", "score": 82, "color": "#d97706"}, {"name": "Fruity", "score": 75, "color": "#f97316"}],
        "notes": {"top": ["White Peach", "Lily-of-the-Valley", "Neroli"], "middle": ["Amber", "Cedarwood", "Violet"], "base": ["Tobacco", "Leather", "Oud", "Sandalwood", "Patchouli"]},
        "seasons": {"winter": 58, "fall": 34, "spring": 6, "summer": 2}, "day_night": {"day": 15, "night": 85},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Nuclear",
        "review_summary": {"pros": ["Unapologetic smoky cured tobacco and raw masculine leather", "Surprising juicy white peach opening that balances the smoke", "Elite niche luxury performance"], "cons": ["Very bold and polarizing, strictly for cold weather"], "community_verdict": "A legendary tobacco beast.", "top_reviewer_quotes": ["White peach sweetness cut by burning pipe tobacco and rugged leather."]},
        "flankers": ["rasasi-la-yuqawam-pour-homme"], "dna_twins": ["rasasi-la-yuqawam-pour-homme"]
    },

    # ==================== LATTAFA CLASSIC VAULT ====================
    {
        "id": "lattafa-raghba-wood-intense",
        "name": "Raghba Wood Intense",
        "brand": "Lattafa",
        "collection": "Raghba Series",
        "rating_value": 4.35, "rating_count": 5100, "gender": "Unisex", "release_year": 2014,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Dark Caramel, Licorice, Guaiac Wood & Burning Incense", "dna_type": "Woody Gourmand Smoky", "similarity_percentage": 93, "price_usd": 20,
        "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Sweet", "score": 90, "color": "#ec4899"}, {"name": "Caramel", "score": 86, "color": "#d97706"}, {"name": "Incense / Smoky", "score": 82, "color": "#475569"}],
        "notes": {"top": ["Caramel", "Guaiac Wood", "Licorice", "Cedarwood"], "middle": ["Sugar", "Oud", "Sandalwood", "Cashmere Wood"], "base": ["Incense", "Vanilla", "Amber", "Oakmoss"]},
        "seasons": {"winter": 62, "fall": 32, "spring": 5, "summer": 1}, "day_night": {"day": 15, "night": 85},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["Deep, dark burnt caramel and scorched woods", "Takes original Raghba and removes sweetness in favor of rich campfire smoke", "Tremendous cold-weather presence"], "cons": ["Very smoky and intense"], "community_verdict": "Darker, woodier version of iconic Raghba.", "top_reviewer_quotes": ["Smoky campfire woods drenched in molten burnt sugar."]},
        "flankers": ["lattafa-raghba"], "dna_twins": ["lattafa-ameer-al-oudh-intense-oud"]
    },
    {
        "id": "lattafa-sheikh-al-shuyukh-luxe",
        "name": "Sheikh Al Shuyukh Luxe Edition",
        "brand": "Lattafa",
        "collection": "Sheikh Al Shuyukh",
        "rating_value": 4.38, "rating_count": 4600, "gender": "Unisex", "release_year": 2015,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Spiced Cinnamon Rose, Golden Caramel & Amber Patchouli", "dna_type": "Amber Spicy Gourmand", "similarity_percentage": 93, "price_usd": 22,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Caramel", "score": 90, "color": "#d97706"}, {"name": "Rose", "score": 85, "color": "#f43f5e"}, {"name": "Vanilla", "score": 80, "color": "#f59e0b"}],
        "notes": {"top": ["Rose", "Cinnamon", "Saffron"], "middle": ["Caramel", "Patchouli"], "base": ["Vanilla", "Woody Notes", "Amber", "Amberwood"]},
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 30, "night": 70},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Rich spicy cinnamon rose layered over golden gooey caramel", "Superb sillage and cozy warmth"], "cons": ["Sweet and rich profile"], "community_verdict": "Gourmand cinnamon rose masterpiece.", "top_reviewer_quotes": ["Gooey caramel, spicy cinnamon, and lush red roses."]},
        "flankers": ["lattafa-raghba"], "dna_twins": ["lattafa-khamrah-qahwa"]
    },
    {
        "id": "lattafa-24-carat-pure-gold",
        "name": "24 Carat Pure Gold",
        "brand": "Lattafa",
        "collection": "Precious Metals",
        "rating_value": 4.29, "rating_count": 3600, "gender": "Unisex", "release_year": 2013,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Aged Oud, Saffron, Cinnamon, Incense & Golden Amber", "dna_type": "Oriental Woody Amber", "similarity_percentage": 92, "price_usd": 20,
        "accords": [{"name": "Oud", "score": 100, "color": "#78350f"}, {"name": "Warm Spicy", "score": 92, "color": "#c2410c"}, {"name": "Incense / Smoky", "score": 85, "color": "#475569"}, {"name": "Amber", "score": 80, "color": "#d97706"}],
        "notes": {"top": ["Agarwood (Oud)", "Saffron", "Cinnamon"], "middle": ["Rose", "Sandalwood"], "base": ["Incense", "Leather", "Amber", "Vanilla", "Musk"]},
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"day": 20, "night": 80},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["Opulent spicy oud incense at an entry-level price", "Heavyweight gold block bottle"], "cons": ["Strong traditional oud presence"], "community_verdict": "Classic oriental golden oud.", "top_reviewer_quotes": ["Saffron, dry cinnamon, aged oud, and sweet incense."]},
        "flankers": ["lattafa-raghba"], "dna_twins": ["lattafa-qaaed"]
    },
    {
        "id": "lattafa-khalis-musk",
        "name": "Khalis Musk (Pure Musk)",
        "brand": "Lattafa",
        "collection": "Heritage Classics",
        "rating_value": 4.25, "rating_count": 4200, "gender": "Unisex", "release_year": 2015,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Pure Heavenly White Musk, Soapy Clean Florals & Powder", "dna_type": "Powdery Clean Floral Musk", "similarity_percentage": 95, "price_usd": 16,
        "accords": [{"name": "Musk", "score": 100, "color": "#cbd5e1"}, {"name": "Powdery", "score": 92, "color": "#e2e8f0"}, {"name": "Clean / Soapy", "score": 88, "color": "#38bdf8"}],
        "notes": {"top": ["White Musk", "Sweet Notes"], "middle": ["Violet", "White Florals"], "base": ["Powdery Notes", "White Amber"]},
        "seasons": {"spring": 35, "summer": 35, "fall": 20, "winter": 10}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate",
        "review_summary": {"pros": ["The quintessential pure clean white musk fragrance", "Freshly washed luxury hotel linen feeling", "Superb for layering under any perfume"], "cons": ["Soft intimate scent bubble"], "community_verdict": "The cleanest, purest white musk on the market.", "top_reviewer_quotes": ["Cleanest soapy white musk in existence. Heavenly."]},
        "flankers": ["lattafa-opulent-musk"], "dna_twins": ["rasasi-chastity-men"]
    },
    {
        "id": "lattafa-maahir-black-edition",
        "name": "Maahir Black Edition",
        "brand": "Lattafa",
        "collection": "Maahir Series",
        "rating_value": 4.42, "rating_count": 4700, "gender": "Men", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Orto Parisi Terroni & Amouage Interlude Man", "dna_type": "Dark Smoky Leather Incense", "similarity_percentage": 93, "price_usd": 35,
        "accords": [{"name": "Incense / Smoky", "score": 100, "color": "#334155"}, {"name": "Leather", "score": 90, "color": "#451a03"}, {"name": "Warm Spicy", "score": 85, "color": "#c2410c"}, {"name": "Woody", "score": 80, "color": "#854d0e"}],
        "notes": {"top": ["Black Pepper", "Pink Pepper", "Saffron"], "middle": ["Labdanum", "Cade Oil", "Rhubarb", "Gurjum Balsam"], "base": ["Leather", "Cedarwood", "Patchouli", "Guaiac Wood", "Musk", "Moss"]},
        "seasons": {"winter": 65, "fall": 30, "spring": 4, "summer": 1}, "day_night": {"day": 10, "night": 90},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Nuclear",
        "review_summary": {"pros": ["Nuclear dark smoke, black leather, and fiery black pepper", "Famous chrome horse-head bottle", "Pure gothic niche masculinity"], "cons": ["Extreme cade oil smoke, not for beginners"], "community_verdict": "A legendary dark smoke beast.", "top_reviewer_quotes": ["Black pepper, burning birch cade, and heavy biker leather."]},
        "flankers": ["lattafa-maahir"], "dna_twins": ["afnan-supremacy-incense"]
    },
    {
        "id": "lattafa-ana-abiyedh",
        "name": "Ana Abiyedh (White)",
        "brand": "Lattafa",
        "collection": "Ana Abiyedh Series",
        "rating_value": 4.32, "rating_count": 6800, "gender": "Unisex", "release_year": 2016,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Xerjoff Erba Pura", "dna_type": "Fruity Sweet White Musk", "similarity_percentage": 93, "price_usd": 19,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Musk", "score": 92, "color": "#cbd5e1"}, {"name": "Sweet", "score": 88, "color": "#ec4899"}, {"name": "Citrus", "score": 80, "color": "#eab308"}],
        "notes": {"top": ["White Musk", "Cypriol Oil"], "middle": ["Cardamom", "Saffron", "Vanilla"], "base": ["Oud", "Guaiac Wood"]},
        "seasons": {"summer": 55, "spring": 30, "fall": 12, "winter": 3}, "day_night": {"day": 75, "night": 25},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["Explosive sweet Mediterranean fruits with creamy clean white musk", "Fabulous Erba Pura alternative for under $20"], "cons": ["Potent sweet musk"], "community_verdict": "One of the most popular summer fruit fragrances in the world.", "top_reviewer_quotes": ["Juicy fruits, vanilla, and clean magnetic white musk."]},
        "flankers": ["lattafa-ana-abiyedh-rouge"], "dna_twins": ["lattafa-ana-abiyedh-rouge"]
    },
    {
        "id": "lattafa-badee-al-oud-amethyst",
        "name": "Bade'e Al Oud Amethyst",
        "brand": "Lattafa",
        "collection": "Bade'e Al Oud",
        "rating_value": 4.43, "rating_count": 6200, "gender": "Unisex", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Initio Atomic Rose", "dna_type": "Floral Spicy Amber Rose", "similarity_percentage": 94, "price_usd": 30,
        "accords": [{"name": "Rose", "score": 100, "color": "#f43f5e"}, {"name": "Warm Spicy", "score": 88, "color": "#c2410c"}, {"name": "Amber", "score": 82, "color": "#d97706"}, {"name": "Vanilla", "score": 78, "color": "#f59e0b"}],
        "notes": {"top": ["Pink Pepper", "Bergamot"], "middle": ["Turkish Rose", "Bulgarian Rose", "Jasmine"], "base": ["Agarwood (Oud)", "Amber", "Vanilla"]},
        "seasons": {"fall": 42, "winter": 38, "spring": 16, "summer": 4}, "day_night": {"day": 30, "night": 70},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["Superb 94% clone of Initio Atomic Rose", "Explosive jammy rose with spicy pink pepper and sensual amber", "Stunning purple and gold bottle"], "cons": ["Heavy rose presence"], "community_verdict": "Elite rose fragrance for both men and women.", "top_reviewer_quotes": ["Spicy pink pepper and royal Atomic Rose petals."]},
        "flankers": ["lattafa-badee-al-oud-for-glory", "lattafa-badee-al-oud-honor-and-glory"], "dna_twins": ["afnan-souvenir-floral-bouquet"]
    },

    # ==================== ARMAF LEGACY CLASSICS ====================
    {
        "id": "armaf-hunter-intense",
        "name": "Hunter Intense",
        "brand": "Armaf",
        "collection": "Hunter Collection",
        "rating_value": 4.37, "rating_count": 4900, "gender": "Men", "release_year": 2016,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Dior Sauvage & Paco Rabanne Invictus Hybrid", "dna_type": "Citrus Fresh Spicy Marine", "similarity_percentage": 93, "price_usd": 28,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Fresh Spicy", "score": 90, "color": "#059669"}, {"name": "Aromatic", "score": 85, "color": "#16a34a"}, {"name": "Marine / Aquatic", "score": 80, "color": "#0ea5e9"}],
        "notes": {"top": ["Bergamot", "Lemon", "Mandarin Orange", "Grapefruit"], "middle": ["Cardamom", "Lavender", "Geranium", "Pepper"], "base": ["Cedarwood", "Vetiver", "Patchouli", "Labdanum"]},
        "seasons": {"summer": 35, "spring": 35, "fall": 20, "winter": 10}, "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Masterful fusion of Sauvage's peppery ambroxan and Invictus' sweet marine citrus", "Massive compliment beast for casual and gym wear"], "cons": ["Synthetic punch in first 5 minutes"], "community_verdict": "The ultimate mass-pleasing hybrid.", "top_reviewer_quotes": ["Sauvage and Invictus in one bottle. People stop you to ask what you're wearing."]},
        "flankers": ["armaf-hunter-men"], "dna_twins": ["rasasi-hawas-for-men", "afnan-modest-une"]
    },
    {
        "id": "armaf-derby-club-house-blanche",
        "name": "Derby Club House Blanche",
        "brand": "Armaf",
        "collection": "Derby Club House",
        "rating_value": 4.31, "rating_count": 3500, "gender": "Men", "release_year": 2014,
        "concentration": "Eau de Toilette", "primary_season": "Spring",
        "dna_inspiration": "Creed Silver Mountain Water", "dna_type": "Fresh Aromatic Inky Metallic", "similarity_percentage": 92, "price_usd": 24,
        "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Green", "score": 88, "color": "#15803d"}, {"name": "Citrus", "score": 82, "color": "#eab308"}, {"name": "Marine / Aquatic", "score": 75, "color": "#0ea5e9"}],
        "notes": {"top": ["Water Notes", "Orange", "Bergamot"], "middle": ["Green Tea", "Blackcurrant"], "base": ["Galbanum", "Musk", "Sandalwood"]},
        "seasons": {"spring": 45, "summer": 40, "fall": 12, "winter": 3}, "day_night": {"day": 80, "night": 20},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Early Creed Silver Mountain Water tribute", "Crisp green tea, blackcurrant, and cool alpine spring waters"], "cons": ["Inky tea metallic tone"], "community_verdict": "Very crisp alpine mountain stream scent.", "top_reviewer_quotes": ["Green tea and icy mountain waters."]},
        "flankers": ["armaf-derby-club-house"], "dna_twins": ["rasasi-al-wisam-day", "armaf-club-de-nuit-sillage"]
    },
    {
        "id": "armaf-niche-oud",
        "name": "Niche Oud",
        "brand": "Armaf",
        "collection": "Armaf Niche Line",
        "rating_value": 4.36, "rating_count": 2800, "gender": "Unisex", "release_year": 2014,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Spiced Caraway, Iris, Aged Oud & Warm Vanilla Amber", "dna_type": "Oriental Woody Spicy", "similarity_percentage": 93, "price_usd": 34,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Oud", "score": 88, "color": "#78350f"}, {"name": "Amber", "score": 84, "color": "#d97706"}, {"name": "Vanilla", "score": 80, "color": "#f59e0b"}],
        "notes": {"top": ["Spicy Notes", "Caraway", "Sage", "Bergamot"], "middle": ["Black Pepper", "Cedarwood", "Iris"], "base": ["Agarwood (Oud)", "Leather", "Patchouli", "Amber", "Vanilla"]},
        "seasons": {"winter": 52, "fall": 38, "spring": 8, "summer": 2}, "day_night": {"day": 25, "night": 75},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Warm, seductive spicy oud without harsh animalic barnyard facets", "High elegance and comforting vanilla amber drydown"], "cons": ["Caraway top note is unique"], "community_verdict": "One of Armaf's highest quality niche blends.", "top_reviewer_quotes": ["Caraway, spicy iris, and smooth creamy vanilla oud."]},
        "flankers": ["armaf-niche-sapphire", "armaf-niche-black-onyx"], "dna_twins": ["lattafa-qaaed"]
    },

    # ==================== AFNAN LEGACY BENCHMARKS ====================
    {
        "id": "afnan-supremacy-silver",
        "name": "Supremacy Silver",
        "brand": "Afnan",
        "collection": "Supremacy Series (2013)",
        "rating_value": 4.44, "rating_count": 7800, "gender": "Men", "release_year": 2013,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Creed Aventus (Fruity Vintage Batch)", "dna_type": "Fruity Woody Smoky Chypre", "similarity_percentage": 95, "price_usd": 38,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Woody", "score": 90, "color": "#854d0e"}, {"name": "Smoky", "score": 84, "color": "#475569"}, {"name": "Citrus", "score": 80, "color": "#eab308"}],
        "notes": {"top": ["Pineapple", "Apple", "Bergamot", "Blackcurrant"], "middle": ["Birch", "Patchouli", "Jasmine", "Rose"], "base": ["Musk", "Oakmoss", "Ambergris", "Vanilla"]},
        "seasons": {"spring": 35, "summer": 30, "fall": 25, "winter": 10}, "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["The smoothest, most natural Creed Aventus clone in existence", "Juicy sweet pineapple with zero synthetic lemon screech", "Legendary metallic silver flacon"], "cons": ["Slightly gentler projection than CDNIM"], "community_verdict": "Widely praised as the highest quality Aventus alternative.", "top_reviewer_quotes": ["Juicy fresh pineapple, sweet blackcurrant, and delicate birch smoke. 10/10."]},
        "flankers": ["afnan-supremacy-not-only-intense", "afnan-supremacy-in-heaven"], "dna_twins": ["armaf-club-de-nuit-intense-man", "afnan-supremacy-not-only-intense"]
    },
    {
        "id": "afnan-supremacy-in-heaven",
        "name": "Supremacy In Heaven",
        "brand": "Afnan",
        "collection": "Supremacy Series",
        "rating_value": 4.35, "rating_count": 3900, "gender": "Men", "release_year": 2018,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Creed Silver Mountain Water", "dna_type": "Fresh Aromatic Citrus Metallic", "similarity_percentage": 93, "price_usd": 38,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Green", "score": 88, "color": "#15803d"}, {"name": "Aromatic", "score": 82, "color": "#16a34a"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
        "notes": {"top": ["Bergamot", "Mandarin Orange"], "middle": ["Green Tea", "Blackcurrant"], "base": ["Woody Notes", "Musk", "Sandalwood"]},
        "seasons": {"spring": 45, "summer": 38, "fall": 12, "winter": 5}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Icy cold alpine green tea and dark blackcurrant", "Refined, royal presentation in metallic blue flask"], "cons": ["Metallic tea vibe"], "community_verdict": "Very clean, noble spring signature.", "top_reviewer_quotes": ["Icy mountain stream, green tea, and blackcurrant."]},
        "flankers": ["afnan-supremacy-silver"], "dna_twins": ["rasasi-al-wisam-day", "armaf-club-de-nuit-sillage"]
    },

    # ==================== TITAN SKINN TALES EXPANSIONS ====================
    {
        "id": "titan-skinn-tales-malaga",
        "name": "Tales Malaga",
        "brand": "Titan Skinn",
        "collection": "Tales Collection",
        "rating_value": 4.28, "rating_count": 1400, "gender": "Women", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Candied Sun-Drenched Mandarin, White Florals & Vanilla Caramel", "dna_type": "Floral Fruity Gourmand", "similarity_percentage": 91, "price_usd": 28,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Sweet", "score": 88, "color": "#ec4899"}, {"name": "White Floral", "score": 82, "color": "#fbcfe8"}, {"name": "Vanilla", "score": 78, "color": "#f59e0b"}],
        "notes": {"top": ["Candied Orange", "Mandarin", "Ginger"], "middle": ["Orange Blossom", "Jasmine"], "base": ["Caramel", "Vanilla", "Cedarwood"]},
        "seasons": {"spring": 45, "summer": 28, "fall": 18, "winter": 9}, "day_night": {"day": 70, "night": 30},
        "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate",
        "review_summary": {"pros": ["Sparkling Spanish sunshine in a bottle", "Sweet candied citrus with warm caramel vanilla"], "cons": ["Gentle drydown"], "community_verdict": "Delicious sweet solar citrus.", "top_reviewer_quotes": ["Candied mandarin orange and warm caramel."]},
        "flankers": ["titan-skinn-tales-ibiza"], "dna_twins": ["titan-skinn-celeste"]
    },
    {
        "id": "titan-skinn-tales-ibiza",
        "name": "Tales Ibiza",
        "brand": "Titan Skinn",
        "collection": "Tales Collection",
        "rating_value": 4.22, "rating_count": 1100, "gender": "Men", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Sweet Honeydew Melon, Sea Salt & Driftwood", "dna_type": "Aquatic Fruity Marine", "similarity_percentage": 90, "price_usd": 28,
        "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0ea5e9"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
        "notes": {"top": ["Melon", "Lemon Zest", "Ginger"], "middle": ["Sea Salt", "Lavender", "Geranium"], "base": ["Driftwood", "Amber", "Musk"]},
        "seasons": {"summer": 70, "spring": 22, "fall": 6, "winter": 2}, "day_night": {"day": 80, "night": 20},
        "longevity": "Moderate (6-7 hrs)", "sillage": "Moderate",
        "review_summary": {"pros": ["Carefree Mediterranean beach party vibe", "Sweet honeydew melon and salty ocean breeze"], "cons": ["Summer longevity"], "community_verdict": "Playful, salty melon beach fragrance.", "top_reviewer_quotes": ["Honeydew melon and breezy ocean salt."]},
        "flankers": ["titan-skinn-tales-oslo"], "dna_twins": ["titan-skinn-amalfi-bleu"]
    },

    # ==================== MYKONOS GOURMANDS ====================
    {
        "id": "mykonos-lychee-breeze",
        "name": "Lychee Breeze",
        "brand": "Mykonos",
        "collection": "Fruity Gourmand",
        "rating_value": 4.41, "rating_count": 1700, "gender": "Women", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Sparkling Pink Lychee, Dewy Peony & White Woods", "dna_type": "Fruity Floral Sparkling", "similarity_percentage": 93, "price_usd": 26,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Floral", "score": 88, "color": "#fbcfe8"}, {"name": "Sweet", "score": 82, "color": "#ec4899"}],
        "notes": {"top": ["Sparkling Lychee", "Pink Pepper", "Red Apple"], "middle": ["Pink Peony", "Rose Petals"], "base": ["Cedarwood", "Vanilla Fluff", "Musk"]},
        "seasons": {"spring": 50, "summer": 35, "fall": 12, "winter": 3}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Juicy sparkling fresh pink lychee fruit", "Uplifting youthful floral trail"], "cons": ["Sweet fruity profile"], "community_verdict": "Irresistibly juicy and sparkling.", "top_reviewer_quotes": ["Crisp pink lychee and dewy peony petals."]},
        "flankers": ["mykonos-aphrodite"], "dna_twins": ["afnan-souvenir-floral-bouquet"]
    },
    {
        "id": "mykonos-moroccan-sunset",
        "name": "Moroccan Sunset",
        "brand": "Mykonos",
        "collection": "Warm Amber",
        "rating_value": 4.38, "rating_count": 1400, "gender": "Unisex", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Neroli Solar Blossom, Warm Spices & Golden Sunset Amber", "dna_type": "Amber Warm Spicy Solar", "similarity_percentage": 92, "price_usd": 28,
        "accords": [{"name": "Amber", "score": 100, "color": "#d97706"}, {"name": "Warm Spicy", "score": 88, "color": "#c2410c"}, {"name": "White Floral", "score": 80, "color": "#fbcfe8"}, {"name": "Vanilla", "score": 75, "color": "#f59e0b"}],
        "notes": {"top": ["Neroli", "Solar Notes", "Bergamot"], "middle": ["Orange Blossom", "Cinnamon", "Cardamom"], "base": ["Golden Amber", "Sandalwood", "Bourbon Vanilla"]},
        "seasons": {"fall": 42, "winter": 35, "spring": 18, "summer": 5}, "day_night": {"day": 40, "night": 60},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Golden hour sunset in Marrakech aura", "Warm glowing amber with uplifting neroli spice"], "cons": ["Warm spicy drydown"], "community_verdict": "Very cozy golden hour amber.", "top_reviewer_quotes": ["Radiant neroli and warm spiced amber."]},
        "flankers": ["mykonos-down-to-earth"], "dna_twins": ["afnan-historic-sahara"]
    },

    # ==================== RAYHAAN EXPANSIONS ====================
    {
        "id": "rayhaan-terra",
        "name": "Rayhaan Terra",
        "brand": "Rayhaan",
        "collection": "Signature Line",
        "rating_value": 4.38, "rating_count": 1200, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Hermès Terre d'Hermès", "dna_type": "Woody Spicy Citrus Flint", "similarity_percentage": 94, "price_usd": 32,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Woody", "score": 92, "color": "#854d0e"}, {"name": "Earthy", "score": 85, "color": "#78350f"}, {"name": "Warm Spicy", "score": 78, "color": "#c2410c"}],
        "notes": {"top": ["Bitter Orange", "Grapefruit", "Flint Accord"], "middle": ["Pink Pepper", "Pelargonium", "Geranium"], "base": ["Vetiver", "Cedarwood", "Patchouli", "Benzoin"]},
        "seasons": {"spring": 38, "fall": 35, "summer": 18, "winter": 9}, "day_night": {"day": 70, "night": 30},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Superb Terre d'Hermès alternative with richer performance", "Mineral flint, bitter orange, and noble earthy vetiver cedar"], "cons": ["Mineral flint is dry"], "community_verdict": "Exceptional executive mineral citrus.", "top_reviewer_quotes": ["Bitter orange zest, mineral flint stone, and earthy vetiver."]},
        "flankers": ["rayhaan-pacific", "rayhaan-aura"], "dna_twins": ["titan-skinn-raw"]
    },
    {
        "id": "rayhaan-noble",
        "name": "Rayhaan Noble",
        "brand": "Rayhaan",
        "collection": "Signature Line",
        "rating_value": 4.41, "rating_count": 1350, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Prada L'Homme", "dna_type": "Powdery Clean Floral Iris", "similarity_percentage": 95, "price_usd": 34,
        "accords": [{"name": "Powdery", "score": 100, "color": "#cbd5e1"}, {"name": "Iris / Floral", "score": 92, "color": "#8b5cf6"}, {"name": "Clean / Soapy", "score": 88, "color": "#38bdf8"}, {"name": "Woody", "score": 78, "color": "#854d0e"}],
        "notes": {"top": ["Neroli", "Cardamom", "Black Pepper"], "middle": ["Iris", "Violet", "Geranium"], "base": ["Amber", "Cedarwood", "Sandalwood", "Patchouli"]},
        "seasons": {"spring": 40, "summer": 30, "fall": 22, "winter": 8}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["The ultimate freshly ironed white shirt fragrance", "Velvety iris, crisp neroli, and comforting luxury soap vibe"], "cons": ["Powdery profile"], "community_verdict": "The pinnacle of office elegance.", "top_reviewer_quotes": ["Fresh neroli, soapy luxury iris, and smooth amber."]},
        "flankers": ["rayhaan-pacific"], "dna_twins": ["armaf-futura-la-homme"]
    }
]

with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json', 'r') as f:
    existing = json.load(f)

existing_ids = {item['id'] for item in existing}
added_count = 0

for p in vintage_and_legacy_fragrances:
    if p['id'] not in existing_ids:
        existing.append(p)
        existing_ids.add(p['id'])
        added_count += 1
    else:
        for i, item in enumerate(existing):
            if item['id'] == p['id']:
                existing[i] = p

with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json', 'w') as f:
    json.dump(existing, f, indent=2)

print(f"Successfully added/updated {added_count} vintage and legacy vault fragrances!")
print(f"Total fragrances now in database: {len(existing)}")
