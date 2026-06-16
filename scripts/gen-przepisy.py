#!/usr/bin/env python3
"""
Generator statycznych stron przepisów na sery (treść dla botów bez JS).
Czyta src/data/recipesData.ts i tworzy public/przepisy/<id>.html dla wskazanych serów.

Domyślnie generuje 14 serów, które nie mają jeszcze statycznej strony (6 pozostałych
napisano ręcznie i ich NIE rusza). UŻYCIE:  python scripts/gen-przepisy.py
Po wygenerowaniu wgraj pliki na serwer (FTP) — bez przebudowy.
"""
import re, html, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "data", "recipesData.ts")
OUTDIR = os.path.join(ROOT, "public", "przepisy")

# Sery do wygenerowania (te bez ręcznej statycznej strony)
TARGET_IDS = ["asiago", "brie", "camembert", "cheddar", "dunlop", "feta_bulgarische",
              "feta-grecka", "gorgonzola", "halloumi", "mascarpone", "parmezan",
              "roquefort", "stilton", "yorkshire"]

STR = r'"((?:\\.|[^"])*)"'


def unesc(s):
    return s.replace('\\"', '"').replace("\\n", " ").replace("\\t", " ").strip()


def grab(block, key):
    m = re.search(r'\b' + key + r':\s*' + STR, block)
    return unesc(m.group(1)) if m else ""


def grab_array(block, key):
    m = re.search(key + r':\s*\[(.*?)\n    \]', block, re.S)
    return m.group(1) if m else ""


def parse_recipes(src):
    recipes = {}
    for block in re.split(r'\n  \{\n', src):
        rid = grab(block, "id")
        if not rid:
            continue
        cult = grab_array(block, "cultureSubstitutes")
        cultures = [(unesc(n), unesc(t)) for n, t in re.findall(r'name:\s*' + STR + r'[^}]*?type:\s*' + STR, cult, re.S)]
        dos = grab_array(block, "dosageTable")
        dosage = [(unesc(i), unesc(a), unesc(nt)) for i, a, nt in
                  re.findall(r'ingredient:\s*' + STR + r',\s*amount:\s*' + STR + r',\s*notes:\s*' + STR, dos, re.S)]
        stp = grab_array(block, "steps")
        steps = [(unesc(ti), unesc(co)) for ti, co in
                 re.findall(r'title:\s*' + STR + r',\s*content:\s*' + STR, stp, re.S)]
        variants = [unesc(v) for v in re.findall(STR, grab_array(re.search(r'notes:\s*\{(.*?)\n    \}', block, re.S).group(1) if re.search(r'notes:\s*\{(.*?)\n    \}', block, re.S) else "", "variants"))]
        nut = {}
        for k in ["calories", "proteinContent", "fatContent", "calciumContent"]:
            mm = re.search(k + r':\s*(\d+)', block)
            if mm:
                nut[k] = mm.group(1)
        recipes[rid] = dict(id=rid, name=grab(block, "name"), difficulty=grab(block, "difficulty"),
                            description=grab(block, "description"), yield_=grab(block, "yield"),
                            ageTime=grab(block, "ageTime"), milkBase=grab(block, "milkBase"),
                            starter=grab(block, "starter"), coagulant=grab(block, "coagulant"),
                            aging=grab(block, "aging"), cultures=cultures, dosage=dosage,
                            steps=steps, variants=variants, nut=nut)
    return recipes


