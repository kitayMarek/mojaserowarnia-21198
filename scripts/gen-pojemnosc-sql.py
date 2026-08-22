#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator SQL: kolumna pack_liters + dose_label i uzupelnienie wartosci.

DLACZEGO: baza podaje cene, ale nie mowi, na ile litrow starcza opakowanie.
Bez tego cena nie znaczy nic — 15 zl na 100 litrow i 15 zl na 1000 litrow to
dwie zupelnie rozne oferty. Zrodlo danych: scripts/pobierz-pojemnosc.py, ktory
czyta publiczne strony produktow, do ktorych i tak linkujemy.

Claude NIE PISZE do bazy — ten skrypt tylko przygotowuje plik SQL, ktory Marek
wkleja w Lovable → SQL Editor. Tak samo jak przy rebuildzie bazy w lipcu.

UZYCIE:
  python scripts/gen-pojemnosc-sql.py
Wynik: scripts/sql/cultures-pojemnosc.sql
"""
import io
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEJSCIE = os.path.join(ROOT, "scripts", "kultury-data", "pojemnosc.txt")
WYJSCIE = os.path.join(ROOT, "scripts", "sql", "cultures-pojemnosc.sql")


def sql_txt(s):
    return "'" + (s or "").replace("'", "''") + "'"


def main():
    if not os.path.exists(WEJSCIE):
        sys.exit("Brak %s — odpal najpierw scripts/pobierz-pojemnosc.py" % WEJSCIE)

    wiersze = []
    for linia in io.open(WEJSCIE, encoding="utf-8"):
        linia = linia.strip()
        if not linia or linia.startswith("#"):
            continue
        czesci = [c.strip() for c in linia.split("|")]
        if len(czesci) < 4:
            continue
        nazwa, sklep, litry, dawka = czesci[0], czesci[1], czesci[2], czesci[3]
        if not (litry or dawka):
            continue
        wiersze.append((nazwa, sklep, litry, dawka))

    z_litrami = sum(1 for w in wiersze if w[2])
    z_dawka = sum(1 for w in wiersze if w[3])

    czesci = []
    czesci.append("""-- ============================================================
-- cultures — pojemność opakowania (pack_liters) i dawkowanie (dose_label)
-- Uruchom w Supabase (Lovable → SQL Editor). Idempotentne.
--
-- PO CO: baza podawała cenę bez formatu opakowania. Cena 15 zł nic nie znaczy,
-- dopóki nie wiadomo, czy opakowanie starcza na 100 czy na 1000 litrów mleka.
--
-- ŹRÓDŁO: publiczne strony produktów sklepów (scripts/pobierz-pojemnosc.py,
-- odczyt %s). Przy kilku wariantach opakowania brany jest NAJMNIEJSZY —
-- spójnie z zapisaną ceną, która też dotyczy wariantu domowego.
--
-- CZEGO TU NIE MA: pozycje, dla których sklep nie deklaruje pojemności,
-- zostają puste. Zgadywanie byłoby gorsze niż luka.
-- ============================================================

-- 1) Kolumny (bezpieczne przy powtórnym uruchomieniu)
alter table public.cultures add column if not exists pack_liters integer;
alter table public.cultures add column if not exists dose_label text;

comment on column public.cultures.pack_liters is
  'Na ile litrów mleka starcza opakowanie (wariant domowy = najmniejszy). NULL = sklep nie deklaruje.';
comment on column public.cultures.dose_label is
  'Dawkowanie podane przez sklep, np. "2 g / 100 L". NULL = brak deklaracji.';

-- 2) Wartości — dopasowanie po (name, shop), bo sama nazwa nie jest unikalna
""" % os.path.basename(WEJSCIE))

    for nazwa, sklep, litry, dawka in wiersze:
        ustaw = []
        if litry:
            ustaw.append("pack_liters = %s" % int(litry))
        if dawka:
            ustaw.append("dose_label = %s" % sql_txt(dawka))
        czesci.append(
            "update public.cultures set %s\n  where name = %s and shop = %s;\n"
            % (", ".join(ustaw), sql_txt(nazwa), sql_txt(sklep))
        )

    czesci.append("""
-- 3) Kontrola po wykonaniu — ile pozycji ma teraz pojemność
-- select shop,
--        count(*) as wszystkie,
--        count(pack_liters) as z_pojemnoscia,
--        min(pack_liters) as najmniejsze,
--        max(pack_liters) as najwieksze
--   from public.cultures where is_active = true group by shop order by shop;
""")

    os.makedirs(os.path.dirname(WYJSCIE), exist_ok=True)
    io.open(WYJSCIE, "w", encoding="utf-8", newline="").write("".join(czesci))

    print("Wierszy do aktualizacji : %d" % len(wiersze))
    print("  z pojemnoscia         : %d" % z_litrami)
    print("  z dawkowaniem         : %d" % z_dawka)
    print("\nZAPISANO %s" % os.path.relpath(WYJSCIE, ROOT))
    print("Marek: wklej ten plik w Lovable -> SQL Editor i uruchom.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
