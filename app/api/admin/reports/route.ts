import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Admin Reports API — aggregate stats for dashboard
// GET: Returns total subscribers, prize pool, charity contributions, draws run
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

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Total active subscribers
    const { count: activeSubscribers } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total subscribers (all time)
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Total draws run
    const { count: drawsRun } = await supabaseAdmin
      .from('draws')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    // Total winners
    const { count: totalWinners } = await supabaseAdmin
      .from('winners')
      .select('*', { count: 'exact', head: true });

    // Total charity contributions (sum)
    const { data: contributions } = await supabaseAdmin
      .from('charity_contributions')
      .select('amount_pence');

    const totalCharityContributions = (contributions ?? []).reduce(
      (sum, c) => sum + (c.amount_pence || 0),
      0
    );

    // Current month prize pool
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: currentPool } = await supabaseAdmin
      .from('prize_pool')
      .select('*')
      .eq('draw_month', currentMonth)
      .single();

    // Monthly subscriber counts (last 12 months)
    const { data: allSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('created_at, status')
      .order('created_at', { ascending: true });

    // Build monthly chart data
    const monthlyData: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleDateString('en-GB', {
        month: 'short',
        year: '2-digit',
      });
      const count = (allSubscriptions ?? []).filter((s) => {
        const created = s.created_at.slice(0, 7);
        return created <= monthKey && s.status === 'active';
      }).length;
      monthlyData.push({ month: monthLabel, count });
    }

    // Recent draw entries for CSV export data
    const { data: recentDrawEntries } = await supabaseAdmin
      .from('draw_entries')
      .select('*, users:user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(500);

    return NextResponse.json({
      stats: {
        activeSubscribers: activeSubscribers ?? 0,
        totalUsers: totalUsers ?? 0,
        drawsRun: drawsRun ?? 0,
        totalWinners: totalWinners ?? 0,
        totalCharityContributions,
        currentPrizePool: currentPool?.total_pool ?? 0,
      },
      monthlyData,
      recentDrawEntries: recentDrawEntries ?? [],
    });
  } catch (err) {
    console.error('Admin reports error:', err);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
