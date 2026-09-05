/**
 * Client-side API client for the Brio server.
 *
 * All error responses follow a single standardized shape:
 *   { error: { code: string, message: string, requestId: string } }
 * The client only ever surfaces `error.message` (friendly, non-revealing) and
 * attaches `error.code` for any caller-specific handling. Raw server details
 * are never propagated to the UI.
 */

const BASE = '';

interface StandardError {
  code?: string;
  message?: string;
}

export class ApiRequestError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: optionHeaders, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(optionHeaders || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let publicMessage = `Request failed (${res.status})`;
      let code = 'UNKNOWN';
      try {
        const body = (await res.json()) as { error?: StandardError };
        if (body?.error) {
          publicMessage = body.error.message || publicMessage;
          code = body.error.code || code;
        }
      } catch {
        /* non-JSON error body — keep default message */
      }
      throw new ApiRequestError(publicMessage, code, res.status);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new ApiRequestError('Request timed out. Please check your connection and try again.', 'TIMEOUT', 0);
    }
    throw err;
  }
}

export interface AuthResult {
  ok: boolean;
  token: string;
  user: { username: string; email: string };
}

export const apiClient = {
  async dbStatus(): Promise<{ status: string }> {
    return http<{ status: string }>('/api/db-status');
  },

  auth: {
    async signup(username: string, email: string, password: string): Promise<AuthResult> {
      return http<AuthResult>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
    },

    async login(username: string, password: string): Promise<AuthResult> {
      return http<AuthResult>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    },

    async logout(token: string): Promise<void> {
      await http<{ ok: boolean }>('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },

    async session(token: string): Promise<{ ok: boolean; user: { username: string; email: string } }> {
      return http<{ ok: boolean; user: { username: string; email: string } }>('/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },

  vault: {
    async get(username: string, token: string): Promise<string | null> {
      const res = await http<{ data: string | null }>(`/api/vault/${encodeURIComponent(username)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data || null;
    },

    async put(username: string, token: string, data: string): Promise<void> {
      await http<{ ok: boolean }>(`/api/vault/${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data }),
      });
    },
  },
};
