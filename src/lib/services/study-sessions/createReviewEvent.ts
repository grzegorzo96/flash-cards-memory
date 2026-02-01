import { calculateNextReview, type FSRSRating } from '../../helpers/fsrs';
import type { SupabaseClient } from '../../../db/supabase.client';
import type {
  CreateReviewEventCommand,
  CreateReviewEventResponseDTO,
} from '../../../types';

/**
 * Service error for review event creation operations
 */
export class CreateReviewEventServiceError extends Error {
  constructor(
    message: string,
    public code:
      | 'SESSION_NOT_FOUND'
      | 'FLASHCARD_NOT_FOUND'
      | 'DATABASE_ERROR'
      | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'CreateReviewEventServiceError';
  }
}

/**
 * Creates a review event and updates the flashcard's FSRS parameters.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to associate the review with
 * @param sessionId - Study session ID
 * @param command - Review event data
 * @returns Created review event with updated FSRS parameters
 * @throws {CreateReviewEventServiceError} If review event creation fails
 */
export async function createReviewEvent(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  command: CreateReviewEventCommand
): Promise<CreateReviewEventResponseDTO> {
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
        throw new CreateReviewEventServiceError(
          `Study session with ID "${sessionId}" not found`,
          'SESSION_NOT_FOUND',
          sessionError
        );
      }

      throw new CreateReviewEventServiceError(
        `Failed to verify study session: ${sessionError.message}`,
        'DATABASE_ERROR',
        sessionError
      );
    }

    if (!existingSession) {
      throw new CreateReviewEventServiceError(
        `Study session with ID "${sessionId}" not found`,
        'SESSION_NOT_FOUND'
      );
    }

    // Fetch the flashcard with current FSRS parameters
    const { data: flashcard, error: flashcardError } = await supabase
      .from('flashcards')
      .select('id, stability, difficulty, last_reviewed_at')
      .eq('id', command.flashcard_id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (flashcardError) {
      console.error('Database error fetching flashcard:', {
        userId,
        flashcardId: command.flashcard_id,
        error: flashcardError,
      });

      if (flashcardError.code === 'PGRST116') {
        throw new CreateReviewEventServiceError(
          `Flashcard with ID "${command.flashcard_id}" not found`,
          'FLASHCARD_NOT_FOUND',
          flashcardError
        );
      }

      throw new CreateReviewEventServiceError(
        `Failed to fetch flashcard: ${flashcardError.message}`,
        'DATABASE_ERROR',
        flashcardError
      );
    }

    if (!flashcard) {
      throw new CreateReviewEventServiceError(
        `Flashcard with ID "${command.flashcard_id}" not found`,
        'FLASHCARD_NOT_FOUND'
      );
    }

    // Calculate new FSRS parameters
    const fsrsResult = calculateNextReview(
      command.rating as FSRSRating,
      flashcard.stability,
      flashcard.difficulty,
      flashcard.last_reviewed_at ? new Date(flashcard.last_reviewed_at) : null
    );

    const now = new Date().toISOString();

    // Create the review event
    const { data: reviewEvent, error: reviewError } = await supabase
      .from('review_events')
      .insert({
        study_session_id: sessionId,
        flashcard_id: command.flashcard_id,
        user_id: userId,
        rating: command.rating,
        stability: fsrsResult.stability,
        difficulty: fsrsResult.difficulty,
        retrievability: fsrsResult.retrievability,
        next_due_at: fsrsResult.nextDueAt.toISOString(),
      })
      .select('id, next_due_at, stability, difficulty, retrievability')
      .single();

    if (reviewError) {
      console.error('Database error creating review event:', {
        userId,
        sessionId,
        flashcardId: command.flashcard_id,
        error: reviewError,
      });

      throw new CreateReviewEventServiceError(
        `Failed to create review event: ${reviewError.message}`,
        'DATABASE_ERROR',
        reviewError
      );
    }

    if (!reviewEvent) {
      throw new CreateReviewEventServiceError(
        'Review event was not created (no data returned)',
        'DATABASE_ERROR'
      );
    }

    // Update the flashcard with new FSRS parameters
    const { error: updateError } = await supabase
      .from('flashcards')
      .update({
        stability: fsrsResult.stability,
        difficulty: fsrsResult.difficulty,
        last_reviewed_at: now,
        next_due_at: fsrsResult.nextDueAt.toISOString(),
        updated_at: now,
      })
      .eq('id', command.flashcard_id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Database error updating flashcard:', {
        userId,
        flashcardId: command.flashcard_id,
        error: updateError,
      });

      // Note: Review event was created but flashcard update failed
      // In production, this should be handled with transactions
      throw new CreateReviewEventServiceError(
        `Failed to update flashcard: ${updateError.message}`,
        'DATABASE_ERROR',
        updateError
      );
    }

    console.log('Review event created successfully:', {
      reviewEventId: reviewEvent.id,
      userId,
      sessionId,
      flashcardId: command.flashcard_id,
      rating: command.rating,
    });

    return {
      review_event_id: reviewEvent.id,
      next_due_at: reviewEvent.next_due_at,
      stability: reviewEvent.stability,
      difficulty: reviewEvent.difficulty,
      retrievability: reviewEvent.retrievability,
    };
  } catch (error) {
    // Re-throw CreateReviewEventServiceError as-is
    if (error instanceof CreateReviewEventServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in createReviewEvent service:', error);
    throw new CreateReviewEventServiceError(
      'An unexpected error occurred while creating the review event',
      'UNKNOWN_ERROR',
      error
    );
  }
}
