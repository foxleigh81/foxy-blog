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
      if (action.profile) {
        return {
          ...state,
          status: 'authenticated',
          profile: action.profile,
          error: undefined,
        };
      } else {
        return {
          ...state,
          status: 'error',
          profile: null,
          error: 'Failed to load user profile',
        };
      }

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

        // Add timeout wrapper to prevent hanging queries
        const createPromise = supabase.from('profiles').insert(profileData).select().single();

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Profile creation timeout')), 10000); // 10 second timeout
        });

        const { data, error } = await Promise.race([createPromise, timeoutPromise]);

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

        dispatch({ type: 'SESSION_FOUND', user });

        try {
          let userProfile = await fetchProfile(user.id);

          // Create profile if it doesn't exist
          if (!userProfile) {
            userProfile = await createProfile(user.id, user.email || '', user);
          }

          dispatch({ type: 'PROFILE_LOADED', profile: userProfile });
        } catch {
          dispatch({ type: 'AUTH_ERROR', error: 'Failed to load user profile' });
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
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          await handleUserSession(session?.user ?? null, 'initialization');
          isInitialized.current = true;
        }
      } catch {
        if (isMounted) {
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

      try {
        await handleUserSession(session?.user ?? null, 'auth_change');
      } catch {
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
