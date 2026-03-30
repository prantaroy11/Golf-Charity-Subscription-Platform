'use client';

import Navbar from '@/components/layout/Navbar';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ──────────────────────────────────────────────────────────
// Public Layout — Wraps all public-facing pages
// Uses dark Navbar with scroll-spy behaviour
// ──────────────────────────────────────────────────────────

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <Navbar
        variant="dark"
        user={
          profile
            ? {
                full_name: profile.full_name,
                email: profile.email,
                role: profile.role,
              }
            : null
        }
        onLogout={handleLogout}
      />
      {children}
    </>
  );
}
