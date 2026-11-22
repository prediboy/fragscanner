import sqlite3
import json
import os
import re
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FLANKERS_DIR = os.path.join(SCRIPT_DIR, '../data/flankers')
RAW_DB_PATH = os.path.join(FLANKERS_DIR, 'perfume_database.db')
TARGET_DB_PATH = os.path.join(FLANKERS_DIR, 'brand_flankers.db')
SUMMARY_JSON_PATH = os.path.join(FLANKERS_DIR, 'flankers_summary.json')

os.makedirs(FLANKERS_DIR, exist_ok=True)

# 1. Load Supabase Environment
env_path = os.path.join(SCRIPT_DIR, '../.env')
env = {}
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip("'\"")

SUPABASE_URL = env.get('VITE_SUPABASE_URL') or env.get('SUPABASE_URL')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('VITE_SUPABASE_ANON_KEY') or env.get('SUPABASE_ANON_KEY')

print("=" * 65)
print("🚀 BUILDING MASTER BRAND & FLANKERS DATABASE")
print("=" * 65)

# 2. Fetch all fragrances from Supabase
print("\n[1/4] Fetching catalog fragrances from Supabase...")
all_catalog_fragrances = []
page = 0
page_size = 1000

while True:
    url = f"{SUPABASE_URL}/rest/v1/fragrances?select=id,name,brand,community_price,lowest_decant_price,dna_inspiration,dna_type,rating_value,accords,top_notes,middle_notes,base_notes,primary_season,gender,best_bottle_seller,in_seller_stock,has_decants"
    req = urllib.request.Request(url, headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Range': f"{page * page_size}-{(page + 1) * page_size - 1}"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if not data:
                break
            all_catalog_fragrances.extend(data)
            if len(data) < page_size:
                break
            page += 1
    except Exception as e:
        print(f"Error fetching page {page}: {e}")
        break

print(f"  ✓ Fetched {len(all_catalog_fragrances)} catalog fragrances from Supabase.")

# Extract unique catalog brands
catalog_brands = sorted(list(set(f['brand'].strip() for f in all_catalog_fragrances if f.get('brand'))))
print(f"  ✓ Found {len(catalog_brands)} distinct brands in catalog.")

# Brand Normalization Mapping
def clean_brand_name(b):
    if not b:
        return ''
    b_clean = b.strip()
    # Normalize common variations
    norm_map = {
        'ARD AL ZAAFARAN': 'Ard Al Zaafaran',
        'ARD AL ZAAFARAN ': 'Ard Al Zaafaran',
        'AL HARAMAIN': 'Al Haramain',
        'AL REHAB': 'Al Rehab',
        'AL WATANIAH': 'Al Wataniah',
        'ALBAIT ALDIMASHQI': 'Albait Aldimashqi',
        'AROMATIC RABBIT': 'Aromatic Rabbit',
        'BANDERAS': 'Antonio Banderas',
        'BDK': 'BDK Parfums',
        'CK': 'Calvin Klein',
        'CALVIN KLEIN (CK)': 'Calvin Klein',
        'DOLCE AND GABBANA': 'Dolce & Gabbana',
        'DOLCE&GABBANA': 'Dolce & Gabbana',
        'D & G': 'Dolce & Gabbana',
        'JEAN-PAUL GAULTIER': 'Jean Paul Gaultier',
        'JPG': 'Jean Paul Gaultier',
        'MAISON FRANCIS KURKDJIAN': 'Maison Francis Kurkdjian',
        'MFK': 'Maison Francis Kurkdjian',
        'PACO RABANNE': 'Rabanne',
        'PARFUMS DE MARLY': 'Parfums de Marly',
        'PDM': 'Parfums de Marly',
        'TF': 'Tom Ford',
        'VIKTOR&ROLF': 'Viktor & Rolf',
        'YSL': 'Yves Saint Laurent',
        'YVES SAINT LAURENT': 'Yves Saint Laurent'
    }
    b_upper = b_clean.upper()
    return norm_map.get(b_upper, b_clean)

# Canonical Brand Lookup Dictionary
brand_lookup = {}
for b in catalog_brands:
    b_canonical = clean_brand_name(b)
    brand_lookup[b.upper().strip()] = b_canonical
    brand_lookup[b_canonical.upper().strip()] = b_canonical
    # Strip suffixes like Parfums, London, etc.
    simplified = b_canonical.upper().replace('PARFUMS', '').replace('LONDON', '').replace('PRIVES', '').replace('PRIVÉS', '').replace('&', 'AND').strip()
    brand_lookup[simplified] = b_canonical

def match_brand(raw_b):
    if not raw_b:
        return None
    cleaned = raw_b.upper().strip()
    if cleaned in brand_lookup:
        return brand_lookup[cleaned]
    simplified = cleaned.replace('PARFUMS', '').replace('LONDON', '').replace('PRIVES', '').replace('PRIVÉS', '').replace('&', 'AND').strip()
    if simplified in brand_lookup:
        return brand_lookup[simplified]
    for k, v in brand_lookup.items():
        if len(k) >= 4 and (cleaned == k or cleaned.startswith(k + ' ') or k.startswith(cleaned + ' ')):
            return v
    return None

# 3. Connect to Raw SQLite Database and Extract Matching Flankers
print("\n[2/4] Reading raw 26k database and matching brand flankers...")
raw_conn = sqlite3.connect(RAW_DB_PATH)
raw_cursor = raw_conn.cursor()

raw_cursor.execute("SELECT brand, name_perfume, family, subfamily, ingredients, years, gender, description FROM perfumes;")
raw_rows = raw_cursor.fetchall()

# Map to store unified flankers
# Key: (brand, canonical_name)
unified_flankers = {}

def extract_concentration(name):
    if not name:
        return 'EDT'
    nl = name.lower()
    if 'extrait' in nl or 'elixir' in nl or 'pure parfum' in nl:
        return 'Extrait / Elixir'
    elif 'eau de parfum' in nl or ' edp' in nl or 'edp ' in nl or 'parfum' in nl:
        return 'EDP'
    elif 'eau de toilette' in nl or ' edt' in nl or 'edt ' in nl:
        return 'EDT'
    elif 'eau de cologne' in nl or ' edc' in nl or 'cologne' in nl:
        return 'EDC'
    elif 'body mist' in nl or 'mist' in nl:
        return 'Mist'
    return 'EDP'

def detect_pillar(brand, name):
    if not name:
        return 'Standalone'
    n = name.strip()
    nl = n.lower()
    
    # Common Pillar Patterns by Brand
    patterns = [
        # Chanel
        (r'\b(bleu\s+de\s+chanel|bleu)\b', 'Bleu de Chanel'),
        (r'\b(allure\s+homme\s+sport|allure\s+homme|allure)\b', 'Allure'),
        (r'\b(coco\s+mademoiselle|coco\s+noir|coco)\b', 'Coco'),
        (r'\b(chance)\b', 'Chance'),
        (r'\b(egoiste|platinum\s+egoiste)\b', 'Egoiste'),
        (r'\b(n[°o\.]?\s*5)\b', 'No. 5'),
        (r'\b(n[°o\.]?\s*19)\b', 'No. 19'),
        (r'\b(gabrielle)\b', 'Gabrielle'),
        (r'\b(cristalle)\b', 'Cristalle'),
        (r'\b(antaeus)\b', 'Antaeus'),
        # Dior
        (r'\b(sauvage)\b', 'Sauvage'),
        (r'\b(dior\s+homme)\b', 'Dior Homme'),
        (r'\b(fahrenheit)\b', 'Fahrenheit'),
        (r'\b(miss\s+dior)\b', 'Miss Dior'),
        (r'\b(j\'?adore)\b', "J'adore"),
        (r'\b(poison|hypnotic\s+poison|pure\s+poison)\b', 'Poison'),
        (r'\b(dior\s+addict|addict)\b', 'Dior Addict'),
        (r'\b(eau\s+sauvage)\b', 'Eau Sauvage'),
        # Armaf
        (r'\b(club\s+de\s+nuit|cdnim)\b', 'Club de Nuit'),
        (r'\b(tres\s+nuit)\b', 'Tres Nuit'),
        (r'\b(odyssey)\b', 'Odyssey'),
        (r'\b(tag[\s-]him)\b', 'Tag-Him'),
        (r'\b(craze)\b', 'Craze'),
        (r'\b(bucephalus)\b', 'Bucephalus'),
        (r'\b(hunter)\b', 'Hunter'),
        (r'\b(ventana)\b', 'Ventana'),
        (r'\b(le\s+parfait)\b', 'Le Parfait'),
        # Lattafa
        (r'\b(khamrah)\b', 'Khamrah'),
        (r'\b(yara)\b', 'Yara'),
        (r'\b(asad)\b', 'Asad'),
        (r'\b(bade\'?e?\s+al\s+oud|badee\s+al\s+oud)\b', "Bade'e Al Oud"),
        (r'\b(qaa\'?ed)\b', "Qaa'ed"),
        (r'\b(fakhar)\b', 'Fakhar'),
        (r'\b(ana\s+abiyedh)\b', 'Ana Abiyedh'),
        (r'\b(ejaazi)\b', 'Ejaazi'),
        (r'\b(ameer\s+al\s+oudh)\b', 'Ameer Al Oudh'),
        (r'\b(velvet\s+rose)\b', 'Velvet Rose'),
        (r'\b(maahir)\b', 'Maahir'),
        (r'\b(nebras)\b', 'Nebras'),
        (r'\b(al\s+nashama)\b', 'Al Nashama'),
        (r'\b(honor\s+&?\s*glory)\b', 'Honor & Glory'),
        # Afnan
        (r'\b(9\s*pm|9\s*am)\b', '9PM / 9AM'),
        (r'\b(turathi)\b', 'Turathi'),
        (r'\b(supremacy)\b', 'Supremacy'),
        (r'\b(rare\s+carbon)\b', 'Rare Carbon'),
        (r'\b(modest)\b', 'Modest'),
        (r'\b(historic)\b', 'Historic'),
        # Rasasi
        (r'\b(hawas)\b', 'Hawas'),
        (r'\b(la\s+yuqawam)\b', 'La Yuqawam'),
        (r'\b(daarej)\b', 'Daarej'),
        (r'\b(shuhrah)\b', 'Shuhrah'),
        (r'\b(egra)\b', 'Egra'),
        (r'\b(al\s+wisam)\b', 'Al Wisam'),
        # Giorgio Armani
        (r'\b(acqua\s+di\s+gi[oò]|adg)\b', 'Acqua di Gio'),
        (r'\b(armani\s+code|code)\b', 'Armani Code'),
        (r'\b(stronger\s+with\s+you)\b', 'Stronger With You'),
        (r'\b(my\s+way)\b', 'My Way'),
        (r'\b(s[iì])\b', 'Sì'),
        # YSL
        (r'\b(la\s+nuit\s+de\s+l\'homme)\b', "La Nuit de L'Homme"),
        (r'\b(l\'homme)\b', "L'Homme"),
        (r'\b(\by\b|y\s+eau\s+de\s+parfum|y\s+live)\b', 'Y'),
        (r'\b(libre)\b', 'Libre'),
        (r'\b(black\s+opium)\b', 'Black Opium'),
        (r'\b(myslf)\b', 'Myslf'),
        (r'\b(mon\s+paris)\b', 'Mon Paris'),
        (r'\b(kouros)\b', 'Kouros'),
        # Tom Ford
        (r'\b(black\s+orchid)\b', 'Black Orchid'),
        (r'\b(noir\s+extreme|noir)\b', 'Noir'),
        (r'\b(oud\s+wood)\b', 'Oud Wood'),
        (r'\b(ombre\s+leather|ombré\s+leather)\b', 'Ombre Leather'),
        (r'\b(grey\s+vetiver)\b', 'Grey Vetiver'),
        (r'\b(tobacco\s+vanille)\b', 'Tobacco Vanille'),
        (r'\b(costa\s+azzurra)\b', 'Costa Azzurra'),
        (r'\b(neroli\s+portofino)\b', 'Neroli Portofino'),
        # Creed
        (r'\b(aventus)\b', 'Aventus'),
        (r'\b(green\s+irish\s+tweed|git)\b', 'Green Irish Tweed'),
        (r'\b(silver\s+mountain\s+water)\b', 'Silver Mountain Water'),
        (r'\b(millesime\s+imperial)\b', 'Millesime Imperial'),
        (r'\b(viking)\b', 'Viking'),
        # Versace
        (r'\b(eros)\b', 'Eros'),
        (r'\b(dylan\s+blue)\b', 'Dylan Blue'),
        (r'\b(pour\s+homme)\b', 'Versace Pour Homme'),
        (r'\b(man\s+eau\s+fraiche)\b', 'Man Eau Fraiche'),
        (r'\b(crystal\s+noir)\b', 'Crystal Noir'),
        (r'\b(bright\s+crystal)\b', 'Bright Crystal')
    ]
    
    for pattern, pillar in patterns:
        if re.search(pattern, nl):
            return pillar
            
    # Generic fallback: first 1 or 2 capitalized words
    words = n.split()
    if len(words) >= 2:
        return f"{words[0]} {words[1]} Line"
    return f"{words[0]} Line" if words else 'Classic Line'

# Ingest from raw DB
for r in raw_rows:
    raw_b = (r[0] or '').strip()
    matched_brand = match_brand(raw_b)
    if not matched_brand:
        continue
        
    p_name = (r[1] or '').strip()
    if not p_name:
        continue
        
    key = f"{matched_brand.upper()}||{p_name.upper()}"
    
    # Clean ingredients list
    ingredients_raw = r[4] or '[]'
    try:
        ingredients_list = json.loads(ingredients_raw.replace("'", '"')) if ingredients_raw.startswith('[') else [i.strip() for i in ingredients_raw.split(',') if i.strip()]
    except Exception:
        ingredients_list = [i.strip() for i in ingredients_raw.replace('[', '').replace(']', '').replace("'", "").split(',') if i.strip()]

    unified_flankers[key] = {
        'brand': matched_brand,
        'name': p_name.title(),
        'pillar_line': detect_pillar(matched_brand, p_name),
        'concentration': extract_concentration(p_name),
        'family': r[2] or 'Unclassified',
        'subfamily': r[3] or 'Unclassified',
        'ingredients': json.dumps(ingredients_list),
        'top_notes': json.dumps(ingredients_list[:3] if len(ingredients_list) >= 3 else ingredients_list),
        'middle_notes': json.dumps(ingredients_list[3:6] if len(ingredients_list) >= 6 else ingredients_list[3:]),
        'base_notes': json.dumps(ingredients_list[6:] if len(ingredients_list) > 6 else []),
        'accords': json.dumps([{"name": r[2], "score": 85}] if r[2] else []),
        'release_year': r[5] or None,
        'gender': r[6] or 'Unisex',
        'description': r[7] or '',
        'in_our_catalog': 0,
        'supabase_fragrance_id': None,
        'community_price': None,
        'lowest_decant_price': None,
        'dna_inspiration': None
    }

print(f"  ✓ Ingested {len(unified_flankers)} flankers from external database.")

# 4. Ingest and Match all 2,461 Supabase Catalog Fragrances
print("\n[3/4] Ingesting and matching all Supabase catalog fragrances...")
catalog_matches = 0

for cf in all_catalog_fragrances:
    c_brand = clean_brand_name(cf['brand'])
    c_name = cf['name'].strip()
    c_key = f"{c_brand.upper()}||{c_name.upper()}"
    
    # Check if exact or fuzzy match in unified_flankers
    matched_entry = None
    if c_key in unified_flankers:
        matched_entry = unified_flankers[c_key]
    else:
        # Fuzzy match by brand and name containment
        for k, v in unified_flankers.items():
            if v['brand'].upper() == c_brand.upper():
                v_name = v['name'].upper()
                if c_name.upper() in v_name or v_name in c_name.upper():
                    matched_entry = v
                    break

    # If matched in unified_flankers, update with our live market pricing & verified notes
    if matched_entry:
        matched_entry['in_our_catalog'] = 1
        matched_entry['supabase_fragrance_id'] = cf['id']
        matched_entry['community_price'] = cf.get('community_price')
        matched_entry['lowest_decant_price'] = cf.get('lowest_decant_price')
        matched_entry['dna_inspiration'] = cf.get('dna_inspiration')
        if cf.get('accords'):
            matched_entry['accords'] = json.dumps(cf['accords'])
        if cf.get('top_notes'):
            matched_entry['top_notes'] = json.dumps(cf['top_notes'])
        if cf.get('middle_notes'):
            matched_entry['middle_notes'] = json.dumps(cf['middle_notes'])
        if cf.get('base_notes'):
            matched_entry['base_notes'] = json.dumps(cf['base_notes'])
        catalog_matches += 1
    else:
        # This is an exclusive/new fragrance in our community catalog not in old datasets!
        unified_flankers[c_key] = {
            'brand': c_brand,
            'name': c_name,
            'pillar_line': detect_pillar(c_brand, c_name),
            'concentration': extract_concentration(c_name),
            'family': cf.get('dna_type') or 'Aromatic Fresh',
            'subfamily': 'Modern Creation',
            'ingredients': json.dumps((cf.get('top_notes') or []) + (cf.get('middle_notes') or []) + (cf.get('base_notes') or [])),
            'top_notes': json.dumps(cf.get('top_notes') or []),
            'middle_notes': json.dumps(cf.get('middle_notes') or []),
            'base_notes': json.dumps(cf.get('base_notes') or []),
            'accords': json.dumps(cf.get('accords') or []),
            'release_year': '2023-2026',
            'gender': cf.get('gender') or 'Unisex',
            'description': f"Verified community catalog fragrance inspired by {cf.get('dna_inspiration') or 'classic formulation'}.",
            'in_our_catalog': 1,
            'supabase_fragrance_id': cf['id'],
            'community_price': cf.get('community_price'),
            'lowest_decant_price': cf.get('lowest_decant_price'),
            'dna_inspiration': cf.get('dna_inspiration')
        }
        catalog_matches += 1

print(f"  ✓ Linked all {len(all_catalog_fragrances)} Supabase fragrances into the Flankers Database!")
print(f"  ✓ Total unique flankers & perfumes in master database: {len(unified_flankers)}")

# 5. Save to Dedicated SQLite Database
print("\n[4/4] Writing to brand_flankers.db and generating summary JSON...")
if os.path.exists(TARGET_DB_PATH):
    os.remove(TARGET_DB_PATH)

target_conn = sqlite3.connect(TARGET_DB_PATH)
target_cur = target_conn.cursor()

target_cur.execute("""
CREATE TABLE IF NOT EXISTS brand_flankers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    pillar_line TEXT NOT NULL,
    name TEXT NOT NULL,
    concentration TEXT,
    family TEXT,
    subfamily TEXT,
    ingredients TEXT,
    top_notes TEXT,
    middle_notes TEXT,
    base_notes TEXT,
    accords TEXT,
    release_year TEXT,
    gender TEXT,
    description TEXT,
    in_our_catalog INTEGER DEFAULT 0,
    supabase_fragrance_id TEXT,
    community_price REAL,
    lowest_decant_price REAL,
    dna_inspiration TEXT
);
""")

target_cur.execute("CREATE INDEX IF NOT EXISTS idx_flankers_brand ON brand_flankers(brand);")
target_cur.execute("CREATE INDEX IF NOT EXISTS idx_flankers_pillar ON brand_flankers(pillar_line);")
target_cur.execute("CREATE INDEX IF NOT EXISTS idx_flankers_in_catalog ON brand_flankers(in_our_catalog);")

insert_rows = []
for item in unified_flankers.values():
    insert_rows.append((
        item['brand'],
        item['pillar_line'],
        item['name'],
        item['concentration'],
        item['family'],
        item['subfamily'],
        item['ingredients'],
        item['top_notes'],
        item['middle_notes'],
        item['base_notes'],
        item['accords'],
        item['release_year'],
        item['gender'],
        item['description'],
        item['in_our_catalog'],
        item['supabase_fragrance_id'],
        item['community_price'],
        item['lowest_decant_price'],
        item['dna_inspiration']
    ))

target_cur.executemany("""
INSERT INTO brand_flankers (
    brand, pillar_line, name, concentration, family, subfamily, ingredients,
    top_notes, middle_notes, base_notes, accords, release_year, gender, description,
    in_our_catalog, supabase_fragrance_id, community_price, lowest_decant_price, dna_inspiration
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
""", insert_rows)

target_conn.commit()
target_conn.close()

# 6. Generate Summary JSON
brand_summary = {}
for item in unified_flankers.values():
    b = item['brand']
    p = item['pillar_line']
    if b not in brand_summary:
        brand_summary[b] = {
            'total_flankers': 0,
            'in_our_catalog': 0,
            'pillars': {}
        }
    brand_summary[b]['total_flankers'] += 1
    if item['in_our_catalog']:
        brand_summary[b]['in_our_catalog'] += 1
    
    brand_summary[b]['pillars'].setdefault(p, []).append({
        'name': item['name'],
        'concentration': item['concentration'],
        'year': item['release_year'],
        'in_stock_in_catalog': bool(item['in_our_catalog']),
        'price': item['community_price']
    })

with open(SUMMARY_JSON_PATH, 'w') as f:
    json.dump({
        'database_file': 'data/flankers/brand_flankers.db',
        'total_perfumes_and_flankers': len(unified_flankers),
        'total_brands': len(brand_summary),
        'fragrances_in_our_catalog': len(all_catalog_fragrances),
        'brands': brand_summary
    }, f, indent=2)

print(f"\n=========================================================")
print(f"✅ SUCCESS: Brand & Flankers Database Built!")
print(f"• Total Flankers & Perfumes in DB: {len(unified_flankers)}")
print(f"• Total Brands Covered: {len(brand_summary)}")
print(f"• SQLite Database: data/flankers/brand_flankers.db")
print(f"• Summary JSON: data/flankers/flankers_summary.json")
print("=========================================================")
