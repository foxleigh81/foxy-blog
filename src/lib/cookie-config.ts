/**
 * Centralised cookie configuration constants for Supabase clients.
 * Ensures consistent cookie attributes across client, server, and middleware.
 */

export const SUPABASE_COOKIE_OPTIONS = {
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  httpOnly: false, // Auth cookies need to be accessible to JavaScript
} as const;

/**
 * Client-side cookie utilities
 */
export const parseCookies = () => {
  // Only access document if in browser environment
  if (typeof document === 'undefined') {
    return [];
  }

  // Parse document.cookie into the expected format
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.length > 0)
    .map((cookie) => {
      const [name, ...rest] = cookie.split('=');
      return {
        name: name.trim(),
        value: rest.join('=').trim(),
      };
    });
};

export const setCookieString = (
  name: string,
  value: string,
  options: Record<string, unknown> = {}
) => {
  // Only set cookies if in browser environment
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const cookieOptions: Record<string, unknown> = {
    ...SUPABASE_COOKIE_OPTIONS,
    ...options,
  };

  let cookieString = `${name}=${value}`;

  if (cookieOptions.maxAge) {
    cookieString += `; Max-Age=${cookieOptions.maxAge}`;
  }

  if (cookieOptions.path) {
    cookieString += `; Path=${cookieOptions.path}`;
  }

  if (cookieOptions.domain) {
    cookieString += `; Domain=${cookieOptions.domain}`;
  }

  if (cookieOptions.sameSite && typeof cookieOptions.sameSite === 'string') {
    cookieString += `; SameSite=${cookieOptions.sameSite}`;
  }

  if (cookieOptions.secure) {
    cookieString += `; Secure`;
  }

  // Note: httpOnly cannot be set via document.cookie (browser security)
  document.cookie = cookieString;
};
