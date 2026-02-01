import { describe, it, expect } from 'vitest';
import {
  OpenRouterError,
  ConfigurationError,
  AuthError,
  RateLimitError,
  UpstreamError,
  SchemaValidationError,
  TimeoutError,
  InvalidPayloadError,
  EmptyResponseError,
} from '@/lib/services/openrouter/errors';

describe('OpenRouter Error Classes', () => {
  describe('OpenRouterError (Base Class)', () => {
    it('should create error with message, code, and originalError', () => {
      // Arrange
      const originalError = new Error('Original');

      // Act
      const error = new OpenRouterError('Test message', 'TEST_CODE', originalError);

      // Assert
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('OpenRouterError');
    });

    it('should create error without originalError', () => {
      // Act
      const error = new OpenRouterError('Test message', 'TEST_CODE');

      // Assert
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.originalError).toBeUndefined();
    });

    it('should be instanceof Error', () => {
      // Act
      const error = new OpenRouterError('Test', 'CODE');

      // Assert
      expect(error).toBeInstanceOf(Error);
    });

    it('should be instanceof OpenRouterError', () => {
      // Act
      const error = new OpenRouterError('Test', 'CODE');

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
    });
  });

  describe('ConfigurationError', () => {
    it('should create error with CONFIGURATION_ERROR code', () => {
      // Act
      const error = new ConfigurationError('Missing API key');

      // Assert
      expect(error.message).toBe('Missing API key');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.name).toBe('ConfigurationError');
    });

    it('should inherit from OpenRouterError', () => {
      // Act
      const error = new ConfigurationError('Test');

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(ConfigurationError);
    });

    it('should store originalError', () => {
      // Arrange
      const originalError = new Error('Original config error');

      // Act
      const error = new ConfigurationError('Config failed', originalError);

      // Assert
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('AuthError', () => {
    it('should create error with AUTH_ERROR code', () => {
      // Act
      const error = new AuthError('Unauthorized');

      // Assert
      expect(error.message).toBe('Unauthorized');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.name).toBe('AuthError');
    });

    it('should inherit from OpenRouterError', () => {
      // Act
      const error = new AuthError('Test');

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(AuthError);
    });

    it('should store originalError', () => {
      // Arrange
      const originalError = { status: 401, message: 'Invalid token' };

      // Act
      const error = new AuthError('Auth failed', originalError);

      // Assert
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('RateLimitError', () => {
    it('should create error with RATE_LIMIT_ERROR code', () => {
      // Act
      const error = new RateLimitError('Too many requests');

      // Assert
      expect(error.message).toBe('Too many requests');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.name).toBe('RateLimitError');
    });

    it('should store retryAfter value', () => {
      // Act
      const error = new RateLimitError('Rate limited', 60);

      // Assert
      expect(error.retryAfter).toBe(60);
    });

    it('should handle undefined retryAfter', () => {
      // Act
      const error = new RateLimitError('Rate limited');

      // Assert
      expect(error.retryAfter).toBeUndefined();
    });

    it('should store originalError with retryAfter', () => {
      // Arrange
      const originalError = { headers: { 'retry-after': '60' } };

      // Act
      const error = new RateLimitError('Rate limited', 60, originalError);

      // Assert
      expect(error.retryAfter).toBe(60);
      expect(error.originalError).toBe(originalError);
    });

    it('should inherit from OpenRouterError', () => {
      // Act
      const error = new RateLimitError('Test', 30);

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(RateLimitError);
    });
  });

  describe('UpstreamError', () => {
    it('should create error with UPSTREAM_ERROR code', () => {
      // Act
      const error = new UpstreamError('Service unavailable');

      // Assert
      expect(error.message).toBe('Service unavailable');
      expect(error.code).toBe('UPSTREAM_ERROR');
      expect(error.name).toBe('UpstreamError');
    });

    it('should store statusCode', () => {
      // Act
      const error = new UpstreamError('Server error', 503);

      // Assert
      expect(error.statusCode).toBe(503);
    });

    it('should handle undefined statusCode', () => {
      // Act
      const error = new UpstreamError('Unknown error');

      // Assert
      expect(error.statusCode).toBeUndefined();
    });

    it('should store originalError with statusCode', () => {
      // Arrange
      const originalError = { response: { status: 502 } };

      // Act
      const error = new UpstreamError('Gateway error', 502, originalError);

      // Assert
      expect(error.statusCode).toBe(502);
      expect(error.originalError).toBe(originalError);
    });

    it('should inherit from OpenRouterError', () => {
      // Act
      const error = new UpstreamError('Test', 500);

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(UpstreamError);
    });
  });

  describe('SchemaValidationError', () => {
    it('should create error with SCHEMA_VALIDATION_ERROR code', () => {
      // Act
      const error = new SchemaValidationError('Invalid schema');

      // Assert
      expect(error.message).toBe('Invalid schema');
      expect(error.code).toBe('SCHEMA_VALIDATION_ERROR');
      expect(error.name).toBe('SchemaValidationError');
    });

    it('should store validationErrors', () => {
      // Arrange
      const validationErrors = [
        { field: 'flashcards', message: 'Required' },
        { field: 'question', message: 'Must be string' },
      ];

      // Act
      const error = new SchemaValidationError('Validation failed', validationErrors);

      // Assert
      expect(error.validationErrors).toEqual(validationErrors);
    });

    it('should handle undefined validationErrors', () => {
      // Act
      const error = new SchemaValidationError('Validation failed');

      // Assert
      expect(error.validationErrors).toBeUndefined();
    });

    it('should store originalError with validationErrors', () => {
      // Arrange
      const validationErrors = { errors: ['field required'] };
      const originalError = new Error('Zod validation failed');

      // Act
      const error = new SchemaValidationError(
        'Schema invalid',
        validationErrors,
        originalError
      );

      // Assert
      expect(error.validationErrors).toBe(validationErrors);
      expect(error.originalError).toBe(originalError);
    });

    it('should inherit from OpenRouterError', () => {
      // Act
      const error = new SchemaValidationError('Test');

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(SchemaValidationError);
    });
  });

  describe('TimeoutError', () => {
    it('should create error with TIMEOUT_ERROR code', () => {
      // Act
      const error = new TimeoutError('Request timeout');

      // Assert
      expect(error.message).toBe('Request timeout');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.name).toBe('TimeoutError');
    });

    it('should inherit from OpenRouterError', () => {
      // Act
      const error = new TimeoutError('Test');

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(TimeoutError);
    });

    it('should store originalError', () => {
      // Arrange
      const originalError = new Error('ETIMEDOUT');

      // Act
      const error = new TimeoutError('Timeout occurred', originalError);

      // Assert
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('InvalidPayloadError', () => {
    it('should create error with INVALID_PAYLOAD_ERROR code', () => {
      // Act
      const error = new InvalidPayloadError('Invalid payload');

      // Assert
      expect(error.message).toBe('Invalid payload');
      expect(error.code).toBe('INVALID_PAYLOAD_ERROR');
      expect(error.name).toBe('InvalidPayloadError');
    });

    it('should inherit from OpenRouterError', () => {
      // Act
      const error = new InvalidPayloadError('Test');

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(InvalidPayloadError);
    });

    it('should store originalError', () => {
      // Arrange
      const originalError = { payload: 'invalid' };

      // Act
      const error = new InvalidPayloadError('Payload invalid', originalError);

      // Assert
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('EmptyResponseError', () => {
    it('should create error with EMPTY_RESPONSE_ERROR code', () => {
      // Act
      const error = new EmptyResponseError('Empty response');

      // Assert
      expect(error.message).toBe('Empty response');
      expect(error.code).toBe('EMPTY_RESPONSE_ERROR');
      expect(error.name).toBe('EmptyResponseError');
    });

    it('should inherit from OpenRouterError', () => {
      // Act
      const error = new EmptyResponseError('Test');

      // Assert
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(EmptyResponseError);
    });

    it('should store originalError', () => {
      // Arrange
      const originalError = { response: null };

      // Act
      const error = new EmptyResponseError('No response', originalError);

      // Assert
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('Error hierarchy and instanceof checks', () => {
    it('should allow catching specific error types', () => {
      // Arrange
      const errors = [
        new ConfigurationError('Config'),
        new AuthError('Auth'),
        new RateLimitError('Rate'),
        new UpstreamError('Upstream'),
        new SchemaValidationError('Schema'),
        new TimeoutError('Timeout'),
        new InvalidPayloadError('Payload'),
        new EmptyResponseError('Empty'),
      ];

      // Act & Assert
      errors.forEach((error) => {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('should allow catching all OpenRouter errors', () => {
      // Arrange
      const throwError = (type: string) => {
        switch (type) {
          case 'config':
            throw new ConfigurationError('Config error');
          case 'auth':
            throw new AuthError('Auth error');
          case 'rate':
            throw new RateLimitError('Rate error');
          default:
            throw new Error('Unknown');
        }
      };

      // Act & Assert
      try {
        throwError('config');
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect(error).toBeInstanceOf(ConfigurationError);
      }

      try {
        throwError('auth');
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect(error).toBeInstanceOf(AuthError);
      }
    });
  });

  describe('Error serialization', () => {
    it('should serialize error message', () => {
      // Arrange
      const error = new ConfigurationError('API key missing');

      // Act
      const serialized = error.toString();

      // Assert
      expect(serialized).toContain('API key missing');
    });

    it('should include error properties in object', () => {
      // Arrange
      const error = new RateLimitError('Rate limited', 120);

      // Act & Assert
      expect(error.message).toBe('Rate limited');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.retryAfter).toBe(120);
      expect(error.name).toBe('RateLimitError');
    });
  });
});
