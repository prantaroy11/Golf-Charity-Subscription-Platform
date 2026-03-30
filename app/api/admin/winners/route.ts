import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Admin Winners API — manage winner payouts and verification
// GET: List all winners with user and draw info
// PATCH: Update a winner's payout status and notes
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

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  let query = supabaseAdmin
    .from('winners')
    .select(
      '*, users:user_id(id, full_name, email), draws:draw_id(draw_month, numbers_drawn)'
    )
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('payout_status', statusFilter);
  }

  const { data: winners, error } = await query;

  if (error) {
    console.error('Admin winners fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }

  return NextResponse.json({ winners: winners ?? [] });
}

export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { winnerId, payout_status, admin_notes } = await req.json();

    if (!winnerId) {
      return NextResponse.json(
        { error: 'Winner ID required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'verified', 'paid', 'rejected'];
    if (payout_status && !validStatuses.includes(payout_status)) {
      return NextResponse.json(
        { error: 'Invalid payout status' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payout_status) updates.payout_status = payout_status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { data, error } = await supabaseAdmin
      .from('winners')
      .update(updates)
      .eq('id', winnerId)
      .select(
        '*, users:user_id(id, full_name, email), draws:draw_id(draw_month, numbers_drawn)'
      )
      .single();

    if (error) {
      console.error('Admin winner update error:', error);
      return NextResponse.json(
        { error: 'Failed to update winner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ winner: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
