#!/usr/bin/env python3
"""
Konwersja ciezkich obrazow z src/assets na WebP + podmiana importow.

DLACZEGO: Cloudflare Web Analytics pokazal LCP P99 = 10,5 s, a Debug View wskazal
winowajce z nazwiska - camembert.jpg wazacy 912 kB w kontenerze 16:9. Przy medianie
736 ms to nie jest problem "calej strony", tylko kilku konkretnych plikow.

CO ROBI:
  1. Bierze TYLKO obrazy faktycznie importowane w src/ (nieuzywane pliki zostawia -
     Vite ich i tak nie pakuje, wiec konwersja niczego by nie dala).
  2. Konwertuje te powyzej progu na WebP, skalujac do MAX_SZEROKOSC.
  3. Podmienia sciezki w importach, zeby aplikacja od razu uzywala nowych plikow.
  4. Nie rusza plikow, ktore juz maja gotowy odpowiednik *-miniatura.webp - te
     podmienia sie osobno (patrz --pary), bo maja inna nazwe.

Uruchom:  python scripts/konwertuj-obrazy.py            (podglad, nic nie zapisuje)
          python scripts/konwertuj-obrazy.py --zapisz   (konwertuje i podmienia importy)
"""
import glob, io, os, re, sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "src", "assets")
PROG_BAJTY = 120 * 1024      # ponizej tego konwersja nie zwraca sie wysilkiem
MAX_SZEROKOSC = 1600         # naszerszy kontener w serwisie to header ~1600 px
JAKOSC = 82                  # wizualnie nieodroznialne od oryginalu przy tych zdjeciach

# Pliki, dla ktorych lepsza wersja juz LEZY w repo pod inna nazwa.
# camembert.jpg to 912 kB przy 1770x1128; camembert-miniatura.webp to 49 kB przy
# 1280x762 - a kontener i tak jest 16:9, wiec wyzszy oryginal byl przycinany.
PARY = {
    "camembert.jpg": "camembert-miniatura.webp",
    "caciotta.jpg": "caciotta-miniatura.webp",
    "gouda.jpg": "gouda-miniatura.webp",
}


def pliki_zrodlowe():
    sciezki = []
    for wzor in ("src/**/*.tsx", "src/**/*.ts"):
        sciezki += glob.glob(os.path.join(ROOT, wzor), recursive=True)
    return sciezki


def uzywane(sciezki):
    """Nazwy plikow z src/assets, ktore sa gdziekolwiek importowane."""
    tresc = "\n".join(io.open(s, encoding="utf-8").read() for s in sciezki)
    znalezione = set()
    for nazwa in os.listdir(ASSETS):
        if re.search(r'assets/' + re.escape(nazwa) + r'["\']', tresc):
            znalezione.add(nazwa)
    return znalezione


def podmien_w_zrodlach(sciezki, stara, nowa):
    zmienione = 0
    for s in sciezki:
        t = io.open(s, encoding="utf-8").read()
        if "assets/" + stara in t:
            io.open(s, "w", encoding="utf-8", newline="\n").write(
                t.replace("assets/" + stara, "assets/" + nowa))
            zmienione += 1
    return zmienione


def main():
    zapisz = "--zapisz" in sys.argv
    sciezki = pliki_zrodlowe()
    w_uzyciu = uzywane(sciezki)
    zysk = 0

    print("== Gotowe odpowiedniki (podmiana samego importu) ==")
    for stara, nowa in PARY.items():
        if stara not in w_uzyciu:
            print("  %-28s pomijam (nieuzywany)" % stara)
            continue
        p_stara = os.path.join(ASSETS, stara)
        p_nowa = os.path.join(ASSETS, nowa)
        if not os.path.exists(p_nowa):
            print("  %-28s BRAK %s" % (stara, nowa))
            continue
        roznica = os.path.getsize(p_stara) - os.path.getsize(p_nowa)
        zysk += roznica
        print("  %-28s %5dkB -> %-30s %5dkB  (-%dkB)" % (
            stara, os.path.getsize(p_stara) // 1024, nowa,
            os.path.getsize(p_nowa) // 1024, roznica // 1024))
        if zapisz:
            podmien_w_zrodlach(sciezki, stara, nowa)

    print()
    print("== Konwersja na WebP (powyzej %d kB) ==" % (PROG_BAJTY // 1024))
    for nazwa in sorted(w_uzyciu):
        rozsz = os.path.splitext(nazwa)[1].lower()
        if rozsz not in (".jpg", ".jpeg", ".png") or nazwa in PARY:
            continue
        p = os.path.join(ASSETS, nazwa)
        if os.path.getsize(p) < PROG_BAJTY:
            continue
        nowa = os.path.splitext(nazwa)[0] + ".webp"
        p_nowa = os.path.join(ASSETS, nowa)
        obraz = Image.open(p)
        szer, wys = obraz.size
        if szer > MAX_SZEROKOSC:
            wys = round(wys * MAX_SZEROKOSC / szer)
            szer = MAX_SZEROKOSC
        if zapisz:
            kopia = obraz.convert("RGB") if obraz.mode in ("P", "RGBA", "LA") else obraz
            kopia.resize((szer, wys), Image.LANCZOS).save(p_nowa, "WEBP", quality=JAKOSC, method=6)
            podmien_w_zrodlach(sciezki, nazwa, nowa)
            po = os.path.getsize(p_nowa)
        else:
            po = 0
        przed = os.path.getsize(p)
        zysk += przed - po if zapisz else 0
        print("  %-30s %5dkB %sx%s -> %-28s %s" % (
            nazwa, przed // 1024, obraz.width, obraz.height, nowa,
            ("%5dkB %sx%s (-%dkB)" % (po // 1024, szer, wys, (przed - po) // 1024))
            if zapisz else "(podglad)"))

    print()
    if zapisz:
        print("Zaoszczedzone: %.2f MB. Stare pliki ZOSTAJA w repo - usun je osobno,\n"
              "gdy potwierdzisz, ze nic ich nie importuje." % (zysk / 1048576))
    else:
        print("To byl podglad. Uruchom z --zapisz, zeby wykonac.")


if __name__ == "__main__":
    main()
