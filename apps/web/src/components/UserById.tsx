import { users, withKey } from '../api';

export function UserById({ id }: { id: string }) {
  // Use withKey wrapper - full type safety preserved with cleaner syntax
  const args = { params: { id } };
  const q = withKey(users.utils.byId.queryKey, users.hooks.byId.useQuery)(args);

  if (q.isLoading) return <div>Loading...</div>;
  if (q.isError) return <div>Error</div>;

  return <div>{q.data?.body.name}</div>;
}
