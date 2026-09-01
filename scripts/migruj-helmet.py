# -*- coding: utf-8 -*-
"""ETAP 1: wyprowadzenie tytulow, opisow i JSON-LD z martwych blokow <Helmet>.

react-helmet 6.1.0 pod Reactem 18 nie emituje w tym projekcie NICZEGO. Tresc
tytulow i opisow jest w kodzie napisana i nigdy nie dociera do dokumentu.

ZRODLEM tytulu i opisu jest MIRROR, nie Helmet. Powod: mirrory maja teksty
lepsze (konkretniejsze, bez sufiksu "| Moja Serowarnia" zjadajacego limit
znakow), a przy okazji obie warstwy zaczynaja mowic to samo. Helmet sluzy za
zapas dla stron, ktore mirrora nie maja.

CO ROBI:
  1. dopisuje wpisy do src/data/metaStron.ts (trasy statyczne),
  2. usuwa bloki <Helmet> i import,
  3. przenosi JSON-LD z Helmeta do zwyklego <script>, idiomem tego repo
     (dangerouslySetInnerHTML — tak robia BreadcrumbSchema, FAQSchema i reszta).

Strony dynamiczne (:slug, :id) i te, ktore ustawiaja tytul same, sa POMIJANE
przy metaStron — dostaja tylko sprzatanie. Tytul podpina sie im recznie.

Uruchom:  python scripts/migruj-helmet.py            (raport)
          python scripts/migruj-helmet.py --zapisz
"""
import io, os, re, json, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = lambda *p: os.path.join(ROOT, *p)
ZAPISZ = "--zapisz" in sys.argv

# Obsluzone osobno, bo tytul zalezy od danych wczytanych w czasie dzialania.
DYNAMICZNE = {"SerowarniaProfil", "CulinaryRecipeDetails", "RecipeDetails"}
# Strona glowna ma tytul i opis w statycznym index.html — nie dublowac.
POMIN_META = {"Index"}

audyt = json.load(io.open(R("data", "audyt-wizytowka.json"), encoding="utf-8"))
po_komponencie = {w["komponent"]: w for w in audyt}


def jedna_linia(s):
    return re.sub(r"\s+", " ", s).strip() if s else None


def z_mirrora(sciezka):
    p = R("public", *sciezka.lstrip("/").split("/"))
    if not os.path.exists(p):
        return None, None
    t = io.open(p, encoding="utf-8", errors="replace").read()
    ty = re.search(r"<title>(.*?)</title>", t, re.S)
    op = re.search(r'<meta\s+name="description"\s+content="(.*?)"', t, re.S)
    return jedna_linia(ty.group(1)) if ty else None, jedna_linia(op.group(1)) if op else None


ATR = r"""(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})"""


def parsuj(blok):
    ty = re.search(r"<title>(.*?)</title>", blok, re.S)
    op = re.search(r'name="description"\s*\n?\s*content=' + ATR, blok, re.S)
    ld = re.findall(r'<script type="application/ld\+json">(.*?)</script>', blok, re.S)
    return (jedna_linia(ty.group(1)) if ty else None,
            jedna_linia(next((g for g in op.groups() if g), None)) if op else None,
            [x.strip() for x in ld])


wpisy, sprzatanie, uwagi = [], [], []

for f in sorted(os.listdir(R("src", "pages"))):
    if not f.endswith(".tsx"):
        continue
    komp = f[:-4]
    plik = R("src", "pages", f)
    tresc = io.open(plik, encoding="utf-8").read()
    if "<Helmet" not in tresc:
        continue

    bloki = list(re.finditer(r"([ \t]*)<Helmet>(.*?)</Helmet>\n?", tresc, re.S))
    if not bloki:
        uwagi.append("%s: <Helmet> bez pary zamykajacej — pomijam" % komp)
        continue

    ld_razem = []
    for m in bloki:
        _, _, ld = parsuj(m.group(2))
        ld_razem += [(m.group(1), x) for x in ld]
    sprzatanie.append((plik, komp, len(bloki), len(ld_razem)))

    if komp in DYNAMICZNE or komp in POMIN_META:
        continue
    w = po_komponencie.get(komp)
    if not w or not w.get("sciezka"):
        uwagi.append("%s: brak trasy w audycie — tylko sprzatanie" % komp)
        continue
    if w.get("maTytul"):
        uwagi.append("%s (%s): ustawia tytul sam — tylko sprzatanie" % (komp, w["sciezka"]))
        continue

    hy, ho, _ = parsuj(bloki[-1].group(2))
    my = mo = None
    if w.get("mirror"):
        my, mo = z_mirrora(w["mirror"])
    tytul, zrodlo_t = (my, "mirror") if my else (hy, "Helmet")
    opis, zrodlo_o = (mo, "mirror") if mo else (ho, "Helmet")
    if not tytul:
        uwagi.append("%s (%s): BRAK tytulu w obu zrodlach" % (komp, w["sciezka"]))
        continue
    if not opis:
        uwagi.append("%s (%s): brak opisu — wpis bez description" % (komp, w["sciezka"]))
    wpisy.append(dict(sciezka=w["sciezka"], title=tytul, description=opis,
                      mirror=(w.get("mirror") or "").lstrip("/") or None,
                      zrodloT=zrodlo_t, zrodloO=zrodlo_o))

