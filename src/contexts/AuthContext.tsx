'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
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
  console.log('[AUTH DEBUG] State transition:', {
    from: state.status,
    action: action.type,
    hasUser: !!state.user,
    hasProfile: !!state.profile,
  });

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

  const supabase = createClient();

  // Fetch user profile from database
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }

        return data as Profile;
      } catch (error) {
        console.error('Exception in fetchProfile:', error);
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

        const { data, error } = await supabase
          .from('profiles')
          .upsert(profileData)
          .select()
          .single();

        if (error) {
          console.error('Error creating profile:', error);
          return null;
        }

        return data as Profile;
      } catch (error) {
        console.error('Error creating profile:', error);
        return null;
      }
    },
    [supabase]
  );

  // Handle user session and profile loading
  const handleUserSession = useCallback(
    async (user: User | null) => {
      console.log('[AUTH DEBUG] Handling user session:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
      });

      if (!user) {
        console.log('[AUTH DEBUG] No user, setting to unauthenticated');
        dispatch({ type: 'SESSION_EMPTY' });
        return;
      }

      console.log('[AUTH DEBUG] User found, setting to authenticating');
      dispatch({ type: 'SESSION_FOUND', user });

      try {
        console.log('[AUTH DEBUG] Fetching profile for user:', user.id);
        let userProfile = await fetchProfile(user.id);

        console.log('[AUTH DEBUG] Profile fetch result:', {
          hasProfile: !!userProfile,
          profileId: userProfile?.id,
          username: userProfile?.username,
        });

        // Create profile if it doesn't exist
        if (!userProfile) {
          console.log('[AUTH DEBUG] No profile found, creating new profile');
          userProfile = await createProfile(user.id, user.email || '', user);
          console.log('[AUTH DEBUG] Profile creation result:', {
            hasProfile: !!userProfile,
            profileId: userProfile?.id,
            username: userProfile?.username,
          });
        }

        console.log('[AUTH DEBUG] Setting profile loaded');
        dispatch({ type: 'PROFILE_LOADED', profile: userProfile });
      } catch (error) {
        console.error('[AUTH DEBUG] Error handling user session:', error);
        dispatch({ type: 'AUTH_ERROR', error: 'Failed to load user profile' });
      }
    },
    [fetchProfile, createProfile]
  );

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      console.log('[AUTH DEBUG] Starting initialization');
      dispatch({ type: 'INITIALIZE_START' });

      try {
        console.log('[AUTH DEBUG] Getting session...');
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('[AUTH DEBUG] Session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          expiresAt: session?.expires_at,
          isMounted,
        });

        if (isMounted) {
          await handleUserSession(session?.user ?? null);
        }
      } catch (error) {
        console.error('[AUTH DEBUG] Error initializing auth:', error);
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
      console.log('[AUTH DEBUG] Auth state change:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        isMounted,
      });

      if (!isMounted) return;

      try {
        await handleUserSession(session?.user ?? null);
      } catch (error) {
        console.error('[AUTH DEBUG] Error handling user session:', error);
        dispatch({ type: 'AUTH_ERROR', error: 'Failed to handle user session' });
      }
    });

    return () => {
      isMounted = false;
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
