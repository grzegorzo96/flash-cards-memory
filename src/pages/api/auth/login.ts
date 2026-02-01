import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const LoginCommandSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = LoginCommandSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, password } = validation.data;
    const supabase = locals.supabase;

    // Call Supabase Auth signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle errors
    if (error) {
      // Invalid credentials
      if (error.message.includes('Invalid login credentials')) {
        return new Response(
          JSON.stringify({
            error: 'Invalid credentials',
            message: 'Nieprawidłowy email lub hasło',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Email not confirmed (strict verification requirement)
      if (error.message.includes('Email not confirmed')) {
        return new Response(
          JSON.stringify({
            error: 'Email not verified',
            message: 'Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email.',
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Other errors
      console.error('Supabase signIn error:', error);
      return new Response(
        JSON.stringify({
          error: 'Login failed',
          message: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Success - session is automatically set by Supabase
    return new Response(
      JSON.stringify({
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/login:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
