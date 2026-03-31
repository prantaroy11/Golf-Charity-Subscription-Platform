import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { resend, EMAIL_FROM, SITE_URL, formatDate } from '@/lib/email';
import RenewalReminderEmail from '@/emails/RenewalReminderEmail';

// ──────────────────────────────────────────────────────────
// Email Trigger: Renewal Reminder — Step 12.3
// POST /api/email/renewal-reminder
// Admin-only: sends renewal reminder to subscribers
// whose subscription renews within 3 days
// ──────────────────────────────────────────────────────────

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return null;
  return user;
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate 3-day window
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Fetch all active subscriptions that renew within 3 days
    const { data: subs, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*, users:user_id(id, email, full_name)')
      .eq('status', 'active')
      .gte('current_period_end', now.toISOString())
      .lte('current_period_end', threeDaysFromNow.toISOString());

    if (subError) {
      console.error('Subscription fetch error:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions renewing within 3 days',
        sent: 0,
      });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of subs) {
      const user = sub.users as {
        id: string;
        email: string;
        full_name: string | null;
      } | null;

      if (!user?.email) {
        failed++;
        continue;
      }

      const amount = sub.plan === 'yearly' ? '₹99.99' : '₹9.99';

      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: `Subscription Renewal Reminder — ${formatDate(sub.current_period_end)}`,
          react: RenewalReminderEmail({
            fullName: user.full_name ?? 'there',
            plan: sub.plan,
            renewalDate: formatDate(sub.current_period_end),
            amount,
            siteUrl: SITE_URL,
          }),
        });
        sent++;
      } catch (err) {
        failed++;
        errors.push(
          `${user.email}: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      totalEligible: subs.length,
      sent,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (err) {
    console.error('Renewal reminder email error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
