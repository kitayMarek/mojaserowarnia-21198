-- Raport 9: po co boty przychodzą — treść w rozbiciu na kategorię bota.
--
-- ---------------------------------------------------------------------------
-- PYTANIE, NA KTÓRE ODPOWIADA
-- ---------------------------------------------------------------------------
-- „Które strony pobiera model, gdy człowiek zadał mu pytanie?"
--
-- To nie jest to samo co raport `co_odwiedzali`. Tamten miesza wszystko razem
-- i wychodzi z niego `/robots.txt` na pierwszym miejscu — prawdziwe, ale
-- bezużyteczne. Tutaj interesuje nas wyłącznie TREŚĆ i wyłącznie ruch
-- POTWIERDZONY, w rozbiciu na kategorię:
--
--   ai_uzytkownik  — człowiek zadał pytanie w czacie, model poszedł po stronę
--   ai_crawler     — model zbiera treść do indeksu, sam z siebie
--   wyszukiwarka   — klasyczne indeksowanie
--
-- Różnica między pierwszą a drugą kategorią jest tu całą stawką. Crawler bierze
-- wszystko po kolei; model odpowiadający człowiekowi bierze to, co jest
-- potrzebne DO ODPOWIEDZI. Druga lista jest listą tematów, o które ludzie
-- realnie pytają — z pierwszej ręki, bez pośrednictwa narzędzi SEO.
--
-- ---------------------------------------------------------------------------
-- PO CO POWSTAJE AKURAT TERAZ
-- ---------------------------------------------------------------------------
-- Do rozstrzygnięcia hipotezy postawionej 6 września: model potrzebuje ZDANIA
-- do zacytowania, a nie tabeli, bo z tabeli musiałby sam wyprodukować
-- twierdzenie — czyli zrobić dokładnie to, czego się modele oducza.
--
-- Jeśli w kolumnie `ai_uzytkownik` pojawi się `/zamienniki-kultur` (strona
-- z twierdzeniami: „53% kultur ma skład wspólny"), a nie pojawi się
-- `/baza-kultur` (tabela 188 pozycji) — hipoteza się broni i wiadomo, co pisać.
-- Jeśli będzie odwrotnie, hipoteza upada i też dobrze, bo przestajemy zgadywać.
--
-- Filtry są trzy i każdy ma powód:
--   zweryfikowany IS TRUE  — podszywacz nie mówi nic o zainteresowaniu treścią
--   status = 200           — pobranie, nie próba
--   sciezka_typ = 'tresc'  — bez robots.txt, sitemap i paczek budowania

CREATE OR REPLACE FUNCTION public.pub_raport_po_co_przychodza(okres TEXT DEFAULT '30d')
RETURNS TABLE (
  sciezka       TEXT,
  kategoria     TEXT,
  zadan         BIGINT,
  roznych_botow BIGINT,
  boty          TEXT[],
  czy_mirror    BOOLEAN,
  ostatnio      TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.sciezka,
         v.kategoria,
         count(*),
         count(DISTINCT v.bot),
         array_agg(DISTINCT v.bot),
         bool_or(v.mirror),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.zweryfikowany IS TRUE
    AND v.status = 200
    AND v.sciezka_typ = 'tresc'
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY v.sciezka, v.kategoria
  ORDER BY count(*) DESC
  LIMIT 200;
$$;

COMMENT ON FUNCTION public.pub_raport_po_co_przychodza(TEXT) IS
  'Które strony treściowe pobierają POTWIERDZONE boty, w rozbiciu na kategorię. Wiersze z kategorią ai_uzytkownik to strony, po które model sięgnął, bo człowiek zadał pytanie — najbliższe, co da się zmierzyć, temu, o co ludzie realnie pytają. Bez robots.txt i plików budowania, bo one zagłuszają obraz.';

REVOKE ALL ON FUNCTION public.pub_raport_po_co_przychodza(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_po_co_przychodza(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- całość, z podziałem na kategorie
--   select * from public.pub_raport_po_co_przychodza('all');
--
--   -- samo pytanie Marka: po co przychodzi model, gdy pyta człowiek
--   select sciezka, zadan, boty
--   from public.pub_raport_po_co_przychodza('all')
--   where kategoria = 'ai_uzytkownik'
--   order by zadan desc;
