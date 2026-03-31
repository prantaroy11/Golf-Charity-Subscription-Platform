'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import GoldButton from '@/components/ui/GoldButton';
import LightCard from '@/components/ui/LightCard';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setServerError('Invalid email or password');
      } else {
        const redirect = searchParams.get('redirect') || '/dashboard';
        // Refresh first so middleware picks up the new session cookies,
        // then navigate to the target page
        router.refresh();
        router.push(redirect);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LightCard className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-forest font-bold mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-500">
          Log in to manage your subscription and view draws.
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

        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-gold-main hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-red-500 pr-10' : ''}
            />
            {errors.password && (
              <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-2.5" />
            )}
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
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
          Log In
        </GoldButton>

        <div className="text-center text-sm text-gray-500 pt-4">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-forest font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </form>
    </LightCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
