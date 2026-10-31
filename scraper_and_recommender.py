"""
Fragrantica Scraper & 'You Will Also Like' Recommendation Engine
Supports: Lattafa, Afnan, Armaf, Mykonos, Rayhaan
"""

import json
import math
from typing import List, Dict, Any

class FragranceRecommender:
    def __init__(self, dataset_path: str = "fragrances.json"):
        with open(dataset_path, "r", encoding="utf-8") as f:
            self.fragrances: List[Dict[str, Any]] = json.load(f)
        self.frag_by_id = {f["id"]: f for f in self.fragrances}

    def calculate_accord_similarity(self, a_accords: List[Dict], b_accords: List[Dict]) -> float:
        """Computes cosine similarity between two accord profiles."""
        vec_a = {item["name"].lower(): item["score"] for item in a_accords}
        vec_b = {item["name"].lower(): item["score"] for item in b_accords}
        
        all_keys = set(vec_a.keys()).union(set(vec_b.keys()))
        if not all_keys:
            return 0.0

        dot_product = sum(vec_a.get(k, 0) * vec_b.get(k, 0) for k in all_keys)
        mag_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
        mag_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))

        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot_product / (mag_a * mag_b)

    def calculate_notes_overlap(self, a_notes: List[str], b_notes: List[str]) -> float:
        """Jaccard similarity on fragrance notes."""
        set_a = {n.lower() for n in a_notes}
        set_b = {n.lower() for n in b_notes}
        if not set_a or not set_b:
            return 0.0
        intersection = set_a.intersection(set_b)
        union = set_a.union(set_b)
        return len(intersection) / len(union)

    def get_recommendations(self, target_id: str, limit: int = 6) -> Dict[str, Any]:
        """
        Generates multi-tier 'You Will Also Like' recommendations:
        1. DNA / Inspiration Twins (Clones of the same high-end DNA)
        2. Olfactory Accord & Note Matches (Score 0-100%)
        3. Line Flankers & Variations
        4. Cross-Brand Alternatives (e.g. Lattafa -> Afnan/Armaf/Rayhaan)
        """
        target = self.frag_by_id.get(target_id)
        if not target:
            return {"error": "Fragrance not found"}

        target_all_notes = target["notes"]["top"] + target["notes"]["middle"] + target["notes"]["base"]
        
        scored_candidates = []
        flankers = []
        dna_twins = []

        for candidate in self.fragrances:
            if candidate["id"] == target_id:
                continue

            # Check flankers (same brand & collection line)
            if (candidate["brand"] == target["brand"] and 
                candidate.get("collection") and 
                candidate.get("collection") == target.get("collection")):
                flankers.append(candidate)

            # Check DNA twins (same inspiration DNA)
            if (candidate.get("dna_inspiration") and 
                target.get("dna_inspiration") and 
                candidate["dna_inspiration"].lower() == target["dna_inspiration"].lower()):
                dna_twins.append(candidate)

            candidate_all_notes = candidate["notes"]["top"] + candidate["notes"]["middle"] + candidate["notes"]["base"]
            
            accord_sim = self.calculate_accord_similarity(target["accords"], candidate["accords"])
            notes_sim = self.calculate_notes_overlap(target_all_notes, candidate_all_notes)
            
            # Weighted hybrid score (60% accords, 30% notes, 10% gender/season match)
            season_match = 1.0 if target.get("primary_season") == candidate.get("primary_season") else 0.5
            overall_score = (accord_sim * 0.60) + (notes_sim * 0.30) + (season_match * 0.10)
            match_percentage = int(round(overall_score * 100))

            # Shared notes list for explanation
            shared_notes = list(set(n.lower() for n in target_all_notes).intersection(
                set(n.lower() for n in candidate_all_notes)
            ))

            scored_candidates.append({
                "fragrance": candidate,
                "match_percentage": match_percentage,
                "shared_accords": [a["name"] for a in candidate["accords"] if any(ta["name"] == a["name"] for ta in target["accords"])],
                "shared_notes": shared_notes
            })

        # Sort candidates by match percentage descending
        scored_candidates.sort(key=lambda x: x["match_percentage"], reverse=True)

        return {
            "target": target,
            "flankers": flankers,
            "dna_twins": dna_twins,
            "top_matches": scored_candidates[:limit]
        }

if __name__ == "__main__":
    print("Fragrance Recommender Module Loaded.")
