/**
 * Example usage of OpenRouter service
 * 
 * This file demonstrates how to use the OpenRouter service in different scenarios.
 * It's not meant to be imported or used in production code.
 */

import { OpenRouterService } from './OpenRouterService';
import type { ChatCompletionInput } from './types';

/**
 * Example 1: Basic chat completion
 */
async function basicExample() {
  const openRouter = new OpenRouterService({
    apiKey: 'your-api-key-here',
    defaultModel: 'openai/gpt-4o-mini',
  });

  const result = await openRouter.generateChatCompletion({
    systemMessage: 'You are a helpful assistant.',
    userMessage: 'What is TypeScript?',
  });

  console.log('Response:', result.content);
  console.log('Model:', result.model);
  console.log('Tokens:', result.usage?.total_tokens);
}

/**
 * Example 2: Structured response with JSON Schema
 */
async function structuredResponseExample() {
  const openRouter = new OpenRouterService({
    apiKey: 'your-api-key-here',
  });

  interface FlashcardsResponse {
    flashcards: Array<{
      question: string;
      answer: string;
    }>;
  }

  const input: ChatCompletionInput = {
    systemMessage: 'You are an educational assistant. Create flashcards in JSON format.',
    userMessage: 'Generate 3 flashcards about TypeScript basics.',
    responseFormat: {
      type: 'json_schema',
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
    },
  };

  const result = await openRouter.generateChatCompletion<FlashcardsResponse>(input);

  console.log('Flashcards:', result.content.flashcards);
  result.content.flashcards.forEach((card, index) => {
    console.log(`\nCard ${index + 1}:`);
    console.log(`Q: ${card.question}`);
    console.log(`A: ${card.answer}`);
  });
}

/**
 * Example 3: Custom model and parameters
 */
async function customParametersExample() {
  const openRouter = new OpenRouterService({
    apiKey: 'your-api-key-here',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    defaultParams: {
      temperature: 0.9,
      max_tokens: 2000,
    },
  });

  const result = await openRouter.generateChatCompletion({
    systemMessage: 'You are a creative writer.',
    userMessage: 'Write a short story about a robot learning to paint.',
    params: {
      temperature: 1.0, // Override default
      top_p: 0.95,
    },
  });

  console.log('Story:', result.content);
}

/**
 * Example 4: Error handling
 */
async function errorHandlingExample() {
  const openRouter = new OpenRouterService({
    apiKey: 'your-api-key-here',
  });

  try {
    const result = await openRouter.generateChatCompletion({
      systemMessage: 'You are a helpful assistant.',
      userMessage: 'Explain quantum computing in simple terms.',
    });

    console.log('Success:', result.content);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      
      // Check specific error types
      if ('code' in error) {
        console.error('Error code:', (error as { code: string }).code);
      }
      
      if ('retryAfter' in error) {
        console.error('Retry after:', (error as { retryAfter: number }).retryAfter, 'seconds');
      }
    }
  }
}

/**
 * Example 5: Dynamic model selection
 */
async function dynamicModelExample() {
  const openRouter = new OpenRouterService({
    apiKey: 'your-api-key-here',
  });

  // Use different models for different tasks
  const models = {
    fast: 'openai/gpt-4o-mini',
    smart: 'anthropic/claude-3.5-sonnet',
    creative: 'openai/gpt-4',
  };

  // Fast model for simple tasks
  const quickResult = await openRouter.generateChatCompletion({
    systemMessage: 'You are a helpful assistant.',
    userMessage: 'What is 2+2?',
    model: models.fast,
  });

  console.log('Quick answer:', quickResult.content);

  // Smart model for complex tasks
  const complexResult = await openRouter.generateChatCompletion({
    systemMessage: 'You are an expert in computer science.',
    userMessage: 'Explain the difference between TCP and UDP protocols.',
    model: models.smart,
  });

  console.log('Detailed answer:', complexResult.content);
}

/**
 * Example 6: Updating default settings
 */
async function updateDefaultsExample() {
  const openRouter = new OpenRouterService({
    apiKey: 'your-api-key-here',
    defaultModel: 'openai/gpt-4o-mini',
  });

  // First request with default model
  const result1 = await openRouter.generateChatCompletion({
    systemMessage: 'You are a helpful assistant.',
    userMessage: 'Hello!',
  });

  console.log('Model 1:', result1.model);

  // Update default model
  openRouter.setDefaultModel('anthropic/claude-3.5-sonnet');

  // Second request with new default model
  const result2 = await openRouter.generateChatCompletion({
    systemMessage: 'You are a helpful assistant.',
    userMessage: 'Hello again!',
  });

  console.log('Model 2:', result2.model);

  // Update default parameters
  openRouter.setDefaultParams({
    temperature: 0.5,
    max_tokens: 500,
  });

  // Third request with new default parameters
  const result3 = await openRouter.generateChatCompletion({
    systemMessage: 'You are a helpful assistant.',
    userMessage: 'One more time!',
  });

  console.log('Model 3:', result3.model);
}

// Export examples for reference
export {
  basicExample,
  structuredResponseExample,
  customParametersExample,
  errorHandlingExample,
  dynamicModelExample,
  updateDefaultsExample,
};
