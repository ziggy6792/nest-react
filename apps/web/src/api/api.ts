import {
  useUsersControllerList,
  useUsersControllerById,
  useUsersControllerAdd,
  getUsersControllerListQueryKey,
  getUsersControllerByIdQueryKey,
  usersControllerList,
} from './generated/users/users';
import { useAppControllerGetHello, getAppControllerGetHelloQueryKey } from './generated/app/app';

// Create the nested API structure with proper typing
export const api = {
  users: {
    list: {
      useQuery: useUsersControllerList,
      queryKey: getUsersControllerListQueryKey,
      getUsersList: usersControllerList,
    },
    byId: {
      useQuery: useUsersControllerById,
      queryKey: getUsersControllerByIdQueryKey,
    },
    add: {
      useMutation: useUsersControllerAdd,
    },
  },
  app: {
    getHello: {
      useQuery: useAppControllerGetHello,
      queryKey: getAppControllerGetHelloQueryKey,
    },
  },
} as const;

export default api;
