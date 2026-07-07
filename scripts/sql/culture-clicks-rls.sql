-- ============================================================
-- culture_clicks — RLS pod afiliację (pomiar przejść do sklepów)
-- Uruchom w Supabase (Lovable → SQL Editor). Idempotentne.
--
-- Tabela culture_clicks JUŻ istnieje (BuyButton do niej pisze).
-- Ten skrypt tylko upewnia się, że:
--   1) każdy odwiedzający (anon) MOŻE dopisać kliknięcie (insert),
--   2) tylko admin MOŻE odczytać dane (select) — pod panel /admin/klikniecia.
-- Nikt (poza adminem) nie może czytać, aktualizować ani kasować logu.
-- ============================================================

alter table public.culture_clicks enable row level security;

-- 1) INSERT dla wszystkich (log kliknięć z BuyButton — fire-and-forget)
drop policy if exists "culture_clicks_insert_anyone" on public.culture_clicks;
create policy "culture_clicks_insert_anyone"
  on public.culture_clicks for insert
  to anon, authenticated
  with check (true);

-- 2) SELECT tylko dla admina (panel statystyk)
drop policy if exists "culture_clicks_admin_read" on public.culture_clicks;
create policy "culture_clicks_admin_read"
  on public.culture_clicks for select
  to authenticated
  using (public.has_role(_user_id := auth.uid(), _role := 'admin'));

-- (Świadomie brak polityk UPDATE/DELETE — logu nikt nie modyfikuje.)
