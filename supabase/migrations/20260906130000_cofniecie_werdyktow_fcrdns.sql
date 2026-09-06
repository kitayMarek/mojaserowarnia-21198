-- Wycofanie werdyktów FCrDNS wydanych na podstawie błędnej konfiguracji.
--
-- ---------------------------------------------------------------------------
-- CO SIĘ STAŁO
-- ---------------------------------------------------------------------------
-- Weryfikacja przez odwrotny DNS sprawdzała, czy nazwa hosta kończy się
-- sufiksem operatora. Dla Amazonbota wpisany był `.crawl.amazon.com` —
-- domena, która NIE ISTNIEJE (NXDOMAIN). Amazon dokumentuje
-- `crawl.amazonbot.amazon`, co potwierdza pełny obieg:
--
--     23.22.35.162                        -> PTR -> 23-22-35-162.crawl.amazonbot.amazon
--     23-22-35-162.crawl.amazonbot.amazon -> A   -> 23.22.35.162
--
-- Skutek: KAŻDE żądanie prawdziwego Amazonbota odpadało na kroku 2 i było
-- zapisywane jako `zweryfikowany = false`, czyli „ktoś obcy użył tej nazwy".
-- Publiczna strona pokazywała Amazonbota jako najczęściej podszywanego bota
-- w całym zbiorze. To był zarzut wobec cudzej firmy postawiony na podstawie
-- naszej literówki w konfiguracji.
--
-- Sygnał ostrzegawczy był w danych od początku i został odnotowany dzień
-- wcześniej: metoda `fcrdns` miała bilans 0 potwierdzeń na 25 sprawdzeń.
-- Metoda, która nigdy nie powiedziała „tak", jest niesprawdzona — i tak była
-- opisana na stronie. Zabrakło wniosku, że skoro jest niesprawdzona, to jej
-- „nie" też nie nadaje się do publikacji.
--
-- ---------------------------------------------------------------------------
-- DLACZEGO NIE PRZELICZAMY, TYLKO COFAMY DO „NIE WIADOMO"
-- ---------------------------------------------------------------------------
-- Nie da się tego przeliczyć. `bot_visits` CELOWO nie zapisuje adresów IP —
-- to decyzja z pierwszej migracji licznika, podjęta dla prywatności i
-- podtrzymywana od tamtej pory. Bez adresu nie ma jak ponowić zapytania DNS
-- dla wiersza sprzed poprawki.
--
-- Zostaje więc jedyna uczciwa operacja: te werdykty przestają być werdyktami.
-- `zweryfikowany = NULL` znaczy „nie umiemy rozstrzygnąć", a `blad_sprawdzenia`
-- mówi wprost, że to nasze sprawdzenie zawiodło, a nie bot. Liczby na stronie
-- lekko się poprawią (mniej „fałszowanych" wśród rozstrzygniętych) i to jest
-- w porządku — poprzednie były zawyżone naszym błędem.
--
-- Nowe żądania Amazonbota od tej chwili weryfikują się poprawnym sufiksem.

UPDATE public.bot_visits
SET zweryfikowany      = NULL,
    metoda_weryfikacji = 'blad_sprawdzenia'
WHERE metoda_weryfikacji = 'fcrdns'
  AND zweryfikowany IS FALSE;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- Amazonbot nie moze juz wystepowac jako "falszowany"
--   select bot, count(*) filter (where zweryfikowany is false) as falszowane,
--          count(*) filter (where zweryfikowany is null)  as niesprawdzone
--   from public.bot_visits where not wlasne group by bot order by 2 desc;
--
--   -- metoda fcrdns ma miec zero zaprzeczen do czasu, az potwierdzi kogokolwiek
--   select * from public.pub_bot_metody;
--
--   -- AS1004 ma zostac w skanach bez zmian: jego tozsamosci rozstrzygnela
--   -- lista adresow, a nie odwrotny DNS
--   select asn, zadan, wrazliwe, punkty from public.bot_skany;
