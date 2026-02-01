import type { APIRoute } from 'astro';
import { z } from 'zod';

import {
  startStudySession,
  StartStudySessionServiceError,
} from '../../../lib/services/study-sessions/startStudySession';
import type {
  StartStudySessionCommand,
  StartStudySessionResponseDTO,
} from '../../../types';

export const prerender = false;

// Zod schema for StartStudySessionCommand validation
const StartStudySessionCommandSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format'),
}) satisfies z.ZodType<StartStudySessionCommand>;

/**
 * POST /api/study-sessions
 * Starts a new study session for a deck.
 *
 * @returns 201 Created with StartStudySessionResponseDTO
 * @returns 400 Bad Request if validation fails
 * @returns 404 Not Found if deck doesn't exist or has no cards
 * @returns 500 Internal Server Error for unexpected errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = StartStudySessionCommandSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const command = validationResult.data;

    // Get Supabase client from context.locals
    const supabase = context.locals.supabase;
    if (!supabase) {
      console.error('Supabase client not available in context.locals');
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get or create anonymous user ID from cookies
    const userId = context.locals.user?.id;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Start study session using service layer
    const session = await startStudySession(supabase, userId, command);

    // Return success response
    const response: StartStudySessionResponseDTO = session;

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof StartStudySessionServiceError) {
      if (error.code === 'DECK_NOT_FOUND') {
        return new Response(
          JSON.stringify({
            error: 'Deck not found',
            message: error.message,
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (error.code === 'NO_CARDS_AVAILABLE') {
        return new Response(
          JSON.stringify({
            error: 'No cards available',
            message: error.message,
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // DATABASE_ERROR or UNKNOWN_ERROR
      return new Response(
        JSON.stringify({
          error: 'Failed to start study session',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/study-sessions:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