# ---------- zapis metaStron.ts ----------
def ts(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def blok_ts(w):
    l = ['  %s: {' % ts(w["sciezka"])]
    l.append("    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: %s (tytul), %s (opis)."
             % (w["zrodloT"], w["zrodloO"]))
    l.append("    title: %s," % ts(w["title"]))
    if w["description"]:
        l.append("    description:")
        l.append("      %s," % ts(w["description"]))
    else:
        l.append("    description: undefined,")
    if w["mirror"]:
        l.append("    mirror: %s," % ts(w["mirror"]))
    l.append("  },")
    return "\n".join(l)


raport = ["WPISY DO metaStron.ts (%d)" % len(wpisy), ""]
for w in sorted(wpisy, key=lambda x: x["sciezka"]):
    raport.append("  %-32s [%s] %s" % (w["sciezka"], w["zrodloT"], w["title"]))
raport += ["", "SPRZATANIE PLIKOW (%d)" % len(sprzatanie), ""]
for _, komp, nb, nld in sprzatanie:
    raport.append("  %-30s blokow: %d  JSON-LD do przeniesienia: %d" % (komp, nb, nld))
raport += ["", "UWAGI (%d)" % len(uwagi), ""] + ["  " + u for u in uwagi]
io.open(os.environ.get("SCRATCH", ".") + "/migracja-raport.txt", "w",
        encoding="utf-8", newline="\n").write("\n".join(raport))

if not ZAPISZ:
    print("RAPORT: %s/migracja-raport.txt (nic nie zapisano)" % os.environ.get("SCRATCH", "."))
    sys.exit(0)

meta = io.open(R("src", "data", "metaStron.ts"), encoding="utf-8").read()
if "description?: string" not in meta:
    meta = meta.replace("  description: string;", "  description?: string;")
    meta = meta.replace("  /** Ścieżka mirrora względem public/ — dla skryptu synchronizującego. */\n  mirror: string;",
                        "  /** Ścieżka mirrora względem public/ — dla skryptu synchronizującego. */\n  mirror?: string;")
nowe = "\n".join(blok_ts(w) for w in sorted(wpisy, key=lambda x: x["sciezka"]))
meta = re.sub(r"\n\};\s*$", "\n" + nowe + "\n};\n", meta)
io.open(R("src", "data", "metaStron.ts"), "w", encoding="utf-8", newline="\n").write(meta)

for plik, komp, _, _ in sprzatanie:
    t = io.open(plik, encoding="utf-8").read()
    def zamien(m):
        wciecie, blok = m.group(1), m.group(2)
        _, _, ld = parsuj(blok)
        if not ld:
            return ""
        return "".join(
            '%s<script\n%s  type="application/ld+json"\n%s  dangerouslySetInnerHTML={{ __html: %s }}\n%s/>\n'
            % (wciecie, wciecie, wciecie, x.strip("{}").strip(), wciecie) for x in ld)
    t = re.sub(r"([ \t]*)<Helmet>(.*?)</Helmet>\n?", zamien, t, flags=re.S)
    t = re.sub(r'import \{ Helmet \} from "react-helmet";\n', "", t)
    io.open(plik, "w", encoding="utf-8", newline="\n").write(t)

print("ZAPISANO: %d wpisow w metaStron.ts, %d plikow posprzatanych" % (len(wpisy), len(sprzatanie)))
