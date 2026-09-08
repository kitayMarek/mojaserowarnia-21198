-- Poprawka do pub_raport_waga: stosunek liczony z dwoch roznych okresow.
--
-- Blad zobaczylem w pierwszym odczycie, w kilkanascie sekund po zastosowaniu
-- poprzedniej migracji — i jest to dokladnie ta sama pomylka co pulapka 6
-- w docs/pulapki.md, tylko od drugiej strony:
--
--   (bez podpisu)   wzialo 5969,4 kB   przyslalo 0,7 kB   stosunek 8408:1
--
-- Osiem tysiecy do jednego wyglada jak odkrycie. Nie jest. Kolumna "wzialo"
-- sumuje 30 dni, bo rozmiar odpowiedzi zapisujemy od zawsze, a kolumna
-- "przyslalo" sumuje dwie godziny, bo wage zadania mierzymy od dzisiejszego
-- wdrozenia. Podzielenie jednego przez drugie nie znaczy nic.
--
-- Poprawka: licznik i mianownik licza TE SAME wiersze — tylko te, w ktorych
-- waga zadania w ogole zostala zmierzona. Reszta kolumn zostaje na pelnym
-- okresie, bo tam to jest poprawne.

CREATE OR REPLACE FUNCTION public.pub_raport_waga(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  bot            TEXT,
  operator       TEXT,
  kategoria      TEXT,
  zadan          BIGINT,
  wzialo_kb      NUMERIC,
  przyslalo_kb   NUMERIC,
  zadan_z_waga   BIGINT,
  stosunek       NUMERIC,
  srednia_strona NUMERIC,
  najciezsza     TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  WITH pod_reka AS (
    SELECT v.bot, v.operator, v.kategoria, v.sciezka, v.rozmiar, v.rozmiar_zadania
    FROM public.bot_visits v
    WHERE NOT v.wlasne
      AND v.odwiedzono >= public.okres_od(okres)
      AND v.status = 200
  ),
  ciezkie AS (
    SELECT DISTINCT ON (p.bot) p.bot, p.sciezka
    FROM pod_reka p
    GROUP BY p.bot, p.sciezka
    ORDER BY p.bot, sum(p.rozmiar) DESC
  )
  SELECT p.bot, p.operator, p.kategoria,
         count(*),
         round(sum(p.rozmiar) / 1024.0, 1),
         round(sum(p.rozmiar_zadania) / 1024.0, 1),
         -- Ile zadan ma w ogole zmierzona wage. Gdy ta liczba jest mala wobec
         -- kolumny zadan, stosunek opiera sie na garstce wierszy i nie nadaje
         -- sie jeszcze do niczego. Dlatego stoi obok, a nie w komentarzu.
         count(*) FILTER (WHERE p.rozmiar_zadania IS NOT NULL),
         CASE WHEN sum(p.rozmiar_zadania) > 0 THEN
           round(sum(p.rozmiar) FILTER (WHERE p.rozmiar_zadania IS NOT NULL)::NUMERIC
                 / sum(p.rozmiar_zadania), 1)
         END,
         round(avg(p.rozmiar) / 1024.0, 1),
         max(c.sciezka)
  FROM pod_reka p
  LEFT JOIN ciezkie c ON c.bot = p.bot
  GROUP BY p.bot, p.operator, p.kategoria
  ORDER BY sum(p.rozmiar) DESC NULLS LAST;
$fn$;

COMMENT ON FUNCTION public.pub_raport_waga(TEXT) IS
  'Komu oddajemy transfer i w jakiej proporcji do tego, co przysyla. Stosunek liczony WYLACZNIE z wierszy, w ktorych zmierzono obie strony — kolumna zadan_z_waga mowi, na ilu wierszach stoi. To NIE jest rachunek za transfer: odpowiedzi z cache brzegowego nie docieraja do workera i tu ich nie ma, wiec roznica wobec panelu hostingu to miara tego, ile ruchu botow nas nie kosztuje.';

REVOKE ALL ON FUNCTION public.pub_raport_waga(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_waga(TEXT) TO anon, authenticated;
