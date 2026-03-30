-- ============================================================
-- Migration 003 — Scores Table
-- Stores up to 5 Stableford golf scores per user (rolling window)
-- ============================================================

create table public.scores (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  score      integer not null check (score between 1 and 45),
  played_at  date not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.scores enable row level security;

-- Policies — users can fully manage their own scores
create policy "Users can manage own scores"
  on public.scores for all
  using (auth.uid() = user_id);
