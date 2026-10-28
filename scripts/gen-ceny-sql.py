#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator SQL: odswiezenie cen kultur, oznaczenie znikniec i nowe pojemnosci.

Zrodla:
  * scripts/kultury-data/ceny.txt      (scripts/pobierz-ceny.py, statusy
    poprawione recznie tam, gdzie automat zglosil "DO SPRAWDZENIA")
  * scripts/kultury-data/pojemnosc.txt (pack_liters i dose_label)
  * zrzut tabeli cultures z REST (is_active=true, order=name,shop): stan bazy
    PRZED zmiana, czyli stara cena i stara pojemnosc. Celowo nie migawka TS:
    ta jest wynikiem tego skryptu i po jej przegenerowaniu porownanie
    wychodziloby puste (tak sie stalo przy pierwszym przebiegu 27.10.2026).

Wynik: supabase/sql-do-wklejenia/<RRRRMMDD>-ceny-kultur.sql do uruchomienia
w Supabase -> SQL Editor. Claude nie pisze do bazy bez zgody Marka.

STATUSY w ceny.txt, ktore generator rozumie:
  bez zmian          -> tylko last_checked
  nowa               -> cena bez poprzedniej (np. produkt wrocil)
  ZMIANA ...         -> price_previous = stara, nowa cena, last_changed
  NIEDOSTEPNY ...    -> produkt zniknal ze sklepu: price_label 'Niedostępna',
                        price_numeric NULL. Wiersz ZOSTAJE (decyzja Marka
                        z 8.09.2026: kultura istnieje i ktos moze jej szukac,
                        a cicha stara cena wygladalaby na aktualna). NULL, nie
                        0, bo zero w sortowaniu po cenie wyszloby najtansze.
  DO SPRAWDZENIA ... -> pomijane; zostaje stara data sprawdzenia
Inne (np. BRAK CENY) tez sa pomijane i wypisane na koncu.

PODGLAD BEZ BAZY: --po WY.json naklada te same zmiany na zrzut i zapisuje
wynik. Z WY.json robi sie migawke:
  python scripts/gen-cultures-ts.py WY.json
Po uruchomieniu SQL w bazie swiezy zrzut musi dac ten sam plik TS.

UZYCIE:
  python scripts/gen-ceny-sql.py przed.json              # plik SQL
  python scripts/gen-ceny-sql.py przed.json --po po.json # zrzut po zmianach
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CENY = os.path.join(ROOT, "scripts", "kultury-data", "ceny.txt")
POJEMNOSC = os.path.join(ROOT, "scripts", "kultury-data", "pojemnosc.txt")
KATALOG = os.path.join(ROOT, "supabase", "sql-do-wklejenia")

# Nowe sklepy: plik w scripts/kultury-data/<klucz>.txt odczytany recznie ze stron
# produktow (nazwa | sklad | przeznaczenie | temperatura | cena | litry |
# dawkowanie | url | zdjecie | uwagi). Wstawiane tylko, gdy takiej pozycji nie ma.
NOWE_SKLEPY = {
    # Dodany 27.10.2026 na prosbe Marka: najpopularniejszy sklep, wczesniej pominiety.
    "browin": ("Browin", "https://browin.pl/", "Browin (marka własna)"),
}

# Zmiany zauwazone wczesniej, ale nigdy niewgrane do bazy: SQL z 8.09.2026
# (20260908-ceny-kultur.sql, usuniety 27.10.2026, jest w historii gita) nie
# zostal uruchomiony, a odpalony po nowym cofnalby daty i poprzednie ceny.
# Jesli cena dalej jest ta z 8.09, data zmiany to 8.09, nie dzien tego przebiegu.
ZAUWAZONE_WCZESNIEJ = {
    ("DELTA 2", "Lactic.pl"): ("2026-09-08", 19.0),
    ("IOTA 4", "Lactic.pl"): ("2026-09-08", 19.0),
    ("IOTA KEFIR 2", "Lactic.pl"): ("2026-09-08", 19.0),
    ("IOTA KEFIR 3", "Lactic.pl"): ("2026-09-08", 19.0),
    ("IOTA PROBI 1", "Lactic.pl"): ("2026-09-08", 19.0),
}


def sql_txt(s):
    return "'" + (s or "").replace("'", "''") + "'"


def zl(x):
    return ("%.2f" % x).replace(".", ",") + " zł"


