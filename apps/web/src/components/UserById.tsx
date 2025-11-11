import { tsr } from "../api/tsr";

export function UserById({ id }: { id: string }) {
  const q = tsr.byId.useQuery(['user', id], { params: { id } });

  if (q.isLoading) return <div>Loading...</div>;
  if (q.isError) return <div>Error</div>;

  return <div>{q.data?.body.name}</div>;
}

