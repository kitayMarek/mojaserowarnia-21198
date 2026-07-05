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
