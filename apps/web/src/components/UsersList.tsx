import { tsr } from "../api/tsr";

export function UsersList() {
  const q = tsr.list.useQuery(['users'], undefined);

  if (q.isLoading) return <div>Loading...</div>;
  if (q.isError) return <div>Error</div>;

  return (
    <ul>
      {q.data?.body.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}

