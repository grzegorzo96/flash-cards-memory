import type { APIRoute } from 'astro';
import { z } from 'zod';

import {
  deleteFlashcard,
  DeleteFlashcardServiceError,
} from '../../../lib/services/flashcards/deleteFlashcard';
import {
  getFlashcard,
  GetFlashcardServiceError,
} from '../../../lib/services/flashcards/getFlashcard';
import {
  updateFlashcard,
  UpdateFlashcardServiceError,
} from '../../../lib/services/flashcards/updateFlashcard';
import type {
  DeleteResponseDTO,
  GetFlashcardResponseDTO,
  UpdateFlashcardCommand,
  UpdateFlashcardResponseDTO,
} from '../../../types';

export const prerender = false;

// Zod schema for UUID validation
const UUIDSchema = z.string().uuid('Invalid flashcard ID format');

// Zod schema for UpdateFlashcardCommand validation
const UpdateFlashcardCommandSchema = z
  .object({
    question: z
      .string()
      .min(1, 'Question must not be empty')
      .max(2000, 'Question must not exceed 2000 characters')
      .optional(),
    answer: z
      .string()
      .min(1, 'Answer must not be empty')
      .max(2000, 'Answer must not exceed 2000 characters')
      .optional(),
  })
  .refine((data) => data.question !== undefined || data.answer !== undefined, {
    message: 'At least one field (question or answer) must be provided',
  }) satisfies z.ZodType<UpdateFlashcardCommand, z.ZodTypeDef, unknown>;

/**
 * GET /api/flashcards/:flashcardId
 * Retrieves details of a specific flashcard.
 *
 * @returns 200 OK with GetFlashcardResponseDTO
 * @returns 400 Bad Request if flashcardId is not a valid UUID
 * @returns 404 Not Found if flashcard doesn't exist or is deleted
 * @returns 500 Internal Server Error for unexpected errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Get flashcardId from URL parameters
    const flashcardId = context.params.flashcardId;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: 'Missing flashcard ID',
          message: 'Flashcard ID is required in the URL path',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate flashcardId as UUID
    const validationResult = UUIDSchema.safeParse(flashcardId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid flashcard ID',
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

    // Retrieve flashcard using service layer
    const flashcard = await getFlashcard(supabase, userId, validationResult.data);

    // Return success response
    const response: GetFlashcardResponseDTO = flashcard;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof GetFlashcardServiceError) {
      if (error.code === 'NOT_FOUND') {
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
          error: 'Failed to retrieve flashcard',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/flashcards/:flashcardId:', error);
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
 * PATCH /api/flashcards/:flashcardId
 * Updates an existing flashcard.
 *
 * @returns 200 OK with UpdateFlashcardResponseDTO
 * @returns 400 Bad Request if flashcardId is invalid or body validation fails
 * @returns 404 Not Found if flashcard doesn't exist or is deleted
 * @returns 500 Internal Server Error for unexpected errors
 */
export const PATCH: APIRoute = async (context) => {
  try {
    // Get flashcardId from URL parameters
    const flashcardId = context.params.flashcardId;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: 'Missing flashcard ID',
          message: 'Flashcard ID is required in the URL path',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate flashcardId as UUID
    const flashcardIdValidation = UUIDSchema.safeParse(flashcardId);

    if (!flashcardIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid flashcard ID',
          details: flashcardIdValidation.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = UpdateFlashcardCommandSchema.safeParse(body);

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

    // Update flashcard using service layer
    const flashcard = await updateFlashcard(
      supabase,
      userId,
      flashcardIdValidation.data,
      command
    );

    // Return success response
    const response: UpdateFlashcardResponseDTO = flashcard;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof UpdateFlashcardServiceError) {
      if (error.code === 'NOT_FOUND') {
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
          error: 'Failed to update flashcard',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in PATCH /api/flashcards/:flashcardId:', error);
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
 * DELETE /api/flashcards/:flashcardId
 * Soft-deletes a flashcard.
 *
 * @returns 200 OK with DeleteResponseDTO
 * @returns 400 Bad Request if flashcardId is not a valid UUID
 * @returns 404 Not Found if flashcard doesn't exist or is already deleted
 * @returns 500 Internal Server Error for unexpected errors
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // Get flashcardId from URL parameters
    const flashcardId = context.params.flashcardId;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: 'Missing flashcard ID',
          message: 'Flashcard ID is required in the URL path',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate flashcardId as UUID
    const validationResult = UUIDSchema.safeParse(flashcardId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid flashcard ID',
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

    // Delete flashcard using service layer
    await deleteFlashcard(supabase, userId, validationResult.data);

    // Return success response
    const response: DeleteResponseDTO = { ok: true };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof DeleteFlashcardServiceError) {
      if (error.code === 'NOT_FOUND') {
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
          error: 'Failed to delete flashcard',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in DELETE /api/flashcards/:flashcardId:', error);
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
