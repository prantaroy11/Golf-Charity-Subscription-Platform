'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Leaf, Globe2, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Section from '@/components/layout/Section';
import Link from 'next/link';

// ──────────────────────────────────────────────────────────
// CausesSection — "Your Subscription, Their Impact"
// Step 5.2 — Dark section with glassmorphism charity cards
// ──────────────────────────────────────────────────────────

const causes = [
  {
    icon: Heart,
    name: 'Junior Golf Foundation',
    description:
      'Providing free coaching and equipment to young players from underserved communities, making golf accessible to everyone.',
    funded: '£4,230',
  },
  {
    icon: Leaf,
    name: 'Greens for Good',
    description:
      'Restoring natural habitats on and around golf courses, protecting biodiversity and reducing environmental impact.',
    funded: '£3,815',
  },
  {
    icon: Globe2,
    name: 'Golf Without Borders',
    description:
      'Building golf programmes in developing countries to promote wellbeing, education, and community connection through sport.',
    funded: '£2,970',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function CausesSection() {
  return (
    <Section theme="dark" id="causes-section">
      {/* ── Section Header ── */}
      <div className="text-center mb-12 sm:mb-16">
        <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
          Impact Partners
        </p>
        <h2 className="font-serif font-medium text-3xl sm:text-4xl lg:text-5xl text-[#F9F9F6] tracking-tight">
          Your Subscription,{' '}
          <span className="text-gold-gradient">Their Impact</span>
        </h2>
        <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-xl mx-auto font-light">
          Every month, a portion of your subscription directly funds the
          charities making a real difference.
        </p>
      </div>

      {/* ── Charity Cards ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {causes.map((cause) => (
          <motion.div key={cause.name} variants={cardVariants}>
            <GlassCard className="p-6 sm:p-8 group h-full flex flex-col">
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-[#1A2E1A] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <cause.icon className="w-5 h-5 text-[#D4AF37]" />
              </div>

              {/* Content */}
              <h3 className="font-serif font-medium text-xl text-[#F9F9F6] mb-3">
                {cause.name}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">
                {cause.description}
              </p>

              {/* Funded badge */}
              <div className="mt-5 pt-5 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-500">
                    Funded this month
                  </span>
                  <span className="text-[#D4AF37] font-medium text-sm">
                    {cause.funded}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ── View All Link ── */}
      <div className="text-center mt-10">
        <Link
          href="/charities"
          id="causes-view-all"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#F9F9F6] text-sm font-medium transition-colors duration-200 group"
        >
          View All Charities
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </Section>
  );
}
