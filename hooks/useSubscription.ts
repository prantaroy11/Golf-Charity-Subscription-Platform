'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import { Subscription } from '@/types';

export function useSubscription() {
  const { user, loading: userLoading } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mounted = true;

    const supabase = createClient();

    async function fetchSubscription() {
      if (!user) {
        if (mounted) {
          setSubscription(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (mounted) {
        if (!error && data) {
          setSubscription(data as Subscription);
        } else {
          setSubscription(null);
        }
        setLoading(false);
      }
    }

    if (!userLoading) {
      fetchSubscription();
    }
  }, [user, userLoading]);

  return {
    subscription,
    isActive: subscription?.status === 'active',
    loading: loading || userLoading,
  };
}
