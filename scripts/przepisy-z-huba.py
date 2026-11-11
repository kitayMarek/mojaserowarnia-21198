#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Akty prawne na stronach RHD i MOL z modulu Przepisy huba Dane Rolne.

SKAD: https://danerolne.com/przepisy/dane/przepisy.json (hub odswieza go codziennie
z API ELI Kancelarii Sejmu). Serowarnia nie wpisuje numerow Dz.U. aktow z tej listy
recznie: czyta je z huba (ARCHITEKTURA.md huba, zasady 4 i 7).

CO ROBI:
  1. zapisuje src/data/przepisyHuba.ts, kopie GENEROWANA z data pobrania
     (zasada 4 huba: kopie robi skrypt, nikt jej nie poprawia). React pokazuje ja
     od razu, a potem podmienia na dane pobrane z huba na zywo;
  2. w mirrorach public/ wypelnia bloki miedzy znacznikami
       <!-- PRZEPISY-HUBA: klucz,klucz -->  ...  <!-- /PRZEPISY-HUBA -->
     bo boty czytaja mirrory bez JavaScriptu.

Pola "ogloszono" przy zmianach NIE pokazujemy: 11.11.2026 hub mial tam zle daty
(np. Dz.U. 2026 poz. 1123: 2027-09-01, a w API Sejmu ogloszenie 2026-08-25).
"wchodzi_w_zycie" zgadzalo sie z API. Hub poprawil daty (commit ebd8098) i dodal pole
"zmienia_ten_akt_od"; gdy jest, pokazujemy je zamiast daty wejscia w zycie.

