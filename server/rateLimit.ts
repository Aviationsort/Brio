/**
 * Lightweight, IP-bounded rate limiter for the auth endpoints.
 *
 * Uses a fixed-window counter per IP (plus an optional sub-key such as the
 * route name) held in process memory. This is sufficient for a single node
 * and prevents brute-force / credential-stuffing / spam-account abuse at the
 * edge. Under LiteFS each node enforces its own limiter (per-node, in-memory);
 * for globally shared counters you would back this with the replicated SQLite
 * store or a shared KV — see README. When the limit is exceeded a sanitized
 * 429 is returned with a Retry-After hint.
 */

import type { Request, Response, NextFunction } from 'express';
import { ApiError } from './errors';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
  // Public-friendly message shown when throttled.
  message: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function getClientIp(req: Request): string {
  // Honor X-Forwarded-For when behind a trusted proxy (Fly/LiteFS). Take the
  // first hop only to avoid spoofing via stacked headers.
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix, message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = getClientIp(req);
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (bucket.count > max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return next(
        new ApiError(429, 'RATE_LIMITED', message, {
          ip,
          keyPrefix,
          retryAfterSec,
        })
      );
    }

    next();
  };
}

// Configs tuned to blunt automation while staying usable for humans.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per IP / 15 min
  keyPrefix: 'login',
  message: 'Too many login attempts. Please wait a few minutes and try again.',
});

export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 account creations per IP / hour
  keyPrefix: 'signup',
  message: 'Account creation is temporarily limited. Please try again later.',
});
