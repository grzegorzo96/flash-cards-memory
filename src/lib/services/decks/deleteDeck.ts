import type { SupabaseClient } from '../../../db/supabase.client';

/**
 * Service error for deck deletion operations
 */
export class DeleteDeckServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DeleteDeckServiceError';
  }
}

/**
 * Soft-deletes a deck and all its associated flashcards.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param deckId - Deck ID to delete
 * @throws {DeleteDeckServiceError} If deck deletion fails
 */
export async function deleteDeck(
  supabase: SupabaseClient,
  userId: string,
  deckId: string
): Promise<void> {
  try {
    const now = new Date().toISOString();

    // First, verify the deck exists and belongs to the user
    const { data: existingDeck, error: fetchError } = await supabase
      .from('decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (fetchError) {
      console.error('Database error fetching deck for deletion:', {
        userId,
        deckId,
        error: fetchError,
      });

      // Check for "not found" error
      if (fetchError.code === 'PGRST116') {
        throw new DeleteDeckServiceError(
          `Deck with ID "${deckId}" not found`,
          'NOT_FOUND',
          fetchError
        );
      }

      throw new DeleteDeckServiceError(
        `Failed to fetch deck: ${fetchError.message}`,
        'DATABASE_ERROR',
        fetchError
      );
    }

    if (!existingDeck) {
      throw new DeleteDeckServiceError(
        `Deck with ID "${deckId}" not found`,
        'NOT_FOUND'
      );
    }

    // Soft-delete the deck
    const { error: deleteDeckError } = await supabase
      .from('decks')
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', deckId)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (deleteDeckError) {
      console.error('Database error soft-deleting deck:', {
        userId,
        deckId,
        error: deleteDeckError,
      });

      throw new DeleteDeckServiceError(
        `Failed to delete deck: ${deleteDeckError.message}`,
        'DATABASE_ERROR',
        deleteDeckError
      );
    }

    // Soft-delete all associated flashcards
    const { error: deleteFlashcardsError } = await supabase
      .from('flashcards')
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq('deck_id', deckId)
      .is('deleted_at', null);

    if (deleteFlashcardsError) {
      console.error('Database error soft-deleting flashcards:', {
        userId,
        deckId,
        error: deleteFlashcardsError,
      });

      // Note: In a real application with transactions, we would rollback the deck deletion
      // For now, we'll log the error but consider the operation partially successful
      throw new DeleteDeckServiceError(
        `Failed to delete associated flashcards: ${deleteFlashcardsError.message}`,
        'DATABASE_ERROR',
        deleteFlashcardsError
      );
    }

    console.log('Successfully soft-deleted deck and flashcards:', {
      userId,
      deckId,
    });
  } catch (error) {
    // Re-throw DeleteDeckServiceError as-is
    if (error instanceof DeleteDeckServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in deleteDeck service:', error);
    throw new DeleteDeckServiceError(
      'An unexpected error occurred while deleting the deck',
      'UNKNOWN_ERROR',
      error
    );
  }
}
