-- Etap 2 planu huba (4.11.2026): kopia sklepów dostaje numer podmiotu z huba.
-- Odczyt po sklep_id działa jak dotąd, przejście na czlonek_id to Etap 3.
-- Bez klucza obcego, bo tabela czlonkowie jest w innej bazie, w bazie huba.
-- URUCHOMIĆ w Supabase SQL editor (projekt Serowarni). Idempotentne.

alter table public.sklepy_z_huba add column if not exists czlonek_id uuid;
