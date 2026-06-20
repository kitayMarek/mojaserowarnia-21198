#!/usr/bin/env python3
"""
Generator stron "przepisow spolecznosci" (BRIEF #4) — domkniecie petli Fermly -> serowarnia.

Pobiera feed zatwierdzonych przez Marka przepisow uzytkownikow Fermly
(https://fermly.pl/przepisy-spolecznosci.json — schemat v2, TA SAMA koperta co nasz
public/przepisy/index.json) i tworzy statyczne strony public/przepisy/spolecznosc/<slug>.html
oraz strone-hub index.html. Strony sa wyraznie oznaczone "przepis spolecznosci", z atrybucja
autora. INDEX, follow (decyzja Marka 2026-06-20) — moderacja Marka trzyma jakosc.

Pusty / brakujacy / niedostepny feed => nic nie generuje i konczy spokojnie (exit 0),
bez wywracania regeneracji reszty statyk.

Koperta (z BRIEF #4):
  { "wersjaSchematu":2, "zrodlo":"fermly-spolecznosc", "wygenerowano": ISO,
    "przepisy": [ Recipe(v2)... ] }
Recipe per-przepis dorzuca: "autor", opc. "licencja", opc. "dataZatwierdzenia" (ISO)
-> uzyte jako datePublished/dateModified strony. Slug = "user-<timestamp>".

UZYCIE:
  python scripts/gen-przepisy-spolecznosc.py                      # live feed z fermly.pl
  python scripts/gen-przepisy-spolecznosc.py scripts/mock-spolecznosci.json   # test na mocku
  python scripts/gen-przepisy-spolecznosc.py https://inny/feed.json           # inne zrodlo
Po wygenerowaniu wgraj public/przepisy/spolecznosc/ na serwer (FTP) — bez przebudowy.
"""
import sys, os, re, json, html
import urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "public", "przepisy", "spolecznosc")
DEFAULT_SOURCE = "https://fermly.pl/przepisy-spolecznosci.json"
SITE = "https://mojaserowarnia.pl"
LICENCJA_DOMYSLNA = "© autor przepisu, użytek domowy"


