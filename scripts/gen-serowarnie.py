#!/usr/bin/env python3
"""
Generator statycznych mirrorow wizytowek serowarni.

Po co: wizytowki to strony React, wiec boty LLM (GPTBot, ClaudeBot,
PerplexityBot) ich nie widza - a to wlasnie ta tresc ma najwieksza wartosc
GEO, bo jest unikalna i nie do skopiowania. Mirror daje im pelna tresc
bez JavaScriptu.

Zrodlo danych: publiczne API Supabase. RLS wpuszcza anonima wylacznie do
wpisow status='opublikowany' AND zgoda_publikacja=true, wiec generator
z definicji nie moze wyciagnac wizytowki w moderacji ani takiej, ktorej
wycofano zgode. To zabezpieczenie po stronie bazy, nie po stronie skryptu.

Wynik:
  public/serowarnie.html              - katalog (plaski plik, bez kolizji)
  public/serowarnie/<slug>.html       - wizytowki

UWAGA: katalog public/serowarnie/ tworzy fizyczny katalog, wiec trasa SPA
/serowarnie wymaga reguly w .htaccess (wzorem ^przepisy/?$). Sprawdz, czy
jest, zanim wdrozysz.

Uruchom:  python scripts/gen-serowarnie.py
Potem:    python scripts/add-dates.py   (zgodnie z PLAYBOOK-iem)
"""
import json, os, re, sys
from datetime import date
from urllib.request import Request, urlopen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "serowarnie")

TYP_OPIS = {
    "serowarnia": "Serowarnia zagrodowa",
    "agroturystyka": "Gospodarstwo agroturystyczne z własnym serem",
    "sezonowa": "Serowarnia — produkcja sezonowa",
    "w-organizacji": "Serowarnia w organizacji",
}

STYL = """
    :root { --brand:#b45309; --brand-dark:#92400e; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; --bg-soft:#fffbeb; }
    * { box-sizing:border-box; }
    body { max-width:860px; margin:0 auto; padding:2rem 1.25rem 4rem; font:16px/1.7 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:var(--ink); }
    h1 { font-size:1.95rem; line-height:1.25; color:var(--brand-dark); margin:0 0 .3rem; }
    h2 { font-size:1.3rem; margin-top:2.2rem; color:var(--brand-dark); border-bottom:2px solid var(--bg-soft); padding-bottom:.3rem; }
    p, li { color:var(--ink); }
    a { color:var(--brand); }
    .lead { font-size:1.08rem; color:var(--muted); margin-top:0; }
    img { max-width:100%; height:auto; border-radius:.6rem; border:1px solid var(--line); }
    .galeria { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:.7rem; }
    .galeria figcaption { font-size:.85rem; color:var(--muted); margin-top:.2rem; }
    .wpis { border-bottom:1px solid var(--line); padding-bottom:1rem; margin-bottom:1rem; }
    .wpis:last-child { border:0; }
    .wpis time { font-size:.85rem; color:var(--muted); }
    .stary { opacity:.7; }
    .karty { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1rem; }
    .karta { border:1px solid #fde68a; background:var(--bg-soft); border-radius:.7rem; padding:1rem; }
    .karta a { font-weight:600; }
    .note { background:var(--bg-soft); border:1px solid #fde68a; border-radius:.6rem; padding:.8rem 1rem; font-size:.9rem; color:var(--muted); margin:1.2rem 0; }
    nav.crumbs { font-size:.85rem; color:var(--muted); margin-bottom:1.2rem; }
    nav.crumbs a { color:var(--muted); }
    footer { margin-top:3rem; padding-top:1.2rem; border-top:1px solid var(--line); font-size:.85rem; color:var(--muted); }
"""


def esc(s):
    if not s:
        return ""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def czytaj_env():
    sciezka = os.path.join(ROOT, ".env")
    dane = {}
    with open(sciezka, encoding="utf-8") as f:
        for linia in f:
            if "=" in linia and not linia.strip().startswith("#"):
                k, v = linia.split("=", 1)
                dane[k.strip()] = v.strip().strip('"').strip("'")
    return dane


