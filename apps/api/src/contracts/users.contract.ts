import { oc } from '@orpc/contract';
import { z } from 'zod';

export const User = z.object({
  id: z.number(),
  name: z.string(),
});

export const CreateUser = z.object({
  name: z.string().min(1),
});

export const contract = {
  users: {
    list: oc
      .route({
        method: 'GET',
        path: '/users',
      })
      .output(z.array(User)),
    byId: oc
      .route({
        method: 'GET',
        path: '/users/:id',
      })
      .input(
        z.object({
          params: z.object({
            id: z.string(),
          }),
        }),
      )
      .output(User),
    add: oc
      .route({
        method: 'POST',
        path: '/users',
      })
      .input(
        z.object({
          body: CreateUser,
        }),
      )
      .output(User),
  },
};

