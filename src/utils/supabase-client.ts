import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          // Get all cookies from document.cookie
          return document.cookie
            .split(';')
            .map((cookie) => cookie.trim())
            .filter((cookie) => cookie.length > 0)
            .map((cookie) => {
              const [name, ...rest] = cookie.split('=');
              return {
                name: name.trim(),
                value: rest.join('=').trim(),
              };
            });
        },
        setAll: (cookieList) => {
          cookieList.forEach(({ name, value, options }) => {
            // Set cookies with proper attributes for Chrome
            const cookieOptions = {
              ...options,
              sameSite: 'lax' as const,
              secure: window.location.protocol === 'https:',
              path: '/',
            };

            let cookieString = `${name}=${value}`;

            if (cookieOptions.maxAge) {
              cookieString += `; Max-Age=${cookieOptions.maxAge}`;
            }

            if (cookieOptions.path) {
              cookieString += `; Path=${cookieOptions.path}`;
            }

            if (cookieOptions.domain) {
              cookieString += `; Domain=${cookieOptions.domain}`;
            }

            if (cookieOptions.sameSite) {
              cookieString += `; SameSite=${cookieOptions.sameSite}`;
            }

            if (cookieOptions.secure) {
              cookieString += `; Secure`;
            }

            if (cookieOptions.httpOnly) {
              cookieString += `; HttpOnly`;
            }

            document.cookie = cookieString;
          });
        },
      },
    }
  );
}
