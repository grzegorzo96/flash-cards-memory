import type {
  OpenRouterConfig,
  ChatCompletionInput,
  ChatCompletionResult,
  ModelParams,
  OpenRouterMessage,
  OpenRouterPayload,
  OpenRouterResponse,
  JsonSchema,
  Logger,
  JsonSchemaValidator,
} from './types';
import {
  ConfigurationError,
  AuthError,
  RateLimitError,
  UpstreamError,
  SchemaValidationError,
  TimeoutError,
  InvalidPayloadError,
  EmptyResponseError,
} from './errors';
import { OpenRouterLogger, generateRequestId } from './logger';

/**
 * Default configuration values
 */
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_PARAMS: ModelParams = {
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1.0,
};

/**
 * OpenRouter service for LLM API communication
 * 
 * Provides a unified interface for communicating with LLM models through OpenRouter API.
 * Handles message building, model configuration, JSON Schema response format enforcement,
 * response validation, error handling, and retries.
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly logger: OpenRouterLogger;
  private readonly schemaValidator?: JsonSchemaValidator;

  private defaultModel: string;
  private defaultParams: ModelParams;

  /**
   * Creates a new OpenRouter service instance
   * 
   * @param config - Service configuration
   * @throws {ConfigurationError} If API key is missing or invalid
   */
  constructor(config: OpenRouterConfig) {
    // Validate required configuration
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new ConfigurationError('OpenRouter API key is required');
    }

    // Initialize configuration
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.defaultModel = config.defaultModel || DEFAULT_MODEL;
    this.defaultParams = { ...DEFAULT_PARAMS, ...config.defaultParams };
    this.timeoutMs = config.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.maxRetries = config.maxRetries || DEFAULT_MAX_RETRIES;

    // Initialize logger
    this.logger = new OpenRouterLogger();

    // Initialize schema validator if provided
    this.schemaValidator = undefined;

    // Log initialization (mask API key)
    this.logger.info('OpenRouter service initialized', {
      baseUrl: this.baseUrl,
      defaultModel: this.defaultModel,
      apiKey: this.maskApiKey(this.apiKey),
    });
  }

  /**
   * Generates a chat completion using OpenRouter API
   * 
   * @param input - Chat completion input parameters
   * @param userId - Optional user ID for logging
   * @returns Chat completion result with content and metadata
   * @throws {InvalidPayloadError} If input validation fails
   * @throws {AuthError} If authentication fails
   * @throws {RateLimitError} If rate limit is exceeded
   * @throws {UpstreamError} If upstream service fails
   * @throws {TimeoutError} If request times out
   * @throws {EmptyResponseError} If response is empty
   * @throws {SchemaValidationError} If response doesn't match schema
   */
  async generateChatCompletion<T = string>(
    input: ChatCompletionInput,
    userId?: string
  ): Promise<ChatCompletionResult<T>> {
    // Generate request ID for tracking
    const requestId = generateRequestId();
    const startTime = Date.now();
    const model = input.model || this.defaultModel;

    // Set logger context
    this.logger.setContext({
      requestId,
      userId,
      model,
      timestamp: new Date().toISOString(),
    });

    try {
      // Validate input
      this.validateInput(input);

      // Build messages
      const messages = this.buildMessages(input.systemMessage, input.userMessage);

      // Build payload
      const payload = this.buildPayload(input, messages);

      this.logger.info('Starting chat completion request', {
        model,
        hasResponseFormat: !!input.responseFormat,
      });

      // Send request with retries
      const response = await this.sendRequestWithRetry(payload);

      // Map and validate response
      const result = this.mapResponse<T>(response, input.responseFormat?.json_schema.schema);

      // Calculate duration
      const duration = Date.now() - startTime;

      // Log success metrics
      this.logger.logMetrics({
        requestId,
        model: response.model,
        duration,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
        success: true,
      });

      this.logger.info('Chat completion successful', {
        duration,
        tokensUsed: response.usage?.total_tokens,
      });

      return result;
    } catch (error) {
      // Calculate duration
      const duration = Date.now() - startTime;

      // Log error metrics
      this.logger.logMetrics({
        requestId,
        model,
        duration,
        success: false,
        errorCode: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      });

      this.logger.error('Chat completion failed', {
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    } finally {
      // Clear logger context
      this.logger.clearContext();
    }
  }

  /**
   * Validates response data against a JSON Schema
   * 
   * @param data - Data to validate
   * @param schema - JSON Schema to validate against
   * @returns Validated and typed data
   * @throws {SchemaValidationError} If validation fails
   */
  validateResponseSchema<T>(data: unknown, schema: JsonSchema): T {
    if (!this.schemaValidator) {
      // Basic validation without external validator
      try {
        // Ensure data is an object
        if (typeof data !== 'object' || data === null) {
          throw new Error('Data must be an object');
        }

        // Check required fields if specified
        if (schema.required && Array.isArray(schema.required)) {
          for (const field of schema.required) {
            if (!(field in (data as Record<string, unknown>))) {
              throw new Error(`Missing required field: ${field}`);
            }
          }
        }

        return data as T;
      } catch (error) {
        throw new SchemaValidationError(
          'Schema validation failed',
          error,
          error
        );
      }
    }

    return this.schemaValidator.validate<T>(data, schema);
  }

  /**
   * Updates the default model for subsequent requests
   * 
   * @param model - Model identifier (e.g., "openai/gpt-4o-mini")
   */
  setDefaultModel(model: string): void {
    if (!model || model.trim() === '') {
      throw new ConfigurationError('Model name cannot be empty');
    }

    this.defaultModel = model;
    this.logger.info('Default model updated', { model });
  }

  /**
   * Updates the default parameters for subsequent requests
   * 
   * @param params - Model parameters to set as default
   */
  setDefaultParams(params: ModelParams): void {
    this.defaultParams = { ...this.defaultParams, ...params };
    this.logger.info('Default params updated', { params });
  }

  /**
   * Validates input parameters
   * 
   * @param input - Input to validate
   * @throws {InvalidPayloadError} If validation fails
   */
  private validateInput(input: ChatCompletionInput): void {
    if (!input.systemMessage || input.systemMessage.trim() === '') {
      throw new InvalidPayloadError('System message is required and cannot be empty');
    }

    if (!input.userMessage || input.userMessage.trim() === '') {
      throw new InvalidPayloadError('User message is required and cannot be empty');
    }
  }

  /**
   * Builds messages array for OpenRouter API
   * 
   * @param systemMessage - System message content
   * @param userMessage - User message content
   * @returns Array of messages in correct order
   */
  private buildMessages(systemMessage: string, userMessage: string): OpenRouterMessage[] {
    return [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];
  }

  /**
   * Builds the complete payload for OpenRouter API
   * 
   * @param input - Chat completion input
   * @param messages - Prepared messages array
   * @returns Complete API payload
   */
  private buildPayload(
    input: ChatCompletionInput,
    messages: OpenRouterMessage[]
  ): OpenRouterPayload {
    const model = input.model || this.defaultModel;
    const params = { ...this.defaultParams, ...input.params };

    const payload: OpenRouterPayload = {
      model,
      messages,
      ...params,
    };

    // Add response_format if provided
    if (input.responseFormat) {
      payload.response_format = input.responseFormat;
    }

    return payload;
  }

  /**
   * Sends request to OpenRouter API with retry logic
   * 
   * @param payload - API payload
   * @returns API response
   * @throws Various errors based on failure type
   */
  private async sendRequestWithRetry(payload: OpenRouterPayload): Promise<OpenRouterResponse> {
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt < this.maxRetries) {
      attempt++;

      try {
        return await this.sendRequest(payload);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on auth errors or invalid payload
        if (error instanceof AuthError || error instanceof InvalidPayloadError) {
          throw error;
        }

        // Don't retry on rate limit without retry-after
        if (error instanceof RateLimitError && !error.retryAfter) {
          throw error;
        }

        // Log retry attempt
        if (attempt < this.maxRetries) {
          const delay = this.calculateBackoff(attempt);
          this.logger.warn(`Request failed, retrying in ${delay}ms`, {
            attempt,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw lastError || new UpstreamError('All retry attempts failed');
  }

  /**
   * Sends a single request to OpenRouter API
   * 
   * @param payload - API payload
   * @returns API response
   * @throws Various errors based on failure type
   */
  private async sendRequest(payload: OpenRouterPayload): Promise<OpenRouterResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:4321',
          'X-Title': 'FlashCardsMemory',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle error responses
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data as OpenRouterResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${this.timeoutMs}ms`);
      }

      throw error;
    }
  }

  /**
   * Handles error responses from OpenRouter API
   * 
   * @param response - Fetch response object
   * @throws Appropriate error based on status code
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const statusCode = response.status;
    let errorMessage = `OpenRouter API error: ${statusCode}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }

    // Map status codes to error types
    if (statusCode === 401 || statusCode === 403) {
      throw new AuthError(errorMessage);
    }

    if (statusCode === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(
        errorMessage,
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    }

    if (statusCode >= 500) {
      throw new UpstreamError(errorMessage, statusCode);
    }

    throw new UpstreamError(errorMessage, statusCode);
  }

  /**
   * Maps OpenRouter response to ChatCompletionResult
   * 
   * @param response - OpenRouter API response
   * @param schema - Optional JSON Schema for validation
   * @returns Mapped chat completion result
   * @throws {EmptyResponseError} If response is empty
   * @throws {SchemaValidationError} If schema validation fails
   */
  private mapResponse<T>(
    response: OpenRouterResponse,
    schema?: JsonSchema
  ): ChatCompletionResult<T> {
    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new EmptyResponseError('No content received from OpenRouter API');
    }

    let parsedContent: T;

    // If schema is provided, parse and validate JSON
    if (schema) {
      try {
        const jsonData = JSON.parse(content);
        parsedContent = this.validateResponseSchema<T>(jsonData, schema);
      } catch (error) {
        if (error instanceof SchemaValidationError) {
          throw error;
        }
        throw new SchemaValidationError(
          'Failed to parse or validate JSON response',
          undefined,
          error
        );
      }
    } else {
      parsedContent = content as T;
    }

    return {
      content: parsedContent,
      model: response.model,
      usage: response.usage,
    };
  }

  /**
   * Calculates exponential backoff delay
   * 
   * @param attempt - Current attempt number
   * @returns Delay in milliseconds
   */
  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000;
    const maxDelay = 10000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    return delay;
  }

  /**
   * Sleep utility
   * 
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Masks API key for safe logging
   * 
   * @param apiKey - API key to mask
   * @returns Masked API key
   */
  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
      return '***';
    }
    return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  }
}
