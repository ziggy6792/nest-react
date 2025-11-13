import { oc } from '@orpc/contract';
import { type } from 'arktype';

export const User = type({
  id: 'number',
  name: 'string',
});

export const CreateUser = type({
  name: 'string>0',
});

export const contract = {
  users: {
    list: oc
      .route({
        method: 'GET',
        path: '/users',
      })
      .output(User.array()),
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
      .output(User),
    add: oc
      .route({
        method: 'POST',
        path: '/users',
      })
      .input(
        type({
          body: CreateUser,
        }),
      )
      .output(User),
  },
};

