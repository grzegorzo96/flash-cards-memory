import type { Logger } from './types';

/**
 * Request context for logging
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  model?: string;
  timestamp?: string;
}

/**
 * Enhanced logger with request tracking and monitoring capabilities
 */
export class OpenRouterLogger implements Logger {
  private context?: RequestContext;

  /**
   * Sets the request context for subsequent log entries
   * 
   * @param context - Request context information
   */
  setContext(context: RequestContext): void {
    this.context = context;
  }

  /**
   * Clears the request context
   */
  clearContext(): void {
    this.context = undefined;
  }

  /**
   * Logs an info message
   * 
   * @param message - Log message
   * @param meta - Additional metadata
   */
  info(message: string, meta?: Record<string, unknown>): void {
    const logEntry = this.buildLogEntry('INFO', message, meta);
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Logs a warning message
   * 
   * @param message - Log message
   * @param meta - Additional metadata
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    const logEntry = this.buildLogEntry('WARN', message, meta);
    console.warn(JSON.stringify(logEntry));
  }

  /**
   * Logs an error message
   * 
   * @param message - Log message
   * @param meta - Additional metadata
   */
  error(message: string, meta?: Record<string, unknown>): void {
    const logEntry = this.buildLogEntry('ERROR', message, meta);
    console.error(JSON.stringify(logEntry));
  }

  /**
   * Logs request metrics for monitoring
   * 
   * @param metrics - Request metrics
   */
  logMetrics(metrics: {
    requestId: string;
    model: string;
    duration: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    success: boolean;
    errorCode?: string;
  }): void {
    const logEntry = {
      level: 'METRICS',
      timestamp: new Date().toISOString(),
      service: 'OpenRouter',
      ...metrics,
    };
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Builds a structured log entry
   * 
   * @param level - Log level
   * @param message - Log message
   * @param meta - Additional metadata
   * @returns Structured log entry
   */
  private buildLogEntry(
    level: 'INFO' | 'WARN' | 'ERROR',
    message: string,
    meta?: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      level,
      timestamp: new Date().toISOString(),
      service: 'OpenRouter',
      message,
      ...(this.context && { context: this.context }),
      ...(meta && { meta: this.sanitizeMeta(meta) }),
    };
  }

  /**
   * Sanitizes metadata to remove sensitive information
   * 
   * @param meta - Metadata to sanitize
   * @returns Sanitized metadata
   */
  private sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...meta };

    // Mask API keys
    if (sanitized.apiKey && typeof sanitized.apiKey === 'string') {
      sanitized.apiKey = this.maskString(sanitized.apiKey);
    }

    // Mask authorization headers
    if (sanitized.Authorization && typeof sanitized.Authorization === 'string') {
      sanitized.Authorization = this.maskString(sanitized.Authorization);
    }

    // Don't log full user messages (can be long)
    if (sanitized.userMessage && typeof sanitized.userMessage === 'string') {
      const message = sanitized.userMessage;
      if (message.length > 100) {
        sanitized.userMessage = `${message.substring(0, 100)}... (${message.length} chars)`;
      }
    }

    return sanitized;
  }

  /**
   * Masks a string for safe logging
   * 
   * @param value - String to mask
   * @returns Masked string
   */
  private maskString(value: string): string {
    if (value.length <= 8) {
      return '***';
    }
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }
}

/**
 * Generates a unique request ID
 * 
 * @returns Unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
