#!/usr/bin/env python3
"""
Chirurgiczny patch danych strukturalnych (Recipe JSON-LD) w RĘCZNIE tworzonych
mirrorach przepisów, których NIE generuje gen-przepisy.py (żeby nie nadpisać ich
bogatszej treści: sekcje "Co to jest…", własne tytuły SEO itd.).

Dodaje do bloku Recipe (jeśli brak): author, datePublished, nutrition (z recipesData)
oraz position + url (#krok-N) w każdym kroku recipeInstructions.
Treść widoczna strony pozostaje nietknięta.
"""
import os, re, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "data", "recipesData.ts")
PUB = os.path.join(ROOT, "public", "przepisy")
IDS = ["caciotta", "gouda", "gruyere", "emmental", "ricotta", "mozzarella"]

# schema.org field -> jednostka
NUT = [
    ("calories", "kcal"), ("proteinContent", "g"), ("fatContent", "g"),
    ("saturatedFatContent", "g"), ("carbohydrateContent", "g"),
    ("sodiumContent", "mg"), ("calciumContent", "mg"),
]


def parse_nutrition(src):
    """id -> dict pól NutritionInformation (z wartościami+jednostkami) + servingSize."""
    out = {}
    for block in re.split(r'\n  \{\n', src):
        m = re.search(r'id:\s*"([^"]+)"', block)
        if not m:
            continue
        rid = m.group(1)
        nm = re.search(r'nutrition:\s*\{(.*?)\}', block, re.S)
        if not nm:
            continue
        nblock = nm.group(1)
        ni = {"@type": "NutritionInformation"}
        sm = re.search(r'servingSize:\s*"([^"]+)"', nblock)
        ni["servingSize"] = sm.group(1) if sm else "100 g"
        for field, unit in NUT:
            fm = re.search(field + r':\s*([\d.]+)', nblock)
            if fm:
                ni[field] = f"{fm.group(1)} {unit}"
        out[rid] = ni
    return out


def patch_file(path, rid, nutrition):
    h = open(path, encoding="utf-8").read()
    cm = re.search(r'<link rel="canonical" href="([^"]+)"', h)
    canonical = cm.group(1) if cm else f"https://mojaserowarnia.pl/przepisy/{rid}.html"

    changed = False
    for m in re.finditer(r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>', h, re.S):
        raw = m.group(1)
        try:
            obj = json.loads(raw)
        except Exception:
            continue
        if obj.get("@type") != "Recipe":
            continue

        if "author" not in obj:
            obj["author"] = {"@type": "Organization", "name": "Moja Serowarnia", "url": "https://mojaserowarnia.pl"}
        obj.setdefault("datePublished", "2025-01-15")
        if "nutrition" not in obj and rid in nutrition:
            obj["nutrition"] = nutrition[rid]

        steps = obj.get("recipeInstructions")
        if isinstance(steps, list):
            for i, s in enumerate(steps):
                if isinstance(s, dict):
                    s["position"] = i + 1
                    s["url"] = f"{canonical}#krok-{i + 1}"

        new_json = json.dumps(obj, ensure_ascii=False, indent=2)
        h = h.replace(raw, new_json, 1)
        changed = True
        break

    if changed:
        open(path, "w", encoding="utf-8").write(h)
    return changed


def main():
    nutrition = parse_nutrition(open(SRC, encoding="utf-8").read())
    for rid in IDS:
        path = os.path.join(PUB, f"{rid}.html")
        if not os.path.exists(path):
            print(f"  POMIJAM {rid}.html — brak pliku")
            continue
        ok = patch_file(path, rid, nutrition)
        has_nut = "tak" if rid in nutrition else "BRAK w recipesData"
        print(f"  {rid}.html — {'zaktualizowano' if ok else 'brak bloku Recipe'} (nutrition: {has_nut})")


if __name__ == "__main__":
    main()
