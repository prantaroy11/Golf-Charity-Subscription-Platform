import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Draw List API — Public endpoint
// GET /api/draw/list — returns all published draws
// ──────────────────────────────────────────────────────────

export async function GET() {
  const { data: draws, error } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_month', { ascending: false });

  if (error) {
    console.error('Draw list fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draws' },
      { status: 500 }
    );
  }

  return NextResponse.json({ draws: draws ?? [] });
}
