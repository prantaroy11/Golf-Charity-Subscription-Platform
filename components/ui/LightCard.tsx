import React from 'react';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// LightCard — Content card for light sections
// bg-white rounded-[2rem] shadow-sm border-gray-100
// ──────────────────────────────────────────────────────────

interface LightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function LightCard({
  children,
  hover = true,
  className,
  ...props
}: LightCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-[2rem] shadow-sm border border-gray-100',
        hover && 'hover:shadow-md transition-shadow duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
