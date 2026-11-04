import json
import re
import os

FRAGRANCES_PATH = '/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json'
SYNONYMS_PATH = '/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrance_synonyms.json'
ARTIFACT_DIR = '/Users/umeshchug/.gemini/antigravity/brain/34bdc123-503f-4620-b711-97333fcb7b1a'

with open(FRAGRANCES_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Loaded {len(data)} items from {FRAGRANCES_PATH}")

# 1. Known duplicate merges (synthetic/variant ID -> target canonical ID)
MERGE_MAP = {
    'french-avenue-liquid-brun-150ml': 'french-avenue-liquid-brun',
    'st-9021': 'afnan-supremacy-not-only-intense',
    'st-9020': 'afnan-supremacy-collectors-edition',
    'apex-afnan-snoi': 'afnan-supremacy-not-only-intense',
    'apex-afnan-supremacyheaven': 'afnan-supremacy-in-heaven',
    'st-9121': 'armaf-club-de-nuit-intense-man',
    'st-9003': 'mykonos-cafe-drops',
    'st-9014': 'mykonos-sorrento',
    'st-9108': 'maison-alhambra-jean-lowe-noir',
    'st-9215': 'lattafa-ana-abiyedh',
    'st-9266': 'swiss-arabian-shaghaf-oud',
    'st-9292': 'zimaya-sharaf-blend',
}

# 2. Known single item renames/cleanup
RENAME_ITEMS = {
    'apex-armaf-cdnimpp': {
        'id': 'armaf-club-de-nuit-intense-man-pure-parfum',
        'name': 'Club de Nuit Intense Man Pure Parfum',
        'brand': 'Armaf',
        'aliases': ['CDNIM PP', 'CDNIM PP 150 ML', 'CDNIM Pure Parfum', 'Club de nuit intense PP 150ml', 'Armaf CDNIM Pure Parfum']
    }
}

# Find all items to merge
by_id = {f['id']: f for f in data}

merged_count = 0
for src_id, target_id in MERGE_MAP.items():
    if src_id in by_id and target_id in by_id:
        src = by_id[src_id]
        tgt = by_id[target_id]
        
        # Merge community sellers
        if 'community_sellers' not in tgt or not isinstance(tgt['community_sellers'], list):
            tgt['community_sellers'] = []
        for s in src.get('community_sellers', []):
            existing = next((x for x in tgt['community_sellers'] if x.get('seller_id') == s.get('seller_id')), None)
            if existing:
                if s.get('price', 999999) < existing.get('price', 999999):
                    existing['price'] = s['price']
                    if s.get('product_url'): existing['product_url'] = s['product_url']
            else:
                tgt['community_sellers'].append(s)
                
        # Merge community decants
        if 'community_decants' not in tgt or not isinstance(tgt['community_decants'], list):
            tgt['community_decants'] = []
        for d in src.get('community_decants', []):
            existing = next((x for x in tgt['community_decants'] if x.get('seller_id') == d.get('seller_id')), None)
            if existing:
                existing['sizes'] = {**existing.get('sizes', {}), **d.get('sizes', {})}
                existing['lowest_price'] = min([v for v in existing['sizes'].values() if isinstance(v, (int, float)) and v > 0], default=existing.get('lowest_price', 0))
            else:
                tgt['community_decants'].append(d)
                
        # Initialize aliases
        if 'aliases' not in tgt or not isinstance(tgt['aliases'], list):
            tgt['aliases'] = []
        
        # Add source names as aliases
        for name_candidate in [src.get('name'), f"{src.get('brand')} {src.get('name')}", src.get('id')]:
            if name_candidate and name_candidate not in tgt['aliases'] and name_candidate != tgt['name']:
                tgt['aliases'].append(name_candidate)
                
        # Recalculate price and stock fields on target
        if tgt['community_sellers']:
            prices = [s['price'] for s in tgt['community_sellers'] if s.get('price') and s['price'] > 0]
            if prices:
                tgt['community_price'] = min(prices)
                best_s = min(tgt['community_sellers'], key=lambda s: s.get('price', 999999))
                tgt['lowest_seller'] = best_s.get('seller_id')
                tgt['community_seller_name'] = best_s.get('seller_name')
                tgt['community_whatsapp'] = best_s.get('whatsapp')
                tgt['in_seller_stock'] = True
        
        if tgt['community_decants']:
            decant_prices = [d['lowest_price'] for d in tgt['community_decants'] if d.get('lowest_price') and d['lowest_price'] > 0]
            if decant_prices:
                tgt['has_decants'] = True
                tgt['lowest_decant_price'] = min(decant_prices)
                best_d = min(tgt['community_decants'], key=lambda d: d.get('lowest_price', 999999))
                tgt['lowest_decant_seller'] = best_d.get('seller_name')

        print(f"  Merged [{src_id}] '{src.get('name')}' -> [{target_id}] '{tgt.get('name')}'")
        merged_count += 1

# Remove merged source items
data = [f for f in data if f['id'] not in MERGE_MAP]
print(f"Removed {merged_count} merged duplicate items. Remaining: {len(data)}")

# Apply single item renames/cleanup
for f in data:
    if f['id'] in RENAME_ITEMS:
        cfg = RENAME_ITEMS[f['id']]
        f['id'] = cfg['id']
        f['name'] = cfg['name']
        f['brand'] = cfg['brand']
        f['aliases'] = cfg['aliases']
        print(f"  Renamed item to '{f['name']}' (ID: {f['id']})")

# 3. Clean all names and extract bottle sizes, parenthetical noise, and uppercase screaming
SIZE_REGEX = re.compile(r'\b\d+\s*(?:ml|ML|Ml)\b', re.IGNORECASE)
PAREN_REGEX = re.compile(r'\s*\((.*?)\)\s*')

# Common community synonyms to auto-enrich
POPULAR_SYNONYMS = {
    'afnan-supremacy-not-only-intense': ['SNOI', 'SNOI 100 ML', 'SNOI 150 ML', 'Supremacy NOI', 'Supremacy Not Only Intense (SNOI)'],
    'afnan-supremacy-collectors-edition': ['Supremacy Collector Edition', 'SNOI CE', 'SNOI Collectors'],
    'afnan-supremacy-in-heaven': ['Supremacy Heaven', 'SUPREMACY HEAVEN'],
    'armaf-club-de-nuit-intense-man': ['CDNIM', 'CDNIM EDT', 'CDNIM 105ml', 'Club de Nuit Intense Man (CDNIM)', 'CDNIM Man'],
    'armaf-club-de-nuit-intense-man-pure-parfum': ['CDNIM PP', 'CDNIM PP 150 ML', 'CDNIM Pure Parfum', 'Club de nuit intense PP 150ml'],
    'armaf-club-de-nuit-iconic': ['CDNI Iconic', 'CDNIM Iconic', 'Club De Nuit Iconic'],
    'armaf-club-de-nuit-sillage': ['CDNI Sillage', 'CDNIM Sillage', 'Club De Nuit Sillage'],
    'armaf-club-de-nuit-milestone': ['CDNI Milestone', 'CDNIM Milestone'],
    'armaf-club-de-nuit-untold': ['CDNI Untold', 'CDNIM Untold'],
    'afnan-9pm': ['9PM', '9 PM Black', 'Afnan 9PM', '9pm'],
    'afnan-9am-dive': ['9AM Dive', '9 AM Dive', 'Afnan 9AM Dive'],
    'rue-broca-theoreme-pour-homme': ['Theoreme', 'Theoreme Pour Homme', 'Rue Broca Theoreme', 'Théorème'],
    'lattafa-khamrah': ['Khamra', 'Lattafa Khamrah'],
    'lattafa-khamrah-qahwa': ['Khamra Qahwa', 'Qahwa', 'Lattafa Khamrah Qahwa'],
    'french-avenue-liquid-brun': ['Liquid Brun 150ml', 'Liquid Brun Limited Edition', 'Liquid Brun Limited Edition 150ml'],
    'french-avenue-after-effect': ['After Effect French Avenue', 'FA After Effect'],
    'al-rehab-french-coffee': ['Al Rehab French Coffee', 'French Coffee Al Rehab'],
    'lattafa-vintage-radio': ['Lattafa Vintage Radio', 'Vintage Radio Lattafa'],
    'lattafa-asad': ['Lattafa Asad', 'Asad Black'],
    'lattafa-asad-zanzibar': ['Zanzibar', 'Asad Zanzibar Lattafa'],
    'rasasi-hawas': ['Hawas', 'Rasasi Hawas', 'Hawas for Men', 'Hawas Men'],
    'rasasi-hawas-ice': ['Hawas Ice', 'Rasasi Hawas Ice', 'Hawas Ice Freeze'],
    'rasasi-hawas-black': ['Hawas Black', 'Rasasi Hawas Black'],
    'rasasi-fattan-pour-homme': ['Fattan', 'Rasasi Fattan', 'Fattan Green'],
    'afnan-turathi-blue': ['Turathi', 'Afnan Turathi Blue', 'Turathi Blue Afnan'],
    'lattafa-eclaire': ['Eclair', 'Éclair', 'Lattafa Eclaire'],
    'lattafa-nebras': ['Lattafa Nebras'],
    'lattafa-liam-grey': ['Liam Gray', 'Lattafa Liam Grey'],
    'lattafa-al-nashama-caprice': ['Caprice', 'Nashama Caprice'],
    'gissah-imperial-valley': ['Gissah Imperial Valley', 'Imperial Valley 200ml'],
    'ibrahim-al-qurashi-spanish-tobacco': ['Ibrahim Al Qurashi Spanish Tobacco', 'Spanish Tobacco 100ml'],
    'ahmed-al-maghribi-blue-oud': ['Blu Oud', 'Ahmed Al Maghribi Blue Oud', 'Ahmed Blue Oud'],
    'ahmed-al-maghribi-kaaf': ['Ahmed Kaaf', 'Ahmed Al Maghribi Kaaf'],
    'ahmed-al-maghribi-bin-shaikh': ['Ahmed Bin Shaikh', 'Bin Sheikh'],
    'ahmed-al-maghribi-leather-noir': ['Ahmed Leather Noir'],
    'ahmed-al-maghribi-marj': ['Ahmed Marj'],
    'ahmed-al-maghribi-oud-roses': ['Oud and Roses', 'Ahmed Oud & Roses'],
    'swiss-arabian-shaghaf-oud': ['Shaghaf Oud Gold', 'Shaghaf Oud golden', 'Swiss Arabian Shaghaf Oud'],
    'zimaya-sharaf-blend': ['Zimaya Sharaf Blend', 'Sharaf Blend Zimaya'],
    'al-haramain-detour-noir': ['Detour Noir', 'Al Haramain Detour Noir'],
    'al-haramain-amber-oud-gold-edition': ['Amber Oud Gold', 'Gold Edition 60ML', 'Amber Oud Gold 60ml'],
}

synonyms_registry = []
cleaned_count = 0

for f in data:
    orig_name = f.get('name', '')
    aliases = f.get('aliases', [])
    if not isinstance(aliases, list):
        aliases = []
    
    # Add popular synonyms
    if f['id'] in POPULAR_SYNONYMS:
        for s in POPULAR_SYNONYMS[f['id']]:
            if s not in aliases and s != orig_name:
                aliases.append(s)
                
    new_name = orig_name
    
    # 1. Strip sizes
    if SIZE_REGEX.search(new_name):
        aliases.append(orig_name)
        new_name = SIZE_REGEX.sub('', new_name)
        new_name = re.sub(r'[-–—]\s*$', '', new_name) # trailing hyphen
        new_name = re.sub(r'^\s*[-–—]', '', new_name)
        new_name = re.sub(r'\s+', ' ', new_name).strip()
        
    # 2. Clean parentheses if they are annotations
    match_paren = PAREN_REGEX.search(new_name)
    if match_paren:
        content = match_paren.group(1).strip()
        # Keep legitimate names, strip descriptive tags
        drop_tokens = [
            'pink', 'mango', 'white', 'silver', 'zebra', 'tester', 'open box',
            'golden', 'gold', 'snoi', 'cdnim', 'pure musk', 'eau de parfum',
            'eau de toilette', 'for men', 'all', 'purple', 'black', 'zimaya',
            'kismet angel', 'ombre', "collector's edition"
        ]
        if any(token in content.lower() for token in drop_tokens):
            aliases.append(orig_name)
            if 'bade\'e al oud' in new_name.lower():
                # e.g. Bade'e Al Oud (Oud for Glory) -> Bade'e Al Oud Oud for Glory
                new_name = PAREN_REGEX.sub(r' \1', new_name)
            elif content.lower() == "collector's edition":
                new_name = PAREN_REGEX.sub(r' Collector\'s Edition', new_name)
            elif content.lower() == "for men":
                new_name = PAREN_REGEX.sub(r' For Men', new_name)
            else:
                new_name = PAREN_REGEX.sub('', new_name)
            new_name = re.sub(r'\s+', ' ', new_name).strip()

    # 3. Clean all-caps screaming names
    if new_name.isupper() and len(new_name) > 3:
        aliases.append(orig_name)
        # Title case, preserving known acronyms
        new_name = new_name.title()
        
    # Specific known name cleanups
    name_replacements = {
        'Conquer': 'Conquer',
        'Glitch': 'Glitch',
        'Luminos': 'Luminos',
        'Monaco Royale': 'Monaco Royale',
        'Penthouse': 'Penthouse',
        'Pink Beach': 'Pink Beach',
        'Pink Drops': 'Pink Drops',
        'Reflection Elixir': 'Reflection Elixir',
        'Café Drops': 'Café Drops',
        'Attacks': 'Attacks',
        'Risk': 'Risk',
        'Wild Colt': 'Wild Colt',
        'Wild Colt Bakhur': 'Wild Colt Bakhur',
        'Blue Laverne Bakhur': 'Blue Laverne Bakhur',
        'Imperial Valley': 'Imperial Valley',
        'Spanish Tobacco': 'Spanish Tobacco',
        'French Tobacco': 'French Tobacco',
        'Cuban Tobacco': 'Cuban Tobacco',
        'Arabian Tobacco': 'Arabian Tobacco',
        'Dominican Tobacco': 'Dominican Tobacco',
        'Club de Nuit Intense Man EDT': 'Club de Nuit Intense Man',
        'Club de Nuit Intense Man (CDNIM)': 'Club de Nuit Intense Man',
        'Supremacy Not Only Intense (SNOI)': 'Supremacy Not Only Intense',
        'Sharaf Blend (Zimaya)': 'Sharaf Blend',
        'Rumz Al Rasasi 9325 Pour Lui (Zebra)': 'Rumz Al Rasasi 9325 Pour Lui',
        'Rumz Al Rasasi 9325 Pour Homme (Zebra)': 'Rumz Al Rasasi 9325 Pour Homme',
        'Bade\'e Al Oud (Oud for Glory)': 'Bade\'e Al Oud Oud for Glory',
        'Bade\'e Al Oud (Honor & Glory)': 'Bade\'e Al Oud Honor & Glory',
        'Bade\'e Al Oud (Sublime)': 'Bade\'e Al Oud Sublime',
        'Yara (Pink)': 'Yara',
        'Yara Tous (Mango)': 'Yara Tous',
        'Yara Moi (White)': 'Yara Moi',
        'Maahir Legacy (Silver)': 'Maahir Legacy',
        'Qaed Al Fursan Unlimited (White)': 'Qaed Al Fursan Unlimited',
        'Ana Abiyedh (White)': 'Ana Abiyedh',
        'Jean Lowe Noir (Ombre)': 'Jean Lowe Noir',
        'Kismet Magic (Kismet Angel)': 'Kismet Magic',
        'Shaghaf Oud (Gold)': 'Shaghaf Oud',
        'Shaghaf Oud(golden)': 'Shaghaf Oud',
        'BLU OUD': 'Blue Oud',
        'OPALINE WAVE': 'Opaline Wave',
        'TIFF TIFF': 'Tiff Tiff',
        'MUZN': 'Muzn',
        'BRULEE': 'Brulee',
        'IGNITE Rose': 'Ignite Rose',
        'MUSK and Roses': 'Musk & Roses',
        'Oud and Roses': 'Oud & Roses',
        'Aqua Dubai': 'Aqua Dubai',
        'Gold Edition': 'Amber Oud Gold Edition',
        '33 Black': 'Reef 33 Black',
        '33': 'Reef 33',
        'SUPREMACY HEAVEN': 'Supremacy in Heaven',
        'Détour Noir': 'Détour Noir',
        'Detour Noir': 'Détour Noir',
        'Ombré Leather (Eau de Parfum)': 'Ombré Leather',
        'Bleu de Chanel (Eau de Parfum)': 'Bleu de Chanel',
        'Sauvage (Eau de Parfum)': 'Sauvage',
        'Eros (Eau de Toilette)': 'Eros',
    }
    
    if new_name in name_replacements:
        if orig_name != name_replacements[new_name]:
            aliases.append(orig_name)
        new_name = name_replacements[new_name]

    if new_name != orig_name:
        cleaned_count += 1
        f['name'] = new_name

    # Clean and deduplicate aliases
    clean_aliases = []
    for a in aliases:
        a_clean = a.strip()
        if a_clean and a_clean.lower() != f['name'].lower() and a_clean not in clean_aliases:
            clean_aliases.append(a_clean)
            synonyms_registry.append({
                'alias': a_clean,
                'canonical_name': f['name'],
                'brand': f['brand'],
                'fragrance_id': f['id']
            })
            
    f['aliases'] = clean_aliases

print(f"Cleaned {cleaned_count} fragrance names to canonical Fragrantica standard.")
print(f"Generated {len(synonyms_registry)} total synonym/alias mappings across {len(data)} fragrances.")

# Save standardized fragrances.json
with open(FRAGRANCES_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"Saved {len(data)} standardized fragrances to {FRAGRANCES_PATH}")

# Save fragrance_synonyms.json
with open(SYNONYMS_PATH, 'w', encoding='utf-8') as f:
    json.dump(synonyms_registry, f, indent=2, ensure_ascii=False)
print(f"Saved synonyms registry to {SYNONYMS_PATH}")

# Write Markdown Artifact for the user
artifact_file = os.path.join(ARTIFACT_DIR, 'fragrance_synonym_registry.md')
with open(artifact_file, 'w', encoding='utf-8') as f:
    f.write("# Fragrance Community Synonym & Fragrantica Alignment Registry\n\n")
    f.write(f"**Total Catalog Items**: {len(data)} fragrances\n")
    f.write(f"**Total Registered Aliases**: {len(synonyms_registry)} mappings\n\n")
    f.write("This registry maps community seller sheet names, abbreviations, and informal slang directly to the **official Fragrantica canonical fragrance records**.\n\n")
    f.write("| Brand | Community Sheet / Slang Alias | Official Fragrantica Canonical Name | Fragrance ID |\n")
    f.write("| :--- | :--- | :--- | :--- |\n")
    
    # Sample top 80 prominent mappings
    seen = set()
    for s in synonyms_registry:
        key = (s['brand'], s['alias'], s['canonical_name'])
        if key not in seen:
            seen.add(key)
            f.write(f"| {s['brand']} | `{s['alias']}` | **{s['canonical_name']}** | `{s['fragrance_id']}` |\n")

print(f"Generated registry artifact at {artifact_file}")
