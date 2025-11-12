import { initQueryClient } from '@ts-rest/react-query';
import { initClient } from '@ts-rest/core';
import { users } from '@contract/users.contract';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Export hooks directly - no wrapping to preserve types
export const usersHooks = initQueryClient(users, {
  baseUrl: API_BASE,
  baseHeaders: {},
});

// Raw client for prefetch/fetch in utils
export const usersClient = initClient(users, {
  baseUrl: API_BASE,
});
