# -*- coding: utf-8 -*-
"""
Podpina filmy z YouTube do przepisow w src/data/recipesData.ts i sprawdza,
czy juz podpiete filmy nadal zyja.

Tytul i nazwe kanalu pobieramy z oEmbed YouTube (bez klucza API), zeby nie
przepisywac ich recznie i zeby autor byl zawsze podany prawidlowo.

Uzycie:
  python scripts/wideo-przepisy.py --dodaj korycinski https://www.youtube.com/watch?v=XXXXXXXXXXX
  python scripts/wideo-przepisy.py --dodaj-z-pliku filmy.txt      # linie: <id_przepisu> <url>
  python scripts/wideo-przepisy.py --sprawdz                      # czy podpiete filmy nadal dzialaja

Skrypt jest idempotentny: ponowne --dodaj dla tego samego przepisu podmienia wpis.
"""
import io, json, re, sys, urllib.parse, urllib.request

PLIK = 'src/data/recipesData.ts'


def id_z_url(url):
    """Wyciaga identyfikator filmu z dowolnej postaci linku YouTube."""
    u = urllib.parse.urlparse(url.strip())
    if u.hostname in ('youtu.be',):
        return u.path.lstrip('/').split('/')[0]
    if u.hostname and 'youtube' in u.hostname:
        if u.path.startswith('/watch'):
            q = urllib.parse.parse_qs(u.query).get('v')
            if q:
                return q[0]
        m = re.match(r'^/(embed|shorts|live)/([^/?]+)', u.path)
        if m:
            return m.group(2)
    if re.fullmatch(r'[A-Za-z0-9_-]{11}', url.strip()):
        return url.strip()
    raise ValueError('nie rozpoznaje linku YouTube: %s' % url)


def oembed(vid):
    """Zwraca (tytul, kanal) albo rzuca wyjatkiem, gdy film nie istnieje/jest prywatny."""
    url = 'https://www.youtube.com/oembed?' + urllib.parse.urlencode(
        {'url': 'https://www.youtube.com/watch?v=' + vid, 'format': 'json'})
    req = urllib.request.Request(url, headers={'User-Agent': 'mojaserowarnia-skrypt'})
    with urllib.request.urlopen(req, timeout=20) as r:
        d = json.load(r)
    return d['title'], d['author_name']


def czytaj():
    return io.open(PLIK, encoding='utf-8').read()


def zapisz(s):
    io.open(PLIK, 'w', encoding='utf-8', newline='').write(s)


def ucieczka(t):
    """Zamienia tekst na bezpieczny literal TS (json.dumps radzi sobie z cudzyslowami)."""
    return json.dumps(t, ensure_ascii=False)


def dodaj(rid, url):
    vid = id_z_url(url)
    tytul, kanal = oembed(vid)
    s = czytaj()
    kotwica = '    id: "%s",' % rid
    if s.count(kotwica) != 1:
        raise SystemExit('BLAD: nie znalazlem dokladnie jednego przepisu o id "%s"' % rid)

    wpis = '\n    video: { youtubeId: %s, title: %s, channel: %s },' % (
        ucieczka(vid), ucieczka(tytul), ucieczka(kanal))

    # idempotencja: usun poprzedni wpis video tego przepisu, jesli byl
    poz = s.index(kotwica) + len(kotwica)
    stary = re.match(r'\n    video: \{[^\n]*\},', s[poz:])
    if stary:
        s = s[:poz] + s[poz + stary.end():]

    zapisz(s[:poz] + wpis + s[poz:])
    print('OK  %-14s %s  [%s]' % (rid, tytul.encode('ascii', 'replace').decode(), kanal.encode('ascii', 'replace').decode()))


def sprawdz():
    s = czytaj()
    pary = re.findall(r'id: "([^"]+)",\s*\n\s*video: \{ youtubeId: "([^"]+)"', s)
    if not pary:
        print('Zaden przepis nie ma jeszcze podpietego filmu.')
        return
    zle = 0
    for rid, vid in pary:
        try:
            tytul, kanal = oembed(vid)
            print('ZYJE     %-14s %s' % (rid, tytul.encode('ascii', 'replace').decode()))
        except Exception as e:
            zle += 1
            print('MARTWY   %-14s %s  (%s)' % (rid, vid, e))
    print('\nRazem %d, niedzialajacych: %d' % (len(pary), zle))
    if zle:
        sys.exit(1)


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        raise SystemExit(__doc__)
    if a[0] == '--sprawdz':
        sprawdz()
    elif a[0] == '--dodaj' and len(a) == 3:
        dodaj(a[1], a[2])
    elif a[0] == '--dodaj-z-pliku' and len(a) == 2:
        for nr, w in enumerate(io.open(a[1], encoding='utf-8'), 1):
            w = w.strip()
            if not w or w.startswith('#'):
                continue
            czesci = w.split()
            if len(czesci) < 2:
                print('pomijam linie %d: %s' % (nr, w))
                continue
            try:
                dodaj(czesci[0], czesci[1])
            except Exception as e:
                print('BLAD linia %d (%s): %s' % (nr, czesci[0], e))
    else:
        raise SystemExit(__doc__)
