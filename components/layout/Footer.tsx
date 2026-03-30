import React from 'react';
import Link from 'next/link';
import { Leaf, Heart, Globe2 } from 'lucide-react';

// ──────────────────────────────────────────────────────────
// Footer — Site-wide footer component
// Dark background (forest), three-column layout
// ──────────────────────────────────────────────────────────

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/charities', label: 'Charities' },
  { href: '/draws', label: 'Draw Results' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/subscribe', label: 'Subscribe' },
];

const charityLinks = [
  { href: '/charities', label: 'Charity Directory' },
  { href: '/dashboard/charity', label: 'My Charity' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="site-footer" className="bg-[#1A2E1A] text-[#F9F9F6]">
      {/* ── Main Footer Content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: Brand + Tagline */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                <Leaf className="w-5 h-5 text-[#1A2E1A]" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tight">
                GolfGive
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              A subscription-driven golf platform combining performance
              tracking, monthly prize draws, and charitable giving. Play for
              purpose. Win for good.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Heart className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                Certified Impact Partner
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-[#F9F9F6] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Charity & Social */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-4">
              Charity & Impact
            </h4>
            <ul className="space-y-2.5">
              {charityLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-[#F9F9F6] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social / Community */}
            <div className="mt-8 space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium">
                Community
              </h4>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Website"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-200"
                >
                  <Globe2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {currentYear} GolfGive. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            Powered by purpose
            <span className="text-[#D4AF37]">✦</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
