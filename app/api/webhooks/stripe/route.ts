import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

// ──────────────────────────────────────────────────────────
// Stripe Webhook Handler
// Processes events from Stripe (checkout.session.completed,
// customer.subscription.updated/deleted, invoice.payment_failed)
// and syncs subscription state to Supabase.
// ──────────────────────────────────────────────────────────

// Stripe sends raw body — disable Next.js body parsing
export const dynamic = 'force-dynamic';

// ── Helper: extract period dates from SubscriptionItem ───
// In Stripe SDK v21+, current_period_start/end moved from
// Subscription to SubscriptionItem level.
function getPeriodDates(subscription: Stripe.Subscription) {
  const item = subscription.items?.data?.[0];
  const start = item?.current_period_start ?? subscription.start_date;
  const end = item?.current_period_end ?? subscription.start_date;
  return {
    periodStart: new Date(start * 1000).toISOString(),
    periodEnd: new Date(end * 1000).toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('Stripe webhook: missing signature');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // ── Checkout completed → activate subscription ────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.error('Webhook: missing metadata', session.metadata);
          break;
        }

        // Retrieve the full subscription from Stripe (with items expanded)
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId,
          {
            expand: ['items.data'],
          }
        );

        const { periodStart, periodEnd } = getPeriodDates(subscription);

        // Upsert subscription record in Supabase
        const { error: dbError } = await supabaseAdmin
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan,
              status: 'active',
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (dbError) {
          console.error('Webhook: DB upsert error', dbError);
        } else {
          console.log(
            `Webhook: Subscription activated for user ${userId} (${plan})`
          );
        }

        // Send payment confirmation email (best-effort)
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
          console.error('Webhook: Email trigger failed', emailErr);
        }

        break;
      }

      // ── Subscription updated (renewal, plan change) ───────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        // Map Stripe status to our status
        let dbStatus: string = 'active';
        if (
          subscription.status === 'canceled' ||
          subscription.status === 'unpaid'
        ) {
          dbStatus = 'cancelled';
        } else if (
          subscription.status === 'past_due' ||
          subscription.status === 'incomplete_expired'
        ) {
          dbStatus = 'lapsed';
        }

        const { periodStart, periodEnd } = getPeriodDates(subscription);

        if (!userId) {
          // Try to find user by stripe customer id
          const customerId =
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer.toString();

          const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (!existingSub) {
            console.error(
              'Webhook: Cannot find user for subscription update',
              subscription.id
            );
            break;
          }

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: dbStatus,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', existingSub.user_id);

          break;
        }

        // userId is in metadata directly
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: dbStatus,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        console.log(
          `Webhook: Subscription updated for user ${userId} — ${dbStatus}`
        );
        break;
      }

      // ── Subscription deleted (cancelled & expired) ────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.toString();

        const targetUserId = userId;

        if (targetUserId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', targetUserId);
        } else {
          // Fallback: find by customer ID
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }

        console.log(`Webhook: Subscription deleted for customer ${customerId}`);
        break;
      }

      // ── Invoice payment failed ────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.toString();

        if (customerId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'lapsed',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);

          console.log(
            `Webhook: Payment failed for customer ${customerId} — set to lapsed`
          );
        }
        break;
      }

      default:
        console.log(`Webhook: Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
