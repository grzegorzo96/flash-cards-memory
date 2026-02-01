import type { AstroCookies } from 'astro';
import { randomUUID } from 'node:crypto';

const USER_ID_COOKIE_NAME = 'user_id_v2'; // v2: changed to valid UUID format
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Gets or creates an anonymous user ID from cookies.
 * For MVP, this creates a persistent anonymous user ID stored in a cookie.
 * This will be replaced with proper authentication in the future.
 *
 * @param cookies - Astro cookies instance
 * @returns User ID (existing or newly created)
 */
export function getOrCreateUserId(cookies: AstroCookies): string {
  // Try to get existing user ID from cookie
  const existingUserId = cookies.get(USER_ID_COOKIE_NAME)?.value;

  if (existingUserId) {
    return existingUserId;
  }

  // Create new anonymous user ID (valid UUID format)
  const newUserId = randomUUID();

  // Store in cookie with long expiration
  cookies.set(USER_ID_COOKIE_NAME, newUserId, {
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
  });

  return newUserId;
}
