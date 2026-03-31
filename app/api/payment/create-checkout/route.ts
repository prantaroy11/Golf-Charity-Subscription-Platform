import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

// ──────────────────────────────────────────────────────────
// Create Stripe Checkout Session
// Creates a Stripe Checkout session for subscription payment
// Uses Stripe test mode — no real charges
// ──────────────────────────────────────────────────────────

// Stripe Price IDs will be created on-the-fly using price_data
// so we don't need pre-created products in Stripe Dashboard.

const PLAN_CONFIG = {
  monthly: {
    amount: 999, // ₹9.99 in pence
    interval: 'month' as const,
    label: 'Monthly Plan',
  },
  yearly: {
    amount: 9999, // ₹99.99 in pence
    interval: 'year' as const,
    label: 'Yearly Plan',
  },
};

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]) {
      return NextResponse.json(
        { error: 'Invalid plan selected.' },
        { status: 400 }
      );
    }

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');

    // Check if we already have a Stripe customer for this user
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    // Validate the stored customer ID with Stripe.
    // It may be a mock/simulated ID (e.g. 'cus_mock_...') or
    // a deleted customer — in either case, create a new one.
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch {
        console.warn(
          `Stored customer ${customerId} is invalid — creating new Stripe customer`
        );
        customerId = null;
      }
    }

    // Create a new Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Golf Charity Platform — ${config.label}`,
              description:
                'Monthly prize draws, score tracking, and charitable giving.',
            },
            unit_amount: config.amount,
            recurring: {
              interval: config.interval,
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      },
      success_url: `${siteUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/subscribe`,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
