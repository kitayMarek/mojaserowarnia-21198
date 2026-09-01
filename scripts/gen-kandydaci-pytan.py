#!/usr/bin/env python3
"""
Kandydaci na pytania do panelu - z DANYCH, nie z glowy.

Scala trzy zrodla z data/pytania/zrodla/ w jedna liste klastrow intencji:
  * Google Search Console  - gsc-zapytania.csv  (wyswietlenia, kliki, pozycja)
  * Bing Webmaster Tools   - bing-zapytania.csv (to samo + zapytania z AI)
  * Senuto                 - senuto-widocznosc.xlsx (SREDNI MIESIECZNY WOLUMEN)

Po co trzy: GSC i Bing pokazuja tylko to, na co JUZ jestesmy widoczni - zapytanie,
na ktore nie mamy tresci, nie pojawi sie tam wcale. Senuto podaje wolumen niezalezny
od naszej widocznosci, wiec dopiero razem widac i popyt, i luki.

UWAGA o eksporcie GSC: plik zapytan jest dla CALEJ domeny, nie dla jednej strony
(GSC nie eksportuje przekroju zapytanie x strona). Przypisanie zapytan do strony
robimy wiec po TEMACIE - stad ponizsze klastry sa recznie zdefiniowane i trzeba je
przejrzec, gdy panel trafi na kolejna strone.

Uruchom:  python scripts/gen-kandydaci-pytan.py
Wynik:    data/pytania/kandydaci-<slug>.md  (raport do przejrzenia przez czlowieka)
"""
import csv, io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZRODLA = os.path.join(ROOT, "data", "pytania", "zrodla")

# Klastry intencji dla /prawo/rhd. Kolejnosc ma znaczenie: zapytanie trafia do
# PIERWSZEGO pasujacego klastra, wiec waskie wzorce musza stac nad szerokimi.
KLASTRY = [
    ("kto-moze", "Kto może prowadzić RHD — czy trzeba być rolnikiem?",
     r"kto mo\w+ prowadzi|czy trzeba by\w+ rolnikiem|rolnik mo\w+ sprzedawa|co mo\w+ sprzedawa\w+ rolnik"),
    ("co-mozna-sprzedawac", "Czy mogę sprzedawać sery własnej produkcji w ramach RHD?",
     r"sprzeda\w+ ser\w+ w\w+asnej|rhd co mo\w+na sprzedawa|sprzeda\w+ przetwor\w+|sprzeda\w+ w ramach rhd|sprzedawa\w+ w\w+asne przetwory|p\w+od\w+w rolnych z w\w+asnego"),
    ("ewidencja", "Co musi zawierać ewidencja sprzedaży w RHD?",
     r"ewidencj"),
    ("zgloszenie-us", "Czy RHD trzeba zgłaszać do urzędu skarbowego?",
     r"urz\w+du skarbowego|rhd.*podatek|handel detaliczny podatek|detaliczny a vat"),
    ("limit-przychodu", "Jaki jest limit przychodu w RHD?",
     r"limit"),
    ("kasa-faktura", "Czy w RHD potrzebna jest kasa fiskalna?",
     r"kasa fiskaln|faktur|paragon"),
    ("rejestracja", "Gdzie i kiedy zarejestrować działalność RHD?",
     r"rejestracj|sanepid|wniosek|jak zacz\w+|zg\w+oszenie|wymog\w* sanitarn|wymagani|wymogi|ustawa"),
    ("vs-sprzedaz-bezposrednia", "Czym różni się RHD od sprzedaży bezpośredniej?",
     r"sprzeda\w+ bezpo\w+redni|rolnicza sprzeda\w+ detaliczna|handel rolniczy|handel p\w+odami"),
    ("numer-rhd", "Co to jest numer RHD i jak wygląda?",
     r"numer rhd|wykaz"),
    ("przez-internet", "Czy w ramach RHD można sprzedawać przez internet?",
     r"przez internet"),
    ("co-to-rhd", "Co to jest RHD?",
     r"co to|co znaczy|znaczy rhd|^rhd$|^rolniczy handel detaliczny$"),
    ("dokumenty-kontrola", "Jakie dokumenty trzeba mieć na kontrolę w RHD?",
     r"dokument|kontrol|etykiet"),
    ("miod-jaja", "(poza tematem serowarskim: miód, jaja)",
     r"mi\w+d|jaj"),
]

