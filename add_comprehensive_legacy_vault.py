import json

legacy_perfumes = [
    # =========================================================================
    # RASASI LEGACY & VINTAGE VAULT (1990s - 2010s)
    # =========================================================================
    {
        "id": "rasasi-blue-lady",
        "name": "Blue Lady",
        "brand": "Rasasi",
        "collection": "Classic Vintage (1995)",
        "rating_value": 4.12, "rating_count": 2800, "gender": "Women", "release_year": 1995,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Classic Vintage Tuberose & Golden Peach Amber", "dna_type": "Floral Woody Musk", "similarity_percentage": 90, "price_usd": 18,
        "accords": [
            {"name": "White Floral", "score": 100, "color": "#fbcfe8"},
            {"name": "Tuberose", "score": 92, "color": "#ec4899"},
            {"name": "Fruity", "score": 85, "color": "#f97316"},
            {"name": "Amber", "score": 75, "color": "#d97706"},
            {"name": "Woody", "score": 70, "color": "#854d0e"}
        ],
        "notes": {
            "top": ["Tuberose", "Ylang-Ylang", "African Orange Flower", "Violet Leaf"],
            "middle": ["Peach", "Plum", "Narcissus", "Jasmine"],
            "base": ["Sandalwood", "Vanille", "Amber", "Musk"]
        },
        "seasons": {"spring": 40, "fall": 30, "summer": 20, "winter": 10}, "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Legendary 90s powerhouse floral", "Rich opulent tuberose with juicy peach and warm amber", "Unbeatable vintage value"],
            "cons": ["Vintage tuberose heavy style"],
            "community_verdict": "One of Rasasi's most famous heritage feminine fragrances.",
            "top_reviewer_quotes": ["Vintage luxury at a budget price. Intoxicating tuberose."]
        },
        "flankers": ["rasasi-blue-for-men"], "dna_twins": ["titan-skinn-celeste"]
    },
    {
        "id": "rasasi-royale-blue",
        "name": "Royale Blue Pour Homme",
        "brand": "Rasasi",
        "collection": "Royale Collection (2000)",
        "rating_value": 4.20, "rating_count": 3400, "gender": "Men", "release_year": 2000,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Crisp Aquatic Melon & Oceanic Cedarwood", "dna_type": "Woody Floral Musk Aquatic", "similarity_percentage": 91, "price_usd": 20,
        "accords": [
            {"name": "Marine / Aquatic", "score": 100, "color": "#0ea5e9"},
            {"name": "Aromatic", "score": 88, "color": "#16a34a"},
            {"name": "Woody", "score": 80, "color": "#854d0e"},
            {"name": "Fruity", "score": 75, "color": "#f97316"}
        ],
        "notes": {
            "top": ["Sea Notes", "Melon", "Bergamot", "Galbanum"],
            "middle": ["Lavender", "Violet", "Rose", "Jasmine"],
            "base": ["Cedarwood", "Sandalwood", "Amber", "Musk", "Patchouli"]
        },
        "seasons": {"summer": 60, "spring": 30, "fall": 8, "winter": 2}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Invigorating 2000s nostalgic sea melon breeze", "Long lasting summer heat performance", "Extreme budget classic"],
            "cons": ["Classic 2000s aquatic DNA"],
            "community_verdict": "A beloved millennium classic from Rasasi.",
            "top_reviewer_quotes": ["Salty ocean melon and masculine clean cedarwood."]
        },
        "flankers": ["rasasi-royale-pour-homme"], "dna_twins": ["rasasi-hawas-for-men", "rayhaan-pacific"]
    },
    {
        "id": "rasasi-chastity-men",
        "name": "Chastity Men",
        "brand": "Rasasi",
        "collection": "Classic Heritage",
        "rating_value": 4.15, "rating_count": 2100, "gender": "Men", "release_year": 2005,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Clean Brazilian Tangerine & White Musk", "dna_type": "Citrus Aromatic Musk", "similarity_percentage": 90, "price_usd": 18,
        "accords": [
            {"name": "Citrus", "score": 100, "color": "#eab308"},
            {"name": "Aromatic", "score": 85, "color": "#16a34a"},
            {"name": "Musk", "score": 80, "color": "#cbd5e1"},
            {"name": "Fresh Spicy", "score": 75, "color": "#059669"}
        ],
        "notes": {
            "top": ["Tangerine", "Lime"],
            "middle": ["Pepper"],
            "base": ["White Musk", "Patchouli"]
        },
        "seasons": {"summer": 65, "spring": 25, "fall": 8, "winter": 2}, "day_night": {"day": 80, "night": 20},
        "longevity": "Moderate (6-7 hrs)", "sillage": "Moderate",
        "review_summary": {
            "pros": ["Crisp sparkling lime and tangerine", "Ultra clean office safe white musk"],
            "cons": ["Simple note pyramid"],
            "community_verdict": "Very clean, soapy citrus white musk.",
            "top_reviewer_quotes": ["The cleanest white shirt fragrance you can buy under $20."]
        },
        "flankers": ["rasasi-chastity-women"], "dna_twins": ["titan-skinn-raw"]
    },
    {
        "id": "rasasi-al-wisam-day",
        "name": "Al Wisam Day",
        "brand": "Rasasi",
        "collection": "Al Wisam Series",
        "rating_value": 4.41, "rating_count": 4200, "gender": "Men", "release_year": 2011,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Creed Silver Mountain Water", "dna_type": "Fresh Metallic Floral Woody", "similarity_percentage": 94, "price_usd": 32,
        "accords": [
            {"name": "Rose", "score": 100, "color": "#f43f5e"},
            {"name": "Fresh Spicy", "score": 90, "color": "#059669"},
            {"name": "Aromatic", "score": 85, "color": "#16a34a"},
            {"name": "Woody", "score": 78, "color": "#854d0e"},
            {"name": "Metallic / Clean", "score": 75, "color": "#94a3b8"}
        ],
        "notes": {
            "top": ["Bergamot", "Lavender", "Geranium"],
            "middle": ["Rose", "Clary Sage", "Sandalwood", "Cedarwood"],
            "base": ["Amber", "Musk", "Oakmoss", "Agarwood"]
        },
        "seasons": {"spring": 45, "summer": 35, "fall": 15, "winter": 5}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Legendary Creed Silver Mountain Water alternative", "Crisp rose and metallic inky tea with noble cedar", "Significantly outperforms the Creed original"],
            "cons": ["Prominent masculine rose note"],
            "community_verdict": "A legendary benchmark in the Middle Eastern clone community.",
            "top_reviewer_quotes": ["Chilly mountain stream, crisp rose, and clean musk."]
        },
        "flankers": ["rasasi-al-wisam-evening"], "dna_twins": ["armaf-club-de-nuit-sillage"]
    },
    {
        "id": "rasasi-tasmeem-men",
        "name": "Tasmeem Men",
        "brand": "Rasasi",
        "collection": "Oriental Classics",
        "rating_value": 4.28, "rating_count": 2900, "gender": "Men", "release_year": 2008,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Spiced Cardamom Vanilla & Powdery Orris", "dna_type": "Oriental Spicy Amber", "similarity_percentage": 92, "price_usd": 25,
        "accords": [
            {"name": "Warm Spicy", "score": 100, "color": "#c2410c"},
            {"name": "Vanilla", "score": 90, "color": "#f59e0b"},
            {"name": "Aromatic", "score": 82, "color": "#16a34a"},
            {"name": "Powdery", "score": 75, "color": "#cbd5e1"}
        ],
        "notes": {
            "top": ["Cardamom", "Cumin", "Artemisia"],
            "middle": ["Rose", "Orris Root"],
            "base": ["Vanilla", "Tonka Bean", "Amber", "Sandalwood", "Patchouli"]
        },
        "seasons": {"fall": 45, "winter": 35, "spring": 15, "summer": 5}, "day_night": {"day": 35, "night": 65},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Warm cardamom and rich vanilla tonka", "Smooth comforting powdery drydown", "Exceptional value under $25"],
            "cons": ["Cumin top note requires 5 mins to settle"],
            "community_verdict": "One of Rasasi's most comforting and affordable cold-weather gems.",
            "top_reviewer_quotes": ["Warm spicy vanilla heaven for autumn nights."]
        },
        "flankers": ["rasasi-daarej-pour-homme"], "dna_twins": ["rasasi-daarej-pour-homme", "afnan-historic-sahara"]
    },
    {
        "id": "rasasi-qasamat-ebhar",
        "name": "Qasamat Ebhar",
        "brand": "Rasasi",
        "collection": "Qasamat Series",
        "rating_value": 4.45, "rating_count": 2100, "gender": "Unisex", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Crisp Green Apple, Praline & Bourbon Vanilla", "dna_type": "Fruity Gourmand Vanilla", "similarity_percentage": 94, "price_usd": 48,
        "accords": [
            {"name": "Vanilla", "score": 100, "color": "#f59e0b"},
            {"name": "Fruity", "score": 92, "color": "#f97316"},
            {"name": "Sweet", "score": 88, "color": "#ec4899"},
            {"name": "Chocolate / Praline", "score": 80, "color": "#78350f"}
        ],
        "notes": {
            "top": ["Green Apple", "Sparkling Lemon"],
            "middle": ["Damask Rose", "Orris Root", "Lotus"],
            "base": ["Bourbon Vanilla", "Praline", "Tonka Bean", "Musk"]
        },
        "seasons": {"fall": 42, "winter": 38, "spring": 16, "summer": 4}, "day_night": {"day": 45, "night": 55},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Crisp green apple opening that melts into warm roasted praline vanilla", "Incredible luxury bottle and atomiser", "Compliment magnet"],
            "cons": ["Gourmand sweet style"],
            "community_verdict": "The crown jewel of the Rasasi Qasamat series.",
            "top_reviewer_quotes": ["Green apple dipped in decadent warm praline and vanilla cream."]
        },
        "flankers": ["rasasi-qasamat-bareeq", "rasasi-qasamat-rasana"], "dna_twins": ["lattafa-khamrah", "afnan-historic-sahara"]
    },

    # =========================================================================
    # LATTAFA LEGACY VAULT (2012 - 2021)
    # =========================================================================
    {
        "id": "lattafa-raghba",
        "name": "Raghba",
        "brand": "Lattafa",
        "collection": "Heritage Classics (2012)",
        "rating_value": 4.31, "rating_count": 8900, "gender": "Unisex", "release_year": 2012,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Sweet Caramelized Sugar, Oud & Warm Incense", "dna_type": "Amber Vanilla Oud", "similarity_percentage": 93, "price_usd": 18,
        "accords": [
            {"name": "Vanilla", "score": 100, "color": "#f59e0b"},
            {"name": "Sweet", "score": 95, "color": "#ec4899"},
            {"name": "Oud", "score": 82, "color": "#78350f"},
            {"name": "Incense / Smoky", "score": 80, "color": "#475569"},
            {"name": "Amber", "score": 75, "color": "#d97706"}
        ],
        "notes": {
            "top": ["Sugar", "Vanilla"],
            "middle": ["Agarwood (Oud)", "Incense"],
            "base": ["Sandalwood", "Amber", "Musk"]
        },
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"day": 20, "night": 80},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {
            "pros": ["The fragrance that put Lattafa on the international map in 2012", "Caramelized burnt sugar with soft comforting oud and smoky incense", "Legendary beast mode sillage under $20"],
            "cons": ["Extremely sweet and heavy, unsuitable for warm weather"],
            "community_verdict": "An all-time legend in Middle Eastern perfumery.",
            "top_reviewer_quotes": ["Burnt caramel, sweet vanilla, and smoky woods. An absolute classic."]
        },
        "flankers": ["lattafa-raghba-wood-intense"], "dna_twins": ["lattafa-ameer-al-oudh-intense-oud"]
    },
    {
        "id": "lattafa-ameer-al-oudh-intense-oud",
        "name": "Ameer Al Oudh Intense Oud",
        "brand": "Lattafa",
        "collection": "Ameer Al Oudh",
        "rating_value": 4.45, "rating_count": 9200, "gender": "Unisex", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Maison Margiela By the Fireplace", "dna_type": "Warm Spicy Woody Vanilla", "similarity_percentage": 94, "price_usd": 22,
        "accords": [
            {"name": "Vanilla", "score": 100, "color": "#f59e0b"},
            {"name": "Woody", "score": 92, "color": "#854d0e"},
            {"name": "Sweet", "score": 88, "color": "#ec4899"},
            {"name": "Warm Spicy", "score": 80, "color": "#c2410c"}
        ],
        "notes": {
            "top": ["Woody Notes", "Agarwood (Oud)"],
            "middle": ["Vanilla", "Sugar"],
            "base": ["Oud", "Sandalwood", "Herbal Notes"]
        },
        "seasons": {"winter": 52, "fall": 38, "spring": 8, "summer": 2}, "day_night": {"day": 25, "night": 75},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {
            "pros": ["Cozy roasted chestnuts, fireplace smoke, and sweet vanilla", "Unreal 10+ hour winter longevity", "Better and smoother than By the Fireplace for $22"],
            "cons": ["Very heavy in high heat"],
            "community_verdict": "One of the greatest winter fragrances of all time.",
            "top_reviewer_quotes": ["Warm fireplace wood smoke and toasted vanilla sugar."]
        },
        "flankers": ["lattafa-raghba"], "dna_twins": ["lattafa-raghba", "lattafa-khamrah-qahwa"]
    },
    {
        "id": "lattafa-velvet-oud",
        "name": "Velvet Oud",
        "brand": "Lattafa",
        "collection": "Classic Velvet Line",
        "rating_value": 4.38, "rating_count": 6400, "gender": "Unisex", "release_year": 2018,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Tom Ford Tuscan & Ombré Leather", "dna_type": "Leather Woody Smoky Amber", "similarity_percentage": 93, "price_usd": 24,
        "accords": [
            {"name": "Leather", "score": 100, "color": "#78350f"},
            {"name": "Oud", "score": 85, "color": "#581c87"},
            {"name": "Warm Spicy", "score": 80, "color": "#c2410c"},
            {"name": "Smoky", "score": 75, "color": "#475569"}
        ],
        "notes": {
            "top": ["Cardamom", "Bergamot"],
            "middle": ["Violet Leaf", "Patchouli"],
            "base": ["Suede Leather", "Amber", "Oakmoss", "Oud"]
        },
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 30, "night": 70},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Rich velvety black suede leather with aromatic violet leaf", "Luxury executive presence in velvet presentation box"],
            "cons": ["Bold leather profile"],
            "community_verdict": "A legendary leather clone from Lattafa.",
            "top_reviewer_quotes": ["Supple leather jacket and aromatic spices. Sophisticated."]
        },
        "flankers": ["lattafa-qaaed"], "dna_twins": ["afnan-rare-carbon", "rasasi-la-yuqawam-pour-homme"]
    },
    {
        "id": "lattafa-qaaed",
        "name": "Qaa'ed",
        "brand": "Lattafa",
        "collection": "Qaa'ed Series",
        "rating_value": 4.34, "rating_count": 5800, "gender": "Unisex", "release_year": 2018,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Spiced Cardamom, Cinnamon, Leather & Vanilla", "dna_type": "Warm Spicy Amber Leather", "similarity_percentage": 92, "price_usd": 22,
        "accords": [
            {"name": "Warm Spicy", "score": 100, "color": "#c2410c"},
            {"name": "Cinnamon", "score": 92, "color": "#b45309"},
            {"name": "Vanilla", "score": 85, "color": "#f59e0b"},
            {"name": "Leather", "score": 78, "color": "#78350f"}
        ],
        "notes": {
            "top": ["Cardamom", "Cinnamon", "Bergamot"],
            "middle": ["Carnation", "Sandalwood", "Cedarwood"],
            "base": ["Vanilla", "Leather", "Agarwood (Oud)"]
        },
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 35, "night": 65},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Warm chai spice cardamom, sweet cinnamon, and smooth leather", "Iconic gold leather-bound cylinder bottle"],
            "cons": ["Spicy opening"],
            "community_verdict": "One of the best fall spicy fragrances ever made.",
            "top_reviewer_quotes": ["Warm cinnamon and cardamom with sweet leather. Cozy perfection."]
        },
        "flankers": ["lattafa-qaaed-al-shabaab"], "dna_twins": ["afnan-historic-sahara", "lattafa-liam-grey"]
    },
    {
        "id": "lattafa-ana-abiyedh-rouge",
        "name": "Ana Abiyedh Rouge",
        "brand": "Lattafa",
        "collection": "Ana Abiyedh Series",
        "rating_value": 4.36, "rating_count": 6700, "gender": "Unisex", "release_year": 2016,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Maison Francis Kurkdjian Baccarat Rouge 540", "dna_type": "Amber Woody Sweet", "similarity_percentage": 94, "price_usd": 20,
        "accords": [
            {"name": "Amber", "score": 100, "color": "#d97706"},
            {"name": "Almond / Nutty", "score": 90, "color": "#a16207"},
            {"name": "Warm Spicy", "score": 84, "color": "#c2410c"},
            {"name": "Cotton Candy / Sweet", "score": 80, "color": "#ec4899"}
        ],
        "notes": {
            "top": ["Saffron", "Bitter Almond", "Bergamot"],
            "middle": ["Cedarwood", "Jasmine"],
            "base": ["Ambergris", "Musk", "Woody Notes"]
        },
        "seasons": {"fall": 35, "winter": 35, "spring": 20, "summer": 10}, "day_night": {"day": 45, "night": 55},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Burnt sugar, bitter almond, and airy saffron ambergris", "Superb BR540 Extrait alternative for $20"],
            "cons": ["Anosmia (nose-blindness) to ambergris possible"],
            "community_verdict": "One of the most famous BR540 budget alternatives.",
            "top_reviewer_quotes": ["Airy cotton candy, warm almond, and crystalline ambergris."]
        },
        "flankers": ["lattafa-ana-abiyedh"], "dna_twins": ["armaf-club-de-nuit-untold", "titan-skinn-nude"]
    },
    {
        "id": "lattafa-najdia",
        "name": "Najdia",
        "brand": "Lattafa",
        "collection": "Najdia Line",
        "rating_value": 4.30, "rating_count": 7800, "gender": "Men", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Paco Rabanne Invictus Aqua & Rasasi Hawas", "dna_type": "Aquatic Aromatic Fresh Spicy", "similarity_percentage": 92, "price_usd": 18,
        "accords": [
            {"name": "Marine / Aquatic", "score": 100, "color": "#0ea5e9"},
            {"name": "Citrus", "score": 90, "color": "#eab308"},
            {"name": "Fresh Spicy", "score": 82, "color": "#059669"},
            {"name": "Sweet", "score": 75, "color": "#ec4899"}
        ],
        "notes": {
            "top": ["Lemon", "Apple", "Cinnamon", "Bergamot", "Lemongrass"],
            "middle": ["Watery Notes", "Lavender", "Cardamom", "Rosemary"],
            "base": ["Amber", "Musk", "Sandalwood", "Cedarwood", "Tobacco"]
        },
        "seasons": {"summer": 62, "spring": 26, "fall": 10, "winter": 2}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Budget twin to Hawas and Invictus Aqua", "Crisp aquatic apple with warm cinnamon and sweet amber", "Incredible performance under $20"],
            "cons": ["Sweet bubblegum aquatic DNA"],
            "community_verdict": "The ultimate $18 summer daily driver.",
            "top_reviewer_quotes": ["Fresh marine apple and sweet spice. High compliment factor."]
        },
        "flankers": ["lattafa-najdia-tribute"], "dna_twins": ["rasasi-hawas-for-men", "rayhaan-pacific"]
    },

    # =========================================================================
    # ARMAF LEGACY VAULT (2014 - 2020)
    # =========================================================================
    {
        "id": "armaf-tag-him",
        "name": "Tag-Him Pour Homme",
        "brand": "Armaf",
        "collection": "Tag Series (2014)",
        "rating_value": 4.22, "rating_count": 4100, "gender": "Men", "release_year": 2014,
        "concentration": "Eau de Toilette", "primary_season": "Spring",
        "dna_inspiration": "Chanel Bleu de Chanel Eau de Toilette", "dna_type": "Woody Spicy Citrus Fresh", "similarity_percentage": 92, "price_usd": 25,
        "accords": [
            {"name": "Citrus", "score": 100, "color": "#eab308"},
            {"name": "Fresh Spicy", "score": 88, "color": "#059669"},
            {"name": "Aromatic", "score": 82, "color": "#16a34a"},
            {"name": "Woody", "score": 78, "color": "#854d0e"}
        ],
        "notes": {
            "top": ["Grapefruit", "Lemon", "Pink Pepper", "Bergamot"],
            "middle": ["Ginger", "Mint", "Nutmeg"],
            "base": ["Cedarwood", "Vetiver", "Sandalwood", "Patchouli"]
        },
        "seasons": {"spring": 40, "summer": 35, "fall": 20, "winter": 5}, "day_night": {"day": 70, "night": 30},
        "longevity": "Moderate (7 hrs)", "sillage": "Moderate",
        "review_summary": {
            "pros": ["Early classic clone of Bleu de Chanel EDT", "Zesty grapefruit and cool mint with peppery ginger", "Versatile all-occasion signature"],
            "cons": ["Moderate longevity compared to modern CDN lines"],
            "community_verdict": "One of Armaf's earliest hits before Club de Nuit exploded.",
            "top_reviewer_quotes": ["Grapefruit, mint, ginger, and woody cedar."]
        },
        "flankers": ["armaf-tag-her"], "dna_twins": ["armaf-club-de-nuit-iconic", "titan-skinn-raw"]
    },
    {
        "id": "armaf-futura-la-homme",
        "name": "Futura La Homme",
        "brand": "Armaf",
        "collection": "Futura Collection",
        "rating_value": 4.38, "rating_count": 3100, "gender": "Men", "release_year": 2015,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Dior Homme (2005) & Valentino Uomo", "dna_type": "Woody Floral Powdery Iris", "similarity_percentage": 93, "price_usd": 28,
        "accords": [
            {"name": "Powdery", "score": 100, "color": "#cbd5e1"},
            {"name": "Iris / Floral", "score": 92, "color": "#8b5cf6"},
            {"name": "Coffee / Roasted", "score": 85, "color": "#78350f"},
            {"name": "Woody", "score": 78, "color": "#854d0e"}
        ],
        "notes": {
            "top": ["Bergamot", "Lavender", "Sage"],
            "middle": ["Iris", "Coffee", "Amber"],
            "base": ["Leather", "Cedarwood", "Vetiver"]
        },
        "seasons": {"fall": 45, "winter": 35, "spring": 18, "summer": 2}, "day_night": {"day": 35, "night": 65},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {
            "pros": ["Glorious powdery lipstick iris with warm roasted coffee and leather", "Spot on Dior Homme 2005 vibe for under $30", "Gentlemanly elegance"],
            "cons": ["Iris powdery lipstick style is polarizing to some men"],
            "community_verdict": "Cult classic among iris fragrance lovers.",
            "top_reviewer_quotes": ["Powdery iris, warm coffee, and supple leather."]
        },
        "flankers": ["armaf-craze"], "dna_twins": ["lattafa-liam-grey"]
    },
    {
        "id": "armaf-bucephalus-no-ix",
        "name": "Bucephalus No. IX",
        "brand": "Armaf",
        "collection": "Bucephalus Luxury Line",
        "rating_value": 4.42, "rating_count": 2200, "gender": "Men", "release_year": 2019,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Luxury Citrus Woody Amber & Black Pepper", "dna_type": "Citrus Woody Chypre", "similarity_percentage": 93, "price_usd": 45,
        "accords": [
            {"name": "Citrus", "score": 100, "color": "#eab308"},
            {"name": "Woody", "score": 88, "color": "#854d0e"},
            {"name": "Fresh Spicy", "score": 82, "color": "#059669"},
            {"name": "Amber", "score": 78, "color": "#d97706"}
        ],
        "notes": {
            "top": ["Mandarin Orange", "Bergamot", "Grapefruit"],
            "middle": ["Black Pepper", "Violet Leaf"],
            "base": ["Patchouli", "Cedarwood", "Ambergris", "Oakmoss"]
        },
        "seasons": {"spring": 35, "summer": 30, "fall": 25, "winter": 10}, "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Heavy luxury horse-head metal flacon", "Crisp zesty mandarin with peppery violet leaf and ambergris"],
            "cons": ["Heavy bottle for travel"],
            "community_verdict": "Armaf's premium boutique executive line.",
            "top_reviewer_quotes": ["Mandarin, sharp black pepper, and rich ambergris."]
        },
        "flankers": ["armaf-bucephalus-no-x", "armaf-bucephalus-no-xi"], "dna_twins": ["afnan-supremacy-silver"]
    },

    # =========================================================================
    # AFNAN LEGACY VAULT
    # =========================================================================
    {
        "id": "afnan-supremacy-incense",
        "name": "Supremacy Incense",
        "brand": "Afnan",
        "collection": "Supremacy Series",
        "rating_value": 4.40, "rating_count": 3100, "gender": "Men", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Amouage Interlude Man (The Blue Beast)", "dna_type": "Amber Woody Smoky Herbal", "similarity_percentage": 94, "price_usd": 42,
        "accords": [
            {"name": "Incense / Smoky", "score": 100, "color": "#475569"},
            {"name": "Warm Spicy", "score": 92, "color": "#c2410c"},
            {"name": "Amber", "score": 88, "color": "#d97706"},
            {"name": "Leather", "score": 80, "color": "#78350f"},
            {"name": "Oud", "score": 75, "color": "#581c87"}
        ],
        "notes": {
            "top": ["Oregano", "Bergamot", "Allspice"],
            "middle": ["Opoponax", "Amber", "Frankincense", "Labdanum"],
            "base": ["Smoke", "Leather", "Oud", "Patchouli", "Sandalwood"]
        },
        "seasons": {"winter": 60, "fall": 32, "spring": 6, "summer": 2}, "day_night": {"day": 15, "night": 85},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Nuclear",
        "review_summary": {
            "pros": ["Nuclear 12+ hour clone of Amouage Interlude Man", "Pungent smoky oregano, holy frankincense resin, and dark leather", "Massive projection for cold winter nights"],
            "cons": ["Extremely potent and smoky, spray with caution"],
            "community_verdict": "The undisputed Blue Beast clone.",
            "top_reviewer_quotes": ["Oregano, heavy resinous incense, and dark smoky leather."]
        },
        "flankers": ["afnan-supremacy-not-only-intense"], "dna_twins": ["lattafa-maahir-black-edition"]
    },
    {
        "id": "afnan-souvenir-floral-bouquet",
        "name": "Souvenir Floral Bouquet",
        "brand": "Afnan",
        "collection": "Souvenir Collection",
        "rating_value": 4.42, "rating_count": 3400, "gender": "Women", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Parfums de Marly Delina", "dna_type": "Floral Fruity Rose", "similarity_percentage": 95, "price_usd": 38,
        "accords": [
            {"name": "Rose", "score": 100, "color": "#f43f5e"},
            {"name": "Fruity", "score": 92, "color": "#f97316"},
            {"name": "Floral", "score": 85, "color": "#fbcfe8"},
            {"name": "Musk", "score": 78, "color": "#cbd5e1"}
        ],
        "notes": {
            "top": ["Litchi", "Rhubarb", "Bergamot"],
            "middle": ["Turkish Rose", "Peony", "Lily-of-the-Valley", "Vanilla"],
            "base": ["White Musk", "Cashmeran", "Amber"]
        },
        "seasons": {"spring": 55, "summer": 25, "fall": 15, "winter": 5}, "day_night": {"day": 75, "night": 25},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Phenomenal 95% match to Parfums de Marly Delina", "Tart rhubarb and juicy litchi opening into royal Turkish rose", "Snow globe dome luxury packaging"],
            "cons": ["Rhubarb tartness requires 10 mins"],
            "community_verdict": "Widely rated one of the greatest Delina alternatives in perfumery.",
            "top_reviewer_quotes": ["Juicy litchi, tart rhubarb, and royal Turkish rose petals."]
        },
        "flankers": ["afnan-souvenir-desert-rose"], "dna_twins": ["lattafa-badee-al-oud-amethyst"]
    },

    # =========================================================================
    # MYKONOS GOURMANDS & TITAN SKINN TALES
    # =========================================================================
    {
        "id": "mykonos-sansa",
        "name": "Sansa",
        "brand": "Mykonos",
        "collection": "Milky Gourmet",
        "rating_value": 4.46, "rating_count": 1800, "gender": "Women", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Sweet Almond Milk & Velvety Cashmere Vanilla", "dna_type": "Lactonic Gourmand Amber", "similarity_percentage": 94, "price_usd": 28,
        "accords": [
            {"name": "Lactonic / Milky", "score": 100, "color": "#fed7aa"},
            {"name": "Vanilla", "score": 92, "color": "#f59e0b"},
            {"name": "Sweet", "score": 88, "color": "#ec4899"},
            {"name": "Nutty", "score": 80, "color": "#a16207"}
        ],
        "notes": {
            "top": ["Warm Milk", "Candied Almond"],
            "middle": ["Tonka Bean", "Cashmeran"],
            "base": ["Bourbon Vanilla", "White Musk"]
        },
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 40, "night": 60},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {
            "pros": ["Warm, comforting almond milk with fluffy cashmere vanilla", "Pure cozy sweater-weather indulgence"],
            "cons": ["Milky lactonic profile strictly for gourmand lovers"],
            "community_verdict": "One of Mykonos' most comforting dessert creations.",
            "top_reviewer_quotes": ["Warm almond milk, toasted tonka, and silky vanilla fluff."]
        },
        "flankers": ["mykonos-pistachio-milk"], "dna_twins": ["mykonos-pistachio-milk", "lattafa-eclaire"]
    },
    {
        "id": "titan-skinn-tales-oslo",
        "name": "Tales Oslo",
        "brand": "Titan Skinn",
        "collection": "Tales Collection",
        "rating_value": 4.25, "rating_count": 1200, "gender": "Men", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Frozen Crisp Apple, Cypress & Nordic Pine", "dna_type": "Aromatic Woody Fresh", "similarity_percentage": 91, "price_usd": 28,
        "accords": [
            {"name": "Woody", "score": 100, "color": "#854d0e"},
            {"name": "Aromatic", "score": 90, "color": "#16a34a"},
            {"name": "Fruity", "score": 82, "color": "#f97316"},
            {"name": "Fresh Spicy", "score": 75, "color": "#059669"}
        ],
        "notes": {
            "top": ["Crisp Apple", "Lemon Zest", "Black Pepper"],
            "middle": ["Cypress", "Nordic Pine", "Lavender"],
            "base": ["Cedarwood", "Patchouli", "Musk"]
        },
        "seasons": {"spring": 42, "summer": 28, "fall": 22, "winter": 8}, "day_night": {"day": 70, "night": 30},
        "longevity": "Moderate to Long (7-8 hrs)", "sillage": "Moderate",
        "review_summary": {
            "pros": ["Invigorating crisp green apple with fresh pine needles", "Clean Scandinavian aesthetic"],
            "cons": ["Moderate projection"],
            "community_verdict": "Very refreshing Nordic forest daily wear.",
            "top_reviewer_quotes": ["Chilly mountain air, crisp green apple, and clean cedar pine."]
        },
        "flankers": ["titan-skinn-tales-rio"], "dna_twins": ["titan-skinn-verge"]
    }
]

with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json', 'r') as f:
    existing = json.load(f)

existing_ids = {item['id'] for item in existing}
added_count = 0

for p in legacy_perfumes:
    if p['id'] not in existing_ids:
        existing.append(p)
        existing_ids.add(p['id'])
        added_count += 1
    else:
        # Update existing
        for i, item in enumerate(existing):
            if item['id'] == p['id']:
                existing[i] = p

with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json', 'w') as f:
    json.dump(existing, f, indent=2)

print(f"Successfully added/updated {added_count} classic legacy/vintage vault fragrances!")
print(f"Total fragrances now in database: {len(existing)}")
