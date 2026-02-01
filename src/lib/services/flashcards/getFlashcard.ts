import type { SupabaseClient } from '../../../db/supabase.client';
import type { GetFlashcardResponseDTO } from '../../../types';

/**
 * Service error for flashcard retrieval operations
 */
export class GetFlashcardServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GetFlashcardServiceError';
  }
}

/**
 * Retrieves a single flashcard by ID for the specified user.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param flashcardId - Flashcard ID to retrieve
 * @returns Flashcard details
 * @throws {GetFlashcardServiceError} If flashcard is not found or retrieval fails
 */
export async function getFlashcard(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: string
): Promise<GetFlashcardResponseDTO> {
  try {
    const { data: flashcard, error } = await supabase
      .from('flashcards')
      .select('id, question, answer, deck_id')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Database error retrieving flashcard:', {
        userId,
        flashcardId,
        error,
      });

      // Check for "not found" error
      if (error.code === 'PGRST116') {
        throw new GetFlashcardServiceError(
          `Flashcard with ID "${flashcardId}" not found`,
          'NOT_FOUND',
          error
        );
      }

      throw new GetFlashcardServiceError(
        `Failed to retrieve flashcard: ${error.message}`,
        'DATABASE_ERROR',
        error
      );
    }

    if (!flashcard) {
      throw new GetFlashcardServiceError(
        `Flashcard with ID "${flashcardId}" not found`,
        'NOT_FOUND'
      );
    }

    return {
      id: flashcard.id,
      question: flashcard.question,
      answer: flashcard.answer,
      deck_id: flashcard.deck_id,
    };
  } catch (error) {
    // Re-throw GetFlashcardServiceError as-is
    if (error instanceof GetFlashcardServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in getFlashcard service:', error);
    throw new GetFlashcardServiceError(
      'An unexpected error occurred while retrieving the flashcard',
      'UNKNOWN_ERROR',
      error
    );
  }
}