def pobierz(url, key, sciezka):
    req = Request(f"{url}/rest/v1/{sciezka}",
                  headers={"apikey": key, "Authorization": f"Bearer {key}"})
    with urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def data_pl(iso):
    miesiace = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
                "lipca", "sierpnia", "września", "października", "listopada", "grudnia"]
    d = iso[:10].split("-")
    return f"{int(d[2])} {miesiace[int(d[1]) - 1]} {d[0]}"


def wizytowka_html(w, wpisy):
    slug = w["slug"]
    url = f"https://mojaserowarnia.pl/serowarnie/{slug}.html"
    lokal = ", ".join(x for x in [w.get("miejscowosc"), w.get("wojewodztwo")] if x)
    typ = TYP_OPIS.get(w.get("typ_dzialalnosci") or "", "Serowarnia zagrodowa")
    podtytul = f"{typ}{' — ' + lokal if lokal else ''}"
    opis_meta = (w.get("opis") or "")[:150] or f"{w['nazwa']} — {typ}."

    # LocalBusiness: ten sam typ, ktorego Google uzywa do wynikow lokalnych
    ld = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": w["nazwa"],
        "url": url,
        "inLanguage": "pl",
    }
    if w.get("opis"):
        ld["description"] = w["opis"]
    if w.get("telefon"):
        ld["telephone"] = w["telefon"]
    if w.get("email_kontakt"):
        ld["email"] = w["email_kontakt"]
    if lokal:
        ld["address"] = {"@type": "PostalAddress", "addressCountry": "PL"}
        if w.get("miejscowosc"):
            ld["address"]["addressLocality"] = w["miejscowosc"]
        if w.get("wojewodztwo"):
            ld["address"]["addressRegion"] = w["wojewodztwo"]
    obrazy = [w["zdjecie_glowne"]] if w.get("zdjecie_glowne") else []
    obrazy += [g["url"] for g in (w.get("galeria") or []) if g.get("url")]
    if obrazy:
        ld["image"] = obrazy
    sameas = [x for x in [w.get("www"), w.get("facebook")] if x]
    if sameas:
        ld["sameAs"] = sameas
    if w.get("produkty"):
        ld["makesOffer"] = [
            {"@type": "Offer", "itemOffered": {"@type": "Product", "name": p, "category": "Ser"}}
            for p in w["produkty"]
        ]
    # Swiezosc: data ostatniej aktualnosci
    if wpisy:
        ld["dateModified"] = wpisy[0]["utworzono"]

    czesci = [f"""<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(w['nazwa'])}{' — ' + esc(lokal) if lokal else ''} | Serowarnie</title>
  <meta name="description" content="{esc(opis_meta)}" />
  <link rel="canonical" href="{url}" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="{esc(w['nazwa'])}" />
  <meta property="og:description" content="{esc(opis_meta)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{url}" />
  <meta property="og:locale" content="pl_PL" />"""]
    if w.get("zdjecie_glowne"):
        czesci.append(f'  <meta property="og:image" content="{esc(w["zdjecie_glowne"])}" />')
    czesci.append(f"""  <script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=2)}
  </script>
  <style>{STYL}</style>
</head>
<body>
  <nav class="crumbs">
    <a href="https://mojaserowarnia.pl/">Moja Serowarnia</a> →
    <a href="https://mojaserowarnia.pl/serowarnie.html">Serowarnie</a> →
    {esc(w['nazwa'])}
  </nav>

  <h1>{esc(w['nazwa'])}</h1>
  <p class="lead">{esc(podtytul)}</p>""")

    if w.get("zdjecie_glowne"):
        czesci.append(
            f'  <p><img src="{esc(w["zdjecie_glowne"])}" alt="{esc(w["nazwa"])}'
            f'{" — " + esc(lokal) if lokal else ""}" loading="lazy" decoding="async" /></p>')

    if w.get("opis"):
        czesci.append("  <h2>O nas</h2>")
        for akapit in w["opis"].split("\n"):
            if akapit.strip():
                czesci.append(f"  <p>{esc(akapit)}</p>")

    if w.get("produkty") or w.get("rodzaj_mleka"):
        czesci.append("  <h2>Co produkujemy</h2>")
        if w.get("produkty"):
            czesci.append("  <ul>" + "".join(f"<li>{esc(p)}</li>" for p in w["produkty"]) + "</ul>")
        if w.get("rodzaj_mleka"):
            czesci.append(f"  <p>Mleko: {esc(', '.join(w['rodzaj_mleka']))}</p>")

    if w.get("forma_sprzedazy"):
        naglowek = "Jak spróbować" if w.get("typ_dzialalnosci") == "agroturystyka" else "Jak kupić lub spróbować"
        czesci.append(f"  <h2>{naglowek}</h2>")
        czesci.append("  <ul>" + "".join(f"<li>{esc(f)}</li>" for f in w["forma_sprzedazy"]) + "</ul>")

    if wpisy:
        czesci.append("  <h2>Aktualności</h2>")
        for a in wpisy:
            czesci.append('  <div class="wpis">')
            if a.get("zdjecie_url"):
                czesci.append(
                    f'    <p><img src="{esc(a["zdjecie_url"])}" alt="{esc(a["tresc"][:100])}" '
                    f'loading="lazy" decoding="async" width="400" /></p>')
            czesci.append(f"    <p>{esc(a['tresc'])}</p>")
            czesci.append(f'    <time datetime="{esc(a["utworzono"])}">{data_pl(a["utworzono"])}</time>')
            czesci.append("  </div>")

    if w.get("galeria"):
        czesci.append("  <h2>Galeria</h2>")
        czesci.append('  <div class="galeria">')
        for i, g in enumerate(w["galeria"], 1):
            podpis = g.get("opis") or f"{w['nazwa']} — zdjęcie {i}"
            czesci.append(
                f'    <figure><img src="{esc(g["url"])}" alt="{esc(podpis)}" loading="lazy" '
                f'decoding="async" />' +
                (f"<figcaption>{esc(g['opis'])}</figcaption>" if g.get("opis") else "") +
                "</figure>")
        czesci.append("  </div>")

    kontakt = []
    if lokal:
        kontakt.append(f"<li>{esc(lokal)}</li>")
    if w.get("telefon"):
        kontakt.append(f'<li>tel. <a href="tel:{esc(w["telefon"].replace(" ", ""))}">{esc(w["telefon"])}</a></li>')
    if w.get("email_kontakt"):
        kontakt.append(f'<li><a href="mailto:{esc(w["email_kontakt"])}">{esc(w["email_kontakt"])}</a></li>')
    if w.get("www"):
        kontakt.append(f'<li><a href="{esc(w["www"])}" rel="nofollow noopener">{esc(w["www"])}</a></li>')
    if w.get("facebook"):
        kontakt.append(f'<li><a href="{esc(w["facebook"])}" rel="nofollow noopener">Facebook</a></li>')
    if kontakt:
        czesci.append("  <h2>Kontakt</h2>")
        czesci.append("  <ul>" + "".join(kontakt) + "</ul>")

    czesci.append(f"""
  <p class="note">Dane pochodzą od producenta i są publikowane za jego zgodą. Moja Serowarnia nie
  pośredniczy w sprzedaży ani nie weryfikuje oferty.</p>

  <footer>
    Wizytówka w katalogu serowarni zagrodowych.
    Wersja interaktywna: <a href="https://mojaserowarnia.pl/serowarnie/{slug}">mojaserowarnia.pl</a>.
    Cały katalog: <a href="https://mojaserowarnia.pl/serowarnie.html">serowarnie w Polsce</a>.
  </footer>
</body>
</html>""")
    return "\n".join(czesci)


