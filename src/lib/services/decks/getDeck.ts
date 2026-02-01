import type { SupabaseClient } from '../../../db/supabase.client';
import type { DeckDetailsDTO } from '../../../types';

/**
 * Service error for deck retrieval operations
 */
export class GetDeckServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GetDeckServiceError';
  }
}

/**
 * Retrieves a single deck by ID for the specified user.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param deckId - Deck ID to retrieve
 * @returns Deck details
 * @throws {GetDeckServiceError} If deck is not found or retrieval fails
 */
export async function getDeck(
  supabase: SupabaseClient,
  userId: string,
  deckId: string
): Promise<DeckDetailsDTO> {
  try {
    const { data: deck, error } = await supabase
      .from('decks')
      .select('id, name, description')
      .eq('id', deckId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Database error retrieving deck:', {
        userId,
        deckId,
        error,
      });

      // Check for "not found" error (PGRST116 is PostgREST code for no rows)
      if (error.code === 'PGRST116') {
        throw new GetDeckServiceError(
          `Deck with ID "${deckId}" not found`,
          'NOT_FOUND',
          error
        );
      }

      // Generic database error
      throw new GetDeckServiceError(
        `Failed to retrieve deck: ${error.message}`,
        'DATABASE_ERROR',
        error
      );
    }

    if (!deck) {
      throw new GetDeckServiceError(
        `Deck with ID "${deckId}" not found`,
        'NOT_FOUND'
      );
    }

    return {
      id: deck.id,
      name: deck.name,
      description: deck.description,
    };
  } catch (error) {
    // Re-throw GetDeckServiceError as-is
    if (error instanceof GetDeckServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in getDeck service:', error);
    throw new GetDeckServiceError(
      'An unexpected error occurred while retrieving the deck',
      'UNKNOWN_ERROR',
      error
    );
  }
}
