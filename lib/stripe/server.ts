import Stripe from 'stripe';

// ──────────────────────────────────────────────────────────
// Stripe Server SDK — Singleton
// Uses the secret test key from env (sk_test_...)
// ──────────────────────────────────────────────────────────

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});
