import type { SupabaseClient } from '../../../db/supabase.client';
import type { DeckDetailsDTO, UpdateDeckCommand } from '../../../types';

/**
 * Service error for deck update operations
 */
export class UpdateDeckServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DUPLICATE_NAME' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'UpdateDeckServiceError';
  }
}

/**
 * Updates an existing deck for the specified user.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to filter by
 * @param deckId - Deck ID to update
 * @param command - Deck update data
 * @returns Updated deck details
 * @throws {UpdateDeckServiceError} If deck update fails
 */
export async function updateDeck(
  supabase: SupabaseClient,
  userId: string,
  deckId: string,
  command: UpdateDeckCommand
): Promise<DeckDetailsDTO> {
  try {
    // First, verify the deck exists and belongs to the user
    const { data: existingDeck, error: fetchError } = await supabase
      .from('decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (fetchError) {
      console.error('Database error fetching deck for update:', {
        userId,
        deckId,
        error: fetchError,
      });

      // Check for "not found" error
      if (fetchError.code === 'PGRST116') {
        throw new UpdateDeckServiceError(
          `Deck with ID "${deckId}" not found`,
          'NOT_FOUND',
          fetchError
        );
      }

      throw new UpdateDeckServiceError(
        `Failed to fetch deck: ${fetchError.message}`,
        'DATABASE_ERROR',
        fetchError
      );
    }

    if (!existingDeck) {
      throw new UpdateDeckServiceError(
        `Deck with ID "${deckId}" not found`,
        'NOT_FOUND'
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (command.name !== undefined) {
      updateData.name = command.name;
    }

    if (command.description !== undefined) {
      updateData.description = command.description;
    }

    // Update the deck
    const { data: updatedDeck, error: updateError } = await supabase
      .from('decks')
      .update(updateData)
      .eq('id', deckId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('id, name, description')
      .single();

    if (updateError) {
      console.error('Database error updating deck:', {
        userId,
        deckId,
        command,
        error: updateError,
      });

      // Check for unique constraint violation
      if (updateError.code === '23505') {
        throw new UpdateDeckServiceError(
          `A deck with the name "${command.name}" already exists for this user`,
          'DUPLICATE_NAME',
          updateError
        );
      }

      throw new UpdateDeckServiceError(
        `Failed to update deck: ${updateError.message}`,
        'DATABASE_ERROR',
        updateError
      );
    }

    if (!updatedDeck) {
      throw new UpdateDeckServiceError(
        'Deck was not updated (no data returned)',
        'DATABASE_ERROR'
      );
    }

    return {
      id: updatedDeck.id,
      name: updatedDeck.name,
      description: updatedDeck.description,
    };
  } catch (error) {
    // Re-throw UpdateDeckServiceError as-is
    if (error instanceof UpdateDeckServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in updateDeck service:', error);
    throw new UpdateDeckServiceError(
      'An unexpected error occurred while updating the deck',
      'UNKNOWN_ERROR',
      error
    );
  }
}
