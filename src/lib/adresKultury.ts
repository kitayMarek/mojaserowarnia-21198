/**
 * Adres strony pojedynczej kultury, budowany z nazwy handlowej.
 *
 * PO CO NAZWA, A NIE ID Z BAZY: ludzie szukają „choozit ma 11 zamiennik", nie
 * identyfikatora. Adres zbudowany z nazwy jest czytelny w wynikach wyszukiwania
 * i da się go przepisać z etykiety opakowania.
 *
 * ⚠️ TA SAMA REGUŁA MUSI BYĆ W GENERATORZE MIRRORA (scripts/gen-kultury-strony.py).
 * Rozjazd tutaj znaczy, że bot dostanie inny adres niż człowiek — a to jest dokładnie
 * ten rodzaj błędu, który u nas już raz kosztował utratę zaindeksowanej strony.
 *
 * KOLIZJE: nazwy w bazie nie są unikalne między sklepami (ta sama kultura bywa
 * w dwóch sklepach). Rozstrzyga `znajdzKulture`, które przy kilku trafieniach
 * bierze pozycję z ceną za litr — czyli tę, którą da się z czymkolwiek porównać.
 */

/** Znaki spoza [a-z0-9] schodzą do myślnika; ogonki tracą kreski. */
export function adresKultury(nazwa: string): string {
  return nazwa
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // znaki lacznikowe po NFD, zapisane kodem
    .replace(/ł/gi, "l")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface MaNazwe {
  name: string;
  price_numeric?: number | null;
  packLiters?: number | null;
}

/**
 * Odnajduje kulturę po adresie. Przy kilku pozycjach o tym samym adresie
 * wybiera tę z kompletem danych cenowych — reszta i tak pokaże się niżej,
 * na liście „ta sama kultura w innych sklepach".
 */
export function znajdzKulture<T extends MaNazwe>(kultury: T[], adres: string): T | null {
  const pasujace = kultury.filter((k) => adresKultury(k.name) === adres);
  if (pasujace.length === 0) return null;
  if (pasujace.length === 1) return pasujace[0];
  return (
    pasujace.find((k) => k.price_numeric != null && k.packLiters != null) ?? pasujace[0]
  );
}

/** Złotówki za litr mleka — jedyna liczba, którą wolno porównywać między opakowaniami. */
export function zaLitr(cena?: number | null, litry?: number | null): number | null {
  if (cena == null || litry == null || litry <= 0) return null;
  return cena / litry;
}
