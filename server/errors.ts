/**
 * Centralized, standardized error handling for the Brio API.
 *
 * Every error returned to clients uses a single, predictable JSON shape:
 *   { error: { code: string, message: string, requestId: string } }
 *
 * Internal details (stack traces, raw DB errors, IPs, etc.) are logged with
 * full verbosity but NEVER leaked to the client to avoid information
 * disclosure. The public `message` is always friendly and non-revealing.
 */

import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  status: number;
  code: string;
  publicMessage: string;
  internal: unknown;

  constructor(status: number, code: string, publicMessage: string, internal?: unknown) {
    super(publicMessage);
    this.status = status;
    this.code = code;
    this.publicMessage = publicMessage;
    this.internal = internal;
  }
}

// Generic, safe message shown for any unexpected server failure.
const GENERIC_MESSAGE = 'An unexpected error occurred. Please try again later.';

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  (req as any).requestId = crypto.randomUUID();
  next();
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req as any).requestId || crypto.randomUUID();

  if (err instanceof ApiError) {
    // Expected, application-level error. Log with controlled detail.
    console.error(
      `[API ${err.status}] code=${err.code} requestId=${requestId} ip=${req.ip} path=${req.path} :: ${String(
        err.internal ?? err.message
      )}`
    );
    res.status(err.status).json({
      error: { code: err.code, message: err.publicMessage, requestId },
    });
    return;
  }

  // Unexpected error — never expose internals.
  const detail = err instanceof Error ? `${err.message}\n${err.stack || ''}` : String(err);
  console.error(`[API 500] requestId=${requestId} ip=${req.ip} path=${req.path} :: ${detail}`);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: GENERIC_MESSAGE, requestId },
  });
  return;
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

/**
 * Normalize an unknown thrown value into a public-friendly message + code.
 * Used by endpoints that wrap their own try/catch (e.g. proxies).
 */
export function toPublicError(err: unknown): { code: string; message: string } {
  if (err instanceof ApiError) {
    return { code: err.code, message: err.publicMessage };
  }
  return { code: 'INTERNAL_ERROR', message: GENERIC_MESSAGE };
}
