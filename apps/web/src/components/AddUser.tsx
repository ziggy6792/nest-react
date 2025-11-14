import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUsersControllerAdd, getUsersControllerListQueryKey } from '../api';

export function AddUser() {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const add = useUsersControllerAdd({
    mutation: {
      onSuccess: () => {
        // Invalidate the list query to refetch
        queryClient.invalidateQueries({ queryKey: getUsersControllerListQueryKey() });
      },
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await add.mutateAsync({ data: { name } });
        setName('');
      }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
      <button type='submit' disabled={add.isPending}>
        Add
      </button>
    </form>
  );
}
