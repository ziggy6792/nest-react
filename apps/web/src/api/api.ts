import * as users from './generated/users/users';
import * as app from './generated/app/app';

// Create the nested API structure with proper typing
export const api = {
  users: {
    list: {
      useQuery: users.useUsersControllerList,
      queryKey: users.getUsersControllerListQueryKey,
      call: users.usersControllerList,
    },
    byId: {
      useQuery: users.useUsersControllerById,
      queryKey: users.getUsersControllerByIdQueryKey,
      call: users.usersControllerById,
    },
    add: {
      useMutation: users.useUsersControllerAdd,
      call: users.usersControllerAdd,
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
