'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import crypto from 'crypto';

type Profile = Database['public']['Tables']['profiles']['Row'];

const getGravatarUrl = (email: string, size: number = 80): string => {
  const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`;
};

const checkGravatar = async (email: string): Promise<string | null> => {
  const url = getGravatarUrl(email);
  try {
    const response = await fetch(url);
    if (response.ok) {
      return url;
    }
  } catch (error) {
    console.error('Error checking Gravatar:', error);
  }
  return null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession?.user) {
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      setSession(currentSession);

      if (currentSession?.user) {
        setUser(currentSession.user);
        try {
          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          console.log('Profile check result:', { existingProfile, profileError });

          if (profileError && profileError.code === 'PGRST116') {
            console.log('Creating new profile for user:', currentSession.user.id);
            // Check for Gravatar
            const gravatarUrl = currentSession.user.email
              ? await checkGravatar(currentSession.user.email)
              : null;

            // Profile doesn't exist, create it
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: currentSession.user.id,
                display_name: currentSession.user.user_metadata.display_name || 'Anonymous',
                is_moderator: false,
                avatar_url: gravatarUrl,
              })
              .select()
              .single();

            console.log('Profile creation result:', { newProfile, insertError });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              return;
            }
          }

          await fetchProfile(currentSession.user.id);
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        // If the error is because the profile doesn't exist, don't log it as an error
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user:', userId);
          return;
        }
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase.from('profiles').update(profileData).eq('id', user.id);

      if (error) throw error;

      // Refetch the profile to get the updated data
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
