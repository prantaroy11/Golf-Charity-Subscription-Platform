'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Trophy, Building2 } from 'lucide-react';
import LightCard from '@/components/ui/LightCard';
import { createClient } from '@/lib/supabase/client';

// ──────────────────────────────────────────────────────────
// LifetimeContribution — Step 10.3
// Shows total lifetime contributions with an animated
// impact distribution bar (charity / prize pool / platform).
//
// Accepts userId as a prop instead of calling useUser() again
// to avoid creating redundant Supabase client instances.
// ──────────────────────────────────────────────────────────

interface ContributionData {
  totalContributed: number;
  charityAmount: number;
  prizePoolAmount: number;
  platformAmount: number;
}

interface LifetimeContributionProps {
  userId?: string;
}

export default function LifetimeContribution({
  userId: propUserId,
}: LifetimeContributionProps) {
  const [data, setData] = useState<ContributionData>({
    totalContributed: 0,
    charityAmount: 0,
    prizePoolAmount: 0,
    platformAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchContributions() {
      // Resolve the userId: use prop if available, otherwise fetch from auth
      let userId = propUserId ?? null;
      if (!userId) {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        userId = authUser?.id ?? null;
      }

      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }

      const supabase = createClient();

      // Fetch charity contributions total
      const { data: contributions } = await supabase
        .from('charity_contributions')
        .select('amount_pence')
        .eq('user_id', userId);

      const totalCharity =
        contributions?.reduce(
          (sum: number, c: { amount_pence: number }) =>
            sum + (c.amount_pence || 0),
          0
        ) ?? 0;

      // Simulate total contribution based on subscription payments
      // In a real app, this would be tracked per payment
      // For now, derive from charity contribution (which is 10% of subscription)
      const estimatedTotal = totalCharity > 0 ? totalCharity * 10 : 0;

      // Use illustrative numbers if no real data
      const total = estimatedTotal > 0 ? estimatedTotal : 24500; // £245.00 illustrative
      const charity = totalCharity > 0 ? totalCharity : Math.floor(total * 0.1);
      const prizePool = Math.floor(total * 0.6);
      const platform = total - charity - prizePool;

      if (!cancelled) {
        setData({
          totalContributed: total,
          charityAmount: charity,
          prizePoolAmount: prizePool,
          platformAmount: platform,
        });
        setLoading(false);
      }
    }

    fetchContributions();

    return () => {
      cancelled = true;
    };
  }, [propUserId]);

  const formatPence = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const totalNonzero = data.totalContributed || 1;
  const charityPct = (data.charityAmount / totalNonzero) * 100;
  const prizePct = (data.prizePoolAmount / totalNonzero) * 100;
  const platformPct = (data.platformAmount / totalNonzero) * 100;

  if (loading) {
    return (
      <LightCard className="p-6" hover={false}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded-lg" />
          <div className="h-16 w-40 bg-gray-100 rounded-xl" />
          <div className="h-4 w-full bg-gray-100 rounded-full" />
          <div className="flex gap-6">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      </LightCard>
    );
  }

  return (
    <LightCard className="p-6" hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
        <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Lifetime Contribution
        </h3>
      </div>

      {/* Total Amount */}
      <p className="text-5xl font-light text-[#1A2E1A] tabular-nums mb-6">
        {formatPence(data.totalContributed)}
      </p>

      {/* Impact Distribution Bar */}
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-gray-100 mb-4">
        <motion.div
          className="h-full bg-[#1A2E1A] rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${charityPct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
        <motion.div
          className="h-full bg-[#D4AF37]"
          initial={{ width: 0 }}
          animate={{ width: `${prizePct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        />
        <motion.div
          className="h-full bg-gray-300 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${platformPct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-[#1A2E1A]" />
          <span className="text-gray-500">
            Charity{' '}
            <span className="font-medium text-[#1A2E1A]">
              {formatPence(data.charityAmount)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-gray-500">
            Prize Pool{' '}
            <span className="font-medium text-[#1A2E1A]">
              {formatPence(data.prizePoolAmount)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500">
            Platform{' '}
            <span className="font-medium text-[#1A2E1A]">
              {formatPence(data.platformAmount)}
            </span>
          </span>
        </div>
      </div>
    </LightCard>
  );
}
