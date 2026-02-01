import type { APIRoute } from 'astro';
import { z } from 'zod';

import { getOrCreateUserId } from '../../../lib/helpers/userId';
import { deleteDeck, DeleteDeckServiceError } from '../../../lib/services/decks/deleteDeck';
import { getDeck, GetDeckServiceError } from '../../../lib/services/decks/getDeck';
import { updateDeck, UpdateDeckServiceError } from '../../../lib/services/decks/updateDeck';
import type {
  DeleteResponseDTO,
  GetDeckResponseDTO,
  UpdateDeckCommand,
  UpdateDeckResponseDTO,
} from '../../../types';

export const prerender = false;

// Zod schema for UUID validation
const UUIDSchema = z.string().uuid('Invalid deck ID format');

// Zod schema for UpdateDeckCommand validation
const UpdateDeckCommandSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Deck name must be at least 3 characters long')
      .max(100, 'Deck name must not exceed 100 characters')
      .optional(),
    description: z.string().nullable().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: 'At least one field (name or description) must be provided',
  }) satisfies z.ZodType<UpdateDeckCommand, z.ZodTypeDef, unknown>;

/**
 * GET /api/decks/:deckId
 * Retrieves details of a specific deck.
 *
 * @returns 200 OK with DeckDetailsDTO
 * @returns 400 Bad Request if deckId is not a valid UUID
 * @returns 404 Not Found if deck doesn't exist or is deleted
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
    const validationResult = UUIDSchema.safeParse(deckId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid deck ID',
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

    // Retrieve deck using service layer
    const deck = await getDeck(supabase, userId, validationResult.data);

    // Return success response
    const response: GetDeckResponseDTO = deck;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof GetDeckServiceError) {
      if (error.code === 'NOT_FOUND') {
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
          error: 'Failed to retrieve deck',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/decks/:deckId:', error);
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
 * PATCH /api/decks/:deckId
 * Updates an existing deck.
 *
 * @returns 200 OK with DeckDetailsDTO
 * @returns 400 Bad Request if deckId is invalid or body validation fails
 * @returns 404 Not Found if deck doesn't exist or is deleted
 * @returns 409 Conflict if deck name already exists for user
 * @returns 500 Internal Server Error for unexpected errors
 */
export const PATCH: APIRoute = async (context) => {
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
    const validationResult = UpdateDeckCommandSchema.safeParse(body);

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

    // Update deck using service layer
    const deck = await updateDeck(supabase, userId, deckIdValidation.data, command);

    // Return success response
    const response: UpdateDeckResponseDTO = deck;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof UpdateDeckServiceError) {
      if (error.code === 'NOT_FOUND') {
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
          error: 'Failed to update deck',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in PATCH /api/decks/:deckId:', error);
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
 * DELETE /api/decks/:deckId
 * Soft-deletes a deck and all its associated flashcards.
 *
 * @returns 200 OK with DeleteResponseDTO
 * @returns 400 Bad Request if deckId is not a valid UUID
 * @returns 404 Not Found if deck doesn't exist or is already deleted
 * @returns 500 Internal Server Error for unexpected errors
 */
export const DELETE: APIRoute = async (context) => {
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
    const validationResult = UUIDSchema.safeParse(deckId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid deck ID',
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

    // Delete deck using service layer
    await deleteDeck(supabase, userId, validationResult.data);

    // Return success response
    const response: DeleteResponseDTO = { ok: true };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof DeleteDeckServiceError) {
      if (error.code === 'NOT_FOUND') {
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
          error: 'Failed to delete deck',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in DELETE /api/decks/:deckId:', error);
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
