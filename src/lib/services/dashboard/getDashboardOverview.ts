import type { SupabaseClient } from '../../../db/supabase.client';
import type { DashboardDeckDTO, DashboardResponseDTO } from '../../../types';

/**
 * Service error for dashboard overview retrieval operations
 */
export class GetDashboardOverviewServiceError extends Error {
  constructor(
    message: string,
    public code: 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GetDashboardOverviewServiceError';
  }
}

/**
 * Retrieves dashboard overview with deck statistics.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @returns Dashboard overview with deck statistics
 * @throws {GetDashboardOverviewServiceError} If retrieval fails
 */
export async function getDashboardOverview(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardResponseDTO> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Fetch all decks for the user
    const { data: decks, error: decksError } = await supabase
      .from('decks')
      .select('id, name')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (decksError) {
      console.error('Database error fetching decks:', {
        userId,
        error: decksError,
      });

      throw new GetDashboardOverviewServiceError(
        `Failed to fetch decks: ${decksError.message}`,
        'DATABASE_ERROR',
        decksError
      );
    }

    if (!decks || decks.length === 0) {
      // No decks, return empty dashboard
      return {
        due_today_total: 0,
        decks: [],
      };
    }

    const deckIds = decks.map((deck) => deck.id);

    // Fetch all flashcards for these decks
    const { data: allCards, error: cardsError } = await supabase
      .from('flashcards')
      .select('deck_id, next_due_at')
      .in('deck_id', deckIds)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (cardsError) {
      console.error('Database error fetching flashcards:', {
        userId,
        error: cardsError,
      });

      throw new GetDashboardOverviewServiceError(
        `Failed to fetch flashcards: ${cardsError.message}`,
        'DATABASE_ERROR',
        cardsError
      );
    }

    // Count cards per deck
    const cardCountMap = new Map<string, number>();
    const dueCountMap = new Map<string, number>();

    if (allCards) {
      allCards.forEach((card) => {
        // Count total cards
        cardCountMap.set(card.deck_id, (cardCountMap.get(card.deck_id) ?? 0) + 1);

        // Count due today cards
        if (card.next_due_at) {
          const nextDue = card.next_due_at.split('T')[0]; // Get date part only
          if (nextDue <= today) {
            dueCountMap.set(card.deck_id, (dueCountMap.get(card.deck_id) ?? 0) + 1);
          }
        } else {
          // Cards without next_due_at (never reviewed) are considered due
          dueCountMap.set(card.deck_id, (dueCountMap.get(card.deck_id) ?? 0) + 1);
        }
      });
    }

    // Map decks to DTO with counts
    const dashboardDecks: DashboardDeckDTO[] = decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      card_count: cardCountMap.get(deck.id) ?? 0,
      due_today_count: dueCountMap.get(deck.id) ?? 0,
    }));

    // Calculate total due today
    const dueTodayTotal = dashboardDecks.reduce(
      (sum, deck) => sum + deck.due_today_count,
      0
    );

    console.log('Dashboard overview retrieved:', {
      userId,
      decksCount: dashboardDecks.length,
      dueTodayTotal,
    });

    return {
      due_today_total: dueTodayTotal,
      decks: dashboardDecks,
    };
  } catch (error) {
    // Re-throw GetDashboardOverviewServiceError as-is
    if (error instanceof GetDashboardOverviewServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in getDashboardOverview service:', error);
    throw new GetDashboardOverviewServiceError(
      'An unexpected error occurred while retrieving dashboard overview',
      'UNKNOWN_ERROR',
      error
    );
  }
}
