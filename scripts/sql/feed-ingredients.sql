-- Składniki paszowe zgłaszane przez użytkowników (baza wzorcowa 124 jest w pliku aplikacji;
-- tu trzymamy TYLKO dodatki od userów: pending -> moderacja -> approved -> widoczne dla wszystkich).

create table if not exists public.feed_ingredients (
  id           uuid primary key default gen_random_uuid(),
  nazwa        text not null,
  kategoria    text,
  em           numeric, bialko numeric, ca numeric, p numeric, wlokno numeric,
  na           numeric, k numeric, mg numeric, mn numeric, zn numeric, se numeric, fe numeric, i numeric,
  zrodlo       text,                       -- skąd user wziął skład (etykieta / link)
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.feed_ingredients enable row level security;

-- 1) Zatwierdzone widzą WSZYSCY (także niezalogowani) — to zasila kalkulator.
create policy "feed_approved_readable_by_everyone"
  on public.feed_ingredients for select
  using (status = 'approved');

-- 2) Zalogowany widzi też swoje zgłoszenia (pending/rejected).
create policy "feed_own_visible_to_author"
  on public.feed_ingredients for select
  to authenticated
  using (submitted_by = auth.uid());

-- 3) Zalogowany może zgłaszać — wymuszamy status pending i siebie jako autora.
create policy "feed_insert_by_authenticated"
  on public.feed_ingredients for insert
  to authenticated
  with check (submitted_by = auth.uid() and status = 'pending');

-- 4) Admin: pełny dostęp (widzi wszystko + moderuje).
create policy "feed_admin_full_access"
  on public.feed_ingredients for all
  to authenticated
  using (public.has_role(_user_id := auth.uid(), _role := 'admin'))
  with check (public.has_role(_user_id := auth.uid(), _role := 'admin'));

create index if not exists feed_ingredients_status_idx on public.feed_ingredients (status);
