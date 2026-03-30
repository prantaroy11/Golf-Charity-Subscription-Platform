'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Upload,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Award,
} from 'lucide-react';
import LightCard from '@/components/ui/LightCard';
import StatusBadge from '@/components/ui/StatusBadge';
import GoldButton from '@/components/ui/GoldButton';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Winner } from '@/types';

// ──────────────────────────────────────────────────────────
// Winnings Page — Step 10.6
// List of wins with tier, amount, payout status.
// Total lifetime winnings. Proof upload for pending items.
// ──────────────────────────────────────────────────────────

interface WinnerWithDraw extends Winner {
  draws?: { draw_month: string } | null;
}

const tierLabels: Record<string, string> = {
  five: '5-Number Match 🏆',
  four: '4-Number Match',
  three: '3-Number Match',
};

const tierColors: Record<string, string> = {
  five: 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30',
  four: 'bg-green-50 text-green-700',
  three: 'bg-blue-50 text-blue-700',
};

export default function WinningsPage() {
  const { user } = useUser();
  const [winners, setWinners] = useState<WinnerWithDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWinnings() {
      if (!user) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('winners')
        .select('*, draws(draw_month)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setWinners(data as WinnerWithDraw[]);
      }
      setLoading(false);
    }

    fetchWinnings();
  }, [user]);

  // Calculate total lifetime winnings
  const totalWinnings = winners.reduce((sum, w) => sum + w.prize_amount, 0);
  const paidWinnings = winners
    .filter((w) => w.payout_status === 'paid')
    .reduce((sum, w) => sum + w.prize_amount, 0);

  // Handle proof upload
  const handleUpload = async (winnerId: string) => {
    setUploadTargetId(winnerId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId || !user) return;

    setUploading(uploadTargetId);

    const supabase = createClient();
    const path = `${user.id}/${uploadTargetId}`;

    const { error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setFeedback({
        type: 'error',
        message: 'Upload failed. Please try again.',
      });
      setUploading(null);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(path);

    // Update winner record
    const { error: updateError } = await supabase
      .from('winners')
      .update({
        proof_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', uploadTargetId);

    if (updateError) {
      setFeedback({
        type: 'error',
        message: 'Failed to link proof. Please try again.',
      });
    } else {
      // Update local state
      setWinners((prev) =>
        prev.map((w) =>
          w.id === uploadTargetId ? { ...w, proof_url: urlData.publicUrl } : w
        )
      );
      setFeedback({ type: 'success', message: 'Proof uploaded successfully!' });
    }

    setUploading(null);
    setUploadTargetId(null);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => setFeedback(null), 4000);
  };

  const formatPence = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-[2rem]" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A2E1A]">
              Your Winnings
            </h1>
            <p className="text-sm text-gray-500">
              Track your draw wins and payouts.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium',
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {feedback.message}
        </motion.div>
      )}

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <LightCard className="p-6" hover={false}>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
            Total Winnings
          </p>
          <p className="text-4xl font-light text-[#1A2E1A] tabular-nums">
            {formatPence(totalWinnings)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {winners.length} win{winners.length !== 1 ? 's' : ''} total
          </p>
        </LightCard>

        <LightCard className="p-6" hover={false}>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
            Paid Out
          </p>
          <p className="text-4xl font-light text-green-600 tabular-nums">
            {formatPence(paidWinnings)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {winners.filter((w) => w.payout_status === 'paid').length} payout
            {winners.filter((w) => w.payout_status === 'paid').length !== 1
              ? 's'
              : ''}{' '}
            completed
          </p>
        </LightCard>
      </motion.div>

      {/* Wins List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Win History
        </h3>

        {winners.length === 0 ? (
          <LightCard className="p-8" hover={false}>
            <div className="text-center">
              <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">No wins yet</p>
              <p className="text-sm text-gray-400">
                Keep entering your scores — your time is coming!
              </p>
            </div>
          </LightCard>
        ) : (
          winners.map((win, idx) => (
            <motion.div
              key={win.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <LightCard className="p-5" hover={false}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Tier icon */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        win.match_tier === 'five'
                          ? 'bg-[#D4AF37]/10'
                          : win.match_tier === 'four'
                            ? 'bg-green-50'
                            : 'bg-blue-50'
                      )}
                    >
                      <Trophy
                        className={cn(
                          'w-5 h-5',
                          win.match_tier === 'five'
                            ? 'text-[#D4AF37]'
                            : win.match_tier === 'four'
                              ? 'text-green-600'
                              : 'text-blue-600'
                        )}
                      />
                    </div>

                    <div>
                      {/* Tier */}
                      <span
                        className={cn(
                          'inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-1',
                          tierColors[win.match_tier] ??
                            'bg-gray-100 text-gray-600'
                        )}
                      >
                        {tierLabels[win.match_tier] ?? win.match_tier}
                      </span>

                      {/* Draw month */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {win.draws?.draw_month
                          ? new Date(
                              parseInt(win.draws.draw_month.split('-')[0]),
                              parseInt(win.draws.draw_month.split('-')[1]) - 1
                            ).toLocaleString('en-GB', {
                              month: 'long',
                              year: 'numeric',
                            })
                          : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    {/* Amount */}
                    <p className="text-xl font-light text-[#1A2E1A] tabular-nums">
                      {formatPence(win.prize_amount)}
                    </p>

                    {/* Payout status */}
                    <StatusBadge
                      status={
                        win.payout_status as
                          | 'pending'
                          | 'verified'
                          | 'paid'
                          | 'rejected'
                      }
                    />
                  </div>
                </div>

                {/* Upload proof for pending wins */}
                {win.payout_status === 'pending' && !win.proof_url && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <GoldButton
                      variant="ghost"
                      size="sm"
                      icon={Upload}
                      loading={uploading === win.id}
                      onClick={() => handleUpload(win.id)}
                    >
                      {uploading === win.id
                        ? 'Uploading…'
                        : 'Upload Verification Proof'}
                    </GoldButton>
                  </div>
                )}

                {/* Show uploaded proof */}
                {win.proof_url && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">
                      Proof uploaded
                    </span>
                    <a
                      href={win.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#D4AF37] hover:underline ml-auto flex items-center gap-1"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Admin rejection note */}
                {win.payout_status === 'rejected' && win.admin_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{win.admin_notes}</span>
                    </div>
                  </div>
                )}
              </LightCard>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
