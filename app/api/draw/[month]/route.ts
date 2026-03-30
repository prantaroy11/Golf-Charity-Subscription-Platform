import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Draw Detail API — Public endpoint
// GET /api/draw/[month] — returns a single published draw + winners + prize pool
// ──────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ month: string }> }
) {
  const { month } = await params;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: 'Invalid month format. Use YYYY-MM.' },
      { status: 400 }
    );
  }

  // Fetch the draw
  const { data: draw, error: drawError } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('draw_month', month)
    .eq('status', 'published')
    .single();

  if (drawError || !draw) {
    return NextResponse.json(
      { error: 'Draw not found or not yet published.' },
      { status: 404 }
    );
  }

  // Fetch winners with user names
  const { data: winners, error: winnersError } = await supabaseAdmin
    .from('winners')
    .select('id, user_id, match_tier, prize_amount, payout_status, created_at')
    .eq('draw_id', draw.id)
    .order('match_tier', { ascending: true });

  if (winnersError) {
    console.error('Winners fetch error:', winnersError);
  }

  // Fetch prize pool
  const { data: prizePool, error: poolError } = await supabaseAdmin
    .from('prize_pool')
    .select('*')
    .eq('draw_month', month)
    .single();

  if (poolError) {
    console.error('Prize pool fetch error:', poolError);
  }

  // Fetch historical draws for the sidebar list
  const { data: allDraws } = await supabaseAdmin
    .from('draws')
    .select('draw_month, status')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })
    .limit(12);

  // Count winners per tier
  const winnersByTier = {
    five: (winners ?? []).filter((w) => w.match_tier === 'five'),
    four: (winners ?? []).filter((w) => w.match_tier === 'four'),
    three: (winners ?? []).filter((w) => w.match_tier === 'three'),
  };

  return NextResponse.json({
    draw,
    winners: winnersByTier,
    prizePool: prizePool ?? null,
    historicalDraws: (allDraws ?? []).map((d) => d.draw_month),
  });
}
