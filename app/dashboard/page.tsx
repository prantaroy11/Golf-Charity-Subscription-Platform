'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Ticket,
  ArrowRight,
  Heart,
  Leaf,
} from 'lucide-react';
import LightCard from '@/components/ui/LightCard';
import StatusBadge from '@/components/ui/StatusBadge';

import LifetimeContribution from '@/components/features/dashboard/LifetimeContribution';
import ScoreEntry from '@/components/features/scores/ScoreEntry';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Dashboard Overview — Step 10.2
// 3-column layout: main (2 cols) + sidebar (1 col)
// Welcome banner, subscription card, score entry,
// participation, current draw, and impact feed.
// ──────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMonthName(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString(
      'en-GB',
      { month: 'long', year: 'numeric' }
    );
  } catch {
    return monthStr;
  }
}

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { subscription } = useSubscription(user, userLoading);
  const [drawsEnteredCount, setDrawsEnteredCount] = useState(0);
  const [nextDrawMonth, setNextDrawMonth] = useState('');
  const [currentDraw, setCurrentDraw] = useState<{
    draw_month: string;
    status: string;
    numbers_drawn: number[];
  } | null>(null);
  const [impactFeed, setImpactFeed] = useState<
    { type: string; text: string; date: string }[]
  >([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    async function fetchDashboardData() {
      if (!profile?.id) return;

      // Calculate next draw month locally (no API needed)
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthStr = `${nextMonth.getFullYear()}-${String(
        nextMonth.getMonth() + 1
      ).padStart(2, '0')}`;
      setNextDrawMonth(nextMonthStr);

      try {
        // Fetch all dashboard data in a single batched request
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setDrawsEnteredCount(data.drawsEnteredCount ?? 0);
          setCurrentDraw(data.currentDraw ?? null);
          setImpactFeed(data.impactFeed ?? []);
        }
      } catch (err) {
        console.error('Dashboard data fetch failed:', err);
      } finally {
        setDashboardLoading(false);
      }
    }

    fetchDashboardData();
  }, [profile?.id]);

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  // Calculate days until next draw
  const now = new Date();
  const daysUntilNextDraw = (() => {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = nextMonth.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div {...fadeIn}>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A2E1A]">
          {getGreeting()},{' '}
          <span className="text-gold-gradient">{firstName}</span>.
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Here&apos;s your dashboard overview.
        </p>
      </motion.div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Area (2 cols) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <LightCard className="p-6" hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                    Subscription
                  </p>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={
                        (subscription?.status as
                          | 'active'
                          | 'cancelled'
                          | 'lapsed'
                          | 'pending') ?? 'pending'
                      }
                    />
                    <span className="text-sm text-gray-500 capitalize">
                      {subscription?.plan ?? '—'} plan
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
                    Renews
                  </p>
                  <p className="text-sm font-medium text-[#1A2E1A]">
                    {renewalDate}
                  </p>
                </div>
              </div>
            </LightCard>
          </motion.div>

          {/* Score Entry Widget */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ScoreEntry />
          </motion.div>

          {/* Participation Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LightCard className="p-6" hover={false}>
              <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
                Draw Participation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-2xl font-light text-[#1A2E1A] tabular-nums">
                      {dashboardLoading ? '—' : drawsEnteredCount}
                    </p>
                    <p className="text-xs text-gray-400">Draws Entered</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A2E1A]/5 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#1A2E1A]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A2E1A]">
                      {getMonthName(nextDrawMonth)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Next draw in {daysUntilNextDraw} days
                    </p>
                  </div>
                </div>
              </div>
            </LightCard>
          </motion.div>

          {/* Lifetime Contribution */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LifetimeContribution />
          </motion.div>
        </div>

        {/* ── Sidebar (1 col) ── */}
        <div className="space-y-6">
          {/* Current Draw Card — Dark */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-[#1A2E1A] rounded-[2rem] p-6 relative overflow-hidden">
              {/* Trophy watermark */}
              <Trophy className="absolute bottom-4 right-4 w-24 h-24 text-[#D4AF37]/5" />

              <p className="text-xs font-medium uppercase tracking-widest text-[#D4AF37] mb-3">
                {currentDraw ? 'Current Draw' : 'Next Draw'}
              </p>

              <h3 className="font-serif text-xl font-medium text-[#F9F9F6] mb-2">
                {currentDraw
                  ? getMonthName(currentDraw.draw_month)
                  : getMonthName(nextDrawMonth)}
              </h3>

              {/* Countdown */}
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {daysUntilNextDraw} days remaining
                </span>
              </div>

              {/* Entry status */}
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Entry Status</span>
                  <StatusBadge
                    status={drawsEnteredCount > 0 ? 'active' : 'pending'}
                    label={drawsEnteredCount > 0 ? 'Entered' : 'Not Entered'}
                  />
                </div>
              </div>

              {currentDraw &&
                currentDraw.status === 'published' &&
                currentDraw.numbers_drawn.length > 0 && (
                  <Link
                    href={`/draws/${currentDraw.draw_month}`}
                    className="flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#F1D570] transition-colors"
                  >
                    View Results
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
            </div>
          </motion.div>

          {/* Impact Feed */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LightCard className="p-6" hover={false}>
              <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
                Recent Activity
              </h3>

              {impactFeed.length === 0 ? (
                <div className="text-center py-6">
                  <Leaf className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No activity yet. Start entering scores!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {impactFeed.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                          item.type === 'contribution'
                            ? 'bg-[#1A2E1A]/5'
                            : 'bg-[#D4AF37]/10'
                        )}
                      >
                        {item.type === 'contribution' ? (
                          <Heart className="w-4 h-4 text-[#1A2E1A]" />
                        ) : (
                          <Trophy className="w-4 h-4 text-[#D4AF37]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A2E1A] truncate">
                          {item.text}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {impactFeed.length > 0 && (
                <Link
                  href="/dashboard/winnings"
                  className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400 hover:text-[#1A2E1A] transition-colors"
                >
                  View Full History
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </LightCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