# Zapytania serowarskie czesto NIE zawieraja slowa "rhd" - "sprzedaz serow wlasnej
# produkcji" to 50 wyszukiwan miesiecznie i dokladnie nasz uzytkownik, tyle ze jeszcze
# nie zna nazwy formy prawnej. Filtr musi je lapac, inaczej wypadaja z analizy.
FILTR_TEMATU = re.compile(
    r"\brhd\b|rolnicz\w+ handel|rolnicza sprzeda|handel detaliczn|ewidencj\w+ sprzeda"
    r"|sprzeda\w* (?:ser|przetwor|p\w+od)|rolnik mo\w+ sprzeda|sprzedawa\w+ w\w+asne"
    r"|w\w+asnego gospodarstwa|sprzeda\w+ bezpo\w+redni", re.I)

# Zapytania z "rhd", ktore NIE dotycza rolniczego handlu detalicznego: RHD to takze
# "right-hand drive" (auta z kierownica po prawej). Samo "rhd plus" to 210 wyszukiwan
# miesiecznie - gdyby wpadlo do klastra, zbudowalibysmy pytanie dla ruchu, ktory
# nigdy nie szukal sera.
OBCE = re.compile(r"samochod|\bauto|kierownic|nowogard|stacja|paliw|\brhd plus\b|\ba rhd \+", re.I)


def bez_ogonkow(t):
    return t.translate(str.maketrans("ąćęłńóśźż", "acelnoszz"))


def licz(t):
    """Liczba z eksportu: Bing/Senuto uzywaja przecinka jako separatora dziesietnego."""
    if t is None:
        return 0.0
    t = str(t).strip().replace("%", "").replace(" ", "").replace(",", ".")
    try:
        return float(t)
    except ValueError:
        return 0.0


def czytaj_gsc():
    sciezka = os.path.join(ZRODLA, "gsc-zapytania.csv")
    with io.open(sciezka, encoding="utf-8-sig", newline="") as f:
        for w in csv.DictReader(f):
            zapytanie = (w.get("Najczęstsze zapytania") or "").strip()
            if zapytanie:
                yield zapytanie, licz(w.get("Wyświetlenia")), licz(w.get("Kliknięcia")), licz(w.get("Pozycja"))


def czytaj_bing():
    sciezka = os.path.join(ZRODLA, "bing-zapytania.csv")
    with io.open(sciezka, encoding="utf-8-sig", newline="") as f:
        for w in csv.DictReader(f):
            zapytanie = (w.get("Słowo kluczowe") or "").strip()
            if zapytanie:
                yield zapytanie, licz(w.get("Wyświetlenia")), licz(w.get("Kliknięcia")), licz(w.get("Śr. pozycja"))


def czytaj_senuto():
    try:
        import openpyxl
    except ImportError:
        print("  (openpyxl niedostepny - pomijam Senuto)", file=sys.stderr)
        return
    sciezka = os.path.join(ZRODLA, "senuto-widocznosc.xlsx")
    skoroszyt = openpyxl.load_workbook(sciezka, read_only=True, data_only=True)
    arkusz = skoroszyt[skoroszyt.sheetnames[0]]
    for i, wiersz in enumerate(arkusz.iter_rows(values_only=True)):
        if i == 0 or not wiersz or not wiersz[0]:
            continue
        yield str(wiersz[0]).strip(), licz(wiersz[1]), licz(wiersz[2])


def dopasuj(zapytanie):
    plaskie = bez_ogonkow(zapytanie.lower())
    for klucz, _tytul, wzor in KLASTRY:
        if re.search(bez_ogonkow(wzor), plaskie):
            return klucz
    return "inne"


