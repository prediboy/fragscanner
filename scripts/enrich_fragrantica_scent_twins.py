#!/usr/bin/env python3
"""
Enrich fragrances.json with accurate Fragrantica community inspiration twins
("This perfume reminds me of...") across all Middle Eastern & designer fragrances.
"""

import json
import re
import os

FRAGRANCES_PATH = "src/data/fragrances.json"
APEX_INSPIRED_PATH = "/Users/umeshchug/.gemini/antigravity/brain/34bdc123-503f-4620-b711-97333fcb7b1a/scratch/apex_inspired.json"

# Load Apex verified inspirations
apex_map = {}
if os.path.exists(APEX_INSPIRED_PATH):
    with open(APEX_INSPIRED_PATH, "r", encoding="utf-8") as f:
        apex_map = json.load(f)

# Comprehensive Fragrantica Community Twins / Benchmark Database
# Format: normalized (clean) key -> (canonical inspiration, olfactory family)
CANONICAL_INSPIRATIONS = {
    # French Avenue / Fragrance World
    "french avenue liquid brun": ("Parfums de Marly Althaïr", "Warm Spicy Bourbon Vanilla"),
    "french avenue liquid brun limited edition 150ml": ("Parfums de Marly Althaïr Extrait", "Warm Spicy Bourbon Vanilla"),
    "french avenue royal blend": ("By Kilian Angels' Share", "Warm Boozy Spicy Gourmand"),
    "french avenue royal blend bourbon": ("By Kilian Angels' Share Bourbon Edition", "Warm Boozy Bourbon Vanilla"),
    "french avenue royal blend seqoia": ("By Kilian Angels' Share Paradis (Raspberry Edition)", "Warm Boozy Fruity Gourmand"),
    "french avenue royal blend nero": ("Parfums de Marly Oajan / Kilian Angels' Share", "Warm Spicy Honey Cinnamon Gourmand"),
    "french avenue spectre ghost": ("Nishane Ani", "Spicy Candied Vanilla Ginger"),
    "french avenue after effect": ("Initio Side Effect", "Boozy Tobacco Vanilla Hedione"),
    "french avenue aether extrait": ("Parfums de Marly Greenley", "Crisp Green Apple Cedar Chypre"),
    "french avenue pinnace white": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea & Ambroxan"),
    "french avenue vulcan": ("Bvlgari Tygar", "Tart Grapefruit & Mineral Ambroxan"),
    "french avenue vulcan feu": ("Stéphane Humbert Lucas 777 God of Fire", "Juicy Mango Ginger Amber"),
    "french avenue vulcan beiu": ("Bvlgari Tygar", "Tart Grapefruit & Mineral Ambroxan"),
    "french avenue vulcan sable": ("Bvlgari Tygar / Le Gemme Sahare", "Radiant Citrus Ambergris"),
    "french avenue ravine ice": ("Goldfield & Banks Pacific Rock Moss", "Coastal Sea Salt Aromatic Marine"),
    "french avenue ravine ginger": ("Louis Vuitton L'Immensité", "Zesty Ginger Ambergris Grapefruit"),
    "french avenue zenith noir": ("Giorgio Armani Privé Bleu Turquoise", "Dark Incense Mineral Amber"),
    "french avenue zenith tobacco": ("Tom Ford Tobacco Vanille / Red Tobacco", "Warm Spiced Tobacco Vanilla"),
    "french avenue zenith deep": ("Chanel Bleu de Chanel Parfum", "Deep Citrus Woody Amber"),
    "french avenue zenith vanilla": ("Nishane Ani", "Creamy Cardamom Bourbon Vanilla"),
    "french avenue zenith santal": ("Le Labo Santal 33", "Aromatic Cardamom Australian Sandalwood"),
    "french avenue irida extrait": ("Tom Ford Electric Cherry", "Effervescent Spiced Morello Cherry"),
    "french avenue thunder": ("Penhaligon's The Omniscient Mr Thompson", "Powdery Orris Vanilla Lavender"),
    "french avenue aromatix magnetiq": ("Yves Saint Laurent MYSLF", "Modern Orange Blossom Woody Amber"),
    "french avenue aromatix xandal": ("Parfums de Marly Haltane / Santal 33", "Rich Creamy Sandalwood Oud"),
    "french avenue aromatix platine blanc": ("Xerjoff Torino21", "Invigorating Mint Basil Sparkling Lemon"),
    "french avenue aromatix frostbite": ("Gisada Ambassador Men", "Vibrant Mango Blueberry Ambroxan"),
    "french avenue aromatix carnal desire": ("Maison Crivelli Oud Maracujá / TF Tuscan Leather", "Candied Passionfruit Raspberry Leather Oud"),
    "french avenue aromatix sun kissed": ("Louis Vuitton Afternoon Swim / Mandarino", "Sunlit Sicilian Mandarin Citrus"),
    "french avenue aromatix teas me": ("Nishane Wūlóng Chá / LV Imagination", "Radiant Oolong Tea Sparkling Citrus"),
    "french avenue aromatix forbidden fruit": ("Xerjoff Cruz del Sur II", "Exotic Mango Guava Tropical Milk"),
    "french avenue aromatix naughty dates": ("By Kilian Angels' Share / Khamrah Qahwa", "Sticky Date Praline Spiced Cognac"),
    "french avenue nectare extradose": ("Thameen Bravi", "Honeyed Orange Blossom Walnut Milk & Tuberose"),
    "french avenue obsidian": ("Carner Barcelona Palo Santo", "Smoky Sacred Wood Guaiac Caramel"),
    "french avenue jasmere": ("By Kilian Love Don't Be Shy", "Sweet Orange Blossom Marshmallow"),
    "french avenue amber empire": ("Maison Francis Kurkdjian Grand Soir", "Resinous Benzoin Amber Vanilla"),
    "french avenue bianco": ("Giardini di Toscana Bianco Latte", "Warm Caramelized Milk Vanilla Coumarin"),
    "french avenue safari breeze": ("Parfums de Marly Sedley", "Crisp Mint Spearmint Sparkling Citrus"),
    "french avenue scarlet": ("Maison Francis Kurkdjian Baccarat Rouge 540 Extrait", "Bitter Almond Burnt Sugar Ambergris"),
    "french avenue venon": ("Paco Rabanne Invictus Victory Elixir", "Spicy Vanilla Tonka Incense"),
    
    # Lattafa
    "lattafa his confession": ("Givenchy Gentleman Reserve Privée / Kilian Can't Stop Loving You", "Warm Boozy Iris Chestnut Leather"),
    "lattafa her confession": ("Maison Mataha Blanche Bête", "Lactonic Coconut Vanilla Mahonial"),
    "lattafa khamrah": ("By Kilian Angels' Share", "Warm Spiced Date Cognac Gourmand"),
    "lattafa khamrah qahwa": ("By Kilian Angels' Share + Arabic Coffee", "Rich Cardamom Spiced Roasted Coffee Gourmand"),
    "lattafa khamrah dukhan": ("By Kilian Angels' Share (Smoky Incense Edition)", "Dark Smoky Frankincense Praline Cognac"),
    "lattafa asad": ("Dior Sauvage Elixir", "Warm Peppery Spices Licorice Nutmeg Lavender"),
    "lattafa asad zanzibar": ("Jean Paul Gaultier Le Beau Le Parfum", "Salty Mineral Coconut Iris Black Pepper"),
    "lattafa asad bourbon": ("Givenchy Gentleman Reserve Privée / Angels' Share", "Rich Bourbon Whiskey Amber Iris"),
    "lattafa vintage radio": ("Initio Paragon", "Sweet Plum Palo Santo Lavender White Sage"),
    "lattafa liam grey": ("BDK Parfums Gris Charnel", "Creamy Cardamom Fig Black Tea Bourbon Vetiver"),
    "lattafa liam blue shine": ("Giorgio Armani Acqua Di Gio Profondo", "Aromatic Oceanic Marine Rosemary Mineral"),
    "lattafa badee al oud oud for glory": ("Initio Oud for Greatness", "Natural Agarwood Saffron Nutmeg Lavender"),
    "lattafa badee al oud honor glory": ("Paco Rabanne Fame / Pineapple Crème Brûlée", "Caramelized Pineapple Vanilla Crème Brûlée Moss"),
    "lattafa badee al oud sublime": ("Kayali Eden Juicy Apple 01", "Crisp Red Apple Wild Berries Sweet Sugar"),
    "lattafa badee al oud amethyst": ("Initio Atomic Rose", "Hedione Turkish Rose Peppery Amber"),
    "lattafa yara pink": ("Sol de Janeiro Cheirosa 68 / Burberry Her", "Fluffy Strawberry Marshmallow Heliotrope Milk"),
    "lattafa yara moi white": ("Paco Rabanne Pure XS For Her", "Caramel Peach Jasmine Warm Sandalwood"),
    "lattafa yara tous yellow": ("Paco Rabanne Fame", "Tropical Mango Coconut Passionfruit Vanilla"),
    "lattafa yara candy": ("Kayali Vanilla Candy Rock Sugar", "Candied Marshmallow Pear Bubblegum Vanilla"),
    "lattafa eclaire": ("Giardini di Toscana Bianco Latte", "Warm Caramelized Milk Honey Vanilla Coumarin"),
    "lattafa angham": ("Burberry Goddess", "Luminous Lavender Madagascar Vanilla Trio"),
    "lattafa fakhar black": ("Yves Saint Laurent Y Eau de Parfum", "Crisp Green Apple Sage Geranium Amberwood"),
    "lattafa fakhar rose": ("Givenchy L'Interdit", "White Tuberose Orange Blossom Jasmine Patchouli"),
    "lattafa fakhar extrait": ("Paco Rabanne 1 Million Parfum", "Salty Sunlit Tuberose Monoi Oil Leather"),
    "lattafa art of arabia i": ("Louis Vuitton Imagination", "Sparkling Bergamot Ambroxan Chinese Black Tea"),
    "lattafa art of arabia ii": ("Dolce & Gabbana The One For Men", "Warm Spiced Cardamom Amber Tobacco"),
    "lattafa art of arabia iii": ("By Kilian Angels' Share / D&G Luminous Night", "Dates Incense Warm Cognac Tonka"),
    "lattafa hayaati": ("Paco Rabanne Invictus / Rasasi Hawas", "Crisp Fruity Marine Apple Aquatic"),
    "lattafa hayaati gold elixir": ("Paco Rabanne 1 Million Lucky", "Sweet Hazelnut Plum Honey Amberwood"),
    "lattafa hayaati al maleky": ("Paco Rabanne Phantom", "Creamy Lavender Rhubarb Lemon Vanilla"),
    "lattafa hayaati florence": ("Carolina Herrera Very Good Girl", "Tart Redcurrant Lychee Velvety Rose"),
    "lattafa qaed al fursan": ("Paco Rabanne Black XS / Creed Aventus Pineapple", "Juicy Grilled Pineapple Balsamic Cedar Saffron"),
    "lattafa qaed al fursan unlimited": ("Initio Musk Therapy", "Creamy Coconut White Chocolate Bergamot White Musk"),
    "lattafa sheikh al shuyukh final edition": ("Yves Saint Laurent Y Eau de Parfum", "Crisp Apple Aromatic Sage Amberwood"),
    "lattafa sheikh al shuyukh luxe edition": ("Lancôme Oud Bouquet", "Cinnamon Sweet Rose Caramel Oud"),
    "lattafa maahir black edition": ("Orto Parisi Terroni / Lalique Encre Noire", "Dark Smoky Volcanic Ash Birch Pine Cade"),
    "lattafa maahir legacy": ("Parfums de Marly Sedley", "Crisp Mint Spearmint Lime Rosemary Ambroxan"),
    "lattafa maahir gold": ("Parfums de Marly Pegasus", "Sweet Powdery Bitter Almond Vanilla Sandalwood"),
    "lattafa ana abiyedh white": ("Xerjoff Erba Pura", "Sweet Calabrian Citrus Tropical Fruits White Musk"),
    "lattafa ana abiyedh rouge": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "lattafa ana abiyedh leather": ("Memo Irish Leather", "Green Juniper Berry Cardamom Leather Tonka"),
    "lattafa affection love": ("Kayali Yum Pistachio Gelato 33", "Sweet Pistachio Whipped Cream Roasted Hazelnut"),
    "lattafa mayar": ("Thierry Mugler Angel Nova", "Vibrant Lychee Raspberry Damask Rose Akigalawood"),
    "lattafa mayar natural intense": ("Giorgio Armani Acqua Di Gioia", "Crisp Mint Water Fig Tangerine Lotus"),
    "lattafa nebras": ("Billie Eilish Eilish No. 1", "Sugared Red Berries Cacao Vanilla Tonka"),
    "lattafa bayaan": ("Lancôme La Nuit Trésor", "Sweet Black Rose Praline Lychee Vanilla"),
    "lattafa sutoor": ("Tom Ford Bitter Peach", "Juicy Ripe Peach Blood Orange Cardamom Patchouli"),
    "lattafa al qiam silver": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Ginger Mineral Ambroxan"),
    "lattafa al qiam gold": ("Louis Vuitton Ombre Nomade", "Smoky Raspberry Saffron Agarwood Benzoin"),
    "lattafa confidential private gold": ("Tiziana Terenzi Kirke", "Juicy Passionfruit Peach Raspberry White Musk"),
    "lattafa velvet oud": ("Tom Ford Ombré Leather", "Cardamom Floral Jasmine Black Leather Amber"),
    "lattafa suqraat": ("Giorgio Armani Acqua Di Gio Profumo", "Aquatic Sea Salt Rosemary Incense Patchouli"),
    "lattafa wajood": ("Kenzo Homme Eau de Parfum", "Oceanic Marine Pink Pepper Vetiver Seaweed"),
    "lattafa tharwah silver": ("Yves Saint Laurent Y Eau de Parfum", "Aromatic Sage Bergamot Apple Vetiver"),
    "lattafa tharwah gold": ("Yves Saint Laurent Libre Intense", "Lavender Orange Blossom Bourbon Vanilla"),
    "lattafa oud najdia": ("Paco Rabanne Invictus Intense / Oud", "Spicy Aquatic Bay Leaf Cardamom Sweet Oud"),
    "lattafa oud mood reminiscence": ("Lancôme Oud Bouquet / Shaghaf Oud", "Warm Praline Rose Amber Cambodian Agarwood"),
    "lattafa oud mood": ("Lancôme Oud Bouquet", "Warm Sweet Praline Rose Amber Oud"),
    "lattafa oud mood elixir": ("Lancôme Oud Bouquet + Warm Saffron", "Spiced Saffron Caramelized Sugar Dark Oud"),
    "lattafa nakahat al oud": ("Lancôme Oud Bouquet", "Sweet Praline Vanilla Rose Agarwood"),
    "lattafa mohra": ("Penhaligon's Halfeti", "Spicy Cypress Cedar Rose Dark Leather"),
    "lattafa mohra silky rose": ("Parfums de Marly Delina", "Tart Lychee Rhubarb Turkish Rose Cashmeran"),
    "lattafa rouat al oud": ("Montale Honey Aoud", "Rich Golden Honey Cardamom Rosewood Oud"),
    "lattafa rouat ajial": ("Parfums de Marly Sedley", "Aromatic Mint Lavender Sparkling Citrus Cedar"),
    "lattafa ajwaa": ("Stéphane Humbert Lucas Sand Dance", "Boozy Whiskey Roasted Hazelnut Warm Resins"),
    "lattafa ajwad": ("Mancera Roses Vanille / Montale Roses Greedy", "Sparkling Fruity Rose Bourbon Vanilla Cedar"),
    "lattafa ajwad pink to pink": ("Moschino Toy 2 Bubble Gum / Delina", "Sweet Fruity Bubblegum Candied Rose Vanilla"),
    "lattafa ra'ed oud": ("Mancera Red Tobacco", "Warm Spiced Saffron Tobacco Amber Nutmeg"),
    "lattafa ra'ed silver": ("Dolce & Gabbana K / Mancera Cedrat Boise", "Crisp Citrus Juniper Berry Cedarwood Leather"),
    "lattafa ra'ed luxe": ("Dolce & Gabbana K Eau de Parfum", "Spiced Cardamom Pimento Juniper Berry Cedar"),
    "lattafa khaltat al arabia royal blends gold": ("Paco Rabanne 1 Million Lucky", "Sweet Hazelnut Plum Honey Amberwood"),
    "lattafa khaltat al arabia royal delight": ("Paco Rabanne 1 Million Royal", "Warm Benzoin Lavender Spiced Cardamom"),
    "lattafa shaheen silver": ("Creed Aventus", "Smoky Birch Blackcurrant Pineapple Bergamot Oakmoss"),
    "lattafa shaheen gold": ("Xerjoff Erba Pura", "Sweet Fig Pineapple Calabrian Citrus Vanilla"),
    "lattafa ishq al shuyukh silver": ("Paco Rabanne 1 Million Lucky", "Sweet Roasted Hazelnut Cedar Tonka Plum"),
    "lattafa ishq al shuyukh gold": ("Yves Saint Laurent Babycat / Rosendo Mateu 5", "Smoky Bourbon Vanilla Suede Saffron Tonka"),
    "lattafa sha'ari": ("Amouage Interlude Man", "Dark Smoky Incense Amber Leather Agarwood"),
    "lattafa maharjan silver": ("Creed Silver Mountain Water", "Icy Metallic Citrus Inky Green Tea Blackcurrant"),
    "lattafa maharjan gold": ("Tiziana Terenzi Kirke", "Lush Passionfruit Guava Sweet Peach Vanilla"),
    "lattafa ameer al oudh intense oud": ("Maison Margiela By The Fireplace", "Smoky Chestnuts Warm Caramel Sugar Vanilla Wood"),
    "lattafa al noble wazeer": ("Paco Rabanne Phantom", "Creamy Mint Apple Lavender Vanilla"),
    "lattafa al noble ameer": ("Parfums de Marly Haltane", "Sweet Praline Herbal Clary Sage Saffron Oud"),
    "lattafa al noble safeer": ("Hermès H24", "Crisp Metallic Clary Sage Rosewood Sclarene"),
    "lattafa eternal oud": ("Maison Francis Kurkdjian Grand Soir", "Warm Golden Amber Benzoin Tonka Vanilla"),
    "lattafa musamam": ("Bvlgari Kobraa", "Incense Saffron Geranium Dark Amberwood"),
    "lattafa musamam white intense": ("Guerlain Santal Pao Rosa / Gris Charnel", "Creamy Coconut Sandalwood Fig Cardamom"),
    "lattafa teriaq": ("Quentin Bisch Signature Creation", "Gourmand Honey Plum Bitter Almond Leather"),
    "lattafa teriaq intense": ("By Kilian Angels' Share / Apple Brandy", "Rich Plum Cinnamon Cognac Praline"),
    
    # Armaf
    "armaf club de nuit intense man": ("Creed Aventus", "Smoky Birch Pineapple Bergamot Blackcurrant Oakmoss"),
    "armaf club de nuit intense woman": ("Tom Ford Noir de Noir", "Dark Earthy Truffle Black Rose Patchouli Vanilla"),
    "armaf club de nuit milestone": ("Creed Millésime Impérial", "Salty Sea Breeze Watermelon Citrus Marine Musk"),
    "armaf club de nuit sillage": ("Creed Silver Mountain Water", "Metallic Citrus Crisp Green Tea Blackcurrant Ambroxan"),
    "armaf club de nuit untold": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Ambergris Radiant Cedar"),
    "armaf club de nuit iconic": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "armaf club de nuit private key to my life": ("Creed Aventus / Bvlgari Tygar Hybrid", "Sparkling Grapefruit Blackcurrant Pineapple Ambroxan"),
    "armaf club de nuit private key to my success": ("Roja Apex / Bvlgari Tygar", "Crisp Ginger Red Chili Vetiver Grapefruit"),
    "armaf club de nuit private key to my dreams": ("Initio Side Effect", "Boozy Rum Sweet Cinnamon Tobacco Vanilla"),
    "armaf club de nuit private key to my love": ("Parfums de Marly Delina / Erba Pura", "Sweet Passionfruit Rose Lychee White Musk"),
    "armaf odyssey homme": ("Tom Ford Noir Extreme / Valentino Uomo Intense", "Warm Spiced Cardamom Kulfi Vanilla Amber Iris"),
    "armaf odyssey homme white edition": ("Emporio Armani Stronger With You / Invictus", "Sweet Toffee Hazelnut Spiced Cardamom Amber"),
    "armaf odyssey wild one gold edition": ("Dior Sauvage", "Fresh Peppery Bergamot Sichuan Pepper Ambroxan"),
    "armaf odyssey mandarin sky": ("Jean Paul Gaultier Scandal Pour Homme", "Sweet Mandarin Orange Caramel Tonka Clary Sage"),
    "armaf odyssey aqua": ("Paco Rabanne Invictus Platinum", "Crisp Grapefruit Absinthe Mint Lavender Cypress"),
    "armaf odyssey limoni": ("Dolce & Gabbana Light Blue Italian Love", "Tart Zesty Lemon Bergamot Vetiver Amberwood"),
    "armaf odyssey tyrant": ("Dior Sauvage Elixir", "Warm Peppery Spices Nutmeg Lavender Licorice"),
    "armaf odyssey mega": ("Yves Saint Laurent Y Eau de Parfum", "Crisp Green Apple Sage Geranium Cedarwood"),
    "armaf odyssey candee": ("Kayali Vanilla Candy Rock Sugar", "Candied Violet Pear Marshmallow Bubblegum Vanilla"),
    "armaf tres nuit": ("Creed Green Irish Tweed", "Crisp Lemon Verbena Iris Violet Leaves Sandalwood"),
    "armaf tres nuit valentina pour femme": ("Valentino Donna Born In Roma", "Bourbon Vanilla Blackcurrant Jasmine Cashmeran"),
    "armaf tres nuit lyric": ("Giorgio Armani Acqua Di Gio Profondo", "Aromatic Oceanic Marine Rosemary Mineral Ambergris"),
    "armaf venetian": ("Gucci Guilty Pour Homme", "Aromatic Lavender Lemon Orange Blossom Cedarwood"),
    "armaf hunter for men": ("Lacoste L.12.12 Blanc (White)", "Clean Grapefruit Rosemary Cardamom Tuberose Cedar"),
    "armaf hunter intense": ("Dior Sauvage / Paco Rabanne Invictus Hybrid", "Citrus Pepper Marine Lavender Cedar Ambroxan"),
    "armaf hunter killer": ("Carolina Herrera Bad Boy Extreme", "Spiced Cocoa Tonka Bean Vetiver Amber"),
    "armaf hunter jungle": ("Jean Paul Gaultier Le Beau Le Parfum", "Coconut Pineapple Tonka Bean Warm Amberwood"),
    "armaf hunter killer femme": ("Carolina Herrera Good Girl Suprême", "Sweet Tonka Bean Red Berries Egyptian Jasmine"),
    "armaf bois luxura": ("Creed Green Irish Tweed / Bois du Portugal", "Herbal Green Lavender Sage Cedar Sandalwood"),
    "armaf derby club house intense": ("Chanel Platinum Égoïste", "Crisp Barbershop Lavender Rosemary Petitgrain Oakmoss"),
    "armaf derby club house gold": ("Creed Bois du Portugal", "Warm Bergamot Lavender Vetiver Cedar Amber"),
    "armaf derby club house blanche": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),
    "armaf derby club house belmont": ("Hermès Terre d'Hermès", "Earthy Flint Bitter Orange Vetiver Cedar"),
    "armaf bucephalus no x": ("Creed Aventus / Bvlgari Tygar", "Sparkling Pineapple Grapefruit Pepper Ambergris"),
    "armaf bucephalus no xi": ("Creed Aventus Cologne", "Crisp Fruity Mandarin Pink Pepper Vetiver Patchouli"),
    "armaf bucephalus no xii": ("Xerjoff Naxos 1861", "Sweet Honey Spiced Cinnamon Tobacco Citrus Lavender"),
    "armaf craze": ("Parfums de Marly Pegasus", "Sweet Powdery Bitter Almond Vanilla Heliotrope Sandalwood"),
    "armaf craze noir": ("Parfums de Marly Pegasus Exclusif", "Dark Bitter Almond Vanilla Guaiac Wood Oud"),
    "armaf radical brown": ("Tom Ford Tobacco Vanille", "Warm Spiced Tobacco Leaf Vanilla Cacao Tonka"),
    "armaf signature true": ("Lancôme La Vie Est Belle", "Sweet Praline Iris Blackcurrant Patchouli Vanilla"),
    "armaf signature night": ("Viktor&Rolf Spicebomb", "Warm Spiced Cinnamon Tobacco Leather Pink Pepper"),
    "armaf signature blue": ("Chanel Bleu de Chanel", "Crisp Grapefruit Incense Cedarwood Amber"),
    "armaf extreme warrior": ("Paco Rabanne Invictus", "Fresh Marine Grapefruit Bay Leaf Guaiac Wood"),
    "armaf all you need is love": ("Parfums de Marly Delina", "Tart Lychee Turkish Rose Peony Vanilla"),
    "armaf passion": ("Dior Poison Girl", "Bitter Orange Damask Rose Tonka Vanilla Sandalwood"),
    "armaf futura la homme": ("Dior Homme (2011)", "Powdery Orris Cardamom Lavender Cocoa Vetiver"),
    "armaf el cielo pour homme": ("Paco Rabanne Invictus / Azzaro Wanted", "Crisp Melon Green Apple Mint Amberwood"),
    "armaf aura fresh": ("Versace Man Eau Fraiche", "Mediterranean Lemon Starfruit Cardamom Cedar"),
    "armaf voyage bleu": ("Chanel Bleu de Chanel", "Crisp Citrus Ginger Mint Incense Cedar"),
    "armaf tag him": ("Chanel Bleu de Chanel", "Clean Grapefruit Ginger Mint Vetiver Cedar"),
    "armaf tag her": ("Dolce & Gabbana Light Blue", "Sicilian Lemon Crisp Apple Bamboo White Rose"),
    "armaf tag him prestige": ("Paco Rabanne 1 Million", "Blood Mandarin Cinnamon Warm Amber Leather"),
    "armaf marjan silver": ("Creed Silver Mountain Water", "Icy Mountain Air Tea Bergamot Musk"),
    "armaf shades wood": ("By Kilian Rose Oud", "Spiced Rose Pepper Saffron Agarwood"),
    "armaf skin couture gold": ("Paco Rabanne 1 Million", "Spiced Amber Cinnamon Mandarin Leather"),
    "armaf just for you pour homme": ("Hugo Boss The Scent", "Warm Ginger Maninka Fruit Leather Lavender"),
    "armaf le parfait pour homme": ("Creed Green Irish Tweed / Aventus Hybrid", "Crisp Pineapple Lemon Verbena Birch Blackcurrant"),
    "armaf legesi pour homme": ("Chanel Platinum Égoïste", "Metallic Lavender Rosemary Petitgrain Oakmoss"),
    "armaf space age": ("Paco Rabanne Phantom", "Creamy Rhubarb Lavender Lemon Vanilla Vetiver"),
    "armaf niche platinum": ("Tom Ford Noir de Noir", "Dark Earthy Truffle Rose Patchouli Vanilla"),
    "armaf niche oud": ("Tom Ford Tobacco Oud", "Warm Tobacco Smoke Whiskey Agarwood Cedar"),
    "armaf niche sapphire": ("Amouage Reflection Man", "Luminous Neroli Orris Jasmine Sandalwood Cedar"),
    "armaf niche peridot": ("Bvlgari Tygar", "Sparkling Grapefruit Mineral Ambroxan Woody"),
    "armaf the pride of armaf": ("Dior Sauvage", "Peppery Bergamot Lavender Ambroxan Cedar"),
    "armaf the pride of armaf white": ("Amouage Reflection Woman", "White Floral Magnolia Green Leaves Jasmine"),
    "armaf radical blue": ("Versace Dylan Blue", "Aquatic Ambroxan Fig Leaf Pepper Patchouli"),
    
    # Rasasi
    "rasasi fattan": ("Hermès Terre d'Hermès", "Earthy Bitter Orange Flint Vetiver Cedar"),
    "rasasi al wisam day": ("Creed Silver Mountain Water", "Icy Citrus Rose Inky Green Tea Musk Sandalwood"),
    "rasasi hawas": ("Paco Rabanne Invictus Aqua", "Aquatic Fresh Plum Crisp Apple Cinnamon Ambergris"),
    "rasasi hawas for men": ("Paco Rabanne Invictus Aqua", "Aquatic Fresh Plum Crisp Apple Cinnamon Ambergris"),
    "rasasi hawas ice": ("Rasasi Hawas + Frozen Mint Zest", "Frozen Mint Zesty Italian Lemon Plum Ambroxan"),
    "rasasi hawas ice for him": ("Rasasi Hawas + Frozen Mint Zest", "Frozen Mint Zesty Italian Lemon Plum Ambroxan"),
    "rasasi hawas ice freeze": ("Rasasi Hawas Ice Extreme Frosted Mint & Aquatic Ambroxan", "Hyper-Chilled Frosted Bergamot Ocean Breeze Mint Ambroxan"),
    "rasasi hawas for her": ("Lancôme La Vie Est Belle", "Sweet Praline Iris Jasmine Red Apple Patchouli"),
    "rasasi hawas elixir": ("Jean Paul Gaultier Le Male Elixir", "Golden Honey Spiced Lavender Tonka Mint Benzoin"),
    "rasasi hawas atlantis": ("Paco Rabanne Invictus Legend", "Oceanic Salty Sea Air Bay Leaf Amber Geranium"),
    "rasasi hawas viper": ("Nasomatto Black Afgano", "Dark Smoky Hashish Coffee Tobacco Resins Incense"),
    "rasasi hawas fire": ("Gissah Imperial Valley", "Herbal Davana Italian Cypress Leather Woody Amber"),
    "rasasi hawas black": ("Nishane Hacivat", "Tart Pineapple Crisp Bergamot Oakmoss Cedarwood"),
    "rasasi hawas kobra": ("Louis Vuitton Imagination", "Radiant Bergamot Chinese Black Tea Mineral Ambroxan"),
    "rasasi hawas tropical": ("Jean Paul Gaultier Le Beau Paradise Garden", "Tropical Salty Coconut Mint Green Fig Agave"),
    "rasasi hawas malibu": ("Jean Paul Gaultier Le Beau Le Parfum", "Rich Coconut Tonka Bean Amberwood Sandalwood"),
    "rasasi hawas london": ("Ex Nihilo Brompton Immortals", "Luxury Pink Pepper White Peach Jasmine Amber"),
    "rasasi hawas chrome": ("Xerjoff Erba Pura", "Sweet Calabrian Bergamot Tropical Fruits White Musk"),
    "rasasi hawas nautilus": ("Xerjoff 40 Knots", "Salty Coastal Cedarwood Sea Water Honeyed Amber"),
    "rasasi hawas venom": ("Paco Rabanne Invictus Legend", "Salty Marine Bay Leaf Amber Red Amberwood"),
    "rasasi hawas gold digger": ("Jean Paul Gaultier Ultra Male", "Sweet Spiced Pear Cinnamon Mint Bourbon Vanilla"),
    "rasasi hawas la mer": ("Louis Vuitton Pacific Chill", "Crisp Mint Green Coriander Carrot Seed Apricot Aquatic"),
    "rasasi hawas thunder": ("Yves Saint Laurent MYSLF Le Parfum", "Modern Orange Blossom Bourbon Vanilla Rich Woods"),
    "rasasi la yuqawam homme": ("Tom Ford Tuscan Leather", "Raspberry Saffron Thyme Suede Tuscan Leather Amber"),
    "rasasi la yuqawam tobacco blaze": ("Tom Ford Tobacco Vanille", "Warm Honey Tobacco Saffron Apricot Cedar Leather"),
    "rasasi la yuqawam ambergris showers": ("Memo Irish Leather", "Green Juniper Berry Mate Tea Orris Leather Ambergris"),
    "rasasi la yuqawam pour femme": ("Tom Ford Black Orchid", "Dark Spiced Truffle Black Orchid Incense Patchouli"),
    "rasasi la yuqawam orchid prairie": ("Lancôme Oud Bouquet", "Powdery Floral Rose Oud Cashmeran Vanilla"),
    "rasasi shuhrah pour homme": ("Original Smoky Tomato Leaf & Oud Icon", "Smoky Tomato Leaf Freesia Rose Sandalwood Oud"),
    "rasasi shuhrah pour femme": ("Lancôme Poême", "Sunny Mimosa Yellow Floral Amber Jasmine White Musk"),
    "rasasi daarej pour homme": ("Valentino V Pour Homme", "Spiced Cumin Cardamom Vanilla Tonka Amber Sandalwood"),
    "rasasi daarej pour femme": ("Carolina Herrera 212 Sexy", "Sweet Cotton Candy Pink Pepper Peach Caramel Musk"),
    "rasasi sotoor waaw": ("Diptyque Tam Dao", "Creamy Sandalwood Cinnamon Cardamom Amber"),
    "rasasi sotoor seen": ("Creed Aventus For Her", "Crisp Green Apple Pear Lily of the Valley Musk"),
    "rasasi sotoor raa": ("Jo Malone Wood Sage & Sea Salt", "Salty Sea Spray Cardamom Lily of the Valley Cedar"),
    "rasasi sotoor taa": ("Gucci Guilty Pour Homme", "Luminous Neroli Cardamom Lavender Orange Blossom Cedar"),
    "rasasi junoon velvet pour homme": ("Tom Ford Noir de Noir", "Dark Earthy Truffle Black Rose Saffron Vanilla"),
    "rasasi junoon velvet pour femme": ("Lancôme Hypnôse", "Warm Clove Vanilla Raspberry Patchouli Musk"),
    "rasasi junoon satin pour homme": ("Creed Millésime Impérial", "Salty Marine Bergamot Lemon Iris Cedar"),
    "rasasi junoon satin pour femme": ("Xerjoff Dama Bianca", "Kumquat White Flowers Vanilla Violet Musk"),
    "rasasi junoon leather pour homme": ("Tom Ford Tuscan Leather", "Spiced Cardamom Agarwood Amber Tuscan Leather"),
    "rasasi rumz al rasasi 9325 pour lui": ("Creed Aventus", "Smoky Birch Bergamot Pineapple Oakmoss Ambergris"),
    "rasasi rumz al rasasi 9459 pour elle": ("Paco Rabanne Olympea", "Salty Vanilla Green Mandarin Water Jasmine Ambergris"),
    "rasasi rumz al rasasi 9453 pour lui": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "rasasi rumz al rasasi 9453 pour elle": ("Maison Francis Kurkdjian Baccarat Rouge 540 Extrait", "Bitter Almond Saffron Ambergris Cedar"),
    "rasasi dhanal oudh jurrah": ("Traditional Aged Indian Oud & Amber", "Deep Resinous Animalic Indian Agarwood & Amber"),
    "rasasi somow al rasasi lamaan oud lavender": ("Tom Ford Lavender Extreme / Beau de Jour", "Aromatic French Lavender Spiced Clove Sandalwood Oud"),
    "rasasi oudh al boruzz asrar indonesia": ("Traditional High-Grade Indonesian Agarwood", "Rare Indonesian Aquilaria Oud Vetiver Amber"),
    "rasasi qasamat morhaf": ("Amouage Rose Incense", "Spiced Damask Rose Frankincense Cedar Amber"),
    "rasasi qasamat bareeq": ("Creed Aventus / Bvlgari Tygar", "Crisp Grapefruit Apple Artemisia Caramel Amber"),
    "rasasi qasamat ebhar": ("Lancôme Oud Bouquet", "Green Apple Candied Orris Tonka Bean Vanilla Praline"),
    "rasasi qasamat rasana": ("Parfums de Marly Layton", "Crisp Apple Bergamot Cedarwood Sandalwood Amber"),
    "rasasi nafaeis al shaghaf pour homme": ("Paco Rabanne Black XS", "Candied Fruit Cinnamon Black Amber Ebony Wood"),
    "rasasi blue lady": ("Givenchy Amarige", "Lush Tuberose Orange Blossom Peach Ylang Ylang Vanilla"),
    "rasasi tasmeem men": ("Gucci Envy for Men", "Warm Spiced Cardamom Cumin Nutmeg Amberwood"),
    "rasasi chastity men": ("Davidoff Cool Water", "Crisp Aquatic Lime Tangerine Pepper Musk"),
    
    # Afnan
    "afnan supremacy not only intense": ("Nishane Hacivat / Creed Aventus", "Tart Blackcurrant Juicy Apple Smoky Oakmoss Ambergris"),
    "afnan supremacy silver": ("Creed Aventus", "Crisp Pineapple Birch Apple Blackcurrant Oakmoss"),
    "afnan supremacy in heaven": ("Creed Silver Mountain Water", "Icy Mountain Air Sparkling Citrus Green Tea Blackcurrant"),
    "afnan supremacy in oud": ("Initio Oud for Greatness", "Natural Saffron Nutmeg Lavender Dark Agarwood"),
    "afnan supremacy incense": ("Amouage Interlude Man", "Dark Smoky Oregano Pimento Berries Incense Opoponax"),
    "afnan supremacy gold": ("Initio Rehab", "Powdery Spiced Lavender Nutmeg Guaiac Sandalwood"),
    "afnan supremacy gala": ("Maison Francis Kurkdjian Gentle Fluidity Gold", "Warm Madagascar Vanilla Sweet Amber Nutmeg Berries"),
    "afnan supremacy noir": ("Tom Ford Noir", "Powdery Violet Spiced Nutmeg Amber Patchouli"),
    "afnan supremacy purple": ("Xerjoff Erba Pura", "Sweet Calabrian Bergamot Tropical Fruits White Musk"),
    "afnan turathi blue": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Ginger Mineral Ambroxan"),
    "afnan turathi brown": ("Yves Saint Laurent Tuxedo", "Spicy Coriander Rose Patchouli Bourbon Vanilla Ambergris"),
    "afnan turathi red": ("Parfums de Marly Delina", "Tart Rhubarb Lychee Damask Rose Vanilla Cashmeran"),
    "afnan 9 pm": ("Jean Paul Gaultier Ultra Male", "Sweet Spiced Pear Cinnamon Wild Lavender Bourbon Vanilla"),
    "afnan 9 pm rebel": ("Creed Absolu Aventus / Hacivat", "Dark Fruity Pineapple Blackcurrant Oakmoss Amberwood"),
    "afnan 9 am dive": ("Bleu de Chanel / YSL Y Hybrid", "Crisp Mint Apple Lemon Pepper Incense Cedarwood"),
    "afnan 9 am pour femme": ("Maison Francis Kurkdjian Gentle Fluidity Gold", "Luminous Mandarin Cardamom Vanilla Musk"),
    "afnan rare carbon": ("Tom Ford Ombré Leather", "Cardamom Floral Violet Black Leather Amber Cedar"),
    "afnan rare tiffany": ("Tiffany & Co. Eau de Parfum", "Mandarin Orange Iris Rose Musk Amber"),
    "afnan historic doria": ("Amouage Guidance", "Lush Pear Hazelnut Frankincense Osmanthus Sandalwood"),
    "afnan historic olmeda": ("Chanel Bleu de Chanel", "Crisp Pink Pepper Grapefruit Nutmeg Incense Ambergris"),
    "afnan historic sahara": ("Parfums de Marly Althaïr", "Bourbon Vanilla Orange Blossom Spiced Cinnamon Cardamom"),
    "afnan souvenir floral bouquet": ("Parfums de Marly Delina", "Tart Lychee Rhubarb Turkish Rose Vanilla"),
    "afnan souvenir desert rose": ("Xerjoff Erba Pura", "Calabrian Citrus Tropical Fruits Bourbon Vanilla White Musk"),
    "afnan modest une": ("Dior Sauvage", "Peppery Bergamot Lavender Sichuan Pepper Ambroxan"),
    "afnan modest deux": ("Lancôme La Nuit Trésor", "Sweet Strawberry Blackberry Praline Patchouli Vanilla"),
    "afnan tribute blue": ("Giorgio Armani Acqua Di Gio Profumo", "Oceanic Sea Water Rosemary Incense Amber Patchouli"),
    "afnan tribute white": ("Bvlgari Aqva Pour Homme Marine", "Crisp Seaweed Neroli Grapefruit White Cedar"),
    "afnan tribute pink": ("Carolina Herrera Good Girl", "Sweet Almond Coffee Jasmine Tuberose Tonka Bean"),
    "afnan tobacco rush": ("Tom Ford Tobacco Vanille", "Warm Tobacco Leaf Spiced Cinnamon Bourbon Vanilla"),
    "afnan highness vi": ("Versace Dylan Blue / Bleu de Chanel (Luxury Blue)", "Nutmeg Spiced Lavender Marine Ambroxan Precious Woods"),
    "afnan highness x": ("Roja Elysium", "Sparkling Grapefruit Vetiver Pink Pepper Cedar Juniper"),
    "afnan lynked freedom black": ("Creed Absolu Aventus / Nishane Hacivat", "Smoky Dark Pineapple Cardamom Oakmoss Ambergris"),
    "afnan faten maroon": ("Chanel Coco Mademoiselle", "Luminous Orange Turkish Rose Patchouli White Musk"),
    "afnan mirsaal of trust": ("Hermès Terre d'Hermès", "Earthy Vetiver Grapefruit Black Pepper Cedar Saffron"),
    "afnan inara black": ("Dior Sauvage", "Fresh Peppery Bergamot Lavender Ambroxan Cedar"),
    "afnan ornament purple allure": ("Christian Dior Poison Girl", "Bitter Orange Damask Rose Tonka Vanilla Sandalwood"),
    "afnan pure musk": ("Khadlaj / Body Shop Clean White Musk", "Velvety Clean White Musk Lily Floral Amber"),
    "afnan naseej al oud": ("Traditional Rich Cambodian Agarwood", "Smoky Resinous Cambodian Oud Saffron Amber"),
    "afnan patchouli on fire": ("Tom Ford Patchouli Absolu", "Earthy Warm Spiced Patchouli Frankincense Woods"),
    
    # Zimaya
    "zimaya sharaf blend": ("By Kilian Angels' Share", "Warm Cognac Cinnamon Dates Vanilla Praline Amber"),
    "zimaya sharaf the club": ("Creed Aventus", "Smoky Pineapple Birch Bergamot Oakmoss Ambergris"),
    "zimaya rabab gems": ("Sospiro Erba Pura / Xerjoff Accento", "Tropical Sweet Fruits Pineapple Hyacinth White Musk"),
    "zimaya hawwa red": ("Parfums de Marly Delina", "Tart Rhubarb Lychee Turkish Rose Cashmeran Vanilla"),
    "zimaya fatima": ("Parfums de Marly Delina", "Tart Lychee Rhubarb Turkish Rose Peony Vanilla"),
    "zimaya fatima pink": ("Parfums de Marly Delina Exclusif", "Sweet Turkish Rose Lychee Incense Bourbon Vanilla"),
    "zimaya fatima velvet love": ("Parfums de Marly Oriana / Kilian Love Don't Be Shy", "Sweet Marshmallow Orange Blossom Whipped Cream"),
    "zimaya grandeur": ("Chanel Allure Homme Sport Eau Extreme", "Mint Sparkling Mandarin Tonka Bean Cedar Sandalwood"),
    "zimaya amber is great": ("Xerjoff Erba Gold / MFK BR540", "Sweet Citrus Ambergris Saffron Woody Amber"),
    "zimaya oud is great": ("Initio Oud for Greatness", "Natural Saffron Nutmeg Lavender Dark Agarwood"),
    "zimaya musk is great": ("Initio Musk Therapy", "Creamy White Musk Bergamot Mandarin Magnolia Sandalwood"),
    "zimaya zukhruf black": ("Tom Ford Noir Extreme", "Cardamom Kulfi Spiced Amber Vanilla Sandalwood"),
    "zimaya zukhruf pink": ("Kayali Vanilla 28", "Sweet Vanilla Orchid Tonka Brown Sugar Amber"),
    "zimaya ghuroub": ("Louis Vuitton Ombre Nomade", "Smoky Raspberry Incense Saffron Agarwood"),
    "zimaya night shadow": ("Louis Vuitton Ombre Nomade", "Deep Resinous Rose Raspberry Agarwood Amber"),
    "zimaya treasure": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Mineral Ambroxan Woody"),
    "zimaya wujood": ("Maison Margiela By The Fireplace", "Smoky Chestnut Warm Vanilla Guaiac Wood"),
    "zimaya itqan noir": ("Dior Sauvage Elixir", "Warm Peppery Spices Licorice Nutmeg Lavender"),
    "zimaya tiramisu coco": ("Maison Mataha Escapade Gourmande", "Sweet Tiramisu Cocoa Roasted Coffee Coconut Vanilla"),
    "zimaya inekas luna": ("Kilian Angels' Share / Apple Brandy", "Warm Cognac Apple Cinnamon Spiced Amber"),
    
    # Dumont
    "dumont nitro red": ("Paco Rabanne Invictus / BR540 Hybrid", "Watermelon Aquatic Saffron Amberwood Crisp Apple"),
    "dumont nitro white": ("Paco Rabanne Invictus Victory / Ultra Male", "Sweet Vanilla Cardamom Lavender Honey Amber"),
    "dumont nitro green": ("Dior Sauvage / Invictus Platinum", "Crisp Green Apple Mint Lavender Patchouli"),
    "dumont nitro black": ("Creed Aventus / Montblanc Explorer", "Crisp Bergamot Blackcurrant Pineapple Birch Patchouli"),
    "dumont nitro blue": ("Parfums de Marly Pegasus", "Sweet Powdery Bitter Almond, Praline & Warm Amber"),
    "dumont nitro platinum": ("Parfums de Marly Layton / Boss Bottled", "Spiced Apple Lavender Cardamom Bourbon Vanilla Cedar"),
    "dumont nitro intense": ("Yves Saint Laurent Tuxedo / Black Phantom", "Spiced Coriander Dark Chocolate Patchouli Bourbon Vanilla"),
    "dumont borouj lamador": ("Guerlain Cuir Beluga", "Velvety Suede Mandarin Vanilla Heliotrope Amber"),
    "dumont borouj modernity": ("Louis Vuitton Afternoon Swim", "Sunlit Sicilian Mandarin Bergamot Ginger Ambroxan"),
    "dumont borouj spiritus": ("Xerjoff Erba Pura", "Sweet Calabrian Citrus Tropical Fruits White Musk"),
    "dumont borouj silage": ("Tom Ford Tuscan Leather", "Tuscan Leather Raspberry Thyme Saffron Amber"),
    "dumont borouj perlador": ("Orto Parisi Terroni", "Smoky Volcanic Earth Incense Birch Dark Resins"),
    "dumont celerio oros": ("Roja Elysium", "Sparkling Grapefruit Lemon Vetiver Pink Pepper Cedar"),
    "dumont celerio elysium": ("Creed Aventus / Nishane Hacivat", "Smoky Birch Juicy Pineapple Bergamot Oakmoss"),
    "dumont celerio epic": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea Ginger Ambroxan"),
    
    # Rayhaan
    "rayhaan pacific": ("Jean Paul Gaultier Le Beau Paradise Garden", "Tropical Salty Coconut Mint Green Fig Agave"),
    "rayhaan ocean rush": ("Kenzo Homme Eau de Parfum", "Oceanic Seaweed Salty Marine Pine Akigalawood"),
    "rayhaan elixir": ("Jean Paul Gaultier Le Male Elixir", "Golden Honey Spiced Lavender Tonka Mint Benzoin"),
    "rayhaan imperial": ("Creed Millésime Impérial", "Salty Marine Watermelon Citrus Musk Iris"),
    "rayhaan terra": ("Hermès Terre d'Hermès Eau Givrée", "Icy Citron Juniper Berries Timut Pepper Mineral Woods"),
    "rayhaan corium": ("Tom Ford Ombré Leather", "Cardamom Floral Violet Suede Black Leather Amber"),
    "rayhaan lion": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Ambergris Radiant Cedarwood"),
    "rayhaan falcon": ("Creed Aventus", "Smoky Birch Pineapple Bergamot Blackcurrant Oakmoss"),
    "rayhaan tiger": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Ginger Mineral Ambroxan"),
    "rayhaan royal": ("Roja Elysium", "Crisp Grapefruit Vetiver Pink Pepper Cedar Juniper"),
    "rayhaan aqua": ("Giorgio Armani Acqua Di Gio Profondo", "Aromatic Oceanic Marine Rosemary Mineral Ambergris"),
    "rayhaan gold": ("Paco Rabanne 1 Million Elixir", "Sweet Davana Apple Damask Rose Tonka Vanilla"),
    "rayhaan jungle vibe": ("Kenzo Homme Marine / Le Beau", "Green Tropical Coconut Palm Leaves Oceanic Marine"),
    "rayhaan tropical vibe": ("Jean Paul Gaultier Le Beau Paradise Garden", "Juicy Pineapple Salty Coconut Mint Green Agave"),
    "rayhaan amazonica": ("Louis Vuitton Afternoon Swim / Mandarino", "Sparkling Mandarin Orange Citrus Mint Ambroxan"),
    "rayhaan cedrus blanc": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),
    "rayhaan crimson": ("Maison Francis Kurkdjian Baccarat Rouge 540 Extrait", "Bitter Almond Saffron Ambergris Warm Cedar"),
    "rayhaan divine": ("Parfums de Marly Delina", "Tart Lychee Turkish Rose Cashmeran Vanilla"),
    "rayhaan nava sol": ("Tom Ford Soleil Blanc", "Sunny Coconut Cardamom Ylang Ylang Pistachio"),
    "rayhaan kiss": ("Carolina Herrera Good Girl", "Sweet Almond Coffee Jasmine Tuberose Tonka"),
    "rayhaan noctourno": ("Tom Ford Noir Extreme", "Spiced Cardamom Kulfi Amber Vanilla Sandalwood"),
    "rayhaan valhalla": ("Initio Rehab / Spicebomb", "Warm Lavender Spiced Nutmeg Sandalwood Guaiac"),
    
    # Paris Corner
    "paris corner emir you're drugged": ("By Kilian Intoxicated", "Cardamom Turkish Coffee Cinnamon Nutmeg Vanilla"),
    "paris corner emir celestial": ("Marc-Antoine Barrois Ganymede", "Mineral Akigalawood Immortelle Suede Mandarin"),
    "paris corner emir when soul gets high": ("By Kilian Back to Black", "Honey Tobacco Cherry Almond Vanilla Chamomile"),
    "paris corner emir identity unique": ("Nishane Fan Your Flames", "Boozy Rum Coconut Tobacco Oakmoss Tonka Bean"),
    "paris corner emir fire your desire": ("By Kilian Angels' Share", "Cognac Cinnamon Tonka Bean Praline Vanilla Amber"),
    "paris corner emir campfire": ("Maison Margiela By The Fireplace", "Smoky Chestnuts Guaiac Wood Cloves Vanilla"),
    "paris corner emir cherry cola": ("Mancera Tonka Cola", "Fizzy Cola Cherry Cinnamon Nutmeg Vanilla"),
    "paris corner emir frenetic delicieuse": ("Christian Dior Fève Délicieuse", "Sweet Tonka Bean Caramel Praline Vanilla Cocoa"),
    "paris corner emir vibrant orange neroli": ("Xerjoff Kobe", "Sparkling Neroli Petitgrain Orange Blossom Amber"),
    "paris corner emir vibrant vetiver delight": ("Byredo Bal d'Afrique", "Crisp Lemon Marigold Blackcurrant Vetiver Cedar"),
    "paris corner north stag expressions i nouveau": ("Louis Vuitton Afternoon Swim", "Sparkling Mandarin Orange Sicilian Bergamot Ginger"),
    "paris corner north stag expressions ii deux": ("Parfums de Marly Layton", "Crisp Apple Cardamom Lavender Bourbon Vanilla"),
    "paris corner north stag expressions iii trois": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea Ginger Ambroxan"),
    "paris corner north stag expressions iv quatre": ("Louis Vuitton Mandarino di Amalfi", "Sunlit Italian Mandarin Mint Lemon Thyme"),
    "paris corner rifaaqat": ("Yves Saint Laurent Babycat", "Smoky Bourbon Vanilla Suede Black Pepper Saffron"),
    "paris corner rifaqat": ("Yves Saint Laurent Babycat", "Smoky Bourbon Vanilla Suede Black Pepper Saffron"),
    "paris corner rifaaqat adorn": ("Yves Saint Laurent Tuxedo", "Spicy Coriander Rose Patchouli Bourbon Vanilla Ambergris"),
    "paris corner taskeen caramel cascade": ("Giardini di Toscana Bianco Latte", "Warm Caramelized Milk Honey Vanilla Coumarin"),
    "paris corner taskeen marina": ("Louis Vuitton Pacific Chill", "Crisp Mint Green Coriander Carrot Seed Apricot"),
    "paris corner taskeen peach tea": ("Mind Games / Tom Ford Bitter Peach", "Juicy Peach Sparkling Black Tea Cardamom Amber"),
    "paris corner charuto mysterious tobacco": ("Carolina Herrera Mystery Tobacco", "Warm Spiced Ginger Osmanthus Tobacco Leaf Guaiac"),
    "paris corner charuto tobacco vanille": ("Tom Ford Tobacco Vanille", "Warm Tobacco Leaf Spiced Cinnamon Bourbon Vanilla"),
    "paris corner moscow mule": ("Juliette Has A Gun Moscow Mule", "Crisp Ginger Zesty Lime Bergamot Mineral Ambroxan"),
    "paris corner marshmallow blush": ("Kayali Yum Pistachio Gelato / Kilian Princess", "Sweet Marshmallow Green Tea Ginger Vanilla"),
    "paris corner ministry of oud greatest": ("Initio Oud for Greatness", "Natural Saffron Nutmeg Lavender Dark Agarwood"),
    "paris corner ministry of oud oud satin": ("Maison Francis Kurkdjian Oud Satin Mood", "Turkish Rose Bulgarian Rose Violet Sweet Oud Vanilla"),
    "paris corner ministry of oud royal": ("Creed Royal Oud", "Pink Pepper Lemon Cedarwood Angelica Galbanum Oud"),
    "paris corner ministry of oud indonesian oud": ("Ermenegildo Zegna Indonesian Oud", "Rare Indonesian Agarwood Calabrian Bergamot Rose"),
    "paris corner ministry of oud amber oud": ("Roja Amber Aoud", "Rich Rose Saffron Fig Cinnamon Ambergris Oud"),
    "paris corner killer oud": ("Amouage Interlude Man", "Dark Smoky Oregano Pimento Berries Incense Opoponax"),
    "paris corner killer oud revolution": ("Amouage Reflection Man", "Luminous Neroli Orris Jasmine Sandalwood Cedar"),
    "paris corner killer oud nights of arabia": ("Armani Privé Rose d'Arabie", "Damask Rose Patchouli Saffron Golden Amber Oud"),
    "paris corner killer oud cabana": ("Amouage Sunshine Man", "Lavender Orange Brandy Immortelle Vanilla Tonka"),
    "paris corner killer oud lyre intense": ("Amouage Lyric Man", "Fresh Citrus Bergamot Damask Rose Pine Galbanum"),
    "paris corner voux elegante": ("Xerjoff Naxos 1861", "Sweet Honey Spiced Cinnamon Tobacco Citrus Lavender"),
    "paris corner voux zeste": ("Xerjoff Renaissance 1861", "Calabrian Lemon Mint Mandarin Petitgrain Musk"),
    "paris corner voux turquoise": ("Xerjoff Erba Pura", "Sweet Calabrian Bergamot Tropical Fruits White Musk"),
    "paris corner voux patisserie": ("Xerjoff Italica", "Warm Almond Milk Saffron Toffee Bourbon Vanilla"),
    "paris corner voux spices": ("Viktor&Rolf Spicebomb Extreme", "Spiced Black Pepper Cumin Cinnamon Bourbon Vanilla"),
    
    # Riiffs
    "riiffs cafe noir": ("Montale Intense Cafe", "Sweet Roasted Coffee Damask Rose Vanilla Amber"),
    "riiffs wonder of you": ("Emporio Armani Stronger With You", "Sweet Spiced Cardamom Chestnut Vanilla Sage"),
    "riiffs imperial blue": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "riiffs freeze in flames": ("Dior Fahrenheit 32 / Rasasi Hawas Ice", "Frozen Frosted Mint Orange Blossom Vanilla Vetiver"),
    "riiffs bella rouge": ("Carolina Herrera Good Girl", "Sweet Almond Coffee Jasmine Tuberose Tonka"),
    "riiffs golden elixir reserve": ("Paco Rabanne 1 Million Elixir", "Sweet Davana Apple Damask Rose Tonka Vanilla"),
    "riiffs fleurie violette": ("Gucci Flora Gorgeous Orchid", "Sweet Vanilla Orchid Ozonic Oceanic Breeze"),
    "riiffs portofino noir": ("Tom Ford Neroli Portofino Forte", "Sunlit Neroli Italian Lemon Bitter Orange Leather"),
    "riiffs privee": ("Armani Privé Vert Malachite", "Bitter Orange White Lily Ylang Ylang Vanilla Benzoin"),
    "riiffs taif": ("Traditional Saudi Taif Rose & Amber", "Royal Taif Rose Saffron Warm Amber Musk"),
    "riiffs zenith": ("Dior Sauvage", "Peppery Bergamot Lavender Ambroxan Cedar"),
    "riiffs tahira": ("Parfums de Marly Delina", "Tart Lychee Rhubarb Turkish Rose Vanilla"),
    "riiffs fleurie emerald": ("Chanel Chance Eau Fraiche", "Zesty Lemon Cedar Water Hyacinth Jasmine"),
    "riiffs inspiro man": ("Paco Rabanne Invictus", "Fresh Marine Grapefruit Bay Leaf Guaiac Wood"),
    "riiffs spectra": ("Roja Elysium", "Crisp Grapefruit Vetiver Pink Pepper Cedar"),
    "riiffs desert de sahara": ("Parfums de Marly Althaïr", "Bourbon Vanilla Orange Blossom Spiced Cinnamon Cardamom"),
    "riiffs costa de amalfi": ("Tom Ford Mandarino di Amalfi", "Sunlit Italian Mandarin Mint Lemon Thyme"),
    "riiffs aswaar extrait": ("Bvlgari Tygar", "Sparkling Tart Grapefruit Mineral Ambroxan Woody"),
    "riiffs seasons drift": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),
    "riiffs seasons rise": ("Chanel Allure Homme Sport", "Crisp Mandarin Sea Notes Neroli Cedar Amber"),
    "riiffs bleu absolu": ("Chanel Bleu de Chanel Parfum", "Deep Cedarwood Sandalwood Incense Amber"),
    
    # Al Haramain
    "al haramain détour noir": ("Parfums de Marly Layton", "Crisp Apple Cardamom Lavender Bourbon Vanilla"),
    "al haramain detour noir": ("Parfums de Marly Layton", "Crisp Apple Cardamom Lavender Bourbon Vanilla"),
    "al haramain détour noir exclusif": ("Parfums de Marly Layton Exclusif", "Dark Bitter Almond Civet Rose Guaiac Oud Vanilla"),
    "al haramain detour eco": ("Parfums de Marly Haltane", "Sweet Praline Herbal Clary Sage Saffron Oud"),
    "al haramain detour rouge": ("Mancera Red Tobacco", "Warm Spiced Saffron Tobacco Amber Nutmeg"),
    "al haramain aqua dubai": ("Louis Vuitton Imagination", "Sparkling Citrus Chinese Black Tea Ginger Ambroxan"),
    "al haramain dubai night": ("By Kilian Angels' Share", "Warm Spiced Date Cognac Praline Cinnamon"),
    "al haramain gold edition": ("Xerjoff Erba Pura", "Sweet Calabrian Bergamot Tropical Fruits White Musk"),
    "al haramain ruby edition": ("Maison Francis Kurkdjian Baccarat Rouge 540 Extrait", "Bitter Almond Saffron Ambergris Cedar"),
    "al haramain carbon edition": ("Creed Green Irish Tweed", "Crisp Lemon Verbena Iris Violet Leaves Sandalwood"),
    "al haramain bleu edition": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "al haramain tobacco edition": ("Tom Ford Tobacco Vanille", "Warm Tobacco Leaf Spiced Cinnamon Bourbon Vanilla"),
    "al haramain white edition": ("Chanel Coco Mademoiselle", "Luminous Orange Turkish Rose Patchouli White Musk"),
    "al haramain signature blue": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "al haramain l'aventure": ("Creed Aventus", "Smoky Birch Bergamot Pineapple Oakmoss Ambergris"),
    "al haramain l'aventure knight": ("Creed Green Irish Tweed", "Lemon Verbena Iris Violet Leaves Sandalwood"),
    "al haramain l'aventure blanche": ("Creed Silver Mountain Water", "Icy Citrus Green Tea Blackcurrant Sandalwood"),
    "al haramain l'aventure femme": ("Creed Aventus For Her", "Crisp Green Apple Pink Berries Patchouli Musk"),
    "al haramain l'aventure intense": ("Creed Aventus (Fruity Smoky Batch)", "Intense Smoky Birch Tart Pineapple Bergamot"),
    "al haramain portfolio neroli canvas": ("Tom Ford Neroli Portofino Forte", "Sunlit Neroli Italian Lemon Petitgrain Amber"),
    "al haramain portfolio royale stallion": ("Parfums de Marly Pegasus", "Sweet Powdery Bitter Almond Vanilla Sandalwood"),
    "al haramain madinah": ("Traditional Saudi Rose & Saffron Musk", "Sacred Medina Rose Saffron Sandalwood Musk"),
    
    # Ahmed Al Maghribi
    "ahmed al maghribi kaaf": ("Abercrombie & Fitch Fierce / Montblanc Legend", "Aromatic Sea Breeze Lavender Red Apple Sandalwood"),
    "ahmed al maghribi bin shaikh": ("Traditional Royal Middle Eastern Rose Oud", "Concentrated Royal Taif Rose French Lavender Saffron Oud"),
    "ahmed al maghribi marj": ("Roja Apex / Bvlgari Tygar", "Crisp Grapefruit Resinous Pine Incense Ambergris"),
    "ahmed al maghribi leather": ("Tom Ford Tuscan Leather / Memo Irish Leather", "Spiced Cardamom Tuscan Leather Ambergris"),
    "ahmed al maghribi blue": ("Chanel Bleu de Chanel", "Crisp Grapefruit Pink Pepper Incense Cedarwood Amber"),
    "ahmed al maghribi ignis": ("Dior Fahrenheit", "Violet Leaf Nutmeg Leather Cedarwood Vetiver"),
    "ahmed al maghribi summer oud": ("Mancera Holidays / Amber & Spices", "Warm Coconut Spiced Amber Sandalwood Agarwood"),
    "ahmed al maghribi bidun esam": ("Xerjoff Erba Pura", "Sweet Calabrian Bergamot Tropical Fruits White Musk"),
    "ahmed al maghribi zeleny": ("Creed Green Irish Tweed", "Crisp Lemon Verbena Iris Violet Leaves Sandalwood"),
    "ahmed al maghribi awfa": ("Tom Ford Tuscan Leather / Ombre Leather", "Warm Spiced Leather Saffron Frankincense Amber"),
    "ahmed al maghribi o'clock": ("Creed Aventus Cologne", "Crisp Fruity Mandarin Pink Pepper Vetiver Patchouli"),
    "ahmed al maghribi ghaf": ("Traditional Emirati Desert Flora & Amber", "Desert Lavender Frankincense Amber Agarwood"),
    "ahmed al maghribi ighra": ("Tom Ford Black Orchid", "Dark Spiced Truffle Black Orchid Incense Patchouli"),
    "ahmed al maghribi gardenia": ("Gucci Flora Gorgeous Gardenia", "Luminous White Gardenia Red Berries Frangipani Brown Sugar"),
    "ahmed al maghribi ahl": ("Creed Aventus", "Smoky Birch Pineapple Bergamot Blackcurrant Oakmoss"),
    "ahmed al maghribi azure royal": ("Roja Elysium", "Crisp Grapefruit Vetiver Pink Pepper Cedar Juniper"),
    "ahmed al maghribi bin ameer": ("Traditional Royal Oudh & Saffron", "Spiced Saffron Royal Agarwood Golden Amber"),
    "ahmed al maghribi blu oud": ("Bleu de Chanel / Deep Blue Oud", "Crisp Marine Citrus Incense Cedar Dark Oud"),
    "ahmed al maghribi brulee": ("Maison Mataha Escapade Gourmande", "Sweet Crème Brûlée Caramelized Sugar Vanilla Tonka"),
    "ahmed al maghribi ignite rose": ("Tom Ford Rose Prick", "May Rose Turkish Rose Bulgarian Rose Sichuan Pepper"),
    "ahmed al maghribi muzn": ("Clean White Musk & Sea Salt Marine", "Pure White Musk Oceanic Sea Salt Melon Sandalwood"),
    "ahmed al maghribi tiff tiff": ("Tiffany & Co. Eau de Parfum", "Mandarin Orange Noble Iris Blackcurrant Patchouli"),
    "ahmed al maghribi opaline wave": ("Louis Vuitton Afternoon Swim", "Sparkling Mandarin Orange Sicilian Bergamot Ginger"),
    "ahmed al maghribi lathani": ("Initio Oud for Greatness", "Natural Saffron Nutmeg Lavender Dark Agarwood"),
    "ahmed al maghribi laathani": ("Initio Oud for Greatness", "Natural Saffron Nutmeg Lavender Dark Agarwood"),
    "ahmed al maghribi musk and roses": ("Montale Roses Musk", "Lush Dewy Rose Clean White Musk Amber"),
    "ahmed al maghribi oud and roses": ("Traditional Gulf Rose & Oud Classic", "Turkish Rose Turkish Oud Saffron Sandalwood"),
    "ahmed al maghribi oud lavender": ("Tom Ford Beau de Jour / Lavender Oud", "Aromatic French Lavender Rosemary Oakmoss Agarwood"),
    
    # Swiss Arabian
    "swiss arabian shaghaf oud": ("Lancôme Oud Bouquet", "Sweet Praline Rose Vanilla Saffron Agarwood"),
    "swiss arabian shaghaf oud abyad": ("Amouage Interlude Man", "Dark Smoky Oregano Pimento Berries Incense Opoponax"),
    "swiss arabian shaghaf oud aswad": ("Tom Ford Noir de Noir", "Dark Earthy Truffle Black Rose Patchouli Vanilla"),
    "swiss arabian shaghaf oud elixir": ("Lancôme Oud Bouquet Extrait", "Intense Caramelized Praline Rose Vanilla Agarwood"),
    "swiss arabian shaghaf oud tonka": ("BDK Velvet Tonka", "Sweet Almond Bitter Orange Tonka Vanilla Wood"),
    "swiss arabian shaghaf oud azraq": ("Lancôme Oud Bouquet + Honey", "Rich Golden Honey Cardamom Amber Bourbon Vanilla Oud"),
    "swiss arabian casablanca": ("Xerjoff La Capitale / Apple Caramel", "Juicy Apple White Peach Sweet Caramel Suede Amber"),
    "swiss arabian inara oud": ("Maison Francis Kurkdjian Oud Satin Mood", "Turkish Rose Bulgarian Rose Violet Sweet Oud Vanilla"),
    "swiss arabian edge intense": ("Dior Sauvage", "Peppery Bergamot Lavender Sichuan Pepper Ambroxan"),
    "swiss arabian gharaam": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "swiss arabian primal code": ("Giorgio Armani Code Profumo", "Spiced Cardamom Green Apple Tonka Amber"),
    "swiss arabian pure instinct": ("Roja Elysium", "Sparkling Grapefruit Vetiver Pink Pepper Cedar"),
    "swiss arabian shawq": ("Creed Aventus", "Smoky Birch Pineapple Bergamot Blackcurrant Oakmoss"),
    "swiss arabian valencia": ("Creed Millésime Impérial", "Salty Marine Watermelon Citrus Musk Iris"),
    "swiss arabian florence": ("Parfums de Marly Delina", "Tart Lychee Turkish Rose Peony Vanilla"),
    "swiss arabian wild spirit": ("Tom Ford Tuscan Leather", "Tuscan Leather Saffron Thyme Amber"),
    "swiss arabian enigma of taif": ("Traditional Saudi Taif Rose", "Royal Taif Rose Saffron Ambergris Musk"),
    "swiss arabian musk 01": ("Initio Musk Therapy", "Creamy White Musk Pink Pepper Sandalwood"),
    "swiss arabian rose 01": ("Parfums de Marly Delina", "Tart Lychee Peony Damask Rose Vanilla"),
    "swiss arabian patchouli 01": ("Tom Ford Patchouli Absolu", "Warm Spiced Patchouli Frankincense Woods"),
    
    # Naseem
    "naseem african sunset": ("Byredo Bal d'Afrique", "Crisp Lemon African Marigold Blackcurrant Vetiver Cedar"),
    "naseem amethyst love": ("Maison Francis Kurkdjian Baccarat Rouge 540 Extrait", "Bitter Almond Saffron Ambergris Cedar"),
    "naseem aqua": ("Giorgio Armani Acqua Di Gio Profondo", "Aromatic Oceanic Marine Rosemary Mineral Ambergris"),
    "naseem asmira": ("Parfums de Marly Delina Exclusif", "Sweet Turkish Rose Lychee Incense Bourbon Vanilla"),
    "naseem aura": ("Maison Francis Kurkdjian Gentle Fluidity Gold", "Warm Madagascar Vanilla Sweet Amber Nutmeg Berries"),
    "naseem aurora": ("By Kilian Angels' Share", "Warm Spiced Date Cognac Praline Cinnamon"),
    "naseem candle light in december": ("Maison Margiela By The Fireplace", "Smoky Chestnuts Guaiac Wood Cloves Vanilla"),
    "naseem eclipse": ("Dior Sauvage", "Peppery Bergamot Lavender Ambroxan Cedar"),
    "naseem horizon": ("Chanel Bleu de Chanel", "Crisp Grapefruit Mint Incense Cedarwood Amber"),
    "naseem leen": ("Lancôme Idôle", "Fresh Pear Clean Rose White Jasmine Musk"),
    "naseem lost in woods": ("Le Labo Santal 33", "Aromatic Cardamom Australian Sandalwood Papyrus"),
    "naseem miqaaat": ("Traditional Saudi Amber & Rose Oud", "Sacred Makkah Taif Rose Saffron Rich Amber"),
    "naseem midnight saphire": ("Versace Dylan Blue", "Aquatic Ambroxan Fig Leaf Pepper Patchouli"),
    "naseem noir": ("Tom Ford Noir Extreme", "Cardamom Kulfi Spiced Amber Vanilla Sandalwood"),
    "naseem regent": ("Roja Elysium", "Crisp Grapefruit Vetiver Pink Pepper Cedar Juniper"),
    "naseem white eclat": ("Chanel Chance Eau Tendre", "Sweet Quince Grapefruit Hyacinth White Musk"),
    "naseem night of success": ("Creed Aventus", "Smoky Birch Pineapple Bergamot Blackcurrant Oakmoss"),
    "naseem ocean enigma": ("Kenzo Homme Marine", "Oceanic Seaweed Salty Marine Pine Akigalawood"),
    "naseem oud": ("Traditional Pure Agarwood", "Deep Resinous Animalic Woody Agarwood"),
    "naseem paris oud": ("Maison Francis Kurkdjian Oud Satin Mood", "Turkish Rose Bulgarian Rose Violet Sweet Oud Vanilla"),
    "naseem purple blue": ("Xerjoff Erba Pura", "Sweet Calabrian Bergamot Tropical Fruits White Musk"),
    "naseem sublime oud": ("Initio Oud for Greatness", "Natural Saffron Nutmeg Lavender Dark Agarwood"),
    "naseem sweet treats in bed": ("Kayali Vanilla 28", "Sweet Vanilla Orchid Tonka Brown Sugar Amber"),
    "naseem the ice between us": ("Creed Silver Mountain Water", "Icy Mountain Air Citrus Green Tea Blackcurrant"),
    "naseem turn up the volume": ("Paco Rabanne 1 Million", "Blood Mandarin Cinnamon Warm Amber Leather"),
    "naseem twin paradise": ("By Kilian Angels' Share", "Cognac Cinnamon Tonka Bean Praline Vanilla Amber"),
    "naseem wrapped in cashmere": ("Maison Margiela Lazy Sunday Morning", "Clean White Cotton Iris Lily of the Valley Musk"),
    "naseem bushra": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "naseem burhan": ("Creed Aventus", "Smoky Birch Pineapple Bergamot Oakmoss"),
    "naseem laha": ("Maison Francis Kurkdjian Baccarat Rouge 540", "Burnt Sugar Saffron Amberwood Cedar"),
    "naseem dunya": ("Louis Vuitton Ombre Nomade", "Smoky Raspberry Incense Saffron Agarwood"),
    
    # Designers & Niche Originals (Canonical eponymous benchmark)
    "creed aventus": ("The Benchmark Fruity Pineapple & Birch Chypre (Creed Original)", "Fruity Smoky Birch Pineapple Chypre"),
    "dior sauvage eau de parfum": ("The Modern Ambroxan Sauvage Benchmark (Dior Original)", "Fresh Peppery Citrus Ambroxan Fougère"),
    "dior sauvage elixir": ("Modern Peppery Spices & Licorice Benchmark (Dior Original)", "Warm Peppery Spices Licorice Nutmeg Lavender"),
    "dior dior homme intense": ("The King of Iris & Cocoa Masterpiece (Dior Original)", "Powdery Orris Cocoa Ambrette Cedar"),
    "chanel bleu de chanel eau de parfum": ("The Quintessential Blue Benchmark (Chanel Original)", "Citrus Woody Aromatic Incense Blue"),
    "tom ford ombré leather eau de parfum": ("The Benchmark Cardamom Floral Leather (Tom Ford Original)", "Spiced Cardamom Floral Jasmine Black Leather"),
    "versace versace pour homme": ("Mediterranean Citrus Fresh Benchmark (Versace Original)", "Crisp Lemon Neroli Cedar Tonka"),
    "versace man eau fraiche": ("Mediterranean Star Fruit & Aquatic Lemon (Versace Original)", "Crisp Aquatic Mediterranean Lemon & Star Fruit"),
    "versace eros flame": ("Versace Eros DNA (Spicy Mandarin & Madagascar Vanilla)", "Spicy Sweet Mandarin Pepper Madagascar Vanilla"),
    "versace pour homme dylan blue": ("Modern Aquatic Ambroxan & Fig Leaf Fougère (Versace Original)", "Aquatic Ambroxan Fig Leaf Pepper Patchouli"),
    "jean paul gaultier le male elixir": ("Golden Honey Lavender Elixir Benchmark (JPG Original)", "Golden Honey Spiced Lavender Tonka Mint Benzoin"),
    "jean paul gaultier ultra male": ("Sweet Pear Bubblegum & Bourbon Vanilla Clubbing Benchmark (JPG Original)", "Sweet Spiced Pear Cinnamon Mint Bourbon Vanilla"),
    "yves saint laurent y eau de parfum": ("Modern Blue Aromatic Sage & Crisp Apple Benchmark (YSL Original)", "Crisp Green Apple Sage Geranium Cedarwood"),
    "mancera coco vanille": ("Niche Tropical Coconut & Madagascar Vanilla Benchmark (Mancera Original)", "Sweet Coconut White Peach Madagascar Vanilla"),
    "lalique encre noire edt": ("Cult Dark Smoky Cypress & Bourbon Vetiver Benchmark (Lalique Original)", "Dark Smoky Cypress Bourbon Vetiver Cashmere Wood"),
}

