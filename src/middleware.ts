import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // Log the current request path for debugging
  console.log(`[Middleware] Processing: ${request.nextUrl.pathname}`);

  // Create a response object that we can modify and return
  const response = NextResponse.next();

  // Initialize the Supabase middleware client
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Refresh the user's session if needed
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log(`[Middleware] Session check for ${request.nextUrl.pathname}:`, {
    hasSession: !!session,
    hasUser: !!session?.user?.id,
    userId: session?.user?.id,
  });

  // Return the response with the updated session
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/api/:path*'],
};
