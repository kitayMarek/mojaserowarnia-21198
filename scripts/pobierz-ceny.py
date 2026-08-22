#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Odswiezenie cen ze stron produktow + wykrycie zmian.

DWA POWODY:
1. Ceny w bazie sa z 2026-07-05 i czesc sie rozjechala.
2. Powazniejsze: czesc sklepow ma w bazie cene NETTO, a czesc BRUTTO.
   ML u Artisera: baza 15,04 zl, strona 18,50 zl — a 15,04 x 1,23 = 18,50.
   Bez ujednolicenia porownanie cen miedzy sklepami jest bledne o 23%.
   Pobieramy cene BRUTTO, czyli te, ktora klient faktycznie placi.

CO ZAPISUJEMY: nowa cena, poprzednia (gdy sie zmienila) i data sprawdzenia —
zeby dalo sie pokazac "18,50 zl (bylo 15,04)". Zmieniajaca sie cena jest tez
argumentem, ze zapamietanej ceny nie da sie zacytowac; trzeba odeslac do zrodla.

SKAD CZYTAMY CENE (ustalone przez ogladniecie realnych stron 2026-08-22):
  * Artiser.pl, Wancykowka — schema.org Product/offers w JSON-LD, wartosc brutto
  * Serowar.pl, Lactic.pl, GAP Poland — ten sam silnik sklepu, etykieta "Cena:"
    UWAGA: na tych stronach pierwsza kwota w tekscie to koszyk ("suma: 0,00 zl"),
    dalej ida "Produkt dnia", "Cena regularna", "Najnizsza cena" i produkty
    polecane. Branie pierwszej kwoty daje 0,00 — pierwsza wersja tak robila.

UZYCIE:
  python scripts/pobierz-ceny.py --test        # test reguly na realnych fragmentach
  python scripts/pobierz-ceny.py --probka 10   # rozpoznanie
  python scripts/pobierz-ceny.py               # wszystkie
  python scripts/pobierz-ceny.py --uzupelnij   # dobierz brakujace