def katalog_html(wizytowki):
    ld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Katalog polskich serowarni zagrodowych",
        "description": "Lista małych, rzemieślniczych serowarni w Polsce — gdzie kupić ser prosto od producenta.",
        "inLanguage": "pl",
        "url": "https://mojaserowarnia.pl/serowarnie.html",
    }
    karty = []
    for w in wizytowki:
        lokal = ", ".join(x for x in [w.get("miejscowosc"), w.get("wojewodztwo")] if x)
        opis = (w.get("opis") or "")[:160]
        karty.append(
            f'    <div class="karta"><a href="https://mojaserowarnia.pl/serowarnie/{w["slug"]}.html">'
            f'{esc(w["nazwa"])}</a>'
            + (f"<br><small>{esc(lokal)}</small>" if lokal else "")
            + (f"<p>{esc(opis)}…</p>" if opis else "")
            + (f"<p><small>{esc(', '.join(w['produkty'][:5]))}</small></p>" if w.get("produkty") else "")
            + "</div>")

    return f"""<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Serowarnie zagrodowe w Polsce — katalog producentów</title>
  <meta name="description" content="Katalog małych serowarni zagrodowych w Polsce. Znajdź producenta w swoim województwie i kup ser prosto od gospodarza." />
  <link rel="canonical" href="https://mojaserowarnia.pl/serowarnie.html" />
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=2)}
  </script>
  <style>{STYL}</style>
</head>
<body>
  <nav class="crumbs"><a href="https://mojaserowarnia.pl/">Moja Serowarnia</a> → Serowarnie</nav>
  <h1>Serowarnie zagrodowe w Polsce</h1>
  <p class="lead">Mali, rzemieślniczy producenci sera — prosto od gospodarza.
  Katalog tworzą sami serowarzy; każda wizytówka jest sprawdzana przed publikacją.</p>

  <div class="karty">
{chr(10).join(karty)}
  </div>

  <p class="note">Prowadzisz serowarnię? Wizytówka jest darmowa —
  <a href="https://mojaserowarnia.pl/dashboard/moja-serowarnia">dodaj swoją</a>.</p>

  <footer>
    Katalog serowarni zagrodowych. Wersja interaktywna z wyszukiwarką:
    <a href="https://mojaserowarnia.pl/serowarnie">mojaserowarnia.pl/serowarnie</a>.
  </footer>
</body>
</html>"""


