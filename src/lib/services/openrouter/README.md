# OpenRouter Service

Unified service for communicating with LLM models through OpenRouter API.

## Features

- ✅ Unified interface for OpenRouter API communication
- ✅ System and user message building
- ✅ Model configuration and parameters (temperature, max_tokens, top_p, etc.)
- ✅ JSON Schema response format enforcement
- ✅ Response validation and mapping
- ✅ Comprehensive error handling with domain-specific errors
- ✅ HTTP transport layer with retries, timeouts, and exponential backoff
- ✅ Request tracking and monitoring with metrics
- ✅ Secure logging (API key masking, sensitive data sanitization)

## Installation

The service is already integrated into the project. No additional installation required.

## Configuration

Set the following environment variables in `.env`:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1  # Optional, defaults to this value
```

## Usage

### Basic Usage

```typescript
import { OpenRouterService } from '@/lib/services/openrouter';

// Create service instance
const openRouter = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  defaultModel: 'openai/gpt-4o-mini',
  defaultParams: {
    temperature: 0.7,
    max_tokens: 1000,
  },
});

// Generate chat completion
const result = await openRouter.generateChatCompletion({
  systemMessage: 'You are a helpful assistant.',
  userMessage: 'What is TypeScript?',
});

console.log(result.content); // AI response
console.log(result.model); // Model used
console.log(result.usage); // Token usage
```

### With JSON Schema Response Format

```typescript
import { OpenRouterService } from '@/lib/services/openrouter';

const openRouter = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
});

// Define response structure
interface FlashcardsResponse {
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
}

// Define JSON Schema
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

// Generate with structured response
const result = await openRouter.generateChatCompletion<FlashcardsResponse>({
  systemMessage: 'You are an educational assistant.',
  userMessage: 'Generate 3 flashcards about TypeScript.',
  responseFormat,
});

// Type-safe access to structured response
console.log(result.content.flashcards); // Array of flashcards
```

### With Custom Parameters

```typescript
const result = await openRouter.generateChatCompletion({
  systemMessage: 'You are a creative writer.',
  userMessage: 'Write a short story.',
  model: 'anthropic/claude-3.5-sonnet',
  params: {
    temperature: 0.9, // More creative
    max_tokens: 2000,
    top_p: 0.95,
  },
});
```

### With User ID for Tracking

```typescript
const result = await openRouter.generateChatCompletion(
  {
    systemMessage: 'You are a helpful assistant.',
    userMessage: 'Explain quantum computing.',
  },
  'user-123' // Optional user ID for logging
);
```

## Error Handling

The service provides specific error types for different failure scenarios:

```typescript
import {
  OpenRouterService,
  ConfigurationError,
  AuthError,
  RateLimitError,
  UpstreamError,
  SchemaValidationError,
  TimeoutError,
  EmptyResponseError,
} from '@/lib/services/openrouter';

try {
  const result = await openRouter.generateChatCompletion({
    systemMessage: 'You are a helpful assistant.',
    userMessage: 'Hello!',
  });
} catch (error) {
  if (error instanceof ConfigurationError) {
    // Handle configuration errors (missing API key, etc.)
    console.error('Configuration error:', error.message);
  } else if (error instanceof AuthError) {
    // Handle authentication errors (401, 403)
    console.error('Authentication failed:', error.message);
  } else if (error instanceof RateLimitError) {
    // Handle rate limit errors (429)
    console.error('Rate limit exceeded:', error.message);
    console.log('Retry after:', error.retryAfter); // seconds
  } else if (error instanceof UpstreamError) {
    // Handle upstream service errors (5xx)
    console.error('Service unavailable:', error.message);
    console.log('Status code:', error.statusCode);
  } else if (error instanceof SchemaValidationError) {
    // Handle schema validation errors
    console.error('Invalid response format:', error.message);
  } else if (error instanceof TimeoutError) {
    // Handle timeout errors
    console.error('Request timed out:', error.message);
  } else if (error instanceof EmptyResponseError) {
    // Handle empty response errors
    console.error('Empty response:', error.message);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

## Configuration Options

### OpenRouterConfig

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | Yes | - | OpenRouter API key |
| `baseUrl` | `string` | No | `https://openrouter.ai/api/v1` | API base URL |
| `defaultModel` | `string` | No | `openai/gpt-4o-mini` | Default model to use |
| `defaultParams` | `ModelParams` | No | See below | Default model parameters |
| `timeoutMs` | `number` | No | `30000` | Request timeout in milliseconds |
| `maxRetries` | `number` | No | `3` | Maximum retry attempts |

### Default ModelParams

```typescript
{
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1.0,
}
```

### ModelParams

| Parameter | Type | Description |
|-----------|------|-------------|
| `temperature` | `number` | Controls randomness (0.0 - 2.0) |
| `max_tokens` | `number` | Maximum tokens to generate |
| `top_p` | `number` | Nucleus sampling threshold |
| `presence_penalty` | `number` | Penalizes repeated tokens |
| `frequency_penalty` | `number` | Penalizes frequent tokens |

## Logging and Monitoring

The service includes comprehensive logging with request tracking:

```typescript
// Logs are automatically generated for:
// - Service initialization
// - Request start
// - Request success/failure
// - Retry attempts
// - Metrics (duration, tokens, model)

// Example log output:
{
  "level": "INFO",
  "timestamp": "2026-02-01T12:00:00.000Z",
  "service": "OpenRouter",
  "message": "Chat completion successful",
  "context": {
    "requestId": "req_1738416000000_abc123",
    "userId": "user-123",
    "model": "openai/gpt-4o-mini",
    "timestamp": "2026-02-01T12:00:00.000Z"
  },
  "meta": {
    "duration": 1234,
    "tokensUsed": 150
  }
}

// Metrics log:
{
  "level": "METRICS",
  "timestamp": "2026-02-01T12:00:00.000Z",
  "service": "OpenRouter",
  "requestId": "req_1738416000000_abc123",
  "model": "openai/gpt-4o-mini",
  "duration": 1234,
  "promptTokens": 50,
  "completionTokens": 100,
  "totalTokens": 150,
  "success": true
}
```

## Security Considerations

- ✅ API keys are never logged (automatically masked)
- ✅ User messages are truncated in logs (max 100 chars)
- ✅ Sensitive headers are sanitized
- ✅ Environment variables used for API keys
- ✅ No sensitive data in error messages

## Retry Strategy

The service implements exponential backoff for transient errors:

- Initial delay: 1 second
- Maximum delay: 10 seconds
- Formula: `min(1000 * 2^(attempt-1), 10000)` milliseconds

Retries are NOT attempted for:
- Authentication errors (401, 403)
- Invalid payload errors
- Rate limit errors without retry-after header

## Examples in the Codebase

See these files for real-world usage examples:

- `src/lib/services/ai-generations/generateFlashcardsWithAI.ts` - Flashcard generation service
- `src/pages/api/generation-requests/index.ts` - API endpoint integration

## API Reference

### OpenRouterService

#### Constructor

```typescript
constructor(config: OpenRouterConfig)
```

#### Methods

##### generateChatCompletion()

```typescript
async generateChatCompletion<T = string>(
  input: ChatCompletionInput,
  userId?: string
): Promise<ChatCompletionResult<T>>
```

##### validateResponseSchema()

```typescript
validateResponseSchema<T>(data: unknown, schema: JsonSchema): T
```

##### setDefaultModel()

```typescript
setDefaultModel(model: string): void
```

##### setDefaultParams()

```typescript
setDefaultParams(params: ModelParams): void
```

## License

MIT
