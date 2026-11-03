#!/usr/bin/env python3
"""
Final precision standardizations for scent twins and clone benchmarks.
"""

import json

FRAGRANCES_PATH = "src/data/fragrances.json"

EXACT_STANDARDIZATIONS = {
    "lattafa-raghba": ("Maison Margiela By The Fireplace", "Warm Caramelized Sugar Guaiac Wood Vanilla"),
    "lattafa-raghba-wood-intense": ("Maison Margiela By The Fireplace", "Smoky Caramelized Sugar Guaiac Wood Vanilla"),
    "lattafa-ameer-al-oud": ("Maison Margiela By The Fireplace", "Smoky Chestnuts Warm Caramel Sugar Vanilla Wood"),
    "st-9224": ("Maison Margiela By The Fireplace", "Smoky Chestnuts Warm Caramel Sugar Vanilla Wood"),
    "mykonos-inception": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea Ginger Ambroxan"),
    "st-9055": ("Chanel Bleu de Chanel / Bakhur Incense", "Deep Citrus Incense Amber Bakhur"),
    "st-9058": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea Ginger Ambroxan"),
    "st-9080": ("Traditional Royal Indian Rose Oud", "Sacred Indian Agarwood Damask Rose Amber"),
    "st-9084": ("Rasasi Hawas Ice", "Frozen Mint Zesty Italian Lemon Plum Ambroxan"),
    "st-9093": ("Traditional Aged Cambodi Agarwood & Saffron", "Deep Resinous Cambodian Agarwood & Golden Saffron"),
    "st-9100": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "st-9122": ("Christian Dior Oud Ispahan", "Damask Rose Labdanum Agarwood Patchouli"),
    "st-9153": ("Maison Francis Kurkdjian Oud Satin Mood", "Turkish Rose Bulgarian Rose Violet Sweet Oud Vanilla"),
    "st-9174": ("Emporio Armani Stronger With You Absolutely", "Boozy Rum Sweet Chestnut Cedar Vanilla"),
    "st-9175": ("Emporio Armani Stronger With You Oud", "Smoky Chestnut Sweet Vanilla Natural Agarwood"),
    "st-9179": ("Orto Parisi Megamare", "Nuclear Salty Marine Seaweed Ambergris"),
    "st-9189": ("Roja Elysium", "Sparkling Grapefruit Vetiver Pink Pepper Cedar"),
    "st-9202": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "st-9212": ("Parfums de Marly Haltane", "Sweet Praline Herbal Clary Sage Saffron Oud"),
    "st-9213": ("Dior Fahrenheit 32", "Orange Blossom Frosted Vanilla Woody Vetiver"),
    "st-9214": ("Yves Saint Laurent La Nuit de L'Homme Bleu Électrique", "Spiced Cardamom Ginger Lavender Cedarwood"),
    "st-9261": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "st-9274": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea Ginger Ambroxan"),
    "st-9278": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),
    "st-9279": ("Initio Atomic Rose", "Hedione Turkish Rose Peppery Amber"),
    "st-9280": ("Initio Oud for Greatness", "Natural Agarwood Saffron Nutmeg Lavender"),
    "st-9282": ("Chanel Allure Homme Sport", "Crisp Mandarin Sea Notes Neroli Cedar Amber"),
    "st-9291": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea Ginger Ambroxan"),
    "apex-arabiyatprestige-hypnoticoud": ("Initio Oud for Greatness", "Natural Agarwood Saffron Nutmeg Lavender"),
    "apex-ibraq-frenchtobacco": ("Parfums de Marly Carlisle", "Warm Spiced Nutmeg Green Apple Tonka Tobacco Vanilla"),
    "apex-arabiyat-prestigemarwa": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea Ginger Ambroxan"),
    "lattafa-teriaq": ("Thierry Mugler Angel / Quentin Bisch Gourmand Leather", "Gourmand Honey Plum Bitter Almond Leather"),
}

def main():
    with open(FRAGRANCES_PATH, "r", encoding="utf-8") as f:
        frags = json.load(f)

    for f in frags:
        fid = f.get("id")
        if fid in EXACT_STANDARDIZATIONS:
            insp, dtype = EXACT_STANDARDIZATIONS[fid]
            f["dna_inspiration"] = insp
            f["dna_type"] = dtype
            f["similarity_percentage"] = 96
        
        # Standardize abbreviations
        insp = f.get("dna_inspiration", "")
        if insp == "LV Imagination":
            f["dna_inspiration"] = "Louis Vuitton Imagination"
        elif insp == "By the Fire place":
            f["dna_inspiration"] = "Maison Margiela By The Fireplace"

    with open(FRAGRANCES_PATH, "w", encoding="utf-8") as f:
        json.dump(frags, f, indent=2, ensure_ascii=False)

    print("Successfully standardized exact scent twins.")

if __name__ == "__main__":
    main()