def main():
    env = czytaj_env()
    url = env.get("VITE_SUPABASE_URL")
    key = env.get("VITE_SUPABASE_PUBLISHABLE_KEY")
    if not url or not key:
        print("Brak VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY w .env")
        return 1

    # RLS wpuszcza anonima tylko do opublikowanych i za zgoda — filtr jest
    # dodatkowym zabezpieczeniem, nie jedynym.
    wizytowki = pobierz(url, key, "serowarnie?select=*&status=eq.opublikowany&order=nazwa")
    if not wizytowki:
        print("Brak opublikowanych wizytowek — nie ma czego generowac.")
        return 0

    wpisy = pobierz(url, key, "serowarnia_wpisy?select=*&order=utworzono.desc")
    wg_wizytowki = {}
    for a in wpisy:
        wg_wizytowki.setdefault(a["serowarnia_id"], []).append(a)

    os.makedirs(OUT_DIR, exist_ok=True)
    for w in wizytowki:
        html = wizytowka_html(w, wg_wizytowki.get(w["id"], []))
        with open(os.path.join(OUT_DIR, f"{w['slug']}.html"), "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  OK  serowarnie/{w['slug']}.html"
              f"  (wpisow: {len(wg_wizytowki.get(w['id'], []))},"
              f" zdjec: {(1 if w.get('zdjecie_glowne') else 0) + len(w.get('galeria') or [])})")

    with open(os.path.join(ROOT, "public", "serowarnie.html"), "w", encoding="utf-8") as f:
        f.write(katalog_html(wizytowki))
    print(f"  OK  serowarnie.html (katalog, {len(wizytowki)} wizytowek)")

    print(f"\nGotowe: {len(wizytowki)} wizytowek + katalog.")
    print("Pamietaj o regule w .htaccess:  RewriteRule ^serowarnie/?$ /index.html [L]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
