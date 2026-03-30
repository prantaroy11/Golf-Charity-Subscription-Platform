'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import GoldButton from '@/components/ui/GoldButton';

// ──────────────────────────────────────────────────────────
// CancellationDialog — Step 7.8
// Confirmation modal for subscription cancellation
// Uses base-ui Dialog (no asChild — renders directly)
// ──────────────────────────────────────────────────────────

interface CancellationDialogProps {
  periodEndDate?: string;
  onConfirm: () => Promise<void>;
  trigger?: React.ReactElement;
}

export default function CancellationDialog({
  periodEndDate,
  onConfirm,
  trigger,
}: CancellationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formattedDate = periodEndDate
    ? new Date(periodEndDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'the end of your billing period';

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <button className="text-sm text-red-500 hover:text-red-700 underline underline-offset-4 transition-colors">
              Cancel Subscription
            </button>
          )
        }
      />
      <DialogContent
        showCloseButton={false}
        className="bg-white rounded-[2rem] border-0 shadow-2xl p-8 max-w-md mx-auto ring-0"
      >
        <DialogHeader className="text-center space-y-4 items-center">
          <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <DialogTitle className="text-xl font-serif font-medium text-[#1A2E1A]">
            Cancel Your Subscription?
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm leading-relaxed">
            Your access will continue until{' '}
            <strong className="text-[#1A2E1A]">{formattedDate}</strong>. After
            that, you&apos;ll lose access to draws, score tracking, and your
            dashboard.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col gap-3 mt-6 sm:flex-col border-0 bg-transparent mx-0 mb-0 p-0 rounded-none">
          {/* Keep Subscription (Primary) */}
          <GoldButton
            variant="dark"
            size="lg"
            className="w-full"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Keep My Subscription
          </GoldButton>

          {/* Cancel Anyway (Destructive Ghost) */}
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full py-3 px-6 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Cancelling…' : 'Cancel Anyway'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
