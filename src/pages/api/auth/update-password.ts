import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const UpdatePasswordCommandSchema = z.object({
  password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = UpdatePasswordCommandSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { password } = validation.data;
    const supabase = locals.supabase;

    // Check if user is authenticated (recovery session)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Sesja wygasła. Poproś o nowy link resetujący.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error('Supabase updateUser error:', error);
      return new Response(
        JSON.stringify({
          error: 'Password update failed',
          message: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        message: 'Password updated successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/update-password:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
