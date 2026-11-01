import json
import math

with open('src/data/fragrances.json', 'r', encoding='utf-8') as f:
    frags = json.load(f)

# Canonical brand name normalization
canonical = {
    'afnan': 'Afnan', 'ahmed al maghribi': 'Ahmed Al Maghribi', 'ajmal': 'Ajmal',
    'al hambra': 'Maison Alhambra', 'al haramain': 'Al Haramain', 'al majed oud': 'Al Majed Oud',
    'al rehab': 'Al Rehab', 'al wataniah': 'Al Wataniah', 'albait aldimashqi': 'Albait Aldimashqi',
    'anfar': 'Anfar', 'arabiyat': 'Arabiyat', 'arabiyat oud al layl': 'Arabiyat Prestige',
    'arabiyat prestige': 'Arabiyat Prestige', 'ard al zaafaran': 'Ard Al Zaafaran',
    'armaf': 'Armaf', 'assaf': 'Assaf', 'dumont': 'Dumont', 'fragrance world': 'Fragrance World',
    'french avenue': 'French Avenue', 'gissah': 'Gissah', 'ibraq': 'Ibraq',
    'ibraheem al qurashi': 'Ibrahim Al Qureshi', 'ibrahim al qureshi': 'Ibrahim Al Qureshi',
    'khadlaj': 'Khadlaj', 'lalique': 'Lalique', 'lattafa': 'Lattafa', 'laverne': 'Laverne',
    'maison alhambra': 'Maison Alhambra', 'maison asrar': 'Maison Asrar', 'mancera': 'Mancera',
    'mykonos': 'Mykonos', 'naseem': 'Naseem', 'nusuk': 'Nusuk', 'paris corner': 'Paris Corner',
    'rasasi': 'Rasasi', 'rayhaan': 'Rayhaan', 'reef': 'Reef', 'reef33': 'Reef',
    'riiffs': 'Riiffs', 'riifs': 'Riiffs', 'riffs': 'Riiffs', 'rue broca': 'Rue Broca',
    'swiss arabian': 'Swiss Arabian', 'titan skinn': 'Titan Skinn', 'zimaya': 'Zimaya'
}

def normalize_note(n):
    if not n: return ''
    l = n.lower().strip()
    if 'mint' in l: return 'mint'
    if 'ambroxan' in l or 'ambergris' in l: return 'ambroxan'
    if 'lavender' in l: return 'lavender'
    if 'bergamot' in l: return 'bergamot'
    if 'cedar' in l: return 'cedar'
    if 'sandalwood' in l: return 'sandalwood'
    if 'patchouli' in l: return 'patchouli'
    if 'vetiver' in l: return 'vetiver'
    if 'vanilla' in l: return 'vanilla'
    if 'cinnamon' in l: return 'cinnamon'
    if 'apple' in l: return 'apple'
    if 'leather' in l: return 'leather'
    if 'oud' in l: return 'oud'
    if 'rose' in l: return 'rose'
    if 'iris' in l: return 'iris'
    if 'coffee' in l: return 'coffee'
    return l

# 1. Normalize brand names and precompute vectors
for f in frags:
    b = f.get('brand', '').strip()
    f['brand'] = canonical.get(b.lower(), b.title())
    
    acc_vec = {a['name'].lower(): a['score'] for a in f.get('accords', [])}
    norm_sq = sum(v * v for v in acc_vec.values())
    f['_acc_vec'] = acc_vec
    f['_acc_norm'] = math.sqrt(norm_sq) or 1.0
    
    top = [normalize_note(n) for n in f.get('notes', {}).get('top', [])]
    mid = [normalize_note(n) for n in f.get('notes', {}).get('middle', [])]
    base = [normalize_note(n) for n in f.get('notes', {}).get('base', [])]
    f['_top_notes'] = set(top)
    f['_mid_notes'] = set(mid)
    f['_base_notes'] = set(base)
    f['_all_notes'] = set(top + mid + base)
    f['_dna'] = (f.get('dna_inspiration') or '').lower().strip()

print(f"Total fragrances: {len(frags)}")

# 2. Compute You May Also Like for all 1,134 fragrances
total_twins_mapped = 0
for i, target in enumerate(frags):
    candidates = []
    t_id = target['id']
    t_brand = target['brand']
    t_dna = target['_dna']
    
    for other in frags:
        if other['id'] == t_id:
            continue
            
        dot = sum(target['_acc_vec'].get(k, 0) * other['_acc_vec'].get(k, 0) for k in target['_acc_vec'])
        cos = dot / (target['_acc_norm'] * other['_acc_norm'])
        
        all_common = len(target['_all_notes'].intersection(other['_all_notes']))
        all_union = len(target['_all_notes'].union(other['_all_notes']))
        note_sim = all_common / all_union if all_union else 0
        
        dna_match = 0.0
        if t_dna and other['_dna']:
            if t_dna == other['_dna'] or t_dna in other['_dna'] or other['_dna'] in t_dna:
                dna_match = 1.0
            else:
                keywords = ['aventus', 'invictus', 'sauvage', 'angels', 'tuxedo', 'tygar', 'neroli', 'black afgano', 'gentleman reserve', 'oud maracuja', 'hacivat', 'silver mountain', 'green irish tweed', 'interlude', 'ultra male', 'le male', 'tobacco vanille', 'omai', 'naxos']
                for kw in keywords:
                    if kw in t_dna and kw in other['_dna']:
                        dna_match = 0.85
                        break

        flanker_match = 1.0 if (target['brand'] == other['brand'] and target.get('collection') and target.get('collection') == other.get('collection')) else 0.0

        hybrid_score = (cos * 0.45) + (note_sim * 0.25) + (dna_match * 0.20) + (flanker_match * 0.10)
        
        cross_company_multiplier = 1.05 if target['brand'] != other['brand'] else 1.0
        adjusted_score = hybrid_score * cross_company_multiplier

        if adjusted_score >= 0.24 or dna_match > 0 or flanker_match > 0:
            candidates.append({
                'id': other['id'],
                'score': adjusted_score,
                'cos': cos,
                'dna_match': dna_match > 0,
                'brand': other['brand']
            })
            
    candidates.sort(key=lambda x: -x['score'])
    
    top_twin_ids = []
    seen_brands = {}
    for c in candidates:
        b = c['brand']
        if seen_brands.get(b, 0) < 3 or c['dna_match']:
            top_twin_ids.append(c['id'])
            seen_brands[b] = seen_brands.get(b, 0) + 1
        if len(top_twin_ids) >= 16:
            break
            
    if not top_twin_ids and candidates:
        top_twin_ids = [c['id'] for c in candidates[:10]]
        
    target['dna_twins'] = top_twin_ids
    total_twins_mapped += len(top_twin_ids)

for f in frags:
    for k in ['_acc_vec', '_acc_norm', '_top_notes', '_mid_notes', '_base_notes', '_all_notes', '_dna']:
        f.pop(k, None)

with open('src/data/fragrances.json', 'w', encoding='utf-8') as f:
    json.dump(frags, f, indent=2, ensure_ascii=False)

print(f"Successfully enriched {len(frags)} fragrances with {total_twins_mapped} cross-company 'You May Also Like' links!")
