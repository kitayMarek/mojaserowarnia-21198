# -*- coding: utf-8 -*-
"""
Czyści i kategoryzuje bazę surowców paszowych (scripts/pasze-data/feed_base.json,
zjoinowana z XLS Marka) i generuje src/data/feedIngredients.ts.

- wiersze-etykiety sekcji (brak danych odżywczych) -> stają się KATEGORIĄ, są usuwane
- podwarianty z prefiksem "_" -> scalane z nazwą rodzica
- kategorie z kolejności arkusza (blok wiodący + nagłówki sekcji)

UŻYCIE: python scripts/gen-feed-ingredients.py
"""
import json, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "scripts", "pasze-data", "feed_base.json")
OUT  = os.path.join(ROOT, "src", "data", "feedIngredients.ts")

# Arkusz Marka — źródło aminokwasów, witamin i rozszerzonych mineralnych.
# To ten sam plik, z którego pochodzi feed_base.json; sprawdzone 2026-09-01:
# dla trzynastu składników, które już mamy, iloraz arkusz/baza wynosi 1,000
# na 62–95 par, więc żadnych przeliczeń jednostek tu nie ma.
XLS = r"C:/Normy żywieniowe.xls"
PIERWSZY_WIERSZ = 5

# arkusz -> {indeks kolumny: nazwa pola w TS}
# CENY NIE BIERZEMY — te w arkuszu są sprzed piętnastu lat (decyzja Marka).
# BAW pomijamy, bo to reszta z odejmowania, a nie pomiar.
KOLUMNY = {
    "Składniki": {1: "suchaMasa", 3: "tluszcz", 6: "popiol", 7: "skrobia", 8: "cukier"},
    "Mineralne": {3: "pPrzyswajalny", 7: "cl", 8: "s", 12: "cu", 13: "co"},
    "Aminokwasy": {1: "lys", 2: "met", 3: "metCys", 4: "trp", 5: "thr", 6: "ile",
                   7: "leu", 8: "val", 9: "his", 10: "arg", 11: "phe", 12: "tyr"},
    "Witaminy": {1: "witA", 2: "witD3", 3: "witE", 4: "witB1", 5: "witB2", 6: "witB6",
                 7: "kwasPantotenowy", 8: "kwasFoliowy", 9: "biotyna", 10: "niacyna",
                 11: "witB12", 12: "cholina", 13: "kwasLinolowy"},
}
NOWE_POLA = [p for kol in KOLUMNY.values() for p in kol.values()]


def klucz(t):
    t = unicodedata.normalize("NFKD", str(t)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", t.lower())


def wczytaj_xls():
    """{klucz_nazwy: {pole: liczba}}. Pusta komórka = 0 — tak, jak wprowadzał je
    Marek: 'jak nie było danych, to uznałem, że nie ma; jak są, to ilości śladowe'.
    Rozróżniamy tylko jedno: surowiec, którego w arkuszu NIE MA WCALE, nie dostaje
    pól z tego arkusza (zostaje None), bo to nie jest to samo co pusta komórka."""
    import xlrd
    w = xlrd.open_workbook(XLS)
    dane = {}
    for arkusz, kolumny in KOLUMNY.items():
        a = w.sheet_by_name(arkusz)
        for r in range(PIERWSZY_WIERSZ, a.nrows):
            nazwa = str(a.cell_value(r, 0)).strip()
            if not nazwa:
                continue
            wiersz = dane.setdefault(klucz(nazwa), {})
            for c, pole in kolumny.items():
                if c >= a.ncols:
                    continue
                v = a.cell_value(r, c)
                wiersz[pole] = float(v) if isinstance(v, (int, float)) and v != "" else 0.0
    return dane

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
    rozszerzenia = wczytaj_xls()
    out, dropped, parents, merged = [], [], [], []
    bez_rozszerzen = []
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
        rekord = {
            "nazwa": name, "kategoria": current,
            "em": rnd(r["em"], 2), "bialko": rnd(r["bialko"], 2), "wlokno": rnd(r["wlokno"], 2),
            "ca": rnd(r["ca"], 3), "p": rnd(r["p"], 3), "na": rnd(r["na"], 3),
            "k": rnd(r["k"], 3), "mg": rnd(r["mg"], 3),
            "mn": rnd(r["mn"], 1), "zn": rnd(r["zn"], 1), "se": rnd(r["se"], 2),
            "fe": rnd(r["fe"], 1), "i": rnd(r["i"], 2),
        }
        # Dopasowanie po nazwie SPRZED scalenia wariantów "_", bo tak brzmi ona
        # w arkuszu. Czego w arkuszu nie ma, dostaje zera — surowiec i tak musi mieć
        # komplet pól, żeby sumowanie mieszanki nie wywracało się na braku klucza.
        dodatki = rozszerzenia.get(klucz(r["name"]))
        if dodatki is None:
            bez_rozszerzen.append(name)
            dodatki = {}
        for pole in NOWE_POLA:
            rekord[pole] = round(float(dodatki.get(pole, 0.0)), 4)
        out.append(rekord)

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
        "  // Skład podstawowy (analiza weendeńska)",
        "  suchaMasa: number; tluszcz: number; popiol: number; skrobia: number; cukier: number;",
        "  // Mineralne rozszerzone",
        "  pPrzyswajalny: number; cl: number; s: number; cu: number; co: number;",
        "  // Aminokwasy (% w paszy)",
        "  lys: number; met: number; metCys: number; trp: number; thr: number; ile: number;",
        "  leu: number; val: number; his: number; arg: number; phe: number; tyr: number;",
        "  // Witaminy",
        "  witA: number; witD3: number; witE: number; witB1: number; witB2: number; witB6: number;",
        "  kwasPantotenowy: number; kwasFoliowy: number; biotyna: number; niacyna: number;",
        "  witB12: number; cholina: number; kwasLinolowy: number;",
        "}",
        "",
        f"export const feedCategories: string[] = {js(cats)};",
        "",
        "export const feedIngredients: FeedIngredient[] = [",
    ]
    for o in out:
        rozszerzone = ", ".join(f"{p}: {o[p]}" for p in NOWE_POLA)
        lines.append(
            f'  {{ nazwa: {js(o["nazwa"])}, kategoria: {js(o["kategoria"])},\n'
            f'    em: {o["em"]}, bialko: {o["bialko"]}, ca: {o["ca"]}, p: {o["p"]}, wlokno: {o["wlokno"]}, '
            f'na: {o["na"]}, k: {o["k"]}, mg: {o["mg"]}, mn: {o["mn"]}, zn: {o["zn"]}, se: {o["se"]}, fe: {o["fe"]}, i: {o["i"]},\n'
            f'    {rozszerzone} }},'
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
    print("")
    print(f"ROZSZERZENIA z arkusza: {len(NOWE_POLA)} nowych pol na surowiec")
    if bez_rozszerzen:
        print(f"  bez dopasowania w arkuszu ({len(bez_rozszerzen)}): {', '.join(bez_rozszerzen)}")
    for grupa, pola in (("aminokwasy", ["lys"]), ("witaminy", ["witB1"]), ("tluszcz", ["tluszcz"])):
        ile = sum(1 for o in out if any(o[p] for p in pola))
        print(f"  {grupa:<12} niezerowe u {ile} z {len(out)} surowcow")


if __name__ == "__main__":
    main()
