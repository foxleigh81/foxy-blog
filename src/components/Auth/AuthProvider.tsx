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
import * as Sentry from '@sentry/nextjs';

type Profile = Database['public']['Tables']['profiles']['Row'];

// --- Restored Gravatar functions ---

const generateMD5Hash = async (str: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const getGravatarUrl = async (email: string, size = 200): Promise<string> => {
  const hash = await generateMD5Hash(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`;
};

const checkGravatar = async (email: string): Promise<string | null> => {
  const url = await getGravatarUrl(email);
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
// --- End of Gravatar functions ---

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signInWithFacebook: () => Promise<{ error: Error | null }>;
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
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Memoized helper function to generate username from user data
  const generateUsername = useCallback((user: User): string => {
    return (
      user.user_metadata?.username ||
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Anonymous'
    );
  }, []);

  // Helper function to create a profile for a user
  const createProfileForUser = useCallback(
    async (user: User): Promise<Profile | null> => {
      console.log(`[AuthProvider] Creating profile for user: ${user.id}`, {
        email: user.email,
        hasUserMetadata: !!user.user_metadata,
        userMetadata: user.user_metadata,
      });

      try {
        const username = generateUsername(user);
        console.log(`[AuthProvider] Generated username: ${username}`);

        console.log(`[AuthProvider] Checking Gravatar for: ${user.email}`);
        const avatarUrl = await checkGravatar(user.email || '');
        console.log(`[AuthProvider] Gravatar result:`, { avatarUrl: avatarUrl || 'none' });

        console.log(`[AuthProvider] Calling create-profile API...`);
        const response = await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            username,
            avatarUrl,
          }),
        });

        console.log(`[AuthProvider] Create-profile API response:`, {
          status: response.status,
          ok: response.ok,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`[AuthProvider] Create-profile API error:`, errorData);

          const error = new Error(
            `Failed to create profile: ${errorData.error || 'Unknown error'}`
          );

          // Report profile creation failure to Sentry
          Sentry.captureException(error, {
            tags: {
              operation: 'profile_creation',
              user_id: user.id,
            },
            extra: {
              errorData,
              username,
              userEmail: user.email,
              responseStatus: response.status,
            },
          });

          console.error('Failed to create profile:', errorData);
          return null;
        }

        const { profile } = await response.json();
        console.log(`[AuthProvider] Profile created successfully:`, {
          profileId: profile?.id,
          username: profile?.username,
        });

        // Track successful profile creation in Sentry
        Sentry.addBreadcrumb({
          message: 'New user profile created successfully',
          category: 'auth',
          level: 'info',
          data: {
            userId: user.id,
            username,
            hasAvatar: !!avatarUrl,
          },
        });

        // Set user context for future Sentry events
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username,
        });

        return profile;
      } catch (error) {
        console.error(`[AuthProvider] Exception in createProfileForUser:`, error);

        // Report unexpected errors to Sentry
        Sentry.captureException(error, {
          tags: {
            operation: 'profile_creation',
            user_id: user.id,
          },
          extra: {
            userEmail: user.email,
          },
        });

        console.error('Error creating profile:', error);
        return null;
      }
    },
    [generateUsername]
  );

  const fetchProfile = useCallback(
    async (userId: string) => {
      console.log(`[AuthProvider] Fetching profile for user: ${userId}`);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.log(`[AuthProvider] Profile fetch error:`, {
            code: error.code,
            message: error.message,
            details: error.details,
          });

          if (error.code === 'PGRST116') {
            console.log(`[AuthProvider] No profile found for user ${userId}`);
            return null;
          }

          // Report profile fetch errors to Sentry
          Sentry.captureException(new Error(`Error fetching profile: ${error.message}`), {
            tags: {
              operation: 'profile_fetch',
              user_id: userId,
            },
            extra: {
              error,
            },
          });

          console.error('Error fetching profile:', error);
          return null;
        }

        console.log(`[AuthProvider] Profile found for user ${userId}:`, {
          username: data.username,
          hasAvatar: !!data.avatar_url,
        });
        setProfile(data);
        return data;
      } catch (error) {
        console.error(`[AuthProvider] Exception in fetchProfile:`, error);
        Sentry.captureException(error, {
          tags: {
            operation: 'profile_fetch',
            user_id: userId,
          },
        });

        console.error('Error in fetchProfile:', error);
        throw error;
      }
    },
    [supabase]
  );

  // Enhanced function to fetch or create profile
  const fetchOrCreateProfile = useCallback(
    async (user: User) => {
      console.log(`[AuthProvider] Starting fetchOrCreateProfile for user: ${user.id}`);
      try {
        const existingProfile = await fetchProfile(user.id);

        if (existingProfile) {
          console.log(`[AuthProvider] Existing profile found, setting Sentry context`);
          // Set user context for existing users
          Sentry.setUser({
            id: user.id,
            email: user.email,
            username: existingProfile.username || undefined,
          });
          return existingProfile;
        }

        // Profile doesn't exist, create one
        console.log('No profile found for user, creating new profile...');
        const newProfile = await createProfileForUser(user);

        if (newProfile) {
          console.log(`[AuthProvider] New profile created, updating state`);
          setProfile(newProfile);
          return newProfile;
        } else {
          console.error('Failed to create profile for user');
          return null;
        }
      } catch (error) {
        console.error(`[AuthProvider] Exception in fetchOrCreateProfile:`, error);
        Sentry.captureException(error, {
          tags: {
            operation: 'fetch_or_create_profile',
            user_id: user.id,
          },
        });

        console.error('Error in fetchOrCreateProfile:', error);
        return null;
      }
    },
    [fetchProfile, createProfileForUser]
  );

  useEffect(() => {
    if (user) {
      fetchOrCreateProfile(user);
    }
  }, [pathname, user, fetchOrCreateProfile]);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
          error: getSessionError,
        } = await supabase.auth.getSession();

        if (getSessionError) {
          console.error(
            '[AuthProvider][getInitialSession] Error getting session:',
            getSessionError
          );
        } else if (initialSession) {
          setSession(initialSession);

          const {
            data: { user: authUser },
            error: getUserError,
          } = await supabase.auth.getUser();

          if (getUserError) {
            console.error('[AuthProvider][getInitialSession] Error getting user:', getUserError);
          } else if (authUser) {
            setUser(authUser);
            await fetchOrCreateProfile(authUser);
          } else {
            // No initial session found.
          }
        } else {
          // No initial session found.
        }
      } catch (error) {
        console.error('[AuthProvider][getInitialSession] Error fetching initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      try {
        console.log(`[AuthProvider] Auth event: ${event}`, {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id,
        });

        setSession(currentSession);
        const authUser = currentSession?.user ?? null;
        setUser(authUser);

        if (!authUser) {
          setProfile(null);
          // Clear Sentry user context when logging out
          Sentry.setUser(null);
        } else {
          // Handle profile creation/fetching for all relevant auth events
          // SIGNED_IN: User signs in (existing or new user after email confirmation)
          // INITIAL_SESSION: Page load with existing session
          // TOKEN_REFRESHED: Token refresh (user is still authenticated)
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
            console.log(`[AuthProvider] Fetching/creating profile for event: ${event}`);
            await fetchOrCreateProfile(authUser);
          } else {
            console.log(`[AuthProvider] Skipping profile fetch for event: ${event}`);
          }
        }
      } catch (outerError) {
        console.error('[AuthProvider] Error in auth state change handler:', outerError);
        Sentry.captureException(outerError, {
          tags: {
            operation: 'auth_state_change',
            event,
          },
          extra: {
            hasSession: !!currentSession,
            hasUser: !!currentSession?.user,
          },
        });
        setUser(null);
        setProfile(null);
        setSession(null);
      } finally {
        // Removed flag reset
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchOrCreateProfile]);

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

  const signInWithFacebook = async () => {
    if (process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN !== 'true') {
      return { error: new Error('Facebook login is currently disabled') };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error };
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      return { error: error as Error };
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

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      await refetchProfile();

      if (typeof window !== 'undefined') {
        const event = new CustomEvent('profileUpdated', {
          detail: { userId: user.id },
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error in updateProfile function:', error);
      throw error;
    }
  };

  const refetchProfile = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refetching profile:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error in refetchProfile:', error);
      return null;
    }
  }, [supabase, user]);

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithFacebook,
    signOut,
    updateProfile,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
