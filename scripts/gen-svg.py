#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator wykresow SVG do OSADZENIA W STRONIE.

CZYM SIE ROZNI OD PNG: SVG osadzone bezposrednio w HTML jest jednoczesnie
grafika i TEKSTEM. Bot czyta z niego liczby i etykiety, bo to zwykle znaczniki
w dokumencie — w przeciwienstwie do obrazka, ktorego nie odczyta wcale.

To rozwiazuje konflikt, ktory mielismy przy PNG: chcemy pokazac dane wizualnie,
ale nie mozemy sobie pozwolic na zniknieciem tresci z indeksu. Podzial wychodzi
taki: SVG w stronie, PNG do udostepniania i Open Graph.

DOSTEPNOSC: kazdy wykres ma <title> i <desc> oraz role="img" i aria-label —
czytnik ekranu odczyta go jako opisany obraz, a nie jako zbior ksztaltow.

MOTYW: kolory z zmiennych CSS serwisu (var(--...)) z wartoscia zapasowa, wiec
wykres dziala takze w ciemnym motywie i w mirrorze, ktory ma wlasna palete.

UZYCIE:
  python scripts/gen-svg.py pojemnosci     # jeden wykres na stdout do podgladu
  python scripts/gen-svg.py --zapisz       # wszystkie do public/svg/
