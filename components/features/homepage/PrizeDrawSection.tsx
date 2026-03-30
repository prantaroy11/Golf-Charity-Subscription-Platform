'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Ticket, ArrowRight } from 'lucide-react';
import LightCard from '@/components/ui/LightCard';
import GoldButton from '@/components/ui/GoldButton';
import Section from '@/components/layout/Section';
import Link from 'next/link';

// ──────────────────────────────────────────────────────────
// PrizeDrawSection — Light background, prize showcase
// Step 5.3 — Grand Prize + secondary prizes
// ──────────────────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function PrizeDrawSection() {
  // Illustrative next draw date
  const nextDrawDate = 'April 2026';

  return (
    <Section theme="light" id="prize-draw-section">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-14 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
            Monthly Prize Draw
          </p>
          <h2 className="font-serif font-medium text-3xl sm:text-4xl lg:text-5xl text-[#1A2E1A] tracking-tight">
            This Month&apos;s Prizes
          </h2>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          Next draw:{' '}
          <span className="text-[#1A2E1A] font-semibold">{nextDrawDate}</span>
        </p>
      </div>

      {/* ── Prize Grid ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Grand Prize — Dark Card */}
        <motion.div variants={fadeIn}>
          <div className="relative bg-[#1A2E1A] rounded-[2rem] p-8 sm:p-10 overflow-hidden h-full flex flex-col justify-between min-h-[320px]">
            {/* Oversized gold numeral */}
            <div className="absolute -right-4 -bottom-6 text-[12rem] sm:text-[16rem] font-serif font-bold leading-none select-none pointer-events-none">
              <span className="text-gold-gradient opacity-[0.07]">1</span>
            </div>

            {/* Trophy watermark */}
            <div className="absolute top-6 right-6">
              <Trophy className="w-8 h-8 text-[#D4AF37]/20" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-6">
                <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium">
                  Grand Prize
                </span>
              </div>

              <h3 className="font-serif font-medium text-2xl sm:text-3xl text-[#F9F9F6] mb-3">
                5-Number Jackpot
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                Match all 5 drawn numbers to win the jackpot — rolls over if
                unclaimed.
              </p>
            </div>

            <div className="relative z-10">
              <p className="text-4xl sm:text-5xl font-light tracking-tight">
                <span className="text-gold-gradient">£5,000+</span>
              </p>
              <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
                Jackpot Pool
              </p>
            </div>
          </div>
        </motion.div>

        {/* Secondary Prizes */}
        <div className="grid grid-cols-1 gap-6">
          <motion.div variants={fadeIn}>
            <LightCard className="p-6 sm:p-8 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <span className="text-xs uppercase tracking-widest text-gray-400 font-medium pt-2">
                  4-Number Match
                </span>
              </div>
              <h3 className="font-serif font-medium text-xl text-[#1A2E1A] mb-2">
                Runner&apos;s Up Prize
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Match 4 of 5 numbers — split equally among all 4-match winners.
              </p>
              <p className="text-3xl font-light text-[#1A2E1A] tracking-tight">
                £1,750
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                Pool share
              </p>
            </LightCard>
          </motion.div>

          <motion.div variants={fadeIn}>
            <LightCard className="p-6 sm:p-8 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <span className="text-xs uppercase tracking-widest text-gray-400 font-medium pt-2">
                  3-Number Match
                </span>
              </div>
              <h3 className="font-serif font-medium text-xl text-[#1A2E1A] mb-2">
                Consolation Prize
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Match 3 of 5 numbers — split equally among all 3-match winners.
              </p>
              <p className="text-3xl font-light text-[#1A2E1A] tracking-tight">
                £1,250
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                Pool share
              </p>
            </LightCard>
          </motion.div>
        </div>
      </motion.div>

      {/* ── CTA ── */}
      <div className="text-center mt-10">
        <Link href="/#how-it-works">
          <GoldButton
            variant="dark"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            id="prize-draw-cta"
          >
            See How the Draw Works
          </GoldButton>
        </Link>
      </div>
    </Section>
  );
}
