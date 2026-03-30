import { z } from 'zod';

// ──────────────────────────────────────────────────────────
// Score Validation Schema — Step 8.1
// Stableford score range: 1–45, date in YYYY-MM-DD format
// ──────────────────────────────────────────────────────────

export const scoreSchema = z.object({
  score: z
    .number()
    .int()
    .min(1, 'Score must be at least 1')
    .max(45, 'Score must be at most 45'),
  played_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date required (YYYY-MM-DD)'),
});

export type ScoreFormData = z.infer<typeof scoreSchema>;
