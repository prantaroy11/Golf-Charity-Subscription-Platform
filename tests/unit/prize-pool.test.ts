// ──────────────────────────────────────────────────────────
// Unit Tests — Prize Pool (Step 14.1)
// Tests: calculatePrizePool splits, splitPrizeAmongWinners,
//        formatPenceToPounds, jackpot rollover logic
// ──────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  calculatePrizePool,
  splitPrizeAmongWinners,
  formatPenceToPounds,
} from '@/lib/draw-engine/prize-pool';

// ─── calculatePrizePool ──────────────────────────────────

describe('calculatePrizePool', () => {
  it('calculates the correct total pool', () => {
    const pool = calculatePrizePool(100, 1000); // 100 subs × 1000p = 100000p
    expect(pool.total).toBe(100000);
  });

  it('splits 40% to jackpot', () => {
    const pool = calculatePrizePool(100, 1000);
    expect(pool.jackpot).toBe(40000); // 40% of 100000
  });

  it('splits 35% to four-match', () => {
    const pool = calculatePrizePool(100, 1000);
    expect(pool.fourMatch).toBe(35000); // 35% of 100000
  });

  it('splits 25% to three-match', () => {
    const pool = calculatePrizePool(100, 1000);
    expect(pool.threeMatch).toBe(25000); // 25% of 100000
  });

  it('tier amounts sum to total (or less due to rounding)', () => {
    const pool = calculatePrizePool(100, 1000);
    const tierSum = pool.jackpot + pool.fourMatch + pool.threeMatch;
    expect(tierSum).toBeLessThanOrEqual(pool.total);
    // The difference should be at most 2 pence (due to 3 Math.floor calls)
    expect(pool.total - tierSum).toBeLessThanOrEqual(2);
  });

  it('handles rounding correctly with odd numbers', () => {
    const pool = calculatePrizePool(7, 333); // 7 × 333 = 2331p
    expect(pool.total).toBe(2331);
    expect(pool.jackpot).toBe(Math.floor(2331 * 0.4)); // 932
    expect(pool.fourMatch).toBe(Math.floor(2331 * 0.35)); // 815
    expect(pool.threeMatch).toBe(Math.floor(2331 * 0.25)); // 582
  });

  it('returns all zeros for 0 subscribers', () => {
    const pool = calculatePrizePool(0, 1000);
    expect(pool.total).toBe(0);
    expect(pool.jackpot).toBe(0);
    expect(pool.fourMatch).toBe(0);
    expect(pool.threeMatch).toBe(0);
  });

  it('returns all zeros for 0 contribution', () => {
    const pool = calculatePrizePool(100, 0);
    expect(pool.total).toBe(0);
    expect(pool.jackpot).toBe(0);
    expect(pool.fourMatch).toBe(0);
    expect(pool.threeMatch).toBe(0);
  });

  it('handles a single subscriber correctly', () => {
    const pool = calculatePrizePool(1, 2499); // £24.99 as pence
    expect(pool.total).toBe(2499);
    expect(pool.jackpot).toBe(Math.floor(2499 * 0.4));
    expect(pool.fourMatch).toBe(Math.floor(2499 * 0.35));
    expect(pool.threeMatch).toBe(Math.floor(2499 * 0.25));
  });

  it('handles large pool correctly', () => {
    const pool = calculatePrizePool(10000, 2499); // 10,000 subs × £24.99
    expect(pool.total).toBe(24990000);
    expect(pool.jackpot).toBe(Math.floor(24990000 * 0.4));
    expect(pool.fourMatch).toBe(Math.floor(24990000 * 0.35));
    expect(pool.threeMatch).toBe(Math.floor(24990000 * 0.25));
  });
});

// ─── splitPrizeAmongWinners ──────────────────────────────

