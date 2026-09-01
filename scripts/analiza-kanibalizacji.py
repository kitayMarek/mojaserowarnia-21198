# -*- coding: utf-8 -*-
"""Ktore strony serwisu bija sie miedzy soba o te same zapytania.

WYNIK Z 2026-09-01 (eksporty GSC, 3 miesiace, 8 stron o kulturach i prawie):
kanibalizacja potwierdzona. Na fraze "bakterie mezofilne" serwis wystawia PIEC
wlasnych stron, na "bakterie do serow" trzy. Google nie dostaje jednej
odpowiedzi, tylko kilka slabszych, i zadna nie wchodzi do pierwszej dziesiatki.

Najgorszy przypadek to /bakterie-kultury: 493 wyswietlenia i JEDNO klikniecie
(CTR 0,20%). Z 20 zapytan 15 dzieli z /baza-kultur i przegrywa na 14 z nich,
srednio o 12 miejsc. Zabiera wyswietlenia i nic z nich nie oddaje.

Uwaga przy czytaniu: eksport nazywa tylko czesc zapytan, reszte GSC anonimizuje
przy malych wolumenach. Sumy z Wykres.csv sa wieksze niz sumy z Zapytania.csv
i to nie jest blad.

Dane wejsciowe to reczne eksporty z Search Console (katalog per strona).
Sciezke podaje sie zmienna GSC_DIR.
"""
import io, os, csv, collections
S = os.path.dirname(os.path.abspath(__file__)); G = os.environ.get('GSC_DIR') or os.path.join(S, 'gsc')
E = {'z4': '/baza-kultur', 'z6': '/porownywarka-kultur', 'z7': '/kultury/baza.html',
     'z8': '/prawo/przewodnik.html', 'z9': '/kultury/przewodnik',
     'z10': '/kultury/mezofilne.html', 'z11': '/bakterie-kultury',
     'z12': '/kultury/termofilne'}
def licz(s):
    s=(s or '').replace('%','').replace('\u00a0','').replace(' ','').replace(',','.')
    try: return float(s)
    except ValueError: return 0.0
def czytaj(p):
    if not os.path.exists(p): return []
    with io.open(p, encoding='utf-8-sig', newline='') as f: return list(csv.reader(f))
out = ['STRONY O KULTURACH — 3 miesiace', '']
out.append('%-26s %9s %7s %7s %8s %7s' % ('ADRES','WYSWIETL','KLIK','CTR','POZYCJA','ZAPYTAN'))
dane = {}
for z, e in E.items():
    w = [r for r in czytaj(os.path.join(G, z, 'Wykres.csv'))[1:] if len(r) > 2]
    q = [r for r in czytaj(os.path.join(G, z, 'Zapytania.csv'))[1:] if len(r) > 4]
    if not w:
        out.append('%-26s  brak danych' % e); continue
    klik = sum(licz(r[1]) for r in w); wysw = sum(licz(r[2]) for r in w)
    poz = [licz(r[4]) for r in w if len(r) > 4 and licz(r[4])]
    out.append('%-26s %9d %7d %6.2f%% %8.1f %7d'
               % (e, wysw, klik, (klik/wysw*100) if wysw else 0,
                  (sum(poz)/len(poz)) if poz else 0, len(q)))
    dane[e] = q

# ktore strony konkuruja o te same zapytania
out += ['', 'ZAPYTANIA, O KTORE BIJA SIE CO NAJMNIEJ DWIE STRONY', '']
gdzie = collections.defaultdict(list)
for e, q in dane.items():
    for r in q:
        gdzie[r[0].lower()].append((e, licz(r[2]), licz(r[4]), licz(r[1])))
sporne = {k: v for k, v in gdzie.items() if len(v) > 1}
for k in sorted(sporne, key=lambda x: -sum(a[1] for a in sporne[x]))[:16]:
    laczne = sum(a[1] for a in sporne[k]); klik = sum(a[3] for a in sporne[k])
    out.append('%-40s  wysw %4d  klik %d' % (k[:40], laczne, klik))
    for e, w, p, kl in sorted(sporne[k], key=lambda a: a[2]):
        out.append('      %-26s wysw %4d  poz %5.1f  klik %d' % (e, w, p, kl))
out.append('')
out.append('Zapytan spornych: %d z %d unikalnych' % (len(sporne), len(gdzie)))
io.open(os.path.join(S,'gsc-kultury.txt'),'w',encoding='utf-8',newline='\n').write('\n'.join(out))
