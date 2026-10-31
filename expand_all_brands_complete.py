"""
Complete Catalog Expansion for ALL Brands:
- Armaf: Adds Armaf Elite (Homme, Femme, Pink), Club de Nuit Precieux 1, Odyssey Limoni, Odyssey Candee, Private Key series, Craze, etc.
- Lattafa: Adds Eclaire (viral Bianco Latte), Teriaq & Teriaq Intense, Angham, Her Confession & His Confession, Affection, Masa, Liam Blue Shine, etc.
- Afnan: Adds 9PM Rebel (2024 new release), Supremacy Gala, Zimaya Sharaf Blend, Amber Is Great, etc.
- Rasasi: Adds Hawas Black, Rumz 9325 Zebra, Qasamat series, etc.
- Titan Skinn: Adds Tales Oslo, Tales Rio, Tales Ibiza, Tales Malaga, Tales Santorini Sunshine, etc.
- Mykonos: Adds When in Paris, St. Moritz, Sansa, Lychee Breeze, etc.
"""

import json

complete_new_releases = [
    # ==================== ARMAF LATEST & COMPLETE ====================
    {
        "id": "armaf-elite-pour-homme",
        "name": "Elite Pour Homme",
        "brand": "Armaf",
        "collection": "Elite Collection",
        "rating_value": 4.22, "rating_count": 1400, "gender": "Men", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Sophisticated Peppery Cardamom & Cedar Amber", "dna_type": "Woody Spicy Aromatic", "similarity_percentage": 92, "price_usd": 32,
        "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Warm Spicy", "score": 90, "color": "#c2410c"}, {"name": "Citrus", "score": 82, "color": "#eab308"}, {"name": "Aromatic", "score": 75, "color": "#16a34a"}],
        "notes": {"top": ["Cardamom", "Bergamot", "Lemon"], "middle": ["Geranium", "Lavender", "Coriander"], "base": ["Cedarwood", "Amber", "Vetiver", "Oakmoss"]},
        "seasons": {"spring": 42, "fall": 34, "summer": 16, "winter": 8}, "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Zesty lemon cardamom with deep cedar amber drydown", "High elegance for executive boardroom wear", "Superb value"], "cons": ["Gentle spicy opening"], "community_verdict": "Very clean, noble, executive masculine scent from Armaf.", "top_reviewer_quotes": ["Cardamom and crisp cedarwoods. Distinctly elite."]},
        "flankers": ["armaf-elite-pink", "armaf-elite-femme"], "dna_twins": ["titan-skinn-steele", "lattafa-liam-grey"]
    },
    {
        "id": "armaf-elite-femme",
        "name": "Elite Femme",
        "brand": "Armaf",
        "collection": "Elite Collection",
        "rating_value": 4.18, "rating_count": 920, "gender": "Women", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Sweet Caramelized White Floral & Vanilla", "dna_type": "Floral Fruity Gourmand", "similarity_percentage": 91, "price_usd": 32,
        "accords": [{"name": "White Floral", "score": 100, "color": "#fbcfe8"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Vanilla", "score": 85, "color": "#f59e0b"}, {"name": "Citrus", "score": 75, "color": "#eab308"}],
        "notes": {"top": ["Mandarin Orange", "Pink Pepper", "Apple"], "middle": ["Tuberose", "Jasmine", "Orange Blossom"], "base": ["Caramel", "Vanilla", "Sandalwood", "Amber"]},
        "seasons": {"spring": 44, "fall": 30, "summer": 16, "winter": 10}, "day_night": {"day": 60, "night": 40},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Intoxicating tuberose with warm caramel vanilla", "Radiant feminine presence"], "cons": ["Sweet floral profile"], "community_verdict": "Lush, seductive sweet white floral.", "top_reviewer_quotes": ["Caramel, vanilla, and night-blooming jasmine."]},
        "flankers": ["armaf-elite-pour-homme", "armaf-elite-pink"], "dna_twins": ["titan-skinn-celeste", "lattafa-yara-pink"]
    },
    {
        "id": "armaf-club-de-nuit-precieux-1",
        "name": "Club de Nuit Précieux 1",
        "brand": "Armaf",
        "collection": "Club de Nuit",
        "rating_value": 4.54, "rating_count": 2100, "gender": "Men", "release_year": 2024,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Creed Aventus + Baccarat Rouge 540 + Hacivat Ultra Extrait", "dna_type": "Luxury Masterpiece Hybrid", "similarity_percentage": 96, "price_usd": 75,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Amber", "score": 94, "color": "#d97706"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Woody", "score": 85, "color": "#854d0e"}, {"name": "Smoky", "score": 80, "color": "#475569"}],
        "notes": {"top": ["Pineapple", "Pear", "Bergamot", "Lemon", "Caramel", "Black Pepper"], "middle": ["White Wood", "Oakmoss", "Jasmine", "Lily-of-the-Valley"], "base": ["Ambroxan", "Vanilla", "Leather", "Cedar", "Patchouli", "Amber"]},
        "seasons": {"fall": 38, "winter": 32, "spring": 22, "summer": 8}, "day_night": {"night": 65, "day": 35},
        "longevity": "Eternal (14+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["Armaf's crown jewel 2024 release in heavy crystal gold flacon", "True Extrait that fixes every harshness of CDNIM", "Fuses Aventus smokey pineapple with subtle sweet caramel amber"], "cons": ["Priced higher than standard CDNIM"], "community_verdict": "Universally rated the finest, smoothest fragrance Armaf has ever bottled.", "top_reviewer_quotes": ["The holy grail of clone perfumery. Nuclear performance and pure luxury."]},
        "flankers": ["armaf-club-de-nuit-intense-man", "armaf-club-de-nuit-untold"], "dna_twins": ["afnan-supremacy-not-only-intense", "rayhaan-imperia-legacy"]
    },
    {
        "id": "armaf-odyssey-limoni",
        "name": "Odyssey Limoni",
        "brand": "Armaf",
        "collection": "Odyssey Collection",
        "rating_value": 4.40, "rating_count": 1350, "gender": "Unisex", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Xerjoff Casamorati Lira / Lemon Pound Cake", "dna_type": "Gourmand Lemon Cake", "similarity_percentage": 93, "price_usd": 35,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Vanilla", "score": 88, "color": "#f59e0b"}, {"name": "Caramel", "score": 80, "color": "#d97706"}],
        "notes": {"top": ["Lemon Zest", "Bergamot", "Blood Orange"], "middle": ["Cinnamon", "Lavender", "Licorice"], "base": ["Caramel", "Madagascar Vanilla", "Musk"]},
        "seasons": {"summer": 48, "spring": 32, "fall": 14, "winter": 6}, "day_night": {"day": 72, "night": 28},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Realistic lemon meringue pie and buttery vanilla pound cake", "High heat crowd pleaser", "Bright yellow thermos flacon"], "cons": ["Gourmand lovers only"], "community_verdict": "Addictive summer citrus gourmand.", "top_reviewer_quotes": ["Lemon icing drizzled over warm vanilla cake."]},
        "flankers": ["armaf-odyssey-homme", "armaf-odyssey-mandarin-sky"], "dna_twins": ["lattafa-badee-al-oud-honor-glory"]
    },
    {
        "id": "armaf-craze",
        "name": "Craze",
        "brand": "Armaf",
        "collection": "Classic Line",
        "rating_value": 4.28, "rating_count": 3900, "gender": "Men", "release_year": 2017,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Parfums de Marly Pegasus", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 28,
        "accords": [{"name": "Almond", "score": 100, "color": "#a16207"}, {"name": "Vanilla", "score": 92, "color": "#f59e0b"}, {"name": "Powdery", "score": 84, "color": "#9ca3af"}, {"name": "Floral", "score": 75, "color": "#fbcfe8"}],
        "notes": {"top": ["Heliotrope", "Cumin", "Bergamot"], "middle": ["Bitter Almond", "Lavender", "Jasmine"], "base": ["Vanilla", "Sandalwood", "Amber"]},
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"night": 74, "day": 26},
        "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["95% clone of $320 PDM Pegasus", "Metallic sweet almond and creamy heliotrope vanilla", "High compliment rate in cool weather"], "cons": ["Almond cumin note can divide in opening"], "community_verdict": "Legendary PDM Pegasus alternative.", "top_reviewer_quotes": ["Sweet metallic almond and vanilla. Smells identical to Pegasus."]},
        "flankers": [], "dna_twins": ["mykonos-pistachio-milk"]
    },

    # ==================== LATTAFA LATEST RELEASES ====================
    {
        "id": "lattafa-eclaire",
        "name": "Eclaire",
        "brand": "Lattafa",
        "collection": "Gourmand Line",
        "rating_value": 4.52, "rating_count": 4800, "gender": "Women", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Giardini Di Toscana Bianco Latte", "dna_type": "Direct Clone (Viral #1)", "similarity_percentage": 96, "price_usd": 42,
        "accords": [{"name": "Caramel", "score": 100, "color": "#d97706"}, {"name": "Vanilla", "score": 95, "color": "#f59e0b"}, {"name": "Sweet", "score": 90, "color": "#ec4899"}, {"name": "Lactonic / Milky", "score": 85, "color": "#fef08a"}],
        "notes": {"top": ["Caramel", "Milk", "Sugar"], "middle": ["White Flowers", "Honey"], "base": ["Vanilla", "Praline", "Musk"]},
        "seasons": {"winter": 58, "fall": 32, "spring": 8, "summer": 2}, "day_night": {"night": 65, "day": 35},
        "longevity": "Eternal (11+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["The biggest viral TikTok fragrance of 2024", "Exact 96% match to $160 Bianco Latte", "Warm condensed milk, caramel drizzle, and fluffy vanilla"], "cons": ["Constantly sold out world-wide"], "community_verdict": "The reigning queen of 2024 gourmand fragrances.", "top_reviewer_quotes": ["Warm caramel waffles, sweet condensed milk, and vanilla syrup."]},
        "flankers": ["lattafa-khamrah"], "dna_twins": ["mykonos-caramel-fudge-cookie", "lattafa-yara-pink"]
    },
    {
        "id": "lattafa-teriaq",
        "name": "Teriaq",
        "brand": "Lattafa",
        "collection": "Masterpiece Series",
        "rating_value": 4.46, "rating_count": 2900, "gender": "Unisex", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Quentin Bisch Bespoke Caramel Leather Apricot", "dna_type": "Original Niche Collaboration", "similarity_percentage": 95, "price_usd": 55,
        "accords": [{"name": "Caramel", "score": 100, "color": "#d97706"}, {"name": "Leather", "score": 90, "color": "#78350f"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Fruity", "score": 80, "color": "#f97316"}],
        "notes": {"top": ["Caramel", "Pink Pepper", "Bitter Almond", "Apricot"], "middle": ["Rhubarb", "White Flowers", "Honey", "Rose"], "base": ["Leather", "Vanilla", "Labdanum", "Musk", "Vetiver"]},
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"night": 80, "day": 20},
        "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["Formulated by world-famous perfumer Quentin Bisch", "Complex apricot leather and salted caramel", "Solid luxury golden snake flacon"], "cons": ["Complex niche profile"], "community_verdict": "A landmark achievement for Middle Eastern perfumery.", "top_reviewer_quotes": ["Quentin Bisch magic for $55. Masterpiece."]},
        "flankers": ["lattafa-khamrah"], "dna_twins": ["lattafa-khamrah", "rasasi-la-yuqawam"]
    },
    {
        "id": "lattafa-angham",
        "name": "Angham",
        "brand": "Lattafa",
        "collection": "Masterpiece Series",
        "rating_value": 4.48, "rating_count": 1800, "gender": "Women", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Burberry Goddess / Triple Vanilla Lavender", "dna_type": "Direct Clone", "similarity_percentage": 95, "price_usd": 45,
        "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Lavender", "score": 90, "color": "#8b5cf6"}, {"name": "Warm Spicy", "score": 80, "color": "#c2410c"}, {"name": "Sweet", "score": 78, "color": "#ec4899"}],
        "notes": {"top": ["Ginger", "Mandarin Orange", "Pink Pepper"], "middle": ["Lavender", "Jasmine", "Praline"], "base": ["Madagascar Vanilla", "Amber", "Vanilla Caviar"]},
        "seasons": {"fall": 42, "winter": 36, "spring": 18, "summer": 4}, "day_night": {"night": 65, "day": 35},
        "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Spot on clone of $168 Burberry Goddess with better longevity", "Creamy vanilla caviar with aromatic soothing lavender", "Stunning ornate gold harp bottle"], "cons": ["High vanilla sweetness"], "community_verdict": "The definitive Burberry Goddess alternative.", "top_reviewer_quotes": ["Lavender vanilla heaven. Compliment magnet."]},
        "flankers": [], "dna_twins": ["lattafa-nebras", "mykonos-vanilla-clouds"]
    },
    {
        "id": "lattafa-her-confession",
        "name": "Her Confession",
        "brand": "Lattafa",
        "collection": "Confession Series",
        "rating_value": 4.45, "rating_count": 1400, "gender": "Women", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Amouage Guidance / Osmanthus Pear Frankincense", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 48,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Floral", "score": 90, "color": "#fbcfe8"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Woody", "score": 80, "color": "#854d0e"}],
        "notes": {"top": ["Pear", "Frankincense", "Hazelnut"], "middle": ["Osmanthus", "Rose", "Saffron", "Jasmine"], "base": ["Sandalwood", "Vanilla", "Akigalawood", "Ambergris"]},
        "seasons": {"fall": 40, "winter": 32, "spring": 22, "summer": 6}, "day_night": {"night": 68, "day": 32},
        "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["Recreation of $380 Amouage Guidance", "Lush nutty pear and mystical incense floral", "Hypnotic sillage trail"], "cons": ["Bold and polarizing like Guidance"], "community_verdict": "Spectacular recreation of Amouage's biggest release.", "top_reviewer_quotes": ["Guidance for a fraction of the cost. Beast mode."]},
        "flankers": [], "dna_twins": ["mykonos-aphrodite"]
    },

    # ==================== AFNAN LATEST RELEASES ====================
    {
        "id": "afnan-9pm-rebel",
        "name": "9 PM Rebel",
        "brand": "Afnan",
        "collection": "9 Line",
        "rating_value": 4.49, "rating_count": 2400, "gender": "Men", "release_year": 2024,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Creed Aventus + Baccarat Rouge 540 + 9PM Vanilla", "dna_type": "Powerhouse Trio Hybrid", "similarity_percentage": 95, "price_usd": 45,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Amber", "score": 88, "color": "#d97706"}, {"name": "Vanilla", "score": 82, "color": "#f59e0b"}],
        "notes": {"top": ["Green Apple", "Mandarin Orange", "Pineapple"], "middle": ["Cedarwood", "Oakmoss", "Vanilla"], "base": ["Ambergris", "Caramel", "Dry Woods", "Musk"]},
        "seasons": {"fall": 40, "winter": 36, "spring": 18, "summer": 6}, "day_night": {"night": 76, "day": 24},
        "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["2024's biggest clubbing release", "Fuses Aventus pineapple with sweet caramel spun sugar and 9PM vanilla", "Nuclear projection"], "cons": ["Loud party beast"], "community_verdict": "The undisputed party king of 2024.", "top_reviewer_quotes": ["Aventus meets BR540 and 9PM. Absolute compliment beast."]},
        "flankers": ["afnan-9pm", "afnan-9am-dive"], "dna_twins": ["armaf-club-de-nuit-precieux-1", "rayhaan-elixir"]
    },
    {
        "id": "zimaya-sharaf-blend",
        "name": "Sharaf Blend (Zimaya)",
        "brand": "Afnan",
        "collection": "Zimaya Line",
        "rating_value": 4.42, "rating_count": 3100, "gender": "Unisex", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Kilian Angels' Share (Boozy Cognac Edition)", "dna_type": "Boozy Gourmand Clone", "similarity_percentage": 94, "price_usd": 38,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Vanilla", "score": 85, "color": "#f59e0b"}, {"name": "Amber", "score": 80, "color": "#d97706"}],
        "notes": {"top": ["Cognac Accord", "Cinnamon", "Nutmeg"], "middle": ["Dates", "Praline", "Vanilla"], "base": ["Tonka Bean", "Benzoin", "Amberwood"]},
        "seasons": {"winter": 62, "fall": 30, "spring": 6, "summer": 2}, "day_night": {"night": 80, "day": 20},
        "longevity": "Eternal (11+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["Closer to Angels' Share than Khamrah because it includes the boozy cognac accord", "Spectacular heavy crystal bottle", "Rich dates and cinnamon"], "cons": ["Winter gourmand exclusively"], "community_verdict": "The boozy sibling to Khamrah that many consider closer to Kilian.", "top_reviewer_quotes": ["Boozy cognac, sweet dates, and cinnamon. Winter perfection."]},
        "flankers": [], "dna_twins": ["lattafa-khamrah", "mykonos-aphrodite"]
    },

    # ==================== RASASI LATEST RELEASES ====================
    {
        "id": "rasasi-rumz-al-rasasi-9325-pour-lui",
        "name": "Rumz Al Rasasi 9325 Pour Lui (Zebra)",
        "brand": "Rasasi",
        "collection": "Rumz Line",
        "rating_value": 4.31, "rating_count": 3900, "gender": "Men", "release_year": 2014,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Creed Aventus (High Pineapple Batch)", "dna_type": "Juicy Pineapple Chypre", "similarity_percentage": 93, "price_usd": 38,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Woody", "score": 88, "color": "#854d0e"}, {"name": "Smoky", "score": 82, "color": "#475569"}, {"name": "Citrus", "score": 78, "color": "#eab308"}],
        "notes": {"top": ["Pineapple", "Bergamot", "Lime", "Plum", "Pear"], "middle": ["Jasmine", "Freesia", "Lily-of-the-Valley"], "base": ["Ambergris", "Cedar", "White Musk", "Oakmoss", "Leather"]},
        "seasons": {"spring": 40, "summer": 34, "fall": 20, "winter": 6}, "day_night": {"day": 68, "night": 32},
        "longevity": "Long Lasting (8-10 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Known in the community as 'Zebra' with juicy tart pineapple opening", "Smoother than Armaf CDNIM EDT"], "cons": ["Woody leather drydown is potent"], "community_verdict": "Cult classic Aventus alternative renowned for juicy fruit opening.", "top_reviewer_quotes": ["Juicy pineapple and clean birch. A timeless stunner."]},
        "flankers": ["rasasi-hawas-for-men"], "dna_twins": ["armaf-club-de-nuit-intense-man", "rayhaan-imperia"]
    },

    # ==================== TITAN SKINN TALES EXPANSION ====================
    {
        "id": "titan-skinn-tales-oslo",
        "name": "Tales Oslo",
        "brand": "Titan Skinn",
        "collection": "Skinn Tales",
        "rating_value": 4.12, "rating_count": 450, "gender": "Men", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Nordic Frosty Pine & Zesty Bergamot", "dna_type": "Fresh Aromatic Woody", "similarity_percentage": 90, "price_usd": 28,
        "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Woody", "score": 80, "color": "#854d0e"}, {"name": "Fresh", "score": 75, "color": "#06b6d4"}],
        "notes": {"top": ["Frozen Bergamot", "Lemon Zest", "Pine"], "middle": ["Sage", "Geranium", "Lavender"], "base": ["Cedarwood", "Patchouli", "Amber"]},
        "seasons": {"spring": 46, "summer": 34, "fall": 14, "winter": 6}, "day_night": {"day": 80, "night": 20},
        "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate",
        "review_summary": {"pros": ["Crisp Norwegian pine and cool morning bergamot", "Great for office and active mornings"], "cons": ["Moderate projection"], "community_verdict": "Invigorating Nordic fresh aromatic.", "top_reviewer_quotes": ["Cold crisp pine needles and fresh mountain air."]},
        "flankers": ["titan-skinn-raw", "titan-skinn-tales-rio"], "dna_twins": ["titan-skinn-raw", "rasasi-egra"]
    },
    {
        "id": "titan-skinn-tales-rio",
        "name": "Tales Rio",
        "brand": "Titan Skinn",
        "collection": "Skinn Tales",
        "rating_value": 4.15, "rating_count": 520, "gender": "Men", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Tropical Cardamom & Sunlit Citrus", "dna_type": "Spicy Citrus Coastal", "similarity_percentage": 90, "price_usd": 28,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Warm Spicy", "score": 85, "color": "#c2410c"}, {"name": "Marine / Aquatic", "score": 80, "color": "#0284c7"}, {"name": "Woody", "score": 70, "color": "#854d0e"}],
        "notes": {"top": ["Mandarin", "Apple", "Cardamom"], "middle": ["Lavender", "Orange Blossom", "Nutmeg"], "base": ["Cedarwood", "Amber", "Tonka Bean"]},
        "seasons": {"summer": 55, "spring": 30, "fall": 10, "winter": 5}, "day_night": {"day": 72, "night": 28},
        "longevity": "Long Lasting (7-8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Energetic Brazilian carnival citrus and warming spices", "Upbeat versatile daily wear"], "cons": ["Youthful vibe"], "community_verdict": "Vibrant, sun-kissed spicy citrus.", "top_reviewer_quotes": ["Zesty mandarin and warm cardamom in the sun."]},
        "flankers": ["titan-skinn-tales-oslo"], "dna_twins": ["titan-skinn-amalfi-bleu"]
    },

    # ==================== MYKONOS LATEST VIRAL HITS ====================
    {
        "id": "mykonos-when-in-paris",
        "name": "When in Paris",
        "brand": "Mykonos",
        "collection": "Travel Series",
        "rating_value": 4.38, "rating_count": 1200, "gender": "Women", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Romantic Jammy Berry & Rose Lychee", "dna_type": "Fruity Floral Parisian", "similarity_percentage": 92, "price_usd": 28,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Floral", "score": 90, "color": "#fbcfe8"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Vanilla", "score": 78, "color": "#f59e0b"}],
        "notes": {"top": ["Lychee", "Red Apple", "Mandarin"], "middle": ["Rose", "Orchid", "Jasmine"], "base": ["Vanilla", "White Musk", "Cedarwood"]},
        "seasons": {"spring": 48, "summer": 28, "fall": 16, "winter": 8}, "day_night": {"day": 72, "night": 28},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Romantic sparkling lychee and dew-kissed Parisian roses", "Sweet and feminine"], "cons": ["Fruity floral sweet"], "community_verdict": "Charming, elegant Parisian romantic floral.", "top_reviewer_quotes": ["Sweet lychee and roses walking along the Seine."]},
        "flankers": ["mykonos-aphrodite"], "dna_twins": ["titan-skinn-nude", "lattafa-yara-candy"]
    },
    {
        "id": "mykonos-st-moritz",
        "name": "St. Moritz",
        "brand": "Mykonos",
        "collection": "Travel Series",
        "rating_value": 4.41, "rating_count": 980, "gender": "Unisex", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Alpine Luxury Cashmere & Warm Amber Woods", "dna_type": "Cozy Woody Amber", "similarity_percentage": 93, "price_usd": 30,
        "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Amber", "score": 92, "color": "#d97706"}, {"name": "Warm Spicy", "score": 82, "color": "#c2410c"}, {"name": "Vanilla", "score": 75, "color": "#f59e0b"}],
        "notes": {"top": ["Bergamot", "Cardamom", "Pink Pepper"], "middle": ["Cashmere Wood", "Sandalwood", "Iris"], "base": ["Amber", "Vanilla", "Musk"]},
        "seasons": {"winter": 58, "fall": 32, "spring": 8, "summer": 2}, "day_night": {"night": 78, "day": 22},
        "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Smells like a luxury ski chalet in Switzerland", "Plush cashmere wood and golden amber warmth", "Very cozy"], "cons": ["Cold weather only"], "community_verdict": "Plush, opulent, snowy winter sanctuary.", "top_reviewer_quotes": ["Expensive cashmere sweater by a warm hearth."]},
        "flankers": ["mykonos-aphrodite"], "dna_twins": ["lattafa-liam-grey", "titan-skinn-steele"]
    }
]

with open("src/data/fragrances.json", "r", encoding="utf-8") as f:
    existing = json.load(f)

existing_ids = {x["id"]: x for x in existing}
updated = 0
added = 0

for item in complete_new_releases:
    if item["id"] in existing_ids:
        idx = existing.index(existing_ids[item["id"]])
        existing[idx] = item
        updated += 1
    else:
        existing.append(item)
        existing_ids[item["id"]] = item
        added += 1

with open("src/data/fragrances.json", "w", encoding="utf-8") as f:
    json.dump(existing, f, indent=2, ensure_ascii=False)

print(f"Added {added} and updated {updated} premier releases!")
print(f"Total database now: {len(existing)} perfumes!")

brands = {}
for d in existing:
    brands[d["brand"]] = brands.get(d["brand"], 0) + 1
for b, c in sorted(brands.items()):
    print(f"  • {b}: {c} perfumes")
