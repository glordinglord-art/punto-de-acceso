const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

function resolveApiBaseUrl(rawUrl?: string): string {
  const base = (rawUrl ?? DEFAULT_API_BASE_URL).trim().replace(/\/$/, '');

  // If the env var points to the API domain root, ensure the expected Nest prefix exists.
  if (/\/api\/v1$/i.test(base)) {
    return base;
  }

  return `${base}/api/v1`;
}

const API_BASE_URL = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = typeof window !== 'undefined' ? localStorage.getItem('ob_token') : null;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || 'Error en la solicitud');
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
