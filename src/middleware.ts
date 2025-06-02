import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Define cookie methods with proper Chrome-compatible attributes
  const cookieMethods = {
    get(name: string) {
      return request.cookies.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      // Ensure Chrome-compatible cookie attributes
      const cookieOptions = {
        ...options,
        sameSite: 'lax' as const,
        secure: request.nextUrl.protocol === 'https:',
        path: '/',
        httpOnly: false, // Auth cookies need to be accessible to JavaScript
      };

      request.cookies.set({ name, value, ...cookieOptions });
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
      response.cookies.set({ name, value, ...cookieOptions });
    },
    remove(name: string, options: CookieOptions) {
      const cookieOptions = {
        ...options,
        sameSite: 'lax' as const,
        secure: request.nextUrl.protocol === 'https:',
        path: '/',
        httpOnly: false,
      };

      request.cookies.set({ name, value: '', ...cookieOptions });
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
      response.cookies.set({ name, value: '', ...cookieOptions });
    },
  };

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods,
    }
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  return response;
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
