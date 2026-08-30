#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator statycznych stron przepisow kulinarnych (tresc dla botow bez JS).

Czyta src/data/culinaryRecipesData.ts i tworzy public/przepisy-kulinarne/<id>.html.
To byl jedyny dzial tresci bez mirrorow — dla botow LLM te strony w ogole nie
istnialy, bo widzialy pusta skorupe JavaScriptu.

Kazda strona linkuje do przepisu na ser, na ktorym danie stoi (pole mainCheese),
zeby most miedzy dzialami byl widoczny takze dla botow, nie tylko w aplikacji.

Domyslnie POMIJA istniejace pliki — uzyj --nadpisz, zeby przebudowac.
UZYCIE:  python scripts/gen-kulinarne.py
"""
import re, html, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_KUL = os.path.join(ROOT, "src", "data", "culinaryRecipesData.ts")
SRC_SER = os.path.join(ROOT, "src", "data", "recipesData.ts")
OUTDIR = os.path.join(ROOT, "public", "przepisy-kulinarne")

STR = r'"((?:\\.|[^"])*)"'


def e(t):
    return html.escape(t or "", quote=True)


ZNACZNIK = re.compile(r"\[\[(.+?)\]\]")


def bez_znacznikow(t):
    """Usuwa [[...]] zostawiajac sam tekst — do JSON-LD."""
    return ZNACZNIK.sub(r"\1", t or "")


def z_odnosnikiem(t, sciezka):
    """Zamienia [[tekst]] na odnosnik do przepisu na ser. Escape'uje reszte."""
    t = t or ""
    if not sciezka:
        return e(bez_znacznikow(t))
    wynik, ostatni = [], 0
    for m in ZNACZNIK.finditer(t):
        wynik.append(e(t[ostatni:m.start()]))
        wynik.append('<a href="%s">%s</a>' % (sciezka, e(m.group(1))))
        ostatni = m.end()
    wynik.append(e(t[ostatni:]))
    return "".join(wynik)


def unesc(s):
    return s.replace('\\"', '"').replace("\\n", " ").replace("\\t", " ").strip()


def pole(blok, klucz):
    m = re.search(r"\b" + klucz + r":\s*" + STR, blok)
    return unesc(m.group(1)) if m else ""


def liczba(blok, klucz):
    m = re.search(r"\b" + klucz + r":\s*(\d+)", blok)
    return int(m.group(1)) if m else 0


def lista_str(blok, klucz):
    m = re.search(r"\b" + klucz + r":\s*\[(.*?)\]", blok, re.S)
    if not m:
        return []
    return [unesc(x) for x in re.findall(STR, m.group(1))]


def bloki(tekst, znacznik='    id: "'):
    """Dzieli plik danych na bloki pojedynczych przepisow."""
    poz = [m.start() for m in re.finditer(re.escape(znacznik), tekst)]
    for i, p in enumerate(poz):
        koniec = poz[i + 1] if i + 1 < len(poz) else len(tekst)
        yield tekst[p:koniec]


def parsuj_kulinarne(tekst):
    out = []
    for b in bloki(tekst):
        rid = pole(b, "id")
        if not rid:
            continue
        skladniki = []
        m = re.search(r"ingredients:\s*\[(.*?)\n    \],", b, re.S)
        if m:
            for it in re.finditer(r"\{\s*name:\s*" + STR + r",\s*amount:\s*" + STR, m.group(1)):
                skladniki.append((unesc(it.group(1)), unesc(it.group(2))))
        kroki = []
        m = re.search(r"steps:\s*\[(.*?)\n    \],", b, re.S)
        if m:
            for it in re.finditer(
                r"\{\s*title:\s*" + STR + r",\s*content:\s*" + STR + r"(.*?)\n      \}", m.group(1), re.S
            ):
                tip = pole(it.group(3), "tip")
                warn = pole(it.group(3), "warning")
                kroki.append((unesc(it.group(1)), unesc(it.group(2)), tip, warn))
        out.append({
            "id": rid,
            "name": pole(b, "name"),
            "subtitle": pole(b, "subtitle"),
            "difficulty": pole(b, "difficulty"),
            "prepTime": pole(b, "prepTime"),
            "cookTime": pole(b, "cookTime"),
            "servings": liczba(b, "servings"),
            "description": pole(b, "description"),
            "strategy": pole(b, "strategy"),
            "mainCheese": pole(b, "mainCheese"),
            "wine": pole(b, "wineRecommendation"),
            "tags": lista_str(b, "tags"),
            "presentation": lista_str(b, "presentation"),
            "skladniki": skladniki,
            "kroki": kroki,
            "kcal": liczba(b, "calories"),
            "bialko": liczba(b, "protein"),
        })
    return out


def sery_po_nazwie(tekst):
    """id -> nazwa, do podlinkowania przepisu na ser."""
    d = {}
    for b in bloki(tekst):
        rid = pole(b, "id")
        if rid:
            d[rid] = pole(b, "name")
    return d


