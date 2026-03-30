-- ============================================================
-- Migration 007 — Draw Entries Table
-- Links users to draws they participated in, with their scores
-- ============================================================

create table public.draw_entries (
  id         uuid primary key default gen_random_uuid(),
  draw_id    uuid not null references public.draws(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  scores     integer[] not null,
  created_at timestamptz default now(),
  unique (draw_id, user_id)
);

-- Enable Row Level Security
alter table public.draw_entries enable row level security;

-- Policies
create policy "Users can read own entries"
  on public.draw_entries for select
  using (auth.uid() = user_id);
