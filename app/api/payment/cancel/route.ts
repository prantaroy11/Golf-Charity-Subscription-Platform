import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

// ──────────────────────────────────────────────────────────
// Cancel Subscription API — Real Stripe Integration
// Cancels the Stripe subscription at period end and
// updates the DB status to 'cancelled'
// ──────────────────────────────────────────────────────────

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get the user's active subscription
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      );
    }

    // Cancel the real Stripe subscription at period end
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      } catch (stripeErr) {
        console.error('Stripe cancellation error:', stripeErr);
        // If Stripe call fails (e.g. sub already cancelled), still update DB
      }
    }

    // Update subscription status in DB
    const { error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (dbError) {
      console.error('Cancel subscription error:', dbError);
      return NextResponse.json(
        { error: 'Failed to cancel subscription.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: 'cancelled' });
  } catch (error) {
    console.error('Cancel API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
