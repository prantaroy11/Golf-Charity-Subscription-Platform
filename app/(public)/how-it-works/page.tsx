'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CreditCard,
  Target,
  Gift,
  ShieldCheck,
  ArrowRight,
  Trophy,
  Users,
  Leaf,
  TrendingUp,
  Ticket,
  Heart,
  HelpCircle,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import Footer from '@/components/layout/Footer';

// ──────────────────────────────────────────────────────────
// How It Works — Step 13.2
// Full detailed explanation of scoring, draw mechanics,
// prize tiers, charity model, and FAQ accordion
// ──────────────────────────────────────────────────────────

// ── Steps Data ──
const steps = [
  {
    number: '01',
    icon: CreditCard,
    title: 'Subscribe',
    subtitle: 'Choose Your Plan',
    description:
      'Select a monthly or yearly subscription plan. A portion of your fee goes directly to the charity of your choice — minimum 10%, but you can increase it anytime.',
    details: [
      'Monthly and yearly plans available',
      'Yearly plan includes a discount',
      'Cancel anytime — your access continues until the period ends',
      'Charity contribution starts immediately',
    ],
  },
  {
    number: '02',
    icon: Target,
    title: 'Enter Scores',
    subtitle: 'Track Your Game',
    description:
      'Log your latest golf scores in Stableford format (1–45). Keep your most recent 5 scores updated — these become your draw entries each month.',
    details: [
      'Enter scores between 1 and 45 (Stableford format)',
      'Maximum of 5 scores stored at any time',
      'Adding a 6th score replaces the oldest automatically',
      'Scores displayed in reverse chronological order',
    ],
  },
  {
    number: '03',
    icon: Gift,
    title: 'Win & Give',
    subtitle: 'Monthly Draw',
    description:
      'Each month, 5 numbers are drawn. Match your scores to the drawn numbers for cash prizes — while your charity receives a guaranteed contribution every single month.',
    details: [
      'Five numbers drawn monthly (range 1–45)',
      'Match 3, 4, or all 5 for tiered prizes',
      'Unclaimed jackpots roll over to the next month',
      'Your charity benefits regardless of whether you win',
    ],
  },
];

// ── Prize Tiers ──
const prizeTiers = [
  {
    tier: '5',
    label: 'Jackpot — 5 Match',
    poolShare: '40%',
    description:
      'Match all 5 numbers for the jackpot prize. If no one wins, the jackpot rolls over and grows next month.',
    icon: Trophy,
    highlight: true,
  },
  {
    tier: '4',
    label: '4-Number Match',
    poolShare: '35%',
    description:
      'Match 4 of the 5 drawn numbers. Prize is split equally among all 4-match winners.',
    icon: TrendingUp,
    highlight: false,
  },
  {
    tier: '3',
    label: '3-Number Match',
    poolShare: '25%',
    description:
      'Match 3 of the 5 drawn numbers. Prize is split equally among all 3-match winners.',
    icon: Users,
    highlight: false,
  },
];

// ── FAQ Data ──
const faqs = [
  {
    question: 'What is Stableford scoring?',
    answer:
      'Stableford is a points-based scoring system used in golf. Points are awarded based on performance relative to par on each hole. Scores typically range from 0 to 45+, though our platform accepts scores between 1 and 45 for draw entry purposes.',
  },
  {
    question: 'How are the winning numbers selected?',
    answer:
      'We offer two draw modes: Random (cryptographically random number generation for maximum fairness) and Algorithmic (numbers are weighted based on the frequency of scores submitted by all subscribers). The admin selects the mode each month, and all draws can be simulated first before official publication.',
  },
  {
    question: 'What happens if no one wins the jackpot?',
    answer:
      'If no subscriber matches all 5 numbers, the jackpot pool carries forward to the next month and is added to the new jackpot. This means the prize can grow significantly over time, making it even more rewarding when someone eventually wins.',
  },
  {
    question: 'How is the prize pool calculated?',
    answer:
      'A fixed portion of each subscription fee contributes to the monthly prize pool. The total pool is then split: 40% to the jackpot (5-match), 35% to 4-match winners, and 25% to 3-match winners. If there are multiple winners in a tier, the prize is split equally among them.',
  },
  {
    question: 'Can I change my charity selection?',
    answer:
      'Yes! You can change your chosen charity at any time from your dashboard. You can also adjust your contribution percentage — the minimum is 10% of your subscription fee, but you can increase it up to 100% if you wish.',
  },
  {
    question: 'How do I know my scores are entered correctly?',
    answer:
      "After submitting a score, you'll see an animated confirmation and your updated score list on your dashboard. Your latest 5 scores are always visible, and adding a 6th score automatically replaces the oldest one. A notification appears when this happens.",
  },
  {
    question: 'What happens when I cancel my subscription?',
    answer:
      "When you cancel, your access continues until the end of your current billing period. You can still view your scores, winnings, and charity contributions. You won't be entered into draws after your subscription expires, but you can re-subscribe at any time.",
  },
  {
    question: 'How are winners verified?',
    answer:
      'Winners are notified by email and can view their winnings on their dashboard. To claim a prize, winners must upload proof of their golf scores (e.g., a screenshot from their golf club app). An admin reviews and approves each claim before payout.',
  },
  {
    question: 'Is there a limit to how much I can win?',
    answer:
      "There's no limit on individual winnings. The jackpot grows with each rollover and the more subscribers on the platform, the larger the prize pool becomes. 4-match and 3-match prizes are split among all winners in that tier.",
  },
  {
    question: 'How do charity contributions work?',
    answer:
      'When you subscribe, you choose a charity from our directory and set your contribution percentage (minimum 10%). Each month, that percentage of your subscription fee is contributed to your chosen charity. You can track your lifetime contributions on your dashboard.',
  },
];

