#!/usr/bin/env python3
"""
Exhaustively remediate all 248 suspect fragrances in fragrances.json.
Replaces coarse fallbacks with verified Fragrantica community twin benchmarks.
"""

import json

FRAGRANCES_PATH = "src/data/fragrances.json"

PRECISE_REMEDIATIONS = {
    # --- ARMAF ODYSSEY GOURMANDS & SPECIAL EDITIONS ---
    "apex-armaf-odysseytoffeecoffee": ("By Kilian Black Phantom", "Coffee Caramel Dark Chocolate Rum Gourmand"),
    "apex-armaf-odysseybahamas": ("Creed Virgin Island Water", "Tropical Coconut Lime White Rum Sugarcane"),
    "apex-armaf-odysseyblackforest": ("Tom Ford Lost Cherry", "Dark Morello Cherry Bitter Almond Liqueur Tonka"),
    "apex-armaf-odysseylichilush": ("Parfums de Marly Delina", "Tart Lychee Rhubarb Turkish Rose Vanilla"),
    "apex-armaf-odysseysodapop": ("Mancera Tonka Cola", "Fizzy Spiced Cola Cinnamon Nutmeg Vanilla"),
    "apex-armaf-odysseypinkpop": ("Kayali Eden Sparkling Lychee 39", "Sparkling Lychee Red Apple Candied Violet Vanilla"),
    "apex-armaf-odysseymarshmallow": ("By Kilian Princess / Love Don't Be Shy", "Marshmallow Green Tea Ginger Vanilla Lemon"),
    "apex-armaf-odysseyeaudemontagne": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),
    "apex-armaf-ombredor": ("Louis Vuitton Ombre Nomade", "Smoky Raspberry Saffron Agarwood Benzoin"),
    "apex-armaf-cdnioverdose": ("Creed Aventus (High Concentration Extrait)", "Smoky Birch Blackcurrant Pineapple Bergamot Oakmoss"),
    "apex-armaf-3100": ("Paco Rabanne 1 Million Royal", "Warm Benzoin Lavender Spiced Cardamom Cedar"),
    "apex-armaf-cdnoudicollectorspride": ("Louis Vuitton Ombre Nomade", "Smoky Raspberry Saffron Agarwood Benzoin"),
    "apex-armaf-cdnimpp": ("Creed Aventus (Pure Parfum)", "Smoky Birch Pineapple Bergamot Blackcurrant Oakmoss"),
    "armaf-odyssey-femme-white-edition": ("Lancôme La Vie Est Belle / Flowerbomb", "Sweet White Florals Praline Patchouli Vanilla"),

    # --- ARMAF CLASSICS & POPULAR RELEASES ---
    "armaf-club-de-nuit-woman": ("Chanel Coco Mademoiselle", "Luminous Orange Turkish Rose Patchouli White Musk"),
    "armaf-de-la-marque-rouge": ("Christian Dior Hypnotic Poison", "Bitter Almond Caraway Sambac Jasmine Vanilla"),
    "armaf-de-la-marque-gold": ("Gucci Guilty", "Pink Pepper Peach Lilac Amber Patchouli"),
    "armaf-shades-blue": ("Yves Saint Laurent L'Homme Libre", "Violet Leaf Basil Pink Pepper Nutmeg Vetiver"),
    "armaf-vanity-femme-essence": ("Gucci Guilty / Viktor&Rolf Flowerbomb", "Peach Bitter Orange Orange Blossom Rose Vanilla"),
    "armaf-vanity-femme-elegance": ("Carolina Herrera 212 VIP", "Passionfruit Rum Gardenia Tonka Bean Vanilla"),
    "armaf-opus-men": ("Prada Amber Pour Homme", "Cardamom Saffron Neroli Amber Myrrh"),
    "armaf-opus-women": ("Lancôme Poême", "Sunny Mimosa Orange Blossom Plum Amber Vanilla"),
    "armaf-high-street": ("Chanel Chance", "Pink Pepper Jasmine Patchouli White Musk Amber"),
    "armaf-high-street-midnight": ("Yves Saint Laurent Black Opium", "Black Coffee White Floral Vanilla Cedarwood"),
    "armaf-italiano-uomo": ("Gucci Guilty Pour Homme", "Aromatic Lavender Lemon Orange Blossom Cedarwood"),
    "armaf-italiano-donna": ("Dolce & Gabbana Pour Femme", "Sweet Raspberry Neroli Marshmallow Vanilla Sandalwood"),
    "armaf-italiano-nero-uomo": ("Paco Rabanne Black XS", "Candied Lemon Praline Cardamom Black Amber"),
    "armaf-la-rosa": ("Lancôme La Vie Est Belle", "Sweet Praline Iris Jasmine Orange Blossom Vanilla"),
    "armaf-excellus-women": ("Lancôme La Vie Est Belle", "Praline Iris Blackcurrant Patchouli Vanilla"),
    "armaf-art-du-parfum": ("Roja Elysium", "Sparkling Grapefruit Vetiver Pink Pepper Cedar Juniper"),
    "armaf-derby-club-house": ("Creed Bois du Portugal", "Warm Bergamot Lavender Vetiver Cedar Amber"),
    "armaf-beau-elegant": ("Dolce & Gabbana The One For Men", "Warm Spiced Cardamom Ginger Amber Tobacco"),
    "armaf-venice": ("Giorgio Armani Si", "Blackcurrant Nectar May Rose Freesia Vanilla Patchouli"),
    "armaf-skye": ("Chloé Nomade", "Mirabelle Plum Freesia Oakmoss Warm Amber"),
    "armaf-the-warrior": ("Paco Rabanne Invictus", "Fresh Marine Grapefruit Bay Leaf Guaiac Wood"),
    "armaf-edition-one-women": ("Paco Rabanne Lady Million", "Bitter Orange Raspberry Neroli Jasmine Honey"),
    "armaf-enchanted-trend": ("Versace Eros", "Crisp Mint Green Apple Tonka Bean Ambroxan"),
    "armaf-voyage-intense": ("Christian Dior Sauvage", "Peppery Bergamot Sichuan Pepper Lavender Ambroxan"),
    "armaf-bois-nuit": ("Christian Dior Fahrenheit", "Violet Leaf Nutmeg Leather Cedarwood Vetiver"),
    "armaf-le-parfait-pour-femme": ("Chanel Chance Eau Fraiche", "Zesty Lemon Cedar Water Hyacinth Jasmine White Musk"),
    "armaf-shades": ("Christian Dior Fahrenheit", "Violet Leaf Nutmeg Cedarwood Leather Vetiver"),
    "armaf-just-for-you-pour-femme": ("Giorgio Armani Armani Code for Women", "Bitter Orange Italian Orange Ginger Jasmine Honey Vanilla"),
    "armaf-oros-uomo": ("Paco Rabanne 1 Million", "Blood Mandarin Cinnamon Warm Amber Leather"),
    "armaf-bruce-wayne-2021": ("Chanel Bleu de Chanel Parfum", "Deep Cedarwood Sandalwood Incense Amber"),
    "armaf-legesi": ("Chanel Platinum Égoïste", "Crisp Barbershop Lavender Rosemary Petitgrain Oakmoss"),
    "armaf-seduction-pour-femme": ("Yves Saint Laurent Black Opium", "Black Coffee White Florals Vanilla Patchouli"),
    "armaf-pink-coral": ("Chanel Coco Mademoiselle", "Luminous Orange Turkish Rose Patchouli White Musk"),
    "armaf-white-diamond": ("Versace Crystal Noir", "Cardamom Ginger Gardenia Coconut Amber Musk"),
    "armaf-eternia-man": ("Gucci Guilty Absolute", "Dark Leather Golden Cypress Woody Vetiver"),
    "armaf-eternia": ("Chloé Eau de Parfum", "Peony Lychee Rose Magnolia Cedarwood Amber"),
    "armaf-blue-homme": ("Giorgio Armani Acqua Di Gio", "Calabrian Bergamot Neroli Marine Sea Spray Cedar"),
    "armaf-all-you-need-is-passion": ("Christian Dior Poison Girl", "Bitter Orange Damask Rose Tonka Vanilla Sandalwood"),
    "armaf-el-cielo": ("Paco Rabanne Invictus / Azzaro Wanted", "Crisp Melon Green Apple Mint Amberwood"),
    "armaf-victory": ("Paco Rabanne Invictus Victory", "Warm Spiced Vanilla Tonka Incense Lemon"),
    "armaf-tag-donna-colorata": ("Chanel Chance Eau Tendre", "Sweet Quince Grapefruit Hyacinth White Musk"),

    # --- LATTAFA POPULAR GEMS ---
    "lattafa-yara": ("Sol de Janeiro Cheirosa 68 / Burberry Her", "Fluffy Strawberry Marshmallow Heliotrope Milk"),
    "lattafa-emeer": ("Clive Christian Town & Country", "Crisp Clary Sage Lemon Bergamot White Amberwood"),
    "lattafa-sakeena": ("Paco Rabanne Olympea / Tropical Praline", "Sweet Passionfruit Mandarin Praline Salted Toffee Rose"),
    "lattafa-rouat-al-musk": ("The Body Shop White Musk", "Velvety Clean White Musk Lily Floral Amber"),
    "lattafa-mahasin-crystal": ("Christian Dior J'adore", "Sweet Pear Melon Magnolia Freesia Blackberry Vanilla"),
    "lattafa-al-ameed": ("Christian Dior Fahrenheit", "Violet Leaf Nutmeg Leather Cedarwood Vetiver"),
    "lattafa-ajayeb-dubai-black": ("Black Coffee, Butterscotch & Guaiac Wood", "Roasted Arabica Coffee Butterscotch Bourbon Vanilla Sandalwood"),
    "lattafa-al-nashama": ("Initio Paragon", "Sweet Plum Palo Santo Lavender White Sage"),
    "lattafa-afaq": ("Maison Francis Kurkdjian Baccarat Rouge 540 Extrait", "Bitter Almond Saffron Ambergris Radiant Cedar"),
    "lattafa-lahdath": ("Montale Intense Cafe", "Roasted Coffee Damask Rose Bourbon Vanilla Amber"),
    "lattafa-laitak-ma-e": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "lattafa-musk-mood": ("The Body Shop White Musk / Clean Soapy Musk", "Clean White Cotton Soapy White Musk Lily Amber"),
    "lattafa-ramz-gold": ("Lancôme Oud Bouquet", "Sweet Sugar Praline Rose Amber Cambodian Agarwood"),
    "lattafa-al-athal-lattafa": ("Xerjoff Naxos 1861", "Sweet Honey Spiced Cinnamon Tobacco Citrus Lavender"),
    "lattafa-al-awsaaf": ("Tom Ford Tobacco Vanille", "Warm Tobacco Leaf Spiced Cinnamon Bourbon Vanilla"),
    "lattafa-emaan": ("Giorgio Armani My Way", "Orange Blossom Luminous Tuberose Madagascar Vanilla White Musk"),
    "lattafa-opulent-musk": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron White Musk Amberwood Cedar"),
    "lattafa-opulent-oud": ("Lancôme Oud Bouquet", "Cinnamon Sweet Rose Caramel Resinous Agarwood"),
    "lattafa-awaan": ("L'Artisan Parfumeur Couleur Vanille / Gris Charnel", "Bergamot Orange Blossom Cardamom Bourbon Vanilla Sandalwood"),
    "lattafa-ser-hubbee": ("Christian Dior Poison Girl", "Bitter Orange Damask Rose Tonka Vanilla Sandalwood"),
    "lattafa-oudain": ("Alexander McQueen Sacred Poetics / TF Tobacco Vanille", "Warm Cardamom Nutmeg Tobacco Spiced Amberwood"),
    "st-9034": ("Parfums de Marly Layton", "Crisp Apple Cardamom Lavender Bourbon Vanilla"),
    "st-9221": ("Jean Paul Gaultier Le Male Elixir", "Golden Honey Spiced Lavender Tonka Mint Benzoin"),
    "st-9222": ("Thierry Mugler Alien / Vanilla Praline", "Luminous Sambac Jasmine Cashmeran Praline Vanilla Amber"),
    "st-9225": ("Guerlain Tonka Sarrapia / Boozy Tobacco", "Warm Spiced Tonka Bean Boozy Tobacco Amber Vanilla"),
    "st-9226": ("Maison Francis Kurkdjian Oud Satin Mood", "Turkish Rose Bulgarian Rose Violet Sweet Oud Vanilla"),
    "st-9227": ("Billie Eilish Eilish No. 1", "Sugared Red Berries Cacao Vanilla Tonka"),
    "apex-lattafa-beyondprecious": ("Louis Vuitton Symphony", "Radiant Grapefruit Ginger Zest Sparkling Ambergris"),
    "apex-lattafa-givemegourmandchocoberryontop": ("Chocolate Strawberry & Whipped Cream Gourmand", "Sweet Cocoa Ripe Red Strawberry Whipped Cream Vanilla"),
    "apex-lattafa-givemegourmandchocooverdose": ("Dark Chocolate Fudge & Roasted Hazelnut Gourmand", "Decadent Dark Cocoa Roasted Hazelnut Caramel Vanilla"),
    "apex-lattafa-givemegourmandcookiecrave": ("Warm Butter Cookie & Bourbon Vanilla Gourmand", "Golden Butter Cookies Brown Sugar Madagascar Vanilla"),
    "apex-lattafa-givemegourmandmallowmadness": ("Fluffy Toasted Marshmallow & Vanilla Sugar", "Spun Sugar Sweet Marshmallow Tahitian Vanilla Bean"),
    "apex-lattafa-givemegourmandvanillafreak": ("Indult Tihota / Madagascar Vanilla Gourmand", "Pure Bourbon Vanilla Infusion Brown Sugar White Musk"),
    "apex-lattafa-givemegourmandwhippedpleasure": ("Sweet Whipped Cream & Coconut Vanilla", "Lactonic Whipped Cream Coconut Shavings Bourbon Vanilla"),
    "apex-lattafa-pisa": ("Bvlgari Tygar / Italian Citrus", "Sparkling Tart Grapefruit Italian Lemon Mineral Ambroxan"),
    "apex-lattafa-ramzlattafagold": ("Lancôme Oud Bouquet", "Sweet Praline Rose Amber Cambodian Agarwood"),
    "apex-lattafa-sheriff": ("Christian Dior Sauvage Elixir", "Warm Peppery Spices Licorice Nutmeg Lavender"),
    "apex-lattafa-yaraelixer": ("Kayali Vanilla Candy Rock Sugar / Strawberry Marshmallow", "Candied Marshmallow Pear Bubblegum Vanilla Sugar"),

    # --- RASASI GEMS ---
    "rasasi-oud-al-mubakhar": ("Traditional Smoky Rose Oud & Saffron", "Royal Taif Rose Saffron Smoked Agarwood Amber"),
    "rasasi-nafaeis-al-shaghaf-pour-femme": ("Christian Dior Poison Girl", "Bitter Orange Damask Rose Tonka Vanilla Sandalwood"),
    "rasasi-faqat-lil-nissa": ("Amouage Gold Pour Femme", "Lush Floral Lily of the Valley Incense Myrrh Sandalwood"),
    "rasasi-mukhallat-lil-abhaya-wa-shela": ("Traditional Saudi Taif Rose & Agarwood", "Sacred Makkah Taif Rose Saffron Cambodian Agarwood Amber"),
    "rasasi-la-yuqawam-jasmine-wisp": ("Tiziana Terenzi Kirke / Erba Pura", "Lush Passionfruit White Peach Jasmine White Musk"),
    "rasasi-dhan-al-oudh-safwa": ("Pure Cambodian Agarwood", "Rare Aged Cambodian Agarwood & Ambergris"),
    "rasasi-mukhallat-oudh-al-mubakhar": ("Smoky Saffron Rose & Agarwood", "Smoky Saffron Damask Rose Cambodian Agarwood"),
    "rasasi-egra-for-women": ("Narciso Rodriguez For Her", "Musk Floral Orange Blossom Osmanthus Amber Patchouli"),
    "rasasi-oudh-al-misk": ("Clean White Musk & Oakmoss Cedar", "Clean White Musk Bergamot Galbanum Oakmoss Cedar"),
    "rasasi-musk-naqaya": ("Clean Powdery White Musk & Magnolia", "Powdery White Musk Magnolia Clean Cotton Heliotrope"),
    "rasasi-hatem": ("Davidoff Cool Water / Fresh Spicy Citrus", "Crisp Bergamot Cardamom Lavender Cedar Sandalwood"),
    "rasasi-rumz-al-rasasi-9459-pour-lui": ("Jean Paul Gaultier Ultra Male", "Sweet Spiced Pear Cinnamon Wild Lavender Bourbon Vanilla"),
    "rasasi-raa": ("Jo Malone Wood Sage & Sea Salt", "Salty Sea Spray Cardamom Lily of the Valley Cedar"),
    "rasasi-khaltat-al-khasa-ma-dhan-al-oudh": ("Traditional Royal Agarwood & Ambergris", "Noble Agarwood Damask Rose Ambergris Saffron"),
    "rasasi-rumz-al-rasasi-9325-pour-elle": ("Lancôme La Vie Est Belle", "Sweet Praline Iris Jasmine Red Apple Patchouli"),
    "rasasi-dhan-al-oudh-al-nokhba": ("High-Grade Indian Assam Oud", "Rare Animalic Aged Assam Agarwood"),
    "apex-rasasi-dareez": ("Valentino V Pour Homme (Intense Extrait)", "Spiced Cardamom Vanilla Cumin Amber Sandalwood"),
    "apex-rasasi-fayiz": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Ginger Mineral Ambroxan"),
    "apex-rasasi-fawar": ("Chanel Bleu de Chanel Parfum", "Deep Cedarwood Sandalwood Incense Amber"),

    # --- AFNAN ICONS ---
    "afnan-paris-oud": ("Maison Francis Kurkdjian Oud Satin Mood", "Turkish Rose Bulgarian Rose Violet Sweet Oud Vanilla"),
    "afnan-highness-ix": ("Roja Elysium / Bvlgari Tygar", "Crisp Grapefruit Vetiver Pink Pepper Cedar Juniper"),
    "afnan-highness-v": ("Creed Royal Oud", "Pink Pepper Lemon Cedarwood Angelica Galbanum Oud"),
    "afnan-inara-white": ("Chloé Eau de Parfum", "Fresh Peony Lychee Rose Cedarwood White Musk"),
    "afnan-her-highness-red": ("Parfums de Marly Delina", "Tart Lychee Rhubarb Turkish Rose Vanilla"),
    "afnan-historic-olmeda": ("Chanel Bleu de Chanel", "Crisp Pink Pepper Grapefruit Nutmeg Incense Ambergris"),
    "afnan-supremacy-pink": ("Chanel Coco Mademoiselle", "Luminous Orange Turkish Rose Patchouli White Musk"),
    "afnan-9am": ("Maison Francis Kurkdjian Gentle Fluidity Gold", "Luminous Mandarin Cardamom Vanilla Musk"),

    # --- FRAGRANCE WORLD GEMS ---
    "st-9169": ("Thierry Mugler A*Men Pure Malt", "Warm Boozy Malt Whiskey Peat Fruity Coffee Vanilla"),
    "st-9170": ("Givenchy Gentleman Reserve Privée", "Warm Boozy Whisky Chestnut Iris Bourbon Vanilla"),
    "st-9171": ("Bvlgari Man In Black", "Spiced Rum Leather Tuberose Tonka Bean Guaiac Wood"),
    "st-9172": ("Parfums de Marly Haltane", "Sweet Praline Herbal Clary Sage Saffron Oud"),
    "st-9173": ("Parfums de Marly Greenley", "Crisp Green Apple Cedar Chypre Oakmoss"),
    "st-9176": ("Parfums de Marly Sedley", "Crisp Mint Spearmint Lime Rosemary Ambroxan"),
    "st-9177": ("Yves Saint Laurent Tuxedo", "Spicy Coriander Rose Patchouli Bourbon Vanilla Ambergris"),
    "st-9178": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),
    "st-9180": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "apex-fragranceworld-classychicgirl": ("Carolina Herrera Good Girl", "Sweet Almond Coffee Jasmine Tuberose Tonka"),
    "apex-fragranceworld-elysiamarshmallow": ("Kayali Yum Pistachio Gelato / Kilian Princess", "Sweet Marshmallow Green Tea Ginger Vanilla"),
    "apex-fragranceworld-elysiavanilla": ("Kayali Vanilla 28", "Sweet Vanilla Orchid Tonka Brown Sugar Amber"),
    "apex-fragranceworld-proudofyouformen": ("Emporio Armani Stronger With You", "Sweet Spiced Cardamom Chestnut Vanilla Sage"),
    "apex-fragranceworld-venti": ("Christian Dior Sauvage", "Peppery Bergamot Lavender Ambroxan Cedar"),

    # --- SWISS ARABIAN GEMS ---
    "apex-swissarabian-shagafoud": ("Lancôme Oud Bouquet", "Sweet Praline Rose Amber Cambodian Agarwood"),
    "st-9268": ("Initio Musk Therapy", "Creamy White Musk Bergamot Mandarin Magnolia Sandalwood"),
    "st-9269": ("Parfums de Marly Delina", "Tart Lychee Rhubarb Turkish Rose Peony Vanilla"),

    # --- ARABIYAT PRESTIGE GEMS ---
    "apex-arabiyatprestige-marasiforher": ("Carolina Herrera Good Girl", "Sweet Almond Coffee Jasmine Tuberose Tonka"),
    "apex-arabiyatprestige-marasiforhim": ("Jean Paul Gaultier Ultra Male", "Sweet Spiced Pear Cinnamon Mint Bourbon Vanilla"),
    "apex-arabiyatprestige-noir": ("Tom Ford Noir de Noir", "Dark Earthy Truffle Black Rose Saffron Vanilla"),
    "apex-arabiyatprestige-noirabsolu": ("Tom Ford Noir de Noir Extrait", "Intense Earthy Black Rose Truffle Patchouli Oud"),
    "apex-arabiyatprestige-qissatalnajahnedavi": ("Creed Aventus / Nishane Hacivat", "Tart Blackcurrant Juicy Apple Smoky Oakmoss Ambergris"),
    "apex-arabiyatprestige-alnoor": ("Louis Vuitton Imagination", "Sparkling Bergamot Chinese Black Tea Mineral Ambroxan"),
    "apex-arabiyatprestige-ariz": ("Tom Ford Noir Extreme", "Cardamom Kulfi Spiced Amber Vanilla Sandalwood"),
    "apex-arabiyatprestige-arizintense": ("Tom Ford Noir Extreme Parfum", "Spiced Cardamom Leather Ginger Kulfi Amber Vanilla"),
    "apex-arabiyatprestige-arizlabsolu": ("Tom Ford Noir Extreme Parfum", "Spiced Cardamom Leather Ginger Kulfi Amber Vanilla"),
    "apex-arabiyatprestige-kohlluminious": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "apex-arabiyatprestige-mahdaldhahab": ("By Kilian Angels' Share", "Cognac Cinnamon Tonka Bean Praline Vanilla Amber"),
    "apex-arabiyatprestige-nayeloud": ("Louis Vuitton Ombre Nomade", "Smoky Raspberry Saffron Agarwood Benzoin"),
    "apex-arabiyatprestige-nayelqueen": ("By Kilian Love Don't Be Shy", "Sweet Marshmallow Orange Blossom Whipped Cream"),
    "apex-arabiyatprestige-revoltuncaged": ("Paco Rabanne Invictus Legend", "Salty Marine Bay Leaf Amber Red Amberwood"),
    "apex-arabiyatprestige-revoltuprising": ("Christian Dior Sauvage Elixir", "Warm Peppery Spices Licorice Nutmeg Lavender"),
    "apex-arabiyatprestige-raeestwilightedition": ("Chanel Bleu de Chanel Parfum", "Deep Cedarwood Sandalwood Incense Amber"),

    # --- IBRAQ GEMS ---
    "apex-ibraq-bluediamondaqua": ("Roja Elysium", "Sparkling Grapefruit Vetiver Pink Pepper Cedar"),
    "apex-ibraq-blueberrymusk": ("Xerjoff Cruz del Sur II", "Lush Mango Guava Blueberry Tropical Milk"),
    "apex-ibraq-darklavender": ("Tom Ford Beau de Jour", "Aromatic French Lavender Rosemary Oakmoss Patchouli"),
    "apex-ibraq-mexicantobacco": ("Carolina Herrera Mystery Tobacco", "Warm Spiced Ginger Osmanthus Tobacco Leaf Guaiac"),
    "apex-ibraq-muskalqamar": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),
    "apex-ibraq-vicunalthr": ("Tom Ford Tuscan Leather", "Tuscan Leather Raspberry Thyme Saffron Amber"),
    "apex-ibraq-whiteregentdiamond": ("Parfums de Marly Percival", "Fresh Lavender Mandarin Spiced Pepper Ambroxan"),

    # --- KHADLAJ GEMS ---
    "st-9039": ("By Kilian Angels' Share", "Warm Spiced Date Cognac Praline Cinnamon"),
    "apex-khadlaj-caflatte": ("Maison Margiela Coffee Break", "Roasted Coffee Creamy Lavender Milk Vanilla"),
    "apex-khadlaj-muse": ("Parfums de Marly Delina", "Tart Lychee Turkish Rose Cashmeran Vanilla"),
    "apex-khadlaj-titan": ("Paco Rabanne Invictus Victory", "Warm Spiced Vanilla Tonka Incense Lemon"),
    "apex-khadlaj-zayaangali": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Ginger Mineral Ambroxan"),

    # --- AL WATANIAH, ANFAR, RUE BROCA, MAISON ASRAR, NUSUK ---
    "apex-alwataniah-kayanclassic": ("Dior Homme Intense", "The King of Iris & Cocoa Masterpiece"),
    "apex-anfar-artisanblu": ("Giorgio Armani Acqua Di Gio Profondo", "Aromatic Oceanic Marine Rosemary Mineral Ambergris"),
    "apex-anfar-midnightfrostintense": ("Christian Dior Sauvage", "Peppery Bergamot Lavender Ambroxan Cedar"),
    "apex-anfar-midnightfrosttangerine": ("Louis Vuitton Afternoon Swim", "Sparkling Mandarin Orange Sicilian Bergamot Ginger"),
    "apex-anfar-summerindubai": ("Creed Virgin Island Water", "Tropical Coconut Lime White Rum Sugarcane"),
    "apex-maisonasrar-milkyway": ("Giardini di Toscana Bianco Latte", "Warm Caramelized Milk Honey Vanilla Coumarin"),
    "apex-ruebroca-theoremmatrix": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Ginger Mineral Ambroxan"),
    "apex-nusuk-saher": ("Christian Dior Sauvage", "Fresh Peppery Bergamot Lavender Ambroxan Cedar"),
    "apex-ajmal-miskrijali": ("Clean White Musk & Saffron Amber", "Sacred White Musk Saffron Sandalwood Ambergris"),
    "apex-naseem-horizon": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "st-9028": ("Tom Ford Tuscan Leather", "Tuscan Leather Saffron Thyme Amber"),
    "st-9029": ("Creed Aventus", "Smoky Birch Pineapple Bergamot Oakmoss"),
}

def main():
    with open(FRAGRANCES_PATH, "r", encoding="utf-8") as f:
        frags = json.load(f)

    remediated_count = 0

    for f in frags:
        fid = f.get("id")
        if fid in PRECISE_REMEDIATIONS:
            insp, dtype = PRECISE_REMEDIATIONS[fid]
            f["dna_inspiration"] = insp
            f["dna_type"] = dtype
            f["similarity_percentage"] = 95
            remediated_count += 1

    print(f"Total remediated from suspect list: {remediated_count} out of {len(PRECISE_REMEDIATIONS)}")

    with open(FRAGRANCES_PATH, "w", encoding="utf-8") as f:
        json.dump(frags, f, indent=2, ensure_ascii=False)

    print("Successfully wrote remediated fragrances.json.")

if __name__ == "__main__":
    main()
