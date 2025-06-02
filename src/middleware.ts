import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';
import { SUPABASE_COOKIE_OPTIONS } from '@/lib/cookie-config';

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE DEBUG] Processing request:', request.url);

  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log('[MIDDLEWARE DEBUG] Getting cookies:', {
            count: cookies.length,
            hasAuthCookies: cookies.some((c) => c.name.includes('auth')),
          });
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log('[MIDDLEWARE DEBUG] Setting cookies:', {
            count: cookiesToSet.length,
            cookieNames: cookiesToSet.map((c) => c.name),
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            // Use consistent cookie configuration
            const cookieOptions = {
              ...SUPABASE_COOKIE_OPTIONS,
              ...options,
            };

            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, cookieOptions);
          });
        },
      },
    }
  );

  try {
    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('[MIDDLEWARE DEBUG] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });
  } catch (error) {
    console.error('[MIDDLEWARE DEBUG] Error getting session:', error);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
