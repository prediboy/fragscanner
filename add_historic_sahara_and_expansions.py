import json

new_perfumes = [
    # ==================== AFNAN (INCLUDING HISTORIC SAHARA) ====================
    {
        "id": "afnan-historic-sahara",
        "name": "Historic Sahara",
        "brand": "Afnan",
        "collection": "Historic Collection",
        "rating_value": 4.48, "rating_count": 1850, "gender": "Unisex", "release_year": 2025,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Parfums de Marly Althaïr", "dna_type": "Warm Spicy Bourbon Vanilla", "similarity_percentage": 94, "price_usd": 46,
        "accords": [
            {"name": "Warm Spicy", "score": 100, "color": "#c2410c"},
            {"name": "Vanilla", "score": 95, "color": "#f59e0b"},
            {"name": "Sweet", "score": 88, "color": "#ec4899"},
            {"name": "Cinnamon", "score": 85, "color": "#b45309"},
            {"name": "Amber", "score": 78, "color": "#d97706"},
            {"name": "Woody", "score": 72, "color": "#854d0e"},
            {"name": "Nutty", "score": 65, "color": "#a16207"}
        ],
        "notes": {
            "top": ["Cardamom", "Cinnamon", "Bergamot"],
            "middle": ["Bourbon Vanilla", "Sugar", "Elemi"],
            "base": ["Praline", "Candied Almond", "Tonka Bean", "Guaiac Wood", "Ambroxan", "White Musk"]
        },
        "seasons": {"fall": 45, "winter": 45, "spring": 8, "summer": 2},
        "day_night": {"day": 25, "night": 75},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {
            "pros": [
                "Remarkable 94% clone of Parfums de Marly Althaïr at an accessible price",
                "Opulent warm cinnamon and cardamom opening leading to velvety bourbon vanilla praline",
                "Beast mode projection and 10+ hour winter longevity"
            ],
            "cons": ["Very sweet and potent, strictly for autumn/winter or air-conditioned evenings"],
            "community_verdict": "One of Afnan's finest 2024/2025 releases alongside 9PM Rebel and Supremacy Collector's Edition.",
            "top_reviewer_quotes": [
                "Cardamom, fiery cinnamon, and ultra-creamy bourbon vanilla. Incredible Althaïr DNA.",
                "Praline and almond in the drydown make this addictive."
            ]
        },
        "flankers": ["afnan-historic-doria", "afnan-historic-olmeda"],
        "dna_twins": ["lattafa-khamrah-qahwa", "afnan-9-pm"]
    },
    {
        "id": "afnan-rare-carbon",
        "name": "Rare Carbon",
        "brand": "Afnan",
        "collection": "Rare Collection",
        "rating_value": 4.41, "rating_count": 3200, "gender": "Men", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Tom Ford Ombré Leather", "dna_type": "Leather Floral Amber", "similarity_percentage": 93, "price_usd": 38,
        "accords": [
            {"name": "Leather", "score": 100, "color": "#78350f"},
            {"name": "Warm Spicy", "score": 86, "color": "#c2410c"},
            {"name": "Violet / Floral", "score": 80, "color": "#8b5cf6"},
            {"name": "Amber", "score": 75, "color": "#d97706"},
            {"name": "Smoky", "score": 70, "color": "#475569"}
        ],
        "notes": {
            "top": ["Leather", "Violet Leaf", "Cinnamon", "Nutmeg"],
            "middle": ["Violet", "Rose", "Cedarwood", "Oud"],
            "base": ["Leather", "Amber", "Sandalwood", "Vetiver"]
        },
        "seasons": {"fall": 42, "winter": 40, "spring": 15, "summer": 3},
        "day_night": {"day": 30, "night": 70},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Smooth, supple leather with violet leaf sweetness", "High similarity to TF Ombré Leather without the harshness"],
            "cons": ["Not for hot humid summer days"],
            "community_verdict": "Widely regarded as the best Ombré Leather alternative on the market.",
            "top_reviewer_quotes": ["Velvety clean leather jacket aroma with elegant floral accents."]
        },
        "flankers": ["afnan-rare-reef"],
        "dna_twins": ["rasasi-la-yuqawam-pour-homme"]
    },
    {
        "id": "afnan-rare-reef",
        "name": "Rare Reef",
        "brand": "Afnan",
        "collection": "Rare Collection",
        "rating_value": 4.25, "rating_count": 940, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Kenzo Homme Marine / Ocean Breeze", "dna_type": "Aquatic Marine Salty", "similarity_percentage": 90, "price_usd": 38,
        "accords": [
            {"name": "Marine / Aquatic", "score": 100, "color": "#0ea5e9"},
            {"name": "Salty", "score": 85, "color": "#38bdf8"},
            {"name": "Woody", "score": 78, "color": "#854d0e"},
            {"name": "Citrus", "score": 70, "color": "#eab308"}
        ],
        "notes": {
            "top": ["Sea Notes", "Bergamot", "Aquatic Accord"],
            "middle": ["Ylang-Ylang", "Marine Salt", "Solar Notes"],
            "base": ["Sandalwood", "Cedarwood", "Musk"]
        },
        "seasons": {"summer": 65, "spring": 25, "fall": 8, "winter": 2},
        "day_night": {"day": 80, "night": 20},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {
            "pros": ["Invigorating ocean breeze and salty minerals", "Exceptional summer high-heat performance"],
            "cons": ["Salty marine can be mineral-heavy"],
            "community_verdict": "Superb aquatic release from Afnan.",
            "top_reviewer_quotes": ["Pure ocean surf and warm driftwood."]
        },
        "flankers": ["afnan-rare-carbon"],
        "dna_twins": ["rasasi-hawas-for-men"]
    },
    {
        "id": "afnan-turathi-electric",
        "name": "Turathi Electric",
        "brand": "Afnan",
        "collection": "Turathi Collection",
        "rating_value": 4.38, "rating_count": 1200, "gender": "Men", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Electrifying Citrus Zest & Mineral Ambroxan", "dna_type": "Citrus Aromatic Marine", "similarity_percentage": 92, "price_usd": 42,
        "accords": [
            {"name": "Citrus", "score": 100, "color": "#eab308"},
            {"name": "Aromatic", "score": 85, "color": "#16a34a"},
            {"name": "Marine / Aquatic", "score": 80, "color": "#0ea5e9"},
            {"name": "Ambroxan", "score": 78, "color": "#64748b"}
        ],
        "notes": {
            "top": ["Grapefruit", "Pink Pepper", "Bergamot"],
            "middle": ["Cedar", "Aquatic Notes", "Cardamom"],
            "base": ["Ambroxan", "Patchouli", "Vetiver"]
        },
        "seasons": {"summer": 60, "spring": 30, "fall": 8, "winter": 2},
        "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Explosive sparkling citrus with magnetic sillage", "Perfect signature summer heat scent"],
            "cons": ["Zesty opening"],
            "community_verdict": "A modern electric twist on Turathi Blue.",
            "top_reviewer_quotes": ["Ultra-crisp grapefruit and clean mineral ambroxan."]
        },
        "flankers": ["afnan-turathi-blue", "afnan-turathi-brown"],
        "dna_twins": ["afnan-turathi-blue", "rayhaan-pacific"]
    },
    {
        "id": "afnan-turathi-brown",
        "name": "Turathi Brown",
        "brand": "Afnan",
        "collection": "Turathi Collection",
        "rating_value": 4.35, "rating_count": 1500, "gender": "Men", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Yves Saint Laurent Tuxedo", "dna_type": "Amber Woody Warm Spicy", "similarity_percentage": 91, "price_usd": 40,
        "accords": [
            {"name": "Amber", "score": 100, "color": "#d97706"},
            {"name": "Warm Spicy", "score": 88, "color": "#c2410c"},
            {"name": "Woody", "score": 82, "color": "#854d0e"},
            {"name": "Patchouli", "score": 75, "color": "#15803d"}
        ],
        "notes": {
            "top": ["Patchouli", "Amber", "Bergamot"],
            "middle": ["Rose", "Black Pepper", "Spices"],
            "base": ["Bourbon Vanilla", "Sandalwood", "Oakmoss"]
        },
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3},
        "day_night": {"day": 30, "night": 70},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {
            "pros": ["Classy spicy patchouli amber", "Superb formal evening wear"],
            "cons": ["Patchouli prominence"],
            "community_verdict": "Very refined tuxedo-style profile.",
            "top_reviewer_quotes": ["Sophisticated pepper, amber, and patchouli."]
        },
        "flankers": ["afnan-turathi-blue", "afnan-turathi-electric"],
        "dna_twins": ["lattafa-khamrah"]
    },
    {
        "id": "afnan-supremacy-collectors-edition",
        "name": "Supremacy Collector's Edition Pour Homme",
        "brand": "Afnan",
        "collection": "Supremacy",
        "rating_value": 4.52, "rating_count": 2400, "gender": "Men", "release_year": 2024,
        "concentration": "Extrait de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Creed Absolu Aventus & Nishane Hacivat", "dna_type": "Fruity Woody Chypre", "similarity_percentage": 95, "price_usd": 55,
        "accords": [
            {"name": "Fruity", "score": 100, "color": "#f97316"},
            {"name": "Woody", "score": 92, "color": "#854d0e"},
            {"name": "Citrus", "score": 88, "color": "#eab308"},
            {"name": "Smoky", "score": 82, "color": "#475569"},
            {"name": "Earthy / Oakmoss", "score": 78, "color": "#15803d"}
        ],
        "notes": {
            "top": ["Pineapple", "Bergamot", "Apple", "White Flowers"],
            "middle": ["Birch", "Orange Blossom", "Amber"],
            "base": ["Oakmoss", "Musk", "Patchouli", "Ambergris"]
        },
        "seasons": {"spring": 38, "summer": 25, "fall": 25, "winter": 12},
        "day_night": {"day": 60, "night": 40},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {
            "pros": ["Masterful fusion of Absolu Aventus and smoky juicy pineapple", "Rich extrait concentration with 10+ hour power", "Refined presentation"],
            "cons": ["Oakmoss base is potent"],
            "community_verdict": "One of the highest-rated releases in Afnan's history.",
            "top_reviewer_quotes": ["Juicy pineapple, crisp birch smoke, and deep ambergris."]
        },
        "flankers": ["afnan-supremacy-not-only-intense", "afnan-supremacy-silver"],
        "dna_twins": ["afnan-supremacy-not-only-intense", "armaf-club-de-nuit-precieux-1"]
    },
    {
        "id": "afnan-supremacy-gala",
        "name": "Supremacy Gala",
        "brand": "Afnan",
        "collection": "Supremacy",
        "rating_value": 4.28, "rating_count": 890, "gender": "Women", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Exquisite White Floral & Pear Amber", "dna_type": "Floral Fruity Amber", "similarity_percentage": 91, "price_usd": 42,
        "accords": [
            {"name": "White Floral", "score": 100, "color": "#fbcfe8"},
            {"name": "Fruity", "score": 88, "color": "#f97316"},
            {"name": "Sweet", "score": 82, "color": "#ec4899"},
            {"name": "Musk", "score": 75, "color": "#cbd5e1"}
        ],
        "notes": {
            "top": ["Pear", "Mandarin Orange", "Red Berries"],
            "middle": ["Gardenia", "Jasmine", "Frangipani"],
            "base": ["Brown Sugar", "Patchouli", "White Musk"]
        },
        "seasons": {"spring": 45, "summer": 25, "fall": 20, "winter": 10},
        "day_night": {"day": 70, "night": 30},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {
            "pros": ["Luminous white florals with crisp sweet pear", "Very uplifting and feminine"],
            "cons": ["Sweet floral profile"],
            "community_verdict": "Sparkling gardenia and brown sugar bliss.",
            "top_reviewer_quotes": ["Sweet pear and radiant white florals."]
        },
        "flankers": ["afnan-supremacy-tapis-rouge"],
        "dna_twins": ["titan-skinn-celeste"]
    },
    {
        "id": "afnan-modest-une",
        "name": "Modest Une Pour Homme",
        "brand": "Afnan",
        "collection": "Modest Collection",
        "rating_value": 4.36, "rating_count": 2800, "gender": "Men", "release_year": 2019,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Dior Sauvage Eau de Parfum", "dna_type": "Fresh Spicy Citrus Ambroxan", "similarity_percentage": 93, "price_usd": 32,
        "accords": [
            {"name": "Fresh Spicy", "score": 100, "color": "#059669"},
            {"name": "Ambroxan", "score": 92, "color": "#64748b"},
            {"name": "Citrus", "score": 88, "color": "#eab308"},
            {"name": "Aromatic", "score": 80, "color": "#16a34a"}
        ],
        "notes": {
            "top": ["Calabrian Bergamot", "Sichuan Pepper", "Lavender"],
            "middle": ["Mint", "Eucalyptus", "Nutmeg"],
            "base": ["Ambroxan", "Cedarwood", "Vetiver", "Musk"]
        },
        "seasons": {"spring": 30, "summer": 35, "fall": 25, "winter": 10},
        "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Clean, hyper-smooth Dior Sauvage DNA with zero screechiness", "Massive compliment puller for daily wear"],
            "cons": ["Common modern blue profile"],
            "community_verdict": "One of the best everyday blue fragrances under $35.",
            "top_reviewer_quotes": ["Smoother than Sauvage EDT with all the magnetic projection."]
        },
        "flankers": ["afnan-modest-deux"],
        "dna_twins": ["armaf-ventana", "titan-skinn-raw"]
    },
    {
        "id": "afnan-modest-deux",
        "name": "Modest Deux",
        "brand": "Afnan",
        "collection": "Modest Collection",
        "rating_value": 4.30, "rating_count": 1600, "gender": "Women", "release_year": 2019,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Lancôme Trésor Midnight Rose & Mon Paris", "dna_type": "Fruity Gourmand Vanilla", "similarity_percentage": 92, "price_usd": 32,
        "accords": [
            {"name": "Sweet", "score": 100, "color": "#ec4899"},
            {"name": "Fruity", "score": 90, "color": "#f97316"},
            {"name": "Vanilla", "score": 85, "color": "#f59e0b"},
            {"name": "Chocolate / Praline", "score": 78, "color": "#78350f"}
        ],
        "notes": {
            "top": ["Strawberry", "Raspberry", "Cherry", "Chocolate"],
            "middle": ["Vanilla", "Spices"],
            "base": ["Patchouli", "Gardenia", "Musk"]
        },
        "seasons": {"fall": 40, "winter": 35, "spring": 18, "summer": 7},
        "day_night": {"day": 40, "night": 60},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Decadent dark chocolate covered strawberries and raspberries", "Long-lasting sweet date night scent"],
            "cons": ["Very sweet berry profile"],
            "community_verdict": "Gourmand berry chocolate dream.",
            "top_reviewer_quotes": ["Luscious strawberries and velvety chocolate praline."]
        },
        "flankers": ["afnan-modest-une"],
        "dna_twins": ["mykonos-caramel-fudge-cookie"]
    },

    # ==================== LATTAFA VIRAL 2024 RELEASES ====================
    {
        "id": "lattafa-yara-candy",
        "name": "Yara Candy",
        "brand": "Lattafa",
        "collection": "Yara Collection",
        "rating_value": 4.32, "rating_count": 3100, "gender": "Women", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Candied Fizz, Green Mandarin & Marshmallow Vanilla", "dna_type": "Sweet Fruity Gourmand", "similarity_percentage": 92, "price_usd": 30,
        "accords": [
            {"name": "Sweet", "score": 100, "color": "#ec4899"},
            {"name": "Fruity", "score": 92, "color": "#f97316"},
            {"name": "Vanilla", "score": 86, "color": "#f59e0b"},
            {"name": "Citrus", "score": 75, "color": "#eab308"}
        ],
        "notes": {
            "top": ["Green Mandarin", "Blackcurrant Candy", "Fizzy Candies"],
            "middle": ["Strawberry Marshmallow", "Gardenia"],
            "base": ["Vanilla Cream", "Amber", "Sandalwood", "Musk"]
        },
        "seasons": {"spring": 42, "summer": 30, "fall": 18, "winter": 10},
        "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {
            "pros": ["Fun, fizzy candied berries with creamy marshmallow vanilla", "Instant compliment magnet"],
            "cons": ["Youthful sweet bubblegum/candy style"],
            "community_verdict": "The 2024 viral sensation following original Yara pink.",
            "top_reviewer_quotes": ["Fizzy blackcurrant candies and strawberry marshmallow fluff."]
        },
        "flankers": ["lattafa-yara-pink", "lattafa-yara-moi", "lattafa-yara-tous"],
        "dna_twins": ["lattafa-yara-pink", "mykonos-caramel-fudge-cookie"]
    },
    {
        "id": "lattafa-liam-grey",
        "name": "Liam Grey",
        "brand": "Lattafa",
        "collection": "Liam Series",
        "rating_value": 4.51, "rating_count": 4800, "gender": "Unisex", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "BDK Gris Charnel", "dna_type": "Woody Spicy Creamy Fig", "similarity_percentage": 95, "price_usd": 34,
        "accords": [
            {"name": "Warm Spicy", "score": 100, "color": "#c2410c"},
            {"name": "Woody", "score": 92, "color": "#854d0e"},
            {"name": "Vanilla", "score": 86, "color": "#f59e0b"},
            {"name": "Fruity", "score": 80, "color": "#f97316"},
            {"name": "Aromatic", "score": 75, "color": "#16a34a"}
        ],
        "notes": {
            "top": ["Cardamom", "Fig", "Black Tea"],
            "middle": ["Iris", "Vetiver", "Labdanum"],
            "base": ["Sandalwood", "Bourbon Vanilla", "Tonka Bean", "Patchouli"]
        },
        "seasons": {"fall": 48, "winter": 35, "spring": 15, "summer": 2},
        "day_night": {"day": 35, "night": 65},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Exceptional 95% match to BDK Gris Charnel", "Cozy black tea, cardamom, milky fig, and smooth sandalwood", "Pure niche luxury under $35"],
            "cons": ["Fig note requires appreciating creamy green fruit nuances"],
            "community_verdict": "Considered by many the best blind buy clone in all of modern perfumery.",
            "top_reviewer_quotes": ["Spicy cardamom, cozy black tea, and velvety sandalwood. 10/10."]
        },
        "flankers": ["lattafa-liam-blue-shine"],
        "dna_twins": ["armaf-elite-pour-homme"]
    },
    {
        "id": "lattafa-vintage-radio",
        "name": "Vintage Radio",
        "brand": "Lattafa",
        "collection": "Pride Collection",
        "rating_value": 4.46, "rating_count": 3900, "gender": "Unisex", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Initio Paragon", "dna_type": "Woody Aromatic Plum", "similarity_percentage": 94, "price_usd": 44,
        "accords": [
            {"name": "Woody", "score": 100, "color": "#854d0e"},
            {"name": "Fruity", "score": 90, "color": "#f97316"},
            {"name": "Aromatic", "score": 85, "color": "#16a34a"},
            {"name": "Warm Spicy", "score": 78, "color": "#c2410c"}
        ],
        "notes": {
            "top": ["Plum", "Lavender", "Sage"],
            "middle": ["Palo Santo", "Black Pepper"],
            "base": ["Sandalwood", "Amber"]
        },
        "seasons": {"fall": 42, "winter": 32, "spring": 20, "summer": 6},
        "day_night": {"day": 45, "night": 55},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Superb plum and sacred Palo Santo wood aroma", "Spiritual, calming, luxurious scent trail"],
            "cons": ["Palo Santo has a distinct aromatic woody profile"],
            "community_verdict": "Elite release in Lattafa's high-tier Pride line.",
            "top_reviewer_quotes": ["Plum, lavender, and Palo Santo that rivals Initio directly."]
        },
        "flankers": ["lattafa-al-nashama-caprice"],
        "dna_twins": ["lattafa-liam-grey"]
    },
    {
        "id": "lattafa-al-nashama-caprice",
        "name": "Al Nashama Caprice",
        "brand": "Lattafa",
        "collection": "Al Nashama",
        "rating_value": 4.49, "rating_count": 2900, "gender": "Men", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "YSL La Nuit de L'Homme Bleu Électrique", "dna_type": "Spicy Aromatic Lavender", "similarity_percentage": 96, "price_usd": 38,
        "accords": [
            {"name": "Fresh Spicy", "score": 100, "color": "#059669"},
            {"name": "Aromatic", "score": 92, "color": "#16a34a"},
            {"name": "Warm Spicy", "score": 85, "color": "#c2410c"},
            {"name": "Lavender", "score": 80, "color": "#8b5cf6"}
        ],
        "notes": {
            "top": ["Cardamom", "Ginger", "Bergamot", "Lemon"],
            "middle": ["Lavender", "Geranium", "Mint"],
            "base": ["Cedarwood", "Amber", "Vetiver", "Patchouli"]
        },
        "seasons": {"fall": 40, "spring": 35, "winter": 20, "summer": 5},
        "day_night": {"day": 35, "night": 65},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Near-identical resurrection of the discontinued holy grail Bleu Électrique", "Electrifying ginger cardamom burst with romantic lavender", "Longer lasting than the designer original"],
            "cons": ["Very popular, frequently selling out"],
            "community_verdict": "One of the best releases of 2024.",
            "top_reviewer_quotes": ["Cardamom, sharp ginger, and sensual lavender. Pure magic."]
        },
        "flankers": ["lattafa-al-nashama"],
        "dna_twins": ["armaf-elite-pour-homme", "titan-skinn-steele"]
    },
    {
        "id": "lattafa-badee-al-oud-honor-and-glory",
        "name": "Bade'e Al Oud Honor & Glory",
        "brand": "Lattafa",
        "collection": "Bade'e Al Oud",
        "rating_value": 4.45, "rating_count": 5200, "gender": "Unisex", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Pineapple Crème Brûlée & Spiced Warm Woods", "dna_type": "Sweet Fruity Gourmand", "similarity_percentage": 93, "price_usd": 32,
        "accords": [
            {"name": "Sweet", "score": 100, "color": "#ec4899"},
            {"name": "Fruity", "score": 92, "color": "#f97316"},
            {"name": "Vanilla", "score": 88, "color": "#f59e0b"},
            {"name": "Warm Spicy", "score": 80, "color": "#c2410c"}
        ],
        "notes": {
            "top": ["Pineapple Crème Brûlée", "Cinnamon", "Black Pepper"],
            "middle": ["Benzoin", "Turmeric", "Labdanum"],
            "base": ["Vanilla", "Sandalwood", "Cashmeran", "Moss"]
        },
        "seasons": {"fall": 35, "winter": 30, "spring": 25, "summer": 10},
        "day_night": {"day": 50, "night": 50},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Unbelievably delicious caramelized pineapple crème brûlée", "Smooth warm spices without being cloying", "Massive projection"],
            "cons": ["Gourmand sweet tooth required"],
            "community_verdict": "Huge fan favorite in the Bade'e Al Oud range.",
            "top_reviewer_quotes": ["Caramelized pineapple with warm vanilla custard."]
        },
        "flankers": ["lattafa-badee-al-oud-for-glory", "lattafa-badee-al-oud-sublime"],
        "dna_twins": ["lattafa-khamrah-qahwa"]
    },

    # ==================== RASASI VIRAL RELEASES ====================
    {
        "id": "rasasi-hawas-ice",
        "name": "Hawas Ice for Him",
        "brand": "Rasasi",
        "collection": "Hawas Collection",
        "rating_value": 4.50, "rating_count": 6800, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Frosted Aquatic Mint & Candied Plum Ambergris", "dna_type": "Fresh Aromatic Fruity Aquatic", "similarity_percentage": 94, "price_usd": 58,
        "accords": [
            {"name": "Marine / Aquatic", "score": 100, "color": "#0ea5e9"},
            {"name": "Citrus", "score": 95, "color": "#eab308"},
            {"name": "Fruity", "score": 90, "color": "#f97316"},
            {"name": "Fresh Spicy", "score": 85, "color": "#059669"},
            {"name": "Ambroxan", "score": 80, "color": "#64748b"}
        ],
        "notes": {
            "top": ["Frozen Apple", "Italian Lemon", "Sicilian Bergamot", "Star Anise"],
            "middle": ["Plum", "Cardamom", "Orange Blossom"],
            "base": ["Ambergris", "Musk", "Driftwood", "Tonka Bean"]
        },
        "seasons": {"summer": 68, "spring": 24, "fall": 6, "winter": 2},
        "day_night": {"day": 75, "night": 25},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {
            "pros": ["Takes the famous Hawas DNA and adds an icy blast of frosted lemon and minty anise", "Nuclear projection in 40°C heat", "Unstoppable compliment getter"],
            "cons": ["High demand means slightly higher price than original Hawas"],
            "community_verdict": "The undisputed king of summer 2024/2025 fragrances.",
            "top_reviewer_quotes": ["Frosted apple, lemon zest, and aquatic ambergris. Truly beast mode."]
        },
        "flankers": ["rasasi-hawas-for-men", "rasasi-hawas-black"],
        "dna_twins": ["rasasi-hawas-for-men", "rayhaan-pacific"]
    },
    {
        "id": "rasasi-daarej-pour-homme",
        "name": "Daarej Pour Homme",
        "brand": "Rasasi",
        "collection": "Oriental Classics",
        "rating_value": 4.38, "rating_count": 7200, "gender": "Men", "release_year": 2012,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Valentino V Pour Homme", "dna_type": "Amber Spicy Vanilla", "similarity_percentage": 95, "price_usd": 24,
        "accords": [
            {"name": "Vanilla", "score": 100, "color": "#f59e0b"},
            {"name": "Warm Spicy", "score": 92, "color": "#c2410c"},
            {"name": "Amber", "score": 85, "color": "#d97706"},
            {"name": "Aromatic", "score": 75, "color": "#16a34a"}
        ],
        "notes": {
            "top": ["Cumin", "Cardamom", "Mugwort"],
            "middle": ["Orris Root", "Rose"],
            "base": ["Vanilla", "Tonka Bean", "Amber", "Sandalwood", "Patchouli", "Musk"]
        },
        "seasons": {"fall": 42, "winter": 40, "spring": 15, "summer": 3},
        "day_night": {"day": 30, "night": 70},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Smooth vanilla tonka drydown with seductive oriental spices", "Incredible $24 price point"],
            "cons": ["Cumin note in opening can be polarizing for the first 5 minutes"],
            "community_verdict": "A legendary cheapie that punches way above its price point.",
            "top_reviewer_quotes": ["Velvety vanilla, cardamom, and tonka. Intimate and magnetic."]
        },
        "flankers": ["rasasi-daarej-pour-femme"],
        "dna_twins": ["lattafa-khamrah", "afnan-9-pm"]
    },

    # ==================== ARMAF POPULAR EXPANSIONS ====================
    {
        "id": "armaf-odyssey-mandarin-sky",
        "name": "Odyssey Mandarin Sky",
        "brand": "Armaf",
        "collection": "Odyssey Collection",
        "rating_value": 4.43, "rating_count": 3900, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Jean Paul Gaultier Scandal Pour Homme", "dna_type": "Sweet Citrus Amber Caramel", "similarity_percentage": 93, "price_usd": 35,
        "accords": [
            {"name": "Citrus", "score": 100, "color": "#eab308"},
            {"name": "Sweet", "score": 92, "color": "#ec4899"},
            {"name": "Caramel", "score": 88, "color": "#d97706"},
            {"name": "Amber", "score": 80, "color": "#b45309"}
        ],
        "notes": {
            "top": ["Mandarin Orange", "Orange", "Saffron", "Sage"],
            "middle": ["Caramel", "Tonka Bean", "Tagetes"],
            "base": ["Ambroxan", "Cedarwood", "Vetiver"]
        },
        "seasons": {"fall": 40, "winter": 35, "spring": 20, "summer": 5},
        "day_night": {"day": 40, "night": 60},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Juicy ripe mandarin drenched in rich caramel and warm tonka", "Massive compliment gatherer in nightclubs and cool weather"],
            "cons": ["Very sweet caramel gourmand"],
            "community_verdict": "One of Armaf's most universally loved releases in the Odyssey bottle.",
            "top_reviewer_quotes": ["Mandarin orange and warm burnt sugar caramel."]
        },
        "flankers": ["armaf-odyssey-mega", "armaf-odyssey-aqua"],
        "dna_twins": ["lattafa-khamrah", "afnan-9-pm"]
    },
    {
        "id": "armaf-club-de-nuit-iconic",
        "name": "Club de Nuit Blue Iconic",
        "brand": "Armaf",
        "collection": "Club de Nuit",
        "rating_value": 4.44, "rating_count": 5200, "gender": "Men", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Bleu de Chanel Eau de Parfum", "dna_type": "Fresh Citrus Aromatic Incense", "similarity_percentage": 94, "price_usd": 42,
        "accords": [
            {"name": "Citrus", "score": 100, "color": "#eab308"},
            {"name": "Aromatic", "score": 88, "color": "#16a34a"},
            {"name": "Fresh Spicy", "score": 82, "color": "#059669"},
            {"name": "Incense / Smoky", "score": 75, "color": "#475569"}
        ],
        "notes": {
            "top": ["Grapefruit", "Lemon", "Mint", "Pink Pepper", "Coriander"],
            "middle": ["Ginger", "Nutmeg", "Melon", "Jasmine"],
            "base": ["Incense", "Amber", "Cedarwood", "Sandalwood", "Patchouli", "Labdanum"]
        },
        "seasons": {"spring": 35, "summer": 35, "fall": 20, "winter": 10},
        "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {
            "pros": ["Spot on Bleu de Chanel EDP clone with better projection", "High-versatility king for office, dates, and casual wear"],
            "cons": ["Citrus ginger opening is bold"],
            "community_verdict": "The best Bleu de Chanel alternative in the fragrance community.",
            "top_reviewer_quotes": ["Crisp grapefruit, mint, ginger, and mystical incense amber."]
        },
        "flankers": ["armaf-club-de-nuit-intense-man", "armaf-club-de-nuit-sillage"],
        "dna_twins": ["titan-skinn-raw", "afnan-modest-une"]
    },
    {
        "id": "armaf-club-de-nuit-untold",
        "name": "Club de Nuit Untold",
        "brand": "Armaf",
        "collection": "Club de Nuit",
        "rating_value": 4.42, "rating_count": 4800, "gender": "Unisex", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Baccarat Rouge 540", "dna_type": "Amber Woody Floral", "similarity_percentage": 95, "price_usd": 45,
        "accords": [
            {"name": "Amber", "score": 100, "color": "#d97706"},
            {"name": "Woody", "score": 90, "color": "#854d0e"},
            {"name": "Warm Spicy", "score": 85, "color": "#c2410c"},
            {"name": "Cotton Candy / Sweet", "score": 80, "color": "#ec4899"}
        ],
        "notes": {
            "top": ["Saffron", "Jasmine"],
            "middle": ["Amberwood", "Ambergris"],
            "base": ["Fir Resin", "Cedarwood"]
        },
        "seasons": {"fall": 35, "winter": 35, "spring": 20, "summer": 10},
        "day_night": {"day": 45, "night": 55},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {
            "pros": ["Masterful clone of Baccarat Rouge 540 EDP", "Saffron, warm cedar, and airy burnt sugar aura that leaves a 10-foot trail"],
            "cons": ["Some people experience olfactory fatigue (nose-blindness) to ambroxan/amberwood"],
            "community_verdict": "Armaf's most potent clone of BR540.",
            "top_reviewer_quotes": ["Burnt sugar, saffron, and resinous amberwood. Monster projection."]
        },
        "flankers": ["armaf-club-de-nuit-intense-man"],
        "dna_twins": ["titan-skinn-nude"]
    }
]

with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json', 'r') as f:
    existing = json.load(f)

existing_ids = {item['id'] for item in existing}
added_count = 0

for p in new_perfumes:
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

print(f"Successfully added/updated {added_count} brand-new releases (including Afnan Historic Sahara)!")
print(f"Total fragrances in database: {len(existing)}")
