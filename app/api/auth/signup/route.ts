import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Server-side Signup API
// Uses the Admin SDK to create users with auto-confirmation,
// bypassing Supabase's email rate limits on the free tier.
// The user is immediately confirmed and can log in.
// ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Create user via Admin API — auto-confirmed, no email sent
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm — skip email verification
        user_metadata: {
          full_name: fullName,
        },
      });

    if (createError) {
      // Handle common errors with user-friendly messages
      const msg = createError.message.toLowerCase();
      if (
        msg.includes('already') ||
        msg.includes('exists') ||
        msg.includes('duplicate')
      ) {
        return NextResponse.json(
          {
            error:
              'An account with this email already exists. Please log in instead.',
          },
          { status: 409 }
        );
      }
      console.error('Admin createUser error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser?.user) {
      return NextResponse.json(
        { error: 'Failed to create user.' },
        { status: 500 }
      );
    }

    // Create the user profile row in the 'users' table
    const { error: profileError } = await supabaseAdmin.from('users').upsert(
      {
        id: newUser.user.id,
        email: newUser.user.email,
        full_name: fullName,
        role: 'subscriber',
        charity_pct: 10,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.error('User profile creation error:', profileError);
      // Don't fail the signup — the profile can be created on first login
    }

    // Send welcome email (best-effort, via Resend)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');
    try {
      const emailRes = await fetch(`${siteUrl}/api/email/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUser.user.id,
          email: newUser.user.email,
          fullName,
        }),
      });
      const emailResult = await emailRes.json().catch(() => ({}));
      if (emailRes.ok) {
        console.log(`Welcome email sent to ${newUser.user.email}`);
      } else {
        console.error('Welcome email API error:', emailResult);
      }
    } catch (emailErr) {
      console.error('Welcome email trigger failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
