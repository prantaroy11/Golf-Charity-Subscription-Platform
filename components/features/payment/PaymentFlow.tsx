'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, AlertCircle, RotateCcw } from 'lucide-react';
import PlanSelector, { type PlanType } from './PlanSelector';
import CardInput, { type CardData } from './CardInput';
import OrderSummary from './OrderSummary';
import GoldButton from '@/components/ui/GoldButton';
import { paymentSchema } from '@/lib/validations/payment';
import type { PaymentState } from '@/types';

// ──────────────────────────────────────────────────────────
// PaymentFlow — Step 7.6
// Full payment state machine: idle → processing → success/failed
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
  const [successData, setSuccessData] = useState<{
    plan: string;
    renewalDate: string;
    amount: string;
  } | null>(null);

  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Validate card fields ───────────────────────────────
  const validateCard = useCallback((): boolean => {
    const result = paymentSchema.safeParse(cardData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        errors[fieldName] = issue.message;
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  }, [cardData]);

  // ── Handle payment submission ──────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!validateCard()) return;

    setPaymentState('processing');
    setErrorMessage('');

    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: cardData.cardNumber,
          plan: selectedPlan,
          userId,
        }),
      });

      const data = await res.json();

      if (data.status === 'succeeded') {
        const renewalDate = new Date(
          data.subscription.current_period_end * 1000
        ).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        setSuccessData({
          plan: selectedPlan === 'monthly' ? 'Monthly' : 'Yearly',
          renewalDate,
          amount: `£${PRICES[selectedPlan].toFixed(2)}`,
        });
        setPaymentState('success');
        onSuccess?.();
      } else {
        setPaymentState('failed');
        setErrorMessage(
          data.error?.message || 'Payment failed. Please try again.'
        );
        // Clear CVC on failure
        setCardData((prev) => ({ ...prev, cvc: '' }));
      }
    } catch {
      setPaymentState('failed');
      setErrorMessage('Something went wrong. Please try again.');
      setCardData((prev) => ({ ...prev, cvc: '' }));
    }
  }, [cardData, selectedPlan, userId, validateCard, onSuccess]);

  // ── Handle retry ───────────────────────────────────────
  const handleRetry = () => {
    setPaymentState('idle');
    setErrorMessage('');
  };

  // ── Success State ──────────────────────────────────────
  if (paymentState === 'success' && successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-8"
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
          <h2 className="text-2xl font-serif font-medium text-[#1A2E1A]">
            Payment Successful!
          </h2>
          <p className="text-gray-600 max-w-md">
            Welcome to the platform. Your {successData.plan} Plan is now active.
          </p>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Plan</span>
            <span className="font-medium text-[#1A2E1A]">
              {successData.plan}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-medium text-[#1A2E1A]">
              {successData.amount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Renews</span>
            <span className="font-medium text-[#1A2E1A]">
              {successData.renewalDate}
            </span>
          </div>
        </div>

        {/* Dashboard CTA */}
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
    );
  }

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

  // ── Payment Step (idle / processing / failed) ──────────
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
          Enter your payment details to start your{' '}
          {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan
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
        {/* Card Input (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <CardInput
            cardData={cardData}
            onChange={setCardData}
            errors={fieldErrors}
            disabled={paymentState === 'processing'}
            shimmer={paymentState === 'processing'}
          />

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

          {/* Submit Button */}
          <GoldButton
            variant="dark"
            size="lg"
            className="w-full"
            loading={paymentState === 'processing'}
            icon={ArrowRight}
            iconPosition="right"
            onClick={handleSubmit}
            disabled={paymentState === 'processing'}
          >
            {paymentState === 'processing'
              ? 'Processing your payment…'
              : `Pay £${PRICES[selectedPlan].toFixed(2)}`}
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
