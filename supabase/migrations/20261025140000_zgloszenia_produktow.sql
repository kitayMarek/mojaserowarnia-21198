-- ==========================================================================
-- Zgloszenia produktow do bazy dodatkow paszowych (25.10.2026)
--
-- PO CO: dotad zgloszenie w kalkulatorze bylo gotowym skladnikiem. Zalogowany
-- wpisywal liczby, wiersz trafial do feed_ingredients jako 'pending', a po
-- zatwierdzeniu stawal sie osobnym skladnikiem bez sklepu i ceny, ktorego
-- czaty nie widza (MCP czyta migawke src/data/dodatkiPaszowe.ts). Tak powstal
-- „Dolmix DN RE 2,5%” obok „Dolmix DN (Dolfos)”.
--
-- NOWA ZASADA (Marek, 25.10.2026): zglaszajacy podaje sklep i karte produktu
-- (link) albo zdjecie etykiety, a produkt do bazy wpisujemy my, po sprawdzeniu,
-- w src/data/dodatkiPaszowe.ts i seedem. Dlatego zgloszenie to osobna tabela,
-- z ktorej nic nie trafia do kalkulatora samo.
--
-- NEUTRALNOSC: zgloszenie od sklepu albo producenta niczego nie przestawia.
-- Kolejnosc ofert zalezy tylko od skladu i ceny.
--
-- KOLEJNOSC: ta migracja tylko dodaje (tabela, kubelek, funkcje). Stara droga
-- (insert do feed_ingredients) zamyka sie dopiero w 20261025150000, PO
-- wdrozeniu strony z nowym formularzem.
--
-- URUCHOMIC w Supabase SQL editor. Idempotentna.
-- Wymaga public.has_role (20251121074144_*) i pg_cron (20260915100000_*).
-- ==========================================================================

-- --- Tabela zgloszen -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feed_submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  -- Konto zglaszajacego. Usuniecie konta usuwa jego zgloszenia (nota prywatnosci).
  -- NULL tylko przy wpisach przeniesionych ze starego formularza, gdy konta juz nie ma.
  submitted_by   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nazwa          text NOT NULL CHECK (char_length(btrim(nazwa)) BETWEEN 2 AND 200),
  sklep          text CHECK (sklep IS NULL OR char_length(btrim(sklep)) BETWEEN 2 AND 200),
  url            text CHECK (url IS NULL OR (url ~* '^https?://[^[:space:]]+$' AND char_length(url) <= 2000)),
  -- Sciezka w kubelku zgloszenia-paszowe: {user_id}/{plik}.jpg. Kasowana po rozpatrzeniu.
  zdjecie        text CHECK (zdjecie IS NULL OR char_length(zdjecie) <= 300),
  cena_zl        numeric CHECK (cena_zl IS NULL OR (cena_zl > 0 AND cena_zl <= 100000)),
  opakowanie_kg  numeric CHECK (opakowanie_kg IS NULL OR (opakowanie_kg > 0 AND opakowanie_kg <= 5000)),
  -- Nazwa produktu z bazy, nie id: seed kasuje produkty i wstawia je od nowa, wiec id sie zmieniaja.
  poprawka_do    text CHECK (poprawka_do IS NULL OR char_length(poprawka_do) <= 200),
  kto            text CHECK (kto IS NULL OR kto IN ('hodowca', 'sklep', 'producent', 'inny')),
  uwagi          text CHECK (uwagi IS NULL OR char_length(uwagi) <= 2000),
  email          text CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')),
  status         text NOT NULL DEFAULT 'nowe' CHECK (status IN ('nowe', 'dodane', 'duplikat', 'odrzucone')),
  -- Notatka admina. Widzi ja tez zglaszajacy (RLS: autor czyta caly wiersz), wiec pisac jak odpowiedz.
  notatka        text CHECK (notatka IS NULL OR char_length(notatka) <= 4000),
  rozpatrzono    timestamptz,
  -- Id wiersza feed_ingredients, gdy zgloszenie przyszlo ze starego formularza (bez klucza obcego:
  -- skladnik bywa potem usuwany, a zgloszenie ma zostac).
  stary_wpis_id  uuid,
  -- Nowe zgloszenie musi miec sklep i link albo zdjecie. Stare (z liczbami) czesto nie mialy.
  CONSTRAINT feed_submissions_sklep_i_dowod CHECK (
    stary_wpis_id IS NOT NULL OR (sklep IS NOT NULL AND (url IS NOT NULL OR zdjecie IS NOT NULL))
  )
);

