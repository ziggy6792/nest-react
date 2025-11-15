import axios, { type AxiosRequestConfig } from 'axios';

export const customInstance = async <T>(
  config: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    data?: unknown;
    signal?: AbortSignal;
  },
  options?: AxiosRequestConfig,
): Promise<T> => {
  const { url, method, headers, data, signal } = config;

  const axiosConfig: AxiosRequestConfig = {
    url: `http://localhost:3001${url}`,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options?.headers,
    },
    data,
    signal,
    ...options,
  };

  const response = await axios.request<T>(axiosConfig);
  return response.data;
};


