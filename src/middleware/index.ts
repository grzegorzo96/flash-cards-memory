import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '../db/supabase.client.ts';

// Paths that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/decks',
  '/flashcards',
  '/study',
  '/api/decks',
  '/api/flashcards',
  '/api/study-sessions',
  '/api/dashboard',
  '/api/generation-requests/accept', // accepting/saving cards requires auth
];

// Paths only for non-authenticated users (redirect to dashboard if logged in)
const AUTH_ONLY_ROUTES = ['/login', '/register'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request, redirect, locals } = context;
  const pathname = url.pathname;

  // Create Supabase client with SSR support
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Add supabase to locals for use in routes
  locals.supabase = supabase;

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add user to locals if authenticated
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email ?? '',
    };
  } else {
    locals.user = null;
  }

  // Check if path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect to login if trying to access protected route without auth
  if (isProtectedRoute && !user) {
    const redirectUrl = encodeURIComponent(pathname);
    return redirect(`/login?redirect=${redirectUrl}`);
  }

  // Redirect to dashboard if trying to access auth-only routes while logged in
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) => pathname === route);
  if (isAuthOnlyRoute && user) {
    return redirect('/dashboard');
  }

  return next();
});
