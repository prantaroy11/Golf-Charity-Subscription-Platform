-- ============================================================
-- Migration 009 — Prize Pool Table
-- Monthly prize pool totals per tier with rollover tracking
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
