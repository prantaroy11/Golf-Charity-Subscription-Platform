'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subscription } from '@/types';
import { User as AuthUser } from '@supabase/supabase-js';

/**
 * useSubscription — accepts optional user and loading state
 * to avoid calling useUser() internally (which created duplicate
 * Supabase clients and redundant auth calls).
 *
 * Usage:
 *   const { user, loading: userLoading } = useUser();
 *   const { subscription, isActive, loading: subLoading } = useSubscription(user, userLoading);
 */
export function useSubscription(user?: AuthUser | null, userLoading?: boolean) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const isUserLoading = userLoading ?? false;

  useEffect(() => {
    mountedRef.current = true;
    let loadingDone = false;

    async function fetchSubscription() {
      if (!user) {
        if (mountedRef.current) {
          setSubscription(null);
          setLoading(false);
          loadingDone = true;
        }
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (mountedRef.current) {
          if (!error && data) {
            setSubscription(data as Subscription);
          } else {
            setSubscription(null);
          }
          setLoading(false);
          loadingDone = true;
        }
      } catch {
        if (mountedRef.current) {
          setSubscription(null);
          setLoading(false);
          loadingDone = true;
        }
      }
    }

    if (!isUserLoading) {
      fetchSubscription();
    }

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mountedRef.current && !loadingDone) {
        console.warn(
          'useSubscription: Safety timeout reached – forcing loading state to false'
        );
        setLoading(false);
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
    };
  }, [user, isUserLoading]);

  return {
    subscription,
    isActive: subscription?.status === 'active',
    loading: loading || isUserLoading,
  };
}
