import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { resend, EMAIL_FROM, SITE_URL } from '@/lib/email';
import WelcomeEmail from '@/emails/WelcomeEmail';

// ──────────────────────────────────────────────────────────
// Email Trigger: Welcome — Step 12.3
// POST /api/email/welcome
// Sends WelcomeEmail to a newly registered user
// Intended to be called from auth callback or after signup
// ──────────────────────────────────────────────────────────

interface WelcomeRequest {
  userId: string;
  email?: string;
  fullName?: string;
}

export async function POST(req: NextRequest) {
  // This route accepts internal calls — verify via a simple
  // internal token or allow unauthenticated for system triggers.
  // In production, you'd add an internal API key check.

  let body: WelcomeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { userId, email: providedEmail, fullName: providedName } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    // Look up user info if not provided
    let email = providedEmail;
    let fullName = providedName;

    if (!email || !fullName) {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      email = email ?? user.email;
      fullName = fullName ?? user.full_name ?? 'there';
    }

    // Send welcome email
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email!,
      subject: 'Welcome to the Golf Charity Platform 🏌️',
      react: WelcomeEmail({
        fullName: fullName ?? 'there',
        siteUrl: SITE_URL,
      }),
    });

    if (emailError) {
      console.error('Welcome email error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sentTo: email,
    });
  } catch (err) {
    console.error('Welcome email error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