describe('splitPrizeAmongWinners', () => {
  it('returns the full amount for a single winner', () => {
    expect(splitPrizeAmongWinners(40000, 1)).toBe(40000);
  });

  it('splits equally among 2 winners', () => {
    expect(splitPrizeAmongWinners(40000, 2)).toBe(20000);
  });

  it('splits equally among 5 winners', () => {
    expect(splitPrizeAmongWinners(50000, 5)).toBe(10000);
  });

  it('rounds down (floor) for uneven splits', () => {
    expect(splitPrizeAmongWinners(10000, 3)).toBe(3333); // 10000 / 3 = 3333.33
  });

  it('returns 0 when winner count is 0 (jackpot rollover)', () => {
    expect(splitPrizeAmongWinners(40000, 0)).toBe(0);
  });

  it('handles 0 pool amount', () => {
    expect(splitPrizeAmongWinners(0, 5)).toBe(0);
  });

  it('handles very large winner counts', () => {
    expect(splitPrizeAmongWinners(1000, 10000)).toBe(0); // Math.floor(0.1) = 0
  });

  it('handles 1 pence pool with 1 winner', () => {
    expect(splitPrizeAmongWinners(1, 1)).toBe(1);
  });
});

// ─── formatPenceToPounds ─────────────────────────────────

describe('formatPenceToPounds', () => {
  it('formats 0 pence', () => {
    expect(formatPenceToPounds(0)).toBe('£0.00');
  });

  it('formats 100 pence as £1.00', () => {
    expect(formatPenceToPounds(100)).toBe('£1.00');
  });

  it('formats 125000 pence as £1,250.00', () => {
    expect(formatPenceToPounds(125000)).toBe('£1,250.00');
  });

  it('formats small amounts correctly', () => {
    expect(formatPenceToPounds(50)).toBe('£0.50');
  });

  it('formats single pence', () => {
    expect(formatPenceToPounds(1)).toBe('£0.01');
  });

  it('formats very large amounts with commas', () => {
    expect(formatPenceToPounds(1000000)).toBe('£10,000.00');
  });
});

// ─── Jackpot Rollover Logic ──────────────────────────────
// Pure logic test: if no 5-match winner, the jackpot carries forward.

describe('Jackpot rollover logic', () => {
  /**
   * Simulates jackpot rollover across months.
   * If no jackpot winner (5-match), the jackpot amount carries to next month.
   */
  function simulateRollover(
    months: Array<{
      subscriberCount: number;
      contributionPence: number;
      hasJackpotWinner: boolean;
    }>
  ): number {
    let rolledOverJackpot = 0;
    let currentJackpot = 0;

    for (const month of months) {
      const pool = calculatePrizePool(
        month.subscriberCount,
        month.contributionPence
      );
      currentJackpot = pool.jackpot + rolledOverJackpot;

      if (month.hasJackpotWinner) {
        rolledOverJackpot = 0;
      } else {
        rolledOverJackpot = currentJackpot;
      }
    }

    return currentJackpot;
  }

  it('accumulates jackpot over months with no winner', () => {
    const result = simulateRollover([
      {
        subscriberCount: 100,
        contributionPence: 1000,
        hasJackpotWinner: false,
      },
      {
        subscriberCount: 100,
        contributionPence: 1000,
        hasJackpotWinner: false,
      },
    ]);
    // Month 1: jackpot = 40000, rolled over
    // Month 2: jackpot = 40000 + 40000 = 80000
    expect(result).toBe(80000);
  });

  it('resets jackpot rollover after a winner', () => {
    const result = simulateRollover([
      {
        subscriberCount: 100,
        contributionPence: 1000,
        hasJackpotWinner: false,
      },
      { subscriberCount: 100, contributionPence: 1000, hasJackpotWinner: true },
      {
        subscriberCount: 100,
        contributionPence: 1000,
        hasJackpotWinner: false,
      },
    ]);
    // Month 1: 40000 rolled over
    // Month 2: 40000 + 40000 = 80000 → winner → rollover reset to 0
    // Month 3: 40000 + 0 = 40000
    expect(result).toBe(40000);
  });

  it('returns base jackpot with no rollover on first month with a winner', () => {
    const result = simulateRollover([
      { subscriberCount: 100, contributionPence: 1000, hasJackpotWinner: true },
    ]);
    expect(result).toBe(40000);
  });

  it('accumulates across 5 consecutive months with no winner', () => {
    const months = Array.from({ length: 5 }, () => ({
      subscriberCount: 100,
      contributionPence: 1000,
      hasJackpotWinner: false,
    }));
    const result = simulateRollover(months);
    // Each month adds 40000 → 5 × 40000 = 200000
    // But it's additive with rollover: 40k, 80k, 120k, 160k, 200k
    expect(result).toBe(200000);
  });
});
