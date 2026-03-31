// ──────────────────────────────────────────────────────────
// Prize Pool Calculation — Step 9.2
// Tier split: 40% jackpot / 35% four-match / 25% three-match
// ──────────────────────────────────────────────────────────

export interface PrizePoolBreakdown {
  total: number; // total pool in pence
  jackpot: number; // 40% — 5-match prize
  fourMatch: number; // 35% — 4-match prize
  threeMatch: number; // 25% — 3-match prize
}

/**
 * Calculate the monthly prize pool from active subscriber count
 * and per-subscriber contribution (in pence).
 *
 * @param activeSubscriberCount - number of active subscribers this month
 * @param monthlyContributionPence - pence contributed per subscriber to the prize pool
 * @returns breakdown by tier
 */
export function calculatePrizePool(
  activeSubscriberCount: number,
  monthlyContributionPence: number
): PrizePoolBreakdown {
  const total = activeSubscriberCount * monthlyContributionPence;
  return {
    total,
    jackpot: Math.floor(total * 0.4),
    fourMatch: Math.floor(total * 0.35),
    threeMatch: Math.floor(total * 0.25),
  };
}

/**
 * Split a prize amount equally among N winners.
 * Returns 0 if there are no winners (pool carries forward for jackpot).
 *
 * @param poolAmount - total pence available for this tier
 * @param winnerCount - number of winners in this tier
 * @returns pence per winner
 */
export function splitPrizeAmongWinners(
  poolAmount: number,
  winnerCount: number
): number {
  return winnerCount === 0 ? 0 : Math.floor(poolAmount / winnerCount);
}

/**
 * Format pence as a GBP currency string.
 * e.g. 125000 → "₹1,250.00"
 */
export function formatPenceToPounds(pence: number): string {
  return `₹${(pence / 100).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
