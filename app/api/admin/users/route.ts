import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Admin Users API — CRUD operations on users
// GET: List all users with subscriptions
// PATCH: Update user role, subscription status, charity
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
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortDir = searchParams.get('sortDir') === 'asc' ? true : false;

  let query = supabaseAdmin.from('users').select('*, subscriptions(*)');

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  // Sort
  const validSortFields = ['full_name', 'email', 'role', 'created_at'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  query = query.order(field, { ascending: sortDir });

  const { data: users, error } = await query;

  if (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }

  return NextResponse.json({ users: users ?? [] });
}

export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, updates } = await req.json();

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'Missing userId or updates' },
        { status: 400 }
      );
    }

    // Allowed update fields
    const allowedFields = ['role', 'full_name', 'charity_id', 'charity_pct'];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        sanitized[key] = updates[key];
      }
    }
    sanitized.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(sanitized)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Admin user update error:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // If subscription status update is included
    if (updates.subscription_status) {
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: updates.subscription_status,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (subError) {
        console.error('Admin subscription update error:', subError);
      }
    }

    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
