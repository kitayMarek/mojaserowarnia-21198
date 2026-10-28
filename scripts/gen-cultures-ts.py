#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regeneruje src/data/culturesDataComplete.ts ze ZRZUTU bazy Supabase (JSON).
Dzieki temu warstwa statyczna (Hero licznik + gen-baza.py -> mirrory GEO) jest
zsynchronizowana z zywa baza (tabela cultures, is_active=true).

Pipeline pelnej synchronizacji:
  1. curl Supabase REST -> <json>   (wszystkie is_active=true, order=name,shop:
     tak jest ulozona migawka; inna kolejnosc daje diff na caly plik)
  2. python scripts/gen-cultures-ts.py <json>     -> src/data/culturesDataComplete.ts
  3. python scripts/gen-baza.py                   -> public/kultury/baza.html + kultury.summary.txt
  4. (post-proc) add-dates.py, link-slownik.py
  5. build + deploy dist (Hero) + FTP public/kultury/baza.html + kultury.summary.txt

Nazwe i adres sklepu skrypt bierze z kopii huba danerolne.com (tabela
sklepy_z_huba, klucz sklep_id; plan "Sklepy i oferty", krok 6), pobieranej
przy kazdym uruchomieniu z REST (adres i klucz publiczny z .env). Kolumny
shop i shop_url ze zrzutu zostaja tylko jako zapas dla kultury bez sklepu
w kopii; taki przypadek skrypt wypisuje.
"""
import sys, json, os
from urllib.request import Request, urlopen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")

def s(v):
    # bezpieczny literal TS (JSON string == TS string dla naszych danych)
    return json.dumps(v if v is not None else "", ensure_ascii=False)

def czytaj_env():
    dane = {}
    with open(os.path.join(ROOT, ".env"), encoding="utf-8") as f:
        for linia in f:
            if "=" in linia and not linia.strip().startswith("#"):
                k, v = linia.split("=", 1)
                dane[k.strip()] = v.strip().strip('"').strip("'")
    return dane

def sklepy_z_huba():
    env = czytaj_env()
    url, key = env.get("VITE_SUPABASE_URL"), env.get("VITE_SUPABASE_PUBLISHABLE_KEY")
    if not url or not key:
        sys.exit("Brak VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY w .env")
    req = Request(f"{url}/rest/v1/sklepy_z_huba?select=sklep_id,nazwa,strona",
                  headers={"apikey": key, "Authorization": f"Bearer {key}"})
    with urlopen(req, timeout=30) as r:
        return {w["sklep_id"]: w for w in json.loads(r.read().decode("utf-8"))}

def main():
    rows = json.load(open(sys.argv[1], encoding="utf-8"))
    rows = [r for r in rows if r.get("name")]
    sklepy = sklepy_z_huba()
    bez_sklepu = set()
    out = []
    out.append(f"// Complete database of {len(rows)} bacterial cultures for cheese making")
    out.append("// Zrodlo prawdy: tabela `cultures` w Supabase (is_active=true).")
    out.append("// Ten plik jest GENEROWANY: scripts/gen-cultures-ts.py <zrzut.json>. Nie edytuj recznie.")
    out.append("")
    out.append("export interface Culture {")
    for f in ["name", "composition", "application", "temperature", "type", "shop", "shopUrl"]:
        out.append(f"  {f}: string;")
    out.append("  /** Identyfikator sklepu w hubie danerolne.com (domena); shop i shopUrl sa z jego wpisu. */")
    out.append("  sklepId?: string;")
    out.append("  productUrl?: string;")
    out.append("  price: string;")
    out.append("  /** Cena liczbowo (brutto) — do sortowania i przeliczen. */")
    out.append("  price_numeric?: number;")
    out.append("  /** Poprzednia cena brutto — pokazujemy \"teraz X (bylo Y)\". */")
    out.append("  pricePrevious?: number;")
    out.append("  /** Na ile litrow mleka starcza opakowanie (wariant domowy). */")
    out.append("  packLiters?: number;")
    out.append("  /** Dawkowanie podane przez sklep, np. \"2 g / 100 L\". */")
    out.append("  doseLabel?: string;")
    out.append("  /** Producent deklarowany w danych strukturalnych strony produktu. */")
    out.append("  manufacturer?: string;")
    out.append("  /** Proporcja szczepow podana przez sklep, np. \"80:20\". Podaje ja 1 sklep z 5. */")
    out.append("  strainRatio?: string;")
    out.append("  lastChanged?: string;")
    out.append("  lastChecked?: string;")
    out.append("}")
    out.append("")
    out.append("export const culturesData: Culture[] = [")
    for r in rows:
        sklep = sklepy.get(r.get("sklep_id"))
        if not sklep:
            bez_sklepu.add((r.get("sklep_id"), r.get("shop")))
        out.append("  {")
        out.append(f"    name: {s(r.get('name'))},")
        out.append(f"    composition: {s(r.get('composition'))},")
        out.append(f"    application: {s(r.get('application'))},")
        out.append(f"    temperature: {s(r.get('temperature'))},")
        out.append(f"    type: {s(r.get('type'))},")
        out.append(f"    shop: {s(sklep['nazwa'] if sklep else r.get('shop'))},")
        out.append(f"    shopUrl: {s(sklep['strona'] if sklep else r.get('shop_url'))},")
        if r.get("sklep_id"):
            out.append(f"    sklepId: {s(r.get('sklep_id'))},")
        if r.get("product_url"):
            out.append(f"    productUrl: {s(r.get('product_url'))},")
        out.append(f"    price: {s(r.get('price_label'))},")
        if r.get("price_numeric") is not None:
            out.append(f"    price_numeric: {float(r['price_numeric'])},")
        if r.get("price_previous") is not None:
            out.append(f"    pricePrevious: {float(r['price_previous'])},")
        if r.get("pack_liters") is not None:
            out.append(f"    packLiters: {int(r['pack_liters'])},")
        if r.get("dose_label"):
            out.append(f"    doseLabel: {s(r.get('dose_label'))},")
        if r.get("manufacturer"):
            out.append(f"    manufacturer: {s(r.get('manufacturer'))},")
        if r.get("strain_ratio"):
            out.append(f"    strainRatio: {s(r.get('strain_ratio'))},")
        if r.get("last_changed"):
            out.append(f"    lastChanged: {s(r.get('last_changed'))},")
        if r.get("last_checked"):
            out.append(f"    lastChecked: {s(r.get('last_checked'))},")
        out.append("  },")
    out.append("];")
    out.append("")
    open(OUT, "w", encoding="utf-8").write("\n".join(out))
    print(f"OK — {len(rows)} kultur -> {os.path.relpath(OUT, ROOT)}")
    for sklep_id, shop in sorted(bez_sklepu, key=str):
        print(f"UWAGA: sklepu {sklep_id or '(brak sklep_id)'} nie ma w sklepy_z_huba, zostaje {shop!r} z kolumny shop")

if __name__ == "__main__":
    main()
