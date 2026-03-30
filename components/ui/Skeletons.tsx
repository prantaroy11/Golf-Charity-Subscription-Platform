import React from 'react';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Skeleton Loaders — Animated shimmer components
// CardSkeleton, TableRowSkeleton, ScoreSkeleton
// ──────────────────────────────────────────────────────────

/** Base shimmer block with animated pulse */
function Shimmer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        className
      )}
      {...props}
    />
  );
}

// ── CardSkeleton ──────────────────────────────────────────
// Matches LightCard shape: rounded-[2rem], white bg, shadow-sm
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 space-y-4',
        className
      )}
    >
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-3/5 rounded" />
          <Shimmer className="h-3 w-2/5 rounded" />
        </div>
      </div>
      {/* Body lines */}
      <div className="space-y-3 pt-2">
        <Shimmer className="h-3 w-full rounded" />
        <Shimmer className="h-3 w-4/5 rounded" />
        <Shimmer className="h-3 w-3/4 rounded" />
      </div>
      {/* Action area */}
      <div className="flex justify-end pt-2">
        <Shimmer className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

// ── TableRowSkeleton ──────────────────────────────────────
// For admin data tables
export function TableRowSkeleton({
  columns = 5,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <tr className={cn('border-b border-gray-50', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Shimmer
            className={cn(
              'h-4 rounded',
              i === 0 ? 'w-32' : i === columns - 1 ? 'w-16' : 'w-24'
            )}
          />
        </td>
      ))}
    </tr>
  );
}

// ── ScoreSkeleton ─────────────────────────────────────────
// For score entry slots
export function ScoreSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100',
        className
      )}
    >
      {/* Score number */}
      <Shimmer className="w-14 h-14 rounded-xl" />
      {/* Details */}
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-20 rounded" />
        <Shimmer className="h-3 w-28 rounded" />
      </div>
      {/* Action */}
      <Shimmer className="w-8 h-8 rounded-lg" />
    </div>
  );
}

export { Shimmer };
