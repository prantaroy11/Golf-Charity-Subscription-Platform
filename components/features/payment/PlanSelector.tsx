'use client';

import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import LightCard from '@/components/ui/LightCard';
import GoldButton from '@/components/ui/GoldButton';

// ──────────────────────────────────────────────────────────
// PlanSelector — Step 7.2
// Two cards: Monthly vs Yearly with gold selection state
// ──────────────────────────────────────────────────────────

export type PlanType = 'monthly' | 'yearly';

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onPlanChange: (plan: PlanType) => void;
  onContinue: () => void;
}

const MONTHLY_PRICE = 9.99;
const YEARLY_PRICE = 99.99;
const YEARLY_MONTHLY_EQUIVALENT = YEARLY_PRICE / 12;
const YEARLY_SAVINGS = Math.round(
  ((MONTHLY_PRICE * 12 - YEARLY_PRICE) / (MONTHLY_PRICE * 12)) * 100
);

const features = [
  'Monthly prize draw entry',
  '5-score rolling window',
  'Charity contribution (10%+)',
  'Dashboard & impact tracking',
  'Winner verification support',
];

export default function PlanSelector({
  selectedPlan,
  onPlanChange,
  onContinue,
}: PlanSelectorProps) {
  return (
    <div className="space-y-8">
      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <LightCard
            hover={false}
            className={`relative p-8 cursor-pointer transition-all duration-300 ${
              selectedPlan === 'monthly'
                ? 'border-[#D4AF37] border-2 bg-[#D4AF37]/5 shadow-md'
                : 'border border-gray-100 hover:border-gray-200'
            }`}
            onClick={() => onPlanChange('monthly')}
          >
            {/* Selection Indicator */}
            {selectedPlan === 'monthly' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-6 right-6"
              >
                <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
              </motion.div>
            )}

            <div className="space-y-6">
              {/* Plan Name */}
              <div>
                <h3 className="text-lg font-sans font-semibold text-[#1A2E1A]">
                  Monthly
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Flexible, cancel anytime
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif font-light text-[#1A2E1A]">
                  £{MONTHLY_PRICE.toFixed(2)}
                </span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </LightCard>
        </motion.div>

        {/* Yearly Plan */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <LightCard
            hover={false}
            className={`relative p-8 cursor-pointer transition-all duration-300 ${
              selectedPlan === 'yearly'
                ? 'border-[#D4AF37] border-2 bg-[#D4AF37]/5 shadow-md'
                : 'border border-gray-100 hover:border-gray-200'
            }`}
            onClick={() => onPlanChange('yearly')}
          >
            {/* Best Value Badge */}
            <div className="absolute -top-3 left-6">
              <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Best Value
              </span>
            </div>

            {/* Selection Indicator */}
            {selectedPlan === 'yearly' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-6 right-6"
              >
                <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
              </motion.div>
            )}

            <div className="space-y-6 mt-2">
              {/* Plan Name */}
              <div>
                <h3 className="text-lg font-sans font-semibold text-[#1A2E1A]">
                  Yearly
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Save {YEARLY_SAVINGS}% — commit to impact
                </p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-light text-[#1A2E1A]">
                    £{YEARLY_PRICE.toFixed(2)}
                  </span>
                  <span className="text-gray-400 text-sm">/year</span>
                </div>
                <p className="text-sm text-[#D4AF37] font-medium mt-1">
                  £{YEARLY_MONTHLY_EQUIVALENT.toFixed(2)}/month — Save £
                  {(MONTHLY_PRICE * 12 - YEARLY_PRICE).toFixed(2)}/year
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </LightCard>
        </motion.div>
      </div>

      {/* Charity Note */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          <span className="text-[#D4AF37] font-medium">10%</span> of your
          subscription goes directly to your chosen charity
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <GoldButton
          variant="dark"
          size="lg"
          className="w-full md:w-auto md:min-w-[280px]"
          onClick={onContinue}
        >
          Start {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan
        </GoldButton>
      </div>
    </div>
  );
}
