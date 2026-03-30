'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Globe2,
  X,
} from 'lucide-react';
import LightCard from '@/components/ui/LightCard';
import GoldButton from '@/components/ui/GoldButton';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Charity } from '@/types';

// ──────────────────────────────────────────────────────────
// Charity Page — Step 10.5
// Current charity selection, change charity modal,
// contribution percentage slider, lifetime contribution to
// this charity, and upcoming events.
// ──────────────────────────────────────────────────────────

export default function CharityPage() {
  const { profile, user } = useUser();
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [charityPct, setCharityPct] = useState(10);
  const [totalContributed, setTotalContributed] = useState(0);
  const [showSelector, setShowSelector] = useState(false);
  const [allCharities, setAllCharities] = useState<Charity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showFeedbackMsg = useCallback(
    (type: 'success' | 'error', message: string) => {
      setFeedback({ type, message });
      setTimeout(() => setFeedback(null), 4000);
    },
    []
  );

  // Fetch current charity + contribution data
  useEffect(() => {
    async function fetchData() {
      if (!user || !profile) return;

      const supabase = createClient();

      // Current charity
      if (profile.charity_id) {
        const { data: charity } = await supabase
          .from('charities')
          .select('*')
          .eq('id', profile.charity_id)
          .single();
        if (charity) setSelectedCharity(charity as Charity);
      }

      // Charity percentage
      setCharityPct(profile.charity_pct || 10);

      // Total contributed to current charity
      if (profile.charity_id) {
        const { data: contributions } = await supabase
          .from('charity_contributions')
          .select('amount_pence')
          .eq('user_id', user.id)
          .eq('charity_id', profile.charity_id);

        const total =
          contributions?.reduce((sum, c) => sum + (c.amount_pence || 0), 0) ??
          0;
        setTotalContributed(total);
      }

      // All charities (for selector)
      const { data: charities } = await supabase
        .from('charities')
        .select('*')
        .order('name');
      if (charities) setAllCharities(charities as Charity[]);
    }

    fetchData();
  }, [user, profile]);

  // Handle charity selection
  const handleSelectCharity = async (charity: Charity) => {
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .update({ charity_id: charity.id, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      showFeedbackMsg('error', 'Failed to update charity. Please try again.');
    } else {
      setSelectedCharity(charity);
      setShowSelector(false);
      showFeedbackMsg('success', `Now supporting ${charity.name}!`);
    }

    setSaving(false);
  };

  // Handle percentage change
  const handlePctChange = async (pct: number) => {
    if (!user) return;
    setCharityPct(pct);

    const supabase = createClient();
    await supabase
      .from('users')
      .update({ charity_pct: pct, updated_at: new Date().toISOString() })
      .eq('id', user.id);
  };

  const filteredCharities = allCharities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#1A2E1A]/5 flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#1A2E1A]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A2E1A]">
              Your Charity
            </h1>
            <p className="text-sm text-gray-500">
              Choose the cause you want to support.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
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
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Charity Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LightCard className="p-6" hover={false}>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
              Currently Supporting
            </p>

            {selectedCharity ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {selectedCharity.logo_url ? (
                    <img
                      src={selectedCharity.logo_url}
                      alt={selectedCharity.name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-medium text-[#1A2E1A]">
                      {selectedCharity.name}
                    </h3>
                    {selectedCharity.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {selectedCharity.description}
                      </p>
                    )}
                  </div>
                </div>

                {selectedCharity.website && (
                  <a
                    href={selectedCharity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    Visit website
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}

                <GoldButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSelector(true)}
                >
                  Change Charity
                </GoldButton>
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-4">
                  No charity selected yet.
                </p>
                <GoldButton
                  variant="dark"
                  size="sm"
                  onClick={() => setShowSelector(true)}
                >
                  Choose a Charity
                </GoldButton>
              </div>
            )}
          </LightCard>
        </motion.div>

        {/* Contribution Settings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Percentage Slider */}
          <LightCard className="p-6" hover={false}>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
              Contribution Percentage
            </p>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <p className="text-4xl font-light text-[#1A2E1A] tabular-nums">
                  {charityPct}%
                </p>
                <p className="text-xs text-gray-400">of your subscription</p>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={charityPct}
                onChange={(e) => handlePctChange(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4AF37]
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(212,175,55,0.3)] [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-[#D4AF37] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${
                    ((charityPct - 10) / 90) * 100
                  }%, #e5e5e0 ${((charityPct - 10) / 90) * 100}%, #e5e5e0 100%)`,
                }}
                aria-label="Charity contribution percentage"
              />

              <div className="flex justify-between text-xs text-gray-400">
                <span>10% (minimum)</span>
                <span>100%</span>
              </div>
            </div>
          </LightCard>

          {/* Total Contributed */}
          <LightCard className="p-6" hover={false}>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
              Total Contributed
            </p>
            <p className="text-3xl font-light text-[#1A2E1A] tabular-nums">
              £{(totalContributed / 100).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              to {selectedCharity?.name ?? 'your charity'}
            </p>
          </LightCard>
        </motion.div>
      </div>

      {/* ── Charity Selector Modal ── */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSelector(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-xl max-h-[80vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h2 className="font-serif text-xl font-medium text-[#1A2E1A]">
                  Choose a Charity
                </h2>
                <button
                  onClick={() => setShowSelector(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Search */}
              <div className="px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search charities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-1 transition-all"
                  />
                </div>
              </div>

              {/* Charity List */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
                {filteredCharities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No charities found.</p>
                  </div>
                ) : (
                  filteredCharities.map((charity) => (
                    <button
                      key={charity.id}
                      onClick={() => handleSelectCharity(charity)}
                      disabled={saving}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200',
                        selectedCharity?.id === charity.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                          : 'border-gray-100 hover:border-[#D4AF37]/30 hover:bg-gray-50'
                      )}
                    >
                      {charity.logo_url ? (
                        <img
                          src={charity.logo_url}
                          alt={charity.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A2E1A] truncate">
                          {charity.name}
                        </p>
                        {charity.description && (
                          <p className="text-xs text-gray-400 truncate">
                            {charity.description}
                          </p>
                        )}
                      </div>
                      {selectedCharity?.id === charity.id && (
                        <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
