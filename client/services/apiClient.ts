/**
 * Typed API client for DevLog.
 *
 * Centralises:
 *  - Auth header injection
 *  - JSON serialisation / deserialisation
 *  - Normalised error messages
 *  - AbortController support (pass a signal to cancel in-flight requests)
 *
 * Usage:
 *   import { apiClient } from './apiClient';
 *   const data = await apiClient.get<MyType>('/entries');
 *   const created = await apiClient.post<MyType>('/entries', body);
 */

import { API_URL } from '../constants';

// ─── Types ───────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  signal?: AbortSignal;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const userStr = localStorage.getItem('user');
  if (!userStr) return { 'Content-Type': 'application/json' };
  try {
    const { token } = JSON.parse(userStr);
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as any).message)
        : `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, message, body);
  }

  return body as T;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: options.signal,
    }).then(handleResponse<T>);
  },

  post<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      signal: options.signal,
    }).then(handleResponse<T>);
  },

  put<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    return fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      signal: options.signal,
    }).then(handleResponse<T>);
  },

  delete<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
    return fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      signal: options.signal,
    }).then(handleResponse<T>);
  },
};
