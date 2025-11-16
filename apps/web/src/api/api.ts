import * as users from './generated/users/users';
import * as app from './generated/app/app';

// Create the nested API structure with proper typing
export const api = {
  users: {
    findAll: {
      useQuery: users.useUsersControllerFindAll,
      queryKey: users.getUsersControllerFindAllQueryKey,
      call: users.usersControllerFindAll,
    },
    findOne: {
      useQuery: users.useUsersControllerFindOne,
      queryKey: users.getUsersControllerFindOneQueryKey,
      call: users.usersControllerFindOne,
    },
    findNames: {
      useQuery: users.useUsersControllerFindNames,
      queryKey: users.getUsersControllerFindNamesQueryKey,
      call: users.usersControllerFindNames,
    },
    create: {
      useMutation: users.useUsersControllerCreate,
      call: users.usersControllerCreate,
    },
  },
  app: {
    getHello: {
      useQuery: app.useAppControllerGetHello,
      queryKey: app.getAppControllerGetHelloQueryKey,
      call: app.appControllerGetHello,
    },
  },
} as const;

export default api;
