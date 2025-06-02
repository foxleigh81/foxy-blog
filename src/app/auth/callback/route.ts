import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const access_token = searchParams.get('access_token');
  const refresh_token = searchParams.get('refresh_token');

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return cookieStore.getAll();
        },
        setAll: (cookiesList) => {
          cookiesList.forEach((cookie) => {
            try {
              cookieStore.set(cookie.name, cookie.value, cookie.options);
            } catch (error) {
              console.log('Cookie setting failed:', error);
            }
          });
        },
      },
    }
  );

  let redirectUrl = '/auth/redirect-handler';

  try {
    // Handle PKCE flow with code
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
        redirectUrl = '/?auth=error';
      }
    }
    // Handle direct token flow
    else if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Error setting session:', error);
        redirectUrl = '/?auth=error';
      }
    }
    // Handle token_hash (email confirmation)
    else if (token_hash && type === 'email') {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email',
      });

      if (error) {
        console.error('Error verifying token:', error);
        redirectUrl = '/?auth=error';
      }
    }
  } catch (error) {
    console.error('Exception during auth callback:', error);
    redirectUrl = '/?auth=error';
  }

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
