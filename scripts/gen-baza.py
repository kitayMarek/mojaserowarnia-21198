#!/usr/bin/env python3
"""
Generator statycznych plików z bazy kultur (treść dla botów / asystentów AI bez JS).

To NIE jest prerendering — nie uruchamia aplikacji React. Czyta dane z
src/data/culturesDataComplete.ts i wypisuje gotowe pliki statyczne.

Generuje:
  - public/kultury/baza.html       (pełna lista wszystkich kultur, pogrupowana wg typu)
  - public/kultury.summary.txt     (zwięzłe streszczenie wg zastosowania — karmi widget "Zapytaj AI")

UŻYCIE (z katalogu głównego repo):
  python scripts/gen-baza.py

Po wygenerowaniu wgraj zmienione pliki na serwer (FTP) — to czyste statyki,
NIE trzeba przebudowywać projektu (vite kopiuje public/ 1:1).

Uwaga o źródle danych: skrypt czyta culturesDataComplete.ts (plik w repo).
Jeśli kultury są zarządzane w Supabase, ten snapshot odzwierciedla plik .ts,
nie żywą bazę — odśwież .ts lub rozbuduj skrypt o pobieranie z Supabase.
"""
import re, html, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")
OUT_HTML = os.path.join(ROOT, "public", "kultury", "baza.html")
OUT_SUMMARY = os.path.join(ROOT, "public", "kultury.summary.txt")


def parse_cultures(src: str):
    blocks = re.split(r"\n  \{", src)

    def grab(b, key):
        m = re.search(key + r'\s*:\s*"(.*?)"', b, re.S)
        return re.sub(r"\s+", " ", m.group(1)).strip() if m else ""

    items = []
    for b in blocks:
        name, typ = grab(b, "name"), grab(b, "type")
        if not name or not typ:
            continue
        items.append(dict(
            name=name, comp=grab(b, "composition"), app=grab(b, "application"),
            temp=grab(b, "temperature"), type=typ, shop=grab(b, "shop"), price=grab(b, "price"),
        ))
    return items


# ---- 1) Pełna baza HTML (pogrupowana wg typu) ----------------------------------
TYPE_ORDER = ["mezofilne", "mezofilno-termofilne", "termofilne", "pleśniowe",
              "propionowe", "jogurtowe", "kefir", "probiotyczne", "aromatyzujące",
              "ochronne", "wege", "zestaw"]
TYPE_LABELS = {
    "mezofilne": "Kultury mezofilne", "mezofilno-termofilne": "Kultury mezofilno-termofilne",
    "termofilne": "Kultury termofilne", "pleśniowe": "Kultury pleśniowe",
    "propionowe": "Kultury propionowe (oczka/dziury)", "jogurtowe": "Kultury jogurtowe",
    "kefir": "Kultury kefirowe", "probiotyczne": "Kultury probiotyczne",
    "aromatyzujące": "Kultury aromatyzujące", "ochronne": "Kultury ochronne",
    "wege": "Kultury wegańskie / roślinne", "zestaw": "Zestawy startowe",
}


