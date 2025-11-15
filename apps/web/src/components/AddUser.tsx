import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export function AddUser() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const add = api.users.add.useMutation({
    mutation: {
      onSuccess: () => {
        // Invalidate the list query to refetch
        queryClient.invalidateQueries({ queryKey: api.users.list.queryKey() });
      },
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await add.mutateAsync({ data: { name } });
        setName("");
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <button type="submit" disabled={add.isPending}>
        Add
      </button>
    </form>
  );
}
