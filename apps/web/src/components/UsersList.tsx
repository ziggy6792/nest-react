import { useUsersControllerList } from '../api';

export function UsersList() {
  const { data, isLoading, isError } = useUsersControllerList();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <ul>
      {data?.map((u) => (
        <li key={u.id}>
          {u.id} {u.name} {new Date(u.createdAt).toISOString()}
        </li>
      ))}
    </ul>
  );
}
