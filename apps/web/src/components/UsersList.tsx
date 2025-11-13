import { useQuery } from '@tanstack/react-query';
import { users } from '../api';

export function UsersList() {
  const { data, isLoading, isError } = useQuery(
    users.list.queryOptions({
      input: {},
    })
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <ul>
      {data?.map((u) => (
        <li key={u.id}>{u.createdAt.toISOString()}</li>
      ))}
    </ul>
  );
}
