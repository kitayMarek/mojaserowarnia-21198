#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zgloszenie zmienionych adresow do IndexNow (Bing, Yandex, Seznam, Naver).

IndexNow to protokol "push": zamiast czekac, az bot sam wroci na strone,
mowisz mu od razu, ze cos sie zmienilo. Google w nim NIE uczestniczy —
tam dziala sitemap i GSC. Dla nas liczy sie Bing, bo stamtad idzie ruch AI.

WLASNOSC DOMENY potwierdza plik klucza hostowany w korzeniu serwisu:
    https://mojaserowarnia.pl/90bbed815ee44b9c82e2e8a77fbe93f9.txt
Ten plik MUSI byc na serwerze, zanim zglosisz cokolwiek — inaczej 403.

UZYCIE:
  python scripts/indexnow.py --sprawdz-klucz
      Sam test: czy plik klucza jest live i czy zawiera wlasciwa wartosc.

  python scripts/indexnow.py --podglad
      Pokazuje, co zostaloby zgloszone (adresy z sitemap.xml o dzisiejszym
      lastmod). Nic nie wysyla.

  python scripts/indexnow.py --wyslij
      To samo, ale naprawde wysyla.

  python scripts/indexnow.py --wyslij --od 2026-08-01
      Adresy z lastmod >= podanej daty.

  python scripts/indexnow.py --wyslij https://mojaserowarnia.pl/przepisy/twarog ...
      Konkretne adresy zamiast sitemap.

