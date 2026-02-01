import type { SupabaseClient } from '../../../db/supabase.client';
import type { CreateFlashcardCommand, CreateFlashcardResponseDTO } from '../../../types';

/**
 * Service error for flashcard creation operations
 */
export class CreateFlashcardServiceError extends Error {
  constructor(
    message: string,
    public code: 'DECK_NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'CreateFlashcardServiceError';
  }
}

/**
 * Creates a new manual flashcard in the specified deck.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to associate the flashcard with
 * @param deckId - Deck ID to add the flashcard to
 * @param command - Flashcard creation data
 * @returns Created flashcard details
 * @throws {CreateFlashcardServiceError} If flashcard creation fails
 */
export async function createFlashcard(
  supabase: SupabaseClient,
  userId: string,
  deckId: string,
  command: CreateFlashcardCommand
): Promise<CreateFlashcardResponseDTO> {
  try {
    // First, verify the deck exists and belongs to the user
    const { data: existingDeck, error: deckError } = await supabase
      .from('decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (deckError) {
      console.error('Database error verifying deck:', {
        userId,
        deckId,
        error: deckError,
      });

      // Check for "not found" error
      if (deckError.code === 'PGRST116') {
        throw new CreateFlashcardServiceError(
          `Deck with ID "${deckId}" not found`,
          'DECK_NOT_FOUND',
          deckError
        );
      }

      throw new CreateFlashcardServiceError(
        `Failed to verify deck: ${deckError.message}`,
        'DATABASE_ERROR',
        deckError
      );
    }

    if (!existingDeck) {
      throw new CreateFlashcardServiceError(
        `Deck with ID "${deckId}" not found`,
        'DECK_NOT_FOUND'
      );
    }

    // Create the flashcard
    const { data: flashcard, error: createError } = await supabase
      .from('flashcards')
      .insert({
        deck_id: deckId,
        user_id: userId,
        question: command.question,
        answer: command.answer,
        source_language: command.source_language,
        target_language: command.target_language,
        source: 'manual',
        is_accepted: true,
      })
      .select('id, source, is_accepted')
      .single();

    if (createError) {
      console.error('Database error creating flashcard:', {
        userId,
        deckId,
        command,
        error: createError,
      });

      throw new CreateFlashcardServiceError(
        `Failed to create flashcard: ${createError.message}`,
        'DATABASE_ERROR',
        createError
      );
    }

    if (!flashcard) {
      throw new CreateFlashcardServiceError(
        'Flashcard was not created (no data returned)',
        'DATABASE_ERROR'
      );
    }

    return {
      id: flashcard.id,
      source: flashcard.source,
      is_accepted: flashcard.is_accepted,
    };
  } catch (error) {
    // Re-throw CreateFlashcardServiceError as-is
    if (error instanceof CreateFlashcardServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in createFlashcard service:', error);
    throw new CreateFlashcardServiceError(
      'An unexpected error occurred while creating the flashcard',
      'UNKNOWN_ERROR',
      error
    );
  }
}
