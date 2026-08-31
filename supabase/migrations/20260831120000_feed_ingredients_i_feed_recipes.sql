-- ============================================================================
-- feed_ingredients i feed_recipes — tabele kalkulatora pasz
--
-- DLACZEGO TA MIGRACJA POWSTAJE DOPIERO TERAZ: obie tabele zostały kiedyś
-- utworzone bezpośrednio w panelu i nigdy nie trafiły do migracji. Wyszło to
-- przy przenosinach z Lovable Cloud: porównanie tabel tworzonych przez migracje
-- z tabelami używanymi przez aplikację pokazało dwie dziury. Na czystym projekcie
-- migracje nie utworzyłyby ich wcale, import 127 składników poszedłby na błąd,
-- a kalkulator pasz — najczęściej otwierana strona serwisu — przestałby działać.
--
-- Definicje odtworzone 1:1 ze starego projektu (information_schema.columns,
-- pg_policies, pg_constraint), nie z pamięci.
--
-- Wymaga wcześniejszej migracji z funkcją public.has_role() i typem app_role
-- (20251121074144_*), dlatego data w nazwie jest późniejsza.
-- ============================================================================

-- --- Składniki paszowe: baza wspólna, moderowana --------------------------
CREATE TABLE IF NOT EXISTS public.feed_ingredients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nazwa         text NOT NULL,
  kategoria     text,
  em            numeric,
  bialko        numeric,
  ca            numeric,
  p             numeric,
  wlokno        numeric,
  na            numeric,
  k             numeric,
  mg            numeric,
  mn            numeric,
  zn            numeric,
  se            numeric,
  fe            numeric,
  i             numeric,
  zrodlo        text,
  status        text NOT NULL DEFAULT 'pending',
  submitted_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  source        text NOT NULL DEFAULT 'user',
  CONSTRAINT feed_ingredients_status_check
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))
);

ALTER TABLE public.feed_ingredients ENABLE ROW LEVEL SECURITY;

-- Zatwierdzone składniki widzi każdy — to publiczna baza kalkulatora.
DROP POLICY IF EXISTS feed_approved_readable_by_everyone ON public.feed_ingredients;
CREATE POLICY feed_approved_readable_by_everyone
  ON public.feed_ingredients FOR SELECT TO public
  USING (status = 'approved'::text);

-- Autor widzi też własne zgłoszenia, zanim ktoś je zatwierdzi.
DROP POLICY IF EXISTS feed_own_visible_to_author ON public.feed_ingredients;
CREATE POLICY feed_own_visible_to_author
  ON public.feed_ingredients FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());

-- Zgłaszać może zalogowany, ale tylko w swoim imieniu i tylko jako "pending" —
-- inaczej dałoby się wstawić własny składnik od razu jako zatwierdzony.
DROP POLICY IF EXISTS feed_insert_by_authenticated ON public.feed_ingredients;
CREATE POLICY feed_insert_by_authenticated
  ON public.feed_ingredients FOR INSERT TO authenticated
  WITH CHECK ((submitted_by = auth.uid()) AND (status = 'pending'::text));

DROP POLICY IF EXISTS feed_admin_full_access ON public.feed_ingredients;
CREATE POLICY feed_admin_full_access
  ON public.feed_ingredients FOR ALL TO authenticated
  USING (public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role))
  WITH CHECK (public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role));

-- --- Zapisane receptury: prywatne, per użytkownik -------------------------
CREATE TABLE IF NOT EXISTS public.feed_recipes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  nazwa       text NOT NULL,
  norma       text NOT NULL,
  skladniki   jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recipes" ON public.feed_recipes;
CREATE POLICY "Users can view own recipes"
  ON public.feed_recipes FOR SELECT TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recipes" ON public.feed_recipes;
CREATE POLICY "Users can insert own recipes"
  ON public.feed_recipes FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recipes" ON public.feed_recipes;
CREATE POLICY "Users can update own recipes"
  ON public.feed_recipes FOR UPDATE TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recipes" ON public.feed_recipes;
CREATE POLICY "Users can delete own recipes"
  ON public.feed_recipes FOR DELETE TO public
  USING (auth.uid() = user_id);
