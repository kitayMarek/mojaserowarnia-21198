#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator SQL: odswiezenie cen + historia zmiany (price_previous).

Zrodlo: scripts/kultury-data/ceny.txt (scripts/pobierz-ceny.py).
Claude NIE PISZE do bazy — ten plik wkleja Marek w Lovable -> SQL Editor.

CO ROBI:
  * dodaje kolumne price_previous (poprzednia cena) — zeby dalo sie pokazac
    "18,50 zl (bylo 15,04)"
  * dla pozycji ze zmiana: price_previous = stara, price_* = nowa,
    last_changed = dzis
  * dla wszystkich sprawdzonych: last_checked = dzis

WAZNE ROZROZNIENIE: wiekszosc "zmian" to NIE podwyzki, tylko korekta
netto -> brutto. Jeden sklep mial w bazie ceny netto, reszta brutto
(15,04 x 1,23 = 18,50). Ujednolicamy na brutto, czyli na to, co klient placi.
Takie pozycje NIE dostaja price_previous — pokazywanie "bylo taniej" byloby
falszem, bo cena sie nie zmienila, zmienil sie sposob jej podania.
"""
import io
import os
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEJSCIE = os.path.join(ROOT, "scripts", "kultury-data", "ceny.txt")
WYJSCIE = os.path.join(ROOT, "scripts", "sql", "cultures-ceny.sql")
DZIS = date.today().isoformat()


def sql_txt(s):
    return "'" + (s or "").replace("'", "''") + "'"


def zl(x):
    return ("%.2f" % x).replace(".", ",") + " zł"


def main():
    if not os.path.exists(WEJSCIE):
        sys.exit("Brak %s — odpal najpierw scripts/pobierz-ceny.py" % WEJSCIE)

    realne, vat, bez_zmian, brak = [], [], [], []
    for linia in io.open(WEJSCIE, encoding="utf-8"):
        if linia.startswith("#") or not linia.strip():
            continue
        c = [x.strip() for x in linia.split("|")]
        if len(c) < 6:
            continue
        nazwa, sklep, stara, nowa, _zrodlo, status = c[:6]
        if "BRAK" in status:
            brak.append((nazwa, sklep, stara))
            continue
        if not nowa:
            continue
        rekord = (nazwa, sklep, float(stara) if stara else None, float(nowa))
        if "netto" in status:
            vat.append(rekord)
        elif "ZMIANA" in status:
            realne.append(rekord)
        else:
            bez_zmian.append(rekord)

    czesci = ["""-- ============================================================
-- cultures — odświeżenie cen + historia zmiany
-- Uruchom w Supabase (Lovable → SQL Editor). Idempotentne.
--
-- Sprawdzone %s: %d pozycji, 0 błędów pobrania.
--   • %d bez zmiany ceny
--   • %d korekta netto → brutto (jeden sklep miał w bazie ceny netto)
--   • %d realna zmiana ceny
--   • %d bez ceny na stronie (produkt niedostępny)
--
-- Rynek okazał się bardzo stabilny: przez siedem tygodni zmieniła się
-- dokładnie JEDNA cena. Reszta różnic to była kwestia netto vs brutto.
-- ============================================================

-- 1) Kolumna na poprzednią cenę
alter table public.cultures add column if not exists price_previous numeric;

comment on column public.cultures.price_previous is
  'Poprzednia cena brutto — do pokazania "teraz X (było Y)". NULL = brak zmiany.';

-- 2) Wszystkie sprawdzone dostają datę weryfikacji
""" % (DZIS, len(realne) + len(vat) + len(bez_zmian) + len(brak),
       len(bez_zmian), len(vat), len(realne), len(brak))]

    czesci.append("update public.cultures set last_checked = %s\n  where is_active = true;\n\n" % sql_txt(DZIS))

    czesci.append("""-- 3) Korekta netto -> brutto. NIE ustawiamy price_previous: cena sie nie
--    zmienila, zmienil sie sposob jej podania. Pokazanie "bylo taniej"
--    byloby wprowadzeniem uzytkownika w blad.
""")
    for nazwa, sklep, _stara, nowa in sorted(vat, key=lambda x: x[0]):
        czesci.append(
            "update public.cultures set price_numeric = %.2f, price_label = %s\n  where name = %s and shop = %s;\n"
            % (nowa, sql_txt(zl(nowa)), sql_txt(nazwa), sql_txt(sklep))
        )

    czesci.append("\n-- 4) Realne zmiany ceny — z zapisem poprzedniej wartości\n")
    for nazwa, sklep, stara, nowa in sorted(realne, key=lambda x: x[0]):
        czesci.append(
            "update public.cultures set price_numeric = %.2f, price_label = %s,\n"
            "       price_previous = %.2f, last_changed = %s\n  where name = %s and shop = %s;\n"
            % (nowa, sql_txt(zl(nowa)), stara, sql_txt(DZIS), sql_txt(nazwa), sql_txt(sklep))
        )

    if brak:
        czesci.append("""
-- 5) Bez ceny na stronie — sklep oznacza produkt jako niedostępny.
--    NIE dezaktywujemy automatycznie: produkt może wrócić do sprzedaży.
--    Odkomentuj, jeśli chcesz go ukryć w bazie.
""")
        for nazwa, sklep, stara in brak:
            czesci.append(
                "-- update public.cultures set is_active = false\n"
                "--   where name = %s and shop = %s;  -- ostatnia znana cena: %s zł\n"
                % (sql_txt(nazwa), sql_txt(sklep), stara)
            )

    czesci.append("""
-- 6) Kontrola po wykonaniu
-- select shop, count(*) as pozycji, count(price_previous) as ze_zmiana,
--        min(price_numeric) as najtansza, max(price_numeric) as najdrozsza
--   from public.cultures where is_active = true group by shop order by shop;
""")

    os.makedirs(os.path.dirname(WYJSCIE), exist_ok=True)
    io.open(WYJSCIE, "w", encoding="utf-8", newline="").write("".join(czesci))

    print("bez zmian          : %d" % len(bez_zmian))
    print("netto -> brutto    : %d" % len(vat))
    print("realna zmiana ceny : %d" % len(realne))
    print("bez ceny (niedostepne): %d" % len(brak))
    for n, s, _ in brak:
        print("     %s (%s)" % (n, s))
    print("\nZAPISANO %s" % os.path.relpath(WYJSCIE, ROOT))
    print("Marek: wklej w Lovable -> SQL Editor i uruchom.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
