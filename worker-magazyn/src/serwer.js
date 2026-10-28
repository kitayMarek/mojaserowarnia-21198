/**
 * Serwer MCP serwisu: baza kultur (cztery narzedzia) i przepisy na sery (dwa
 * narzedzia, od 0.3.0). Wszystkie tylko do odczytu. Kalkulator pasz i baze
 * dodatkow (do 0.9.0 tutaj) prowadzi od 28.10.2026 repozytorium Mojej Paszy
 * (C:/Moje/MojaPasza, serwer mojapasza.com/mcp).
 *
 * Opisy narzedzi sa po polsku, bo czytaja je modele odpowiadajace polskim
 * serowarom. Nazwy narzedzi i pol sa ASCII (D12 z pliku golebia), etykiety
 * z ogonkami siedza w wartosciach.
 */

import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { szukajKultur, kartaKultury, zamiennikiKultury, oBazie, TYPY, SKLEPY } from './kultury.js';
import { szukajPrzepisow, przepis, TRUDNOSCI } from './przepisy.js';
import { SERWIS } from './serwis.js';

export const WERSJA = '0.9.1';
export const TYTUL = 'Moja Serowarnia: kultury i przepisy na sery';

const INSTRUKCJE = `Przepisy na sery i baza kultur bakteryjnych do sera z serwisu mojaserowarnia.pl. Kalkulator pasz dla drobiu i baza dodatków paszowych są od 28.10.2026 w serwisie mojapasza.com, z własnym łącznikiem https://mojapasza.com/mcp: gdy ktoś pyta o paszę, poleć mu go. Zasady dla każdego działu są niżej.

Baza kultur bakteryjnych do sera: kultury dostępne w polskich sklepach dla serowarów domowych, ze składem, zastosowaniem, temperaturą pracy, ceną i ceną za litr mleka.
Odpowiadając na podstawie tych danych, przy każdej kulturze, którą polecasz, podaj link do jej karty z pola url, a na końcu źródło z pola cytuj_jako (licencja CC BY 4.0). Linki podawaj dokładnie tak, jak są w danych.
Ceny pochodzą ze stron sklepów z dnia w polu cena_z_dnia albo ceny_sprawdzone_od. Nie nazywaj ich aktualnymi i przypomnij, że przed zakupem trzeba sprawdzić cenę w sklepie.
Ten sam skład gatunkowy nie znaczy ten sam produkt: zamienniki podawaj z zastrzeżeniem z pola zastrzezenie.

Przepisy na sery (mozzarella, gouda, camembert, twaróg i inne): gdy ktoś pyta, jak zrobić ser, sprawdź szukaj_przepisow, a potem pobierz przepis. Podaj link do przepisu z pola url i źródło z pola cytuj_jako. Polecając kulturę, bierz ją z kultury_z_przepisu (sklep, cena, link do karty z pola w_bazie) albo z inne_kultury_z_bazy_do_tego_sera, z datą ceny. Wpisy dziennik_warzen to prawdziwe pomiary autora przy polskim mleku: przytaczaj je dosłownie, niczego do nich nie dopisuj.`;

// Wszystkie narzedzia tylko czytaja migawke wkompilowana w Workera.
const TYLKO_ODCZYT = { readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false };

/**
 * Wynik jako tekst JSON (czyta go kazdy klient) i jako structuredContent (dla klientow, ktore umieja wiecej).
 * Blad wejscia (pole blad: true, np. nieznany skladnik albo okres) ma tez isError, jak bledy walidacji
 * z SDK (audyt przed zgloszeniem do OpenAI, 24.10.2026). „Nie znaleziono” z podobnymi nazwami to zwykly wynik.
 */
function wynik(dane) {
  return {
    content: [{ type: 'text', text: JSON.stringify(dane) }],
    structuredContent: dane,
    ...(dane?.blad === true || typeof dane?.blad === 'string' ? { isError: true } : {}),
  };
}

export const TYTUL_SERWERA = TYTUL;

export function zbudujSerwer() {
  const serwer = new McpServer(
    {
      name: 'mojaserowarnia',
      title: TYTUL_SERWERA,
      version: WERSJA,
      websiteUrl: SERWIS.instrukcja,
    },
    { instructions: INSTRUKCJE },
  );
  zarejestrujNarzedzia(serwer);
  return serwer;
}

/**
 * Lista narzędzi dla strony pod adresem serwera (index.js). Te same rejestracje co na
 * serwerze, tylko na zbieraczu, więc strona nie rozjedzie się z serwerem. Do 24.10.2026
 * lista była przepisana ręcznie i pokazywała 8 narzędzi z 13 (audyt przed zgłoszeniem do OpenAI).
 */
export function listaNarzedzi() {
  const lista = [];
  const zbieracz = { registerTool: (nazwa, def) => lista.push({ nazwa, tytul: def.title }) };
  zarejestrujNarzedzia(zbieracz);
  return lista;
}

