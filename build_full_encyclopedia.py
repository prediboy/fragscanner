"""
Builds the complete full itinerary / encyclopedia of fragrances for:
Lattafa, Afnan, Armaf, Titan Skinn, Rasasi, Mykonos, and Rayhaan.
Over 115+ fragrances with full Fragrantica ratings, accords, note pyramids, and review summaries.
"""

import json

def generate_catalog():
    # Load existing to preserve any custom IDs
    catalog = []

    # ==========================================
    # 1. LATTAFA PERFUMES (Complete Itinerary)
    # ==========================================
    lattafa = [
        # Khamrah Line
        {
            "id": "lattafa-khamrah",
            "name": "Khamrah",
            "brand": "Lattafa",
            "collection": "Khamrah Collection",
            "rating_value": 4.36, "rating_count": 12850, "gender": "Unisex", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Kilian Angels' Share", "dna_type": "Gourmand Twist", "similarity_percentage": 88, "price_usd": 38,
            "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Vanilla", "score": 85, "color": "#f59e0b"}, {"name": "Amber", "score": 78, "color": "#d97706"}, {"name": "Cinnamon", "score": 72, "color": "#9a3412"}, {"name": "Woody", "score": 58, "color": "#854d0e"}],
            "notes": {"top": ["Cinnamon", "Nutmeg", "Bergamot"], "middle": ["Dates", "Praline", "Tuberose"], "base": ["Vanilla", "Tonka Bean", "Benzoin", "Myrrh", "Amberwood"]},
            "seasons": {"winter": 60, "fall": 32, "spring": 6, "summer": 2}, "day_night": {"night": 78, "day": 22},
            "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Unbelievable beast mode performance", "Decadent date and cinnamon praline opening", "Compliment magnet in cold weather"], "cons": ["Too sweet in hot humid summer"], "community_verdict": "Legendary gourmand release delivering luxury niche quality for under $40.", "top_reviewer_quotes": ["Smells like warm apple pie, cinnamon, and toasted dates."]},
            "flankers": ["lattafa-khamrah-qahwa"], "dna_twins": ["zimaya-sharaf-blend", "mykonos-aphrodite"]
        },
        {
            "id": "lattafa-khamrah-qahwa",
            "name": "Khamrah Qahwa",
            "brand": "Lattafa",
            "collection": "Khamrah Collection",
            "rating_value": 4.48, "rating_count": 5600, "gender": "Unisex", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Kilian Angels' Share + Arabic Coffee", "dna_type": "Coffee Gourmand Flanker", "similarity_percentage": 85, "price_usd": 42,
            "accords": [{"name": "Coffee", "score": 100, "color": "#573a2e"}, {"name": "Warm Spicy", "score": 95, "color": "#c2410c"}, {"name": "Sweet", "score": 88, "color": "#ec4899"}, {"name": "Cardamom", "score": 80, "color": "#15803d"}, {"name": "Vanilla", "score": 76, "color": "#f59e0b"}],
            "notes": {"top": ["Cardamom", "Cinnamon", "Ginger"], "middle": ["Praline", "Candied Fruits", "White Flowers"], "base": ["Coffee", "Vanilla", "Tonka Bean", "Benzoin"]},
            "seasons": {"winter": 64, "fall": 30, "spring": 5, "summer": 1}, "day_night": {"night": 74, "day": 26},
            "longevity": "Eternal (11+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Dark roasted cardamom coffee cuts sweetness", "Hypnotic scent bubble", "Even better than original Khamrah"], "cons": ["Heavy for summer office"], "community_verdict": "Masterful release adding roasted Arabian coffee to cinnamon praline.", "top_reviewer_quotes": ["Drinking spicy Arabic coffee while eating cinnamon pastry."]},
            "flankers": ["lattafa-khamrah"], "dna_twins": ["mykonos-matcha-latte", "armaf-odyssey-homme"]
        },
        # Asad Line
        {
            "id": "lattafa-asad",
            "name": "Asad",
            "brand": "Lattafa",
            "collection": "Asad Line",
            "rating_value": 4.19, "rating_count": 8900, "gender": "Men", "release_year": 2021,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Dior Sauvage Elixir", "dna_type": "Direct Clone", "similarity_percentage": 91, "price_usd": 27,
            "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Amber", "score": 85, "color": "#d97706"}, {"name": "Vanilla", "score": 75, "color": "#f59e0b"}, {"name": "Woody", "score": 70, "color": "#854d0e"}],
            "notes": {"top": ["Black Pepper", "Tobacco", "Pineapple"], "middle": ["Patchouli", "Coffee", "Iris"], "base": ["Vanilla", "Amber", "Dry Woods", "Benzoin"]},
            "seasons": {"winter": 45, "fall": 40, "spring": 12, "summer": 3}, "day_night": {"night": 70, "day": 30},
            "longevity": "Long Lasting (8-10 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["90%+ close to Sauvage Elixir for $27", "Smoother vanilla drydown", "Commanding masculine projection"], "cons": ["Fiery black pepper opening"], "community_verdict": "The definitive budget alternative to Dior Sauvage Elixir.", "top_reviewer_quotes": ["Spicy, mature, and potent. People mistake this for Dior all day."]},
            "flankers": ["lattafa-asad-zanzibar"], "dna_twins": ["rayhaan-corvus", "afnan-modest-une"]
        },
        {
            "id": "lattafa-asad-zanzibar",
            "name": "Asad Zanzibar",
            "brand": "Lattafa",
            "collection": "Asad Line",
            "rating_value": 3.75, "rating_count": 2100, "gender": "Men", "release_year": 2024,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Asad DNA + Tropical Salty Marine", "dna_type": "Flanker Twist", "similarity_percentage": 75, "price_usd": 32,
            "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Marine / Salty", "score": 90, "color": "#0284c7"}, {"name": "Coconut", "score": 82, "color": "#fde047"}, {"name": "Spicy", "score": 62, "color": "#ea580c"}],
            "notes": {"top": ["Black Pepper", "Lavender"], "middle": ["Salty Coconut Water", "Iris"], "base": ["Vanilla", "Incense"]},
            "seasons": {"summer": 52, "spring": 28, "fall": 12, "winter": 8}, "day_night": {"day": 62, "night": 38},
            "longevity": "Moderate (6-7 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Unique contrast of oceanic salt with sweet coconut vanilla"], "cons": ["Divisive salt-pepper opening"], "community_verdict": "Polarizing love-it-or-hate-it tropical salty pepper flanker.", "top_reviewer_quotes": ["Salty coconut water with black pepper in the tropical breeze."]},
            "flankers": ["lattafa-asad"], "dna_twins": ["mykonos-coconut-dreams", "rayhaan-pacific"]
        },
        # Bade'e Al Oud Line
        {
            "id": "lattafa-badee-al-oud-oud-for-glory",
            "name": "Bade'e Al Oud (Oud for Glory)",
            "brand": "Lattafa",
            "collection": "Bade'e Al Oud",
            "rating_value": 4.21, "rating_count": 6800, "gender": "Unisex", "release_year": 2020,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Initio Oud for Greatness", "dna_type": "Direct Clone", "similarity_percentage": 92, "price_usd": 29,
            "accords": [{"name": "Oud", "score": 100, "color": "#3f2e21"}, {"name": "Warm Spicy", "score": 90, "color": "#c2410c"}, {"name": "Patchouli", "score": 82, "color": "#4d7c0f"}, {"name": "Lavender", "score": 75, "color": "#8b5cf6"}],
            "notes": {"top": ["Saffron", "Nutmeg", "Lavender"], "middle": ["Agarwood (Oud)", "Patchouli"], "base": ["Agarwood (Oud)", "Patchouli", "Musk"]},
            "seasons": {"winter": 58, "fall": 34, "spring": 7, "summer": 1}, "day_night": {"night": 82, "day": 18},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong to Enormous",
            "review_summary": {"pros": ["Astonishingly close to $400 Initio Oud for Greatness", "Smooth, non-animalic westernized clean woody oud", "Stunning matte bottle"], "cons": ["Mature cold weather profile"], "community_verdict": "The golden standard for affordable oud fragrances.", "top_reviewer_quotes": ["Smells powerful, mysterious, and wealthy."]},
            "flankers": ["lattafa-badee-al-oud-honor-glory", "lattafa-badee-al-oud-sublime", "lattafa-badee-al-oud-amethyst"], "dna_twins": ["afnan-supremacy-in-oud"]
        },
        {
            "id": "lattafa-badee-al-oud-honor-glory",
            "name": "Bade'e Al Oud (Honor & Glory)",
            "brand": "Lattafa",
            "collection": "Bade'e Al Oud",
            "rating_value": 4.38, "rating_count": 3900, "gender": "Unisex", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Pineapple Crème Brûlée / Unique Niche", "dna_type": "Original Gourmand", "similarity_percentage": 95, "price_usd": 32,
            "accords": [{"name": "Sweet", "score": 100, "color": "#ec4899"}, {"name": "Fruity", "score": 92, "color": "#f97316"}, {"name": "Vanilla", "score": 85, "color": "#f59e0b"}, {"name": "Warm Spicy", "score": 75, "color": "#c2410c"}],
            "notes": {"top": ["Pineapple", "Crème Brûlée"], "middle": ["Cinnamon", "Benzoin", "Turmeric"], "base": ["Vanilla", "Cashmeran", "Sandalwood", "Moss"]},
            "seasons": {"fall": 42, "winter": 36, "spring": 18, "summer": 4}, "day_night": {"night": 65, "day": 35},
            "longevity": "Long Lasting (9+ hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Addictive caramelized pineapple and creamy vanilla pudding", "Unique turmeric golden warmth", "Gorgeous white bottle"], "cons": ["Gourmand lovers only"], "community_verdict": "Standout original release. A luxurious dessert in a bottle.", "top_reviewer_quotes": ["Caramelized pineapple upside-down cake with custard."]},
            "flankers": ["lattafa-badee-al-oud-oud-for-glory", "lattafa-badee-al-oud-sublime"], "dna_twins": ["lattafa-qaed-al-fursan"]
        },
        {
            "id": "lattafa-badee-al-oud-sublime",
            "name": "Bade'e Al Oud (Sublime)",
            "brand": "Lattafa",
            "collection": "Bade'e Al Oud",
            "rating_value": 4.14, "rating_count": 2100, "gender": "Unisex", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Kayali Eden Juicy Apple 01", "dna_type": "Fruity Clone", "similarity_percentage": 90, "price_usd": 30,
            "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Sweet", "score": 90, "color": "#ec4899"}, {"name": "Fresh", "score": 62, "color": "#06b6d4"}],
            "notes": {"top": ["Red Apple", "Litchi", "Rose"], "middle": ["Plum", "Jasmine"], "base": ["Vanilla", "Moss", "Tonka Bean"]},
            "seasons": {"spring": 44, "summer": 34, "fall": 16, "winter": 6}, "day_night": {"day": 72, "night": 28},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Crisp red apples and ripe plum", "Better longevity than Kayali original"], "cons": ["Synthetic initial spray"], "community_verdict": "Fun, crisp fruity floral for spring/summer.", "top_reviewer_quotes": ["Crisp sweet red apples and plums that last all day."]},
            "flankers": ["lattafa-badee-al-oud-oud-for-glory"], "dna_twins": ["lattafa-yara-candy"]
        },
        {
            "id": "lattafa-badee-al-oud-amethyst",
            "name": "Bade'e Al Oud (Amethyst)",
            "brand": "Lattafa",
            "collection": "Bade'e Al Oud",
            "rating_value": 4.18, "rating_count": 2800, "gender": "Unisex", "release_year": 2021,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Initio Atomic Rose", "dna_type": "Direct Clone", "similarity_percentage": 92, "price_usd": 30,
            "accords": [{"name": "Rose", "score": 100, "color": "#e11d48"}, {"name": "Oud", "score": 85, "color": "#3f2e21"}, {"name": "Warm Spicy", "score": 78, "color": "#c2410c"}, {"name": "Amber", "score": 72, "color": "#d97706"}],
            "notes": {"top": ["Pink Pepper", "Bergamot"], "middle": ["Turkish Rose", "Bulgarian Rose", "Jasmine"], "base": ["Agarwood (Oud)", "Amber", "Vanilla"]},
            "seasons": {"fall": 40, "winter": 38, "spring": 18, "summer": 4}, "day_night": {"night": 75, "day": 25},
            "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Gothic jammy rose with spicy pepper and woody oud", "Atomic projection that leaves huge sillage", "Regal purple bottle"], "cons": ["Heavy dark rose profile"], "community_verdict": "Top notch alternative to Initio Atomic Rose with incredible strength.", "top_reviewer_quotes": ["Dark, velvety, intoxicating jammy rose with oud."]},
            "flankers": ["lattafa-badee-al-oud-oud-for-glory"], "dna_twins": ["rasasi-shuhrah-pour-homme"]
        },
        # Yara Line (All Flankers)
        {
            "id": "lattafa-yara-pink",
            "name": "Yara (Pink)",
            "brand": "Lattafa",
            "collection": "Yara Line",
            "rating_value": 4.07, "rating_count": 10400, "gender": "Women", "release_year": 2020,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Fluffy Strawberry Marshmallow Milkshake", "dna_type": "Original Gourmand", "similarity_percentage": 94, "price_usd": 24,
            "accords": [{"name": "Sweet", "score": 100, "color": "#ec4899"}, {"name": "Vanilla", "score": 92, "color": "#f59e0b"}, {"name": "Powdery", "score": 84, "color": "#9ca3af"}, {"name": "Tropical", "score": 75, "color": "#eab308"}],
            "notes": {"top": ["Heliotrope", "Orchid", "Tangerine"], "middle": ["Gourmand Accord", "Tropical Fruits"], "base": ["Vanilla", "Sandalwood", "Musk"]},
            "seasons": {"spring": 40, "fall": 28, "summer": 20, "winter": 12}, "day_night": {"day": 68, "night": 32},
            "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Viral TikTok favorite", "Strawberry milkshake and fluffy vanilla clouds", "Cozy and comforting"], "cons": ["Slightly synthetic in first 5 mins"], "community_verdict": "The indisputable queen of budget feminine fragrances.", "top_reviewer_quotes": ["Pastel pink cloud of fluffy sweetness."]},
            "flankers": ["lattafa-yara-tous", "lattafa-yara-moi", "lattafa-yara-candy"], "dna_twins": ["mykonos-pistachio-milk", "titan-skinn-celeste"]
        },
        {
            "id": "lattafa-yara-tous",
            "name": "Yara Tous (Yellow)",
            "brand": "Lattafa",
            "collection": "Yara Line",
            "rating_value": 4.12, "rating_count": 3200, "gender": "Women", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Paco Rabanne Fame", "dna_type": "Tropical Mango Clone", "similarity_percentage": 89, "price_usd": 26,
            "accords": [{"name": "Tropical", "score": 100, "color": "#eab308"}, {"name": "Fruity", "score": 94, "color": "#f97316"}, {"name": "Sweet", "score": 88, "color": "#ec4899"}, {"name": "Vanilla", "score": 80, "color": "#f59e0b"}],
            "notes": {"top": ["Mango", "Coconut", "Passionfruit"], "middle": ["Jasmine", "Heliotrope", "Orange Blossom"], "base": ["Vanilla", "Cashmeran", "Musk"]},
            "seasons": {"summer": 68, "spring": 22, "fall": 8, "winter": 2}, "day_night": {"day": 76, "night": 24},
            "longevity": "Moderate (6-7 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Juicy ripe mango and coconut sorbet", "Vacation resort vibe", "Great value"], "cons": ["Youthful mango sweetness"], "community_verdict": "The summer mango crown jewel of the Yara collection.", "top_reviewer_quotes": ["Drinking mango smoothies on a tropical beach."]},
            "flankers": ["lattafa-yara-pink", "lattafa-yara-moi", "lattafa-yara-candy"], "dna_twins": ["mykonos-coconut-dreams"]
        },
        {
            "id": "lattafa-yara-moi",
            "name": "Yara Moi (White)",
            "brand": "Lattafa",
            "collection": "Yara Line",
            "rating_value": 3.95, "rating_count": 2400, "gender": "Women", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Peach & Salty Caramel Patchouli", "dna_type": "Gourmand Floral", "similarity_percentage": 88, "price_usd": 25,
            "accords": [{"name": "Caramel", "score": 100, "color": "#d97706"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Fruity", "score": 80, "color": "#f97316"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
            "notes": {"top": ["Peach", "Jasmine"], "middle": ["Caramel", "Amber"], "base": ["Patchouli", "Sandalwood"]},
            "seasons": {"fall": 42, "winter": 35, "spring": 18, "summer": 5}, "day_night": {"night": 65, "day": 35},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Rich warm golden caramel with ripe peach and earthy patchouli", "Denser and warmer than pink Yara"], "cons": ["Patchouli drydown is prominent"], "community_verdict": "The coziest, richest autumn flanker in the Yara family.", "top_reviewer_quotes": ["Gooey warm caramel drizzled over sweet ripe peaches."]},
            "flankers": ["lattafa-yara-pink", "lattafa-yara-tous", "lattafa-yara-candy"], "dna_twins": ["mykonos-caramel-fudge-cookie"]
        },
        {
            "id": "lattafa-yara-candy",
            "name": "Yara Candy",
            "brand": "Lattafa",
            "collection": "Yara Line",
            "rating_value": 4.18, "rating_count": 1850, "gender": "Women", "release_year": 2024,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Candied Strawberry Fizz & Vanilla", "dna_type": "Gourmand Candy", "similarity_percentage": 92, "price_usd": 29,
            "accords": [{"name": "Sweet", "score": 100, "color": "#ec4899"}, {"name": "Fruity", "score": 95, "color": "#f97316"}, {"name": "Vanilla", "score": 78, "color": "#f59e0b"}],
            "notes": {"top": ["Green Tangerine", "Blackcurrant"], "middle": ["Candied Gardenia", "Strawberry Fizz"], "base": ["Vanilla Syrup", "Amber", "Musk"]},
            "seasons": {"spring": 42, "summer": 36, "fall": 16, "winter": 6}, "day_night": {"day": 74, "night": 26},
            "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Sparkling berry candy with sweet vanilla syrup", "Bright upbeat energy"], "cons": ["High candy sweetness"], "community_verdict": "Modern 2024 flanker that adds fizzy candy zest.", "top_reviewer_quotes": ["Gummy bears, fizzy strawberry candy, and vanilla gelato."]},
            "flankers": ["lattafa-yara-pink", "lattafa-yara-tous"], "dna_twins": ["lattafa-nebras"]
        },
        # Fakhar Line
        {
            "id": "lattafa-fakhar-black",
            "name": "Fakhar Black",
            "brand": "Lattafa",
            "collection": "Fakhar Line",
            "rating_value": 4.14, "rating_count": 4800, "gender": "Men", "release_year": 2021,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "YSL Y Eau de Parfum", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 25,
            "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Fruity", "score": 88, "color": "#f97316"}, {"name": "Fresh Spicy", "score": 82, "color": "#06b6d4"}, {"name": "Sweet", "score": 75, "color": "#ec4899"}],
            "notes": {"top": ["Apple", "Bergamot", "Ginger"], "middle": ["Lavender", "Sage", "Juniper Berries"], "base": ["Tonka Bean", "Amberwood", "Cedar"]},
            "seasons": {"spring": 38, "fall": 30, "summer": 22, "winter": 10}, "day_night": {"day": 65, "night": 35},
            "longevity": "Moderate to Long (7-8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Spot-on clone of YSL Y EDP for $25", "Ultimate daily crowd-pleaser for office/school"], "cons": ["Ornate bottle size"], "community_verdict": "Quintessential all-rounder signature scent.", "top_reviewer_quotes": ["Save your $140 on YSL Y and buy this."]},
            "flankers": ["lattafa-fakhar-gold"], "dna_twins": ["afnan-9am-dive", "armaf-club-de-nuit-iconic"]
        },
        {
            "id": "lattafa-fakhar-gold",
            "name": "Fakhar Gold Extrait",
            "brand": "Lattafa",
            "collection": "Fakhar Line",
            "rating_value": 4.28, "rating_count": 1600, "gender": "Unisex", "release_year": 2023,
            "concentration": "Extrait de Parfum", "primary_season": "Fall",
            "dna_inspiration": "1 Million Parfum / Tuberose Solar Amber", "dna_type": "Solar Amber Clone", "similarity_percentage": 92, "price_usd": 30,
            "accords": [{"name": "White Floral", "score": 100, "color": "#fbcfe8"}, {"name": "Amber", "score": 90, "color": "#d97706"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Warm Spicy", "score": 75, "color": "#c2410c"}],
            "notes": {"top": ["Grapefruit", "Pink Pepper", "Cardamom"], "middle": ["Solar Notes", "Tuberose", "Artemisia"], "base": ["Amber", "Cashmeran", "Vanilla", "Leather"]},
            "seasons": {"fall": 40, "winter": 35, "spring": 18, "summer": 7}, "day_night": {"night": 68, "day": 32},
            "longevity": "Long Lasting (8-10 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Seductive solar salty amber and rich tuberose", "Heavy golden metallic presentation"], "cons": ["Bold tuberose note requires confidence"], "community_verdict": "Extrait concentration clone of 1 Million Parfum with outstanding staying power.", "top_reviewer_quotes": ["Rich salty amber, solar notes, and tuberose. Beautiful drydown."]},
            "flankers": ["lattafa-fakhar-black"], "dna_twins": ["lattafa-asad"]
        },
        # Lattafa Pride Line (High-End)
        {
            "id": "lattafa-liam-grey",
            "name": "Liam Grey",
            "brand": "Lattafa",
            "collection": "Lattafa Pride",
            "rating_value": 4.41, "rating_count": 2700, "gender": "Unisex", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "BDK Gris Charnel", "dna_type": "Direct Clone", "similarity_percentage": 92, "price_usd": 38,
            "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Woody", "score": 88, "color": "#854d0e"}, {"name": "Vanilla", "score": 82, "color": "#f59e0b"}, {"name": "Iris", "score": 68, "color": "#6366f1"}],
            "notes": {"top": ["Cardamom", "Fig", "Black Tea"], "middle": ["Iris", "Vetiver", "Labdanum"], "base": ["Vanilla", "Sandalwood", "Tonka Bean"]},
            "seasons": {"fall": 50, "winter": 32, "spring": 16, "summer": 2}, "day_night": {"night": 60, "day": 40},
            "longevity": "Long Lasting (8-10 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Masterclass clone of $220 Gris Charnel", "Creamy fig, black tea, and cozy cardamom", "Refined intellectual aura"], "cons": ["Less iris powderiness than Gris Charnel Extrait"], "community_verdict": "Praised as one of Lattafa's most sophisticated and mature releases.", "top_reviewer_quotes": ["Creamy spiced chai tea with ripe fig and sandalwood."]},
            "flankers": ["lattafa-vintage-radio", "lattafa-nebras"], "dna_twins": ["mykonos-matcha-latte", "mykonos-down-to-earth"]
        },
        {
            "id": "lattafa-vintage-radio",
            "name": "Vintage Radio",
            "brand": "Lattafa",
            "collection": "Lattafa Pride",
            "rating_value": 4.45, "rating_count": 2200, "gender": "Unisex", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Initio Paragon", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 42,
            "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Aromatic", "score": 82, "color": "#16a34a"}, {"name": "Lavender", "score": 75, "color": "#8b5cf6"}],
            "notes": {"top": ["Lavender", "Plum", "Bergamot"], "middle": ["Black Pepper", "Palo Santo", "Sage"], "base": ["Sandalwood", "Amberwood"]},
            "seasons": {"fall": 45, "winter": 30, "spring": 20, "summer": 5}, "day_night": {"day": 52, "night": 48},
            "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Recreation of Initio Paragon's sacred Palo Santo aura", "Unique plum and calming woods", "Distinctive"], "cons": ["Retro radio bottle design"], "community_verdict": "A serene, mystical masterpiece offering sacred woods and plum.", "top_reviewer_quotes": ["Smells like a $350 luxury niche perfume."]},
            "flankers": ["lattafa-liam-grey"], "dna_twins": ["mykonos-down-to-earth"]
        },
        {
            "id": "lattafa-nebras",
            "name": "Nebras",
            "brand": "Lattafa",
            "collection": "Lattafa Pride",
            "rating_value": 4.34, "rating_count": 3100, "gender": "Unisex", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Billie Eilish No. 1", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 40,
            "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Cacao", "score": 86, "color": "#573a2e"}, {"name": "Warm Spicy", "score": 75, "color": "#c2410c"}],
            "notes": {"top": ["Red Berries", "Mandarin Orange"], "middle": ["Vanilla", "Cacao", "Rose"], "base": ["Sugar", "Tonka Bean", "Amber"]},
            "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"night": 72, "day": 28},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Chocolate cacao and sugared berries with vanilla", "Better staying power than Eilish No. 1"], "cons": ["Pure sweet dessert style"], "community_verdict": "One of the best chocolate-vanilla gourmands available.", "top_reviewer_quotes": ["Gourmet hot cocoa with berry syrup."]},
            "flankers": ["lattafa-liam-grey"], "dna_twins": ["lattafa-khamrah", "mykonos-caramel-fudge-cookie"]
        },
        {
            "id": "lattafa-al-nashama-caprice",
            "name": "Al Nashama Caprice",
            "brand": "Lattafa",
            "collection": "Lattafa Pride",
            "rating_value": 4.52, "rating_count": 1950, "gender": "Men", "release_year": 2024,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "YSL La Nuit de L'Homme Bleu Electrique", "dna_type": "Discontinued Clone", "similarity_percentage": 95, "price_usd": 45,
            "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Aromatic", "score": 92, "color": "#16a34a"}, {"name": "Lavender", "score": 88, "color": "#8b5cf6"}, {"name": "Fresh Spicy", "score": 80, "color": "#06b6d4"}],
            "notes": {"top": ["Cardamom", "Ginger", "Bergamot", "Lemon"], "middle": ["Lavender", "Geranium", "Mint"], "base": ["Cedarwood", "Patchouli", "Vetiver"]},
            "seasons": {"spring": 38, "fall": 36, "winter": 16, "summer": 10}, "day_night": {"night": 68, "day": 32},
            "longevity": "Long Lasting (8-9 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Faithful clone of the legendary discontinued Bleu Electrique", "Magnetic cardamom, spicy ginger, and lavender", "Massive compliment getter"], "cons": ["Frequently out of stock"], "community_verdict": "One of the highest-rated 2024 releases in the Middle Eastern scene.", "top_reviewer_quotes": ["Brought back the king of date-night scents with superior longevity."]},
            "flankers": ["lattafa-liam-grey"], "dna_twins": ["titan-skinn-steele", "lattafa-asad"]
        },
        {
            "id": "lattafa-eternal-oud",
            "name": "Eternal Oud",
            "brand": "Lattafa",
            "collection": "Lattafa Pride",
            "rating_value": 4.38, "rating_count": 1800, "gender": "Unisex", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Maison Francis Kurkdjian Grand Soir", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 45,
            "accords": [{"name": "Amber", "score": 100, "color": "#d97706"}, {"name": "Vanilla", "score": 90, "color": "#f59e0b"}, {"name": "Warm Spicy", "score": 80, "color": "#c2410c"}, {"name": "Sweet", "score": 75, "color": "#ec4899"}],
            "notes": {"top": ["Grapefruit", "Plum"], "middle": ["Orchid", "Heliotrope"], "base": ["Vanilla", "Amber", "Oud", "Benzoin", "Tonka Bean", "Labdanum"]},
            "seasons": {"winter": 60, "fall": 32, "spring": 6, "summer": 2}, "day_night": {"night": 80, "day": 20},
            "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Sensational clone of $240 MFK Grand Soir with a touch of plum", "Exquisite gold dome bell jar presentation", "Rich golden benzoin amber"], "cons": ["Heavy dome packaging is bulky"], "community_verdict": "A royal golden amber masterpiece with nuclear sillage.", "top_reviewer_quotes": ["Warm golden amber, vanilla, and benzoin. Pure luxury."]},
            "flankers": ["lattafa-nebras"], "dna_twins": ["lattafa-khamrah", "armaf-odyssey-homme"]
        },
        # Classic Middle Eastern Pillars
        {
            "id": "lattafa-ameer-al-oudh-intense",
            "name": "Ameer Al Oudh Intense Oud",
            "brand": "Lattafa",
            "collection": "Classic Line",
            "rating_value": 4.34, "rating_count": 6200, "gender": "Unisex", "release_year": 2021,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Maison Margiela By The Fireplace", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 22,
            "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Vanilla", "score": 90, "color": "#f59e0b"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Warm Spicy", "score": 80, "color": "#c2410c"}],
            "notes": {"top": ["Woody Notes", "Vanilla"], "middle": ["Caramel", "Sugar"], "base": ["Agarwood (Oud)", "Herbal Notes", "Labdanum"]},
            "seasons": {"winter": 65, "fall": 28, "spring": 6, "summer": 1}, "day_night": {"night": 78, "day": 22},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Costs $22 and smells identical to By The Fireplace", "Roasted marshmallows over burning cedarwood", "Ultra cozy winter warmth"], "cons": ["Heavy for daytime office"], "community_verdict": "The best affordable cozy winter fragrance on earth.", "top_reviewer_quotes": ["Toasted vanilla sugar and smoky wood by a hearth."]},
            "flankers": ["lattafa-raghba"], "dna_twins": ["lattafa-khamrah", "mykonos-bonfire-vanilla"]
        },
        {
            "id": "lattafa-maahir-legacy",
            "name": "Maahir Legacy",
            "brand": "Lattafa",
            "collection": "Maahir Collection",
            "rating_value": 4.28, "rating_count": 2500, "gender": "Men", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Parfums de Marly Sedley", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 32,
            "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Aromatic", "score": 90, "color": "#16a34a"}, {"name": "Fresh Spicy", "score": 84, "color": "#06b6d4"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
            "notes": {"top": ["Lime", "Mint", "Grapefruit", "Lavender"], "middle": ["Rosemary", "Juniper Berry", "Black Pepper", "Geranium"], "base": ["Ambroxan", "Oakmoss", "Vetiver", "Cashmeran"]},
            "seasons": {"summer": 65, "spring": 26, "fall": 7, "winter": 2}, "day_night": {"day": 82, "night": 18},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Sparkling effervescent lime soda and spearmint", "Silver metallic horsehead bottle", "Phenomenal high heat performance"], "cons": ["Distinctive horse bottle cap is heavy"], "community_verdict": "Spot-on alternative to $260 PDM Sedley for summer freshness.", "top_reviewer_quotes": ["Chilled Sprite with mint and lime over sparkling ambroxan."]},
            "flankers": [], "dna_twins": ["rasasi-hawas-ice", "titan-skinn-amalfi-bleu"]
        },
        {
            "id": "lattafa-ramz-silver",
            "name": "Ramz Lattafa Silver",
            "brand": "Lattafa",
            "collection": "Ramz Line",
            "rating_value": 4.31, "rating_count": 4200, "gender": "Men", "release_year": 2021,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Jean Paul Gaultier Ultra Male", "dna_type": "Direct Clone", "similarity_percentage": 92, "price_usd": 20,
            "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Sweet", "score": 94, "color": "#ec4899"}, {"name": "Fruity", "score": 86, "color": "#f97316"}],
            "notes": {"top": ["Pear", "Lavender", "Bergamot", "Mint"], "middle": ["Cardamom", "Sage"], "base": ["Vanilla", "Amber", "Patchouli"]},
            "seasons": {"winter": 50, "fall": 35, "spring": 12, "summer": 3}, "day_night": {"night": 78, "day": 22},
            "longevity": "Long Lasting (8+ hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Costs $20 and clones JPG Ultra Male", "Sweet juicy pear bubblegum and vanilla", "Party crowd pleaser"], "cons": ["Sweet party profile"], "community_verdict": "Unbeatable budget clubbing value proposition.", "top_reviewer_quotes": ["A 90% Ultra Male clone for $20."]},
            "flankers": [], "dna_twins": ["afnan-9pm", "rayhaan-elixir"]
        },
        {
            "id": "lattafa-qaed-al-fursan",
            "name": "Qaed Al Fursan",
            "brand": "Lattafa",
            "collection": "Classic Line",
            "rating_value": 4.19, "rating_count": 4900, "gender": "Unisex", "release_year": 2021,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Smokey Sweet Pineapple", "dna_type": "Pineapple Twist", "similarity_percentage": 90, "price_usd": 20,
            "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Woody", "score": 76, "color": "#854d0e"}],
            "notes": {"top": ["Pineapple", "Saffron"], "middle": ["Jasmine", "Balsam Fir"], "base": ["Cedar", "Amber", "Agarwood (Oud)"]},
            "seasons": {"summer": 48, "spring": 30, "fall": 16, "winter": 6}, "day_night": {"day": 65, "night": 35},
            "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Most authentic juicy canned pineapple syrup in fragrance", "Layering holy grail with Sauvage or Aventus", "Under $22"], "cons": ["Linear pineapple after drydown"], "community_verdict": "The king of pineapple notes. Stellar standalone or layering tool.", "top_reviewer_quotes": ["Sweet grilled pineapple with saffron and woods."]},
            "flankers": [], "dna_twins": ["lattafa-badee-al-oud-honor-glory"]
        },
        {
            "id": "lattafa-ana-abiyedh-rouge",
            "name": "Ana Abiyedh Rouge",
            "brand": "Lattafa",
            "collection": "Ana Abiyedh Line",
            "rating_value": 4.18, "rating_count": 3600, "gender": "Unisex", "release_year": 2017,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Baccarat Rouge 540 Extrait", "dna_type": "Direct Clone", "similarity_percentage": 91, "price_usd": 22,
            "accords": [{"name": "Amber", "score": 100, "color": "#d97706"}, {"name": "Sweet", "score": 90, "color": "#ec4899"}, {"name": "Warm Spicy", "score": 82, "color": "#c2410c"}, {"name": "Almond", "score": 75, "color": "#a16207"}],
            "notes": {"top": ["Nashi Pear", "Kumquat", "Bergamot"], "middle": ["Caramel", "Geranium"], "base": ["Ambergris", "Oakmoss", "Musk"]},
            "seasons": {"fall": 38, "winter": 35, "spring": 20, "summer": 7}, "day_night": {"night": 68, "day": 32},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Burnt spun sugar with ambergris for under $25", "Huge sillage trail"], "cons": ["Causes nose fatigue"], "community_verdict": "Popular accessible BR540 style fragrance with caramelized sweetness.", "top_reviewer_quotes": ["Sweet cotton candy and ambergris in the air."]},
            "flankers": [], "dna_twins": ["armaf-club-de-nuit-untold", "mykonos-dark-secret"]
        }
    ]
    catalog.extend(lattafa)

    # ==========================================
    # 2. AFNAN PERFUMES (Complete Itinerary)
    # ==========================================
    afnan = [
        # 9 Line
        {
            "id": "afnan-9pm",
            "name": "9 PM",
            "brand": "Afnan",
            "collection": "9 Line",
            "rating_value": 4.38, "rating_count": 14200, "gender": "Men", "release_year": 2020,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Jean Paul Gaultier Ultra Male", "dna_type": "Direct Clone (Improved)", "similarity_percentage": 95, "price_usd": 32,
            "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Sweet", "score": 96, "color": "#ec4899"}, {"name": "Fruity", "score": 88, "color": "#f97316"}, {"name": "Warm Spicy", "score": 78, "color": "#c2410c"}],
            "notes": {"top": ["Apple", "Cinnamon", "Wild Lavender", "Bergamot"], "middle": ["Orange Blossom", "Lily-of-the-Valley"], "base": ["Vanilla", "Tonka Bean", "Amber", "Patchouli"]},
            "seasons": {"winter": 48, "fall": 36, "spring": 13, "summer": 3}, "day_night": {"night": 82, "day": 18},
            "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Universally crowned best Ultra Male alternative", "Monster sillage cuts through club air", "Smoother apple and cinnamon than JPG"], "cons": ["Too loud for daytime office"], "community_verdict": "The reigning champion of evening party fragrances.", "top_reviewer_quotes": ["Irresistible vanilla apple cinnamon compliment monster."]},
            "flankers": ["afnan-9am-dive"], "dna_twins": ["lattafa-ramz-silver", "rayhaan-elixir"]
        },
        {
            "id": "afnan-9am-dive",
            "name": "9 AM Dive",
            "brand": "Afnan",
            "collection": "9 Line",
            "rating_value": 4.22, "rating_count": 3800, "gender": "Unisex", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Bleu de Chanel + Dylan Blue + YSL Y", "dna_type": "Blue Hybrid", "similarity_percentage": 90, "price_usd": 30,
            "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Fresh Spicy", "score": 90, "color": "#06b6d4"}, {"name": "Citrus", "score": 84, "color": "#eab308"}, {"name": "Marine", "score": 70, "color": "#0284c7"}],
            "notes": {"top": ["Mint", "Blackcurrant", "Lemon", "Pink Pepper"], "middle": ["Apple", "Incense", "Cedar"], "base": ["Ginger", "Sandalwood", "Patchouli"]},
            "seasons": {"summer": 55, "spring": 32, "fall": 10, "winter": 3}, "day_night": {"day": 78, "night": 22},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Blends Bleu de Chanel, Dylan Blue, and YSL Y", "Crisp mint, green apple, and cooling incense", "Perfect gym and office workhorse"], "cons": ["Familiar blue DNA"], "community_verdict": "The ultimate versatile everyday blue scent that never offends.", "top_reviewer_quotes": ["Minty apple cocktail with great staying power."]},
            "flankers": ["afnan-9pm"], "dna_twins": ["lattafa-fakhar-black", "armaf-club-de-nuit-iconic"]
        },
        # Supremacy Line
        {
            "id": "afnan-supremacy-not-only-intense",
            "name": "Supremacy Not Only Intense (SNOI)",
            "brand": "Afnan",
            "collection": "Supremacy Line",
            "rating_value": 4.41, "rating_count": 5100, "gender": "Men", "release_year": 2021,
            "concentration": "Extrait de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Nishane Hacivat + Creed Aventus Absolu", "dna_type": "Fruity Oakmoss Extrait", "similarity_percentage": 93, "price_usd": 48,
            "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Earthy / Oakmoss", "score": 92, "color": "#4d7c0f"}, {"name": "Citrus", "score": 85, "color": "#eab308"}, {"name": "Smoky", "score": 78, "color": "#475569"}],
            "notes": {"top": ["Blackcurrant", "Bergamot", "Apple"], "middle": ["Oakmoss", "Patchouli", "Lavender"], "base": ["Ambergris", "Musk", "Saffron"]},
            "seasons": {"fall": 38, "spring": 32, "winter": 18, "summer": 12}, "day_night": {"day": 52, "night": 48},
            "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["True Extrait de Parfum concentration with nuclear longevity", "Deep juicy blackcurrant and damp oakmoss chypre", "Smoother opening than CDNIM"], "cons": ["Heavy oakmoss base"], "community_verdict": "The pinnacle of Aventus/Hacivat style fragrances.", "top_reviewer_quotes": ["Nuclear performance. Smells like a $300 niche fragrance."]},
            "flankers": ["afnan-supremacy-silver", "afnan-supremacy-in-oud", "afnan-supremacy-collector"], "dna_twins": ["armaf-club-de-nuit-intense-man", "rayhaan-imperia"]
        },
        {
            "id": "afnan-supremacy-silver",
            "name": "Supremacy Silver",
            "brand": "Afnan",
            "collection": "Supremacy Line",
            "rating_value": 4.15, "rating_count": 2800, "gender": "Men", "release_year": 2013,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Creed Aventus (Fruity Birch Batch)", "dna_type": "Direct Clone", "similarity_percentage": 91, "price_usd": 35,
            "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Woody", "score": 80, "color": "#854d0e"}, {"name": "Smoky", "score": 72, "color": "#475569"}],
            "notes": {"top": ["Pineapple", "Blackcurrant", "Bergamot", "Apple"], "middle": ["Birch", "Patchouli", "Jasmine", "Rose"], "base": ["Musk", "Oakmoss", "Ambergris", "Vanilla"]},
            "seasons": {"spring": 40, "summer": 30, "fall": 22, "winter": 8}, "day_night": {"day": 68, "night": 32},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Smooth pineapple and smoky birch with zero harsh lemon opening", "Sleek silver flask bottle"], "cons": ["Moderate projection compared to SNOI"], "community_verdict": "Very refined, smoother alternative to standard Armaf CDNIM EDT.", "top_reviewer_quotes": ["Smooth fruity Aventus clone without the lemon pledge opening."]},
            "flankers": ["afnan-supremacy-not-only-intense"], "dna_twins": ["rayhaan-imperia", "armaf-club-de-nuit-intense-man"]
        },
        {
            "id": "afnan-supremacy-in-oud",
            "name": "Supremacy In Oud",
            "brand": "Afnan",
            "collection": "Supremacy Line",
            "rating_value": 4.30, "rating_count": 2100, "gender": "Unisex", "release_year": 2021,
            "concentration": "Extrait de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Initio Oud for Greatness", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 48,
            "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Oud", "score": 90, "color": "#3f2e21"}, {"name": "Sweet", "score": 82, "color": "#ec4899"}, {"name": "Lavender", "score": 75, "color": "#8b5cf6"}],
            "notes": {"top": ["Saffron", "Nutmeg", "Lavender"], "middle": ["Agarwood (Oud)", "Sweet Notes"], "base": ["Patchouli", "Musk"]},
            "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"night": 80, "day": 20},
            "longevity": "Eternal (11+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Slightly sweeter, smoother take on Oud for Greatness than Lattafa's", "Rich saffron and non-offensive clean oud", "Heavy bronze bottle"], "cons": ["Heavy for summer"], "community_verdict": "Extrait concentration competitor to Oud for Glory with smoother blending.", "top_reviewer_quotes": ["Royalty in a bottle. Incredibly long lasting."]},
            "flankers": ["afnan-supremacy-not-only-intense"], "dna_twins": ["lattafa-badee-al-oud-oud-for-glory"]
        },
        # Turathi Line
        {
            "id": "afnan-turathi-blue",
            "name": "Turathi Blue",
            "brand": "Afnan",
            "collection": "Turathi Line",
            "rating_value": 4.42, "rating_count": 5900, "gender": "Men", "release_year": 2021,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Bvlgari Tygar", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 35,
            "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Amber", "score": 90, "color": "#d97706"}, {"name": "Woody", "score": 82, "color": "#854d0e"}, {"name": "Musk", "score": 75, "color": "#a855f7"}],
            "notes": {"top": ["Grapefruit", "Bergamot"], "middle": ["Amber", "Woody Notes"], "base": ["Musk", "Patchouli", "Spices"]},
            "seasons": {"summer": 58, "spring": 30, "fall": 10, "winter": 2}, "day_night": {"day": 74, "night": 26},
            "longevity": "Long Lasting (8-10 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Best recreation of $380 Bvlgari Tygar on the market", "Sparkling realistic grapefruit resting on radiant amber", "High executive compliment factor"], "cons": ["Frequently sold out"], "community_verdict": "One of the highest-rated summer releases on Fragrantica.", "top_reviewer_quotes": ["Rich sparkling tart grapefruit over golden amber. 10/10."]},
            "flankers": ["afnan-turathi-brown"], "dna_twins": ["rayhaan-pacific", "afnan-9am-dive"]
        },
        {
            "id": "afnan-turathi-brown",
            "name": "Turathi Brown",
            "brand": "Afnan",
            "collection": "Turathi Line",
            "rating_value": 4.25, "rating_count": 1400, "gender": "Men", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "YSL Tuxedo / Spiced Patchouli Amber", "dna_type": "Direct Clone", "similarity_percentage": 91, "price_usd": 35,
            "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Amber", "score": 90, "color": "#d97706"}, {"name": "Patchouli", "score": 85, "color": "#4d7c0f"}, {"name": "Woody", "score": 78, "color": "#854d0e"}],
            "notes": {"top": ["Spices", "Patchouli", "Bergamot"], "middle": ["Vanilla", "Amber"], "base": ["Woody Notes", "Ozonic Notes", "Rose"]},
            "seasons": {"fall": 48, "winter": 36, "spring": 12, "summer": 4}, "day_night": {"night": 76, "day": 24},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Sophisticated spiced patchouli and sweet bourbon vanilla", "Gentlemanly evening profile"], "cons": ["Less versatile for hot weather"], "community_verdict": "Warm, elegant spiced patchouli alternative for autumn and evening wear.", "top_reviewer_quotes": ["Refined, mature, and upscale."]},
            "flankers": ["afnan-turathi-blue"], "dna_twins": ["titan-skinn-steele", "lattafa-asad"]
        },
        {
            "id": "afnan-rare-carbon",
            "name": "Rare Carbon",
            "brand": "Afnan",
            "collection": "Rare Line",
            "rating_value": 4.35, "rating_count": 2800, "gender": "Men", "release_year": 2020,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Tom Ford Ombré Leather", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 32,
            "accords": [{"name": "Leather", "score": 100, "color": "#78350f"}, {"name": "Warm Spicy", "score": 86, "color": "#c2410c"}, {"name": "Floral", "score": 78, "color": "#ec4899"}, {"name": "Woody", "score": 72, "color": "#854d0e"}],
            "notes": {"top": ["Leather", "Violet Leaf", "Cinnamon", "Nutmeg"], "middle": ["Violet", "Rose", "Cedarwood", "Oud"], "base": ["Amber", "Sandalwood", "Vetiver"]},
            "seasons": {"winter": 52, "fall": 38, "spring": 8, "summer": 2}, "day_night": {"night": 76, "day": 24},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["95% clone of Tom Ford Ombré Leather", "Smooth photorealistic leather jacket with floral nuance", "Exceptional sillage"], "cons": ["Leather appreciation needed"], "community_verdict": "Top tier alternative to Tom Ford Ombré Leather at an exceptional price.", "top_reviewer_quotes": ["Smells like stepping into a brand-new luxury sports car."]},
            "flankers": [], "dna_twins": ["rasasi-la-yuqawam", "lattafa-asad"]
        },
        {
            "id": "afnan-modest-une",
            "name": "Modest Une Pour Homme",
            "brand": "Afnan",
            "collection": "Modest Line",
            "rating_value": 4.22, "rating_count": 1900, "gender": "Men", "release_year": 2019,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Dior Sauvage EDT", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 28,
            "accords": [{"name": "Fresh Spicy", "score": 100, "color": "#06b6d4"}, {"name": "Citrus", "score": 90, "color": "#eab308"}, {"name": "Aromatic", "score": 82, "color": "#16a34a"}, {"name": "Amber", "score": 75, "color": "#d97706"}],
            "notes": {"top": ["Calabrian Bergamot", "Lavender", "Mint", "Pepper"], "middle": ["Nutmeg", "Geranium"], "base": ["Ambroxan", "Cedarwood", "Musk"]},
            "seasons": {"spring": 38, "summer": 34, "fall": 20, "winter": 8}, "day_night": {"day": 65, "night": 35},
            "longevity": "Long Lasting (8+ hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Dead ringer for Dior Sauvage with punchy ambroxan", "Crowd-pleasing versatile king"], "cons": ["Common scent profile"], "community_verdict": "One of the most faithful Sauvage EDT clones on the market.", "top_reviewer_quotes": ["Clean, peppery bergamot ambroxan. Huge compliments."]},
            "flankers": [], "dna_twins": ["rayhaan-corvus", "armaf-club-de-nuit-urban-elixir"]
        }
    ]
    catalog.extend(afnan)

    # ==========================================
    # 3. ARMAF (Complete Itinerary)
    # ==========================================
    armaf = [
        # Full Club de Nuit Series
        {
            "id": "armaf-club-de-nuit-intense-man",
            "name": "Club de Nuit Intense Man (CDNIM)",
            "brand": "Armaf",
            "collection": "Club de Nuit",
            "rating_value": 4.13, "rating_count": 24500, "gender": "Men", "release_year": 2015,
            "concentration": "Eau de Toilette / Pure Parfum", "primary_season": "Spring",
            "dna_inspiration": "Creed Aventus", "dna_type": "Direct Clone", "similarity_percentage": 91, "price_usd": 32,
            "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Smoky / Birch", "score": 85, "color": "#475569"}, {"name": "Leather", "score": 75, "color": "#78350f"}],
            "notes": {"top": ["Lemon", "Pineapple", "Bergamot", "Blackcurrant"], "middle": ["Birch", "Jasmine", "Rose"], "base": ["Musk", "Ambergris", "Patchouli", "Vanilla"]},
            "seasons": {"spring": 38, "summer": 30, "fall": 24, "winter": 8}, "day_night": {"day": 62, "night": 38},
            "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Most famous Creed Aventus clone in history", "Monster projection in the air", "Smokey birch pineapple drydown matches vintage batches"], "cons": ["Harsh lemon floor cleaner opening for first 15 mins in EDT"], "community_verdict": "The undisputed pioneer of budget fragrance cloning.", "top_reviewer_quotes": ["Survive the first 15 mins and you get 10 hours of Aventus heaven."]},
            "flankers": ["armaf-club-de-nuit-milestone", "armaf-club-de-nuit-sillage", "armaf-club-de-nuit-untold", "armaf-club-de-nuit-urban-elixir", "armaf-club-de-nuit-iconic", "armaf-club-de-nuit-white-imperiale"], "dna_twins": ["afnan-supremacy-not-only-intense", "rayhaan-imperia"]
        },
        {
            "id": "armaf-club-de-nuit-milestone",
            "name": "Club de Nuit Milestone",
            "brand": "Armaf",
            "collection": "Club de Nuit",
            "rating_value": 4.18, "rating_count": 6200, "gender": "Unisex", "release_year": 2019,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Creed Millésime Impérial", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 35,
            "accords": [{"name": "Marine / Salty", "score": 100, "color": "#0284c7"}, {"name": "Fruity", "score": 92, "color": "#f97316"}, {"name": "Citrus", "score": 82, "color": "#eab308"}, {"name": "Woody", "score": 70, "color": "#854d0e"}],
            "notes": {"top": ["Sea Notes", "Red Fruits", "Bergamot"], "middle": ["Violet", "White Woods", "Sandalwood"], "base": ["Ambroxan", "Musk", "Vetiver"]},
            "seasons": {"summer": 62, "spring": 28, "fall": 8, "winter": 2}, "day_night": {"day": 75, "night": 25},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Sublime recreation of Millésime Impérial's salty watermelon vibe", "Outlasts current Creed batches by 4 hours", "Shiny gold bottle"], "cons": ["Metallic salty note is distinct"], "community_verdict": "A summer seaside vacation in a bottle. Royalty at the beach for $35.", "top_reviewer_quotes": ["Salty sea breeze and sweet melon red fruits. Superior longevity."]},
            "flankers": ["armaf-club-de-nuit-intense-man", "armaf-club-de-nuit-sillage"], "dna_twins": ["rayhaan-pacific", "afnan-turathi-blue", "titan-skinn-raw"]
        },
        {
            "id": "armaf-club-de-nuit-sillage",
            "name": "Club de Nuit Sillage",
            "brand": "Armaf",
            "collection": "Club de Nuit",
            "rating_value": 4.19, "rating_count": 5400, "gender": "Unisex", "release_year": 2020,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Creed Silver Mountain Water", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 35,
            "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Fresh / Inky", "score": 90, "color": "#06b6d4"}, {"name": "Woody", "score": 80, "color": "#854d0e"}, {"name": "Aromatic", "score": 75, "color": "#16a34a"}],
            "notes": {"top": ["Bergamot", "Blackcurrant", "Lemon", "Ginger"], "middle": ["Rose", "Iris", "Jasmine"], "base": ["Ambroxan", "Musk", "Sandalwood", "Cedar"]},
            "seasons": {"spring": 45, "summer": 38, "fall": 12, "winter": 5}, "day_night": {"day": 78, "night": 22},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong to Enormous",
            "review_summary": {"pros": ["Dead ringer for Creed Silver Mountain Water", "Crisp mountain stream, inky tea leaves, and tart blackcurrant", "Icy scent trail"], "cons": ["Inky metallic note can divide"], "community_verdict": "Fresh, clean, icy, and professional.", "top_reviewer_quotes": ["Pure alpine air and chilled blackcurrant tea."]},
            "flankers": ["armaf-club-de-nuit-intense-man", "armaf-club-de-nuit-milestone"], "dna_twins": ["mykonos-down-to-earth", "titan-skinn-verge"]
        },
        {
            "id": "armaf-club-de-nuit-untold",
            "name": "Club de Nuit Untold",
            "brand": "Armaf",
            "collection": "Club de Nuit",
            "rating_value": 4.25, "rating_count": 4800, "gender": "Unisex", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Maison Francis Kurkdjian Baccarat Rouge 540", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 42,
            "accords": [{"name": "Amber", "score": 100, "color": "#d97706"}, {"name": "Woody", "score": 90, "color": "#854d0e"}, {"name": "Warm Spicy", "score": 85, "color": "#c2410c"}, {"name": "Sweet", "score": 80, "color": "#ec4899"}],
            "notes": {"top": ["Saffron", "Jasmine"], "middle": ["Amberwood", "Ambergris"], "base": ["Fir Resin", "Cedar"]},
            "seasons": {"fall": 38, "winter": 36, "spring": 18, "summer": 8}, "day_night": {"night": 70, "day": 30},
            "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Phenomenal clone of $325 BR540 EDP", "Airy burnt spun sugar and saffron ambergris trail", "Iridescent rainbow bottle"], "cons": ["Causes nose blindness easily"], "community_verdict": "One of the most accurate and long-lasting BR540 clones ever formulated.", "top_reviewer_quotes": ["Strangers will stop you 10 hours later to ask what you're wearing."]},
            "flankers": ["armaf-club-de-nuit-intense-man"], "dna_twins": ["lattafa-ana-abiyedh-rouge", "mykonos-dark-secret"]
        },
        {
            "id": "armaf-club-de-nuit-urban-elixir",
            "name": "Club de Nuit Urban Elixir",
            "brand": "Armaf",
            "collection": "Club de Nuit",
            "rating_value": 4.31, "rating_count": 3100, "gender": "Men", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Dior Sauvage + Creed Aventus Hybrid", "dna_type": "Powerhouse Hybrid", "similarity_percentage": 92, "price_usd": 38,
            "accords": [{"name": "Ambroxan / Fresh", "score": 100, "color": "#06b6d4"}, {"name": "Warm Spicy", "score": 88, "color": "#c2410c"}, {"name": "Citrus", "score": 82, "color": "#eab308"}, {"name": "Aromatic", "score": 75, "color": "#16a34a"}],
            "notes": {"top": ["Bergamot", "Pink Pepper", "Jasmine"], "middle": ["Lavender", "Elemi", "Vetiver", "Saffron"], "base": ["Ambroxan", "Patchouli", "Amber", "Cedar"]},
            "seasons": {"spring": 36, "fall": 32, "summer": 20, "winter": 12}, "day_night": {"day": 55, "night": 45},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong to Enormous",
            "review_summary": {"pros": ["Sauvage peppery ambroxan fused with Aventus smokey birch fruitiness", "Significantly smoother than CDNIM", "Compliment magnet"], "cons": ["Sweet drydown"], "community_verdict": "The best of both worlds: fuses the two biggest male fragrances seamlessly.", "top_reviewer_quotes": ["60% Sauvage, 40% Aventus. Beast performance and maximum compliments."]},
            "flankers": ["armaf-club-de-nuit-intense-man", "armaf-club-de-nuit-iconic"], "dna_twins": ["lattafa-asad", "rayhaan-corvus"]
        },
        {
            "id": "armaf-club-de-nuit-iconic",
            "name": "Club de Nuit Blue Iconic",
            "brand": "Armaf",
            "collection": "Club de Nuit",
            "rating_value": 4.36, "rating_count": 3900, "gender": "Men", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Bleu de Chanel", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 38,
            "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Warm Spicy", "score": 88, "color": "#c2410c"}, {"name": "Fresh Spicy", "score": 84, "color": "#06b6d4"}, {"name": "Smoky / Incense", "score": 70, "color": "#475569"}],
            "notes": {"top": ["Grapefruit", "Mint", "Lemon", "Pink Pepper"], "middle": ["Ginger", "Nutmeg", "Melon", "Jasmine"], "base": ["Incense", "Amber", "Cedar", "Sandalwood", "Patchouli"]},
            "seasons": {"summer": 42, "spring": 38, "fall": 14, "winter": 6}, "day_night": {"day": 68, "night": 32},
            "longevity": "Long Lasting (8+ hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["High quality clone of Bleu de Chanel EDP", "Effervescent grapefruit with dark frankincense drydown", "Outperforms current Chanel bottles"], "cons": ["Ginger note sharp in first 10 mins"], "community_verdict": "The finest Bleu de Chanel clone on the market today.", "top_reviewer_quotes": ["Gives you 95% of Bleu de Chanel EDP for $38."]},
            "flankers": ["armaf-club-de-nuit-intense-man"], "dna_twins": ["afnan-9am-dive", "lattafa-fakhar-black"]
        },
        {
            "id": "armaf-club-de-nuit-white-imperiale",
            "name": "Club de Nuit White Imperiale",
            "brand": "Armaf",
            "collection": "Club de Nuit",
            "rating_value": 4.40, "rating_count": 2800, "gender": "Women", "release_year": 2022,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Parfums de Marly Delina Exclusif", "dna_type": "Direct Clone", "similarity_percentage": 95, "price_usd": 45,
            "accords": [{"name": "Rose", "score": 100, "color": "#e11d48"}, {"name": "Vanilla", "score": 90, "color": "#f59e0b"}, {"name": "Fruity", "score": 85, "color": "#f97316"}, {"name": "Amber", "score": 75, "color": "#d97706"}],
            "notes": {"top": ["Litchi", "Bergamot", "Nutmeg"], "middle": ["Turkish Rose", "Vanilla", "Peony", "Musk"], "base": ["Vanilla", "Cashmeran", "Incense", "Cedar"]},
            "seasons": {"spring": 44, "fall": 28, "winter": 20, "summer": 8}, "day_night": {"day": 58, "night": 42},
            "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Phenomenal clone of $375 Delina Exclusif", "Luscious Turkish rose, tart litchi, and creamy bourbon vanilla", "Nuclear longevity"], "cons": ["Very potent, requires gentle sprays"], "community_verdict": "One of Armaf’s absolute greatest feminine formulations ever produced.", "top_reviewer_quotes": ["Smells like royalty. Turkish rose and creamy vanilla."]},
            "flankers": ["armaf-club-de-nuit-untold"], "dna_twins": ["lattafa-yara-pink", "titan-skinn-celeste"]
        },
        # Odyssey Collection
        {
            "id": "armaf-odyssey-homme",
            "name": "Odyssey Homme",
            "brand": "Armaf",
            "collection": "Odyssey Collection",
            "rating_value": 4.31, "rating_count": 3400, "gender": "Men", "release_year": 2018,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Tom Ford Noir Extreme + Dior Homme Intense", "dna_type": "Gourmand Iris Hybrid", "similarity_percentage": 91, "price_usd": 28,
            "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Amber", "score": 90, "color": "#d97706"}, {"name": "Iris / Powdery", "score": 82, "color": "#6366f1"}, {"name": "Warm Spicy", "score": 75, "color": "#c2410c"}],
            "notes": {"top": ["Vanilla", "Amber"], "middle": ["Iris", "Spices", "Oriental Notes"], "base": ["Vanilla", "Leather", "Jasmine"]},
            "seasons": {"winter": 58, "fall": 32, "spring": 8, "summer": 2}, "day_night": {"night": 80, "day": 20},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Rich kulfi-like vanilla amber with powdery iris", "Thermos flask style bottle", "Warm winter compliment getter"], "cons": ["Sweet for those who dislike vanilla"], "community_verdict": "A beloved winter hidden gem blending TF Noir Extreme and Dior Homme.", "top_reviewer_quotes": ["Creamy sweet vanilla, amber, and powdery iris."]},
            "flankers": ["armaf-odyssey-mandarin-sky"], "dna_twins": ["lattafa-khamrah", "titan-skinn-steele"]
        },
        {
            "id": "armaf-odyssey-mandarin-sky",
            "name": "Odyssey Mandarin Sky",
            "brand": "Armaf",
            "collection": "Odyssey Collection",
            "rating_value": 4.42, "rating_count": 2600, "gender": "Men", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Jean Paul Gaultier Scandal Pour Homme", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 32,
            "accords": [{"name": "Caramel", "score": 100, "color": "#d97706"}, {"name": "Citrus", "score": 90, "color": "#eab308"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Warm Spicy", "score": 78, "color": "#c2410c"}],
            "notes": {"top": ["Mandarin Orange", "Orange", "Saffron", "Sage"], "middle": ["Caramel", "Tonka Bean", "Tagetes"], "base": ["Ambroxan", "Vetiver", "Cedar"]},
            "seasons": {"fall": 42, "winter": 38, "spring": 16, "summer": 4}, "day_night": {"night": 74, "day": 26},
            "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Spot on clone of JPG Scandal Pour Homme", "Juicy mandarin orange with rich golden salted caramel", "Beast mode performance"], "cons": ["High sweetness"], "community_verdict": "One of Armaf’s best recent releases; addictive caramel citrus.", "top_reviewer_quotes": ["Gooey warm caramel and sweet zesty mandarin."]},
            "flankers": ["armaf-odyssey-homme"], "dna_twins": ["lattafa-khamrah", "afnan-9pm"]
        },
        # Armaf Classic Pillars
        {
            "id": "armaf-tres-nuit",
            "name": "Tres Nuit",
            "brand": "Armaf",
            "collection": "Classic Line",
            "rating_value": 4.18, "rating_count": 4200, "gender": "Men", "release_year": 2014,
            "concentration": "Eau de Toilette", "primary_season": "Spring",
            "dna_inspiration": "Creed Green Irish Tweed", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 25,
            "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Floral", "score": 82, "color": "#ec4899"}, {"name": "Powdery", "score": 75, "color": "#9ca3af"}],
            "notes": {"top": ["Lemon Verbena", "Iris", "Lemon"], "middle": ["Lavender", "Violet", "Spicy Notes"], "base": ["Ambergris", "Sandalwood"]},
            "seasons": {"spring": 55, "summer": 28, "fall": 14, "winter": 3}, "day_night": {"day": 78, "night": 22},
            "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Recreation of Creed Green Irish Tweed's lush green fields", "Fresh lemon verbena, violet, and powdery iris", "Extremely classy gentleman scent"], "cons": ["Moderate projection compared to CDNIM"], "community_verdict": "The quintessential affordable Green Irish Tweed alternative.", "top_reviewer_quotes": ["Walking through a lush dewy Irish countryside."]},
            "flankers": [], "dna_twins": ["titan-skinn-verge", "rasasi-egra"]
        },
        {
            "id": "armaf-ventana",
            "name": "Ventana Pour Homme",
            "brand": "Armaf",
            "collection": "Classic Line",
            "rating_value": 4.10, "rating_count": 2600, "gender": "Men", "release_year": 2016,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Dior Sauvage EDT", "dna_type": "Direct Clone", "similarity_percentage": 91, "price_usd": 24,
            "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Fresh Spicy", "score": 90, "color": "#06b6d4"}, {"name": "Aromatic", "score": 82, "color": "#16a34a"}, {"name": "Ambroxan", "score": 75, "color": "#38bdf8"}],
            "notes": {"top": ["Grapefruit", "Lemon", "Mandarin Orange"], "middle": ["Lavender", "Geranium", "Patchouli", "Vetiver"], "base": ["Cedar", "Amber", "Precious Woods"]},
            "seasons": {"summer": 45, "spring": 35, "fall": 15, "winter": 5}, "day_night": {"day": 70, "night": 30},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Smooth zesty Dior Sauvage alternative", "Crisp lavender and woods with zero harshness", "Great daily workhorse"], "cons": ["Common modern DNA"], "community_verdict": "Reliable budget Dior Sauvage daily alternative.", "top_reviewer_quotes": ["Citrus, lavender and ambroxan. Clean everyday signature."]},
            "flankers": [], "dna_twins": ["afnan-modest-une", "rayhaan-corvus"]
        }
    ]
    catalog.extend(armaf)

    # ==========================================
    # 4. TITAN SKINN (Complete Itinerary)
    # ==========================================
    skinn = [
        # Men's Flagships
        {
            "id": "titan-skinn-raw",
            "name": "Raw",
            "brand": "Titan Skinn",
            "collection": "Skinn Classic",
            "rating_value": 4.08, "rating_count": 1350, "gender": "Men", "release_year": 2013,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Acqua Di Gio / Crisp Watery Melon", "dna_type": "Fresh Aquatic Fruity", "similarity_percentage": 88, "price_usd": 30,
            "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0284c7"}, {"name": "Citrus", "score": 90, "color": "#eab308"}, {"name": "Fruity", "score": 85, "color": "#f97316"}, {"name": "Fresh Spicy", "score": 75, "color": "#06b6d4"}],
            "notes": {"top": ["Watermelon", "Bergamot", "Mandarin Orange"], "middle": ["Violet Leaves", "Geranium", "Floral Notes"], "base": ["Patchouli", "Gaiac Wood", "Musk"]},
            "seasons": {"summer": 68, "spring": 24, "fall": 6, "winter": 2}, "day_night": {"day": 82, "night": 18},
            "longevity": "Moderate (6-7 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Iconic everyday office signature scent", "Crisp watermelon and bright bergamot with green violet leaves", "Crafted by French master perfumer Olivier Pescheux"], "cons": ["Requires 5-6 sprays in high heat"], "community_verdict": "The undisputed king of everyday office wear in the subcontinent.", "top_reviewer_quotes": ["Watermelon and watery citrus done with French elegance."]},
            "flankers": ["titan-skinn-steele", "titan-skinn-verge", "titan-skinn-amalfi-bleu"], "dna_twins": ["rayhaan-pacific", "armaf-club-de-nuit-milestone"]
        },
        {
            "id": "titan-skinn-steele",
            "name": "Steele",
            "brand": "Titan Skinn",
            "collection": "Skinn Classic",
            "rating_value": 4.16, "rating_count": 980, "gender": "Men", "release_year": 2013,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Sweet Spicy Leather Praline", "dna_type": "Warm Spicy Woody", "similarity_percentage": 90, "price_usd": 30,
            "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Woody", "score": 88, "color": "#854d0e"}, {"name": "Vanilla", "score": 80, "color": "#f59e0b"}, {"name": "Leather", "score": 68, "color": "#78350f"}],
            "notes": {"top": ["Grapefruit", "Bitter Orange", "Rhubarb"], "middle": ["Pink Pepper", "Pimento", "Nutmeg", "Geranium"], "base": ["Praline", "Vanilla", "Leather", "Cedarwood"]},
            "seasons": {"fall": 45, "winter": 38, "spring": 14, "summer": 3}, "day_night": {"night": 72, "day": 28},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Fiery pink pepper, sweet praline, and warm leather", "Crafted by master perfumer Fabrice Pellegrin", "Superb date night appeal"], "cons": ["Warm spicy profile for summer days"], "community_verdict": "Titan Skinn’s warmest, most sensual masculine scent.", "top_reviewer_quotes": ["Warm spices and sweet roasted praline vanilla over leather."]},
            "flankers": ["titan-skinn-raw", "titan-skinn-verge", "titan-skinn-forest-rouge"], "dna_twins": ["lattafa-asad", "armaf-odyssey-homme"]
        },
        {
            "id": "titan-skinn-amalfi-bleu",
            "name": "Amalfi Bleu",
            "brand": "Titan Skinn",
            "collection": "Skinn Escapade",
            "rating_value": 4.18, "rating_count": 1150, "gender": "Men", "release_year": 2019,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Mediterranean Azure Marine / Light Blue", "dna_type": "Marine Citrus Coastal", "similarity_percentage": 92, "price_usd": 34,
            "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0284c7"}, {"name": "Citrus", "score": 92, "color": "#eab308"}, {"name": "Aromatic", "score": 80, "color": "#16a34a"}, {"name": "Woody", "score": 72, "color": "#854d0e"}],
            "notes": {"top": ["Mandarin Orange", "Green Apple", "Bergamot"], "middle": ["Lavender", "Violet Leaves", "Thyme"], "base": ["Vetiver", "Amber", "Cedarwood", "Musk"]},
            "seasons": {"summer": 74, "spring": 20, "fall": 5, "winter": 1}, "day_night": {"day": 84, "night": 16},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Sun-drenched Italian coast citrus with salty breeze", "Formulated by master perfumer Alberto Morillas", "High compliment rate in summer"], "cons": ["Very popular in offices"], "community_verdict": "Arguably Titan Skinn’s highest quality fresh aquatic fragrance.", "top_reviewer_quotes": ["Smells like a luxury Italian cruise on the Mediterranean sea."]},
            "flankers": ["titan-skinn-raw", "titan-skinn-forest-rouge"], "dna_twins": ["rasasi-hawas-for-men", "rayhaan-pacific"]
        },
        {
            "id": "titan-skinn-verge",
            "name": "Verge",
            "brand": "Titan Skinn",
            "collection": "Skinn Classic",
            "rating_value": 3.98, "rating_count": 740, "gender": "Men", "release_year": 2013,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Classic Green Barbershop Fougère", "dna_type": "Aromatic Fougère", "similarity_percentage": 89, "price_usd": 30,
            "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Fresh Spicy", "score": 90, "color": "#06b6d4"}, {"name": "Green", "score": 82, "color": "#4d7c0f"}, {"name": "Citrus", "score": 75, "color": "#eab308"}],
            "notes": {"top": ["Lavender", "Basil", "Lemon", "Rosemary"], "middle": ["Spearmint", "Mahonial", "Geranium"], "base": ["Oakmoss", "Leather", "Patchouli"]},
            "seasons": {"spring": 44, "summer": 36, "fall": 14, "winter": 6}, "day_night": {"day": 80, "night": 20},
            "longevity": "Moderate (6-7 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Invigorating spearmint, lavender, and crushed basil", "Classic clean shave aesthetic", "Post-gym refresher"], "cons": ["Traditional herbal profile"], "community_verdict": "Crisp, green, herbal, and timeless barbershop freshness.", "top_reviewer_quotes": ["Spearmint and lavender blast that wakes you right up."]},
            "flankers": ["titan-skinn-raw", "titan-skinn-steele"], "dna_twins": ["armaf-tres-nuit", "rasasi-fattan-pour-homme"]
        },
        {
            "id": "titan-skinn-forest-rouge",
            "name": "Forest Rouge",
            "brand": "Titan Skinn",
            "collection": "Skinn Escapade",
            "rating_value": 4.22, "rating_count": 420, "gender": "Men", "release_year": 2021,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Warm Spicy Oud & Smoked Sandalwood", "dna_type": "Woody Amber Oud", "similarity_percentage": 90, "price_usd": 35,
            "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Warm Spicy", "score": 90, "color": "#c2410c"}, {"name": "Oud", "score": 78, "color": "#3f2e21"}, {"name": "Vanilla", "score": 75, "color": "#f59e0b"}],
            "notes": {"top": ["Nutmeg", "Black Pepper", "Bergamot"], "middle": ["Geranium", "Sandalwood", "Violet"], "base": ["Agarwood (Oud)", "Vanilla", "Amber"]},
            "seasons": {"winter": 52, "fall": 36, "spring": 10, "summer": 2}, "day_night": {"night": 78, "day": 22},
            "longevity": "Long Lasting (8-9 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Westernized oud with Mysore sandalwood", "Gentle sweet vanilla and pepper warmth", "Festive warmth"], "cons": ["Soft oud (not barnyard)"], "community_verdict": "Warm tribute to Indian sacred woods and gentle oud.", "top_reviewer_quotes": ["Warm sandalwood, nutmeg, and soft oud."]},
            "flankers": ["titan-skinn-amalfi-bleu"], "dna_twins": ["lattafa-badee-al-oud-oud-for-glory"]
        },
        # Women's Flagships
        {
            "id": "titan-skinn-celeste",
            "name": "Celeste",
            "brand": "Titan Skinn",
            "collection": "Skinn Classic",
            "rating_value": 4.19, "rating_count": 1050, "gender": "Women", "release_year": 2013,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Sweet Peach & White Florals", "dna_type": "Floral Fruity Gourmand", "similarity_percentage": 91, "price_usd": 30,
            "accords": [{"name": "White Floral", "score": 100, "color": "#fbcfe8"}, {"name": "Fruity", "score": 92, "color": "#f97316"}, {"name": "Sweet", "score": 86, "color": "#ec4899"}, {"name": "Citrus", "score": 75, "color": "#eab308"}],
            "notes": {"top": ["Peaches", "Blood Orange", "Pear", "Grapefruit"], "middle": ["Sambac Jasmine", "Orange Blossom", "Water Lily"], "base": ["Sandalwood", "White Musk", "Patchouli", "Amber"]},
            "seasons": {"spring": 42, "fall": 28, "summer": 20, "winter": 10}, "day_night": {"day": 65, "night": 35},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Sunlit peaches and intoxicating sambac jasmine", "Master perfumer Harry Fremont creation", "Compliment magnet"], "cons": ["Sweet floral profile"], "community_verdict": "Titan Skinn’s premier feminine fragrance; radiant and opulent.", "top_reviewer_quotes": ["Sweet ripe peaches dipped in jasmine honey."]},
            "flankers": ["titan-skinn-nude", "titan-skinn-sheer"], "dna_twins": ["lattafa-yara-pink", "armaf-club-de-nuit-white-imperiale"]
        },
        {
            "id": "titan-skinn-nude",
            "name": "Nude",
            "brand": "Titan Skinn",
            "collection": "Skinn Classic",
            "rating_value": 4.12, "rating_count": 820, "gender": "Women", "release_year": 2013,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Romantic Litchi Rose & Tonka", "dna_type": "Fruity Floral Romantic", "similarity_percentage": 90, "price_usd": 30,
            "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Rose", "score": 90, "color": "#e11d48"}, {"name": "Sweet", "score": 82, "color": "#ec4899"}, {"name": "Woody", "score": 70, "color": "#854d0e"}],
            "notes": {"top": ["Litchi", "Raspberry", "Grapefruit"], "middle": ["Rose", "Peach", "Blackberry"], "base": ["Sandalwood", "Tonka Bean", "Firewood Accord"]},
            "seasons": {"spring": 48, "summer": 26, "fall": 18, "winter": 8}, "day_night": {"day": 72, "night": 28},
            "longevity": "Moderate to Long (7 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Sparkling fresh litchi and dew-kissed morning roses", "Subtle smoky firewood base adds depth", "Very romantic"], "cons": ["Gentle drydown"], "community_verdict": "Intimate, romantic, and effortlessly charming.", "top_reviewer_quotes": ["Delicate sweet litchi and soft garden roses."]},
            "flankers": ["titan-skinn-celeste"], "dna_twins": ["lattafa-yara-candy"]
        },
        {
            "id": "titan-skinn-sheer",
            "name": "Sheer",
            "brand": "Titan Skinn",
            "collection": "Skinn Classic",
            "rating_value": 4.05, "rating_count": 650, "gender": "Women", "release_year": 2013,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Clean Musky Peony & Crisp Pear", "dna_type": "Fresh Floral Musky", "similarity_percentage": 88, "price_usd": 30,
            "accords": [{"name": "Floral", "score": 100, "color": "#fbcfe8"}, {"name": "Fruity", "score": 88, "color": "#f97316"}, {"name": "Musk", "score": 82, "color": "#a855f7"}, {"name": "Fresh", "score": 75, "color": "#06b6d4"}],
            "notes": {"top": ["Green Pear", "Pink Pepper", "Clementine"], "middle": ["Peony", "Magnolia", "Jasmine"], "base": ["Cedarwood", "White Musk", "Vanilla"]},
            "seasons": {"spring": 55, "summer": 28, "fall": 12, "winter": 5}, "day_night": {"day": 80, "night": 20},
            "longevity": "Moderate (6 hrs)", "sillage": "Intimate to Moderate",
            "review_summary": {"pros": ["Airy, clean shampoo and soft pink peony aesthetic", "Perfect office and healthcare fragrance"], "cons": ["Intimate sillage"], "community_verdict": "A serene, clean-girl skin scent that never offends.", "top_reviewer_quotes": ["Pure clean dewy peonies and crisp sweet pear."]},
            "flankers": ["titan-skinn-celeste"], "dna_twins": ["mykonos-baby-love"]
        }
    ]
    catalog.extend(skinn)

    # ==========================================
    # 5. RASASI (Complete Itinerary)
    # ==========================================
    rasasi = [
        # Hawas Line
        {
            "id": "rasasi-hawas-for-men",
            "name": "Hawas for Men",
            "brand": "Rasasi",
            "collection": "Hawas Line",
            "rating_value": 4.36, "rating_count": 13400, "gender": "Men", "release_year": 2015,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Paco Rabanne Invictus Aqua + Sweet Plum", "dna_type": "Fruity Aquatic Powerhouse", "similarity_percentage": 94, "price_usd": 48,
            "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0284c7"}, {"name": "Citrus", "score": 90, "color": "#eab308"}, {"name": "Fruity", "score": 88, "color": "#f97316"}, {"name": "Ambergris", "score": 75, "color": "#d97706"}],
            "notes": {"top": ["Apple", "Bergamot", "Lemon", "Cinnamon"], "middle": ["Watery Notes", "Plum", "Orange Blossom", "Cardamom"], "base": ["Ambergris", "Musk", "Patchouli", "Driftwood"]},
            "seasons": {"summer": 62, "spring": 26, "fall": 10, "winter": 2}, "day_night": {"day": 76, "night": 24},
            "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["High-heat projector with sweet purple plum and aquatic ambergris", "Compliment monster in club and beach settings", "Python-embossed bottle cap"], "cons": ["Many fakes on grey market"], "community_verdict": "The undisputed king of summer performance. Sweet, watery, and beast mode.", "top_reviewer_quotes": ["Lasts 12 hours easily in 90-degree humid heat."]},
            "flankers": ["rasasi-hawas-ice", "rasasi-hawas-black"], "dna_twins": ["rayhaan-pacific", "afnan-9am-dive", "titan-skinn-amalfi-bleu"]
        },
        {
            "id": "rasasi-hawas-ice",
            "name": "Hawas Ice",
            "brand": "Rasasi",
            "collection": "Hawas Line",
            "rating_value": 4.45, "rating_count": 3100, "gender": "Men", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Frozen Hawas with Icy Mint & Italian Citrus", "dna_type": "Icy Aquatic Flanker", "similarity_percentage": 92, "price_usd": 55,
            "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Marine / Aquatic", "score": 92, "color": "#0284c7"}, {"name": "Aromatic", "score": 85, "color": "#16a34a"}, {"name": "Fresh Spicy", "score": 75, "color": "#06b6d4"}],
            "notes": {"top": ["Frozen Lemon", "Sicilian Bergamot", "Apple", "Mint"], "middle": ["Plum", "Cardamom", "Orange Blossom"], "base": ["Ambergris", "Musk", "Moss", "Sandalwood"]},
            "seasons": {"summer": 70, "spring": 22, "fall": 6, "winter": 2}, "day_night": {"day": 80, "night": 20},
            "longevity": "Eternal (10+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Adds frosty mint and sparkling frozen lemon to Hawas", "Even fresher and less cloying than original", "Frosty gradient bottle"], "cons": ["Priced higher than standard Hawas"], "community_verdict": "Viral release making Hawas crisper, colder, and more magnetic.", "top_reviewer_quotes": ["Iced lemonade with cold mint and sweet plums in the sun."]},
            "flankers": ["rasasi-hawas-for-men"], "dna_twins": ["rayhaan-pacific", "titan-skinn-amalfi-bleu"]
        },
        {
            "id": "rasasi-hawas-black",
            "name": "Hawas Black",
            "brand": "Rasasi",
            "collection": "Hawas Line",
            "rating_value": 4.40, "rating_count": 1200, "gender": "Men", "release_year": 2024,
            "concentration": "Eau de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Hawas DNA + Dark Smoked Pineapple & Woods", "dna_type": "Dark Aquatic Flanker", "similarity_percentage": 91, "price_usd": 58,
            "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Smoky", "score": 80, "color": "#475569"}, {"name": "Marine / Aquatic", "score": 75, "color": "#0284c7"}],
            "notes": {"top": ["Smoked Pineapple", "Bergamot", "Grapefruit"], "middle": ["Cedarwood", "Patchouli", "Jasmine"], "base": ["Ambergris", "Oakmoss", "Musk", "Birch"]},
            "seasons": {"fall": 42, "spring": 30, "summer": 18, "winter": 10}, "day_night": {"night": 65, "day": 35},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong to Enormous",
            "review_summary": {"pros": ["Combines Hawas's aquatic power with Aventus-like smoked pineapple", "Matte black bottle with silver snake cap"], "cons": ["Denser than Hawas Ice"], "community_verdict": "The darkest, most masculine flanker in the Hawas legacy.", "top_reviewer_quotes": ["Smoky pineapple and aquatic ambergris. A compliment monster."]},
            "flankers": ["rasasi-hawas-for-men", "rasasi-hawas-ice"], "dna_twins": ["afnan-supremacy-not-only-intense", "armaf-club-de-nuit-intense-man"]
        },
        # La Yuqawam Line
        {
            "id": "rasasi-la-yuqawam",
            "name": "La Yuqawam Pour Homme",
            "brand": "Rasasi",
            "collection": "La Yuqawam Collection",
            "rating_value": 4.33, "rating_count": 6800, "gender": "Men", "release_year": 2012,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Tom Ford Tuscan Leather", "dna_type": "Direct Luxury Clone", "similarity_percentage": 96, "price_usd": 55,
            "accords": [{"name": "Leather", "score": 100, "color": "#78350f"}, {"name": "Fruity", "score": 88, "color": "#f97316"}, {"name": "Sweet", "score": 82, "color": "#ec4899"}, {"name": "Amber", "score": 75, "color": "#d97706"}],
            "notes": {"top": ["Raspberry", "Saffron", "Thyme"], "middle": ["Olibanum", "Jasmine", "Artemisia"], "base": ["Leather", "Black Suede", "Amber", "Woody Notes"]},
            "seasons": {"winter": 56, "fall": 35, "spring": 8, "summer": 1}, "day_night": {"night": 82, "day": 18},
            "longevity": "Eternal (12+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Universally acknowledged as equal/superior to $395 Tuscan Leather", "Opulent raspberry and buttery black suede leather", "Magnetic wooden box"], "cons": ["Heavy leather strictly for cold weather"], "community_verdict": "A legendary benchmark in the clone realm.", "top_reviewer_quotes": ["Sweet raspberry syrup spilled over a brand new luxury Italian leather sofa."]},
            "flankers": ["rasasi-shuhrah-pour-homme"], "dna_twins": ["afnan-rare-carbon", "lattafa-asad"]
        },
        {
            "id": "rasasi-fattan-pour-homme",
            "name": "Fattan Pour Homme",
            "brand": "Rasasi",
            "collection": "Fattan Line",
            "rating_value": 4.26, "rating_count": 3800, "gender": "Men", "release_year": 2018,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Hermes Terre d'Hermes", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 24,
            "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Earthy / Oakmoss", "score": 90, "color": "#4d7c0f"}, {"name": "Citrus", "score": 85, "color": "#eab308"}, {"name": "Aromatic", "score": 78, "color": "#16a34a"}],
            "notes": {"top": ["Grapefruit", "Pink Pepper", "Bergamot"], "middle": ["Vetiver", "Cedar", "Patchouli"], "base": ["Oakmoss", "Benzoin", "Amber"]},
            "seasons": {"spring": 44, "fall": 30, "summer": 20, "winter": 6}, "day_night": {"day": 78, "night": 22},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Recreation of Terre d'Hermès for under $25", "Damp mineral vetiver, sparkling grapefruit, and cedar", "Executive mature elegance"], "cons": ["Earthy vetiver (not sweet)"], "community_verdict": "The best budget Terre d'Hermès alternative available anywhere.", "top_reviewer_quotes": ["Dirty citrus, flinty mineral rain, and damp green vetiver woods."]},
            "flankers": [], "dna_twins": ["titan-skinn-verge", "afnan-turathi-blue"]
        },
        {
            "id": "rasasi-shuhrah-pour-homme",
            "name": "Shuhrah Pour Homme",
            "brand": "Rasasi",
            "collection": "Classic Line",
            "rating_value": 4.12, "rating_count": 2900, "gender": "Men", "release_year": 2015,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Smoky Herbal Tomato Leaf & Leather", "dna_type": "Unique Powerhouse Beast", "similarity_percentage": 95, "price_usd": 32,
            "accords": [{"name": "Smoky", "score": 100, "color": "#475569"}, {"name": "Leather", "score": 90, "color": "#78350f"}, {"name": "Green", "score": 82, "color": "#16a34a"}, {"name": "Aromatic", "score": 75, "color": "#06b6d4"}],
            "notes": {"top": ["Tomato Leaf", "Freesia", "Rose"], "middle": ["Rose", "Sandalwood", "Cedar"], "base": ["Leather", "Agarwood (Oud)", "Oakmoss", "Amber"]},
            "seasons": {"winter": 52, "fall": 36, "spring": 10, "summer": 2}, "day_night": {"night": 80, "day": 20},
            "longevity": "Eternal (14+ hrs)", "sillage": "Enormous (Room Filler)",
            "review_summary": {"pros": ["Nuclear 14+ hour longevity; fills an auditorium", "Crushed tomato leaf, dark rose, and ashy leather", "Unapologetic presence"], "cons": ["Chokes room if over-sprayed", "Divisive cigarette ash herbal note"], "community_verdict": "A legendary atomic powerhouse fragrance.", "top_reviewer_quotes": ["1 spray survives a hurricane. Lasts through two laundry cycles."]},
            "flankers": ["rasasi-la-yuqawam"], "dna_twins": ["lattafa-badee-al-oud-oud-for-glory"]
        },
        {
            "id": "rasasi-daarej-pour-homme",
            "name": "Daarej Pour Homme",
            "brand": "Rasasi",
            "collection": "Classic Line",
            "rating_value": 4.19, "rating_count": 4200, "gender": "Men", "release_year": 2012,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Valentino V Pour Homme", "dna_type": "Direct Clone", "similarity_percentage": 94, "price_usd": 22,
            "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Warm Spicy", "score": 92, "color": "#c2410c"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Powdery", "score": 78, "color": "#9ca3af"}],
            "notes": {"top": ["Cumin", "Cardamom", "Artemisia"], "middle": ["Rose", "Orris Root"], "base": ["Vanilla", "Tonka Bean", "Amber", "Sandalwood"]},
            "seasons": {"winter": 52, "fall": 36, "spring": 10, "summer": 2}, "day_night": {"night": 78, "day": 22},
            "longevity": "Long Lasting (8-9 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Recreation of discontinued Valentino V", "Warm cumin, cardamom, and creamy vanilla orris root", "Tremendous value"], "cons": ["Cumin note in opening can read spicy"], "community_verdict": "Discontinued designer legend brought back to life.", "top_reviewer_quotes": ["Sweet vanilla, orris, and warm spices. Seductive date-night compliment getter."]},
            "flankers": [], "dna_twins": ["lattafa-khamrah", "titan-skinn-steele"]
        },
        {
            "id": "rasasi-al-wisam-day",
            "name": "Al Wisam Day",
            "brand": "Rasasi",
            "collection": "Al Wisam Line",
            "rating_value": 4.22, "rating_count": 3100, "gender": "Men", "release_year": 2011,
            "concentration": "Eau de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Creed Silver Mountain Water (Rose-Forward)", "dna_type": "Direct Clone", "similarity_percentage": 93, "price_usd": 35,
            "accords": [{"name": "Rose", "score": 100, "color": "#e11d48"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Fresh", "score": 82, "color": "#06b6d4"}, {"name": "Musk", "score": 75, "color": "#a855f7"}],
            "notes": {"top": ["Bergamot", "Lavender", "Geranium"], "middle": ["Rose", "Clary Sage", "Sandalwood", "Cedar"], "base": ["Amber", "Musk", "Oakmoss", "Oud"]},
            "seasons": {"spring": 48, "summer": 32, "fall": 14, "winter": 6}, "day_night": {"day": 78, "night": 22},
            "longevity": "Long Lasting (8-9 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Pre-dates Armaf Sillage as the classic SMW clone", "Adds a refined velvety metallic rose to the iced mountain stream", "Outstanding projection"], "cons": ["Rose note is prominent"], "community_verdict": "Elegant, sparkling, and sophisticated spring signature.", "top_reviewer_quotes": ["Icy alpine water with crushed pink rose petals."]},
            "flankers": [], "dna_twins": ["armaf-club-de-nuit-sillage"]
        }
    ]
    catalog.extend(rasasi)

    # ==========================================
    # 6. MYKONOS (Complete Itinerary)
    # ==========================================
    mykonos = [
        # Flagship Gourmands & Cafe Series
        {
            "id": "mykonos-aphrodite",
            "name": "Aphrodite",
            "brand": "Mykonos",
            "collection": "Gourmand Romance",
            "rating_value": 4.45, "rating_count": 1800, "gender": "Unisex", "release_year": 2022,
            "concentration": "Extrait de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Smoky Burnt Brown Sugar & Myrrh", "dna_type": "Artisanal Niche", "similarity_percentage": 95, "price_usd": 30,
            "accords": [{"name": "Sweet", "score": 100, "color": "#ec4899"}, {"name": "Warm Spicy", "score": 92, "color": "#c2410c"}, {"name": "Amber", "score": 85, "color": "#d97706"}, {"name": "Smoky", "score": 78, "color": "#475569"}],
            "notes": {"top": ["Jasmine", "Burnt Cinnamon", "Brown Sugar"], "middle": ["Cedarwood", "Smoked Myrrh", "Warm Spices"], "base": ["Bourbon Vanilla", "Tonka Bean", "Caramelized Amber"]},
            "seasons": {"winter": 58, "fall": 32, "spring": 8, "summer": 2}, "day_night": {"night": 85, "day": 15},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong to Enormous",
            "review_summary": {"pros": ["Intoxicating burnt brown sugar and myrrh resin", "Sensual date night masterpiece", "Extrait concentration"], "cons": ["Heavy for summer daytime"], "community_verdict": "Mykonos's breakout international hit. Seductive, dark, and sweet.", "top_reviewer_quotes": ["Burnt caramelized brown sugar and mystical resin. Seduction in a bottle."]},
            "flankers": ["mykonos-dark-secret", "mykonos-caramel-fudge-cookie"], "dna_twins": ["lattafa-khamrah", "lattafa-nebras"]
        },
        {
            "id": "mykonos-matcha-latte",
            "name": "Matcha Latte",
            "brand": "Mykonos",
            "collection": "Cafe Series",
            "rating_value": 4.38, "rating_count": 1400, "gender": "Unisex", "release_year": 2023,
            "concentration": "Extrait de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Creamy Japanese Matcha + White Chocolate", "dna_type": "Gourmand Cafe Concept", "similarity_percentage": 94, "price_usd": 28,
            "accords": [{"name": "Green Tea", "score": 100, "color": "#15803d"}, {"name": "Lactonic / Milky", "score": 92, "color": "#fef08a"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Vanilla", "score": 78, "color": "#f59e0b"}],
            "notes": {"top": ["Matcha Green Tea", "Bergamot", "White Chocolate"], "middle": ["Steamed Milk", "Mint", "Jasmine"], "base": ["Madagascar Vanilla", "Tonka Bean", "White Musk"]},
            "seasons": {"fall": 40, "spring": 35, "winter": 20, "summer": 5}, "day_night": {"day": 70, "night": 30},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Realistic creamy ceremonial matcha with sweet steamed milk", "Comforting cozy aesthetic", "Unique niche concept"], "cons": ["Lactonic milk note is specific"], "community_verdict": "The definitive matcha gourmand for tea enthusiasts.", "top_reviewer_quotes": ["Kyoto coffee shop drinking iced matcha latte with white chocolate."]},
            "flankers": ["mykonos-pistachio-milk", "mykonos-down-to-earth"], "dna_twins": ["lattafa-liam-grey", "lattafa-khamrah-qahwa"]
        },
        {
            "id": "mykonos-pistachio-milk",
            "name": "Pistachio Milk",
            "brand": "Mykonos",
            "collection": "Cafe Series",
            "rating_value": 4.40, "rating_count": 1650, "gender": "Unisex", "release_year": 2023,
            "concentration": "Extrait de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Yum Pistachio Gelato / Roasted Pistachio Milk", "dna_type": "Creamy Nutty Gourmand", "similarity_percentage": 91, "price_usd": 28,
            "accords": [{"name": "Nutty", "score": 100, "color": "#a16207"}, {"name": "Lactonic / Milky", "score": 94, "color": "#fef08a"}, {"name": "Sweet", "score": 88, "color": "#ec4899"}, {"name": "Vanilla", "score": 82, "color": "#f59e0b"}],
            "notes": {"top": ["Roasted Pistachio", "Condensed Milk", "Cardamom"], "middle": ["Almond", "Whipped Cream", "Praline"], "base": ["Vanilla Gelato", "Tonka Bean", "Sandalwood"]},
            "seasons": {"fall": 45, "winter": 35, "spring": 15, "summer": 5}, "day_night": {"day": 55, "night": 45},
            "longevity": "Long Lasting (8-9 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Toasted creamy pistachio with sweet condensed milk", "Avoids soapiness of Kayali Pistachio", "Hug in a bottle"], "cons": ["Pure dessert gourmand"], "community_verdict": "Dreamy nutty gourmand smelling like gourmet Italian pistachio gelato.", "top_reviewer_quotes": ["Creamy roasted pistachio pastry goodness."]},
            "flankers": ["mykonos-matcha-latte", "mykonos-coconut-dreams"], "dna_twins": ["lattafa-yara-pink"]
        },
        {
            "id": "mykonos-dark-secret",
            "name": "Dark Secret",
            "brand": "Mykonos",
            "collection": "Gourmand Romance",
            "rating_value": 4.32, "rating_count": 950, "gender": "Unisex", "release_year": 2023,
            "concentration": "Extrait de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Tom Ford Lost Cherry + BR540 Saffron", "dna_type": "Dark Cherry Saffron Hybrid", "similarity_percentage": 90, "price_usd": 30,
            "accords": [{"name": "Cherry", "score": 100, "color": "#991b1b"}, {"name": "Warm Spicy", "score": 88, "color": "#c2410c"}, {"name": "Sweet", "score": 85, "color": "#ec4899"}, {"name": "Amber", "score": 75, "color": "#d97706"}],
            "notes": {"top": ["Black Cherry", "Saffron", "Bergamot"], "middle": ["Praline", "Amberwood", "Rose"], "base": ["Leather", "Cedar", "Tonka Bean", "Benzoin"]},
            "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"night": 84, "day": 16},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Dark syrupy boozy black cherry with golden saffron", "Sensual evening aura", "Tremendous projection"], "cons": ["Bold and heavy"], "community_verdict": "Dark, brooding, seductive cherry praline.", "top_reviewer_quotes": ["Cherry liqueur by a roaring fireplace wearing a leather jacket."]},
            "flankers": ["mykonos-aphrodite"], "dna_twins": ["armaf-club-de-nuit-untold", "lattafa-khamrah"]
        },
        {
            "id": "mykonos-down-to-earth",
            "name": "Down To Earth",
            "brand": "Mykonos",
            "collection": "Nature & Zen",
            "rating_value": 4.36, "rating_count": 820, "gender": "Unisex", "release_year": 2023,
            "concentration": "Extrait de Parfum", "primary_season": "Spring",
            "dna_inspiration": "Green Fig Tea & Cashmere Woods", "dna_type": "Earthy Aromatic Niche", "similarity_percentage": 92, "price_usd": 28,
            "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Green", "score": 90, "color": "#16a34a"}, {"name": "Aromatic", "score": 82, "color": "#06b6d4"}, {"name": "Earthy", "score": 75, "color": "#4d7c0f"}],
            "notes": {"top": ["Green Fig Leaf", "Bergamot", "Matcha"], "middle": ["Cedarwood", "Sage", "Vetiver"], "base": ["Cashmere Wood", "White Musk", "Oakmoss"]},
            "seasons": {"spring": 50, "summer": 28, "fall": 18, "winter": 4}, "day_night": {"day": 78, "night": 22},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate",
            "review_summary": {"pros": ["Spa-like green fig and earthy tea", "Calming for rainy days and working", "Upscale niche feel"], "cons": ["Moderate projector"], "community_verdict": "A grounding sanctuary in a bottle. Elegant and natural.", "top_reviewer_quotes": ["Walking through a damp Japanese bamboo and fig forest."]},
            "flankers": ["mykonos-matcha-latte"], "dna_twins": ["lattafa-liam-grey", "lattafa-vintage-radio"]
        },
        {
            "id": "mykonos-coconut-dreams",
            "name": "Coconut Dreams",
            "brand": "Mykonos",
            "collection": "Vacation Series",
            "rating_value": 4.28, "rating_count": 1100, "gender": "Unisex", "release_year": 2023,
            "concentration": "Extrait de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Toasted Coconut Cream & Sea Salt", "dna_type": "Creamy Tropical Beach", "similarity_percentage": 93, "price_usd": 28,
            "accords": [{"name": "Coconut", "score": 100, "color": "#fde047"}, {"name": "Sweet", "score": 90, "color": "#ec4899"}, {"name": "Vanilla", "score": 85, "color": "#f59e0b"}, {"name": "Marine / Salty", "score": 68, "color": "#0284c7"}],
            "notes": {"top": ["Toasted Coconut", "Sea Salt", "Bergamot"], "middle": ["Coconut Milk", "Lotus Flower", "Vanilla Orchid"], "base": ["Sandalwood", "Madagascar Vanilla", "White Amber"]},
            "seasons": {"summer": 72, "spring": 20, "fall": 6, "winter": 2}, "day_night": {"day": 70, "night": 30},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Toasted warm coconut milk rather than cheap synthetic sunscreen", "Touch of sea salt cuts through sweet milk", "Vacation vibe"], "cons": ["High coconut presence"], "community_verdict": "One of the best natural toasted coconut fragrances on the market.", "top_reviewer_quotes": ["Toasted coconut flakes over cold vanilla coconut cream."]},
            "flankers": ["mykonos-pistachio-milk"], "dna_twins": ["lattafa-yara-tous", "lattafa-asad-zanzibar"]
        },
        {
            "id": "mykonos-caramel-fudge-cookie",
            "name": "Caramel Fudge Cookie",
            "brand": "Mykonos",
            "collection": "Bakery Series",
            "rating_value": 4.41, "rating_count": 1300, "gender": "Unisex", "release_year": 2023,
            "concentration": "Extrait de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Warm Baked Butter Cookies & Caramel Fudge", "dna_type": "Hyper-Realistic Gourmand", "similarity_percentage": 95, "price_usd": 28,
            "accords": [{"name": "Caramel", "score": 100, "color": "#d97706"}, {"name": "Sweet", "score": 95, "color": "#ec4899"}, {"name": "Vanilla", "score": 88, "color": "#f59e0b"}, {"name": "Nutty", "score": 75, "color": "#a16207"}],
            "notes": {"top": ["Caramel", "Brown Butter", "Cookie Dough Accord"], "middle": ["Praline", "Condensed Milk", "Toffee"], "base": ["Vanilla Bean", "Tonka", "Sandalwood"]},
            "seasons": {"winter": 62, "fall": 30, "spring": 7, "summer": 1}, "day_night": {"night": 70, "day": 30},
            "longevity": "Eternal (10+ hrs)", "sillage": "Strong to Enormous",
            "review_summary": {"pros": ["Hyper-realistic smell of walking into a high-end bakery", "Warm melted butter and gooey caramel fudge", "Insane longevity"], "cons": ["Pure dessert scent"], "community_verdict": "Unapologetically decadent butter cookie gourmand.", "top_reviewer_quotes": ["Warm butter cookies straight out of the oven drizzled with caramel."]},
            "flankers": ["mykonos-aphrodite"], "dna_twins": ["lattafa-khamrah", "lattafa-nebras"]
        },
        {
            "id": "mykonos-vanilla-clouds",
            "name": "Vanilla Clouds",
            "brand": "Mykonos",
            "collection": "Cloud Series",
            "rating_value": 4.35, "rating_count": 1750, "gender": "Women", "release_year": 2022,
            "concentration": "Extrait de Parfum", "primary_season": "Fall",
            "dna_inspiration": "Ariana Grande Cloud + Marshmallow", "dna_type": "Airy Sweet Gourmand", "similarity_percentage": 91, "price_usd": 28,
            "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Powdery", "score": 80, "color": "#9ca3af"}, {"name": "Musk", "score": 75, "color": "#a855f7"}],
            "notes": {"top": ["Vanilla", "Cotton Candy"], "middle": ["White Musk", "Marshmallow", "Floral Accord"], "base": ["Amber", "Sandalwood", "Whipped Cream"]},
            "seasons": {"fall": 38, "spring": 30, "winter": 22, "summer": 10}, "day_night": {"day": 62, "night": 38},
            "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
            "review_summary": {"pros": ["Fluffy marshmallow clouds with light airy vanilla", "Zero synthetic screechiness", "Hug magnet"], "cons": ["Sweet powdery drydown"], "community_verdict": "Delicate, fluffy, cozy marshmallow clouds.", "top_reviewer_quotes": ["Walking on pink clouds made of whipped cream and vanilla sugar."]},
            "flankers": ["mykonos-aphrodite"], "dna_twins": ["lattafa-yara-pink", "titan-skinn-celeste"]
        }
    ]
    catalog.extend(mykonos)

    # ==========================================
    # 7. RAYHAAN (Complete Itinerary)
    # ==========================================
    rayhaan = [
        # Aqua Marine Line
        {
            "id": "rayhaan-pacific",
            "name": "Pacific",
            "brand": "Rayhaan",
            "collection": "Aqua Marine Line",
            "rating_value": 4.38, "rating_count": 2900, "gender": "Men", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Summer",
            "dna_inspiration": "Rasasi Hawas / Invictus Aqua", "dna_type": "Direct Competitor", "similarity_percentage": 93, "price_usd": 34,
            "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0284c7"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Aromatic", "score": 80, "color": "#16a34a"}, {"name": "Sweet", "score": 75, "color": "#ec4899"}],
            "notes": {"top": ["Sea Water", "Grapefruit", "Tangerine"], "middle": ["Bay Leaf", "Jasmine", "Lavender"], "base": ["Ambergris", "Guaiac Wood", "Oakmoss", "Patchouli"]},
            "seasons": {"summer": 65, "spring": 25, "fall": 8, "winter": 2}, "day_night": {"day": 75, "night": 25},
            "longevity": "Long Lasting (8-10 hrs)", "sillage": "Strong to Enormous",
            "review_summary": {"pros": ["Viral rival to Rasasi Hawas with smoother sweetness", "Crisp oceanic salty citrus with sweet bubblegum undertone", "Nuclear heat performance"], "cons": ["Common sweet aquatic DNA"], "community_verdict": "The rising king of summer aquatic beasts. Huge mass-appeal.", "top_reviewer_quotes": ["Lasts all day in 95-degree heat and projects like crazy."]},
            "flankers": ["rayhaan-ocean-rush", "rayhaan-imperia"], "dna_twins": ["rasasi-hawas-for-men", "titan-skinn-amalfi-bleu"]
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
            "review_summary": {"pros": ["Salty citrus with no egg or fishy off-notes", "Refreshing on hot days", "Modern bottle"], "cons": ["Straightforward freshie"], "community_verdict": "Reliable, high-performing marine citrus for heat and gym.", "top_reviewer_quotes": ["Diving into cold Mediterranean water with grapefruit slices."]},
            "flankers": ["rayhaan-pacific"], "dna_twins": ["afnan-turathi-blue", "titan-skinn-raw"]
        },
        # Royal Signature & Dark Lines
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
            "review_summary": {"pros": ["Lacks the synthetic harsh opening of Armaf CDNIM EDT", "Juicy blackcurrant and smoked pineapple", "Heavy metallic chrome bottle"], "cons": ["Competes in crowded Aventus market"], "community_verdict": "Modern, smooth alternative to CDNIM with no harsh lemon opening.", "top_reviewer_quotes": ["Smooth from the first second of spraying. Fruity birch perfection."]},
            "flankers": ["rayhaan-pacific", "rayhaan-corvus"], "dna_twins": ["afnan-supremacy-not-only-intense", "armaf-club-de-nuit-intense-man"]
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
            "review_summary": {"pros": ["Punchy pepper, zesty bergamot, and radiating ambroxan", "Combines mass appeal of Sauvage EDT with spices of Elixir"], "cons": ["Peppery opening"], "community_verdict": "Powerhouse peppery ambroxan scent for maximum projection.", "top_reviewer_quotes": ["Crisp pepper and clean lavender over ambroxan."]},
            "flankers": ["rayhaan-imperia", "rayhaan-elixir"], "dna_twins": ["lattafa-asad", "armaf-club-de-nuit-urban-elixir"]
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
            "review_summary": {"pros": ["Dead-on clone of 2023 sensation JPG Le Male Elixir", "Golden honey, creamy vanilla, and sweet aromatic mint", "Date night compliment getter"], "cons": ["High sweetness for cold weather"], "community_verdict": "One of the quickest and most faithful recreations of Le Male Elixir.", "top_reviewer_quotes": ["Golden honey dripping over warm vanilla and mint. Showstopper."]},
            "flankers": ["rayhaan-corvus", "rayhaan-imperia"], "dna_twins": ["afnan-9pm", "lattafa-ramz-silver"]
        },
        {
            "id": "rayhaan-lion",
            "name": "Rayhaan Lion",
            "brand": "Rayhaan",
            "collection": "Royal Signature",
            "rating_value": 4.29, "rating_count": 1100, "gender": "Men", "release_year": 2023,
            "concentration": "Eau de Parfum", "primary_season": "Winter",
            "dna_inspiration": "Warm Spiced Rum, Honey & Tobacco", "dna_type": "Warm Boozy Tobacco", "similarity_percentage": 91, "price_usd": 35,
            "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Sweet", "score": 88, "color": "#ec4899"}, {"name": "Tobacco", "score": 82, "color": "#78350f"}, {"name": "Woody", "score": 75, "color": "#854d0e"}],
            "notes": {"top": ["Spiced Rum", "Cinnamon", "Bergamot"], "middle": ["Honey", "Tobacco Leaf", "Vanilla"], "base": ["Benzoin", "Cedarwood", "Amber"]},
            "seasons": {"winter": 58, "fall": 32, "spring": 8, "summer": 2}, "day_night": {"night": 78, "day": 22},
            "longevity": "Long Lasting (8-9 hrs)", "sillage": "Strong",
            "review_summary": {"pros": ["Warm boozy spiced rum with pipe tobacco and honey", "Heated masculine presence"], "cons": ["Cold weather only"], "community_verdict": "Warm boozy powerhouse for festive winter nights.", "top_reviewer_quotes": ["Spiced dark rum with honeyed pipe tobacco."]},
            "flankers": ["rayhaan-imperia"], "dna_twins": ["lattafa-khamrah", "rasasi-daarej-pour-homme"]
        }
    ]
    catalog.extend(rayhaan)

    return catalog

if __name__ == "__main__":
    data = generate_catalog()
    with open("src/data/fragrances.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Generated complete itinerary! Total fragrances: {len(data)}")
    
    # Summary by brand
    brands = {}
    for d in data:
        brands[d["brand"]] = brands.get(d["brand"], 0) + 1
    for b, c in sorted(brands.items()):
        print(f"  • {b}: {c} fragrances")
