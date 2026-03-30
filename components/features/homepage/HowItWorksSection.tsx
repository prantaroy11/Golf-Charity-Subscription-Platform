'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Target, Gift } from 'lucide-react';
import Section from '@/components/layout/Section';

// ──────────────────────────────────────────────────────────
// HowItWorksSection — Three steps horizontal on desktop
// Step 5.4 — Subscribe → Enter Scores → Win & Give
// ──────────────────────────────────────────────────────────

const steps = [
  {
    number: '01',
    icon: CreditCard,
    title: 'Subscribe',
    description:
      'Choose a monthly or yearly plan. A portion of your fee goes directly to the charity you select — minimum 10%, increase it if you wish.',
  },
  {
    number: '02',
    icon: Target,
    title: 'Enter Scores',
    description:
      'Log your latest 5 golf scores in Stableford format. Your scores are your draw entries — keep them updated for the best chance.',
  },
  {
    number: '03',
    icon: Gift,
    title: 'Win & Give',
    description:
      'Each month, 5 numbers are drawn. Match 3, 4, or all 5 for prizes — while your charity receives a contribution every single month.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function HowItWorksSection() {
  return (
    <Section theme="light" id="how-it-works">
      {/* ── Section Header ── */}
      <div className="text-center mb-12 sm:mb-16">
        <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
          Simple & Rewarding
        </p>
        <h2 className="font-serif font-medium text-3xl sm:text-4xl lg:text-5xl text-[#1A2E1A] tracking-tight">
          How It Works
        </h2>
        <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl mx-auto font-light">
          Three simple steps to make a real impact while enjoying the game you
          love.
        </p>
      </div>

      {/* ── Steps Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10"
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            variants={stepVariants}
            className="relative text-center md:text-left"
          >
            {/* Connector line (desktop only, not last) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
            )}

            {/* Gold numbered badge */}
            <div className="flex items-center justify-center md:justify-start mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <span className="text-[#1A2E1A] font-bold text-lg">
                  {step.number}
                </span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1A2E1A]/5 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-[#1A2E1A]" />
              </div>
            </div>

            {/* Content */}
            <h3 className="font-serif font-medium text-xl text-[#1A2E1A] mb-3">
              {step.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
