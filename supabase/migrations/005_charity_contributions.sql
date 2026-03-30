-- ============================================================
-- Migration 005 — Charity Contributions Table
-- Tracks per-user, per-month charity contributions in pence
-- ============================================================

create table public.charity_contributions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  charity_id     uuid not null references public.charities(id),
  amount_pence   integer not null,
  period_month   text not null, -- e.g. '2026-03'
  created_at     timestamptz default now()
);

-- Enable Row Level Security
alter table public.charity_contributions enable row level security;

-- Policies
create policy "Users can read own contributions"
  on public.charity_contributions for select
  using (auth.uid() = user_id);
