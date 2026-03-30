-- ============================================================
-- Migration 004 — Charities Table
-- Public charity listings with optional featured flag
-- ============================================================

create table public.charities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  logo_url    text,
  website     text,
  is_featured boolean default false,
  created_at  timestamptz default now()
);

-- Enable Row Level Security
alter table public.charities enable row level security;

-- Policies — anyone can read charities (public directory)
create policy "Anyone can read charities"
  on public.charities for select
  using (true);
