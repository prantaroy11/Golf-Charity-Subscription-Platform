import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────
// Admin Charities API — CRUD operations on charities
// GET: List all charities
// POST: Create a new charity
// PATCH: Update a charity
// DELETE: Remove a charity
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

  const { data: charities, error } = await supabaseAdmin
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch charities' },
      { status: 500 }
    );
  }

  return NextResponse.json({ charities: charities ?? [] });
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, logo_url, website, is_featured } =
      await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Charity name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert({
        name: name.trim(),
        description: description || null,
        logo_url: logo_url || null,
        website: website || null,
        is_featured: is_featured ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Charity create error:', error);
      return NextResponse.json(
        { error: 'Failed to create charity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ charity: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Charity ID required' },
        { status: 400 }
      );
    }

    const allowedFields = [
      'name',
      'description',
      'logo_url',
      'website',
      'is_featured',
    ];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        sanitized[key] = updates[key];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('charities')
      .update(sanitized)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Charity update error:', error);
      return NextResponse.json(
        { error: 'Failed to update charity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ charity: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Charity ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('charities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Charity delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete charity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
