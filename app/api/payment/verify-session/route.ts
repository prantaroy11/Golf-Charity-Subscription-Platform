import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Verify Stripe Checkout Session
// Called by the success page to retrieve session details.
// Also upserts the subscription record in Supabase as a
// fallback — in local dev, webhooks can't reach localhost,
// so this ensures the subscription is always activated.
// ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.items'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const plan = session.metadata?.plan || 'monthly';
    const userId = session.metadata?.supabase_user_id;
    const subscription = session.subscription as
      | import('stripe').Stripe.Subscription
      | null;

    const firstItem = subscription?.items?.data?.[0];

    const amount = subscription
      ? `₹${((firstItem?.price?.unit_amount ?? 0) / 100).toFixed(2)}`
      : plan === 'yearly'
        ? '₹99.99'
        : '₹9.99';

    const periodStart = firstItem?.current_period_start;
    const periodEnd = firstItem?.current_period_end;

    const renewalDate = periodEnd
      ? new Date(periodEnd * 1000).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

    // ── Fallback: upsert subscription to Supabase ────────
    // This ensures the subscription record exists even if
    // the Stripe webhook hasn't fired yet (e.g. local dev).
    // The webhook handler does the same upsert, so this is
    // idempotent and safe to run in parallel.
    if (userId && subscription) {
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : subscription.id;

      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : String(session.customer);

      const upsertData: Record<string, unknown> = {
        user_id: userId,
        plan,
        status: 'active',
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      };

      if (periodStart) {
        upsertData.current_period_start = new Date(
          periodStart * 1000
        ).toISOString();
      }
      if (periodEnd) {
        upsertData.current_period_end = new Date(
          periodEnd * 1000
        ).toISOString();
      }

      const { error: dbError } = await supabaseAdmin
        .from('subscriptions')
        .upsert(upsertData, { onConflict: 'user_id' });

      if (dbError) {
        console.error('Verify-session: DB upsert fallback error', dbError);
      } else {
        console.log(
          `Verify-session: Subscription activated for user ${userId} (fallback)`
        );

        // Send payment confirmation email (best-effort)
        // In local dev, webhooks can't reach localhost so we
        // trigger the email here as a fallback.
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ??
          (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000');
        try {
          await fetch(`${siteUrl}/api/email/payment-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, plan }),
          });
        } catch (emailErr) {
          console.error('Payment confirmation email failed:', emailErr);
        }
      }
    }

    return NextResponse.json({
      plan: plan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan',
      amount,
      renewalDate,
      status: 'active',
    });
  } catch (error) {
    console.error('Verify session error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
