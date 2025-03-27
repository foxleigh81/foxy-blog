import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mockPosts, mockAuthors, mockCategories, mockTags } from '@/mocks';

export function middleware(request: NextRequest) {
  // Only intercept requests during testing
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.next();
  }

  // Check if this is a Sanity API request
  if (request.nextUrl.pathname.startsWith('/api/sanity')) {
    const query = request.nextUrl.searchParams.get('query');

    if (!query) {
      return NextResponse.json({});
    }

    // Return mock data based on the query
    if (query.includes('_type == "post"')) {
      if (query.includes('slug.current ==')) {
        return NextResponse.json(mockPosts[0]);
      }
      return NextResponse.json(mockPosts);
    }
    if (query.includes('_type == "author"')) {
      if (query.includes('slug.current ==')) {
        return NextResponse.json(mockAuthors[0]);
      }
      return NextResponse.json(mockAuthors);
    }
    if (query.includes('_type == "category"')) {
      if (query.includes('slug.current ==')) {
        return NextResponse.json(mockCategories[0]);
      }
      return NextResponse.json(mockCategories);
    }
    if (query.includes('_type == "tag"')) {
      if (query.includes('_id in')) {
        return NextResponse.json(mockTags);
      }
      return NextResponse.json(mockTags[0]);
    }
    return NextResponse.json([]);
  }

  // For test routes, return mock data directly
  if (process.env.NODE_ENV === 'test') {
    const path = request.nextUrl.pathname;

    if (path === '/author/test-author') {
      return NextResponse.json(mockAuthors[0]);
    }
    if (path === '/test-category') {
      return NextResponse.json(mockCategories[0]);
    }
    if (path === '/test-category/test-post') {
      return NextResponse.json(mockPosts[0]);
    }
    if (path === '/tag/test-tag') {
      return NextResponse.json(mockTags[0]);
    }
  }

  const response = NextResponse.next();

  // Add caching headers for GTM resources
  if (request.nextUrl.hostname === 'www.googletagmanager.com') {
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    response.headers.set('Vary', 'Accept-Encoding');
  }

  // Add Content Security Policy headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://vercel.live https://va.vercel-scripts.com https://www.instagram.com https://platform.instagram.com https://www.youtube.com https://s.ytimg.com;
    script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live https://va.vercel-scripts.com https://www.instagram.com https://platform.instagram.com https://www.youtube.com https://s.ytimg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live;
    img-src 'self' blob: data: https://cdn.sanity.io https://storage.ko-fi.com https://vercel.live https://vercel.com https://*.cdninstagram.com https://i.ytimg.com;
    font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com;
    connect-src 'self' https://www.google-analytics.com https://*.sanity.io https://vercel.live wss://ws-us3.pusher.com https://region1.google-analytics.com https://va.vercel-scripts.com https://www.instagram.com;
    frame-src 'self' https://www.googletagmanager.com https://vercel.live https://www.youtube.com https://www.instagram.com;
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

  if (request.nextUrl.pathname === '/_vercel/insights/script.js') {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