def wczytaj_zrzut(sciezka):
    return json.load(io.open(sciezka, encoding="utf-8"))


def wczytaj_tabele(sciezka):
    for linia in io.open(sciezka, encoding="utf-8"):
        if linia.startswith("#") or not linia.strip():
            continue
        yield [x.strip() for x in linia.rstrip("\n").split("|")]


def zbierz_zmiany(zrzut):
    """Lista (nazwa, sklep, {kolumna: wartosc}, rodzaj) + pominiete."""
    stan = {(r["name"], r["shop"]): r for r in zrzut}
    zmiany, pominiete, daty = [], [], set()

    for c in wczytaj_tabele(CENY):
        nazwa, sklep, _stara, nowa, _zrodlo, status = c[:6]
        dzien = c[7] if len(c) > 7 and c[7] else None
        if (nazwa, sklep) not in stan:
            pominiete.append((nazwa, sklep, "nie ma w zrzucie bazy"))
            continue
        if not dzien:
            pominiete.append((nazwa, sklep, "brak daty sprawdzenia"))
            continue
        przed = stan[(nazwa, sklep)]
        daty.add(dzien)

        if status == "bez zmian":
            zmiany.append((nazwa, sklep, {"last_checked": dzien}, "bez zmian"))
        elif status.startswith("ZMIANA") or status == "nowa":
            cena = float(nowa)
            stara = przed.get("price_numeric")
            ustaw = {"price_numeric": cena, "price_label": zl(cena), "last_checked": dzien}
            if stara is not None and abs(stara - cena) <= 0.005:
                # Baza ma juz te cene (SQL uruchomiony wczesniej): nic do zmiany.
                zmiany.append((nazwa, sklep, {"last_checked": dzien}, "bez zmian"))
                continue
            if stara is not None:
                wczesniej = ZAUWAZONE_WCZESNIEJ.get((nazwa, sklep))
                ustaw["price_previous"] = stara
                ustaw["last_changed"] = (
                    wczesniej[0] if wczesniej and abs(wczesniej[1] - cena) < 0.005 else dzien)
            elif stara is None:
                ustaw["price_previous"] = None
            zmiany.append((nazwa, sklep, ustaw, "zmiana" if stara is not None else "nowa"))
        elif status.startswith("NIEDOSTEPNY"):
            zmiany.append((nazwa, sklep, {
                "price_previous": None, "price_numeric": None,
                "price_label": "Niedostępna", "last_checked": dzien,
            }, "niedostepny"))
        else:
            pominiete.append((nazwa, sklep, status))

    # Pojemnosc i dawkowanie: tylko tam, gdzie plik mowi co innego niz baza.
    for c in wczytaj_tabele(POJEMNOSC):
        nazwa, sklep, litry, dawka = c[:4]
        if (nazwa, sklep) not in stan:
            continue
        przed = stan[(nazwa, sklep)]
        ustaw = {}
        if litry and int(litry) != int(przed.get("pack_liters") or 0):
            ustaw["pack_liters"] = int(litry)
        if dawka and dawka != (przed.get("dose_label") or ""):
            ustaw["dose_label"] = dawka
        if ustaw:
            zmiany.append((nazwa, sklep, ustaw, "pojemnosc"))

    return zmiany, pominiete, daty


def wczytaj_nowe_sklepy(dzien):
    """Pelne wiersze tabeli cultures dla sklepow z NOWE_SKLEPY."""
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "gen_cultures_sql", os.path.join(ROOT, "scripts", "gen-cultures-sql.py"))
    gcs = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gcs)  # typ z tej samej reguly co przy pozostalych sklepach

    wiersze = []
    for klucz, (sklep, adres, producent) in NOWE_SKLEPY.items():
        for c in wczytaj_tabele(os.path.join(ROOT, "scripts", "kultury-data", klucz + ".txt")):
            nazwa, sklad, przezn, temp, cena, litry, dawka, url, zdjecie = c[:9]
            liczba = gcs.price_num(cena)
            wiersze.append({
                "name": nazwa, "composition": sklad, "application": przezn,
                "temperature": temp, "type": gcs.derive_type(nazwa, sklad, przezn),
                "shop": sklep, "shop_url": adres, "product_url": url,
                "price_label": zl(liczba), "price_numeric": liczba,
                "pack_liters": int(litry) if litry else None, "dose_label": dawka or None,
                "manufacturer": producent, "image_url": zdjecie or None,
                "is_active": True, "last_checked": dzien,
            })
    return wiersze