CREATE INDEX IF NOT EXISTS feed_submissions_status_idx ON public.feed_submissions (status, created_at);
CREATE INDEX IF NOT EXISTS feed_submissions_autor_idx ON public.feed_submissions (submitted_by, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS feed_submissions_stary_wpis_idx
  ON public.feed_submissions (stary_wpis_id) WHERE stary_wpis_id IS NOT NULL;

ALTER TABLE public.feed_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feed_submissions FROM anon;

-- Zglasza zalogowany, tylko we wlasnym imieniu, tylko jako „nowe” i tylko ze zdjeciem
-- z wlasnego katalogu. Pola admina (notatka, rozpatrzono) i przeniesienie zostaja puste.
DROP POLICY IF EXISTS feed_submissions_insert_autor ON public.feed_submissions;
CREATE POLICY feed_submissions_insert_autor
  ON public.feed_submissions FOR INSERT TO authenticated
  WITH CHECK (
    submitted_by = auth.uid()
    AND status = 'nowe'
    AND notatka IS NULL
    AND rozpatrzono IS NULL
    AND stary_wpis_id IS NULL
    AND (zdjecie IS NULL OR split_part(zdjecie, '/', 1) = auth.uid()::text)
  );

-- Autor widzi swoje zgloszenia (ze statusem i notatka), admin wszystkie.
DROP POLICY IF EXISTS feed_submissions_select_autor ON public.feed_submissions;
CREATE POLICY feed_submissions_select_autor
  ON public.feed_submissions FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());

DROP POLICY IF EXISTS feed_submissions_admin ON public.feed_submissions;
CREATE POLICY feed_submissions_admin
  ON public.feed_submissions FOR ALL TO authenticated
  USING (public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role))
  WITH CHECK (public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role));

-- --- Limit: 10 zgloszen na konto na dobe ----------------------------------
-- Zeby sklep albo bot nie zasypal listy. Admina nie dotyczy.
CREATE OR REPLACE FUNCTION public.feed_submissions_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.submitted_by IS NOT NULL
     AND NOT public.has_role(_user_id => NEW.submitted_by, _role => 'admin'::public.app_role)
     AND (SELECT count(*) FROM public.feed_submissions
          WHERE submitted_by = NEW.submitted_by AND created_at > now() - INTERVAL '24 hours') >= 10 THEN
    RAISE EXCEPTION 'Limit zgłoszeń: najwyżej 10 na dobę. Spróbuj jutro.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feed_submissions_limit ON public.feed_submissions;
CREATE TRIGGER feed_submissions_limit
  BEFORE INSERT ON public.feed_submissions
  FOR EACH ROW EXECUTE FUNCTION public.feed_submissions_limit();

-- --- Kubelek na zdjecia etykiet: prywatny ----------------------------------
-- Zdjecie zmniejsza i pozbawia EXIF/GPS przegladarka (src/lib/image.ts) i zawsze
-- wychodzi jako JPEG; png i webp tylko na zapas. 5 MB z duzym zapasem na drobny druk.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('zgloszenia-paszowe', 'zgloszenia-paszowe', false, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Zgloszenia paszowe: upload do wlasnego katalogu" ON storage.objects;
CREATE POLICY "Zgloszenia paszowe: upload do wlasnego katalogu"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'zgloszenia-paszowe'
              AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Zgloszenia paszowe: odczyt autor i admin" ON storage.objects;
CREATE POLICY "Zgloszenia paszowe: odczyt autor i admin"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'zgloszenia-paszowe'
         AND ((storage.foldername(name))[1] = auth.uid()::text
              OR public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role)));

-- Autor kasuje swoj plik, gdy zapis zgloszenia sie nie udal; admin po rozpatrzeniu.
DROP POLICY IF EXISTS "Zgloszenia paszowe: usuwanie autor i admin" ON storage.objects;
CREATE POLICY "Zgloszenia paszowe: usuwanie autor i admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'zgloszenia-paszowe'
         AND ((storage.foldername(name))[1] = auth.uid()::text
              OR public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role)));

-- --- Zdjecia bez zgloszenia (dla panelu admina) ----------------------------
-- Plikow w Storage nie kasuje sie z SQL (tylko przez API), wiec po usunieciu konta
-- albo nieudanym zapisie zostaja sieroty. Panel /admin/skladniki pyta o nie przy
-- otwarciu i kasuje je przez API. Dzien zapasu, zeby nie trafic w trwajacy zapis.
CREATE OR REPLACE FUNCTION public.zgloszenia_zdjecia_bez_wpisu()
RETURNS SETOF text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Tylko dla administratora.';
  END IF;
  RETURN QUERY
    SELECT o.name FROM storage.objects o
    WHERE o.bucket_id = 'zgloszenia-paszowe'
      AND o.created_at < now() - INTERVAL '1 day'
      AND NOT EXISTS (SELECT 1 FROM public.feed_submissions s WHERE s.zdjecie = o.name AND s.status = 'nowe');
END;
$$;

REVOKE ALL ON FUNCTION public.zgloszenia_zdjecia_bez_wpisu() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.zgloszenia_zdjecia_bez_wpisu() TO authenticated;

-- --- Retencja: 12 miesiecy od rozpatrzenia ---------------------------------
-- Nierozpatrzone zostaja do rozpatrzenia. Zdjecie znika wczesniej (panel kasuje je
-- przy zmianie statusu), tu tylko wiersze. Nota prywatnosci: /nota-prawna#prywatnosc.
CREATE OR REPLACE FUNCTION public.sprzataj_zgloszenia_produktow()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.feed_submissions
  WHERE status <> 'nowe' AND rozpatrzono < now() - INTERVAL '12 months';
