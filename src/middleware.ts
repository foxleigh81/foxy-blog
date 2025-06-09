import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';
import { SUPABASE_COOKIE_OPTIONS } from '@/lib/cookie-config';

export async function middleware(request: NextRequest) {
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
          return cookies;
        },
        setAll(cookiesToSet) {
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
    await supabase.auth.getSession();
  } catch (error) {
    console.error('Error getting session:', error);
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
