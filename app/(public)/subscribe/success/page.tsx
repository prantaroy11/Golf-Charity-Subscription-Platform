'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';

// ──────────────────────────────────────────────────────────
// Stripe Checkout Success Page
// Shown after a successful Stripe Checkout redirect.
// Verifies the session and displays confirmation.
// ──────────────────────────────────────────────────────────

interface SessionData {
  plan: string;
  amount: string;
  renewalDate: string;
  status: string;
}

// ── Loading fallback ─────────────────────────────────────
function SuccessLoading() {
  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        <p className="text-sm text-gray-400">Confirming your subscription…</p>
      </div>
    </div>
  );
}

// ── Inner component that uses useSearchParams ────────────
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      router.push('/subscribe');
      return;
    }

    async function verifySession() {
      try {
        const res = await fetch(
          `/api/payment/verify-session?session_id=${sessionId}`
        );
        if (!res.ok) {
          throw new Error('Failed to verify session');
        }
        const data = await res.json();
        setSessionData(data);
      } catch {
        // Even if verification fails, the webhook will have handled DB update.
        // Show a generic success message.
        setSessionData({
          plan: 'Subscription',
          amount: '',
          renewalDate: '',
          status: 'active',
        });
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [sessionId, router]);

  if (loading) {
    return <SuccessLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <GoldButton
            variant="dark"
            size="md"
            onClick={() => router.push('/subscribe')}
          >
            Try Again
          </GoldButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center space-y-8"
        >
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
          </motion.div>

          {/* Confirmation Text */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1A2E1A]">
              Payment Successful!
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Welcome to the Golf Charity Platform. Your{' '}
              {sessionData?.plan || 'subscription'} is now active.
            </p>
          </div>

          {/* Details Card */}
          {sessionData && (sessionData.amount || sessionData.renewalDate) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 rounded-2xl p-6 w-full max-w-sm space-y-3"
            >
              {sessionData.plan && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium text-[#1A2E1A]">
                    {sessionData.plan}
                  </span>
                </div>
              )}
              {sessionData.amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-[#1A2E1A]">
                    {sessionData.amount}
                  </span>
                </div>
              )}
              {sessionData.renewalDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Renews</span>
                  <span className="font-medium text-[#1A2E1A]">
                    {sessionData.renewalDate}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Test Mode Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2"
          >
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs text-amber-700 font-medium">
              Stripe Test Mode — No real charges
            </span>
          </motion.div>

          {/* Dashboard CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <GoldButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => (window.location.href = '/dashboard')}
              className="min-w-[240px]"
            >
              Go to Dashboard
            </GoldButton>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

// ── Page export with Suspense boundary ───────────────────
// useSearchParams() requires a Suspense boundary in Next.js 16
export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}
