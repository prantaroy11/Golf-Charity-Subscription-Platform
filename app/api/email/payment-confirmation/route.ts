import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  resend,
  EMAIL_FROM,
  SITE_URL,
  formatDate,
  formatPence,
} from '@/lib/email';
import PaymentConfirmationEmail from '@/emails/PaymentConfirmationEmail';

// ──────────────────────────────────────────────────────────
// Email Trigger: Payment Confirmation — Step 12.3
// POST /api/email/payment-confirmation
// Sends PaymentConfirmationEmail after successful payment
// ──────────────────────────────────────────────────────────

interface PaymentConfirmationRequest {
  userId: string;
  plan: 'monthly' | 'yearly';
}

export async function POST(req: NextRequest) {
  let body: PaymentConfirmationRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { userId, plan } = body;

  if (!userId || !plan) {
    return NextResponse.json(
      { error: 'userId and plan are required' },
      { status: 400 }
    );
  }

  try {
    // Fetch user info
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, full_name, charity_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch subscription for renewal info
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    // Fetch charity name if user has one selected
    let charityName: string | undefined;
    if (user.charity_id) {
      const { data: charity } = await supabaseAdmin
        .from('charities')
        .select('name')
        .eq('id', user.charity_id)
        .single();
      charityName = charity?.name;
    }

    // Calculate price
    const amount = plan === 'yearly' ? '£99.99' : '£9.99';
    const nextRenewalDate = sub?.current_period_end
      ? formatDate(sub.current_period_end)
      : 'Next month';

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: `Payment Confirmed — ${plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
      react: PaymentConfirmationEmail({
        fullName: user.full_name ?? 'there',
        plan,
        amount,
        nextRenewalDate,
        charityName,
        siteUrl: SITE_URL,
      }),
    });

    if (emailError) {
      console.error('Payment confirmation email error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send payment confirmation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sentTo: user.email,
    });
  } catch (err) {
    console.error('Payment confirmation email error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
