#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator strony o zamiennikach kultur — grupowanie po SKLADZIE, nie po nazwie.

DLACZEGO: w bazie 188 kultur ponad polowa to ten sam sklad szczepowy sprzedawany
pod roznymi nazwami handlowymi. Kupujacy nie ma szans tego zauwazyc, bo kazdy
sklep pokazuje wylacznie wlasny katalog. To jedyna tresc, ktorej ZADEN sklep nie
moze napisac — wymaga widoku na piec katalogow naraz.

OSTROZNIE Z WNIOSKIEM: ten sam sklad NIE znaczy "ten sam produkt". Producenci
dobieraja konkretne szczepy w obrebie gatunku i ich proporcje, czego tabela nie
pokazuje. Widac to po przeznaczeniu — ML, MO, MSO i MLL maja identyczny sklad,
a sluza do innych rzeczy. Dlatego strona mowi "zwykle zadziala jako zamiennik,
ale sprawdz przeznaczenie", a nie "to to samo".

Ta sama regula normalizacji jest w src/lib/grupyKultur.ts (wersja React).
Przy zmianie poprawic OBA miejsca.

UZYCIE:
  python scripts/gen-zamienniki.py            # podglad grup, nic nie zapisuje
  python scripts/gen-zamienniki.py --zapisz   # generuje public/zamienniki-kultur.html
