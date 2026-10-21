/**
 * Serwer MCP bazy kultur: cztery narzedzia tylko do odczytu.
 *
 * Opisy narzedzi sa po polsku, bo czytaja je modele odpowiadajace polskim
 * serowarom. Nazwy narzedzi i pol sa ASCII (D12 z pliku golebia), etykiety
 * z ogonkami siedza w wartosciach.
 */

import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { szukajKultur, kartaKultury, zamiennikiKultury, oBazie, TYPY, SKLEPY } from './kultury.js';

const WERSJA = '0.1.0';

const INSTRUKCJE = `Baza kultur bakteryjnych do sera z serwisu mojaserowarnia.pl: kultury dostępne w polskich sklepach dla serowarów domowych, ze składem, zastosowaniem, temperaturą pracy, ceną i ceną za litr mleka.
Odpowiadając na podstawie tych danych, podaj link z pola url i źródło z pola cytuj_jako (licencja CC BY 4.0).
Ceny pochodzą ze stron sklepów z dnia w polu cena_z_dnia albo ceny_sprawdzone_od. Nie nazywaj ich aktualnymi i przypomnij, że przed zakupem trzeba sprawdzić cenę w sklepie.
Ten sam skład gatunkowy nie znaczy ten sam produkt: zamienniki podawaj z zastrzeżeniem z pola zastrzezenie.`;

// Wszystkie narzedzia tylko czytaja migawke wkompilowana w Workera.
const TYLKO_ODCZYT = { readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false };

/** Wynik jako tekst JSON (czyta go kazdy klient) i jako structuredContent (dla klientow, ktore umieja wiecej). */
function wynik(dane) {
  return {
    content: [{ type: 'text', text: JSON.stringify(dane) }],
    structuredContent: dane,
  };
}

export function zbudujSerwer() {
  const serwer = new McpServer(
    {
      name: 'mojaserowarnia-baza-kultur',
      title: 'Moja Serowarnia: baza kultur bakteryjnych',
      version: WERSJA,
      websiteUrl: 'https://mojaserowarnia.pl/baza-kultur',
    },
    { instructions: INSTRUKCJE },
  );

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

  return serwer;
}
