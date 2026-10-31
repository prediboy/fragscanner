import json

phase1_fragrances = [
    # =========================================================================
    # RAYHAAN COMPLETE EXPANSION (INCLUDING NOCTURNO & NOCTURNO ELIXIR)
    # =========================================================================
    {
        "id": "rayhaan-nocturno",
        "name": "Nocturno",
        "brand": "Rayhaan",
        "collection": "Signature Line",
        "rating_value": 4.42, "rating_count": 2800, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Dior Sauvage Eau de Parfum", "dna_type": "Fresh Spicy Aromatic Ambroxan", "similarity_percentage": 94, "price_usd": 35,
        "accords": [
            {"name": "Fresh Spicy", "score": 100, "color": "#059669"},
            {"name": "Citrus", "score": 90, "color": "#eab308"},
            {"name": "Aromatic", "score": 85, "color": "#16a34a"},
            {"name": "Amberwood", "score": 82, "color": "#d97706"},
            {"name": "Lavender", "score": 78, "color": "#8b5cf6"},
            {"name": "Woody", "score": 75, "color": "#854d0e"}
        ],
        "notes": {
            "top": ["Calabrian Bergamot", "Black Pepper", "Cooling Mint"],
            "middle": ["French Lavender", "Pink Pepper", "Geranium"],
            "base": ["Amberwood", "Cedarwood", "Haitian Vetiver", "Ambroxan"]
        },
        "seasons": {"spring": 35, "summer": 30, "fall": 25, "winter": 10}, "day_night": {"day": 60, "night": 40},
        "longevity": "Beast Mode (9-10 hrs)", "sillage": "Strong to Enormous",
        "review_summary": {
            "pros": [
                "Exceptional Dior Sauvage EDP alternative with zero synthetic screech",
                "Invigorating zesty bergamot, black pepper, and cooling mint opening",
                "Powerful magnetic amberwood and clean lavender sillage trail"
            ],
            "cons": ["Classic modern blue DNA"],
            "community_verdict": "One of Rayhaan's greatest crowd-pleasing daily drivers.",
            "top_reviewer_quotes": [
                "Bergamot, black pepper, and mint over amberwood. Projection is massive.",
                "Smooth as Sauvage EDP, but at a third of the price."
            ]
        },
        "flankers": ["rayhaan-nocturno-elixir", "rayhaan-pacific"],
        "dna_twins": ["afnan-modest-une", "armaf-ventana", "titan-skinn-raw"]
    },
    {
        "id": "rayhaan-nocturno-elixir",
        "name": "Nocturno Elixir",
        "brand": "Rayhaan",
        "collection": "Elixir Series",
        "rating_value": 4.48, "rating_count": 2100, "gender": "Men", "release_year": 2024,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Dior Sauvage Elixir & Dark Smoky Woods", "dna_type": "Warm Spicy Smoky Woody", "similarity_percentage": 93, "price_usd": 42,
        "accords": [
            {"name": "Warm Spicy", "score": 100, "color": "#c2410c"},
            {"name": "Incense / Smoky", "score": 90, "color": "#475569"},
            {"name": "Woody", "score": 85, "color": "#854d0e"},
            {"name": "Lavender", "score": 80, "color": "#8b5cf6"},
            {"name": "Amber", "score": 75, "color": "#d97706"}
        ],
        "notes": {
            "top": ["Nutmeg", "Cinnamon", "Cardamom", "Grapefruit"],
            "middle": ["French Lavender", "Dark Incense", "Licorice"],
            "base": ["Haitian Vetiver", "Smoky Cedarwood", "Amber", "Patchouli"]
        },
        "seasons": {"fall": 45, "winter": 45, "spring": 8, "summer": 2}, "day_night": {"day": 20, "night": 80},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Nuclear",
        "review_summary": {
            "pros": ["Nuclear spiced evening powerhouse", "Dark smoky incense, rich cinnamon cardamom, and lavender", "Unmatched autumn/winter performance"],
            "cons": ["Very potent, not for high summer heat"],
            "community_verdict": "Dark, mysterious, high-impact evening elixir.",
            "top_reviewer_quotes": ["Cardamom, dark incense smoke, and rich licorice lavender."]
        },
        "flankers": ["rayhaan-nocturno"],
        "dna_twins": ["lattafa-asad", "armaf-club-de-nuit-precieux-1"]
    },
    {
        "id": "rayhaan-aquatica",
        "name": "Aquatica",
        "brand": "Rayhaan",
        "collection": "Signature Line",
        "rating_value": 4.39, "rating_count": 1850, "gender": "Unisex", "release_year": 2025,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Creed Virgin Island Water", "dna_type": "Tropical Coconut Lime Rum", "similarity_percentage": 94, "price_usd": 38,
        "accords": [
            {"name": "Citrus", "score": 100, "color": "#eab308"},
            {"name": "Coconut", "score": 92, "color": "#fef08a"},
            {"name": "Sweet", "score": 85, "color": "#ec4899"},
            {"name": "Marine / Aquatic", "score": 80, "color": "#0ea5e9"}
        ],
        "notes": {
            "top": ["White Rum", "Lime", "Green Mandarin", "Bergamot"],
            "middle": ["Coconut Nectar", "Ginger", "Ylang-Ylang", "Hibiscus"],
            "base": ["Sugar Cane", "White Musk", "Solar Driftwood"]
        },
        "seasons": {"summer": 75, "spring": 20, "fall": 4, "winter": 1}, "day_night": {"day": 85, "night": 15},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Authentic Caribbean tropical lime, creamy coconut nectar, and sugar cane rum", "Outlasts Creed Virgin Island Water significantly", "Instant vacation mood"],
            "cons": ["Sweet tropical profile"],
            "community_verdict": "The best Virgin Island Water clone on the market.",
            "top_reviewer_quotes": ["Zesty lime, coconut water, and white rum. Pure tropical paradise."]
        },
        "flankers": ["rayhaan-pacific", "rayhaan-ocean"],
        "dna_twins": ["rayhaan-pacific-aloha", "titan-skinn-tales-ibiza"]
    },
    {
        "id": "rayhaan-italia",
        "name": "Italia",
        "brand": "Rayhaan",
        "collection": "Privée Collection",
        "rating_value": 4.46, "rating_count": 2200, "gender": "Unisex", "release_year": 2025,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Xerjoff Naxos", "dna_type": "Sweet Honey Tobacco Lavender Citrus", "similarity_percentage": 95, "price_usd": 42,
        "accords": [
            {"name": "Honey", "score": 100, "color": "#f59e0b"},
            {"name": "Tobacco", "score": 90, "color": "#78350f"},
            {"name": "Citrus", "score": 85, "color": "#eab308"},
            {"name": "Lavender", "score": 80, "color": "#8b5cf6"},
            {"name": "Warm Spicy", "score": 75, "color": "#c2410c"}
        ],
        "notes": {
            "top": ["Bergamot", "Lemon", "Lavender"],
            "middle": ["Honey", "Cinnamon", "Cashmeran", "Jasmine"],
            "base": ["Tobacco Leaf", "Vanilla", "Tonka Bean"]
        },
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 30, "night": 70},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Gorgeous Xerjoff Naxos clone with golden honey and cured tobacco", "Sparkling Italian citrus opening that blends into sweet vanilla tobacco", "Incredible luxury packaging"],
            "cons": ["Rich sweet tobacco style"],
            "community_verdict": "Magnificent Naxos alternative.",
            "top_reviewer_quotes": ["Golden honey, crisp lavender, and smooth blonde tobacco."]
        },
        "flankers": ["rayhaan-elixir"],
        "dna_twins": ["afnan-historic-sahara", "lattafa-khamrah"]
    },
    {
        "id": "rayhaan-obsidian",
        "name": "Obsidian",
        "brand": "Rayhaan",
        "collection": "Privée Collection",
        "rating_value": 4.47, "rating_count": 1900, "gender": "Men", "release_year": 2024,
        "concentration": "Extrait de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Dior Homme Parfum", "dna_type": "Powdery Iris Dark Leather Rose", "similarity_percentage": 94, "price_usd": 44,
        "accords": [
            {"name": "Leather", "score": 100, "color": "#451a03"},
            {"name": "Iris / Floral", "score": 92, "color": "#8b5cf6"},
            {"name": "Powdery", "score": 85, "color": "#cbd5e1"},
            {"name": "Woody", "score": 80, "color": "#854d0e"},
            {"name": "Rose", "score": 75, "color": "#f43f5e"}
        ],
        "notes": {
            "top": ["Italian Orange", "Tuscan Iris"],
            "middle": ["Rose", "Leather"],
            "base": ["Agarwood (Oud)", "Sandalwood", "Cedarwood", "Amber"]
        },
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"day": 15, "night": 85},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Nuclear",
        "review_summary": {
            "pros": ["Near impossible-to-find Dior Homme Parfum DNA captured faithfully", "Dark buttery iris, opulent black leather, and woody amber", "Pure executive luxury"],
            "cons": ["Very heavy and dark, strictly for evening formal wear"],
            "community_verdict": "A holy grail alternative for Dior Homme Parfum lovers.",
            "top_reviewer_quotes": ["Buttery Tuscan iris, dark saddle leather, and warm sandalwood."]
        },
        "flankers": ["rayhaan-nocturno"],
        "dna_twins": ["armaf-futura-la-homme"]
    },
    {
        "id": "rayhaan-azul",
        "name": "Azul",
        "brand": "Rayhaan",
        "collection": "Signature Line",
        "rating_value": 4.35, "rating_count": 1400, "gender": "Men", "release_year": 2026,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Bvlgari Tygar & Bleu de Chanel Fresh Fusion", "dna_type": "Citrus Woody Ambroxan Blue", "similarity_percentage": 93, "price_usd": 34,
        "accords": [
            {"name": "Citrus", "score": 100, "color": "#eab308"},
            {"name": "Ambroxan", "score": 90, "color": "#64748b"},
            {"name": "Woody", "score": 82, "color": "#854d0e"},
            {"name": "Marine / Aquatic", "score": 75, "color": "#0ea5e9"}
        ],
        "notes": {
            "top": ["Grapefruit", "Mint", "Bergamot"],
            "middle": ["Ginger", "Aquatic Notes"],
            "base": ["Ambroxan", "Cedarwood", "Vetiver"]
        },
        "seasons": {"summer": 65, "spring": 25, "fall": 8, "winter": 2}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Explosive sparkling grapefruit with magnetic ambroxan", "High heat performance monster"],
            "cons": ["Modern blue style"],
            "community_verdict": "Very crisp, energetic blue citrus.",
            "top_reviewer_quotes": ["Bright sparkling grapefruit and clean mineral ambroxan."]
        },
        "flankers": ["rayhaan-pacific"],
        "dna_twins": ["afnan-turathi-blue", "armaf-club-de-nuit-iconic"]
    },

    # =========================================================================
    # TITAN SKINN FULL LINEUP EXPANSIONS
    # =========================================================================
    {
        "id": "titan-skinn-nox-pour-homme",
        "name": "Nox Pour Homme",
        "brand": "Titan Skinn",
        "collection": "Nox Collection",
        "rating_value": 4.36, "rating_count": 1900, "gender": "Men", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Smoky Cardamom, Saffron, Caramel & Dark Patchouli", "dna_type": "Oriental Woody Gourmand", "similarity_percentage": 93, "price_usd": 38,
        "accords": [
            {"name": "Warm Spicy", "score": 100, "color": "#c2410c"},
            {"name": "Caramel", "score": 88, "color": "#d97706"},
            {"name": "Woody", "score": 82, "color": "#854d0e"},
            {"name": "Patchouli", "score": 78, "color": "#15803d"}
        ],
        "notes": {
            "top": ["Cardamom", "Saffron", "Black Pepper"],
            "middle": ["Caramel", "Cinnamon", "Coffee"],
            "base": ["Dark Patchouli", "Vanilla", "Cedarwood", "Amber"]
        },
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 25, "night": 75},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Titan's most nocturnal, seductive release", "Rich caramel coffee with spiced saffron and dark patchouli", "Sensual evening and date-night projector"],
            "cons": ["Dark gourmand profile"],
            "community_verdict": "Titan's dark horse date-night champion.",
            "top_reviewer_quotes": ["Cardamom, dark caramel coffee, and warm saffron."]
        },
        "flankers": ["titan-skinn-nox-pour-femme"],
        "dna_twins": ["lattafa-khamrah-qahwa", "afnan-historic-sahara"]
    },
    {
        "id": "titan-skinn-nox-pour-femme",
        "name": "Nox Pour Femme",
        "brand": "Titan Skinn",
        "collection": "Nox Collection",
        "rating_value": 4.32, "rating_count": 1500, "gender": "Women", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Blackcurrant Nectar, Velvet Rose & Golden Amber Vanilla", "dna_type": "Floral Fruity Amber", "similarity_percentage": 92, "price_usd": 38,
        "accords": [
            {"name": "Fruity", "score": 100, "color": "#f97316"},
            {"name": "Vanilla", "score": 90, "color": "#f59e0b"},
            {"name": "Amber", "score": 84, "color": "#d97706"},
            {"name": "Rose", "score": 78, "color": "#f43f5e"}
        ],
        "notes": {
            "top": ["Blackcurrant", "Pink Pepper", "Bergamot"],
            "middle": ["Damask Rose", "Jasmine", "Caramel"],
            "base": ["Bourbon Vanilla", "Amber", "Patchouli", "Musk"]
        },
        "seasons": {"fall": 42, "winter": 38, "spring": 15, "summer": 5}, "day_night": {"day": 30, "night": 70},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Intoxicating dark berries with caramel vanilla and velvet rose", "Lush evening sophistication"],
            "cons": ["Sweet berry profile"],
            "community_verdict": "Deep, alluring feminine evening fragrance.",
            "top_reviewer_quotes": ["Blackcurrant nectar, caramel, and bourbon vanilla."]
        },
        "flankers": ["titan-skinn-nox-pour-homme"],
        "dna_twins": ["titan-skinn-celeste", "mykonos-dark-secret"]
    },
    {
        "id": "titan-skinn-velvet",
        "name": "Velvet",
        "brand": "Titan Skinn",
        "collection": "Classics",
        "rating_value": 4.26, "rating_count": 1300, "gender": "Women", "release_year": 2018,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Sweet Bergamot, Red Berry Floral & Golden Cashmeran", "dna_type": "Floral Oriental Woody", "similarity_percentage": 90, "price_usd": 34,
        "accords": [
            {"name": "White Floral", "score": 100, "color": "#fbcfe8"},
            {"name": "Sweet", "score": 88, "color": "#ec4899"},
            {"name": "Woody", "score": 80, "color": "#854d0e"}
        ],
        "notes": {
            "top": ["Bergamot", "Red Berries"],
            "middle": ["Tuberose", "Jasmine", "Orange Blossom"],
            "base": ["Cashmeran", "Vanilla", "Sandalwood"]
        },
        "seasons": {"fall": 40, "winter": 30, "spring": 22, "summer": 8}, "day_night": {"day": 45, "night": 55},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {
            "pros": ["Soft velvety white florals with warm cashmeran base", "Great boardroom to date night versatility"],
            "cons": ["Tuberose sweetness"],
            "community_verdict": "Very elegant, creamy floral oriental.",
            "top_reviewer_quotes": ["Red berries, orange blossom, and cozy cashmeran."]
        },
        "flankers": ["titan-skinn-nude"],
        "dna_twins": ["titan-skinn-nude"]
    },
    {
        "id": "titan-skinn-tales-rio",
        "name": "Tales Rio",
        "brand": "Titan Skinn",
        "collection": "Tales Collection",
        "rating_value": 4.27, "rating_count": 1150, "gender": "Men", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Tropical Passionfruit, Pink Pepper & Tonka Vanilla", "dna_type": "Tropical Fruity Aromatic", "similarity_percentage": 91, "price_usd": 28,
        "accords": [
            {"name": "Fruity", "score": 100, "color": "#f97316"},
            {"name": "Sweet", "score": 85, "color": "#ec4899"},
            {"name": "Vanilla", "score": 80, "color": "#f59e0b"},
            {"name": "Fresh Spicy", "score": 75, "color": "#059669"}
        ],
        "notes": {
            "top": ["Passionfruit", "Pink Pepper", "Cardamom"],
            "middle": ["Lavender", "Apple", "Nutmeg"],
            "base": ["Tonka Bean", "Vanilla", "Cedarwood"]
        },
        "seasons": {"summer": 55, "spring": 30, "fall": 12, "winter": 3}, "day_night": {"day": 70, "night": 30},
        "longevity": "Moderate to Long (7-8 hrs)", "sillage": "Moderate",
        "review_summary": {
            "pros": ["Carnival energy with tropical passionfruit and sweet tonka", "Youthful, fun summer compliment puller"],
            "cons": ["Sweet fruity opening"],
            "community_verdict": "Vibrant Brazilian tropical warmth.",
            "top_reviewer_quotes": ["Passionfruit, spicy pink pepper, and creamy tonka."]
        },
        "flankers": ["titan-skinn-tales-oslo"],
        "dna_twins": ["titan-skinn-raw"]
    },

    # =========================================================================
    # MYKONOS VIRAL GOURMAND EXPANSIONS
    # =========================================================================
    {
        "id": "mykonos-california-blue",
        "name": "California Blue",
        "brand": "Mykonos",
        "collection": "Ocean Breeze",
        "rating_value": 4.42, "rating_count": 2100, "gender": "Unisex", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Pacific Coast Pear, Lavender, Sea Salt & Driftwood", "dna_type": "Aquatic Fruity Salty Marine", "similarity_percentage": 93, "price_usd": 28,
        "accords": [
            {"name": "Marine / Aquatic", "score": 100, "color": "#0ea5e9"},
            {"name": "Salty", "score": 90, "color": "#38bdf8"},
            {"name": "Fruity", "score": 85, "color": "#f97316"},
            {"name": "Aromatic", "score": 78, "color": "#16a34a"}
        ],
        "notes": {
            "top": ["Sea Salt", "Crisp Pear", "Grapefruit"],
            "middle": ["French Lavender", "Aquatic Minerals", "Rosemary"],
            "base": ["Pacific Driftwood", "White Musk", "Cedarwood"]
        },
        "seasons": {"summer": 70, "spring": 22, "fall": 6, "winter": 2}, "day_night": {"day": 80, "night": 20},
        "longevity": "Beast Mode (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Pacific Coast Highway ocean breeze in a bottle", "Juicy pear with mineral sea salt and lavender", "Incredible performance for an aquatic Extrait"],
            "cons": ["Salty marine mineral notes"],
            "community_verdict": "One of Mykonos' most celebrated fresh creations.",
            "top_reviewer_quotes": ["Salty ocean spray, crisp pear, and warm coastal driftwood."]
        },
        "flankers": ["mykonos-aphrodite"],
        "dna_twins": ["rasasi-hawas-for-men", "rayhaan-pacific"]
    },
    {
        "id": "mykonos-inception",
        "name": "Inception",
        "brand": "Mykonos",
        "collection": "Spiced Tea",
        "rating_value": 4.45, "rating_count": 1950, "gender": "Unisex", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "BDK Gris Charnel & Spiced Black Tea Cardamom", "dna_type": "Woody Spicy Aromatic Tea", "similarity_percentage": 94, "price_usd": 30,
        "accords": [
            {"name": "Warm Spicy", "score": 100, "color": "#c2410c"},
            {"name": "Aromatic", "score": 90, "color": "#16a34a"},
            {"name": "Woody", "score": 85, "color": "#854d0e"},
            {"name": "Vanilla", "score": 78, "color": "#f59e0b"}
        ],
        "notes": {
            "top": ["Cardamom", "Cinnamon", "Bergamot"],
            "middle": ["Smoked Black Tea", "Fig", "Nutmeg"],
            "base": ["Sandalwood", "Bourbon Vanilla", "Tonka Bean", "Vetiver"]
        },
        "seasons": {"fall": 48, "winter": 36, "spring": 14, "summer": 2}, "day_night": {"day": 35, "night": 65},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Cozy steaming cup of spiced black chai tea and figs", "High comparison to niche luxury Gris Charnel", "10+ hour extrait projection"],
            "cons": ["Spicy tea vibe requires love for cardamom"],
            "community_verdict": "A cult classic among Asian niche enthusiasts.",
            "top_reviewer_quotes": ["Steamed black tea, cardamom spice, and creamy sandalwood."]
        },
        "flankers": ["mykonos-matcha-latte"],
        "dna_twins": ["lattafa-liam-grey"]
    },
    {
        "id": "mykonos-berry-caramel-pancake",
        "name": "Berry Caramel Pancake",
        "brand": "Mykonos",
        "collection": "Sweet Indulgence",
        "rating_value": 4.48, "rating_count": 2400, "gender": "Women", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Warm Buttery Pancakes, Maple Berry Syrup & Melted Caramel", "dna_type": "Gourmand Sweet Lactonic", "similarity_percentage": 96, "price_usd": 30,
        "accords": [
            {"name": "Sweet", "score": 100, "color": "#ec4899"},
            {"name": "Caramel", "score": 95, "color": "#d97706"},
            {"name": "Vanilla", "score": 90, "color": "#f59e0b"},
            {"name": "Fruity", "score": 85, "color": "#f97316"},
            {"name": "Lactonic / Milky", "score": 80, "color": "#fed7aa"}
        ],
        "notes": {
            "top": ["Berry Compote", "Maple Syrup", "Melted Butter"],
            "middle": ["Fluffy Pancake Accord", "Brown Sugar", "Caramel"],
            "base": ["Bourbon Vanilla", "Tonka Bean", "Whipped Cream"]
        },
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"day": 35, "night": 65},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {
            "pros": ["Photorealistic hot fluffy pancakes with warm berry maple syrup and caramel", "Incredible mouth-watering sillage", "TikTok viral sensation"],
            "cons": ["Pure dessert sweetness, exclusively for gourmand lovers"],
            "community_verdict": "One of the most viral realistic gourmands ever produced.",
            "top_reviewer_quotes": ["Smells like walking into a luxury bakery serving hot blueberry pancakes."]
        },
        "flankers": ["mykonos-caramel-fudge-cookie"],
        "dna_twins": ["lattafa-eclaire", "mykonos-caramel-fudge-cookie"]
    },
    {
        "id": "mykonos-slow-living",
        "name": "Slow Living",
        "brand": "Mykonos",
        "collection": "Clean Living",
        "rating_value": 4.38, "rating_count": 1600, "gender": "Unisex", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Amalfi Lemon, Calming Lavender & Clean White Tea Musk", "dna_type": "Clean Soapy Aromatic Citrus", "similarity_percentage": 94, "price_usd": 28,
        "accords": [
            {"name": "Clean / Soapy", "score": 100, "color": "#38bdf8"},
            {"name": "Citrus", "score": 90, "color": "#eab308"},
            {"name": "Aromatic", "score": 85, "color": "#16a34a"},
            {"name": "Musk", "score": 80, "color": "#cbd5e1"}
        ],
        "notes": {
            "top": ["Amalfi Lemon", "Mandarin", "Bergamot"],
            "middle": ["White Tea", "Lavender", "Freesia"],
            "base": ["White Musk", "Cedarwood", "Amber"]
        },
        "seasons": {"spring": 40, "summer": 35, "fall": 18, "winter": 7}, "day_night": {"day": 85, "night": 15},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate",
        "review_summary": {
            "pros": ["The ultimate peaceful, Zen clean hotel spa aroma", "Soothing white tea and Amalfi lemon with calming lavender", "Never offensive, perfect daily tranquility"],
            "cons": ["Quiet, intimate elegance"],
            "community_verdict": "Peaceful, meditative clean tea and lemon.",
            "top_reviewer_quotes": ["Pure peaceful luxury spa vibes. White tea, lemon, and soft musk."]
        },
        "flankers": ["mykonos-down-to-earth"],
        "dna_twins": ["rayhaan-noble", "lattafa-khalis-musk"]
    }
]

with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json', 'r') as f:
    existing = json.load(f)

existing_ids = {item['id'] for item in existing}
added_count = 0

for p in phase1_fragrances:
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

print(f"Successfully added/updated {added_count} Phase 1 boutique fragrances (including Rayhaan Nocturno)!")
print(f"Total fragrances now in database: {len(existing)}")
