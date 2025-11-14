import { useUsersControllerById } from '../api';

export function UserById({ id }: { id: string }) {
  const { data, isLoading, isError } = useUsersControllerById(Number(id));

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return <div>{data?.createdAt}</div>;
}
