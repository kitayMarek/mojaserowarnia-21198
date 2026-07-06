#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dopasowuje miniatury ze sklepow (scripts/kultury-data/images.txt) do rekordow bazy
(src/data/culturesDataComplete.ts) po kluczu product_url i generuje SQL:

  ALTER TABLE cultures ADD COLUMN IF NOT EXISTS image_url text;
  UPDATE cultures SET image_url='...' WHERE product_url='...';

Raport (stdout, ASCII): ile rekordow bazy dostalo zdjecie, ktore zostaly bez,
oraz ktore pary obrazkow nie trafily w zaden rekord (nadmiar = zestawy/kiszonki).

UZYCIE:  python scripts/gen-images-sql.py
"""
import re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TS   = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")
IMG  = os.path.join(ROOT, "scripts", "kultury-data", "images.txt")
OUT  = os.path.join(ROOT, "scripts", "sql", "cultures-images.sql")


def sqlq(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def load_images(path):
    pairs = {}          # product_url -> image_url
    brak  = []
    for raw in open(path, encoding="utf-8"):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "|" not in line:
            continue
        prod, img = [p.strip() for p in line.split("|", 1)]
        if img.upper() == "BRAK" or not img:
            brak.append(prod)
            continue
        pairs[prod] = img
    return pairs, brak


def load_db(path):
    text = open(path, encoding="utf-8").read()
    rows = []           # list of dict(name, shop, product_url)
    for obj in re.findall(r"\{[^{}]*\}", text):
        name = re.search(r'name:\s*"((?:[^"\\]|\\.)*)"', obj)
        shop = re.search(r'shop:\s*"((?:[^"\\]|\\.)*)"', obj)
        purl = re.search(r'productUrl:\s*"((?:[^"\\]|\\.)*)"', obj)
        if not name:
            continue
        rows.append({
            "name": name.group(1),
            "shop": shop.group(1) if shop else "",
            "product_url": purl.group(1) if purl else "",
        })
    return rows


def main():
    pairs, brak = load_images(IMG)
    rows = load_db(TS)

    matched, no_img = [], []
    used_prod = set()
    for r in rows:
        pu = r["product_url"]
        if pu and pu in pairs:
            matched.append((pu, pairs[pu]))
            used_prod.add(pu)
        else:
            no_img.append(r)

    leftover = [pu for pu in pairs if pu not in used_prod]

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("-- Miniatury produktow (hotlink ze sklepow). Klucz = product_url.\n")
        f.write("-- Wygenerowane: scripts/gen-images-sql.py\n\n")
        f.write("ALTER TABLE cultures ADD COLUMN IF NOT EXISTS image_url text;\n\n")
        for pu, img in matched:
            f.write(f"UPDATE cultures SET image_url={sqlq(img)} WHERE product_url={sqlq(pu)};\n")
        f.write("\n")

    # ---- raport (ASCII only) ----
    print(f"DB rekordow (obiektow):        {len(rows)}")
    print(f"DB z product_url:              {sum(1 for r in rows if r['product_url'])}")
    print(f"Par obrazkow w images.txt:     {len(pairs)}  (+ BRAK: {len(brak)})")
    print(f"DOPASOWANO (dostaly zdjecie):  {len(matched)}")
    print(f"BEZ zdjecia (rekordy bazy):    {len(no_img)}")
    print(f"Nadmiar par (bez rekordu):     {len(leftover)}")
    print(f"\nSQL -> {os.path.relpath(OUT, ROOT)}")

    if no_img:
        print("\n--- Rekordy bazy BEZ zdjecia ---")
        for r in sorted(no_img, key=lambda x: (x["shop"], x["name"])):
            tag = "(brak product_url)" if not r["product_url"] else ""
            print(f"  [{r['shop']}] {r['name']} {tag}")

    if leftover:
        print("\n--- Pary obrazkow ktore NIE trafily w baze (nadmiar) ---")
        for pu in sorted(leftover):
            print(f"  {pu}")


if __name__ == "__main__":
    main()
