'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  User as AuthUser,
  AuthChangeEvent,
  Session,
} from '@supabase/supabase-js';
import { User as Profile } from '@/types';

export function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async (authUser: AuthUser) => {
    try {
      const supabase = createClient();
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profileError && profileData && mountedRef.current) {
        setProfile(profileData as Profile);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const supabase = createClient();

    // Use ONLY onAuthStateChange to handle all auth state.
    // This avoids the lock contention caused by calling getSession()/getUser()
    // concurrently with onAuthStateChange, which both acquire the
    // "sb-<ref>-auth-token" Web Lock and cause the
    // "Lock was not released within 5000ms" error.
    //
    // onAuthStateChange fires INITIAL_SESSION on mount (which contains the
    // current session if any), so we don't need a separate getSession() call.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mountedRef.current) return;

        if (session?.user) {
          setUser(session.user);
          // Fetch profile in background — don't block the auth state
          fetchProfile(session.user).finally(() => {
            if (mountedRef.current) setLoading(false);
          });
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Safety timeout — if onAuthStateChange never fires (e.g., broken state)
    const timeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn(
          'useUser: Safety timeout reached – forcing loading state to false'
        );
        setLoading(false);
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    isAdmin: profile?.role === 'admin',
  };
}
