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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          console.error('Error fetching profile:', error);
          return null;
        }
        setProfile(data);
        return data;
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        throw error;
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [pathname, user, fetchProfile]);

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
            await fetchProfile(authUser.id);
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
        setSession(currentSession);
        const authUser = currentSession?.user ?? null;
        setUser(authUser);
        if (!authUser) {
          setProfile(null);
        }
      } catch (outerError) {
        console.error('[AuthProvider] Error in simplified onAuthStateChange handler:', outerError);
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
  }, [supabase, fetchProfile]);

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
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        setProfile(data);
      }
      return data;
    } catch (error) {
      console.error('Error in refetchProfile:', error);
      return null;
    }
  }, [user, supabase]);

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
