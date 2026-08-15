# -*- coding: utf-8 -*-
"""
Zbiera wiadomosci z kanalow RSS i zapisuje je jako statyczny public/wiadomosci.json.

DLACZEGO TAK, A NIE FUNKCJA BRZEGOWA:
Funkcja fetch-rss-news ma liste zrodel wpisana na sztywno, a jej wdrozenie wymaga
panelu Supabase, do ktorego nie mamy dostepu (konto zalozyl Lovable). Ten skrypt
uruchamiamy lokalnie, a wynik trafia na serwer przez FTP - ta sama droga co
mirrory GEO. Zadnego posrednika.

Aplikacja czyta /wiadomosci.json z wlasnej domeny (wiec bez CORS) i skleja go z
recznymi banerami z Supabase, ktore zostaja bez zmian.

Uzycie:
  python scripts/wiadomosci-rss.py            # zbiera i zapisuje
  python scripts/wiadomosci-rss.py --sucho    # tylko pokazuje, co by weszlo
"""
import io
import json
import re
import sys
import html
import hashlib
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

WYJSCIE = "public/wiadomosci.json"
LIMIT = 40
UA = "Mozilla/5.0 (compatible; MojaSerowarniaBot/1.0; +https://mojaserowarnia.pl)"

# Kazde zrodlo sprawdzone recznie - pobiera sie i zwraca pozycje.
# "jezyk" decyduje o tym, ktory zestaw slow kluczowych stosujemy.
ZRODLA = [
    {"url": "https://www.forummleczarskie.pl/files/rss.xml",    "nazwa": "Forum Mleczarskie", "jezyk": "pl"},
    {"url": "https://www.portalspozywczy.pl/rss/mleko.xml",     "nazwa": "Portal Spozywczy",  "jezyk": "pl"},
    {"url": "https://www.farmer.pl/rss/produkcjazwierzeca.xml", "nazwa": "Farmer.pl",         "jezyk": "pl"},
    {"url": "https://wiescirolnicze.pl/rss/hodowla.xml",        "nazwa": "Wiesci Rolnicze",   "jezyk": "pl"},
    {"url": "https://www.agropolska.pl/rss/",                   "nazwa": "Agropolska",        "jezyk": "pl"},
    {"url": "https://culturecheesemag.com/feed/",               "nazwa": "culture: cheese",   "jezyk": "en"},
    {"url": "https://cheesereporter.com/feed/",                 "nazwa": "Cheese Reporter",   "jezyk": "en"},
]

# Slowa dopasowywane do GRANIC SLOWA, nie jako fragmenty. Stara funkcja szukala
# "ser" przez includes(), wiec lapala "serce", "serwis", "seria", "deser" - stad
# traktory i rzepak w banerze o serowarstwie.
SLOWA_PL = [
    "ser", "sera", "serze", "serem", "sery", "serow", "serów", "serami", "serach",
    "serowarstwo", "serowarstwa", "serowarnia", "serowarni", "serowar", "serowarzy",
    "serowarska", "serowarskie", "serowarskiego",
    "serwatka", "serwatki", "sernik",
    "twarog", "twaróg", "twarogu", "twarogi", "twarogiem",
    "mleko", "mleka", "mleku", "mlekiem",
    "mleczarnia", "mleczarni", "mleczarnie", "mleczarstwo", "mleczarstwa",
    "mleczarz", "mleczarski", "mleczarskie", "mleczarskiego",
    "mleczny", "mleczna", "mlecznego", "mlecznych", "mlecznej",
    "nabial", "nabiał", "nabialu", "nabiału",
    "podpuszczka", "podpuszczki", "dojrzewalnia", "dojrzewalni",
]
SLOWA_EN = [
    "cheese", "cheeses", "cheesemaker", "cheesemakers", "cheesemaking", "cheesemonger",
    "dairy", "dairies", "milk", "curd", "curds", "creamery", "creameries",
    "rennet", "whey", "farmstead",
]


def wzorzec(slowa):
    return re.compile(r"\b(" + "|".join(re.escape(s) for s in slowa) + r")\b", re.I | re.U)


WZ = {"pl": wzorzec(SLOWA_PL), "en": wzorzec(SLOWA_EN)}


def bez_html(t):
    t = re.sub(r"<[^>]+>", " ", t or "")
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def obrazek(opis, elem):
    for tag in ("enclosure",
                "{http://search.yahoo.com/mrss/}content",
                "{http://search.yahoo.com/mrss/}thumbnail"):
        e = elem.find(tag)
        if e is not None:
            u = e.get("url")
            if u and re.search(r"\.(jpe?g|png|webp|gif)", u, re.I):
                return u
    m = re.search(r'<img[^>]+src="([^"]+)"', opis or "", re.I)
    return m.group(1) if m else None


def data_iso(txt):
    try:
        d = parsedate_to_datetime(txt)
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        return d.date().isoformat(), d
    except Exception:
        dzis = datetime.now(timezone.utc)
        return dzis.date().isoformat(), dzis


def pobierz(z):
    req = urllib.request.Request(z["url"], headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=25) as r:
        surowe = r.read()
    korzen = ET.fromstring(surowe)
    pozycje = []
    for it in korzen.iter("item"):
        tytul = bez_html(it.findtext("title") or "")
        link = (it.findtext("link") or "").strip()
        opis_raw = it.findtext("description") or ""
        opis = bez_html(opis_raw)
        if not tytul or not link:
            continue
        # Filtrujemy po TYTULE. Stara wersja brala tez opis, przez co wchodzily
        # artykuly, w ktorych slowo padalo raz w stopce albo w reklamie.
        if not WZ[z["jezyk"]].search(tytul):
            continue
        d_iso, d_obj = data_iso(it.findtext("pubDate") or "")
        pozycje.append({
            "id": "rss-" + hashlib.sha1(link.encode("utf-8")).hexdigest()[:16],
            "title": tytul[:200],
            "subtitle": opis[:220] or None,
            "imageUrl": obrazek(opis_raw, it),
            "linkUrl": link,
            "date": d_iso,
            "type": "archive",
            "zrodlo": z["nazwa"],
            "_sort": d_obj.isoformat(),
        })
    return pozycje


def main():
    sucho = "--sucho" in sys.argv
    wszystko = []
    widziane = set()
    for z in ZRODLA:
        try:
            p = pobierz(z)
            nowe = [x for x in p if x["linkUrl"] not in widziane]
            for x in nowe:
                widziane.add(x["linkUrl"])
            wszystko += nowe
            print("  %-22s %2d na temat" % (z["nazwa"], len(nowe)))
        except Exception as e:
            print("  %-22s BLAD: %s" % (z["nazwa"], e))

    wszystko.sort(key=lambda x: x["_sort"], reverse=True)
    wszystko = wszystko[:LIMIT]
    for x in wszystko:
        del x["_sort"]

    print("")
    print("Razem po filtrze: %d (zapisujemy %d)" % (len(widziane), len(wszystko)))

    if sucho:
        for x in wszystko[:15]:
            print("   [%s] %-18s %s" % (
                x["date"], x["zrodlo"],
                x["title"][:60].encode("ascii", "replace").decode()))
        return

    dane = {"wygenerowano": datetime.now(timezone.utc).isoformat(), "pozycje": wszystko}
    io.open(WYJSCIE, "w", encoding="utf-8", newline="").write(
        json.dumps(dane, ensure_ascii=False, indent=1))
    print("Zapisano %s" % WYJSCIE)


if __name__ == "__main__":
    main()
