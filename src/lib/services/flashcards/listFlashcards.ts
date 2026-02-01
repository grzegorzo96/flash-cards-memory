import type { SupabaseClient } from '../../../db/supabase.client';
import type {
  ApiSortOrder,
  FlashcardListItemDTO,
  FlashcardListQueryDTO,
  FlashcardListResponseDTO,
  FlashcardSortField,
} from '../../../types';

/**
 * Service error for flashcard list operations
 */
export class ListFlashcardsServiceError extends Error {
  constructor(
    message: string,
    public code: 'DECK_NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ListFlashcardsServiceError';
  }
}

/**
 * Default pagination and sorting values
 */
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;
const DEFAULT_SORT: FlashcardSortField = 'created_at';
const DEFAULT_ORDER: ApiSortOrder = 'desc';
const MAX_LIMIT = 100;

/**
 * Retrieves a paginated list of flashcards for the specified deck.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param deckId - Deck ID to filter by
 * @param query - Query parameters for pagination, sorting, and filtering
 * @returns Paginated list of flashcards
 * @throws {ListFlashcardsServiceError} If retrieval fails
 */
export async function listFlashcards(
  supabase: SupabaseClient,
  userId: string,
  deckId: string,
  query: FlashcardListQueryDTO
): Promise<FlashcardListResponseDTO> {
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
        throw new ListFlashcardsServiceError(
          `Deck with ID "${deckId}" not found`,
          'DECK_NOT_FOUND',
          deckError
        );
      }

      throw new ListFlashcardsServiceError(
        `Failed to verify deck: ${deckError.message}`,
        'DATABASE_ERROR',
        deckError
      );
    }

    if (!existingDeck) {
      throw new ListFlashcardsServiceError(
        `Deck with ID "${deckId}" not found`,
        'DECK_NOT_FOUND'
      );
    }

    // Apply defaults and constraints
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = query.offset ?? DEFAULT_OFFSET;
    const sort = query.sort ?? DEFAULT_SORT;
    const order = query.order ?? DEFAULT_ORDER;
    const searchQuery = query.q?.trim();

    // Build base query
    let selectQuery = supabase
      .from('flashcards')
      .select(
        'id, question, answer, source, is_accepted, source_language, target_language, last_reviewed_at, next_due_at, created_at, updated_at',
        { count: 'exact' }
      )
      .eq('deck_id', deckId)
      .eq('user_id', userId)
      .is('deleted_at', null);

    // Apply full-text search if query provided
    if (searchQuery) {
      // Search in both question and answer fields
      // Using ilike for case-insensitive search (PostgREST doesn't support full-text search directly)
      selectQuery = selectQuery.or(
        `question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`
      );
    }

    // Apply sorting
    selectQuery = selectQuery.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    selectQuery = selectQuery.range(offset, offset + limit - 1);

    // Execute query
    const { data: flashcards, error, count } = await selectQuery;

    if (error) {
      console.error('Database error listing flashcards:', {
        userId,
        deckId,
        query,
        error,
      });

      throw new ListFlashcardsServiceError(
        `Failed to list flashcards: ${error.message}`,
        'DATABASE_ERROR',
        error
      );
    }

    if (!flashcards) {
      throw new ListFlashcardsServiceError(
        'No data returned from database',
        'DATABASE_ERROR'
      );
    }

    // Map to DTO
    const items: FlashcardListItemDTO[] = flashcards.map((flashcard) => ({
      id: flashcard.id,
      question: flashcard.question,
      answer: flashcard.answer,
      source: flashcard.source,
      is_accepted: flashcard.is_accepted,
      source_language: flashcard.source_language,
      target_language: flashcard.target_language,
      last_reviewed_at: flashcard.last_reviewed_at,
      next_due_at: flashcard.next_due_at,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    }));

    return {
      items,
      limit,
      offset,
      total: count ?? 0,
    };
  } catch (error) {
    // Re-throw ListFlashcardsServiceError as-is
    if (error instanceof ListFlashcardsServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in listFlashcards service:', error);
    throw new ListFlashcardsServiceError(
      'An unexpected error occurred while listing flashcards',
      'UNKNOWN_ERROR',
      error
    );
  }
}
