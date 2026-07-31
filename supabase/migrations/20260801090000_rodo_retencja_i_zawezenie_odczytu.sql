-- =====================================================================
-- RODO + retencja + zawężenie odczytu  (audyt bezpieczeństwa 2026-08-01)
--
-- 1. Prawo do usunięcia danych (RODO art. 17) — delete_own_account()
-- 2. Prawo do przenoszenia danych (RODO art. 20) — export_own_data()
-- 3. Retencja: llm_queries (24 mies.), culture_clicks (12 mies.)
-- 4. Zawężenie odczytu llm_queries i culture_clicks do admina
-- 5. Jawne TO authenticated w politykach profiles
--
-- URUCHOMIĆ w Supabase SQL editor. Idempotentne (DROP IF EXISTS / OR REPLACE).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. USUNIĘCIE WŁASNEGO KONTA (RODO art. 17)
-- ---------------------------------------------------------------------
-- UWAGA: tabela public.products ma user_id BEZ klucza obcego do auth.users,
-- więc kaskada jej NIE obejmie — kasujemy ją jawnie. Pozostałe tabele
-- (profiles, sales_records, invoices, user_roles, reactions,
-- user_culture_lists, culture_audit_log) mają ON DELETE CASCADE.

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Brak zalogowanego użytkownika.';
  END IF;

  -- Tabele bez kaskady — usuwamy ręcznie, żeby nie zostawić sierot
  DELETE FROM public.products WHERE user_id = uid;

  -- Usunięcie konta; reszta danych schodzi kaskadą przez FK do auth.users
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMENT ON FUNCTION public.delete_own_account() IS
  'RODO art. 17 — użytkownik trwale usuwa własne konto i wszystkie powiązane dane. Nieodwracalne.';


-- ---------------------------------------------------------------------
-- 2. EKSPORT WŁASNYCH DANYCH (RODO art. 20)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.export_own_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  wynik jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Brak zalogowanego użytkownika.';
  END IF;

  SELECT jsonb_build_object(
    'wygenerowano',       now(),
    'profil',             (SELECT to_jsonb(p) FROM public.profiles p WHERE p.id = uid),
    'ewidencja_sprzedazy',(SELECT COALESCE(jsonb_agg(to_jsonb(s)), '[]'::jsonb)
                             FROM public.sales_records s WHERE s.user_id = uid),
    'faktury',            (SELECT COALESCE(jsonb_agg(to_jsonb(i)), '[]'::jsonb)
                             FROM public.invoices i WHERE i.user_id = uid),
    'produkty',           (SELECT COALESCE(jsonb_agg(to_jsonb(pr)), '[]'::jsonb)
                             FROM public.products pr WHERE pr.user_id = uid),
    'listy_kultur',       (SELECT COALESCE(jsonb_agg(to_jsonb(l)), '[]'::jsonb)
                             FROM public.user_culture_lists l WHERE l.user_id = uid),
    'reakcje',            (SELECT COALESCE(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
                             FROM public.reactions r WHERE r.user_id = uid),
    'role',               (SELECT COALESCE(jsonb_agg(ur.role), '[]'::jsonb)
                             FROM public.user_roles ur WHERE ur.user_id = uid)
  ) INTO wynik;

  RETURN wynik;
END;
$$;

REVOKE ALL ON FUNCTION public.export_own_data() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.export_own_data() TO authenticated;

COMMENT ON FUNCTION public.export_own_data() IS
  'RODO art. 20 — zwraca komplet danych zalogowanego użytkownika w formacie JSON.';


-- ---------------------------------------------------------------------
-- 3. RETENCJA — dane analityczne nie mogą rosnąć w nieskończoność
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_analytics_retention()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Zapytania do LLM: brak danych osobowych, trzymamy 24 miesiące
  DELETE FROM public.llm_queries
  WHERE created_at < now() - INTERVAL '24 months';

  -- Kliknięcia w sklepy: zawierają user_agent (dane quasi-osobowe)
  -- user_agent czyścimy po 3 miesiącach, całe wiersze po 12
  UPDATE public.culture_clicks
  SET user_agent = NULL
  WHERE clicked_at < now() - INTERVAL '3 months'
    AND user_agent IS NOT NULL;

  DELETE FROM public.culture_clicks
  WHERE clicked_at < now() - INTERVAL '12 months';
END;
$$;

COMMENT ON FUNCTION public.cleanup_analytics_retention() IS
  'Retencja danych analitycznych. Uruchamiać cyklicznie (pg_cron) lub ręcznie.';

-- Lekkie sprzątanie okazjonalne przy zapisie (wzorzec jak w contact_attempts):
-- ~1 na 200 insertów, żeby nie obciążać zapytań.
CREATE OR REPLACE FUNCTION public.trigger_cleanup_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF random() < 0.005 THEN
    PERFORM public.cleanup_analytics_retention();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_analytics_on_llm_insert ON public.llm_queries;
CREATE TRIGGER cleanup_analytics_on_llm_insert
  AFTER INSERT ON public.llm_queries
  FOR EACH ROW EXECUTE FUNCTION public.trigger_cleanup_analytics();


-- ---------------------------------------------------------------------
-- 4. ZAWĘŻENIE ODCZYTU ANALITYKI DO ADMINA
-- ---------------------------------------------------------------------
-- Dotąd każdy ZALOGOWANY użytkownik mógł czytać całość: czego ludzie szukają
-- i które sklepy dostają kliknięcia. To wiedza biznesowa, nie dane publiczne.

-- UWAGA: polityki RLS sumują się (OR). Gdyby została choć jedna stara
-- polityka SELECT z USING(true), nowa restrykcyjna niczego by nie zablokowała.
-- Dlatego kasujemy WSZYSTKIE polityki SELECT programowo, zamiast zgadywać nazwy
-- (część mogła powstać ad-hoc w SQL editorze i nie ma jej w migracjach).
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('llm_queries', 'culture_clicks')
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
    RAISE NOTICE 'Usunieto polityke SELECT: %.% ', pol.tablename, pol.policyname;
  END LOOP;
END;
$$;

CREATE POLICY "Only admins can view llm queries"
ON public.llm_queries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can view clicks"
ON public.culture_clicks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Kontrola po wykonaniu — powinny zostać dokładnie dwie polityki SELECT,
-- obie z warunkiem has_role(...,'admin'):
--   SELECT tablename, policyname, qual FROM pg_policies
--   WHERE schemaname='public' AND tablename IN ('llm_queries','culture_clicks') AND cmd='SELECT';


-- ---------------------------------------------------------------------
-- 5. JAWNE `TO authenticated` W POLITYKACH profiles
-- ---------------------------------------------------------------------
-- Dotąd polityki stosowały się do roli `public` (czyli także anon).
-- W praktyce bezpieczne, bo auth.uid() jest wtedy NULL i warunek nie
-- przechodzi — ale to zabezpieczenie przez przypadek, nie przez intencję.

DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
