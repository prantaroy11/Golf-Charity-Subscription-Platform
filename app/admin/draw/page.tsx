'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Zap,
  Shuffle,
  Play,
  Globe,
  AlertTriangle,
  Trophy,
  ChevronDown,
  Check,
} from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';

// ──────────────────────────────────────────────────────────
// Admin Draw Page — Step 11.3
// Draw configuration, simulation, and publishing
// ──────────────────────────────────────────────────────────

interface DrawResult {
  draw: {
    id: string;
    draw_month: string;
    numbers_drawn: number[];
    draw_type: string;
    status: string;
  };
  prizePool: {
    total: number;
    jackpot: number;
    fourMatch: number;
    threeMatch: number;
    jackpotRolledOver: boolean;
    rolledOverAmount: number;
  };
  winners: {
    fiveMatch: { count: number; prizePerWinner: number };
    fourMatch: { count: number; prizePerWinner: number };
    threeMatch: { count: number; prizePerWinner: number };
  };
  meta: {
    activeSubscribers: number;
    totalEntries: number;
    totalWinners: number;
  };
}

interface PastDraw {
  id: string;
  draw_month: string;
  numbers_drawn: number[];
  draw_type: string;
  status: string;
  jackpot_pool: number;
  published_at: string | null;
}

export default function AdminDrawPage() {
  // Draw configuration
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [drawMonth, setDrawMonth] = useState(currentMonth);
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random');

  // State
  const [simulationResult, setSimulationResult] = useState<DrawResult | null>(
    null
  );
  const [publishing, setPublishing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [error, setError] = useState('');

  // Past draws
  const [pastDraws, setPastDraws] = useState<PastDraw[]>([]);
  const [loadingPastDraws, setLoadingPastDraws] = useState(true);

  const fetchPastDraws = useCallback(async () => {
    setLoadingPastDraws(true);
    try {
      const res = await fetch('/api/admin/draws');
      const data = await res.json();
      setPastDraws(data.draws || []);
    } catch {
      console.error('Failed to fetch past draws');
    } finally {
      setLoadingPastDraws(false);
    }
  }, []);

  useEffect(() => {
    fetchPastDraws();
  }, [fetchPastDraws]);

  const executeDraw = async (mode: 'simulation' | 'publish') => {
    setError('');
    if (mode === 'simulation') {
      setSimulating(true);
    } else {
      setPublishing(true);
    }

    try {
      const res = await fetch('/api/draw/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawMonth, drawType, mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Draw execution failed');
        return;
      }

      if (mode === 'simulation') {
        setSimulationResult(data);
      } else {
        setSimulationResult(data);
        setConfirmPublish(false);
        fetchPastDraws();
      }
    } catch {
      setError('Something went wrong executing the draw');
    } finally {
      setSimulating(false);
      setPublishing(false);
    }
  };

  const formatPence = (pence: number) => {
    return `₹${(pence / 100).toFixed(2)}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
          <Ticket className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div>
          <h1 className="text-xl font-serif font-medium text-[#F9F9F6]">
            Draw Management
          </h1>
          <p className="text-sm text-gray-500">
            Configure and execute monthly prize draws
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Configuration ── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Month Selector */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
            <h3 className="text-sm font-medium text-[#F9F9F6] mb-4">
              Draw Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Draw Month
                </label>
                <input
                  type="month"
                  value={drawMonth}
                  onChange={(e) => setDrawMonth(e.target.value)}
                  id="admin-draw-month"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
                  Draw Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDrawType('random')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                      drawType === 'random'
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                        : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    <Shuffle
                      className={`w-5 h-5 ${
                        drawType === 'random'
                          ? 'text-[#D4AF37]'
                          : 'text-gray-600'
                      }`}
                    />
                    <span className="text-xs font-medium">Random</span>
                  </button>
                  <button
                    onClick={() => setDrawType('algorithmic')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                      drawType === 'algorithmic'
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                        : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    <Zap
                      className={`w-5 h-5 ${
                        drawType === 'algorithmic'
                          ? 'text-[#D4AF37]'
                          : 'text-gray-600'
                      }`}
                    />
                    <span className="text-xs font-medium">Algorithmic</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <GoldButton
                variant="ghost"
                loading={simulating}
                onClick={() => executeDraw('simulation')}
                icon={Play}
                className="w-full !border-white/10 !text-gray-300 hover:!text-[#F9F9F6] hover:!bg-white/5"
              >
                Run Simulation
              </GoldButton>
              <GoldButton
                variant="primary"
                loading={publishing}
                onClick={() => setConfirmPublish(true)}
                icon={Globe}
                className="w-full"
                disabled={!simulationResult}
              >
                Publish Results
              </GoldButton>
            </div>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulation Results */}
          <AnimatePresence mode="wait">
            {simulationResult ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                {/* Numbers Drawn */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-[#F9F9F6]">
                      Numbers Drawn
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        simulationResult.draw.status === 'published'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {simulationResult.draw.status === 'published'
                        ? 'Published'
                        : 'Simulation'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    {simulationResult.draw.numbers_drawn.map((num, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.15, type: 'spring' }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F1D570] flex items-center justify-center text-lg font-bold text-[#1A2E1A]"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {simulationResult.draw.draw_month} •{' '}
                    {simulationResult.draw.draw_type} draw
                  </p>
                </div>

                {/* Prize Pool */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
                  <h3 className="text-sm font-medium text-[#F9F9F6] mb-4">
                    Prize Pool
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Total Pool',
                        value: formatPence(simulationResult.prizePool.total),
                        accent: true,
                      },
                      {
                        label: 'Jackpot (5-Match)',
                        value: formatPence(simulationResult.prizePool.jackpot),
                      },
                      {
                        label: '4-Match',
                        value: formatPence(
                          simulationResult.prizePool.fourMatch
                        ),
                      },
                      {
                        label: '3-Match',
                        value: formatPence(
                          simulationResult.prizePool.threeMatch
                        ),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-4 rounded-xl ${
                          item.accent
                            ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20'
                            : 'bg-white/[0.02] border border-white/5'
                        }`}
                      >
                        <p className="text-xs text-gray-500 mb-1">
                          {item.label}
                        </p>
                        <p
                          className={`text-lg font-medium ${
                            item.accent ? 'text-[#D4AF37]' : 'text-[#F9F9F6]'
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {simulationResult.prizePool.jackpotRolledOver && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 flex items-center gap-2">
                      <Trophy className="w-4 h-4 shrink-0" />
                      Jackpot rolls over to next month — no 5-match winners
                    </div>
                  )}
                </div>

                {/* Winners */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
                  <h3 className="text-sm font-medium text-[#F9F9F6] mb-4">
                    Winners
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        tier: '5-Match (Jackpot)',
                        data: simulationResult.winners.fiveMatch,
                        color: 'text-[#D4AF37]',
                        bg: 'bg-[#D4AF37]/10 border-[#D4AF37]/20',
                      },
                      {
                        tier: '4-Match',
                        data: simulationResult.winners.fourMatch,
                        color: 'text-emerald-400',
                        bg: 'bg-emerald-500/10 border-emerald-500/20',
                      },
                      {
                        tier: '3-Match',
                        data: simulationResult.winners.threeMatch,
                        color: 'text-blue-400',
                        bg: 'bg-blue-500/10 border-blue-500/20',
                      },
                    ].map(({ tier, data, color, bg }) => (
                      <div key={tier} className={`p-4 rounded-xl border ${bg}`}>
                        <p className="text-xs text-gray-500 mb-1">{tier}</p>
                        <p className={`text-2xl font-light ${color}`}>
                          {data.count}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {data.count > 0
                            ? `${formatPence(data.prizePerWinner)} each`
                            : 'No winners'}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">
                        Active Subscribers
                      </p>
                      <p className="text-lg font-medium text-[#F9F9F6]">
                        {simulationResult.meta.activeSubscribers}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Entries</p>
                      <p className="text-lg font-medium text-[#F9F9F6]">
                        {simulationResult.meta.totalEntries}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Winners</p>
                      <p className="text-lg font-medium text-[#D4AF37]">
                        {simulationResult.meta.totalWinners}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-white/[0.03] border border-white/5 p-12 text-center"
              >
                <Ticket className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                <p className="text-gray-500 text-sm mb-1">
                  No simulation results yet
                </p>
                <p className="text-gray-600 text-xs">
                  Configure the draw and run a simulation to see results
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Past Draws */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-[#F9F9F6]">Past Draws</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
                      Month
                    </th>
                    <th className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
                      Numbers
                    </th>
                    <th className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
                      Type
                    </th>
                    <th className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
                      Jackpot
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPastDraws ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : pastDraws.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-600 text-sm"
                      >
                        No past draws found
                      </td>
                    </tr>
                  ) : (
                    pastDraws.map((draw) => (
                      <tr
                        key={draw.id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#F9F9F6]">
                          {draw.draw_month}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {draw.numbers_drawn.map((n, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#D4AF37]/10 text-xs font-bold text-[#D4AF37]"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 capitalize">
                          {draw.draw_type}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              draw.status === 'published'
                                ? 'bg-green-500/15 text-green-400'
                                : draw.status === 'simulation'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-gray-500/15 text-gray-400'
                            }`}
                          >
                            {draw.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#F9F9F6]">
                          {formatPence(draw.jackpot_pool || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirm Publish Modal ── */}
      <AnimatePresence>
        {confirmPublish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmPublish(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] bg-[#1A2E1A] border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-serif font-medium text-[#F9F9F6]">
                  Publish Draw Results?
                </h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                This will publish the draw results for{' '}
                <strong className="text-[#F9F9F6]">{drawMonth}</strong> and make
                them visible to all users. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <GoldButton
                  variant="ghost"
                  onClick={() => setConfirmPublish(false)}
                  className="flex-1 !border-white/10 !text-gray-400"
                >
                  Cancel
                </GoldButton>
                <GoldButton
                  variant="primary"
                  loading={publishing}
                  onClick={() => executeDraw('publish')}
                  icon={Globe}
                  className="flex-1"
                >
                  Publish Now
                </GoldButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
