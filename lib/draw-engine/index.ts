// ──────────────────────────────────────────────────────────
// Draw Engine — Core Logic (Step 9.1)
// Random & Algorithmic draw generation + match-tier detection
// ──────────────────────────────────────────────────────────

import crypto from 'crypto';

/**
 * Generate 5 unique random numbers between 1–45 (inclusive)
 * using Node.js cryptographic randomness.
 */
export function generateRandomDraw(): number[] {
  const numbers: Set<number> = new Set();
  while (numbers.size < 5) {
    const val = crypto.randomInt(1, 46); // 1–45 inclusive
    numbers.add(val);
  }
  return [...numbers].sort((a, b) => a - b);
}

/**
 * Generate 5 unique numbers weighted by score frequency.
 * Higher-frequency scores have a proportionally higher chance of selection.
 *
 * @param allScores - flat array of every active subscriber's score values
 * @returns sorted array of 5 unique drawn numbers
 */
export function generateAlgorithmicDraw(allScores: number[]): number[] {
  // If not enough distinct scores, fall back to random
  if (allScores.length === 0) return generateRandomDraw();

  // Count frequency of each score value (1–45)
  const freq = new Map<number, number>();
  for (const s of allScores) {
    freq.set(s, (freq.get(s) ?? 0) + 1);
  }

  // Build weighted pool: each score value appears `frequency` times
  const weightedPool: number[] = [];
  for (const [value, count] of freq.entries()) {
    for (let i = 0; i < count; i++) {
      weightedPool.push(value);
    }
  }

  // Select 5 unique numbers using weighted random sampling
  const selected: Set<number> = new Set();
  let attempts = 0;
  const maxAttempts = 10000;

  while (selected.size < 5 && attempts < maxAttempts) {
    const idx = crypto.randomInt(0, weightedPool.length);
    selected.add(weightedPool[idx]);
    attempts++;
  }

  // If we couldn't get 5 unique from weighted pool (very unlikely),
  // fill remaining with plain random 1–45
  while (selected.size < 5) {
    const val = crypto.randomInt(1, 46);
    selected.add(val);
  }

  return [...selected].sort((a, b) => a - b);
}

/**
 * Determine the match tier for a user's scores vs the drawn numbers.
 *
 * @param userScores - the user's 5 score values (numbers only, not full Score objects)
 * @param drawnNumbers - the 5 numbers drawn for the month
 * @returns 'five' | 'four' | 'three' | null
 */
export function getMatchTier(
  userScores: number[],
  drawnNumbers: number[]
): 'five' | 'four' | 'three' | null {
  const drawnSet = new Set(drawnNumbers);
  const matches = userScores.filter((s) => drawnSet.has(s)).length;
  if (matches === 5) return 'five';
  if (matches === 4) return 'four';
  if (matches >= 3) return 'three';
  return null;
}

/**
 * Count how many scores match between user scores and drawn numbers.
 * Useful for detailed display on the results page.
 */
export function countMatches(
  userScores: number[],
  drawnNumbers: number[]
): number {
  const drawnSet = new Set(drawnNumbers);
  return userScores.filter((s) => drawnSet.has(s)).length;
}
