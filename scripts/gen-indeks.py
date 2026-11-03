#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Indeks tresci Serowarni dla wyszukiwarki danerolne.com/szukaj: public/indeks.json.

PO CO TO ISTNIEJE: zlecenie Huba z 3.11.2026 (decyzja Marka: „Tak, buduj”). Hub
pobiera plik najwyzej co godzine i pokazuje karty w wynikach. Kliknieciami zajmuje
sie hub, wiec linki sa czyste. Brak pliku oznacza tylko brak dzialu w wynikach.

ZASADY HUBA: linki tylko do wlasnej domeny, bez utm i licznika; bez cen, bo karta
zyje dluzej niz cena; bez sklepow (sa w katalogu huba); bez danych osobowych;
zwykly tekst; najwyzej 5000 kart i 2 MB; bez upychania slow. Zlamanie zasady
przerywa skrypt, zamiast zapisac plik.

SKAD TRESC: adresy z public/sitemap.xml, tytul i opis z mirrora, a gdy mirror nie
ma opisu, z src/data/metaStron.ts. Opisy przepisow ucinane w mirrorze na 140 znakach
z pelnego pola description. Kultury z src/data/culturesDataComplete.ts, bo opisy ich
mirrorow podaja cene za litr. Nic poza tabela TEKST_RECZNY nie jest wpisane recznie.

Data "zmieniono" to najnowszy lastmod z mapy strony, a nie data uruchomienia, wiec
ponowne uruchomienie bez zmian w tresci nie zmienia pliku.

