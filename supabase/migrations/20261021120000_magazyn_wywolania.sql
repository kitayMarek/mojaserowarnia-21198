-- Pomiar serwera MCP bazy kultur (dane.mojaserowarnia.pl, worker-magazyn/).
--
-- ---------------------------------------------------------------------------
-- PO CO
-- ---------------------------------------------------------------------------
-- Marek, 21.10.2026: test, czy ktokolwiek podłącza serwer MCP bazy kultur
-- i czym. Plan: side-session-notes/.../mcp-baza-kultur-plan.md, punkt „Pomiar".
-- Ten sam wzór co wejscia_ludzi i zlicz_wejscie: sumy dzienne, bez IP,
-- bez User-Agenta, bez godziny i bez treści zapytań.
--
-- narzedzie: nazwa narzędzia albo (polaczenie) dla initialize i (lista) dla
--            tools/list.
-- klient:    kubełek z nazwy klienta MCP i nagłówka (Claude, ChatGPT,
--            Inspector, Cursor, ..., inne). Sam nagłówek nie jest zapisywany.
-- status:    kod odpowiedzi HTTP; 429 = odbite przez limit.
-- wlasne:    testy z test-marek w podpisie.
--
-- Zgoda Marka 21.10.2026. Stosowana ręcznie w SQL Editorze Supabase; plik
-- jest idempotentny (IF NOT EXISTS, OR REPLACE), więc ponowne wklejenie nie szkodzi.

CREATE TABLE IF NOT EXISTS public.magazyn_wywolania (
  dzien     DATE     NOT NULL DEFAULT ((now() AT TIME ZONE 'UTC')::date),
  narzedzie TEXT     NOT NULL,
  klient    TEXT     NOT NULL,
  status    SMALLINT NOT NULL,
  wlasne    BOOLEAN  NOT NULL,
  wywolan   INTEGER  NOT NULL DEFAULT 0,
  PRIMARY KEY (dzien, narzedzie, klient, status, wlasne)
);

COMMENT ON TABLE public.magazyn_wywolania IS
  'Sumy dzienne wywołań serwera MCP bazy kultur (dane.mojaserowarnia.pl). Bez adresu IP, User-Agenta, godziny i treści zapytań. narzedzie: nazwa narzędzia, (polaczenie) albo (lista); klient: kubełek z nazwy klienta MCP; status 429 = odbite przez limit.';

ALTER TABLE public.magazyn_wywolania ENABLE ROW LEVEL SECURITY;

-- Zapisuje tylko worker kluczem serwisowym (przez funkcję niżej). Czyta tylko
-- administrator, jak przy wejscia_ludzi.
DROP POLICY IF EXISTS "odczyt dla administratora" ON public.magazyn_wywolania;
CREATE POLICY "odczyt dla administratora" ON public.magazyn_wywolania
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.zlicz_wywolanie(
  _narzedzie TEXT,
  _klient    TEXT,
  _status    INTEGER,
  _wlasne    BOOLEAN
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.magazyn_wywolania AS w
    (dzien, narzedzie, klient, status, wlasne, wywolan)
  VALUES
    ((now() AT TIME ZONE 'UTC')::date, left(_narzedzie, 40), left(_klient, 20), _status, _wlasne, 1)
  ON CONFLICT (dzien, narzedzie, klient, status, wlasne)
  DO UPDATE SET wywolan = w.wywolan + 1;
$$;

REVOKE ALL ON FUNCTION public.zlicz_wywolanie(TEXT, TEXT, INTEGER, BOOLEAN)
  FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select dzien, narzedzie, klient, status, wywolan
--   from public.magazyn_wywolania
--   where not wlasne
--   order by dzien desc, wywolan desc;