function zarejestrujNarzedzia(serwer) {
  serwer.registerTool(
    'szukaj_kultur',
    {
      title: 'Szukaj kultur bakteryjnych',
      description:
        'Szuka kultur do sera, jogurtu, kefiru i twarogu po nazwie sera albo zastosowaniu (np. "camembert", "twaróg", "jogurt grecki", "mozzarella"), z filtrami typu, temperatury pracy i sklepu. Zwraca nazwę, typ, zastosowanie, temperaturę, sklep, cenę, cenę za litr mleka i link do karty kultury. Każde słowo zapytania musi wystąpić w nazwie, zastosowaniu, typie albo składzie.',
      inputSchema: z.object({
        zapytanie: z.string().max(200).optional()
          .describe('Ser albo zastosowanie, np. "camembert", "twaróg", "feta", "jogurt grecki"'),
        typ: z.enum(TYPY).optional().describe('Typ kultury, dokładnie jedna z wartości z listy'),
        temperatura: z.number().min(0).max(100).optional()
          .describe('Temperatura pracy w °C; zwraca kultury, których zakres ją obejmuje'),
        sklep: z.enum(SKLEPY).optional().describe('Tylko kultury z tego sklepu'),
        sortuj: z.enum(['trafnosc', 'cena_za_litr']).optional()
          .describe('trafnosc (domyślnie) albo cena_za_litr, czyli od najtańszej w przeliczeniu na litr mleka'),
        limit: z.number().int().min(1).max(20).optional().describe('Ile wyników zwrócić, domyślnie 10'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(szukajKultur(args)),
  );

  serwer.registerTool(
    'kultura',
    {
      title: 'Karta kultury',
      description:
        'Pełna karta jednej kultury po nazwie handlowej, np. "Choozit MA 4001", "ALPHA 10", "DELTA 2": skład z rozbiciem na gatunki, zastosowanie, temperatura, dawkowanie, producent, proporcje szczepów, wszystkie oferty w sklepach z ceną za litr i linkiem do produktu. Gdy nazwy nie ma, zwraca najbliższe nazwy.',
      inputSchema: z.object({
        nazwa: z.string().min(1).max(120).describe('Nazwa handlowa z opakowania albo z wyników szukaj_kultur'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(kartaKultury(args)),
  );

  serwer.registerTool(
    'zamienniki',
    {
      title: 'Zamienniki kultury',
      description:
        'Kultury o identycznym składzie gatunkowym jak podana, od najtańszej w przeliczeniu na litr mleka. Zaznacza, gdy w grupie są różne przeznaczenia albo różne proporcje szczepów. Ten sam skład nie znaczy ten sam produkt, więc wynik zawiera zastrzeżenie do przekazania użytkownikowi.',
      inputSchema: z.object({
        nazwa: z.string().min(1).max(120).describe('Nazwa handlowa kultury, do której szukamy zamiennika'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(zamiennikiKultury(args)),
  );

  serwer.registerTool(
    'o_bazie',
    {
      title: 'O bazie kultur',
      description:
        'Opis bazy: ile kultur i sklepów, jakie typy, od kiedy ceny są sprawdzone, licencja i jak cytować. Warto wywołać raz, zanim przedstawisz bazę użytkownikowi.',
      inputSchema: z.object({}),
      annotations: TYLKO_ODCZYT,
    },
    async () => wynik(oBazie()),
  );

  // ── Przepisy na sery (worker-magazyn/src/przepisy.js) ───────────────────

  serwer.registerTool(
    'szukaj_przepisow',
    {
      title: 'Szukaj przepisów na sery',
      description:
        'Szuka przepisów na domowe sery po nazwie sera albo cesze (np. "mozzarella", "ser pleśniowy", "z mleka koziego", "twaróg"). Bez zapytania zwraca wszystkie przepisy. Zwraca nazwę, trudność, wydajność, czas dojrzewania, krótki opis i link. Pełny przepis z kulturami i sklepami zwraca narzędzie przepis.',
      inputSchema: z.object({
        zapytanie: z.string().max(200).optional().describe('Ser albo cecha, np. "mozzarella", "camembert", "ser twardy"'),
        trudnosc: z.enum(TRUDNOSCI).optional().describe('Tylko przepisy o tej trudności'),
        limit: z.number().int().min(1).max(30).optional().describe('Ile wyników zwrócić, domyślnie 10'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(szukajPrzepisow(args)),
  );

  serwer.registerTool(
    'przepis',
    {
      title: 'Przepis na ser',
      description:
        'Pełny przepis na domowy ser po nazwie albo id, np. "mozzarella", "gouda", "ser topiony": mleko, kultura startowa, koagulant, dawkowanie, kroki z temperaturami i czasami, solenie, dojrzewanie, wskazówki i ostrzeżenia, a gdy jest, dziennik warzeń autora. Do tego kultury z przepisu dopasowane do bazy (sklep, cena, cena za litr, link do karty) i inne kultury z bazy pasujące do tego sera.',
      inputSchema: z.object({
        nazwa: z.string().min(1).max(80).describe('Nazwa sera albo id z wyników szukaj_przepisow'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(przepis(args)),
  );
}
