#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Synchronizacja liczby kultur w opisach serwisu.

DLACZEGO TO ISTNIEJE:
Liczba kultur byla wpisana recznie w kilkunastu miejscach i rozjechala sie na
CZTERY rozne wartosci: 145+, 147, 180+ i 188. Google AI Overview zacytowal nas
2026-08-21 jako "ponad 180 rodzajow kultur" — czyli wzial wersje ZANIZONA.
Model nie liczy wierszy w tabeli, tylko czyta liczbe, ktora sami podajemy.
Opis samego siebie jest wiec dzwignia, a nie ozdobnikiem.

Zrodlo prawdy: src/data/culturesDataComplete.ts (generowany z Supabase przez
gen-cultures-ts.py). NIE zywe Supabase — dane do statyk bierzemy ze zrodel w repo.

UZYCIE:
  python scripts/sync-liczby.py           # PODGLAD — nic nie zapisuje
  python scripts/sync-liczby.py --apply   # zapisuje zmiany

Skrypt jest idempotentny — powtorne uruchomienie nic nie zmienia.
Odpal po kazdej zmianie bazy kultur, obok gen-cultures-ts.py i gen-baza.py.
"""
import io
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZRODLO = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")

# Pliki, w ktorych liczba kultur wystepuje w opisach.
# kultury/baza.html jest GENEROWANY (gen-baza.py) i ma liczbe poprawna — pomijamy.
PLIKI = [
    "index.html",
    "public/llms.txt",
    "public/kultury/index.html",
    "src/pages/BazaKultur.tsx",
]

# Liczby opisujace PODZBIOR ("21 kultur jogurtowych") sa poprawne i nie wolno
# ich ruszac.
#
# Pierwsza wersja rozpoznawala je po samej nazwie typu za slowem "kultur" — i byla
# ZA SZEROKA: tytul "180+ Kultur Mezofilnych i Termofilnych" opisuje CALOSC, a nie
# podzbior, wiec zostawal niepoprawiony. Rozstrzyga dopiero zgodnosc LICZBY z
# faktyczna licznoscia danego typu: 21 == liczba kultur jogurtowych, wiec to
# podzbior; 180 != 36 (mezofilne), wiec to opis calosci z wyliczeniem typow.
TYPY_SLOWA = {
    "jogurtow": "jogurtowe", "mezofiln": "mezofilne", "termofiln": "termofilne",
    "plesniow": "pleśniowe", "pleśniow": "pleśniowe", "kefirow": "kefir",
    "propionow": "propionowe", "aromatyzuj": "aromatyzujące",
    "probiotyczn": "probiotyczne", "ochronn": "ochronne",
    "weganskich": "wege", "wegańskich": "wege",
}
POCZATEK_TYPU = re.compile(
    r"^\s*(?:bakteryjnych\s+i\s+ple[sś]ni\s+)?(" + "|".join(TYPY_SLOWA) + r")", re.I
)


def jest_podzbiorem(liczba, ogon, typy):
    """True, gdy liczba faktycznie odpowiada licznosci typu podanego zaraz po niej."""
    m = POCZATEK_TYPU.match(ogon)
    if not m:
        return False
    klucz = TYPY_SLOWA.get(m.group(1).lower())
    return klucz is not None and typy.get(klucz) == liczba

# Wzorce: (regex, funkcja budujaca zamiennik z aktualna liczba)
WZORCE = [
    # "145+ kultur", "180+ Kultur", "188 kultur" — takze z wielkiej litery
    (re.compile(r"\b\d{2,4}\s*\+?\s*(?=kultur)", re.I), lambda n: "%d " % n),
    # "ponad 145 kultur", "ponad 180 rodzajow kultur"
    (re.compile(r"(?<=ponad )\d{2,4}(?=\s+(?:kultur|rodzaj))", re.I), lambda n: str(n)),
    # "wszystkich 147 kultur" ORAZ "lista wszystkich 147 (statyczna)" — po liczbie
    # nie zawsze stoi slowo "kultur", wiec nie wymagamy go PO; zamiast tego
    # wymagamy slowa "kultur" PRZED (sprawdzane w zamien()).
    (re.compile(r"(?<=wszystkich )\d{2,4}\b", re.I), lambda n: str(n)),
    # "Baza kultur (180+ pozycji)" — slowo "pozycji" zamiast "kultur".
    # UWAGA: samo "pozycji" nie wystarcza, bo w llms.txt jest tez
    # ">=180 mg/L chymozyny" i inne liczby techniczne. Dlatego przy tym wzorcu
    # wymagamy slowa "kultur" w tekscie POPRZEDZAJACYM (sprawdzane w zamien()).
    (re.compile(r"\b\d{2,4}\s*\+?\s*(?=pozycj)", re.I), lambda n: "%d " % n),
]

# Wzorce wymagajace slowa "kultur" w tekscie POPRZEDZAJACYM (indeksy w WZORCE).
# Chroni przed zlapaniem liczb technicznych w rodzaju ">=180 mg/L chymozyny".
WYMAGA_KONTEKSTU = {2, 3}


def policz():
    """Liczba aktywnych kultur i rozklad typow ze zrodla w repo."""
    if not os.path.exists(ZRODLO):
        sys.exit("Brak zrodla: %s (odpal najpierw gen-cultures-ts.py)" % ZRODLO)
    h = io.open(ZRODLO, encoding="utf-8").read()
    nazwy = re.findall(r"^\s*name:\s*\"", h, re.M)
    typy = Counter(re.findall(r"^\s*type:\s*\"([^\"]+)\"", h, re.M))
    return len(nazwy), typy


def main():
    zapis = "--apply" in sys.argv
    n, typy = policz()

    print("Zrodlo: %s" % os.path.relpath(ZRODLO, ROOT))
    print("Kultur: %d\n" % n)
    print("Rozklad typow (do opisu struktury):")
    for t, ile in typy.most_common():
        print("  %-24s %3d" % (t, ile))
    print()

    lacznie = 0
    for wzgl in PLIKI:
        p = os.path.join(ROOT, wzgl)
        if not os.path.exists(p):
            print("  POMINIETO (brak pliku): %s" % wzgl)
            continue
        h = io.open(p, encoding="utf-8").read()
        oryginal = h
        zmiany = []
        for idx, (rx, buduj) in enumerate(WZORCE):
            def zamien(m, idx=idx):
                if idx in WYMAGA_KONTEKSTU:
                    poprzedzajace = h[max(0, m.start() - 40):m.start()]
                    if not re.search(r"kultur", poprzedzajace, re.I):
                        return m.group(0)
                # Podzbior? Zostaw. Patrzymy na tekst tuz PO dopasowaniu,
                # pomijajac slowo "kultur"/"rodzajow", ktore jest czescia frazy.
                ogon = h[m.end():m.end() + 60]
                ogon = re.sub(r"^\s*(?:kultur\w*|rodzaj\w*)\s*", "", ogon, flags=re.I)
                trafiona = int(re.search(r"\d+", m.group(0)).group(0))
                if jest_podzbiorem(trafiona, ogon, typy):
                    return m.group(0)
                stare = m.group(0).strip()
                nowe = buduj(n).strip()
                if stare != nowe:
                    zmiany.append((stare, nowe))
                return buduj(n)
            h = rx.sub(zamien, h)

        if h != oryginal:
            lacznie += len(zmiany)
            szczegoly = ", ".join("%s->%s" % (a, b) for a, b in zmiany[:6])
            print("  %-32s %d popr.  (%s)" % (wzgl, len(zmiany), szczegoly))
            if zapis:
                io.open(p, "w", encoding="utf-8", newline="").write(h)
        else:
            print("  %-32s bez zmian" % wzgl)

    print()
    if zapis:
        print("ZAPISANO — poprawek: %d" % lacznie)
    else:
        print("[podglad] poprawek do wprowadzenia: %d. Powtorz z --apply." % lacznie)
    return 0


if __name__ == "__main__":
    sys.exit(main())
