-- ============================================================
-- Migration 002 — Subscriptions Table
-- Tracks user subscription plans, status, and Stripe references
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

-- Enable Row Level Security
alter table public.subscriptions enable row level security;

-- Policies
create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
