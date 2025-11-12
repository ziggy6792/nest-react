import { usersHooks, usersClient } from './tsr';
import { users as usersContract } from '@contract/users.contract';
import { createUtils, withKey } from './create-utils';
import { queryClient } from '../query-client';

/**
 * Users API with hooks and auto-generated utils.
 * Hooks are used directly (no wrapping) to preserve full type safety.
 * Utils are auto-generated from router structure - zero manual setup!
 */
export const users = {
  hooks: usersHooks,
  utils: createUtils(usersContract, usersHooks, usersClient, queryClient, 'users'),
};

// Re-export utility functions
export { withKey };
