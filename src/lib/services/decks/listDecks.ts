import type { SupabaseClient } from '../../../db/supabase.client';
import type {
  ApiSortOrder,
  DeckListItemDTO,
  DeckListQueryDTO,
  DeckListResponseDTO,
  DeckSortField,
} from '../../../types';

/**
 * Service error for deck list operations
 */
export class ListDecksServiceError extends Error {
  constructor(
    message: string,
    public code: 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ListDecksServiceError';
  }
}

/**
 * Default pagination and sorting values
 */
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;
const DEFAULT_SORT: DeckSortField = 'created_at';
const DEFAULT_ORDER: ApiSortOrder = 'desc';
const MAX_LIMIT = 100;

/**
 * Retrieves a paginated list of decks for the specified user.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param query - Query parameters for pagination, sorting, and filtering
 * @returns Paginated list of decks
 * @throws {ListDecksServiceError} If retrieval fails
 */
export async function listDecks(
  supabase: SupabaseClient,
  userId: string,
  query: DeckListQueryDTO
): Promise<DeckListResponseDTO> {
  try {
    // Apply defaults and constraints
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = query.offset ?? DEFAULT_OFFSET;
    const sort = query.sort ?? DEFAULT_SORT;
    const order = query.order ?? DEFAULT_ORDER;
    const includeCounts = query.include_counts ?? false;

    // Build base query
    let selectQuery = supabase
      .from('decks')
      .select('id, name, description, created_at, updated_at', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null);

    // Apply sorting
    // Note: due_count sorting will be handled differently if include_counts is true
    if (sort === 'due_count' && includeCounts) {
      // For due_count sorting, we'll need to fetch all and sort in memory
      // This is a limitation we'll handle in a moment
    } else {
      selectQuery = selectQuery.order(sort, { ascending: order === 'asc' });
    }

    // Apply pagination
    selectQuery = selectQuery.range(offset, offset + limit - 1);

    // Execute query
    const { data: decks, error, count } = await selectQuery;

    if (error) {
      console.error('Database error listing decks:', {
        userId,
        query,
        error,
      });

      throw new ListDecksServiceError(
        `Failed to list decks: ${error.message}`,
        'DATABASE_ERROR',
        error
      );
    }

    if (!decks) {
      throw new ListDecksServiceError(
        'No data returned from database',
        'DATABASE_ERROR'
      );
    }

    // Get counts if requested
    let items: DeckListItemDTO[];

    if (includeCounts) {
      // Fetch counts for each deck
      const deckIds = decks.map((deck) => deck.id);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Get card counts
      const { data: cardCounts, error: cardCountError } = await supabase
        .from('flashcards')
        .select('deck_id')
        .in('deck_id', deckIds)
        .is('deleted_at', null);

      if (cardCountError) {
        console.error('Error fetching card counts:', cardCountError);
        throw new ListDecksServiceError(
          `Failed to fetch card counts: ${cardCountError.message}`,
          'DATABASE_ERROR',
          cardCountError
        );
      }

      // Get due today counts
      const { data: dueCounts, error: dueCountError } = await supabase
        .from('flashcards')
        .select('deck_id')
        .in('deck_id', deckIds)
        .is('deleted_at', null)
        .lte('next_due_at', today);

      if (dueCountError) {
        console.error('Error fetching due counts:', dueCountError);
        throw new ListDecksServiceError(
          `Failed to fetch due counts: ${dueCountError.message}`,
          'DATABASE_ERROR',
          dueCountError
        );
      }

      // Count cards per deck
      const cardCountMap = new Map<string, number>();
      cardCounts?.forEach((card) => {
        cardCountMap.set(card.deck_id, (cardCountMap.get(card.deck_id) ?? 0) + 1);
      });

      const dueCountMap = new Map<string, number>();
      dueCounts?.forEach((card) => {
        dueCountMap.set(card.deck_id, (dueCountMap.get(card.deck_id) ?? 0) + 1);
      });

      // Map decks with counts
      items = decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        description: deck.description,
        created_at: deck.created_at,
        updated_at: deck.updated_at,
        card_count: cardCountMap.get(deck.id) ?? 0,
        due_today_count: dueCountMap.get(deck.id) ?? 0,
      }));

      // Sort by due_count if requested
      if (sort === 'due_count') {
        items.sort((a, b) => {
          const diff = a.due_today_count - b.due_today_count;
          return order === 'asc' ? diff : -diff;
        });
      }
    } else {
      // Map decks without counts
      items = decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        description: deck.description,
        created_at: deck.created_at,
        updated_at: deck.updated_at,
        card_count: 0,
        due_today_count: 0,
      }));
    }

    return {
      items,
      limit,
      offset,
      total: count ?? 0,
    };
  } catch (error) {
    // Re-throw ListDecksServiceError as-is
    if (error instanceof ListDecksServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in listDecks service:', error);
    throw new ListDecksServiceError(
      'An unexpected error occurred while listing decks',
      'UNKNOWN_ERROR',
      error
    );
  }
}
