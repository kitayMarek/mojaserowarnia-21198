# -*- coding: utf-8 -*-
"""Mirrory, ktore udaja osobna strone zamiast kopii trasy React.

Mirror ma jedno zadanie: pokazac botowi tresc, ktorej ten nie zobaczy bez
JavaScriptu, i wskazac trase jako adres wlasciwy. Mirror z canonical na SIEBIE
przestaje byc kopia — staje sie druga strona o tej samej tresci. Jesli lezy przy
tym w sitemapie, serwis sam zglasza Google dwa adresy z tym samym materialem.
"""
import io, os, re

sitemap = io.open('public/sitemap.xml', encoding='utf-8').read()
w_sitemapie = set(re.findall(r'<loc>https://mojaserowarnia\.pl(/[^<]*)</loc>', sitemap))

worker = io.open('worker/index.js', encoding='utf-8').read()
blok = re.search(r'MIRROR_POD_INNA_NAZWA = \{(.*?)\};', worker, re.S).group(1)
INNA = {v: k for k, v in re.findall(r"'([^']+)':\s*'([^']+)'", blok)}

app = io.open('src/App.tsx', encoding='utf-8').read()
trasy = set(re.findall(r'path="(/[^"]*)"', app))

wiersze = []
for dirpath, _, files in os.walk('public'):
    for f in sorted(files):
        if not f.endswith('.html'):
            continue
        p = os.path.join(dirpath, f).replace(os.sep, '/')
        adres = '/' + os.path.relpath(p, 'public').replace(os.sep, '/')
        t = io.open(p, encoding='utf-8', errors='replace').read()
        m = re.search(r'rel="canonical"\s+href="https://mojaserowarnia\.pl([^"]*)"', t)
        if not m:
            continue
        cel = m.group(1)
        if cel != adres:
            continue  # canonical na trase — tak ma byc
        # canonical na siebie: czy istnieje trasa React z ta sama trescia?
        trasa = INNA.get(adres) or adres[:-5]
        ma_trase = trasa in trasy
        wiersze.append((adres, trasa if ma_trase else '(brak trasy)',
                        'TAK' if adres in w_sitemapie else 'nie',
                        'TAK' if (ma_trase and trasa in w_sitemapie) else 'nie'))

print('%-38s %-24s %-10s %s' % ('MIRROR (canonical na siebie)', 'TRASA REACT', 'W SITEMAP', 'TRASA W SITEMAP'))
for a, t, s1, s2 in wiersze:
    print('%-38s %-24s %-10s %s' % (a, t, s1, s2))
print()
zle = [w for w in wiersze if w[1] != '(brak trasy)']
print('DUPLIKATY (mirror i trasa o tej samej tresci, oba zglaszane): %d' % len([w for w in zle if w[2] == 'TAK' and w[3] == 'TAK']))
for w in zle:
    print('   %s  ==  %s' % (w[0], w[1]))
