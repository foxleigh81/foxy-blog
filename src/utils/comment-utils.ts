/**
 * Shared utilities for the comments system.
 */

/** Maximum allowed length for a comment body (in characters). */
export const MAX_COMMENT_LENGTH = 5000;

/** UUID format regex for validating IDs from query strings. */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns true if the given string is a valid UUID. */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/** Returns true if the user is currently suspended (suspension date is in the future). */
export function isUserSuspended(suspendedUntil: string | null): boolean {
  if (!suspendedUntil) return false;
  return new Date(suspendedUntil) > new Date();
}
