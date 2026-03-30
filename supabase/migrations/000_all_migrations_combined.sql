-- ============================================================
-- GOLF CHARITY PLATFORM — COMBINED DATABASE MIGRATIONS
-- Run this file in the Supabase SQL Editor in one go.
-- It creates all 9 tables, RLS policies, foreign keys, 
-- and the auto-create user trigger.
-- ============================================================


-- ============================================================
-- 001 — Users Table
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
alter table public.users enable row level security;
create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);


-- ============================================================
-- 002 — Subscriptions Table
-- ============================================================
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  plan                    text not null check (plan in ('monthly','yearly')),
  status                  text not null check (status in ('pending','active','cancelled','lapsed')),
  stripe_subscription_id  text,
  stripe_customer_id      text,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "Users can read own subscription" on public.subscriptions for select using (auth.uid() = user_id);


-- ============================================================
-- 003 — Scores Table
-- ============================================================
create table public.scores (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  score      integer not null check (score between 1 and 45),
  played_at  date not null,
  created_at timestamptz default now()
);
alter table public.scores enable row level security;
create policy "Users can manage own scores" on public.scores for all using (auth.uid() = user_id);


-- ============================================================
-- 004 — Charities Table
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
alter table public.charities enable row level security;
create policy "Anyone can read charities" on public.charities for select using (true);


-- ============================================================
-- 005 — Charity Contributions Table
-- ============================================================
create table public.charity_contributions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  charity_id     uuid not null references public.charities(id),
  amount_pence   integer not null,
  period_month   text not null,
  created_at     timestamptz default now()
);
alter table public.charity_contributions enable row level security;
create policy "Users can read own contributions" on public.charity_contributions for select using (auth.uid() = user_id);


-- ============================================================
-- 006 — Draws Table
-- ============================================================
create table public.draws (
  id               uuid primary key default gen_random_uuid(),
  draw_month       text not null unique,
  numbers_drawn    integer[] not null default '{}',
  draw_type        text not null check (draw_type in ('random','algorithmic')),
  status           text not null check (status in ('draft','simulation','published')),
  jackpot_pool     integer default 0,
  four_match_pool  integer default 0,
  three_match_pool integer default 0,
  published_at     timestamptz,
  created_at       timestamptz default now()
);
alter table public.draws enable row level security;
create policy "Anyone can read published draws" on public.draws for select using (status = 'published');


-- ============================================================
-- 007 — Draw Entries Table
-- ============================================================
create table public.draw_entries (
  id         uuid primary key default gen_random_uuid(),
  draw_id    uuid not null references public.draws(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  scores     integer[] not null,
  created_at timestamptz default now(),
  unique (draw_id, user_id)
);
alter table public.draw_entries enable row level security;
create policy "Users can read own entries" on public.draw_entries for select using (auth.uid() = user_id);


-- ============================================================
-- 008 — Winners Table
-- ============================================================
create table public.winners (
  id              uuid primary key default gen_random_uuid(),
  draw_id         uuid not null references public.draws(id),
  user_id         uuid not null references public.users(id),
  match_tier      text not null check (match_tier in ('five','four','three')),
  prize_amount    integer not null,
  payout_status   text not null default 'pending' check (payout_status in ('pending','verified','paid','rejected')),
  proof_url       text,
  admin_notes     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.winners enable row level security;
create policy "Users can read own winnings" on public.winners for select using (auth.uid() = user_id);


-- ============================================================
-- 009 — Prize Pool Table
-- ============================================================
create table public.prize_pool (
  id                  uuid primary key default gen_random_uuid(),
  draw_month          text not null unique,
  total_pool          integer default 0,
  jackpot_amount      integer default 0,
  four_match_amount   integer default 0,
  three_match_amount  integer default 0,
  jackpot_rolled_over boolean default false,
  created_at          timestamptz default now()
);


-- ============================================================
-- 010 — Foreign Keys & Auto-Create User Trigger
-- ============================================================

-- Add FK from users.charity_id → charities.id
alter table public.users
  add constraint users_charity_id_fkey
  foreign key (charity_id) references public.charities(id);

-- Auto-create public.users row on auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
