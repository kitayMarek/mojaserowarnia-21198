#!/usr/bin/env python3
"""
Panel pytan: JEDNO zrodlo -> DWIE warstwy.

Czyta `data/pytania/<slug>.json` i z tego jednego pliku wytwarza:
  1. `src/data/panelPytan<Slug>.ts`  - dane dla komponentu React (plik GENEROWANY),
  2. blok HTML wstrzykniety do mirrora `public/...` miedzy znacznikami,
  3. kotwice (atrybuty id na naglowkach h2 mirrora), bo bez nich linki typu A
     nie maja dokad prowadzic.

DLACZEGO TAK: aplikacja i mirrory to dwa osobne systemy, ktore w tym projekcie
regularnie sie rozjezdzaja - na tej samej stronie /prawo/rhd FAQ Reacta ma 11 pytan,
FAQ mirrora 12, a wspolnych jest 6. Panel pisany recznie w dwoch miejscach powtorzylby
ten sam blad w ciagu kilku tygodni. Tutaj recznie edytuje sie WYLACZNIE plik JSON.

Idempotentny: kolejne uruchomienia podmieniaja blok miedzy znacznikami, nie dokladaja.

Uruchom:  python scripts/gen-panel-pytan.py
Wylacz:   python scripts/gen-panel-pytan.py --usun     (zdejmuje panel z mirrora;
          warstwe React wylacza PANEL_PYTAN_WLACZONY w src/config/panelPytan.ts)
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
START = "<!-- PANEL-PYTAN:START (generowane przez scripts/gen-panel-pytan.py - nie edytuj recznie) -->"
KONIEC = "<!-- PANEL-PYTAN:KONIEC -->"

# Poczatek tekstu naglowka h2 w mirrorze -> identyfikator kotwicy. Dopasowanie po
# POCZATKU, bo naglowki bywaja dlugie i zawieraja mysliniki oraz liczby.
KOTWICE_MIRRORA = {
    "RHD a sprzedaz": "rhd-a-sprzedaz-bezposrednia",
    "Kto moze prowadzic RHD": "rhd-kto-moze",
    "Rejestracja krok po kroku": "rhd-rejestracja",
    "Numer RHD": "rhd-numer",
    "Podatki:": "rhd-limity-podatki",
    "Faktura, paragon, kasa fiskalna": "rhd-faktura-paragon-kasa",
    "Ewidencja sprzedazy RHD": "rhd-ewidencja",
    "Faktura VAT RR": "rhd-faktura-vat-rr",
}

# Polskie znaki bywaja w naglowkach, a klucze wyzej sa bez ogonkow - zeby dopasowanie
# nie zalezalo od tego, jak dokladnie zapisano tytul sekcji.
OGONKI = str.maketrans("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ",
                       "acelnoszzACELNOSZZ")

STYL_PANELU = """
  <style>
    /* Panel pytan - wyglad wlasny mirrora; aplikacja ma swoj (Tailwind). */
    .panel-pytan { border: 1px solid var(--rule, #ddd); border-radius: 6px;
      background: rgba(0,0,0,.02); padding: 1rem 1.1rem; margin: 1.4rem 0 1.8rem; }
    .panel-pytan > h2 { margin: 0 0 .2rem; font-size: 1.15rem; }
    .panel-pytan .wstep { margin: 0 0 .9rem; font-size: .92rem; color: var(--muted, #666); }
    .panel-pytan details { border: 1px solid var(--rule, #ddd); border-radius: 5px;
      background: #fff; margin-bottom: .5rem; }
    .panel-pytan summary { cursor: pointer; padding: .6rem .8rem; font-weight: 600; }
    .panel-pytan .tresc { border-top: 1px solid var(--rule, #ddd); padding: .7rem .8rem; }
    .panel-pytan .tresc p { margin: 0 0 .6rem; }
    /* Typ A - dyskretny. Typ B - wyrazny. Roznica musi byc widoczna na pierwszy rzut oka. */
    .panel-pytan .zrodlo { font-size: .82rem; color: var(--muted, #666); }
    .panel-pytan .narzedzia { list-style: none; padding: 0; margin: .6rem 0 0;
      display: flex; flex-wrap: wrap; gap: .4rem; }
    .panel-pytan .narzedzia a { display: inline-block; padding: .35rem .7rem; border-radius: 5px;
      background: var(--brand, #b45309); color: #fff; font-size: .82rem; font-weight: 600;
      text-decoration: none; }
    /* Podswietlenie celu kotwicy - czysty CSS, dziala bez JavaScriptu. */
    :target { animation: podswietl 2.4s ease-out; }
    @keyframes podswietl { 0%, 40% { background: rgba(180,83,9,.16); } 100% { background: transparent; } }
  </style>"""


def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def punkty_z_pliku(dane):
    wybrane = [p for p in dane["pytania"] if p.get("wPanelu")]
    wybrane.sort(key=lambda p: p["kolejnosc"])
    return wybrane


def zbuduj_html(punkty):
    c = [START, STYL_PANELU]
    c.append('\n  <section class="panel-pytan" aria-labelledby="panel-pytan-tytul">')
    c.append('\n    <h2 id="panel-pytan-tytul">Szybkie odpowiedzi</h2>')
    c.append('\n    <p class="wstep">Najczęstsze pytania o RHD. Rozwiń to, z którym'
             ' przyszedłeś — pełne omówienie znajdziesz niżej na stronie.</p>')
    for p in punkty:
        c.append('\n    <details>')
        c.append('\n      <summary>' + esc(p["pytanie"]) + '</summary>')
        c.append('\n      <div class="tresc">')
        c.append('\n        <p>' + esc(p["odpowiedz"]) + '</p>')
        c.append('\n        <p class="zrodlo"><a href="#' + p["kotwica"] + '">&#8627; '
                 + esc(p["kotwicaEtykieta"]) + '</a></p>')
        if p["narzedzia"]:
            c.append('\n        <ul class="narzedzia">')
            for n in p["narzedzia"]:
                cel = ' target="_blank" rel="noopener"' if n["zewnetrzna"] else ""
                c.append('\n          <li><a href="' + esc(n["url"]) + '"' + cel + '>'
                         + esc(n["etykieta"]) + ' &#8594;</a></li>')
            c.append('\n        </ul>')
        c.append('\n      </div>\n    </details>')
    c.append('\n  </section>\n  ' + KONIEC)
    return "".join(c)


def dodaj_kotwice(html):
    """Nadaje naglowkom h2 identyfikatory. Nie rusza tych, ktore juz je maja."""
    licznik = [0]

    def zamien(m):
        caly, tekst = m.group(0), m.group(1)
        if "id=" in caly.split(">")[0]:
            return caly
        plaski = re.sub(r"<[^>]+>", "", tekst).strip().translate(OGONKI)
        for poczatek, kotwica in KOTWICE_MIRRORA.items():
            if plaski.startswith(poczatek):
                licznik[0] += 1
                return '<h2 id="' + kotwica + '">' + tekst + '</h2>'
        return caly

    return re.sub(r"<h2[^>]*>(.*?)</h2>", zamien, html, flags=re.S), licznik[0]


def zapisz_ts(dane, punkty, slug):
    nazwa = "panelPytan" + "".join(x.capitalize() for x in slug.split("-"))
    sciezka = os.path.join(ROOT, "src", "data", nazwa + ".ts")
    punkty_ts = [{
        "id": p["id"], "pytanie": p["pytanie"], "odpowiedz": p["odpowiedz"],
        "kotwica": p.get("kotwicaReact") or p["kotwica"],
        "kotwicaEtykieta": p["kotwicaEtykieta"], "narzedzia": p["narzedzia"],
    } for p in punkty]
    ladunek = {"slug": dane["slug"], "trasaReact": dane["trasaReact"], "punkty": punkty_ts}
    tresc = (
        "// PLIK GENEROWANY przez scripts/gen-panel-pytan.py - NIE EDYTUJ RECZNIE.\n"
        "// Zrodlo: data/pytania/" + slug + ".json (tam sie edytuje). Ten sam plik zasila\n"
        "// mirror, wiec obie warstwy nie moga sie rozjechac.\n"
        'import type { DanePanelu } from "./panelPytanTypy";\n\n'
        "export const " + nazwa + ": DanePanelu = "
        + json.dumps(ladunek, ensure_ascii=False, indent=2) + ";\n"
    )
    io.open(sciezka, "w", encoding="utf-8", newline="\n").write(tresc)
    return os.path.relpath(sciezka, ROOT), nazwa


def main():
    usun = "--usun" in sys.argv
    katalog = os.path.join(ROOT, "data", "pytania")
    pliki = sorted(f for f in os.listdir(katalog) if f.endswith(".json"))
    if not pliki:
        print("Brak plikow w data/pytania/ - nie ma czego generowac.")
        return

    for plik in pliki:
        dane = json.load(io.open(os.path.join(katalog, plik), encoding="utf-8"))
        slug = dane["slug"]
        punkty = punkty_z_pliku(dane)
        sciezka_mirrora = os.path.join(ROOT, dane["mirror"].replace("/", os.sep))
        html = io.open(sciezka_mirrora, encoding="utf-8").read()

        wzor = re.compile(re.escape(START) + r".*?" + re.escape(KONIEC), re.S)
        bylo = bool(wzor.search(html))
        html = wzor.sub("", html)

        if usun:
            io.open(sciezka_mirrora, "w", encoding="utf-8", newline="\n").write(html)
            print("%-14s panel USUNIETY z mirrora%s" % (slug, "" if bylo else " (nie bylo go)"))
            continue

        html, dodane = dodaj_kotwice(html)

        m = re.search(r"\n\s*<h2", html)
        if not m:
            raise SystemExit("W " + dane["mirror"] + " nie ma zadnego <h2> - nie wiem, gdzie wstawic panel.")
        html = html[:m.start()] + "\n\n  " + zbuduj_html(punkty) + html[m.start():]
        io.open(sciezka_mirrora, "w", encoding="utf-8", newline="\n").write(html)

        sciezka_ts, nazwa = zapisz_ts(dane, punkty, slug)
        print("%-14s %d pytan | mirror: %s, kotwic dodanych: %d | React: %s"
              % (slug, len(punkty), "podmieniony" if bylo else "wstawiony", dodane, sciezka_ts))
        if dane.get("zrodloDanych", {}).get("stan") == "ROBOCZY":
            print("%-14s UWAGA: lista ma stan ROBOCZY - czeka na: %s"
                  % ("", "; ".join(dane["zrodloDanych"]["oczekujeNa"])))


if __name__ == "__main__":
    main()
