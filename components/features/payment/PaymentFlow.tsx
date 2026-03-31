'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Lock,
} from 'lucide-react';
import PlanSelector, { type PlanType } from './PlanSelector';
import OrderSummary from './OrderSummary';
import GoldButton from '@/components/ui/GoldButton';
import LightCard from '@/components/ui/LightCard';
import type { PaymentState } from '@/types';

// ──────────────────────────────────────────────────────────
// PaymentFlow — Stripe Checkout Integration
// Plan selection → Stripe Checkout redirect
// Test mode: uses Stripe test keys (no real charges)
// ──────────────────────────────────────────────────────────

interface PaymentFlowProps {
  userId: string;
  onSuccess?: () => void;
}

const PRICES = { monthly: 9.99, yearly: 99.99 };

export default function PaymentFlow({ userId, onSuccess }: PaymentFlowProps) {
  const [step, setStep] = useState<'plan' | 'payment'>('plan');
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [errorMessage, setErrorMessage] = useState('');

  // ── Handle Stripe Checkout ─────────────────────────────
  const handleCheckout = useCallback(async () => {
    setPaymentState('processing');
    setErrorMessage('');

    try {
      // Create checkout session on the server
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout URL
      // In @stripe/stripe-js v9+, redirectToCheckout was removed.
      // The server returns the hosted checkout URL directly.
      onSuccess?.();
      window.location.href = data.url;
    } catch (err) {
      setPaymentState('failed');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    }
  }, [selectedPlan, onSuccess]);

  // ── Handle retry ───────────────────────────────────────
  const handleRetry = () => {
    setPaymentState('idle');
    setErrorMessage('');
  };

  // ── Plan Selection Step ────────────────────────────────
  if (step === 'plan') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1A2E1A] mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Subscribe to enter monthly draws, support charities, and track your
            golf impact.
          </p>
        </div>
        <PlanSelector
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
          onContinue={() => setStep('payment')}
        />
      </motion.div>
    );
  }

  // ── Payment Step (Stripe Checkout redirect) ────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1A2E1A] mb-3">
          Complete Your Subscription
        </h1>
        <p className="text-gray-500">
          You&apos;ll be redirected to Stripe&apos;s secure checkout to complete
          your {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan payment.
        </p>
      </div>

      {/* Back to plan selection */}
      <button
        onClick={() => {
          setStep('plan');
          setPaymentState('idle');
          setErrorMessage('');
        }}
        disabled={paymentState === 'processing'}
        className="text-sm text-gray-400 hover:text-[#1A2E1A] transition-colors disabled:opacity-50"
      >
        ← Change plan
      </button>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Checkout Info (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stripe Checkout Card */}
          <LightCard
            hover={false}
            className={`p-6 md:p-8 space-y-6 ${paymentState === 'processing' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-[#1A2E1A]" />
              <h3 className="text-base font-sans font-semibold text-[#1A2E1A]">
                Secure Payment
              </h3>
            </div>

            {/* Stripe Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#635BFF]/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#635BFF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A2E1A]">
                      Powered by Stripe
                    </p>
                    <p className="text-xs text-gray-500">
                      Industry-leading payment security
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <p className="text-sm text-gray-600">
                    You&apos;ll be securely redirected to Stripe to enter your
                    payment details. Stripe handles all card processing — your
                    card details never touch our servers.
                  </p>
                </div>

                {/* Test Cards Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    Test Mode — No Real Charges
                  </p>
                  <div className="text-xs text-amber-600 space-y-1">
                    <p>Use these test card numbers:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-1">
                      <li>
                        <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">
                          4242 4242 4242 4242
                        </code>{' '}
                        — Success
                      </li>
                      <li>
                        <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">
                          4000 0000 0000 0002
                        </code>{' '}
                        — Declined
                      </li>
                      <li>
                        <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">
                          4000 0000 0000 9995
                        </code>{' '}
                        — Insufficient funds
                      </li>
                    </ul>
                    <p className="mt-1">
                      Any future expiry, any 3-digit CVC, any postcode.
                    </p>
                  </div>
                </div>
              </div>

              {/* Accepted Cards */}
              <div className="flex items-center gap-3 justify-center">
                <VisaIcon />
                <MastercardIcon />
                <AmexIcon />
                <span className="text-xs text-gray-400">& more</span>
              </div>
            </div>

            {/* Secure Checkout Trust Line */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs text-gray-400">
                256-bit SSL encrypted · PCI DSS compliant · Secure checkout
              </span>
            </div>
          </LightCard>

          {/* Error Message */}
          <AnimatePresence>
            {paymentState === 'failed' && errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Checkout Button */}
          <GoldButton
            variant="dark"
            size="lg"
            className="w-full"
            loading={paymentState === 'processing'}
            icon={ArrowRight}
            iconPosition="right"
            onClick={handleCheckout}
            disabled={paymentState === 'processing'}
          >
            {paymentState === 'processing'
              ? 'Redirecting to Stripe…'
              : `Pay ₹${PRICES[selectedPlan].toFixed(2)} — Secure Checkout`}
          </GoldButton>
        </div>

        {/* Order Summary (2 cols) */}
        <div className="lg:col-span-2">
          <OrderSummary plan={selectedPlan} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Card Brand Icons ─────────────────────────────────────

function VisaIcon() {
  return (
    <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 10.27a8 8 0 010 11.46 8 8 0 010-11.46z" fill="#FF5F00" />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
      <rect width="48" height="32" rx="4" fill="#006FCF" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="9"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        AMEX
      </text>
    </svg>
  );
}
