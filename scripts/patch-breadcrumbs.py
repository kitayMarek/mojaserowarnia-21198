#!/usr/bin/env python3
"""
Dodaje BreadcrumbList JSON-LD do statycznych mirrorów, które mają okruszki tylko
wizualnie (<nav class="crumbs">…</nav>) — a bez danych strukturalnych Google nie
liczy ich w raporcie "Menu nawigacyjne".

Ścieżkę okruszków wyprowadzamy 1:1 z widocznego <nav class="crumbs">:
  <a href="URL">Nazwa</a> &rarr; <a href="URL">Nazwa</a> &rarr; Bieżąca strona
Ostatni (bieżący) element bierze URL z <link rel="canonical">.

Idempotentne: pomija pliki, które już mają BreadcrumbList.
Uruchamiać po regeneracji mirrorów, jeśli generator sam nie dodaje breadcrumbów.
"""
import os, re, json, html, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")


def clean(txt):
    txt = re.sub(r"<[^>]+>", "", txt)          # usuń ewentualne tagi
    txt = html.unescape(txt)                     # &#322; -> ł, &rarr; -> →
    txt = txt.replace("→", "").replace("›", "").replace("»", "")
    return re.sub(r"\s+", " ", txt).strip()


def build_ld(content):
    m = re.search(r'<nav class="crumbs">(.*?)</nav>', content, re.S)
    if not m:
        return None
    inner = m.group(1)
    links = re.findall(r'<a href="([^"]+)"[^>]*>(.*?)</a>', inner, re.S)  # (url, name)
    items = [(clean(name), url) for url, name in links]

    # bieżąca strona = tekst po ostatnim </a>
    tail = inner.rsplit("</a>", 1)[-1] if "</a>" in inner else inner
    current = clean(tail)
    canon = re.search(r'<link rel="canonical" href="([^"]+)"', content)
    if current and canon:
        items.append((current, canon.group(1)))

    if len(items) < 2:
        return None
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": u}
            for i, (n, u) in enumerate(items)
        ],
    }


def patch(path):
    content = open(path, encoding="utf-8").read()
    if "BreadcrumbList" in content:
        return "ma już"
    if '<nav class="crumbs">' not in content or "</head>" not in content:
        return "brak crumbs/head"
    ld = build_ld(content)
    if not ld:
        return "nie sparsowano"
    snippet = (
        '  <script type="application/ld+json">\n'
        + json.dumps(ld, ensure_ascii=False, indent=2)
        + "\n  </script>\n</head>"
    )
    content = content.replace("</head>", snippet, 1)
    open(path, "w", encoding="utf-8").write(content)
    return f"dodano ({len(ld['itemListElement'])} poz.)"


def main():
    files = sorted(glob.glob(os.path.join(PUB, "**", "*.html"), recursive=True))
    added = 0
    for f in files:
        res = patch(f)
        rel = os.path.relpath(f, PUB)
        if res.startswith("dodano"):
            added += 1
            print(f"  + {rel} — {res}")
        elif res == "nie sparsowano":
            print(f"  ! {rel} — {res}")
    print(f"\nDodano BreadcrumbList do {added} plików.")


if __name__ == "__main__":
    main()
