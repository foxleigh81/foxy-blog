import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add caching headers for GTM resources
  if (request.nextUrl.hostname === 'www.googletagmanager.com') {
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    response.headers.set('Vary', 'Accept-Encoding');
  }

  // Add Content Security Policy headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://vercel.live;
    script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live;
    img-src 'self' blob: data: https://cdn.sanity.io https://storage.ko-fi.com https://vercel.live https://vercel.com;
    font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com;
    connect-src 'self' https://www.google-analytics.com https://*.sanity.io https://vercel.live wss://ws-us3.pusher.com;
    frame-src 'self' https://www.googletagmanager.com https://vercel.live;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
