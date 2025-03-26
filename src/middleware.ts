import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add caching headers for GTM resources
  if (request.nextUrl.hostname === 'www.googletagmanager.com') {
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    response.headers.set('Vary', 'Accept-Encoding')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
