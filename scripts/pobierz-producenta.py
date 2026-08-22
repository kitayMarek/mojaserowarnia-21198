#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Odczyt PRODUCENTA i PROPORCJI SZCZEPOW ze stron produktow.

SKAD POMYSL: Marek trafil na strone LAMBDA 7 w Lactic.pl, gdzie stoi
"Mieszanka szczepow Streptococcus Thermophilus i Lactobacillus Bulgaricus
(80%:20%)" oraz pole "Producent: Etablissements Coquard" z logo.

To wypelnia dwie luki naraz:
1. PROPORCJE — na stronie o zamiennikach napisalismy, ze sklad gatunkowy nie
   odroznia produktow, bo "producenci dobieraja proporcje, czego tabela nie
   pokazuje". Okazuje sie, ze czasem pokazuje. Tam gdzie sa, mozemy przestac
   pisac "nie wiadomo" i podac liczbe.
2. PRODUCENT — na stronie o producentach podalismy, ze 96 z 188 pozycji nie ma
   sladu producenta W NAZWIE ANI SKLADZIE, z zastrzezeniem, ze moze byc w karcie
   produktu. Tu to sprawdzamy naprawde.

UWAGA NA LOGO: producent bywa podany wylacznie jako obrazek. Czytamy wtedy
atrybut alt/title, bo tekstu nie ma.

UZYCIE:
  python scripts/pobierz-producenta.py --test
  python scripts/pobierz-producenta.py --probka 12
  python scripts/pobierz-producenta.py
