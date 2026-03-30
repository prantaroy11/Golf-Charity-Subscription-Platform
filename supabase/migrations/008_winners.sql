-- ============================================================
-- Migration 008 — Winners Table
-- Tracks draw winners, match tiers, prizes, and payout status
-- ============================================================

create table public.winners (
  id              uuid primary key default gen_random_uuid(),
  draw_id         uuid not null references public.draws(id),
  user_id         uuid not null references public.users(id),
  match_tier      text not null check (match_tier in ('five','four','three')),
  prize_amount    integer not null, -- in pence
  payout_status   text not null default 'pending' check (payout_status in ('pending','verified','paid','rejected')),
  proof_url       text,
  admin_notes     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Enable Row Level Security
alter table public.winners enable row level security;

-- Policies
create policy "Users can read own winnings"
  on public.winners for select
  using (auth.uid() = user_id);