def dopasuj_ser(main_cheese, sery):
    sz = re.sub(r"\s+", " ", (main_cheese or "").strip().lower())
    if not sz:
        return None
    for rid, nazwa in sery.items():
        if rid == sz or sz in re.sub(r"\s+", " ", nazwa.lower()):
            return rid, nazwa
    return None


CSS = """  <style>
    :root { --brand:#8a5a16; --brand-dark:#5f3d0f; --ink:#241a12; --muted:#5c4a34; --line:#c9b893; --bg-soft:#ece2cc; }
    body{background:#f4eee0}
    h1,h2,h3,h4{font-family:Georgia,'Times New Roman',serif;font-weight:600}

    * { box-sizing:border-box; }
    body { max-width:860px; margin:0 auto; padding:2rem 1.25rem 4rem; font:16px/1.7 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:var(--ink); }
    h1 { font-size:1.95rem; line-height:1.25; color:var(--brand-dark); margin:0 0 .3rem; }
    h2 { font-size:1.3rem; margin-top:2.2rem; color:var(--brand-dark); border-bottom:2px solid var(--line); padding-bottom:.3rem; }
    h3 { font-size:1.05rem; margin-top:1.4rem; color:var(--ink); }
    .lead { font-size:1.08rem; color:var(--muted); margin-top:0; }
    a { color:var(--brand); }
    table { border-collapse:collapse; width:100%; margin:1rem 0; }
    th, td { border:1px solid var(--line); padding:.5rem .6rem; text-align:left; vertical-align:top; }
    th { background:var(--bg-soft); }
    .meta { color:var(--muted); font-size:.95rem; }
    .tip { background:var(--bg-soft); border-left:3px solid var(--brand); padding:.6rem .8rem; margin:.5rem 0; }
    .warn { background:#fef2f2; border-left:3px solid #dc2626; padding:.6rem .8rem; margin:.5rem 0; }
    .most { border:1px solid #fde68a; background:var(--bg-soft); border-radius:.7rem; padding:1rem 1.2rem; margin:1.6rem 0; }
  </style>"""