"""
import io
import os
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZRODLO = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")
WYJSCIE = os.path.join(ROOT, "scripts", "kultury-data", "producent.txt")

UA = "Mozilla/5.0 (compatible; MojaSerowarnia/1.0; +https://mojaserowarnia.pl)"
ODSTEP = 0.8

# Proporcje: "(80%:20%)", "80% : 20%", "80:20"
PROPORCJE = [
    re.compile(r"\(\s*(\d{1,3})\s*%\s*[:\/]\s*(\d{1,3})\s*%\s*\)"),
    re.compile(r"(\d{1,3})\s*%\s*[:\/]\s*(\d{1,3})\s*%"),
]

# Etykieta "Producent:" i to, co po niej — tekstem albo w alt obrazka.
PRODUCENT_TEKST = re.compile(r"Producent\s*:?\s*([A-ZŁŚŻŹĆÓĘĄŃ][\w\.\- ]{2,40})", re.I)

# Znane marki producentow — do rozpoznania takze z alt/title/nazwy pliku logo.
MARKI = [
    ("Coquard", r"coquard"),
    ("Novonesis / Chr. Hansen", r"chr\.?\s*hansen|novonesis"),
    ("IFF / Danisco", r"danisco|choozit|\biff\b"),
    ("Sacco System", r"\bsacco\b|clerici"),
    ("Lallemand", r"lallemand"),
    ("dsm-firmenich", r"\bdsm\b|firmenich"),
    ("Bioprox", r"bioprox"),
    ("microMilk", r"micro\s*milk"),
]

TAGI = re.compile(r"<(?:script|style)[^>]*>.*?</(?:script|style)>", re.S | re.I)


def wczytaj_kultury():
    h = io.open(ZRODLO, encoding="utf-8").read()
    rek = []
    for blok in re.findall(r"\{(.*?)\}", h, re.S):
        d = dict(re.findall(r'(\w+):\s*"([^"]*)"', blok))
        if d.get("name") and d.get("productUrl", "").startswith("http"):
            rek.append(d)
    return rek


def pobierz(url, prob=3):
    ostatni = None
    for n in range(prob):
        try:
            zad = urllib.request.Request(
                url, headers={"User-Agent": UA, "Accept-Language": "pl,en", "Connection": "close"}
            )
            with urllib.request.urlopen(zad, timeout=30) as odp:
                surowe = odp.read()
            try:
                return surowe.decode("utf-8")
            except UnicodeDecodeError:
                return surowe.decode("iso-8859-2", "replace")
        except urllib.error.HTTPError:
            raise
        except Exception as e:
            ostatni = e
            if n < prob - 1:
                time.sleep(2.5 * (n + 1))
    raise ostatni


def na_tekst(html):
    return " ".join(re.sub(r"<[^>]+>", " ", TAGI.sub(" ", html)).replace("&nbsp;", " ").split())


def znajdz_proporcje(tekst):
    for wz in PROPORCJE:
        m = wz.search(tekst)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            # Suma musi miec sens jako podzial szczepow.
            if 90 <= a + b <= 110:
                return "%d:%d" % (a, b), tekst[max(0, m.start() - 90): m.end() + 10]
    return None, ""


# Dane strukturalne — jedyne wiarygodne zrodlo marki na stronie produktu.
BRAND_MICRODATA = re.compile(r'itemprop=["\']brand["\'][^>]*content=["\']([^"\']{2,60})["\']', re.I)
BRAND_MICRODATA_ODWROTNIE = re.compile(r'content=["\']([^"\']{2,60})["\'][^>]*itemprop=["\']brand["\']', re.I)
BRAND_JSONLD = re.compile(r'"brand"\s*:\s*(?:\{[^}]*?"name"\s*:\s*"([^"]{2,60})"|"([^"]{2,60})")', re.I)

# Etykieta widoczna — fallback, wymaga dwukropka i sensownej wartosci.
PRODUCENT_ETYKIETA = re.compile(r"(?<![a-ząćęłńóśżź])Producent\s*:\s*([A-ZŁŚŻŹĆÓĘĄŃ][\w\.\-]{2,30}(?:\s+[\w\.\-]{2,20}){0,2})")
ETYKIETY_PO = re.compile(r"^(Kod|Dostępn|Wysyłk|Cena|Opis|zapytaj|poleć|Ocena)", re.I)


def znajdz_producenta(html, tekst):
    """Zwraca (producent, zrodlo).

    UWAGA — pulapka wykryta 2026-08-22: szukanie nazwy marki w CALYM kodzie
    strony daje falszywe trafienia. Lactic.pl ma w bocznym pasku KAZDEJ podstrony
    box "Katalog Coquard", wiec kazdy produkt raportowalby Coquarda niezaleznie
    od tego, czyj naprawde jest. Czytamy wylacznie dane strukturalne przypisane
    do produktu, a etykiete tekstowa traktujemy jako ostatecznosc.
    """
    for wz in (BRAND_MICRODATA, BRAND_MICRODATA_ODWROTNIE):
        m = wz.search(html)
        if m:
            return m.group(1).strip(), "microdata"

    m = BRAND_JSONLD.search(html)
    if m:
        return (m.group(1) or m.group(2)).strip(), "json-ld"

    m = PRODUCENT_ETYKIETA.search(tekst)
    if m:
        kand = m.group(1).strip()
        if not ETYKIETY_PO.match(kand):
            return kand, "etykieta"
    return None, None


TESTY = [
    ("LAMBDA 7 — proporcje", "80:20",
     "Mieszanka szczepów Streptococcus Thermophilus i Lactobacillus Bulgaricus (80%:20%). "
     "Kultury bakterii przeznaczone są do jogurtu produkowanego metodą zbiornikową."),
    ("bez proporcji", None,
     "Wyselekcjonowane kultury bakterii, skoncentrowane i liofilizowane. Cena: 19,00 zł"),
    ("falszywy procent", None,
     "zawiera 23.00% VAT Dostępność: duża ilość"),
]


def testuj():
    ok = 0
    for nazwa, oczekiwane, tekst in TESTY:
        wynik, _ = znajdz_proporcje(tekst)
        zgodne = wynik == oczekiwane
        ok += zgodne
        print("  %-24s oczek. %-6s otrzym. %-6s %s"
              % (nazwa, oczekiwane, wynik, "OK " if zgodne else "BLAD"))
    print("\n  zdane: %d z %d" % (ok, len(TESTY)))
    return 0 if ok == len(TESTY) else 1


def main():
    if "--test" in sys.argv:
        return testuj()

    probka = 0
    if "--probka" in sys.argv:
        i = sys.argv.index("--probka")
        probka = int(sys.argv[i + 1]) if len(sys.argv) > i + 1 else 12

    rek = wczytaj_kultury()
    juz = {}
    if "--uzupelnij" in sys.argv and os.path.exists(WYJSCIE):
        for linia in io.open(WYJSCIE, encoding="utf-8"):
            if linia.startswith("#"):
                continue
            c = [x.strip() for x in linia.strip().split("|")]
            if len(c) >= 2:
                juz[(c[0], c[1])] = c
        rek = [d for d in rek if (d["name"], d.get("shop", "")) not in juz]
        print("UZUPELNIANIE: %d do dobrania\n" % len(rek))

    if probka:
        wg = {}
        for d in rek:
            wg.setdefault(d.get("shop", "?"), []).append(d)
        rek = [d for lista in wg.values() for d in lista[: max(1, probka // len(wg))]]
        print("PROBKA: %d stron\n" % len(rek))

    wyniki, bledy = [], 0
    for n, d in enumerate(rek, 1):
        try:
            html = pobierz(d["productUrl"])
        except Exception as e:
            print("  !! %-8s %-24s" % (type(e).__name__, d["name"][:24]))
            bledy += 1
            time.sleep(ODSTEP)
            continue
        tekst = na_tekst(html)
        prop, _ = znajdz_proporcje(tekst)
        prod, skad = znajdz_producenta(html, tekst)
        wyniki.append((d["name"], d.get("shop", ""), prop or "", prod or "", skad or ""))
        print("  %-24s %-13s proporcje %-7s producent %s"
              % (d["name"][:24], d.get("shop", "")[:13], prop or "—", prod or "—"))
        if n % 25 == 0:
            print("     ... %d z %d" % (n, len(rek)))
        time.sleep(ODSTEP)

    print("\nPODSUMOWANIE")
    print("  sprawdzonych   : %d" % len(rek))
    print("  z proporcjami  : %d" % sum(1 for w in wyniki if w[2]))
    print("  z producentem  : %d" % sum(1 for w in wyniki if w[3]))
    print("  bledy          : %d" % bledy)

    if not probka:
        wszystkie = list(juz.values()) + [list(w) for w in wyniki]
        os.makedirs(os.path.dirname(WYJSCIE), exist_ok=True)
        with io.open(WYJSCIE, "w", encoding="utf-8", newline="") as f:
            f.write("# nazwa | sklep | proporcje | producent | zrodlo\n")
            for w in sorted(wszystkie, key=lambda x: (str(x[1]), str(x[0]))):
                f.write(" | ".join(str(x).replace("|", "/") for x in w) + "\n")
        print("\nZAPISANO %s" % os.path.relpath(WYJSCIE, ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
