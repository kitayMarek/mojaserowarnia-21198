# -*- coding: utf-8 -*-
"""Data ostatniej zmiany TRESCI mirrora, liczona z historii gita.

Nie bierzemy daty ostatniego commita dotykajacego pliku, bo przemialy globalne
(podmiana obrazka, kanoniczne, warstwa stylow) ruszaja wszystkie pliki naraz
i daly by wszystkim te sama, falszywa date. Zamiast tego porownujemy WIDOCZNY
TEKST kolejnych wersji i szukamy najnowszej, w ktorej faktycznie sie zmienil.
"""
import os, re, glob, subprocess, json, sys

def git(*a):
    return subprocess.run(['git'] + list(a), capture_output=True, text=True,
                          encoding='utf-8', errors='replace').stdout

def tekst(html):
    h = re.sub(r'(?s)<(script|style)\b.*?</\1>', ' ', html)
    h = re.sub(r'(?s)<head\b.*?</head>', ' ', h)
    h = re.sub(r'<[^>]+>', ' ', h)
    return re.sub(r'\s+', ' ', h).strip()

def data_tresci(sciezka):
    wiersze = [w for w in git('log', '--format=%H %ad', '--date=short',
                              '--', sciezka).splitlines() if w.strip()]
    if not wiersze:
        return None
    rewizje = [w.split(None, 1) for w in wiersze]
    biezacy = tekst(git('show', '%s:%s' % (rewizje[0][0], sciezka)))
    for i in range(1, len(rewizje)):
        poprzedni = tekst(git('show', '%s:%s' % (rewizje[i][0], sciezka)))
        if poprzedni != biezacy:
            return rewizje[i - 1][1]          # tu tresc ostatnio sie zmienila
        biezacy = poprzedni
    return rewizje[-1][1]                      # nigdy sie nie zmienila -> data powstania

pliki = sorted(os.path.relpath(p, '.').replace(os.sep, '/')
               for p in glob.glob(os.path.join('public', '**', '*.html'), recursive=True))
wynik = {}
for p in pliki:
    d = data_tresci(p)
    if d:
        wynik[p] = d
        print('%-46s %s' % (p, d))

open('C:/Users/Pc/AppData/Local/Temp/claude/C--Moje-Serowarnia-mojaserowarnia-21198/cb5a074e-01b4-4320-b4e7-6e1f9bda0cf5/scratchpad/daty.json', 'w').write(json.dumps(wynik, indent=1))
print('\nplikow: %d' % len(wynik))
