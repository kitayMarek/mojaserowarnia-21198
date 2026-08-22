#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pobranie POJEMNOSCI OPAKOWANIA i DAWKOWANIA ze stron produktow sklepow.

PO CO: baza podaje cene, ale nie podaje formatu opakowania. Bez tego cena nic
nie znaczy — 15 zl na 100 litrow i 15 zl na 1000 litrow to dwie rozne oferty.
W nazwach mamy format tylko w 2 pozycjach na 188.

TO SA DWIE ROZNE RZECZY i pierwsza wersja skryptu je myliła:
  * POJEMNOSC  — na ile litrow wystarczy TO opakowanie ("Opakowanie: na 100 L")
  * DAWKOWANIE — ile gramow na litr ("Dawkowanie: 2 g / 100 litrow mleka")
Z dawkowania NIE wynika pojemnosc: 2 g/100 L w opakowaniu 100 g to 5000 L.

PRZY KILKU WARIANTACH bierzemy NAJMNIEJSZY — bo cene w bazie tez zapisujemy
dla wariantu domowego (patrz gen-cultures-sql.py). Inaczej cena i pojemnosc
opisywalyby dwa rozne produkty.

GDY NIEJEDNOZNACZNE — zostawiamy puste. Luka jest lepsza niz zla liczba.

ZASADA: czytamy wylacznie publiczne strony produktow, do ktorych i tak linkujemy.
Odstep miedzy zapytaniami, zeby nie obciazac sklepow.

UZYCIE:
  python scripts/pobierz-pojemnosc.py --probka 15   # rozpoznanie formatow
  python scripts/pobierz-pojemnosc.py               # wszystkie, zapis do pliku
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
WYJSCIE = os.path.join(ROOT, "scripts", "kultury-data", "pojemnosc.txt")

UA = "Mozilla/5.0 (compatible; MojaSerowarnia/1.0; +https://mojaserowarnia.pl)"
ODSTEP = 0.7

# --- POJEMNOSC: jawne deklaracje opakowania, od najpewniejszej ---
# Wszystkie zwracaja liczbe litrow w grupie 1.
POJEMNOSC_PEWNE = [
    # "Opakowanie: na 100 L mleka", "Masa netto opakowania: na 5000 litrow mleka"
    re.compile(r"(?:opakowani\w+|masa\s+netto[^.]{0,30})[^.]{0,20}?\bna\s*(\d+)\s*(?:l\b|litr\w*)", re.I),
    # wariant w karcie produktu: "Wariant Na 100l mleka"
    re.compile(r"\bwariant\w*\b[^.]{0,30}?\bna\s*(\d+)\s*(?:l\b|litr\w*)", re.I),
    # w nazwie produktu: "ARTiVEG ME-30 ( na 5l )"
    re.compile(r"\(\s*na\s*(\d+)\s*(?:l\b|litr\w*)", re.I),
]
# Wszystkie wystapienia "na N litrow" — klasyfikacja nastepuje po tym, co stoi ZA liczba.
POJEMNOSC_WSZYSTKIE_LUZNO = re.compile(r"\bna\s*(\d+)\s*(?:l\b|litr\w*)", re.I)

# Co dyskwalifikuje liczbe jako pojemnosc opakowania — i z ktorej strony patrzec.
#
# MLEKO SUROWE: przymiotnik stoi ZA rzeczownikiem ("na 200 litrow mleka surowego"),
# a opisuje TO SAMO opakowanie przy innym surowcu. Szukamy wiec tylko za liczba.
SUROWE_PO = re.compile(r"surow", re.I)
# SMIETANKA: temat bywa ustawiony wczesniej w zdaniu ("W przypadku ukwaszania
# smietanki fiolka DL 1 przeznaczona jest na 50 litrow"), wiec patrzymy w OBIE strony.
SMIETANA = re.compile(r"smietan|śmietan", re.I)
#
# NAPOJ ROSLINNY NIE dyskwalifikuje: dla kultury weganskiej to jest wlasciwy
# surowiec, wiec "na 5 l napoju roslinnego" TO JEST pojemnosc opakowania.

# --- DAWKOWANIE: gramy na litry, osobne pole ---
DAWKA = re.compile(
    r"(\d+(?:[.,]\d+)?)\s*(?:g|gram\w*)\s*(?:/|na)\s*(\d+)\s*(?:l\b|litr\w*)", re.I
)

# Konteksty, ktore NIE opisuja mleka — nie wolno z nich czytac pojemnosci
OBCE = re.compile(r"smietan\w*|śmietan\w*|napoj\w*|roslinn\w*|roślinn\w*|surow\w*", re.I)


def wczytaj_kultury():
    h = io.open(ZRODLO, encoding="utf-8").read()
    rek = []
    for blok in re.findall(r"\{(.*?)\}", h, re.S):
        d = dict(re.findall(r'(\w+):\s*"([^"]*)"', blok))
        if d.get("name") and d.get("productUrl", "").startswith("http"):
            rek.append(d)
    return rek


