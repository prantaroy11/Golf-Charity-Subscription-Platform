import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// ──────────────────────────────────────────────────────────
// Cancel Subscription API — Step 7.8
// Updates subscription status to 'cancelled'
// ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Update subscription status to cancelled
    const { error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (dbError) {
      console.error('Cancel subscription error:', dbError);
      return NextResponse.json(
        { error: 'Failed to cancel subscription.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: 'cancelled' });
  } catch (error) {
    console.error('Cancel API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
