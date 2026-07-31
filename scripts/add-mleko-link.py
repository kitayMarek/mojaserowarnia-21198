#!/usr/bin/env python3
"""
Idempotentny post-procesor: wstrzykuje box „Jakość mleka decyduje o serze"
do KAZDEJ strony przepisu (public/przepisy/*.html + spolecznosc/*.html).

Po co: prawie wszedzie, gdzie mowa o jakosci sera albo jego rodzajach, powinna
byc sciezka do dzialu o mleku i krowach. Bez tego dzial „Pasze i zwierzeta"
jest wyspa — przepisy sa najczesciej odwiedzana trescia serwisu, wiec to
z nich musi prowadzic droga do przyczyn (obora), nie tylko do skutkow (kociol).

Dwa warianty tresci:
  - RYZYKO_WZDEC (sery twarde/pol-twarde, dlugo dojrzewajace) -> mocniejszy box
    z ostrzezeniem o Clostridium z kiszonki (wzdecia pozne ujawniaja sie po
    tygodniach dojrzewania — dokladnie te sery sa zagrozone).
  - pozostale -> zwykly box o wydajnosci i skladzie mleka.

Kotwica: tuz przed <div id="warz-w-fermly"> (jesli jest) albo <div class="related">.
Idempotentny: jesli strona ma juz id="mleko-a-ser" -> podmienia box (mozna
bezpiecznie uruchamiac po kazdej regeneracji przepisow).

Uruchom:  python scripts/add-mleko-link.py
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = [os.path.join(ROOT, "public", "przepisy"),
        os.path.join(ROOT, "public", "przepisy", "spolecznosc")]
SKIP = {"przewodnik.html", "index.html"}
SENTINEL = 'id="mleko-a-ser"'

# Sery twarde i pol-twarde dojrzewajace dlugo — zagrozone wzdeciami poznymi
# od przetrwalnikow Clostridium tyrobutyricum pochodzacych z kiszonki.
# Sery swieze, miekkie i solankowe pomijamy: nie dojrzewaja wystarczajaco dlugo.
RYZYKO_WZDEC = {
    "gouda", "emmental", "gruyere", "parmezan", "cheddar",
    "asiago", "dunlop", "yorkshire", "edam",
}

BOX_RE = re.compile(r'<div id="mleko-a-ser".*?</div>\s*</div>|<div id="mleko-a-ser".*?</div>', re.S)


def box(slug):
    ryzyko = slug in RYZYKO_WZDEC
    if ryzyko:
        tytul = "🐄 Ten ser jest wrażliwy na jakość mleka"
        tresc = (
            'To ser <strong>długo dojrzewający</strong>, więc grozi mu <strong>wzdęcie późne</strong> — '
            'ser pęka i cuchnie zjełczałym masłem po tygodniach lub miesiącach dojrzewania. '
            'Przyczyną są przetrwalniki <em>Clostridium</em> trafiające do mleka z kiszonki. '
            '<strong>Przetrwalniki przeżywają pasteryzację</strong>, więc chroni wyłącznie profilaktyka '
            'w oborze. Nie bez powodu specyfikacje Emmentalera, Comté i Grana Padano '
            '<strong>zakazują skarmiania kiszonek</strong>.'
        )
    else:
        tytul = "🐄 Skąd bierze się wydajność tego sera"
        tresc = (
            'O tym, ile sera wyjdzie z litra mleka, decydują <strong>kazeina i tłuszcz</strong> — '
            'a nie białko ogólne. Skład mleka zależy od żywienia krów: na tłuszcz wpływa struktura '
            'dawki, na białko podaż energii. Różnica 0,1 punktu procentowego tłuszczu to '
            '<strong>1,5–2% więcej sera</strong>.'
        )

    return (
        '<div id="mleko-a-ser" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:.7rem;padding:1.1rem 1.3rem;margin:2.5rem 0 0;">\n'
        f'    <h2 style="margin-top:0;border:0;color:#0369a1;font-size:1.2rem;">{tytul}</h2>\n'
        f'    <p style="margin:.4rem 0 .8rem;color:#1f2937;">{tresc}</p>\n'
        '    <p style="margin:0;color:#1f2937;">'
        '<a href="https://mojaserowarnia.pl/mleko-do-sera.html" style="color:#0369a1;font-weight:600;">Mleko do sera — skład i wydajność</a>'
        ' · '
        '<a href="https://mojaserowarnia.pl/wady-mleka-a-wady-sera.html" style="color:#0369a1;font-weight:600;">Wady mleka a wady sera</a>'
        '</p>\n'
        '  </div>'
    )


def main():
    nowe, zaktualizowane, bez_zmian, bez_kotwicy = [], [], [], []
    for d in DIRS:
        if not os.path.isdir(d):
            continue
        for path in sorted(glob.glob(os.path.join(d, "*.html"))):
            name = os.path.basename(path)
            if name in SKIP:
                continue
            txt = open(path, encoding="utf-8").read()
            slug = name[:-5]
            inj = box(slug)

            if SENTINEL in txt:
                new = BOX_RE.sub(lambda m: inj, txt, count=1)
                if new != txt:
                    open(path, "w", encoding="utf-8").write(new)
                    zaktualizowane.append(slug)
                else:
                    bez_zmian.append(slug)
                continue

            # Kotwica: przed boxem Fermly, a jesli go nie ma — przed „Powiazane"
            if '<div id="warz-w-fermly"' in txt:
                txt = txt.replace('<div id="warz-w-fermly"', inj + '\n  <div id="warz-w-fermly"', 1)
            elif '<div class="related"' in txt:
                txt = txt.replace('<div class="related"', inj + '\n  <div class="related"', 1)
            elif "<footer" in txt:
                txt = txt.replace("<footer", inj + "\n  <footer", 1)
            else:
                bez_kotwicy.append(name)
                continue
            open(path, "w", encoding="utf-8").write(txt)
            nowe.append(slug)

    ryz = [s for s in (nowe + zaktualizowane) if s in RYZYKO_WZDEC]
    print(f"OK - nowe: {len(nowe)}, zaktualizowane: {len(zaktualizowane)}, bez zmian: {len(bez_zmian)}")
    if nowe:
        print("   nowe:", ", ".join(nowe))
    if zaktualizowane:
        print("   zaktualizowane:", ", ".join(zaktualizowane))
    print(f"   wariant 'ryzyko wzdec poznych': {len(ryz)} -> {', '.join(sorted(ryz)) if ryz else '-'}")
    if bez_kotwicy:
        print("   BEZ KOTWICY (nie tkniete):", ", ".join(bez_kotwicy))


if __name__ == "__main__":
    main()