def tekst_strony(url, prob=3):
    """Pobiera strone z ponowieniami.

    Pierwszy pelny przebieg dal 40 bledow na 188 stron — same SSL: UNEXPECTED_EOF
    i resety polaczenia, czyli przyciecie po stronie sklepu, a nie brak strony
    (te same adresy dzialaly w probce). Stad ponowienia z narastajacym odstepem.
    """
    ostatni = None
    for n in range(prob):
        try:
            zadanie = urllib.request.Request(
                url, headers={"User-Agent": UA, "Accept-Language": "pl,en", "Connection": "close"}
            )
            with urllib.request.urlopen(zadanie, timeout=30) as odp:
                surowe = odp.read()
            break
        except urllib.error.HTTPError:
            raise  # 404 i spolka nie maja sensu do ponawiania
        except Exception as e:
            ostatni = e
            if n < prob - 1:
                time.sleep(2.5 * (n + 1))
    else:
        raise ostatni
    try:
        html = surowe.decode("utf-8")
    except UnicodeDecodeError:
        html = surowe.decode("iso-8859-2", "replace")
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    tekst = re.sub(r"<[^>]+>", " ", html)
    tekst = tekst.replace("&nbsp;", " ")
    return " ".join(tekst.split())


def czysty_kontekst(tekst, m, przed=70, po=45):
    """Fragment wokol dopasowania — do oceny, czy chodzi o mleko."""
    return tekst[max(0, m.start() - przed): m.end() + po]


def znajdz_pojemnosc(tekst):
    """(litry, rodzaj, fragment) albo (None, powod, '').

    Reguła po rozpoznaniu realnych stron (2026-08-22):
    zbieramy WSZYSTKIE wystapienia "na N litrow" i klasyfikujemy kazde po tym,
    co stoi TUZ ZA liczba — bo to tam sklepy pisza, czego dotyczy:
      "na 50 litrow ... smietanki"        -> inny produkt, pomijamy
      "na 200 litrow mleka surowego"      -> to samo opakowanie, inny przelicznik
      "na 100 litrow mleka pasteryzowanego" -> wlasciwa pojemnosc
    Z pozostalych bierzemy NAJMNIEJSZA — spojnie z cena wariantu domowego.

    Wczesniejsza wersja sprawdzala cale otoczenie dopasowania i przez to
    odrzucala Lactic.pl, gdzie zdanie brzmi "na 100 litrow mleka pasteryzowanego
    lub 200 litrow mleka surowego" — slowo "surowego" jest w oknie, ale dotyczy
    innej liczby.
    """
    kandydaci, odrzucone = [], []
    for m in POJEMNOSC_WSZYSTKIE_LUZNO.finditer(tekst):
        ogon = tekst[m.end(): m.end() + 34]
        przed = tekst[max(0, m.start() - 60): m.start()]
        if SUROWE_PO.search(ogon) or SMIETANA.search(ogon) or SMIETANA.search(przed):
            odrzucone.append(int(m.group(1)))
            continue
        kandydaci.append((int(m.group(1)), czysty_kontekst(tekst, m)))

    if not kandydaci:
        powod = "tylko konteksty obce" if odrzucone else "brak deklaracji"
        return None, powod, ""

    litry, kontekst = min(kandydaci, key=lambda x: x[0])
    warianty = len({k[0] for k in kandydaci})
    rodzaj = "opakowanie"
    if warianty > 1:
        rodzaj += " (%d wariantów, brany najmniejszy)" % warianty
    return litry, rodzaj, kontekst


def znajdz_dawke(tekst):
    m = DAWKA.search(tekst)
    if not m:
        return None, ""
    return "%s g / %s L" % (m.group(1).replace(".", ","), m.group(2)), czysty_kontekst(tekst, m)


# Fragmenty zebrane z REALNYCH stron 2026-08-22. Reguła jest nieoczywista
# (śmietanka przed liczbą, mleko surowe za liczbą, napój roślinny jako
# prawidłowa pojemność dla kultur wegańskich), więc zostaje jako test.
TESTY = [
    ("ALPHA 10 / Lactic", 100,
     "Fiolka DL 1 przeznaczona jest na 100 litrów mleka pasteryzowanego lub 200 litrów mleka surowego, "
     "a fiolka DL 3.5 na 350 litrów mleka pasteryzowanego lub 700 litrów mleka surowego. "
     "W przypadku ukwaszania śmietanki fiolka DL 1 przeznaczona jest na 50 litrów, "
     "a fiolka DL 3.5 na 150 litrów pasteryzowanej śmietanki."),
    ("Choozit Alp / Wańczykówka", 500,
     "Masa netto opakowania: na 500 litrów mleka na 1000 litrów mleka Wysyłka w : 24 godziny"),
    ("ABY / Serowar", 100,
     "Opakowanie: na 100 L mleka (10 g) - fiolka na 1000 L mleka (100 g) - saszetka ilość szt."),
    ("ARTiVEG ME-30 / Artiser", 5,
     "Wegańskie kultury bakterii ARTiVEG ME-30 ( na 5l ) Dawka na 5 litrów napoju roślinnego lub 2,5kg bazy roślinnej"),
    ("Choozit ARN / Wańczykówka", 5000,
     "Masa netto opakowania: na 5000 litrów mleka Produkt chwilowo niedostępny"),
    ("ML / Artiser", 100,
     "Dawkowanie: 2g / 100 Litrów mleka. Wariant Na 100l mleka Na 1000l mleka Niedostępny 15,04 zł"),
]