"""
import io
import os
import re
import sys
from collections import defaultdict
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZRODLO = os.path.join(ROOT, "src", "data", "culturesDataComplete.ts")
WYJSCIE = os.path.join(ROOT, "public", "zamienniki-kultur.html")

SKROTY = [
    (r"\blactococcus\b", "l."),
    (r"\blactobacillus\b", "lb."),
    (r"\bstreptococcus\b", "s."),
    (r"\bleuconostoc\b", "ln."),
    (r"\bpropionibacterium\b", "p."),
    (r"\bpenicillium\b", "pen."),
    (r"\bgeotrichum\b", "g."),
    (r"\bbrevibacterium\b", "b."),
]
PELNE = {
    "l.": "Lactococcus", "lb.": "Lactobacillus", "s.": "Streptococcus",
    "ln.": "Leuconostoc", "p.": "Propionibacterium", "pen.": "Penicillium",
    "g.": "Geotrichum", "b.": "Brevibacterium",
}


POLSKIE = re.compile(
    r"[ąćęłńóśżź]|(bakterie|drozdze|kultur\w*|mieszank\w*|szczep\w*|"
    r"wyselekcjonowan\w*|ochronn\w*|nieukwaszaj\w*|kwaszac\w*|mezofiln\w*|"
    r"termofiln\w*|dodatek|aromat\w*)", re.I)


def czy_lacinska(czesc):
    """Czy to nazwa gatunku, a nie polski opis marketingowy."""
    return not POLSKIE.search(czesc)


def rozbij_sklad(sklad):
    if not sklad:
        return []
    s = sklad.lower()
    s = re.sub(r"\b(subsp|ssp|var)\.?\b", ".", s)
    for wz, zam in SKROTY:
        s = re.sub(wz, zam, s)
    czesci = re.split(r"[,;+/]| oraz | i (?=[a-ząćęłńóśżź.])", s)
    out = set()
    for c in czesci:
        c = re.sub(r"[^a-ząćęłńóśżź. ]", " ", c)
        c = " ".join(c.split()).strip()
        if len(c) >= 5 and re.search(r"[a-ząćęłńóśżź]{3}", c):
            out.add(c)
    return sorted(out)


def ladny(s):
    slowa = s.split(" ")
    if slowa[0] in PELNE:
        s = " ".join([PELNE[slowa[0]]] + slowa[1:])
    else:
        s = s[:1].upper() + s[1:]
    # "delbrueckii . bulgaricus" -> "delbrueckii subsp. bulgaricus"
    s = re.sub(r"\s+\.+\s+", " subsp. ", s)
    return " ".join(s.split())


def wczytaj():
    h = io.open(ZRODLO, encoding="utf-8").read()
    rek = []
    for blok in re.findall(r"\{(.*?)\}", h, re.S):
        d = dict(re.findall(r'(\w+):\s*"([^"]*)"', blok))
        liczba = re.search(r"price_numeric:\s*([\d.]+)", blok)
        if "name" in d and "composition" in d:
            d["cena"] = float(liczba.group(1)) if liczba else None
            rek.append(d)
    return rek


def grupuj(rek):
    mapa = defaultdict(list)
    for k in rek:
        szczepy = rozbij_sklad(k.get("composition", ""))
        # Grupujemy WYLACZNIE po nazwach gatunkow. Sklad opisany po polsku
        # ("mieszanka szczepow mezofilnych") niczego nie identyfikuje.
        if szczepy and all(czy_lacinska(s) for s in szczepy):
            mapa["|".join(szczepy)].append(k)

    grupy = []
    for klucz, lista in mapa.items():
        if len({k["name"].strip().lower() for k in lista}) < 2:
            continue
        ceny = [k["cena"] for k in lista if k.get("cena")]
        zast = {(k.get("application") or "").strip().lower() for k in lista if k.get("application")}
        proporcje = {k.get("strainRatio") for k in lista if k.get("strainRatio")}
        grupy.append({
            "id": re.sub(r"[^a-z0-9]+", "-", klucz).strip("-")[:80],
            "szczepy": klucz.split("|"),
            "kultury": sorted(lista, key=lambda k: k["name"].lower()),
            "sklepy": sorted({k.get("shop", "") for k in lista if k.get("shop")}),
            "cena_min": min(ceny) if ceny else None,
            "cena_max": max(ceny) if ceny else None,
            "rozne_zastosowania": len(zast) > 1,
            "rozne_proporcje": len(proporcje) > 1,
        })
    return sorted(grupy, key=lambda g: -len(g["kultury"]))


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def zbuduj_html(grupy, wszystkie):
    dzis = date.today().isoformat()
    w_grupach = sum(len(g["kultury"]) for g in grupy)
    proc = round(100.0 * w_grupach / len(wszystkie))

    faq = [
        ("Czy kultury o tym samym składzie to ten sam produkt?",
         "Nie. Ten sam sklad gatunkowy oznacza te same gatunki bakterii, ale producenci dobieraja konkretne szczepy w obrebie gatunku i ich proporcje — a tego zadna tabela nie pokazuje. Widac to po przeznaczeniu: ML, MO, MSO i MLL maja identyczny sklad, a sluza do maslа, twarogu i fety. Jako zamiennik zwykle zadziala, ale profil smaku i tempo zakwaszania moga sie roznic."),
        ("Czym zastąpić kulturę, której nie ma w sklepie?",
         "Poszukaj innej kultury o tym samym skladzie szczepowym. W bazie %d z %d kultur (%d%%) ma sklad wspolny z co najmniej jedna inna pozycja, czesto z innego sklepu. Przed zamiana sprawdz przeznaczenie i zakres temperatur — to one decyduja, czy zamiennik pasuje do twojego sera."
         % (w_grupach, len(wszystkie), proc)),
        ("Co znaczy kultura starterowa?",
         "Ze startuje zakwaszanie mleka — a nie ze jest dla poczatkujacych. Kultura starterowa to szczepy bakterii kwasu mlekowego, ktore przetwarzaja laktoze w kwas mlekowy, uruchamiajac dzialanie podpuszczki i ksztaltujac smak. Praktycznie kazda kultura serowarska jest starterowa, wiec sam ten przymiotnik niczego nie zawezai przy wyborze."),
        ("Dlaczego ta sama kultura ma różne nazwy w różnych sklepach?",
         "Bo nazwa jest handlowa, nie naukowa. Producenci (Danisco/Choozit, Sacco, Beaugel, ARTiVEG i inni) nadaja wlasne oznaczenia, a sklepy sprzedaja to, co maja w umowie dystrybucyjnej. Ten sam Penicillium candidum wystepuje jako PC, SIGMA 75, Penicillium Candidum PC 22 i PC Neige."),
    ]

    czesci = []
    czesci.append("""<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Zamienniki kultur bakteryjnych — te same szczepy, inne nazwy</title>
  <meta name="description" content="Czym zastąpić kulturę, której nie ma w sklepie: %d z %d kultur ma skład wspólny z inną pozycją. %d grup składowych z nazwami handlowymi, sklepami i cenami." />
  <link rel="canonical" href="https://mojaserowarnia.pl/zamienniki-kultur.html" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="Zamienniki kultur bakteryjnych — te same szczepy, inne nazwy" />
  <meta property="og:description" content="%d grup kultur o identycznym składzie szczepowym, sprzedawanych pod różnymi nazwami w 5 polskich sklepach." />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://mojaserowarnia.pl/zamienniki-kultur.html" />
  <meta property="og:site_name" content="Moja Serowarnia" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:image" content="https://mojaserowarnia.pl/og-image.png" />
