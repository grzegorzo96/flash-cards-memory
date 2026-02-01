import type { SupabaseClient } from '../../../db/supabase.client';
import type {
  GenerationRequestStatusResponseDTO,
  PreviewCardDTO,
} from '../../../types';
import { previewCardsStore } from './previewCardsStore';

/**
 * Service error for generation status retrieval operations
 */
export class GetGenerationStatusServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GetGenerationStatusServiceError';
  }
}

/**
 * Retrieves the status and preview cards for a generation request.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param requestId - Generation request ID to retrieve
 * @returns Generation request status and preview cards
 * @throws {GetGenerationStatusServiceError} If request is not found or retrieval fails
 */
export async function getGenerationStatus(
  supabase: SupabaseClient,
  userId: string,
  requestId: string
): Promise<GenerationRequestStatusResponseDTO> {
  try {
    // Fetch the generation request
    const { data: request, error } = await supabase
      .from('generation_requests')
      .select('id, status, error_code, error_message')
      .eq('id', requestId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Database error retrieving generation request:', {
        userId,
        requestId,
        error,
      });

      // Check for "not found" error
      if (error.code === 'PGRST116') {
        throw new GetGenerationStatusServiceError(
          `Generation request with ID "${requestId}" not found`,
          'NOT_FOUND',
          error
        );
      }

      throw new GetGenerationStatusServiceError(
        `Failed to retrieve generation request: ${error.message}`,
        'DATABASE_ERROR',
        error
      );
    }

    if (!request) {
      throw new GetGenerationStatusServiceError(
        `Generation request with ID "${requestId}" not found`,
        'NOT_FOUND'
      );
    }

    // Fetch preview cards from temporary storage
    let previewCards: PreviewCardDTO[] = [];

    if (request.status === 'completed') {
      const storedCards = previewCardsStore.get(requestId);
      if (storedCards) {
        previewCards = storedCards;
        console.log('Preview cards fetched from storage:', {
          requestId,
          userId,
          cardsCount: previewCards.length,
        });
      } else {
        console.warn('Preview cards not found in storage for completed request:', {
          requestId,
          userId,
        });
      }
    }

    return {
      id: request.id,
      status: request.status,
      error_code: request.error_code,
      error_message: request.error_message,
      preview_cards: previewCards,
    };
  } catch (error) {
    // Re-throw GetGenerationStatusServiceError as-is
    if (error instanceof GetGenerationStatusServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in getGenerationStatus service:', error);
    throw new GetGenerationStatusServiceError(
      'An unexpected error occurred while retrieving generation status',
      'UNKNOWN_ERROR',
      error
    );
  }
}
