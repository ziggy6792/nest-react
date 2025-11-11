import { users } from '../api';

export function UserById({ id }: { id: string }) {
  // Use hooks directly - full type safety preserved
  // Query key is auto-generated from router structure
  const args = { params: { id } };
  const q = users.hooks.byId.useQuery(users.utils.byId.queryKey(args), args);

  if (q.isLoading) return <div>Loading...</div>;
  if (q.isError) return <div>Error</div>;

  return <div>{q.data?.body.name}</div>;
}