def testuj():
    ok = 0
    for nazwa, oczekiwane, tekst in TESTY:
        litry, _, _ = znajdz_pojemnosc(tekst)
        zgodne = litry == oczekiwane
        ok += zgodne
        print("  %-28s oczek. %5s  otrzym. %5s  %s"
              % (nazwa, oczekiwane, litry, "OK " if zgodne else "BLAD"))
    print("\n  zdane: %d z %d" % (ok, len(TESTY)))
    return 0 if ok == len(TESTY) else 1


def main():
    if "--test" in sys.argv:
        return testuj()

    probka = 0
    if "--probka" in sys.argv:
        i = sys.argv.index("--probka")
        probka = int(sys.argv[i + 1]) if len(sys.argv) > i + 1 else 15

    rek = wczytaj_kultury()

    # --uzupelnij: dobiera tylko te pozycje, ktorych nie ma jeszcze w wyniku
    # (po pierwszym przebiegu zostaje 40 pozycji uciętych przez limity sklepow).
    juz = {}
    if "--uzupelnij" in sys.argv and os.path.exists(WYJSCIE):
        for linia in io.open(WYJSCIE, encoding="utf-8"):
            czesci = [c.strip() for c in linia.strip().split("|")]
            if len(czesci) >= 2 and not linia.startswith("#"):
                juz[(czesci[0], czesci[1])] = czesci
        rek = [d for d in rek if (d["name"], d.get("shop", "")) not in juz]
        print("UZUPELNIANIE: %d pozycji do dobrania (%d juz mamy)\n" % (len(rek), len(juz)))

    if probka:
        wg_sklepu = {}
        for d in rek:
            wg_sklepu.setdefault(d.get("shop", "?"), []).append(d)
        rek = [d for lista in wg_sklepu.values() for d in lista[: max(1, probka // len(wg_sklepu))]]
        print("PROBKA: %d stron z %d sklepow\n" % (len(rek), len(wg_sklepu)))

    wyniki, bledy = [], 0
    for n, d in enumerate(rek, 1):
        try:
            tekst = tekst_strony(d["productUrl"])
        except urllib.error.HTTPError as e:
            print("  !! HTTP %-3s %-26s" % (e.code, d["name"][:26]))
            bledy += 1
            time.sleep(ODSTEP)
            continue
        except Exception as e:
            print("  !! %-8s %-26s %s" % (type(e).__name__, d["name"][:26], str(e)[:35]))
            bledy += 1
            time.sleep(ODSTEP)
            continue

        litry, rodzaj, fragment = znajdz_pojemnosc(tekst)
        dawka, _ = znajdz_dawke(tekst)
        wyniki.append((d["name"], d.get("shop", ""), litry or "", dawka or "", rodzaj, d["productUrl"]))
        print("  %-26s %-13s %7s %-12s %s" % (
            d["name"][:26], d.get("shop", "")[:13],
            ("%s L" % litry) if litry else "—", dawka or "", rodzaj[:40]))

        if n % 25 == 0:
            print("     ... %d z %d" % (n, len(rek)))
        time.sleep(ODSTEP)

    z_pojemnoscia = sum(1 for w in wyniki if w[2])
    z_dawka = sum(1 for w in wyniki if w[3])
    print("\nPODSUMOWANIE")
    print("  sprawdzonych stron : %d" % len(rek))
    print("  z pojemnoscia      : %d" % z_pojemnoscia)
    print("  z dawkowaniem      : %d" % z_dawka)
    print("  bez pojemnosci     : %d" % (len(wyniki) - z_pojemnoscia))
    print("  bledy pobrania     : %d" % bledy)

    if not probka:
        # Przy uzupelnianiu dokladamy do juz zebranych, nie nadpisujemy calosci.
        wszystkie = list(juz.values()) + [list(w) for w in wyniki]
        os.makedirs(os.path.dirname(WYJSCIE), exist_ok=True)
        with io.open(WYJSCIE, "w", encoding="utf-8", newline="") as f:
            f.write("# nazwa | sklep | litry | dawkowanie | rodzaj dopasowania | url\n")
            for w in sorted(wszystkie, key=lambda x: (str(x[1]), str(x[0]))):
                f.write(" | ".join(str(x).replace("|", "/") for x in w) + "\n")
        print("  w pliku lacznie    : %d" % len(wszystkie))
        print("\nZAPISANO %s" % os.path.relpath(WYJSCIE, ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
