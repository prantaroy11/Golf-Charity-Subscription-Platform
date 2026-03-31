'use client';

import React from 'react';
import { Calendar, Heart } from 'lucide-react';
import LightCard from '@/components/ui/LightCard';

// ──────────────────────────────────────────────────────────
// OrderSummary — Step 7.4
// Shows plan, charity contribution, total, and renewal date
// ──────────────────────────────────────────────────────────

interface OrderSummaryProps {
  plan: 'monthly' | 'yearly';
  charityName?: string;
}

const PRICES = {
  monthly: 9.99,
  yearly: 99.99,
};

function getRenewalDate(plan: 'monthly' | 'yearly'): string {
  const now = new Date();
  if (plan === 'monthly') {
    now.setDate(now.getDate() + 30);
  } else {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function OrderSummary({
  plan,
  charityName = 'Your Chosen Charity',
}: OrderSummaryProps) {
  const price = PRICES[plan];
  const charityAmount = (price * 0.1).toFixed(2);
  const renewalDate = getRenewalDate(plan);
  const periodLabel = plan === 'monthly' ? 'month' : 'year';

  return (
    <LightCard hover={false} className="p-6 md:p-8 space-y-4">
      <h3 className="text-base font-sans font-semibold text-[#1A2E1A]">
        Order Summary
      </h3>

      {/* Plan Line */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan
        </span>
        <span className="font-medium text-[#1A2E1A]">
          ₹{price.toFixed(2)}/{periodLabel}
        </span>
      </div>

      {/* Charity Contribution */}
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-gray-600">
          <Heart className="w-4 h-4 text-[#D4AF37]" />
          10% to {charityName}
        </span>
        <span className="text-[#D4AF37] font-medium">
          ₹{charityAmount}/{periodLabel}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#1A2E1A]">Total</span>
        <span className="text-xl font-serif font-medium text-[#1A2E1A]">
          ₹{price.toFixed(2)}
        </span>
      </div>

      {/* Renewal Date */}
      <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
        <Calendar className="w-3.5 h-3.5" />
        <span>Renews on {renewalDate}</span>
      </div>
    </LightCard>
  );
}
