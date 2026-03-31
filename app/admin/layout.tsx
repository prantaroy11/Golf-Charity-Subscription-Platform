'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import {
  Users,
  Ticket,
  Heart,
  Trophy,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  Leaf,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

// ──────────────────────────────────────────────────────────
// Admin Layout — Step 11.1
// Admin-only: middleware check role === 'admin'; redirect non-admins to /dashboard
// Sidebar with sections: Users, Draw, Charities, Winners, Reports
// ──────────────────────────────────────────────────────────

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/draw', label: 'Draw', icon: Ticket },
  { href: '/admin/charities', label: 'Charities', icon: Heart },
  { href: '/admin/winners', label: 'Winners', icon: Trophy },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, isAdmin } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin guard — redirect non-admins to /dashboard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, loading, isAdmin, router]);

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
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A2E1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] flex items-center justify-center animate-pulse">
            <Shield className="w-5 h-5 text-[#1A2E1A]" />
          </div>
          <p className="text-sm text-gray-400 font-medium">
            Loading admin panel…
          </p>
        </div>
      </div>
    );
  }

  // Don't render until auth check completes
  if (!user || !isAdmin) return null;

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? '?');

  return (
    <div className="min-h-screen bg-[#0F1A0F]">
      {/* ── Top Navbar ── */}
      <nav
        id="admin-navbar"
        className="fixed top-0 left-0 right-0 z-40 bg-[#1A2E1A] border-b border-white/10"
      >
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#F9F9F6] hover:bg-white/10 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1D570] group-hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] transition-shadow">
                  <Leaf className="w-4 h-4 text-[#1A2E1A]" />
                </div>
                <span className="font-serif text-lg font-medium text-[#F9F9F6] tracking-tight">
                  GolfGive
                </span>
              </Link>
              <span className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-[#F9F9F6] hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-xs font-bold text-[#1A2E1A]">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#F9F9F6]/80 max-w-[120px] truncate">
                  {profile?.full_name || profile?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Desktop Sidebar ── */}
      <aside
        id="admin-sidebar"
        className="hidden lg:flex fixed top-14 left-0 bottom-0 w-60 bg-[#1A2E1A] border-r border-white/5 flex-col z-30"
      >
        <div className="flex-1 py-6 px-3 space-y-1">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                id={`admin-sidebar-${label.toLowerCase()}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-white/10 text-[#F9F9F6]'
                    : 'text-gray-400 hover:text-[#F9F9F6] hover:bg-white/5'
                )}
              >
                <Icon
                  className={cn('w-4 h-4', active ? 'text-[#D4AF37]' : '')}
                />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-14 left-0 bottom-0 w-72 bg-[#1A2E1A] border-r border-white/5 z-50 flex flex-col lg:hidden"
            >
              <div className="flex-1 py-6 px-4 space-y-1">
                {adminLinks.map(({ href, label, icon: Icon }) => {
                  const active =
                    href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                        active
                          ? 'bg-white/10 text-[#F9F9F6]'
                          : 'text-gray-400 hover:text-[#F9F9F6] hover:bg-white/5'
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

                <div className="my-3 h-px bg-white/5" />
                <Link
                  href="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-400 hover:text-[#F9F9F6] hover:bg-white/5 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  User Dashboard
                </Link>
              </div>

              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full"
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
      <main className="pt-14 lg:pl-60">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
