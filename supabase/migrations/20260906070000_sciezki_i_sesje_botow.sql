-- Klasyfikacja po ścieżce, wskaźnik błędów i znacznik testowy niezależny od sieci.
-- Części 1, 2 oraz utwardzenie z Części 5 zlecenia
-- ProjektyLLm/zlecenie-licznik-poprawki-kanarek.md
--
-- PODSTAWA: pomiar 216 żądań z doby 04–05.09.2026 pokazał, że sygnatura
-- ZACHOWANIA rozdziela grupy ostrzej niż weryfikacja tożsamości:
--
--              udane  odbite  z mirrorem  średni rozmiar
--   prawdziwe    53      0        28        17 617 B
--   podszyte     13     14        10         4 389 B
--
-- Prawdziwe boty mają ZEROWY odsetek błędów — idą po sitemapie, więc wiedzą,
-- co istnieje. Podszywacze 52% — zgadują adresy z gotowej listy. Do tego zbiory
-- ścieżek są prawie rozłączne: 21 tylko prawdziwych, 49 tylko podszytych,
-- 6 wspólnych. To znaczy, że można klasyfikować BEZ list IP i BEZ DNS — a więc
-- także dla operatorów, którzy jeszcze nie istnieją.

-- ---------------------------------------------------------------------------
-- CZĘŚĆ 1 — znacznik testowy niezależny od sieci
-- ---------------------------------------------------------------------------
-- Rozpoznanie po ASN 5617 zawodzi wszędzie poza siecią Marka: test z telefonu,
-- z kontenera albo z CI ląduje w kategorii „podszyci" i psuje statystykę.
--
-- DOPISUJEMY trzeci wzorzec zamiast podmieniać istniejące: wiersze oznaczone
-- wcześniej znacznikami `test-marek` i `Agrojelonki-Test` muszą dalej się
-- zgadzać, inaczej historia przestanie być porównywalna.

