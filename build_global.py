# -*- coding: utf-8 -*-
"""Build the global 200cc+ dataset: data/global_brands.json -> data/dashboard.json / dashboard.js.

Usage:
    python3 build_global.py --check   # validate only
    python3 build_global.py           # write data files
"""
import argparse, json, os, sys, glob

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")

BUCKETS = ["200-399cc", "400-699cc", "700-999cc", "1000cc+"]
CATS = ["Japanese", "European", "American", "Asian other", "Chinese"]
TYPES = ["Sport", "Naked", "Cruiser", "ADV", "Scooter", "Retro", "Touring", "Off-road", "Other"]


def bucket(cc):
    if cc < 400:
        return "200-399cc"
    if cc < 700:
        return "400-699cc"
    if cc < 1000:
        return "700-999cc"
    return "1000cc+"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    src = os.path.join(DATA, "global_brands.json")
    doc = json.load(open(src, encoding="utf-8"))
    meta = doc["meta"]
    brands = doc["brands"]
    errors = []

    ids, names = set(), set()
    for b in brands:
        if b["id"] in ids:
            errors.append("duplicate brand id: %s" % b["id"])
        ids.add(b["id"])
        if b["name"] in names:
            errors.append("duplicate brand name: %s" % b["name"])
        names.add(b["name"])
        if b["category"] not in CATS:
            errors.append("%s: bad category %s" % (b["id"], b["category"]))
        seen = set()
        for m in b["models"]:
            if m["name"] in seen:
                errors.append("%s: duplicate model %s" % (b["id"], m["name"]))
            seen.add(m["name"])
            if not (199 <= m["cc"] <= 3000):
                errors.append("%s %s: cc out of range %s" % (b["id"], m["name"], m["cc"]))
            if m["type"] not in TYPES:
                errors.append("%s %s: bad type %s" % (b["id"], m["name"], m["type"]))
            if not m.get("source"):
                errors.append("%s %s: missing source" % (b["id"], m["name"]))
            m["bucket"] = bucket(m["cc"])
            m["price"] = None
            m["priceMin"] = None
            m["priceMax"] = None
            m["priceFrom"] = False
            m["priceUnit"] = "USD"
        b["modelCount"] = len(b["models"])
        b["logo"] = b.get("logo") or {"file": None, "status": "missing", "source": None, "note": None}

    if errors:
        print("\n".join(errors))
        return 1
    if args.check:
        print("OK: %d brands / %d models" % (len(brands), sum(b["modelCount"] for b in brands)))
        return 0

    def compute_stats(bs):
        st = {
            "brandCount": len(bs),
            "brandCountWithModels": sum(1 for b in bs if b["models"]),
            "modelCount": sum(b["modelCount"] for b in bs),
            "modelCountAll": sum(b["modelCount"] for b in bs),
            "parallelBrandCount": 0,
            "parallelModelCount": 0,
            "logoCount": sum(1 for b in bs if b["logo"].get("status") == "ok"),
            "logoMissing": sum(1 for b in bs if b["logo"].get("status") != "ok"),
            "byCategory": {c: sum(1 for b in bs if b["category"] == c) for c in CATS},
            "byCategoryModels": {c: sum(b["modelCount"] for b in bs if b["category"] == c) for c in CATS},
            "byBucket": {k: 0 for k in BUCKETS},
            "byType": {k: 0 for k in TYPES},
        }
        for b in bs:
            for m in b["models"]:
                st["byBucket"][m["bucket"]] += 1
                st["byType"][m["type"]] += 1
        return st

    def compute_market(bs, st, note_categories):
        top_all = sorted(bs, key=lambda b: -b["modelCount"])[:5]
        top_big = sorted(bs, key=lambda b: -sum(1 for m in b["models"] if m["cc"] >= 1000))[:5]
        return {
            "year": 2026,
            "items": [
                {"label": "Brands covered", "value": str(len(bs)), "unit": "", "delta": "", "note": note_categories},
                {"label": "Models listed", "value": str(st["modelCount"]), "unit": "", "delta": "", "note": "200cc and above · official line-ups"},
                {"label": "Adventure models", "value": str(st["byType"].get("ADV", 0)), "unit": "", "delta": "", "note": "ADV body type across all brands"},
                {"label": "Largest displacement", "value": "2458", "unit": "cc", "delta": "", "note": "Triumph Rocket 3"},
            ],
            "leaders250": [b["name"] for b in top_all],
            "leaders500": [b["name"] for b in top_big],
            "source": "compiled from official manufacturer line-ups",
            "leadersSource": "Top 5 by number of 200cc+ models",
        }

    stats = compute_stats(brands)
    market = compute_market(brands, stats, "Japanese / European / American / Asian other / Chinese export")
    outside = [b for b in brands if b["category"] != "Chinese"]
    stats_out = compute_stats(outside)
    market_out = compute_market(outside, stats_out, "Japanese / European / American / Asian other")
    out = {"meta": meta, "stats": stats, "statsOutsideChina": stats_out, "market": market,
           "marketOutsideChina": market_out, "brands": brands}
    json.dump(out, open(os.path.join(DATA, "dashboard.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(os.path.join(DATA, "dashboard.js"), "w", encoding="utf-8").write(
        "window.MOTO_DATA = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    print("built %d brands / %d models" % (len(brands), stats["modelCount"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
