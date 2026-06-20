#!/usr/bin/env python3
"""
Idempotentny post-procesor: wstrzykuje box CTA „Uwarz ten ser w Fermly" (deep-link PER SER)
do KAZDEJ strony przepisu. Domyka lejek integracji: WIEDZA (mojaserowarnia) -> NARZEDZIE (fermly).
Bez tego linku przepisy uczą „jak zrobić", ale nie odsyłają na PRODUKCJE — a to sedno całości.

Pokrywa:  public/przepisy/<slug>.html  (20 kuratowanych)  +  public/przepisy/spolecznosc/<slug>.html
Pomija huby: przewodnik.html, spolecznosc/index.html.
Kotwica: tuz przed <div class="related"> (box po tresci przepisu, przed „Powiazane").
Idempotentny: jesli strona ma juz id="warz-w-fermly" — pomija. Uruchamiaj PO regeneracji stron
(po gen-przepisy.py / gen-przepisy-spolecznosc.py), tak jak link-slownik.py i add-dates.py.

⚠️ URL = PLACEHOLDER — czeka na BRIEF #8 (Fermly poda kanoniczna trase „rozpocznij produkcje
z przepisu <slug>" + nazwe parametru + zachowanie dla nieznanego sluga). Po potwierdzeniu
podmien JEDNA stala FERMLY_PRODUKCJA_URL i uruchom ponownie — reszta sie zrobi sama.

Uruchom:  python scripts/add-fermly-cta.py
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = [os.path.join(ROOT, "public", "przepisy"),
        os.path.join(ROOT, "public", "przepisy", "spolecznosc")]
SKIP = {"przewodnik.html", "index.html"}
SENTINEL = 'id="warz-w-fermly"'
ANCHOR = '<div class="related"'

# KANONICZNY URL (BRIEF #8, potwierdzony przez Fermly 2026-06-20, LIVE 9751b74).
# Deep-link per ser: {slug} = nasz slug = klucz w przepisy/index.json (= cheeseVariety u Fermly).
# /mleko/warzenie = strona „Warzenie sera"; ?ser=<slug> preselekcjonuje typ+odmiane (baner
# „Z mojaserowarnia.pl"); nieznany slug = graceful (otwiera bez preselekcji, bez 404).
# UWAGA: param to ?ser= (NIE ?przepis=), baza /mleko/warzenie (NIE /mleko/partie/nowa).
FERMLY_PRODUKCJA_URL = "https://fermly.pl/mleko/warzenie?ser={slug}"


def box(slug):
    url = FERMLY_PRODUKCJA_URL.format(slug=slug)
    return (
        '<div id="warz-w-fermly" style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:.7rem;padding:1.1rem 1.3rem;margin:2.5rem 0 0;">\n'
        '    <h2 style="margin-top:0;border:0;color:#0e7490;font-size:1.25rem;">🧀 Uwarz ten ser krok po kroku w Fermly</h2>\n'
        '    <p style="margin:.4rem 0 1rem;color:#1f2937;">Od teorii do garnka: w aplikacji <strong>Fermly</strong> poprowadzisz produkcję tego sera z <strong>timerami i alarmami</strong> na każdym etapie, a gotowy ser trafi do <strong>wirtualnej dojrzewalni</strong>, która liczy ubytek wagi i przypomina o pielęgnacji.</p>\n'
        f'    <a href="{url}" style="display:inline-block;padding:.7rem 1.2rem;background:#0e7490;color:#fff;border-radius:.6rem;text-decoration:none;font-weight:600;">Uwarz w Fermly →</a>\n'
        '  </div>'
    )


BOX_RE = re.compile(r'<div id="warz-w-fermly".*?</div>', re.S)


def main():
    done, updated, skipped, no_anchor = [], [], [], []
    for d in DIRS:
        for path in sorted(glob.glob(os.path.join(d, "*.html"))):
            name = os.path.basename(path)
            if name in SKIP:
                continue
            txt = open(path, encoding="utf-8").read()
            slug = name[:-5]
            inj = box(slug)
            if SENTINEL in txt:                       # box juz jest -> zaktualizuj (np. zmiana URL)
                new = BOX_RE.sub(lambda m: inj, txt, count=1)
                if new != txt:
                    open(path, "w", encoding="utf-8").write(new)
                    updated.append(slug)
                else:
                    skipped.append(name)
                continue
            if ANCHOR in txt:
                txt = txt.replace(ANCHOR, inj + "\n  " + ANCHOR, 1)
            elif "<footer" in txt:
                txt = txt.replace("<footer", inj + "\n  <footer", 1)
            else:
                no_anchor.append(name)
                continue
            open(path, "w", encoding="utf-8").write(txt)
            done.append(slug)
    print(f"OK - nowe: {len(done)}, zaktualizowane (URL): {len(updated)}, bez zmian: {len(skipped)}.")
    if done:
        print("   nowe:", ", ".join(done))
    if updated:
        print("   zaktualizowane:", ", ".join(updated))
    if no_anchor:
        print("   ⚠ BEZ KOTWICY (nie tkniete):", ", ".join(no_anchor))
    print(f"   URL: {FERMLY_PRODUKCJA_URL}")


if __name__ == "__main__":
    main()
