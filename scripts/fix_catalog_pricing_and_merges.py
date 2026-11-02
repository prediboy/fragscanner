#!/usr/bin/env python3
import json
import re

FRAGRANCES_PATH = "src/data/fragrances.json"

def clean(s):
    if not s:
        return ""
    return re.sub(r'\b(eau de parfum|edp|edt|parfum|cologne|extrait|retail pack|tester|bottle)\b', '', s.lower())

def norm(s):
    return re.sub(r'[^a-z0-9]', '', clean(s))

def main():
    print(f"Reading {FRAGRANCES_PATH}...")
    with open(FRAGRANCES_PATH, "r", encoding="utf-8") as f:
        frags = json.load(f)

    print(f"Total items loaded: {len(frags)}")

    # 1. First specifically fix Sharaf Blend:
    # Merge st-9292 into zimaya-sharaf-blend and afnan-zimaya-sharaf-blend
    st_sharaf = next((f for f in frags if f.get("id") == "st-9292"), None)
    for f in frags:
        if "sharaf" in f.get("name", "").lower() or f.get("id") in ["zimaya-sharaf-blend", "afnan-zimaya-sharaf-blend"]:
            f["brand"] = "Zimaya"
            f["dna_inspiration"] = "Kilian Angels' Share (Boozy Cognac Edition)"
            f["community_price"] = 2250
            f["lowest_seller"] = "Second Theory"
            f["community_seller_name"] = "Second Theory & Whiff Culture"
            f["community_whatsapp"] = "8076851481"
            f["has_decants"] = True
            f["lowest_decant_price"] = 199
            f["lowest_decant_seller"] = "Whiff Culture"
            f["in_seller_stock"] = True
            if st_sharaf:
                f["community_sellers"] = st_sharaf.get("community_sellers", [])
                f["community_decants"] = st_sharaf.get("community_decants", [])
                f["decant_comparison"] = st_sharaf.get("decant_comparison", {})
            print(f"  ✓ Fixed Sharaf Blend pricing on {f['id']}: ₹2250 (Bottle) / ₹199 (Decant)")

    # 2. Build index of all items that have real verified community sellers or decants
    priced_items = [f for f in frags if f.get("community_sellers") or f.get("community_decants")]
    print(f"Items with verified quotes: {len(priced_items)}")

    # Map by normalized name and brand+name
    priced_by_name = {}
    for p in priced_items:
        n = norm(p["name"])
        if n and len(n) > 3:
            priced_by_name[n] = p
            # also index without brand name
            b = norm(p.get("brand", ""))
            if b:
                priced_by_name[f"{b}_{n}"] = p

    # 3. Find canonical items that were missing prices and merge them
    enriched_count = 0
    for f in frags:
        if not f.get("community_sellers") and not f.get("community_decants"):
            n = norm(f["name"])
            b = norm(f.get("brand", ""))
            
            matched = priced_by_name.get(f"{b}_{n}") or priced_by_name.get(n)
            if not matched and len(n) > 5:
                # substring match
                for pn, p in priced_by_name.items():
                    if len(pn) > 5 and (n in pn or pn in n):
                        matched = p
                        break

            if matched:
                if matched.get("community_sellers"):
                    f["community_sellers"] = matched["community_sellers"]
                    f["community_price"] = matched.get("community_price")
                    f["lowest_seller"] = matched.get("lowest_seller")
                    f["community_seller_name"] = matched.get("community_seller_name")
                    f["community_whatsapp"] = matched.get("community_whatsapp")
                    f["in_seller_stock"] = True
                if matched.get("community_decants"):
                    f["community_decants"] = matched["community_decants"]
                    f["has_decants"] = True
                    f["lowest_decant_price"] = matched.get("lowest_decant_price")
                    f["lowest_decant_seller"] = matched.get("lowest_decant_seller")
                enriched_count += 1

    print(f"Enriched {enriched_count} canonical perfumes with live seller quotes!")

    # 4. Clean up stale/inconsistent fields across ALL fragrances
    cleaned_stale = 0
    for f in frags:
        sellers = f.get("community_sellers", [])
        decants = f.get("community_decants", [])

        if sellers:
            # Sort sellers by price ascending
            valid_sellers = [s for s in sellers if s.get("price") and Number(s.get("price", 0)) > 100] if "Number" in globals() else [s for s in sellers if s.get("price") and int(s.get("price", 0)) > 100]
            if valid_sellers:
                valid_sellers.sort(key=lambda s: int(s["price"]))
                f["community_sellers"] = valid_sellers
                f["community_price"] = int(valid_sellers[0]["price"])
                f["lowest_seller"] = valid_sellers[0]["seller_name"]
                f["community_whatsapp"] = valid_sellers[0].get("whatsapp")
                seller_names = list(dict.fromkeys([s["seller_name"] for s in valid_sellers]))
                f["community_seller_name"] = " & ".join(seller_names[:2])
                f["in_seller_stock"] = True
            else:
                f["community_sellers"] = []
                f["community_price"] = None
                f["in_seller_stock"] = False

        if not f.get("community_sellers"):
            f["community_price"] = None
            f["in_seller_stock"] = False
            if decants:
                f["lowest_seller"] = None
                decant_sellers = list(dict.fromkeys([d["seller_name"] for d in decants if d.get("seller_name")]))
                f["community_seller_name"] = " & ".join(decant_sellers[:2])
                if not f.get("community_whatsapp") and decants[0].get("whatsapp"):
                    f["community_whatsapp"] = decants[0]["whatsapp"]
            else:
                f["community_seller_name"] = None
                f["lowest_seller"] = None
                f["community_whatsapp"] = None
                cleaned_stale += 1

    print(f"Cleaned up {cleaned_stale} stale ghost seller entries.")

    with open(FRAGRANCES_PATH, "w", encoding="utf-8") as f:
        json.dump(frags, f, indent=2, ensure_ascii=False)
    print(f"Saved cleaned catalog to {FRAGRANCES_PATH}!")

if __name__ == "__main__":
    main()
