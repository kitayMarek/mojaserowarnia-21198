# -*- coding: utf-8 -*-
"""
Mirrory stron pojedynczych kultur — po jednym pliku na kulturę.

PO CO: strona /kultury/<nazwa> jest aplikacją Reacta, więc bot bez JavaScriptu
widzi pustą skorupę. Reguła 2 w workerze mapuje czysty adres na <adres>.html,
więc wystarczy położyć plik obok — żadna zmiana w workerze nie jest potrzebna.

DLACZEGO TO WAŻNE AKURAT TUTAJ: przy zapytaniach w rodzaju „zamiennik dla
Choozit MA 11" albo „ALPHA 10 cena" model musi mieć CO zacytować. 188 stron
bez treści dla bota to 188 pustych miejsc dokładnie tam, gdzie ktoś pyta.

⚠️ TRZY REGUŁY MUSZĄ ZGADZAĆ SIĘ Z WERSJĄ DLA LUDZI, inaczej bot dostanie inny
adres albo inną odpowiedź niż człowiek:
  • adres           → src/lib/adresKultury.ts  (funkcja adresKultury)
  • grupowanie      → src/lib/grupyKultur.ts   (przez scripts/gen-zamienniki.py)
  • koszt litra     → src/components/CenaKultury.tsx
Rozjazd w pierwszej z nich to ten sam błąd, który u nas raz już kosztował
zaindeksowaną stronę.

UŻYCIE:  python scripts/gen-kultury-strony.py
"""

import io
import os
import re
import unicodedata

# gen-zamienniki.py ma myślnik w nazwie, więc zwykły import nie przejdzie.
# Ładujemy go po ścieżce — chodzi o to, żeby NIE przepisywać rozbij_sklad
# i grupuj drugi raz. Dwie kopie tej samej reguły rozjadą się przy pierwszej
# poprawce, a tego już raz doświadczyliśmy przy mirrorach.
import importlib.util

_sciezka = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gen-zamienniki.py")
_spec = importlib.util.spec_from_file_location("gen_zamienniki", _sciezka)
zam = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(zam)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KATALOG = os.path.join(ROOT, "public", "kultury")
BAZA = "https://mojaserowarnia.pl"

# Nazwy plików, które już są w public/kultury/ i NIE są stronami kultur.
# Nadpisanie któregoś skasowałoby istniejący mirror.
ZAJETE = {"baza.html", "do-caciotta.html", "do-twarogu.html",
          "jogurtowe.html", "mezofilne.html", "termofilne.html"}


def adres_kultury(nazwa):
    """Bliźniak adresKultury() z src/lib/adresKultury.ts. Zmiana tu = zmiana tam."""
    s = unicodedata.normalize("NFD", nazwa)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("ł", "l").replace("Ł", "L").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def za_litr(cena, litry):
    if cena is None or not litry:
        return None
    return cena / float(litry)


def zl(v, miejsc=None):
    m = (3 if v < 0.1 else 2) if miejsc is None else miejsc
    return ("%.*f" % (m, v)).replace(".", ",")


def wczytaj_pelne():
    """Jak zam.wczytaj(), ale zabiera też packLiters (liczba, nie tekst)."""
    h = io.open(zam.ZRODLO, encoding="utf-8").read()
    rek = []
    for blok in re.findall(r"\{(.*?)\}", h, re.S):
        d = dict(re.findall(r'(\w+):\s*"([^"]*)"', blok))
        if "name" not in d or "composition" not in d:
            continue
        c = re.search(r"price_numeric:\s*([\d.]+)", blok)
        p = re.search(r"packLiters:\s*([\d.]+)", blok)
        d["cena"] = float(c.group(1)) if c else None
        d["litry"] = float(p.group(1)) if p else None
        rek.append(d)
    return rek


