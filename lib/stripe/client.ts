import { loadStripe, type Stripe } from '@stripe/stripe-js';

// ──────────────────────────────────────────────────────────
// Stripe Client (browser-side) — Singleton
// Uses the publishable test key from env
// ──────────────────────────────────────────────────────────

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
