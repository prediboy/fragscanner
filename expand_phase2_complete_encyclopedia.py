import json

phase2_catalogs = [
    # =========================================================================
    # AFNAN COMPLETE EXPANSIONS (SUPREMACY, ZIMAYA, BOUQUET, HIGHNESS, TURATHI)
    # =========================================================================
    {
        "id": "afnan-supremacy-in-oud",
        "name": "Supremacy in Oud",
        "brand": "Afnan",
        "collection": "Supremacy Series",
        "rating_value": 4.46, "rating_count": 4800, "gender": "Unisex", "release_year": 2021,
        "concentration": "Extrait de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Initio Oud for Greatness", "dna_type": "Warm Spicy Saffron Agarwood", "similarity_percentage": 95, "price_usd": 48,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Oud", "score": 92, "color": "#581c87"}, {"name": "Aromatic", "score": 85, "color": "#16a34a"}, {"name": "Lavender", "score": 80, "color": "#8b5cf6"}, {"name": "Sweet", "score": 75, "color": "#ec4899"}],
        "notes": {"top": ["Saffron", "Nutmeg", "Lavender"], "middle": ["Agarwood (Oud)", "Sweet Notes"], "base": ["Patchouli", "Musk"]},
        "seasons": {"fall": 45, "winter": 45, "spring": 8, "summer": 2}, "day_night": {"day": 25, "night": 75},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["Exceptional 95% match to Initio Oud for Greatness with a sweeter, smoother drydown", "Unreal 12+ hour extrait longevity", "Exquisite magnetic cap presentation"], "cons": ["Potent saffron oud, strictly cool weather"], "community_verdict": "Widely voted superior to most niche oud fragrances.", "top_reviewer_quotes": ["Saffron, dry nutmeg, and velvety royal oud."]},
        "flankers": ["afnan-supremacy-not-only-intense", "afnan-supremacy-collectors-edition"], "dna_twins": ["lattafa-badee-al-oud-for-glory"]
    },
    {
        "id": "afnan-zimaya-sharaf-blend",
        "name": "Zimaya Sharaf Blend",
        "brand": "Afnan",
        "collection": "Zimaya Line",
        "rating_value": 4.50, "rating_count": 6200, "gender": "Unisex", "release_year": 2023,
        "concentration": "Extrait de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Kilian Angels' Share & Warm Spiced Cognac Dates", "dna_type": "Warm Spicy Boozy Gourmand", "similarity_percentage": 95, "price_usd": 35,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Sweet", "score": 95, "color": "#ec4899"}, {"name": "Vanilla", "score": 90, "color": "#f59e0b"}, {"name": "Boozy", "score": 85, "color": "#b45309"}, {"name": "Amber", "score": 80, "color": "#d97706"}],
        "notes": {"top": ["Dates", "Nutmeg", "Cognac Accord"], "middle": ["Cinnamon", "Praline", "Vanilla"], "base": ["Amberwood", "Tonka Bean", "Benzoin"]},
        "seasons": {"winter": 55, "fall": 38, "spring": 6, "summer": 1}, "day_night": {"day": 20, "night": 80},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["Incredible boozy spiced date and praline aroma", "Heavier on delicious dates than Khamrah, rivaling Angels' Share directly", "Stunning heavy crystal decanter"], "cons": ["Pure dessert sweet tooth required"], "community_verdict": "One of the absolute best boozy gourmands ever bottled.", "top_reviewer_quotes": ["Rich dates soaked in spiced cognac, praline, and vanilla."]},
        "flankers": ["afnan-zimaya-sharaf-the-club"], "dna_twins": ["lattafa-khamrah-qahwa", "afnan-historic-sahara"]
    },
    {
        "id": "afnan-zimaya-fatima-pink",
        "name": "Zimaya Fatima Pink",
        "brand": "Afnan",
        "collection": "Zimaya Line",
        "rating_value": 4.45, "rating_count": 3900, "gender": "Women", "release_year": 2022,
        "concentration": "Extrait de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Parfums de Marly Delina", "dna_type": "Floral Fruity Rose Rhubarb", "similarity_percentage": 94, "price_usd": 32,
        "accords": [{"name": "Rose", "score": 100, "color": "#f43f5e"}, {"name": "Fruity", "score": 92, "color": "#f97316"}, {"name": "Floral", "score": 88, "color": "#fbcfe8"}, {"name": "Musk", "score": 80, "color": "#cbd5e1"}],
        "notes": {"top": ["Litchi", "Rhubarb", "Bergamot", "Nutmeg"], "middle": ["Rose", "Peony", "Vanilla"], "base": ["Cashmeran", "Cedarwood", "White Musk"]},
        "seasons": {"spring": 50, "summer": 30, "fall": 15, "winter": 5}, "day_night": {"day": 75, "night": 25},
        "longevity": "Beast Mode (9-10 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Spot on Parfums de Marly Delina clone with tart rhubarb and jammy litchi", "Lush velvet rose sillage trail", "Gorgeous pink flacon"], "cons": ["Tart rhubarb opening"], "community_verdict": "The best budget Delina alternative under $35.", "top_reviewer_quotes": ["Litchi, tart rhubarb, and royal Turkish rose petals."]},
        "flankers": ["afnan-zimaya-fatima-velvet-love"], "dna_twins": ["afnan-souvenir-floral-bouquet"]
    },
    {
        "id": "afnan-cherry-bouquet",
        "name": "Cherry Bouquet",
        "brand": "Afnan",
        "collection": "Bouquet Series",
        "rating_value": 4.38, "rating_count": 2800, "gender": "Unisex", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Tom Ford Lost Cherry", "dna_type": "Sweet Fruity Boozy Almond", "similarity_percentage": 93, "price_usd": 38,
        "accords": [{"name": "Cherry", "score": 100, "color": "#e11d48"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Almond / Nutty", "score": 88, "color": "#a16207"}, {"name": "Boozy", "score": 82, "color": "#b45309"}, {"name": "Vanilla", "score": 78, "color": "#f59e0b"}],
        "notes": {"top": ["Black Cherry", "Bitter Almond", "Cherry Liqueur"], "middle": ["Turkish Rose", "Jasmine Sambac", "Plum"], "base": ["Tonka Bean", "Bourbon Vanilla", "Sandalwood", "Cedarwood"]},
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 35, "night": 65},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Decadent dark boozy cherries dripping in almond syrup", "Outlasts Tom Ford Lost Cherry by several hours", "Sensual evening date scent"], "cons": ["Sweet cherry syrup note"], "community_verdict": "Lush boozy black cherry perfection.", "top_reviewer_quotes": ["Juicy black cherry liqueur and warm toasted almond."]},
        "flankers": ["afnan-modest-deux"], "dna_twins": ["mykonos-dolce-cherry"]
    },
    {
        "id": "afnan-his-highness-black",
        "name": "His Highness Black",
        "brand": "Afnan",
        "collection": "Highness Collection",
        "rating_value": 4.41, "rating_count": 1800, "gender": "Men", "release_year": 2020,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Warm Spiced Pink Pepper, Royal Leather & Aged Oud", "dna_type": "Oriental Spicy Leather Oud", "similarity_percentage": 94, "price_usd": 55,
        "accords": [{"name": "Leather", "score": 100, "color": "#451a03"}, {"name": "Warm Spicy", "score": 90, "color": "#c2410c"}, {"name": "Oud", "score": 85, "color": "#581c87"}, {"name": "Amber", "score": 80, "color": "#d97706"}],
        "notes": {"top": ["Pink Pepper", "Cardamom", "Cumin", "Nutmeg"], "middle": ["Saffron", "Rose"], "base": ["Leather", "Cedarwood", "Agarwood", "Amber"]},
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"day": 20, "night": 80},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Nuclear",
        "review_summary": {"pros": ["Ultra-luxury heavy velvet crown flacon", "Commanding Sheikh presence with spicy pink pepper, saffron, and rich saddle leather"], "cons": ["Extremely potent, formal wear only"], "community_verdict": "Royal Sheikh evening masterpiece.", "top_reviewer_quotes": ["Commanding leather, warm cardamom, and regal aged oud."]},
        "flankers": ["afnan-her-highness-white"], "dna_twins": ["rasasi-la-yuqawam-pour-homme"]
    },

    # =========================================================================
    # RASASI COMPLETE EXPANSIONS (HAWAS BLACK, RUMZ ZEBRA, FATTAN, SHUHRAH)
    # =========================================================================
    {
        "id": "rasasi-hawas-black",
        "name": "Hawas Black",
        "brand": "Rasasi",
        "collection": "Hawas Collection",
        "rating_value": 4.47, "rating_count": 3100, "gender": "Men", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Dark Smoky Bergamot, Aquatic Leather & Ambergris", "dna_type": "Fresh Spicy Woody Chypre", "similarity_percentage": 94, "price_usd": 62,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Woody", "score": 92, "color": "#854d0e"}, {"name": "Smoky", "score": 85, "color": "#475569"}, {"name": "Ambroxan", "score": 80, "color": "#64748b"}, {"name": "Marine / Aquatic", "score": 75, "color": "#0ea5e9"}],
        "notes": {"top": ["Calabrian Bergamot", "Blackcurrant", "Grapefruit", "Smoky Accord"], "middle": ["Birch", "Patchouli", "Watery Notes"], "base": ["Ambergris", "Leather", "Cedarwood", "Oakmoss"]},
        "seasons": {"fall": 35, "spring": 30, "summer": 20, "winter": 15}, "day_night": {"day": 50, "night": 50},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["Takes the legendary Hawas sillage and fuses it with smoky Creed Aventus Absolu DNA", "Dark juicy bergamot and birch with aquatic ambergris", "2024 viral release"], "cons": ["High demand creates price surges"], "community_verdict": "The darkest, most executive release in the Hawas series.", "top_reviewer_quotes": ["Hawas aquatic power combined with smoky birch and dark fruits."]},
        "flankers": ["rasasi-hawas-for-men", "rasasi-hawas-ice"], "dna_twins": ["afnan-supremacy-collectors-edition", "armaf-club-de-nuit-precieux-1"]
    },
    {
        "id": "rasasi-rumz-al-rasasi-9325-zebra",
        "name": "Rumz Al Rasasi 9325 Pour Homme (Zebra)",
        "brand": "Rasasi",
        "collection": "Rumz Series",
        "rating_value": 4.42, "rating_count": 5400, "gender": "Men", "release_year": 2014,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Creed Aventus (Fruity Blackcurrant Batch)", "dna_type": "Fruity Chypre Leather", "similarity_percentage": 94, "price_usd": 38,
        "accords": [{"name": "Fruity", "score": 100, "color": "#f97316"}, {"name": "Woody", "score": 90, "color": "#854d0e"}, {"name": "Leather", "score": 82, "color": "#78350f"}, {"name": "Citrus", "score": 80, "color": "#eab308"}],
        "notes": {"top": ["Pineapple", "Blackcurrant", "Bergamot", "Lime"], "middle": ["Birch", "Jasmine", "Rose", "Lily of the Valley"], "base": ["Leather", "Ambergris", "Musk", "Oakmoss"]},
        "seasons": {"spring": 38, "summer": 32, "fall": 20, "winter": 10}, "day_night": {"day": 70, "night": 30},
        "longevity": "Beast Mode (10 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Famously known as 'Zebra' in the fragrance community", "Juicy blackcurrant and pineapple with smooth birch leather", "Very natural drydown compared to synthetic alternatives"], "cons": ["Frosted bottle with zebra graphic divides opinions"], "community_verdict": "A legendary Aventus clone staple.", "top_reviewer_quotes": ["Juicy tart blackcurrant, pineapple, and leather. High compliments."]},
        "flankers": ["rasasi-rumz-al-rasasi-9453-leopard"], "dna_twins": ["afnan-supremacy-silver", "armaf-club-de-nuit-intense-man"]
    },
    {
        "id": "rasasi-fattan-pour-homme",
        "name": "Fattan Pour Homme",
        "brand": "Rasasi",
        "collection": "Fattan Series",
        "rating_value": 4.45, "rating_count": 6800, "gender": "Men", "release_year": 2018,
        "concentration": "Eau de Parfum", "primary_season": "Spring",
        "dna_inspiration": "Hermès Terre d'Hermès Eau Intense Vétiver", "dna_type": "Woody Earthy Citrus Chypre", "similarity_percentage": 95, "price_usd": 24,
        "accords": [{"name": "Woody", "score": 100, "color": "#854d0e"}, {"name": "Earthy / Oakmoss", "score": 92, "color": "#15803d"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Fresh Spicy", "score": 80, "color": "#059669"}],
        "notes": {"top": ["Grapefruit", "Bergamot", "Pink Pepper"], "middle": ["Vetiver", "Cedarwood", "Patchouli", "Lily-of-the-Valley"], "base": ["Oakmoss", "Benzoin", "Amber"]},
        "seasons": {"spring": 45, "summer": 30, "fall": 20, "winter": 5}, "day_night": {"day": 75, "night": 25},
        "longevity": "Beast Mode (9-10 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Phenomenal 95% match to Terre d'Hermès with massive green vetiver and oakmoss", "Unbelievable value at $24 in emerald green juice flacon", "Mature executive authority in warm weather"], "cons": ["Heavy oakmoss vetiver base is very masculine/earthy"], "community_verdict": "One of the greatest cheapies in fragrance history.", "top_reviewer_quotes": ["Bitter grapefruit, peppery vetiver, and green oakmoss. Masterpiece."]},
        "flankers": ["rasasi-fattan-pour-femme"], "dna_twins": ["rayhaan-terra", "titan-skinn-raw"]
    },
    {
        "id": "rasasi-shuhrah-pour-homme",
        "name": "Shuhrah Pour Homme",
        "brand": "Rasasi",
        "collection": "Oriental Powerhouse",
        "rating_value": 4.35, "rating_count": 5200, "gender": "Men", "release_year": 2015,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Crushed Tomato Leaf, Smoked Rose & Biker Leather", "dna_type": "Green Aromatic Smoky Leather", "similarity_percentage": 94, "price_usd": 32,
        "accords": [{"name": "Green", "score": 100, "color": "#15803d"}, {"name": "Incense / Smoky", "score": 92, "color": "#475569"}, {"name": "Leather", "score": 88, "color": "#78350f"}, {"name": "Rose", "score": 80, "color": "#f43f5e"}],
        "notes": {"top": ["Tomato Leaf", "Freesia", "Rose"], "middle": ["Rose", "Sandalwood", "Cedarwood", "Jasmine"], "base": ["Leather", "Agarwood (Oud)", "Oakmoss", "Musk", "Amber"]},
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 25, "night": 75},
        "longevity": "Beast Mode (14+ hrs)", "sillage": "Nuclear",
        "review_summary": {"pros": ["One of the most nuclear projecting fragrances in the world", "Unique bitter crushed green tomato leaf with dark smoky rose and leather", "Lasts 24+ hours on coats"], "cons": ["Extremely polarizing tomato leaf smoke, 1 spray maximum"], "community_verdict": "The ultimate polarizing power-fragrance.", "top_reviewer_quotes": ["Bitter green tomato leaf, cigarette ash smoke, and luxury leather."]},
        "flankers": ["rasasi-daarej-pour-homme"], "dna_twins": ["lattafa-maahir-black-edition"]
    },
    {
        "id": "rasasi-sotoor-waaw",
        "name": "Sotoor Waaw",
        "brand": "Rasasi",
        "collection": "Sotoor Series",
        "rating_value": 4.41, "rating_count": 2100, "gender": "Unisex", "release_year": 2017,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Roasted Walnuts, Cinnamon, Guaiac Wood & Amber", "dna_type": "Woody Spicy Nutty Amber", "similarity_percentage": 94, "price_usd": 45,
        "accords": [{"name": "Warm Spicy", "score": 100, "color": "#c2410c"}, {"name": "Woody", "score": 90, "color": "#854d0e"}, {"name": "Nutty", "score": 85, "color": "#a16207"}, {"name": "Cinnamon", "score": 82, "color": "#b45309"}, {"name": "Amber", "score": 78, "color": "#d97706"}],
        "notes": {"top": ["Cardamom", "Cinnamon", "Saffron", "Artemisia"], "middle": ["Lavender", "Gurjum Balsam"], "base": ["Walnut Accord", "Guaiac Wood", "Sandalwood", "Amber", "Cedarwood"]},
        "seasons": {"fall": 48, "winter": 40, "spring": 10, "summer": 2}, "day_night": {"day": 30, "night": 70},
        "longevity": "Long Lasting (9 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Rare photorealistic toasted walnut with warm autumn cinnamon", "Rich, elegant niche-quality wooden presentation", "Unbelievably cozy"], "cons": ["Artisanal nutty profile"], "community_verdict": "A connoisseur's autumn masterpiece.", "top_reviewer_quotes": ["Toasted walnuts, spicy cinnamon bark, and smoky guaiac wood."]},
        "flankers": ["rasasi-sotoor-taa"], "dna_twins": ["afnan-historic-sahara", "lattafa-liam-grey"]
    },

    # =========================================================================
    # ARMAF COMPLETE EXPANSIONS (DELINA EXCLUSIF, TRES NUIT, ODYSSEY MEGA)
    # =========================================================================
    {
        "id": "armaf-club-de-nuit-white-imperiale",
        "name": "Club de Nuit White Impériale",
        "brand": "Armaf",
        "collection": "Club de Nuit",
        "rating_value": 4.48, "rating_count": 5100, "gender": "Women", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Parfums de Marly Delina Exclusif", "dna_type": "Floral Fruity Amber Rose", "similarity_percentage": 95, "price_usd": 48,
        "accords": [{"name": "Rose", "score": 100, "color": "#f43f5e"}, {"name": "Vanilla", "score": 92, "color": "#f59e0b"}, {"name": "Fruity", "score": 88, "color": "#f97316"}, {"name": "Sweet", "score": 82, "color": "#ec4899"}, {"name": "Incense / Smoky", "score": 75, "color": "#475569"}],
        "notes": {"top": ["Litchi", "Bergamot", "Nutmeg"], "middle": ["Turkish Rose", "Vanilla", "Peony", "Musk"], "base": ["Incense", "Cashmeran", "Cedarwood", "Amber"]},
        "seasons": {"fall": 35, "spring": 35, "winter": 20, "summer": 10}, "day_night": {"day": 60, "night": 40},
        "longevity": "Beast Mode (12+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["Phenomenal 95% clone of Parfums de Marly Delina Exclusif", "Sweet vanilla, jammy litchi, Turkish rose petals, and subtle smoky incense", "Unbelievable sillage and compliments"], "cons": ["Rich and dense"], "community_verdict": "Armaf's most luxurious feminine release.", "top_reviewer_quotes": ["Delina Exclusif at 1/5th the cost with monster 12 hour performance."]},
        "flankers": ["armaf-club-de-nuit-untold", "armaf-club-de-nuit-intense-man"], "dna_twins": ["afnan-souvenir-floral-bouquet", "afnan-zimaya-fatima-pink"]
    },
    {
        "id": "armaf-tres-nuit",
        "name": "Tres Nuit",
        "brand": "Armaf",
        "collection": "Tres Nuit",
        "rating_value": 4.36, "rating_count": 6800, "gender": "Men", "release_year": 2014,
        "concentration": "Eau de Toilette", "primary_season": "Spring",
        "dna_inspiration": "Creed Green Irish Tweed", "dna_type": "Green Aromatic Fresh Floral", "similarity_percentage": 93, "price_usd": 26,
        "accords": [{"name": "Green", "score": 100, "color": "#15803d"}, {"name": "Citrus", "score": 88, "color": "#eab308"}, {"name": "Aromatic", "score": 82, "color": "#16a34a"}, {"name": "Iris / Floral", "score": 78, "color": "#8b5cf6"}],
        "notes": {"top": ["Lemon Verbena", "Iris", "Lemon"], "middle": ["Lavender", "Violet", "Spicy Notes"], "base": ["Ambergris", "Sandalwood"]},
        "seasons": {"spring": 55, "summer": 30, "fall": 12, "winter": 3}, "day_night": {"day": 80, "night": 20},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Moderate to Strong",
        "review_summary": {"pros": ["The classic benchmark clone of Creed Green Irish Tweed", "Lush dew-kissed green grass, lemon verbena, and noble powdery iris", "Gentlemanly spring elegance"], "cons": ["Classic green profile"], "community_verdict": "One of Armaf's crowning early achievements.", "top_reviewer_quotes": ["Crisp Irish country air, fresh cut grass, and lemon verbena."]},
        "flankers": ["armaf-tres-nuit-lyric"], "dna_twins": ["armaf-le-parfait-pour-homme", "titan-skinn-verge"]
    },
    {
        "id": "armaf-odyssey-mega",
        "name": "Odyssey Mega",
        "brand": "Armaf",
        "collection": "Odyssey Collection",
        "rating_value": 4.40, "rating_count": 4200, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Yves Saint Laurent Y Eau de Parfum", "dna_type": "Aromatic Fruity Woody Blue", "similarity_percentage": 94, "price_usd": 35,
        "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Fresh Spicy", "score": 85, "color": "#059669"}, {"name": "Woody", "score": 80, "color": "#854d0e"}],
        "notes": {"top": ["Bergamot", "Ginger", "Crisp Green Apple"], "middle": ["Sage", "Juniper Berries", "Geranium"], "base": ["Amberwood", "Cedarwood", "Tonka Bean", "Vetiver"]},
        "seasons": {"spring": 35, "summer": 35, "fall": 20, "winter": 10}, "day_night": {"day": 65, "night": 35},
        "longevity": "Beast Mode (9 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Flawless take on YSL Y EDP with explosive sweet apple and spicy ginger", "Massive crowd pleaser and compliment king", "Heavy flask design"], "cons": ["Youthful modern blue sweetness"], "community_verdict": "The best YSL Y clone under $40.", "top_reviewer_quotes": ["Crisp green apple, spicy ginger, and aromatic sage. Compliment magnet."]},
        "flankers": ["armaf-odyssey-mandarin-sky", "armaf-odyssey-aqua"], "dna_twins": ["lattafa-fakhar-black"]
    },
    {
        "id": "armaf-craze",
        "name": "Craze",
        "brand": "Armaf",
        "collection": "Classics",
        "rating_value": 4.39, "rating_count": 5600, "gender": "Men", "release_year": 2017,
        "concentration": "Eau de Parfum", "primary_season": "Fall",
        "dna_inspiration": "Parfums de Marly Pegasus", "dna_type": "Almond Powdery Vanilla Woody", "similarity_percentage": 94, "price_usd": 28,
        "accords": [{"name": "Almond / Nutty", "score": 100, "color": "#a16207"}, {"name": "Vanilla", "score": 92, "color": "#f59e0b"}, {"name": "Powdery", "score": 85, "color": "#cbd5e1"}, {"name": "Warm Spicy", "score": 78, "color": "#c2410c"}],
        "notes": {"top": ["Heliotrope", "Cumin", "Bergamot"], "middle": ["Bitter Almond", "Lavender", "Jasmine"], "base": ["Vanilla", "Amber", "Sandalwood"]},
        "seasons": {"fall": 45, "winter": 40, "spring": 12, "summer": 3}, "day_night": {"day": 35, "night": 65},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Exceptional metallic bitter almond and creamy vanilla", "Outperforms Parfums de Marly Pegasus for $28", "Unique sophisticated drydown"], "cons": ["Cumin and bitter almond is unique"], "community_verdict": "A legendary Parfums de Marly Pegasus twin.", "top_reviewer_quotes": ["Bitter almond, soft powdery heliotrope, and rich bourbon vanilla."]},
        "flankers": ["armaf-futura-la-homme"], "dna_twins": ["afnan-historic-sahara"]
    },

    # =========================================================================
    # LATTAFA COMPLETE EXPANSIONS (ASAD ZANZIBAR, YARA TOUS, FAKHAR, NEBRAS)
    # =========================================================================
    {
        "id": "lattafa-asad-zanzibar",
        "name": "Asad Zanzibar",
        "brand": "Lattafa",
        "collection": "Asad Collection",
        "rating_value": 4.41, "rating_count": 4800, "gender": "Men", "release_year": 2024,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Mineral Salty Coconut Water, Iris & Spicy Vanilla", "dna_type": "Tropical Salty Marine Vanilla", "similarity_percentage": 93, "price_usd": 34,
        "accords": [{"name": "Marine / Aquatic", "score": 100, "color": "#0ea5e9"}, {"name": "Salty", "score": 92, "color": "#38bdf8"}, {"name": "Coconut", "score": 88, "color": "#fef08a"}, {"name": "Vanilla", "score": 82, "color": "#f59e0b"}, {"name": "Iris / Floral", "score": 75, "color": "#8b5cf6"}],
        "notes": {"top": ["Black Pepper", "Sea Lavender"], "middle": ["Salty Coconut Water", "Iris"], "base": ["Bourbon Vanilla", "Incense"]},
        "seasons": {"summer": 55, "spring": 25, "fall": 15, "winter": 5}, "day_night": {"day": 65, "night": 35},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Enormous",
        "review_summary": {"pros": ["2024 viral sequel to Asad", "Fascinating blend of salty Indian Ocean coconut water, spicy black pepper, and powdery iris", "Immense projection in summer breeze"], "cons": ["Salty mineral coconut water divides opinions"], "community_verdict": "A daring, unique coastal marine twist on the Asad DNA.", "top_reviewer_quotes": ["Black pepper, salty ocean water, coconut, and vanilla incense."]},
        "flankers": ["lattafa-asad"], "dna_twins": ["rayhaan-aquatica", "rasasi-hawas-ice"]
    },
    {
        "id": "lattafa-yara-tous",
        "name": "Yara Tous (Mango)",
        "brand": "Lattafa",
        "collection": "Yara Collection",
        "rating_value": 4.39, "rating_count": 5900, "gender": "Women", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Juicy Tropical Mango, Coconut Nectar & Creamy Vanilla", "dna_type": "Tropical Sweet Fruity Gourmand", "similarity_percentage": 93, "price_usd": 28,
        "accords": [{"name": "Tropical / Mango", "score": 100, "color": "#f59e0b"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Coconut", "score": 88, "color": "#fef08a"}, {"name": "Vanilla", "score": 84, "color": "#f59e0b"}],
        "notes": {"top": ["Ripe Mango", "Coconut Milk", "Passionfruit"], "middle": ["Jasmine", "Orange Blossom", "Heliotrope"], "base": ["Vanilla", "Cashmeran", "Musk"]},
        "seasons": {"summer": 68, "spring": 22, "fall": 8, "winter": 2}, "day_night": {"day": 75, "night": 25},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Delicious ripe golden mango smoothie with sweet coconut milk", "Superb joyful tropical vacation mood", "Immense viral popularity"], "cons": ["Very sweet tropical profile"], "community_verdict": "The undisputed mango champion of the Yara lineup.", "top_reviewer_quotes": ["Sweet ripe mango, creamy coconut milk, and warm vanilla."]},
        "flankers": ["lattafa-yara-pink", "lattafa-yara-candy", "lattafa-yara-moi"], "dna_twins": ["lattafa-yara-pink", "mykonos-coconut-dreams"]
    },
    {
        "id": "lattafa-fakhar-black",
        "name": "Fakhar Black Pour Homme",
        "brand": "Lattafa",
        "collection": "Fakhar Series",
        "rating_value": 4.42, "rating_count": 8800, "gender": "Men", "release_year": 2021,
        "concentration": "Eau de Parfum", "primary_season": "All Season",
        "dna_inspiration": "Yves Saint Laurent Y Eau de Parfum", "dna_type": "Aromatic Fresh Spicy Green Apple", "similarity_percentage": 95, "price_usd": 25,
        "accords": [{"name": "Aromatic", "score": 100, "color": "#16a34a"}, {"name": "Fruity", "score": 90, "color": "#f97316"}, {"name": "Fresh Spicy", "score": 85, "color": "#059669"}, {"name": "Woody", "score": 80, "color": "#854d0e"}],
        "notes": {"top": ["Green Apple", "Bergamot", "Ginger"], "middle": ["Lavender", "Sage", "Juniper Berries", "Geranium"], "base": ["Amberwood", "Tonka Bean", "Cedarwood", "Vetiver"]},
        "seasons": {"spring": 35, "summer": 35, "fall": 20, "winter": 10}, "day_night": {"day": 65, "night": 35},
        "longevity": "Beast Mode (9-10 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Phenomenal 95% match to YSL Y EDP", "Crisp green apple and spicy ginger with aromatic sage and ambroxan", "One of the most complimented $25 fragrances in history"], "cons": ["Common modern blue profile"], "community_verdict": "The definitive YSL Y clone.", "top_reviewer_quotes": ["Sweet crisp apple, spicy ginger, and clean aromatic woods."]},
        "flankers": ["lattafa-fakhar-rose", "lattafa-fakhar-lattafa-extrait"], "dna_twins": ["armaf-odyssey-mega", "titan-skinn-raw"]
    },
    {
        "id": "lattafa-nebras",
        "name": "Nebras",
        "brand": "Lattafa",
        "collection": "Pride Collection",
        "rating_value": 4.47, "rating_count": 6800, "gender": "Unisex", "release_year": 2022,
        "concentration": "Eau de Parfum", "primary_season": "Winter",
        "dna_inspiration": "Billie Eilish No. 1", "dna_type": "Warm Vanilla Cacao Gourmand", "similarity_percentage": 96, "price_usd": 38,
        "accords": [{"name": "Vanilla", "score": 100, "color": "#f59e0b"}, {"name": "Sweet", "score": 92, "color": "#ec4899"}, {"name": "Chocolate / Cacao", "score": 90, "color": "#78350f"}, {"name": "Fruity", "score": 80, "color": "#f97316"}],
        "notes": {"top": ["Red Berries", "Mandarin Orange"], "middle": ["Vanilla", "Cacao", "Rose"], "base": ["Tonka Bean", "Amber", "Musk", "Sugar"]},
        "seasons": {"winter": 55, "fall": 35, "spring": 8, "summer": 2}, "day_night": {"day": 30, "night": 70},
        "longevity": "Beast Mode (10+ hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Rich warm vanilla bean drenched in melted milk chocolate and red berries", "Better performance and smoother cacao than Eilish No. 1", "Sensual cold weather comfort"], "cons": ["Heavy sweet cacao profile"], "community_verdict": "One of Lattafa's finest gourmand triumphs.", "top_reviewer_quotes": ["Melted milk chocolate, sugared red berries, and warm vanilla bean."]},
        "flankers": ["lattafa-eclaire"], "dna_twins": ["lattafa-eclaire", "mykonos-caramel-fudge-cookie"]
    },
    {
        "id": "lattafa-maahir-legacy",
        "name": "Maahir Legacy (Silver)",
        "brand": "Lattafa",
        "collection": "Maahir Series",
        "rating_value": 4.43, "rating_count": 5200, "gender": "Men", "release_year": 2023,
        "concentration": "Eau de Parfum", "primary_season": "Summer",
        "dna_inspiration": "Parfums de Marly Sedley", "dna_type": "Fizzy Citrus Mint Aromatic", "similarity_percentage": 94, "price_usd": 32,
        "accords": [{"name": "Citrus", "score": 100, "color": "#eab308"}, {"name": "Aromatic", "score": 92, "color": "#16a34a"}, {"name": "Fresh Spicy", "score": 85, "color": "#059669"}, {"name": "Woody", "score": 78, "color": "#854d0e"}],
        "notes": {"top": ["Lime", "Grapefruit", "Mint", "Lavender", "Pineapple"], "middle": ["Rosemary", "Geranium", "Black Pepper"], "base": ["Ambroxan", "Cashmeran", "Oakmoss", "Vetiver", "Tonka Bean"]},
        "seasons": {"summer": 68, "spring": 26, "fall": 5, "winter": 1}, "day_night": {"day": 85, "night": 15},
        "longevity": "Long Lasting (8 hrs)", "sillage": "Strong",
        "review_summary": {"pros": ["Effervescent Sprite/tonic lime with crisp spearmint and rosemary", "Outstanding Parfums de Marly Sedley clone", "Famous silver chrome horse-head flacon"], "cons": ["Zesty mint opening"], "community_verdict": "The ultimate refreshing summer heat fizzy citrus.", "top_reviewer_quotes": ["Icy lime, fresh mint, and clean ambroxan. Fizzy perfection."]},
        "flankers": ["lattafa-maahir", "lattafa-maahir-black-edition"], "dna_twins": ["rayhaan-pacific", "rasasi-hawas-ice"]
    }
]

with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json', 'r') as f:
    existing = json.load(f)

existing_ids = {item['id'] for item in existing}
added_count = 0

for p in phase2_catalogs:
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

print(f"Successfully added/updated {added_count} Phase 2 flagship collection fragrances!")
print(f"Total fragrances now in database: {len(existing)}")
