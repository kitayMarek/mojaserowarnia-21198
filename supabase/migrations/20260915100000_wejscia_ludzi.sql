-- Wejścia ludzi liczone po stronie serwera: same sumy, bez IP, User-Agenta i ciasteczek.
-- Do tego alarm ciszy dla obu liczników.
--
-- ---------------------------------------------------------------------------
-- DECYZJA
-- ---------------------------------------------------------------------------
-- Marek 14.09.2026 (zlecenie aplikacji seo-evidence, część 15.4): uruchomić
-- własny pomiar ruchu ludzi obok GA4, na start wyłącznie sumy po stronie serwera.
-- 15.09.2026 zgoda na projekt: przeglądarka jako kolumna, GPC tylko do sumy dnia,
-- dopisek w nocie prawnej, alarm ciszy także dla licznika botów.
--
-- Od 13.09.2026 GA widzi tylko osoby, które się zgodziły. Serwer widzi każde wejście.
--
-- JEDNOSTKA: wejście, czyli załadowanie strony przez przeglądarkę. Przejścia
-- wewnątrz aplikacji React nie docierają do serwera. To nie są odsłony ani osoby.
--
-- CO W WIERSZU: dzień UTC, ścieżka bez parametrów, źródło (znana nazwa albo sama
-- domena odsyłacza), kraj, rodzaj urządzenia, przeglądarka, rodzaj wejścia, kod
-- odpowiedzi, ruch własny, GPC i licznik. Z takiego wiersza nie da się odtworzyć
-- osoby ani pojedynczej wizyty.
--
-- Kto jest człowiekiem, rozstrzyga worker (worker/wejscia-ludzi.js). Baza tylko
-- dodaje jedynki. Brak danych ma jawną wartość ('??', 'nieznane', '(ukryte)'),
-- nigdy puste pole.

-- ---------------------------------------------------------------------------
-- 1. TABELA
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.wejscia_ludzi (
  dzien        DATE     NOT NULL DEFAULT ((now() AT TIME ZONE 'UTC')::date),
  sciezka      TEXT     NOT NULL,
  zrodlo       TEXT     NOT NULL,
  kraj         TEXT     NOT NULL,
  urzadzenie   TEXT     NOT NULL,
  przegladarka TEXT     NOT NULL,
  rodzaj       TEXT     NOT NULL,
  status       SMALLINT NOT NULL,
  wlasne       BOOLEAN  NOT NULL,
  gpc          BOOLEAN  NOT NULL,
  wejsc        INTEGER  NOT NULL DEFAULT 0,
  PRIMARY KEY (dzien, sciezka, zrodlo, kraj, urzadzenie, przegladarka, rodzaj, status, wlasne, gpc)
);

COMMENT ON TABLE public.wejscia_ludzi IS
  'Sumy wejść ludzi liczone przez worker po stronie serwera, niezależnie od zgody na ciasteczka. Jedno wejście to załadowanie strony przez przeglądarkę. Bez adresu IP, User-Agenta i godziny. rodzaj: wejscie albo wstepne_pobranie (Chrome pobiera stronę, zanim ktoś kliknie). gpc: przeglądarka wysłała Global Privacy Control, cechy wejścia są wtedy (ukryte).';

ALTER TABLE public.wejscia_ludzi ENABLE ROW LEVEL SECURITY;

