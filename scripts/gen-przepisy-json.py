#!/usr/bin/env python3
"""
Generuje public/przepisy/index.json — wspólny kontrakt przepisów (schemat v2, BRIEF #3).

FAZA 3b: pola liczbowe per krok (temperaturaC/czasMin/pH/warunekKonca) wyekstrahowane
z TEKSTU naszych kroków (tytuły mają je jako "32°C ~45 min" — to nasze własne,
poprawne dane, tylko przeniesione z tekstu do pól). Gdzie tekst nie podaje liczby → null
(runner Fermly pokaże opis/wskazówkę). Bloki `solenie`/`dojrzewanie` parsowane z pól
salting/aging/ageTime. `kroki[].dodatki[]` = wykryte „kiedy dodać".

Klucze i wartości enumów BEZ polskich znaków (uzgodnione z fermly, wersjaSchematu:2).
`rodzina`/`nazwa` z public/przepisy.summary.txt (1:1). `nr` kroku stały 1..n.

Uruchom: python scripts/gen-przepisy-json.py   (potem FTP upload index.json)
"""
import re, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "data", "recipesData.ts")
SUMMARY = os.path.join(ROOT, "public", "przepisy.summary.txt")
OUT = os.path.join(ROOT, "public", "przepisy", "index.json")

STR = r'"((?:\\.|[^"])*)"'


def unesc(s):
    return s.replace('\\"', '"').replace("\\n", " ").replace("\\t", " ").strip()


def grab(block, key):
    m = re.search(r'\b' + key + r':\s*' + STR, block)
    return unesc(m.group(1)) if m else ""


def grab_array(block, key):
    m = re.search(key + r':\s*\[(.*?)\n    \]', block, re.S)
    return m.group(1) if m else ""


def fnum(x):
    return float(x.replace(",", ".")) if x else None


def num(s):
    m = re.search(r'(\d+(?:[.,]\d+)?)', s or "")
    return fnum(m.group(1)) if m else None


# ---- FAZA 3b: ekstrakcja liczb z tekstu kroku --------------------------------
def parse_temp(s):
    s = s or ""
    m = re.search(r'(\d{2,3})\s*[–-]\s*(\d{2,3})\s*°\s*C', s)
    if m:
        return {"min": int(m.group(1)), "max": int(m.group(2))}
    m = re.search(r'(\d{2,3})\s*°\s*C', s)
    return int(m.group(1)) if m else None


def parse_time_min(s):
    s = s or ""
    m = re.search(r'(\d+)\s*[–-]\s*(\d+)\s*min', s)
    if m:
        return int(m.group(2))           # górna granica zakresu
    m = re.search(r'~?\s*(\d+)\s*min', s)
    if m:
        return int(m.group(1))
    m = re.search(r'(\d+(?:[.,]\d+)?)\s*(?:h|godz)', s)
    if m:
        return int(round(fnum(m.group(1)) * 60))
    return None


def parse_ph(s):
    vals = re.findall(r'pH\s*(\d(?:[.,]\d+)?)', s or "", re.I)
    return fnum(vals[-1]) if vals else None     # ostatnie pH = cel etapu


def parse_cond(s):
    t = (s or "").lower()
    if ("czyst" in t and ("złam" in t or "zlam" in t or "rozdziel" in t)) or "clean break" in t:
        return "czysty rozłam skrzepu (clean break)"
    if "ziarno" in t and ("stward" in t or "jędrn" in t or "jedrn" in t):
        return "ziarno odpowiednio jędrne"
    ph = parse_ph(s)
    if ph is not None and ("do ph" in t or "cel" in t or "→" in t):
        return "pH " + str(ph).replace(".", ",")
    return None


def parse_dodatki(content):
    t = (content or "").lower()
    out = []
    if "zakwas" in t or "dodaj kultur" in t or "kultur" in t and "dodaj" in t:
        out.append({"co": "kultura startowa", "dawka": "wg producenta"})
    if "podpuszczk" in t:
        out.append({"co": "podpuszczka", "dawka": "wg siły podpuszczki"})
    if "cacl" in t or "chlorek wapnia" in t:
        out.append({"co": "chlorek wapnia (CaCl2)", "dawka": "0,2-0,3 g/L"})
    return out


