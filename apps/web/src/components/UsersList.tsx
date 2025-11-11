import { users } from '../api';

export function UsersList() {
  // Use hooks directly - full type safety preserved
  // Query key is auto-generated from router structure
  const q = users.hooks.list.useQuery(users.utils.list.queryKey(), undefined);

  if (q.isLoading) return <div>Loading...</div>;
  if (q.isError) return <div>Error</div>;

  return (
    <ul>
      {q.data?.body.map((u: { id: number; name: string }) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
