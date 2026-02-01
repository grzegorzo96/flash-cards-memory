import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const ResetPasswordCommandSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = ResetPasswordCommandSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email } = validation.data;
    const supabase = locals.supabase;

    // Call Supabase Auth resetPasswordForEmail
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });

    // Always return success (security best practice - don't reveal if email exists)
    if (error) {
      console.error('Supabase resetPasswordForEmail error:', error);
    }

    return new Response(
      JSON.stringify({
        message: 'Jeśli konto z tym adresem email istnieje, link do resetowania hasła został wysłany.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/reset-password:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
