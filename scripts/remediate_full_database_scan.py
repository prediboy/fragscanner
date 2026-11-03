import json
import re

FRAGRANCES_PATH = "src/data/fragrances.json"

with open(FRAGRANCES_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Loaded {len(data)} fragrances.")

# Backup original keys and seller info for assertion check
original_checks = {}
for item in data:
    fid = item["id"]
    original_checks[fid] = {
        "price": item.get("community_price"),
        "stock": item.get("in_seller_stock"),
        "sellers_count": len(item.get("community_sellers", [])),
        "decants_count": len(item.get("community_decants", [])),
    }

# 1. Specific Target Remediations
TARGET_REMEDIATIONS = {
    "apex-alrehab-frenchcoffee": {
        "dna_inspiration": "Maison Margiela Coffee Break / Montale Intense Cafe",
        "dna_type": "Warm Roasted Coffee Beans, Creamy Vanilla & Caramel",
        "similarity_percentage": 94,
        "accords": [
            {"name": "Coffee", "score": 98, "color": "#451a03"},
            {"name": "Warm Spicy", "score": 92, "color": "#b45309"},
            {"name": "Vanilla", "score": 88, "color": "#f59e0b"},
            {"name": "Sweet", "score": 85, "color": "#ea580c"}
        ],
        "notes": {
            "top": ["Roasted Coffee Beans", "Brown Sugar"],
            "middle": ["Warm Milk", "Caramel"],
            "base": ["Bourbon Vanilla", "Cocoa"]
        },
        "review_summary": {
            "community_verdict": "A legendary viral gourmand benchmark. Ultra-realistic freshly brewed sweet cafe latte with monster longevity.",
            "pros": ["Photorealistic roasted coffee aroma", "Phenomenal staying power", "Unmatched price-to-performance value"],
            "cons": ["Very sweet for hot summer weather"],
            "top_reviewer_quotes": ["Literally smells like walking into a cozy Parisian cafe.", "The ultimate coffee lover blind buy."]
        }
    },
    "st-9181": {
        "dna_inspiration": "Original Arabian Davana, Pink Pepper, Oud & Amber Leather Benchmark (Gissah Original)",
        "dna_type": "Davana, Italian Bergamot, Pink Pepper, Leather & Rich Amber",
        "similarity_percentage": 100
    },
    "apex-ibraq-spanishtobacco": {
        "dna_inspiration": "Tom Ford Tobacco Vanille",
        "dna_type": "Warm Spiced Tobacco Leaf, Tonka Bean & Bourbon Vanilla",
        "similarity_percentage": 92
    },
    "apex-rayhaan-noctourno": {
        "dna_inspiration": "Dior Sauvage Eau de Parfum",
        "dna_type": "Calabrian Bergamot, Sichuan Pepper & Magnetic Ambroxan",
        "similarity_percentage": 93
    },
    "st-9072": {
        "dna_inspiration": "Gissah Imperial Valley / Tom Ford Ombré Leather",
        "dna_type": "Deep Leather, Incense, Cypress & Smoky Blue Agarwood",
        "similarity_percentage": 93
    },
    "apex-ahmedalmaghribi-bluoud": {
        "dna_inspiration": "Gissah Imperial Valley / Tom Ford Ombré Leather",
        "dna_type": "Deep Leather, Incense, Cypress & Smoky Blue Agarwood",
        "similarity_percentage": 93
    },
    "afnan-tribute-white": {
        "dna_inspiration": "Floral Fruity Gourmand (Apple, Tangerine, Jasmine & Vanilla Musk)",
        "dna_type": "Crisp Apple, Tangerine, Jasmine, Neroli & Vanilla Musk",
        "similarity_percentage": 90
    },
    "afnan-modest-une-pour-femme": {
        "name": "Modest Deux Pour Femme",
        "dna_inspiration": "Lancôme La Nuit Trésor",
        "dna_type": "Raspberry, Dark Chocolate, Cherry & Caramel Vanilla",
        "similarity_percentage": 94
    },
    "armaf-the-pride-of-armaf-pour-femme": {
        "dna_inspiration": "Carolina Herrera Good Girl",
        "dna_type": "Almond, Coffee, Jasmine Sambac, Cacao & Tonka Bean",
        "similarity_percentage": 94
    },
    "rasasi-fattan-pour-femme": {
        "dna_inspiration": "Giorgio Armani Sì / Sweet Patchouli Floral",
        "dna_type": "Tangerine, Pink Pepper, Iris, Jasmine & Golden Amber Patchouli",
        "similarity_percentage": 91
    },
    "armaf-all-you-need-is-love-pour-homme": {
        "dna_inspiration": "Giorgio Armani Acqua Di Giò Absolu",
        "dna_type": "Aquatic Marine, Fruity Apple, Patchouli & Warm Woody Amber",
        "similarity_percentage": 93
    },
    "armaf-hunter-for-women": {
        "dna_inspiration": "Bvlgari Jasmin Noir",
        "dna_type": "Gardenia, Green Notes, Jasmine Sambac, Tonka Bean & Precious Woods",
        "similarity_percentage": 93
    },
    "armaf-venetian-girl-from-venice-with-love": {
        "dna_inspiration": "Parfums de Marly Delina La Rosée",
        "dna_type": "Sparkling Lychee, Turkish Rose, Peony & Dewy White Musk",
        "similarity_percentage": 94
    },
    "armaf-venetian-girl-edition-rouge": {
        "dna_inspiration": "Parfums de Marly Delina",
        "dna_type": "Tart Rhubarb, Lychee, Turkish Rose & Cashmeran Vanilla",
        "similarity_percentage": 94
    },
    "armaf-odyssey-aoud": {
        "dna_inspiration": "Initio Oud for Greatness",
        "dna_type": "Nutmeg, Lavender, Saffron, Natural Oud & Patchouli Musk",
        "similarity_percentage": 93
    },
    "lattafa-qaed-al-fursan-white": {
        "dna_inspiration": "Mancera Coco Vanille",
        "dna_type": "Creamy Coconut, White Florals, Bourbon Vanilla & Solar White Musk",
        "similarity_percentage": 95
    },
    "lattafa-qaed-al-fursan-unlimited": {
        "dna_inspiration": "Mancera Coco Vanille",
        "dna_type": "Creamy Coconut, White Florals, Bourbon Vanilla & Solar White Musk",
        "similarity_percentage": 95
    },
    "lattafa-maahir": {
        "dna_inspiration": "Armani Privé Rose d'Arabie",
        "dna_type": "Damask Rose, Saffron, Amber, Patchouli & Royal Agarwood",
        "similarity_percentage": 93
    },
    "lattafa-jasoor": {
        "dna_inspiration": "Valentino Born In Roma Coral Fantasy",
        "dna_type": "Crisp Red Apple, Cardamom, Clary Sage, Tobacco & Amber Leather",
        "similarity_percentage": 94
    },
    "lattafa-nasheet": {
        "dna_inspiration": "Nishane Ani",
        "dna_type": "Zesty Ginger, Bergamot, Cardamom & Decadent Madagascar Vanilla",
        "similarity_percentage": 95
    },
    "lattafa-opulent-red": {
        "dna_inspiration": "Giorgio Armani Privé Rouge Malachite",
        "dna_type": "Tuberose, Blood Orange, Pink Pepper, Amber & Solar Spices",
        "similarity_percentage": 93
    },
    "lattafa-ajayeb-dubai-portrait": {
        "dna_inspiration": "Stéphane Humbert Lucas 777 Soleil de Jeddah Mango Kiss",
        "dna_type": "Juicy Tart Mango, Osmanthus, Mandarin, Sandalwood & Golden Amber",
        "similarity_percentage": 95
    },
    "lattafa-velvet-rose": {
        "dna_inspiration": "Jo Malone Velvet Rose & Oud",
        "dna_type": "Damask Rose, Smoky Agarwood, Clove & Praline Amber",
        "similarity_percentage": 94
    },
    "lattafa-mazaaji": {
        "dna_inspiration": "Elie Saab Le Parfum Royal",
        "dna_type": "Royal Orange Blossom, Mandarin, Turkish Rose, Patchouli & Golden Amber",
        "similarity_percentage": 93
    },
    "lattafa-just-oud-boulevard": {
        "dna_inspiration": "Christian Dior Oud Ispahan",
        "dna_type": "Saffron, Cardamom, Damask Rose, Leather & Smoky Agarwood",
        "similarity_percentage": 92
    },
    "lattafa-awraq-al-oud": {
        "dna_inspiration": "Traditional Saffron Rose, Cinnamon & Aged Sandalwood Oud",
        "dna_type": "Nutmeg, Cinnamon, Saffron, Rose, Sandalwood & Rich Agarwood",
        "similarity_percentage": 91
    },
    "lattafa-oud-salama": {
        "dna_inspiration": "Smoky Fruity Leather, Amber & Agarwood",
        "dna_type": "Fruity Notes, White Musk, Leather, Amber & Resinous Agarwood",
        "similarity_percentage": 92
    },
    "lattafa-sheikh-al-shuyukh-black": {
        "dna_inspiration": "Aromatic Herbal Sage, Lavender, Rosemary & Cedar Oud",
        "dna_type": "Clary Sage, Lavender, Rosemary, Patchouli & Cedar Agarwood",
        "similarity_percentage": 92
    },
    "lattafa-rooh-al-rooh-silver": {
        "dna_inspiration": "Tom Ford Noir Extreme / Penhaligon's Halfeti",
        "dna_type": "Saffron, Cinnamon, Nutmeg, Suede Leather, Sandalwood & Oud",
        "similarity_percentage": 93
    },
    "lattafa-al-azal": {
        "dna_inspiration": "Warm Saffron, Leather, Patchouli & Smoky Agarwood",
        "dna_type": "Saffron, Suede Leather, Patchouli, Resinous Amber & Dark Oud",
        "similarity_percentage": 91
    },
    "lattafa-iconic-oudh": {
        "dna_inspiration": "Maison Francis Kurkdjian Oud Silk Mood",
        "dna_type": "Turkish Rose, Blue Chamomile, Papyrus & Laotian Agarwood",
        "similarity_percentage": 93
    },
    "rasasi-qasamat-ebhar": {
        "dna_inspiration": "Maison Francis Kurkdjian Gentle Fluidity Gold",
        "dna_type": "Sparkling Green Apple, Orris, Lotus, Praline & Bourbon Vanilla",
        "similarity_percentage": 93
    },
    "rasasi-seen": {
        "dna_inspiration": "Gucci Rush / Summer Niche Fruits",
        "dna_type": "Crisp Pear, Tropical Guava, White Flowers, Honey & Soft Vanilla Musk",
        "similarity_percentage": 92
    },
    "rasasi-entebaa-pour-femme": {
        "dna_inspiration": "Guerlain Champs-Élysées / Gucci Guilty",
        "dna_type": "Peach, Blackcurrant, Mimosa, Rose, Sandalwood & Clean Musk",
        "similarity_percentage": 92
    },
    "rasasi-maa-arwaak-for-her": {
        "dna_inspiration": "Paco Rabanne Black XS For Her",
        "dna_type": "Cranberry, Pink Pepper, Tamarind, Cacao Pod, Rose & Vanilla",
        "similarity_percentage": 93
    },
    "rasasi-junoon-leather-pour-femme": {
        "dna_inspiration": "Niche Soft Leather, Rose, Sweet Tobacco & Amber",
        "dna_type": "Saffron, Cardamom, Rose, Soft Leather, Tobacco & Amberwood",
        "similarity_percentage": 93
    },
    "rasasi-faqat-lil-rijal": {
        "dna_inspiration": "Traditional Powerful Hindi Oud, Raw Leather & Saffron",
        "dna_type": "Medicinal Hindi Oud, Saffron, Geranium, Raw Leather & Dark Patchouli",
        "similarity_percentage": 92
    },
    "rasasi-attar-al-mohabba-for-her": {
        "dna_inspiration": "Tom Ford Noir de Noir / Spiced Rose & Leather",
        "dna_type": "Spiced Turkish Rose, Cardamom, Cedarwood, Leather & Vetiver",
        "similarity_percentage": 93
    },
    "rasasi-somow-al-rasasi-lamaan-oud-ombre": {
        "dna_inspiration": "Louis Vuitton Ombre Nomade",
        "dna_type": "Assam Agarwood, Raspberry, Incense, Rose & Smoky Birch",
        "similarity_percentage": 94
    },
    "rasasi-somow-al-rasasi-lamaan-oud-rose": {
        "dna_inspiration": "Lancôme Oud Bouquet",
        "dna_type": "Taif Rose, Saffron, Praline Vanilla, Cashmeran & Aged Agarwood",
        "similarity_percentage": 93
    },
    "rasasi-attar-al-boruzz-lamaat-musk-tabriz": {
        "dna_inspiration": "Xerjoff Cruz del Sur II / Passionfruit Rose Musk Oud",
        "dna_type": "Passionfruit, Calabrian Bergamot, Turkish Rose, Cedar & Clean Musk",
        "similarity_percentage": 92
    },
    "rasasi-musk-sharqi": {
        "dna_inspiration": "Initio Musk Therapy / Oriental Rose Cashmeran Musk",
        "dna_type": "White Musk, Damask Rose, Cashmeran, Sandalwood & Golden Amber",
        "similarity_percentage": 92
    },
    "rasasi-dhanal-oudh-nashwah": {
        "dna_inspiration": "Montale Honey Aoud",
        "dna_type": "Rich Honey, Nutmeg, Cinnamon, Agarwood & Warm Golden Amber",
        "similarity_percentage": 93
    },
    "rasasi-asrar-indonesia": {
        "dna_inspiration": "Traditional High-Grade Indonesian Agarwood & Amber",
        "dna_type": "Rare Indonesian Oud, Sun-Drenched Bergamot, Ginger & Frankincense",
        "similarity_percentage": 95
    },
    "afnan-la-fleur-bouquet": {
        "dna_inspiration": "Ex Nihilo Fleur Narcotique",
        "dna_type": "Crisp Bergamot, Lychee, Peach, Jasmine Sambac, Orange Blossom & Petalia Musk",
        "similarity_percentage": 94
    },
    "afnan-turathi-purple": {
        "dna_inspiration": "Gucci Guilty Absolute Pour Femme",
        "dna_type": "Cardamom, Black Pepper, Red Berries, Blackberry, Oakmoss & Patchouli",
        "similarity_percentage": 93
    },
    "afnan-highness-iv": {
        "dna_inspiration": "Armani Privé Rose d'Arabie",
        "dna_type": "Velvet Rose, Saffron, Patchouli, Golden Amber & Royal Agarwood",
        "similarity_percentage": 94
    },
    "afnan-naseej-al-khuzama": {
        "dna_inspiration": "French Lavender, Orange Blossom, Gardenia & Fine Suede",
        "dna_type": "Calming Lavender, Orange Blossom, Gardenia, Pink Pepper & Suede Leather",
        "similarity_percentage": 92
    },
    "afnan-naseej-al-ward": {
        "dna_inspiration": "Louis Vuitton Les Sables Roses",
        "dna_type": "Centifolia Rose, Bulgarian Rose, Raspberry, Saffron & Smoky Agarwood",
        "similarity_percentage": 94
    },
    "afnan-naseej-al-ehsaas": {
        "dna_inspiration": "Fresh Mandarin, Dewy Lily of the Valley & White Oud",
        "dna_type": "Zesty Mandarin, Bergamot, Dewy Lily of the Valley & Soft White Agarwood",
        "similarity_percentage": 92
    },
    "afnan-musk-abiyad": {
        "dna_inspiration": "Clean White Musk, Soapy Florals & Powdery Vanilla",
        "dna_type": "Pure White Musk, Dewy Lilac, Powdery Sandalwood & Madagascar Vanilla",
        "similarity_percentage": 93
    },
    "armaf-belle": {
        "dna_inspiration": "Christian Dior J'adore",
        "dna_type": "Pear, Melon, Peach, Jasmine Sambac, Lily of the Valley & Soft Vanilla",
        "similarity_percentage": 94
    },
    "armaf-futura-la-femme": {
        "dna_inspiration": "Christian Dior J'adore / Miss Dior Blooming Bouquet",
        "dna_type": "Mandarin Orange, Pink Peony, Apricot, Peach & White Musk Vanilla",
        "similarity_percentage": 93
    },
    "armaf-magnificent-pour-femme": {
        "dna_inspiration": "Lancôme Trésor Midnight Rose",
        "dna_type": "Sweet Raspberry, Blackcurrant, Pink Pepper, Damask Rose & Patchouli",
        "similarity_percentage": 95
    },
    "armaf-tres-jour-pour-femme": {
        "dna_inspiration": "Givenchy Ange Ou Demon Le Secret",
        "dna_type": "Green Tea, Amalfi Lemon, Neroli, White Jasmine & Cedar Musk",
        "similarity_percentage": 94
    },
    "armaf-q-donna": {
        "dna_inspiration": "Dolce & Gabbana The One Desire",
        "dna_type": "Mandarin, Lychee, Freesia, Tuberose, Caramel Vanilla & Sandalwood",
        "similarity_percentage": 92
    },
    "armaf-le-femme": {
        "dna_inspiration": "By Kilian Forbidden Games",
        "dna_type": "Crisp Apple, Peach, Plum, Orange Blossom, Jasmine & Warm Vanilla",
        "similarity_percentage": 92
    },
    "armaf-bucephalus-no-ix": {
        "dna_inspiration": "Hermès Terre d'Hermès / Spiced Woody Amber",
        "dna_type": "Grapefruit, Mandarin, Black Pepper, Cedarwood & Warm Benzoin Amber",
        "similarity_percentage": 92
    },
    "apex-ajmal-aristocrat": {
        "dna_inspiration": "Fresh Watermelon, Citrus, Lavender & Cedar Ambroxan (Ajmal Original)",
        "dna_type": "Crisp Watermelon, Lime, Bergamot, Lavender, Cedarwood & Ambroxan",
        "similarity_percentage": 95
    },
    "apex-mykonos-cafedrops": {
        "dna_inspiration": "Maison Margiela Coffee Break / Montale Intense Cafe",
        "dna_type": "Roasted Coffee Beans, Steamed Milk, Salted Caramel & Vanilla",
        "similarity_percentage": 94
    },
    "apex-ruebroca-theoremmatrix": {
        "dna_inspiration": "Creed Absolu Aventus",
        "dna_type": "Smoky Pineapple, Blackcurrant, Cardamom, Ginger & Birch Oakmoss",
        "similarity_percentage": 95
    }
}

# 2. General Abbreviation Cleanup Map
ABBREVIATION_SUBS = [
    (r"\bLV\b", "Louis Vuitton"),
    (r"\bJPG\b", "Jean Paul Gaultier"),
    (r"\bTF\b", "Tom Ford"),
    (r"\bYSL\b", "Yves Saint Laurent"),
    (r"\bPDM\b", "Parfums de Marly"),
    (r"\bMFK\b", "Maison Francis Kurkdjian"),
    (r"\bBR\s*540\b", "Baccarat Rouge 540"),
    (r"\bADG\b", "Acqua Di Giò"),
    (r"\bBDC\b", "Bleu de Chanel"),
    (r"Le belle paradise garden", "Le Beau Paradise Garden"),
    (r"Stronger with you", "Stronger With You"),
    (r"Pacific chill", "Pacific Chill"),
    (r"Afternoon swim", "Afternoon Swim"),
    (r"Ombre Nomad\b", "Ombre Nomade"),
    (r"Terre d'Hermes\b", "Terre d'Hermès"),
    (r"One Million\b", "Paco Rabanne 1 Million")
]

applied_count = 0
for item in data:
    fid = item["id"]
    if fid in TARGET_REMEDIATIONS:
        patch = TARGET_REMEDIATIONS[fid]
        for k, v in patch.items():
            item[k] = v
        applied_count += 1
    
    # Clean abbreviations in dna_inspiration
    dna = item.get("dna_inspiration", "")
    new_dna = dna
    for pat, rep in ABBREVIATION_SUBS:
        new_dna = re.sub(pat, rep, new_dna)
    
    # Deduplicate repetitive brand names like "Louis Vuitton Louis Vuitton" or "Parfums de Marly Parfums de Marly"
    new_dna = re.sub(r"(Louis Vuitton\s+)+", "Louis Vuitton ", new_dna)
    new_dna = re.sub(r"(Jean Paul Gaultier\s+)+", "Jean Paul Gaultier ", new_dna)
    new_dna = re.sub(r"(Tom Ford\s+)+", "Tom Ford ", new_dna)
    new_dna = re.sub(r"(Yves Saint Laurent\s+)+", "Yves Saint Laurent ", new_dna)
    new_dna = re.sub(r"(Parfums de Marly\s+)+", "Parfums de Marly ", new_dna)
    new_dna = re.sub(r"(Maison Francis Kurkdjian\s+)+", "Maison Francis Kurkdjian ", new_dna)
    new_dna = new_dna.strip()
    
    item["dna_inspiration"] = new_dna

print(f"Applied specific targeted remediations to {applied_count} items.")

# 3. Integrity Verifications
print("\nRunning integrity checks...")
for item in data:
    fid = item["id"]
    orig = original_checks[fid]
    
    # Price integrity
    p_curr = item.get("community_price")
    p_orig = orig["price"]
    assert str(p_curr) == str(p_orig), f"Price altered on {fid}: {p_orig} -> {p_curr}"
    
    # Stock integrity
    assert item.get("in_seller_stock") == orig["stock"], f"Stock flag altered on {fid}"
    
    # Sellers count integrity
    assert len(item.get("community_sellers", [])) == orig["sellers_count"], f"Sellers altered on {fid}"
    
    # Decants count integrity
    assert len(item.get("community_decants", [])) == orig["decants_count"], f"Decants altered on {fid}"
    
    # No NaN prices
    assert str(p_curr).lower() != "nan", f"NaN price detected on {fid}"

print("All integrity assertions passed!")

with open(FRAGRANCES_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Saved updated fragrances.json successfully.")