def insert(w):
    kolumny = list(w.keys())
    wartosci = []
    for k in kolumny:
        v = w[k]
        if v is None:
            wartosci.append("NULL")
        elif isinstance(v, bool):
            wartosci.append("true" if v else "false")
        elif k == "last_checked":
            wartosci.append("DATE '%s'" % v)
        elif isinstance(v, (int, float)):
            wartosci.append(str(v) if isinstance(v, int) else "%.2f" % v)
        else:
            wartosci.append(sql_txt(v))
    # sklep_id (od 28.10.2026) uzupełnia trigger cultures_sklep_id z nazwy w shop. Nowy sklep trzeba
    # dopisać w funkcji sklep_id_z_nazwy (migracja 20261028210000), inaczej sklep_id zostanie pusty.
    return ("INSERT INTO public.cultures (%s)\nSELECT %s\n WHERE NOT EXISTS (SELECT 1 FROM public.cultures"
            " WHERE shop = %s AND name = %s);\n"
            % (", ".join(kolumny), ",\n       ".join(wartosci), sql_txt(w["shop"]), sql_txt(w["name"])))


def wartosc_sql(k, v):
    if v is None:
        return "NULL"
    if k in ("last_checked", "last_changed"):
        return "DATE '%s'" % v
    if k == "price_label" or k == "dose_label":
        return sql_txt(v)
    if k == "pack_liters":
        return str(int(v))
    return "%.2f" % v


def update(nazwa, sklep, ustaw):
    pola = ",\n       ".join("%s = %s" % (k, wartosc_sql(k, v)) for k, v in ustaw.items())
    return ("UPDATE public.cultures SET %s,\n       updated_at = now()\n"
            " WHERE shop = %s AND name = %s;\n" % (pola, sql_txt(sklep), sql_txt(nazwa)))


