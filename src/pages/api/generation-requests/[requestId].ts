import type { APIRoute } from 'astro';
import { z } from 'zod';

import {
  getGenerationStatus,
  GetGenerationStatusServiceError,
} from '../../../lib/services/ai-generations/getGenerationStatus';
import type { GenerationRequestStatusResponseDTO } from '../../../types';

export const prerender = false;

// Zod schema for UUID validation
const UUIDSchema = z.string().uuid('Invalid request ID format');

/**
 * GET /api/generation-requests/:requestId
 * Retrieves the status and preview cards for a generation request.
 *
 * @returns 200 OK with GenerationRequestStatusResponseDTO
 * @returns 400 Bad Request if requestId is not a valid UUID
 * @returns 404 Not Found if request doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Get requestId from URL parameters
    const requestId = context.params.requestId;

    if (!requestId) {
      return new Response(
        JSON.stringify({
          error: 'Missing request ID',
          message: 'Request ID is required in the URL path',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate requestId as UUID
    const validationResult = UUIDSchema.safeParse(requestId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request ID',
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

    // Get user ID (null for guest users)
    const userId = context.locals.user?.id || null;

    // Retrieve generation status using service layer
    const status = await getGenerationStatus(supabase, userId, validationResult.data);

    // Return success response
    const response: GenerationRequestStatusResponseDTO = status;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof GetGenerationStatusServiceError) {
      if (error.code === 'NOT_FOUND') {
        return new Response(
          JSON.stringify({
            error: 'Generation request not found',
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
          error: 'Failed to retrieve generation status',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/generation-requests/:requestId:', error);
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
