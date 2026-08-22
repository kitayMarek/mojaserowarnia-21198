#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator SQL: producent (manufacturer) i proporcje szczepow (strain_ratio).

Zrodlo: scripts/kultury-data/producent.txt (scripts/pobierz-producenta.py).
Claude NIE PISZE do bazy — plik wkleja Marek w Lovable -> SQL Editor.

CO WNOSI:
* PRODUCENT — 185 z 188 pozycji deklaruje go w danych strukturalnych strony
  produktu. Wczesniej pisalismy "96 z 188 bez sladu producenta", ale liczylismy
  tylko nazwe i sklad. Karta produktu ma to prawie zawsze.
* PROPORCJE — 5 pozycji podaje stosunek szczepow. Malo, ale kluczowe: LAMBDA 3
  ma 50:50, a LAMBDA 6/7/8/9 maja 80:20 przy IDENTYCZNYM skladzie gatunkowym
  w naszej bazie. To dowod, ze sam sklad nie wystarcza do uznania kultur za
  zamienniki.

NORMALIZACJA: "Micromilk" i "microMilk" to ta sama firma zapisana roznie przez
dwa sklepy — ujednolicamy na "microMilk".

UZYCIE: python scripts/gen-producent-sql.py
"""
import io
import os
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEJSCIE = os.path.join(ROOT, "scripts", "kultury-data", "producent.txt")
WYJSCIE = os.path.join(ROOT, "scripts", "sql", "cultures-producent.sql")

# Ten sam podmiot zapisany roznie przez rozne sklepy.
UJEDNOLICENIE = {
    "micromilk": "microMilk",
    "danisco": "DANISCO (IFF)",
    "serowar": "Serowar.pl (marka własna)",
    "sklep dla serowarów wańczykówka": "Wańczykówka (marka własna)",
    "artiser": "Artiser (marka własna)",
    "gap food aditives": "GAP Poland (marka własna)",
}


def norm(nazwa):
    return UJEDNOLICENIE.get(nazwa.strip().lower(), nazwa.strip())


def sql_txt(s):
    return "'" + (s or "").replace("'", "''") + "'"


def main():
    if not os.path.exists(WEJSCIE):
        sys.exit("Brak %s — odpal najpierw scripts/pobierz-producenta.py" % WEJSCIE)

    wiersze = []
    for linia in io.open(WEJSCIE, encoding="utf-8"):
        if linia.startswith("#") or not linia.strip():
            continue
        c = [x.strip() for x in linia.split("|")]
        if len(c) < 4:
            continue
        nazwa, sklep, proporcje, producent = c[0], c[1], c[2], c[3]
        if producent or proporcje:
            wiersze.append((nazwa, sklep, proporcje, norm(producent) if producent else ""))

    z_prod = sum(1 for w in wiersze if w[3])
    z_prop = sum(1 for w in wiersze if w[2])
    rozklad = Counter(w[3] for w in wiersze if w[3])

    czesci = ["""-- ============================================================
-- cultures — producent i proporcje szczepów
-- Uruchom w Supabase (Lovable → SQL Editor). Idempotentne.
--
-- ŹRÓDŁO: dane strukturalne (meta itemprop="brand" / JSON-LD) na stronach
-- produktów. NIE szukamy nazw marek w treści strony — Lactic.pl ma w bocznym
-- pasku każdej podstrony box „Katalog Coquard", więc taki odczyt przypisałby
-- Coquardowi produkty, które wcale nie muszą być jego.
--
-- POKRYCIE: %d z %d pozycji ma producenta, %d ma proporcje szczepów.
--
-- CO DEKLARUJĄ SKLEPY:
""" % (z_prod, len(wiersze), z_prop)]

    for p, ile in rozklad.most_common():
        czesci.append("--   %-32s %3d\n" % (p, ile))

    czesci.append("""--
-- UWAGA INTERPRETACYJNA: „producent" to deklaracja sklepu, nie nasza weryfikacja.
-- Cztery pozycje z pięciu deklarują same siebie (marka własna) — to zgodne
-- z tym, co opisujemy: sklep sprzedaje pod swoim oznaczeniem preparat, którego
-- nie wytworzył.
-- ============================================================

alter table public.cultures add column if not exists manufacturer text;
alter table public.cultures add column if not exists strain_ratio text;

comment on column public.cultures.manufacturer is
  'Producent deklarowany w danych strukturalnych strony produktu. NULL = sklep nie podaje.';
comment on column public.cultures.strain_ratio is
  'Proporcja szczepów podana przez sklep, np. „80:20". Podaje ją 1 sklep z 5.';

""")

    for nazwa, sklep, proporcje, producent in sorted(wiersze, key=lambda x: (x[1], x[0])):
        ustaw = []
        if producent:
            ustaw.append("manufacturer = %s" % sql_txt(producent))
        if proporcje:
            ustaw.append("strain_ratio = %s" % sql_txt(proporcje))
        czesci.append(
            "update public.cultures set %s\n  where name = %s and shop = %s;\n"
            % (", ".join(ustaw), sql_txt(nazwa), sql_txt(sklep))
        )

    czesci.append("""
-- Kontrola po wykonaniu
-- select manufacturer, count(*) from public.cultures
--   where is_active = true group by manufacturer order by count(*) desc;
-- select name, shop, strain_ratio from public.cultures
--   where strain_ratio is not null order by name;
""")

    os.makedirs(os.path.dirname(WYJSCIE), exist_ok=True)
    io.open(WYJSCIE, "w", encoding="utf-8", newline="").write("".join(czesci))

    print("wierszy      : %d" % len(wiersze))
    print("z producentem: %d" % z_prod)
    print("z proporcjami: %d" % z_prop)
    print("\nrozklad po ujednoliceniu:")
    for p, ile in rozklad.most_common():
        print("   %-32s %3d" % (p, ile))
    print("\nZAPISANO %s" % os.path.relpath(WYJSCIE, ROOT))
    print("Marek: wklej w Lovable -> SQL Editor i uruchom.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
