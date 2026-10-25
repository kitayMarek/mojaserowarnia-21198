-- Pomiar dwóch serwisów w tych samych tabelach (25.10.2026, przenosiny pasz na mojapasza.com).
--  1. wejscia_ludzi dostaje kolumnę serwis (mojaserowarnia.pl albo mojapasza.com),
--  2. magazyn_wywolania dostaje kolumnę serwer (mojaserowarnia albo mojapasza).
--
-- Bez tego ruch mojapasza.com zlałby się z Serowarnią: strona główna obu serwisów
-- to "/", a łącznik mojapasza.com/mcp liczyłby się jak dane.mojaserowarnia.pl.
-- bot_visits i przyjscia_z_odpowiedzi celowo bez zmian: zasilają kilkadziesiąt
-- widoków i publiczną stronę /boty-ai, a worker mojapasza do nich nie pisze.
--
-- Stare wiersze dostają wartość domyślną (Serowarnia), więc liczby Serowarni
-- się nie zmieniają. Zapytania o ruch Serowarni po przełączeniu: WHERE serwis = 'mojaserowarnia.pl'
-- (opis w docs/zmiany-pomiaru.md).
--
-- Kolejność wdrożenia: NAJPIERW ta migracja, potem Workery mojapasza (npm run deploy:pasze,
-- npm run deploy:magazyn -- --pasze). Nowe funkcje mają argument z wartością domyślną,
-- więc worker Serowarni i serwer dane.mojaserowarnia.pl działają po migracji bez zmian.

BEGIN;

-- 1. wejscia_ludzi.serwis
ALTER TABLE public.wejscia_ludzi
  ADD COLUMN IF NOT EXISTS serwis TEXT NOT NULL DEFAULT 'mojaserowarnia.pl';

COMMENT ON COLUMN public.wejscia_ludzi.serwis IS
  'Domena serwisu: mojaserowarnia.pl albo mojapasza.com (od 25.10.2026). Ruch Serowarni: WHERE serwis = ''mojaserowarnia.pl''.';

ALTER TABLE public.wejscia_ludzi DROP CONSTRAINT IF EXISTS wejscia_ludzi_pkey;
ALTER TABLE public.wejscia_ludzi
  ADD PRIMARY KEY (dzien, serwis, sciezka, zrodlo, kraj, urzadzenie, przegladarka, rodzaj, status, wlasne, gpc);

-- Jedna funkcja zamiast dwóch wariantów: PostgREST nie umie wybrać między
-- przeciążeniami o tych samych nazwach argumentów.
DROP FUNCTION IF EXISTS public.zlicz_wejscie(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, BOOLEAN);

CREATE OR REPLACE FUNCTION public.zlicz_wejscie(
  _sciezka      TEXT,
  _zrodlo       TEXT,
  _kraj         TEXT,
  _urzadzenie   TEXT,
  _przegladarka TEXT,
  _rodzaj       TEXT,
  _status       INTEGER,
  _wlasne       BOOLEAN,
  _gpc          BOOLEAN,
  _serwis       TEXT DEFAULT 'mojaserowarnia.pl'
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.wejscia_ludzi AS w
    (dzien, serwis, sciezka, zrodlo, kraj, urzadzenie, przegladarka, rodzaj, status, wlasne, gpc, wejsc)
  VALUES
    ((now() AT TIME ZONE 'UTC')::date, left(coalesce(_serwis, 'mojaserowarnia.pl'), 40), left(_sciezka, 200),
     left(_zrodlo, 60), left(_kraj, 12), left(_urzadzenie, 16), left(_przegladarka, 32), left(_rodzaj, 20),
     _status, _wlasne, _gpc, 1)
  ON CONFLICT (dzien, serwis, sciezka, zrodlo, kraj, urzadzenie, przegladarka, rodzaj, status, wlasne, gpc)
  DO UPDATE SET wejsc = w.wejsc + 1;
$$;

REVOKE ALL ON FUNCTION public.zlicz_wejscie(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated;

-- 2. magazyn_wywolania.serwer
ALTER TABLE public.magazyn_wywolania
  ADD COLUMN IF NOT EXISTS serwer TEXT NOT NULL DEFAULT 'mojaserowarnia';

COMMENT ON COLUMN public.magazyn_wywolania.serwer IS
  'Który łącznik: mojaserowarnia (dane.mojaserowarnia.pl/mcp) albo mojapasza (mojapasza.com/mcp, od 25.10.2026).';

ALTER TABLE public.magazyn_wywolania DROP CONSTRAINT IF EXISTS magazyn_wywolania_pkey;
ALTER TABLE public.magazyn_wywolania
  ADD PRIMARY KEY (dzien, serwer, narzedzie, klient, status, wlasne, zrodlo);

DROP FUNCTION IF EXISTS public.zlicz_wywolanie(TEXT, TEXT, INTEGER, BOOLEAN, TEXT);

CREATE OR REPLACE FUNCTION public.zlicz_wywolanie(
  _narzedzie TEXT,
  _klient    TEXT,
  _status    INTEGER,
  _wlasne    BOOLEAN,
  _zrodlo    TEXT DEFAULT '',
  _serwer    TEXT DEFAULT 'mojaserowarnia'
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.magazyn_wywolania AS w
    (dzien, serwer, narzedzie, klient, status, wlasne, zrodlo, wywolan)
  VALUES
    ((now() AT TIME ZONE 'UTC')::date, left(coalesce(_serwer, 'mojaserowarnia'), 20), left(_narzedzie, 40),
     left(_klient, 20), _status, _wlasne, left(coalesce(_zrodlo, ''), 60), 1)
  ON CONFLICT (dzien, serwer, narzedzie, klient, status, wlasne, zrodlo)
  DO UPDATE SET wywolan = w.wywolan + 1;
$$;

REVOKE ALL ON FUNCTION public.zlicz_wywolanie(TEXT, TEXT, INTEGER, BOOLEAN, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
