#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regeneruje src/data/culturesDataComplete.ts ze ZRZUTU bazy Supabase (JSON).
Dzieki temu warstwa statyczna (Hero licznik + gen-baza.py -> mirrory GEO) jest
zsynchronizowana z zywa baza (tabela cultures, is_active=true).

Pipeline pelnej synchronizacji:
  1. curl Supabase REST -> <json>   (wszystkie is_active=true, order shop,name)
  2. python scripts/gen-cultures-ts.py <json>     -> src/data/culturesDataComplete.ts
  3. python scripts/gen-baza.py                   -> public/kultury/baza.html + kultury.summary.txt
  4. (post-proc) add-dates.py, link-slownik.py
  5. build + deploy dist (Hero) + FTP public/kultury/baza.html + kultury.summary.txt
"""
import sys, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")

def s(v):
    # bezpieczny literal TS (JSON string == TS string dla naszych danych)
    return json.dumps(v if v is not None else "", ensure_ascii=False)

def main():
    rows = json.load(open(sys.argv[1], encoding="utf-8"))
    rows = [r for r in rows if r.get("name")]
    out = []
    out.append(f"// Complete database of {len(rows)} bacterial cultures for cheese making")
    out.append("// Zrodlo prawdy: tabela `cultures` w Supabase (is_active=true).")
    out.append("// Ten plik jest GENEROWANY: scripts/gen-cultures-ts.py <zrzut.json>. Nie edytuj recznie.")
    out.append("")
    out.append("export interface Culture {")
    for f in ["name", "composition", "application", "temperature", "type", "shop", "shopUrl"]:
        out.append(f"  {f}: string;")
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
        out.append("  {")
        out.append(f"    name: {s(r.get('name'))},")
        out.append(f"    composition: {s(r.get('composition'))},")
        out.append(f"    application: {s(r.get('application'))},")
        out.append(f"    temperature: {s(r.get('temperature'))},")
        out.append(f"    type: {s(r.get('type'))},")
        out.append(f"    shop: {s(r.get('shop'))},")
        out.append(f"    shopUrl: {s(r.get('shop_url'))},")
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

if __name__ == "__main__":
    main()
