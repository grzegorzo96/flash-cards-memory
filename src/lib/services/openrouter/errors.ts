/**
 * OpenRouter service error classes
 */

/**
 * Base error class for OpenRouter service
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

/**
 * Configuration error (missing API key, invalid config)
 */
export class ConfigurationError extends OpenRouterError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'CONFIGURATION_ERROR', originalError);
    this.name = 'ConfigurationError';
  }
}

/**
 * Authentication error (401, 403)
 */
export class AuthError extends OpenRouterError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'AUTH_ERROR', originalError);
    this.name = 'AuthError';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends OpenRouterError {
  constructor(message: string, public retryAfter?: number, originalError?: unknown) {
    super(message, 'RATE_LIMIT_ERROR', originalError);
    this.name = 'RateLimitError';
  }
}

/**
 * Upstream service error (5xx)
 */
export class UpstreamError extends OpenRouterError {
  constructor(message: string, public statusCode?: number, originalError?: unknown) {
    super(message, 'UPSTREAM_ERROR', originalError);
    this.name = 'UpstreamError';
  }
}

/**
 * Schema validation error
 */
export class SchemaValidationError extends OpenRouterError {
  constructor(message: string, public validationErrors?: unknown, originalError?: unknown) {
    super(message, 'SCHEMA_VALIDATION_ERROR', originalError);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends OpenRouterError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'TIMEOUT_ERROR', originalError);
    this.name = 'TimeoutError';
  }
}

/**
 * Invalid payload error
 */
export class InvalidPayloadError extends OpenRouterError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'INVALID_PAYLOAD_ERROR', originalError);
    this.name = 'InvalidPayloadError';
  }
}

/**
 * Empty response error
 */
export class EmptyResponseError extends OpenRouterError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'EMPTY_RESPONSE_ERROR', originalError);
    this.name = 'EmptyResponseError';
  }
}
