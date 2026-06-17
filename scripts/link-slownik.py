#!/usr/bin/env python3
"""
Podlinkowanie terminów słownikowych na statycznych stronach (post-processor).

Wstawia dyskretne linki (klasa .glo, nowa karta) z PIERWSZEGO wystąpienia
wybranych terminów do konkretnej definicji w słowniku (deep-link przez kotwicę).
Obsługuje polską odmianę (stem), pomija tagi/nagłówki/istniejące linki/skrypty,
nie samolinkuje (na stronie o danym terminie go nie linkuje), limit na stronę.

UŻYCIE:
  python scripts/link-slownik.py            # PODGLĄD (dry-run) — nic nie zapisuje
  python scripts/link-slownik.py --apply    # zapisuje zmiany w plikach

Uwaga: strony przepisów i baza.html są GENEROWANE (gen-przepisy.py / gen-baza.py).
Workflow przy regeneracji: najpierw generator, potem ten linker, potem deploy.
Skrypt jest idempotentny — nie podlinkuje tekstu, który już jest w <a>.
"""
import re, os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
MAX_LINKS = 6
BASE = "https://mojaserowarnia.pl/slownik.html#"

# (regex inflekcyjny, kotwica)  — kolejność = priorytet. \w obejmuje polskie znaki.
TERMS = [
    (r'podpuszczk\w*', 'podpuszczka'),
    (r'chymozyn\w*', 'chymozyna'),
    (r'mezofiln\w*', 'kultury-mezofilne'),
    (r'termofiln\w*', 'kultury-termofilne'),
    (r'propionow\w*', 'bakterie-propionowe'),
    (r'koagulacj\w*', 'koagulacja'),
    (r'skrzep\w*', 'skrzep'),
    (r'serwatk\w*', 'serwatka'),
    (r'solank\w*', 'solanka'),
    (r'flokulacj\w*', 'flokulacja'),
    (r'pasteryzacj\w*', 'pasteryzacja'),
    (r'lipaz\w*', 'lipaza'),
    (r'liofiliz\w*', 'liofilizat'),
    (r'kwasowoś\w*', 'kwasowosc'),
    (r'wilgotnoś\w*', 'wilgotnosc'),
    (r'dojrzewani\w*', 'dojrzewanie'),
    (r'cheddaring', 'cheddaring'),
    (r'pasta filata', 'ciagniecie-ciasta'),
    (r'brevibacterium', 'brevibacterium-linens'),
    (r'pleśni\w* szlachetn\w*', 'plesn-szlachetna'),
]
# akronimy — case-sensitive (żeby nie łapać "mol" w "molo" itp.)
ACR = [(r'\bIMCU\b', 'imcu'), (r'\bRHD\b', 'rhd'), (r'\bMOL\b', 'mol')]

COMPILED = [(re.compile(p, re.I | re.U), a) for p, a in TERMS] + [(re.compile(p), a) for p, a in ACR]

SKIP_TAGS = {'a', 'script', 'style', 'h1', 'h2', 'h3', 'noscript', 'title', 'code', 'head'}
TAG_RE = re.compile(r'(<[^>]+>)')
NAME_RE = re.compile(r'</?\s*([a-zA-Z0-9]+)')


def link_segment(text, used, skip, remaining):
    """Linkuje kolejne, najwcześniejsze, nieużyte dotąd terminy w tekście."""
    out, i = [], 0
    while remaining[0] > 0:
        best = None
        for rx, anchor in COMPILED:
            if anchor in used or anchor in skip:
                continue
            m = rx.search(text, i)
            if m and (best is None or m.start() < best.start()):
                best, best_anchor = m, anchor
        if not best:
            break
        s, e = best.span()
        matched = text[s:e]
        out.append(text[i:s])
        out.append(f'<a class="glo" href="{BASE}{best_anchor}" target="_blank" rel="noopener noreferrer">{matched}</a>')
        used.add(best_anchor)
        remaining[0] -= 1
        i = e
    out.append(text[i:])
    return ''.join(out), [a for a in used]


def process(html, skip):
    tokens = TAG_RE.split(html)
    stack, used, remaining = [], set(), [MAX_LINKS]
    chosen = []
    out = []
    for tok in tokens:
        if tok.startswith('<'):
            m = NAME_RE.match(tok)
            name = m.group(1).lower() if m else ''
            if tok.startswith('</'):
                if stack and stack[-1] == name:
                    stack.pop()
            elif not tok.endswith('/>') and name in SKIP_TAGS:
                stack.append(name)
            out.append(tok)
        else:
            if stack or remaining[0] <= 0 or not tok.strip():
                out.append(tok)
            else:
                before = set(used)
                seg, _ = link_segment(tok, used, skip, remaining)
                chosen += [a for a in used if a not in before]
                out.append(seg)
    return ''.join(out), chosen


def ensure_css(html):
    if 'a.glo' in html:
        return html
    css = '\n    a.glo { color: inherit; text-decoration: none; border-bottom: 1px dotted var(--brand); }\n    a.glo:hover { color: var(--brand); border-bottom-style: solid; }'
    if re.search(r'a\s*\{\s*color:\s*var\(--brand\);\s*\}', html):
        return re.sub(r'(a\s*\{\s*color:\s*var\(--brand\);\s*\})', r'\1' + css, html, count=1)
    return html.replace('</style>', css + '\n  </style>', 1)


def skip_for(path):
    """Nie samolinkuj — pomiń kotwice, których słowo jest w nazwie pliku."""
    base = os.path.basename(path).replace('.html', '')
    skip = set()
    for _, anchor in TERMS + ACR:
        key = anchor.split('-')[-1]
        if key in base or base in anchor:
            skip.add(anchor)
    if 'mezofilne' in base: skip.add('kultury-mezofilne')
    if 'termofilne' in base: skip.add('kultury-termofilne')
    if 'przewodnik' in path and 'prawo' in path: skip.update({'rhd', 'mol'})
    return skip


def main():
    apply = '--apply' in sys.argv
    targets = glob.glob(os.path.join(PUB, '*.html'))  # strony w katalogu glownym (np. poradnik.html)
    for d in ['przepisy', 'kultury', 'prawo', 'wege']:
        targets += glob.glob(os.path.join(PUB, d, '**', '*.html'), recursive=True)
    EXCLUDE = {'slownik.html', 'baza.html'}
    targets = [t for t in sorted(targets)
               if os.path.basename(t) not in EXCLUDE
               and not (t.endswith(os.path.join('kultury', 'index.html')))]  # pilot już zrobiony

    total = 0
    for path in targets:
        html = open(path, encoding='utf-8').read()
        if 'class="glo"' in html:  # juz podlinkowane — pomijamy (idempotencja, brak duplikatow)
            continue
        new, chosen = process(html, skip_for(path))
        if chosen:
            new = ensure_css(new)
            rel = os.path.relpath(path, PUB)
            print(f"{rel}: {len(chosen)} -> {', '.join(chosen)}")
            total += len(chosen)
            if apply:
                open(path, 'w', encoding='utf-8').write(new)
    print(f"\n{'ZAPISANO' if apply else 'PODGLĄD'} — łącznie {total} linków na {len(targets)} stronach")


if __name__ == '__main__':
    main()
