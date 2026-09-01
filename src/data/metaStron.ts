/**
 * Tytuły i opisy stron treściowych — jedno źródło dla trasy React i mirrora.
 *
 * DLACZEGO TO ISTNIEJE: do tej pory każda strona miała tytuł i opis wpisany na
 * sztywno w swoim komponencie, a mirror miał własny, napisany osobno. Dwie kopie
 * tego samego tekstu w dwóch plikach rozjeżdżają się w tym projekcie regularnie —
 * przy FAQ na /prawo/rhd doszło do 11 pytań w Reakcie i 12 w mirrorze.
 *
 * Przepisy mają swój odpowiednik w `seoTitle`/`seoDescription` w recipesData;
 * ten plik obsługuje strony, które przepisami nie są.
 *
 * Do mirrorów wartości dosyła `python scripts/sync-seo-mirrory.py --zapisz`.
 *
 * Limity: tytuł do ~60 znaków, opis do ~155 — dłuższe Google przycina.
 */

export interface MetaStrony {
  title: string;
  description: string;
  /** Ścieżka mirrora względem public/ — dla skryptu synchronizującego. */
  mirror: string;
}

export const metaStron: Record<string, MetaStrony> = {
  "/prawo/rhd": {
    // Profil odbiorcy (od Marka): małe gospodarstwo szukające dodatkowego dochodu
    // BEZ zakładania działalności. Nie widzi, co zyskuje — widzi papiery. Dlatego
    // opis zaczyna się od korzyści, a nie od obowiązków.
    // Dane: 2650 wyświetleń, CTR 0,34%. Uwaga — 1211 z nich to samo „rhd”
    // (pozycja 9,2), fraza dwuznaczna; realne intencje to „rhd limity” (poz. 16),
    // „rhd wymagania” (poz. 28), „kasa fiskalna” (poz. 10).
    title: "Rolniczy handel detaliczny (RHD) — sprzedaż bez działalności",
    description:
      "Sprzedawaj własne sery i przetwory bez zakładania firmy. Limit 100 000 zł bez PIT, rejestracja w 14 lub 30 dni, ewidencja i kasa fiskalna.",
    mirror: "prawo/rhd.html",
  },
  "/prawo/mol": {
    // Ten sam odbiorca co przy RHD, ale na większą skalę. Kluczowa różnica, której
    // nie widać nigdzie indziej: w MOL surowiec NIE musi pochodzić z własnego
    // gospodarstwa — i to jest najczęstszy powód, dla którego ktoś wybiera MOL.
    // Dane: 179 wyświetleń, 1 kliknięcie. Za mało, by cokolwiek zmierzyć.
    title: "MOL — działalność marginalna, lokalna i ograniczona: limity",
    description:
      "MOL to sprzedaż produktów zwierzęcych na większą skalę niż RHD: 0,5 tony sera tygodniowo, obszar województwa, a surowiec nie musi być własny.",
    mirror: "prawo/mol.html",
  },
};