def gen_html(items):
    e = html.escape
    total = len(items)
    groups = {}
    for it in items:
        groups.setdefault(it["type"], []).append(it)
    ld = {
        "@context": "https://schema.org", "@type": "Dataset",
        "name": "Baza kultur bakteryjnych do produkcji sera",
        "description": f"Pełna baza {total} kultur bakteryjnych do produkcji domowych serów: skład, zastosowanie, temperatura pracy, typ, sklep i cena.",
        "url": "https://mojaserowarnia.pl/kultury/baza.html", "inLanguage": "pl",
        "keywords": ["kultury bakteryjne", "kultury mezofilne", "kultury termofilne", "serowarstwo", "bakterie do sera"],
        "creator": {"@type": "Organization", "name": "Moja Serowarnia", "url": "https://mojaserowarnia.pl/"},
    }
    o = []
    o.append('<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />')
    o.append(f"  <title>Baza kultur bakteryjnych do sera — pełna lista ({total} kultur)</title>")
    o.append(f'  <meta name="description" content="Pełna baza {total} kultur bakteryjnych do produkcji sera: nazwa, skład, zastosowanie, temperatura pracy, typ, sklep i cena. Mezofilne, termofilne, pleśniowe, propionowe i więcej." />')
    o.append('  <link rel="canonical" href="https://mojaserowarnia.pl/kultury/baza.html" />\n  <meta name="robots" content="index, follow" />')
    o.append(f'  <meta property="og:title" content="Baza kultur bakteryjnych do sera — pełna lista" />\n  <meta property="og:description" content="Pełna baza {total} kultur: skład, zastosowanie, temperatura, typ, sklep, cena." />\n  <meta property="og:type" content="website" />\n  <meta property="og:url" content="https://mojaserowarnia.pl/kultury/baza.html" />\n  <meta property="og:site_name" content="Moja Serowarnia" />\n  <meta property="og:locale" content="pl_PL" />\n  <meta property="og:image" content="https://mojaserowarnia.pl/og-image.png" />')
    o.append('  <script type="application/ld+json">\n' + json.dumps(ld, ensure_ascii=False, indent=2) + "\n  </script>")
    o.append('''  <style>
    :root { --brand:#b45309; --brand-dark:#92400e; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; --bg-soft:#fffbeb; }
    * { box-sizing:border-box; }
    body { max-width:1000px; margin:0 auto; padding:2rem 1.25rem 4rem; font:15px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:var(--ink); }
    h1 { font-size:1.85rem; color:var(--brand-dark); margin:0 0 .5rem; }
    h2 { font-size:1.2rem; margin-top:2.2rem; color:var(--brand-dark); border-bottom:2px solid var(--bg-soft); padding-bottom:.3rem; }
    .lead { font-size:1.03rem; color:var(--muted); }
    table { border-collapse:collapse; width:100%; margin:.8rem 0 1.5rem; font-size:.9rem; }
    th,td { border:1px solid var(--line); padding:.45rem .55rem; text-align:left; vertical-align:top; }
    th { background:var(--bg-soft); }
    td.name { font-weight:600; color:var(--brand-dark); }
    a { color:var(--brand); }
    nav.crumbs { font-size:.85rem; color:var(--muted); margin-bottom:1rem; }
    nav.crumbs a { color:var(--muted); }
    footer { margin-top:3rem; padding-top:1.2rem; border-top:1px solid var(--line); font-size:.85rem; color:var(--muted); }
  </style>
</head>
<body>
  <nav class="crumbs"><a href="https://mojaserowarnia.pl/">Moja Serowarnia</a> &rarr; <a href="https://mojaserowarnia.pl/kultury/">Kultury</a> &rarr; Pe&#322;na baza</nav>''')
    o.append(f"  <h1>Baza kultur bakteryjnych do sera — pełna lista ({total} kultur)</h1>")
    o.append(f'  <p class="lead">Kompletna lista {total} kultur bakteryjnych i pleśni używanych w serowarstwie: nazwa, skład, zastosowanie, temperatura pracy, sklep i cena. Wersja interaktywna z filtrami: <a href="https://mojaserowarnia.pl/baza-kultur">baza kultur w aplikacji</a>.</p>')
    for t in TYPE_ORDER + [k for k in groups if k not in TYPE_ORDER]:
        if t not in groups:
            continue
        rows = groups[t]
        o.append(f"  <h2>{e(TYPE_LABELS.get(t, t.capitalize()))} ({len(rows)})</h2>")
        o.append("  <table>\n    <thead><tr><th>Nazwa</th><th>Skład</th><th>Zastosowanie</th><th>Temperatura</th><th>Sklep</th><th>Cena</th></tr></thead>\n    <tbody>")
        for it in rows:
            o.append("      <tr><td class=\"name\">{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>".format(
                e(it["name"]), e(it["comp"]), e(it["app"]), e(it["temp"]), e(it["shop"]), e(it["price"])))
        o.append("    </tbody>\n  </table>")
    o.append('  <footer>Pełna, statyczna baza kultur (źródło dla wyszukiwarek i asystentów AI). Aktualne ceny i filtry w aplikacji <a href="https://mojaserowarnia.pl/baza-kultur">Moja Serowarnia</a>. Ceny mogą się zmieniać — weryfikuj u producenta.</footer>\n</body>\n</html>')
    return "\n".join(o)


# ---- 2) Streszczenie wg zastosowania (karmi widget "Zapytaj AI") -----------------
def has(s, *kw):
    s = s.lower()
    return any(k in s for k in kw)