""" % (w_grupach, len(wszystkie), len(grupy), len(grupy)))

    czesci.append("""  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Zamienniki kultur bakteryjnych — te same szczepy pod różnymi nazwami",
    "description": "Analiza %d kultur z 5 polskich sklepow: %d z nich (%d%%) ma sklad szczepowy wspolny z inna pozycja. %d grup skladowych z nazwami handlowymi, sklepami i cenami.",
    "datePublished": "%s",
    "dateModified": "%s",
    "inLanguage": "pl-PL",
    "author": { "@type": "Organization", "name": "Moja Serowarnia" },
    "publisher": { "@type": "Organization", "name": "Moja Serowarnia", "url": "https://mojaserowarnia.pl" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://mojaserowarnia.pl/zamienniki-kultur.html" }
  }
  </script>
""" % (len(wszystkie), w_grupach, proc, len(grupy), dzis, dzis))

    pytania = ",\n".join(
        '      { "@type": "Question", "name": "%s", "acceptedAnswer": { "@type": "Answer", "text": "%s" } }'
        % (esc(p), esc(o)) for p, o in faq
    )
    czesci.append('  <script type="application/ld+json">\n  {\n    "@context": "https://schema.org",\n    "@type": "FAQPage",\n    "mainEntity": [\n%s\n    ]\n  }\n  </script>\n' % pytania)

    czesci.append("""  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://mojaserowarnia.pl" },
      { "@type": "ListItem", "position": 2, "name": "Baza kultur", "item": "https://mojaserowarnia.pl/baza-kultur" },
      { "@type": "ListItem", "position": 3, "name": "Zamienniki kultur", "item": "https://mojaserowarnia.pl/zamienniki-kultur.html" }
    ]
  }
  </script>

  <style>
    :root { --brand:#b45309; --brand-dark:#92400e; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; --bg-soft:#fffbeb; }
    * { box-sizing:border-box; }
    body { max-width:980px; margin:0 auto; padding:2rem 1.25rem 4rem; font:16px/1.7 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:var(--ink); }
    h1 { font-size:1.95rem; line-height:1.25; color:var(--brand-dark); margin:0 0 .3rem; }
    h2 { font-size:1.3rem; margin-top:2.4rem; color:var(--brand-dark); border-bottom:2px solid var(--bg-soft); padding-bottom:.3rem; }
    h3 { font-size:1.02rem; margin:1.6rem 0 .4rem; color:var(--ink); }
    .lead { font-size:1.08rem; color:var(--muted); margin-top:0; }
    a { color:var(--brand); }
    table { border-collapse:collapse; width:100%; margin:.6rem 0 1.4rem; font-size:.94rem; }
    th, td { border:1px solid var(--line); padding:.42rem .55rem; text-align:left; vertical-align:top; }
    th { background:var(--bg-soft); }
    .tip { background:var(--bg-soft); border-left:3px solid var(--brand); padding:.6rem .8rem; margin:.8rem 0; }
    .warn { background:#fef2f2; border-left:3px solid #dc2626; padding:.6rem .8rem; margin:.8rem 0; }
    .meta { color:var(--muted); font-size:.88rem; margin:.2rem 0 .6rem; }
    .uwaga { color:#b91c1c; font-weight:600; }
  </style>
</head>
<body>
  <nav aria-label="Ścieżka nawigacji"><a href="https://mojaserowarnia.pl">Moja Serowarnia</a> › <a href="https://mojaserowarnia.pl/baza-kultur">Baza kultur</a> › Zamienniki</nav>
""")

    czesci.append("""
  <h1>Zamienniki kultur bakteryjnych — te same szczepy pod różnymi nazwami</h1>
  <p class="lead">W %d kulturach z pięciu polskich sklepów <strong>%d pozycji (%d%%) ma skład szczepowy wspólny z inną pozycją</strong>. Poniżej %d grup: co jest w środku, pod jakimi nazwami się to sprzedaje, gdzie i za ile.</p>

  <div class="warn"><strong>Zanim podmienisz:</strong> ten sam skład gatunkowy <strong>nie znaczy „ten sam produkt"</strong>. Producenci dobierają konkretne szczepy w obrębie gatunku i ich proporcje — tego nie widać w żadnej tabeli. Najlepiej pokazuje to grupa <em>Lactococcus lactis + cremoris</em>: ML, MO, MSO i MLL mają identyczny skład, a służą kolejno do serów do smarowania, masła, twarogu i fety. Zamiennik zwykle zadziała, ale <strong>sprawdź przeznaczenie i zakres temperatur</strong>.</div>

  <div class="warn"><strong>Twardy dowód, że to nie ostrożność na wyrost:</strong> jeden ze sklepów podaje przy linii LAMBDA proporcje szczepów. <strong>LAMBDA 3 ma 50:50, a LAMBDA 6, 7, 8 i 9 mają 80:20</strong> — przy identycznym składzie gatunkowym. W zestawieniu poniżej trafiają do jednej grupy, ale zachowają się inaczej. Grupy o różnych proporcjach są niżej oznaczone. Więcej w tekście o <a href="https://mojaserowarnia.pl/kto-produkuje-kultury.html">producentach kultur</a>.</div>

  <h2>Co znaczy „kultura starterowa"?</h2>
  <p>Że <strong>startuje zakwaszanie mleka</strong> — a nie że jest dla początkujących. To najczęstsze nieporozumienie przy pierwszych zakupach, bo po polsku „starter" brzmi jak „na start".</p>
  <p>Kultura starterowa to szczepy bakterii kwasu mlekowego, które przerabiają laktozę na kwas mlekowy: obniżają pH, uruchamiają działanie <a href="https://mojaserowarnia.pl/slownik.html#podpuszczka">podpuszczki</a> i kształtują smak. <strong>Praktycznie każda kultura serowarska jest starterowa</strong>, więc sam ten przymiotnik niczego nie zawęża przy wyborze — trzeba patrzeć na skład, temperaturę i przeznaczenie.</p>

  <h2>Dlaczego jedna kultura ma tyle nazw?</h2>
  <p>Bo nazwa jest handlowa, nie naukowa. Producenci — Danisco (Choozit), Sacco, Beaugel, ARTiVEG i inni — nadają własne oznaczenia, a każdy sklep sprzedaje to, co ma w umowie dystrybucyjnej. Ten sam <em>Penicillium candidum</em> figuruje jako PC, SIGMA 75, Penicillium Candidum PC 22 i PC Neige.</p>
  <p>Żaden sklep nie może tego pokazać, bo widzi wyłącznie własny katalog. To zestawienie powstaje z porównania pięciu naraz.</p>

  <h2>Grupy składowe — %d zestawów</h2>
""" % (len(wszystkie), w_grupach, proc, len(grupy), len(grupy)))

    for g in grupy:
        nazwa_grupy = " + ".join(ladny(s) for s in g["szczepy"])
        czesci.append('  <h3 id="%s">%s</h3>\n' % (esc(g["id"]), esc(nazwa_grupy)))
        opis = "%d nazw handlowych" % len({k["name"] for k in g["kultury"]})
        opis += " · %d %s" % (len(g["sklepy"]), "sklep" if len(g["sklepy"]) == 1 else "sklepy/sklepów")
        if g["cena_min"] is not None:
            if abs(g["cena_max"] - g["cena_min"]) < 0.01:
                opis += " · %.2f zł" % g["cena_min"]
            else:
                opis += " · od %.2f do %.2f zł" % (g["cena_min"], g["cena_max"])
        czesci.append('  <p class="meta">%s</p>\n' % esc(opis))
        if g["rozne_zastosowania"]:
            czesci.append('  <p class="meta"><span class="uwaga">Uwaga:</span> pozycje w tej grupie mają <strong>różne przeznaczenie</strong> mimo identycznego składu — porównaj kolumnę „Do czego" przed zamianą.</p>\n')
        # Rozne proporcje szczepow to mocniejszy sygnal niz rozne przeznaczenie:
        # przy identycznym skladzie gatunkowym rozstrzygaja o tym, czy kultury
        # naprawde sa zamiennikami (LAMBDA 3 = 50:50 wobec LAMBDA 6 = 80:20).
        if g.get("rozne_proporcje"):
            czesci.append('  <p class="meta"><span class="uwaga">To NIE są zamienniki:</span> '
                          'pozycje w tej grupie mają <strong>różne proporcje szczepów</strong> '
                          'mimo identycznego składu gatunkowego.</p>\n')
        czesci.append("  <table>\n    <thead><tr><th>Nazwa handlowa</th><th>Producent</th><th>Sklep</th>"
                      "<th>Cena</th><th>Proporcje</th><th>Temperatura</th><th>Do czego</th></tr></thead>\n    <tbody>\n")
        for k in g["kultury"]:
            czesci.append("      <tr><td><strong>%s</strong></td><td>%s</td><td>%s</td><td>%s</td>"
                          "<td>%s</td><td>%s</td><td>%s</td></tr>\n" % (
                esc(k.get("name")), esc(k.get("manufacturer") or "?"), esc(k.get("shop")),
                esc(k.get("price") or "—"), esc(k.get("strainRatio") or "?"),
                esc(k.get("temperature") or "—"), esc(k.get("application") or "—")))
        czesci.append("    </tbody>\n  </table>\n")

    czesci.append("""
  <h2>Najczęstsze pytania</h2>
""")
    for p, o in faq:
        czesci.append("  <h3>%s</h3>\n  <p>%s</p>\n" % (esc(p), esc(o)))

    czesci.append("""
  <h2>Powiązane strony</h2>
  <ul>
    <li><a href="https://mojaserowarnia.pl/baza-kultur">Baza kultur</a> — wszystkie %d pozycji z filtrami, cenami i linkami do sklepów</li>
    <li><a href="https://mojaserowarnia.pl/kultury/mezofilne.html">Kultury mezofilne</a> · <a href="https://mojaserowarnia.pl/kultury/termofilne.html">termofilne</a> · <a href="https://mojaserowarnia.pl/kultury/jogurtowe.html">jogurtowe</a></li>
    <li><a href="https://mojaserowarnia.pl/slownik.html#kultury-starterowe">Słownik: kultury starterowe</a> i 65 innych terminów</li>
    <li><a href="https://mojaserowarnia.pl/przepisy">Przepisy na sery</a> — która kultura do którego sera</li>
  </ul>
  <p class="meta">Zestawienie wygenerowane %s ze stanu bazy kultur. Ceny i dostępność zmieniają się — aktualne sprawdzisz w <a href="https://mojaserowarnia.pl/baza-kultur">bazie</a>.</p>
</body>
</html>
""" % (len(wszystkie), dzis))

    return "".join(czesci)


def main():
    zapis = "--zapisz" in sys.argv
    rek = wczytaj()
    grupy = grupuj(rek)
    w_grupach = sum(len(g["kultury"]) for g in grupy)

    print("Kultur w bazie: %d" % len(rek))
    print("Grup skladowych (>1 nazwa): %d" % len(grupy))
    print("Kultur w grupach: %d (%.0f%%)\n" % (w_grupach, 100.0 * w_grupach / len(rek)))
    for g in grupy:
        znak = " [ROZNE PRZEZNACZENIE]" if g["rozne_zastosowania"] else ""
        print("  %-52s %2d nazw, %d skl.%s" % (
            " + ".join(ladny(s) for s in g["szczepy"])[:52], len(g["kultury"]), len(g["sklepy"]), znak))

    if zapis:
        html = zbuduj_html(grupy, rek)
        io.open(WYJSCIE, "w", encoding="utf-8", newline="").write(html)
        print("\nZAPISANO %s (%d B)" % (os.path.relpath(WYJSCIE, ROOT), len(html.encode("utf-8"))))
    else:
        print("\n[podglad] Powtorz z --zapisz, zeby wygenerowac strone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
