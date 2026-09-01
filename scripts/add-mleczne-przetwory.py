#!/usr/bin/env python3
"""
Wstrzykuje sekcje "Mleczne przetwory" do huba warstwy statycznej
(public/przepisy/przewodnik.html) - z tej samej listy, co menu i kafelki w Reakcie.

DLACZEGO TO ISTNIEJE: jogurt, kefir, serek homogenizowany i ser z jogurtu maja swoje
mirrory, ale NIE PROWADZIL do nich zaden link z huba - byly osiagalne wylacznie przez
sitemape. Dla botow, ktore czytaja warstwe statyczna i to wlasnie ona zbiera cytowania,
strona bez linku z huba jest strona drugiej kategorii.

ZRODLO DANYCH: src/data/mleczneProdukty.ts - ten sam plik, z ktorego buduje sie menu
i kafelki na /przepisy. Recznie wpisana druga lista rozjechalaby sie przy pierwszym
dodanym wariancie (to sie w tym projekcie zdarzylo juz przy FAQ: 11 pytan w Reakcie,
12 w mirrorze, 6 wspolnych).

Idempotentny: kolejne uruchomienia podmieniaja blok miedzy znacznikami.

Uruchom:  python scripts/add-mleczne-przetwory.py
"""
import io, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZRODLO_TS = os.path.join(ROOT, "src", "data", "mleczneProdukty.ts")
HUB = os.path.join(ROOT, "public", "przepisy", "przewodnik.html")
BAZA = "https://mojaserowarnia.pl/przepisy/"

START = "<!-- MLECZNE-PRZETWORY:START (generowane przez scripts/add-mleczne-przetwory.py) -->"
KONIEC = "<!-- MLECZNE-PRZETWORY:KONIEC -->"


def wczytaj_produkty():
    """Parsuje liste z pliku TS. Swiadomie prosty regex - plik jest nasz i maly;
    gdyby ktos zmienil jego ksztalt, funkcja ma sie WYSYPAC, a nie zgadywac."""
    tresc = io.open(ZRODLO_TS, encoding="utf-8").read()
    wpisy = re.findall(
        r'\{\s*slug:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*opis:\s*"([^"]+)",\s*\}',
        tresc)
    if not wpisy:
        raise SystemExit("Nie odczytalem zadnego produktu z %s - zmienil sie ksztalt pliku?"
                         % os.path.relpath(ZRODLO_TS, ROOT))
    return wpisy


def zbuduj_blok(produkty):
    linie = [START,
             "\n  <h2>Mleczne przetwory — bez podpuszczki i bez dojrzewalni</h2>",
             "\n  <p>Jogurty, kefiry, serki homogenizowane i sery kwasowe powstają na samej"
             " kulturze bakteryjnej. To najprostsze wejście w domowe mleczarstwo — i dobry"
             " punkt startu przed pierwszym serem podpuszczkowym.</p>",
             '\n  <div class="cards">']
    for slug, label, opis in produkty:
        linie.append('\n    <a href="%s%s.html"><strong>%s</strong><span>%s</span></a>'
                     % (BAZA, slug, label, opis))
    linie.append("\n  </div>\n  " + KONIEC)
    return "".join(linie)


def main():
    produkty = wczytaj_produkty()
    for slug, _l, _o in produkty:
        mirror = os.path.join(ROOT, "public", "przepisy", slug + ".html")
        if not os.path.exists(mirror):
            raise SystemExit("Brak mirrora %s - link z huba prowadzilby w prozne." % mirror)

    html = io.open(HUB, encoding="utf-8").read()
    wzor = re.compile(re.escape(START) + r".*?" + re.escape(KONIEC), re.S)
    bylo = bool(wzor.search(html))
    html = wzor.sub("", html)

    kotwica = "<h2>Czego potrzebujesz</h2>"
    if kotwica not in html:
        raise SystemExit("Nie znalazlem naglowka '%s' - gdzie wstawic sekcje?" % kotwica)
    html = html.replace(kotwica, zbuduj_blok(produkty) + "\n\n  " + kotwica, 1)

    io.open(HUB, "w", encoding="utf-8", newline="\n").write(html)
    print("przewodnik.html: sekcja %s (%d pozycji)"
          % ("podmieniona" if bylo else "wstawiona", len(produkty)))


if __name__ == "__main__":
    main()
