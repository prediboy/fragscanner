import urllib.request, csv, io, json, re, datetime

print("=== STARTING COMMUNITY SELLERS SYNC PIPELINE ===")

# 1. Load sellers config
with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/seller_config.json') as f:
    sellers_config = json.load(f)

# 2. Load catalog
with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json') as f:
    catalog = json.load(f)

print(f"Catalog contains {len(catalog)} fragrances.")

def norm(s):
    s = s.lower().strip()
    s = re.sub(r'\b(edp|edt|parfum|extrait de parfum|extrait|pure parfum|eau de parfum|eau de toilette|pour homme|pour femme)\b', '', s)
    s = re.sub(r'\b\d+\s*ml\b', '', s)
    s = re.sub(r'[^a-z0-9]', '', s)
    return s

def norm_brand(b):
    b = b.lower().strip()
    b = re.sub(r'[^a-z0-9]', '', b)
    if 'hambra' in b: return 'alhambra'
    if 'riif' in b: return 'riiffs'
    return b

# Known abbreviations and aliases across community sellers
COMMUNITY_ALIASES = {
    # Armaf
    ("armaf", "cdnimedt"): ("armaf", "clubdenuitintenseman"),
    ("armaf", "cdnimlimitededition"): ("armaf", "clubdenuitintensemanlimitededition"),
    ("armaf", "cdnsillage"): ("armaf", "clubdenuitsillage"),
    ("armaf", "cdnuntold"): ("armaf", "clubdenuituntold"),
    ("armaf", "cdniconic"): ("armaf", "clubdenuitblueiconic"),
    ("armaf", "cdniconicextrait"): ("armaf", "clubdenuitblueiconic"),
    ("armaf", "cdnurbanmanelixir"): ("armaf", "clubdenuiturbanelixir"),
    ("armaf", "urbanmanelixir"): ("armaf", "clubdenuiturbanelixir"),
    ("armaf", "cdnowoman"): ("armaf", "clubdenuitwoman"),
    ("armaf", "cdnwoman"): ("armaf", "clubdenuitwoman"),
    ("armaf", "precieuxi"): ("armaf", "clubdenuitprcieux1"),
    ("armaf", "clubdenuitintensemanedt105ml"): ("armaf", "clubdenuitintenseman"),
    ("armaf", "clubdenuiticonic"): ("armaf", "clubdenuitblueiconic"),
    ("armaf", "pourhomme"): ("armaf", "armafpourhomme"),
    
    # Afnan
    ("afnan", "900pm"): ("afnan", "9pm"),
    ("afnan", "9pm"): ("afnan", "9pm"),
    ("afnan", "9pmelixir"): ("afnan", "9pmelixir"),
    ("afnan", "9pmnightout"): ("afnan", "9pmnightout"),
    ("afnan", "9pmrebel"): ("afnan", "9pmrebel"),
    ("afnan", "9amdive"): ("afnan", "9amdive"),
    ("afnan", "snoi100ml"): ("afnan", "supremacynotonlyintense"),
    ("afnan", "snoi150ml"): ("afnan", "supremacynotonlyintense"),
    ("afnan", "supremacynotonlyintense150ml"): ("afnan", "supremacynotonlyintense"),
    
    # Rasasi
    ("rasasi", "hawasforhim"): ("rasasi", "hawas"),
    ("rasasi", "layuqawamallvariants"): ("rasasi", "layuqawampourhomme"),
    
    # Lattafa
    ("lattafa", "badeealoudhonorandglory"): ("lattafa", "badeealoudhonorflory"),
    ("lattafa", "badeealoudhonorglory"): ("lattafa", "badeealoudhonorflory"),
    ("lattafa", "ameeraloudintense"): ("lattafa", "ameeraloudhintenseoud"),
    ("lattafa", "fakhar"): ("lattafa", "fakharblack"),
    
    # French Avenue
    ("french avenue", "liquidbrunlimitededition"): ("french avenue", "liquidbrunlimitededition150ml"),
    ("french avenue", "thunderextrait"): ("french avenue", "thunder"),
    ("french avenue", "aromatixmagnitq"): ("french avenue", "aromatixmagnetiq")
}

# 3. Fetch each seller's live Google Sheet
seller_inventories = {}
sync_stats = {}

for seller in sellers_config:
    seller_id = seller['id']
    seller_name = seller['seller_name']
    url = seller['sheet_url']
    print(f"\n--- Fetching live price list for {seller_name} ---")
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode('utf-8')
            
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)
        print(f"Successfully downloaded {len(rows)} rows from {seller_name}.")
        
        inventory = []
        for r_idx, r in enumerate(rows[1:], start=2):
            if len(r) <= max(seller['brand_col'], seller['product_col'], seller['price_col']):
                continue
                
            brand_raw = r[seller['brand_col']].strip()
            name_raw = r[seller['product_col']].strip()
            price_raw = r[seller['price_col']].strip().replace(',', '').replace('₹', '').replace('/-', '')
            
            # Check price validity
            if not brand_raw or not name_raw or not price_raw.isdigit():
                continue
                
            price_num = int(price_raw)
            if price_num < 400 or price_num > 50000:
                continue # filter out anomaly numbers
                
            is_hot = False
            if seller['hot_col'] >= 0 and len(r) > seller['hot_col']:
                is_hot = '🔥' in r[seller['hot_col']]
                
            inventory.append({
                'brand': brand_raw,
                'name': name_raw,
                'price': price_num,
                'is_hot': is_hot
            })
            
        seller_inventories[seller_id] = inventory
        sync_stats[seller_id] = {
            'seller_name': seller_name,
            'total_items': len(inventory),
            'status': 'success'
        }
        print(f"Parsed {len(inventory)} valid fragrance quotes for {seller_name}.")
        
    except Exception as e:
        print(f"Error fetching {seller_name}: {e}")
        seller_inventories[seller_id] = []
        sync_stats[seller_id] = {
            'seller_name': seller_name,
            'total_items': 0,
            'status': f'failed: {e}'
        }

