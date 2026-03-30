'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Trophy, Users } from 'lucide-react';
import Section from '@/components/layout/Section';

// ──────────────────────────────────────────────────────────
// TrustSection — Radical Transparency trust signals
// Step 5.5 — Gold-tinted card with key platform stats
// ──────────────────────────────────────────────────────────

const trustStats = [
  {
    icon: TrendingUp,
    value: '£127,450',
    label: 'Total Donated',
  },
  {
    icon: Trophy,
    value: '24',
    label: 'Draws Run',
  },
  {
    icon: Users,
    value: '156',
    label: 'Winners Paid',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function TrustSection() {
  return (
    <Section theme="light" id="trust-section" compact>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="bg-[#D4AF37]/10 rounded-[2rem] border border-[#D4AF37]/20 p-8 sm:p-12"
      >
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left — Badge and Copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#1A2E1A]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium">
                  Trust & Transparency
                </p>
                <h3 className="font-serif font-medium text-2xl text-[#1A2E1A]">
                  Radical Transparency
                </h3>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
              Every pound is tracked. Every draw is verifiable. Every winner is
              published. We believe in full transparency — because trust is the
              foundation of everything we do.
            </p>
          </div>

          {/* Right — Stats */}
          <div className="grid grid-cols-3 gap-6 sm:gap-10 flex-shrink-0">
            {trustStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <p className="text-2xl sm:text-3xl font-light text-[#1A2E1A] tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
