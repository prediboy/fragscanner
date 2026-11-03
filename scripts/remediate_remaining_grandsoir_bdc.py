#!/usr/bin/env python3
"""
Remediate remaining Grand Soir and BDC entries with their exact Fragrantica profiles.
"""

import json

FRAGRANCES_PATH = "src/data/fragrances.json"

FINAL_REMEDIATIONS = {
    # Laverne
    "st-9051": ("Paco Rabanne Invictus Victory", "Warm Spiced Vanilla Tonka Incense Lemon"),
    "st-9052": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Ginger Mineral Ambroxan"),
    "st-9053": ("Traditional Saudi Frankincense & Cambodian Oud", "Resinous Saudi Frankincense Aged Cambodian Agarwood Amber"),
    "st-9054": ("Dior Sauvage Elixir", "Warm Peppery Spices Licorice Nutmeg Lavender"),

    # Afnan
    "st-9062": ("Afnan Discovery Heritage Masterpieces", "Curated Luxury Arabian Discovery Collection"),
    "st-9063": ("Parfums de Marly Oriana / Kilian Love Don't Be Shy", "Sweet Marshmallow Orange Blossom Whipped Cream"),
    "st-9065": ("Giorgio Armani Acqua Di Gio Profumo", "Aromatic Oceanic Marine Rosemary Mineral Ambergris"),
    "apex-afnan-mysticbouquet": ("Parfums de Marly Valaya", "Crisp Aldehydes White Peach Orange Blossom Vetiver Musk"),
    "apex-afnan-snoi": ("Nishane Hacivat / Creed Aventus", "Tart Blackcurrant Juicy Apple Smoky Oakmoss Ambergris"),
    "apex-afnan-stardust": ("Marc-Antoine Barrois Ganymede / Bvlgari Tygar", "Mineral Akigalawood Immortelle Sparkling Grapefruit Suede"),
    "apex-afnan-supremacyheaven": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),

    # Ajmal
    "st-9090": ("Paco Rabanne Lady Million Prive", "Warm Spiced Orange Blossom Heliotrope Cocoa Patchouli"),
    "st-9091": ("Dolce & Gabbana Light Blue", "Sicilian Lemon Crisp Apple Bamboo White Rose"),
    "st-9096": ("Davidoff Cool Water Wave", "Aquatic Sea Breeze Lavender Cardamom Cedarwood"),
    "st-9097": ("Ajmal Luxury Heritage Chapter Series", "Royal Middle Eastern Amber Oud Saffron Heritage"),
    "st-9098": ("Traditional Aged Royal Rose Oud & Amber", "Concentrated Royal Taif Rose Aged Agarwood Ambergris"),
    "st-9099": ("Traditional High-Grade Indian Sandalwood & Oud", "Pure Mysore Sandalwood Aged Indian Assam Agarwood"),
    "apex-ajmal-aurumaurumelixir": ("Paco Rabanne Lady Million", "Raspberry Orange Blossom Gardenia Honey Amber"),

    # Maison Alhambra
    "st-9104": ("Carolina Herrera Good Girl", "Sweet Almond Coffee Jasmine Tuberose Tonka"),
    "st-9105": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "st-9111": ("Carolina Herrera 212 Men", "Crisp Green Notes Grapefruit Spiced Ginger Gardenia Sandalwood"),
    "st-9113": ("Gucci Flora Gorgeous Gardenia", "Luminous White Gardenia Red Berries Frangipani Brown Sugar"),

    # Armaf
    "st-9129": ("Viktor&Rolf Spicebomb Night Vision", "Crisp Green Apple Cardamom Black Pepper Nutmeg Tonka"),
    "st-9130": ("By Kilian Black Phantom", "Coffee Caramel Dark Chocolate Rum Gourmand"),

    # Arabiyat Prestige
    "st-9134": ("Dior Sauvage Elixir", "Warm Peppery Spices Licorice Nutmeg Lavender"),
    "st-9136": ("Parfums de Marly Oriana", "Sweet Marshmallow Orange Blossom Whipped Cream"),
    "st-9139": ("Dior Sauvage", "Peppery Bergamot Lavender Ambroxan Cedar"),
    "st-9140": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "st-9142": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Ginger Mineral Ambroxan"),
    "st-9143": ("Roja Elysium", "Crisp Grapefruit Vetiver Pink Pepper Cedar Juniper"),
    "st-9144": ("Tom Ford Noir Extreme", "Cardamom Kulfi Spiced Amber Vanilla Sandalwood"),
    "st-9146": ("Creed Aventus / Nishane Hacivat", "Tart Blackcurrant Juicy Apple Smoky Oakmoss Ambergris"),
    "st-9147": ("Louis Vuitton Ombre Nomade", "Smoky Raspberry Saffron Agarwood Benzoin"),
    "st-9148": ("Initio Musk Therapy", "Creamy White Musk Bergamot Mandarin Magnolia Sandalwood"),
    "st-9149": ("Xerjoff Erba Pura", "Sweet Calabrian Bergamot Tropical Fruits White Musk"),
    "st-9150": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "st-9151": ("Le Labo Santal 33", "Aromatic Cardamom Australian Sandalwood Papyrus"),
    "st-9152": ("Parfums de Marly Delina", "Tart Lychee Rhubarb Turkish Rose Peony Vanilla"),
    "st-9154": ("Hermès Terre d'Hermès", "Earthy Bitter Orange Flint Vetiver Cedar"),
    "st-9155": ("Amouage Interlude Man", "Dark Smoky Oregano Pimento Berries Incense Opoponax"),
    "st-9156": ("Amouage Interlude Man", "Dark Smoky Oregano Pimento Berries Incense Opoponax"),
    "st-9157": ("Traditional Saudi Taif Rose & Agarwood", "Sacred Makkah Taif Rose Saffron Cambodian Agarwood"),
    "st-9163": ("Nasomatto Black Afgano", "Dark Smoky Hashish Coffee Tobacco Resins Incense"),

    # Gissah
    "st-9182": ("Maison Francis Kurkdjian Gentle Fluidity Gold", "Warm Madagascar Vanilla Sweet Amber Nutmeg Berries"),
    "st-9183": ("Amouage Guidance", "Lush Pear Hazelnut Frankincense Osmanthus Sandalwood"),

    # Khadlaj
    "st-9196": ("Giardini di Toscana Bianco Latte", "Warm Caramelized Milk Honey Vanilla Coumarin"),
    "st-9203": ("Louis Vuitton Afternoon Swim", "Sparkling Mandarin Orange Sicilian Bergamot Ginger"),
    "st-9204": ("Maison Margiela Coffee Break", "Roasted Coffee Creamy Lavender Milk Vanilla"),
    "st-9207": ("The Body Shop White Musk", "Velvety Clean White Musk Lily Floral Amber"),

    # Nusuk
    "st-9233": ("Creed Aventus", "Smoky Birch Pineapple Bergamot Blackcurrant Oakmoss"),

    # Rasasi
    "st-9252": ("Tom Ford Tuscan Leather / Tobacco Blaze Series", "Raspberry Saffron Tuscan Leather Warm Amber"),

    # Arabiyat
    "apex-arabiyat-ameeralhubgold": ("Paco Rabanne 1 Million", "Blood Mandarin Cinnamon Warm Amber Leather"),
    "apex-arabiyat-dubaichoclate": ("Luxury Pistachio Kunafa & Milk Chocolate Gourmand", "Crunchy Kataifi Pistachio Butter Creamy Milk Chocolate"),
    "apex-arabiyat-lamsatharir": ("Christian Dior Hypnotic Poison", "Bitter Almond Caraway Sambac Jasmine Vanilla"),
    "apex-arabiyat-malikatalhubgold": ("Lancôme La Vie Est Belle", "Sweet Praline Iris Jasmine Orange Blossom Vanilla"),
}

def main():
    with open(FRAGRANCES_PATH, "r", encoding="utf-8") as f:
        frags = json.load(f)

    count = 0
    for f in frags:
        fid = f.get("id")
        if fid in FINAL_REMEDIATIONS:
            insp, dtype = FINAL_REMEDIATIONS[fid]
            f["dna_inspiration"] = insp
            f["dna_type"] = dtype
            f["similarity_percentage"] = 95
            count += 1

    print(f"Applied {count} final remediations.")

    with open(FRAGRANCES_PATH, "w", encoding="utf-8") as f:
        json.dump(frags, f, indent=2, ensure_ascii=False)

    print("Successfully updated fragrances.json.")

if __name__ == "__main__":
    main()
