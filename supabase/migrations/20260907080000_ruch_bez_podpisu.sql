-- Ruch, który nie przedstawia się żadną nazwą — logowany i pokazany osobno.
--
-- ---------------------------------------------------------------------------
-- SKĄD SIĘ WZIĄŁ TEN POMYSŁ
-- ---------------------------------------------------------------------------
-- To samo pytanie wróciło w niecałą dobę trzy razy:
--
--   • 276 żądań dziennie z PUSTYM User-Agentem (panel Cloudflare, 06.09)
--   • trzej „użytkownicy" w Google Analytics, których nasz licznik nie znał
--   • „a może sitemapę czytał ktoś, kogo nie rozpoznajemy?"
--
-- Przyczyną wszystkich trzech była jedna linijka w worker/wizyty-botow.js:
-- `if (!kto) return;` — czyli cokolwiek spoza listy znanych nazw nie zostawiało
-- żadnego śladu. Teraz zostawia.
--
-- ---------------------------------------------------------------------------
-- DLACZEGO POZA PROCENTAMI, A NIE W NICH
-- ---------------------------------------------------------------------------
-- Ten ruch NIE DEKLARUJE, że jest botem. Liczba nagłówkowa strony brzmi „ile
-- ruchu PODAJĄCEGO SIĘ za bota AI jest prawdziwe" — wrzucenie do mianownika
-- czegoś, co nigdy takiej deklaracji nie złożyło, zmieniłoby to, co ta liczba
-- mierzy, i to z dnia na dzień, bez ostrzeżenia dla czytelnika.
--
-- Dlatego `pub_bot_podsumowanie` odsiewa te wiersze z `zadan_ogolem` i z obu
-- procentów, a pokazuje je jako osobną pozycję `bez_podpisu`. Informacja jest
-- widoczna, a nie schowana — i dotychczasowe liczby zostają porównywalne
-- z tym, co strona podawała wczoraj.
--
-- Pozostałe widoki nie wymagają zmian i warto wiedzieć dlaczego:
--   pub_bot_cele, pub_bot_zachowanie  — filtrują `zweryfikowany IS NOT NULL`
--   pub_bot_pod_kogo                  — filtruje `zweryfikowany IS FALSE`
-- a ruch bez podpisu ma `zweryfikowany` puste, więc wypada z nich sam.
-- W `pub_bot_wg_bota` pojawi się jako osobny wiersz i to jest w porządku:
-- tam chodzi o pokazanie, kto przychodzi, a nie o wyliczanie udziałów.

-- ---------------------------------------------------------------------------
-- 1. PODSUMOWANIE — ruch bez podpisu jako osobna pozycja
-- ---------------------------------------------------------------------------

DROP VIEW IF EXISTS public.pub_bot_podsumowanie;

CREATE VIEW public.pub_bot_podsumowanie AS
WITH z_deklaracja AS (
  SELECT * FROM public.bot_visits WHERE bot <> '(bez podpisu)'
)
SELECT
  (SELECT min(odwiedzono)::DATE FROM public.bot_visits)              AS pomiar_od,
  now()                                                              AS stan_na,
  public.prog_porownywalnosci()                                      AS zmiana_metody,

  count(*) FILTER (WHERE NOT wlasne)                                 AS zadan_ogolem,
  count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS TRUE)       AS oryginalne,
  count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS FALSE)      AS falszowane,
  count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS NULL)       AS niesprawdzone,
  count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS NOT NULL)   AS rozstrzygniete,
  count(*) FILTER (WHERE wlasne)                                     AS testy_wlasciciela,

  round(100.0 * count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS TRUE)
        / NULLIF(count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS NOT NULL), 0), 1)
                                                                     AS proc_wsrod_rozstrzygnietych,
  round(100.0 * count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS TRUE)
        / NULLIF(count(*) FILTER (WHERE NOT wlasne), 0), 1)          AS proc_calosci,

  count(*) FILTER (WHERE NOT wlasne
                     AND odwiedzono > now() - INTERVAL '30 days')    AS ostatnie_30d,
  count(DISTINCT bot) FILTER (WHERE NOT wlasne)                      AS roznych_tozsamosci,
  count(DISTINCT asn) FILTER (WHERE NOT wlasne)                      AS roznych_sieci,
  count(*) FILTER (WHERE NOT wlasne AND metoda_weryfikacji IS NOT NULL)
                                                                     AS z_zapisana_metoda,
  greatest(1, (now()::DATE - (SELECT min(odwiedzono)::DATE FROM public.bot_visits)))
                                                                     AS dni_pomiaru,

  -- Ruch, który nie przedstawił się żadną nazwą. POZA powyższymi liczbami,
  -- bo nigdy nie złożył deklaracji, której moglibyśmy nie uwierzyć.
  (SELECT count(*) FROM public.bot_visits
    WHERE bot = '(bez podpisu)' AND NOT wlasne)                      AS bez_podpisu
