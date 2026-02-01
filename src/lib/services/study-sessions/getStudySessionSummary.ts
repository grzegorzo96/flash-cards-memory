import type { SupabaseClient } from '../../../db/supabase.client';
import type { ReviewRating, StudySessionSummaryResponseDTO } from '../../../types';

/**
 * Service error for study session summary retrieval operations
 */
export class GetStudySessionSummaryServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GetStudySessionSummaryServiceError';
  }
}

/**
 * Retrieves a summary of a study session including review statistics.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param sessionId - Study session ID to retrieve summary for
 * @returns Study session summary with review statistics
 * @throws {GetStudySessionSummaryServiceError} If summary retrieval fails
 */
export async function getStudySessionSummary(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
): Promise<StudySessionSummaryResponseDTO> {
  try {
    // Verify the study session exists and belongs to the user
    const { data: existingSession, error: sessionError } = await supabase
      .from('study_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError) {
      console.error('Database error verifying study session:', {
        userId,
        sessionId,
        error: sessionError,
      });

      if (sessionError.code === 'PGRST116') {
        throw new GetStudySessionSummaryServiceError(
          `Study session with ID "${sessionId}" not found`,
          'NOT_FOUND',
          sessionError
        );
      }

      throw new GetStudySessionSummaryServiceError(
        `Failed to verify study session: ${sessionError.message}`,
        'DATABASE_ERROR',
        sessionError
      );
    }

    if (!existingSession) {
      throw new GetStudySessionSummaryServiceError(
        `Study session with ID "${sessionId}" not found`,
        'NOT_FOUND'
      );
    }

    // Fetch all review events for this session
    const { data: reviewEvents, error: reviewError } = await supabase
      .from('review_events')
      .select('rating')
      .eq('study_session_id', sessionId);

    if (reviewError) {
      console.error('Database error fetching review events:', {
        userId,
        sessionId,
        error: reviewError,
      });

      throw new GetStudySessionSummaryServiceError(
        `Failed to fetch review events: ${reviewError.message}`,
        'DATABASE_ERROR',
        reviewError
      );
    }

    // Initialize ratings count
    const ratings: Record<ReviewRating, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    // Count ratings
    if (reviewEvents) {
      reviewEvents.forEach((event) => {
        const rating = event.rating as ReviewRating;
        if (rating >= 1 && rating <= 4) {
          ratings[rating]++;
        }
      });
    }

    const cardsReviewed = reviewEvents?.length ?? 0;

    console.log('Study session summary retrieved:', {
      sessionId,
      userId,
      cardsReviewed,
    });

    return {
      cards_reviewed: cardsReviewed,
      ratings,
    };
  } catch (error) {
    // Re-throw GetStudySessionSummaryServiceError as-is
    if (error instanceof GetStudySessionSummaryServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in getStudySessionSummary service:', error);
    throw new GetStudySessionSummaryServiceError(
      'An unexpected error occurred while retrieving the study session summary',
      'UNKNOWN_ERROR',
      error
    );
  }
}
