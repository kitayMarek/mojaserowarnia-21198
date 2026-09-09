-- O co pytaja skanery — jawnie, zeby inni wiedzieli czego pilnowac.
--
-- ---------------------------------------------------------------------------
-- DLACZEGO ZMIENIAMY WCZESNIEJSZA DECYZJE
-- ---------------------------------------------------------------------------
-- Do tej pory na stronie stalo: "sciezek, o ktore pytaja skanery, nie
-- publikujemy, bo bylyby gotowa mapa dla nastepnego". Brzmialo ostroznie,
-- ale przy blizszym spojrzeniu nie broni sie:
--
-- Adresy w rodzaju /.env, /.git/config czy /wp-login.php sa w slowniku KAZDEGO
-- skanera od lat. Pokazanie ich nie uczy napastnika niczego, czego by nie
-- wiedzial — a uczy wlasciciela strony, czego u siebie poszukac.
--
-- Milczenie zostawia te wiedze wylacznie tym, ktorzy z niej korzystaja. To ten
-- sam argument, ktory postawilismy przy podszywaniu sie pod boty.
--
-- ---------------------------------------------------------------------------
-- ⚠ DWA WARUNKI, KTORE MUSZA ZOSTAC
-- ---------------------------------------------------------------------------
-- 1. TYLKO SCIEZKI, KTORE DOSTALY BLAD. Publikujemy wylacznie to, czego u nas
--    NIE MA. Sciezka, ktora oddala 200, nigdy sie tu nie pojawi — pokazanie
--    jej byloby reklama, a nie ostrzezeniem. To jest cala roznica miedzy
--    "oto czego szukaja" a "oto co u mnie znajdziesz".
--
-- 2. NIGDY KANARKA. Sciezka-pulapka lezy pod /wewnetrzne/ i sluzy do wykrywania
--    botow ignorujacych robots.txt. Opublikowana przestaje byc pulapka
--    natychmiast i bezpowrotnie. Wyklucza ja warunek sciezka_typ, ktory
--    dopuszcza tylko 'sekret' i 'kod'.

CREATE OR REPLACE FUNCTION public.pub_raport_czego_szukaja(okres TEXT DEFAULT '30d')
RETURNS TABLE (
  sciezka        TEXT,
  czego_szuka    TEXT,
  zadan          BIGINT,
  roznych_sieci  BIGINT,
  ostatnio       TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  SELECT v.sciezka,
         CASE
           WHEN v.sciezka ~* '\.env'          THEN 'hasla i klucze do bazy'
           WHEN v.sciezka ~* '\.git'          THEN 'kod zrodlowy i historia zmian'
           WHEN v.sciezka ~* 'wp-login|wp-admin|wp-includes'
                                              THEN 'panel WordPressa'
           WHEN v.sciezka ~* 'config\.(json|ya?ml|php)|appsettings|local_settings'
                                              THEN 'plik konfiguracyjny'
           WHEN v.sciezka ~* 'adminsdk|token\.json|\.npmrc'
                                              THEN 'klucze do uslug zewnetrznych'
           WHEN v.sciezka ~* '/actuator/'     THEN 'panel diagnostyczny aplikacji Java'
           WHEN v.sciezka ~* 'graphql'        THEN 'punkt dostepu do danych'
           WHEN v.sciezka ~* '\.map$'         THEN 'mapy kodu zrodlowego'
           ELSE 'inne'
         END,
         count(*),
         count(DISTINCT v.asn),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
    -- ⚠ Kanarek ('kanarek') celowo poza zakresem — patrz naglowek.
    AND v.sciezka_typ IN ('sekret', 'kod')
    -- ⚠ TYLKO to, czego u nas nie ma. Bez tego warunku raport bylby mapa.
    AND v.status >= 400
  GROUP BY v.sciezka
  ORDER BY count(*) DESC
  LIMIT 60;
$fn$;

COMMENT ON FUNCTION public.pub_raport_czego_szukaja(TEXT) IS
  'Czego szukaja skanery na tej stronie — WYLACZNIE sciezki, ktore dostaly blad, czyli takich plikow u nas nie ma. Sciezka, ktora oddala 200, nie pojawi sie tu nigdy: to byloby reklama zamiast ostrzezenia. Sciezka-pulapka wykluczona osobnym warunkiem, bo opublikowana przestaje dzialac.';

REVOKE ALL ON FUNCTION public.pub_raport_czego_szukaja(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_czego_szukaja(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_czego_szukaja('30d') limit 20;
--
--   -- kontrola bezpieczenstwa: ma byc 0 wierszy
--   select count(*) from public.bot_visits
--   where sciezka_typ = 'kanarek' and status < 400;