"""
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZRODLO = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")
WYJSCIE = os.path.join(ROOT, "scripts", "kultury-data", "ceny.txt")

UA = "Mozilla/5.0 (compatible; MojaSerowarnia/1.0; +https://mojaserowarnia.pl)"
ODSTEP = 0.8

CENA_ETYKIETA = re.compile(r"Cena:\s*(\d{1,4}(?:[.,]\d{2}))\s*(?:zł|PLN)", re.I)

# "Cena:" wystepuje tez w "Najnizsza cena:" i "Cena regularna:" — to sa ceny
# odniesienia, nie cena do zaplaty. Granicy slowa nie uzyjemy, bo przed etykieta
# stoi spacja, wiec odrzucamy po tresci bezposrednio poprzedzajacej.
CENA_ODNIESIENIA = re.compile(r"(?:niższ|nizsz|regularn|promocyjn|obniżk)\w*\s*$", re.I)

TAGI_DO_WYCIECIA = re.compile(r"<(?:script|style)[^>]*>.*?</(?:script|style)>", re.S | re.I)


def wczytaj_kultury():
    h = io.open(ZRODLO, encoding="utf-8").read()
    rek = []
    for blok in re.findall(r"\{(.*?)\}", h, re.S):
        d = dict(re.findall(r'(\w+):\s*"([^"]*)"', blok))
        if d.get("name") and d.get("productUrl", "").startswith("http"):
            m = re.search(r"([\d]+[.,]?\d*)", d.get("price", "") or "")
            d["cena_baza"] = float(m.group(1).replace(",", ".")) if m else None
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


def cena_z_jsonld(html):
    """Najpewniejsze zrodlo — schema.org Product/offers."""
    for blok in re.findall(r"<script[^>]*application/ld\+json[^>]*>(.*?)</script>", html, re.S):
        try:
            j = json.loads(blok)
        except Exception:
            continue
        for obj in (j if isinstance(j, list) else [j]):
            if not isinstance(obj, dict):
                continue
            oferty = obj.get("offers")
            if not oferty:
                continue
            for o in (oferty if isinstance(oferty, list) else [oferty]):
                if isinstance(o, dict) and o.get("price"):
                    try:
                        return float(str(o["price"]).replace(",", ".")), "json-ld"
                    except ValueError:
                        pass
    return None, None


def cena_z_tekstu(html):
    tekst = " ".join(
        re.sub(r"<[^>]+>", " ", TAGI_DO_WYCIECIA.sub(" ", html)).replace("&nbsp;", " ").split()
    )
    for m in CENA_ETYKIETA.finditer(tekst):
        if CENA_ODNIESIENIA.search(tekst[max(0, m.start() - 18): m.start()]):
            continue
        try:
            return float(m.group(1).replace(",", ".")), "etykieta"
        except ValueError:
            continue
    return None, None


def cena_ze_strony(html):
    cena, zrodlo = cena_z_jsonld(html)
    if cena is None:
        cena, zrodlo = cena_z_tekstu(html)
    return cena, zrodlo


# Fragmenty z REALNYCH stron 2026-08-22 — regula jest nieoczywista, wiec zostaje test.
TESTY = [
    ("ABY / Serowar", 20.00,
     "Koszyk: (pusty) do kasy suma: 0,00 zł Jak zrobić ser w domu 49,99 zł "
     "Cena regularna: 69,99 zł Najniższa cena: 54,90 zł Probiotyk Dostępność: "
     "duża ilość Wysyłka w: 24 godziny Cena: 20,00 zł"),
    ("ALPHA 10 / Lactic", 19.00,
     "Koszyk: (pusty) do kasy suma: 0,00 zł ALPHA 10 Wysyłka w: 24 godziny "
     "Cena: 19,00 zł Cena regularna: 19,00 zł Polecamy LAMBDA 12 17,00 zł"),
    ("EF LYO / GAP", 18.00,
     "Koszyk: (pusty) do kasy suma: 0,00 zł Produkt dnia MP 62 LYO 18,00 zł op. "
     "EF LYO Dostępność: duża ilość Cena: 18,00 zł zawiera 23.00% VAT"),
]


def testuj():
    ok = 0
    for nazwa, oczekiwane, tekst in TESTY:
        cena, _ = cena_z_tekstu("<html><body>" + tekst + "</body></html>")
        zgodne = cena == oczekiwane
        ok += zgodne
        print("  %-22s oczek. %7.2f  otrzym. %7s  %s"
              % (nazwa, oczekiwane, ("%.2f" % cena) if cena else "None", "OK " if zgodne else "BLAD"))
    print("\n  zdane: %d z %d" % (ok, len(TESTY)))
    return 0 if ok == len(TESTY) else 1


def main():
    if "--test" in sys.argv:
        return testuj()

    probka = 0
    if "--probka" in sys.argv:
        i = sys.argv.index("--probka")
        probka = int(sys.argv[i + 1]) if len(sys.argv) > i + 1 else 10

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
        print("UZUPELNIANIE: %d do dobrania (%d juz mamy)\n" % (len(rek), len(juz)))

    if probka:
        wg = {}
        for d in rek:
            wg.setdefault(d.get("shop", "?"), []).append(d)
        rek = [d for lista in wg.values() for d in lista[: max(1, probka // len(wg))]]
        print("PROBKA: %d stron\n" % len(rek))

    wyniki, bledy, zmiany, netto_brutto = [], 0, 0, 0
    for n, d in enumerate(rek, 1):
        try:
            html = pobierz(d["productUrl"])
        except Exception as e:
            print("  !! %-8s %-24s %s" % (type(e).__name__, d["name"][:24], str(e)[:32]))
            bledy += 1
            time.sleep(ODSTEP)
            continue

        cena, zrodlo = cena_ze_strony(html)
        stara = d.get("cena_baza")

        if cena is None:
            status = "BRAK CENY"
        elif stara is None:
            status = "nowa"
        elif abs(cena - stara) < 0.005:
            status = "bez zmian"
        else:
            zmiany += 1
            status = "ZMIANA %+.2f" % (cena - stara)
            if stara and abs(cena / stara - 1.23) < 0.01:
                status += " (netto->brutto)"
                netto_brutto += 1

        wyniki.append((d["name"], d.get("shop", ""), stara if stara else "",
                       cena if cena else "", zrodlo or "", status))
        print("  %-24s %-13s baza %-8s teraz %-8s %-9s %s"
              % (d["name"][:24], d.get("shop", "")[:13],
                 ("%.2f" % stara) if stara else "—",
                 ("%.2f" % cena) if cena else "—", zrodlo or "—", status))
        if n % 25 == 0:
            print("     ... %d z %d" % (n, len(rek)))
        time.sleep(ODSTEP)

    print("\nPODSUMOWANIE")
    print("  sprawdzonych      : %d" % len(rek))
    print("  z odczytana cena  : %d" % sum(1 for w in wyniki if w[3] != ""))
    print("  zmiany            : %d" % zmiany)
    print("  w tym netto->brutto: %d" % netto_brutto)
    print("  bledy             : %d" % bledy)

    if not probka:
        wszystkie = list(juz.values()) + [list(w) for w in wyniki]
        os.makedirs(os.path.dirname(WYJSCIE), exist_ok=True)
        with io.open(WYJSCIE, "w", encoding="utf-8", newline="") as f:
            f.write("# nazwa | sklep | cena w bazie | cena teraz | zrodlo | status\n")
            for w in sorted(wszystkie, key=lambda x: (str(x[1]), str(x[0]))):
                f.write(" | ".join(str(x).replace("|", "/") for x in w) + "\n")
        print("  w pliku           : %d" % len(wszystkie))
        print("\nZAPISANO %s" % os.path.relpath(WYJSCIE, ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
