/**
 * OpenRouter service exports
 */

export { OpenRouterService } from './OpenRouterService';

export type {
  OpenRouterConfig,
  ChatCompletionInput,
  ChatCompletionResult,
  ModelParams,
  OpenRouterMessage,
  OpenRouterPayload,
  OpenRouterResponse,
  JsonSchema,
  JsonSchemaResponseFormat,
  Logger,
  JsonSchemaValidator,
} from './types';

export {
  OpenRouterError,
  ConfigurationError,
  AuthError,
  RateLimitError,
  UpstreamError,
  SchemaValidationError,
  TimeoutError,
  InvalidPayloadError,
  EmptyResponseError,
} from './errors';

export { OpenRouterLogger, generateRequestId } from './logger';
export type { RequestContext } from './logger';
