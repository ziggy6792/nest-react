import { oc } from '@orpc/contract';
import { type } from 'arktype';
import { users } from '../server/db/schema';
import { createSelectSchema , createInsertSchema } from 'drizzle-arktype';

const userSelectSchema = createSelectSchema(users);
const userInsertSchema = createInsertSchema(users);

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
        type({
          params: type({
            id: 'string',
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
        type({
          body: userInsertSchema,
        }),
      )
      .output(userSelectSchema),
  },
};
