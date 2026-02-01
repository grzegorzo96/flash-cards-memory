import { detectLanguage } from '../../helpers/languageDetector';
import type { SupabaseClient } from '../../../db/supabase.client';
import type {
  GenerationRequestCreateCommand,
  GenerationRequestCreateResponseDTO,
} from '../../../types';
import { generateFlashcardsWithAI } from './generateFlashcardsWithAI';
import { previewCardsStore } from './previewCardsStore';

/**
 * Service error for generation request creation operations
 */
export class CreateGenerationRequestServiceError extends Error {
  constructor(
    message: string,
    public code: 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'CreateGenerationRequestServiceError';
  }
}

/**
 * Creates a new AI generation request.
 * This initiates the process of generating flashcards from source text.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to associate the request with (null for guest users)
 * @param command - Generation request data
 * @returns Created generation request details
 * @throws {CreateGenerationRequestServiceError} If request creation fails
 */
export async function createGenerationRequest(
  supabase: SupabaseClient,
  userId: string | null,
  command: GenerationRequestCreateCommand
): Promise<GenerationRequestCreateResponseDTO> {
  try {
    // Detect source language from the text
    const detectedSourceLanguage = detectLanguage(command.source_text);

    // Create the generation request with 'processing' status
    const { data: request, error: createError } = await supabase
      .from('generation_requests')
      .insert({
        user_id: userId,
        deck_id: command.deck_id ?? null,
        source_text: command.source_text,
        domain: command.domain,
        source_language: detectedSourceLanguage,
        target_language: command.target_language,
        status: 'processing',
      })
      .select('id, status, source_language')
      .single();

    if (createError) {
      console.error('Database error creating generation request:', {
        userId,
        command,
        error: createError,
      });

      throw new CreateGenerationRequestServiceError(
        `Failed to create generation request: ${createError.message}`,
        'DATABASE_ERROR',
        createError
      );
    }

    if (!request) {
      throw new CreateGenerationRequestServiceError(
        'Generation request was not created (no data returned)',
        'DATABASE_ERROR'
      );
    }

    // Trigger async AI generation process
    // This runs in the background and doesn't block the response
    processAIGeneration(supabase, request.id, command).catch((error) => {
      console.error('Background AI generation failed:', {
        requestId: request.id,
        error,
      });
    });

    console.log('Generation request created, AI processing started:', {
      requestId: request.id,
      userId,
      domain: command.domain,
    });

    return {
      id: request.id,
      status: request.status,
      detected_source_language: request.source_language,
    };
  } catch (error) {
    // Re-throw CreateGenerationRequestServiceError as-is
    if (error instanceof CreateGenerationRequestServiceError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in createGenerationRequest service:', error);
    throw new CreateGenerationRequestServiceError(
      'An unexpected error occurred while creating the generation request',
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Process AI generation in the background.
 * This function is called asynchronously after creating a generation request.
 *
 * @param supabase - Supabase client instance
 * @param requestId - Generation request ID
 * @param command - Generation request data
 */
async function processAIGeneration(
  supabase: SupabaseClient,
  requestId: string,
  command: GenerationRequestCreateCommand
): Promise<void> {
  try {
    console.log('Starting AI generation:', { requestId });

    // Call AI service to generate flashcards
    const previewCards = await generateFlashcardsWithAI(
      command.source_text,
      command.domain,
      command.target_language
    );

    console.log('AI generation completed:', {
      requestId,
      cardsCount: previewCards.length,
    });

    // Store preview cards in memory
    previewCardsStore.set(requestId, previewCards);

    // Update request status to 'completed'
    const { error: updateError } = await supabase
      .from('generation_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Failed to update generation request status:', {
        requestId,
        error: updateError,
      });
      throw updateError;
    }

    console.log('Generation request completed successfully:', { requestId });
  } catch (error) {
    console.error('AI generation failed:', { requestId, error });

    // Update request status to 'failed'
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    const errorCode = error instanceof Error ? error.name : 'UNKNOWN_ERROR';

    const { error: updateError } = await supabase
      .from('generation_requests')
      .update({
        status: 'failed',
        error_code: errorCode,
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Failed to update generation request status to failed:', {
        requestId,
        error: updateError,
      });
    }

    throw error;
  }
}