def bucket_of(it):
    a, c, t = it["app"], it["comp"], it["type"]
    if has(c, "roqueforti") or has(a, "roquefort", "gorgonzola", "niebiesk", "stilton"):
        return "niebieskie"
    if has(c, "candidum", "camemberti") or has(a, "camembert", "brie"):
        return "biale"
    if t == "propionowe" or has(a, "dziur", "szwajcar", "emmental", "oczka"):
        return "propionowe"
    if has(a, "mozzarella", "mozarell", "pasta filata", "pizza") or (t == "termofilne" and not has(a, "twarde")):
        return "mozz_term"
    if has(a, "caciotta", "włosk", "wlosk", "fontal", "italico", "provolone", "scamorza"):
        return "caciotta_wl"
    if has(a, "gouda", "edam", "cheddar", "parmez", "twarde", "półtward", "poltward", "gruyere", "alpejsk", "tylżyck", "masdam"):
        return "twarde"
    if has(a, "twaróg", "twarog", "śwież", "swiez", "serek", "zsiadł", "ricotta", "feta", "śmietan", "mascarpone") or t in ("mezofilne", "mezofilno-termofilne"):
        return "swieze_twarog"
    if t in ("jogurtowe", "kefir", "probiotyczne"):
        return "jog_kef"
    return "inne"


SUMMARY_ORDER = ["swieze_twarog", "caciotta_wl", "mozz_term", "twarde", "biale", "niebieskie", "propionowe", "jog_kef", "inne"]
SUMMARY_TITLES = {
    "swieze_twarog": "KULTURY DO SERÓW ŚWIEŻYCH I TWAROGU",
    "caciotta_wl": "KULTURY DO CACIOTTA I SERÓW WŁOSKICH",
    "mozz_term": "KULTURY DO MOZZARELLI I SERÓW TERMOFILNYCH",
    "twarde": "KULTURY DO SERÓW TWARDYCH I PÓŁTWARDYCH",
    "biale": "KULTURY DO SERÓW PLEŚNIOWYCH (BIAŁE, Penicillium candidum)",
    "niebieskie": "KULTURY DO SERÓW PLEŚNIOWYCH (NIEBIESKIE, Penicillium roqueforti)",
    "propionowe": "KULTURY PROPIONOWE (DZIURY W SERZE)",
    "jog_kef": "KULTURY JOGURTOWE, KEFIROWE I PROBIOTYCZNE",
    "inne": "KULTURY POZOSTAŁE (ochronne, aromatyzujące, wege, zestawy)",
}


def gen_summary(items):
    seen, buckets = set(), {k: [] for k in SUMMARY_ORDER}
    for it in items:
        if it["name"] in seen:
            continue
        seen.add(it["name"])
        buckets[bucket_of(it)].append(it["name"])
    out = [f"BAZA KULTUR BAKTERYJNYCH — mojaserowarnia.pl ({len(seen)} pozycji)",
           "Streszczenie pogrupowane wg zastosowania. Pełna baza z dawkowaniem, ceną i dostępnością: https://mojaserowarnia.pl/baza-kultur", ""]
    for k in SUMMARY_ORDER:
        if buckets[k]:
            out.append(SUMMARY_TITLES[k] + ":")
            out.append(", ".join(buckets[k]))
            out.append("")
    return "\n".join(out).rstrip() + "\n"


def main():
    if not os.path.exists(SRC):
        sys.exit(f"Nie znaleziono {SRC}")
    items = parse_cultures(open(SRC, encoding="utf-8").read())
    os.makedirs(os.path.dirname(OUT_HTML), exist_ok=True)
    open(OUT_HTML, "w", encoding="utf-8").write(gen_html(items))
    open(OUT_SUMMARY, "w", encoding="utf-8").write(gen_summary(items))
    print(f"OK — {len(items)} kultur")
    print(f"  {os.path.relpath(OUT_HTML, ROOT)} ({os.path.getsize(OUT_HTML)} B)")
    print(f"  {os.path.relpath(OUT_SUMMARY, ROOT)} ({os.path.getsize(OUT_SUMMARY)} B)")
    print("Pamiętaj: wgraj oba pliki na serwer (FTP) — bez przebudowy projektu.")


if __name__ == "__main__":
    main()
