'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Hash,
  ChevronUp,
  ChevronDown,
  Info,
} from 'lucide-react';
import LightCard from '@/components/ui/LightCard';
import GoldButton from '@/components/ui/GoldButton';
import { useScores } from '@/hooks/useScores';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// ScoreEntry — Step 8.3
// Score management UI with 5-slot visual grid, stepper input,
// date picker, optimistic updates, and Framer Motion animations.
// ──────────────────────────────────────────────────────────

const MAX_SCORES = 5;
const MIN_SCORE = 1;
const MAX_SCORE = 45;

export default function ScoreEntry() {
  const { scores, loading, addScore, deleteScore } = useScores();

  // Form state
  const [scoreValue, setScoreValue] = useState<number>(20);
  const [playedAt, setPlayedAt] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Clear feedback after timeout
  const showFeedback = useCallback(
    (type: 'success' | 'error', message: string) => {
      setFeedback({ type, message });
      setTimeout(() => setFeedback(null), 4000);
    },
    []
  );

  // Stepper handlers
  const incrementScore = () => {
    setScoreValue((prev) => Math.min(prev + 1, MAX_SCORE));
  };
  const decrementScore = () => {
    setScoreValue((prev) => Math.max(prev - 1, MIN_SCORE));
  };

  // Direct input handler
  const handleScoreInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    setScoreValue(Math.min(Math.max(val, MIN_SCORE), MAX_SCORE));
  };

  // Submit handler
  const handleAddScore = async () => {
    if (submitting) return;
    setSubmitting(true);

    const result = await addScore(scoreValue, playedAt);

    if (result.success) {
      showFeedback('success', result.message || 'Score added!');
      setShowAddForm(false);
      setScoreValue(20);
      setPlayedAt(new Date().toISOString().split('T')[0]);
    } else {
      showFeedback('error', result.message || 'Failed to add score.');
    }

    setSubmitting(false);
  };

  // Delete handler
  const handleDeleteScore = async (scoreId: string) => {
    if (deletingId) return;
    setDeletingId(scoreId);

    const result = await deleteScore(scoreId);

    if (result.success) {
      showFeedback('success', 'Score removed.');
    } else {
      showFeedback('error', result.message || 'Failed to remove score.');
    }

    setDeletingId(null);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Determine the oldest score (shown in the rolling window note)
  const oldestScore =
    scores.length >= MAX_SCORES
      ? scores.reduce((oldest, curr) =>
          curr.played_at < oldest.played_at ? curr : oldest
        )
      : null;

  // Loading skeleton
  if (loading) {
    return (
      <LightCard className="p-6 sm:p-8" hover={false}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </LightCard>
    );
  }

  return (
    <LightCard className="p-6 sm:p-8" hover={false}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl font-medium text-[#1A2E1A]">
            Your Scores
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {scores.length} of {MAX_SCORES} score slots used
          </p>
        </div>
        <GoldButton
          variant="dark"
          size="sm"
          icon={Plus}
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={submitting}
        >
          Add Score
        </GoldButton>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium mb-4',
              feedback.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            )}
          >
            {feedback.type === 'success' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 10,
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              </motion.div>
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rolling window warning */}
      <AnimatePresence>
        {showAddForm && oldestScore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-700 mb-4"
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              All 5 slots are full. Adding a new score will replace your oldest
              score ({oldestScore.score} pts from{' '}
              {formatDate(oldestScore.played_at)}).
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Score Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-[#F9F9F6] rounded-2xl p-5 mb-6 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Score Stepper */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                    <Hash className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                    Stableford Score
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={decrementScore}
                      disabled={scoreValue <= MIN_SCORE || submitting}
                      className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#1A2E1A] hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Decrease score"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      min={MIN_SCORE}
                      max={MAX_SCORE}
                      value={scoreValue}
                      onChange={handleScoreInput}
                      disabled={submitting}
                      className="w-20 h-12 text-center text-2xl font-light font-sans text-[#1A2E1A] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="Score value"
                    />
                    <button
                      type="button"
                      onClick={incrementScore}
                      disabled={scoreValue >= MAX_SCORE || submitting}
                      className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#1A2E1A] hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Increase score"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-gray-400 ml-1">1–45</span>
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                    <Calendar className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                    Date Played
                  </label>
                  <input
                    type="date"
                    value={playedAt}
                    onChange={(e) => setPlayedAt(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={submitting}
                    className="w-full h-12 px-4 text-sm text-[#1A2E1A] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 transition-all"
                    aria-label="Date played"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-5 flex items-center gap-3">
                <GoldButton
                  variant="primary"
                  size="md"
                  icon={Plus}
                  loading={submitting}
                  onClick={handleAddScore}
                >
                  {submitting ? 'Adding…' : 'Add Score'}
                </GoldButton>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={submitting}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Filled Slots */}
        <AnimatePresence mode="popLayout">
          {scores.map((s, idx) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
            >
              <div
                className={cn(
                  'group relative bg-white border rounded-2xl p-4 transition-all duration-300',
                  deletingId === s.id
                    ? 'border-red-200 bg-red-50/50'
                    : 'border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-sm'
                )}
              >
                {/* Score Value */}
                <div className="text-center">
                  <span className="text-3xl font-light text-[#1A2E1A] tabular-nums">
                    {s.score}
                  </span>
                  <span className="block text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
                    pts
                  </span>
                </div>

                {/* Date */}
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-400">
                    {formatDate(s.played_at)}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteScore(s.id)}
                  disabled={!!deletingId}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all text-gray-400"
                  aria-label={`Delete score ${s.score}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Slot number indicator */}
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] text-gray-300 font-medium">
                    #{idx + 1}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty Slots */}
        {Array.from({ length: MAX_SCORES - scores.length }).map((_, i) => (
          <motion.div
            key={`empty-${i}`}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: scores.length * 0.05 + i * 0.05 }}
          >
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all duration-300"
              onClick={() => setShowAddForm(true)}
              role="button"
              tabIndex={0}
              aria-label="Add a new score"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setShowAddForm(true);
              }}
            >
              <Plus className="w-5 h-5 text-gray-300 mb-1" />
              <span className="text-xs text-gray-300 font-medium">
                Slot {scores.length + i + 1}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Footer */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Your scores are used in the monthly draw. Only your latest {MAX_SCORES}{' '}
        are kept.
      </p>
    </LightCard>
  );
}
