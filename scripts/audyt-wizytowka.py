# -*- coding: utf-8 -*-
"""Co realnie dostaje Google i co dostaje bot na kazdej trasie React.

USTALENIE Z 2026-09-01, ktore zmienia wynik tego audytu:
react-helmet 6.1.0 pod Reactem 18 nie emituje NICZEGO. Wiedzial o tym juz
komentarz w src/components/Kanoniczny.tsx (2026-08-20), ale zalozyl, ze
"tytuly i opisy dzialaly, bo strony ustawiaja je osobno przez document.title".
To prawda tylko dla czesci stron. Strony, ktore maja WYLACZNIE <Helmet>,
nie ustawiaja tytulu nigdzie — Google widzi na nich tytul strony glownej.
Sprawdzone w przegladarce: /slownik, /wedzenie-sera, /mleko-do-sera.

Dlatego <Helmet> liczy sie tu jako BRAK, mimo ze w kodzie tresc jest napisana.
"""
import io, os, re, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = lambda *p: os.path.join(ROOT, *p)

app = io.open(R('src', 'App.tsx'), encoding='utf-8').read()
POMIN = re.compile(r'^/(admin|dashboard|auth|moje-listy)|^\*$|:')

trasy = []
for m in re.finditer(r'path="([^"]*)"\s+element=\{\s*<(\w+)', app):
    if m.group(1).startswith('/') and not POMIN.search(m.group(1)):
        trasy.append((m.group(1), m.group(2)))

worker = io.open(R('worker', 'index.js'), encoding='utf-8').read()
blok = re.search(r'MIRROR_POD_INNA_NAZWA = \{(.*?)\};', worker, re.S).group(1)
INNA = dict(re.findall(r"'([^']+)':\s*'([^']+)'", blok))

# Przekierowania assetow tez tworza mirror — worker pyta o <trasa>.html,
# a warstwa assetow moze ten adres przekierowac (tak dziala /etykieta-rhd).
przek = {}
if os.path.exists(R('public', '_redirects')):
    for l in io.open(R('public', '_redirects'), encoding='utf-8'):
        c = l.split()
        if len(c) >= 2 and c[0].startswith('/'):
            przek[c[0]] = c[1]

# Layouty, ktore ustawiaja tytul za strone.
LAYOUT_Z_TYTULEM = tuple(
    n for n in ('KulturaGuideLayout', 'PrzepisLayout')
    if os.path.exists(R('src', 'components', n + '.tsx'))
    and 'document.title' in io.open(R('src', 'components', n + '.tsx'), encoding='utf-8').read())

wyniki = []
for sciezka, komponent in sorted(set(trasy)):
    kandydat = INNA.get(sciezka) or (sciezka + '.html')
    kandydat = przek.get(kandydat, kandydat)
    ma_mirror = os.path.exists(R('public', *kandydat.lstrip('/').split('/')))

    plik = next((R('src', k, komponent + '.tsx') for k in ('pages', 'components')
                 if os.path.exists(R('src', k, komponent + '.tsx'))), None)
    tresc = io.open(plik, encoding='utf-8').read() if plik else ''
    ma_tytul = ('document.title' in tresc
                or any('<' + n in tresc for n in LAYOUT_Z_TYTULEM))
    martwy_helmet = '<Helmet' in tresc and not ma_tytul
    ld_w_helmecie = bool(re.search(r'<Helmet>.*?ld\+json.*?</Helmet>', tresc, re.S))

    wyniki.append(dict(sciezka=sciezka, komponent=komponent, maMirror=ma_mirror,
                       maTytul=ma_tytul, martwyHelmet=martwy_helmet,
                       ldWHelmecie=ld_w_helmecie,
                       mirror=kandydat if ma_mirror else None))

io.open(R('data', 'audyt-wizytowka.json'), 'w', encoding='utf-8', newline='\n').write(
    json.dumps(wyniki, ensure_ascii=False, indent=2) + '\n')

def wypisz(naglowek, lista, ld=False):
    print('=== %s (%d)' % (naglowek, len(lista)))
    for w in lista:
        print('   %-32s%s' % (w['sciezka'], '  [JSON-LD tez przepada]' if ld and w['ldWHelmecie'] else ''))
    print()

wypisz('GOOGLE WIDZI TYTUL STRONY GLOWNEJ - martwy Helmet',
       [w for w in wyniki if w['martwyHelmet']], ld=True)
wypisz('GOOGLE OK, ale BOT MODELU dostaje wizytowke - brak mirrora',
       [w for w in wyniki if w['maTytul'] and not w['maMirror']])
wypisz('OBA PROBLEMY naraz',
       [w for w in wyniki if not w['maTytul'] and not w['maMirror'] and not w['martwyHelmet']])
zdrowe = [w for w in wyniki if w['maTytul'] and w['maMirror']]
print('=== ZDROWE (%d z %d tras publicznych)' % (len(zdrowe), len(wyniki)))
print('   ' + ', '.join(w['sciezka'] for w in zdrowe))