UWAGA: zglaszaj TYLKO to, co faktycznie sie zmienilo. Wysylanie calego
serwisu przy kazdym deployu to droga do 429 (spam) i utraty zaufania.
"""
import argparse
import datetime
import json
import os
import re
import sys
import urllib.error
import urllib.request

KLUCZ = "90bbed815ee44b9c82e2e8a77fbe93f9"
HOST = "mojaserowarnia.pl"
BAZA = "https://" + HOST
LOKALIZACJA_KLUCZA = "%s/%s.txt" % (BAZA, KLUCZ)
ENDPOINT = "https://api.indexnow.org/indexnow"
LIMIT_NA_ZADANIE = 10000

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITEMAP = os.path.join(ROOT, "public", "sitemap.xml")

KODY = {
    200: "OK — adresy przyjete",
    202: "Przyjete, klucz w trakcie weryfikacji (to tez sukces)",
    400: "Zly format zadania",
    403: "Klucz nieprawidlowy — plik klucza nie istnieje albo ma inna wartosc",
    422: "Adresy nie naleza do tego hosta albo klucz nie pasuje do schematu",
    429: "Za duzo zadan — potraktowane jako spam. Odczekaj i zglaszaj mniej",
}


def pobierz(url, timeout=30):
    zadanie = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (indexnow-check)"})
    with urllib.request.urlopen(zadanie, timeout=timeout) as odp:
        return odp.status, odp.headers.get("Content-Type", ""), odp.read()


def sprawdz_klucz():
    """Bez tego zgloszenie i tak dostanie 403 — sprawdzamy PRZED wysylka."""
    print("Sprawdzam plik klucza: %s" % LOKALIZACJA_KLUCZA)
    try:
        status, ctype, body = pobierz(LOKALIZACJA_KLUCZA)
    except urllib.error.HTTPError as e:
        print("  BLAD HTTP %s — pliku klucza nie ma na serwerze." % e.code)
        print("  Wgraj public/%s.txt do korzenia serwisu i sprobuj ponownie." % KLUCZ)
        return False
    except Exception as e:
        print("  BLAD polaczenia: %s" % e)
        return False

    tresc = body.decode("utf-8", "replace").strip()
    # Content-Type sprawdzamy, bo SPA-fallback zwraca 200 + text/html dla brakujacych
    # sciezek. Sam kod 200 nic tu nie dowodzi.
    if "text/html" in ctype:
        print("  BLAD: serwer zwrocil text/html — to SPA-fallback, pliku klucza NIE MA.")
        return False
    if tresc != KLUCZ:
        print("  BLAD: plik istnieje, ale zawiera %r zamiast klucza." % tresc[:80])
        return False

    print("  OK — %s, %s, tresc zgodna z kluczem." % (status, ctype.split(";")[0]))
    return True


def adresy_z_sitemap(od_daty):
    if not os.path.exists(SITEMAP):
        sys.exit("Nie znaleziono %s" % SITEMAP)
    with open(SITEMAP, encoding="utf-8") as fh:
        xml = fh.read()
    wynik = []
    for blok in re.findall(r"<url>(.*?)</url>", xml, re.S):
        loc = re.search(r"<loc>\s*(.*?)\s*</loc>", blok, re.S)
        mod = re.search(r"<lastmod>\s*(.*?)\s*</lastmod>", blok, re.S)
        if not loc:
            continue
        if od_daty and (not mod or mod.group(1) < od_daty):
            continue
        wynik.append(loc.group(1))
    return wynik


def wyslij(adresy):
    ladunek = {
        "host": HOST,
        "key": KLUCZ,
        "keyLocation": LOKALIZACJA_KLUCZA,
        "urlList": adresy,
    }
    dane = json.dumps(ladunek, ensure_ascii=False).encode("utf-8")
    zadanie = urllib.request.Request(
        ENDPOINT,
        data=dane,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(zadanie, timeout=60) as odp:
            kod = odp.status
            tresc = odp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        kod = e.code
        tresc = e.read().decode("utf-8", "replace")
    except Exception as e:
        print("BLAD polaczenia: %s" % e)
        return 1

    print("\nOdpowiedz IndexNow: %s — %s" % (kod, KODY.get(kod, "kod nieudokumentowany")))
    if tresc.strip():
        print("Tresc odpowiedzi: %s" % tresc.strip()[:400])
    return 0 if kod in (200, 202) else 1


def main():
    p = argparse.ArgumentParser(description="Zgloszenie adresow do IndexNow")
    p.add_argument("adresy", nargs="*", help="konkretne adresy (domyslnie: z sitemap.xml)")
    p.add_argument("--sprawdz-klucz", action="store_true", help="tylko test pliku klucza")
    p.add_argument("--podglad", action="store_true", help="pokaz, co poszloby — nic nie wysylaj")
    p.add_argument("--wyslij", action="store_true", help="faktycznie wyslij")
    p.add_argument("--od", default=None, help="lastmod >= YYYY-MM-DD (domyslnie: dzis)")
    args = p.parse_args()

    if args.sprawdz_klucz:
        return 0 if sprawdz_klucz() else 1

    if not (args.podglad or args.wyslij):
        p.error("wybierz --podglad albo --wyslij (albo --sprawdz-klucz)")

    if args.adresy:
        adresy = args.adresy
        zrodlo = "z linii polecen"
    else:
        od = args.od or datetime.date.today().isoformat()
        adresy = adresy_z_sitemap(od)
        zrodlo = "z sitemap.xml, lastmod >= %s" % od

    obce = [a for a in adresy if not a.startswith(BAZA)]
    if obce:
        sys.exit("Adresy spoza %s (IndexNow odrzuci calosc, 422):\n  " % HOST + "\n  ".join(obce))

    if not adresy:
        print("Brak adresow do zgloszenia (%s). Nic nie wysylam." % zrodlo)
        return 0

    if len(adresy) > LIMIT_NA_ZADANIE:
        sys.exit("Za duzo adresow (%d, limit %d na zadanie)." % (len(adresy), LIMIT_NA_ZADANIE))

    print("Do zgloszenia: %d adresow (%s)" % (len(adresy), zrodlo))
    for a in adresy:
        print("  " + a)

    if args.podglad:
        print("\n[podglad] Nic nie wyslano. Powtorz z --wyslij, zeby zglosic.")
        return 0

    if not sprawdz_klucz():
        print("\nPrzerywam — bez dzialajacego pliku klucza zgloszenie dostanie 403.")
        return 1

    return wyslij(adresy)


if __name__ == "__main__":
    sys.exit(main())
