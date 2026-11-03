import json

FRAGRANCES_PATH = "src/data/fragrances.json"

with open(FRAGRANCES_PATH, "r", encoding="utf-8") as f:
    frags = json.load(f)

for f in frags:
    if f["id"] == "st-9166" or f["name"].strip().lower() == "nitro blue":
        f["dna_inspiration"] = "Parfums de Marly Pegasus"
        f["dna_type"] = "Sweet Powdery Bitter Almond, Praline & Warm Amber"
        f["similarity_percentage"] = 94
        f["primary_season"] = "Fall / Winter"
        f["notes"] = {
            "top": ["Orange Blossom", "Cinnamon", "Sage", "Lemon", "Basil"],
            "middle": ["Praline", "Tolu Balsam", "Black Cardamom", "Woody Notes"],
            "base": ["Black Amber", "Vanilla", "Patchouli", "Brazilian Rosewood"]
        }
        f["accords"] = [
            {"name": "Warm Spicy", "score": 95, "color": "#d97706"},
            {"name": "Sweet Gourmand", "score": 90, "color": "#f59e0b"},
            {"name": "Amber", "score": 85, "color": "#b45309"},
            {"name": "Almond / Nutty", "score": 80, "color": "#eab308"},
            {"name": "Woody", "score": 75, "color": "#78350f"}
        ]
        f["description"] = (
            "Dumont Nitro Blue is an intoxicating warm sweet spicy and almond gourmand fragrance. "
            "Features opulent notes of cinnamon, praline, tolu balsam, and rich black amber. "
            "Celebrated across Fragrantica as a high-projection, creamy almond-vanilla twin to Parfums de Marly Pegasus."
        )
        if "review_summary" in f and isinstance(f["review_summary"], dict):
            f["review_summary"]["community_verdict"] = (
                "A standout winter/fall beast-mode release from Dumont. Loved for its sweet praline, warm cinnamon, "
                "and creamy almond-amber drydown reminiscent of Parfums de Marly Pegasus. Offers exceptional 8-10+ hour longevity."
            )

with open(FRAGRANCES_PATH, "w", encoding="utf-8") as f:
    json.dump(frags, f, indent=2, ensure_ascii=False)

print("Successfully updated Dumont Nitro Blue in fragrances.json.")
