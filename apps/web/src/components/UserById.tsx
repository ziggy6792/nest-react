import { users } from '../api';

export function UserById({ id }: { id: string }) {
  // Use withKey wrapper - full type safety preserved with cleaner syntax
  const args = { params: { id } };
  const q = users.hooks.byId.useQuery(users.utils.byId.queryKey(args), args);

  if (q.isLoading) return <div>Loading...</div>;
  if (q.isError) return <div>Error</div>;

  return <div>{q.data?.body.name}</div>;
}
