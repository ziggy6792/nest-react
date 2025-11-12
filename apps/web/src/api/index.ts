import { usersHooks, usersClient } from './tsr';
import { users as usersContract } from '@contract/users.contract';
import { createUtils, withKey } from './create-utils';
import { queryClient } from '../query-client';

/**
 * Users API with hooks and auto-generated utils.
 * Hooks are automatically wrapped to inject query keys - no manual key passing needed!
 * Utils are auto-generated from router structure - zero manual setup!
 */
const utils = createUtils(usersContract, usersHooks, usersClient, queryClient, 'users');

export const users = {
  hooks: {
    list: {
      ...usersHooks.list,
      useQueryWithKey: withKey(utils.list.queryKey, usersHooks.list.useQuery),
    },
    byId: {
      ...usersHooks.byId,
      useQueryWithKey: withKey(utils.byId.queryKey, usersHooks.byId.useQuery),
    },
    // mutations pass through unchanged
    add: usersHooks.add,
  },
  utils,
};

// Re-export utility functions
export { withKey };
