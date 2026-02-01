import type { APIRoute } from 'astro';
import { z } from 'zod';

import { getOrCreateUserId } from '../../../../lib/helpers/userId';
import {
  createReviewEvent,
  CreateReviewEventServiceError,
} from '../../../../lib/services/study-sessions/createReviewEvent';
import type {
  CreateReviewEventCommand,
  CreateReviewEventResponseDTO,
  ReviewRating,
} from '../../../../types';

export const prerender = false;

// Zod schema for UUID validation
const UUIDSchema = z.string().uuid('Invalid session ID format');

// Zod schema for CreateReviewEventCommand validation
const CreateReviewEventCommandSchema = z.object({
  flashcard_id: z.string().uuid('Invalid flashcard ID format'),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)], {
    errorMap: () => ({ message: 'Rating must be 1, 2, 3, or 4' }),
  }),
}) satisfies z.ZodType<
  Omit<CreateReviewEventCommand, 'rating'> & { rating: ReviewRating }
>;

/**
 * POST /api/study-sessions/:sessionId/review-events
 * Creates a review event for a flashcard in a study session.
 *
 * @returns 201 Created with CreateReviewEventResponseDTO
 * @returns 400 Bad Request if validation fails
 * @returns 404 Not Found if session or flashcard doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Get sessionId from URL parameters
    const sessionId = context.params.sessionId;

    if (!sessionId) {
      return new Response(
        JSON.stringify({
          error: 'Missing session ID',
          message: 'Session ID is required in the URL path',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate sessionId as UUID
    const sessionIdValidation = UUIDSchema.safeParse(sessionId);

    if (!sessionIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid session ID',
          details: sessionIdValidation.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = CreateReviewEventCommandSchema.safeParse(body);

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
    const userId = getOrCreateUserId(context.cookies);

    // Create review event using service layer
    const reviewEvent = await createReviewEvent(
      supabase,
      userId,
      sessionIdValidation.data,
      command
    );

    // Return success response
    const response: CreateReviewEventResponseDTO = reviewEvent;

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof CreateReviewEventServiceError) {
      if (error.code === 'SESSION_NOT_FOUND') {
        return new Response(
          JSON.stringify({
            error: 'Study session not found',
            message: error.message,
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (error.code === 'FLASHCARD_NOT_FOUND') {
        return new Response(
          JSON.stringify({
            error: 'Flashcard not found',
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
          error: 'Failed to create review event',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error(
      'Unexpected error in POST /api/study-sessions/:sessionId/review-events:',
      error
    );
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