CSS = '''  <style>
    :root { --brand:#b45309; --brand-dark:#92400e; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; --bg-soft:#fffbeb; }
    * { box-sizing:border-box; }
    body { max-width:780px; margin:0 auto; padding:2rem 1.25rem 4rem; font:16px/1.7 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:var(--ink); }
    h1 { font-size:1.85rem; line-height:1.25; color:var(--brand-dark); margin:0 0 .5rem; }
    h2 { font-size:1.25rem; margin-top:2.25rem; color:var(--brand-dark); border-bottom:2px solid var(--bg-soft); padding-bottom:.3rem; }
    h3 { font-size:1.05rem; margin-top:1.5rem; }
    p,li { color:var(--ink); }
    a { color:var(--brand); }
    .lead { font-size:1.05rem; color:var(--muted); }
    table { border-collapse:collapse; width:100%; margin:1rem 0; font-size:.95rem; }
    th,td { border:1px solid var(--line); padding:.55rem .7rem; text-align:left; }
    th { background:var(--bg-soft); }
    ol li { margin-bottom:.6rem; }
    .cta { display:inline-block; margin-top:1.5rem; padding:.7rem 1.2rem; background:var(--brand); color:#fff; border-radius:.6rem; text-decoration:none; font-weight:600; }
    .related { background:var(--bg-soft); border:1px solid #fde68a; border-radius:.7rem; padding:1rem 1.2rem; margin-top:2.5rem; }
    .related h2 { margin-top:0; border:0; }
    footer { margin-top:3rem; padding-top:1.2rem; border-top:1px solid var(--line); font-size:.85rem; color:var(--muted); }
    nav.crumbs { font-size:.85rem; color:var(--muted); margin-bottom:1.2rem; }
    nav.crumbs a { color:var(--muted); }
  </style>'''


