import type { SupabaseClient } from '../../../db/supabase.client';

/**
 * Service error for flashcard deletion operations
 */
export class DeleteFlashcardServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DeleteFlashcardServiceError';
  }
}

/**
 * Soft-deletes a flashcard.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param flashcardId - Flashcard ID to delete
 * @throws {DeleteFlashcardServiceError} If flashcard deletion fails
 */
export async function deleteFlashcard(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: string
): Promise<void> {
  try {
    const now = new Date().toISOString();

    // First, verify the flashcard exists and belongs to the user
    const { data: existingFlashcard, error: fetchError } = await supabase
      .from('flashcards')
      .select('id')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (fetchError) {
      console.error('Database error fetching flashcard for deletion:', {
        userId,
        flashcardId,
        error: fetchError,
      });

      // Check for "not found" error
      if (fetchError.code === 'PGRST116') {
        throw new DeleteFlashcardServiceError(
          `Flashcard with ID "${flashcardId}" not found`,
          'NOT_FOUND',
          fetchError
        );
      }

      throw new DeleteFlashcardServiceError(
        `Failed to fetch flashcard: ${fetchError.message}`,
        'DATABASE_ERROR',
        fetchError
      );
    }

    if (!existingFlashcard) {
      throw new DeleteFlashcardServiceError(
        `Flashcard with ID "${flashcardId}" not found`,
        'NOT_FOUND'
      );
    }

    // Soft-delete the flashcard
    const { error: deleteError } = await supabase
      .from('flashcards')
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (deleteError) {
      console.error('Database error soft-deleting flashcard:', {
        userId,
        flashcardId,
        error: deleteError,
      });

      throw new DeleteFlashcardServiceError(
        `Failed to delete flashcard: ${deleteError.message}`,
        'DATABASE_ERROR',
        deleteError
      );
    }

    console.log('Successfully soft-deleted flashcard:', {
      userId,
      flashcardId,
    });
  } catch (error) {
    // Re-throw DeleteFlashcardServiceError as-is
    if (error instanceof DeleteFlashcardServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in deleteFlashcard service:', error);
    throw new DeleteFlashcardServiceError(
      'An unexpected error occurred while deleting the flashcard',
      'UNKNOWN_ERROR',
      error
    );
  }
}
