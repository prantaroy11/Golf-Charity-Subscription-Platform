'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Trophy,
  Heart,
  Ticket,
  TrendingUp,
  Download,
} from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';

// ──────────────────────────────────────────────────────────
// Admin Reports Page — Step 11.6
// Stat cards, monthly subscriber chart, CSV export
// ──────────────────────────────────────────────────────────

interface ReportData {
  stats: {
    activeSubscribers: number;
    totalUsers: number;
    drawsRun: number;
    totalWinners: number;
    totalCharityContributions: number;
    currentPrizePool: number;
  };
  monthlyData: { month: string; count: number }[];
  recentDrawEntries: Array<{
    id: string;
    user_id: string;
    scores: number[];
    created_at: string;
    users: { full_name: string | null; email: string } | null;
  }>;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      const reportData = await res.json();
      setData(reportData);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPence = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  const exportCSV = () => {
    if (!data?.recentDrawEntries) return;

    const headers = ['Name', 'Email', 'Scores', 'Entry Date'];
    const rows = data.recentDrawEntries.map((entry) => [
      entry.users?.full_name || 'Unknown',
      entry.users?.email || 'Unknown',
      entry.scores.join(', '),
      new Date(entry.created_at).toLocaleDateString('en-GB'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draw-entries-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = data?.stats;
  const maxChartValue = Math.max(
    ...(data?.monthlyData?.map((d) => d.count) || [1]),
    1
  );

  const statCards = [
    {
      label: 'Active Subscribers',
      value: stats?.activeSubscribers ?? 0,
      icon: Users,
      color: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-400',
      format: 'number',
    },
    {
      label: 'Current Prize Pool',
      value: stats?.currentPrizePool ?? 0,
      icon: Trophy,
      color: 'from-[#D4AF37]/20 to-[#D4AF37]/5',
      iconColor: 'text-[#D4AF37]',
      format: 'pence',
    },
    {
      label: 'Total Charity Contributions',
      value: stats?.totalCharityContributions ?? 0,
      icon: Heart,
      color: 'from-rose-500/20 to-rose-600/10',
      iconColor: 'text-rose-400',
      format: 'pence',
    },
    {
      label: 'Draws Run',
      value: stats?.drawsRun ?? 0,
      icon: Ticket,
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-400',
      format: 'number',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium text-[#F9F9F6]">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500">
              Platform performance overview
            </p>
          </div>
        </div>

        <GoldButton
          variant="ghost"
          icon={Download}
          onClick={exportCSV}
          className="!border-white/10 !text-gray-400 hover:!text-[#F9F9F6]"
          disabled={!data?.recentDrawEntries?.length}
        >
          Export CSV
        </GoldButton>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 animate-pulse"
              >
                <div className="h-10 bg-white/5 rounded-xl mb-3 w-10" />
                <div className="h-8 bg-white/5 rounded-lg mb-2 w-1/2" />
                <div className="h-4 bg-white/5 rounded-lg w-2/3" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 animate-pulse h-80" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {statCards.map((card) => (
              <motion.div
                key={card.label}
                variants={item}
                className="rounded-2xl bg-white/[0.03] border border-white/5 p-6"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} mb-3`}
                >
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <p className="text-2xl font-light text-[#F9F9F6] mb-1">
                  {card.format === 'pence'
                    ? formatPence(card.value)
                    : card.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  {card.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Monthly Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white/[0.03] border border-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-medium text-[#F9F9F6]">
                  Subscriber Growth
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Active subscribers over the last 12 months
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">
                  {stats?.activeSubscribers ?? 0} active
                </span>
              </div>
            </div>

            <div className="flex items-end gap-2 h-48">
              {data?.monthlyData?.map((d, i) => {
                const height =
                  maxChartValue > 0
                    ? Math.max((d.count / maxChartValue) * 100, 4)
                    : 4;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <span className="text-[10px] text-gray-500 font-medium">
                      {d.count}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className={`w-full rounded-t-lg transition-colors ${
                        i === (data?.monthlyData?.length ?? 0) - 1
                          ? 'bg-gradient-to-t from-[#D4AF37]/60 to-[#D4AF37]/30'
                          : 'bg-white/10 hover:bg-white/15'
                      }`}
                    />
                    <span className="text-[9px] text-gray-600 whitespace-nowrap">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Additional Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
          >
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 text-center">
              <p className="text-3xl font-light text-[#F9F9F6] mb-1">
                {stats?.totalUsers ?? 0}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Total Users
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 text-center">
              <p className="text-3xl font-light text-[#D4AF37] mb-1">
                {stats?.totalWinners ?? 0}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Total Winners
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 text-center">
              <p className="text-3xl font-light text-[#F9F9F6] mb-1">
                {data?.recentDrawEntries?.length ?? 0}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Recent Entries
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
