import api from 'src/api/api';

export function UserById({ id }: { id: string }) {
  const { data, isLoading, isError } = api.users.findOne.useQuery(Number(id));

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <div>
      {data?.firstName} {data?.lastName} {data?.createdAt}
    </div>
  );
}
