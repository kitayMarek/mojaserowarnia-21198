/**
 * Flora Danica (Chr. Hansen): kultura, której nie sprzedaje żaden ze sklepów w bazie.
 *
 * PO CO OSOBNA STRONA: na pytanie o kultury do sera czaty wymieniają ją jako pierwszą
 * (test w Claude 21.10.2026), a nasze przepisy polecają ją w siedmiu miejscach.
 * Do tej pory link z przepisu szedł do wyszukiwarki bazy i nie znajdował nic.
 *
 * DLACZEGO NIE WIERSZ W TABELI `cultures`: tabela to oferty sklepów (cena, pojemność,
 * przycisk „Kup"). Flora Danica nie ma oferty w Polsce. Wiersz bez sklepu i ceny
 * zawyżyłby licznik kultur z polskich sklepów i dał przycisk prowadzący donikąd.
 * Gdyby któryś sklep ją wprowadził, trzeba ją dopisać do bazy jak każdą inną kulturę
 * i zdecydować, co dalej z tą stroną.
 *
 * ŹRÓDŁO KAŻDEGO ZDANIA: karty Chr. Hansen dla FD-DVS FLORA DANICA (nr 100103):
 * Product Information wersja 2 z 23.11.2011, Product Specification z 03.10.2014
 * i nowsza karta węgierska (Termékismertető) z tabelą dawek. Nic ze sklepu ani z przepisu.
 *
 * Plik czytają dwie warstwy: src/pages/FloraDanica.tsx i scripts/gen-kultury-strony.py
 * (regexem). Dlatego same proste napisy w cudzysłowach, bez szablonów i bez łączenia.
 */

export interface ZrodloKarty {
  tytul: string;
  url: string;
}

export const floraDanica = {
  nazwa: "Flora Danica",
  producent: "Chr. Hansen",
  typ: "mezofilna aromatyczna, typ LD",
  wstep: "Mezofilna kultura duńskiej firmy Chr. Hansen. W naszych przepisach pojawia się między innymi przy goudzie, brie i twarogu. Według producenta wytwarza aromat i CO₂.",
  sklad: [
    "Lactococcus lactis subsp. lactis",
    "Lactococcus lactis subsp. cremoris",
    "Lactococcus lactis subsp. lactis biovar diacetylactis",
    "Leuconostoc",
  ],
  skladUwaga: "Producent podaje sam rodzaj Leuconostoc, bez gatunku. Litery LD w nazwie typu to właśnie te dwie grupy: L od Leuconostoc, D od diacetylactis. Obie rozkładają cytrynian z mleka na diacetyl (maślany aromat) i CO₂.",
  zastosowanie: "Sery kontynentalne (gouda, edam, leerdammer, samsø) oraz sery miękkie: kwasowe, camembert i sery z niebieską pleśnią.",
  temperatura: "Producent nie podaje jednego zakresu: temperatura zależy od sera. Kontrolę jakości robi w 30°C, a krzywe zakwaszania pokazuje dla 22, 30, 37 i 40°C.",
  dawka: "50 U na 500 litrów mleka (200 U na 2000 L, 500 U na 5000 L). Producent zaznacza, że dawkę do nowego zastosowania trzeba ustalić próbą.",
  opakowanie: "Producent pakuje ją w saszetki 50 U, 200 U i 500 U. Najmniejsza, 50 U, starcza według niego na 500 litrów mleka.",
  przechowywanie: "W zamrażarce, poniżej −18°C: co najmniej 24 miesiące od produkcji. W lodówce (+5°C) co najmniej 6 tygodni. Granulat wsypuje się prosto do mleka, bez rozmrażania.",
  /**
   * Kiedy przeszukaliśmy sklepy z bazy. Napis gotowy do wstawienia w zdanie.
   * Browin doszedł do bazy 27.10.2026: wyszukiwarka browin.pl nie zna Flora Danica,
   * a kategoria kultur ma 5 produktów, wszystkie marki Browin.
   */
  sprawdzono: "21 października 2026, w Browinie 27 października 2026",
  sprawdzoneSklepy: ["Lactic.pl", "Serowar.pl", "Wańczykówka", "Artiser.pl", "GAP Poland", "Browin"],
  zrodla: [
    {
      tytul: "Chr. Hansen, FD-DVS FLORA DANICA, Product Information, wersja 2 (23.11.2011), PDF",
      url: "https://hjemmeriet.com/da/ChrHansen/Products/Flora%20Danica/PI_EU_FLORADANICA_100103_EN.pdf",
    },
    {
      tytul: "Chr. Hansen, FLORA DANICA, Product Specification (03.10.2014), PDF",
      url: "https://hjemmeriet.com/en/ChrHansen/Products/Flora%20Danica/PS_FLORADANICA_100103_EN.pdf",
    },
    {
      tytul: "Chr. Hansen, FLORA DANICA, karta produktu po węgiersku z tabelą dawek, PDF",
      url: "https://mtkiwebaruhaz.hu/users/default/mtki//imports/naverp/item_pdf/tfloradanica.pdf",
    },
  ] as ZrodloKarty[],
};

/** Adres strony. Ten sam napis stoi w recipesData.ts (pole `strona`) i w generatorze mirrora. */
export const ADRES_FLORA_DANICA = "/kultury/flora-danica";
