-- ============================================================
-- Migration 006 — Draws Table
-- Monthly prize draws with number generation and pool tracking
-- ============================================================

create table public.draws (
  id               uuid primary key default gen_random_uuid(),
  draw_month       text not null unique, -- e.g. '2026-03'
  numbers_drawn    integer[] not null default '{}',
  draw_type        text not null check (draw_type in ('random','algorithmic')),
  status           text not null check (status in ('draft','simulation','published')),
  jackpot_pool     integer default 0,
  four_match_pool  integer default 0,
  three_match_pool integer default 0,
  published_at     timestamptz,
  created_at       timestamptz default now()
);

-- Enable Row Level Security
alter table public.draws enable row level security;

-- Policies — only published draws are publicly visible
create policy "Anyone can read published draws"
  on public.draws for select
  using (status = 'published');
