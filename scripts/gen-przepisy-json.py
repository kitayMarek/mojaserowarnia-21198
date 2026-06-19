#!/usr/bin/env python3
"""
Generuje public/przepisy/index.json — wspólny kontrakt przepisów (schemat v2, BRIEF #3).
FAZA 3a: pełna treść tekstowa (mleko, kultury, podpuszczka, kroki opis/wskazówka, uwagi);
pola LICZBOWE per krok (temperaturaC/czasMin/pH/warunekKonca) = null (faza 3b je dopełni).

Klucze i wartości enumów BEZ polskich znaków (uzgodnione z fermly, wersjaSchematu:2).
`rodzina` i `nazwa` brane z public/przepisy.summary.txt → 1:1 z tamtym plikiem.
`nr` kroku = stała kolejność 1..n po stronie serowarni.

Uruchom: python scripts/gen-przepisy-json.py   (potem FTP upload index.json)
"""
import re, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "data", "recipesData.ts")
SUMMARY = os.path.join(ROOT, "public", "przepisy.summary.txt")
OUT = os.path.join(ROOT, "public", "przepisy", "index.json")

STR = r'"((?:\\.|[^"])*)"'


def unesc(s):
    return s.replace('\\"', '"').replace("\\n", " ").replace("\\t", " ").strip()


def grab(block, key):
    m = re.search(r'\b' + key + r':\s*' + STR, block)
    return unesc(m.group(1)) if m else ""


def grab_array(block, key):
    m = re.search(key + r':\s*\[(.*?)\n    \]', block, re.S)
    return m.group(1) if m else ""


def num(s):
    """pierwsza liczba (z przecinkiem dziesiętnym) lub None"""
    m = re.search(r'(\d+(?:[.,]\d+)?)', s or "")
    return float(m.group(1).replace(",", ".")) if m else None


def milk_typ(s):
    s = (s or "").lower()
    for k, v in [("krow", "krowie"), ("owcz", "owcze"), ("koz", "kozie"), ("miesz", "mieszane")]:
        if k in s:
            return v
    return None


def summary_map():
    """slug -> {nazwa, rodzina} z przepisy.summary.txt (gwarancja 1:1)"""
    out = {}
    for ln in open(SUMMARY, encoding="utf-8").read().splitlines():
        parts = [p.strip() for p in ln.split("|")]
        if len(parts) == 4 and parts[0] not in ("slug",):
            out[parts[0]] = {"nazwa": parts[1], "rodzina": parts[3]}
    return out


def parse_recipes(src):
    out = {}
    for block in re.split(r'\n  \{\n', src):
        rid = grab(block, "id")
        if not rid:
            continue
        cult = grab_array(block, "cultureSubstitutes")
        cultures = [unesc(n) for n in re.findall(r'name:\s*' + STR, cult)]
        stp = grab_array(block, "steps")
        steps = re.findall(r'title:\s*' + STR + r',\s*content:\s*' + STR + r'(?:,\s*tip:\s*' + STR + r')?', stp, re.S)
        out[rid] = dict(
            name=grab(block, "name"), milkBase=grab(block, "milkBase"),
            coagulant=grab(block, "coagulant"), ageTime=grab(block, "ageTime"),
            aging=grab(block, "aging"), yield_=grab(block, "yield"),
            difficulty=grab(block, "difficulty"), cultures=cultures, steps=steps)
    return out


def build(slug, r, meta):
    kroki = []
    for i, (ti, co, tip) in enumerate(r["steps"], 1):
        kroki.append({
            "nr": i, "nazwa": unesc(ti),
            "opis": unesc(co), "wskazowka": unesc(tip) or None,
            "temperaturaC": None, "czasMin": None, "warunekKonca": None, "pH": None,
            "dodatki": [],
        })
    uwagi_parts = []
    if r["ageTime"]:
        uwagi_parts.append(f"Czas dojrzewania: {r['ageTime']}.")
    if r["aging"]:
        uwagi_parts.append(r["aging"])
    return {
        "wersjaSchematu": 2,
        "slug": slug, "nazwa": meta["nazwa"], "rodzina": meta["rodzina"],
        "zrodlo": "serowarnia-kurated", "autor": None, "licencja": None,
        "url": f"https://mojaserowarnia.pl/przepisy/{slug}.html",
        "mleko": {"litry": num(r["milkBase"]), "typ": milk_typ(r["milkBase"]), "pasteryzacja": None},
        "kultury": [{"co": c, "dawka": "wg producenta"} for c in r["cultures"]],
        "podpuszczka": ({"typ": None, "dawka": r["coagulant"], "czasKrzepnieciaMin": None}
                        if r["coagulant"] else None),
        "kroki": kroki,
        "solenie": None,        # faza 3b
        "dojrzewanie": None,    # faza 3b (info tekstowe w krokach + uwagach)
        "wydajnoscKg": num(r["yield_"]),
        "uwagi": " ".join(uwagi_parts) or None,
    }


def main():
    meta = summary_map()
    recipes = parse_recipes(open(SRC, encoding="utf-8").read())
    items = []
    for slug in sorted(meta):                       # 20 serów z summary = źródło prawdy listy
        if slug in recipes:
            items.append(build(slug, recipes[slug], meta[slug]))
        else:
            print(f"  [UWAGA] {slug} jest w summary, brak w recipesData.ts")
    doc = {"wersjaSchematu": 2, "zrodlo": "serowarnia-kurated",
           "wygenerowano": "skrypt gen-przepisy-json.py", "faza": "3a",
           "przepisy": items}
    open(OUT, "w", encoding="utf-8").write(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    nkrok = sum(len(it["kroki"]) for it in items)
    print(f"OK - {len(items)} przepisow, {nkrok} krokow -> {os.path.relpath(OUT, ROOT)} ({os.path.getsize(OUT)} B)")


if __name__ == "__main__":
    main()
