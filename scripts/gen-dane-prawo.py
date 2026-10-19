#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Plik danych o RHD dla programow i asystentow AI: public/dane/prawo-rhd.json.

PO CO TO ISTNIEJE: krok 0 projektu "witryna + magazyn" (19.10.2026). Zanim
zbudujemy dostep za kluczem (MCP/API), sprawdzamy, czy ktokolwiek go chce.
Plik jest otwarty, mierzony przez licznik botow (PLIKI_MIERZONE w worker/index.js)
i ma noindex (public/_headers). Prog do 30.11.2026: co najmniej 10 pobran przez
agentow na prosbe czlowieka albo 3 wiadomosci z realna potrzeba. Projekt:
side-session-notes/local_7dbc5556-1ce6-4a37-a441-b3cd587f9509/witryna-magazyn-projekt.md

JEDNO ZRODLO LICZB: nic tu nie jest wpisane recznie. Odpowiedzi biore z
data/pytania/prawo-rhd.json (to samo zrodlo, z ktorego powstaje panel pytan
w obu warstwach), a progi i terminy z tabeli "Najwazniejsze liczby i terminy"
w mirrorze public/prawo/rhd.html. Zmiana w artykule + ponowne uruchomienie
tego skryptu = zmiana w pliku danych. Inaczej rozjada sie tak jak FAQ na
/prawo/rhd (React 11 pytan, mirror 12, wspolnych 6).

Data "stan_prawny_na" to data ostatniej zmiany tresci artykulu (akapit
"Ostatnia zmiana tresci" w mirrorze), a nie data uruchomienia skryptu, wiec
ponowne uruchomienie bez zmian w artykule nie zmienia pliku.

Uruchom:  python scripts/gen-dane-prawo.py
"""
import html
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTANIA = os.path.join(ROOT, "data", "pytania", "prawo-rhd.json")
MIRROR = os.path.join(ROOT, "public", "prawo", "rhd.html")
OUT = os.path.join(ROOT, "public", "dane", "prawo-rhd.json")

STRONA = "https://mojaserowarnia.pl/prawo/rhd"


def czysty(fragment):
    tekst = re.sub(r"<[^>]+>", "", fragment)
    return re.sub(r"\s+", " ", html.unescape(tekst)).strip()


def progi(mirror):
    blok = re.search(r"<h2>Najważniejsze liczby i terminy</h2>\s*<table>(.*?)</table>", mirror, re.S)
    if not blok:
        raise SystemExit("Nie ma tabeli 'Najważniejsze liczby i terminy' w mirrorze /prawo/rhd")
    wiersze = []
    for tr in re.findall(r"<tr>(.*?)</tr>", re.search(r"<tbody>(.*?)</tbody>", blok.group(1), re.S).group(1), re.S):
        komorki = [czysty(td) for td in re.findall(r"<td>(.*?)</td>", tr, re.S)]
        if len(komorki) != 3:
            raise SystemExit("Wiersz tabeli ma %d komorek zamiast 3: %r" % (len(komorki), tr[:80]))
        co, wartosc, uwagi = komorki
        wiersz = {"co": co, "wartosc": wartosc}
        if uwagi:
            wiersz["uwagi"] = uwagi
        wiersze.append(wiersz)
    return wiersze


def data_tresci(mirror):
    m = re.search(r'<p class="aktualizacja">Ostatnia zmiana treści: <time datetime="(\d{4}-\d{2}-\d{2})">', mirror)
    if not m:
        raise SystemExit("Nie ma daty 'Ostatnia zmiana treści' w mirrorze /prawo/rhd")
    return m.group(1)


def main():
    dane = json.load(io.open(PYTANIA, encoding="utf-8"))
    mirror = io.open(MIRROR, encoding="utf-8").read()
    stan = data_tresci(mirror)

    pytania = []
    for p in sorted((p for p in dane["pytania"] if p.get("odpowiedz")), key=lambda p: p.get("kolejnosc") or 99):
        wpis = {"pytanie": p["pytanie"], "odpowiedz": p["odpowiedz"]}
        if p.get("kotwica"):
            wpis["url"] = "%s#%s" % (STRONA, p["kotwica"])
        pytania.append(wpis)

    plik = {
        "nazwa": "Rolniczy handel detaliczny (RHD): najczęstsze pytania, progi i terminy",
        "opis": "Dane z artykułu Moja Serowarnia o RHD, przygotowane do odczytu przez programy i asystentów AI. "
                "Ta sama treść co na stronie, w uporządkowanej formie.",
        "strona": STRONA,
        "stan_prawny_na": stan,
        "zweryfikowano": stan,
        "uwaga": "Informacja, nie porada prawna. Przepisy się zmieniają: przed rozpoczęciem sprzedaży sprawdź "
                 "aktualne wymagania u powiatowego lekarza weterynarii lub w Sanepidzie i w urzędzie skarbowym.",
        "licencja": "CC BY 4.0",
        "licencja_url": "https://creativecommons.org/licenses/by/4.0/deed.pl",
        "cytuj_jako": "Moja Serowarnia, „Rolniczy handel detaliczny (RHD)”, %s" % STRONA,
        "progi_i_terminy": progi(mirror),
        "pytania": pytania,
        "dostep_dla_asystentow": {
            "stan": "w przygotowaniu",
            "opis": "Przygotowujemy dostęp dla asystentów AI z aktualnymi progami RHD i MOL oraz cenami kultur. "
                    "Chcesz z niego korzystać? Napisz, do czego.",
            "kontakt": "https://mojaserowarnia.pl/kontakt",
        },
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    tekst = json.dumps(plik, ensure_ascii=False, indent=2) + "\n"
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(tekst)
    print("OK: %s (%d progow, %d pytan, stan na %s, %d B)"
          % (os.path.relpath(OUT, ROOT), len(plik["progi_i_terminy"]), len(pytania), stan, len(tekst.encode("utf-8"))))


if __name__ == "__main__":
    main()
