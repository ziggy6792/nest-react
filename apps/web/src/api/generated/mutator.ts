export const customInstance = async <T>(config: RequestInit, url: string): Promise<T> => {
  const response = await fetch(`http://localhost:3000${url}`, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }

  return response.json();
};

