import { Resend } from 'resend';

// ──────────────────────────────────────────────────────────
// Email utility — shared Resend client and sender config
// ──────────────────────────────────────────────────────────

// Lazy-init the Resend client so it doesn't crash at build time
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn(
        'RESEND_API_KEY is not set. Email sending will fail at runtime.'
      );
    }
    _resend = new Resend(key);
  }
  return _resend;
}

// Keep backward-compatible export (uses lazy init)
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return (getResend() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Default sender address — uses Resend's testing domain unless configured
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Golf Charity Platform <onboarding@resend.dev>';

// Site URL for email links — supports Vercel deployment
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export const SITE_URL = getSiteUrl();

// Format month string (e.g. '2026-03') to readable format (e.g. 'March 2026')
export function formatDrawMonth(drawMonth: string): string {
  const [year, month] = drawMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// Format pence to GBP string (e.g. 5000 → '₹50.00')
export function formatPence(pence: number): string {
  return `₹${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

// Format ISO date to readable date (e.g. '3 April 2026')
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