"""
import io
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DANE = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")
WYJSCIE = os.path.join(ROOT, "public", "svg")


def wczytaj():
    h = io.open(DANE, encoding="utf-8").read()
    rek = []
    for blok in re.findall(r"\{(.*?)\}", h, re.S):
        d = dict(re.findall(r'(\w+):\s*"([^"]*)"', blok))
        for pole in ("price_numeric", "packLiters"):
            m = re.search(pole + r":\s*([\d.]+)", blok)
            if m:
                d[pole] = float(m.group(1))
        if d.get("name"):
            rek.append(d)
    return rek


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def wykres_slupkowy(tytul, opis, pary, jednostka="", wys_slupka=34, odstep=14):
    """Poziomy wykres slupkowy. `pary` to lista (etykieta, wartosc)."""
    gora = 8
    szer = 720
    szer_etyk = 210
    szer_wykresu = szer - szer_etyk - 70
    maks = max(v for _, v in pary) or 1
    wys = gora + len(pary) * (wys_slupka + odstep) + 8

    o = []
    o.append(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="100%%" '
        'role="img" aria-label="%s" style="max-width:%dpx;height:auto">'
        % (szer, wys, esc(tytul + ". " + opis), szer)
    )
    o.append("  <title>%s</title>" % esc(tytul))
    o.append("  <desc>%s</desc>" % esc(opis))
    o.append(
        '  <style>'
        '.etyk{font:600 15px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;'
        'fill:var(--ink,#1f2937)}'
        '.wart{font:14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;'
        'fill:var(--muted,#6b7280)}'
        '.slup{fill:var(--brand,#b45309)}'
        '</style>'
    )
    y = gora
    for etykieta, wartosc in pary:
        szer_s = max(int(szer_wykresu * (wartosc / maks)), 3)
        o.append('  <text x="0" y="%d" class="etyk">%s</text>'
                 % (y + wys_slupka - 12, esc(etykieta)))
        o.append('  <rect x="%d" y="%d" width="%d" height="%d" rx="4" class="slup"/>'
                 % (szer_etyk, y, szer_s, wys_slupka))
        o.append('  <text x="%d" y="%d" class="wart">%s%s</text>'
                 % (szer_etyk + szer_s + 10, y + wys_slupka - 12, wartosc, jednostka))
        y += wys_slupka + odstep
    o.append("</svg>")
    return "\n".join(o)


def svg_pojemnosci(rek):
    licznik = Counter(int(r["packLiters"]) for r in rek if r.get("packLiters"))
    pary = [
        ("5 L", licznik.get(5, 0)),
        ("20–50 L", sum(licznik.get(k, 0) for k in (20, 25, 50))),
        ("100 L", licznik.get(100, 0)),
        ("150–300 L", sum(licznik.get(k, 0) for k in (150, 250, 300))),
        ("500 L", licznik.get(500, 0)),
        ("1000 L i więcej", sum(v for k, v in licznik.items() if k >= 1000)),
    ]
    razem = sum(v for _, v in pary)
    opis = ("Rozkład pojemności opakowań kultur bakteryjnych w pięciu polskich sklepach. "
            + ", ".join("%s: %d pozycji" % (e, v) for e, v in pary)
            + ". Razem %d pozycji z zadeklarowaną pojemnością." % razem)
    return wykres_slupkowy("Na ile litrów mleka starcza opakowanie", opis, pary, " poz.")


def svg_typy(rek):
    licznik = Counter(r.get("type") for r in rek if r.get("type"))
    pary = [(t.capitalize(), n) for t, n in licznik.most_common(8)]
    opis = ("Liczba kultur bakteryjnych według typu w bazie %d pozycji. "
            % len(rek)) + ", ".join("%s: %d" % (e, v) for e, v in pary) + "."
    return wykres_slupkowy("Kultury bakteryjne według typu", opis, pary, " kultur")


def svg_producenci(rek):
    licznik = Counter(r.get("manufacturer") for r in rek if r.get("manufacturer"))
    pary = [(p, n) for p, n in licznik.most_common(8)]
    opis = ("Producenci deklarowani na stronach produktów, %d pozycji z %d. "
            % (sum(licznik.values()), len(rek))) + ", ".join("%s: %d" % (e, v) for e, v in pary) + "."
    return wykres_slupkowy("Kto produkuje kultury sprzedawane w Polsce", opis, pary, " poz.")


WYKRESY = {
    "pojemnosci": svg_pojemnosci,
    "typy": svg_typy,
    "producenci": svg_producenci,
}


def main():
    rek = wczytaj()
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    zapis = "--zapisz" in sys.argv

    if not zapis and args:
        for nazwa in args:
            if nazwa in WYKRESY:
                print(WYKRESY[nazwa](rek))
            else:
                print("nieznany wykres: %s (dostepne: %s)" % (nazwa, ", ".join(WYKRESY)))
        return 0

    if not zapis:
        print("Podaj nazwe (%s) albo --zapisz" % ", ".join(WYKRESY))
        return 1

    os.makedirs(WYJSCIE, exist_ok=True)
    wygenerowane = {}
    for nazwa, fn in WYKRESY.items():
        tresc = fn(rek)
        wygenerowane[nazwa] = tresc
        p = os.path.join(WYJSCIE, nazwa + ".svg")
        io.open(p, "w", encoding="utf-8", newline="").write(tresc)
        print("  %-14s %s (%d B)" % (nazwa, os.path.relpath(p, ROOT), len(tresc.encode("utf-8"))))

    # Ten sam SVG jako modul TS — React osadza go INLINE w DOM. Gdyby poszedl
    # przez <img src="...svg">, przegladarka pokazalaby obrazek, ale bot nie
    # odczytalby z niego ani jednej liczby, czyli stracilibysmy caly sens SVG.
    ts = os.path.join(ROOT, "src", "generated", "wykresySvg.ts")
    os.makedirs(os.path.dirname(ts), exist_ok=True)
    linie = [
        "// Plik GENEROWANY: scripts/gen-svg.py --zapisz. Nie edytuj recznie.",
        "// Wykresy sa osadzane inline, zeby bot czytal z nich liczby jako tekst.",
        "",
    ]
    for nazwa, tresc in wygenerowane.items():
        klucz = "".join(c if c.isalnum() else "_" for c in nazwa)
        linie.append("export const %s = %s;" % (klucz, _ts_string(tresc)))
        linie.append("")
    io.open(ts, "w", encoding="utf-8", newline="").write("\n".join(linie))
    print("  %-14s %s" % ("modul TS", os.path.relpath(ts, ROOT)))
    return 0


def _ts_string(s):
    """Bezpieczny literal TS — backticki i ${ psulyby template string."""
    return "`" + s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${") + "`"


if __name__ == "__main__":
    sys.exit(main())
