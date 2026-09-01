# -*- coding: utf-8 -*-
"""Inwentarz adresow: ktore trasy maja mirror .html, a ktore istnieja tylko bez rozszerzenia.

PO CO: serwis ma DWIE rownolegle konwencje adresow — mirrory z rozszerzeniem
(mozzarella.html) i trasy React bez niego (/kalkulator-pasz-bydlo). Model jezykowy
buduje adres z WZORCA, a nie z linku, wiec dla strony bez mirrora trafia pod
<sciezka>.html i dostaje 404. Cloudflare pokazal to wprost w Demand signals:
"/kalkulator-pasz-bydlo.html -> nieudane". Strona istnieje. To nie brak tresci,
tylko utracone cytowanie z powodu niespojnej konwencji.

CZEGO SKRYPT NIE ROBI: nie rusza grupy (a). Strona z istniejacym mirrorem musi
zachowac obecne zachowanie — przekierowanie .html na trase rozwaliloby
self-canonical mirrorow i skasowaloby dorobek GEO.

Uruchom:  python scripts/audyt-adresow.py              (raport + JSON)
          python scripts/audyt-adresow.py --redirects  (wypisz reguly do _redirects)
"""
import io, os, re, json, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = lambda *p: os.path.join(ROOT, *p)

app = io.open(R('src', 'App.tsx'), encoding='utf-8').read()
POMIN = re.compile(r'^/(admin|dashboard|auth|moje-listy)|^\*$|:')

worker = io.open(R('worker', 'index.js'), encoding='utf-8').read()
blok = re.search(r'MIRROR_POD_INNA_NAZWA = \{(.*?)\};', worker, re.S).group(1)
INNA = dict(re.findall(r"'([^']+)':\s*'([^']+)'", blok))

przek = {}
for l in io.open(R('public', '_redirects'), encoding='utf-8'):
    c = l.split()
    if len(c) >= 2 and c[0].startswith('/'):
        przek[c[0]] = c[1]

z_mirrorem, bez_mirrora = [], []
for m in re.finditer(r'path="(/[^"]*)"', app):
    s = m.group(1)
    if POMIN.search(s) or s == '/':
        continue
    kandydat = INNA.get(s) or (s + '.html')
    kandydat = przek.get(kandydat, kandydat)
    ma = os.path.exists(R('public', *kandydat.lstrip('/').split('/')))
    (z_mirrorem if ma else bez_mirrora).append(
        {'sciezka': s, 'mirror': kandydat if ma else None})

z_mirrorem.sort(key=lambda x: x['sciezka'])
bez_mirrora.sort(key=lambda x: x['sciezka'])

wynik = {
    'data': '2026-09-01',
    'opis': ('Podzial tras publicznych wg tego, czy istnieje dla nich mirror .html. '
             'Grupa bezMirrora dostaje 301 z <sciezka>.html, zeby model budujacy adres '
             'z wzorca trafial na strone zamiast na 404. Grupa zMirrorem zostaje '
             'nietknieta — tam .html to osobny, kanoniczny dokument.'),
    'zMirrorem': z_mirrorem,
    'bezMirrora': bez_mirrora,
}
io.open(R('data', 'audyt-adresow-2026-09.json'), 'w', encoding='utf-8', newline='\n').write(
    json.dumps(wynik, ensure_ascii=False, indent=2) + '\n')

if '--redirects' in sys.argv:
    print('# Trasy BEZ mirrora .html — model jezykowy buduje adres z wzorca serwisu')
    print('# (wiekszosc stron ma .html) i trafia pod nieistniejacy plik. 301 zamiast 404.')
    print('# Grupy z mirrorem tu NIE MA i byc nie moze: tam .html to osobny dokument.')
    for w in bez_mirrora:
        print('  %s.html %s 301' % (w['sciezka'], w['sciezka']))
    sys.exit(0)

print('Z MIRROREM (nie ruszamy): %d' % len(z_mirrorem))
print('BEZ MIRRORA (do przekierowania): %d' % len(bez_mirrora))
for w in bez_mirrora:
    print('   %s' % w['sciezka'])
