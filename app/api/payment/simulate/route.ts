import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Mock Payment API Route — Step 7.5
// Simulates Stripe-like payment processing with test cards
// Writes subscription to DB on success
// ──────────────────────────────────────────────────────────

const DECLINED_CARDS = ['4000000000000002'];
const INSUFFICIENT_FUNDS = ['4000000000009995'];

export async function POST(req: NextRequest) {
  try {
    const { cardNumber, plan, userId } = await req.json();

    if (!cardNumber || !plan || !userId) {
      return NextResponse.json(
        {
          status: 'failed',
          error: {
            code: 'invalid_request',
            message: 'Missing required fields.',
          },
        },
        { status: 400 }
      );
    }

    // Strip spaces from card number
    const raw = cardNumber.replace(/\s/g, '');

    // Simulate processing delay (1.5 seconds)
    await new Promise((r) => setTimeout(r, 1500));

    // Check for declined cards
    if (DECLINED_CARDS.includes(raw)) {
      return NextResponse.json(
        {
          status: 'failed',
          error: {
            code: 'card_declined',
            message: 'Your card was declined. Please try another card.',
          },
        },
        { status: 402 }
      );
    }

    // Check for insufficient funds
    if (INSUFFICIENT_FUNDS.includes(raw)) {
      return NextResponse.json(
        {
          status: 'failed',
          error: {
            code: 'insufficient_funds',
            message:
              'Your card has insufficient funds. Please try another card.',
          },
        },
        { status: 402 }
      );
    }

    // Generate mock IDs
    const subscriptionId = `sub_mock_${Math.random().toString(36).slice(2, 10)}`;
    const customerId = `cus_mock_${Math.random().toString(36).slice(2, 10)}`;

    // Calculate period dates
    const now = Math.floor(Date.now() / 1000);
    const periodEnd = plan === 'yearly' ? now + 31536000 : now + 2592000;

    // Build the mock Stripe response
    const mockResponse = {
      status: 'succeeded',
      subscription: {
        id: subscriptionId,
        plan,
        current_period_start: now,
        current_period_end: periodEnd,
        status: 'active',
      },
      customer: {
        id: customerId,
        email: '', // filled by caller if needed
        userId,
      },
    };

    // Write subscription to database
    const { error: dbError } = await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        plan,
        status: 'active',
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        current_period_start: new Date(now * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (dbError) {
      console.error('Subscription DB error:', dbError);
      return NextResponse.json(
        {
          status: 'failed',
          error: {
            code: 'server_error',
            message:
              'An error occurred saving your subscription. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    // Send payment confirmation email
    // Must be awaited — unawaited fetches get killed when the route returns
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');
    try {
      const emailRes = await fetch(
        `${siteUrl}/api/email/payment-confirmation`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, plan }),
        }
      );
      if (!emailRes.ok) {
        const errBody = await emailRes.text();
        console.error(
          'Payment confirmation email failed:',
          emailRes.status,
          errBody
        );
      }
    } catch (err) {
      console.error('Payment confirmation email trigger failed:', err);
    }

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Payment simulate error:', error);
    return NextResponse.json(
      {
        status: 'failed',
        error: {
          code: 'server_error',
          message: 'Something went wrong. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
