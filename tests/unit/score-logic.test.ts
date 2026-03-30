// ──────────────────────────────────────────────────────────
// Unit Tests — Score Validation & Rolling Window (Step 14.1)
// Tests: scoreSchema validation, rolling 5-score window logic
// ──────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { scoreSchema } from '@/lib/validations/scores';

// ─── scoreSchema validation ─────────────────────────────

describe('scoreSchema', () => {
  describe('valid inputs', () => {
    it('accepts a valid score of 1', () => {
      const result = scoreSchema.safeParse({
        score: 1,
        played_at: '2026-03-15',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a valid score of 45', () => {
      const result = scoreSchema.safeParse({
        score: 45,
        played_at: '2026-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a mid-range score', () => {
      const result = scoreSchema.safeParse({
        score: 22,
        played_at: '2026-06-01',
      });
      expect(result.success).toBe(true);
    });

    it('accepts score at boundaries (1 and 45)', () => {
      expect(
        scoreSchema.safeParse({ score: 1, played_at: '2026-01-01' }).success
      ).toBe(true);
      expect(
        scoreSchema.safeParse({ score: 45, played_at: '2026-01-01' }).success
      ).toBe(true);
    });
  });

  describe('invalid score values', () => {
    it('rejects score of 0', () => {
      const result = scoreSchema.safeParse({
        score: 0,
        played_at: '2026-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative scores', () => {
      const result = scoreSchema.safeParse({
        score: -5,
        played_at: '2026-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects score above 45', () => {
      const result = scoreSchema.safeParse({
        score: 46,
        played_at: '2026-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects score of 100', () => {
      const result = scoreSchema.safeParse({
        score: 100,
        played_at: '2026-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects floating-point scores', () => {
      const result = scoreSchema.safeParse({
        score: 22.5,
        played_at: '2026-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects string scores', () => {
      const result = scoreSchema.safeParse({
        score: '22',
        played_at: '2026-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects null score', () => {
      const result = scoreSchema.safeParse({
        score: null,
        played_at: '2026-03-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects undefined score', () => {
      const result = scoreSchema.safeParse({ played_at: '2026-03-15' });
      expect(result.success).toBe(false);
    });
  });

  describe('invalid date values', () => {
    it('rejects empty string date', () => {
      const result = scoreSchema.safeParse({ score: 20, played_at: '' });
      expect(result.success).toBe(false);
    });

    it('rejects date in DD/MM/YYYY format', () => {
      const result = scoreSchema.safeParse({
        score: 20,
        played_at: '15/03/2026',
      });
      expect(result.success).toBe(false);
    });

    it('rejects date in MM-DD-YYYY format', () => {
      const result = scoreSchema.safeParse({
        score: 20,
        played_at: '03-15-2026',
      });
      expect(result.success).toBe(false);
    });

    it('rejects date with time', () => {
      const result = scoreSchema.safeParse({
        score: 20,
        played_at: '2026-03-15T12:00:00',
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-string date', () => {
      const result = scoreSchema.safeParse({ score: 20, played_at: 20260315 });
      expect(result.success).toBe(false);
    });

    it('rejects missing date', () => {
      const result = scoreSchema.safeParse({ score: 20 });
      expect(result.success).toBe(false);
    });

    it('rejects date with extra characters', () => {
      const result = scoreSchema.safeParse({
        score: 20,
        played_at: '2026-03-15-extra',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('missing/extra fields', () => {
    it('rejects empty object', () => {
      const result = scoreSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('accepts extra fields (Zod strips by default on parse, but safeParse still succeeds)', () => {
      const result = scoreSchema.safeParse({
        score: 20,
        played_at: '2026-03-15',
        extra_field: 'hello',
      });
      expect(result.success).toBe(true);
    });
  });
});

// ─── Rolling 5-score window logic ────────────────────────
// This tests the pure logic of the rolling window algorithm,
// independent of the API route / Supabase calls.

describe('Rolling 5-score window logic', () => {
  const MAX_SCORES = 5;

  /**
   * Pure function simulating the rolling window:
   * given existing scores sorted by played_at ASC,
   * adding a new score should remove the oldest if count >= MAX_SCORES.
   */
  function addScoreToWindow(
    existingScores: Array<{ id: string; score: number; played_at: string }>,
    newScore: { score: number; played_at: string }
  ): {
    scores: Array<{ id: string; score: number; played_at: string }>;
    deletedScore: { id: string; score: number; played_at: string } | null;
  } {
    const sorted = [...existingScores].sort(
      (a, b) =>
        new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    );

    let deletedScore = null;
    if (sorted.length >= MAX_SCORES) {
      deletedScore = sorted[0];
      sorted.shift();
    }

    sorted.push({
      id: `new-${Date.now()}`,
      ...newScore,
    });

    return { scores: sorted, deletedScore };
  }

  it('adds a score when fewer than 5 exist', () => {
    const existing = [
      { id: '1', score: 20, played_at: '2026-03-01' },
      { id: '2', score: 25, played_at: '2026-03-02' },
    ];
    const result = addScoreToWindow(existing, {
      score: 30,
      played_at: '2026-03-03',
    });
    expect(result.scores).toHaveLength(3);
    expect(result.deletedScore).toBeNull();
  });

  it('does not delete when exactly 4 scores exist', () => {
    const existing = [
      { id: '1', score: 10, played_at: '2026-03-01' },
      { id: '2', score: 15, played_at: '2026-03-02' },
      { id: '3', score: 20, played_at: '2026-03-03' },
      { id: '4', score: 25, played_at: '2026-03-04' },
    ];
    const result = addScoreToWindow(existing, {
      score: 30,
      played_at: '2026-03-05',
    });
    expect(result.scores).toHaveLength(5);
    expect(result.deletedScore).toBeNull();
  });

  it('removes the oldest score when 5 already exist (6th added)', () => {
    const existing = [
      { id: '1', score: 10, played_at: '2026-03-01' },
      { id: '2', score: 15, played_at: '2026-03-02' },
      { id: '3', score: 20, played_at: '2026-03-03' },
      { id: '4', score: 25, played_at: '2026-03-04' },
      { id: '5', score: 30, played_at: '2026-03-05' },
    ];
    const result = addScoreToWindow(existing, {
      score: 35,
      played_at: '2026-03-06',
    });
    expect(result.scores).toHaveLength(5);
    expect(result.deletedScore).not.toBeNull();
    expect(result.deletedScore!.id).toBe('1');
    expect(result.deletedScore!.played_at).toBe('2026-03-01');
  });

  it('always keeps the window at max 5 scores after adding', () => {
    const existing = [
      { id: '1', score: 10, played_at: '2026-03-01' },
      { id: '2', score: 15, played_at: '2026-03-02' },
      { id: '3', score: 20, played_at: '2026-03-03' },
      { id: '4', score: 25, played_at: '2026-03-04' },
      { id: '5', score: 30, played_at: '2026-03-05' },
    ];
    const result = addScoreToWindow(existing, {
      score: 40,
      played_at: '2026-03-10',
    });
    expect(result.scores).toHaveLength(5);
    // The new score should be present
    expect(result.scores.some((s) => s.score === 40)).toBe(true);
    // The oldest (score 10) should be gone
    expect(result.scores.some((s) => s.score === 10)).toBe(false);
  });

  it('removes the correct oldest when dates are out of order in input', () => {
    const existing = [
      { id: '3', score: 20, played_at: '2026-03-03' },
      { id: '1', score: 10, played_at: '2026-03-01' }, // oldest, but not first in array
      { id: '5', score: 30, played_at: '2026-03-05' },
      { id: '2', score: 15, played_at: '2026-03-02' },
      { id: '4', score: 25, played_at: '2026-03-04' },
    ];
    const result = addScoreToWindow(existing, {
      score: 35,
      played_at: '2026-03-06',
    });
    expect(result.deletedScore!.id).toBe('1');
  });

  it('preserves score values after rolling window replacement', () => {
    const existing = [
      { id: '1', score: 10, played_at: '2026-03-01' },
      { id: '2', score: 15, played_at: '2026-03-02' },
      { id: '3', score: 20, played_at: '2026-03-03' },
      { id: '4', score: 25, played_at: '2026-03-04' },
      { id: '5', score: 30, played_at: '2026-03-05' },
    ];
    const result = addScoreToWindow(existing, {
      score: 42,
      played_at: '2026-03-06',
    });
    const scoreValues = result.scores.map((s) => s.score);
    expect(scoreValues).toContain(15);
    expect(scoreValues).toContain(20);
    expect(scoreValues).toContain(25);
    expect(scoreValues).toContain(30);
    expect(scoreValues).toContain(42);
    expect(scoreValues).not.toContain(10);
  });
});
