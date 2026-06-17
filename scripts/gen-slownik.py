#!/usr/bin/env python3
"""
Generator statycznej strony słownika serowarskiego (treść dla botów bez JS).
Czyta terminy z src/pages/Slownik.tsx i wypisuje public/slownik.html.

Każdy termin ma kotwicę (id) i URL w schema DefinedTerm — dzięki temu
wyszukiwarki / asystenci AI mogą deep-linkować do konkretnej definicji
(np. /slownik.html#skrzep), co sprzyja cytowaniu w AI Overviews.

UŻYCIE:  python scripts/gen-slownik.py
Po wygenerowaniu wgraj public/slownik.html na serwer (FTP) — bez przebudowy.
"""
import re, html, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "pages", "Slownik.tsx")
OUT = os.path.join(ROOT, "public", "slownik.html")
BASE = "https://mojaserowarnia.pl/slownik.html"

CAT_ORDER = ["Podstawy", "Proces", "Typy", "Kultury", "Parametry", "Sprzęt", "Prawo"]
_DIAC = {"ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n", "ó": "o", "ś": "s", "ź": "z", "ż": "z"}


def slug(s):
    s = s.lower()
    for k, v in _DIAC.items():
        s = s.replace(k, v)
    s = re.sub(r"\([^)]*\)", "", s)          # usuń treść w nawiasach, np. (CaCl₂)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "termin"


def parse_terms(src):
    terms = []
    for m in re.finditer(r'\{\s*pl:\s*"(.*?)",\s*en:\s*"(.*?)",\s*definition:\s*"(.*?)",\s*category:\s*"(.*?)"', src, re.S):
        terms.append(dict(pl=m.group(1), en=m.group(2), definition=m.group(3), category=m.group(4)))
    # unikalne kotwice
    seen = {}
    for t in terms:
        s = slug(t["pl"])
        if s in seen:
            seen[s] += 1
            s = f"{s}-{seen[s]}"
        else:
            seen[s] = 1
        t["slug"] = s
    return terms


def main():
    src = open(SRC, encoding="utf-8").read()
    terms = parse_terms(src)
    e = html.escape
    total = len(terms)
    groups = {}
    for t in terms:
        groups.setdefault(t["category"], []).append(t)
    cats = [c for c in CAT_ORDER if c in groups] + [c for c in groups if c not in CAT_ORDER]

    ld = {
        "@context": "https://schema.org", "@type": "DefinedTermSet",
        "name": "Słownik serowarski (polsko-angielski)",
        "description": f"Słownik {total} terminów serowarskich z definicjami, polski i angielski.",
        "url": BASE, "inLanguage": "pl",
        "hasDefinedTerm": [
            {"@type": "DefinedTerm", "name": t["pl"], "alternateName": t["en"],
             "description": t["definition"], "url": f"{BASE}#{t['slug']}"} for t in terms
        ],
    }

    o = []
    o.append('<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />')
    o.append(f"  <title>Słownik serowarski — {total} terminów PL/EN z definicjami</title>")
    o.append(f'  <meta name="description" content="Słownik serowarski: {total} terminów po polsku i angielsku z definicjami — podstawy, proces produkcji, typy serów, kultury, parametry, sprzęt i prawo." />')
    o.append(f'  <link rel="canonical" href="{BASE}" />\n  <meta name="robots" content="index, follow" />')
    o.append('  <meta property="og:title" content="Słownik serowarski — terminy PL/EN" />\n  <meta property="og:description" content="Dwujęzyczny słownik terminów serowarskich z definicjami." />\n  <meta property="og:type" content="website" />\n  <meta property="og:url" content="' + BASE + '" />\n  <meta property="og:site_name" content="Moja Serowarnia" />\n  <meta property="og:locale" content="pl_PL" />\n  <meta property="og:image" content="https://mojaserowarnia.pl/og-image.png" />')
    o.append('  <script type="application/ld+json">\n' + json.dumps(ld, ensure_ascii=False, indent=2) + "\n  </script>")
    o.append('''  <style>
    :root { --brand:#b45309; --brand-dark:#92400e; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; --bg-soft:#fffbeb; }
    * { box-sizing:border-box; }
    body { max-width:860px; margin:0 auto; padding:2rem 1.25rem 4rem; font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:var(--ink); }
    h1 { font-size:1.85rem; color:var(--brand-dark); margin:0 0 .5rem; }
    h2 { font-size:1.2rem; margin-top:2.2rem; color:var(--brand-dark); border-bottom:2px solid var(--bg-soft); padding-bottom:.3rem; scroll-margin-top:1rem; }
    .lead { font-size:1.03rem; color:var(--muted); }
    .toc { background:var(--bg-soft); border:1px solid #fde68a; border-radius:.6rem; padding:.7rem 1rem; font-size:.95rem; }
    .toc a { margin-right:.6rem; white-space:nowrap; }
    dl { margin:1rem 0; }
    dt { font-weight:600; color:var(--brand-dark); margin-top:.9rem; scroll-margin-top:1rem; }
    dt .en { color:var(--muted); font-weight:400; font-style:italic; }
    dd { margin:.15rem 0 0; }
    a { color:var(--brand); }
    nav.crumbs { font-size:.85rem; color:var(--muted); margin-bottom:1rem; }
    nav.crumbs a { color:var(--muted); }
    footer { margin-top:3rem; padding-top:1.2rem; border-top:1px solid var(--line); font-size:.85rem; color:var(--muted); }
  </style>
</head>
<body>
  <nav class="crumbs"><a href="https://mojaserowarnia.pl/">Moja Serowarnia</a> &rarr; S&#322;ownik</nav>''')
    o.append(f"  <h1>Słownik serowarski — {total} terminów (polsko-angielski)</h1>")
    o.append(f'  <p class="lead">Dwujęzyczny słownik {total} terminów serowarskich z definicjami. Wersja interaktywna z wyszukiwarką: <a href="https://mojaserowarnia.pl/slownik">słownik w aplikacji</a>.</p>')
    # spis kategorii (deep-link)
    toc = " · ".join(f'<a href="#cat-{slug(c)}">{e(c)}</a>' for c in cats)
    o.append(f'  <p class="toc">{toc}</p>')
    for cat in cats:
        rows = groups[cat]
        o.append(f'  <h2 id="cat-{slug(cat)}">{e(cat)} ({len(rows)})</h2>')
        o.append("  <dl>")
        for t in rows:
            o.append(f'    <dt id="{t["slug"]}">{e(t["pl"])} <span class="en">({e(t["en"])})</span></dt><dd>{e(t["definition"])}</dd>')
        o.append("  </dl>")
    o.append('  <footer>Statyczny słownik serowarski (źródło dla wyszukiwarek i asystentów AI). Wersja interaktywna: <a href="https://mojaserowarnia.pl/slownik">Moja Serowarnia</a>.</footer>\n</body>\n</html>')
    open(OUT, "w", encoding="utf-8").write("\n".join(o))
    print(f"OK — {total} terminów, {len(groups)} kategorii, kotwice per termin -> {os.path.relpath(OUT, ROOT)} ({os.path.getsize(OUT)} B)")


if __name__ == "__main__":
    main()
