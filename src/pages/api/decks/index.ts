import type { APIRoute } from 'astro';
import { z } from 'zod';

import { getOrCreateUserId } from '../../../lib/helpers/userId';
import { createDeck, DeckServiceError } from '../../../lib/services/decks/createDeck';
import { listDecks, ListDecksServiceError } from '../../../lib/services/decks/listDecks';
import type {
  ApiSortOrder,
  CreateDeckCommand,
  CreateDeckResponseDTO,
  DeckListQueryDTO,
  DeckListResponseDTO,
  DeckSortField,
} from '../../../types';

export const prerender = false;

// Zod schema for CreateDeckCommand validation
const CreateDeckCommandSchema = z.object({
  name: z
    .string()
    .min(3, 'Deck name must be at least 3 characters long')
    .max(100, 'Deck name must not exceed 100 characters'),
  description: z.string().nullable().optional(),
}) satisfies z.ZodType<CreateDeckCommand>;

// Zod schema for DeckListQueryDTO validation
const DeckListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['name', 'created_at', 'due_count']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  include_counts: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
}) satisfies z.ZodType<
  Omit<DeckListQueryDTO, 'sort' | 'order'> & {
    sort?: DeckSortField;
    order?: ApiSortOrder;
  }
>;

/**
 * GET /api/decks
 * Retrieves a paginated list of decks for the current user.
 *
 * @returns 200 OK with DeckListResponseDTO
 * @returns 400 Bad Request if query parameters are invalid
 * @returns 500 Internal Server Error for unexpected errors
 */
export const GET: APIRoute = async (context) => {
  try {
    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = {
      limit: url.searchParams.get('limit') ?? undefined,
      offset: url.searchParams.get('offset') ?? undefined,
      sort: url.searchParams.get('sort') ?? undefined,
      order: url.searchParams.get('order') ?? undefined,
      include_counts: url.searchParams.get('include_counts') ?? undefined,
    };

    const validationResult = DeckListQuerySchema.safeParse(queryParams);

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
    const userId = getOrCreateUserId(context.cookies);

    // List decks using service layer
    const result = await listDecks(supabase, userId, query);

    // Return success response
    const response: DeckListResponseDTO = result;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof ListDecksServiceError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to list decks',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/decks:', error);
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
 * POST /api/decks
 * Creates a new deck for the current user.
 *
 * @returns 201 Created with DeckDetailsDTO
 * @returns 400 Bad Request if validation fails
 * @returns 409 Conflict if deck name already exists for user
 * @returns 500 Internal Server Error for unexpected errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = CreateDeckCommandSchema.safeParse(body);

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

    // Create deck using service layer
    const deck = await createDeck(supabase, userId, command);

    // Return success response
    const response: CreateDeckResponseDTO = deck;

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof DeckServiceError) {
      if (error.code === 'DUPLICATE_NAME') {
        return new Response(
          JSON.stringify({
            error: 'Deck name already exists',
            message: error.message,
          }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // DATABASE_ERROR or UNKNOWN_ERROR
      return new Response(
        JSON.stringify({
          error: 'Failed to create deck',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/decks:', error);
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
