import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const RegisterCommandSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = RegisterCommandSchema.safeParse(body);

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

    // Call Supabase Auth signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    // Handle errors
    if (error) {
      // Email already exists
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({
            error: 'Email already exists',
            message: 'Konto z tym adresem email już istnieje',
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Other errors
      console.error('Supabase signUp error:', error);
      return new Response(
        JSON.stringify({
          error: 'Registration failed',
          message: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/register:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