def cold_only(t):
    """temp dojrzewania/solenia jest zimna (≤20°C) — odfiltruj wyciek temp gotowania."""
    if t is None:
        return None
    if isinstance(t, dict):
        return t if t.get("max", 99) <= 20 else None
    return t if t <= 20 else None


def ubytek_for(rodzina):
    """Całkowity % ubytku wagi przez zalecane dojrzewanie (estymata domenowa per rodzina).
    Ubytek = utrata wilgoci; twarde/długodojrzewające tracą najwięcej, miękkie/świeże mało.
    Kolejność warunków istotna (półtwardy zawiera 'twardy')."""
    r = (rodzina or "").lower()
    if "długodojrzew" in r or "dlugodojrzew" in r: return 30
    if "alpejski" in r: return 28
    if "oczka" in r: return 22
    if "półtward" in r or "poltward" in r: return 14
    if "twardy" in r: return 25
    if "niebieska" in r: return 12
    if "biała" in r or "biala" in r: return 8
    if "solankowy" in r or "pasta filata" in r: return 2
    if "rikotta" in r or "śmietank" in r or "smietank" in r: return 0
    return 12  # inne dojrzewające


def parse_solenie(s):
    if not s or not s.strip():
        return None
    t = s.lower()
    typ = "solanka" if "solank" in t else ("w masie" if ("w masie" in t or "such" in t) else None)
    mp = re.search(r'(\d+)\s*[–-]?\s*\d*\s*%', s)
    mh = re.search(r'(\d+(?:[.,]\d+)?)\s*(?:h|godz)', s)
    res = {"typ": typ, "stezenieProc": int(mp.group(1)) if mp else None,
           "czasH": fnum(mh.group(1)) if mh else None, "temperaturaC": cold_only(parse_temp(s))}
    return res if any(v is not None for v in res.values()) else None


def parse_dojrzewanie(aging, age_time):
    if not ((aging or "").strip() or (age_time or "").strip()):
        return None
    dni = None
    # pierwsza liczba z zakresu (= minimalny czas dojrzewania)
    for pat, mult in [(r'(\d+)\s*(?:[–-]\s*\d+\s*)?dni', 1),
                      (r'(\d+)\s*(?:[–-]\s*\d+\s*)?tyg', 7),
                      (r'(\d+)\s*(?:[–-]\s*\d+\s*)?(?:mies|miesi)', 30)]:
        m = re.search(pat, age_time or "")
        if m:
            dni = int(m.group(1)) * mult
            break
    mw = re.search(r'(\d+)\s*[–-]?\s*\d*\s*%', aging or "")
    pieleg = None
    tl = (aging or "").lower()
    if any(k in tl for k in ["obrac", "myć", "myc", "nacier", "nakłuw", "naklu", "parafin", "szczotk", "wilż"]):
        pieleg = (aging or "").strip()[:140]
    res = {"dni": dni, "temperaturaC": cold_only(parse_temp(aging)),
           "wilgotnoscProc": int(mw.group(1)) if mw else None, "pielegnacja": pieleg}
    return res if any(v is not None for v in res.values()) else None


# ------------------------------------------------------------------------------
def summary_map():
    out = {}
    for ln in open(SUMMARY, encoding="utf-8").read().splitlines():
        parts = [p.strip() for p in ln.split("|")]
        if len(parts) == 4 and parts[0] != "slug":
            out[parts[0]] = {"nazwa": parts[1], "rodzina": parts[3]}
    return out


