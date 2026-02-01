import type { PreviewCardDTO, LanguageCode } from '../../../types';
import { OpenRouterService } from '../openrouter';
import {
  ConfigurationError,
  AuthError,
  RateLimitError,
  UpstreamError,
  SchemaValidationError,
  EmptyResponseError,
} from '../openrouter/errors';

/**
 * Service error for AI generation operations
 */
export class GenerateFlashcardsWithAIError extends Error {
  constructor(
    message: string,
    public code: 'API_ERROR' | 'INVALID_RESPONSE' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GenerateFlashcardsWithAIError';
  }
}

/**
 * Flashcards response structure from AI
 */
interface FlashcardsResponse {
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Creates and configures OpenRouter service instance
 */
function createOpenRouterService(): OpenRouterService {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new GenerateFlashcardsWithAIError(
      'OpenRouter API Key is missing. Please set OPENROUTER_API_KEY in .env',
      'API_ERROR'
    );
  }

  return new OpenRouterService({
    apiKey,
    defaultModel: 'anthropic/claude-3.5-sonnet',
    defaultParams: {
      temperature: 0.7,
      max_tokens: 2000,
    },
  });
}

/**
 * Generates flashcards using OpenRouter AI API.
 *
 * @param sourceText - The text to generate flashcards from
 * @param domain - The subject domain (e.g., "Medicine", "Programming")
 * @param targetLanguage - The language for questions and answers
 * @returns Array of generated preview cards
 * @throws {GenerateFlashcardsWithAIError} If AI generation fails
 */
export async function generateFlashcardsWithAI(
  sourceText: string,
  domain: string,
  targetLanguage: LanguageCode
): Promise<PreviewCardDTO[]> {
  try {
    // Create OpenRouter service
    const openRouter = createOpenRouterService();

    // Build system message
    const systemMessage =
      'Jesteś asystentem edukacyjnym. Twórz precyzyjne pytania i odpowiedzi do fiszek. Odpowiadaj zawsze poprawnym formatem JSON.';

    // Build user message with instructions
    const userMessage = `
      Generuj fiszki edukacyjne na podstawie poniższego tekstu (oraz dziedziny: ${domain || 'Ogólna'}).
      Zwróć TYLKO czysty JSON w następującym formacie:
      {
        "flashcards": [
          { "question": "Pytanie...", "answer": "Odpowiedź..." }
        ]
      }
      Tekst źródłowy:
      ${sourceText}
    `;

    // Define JSON Schema for response validation
    const responseFormat = {
      type: 'json_schema' as const,
      json_schema: {
        name: 'FlashcardsResponse',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            flashcards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' },
                },
                required: ['question', 'answer'],
                additionalProperties: false,
              },
            },
          },
          required: ['flashcards'],
          additionalProperties: false,
        },
      },
    };

    // Generate flashcards using OpenRouter service
    const result = await openRouter.generateChatCompletion<FlashcardsResponse>({
      systemMessage,
      userMessage,
      responseFormat,
    });

    // Validate response structure
    if (!result.content.flashcards || !Array.isArray(result.content.flashcards)) {
      throw new GenerateFlashcardsWithAIError(
        'Invalid response structure: missing flashcards array',
        'INVALID_RESPONSE'
      );
    }

    // Convert to PreviewCardDTO format
    const previewCards: PreviewCardDTO[] = result.content.flashcards.map((card) => ({
      question: card.question,
      answer: card.answer,
      source: 'ai' as const,
    }));

    console.log('AI generation completed successfully:', {
      cardsCount: previewCards.length,
      model: result.model,
      tokensUsed: result.usage?.total_tokens,
    });

    return previewCards;
  } catch (error) {
    // Map OpenRouter errors to GenerateFlashcardsWithAIError
    if (error instanceof ConfigurationError) {
      throw new GenerateFlashcardsWithAIError(
        'Configuration error: ' + error.message,
        'API_ERROR',
        error
      );
    }

    if (error instanceof AuthError) {
      throw new GenerateFlashcardsWithAIError(
        'Authentication failed: ' + error.message,
        'API_ERROR',
        error
      );
    }

    if (error instanceof RateLimitError) {
      throw new GenerateFlashcardsWithAIError(
        'Rate limit exceeded: ' + error.message,
        'API_ERROR',
        error
      );
    }

    if (error instanceof UpstreamError) {
      throw new GenerateFlashcardsWithAIError(
        'OpenRouter service error: ' + error.message,
        'API_ERROR',
        error
      );
    }

    if (error instanceof SchemaValidationError || error instanceof EmptyResponseError) {
      throw new GenerateFlashcardsWithAIError(
        'Invalid response from AI: ' + error.message,
        'INVALID_RESPONSE',
        error
      );
    }

    // Re-throw GenerateFlashcardsWithAIError as-is
    if (error instanceof GenerateFlashcardsWithAIError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in generateFlashcardsWithAI:', error);
    throw new GenerateFlashcardsWithAIError(
      'An unexpected error occurred during AI generation',
      'UNKNOWN_ERROR',
      error
    );
  }
}
