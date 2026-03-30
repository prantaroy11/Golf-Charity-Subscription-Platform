import React from 'react';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// StatusBadge — Coloured status indicator pills
// Used for subscription status, payment status, winner state
// ──────────────────────────────────────────────────────────

type StatusType =
  | 'active'
  | 'cancelled'
  | 'lapsed'
  | 'pending'
  | 'paid'
  | 'winner'
  | 'rejected'
  | 'verified';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  label?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: 'bg-green-100 text-green-700',
  cancelled: 'bg-amber-100 text-amber-700',
  lapsed: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-50 text-amber-600',
  paid: 'bg-green-100 text-green-700',
  winner: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30',
  rejected: 'bg-red-50 text-red-600',
  verified: 'bg-blue-50 text-blue-600',
};

const defaultLabels: Record<StatusType, string> = {
  active: 'Active',
  cancelled: 'Cancelled',
  lapsed: 'Lapsed',
  pending: 'Pending',
  paid: 'Paid',
  winner: 'Winner',
  rejected: 'Rejected',
  verified: 'Verified',
};

export default function StatusBadge({
  status,
  label,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        statusStyles[status],
        className
      )}
      {...props}
    >
      {label ?? defaultLabels[status]}
    </span>
  );
}
