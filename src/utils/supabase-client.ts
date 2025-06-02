import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { parseCookies, setCookieString } from '@/lib/cookie-config';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookies = parseCookies();
          console.log('[AUTH DEBUG] Getting cookies:', {
            count: cookies.length,
            cookieNames: cookies.map((c) => c.name),
            hasAuthCookies: cookies.some((c) => c.name.includes('auth')),
          });
          return cookies;
        },
        setAll: (cookieList) => {
          console.log('[AUTH DEBUG] Setting cookies:', {
            count: cookieList.length,
            cookieNames: cookieList.map((c) => c.name),
          });
          cookieList.forEach(({ name, value, options }) => {
            setCookieString(name, value, options);
          });
        },
      },
    }
  );
}