$$;

REVOKE ALL ON FUNCTION public.sprzataj_zgloszenia_produktow() FROM public, anon, authenticated;

SELECT cron.unschedule('sprzataj-zgloszenia-produktow')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sprzataj-zgloszenia-produktow');

SELECT cron.schedule(
  'sprzataj-zgloszenia-produktow',
  '20 3 * * *',
  $cron$ SELECT public.sprzataj_zgloszenia_produktow(); $cron$
);

-- --- Eksport danych konta (RODO art. 20): dochodza zgloszenia --------------
-- Cialo jak w 20260801090000_rodo_retencja_i_zawezenie_odczytu.sql, plus jeden klucz.
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
                             FROM public.user_roles ur WHERE ur.user_id = uid),
    'zgloszenia_produktow',(SELECT COALESCE(jsonb_agg(to_jsonb(z)), '[]'::jsonb)
                             FROM public.feed_submissions z WHERE z.submitted_by = uid)
  ) INTO wynik;

  RETURN wynik;
END;
$$;

REVOKE ALL ON FUNCTION public.export_own_data() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.export_own_data() TO authenticated;

-- --- Stare zgloszenia (decyzja Marka 25.10.2026) ---------------------------
-- Zatwierdzone skladniki 'user' zostaja w kalkulatorze, dopoki ich nie sprawdzimy,
-- i trafiaja na liste zgloszen jako „nowe”. Liczby ze starego formularza ida do
-- uwag, zeby bylo z czym porownac etykiete. Ponowne uruchomienie niczego nie dubluje.
INSERT INTO public.feed_submissions (created_at, submitted_by, nazwa, url, uwagi, stary_wpis_id)
SELECT
  fi.created_at,
  CASE WHEN EXISTS (SELECT 1 FROM auth.users u WHERE u.id = fi.submitted_by) THEN fi.submitted_by END,
  left(btrim(fi.nazwa), 200),
  CASE WHEN fi.zrodlo ~* '^https?://[^[:space:]]+$' AND char_length(fi.zrodlo) <= 2000 THEN fi.zrodlo END,
  left(concat_ws(' ',
    'Ze starego formularza: składnik jest w kalkulatorze z liczbami wpisanymi przez zgłaszającego.',
    nullif(concat_ws(', ',
      CASE WHEN fi.em     IS NOT NULL THEN 'EM ' || fi.em || ' MJ/kg' END,
      CASE WHEN fi.bialko IS NOT NULL THEN 'białko ' || fi.bialko || '%' END,
      CASE WHEN fi.ca     IS NOT NULL THEN 'Ca ' || fi.ca || '%' END,
      CASE WHEN fi.p      IS NOT NULL THEN 'P ' || fi.p || '%' END,
      CASE WHEN fi.wlokno IS NOT NULL THEN 'włókno ' || fi.wlokno || '%' END,
      CASE WHEN fi.na     IS NOT NULL THEN 'Na ' || fi.na || '%' END,
      CASE WHEN fi.k      IS NOT NULL THEN 'K ' || fi.k || '%' END,
      CASE WHEN fi.mg     IS NOT NULL THEN 'Mg ' || fi.mg || '%' END,
      CASE WHEN fi.mn     IS NOT NULL THEN 'Mn ' || fi.mn || ' mg/kg' END,
      CASE WHEN fi.zn     IS NOT NULL THEN 'Zn ' || fi.zn || ' mg/kg' END,
      CASE WHEN fi.se     IS NOT NULL THEN 'Se ' || fi.se || ' mg/kg' END,
      CASE WHEN fi.fe     IS NOT NULL THEN 'Fe ' || fi.fe || ' mg/kg' END,
      CASE WHEN fi.i      IS NOT NULL THEN 'I ' || fi.i || ' mg/kg' END
    ), '') || '.',
    CASE WHEN fi.zrodlo IS NOT NULL AND fi.zrodlo !~* '^https?://' THEN 'Źródło podane przy zgłoszeniu: ' || fi.zrodlo || '.' END
  ), 2000),
  fi.id
FROM public.feed_ingredients fi
WHERE fi.source = 'user' AND fi.status = 'approved'
  AND NOT EXISTS (SELECT 1 FROM public.feed_submissions s WHERE s.stary_wpis_id = fi.id);

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select nazwa, status, url is not null as link, left(uwagi, 60) from public.feed_submissions order by created_at;
--   -- powinno byc 5 wierszy „nowe” (Dolmix Capri, DOLMIX DB grower 2%, Dolmix DN RE 2,5%, DDGS, Univit Nioska)
--   select id, public, file_size_limit from storage.buckets where id = 'zgloszenia-paszowe';
--   select jobname, schedule from cron.job where jobname = 'sprzataj-zgloszenia-produktow';
