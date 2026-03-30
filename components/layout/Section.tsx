import React from 'react';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Section — Themed section wrapper
// Handles background, padding, and text colour per theme
// ──────────────────────────────────────────────────────────

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  theme?: 'dark' | 'light' | 'gold-tint';
  /** Use full-width (no max-width constrained container) */
  fullWidth?: boolean;
  /** Reduced vertical padding */
  compact?: boolean;
}

const themeStyles = {
  dark: 'bg-[#1A2E1A] text-[#F9F9F6]',
  light: 'bg-[#F9F9F6] text-[#1A2E1A]',
  'gold-tint': 'bg-[#D4AF37]/5 text-[#1A2E1A]',
};

export default function Section({
  theme = 'light',
  fullWidth = false,
  compact = false,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn(themeStyles[theme], className)} {...props}>
      <div
        className={cn(
          !fullWidth && 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
          compact ? 'py-12 sm:py-16' : 'py-16 sm:py-24'
        )}
      >
        {children}
      </div>
    </section>
  );
}
