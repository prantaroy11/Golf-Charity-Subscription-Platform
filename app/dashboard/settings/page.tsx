'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Mail,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Shield,
} from 'lucide-react';
import LightCard from '@/components/ui/LightCard';
import StatusBadge from '@/components/ui/StatusBadge';
import GoldButton from '@/components/ui/GoldButton';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Settings Page — Step 10.7
// Update full name, change email, change password,
// subscription management with cancellation modal.
// ──────────────────────────────────────────────────────────
function FeedbackAlert({
  section,
  feedback,
}: {
  section: string;
  feedback: {
    section: string;
    type: 'success' | 'error';
    message: string;
  } | null;
}) {
  if (feedback?.section !== section) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex items-center gap-2 text-sm font-medium mt-3',
        feedback.type === 'success' ? 'text-green-600' : 'text-red-500'
      )}
    >
      {feedback.type === 'success' ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {feedback.message}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { subscription } = useSubscription(user, userLoading);

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [feedback, setFeedback] = useState<{
    section: string;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sync profile values when loaded
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setEmail(profile.email ?? '');
    }
  }, [profile]);

  const showFeedback = useCallback(
    (section: string, type: 'success' | 'error', message: string) => {
      setFeedback({ section, type, message });
      setTimeout(() => setFeedback(null), 4000);
    },
    []
  );

  // Update full name
  const handleUpdateName = async () => {
    if (!user || !fullName.trim()) return;
    setSavingName(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      showFeedback('name', 'error', 'Failed to update name.');
    } else {
      showFeedback('name', 'success', 'Name updated successfully.');
    }

    setSavingName(false);
  };

  // Change email
  const handleUpdateEmail = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setSavingEmail(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: email.trim() });

    if (error) {
      showFeedback(
        'email',
        'error',
        error.message || 'Failed to update email.'
      );
    } else {
      showFeedback(
        'email',
        'success',
        'Confirmation email sent. Check your inbox.'
      );
    }

    setSavingEmail(false);
  };

  // Change password
  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      showFeedback(
        'password',
        'error',
        'Password must be at least 8 characters.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback('password', 'error', 'Passwords do not match.');
      return;
    }

    setSavingPassword(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      showFeedback(
        'password',
        'error',
        error.message || 'Failed to update password.'
      );
    } else {
      showFeedback('password', 'success', 'Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    }

    setSavingPassword(false);
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!user) return;
    setCancelling(true);

    try {
      const res = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowCancelDialog(false);
        showFeedback(
          'subscription',
          'success',
          'Subscription cancelled. Access continues until period end.'
        );
      } else {
        showFeedback(
          'subscription',
          'error',
          data.error || 'Failed to cancel subscription.'
        );
      }
    } catch {
      showFeedback(
        'subscription',
        'error',
        'Something went wrong. Please try again.'
      );
    }

    setCancelling(false);
  };

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A2E1A]">
              Settings
            </h1>
            <p className="text-sm text-gray-500">
              Manage your account and subscription.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Update Name ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <LightCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-medium text-[#1A2E1A]">Full Name</h3>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="flex-1 h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-1 transition-all"
            />
            <GoldButton
              variant="dark"
              size="sm"
              loading={savingName}
              onClick={handleUpdateName}
            >
              Save
            </GoldButton>
          </div>
          <FeedbackAlert section="name" feedback={feedback} />
        </LightCard>
      </motion.div>

      {/* ── Change Email ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <LightCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-medium text-[#1A2E1A]">
              Email Address
            </h3>
          </div>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-1 transition-all"
            />
            <GoldButton
              variant="dark"
              size="sm"
              loading={savingEmail}
              onClick={handleUpdateEmail}
            >
              Update
            </GoldButton>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            A confirmation email will be sent to your new address.
          </p>
          <FeedbackAlert section="email" feedback={feedback} />
        </LightCard>
      </motion.div>

      {/* ── Change Password ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LightCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-medium text-[#1A2E1A]">
              Change Password
            </h3>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-1 transition-all"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-1 transition-all"
            />
            <GoldButton
              variant="dark"
              size="sm"
              loading={savingPassword}
              onClick={handleUpdatePassword}
              disabled={!newPassword || !confirmPassword}
            >
              Update Password
            </GoldButton>
          </div>
          <FeedbackAlert section="password" feedback={feedback} />
        </LightCard>
      </motion.div>

      {/* ── Subscription Management ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <LightCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-medium text-[#1A2E1A]">Subscription</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={
                      (subscription?.status as
                        | 'active'
                        | 'cancelled'
                        | 'lapsed'
                        | 'pending') ?? 'pending'
                    }
                  />
                  <span className="text-sm text-gray-500 capitalize">
                    {subscription?.plan ?? '—'} plan
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {subscription?.status === 'cancelled'
                    ? `Access until ${renewalDate}`
                    : `Renews ${renewalDate}`}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                256-bit SSL encrypted
              </div>
            </div>

            {subscription?.status === 'active' && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="text-sm text-red-500 hover:text-red-600 hover:underline transition-colors"
              >
                Cancel Subscription
              </button>
            )}

            {subscription?.status === 'cancelled' && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-sm text-amber-700">
                  Your subscription is cancelled. Access continues until{' '}
                  {renewalDate}.
                </span>
              </div>
            )}
          </div>

          <FeedbackAlert section="subscription" feedback={feedback} />
        </LightCard>
      </motion.div>

      {/* ── Cancellation Dialog ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2">
              Your access to scores, draws, and charity features will continue
              until <strong>{renewalDate}</strong>. After that, you&apos;ll lose
              access unless you resubscribe.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
            <DialogClose
              render={
                <GoldButton variant="dark" size="md" className="flex-1">
                  Keep My Subscription
                </GoldButton>
              }
            />
            <GoldButton
              variant="ghost"
              size="md"
              className="flex-1 !border-red-200 !text-red-500 hover:!bg-red-50"
              loading={cancelling}
              onClick={handleCancelSubscription}
            >
              Cancel Anyway
            </GoldButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