// ── Animation Variants ──
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ── Main Page Component ──
export default function HowItWorksPage() {
  return (
    <>
      {/* ── Dark Hero Section ── */}
      <section className="bg-[#1A2E1A] min-h-[50vh] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.06)_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-gray-300 font-medium">
                Everything You Need to Know
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#F9F9F6] mb-4">
              How <span className="text-gold-gradient">GolfGive</span> Works
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Subscribe, play, and make an impact. Here&apos;s everything about
              how scores, draws, prizes, and charity contributions come
              together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Three Steps Section ── */}
      <section className="bg-[#F9F9F6] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
              Simple & Rewarding
            </p>
            <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[#1A2E1A]">
              Three Steps to Make an Impact
            </h2>
          </motion.div>

          {/* Steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="relative"
              >
                {/* Connector line (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] right-0 h-px bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
                )}

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300 h-full">
                  {/* Number badge + Icon */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)] flex-shrink-0">
                      <span className="text-[#1A2E1A] font-bold text-lg">
                        {step.number}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#1A2E1A]">
                        {step.title}
                      </h3>
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">
                        {step.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Details list */}
                  <ul className="space-y-2.5">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Scoring Explained ── */}
      <section className="bg-[#1A2E1A] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(212,175,55,0.04)_0%,_transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
              Scoring System
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#F9F9F6] mb-4">
              How Scoring Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl font-light">
              Your golf scores are the key to entering the monthly draw.
              Here&apos;s how the system works.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Score Entry Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#F9F9F6]">
                  Score Entry Rules
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: 'Stableford Format',
                    desc: 'Enter scores between 1 and 45 points. This is the standard points-based scoring system used in golf.',
                  },
                  {
                    title: 'Rolling Window of 5',
                    desc: 'Only your latest 5 scores are kept. When you add a 6th score, the oldest one is automatically replaced.',
                  },
                  {
                    title: 'Date Required',
                    desc: 'Each score must include the date it was played. Scores are displayed in reverse chronological order.',
                  },
                  {
                    title: 'Monthly Draw Entry',
                    desc: 'Your current 5 scores are automatically entered into each monthly draw as long as your subscription is active.',
                  },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#D4AF37] text-xs font-bold">
                        {idx + 1}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#F9F9F6] text-sm font-medium block">
                        {item.title}
                      </span>
                      <span className="text-gray-400 text-sm">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Score Visual Example */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#F9F9F6]">
                  Example Draw Entry
                </h3>
              </div>

              <p className="text-gray-400 text-sm mb-6">
                Here&apos;s how your scores translate into draw entries:
              </p>

              {/* Visual score slots */}
              <div className="space-y-3 mb-8">
                {[
                  { score: 36, date: '15 Mar 2026' },
                  { score: 28, date: '09 Mar 2026' },
                  { score: 42, date: '02 Mar 2026' },
                  { score: 31, date: '24 Feb 2026' },
                  { score: 19, date: '18 Feb 2026' },
                ].map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] flex items-center justify-center">
                        <span className="text-[#1A2E1A] text-xs font-bold">
                          {entry.score}
                        </span>
                      </div>
                      <span className="text-[#F9F9F6] text-sm font-medium">
                        Score: {entry.score}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">{entry.date}</span>
                  </div>
                ))}
              </div>

              {/* Arrow indicating draw entry */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm text-[#D4AF37] font-medium">
                  These 5 scores become your draw numbers: 36, 28, 42, 31, 19
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Draw Mechanics & Prize Tiers ── */}
      <section className="bg-[#F9F9F6] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
              Monthly Draw
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A2E1A] mb-4">
              Prize Tiers & Draw Mechanics
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl font-light">
              Every month, 5 numbers are drawn and matched against your scores.
              The more matches, the bigger the reward.
            </p>
          </motion.div>

          {/* Prize tier cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {prizeTiers.map((tier, idx) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-[2rem] border p-8 ${
                  tier.highlight
                    ? 'bg-[#1A2E1A] border-[#D4AF37]/30 text-[#F9F9F6]'
                    : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                {/* Decorative number */}
                <div
                  className={`absolute -top-4 -right-4 font-serif font-bold text-[120px] leading-none select-none pointer-events-none ${
                    tier.highlight ? 'text-[#D4AF37]/5' : 'text-gray-100'
                  }`}
                >
                  {tier.tier}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        tier.highlight
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                          : 'bg-[#D4AF37]/10 text-[#D4AF37]'
                      }`}
                    >
                      <tier.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className={`font-serif text-lg font-medium ${
                          tier.highlight ? 'text-[#F9F9F6]' : 'text-[#1A2E1A]'
                        }`}
                      >
                        {tier.label}
                      </h3>
                      <span
                        className={`text-xs uppercase tracking-widest font-medium ${
                          tier.highlight ? 'text-[#D4AF37]' : 'text-gray-400'
                        }`}
                      >
                        {tier.poolShare} of prize pool
                      </span>
                    </div>
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      tier.highlight ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {tier.description}
                  </p>

                  {tier.highlight && (
                    <div className="mt-6 flex items-center gap-2 px-3 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 w-fit">
                      <ArrowUpRight className="w-3 h-3 text-[#D4AF37]" />
                      <span className="text-xs text-[#D4AF37] font-medium">
                        Rolls over if unclaimed
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prize pool explanation card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-[2rem] p-8 sm:p-10"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium text-[#1A2E1A] mb-2">
                  Transparent Prize Pool
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  The prize pool is funded by a fixed portion of each
                  subscription. The total pool is split across tiers, and prizes
                  are divided equally among winners in each tier. All
                  calculations are transparent and visible on each draw&apos;s
                  results page.
                </p>

                {/* Pool distribution visual */}
                <div className="flex items-center gap-1 h-4 rounded-full overflow-hidden w-full max-w-md">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F1D570] rounded-l-full"
                    style={{ width: '40%' }}
                  />
                  <div
                    className="h-full bg-[#1A2E1A]"
                    style={{ width: '35%' }}
                  />
                  <div
                    className="h-full bg-gray-300 rounded-r-full"
                    style={{ width: '25%' }}
                  />
                </div>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                    <span className="text-xs text-gray-500">40% Jackpot</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1A2E1A]" />
                    <span className="text-xs text-gray-500">35% 4-Match</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    <span className="text-xs text-gray-500">25% 3-Match</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Charity Model ── */}
      <section className="bg-[#1A2E1A] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.04)_0%,_transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
              Charity Impact
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#F9F9F6] mb-4">
              How Your Contribution Helps
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl font-light">
              Every subscription makes a tangible difference. Here&apos;s how
              your money is distributed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: 'Choose Your Charity',
                desc: 'Browse our charity directory and select a cause you care about. You can change your selection at any time from your dashboard.',
              },
              {
                icon: Leaf,
                title: 'Set Your Percentage',
                desc: 'A minimum of 10% of your subscription goes to your chosen charity. Generous? Increase it to up to 100% of your fee.',
              },
              {
                icon: TrendingUp,
                title: 'Track Your Impact',
                desc: 'See your lifetime contributions, view the impact distribution breakdown, and celebrate charity milestones on your dashboard.',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#F9F9F6] mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="bg-[#F9F9F6] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
              FAQ
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1A2E1A] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-lg font-light">
              Got questions? We&apos;ve got answers.
            </p>
          </motion.div>

          {/* Accordion FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8"
          >
            <Accordion>
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <AccordionTrigger className="py-5 text-left text-[#1A2E1A] font-medium text-base hover:no-underline hover:text-[#D4AF37] transition-colors duration-200">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-sm leading-relaxed">
                    <p>{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-[#1A2E1A] py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_60%)]" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#F9F9F6] mb-4">
              Ready to{' '}
              <span className="text-gold-gradient">Make an Impact</span>?
            </h2>
            <p className="text-gray-400 text-lg font-light mb-8">
              Join GolfGive today. Subscribe, enter your scores, and start
              making a difference — one round at a time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F1D570] text-[#1A2E1A] font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/draws"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-gray-300 hover:bg-white/5 transition-all duration-300"
              >
                View Past Draws
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
