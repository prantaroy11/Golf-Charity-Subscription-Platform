import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  getMatchTier,
} from '@/lib/draw-engine';
import {
  calculatePrizePool,
  splitPrizeAmongWinners,
} from '@/lib/draw-engine/prize-pool';

// ──────────────────────────────────────────────────────────
// Draw Execution API — Step 9.3
// POST /api/draw/execute
// Admin-only endpoint to run a monthly draw
// ──────────────────────────────────────────────────────────

// Fixed monthly contribution per subscriber in pence (e.g. £5.00 = 500p)
const MONTHLY_CONTRIBUTION_PENCE = 500;

interface DrawRequestBody {
  drawMonth: string; // e.g. '2026-03'
  drawType: 'random' | 'algorithmic';
  mode: 'simulation' | 'publish';
}

export async function POST(req: NextRequest) {
  // ── 1. Verify admin session ──
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role from public.users
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden — admin access required' },
      { status: 403 }
    );
  }

  // ── 2. Parse request body ──
  let body: DrawRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { drawMonth, drawType, mode } = body;

  if (!drawMonth || !drawType || !mode) {
    return NextResponse.json(
      { error: 'Missing required fields: drawMonth, drawType, mode' },
      { status: 400 }
    );
  }

  if (!['random', 'algorithmic'].includes(drawType)) {
    return NextResponse.json(
      { error: 'drawType must be "random" or "algorithmic"' },
      { status: 400 }
    );
  }

  if (!['simulation', 'publish'].includes(mode)) {
    return NextResponse.json(
      { error: 'mode must be "simulation" or "publish"' },
      { status: 400 }
    );
  }

  // Validate drawMonth format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(drawMonth)) {
    return NextResponse.json(
      { error: 'drawMonth must be in YYYY-MM format' },
      { status: 400 }
    );
  }

  try {
    // ── 3. Fetch all active subscribers ──
    const { data: activeSubscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active');

    if (subError) {
      console.error('Subscription fetch error:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch active subscriptions' },
        { status: 500 }
      );
    }

    const activeUserIds = (activeSubscriptions ?? []).map((s) => s.user_id);
    const activeSubscriberCount = activeUserIds.length;

    if (activeSubscriberCount === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found. Cannot run draw.' },
        { status: 400 }
      );
    }

    // ── 4. Fetch all scores for active subscribers ──
    const { data: allScoresData, error: scoresError } = await supabaseAdmin
      .from('scores')
      .select('user_id, score, played_at')
      .in('user_id', activeUserIds)
      .order('played_at', { ascending: false });

    if (scoresError) {
      console.error('Scores fetch error:', scoresError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriber scores' },
        { status: 500 }
      );
    }

    // Group scores by user (latest 5 only)
    const userScoresMap = new Map<string, number[]>();
    for (const row of allScoresData ?? []) {
      const existing = userScoresMap.get(row.user_id) ?? [];
      if (existing.length < 5) {
        existing.push(row.score);
        userScoresMap.set(row.user_id, existing);
      }
    }

    // Flat array of all score values (for algorithmic mode)
    const allScoreValues = (allScoresData ?? []).map((r) => r.score);

    // ── 5. Generate draw numbers ──
    const numbersDrawn =
      drawType === 'algorithmic'
        ? generateAlgorithmicDraw(allScoreValues)
        : generateRandomDraw();

    // ── 6. Calculate prize pool ──
    const pool = calculatePrizePool(
      activeSubscriberCount,
      MONTHLY_CONTRIBUTION_PENCE
    );

    // ── 7. Check for jackpot rollover from previous month ──
    let rolledOverJackpot = 0;
    const { data: previousPool } = await supabaseAdmin
      .from('prize_pool')
      .select('jackpot_amount, jackpot_rolled_over')
      .neq('draw_month', drawMonth)
      .eq('jackpot_rolled_over', true)
      .order('draw_month', { ascending: false })
      .limit(1)
      .single();

    if (previousPool) {
      rolledOverJackpot = previousPool.jackpot_amount ?? 0;
    }

    const effectiveJackpot = pool.jackpot + rolledOverJackpot;

    // ── 8. Determine winners ──
    interface WinnerRecord {
      user_id: string;
      match_tier: 'five' | 'four' | 'three';
      scores: number[];
    }

    const winners: WinnerRecord[] = [];

    // Create draw entries for each user with scores
    const drawEntries: { user_id: string; scores: number[] }[] = [];

    for (const [userId, scores] of userScoresMap.entries()) {
      if (scores.length === 0) continue;

      drawEntries.push({ user_id: userId, scores });

      const tier = getMatchTier(scores, numbersDrawn);
      if (tier) {
        winners.push({ user_id: userId, match_tier: tier, scores });
      }
    }

    // Count winners per tier
    const fiveMatchWinners = winners.filter((w) => w.match_tier === 'five');
    const fourMatchWinners = winners.filter((w) => w.match_tier === 'four');
    const threeMatchWinners = winners.filter((w) => w.match_tier === 'three');

    // Calculate prize per winner per tier
    const jackpotPrize = splitPrizeAmongWinners(
      effectiveJackpot,
      fiveMatchWinners.length
    );
    const fourMatchPrize = splitPrizeAmongWinners(
      pool.fourMatch,
      fourMatchWinners.length
    );
    const threeMatchPrize = splitPrizeAmongWinners(
      pool.threeMatch,
      threeMatchWinners.length
    );

    // Determine if jackpot rolls over (no 5-match winners)
    const jackpotRolledOver = fiveMatchWinners.length === 0;

    const drawStatus = mode === 'publish' ? 'published' : 'simulation';

    // ── 9. Write to draws table ──
    const { data: drawRecord, error: drawError } = await supabaseAdmin
      .from('draws')
      .upsert(
        {
          draw_month: drawMonth,
          numbers_drawn: numbersDrawn,
          draw_type: drawType,
          status: drawStatus,
          jackpot_pool: effectiveJackpot,
          four_match_pool: pool.fourMatch,
          three_match_pool: pool.threeMatch,
          published_at: mode === 'publish' ? new Date().toISOString() : null,
        },
        { onConflict: 'draw_month' }
      )
      .select()
      .single();

    if (drawError) {
      console.error('Draw write error:', drawError);
      return NextResponse.json(
        { error: 'Failed to save draw record' },
        { status: 500 }
      );
    }

    const drawId = drawRecord.id;

    // ── 10. Write draw entries ──
    if (drawEntries.length > 0) {
      // First delete any existing entries for this draw (in case of re-run)
      await supabaseAdmin.from('draw_entries').delete().eq('draw_id', drawId);

      const entryRows = drawEntries.map((e) => ({
        draw_id: drawId,
        user_id: e.user_id,
        scores: e.scores,
      }));

      const { error: entryError } = await supabaseAdmin
        .from('draw_entries')
        .insert(entryRows);

      if (entryError) {
        console.error('Draw entries write error:', entryError);
        // Non-fatal — draw still saved
      }
    }

    // ── 11. Write winners to winners table ──
    if (winners.length > 0) {
      // Delete existing winners for this draw (re-run safety)
      await supabaseAdmin.from('winners').delete().eq('draw_id', drawId);

      const winnerRows = winners.map((w) => ({
        draw_id: drawId,
        user_id: w.user_id,
        match_tier: w.match_tier,
        prize_amount:
          w.match_tier === 'five'
            ? jackpotPrize
            : w.match_tier === 'four'
              ? fourMatchPrize
              : threeMatchPrize,
        payout_status: 'pending' as const,
      }));

      const { error: winnerError } = await supabaseAdmin
        .from('winners')
        .insert(winnerRows);

      if (winnerError) {
        console.error('Winners write error:', winnerError);
        // Non-fatal
      }
    }

    // ── 12. Write to prize_pool table ──
    const { error: poolError } = await supabaseAdmin.from('prize_pool').upsert(
      {
        draw_month: drawMonth,
        total_pool: pool.total + rolledOverJackpot,
        jackpot_amount: effectiveJackpot,
        four_match_amount: pool.fourMatch,
        three_match_amount: pool.threeMatch,
        jackpot_rolled_over: jackpotRolledOver,
      },
      { onConflict: 'draw_month' }
    );

    if (poolError) {
      console.error('Prize pool write error:', poolError);
      // Non-fatal
    }

    // ── 13. If jackpot rolled over, clear the rollover flag on previous month ──
    if (!jackpotRolledOver && previousPool) {
      // We used the rolled-over jackpot — mark it as consumed
      await supabaseAdmin
        .from('prize_pool')
        .update({ jackpot_rolled_over: false })
        .neq('draw_month', drawMonth)
        .eq('jackpot_rolled_over', true);
    }

    // ── 14. Trigger emails on publish ──
    if (mode === 'publish') {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000');

      // Send draw results email to all participants
      try {
        const drawEmailRes = await fetch(`${siteUrl}/api/email/draw-results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drawMonth }),
        });
        if (!drawEmailRes.ok) {
          console.error('Draw results email failed:', drawEmailRes.status);
        }
      } catch (err) {
        console.error('Draw results email trigger failed:', err);
      }

      // Send winner alerts to each winner
      if (winners.length > 0) {
        const { data: savedWinners } = await supabaseAdmin
          .from('winners')
          .select('id')
          .eq('draw_id', drawId);

        if (savedWinners) {
          for (const sw of savedWinners) {
            try {
              const winnerEmailRes = await fetch(
                `${siteUrl}/api/email/winner-alert`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ winnerId: sw.id }),
                }
              );
              if (!winnerEmailRes.ok) {
                console.error(
                  'Winner alert email failed:',
                  winnerEmailRes.status
                );
              }
            } catch (err) {
              console.error('Winner alert email trigger failed:', err);
            }
          }
        }
      }
    }

    // ── 15. Return draw results ──
    return NextResponse.json({
      draw: {
        id: drawId,
        draw_month: drawMonth,
        numbers_drawn: numbersDrawn,
        draw_type: drawType,
        status: drawStatus,
      },
      prizePool: {
        total: pool.total + rolledOverJackpot,
        jackpot: effectiveJackpot,
        fourMatch: pool.fourMatch,
        threeMatch: pool.threeMatch,
        jackpotRolledOver,
        rolledOverAmount: rolledOverJackpot,
      },
      winners: {
        fiveMatch: {
          count: fiveMatchWinners.length,
          prizePerWinner: jackpotPrize,
        },
        fourMatch: {
          count: fourMatchWinners.length,
          prizePerWinner: fourMatchPrize,
        },
        threeMatch: {
          count: threeMatchWinners.length,
          prizePerWinner: threeMatchPrize,
        },
      },
      meta: {
        activeSubscribers: activeSubscriberCount,
        totalEntries: drawEntries.length,
        totalWinners: winners.length,
      },
    });
  } catch (err) {
    console.error('Draw execution error:', err);
    return NextResponse.json(
      { error: 'Internal server error during draw execution' },
      { status: 500 }
    );
  }
}
