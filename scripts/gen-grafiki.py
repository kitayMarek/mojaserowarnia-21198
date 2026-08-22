#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator grafik z naszych danych — PNG do udostepniania i Open Graph.

PO CO: mamy 3 linki przychodzace z jednej domeny. Tresc, ktora jest tylko
tabela na stronie, nie nadaje sie do wklejenia na grupe serowarska. Plansza
z konkretem i adresem serwisu wedruje sama.

CZEGO TO NIE ZASTEPUJE: tabel na stronie. Tekst w obrazku jest dla botow
niewidoczny — Google nie zaindeksuje go jako tresci, a crawlery LLM nie
odczytaja w ogole. Grafika idzie OBOK tabeli, nigdy zamiast.

Rozmiar 1200x630 to standard Open Graph (Facebook, LinkedIn, X) — ten sam
plik dziala jako miniaturka linku i jako obrazek do wrzucenia na grupe.

UZYCIE:
  python scripts/gen-grafiki.py zamienniki    # jedna grafika na probe
  python scripts/gen-grafiki.py --wszystkie   # komplet
Wynik: public/og/<nazwa>.png
"""
import io
import os
import re
import sys
from collections import Counter

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DANE = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")
WYJSCIE = os.path.join(ROOT, "public", "og")

SZER, WYS = 1200, 630

# Paleta z serwisu (amber/brand) — grafika ma wygladac jak strona
TLO = (255, 251, 235)        # bg-soft
AKCENT = (180, 83, 9)        # --brand
CIEMNY = (146, 64, 14)       # --brand-dark
TEKST = (31, 41, 55)         # --ink
SZARY = (107, 114, 128)      # --muted
LINIA = (253, 230, 138)      # amber-200

F = "C:/Windows/Fonts/%s"


def czcionka(nazwa, rozmiar):
    for kandydat in (nazwa, "segoeui.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(F % kandydat, rozmiar)
        except OSError:
            continue
    return ImageFont.load_default()


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


def stopka(d, podpis):
    """Adres serwisu — bez tego grafika wedruje bez przypisania."""
    f = czcionka("segoeuib.ttf", 26)
    d.rectangle([(0, WYS - 62), (SZER, WYS)], fill=CIEMNY)
    d.text((48, WYS - 46), "mojaserowarnia.pl", font=f, fill=(255, 251, 235))
    fm = czcionka("segoeui.ttf", 22)
    szer = d.textlength(podpis, font=fm)
    d.text((SZER - 48 - szer, WYS - 44), podpis, font=fm, fill=(253, 230, 138))


def grafika_zamienniki(rek):
    """Najmocniejszy konkret, jaki mamy: jeden sklad pod pietnastoma nazwami."""
    img = Image.new("RGB", (SZER, WYS), TLO)
    d = ImageDraw.Draw(img)

    d.rectangle([(0, 0), (SZER, 10)], fill=AKCENT)

    d.text((48, 54), "TE SAME BAKTERIE,", font=czcionka("segoeuib.ttf", 58), fill=CIEMNY)
    d.text((48, 118), "INNE NAZWY", font=czcionka("segoeuib.ttf", 58), fill=CIEMNY)

    d.text((48, 200),
           "Lactobacillus bulgaricus + Streptococcus thermophilus",
           font=czcionka("segoeuii.ttf", 27), fill=AKCENT)
    d.text((48, 238), "sprzedawane w polskich sklepach jako:",
           font=czcionka("segoeui.ttf", 25), fill=SZARY)

    nazwy = ["Beaugel Yog 1", "Beaugel Yog 2", "Beaugel Yog 3", "Beaugel Yog 4",
             "LAMBDA 3", "LAMBDA 6", "LAMBDA 7", "LAMBDA 8",
             "LAMBDA 9", "LAMBDA 10", "LAMBDA 12", "microMilk TB"]
    fn = czcionka("segoeuib.ttf", 25)
    x, y = 48, 292
    for n in nazwy:
        szer = d.textlength(n, font=fn) + 26
        if x + szer > SZER - 48:
            x, y = 48, y + 46
        d.rounded_rectangle([(x, y), (x + szer, y + 38)], radius=8,
                            fill=(255, 255, 255), outline=LINIA, width=2)
        d.text((x + 13, y + 7), n, font=fn, fill=TEKST)
        x += szer + 12

    d.text((48, 486),
           "Ponad połowa kultur w polskich sklepach ma skład wspólny z inną pozycją.",
           font=czcionka("segoeui.ttf", 26), fill=TEKST)
    d.text((48, 522),
           "Sprawdź, czym zastąpić tę, której nie ma.",
           font=czcionka("segoeuib.ttf", 26), fill=AKCENT)

    stopka(d, "/zamienniki-kultur")
    return img


def grafika_pojemnosci(rek):
    """Rozklad pojemnosci — pokazuje absurd formatow obok siebie."""
    img = Image.new("RGB", (SZER, WYS), TLO)
    d = ImageDraw.Draw(img)
    d.rectangle([(0, 0), (SZER, 10)], fill=AKCENT)

    d.text((48, 50), "OD 5 DO 5000 LITRÓW", font=czcionka("segoeuib.ttf", 56), fill=CIEMNY)
    d.text((48, 118), "w tej samej ofercie, bez żadnego oznaczenia",
           font=czcionka("segoeui.ttf", 28), fill=SZARY)

    licznik = Counter(int(r["packLiters"]) for r in rek if r.get("packLiters"))
    grupy = [("5 L", licznik.get(5, 0)), ("20–50 L", sum(licznik.get(k, 0) for k in (20, 25, 50))),
             ("100 L", licznik.get(100, 0)),
             ("150–300 L", sum(licznik.get(k, 0) for k in (150, 250, 300))),
             ("500 L", licznik.get(500, 0)),
             ("1000 L+", sum(v for k, v in licznik.items() if k >= 1000))]
    maks = max(v for _, v in grupy) or 1

    fe = czcionka("segoeuib.ttf", 26)
    fl = czcionka("segoeui.ttf", 24)
    y = 190
    for etykieta, ile in grupy:
        d.text((48, y + 6), etykieta, font=fe, fill=TEKST)
        x0 = 230
        szer = int((SZER - x0 - 150) * (ile / maks))
        d.rounded_rectangle([(x0, y), (x0 + max(szer, 4), y + 38)], radius=6, fill=AKCENT)
        d.text((x0 + max(szer, 4) + 14, y + 7), "%d" % ile, font=fl, fill=SZARY)
        y += 52

    d.text((48, 520), "188 kultur z 5 polskich sklepów · cena za litr od 0,014 do 3,00 zł",
           font=czcionka("segoeui.ttf", 25), fill=TEKST)

    stopka(d, "/baza-kultur")
    return img


def zawin(d, tekst, font, szer_max, linie_max=3):
    """Lamie tekst na szerokosc kolumny."""
    slowa, linie, biezaca = tekst.split(), [], ""
    for w in slowa:
        proba = (biezaca + " " + w).strip()
        if d.textlength(proba, font=font) <= szer_max:
            biezaca = proba
        else:
            if biezaca:
                linie.append(biezaca)
            biezaca = w
        if len(linie) == linie_max:
            break
    if biezaca and len(linie) < linie_max:
        linie.append(biezaca)
    return linie


def grafika_porownanie(rek):
    """Uklad porownywarki na realnych danych.

    Pomysl Marka po zobaczeniu wlasnej porownywarki: pokazac ZESTAWIENIE, a nie
    wymyslona plansze. Pokazuje trzy rzeczy naraz — ze sklad bywa identyczny,
    ze przeznaczenie mimo to sie rozni, i ze cena za litr rozjezdza sie 11-krotnie.
    Przy okazji reklamuje porownywarke, ktorej nikt nie uzywa.
    """
    wybor = ["Beaugel Yog 1", "Beaugel Yog 2", "LAMBDA 6", "microMilk TB (Taleggio)"]
    kol = []
    for nazwa in wybor:
        r = next((x for x in rek if x.get("name") == nazwa), None)
        if r:
            kol.append(r)
    if len(kol) < 2:
        raise SystemExit("Brak danych do grafiki porownania")

    img = Image.new("RGB", (SZER, WYS), TLO)
    d = ImageDraw.Draw(img)
    d.rectangle([(0, 0), (SZER, 10)], fill=AKCENT)

    d.text((44, 40), "TEN SAM SKŁAD, INNE PRZEZNACZENIE",
           font=czcionka("segoeuib.ttf", 46), fill=CIEMNY)
    d.text((44, 96), "cztery kultury, te same dwie bakterie — i 11-krotna różnica ceny za litr",
           font=czcionka("segoeui.ttf", 25), fill=SZARY)

    x0, gora = 44, 150
    szer_etyk = 150
    szer_kol = (SZER - 88 - szer_etyk) // len(kol)

    fnag = czcionka("segoeuib.ttf", 23)
    fetyk = czcionka("segoeuib.ttf", 20)
    fkom = czcionka("segoeui.ttf", 20)
    fcena = czcionka("segoeuib.ttf", 34)

    # Naglowki kolumn. Nazwa sklepu musi isc POD nazwa produktu, a ta bywa
    # dwuwierszowa ("microMilk TB (Taleggio)") — stala pozycja powodowala
    # nachodzenie tekstow. Wysokosc ramki liczymy z najdluzszej nazwy.
    fsklep = czcionka("segoeui.ttf", 18)
    nazwy_lamane = [zawin(d, r["name"], fnag, szer_kol - 24, 2) for r in kol]
    maks_linii = max(len(n) for n in nazwy_lamane)
    wys_nag = 16 + maks_linii * 26 + 26

    for i, r in enumerate(kol):
        x = x0 + szer_etyk + i * szer_kol
        d.rounded_rectangle([(x + 4, gora), (x + szer_kol - 4, gora + wys_nag)],
                            radius=8, fill=(255, 255, 255), outline=LINIA, width=2)
        for j, linia in enumerate(nazwy_lamane[i]):
            d.text((x + 14, gora + 8 + j * 26), linia, font=fnag, fill=TEKST)
        d.text((x + 14, gora + 10 + maks_linii * 26), r.get("shop", ""), font=fsklep, fill=SZARY)

    y = gora + wys_nag + 14

    # CENA ZA LITR — to jest pointa, wiec dostaje najwiecej miejsca
    d.text((x0, y + 16), "Cena za litr", font=fetyk, fill=AKCENT)
    for i, r in enumerate(kol):
        x = x0 + szer_etyk + i * szer_kol
        cena, litry = r.get("price_numeric"), r.get("packLiters")
        if cena and litry:
            v = cena / litry
            txt = ("%.2f" % v).replace(".", ",") if v >= 0.1 else ("%.3f" % v).replace(".", ",")
        else:
            txt = "?"
        d.text((x + 14, y + 4), txt + " zł", font=fcena, fill=CIEMNY)
        if cena and litry:
            d.text((x + 14, y + 44),
                   "%s · %d L" % (r.get("price", ""), litry),
                   font=czcionka("segoeui.ttf", 18), fill=SZARY)
    y += 82

    # SKLAD — identyczny, wiec podswietlony
    d.rounded_rectangle([(x0 - 6, y - 6), (SZER - 38, y + 62)], radius=8, fill=(254, 243, 199))
    d.text((x0, y + 4), "Skład", font=fetyk, fill=AKCENT)
    d.text((x0, y + 30), "identyczny", font=czcionka("segoeui.ttf", 17), fill=SZARY)
    for i, r in enumerate(kol):
        x = x0 + szer_etyk + i * szer_kol
        for j, linia in enumerate(zawin(d, r.get("composition", ""), czcionka("segoeuii.ttf", 18),
                                        szer_kol - 24, 3)):
            d.text((x + 14, y + 2 + j * 21), linia, font=czcionka("segoeuii.ttf", 18), fill=TEKST)
    y += 78

    # PRZEZNACZENIE — rozne
    d.text((x0, y + 4), "Przeznaczenie", font=fetyk, fill=AKCENT)
    d.text((x0, y + 30), "różne", font=czcionka("segoeui.ttf", 17), fill=SZARY)
    for i, r in enumerate(kol):
        x = x0 + szer_etyk + i * szer_kol
        ostatnia = i == len(kol) - 1
        for j, linia in enumerate(zawin(d, r.get("application", ""), fkom, szer_kol - 24, 3)):
            d.text((x + 14, y + 2 + j * 22), linia, font=fkom,
                   fill=CIEMNY if ostatnia else TEKST)
    y += 84

    d.text((x0, y), "Porównaj dowolne kultury obok siebie — wszystkie 188 w bazie.",
           font=czcionka("segoeuib.ttf", 24), fill=AKCENT)

    stopka(d, "/porownywarka-kultur")
    return img


GRAFIKI = {
    "zamienniki": grafika_zamienniki,
    "pojemnosci": grafika_pojemnosci,
    "porownanie": grafika_porownanie,
}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    wszystkie = "--wszystkie" in sys.argv
    if not args and not wszystkie:
        sys.exit("Podaj nazwe (%s) albo --wszystkie" % ", ".join(GRAFIKI))

    rek = wczytaj()
    os.makedirs(WYJSCIE, exist_ok=True)
    do_zrobienia = GRAFIKI.keys() if wszystkie else args

    for nazwa in do_zrobienia:
        if nazwa not in GRAFIKI:
            print("  nieznana grafika: %s" % nazwa)
            continue
        img = GRAFIKI[nazwa](rek)
        sciezka = os.path.join(WYJSCIE, nazwa + ".png")
        img.save(sciezka, "PNG", optimize=True)
        print("  %-14s %s (%d B, %dx%d)"
              % (nazwa, os.path.relpath(sciezka, ROOT), os.path.getsize(sciezka), SZER, WYS))
    return 0


if __name__ == "__main__":
    sys.exit(main())
