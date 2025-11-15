export const customInstance = async <T>(
  config: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    data?: unknown;
    signal?: AbortSignal;
  },
  options?: RequestInit,
): Promise<T> => {
  const { url, method, headers, data, signal } = config;

  const response = await fetch(`http://localhost:3000${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    signal,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }

  return response.json();
};


