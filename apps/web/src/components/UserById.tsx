import { users } from '../api';

export function UserById({ id }: { id: string }) {
  // Hooks automatically inject query keys - cleanest syntax!
  const args = { params: { id } };
  const q = users.hooks.byId.useQueryWithKey(args);

  if (q.isLoading) return <div>Loading...</div>;
  if (q.isError) return <div>Error</div>;

  return <div>{q.data?.body.name}</div>;
}
