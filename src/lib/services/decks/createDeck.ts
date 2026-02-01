import type { SupabaseClient } from '../../../db/supabase.client';
import type { CreateDeckCommand, DeckDetailsDTO } from '../../../types';

/**
 * Service error for deck-related operations
 */
export class DeckServiceError extends Error {
  constructor(
    message: string,
    public code: 'DUPLICATE_NAME' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DeckServiceError';
  }
}

/**
 * Creates a new deck for the specified user.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to associate the deck with
 * @param command - Deck creation data
 * @returns Created deck details
 * @throws {DeckServiceError} If deck creation fails
 */
export async function createDeck(
  supabase: SupabaseClient,
  userId: string,
  command: CreateDeckCommand
): Promise<DeckDetailsDTO> {
  try {
    const { data: deck, error } = await supabase
      .from('decks')
      .insert({
        user_id: userId,
        name: command.name,
        description: command.description ?? null,
      })
      .select('id, name, description')
      .single();

    if (error) {
      console.error('Database error creating deck:', {
        userId,
        deckName: command.name,
        error,
      });

      // Check for unique constraint violation (duplicate deck name for user)
      if (error.code === '23505') {
        throw new DeckServiceError(
          `A deck with the name "${command.name}" already exists for this user`,
          'DUPLICATE_NAME',
          error
        );
      }

      // Generic database error
      throw new DeckServiceError(
        `Failed to create deck: ${error.message}`,
        'DATABASE_ERROR',
        error
      );
    }

    if (!deck) {
      throw new DeckServiceError(
        'Deck was not created (no data returned)',
        'DATABASE_ERROR'
      );
    }

    return {
      id: deck.id,
      name: deck.name,
      description: deck.description,
    };
  } catch (error) {
    // Re-throw DeckServiceError as-is
    if (error instanceof DeckServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in createDeck service:', error);
    throw new DeckServiceError(
      'An unexpected error occurred while creating the deck',
      'UNKNOWN_ERROR',
      error
    );
  }
}
