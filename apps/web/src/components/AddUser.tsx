import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePostUsersCreate, getUsersListQueryKey } from '../api';

export function AddUser() {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const add = usePostUsersCreate({
    mutation: {
      onSuccess: () => {
        // Invalidate the list query to refetch
        queryClient.invalidateQueries({ queryKey: getUsersListQueryKey() });
      },
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await add.mutateAsync({ body: { name } });
        setName('');
      }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
      <button type='submit' disabled={add.isPending}>
        Add
      </button>
    </form>
  );
}
