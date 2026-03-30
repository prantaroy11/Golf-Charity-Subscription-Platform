'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Eye,
  Check,
  CheckCircle2,
  XCircle,
  CreditCard,
  X,
  ChevronDown,
  ExternalLink,
  FileText,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import GoldButton from '@/components/ui/GoldButton';

// ──────────────────────────────────────────────────────────
// Admin Winners Page — Step 11.5
// List all winners, filter by status, manage payouts
// ──────────────────────────────────────────────────────────

interface WinnerRecord {
  id: string;
  draw_id: string;
  user_id: string;
  match_tier: 'five' | 'four' | 'three';
  prize_amount: number;
  payout_status: 'pending' | 'verified' | 'paid' | 'rejected';
  proof_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  users: { id: string; full_name: string | null; email: string } | null;
  draws: { draw_month: string; numbers_drawn: number[] } | null;
}

type StatusFilter = 'all' | 'pending' | 'verified' | 'paid' | 'rejected';

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Action modals
  const [proofModal, setProofModal] = useState<WinnerRecord | null>(null);
  const [rejectModal, setRejectModal] = useState<WinnerRecord | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWinners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/winners?status=${statusFilter}`);
      const data = await res.json();
      setWinners(data.winners || []);
    } catch (err) {
      console.error('Failed to fetch winners:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  const updateStatus = async (
    winnerId: string,
    payout_status: string,
    admin_notes?: string
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/winners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, payout_status, admin_notes }),
      });

      if (res.ok) {
        setRejectModal(null);
        setRejectNotes('');
        fetchWinners();
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatPence = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  const tierLabels: Record<string, string> = {
    five: '5-Match (Jackpot)',
    four: '4-Match',
    three: '3-Match',
  };

  const tierColors: Record<string, string> = {
    five: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/20',
    four: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    three: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  };

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'paid', label: 'Paid' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium text-[#F9F9F6]">
              Winner Management
            </h1>
            <p className="text-sm text-gray-500">
              {winners.length} winner{winners.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {statusFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                statusFilter === value
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20'
                  : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/[0.07]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[2rem] bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  'User',
                  'Draw',
                  'Tier',
                  'Prize',
                  'Status',
                  'Proof',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : winners.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-600"
                  >
                    <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    No winners found
                  </td>
                </tr>
              ) : (
                winners.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#F9F9F6]">
                          {w.users?.full_name || '—'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {w.users?.email || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {w.draws?.draw_month || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          tierColors[w.match_tier] || ''
                        }`}
                      >
                        {tierLabels[w.match_tier] || w.match_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#F9F9F6]">
                      {formatPence(w.prize_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={w.payout_status} />
                    </td>
                    <td className="px-6 py-4">
                      {w.proof_url ? (
                        <button
                          onClick={() => setProofModal(w)}
                          className="inline-flex items-center gap-1 text-xs text-[#D4AF37] hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-600">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {w.payout_status === 'pending' && (
                          <button
                            onClick={() => updateStatus(w.id, 'verified')}
                            className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Approve / Verify"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {(w.payout_status === 'verified' ||
                          w.payout_status === 'pending') && (
                          <button
                            onClick={() => updateStatus(w.id, 'paid')}
                            className="p-2 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                            title="Mark Paid"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        {w.payout_status !== 'rejected' &&
                          w.payout_status !== 'paid' && (
                            <button
                              onClick={() => {
                                setRejectModal(w);
                                setRejectNotes(w.admin_notes || '');
                              }}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Proof Modal ── */}
      <AnimatePresence>
        {proofModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setProofModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[2rem] bg-[#1A2E1A] border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-medium text-[#F9F9F6]">
                  Winner Proof
                </h3>
                <button
                  onClick={() => setProofModal(null)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#F9F9F6] hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-[#F9F9F6]">
                      {proofModal.users?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {proofModal.draws?.draw_month} •{' '}
                      {tierLabels[proofModal.match_tier]} •{' '}
                      {formatPence(proofModal.prize_amount)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  {proofModal.proof_url ? (
                    <div>
                      <img
                        src={proofModal.proof_url}
                        alt="Winner proof"
                        className="w-full rounded-lg max-h-80 object-contain bg-black/20"
                      />
                      <a
                        href={proofModal.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-xs text-[#D4AF37] hover:underline"
                      >
                        Open full image
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No proof uploaded
                    </p>
                  )}
                </div>

                {proofModal.admin_notes && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                      Admin Notes
                    </p>
                    <p className="text-sm text-gray-400">
                      {proofModal.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] bg-[#1A2E1A] border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-serif font-medium text-[#F9F9F6]">
                  Reject Winner
                </h3>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Rejecting{' '}
                <strong className="text-[#F9F9F6]">
                  {rejectModal.users?.full_name || 'Unknown'}
                </strong>
                &apos;s {tierLabels[rejectModal.match_tier]} win (
                {formatPence(rejectModal.prize_amount)})
              </p>

              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Rejection Notes
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Reason for rejection…"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <GoldButton
                  variant="ghost"
                  onClick={() => setRejectModal(null)}
                  className="flex-1 !border-white/10 !text-gray-400"
                >
                  Cancel
                </GoldButton>
                <button
                  onClick={() =>
                    updateStatus(rejectModal.id, 'rejected', rejectNotes)
                  }
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
