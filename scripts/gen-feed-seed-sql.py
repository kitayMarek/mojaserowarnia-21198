# -*- coding: utf-8 -*-
"""
Generuje seed 124 składników bazowych do Supabase (feed_ingredients) z src/data/feedIngredients.ts.
Dodaje kolumnę `source` (baza|user), czyści poprzedni seed 'baza' (idempotentne) i wstawia bazę
jako status='approved', source='baza'. UŻYCIE: python scripts/gen-feed-seed-sql.py
"""
import re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TS   = os.path.join(ROOT, "src", "data", "feedIngredients.ts")
OUT  = os.path.join(ROOT, "scripts", "sql", "feed-seed.sql")

FIELDS = ["em","bialko","ca","p","wlokno","na","k","mg","mn","zn","se","fe","i"]

def q(s): return "'" + s.replace("'", "''") + "'"

def main():
    ts = open(TS, encoding="utf-8").read()
    pat = (r'\{\s*nazwa:\s*"((?:[^"\\]|\\.)*)",\s*kategoria:\s*"((?:[^"\\]|\\.)*)",\s*'
           + r",\s*".join(f"{f}:\\s*([-\\d.]+)" for f in FIELDS) + r"\s*\}")
    rows = re.findall(pat, ts)
    if not rows:
        print("BŁĄD: nie sparsowano składników"); return

    lines = [
        "-- Seed bazy wzorcowej 124 surowców do Supabase (źródło prawdy dla kalkulatora).",
        "-- Wygenerowane: scripts/gen-feed-seed-sql.py. Idempotentne (czyści poprzedni seed 'baza').",
        "",
        "alter table public.feed_ingredients add column if not exists source text not null default 'user';",
        "",
        "delete from public.feed_ingredients where source = 'baza';",
        "",
        "insert into public.feed_ingredients",
        "  (nazwa, kategoria, " + ", ".join(FIELDS) + ", status, source) values",
    ]
    vals = []
    for r in rows:
        nazwa, kat = r[0], r[1]
        nums = ", ".join(r[2:])
        vals.append(f"  ({q(nazwa)}, {q(kat)}, {nums}, 'approved', 'baza')")
    lines.append(",\n".join(vals) + ";")
    lines.append("")
    open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
    print(f"OK — {len(rows)} surowców → {os.path.relpath(OUT, ROOT)}")

if __name__ == "__main__":
    main()
