import json

rasasi_fragrances = [
  {
    "id": "rasasi-hawas-for-men",
    "name": "Hawas for Men",
    "brand": "Rasasi",
    "collection": "Hawas Line",
    "rating_value": 4.36,
    "rating_count": 13400,
    "gender": "Men",
    "release_year": 2015,
    "concentration": "Eau de Parfum",
    "primary_season": "Summer",
    "dna_inspiration": "Paco Rabanne Invictus Aqua + Sweet Plum",
    "dna_type": "Fruity Aquatic Powerhouse",
    "similarity_percentage": 94,
    "price_usd": 48,
    "accords": [
      { "name": "Marine / Aquatic", "score": 100, "color": "#0284c7" },
      { "name": "Citrus", "score": 90, "color": "#eab308" },
      { "name": "Fruity", "score": 88, "color": "#f97316" },
      { "name": "Aromatic", "score": 80, "color": "#16a34a" },
      { "name": "Ambergris", "score": 75, "color": "#d97706" }
    ],
    "notes": {
      "top": ["Apple", "Bergamot", "Lemon", "Cinnamon"],
      "middle": ["Watery Notes", "Plum", "Orange Blossom", "Cardamom"],
      "base": ["Ambergris", "Musk", "Patchouli", "Driftwood"]
    },
    "seasons": { "summer": 62, "spring": 26, "fall": 10, "winter": 2 },
    "day_night": { "day": 76, "night": 24 },
    "longevity": "Eternal (10+ hrs)",
    "sillage": "Enormous (Room Filler)",
    "review_summary": {
      "pros": [
        "Legendary high-heat projector with sweet purple plum and aquatic ambergris",
        "Absolute compliment monster in heat and club settings",
        "Iconic python-embossed bottle cap"
      ],
      "cons": [
        "Very popular, high counterfeits on unverified sites"
      ],
      "community_verdict": "The undisputed king of summer performance. Sweet, watery, masculine, and beast mode.",
      "top_reviewer_quotes": [
        "Lasts 12 hours easily in 90-degree humid summer. Gets compliments from strangers everywhere."
      ]
    },
    "flankers": ["rasasi-hawas-ice"],
    "dna_twins": ["rayhaan-pacific", "afnan-9am-dive", "titan-skinn-amalfi-bleu"]
  },
  {
    "id": "rasasi-hawas-ice",
    "name": "Hawas Ice",
    "brand": "Rasasi",
    "collection": "Hawas Line",
    "rating_value": 4.45,
    "rating_count": 3100,
    "gender": "Men",
    "release_year": 2023,
    "concentration": "Eau de Parfum",
    "primary_season": "Summer",
    "dna_inspiration": "Frozen Hawas with Icy Mint & Italian Citrus",
    "dna_type": "Icy Aquatic Flanker",
    "similarity_percentage": 92,
    "price_usd": 55,
    "accords": [
      { "name": "Citrus", "score": 100, "color": "#eab308" },
      { "name": "Marine / Aquatic", "score": 92, "color": "#0284c7" },
      { "name": "Aromatic", "score": 85, "color": "#16a34a" },
      { "name": "Fruity", "score": 80, "color": "#f97316" },
      { "name": "Fresh Spicy", "score": 75, "color": "#06b6d4" }
    ],
    "notes": {
      "top": ["Frozen Lemon", "Sicilian Bergamot", "Apple", "Mint"],
      "middle": ["Plum", "Cardamom", "Orange Blossom"],
      "base": ["Ambergris", "Musk", "Moss", "Sandalwood"]
    },
    "seasons": { "summer": 70, "spring": 22, "fall": 6, "winter": 2 },
    "day_night": { "day": 80, "night": 20 },
    "longevity": "Eternal (10+ hrs)",
    "sillage": "Enormous (Room Filler)",
    "review_summary": {
      "pros": [
        "Adds frosty mint and sparkling frozen lemon to the beloved Hawas DNA",
        "Even fresher and less cloying than the original",
        "Incredible frosty gradient bottle presentation"
      ],
      "cons": [
        "Priced slightly higher than standard Hawas"
      ],
      "community_verdict": "The 2023 viral sensation that took original Hawas and made it crisper, colder, and even more magnetic.",
      "top_reviewer_quotes": [
        "Like drinking iced sparkling lemonade with cold mint and sweet plums in the sun. 10/10 summer fragrance."
      ]
    },
    "flankers": ["rasasi-hawas-for-men"],
    "dna_twins": ["rayhaan-pacific", "titan-skinn-amalfi-bleu", "afnan-turathi-blue"]
  },
  {
    "id": "rasasi-la-yuqawam",
    "name": "La Yuqawam Pour Homme",
    "brand": "Rasasi",
    "collection": "La Yuqawam Collection",
    "rating_value": 4.33,
    "rating_count": 6800,
    "gender": "Men",
    "release_year": 2012,
    "concentration": "Eau de Parfum",
    "primary_season": "Winter",
    "dna_inspiration": "Tom Ford Tuscan Leather",
    "dna_type": "Direct Luxury Clone",
    "similarity_percentage": 96,
    "price_usd": 55,
    "accords": [
      { "name": "Leather", "score": 100, "color": "#78350f" },
      { "name": "Fruity", "score": 88, "color": "#f97316" },
      { "name": "Sweet", "score": 82, "color": "#ec4899" },
      { "name": "Amber", "score": 75, "color": "#d97706" },
      { "name": "Smoky", "score": 70, "color": "#475569" }
    ],
    "notes": {
      "top": ["Raspberry", "Saffron", "Thyme"],
      "middle": ["Olibanum (Frankincense)", "Jasmine", "Artemisia"],
      "base": ["Leather", "Black Suede", "Amber", "Woody Notes"]
    },
    "seasons": { "winter": 56, "fall": 35, "spring": 8, "summer": 1 },
    "day_night": { "night": 82, "day": 18 },
    "longevity": "Eternal (12+ hrs)",
    "sillage": "Enormous (Room Filler)",
    "review_summary": {
      "pros": [
        "Universally acknowledged as equal or superior to the $395 Tom Ford Tuscan Leather",
        "Opulent raspberry and buttery black suede leather blend",
        "Luxury magnetic wooden presentation box"
      ],
      "cons": [
        "Unforgiving heavy leather; strictly cold weather"
      ],
      "community_verdict": "A legendary benchmark in the clone realm. Rich, commanding, and impeccably blended.",
      "top_reviewer_quotes": [
        "Smells like rich sweet raspberry syrup spilled over a $5,000 brand-new Italian leather sofa."
      ]
    },
    "flankers": ["rasasi-shuhrah-pour-homme"],
    "dna_twins": ["afnan-rare-carbon", "lattafa-asad"]
  },
  {
    "id": "rasasi-fattan-pour-homme",
    "name": "Fattan Pour Homme",
    "brand": "Rasasi",
    "collection": "Fattan Line",
    "rating_value": 4.26,
    "rating_count": 3800,
    "gender": "Men",
    "release_year": 2018,
    "concentration": "Eau de Parfum",
    "primary_season": "Spring",
    "dna_inspiration": "Hermes Terre d'Hermes",
    "dna_type": "Direct Clone",
    "similarity_percentage": 93,
    "price_usd": 24,
    "accords": [
      { "name": "Woody", "score": 100, "color": "#854d0e" },
      { "name": "Earthy / Oakmoss", "score": 90, "color": "#4d7c0f" },
      { "name": "Citrus", "score": 85, "color": "#eab308" },
      { "name": "Aromatic", "score": 78, "color": "#16a34a" },
      { "name": "Fresh Spicy", "score": 70, "color": "#06b6d4" }
    ],
    "notes": {
      "top": ["Grapefruit", "Pink Pepper", "Bergamot"],
      "middle": ["Vetiver", "Cedar", "Patchouli", "Lily-of-the-Valley"],
      "base": ["Oakmoss", "Benzoin", "Amber"]
    },
    "seasons": { "spring": 44, "fall": 30, "summer": 20, "winter": 6 },
    "day_night": { "day": 78, "night": 22 },
    "longevity": "Long Lasting (8 hrs)",
    "sillage": "Moderate to Strong",
    "review_summary": {
      "pros": [
        "Sensational recreation of Terre d'Hermes for under $25",
        "Damp mineral vetiver, sparkling bitter grapefruit, and earthy cedar",
        "Executive mature elegance for business meetings"
      ],
      "cons": [
        "Heavy vetiver oakmoss base is earthy (not sweet)"
      ],
      "community_verdict": "The best budget Terre d'Hermes alternative available anywhere. Mature, crisp, and earthy.",
      "top_reviewer_quotes": [
        "Dirty citrus, flinty mineral rain, and damp green vetiver woods. Classy and timeless."
      ]
    },
    "flankers": [],
    "dna_twins": ["titan-skinn-verge", "afnan-turathi-blue"]
  },
  {
    "id": "rasasi-shuhrah-pour-homme",
    "name": "Shuhrah Pour Homme",
    "brand": "Rasasi",
    "collection": "Classic Line",
    "rating_value": 4.12,
    "rating_count": 2900,
    "gender": "Men",
    "release_year": 2015,
    "concentration": "Eau de Parfum",
    "primary_season": "Winter",
    "dna_inspiration": "Smoky Herbal Tomato Leaf & Leather",
    "dna_type": "Unique Powerhouse Beast",
    "similarity_percentage": 95,
    "price_usd": 32,
    "accords": [
      { "name": "Smoky", "score": 100, "color": "#475569" },
      { "name": "Leather", "score": 90, "color": "#78350f" },
      { "name": "Green", "score": 82, "color": "#16a34a" },
      { "name": "Aromatic", "score": 75, "color": "#06b6d4" },
      { "name": "Woody", "score": 70, "color": "#854d0e" }
    ],
    "notes": {
      "top": ["Tomato Leaf", "Freesia", "Rose"],
      "middle": ["Rose", "Sandalwood", "Cedar", "Jasmine"],
      "base": ["Leather", "Agarwood (Oud)", "Oakmoss", "Amber", "Musk"]
    },
    "seasons": { "winter": 52, "fall": 36, "spring": 10, "summer": 2 },
    "day_night": { "night": 80, "day": 20 },
    "longevity": "Eternal (14+ hrs)",
    "sillage": "Enormous (Room Filler)",
    "review_summary": {
      "pros": [
        "Nuclear 14+ hour longevity; one spray fills an auditorium",
        "Unique crushed tomato leaf, dark rose, and ashy leather",
        "Unapologetic Middle Eastern presence"
      ],
      "cons": [
        "Extreme projection: can choke out a room if over-sprayed",
        "Divisive herbal smoky cigarette ash note"
      ],
      "community_verdict": "A legendary atomic bomb of a fragrance. Polarizing, dark, and eternally long-lasting.",
      "top_reviewer_quotes": [
        "1 spray is enough to survive a hurricane. Tomato leaf, smoke, and leather that lasts through two laundry cycles."
      ]
    },
    "flankers": ["rasasi-la-yuqawam"],
    "dna_twins": ["lattafa-badee-al-oud-oud-for-glory", "afnan-rare-carbon"]
  },
  {
    "id": "rasasi-daarej-pour-homme",
    "name": "Daarej Pour Homme",
    "brand": "Rasasi",
    "collection": "Classic Line",
    "rating_value": 4.19,
    "rating_count": 4200,
    "gender": "Men",
    "release_year": 2012,
    "concentration": "Eau de Parfum",
    "primary_season": "Winter",
    "dna_inspiration": "Valentino V Pour Homme",
    "dna_type": "Direct Clone",
    "similarity_percentage": 94,
    "price_usd": 22,
    "accords": [
      { "name": "Vanilla", "score": 100, "color": "#f59e0b" },
      { "name": "Warm Spicy", "score": 92, "color": "#c2410c" },
      { "name": "Sweet", "score": 85, "color": "#ec4899" },
      { "name": "Powdery", "score": 78, "color": "#9ca3af" },
      { "name": "Amber", "score": 72, "color": "#d97706" }
    ],
    "notes": {
      "top": ["Cumin", "Cardamom", "Artemisia"],
      "middle": ["Rose", "Orris Root"],
      "base": ["Vanilla", "Tonka Bean", "Amber", "Sandalwood", "Patchouli", "Musk"]
    },
    "seasons": { "winter": 52, "fall": 36, "spring": 10, "summer": 2 },
    "day_night": { "night": 78, "day": 22 },
    "longevity": "Long Lasting (8-9 hrs)",
    "sillage": "Strong",
    "review_summary": {
      "pros": [
        "Faithful recreation of the legendary discontinued Valentino V Pour Homme",
        "Sensual warm cumin, cardamom, and creamy vanilla orris root",
        "Tremendous value under $25"
      ],
      "cons": [
        "Cumin note in opening can read slightly spicy to some"
      ],
      "community_verdict": "A legendary discontinued gem brought back to life. Sensual, romantic, and cozy.",
      "top_reviewer_quotes": [
        "Sweet vanilla, orris, and warm spices. Seductive date-night compliment getter for $22."
      ]
    },
    "flankers": [],
    "dna_twins": ["lattafa-khamrah", "afnan-9pm", "titan-skinn-steele"]
  }
]

with open("src/data/fragrances.json", "r") as f:
    existing = json.load(f)

existing = [x for x in existing if x.get("brand") != "Rasasi"]
existing.extend(rasasi_fragrances)

with open("src/data/fragrances.json", "w") as f:
    json.dump(existing, f, indent=2)

print(f"Successfully updated! Total fragrances now: {len(existing)}")
