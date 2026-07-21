import { applyApiErrorPolicy } from './errorPolicy';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  token?: string;
  headers?: Record<string, string>;
}

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const API_BASE_URL = rawApiBaseUrl && rawApiBaseUrl !== '/' ? rawApiBaseUrl.replace(/\/+$/, '') : '';

function buildRequestUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedPath.slice(4)}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

export async function requestJson<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const hasBody = options.body !== undefined;
  const response = await fetch(buildRequestUrl(path), {
    method: options.method ?? 'GET',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    },
    body: hasBody ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    applyApiErrorPolicy(response.status);
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as TResponse;
}