def strona(k, grupa, wszystkie):
    e = zam.esc
    nazwa = k["name"]
    adres = adres_kultury(nazwa)
    moj = za_litr(k.get("cena"), k.get("litry"))

    # Zamienniki: ten sam skład, bez nas, najtańsze za litr na górze.
    inne = [x for x in grupa if x["name"] != nazwa] if grupa else []
    inne = sorted(inne, key=lambda x: (za_litr(x.get("cena"), x.get("litry")) is None,
                                       za_litr(x.get("cena"), x.get("litry")) or 0))
    tansze = [x for x in inne
              if moj is not None and za_litr(x.get("cena"), x.get("litry")) is not None
              and za_litr(x.get("cena"), x.get("litry")) < moj]

    naglowek = " · ".join(filter(None, [k.get("type"), k.get("temperature"), k.get("manufacturer")]))
    opis = "%s: skład %s.%s %d zamiennik(ów) o tym samym składzie." % (
        nazwa, k.get("composition", "—"),
        (" %s zł za litr mleka." % zl(moj)) if moj is not None else "",
        len(inne))

    c = []
    c.append("""<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>%s — cena za litr, skład i zamienniki | Moja Serowarnia</title>
  <meta name="description" content="%s" />
  <link rel="canonical" href="%s/kultury/%s" />
  <meta property="og:title" content="%s — cena za litr, skład i zamienniki" />
  <meta property="og:description" content="%s" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="%s/kultury/%s" />
</head>
<body>
<h1>%s</h1>
<p>%s</p>
""" % (e(nazwa), e(opis), BAZA, adres, e(nazwa), e(opis), BAZA, adres, e(nazwa), e(naglowek)))

    # ── ile kosztuje ──
    c.append("<h2>Ile naprawdę kosztuje</h2>\n")
    if k.get("price"):
        c.append("<p>Cena: <strong>%s</strong>" % e(k["price"]))
        if k.get("litry"):
            c.append(" — opakowanie na %s litrów mleka" % zl(k["litry"], 0))
            if moj is not None:
                c.append(", czyli <strong>%s zł za litr</strong>" % zl(moj))
        else:
            c.append(" — sklep nie podaje, na ile litrów starcza opakowanie")
        c.append(". Sklep: %s.</p>\n" % e(k.get("shop", "—")))
    if k.get("doseLabel"):
        c.append("<p>Dawkowanie wg sklepu: %s</p>\n" % e(k["doseLabel"]))

    # ta sama nazwa w innym sklepie
    gdzie_indziej = [x for x in wszystkie if x["name"] == nazwa and x.get("shop") != k.get("shop")]
    if gdzie_indziej:
        c.append("<p>Ta sama nazwa jest też w: %s.</p>\n" %
                 e(", ".join("%s (%s)" % (x.get("shop", "?"), x.get("price", "?")) for x in gdzie_indziej)))

    # ── czym zastąpić ──
    c.append("<h2>Czym ją zastąpić</h2>\n")
    if not inne:
        c.append("<p>W naszej bazie żadna inna kultura nie ma tego samego składu "
                 "szczepowego. To nie znaczy, że zamiennika nie ma — znaczy, że my "
                 "go nie mamy.</p>\n")
    else:
        if moj is None:
            c.append("<p>Sklep nie podaje pojemności opakowania, więc kosztu litra tej "
                     "kultury <strong>nie da się policzyć</strong> — a bez niego porównanie "
                     "cen nie ma sensu. Poniżej pozycje o tym samym składzie wraz z ich "
                     "kosztem litra.</p>\n")
        elif tansze:
            c.append("<p><strong>%d</strong> %s tańsz%s za litr mleka przy tym samym "
                     "składzie.</p>\n" % (len(tansze),
                                          "pozycja jest" if len(tansze) == 1 else "pozycje są",
                                          "a" if len(tansze) == 1 else "e"))
        else:
            c.append("<p>Ten sam skład ma %d %s — żadna nie wychodzi taniej za litr.</p>\n"
                     % (len(inne), "inna pozycja" if len(inne) == 1 else "innych pozycji"))

        c.append("<table>\n<thead><tr><th>Nazwa</th><th>Sklep</th><th>Za litr</th>"
                 "<th>Zastosowanie</th></tr></thead>\n<tbody>\n")
        for x in inne:
            kx = za_litr(x.get("cena"), x.get("litry"))
            c.append('<tr><td><a href="%s/kultury/%s">%s</a></td><td>%s</td>'
                     "<td>%s</td><td>%s</td></tr>\n" % (
                         BAZA, adres_kultury(x["name"]), e(x["name"]), e(x.get("shop", "—")),
                         ("%s zł/L" % zl(kx)) if kx is not None else "nieznany",
                         e(x.get("application", ""))))
        c.append("</tbody>\n</table>\n")
        c.append("<p><strong>Ten sam skład to nie to samo, co ten sam produkt.</strong> "
                 "Producenci dobierają konkretne szczepy w obrębie gatunku i ich proporcje, "
                 "a tego żadna tabela nie pokazuje. Przed zamianą porównaj zastosowanie, "
                 "nie tylko skład.</p>\n")

    # ── co jest w środku ──
    c.append("<h2>Co jest w środku</h2>\n")
    szczepy = zam.rozbij_sklad(k.get("composition", ""))
    if szczepy:
        c.append("<ul>\n%s</ul>\n" % "".join("<li><em>%s</em></li>\n" % e(zam.ladny(s)) for s in szczepy))
    elif k.get("composition"):
        c.append("<p>%s</p>\n" % e(k["composition"]))
    if k.get("strainRatio"):
        c.append("<p>Proporcja szczepów: <strong>%s</strong> — to ona rozstrzyga o "
                 "zamienności w obrębie tego samego składu.</p>\n" % e(k["strainRatio"]))
    if k.get("application"):
        c.append("<p><strong>Do czego:</strong> %s</p>\n" % e(k["application"]))
    if k.get("temperature"):
        c.append("<p><strong>Temperatura pracy:</strong> %s</p>\n" % e(k["temperature"]))

    c.append('<p><a href="%s/baza-kultur">Cała baza kultur</a> · '
             '<a href="%s/zamienniki-kultur">Wszystkie grupy zamienników</a> · '
             '<a href="%s/porownywarka-kultur">Porównywarka</a></p>\n'
             "</body>\n</html>\n" % (BAZA, BAZA, BAZA))
    return "".join(c)


