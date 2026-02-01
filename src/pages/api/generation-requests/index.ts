import type { APIRoute } from 'astro';
import { z } from 'zod';

import { getOrCreateUserId } from '../../../lib/helpers/userId';
import {
  createGenerationRequest,
  CreateGenerationRequestServiceError,
} from '../../../lib/services/ai-generations/createGenerationRequest';
import type {
  GenerationRequestCreateCommand,
  GenerationRequestCreateResponseDTO,
  LanguageCode,
} from '../../../types';

export const prerender = false;

// Zod schema for GenerationRequestCreateCommand validation
const GenerationRequestCreateCommandSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID format').nullable().optional(),
  source_text: z
    .string()
    .min(1, 'Source text is required')
    .max(5000, 'Source text must not exceed 5000 characters'),
  domain: z.string().min(1, 'Domain is required').max(100, 'Domain is too long'),
  target_language: z.enum(['pl', 'en'], {
    errorMap: () => ({ message: 'Target language must be "pl" or "en"' }),
  }),
  instructions: z.string().max(1000, 'Instructions must not exceed 1000 characters').optional(),
}) satisfies z.ZodType<
  Omit<GenerationRequestCreateCommand, 'target_language'> & {
    target_language: LanguageCode;
  }
>;

/**
 * POST /api/generation-requests
 * Creates a new AI generation request for flashcards.
 *
 * @returns 202 Accepted with GenerationRequestCreateResponseDTO
 * @returns 400 Bad Request if validation fails
 * @returns 500 Internal Server Error for unexpected errors
 */
export const POST: APIRoute = async (context) => {
  try {
    // Parse and validate request body
    const body = await context.request.json();
    const validationResult = GenerationRequestCreateCommandSchema.safeParse(body);

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

    // Create generation request using service layer
    const request = await createGenerationRequest(supabase, userId, command);

    // Return accepted response (202)
    const response: GenerationRequestCreateResponseDTO = request;

    return new Response(JSON.stringify(response), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle service-specific errors
    if (error instanceof CreateGenerationRequestServiceError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to create generation request',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/generation-requests:', error);
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