# ---- wczytanie feedu (plik lokalny ALBO URL) ---------------------------------
def load_feed(source):
    if os.path.exists(source):
        raw = open(source, encoding="utf-8").read()
        where = f"plik {os.path.relpath(source, ROOT)}"
    else:
        req = urllib.request.Request(source, headers={"User-Agent": "mojaserowarnia-gen/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
        where = source
    return json.loads(raw), where


# ---- formatery liczb (schemat v2: temperaturaC = number | {min,max} | {from,to,rampMin}) ----
def fmt_temp(t):
    if t is None:
        return None
    if isinstance(t, bool):
        return None
    if isinstance(t, (int, float)):
        return f"{t:g}°C"
    if isinstance(t, dict):
        if t.get("min") is not None and t.get("max") is not None:
            return f"{t['min']:g}–{t['max']:g}°C"
        if t.get("from") is not None and t.get("to") is not None:
            s = f"{t['from']:g}→{t['to']:g}°C"
            if t.get("rampMin"):
                s += f" (w {t['rampMin']:g} min)"
            return s
    return None


def fmt_time(m):
    if not m:
        return None
    if m >= 120 and m % 30 == 0:
        return f"~{m/60:g} h"
    return f"~{m:g} min"


def pl(x):
    """Liczba w zapisie polskim (przecinek dziesietny) — TYLKO do wyswietlania."""
    return (f"{x:g}").replace(".", ",")


# ---- BRIEF #6: ozyw martwe odeslania na statycznej stronie (juz jestesmy na serowarni) ----
REFS = [
    (re.compile(r'tabel[aęi]\s+doboru\s+kultur', re.I),
     f'<a href="{SITE}/kultury/">tabela doboru kultur</a>'),
    (re.compile(r'(?:wg|wedlug|według)\s+siły\s+podpuszczki', re.I),
     f'wg <a href="{SITE}/sila-podpuszczki">siły podpuszczki</a>'),
    (re.compile(r'patrz\s+słownik', re.I),
     f'patrz <a href="{SITE}/slownik.html">słownik</a>'),
]


def linkify(escaped):
    """Wejscie: tekst PO html.escape. Podmienia martwe odeslania na linki serowarni."""
    for rx, rep in REFS:
        escaped = rx.sub(rep, escaped)
    return escaped


def step_meta(k):
    """Linijka liczb pod krokiem: temperatura · czas · warunek konca · pH."""
    bits = []
    t = fmt_temp(k.get("temperaturaC"))
    if t:
        bits.append(t)
    tm = fmt_time(k.get("czasMin"))
    if tm:
        bits.append(tm)
    if k.get("warunekKonca"):
        bits.append("do: " + str(k["warunekKonca"]))
    if k.get("pH") is not None:
        bits.append("pH " + (f"{k['pH']:g}").replace(".", ","))
    return bits


# ---- CSS (spojne z gen-przepisy.py + akcent "spolecznosci") ------------------
CSS = '''  <style>
    :root { --brand:#b45309; --brand-dark:#92400e; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; --bg-soft:#fffbeb; --comm:#0e7490; --comm-soft:#ecfeff; }
    * { box-sizing:border-box; }
    body { max-width:780px; margin:0 auto; padding:2rem 1.25rem 4rem; font:16px/1.7 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:var(--ink); }
    h1 { font-size:1.85rem; line-height:1.25; color:var(--brand-dark); margin:.3rem 0 .5rem; }
    h2 { font-size:1.25rem; margin-top:2.25rem; color:var(--brand-dark); border-bottom:2px solid var(--bg-soft); padding-bottom:.3rem; }
    h3 { font-size:1.05rem; margin-top:1.5rem; }
    p,li { color:var(--ink); }
    a { color:var(--brand); }
    .lead { font-size:1.05rem; color:var(--muted); }
    table { border-collapse:collapse; width:100%; margin:1rem 0; font-size:.95rem; }
    th,td { border:1px solid var(--line); padding:.55rem .7rem; text-align:left; }
    th { background:var(--bg-soft); }
    ol li { margin-bottom:.9rem; }
    .smeta { display:block; font-size:.85rem; color:var(--muted); margin-top:.15rem; }
    .tip { display:block; font-size:.9rem; color:var(--comm); margin-top:.1rem; }
    .badge { display:inline-block; background:var(--comm); color:#fff; font-size:.78rem; font-weight:700; letter-spacing:.02em; padding:.25rem .6rem; border-radius:.5rem; text-transform:uppercase; }
    .commbox { background:var(--comm-soft); border:1px solid #a5f3fc; border-radius:.7rem; padding:.9rem 1.1rem; margin:1rem 0 1.5rem; font-size:.95rem; }
    .commbox strong { color:var(--comm); }
    .cta { display:inline-block; margin-top:1.5rem; padding:.7rem 1.2rem; background:var(--brand); color:#fff; border-radius:.6rem; text-decoration:none; font-weight:600; }
    .related { background:var(--bg-soft); border:1px solid #fde68a; border-radius:.7rem; padding:1rem 1.2rem; margin-top:2.5rem; }
    .related h2 { margin-top:0; border:0; }
    footer { margin-top:3rem; padding-top:1.2rem; border-top:1px solid var(--line); font-size:.85rem; color:var(--muted); }
    nav.crumbs { font-size:.85rem; color:var(--muted); margin-bottom:1.2rem; }
    nav.crumbs a { color:var(--muted); }
    ul.cards { list-style:none; padding:0; }
    ul.cards li { border:1px solid var(--line); border-radius:.6rem; padding:.8rem 1rem; margin-bottom:.7rem; }
    ul.cards a { font-weight:600; font-size:1.05rem; }
    ul.cards .by { font-size:.85rem; color:var(--muted); }
  </style>'''


def head(title, desc, url, e, extra_ld=None, robots="index, follow"):
    o = ['<!doctype html>\n<html lang="pl">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />']
    o.append(f"  <title>{e(title)}</title>")
    o.append(f'  <meta name="description" content="{e(desc)}" />')
    o.append(f'  <link rel="canonical" href="{url}" />\n  <meta name="robots" content="{robots}" />')
    o.append(f'  <meta property="og:title" content="{e(title)}" />\n  <meta property="og:description" content="{e(desc)}" />\n  <meta property="og:type" content="article" />\n  <meta property="og:url" content="{url}" />\n  <meta property="og:site_name" content="Moja Serowarnia" />\n  <meta property="og:locale" content="pl_PL" />\n  <meta property="og:image" content="https://mojaserowarnia.pl/og-image.png" />')
    for ld in (extra_ld or []):
        o.append('  <script type="application/ld+json">\n' + json.dumps(ld, ensure_ascii=False, indent=2) + "\n  </script>")
    o.append(CSS)
    o.append("</head>\n<body>")
    return o


def gen_page(rec):
    e = html.escape
    slug = rec["slug"]
    nazwa = rec.get("nazwa") or slug
    n = e(nazwa)
    autor = (rec.get("autor") or "").strip() or "użytkownik Fermly"
    licencja = (rec.get("licencja") or "").strip() or LICENCJA_DOMYSLNA
    data = (rec.get("dataZatwierdzenia") or "").strip() or None
    url = f"{SITE}/przepisy/spolecznosc/{slug}.html"
    rodzina = rec.get("rodzina") or ""

    # skladniki
    ingredients = []
    ml = rec.get("mleko") or {}
    if ml.get("litry"):
        ml_txt = f"Mleko {pl(ml['litry'])} l"
        if ml.get("typ"):
            ml_txt += f" ({ml['typ']})"
        if ml.get("pasteryzacja"):
            ml_txt += f", pasteryzacja: {ml['pasteryzacja']}"
        ingredients.append(ml_txt)
    for k in (rec.get("kultury") or []):
        co = k.get("co", "")
        dawka = k.get("dawka")
        ingredients.append(f"{co}" + (f" — {dawka}" if dawka else ""))
    pod = rec.get("podpuszczka") or {}
    if pod:
        pt = "Podpuszczka"
        if pod.get("typ"):
            pt += f" ({pod['typ']})"
        if pod.get("dawka"):
            pt += f" — {pod['dawka']}"
        ingredients.append(pt)

    # opis / lead
    desc_full = (rec.get("uwagi") or f"Przepis społeczności na {nazwa} — zgłoszony przez {autor}, zatwierdzony przez redakcję Mojej Serowarni.").strip()
    desc = (desc_full[:140] + "…") if len(desc_full) > 141 else desc_full

    # JSON-LD Recipe
    kroki = rec.get("kroki") or []
    recipe_ld = {
        "@context": "https://schema.org", "@type": "Recipe", "name": nazwa,
        "description": desc_full, "image": "https://mojaserowarnia.pl/og-image.png",
        "author": {"@type": "Person", "name": autor},
        "recipeCategory": "Ser",
        "keywords": f"{nazwa}, ser domowy, przepis społeczności",
        "recipeIngredient": ingredients,
        "recipeInstructions": [
            {"@type": "HowToStep", "name": (k.get("nazwa") or f"Krok {i}"), "text": (k.get("opis") or k.get("nazwa") or "")}
            for i, k in enumerate(kroki, 1)
        ],
        "license": licencja,
    }
    if rec.get("wydajnoscKg"):
        recipe_ld["recipeYield"] = f"{rec['wydajnoscKg']:g} kg"
    if data:
        recipe_ld["datePublished"] = data
        recipe_ld["dateModified"] = data
    recipe_ld = {k: v for k, v in recipe_ld.items() if v not in (None, "", [])}

    o = head(f"{nazwa} — przepis społeczności (ser domowy)", desc, url, e, extra_ld=[recipe_ld])
    o.append(f'  <nav class="crumbs"><a href="{SITE}/">Moja Serowarnia</a> &rarr; <a href="{SITE}/przepisy/przewodnik.html">Przepisy na sery</a> &rarr; <a href="{SITE}/przepisy/spolecznosc/">Społeczność</a> &rarr; {n}</nav>')
    o.append('  <p><span class="badge">Przepis społeczności</span></p>')
    o.append(f"  <h1>{n}</h1>")
    o.append(f'  <p class="lead">{e(desc_full)}</p>')
    # box atrybucji (gora)
    by = [f"Autor: <strong>{e(autor)}</strong>"]
    if data:
        by.append(f"zatwierdzony: {e(data[:10])}")
    o.append('  <div class="commbox">🧀 ' + " &nbsp;·&nbsp; ".join(by)
             + f'. Przepis przygotowany przez użytkownika aplikacji <a href="https://fermly.pl">Fermly</a> i zatwierdzony przez redakcję — odróżnia się od przepisów autorskich Mojej Serowarni.</div>')

    # meta
    meta_bits = []
    if rodzina:
        meta_bits.append(f"<strong>Rodzaj:</strong> {e(rodzina)}")
    if rec.get("wydajnoscKg"):
        meta_bits.append(f"<strong>Wydajność:</strong> ~{pl(rec['wydajnoscKg'])} kg")
    dj = rec.get("dojrzewanie") or {}
    if dj.get("dni"):
        meta_bits.append(f"<strong>Dojrzewanie:</strong> od {dj['dni']:g} dni")
    if meta_bits:
        o.append("  <p>" + " &nbsp;·&nbsp; ".join(meta_bits) + "</p>")

    if ingredients:
        o.append("  <h2>Składniki</h2>\n  <ul>")
        for ing in ingredients:
            o.append(f"    <li>{linkify(e(ing))}</li>")
        o.append("  </ul>")

    if kroki:
        o.append("  <h2>Przygotowanie krok po kroku</h2>\n  <ol>")
        for i, k in enumerate(kroki, 1):
            nm = e(k.get("nazwa") or f"Krok {i}")
            op = linkify(e(k.get("opis") or ""))
            o.append(f"    <li><strong>{nm}</strong>" + (f" {op}" if op else ""))
            sm = step_meta(k)
            if sm:
                o.append('      <span class="smeta">' + " · ".join(e(x) for x in sm) + "</span>")
            dod = k.get("dodatki") or []
            if dod:
                dtxt = ", ".join((d.get("co", "") + (f" ({d['dawka']})" if d.get("dawka") else "")) for d in dod)
                o.append(f'      <span class="smeta">Dodaj: {linkify(e(dtxt))}</span>')
            if k.get("wskazowka"):
                o.append(f'      <span class="tip">💡 {linkify(e(k["wskazowka"]))}</span>')
            o.append("    </li>")
        o.append("  </ol>")

    # solenie
    sol = rec.get("solenie") or {}
    if sol and any(sol.get(x) is not None for x in ("typ", "stezenieProc", "czasH", "temperaturaC")):
        parts = []
        if sol.get("typ"):
            parts.append(f"typ: {sol['typ']}")
        if sol.get("stezenieProc") is not None:
            parts.append(f"stężenie: {sol['stezenieProc']:g}%")
        if sol.get("czasH") is not None:
            parts.append(f"czas: {sol['czasH']:g} h")
        tt = fmt_temp(sol.get("temperaturaC"))
        if tt:
            parts.append(f"temperatura: {tt}")
        o.append("  <h2>Solenie</h2>\n  <p>" + e(" · ".join(parts)) + "</p>")

    # dojrzewanie
    if dj and any(dj.get(x) is not None for x in ("dni", "temperaturaC", "wilgotnoscProc", "pielegnacja", "ubytekWagiProc")):
        parts = []
        if dj.get("dni"):
            parts.append(f"czas: od {dj['dni']:g} dni")
        tt = fmt_temp(dj.get("temperaturaC"))
        if tt:
            parts.append(f"temperatura: {tt}")
        if dj.get("wilgotnoscProc") is not None:
            parts.append(f"wilgotność: {dj['wilgotnoscProc']:g}%")
        if dj.get("ubytekWagiProc") is not None:
            parts.append(f"ubytek wagi: ~{dj['ubytekWagiProc']:g}%")
        o.append("  <h2>Dojrzewanie</h2>\n  <p>" + e(" · ".join(parts)) + "</p>")
        if dj.get("pielegnacja"):
            o.append(f"  <p>{linkify(e(dj['pielegnacja']))}</p>")

    o.append(f'  <a class="cta" href="{SITE}/przepisy">Otwórz w aplikacji Moja Serowarnia →</a>')
    o.append('  <div class="related">\n    <h2>Powiązane</h2>\n    <ul>')
    o.append(f'      <li><a href="{SITE}/przepisy/spolecznosc/">Wszystkie przepisy społeczności</a></li>')
    o.append(f'      <li><a href="{SITE}/przepisy/przewodnik.html">Przepisy na sery — przewodnik</a></li>')
    o.append(f'      <li><a href="{SITE}/kultury/">Jak dobrać kulturę do sera</a></li>')
    o.append(f'      <li><a href="{SITE}/sila-podpuszczki">Siła podpuszczki — kalkulator</a></li>')
    o.append("    </ul>\n  </div>")
    o.append(f'  <footer>Przepis społeczności &nbsp;·&nbsp; autor: {e(autor)} &nbsp;·&nbsp; licencja: {e(licencja)} &nbsp;·&nbsp; '
             f'zgłoszony w aplikacji <a href="https://fermly.pl">Fermly</a>, zatwierdzony przez redakcję '
             f'<a href="{SITE}/przepisy">Mojej Serowarni</a>.</footer>\n</body>\n</html>')
    return "\n".join(o)


def gen_index(recs):
    e = html.escape
    url = f"{SITE}/przepisy/spolecznosc/"
    desc = "Przepisy na sery zgłoszone przez społeczność użytkowników Fermly i zatwierdzone przez redakcję Mojej Serowarni."
    item_ld = {
        "@context": "https://schema.org", "@type": "ItemList",
        "itemListElement": [
            {"@type": "ListItem", "position": i,
             "url": f"{SITE}/przepisy/spolecznosc/{r['slug']}.html",
             "name": r.get("nazwa") or r["slug"]}
            for i, r in enumerate(recs, 1)
        ],
    }
    o = head("Przepisy społeczności — sery od użytkowników | Moja Serowarnia", desc, url, e, extra_ld=[item_ld])
    o.append(f'  <nav class="crumbs"><a href="{SITE}/">Moja Serowarnia</a> &rarr; <a href="{SITE}/przepisy/przewodnik.html">Przepisy na sery</a> &rarr; Społeczność</nav>')
    o.append('  <p><span class="badge">Przepisy społeczności</span></p>')
    o.append("  <h1>Przepisy społeczności</h1>")
    o.append(f'  <p class="lead">{e(desc)}</p>')
    o.append('  <div class="commbox">Te przepisy stworzyli użytkownicy aplikacji <a href="https://fermly.pl">Fermly</a> '
             'na podstawie własnych warzeń, a redakcja Mojej Serowarni je zatwierdziła. '
             'Są oznaczone osobno od przepisów autorskich serwisu.</div>')
    o.append('  <ul class="cards">')
    for r in recs:
        nm = e(r.get("nazwa") or r["slug"])
        by = e((r.get("autor") or "użytkownik Fermly"))
        rodz = e(r.get("rodzina") or "")
        o.append(f'    <li><a href="{SITE}/przepisy/spolecznosc/{r["slug"]}.html">{nm}</a>'
                 + (f' <span class="by">— {rodz}</span>' if rodz else "")
                 + f'<br><span class="by">Autor: {by}</span></li>')
    o.append("  </ul>")
    o.append('  <div class="related">\n    <h2>Zobacz też</h2>\n    <ul>')
    o.append(f'      <li><a href="{SITE}/przepisy/przewodnik.html">Autorskie przepisy na sery — przewodnik</a></li>')
    o.append(f'      <li><a href="{SITE}/kultury/">Jak dobrać kulturę do sera</a></li>')
    o.append("    </ul>\n  </div>")
    o.append(f'  <footer>Przepisy nadsyłane przez społeczność <a href="https://fermly.pl">Fermly</a>, '
             f'moderowane przez redakcję <a href="{SITE}/przepisy">Mojej Serowarni</a>.</footer>\n</body>\n</html>')
    return "\n".join(o)


def main():
    source = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SOURCE
    if not source.startswith(("http://", "https://")) and not os.path.exists(source):
        print(f"Nie znaleziono pliku zrodlowego: {source}. Pomijam.")
        return
    try:
        feed, where = load_feed(source)
    except (urllib.error.URLError, urllib.error.HTTPError) as ex:
        print(f"Feed niedostepny ({source}): {ex}. Pomijam — strony spolecznosci bez zmian.")
        return
    except (json.JSONDecodeError, ValueError) as ex:
        print(f"Feed nie jest poprawnym JSON ({source}): {ex}. Pomijam.")
        return
    except FileNotFoundError:
        print(f"Nie znaleziono zrodla: {source}. Pomijam.")
        return

    recs = [r for r in (feed.get("przepisy") or []) if r.get("slug")]
    if not recs:
        print(f"Feed pusty ({where}) — 0 zatwierdzonych przepisow. Nic nie generuje (to OK).")
        return

    os.makedirs(OUTDIR, exist_ok=True)
    for r in recs:
        open(os.path.join(OUTDIR, f"{r['slug']}.html"), "w", encoding="utf-8").write(gen_page(r))
    open(os.path.join(OUTDIR, "index.html"), "w", encoding="utf-8").write(gen_index(recs))

    print(f"OK - zrodlo: {where}")
    print(f"   wygenerowano {len(recs)} stron + index.html -> {os.path.relpath(OUTDIR, ROOT)}")
    for r in recs:
        print(f"   - {r['slug']}.html  ({r.get('nazwa','?')}, autor: {r.get('autor','?')}, krokow: {len(r.get('kroki') or [])})")


if __name__ == "__main__":
    main()
