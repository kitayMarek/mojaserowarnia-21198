# -*- coding: utf-8 -*-
"""Kto jest kanoniczny: mirror czy trasa React? Rozjazd = duplikat tresci."""
import io, os, re, collections

lic = collections.Counter()
przyklady = collections.defaultdict(list)
for dirpath, _, files in os.walk('public'):
    for f in files:
        if not f.endswith('.html'):
            continue
        p = os.path.join(dirpath, f).replace(os.sep, '/')
        t = io.open(p, encoding='utf-8', errors='replace').read()
        m = re.search(r'rel="canonical"\s+href="([^"]+)"', t)
        if not m:
            lic['BRAK canonical'] += 1
            przyklady['BRAK canonical'].append(p)
            continue
        rodzaj = 'na siebie (.html)' if m.group(1).endswith('.html') else 'na trase React'
        lic[rodzaj] += 1
        przyklady[rodzaj].append('%s  ->  %s' % (p, m.group(1)))

for k, v in lic.most_common():
    print('%-20s %3d' % (k, v))
    for p in przyklady[k][:8]:
        print('       ' + p)
    if len(przyklady[k]) > 8:
        print('       ... i %d wiecej' % (len(przyklady[k]) - 8))
    print()