def naloz_na_zrzut(zmiany, nowe, we, wy):
    wiersze = json.load(io.open(we, encoding="utf-8"))
    indeks = {(r["name"], r["shop"]): r for r in wiersze}
    trafione = 0
    for nazwa, sklep, ustaw, _ in zmiany:
        r = indeks.get((nazwa, sklep))
        if r is None:
            print("  !! w zrzucie nie ma: %s / %s" % (nazwa, sklep))
            continue
        r.update(ustaw)
        trafione += 1
    dodane = [w for w in nowe if (w["name"], w["shop"]) not in indeks]
    # Migawka idzie w kolejnosci zrzutu z REST z order=name. Postgres porownuje
    # nazwy bez wielkosci liter i bez spacji, wiec nowe wiersze wstawiamy
    # w to samo miejsce, w ktorym postawi je prawdziwy zrzut.
    klucz = lambda r: re.sub(r"[^0-9a-z]", "", r["name"].lower())
    for w in dodane:
        i = next((n for n, r in enumerate(wiersze) if klucz(r) > klucz(w)), len(wiersze))
        wiersze.insert(i, w)
    json.dump(wiersze, io.open(wy, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("Zrzut z nalozonymi zmianami: %s (%d aktualizacji, %d nowych)" % (wy, trafione, len(dodane)))


def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith("--"):
        sys.exit(__doc__)
    zmiany, pominiete, daty = zbierz_zmiany(wczytaj_zrzut(sys.argv[1]))
    dzien = max(daty)
    nowe = wczytaj_nowe_sklepy(dzien)
    if "--po" in sys.argv:
        naloz_na_zrzut(zmiany, nowe, sys.argv[1], sys.argv[sys.argv.index("--po") + 1])
        return 0
    rodzaje = {}
    for z in zmiany:
        rodzaje.setdefault(z[3], []).append(z)

    czesci = ["""-- ============================================================
-- cultures: odswiezenie cen kultur, %s
-- Do uruchomienia w Supabase -> SQL Editor. Wygenerowane przez
-- scripts/gen-ceny-sql.py z scripts/kultury-data/ceny.txt i pojemnosc.txt.
-- Kazde polecenie ustawia jawne wartosci, wiec drugie uruchomienie nic nie psuje.
--
--   %3d sprawdzonych bez zmiany ceny
--   %3d zmian ceny (z zapisem poprzedniej)
--   %3d z cena bez poprzedniej (produkt wrocil albo nie mial ceny)
--   %3d zniknelo ze sklepu (zostaja, cena 'Niedostępna')
--   %3d nowych albo poprawionych pojemnosci opakowania
--   %3d pominietych (zostaje stara data sprawdzenia)
--   %3d nowych pozycji z nowego sklepu (tylko gdy jeszcze ich nie ma)
--
-- Zastepuje niewgrany plik 20260908-ceny-kultur.sql (usuniety z repo):
-- tamte zmiany sa tu ujete na nowo, sprawdzone na zywo.
-- ============================================================

BEGIN;
""" % (dzien, len(rodzaje.get("bez zmian", [])), len(rodzaje.get("zmiana", [])),
       len(rodzaje.get("nowa", [])), len(rodzaje.get("niedostepny", [])),
       len(rodzaje.get("pojemnosc", [])), len(pominiete), len(nowe))]

    if rodzaje.get("zmiana") or rodzaje.get("nowa"):
        czesci.append("\n-- 1. Zmiany ceny\n")
        for nazwa, sklep, ustaw, _ in sorted(rodzaje.get("zmiana", []) + rodzaje.get("nowa", []),
                                             key=lambda z: (z[1], z[0])):
            czesci.append(update(nazwa, sklep, ustaw))

    if rodzaje.get("niedostepny"):
        czesci.append("\n-- 2. Zniknely ze sklepu: wiersz zostaje, zamiast ceny 'Niedostępna'\n")
        for nazwa, sklep, ustaw, _ in sorted(rodzaje["niedostepny"], key=lambda z: (z[1], z[0])):
            czesci.append(update(nazwa, sklep, ustaw))

    if rodzaje.get("pojemnosc"):
        czesci.append("\n-- 3. Pojemnosc opakowania i dawkowanie wyczytane ze stron sklepow\n")
        for nazwa, sklep, ustaw, _ in sorted(rodzaje["pojemnosc"], key=lambda z: (z[1], z[0])):
            czesci.append(update(nazwa, sklep, ustaw))

    if rodzaje.get("bez zmian"):
        czesci.append("\n-- 4. Sprawdzone, cena bez zmian: tylko data sprawdzenia\n")
        po_dniu = {}
        for nazwa, sklep, ustaw, _ in rodzaje["bez zmian"]:
            po_dniu.setdefault((ustaw["last_checked"], sklep), []).append(nazwa)
        for (d, sklep), nazwy in sorted(po_dniu.items()):
            lista = ",\n    ".join(sql_txt(n) for n in sorted(nazwy))
            czesci.append("UPDATE public.cultures SET last_checked = DATE '%s', updated_at = now()\n"
                          " WHERE shop = %s AND name IN (\n    %s);\n" % (d, sql_txt(sklep), lista))

    for klucz, (sklep, adres, _) in NOWE_SKLEPY.items():
        wiersze = [w for w in nowe if w["shop"] == sklep]
        czesci.append("\n-- 5. Nowy sklep: %s (%s), %d pozycji. Dane: scripts/kultury-data/%s.txt\n"
                      % (sklep, adres, len(wiersze), klucz))
        for w in wiersze:
            czesci.append(insert(w))

    czesci.append("\nCOMMIT;\n")
    if pominiete:
        czesci.append("\n-- Pominiete (do recznego sprawdzenia, stara data zostaje):\n")
        for nazwa, sklep, powod in pominiete:
            czesci.append("--   %s / %s: %s\n" % (nazwa, sklep, powod))
    czesci.append("""
-- Kontrola po wykonaniu:
--   select last_checked, count(*) from public.cultures
--    where is_active = true group by 1 order by 1;
--   select count(*) filter (where pack_liters is null) as bez_pojemnosci
--     from public.cultures where is_active = true;
""")

    wyjscie = os.path.join(KATALOG, "%s-ceny-kultur.sql" % dzien.replace("-", ""))
    os.makedirs(KATALOG, exist_ok=True)
    io.open(wyjscie, "w", encoding="utf-8", newline="").write("".join(czesci))

    for r in ("bez zmian", "zmiana", "nowa", "niedostepny", "pojemnosc"):
        print("%-11s: %d" % (r, len(rodzaje.get(r, []))))
    print("pominiete  : %d" % len(pominiete))
    for p in pominiete:
        print("   %s / %s: %s" % p)
    print("\nZAPISANO %s" % os.path.relpath(wyjscie, ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
