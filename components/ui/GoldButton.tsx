'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ──────────────────────────────────────────────────────────
// GoldButton — Platform CTA button
// Variants: primary (gold on dark), dark (on light bg), ghost
// Supports loading state and icon prop
// ──────────────────────────────────────────────────────────

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'ghost';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-[#D4AF37] to-[#F1D570] text-[#1A2E1A] font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-[0.98]',
  dark: 'bg-[#1A2E1A] text-[#F9F9F6] font-medium hover:bg-[#2A422A] active:scale-[0.98]',
  ghost:
    'border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-2.5 text-sm gap-2',
  lg: 'px-8 py-3 text-base gap-2.5',
};

const radiusStyles = {
  primary: 'rounded-full',
  dark: 'rounded-full',
  ghost: 'rounded-xl',
};

export default function GoldButton({
  variant = 'primary',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  children,
  disabled,
  className,
  ...props
}: GoldButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap transition-all duration-300 outline-none select-none',
        'focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        radiusStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg
          className="animate-spin w-4 h-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left Icon */}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}

      {children}

      {/* Right Icon */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
}