def strona(r, ser, rodzenstwo):
    sciezka_sera = f"https://mojaserowarnia.pl/przepisy/{ser[0]}" if ser else None
    url = f"https://mojaserowarnia.pl/przepisy-kulinarne/{r['id']}"
    opis = r["description"][:140] + "…" if len(r["description"]) > 141 else r["description"]

    ld = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": r["name"],
        "description": bez_znacznikow(r["description"]),
        "url": url,
        "recipeCategory": "Danie z serem",
        "recipeCuisine": "Polska",
        "keywords": ", ".join(r["tags"]) if r["tags"] else None,
        "prepTime": None,
        "cookTime": None,
        "recipeYield": f"{r['servings']} porcje" if r["servings"] else None,
        "recipeIngredient": [f"{n} — {a}" if a else n for n, a in r["skladniki"]],
        "recipeInstructions": [
            {"@type": "HowToStep", "position": i + 1, "name": t, "text": bez_znacznikow(c), "url": f"{url}#krok-{i+1}"}
            for i, (t, c, _tip, _w) in enumerate(r["kroki"])
        ],
        "author": {"@type": "Organization", "name": "Moja Serowarnia", "url": "https://mojaserowarnia.pl/"},
    }
    ld = {k: v for k, v in ld.items() if v is not None}

    okruchy = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://mojaserowarnia.pl"},
            {"@type": "ListItem", "position": 2, "name": "Przepisy kulinarne", "item": "https://mojaserowarnia.pl/przepisy-kulinarne"},
            {"@type": "ListItem", "position": 3, "name": r["name"], "item": url},
        ],
    }

    o = []
    o.append('<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />')
    o.append(f"  <title>{e(r['name'])} — przepis krok po kroku | Moja Serowarnia</title>")
    o.append(f'  <meta name="description" content="{e(opis)}" />')
    o.append(f'  <link rel="canonical" href="{url}" />\n  <meta name="robots" content="index, follow" />')
    o.append(f'  <meta property="og:title" content="{e(r["name"])}" />\n  <meta property="og:description" content="{e(opis)}" />\n  <meta property="og:type" content="article" />\n  <meta property="og:url" content="{url}" />\n  <meta property="og:site_name" content="Moja Serowarnia" />\n  <meta property="og:locale" content="pl_PL" />\n  <meta property="og:image" content="https://mojaserowarnia.pl/og-image.png" />')
    o.append('  <script type="application/ld+json">\n' + json.dumps(ld, ensure_ascii=False, indent=2) + "\n  </script>")
    o.append('  <script type="application/ld+json">\n' + json.dumps(okruchy, ensure_ascii=False, indent=2) + "\n  </script>")
    o.append(CSS)
    o.append("</head>\n<body>")

    o.append('  <nav aria-label="Ścieżka nawigacji"><a href="https://mojaserowarnia.pl">Moja Serowarnia</a> › <a href="https://mojaserowarnia.pl/przepisy-kulinarne">Przepisy kulinarne</a> › ' + e(r["name"]) + "</nav>")
    o.append(f"  <h1>{e(r['name'])}</h1>")
    o.append(f"  <p class=\"lead\">{e(r['subtitle'])}</p>")
    o.append(f"  <p class=\"meta\">Trudność: {e(r['difficulty'])} · Przygotowanie: {e(r['prepTime'])} · Gotowanie: {e(r['cookTime'])} · Porcje: {r['servings']}</p>")

    o.append("  <h2>O tym daniu</h2>")
    o.append(f"  <p>{e(bez_znacznikow(r['description']))}</p>")
    if r["strategy"]:
        o.append("  <p>" + z_odnosnikiem(r["strategy"], sciezka_sera) + "</p>")

    # Most do przepisu na ser — takze dla botow, nie tylko w aplikacji.
    if ser:
        sid, snazwa = ser
        o.append('  <div class="most">')
        o.append(f"    <h2 style=\"margin-top:0;border:0;\">Chcesz zrobić ten ser samodzielnie?</h2>")
        o.append(f"    <p>To danie opiera się na serze <strong>{e(r['mainCheese'])}</strong>. Mamy pełny przepis krok po kroku — od mleka po dojrzewalnię: <a href=\"https://mojaserowarnia.pl/przepisy/{sid}\">przepis na {e(snazwa)}</a>.</p>")
        o.append("  </div>")

    if r["skladniki"]:
        o.append("  <h2>Składniki</h2>")
        o.append("  <table>\n    <thead><tr><th>Składnik</th><th>Ilość</th></tr></thead>\n    <tbody>")
        for n, a in r["skladniki"]:
            o.append(f"      <tr><td>{e(n)}</td><td>{e(a)}</td></tr>")
        o.append("    </tbody>\n  </table>")

    if r["kroki"]:
        o.append("  <h2>Przygotowanie krok po kroku</h2>")
        for i, (t, c, tip, warn) in enumerate(r["kroki"], 1):
            o.append(f'  <h3 id="krok-{i}">{e(t)}</h3>')
            o.append("  <p>" + z_odnosnikiem(c, sciezka_sera) + "</p>")
            if tip:
                o.append(f'  <p class="tip">Wskazówka: {e(tip)}</p>')
            if warn:
                o.append(f'  <p class="warn">Uwaga: {e(warn)}</p>')

    if r["presentation"]:
        o.append("  <h2>Podanie</h2>\n  <ul>")
        for x in r["presentation"]:
            o.append(f"    <li>{e(x)}</li>")
        o.append("  </ul>")

    if r["wine"]:
        o.append("  <h2>Do czego podać</h2>")
        o.append(f"  <p>{e(r['wine'])}</p>")

    if rodzenstwo:
        o.append("  <h2>Inne przepisy z serem</h2>\n  <ul>")
        for sid, snazwa in rodzenstwo:
            o.append(f'    <li><a href="https://mojaserowarnia.pl/przepisy-kulinarne/{sid}">{e(snazwa)}</a></li>')
        o.append("  </ul>")

    o.append('  <h2>Zobacz także</h2>\n  <ul>')
    o.append('    <li><a href="https://mojaserowarnia.pl/przepisy">Przepisy na sery domowe</a></li>')
    o.append('    <li><a href="https://mojaserowarnia.pl/przepisy-kulinarne">Wszystkie przepisy kulinarne</a></li>')
    o.append("  </ul>")
    o.append("</body>\n</html>")
    return "\n".join(o)


def main():
    dania = parsuj_kulinarne(open(SRC_KUL, encoding="utf-8").read())
    sery = sery_po_nazwie(open(SRC_SER, encoding="utf-8").read())
    os.makedirs(OUTDIR, exist_ok=True)
    nadpisz = "--nadpisz" in sys.argv
    zrobione, pominiete = [], []
    for r in dania:
        sciezka = os.path.join(OUTDIR, f"{r['id']}.html")
        if os.path.exists(sciezka) and not nadpisz:
            pominiete.append(r["id"])
            continue
        ser = dopasuj_ser(r["mainCheese"], sery)
        rodz = [(x["id"], x["name"]) for x in dania if x["id"] != r["id"]]
        open(sciezka, "w", encoding="utf-8").write(strona(r, ser, rodz))
        zrobione.append((r["id"], len(r["skladniki"]), len(r["kroki"]), ser[0] if ser else "-"))
    print("Wygenerowano %d przepisow kulinarnych:" % len(zrobione))
    for rid, ns, nk, ser in zrobione:
        print("  %-38s skladnikow:%2d krokow:%d  -> ser: %s" % (rid + ".html", ns, nk, ser))
    if pominiete:
        print("Pominieto istniejace (--nadpisz zeby przebudowac): " + ", ".join(pominiete))
    print("")
    print("Pamietaj o regule w .htaccess:  RewriteRule ^przepisy-kulinarne/?$ /index.html [L]")


if __name__ == "__main__":
    main()
