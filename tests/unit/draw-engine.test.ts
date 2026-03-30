// ──────────────────────────────────────────────────────────
// Unit Tests — Draw Engine (Step 14.1)
// Tests: generateRandomDraw, generateAlgorithmicDraw,
//        getMatchTier, countMatches
// ──────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  getMatchTier,
  countMatches,
} from '@/lib/draw-engine/index';

// ─── generateRandomDraw ──────────────────────────────────

describe('generateRandomDraw', () => {
  it('returns exactly 5 numbers', () => {
    const draw = generateRandomDraw();
    expect(draw).toHaveLength(5);
  });

  it('returns only unique numbers', () => {
    // Run multiple times to increase confidence
    for (let i = 0; i < 50; i++) {
      const draw = generateRandomDraw();
      const unique = new Set(draw);
      expect(unique.size).toBe(5);
    }
  });

  it('returns numbers within the 1–45 range (inclusive)', () => {
    for (let i = 0; i < 50; i++) {
      const draw = generateRandomDraw();
      for (const n of draw) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(45);
      }
    }
  });

  it('returns numbers in ascending order', () => {
    for (let i = 0; i < 20; i++) {
      const draw = generateRandomDraw();
      for (let j = 1; j < draw.length; j++) {
        expect(draw[j]).toBeGreaterThan(draw[j - 1]);
      }
    }
  });

  it('returns an array of integers (no floats)', () => {
    const draw = generateRandomDraw();
    for (const n of draw) {
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it('produces different draws across multiple calls (non-deterministic)', () => {
    const draws = Array.from({ length: 20 }, () => generateRandomDraw());
    const serialized = draws.map((d) => d.join(','));
    const distinct = new Set(serialized);
    // With 20 runs and ~1.2M possible combos, all 20 should be unique
    expect(distinct.size).toBeGreaterThan(1);
  });
});

// ─── generateAlgorithmicDraw ─────────────────────────────

describe('generateAlgorithmicDraw', () => {
  it('returns exactly 5 numbers', () => {
    const scores = [10, 20, 30, 40, 5, 10, 20, 30, 15, 25];
    const draw = generateAlgorithmicDraw(scores);
    expect(draw).toHaveLength(5);
  });

  it('returns unique numbers within 1–45', () => {
    const scores = [1, 2, 3, 4, 5, 10, 20, 30, 40, 45];
    for (let i = 0; i < 20; i++) {
      const draw = generateAlgorithmicDraw(scores);
      const unique = new Set(draw);
      expect(unique.size).toBe(5);
      for (const n of draw) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(45);
      }
    }
  });

  it('returns numbers in ascending order', () => {
    const scores = [5, 10, 15, 20, 25, 30, 35, 40];
    const draw = generateAlgorithmicDraw(scores);
    for (let j = 1; j < draw.length; j++) {
      expect(draw[j]).toBeGreaterThan(draw[j - 1]);
    }
  });

  it('falls back to random draw when scores array is empty', () => {
    const draw = generateAlgorithmicDraw([]);
    expect(draw).toHaveLength(5);
    const unique = new Set(draw);
    expect(unique.size).toBe(5);
    for (const n of draw) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(45);
    }
  });

  it('draws only from score values when enough distinct scores exist', () => {
    // Supply exactly 5 distinct scores — all drawn numbers must come from these
    const scores = [10, 10, 20, 20, 30, 30, 40, 40, 45, 45];
    for (let i = 0; i < 20; i++) {
      const draw = generateAlgorithmicDraw(scores);
      for (const n of draw) {
        expect([10, 20, 30, 40, 45]).toContain(n);
      }
    }
  });

  it('heavily favours high-frequency scores', () => {
    // Score 10 appears 100 times, others appear once
    const scores = Array(100).fill(10).concat([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const appearances = new Map<number, number>();
    const runs = 50;
    for (let i = 0; i < runs; i++) {
      const draw = generateAlgorithmicDraw(scores);
      for (const n of draw) {
        appearances.set(n, (appearances.get(n) ?? 0) + 1);
      }
    }
    // Score 10 should appear in almost every draw
    expect(appearances.get(10) ?? 0).toBeGreaterThan(runs * 0.8);
  });
});

// ─── getMatchTier ────────────────────────────────────────

describe('getMatchTier', () => {
  const drawn = [5, 10, 15, 20, 25];

  it('returns "five" for a perfect 5-match', () => {
    expect(getMatchTier([5, 10, 15, 20, 25], drawn)).toBe('five');
  });

  it('returns "five" regardless of order', () => {
    expect(getMatchTier([25, 5, 20, 10, 15], drawn)).toBe('five');
  });

  it('returns "four" for exactly 4 matches', () => {
    expect(getMatchTier([5, 10, 15, 20, 30], drawn)).toBe('four');
  });

  it('returns "three" for exactly 3 matches', () => {
    expect(getMatchTier([5, 10, 15, 30, 35], drawn)).toBe('three');
  });

  it('returns null for 2 matches', () => {
    expect(getMatchTier([5, 10, 30, 35, 40], drawn)).toBeNull();
  });

  it('returns null for 1 match', () => {
    expect(getMatchTier([5, 30, 35, 40, 42], drawn)).toBeNull();
  });

  it('returns null for 0 matches', () => {
    expect(getMatchTier([1, 2, 3, 4, 6], drawn)).toBeNull();
  });

  it('handles edge case: all same number in user scores (duplicates count independently)', () => {
    // The filter-based implementation counts each occurrence independently:
    // [5,5,5,5,5] against Set{5,10,15,20,25} → filter gives [5,5,5,5,5] = 5 matches
    // This is the documented/expected behaviour of the current implementation
    expect(getMatchTier([5, 5, 5, 5, 5], drawn)).toBe('five');
  });

  it('handles empty user scores', () => {
    expect(getMatchTier([], drawn)).toBeNull();
  });

  it('handles empty drawn numbers', () => {
    expect(getMatchTier([5, 10, 15, 20, 25], [])).toBeNull();
  });
});

// ─── countMatches ────────────────────────────────────────

describe('countMatches', () => {
  const drawn = [5, 10, 15, 20, 25];

  it('returns 5 for a perfect match', () => {
    expect(countMatches([5, 10, 15, 20, 25], drawn)).toBe(5);
  });

  it('returns 0 for no matches', () => {
    expect(countMatches([1, 2, 3, 4, 6], drawn)).toBe(0);
  });

  it('returns 3 for three matching numbers', () => {
    expect(countMatches([5, 10, 15, 30, 35], drawn)).toBe(3);
  });

  it('returns 0 with empty inputs', () => {
    expect(countMatches([], drawn)).toBe(0);
    expect(countMatches([1, 2, 3], [])).toBe(0);
  });
});
