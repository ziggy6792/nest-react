import { api } from '../api';
import type { UserDetailsDto } from '../api/generated/client.schemas';

export function UsersList() {
  const { data, isLoading, isError } = api.users.findAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <ul>
      {data?.map((u: UserDetailsDto) => (
        <li key={u.id}>
          {u.id} {u.name} {new Date(u.createdAt).toISOString()}
        </li>
      ))}
    </ul>
  );
}
