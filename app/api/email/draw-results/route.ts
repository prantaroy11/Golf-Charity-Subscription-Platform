import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { resend, EMAIL_FROM, SITE_URL, formatDrawMonth } from '@/lib/email';
import DrawResultsEmail from '@/emails/DrawResultsEmail';
import { getMatchTier } from '@/lib/draw-engine';

// ──────────────────────────────────────────────────────────
// Email Trigger: Draw Results — Step 12.2
// POST /api/email/draw-results
// Admin-only: sends DrawResultsEmail to all draw participants
// ──────────────────────────────────────────────────────────

interface DrawResultsRequest {
  drawMonth: string; // e.g. '2026-03'
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
  // Verify admin
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: DrawResultsRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { drawMonth } = body;

  if (!drawMonth || !/^\d{4}-\d{2}$/.test(drawMonth)) {
    return NextResponse.json(
      { error: 'Valid drawMonth required (YYYY-MM)' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch the published draw
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('draw_month', drawMonth)
      .eq('status', 'published')
      .single();

    if (drawError || !draw) {
      return NextResponse.json(
        { error: 'No published draw found for this month' },
        { status: 404 }
      );
    }

    // 2. Fetch all draw entries with user info
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('draw_entries')
      .select('*, users:user_id(id, email, full_name)')
      .eq('draw_id', draw.id);

    if (entriesError) {
      console.error('Entries fetch error:', entriesError);
      return NextResponse.json(
        { error: 'Failed to fetch draw entries' },
        { status: 500 }
      );
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries found for this draw' },
        { status: 404 }
      );
    }

    // 3. Fetch winners for this draw for prize lookup
    const { data: winners } = await supabaseAdmin
      .from('winners')
      .select('user_id, match_tier, prize_amount')
      .eq('draw_id', draw.id);

    const winnerMap = new Map<
      string,
      { match_tier: string; prize_amount: number }
    >();
    for (const w of winners ?? []) {
      winnerMap.set(w.user_id, {
        match_tier: w.match_tier,
        prize_amount: w.prize_amount,
      });
    }

    // 4. Send emails to all participants
    const formattedMonth = formatDrawMonth(drawMonth);
    const numbersDrawn: number[] = draw.numbers_drawn;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      const user = entry.users as {
        id: string;
        email: string;
        full_name: string | null;
      } | null;
      if (!user?.email) {
        failed++;
        continue;
      }

      const userScores: number[] = entry.scores ?? [];
      const matchTier = getMatchTier(userScores, numbersDrawn);
      const winnerInfo = winnerMap.get(user.id);
      const prizeAmount = winnerInfo?.prize_amount ?? null;

      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: matchTier
            ? `🎉 You matched ${matchTier === 'five' ? 5 : matchTier === 'four' ? 4 : 3} numbers — ${formattedMonth} Draw Results`
            : `${formattedMonth} Draw Results Are In`,
          react: DrawResultsEmail({
            fullName: user.full_name ?? 'there',
            drawMonth: formattedMonth,
            numbersDrawn,
            userScores,
            matchTier,
            prizeAmount,
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
      drawMonth,
      totalParticipants: entries.length,
      sent,
      failed,
      errors: errors.slice(0, 10), // Return max 10 errors
    });
  } catch (err) {
    console.error('Draw results email error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
