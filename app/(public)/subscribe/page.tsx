'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';
import PaymentFlow from '@/components/features/payment/PaymentFlow';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function SubscribePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { isActive, loading: subLoading } = useSubscription(user, userLoading);

  useEffect(() => {
    if (userLoading || subLoading) return;

    if (!user) {
      router.push('/signup?redirect=/subscribe');
      return;
    }

    if (isActive) {
      router.push('/dashboard');
    }
  }, [user, isActive, userLoading, subLoading, router]);

  // Loading / gating state
  if (userLoading || subLoading || !user || isActive) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar variant="light" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <PaymentFlow
          userId={user.id}
          onSuccess={() => {
            // Session will be refreshed by PaymentFlow
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
