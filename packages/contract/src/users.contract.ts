import { z } from 'zod';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const User = z.object({
  id: z.number(),
  name: z.string(),
});

export const CreateUser = z.object({
  name: z.string().min(1),
});

export const users = c.router(
  {
    list: {
      method: 'GET',
      path: '/users',
      responses: { 200: z.array(User) },
    },
    byId: {
      method: 'GET',
      path: '/users/:id',
      pathParams: z.object({ id: z.string() }),
      responses: { 200: User },
    },
    add: {
      method: 'POST',
      path: '/users',
      body: CreateUser,
      responses: { 201: User },
    },
  },
  { pathPrefix: '/api' }
);
