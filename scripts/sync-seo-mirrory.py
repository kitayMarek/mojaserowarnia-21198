#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wyrownuje tytul i opis w RECZNIE pisanych mirrorach przepisow do wartosci
`seoTitle` / `seoDescription` z src/data/recipesData.ts.

PO CO TO ISTNIEJE: szesc przepisow (caciotta, gouda, gruyere, emmental, ricotta,
mozzarella) ma mirrory pisane recznie, bo maja bogatsza tresc niz szablon —
gen-przepisy.py celowo ich nie nadpisuje. Skutek uboczny byl taki, ze ich dopracowane
tytuly SEO istnialy WYLACZNIE w tych plikach, a trasa React — czyli ta, ktora zbiera
wyswietlenia w Google — dostawala szablon i pierwsze 160 znakow ogolnego opisu.
Teraz zrodlem jest recipesData, a ten skrypt tylko dosyla wartosci do mirrora.

CHIRURGICZNIE: rusza wylacznie <title>, meta description oraz odpowiedniki og:
i twitter:. Widoczna tresc strony zostaje nietknieta. Przepisy bez seoTitle sa
pomijane, wiec uruchomienie niczego nie psuje.

Uruchom:  python scripts/sync-seo-mirrory.py            (podglad)
          python scripts/sync-seo-mirrory.py --zapisz
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "data", "recipesData.ts")
PUB = os.path.join(ROOT, "public", "przepisy")

STR = r'"((?:[^"\\]|\\.)*)"'


def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def wczytaj_seo():
    """{id: (seoTitle, seoDescription)} — tylko przepisy, ktore maja oba pola."""
    tresc = io.open(SRC, encoding="utf-8").read()
    wynik = {}
    for blok in re.split(r"\n  \{\n", tresc)[1:]:
        rid = re.search(r'id:\s*' + STR, blok)
        tyt = re.search(r'seoTitle:\s*' + STR, blok)
        opis = re.search(r'seoDescription:\s*' + STR, blok)
        if rid and tyt and opis:
            wynik[rid.group(1)] = (tyt.group(1), opis.group(1))
    return wynik


PODMIANY = [
    (r"(<title>)(.*?)(</title>)", "tytul"),
    (r'(<meta\s+name="description"\s+content=")(.*?)(")', "opis"),
    (r'(<meta\s+property="og:title"\s+content=")(.*?)(")', "tytul"),
    (r'(<meta\s+property="og:description"\s+content=")(.*?)(")', "opis"),
    (r'(<meta\s+name="twitter:title"\s+content=")(.*?)(")', "tytul"),
    (r'(<meta\s+name="twitter:description"\s+content=")(.*?)(")', "opis"),
]


def main():
    zapisz = "--zapisz" in sys.argv
    seo = wczytaj_seo()
    if not seo:
        print("Zaden przepis nie ma seoTitle + seoDescription — nie ma czego synchronizowac.")
        return

    for rid, (tytul, opis) in sorted(seo.items()):
        sciezka = os.path.join(PUB, rid + ".html")
        if not os.path.exists(sciezka):
            print("  %-14s brak mirrora — pomijam" % rid)
            continue
        html = io.open(sciezka, encoding="utf-8").read()
        zmian = 0
        for wzor, rodzaj in PODMIANY:
            nowa = esc(tytul if rodzaj == "tytul" else opis)
            m = re.search(wzor, html, re.S)
            if not m:
                continue
            if m.group(2) == nowa:
                continue
            html = html[:m.start()] + m.group(1) + nowa + m.group(3) + html[m.end():]
            zmian += 1
        print("  %-14s %s (%d pol do zmiany)"
              % (rid, "ZAPISANO" if (zapisz and zmian) else ("bez zmian" if not zmian else "podglad"), zmian))
        if zapisz and zmian:
            io.open(sciezka, "w", encoding="utf-8", newline="\n").write(html)

    if not zapisz:
        print()
        print("To byl podglad. Uruchom z --zapisz, zeby zastosowac.")


if __name__ == "__main__":
    main()
