import type { APIRoute } from 'astro';
import { z } from 'zod';

import {
  createFlashcard,
  CreateFlashcardServiceError,
} from '../../../../lib/services/flashcards/createFlashcard';
import {
  listFlashcards,
  ListFlashcardsServiceError,
} from '../../../../lib/services/flashcards/listFlashcards';
import type {
  ApiSortOrder,
  CreateFlashcardCommand,
  CreateFlashcardResponseDTO,
  FlashcardListQueryDTO,
  FlashcardListResponseDTO,
  FlashcardSortField,
  LanguageCode,
} from '../../../../types';

export const prerender = false;

// Zod schema for UUID validation
const UUIDSchema = z.string().uuid('Invalid deck ID format');

// Zod schema for CreateFlashcardCommand validation
const CreateFlashcardCommandSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .max(2000, 'Question must not exceed 2000 characters'),
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(2000, 'Answer must not exceed 2000 characters'),
  source_language: z.enum(['pl', 'en'], {
    errorMap: () => ({ message: 'Source language must be "pl" or "en"' }),
  }),
  target_language: z.enum(['pl', 'en'], {
    errorMap: () => ({ message: 'Target language must be "pl" or "en"' }),
  }),
}) satisfies z.ZodType<
  Omit<CreateFlashcardCommand, 'source_language' | 'target_language'> & {
    source_language: LanguageCode;
    target_language: LanguageCode;
  }
>;

// Zod schema for FlashcardListQueryDTO validation
const FlashcardListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['created_at', 'updated_at', 'next_due_at']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  q: z.string().nullable().optional(),
}) satisfies z.ZodType<
  Omit<FlashcardListQueryDTO, 'sort' | 'order'> & {
    sort?: FlashcardSortField;
    order?: ApiSortOrder;
  }
>;

/**
 * GET /api/decks/:deckId/flashcards
 * Retrieves a paginated list of flashcards for the specified deck.
 *
 * @returns 200 OK with FlashcardListResponseDTO
 * @returns 400 Bad Request if query parameters are invalid
 * @returns 404 Not Found if deck doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Get deckId from URL parameters
    const deckId = context.params.deckId;

    if (!deckId) {
      return new Response(
        JSON.stringify({
          error: 'Missing deck ID',
          message: 'Deck ID is required in the URL path',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate deckId as UUID
    const deckIdValidation = UUIDSchema.safeParse(deckId);

    if (!deckIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid deck ID',
          details: deckIdValidation.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = {
      limit: url.searchParams.get('limit') ?? undefined,
      offset: url.searchParams.get('offset') ?? undefined,
      sort: url.searchParams.get('sort') ?? undefined,
      order: url.searchParams.get('order') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
    };

    const validationResult = FlashcardListQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid query parameters',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const query = validationResult.data;

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

    // List flashcards using service layer
    const result = await listFlashcards(supabase, userId, deckIdValidation.data, query);

    // Return success response
    const response: FlashcardListResponseDTO = result;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof ListFlashcardsServiceError) {
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

      // DATABASE_ERROR or UNKNOWN_ERROR
      return new Response(
        JSON.stringify({
          error: 'Failed to list flashcards',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/decks/:deckId/flashcards:', error);
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
 * POST /api/decks/:deckId/flashcards
 * Creates a new manual flashcard in the specified deck.
 *
 * @returns 201 Created with CreateFlashcardResponseDTO
 * @returns 400 Bad Request if validation fails
 * @returns 404 Not Found if deck doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Get deckId from URL parameters
    const deckId = context.params.deckId;

    if (!deckId) {
      return new Response(
        JSON.stringify({
          error: 'Missing deck ID',
          message: 'Deck ID is required in the URL path',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate deckId as UUID
    const deckIdValidation = UUIDSchema.safeParse(deckId);

    if (!deckIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid deck ID',
          details: deckIdValidation.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = CreateFlashcardCommandSchema.safeParse(body);

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

    // Create flashcard using service layer
    const flashcard = await createFlashcard(
      supabase,
      userId,
      deckIdValidation.data,
      command
    );

    // Return success response
    const response: CreateFlashcardResponseDTO = flashcard;

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof CreateFlashcardServiceError) {
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

      // DATABASE_ERROR or UNKNOWN_ERROR
      return new Response(
        JSON.stringify({
          error: 'Failed to create flashcard',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/decks/:deckId/flashcards:', error);
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
