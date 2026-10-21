-- cultures: poprawka pojemnosci opakowania 11 kultur microMilk z Serowar.pl (21.10.2026)
--
-- Sklep pisze przy kazdej z nich: "Saszetka zawiera 10 doz producenta, kazda na
-- 100 litrow mleka. Cale opakowanie wystarcza na 1000 litrow mleka". Skrypt
-- scripts/pobierz-pojemnosc.py bral najmniejsza liczbe ze strony, czyli dawke,
-- i zapisal 100 zamiast 1000. Cena za litr wychodzila przez to 10 razy za wysoka
-- (np. ME: 0,50 zl/l zamiast 0,05 zl/l). Regula w skrypcie jest juz poprawiona.
--
-- Warunek pack_liters = 100 sprawia, ze drugie uruchomienie nic nie zmieni,
-- a gdyby ktos zmienil te wiersze w miedzyczasie, zostana nietkniete.

update public.cultures
set pack_liters = 1000,
    updated_at = now()
where shop = 'Serowar.pl'
  and name in ('CL', 'KFA1', 'KFB1/2', 'LHT', 'LHTB', 'LHTBME', 'MA', 'ME', 'MO', 'TB', 'TME')
  and pack_liters = 100;

-- Oczekiwany wynik: UPDATE 11
