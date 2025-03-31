import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Helper function to create a Supabase client with proper cookie handling for Next.js 15.
 * Uses the @supabase/ssr package which was built to handle async cookies in Next.js 15.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
          return Array.from(cookieStore.getAll()).map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll: async (cookiesList) => {
          try {
            cookiesList.forEach((cookie) => {
              cookieStore.set(cookie.name, cookie.value, cookie.options || {});
            });
          } catch {
            // This try/catch is needed for middleware and other read-only contexts
          }
        },
      },
    }
  );
}
