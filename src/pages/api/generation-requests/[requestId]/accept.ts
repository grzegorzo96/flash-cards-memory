import type { APIRoute } from 'astro';
import { z } from 'zod';

import {
  acceptGeneratedCards,
  AcceptGeneratedCardsServiceError,
} from '../../../../lib/services/ai-generations/acceptGeneratedCards';
import type {
  AcceptedCardInputDTO,
  AcceptGeneratedCardsCommand,
  AcceptGeneratedCardsResponseDTO,
  FlashcardSource,
  LanguageCode,
} from '../../../../types';

export const prerender = false;

// Zod schema for UUID validation
const UUIDSchema = z.string().uuid('Invalid ID format');

// Zod schema for AcceptedCardInputDTO
const AcceptedCardInputDTOSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .max(2000, 'Question must not exceed 2000 characters'),
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(2000, 'Answer must not exceed 2000 characters'),
  original_question: z
    .string()
    .max(2000, 'Original question must not exceed 2000 characters')
    .nullable()
    .optional(),
  original_answer: z
    .string()
    .max(2000, 'Original answer must not exceed 2000 characters')
    .nullable()
    .optional(),
  source: z.enum(['ai'], {
    errorMap: () => ({ message: 'Source must be "ai"' }),
  }),
  is_accepted: z.literal(true, {
    errorMap: () => ({ message: 'is_accepted must be true' }),
  }),
  source_language: z.enum(['pl', 'en'], {
    errorMap: () => ({ message: 'Source language must be "pl" or "en"' }),
  }),
  target_language: z.enum(['pl', 'en'], {
    errorMap: () => ({ message: 'Target language must be "pl" or "en"' }),
  }),
}) satisfies z.ZodType<
  Omit<
    AcceptedCardInputDTO,
    'source' | 'is_accepted' | 'source_language' | 'target_language'
  > & {
    source: FlashcardSource;
    is_accepted: true;
    source_language: LanguageCode;
    target_language: LanguageCode;
  }
>;

// Zod schema for AcceptGeneratedCardsCommand
const AcceptGeneratedCardsCommandSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format'),
  cards: z
    .array(AcceptedCardInputDTOSchema)
    .min(1, 'At least one card is required')
    .max(100, 'Cannot accept more than 100 cards at once'),
}) satisfies z.ZodType<AcceptGeneratedCardsCommand, z.ZodTypeDef, unknown>;

/**
 * POST /api/generation-requests/:requestId/accept
 * Accepts and saves generated flashcards to the database.
 *
 * @returns 201 Created with AcceptGeneratedCardsResponseDTO
 * @returns 400 Bad Request if validation fails
 * @returns 404 Not Found if request or deck doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const POST: APIRoute = async (context) => {
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
    const requestIdValidation = UUIDSchema.safeParse(requestId);

    if (!requestIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request ID',
          details: requestIdValidation.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = AcceptGeneratedCardsCommandSchema.safeParse(body);

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

    // Accept generated cards using service layer
    const result = await acceptGeneratedCards(
      supabase,
      userId,
      requestIdValidation.data,
      command
    );

    // Return success response
    const response: AcceptGeneratedCardsResponseDTO = result;

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof AcceptGeneratedCardsServiceError) {
      if (error.code === 'REQUEST_NOT_FOUND') {
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

      if (error.code === 'EMPTY_CARDS') {
        return new Response(
          JSON.stringify({
            error: 'Invalid cards',
            message: error.message,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // DATABASE_ERROR or UNKNOWN_ERROR
      return new Response(
        JSON.stringify({
          error: 'Failed to accept generated cards',
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
      'Unexpected error in POST /api/generation-requests/:requestId/accept:',
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
