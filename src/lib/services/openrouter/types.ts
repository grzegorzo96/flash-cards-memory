/**
 * OpenRouter service types and interfaces
 */

/**
 * Model parameters for OpenRouter API requests
 */
export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

/**
 * OpenRouter message format
 */
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * JSON Schema definition for response validation
 */
export interface JsonSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  items?: unknown;
  [key: string]: unknown;
}

/**
 * Response format configuration with JSON Schema
 */
export interface JsonSchemaResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: JsonSchema;
  };
}

/**
 * OpenRouter API payload structure
 */
export interface OpenRouterPayload {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  response_format?: JsonSchemaResponseFormat;
}

/**
 * OpenRouter API response structure
 */
export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Input for chat completion request
 */
export interface ChatCompletionInput {
  systemMessage: string;
  userMessage: string;
  model?: string;
  params?: ModelParams;
  responseFormat?: JsonSchemaResponseFormat;
}

/**
 * Result of chat completion
 */
export interface ChatCompletionResult<T = string> {
  content: T;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter service configuration
 */
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultParams?: ModelParams;
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Logger interface for dependency injection
 */
export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * JSON Schema validator interface for dependency injection
 */
export interface JsonSchemaValidator {
  validate<T>(data: unknown, schema: JsonSchema): T;
}
