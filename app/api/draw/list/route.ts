import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Draw List API — Public endpoint
// GET /api/draw/list — returns all published draws with
// winner counts and jackpot amounts per draw
// ──────────────────────────────────────────────────────────

export async function GET() {
  // Fetch published draws
  const { data: draws, error: drawError } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_month', { ascending: false });

  if (drawError) {
    console.error('Draw list fetch error:', drawError);
    return NextResponse.json(
      { error: 'Failed to fetch draws' },
      { status: 500 }
    );
  }

  if (!draws || draws.length === 0) {
    return NextResponse.json({ draws: [] });
  }

  // Fetch winner counts grouped by draw_id
  const drawIds = draws.map((d) => d.id);
  const { data: winners } = await supabaseAdmin
    .from('winners')
    .select('draw_id, match_tier')
    .in('draw_id', drawIds);

  // Fetch prize pool data for each draw month
  const drawMonths = draws.map((d) => d.draw_month);
  const { data: prizePools } = await supabaseAdmin
    .from('prize_pool')
    .select('draw_month, total_pool, jackpot_amount, jackpot_rolled_over')
    .in('draw_month', drawMonths);

  // Build lookup maps
  const winnerCountByDraw = new Map<string, number>();
  if (winners) {
    for (const w of winners) {
      winnerCountByDraw.set(
        w.draw_id,
        (winnerCountByDraw.get(w.draw_id) ?? 0) + 1
      );
    }
  }

  const prizePoolByMonth = new Map<
    string,
    { total_pool: number; jackpot_amount: number; jackpot_rolled_over: boolean }
  >();
  if (prizePools) {
    for (const pp of prizePools) {
      prizePoolByMonth.set(pp.draw_month, {
        total_pool: pp.total_pool,
        jackpot_amount: pp.jackpot_amount,
        jackpot_rolled_over: pp.jackpot_rolled_over,
      });
    }
  }

  // Enrich draws with winner counts and prize data
  const enrichedDraws = draws.map((draw) => ({
    ...draw,
    winner_count: winnerCountByDraw.get(draw.id) ?? 0,
    prize_pool: prizePoolByMonth.get(draw.draw_month) ?? null,
  }));

  return NextResponse.json({ draws: enrichedDraws });
}
