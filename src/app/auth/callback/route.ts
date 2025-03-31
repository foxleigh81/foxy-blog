import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
            const cookies = Array.from(cookieStore.getAll());
            return cookies.map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll: async (cookiesList) => {
            try {
              cookiesList.forEach((cookie) => {
                cookieStore.set(cookie.name, cookie.value, cookie.options || {});
              });
            } catch (error) {
              console.error('Error setting cookies in callback route:', error);
              // Continue despite error - the cookie may still be set
            }
          },
        },
      }
    );

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
      }
    } catch (error) {
      console.error('Exception during code exchange:', error);
    }
  }

  // URL to redirect to after sign in process completes
  const response = NextResponse.redirect(requestUrl.origin);

  return response;
}
