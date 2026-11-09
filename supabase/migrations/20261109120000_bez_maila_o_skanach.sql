-- Koniec codziennego maila o skanach botów (decyzja Marka, 9.11.2026:
-- „i tak nic z tym nie robimy, a zaśmiecają skrzynkę”).
--
-- Wyłączone jest tylko zadanie cron, które o 7:00 UTC wysyłało na marek@fermly.pl
-- listę „podejrzanych źródeł” z 20260905090000_alert_o_skanach.sql.
-- Licznik botów liczy dalej: bot_visits, widok bot_skany i funkcja
-- zglos_skany_botow zostają, więc skany da się obejrzeć ręcznie:
--   select * from bot_skany;
--
-- Zostaje też alarm-cisza-licznikow (6:45 UTC): on pisze tylko wtedy, gdy licznik
-- przestanie liczyć, czyli prawie nigdy.
--
-- Powrót maila: cron.schedule z 20260905090000_alert_o_skanach.sql.

SELECT cron.unschedule('alert-skany-botow')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'alert-skany-botow');
