-- ============================================================
-- Migration 001 — Users Table
-- Extends auth.users with profile data, role, and charity link
-- ============================================================

create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  role         text not null default 'subscriber' check (role in ('subscriber','admin')),
  charity_id   uuid,
  charity_pct  integer not null default 10 check (charity_pct between 10 and 100),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Policies
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);
