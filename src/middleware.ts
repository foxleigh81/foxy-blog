import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export async function middleware(request: NextRequest) {
  // Log the current request path for debugging
  console.log(`[Middleware] Processing: ${request.nextUrl.pathname}`);

  // Create a response object that we can modify and return
  const response = NextResponse.next();

  // Initialize the Supabase client with the correct approach for middleware
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return Array.from(request.cookies.getAll()).map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll: (cookiesList) => {
          cookiesList.forEach((cookie) => {
            // Setting cookies in the response
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    }
  );

  // First get session to maintain cookies
  await supabase.auth.getSession();

  // Then use getUser to get authenticated user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(`[Middleware] Session check for ${request.nextUrl.pathname}:`, {
    isAuthenticated: !!user,
    userId: user?.id,
  });

  // Return the response with the updated session
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/api/:path*'],
};
