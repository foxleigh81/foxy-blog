'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase-client';
import type { Database } from '@/types/supabase';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_moderator: boolean;
  is_trusted: boolean;
  is_banned: boolean;
  suspended_until: string | null;
  created_at: string;
}

type AuthStatus = 'initializing' | 'unauthenticated' | 'authenticating' | 'authenticated' | 'error';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  error?: string;
}

type AuthAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'SESSION_FOUND'; user: User }
  | { type: 'SESSION_EMPTY' }
  | { type: 'PROFILE_LOADED'; profile: Profile | null }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'SIGN_OUT' }
  | { type: 'PROFILE_UPDATED'; profile: Profile };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE_START':
      return {
        ...state,
        status: 'initializing',
        error: undefined,
      };

    case 'SESSION_FOUND':
      return {
        ...state,
        status: 'authenticating',
        user: action.user,
        error: undefined,
      };

    case 'SESSION_EMPTY':
      return {
        status: 'unauthenticated',
        user: null,
        profile: null,
        error: undefined,
      };

    case 'PROFILE_LOADED':
      return {
        ...state,
        status: 'authenticated',
        profile: action.profile,
        error: action.profile ? undefined : 'Profile unavailable, but authentication successful',
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      };

    case 'SIGN_OUT':
      return {
        status: 'unauthenticated',
        user: null,
        profile: null,
        error: undefined,
      };

    case 'PROFILE_UPDATED':
      return {
        ...state,
        profile: action.profile,
      };

    default:
      return state;
  }
};

const initialState: AuthState = {
  status: 'initializing',
  user: null,
  profile: null,
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isInitialized = useRef(false);
  const isProcessingSession = useRef(false);
  const currentStateRef = useRef(state);

  // Keep the ref updated with current state
  currentStateRef.current = state;

  const supabase = createClient();

  // Fetch user profile from database
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        // Add timeout wrapper to prevent hanging queries
        const profilePromise = supabase.from('profiles').select('*').eq('id', userId).single();

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000); // 10 second timeout
        });

        const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

        if (error) {
          return null;
        }

        return data as Profile;
      } catch {
        return null;
      }
    },
    [supabase]
  );

  // Create or update profile
  const createProfile = useCallback(
    async (userId: string, email: string, userData?: User): Promise<Profile | null> => {
      try {
        // Use username from user metadata if available, otherwise fall back to email prefix
        const username = userData?.user_metadata?.username || email.split('@')[0];

        const profileData = {
          id: userId,
          username,
          is_moderator: false,
          is_trusted: false,
        };

        // Use upsert to handle race conditions and prevent 409 conflicts
        const createPromise = supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'id',
            ignoreDuplicates: false,
          })
          .select()
          .single();

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Profile creation timeout')), 10000); // 10 second timeout
        });

        const { data, error } = await Promise.race([createPromise, timeoutPromise]);

        if (error) {
          // If it's still a conflict error, try to fetch the existing profile
          if (error.code === '23505' || error.message?.includes('duplicate key')) {
            return await fetchProfile(userId);
          }
          return null;
        }

        return data as Profile;
      } catch (error) {
        // Fallback: try to fetch existing profile in case of any creation errors
        try {
          return await fetchProfile(userId);
        } catch (fetchError) {
          console.error('Profile creation and fallback fetch both failed:', { error, fetchError });
          return null;
        }
      }
    },
    [supabase, fetchProfile]
  );

  // Handle user session and profile loading with concurrency protection
  const handleUserSession = useCallback(
    async (user: User | null, source: 'initialization' | 'auth_change' = 'auth_change') => {
      // Prevent concurrent session processing
      if (isProcessingSession.current) {
        return;
      }

      // During initialization, ignore auth change events
      if (source === 'auth_change' && !isInitialized.current) {
        return;
      }

      isProcessingSession.current = true;

      try {
        if (!user) {
          dispatch({ type: 'SESSION_EMPTY' });
          return;
        }

        // Check if this is the same user we already have authenticated
        // If so, skip the re-authentication flow to prevent loading states
        if (
          source === 'auth_change' &&
          currentStateRef.current.status === 'authenticated' &&
          currentStateRef.current.user?.id === user.id &&
          currentStateRef.current.profile
        ) {
          // Same user, already authenticated with profile - no need to re-process
          return;
        }

        dispatch({ type: 'SESSION_FOUND', user });

        try {
          let userProfile = await fetchProfile(user.id);

          // Create profile if it doesn't exist with retry logic
          if (!userProfile) {
            // Try creating the profile, with a single retry on failure
            userProfile = await createProfile(user.id, user.email || '', user);

            // If creation failed, wait a bit and try fetching again
            // (in case another process created the profile)
            if (!userProfile) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              userProfile = await fetchProfile(user.id);
            }
          }

          // Dispatch authenticated state with whatever profile we have
          dispatch({ type: 'PROFILE_LOADED', profile: userProfile });

          // Log warning if profile is still null after all attempts
          if (!userProfile) {
            console.warn('Profile creation/loading failed, but user is authenticated');
          }
        } catch (error) {
          console.error('Profile loading error:', error);
          // Don't block authentication if profile loading fails
          // Dispatch with null profile to allow user to continue
          dispatch({ type: 'PROFILE_LOADED', profile: null });
        }
      } finally {
        isProcessingSession.current = false;
      }
    },
    [fetchProfile, createProfile]
  );

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      dispatch({ type: 'INITIALIZE_START' });

      try {
        // Add timeout to prevent hanging during initialization
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Session initialization timeout')), 15000);
        });

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise]);

        if (isMounted) {
          await handleUserSession(session?.user ?? null, 'initialization');
          isInitialized.current = true;
        }
      } catch (error) {
        if (isMounted) {
          console.error('Auth initialization error:', error);
          dispatch({ type: 'AUTH_ERROR', error: 'Failed to initialize authentication' });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // Filter out events that don't require re-authentication
      // TOKEN_REFRESHED events often fire when switching tabs but don't need processing
      if (
        event === 'TOKEN_REFRESHED' &&
        currentStateRef.current.status === 'authenticated' &&
        currentStateRef.current.user?.id === session?.user?.id
      ) {
        return;
      }

      try {
        await handleUserSession(session?.user ?? null, 'auth_change');
      } catch (error) {
        console.error('Auth change error:', error);
        dispatch({ type: 'AUTH_ERROR', error: 'Failed to handle auth change' });
      }
    });

    return () => {
      isMounted = false;
      isInitialized.current = false;
      isProcessingSession.current = false;
      subscription.unsubscribe();
    };
  }, [handleUserSession, supabase.auth]);

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    // Store the current path for redirect after email confirmation
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_return_to', window.location.pathname);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    dispatch({ type: 'SIGN_OUT' });
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates as Database['public']['Tables']['profiles']['Update'])
      .eq('id', state.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    dispatch({ type: 'PROFILE_UPDATED', profile: data as Profile });

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  };

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;

    const userProfile = await fetchProfile(state.user.id);
    dispatch({ type: 'PROFILE_LOADED', profile: userProfile });
  }, [state.user, fetchProfile]);

  const value = {
    user: state.user,
    profile: state.profile,
    loading: state.status === 'initializing' || state.status === 'authenticating',
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
