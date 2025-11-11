import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tsr } from "../api/tsr";

export function AddUser() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const add = tsr.add.useMutation({
    onSuccess: () => {
      // Invalidate the list query to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        add.mutate({ body: { name } });
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

