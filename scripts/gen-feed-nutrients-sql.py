#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generuje migracje Supabase, ktora dokłada do `feed_ingredients` kolumny na
aminokwasy, witaminy i rozszerzony sklad, a potem wypelnia je dla 124 surowcow
wzorcowych (source='baza').

DLACZEGO MIGRACJA, A NIE SKRYPT: aplikacja czyta skladniki WYLACZNIE z bazy, gdy
sa tam wiersze z source='baza' (patrz useFeedIngredients) - a sa. Plik
src/data/feedIngredients.ts jest tylko awaryjnym fallbackiem. Dane musza wiec
trafic do Supabase, a migracja jest jedyna droga, ktora sie wersjonuje i wdraza
sama przy pushu.

ZRODLO WARTOSCI: src/data/feedIngredients.ts (generowany przez
gen-feed-ingredients.py z arkusza 'Normy zywieniowe.xls'). Czytamy z pliku TS,
a nie drugi raz z arkusza, zeby baza i fallback nie mogly sie rozjechac.

Uruchom: python scripts/gen-feed-nutrients-sql.py
"""
import io, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TS = os.path.join(ROOT, "src", "data", "feedIngredients.ts")
MIGRACJE = os.path.join(ROOT, "supabase", "migrations")
NAZWA_PLIKU = "20260901180000_feed_ingredients_aminokwasy_witaminy.sql"

# pole w TS -> kolumna w bazie
POLA = [
    ("suchaMasa", "sucha_masa"), ("tluszcz", "tluszcz"), ("popiol", "popiol"),
    ("skrobia", "skrobia"), ("cukier", "cukier"),
    ("pPrzyswajalny", "p_przyswajalny"), ("cl", "cl"), ("s", "s"), ("cu", "cu"), ("co", "co"),
    ("lys", "lys"), ("met", "met"), ("metCys", "met_cys"), ("trp", "trp"), ("thr", "thr"),
    ("ile", "ile"), ("leu", "leu"), ("val", "val"), ("his", "his"), ("arg", "arg"),
    ("phe", "phe"), ("tyr", "tyr"),
    ("witA", "wit_a"), ("witD3", "wit_d3"), ("witE", "wit_e"), ("witB1", "wit_b1"),
    ("witB2", "wit_b2"), ("witB6", "wit_b6"), ("kwasPantotenowy", "kwas_pantotenowy"),
    ("kwasFoliowy", "kwas_foliowy"), ("biotyna", "biotyna"), ("niacyna", "niacyna"),
    ("witB12", "wit_b12"), ("cholina", "cholina"), ("kwasLinolowy", "kwas_linolowy"),
]

# Nazwa zepsuta przy seedzie: escapowanie wyciekło do WARTOSCI, wiec w bazie stoi
# dosłownie `Premiks 2,5 \"PT\"` (z ukośnikami). Naprawiamy przed UPDATE, inaczej
# ten jeden wiersz nie dopasowalby sie po nazwie.
NAPRAWA_NAZW = [(r'Premiks 2,5 \"PT\"', 'Premiks 2,5 "PT"')]


def sql_txt(t):
    return "'" + t.replace("'", "''") + "'"


def wczytaj_ts():
    tresc = io.open(TS, encoding="utf-8").read()
    # obiekty zaczynaja sie od `{ nazwa: "...",` i koncza `},`
    surowce = []
    for blok in re.findall(r"\{\s*nazwa:\s*\"((?:[^\"\\]|\\.)*)\".*?\}", tresc, re.S):
        pass  # tylko dla czytelnosci — wlasciwe parsowanie nizej
    for m in re.finditer(r"\{\s*nazwa:\s*\"((?:[^\"\\]|\\.)*)\",(.*?)\},", tresc, re.S):
        nazwa = m.group(1).replace('\\"', '"').replace("\\\\", "\\")
        wartosci = dict(re.findall(r"(\w+):\s*(-?[\d.]+)", m.group(2)))
        surowce.append((nazwa, wartosci))
    return surowce


def main():
    surowce = wczytaj_ts()
    if len(surowce) < 100:
        raise SystemExit("Odczytano tylko %d surowcow z %s — zmienil sie ksztalt pliku?"
                         % (len(surowce), TS))
    brakujace = [n for n, w in surowce if any(ts not in w for ts, _ in POLA)]
    if brakujace:
        raise SystemExit("Brak nowych pol u: %s — najpierw uruchom gen-feed-ingredients.py"
                         % ", ".join(brakujace[:5]))

    L = []
    L.append("-- " + "=" * 74)
    L.append("-- feed_ingredients: aminokwasy, witaminy i rozszerzony sklad")
    L.append("--")
    L.append("-- PLIK GENEROWANY przez scripts/gen-feed-nutrients-sql.py — nie edytuj recznie.")
    L.append("-- Zrodlo wartosci: src/data/feedIngredients.ts, ktory powstaje z arkusza")
    L.append("-- 'Normy zywieniowe.xls' Marka (arkusze Skladniki/Mineralne/Witaminy/Aminokwasy).")
    L.append("--")
    L.append("-- DLACZEGO W BAZIE, A NIE TYLKO W PLIKU: kalkulator czyta skladniki wylacznie")
    L.append("-- z Supabase, gdy sa tam wiersze z source='baza' — a jest ich 124. Plik TS to")
    L.append("-- fallback na pierwsze malowanie i tryb offline.")
    L.append("--")
    L.append("-- PUSTA KOMORKA W ARKUSZU = 0. Tak wprowadzal je Marek: gdy w zrodle nie bylo")
    L.append("-- danych, uznawal, ze skladnika nie ma albo wystepuje w ilosciach sladowych.")
    L.append("-- Sprawdzone przed importem: wszystkie 18 ziaren i straczkowych ma komplet")
    L.append("-- dwunastu aminokwasow, a puste skupiaja sie w dodatkach mineralnych (8 z 8),")
    L.append("-- enzymach i premiksach — czyli tam, gdzie zero jest prawda.")
    L.append("--")
    L.append("-- CEN NIE RUSZAMY — te w arkuszu sa sprzed pietnastu lat.")
    L.append("-- " + "=" * 74)
    L.append("")
    L.append("ALTER TABLE public.feed_ingredients")
    L.append(",\n".join("  ADD COLUMN IF NOT EXISTS %s numeric" % kol for _, kol in POLA) + ";")
    L.append("")
    L.append("COMMENT ON COLUMN public.feed_ingredients.lys IS 'Lizyna, % w paszy.';")
    L.append("COMMENT ON COLUMN public.feed_ingredients.met_cys IS 'Metionina + cystyna razem — tak podaja je normy.';")
    L.append("COMMENT ON COLUMN public.feed_ingredients.p_przyswajalny IS 'Fosfor przyswajalny — to on liczy sie w bilansie, nie ogolny.';")
    L.append("COMMENT ON COLUMN public.feed_ingredients.tluszcz IS 'Tluszcz surowy, %. Normy zywieniowe maja na niego wymaganie, ktorego do tej pory nie bylo z czego policzyc.';")
    L.append("")
    L.append("-- Naprawa nazwy uszkodzonej przy seedzie (escapowanie wyciekło do wartosci).")
    for zle, dobre in NAPRAWA_NAZW:
        L.append("UPDATE public.feed_ingredients SET nazwa = %s WHERE nazwa = %s;"
                 % (sql_txt(dobre), sql_txt(zle)))
    L.append("")
    L.append("-- Wartosci dla 124 surowcow wzorcowych. Zgloszenia uzytkownikow (source='user')")
    L.append("-- zostaja nietkniete — nie mamy dla nich tych danych i nie zmyslamy ich.")
    L.append("UPDATE public.feed_ingredients AS f SET")
    L.append(",\n".join("  %s = v.%s" % (kol, kol) for _, kol in POLA))
    L.append("FROM (VALUES")
    wiersze = []
    for indeks, (nazwa, w) in enumerate(surowce):
        liczby = [w[ts_pole] for ts_pole, _ in POLA]
        if indeks == 0:
            # Jawne rzutowanie w pierwszym wierszu — bez niego Postgres wywnioskuje
            # typ z literalow i potrafi zrobic z kolumny integer.
            komorki = [sql_txt(nazwa) + "::text"] + [x + "::numeric" for x in liczby]
        else:
            komorki = [sql_txt(nazwa)] + liczby
        wiersze.append("  (" + ", ".join(komorki) + ")")
    L.append(",\n".join(wiersze))
    L.append(") AS v(nazwa, " + ", ".join(kol for _, kol in POLA) + ")")
    L.append("WHERE f.nazwa = v.nazwa AND f.source = 'baza';")
    L.append("")

    sciezka = os.path.join(MIGRACJE, NAZWA_PLIKU)
    io.open(sciezka, "w", encoding="utf-8", newline="\n").write("\n".join(L))
    print("Zapisano %s" % os.path.relpath(sciezka, ROOT))
    print("  surowcow: %d | nowych kolumn: %d | wartosci: %d"
          % (len(surowce), len(POLA), len(surowce) * len(POLA)))


if __name__ == "__main__":
    main()