def parse_recipes(src):
    out = {}
    for block in re.split(r'\n  \{\n', src):
        rid = grab(block, "id")
        if not rid:
            continue
        cult = grab_array(block, "cultureSubstitutes")
        cultures = [unesc(n) for n in re.findall(r'name:\s*' + STR, cult)]
        stp = grab_array(block, "steps")
        steps = re.findall(r'title:\s*' + STR + r',\s*content:\s*' + STR + r'(?:,\s*tip:\s*' + STR + r')?', stp, re.S)
        out[rid] = dict(
            name=grab(block, "name"), milkBase=grab(block, "milkBase"),
            coagulant=grab(block, "coagulant"), ageTime=grab(block, "ageTime"),
            aging=grab(block, "aging"), yield_=grab(block, "yield"),
            salting=grab(block, "salting"), cultures=cultures, steps=steps)
    return out


def milk_typ(s):
    s = (s or "").lower()
    for k, v in [("krow", "krowie"), ("owcz", "owcze"), ("koz", "kozie"), ("miesz", "mieszane")]:
        if k in s:
            return v
    return None


def build(slug, r, meta):
    kroki = []
    for i, (ti, co, tip) in enumerate(r["steps"], 1):
        ti, co, tip = unesc(ti), unesc(co), unesc(tip)
        whole = f"{ti}. {co}. {tip}"
        kroki.append({
            "nr": i, "nazwa": ti, "opis": co, "wskazowka": tip or None,
            "temperaturaC": parse_temp(ti) if parse_temp(ti) is not None else parse_temp(co),
            "czasMin": parse_time_min(ti) if parse_time_min(ti) is not None else parse_time_min(co),
            "warunekKonca": parse_cond(whole),
            "pH": parse_ph(whole),
            "dodatki": parse_dodatki(co),
        })
    uwagi = " ".join(p for p in [f"Czas dojrzewania: {r['ageTime']}." if r["ageTime"] else "", r["aging"]] if p) or None
    dojrz = parse_dojrzewanie(r["aging"], r["ageTime"])
    if dojrz is not None:
        dojrz["ubytekWagiProc"] = ubytek_for(meta["rodzina"])   # BRIEF #5: ubytek wagi w dojrzewaniu
    return {
        "wersjaSchematu": 2,
        "slug": slug, "nazwa": meta["nazwa"], "rodzina": meta["rodzina"],
        "zrodlo": "serowarnia-kurated", "autor": None, "licencja": None,
        "url": f"https://mojaserowarnia.pl/przepisy/{slug}.html",
        "mleko": {"litry": num(r["milkBase"]), "typ": milk_typ(r["milkBase"]), "pasteryzacja": None},
        "kultury": [{"co": c, "dawka": "wg producenta"} for c in r["cultures"]],
        "podpuszczka": ({"typ": None, "dawka": r["coagulant"], "czasKrzepnieciaMin": None}
                        if r["coagulant"] else None),
        "kroki": kroki,
        "solenie": parse_solenie(r["salting"]),
        "dojrzewanie": dojrz,
        "wydajnoscKg": num(r["yield_"]),
        "uwagi": uwagi,
    }


def main():
    meta = summary_map()
    recipes = parse_recipes(open(SRC, encoding="utf-8").read())
    items = [build(s, recipes[s], meta[s]) for s in sorted(meta) if s in recipes]
    doc = {"wersjaSchematu": 2, "zrodlo": "serowarnia-kurated", "faza": "3b",
           "wygenerowano": "skrypt gen-przepisy-json.py", "przepisy": items}
    open(OUT, "w", encoding="utf-8").write(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    nk = sum(len(it["kroki"]) for it in items)
    with_temp = sum(1 for it in items for k in it["kroki"] if k["temperaturaC"] is not None)
    with_time = sum(1 for it in items for k in it["kroki"] if k["czasMin"] is not None)
    print(f"OK - {len(items)} przepisow, {nk} krokow -> {os.path.relpath(OUT, ROOT)} ({os.path.getsize(OUT)} B)")
    print(f"   3b: krokow z temperatura={with_temp}/{nk}, z czasem={with_time}/{nk}")


if __name__ == "__main__":
    main()
