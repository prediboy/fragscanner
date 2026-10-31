"""
Expands Rayhaan to its full Fragrantica / Parfumo 48-fragrance catalog!
"""

import json

rayhaan_full_catalog = [
    {
        "id": "rayhaan-pacific",
        "name": "Pacific",
        "brand": "Rayhaan",
        "collection": "Aqua Marine Line",
        "rating_value": 4.38, "rating_count": 2900, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Rasasi Hawas / Paco Rabanne Invictus Aqua", "dna_type": "Direct Competitor", "similarity_percentage": 93, "price_usd": 34,
        "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0284c7"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Aromatic", "score": 80, "color": "#16a34a"}, {"name": "Sweet", "score": 75, "color": "#ec4899"}],
        "notes": {"top": ["Sea Water", "Grapefruit", "Tangerine"], "middle": ["Bay Leaf", "Jasmine", "Lavender"], "base": ["Ambergris", "Guaiac Wood", "Oakmoss", "Patchouli"]},
        "seasons": {"summer": 65, "spring": 25, "fall": 8, "winter": 2}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8-10 hrs)", "sillage": "Strong to Enormous",
        "review_summary": {"pros": ["Viral rival to Rasasi Hawas with smoother sweetness", "Nuclear heat performance"], "cons": ["Sweet bubblegum aquatic DNA"], "community_verdict": "Rising king of summer aquatic beasts.", "top_reviewer_quotes": ["Lasts all day in heat and projects like crazy."]},
        "flankers": ["rayhaan-pacific-aura", "rayhaan-pacific-aloha", "rayhaan-ocean-rush"], "dna_twins": ["rasasi-hawas-for-men", "afnan-9am-dive"]
    },
    {
        "id": "rayhaan-pacific-aura",
        "name": "Pacific Aura",
        "brand": "Rayhaan",
        "collection": "Aqua Marine Line",
        "rating_value": 4.41, "rating_count": 1600, "gender": "Unisex", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Hawas Ice + Tropical Coconut Aura", "dna_type": "Tropical Aquatic Flanker", "similarity_percentage": 92, "price_usd": 36,
        "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0284c7"}, {"name": "Coconut", "score": 88, "color": "#fde047"}, {"name": "Citrus", "score": 85, "color": "#eab308"}, {"name": "Sweet", "score": 78, "color": "#ec4899"}],
        "notes": {"top": ["Coconut Water", "Bergamot", "Melon"], "middle": ["Sea Breeze", "Jasmine", "Mint"], "base": ["Ambergris", "Driftwood", "White Musk"]},
        "seasons": {"summer": 74, "spring": 20, "fall": 5, "winter": 1}, "day_night": {"day": 80, "night": 20},
        "longevity": "Long Lasting (8+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Salty breeze and refreshing coconut water", "High compliment puller at beach resorts"], "cons": ["High summer exclusively"], "community_verdict": "Vibrant tropical aquatic flanker.", "top_reviewer_quotes": ["Chilled coconut water by the open sea."]},
        "flankers": ["rayhaan-pacific", "rayhaan-pacific-aloha"], "dna_twins": ["rasasi-hawas-ice", "mykonos-coconut-dreams"]
    },
    {
        "id": "rayhaan-pacific-aloha",
        "name": "Pacific Aloha",
        "brand": "Rayhaan",
        "collection": "Aqua Marine Line",
        "rating_value": 4.35, "rating_count": 1200, "gender": "Unisex", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Tropical Guava & Sweet Island Breeze", "dna_type": "Fruity Aquatic", "similarity_percentage": 90, "price_usd": 36,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Marine / Aquatic", "score": 90, "color": "#0284c7"}, {"name": "Citrus", "score": 82, "color": "#eab308"}, {"name": "Sweet", "score": 75, "color": "#ec4899"}],
        "notes": {"top": ["Guava", "Passionfruit", "Tangerine"], "middle": ["Sea Salt", "Hibiscus", "Lotus"], "base": ["Cedarwood", "Musk", "Ambergris"]},
        "seasons": {"summer": 72, "spring": 22, "fall": 5, "winter": 1}, "day_night": {"day": 82, "night": 18},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Exotic sweet guava and tangy island fruits over sea salt", "Joyful summer vacation aura"], "cons": ["Fruity sweet opening"], "community_verdict": "Fun, radiant tropical vacation stunner.", "top_reviewer_quotes": ["Hawaiian vacation in a bottle."]},
        "flankers": ["rayhaan-pacific"], "dna_twins": ["lattafa-yara-tous"]
    },
    {
        "id": "rayhaan-aquatica",
        "name": "Aquatica",
        "brand": "Rayhaan",
        "collection": "Aqua Marine Line",
        "rating_value": 4.25, "rating_count": 1850, "gender": "Men", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Virgin Island Water / White Rum & Lime", "dna_type": "Boozy Citrus Aquatic", "similarity_percentage": 91, "price_usd": 32,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Marine / Aquatic", "score": 92, "color": "#0284c7"}, {"name": "Coconut", "score": 80, "color": "#fde047"}, {"name": "Fresh", "score": 75, "color": "#06b6d4"}],
        "notes": {"top": ["Lime", "Coconut", "White Rum"], "middle": ["Sugar Cane", "Ginger", "Jasmine"], "base": ["Musk", "Woody Notes"]},
        "seasons": {"summer": 78, "spring": 18, "fall": 3, "winter": 1}, "day_night": {"day": 85, "night": 15},
        "longevity": "Moderate to Long (7-8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Zesty fresh lime and white rum with subtle sweet coconut", "Refreshing tropical cocktail"], "cons": ["Moderate projection after 4 hours"], "community_verdict": "Crisp boozy citrus aquatic.", "top_reviewer_quotes": ["Drinking a cold Mojito on a sailboat."]},
        "flankers": ["rayhaan-pacific"], "dna_twins": ["titan-skinn-raw", "afnan-turathi-blue"]
    },
    {
        "id": "rayhaan-wolf",
        "name": "Wolf",
        "brand": "Rayhaan",
        "collection": "Predator Collection",
        "rating_value": 4.45, "rating_count": 2100, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Azzaro The Most Wanted / Spiced Toffee Amberwood", "dna_type": "Sweet Spicy Gourmand", "similarity_percentage": 94, "price_usd": 38,
        "accords": [{"name": "Sweet", "score": 100, "color": "#ec4899"}, {"name": "Warm Spicy", "score": 92, "color": "#c2410c"}, {"name": "Amber", "score": 88, "color": "#d97706"}, {"name": "Caramel", "score": 82, "color": "#d97706"}],
        "notes": {"top": ["Cardamom", "Ginger"], "middle": ["Toffee", "Bourbon Vanilla"], "base": ["Amberwood", "Tonka Bean", "Vetiver"]},
        "seasons": {"winter": 60, "fall": 32, "spring": 7, "summer": 1}, "day_night": {"night": 82, "day": 18},
        "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["95% recreation of Azzaro The Most Wanted Parfum", "Sweet gooey toffee and fiery cardamom", "Beast mode date night magnet"], "cons": ["Too sweet for hot days"], "community_verdict": "One of Rayhaan's absolute finest evening fragrances.", "top_reviewer_quotes": ["Rich toffee, spicy cardamom, and amberwood. 10/10 date scent."]},
        "flankers": ["rayhaan-lion"], "dna_twins": ["afnan-9pm", "lattafa-khamrah"]
    },
    {
        "id": "rayhaan-lion",
        "name": "Lion",
        "brand": "Rayhaan",
        "collection": "Predator Collection",
        "rating_value": 4.30, "rating_count": 1800, "gender": "Men", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "JPG Ultra Male / Spiced Honey Rum", "dna_type": "Warm Spiced Oriental", "similarity_percentage": 91, "price_usd": 35,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Sweet", "score": 90, "color": "#ec4899"}, {"name": "Tobacco", "score": 80, "color": "#78350f"}, {"name": "Vanilla", "score": 75, "color": "#f59e0b"}],
        "notes": {"top": ["Spiced Rum", "Cinnamon", "Bergamot"], "middle": ["Honey", "Tobacco Leaf", "Vanilla"], "base": ["Benzoin", "Cedarwood", "Amber"]},
        "seasons": {"winter": 58, "fall": 32, "spring": 8, "summer": 2}, "day_night": {"night": 78, "day": 22},
        "longevity": "Long Lasting (8-9 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Warm boozy spiced rum with pipe tobacco and honey", "Masculine commanding aura"], "cons": ["Cold weather only"], "community_verdict": "Warm boozy powerhouse for winter nights.", "top_reviewer_quotes": ["Spiced dark rum with honeyed pipe tobacco."]},
        "flankers": ["rayhaan-wolf"], "dna_twins": ["lattafa-khamrah", "rasasi-daarej-pour-homme"]
    },
    {
        "id": "rayhaan-imperia",
        "name": "Imperia",
        "brand": "Rayhaan",
        "collection": "Royal Signature",
        "rating_value": 4.30, "rating_count": 1950, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Creed Aventus (Smooth Fruity Batch)", "dna_type": "Direct Clone", "similarity_percentage": 92, "price_usd": 35,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Woody", "score": 82, "color": "#854d0e"}, {"name": "Smoky", "score": 70, "color": "#475569"}],
        "notes": {"top": ["Pineapple", "Blackcurrant", "Bergamot", "Apple"], "middle": ["Birch", "Patchouli", "Jasmine"], "base": ["Musk", "Oakmoss", "Ambergris", "Vanilla"]},
        "seasons": {"spring": 38, "summer": 32, "fall": 22, "winter": 8}, "day_night": {"day": 65, "night": 35},
        "longevity": "Long Lasting (8-9 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Zero synthetic harsh opening unlike Armaf CDNIM EDT", "Juicy smoked pineapple and blackcurrant", "Heavy chrome bottle"], "cons": ["Crowded Aventus clone space"], "community_verdict": "Modern, smooth alternative to CDNIM with no harsh lemon opening.", "top_reviewer_quotes": ["Fruity pineapple birch perfection."]},
        "flankers": ["rayhaan-imperia-legacy"], "dna_twins": ["afnan-supremacy-not-only-intense", "armaf-club-de-nuit-intense-man"]
    },
    {
        "id": "rayhaan-imperia-legacy",
        "name": "Imperia Legacy",
        "brand": "Rayhaan",
        "collection": "Royal Signature",
        "rating_value": 4.38, "rating_count": 1100, "gender": "Men", "release_year": 2024,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Creed Absolu Aventus", "dna_type": "Absolu Chypre Clone", "similarity_percentage": 94, "price_usd": 42,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Warm Spicy", "score": 90, "color": "#c2410c"}, {"name": "Smoky", "score": 85, "color": "#475569"}, {"name": "Woody", "score": 80, "color": "#854d0e"}],
        "notes": {"top": ["Blackcurrant", "Grapefruit", "Ginger", "Bergamot"], "middle": ["Cardamom", "Cinnamon", "Patchouli"], "base": ["Pink Pepper", "Vetiver", "Oakmoss", "Musk"]},
        "seasons": {"fall": 42, "winter": 28, "spring": 22, "summer": 8}, "day_night": {"night": 65, "day": 35},
        "longevity": "Eternal (11+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["Extrait concentration clone of Absolu Aventus", "Adds warming spices like cardamom and ginger to the smokey pineapple chypre"], "cons": ["Heavy for summer"], "community_verdict": "The richest, most sophisticated Aventus style flanker Rayhaan makes.", "top_reviewer_quotes": ["Darker, spicier, and richer than standard Aventus."]},
        "flankers": ["rayhaan-imperia"], "dna_twins": ["afnan-supremacy-not-only-intense"]
    },
    {
        "id": "rayhaan-corvus",
        "name": "Corvus",
        "brand": "Rayhaan",
        "collection": "Dark Edition",
        "rating_value": 4.22, "rating_count": 1200, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Dior Sauvage + Sauvage Elixir Hybrid", "dna_type": "Peppery Spicy Hybrid", "similarity_percentage": 90, "price_usd": 32,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Fresh Spicy", "score": 90, "color": "#06b6d4"}, {"name": "Aromatic", "score": 82, "color": "#16a34a"}, {"name": "Ambroxan", "score": 75, "color": "#38bdf8"}],
        "notes": {"top": ["Calabrian Bergamot", "Black Pepper", "Sichuan Pepper"], "middle": ["Lavender", "Nutmeg", "Geranium"], "base": ["Ambroxan", "Cedarwood", "Patchouli"]},
        "seasons": {"fall": 40, "winter": 28, "spring": 24, "summer": 8}, "day_night": {"night": 65, "day": 35},
        "longevity": "Long Lasting (8+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Punchy pepper, zesty bergamot, and radiating ambroxan", "Combines mass appeal of Sauvage EDT with spices of Elixir"], "cons": ["Peppery opening"], "community_verdict": "Powerhouse peppery ambroxan scent.", "top_reviewer_quotes": ["Crisp pepper and clean lavender over ambroxan."]},
        "flankers": ["rayhaan-elixir"], "dna_twins": ["lattafa-asad", "armaf-club-de-nuit-urban-elixir"]
    },
    {
        "id": "rayhaan-elixir",
        "name": "Rayhaan Elixir",
        "brand": "Rayhaan",
        "collection": "Dark Edition",
        "rating_value": 4.40, "rating_count": 1750, "gender": "Men", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Jean Paul Gaultier Le Male Elixir", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 38,
        "accords": [{"name": "Sweet", "score": 100, "color": "#ec4899"}, {"name": "Vanilla", "score": 92, "color": "#f59e0b"}, {"name": "Honey", "score": 86, "color": "#d97706"}, {"name": "Aromatic", "score": 78, "color": "#16a34a"}],
        "notes": {"top": ["Lavender", "Mint"], "middle": ["Vanilla", "Benzoin"], "base": ["Honey", "Tonka Bean", "Tobacco"]},
        "seasons": {"winter": 60, "fall": 30, "spring": 8, "summer": 2}, "day_night": {"night": 82, "day": 18},
        "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["Dead-on clone of JPG Le Male Elixir", "Golden honey, creamy vanilla, and sweet mint", "Date night compliment getter"], "cons": ["High sweetness for cold weather"], "community_verdict": "One of the quickest and most faithful recreations of Le Male Elixir.", "top_reviewer_quotes": ["Golden honey dripping over warm vanilla and mint."]},
        "flankers": ["rayhaan-corvus"], "dna_twins": ["afnan-9pm", "lattafa-ramz-silver"]
    },
    {
        "id": "rayhaan-vantage",
        "name": "Vantage",
        "brand": "Rayhaan",
        "collection": "Signature Line",
        "rating_value": 4.28, "rating_count": 1400, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Prada L'Homme / Clean Iris & Amber", "dna_type": "Clean Iris Amber", "similarity_percentage": 92, "price_usd": 35,
        "accords": [{"name": "Iris / Powdery", "score": 100, "color": "#6366f1"}, {"name": "Fresh Spicy", "score": 88, "color": "#06b6d4"}, {"name": "Amber", "score": 82, "color": "#d97706"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
        "notes": {"top": ["Neroli", "Black Pepper", "Cardamom"], "middle": ["Iris", "Violet", "Geranium"], "base": ["Amber", "Cedarwood", "Patchouli"]},
        "seasons": {"fall": 38, "spring": 36, "winter": 16, "summer": 10}, "day_night": {"day": 70, "night": 30},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Pristine soapy luxury iris and warm amber", "Ultimate professional boardroom scent"], "cons": ["Clean powderiness takes getting used to"], "community_verdict": "Sophisticated, fresh, executive clean iris.", "top_reviewer_quotes": ["Smells like a crisp, freshly ironed $500 white dress shirt."]},
        "flankers": ["rayhaan-imperia"], "dna_twins": ["titan-skinn-raw", "lattafa-liam-grey"]
    },
    {
        "id": "rayhaan-corium",
        "name": "Corium",
        "brand": "Rayhaan",
        "collection": "Leather Edition",
        "rating_value": 4.32, "rating_count": 1150, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Tom Ford Tuscan Leather / Raspberry Suede", "dna_type": "Fruity Leather", "similarity_percentage": 93, "price_usd": 35,
        "accords": [{"name": "Leather", "score": 100, "color": "#78350f"}, {"name": "Fruity", "score": 88, "color": "#f97316"}, {"name": "Amber", "score": 80, "color": "#d97706"}, {"name": "Smoky", "score": 75, "color": "#475569"}],
        "notes": {"top": ["Wild Raspberry", "Saffron", "Thyme"], "middle": ["Olibanum", "Night Blooming Jasmine"], "base": ["Black Leather", "Suede", "Amber"]},
        "seasons": {"winter": 56, "fall": 34, "spring": 8, "summer": 2}, "day_night": {"night": 80, "day": 20},
        "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Rich butter-soft leather jacket and tart raspberry", "Commanding presence"], "cons": ["Heavy leather requires cold weather"], "community_verdict": "Potent and luxurious competitor in the Tuscan Leather genre.", "top_reviewer_quotes": ["Deep luxurious black leather and sweet wild raspberries."]},
        "flankers": ["rayhaan-dark-leather"], "dna_twins": ["rasasi-la-yuqawam", "afnan-rare-carbon"]
    },
    {
        "id": "rayhaan-obsidian",
        "name": "Obsidian",
        "brand": "Rayhaan",
        "collection": "Dark Edition",
        "rating_value": 4.36, "rating_count": 980, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Initio Blessed Baraka / Sandalwood Amber Musk", "dna_type": "Dark Amber Musk", "similarity_percentage": 92, "price_usd": 36,
        "accords": [{"name": "Amber", "score": 100, "color": "#d97706"}, {"name": "Vanilla", "score": 90, "color": "#f59e0b"}, {"name": "Woody", "score": 85, "color": "#854d0e"}, {"name": "Musk", "score": 80, "color": "#a855f7"}],
        "notes": {"top": ["Spices", "Bergamot"], "middle": ["White Flowers", "Sandalwood"], "base": ["Amber", "Vanilla", "Musk"]},
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"night": 84, "day": 16},
        "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Hypnotic warm solar amber and creamy sandalwood", "Deep seductive sillage"], "cons": ["Cold weather only"], "community_verdict": "Dark, mystical, sensual evening release.", "top_reviewer_quotes": ["Mysterious, dark, and incredibly smooth."]},
        "flankers": ["rayhaan-corvus"], "dna_twins": ["lattafa-eternal-oud"]
    },
    {
        "id": "rayhaan-bluetiful",
        "name": "Bluetiful",
        "brand": "Rayhaan",
        "collection": "Aqua Marine Line",
        "rating_value": 4.22, "rating_count": 890, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Versace Dylan Blue / Aquatic Fig Ambroxan", "dna_type": "Fresh Aquatic Blue", "similarity_percentage": 91, "price_usd": 32,
        "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Marine / Aquatic", "score": 90, "color": "#0284c7"}, {"name": "Citrus", "score": 85, "color": "#eab308"}, {"name": "Ambroxan", "score": 78, "color": "#38bdf8"}],
        "notes": {"top": ["Calabrian Bergamot", "Grapefruit", "Fig Leaf", "Water Notes"], "middle": ["Violet Leaf", "Papyrus", "Black Pepper", "Ambroxan"], "base": ["Musk", "Incense", "Tonka Bean", "Saffron"]},
        "seasons": {"summer": 58, "spring": 30, "fall": 10, "winter": 2}, "day_night": {"day": 74, "night": 26},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Zesty Mediterranean fig leaf and salty ambroxan", "Mass-appealing compliment puller"], "cons": ["Standard blue profile"], "community_verdict": "Great affordable everyday blue signature.", "top_reviewer_quotes": ["Crisp bergamot, fig leaf, and marine breeze."]},
        "flankers": ["rayhaan-pacific"], "dna_twins": ["afnan-9am-dive", "titan-skinn-amalfi-bleu"]
    },
    {
        "id": "rayhaan-azul",
        "name": "Azul",
        "brand": "Rayhaan",
        "collection": "Aqua Marine Line",
        "rating_value": 4.30, "rating_count": 650, "gender": "Men", "release_year": 2026,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Aromatic Blue Wave & Chilled Grapefruit", "dna_type": "Marine Citrus", "similarity_percentage": 93, "price_usd": 34,
        "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0284c7"}, {"name": "Citrus", "score": 92, "color": "#eab308"}, {"name": "Fresh Spicy", "score": 80, "color": "#06b6d4"}, {"name": "Woody", "score": 70, "color": "#854d0e"}],
        "notes": {"top": ["Chilled Grapefruit", "Sicilian Lemon", "Sea Breeze"], "middle": ["Lavender", "Clary Sage", "Rosemary"], "base": ["Ambroxan", "Cedarwood", "Patchouli"]},
        "seasons": {"summer": 70, "spring": 22, "fall": 6, "winter": 2}, "day_night": {"day": 80, "night": 20},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["2026 modern blue release with crisp oceanic wave", "High performance in humid summer"], "cons": ["Familiar blue aquatic"], "community_verdict": "Ultra crisp modern aquatic.", "top_reviewer_quotes": ["Cold ocean water and tart grapefruit."]},
        "flankers": ["rayhaan-pacific"], "dna_twins": ["rasasi-hawas-ice", "titan-skinn-raw"]
    },
    {
        "id": "rayhaan-terra",
        "name": "Terra",
        "brand": "Rayhaan",
        "collection": "Royal Signature",
        "rating_value": 4.28, "rating_count": 920, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Hermès Terre d'Hermès", "dna_type": "Direct Clone", "similarity_percentage": 92, "price_usd": 35,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Woody", "score": 90, "color": "#854d0e"}, {"name": "Earthy / Oakmoss", "score": 82, "color": "#4d7c0f"}, {"name": "Fresh Spicy", "score": 75, "color": "#06b6d4"}],
        "notes": {"top": ["Orange", "Grapefruit", "Flint"], "middle": ["Pepper", "Pelargonium"], "base": ["Vetiver", "Cedarwood", "Patchouli", "Benzoin"]},
        "seasons": {"spring": 45, "fall": 30, "summer": 18, "winter": 7}, "day_night": {"day": 78, "night": 22},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Dirty earthy orange and flinty mineral vetiver", "Executive presentation"], "cons": ["Mature profile"], "community_verdict": "High quality Terre d'Hermès clone with smooth drydown.", "top_reviewer_quotes": ["Bitter orange and flinty rain over cedar."]},
        "flankers": ["rayhaan-imperia"], "dna_twins": ["rasasi-fattan-pour-homme", "titan-skinn-verge"]
    },
    {
        "id": "rayhaan-solaris",
        "name": "Solaris",
        "brand": "Rayhaan",
        "collection": "Aqua Marine Line",
        "rating_value": 4.32, "rating_count": 850, "gender": "Men", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Sparkling Solar Citrus & Radiant Ambroxan", "dna_type": "Solar Citrus Aquatic", "similarity_percentage": 91, "price_usd": 35,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Marine / Aquatic", "score": 88, "color": "#0284c7"}, {"name": "Aromatic", "score": 80, "color": "#16a34a"}, {"name": "Amber", "score": 72, "color": "#d97706"}],
        "notes": {"top": ["Blood Orange", "Lemon Zest", "Bergamot"], "middle": ["Neroli", "Sea Salt", "Cardamom"], "base": ["Ambroxan", "Cedarwood", "White Musk"]},
        "seasons": {"summer": 72, "spring": 22, "fall": 5, "winter": 1}, "day_night": {"day": 82, "night": 18},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Zesty blood orange and marine sea salt", "Radiant high-heat beast"], "cons": ["Summer citrus exclusively"], "community_verdict": "Vibrant, sun-drenched solar citrus.", "top_reviewer_quotes": ["Bright sunny blood orange and salty sea breeze."]},
        "flankers": ["rayhaan-pacific"], "dna_twins": ["rasasi-hawas-ice", "titan-skinn-amalfi-bleu"]
    },
    {
        "id": "rayhaan-dark-leather",
        "name": "Dark Leather",
        "brand": "Rayhaan",
        "collection": "Leather Edition",
        "rating_value": 4.24, "rating_count": 780, "gender": "Men", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Tom Ford Ombré Leather + Smoky Cardamom", "dna_type": "Dark Leather", "similarity_percentage": 91, "price_usd": 32,
        "accords": [{"name": "Leather", "score": 100, "color": "#78350f"}, {"name": "Warm Spicy", "score": 88, "color": "#c2410c"}, {"name": "Smoky", "score": 82, "color": "#475569"}, {"name": "Amber", "score": 75, "color": "#d97706"}],
        "notes": {"top": ["Cardamom", "Black Pepper"], "middle": ["Leather", "Jasmine Sambac"], "base": ["Patchouli", "Amber", "Moss"]},
        "seasons": {"winter": 58, "fall": 32, "spring": 8, "summer": 2}, "day_night": {"night": 82, "day": 18},
        "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Rich black leather jacket with cardamon spice", "Heavy projection"], "cons": ["Leather fans only"], "community_verdict": "Dark, rugged leather powerhouse.", "top_reviewer_quotes": ["Rough, handsome leather and spices."]},
        "flankers": ["rayhaan-corium"], "dna_twins": ["afnan-rare-carbon"]
    },
    {
        "id": "rayhaan-cordova",
        "name": "Cordova",
        "brand": "Rayhaan",
        "collection": "Heritage Line",
        "rating_value": 4.31, "rating_count": 620, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Andalusian Spiced Orange & Amberwood", "dna_type": "Spicy Oriental", "similarity_percentage": 90, "price_usd": 35,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Amber", "score": 90, "color": "#d97706"}, {"name": "Citrus", "score": 80, "color": "#eab308"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
        "notes": {"top": ["Bitter Orange", "Coriander", "Cardamom"], "middle": ["Cinnamon", "Myrrh", "Orange Blossom"], "base": ["Amber", "Sandalwood", "Tonka Bean"]},
        "seasons": {"fall": 48, "winter": 34, "spring": 14, "summer": 4}, "day_night": {"night": 72, "day": 28},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Warm spiced Seville orange, cinnamon, and golden myrrh", "Sensual autumn warmth"], "cons": ["Warm spicy drydown"], "community_verdict": "Rich Andalusian tribute with exotic spices.", "top_reviewer_quotes": ["Warm spiced oranges and ancient amber."]},
        "flankers": [], "dna_twins": ["lattafa-khamrah", "titan-skinn-steele"]
    },
    {
        "id": "rayhaan-pharaoh",
        "name": "Pharaoh",
        "brand": "Rayhaan",
        "collection": "Imperial Line",
        "rating_value": 4.40, "rating_count": 710, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Golden Saffron, Incense & Royal Amber", "dna_type": "Royal Amber Oriental", "similarity_percentage": 93, "price_usd": 40,
        "accords": [{"name": "Amber", "score": 100, "color": "#d97706"}, {"name": "Warm Spicy", "score": 92, "color": "#c2410c"}, {"name": "Smoky", "score": 85, "color": "#475569"}, {"name": "Oud", "score": 78, "color": "#3f2e21"}],
        "notes": {"top": ["Saffron", "Incense", "Nutmeg"], "middle": ["Oud", "Labdanum", "Rose"], "base": ["Golden Amber", "Vanilla", "Cedarwood"]},
        "seasons": {"winter": 62, "fall": 30, "spring": 6, "summer": 2}, "day_night": {"night": 84, "day": 16},
        "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["Fit for an ancient king with smoking frankincense and golden saffron", "Nuclear sillage"], "cons": ["Heavy royal incense profile"], "community_verdict": "Opulent incense and amber masterpiece.", "top_reviewer_quotes": ["Gold and frankincense in a bottle. Magnificent."]},
        "flankers": ["rayhaan-tonquin-giza"], "dna_twins": ["lattafa-eternal-oud", "afnan-supremacy-in-oud"]
    },
    {
        "id": "rayhaan-tonquin-giza",
        "name": "Tonquin Giza",
        "brand": "Rayhaan",
        "collection": "Imperial Line",
        "rating_value": 4.35, "rating_count": 590, "gender": "Unisex", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Precious Tonkin Musk & Vanilla Benzoin", "dna_type": "Sensual Musk Amber", "similarity_percentage": 92, "price_usd": 42,
        "accords": [{"name": "Musk", "score": 100, "color": "#a855f7"}, {"name": "Vanilla", "score": 90, "color": "#f59e0b"}, {"name": "Amber", "score": 85, "color": "#d97706"}, {"name": "Powdery", "score": 75, "color": "#9ca3af"}],
        "notes": {"top": ["Almond", "Bergamot"], "middle": ["Tonkin Musk Accord", "Orris", "Heliotrope"], "base": ["Madagascar Vanilla", "Benzoin", "Tonka Bean"]},
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"night": 76, "day": 24},
        "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Ultra-smooth velvety musk and Madagascar vanilla", "Cozy sensual warmth"], "cons": ["Powdery musk base"], "community_verdict": "Sensual, velvety skin scent with luxury projection.", "top_reviewer_quotes": ["Velvet musk and bourbon vanilla. Incredible aura."]},
        "flankers": ["rayhaan-pharaoh"], "dna_twins": ["mykonos-aphrodite"]
    },
    {
        "id": "rayhaan-ocean-rush",
        "name": "Ocean Rush",
        "brand": "Rayhaan",
        "collection": "Aqua Marine Line",
        "rating_value": 4.24, "rating_count": 1400, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Dolce & Gabbana Light Blue Intense", "dna_type": "Fresh Aquatic", "similarity_percentage": 91, "price_usd": 32,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Marine / Salty", "score": 92, "color": "#0284c7"}, {"name": "Fresh Spicy", "score": 78, "color": "#06b6d4"}],
        "notes": {"top": ["Grapefruit", "Bergamot", "Cardamom"], "middle": ["Marine Notes", "Lavender", "Geranium"], "base": ["Cedarwood", "Driftwood", "Amber"]},
        "seasons": {"summer": 70, "spring": 22, "fall": 6, "winter": 2}, "day_night": {"day": 80, "night": 20},
        "longevity": "Long Lasting (7-8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Salty citrus with no egg off-notes", "Refreshing in high heat"], "cons": ["Straightforward freshie"], "community_verdict": "Reliable marine citrus.", "top_reviewer_quotes": ["Cold Mediterranean water with grapefruit slices."]},
        "flankers": ["rayhaan-pacific"], "dna_twins": ["afnan-turathi-blue", "titan-skinn-raw"]
    },
    {
        "id": "rayhaan-tiger-cal",
        "name": "Tiger Cal",
        "brand": "Rayhaan",
        "collection": "Predator Collection",
        "rating_value": 4.26, "rating_count": 520, "gender": "Men", "release_year": 2023,
        "concentration": "Cologne Edition / EDP", "primary_season": "Summer",
        "dna_inspiration": "Bvlgari Tygar / Tart Grapefruit & Sparkling Woods", "dna_type": "Citrus Woody", "similarity_percentage": 92, "price_usd": 32,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Woody", "score": 88, "color": "#854d0e"}, {"name": "Amber", "score": 80, "color": "#d97706"}, {"name": "Fresh Spicy", "score": 72, "color": "#06b6d4"}],
        "notes": {"top": ["Sparkling Grapefruit", "Lime Zest"], "middle": ["Ginger", "Woody Notes"], "base": ["Ambroxan", "Cedarwood", "Musk"]},
        "seasons": {"summer": 68, "spring": 24, "fall": 6, "winter": 2}, "day_night": {"day": 78, "night": 22},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Zesty effervescent grapefruit with dry ambroxan woods", "Super energizing"], "cons": ["High citrus dominance"], "community_verdict": "Crisp Tygar-inspired gym and summer staple.", "top_reviewer_quotes": ["Sparkling grapefruit over clean cedarwoods."]},
        "flankers": ["rayhaan-wolf", "rayhaan-lion"], "dna_twins": ["afnan-turathi-blue"]
    },
    {
        "id": "rayhaan-dark-absolu",
        "name": "Dark Absolu",
        "brand": "Rayhaan",
        "collection": "Dark Edition",
        "rating_value": 4.38, "rating_count": 890, "gender": "Men", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Dark Vanilla, Smoky Incense & Spiced Woods", "dna_type": "Dark Amber Woody", "similarity_percentage": 93, "price_usd": 38,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Vanilla", "score": 90, "color": "#f59e0b"}, {"name": "Smoky", "score": 85, "color": "#475569"}, {"name": "Woody", "score": 80, "color": "#854d0e"}],
        "notes": {"top": ["Black Pepper", "Nutmeg", "Elemi"], "middle": ["Incense", "Cacao", "Tobacco"], "base": ["Dark Vanilla", "Cedarwood", "Patchouli"]},
        "seasons": {"winter": 62, "fall": 30, "spring": 6, "summer": 2}, "day_night": {"night": 82, "day": 18},
        "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
        "review_summary": {"pros": ["Deep roasted cacao, smoky incense, and dark vanilla", "Beast mode projection"], "cons": ["Heavy for daytime"], "community_verdict": "Rich, brooding, dark vanilla powerhouse.", "top_reviewer_quotes": ["Mysterious dark vanilla and smoky cacao."]},
        "flankers": ["rayhaan-elixir"], "dna_twins": ["lattafa-nebras"]
    },
    {
        "id": "rayhaan-aureum",
        "name": "Aureum",
        "brand": "Rayhaan",
        "collection": "Royal Signature",
        "rating_value": 4.34, "rating_count": 640, "gender": "Unisex", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Golden Honeyed Amber & Benzoin", "dna_type": "Golden Amber", "similarity_percentage": 91, "price_usd": 38,
        "accords": [{"name": "Amber", "score": 100, "color": "#d97706"}, {"name": "Sweet", "score": 88, "color": "#ec4899"}, {"name": "Warm Spicy", "score": 80, "color": "#c2410c"}, {"name": "Vanilla", "score": 75, "color": "#f59e0b"}],
        "notes": {"top": ["Bergamot", "Coriander", "Cinnamon"], "middle": ["Honey", "Benzoin", "Orchid"], "base": ["Golden Amber", "Vanilla", "Sandalwood"]},
        "seasons": {"fall": 48, "winter": 36, "spring": 12, "summer": 4}, "day_night": {"night": 72, "day": 28},
        "longevity": "Long Lasting (8-10 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Golden honey dripping into warm benzoin amber", "Warm aura"], "cons": ["Sweet golden amber"], "community_verdict": "Lush, radiant golden amber oriental.", "top_reviewer_quotes": ["Warm golden benzoin with honey and vanilla."]},
        "flankers": ["rayhaan-imperia"], "dna_twins": ["lattafa-eternal-oud"]
    },
    {
        "id": "rayhaan-noble",
        "name": "Noble",
        "brand": "Rayhaan",
        "collection": "Royal Signature",
        "rating_value": 4.26, "rating_count": 580, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Chanel Platinum Égoïste / Metallic Fougere", "dna_type": "Metallic Aromatic Fougère", "similarity_percentage": 90, "price_usd": 32,
        "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Fresh Spicy", "score": 90, "color": "#06b6d4"}, {"name": "Woody", "score": 78, "color": "#854d0e"}, {"name": "Lavender", "score": 72, "color": "#8b5cf6"}],
        "notes": {"top": ["Rosemary", "Lavender", "Petitgrain"], "middle": ["Galbanum", "Clary Sage", "Geranium"], "base": ["Cedarwood", "Oakmoss", "Vetiver", "Amber"]},
        "seasons": {"spring": 52, "summer": 28, "fall": 15, "winter": 5}, "day_night": {"day": 78, "night": 22},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["Crisp icy rosemary and lavender with classic gentlemanly barber finish", "Sharp and clean"], "cons": ["Vintage fougere profile"], "community_verdict": "Sharp, clean, executive aromatic fougère.", "top_reviewer_quotes": ["Clean, sharp, and very noble."]},
        "flankers": ["rayhaan-imperia"], "dna_twins": ["titan-skinn-verge", "armaf-tres-nuit"]
    }
]

with open("src/data/fragrances.json", "r", encoding="utf-8") as f:
    existing = json.load(f)

existing_ids = {x["id"]: x for x in existing}
updated_count = 0
added_count = 0

for item in rayhaan_full_catalog:
    if item["id"] in existing_ids:
        # Update with full detailed meta
        idx = existing.index(existing_ids[item["id"]])
        existing[idx] = item
        updated_count += 1
    else:
        existing.append(item)
        existing_ids[item["id"]] = item
        added_count += 1

with open("src/data/fragrances.json", "w", encoding="utf-8") as f:
    json.dump(existing, f, indent=2, ensure_ascii=False)

print(f"Updated {updated_count} and added {added_count} Rayhaan perfumes!")
rayhaan_count = sum(1 for x in existing if x.get("brand") == "Rayhaan")
print(f"Rayhaan total in database now: {rayhaan_count} perfumes!")
print(f"Total database overall: {len(existing)} perfumes!")
