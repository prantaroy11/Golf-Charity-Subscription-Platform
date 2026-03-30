'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Ticket,
  Heart,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';
import { createClient } from '@/lib/supabase/client';

// ──────────────────────────────────────────────────────────
// Dashboard Layout — Step 10.1
// Light background, sidebar on desktop, hamburger on mobile.
// Auth guard: no session → /login
// Subscription guard: no active sub → /subscribe
// ──────────────────────────────────────────────────────────

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/scores', label: 'Scores', icon: Target },
  { href: '/dashboard/charity', label: 'Charity', icon: Heart },
  { href: '/dashboard/winnings', label: 'Winnings', icon: Trophy },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading: userLoading, isAdmin } = useUser();
  const { isActive, loading: subLoading } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Subscription guard
  useEffect(() => {
    if (!userLoading && !subLoading && user && !isActive) {
      router.push('/subscribe');
    }
  }, [user, userLoading, subLoading, isActive, router]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  // Loading state
  if (userLoading || subLoading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] flex items-center justify-center animate-pulse">
            <Leaf className="w-5 h-5 text-[#1A2E1A]" />
          </div>
          <p className="text-sm text-gray-400 font-medium">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  // Don't render anything until auth check is done
  if (!user || !isActive) return null;

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? '?');

  return (
    <div className="min-h-screen bg-offwhite">
      {/* ── Top Navbar ── */}
      <nav
        id="dashboard-navbar"
        className="fixed top-0 left-0 right-0 z-40 bg-[#F9F9F6] border-b border-gray-200"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#1A2E1A] hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1A2E1A] group-hover:bg-[#2A422A] transition-colors">
                  <Leaf className="w-5 h-5 text-[#F9F9F6]" />
                </div>
                <span className="font-serif text-lg font-medium text-[#1A2E1A] tracking-tight">
                  GolfGive
                </span>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1A2E1A] flex items-center justify-center text-xs font-bold text-[#F9F9F6]">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#1A2E1A] max-w-[120px] truncate">
                  {profile?.full_name || profile?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Desktop Sidebar ── */}
      <aside
        id="dashboard-sidebar"
        className="hidden lg:flex fixed top-16 left-0 bottom-0 w-64 bg-[#F9F9F6] border-r border-gray-200 flex-col z-30"
      >
        <div className="flex-1 py-6 px-4 space-y-1">
          {sidebarLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                id={`sidebar-${label.toLowerCase()}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#1A2E1A] text-[#F9F9F6]'
                    : 'text-gray-600 hover:text-[#1A2E1A] hover:bg-gray-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-4.5 h-4.5',
                    isActive ? 'text-[#D4AF37]' : ''
                  )}
                />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-4.5 h-4.5" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-16 left-0 bottom-0 w-72 bg-[#F9F9F6] border-r border-gray-200 z-50 flex flex-col lg:hidden"
            >
              <div className="flex-1 py-6 px-4 space-y-1">
                {sidebarLinks.map(({ href, label, icon: Icon }) => {
                  const active =
                    href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                        active
                          ? 'bg-[#1A2E1A] text-[#F9F9F6]'
                          : 'text-gray-600 hover:text-[#1A2E1A] hover:bg-gray-100'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          active ? 'text-[#D4AF37]' : ''
                        )}
                      />
                      {label}
                    </Link>
                  );
                })}

                {isAdmin && (
                  <>
                    <div className="my-3 h-px bg-gray-200" />
                    <Link
                      href="/admin"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors"
                    >
                      <Shield className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="pt-16 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
