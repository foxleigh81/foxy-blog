'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import crypto from 'crypto';
import { useRouter, usePathname } from 'next/navigation';
import { validateUsername } from '@/utils/validation';

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
  signUp: (email: string, password: string, username: string) => Promise<void>;
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
  const router = useRouter();
  const pathname = usePathname();

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // This useEffect detects path changes and refreshes the profile
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [pathname, user]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // First get session to maintain cookies
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession) {
          setSession(initialSession);

          // Now use getUser to get authenticated user data
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();

          if (authUser) {
            setUser(authUser);
            await fetchProfile(authUser.id);
          }
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

      if (currentSession) {
        setSession(currentSession);

        // Use getUser to get authenticated user data
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser(authUser);
          try {
            // Check if profile exists
            const { data: existingProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();

            console.log('Profile check result:', { existingProfile, profileError });

            if (profileError && profileError.code === 'PGRST116') {
              console.log('Creating new profile for user:', authUser.id);

              // Get username from metadata
              const username =
                authUser.user_metadata?.username ||
                authUser.user_metadata?.display_name ||
                'Anonymous';

              console.log('Using username from metadata:', username);

              // Check for Gravatar
              let avatarUrl = null;
              try {
                if (authUser.email) {
                  avatarUrl = await checkGravatar(authUser.email);
                  if (!avatarUrl) {
                    avatarUrl = `https://www.gravatar.com/avatar/${crypto
                      .createHash('md5')
                      .update(authUser.email.toLowerCase().trim())
                      .digest('hex')}`;
                  }
                }
              } catch (error) {
                console.error('Error checking gravatar:', error);
              }

              // Profile doesn't exist, create it
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: authUser.id,
                  username: username,
                  is_moderator: false,
                  avatar_url: avatarUrl,
                })
                .select()
                .single();

              console.log('Profile creation result:', { newProfile, insertError });

              if (insertError) {
                console.error('Error creating profile:', insertError);
                console.error('Error details:', JSON.stringify(insertError, null, 2));
              } else {
                // Set the profile directly to avoid extra fetch
                setProfile(newProfile);
                return; // Skip fetchProfile since we already have the profile
              }
            }

            // Fetch the profile with await to make sure it completes
            const profileData = await fetchProfile(authUser.id);
            if (profileData) {
              setProfile(profileData);
            }
          } catch (error) {
            console.error('Error in auth state change handler:', error);
          }
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
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        // If the error is because the profile doesn't exist, don't log it as an error
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user:', userId);
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
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

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Starting signup process for:', { email, username });

      // Validate username
      const { isValid, error } = validateUsername(username);
      if (!isValid) {
        console.log('Username validation failed:', error);
        throw new Error(error || 'Invalid username');
      }

      console.log('Username validation successful, proceeding with signup');

      // Sign up the user with auth metadata containing the username
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Store username in user metadata
          },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Error signing up:', signUpError);
        throw signUpError;
      }

      // Use the user object from the sign-up response
      const user = data.user;
      if (!user) {
        console.error('No user returned from sign up');
        throw new Error('No user returned from sign up');
      }

      console.log('User created:', user);

      // The profile will be created by the onAuthStateChange handler
      // which is triggered after signup and already has the necessary permissions

      router.refresh();
    } catch (error) {
      console.error('Error in signup process:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        console.error('Non-error object thrown:', JSON.stringify(error, null, 2));
        throw new Error('An unexpected error occurred during signup');
      }
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
