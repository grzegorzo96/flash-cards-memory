import { selectCardsForReview } from '../../helpers/fsrs';
import type { SupabaseClient } from '../../../db/supabase.client';
import type { StartStudySessionResponseDTO, StudySessionCardDTO } from '../../../types';

/**
 * Service error for study session retrieval operations
 */
export class GetStudySessionServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GetStudySessionServiceError';
  }
}

/**
 * Maximum number of cards per study session
 */
const MAX_CARDS_PER_SESSION = 20;

/**
 * Retrieves a study session with its associated flashcards.
 * Uses the same FSRS algorithm as startStudySession to select cards.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param sessionId - Study session ID to retrieve
 * @returns Study session details with cards
 * @throws {GetStudySessionServiceError} If session retrieval fails
 */
export async function getStudySession(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
): Promise<StartStudySessionResponseDTO> {
  try {
    // Fetch the study session
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .select('id, deck_id, status, started_at, ended_at')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError) {
      console.error('Database error fetching study session:', {
        userId,
        sessionId,
        error: sessionError,
      });

      if (sessionError.code === 'PGRST116') {
        throw new GetStudySessionServiceError(
          `Study session with ID "${sessionId}" not found`,
          'NOT_FOUND',
          sessionError
        );
      }

      throw new GetStudySessionServiceError(
        `Failed to fetch study session: ${sessionError.message}`,
        'DATABASE_ERROR',
        sessionError
      );
    }

    if (!session) {
      throw new GetStudySessionServiceError(
        `Study session with ID "${sessionId}" not found`,
        'NOT_FOUND'
      );
    }

    // Fetch all cards from the deck for review selection (same as startStudySession)
    const { data: allCards, error: cardsError } = await supabase
      .from('flashcards')
      .select('id, question, answer, next_due_at, last_reviewed_at')
      .eq('deck_id', session.deck_id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (cardsError) {
      console.error('Database error fetching flashcards for study session:', {
        userId,
        sessionId,
        deckId: session.deck_id,
        error: cardsError,
      });

      throw new GetStudySessionServiceError(
        `Failed to fetch flashcards: ${cardsError.message}`,
        'DATABASE_ERROR',
        cardsError
      );
    }

    // Select cards for review using FSRS algorithm (same as startStudySession)
    const selectedCards = allCards && allCards.length > 0
      ? selectCardsForReview(allCards, MAX_CARDS_PER_SESSION)
      : [];

    // Map cards to DTO format
    const cards: StudySessionCardDTO[] = selectedCards.map((card) => ({
      id: card.id,
      question: card.question,
      answer: card.answer,
    }));

    console.log('Study session retrieved successfully:', {
      sessionId: session.id,
      userId,
      status: session.status,
      cardCount: cards.length,
    });

    return {
      id: session.id,
      status: session.status,
      cards,
    };
  } catch (error) {
    // Re-throw GetStudySessionServiceError as-is
    if (error instanceof GetStudySessionServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in getStudySession service:', error);
    throw new GetStudySessionServiceError(
      'An unexpected error occurred while retrieving the study session',
      'UNKNOWN_ERROR',
      error
    );
  }
}
