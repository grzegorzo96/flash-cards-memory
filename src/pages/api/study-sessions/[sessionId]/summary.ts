import type { APIRoute } from 'astro';
import { z } from 'zod';

import { getOrCreateUserId } from '../../../../lib/helpers/userId';
import {
  getStudySessionSummary,
  GetStudySessionSummaryServiceError,
} from '../../../../lib/services/study-sessions/getStudySessionSummary';
import type { StudySessionSummaryResponseDTO } from '../../../../types';

export const prerender = false;

// Zod schema for UUID validation
const UUIDSchema = z.string().uuid('Invalid session ID format');

/**
 * GET /api/study-sessions/:sessionId/summary
 * Retrieves a summary of a study session including review statistics.
 *
 * @returns 200 OK with StudySessionSummaryResponseDTO
 * @returns 400 Bad Request if sessionId is not a valid UUID
 * @returns 404 Not Found if session doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const GET: APIRoute = async (context) => {
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
    const validationResult = UUIDSchema.safeParse(sessionId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid session ID',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Retrieve study session summary using service layer
    const summary = await getStudySessionSummary(
      supabase,
      userId,
      validationResult.data
    );

    // Return success response
    const response: StudySessionSummaryResponseDTO = summary;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof GetStudySessionSummaryServiceError) {
      if (error.code === 'NOT_FOUND') {
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

      // DATABASE_ERROR or UNKNOWN_ERROR
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve study session summary',
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
      'Unexpected error in GET /api/study-sessions/:sessionId/summary:',
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
