import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scoreSchema } from '@/lib/validations/scores';

// ──────────────────────────────────────────────────────────
// Scores API Route — Step 8.2
// GET:    Fetch user's scores (latest 5, ordered by played_at DESC)
// POST:   Add a new score (rolling window — auto-deletes oldest if 5 exist)
// DELETE:  Delete a specific score by ID
// ──────────────────────────────────────────────────────────

const MAX_SCORES = 5;

/**
 * GET /api/scores
 * Returns the authenticated user's scores, ordered most recent first, limit 5.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: scores, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(MAX_SCORES);

  if (error) {
    console.error('Scores fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }

  return NextResponse.json({ scores });
}

/**
 * POST /api/scores
 * Validates body with scoreSchema. If the user already has 5 scores,
 * it deletes the oldest (by played_at ASC) before inserting the new one.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse and validate the request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = scoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { score, played_at } = parsed.data;

  // Check how many scores the user currently has
  const { data: existingScores, error: countError } = await supabase
    .from('scores')
    .select('id, played_at')
    .eq('user_id', user.id)
    .order('played_at', { ascending: true });

  if (countError) {
    console.error('Score count error:', countError);
    return NextResponse.json(
      { error: 'Failed to check existing scores' },
      { status: 500 }
    );
  }

  // If user already has 5 scores, delete the oldest one
  let deletedScore = null;
  if (existingScores && existingScores.length >= MAX_SCORES) {
    const oldestScore = existingScores[0];
    deletedScore = oldestScore;

    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .eq('id', oldestScore.id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Score delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove oldest score' },
        { status: 500 }
      );
    }
  }

  // Insert the new score
  const { data: newScore, error: insertError } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      score,
      played_at,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Score insert error:', insertError);
    return NextResponse.json({ error: 'Failed to add score' }, { status: 500 });
  }

  return NextResponse.json({
    score: newScore,
    deletedScore,
    message: deletedScore
      ? `Score added. Your oldest score from ${deletedScore.played_at} was replaced.`
      : 'Score added successfully.',
  });
}

/**
 * DELETE /api/scores
 * Deletes a specific score by ?id= query param. Only works if user_id matches.
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scoreId = searchParams.get('id');

  if (!scoreId) {
    return NextResponse.json(
      { error: 'Score ID is required' },
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Score delete error:', deleteError);
    return NextResponse.json(
      { error: 'Failed to delete score' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Score deleted successfully.' });
}
