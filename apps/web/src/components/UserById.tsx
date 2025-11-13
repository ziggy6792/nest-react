import { useQuery } from '@tanstack/react-query';
import { users } from '../api';

export function UserById({ id }: { id: string }) {
  const { data, isLoading, isError } = useQuery(
    users.byId.queryOptions({
      input: {
        params: { id },
      },
    })
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return <div>{data?.name}</div>;
}
