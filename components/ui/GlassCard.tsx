import React from 'react';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// GlassCard — Glassmorphism card for dark sections
// bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl
// ──────────────────────────────────────────────────────────

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function GlassCard({
  children,
  hover = true,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl',
        hover && 'hover:bg-white/10 transition-colors duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
