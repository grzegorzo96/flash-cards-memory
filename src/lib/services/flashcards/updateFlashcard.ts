import type { SupabaseClient } from '../../../db/supabase.client';
import type { UpdateFlashcardCommand, UpdateFlashcardResponseDTO } from '../../../types';

/**
 * Service error for flashcard update operations
 */
export class UpdateFlashcardServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'UpdateFlashcardServiceError';
  }
}

/**
 * Updates an existing flashcard for the specified user.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param flashcardId - Flashcard ID to update
 * @param command - Flashcard update data
 * @returns Updated flashcard details
 * @throws {UpdateFlashcardServiceError} If flashcard update fails
 */
export async function updateFlashcard(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: string,
  command: UpdateFlashcardCommand
): Promise<UpdateFlashcardResponseDTO> {
  try {
    // First, verify the flashcard exists and belongs to the user
    const { data: existingFlashcard, error: fetchError } = await supabase
      .from('flashcards')
      .select('id')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (fetchError) {
      console.error('Database error fetching flashcard for update:', {
        userId,
        flashcardId,
        error: fetchError,
      });

      // Check for "not found" error
      if (fetchError.code === 'PGRST116') {
        throw new UpdateFlashcardServiceError(
          `Flashcard with ID "${flashcardId}" not found`,
          'NOT_FOUND',
          fetchError
        );
      }

      throw new UpdateFlashcardServiceError(
        `Failed to fetch flashcard: ${fetchError.message}`,
        'DATABASE_ERROR',
        fetchError
      );
    }

    if (!existingFlashcard) {
      throw new UpdateFlashcardServiceError(
        `Flashcard with ID "${flashcardId}" not found`,
        'NOT_FOUND'
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (command.question !== undefined) {
      updateData.question = command.question;
    }

    if (command.answer !== undefined) {
      updateData.answer = command.answer;
    }

    // Update the flashcard
    const { data: updatedFlashcard, error: updateError } = await supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('id, updated_at')
      .single();

    if (updateError) {
      console.error('Database error updating flashcard:', {
        userId,
        flashcardId,
        command,
        error: updateError,
      });

      throw new UpdateFlashcardServiceError(
        `Failed to update flashcard: ${updateError.message}`,
        'DATABASE_ERROR',
        updateError
      );
    }

    if (!updatedFlashcard) {
      throw new UpdateFlashcardServiceError(
        'Flashcard was not updated (no data returned)',
        'DATABASE_ERROR'
      );
    }

    return {
      id: updatedFlashcard.id,
      updated_at: updatedFlashcard.updated_at,
    };
  } catch (error) {
    // Re-throw UpdateFlashcardServiceError as-is
    if (error instanceof UpdateFlashcardServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in updateFlashcard service:', error);
    throw new UpdateFlashcardServiceError(
      'An unexpected error occurred while updating the flashcard',
      'UNKNOWN_ERROR',
      error
    );
  }
}
