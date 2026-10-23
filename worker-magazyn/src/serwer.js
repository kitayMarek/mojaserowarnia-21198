/**
 * Serwer MCP serwisu: baza kultur (cztery narzedzia), kalkulator pasz dla
 * drobiu (cztery narzedzia, od 0.2.0) i przepisy na sery (dwa narzedzia,
 * od 0.3.0). Wszystkie tylko do odczytu.
 *
 * Opisy narzedzi sa po polsku, bo czytaja je modele odpowiadajace polskim
 * serowarom. Nazwy narzedzi i pol sa ASCII (D12 z pliku golebia), etykiety
 * z ogonkami siedza w wartosciach.
 */

import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { szukajKultur, kartaKultury, zamiennikiKultury, oBazie, TYPY, SKLEPY } from './kultury.js';
import { skladnikiPaszy, normyDrobiu, policzMieszanke, dobierzProporcjeMieszanki, GATUNKI, KATEGORIE_SUROWCOW } from './pasze.js';
import { szukajPrzepisow, przepis, TRUDNOSCI } from './przepisy.js';

export const WERSJA = '0.3.0';
export const TYTUL = 'Moja Serowarnia: kultury, przepisy na sery i kalkulator pasz';

const INSTRUKCJE = `Trzy działy z serwisu mojaserowarnia.pl: kalkulator pasz dla drobiu (mieszanki dla kur niosek, brojlerów, kaczek, gęsi i indyków z własnych składników, z normami białka, energii i wapnia), przepisy na sery oraz baza kultur bakteryjnych do sera. Zasady dla każdego działu są niżej.

Baza kultur bakteryjnych do sera: kultury dostępne w polskich sklepach dla serowarów domowych, ze składem, zastosowaniem, temperaturą pracy, ceną i ceną za litr mleka.
Odpowiadając na podstawie tych danych, przy każdej kulturze, którą polecasz, podaj link do jej karty z pola url, a na końcu źródło z pola cytuj_jako (licencja CC BY 4.0). Linki podawaj dokładnie tak, jak są w danych.
Ceny pochodzą ze stron sklepów z dnia w polu cena_z_dnia albo ceny_sprawdzone_od. Nie nazywaj ich aktualnymi i przypomnij, że przed zakupem trzeba sprawdzić cenę w sklepie.
Ten sam skład gatunkowy nie znaczy ten sam produkt: zamienniki podawaj z zastrzeżeniem z pola zastrzezenie.

Przepisy na sery (mozzarella, gouda, camembert, twaróg i inne): gdy ktoś pyta, jak zrobić ser, sprawdź szukaj_przepisow, a potem pobierz przepis. Podaj link do przepisu z pola url i źródło z pola cytuj_jako. Polecając kulturę, bierz ją z kultury_z_przepisu (sklep, cena, link do karty z pola w_bazie) albo z inne_kultury_z_bazy_do_tego_sera, z datą ceny. Wpisy dziennik_warzen to prawdziwe pomiary autora przy polskim mleku: przytaczaj je dosłownie, niczego do nich nie dopisuj.

Kalkulator pasz dla drobiu (kury nioski, brojlery, kaczki, gęsi, indyki): gdy ktoś prosi o paszę z podanych składników, znajdź dokładne nazwy przez skladniki_paszy, ustal gatunek i okres (normy_drobiu), potem użyj dobierz_proporcje albo policz_mieszanke. Podaj proporcje, co jest poza normą i czego brakuje (pola poza_norma i sugestie), a na końcu źródło z pola zrodlo. Przekaż też zastrzeżenie: to obliczenie na danych wzorcowych, nie porada lekarza weterynarii. Aminokwasy są policzone, ale nie mają norm, więc nie oceniaj ich jako wystarczających.`;

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
      name: 'mojaserowarnia',
      title: TYTUL,
      version: WERSJA,
      websiteUrl: 'https://mojaserowarnia.pl/asystenci-ai',
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

  // ── Kalkulator pasz dla drobiu (worker-magazyn/src/pasze.js) ─────────────

  const SKLADNIKI_WEJSCIE = z.array(z.object({
    nazwa: z.string().min(1).max(80).describe('Nazwa surowca, najlepiej dokładnie jak w skladniki_paszy, np. "Pszenica", "Śruta sojowa", "Kreda pastewna"'),
    cena: z.number().positive().max(1000).optional().describe('Cena w zł za kg, potrzebna do kosztu i do celu "najtaniej"'),
  }));

  serwer.registerTool(
    'skladniki_paszy',
    {
      title: 'Surowce paszowe',
      description:
        'Wyszukuje surowce paszowe z bazy 124 pozycji (zboża, śruty, strączkowe, dodatki mineralne, premiksy, gotowe mieszanki) z energią, białkiem, Ca, P, włóknem, tłuszczem i aminokwasami. Bez zapytania zwraca listę kategorii. Przy jednym trafieniu albo z pelny=true podaje pełny skład.',
      inputSchema: z.object({
        zapytanie: z.string().max(80).optional().describe('Nazwa albo jej początek, np. "pszenica", "śruta", "fosforan"'),
        kategoria: z.enum(KATEGORIE_SUROWCOW).optional().describe('Tylko surowce z tej kategorii'),
        pelny: z.boolean().optional().describe('true = pełny skład każdego surowca (minerały, aminokwasy, witaminy)'),
        limit: z.number().int().min(1).max(40).optional().describe('Ile surowców zwrócić, domyślnie 15'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(skladnikiPaszy(args)),
  );

  serwer.registerTool(
    'normy_drobiu',
    {
      title: 'Normy żywieniowe drobiu',
      description:
        'Normy żywieniowe dla 6 grup drobiu i ich okresów: energia, białko, Ca, P, włókno, sód, a dla stad zarodowych także K, Mg i mikroelementy. Bez parametrów zwraca listę gatunków i okresów.',
      inputSchema: z.object({
        drob: z.enum(GATUNKI).optional().describe('Gatunek, np. kury-nioski-lekkie, brojlery'),
        okres: z.string().max(60).optional().describe('Okres albo jego fragment, np. "powyżej 45", "starter", "1-6 tygodni"'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(normyDrobiu(args)),
  );

  serwer.registerTool(
    'policz_mieszanke',
    {
      title: 'Policz mieszankę',
      description:
        'Liczy skład mieszanki z podanych surowców i udziałów (w %) i porównuje z normą dla gatunku i okresu: co jest w normie, co za nisko, co za wysoko, koszt za kg (gdy są ceny) i sugestie, czego dodać. Udziały sumujące się do innej liczby niż 100 przelicza proporcjonalnie.',
      inputSchema: z.object({
        drob: z.enum(GATUNKI).describe('Gatunek drobiu'),
        okres: z.string().min(1).max(60).describe('Okres, np. "Niesienie (powyżej 45%)" albo "starter"'),
        skladniki: z.array(z.object({
          nazwa: z.string().min(1).max(80),
          procent: z.number().min(0).max(100).describe('Udział w mieszance w %'),
          cena: z.number().positive().max(1000).optional().describe('Cena w zł za kg'),
        })).min(1).max(25),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(policzMieszanke(args)),
  );

  serwer.registerTool(
    'dobierz_proporcje',
    {
      title: 'Dobierz proporcje mieszanki',
      description:
        'Z podanych surowców dobiera proporcje pod normę dla gatunku i okresu, tym samym algorytmem co kalkulator pasz na mojaserowarnia.pl (cel "normy"), albo szuka najtańszej mieszanki bliskiej normie (cel "najtaniej", wymaga cen). Dobiera pod energię, białko, wapń i fosfor; resztę parametrów liczy i ocenia. Zwraca proporcje, wynik wobec normy, czego brakuje i sugestie.',
      inputSchema: z.object({
        drob: z.enum(GATUNKI).describe('Gatunek drobiu'),
        okres: z.string().min(1).max(60).describe('Okres, np. "Niesienie (powyżej 45%)" albo "starter"'),
        skladniki: SKLADNIKI_WEJSCIE.min(2).max(15).describe('Surowce do użycia, bez udziałów'),
        cel: z.enum(['normy', 'najtaniej']).optional().describe('normy (domyślnie) albo najtaniej'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(dobierzProporcjeMieszanki(args)),
  );

  return serwer;
}
