const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "../src/data/fragrances.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

const newPerfumes = [
  {
    id: "maison-alhambra-porto-neroli",
    name: "Porto Neroli",
    brand: "Maison Alhambra",
    collection: "Tom Ford Impression Line",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2022,
    rating_value: 4.28,
    rating_count: 3100,
    dna_type: "Citrus White Floral Aromatic",
    dna_inspiration: "Tom Ford Neroli Portofino",
    similarity_percentage: 92,
    primary_season: "Summer",
    day_night: { day: 85, night: 15 },
    seasons: { summer: 75, spring: 20, fall: 4, winter: 1 },
    longevity: "Moderate (5-7 hrs)",
    sillage: "Moderate (Arm's Length)",
    accords: [
      { name: "Citrus", score: 96, color: "#eab308" },
      { name: "White Floral", score: 88, color: "#f8fafc" },
      { name: "Green", score: 72, color: "#22c55e" },
      { name: "Aromatic", score: 65, color: "#06b6d4" }
    ],
    notes: {
      top: ["Neroli", "Lemon", "Mandarin Orange", "Bitter Orange", "Jasmine"],
      middle: ["Orange Blossom", "Lavender", "Sea Salt"],
      base: ["Amber", "Herbal Notes", "Wormwood"]
    },
    review_summary: {
      pros: ["Exceptional 90%+ similarity to Tom Ford Neroli Portofino", "Crisp, sun-soaked Mediterranean citrus and soapy neroli", "Outstanding summer high-heat performance for the price"],
      cons: ["Requires 4-6 sprays for full projection", "Benefits from macerating 2-3 weeks"],
      community_verdict: "The reigning king of budget Mediterranean neroli fragrances.",
      top_reviewer_quotes: ["Photocopy of Neroli Portofino at 1/10th the price."]
    },
    aliases: ["Porto Neroli", "Maison Alhambra Porto Neroli"]
  },
  {
    id: "maison-alhambra-fabulo-intense",
    name: "Fabulo Intense",
    brand: "Maison Alhambra",
    collection: "Tom Ford Impression Line",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2022,
    rating_value: 4.25,
    rating_count: 2400,
    dna_type: "Leather Almond Vanilla Aromatic",
    dna_inspiration: "Tom Ford Fucking Fabulous",
    similarity_percentage: 90,
    primary_season: "Winter",
    day_night: { day: 25, night: 75 },
    seasons: { winter: 65, fall: 25, spring: 8, summer: 2 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Strong (6 ft+)",
    accords: [
      { name: "Leather", score: 95, color: "#78350f" },
      { name: "Almond", score: 88, color: "#fef08a" },
      { name: "Vanilla", score: 82, color: "#f59e0b" },
      { name: "Aromatic", score: 74, color: "#10b981" }
    ],
    notes: {
      top: ["Lavender", "Clary Sage"],
      middle: ["Bitter Almond", "Vanilla", "Orris Root"],
      base: ["Leather", "White Woods", "Cashmeran", "Tonka Bean", "Amber"]
    },
    review_summary: {
      pros: ["Rich bitter almond and smooth leather drydown", "Deep powdery vanillic warmth", "Sophisticated evening and cool-weather presence"],
      cons: ["Opening can be sharp for the first 5 minutes"],
      community_verdict: "A luxurious leather-almond alternative with serious depth.",
      top_reviewer_quotes: ["Creamy bitter almond and leather perfection."]
    },
    aliases: ["Fabulo Intense", "Fusion Intense", "Maison Alhambra Fabulo Intense"]
  },
  {
    id: "maison-alhambra-delilah",
    name: "Delilah",
    brand: "Maison Alhambra",
    collection: "Maison Alhambra Feminine Line",
    concentration: "Eau de Parfum",
    gender: "Women",
    release_year: 2023,
    rating_value: 4.38,
    rating_count: 2800,
    dna_type: "Floral Fruity Rose Fresh",
    dna_inspiration: "Parfums de Marly Delina",
    similarity_percentage: 92,
    primary_season: "Spring",
    day_night: { day: 70, night: 30 },
    seasons: { spring: 60, summer: 25, fall: 12, winter: 3 },
    longevity: "Long Lasting (8-10 hrs)",
    sillage: "Strong (Room Filler)",
    accords: [
      { name: "Rose", score: 98, color: "#f43f5e" },
      { name: "Floral", score: 92, color: "#fb7185" },
      { name: "Fruity", score: 85, color: "#f97316" },
      { name: "Fresh", score: 76, color: "#38bdf8" }
    ],
    notes: {
      top: ["Rhubarb", "Litchi", "Bergamot"],
      middle: ["Turkish Rose", "Peony", "Lily"],
      base: ["Cashmeran", "Vanilla", "White Musk"]
    },
    review_summary: {
      pros: ["Captures the iconic tart rhubarb and dewy Turkish rose DNA", "Enormous sillage and compliment pull", "Very close to Parfums de Marly Delina"],
      cons: ["Ultra-feminine; not unisex"],
      community_verdict: "The definitive budget queen of the Delina DNA.",
      top_reviewer_quotes: ["Princess in a bottle. Stunning Turkish rose and lychee."]
    },
    aliases: ["Delilah", "Maison Alhambra Delilah", "Delilah Pour Femme"]
  },
  {
    id: "maison-alhambra-dark-door-intense",
    name: "Dark Door Intense",
    brand: "Maison Alhambra",
    collection: "Maison Alhambra Elegance Line",
    concentration: "Eau de Parfum",
    gender: "Men",
    release_year: 2022,
    rating_value: 4.36,
    rating_count: 1900,
    dna_type: "Powdery Iris Woody Floral",
    dna_inspiration: "Dior Homme Intense",
    similarity_percentage: 90,
    primary_season: "Fall",
    day_night: { day: 20, night: 80 },
    seasons: { fall: 50, winter: 40, spring: 8, summer: 2 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Moderate to Strong",
    accords: [
      { name: "Iris", score: 98, color: "#818cf8" },
      { name: "Powdery", score: 92, color: "#e2e8f0" },
      { name: "Woody", score: 80, color: "#78350f" },
      { name: "Earthy", score: 70, color: "#a16207" }
    ],
    notes: {
      top: ["Lavender"],
      middle: ["Iris", "Ambrette (Musk Mallow)", "Pear"],
      base: ["Virginia Cedar", "Vetiver"]
    },
    review_summary: {
      pros: ["Masterful powdery lipstick iris execution", "Seductive ambrette and cocoa-pear warmth", "Classy evening date-night scent"],
      cons: ["Iris DNA is an acquired taste for freshie fans"],
      community_verdict: "Sophisticated Dior Homme Intense DNA at an unbeatable price.",
      top_reviewer_quotes: ["Luxurious powdery iris with creamy cedar. Stunning."]
    },
    aliases: ["Dark Door Intense", "Maison Alhambra Dark Door Intense"]
  },
  {
    id: "maison-alhambra-jean-lowe-fantasme",
    name: "Jean Lowe Fantasme",
    brand: "Maison Alhambra",
    collection: "Jean Lowe Collection",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2024,
    rating_value: 4.41,
    rating_count: 1500,
    dna_type: "Citrus Aromatic Tea Ambroxan",
    dna_inspiration: "Louis Vuitton Imagination",
    similarity_percentage: 93,
    primary_season: "Summer",
    day_night: { day: 80, night: 20 },
    seasons: { summer: 65, spring: 25, fall: 8, winter: 2 },
    longevity: "Long Lasting (8-10 hrs)",
    sillage: "Strong (Room Filler)",
    accords: [
      { name: "Citrus", score: 95, color: "#eab308" },
      { name: "Fresh Spicy", score: 85, color: "#10b981" },
      { name: "Green Tea", score: 80, color: "#84cc16" },
      { name: "Ambroxan", score: 75, color: "#06b6d4" }
    ],
    notes: {
      top: ["Citron", "Calabrian Bergamot", "Sicilian Orange"],
      middle: ["Nigerian Ginger", "Tunisian Neroli", "Ceylon Cinnamon"],
      base: ["Chinese Black Tea", "Ambroxan", "Olibanum", "Guaiac Wood"]
    },
    review_summary: {
      pros: ["Top-tier LV Imagination clone with luminous citrus and soapy black tea", "Sparkling ginger that lasts into the drydown", "Universal crowd pleaser"],
      cons: ["Rare and frequently out of stock"],
      community_verdict: "One of the most refined LV Imagination interpretations available.",
      top_reviewer_quotes: ["Sparkling black tea, citrus, and ginger elegance."]
    },
    aliases: ["Jean Lowe Fantasme", "Jean Lowe Fantasy", "Maison Alhambra Jean Lowe Fantasme"]
  },
  {
    id: "maison-alhambra-jean-lowe-maitre",
    name: "Jean Lowe Maître",
    brand: "Maison Alhambra",
    collection: "Jean Lowe Collection",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2023,
    rating_value: 4.30,
    rating_count: 1100,
    dna_type: "Woody Floral Oud Rose",
    dna_inspiration: "Louis Vuitton Matière Noire",
    similarity_percentage: 91,
    primary_season: "Fall",
    day_night: { day: 30, night: 70 },
    seasons: { fall: 45, winter: 40, spring: 12, summer: 3 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Strong (Arm's Length+)",
    accords: [
      { name: "Woody", score: 90, color: "#78350f" },
      { name: "Floral", score: 85, color: "#f43f5e" },
      { name: "Rose", score: 80, color: "#fb7185" },
      { name: "Oud", score: 75, color: "#451a03" }
    ],
    notes: {
      top: ["Narcissus", "Jasmine", "Blackcurrant"],
      middle: ["Rose", "Cyclamen"],
      base: ["Agarwood (Oud)", "Patchouli", "Incense"]
    },
    review_summary: {
      pros: ["Rich dewy dark floral rose with smooth oriental oud", "Formerly called Jean Lowe Matiere", "Dark, opulent, and highly unique"],
      cons: ["Complex dark profile not for casual freshie lovers"],
      community_verdict: "Sophisticated Louis Vuitton dark rose-oud DNA.",
      top_reviewer_quotes: ["Dark narcissus and smoky agarwood mystery."]
    },
    aliases: ["Jean Lowe Maitre", "Jean Lowe Matiere", "Maison Alhambra Jean Lowe Maitre", "Jean Lowe Master"]
  },
  {
    id: "maison-alhambra-rose-petals",
    name: "Rose Petals",
    brand: "Maison Alhambra",
    collection: "Tom Ford Impression Line",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2022,
    rating_value: 4.22,
    rating_count: 1400,
    dna_type: "Rose Warm Spicy Patchouli",
    dna_inspiration: "Tom Ford Rose Prick",
    similarity_percentage: 90,
    primary_season: "Spring",
    day_night: { day: 60, night: 40 },
    seasons: { spring: 50, fall: 30, winter: 15, summer: 5 },
    longevity: "Moderate (6-8 hrs)",
    sillage: "Moderate to Strong",
    accords: [
      { name: "Rose", score: 98, color: "#f43f5e" },
      { name: "Warm Spicy", score: 85, color: "#ea580c" },
      { name: "Patchouli", score: 78, color: "#065f46" },
      { name: "Floral", score: 72, color: "#fb7185" }
    ],
    notes: {
      top: ["Sichuan Pepper", "Turmeric"],
      middle: ["May Rose", "Bulgarian Rose", "Turkish Rose"],
      base: ["Patchouli", "Tonka Bean"]
    },
    review_summary: {
      pros: ["Peppery, spicy triple-rose bouquet", "Vibrant turmeric and Sichuan pepper opening", "Faithful take on Tom Ford Rose Prick"],
      cons: ["Heavy pepper opening takes 10 mins to settle"],
      community_verdict: "Spicy, thorny luxury rose on a warm patchouli base.",
      top_reviewer_quotes: ["Spicy pepper and trio of roses with great longevity."]
    },
    aliases: ["Rose Petals", "Maison Alhambra Rose Petals"]
  },
  {
    id: "maison-alhambra-bright-peach",
    name: "Bright Peach",
    brand: "Maison Alhambra",
    collection: "Tom Ford Impression Line",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2022,
    rating_value: 4.19,
    rating_count: 2200,
    dna_type: "Fruity Sweet Boozy Amber",
    dna_inspiration: "Tom Ford Bitter Peach",
    similarity_percentage: 89,
    primary_season: "Fall",
    day_night: { day: 55, night: 45 },
    seasons: { fall: 45, spring: 30, winter: 15, summer: 10 },
    longevity: "Moderate to Long (7-8 hrs)",
    sillage: "Strong (Room Filler)",
    accords: [
      { name: "Peach", score: 98, color: "#fb923c" },
      { name: "Sweet", score: 90, color: "#f59e0b" },
      { name: "Fruity", score: 85, color: "#f97316" },
      { name: "Amber", score: 70, color: "#d97706" }
    ],
    notes: {
      top: ["Peach", "Blood Orange", "Cardamom", "Heliotrope"],
      middle: ["Rum", "Cognac", "Davana", "Jasmine"],
      base: ["Vanilla", "Indonesian Patchouli Leaf", "Tonka Bean", "Sandalwood"]
    },
    review_summary: {
      pros: ["Boozy ripe peach with blood orange and cognac", "Super sweet, playful, and projecting", "Very close to Bitter Peach"],
      cons: ["Extremely sweet in the opening"],
      community_verdict: "Cocktail of ripe boozy peaches and dark patchouli.",
      top_reviewer_quotes: ["Delicious boozy peach cocktail with impressive projection."]
    },
    aliases: ["Bright Peach", "Bright peach Leonee", "Maison Alhambra Bright Peach"]
  },
  {
    id: "maison-alhambra-baroque-rouge-540",
    name: "Baroque Rouge 540",
    brand: "Maison Alhambra",
    collection: "Maison Alhambra Luxury Line",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2022,
    rating_value: 4.30,
    rating_count: 3200,
    dna_type: "Amber Floral Warm Spicy Woody",
    dna_inspiration: "Maison Francis Kurkdjian Baccarat Rouge 540",
    similarity_percentage: 92,
    primary_season: "Fall",
    day_night: { day: 40, night: 60 },
    seasons: { fall: 40, winter: 35, spring: 20, summer: 5 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Enormous (Room Filler)",
    accords: [
      { name: "Amber", score: 96, color: "#d97706" },
      { name: "Almond", score: 88, color: "#fef08a" },
      { name: "Warm Spicy", score: 80, color: "#ea580c" },
      { name: "Woody", score: 75, color: "#78350f" }
    ],
    notes: {
      top: ["Jasmine", "Saffron"],
      middle: ["Amberwood", "Ambergris"],
      base: ["Fir Resin", "Cedar"]
    },
    review_summary: {
      pros: ["Airy burnt sugar and saffron aura identical to BR540", "Magnetic cedar and ambergris sillage trail", "Outstanding compliments"],
      cons: ["Can cause olfactory fatigue (nose blindness) easily"],
      community_verdict: "Top-value airy burnt sugar Baccarat Rouge 540 impression.",
      top_reviewer_quotes: ["Ethereal cotton candy and saffron trail that lasts all day."]
    },
    aliases: ["Baroque Rouge 540", "La Rouge Baroque", "Maison Alhambra Baroque Rouge 540", "Baroque Rouge"]
  },
  {
    id: "maison-alhambra-avant",
    name: "Avant",
    brand: "Maison Alhambra",
    collection: "Maison Alhambra Prestige Line",
    concentration: "Eau de Parfum",
    gender: "Men",
    release_year: 2022,
    rating_value: 4.20,
    rating_count: 1200,
    dna_type: "Fruity Smoky Birch Leather",
    dna_inspiration: "Creed Aventus",
    similarity_percentage: 88,
    primary_season: "Spring",
    day_night: { day: 75, night: 25 },
    seasons: { spring: 45, summer: 35, fall: 15, winter: 5 },
    longevity: "Moderate (6-7 hrs)",
    sillage: "Moderate (Arm's Length)",
    accords: [
      { name: "Fruity", score: 95, color: "#f97316" },
      { name: "Smoky", score: 82, color: "#52525b" },
      { name: "Leather", score: 78, color: "#78350f" },
      { name: "Woody", score: 72, color: "#92400e" }
    ],
    notes: {
      top: ["Pineapple", "Bergamot", "Black Currant", "Apple"],
      middle: ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"],
      base: ["Musk", "Oakmoss", "Ambergris", "Vanille"]
    },
    review_summary: {
      pros: ["Bright juicy pineapple opening", "Crisp birch smoke drydown", "Easy daily wear signature"],
      cons: ["Average longevity compared to Club de Nuit Intense Man"],
      community_verdict: "Lighter, fruitier take on the classic Aventus profile.",
      top_reviewer_quotes: ["Smooth juicy pineapple with gentle birch smoke."]
    },
    aliases: ["Avant", "Avant Pour Homme", "Maison Alhambra Avant"]
  },
  {
    id: "maison-alhambra-jorge-di-profumo-aqua",
    name: "Jorge di Profumo Aqua",
    brand: "Maison Alhambra",
    collection: "Jorge di Profumo Line",
    concentration: "Eau de Parfum",
    gender: "Men",
    release_year: 2023,
    rating_value: 4.27,
    rating_count: 1800,
    dna_type: "Marine Citrus Salty Aromatic",
    dna_inspiration: "Giorgio Armani Acqua di Giò",
    similarity_percentage: 91,
    primary_season: "Summer",
    day_night: { day: 85, night: 15 },
    seasons: { summer: 70, spring: 22, fall: 6, winter: 2 },
    longevity: "Moderate (6-7 hrs)",
    sillage: "Moderate",
    accords: [
      { name: "Marine", score: 98, color: "#0284c7" },
      { name: "Citrus", score: 92, color: "#eab308" },
      { name: "Aromatic", score: 80, color: "#10b981" },
      { name: "Salty", score: 75, color: "#38bdf8" }
    ],
    notes: {
      top: ["Lime", "Lemon", "Bergamot", "Jasmine", "Orange"],
      middle: ["Sea Notes", "Calone", "Rosemary", "Freesia", "Peach"],
      base: ["White Musk", "Cedar", "Oakmoss", "Patchouli", "Amber"]
    },
    review_summary: {
      pros: ["Invigorating Mediterranean sea breeze and calone", "Classic crowd-pulling Acqua di Gio freshness", "Ideal high heat gym or casual fragrance"],
      cons: ["Requires reapplication in intense heat"],
      community_verdict: "Crisp, timeless oceanic freshness that never offends.",
      top_reviewer_quotes: ["Sea salt, citrus, and crisp white musk at a steal."]
    },
    aliases: ["Jorge di Profumo Aqua", "Jorge Di Aqua", "Maison Alhambra Jorge di Profumo Aqua"]
  },
  {
    id: "maison-alhambra-mia-dolcezza",
    name: "Mia Dolcezza",
    brand: "Maison Alhambra",
    collection: "Maison Alhambra Feminine Line",
    concentration: "Eau de Parfum",
    gender: "Women",
    release_year: 2023,
    rating_value: 4.22,
    rating_count: 850,
    dna_type: "Sweet Fruity Floral Vanilla",
    dna_inspiration: "Dolce & Gabbana Pour Femme",
    similarity_percentage: 89,
    primary_season: "Spring",
    day_night: { day: 65, night: 35 },
    seasons: { spring: 50, fall: 25, summer: 15, winter: 10 },
    longevity: "Moderate (6-8 hrs)",
    sillage: "Moderate",
    accords: [
      { name: "Sweet", score: 94, color: "#f59e0b" },
      { name: "Fruity", score: 88, color: "#f97316" },
      { name: "Floral", score: 80, color: "#fb7185" },
      { name: "Vanilla", score: 75, color: "#fbbf24" }
    ],
    notes: {
      top: ["Bergamot", "Blackcurrant", "Pink Pepper"],
      middle: ["Jasmine", "Orange Blossom", "Tuberose", "Ylang-Ylang"],
      base: ["Amber", "Cashmeran", "Guaiac Wood", "Vanilla"]
    },
    review_summary: {
      pros: ["Sweet sparkling blackcurrant and tuberose", "Cozy cashmere vanilla finish", "Very comforting feminine profile"],
      cons: ["Moderate longevity on skin"],
      community_verdict: "Sensual sweet white floral and juicy berry elegance.",
      top_reviewer_quotes: ["Sweet berry and tuberose with a creamy vanilla drydown."]
    },
    aliases: ["Mia Dolcezza", "Maison Alhambra Mia Dolcezza"]
  },
  {
    id: "maison-alhambra-your-touch",
    name: "Your Touch",
    brand: "Maison Alhambra",
    collection: "Your Touch Line",
    concentration: "Eau de Parfum",
    gender: "Men",
    release_year: 2022,
    rating_value: 4.33,
    rating_count: 2600,
    dna_type: "Warm Spicy Vanilla Chestnut Sweet",
    dna_inspiration: "Emporio Armani Stronger With You",
    similarity_percentage: 92,
    primary_season: "Winter",
    day_night: { day: 25, night: 75 },
    seasons: { winter: 60, fall: 30, spring: 8, summer: 2 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Strong (6 ft+)",
    accords: [
      { name: "Warm Spicy", score: 95, color: "#ea580c" },
      { name: "Vanilla", score: 88, color: "#f59e0b" },
      { name: "Aromatic", score: 80, color: "#10b981" },
      { name: "Sweet", score: 75, color: "#f59e0b" }
    ],
    notes: {
      top: ["Cardamom", "Pink Pepper", "Mint", "Violet Leaf"],
      middle: ["Cinnamon", "Lavender", "Sage", "Watermelon", "Pineapple"],
      base: ["Vanilla", "Chestnut", "Amberwood", "Cedar", "Guaiac Wood"]
    },
    review_summary: {
      pros: ["Exceptional 90%+ match to Stronger With You", "Cardamom, chestnut, and vanilla compliment magnet", "Beast-mode cold weather performance"],
      cons: ["Too sweet and heavy for summer"],
      community_verdict: "Top-tier cozy sweet cardamom chestnut winter beast.",
      top_reviewer_quotes: ["Smells identical in the air to Stronger With You. Enormous compliments."]
    },
    aliases: ["Your Touch", "Your Touch (Men)", "Your Touch Men", "Maison Alhambra Your Touch"]
  },
  {
    id: "maison-alhambra-your-touch-women",
    name: "Your Touch Women",
    brand: "Maison Alhambra",
    collection: "Your Touch Line",
    concentration: "Eau de Parfum",
    gender: "Women",
    release_year: 2022,
    rating_value: 4.26,
    rating_count: 1400,
    dna_type: "Fruity Sweet Rose Vanilla",
    dna_inspiration: "Emporio Armani Because It's You",
    similarity_percentage: 90,
    primary_season: "Spring",
    day_night: { day: 65, night: 35 },
    seasons: { spring: 50, fall: 25, summer: 15, winter: 10 },
    longevity: "Long Lasting (7-8 hrs)",
    sillage: "Moderate to Strong",
    accords: [
      { name: "Sweet", score: 92, color: "#f59e0b" },
      { name: "Fruity", score: 88, color: "#f97316" },
      { name: "Rose", score: 82, color: "#f43f5e" },
      { name: "Vanilla", score: 75, color: "#fbbf24" }
    ],
    notes: {
      top: ["Raspberry", "Neroli", "Lemon"],
      middle: ["Rose"],
      base: ["Vanilla", "Musk", "Amberwood"]
    },
    review_summary: {
      pros: ["Juicy sparkling raspberry and romantic rose", "Sweet creamy vanilla drydown", "Flawless counterpart to Your Touch Men"],
      cons: ["Leans very youthful and sweet"],
      community_verdict: "Playful, charming raspberry rose with cozy vanilla.",
      top_reviewer_quotes: ["Juicy sweet raspberry and rose. Highly addictive."]
    },
    aliases: ["Your Touch (Women)", "Your Touch Women", "Maison Alhambra Your Touch Women"]
  },
  {
    id: "maison-alhambra-your-touch-santal",
    name: "Your Touch Santal",
    brand: "Maison Alhambra",
    collection: "Your Touch Line",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2023,
    rating_value: 4.31,
    rating_count: 980,
    dna_type: "Sandalwood Woody Warm Spicy Vanilla",
    dna_inspiration: "Emporio Armani Stronger With You Sandalwood",
    similarity_percentage: 91,
    primary_season: "Fall",
    day_night: { day: 30, night: 70 },
    seasons: { fall: 50, winter: 35, spring: 12, summer: 3 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Strong",
    accords: [
      { name: "Sandalwood", score: 95, color: "#b45309" },
      { name: "Woody", score: 88, color: "#78350f" },
      { name: "Warm Spicy", score: 80, color: "#ea580c" },
      { name: "Vanilla", score: 72, color: "#f59e0b" }
    ],
    notes: {
      top: ["Cardamom", "Pink Pepper", "Elemi"],
      middle: ["Lavender", "Sage", "Sandalwood"],
      base: ["Sandalwood", "Bourbon Vanilla", "Amberwood", "Guaiac Wood"]
    },
    review_summary: {
      pros: ["Creamy sandalwood infused into the Stronger With You DNA", "Drier, more masculine, and velvety smooth", "Exceptional longevity on clothes"],
      cons: ["Heavy for daytime office settings"],
      community_verdict: "Creamy sandalwood and warm cardamom comfort.",
      top_reviewer_quotes: ["Sandalwood elevates this way above the standard SWY clones."]
    },
    aliases: ["Your Touch Santal", "Maison Alhambra Your Touch Santal"]
  },
  {
    id: "lattafa-khamrah-waha",
    name: "Khamrah Waha",
    brand: "Lattafa",
    collection: "Khamrah Collection",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2026,
    rating_value: 4.45,
    rating_count: 2200,
    dna_type: "Mineral Aquatic Citrus Vanilla Spicy",
    dna_inspiration: "Original Warm-Fresh Mineral Aquatic Gourmand",
    similarity_percentage: 95,
    primary_season: "Summer",
    day_night: { day: 70, night: 30 },
    seasons: { summer: 60, spring: 25, fall: 10, winter: 5 },
    longevity: "Long Lasting (8-10 hrs)",
    sillage: "Strong (Room Filler)",
    accords: [
      { name: "Aquatic", score: 92, color: "#0284c7" },
      { name: "Citrus", score: 88, color: "#eab308" },
      { name: "Fresh Spicy", score: 80, color: "#10b981" },
      { name: "Vanilla", score: 75, color: "#f59e0b" }
    ],
    notes: {
      top: ["Bergamot", "Juniper", "Yuzu", "Ginger"],
      middle: ["Cucumber", "Sea Salt", "Sage", "Iris"],
      base: ["Vanilla", "Ambrofix™", "Tonka Bean", "Akigalawood", "Musk"]
    },
    review_summary: {
      pros: ["Groundbreaking Jordi Fernández summer evolution of the Khamrah line", "Refreshing sea salt and cucumber meets creamy vanilla tonka", "Beast-mode fresh gourmand performance"],
      cons: ["Different direction from the winter apple-pie original"],
      community_verdict: "The most anticipated fresh-aquatic gourmand release of 2026.",
      top_reviewer_quotes: ["Salty cucumber and vanilla tonka magic. Lasts 10 hours easily."]
    },
    aliases: ["Khamrah Waha", "Lattafa Khamrah Waha"]
  },
  {
    id: "lattafa-yara-elixir",
    name: "Yara Elixir",
    brand: "Lattafa",
    collection: "Yara Collection",
    concentration: "Eau de Parfum",
    gender: "Women",
    release_year: 2024,
    rating_value: 4.40,
    rating_count: 2600,
    dna_type: "Sweet Berry Marshmallow Vanilla Gourmand",
    dna_inspiration: "Sweet Berry Strawberry S'mores Gourmand",
    similarity_percentage: 95,
    primary_season: "All Year",
    day_night: { day: 50, night: 50 },
    seasons: { fall: 35, winter: 35, spring: 20, summer: 10 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Strong (Room Filler)",
    accords: [
      { name: "Sweet", score: 98, color: "#ec4899" },
      { name: "Vanilla", score: 92, color: "#f59e0b" },
      { name: "Fruity", score: 88, color: "#f97316" },
      { name: "Gourmand", score: 82, color: "#fb7185" }
    ],
    notes: {
      top: ["Strawberry S'mores", "Black Currant"],
      middle: ["Jasmine", "Orange Flower"],
      base: ["Vanilla", "Caramel", "Amber", "Musk"]
    },
    review_summary: {
      pros: ["Denser, deeper strawberry s'mores and caramel indulgence", "Fixes the longevity critiques of the original pink Yara", "Massive crowd compliment pull"],
      cons: ["Very decadent and sweet"],
      community_verdict: "The ultimate decadent gourmand upgrade to the Yara phenomenon.",
      top_reviewer_quotes: ["Warm toasted strawberry marshmallow and melted caramel bliss."]
    },
    aliases: ["Yara Elixir", "Lattafa Yara Elixir"]
  },
  {
    id: "asdaaf-ameerat-al-arab-prive-rose",
    name: "Ameerat Al Arab Prive Rose",
    brand: "Asdaaf",
    collection: "Ameerat Al Arab Collection",
    concentration: "Eau de Parfum",
    gender: "Women",
    release_year: 2023,
    rating_value: 4.35,
    rating_count: 3100,
    dna_type: "Floral Powdery Fruity Rose White Musk",
    dna_inspiration: "Delina Exclusif / Velvety Berry Rose",
    similarity_percentage: 90,
    primary_season: "Spring",
    day_night: { day: 65, night: 35 },
    seasons: { spring: 50, fall: 25, summer: 15, winter: 10 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Strong (6 ft+)",
    accords: [
      { name: "Rose", score: 96, color: "#f43f5e" },
      { name: "Powdery", score: 90, color: "#e2e8f0" },
      { name: "Fruity", score: 85, color: "#f97316" },
      { name: "White Musk", score: 78, color: "#f8fafc" }
    ],
    notes: {
      top: ["Strawberry", "Grapes", "Orange"],
      middle: ["Rose", "White Musk", "Jasmine", "Gardenia", "Ylang-Ylang", "Lily"],
      base: ["Tonka Bean", "Amber", "Sandalwood"]
    },
    review_summary: {
      pros: ["Velvety creamy rose wrapped in candied strawberry and white musk", "Powdery luxury cosmetic finish that lasts 8+ hours", "Stunning red velvet bottle packaging"],
      cons: ["Leans very powdery in the drydown"],
      community_verdict: "Regal, romantic velvety rose with candied berry sophistication.",
      top_reviewer_quotes: ["Velvet red rose and candied strawberry luxury."]
    },
    aliases: ["Asdaaf Ameerat al Arab Rose prive", "Ameerat Al Arab Rose Prive", "Ameerat Al Arab Prive Rose"]
  },
  {
    id: "armaf-club-de-nuit-lionheart-man",
    name: "Club de Nuit Lionheart Man",
    brand: "Armaf",
    collection: "Club de Nuit Collection",
    concentration: "Eau de Parfum",
    gender: "Men",
    release_year: 2024,
    rating_value: 4.42,
    rating_count: 1800,
    dna_type: "Sweet Honey Tobacco Vanilla Mint",
    dna_inspiration: "Jean Paul Gaultier Le Male Elixir",
    similarity_percentage: 94,
    primary_season: "Winter",
    day_night: { day: 15, night: 85 },
    seasons: { winter: 65, fall: 25, spring: 8, summer: 2 },
    longevity: "Eternal (10+ hrs)",
    sillage: "Enormous (Room Filler)",
    accords: [
      { name: "Vanilla", score: 96, color: "#f59e0b" },
      { name: "Sweet", score: 92, color: "#ec4899" },
      { name: "Honey", score: 88, color: "#d97706" },
      { name: "Tobacco", score: 82, color: "#78350f" },
      { name: "Aromatic", score: 75, color: "#10b981" }
    ],
    notes: {
      top: ["Mint", "Lavender"],
      middle: ["Benzoin", "Vanilla"],
      base: ["Honey", "Tobacco", "Tonka Bean"]
    },
    review_summary: {
      pros: ["Photocopy of Jean Paul Gaultier Le Male Elixir", "Monster projection and 10+ hour winter longevity", "Sweet golden honey and rich pipe tobacco drydown"],
      cons: ["Loud and potent; 2-3 sprays max"],
      community_verdict: "Armaf's knockout interpretation of Le Male Elixir.",
      top_reviewer_quotes: ["Dense golden honey, mint, and rich tobacco. Absolute compliment monster."]
    },
    aliases: ["Lionheart", "Armaf Lionheart", "Club de Nuit Lionheart", "Club de Nuit Lionheart Man"]
  },
  {
    id: "armaf-club-de-nuit-oud",
    name: "Club de Nuit Oud",
    brand: "Armaf",
    collection: "Club de Nuit Collection",
    concentration: "Parfum",
    gender: "Unisex",
    release_year: 2023,
    rating_value: 4.38,
    rating_count: 2100,
    dna_type: "Fruity Floral Cambodian Oud Amber",
    dna_inspiration: "Original Christian Provenzano Masterpiece",
    similarity_percentage: 95,
    primary_season: "Fall",
    day_night: { day: 30, night: 70 },
    seasons: { fall: 45, winter: 40, spring: 12, summer: 3 },
    longevity: "Eternal (10+ hrs)",
    sillage: "Enormous (Room Filler)",
    accords: [
      { name: "Fruity", score: 92, color: "#f97316" },
      { name: "Oud", score: 88, color: "#451a03" },
      { name: "Woody", score: 82, color: "#78350f" },
      { name: "Sweet", score: 78, color: "#f59e0b" }
    ],
    notes: {
      top: ["Bergamot", "Pineapple", "Peach", "Passionfruit", "Pear", "Plum"],
      middle: ["Jasmine", "Cashmere Wood", "Freesia", "Violet Leaves"],
      base: ["Cambodian Oud", "Vanilla", "Crystal Amber", "Musk", "Sandalwood"]
    },
    review_summary: {
      pros: ["Composed by master perfumer Christian Provenzano", "Luxurious sweet tropical fruits blended with authentic Cambodian oud", "True Parfum concentration with eternal longevity"],
      cons: ["High price tier for an Armaf release"],
      community_verdict: "A Collector's Pride that stands as Armaf's crown jewel.",
      top_reviewer_quotes: ["Christian Provenzano created pure magic here. Tropical fruit and dark oud."]
    },
    aliases: ["CDN Oud I - Collectors Pride", "CDN Oud", "Club de Nuit Oud (A Collector's Pride)", "Club de Nuit Oud"]
  },
  {
    id: "french-avenue-pinnace-white",
    name: "Pinnace White",
    brand: "French Avenue",
    collection: "French Avenue Collection",
    concentration: "Extrait de Parfum",
    gender: "Men",
    release_year: 2024,
    rating_value: 4.39,
    rating_count: 1200,
    dna_type: "Citrus Ginger Fresh Spicy Ambroxan",
    dna_inspiration: "Louis Vuitton L'Immensité",
    similarity_percentage: 93,
    primary_season: "Summer",
    day_night: { day: 80, night: 20 },
    seasons: { summer: 65, spring: 25, fall: 8, winter: 2 },
    longevity: "Long Lasting (8-10 hrs)",
    sillage: "Strong (Room Filler)",
    accords: [
      { name: "Citrus", score: 94, color: "#eab308" },
      { name: "Fresh Spicy", score: 88, color: "#10b981" },
      { name: "Ambroxan", score: 80, color: "#06b6d4" },
      { name: "Aquatic", score: 72, color: "#0284c7" }
    ],
    notes: {
      top: ["Grapefruit", "Ginger", "Bergamot"],
      middle: ["Water Notes", "Sage", "Rosemary", "Geranium"],
      base: ["Ambroxan", "Amber", "Labdanum"]
    },
    review_summary: {
      pros: ["Heavyweight bottle with hyper-realistic sparkling grapefruit and ginger", "High-concentration Extrait projection", "Phenomenal compliment factor in heat"],
      cons: ["Ginger can be sharp in the first 2 minutes"],
      community_verdict: "A luxurious heavy-hitting take on Louis Vuitton L'Immensité.",
      top_reviewer_quotes: ["Crisp ginger, grapefruit, and ambroxan beast mode."]
    },
    aliases: ["Pinnace White", "French Avenue Pinnace White"]
  },
  {
    id: "khadlaj-zayaan-gold",
    name: "Zayaan Gold",
    brand: "Khadlaj",
    collection: "Zayaan Collection",
    concentration: "Eau de Parfum",
    gender: "Men",
    release_year: 2023,
    rating_value: 4.32,
    rating_count: 950,
    dna_type: "Sweet Vanilla Fruity Amber",
    dna_inspiration: "Paco Rabanne 1 Million Elixir",
    similarity_percentage: 91,
    primary_season: "Winter",
    day_night: { day: 20, night: 80 },
    seasons: { winter: 60, fall: 30, spring: 8, summer: 2 },
    longevity: "Long Lasting (8+ hrs)",
    sillage: "Strong (6 ft+)",
    accords: [
      { name: "Sweet", score: 95, color: "#f59e0b" },
      { name: "Vanilla", score: 90, color: "#f59e0b" },
      { name: "Fruity", score: 84, color: "#f97316" },
      { name: "Amber", score: 78, color: "#d97706" }
    ],
    notes: {
      top: ["Apple", "Davana"],
      middle: ["Damask Rose", "Cedar", "Osmanthus"],
      base: ["Vanilla Absolute", "Tonka Bean", "Patchouli"]
    },
    review_summary: {
      pros: ["Sweet crisp apple and boozy davana opening", "Creamy vanilla absolute drydown", "Exceptional party and date night scent"],
      cons: ["Too sweet for hot weather"],
      community_verdict: "Rich, boozy apple and dark vanilla with 1 Million Elixir flair.",
      top_reviewer_quotes: ["Crisp apple, davana, and rich vanilla bean. Lasts all evening."]
    },
    aliases: ["ZAYAAN Gold", "Khadlaj Zayaan Gold"]
  },
  {
    id: "surrati-kiswah",
    name: "Kiswah",
    brand: "Surrati",
    collection: "Surrati Royal Collection",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    release_year: 2021,
    rating_value: 4.48,
    rating_count: 1600,
    dna_type: "Oud Rose Amber Warm Spicy",
    dna_inspiration: "Traditional Kaaba Kiswah Oud & Floral Rose",
    similarity_percentage: 98,
    primary_season: "All Year",
    day_night: { day: 50, night: 50 },
    seasons: { fall: 35, winter: 35, spring: 15, summer: 15 },
    longevity: "Eternal (12+ hrs)",
    sillage: "Enormous (Room Filler)",
    accords: [
      { name: "Oud", score: 96, color: "#451a03" },
      { name: "Rose", score: 90, color: "#f43f5e" },
      { name: "Amber", score: 84, color: "#d97706" },
      { name: "Warm Spicy", score: 78, color: "#ea580c" }
    ],
    notes: {
      top: ["Taif Rose", "Spices"],
      middle: ["Cambodian Oud", "Amber"],
      base: ["Black Musk", "Frankincense", "Sandalwood"]
    },
    review_summary: {
      pros: ["Authentic scent of the Holy Kaaba Kiswah silk and Oud", "Eternal projection from rich Taif rose and Cambodian oud", "Spiritual, calming, and deeply respected in the Middle East"],
      cons: ["Traditional oriental profile with potent oud"],
      community_verdict: "The definitive holy Kaaba Kiswah attar perfume in spray format.",
      top_reviewer_quotes: ["Transcendent Taif rose, amber, and authentic aged oud."]
    },
    aliases: ["Kiswah", "Surrati Kiswah"]
  },
  {
    id: "laverne-blue-laverne",
    name: "Blue Laverne",
    brand: "Laverne",
    collection: "Laverne Signature Line",
    concentration: "Eau de Parfum",
    gender: "Men",
    release_year: 2023,
    rating_value: 4.44,
    rating_count: 2800,
    dna_type: "Citrus Amber Marine Fresh Spicy",
    dna_inspiration: "Bleu de Chanel / Christian Provenzano Formulation",
    similarity_percentage: 93,
    primary_season: "All Year",
    day_night: { day: 65, night: 35 },
    seasons: { summer: 45, spring: 35, fall: 15, winter: 5 },
    longevity: "Long Lasting (8-10 hrs)",
    sillage: "Strong (Room Filler)",
    accords: [
      { name: "Citrus", score: 96, color: "#eab308" },
      { name: "Amber", score: 88, color: "#d97706" },
      { name: "Fresh Spicy", score: 82, color: "#10b981" },
      { name: "Woody", score: 76, color: "#78350f" }
    ],
    notes: {
      top: ["Bergamot", "Lemon", "Mandarin Orange", "Black Currant"],
      middle: ["Incense", "Patchouli", "Jasmine", "Cedar"],
      base: ["Ambroxan", "Sea Notes", "Musk", "Leather"]
    },
    review_summary: {
      pros: ["Composed by legendary perfumer Christian Provenzano", "Elevated, rich blue fragrance with dark incense and juicy blackcurrant", "Beast-mode projection for a versatile blue scent"],
      cons: ["Higher price point than budget clones"],
      community_verdict: "Saudi Arabia's viral sensation blue fragrance masterwork.",
      top_reviewer_quotes: ["Christian Provenzano created the ultimate rich blue fragrance."]
    },
    aliases: ["Blue Laverne", "Blue Laverne 100ML", "Laverne Blue Laverne"]
  }
];

let addedCount = 0;
for (const p of newPerfumes) {
  const existingIdx = catalog.findIndex(x => x.id === p.id);
  if (existingIdx >= 0) {
    catalog[existingIdx] = { ...catalog[existingIdx], ...p };
  } else {
    catalog.push(p);
    addedCount++;
  }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf-8");
console.log(`✅ Successfully added/updated ${newPerfumes.length} Fragrantica profiles in catalog (Added: ${addedCount}, Updated: ${newPerfumes.length - addedCount})!`);
console.log(`Total catalog fragrances now: ${catalog.length}`);
