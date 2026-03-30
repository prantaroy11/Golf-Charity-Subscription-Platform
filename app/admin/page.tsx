'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Ticket,
  Heart,
  Trophy,
  BarChart3,
  ArrowRight,
  Shield,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────
// Admin Overview Page — landing page for /admin
// Quick links to all admin sections
// ──────────────────────────────────────────────────────────

const sections = [
  {
    href: '/admin/users',
    label: 'Users',
    description: 'View, search, and manage all platform subscribers',
    icon: Users,
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
  },
  {
    href: '/admin/draw',
    label: 'Draw',
    description: 'Configure and run monthly prize draws',
    icon: Ticket,
    color: 'from-[#D4AF37]/20 to-[#D4AF37]/5',
    iconColor: 'text-[#D4AF37]',
  },
  {
    href: '/admin/charities',
    label: 'Charities',
    description: 'Manage charity directory and featured charities',
    icon: Heart,
    color: 'from-rose-500/20 to-rose-600/10',
    iconColor: 'text-rose-400',
  },
  {
    href: '/admin/winners',
    label: 'Winners',
    description: 'Verify winners and manage prize payouts',
    icon: Trophy,
    color: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-400',
  },
  {
    href: '/admin/reports',
    label: 'Reports',
    description: 'View platform analytics and export data',
    icon: BarChart3,
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminOverviewPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-medium text-[#F9F9F6]">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-500">
              Manage your platform from one place
            </p>
          </div>
        </div>
      </div>

      {/* Section Cards Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {sections.map((section) => (
          <motion.div key={section.href} variants={item}>
            <Link
              href={section.href}
              id={`admin-nav-${section.label.toLowerCase()}`}
              className="group block p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${section.color} mb-4`}
              >
                <section.icon className={`w-5 h-5 ${section.iconColor}`} />
              </div>
              <h2 className="text-lg font-medium text-[#F9F9F6] mb-1">
                {section.label}
              </h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {section.description}
              </p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#D4AF37] group-hover:gap-2.5 transition-all duration-300">
                Go to {section.label}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