Uruchom po zmianie tresci, razem z mapa strony:  python scripts/gen-indeks.py
"""
import html
import importlib.util
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
MAPA = os.path.join(PUB, "sitemap.xml")
OUT = os.path.join(PUB, "indeks.json")
BAZA = "https://mojaserowarnia.pl"


def _zaladuj(nazwa, plik):
    # Skrypty maja myslnik w nazwie, wiec zwykly import nie przejdzie. Regul adresu
    # kultury i odczytu metaStron nie przepisujemy drugi raz.
    spec = importlib.util.spec_from_file_location(
        nazwa, os.path.join(os.path.dirname(os.path.abspath(__file__)), plik))
    modul = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modul)
    return modul


zam = _zaladuj("gen_zamienniki", "gen-zamienniki.py")
seo = _zaladuj("sync_seo", "sync-seo-mirrory.py")

# Trzymac zgodne z MIRROR_POD_INNA_NAZWA w worker/index.js.
MIRROR_POD_INNA_NAZWA = {
    "/": "index-mirror.html",
    "/baza-kultur": "kultury/baza.html",
    "/sery-wege": "wege/index.html",
    "/prawo": "prawo/przewodnik.html",
    "/przepisy": "przepisy/przewodnik.html",
}

# Strony techniczne, o samym serwisie albo obok tematu. Agrojelonki sa w katalogu huba,
# a /przepisy/przewodnik to ten sam tekst co /przepisy.
POMIJANE = {
    "/llms.txt", "/humans.txt", "/kontakt", "/nota-prawna", "/boty-ai", "/en/ai-bots",
    "/asystenci-ai", "/automatyzacja-social-media", "/serowarnie/agrojelonki",
    "/przepisy/przewodnik",
}

# Przewodniki pod /kultury/, a nie karty pojedynczych kultur.
PRZEWODNIKI_KULTUR = {
    "/kultury/mezofilne", "/kultury/termofilne", "/kultury/jogurtowe",
    "/kultury/do-caciotta", "/kultury/do-twarogu",
}

# Strona bez mirrora, tekst jak w document.title i opisie w src/pages/EtykietaRhd.tsx.
TEKST_RECZNY = {
    "/etykieta-rhd": (
        "Etykieta RHD na ser: wymagania + darmowy generator",
        "Co musi być na etykiecie sera w rolniczym handlu detalicznym (RHD): obowiązkowe "
        "pola wg rozp. 1169/2011, wzór i darmowy edytor etykiety do druku."),
}

STRONY = {
    "/", "/baza-kultur", "/porownywarka-kultur", "/slownik", "/narzedzia",
    "/porownanie-wartosci-odzywczych", "/serowarnie", "/wiadomosci", "/system-ewidencji",
}
PRAWO = {"/etykieta-rhd", "/etykieta-do-sprzedazy-rhd", "/faktura-vat-rr", "/jak-wystawic-fakture-vat-rr"}

RODZAJ_KULTURY = {
    "aromatyzujące": "kultura aromatyzująca",
    "jogurtowe": "kultura jogurtowa",
    "kefir": "kultura do kefiru",
    "mezofilne": "kultura mezofilna",
    "mezofilno-termofilne": "kultura mezofilno-termofilna",
    "ochronne": "kultura ochronna",
    "pleśniowe": "kultura pleśniowa",
    "probiotyczne": "kultura probiotyczna",
    "propionowe": "kultura propionowa",
    "termofilne": "kultura termofilna",
    "wege": "kultura wegańska",
    "zestaw": "zestaw kultur",
}

# Slowa, ktorymi ludzie nazywaja kulture, a ktorych zwykle nie ma w jej opisie.
# Tylko prawdziwe synonimy: kultura ochronna nie jest starterem, wiec go nie dostaje.
SLOWA_WG_RODZAJU = {
    "mezofilne": ["bakterie do sera", "starter", "zakwas"],
    "termofilne": ["bakterie do sera", "starter", "zakwas"],
    "mezofilno-termofilne": ["bakterie do sera", "starter", "zakwas"],
    "aromatyzujące": ["bakterie do sera", "kultura aromatyczna"],
    "jogurtowe": ["bakterie do jogurtu", "starter", "zakwas"],
    "kefir": ["bakterie do kefiru", "starter", "zakwas"],
    "ochronne": ["bakterie ochronne", "bioprotekcja"],
    "pleśniowe": ["pleśń do sera", "pleśnie"],
    "probiotyczne": ["bakterie probiotyczne", "probiotyk"],
    "propionowe": ["bakterie propionowe", "bakterie do sera"],
    "wege": ["kultura roślinna", "bakterie do mleka roślinnego"],
}


def bez_pauzy(zdanie):
    # Bez dlugich myslnikow na stronach Marka. Zakresy typu 18–22% zostaja.
    while True:
        zamiennik = ", " if ":" in zdanie else ": "
        nowe = re.sub(r"\s+[—–]\s+|—", zamiennik, zdanie, count=1)
        if nowe == zdanie:
            return zdanie
        zdanie = nowe


def czysty(tekst):
    tekst = html.unescape(tekst).replace('\\"', '"')
    tekst = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", tekst)).strip()
    return " ".join(bez_pauzy(z) for z in re.split(r"(?<=[.?!])\s+", tekst))


def tytul_strony(tekst):
    return re.sub(r"\s*\|\s*(Moja Serowarnia|Serowarnie)\s*$", "", czysty(tekst))


def skroc(tekst, limit):
    """Tnie na koncu zdania, a gdy sie nie da, na przecinku lub spacji."""
    if len(tekst) <= limit:
        return tekst
    kawalek = tekst[:limit]
    koniec = kawalek.rfind(". ")
    if koniec > limit // 2:
        return kawalek[:koniec + 1]
    for znak in (", ", " "):
        koniec = kawalek.rfind(znak)
        if koniec > 0:
            return kawalek[:koniec].rstrip(",:; ") + "."
    return kawalek


def typ_strony(sciezka):
    if sciezka.startswith("/kultury/") and sciezka not in PRZEWODNIKI_KULTUR:
        return "kultura"
    if sciezka.startswith("/przepisy"):
        return "przepis"
    if sciezka.startswith("/prawo") or sciezka in PRAWO:
        return "prawo"
    if sciezka in STRONY or sciezka.startswith("/kalkulator-"):
        return "strona"
    return "poradnik"


def karta_kultury(k):
    rodzaj = k.get("type", "")
    nazwa = czysty(k["name"])
    # „kultura...” powtarzalaby sie po nazwie typu „Kultury bakterii do jogurtu”.
    tytul = nazwa if nazwa.lower().startswith("kultur") or rodzaj not in RODZAJ_KULTURY \
        else "%s: %s" % (nazwa, RODZAJ_KULTURY[rodzaj])

    zdania = []
    if k.get("application"):
        zdania.append("Do czego: %s." % skroc(czysty(k["application"]), 180).rstrip("."))
    if k.get("composition"):
        zdania.append("Skład: %s." % czysty(k["composition"]).rstrip("."))
    if k.get("temperature"):
        zdania.append("Temperatura pracy: %s." % czysty(k["temperature"]))
    if k.get("manufacturer"):
        zdania.append("Producent: %s." % czysty(k["manufacturer"]).rstrip("."))

    opis = ""
    for zdanie in zdania:
        if len(opis) + len(zdanie) + 1 <= 300:
            opis = (opis + " " + zdanie).strip()

    return {"tytul": tytul, "opis": opis, "slowa": SLOWA_WG_RODZAJU.get(rodzaj)}


def pelne_opisy_przepisow():
    """{sciezka: pole description} z danych przepisow na sery i kulinarnych."""
    opisy = {}
    for prefiks, plik in (("/przepisy/", "recipesData.ts"), ("/przepisy-kulinarne/", "culinaryRecipesData.ts")):
        tresc = io.open(os.path.join(ROOT, "src", "data", plik), encoding="utf-8").read()
        for blok in re.split(r"\n  \{\n", tresc)[1:]:
            rid = re.search(r"\bid:\s*" + seo.STR, blok)
            opis = re.search(r"\bdescription:\s*" + seo.STR, blok)
            if rid and opis:
                opisy[prefiks + rid.group(1)] = opis.group(1)
    return opisy


def tekst_z_mirrora(sciezka, meta, pelne):
    plik = MIRROR_POD_INNA_NAZWA.get(sciezka) or sciezka.strip("/") + ".html"
    pelny = os.path.join(PUB, *plik.split("/"))
    if not os.path.exists(pelny):
        raise SystemExit("Brak mirrora dla %s (%s). Dopisz go albo dodaj adres do POMIJANE." % (sciezka, plik))
    tresc = io.open(pelny, encoding="utf-8").read()
    tytul = re.search(r"<title>(.*?)</title>", tresc, re.S)
    opis = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', tresc)
    tytul = tytul.group(1) if tytul else ""
    opis = opis.group(1) if opis else ""
    if not opis and sciezka in meta:
        opis = meta[sciezka]
    if opis.endswith("…") and sciezka in pelne:
        opis = pelne[sciezka]
    if not tytul or not opis or opis.endswith("…"):
        raise SystemExit("Brak tytulu albo opisu dla %s." % sciezka)
    return tytul_strony(tytul), skroc(czysty(opis), 300)


def sprawdz(karty, rozmiar):
    bledy = []
    if len(karty) > 5000:
        bledy.append("za duzo kart: %d" % len(karty))
    if rozmiar > 2 * 1024 * 1024:
        bledy.append("plik za duzy: %d bajtow" % rozmiar)
    for k in karty:
        tekst = " ".join([k["tytul"], k["opis"]] + k.get("slowa", []))
        if len(k["tytul"]) > 120:
            bledy.append("tytul dluzszy niz 120: %s" % k["url"])
        if not k["opis"] or len(k["opis"]) > 300:
            bledy.append("opis pusty albo dluzszy niz 300: %s" % k["url"])
        if len(k.get("slowa", [])) > 20:
            bledy.append("wiecej niz 20 slow: %s" % k["url"])
        if not k["url"].startswith(BAZA + "/") and k["url"] != BAZA + "/":
            bledy.append("obca domena: %s" % k["url"])
        if "utm_" in k["url"] or "?" in k["url"]:
            bledy.append("link z parametrem: %s" % k["url"])
        if re.search(r"<[a-z/][^>]*>", tekst, re.I):
            bledy.append("HTML w tekscie: %s" % k["url"])
        if "—" in tekst:
            bledy.append("dlugi myslnik: %s" % k["url"])
        if k["typ"] == "kultura" and re.search(r"\d\s*zł", tekst):
            bledy.append("cena w karcie kultury: %s" % k["url"])
    if bledy:
        raise SystemExit("Zasady huba zlamane:\n  " + "\n  ".join(bledy))


def main():
    mapa = io.open(MAPA, encoding="utf-8").read()
    adresy = re.findall(r"<loc>([^<]+)</loc>", mapa)
    zmieniono = max(re.findall(r"<lastmod>(\d{4}-\d{2}-\d{2})", mapa))

    meta = {p[0]: p[3] for p in seo.wczytaj_seo() if p[0].startswith("/")}
    pelne = pelne_opisy_przepisow()

    kultury = {}
    for k in zam.wczytaj():
        # Dwie oferty tej samej kultury daja jeden adres. Karta nie ma sklepu ani
        # ceny, wiec wystarczy pierwsza.
        kultury.setdefault("/kultury/" + zam.adres_kultury(k["name"]), k)

    karty = []
    for adres in adresy:
        sciezka = adres[len(BAZA):] or "/"
        if sciezka in POMIJANE:
            continue
        if sciezka in kultury:
            karta = karta_kultury(kultury[sciezka])
        elif sciezka in TEKST_RECZNY:
            karta = dict(zip(("tytul", "opis"), TEKST_RECZNY[sciezka]))
        else:
            karta = dict(zip(("tytul", "opis"), tekst_z_mirrora(sciezka, meta, pelne)))
        wiersz = {"tytul": karta["tytul"], "opis": karta["opis"]}
        if karta.get("slowa"):
            wiersz["slowa"] = karta["slowa"]
        wiersz["url"] = BAZA + sciezka if sciezka != "/" else BAZA + "/"
        wiersz["typ"] = typ_strony(sciezka)
        karty.append(wiersz)

    # Jedna karta w wierszu, zeby roznice w gicie dalo sie czytac.
    linie = ",\n".join(json.dumps(k, ensure_ascii=False, separators=(",", ":")) for k in karty)
    wynik = '{"wersja":1,"zmieniono":"%s","karty":[\n%s\n]}\n' % (zmieniono, linie)
    sprawdz(karty, len(wynik.encode("utf-8")))
    json.loads(wynik)

    io.open(OUT, "w", encoding="utf-8", newline="\n").write(wynik)
    typy = {}
    for k in karty:
        typy[k["typ"]] = typy.get(k["typ"], 0) + 1
    print("Zapisano %s: %d kart, %d kB, %s" % (
        os.path.relpath(OUT, ROOT), len(karty), len(wynik.encode("utf-8")) // 1024, typy))


if __name__ == "__main__":
    main()
