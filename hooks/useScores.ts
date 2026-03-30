'use client';

import { useEffect, useState, useCallback } from 'react';
import { Score } from '@/types';

// ──────────────────────────────────────────────────────────
// useScores Hook — Step 8.4
// Fetches, adds, and deletes scores via /api/scores
// Manages optimistic state updates for instant UI feedback
// ──────────────────────────────────────────────────────────

export function useScores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scores on mount
  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scores');
      if (!res.ok) {
        throw new Error('Failed to fetch scores');
      }
      const data = await res.json();
      setScores(data.scores || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  // Add a score — optimistic update
  const addScore = useCallback(
    async (
      score: number,
      played_at: string
    ): Promise<{ success: boolean; message?: string }> => {
      // Build optimistic score
      const optimisticScore: Score = {
        id: `temp_${Date.now()}`,
        user_id: '',
        score,
        played_at,
        created_at: new Date().toISOString(),
      };

      // Save previous state for rollback
      const previousScores = [...scores];

      // Optimistic update: add to front, trim to 5
      setScores((prev) => {
        const updated = [optimisticScore, ...prev];
        // If over 5, remove the last (oldest by played_at)
        if (updated.length > 5) {
          return updated.slice(0, 5);
        }
        return updated;
      });

      try {
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, played_at }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Rollback on failure
          setScores(previousScores);
          return {
            success: false,
            message: data.error || 'Failed to add score',
          };
        }

        // Refetch to get the actual data from DB
        await fetchScores();
        return {
          success: true,
          message: data.message,
        };
      } catch {
        // Rollback
        setScores(previousScores);
        return {
          success: false,
          message: 'Network error. Please try again.',
        };
      }
    },
    [scores, fetchScores]
  );

  // Delete a score — optimistic update
  const deleteScore = useCallback(
    async (
      scoreId: string
    ): Promise<{ success: boolean; message?: string }> => {
      const previousScores = [...scores];

      // Optimistic removal
      setScores((prev) => prev.filter((s) => s.id !== scoreId));

      try {
        const res = await fetch(`/api/scores?id=${scoreId}`, {
          method: 'DELETE',
        });

        const data = await res.json();

        if (!res.ok) {
          setScores(previousScores);
          return {
            success: false,
            message: data.error || 'Failed to delete score',
          };
        }

        return {
          success: true,
          message: data.message,
        };
      } catch {
        setScores(previousScores);
        return {
          success: false,
          message: 'Network error. Please try again.',
        };
      }
    },
    [scores]
  );

  return {
    scores,
    loading,
    error,
    addScore,
    deleteScore,
    refetch: fetchScores,
  };
}