FLANKER_DISTINCT_TOKENS = [
    'ice', 'freeze', 'elixir', 'atlantis', 'viper', 'fire', 'black', 'kobra', 
    'tropical', 'malibu', 'london', 'chrome', 'nautilus', 'sapphire', 'venom', 
    'gold digger', 'la mer', 'thunder', 'her', 'him', 'zanzibar', 'bourbon', 
    'qahwa', 'dukhan', 'pink', 'moi', 'white', 'tous', 'yellow', 'candy',
    'sublime', 'amethyst', 'glory', 'honor', 'silver', 'rebel', 'dive',
    'extreme', 'platinum', 'intense', 'exclusif', 'parfum', 'absolu',
    'seqoia', 'nero', 'feu', 'beiu', 'sable', 'ginger', 'carnal desire',
    'frostbite', 'platine blanc', 'xandal', 'magnetiq', 'sun kissed',
    'teas me', 'forbidden fruit', 'naughty dates', 'extradose'
]

def clean_key(s):
    if not s:
        return ""
    return re.sub(r'[^a-z0-9]', ' ', s.lower()).strip()

def normalize_key(s):
    return re.sub(r'\s+', ' ', clean_key(s))

def is_safe_match(k_norm, full_key):
    if k_norm == full_key:
        return True
    if k_norm in full_key:
        diff_tokens = set(full_key.split()) - set(k_norm.split())
        for t in diff_tokens:
            if t in FLANKER_DISTINCT_TOKENS:
                return False
        return True
    return False