def gen_page(r, siblings):
    e = html.escape
    n = e(r["name"])
    url = f"https://mojaserowarnia.pl/przepisy/{r['id']}.html"
    cult_names = [c[0] for c in r["cultures"] if c[0]]
    faq_cult = ("Do " + n + " stosuje się: " + ", ".join(cult_names[:5]) + ".") if cult_names else (r["starter"] or f"Patrz sekcja o kulturach dla {n}.")
    faq = [
        (f"Jakie kultury do {r['name']}?", faq_cult),
        (f"Ile podpuszczki do {r['name']}?", r["coagulant"] or "Patrz tabela składników."),
        (f"Jak długo dojrzewa {r['name']}?", (r["ageTime"] + (". " + r["aging"] if r["aging"] else "")) if r["ageTime"] else (r["aging"] or "Patrz instrukcja.")),
    ]
    ingredients = ([r["milkBase"]] if r["milkBase"] else []) + [f"{d[0]} — {d[1]}" for d in r["dosage"]]
    recipe_ld = {
        "@context": "https://schema.org", "@type": "Recipe", "name": r["name"],
        "description": r["description"], "image": "https://mojaserowarnia.pl/og-image.png",
        "recipeCategory": "Ser", "recipeYield": r["yield_"], "keywords": f"{r['name']}, ser domowy, przepis",
        "recipeIngredient": ingredients,
        "recipeInstructions": [{"@type": "HowToStep", "name": s[0], "text": s[1]} for s in r["steps"]],
    }
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage",
              "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}

    o = []
    o.append('<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />')
    o.append(f"  <title>{n} — przepis na ser domowy krok po kroku</title>")
    desc = (r["description"][:155] + "…") if len(r["description"]) > 156 else r["description"]
    o.append(f'  <meta name="description" content="{e(desc)}" />')
    o.append(f'  <link rel="canonical" href="{url}" />\n  <meta name="robots" content="index, follow" />')
    o.append(f'  <meta property="og:title" content="{n} — przepis na ser domowy" />\n  <meta property="og:description" content="{e(desc)}" />\n  <meta property="og:type" content="article" />\n  <meta property="og:url" content="{url}" />\n  <meta property="og:site_name" content="Moja Serowarnia" />\n  <meta property="og:locale" content="pl_PL" />\n  <meta property="og:image" content="https://mojaserowarnia.pl/og-image.png" />')
    o.append('  <script type="application/ld+json">\n' + json.dumps(recipe_ld, ensure_ascii=False, indent=2) + "\n  </script>")
    o.append('  <script type="application/ld+json">\n' + json.dumps(faq_ld, ensure_ascii=False, indent=2) + "\n  </script>")
    o.append(CSS)
    o.append("</head>\n<body>")
    o.append(f'  <nav class="crumbs"><a href="https://mojaserowarnia.pl/">Moja Serowarnia</a> &rarr; <a href="https://mojaserowarnia.pl/przepisy/przewodnik.html">Przepisy na sery</a> &rarr; {n}</nav>')
    o.append(f"  <h1>{n} — przepis na ser domowy krok po kroku</h1>")
    o.append(f'  <p class="lead">{e(r["description"])}</p>')
    if r["difficulty"] or r["yield_"] or r["ageTime"]:
        o.append("  <p>")
        bits = []
        if r["difficulty"]:
            bits.append(f"<strong>Trudność:</strong> {e(r['difficulty'])}")
        if r["yield_"]:
            bits.append(f"<strong>Wydajność:</strong> {e(r['yield_'])}")
        if r["ageTime"]:
            bits.append(f"<strong>Dojrzewanie:</strong> {e(r['ageTime'])}")
        o.append(" &nbsp;·&nbsp; ".join(bits))
        o.append("  </p>")
    if ingredients:
        o.append("  <h2>Składniki</h2>\n  <ul>")
        for ing in ingredients:
            o.append(f"    <li>{e(ing)}</li>")
        o.append("  </ul>")
    if cult_names:
        o.append(f"  <h2>Jakie kultury do {n}?</h2>\n  <ul>")
        for nm, tp in r["cultures"]:
            o.append(f"    <li><strong>{e(nm)}</strong>{(' — ' + e(tp)) if tp else ''}</li>")
        o.append("  </ul>")
        o.append('  <p>Porównanie i dostępność: <a href="https://mojaserowarnia.pl/kultury/">przewodnik o kulturach</a> i <a href="https://mojaserowarnia.pl/baza-kultur">baza kultur</a>.</p>')
    if r["steps"]:
        o.append("  <h2>Przygotowanie krok po kroku</h2>\n  <ol>")
        for ti, co in r["steps"]:
            o.append(f"    <li><strong>{e(ti)}</strong> {e(co)}</li>")
        o.append("  </ol>")
    if r["variants"]:
        o.append("  <h2>Warianty</h2>\n  <ul>")
        for v in r["variants"]:
            o.append(f"    <li>{e(v)}</li>")
        o.append("  </ul>")
    if r["nut"]:
        o.append(f'  <h2>Wartości odżywcze (100 g)</h2>\n  <p>Kalorie: {r["nut"].get("calories","–")} kcal · Białko: {r["nut"].get("proteinContent","–")} g · Tłuszcz: {r["nut"].get("fatContent","–")} g · Wapń: {r["nut"].get("calciumContent","–")} mg</p>')
    o.append("  <h2>Najczęstsze pytania (FAQ)</h2>")
    for q, a in faq:
        o.append(f"  <h3>{e(q)}</h3>\n  <p>{e(a)}</p>")
    o.append('  <a class="cta" href="https://mojaserowarnia.pl/przepisy">Zobacz pełny przepis w aplikacji →</a>')
    o.append('  <div class="related">\n    <h2>Powiązane strony</h2>\n    <ul>')
    o.append('      <li><a href="https://mojaserowarnia.pl/przepisy/przewodnik.html">Przepisy na sery domowe — przewodnik</a></li>')
    for sid, sname in siblings[:3]:
        o.append(f'      <li><a href="https://mojaserowarnia.pl/przepisy/{sid}.html">{e(sname)} — przepis</a></li>')
    o.append('      <li><a href="https://mojaserowarnia.pl/kultury/">Kultury bakteryjne do serów</a></li>')
    o.append("    </ul>\n  </div>")
    o.append(f'  <footer>Statyczna strona informacyjna z przepisem na {n}. Interaktywna wersja dostępna jest w aplikacji <a href="https://mojaserowarnia.pl/przepisy">Moja Serowarnia</a>.</footer>\n</body>\n</html>')
    return "\n".join(o)


def main():
    recipes = parse_recipes(open(SRC, encoding="utf-8").read())
    os.makedirs(OUTDIR, exist_ok=True)
    done = []
    targets = [i for i in TARGET_IDS if i in recipes]
    for rid in targets:
        r = recipes[rid]
        sibs = [(s, recipes[s]["name"]) for s in targets if s != rid]
        open(os.path.join(OUTDIR, f"{rid}.html"), "w", encoding="utf-8").write(gen_page(r, sibs))
        done.append((rid, len(r["steps"]), len(r["cultures"])))
    miss = [i for i in TARGET_IDS if i not in recipes]
    print(f"Wygenerowano {len(done)} przepisów:")
    for rid, ns, nc in done:
        print(f"  {rid}.html — kroków:{ns} kultur:{nc}")
    if miss:
        print("NIE ZNALEZIONO w danych:", miss)


if __name__ == "__main__":
    main()
