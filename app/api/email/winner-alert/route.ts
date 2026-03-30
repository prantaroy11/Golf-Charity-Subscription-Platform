import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { resend, EMAIL_FROM, SITE_URL, formatDrawMonth } from '@/lib/email';
import WinnerAlertEmail from '@/emails/WinnerAlertEmail';

// ──────────────────────────────────────────────────────────
// Email Trigger: Winner Alert — Step 12.2
// POST /api/email/winner-alert
// Sends WinnerAlertEmail to a specific winner
// ──────────────────────────────────────────────────────────

interface WinnerAlertRequest {
  winnerId: string;
}

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
  // Verify admin or system call
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: WinnerAlertRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { winnerId } = body;

  if (!winnerId) {
    return NextResponse.json(
      { error: 'winnerId is required' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch winner with user and draw info
    const { data: winner, error: winnerError } = await supabaseAdmin
      .from('winners')
      .select(
        '*, users:user_id(id, email, full_name), draws:draw_id(draw_month, numbers_drawn)'
      )
      .eq('id', winnerId)
      .single();

    if (winnerError || !winner) {
      return NextResponse.json({ error: 'Winner not found' }, { status: 404 });
    }

    const user = winner.users as {
      id: string;
      email: string;
      full_name: string | null;
    } | null;

    const draw = winner.draws as {
      draw_month: string;
      numbers_drawn: number[];
    } | null;

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Winner has no email address' },
        { status: 400 }
      );
    }

    if (!draw) {
      return NextResponse.json(
        { error: 'Draw information not found' },
        { status: 400 }
      );
    }

    const formattedMonth = formatDrawMonth(draw.draw_month);
    const matchTier = winner.match_tier as 'five' | 'four' | 'three';
    const matchCount = matchTier === 'five' ? 5 : matchTier === 'four' ? 4 : 3;

    // 2. Send email
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: `🏆 You've won! ${matchCount}-number match in the ${formattedMonth} draw`,
      react: WinnerAlertEmail({
        fullName: user.full_name ?? 'there',
        drawMonth: formattedMonth,
        matchTier,
        prizeAmount: winner.prize_amount,
        numbersDrawn: draw.numbers_drawn,
        siteUrl: SITE_URL,
      }),
    });

    if (emailError) {
      console.error('Winner alert email error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send winner alert email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      winnerId,
      sentTo: user.email,
      matchTier,
      prizeAmount: winner.prize_amount,
    });
  } catch (err) {
    console.error('Winner alert email error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
