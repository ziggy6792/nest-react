import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { users } from '../api';

export function AddUser() {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const add = useMutation(
    users.add.mutationOptions({
      onSuccess: () => {
        // Invalidate the list query to refetch
        queryClient.invalidateQueries({ queryKey: users.list.queryKey({ input: {} }) });
      },
    })
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const result = await add.mutateAsync({ body: { name: name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
        console.log(result.foo);
        setName('');
      }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
      <button type='submit' disabled={add.isPending}>
        Add
      </button>
    </form>
  );
}
