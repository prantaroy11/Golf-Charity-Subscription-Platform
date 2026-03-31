'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ArrowRight,
  Calendar,
  Users,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import Footer from '@/components/layout/Footer';
import type { Draw, PrizePool } from '@/types';

// ──────────────────────────────────────────────────────────
// Draw Results Page — Step 9.4
// Dynamic route: /draws/[month] (e.g. /draws/2026-03)
// Animated number reveal, tier breakdown, jackpot rollover
// ──────────────────────────────────────────────────────────

interface WinnerInfo {
  id: string;
  user_id: string;
  match_tier: 'five' | 'four' | 'three';
  prize_amount: number;
  payout_status: string;
}

interface DrawPageData {
  draw: Draw;
  winners: {
    five: WinnerInfo[];
    four: WinnerInfo[];
    three: WinnerInfo[];
  };
  prizePool: PrizePool | null;
  historicalDraws: string[];
}

function formatMonth(drawMonth: string): string {
  const [year, month] = drawMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function formatPence(pence: number): string {
  return `₹${(pence / 100).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Number Ball Component ──
function DrawnNumber({
  number,
  index,
  revealed,
}: {
  number: number;
  index: number;
  revealed: boolean;
}) {
  return (
    <AnimatePresence>
      {revealed && (
        <motion.div
          initial={{ scale: 0, opacity: 0, rotateY: 180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{
            delay: index * 0.3,
            duration: 0.5,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          className="relative"
        >
          {/* Glow effect behind ball */}
          <div className="absolute inset-0 bg-[#D4AF37]/30 rounded-full blur-xl scale-150" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.5)]">
            <span className="text-[#1A2E1A] font-bold text-2xl sm:text-3xl lg:text-4xl tabular-nums">
              {number}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Tier Card Component ──
function TierCard({
  tier,
  label,
  icon,
  winnerCount,
  prizePerWinner,
  totalPool,
  poolPercentage,
  isJackpot,
  rolledOver,
}: {
  tier: string;
  label: string;
  icon: React.ReactNode;
  winnerCount: number;
  prizePerWinner: number;
  totalPool: number;
  poolPercentage: string;
  isJackpot?: boolean;
  rolledOver?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-[2rem] border p-8 ${
        isJackpot
          ? 'bg-[#1A2E1A] border-[#D4AF37]/30 text-[#F9F9F6]'
          : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      {/* Decorative background number */}
      <div
        className={`absolute -top-4 -right-4 font-serif font-bold text-[120px] leading-none select-none pointer-events-none ${
          isJackpot ? 'text-[#D4AF37]/5' : 'text-gray-100'
        }`}
      >
        {tier}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isJackpot
                ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                : 'bg-[#D4AF37]/10 text-[#D4AF37]'
            }`}
          >
            {icon}
          </div>
          <div>
            <h3
              className={`font-serif text-xl font-medium ${
                isJackpot ? 'text-[#F9F9F6]' : 'text-[#1A2E1A]'
              }`}
            >
              {label}
            </h3>
            <span
              className={`text-xs uppercase tracking-widest font-medium ${
                isJackpot ? 'text-[#D4AF37]' : 'text-gray-400'
              }`}
            >
              {poolPercentage} of pool
            </span>
          </div>
        </div>

        {/* Pool amount */}
        <div className="mb-4">
          <span
            className={`text-xs uppercase tracking-widest font-medium ${
              isJackpot ? 'text-gray-400' : 'text-gray-400'
            }`}
          >
            Total Pool
          </span>
          <p
            className={`text-3xl font-light tabular-nums ${
              isJackpot ? 'text-gold-gradient' : 'text-[#1A2E1A]'
            }`}
          >
            {formatPence(totalPool)}
          </p>
        </div>

        {/* Winners */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Users
                className={`w-4 h-4 ${
                  isJackpot ? 'text-gray-400' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isJackpot ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {winnerCount} {winnerCount === 1 ? 'winner' : 'winners'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-xs ${
                isJackpot ? 'text-gray-400' : 'text-gray-400'
              }`}
            >
              Per winner
            </span>
            <p
              className={`text-lg font-bold ${
                isJackpot ? 'text-[#D4AF37]' : 'text-[#1A2E1A]'
              }`}
            >
              {winnerCount > 0 ? formatPence(prizePerWinner) : '—'}
            </p>
          </div>
        </div>

        {/* Jackpot rollover banner */}
        {isJackpot && rolledOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.5 }}
            className="mt-6 p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20"
          >
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <p className="text-sm text-[#D4AF37] font-medium">
                No 5-match winner — jackpot carries forward to next month!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page Component ──
export default function DrawResultsPage() {
  const params = useParams();
  const month = params?.month as string;

  const [data, setData] = useState<DrawPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numbersRevealed, setNumbersRevealed] = useState(false);

  useEffect(() => {
    if (!month) return;

    async function fetchDraw() {
      try {
        const res = await fetch(`/api/draw/${month}`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || 'Draw not found');
          return;
        }
        const result = await res.json();
        setData(result);

        // Trigger number reveal after a short delay
        setTimeout(() => setNumbersRevealed(true), 600);
      } catch {
        setError('Failed to load draw results');
      } finally {
        setLoading(false);
      }
    }

    fetchDraw();
  }, [month]);

  // ── Loading State ──
  if (loading) {
    return (
      <>
        <section className="bg-[#1A2E1A] min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="flex gap-3 justify-center mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 animate-pulse"
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm">Loading draw results...</p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  // ── Error / Not Found State ──
  if (error || !data) {
    return (
      <>
        <section className="bg-[#1A2E1A] min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h1 className="font-serif text-3xl text-[#F9F9F6] mb-2">
              {error || 'Draw not found'}
            </h1>
            <p className="text-gray-400 mb-6">
              This draw may not have been published yet.
            </p>
            <Link
              href="/draws"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F1D570] text-[#1A2E1A] font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-shadow duration-300"
            >
              View All Draws
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </section>
        <Footer />
      </>
    );
  }

  const { draw, winners, prizePool, historicalDraws } = data;
  const jackpotRolledOver =
    prizePool?.jackpot_rolled_over ?? winners.five.length === 0;

  return (
    <>
      {/* ── Dark Hero — Animated Number Reveal ── */}
      <section className="bg-[#1A2E1A] min-h-[70vh] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Date badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-gray-300 font-medium">
                {draw.draw_type.charAt(0).toUpperCase() +
                  draw.draw_type.slice(1)}{' '}
                Draw
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#F9F9F6] mb-4">
              <span className="text-gold-gradient">
                {formatMonth(draw.draw_month)}
              </span>{' '}
              Draw
            </h1>
            <p className="text-gray-400 text-lg mb-12 font-light">
              The winning numbers are in
            </p>

            {/* ── Animated Number Balls ── */}
            <div className="flex items-center justify-center gap-3 sm:gap-5 lg:gap-7 mb-12">
              {draw.numbers_drawn.map((num, idx) => (
                <DrawnNumber
                  key={idx}
                  number={num}
                  index={idx}
                  revealed={numbersRevealed}
                />
              ))}
            </div>

            {/* Draw info pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0, duration: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-gray-300">
                {winners.five.length +
                  winners.four.length +
                  winners.three.length}{' '}
                total winners this month
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Tier Breakdown ── */}
      <section className="bg-[#F9F9F6] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A2E1A] mb-2">
              Prize Breakdown
            </h2>
            <p className="text-gray-500 text-lg font-light">
              How the prize pool was distributed across match tiers
            </p>
          </motion.div>

          {/* Tier cards grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jackpot — 5 Match */}
            <TierCard
              tier="5"
              label="Jackpot — 5 Match"
              icon={<Trophy className="w-6 h-6" />}
              winnerCount={winners.five.length}
              prizePerWinner={
                winners.five.length > 0 ? winners.five[0].prize_amount : 0
              }
              totalPool={prizePool?.jackpot_amount ?? draw.jackpot_pool}
              poolPercentage="40%"
              isJackpot
              rolledOver={jackpotRolledOver}
            />

            {/* 4 Match */}
            <TierCard
              tier="4"
              label="4-Number Match"
              icon={<Sparkles className="w-6 h-6" />}
              winnerCount={winners.four.length}
              prizePerWinner={
                winners.four.length > 0 ? winners.four[0].prize_amount : 0
              }
              totalPool={prizePool?.four_match_amount ?? draw.four_match_pool}
              poolPercentage="35%"
            />

            {/* 3 Match */}
            <TierCard
              tier="3"
              label="3-Number Match"
              icon={<Users className="w-6 h-6" />}
              winnerCount={winners.three.length}
              prizePerWinner={
                winners.three.length > 0 ? winners.three[0].prize_amount : 0
              }
              totalPool={prizePool?.three_match_amount ?? draw.three_match_pool}
              poolPercentage="25%"
            />
          </div>

          {/* Total prize pool summary */}
          {prizePool && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-8 rounded-[2rem] bg-[#D4AF37]/5 border border-[#D4AF37]/10"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium">
                    Total Prize Pool
                  </span>
                  <p className="text-4xl font-light text-[#1A2E1A] tabular-nums">
                    {formatPence(prizePool.total_pool)}
                  </p>
                </div>
                {jackpotRolledOver && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                    <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-sm text-[#D4AF37] font-medium">
                      Jackpot rolls over
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Historical Draws ── */}
      {historicalDraws.length > 1 && (
        <section className="bg-[#F9F9F6] pb-16 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="border-t border-gray-200 pt-12">
              <h3 className="font-serif text-2xl font-medium text-[#1A2E1A] mb-6">
                Past Draws
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {historicalDraws
                  .filter((m) => m !== draw.draw_month)
                  .map((drawMonth, idx) => (
                    <motion.div
                      key={drawMonth}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={`/draws/${drawMonth}`}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-sm transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                          <span className="font-medium text-[#1A2E1A]">
                            {formatMonth(drawMonth)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#D4AF37] transition-colors" />
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
