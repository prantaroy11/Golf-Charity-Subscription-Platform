'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Info } from 'lucide-react';
import ScoreEntry from '@/components/features/scores/ScoreEntry';
import LightCard from '@/components/ui/LightCard';

// ──────────────────────────────────────────────────────────
// Scores Page — Step 10.4
// Full ScoreEntry component with explanation.
// ──────────────────────────────────────────────────────────

export default function ScoresPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A2E1A]">
              Score Management
            </h1>
            <p className="text-sm text-gray-500">
              Enter and manage your latest golf scores.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <LightCard className="p-5" hover={false}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#1A2E1A]">
                How scores work
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your scores are used in the monthly draw. Only your latest 5
                scores are kept — when all slots are filled, adding a new score
                will replace your oldest one. Enter your Stableford scores
                (1–45) with the date you played.
              </p>
            </div>
          </div>
        </LightCard>
      </motion.div>

      {/* Full Score Entry Component */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ScoreEntry />
      </motion.div>
    </div>
  );
}
