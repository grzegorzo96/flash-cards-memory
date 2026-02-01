import type { SupabaseClient } from '../../../db/supabase.client';
import type {
  AcceptGeneratedCardsCommand,
  AcceptGeneratedCardsResponseDTO,
} from '../../../types';
import { previewCardsStore } from './previewCardsStore';

/**
 * Service error for accepting generated cards operations
 */
export class AcceptGeneratedCardsServiceError extends Error {
  constructor(
    message: string,
    public code:
      | 'REQUEST_NOT_FOUND'
      | 'DECK_NOT_FOUND'
      | 'EMPTY_CARDS'
      | 'DATABASE_ERROR'
      | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AcceptGeneratedCardsServiceError';
  }
}

/**
 * Maximum number of cards that can be accepted in a single batch
 */
const MAX_CARDS_PER_BATCH = 100;

/**
 * Accepts and saves generated flashcards to the database.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to associate the cards with
 * @param requestId - Generation request ID
 * @param command - Cards acceptance data
 * @returns Number of saved cards and their IDs
 * @throws {AcceptGeneratedCardsServiceError} If acceptance fails
 */
export async function acceptGeneratedCards(
  supabase: SupabaseClient,
  userId: string,
  requestId: string,
  command: AcceptGeneratedCardsCommand
): Promise<AcceptGeneratedCardsResponseDTO> {
  try {
    // Validate cards array
    if (!command.cards || command.cards.length === 0) {
      throw new AcceptGeneratedCardsServiceError(
        'Cards array cannot be empty',
        'EMPTY_CARDS'
      );
    }

    if (command.cards.length > MAX_CARDS_PER_BATCH) {
      throw new AcceptGeneratedCardsServiceError(
        `Cannot accept more than ${MAX_CARDS_PER_BATCH} cards at once`,
        'EMPTY_CARDS'
      );
    }

    // Verify the generation request exists and belongs to the user
    const { data: existingRequest, error: requestError } = await supabase
      .from('generation_requests')
      .select('id')
      .eq('id', requestId)
      .eq('user_id', userId)
      .single();

    if (requestError) {
      console.error('Database error verifying generation request:', {
        userId,
        requestId,
        error: requestError,
      });

      if (requestError.code === 'PGRST116') {
        throw new AcceptGeneratedCardsServiceError(
          `Generation request with ID "${requestId}" not found`,
          'REQUEST_NOT_FOUND',
          requestError
        );
      }

      throw new AcceptGeneratedCardsServiceError(
        `Failed to verify generation request: ${requestError.message}`,
        'DATABASE_ERROR',
        requestError
      );
    }

    if (!existingRequest) {
      throw new AcceptGeneratedCardsServiceError(
        `Generation request with ID "${requestId}" not found`,
        'REQUEST_NOT_FOUND'
      );
    }

    // Verify the deck exists and belongs to the user
    const { data: existingDeck, error: deckError } = await supabase
      .from('decks')
      .select('id')
      .eq('id', command.deck_id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (deckError) {
      console.error('Database error verifying deck:', {
        userId,
        deckId: command.deck_id,
        error: deckError,
      });

      if (deckError.code === 'PGRST116') {
        throw new AcceptGeneratedCardsServiceError(
          `Deck with ID "${command.deck_id}" not found`,
          'DECK_NOT_FOUND',
          deckError
        );
      }

      throw new AcceptGeneratedCardsServiceError(
        `Failed to verify deck: ${deckError.message}`,
        'DATABASE_ERROR',
        deckError
      );
    }

    if (!existingDeck) {
      throw new AcceptGeneratedCardsServiceError(
        `Deck with ID "${command.deck_id}" not found`,
        'DECK_NOT_FOUND'
      );
    }

    // Prepare flashcards for batch insert
    const flashcardsToInsert = command.cards.map((card) => ({
      deck_id: command.deck_id,
      user_id: userId,
      generation_request_id: requestId,
      question: card.question,
      answer: card.answer,
      original_question: card.original_question ?? null,
      original_answer: card.original_answer ?? null,
      source: card.source,
      is_accepted: card.is_accepted,
      source_language: card.source_language,
      target_language: card.target_language,
    }));

    // Insert flashcards in batch
    const { data: insertedCards, error: insertError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select('id');

    if (insertError) {
      console.error('Database error inserting flashcards:', {
        userId,
        requestId,
        deckId: command.deck_id,
        cardsCount: command.cards.length,
        error: insertError,
      });

      throw new AcceptGeneratedCardsServiceError(
        `Failed to save flashcards: ${insertError.message}`,
        'DATABASE_ERROR',
        insertError
      );
    }

    if (!insertedCards || insertedCards.length === 0) {
      throw new AcceptGeneratedCardsServiceError(
        'No flashcards were saved (no data returned)',
        'DATABASE_ERROR'
      );
    }

    console.log('Successfully saved generated flashcards:', {
      userId,
      requestId,
      deckId: command.deck_id,
      savedCount: insertedCards.length,
    });

    // Clean up preview cards from memory after successful acceptance
    previewCardsStore.delete(requestId);
    console.log('Preview cards cleaned up from storage:', { requestId });

    return {
      saved_count: insertedCards.length,
      flashcard_ids: insertedCards.map((card) => card.id),
    };
  } catch (error) {
    // Re-throw AcceptGeneratedCardsServiceError as-is
    if (error instanceof AcceptGeneratedCardsServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in acceptGeneratedCards service:', error);
    throw new AcceptGeneratedCardsServiceError(
      'An unexpected error occurred while accepting generated cards',
      'UNKNOWN_ERROR',
      error
    );
  }
}
