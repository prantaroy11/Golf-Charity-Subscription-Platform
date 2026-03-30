import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Admin Draws List API — returns ALL draws (not just published)
// GET /api/admin/draws
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

  const { data: draws, error } = await supabaseAdmin
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false });

  if (error) {
    console.error('Admin draws fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draws' },
      { status: 500 }
    );
  }

  return NextResponse.json({ draws: draws ?? [] });
}
