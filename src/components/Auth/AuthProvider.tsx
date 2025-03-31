'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { usePathname } from 'next/navigation';
import crypto from 'crypto';

type Profile = Database['public']['Tables']['profiles']['Row'];

const getGravatarUrl = (email: string, size = 200): string => {
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

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  refetchProfile: () => Promise<Profile | null>;
}

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { user: data.user, error: error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { user: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { user: data.user, error: error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { user: null, error: error as Error };
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

      console.log('AuthProvider: Starting profile update with data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('AuthProvider: Error updating profile:', error);
        throw error;
      }

      console.log('AuthProvider: Profile updated successfully:', data);

      // Refetch the profile to get the updated data
      await refetchProfile();
      console.log('AuthProvider: Profile refetched after update');

      // Dispatch a custom event to notify components of profile update
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('profileUpdated', {
          detail: { userId: user.id },
        });
        window.dispatchEvent(event);
        console.log('AuthProvider: profileUpdated event dispatched');
      }
    } catch (error) {
      console.error('AuthProvider: Error in updateProfile function:', error);
      throw error;
    }
  };

  const refetchProfile = useCallback(async () => {
    if (!user) return null;

    try {
      console.log('Refetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Update the profile state with the latest data
      if (data) {
        setProfile(data);
        console.log('Profile updated from refetch:', data);
      }

      return data;
    } catch (error) {
      console.error('Error in refetchProfile:', error);
      return null;
    }
  }, [user]);

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
