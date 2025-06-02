'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          let userProfile = await fetchProfile(session.user.id);

          // Create profile if it doesn't exist
          if (!userProfile) {
            userProfile = await createProfile(
              session.user.id,
              session.user.email || '',
              session.user
            );
          }

          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        let userProfile = await fetchProfile(session.user.id);

        // Create profile if it doesn't exist (for new sign-ups)
        if (!userProfile) {
          userProfile = await createProfile(
            session.user.id,
            session.user.email || '',
            session.user
          );
        }

        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [createProfile, fetchProfile, supabase.auth]);

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
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates as Database['public']['Tables']['profiles']['Update'])
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setProfile(data as Profile);

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;

    const userProfile = await fetchProfile(user.id);
    setProfile(userProfile);
  }, [user, fetchProfile]);

  const value = {
    user,
    profile,
    loading,
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