Uruchom przed wdrozeniem zmian na stronach prawa:  python scripts/przepisy-z-huba.py
"""
import html
import io
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADRES = "https://danerolne.com/przepisy/dane/przepisy.json"
STRONA_HUBA = "https://danerolne.com/przepisy"
POMOC = "https://www.gov.pl/web/nieodplatna-pomoc"
OUT_TS = os.path.join(ROOT, "src", "data", "przepisyHuba.ts")
MIRRORY = [
    "public/prawo/rhd.html",
    "public/prawo/rhd/dokumenty.html",
    "public/prawo/mol.html",
    "public/prawo/mol/dokumenty.html",
]
# Akty, ktore Serowarnia pokazuje albo moze pokazac. Klucz, ktorego hub jeszcze
# nie ma (np. produkty-zwierzece), jest pomijany bez bledu; blad jest tylko wtedy,
# gdy brakuje klucza uzytego w znaczniku mirrora.
KLUCZE = [
    "bezpieczenstwo-zywnosci",
    "rhd-limity",
    "sprzedaz-bezposrednia",
    "mol",
    "produkty-zwierzece",
    "jakosc-handlowa",
    "rolnictwo-ekologiczne",
]
ZNACZNIK = re.compile(r"<!-- PRZEPISY-HUBA: ([a-z0-9,\-]+) -->.*?<!-- /PRZEPISY-HUBA -->", re.S)
MIESIACE = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca",
            "sierpnia", "września", "października", "listopada", "grudnia"]


def data_pl(iso):
    r, m, d = iso[:10].split("-")
    return "%d %s %s" % (int(d), MIESIACE[int(m) - 1], r)


def pobierz():
    # Polaczenie z hubem bywa zrywane przy pierwszej probie (11.11.2026 dwa razy na trzy),
    # wiec probujemy do trzech razy.
    zad = urllib.request.Request(ADRES, headers={"User-Agent": "mojaserowarnia-przepisy-z-huba"})
    for proba in range(3):
        try:
            with urllib.request.urlopen(zad, timeout=60) as odp:
                return json.loads(odp.read().decode("utf-8"))
        except (OSError, ValueError) as blad:
            print("proba %d nieudana: %s" % (proba + 1, blad))
    raise SystemExit("Nie udalo sie pobrac %s" % ADRES)


def skroc(akt):
    tj = akt.get("tekst_jednolity") or None
    return {
        "klucz": akt["klucz"],
        "krotko": akt["krotko"],
        "tytul": akt["tytul"],
        "dziennik": akt["dziennik"],
        "obowiazuje": bool(akt.get("obowiazuje")),
        "tekst_jednolity": {"dziennik": tj["dziennik"], "isap": tj["isap"]} if tj else None,
        "zmiany_po_tekscie_jednolitym": [
            {"dziennik": z["dziennik"], "tytul": z.get("tytul", ""),
             "zmienia_ten_akt_od": z.get("zmienia_ten_akt_od"),
             "wchodzi_w_zycie": z.get("wchodzi_w_zycie"), "isap": z.get("isap")}
            for z in (akt.get("zmiany_po_tekscie_jednolitym") or [])
        ],
        "isap": (akt.get("linki") or {}).get("isap"),
        "sprawdzono": akt.get("sprawdzono"),
    }


def blok_html(klucze, akty):
    e = html.escape
    wiersze = []
    for k in klucze:
        a = akty[k]
        tekst = '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a> (%s)' % (
            e(a["isap"]), e(a["tytul"]), e(a["dziennik"]))
        tekst += ", obowiązuje." if a["obowiazuje"] else ", <strong>nie obowiązuje</strong>."
        if a["tekst_jednolity"]:
            tj = a["tekst_jednolity"]
            tekst += ' Tekst jednolity: <a href="%s" target="_blank" rel="noopener noreferrer">%s</a>.' % (
                e(tj["isap"]), e(tj["dziennik"]))
        zmiany = a["zmiany_po_tekscie_jednolitym"]
        if zmiany:
            czesci = []
            for z in zmiany:
                cz = '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>' % (e(z["isap"]), e(z["dziennik"]))
                if z.get("zmienia_ten_akt_od"):
                    cz += " (zmienia ten akt od %s)" % data_pl(z["zmienia_ten_akt_od"])
                elif z.get("wchodzi_w_zycie"):
                    cz += " (wchodzi w życie %s)" % data_pl(z["wchodzi_w_zycie"])
                czesci.append(cz)
            tekst += " Zmiany, których nie ma jeszcze w tekście jednolitym: %s." % ", ".join(czesci)
        tekst += ' <a href="%s#%s" target="_blank" rel="noopener noreferrer">Ten akt w Dane Rolne</a>.' % (
            STRONA_HUBA, e(k))
        wiersze.append("    <li>%s</li>" % tekst)
    sprawdzono = min(akty[k]["sprawdzono"] for k in klucze)
    return (
        "<!-- PRZEPISY-HUBA: %s -->\n"
        "  <ul class=\"przepisy-huba\">\n%s\n  </ul>\n"
        "  <p class=\"note\">Numery i stan aktów: <a href=\"%s\" target=\"_blank\" rel=\"noopener noreferrer\">Przepisy Dane Rolne</a>, "
        "z API Kancelarii Sejmu, sprawdzone %s. To informacja, nie porada prawna. Wiążący jest tekst ogłoszony w Dzienniku Ustaw. "
        "W sprawie indywidualnej pomogą: <a href=\"%s\" target=\"_blank\" rel=\"noopener noreferrer\">nieodpłatna pomoc prawna</a> w powiecie, "
        "ośrodek doradztwa rolniczego albo izba rolnicza.</p>\n"
        "  <!-- /PRZEPISY-HUBA -->"
    ) % (",".join(klucze), "\n".join(wiersze), STRONA_HUBA, data_pl(sprawdzono), POMOC)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    dane = pobierz()
    if dane.get("bledy"):
        print("Uwaga, hub zglasza bledy:", dane["bledy"])
    wszystkie = {a["klucz"]: a for a in dane.get("akty", [])}
    akty = {k: skroc(wszystkie[k]) for k in KLUCZE if k in wszystkie}
    if "mol" not in akty or "rhd-limity" not in akty:
        raise SystemExit("W danych huba nie ma kluczy mol albo rhd-limity, nic nie zapisuje.")

    # 1. kopia dla Reacta
    kopia = {
        "zrodlo": ADRES,
        "strona": STRONA_HUBA,
        "wygenerowano_w_hubie": dane.get("wygenerowano"),
        "akty": [akty[k] for k in KLUCZE if k in akty],
    }
    ts = (
        "// PLIK GENEROWANY przez scripts/przepisy-z-huba.py, nie edytuj recznie.\n"
        "// Kopia danych modulu Przepisy huba Dane Rolne (zasada 4 huba: kopia generowana, z data).\n"
        "// Komponent PodstawaPrawna pokazuje ja od razu, a potem pobiera dane z huba na zywo.\n"
        "export const przepisyHuba = %s as const;\n"
    ) % json.dumps(kopia, ensure_ascii=False, indent=2)
    with io.open(OUT_TS, "w", encoding="utf-8", newline="\n") as f:
        f.write(ts)
    print("zapisano", os.path.relpath(OUT_TS, ROOT), "(%d aktow)" % len(kopia["akty"]))

    # 2. mirrory
    for sciezka in MIRRORY:
        pelna = os.path.join(ROOT, sciezka)
        with io.open(pelna, encoding="utf-8") as f:
            tekst = f.read()
        bloki = ZNACZNIK.findall(tekst)
        if not bloki:
            print("brak znacznika:", sciezka)
            continue

        def podmien(m):
            klucze = m.group(1).split(",")
            brak = [k for k in klucze if k not in akty]
            if brak:
                raise SystemExit("%s: hub nie ma kluczy %s" % (sciezka, brak))
            return blok_html(klucze, akty)

        nowy = ZNACZNIK.sub(podmien, tekst)
        if nowy != tekst:
            with io.open(pelna, "w", encoding="utf-8", newline="") as f:
                f.write(nowy)
            print("zaktualizowano", sciezka, "(%d blok)" % len(bloki))
        else:
            print("bez zmian", sciezka)


if __name__ == "__main__":
    main()
