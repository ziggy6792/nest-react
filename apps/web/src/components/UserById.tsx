import { api } from "../api";

export function UserById({ id }: { id: string }) {
  const { data, isLoading, isError } = api.users.byId.useQuery(Number(id));

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return <div>{data?.createdAt}</div>;
}
