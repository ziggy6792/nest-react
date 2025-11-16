import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function AddUser() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const queryClient = useQueryClient();

  const add = api.users.create.useMutation({
    mutation: {
      onSuccess: () => {
        // Invalidate the list query to refetch
        queryClient.invalidateQueries({ queryKey: api.users.findAll.queryKey() });
        queryClient.invalidateQueries({ queryKey: api.users.findNames.queryKey() });
      },
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await add.mutateAsync({ data: { firstName, lastName } });
        setFirstName('');
      }}>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='First Name' />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder='Last Name' />
      <button type='submit' disabled={add.isPending}>
        Add
      </button>
    </form>
  );
}
