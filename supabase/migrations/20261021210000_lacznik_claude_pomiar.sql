-- Pomiar przyciskow „Dodaj do Claude” (21.10.2026). Dwie zmiany w jednym pliku:
--  1. llm_queries przyjmuje model 'lacznik-claude' (klikniecia przyciskow),
--  2. magazyn_wywolania dostaje kolumne zrodlo (znacznik strony z adresu lacznika).
--
-- Przyciski „Dodaj do Claude” na stronie dopisuja do adresu lacznika znacznik
-- strony, np. https://dane.mojaserowarnia.pl/mcp?z=/baza-kultur. Serwer MCP
-- zapisuje go przy kazdym wywolaniu, wiec widac, ktore strony daly prawdziwe
-- podlaczenia, a nie tylko klikniecia (te sa w llm_queries). Decyzja Marka.
--
-- Kolejnosc wdrozenia: NAJPIERW ta migracja, potem serwer MCP (npm run
-- deploy:magazyn). Nowa funkcja ma _zrodlo z wartoscia domyslna, wiec stary
-- serwer (cztery argumenty) dziala dalej po migracji; odwrotna kolejnosc
-- gubilaby pomiar, bo stara funkcja nie zna piatego argumentu.
-- Stare wiersze dostaja zrodlo = '' (bez znacznika).

BEGIN;

-- 1. llm_queries: klikniecia „Dodaj do Claude” zapisuja model 'lacznik-claude'.
-- Dotychczasowy CHECK dopuszczal tylko claude / perplexity / chatgpt (widget
-- „Zapytaj AI”, usuniety 21.10.2026), wiec nowe wpisy byly po cichu odrzucane.
-- Nazwy ograniczenia nie zakladamy: zdejmujemy kazdy CHECK na kolumnie model.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.llm_queries'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%model%'
  LOOP
    EXECUTE format('ALTER TABLE public.llm_queries DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.llm_queries
  ADD CONSTRAINT llm_queries_model_check
  CHECK (model IN ('claude', 'perplexity', 'chatgpt', 'lacznik-claude'));

-- 2. magazyn_wywolania: znacznik strony.
ALTER TABLE public.magazyn_wywolania
  ADD COLUMN IF NOT EXISTS zrodlo TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.magazyn_wywolania.zrodlo IS
  'Znacznik strony z adresu lacznika (?z=), np. /baza-kultur, /kultury/me, claude-code. Pusty = adres bez znacznika.';

ALTER TABLE public.magazyn_wywolania DROP CONSTRAINT IF EXISTS magazyn_wywolania_pkey;
ALTER TABLE public.magazyn_wywolania
  ADD PRIMARY KEY (dzien, narzedzie, klient, status, wlasne, zrodlo);

-- Jedna funkcja zamiast dwoch wariantow: PostgREST nie umie wybrac miedzy
-- przeciazeniami o tych samych nazwach argumentow.
DROP FUNCTION IF EXISTS public.zlicz_wywolanie(TEXT, TEXT, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION public.zlicz_wywolanie(
  _narzedzie TEXT,
  _klient    TEXT,
  _status    INTEGER,
  _wlasne    BOOLEAN,
  _zrodlo    TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.magazyn_wywolania AS w
    (dzien, narzedzie, klient, status, wlasne, zrodlo, wywolan)
  VALUES
    ((now() AT TIME ZONE 'UTC')::date, left(_narzedzie, 40), left(_klient, 20), _status, _wlasne,
     left(coalesce(_zrodlo, ''), 60), 1)
  ON CONFLICT (dzien, narzedzie, klient, status, wlasne, zrodlo)
  DO UPDATE SET wywolan = w.wywolan + 1;
$$;

REVOKE ALL ON FUNCTION public.zlicz_wywolanie(TEXT, TEXT, INTEGER, BOOLEAN, TEXT)
  FROM PUBLIC, anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
