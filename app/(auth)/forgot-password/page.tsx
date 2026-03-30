'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import GoldButton from '@/components/ui/GoldButton';
import LightCard from '@/components/ui/LightCard';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard/settings`,
      });

      if (error) {
        setServerError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <LightCard className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-serif text-forest font-bold">
          Reset link sent
        </h2>
        <p className="text-gray-600">
          If an account exists for that email, we have sent a password reset
          link. Please check your inbox.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 text-gold-main hover:underline"
        >
          Return to Login
        </Link>
      </LightCard>
    );
  }

  return (
    <LightCard className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-forest font-bold mb-2">
          Reset Password
        </h1>
        <p className="text-gray-500">
          Enter your email to receive a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2 relative">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className={errors.email ? 'border-red-500 pr-10' : ''}
            />
            {errors.email && (
              <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-2.5" />
            )}
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {serverError}
          </div>
        )}

        <GoldButton
          type="submit"
          variant="primary"
          loading={isLoading}
          className="w-full"
        >
          Send Reset Link
        </GoldButton>

        <div className="text-center text-sm text-gray-500 pt-4">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-forest font-medium hover:underline"
          >
            Log in
          </Link>
        </div>
      </form>
    </LightCard>
  );
}
