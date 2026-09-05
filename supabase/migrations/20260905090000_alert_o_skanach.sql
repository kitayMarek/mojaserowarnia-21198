-- Codzienny alert o skanach podatności (Część 4 zlecenia).
--
-- Skan z AS1004 — 62 żądania, 5 podszytych tożsamości botów AI, 19 sekund —
-- wykryliśmy ręcznie i dopiero po fakcie. Widok `bot_skany` już go rozpoznaje;
-- tu dochodzi to, żeby zgłosił się sam.
--
-- ŻADNEGO KLUCZA NIE TRZEBA. Funkcja send-notification ma w config.toml
-- `verify_jwt = false`, więc nie wymaga nagłówka Authorization — sprawdzone
-- przed napisaniem tej migracji. Gdyby kiedyś to ustawienie się zmieniło,
-- wywołanie zacznie zwracać 401 i trzeba będzie dołożyć nagłówek z kluczem
-- (wtedy przez Vault, bo repozytorium jest publiczne).
--
-- CZEGO TU CELOWO NIE MA: automatycznego blokowania. Blokada po podpisie jest
-- bezwartościowa (podpis jest fałszywy z definicji), a po ASN ryzykowna — ten
-- sam operator obsługuje też legalny ruch. Skan z AS1004 nic nie zdobył, bo
-- pliki, których szukał, po prostu nie istnieją. To jest właściwa obrona:
-- nie mieć czego ukraść. Alert ma informować, nie reagować.

-- ---------------------------------------------------------------------------
-- 1. FUNKCJA ZGŁASZAJĄCA
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.zglos_skany_botow(_godzin INTEGER DEFAULT 24)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _tresc  TEXT := '';
  _ile    INTEGER := 0;
  _wiersz RECORD;
BEGIN
  -- Te same progi co w widoku bot_skany, ale zawężone do ostatnich godzin.
  -- Widok patrzy na całą historię, więc raz wykryty skan zgłaszałby się
  -- codziennie w nieskończoność.
  FOR _wiersz IN
    SELECT asn, kraj,
           count(*)                                     AS zadan,
           count(DISTINCT bot)                          AS tozsamosci,
           array_agg(DISTINCT bot)                      AS boty,
           count(*) FILTER (WHERE status IN (404, 410)) AS odbite,
           min(odwiedzono)                              AS start,
           max(odwiedzono) - min(odwiedzono)            AS trwalo
    FROM public.bot_visits
    WHERE NOT wlasne
      AND odwiedzono >= now() - make_interval(hours => _godzin)
    GROUP BY asn, kraj
    HAVING count(DISTINCT bot) >= 3
        OR count(*) > 40
        OR count(*) FILTER (WHERE sciezka ~* '(\.env|\.git/|\.js\.map$|token\.json|firebase-adminsdk|/actuator/|/laravel/|local_settings\.py|appsettings\.json|\.npmrc|wp-login\.php|/graphql)') > 0
    ORDER BY count(*) DESC
  LOOP
    _ile := _ile + 1;
    _tresc := _tresc
      || format('AS%s (%s): %s zadan, %s roznych tozsamosci botow, %s odbitych 404/410.',
                _wiersz.asn, coalesce(_wiersz.kraj, '?'), _wiersz.zadan,
                _wiersz.tozsamosci, _wiersz.odbite) || chr(10)
      || format('  Podpisy: %s', array_to_string(_wiersz.boty, ', ')) || chr(10)
      || format('  Start: %s, trwalo: %s', _wiersz.start, _wiersz.trwalo) || chr(10) || chr(10);
  END LOOP;

  IF _ile = 0 THEN
    RETURN 'brak zgloszen';
  END IF;

  PERFORM net.http_post(
    url := 'https://hsgxmbhunclhgzumafrk.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'recipients', jsonb_build_array('marek@fermly.pl'),
      'subject', format('mojaserowarnia.pl — %s podejrzanych zrodel w ostatnich %s h', _ile, _godzin),
      'message', _tresc
        || chr(10)
        || 'Nie blokujemy automatycznie — podpis User-Agent jest z definicji niewiarygodny,'  || chr(10)
        || 'a blokada po ASN uderzylaby tez w legalny ruch. Sprawdz, czy odbite 404/410'      || chr(10)
        || 'to nadal wszystkie zadania: jesli cokolwiek zwrocilo 200, to jest do zbadania.'   || chr(10) || chr(10)
        || 'Szczegoly: select * from bot_skany;'
    )
  );

  RETURN format('wyslano alert o %s zrodlach', _ile);
END;
$$;

COMMENT ON FUNCTION public.zglos_skany_botow(INTEGER) IS
  'Sprawdza ostatnie N godzin pod kątem skanowania i wysyła e-mail przez Edge Function send-notification. Zwraca "brak zgloszen" albo liczbę zgłoszonych źródeł, więc da się ją wywołać ręcznie i zobaczyć wynik bez czekania na crona.';

REVOKE ALL ON FUNCTION public.zglos_skany_botow(INTEGER) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. HARMONOGRAM
-- ---------------------------------------------------------------------------
-- Raz dziennie o 7:00 UTC. Okno 24 h pokrywa się z częstotliwością, więc żaden
-- skan nie wypadnie między uruchomieniami ani nie zgłosi się dwa razy.

SELECT cron.unschedule('alert-skany-botow')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'alert-skany-botow');

SELECT cron.schedule(
  'alert-skany-botow',
  '0 7 * * *',
  $cron$ SELECT public.zglos_skany_botow(24); $cron$
);
