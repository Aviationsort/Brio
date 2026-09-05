/**
 * Centralized Error Handler Utility for Brio
 * Provides error categorization, rate-limited toasts, retry logic,
 * user-friendly messages, and structured console logging.
 */

import type { ErrorCategory, BrioError, RetryOptions, ErrorHandlerOptions, RateLimitEntry } from '../types';
export type { ErrorCategory, BrioError, RetryOptions, ErrorHandlerOptions, RateLimitEntry } from '../types';

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 8000,
  backoffFactor: 2,
  retryableCategories: ['network', 'storage'],
};

const RATE_LIMIT_WINDOW_MS = 5000;
const MAX_TOASTS_PER_CATEGORY_PER_WINDOW = 1;

const rateLimitMap = new Map<string, RateLimitEntry>();

function getRateLimitKey(category: ErrorCategory): string {
  return `error-toast-${category}`;
}

function canShowRateLimitedToast(category: ErrorCategory): boolean {
  const key = getRateLimitKey(category);
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.lastShown > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { lastShown: now, count: 1 });
    return true;
  }

  if (entry.count >= MAX_TOASTS_PER_CATEGORY_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (
      name.includes('network') ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed to fetch') ||
      message.includes('networkrequestfailed') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('internet') ||
      message.includes('offline')
    ) {
      return 'network';
    }

    if (
      name.includes('auth') ||
      name.includes('authentication') ||
      message.includes('auth') ||
      message.includes('token') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('login') ||
      message.includes('signup') ||
      message.includes('session') ||
      message.includes('invalid credentials') ||
      message.includes('password')
    ) {
      return 'auth';
    }

    if (
      name.includes('crypto') ||
      message.includes('crypto') ||
      message.includes('encrypt') ||
      message.includes('decrypt') ||
      message.includes('key') ||
      message.includes('hash') ||
      message.includes('aes') ||
      message.includes('pbkdf2') ||
      message.includes('subtle') ||
      message.includes('checksum') ||
      message.includes('integrity')
    ) {
      return 'crypto';
    }

    if (
      name.includes('storage') ||
      message.includes('storage') ||
      message.includes('quota') ||
      message.includes('disk') ||
      message.includes('file') ||
      message.includes('database') ||
      message.includes('db') ||
      message.includes('localstorage') ||
      message.includes('indexeddb') ||
      message.includes('export') ||
      message.includes('import') ||
      message.includes('backup')
    ) {
      return 'storage';
    }

    if (
      name.includes('validation') ||
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('missing') ||
      message.includes('format') ||
      message.includes('parse') ||
      message.includes('schema')
    ) {
      return 'validation';
    }
  }

  return 'unknown';
}

const FRIENDLY_MESSAGES: Record<ErrorCategory, { title: string; description: string }> = {
  network: {
    title: 'Connection Issue',
    description: 'Unable to reach the server. Please check your internet connection and try again.',
  },
  auth: {
    title: 'Authentication Error',
    description: 'Your session could not be verified. Please sign in again.',
  },
  crypto: {
    title: 'Encryption Error',
    description: 'A security operation failed. Your data remains protected. Please try again.',
  },
  storage: {
    title: 'Storage Error',
    description: 'Could not access your vault. Please check available space and try again.',
  },
  validation: {
    title: 'Invalid Input',
    description: 'Some information was not recognized. Please review and try again.',
  },
  unknown: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again later.',
  },
};

export interface HandleErrorResult {
  handled: boolean;
  shouldRetry: boolean;
  retryAfterMs?: number;
  toastShown: boolean;
}

export function createBrioError(error: unknown, category?: ErrorCategory): BrioError {
  const err = error instanceof Error ? error : new Error(String(error));
  const resolvedCategory = category || categorizeError(error);

  const brioError = err as BrioError;
  brioError.category = resolvedCategory;
  brioError.code = (error as any)?.code || brioError.code;
  brioError.isRetryable = resolvedCategory === 'network' || resolvedCategory === 'storage';
  brioError.originalError = error;
  brioError.timestamp = Date.now();

  return brioError;
}

export function getUserFriendlyMessage(error: unknown, category?: ErrorCategory): { title: string; description: string } {
  const resolvedCategory = category || categorizeError(error);
  return FRIENDLY_MESSAGES[resolvedCategory];
}

export function formatErrorForConsole(error: unknown): void {
  const brioError = createBrioError(error);
  const timestamp = new Date().toISOString();

  console.group(`[Brio Error] ${timestamp}`);
  console.error(`Category: ${brioError.category}`);
  console.error(`Message: ${brioError.message}`);
  if (brioError.code) {
    console.error(`Code: ${brioError.code}`);
  }
  if (brioError.originalError && brioError.originalError !== error) {
    console.error('Original Error:', brioError.originalError);
  }
  console.groupEnd();
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {},
  category?: ErrorCategory
): Promise<T> {
  const opts: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const brioError = createBrioError(error, category);
      const resolvedCategory = brioError.category;

      if (!opts.retryableCategories.includes(resolvedCategory) || attempt === opts.maxRetries) {
        throw brioError;
      }

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelayMs
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw createBrioError(lastError, category);
}

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): HandleErrorResult {
  const {
    showToast = true,
    logToConsole = true,
    reportCritical = true,
  } = options;

  const brioError = createBrioError(error);
  const category = brioError.category;

  if (logToConsole) {
    formatErrorForConsole(error);
  }

  if (reportCritical && category === 'crypto') {
    console.warn('[Brio] Critical error detected. Consider reporting this issue.');
  }

  let toastShown = false;

  if (showToast) {
    toastShown = canShowRateLimitedToast(category);
  }

  return {
    handled: true,
    shouldRetry: brioError.isRetryable || false,
    toastShown,
  };
}

export function getRetryDelay(attempt: number, options: Partial<RetryOptions> = {}): number {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  return Math.min(opts.baseDelayMs * Math.pow(opts.backoffFactor, attempt), opts.maxDelayMs);
}

export function isRetryable(error: unknown, retryableCategories: ErrorCategory[] = DEFAULT_RETRY_OPTIONS.retryableCategories): boolean {
  const brioError = createBrioError(error);
  return retryableCategories.includes(brioError.category);
}
