-- Meta-ExternalAgent zapisywal sie z operatorem "inny", bo wpis powstal, zanim
-- licznik zaczal go weryfikowac po sieci AS32934. Weryfikacja byla poprawna,
-- mylil sie tylko podpis w raporcie "Kto byl". Worker zapisuje juz "Meta";
-- tu przepisanie historii.
UPDATE public.bot_visits
SET operator = 'Meta'
WHERE bot = 'Meta-ExternalAgent' AND operator = 'inny';
