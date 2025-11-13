import { oc } from '@orpc/contract';
import { users } from '../server/db/schema';
import { createSelectSchema , createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

const userSelectSchema = createSelectSchema(users);
const userInsertSchema = createInsertSchema(users);

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
      .output(userSelectSchema.array()),
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
      .output(userSelectSchema),
    add: oc
      .route({
        method: 'POST',
        path: '/users',
      })
      .input(
        z.object({
          body: userInsertSchema,
        }),
      )
      .output(userSelectSchema),
  },
};
