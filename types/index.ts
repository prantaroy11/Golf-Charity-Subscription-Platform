// ──────────────────────────────────────────────────────────
// Shared TypeScript Types — Golf Charity Subscription Platform
// ──────────────────────────────────────────────────────────

// ── Status Enums ──────────────────────────────────────────

export type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'lapsed';
export type DrawStatus = 'draft' | 'simulation' | 'published';
export type PaymentState = 'idle' | 'processing' | 'success' | 'failed';
export type MatchTier = 'five' | 'four' | 'three';
export type PayoutStatus = 'pending' | 'verified' | 'paid' | 'rejected';
export type UserRole = 'subscriber' | 'admin';
export type PlanType = 'monthly' | 'yearly';
export type DrawType = 'random' | 'algorithmic';

// ── Database Models ───────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  charity_id: string | null;
  charity_pct: number;
  created_at: string;
  updated_at: string;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  played_at: string;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  amount_pence: number;
  period_month: string;
  created_at: string;
}

export interface Draw {
  id: string;
  draw_month: string;
  numbers_drawn: number[];
  draw_type: DrawType;
  status: DrawStatus;
  jackpot_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  published_at: string | null;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  scores: number[];
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_tier: MatchTier;
  prize_amount: number;
  payout_status: PayoutStatus;
  proof_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrizePool {
  id: string;
  draw_month: string;
  total_pool: number;
  jackpot_amount: number;
  four_match_amount: number;
  three_match_amount: number;
  jackpot_rolled_over: boolean;
  created_at: string;
}
