'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Menu,
  X,
  Shield,
  Leaf,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Navbar — Shared layout component
// Supports dark (homepage) and light (dashboard) variants
// ──────────────────────────────────────────────────────────

interface NavbarProps {
  variant?: 'dark' | 'light';
  user?: {
    full_name: string | null;
    email: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

const darkNavLinks = [
  { href: '/charities', label: 'Charities' },
  { href: '/draws', label: 'Draws' },
  { href: '/how-it-works', label: 'How It Works' },
];

const lightNavLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/scores', label: 'Scores' },
  { href: '/dashboard/charity', label: 'Charity' },
  { href: '/dashboard/winnings', label: 'Winnings' },
];

export default function Navbar({
  variant = 'dark',
  user = null,
  onLogout,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = variant === 'dark';
  const navLinks = isDark ? darkNavLinks : lightNavLinks;

  // ── Scroll-spy: make navbar opaque after hero scrolls past ──
  useEffect(() => {
    if (!isDark) return;
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDark]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // ── Initials for avatar ──
  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? '?');

  return (
    <>
      <nav
        id="main-navbar"
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isDark
            ? scrolled
              ? 'bg-[#1A2E1A]/95 backdrop-blur-md border-b border-white/10 shadow-lg'
              : 'bg-[#1A2E1A]/80 backdrop-blur-md border-b border-white/10'
            : 'bg-[#F9F9F6] border-b border-gray-200'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              id="navbar-logo"
            >
              <div
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-full transition-shadow duration-300',
                  isDark
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#F1D570] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                    : 'bg-[#1A2E1A] group-hover:bg-[#2A422A]'
                )}
              >
                <Leaf
                  className={cn(
                    'w-5 h-5',
                    isDark ? 'text-[#1A2E1A]' : 'text-[#F9F9F6]'
                  )}
                />
              </div>
              <span
                className={cn(
                  'font-serif text-lg font-medium tracking-tight',
                  isDark ? 'text-[#F9F9F6]' : 'text-[#1A2E1A]'
                )}
              >
                GolfGive
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    isDark
                      ? 'text-gray-300 hover:text-[#F9F9F6] hover:bg-white/5'
                      : 'text-gray-600 hover:text-[#1A2E1A] hover:bg-gray-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Desktop Right Section ── */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                /* ── User Avatar Dropdown ── */
                <DropdownMenu>
                  <DropdownMenuTrigger
                    id="user-avatar-dropdown"
                    className={cn(
                      'flex items-center gap-2 rounded-full px-1 py-1 transition-colors duration-200 cursor-pointer',
                      isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        isDark
                          ? 'bg-gradient-to-br from-[#D4AF37] to-[#F1D570] text-[#1A2E1A]'
                          : 'bg-[#1A2E1A] text-[#F9F9F6]'
                      )}
                    >
                      {initials}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium max-w-[120px] truncate',
                        isDark ? 'text-[#F9F9F6]' : 'text-[#1A2E1A]'
                      )}
                    >
                      {user.full_name || user.email}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8}>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        <span className="block text-sm font-medium">
                          {user.full_name || 'User'}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/dashboard" />}>
                      <LayoutDashboard className="w-4 h-4 mr-2 text-[#D4AF37]" />
                      Dashboard
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem render={<Link href="/admin" />}>
                        <Shield className="w-4 h-4 mr-2 text-[#D4AF37]" />
                        Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      render={<Link href="/dashboard/settings" />}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} variant="destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* ── Subscribe CTA (dark) / Login (light) ── */
                <>
                  <Link
                    href="/login"
                    id="nav-login-btn"
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                      isDark
                        ? 'text-gray-300 hover:text-[#F9F9F6]'
                        : 'text-gray-600 hover:text-[#1A2E1A]'
                    )}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/subscribe"
                    id="nav-subscribe-btn"
                    className={cn(
                      'px-5 py-2 rounded-full text-sm font-bold transition-all duration-300',
                      isDark
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F1D570] text-[#1A2E1A] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                        : 'bg-[#1A2E1A] text-[#F9F9F6] hover:bg-[#2A422A]'
                    )}
                  >
                    Subscribe
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200',
                isDark
                  ? 'text-[#F9F9F6] hover:bg-white/10'
                  : 'text-[#1A2E1A] hover:bg-gray-100'
              )}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu-overlay"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed inset-0 z-50 md:hidden flex flex-col',
              isDark ? 'bg-[#1A2E1A]' : 'bg-[#F9F9F6]'
            )}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-4 h-16">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full',
                    isDark
                      ? 'bg-gradient-to-br from-[#D4AF37] to-[#F1D570]'
                      : 'bg-[#1A2E1A]'
                  )}
                >
                  <Leaf
                    className={cn(
                      'w-5 h-5',
                      isDark ? 'text-[#1A2E1A]' : 'text-[#F9F9F6]'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'font-serif text-lg font-medium',
                    isDark ? 'text-[#F9F9F6]' : 'text-[#1A2E1A]'
                  )}
                >
                  GolfGive
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-lg',
                  isDark
                    ? 'text-[#F9F9F6] hover:bg-white/10'
                    : 'text-[#1A2E1A] hover:bg-gray-100'
                )}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav links */}
            <div className="flex flex-col flex-1 px-6 pt-8 gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-lg font-medium transition-colors duration-200',
                      isDark
                        ? 'text-gray-300 hover:text-[#F9F9F6] hover:bg-white/5'
                        : 'text-gray-600 hover:text-[#1A2E1A] hover:bg-gray-100'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* User-specific links */}
              {user && (
                <>
                  <div
                    className={cn(
                      'my-4 h-px',
                      isDark ? 'bg-white/10' : 'bg-gray-200'
                    )}
                  />
                  {user.role === 'admin' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: navLinks.length * 0.08,
                        duration: 0.3,
                      }}
                    >
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium',
                          isDark
                            ? 'text-[#D4AF37] hover:bg-white/5'
                            : 'text-[#D4AF37] hover:bg-gray-100'
                        )}
                      >
                        <Shield className="w-5 h-5" />
                        Admin Panel
                      </Link>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (navLinks.length + 1) * 0.08,
                      duration: 0.3,
                    }}
                  >
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium',
                        isDark
                          ? 'text-gray-300 hover:text-[#F9F9F6] hover:bg-white/5'
                          : 'text-gray-600 hover:text-[#1A2E1A] hover:bg-gray-100'
                      )}
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (navLinks.length + 2) * 0.08,
                      duration: 0.3,
                    }}
                  >
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        onLogout?.();
                      }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium w-full text-left',
                        'text-red-500 hover:bg-red-50/10'
                      )}
                    >
                      <LogOut className="w-5 h-5" />
                      Log out
                    </button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile CTA */}
            {!user && (
              <div className="px-6 pb-8 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block w-full text-center px-6 py-3 rounded-full text-base font-medium transition-all duration-300',
                    isDark
                      ? 'border border-white/20 text-[#F9F9F6] hover:bg-white/5'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/subscribe"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block w-full text-center px-6 py-3 rounded-full text-base font-bold transition-all duration-300',
                    isDark
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F1D570] text-[#1A2E1A] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : 'bg-[#1A2E1A] text-[#F9F9F6] hover:bg-[#2A422A]'
                  )}
                >
                  Subscribe
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
