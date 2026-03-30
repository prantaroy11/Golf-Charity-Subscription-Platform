'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Calendar, ArrowRight, Ticket } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import type { Draw } from '@/types';

// ──────────────────────────────────────────────────────────
// Draws Index — Public listing of all published draws
// ──────────────────────────────────────────────────────────

function formatMonth(drawMonth: string): string {
  const [year, month] = drawMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function DrawsIndexPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDraws() {
      try {
        const res = await fetch('/api/draw/list');
        if (res.ok) {
          const data = await res.json();
          setDraws(data.draws ?? []);
        }
      } catch (err) {
        console.error('Failed to fetch draws:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDraws();
  }, []);

  return (
    <>
      {/* ── Dark Hero ── */}
      <section className="bg-[#1A2E1A] min-h-[40vh] relative overflow-hidden">
        {/* Ambient gold glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Ticket className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-gray-300 font-medium">
                Monthly Prize Draws
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#F9F9F6] mb-4">
              Draw <span className="text-gold-gradient">Results</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
              Explore past draw results, winning numbers, and prize breakdowns.
              Every draw supports the charities you care about.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Draws Grid ── */}
      <section className="bg-[#F9F9F6] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div
                        key={j}
                        className="w-10 h-10 bg-gray-200 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : draws.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-[#1A2E1A] mb-2">
                No draws yet
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Monthly draws will appear here once published. Subscribe to
                participate in the next draw!
              </p>
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-[#1A2E1A] text-[#F9F9F6] font-medium hover:bg-[#2A422A] transition-colors duration-300"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draws.map((draw, idx) => (
                <motion.div
                  key={draw.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={`/draws/${draw.draw_month}`}
                    className="group block bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300 hover:border-[#D4AF37]/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-xl font-medium text-[#1A2E1A]">
                        {formatMonth(draw.draw_month)}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {draw.draw_month}
                      </div>
                    </div>

                    {/* Drawn numbers */}
                    <div className="flex gap-2 mb-6">
                      {draw.numbers_drawn.map((num, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-[#1A2E1A] text-[#F9F9F6] flex items-center justify-center text-sm font-bold group-hover:bg-gradient-to-br group-hover:from-[#D4AF37] group-hover:to-[#F1D570] group-hover:text-[#1A2E1A] transition-all duration-300"
                        >
                          {num}
                        </div>
                      ))}
                    </div>

                    {/* Draw type badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">
                        {draw.draw_type} draw
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#D4AF37] transition-colors duration-300" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
