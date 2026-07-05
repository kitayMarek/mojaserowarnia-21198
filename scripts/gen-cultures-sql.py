#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator SQL do odswiezenia tabeli `cultures` w Supabase ze scrapu sklepow.
Dane (Nazwa|Sklad|Przeznaczenie|Cena|URL) w scripts/kultury-data/<shop>.txt.
Typ + temperatura dorabiane AUTOMATYCZNIE ze skladu/przeznaczenia (heurystyka).
Cena = wariant DOMOWY (najmniejsze opakowanie).

Strategia (uzgodnione z Markiem 2026-07-05): stare wpisy sklepu is_active=false
(odwracalne), nowe INSERT z czystymi nazwami (kolumna `shop` disambiguuje).

Uzycie:  python scripts/gen-cultures-sql.py            # wszystkie sklepy
         python scripts/gen-cultures-sql.py lactic     # jeden
Wynik:   scripts/sql/cultures-<shop>.sql
"""
import sys, os

TODAY = "2026-07-05"
DATA_DIR = "scripts/kultury-data"

# plik -> (nazwa sklepu w bazie, bazowy URL sklepu)
SHOPS = {
    "lactic":      ("Lactic.pl",   "https://lactic.pl/"),
    "gap":         ("GAP Poland",  "https://sklep.gappoland.com/"),
    "serowar":     ("Serowar.pl",  "https://serowar.pl/"),
    "wanczykowka": ("Wańczykówka", "https://sklep.wanczykowka.com/"),
}

def q(s):
    return "'" + (s or "").replace("'", "''") + "'"

def price_num(label):
    return float(label.replace("zł", "").replace("\xa0", " ").strip().replace(",", ".").split()[0])

TEMP = {
    "mezofilne": "25-35°C", "termofilne": "37-45°C", "mezofilno-termofilne": "25-40°C",
    "jogurtowe": "42-45°C", "probiotyczne": "42-45°C", "kefir": "20-25°C",
    "pleśniowe": "20-25°C", "propionowe": "20-24°C", "aromatyzujące": "15-22°C",
    "ochronne": "20-30°C", "wege": "25-40°C", "zestaw": "",
}

def derive_type(name, comp, app):
    c = comp.lower(); a = app.lower(); n = name.lower()
    bacteria = any(k in c for k in [
        "lactococcus","streptococcus","lactobacillus","leuconostoc","propionibacterium",
        "enterococcus","brevibacterium","bifidobacterium","arthrobacter","micrococcus",
        "staphylococcus","mezofil","termofil","kwaszą","kwasz"])
    mold = ("penicillium" in c) or ("geotrichum" in c)
    yeast_only = any(k in c for k in ["debaryomyces","kluyveromyces","saccharomyces"]) and not bacteria
    # kolejnosc ma znaczenie
    if "zestaw" in c:                                   return "zestaw"
    if "vege" in n or "artiveg" in n or "roślin" in a or "roslin" in a or "vege" in a:
        return "wege"
    if mold and not bacteria:                           return "pleśniowe"
    if "kefir" in n or "kefir" in a or "grzybek kefir" in n: return "kefir"
    if ("ochronn" in c or "ochronn" in a or "protective" in n or "holdbac" in n
        or "hamuje" in a or "ogranicza listeria" in a): return "ochronne"
    if ("bifidobacterium" in c or "acidophilus" in c) and ("jogurt" in a or "probiot" in a or "mlek" in a):
        return "probiotyczne"
    if any(k in c for k in ["brevibacterium","arthrobacter"]) or yeast_only:
        return "aromatyzujące"
    if ("propionibacterium" in c) and not any(k in c for k in ["streptococcus","thermophil"]):
        return "propionowe"
    if "leuconostoc" in c and not any(k in c for k in ["lactococcus","streptococcus","lactobacillus"]):
        return "aromatyzujące"
    has_thermo = any(k in c for k in ["thermophil","helveticus","bulgaricus","salivarius","delbrueckii"])
    has_meso   = any(k in c for k in ["lactococcus","leuconostoc","mezofil"])
    if has_thermo and ("jogurt" in a) and not has_meso: return "jogurtowe"
    if has_thermo and has_meso:                         return "mezofilno-termofilne"
    if has_thermo:                                      return "termofilne"
    if has_meso:                                        return "mezofilne"
    return "mezofilne"

def parse(path):
    rows = []
    for ln in open(path, encoding="utf-8"):
        ln = ln.strip()
        if not ln or ln.startswith("#"): continue
        parts = [p.strip() for p in ln.split("|")]
        if len(parts) != 5:
            print(f"  UWAGA zle pola ({len(parts)}): {ln[:60]}"); continue
        rows.append(parts)  # name, comp, app, price, url
    return rows

def gen(key):
    shop, base = SHOPS[key]
    rows = parse(f"{DATA_DIR}/{key}.txt")
    out = [f"-- Odswiezenie kultur: {shop} ({len(rows)} pozycji) — scrape {TODAY}",
           "BEGIN;",
           f"UPDATE cultures SET is_active=false, updated_at=now() WHERE shop={q(shop)};",
           "INSERT INTO cultures (name, composition, application, temperature, type, shop, shop_url, product_url, price_label, price_numeric, is_active, last_checked) VALUES"]
    vals = []
    stats = {}
    for name, comp, app, price, url in rows:
        typ = derive_type(name, comp, app); temp = TEMP[typ]
        stats[typ] = stats.get(typ, 0) + 1
        vals.append(f"  ({q(name)}, {q(comp)}, {q(app)}, {q(temp)}, {q(typ)}, {q(shop)}, {q(base)}, {q(url)}, {q(price)}, {price_num(price)}, true, {q(TODAY)})")
    out.append(",\n".join(vals) + ";")
    out.append("COMMIT;")
    return "\n".join(out) + "\n", stats

if __name__ == "__main__":
    keys = [sys.argv[1]] if len(sys.argv) > 1 else list(SHOPS)
    os.makedirs("scripts/sql", exist_ok=True)
    for k in keys:
        sql, stats = gen(k)
        open(f"scripts/sql/cultures-{k}.sql", "w", encoding="utf-8").write(sql)
        tstr = ", ".join(f"{t}:{n}" for t, n in sorted(stats.items()))
        print(f"scripts/sql/cultures-{k}.sql — {sum(stats.values())} poz. | typy: {tstr}")