-- Zapisuje tylko worker kluczem serwisowym (przez funkcję niżej). Czyta tylko
-- administrator. Publicznego raportu nie ma i na razie nie będzie.
DROP POLICY IF EXISTS "odczyt dla administratora" ON public.wejscia_ludzi;
CREATE POLICY "odczyt dla administratora" ON public.wejscia_ludzi
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 2. ZLICZANIE — woła worker, kluczem serwisowym
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.zlicz_wejscie(
  _sciezka      TEXT,
  _zrodlo       TEXT,
  _kraj         TEXT,
  _urzadzenie   TEXT,
  _przegladarka TEXT,
  _rodzaj       TEXT,
  _status       INTEGER,
  _wlasne       BOOLEAN,
  _gpc          BOOLEAN
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.wejscia_ludzi AS w
    (dzien, sciezka, zrodlo, kraj, urzadzenie, przegladarka, rodzaj, status, wlasne, gpc, wejsc)
  VALUES
    ((now() AT TIME ZONE 'UTC')::date, left(_sciezka, 200), left(_zrodlo, 60), left(_kraj, 12),
     left(_urzadzenie, 16), left(_przegladarka, 32), left(_rodzaj, 20), _status, _wlasne, _gpc, 1)
  ON CONFLICT (dzien, sciezka, zrodlo, kraj, urzadzenie, przegladarka, rodzaj, status, wlasne, gpc)
  DO UPDATE SET wejsc = w.wejsc + 1;
$$;

REVOKE ALL ON FUNCTION public.zlicz_wejscie(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, BOOLEAN)
  FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. ODBIORCA ALARMÓW W VAULT
-- ---------------------------------------------------------------------------
-- Adres nie jest wpisany w tym pliku (repozytorium jest publiczne). Kopiujemy go
-- raz z istniejącego alertu o skanach (zglos_skany_botow). Jeśli się nie uda,
-- alarm ciszy zwróci treść zamiast wysłać maila i powie, czego brakuje.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'odbiorca_alertow') THEN
    PERFORM vault.create_secret(
      substring(pg_get_functiondef('public.zglos_skany_botow(integer)'::regprocedure)
                FROM '''([^''\s]+@[^''\s]+)'''),
      'odbiorca_alertow'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'odbiorca_alertow nie zostal zapisany: %', SQLERRM;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. ALARM CISZY — oba liczniki, za poprzedni dzień UTC
-- ---------------------------------------------------------------------------
-- Mail idzie tylko wtedy, gdy:
--   • wejść ludzi było 0,
--   • ponad połowa wejść ludzi ma kraj '??' albo urządzenie 'nieznane'
--     (pole przestało się wyliczać),
--   • wizyt botów było 0,
--   • są wizyty botów bez typu ścieżki (dokładnie przypadek z 10–13.09.2026).
-- _proba = true wysyła maila także bez uwag, do sprawdzenia drogi wysyłki.

CREATE OR REPLACE FUNCTION public.zglos_cisze_licznikow(_proba BOOLEAN DEFAULT false)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _dzien          DATE := (now() AT TIME ZONE 'UTC')::date - 1;
  _ludzie_razem   BIGINT;
  _ludzie         BIGINT;
  _bez_kraju      BIGINT;
  _bez_urzadzenia BIGINT;
  _boty           BIGINT;
  _boty_bez_typu  BIGINT;
  _uwagi          TEXT := '';
  _tresc          TEXT;
  _klucz          TEXT;
  _odbiorca       TEXT;
BEGIN
  SELECT coalesce(sum(wejsc), 0),
         coalesce(sum(wejsc) FILTER (WHERE NOT gpc), 0),
         coalesce(sum(wejsc) FILTER (WHERE NOT gpc AND kraj = '??'), 0),
         coalesce(sum(wejsc) FILTER (WHERE NOT gpc AND urzadzenie = 'nieznane'), 0)
    INTO _ludzie_razem, _ludzie, _bez_kraju, _bez_urzadzenia
  FROM public.wejscia_ludzi
  WHERE dzien = _dzien AND NOT wlasne AND rodzaj = 'wejscie';

  SELECT count(*), count(*) FILTER (WHERE sciezka_typ IS NULL)
    INTO _boty, _boty_bez_typu
  FROM public.bot_visits
  WHERE NOT wlasne
    AND odwiedzono >= (_dzien::timestamp AT TIME ZONE 'UTC')
    AND odwiedzono <  ((_dzien + 1)::timestamp AT TIME ZONE 'UTC');

  IF _ludzie_razem = 0 THEN
    _uwagi := _uwagi || format('Wejścia ludzi za %s: 0. Licznik ludzi nie zapisał ani jednego wejścia.', _dzien) || chr(10);
  END IF;
  IF _ludzie > 0 AND (_bez_kraju * 2 > _ludzie OR _bez_urzadzenia * 2 > _ludzie) THEN
    _uwagi := _uwagi || format('Wejścia ludzi za %s: %s, w tym bez kraju %s i bez rozpoznanego urządzenia %s. Któreś pole przestało się wyliczać.',
                               _dzien, _ludzie, _bez_kraju, _bez_urzadzenia) || chr(10);
  END IF;
  IF _boty = 0 THEN
    _uwagi := _uwagi || format('Wizyty botów za %s: 0. Licznik botów nie zapisał ani jednej wizyty.', _dzien) || chr(10);
  END IF;
  IF _boty_bez_typu > 0 THEN
    _uwagi := _uwagi || format('Wizyty botów za %s bez typu ścieżki: %s z %s. Trigger nie nadaje typu, tak jak 10–13.09.2026.',
                               _dzien, _boty_bez_typu, _boty) || chr(10);
  END IF;

  IF _uwagi = '' AND NOT _proba THEN
    RETURN format('bez uwag za %s: wejścia ludzi %s, wizyty botów %s', _dzien, _ludzie_razem, _boty);
  END IF;

  _tresc := CASE WHEN _uwagi = ''
                 THEN format('Próba alarmu ciszy. Za %s: wejścia ludzi %s, wizyty botów %s, bez typu ścieżki %s.',
                             _dzien, _ludzie_razem, _boty, _boty_bez_typu) || chr(10)
                 ELSE _uwagi END
            || chr(10) || format('Szczegóły: select * from wejscia_ludzi where dzien = %L;', _dzien);

  -- Odczyt z Vault w bloku z wyjątkiem: brak rozszerzenia albo sekretu ma zwrócić
  -- treść alarmu, a nie wywrócić zadania cron.
  BEGIN
    SELECT decrypted_secret INTO _klucz FROM vault.decrypted_secrets WHERE name = 'klucz_alertu_botow';
    SELECT decrypted_secret INTO _odbiorca FROM vault.decrypted_secrets WHERE name = 'odbiorca_alertow';
  EXCEPTION WHEN OTHERS THEN
    _klucz := NULL;
    _odbiorca := NULL;
  END;

  IF _klucz IS NULL OR _odbiorca IS NULL THEN
    RETURN 'Alarm NIE został wysłany, w vault brakuje: '
           || concat_ws(', ',
                CASE WHEN _klucz IS NULL THEN 'klucz_alertu_botow' END,
                CASE WHEN _odbiorca IS NULL THEN 'odbiorca_alertow' END)
           || chr(10) || _tresc;
  END IF;

  PERFORM net.http_post(
    url := 'https://hsgxmbhunclhgzumafrk.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _klucz
    ),
    body := jsonb_build_object(
      'recipients', jsonb_build_array(_odbiorca),
      'subject', CASE WHEN _uwagi = ''
                      THEN 'mojaserowarnia.pl: próba alarmu ciszy liczników'
                      ELSE format('mojaserowarnia.pl: cisza w licznikach za %s', _dzien) END,
      'message', _tresc
    )
  );

  RETURN CASE WHEN _uwagi = '' THEN 'wysłano próbę alarmu' ELSE 'wysłano alarm ciszy' END;
END;
$$;

COMMENT ON FUNCTION public.zglos_cisze_licznikow(BOOLEAN) IS
  'Sprawdza poprzedni dzień UTC w obu licznikach i wysyła maila, gdy któryś zamilkł albo przestał wyliczać pola. Próba: select public.zglos_cisze_licznikow(true);';

REVOKE ALL ON FUNCTION public.zglos_cisze_licznikow(BOOLEAN) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. HARMONOGRAM — codziennie 6:45 UTC, przed alertem o skanach
-- ---------------------------------------------------------------------------

SELECT cron.unschedule('alarm-cisza-licznikow')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'alarm-cisza-licznikow');

SELECT cron.schedule(
  'alarm-cisza-licznikow',
  '45 6 * * *',
  $cron$ SELECT public.zglos_cisze_licznikow(); $cron$
);

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- oba sekrety muszą być na liście
--   select name from vault.secrets where name in ('klucz_alertu_botow', 'odbiorca_alertow');
--
--   -- próbny alarm, powinien przyjść mail
--   select public.zglos_cisze_licznikow(true);
--
--   -- po wdrożeniu workera i pierwszym wejściu ze zwykłej przeglądarki
--   select * from public.wejscia_ludzi order by dzien desc, wejsc desc limit 20;
