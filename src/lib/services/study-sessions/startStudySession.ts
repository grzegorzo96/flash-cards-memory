import { selectCardsForReview } from '../../helpers/fsrs';
import type { SupabaseClient } from '../../../db/supabase.client';
import type {
  StartStudySessionCommand,
  StartStudySessionResponseDTO,
  StudySessionCardDTO,
} from '../../../types';

/**
 * Service error for study session creation operations
 */
export class StartStudySessionServiceError extends Error {
  constructor(
    message: string,
    public code: 'DECK_NOT_FOUND' | 'NO_CARDS_AVAILABLE' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'StartStudySessionServiceError';
  }
}

/**
 * Maximum number of cards per study session
 */
const MAX_CARDS_PER_SESSION = 20;

/**
 * Starts a new study session for a deck.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to associate the session with
 * @param command - Study session creation data
 * @returns Created study session with cards to review
 * @throws {StartStudySessionServiceError} If session creation fails
 */
export async function startStudySession(
  supabase: SupabaseClient,
  userId: string,
  command: StartStudySessionCommand
): Promise<StartStudySessionResponseDTO> {
  try {
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
        throw new StartStudySessionServiceError(
          `Deck with ID "${command.deck_id}" not found`,
          'DECK_NOT_FOUND',
          deckError
        );
      }

      throw new StartStudySessionServiceError(
        `Failed to verify deck: ${deckError.message}`,
        'DATABASE_ERROR',
        deckError
      );
    }

    if (!existingDeck) {
      throw new StartStudySessionServiceError(
        `Deck with ID "${command.deck_id}" not found`,
        'DECK_NOT_FOUND'
      );
    }

    // Fetch all cards from the deck for review selection
    const { data: allCards, error: cardsError } = await supabase
      .from('flashcards')
      .select('id, question, answer, next_due_at, last_reviewed_at')
      .eq('deck_id', command.deck_id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (cardsError) {
      console.error('Database error fetching cards:', {
        userId,
        deckId: command.deck_id,
        error: cardsError,
      });

      throw new StartStudySessionServiceError(
        `Failed to fetch cards: ${cardsError.message}`,
        'DATABASE_ERROR',
        cardsError
      );
    }

    if (!allCards || allCards.length === 0) {
      throw new StartStudySessionServiceError(
        'No cards available in this deck for study',
        'NO_CARDS_AVAILABLE'
      );
    }

    // Select cards for review using FSRS algorithm
    const selectedCards = selectCardsForReview(allCards, MAX_CARDS_PER_SESSION);

    if (selectedCards.length === 0) {
      throw new StartStudySessionServiceError(
        'No cards are due for review at this time',
        'NO_CARDS_AVAILABLE'
      );
    }

    // Create the study session
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        deck_id: command.deck_id,
        status: 'in_progress',
      })
      .select('id, status')
      .single();

    if (sessionError) {
      console.error('Database error creating study session:', {
        userId,
        deckId: command.deck_id,
        error: sessionError,
      });

      throw new StartStudySessionServiceError(
        `Failed to create study session: ${sessionError.message}`,
        'DATABASE_ERROR',
        sessionError
      );
    }

    if (!session) {
      throw new StartStudySessionServiceError(
        'Study session was not created (no data returned)',
        'DATABASE_ERROR'
      );
    }

    // Map cards to DTO format
    const cards: StudySessionCardDTO[] = selectedCards.map((card) => ({
      id: card.id,
      question: card.question,
      answer: card.answer,
    }));

    console.log('Study session started successfully:', {
      sessionId: session.id,
      userId,
      deckId: command.deck_id,
      cardsCount: cards.length,
    });

    return {
      id: session.id,
      status: session.status,
      cards,
    };
  } catch (error) {
    // Re-throw StartStudySessionServiceError as-is
    if (error instanceof StartStudySessionServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in startStudySession service:', error);
    throw new StartStudySessionServiceError(
      'An unexpected error occurred while starting the study session',
      'UNKNOWN_ERROR',
      error
    );
  }
}
