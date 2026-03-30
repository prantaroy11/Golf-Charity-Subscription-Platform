'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Users,
  Heart,
  Trophy,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import Link from 'next/link';

// ──────────────────────────────────────────────────────────
// HeroSection — Full-bleed dark hero with gold accents
// Step 5.1 of the TODO
// ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

const impactStats = [
  {
    icon: Heart,
    label: 'Total Raised',
    value: '£127,450',
    color: 'text-[#D4AF37]',
  },
  {
    icon: Users,
    label: 'Active Subscribers',
    value: '2,340',
    color: 'text-[#F1D570]',
  },
  {
    icon: Trophy,
    label: 'Charities Supported',
    value: '18',
    color: 'text-[#D4AF37]',
  },
];

export default function HeroSection() {
  const scrollToHowItWorks = () => {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center justify-center bg-[#1A2E1A] overflow-hidden"
    >
      {/* ── Radial gold glow ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />

      {/* ── Subtle grid pattern for depth ── */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 sm:py-40 w-full">
        <div className="flex flex-col items-center text-center">
          {/* ── Certified Badge ── */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-widest text-gray-300 font-medium">
                Certified B-Corp Standard
              </span>
            </div>
          </motion.div>

          {/* ── Headline ── */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-serif font-medium text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-[#F9F9F6] mb-6"
          >
            Play with Purpose.
            <br />
            <span className="text-gold-gradient">Win for Good.</span>
          </motion.h1>

          {/* ── Sub-headline ── */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-gray-300 font-light text-lg sm:text-xl max-w-2xl leading-relaxed mb-10"
          >
            Subscribe, track your golf scores, and enter monthly prize draws —
            while a portion of every subscription goes directly to the charity
            you choose.
          </motion.p>

          {/* ── CTAs ── */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <Link href="/subscribe">
              <GoldButton
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                id="hero-cta-subscribe"
              >
                Start Your Journey
              </GoldButton>
            </Link>
            <GoldButton
              variant="ghost"
              size="lg"
              onClick={scrollToHowItWorks}
              id="hero-cta-how-it-works"
              className="border-white/20 text-gray-300 hover:bg-white/5 hover:text-[#F9F9F6]"
            >
              How It Works
              <ChevronDown className="w-4 h-4 ml-1" />
            </GoldButton>
          </motion.div>

          {/* ── Collective Impact Counter ── */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full max-w-2xl"
          >
            <GlassCard hover={false} className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium text-center mb-6">
                Collective Impact
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
                {impactStats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-light text-[#F9F9F6] tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
