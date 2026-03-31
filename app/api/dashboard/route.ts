import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ──────────────────────────────────────────────────────────
// Dashboard Data API — Batched endpoint
// Returns all dashboard data in a single request instead of
// making 4+ parallel Supabase queries from the client.
// GET /api/dashboard
// ──────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  // Run all queries in parallel for maximum speed
  const [drawEntriesResult, drawsResult, contributionsResult, winningsResult] =
    await Promise.all([
      // Draws entered count
      supabase.from('draw_entries').select('id').eq('user_id', userId),

      // Current/latest draw
      supabase
        .from('draws')
        .select('*')
        .order('draw_month', { ascending: false })
        .limit(1),

      // Recent charity contributions
      supabase
        .from('charity_contributions')
        .select('amount_pence, period_month, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3),

      // Recent winnings
      supabase
        .from('winners')
        .select('prize_amount, match_tier, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

  // Build impact feed
  const feed: { type: string; text: string; date: string }[] = [];

  (contributionsResult.data ?? []).forEach(
    (c: { amount_pence: number; period_month: string; created_at: string }) => {
      feed.push({
        type: 'contribution',
        text: `£${(c.amount_pence / 100).toFixed(2)} donated (${c.period_month})`,
        date: c.created_at,
      });
    }
  );

  (winningsResult.data ?? []).forEach(
    (w: { prize_amount: number; match_tier: string; created_at: string }) => {
      feed.push({
        type: 'win',
        text: `${w.match_tier}-match win — £${(w.prize_amount / 100).toFixed(2)}`,
        date: w.created_at,
      });
    }
  );

  // Sort by date descending, take 5
  feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({
    drawsEnteredCount: drawEntriesResult.data?.length ?? 0,
    currentDraw:
      drawsResult.data && drawsResult.data.length > 0
        ? drawsResult.data[0]
        : null,
    impactFeed: feed.slice(0, 5),
  });
}
