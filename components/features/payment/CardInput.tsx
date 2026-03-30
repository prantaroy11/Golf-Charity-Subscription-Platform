'use client';

import React, { useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { paymentSchema } from '@/lib/validations/payment';
import LightCard from '@/components/ui/LightCard';

// ──────────────────────────────────────────────────────────
// CardInput — Step 7.3
// Fully controlled card input with formatting, brand detection,
// and inline validation. Production-grade Stripe-like UI.
// ──────────────────────────────────────────────────────────

export interface CardData {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
}

interface CardInputProps {
  cardData: CardData;
  onChange: (data: CardData) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  shimmer?: boolean;
}

// ── Card brand detection ─────────────────────────────────
function detectBrand(num: string): 'visa' | 'mastercard' | null {
  const raw = num.replace(/\s/g, '');
  if (raw.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(raw)) return 'mastercard';
  return null;
}

// ── Formatting helpers ───────────────────────────────────
function formatCardNumber(val: string): string {
  return val
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

// ── Brand icon SVGs ──────────────────────────────────────
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

// ── Field validation status ──────────────────────────────
function getFieldStatus(
  fieldName: keyof CardData,
  value: string,
  errors: Record<string, string>
): 'idle' | 'valid' | 'invalid' {
  if (!value) return 'idle';
  if (errors[fieldName]) return 'invalid';

  switch (fieldName) {
    case 'cardNumber':
      return value.replace(/\s/g, '').length === 16 ? 'valid' : 'idle';
    case 'expiry':
      return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value) ? 'valid' : 'idle';
    case 'cvc':
      return value.length === 3 ? 'valid' : 'idle';
    case 'name':
      return value.length >= 2 ? 'valid' : 'idle';
    default:
      return 'idle';
  }
}

function StatusIndicator({ status }: { status: 'idle' | 'valid' | 'invalid' }) {
  if (status === 'valid') {
    return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  }
  if (status === 'invalid') {
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  }
  return null;
}

export default function CardInput({
  cardData,
  onChange,
  errors,
  disabled = false,
  shimmer = false,
}: CardInputProps) {
  const brand = detectBrand(cardData.cardNumber);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (field: keyof CardData, rawValue: string) => {
      let value = rawValue;
      if (field === 'cardNumber') value = formatCardNumber(rawValue);
      if (field === 'expiry') value = formatExpiry(rawValue);
      if (field === 'cvc') value = rawValue.replace(/\D/g, '').slice(0, 3);

      onChange({ ...cardData, [field]: value });
    },
    [cardData, onChange]
  );

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const inputBase =
    'w-full rounded-xl border bg-white px-4 py-3 text-[#1A2E1A] text-sm font-sans placeholder:text-gray-400 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-400';
  const inputFocus =
    'focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:border-[#D4AF37]';
  const inputError = 'border-red-300 ring-1 ring-red-200';
  const inputDefault = 'border-gray-200';

  return (
    <LightCard
      hover={false}
      className={`p-6 md:p-8 space-y-6 ${shimmer ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="w-5 h-5 text-[#1A2E1A]" />
        <h3 className="text-base font-sans font-semibold text-[#1A2E1A]">
          Payment Details
        </h3>
      </div>

      {/* Cardholder Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="card-name"
          className="block text-xs font-medium text-gray-500 uppercase tracking-widest"
        >
          Cardholder Name
        </label>
        <div className="relative">
          <input
            id="card-name"
            type="text"
            placeholder="John Doe"
            value={cardData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            disabled={disabled}
            className={`${inputBase} ${inputFocus} ${
              touched.name && errors.name ? inputError : inputDefault
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <StatusIndicator
              status={
                touched.name
                  ? getFieldStatus('name', cardData.name, errors)
                  : 'idle'
              }
            />
          </div>
        </div>
        {touched.name && errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Card Number */}
      <div className="space-y-1.5">
        <label
          htmlFor="card-number"
          className="block text-xs font-medium text-gray-500 uppercase tracking-widest"
        >
          Card Number
        </label>
        <div className="relative">
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={cardData.cardNumber}
            onChange={(e) => handleChange('cardNumber', e.target.value)}
            onBlur={() => handleBlur('cardNumber')}
            disabled={disabled}
            className={`${inputBase} ${inputFocus} pr-20 ${
              touched.cardNumber && errors.cardNumber
                ? inputError
                : inputDefault
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {brand === 'visa' && <VisaIcon />}
            {brand === 'mastercard' && <MastercardIcon />}
            <StatusIndicator
              status={
                touched.cardNumber
                  ? getFieldStatus('cardNumber', cardData.cardNumber, errors)
                  : 'idle'
              }
            />
          </div>
        </div>
        {touched.cardNumber && errors.cardNumber && (
          <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
        )}
      </div>

      {/* Expiry + CVC Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expiry */}
        <div className="space-y-1.5">
          <label
            htmlFor="card-expiry"
            className="block text-xs font-medium text-gray-500 uppercase tracking-widest"
          >
            Expiry
          </label>
          <div className="relative">
            <input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              value={cardData.expiry}
              onChange={(e) => handleChange('expiry', e.target.value)}
              onBlur={() => handleBlur('expiry')}
              disabled={disabled}
              className={`${inputBase} ${inputFocus} ${
                touched.expiry && errors.expiry ? inputError : inputDefault
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <StatusIndicator
                status={
                  touched.expiry
                    ? getFieldStatus('expiry', cardData.expiry, errors)
                    : 'idle'
                }
              />
            </div>
          </div>
          {touched.expiry && errors.expiry && (
            <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>
          )}
        </div>

        {/* CVC */}
        <div className="space-y-1.5">
          <label
            htmlFor="card-cvc"
            className="block text-xs font-medium text-gray-500 uppercase tracking-widest"
          >
            CVC
          </label>
          <div className="relative">
            <input
              id="card-cvc"
              type="text"
              inputMode="numeric"
              placeholder="123"
              value={cardData.cvc}
              onChange={(e) => handleChange('cvc', e.target.value)}
              onBlur={() => handleBlur('cvc')}
              disabled={disabled}
              className={`${inputBase} ${inputFocus} ${
                touched.cvc && errors.cvc ? inputError : inputDefault
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <StatusIndicator
                status={
                  touched.cvc
                    ? getFieldStatus('cvc', cardData.cvc, errors)
                    : 'idle'
                }
              />
            </div>
          </div>
          {touched.cvc && errors.cvc && (
            <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>
          )}
        </div>
      </div>

      {/* Secure Checkout Trust Line */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
        <span className="text-xs text-gray-400">
          256-bit SSL encrypted · Secure checkout
        </span>
      </div>
    </LightCard>
  );
}
