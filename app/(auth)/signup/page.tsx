'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import GoldButton from '@/components/ui/GoldButton';
import LightCard from '@/components/ui/LightCard';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      // Use server-side API to create user with auto-confirmation
      // This bypasses Supabase's email rate limits on the free tier
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Signup failed. Please try again.');
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An error occurred during signup');
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
          Account Created!
        </h2>
        <p className="text-gray-600">
          Your account has been created and confirmed. You can now log in and
          start your subscription.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 text-gold-main hover:underline"
        >
          Go to Login →
        </Link>
      </LightCard>
    );
  }

  return (
    <LightCard className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-forest font-bold mb-2">
          Create an Account
        </h1>
        <p className="text-gray-500">
          Join the movement and start winning for good.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2 relative">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register('fullName')}
              className={
                errors.fullName
                  ? 'border-red-500 pr-10'
                  : touchedFields.fullName
                    ? 'border-green-500 pr-10'
                    : ''
              }
            />
            {errors.fullName && (
              <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-2.5" />
            )}
            {!errors.fullName && touchedFields.fullName && (
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-2.5" />
            )}
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className={
                errors.email
                  ? 'border-red-500 pr-10'
                  : touchedFields.email
                    ? 'border-green-500 pr-10'
                    : ''
              }
            />
            {errors.email && (
              <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-2.5" />
            )}
            {!errors.email && touchedFields.email && (
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-2.5" />
            )}
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={
                errors.password
                  ? 'border-red-500 pr-10'
                  : touchedFields.password
                    ? 'border-green-500 pr-10'
                    : ''
              }
            />
            {errors.password && (
              <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-2.5" />
            )}
            {!errors.password && touchedFields.password && (
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-2.5" />
            )}
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={
                errors.confirmPassword
                  ? 'border-red-500 pr-10'
                  : touchedFields.confirmPassword
                    ? 'border-green-500 pr-10'
                    : ''
              }
            />
            {errors.confirmPassword && (
              <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-2.5" />
            )}
            {!errors.confirmPassword && touchedFields.confirmPassword && (
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-2.5" />
            )}
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {serverError}
          </div>
        )}

        <GoldButton
          type="submit"
          variant="primary"
          loading={isLoading}
          className="w-full"
        >
          Sign Up
        </GoldButton>

        <div className="text-center text-sm text-gray-500 pt-4">
          Already have an account?{' '}
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