FROM z_deklaracja;

COMMENT ON VIEW public.pub_bot_podsumowanie IS
  'Publiczne podsumowanie licznika. Wszystkie liczby i oba procenty dotyczą wyłącznie ruchu, który PRZEDSTAWIŁ SIĘ jakąś nazwą — bo tylko takiej deklaracji można nie uwierzyć. Ruch bez podpisu stoi osobno w kolumnie `bez_podpisu`; wrzucenie go do mianownika zmieniłoby to, co mierzy liczba nagłówkowa.';

GRANT SELECT ON public.pub_bot_podsumowanie TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. RAPORT: PO CO PRZYCHODZĄ CI BEZ PODPISU
-- ---------------------------------------------------------------------------
-- Marek: „żeby było wyraźnie widać, po co tu przychodzą".
--
-- Rozstrzygnięcie, kim są, jest niemożliwe — nie zostawili nazwy, a adresów IP
-- świadomie nie zapisujemy. Ale to, CZEGO SZUKAJĄ, wiemy dokładnie i to jest
-- ciekawsza informacja: monitoring pyta o stronę główną, skaner o pliki
-- konfiguracyjne, czytnik o treść. Intencja widać w celach, nie w narzędziu —
-- ta sama zasada, którą stosujemy do sieci AS1004.
--
-- ⚠ Ścieżki wrażliwe pokazujemy WYŁĄCZNIE jako liczbę przy typie. Opublikowana
-- lista adresów, o które pytał skaner, to gotowa mapa dla następnego.

CREATE OR REPLACE FUNCTION public.pub_raport_bez_podpisu(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  sciezka_typ TEXT,
  sciezka     TEXT,
  zadan       BIGINT,
  odbite      BIGINT,
  proc_bledow NUMERIC,
  ostatnio    TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.sciezka_typ,
         CASE WHEN v.sciezka_typ IN ('tresc', 'techniczna', 'zasob')
              THEN v.sciezka
              ELSE '(nie publikujemy — patrz raport Incydenty)' END,
         count(*),
         count(*) FILTER (WHERE v.status >= 400),
         round(100.0 * count(*) FILTER (WHERE v.status >= 400) / count(*), 1),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.bot = '(bez podpisu)'
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY v.sciezka_typ,
           CASE WHEN v.sciezka_typ IN ('tresc', 'techniczna', 'zasob')
                THEN v.sciezka
                ELSE '(nie publikujemy — patrz raport Incydenty)' END
  ORDER BY count(*) DESC
  LIMIT 200;
$$;

COMMENT ON FUNCTION public.pub_raport_bez_podpisu(TEXT) IS
  'Po co przychodzi ruch, który nie przedstawił się żadną nazwą. Kim są — nie wiemy i nie dowiemy się, bo adresów IP nie zapisujemy. Czego szukają — wiemy dokładnie, i to jest ciekawsza informacja: monitoring pyta o stronę główną, skaner o pliki konfiguracyjne, czytnik o treść. Ścieżki wrażliwe wyłącznie jako liczba przy typie.';

REVOKE ALL ON FUNCTION public.pub_raport_bez_podpisu(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_bez_podpisu(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- liczby naglowkowe MUSZA zostac takie same jak przed migracja
--   select proc_wsrod_rozstrzygnietych, proc_calosci, zadan_ogolem, bez_podpisu
--   from public.pub_bot_podsumowanie;
--
--   -- po co przychodza (wypelni sie dopiero po wdrozeniu workera)
--   select * from public.pub_raport_bez_podpisu('7d');
