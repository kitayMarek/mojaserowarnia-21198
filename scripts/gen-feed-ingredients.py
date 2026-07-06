# -*- coding: utf-8 -*-
"""
Czyści i kategoryzuje bazę surowców paszowych (scripts/pasze-data/feed_base.json,
zjoinowana z XLS Marka) i generuje src/data/feedIngredients.ts.

- wiersze-etykiety sekcji (brak danych odżywczych) -> stają się KATEGORIĄ, są usuwane
- podwarianty z prefiksem "_" -> scalane z nazwą rodzica
- kategorie z kolejności arkusza (blok wiodący + nagłówki sekcji)

UŻYCIE: python scripts/gen-feed-ingredients.py
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "scripts", "pasze-data", "feed_base.json")
OUT  = os.path.join(ROOT, "src", "data", "feedIngredients.ts")

COARSE = {
    "Ziarna, nasiona i strączkowe": "Ziarna, nasiona i strączkowe",
    "Pasze przemysłowe": "Produkty uboczne, śruty i oleje",
}
LABELS = {  # nazwa-etykieta w arkuszu -> ładna kategoria
    "Pasze przemysłowe pochodzenia zwierzęcego": "Pasze pochodzenia zwierzęcego",
    "Susze z roślin zielonych": "Susze z roślin zielonych",
    "Zielonki": "Zielonki (pasze świeże)",
    "Kiszonki": "Kiszonki",
    "Okopowe": "Okopowe i bulwiaste",
    "Dodatki mineralne": "Dodatki mineralne",
    "Gotowe mieszanki": "Gotowe mieszanki (pełnoporcjowe)",
    "Aminokwasy syntetyczne": "Aminokwasy i dodatki paszowe",
    "Premiksy POZBAC": "Premiksy",
    "Koncentraty-PROHAMIX": "Koncentraty",
    "Premiksy PROHAMIX": "Premiksy",
}

def is_empty(r):
    """Brak jakichkolwiek realnych danych odżywczych (pusty wiersz-rodzic wariantów)."""
    return (r["bialko"] is None and r["ca"] is None and (r["em"] in (None, 0))
            and r["mn"] is None and r["fe"] is None and r["extra"]["dm"] is None)

def rnd(v, n):
    return 0 if v is None else round(float(v), n)

def main():
    recs = json.load(open(SRC, encoding="utf-8"))
    out, dropped, parents, merged = [], [], [], []
    coarse = None
    current = "Ziarna, nasiona i strączkowe"
    last_parent = None

    for idx, r in enumerate(recs):
        name = r["name"]
        # granica grubej kategorii (Ziarna -> Pasze przemysłowe)
        if r.get("category") != coarse:
            coarse = r.get("category")
            current = COARSE.get(coarse, coarse or current)
        # 1) jawny nagłówek sekcji -> kategoria, usuń
        if name in LABELS:
            current = LABELS[name]
            dropped.append(name)
            continue
        # 2) podwariant "_..." -> scal z nazwą-rodzicem
        if name.startswith("_"):
            child = name.lstrip("_ ").strip()
            name = f"{last_parent} {child}".strip() if last_parent else child
            merged.append(name)
        else:
            # 3) pusty wiersz, po którym idą warianty "_" = tylko rodzic (dane w wariantach) -> usuń, zapamiętaj
            nxt = recs[idx + 1]["name"] if idx + 1 < len(recs) else ""
            if is_empty(r) and nxt.startswith("_"):
                last_parent = name
                parents.append(name)
                continue
            last_parent = name
        out.append({
            "nazwa": name, "kategoria": current,
            "em": rnd(r["em"], 2), "bialko": rnd(r["bialko"], 2), "wlokno": rnd(r["wlokno"], 2),
            "ca": rnd(r["ca"], 3), "p": rnd(r["p"], 3), "na": rnd(r["na"], 3),
            "k": rnd(r["k"], 3), "mg": rnd(r["mg"], 3),
            "mn": rnd(r["mn"], 1), "zn": rnd(r["zn"], 1), "se": rnd(r["se"], 2),
            "fe": rnd(r["fe"], 1), "i": rnd(r["i"], 2),
        })

    # kategorie w kolejności pierwszego wystąpienia
    cats = list(dict.fromkeys(o["kategoria"] for o in out))

    def js(v): return json.dumps(v, ensure_ascii=False)
    lines = [
        "// AUTO-GENEROWANE przez scripts/gen-feed-ingredients.py",
        "// Źródło: 'Normy żywieniowe do GPT.xls' (arkusze Składniki/Mineralne/Witaminy/Aminokwasy).",
        "// Nie edytuj ręcznie — zmiany nanoś w źródle i przegeneruj.",
        "",
        "export interface FeedIngredient {",
        "  nazwa: string;",
        "  kategoria: string;",
        "  em: number; bialko: number; ca: number; p: number; wlokno: number;",
        "  na: number; k: number; mg: number; mn: number; zn: number; se: number; fe: number; i: number;",
        "}",
        "",
        f"export const feedCategories: string[] = {js(cats)};",
        "",
        "export const feedIngredients: FeedIngredient[] = [",
    ]
    for o in out:
        lines.append(
            f'  {{ nazwa: {js(o["nazwa"])}, kategoria: {js(o["kategoria"])}, '
            f'em: {o["em"]}, bialko: {o["bialko"]}, ca: {o["ca"]}, p: {o["p"]}, wlokno: {o["wlokno"]}, '
            f'na: {o["na"]}, k: {o["k"]}, mg: {o["mg"]}, mn: {o["mn"]}, zn: {o["zn"]}, se: {o["se"]}, fe: {o["fe"]}, i: {o["i"]} }},'
        )
    lines.append("];")
    lines.append("")
    open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(lines))

    # raport
    print(f"WCZYTANO: {len(recs)}  ->  ZOSTAWIONO: {len(out)}  | etykiety: {len(dropped)}  | puści rodzice: {len(parents)}  | scalono '_': {len(merged)}")
    print(f"TS -> {os.path.relpath(OUT, ROOT)}")
    print(f"\nKATEGORIE ({len(cats)}):")
    from collections import Counter
    c = Counter(o["kategoria"] for o in out)
    for cat in cats:
        print(f"  [{c[cat]:>2}] {cat}")
    print(f"\nUsunięte etykiety: {', '.join(dropped)}")
    if merged: print(f"Scalone '_': {', '.join(merged)}")


if __name__ == "__main__":
    main()
