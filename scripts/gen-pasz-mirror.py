# -*- coding: utf-8 -*-
"""
Odświeża sekcję „Wartość pokarmowa surowców" w statycznym mirrorze
public/kalkulator-pasz.html na podstawie src/data/feedIngredients.ts (124 składniki,
pogrupowane po kategoriach). Podbija też dateModified. UŻYCIE: python scripts/gen-pasz-mirror.py
"""
import re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TS   = os.path.join(ROOT, "src", "data", "feedIngredients.ts")
HTML = os.path.join(ROOT, "public", "kalkulator-pasz.html")
DATE = "2026-07-06"

def fmt(v):
    try:
        f = float(v)
    except Exception:
        return "—"
    if f == 0:
        return "—"
    return ("%g" % f).replace(".", ",")

def main():
    ts = open(TS, encoding="utf-8").read()
    # kolejność kategorii
    m = re.search(r"feedCategories:\s*string\[\]\s*=\s*\[(.*?)\];", ts, re.S)
    cats = re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1)) if m else []
    # składniki
    rows = re.findall(
        r'\{\s*nazwa:\s*"((?:[^"\\]|\\.)*)",\s*kategoria:\s*"((?:[^"\\]|\\.)*)",\s*'
        r'em:\s*([-\d.]+),\s*bialko:\s*([-\d.]+),\s*ca:\s*([-\d.]+),\s*p:\s*([-\d.]+),\s*wlokno:\s*([-\d.]+),',
        ts)
    by_cat = {}
    for nazwa, kat, em, bialko, ca, p, wlokno in rows:
        by_cat.setdefault(kat, []).append((nazwa, em, bialko, ca, p, wlokno))
    ordered = cats + [c for c in by_cat if c not in cats]

    parts = [
        '<h2>Wartość pokarmowa surowców paszowych (na 1 kg)</h2>',
        f'<p class="lead">Baza {len(rows)} surowców pogrupowanych po rodzaju. Kolumny: '
        'EM — energia metaboliczna (MJ/kg), pozostałe w %. Wartości orientacyjne (sucha masa) — '
        'zawsze weryfikuj z kartą/etykietą produktu.</p>',
    ]
    for cat in ordered:
        items = by_cat.get(cat)
        if not items:
            continue
        parts.append(f"<h3>{cat}</h3>")
        parts.append('<table><thead><tr><th>Surowiec</th><th class="n">EM</th><th class="n">Białko</th>'
                     '<th class="n">Ca</th><th class="n">P</th><th class="n">Włókno</th></tr></thead><tbody>')
        for nazwa, em, bialko, ca, p, wlokno in items:
            parts.append(
                f'<tr><td>{nazwa}</td><td class="n">{fmt(em)}</td><td class="n">{fmt(bialko)}</td>'
                f'<td class="n">{fmt(ca)}</td><td class="n">{fmt(p)}</td><td class="n">{fmt(wlokno)}</td></tr>')
        parts.append('</tbody></table>')
    new_section = "\n  ".join(parts)

    html = open(HTML, encoding="utf-8").read()
    # podmień sekcję między nagłówkiem "Wartość pokarmowa..." a następnym <h2>
    html2, n = re.subn(
        r'<h2>Wartość pokarmowa surowców paszowych.*?</table>\s*(?=<h2>Jak zbilansować)',
        new_section + "\n\n  ",
        html, count=1, flags=re.S)
    if n != 1:
        print("BŁĄD: nie znaleziono sekcji do podmiany"); return
    html2 = re.sub(r'"dateModified":\s*"[^"]*"', f'"dateModified": "{DATE}"', html2)
    open(HTML, "w", encoding="utf-8", newline="\n").write(html2)
    print(f"OK — wstawiono {len(rows)} surowców w {len(ordered)} kategoriach. dateModified={DATE}")

if __name__ == "__main__":
    main()