def main():
    rek = wczytaj_pelne()
    grupy = zam.grupuj(rek)

    # mapa nazwa -> lista kultur o tym samym składzie
    do_grupy = {}
    for g in grupy:
        for k in g["kultury"]:
            do_grupy[k["name"]] = g["kultury"]

    if not os.path.isdir(KATALOG):
        os.makedirs(KATALOG)

    zapisane, pominiete, kolizje = 0, [], []
    widziane = {}
    for k in rek:
        plik = adres_kultury(k["name"]) + ".html"
        if plik in ZAJETE:
            pominiete.append(k["name"])
            continue
        # Dwie kultury o tej samej nazwie (różne sklepy) dają ten sam plik.
        # Wygrywa ta z ceną za litr — tak samo jak znajdzKulture() po stronie
        # Reacta, żeby bot i człowiek widzieli tę samą pozycję.
        if plik in widziane:
            kolizje.append(k["name"])
            stara = widziane[plik]
            if za_litr(stara.get("cena"), stara.get("litry")) is not None:
                continue
        widziane[plik] = k

    for plik, k in widziane.items():
        html = strona(k, do_grupy.get(k["name"]), rek)
        io.open(os.path.join(KATALOG, plik), "w", encoding="utf-8", newline="").write(html)
        zapisane += 1

    print("zapisano stron: %d" % zapisane)
    if kolizje:
        print("ta sama nazwa w kilku sklepach (jeden plik): %d — %s"
              % (len(kolizje), ", ".join(sorted(set(kolizje))[:8])))
    if pominiete:
        print("pominięte (kolizja z istniejącym mirrorem): %s" % ", ".join(pominiete))


if __name__ == "__main__":
    main()