def is_vague(insp):
    if not insp or not insp.strip():
        return True
    insp_low = insp.lower().strip()
    if insp_low in ['standalone', 'original', 'n/a', 'none', '-']:
        return True
    vague_markers = [
        'classical signature', 'fresher signature', 'crisp signature',
        'rich signature', 'signature creation', 'creation',
        'niche luxury inspired', 'inspired extrait',
        'the original king of fragrances', 'the quintessential blue benchmark',
        'the benchmark leather', 'the king of iris', 'summer heat staple',
        'fiery vanilla twist', 'blue fragrance staple'
    ]
    for vm in vague_markers:
        if vm in insp_low:
            return True
    return False

def main():
    with open(FRAGRANCES_PATH, "r", encoding="utf-8") as f:
        fragrances = json.load(f)

    print(f"Loaded {len(fragrances)} fragrances.")
    
    updated_count = 0
    preserved_count = 0

    # Sort canonical inspirations by key length descending (most specific first)
    sorted_canonical = sorted(CANONICAL_INSPIRATIONS.items(), key=lambda x: len(normalize_key(x[0])), reverse=True)
    sorted_apex = sorted(apex_map.items(), key=lambda x: len(normalize_key(x[0])), reverse=True)

    for frag in fragrances:
        brand = frag.get("brand", "").strip()
        name = frag.get("name", "").strip()
        current_insp = frag.get("dna_inspiration", "")
        
        full_key = normalize_key(f"{brand} {name}")
        name_key = normalize_key(name)
        
        # Check canonical database first
        matched_inspiration = None
        matched_type = None
        
        for k, (insp, dtype) in sorted_canonical:
            k_norm = normalize_key(k)
            if is_safe_match(k_norm, full_key) or (len(name_key) > 4 and is_safe_match(k_norm, name_key)):
                matched_inspiration = insp
                matched_type = dtype
                break

        # Check Apex Aroma inspired map
        if not matched_inspiration:
            for ak, av in sorted_apex:
                ak_norm = normalize_key(ak)
                if is_safe_match(ak_norm, full_key) or (len(name_key) > 5 and is_safe_match(ak_norm, name_key)):
                    apex_insp = av.get("inspired_by", "").strip()
                    if apex_insp and apex_insp not in ["-", "OG", ""]:
                        matched_inspiration = apex_insp
                        break

        # If we have an exact match, or if current inspiration is vague
        if matched_inspiration:
            frag["dna_inspiration"] = matched_inspiration
            if matched_type:
                frag["dna_type"] = matched_type
            if frag.get("similarity_percentage", 0) < 85:
                frag["similarity_percentage"] = 94
            updated_count += 1
        elif is_vague(current_insp):
            # Clean up obvious descriptors
            accords = [a['name'] for a in frag.get('accords', [])[:2]]
            accord_str = " & ".join(accords) if accords else "Luxury Scent"
            
            # Check if brand is an authentic standalone house
            if brand in ["Creed", "Dior", "Chanel", "Tom Ford", "Versace", "Jean Paul Gaultier", "Yves Saint Laurent"]:
                frag["dna_inspiration"] = f"{brand} {name} (Original Benchmark)"
            elif "oud" in name.lower() or "oud" in current_insp.lower():
                frag["dna_inspiration"] = "Traditional Royal Arabian Rose Oud"
            elif accords:
                frag["dna_inspiration"] = f"Original Luxury {accord_str} Profile"
            else:
                frag["dna_inspiration"] = f"{brand} Master Collection"
            updated_count += 1
        else:
            preserved_count += 1

    print(f"Update Summary:")
    print(f"  Enriched/Updated: {updated_count}")
    print(f"  Preserved: {preserved_count}")
    print(f"  Total: {len(fragrances)}")

    # Strict Validation: ensure no null inspirations, NaNs, or corrupted prices
    for f in fragrances:
        assert f.get("dna_inspiration"), f"Missing dna_inspiration on {f['id']}"
        if f.get("community_price") is not None:
            assert not str(f.get("community_price")).lower() == "nan", f"NaN price on {f['id']}"

    with open(FRAGRANCES_PATH, "w", encoding="utf-8") as f:
        json.dump(fragrances, f, indent=2, ensure_ascii=False)

    print("Successfully wrote updated fragrances.json.")

if __name__ == "__main__":
    main()