# 4. Map seller items into catalog
# Index catalog by (brand_norm, name_norm)
catalog_index = {}
for idx, c in enumerate(catalog):
    # Reset seller fields for strict freshness
    c['community_sellers'] = []
    c['community_price'] = None
    c['lowest_seller'] = None
    c['in_seller_stock'] = False
    c['in_second_theory_sheet'] = False
    c['in_fragfever_sheet'] = False
    c['is_hot_seller'] = False
    
    cb = norm_brand(c['brand'])
    cn = norm(c['name'])
    catalog_index[(cb, cn)] = c

# Process each seller's inventory
matched_counts = {s['id']: 0 for s in sellers_config}

for seller in sellers_config:
    seller_id = seller['id']
    items = seller_inventories.get(seller_id, [])
    
    for item in items:
        ib_norm = norm_brand(item['brand'])
        in_norm = norm(item['name'])
        
        # Check alias
        target_alias = COMMUNITY_ALIASES.get((ib_norm, in_norm))
        if target_alias:
            ib_norm, in_norm = target_alias
            
        # 1. Exact lookup
        matched_cat = catalog_index.get((ib_norm, in_norm))
        
        # 2. Fuzzy/contains match within the same brand if not exact
        if not matched_cat:
            for (cb, cn), c in catalog_index.items():
                if cb == ib_norm:
                    if cn == in_norm or cn in in_norm or in_norm in cn:
                        matched_cat = c
                        break
                        
        if matched_cat:
            matched_counts[seller_id] += 1
            
            # Check if this seller is already added to this perfume (avoid dupes)
            if not any(s['seller_name'] == seller['seller_name'] for s in matched_cat['community_sellers']):
                seller_entry = {
                    "seller_id": seller_id,
                    "seller_name": seller['seller_name'],
                    "price": str(item['price']),
                    "stock": "In Stock",
                    "whatsapp": seller['whatsapp'],
                    "shipping": seller['shipping'],
                    "dispatch": seller['dispatch'],
                    "is_hot": item['is_hot'],
                    "verified": True
                }
                matched_cat['community_sellers'].append(seller_entry)
                matched_cat['in_seller_stock'] = True
                
                if seller_id == 'second_theory':
                    matched_cat['in_second_theory_sheet'] = True
                elif seller_id == 'fragfever':
                    matched_cat['in_fragfever_sheet'] = True
                    
                if item['is_hot']:
                    matched_cat['is_hot_seller'] = True

# 5. For each catalog item with sellers, calculate lowest price and best seller
multi_seller_count = 0
in_stock_count = 0

for c in catalog:
    if c['community_sellers']:
        in_stock_count += 1
        # Sort community_sellers by price ascending (best deal first!)
        c['community_sellers'].sort(key=lambda x: int(x['price']))
        c['community_price'] = c['community_sellers'][0]['price']
        c['lowest_seller'] = c['community_sellers'][0]['seller_name']
        
        if len(c['community_sellers']) > 1:
            multi_seller_count += 1

print(f"\nCatalog sync results:")
print(f"Total catalog fragrances: {len(catalog)}")
print(f"Fragrances available in at least one community seller: {in_stock_count}")
print(f"Fragrances available across MULTIPLE sellers (price comparison active): {multi_seller_count}")
for s_id, count in matched_counts.items():
    print(f"  Matched with {s_id}: {count}")

# Verify Opus Women and Private Key
for test_name in ["Opus Women", "Opus Men", "Club De Nuit Private Key To My Success", "Club De Nuit Private Key To My Life"]:
    p = next((x for x in catalog if x['name'] == test_name), None)
    if p:
        print(f"VERIFICATION: '{p['name']}' in_seller_stock = {p['in_seller_stock']}, sellers = {[s['seller_name'] for s in p['community_sellers']]}")

# Verify CDNIM and Liquid Brun
for test_name in ["Club de Nuit Intense Man (CDNIM)", "Liquid Brun", "9 PM", "Hawas"]:
    p = next((x for x in catalog if x['name'] == test_name), None)
    if p:
        print(f"MULTI-SELLER DEAL: '{p['name']}' -> Lowest: ₹{p['community_price']} ({p['lowest_seller']}), All sellers: {[(s['seller_name'], '₹'+s['price']) for s in p['community_sellers']]}")

# 6. Save updated catalog
with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/fragrances.json', 'w') as f:
    json.dump(catalog, f, indent=2)

# 7. Save sync metadata
now_iso = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')
meta = {
    "last_synced": now_iso,
    "total_catalog": len(catalog),
    "total_in_stock": in_stock_count,
    "multi_seller_comparisons": multi_seller_count,
    "sellers": [
        {
            "seller_id": s['id'],
            "seller_name": s['seller_name'],
            "whatsapp": s['whatsapp'],
            "matched_items": matched_counts[s['id']],
            "total_sheet_items": sync_stats[s['id']]['total_items'],
            "status": sync_stats[s['id']]['status']
        } for s in sellers_config
    ]
}

with open('/Users/umeshchug/.gemini/antigravity/scratch/fragrance-hub/src/data/sync_meta.json', 'w') as f:
    json.dump(meta, f, indent=2)

print("\n=== COMMUNITY SYNC COMPLETE: Saved fragrances.json & sync_meta.json ===")