def main():
    zebrane = {k: {"gsc": [], "bing": [], "senuto": []} for k, _, _ in KLASTRY}
    zebrane["inne"] = {"gsc": [], "bing": [], "senuto": []}

    for zapytanie, wysw, kliki, poz in czytaj_gsc():
        if FILTR_TEMATU.search(zapytanie) and not OBCE.search(zapytanie):
            zebrane[dopasuj(zapytanie)]["gsc"].append((zapytanie, wysw, kliki, poz))
    for zapytanie, wysw, kliki, poz in czytaj_bing():
        if FILTR_TEMATU.search(zapytanie) and not OBCE.search(zapytanie):
            zebrane[dopasuj(zapytanie)]["bing"].append((zapytanie, wysw, kliki, poz))
    for zapytanie, wolumen, poz in czytaj_senuto():
        if FILTR_TEMATU.search(zapytanie) and not OBCE.search(zapytanie):
            zebrane[dopasuj(zapytanie)]["senuto"].append((zapytanie, wolumen, poz))

    tytuly = dict((k, t) for k, t, _ in KLASTRY)
    tytuly["inne"] = "(niesklasyfikowane — przejrzyj i dopisz wzorzec)"

    wiersze = []
    for klucz in list(tytuly):
        d = zebrane[klucz]
        wiersze.append({
            "klucz": klucz, "tytul": tytuly[klucz],
            "gsc_wysw": sum(x[1] for x in d["gsc"]),
            "gsc_kliki": sum(x[2] for x in d["gsc"]),
            "senuto_wolumen": sum(x[1] for x in d["senuto"]),
            "bing_wysw": sum(x[1] for x in d["bing"]),
            "zapytan": len(d["gsc"]) + len(d["bing"]) + len(d["senuto"]),
            "dane": d,
        })
    # Sortowanie po wolumenie Senuto, potem po wyswietleniach GSC: wolumen mowi o
    # POPYCIE, wyswietlenia tylko o naszej obecnej widocznosci.
    wiersze.sort(key=lambda r: (r["senuto_wolumen"], r["gsc_wysw"]), reverse=True)

    linie = ["# Kandydaci na pytania — /prawo/rhd", "",
             "PLIK GENEROWANY: `python scripts/gen-kandydaci-pytan.py`. Nie edytuj ręcznie —",
             "zmieniaj klastry w skrypcie albo eksporty w `data/pytania/zrodla/`.", "",
             "Kolumna **Senuto** to średni miesięczny wolumen wyszukiwań (popyt niezależny od",
             "naszej widoczności). **GSC**/**Bing** to wyświetlenia, czyli gdzie już nas widać.", "",
             "| Klaster | Senuto/mies. | GSC wyśw. | GSC klik. | Bing wyśw. | zapytań |",
             "|---|---:|---:|---:|---:|---:|"]
    for r in wiersze:
        linie.append("| %s — %s | %d | %d | %d | %d | %d |" % (
            r["klucz"], r["tytul"], r["senuto_wolumen"], r["gsc_wysw"],
            r["gsc_kliki"], r["bing_wysw"], r["zapytan"]))

    linie += ["", "## Zapytania w klastrach", ""]
    for r in wiersze:
        if not r["zapytan"]:
            continue
        linie.append("### %s — %s" % (r["klucz"], r["tytul"]))
        for nazwa, dane in (("Senuto (wolumen/mies., pozycja)", r["dane"]["senuto"]),):
            if dane:
                linie.append("**%s**" % nazwa)
                for q in sorted(dane, key=lambda x: -x[1]):
                    linie.append("- `%s` — %d, poz. %s" % (q[0], q[1], q[2]))
        for nazwa, dane in (("GSC (wyświetlenia, kliknięcia, pozycja)", r["dane"]["gsc"]),
                            ("Bing (wyświetlenia, kliknięcia, pozycja)", r["dane"]["bing"])):
            if dane:
                linie.append("**%s**" % nazwa)
                for q in sorted(dane, key=lambda x: -x[1]):
                    linie.append("- `%s` — %d wyśw., %d klik., poz. %.1f" % (q[0], q[1], q[2], q[3]))
        linie.append("")

    wynik = os.path.join(ROOT, "data", "pytania", "kandydaci-prawo-rhd.md")
    io.open(wynik, "w", encoding="utf-8", newline="\n").write("\n".join(linie) + "\n")
    print("Zapisano %s" % os.path.relpath(wynik, ROOT))
    print()
    print("%-26s %9s %9s %9s" % ("KLASTER", "SENUTO", "GSC", "BING"))
    for r in wiersze:
        if r["zapytan"]:
            print("%-26s %9d %9d %9d" % (r["klucz"], r["senuto_wolumen"], r["gsc_wysw"], r["bing_wysw"]))


if __name__ == "__main__":
    main()
