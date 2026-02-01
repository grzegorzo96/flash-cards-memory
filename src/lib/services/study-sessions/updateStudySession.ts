import type { SupabaseClient } from '../../../db/supabase.client';
import type {
  UpdateStudySessionCommand,
  UpdateStudySessionResponseDTO,
} from '../../../types';

/**
 * Service error for study session update operations
 */
export class UpdateStudySessionServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'UpdateStudySessionServiceError';
  }
}

/**
 * Updates a study session's status.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param sessionId - Study session ID to update
 * @param command - Study session update data
 * @returns Updated study session details
 * @throws {UpdateStudySessionServiceError} If session update fails
 */
export async function updateStudySession(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  command: UpdateStudySessionCommand
): Promise<UpdateStudySessionResponseDTO> {
  try {
    // Verify the study session exists and belongs to the user
    const { data: existingSession, error: fetchError } = await supabase
      .from('study_sessions')
      .select('id, status')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Database error fetching study session for update:', {
        userId,
        sessionId,
        error: fetchError,
      });

      if (fetchError.code === 'PGRST116') {
        throw new UpdateStudySessionServiceError(
          `Study session with ID "${sessionId}" not found`,
          'NOT_FOUND',
          fetchError
        );
      }

      throw new UpdateStudySessionServiceError(
        `Failed to fetch study session: ${fetchError.message}`,
        'DATABASE_ERROR',
        fetchError
      );
    }

    if (!existingSession) {
      throw new UpdateStudySessionServiceError(
        `Study session with ID "${sessionId}" not found`,
        'NOT_FOUND'
      );
    }

    // Prepare update data
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      status: command.status,
    };

    // Set ended_at when status is not in_progress
    if (command.status !== 'in_progress') {
      updateData.ended_at = now;
    }

    // Update the study session
    const { data: updatedSession, error: updateError } = await supabase
      .from('study_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select('id, status, ended_at')
      .single();

    if (updateError) {
      console.error('Database error updating study session:', {
        userId,
        sessionId,
        command,
        error: updateError,
      });

      throw new UpdateStudySessionServiceError(
        `Failed to update study session: ${updateError.message}`,
        'DATABASE_ERROR',
        updateError
      );
    }

    if (!updatedSession) {
      throw new UpdateStudySessionServiceError(
        'Study session was not updated (no data returned)',
        'DATABASE_ERROR'
      );
    }

    console.log('Study session updated successfully:', {
      sessionId: updatedSession.id,
      userId,
      status: updatedSession.status,
    });

    return {
      id: updatedSession.id,
      status: updatedSession.status,
      ended_at: updatedSession.ended_at,
    };
  } catch (error) {
    // Re-throw UpdateStudySessionServiceError as-is
    if (error instanceof UpdateStudySessionServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in updateStudySession service:', error);
    throw new UpdateStudySessionServiceError(
      'An unexpected error occurred while updating the study session',
      'UNKNOWN_ERROR',
      error
    );
  }
}
