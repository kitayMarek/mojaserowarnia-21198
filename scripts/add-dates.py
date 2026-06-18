#!/usr/bin/env python3
"""
Wstrzykuje datePublished + dateModified do JSON-LD statycznych stron (post-processor).

Sygnał świeżości dla modeli LLM (Perplexity, ChatGPT, Google AI Overviews preferują
świeże treści). Dodaje pola do GŁÓWNEGO bloku treści (Article/Recipe/Dataset) —
nie rusza FAQPage/HowToStep/Organization/Question.

- datePublished = data dodania pliku do gita (per strona, nie zmyślona)
- dateModified  = DZIŚ (stała poniżej)

Idempotentny: pomija pliki, które już mają datePublished.
UWAGA: strony generowane (przepisy/*, kultury/baza.html) — po regeneracji odpal
ponownie: python scripts/add-dates.py  (oraz scripts/link-slownik.py dla linków).

UŻYCIE:
  python scripts/add-dates.py            # PODGLĄD
  python scripts/add-dates.py --apply    # zapis
"""
import re, os, sys, glob, json, subprocess
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
DATE_MODIFIED = "2026-06-18"  # spójne z Fermly i bieżącą datą

# wstaw po linii @type głównego typu treści (z zachowaniem wcięcia)
TYPE_RE = re.compile(r'^([ \t]*)("@type":\s*"(?:Article|Recipe|Dataset)",)', re.M)


def git_add_date(relpath):
    try:
        out = subprocess.run(["git", "log", "--diff-filter=A", "--format=%as", "-1", "--", relpath],
                             capture_output=True, text=True, cwd=ROOT).stdout.strip()
        return out.splitlines()[0] if out else DATE_MODIFIED
    except Exception:
        return DATE_MODIFIED


def jsonld_blocks(html):
    return re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)


def main():
    apply = "--apply" in sys.argv
    targets = sorted(set(
        glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True)
    ))
    changed = 0
    for path in targets:
        html = open(path, encoding="utf-8").read()
        if '"@type": "Article"' not in html and '"@type": "Recipe"' not in html and '"@type": "Dataset"' not in html:
            continue
        if "datePublished" in html:  # już zrobione — idempotencja
            continue
        rel = os.path.relpath(path, ROOT).replace("\\", "/")
        pub = git_add_date(rel)

        def repl(m):
            ind = m.group(1)
            return f'{m.group(1)}{m.group(2)}\n{ind}"datePublished": "{pub}",\n{ind}"dateModified": "{DATE_MODIFIED}",'

        new = TYPE_RE.sub(repl, html, count=1)
        if new == html:
            print(f"  [POMIN] brak dopasowania @type: {rel}")
            continue
        # walidacja: każdy blok JSON-LD musi się parsować
        ok = True
        for blk in jsonld_blocks(new):
            try:
                json.loads(blk)
            except Exception as ex:
                ok = False
                print(f"  [BŁĄD JSON] {rel}: {ex}")
        if not ok:
            continue
        print(f"  {os.path.relpath(path, PUB)}  pub={pub}  mod={DATE_MODIFIED}")
        changed += 1
        if apply:
            open(path, "w", encoding="utf-8").write(new)
    print(f"\n{'ZAPISANO' if apply else 'PODGLĄD'} — {changed} stron")


if __name__ == "__main__":
    main()
