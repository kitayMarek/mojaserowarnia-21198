/**
 * Serwer MCP serwisu: baza kultur (cztery narzedzia), kalkulator pasz dla
 * drobiu (cztery narzedzia, od 0.2.0), przepisy na sery (dwa narzedzia,
 * od 0.3.0) i baza dodatkow paszowych (trzy narzedzia, od 0.8.0). Wszystkie
 * tylko do odczytu.
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
import { szukajDodatkow, kartaDodatku, zamiennikiDodatku, CZEGO_BRAKUJE, GATUNKI as GATUNKI_DODATKOW, KATEGORIE_DODATKOW } from './dodatki.js';

export const WERSJA = '0.8.2';
export const TYTUL = 'Moja Serowarnia: kultury, przepisy na sery i kalkulator pasz';

const INSTRUKCJE = `Trzy działy z serwisu mojaserowarnia.pl: kalkulator pasz dla drobiu (mieszanki dla kur niosek, brojlerów, kaczek, gęsi i indyków z własnych składników, z normami białka, energii i wapnia), przepisy na sery oraz baza kultur bakteryjnych do sera. Zasady dla każdego działu są niżej.

Baza kultur bakteryjnych do sera: kultury dostępne w polskich sklepach dla serowarów domowych, ze składem, zastosowaniem, temperaturą pracy, ceną i ceną za litr mleka.
Odpowiadając na podstawie tych danych, przy każdej kulturze, którą polecasz, podaj link do jej karty z pola url, a na końcu źródło z pola cytuj_jako (licencja CC BY 4.0). Linki podawaj dokładnie tak, jak są w danych.
Ceny pochodzą ze stron sklepów z dnia w polu cena_z_dnia albo ceny_sprawdzone_od. Nie nazywaj ich aktualnymi i przypomnij, że przed zakupem trzeba sprawdzić cenę w sklepie.
Ten sam skład gatunkowy nie znaczy ten sam produkt: zamienniki podawaj z zastrzeżeniem z pola zastrzezenie.

Przepisy na sery (mozzarella, gouda, camembert, twaróg i inne): gdy ktoś pyta, jak zrobić ser, sprawdź szukaj_przepisow, a potem pobierz przepis. Podaj link do przepisu z pola url i źródło z pola cytuj_jako. Polecając kulturę, bierz ją z kultury_z_przepisu (sklep, cena, link do karty z pola w_bazie) albo z inne_kultury_z_bazy_do_tego_sera, z datą ceny. Wpisy dziennik_warzen to prawdziwe pomiary autora przy polskim mleku: przytaczaj je dosłownie, niczego do nich nie dopisuj.

Kalkulator pasz dla drobiu (kury nioski, brojlery, kaczki, gęsi, indyki): gdy ktoś prosi o paszę z podanych składników, znajdź dokładne nazwy przez skladniki_paszy, ustal gatunek i okres (normy_drobiu), potem użyj dobierz_proporcje albo policz_mieszanke. Podaj proporcje, co jest poza normą i czego brakuje (pola poza_norma i sugestie), a na końcu źródło z pola zrodlo. Gdy ktoś pyta, ile paszy potrzebuje na stado (np. 10 kur na miesiąc), dodaj parametr stado z liczbą sztuk; dawkę na sztukę podaj, jeśli ją znasz, a dla niosek w nieśności serwer weźmie typową z poradnika rasy. Gdy ktoś chce więcej albo mniej danego surowca (np. „głównie pszenica”), ustaw przy nim min_procent albo max_procent; zalecane maksima dla gatunku i wieku (normy_drobiu, pole zalecane_udzialy) są już wliczone. Gdy ktoś pyta, ile danego surowca może dać (np. ile grochu dla kurcząt), odpowiedz zaleceniem z powodem i linkiem z pola strona. Gdy wynik ma ponad_zalecany_udzial, powiedz wyraźnie o ryzyku dla zdrowia ptaków. Gdy czegoś brakuje, pole uzupelnienia mówi, czym i ile dodać (dodaj_proc to procent mieszanki); podaj to i zaproponuj ponowne dobierz_proporcje z tym składnikiem. Gdy mieszanka ma jeden składnik (np. sama pszenica), sugestie mówią, czego w nim brakuje, i dają opcję dla kogoś, kto ma tylko ten składnik: osobne karmidło z mieszanką mineralno-witaminową; przekaż obie drogi i zaznacz, że karmidło nie uzupełni białka. Przekaż też zastrzeżenie: to obliczenie na danych wzorcowych, nie porada lekarza weterynarii. Aminokwasy są policzone, ale nie mają norm, więc nie oceniaj ich jako wystarczających.

Baza dodatków paszowych (koncentraty, premiksy, kreda, grys, fosforan, sól, drożdże, aminokwasy z polskich sklepów): gdy ktoś pyta, czym uzupełnić brak (np. fosforu), ile to kosztuje albo gdzie kupić, użyj szukaj_dodatkow, a szczegóły produktu weź z dodatek. Propozycje w polu uzupelnienia wyników kalkulatora też mogą być produktami: wtedy mają producenta, najtańszą ofertę i koszt na ptaka przez 30 dni. Przy cenie zawsze podaj sklep, datę z pola cena_z_dnia i link z pola url dokładnie tak, jak jest w danych; nie nazywaj ceny aktualną. Kolejność wyników jest wyłącznie po składzie i cenie: nie przestawiaj jej i nie polecaj produktu dlatego, że ma pole partner_serwisu (to jawne oznaczenie, że producent płaci za obecność w bazie). Dla koncentratu z przepisem na etykiecie wywołaj dodatek z parametrem zboza (i drob z okresem), a policzę „koncentrat + Twoje zboże”. Zamienniki podawaj z zastrzeżeniem z pola zastrzezenie.`;

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
  zarejestrujNarzedzia({ registerTool: (nazwa, def) => lista.push({ nazwa, tytul: def.title }) });
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

  // ── Kalkulator pasz dla drobiu (worker-magazyn/src/pasze.js) ─────────────

  const SKLADNIKI_WEJSCIE = z.array(z.object({
    nazwa: z.string().min(1).max(80).describe('Nazwa surowca, najlepiej dokładnie jak w skladniki_paszy, np. "Pszenica", "Śruta sojowa", "Kreda pastewna"'),
    cena: z.number().positive().max(1000).optional().describe('Cena w zł za kg, potrzebna do kosztu i do celu "najtaniej"'),
    min_procent: z.number().min(0).max(100).optional().describe('Najmniejszy udział tego surowca w %, np. 40, gdy ma być głównym składnikiem. Premiks lub dodatek w stałej dawce: min_procent i max_procent równe dawce z etykiety'),
    max_procent: z.number().min(0.1).max(100).optional().describe('Największy udział w %; zastępuje zalecane maksimum, a ponad nie wynik dostaje ostrzeżenie o zdrowiu ptaków'),
  }));

  // Zapotrzebowanie stada (od 0.4.0): wynik dostaje pole zapotrzebowanie z kg na dzień, tydzień i 30 dni.
  const STADO = z.object({
    sztuk: z.number().int().min(1).max(100000).describe('Liczba ptaków'),
    dawka_g: z.number().min(5).max(400).optional().describe('Pasza na sztukę dziennie w g; bez niej typowa z poradnika rasy, jeśli jest dla tego okresu'),
  }).optional().describe('Podaj, gdy pytanie dotyczy ilości paszy dla stada');

  serwer.registerTool(
    'skladniki_paszy',
    {
      title: 'Surowce paszowe',
      description:
        'Wyszukuje surowce paszowe: 124 surowce wzorcowe (zboża, śruty, strączkowe, dodatki mineralne, premiksy, gotowe mieszanki) i produkty z bazy dodatków z producentem i ceną, z energią, białkiem, Ca, P, włóknem, tłuszczem, aminokwasami oraz oznaczeniem GMO i chowu ekologicznego. Bez zapytania zwraca listę kategorii. Przy jednym trafieniu albo z pelny=true podaje pełny skład.',
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
        'Normy żywieniowe dla 6 grup drobiu i ich okresów: energia, białko, Ca, P, włókno, sód, a dla stad zarodowych także K, Mg i mikroelementy. Z okresem podaje też zalecane maksymalne udziały surowców dla tego wieku i gatunku (z powodem i stroną ze źródłami) i, dla niosek w nieśności, typową dzienną dawkę paszy na sztukę ze źródłem. Bez parametrów zwraca listę gatunków i okresów.',
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
        'Liczy skład mieszanki z podanych surowców i udziałów (w %) i porównuje z normą dla gatunku i okresu: co jest w normie, co za nisko, co za wysoko, koszt za kg (gdy są ceny) i sugestie, czego dodać. Udziały sumujące się do innej liczby niż 100 przelicza proporcjonalnie. Z parametrem stado liczy też, ile paszy i każdego surowca zje stado dziennie, tygodniowo i przez 30 dni.',
      inputSchema: z.object({
        drob: z.enum(GATUNKI).describe('Gatunek drobiu'),
        okres: z.string().min(1).max(60).describe('Okres, np. "Niesienie (powyżej 45%)" albo "starter"'),
        skladniki: z.array(z.object({
          nazwa: z.string().min(1).max(80),
          procent: z.number().min(0).max(100).describe('Udział w mieszance w %'),
          cena: z.number().positive().max(1000).optional().describe('Cena w zł za kg'),
        })).min(1).max(25),
        stado: STADO,
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
        'Z podanych surowców dobiera proporcje pod normę dla gatunku i okresu, tym samym algorytmem co kalkulator pasz na mojaserowarnia.pl (cel "normy"), albo szuka najtańszej mieszanki bliskiej normie (cel "najtaniej", wymaga cen). Dobiera pod energię, białko, wapń i fosfor; resztę parametrów liczy i ocenia. Każdy surowiec trzyma się zalecanego maksimum dla gatunku i wieku (np. groch: pisklęta 5%, nioski 15%), a min_procent i max_procent przy składniku pozwalają ustawić własne granice. Zwraca proporcje, wynik wobec normy, czego brakuje, sugestie i surowce, które doszły do limitu; z parametrem stado także kg paszy i surowców na dzień, tydzień i 30 dni.',
      inputSchema: z.object({
        drob: z.enum(GATUNKI).describe('Gatunek drobiu'),
        okres: z.string().min(1).max(60).describe('Okres, np. "Niesienie (powyżej 45%)" albo "starter"'),
        skladniki: SKLADNIKI_WEJSCIE.min(1).max(15).describe('Surowce do użycia, bez udziałów. Jeden składnik: policzę go jako 100% i podpowiem, czym go uzupełnić'),
        cel: z.enum(['normy', 'najtaniej']).optional().describe('normy (domyślnie) albo najtaniej'),
        stado: STADO,
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(dobierzProporcjeMieszanki(args)),
  );

  // ── Baza dodatków paszowych (worker-magazyn/src/dodatki.js, od 0.8.0) ───────

  serwer.registerTool(
    'szukaj_dodatkow',
    {
      title: 'Szukaj dodatków paszowych',
      description:
        'Szuka produktów z bazy dodatków paszowych dla drobiu dostępnych w Polsce (koncentraty, premiksy, kreda, grys, muszle, fosforan, sól, drożdże, aminokwasy) po tym, czego brakuje w paszy (np. "fosfor", "wapn"), gatunku, kategorii albo nazwie. Zwraca producenta, dawkowanie z etykiety, zawartość szukanego składnika i ile wnosi go do paszy w dawce z etykiety, najtańszą ofertę ze sklepem, ceną za kg, datą ceny i linkiem, cenę 100 g samego składnika oraz koszt na kurę przez 30 dni w dawce z etykiety. Sortowanie po zawartości, koszcie na kurę, cenie składnika albo cenie za kg; nigdy po partnerstwie.',
      inputSchema: z.object({
        brakuje: z.enum(CZEGO_BRAKUJE).optional().describe('Czego brakuje w paszy, np. fosfor, wapn, sod, bialko, metionina'),
        zapytanie: z.string().max(80).optional().describe('Nazwa produktu, producenta albo jej fragment, np. "kreda", "Rolpol", "premiks"'),
        gatunek: z.enum(GATUNKI_DODATKOW).optional().describe('Dla kogo według etykiety; produkty bez zawężenia na etykiecie też pasują'),
        kategoria: z.enum(KATEGORIE_DODATKOW).optional().describe('Tylko produkty z tej kategorii'),
        bez_gmo: z.boolean().optional().describe('true = tylko produkty oznaczone jako bez GMO'),
        sortuj: z.enum(['zawartosc', 'koszt_na_kure', 'cena_skladnika', 'cena_za_kg', 'nazwa']).optional()
          .describe('zawartosc (domyślnie przy brakuje), koszt_na_kure (w dawce z etykiety, 30 dni), cena_skladnika (zł za 100 g szukanego składnika, z brakuje), cena_za_kg albo nazwa'),
        dawka_g: z.number().min(5).max(400).optional().describe('Pasza na ptaka dziennie w g, do kosztu na kurę; bez niej dla niosek typowa z poradnika rasy'),
        limit: z.number().int().min(1).max(20).optional().describe('Ile wyników zwrócić, domyślnie 10'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(szukajDodatkow(args)),
  );

  serwer.registerTool(
    'dodatek',
    {
      title: 'Karta dodatku paszowego',
      description:
        'Pełna karta produktu z bazy dodatków paszowych po nazwie, np. "Koncentrat 30% Nioska (Rolpol)", "Dolmix DN", "kreda Viva Max": producent, dla kogo, dawkowanie i przepis z etykiety, skład na kg (białko, Ca, P, Na, aminokwasy, witaminy, mikroelementy), GMO i chów ekologiczny, wszystkie oferty sklepów od najtańszej za kg z datą ceny i linkiem, koszt na kurę przez 30 dni i źródło składu. Dla koncentratu z parametrem zboza liczy „koncentrat + Twoje zboże”: proporcje z etykiety z tymi zbożami i udział koncentratu do normy białka.',
      inputSchema: z.object({
        nazwa: z.string().min(1).max(120).describe('Nazwa produktu z szukaj_dodatkow albo jej fragment'),
        zboza: z.array(z.object({
          nazwa: z.string().min(1).max(80).describe('Zboże, np. "Pszenica", "Kukurydza", "Jęczmień"'),
          procent: z.number().min(0).max(100).optional().describe('Udział tego zboża względem pozostałych zbóż; bez niego po równo'),
        })).max(6).optional().describe('Zboża, które hodowca ma, do „koncentrat + Twoje zboże”'),
        drob: z.enum(GATUNKI).optional().describe('Gatunek do porównania z normą, np. kury-nioski-lekkie'),
        okres: z.string().max(60).optional().describe('Okres do porównania z normą, np. "powyżej 45"'),
        dawka_g: z.number().min(5).max(400).optional().describe('Pasza na ptaka dziennie w g, do kosztu na kurę'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(kartaDodatku(args)),
  );

  serwer.registerTool(
    'zamienniki_dodatku',
    {
      title: 'Zamienniki dodatku paszowego',
      description:
        'Inne produkty tego samego rodzaju co podany (np. kreda z różnych worków, premiksy dla niosek), od najtańszego na kurę w dawce z etykiety, z kluczowym składem obok siebie i składem typowym surowca bez marki. Ten sam rodzaj nie znaczy ten sam skład, więc wynik zawiera zastrzeżenie do przekazania.',
      inputSchema: z.object({
        nazwa: z.string().min(1).max(120).describe('Nazwa produktu z bazy dodatków'),
        dawka_g: z.number().min(5).max(400).optional().describe('Pasza na ptaka dziennie w g, do kosztu na kurę'),
      }),
      annotations: TYLKO_ODCZYT,
    },
    async (args) => wynik(zamiennikiDodatku(args)),
  );
}