CREATE OR REPLACE FUNCTION public.ruch_wlasny(_asn INTEGER, _ua TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(_asn = 5617, false)
      OR COALESCE(_ua ILIKE '%test-agrojelonki%', false)
      OR COALESCE(_ua ILIKE '%test-marek%', false)
      OR COALESCE(_ua ILIKE '%Agrojelonki-Test%', false);
$$;

COMMENT ON FUNCTION public.ruch_wlasny(INTEGER, TEXT) IS
  'Czy to nasz własny ruch testowy. Znacznik w User-Agencie ma pierwszeństwo przed ASN, bo działa też z sieci komórkowej i z CI. Znacznik MUSI stać w części komentarzowej UA, po nazwie i wersji bota — worker trasuje po prefiksie nazwy, więc „ClaudeBot-test/1.0" dostałby skorupę zamiast mirrora.';

-- ---------------------------------------------------------------------------
-- CZĘŚĆ 2 — typ żądanej ścieżki
-- ---------------------------------------------------------------------------
-- Zapisywany NIEZALEŻNIE od statusu odpowiedzi: chcemy wiedzieć, o co pytano,
-- także wtedy gdy odbiło się od 404. To jest właśnie ten sygnał, który
-- rozdziela grupy bez patrzenia na adres IP.

ALTER TABLE public.bot_visits
  ADD COLUMN IF NOT EXISTS sciezka_typ TEXT;

COMMENT ON COLUMN public.bot_visits.sciezka_typ IS
  'sekret | kod | kanarek | tresc | techniczna | inne — czego bot szukał. Niezależne od weryfikacji tożsamości, więc działa dla operatorów bez list IP i bez FCrDNS.';

ALTER TABLE public.bot_visits DROP CONSTRAINT IF EXISTS bot_visits_sciezka_typ_chk;
ALTER TABLE public.bot_visits ADD CONSTRAINT bot_visits_sciezka_typ_chk
  CHECK (sciezka_typ IS NULL OR sciezka_typ IN
    ('sekret', 'kod', 'kanarek', 'tresc', 'techniczna', 'inne'));

CREATE OR REPLACE FUNCTION public.typ_sciezki(_sciezka TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    -- KANAREK pierwszy, bo leży pod /wewnetrzne/ i nie może wpaść do „inne".
    -- Żądanie tej ścieżki to potwierdzone zignorowanie robots.txt — sygnał
    -- czystszy niż weryfikacja IP i nie kosztuje ani jednego zapytania.
    WHEN _sciezka LIKE '/wewnetrzne/%' THEN 'kanarek'

    WHEN _sciezka ~* '(\.env|\.git/|/config\.(json|ya?ml|php)|token\.json|-adminsdk\.json|local_settings\.py|appsettings\.json|\.npmrc|netlify\.toml|/actuator/|/laravel/|wp-login\.php|/graphql|/wp-includes/|/wp-admin/)'
      THEN 'sekret'

    WHEN _sciezka ~* '(\.(js|ts|css)\.map$|^/assets/.*\.map$)' THEN 'kod'

    WHEN _sciezka ~* '^/(robots\.txt|llms\.txt|sitemap.*\.xml|favicon|humans\.txt|\.well-known/|[a-f0-9]{32}\.txt$)'
      THEN 'techniczna'

    WHEN _sciezka = '/'
      OR _sciezka ~* '^/(przepisy|kultury|prawo|poradnik|poradniki|pasze|serowarnie|przepisy-kulinarne)'
      OR _sciezka ~* '\.html$'
      OR _sciezka ~* '^/(baza-kultur|slownik|mleko-do-sera|nieudany-ser|solenie-sera|wedzenie-sera|woskowanie-sera|dojrzewalnia-z-lodowki|bakterie-kultury|zamienniki-kultur|kto-produkuje-kultury|porownywarka-kultur|sery-wege|klasyka-serowarstwa|klecki-jakosc-mleka|licznerski|encyklopedia-serowarstwo|serowarstwo-staropolskie|serwatka-dla-zwierzat|wady-mleka-a-wady-sera|organizacja-serowarni|chlorek-wapnia-do-mleka|sila-podpuszczki|gdzie-kupic-podpuszczke|etykieta-rhd|faktura-vat-rr|kalkulator)')
      THEN 'tresc'

    ELSE 'inne'
  END;
$$;

COMMENT ON FUNCTION public.typ_sciezki(TEXT) IS
  'Klasyfikuje żądaną ścieżkę. Kolejność WARUNKÓW MA ZNACZENIE: kanarek przed resztą, sekrety przed kodem, treść na końcu — inaczej /wewnetrzne/cos.html trafiłoby do „tresc" zamiast do „kanarek".';

-- Trigger liczy teraz trzy rzeczy naraz. Wszystkie w bazie z tego samego
-- powodu co `kategoria`: backfill i nowe wiersze muszą używać JEDNEJ
-- implementacji, bo dwie rozjadą się przy pierwszej zmianie listy wzorców.
CREATE OR REPLACE FUNCTION public.oznacz_wizyte_bota()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.kategoria   := public.kategoria_bota(NEW.bot);
  NEW.sciezka_typ := public.typ_sciezki(NEW.sciezka);
  NEW.wlasne      := public.ruch_wlasny(NEW.asn, NEW.ua);
  RETURN NEW;
END;
$$;

-- Backfill: typ ścieżki dla wszystkiego, `wlasne` tylko tam, gdzie nowy
-- znacznik zmienia wynik — istniejących oznaczeń nie ruszamy.
UPDATE public.bot_visits
SET sciezka_typ = public.typ_sciezki(sciezka)
WHERE sciezka_typ IS NULL;

UPDATE public.bot_visits
SET wlasne = true
WHERE NOT wlasne AND ua ILIKE '%test-agrojelonki%';

CREATE INDEX IF NOT EXISTS bot_visits_sciezka_typ_idx
  ON public.bot_visits (sciezka_typ) WHERE NOT wlasne;

-- ---------------------------------------------------------------------------
-- CZĘŚĆ 2.2 — wskaźnik błędów per agent
-- ---------------------------------------------------------------------------
-- ⚠ Zlecenie proponowało `count(distinct bot) over (partition by asn)`.
-- PostgreSQL NIE OBSŁUGUJE `DISTINCT` w funkcjach okna — takie zapytanie kończy
-- się błędem. Liczba tożsamości per ASN idzie więc z osobnego CTE i dołącza się
-- złączeniem.

CREATE OR REPLACE VIEW public.bot_sesje
WITH (security_invoker = true) AS
WITH tozsamosci AS (
  SELECT asn, count(DISTINCT bot) AS tozsamosci_z_asn
  FROM public.bot_visits
  WHERE NOT wlasne
  GROUP BY asn
)
SELECT v.asn,
       v.kraj,
       v.operator,
       v.bot,
       count(*)                                                    AS zadan,
       count(*) FILTER (WHERE v.status >= 400)                      AS odbite,
       round(100.0 * count(*) FILTER (WHERE v.status >= 400) / count(*), 1) AS proc_bledow,
       count(*) FILTER (WHERE v.sciezka_typ IN ('sekret', 'kod', 'kanarek')) AS prob_wrazliwych,
       max(t.tozsamosci_z_asn)                                      AS tozsamosci_z_asn,
       min(v.odwiedzono)                                            AS pierwsze,
       max(v.odwiedzono)                                            AS ostatnie
FROM public.bot_visits v
JOIN tozsamosci t ON t.asn IS NOT DISTINCT FROM v.asn
WHERE NOT v.wlasne
GROUP BY v.asn, v.kraj, v.operator, v.bot
ORDER BY zadan DESC;

COMMENT ON VIEW public.bot_sesje IS
  'Wskaźnik błędów per agent. Pomiar 09.2026: prawdziwe boty 0% błędów, podszywacze 52% — bo pierwsze idą po sitemapie, a drugie zgadują z listy. Podejrzenie: (proc_bledow > 30 AND zadan >= 5) OR prob_wrazliwych > 0 OR tozsamosci_z_asn >= 3. Pojedynczy warunek daje fałszywe alarmy — nowy crawler potrafi trafić na kilka 404 po zmianie struktury.';

-- ---------------------------------------------------------------------------
-- CZĘŚĆ 5 — utwardzenie: funkcje kasujące dane nie dla anonimów
-- ---------------------------------------------------------------------------
-- Audyt wykazał, że funkcje SECURITY DEFINER usuwające dane nie mają odebranych
-- uprawnień, a w Postgresie EXECUTE domyślnie przysługuje PUBLIC.
--
-- ŻADNA nie okazała się wykorzystywalna — cleanup_old_contact_attempts kasuje
-- wpisy starsze niż 24 h, a limit formularza patrzy na ostatnią godzinę, więc
-- wywołanie jej nie omija limitu. Mimo to funkcja, która KASUJE DANE, nie ma
-- powodu być otwarta dla świata. Jedna linijka, zero kosztu.

REVOKE ALL ON FUNCTION public.cleanup_old_contact_attempts()   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_analytics_retention()    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_bot_visits()             FROM PUBLIC, anon, authenticated;
