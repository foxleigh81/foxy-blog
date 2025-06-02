import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { parseCookies, setCookieString } from '@/lib/cookie-config';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: parseCookies,
        setAll: (cookieList) => {
          cookieList.forEach(({ name, value, options }) => {
            setCookieString(name, value, options);
          });
        },
      },
    }
  );
}
