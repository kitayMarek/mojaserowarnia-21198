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

CHIRURGICZNIE: rusza wylacznie <title> i meta description. Widoczna tresc strony
zostaje nietknieta. Przepisy bez seoTitle sa pomijane, wiec uruchomienie niczego
nie psuje.

OG I TWITTER TYLKO WTEDY, gdy powtarzaly stara wartosc. Czesc mirrorow ma te pola
napisane OSOBNO i KROCEJ, pod karte spolecznosciowa — np. mleko-do-sera mialo
twitter:description na 58 znakow, podczas gdy opis SEO ma 161. Wczesniejsza wersja
tego skryptu nadpisywala je opisem SEO i kasowala te roznice; karta pokazywalaby
urwany tekst. Regula jest wiec taka: jesli pole rownalo sie staremu tytulowi lub
staremu opisowi, to bylo tylko ich kopia i idzie za nimi. Jesli brzmialo inaczej,
ktos napisal je swiadomie i zostaje nietkniete.

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


META = os.path.join(ROOT, "src", "data", "metaStron.ts")


def wczytaj_seo():
    """[(etykieta, sciezka_mirrora, tytul, opis)] z DWOCH zrodel:
    recipesData.ts (przepisy) i metaStron.ts (strony, ktore przepisami nie sa)."""
    pozycje = []

    tresc = io.open(SRC, encoding="utf-8").read()
    for blok in re.split(r"\n  \{\n", tresc)[1:]:
        rid = re.search(r"id:\s*" + STR, blok)
        tyt = re.search(r"seoTitle:\s*" + STR, blok)
        opis = re.search(r"seoDescription:\s*" + STR, blok)
        if rid and tyt and opis:
            pozycje.append((rid.group(1),
                            os.path.join(PUB, rid.group(1) + ".html"),
                            tyt.group(1), opis.group(1)))

    if os.path.exists(META):
        mt = io.open(META, encoding="utf-8").read()
        # Kolejnosc pol w metaStron.ts jest stala: title, description, mirror.
        for m in re.finditer(r"\"(/[^\"]+)\":\s*\{(.*?)\n  \},", mt, re.S):
            blok = m.group(2)
            tyt = re.search(r"title:\s*\n?\s*" + STR, blok)
            opis = re.search(r"description:\s*\n?\s*" + STR, blok)
            mir = re.search(r"mirror:\s*" + STR, blok)
            if tyt and opis and mir:
                pozycje.append((m.group(1),
                                os.path.join(ROOT, "public", *mir.group(1).split("/")),
                                tyt.group(1), opis.group(1)))
    return pozycje


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

    for etykieta, sciezka, tytul, opis in sorted(seo):
        if not os.path.exists(sciezka):
            print("  %-22s brak mirrora — pomijam" % etykieta)
            continue
        html = io.open(sciezka, encoding="utf-8").read()
        zmian = 0
        pominiete = 0

        # Stary tytul i opis — do rozpoznania, ktore pola byly tylko ich kopia.
        st = re.search(r"(<title>)(.*?)(</title>)", html, re.S)
        so = re.search(r'(<meta\s+name="description"\s+content=")(.*?)(")', html, re.S)
        stary_tytul = st.group(2) if st else None
        stary_opis = so.group(2) if so else None

        for wzor, rodzaj in PODMIANY:
            nowa = esc(tytul if rodzaj == "tytul" else opis)
            m = re.search(wzor, html, re.S)
            if not m:
                continue
            if m.group(2) == nowa:
                continue
            czy_glowne = wzor.startswith("(<title>") or 'name="description"' in wzor
            if not czy_glowne and m.group(2) not in (stary_tytul, stary_opis):
                pominiete += 1   # napisane osobno — nie ruszamy
                continue
            html = html[:m.start()] + m.group(1) + nowa + m.group(3) + html[m.end():]
            zmian += 1
        print("  %-22s %s (%d pol do zmiany%s)"
              % (etykieta, "ZAPISANO" if (zapisz and zmian) else ("bez zmian" if not zmian else "podglad"),
                 zmian, ", %d wlasnych pominieto" % pominiete if pominiete else ""))
        if zapisz and zmian:
            io.open(sciezka, "w", encoding="utf-8", newline="\n").write(html)

    if not zapisz:
        print()
        print("To byl podglad. Uruchom z --zapisz, zeby zastosowac.")


if __name__ == "__main__":
    main()
