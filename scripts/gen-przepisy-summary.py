#!/usr/bin/env python3
"""
Generuje public/przepisy.summary.txt — lekki kontrakt slug→ser dla integracji
(odpowiedź na BRIEF #2 od fermly). Format pipe: slug | nazwa PL | URL | rodzina.

Slug = nazwa pliku przepisu (= pole `id` z recipesData.ts, STABILNE — nie
slugifikacja nazwy, więc zmiana nazwy sera nie rusza sluga). Czyta istniejące
public/przepisy/*.html, więc nowe przepisy pojawią się automatycznie.

Uruchom: python scripts/gen-przepisy-summary.py   (potem wgraj plik na FTP)
"""
import glob, re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
OUT = os.path.join(PUB, "przepisy.summary.txt")

# rodzina sera — pomaga fermly zmapować slug na kategorię DairyProductType
FAMILY = {
    "asiago": "ser dojrzewający (półtwardy)",
    "brie": "ser dojrzewający (miękki, biała pleśń)",
    "caciotta": "ser dojrzewający (półtwardy)",
    "camembert": "ser dojrzewający (miękki, biała pleśń)",
    "cheddar": "ser dojrzewający (twardy)",
    "dunlop": "ser dojrzewający (twardy)",
    "emmental": "ser dojrzewający (twardy, oczka)",
    "feta-grecka": "ser świeży/solankowy",
    "feta_bulgarische": "ser świeży/solankowy",
    "gorgonzola": "ser dojrzewający (niebieska pleśń)",
    "gouda": "ser dojrzewający (półtwardy)",
    "gruyere": "ser dojrzewający (twardy, alpejski)",
    "halloumi": "ser świeży/parzony (solankowy)",
    "korycinski": "ser podpuszczkowy (półtwardy, regionalny)",
    "mascarpone": "produkt śmietankowy (świeży)",
    "mozzarella": "ser świeży (pasta filata)",
    "parmezan": "ser dojrzewający (twardy, długodojrzewający)",
    "ricotta": "serwatkowy (rikotta)",
    "roquefort": "ser dojrzewający (niebieska pleśń)",
    "stilton": "ser dojrzewający (niebieska pleśń)",
    "yorkshire": "ser dojrzewający (półtwardy)",
}

NAME_RE = re.compile(r'"@type":\s*"Recipe",.*?"name":\s*"([^"]+)"', re.S)
H1_RE = re.compile(r'<h1>([^<]+)</h1>')


def clean(name):
    # utnij dopisek po myślniku ("Gouda — holenderski ser domowy" -> "Gouda")
    return re.split(r'\s+[—–-]\s+', name, maxsplit=1)[0].strip()


def main():
    rows = []
    for f in sorted(glob.glob(os.path.join(PUB, "przepisy", "*.html"))):
        slug = os.path.basename(f)[:-5]
        if slug == "przewodnik":
            continue
        h = open(f, encoding="utf-8").read()
        m = NAME_RE.search(h) or H1_RE.search(h)
        name = clean(m.group(1)) if m else slug.capitalize()
        url = f"https://mojaserowarnia.pl/przepisy/{slug}.html"
        fam = FAMILY.get(slug, "ser dojrzewający")
        rows.append((slug, name, url, fam))

    out = [
        f"PRZEPISY NA SERY — mojaserowarnia.pl ({len(rows)} serów)",
        "Pełne przepisy (składniki, kultury, kroki krok po kroku, FAQ): https://mojaserowarnia.pl/przepisy/przewodnik.html",
        "Kontrakt slug→ser dla integracji. Slug = identyfikator z URL (STABILNY). Format wiersza:",
        "slug | nazwa PL | URL | rodzina",
        "",
    ]
    for slug, name, url, fam in rows:
        out.append(f"{slug} | {name} | {url} | {fam}")
    open(OUT, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(f"OK - {len(rows)} przepisow -> {os.path.relpath(OUT, ROOT)} ({os.path.getsize(OUT)} B)")


if __name__ == "__main__":
    main()
