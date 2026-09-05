#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Porownanie wlasnego licznika botow z danymi Cloudflare.

PO CO: licznik `bot_visits` mierzy to, co przeszlo przez workera. Cloudflare
mierzy WSZYSTKO, co dotarlo do brzegu — razem z zadaniami obsluzonymi z cache,
ktore workera nigdy nie uruchamiaja. Roznica miedzy tymi liczbami nie jest
bledem, tylko informacja: mowi, jaka czesc ruchu w ogole widzimy.

To jest jedyna dostepna KALIBRACJA licznika. Cloudflare raportuje wlasny ruch
na brzegu i tego nie da sie podrobic naglowkiem User-Agent — inaczej niz panel
AI Crawl Control, ktory przypisuje zadanie do operatora po samej deklaracji
klienta (sprawdzone doswiadczalnie 2026-09-03: dwa `curl` podpisane jako
PerplexityBot podniosly tam licznik "AI Answer retrievals" o dwa).

UWAGA NA CACHE: przy 98% trafien w cache (stan 2026-09-05) wiekszosc zadan nie
dochodzi do workera. Dlatego licznik ZAWSZE pokaze mniej niz Cloudflare i to
jest poprawne. Niepokojace byloby dopiero, gdyby stosunek zmienil sie skokowo.

UPRAWNIENIA: token musi miec `Zone → Analytics → Read`. Token do wdrozen go
NIE MA — przy pierwszym uruchomieniu skrypt powie to wprost.

UZYCIE:
  python scripts/porownaj-cloudflare.py            # ostatnie 7 dni
  python scripts/porownaj-cloudflare.py --dni 30
"""
import io
import json
import os
import sys
import urllib.request
from datetime import date, timedelta

KATALOG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def wczytaj_env(nazwa):
    p = os.path.join(KATALOG, nazwa)
    out = {}
    if not os.path.exists(p):
        return out
    for linia in io.open(p, encoding="utf-8"):
        if not linia.strip() or linia.lstrip().startswith("#"):
            continue
        k, _, v = linia.partition("=")
        if v:
            out[k.strip()] = v.strip()
    return out


def main():
    dni = 7
    if "--dni" in sys.argv:
        dni = int(sys.argv[sys.argv.index("--dni") + 1])

    env = wczytaj_env(".env.deploy")
    token = os.environ.get("CLOUDFLARE_API_TOKEN") or env.get("CLOUDFLARE_API_TOKEN")
    zone = os.environ.get("CLOUDFLARE_ZONE_ID") or env.get("CLOUDFLARE_ZONE_ID")

    if not token:
        sys.exit("Brak CLOUDFLARE_API_TOKEN (szukam w srodowisku i w .env.deploy).")
    if not zone:
        sys.exit("Brak CLOUDFLARE_ZONE_ID. Znajdziesz go w panelu Cloudflare:\n"
                 "  Overview -> API -> Zone ID. Dopisz do .env.deploy jako CLOUDFLARE_ZONE_ID=...")

    od = (date.today() - timedelta(days=dni)).isoformat()
    zapytanie = """
    { viewer { zones(filter: {zoneTag: "%s"}) {
        httpRequests1dGroups(limit: %d, orderBy: [date_DESC], filter: {date_geq: "%s"}) {
          dimensions { date }
          sum { requests cachedRequests bytes cachedBytes }
          uniq { uniques }
        } } } }
    """ % (zone, dni + 1, od)

    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/graphql",
        data=json.dumps({"query": zapytanie}).encode("utf-8"),
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as o:
        dane = json.loads(o.read().decode("utf-8"))

    if dane.get("errors"):
        komunikat = json.dumps(dane["errors"], ensure_ascii=False)
        if "analytics.read" in komunikat:
            sys.exit("Token nie ma uprawnienia 'Zone -> Analytics -> Read'.\n"
                     "W panelu: My Profile -> API Tokens -> edytuj token -> dodaj\n"
                     "  Zone / Analytics / Read   dla strefy mojaserowarnia.pl\n"
                     "Token do wdrozen ma tylko prawa do Workers, wiec bez tego nie zadziala.")
        sys.exit("Cloudflare zwrocil blad: " + komunikat[:400])

    strefy = dane["data"]["viewer"]["zones"]
    if not strefy:
        sys.exit("Cloudflare nie zwrocil zadnej strefy — sprawdz CLOUDFLARE_ZONE_ID.")

    grupy = strefy[0]["httpRequests1dGroups"]
    print("CLOUDFLARE — ostatnie %d dni (dane z brzegu, nie z workera)\n" % dni)
    print("  %-12s %10s %10s %8s %10s" % ("DATA", "ZADAN", "Z CACHE", "CACHE%", "DANYCH"))

    suma_z = suma_c = suma_b = 0
    for g in grupy:
        s = g["sum"]
        suma_z += s["requests"]
        suma_c += s["cachedRequests"]
        suma_b += s["bytes"]
        print("  %-12s %10d %10d %7.0f%% %8.1f MB"
              % (g["dimensions"]["date"], s["requests"], s["cachedRequests"],
                 100 * s["cachedRequests"] / max(s["requests"], 1), s["bytes"] / 1048576))

    print("\n  %-12s %10d %10d %7.0f%% %8.1f MB"
          % ("RAZEM", suma_z, suma_c, 100 * suma_c / max(suma_z, 1), suma_b / 1048576))

    print("\n" + "-" * 68)
    print("PORÓWNANIE Z LICZNIKIEM — wklej w SQL Editor Supabase:\n")
    print("""select kategoria,
       count(*) filter (where zweryfikowany is true)  as prawdziwe,
       count(*) filter (where zweryfikowany is false) as podszyte,
       count(*) filter (where zweryfikowany is null)  as niepewne,
       count(*)                                       as razem
from bot_visits
where not wlasne
  and odwiedzono >= now() - interval '%d days'
group by kategoria
order by razem desc;""" % dni)
    print("""
-- Ile z ruchu Cloudflare w ogole widzi worker:
select count(*) as wizyt_botow_w_liczniku from bot_visits
where not wlasne and odwiedzono >= now() - interval '%d days';""" % dni)
    print("\n  Cloudflare naliczyl w tym okresie %d zadan." % suma_z)
    print("  Licznik zobaczy MNIEJ i to jest poprawne: %.0f%% zadan Cloudflare"
          % (100 * suma_c / max(suma_z, 1)))
    print("  obsluzyl z cache, nie uruchamiajac workera.")


if __name__ == "__main__":
    main()
