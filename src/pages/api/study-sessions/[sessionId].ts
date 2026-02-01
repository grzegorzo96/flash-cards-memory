import type { APIRoute } from 'astro';
import { z } from 'zod';

import {
  getStudySession,
  GetStudySessionServiceError,
} from '../../../lib/services/study-sessions/getStudySession';
import {
  updateStudySession,
  UpdateStudySessionServiceError,
} from '../../../lib/services/study-sessions/updateStudySession';
import type {
  StartStudySessionResponseDTO,
  StudySessionStatus,
  UpdateStudySessionCommand,
  UpdateStudySessionResponseDTO,
} from '../../../types';

export const prerender = false;

// Zod schema for UUID validation
const UUIDSchema = z.string().uuid('Invalid session ID format');

// Zod schema for UpdateStudySessionCommand validation
const UpdateStudySessionCommandSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'abandoned'], {
    errorMap: () => ({
      message: 'Status must be "in_progress", "completed", or "abandoned"',
    }),
  }),
}) satisfies z.ZodType<
  Omit<UpdateStudySessionCommand, 'status'> & { status: StudySessionStatus }
>;

/**
 * GET /api/study-sessions/:sessionId
 * Retrieves a study session with its associated flashcards.
 *
 * @returns 200 OK with StartStudySessionResponseDTO
 * @returns 400 Bad Request if sessionId is invalid
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

    // Retrieve study session using service layer
    const session = await getStudySession(
      supabase,
      userId,
      sessionIdValidation.data
    );

    // Return success response
    const response: StartStudySessionResponseDTO = session;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof GetStudySessionServiceError) {
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
          error: 'Failed to retrieve study session',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/study-sessions/:sessionId:', error);
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

/**
 * PATCH /api/study-sessions/:sessionId
 * Updates a study session's status.
 *
 * @returns 200 OK with UpdateStudySessionResponseDTO
 * @returns 400 Bad Request if validation fails
 * @returns 404 Not Found if session doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const PATCH: APIRoute = async (context) => {
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
    const validationResult = UpdateStudySessionCommandSchema.safeParse(body);

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

    // Update study session using service layer
    const session = await updateStudySession(
      supabase,
      userId,
      sessionIdValidation.data,
      command
    );

    // Return success response
    const response: UpdateStudySessionResponseDTO = session;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof UpdateStudySessionServiceError) {
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
          error: 'Failed to update study session',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in PATCH /api/study-sessions/:sessionId:', error);
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
